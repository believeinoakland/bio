/* The PDF outbound-link graph (D-91 phase 1) AND Tier 1 text extraction
 * (QUEUE CPDF-4), tested against hand-built PDFs whose structure and content
 * streams are known byte-for-byte, so a PASS means the parser found what is
 * actually there rather than what a real-world fixture happened to contain.
 *
 * Link fixtures cover every partition the phase-1 mapping produces:
 *   - a /URI link                              -> deferred
 *   - a mailto: /URI link                      -> refused
 *   - an internal /GoTo /Dest                  -> anchor, target page resolved
 *   - an embedded file attachment              -> intra, content-addressed
 *   - a Link annot in a FlateDecode /ObjStm    -> read, not silently dropped
 *   - a /GoTo to a dangling page               -> undetermined (never invented)
 *   - a PDF with NO annotations                -> nothing found, nothing invented
 *
 * Text fixtures cover Tier 1 decoding and the first-class-undetermined doctrine:
 *   - a simple font with a /ToUnicode bfchar CMap   -> decoded to Unicode
 *   - a bfrange CMap (incrementing and array forms) -> decoded
 *   - a 2-byte Type0 font with /ToUnicode           -> decoded (composite codes)
 *   - a FlateDecode content stream + CMap           -> read via the same parser
 *   - TJ word-gap number                            -> a space; a small kern -> none
 *   - a CID font with NO /ToUnicode                 -> undetermined NAMING the font
 *   - a code absent from the CMap                   -> unmapped_code, never guessed
 *
 * Structural guards on top of the fixtures:
 *   - PARITY: every wrapper this module emits is byte-identical to what
 *     subresources.mjs's `linkWrapper` produces, so the two link systems cannot
 *     drift into two vocabularies.
 *
 * Two negative controls are on record. The registered one (below) is the CMap
 * lookup — the subject CPDF-4 added. The earlier link-side control also holds:
 * with classifyUri forced to always return "deferred", the mailto assertion
 * FAILS (refused expected, deferred got).
 */
/* NEGATIVE CONTROL: in loadFont skip the /ToUnicode lookup (`const tu = false && doc.resolve(map.ToUnicode)`) so no CMap ever loads -> the decoded-text assertions fail. RUN 2026-07-31: 14 of 75 failed (every "decodes to"/document/per-page text assertion + the unmapped_code region — all runs collapse to no_tounicode); the CMap-independent doctrine assertions (CID-no-ToUnicode acceptance, no_current_font, empty-text shape) still passed; restored -> 75 pass 0 fail. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
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

/* ================================================================== *
 * Tier 1 text extraction (QUEUE CPDF-4)
 * ================================================================== */

/* Build a page whose Resources bind one font and whose Contents is `content`.
 * `fontBody` is the font dict; `cmapBody` (or null) is its /ToUnicode stream.
 * When `flate` is set, both the content and the CMap are FlateDecode-compressed,
 * proving Tier 1 reuses the same stream parser the link half does. */
function textPdf({ content, fontBody, cmapBody, flate = false }) {
  const objs = [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
  ];
  const cbuf = Buffer.from(content, "latin1");
  if (flate) {
    const z = deflateSync(cbuf);
    objs.push({ num: 4, head: `<< /Length ${z.length} /Filter /FlateDecode >>`, stream: z });
  } else {
    objs.push({ num: 4, head: `<< /Length ${cbuf.length} >>`, stream: cbuf });
  }
  objs.push({ num: 5, body: fontBody });
  if (cmapBody != null) {
    const mbuf = Buffer.from(cmapBody, "latin1");
    if (flate) {
      const z = deflateSync(mbuf);
      objs.push({ num: 6, head: `<< /Length ${z.length} /Filter /FlateDecode >>`, stream: z });
    } else {
      objs.push({ num: 6, head: `<< /Length ${mbuf.length} >>`, stream: mbuf });
    }
  }
  return pdf(objs);
}

/* A ToUnicode CMap with a 1-byte codespace and the given bfchar/bfrange body. */
const cmap1 = (body) =>
  `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<00> <FF>
endcodespacerange
${body}
endcmap CMapName currentdict /CMap defineresource pop end end`;

/* A ToUnicode CMap with a 2-byte codespace (composite/Type0 case). */
const cmap2 = (body) =>
  `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<0000> <FFFF>
endcodespacerange
${body}
endcmap CMapName currentdict /CMap defineresource pop end end`;

const SIMPLE_FONT = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>";

