export interface InputDocumentBlock {
  text: string;
  pageOrTimestamp: string; // e.g., "Page 3" or "00:12 - 00:45"
}

export interface ChunkOutput {
  text: string;
  chunkIndex: number;
  pageOrTimestamp: string;
}

/**
 * A self-contained, robust Recursive Character Text Splitter implementation.
 * Avoids dependencies on specific volatile LangChain exports.
 */
export class RecursiveCharacterTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];

  constructor(options?: { chunkSize?: number; chunkOverlap?: number; separators?: string[] }) {
    this.chunkSize = options?.chunkSize ?? 1000;
    this.chunkOverlap = options?.chunkOverlap ?? 200;
    this.separators = options?.separators ?? ["\n\n", "\n", " ", ""];
  }

  /**
   * Splits a single string into smaller string chunks.
   */
  async splitText(text: string): Promise<string[]> {
    return this.split(text, this.separators);
  }

  private split(text: string, separators: string[]): string[] {
    if (text.length <= this.chunkSize) {
      return [text];
    }

    const separator = separators[0];
    const nextSeparators = separators.slice(1);

    if (separator === "") {
      // Base case: Character-by-character slicing
      const chunks: string[] = [];
      let i = 0;
      while (i < text.length) {
        chunks.push(text.substring(i, i + this.chunkSize));
        // Ensure overlap
        i += Math.max(1, this.chunkSize - this.chunkOverlap);
      }
      return chunks;
    }

    const parts = text.split(separator);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const part of parts) {
      const prospectiveChunk = currentChunk
        ? currentChunk + separator + part
        : part;

      if (prospectiveChunk.length <= this.chunkSize) {
        currentChunk = prospectiveChunk;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }

        // If the individual part is larger than chunkSize, split it recursively
        if (part.length > this.chunkSize) {
          const subSplits = this.split(part, nextSeparators);
          for (let j = 0; j < subSplits.length - 1; j++) {
            chunks.push(subSplits[j]);
          }
          currentChunk = subSplits[subSplits.length - 1];
        } else {
          currentChunk = part;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }
}

/**
 * Splits a list of text blocks (each annotated with page number or timestamp)
 * into smaller, overlapping semantic chunks while preserving their exact source metadata.
 */
export async function chunkDocumentBlocks(
  blocks: InputDocumentBlock[],
  chunkSize = 2500, // ~600 tokens (4 chars/token approximation)
  chunkOverlap = 300 // ~12% overlap
): Promise<ChunkOutput[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ["\n\n", "\n", " ", ""],
  });

  const allChunks: ChunkOutput[] = [];
  let overallChunkIndex = 0;

  for (const block of blocks) {
    if (!block.text.trim()) continue;

    const splits = await splitter.splitText(block.text);

    for (const split of splits) {
      if (!split.trim()) continue;

      allChunks.push({
        text: split.trim(),
        chunkIndex: overallChunkIndex++,
        pageOrTimestamp: block.pageOrTimestamp,
      });
    }
  }

  return allChunks;
}
