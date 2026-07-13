export interface EmbeddingProvider {
  name: string;
  dimension: number;
  
  /**
   * Generates a vector embedding for a query string.
   */
  embedQuery(text: string): Promise<number[]>;
  
  /**
   * Generates vector embeddings for an array of document chunks.
   */
  embedDocuments(texts: string[]): Promise<number[][]>;
}
