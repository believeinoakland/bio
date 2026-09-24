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
 *   - ONE Td PER GLYPH, every ty=0                 -> one line, read as WORDS (D-481)
 *   - T*, a Td with ty!=0, a Tm at another baseline -> STILL a line break (D-481)
 *   - the same Tm under a different cm             -> still two lines (D-481)
 *
 * D-251 fixtures cover the /Info read at the parser, and specifically the half
 * the acquire-driven suite cannot reach:
 *   - a classic `trailer << … /Info N 0 R >>`     -> the product NAMED
 *   - an xref STREAM with no `trailer` keyword    -> still found (the Legistar shape)
 *   - an incremental update whose re-save dropped the marker -> undetermined,
 *     never the earlier marker and never "authored"
 *   - /Info compressed inside a FlateDecode /ObjStm -> read, not silently absent
 *   - a dangling /Info reference                  -> falls back, never invents
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
/* NEGATIVE CONTROL (D-502, 2026-09-24, TWO ARMS, each armed ALONE, each restored from a uniquely-named per-arm
   pristine copy of bio-plane/src/pdfstructure.mjs verified by sha256 AND `cmp` — 100,379 B, sha256
   59016ab93d9685a68a99046c3f79557f7ad291feb02e08f5406179a5eeb7e47f. BASELINE, nothing armed: 142 pass, 0 fail.
   ARM 1 — THE ROW'S DECLARED CONTROL, IGNORE THE WIDTHS: `fontWidths` returns `{ widths: null }` for every font
   (1 site), so no pen is ever tracked. DECLARED must fail: every arm that asserts a SPLIT, and the real-agenda glue
   arms. DECLARED must pass: every continuation arm, the no-widths arm, and all of D-481's. RUN: exactly 13 of 142
   failed and they are that list — the 175 pt jump, the 0.30 em forward and backward jumps, the second text object
   200 pt away, all five `...and 1 pt further is a word gap` companions, the Tw companion, AND THE GLUE ARM BY NAME:
   "`OaklandPrinted` — the token M-133 named — does not occur", "...and the two runs it was made of are both there,
   separated", and "the lower->upper glue count fell 43 -> 11". Nothing else moved, so the split comes from a width
   read out of the file. ONE FINDING ABOUT THE ARMS THEMSELVES, recorded rather than smoothed: on the first run
   (before the companions existed) the /MissingWidth, /FontMatrix, /DW and Tc arms PASSED under this control — each
   asserts a CONTINUATION, and a reader with no widths continues too. An arm that passes when the subject is removed
   is not evidence for it; the five `1 pt further` companions were written for that and are what fails here.
   ARM 2 — THE LIAR, THE THRESHOLD AT ZERO: `WORD_GAP_EM = 0` (1 site) — the reading that splits on any jump at all,
   whose token count rises everywhere while words fragment. DECLARED must fail: every continuation arm. DECLARED must
   pass: every split arm, the per-glyph arm and the real-agenda arms. RUN: exactly 8 of 142 failed, all continuations,
   and every split arm held — which IS the point: this suite refuses the liar in both directions. A SECOND FINDING:
   the per-glyph arm and the real-agenda arms PASS under ARM 2, because their continuation gaps are EXACTLY zero and
   `> 0` does not fire on them; only real float noise does. The suite could not see that direction at all until the
   `0.01 em` arm was added for it, and the corpus figure behind it (threshold 0 reads the seven documents as 17,292
   tokens, 4,578 of them one character long, against 14,039 and 638) is in M-141, not here.
   Restored after each arm, verified by sha256 AND cmp -> 142 pass, 0 fail. */
