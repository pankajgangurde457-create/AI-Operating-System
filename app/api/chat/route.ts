import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/providers/factory";
import { retrieve, Citation } from "@/lib/ai/retrieval/rag-retriever";
import { getShortTermMemory, getLongTermMemories, distillSessionMemory } from "@/lib/ai/memory/memory-manager";
import { ChatMessage } from "@/lib/ai/providers/AIProvider";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const CHARACTER_BUDGET = 24000; // ~6000 tokens (4 chars/token) for prompt safety

/**
 * Helper to build the system prompt with memory and RAG context
 */
function buildSystemPrompt(memories: string[], contextChunks: string[]): string {
  const memoriesSection = memories.length > 0
    ? `Retrieved Memories/Preferences about the User:\n${memories.map(m => `- ${m}`).join("\n")}`
    : "Retrieved Memories/Preferences: None available.";

  const contextSection = contextChunks.length > 0
    ? `Retrieved Context from User Documents:\n${contextChunks.join("\n\n")}`
    : "Retrieved Context: No relevant document context found.";

  return `You are the AI Operating System (Personal Knowledge OS). 
Answer the user's question based on the retrieved context from their documents and their personal preferences/memories.
Ground your answers strictly in the provided context and memories. If you don't know the answer or if it's not present, state clearly that you don't know based on the retrieved files. Do not hallucinate external facts.

Always cite the sources you use inline using bracket notations, e.g., "The user is working on project alpha [Source 1]."

${memoriesSection}

${contextSection}`;
}

/**
 * Formats a chunk for prompt grounding
 */
function formatChunkForGrounding(c: Citation, index: number): string {
  return `[Source ${index}]: "${c.text}" (Source: ${c.fileName} - ${c.pageOrTimestamp})`;
}

/**
 * Budget-aware prompt builder. Truncates lowest-relevance chunks (last ones in the array)
 * if the total prompt size exceeds the character budget.
 */
export function buildPromptAndCitations(
  systemInstructions: string,
  memories: string[],
  chunks: Citation[],
  history: ChatMessage[],
  newQuery: string
): { messages: ChatMessage[]; activeCitations: Citation[] } {
  let activeChunks = [...chunks];
  
  while (activeChunks.length > 0) {
    const formattedChunks = activeChunks.map((c, i) => formatChunkForGrounding(c, i + 1));
    const systemPrompt = buildSystemPrompt(memories, formattedChunks);
    
    // Calculate total character size of all prompt components
    const totalSize = 
      systemPrompt.length + 
      history.reduce((acc, h) => acc + h.content.length, 0) + 
      newQuery.length;

    if (totalSize <= CHARACTER_BUDGET || activeChunks.length === 1) {
      // Prompt fits the budget, or we can't truncate any further
      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: newQuery }
      ];
      return { messages, activeCitations: activeChunks };
    }

    // Over budget: truncate the least relevant chunk (last chunk in the retrieval list)
    activeChunks.pop();
  }

  // Fallback if no chunks can be used
  const systemPrompt = buildSystemPrompt(memories, []);
  return {
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: newQuery }
    ],
    activeCitations: []
  };
}

