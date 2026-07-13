export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
}

export interface ChatResponse {
  text: string;
  stream?: AsyncIterable<string>;
}

export interface TranscribeResponse {
  text: string;
}

export interface ImageAnalysisResponse {
  text: string;        // Extracted text (OCR)
  description: string; // Visual description
}

export interface AIProvider {
  name: string;
  
  /**
   * Generates a text response for the given chat messages.
   * If streaming is true, the response includes an AsyncIterable stream of chunks.
   */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;
  
  /**
   * Transcribes an audio buffer to text (Whisper).
   */
  transcribe(audioBuffer: Buffer, filename: string): Promise<TranscribeResponse>;
  
  /**
   * Extracts text (OCR) and generates a description from an image buffer.
   */
  analyzeImage(imageBuffer: Buffer, mimeType: string): Promise<ImageAnalysisResponse>;
}
