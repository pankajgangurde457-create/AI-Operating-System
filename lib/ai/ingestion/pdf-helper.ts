import pdf from "pdf-parse";
import { InputDocumentBlock } from "./chunker";

/**
 * Extracts text from a PDF buffer page-by-page using pdf-parse's pagerender callback.
 */
export async function parsePdfWithPages(buffer: Buffer): Promise<InputDocumentBlock[]> {
  const pages: InputDocumentBlock[] = [];
  let pageNum = 0;

  const customPageRender = (pageData: any) => {
    pageNum++;
    const text = pageData.text || "";
    pages.push({
      text: text,
      pageOrTimestamp: `Page ${pageNum}`,
    });
    return text;
  };

  // Run pdf-parse with custom renderer
  await pdf(buffer, { pagerender: customPageRender });

  return pages;
}
