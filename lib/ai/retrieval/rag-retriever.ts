import { getEmbeddingProvider, getAIProvider } from "../providers/factory";
import { getQdrantClient, KNOWLEDGE_COLLECTION } from "../qdrant/qdrant-client";

export interface RetrievalFilters {
  fileId?: string;
  sourceType?: string;
}

export interface Citation {
  fileId: string;
  fileName: string;
  chunkIndex: number;
  sourceType: string;
  pageOrTimestamp: string;
  text: string;
}

export interface RetrievalResult extends Citation {
  score: number;
}

/**
 * Basic stopwords list for keyword search boosting
 */
const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", "as", "at", 
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant", "cannot", "could", 
  "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during", "each", "few", "for", "from", "further", 
  "had", "hadnt", "has", "hasnt", "have", "havent", "having", "he", "her", "here", "hers", "herself", "him", "himself", 
  "his", "how", "i", "if", "in", "into", "is", "isnt", "it", "its", "itself", "more", "most", "mustnt", "my", "myself", 
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", 
  "same", "shant", "she", "should", "shouldnt", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", 
  "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", 
  "was", "wasnt", "we", "were", "werent", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "wont", 
  "would", "wouldnt", "you", "your", "yours", "yourself", "yourselves"
]);

/**
 * Tokenizes a string into lowercased terms, excluding common English stopwords
 */
function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(term => term.length > 1 && !STOPWORDS.has(term));
}

/**
 * Computes a simple term frequency score for keyword matching
 */
function computeKeywordScore(text: string, queryTerms: string[]): number {
  if (queryTerms.length === 0) return 0;
  
  const textLower = text.toLowerCase();
  let matches = 0;
  
  for (const term of queryTerms) {
    // Count occurrences of term in text
    let index = textLower.indexOf(term);
    while (index !== -1) {
      matches++;
      index = textLower.indexOf(term, index + term.length);
    }
  }
  
  // Normalize matches by chunk length to prevent favoring exceptionally long chunks
  return matches / (textLower.split(/\s+/).length || 1);
}

/**
 * Performs a hybrid search (Qdrant vector + client-side keyword matching)
 * followed by a cheap LLM-based re-ranking step.
 */
