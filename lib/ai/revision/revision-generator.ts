import { getAIProvider } from "../providers/factory";
import { getQdrantClient, KNOWLEDGE_COLLECTION } from "../qdrant/qdrant-client";
import { retrieve } from "../retrieval/rag-retriever";
import { getSupabaseAdmin } from "../../supabase/admin";

export interface Flashcard {
  question: string;
  answer: string;
  citations: string[]; // e.g., ["lecture1.pdf - Page 3"]
}

export interface RevisionNotesResponse {
  notes: string; // Markdown study notes
  flashcards: Flashcard[];
}

/**
 * Generates study notes and Q&A flashcards grounded strictly in retrieved content.
 * Supports running either against a specific fileId (with caching) or a general topic search.
 */
export async function generateRevisionNotes(
  userId: string,
  target: { fileId: string } | { topic: string }
): Promise<RevisionNotesResponse> {
  const aiProvider = getAIProvider();
  let chunksForGrounding: { text: string; fileName: string; pageOrTimestamp: string }[] = [];

  const isFileTarget = "fileId" in target;

  // 1. If targeting a specific file, check cache first
  if (isFileTarget) {
    const fileId = target.fileId;
    const { data: fileRecord, error: fileError } = await getSupabaseAdmin()
      .from("files")
      .select("revision_notes")
      .eq("id", fileId)
      .maybeSingle();

    if (!fileError && fileRecord?.revision_notes) {
      console.log(`[Revision Notes] Cache hit for fileId: ${fileId}`);
      return fileRecord.revision_notes as RevisionNotesResponse;
    }

    // Scroll all chunks for this file from Qdrant
    console.log(`[Revision Notes] Cache miss for fileId: ${fileId}. Loading chunks...`);
    const qdrant = getQdrantClient();
    const response = await qdrant.scroll(KNOWLEDGE_COLLECTION, {
      filter: {
        must: [{ key: "file_id", match: { value: fileId } }]
      },
      limit: 100,
      with_payload: true,
    });

    // Sort by chunk index
    const sortedPoints = response.points.sort((a, b) => {
      const idxA = (a.payload?.chunk_index as number) || 0;
      const idxB = (b.payload?.chunk_index as number) || 0;
      return idxA - idxB;
    });

    chunksForGrounding = sortedPoints.map(p => ({
      text: (p.payload?.text as string) || "",
      fileName: (p.payload?.file_name as string) || "",
      pageOrTimestamp: (p.payload?.page_or_timestamp as string) || "",
    }));
  } 
  else {
    // General topic-based study notes generation: retrieve top 10 relevant chunks
    const topic = target.topic;
    console.log(`[Revision Notes] Generating notes for search topic: "${topic}"...`);
    const retrievalResults = await retrieve(topic, userId, undefined, 10);
    chunksForGrounding = retrievalResults.map(r => ({
      text: r.text,
      fileName: r.fileName,
      pageOrTimestamp: r.pageOrTimestamp,
    }));
  }

  if (chunksForGrounding.length === 0) {
    throw new Error("No source content available to generate revision notes.");
  }

  // 2. Build grounding context and LLM prompt
  const chunksPrompt = chunksForGrounding
    .map((c, i) => `[Source ${i + 1}]: "${c.text}" (Source: ${c.fileName} - ${c.pageOrTimestamp})`)
    .join("\n\n");

  const prompt = `You are a professional study helper.
Generate structured study/revision notes based ONLY on the source chunks provided below.
The response MUST be a valid JSON object matching the requested schema.

Instructions:
1. Do not hallucinate or use any information outside of the provided sources. If a fact cannot be found in the sources, do not mention it.
2. In the "notes" field, structure the study guide using headings, bullet points, and definitions. Cite sources inline using bracket notation, e.g., "The mitochondrion is the powerhouse of the cell [Source 1]."
3. In the "flashcards" field, generate at least 3 flashcard-style question-and-answer pairs. For each flashcard, list the source files and pages used in the "citations" field.

JSON Schema:
{
  "notes": "structured markdown content",
  "flashcards": [
    {
      "question": "...",
      "answer": "...",
      "citations": ["fileName - pageOrTimestamp", ...]
    }
  ]
}

Source Chunks:
${chunksPrompt}`;

  // 3. Generate response using cheaper model (gpt-4o-mini / gemini-1.5-flash)
  const response = await aiProvider.chat(
    [
      { role: "system", content: "You output structured study notes and flashcards in JSON format, strictly grounded in the user's files." },
      { role: "user", content: prompt }
    ],
    { responseFormat: { type: "json_object" }, temperature: 0.2 }
  );

  let finalResponse: RevisionNotesResponse;
  try {
    const parsed = JSON.parse(response.text);
    finalResponse = {
      notes: parsed.notes || "No notes generated.",
      flashcards: parsed.flashcards || [],
    };
  } catch (err) {
    console.error("Failed to parse revision notes response. Raw response:", response.text);
    finalResponse = {
      notes: "Failed to generate structured revision notes.",
      flashcards: [],
    };
  }

  // 4. Cache if targeting a specific file
  if (isFileTarget) {
    const fileId = target.fileId;
    await getSupabaseAdmin()
      .from("files")
      .update({ revision_notes: finalResponse })
      .eq("id", fileId);
  }

  return finalResponse;
}