/* NEGATIVE CONTROL (D-481, 2026-09-24, TWO ARMS, each armed ALONE, each restored by sha256 AND cmp against a per-arm
   pristine copy of bio-plane/src/pdfstructure.mjs — 83,282 B, sha256 be8ee479fb248212dff2c7a4dfc24ac248334b6e81dacd98a42a100826f972d4):
   ARM 1 — REVERT THE SUBJECT: make Td/TD and Tm break unconditionally again (2 sites). DECLARED must fail: the two
   per-glyph arms and the two same-baseline arms; must pass: everything else. RUN: 9 of 107 failed — "eleven glyphs
   placed by eleven Td read as ONE line", "and as WORDS, not characters", "a Tm at the SAME baseline does NOT break
   it", "and under the SAME cm as one line", AND the four baseline-move arms (T*, Td ty!=0, TD ty!=0, Tm at a
   different baseline), AND the then-counts.chars floor. TWO SURPRISES, RECORDED RATHER THAN SMOOTHED: (a) the four
   baseline-move arms were DECLARED must-pass and FAILED, because each writes the same per-glyph line on BOTH sides
   of its mover, so the revert corrupts them too — they discriminate for ARM 2, not for ARM 1; (b) the "non-empty"
   floor was written against counts.chars, which is the document LENGTH and so MOVES WITH THE NEWLINES — a floor that
   cannot survive an arm is not a floor, and it was rewritten to count the ten non-whitespace glyphs before this line
   was. All 91 pre-existing assertions PASSED under this arm, so nothing in the old suite pinned the old behaviour.
   ARM 2 — THE LIAR: make breakLine() emit no newline at all (1 site) — the reading whose word count rises while
   every real line break is lost. DECLARED must fail: every real-break arm; must pass: the per-glyph arms and the
   floor. RUN: exactly 7 of 107 failed — T*, Td ty!=0, TD ty!=0, Tm at a different baseline, the ' and " arm, the
   two-cm arm, and the three-Td-lines over-strictness arm. The per-glyph arms and the floor PASSED, which IS the
   point: this suite refuses the liar. All 91 pre-existing assertions PASSED.
   Restored after each arm -> 107 pass, 0 fail. */
/* NEGATIVE CONTROL: in loadFont skip the /ToUnicode lookup (`const tu = false && doc.resolve(map.ToUnicode)`) so no CMap ever loads -> the decoded-text assertions fail. RUN 2026-07-31: 14 of 75 failed (every "decodes to"/document/per-page text assertion + the unmapped_code region — all runs collapse to no_tounicode); the CMap-independent doctrine assertions (CID-no-ToUnicode acceptance, no_current_font, empty-text shape) still passed; restored -> 75 pass 0 fail. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { extractPdfStructure, PDF_LINK_TYPES } from "../src/pdfstructure.mjs";
import { LINK_TYPES, linkWrapper } from "../src/subresources.mjs";
import { deflateSync } from "node:zlib";
import { readFileSync } from "node:fs";

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

/* ------------------------------------------------------------------ *
 * D-251 — the /Info READ itself, at the parser, where the two TRAILER SHAPES
 * live. The acquire-driven evidence is `producer-provenance.test.mjs`; what is
 * asserted here is the half that suite's fixtures cannot reach — an xref-STREAM
 * PDF (the shape Legistar and OpenGov actually serve, which has no `trailer`
 * keyword at all), an incremental update, and metadata compressed into an
 * object stream. A parser that only read the classic trailer would pass every
 * arm of the other suite and be blind to the entire class this item is about.
 * ------------------------------------------------------------------ */
/* The ocr block, read defensively: when no marker is found there is none, and
   an assertion that THROWS reading it reports "the suite crashed" where the
   finding is "no engine was named". The control's first arm removes exactly
   that read and must come back as a want/got. */