export async function retrieve(
  query: string,
  userId: string,
  filters?: RetrievalFilters,
  topK = 5
): Promise<RetrievalResult[]> {
  const qdrant = getQdrantClient();
  const embeddingProvider = getEmbeddingProvider();

  // 1. Embed query
  const queryVector = await embeddingProvider.embedQuery(query);

  // 2. Build filters for multi-tenancy and other criteria
  const mustFilters: any[] = [
    { key: "user_id", match: { value: userId } }
  ];

  if (filters?.fileId) {
    mustFilters.push({ key: "file_id", match: { value: filters.fileId } });
  }
  if (filters?.sourceType) {
    mustFilters.push({ key: "source_type", match: { value: filters.sourceType } });
  }

  // 3. Search Qdrant for top 20 candidates
  const qdrantResults = await qdrant.search(KNOWLEDGE_COLLECTION, {
    vector: queryVector,
    filter: {
      must: mustFilters
    },
    limit: 20,
    with_payload: true,
  });

  if (qdrantResults.length === 0) {
    return [];
  }

  // 4. Apply Hybrid keyword boosting
  const queryTerms = tokenizeQuery(query);
  const candidates = qdrantResults.map(point => {
    const payload = point.payload || {};
    const text = (payload.text as string) || "";
    const vectorScore = point.score; // Cosine similarity typically 0-1
    const keywordScore = computeKeywordScore(text, queryTerms);
    
    // Combined score: Vector cosine + keyword weight (0.3 factor)
    const hybridScore = vectorScore + (keywordScore * 0.3);

    return {
      fileId: (payload.file_id as string) || "",
      fileName: (payload.file_name as string) || "",
      chunkIndex: (payload.chunk_index as number) || 0,
      sourceType: (payload.source_type as string) || "",
      pageOrTimestamp: (payload.page_or_timestamp as string) || "",
      text: text,
      score: hybridScore,
    };
  });

  // Sort by hybrid score descending
  candidates.sort((a, b) => b.score - a.score);

  // 5. Cheap LLM re-ranking (taking top 10 hybrid results and selecting/ranking topK)
  const rankingCandidates = candidates.slice(0, 10);
  const aiProvider = getAIProvider();

  try {
    const reRankPrompt = `You are a Search Relevance Ranker.
Your task is to score the relevance of the following retrieved text chunks to the query: "${query}"

For each chunk, assign a relevance score between 0 (completely irrelevant) and 10 (extremely relevant).
Respond ONLY with a valid JSON object containing an array of scores in the exact order of the chunks listed:
{
  "scores": [number, number, ...]
}

Chunks to score:
${rankingCandidates.map((c, i) => `[Chunk ${i}]: "${c.text.substring(0, 250)}..."`).join("\n\n")}`;

    const rankingResponse = await aiProvider.chat(
      [
        { role: "system", content: "You are a precise search scoring system that outputs raw JSON matching the requested schema." },
        { role: "user", content: reRankPrompt }
      ],
      { responseFormat: { type: "json_object" }, temperature: 0.1 }
    );

    const parsed = JSON.parse(rankingResponse.text);
    const scores: number[] = parsed.scores;

    if (Array.isArray(scores) && scores.length === rankingCandidates.length) {
      // Map back and sort by LLM scores
      const reRanked = rankingCandidates.map((candidate, idx) => ({
        ...candidate,
        score: scores[idx] // Override score with LLM relevance score
      }));
      reRanked.sort((a, b) => b.score - a.score);
      return reRanked.slice(0, topK);
    }
  } catch (err) {
    console.warn("LLM Re-ranking failed, falling back to hybrid vector+keyword scores:", err);
  }

  // Fallback to topK hybrid-scored candidates
  return candidates.slice(0, topK);
}

export interface SearchResult extends Citation {
  score: number;
  highlightedSnippet: string;
}

/**
 * Helper to highlight matching terms in text and return a window around the first match
 */
export function highlightSnippet(text: string, query: string): string {
  const terms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));

  if (terms.length === 0) {
    return text.substring(0, 200) + "...";
  }

  // Find the position of the first term match
  let earliestMatchIdx = -1;
  const textLower = text.toLowerCase();

  for (const term of terms) {
    const idx = textLower.indexOf(term);
    if (idx !== -1 && (earliestMatchIdx === -1 || idx < earliestMatchIdx)) {
      earliestMatchIdx = idx;
    }
  }

  if (earliestMatchIdx === -1) {
    return text.substring(0, 200) + "...";
  }

  // Create snippet boundary (around 80 chars before and 120 chars after)
  const start = Math.max(0, earliestMatchIdx - 80);
  const end = Math.min(text.length, earliestMatchIdx + 120);
  let snippet = text.substring(start, end);

  // Apply markup highlighting
  for (const term of terms) {
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b(${escapedTerm})\\b`, "gi");
    snippet = snippet.replace(regex, "<mark>$1</mark>");
  }

  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  return snippet;
}

/**
 * Searches across all chunks for a search UI (returns metadata + highlighted snippet + relevance score).
 */
export async function semanticSearch(
  query: string,
  userId: string,
  filters?: RetrievalFilters,
  limit = 10
): Promise<SearchResult[]> {
  // Uses the same core retrieval logic (which embeds, applies hybrid boosting & LLM re-ranking)
  const retrieved = await retrieve(query, userId, filters, limit);

  return retrieved.map(r => ({
    fileId: r.fileId,
    fileName: r.fileName,
    chunkIndex: r.chunkIndex,
    sourceType: r.sourceType,
    pageOrTimestamp: r.pageOrTimestamp,
    text: r.text,
    score: r.score,
    highlightedSnippet: highlightSnippet(r.text, query),
  }));
}

