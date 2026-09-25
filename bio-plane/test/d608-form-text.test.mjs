/* NEGATIVE CONTROL: three arms, each ALONE on `src/pdfstructure.mjs`, restored from a per-arm pristine copy and verified by sha256 AND cmp (M-174 records the run). (a) `nodescend` — `paintForm` returns before reading any form -> the FORM ARM, NESTED, INHERITED RESOURCES, CYCLE, DEPTH, UNDECODABLE FORM and REAL PAGE assertions fail by name, while NO FORM and IMAGE-ONLY DO hold (and TEXT STATE RESTORED holds too, correctly: with no descent nothing can leak). (b) `leakstate` — the form's font is not restored on return -> FORM ARM and TEXT STATE RESTORED fail (`tail`). (c) `notdbase` — `Td` with ty 0 stops asking the device baseline -> FORM ARM, NESTED and INHERITED RESOURCES fail (the form's first line glued to the page's). */

/* D-608 — TIER 1 READS TEXT INSIDE FORM XOBJECTS, AND SAYS WHAT IT COULD NOT.
 *
 * THE DEFECT, MEASURED (M-166): `extractPageText` interpreted no `Do`, so text
 * a page draws through a Form XObject went unread and no marker said so. ACFR
 * FY2023-24 page index 38 read 80 glyphs at tier 1 (its running header) and 546
 * at tier 2 (the header plus both pie charts' labels), with 34 of its 40
 * text-show operators inside forms. The page read as fully decoded.
 *
 * WHAT EACH SECTION DRIVES:
 *   0. a synthetic PDF built HERE, whose every expected string is written in
 *      this file: form text read in painting order, a nested form, a form that
 *      inherits the page's resources, the text state restored after the form,
 *      and the three things the walk cannot enter (a cycle, nesting past the
 *      depth limit, an undecodable form stream), each a NAMED, COUNTED marker;
 *   1. the real page, committed (`fixtures/d608/`, PROVENANCE.md there), which
 *      must read what tier 2 reads (546 glyphs) and the labels it was missing;
 *   2. OVER-STRICTNESS: a page with no form and a `Do` of an image are read
 *      exactly as before, with no marker.
 */
import "./stdio.mjs";                 /* D-282 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { extractPdfStructure } from "../src/pdfstructure.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const FIX = (f) => new Uint8Array(readFileSync(fileURLToPath(new URL(`./fixtures/${f}`, import.meta.url))));
const glyphs = (s) => { let n = 0; for (const ch of s) if (!/\s/u.test(ch)) n++; return n; };

/* ---- a tiny PDF assembler (cpdf18's; the reader scans top-level objects) ---- */
function pdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"));
      chunks.push(o.stream);
      chunks.push(Buffer.from("\nendstream\n", "latin1"));
    } else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
const stream = (num, dict, s) => {
  const buf = Buffer.from(s, "latin1");
  return { num, head: `<< ${dict} /Length ${buf.length} >>`, stream: buf };
};
const cmap = (body) => `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
1 begincodespacerange <00> <FF> endcodespacerange
${body}
endcmap CMapName currentdict /CMap defineresource pop end end`;

/* ================= THE GROUND TRUTH ======================================= *
 * TWO FONTS WHOSE CMAPS DISAGREE, so which one decoded a string is visible in
 * the text: F1 maps ASCII to itself; F2 maps the capitals to LOWER case. The
 * form selects F2 from its OWN resources and the page never re-selects F1 after
 * it, so a form whose text state leaked back would turn the page's TAIL into
 * `tail`.                                                                     */