const ocrOf = (out) => (out.text && out.text.producer && out.text.producer.ocr) || {};
console.log("\n--- D-251: /Info is read from BOTH trailer shapes, and the last one wins ---");
{
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
    { num: 4, body: "<< /Producer (ABBYY FineReader Engine 11) >>" },
  ], "trailer\n<< /Root 1 0 R /Info 4 0 R >>\n");
  const out = await extractPdfStructure(bytes);
  t("classic trailer: the product is NAMED", ocrOf(out).engine, "ABBYY FineReader Engine 11");
  t("and the determination is ocr", out.text.producer.determination, "ocr");
}
{
  /* An xref STREAM PDF: no `trailer` keyword anywhere, /Info on the /Type /XRef
     stream dict. This is the modern shape and the one the measured corpus is. */
  const xrefData = Buffer.from([0, 0, 0, 0]);
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
    { num: 4, body: "<< /Creator (ABBYY FineReader Engine 11) /Producer (PDFWriter) >>" },
    { num: 5, head: `<< /Type /XRef /Root 1 0 R /Info 4 0 R /W [1 2 1] /Size 6 /Length ${xrefData.length} >>`,
      stream: xrefData },
  ]);
  const out = await extractPdfStructure(bytes);
  t("xref-stream PDF (no `trailer` keyword at all): /Info is still found",
    out.text.producer.determination, "ocr");
  t("naming the engine from the field that carried it",
    [ocrOf(out).engine, ocrOf(out).field],
    ["ABBYY FineReader Engine 11", "creator"]);
}
{
  /* Incremental update: the document was OCR'd and then re-saved by a writer
     that overwrote its metadata. The LAST trailer is what the file now says,
     and the honest answer is `undetermined` — NOT the earlier marker, and not
     "authored" either. Overwriting is exactly the case the design's "an absent
     marker is an absent marker" clause is written for. */
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
    { num: 4, body: "<< /Producer (ABBYY FineReader Engine 11) >>" },
    { num: 5, body: "<< /Producer (Adobe PDF Library 15.0) >>" },
  ], "trailer\n<< /Root 1 0 R /Info 4 0 R >>\ntrailer\n<< /Root 1 0 R /Info 5 0 R >>\n");
  const out = await extractPdfStructure(bytes);
  t("an incremental update's LAST trailer wins", out.text.producer.producer, "Adobe PDF Library 15.0");
  t("and a re-save that dropped the marker reads undetermined, never authored",
    out.text.producer.determination, "undetermined");
}
{
  /* /Info compressed into an object stream — legal since PDF 1.5 and invisible
     to any reader that only scans the raw bytes. */
  const infoBody = "<< /Producer (Tesseract 5.3.4) >>";
  const header = "9 0";
  const inner = header + "\n" + infoBody;
  const first = Buffer.byteLength(header + "\n", "latin1");
  const compressed = deflateSync(Buffer.from(inner, "latin1"));
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
    { num: 21, head: `<< /Type /ObjStm /N 1 /First ${first} /Length ${compressed.length} /Filter /FlateDecode >>`,
      stream: compressed },
  ], "trailer\n<< /Root 1 0 R /Info 9 0 R >>\n");
  const out = await extractPdfStructure(bytes);
  t("an /Info living inside a FlateDecode /ObjStm is read, not silently absent",
    [out.text.producer.determination, ocrOf(out).engine], ["ocr", "Tesseract 5.3.4"]);
}
{
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
  ]);
  const out = await extractPdfStructure(bytes);
  t("no /Info at all: undetermined, NAMED as which absence it is",
    [out.text.producer.determination, out.text.producer.why], ["undetermined", "no_producer_metadata"]);
  t("and nothing is invented for it",
    [out.text.producer.producer, out.text.producer.creator, out.text.producer.ocr], [null, null, null]);
}
{
  /* A dangling /Info reference is an ABSENCE and must fall back rather than
     shadow a readable earlier candidate. */
  const bytes = pdf([
    CATALOG(1, "2 0 R"),
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
    { num: 4, body: "<< /Producer (OmniPage Ultimate 19) >>" },
  ], "trailer\n<< /Root 1 0 R /Info 4 0 R >>\ntrailer\n<< /Root 1 0 R /Info 77 0 R >>\n");
  const out = await extractPdfStructure(bytes);
  t("a dangling /Info reference falls back to the readable candidate instead of reporting no metadata",
    ocrOf(out).engine, "OmniPage Ultimate 19");
}


/* ------------------------------------------------------------------ *
 * D-481 — A LINE BREAKS WHEN THE BASELINE MOVES
 * ------------------------------------------------------------------ *
 * These fixtures are the two halves of one claim, and NEITHER ALONE IS THE
 * CLAIM. A reading that simply stopped emitting newlines would make the first
 * half green — its word count would rise, because a document's own spaces are
 * already among its glyphs — while destroying every real line in the document.
 * So the same block asserts that T*, a Td with ty != 0, a Tm at a different
 * baseline, ' and " ALL STILL BREAK, and that two runs at the SAME Tm under
 * DIFFERENT CTMs break too — the shape Oakland's Budget-Basics is written in.
 */

/* codes 01..08 -> H e l o SPACE w r d ; enough to spell two words */
const GLYPHS = cmap1(
  "8 beginbfchar\n<01> <0048>\n<02> <0065>\n<03> <006C>\n<04> <006F>\n" +
  "<05> <0020>\n<06> <0077>\n<07> <0072>\n<08> <0064>\nendbfchar");
/* "Hello world" written ONE Td PER GLYPH, every one with ty = 0 — the exact
   shape Oakland's Budget-Basics PDFs are written in (Skia/PDF, measured
   2026-09-24: 4,496 of 4,528 lines came out a single character long). */
const PER_GLYPH = "<01> Tj 8 0 Td <02> Tj 8 0 Td <03> Tj 8 0 Td <03> Tj 8 0 Td <04> Tj " +
                  "8 0 Td <05> Tj 8 0 Td <06> Tj 8 0 Td <04> Tj 8 0 Td <07> Tj 8 0 Td " +
                  "<03> Tj 8 0 Td <08> Tj";
