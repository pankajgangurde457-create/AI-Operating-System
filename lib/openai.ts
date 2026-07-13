import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";

// LLM for Chat and Synthesis
export const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY || "",
  temperature: 0.3, // Lower temperature for more factual synthesis
  modelName: "gpt-4o-mini", // Using the fast/cheap model by default
});

// Embeddings model for converting text to vectors
export const embeddingsModel = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY || "",
  modelName: "text-embedding-3-small", // Dimensions: 1536
});
