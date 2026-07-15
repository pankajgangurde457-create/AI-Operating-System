import crypto from "crypto";
import { getAIProvider, getEmbeddingProvider } from "../providers/factory";
import { getQdrantClient, MEMORY_COLLECTION, ensureCollectionsInitialized } from "../qdrant/qdrant-client";
import { ChatMessage } from "../providers/AIProvider";
import { getSupabaseAdmin } from "../../supabase/admin";

export interface LongTermMemory {
  text: string;
  score?: number;
}

/**
 * Retrieves the last N messages from a conversation in chronological order (Short-term memory)
 */
export async function getShortTermMemory(conversationId: string, limit = 10): Promise<ChatMessage[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to fetch short term memory:", error);
      return [];
    }

    // Reverse to chronological order (system/user/assistant sequence)
    return data.reverse().map((m: any) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));
  } catch (err) {
    console.error("Short term memory retrieval error:", err);
    return [];
  }
}

/**
 * Performs a vector search in Qdrant to find relevant distilled long-term facts
 */
export async function getLongTermMemories(query: string, userId: string, limit = 3): Promise<LongTermMemory[]> {
  try {
    await ensureCollectionsInitialized();
    const qdrant = getQdrantClient();
    const embeddingProvider = getEmbeddingProvider();

    const queryVector = await embeddingProvider.embedQuery(query);

    const results = await qdrant.search(MEMORY_COLLECTION, {
      vector: queryVector,
      filter: {
        must: [
          { key: "user_id", match: { value: userId } }
        ]
      },
      limit: limit,
      with_payload: true,
    });

    return results.map(point => ({
      text: (point.payload?.memory_text as string) || "",
      score: point.score,
    }));
  } catch (err) {
    console.error("Long term memory search error:", err);
    return [];
  }
}

/**
 * Summarizes the session, extracts atomic user facts, deduplicates them against
 * existing long-term facts using vector similarity, and saves new ones.
 */
export async function distillSessionMemory(conversationId: string, userId: string): Promise<string[]> {
  try {
    // 1. Retrieve the full conversation history
    const { data: messages, error } = await getSupabaseAdmin()
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error || !messages || messages.length === 0) {
      return [];
    }

    const conversationText = messages
      .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    // 2. Use a cheap model call to extract atomic user facts
    const aiProvider = getAIProvider();
    const extractionPrompt = `You are a memory synthesis engine.
Analyze the following conversation between a USER and an ASSISTANT.
Extract key atomic facts about the USER (e.g. their preferences, projects, goals, software stack, constraints, or recurring topics they discussed).
Do NOT extract facts about the assistant or general knowledge. Keep each fact concise, atomic, and objective.

Respond ONLY with a JSON object containing an array of facts:
{
  "facts": ["Fact 1", "Fact 2", ...]
}

Conversation:
${conversationText}`;

    const response = await aiProvider.chat(
      [
        { role: "system", content: "You extract personal facts and preferences about the user and output structured JSON." },
        { role: "user", content: extractionPrompt }
      ],
      { responseFormat: { type: "json_object" }, temperature: 0.2 }
    );

    const parsed = JSON.parse(response.text);
    const extractedFacts: string[] = parsed.facts || [];

    if (extractedFacts.length === 0) {
      return [];
    }

    await ensureCollectionsInitialized();
    const qdrant = getQdrantClient();
    const embeddingProvider = getEmbeddingProvider();
    const newlyStoredFacts: string[] = [];

    // 3. Deduplicate and store each fact
    for (const fact of extractedFacts) {
      if (!fact.trim()) continue;

      const factVector = await embeddingProvider.embedQuery(fact);

      // Search if a near-identical fact already exists
      const duplicates = await qdrant.search(MEMORY_COLLECTION, {
        vector: factVector,
        filter: {
          must: [{ key: "user_id", match: { value: userId } }]
        },
        limit: 1,
      });

      // Deduplication threshold: Cosine similarity of 0.85
      const isDuplicate = duplicates.length > 0 && duplicates[0].score > 0.85;

      if (!isDuplicate) {
        // Upsert new long term memory fact
        await qdrant.upsert(MEMORY_COLLECTION, {
          wait: true,
          points: [
            {
              id: crypto.randomUUID(),
              vector: factVector,
              payload: {
                user_id: userId,
                memory_text: fact,
                created_at: new Date().toISOString(),
              }
            }
          ]
        });

        // Log synthesis event to Supabase
        await getSupabaseAdmin().from("memory_events").insert({
          user_id: userId,
          title: "Memory Synthesized",
          description: `Synthesized long-term fact: "${fact}"`,
          event_type: "synthesis",
        });

        newlyStoredFacts.push(fact);
      }
    }

    return newlyStoredFacts;
  } catch (err) {
    console.error("Error distilling session memory:", err);
    return [];
  }
}