const wordsOf = (s) => (s.match(/[^\s]+/g) || []).filter((w) => w.length >= 2);

console.log("\n--- D-481: a per-glyph-positioned line READS AS WORDS (a Td with ty=0 is not a line) ---");
{
  const bytes = textPdf({
    content: "BT /F1 12 Tf 72 700 Td " + PER_GLYPH + " ET",
    fontBody: SIMPLE_FONT, cmapBody: GLYPHS,
  });
  const out = await extractPdfStructure(bytes);
  t("eleven glyphs placed by eleven Td read as ONE line", out.text.document, "Hello world");
  t("and as WORDS, not characters — the figure the row is about", wordsOf(out.text.document).length, 2);
  /* A FLOOR that survives every control arm, so a run of them cannot all fail
     for the same uninteresting reason: the GLYPHS are ten non-space characters
     however the lines fall. counts.chars is the document LENGTH and moves with
     the newlines, which is why it is not the floor. */
  t("the fixture is non-empty: ten glyphs really did decode",
    out.text.document.replace(/\s/g, "").length, 10);
}

console.log("\n--- D-481 THE LIAR ARM: a real baseline move STILL breaks the line ---");
{
  /* Each arm is the SAME per-glyph line twice, separated by ONE real move. A
     reading that stopped breaking altogether would fail every arm here while
     passing the arm above — which is the whole reason both exist. */
  const twice = (mover) => textPdf({
    content: "BT /F1 12 Tf 14 TL 72 700 Td " + PER_GLYPH + " " + mover + " " + PER_GLYPH + " ET",
    fontBody: SIMPLE_FONT, cmapBody: GLYPHS,
  });
  const doc = async (mover) => (await extractPdfStructure(twice(mover))).text.document;
  t("T* breaks the line", await doc("T*"), "Hello world\nHello world");
  t("a Td with ty != 0 breaks the line", await doc("0 -14 Td"), "Hello world\nHello world");
  t("a TD with ty != 0 breaks the line", await doc("0 -14 TD"), "Hello world\nHello world");
  t("a Tm at a DIFFERENT baseline breaks the line", await doc("1 0 0 1 72 686 Tm"), "Hello world\nHello world");
  t("a Tm at the SAME baseline does NOT break it (a continuation run)",
    await doc("1 0 0 1 172 700 Tm"), "Hello worldHello world");
}

console.log("\n--- D-481: ' and \" still break, and move by their own leading ---");
{
  const bytes = textPdf({
    content: "BT /F1 12 Tf 14 TL 72 700 Td <01> Tj <02> ' 0 0 <03> \" ET",
    fontBody: SIMPLE_FONT, cmapBody: GLYPHS,
  });
  t("' and \" each start a new line", (await extractPdfStructure(bytes)).text.document, "H\ne\nl");
}

console.log("\n--- D-481: the SAME Tm under a DIFFERENT CTM is a DIFFERENT line ---");
{
  /* Budget-Basics gives every one of its lines the identical
     `1 0 0 -1 .015625 44 Tm` and separates them with `cm`. A reading that
     compared the text matrix alone would fuse a whole document into one line
     and count MORE words for it. */
  const bytes = textPdf({
    content: "q 1 0 0 1 0 700 cm BT /F1 12 Tf 1 0 0 1 0 0 Tm <01> Tj ET Q " +
             "q 1 0 0 1 0 680 cm BT /F1 12 Tf 1 0 0 1 0 0 Tm <02> Tj ET Q",
    fontBody: SIMPLE_FONT, cmapBody: GLYPHS,
  });
  t("two identical Tm under two cm read as two lines", (await extractPdfStructure(bytes)).text.document, "H\ne");
  const same = textPdf({
    content: "q 1 0 0 1 0 700 cm BT /F1 12 Tf 1 0 0 1 0 0 Tm <01> Tj ET Q " +
             "q 1 0 0 1 0 700 cm BT /F1 12 Tf 1 0 0 1 0 0 Tm <02> Tj ET Q",
    fontBody: SIMPLE_FONT, cmapBody: GLYPHS,
  });
  t("and under the SAME cm as one line", (await extractPdfStructure(same)).text.document, "He");
}

