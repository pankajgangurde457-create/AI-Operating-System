import { getAIProvider } from "../providers/factory";
import { getQdrantClient, KNOWLEDGE_COLLECTION } from "../qdrant/qdrant-client";
import { getSupabaseAdmin } from "../../supabase/admin";

export interface DocumentSummary {
  abstract: string;
  keyPoints: string[];
  entities: string[];
}

/**
 * Summarizes a document using a Map-Reduce strategy for cost-efficiency and context window protection.
 * Caches the result in Supabase.
 */
export async function summarizeDocument(fileId: string): Promise<DocumentSummary> {
  // 1. Check Supabase cache first
  const { data: fileRecord, error: fileError } = await getSupabaseAdmin()
    .from("files")
    .select("summary")
    .eq("id", fileId)
    .maybeSingle();

  if (!fileError && fileRecord?.summary) {
    console.log(`[Summarizer] Cache hit for file ${fileId}`);
    return fileRecord.summary as DocumentSummary;
  }

  console.log(`[Summarizer] Cache miss for file ${fileId}. Initiating summarization...`);

  // 2. Fetch all chunks from Qdrant
  const qdrant = getQdrantClient();
  const response = await qdrant.scroll(KNOWLEDGE_COLLECTION, {
    filter: {
      must: [
        { key: "file_id", match: { value: fileId } }
      ]
    },
    limit: 100, // Max 100 chunks for standard documents
    with_payload: true,
  });

  const points = response.points;
  if (points.length === 0) {
    throw new Error("No document content found in the vector database to summarize.");
  }

  // Sort chunks by index to preserve reading order
  points.sort((a, b) => {
    const idxA = (a.payload?.chunk_index as number) || 0;
    const idxB = (b.payload?.chunk_index as number) || 0;
    return idxA - idxB;
  });

  const chunks = points.map(p => (p.payload?.text as string) || "");
  const aiProvider = getAIProvider();

  let finalSummary: DocumentSummary;

  // 3. Map-Reduce Execution
  if (chunks.length <= 3) {
    // If the document is small, summarize it in a single step (Direct Reduce)
    const combinedText = chunks.join("\n\n");
    finalSummary = await executeReduce(combinedText, aiProvider);
  } else {
    // Map stage: Summarize in batches of 3 chunks to limit model calls and context size
    const intermediateSummaries: string[] = [];
    const batchSize = 3;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize).join("\n\n");
      
      const mapPrompt = `Synthesize the key facts and arguments of the following document excerpt into a concise paragraph:
      
${batch}`;

      const mapResponse = await aiProvider.chat([
        { role: "system", content: "You are a concise document analyzer." },
        { role: "user", content: mapPrompt }
      ], { temperature: 0.2 });

      intermediateSummaries.push(mapResponse.text);
    }

    // Reduce stage: Synthesize intermediate summaries
    const combinedIntermediate = intermediateSummaries.join("\n\n");
    finalSummary = await executeReduce(combinedIntermediate, aiProvider);
  }

  // 4. Cache the result in Supabase
  await getSupabaseAdmin()
    .from("files")
    .update({ summary: finalSummary })
    .eq("id", fileId);

  return finalSummary;
}

/**
 * Runs the reduce step to synthesize text into a structured DocumentSummary object
 */
async function executeReduce(text: string, aiProvider: any): Promise<DocumentSummary> {
  const reducePrompt = `You are an expert document summarization engine.
Synthesize the following text into a highly structured document summary.
Your response MUST be a valid JSON object matching the exact schema below.

JSON Schema:
{
  "abstract": "A 2-3 sentence high-level overview of the entire document.",
  "keyPoints": [
    "First main point or key takeaway",
    "Second main point or key takeaway",
    "..."
  ],
  "entities": [
    "Key topic, organization, concept, person, or technology",
    "..."
  ]
}

Text to summarize:
${text}`;

  const response = await aiProvider.chat([
    { role: "system", content: "You output structured JSON summaries from document snippets." },
    { role: "user", content: reducePrompt }
  ], {
    responseFormat: { type: "json_object" },
    temperature: 0.2,
  });

  try {
    const parsed = JSON.parse(response.text);
    return {
      abstract: parsed.abstract || "",
      keyPoints: parsed.keyPoints || [],
      entities: parsed.entities || [],
    };
  } catch (err) {
    console.error("Failed to parse reduce summarization response, raw response:", response.text);
    return {
      abstract: "Failed to generate structured summary.",
      keyPoints: [],
      entities: [],
    };
  }
}
