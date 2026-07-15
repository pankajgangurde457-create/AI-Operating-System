import crypto from "crypto";
import { getAIProvider, getEmbeddingProvider } from "../providers/factory";
import { getQdrantClient, KNOWLEDGE_COLLECTION, ensureCollectionsInitialized } from "../qdrant/qdrant-client";
import { chunkDocumentBlocks, InputDocumentBlock } from "./chunker";
import { parsePdfWithPages } from "./pdf-helper"; // Separated to keep imports tidy
import { getSupabaseAdmin } from "../../supabase/admin";

export interface IngestionJob {
  fileId: string;
  userId: string;
  storagePath: string;
  mimeType: string;
  fileName: string;
}

/**
 * MD5 hash helper for caching embeddings
 */
function getChunkHash(text: string, providerName: string): string {
  return crypto.createHash("md5").update(`${providerName}:${text}`).digest("hex");
}

/**
 * Attempts to retrieve an embedding from the Supabase cache
 */
async function getCachedEmbedding(hash: string): Promise<number[] | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("embedding_cache")
      .select("embedding")
      .eq("hash", hash)
      .maybeSingle();

    if (error) {
      console.warn("Embedding cache read failed (skipping cache):", error.message);
      return null;
    }
    return data?.embedding || null;
  } catch (err) {
    return null;
  }
}

/**
 * Stores an embedding in the Supabase cache
 */
async function cacheEmbedding(hash: string, embedding: number[]) {
  try {
    await getSupabaseAdmin()
      .from("embedding_cache")
      .upsert({ hash, embedding });
  } catch (err) {
    console.warn("Failed to write to embedding cache:", err);
  }
}

/**
 * Orchestrates the ingestion of a single file.
 * Downloads from Supabase storage, parses by type, chunks, embeds (with cache checks),
 * and upserts the vector points to Qdrant, writing status back to Supabase throughout.
 */
export async function runIngestionPipeline(job: IngestionJob): Promise<void> {
  const { fileId, userId, storagePath, mimeType, fileName } = job;
  
  const updateStatus = async (status: "processing" | "completed" | "failed", message: string) => {
    console.log(`[File Ingestion Job ${fileId}] Status: ${status} - ${message}`);
    await getSupabaseAdmin()
      .from("files")
      .update({ status, status_message: message })
      .eq("id", fileId);
  };

  try {
    await updateStatus("processing", "Downloading file from Supabase Storage...");
    
    // 1. Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await getSupabaseAdmin()
      .storage
      .from("knowledge_base")
      .download(storagePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file from Storage: ${downloadError?.message || "No data returned"}`);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    await updateStatus("processing", "Parsing file contents...");

    const aiProvider = getAIProvider();
    let blocks: InputDocumentBlock[] = [];

    // 2. Route parsing by mime type
    if (mimeType === "application/pdf") {
      blocks = await parsePdfWithPages(buffer);
    } 
    else if (mimeType.startsWith("image/")) {
      await updateStatus("processing", "Analyzing image with vision model (OCR & Description)...");
      const analysis = await aiProvider.analyzeImage(buffer, mimeType);
      
      if (analysis.text.trim()) {
        blocks.push({ text: analysis.text, pageOrTimestamp: "Image OCR Text" });
      }
      if (analysis.description.trim()) {
        blocks.push({ text: analysis.description, pageOrTimestamp: "Image Visual Description" });
      }
    } 
    else if (mimeType.startsWith("audio/") || mimeType.startsWith("video/")) {
      await updateStatus("processing", "Transcribing audio/video with Whisper...");
      // For Whisper, use a safe filename fallback
      const extension = mimeType.split("/")[1] || "mp3";
      const tempFilename = `input_${fileId}.${extension}`;
      const transcription = await aiProvider.transcribe(buffer, tempFilename);
      
      blocks.push({ text: transcription.text, pageOrTimestamp: "Audio Transcript" });
    } 
    else {
      // Default plain text fallback
      const text = buffer.toString("utf-8");
      blocks.push({ text, pageOrTimestamp: "Document Text" });
    }

    if (blocks.length === 0) {
      throw new Error("No text content could be extracted from the file.");
    }

    // 3. Split content into semantic chunks
    await updateStatus("processing", "Splitting text into semantic chunks...");
    const chunks = await chunkDocumentBlocks(blocks);

    // 4. Generate embeddings (using cache where possible)
    await updateStatus("processing", `Generating embeddings for ${chunks.length} chunks...`);
    const embeddingProvider = getEmbeddingProvider();
    const embeddings: number[][] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const hash = getChunkHash(chunk.text, embeddingProvider.name);
      
      // Check cache first
      let embedding = await getCachedEmbedding(hash);
      if (!embedding) {
        // Cache miss: generate embedding
        embedding = await embeddingProvider.embedQuery(chunk.text);
        await cacheEmbedding(hash, embedding);
      }
      embeddings.push(embedding);
    }

    // 5. Upsert to Qdrant
    await updateStatus("processing", "Uploading vectors to Qdrant vector database...");
    await ensureCollectionsInitialized();
    const qdrant = getQdrantClient();
    
    // Qdrant upsert payload
    const points = chunks.map((chunk, i) => ({
      id: crypto.randomUUID(),
      vector: embeddings[i],
      payload: {
        user_id: userId,
        file_id: fileId,
        file_name: fileName,
        chunk_index: chunk.chunkIndex,
        source_type: mimeType,
        page_or_timestamp: chunk.pageOrTimestamp,
        text: chunk.text,
      },
    }));

    await qdrant.upsert(KNOWLEDGE_COLLECTION, {
      wait: true,
      points: points,
    });

    // 6. Log a success memory event
    await getSupabaseAdmin().from("memory_events").insert({
      user_id: userId,
      title: `File Ingested: ${fileName}`,
      description: `Successfully indexed ${chunks.length} chunks from "${fileName}".`,
      event_type: "ingestion",
    });

    await updateStatus("completed", `Ingestion complete. Generated ${chunks.length} chunks.`);
  } catch (err: any) {
    const errMsg = err?.message || "Unknown error occurred";
    await updateStatus("failed", `Ingestion failed: ${errMsg}`);
    throw err;
  }
}
