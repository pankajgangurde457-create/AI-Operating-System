import OpenAI from "openai";
import { AIProvider, ChatMessage, ChatOptions, ChatResponse, ImageAnalysisResponse, TranscribeResponse } from "./AIProvider";
import { EmbeddingProvider } from "./EmbeddingProvider";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private openai: OpenAI;
  private defaultChatModel: string;

  constructor(apiKey: string, defaultChatModel = "gpt-4o-mini") {
    // Explicit 30s timeout and 3 retries for serverless production environment stability
    this.openai = new OpenAI({ apiKey, timeout: 30000, maxRetries: 3 });
    this.defaultChatModel = defaultChatModel;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    const isJson = options?.responseFormat?.type === "json_object";
    const model = this.defaultChatModel;

    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens,
        response_format: isJson ? { type: "json_object" } : undefined,
      });

      return {
        text: response.choices[0].message.content || "",
      };
    } catch (error: any) {
      console.error("[OpenAI Provider Error] Chat completion failed:", error);
      throw new Error(`OpenAI chat failed: ${error.message || error}`);
    }
  }

  /**
   * Streaming support for chat. Returns an async iterable of strings.
   */
  async chatStream(messages: ChatMessage[], options?: ChatOptions): Promise<AsyncIterable<string>> {
    const model = this.defaultChatModel;
    
    try {
      const responseStream = await this.openai.chat.completions.create({
        model: model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens,
        stream: true,
      });

      // Create an async generator that yields chunks as text strings
      async function* generator() {
        for await (const chunk of responseStream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            yield text;
          }
        }
      }

      return generator();
    } catch (error: any) {
      console.error("[OpenAI Provider Error] Chat stream request failed:", error);
      throw new Error(`OpenAI chat stream failed: ${error.message || error}`);
    }
  }

  async transcribe(audioBuffer: Buffer, filename: string): Promise<TranscribeResponse> {
    try {
      const file = await OpenAI.toFile(audioBuffer, filename);
      const response = await this.openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
      });

      return {
        text: response.text,
      };
    } catch (error: any) {
      console.error("[OpenAI Provider Error] Transcription request failed:", error);
      throw new Error(`OpenAI Whisper transcription failed: ${error.message || error}`);
    }
  }

  async analyzeImage(imageBuffer: Buffer, mimeType: string): Promise<ImageAnalysisResponse> {
    const base64Image = imageBuffer.toString("base64");
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an expert OCR and image analysis system. Analyze the provided image.
Return a JSON object with two fields:
- "text": The exact text extracted from the image (OCR). If there is no text, return an empty string. Preserve formatting and line breaks if possible.
- "description": A concise visual description of the image content (e.g. what is pictured, style, color, context).

Your JSON output must match this schema:
{
  "text": "text extracted or empty string",
  "description": "visual description of the image"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Perform OCR and describe this image."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ]
      });

      const content = response.choices[0].message.content || "{}";
      try {
        const parsed = JSON.parse(content);
        return {
          text: parsed.text ?? "",
          description: parsed.description ?? "",
        };
      } catch (e) {
        console.error("Failed to parse vision JSON response. Raw content:", content);
        return {
          text: "",
          description: "Failed to parse visual description.",
        };
      }
    } catch (error: any) {
      console.error("[OpenAI Provider Error] Image analysis vision request failed:", error);
      throw new Error(`OpenAI Vision OCR failed: ${error.message || error}`);
    }
  }
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  name = "openai";
  dimension = 3072; // text-embedding-3-large default dimension
  private openai: OpenAI;

  constructor(apiKey: string) {
    // Explicit 30s timeout and 3 retries for serverless production environment stability
    this.openai = new OpenAI({ apiKey, timeout: 30000, maxRetries: 3 });
  }

  async embedQuery(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error: any) {
      console.error("[OpenAI Provider Error] Single query embedding failed:", error);
      throw new Error(`OpenAI embeddings failed: ${error.message || error}`);
    }
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-large",
        input: texts,
      });
      
      return response.data.map(item => item.embedding);
    } catch (error: any) {
      console.error("[OpenAI Provider Error] Batch document embedding failed:", error);
      throw new Error(`OpenAI batch embeddings failed: ${error.message || error}`);
    }
  }
}
