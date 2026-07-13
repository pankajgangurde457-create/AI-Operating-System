import { AIProvider, ChatMessage, ChatOptions, ChatResponse, ImageAnalysisResponse, TranscribeResponse } from "./AIProvider";
import { EmbeddingProvider } from "./EmbeddingProvider";

export class GeminiProvider implements AIProvider {
  name = "gemini";

  constructor(apiKey: string) {
    // Initialization stub
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    throw new Error("Gemini fallback provider is stubbed. Please configure OpenAI.");
  }

  async chatStream(messages: ChatMessage[], options?: ChatOptions): Promise<AsyncIterable<string>> {
    throw new Error("Gemini fallback provider is stubbed. Please configure OpenAI.");
  }

  async transcribe(audioBuffer: Buffer, filename: string): Promise<TranscribeResponse> {
    throw new Error("Gemini fallback provider is stubbed. Please configure OpenAI.");
  }

  async analyzeImage(imageBuffer: Buffer, mimeType: string): Promise<ImageAnalysisResponse> {
    throw new Error("Gemini fallback provider is stubbed. Please configure OpenAI.");
  }
}

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  name = "gemini";
  dimension = 768; // text-embedding-004 default dimension

  constructor(apiKey: string) {
    // Initialization stub
  }

  async embedQuery(text: string): Promise<number[]> {
    throw new Error("Gemini embedding provider is stubbed. Please configure OpenAI.");
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    throw new Error("Gemini embedding provider is stubbed. Please configure OpenAI.");
  }
}