/**
 * Chat endpoint handling retrieval, short/long-term memory, token budgeting,
 * response streaming, and database persistence.
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate user from session
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please authenticate first." }, { status: 401 });
    }

    const userId = user.id;

    // 2. Parse request body
    const body = await req.json();
    const { message, conversationId, stream: requestStream } = body;

    if (!message) {
      return NextResponse.json({ error: "Missing required parameter: message" }, { status: 400 });
    }

    // Determine or create active conversation
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const { data: conv, error: convErr } = await getSupabaseAdmin()
        .from("conversations")
        .insert({ user_id: userId, title: message.substring(0, 40) })
        .select("id")
        .single();
      
      if (convErr || !conv) {
        throw new Error(`Failed to initialize conversation: ${convErr?.message}`);
      }
      activeConversationId = conv.id;
    }

    // 3. Retrieve knowledge chunks (RAG)
    const retrievedChunks = await retrieve(message, userId, undefined, 5);

    // 4. Retrieve relevant long-term memories
    const relevantMemories = await getLongTermMemories(message, userId, 3);
    const memoriesList = relevantMemories.map(m => m.text);

    // 5. Retrieve short-term chat history (last 8 turns)
    const rawHistory = body.history || [];
    let shortTermHistory: ChatMessage[] = [];
    if (rawHistory.length > 0) {
      shortTermHistory = rawHistory.map((h: any) => ({
        role: h.role === "ai" ? "assistant" : h.role,
        content: h.content,
      }));
    } else {
      shortTermHistory = await getShortTermMemory(activeConversationId, 8);
    }

    // 6. Construct prompt with token budgeting
    const { messages: promptMessages, activeCitations } = buildPromptAndCitations(
      "", // System instructions are generated inside buildPromptAndCitations
      memoriesList,
      retrievedChunks,
      shortTermHistory,
      message
    );

    const isStreamingRequested = requestStream === true;

    if (isStreamingRequested) {
      // Initialize streaming response using line-delimited JSON
      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
        async start(controller) {
          // First chunk sends metadata (conversationId and citations)
          const metadataChunk = {
            type: "metadata",
            conversationId: activeConversationId,
            citations: activeCitations.map((c, i) => ({
              sourceIndex: i + 1,
              fileName: c.fileName,
              pageOrTimestamp: c.pageOrTimestamp,
              contentSnippet: c.text.substring(0, 100) + "...",
            })),
          };
          controller.enqueue(encoder.encode(JSON.stringify(metadataChunk) + "\n"));

          // Call the AI provider streaming endpoint
          const aiProvider = getAIProvider() as any;
          let accumulatedText = "";

          try {
            const stream = await aiProvider.chatStream(promptMessages, { temperature: 0.3 });
            
            for await (const chunk of stream) {
              accumulatedText += chunk;
              const textChunk = {
                type: "text",
                content: chunk,
              };
              controller.enqueue(encoder.encode(JSON.stringify(textChunk) + "\n"));
            }

            // Write messages to database
            // Insert User message
            await getSupabaseAdmin().from("messages").insert({
              conversation_id: activeConversationId,
              role: "user",
              content: message,
            });

            // Insert Assistant message with citations
            await getSupabaseAdmin().from("messages").insert({
              conversation_id: activeConversationId,
              role: "assistant",
              content: accumulatedText,
              citations: activeCitations.map(c => ({
                fileName: c.fileName,
                chunkIndex: c.chunkIndex,
                pageOrTimestamp: c.pageOrTimestamp,
                contentSnippet: c.text.substring(0, 100) + "...",
              })),
            });

            // Trigger long-term memory synthesis asynchronously in the background
            distillSessionMemory(activeConversationId, userId).catch(err => {
              console.error(`[Background Memory Distill Error] Conv ID ${activeConversationId}:`, err);
            });

            const doneChunk = { type: "done" };
            controller.enqueue(encoder.encode(JSON.stringify(doneChunk) + "\n"));
            controller.close();
          } catch (streamErr: any) {
            console.error("Streaming error during chat:", streamErr);
            const errorChunk = { type: "error", message: streamErr?.message || "Streaming failed" };
            controller.enqueue(encoder.encode(JSON.stringify(errorChunk) + "\n"));
            controller.close();
          }
        },
      });

      return new Response(customStream, {
        headers: {
          "Content-Type": "application/x-ndjson",
          "Transfer-Encoding": "chunked",
        },
      });
    } else {
      // Non-streaming JSON response (Default/Fallback for frontend client compatibility)
      const aiProvider = getAIProvider();
      const chatResponse = await aiProvider.chat(promptMessages, { temperature: 0.3 });
      const answer = chatResponse.text;

      // Write messages to database
      // Insert User message
      await getSupabaseAdmin().from("messages").insert({
        conversation_id: activeConversationId,
        role: "user",
        content: message,
      });

      // Insert Assistant message with citations
      await getSupabaseAdmin().from("messages").insert({
        conversation_id: activeConversationId,
        role: "assistant",
        content: answer,
        citations: activeCitations.map(c => ({
          fileName: c.fileName,
          chunkIndex: c.chunkIndex,
          pageOrTimestamp: c.pageOrTimestamp,
          contentSnippet: c.text.substring(0, 100) + "...",
        })),
      });

      // Trigger long-term memory synthesis asynchronously in the background
      distillSessionMemory(activeConversationId, userId).catch(err => {
        console.error(`[Background Memory Distill Error] Conv ID ${activeConversationId}:`, err);
      });

      return NextResponse.json({
        answer,
        citations: activeCitations.map((c, i) => ({
          sourceIndex: i + 1,
          fileName: c.fileName,
          pageOrTimestamp: c.pageOrTimestamp,
          contentSnippet: c.text.substring(0, 100) + "...",
        })),
        conversationId: activeConversationId
      });
    }

  } catch (error: any) {
    console.error("Chat route API error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