console.log("\n--- D-481 OVER-STRICTNESS: conventionally written text is unchanged ---");
{
  /* One Td per LINE — how most producers write — must read exactly as it read
     before this item. A fix that only knew the per-glyph shape would break it. */
  const bytes = textPdf({
    content: "BT /F1 12 Tf 72 700 Td <010203> Tj 0 -14 Td <040506> Tj 0 -14 Td <070801> Tj ET",
    fontBody: SIMPLE_FONT, cmapBody: GLYPHS,
  });
  t("three Td-separated lines stay three lines", (await extractPdfStructure(bytes)).text.document, "Hel\no w\nrdH");
  const tj = textPdf({
    content: "BT /F1 12 Tf 72 700 Td [(\\001)-250(\\002)] TJ ET",
    fontBody: SIMPLE_FONT, cmapBody: GLYPHS,
  });
  t("the TJ word-gap rule is untouched", (await extractPdfStructure(tj)).text.document, "H e");
}


/* ------------------------------------------------------------------ *
 * D-502 — THE PEN HAS A POSITION, SO A HORIZONTAL JUMP CAN BE JUDGED
 * ------------------------------------------------------------------ *
 * D-481 made a line break on a BASELINE move and stated what it cost: two runs
 * on ONE baseline separated only by a horizontal jump were CONCATENATED, with
 * nothing here able to tell that jump from a continuation, because no font's
 * advance widths were read. Measured on the Legistar agenda as `OaklandPrinted`
 * (M-133; 0.32% of that document's tokens).
 *
 * THE ARMS BELOW ARE THREE HALVES OF ONE CLAIM, and no one of them is it:
 *   (1) a real jump SPLITS — the row's subject;
 *   (2) a run that CONTINUES at the width-derived pen does NOT split — D-481's
 *       own per-glyph class, which a fix that split on any positioning operator
 *       would destroy while making (1) green;
 *   (3) the same fixture with a font that declares NO widths reads EXACTLY as
 *       D-481 left it — which is what says the split came from a width read out
 *       of the file and not from a threshold applied to a guess.
 * Every pen position below is derivable by hand: each glyph is 500/1000 em and
 * every fixture sets 10 pt, so one glyph is 5 pt and nothing here is a figure
 * taken on trust.
 */

/* Codes 01..08 are GLYPHS above (H e l o SPACE w r d). This font DECLARES their
   widths; SIMPLE_FONT, the same font without /Widths, is the control. */
const WIDTH_FONT = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /FirstChar 1 /LastChar 8 " +
                   "/Widths [500 500 500 500 500 500 500 500] /ToUnicode 6 0 R >>";
const HELLO = "<0102030304>";   // H e l l o   — 5 glyphs, 25 pt at 10 pt
const WORLD = "<0604070308>";   // w o r l d

const textOf = async (content, fontBody = WIDTH_FONT, cmapBody = GLYPHS) =>
  (await extractPdfStructure(textPdf({ content, fontBody, cmapBody }))).text.document;

console.log("\n--- D-502: two runs on ONE baseline, separated by a horizontal jump, are SPLIT ---");
{
  /* The pen ends at 72 + 5x5 = 97; the jump puts the next run at 272. That is
     175 pt at a 10 pt em — 17.5 ems — and no font has a 17-em space. */
  t("a 175 pt jump on a live baseline separates the two runs",
    await textOf("BT /F1 10 Tf 72 700 Td " + HELLO + " Tj 200 0 Td " + WORLD + " Tj ET"),
    "Hello world");
  t("...and it is still ONE line: the baseline never moved",
    (await textOf("BT /F1 10 Tf 72 700 Td " + HELLO + " Tj 200 0 Td " + WORLD + " Tj ET")).split("\n").length, 1);
  /* THE HALF THAT MAKES IT A FINDING ABOUT WIDTHS. Same content, same jump, a
     font that declares no /Widths: the pen is UNKNOWN, nothing is judged, and
     the reading is D-481's to the byte. A reader that split here would be
     splitting on a threshold over a width nobody read. */
  t("the SAME jump with a font that declares NO widths reads exactly as D-481 left it",
    await textOf("BT /F1 10 Tf 72 700 Td " + HELLO + " Tj 200 0 Td " + WORLD + " Tj ET", SIMPLE_FONT),
    "Helloworld");
}

