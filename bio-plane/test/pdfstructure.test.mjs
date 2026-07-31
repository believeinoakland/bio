/* The PDF outbound-link graph (D-91 phase 1), tested against hand-built PDFs
 * whose structure is known byte-for-byte, so a PASS means the parser found what
 * is actually there rather than what a real-world fixture happened to contain.
 *
 * Fixtures cover every partition the phase-1 mapping produces:
 *   - a /URI link                              -> deferred
 *   - a mailto: /URI link                      -> refused
 *   - an internal /GoTo /Dest                  -> anchor, target page resolved
 *   - an embedded file attachment              -> intra, content-addressed
 *   - a Link annot in a FlateDecode /ObjStm    -> read, not silently dropped
 *   - a /GoTo to a dangling page               -> undetermined (never invented)
 *   - a PDF with NO annotations                -> nothing found, nothing invented
 *
 * Two structural guards on top of the fixtures:
 *   - PARITY: every wrapper this module emits is byte-identical to what
 *     subresources.mjs's `linkWrapper` produces, so the two link systems cannot
 *     drift into two vocabularies.
 *   - NEGATIVE CONTROL (run by hand, recorded in the report): with the URI
 *     classifier forced to always return "deferred", the mailto assertion FAILS
 *     (refused expected, deferred got). Restored immediately after. A suite that
 *     stayed green through that break would be testing something else.
 */
import { extractPdfStructure, PDF_LINK_TYPES } from "../src/pdfstructure.mjs";
import { LINK_TYPES, linkWrapper } from "../src/subresources.mjs";
import { deflateSync } from "node:zlib";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ---- a tiny PDF assembler: brute-force parseable, no xref needed ---- */
function pdf(objs, trailer = "") {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"));
      chunks.push(o.stream);
      chunks.push(Buffer.from("\nendstream\n", "latin1"));
    } else {
      chunks.push(Buffer.from(o.body + "\n", "latin1"));
    }
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from(trailer + "%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}

const CATALOG = (n, pagesRef) => ({ num: n, body: `<< /Type /Catalog /Pages ${pagesRef} >>` });

/* ------------------------------------------------------------------ */
console.log("\n--- a /URI link is deferred ---");
{
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Annots [4 0 R] >>" },
    { num: 4, body: "<< /Type /Annot /Subtype /Link /Rect [100 100 200 120] /A << /S /URI /URI (https://example.gov/agenda.pdf) >> >>" },
  ]);
  const out = await extractPdfStructure(bytes);
  t("it is a PDF", out.ok, true);
  t("one page", out.pages, 1);
  t("one link", out.links.length, 1);
  const l = out.links[0];
  t("partition deferred", l.partition, "deferred");
  t("the url is carried verbatim", l.target.url, "https://example.gov/agenda.pdf");
  t("element reference names the source page (0-based)", l.source.page, 0);
  t("and the annotation rectangle", l.source.rect, [100, 100, 200, 120]);
  t("the wrapper is byte-identical to linkWrapper.deferred",
    l.wrapper, linkWrapper.deferred("https://example.gov/agenda.pdf"));
  t("counts agree", out.counts, { anchor: 0, intra: 0, deferred: 1, refused: 0, undetermined: 0 });
}

console.log("\n--- a mailto: /URI link is refused ---");
{
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Annots [4 0 R] >>" },
    { num: 4, body: "<< /Type /Annot /Subtype /Link /Rect [0 0 10 10] /A << /S /URI /URI (mailto:clerk@example.gov) >> >>" },
  ]);
  const out = await extractPdfStructure(bytes);
  t("one link", out.links.length, 1);
  t("partition refused", out.links[0].partition, "refused");
  t("the wrapper is the refused wrapper exactly", out.links[0].wrapper, linkWrapper.refused());
  t("the scheme is still recorded, never invented away", out.links[0].target.url, "mailto:clerk@example.gov");
  // javascript: is the other executable case
  const js = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Annots [4 0 R] >>" },
    { num: 4, body: "<< /Type /Annot /Subtype /Link /A << /S /URI /URI (javascript:alert(1)) >> >>" },
  ]);
  t("javascript: is refused too", (await extractPdfStructure(js)).links[0].partition, "refused");
}

console.log("\n--- an internal /GoTo /Dest is an anchor with the target page resolved ---");
{
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Annots [5 0 R] >>" },
    { num: 4, body: "<< /Type /Page /Parent 2 0 R >>" },
    { num: 5, body: "<< /Type /Annot /Subtype /Link /Rect [5 5 15 15] /A << /S /GoTo /D [4 0 R /XYZ 0 792 0] >> >>" },
  ]);
  const out = await extractPdfStructure(bytes);
  t("two pages", out.pages, 2);
  t("one link", out.links.length, 1);
  const l = out.links[0];
  t("partition anchor", l.partition, "anchor");
  t("the target is the SECOND page, 0-based index 1", l.target.page, 1);
  t("the source is the FIRST page, index 0", l.source.page, 0);
  t("the wrapper is byte-identical to linkWrapper.anchor of the fragment",
    l.wrapper, linkWrapper.anchor(l.target.fragment));
  t("the fragment is the 1-based page open-parameter", l.target.fragment, "#page=2");
  // A bare /Dest on the annotation (no /A) resolves the same way.
  const bare = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Annots [5 0 R] >>" },
    { num: 4, body: "<< /Type /Page /Parent 2 0 R >>" },
    { num: 5, body: "<< /Type /Annot /Subtype /Link /Dest [4 0 R /Fit] >>" },
  ]);
  t("a bare /Dest resolves to the same anchor", (await extractPdfStructure(bare)).links[0].target.page, 1);
}

