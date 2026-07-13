import { AIProvider } from "./AIProvider";
import { EmbeddingProvider } from "./EmbeddingProvider";
import { OpenAIProvider, OpenAIEmbeddingProvider } from "./openai-provider";
import { GeminiProvider, GeminiEmbeddingProvider } from "./gemini-provider";

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || "openai";
  
  if (providerType.toLowerCase() === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY || "";
    return new GeminiProvider(apiKey);
  }
  
  const apiKey = process.env.OPENAI_API_KEY || "";
  return new OpenAIProvider(apiKey);
}

export function getEmbeddingProvider(): EmbeddingProvider {
  const providerType = process.env.AI_PROVIDER || "openai";
  
  if (providerType.toLowerCase() === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY || "";
    return new GeminiEmbeddingProvider(apiKey);
  }
  
  const apiKey = process.env.OPENAI_API_KEY || "";
  return new OpenAIEmbeddingProvider(apiKey);
}
