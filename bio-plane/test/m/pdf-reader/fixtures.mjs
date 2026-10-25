/* pdf-reader's published fixtures: the answers its users read, made by this module's real code when a test calls them,
 * never stored. Each export is named for the answer it gives, so a user's test says which answer it means. */
import { extractPdfStructure } from "../../../src/pdfstructure.mjs";

/** The answer to bytes that are not a PDF: `extractPdfStructure` of the text "not a pdf" (R1, NOT_A_PDF). */
export async function notAPdf() {
  return extractPdfStructure(new TextEncoder().encode("not a pdf"));
}