console.log("\n--- D-502 THE LIAR ARM: a run that CONTINUES at the pen is NOT split ---");
{
  /* D-481's own subject, now with widths: ONE Td per glyph, each of exactly the
     glyph's 5 pt advance — Oakland's Budget-Basics shape. A reading that split
     on any positioning operator would score well on the arm above and turn this
     document back into a column of characters. The document's OWN space (code
     05) is the only separator, and the string is 11 characters. */
  const perGlyph = "<01> Tj 5 0 Td <02> Tj 5 0 Td <03> Tj 5 0 Td <03> Tj 5 0 Td <04> Tj 5 0 Td " +
                   "<05> Tj 5 0 Td <06> Tj 5 0 Td <04> Tj 5 0 Td <07> Tj 5 0 Td <03> Tj 5 0 Td <08> Tj";
  const got = await textOf("BT /F1 10 Tf 72 700 Td " + perGlyph + " ET");
  t("eleven glyphs each placed AT the pen read as one line and two words", got, "Hello world");
  t("the fixture is non-empty: ten non-space glyphs really did decode", got.replace(/\s/g, "").length, 10);
}

console.log("\n--- D-502: the threshold's own valley, measured at 0.25 em (M-141) ---");
{
  /* The pen is at 77 after one 5 pt glyph. 2 pt is 0.20 em and 3 pt is 0.30 em,
     which straddle the constant. The corpus measurement (M-141) puts 9 of 5,960
     jumps in (0.25, 0.45] and NONE in (0.375, 0.450], so the constant sits in a
     valley rather than at a preference — and the sweep says the reading moves
     by two tokens in 14,039 across a factor of thirty in this value, so these
     arms pin the RULE at its stated constant, never the constant as a finding. */
  t("a 0.20 em jump is a continuation", await textOf("BT /F1 10 Tf 72 700 Td <01> Tj 7 0 Td <02> Tj ET"), "He");
  /* AND THE FLOOR THE SWEEP FOUND, which is the only part of this constant that
     IS load-bearing: a tenth of a point — 0.01 em — is not a word gap. Measured
     on the corpus, a threshold of 0 reads it and every float-noise jump as one,
     and the same seven documents come back as 17,292 tokens with 4,578 of them
     a single character long. The synthetic arms above are written in exact
     arithmetic and cannot feel that; this one states the claim at a scale a
     fixture can hold exactly. */
  t("a 0.01 em jump is a continuation: float-scale noise is not a word gap",
    await textOf("BT /F1 10 Tf 72 700 Td <01> Tj 5.1 0 Td <02> Tj ET"), "He");
  t("a 0.30 em jump is a word gap", await textOf("BT /F1 10 Tf 72 700 Td <01> Tj 8 0 Td <02> Tj ET"), "H e");
  /* BACKWARDS is the same question: did the next run start where this one
     ended? Measured: of 185 backward jumps, 181 are ≤ 0.21 em and four ≥ 2.68. */
  t("a 0.20 em BACKWARD jump is a continuation (kerning, overprint)",
    await textOf("BT /F1 10 Tf 72 700 Td " + HELLO + " Tj 23 0 Td " + WORLD + " Tj ET"), "Helloworld");
  t("a 0.30 em BACKWARD jump is a new run",
    await textOf("BT /F1 10 Tf 72 700 Td " + HELLO + " Tj 22 0 Td " + WORLD + " Tj ET"), "Hello world");
}

console.log("\n--- D-502: the pen survives BT, ET, Q and cm — the Legistar shape ---");
{
  /* `legistar-73450` writes ONE `BT … ET` PER RUN, each under its own `cm`:
     `… cm BT 46 0 0 46 1053.309 94 Tm /TT4 1 Tf […] TJ ET Q q … cm BT 46 0 0 46
     1404.691 94 Tm …`. `BT` RESETS the text matrix, so a pen read off that
     matrix at the second `Tm` reads the text-space ORIGIN — measured on that
     document as gaps of ~1,200 ems before the pen was held in DEVICE space. */
  const twoBlocks = (tmX) =>
    "q 1 0 0 1 72 700 cm BT /F1 10 Tf 1 0 0 1 0 0 Tm " + HELLO + " Tj ET Q " +
    "q 1 0 0 1 72 700 cm BT /F1 10 Tf 1 0 0 1 " + tmX + " 0 Tm " + WORLD + " Tj ET Q";
  t("a second text object starting AT the pen continues the run", await textOf(twoBlocks("25")), "Helloworld");
  t("a second text object 200 pt away is a new run", await textOf(twoBlocks("200")), "Hello world");
}

