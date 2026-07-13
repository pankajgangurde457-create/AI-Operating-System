import { Pinecone } from "@pinecone-database/pinecone";

// Initialize the Pinecone client
// In a real application, ensure PINECONE_API_KEY is securely loaded from environment variables
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

export const getPineconeIndex = () => {
  return pinecone.Index(process.env.PINECONE_INDEX_NAME || "ai-os-index");
};

export default pinecone;
