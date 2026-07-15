import { QdrantClient } from "@qdrant/js-client-rest";
import { getEmbeddingProvider } from "../providers/factory";

let clientInstance: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (!clientInstance) {
    const url = process.env.QDRANT_URL || "http://localhost:6333";
    const apiKey = process.env.QDRANT_API_KEY || undefined;
    clientInstance = new QdrantClient({ url, apiKey });
  }
  return clientInstance;
}

export const KNOWLEDGE_COLLECTION = "knowledge_chunks";
export const MEMORY_COLLECTION = "long_term_memories";

/**
 * Initializes and asserts that all necessary Qdrant collections exist 
 * and are set up with the correct vector dimensions.
 */
export async function initQdrantCollections() {
  const qdrant = getQdrantClient();
  const embeddingProvider = getEmbeddingProvider();
  const dimension = embeddingProvider.dimension;

  await assertCollection(qdrant, KNOWLEDGE_COLLECTION, dimension);
  await assertCollection(qdrant, MEMORY_COLLECTION, dimension);
}

async function assertCollection(qdrant: QdrantClient, name: string, vectorSize: number) {
  try {
    const response = await qdrant.getCollections();
    const exists = response.collections.some(c => c.name === name);
    
    if (!exists) {
      console.log(`Qdrant collection "${name}" not found. Creating with vector size ${vectorSize}...`);
      await qdrant.createCollection(name, {
        vectors: {
          size: vectorSize,
          distance: "Cosine",
        },
      });

      // Create a payload index on user_id for isolation (multi-tenant filtering)
      await qdrant.createPayloadIndex(name, {
        field_name: "user_id",
        field_schema: "keyword",
      });

      // Create additional helper indexes
      if (name === KNOWLEDGE_COLLECTION) {
        await qdrant.createPayloadIndex(name, {
          field_name: "file_id",
          field_schema: "keyword",
        });
        // Create full-text search index for BM25/keyword boosting
        await qdrant.createPayloadIndex(name, {
          field_name: "text",
          field_schema: "text",
        });
      } else if (name === MEMORY_COLLECTION) {
        await qdrant.createPayloadIndex(name, {
          field_name: "memory_text",
          field_schema: "text",
        });
      }
      console.log(`Qdrant collection "${name}" created and indexed successfully.`);
    }
  } catch (error) {
    console.error(`Failed to initialize Qdrant collection "${name}":`, error);
  }
}

let collectionsInitialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureCollectionsInitialized(): Promise<void> {
  if (collectionsInitialized) return;
  if (!initPromise) {
    initPromise = initQdrantCollections().then(() => {
      collectionsInitialized = true;
    }).catch(err => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}