const F1 = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 20 0 R >>";
const F2 = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier /ToUnicode 21 0 R >>";
const PAGES = [
  // p0 — the FORM ARM, the nested form, the text state restored
  "BT /F1 12 Tf 72 720 Td (PAGE HEAD) Tj ET q 1 0 0 1 72 600 cm /Fm1 Do Q BT 72 500 Td (TAIL) Tj ET",
  // p1 — a form with NO /Resources inherits the page's (the image walk's fallback)
  "BT /F1 12 Tf 72 720 Td (TOP) Tj ET q 1 0 0 1 72 600 cm /Fm3 Do Q",
  // p2 — a form that paints ITSELF: read once, the re-entry counted, not walked
  "BT /F1 12 Tf 72 720 Td (ABOVE) Tj ET /Fm4 Do",
  // p3 — a chain of nine nested forms: the ninth is past FORM_DEPTH_LIMIT (8)
  "BT /F1 12 Tf 72 720 Td (DEEP) Tj ET /Dp1 Do",
  // p4 — a form whose stream this reader cannot decode
  "BT /F1 12 Tf 72 720 Td (LEFT) Tj ET /Fm5 Do",
  // p5 — OVER-STRICTNESS: no form at all
  "BT /F1 12 Tf 72 720 Td (PLAIN PAGE) Tj ET",
  // p6 — OVER-STRICTNESS: a `Do` that paints an IMAGE, and a `Do` naming nothing
  "BT /F1 12 Tf 72 720 Td (PICTURE) Tj ET q 10 0 0 10 0 0 cm /Im1 Do Q /Nothing Do",
];
const WANT_TEXT = [
  "PAGE HEAD\nform label\ninner line\nTAIL",
  "TOP\nINHERITED",
  "ABOVE\nLOOP",
  "DEEP\nD1\nD2\nD3\nD4\nD5\nD6\nD7\nD8",
  "LEFT",
  "PLAIN PAGE",
  "PICTURE",
];
const pageObjs = PAGES.map((c, i) => ({
  num: 3 + i,
  body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 22 0 R >> `
      + `/XObject << /Fm1 30 0 R /Fm3 32 0 R /Fm4 33 0 R /Dp1 41 0 R /Fm5 34 0 R /Im1 35 0 R >> >> /Contents ${60 + i} 0 R >>`,
}));
/* The depth chain: Dp1 … Dp9 (objects 41…49). Dp_k shows `D<k>` and paints
   Dp_{k+1}. Dp1 is walked at depth 0, so Dp9 is reached at depth 8 = the limit
   and is NOT walked: its one text run (`D9`, 2 bytes) is the counted marker. */
const depthChain = [];
for (let k = 1; k <= 9; k++) {
  const next = k < 9 ? ` /Dp${k + 1} Do` : "";
  const xo = k < 9 ? `/XObject << /Dp${k + 1} ${41 + k} 0 R >> ` : "";
  depthChain.push(stream(40 + k, `/Type /XObject /Subtype /Form /BBox [0 0 600 800] /Matrix [1 0 0 1 0 -10] `
    + `/Resources << /Font << /F1 22 0 R >> ${xo}>>`, `BT /F1 10 Tf 72 700 Td (D${k}) Tj ET${next}`));
}
const SYNTH = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: `<< /Type /Pages /Kids [${pageObjs.map((p) => `${p.num} 0 R`).join(" ")}] /Count ${pageObjs.length} >>` },
  ...pageObjs,
  stream(20, "", cmap("1 beginbfrange <20> <7E> <0020> endbfrange")),
  stream(21, "", cmap("1 beginbfchar <20> <0020> endbfchar\n1 beginbfrange <41> <5A> <0061> endbfrange")),
  { num: 22, body: F1 },
  { num: 23, body: F2 },
  // Fm1: its OWN font F2 (lower case), then a nested form Fm2 one line down
  stream(30, "/Type /XObject /Subtype /Form /BBox [0 0 300 100] /Matrix [1 0 0 1 0 0] "
    + "/Resources << /Font << /F2 23 0 R >> /XObject << /Fm2 31 0 R >> >>",
    "BT /F2 10 Tf 0 0 Td (FORM LABEL) Tj ET q 1 0 0 1 0 -40 cm /Fm2 Do Q"),
  stream(31, "/Type /XObject /Subtype /Form /BBox [0 0 300 100] /Resources << /Font << /F2 23 0 R >> >>",
    "BT /F2 10 Tf 0 0 Td (INNER LINE) Tj ET"),
  // Fm3: no /Resources at all — F1 must resolve through the page
  stream(32, "/Type /XObject /Subtype /Form /BBox [0 0 300 100]", "BT /F1 10 Tf 0 0 Td (INHERITED) Tj ET"),
  // Fm4: paints itself
  stream(33, "/Type /XObject /Subtype /Form /BBox [0 0 300 100] /Resources << /Font << /F1 22 0 R >> /XObject << /Fm4 33 0 R >> >>",
    "BT /F1 10 Tf 72 600 Td (LOOP) Tj ET /Fm4 Do"),
  // Fm5: a filter this reader does not decode
  stream(34, "/Type /XObject /Subtype /Form /BBox [0 0 300 100] /Filter /LZWDecode", "not really lzw"),
  { num: 35, head: "<< /Type /XObject /Subtype /Image /Width 1 /Height 1 /ColorSpace /DeviceGray /BitsPerComponent 8 /Length 1 >>", stream: Buffer.from([0x80]) },
  ...depthChain,
  ...PAGES.map((c, i) => stream(60 + i, "", c)),
]);

/* ===================== 0. THE SYNTHETIC PAGES ============================ */
console.log("--- 0. text a page draws through a Form XObject is read, in painting order ---");
const st = await extractPdfStructure(SYNTH);
const pg = (i) => st.text.pages[i];
const reasons = (i) => pg(i).undetermined.map((m) => [m.reason, m.count]);
t("FORM ARM: the page's own text, then the form's (in the form's OWN font), then the page again — "
  + "nothing of the form was read before D-608", pg(0).text, WANT_TEXT[0]);
t("    a NESTED form is read too, on its own line (its `cm` moved the baseline)",
  pg(0).text.split("\n").includes("inner line"), true);
t("    TEXT STATE RESTORED: the page's TAIL decodes in F1 after the form selected F2 — `tail` would be a leak",
  pg(0).text.endsWith("\nTAIL"), true);
t("    and the page carries no marker: everything it painted was read", reasons(0), []);
t("INHERITED RESOURCES: a form with no /Resources resolves its font through the page",
  [pg(1).text, reasons(1)], [WANT_TEXT[1], []]);
t("CYCLE: a form that paints itself is read ONCE; the re-entry is not walked and is COUNTED "
  + "(`form_text_unread`, 4 bytes of `LOOP`)", [pg(2).text, reasons(2)], [WANT_TEXT[2], [["form_text_unread", 4]]]);
t("DEPTH: eight nested forms are read; the ninth, past FORM_DEPTH_LIMIT, is COUNTED "
  + "(`form_text_unread`, 2 bytes of `D9`), never silently dropped", [pg(3).text, reasons(3)], [WANT_TEXT[3], [["form_text_unread", 2]]]);
t("UNDECODABLE FORM: `form_stream_undecodable`, count 0 — whether it held text is undetermined, "
  + "and a figure for it would be invented", [pg(4).text, reasons(4)], [WANT_TEXT[4], [["form_stream_undecodable", 0]]]);
t("    and the document says it met one", st.notes?.includes?.("form_stream_undecodable") ?? JSON.stringify(st).includes("form_stream_undecodable"), true);

/* ===================== 1. THE REAL PAGE ================================== */
console.log("\n--- 1. ACFR FY2023-24, page index 38 (M-166), committed as a one-page extract ---");
const acfr = await extractPdfStructure(FIX("d608/acfr-fy2023-24-p39.pdf"));
const p = acfr.text.pages[0];
console.log(`  (fixture: ${acfr.pages} page, tier 1 reads ${glyphs(p.text)} glyphs)`);
t("the fixture is the one page, and it is not empty", [acfr.pages, glyphs(p.text) > 0], [1, true]);
t("REAL PAGE: tier 1 reads 546 glyphs — tier 2's count (M-166) — where it read 80, the running header alone",
  glyphs(p.text), 546);
t("    the pie charts' labels, which live in Form XObjects, are in the text",
  ["Revenues By Source - Governmental Activities", "Property taxes", "Public Safety", "Interest on Long-Term Debt"]
    .map((s) => p.text.includes(s)), [true, true, true, true]);
t("    the running header the page drew itself is still there", p.text.includes("Management’s Discussion and Analysis"), true);
t("    and nothing on the page is marked unread", p.undetermined, []);

/* ===================== 2. OVER-STRICTNESS ================================ */
console.log("\n--- 2. what has no form is read exactly as before ---");
t("NO FORM: a page with no `Do` reads its text and nothing else", [pg(5).text, reasons(5)], [WANT_TEXT[5], []]);
t("IMAGE-ONLY DO: a `Do` of an image, and a `Do` naming nothing, add no text and no marker",
  [pg(6).text, reasons(6)], [WANT_TEXT[6], []]);
const sha = (v) => createHash("sha256").update(v).digest("hex");
console.log(`  (synthetic document text sha256 ${sha(st.text.document)})`);

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