console.log("\n--- D-502: where each width comes from, one arm per source ---");
{
  /* /FirstChar OFFSET AND /MissingWidth. Code 01 is BELOW /FirstChar 2, so its
     advance is the descriptor's /MissingWidth 1000 — 10 pt. The pen lands at
     82 and the jump to 84 is 0.20 em, a continuation. Read as /Widths[0] the
     pen would be at 77 and the same jump would be 0.70 em — a split. So this
     arm's PASS is the evidence that both were read. */
  const missing = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /FirstChar 2 /LastChar 3 " +
                  "/Widths [500 500] /FontDescriptor << /Type /FontDescriptor /MissingWidth 1000 >> " +
                  "/ToUnicode 6 0 R >>";
  t("a code below /FirstChar advances by the descriptor's /MissingWidth",
    await textOf("BT /F1 10 Tf 72 700 Td <01> Tj 12 0 Td <02> Tj ET", missing), "He");
  /* THE PAIR IS THE EVIDENCE, NOT EITHER ARM. The arm above asserts a
     CONTINUATION, and a reader with no widths at all continues too — measured:
     it PASSES under the control that ignores every width. Its companion, one
     point further, pins the pen from the other side, and 0.25 em at 10 pt is
     2.5 pt, so the two together place the pen within 2.5 pt of 82. */
  t("...and 1 pt further is a word gap, so the pen really is at /MissingWidth's 82",
    await textOf("BT /F1 10 Tf 72 700 Td <01> Tj 13 0 Td <02> Tj ET", missing), "H e");

  /* A TYPE3 FONT'S GLYPH SPACE IS ITS OWN. /FontMatrix [0.01 …] makes a width
     of 50 half a text-space unit — the same 5 pt — so the jump to 79 is 0.20 em.
     Read at the 1/1000 every other font uses it would be 0.05 units, the pen
     would be at 72.5, and the jump would be 0.65 em — a split. */
  const type3 = "<< /Type /Font /Subtype /Type3 /FontMatrix [0.01 0 0 0.01 0 0] /FontBBox [0 0 100 100] " +
                "/CharProcs << >> /Encoding << >> /FirstChar 1 /LastChar 2 /Widths [50 50] /ToUnicode 6 0 R >>";
  t("a Type3 font's widths are scaled by its own /FontMatrix, not by 1/1000",
    await textOf("BT /F1 10 Tf 72 700 Td <01> Tj 7 0 Td <02> Tj ET", type3), "He");
  t("...and 1 pt further is a word gap, so the pen really is at the /FontMatrix's 77",
    await textOf("BT /F1 10 Tf 72 700 Td <01> Tj 8 0 Td <02> Tj ET", type3), "H e");

  /* A COMPOSITE FONT: /W in both of its shapes, and /DW for a CID outside them.
     CIDs 1 and 2 are 500 from `1 [500 500]`; CIDs 3..4 are 500 from the range
     form; CID 5 is in neither, so it takes /DW 1000. */
  const cidFont = "<< /Type /Font /Subtype /Type0 /BaseFont /Test /Encoding /Identity-H /ToUnicode 6 0 R " +
    "/DescendantFonts [<< /Type /Font /Subtype /CIDFontType2 /BaseFont /Test " +
    "/CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> " +
    "/DW 1000 /W [1 [500 500] 3 4 500] >>] >>";
  const cidMap = cmap2("3 beginbfchar\n<0001> <0048>\n<0002> <0065>\n<0005> <006F>\nendbfchar");
  t("a /W entry in the `c [w …]` form advances the pen",
    await textOf("BT /F1 10 Tf 72 700 Td <0001> Tj 7 0 Td <0002> Tj ET", cidFont, cidMap), "He");
  t("...and 1 pt further is a word gap, so the arm above is not passing on a stuck pen",
    await textOf("BT /F1 10 Tf 72 700 Td <0001> Tj 8 0 Td <0002> Tj ET", cidFont, cidMap), "H e");
  t("a CID outside /W advances by /DW",
    await textOf("BT /F1 10 Tf 72 700 Td <0005> Tj 12 0 Td <0002> Tj ET", cidFont, cidMap), "oe");
  t("...and 1 pt further is a word gap, so the pen really is at /DW's 82",
    await textOf("BT /F1 10 Tf 72 700 Td <0005> Tj 13 0 Td <0002> Tj ET", cidFont, cidMap), "o e");
  /* A composite font whose /Encoding is NOT Identity has no code->CID mapping
     here, so it has NO widths and nothing is judged — the honest branch, and
     the reading is D-481's. */
  const cidOther = cidFont.replace("/Encoding /Identity-H", "/Encoding /UniJIS-UCS2-H");
  t("a composite font with a non-Identity /Encoding yields no widths, and no split",
    await textOf("BT /F1 10 Tf 72 700 Td <0001> Tj 200 0 Td <0002> Tj ET", cidOther, cidMap), "He");
}

