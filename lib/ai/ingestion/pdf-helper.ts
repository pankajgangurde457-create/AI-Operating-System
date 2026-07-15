import { PDFParse } from "pdf-parse";
import { InputDocumentBlock } from "./chunker";

/**
 * Extracts text from a PDF buffer page-by-page using pdf-parse's modern PDFParse class.
 */
export async function parsePdfWithPages(buffer: Buffer): Promise<InputDocumentBlock[]> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();

  if (!result || !result.pages) {
    return [];
  }

  return result.pages.map(page => ({
    text: page.text || "",
    pageOrTimestamp: `Page ${page.num}`,
  }));
}