console.log("\n--- a named destination resolves through the /Dests dict ---");
{
  const bytes = pdf([
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R /Dests << /budget [4 0 R /Fit] >> >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Annots [5 0 R] >>" },
    { num: 4, body: "<< /Type /Page /Parent 2 0 R >>" },
    { num: 5, body: "<< /Type /Annot /Subtype /Link /A << /S /GoTo /D (budget) >> >>" },
  ]);
  const out = await extractPdfStructure(bytes);
  t("the named dest resolves to page index 1", out.links[0].target.page, 1);
  t("and the destination name is kept", out.links[0].target.dest, "budget");
}

console.log("\n--- a Link annotation living inside a FlateDecode /ObjStm is read ---");
{
  // Object 10 (the annotation) lives compressed inside an object stream.
  const annotBody =
    "<< /Type /Annot /Subtype /Link /Rect [10 10 20 20] /A << /S /URI /URI (https://objstm.example.gov/) >> >>";
  const header = "10 0"; // objNum 10 at offset 0 relative to /First
  const inner = header + "\n" + annotBody;
  const first = Buffer.byteLength(header + "\n", "latin1");
  const compressed = deflateSync(Buffer.from(inner, "latin1")); // zlib format: DecompressionStream("deflate")
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Annots [10 0 R] >>" },
    { num: 20, head: `<< /Type /ObjStm /N 1 /First ${first} /Length ${compressed.length} /Filter /FlateDecode >>`, stream: compressed },
  ]);
  const out = await extractPdfStructure(bytes);
  t("the compressed annotation is NOT silently empty", out.links.length, 1);
  t("it classifies as deferred", out.links[0].partition, "deferred");
  t("with the url from inside the object stream", out.links[0].target.url, "https://objstm.example.gov/");
}

console.log("\n--- an embedded file attachment is intra, content-addressed ---");
{
  const fileBytes = Buffer.from("PDF-ITEM-PACKET-CONTENTS", "latin1");
  const efStream = deflateSync(fileBytes);
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Annots [4 0 R] >>" },
    { num: 4, body: "<< /Type /Annot /Subtype /FileAttachment /Rect [1 1 9 9] /Contents (item.pdf) /FS 5 0 R >>" },
    { num: 5, body: "<< /Type /Filespec /F (item.pdf) /UF (item.pdf) /EF << /F 6 0 R >> >>" },
    { num: 6, head: `<< /Type /EmbeddedFile /Length ${efStream.length} /Filter /FlateDecode >>`, stream: efStream },
  ]);
  const out = await extractPdfStructure(bytes);
  t("one link", out.links.length, 1);
  const l = out.links[0];
  t("partition intra", l.partition, "intra");
  t("the wrapper is byte-identical to linkWrapper.intra of the sha", l.wrapper, linkWrapper.intra(l.target.sha256));
  // The sha must be SHA-256 of the DECODED embedded bytes, computed independently here.
  const want = await crypto.subtle.digest("SHA-256", fileBytes);
  const wantHex = [...new Uint8Array(want)].map((b) => b.toString(16).padStart(2, "0")).join("");
  t("the sha is SHA-256 of the decoded file bytes", l.target.sha256, wantHex);
  t("the filename is kept", l.target.name, "item.pdf");
}

console.log("\n--- a /GoTo to a dangling page is undetermined, never invented ---");
{
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Annots [5 0 R] >>" },
    { num: 5, body: "<< /Type /Annot /Subtype /Link /A << /S /GoTo /D [99 0 R /Fit] >> >>" },
  ]);
  const out = await extractPdfStructure(bytes);
  t("one link", out.links.length, 1);
  t("partition undetermined", out.links[0].partition, "undetermined");
  t("it carries no wrapper (undetermined has none)", out.links[0].wrapper, null);
  t("and states WHY it could not be resolved", out.links[0].target.why, "dest_page_not_in_tree");
  t("undetermined is not one of the four HTML partitions", LINK_TYPES.includes("undetermined"), false);
  t("but it is a first-class PDF partition", PDF_LINK_TYPES.includes("undetermined"), true);
}

console.log("\n--- THE CONTROL: a PDF with no annotations finds nothing, invents nothing ---");
{
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
  ]);
  const out = await extractPdfStructure(bytes);
  t("it is a valid PDF", out.ok, true);
  t("with one page", out.pages, 1);
  t("and ZERO links", out.links.length, 0);
  t("every count is zero", out.counts, { anchor: 0, intra: 0, deferred: 0, refused: 0, undetermined: 0 });
}

console.log("\n--- non-PDF bytes are refused as such, not parsed into phantom links ---");
{
  const out = await extractPdfStructure(new Uint8Array([1, 2, 3, 4]));
  t("not a pdf", out.ok, false);
  t("named", out.reason, "NOT_A_PDF");
}

console.log("\n--- PARITY: the partition vocabulary mirrors subresources.mjs exactly ---");
{
  t("the four wrapper partitions are exactly the HTML LINK_TYPES, in order",
    PDF_LINK_TYPES.slice(0, 4), LINK_TYPES);
  t("and PDF adds only undetermined on top", PDF_LINK_TYPES, [...LINK_TYPES, "undetermined"]);
}

console.log(`\npdfstructure: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