console.log("\n--- a simple font with a /ToUnicode bfchar CMap decodes to Unicode ---");
{
  // codes 01..05 -> H E L L O
  const cmapBody = "5 beginbfchar\n<01> <0048>\n<02> <0045>\n<03> <004C>\n<04> <004C>\n<05> <004F>\nendbfchar";
  const bytes = textPdf({
    content: "BT /F1 12 Tf (\\001\\002\\003\\004\\005) Tj ET",
    fontBody: SIMPLE_FONT,
    cmapBody: cmap1(cmapBody),
  });
  const out = await extractPdfStructure(bytes);
  t("it is a PDF", out.ok, true);
  t("the shown bytes decode to HELLO through the CMap", out.text.document, "HELLO");
  t("per-page text carries the same string", out.text.pages[0].text, "HELLO");
  t("nothing was undetermined", out.text.undetermined, []);
  t("the char count is honest", out.text.counts.chars, 5);
}

console.log("\n--- a bfrange CMap decodes: incrementing form and array form ---");
{
  // incrementing: 0x41..0x5A -> A..Z ; show H I
  const inc = textPdf({
    content: "BT /F1 12 Tf <4849> Tj ET",
    fontBody: SIMPLE_FONT,
    cmapBody: cmap1("1 beginbfrange\n<41> <5A> <0041>\nendbfrange"),
  });
  t("the incrementing bfrange decodes <4849> to HI", (await extractPdfStructure(inc)).text.document, "HI");

  // array: codes 01..03 -> [A B C]
  const arr = textPdf({
    content: "BT /F1 12 Tf (\\001\\002\\003) Tj ET",
    fontBody: SIMPLE_FONT,
    cmapBody: cmap1("1 beginbfrange\n<01> <03> [<0041> <0042> <0043>]\nendbfrange"),
  });
  t("the array bfrange decodes to ABC", (await extractPdfStructure(arr)).text.document, "ABC");
}

console.log("\n--- a 2-byte Type0 font with /ToUnicode decodes composite codes ---");
{
  // 2-byte codes 0x0001 0x0002 -> H i ; codespace is 2 bytes so width is inferred
  const bytes = textPdf({
    content: "BT /F1 12 Tf <00010002> Tj ET",
    fontBody: "<< /Type /Font /Subtype /Type0 /BaseFont /ABCDEF+Sub /Encoding /Identity-H /DescendantFonts [7 0 R] /ToUnicode 6 0 R >>",
    cmapBody: cmap2("2 beginbfchar\n<0001> <0048>\n<0002> <0069>\nendbfchar"),
  });
  const out = await extractPdfStructure(bytes);
  t("the two-byte codes decode to Hi", out.text.document, "Hi");
  t("no run was left undetermined", out.text.undetermined.length, 0);
}

console.log("\n--- a FlateDecode content stream AND CMap are read via the same parser ---");
{
  const bytes = textPdf({
    content: "BT /F1 12 Tf (\\001\\002) Tj ET",
    fontBody: SIMPLE_FONT,
    cmapBody: cmap1("2 beginbfchar\n<01> <0047>\n<02> <006F>\nendbfchar"),
    flate: true,
  });
  t("compressed content + compressed CMap still decode to Go", (await extractPdfStructure(bytes)).text.document, "Go");
}

console.log("\n--- TJ: a large negative advance is a word gap; a small kern is not ---");
{
  const cmapBody = cmap1("2 beginbfchar\n<01> <0041>\n<02> <0042>\nendbfchar"); // 1->A 2->B
  const gap = textPdf({ content: "BT /F1 12 Tf [(\\001)-250(\\002)] TJ ET", fontBody: SIMPLE_FONT, cmapBody });
  t("a -250 advance inserts a space (A B)", (await extractPdfStructure(gap)).text.document, "A B");
  const kern = textPdf({ content: "BT /F1 12 Tf [(\\001)-20(\\002)] TJ ET", fontBody: SIMPLE_FONT, cmapBody });
  t("a -20 kern does not (AB)", (await extractPdfStructure(kern)).text.document, "AB");
}