console.log("\n--- D-502: the text-state parameters that move the pen ---");
{
  /* Tc adds to EVERY glyph's advance. With 2 pt of it the pen is at 79 and the
     jump to 81 is 0.20 em; without it the pen would be at 77 and the same jump
     0.40 em — a split. */
  t("Tc character spacing moves the pen",
    await textOf("BT /F1 10 Tf 2 Tc 72 700 Td <01> Tj 9 0 Td <02> Tj ET"), "He");
  t("...and 1 pt further is a word gap, so the pen really is at Tc's 79",
    await textOf("BT /F1 10 Tf 2 Tc 72 700 Td <01> Tj 10 0 Td <02> Tj ET"), "H e");
  /* Tw adds to the single-byte code 32 alone. This font starts at /FirstChar 32
     so code 32 is a real glyph in it: with 5 pt of word spacing the pen is at
     87 and the next run starts exactly there. */
  const spaceFont = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /FirstChar 32 /LastChar 34 " +
                    "/Widths [500 500 500] /ToUnicode 6 0 R >>";
  const spaceMap = cmap1("3 beginbfchar\n<20> <0020>\n<21> <0048>\n<22> <0065>\nendbfchar");
  t("Tw word spacing moves the pen over code 32",
    await textOf("BT /F1 10 Tf 5 Tw 72 700 Td <2021> Tj 15 0 Td <22> Tj ET", spaceFont, spaceMap), " He");
  t("...and without the Tw the same jump is a word gap, so the arm above is real",
    await textOf("BT /F1 10 Tf 72 700 Td <2021> Tj 15 0 Td <22> Tj ET", spaceFont, spaceMap), " H e");
}

console.log("\n--- D-502 OVER-STRICTNESS: D-481's own arms, re-run with widths declared ---");
{
  /* Every shape D-481 pinned, with a font that DOES declare its widths, so the
     gap rule is live on all of them. A break policy that fired on a positioning
     operator rather than on a distance would show here. */
  const twice = (mover) => "BT /F1 10 Tf 14 TL 72 700 Td " + HELLO + " Tj " + mover + " " + HELLO + " Tj ET";
  t("T* still breaks the line", await textOf(twice("T*")), "Hello\nHello");
  t("a Td with ty != 0 still breaks the line", await textOf(twice("0 -14 Td")), "Hello\nHello");
  t("a Tm at a DIFFERENT baseline still breaks the line", await textOf(twice("1 0 0 1 72 686 Tm")), "Hello\nHello");
  t("three Td-separated lines stay three lines",
    await textOf("BT /F1 10 Tf 72 700 Td <010203> Tj 0 -14 Td <040506> Tj 0 -14 Td <070801> Tj ET"),
    "Hel\no w\nrdH");
  t("the TJ word-gap rule is untouched",
    await textOf("BT /F1 10 Tf 72 700 Td [(\\001)-250(\\002)] TJ ET"), "H e");
}

console.log("\n--- D-502 ON THE REAL AGENDA: the token M-133 named is gone, and nothing else moved ---");
{
  /* The committed Legistar agenda writes its footer
     `(City of Oakland) Tj 391.1 0 Td (Printed on 7/15/2026   5:26:26PM) Tj` —
     one baseline, a 391.1 pt jump, and the glue M-133 counted. Measured on this
     file, D-481 -> D-502: lower->upper glue tokens 43 -> 11, words 8,489 ->
     8,538, LINES 1,495 -> 1,495 and non-whitespace characters 51,060 -> 51,060.
     Nothing was decoded that was not decoded before; runs were separated. */
  const agenda = await extractPdfStructure(
    new Uint8Array(readFileSync(new URL("./fixtures/legistar-agenda-1425405.pdf", import.meta.url))));
  const doc = agenda.text.document;
  t("the fixture really is the agenda: 33 pages and 51,060 non-whitespace characters",
    [agenda.pages, doc.replace(/\s/g, "").length], [33, 51060]);
  t("`OaklandPrinted` — the token M-133 named — does not occur", /OaklandPrinted/.test(doc), false);
  t("...and the two runs it was made of are both there, separated",
    /City of Oakland Printed on /.test(doc), true);
  t("no line was gained or lost: 1,495, exactly as D-481 left it", doc.split("\n").length, 1495);
  t("the lower->upper glue count fell 43 -> 11, and the 11 are the document's own words",
    (doc.match(/[^\s]+/g) || []).filter((w) => /[a-z][A-Z]/.test(w)).length, 11);
}

console.log(`\npdfstructure: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
