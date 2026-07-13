import { retrieve, Citation } from "./rag-retriever";
import { getAIProvider } from "../providers/factory";

export interface QAResponse {
  answer: string;
  sources: Citation[];
}

/**
 * Single-turn question answering using RAG retrieval.
 * Uses a strict system prompt to minimize hallucinations (answers only from context, otherwise says "I don't know").
 * Returns the answer along with the exact source citations used.
 */
export async function answerQuestion(query: string, userId: string): Promise<QAResponse> {
  // 1. Retrieve the top 5 most relevant chunks
  const sources = await retrieve(query, userId, undefined, 5);

  // 2. Construct a strict factual prompt with zero temperature
  const contextText = sources.length > 0
    ? sources.map((s, i) => `[Source ${i + 1}]: "${s.text}" (Source: ${s.fileName} - ${s.pageOrTimestamp})`).join("\n\n")
    : "No relevant sources found.";

  const systemInstructions = `You are a strict Question Answering assistant.
Your task is to answer the user's query based ONLY on the provided context below.
If the context does not contain the answer, you must respond exactly with: "I do not know the answer based on the provided files."
Do not attempt to extrapolate or use any external knowledge. Stay completely objective and factual.

Context:
${contextText}`;

  const aiProvider = getAIProvider();
  
  const response = await aiProvider.chat(
    [
      { role: "system", content: systemInstructions },
      { role: "user", content: query }
    ],
    { temperature: 0.0 } // Zero temperature for maximum deterministic factuality
  );

  return {
    answer: response.text.trim(),
    sources,
  };
}
