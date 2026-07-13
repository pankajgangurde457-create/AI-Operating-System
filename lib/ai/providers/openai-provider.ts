import OpenAI from "openai";
import { AIProvider, ChatMessage, ChatOptions, ChatResponse, ImageAnalysisResponse, TranscribeResponse } from "./AIProvider";
import { EmbeddingProvider } from "./EmbeddingProvider";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private openai: OpenAI;
  private defaultChatModel: string;

  constructor(apiKey: string, defaultChatModel = "gpt-4o-mini") {
    this.openai = new OpenAI({ apiKey });
    this.defaultChatModel = defaultChatModel;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    const isJson = options?.responseFormat?.type === "json_object";
    
    // For final answer generation, a developer might want to override to gpt-4o,
    // but default to defaultChatModel (gpt-4o-mini) for general tasks.
    const model = this.defaultChatModel;

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
  }

  /**
   * Streaming support for chat. Returns an async iterable of strings.
   */
  async chatStream(messages: ChatMessage[], options?: ChatOptions): Promise<AsyncIterable<string>> {
    const model = this.defaultChatModel;
    
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
  }

  async transcribe(audioBuffer: Buffer, filename: string): Promise<TranscribeResponse> {
    const file = await OpenAI.toFile(audioBuffer, filename);
    const response = await this.openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });

    return {
      text: response.text,
    };
  }

  async analyzeImage(imageBuffer: Buffer, mimeType: string): Promise<ImageAnalysisResponse> {
    const base64Image = imageBuffer.toString("base64");
    
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
  }
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  name = "openai";
  dimension = 3072; // text-embedding-3-large default dimension
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async embedQuery(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });
    return response.data[0].embedding;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-large",
      input: texts,
    });
    
    return response.data.map(item => item.embedding);
  }
}