console.log("\n--- THE ACCEPTANCE CASE: a CID font with NO /ToUnicode is undetermined, NAMING the font, never mojibake ---");
{
  const bytes = textPdf({
    content: "BT /F1 12 Tf <00480049> Tj ET",
    fontBody: "<< /Type /Font /Subtype /Type0 /BaseFont /ABCDEF+CustomCID /Encoding /Identity-H /DescendantFonts [7 0 R] >>",
    cmapBody: null, // NO ToUnicode
  });
  const out = await extractPdfStructure(bytes);
  t("no readable text is produced (no mojibake)", out.text.document, "");
  t("exactly one undetermined region", out.text.undetermined.length, 1);
  const u = out.text.undetermined[0];
  t("the region is on the right page", u.page, 0);
  t("the reason names the CID-font-with-no-ToUnicode cause", u.reason, "cid_font_no_tounicode");
  t("and NAMES THE FONT (the BaseFont), never a guess", u.font, "ABCDEF+CustomCID");
  t("the undecodable bytes are carried, not dropped", u.codes, "00480049");
  t("per-page undetermined agrees", out.text.pages[0].undetermined[0].reason, "cid_font_no_tounicode");
}

console.log("\n--- a code absent from the CMap is unmapped_code, never guessed; mapped codes still decode ---");
{
  // 1->A only; show 1 then 2 (2 is unmapped)
  const bytes = textPdf({
    content: "BT /F1 12 Tf (\\001\\002) Tj ET",
    fontBody: SIMPLE_FONT,
    cmapBody: cmap1("1 beginbfchar\n<01> <0041>\nendbfchar"),
  });
  const out = await extractPdfStructure(bytes);
  t("the mapped code still decodes (A)", out.text.document, "A");
  t("the unmapped code is one undetermined region", out.text.undetermined.length, 1);
  t("named unmapped_code", out.text.undetermined[0].reason, "unmapped_code");
  t("carrying the code that had no mapping", out.text.undetermined[0].codes, "02");
  t("and the font it was shown in", out.text.undetermined[0].font, "Helvetica");
}

console.log("\n--- text shown with no current font is undetermined, not dropped silently ---");
{
  const bytes = textPdf({
    content: "BT (\\001\\002) Tj ET", // no Tf
    fontBody: SIMPLE_FONT,
    cmapBody: cmap1("1 beginbfchar\n<01> <0041>\nendbfchar"),
  });
  const out = await extractPdfStructure(bytes);
  t("nothing readable", out.text.document, "");
  t("one undetermined region naming the absence of a current font", out.text.undetermined[0].reason, "no_current_font");
}

console.log("\n--- the text field is present and shaped even when a PDF has no text ---");
{
  // reuse the no-annotations control PDF: one page, empty content
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
  ]);
  const out = await extractPdfStructure(bytes);
  t("text.document is the empty string, not missing", out.text.document, "");
  t("one page entry, matching the page count", out.text.pages.length, 1);
  t("its text is empty and nothing was undetermined", [out.text.pages[0].text, out.text.undetermined.length], ["", 0]);
}

console.log("\n--- an ENCRYPTED PDF is NAMED, not degraded to a swarm of undecodable notes (CPDF-5) ---");
{
  // A Standard Security Handler dict (object 4). Tier 1 has no decryption, so it
  // says `encrypted` — the one marker the plane escalates on to the pdf-worker
  // (I6), whose pdf.js decrypts a permission-only PDF transparently. Detection
  // reads the handler dict (never itself encrypted), so no ciphertext is needed.
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
    { num: 4, body: "<< /Filter /Standard /V 2 /R 3 /O (0000000000000000) /U (0000000000000000) /P -44 >>" },
  ], "trailer\n<< /Root 1 0 R /Encrypt 4 0 R >>\n");
  const out = await extractPdfStructure(bytes);
  t("still ok:true — encryption is a fact about the doc, not a parse fault", out.ok, true);
  t("text is empty, never guessed", out.text.document, "");
  t("exactly one document-level undetermined marker", out.text.undetermined.length, 1);
  t("named: encrypted", out.text.undetermined[0].reason, "encrypted");
  t("document-level marker (no single page owns it)", out.text.undetermined[0].page, null);
  t("and a note records it for the log", out.notes.includes("encrypted"), true);
  // The escalation predicate the plane uses (undetermined regions > chars) fires.
  t("undetermined regions exceed decoded chars -> the plane will escalate", out.text.counts.undetermined > out.text.counts.chars, true);
}

console.log("\n--- a normal (unencrypted) PDF is NOT flagged encrypted ---");
{
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
  ]);
  const out = await extractPdfStructure(bytes);
  t("no encrypted note on a plain document", out.notes.includes("encrypted"), false);
  t("no encrypted marker", out.text.undetermined.some((u) => u.reason === "encrypted"), false);
}

console.log(`\npdfstructure: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
