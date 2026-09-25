/* NEGATIVE CONTROL: RUN 2026-09-25 through `node test/nc-d557.mjs` from `bio-plane/` — 3 arms, 0 not as declared, each DECLARED BEFORE ARMING and armed ALONE, `scripts/fw20-decode-census.mjs` restored by sha256 AND byte comparison (11,402 B, 0619c81f…). (a) baseline, nothing armed -> green 17/0. (b) plain, the row's own: the census judges the PLAIN `op=pdfstructure` answer again -> 13/4, the TIER-3 arm fails BY NAME ("TIER-3 TEXT JUDGED: the scanned page's judged text is its OCR text, not empty"), with the digest arm, the mixed document's both-pages arm and the every-row arm; the born-digital page's arms stay green. (c) texttier, the label read off the document's `text_tier` again -> 16/1, exactly THE MIXED LABEL arm.
 *
 * d557-census-judged-text.test.mjs — D-557. THE DECODE CENSUS JUDGES THE TEXT THE READING CLASSIFIED, AND
 * ITS READER LABEL NAMES A TIER ONLY WHEN THAT TIER'S TEXT WAS JUDGED.
 *
 * The measured failure is M-152's: `bio-plane/scripts/fw20-decode-census.mjs` handed the census the PLAIN
 * `op=pdfstructure` text, which stops at tier 2, while the label was read off the acquire reading's
 * `text_tier` — so 34 of 38 documents labelled "plane (text tier 3)" were judged on EMPTY text while their
 * OCR text existed. The design is `BIO_Content_Framework_v0_10.md` Part II §16 ("Reading provenance"): a
 * reading carries the tier and member of each page and a SHA-256 of the exact text it classified.
 *
 * THE INSTRUMENT IS DRIVEN WHOLE, as `tools/m032-class-census.py` drives it: the committed script, as a
 * child process, over a manifest and a directory of PDFs, with `FW20_TEXT_DIR` set — the real plane, the
 * committed pdf-worker bundle and the REAL OCR member (`ocr-worker/test/memberworker.mjs`) in miniflare.
 * Two documents:
 *   (1) THE REAL SCANNED PAGE, `pdf-worker/test/fixtures/scan-ccitt-g4-page.pdf` (page 2 of Oakland
 *       Legistar attachment 15721260, CPDF-10's) — image-only, read at tier 3 by the acquire.
 *   (2) A BORN-DIGITAL PAGE with a ToUnicode text layer — tier 1, the over-strictness arm: a document that
 *       never needed OCR is judged on its own text and labelled tier 1, exactly as before.
 *   (3) A MIXED DOCUMENT — a text page, then the real scanned page lifted byte for byte from (1): M-152's
 *       "other four", where the document-level `text_tier` is one number for two tiers of text.
 *
 * WHAT IT CANNOT SEE: the member transcribes ONE page per acquire (D-606, unbuilt), so a multi-page scan's
 * "tier-3 text" is its first scanned page; a page of pure whitespace is not a unit (D-531) and so is never
 * judged; the Python caller's own use of the label (`plane_text`) is not run here — it reads the row's
 * `judged.reader`, which is what this suite asserts.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { budgetAssert } from "./budget.mjs";   /* M0-107 */

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SCRIPT = fileURLToPath(new URL("../scripts/fw20-decode-census.mjs", import.meta.url));
const SCAN = readFileSync(fileURLToPath(new URL("../../pdf-worker/test/fixtures/scan-ccitt-g4-page.pdf", import.meta.url)));

let pass = 0, fail = 0, footReached = false;
process.on("exit", () => {
  if (!footReached) console.log(`\nd557: ${pass} passed, ${fail + 1} failed — SUITE ENDED BEFORE ITS OWN FOOT`);
});
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* ---- the born-digital fixture (d536-reading-provenance.test.mjs's assembler) ---- */
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
  return Buffer.concat(chunks);
}
function textPdf(lines) {
  const content = "BT /F1 10 Tf " + lines.map((l, i) => (i ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET";
  const cbuf = Buffer.from(content, "latin1");
  const cmap = `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`;
  const mbuf = Buffer.from(cmap, "latin1");
  return pdf([
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
    { num: 4, head: `<< /Length ${cbuf.length} >>`, stream: cbuf },
    { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>" },
    { num: 6, head: `<< /Length ${mbuf.length} >>`, stream: mbuf },
  ]);
}
const TEXT = textPdf(["City of Oakland", "Office of the City Clerk", "Staff Directory",
                      "Planning and Building Department", "Main line 510-238-3911"]);
/* THE MIXED DOCUMENT — M-152's other four: a text page, then the REAL scanned page, its CCITT stream and
   dictionary lifted byte for byte out of the fixture. The acquire reads page 1 at tier 1 and page 2 at tier
   3, and the document-level `text_tier` is ONE number for both — the case a label read off it misstates. */
function streamOf(buf, num) {
  const at = buf.indexOf(Buffer.from(`${num} 0 obj`, "latin1"));
  const s0 = buf.indexOf(Buffer.from("stream", "latin1"), at);
  const head = buf.subarray(at + `${num} 0 obj`.length, s0).toString("latin1").trim();
  let d = s0 + "stream".length; if (buf[d] === 0x0d) d++; if (buf[d] === 0x0a) d++;
  const len = Number(/\/Length (\d+)/.exec(head)[1]);
  return { head, stream: buf.subarray(d, d + len) };
}
function mixedPdf() {
  const img = streamOf(SCAN, 5);
  const t = Buffer.from("BT /F1 10 Tf (City of Oakland) Tj 0 -12 Td (Office of the City Clerk) Tj 0 -12 Td "
                      + "(Resolution cover sheet) Tj ET", "latin1");
  const scanContent = Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1");
  const cmap = Buffer.from(`/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`, "latin1");
  return pdf([
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R 7 0 R] /Count 2 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
    { num: 4, head: `<< /Length ${t.length} >>`, stream: t },
    { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>" },
    { num: 6, head: `<< /Length ${cmap.length} >>`, stream: cmap },
    { num: 7, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Rotate 270 /Resources << /XObject << /Im0 9 0 R >> >> /Contents 8 0 R >>" },
    { num: 8, head: `<< /Length ${scanContent.length} >>`, stream: scanContent },
    { num: 9, head: img.head, stream: img.stream },
  ]);
}
const MIXED = mixedPdf();

/* ---- one run of the instrument, as its caller runs it ---- */
const pen = mkdtempSync(join(tmpdir(), "d557-census-"));
const docs = [{ key: "d557/scan-ccitt-g4-page.pdf", bytes: SCAN }, { key: "d557/born-digital.pdf", bytes: TEXT },
              { key: "d557/mixed-text-then-scan.pdf", bytes: MIXED }];
const man = docs.map((d) => ({ key: d.key, sha: sha(d.bytes), bytes: d.bytes.length }));
mkdirSync(join(pen, "pdf")); mkdirSync(join(pen, "txt"));
for (const d of docs) writeFileSync(join(pen, "pdf", `${sha(d.bytes)}.pdf`), d.bytes);
writeFileSync(join(pen, "man.json"), JSON.stringify(man));
const BUDGET_MS = 240_000;
let rows = [];
try {
  const r = spawnSync(process.execPath, [SCRIPT, join(pen, "man.json"), join(pen, "pdf"), join(pen, "out.json")],
    { cwd: ROOT, encoding: "utf8", env: { ...process.env, FW20_TEXT_DIR: join(pen, "txt") }, maxBuffer: 64 << 20,
      timeout: BUDGET_MS });
  console.log(`\n-- the instrument ran: exit ${r.status}, ${String(r.stdout || "").split("\n").filter((l) => l.startsWith("CENSUS")).join("") || "NO CENSUS LINE"}`);
  if (r.status !== 0) console.log(String(r.stderr || "").slice(-1500));
  /* M0-107: an expired budget measured nothing — every arm below is skipped, never read as a finding. */
  if (budgetAssert(t, "the census instrument over the three documents", r, BUDGET_MS,
                   "every arm of this suite (the instrument was killed before it wrote its rows)")) {
  t("the census instrument exits 0 over the three documents", r.status, 0);
  rows = existsSync(join(pen, "out.json")) ? JSON.parse(readFileSync(join(pen, "out.json"), "utf8")) : [];
  t("it wrote one row per document (the corpus is not empty)", rows.length, docs.length);
  const txt = (row, ext) => { const p = join(pen, "txt", `${row.sha}.${ext}`);
    return existsSync(p) ? readFileSync(p, "utf8") : null; };

  /* ---- 1. THE SCANNED PAGE: read at tier 3, and judged on its tier-3 text ---- */
  console.log("\n-- 1. the scanned page");
  const scan = rows.find((x) => x.key === docs[0].key) || {};
  t("PRECONDITION: the acquire read the scanned page at tier 3 (text_tier 3)", scan.text_tier, 3);
  t("M-152's defect is a fact about the PLAIN answer, still: op=pdfstructure without ocr=1 serves it no text",
    [scan.plain_chars, (txt(scan, "plain.txt") || "").trim().length], [0, 0]);
  const judged = txt(scan, "txt") || "";
  t("TIER-3 TEXT JUDGED: the scanned page's judged text is its OCR text, not empty",
    judged.trim().length > 200, true);
  t("the judged text IS the text the reading classified: its SHA-256 equals the reading's own text_sha256",
    [sha(judged), scan.judged && scan.judged.matches_reading],
    [scan.reading_provenance && scan.reading_provenance.text_sha256, true]);
  t("THE LABEL COMES FROM THE PRODUCERS of the pages judged: tier 3 on ocr-worker, page 1",
    scan.judged && { reader: scan.judged.reader, producers: scan.judged.producers.map((p) => [p.tier, p.member, p.pages]) },
    { reader: "plane (text tier 3)", producers: [[3, "ocr-worker", [0]]] });
  t("the OCR engine that read the page is named on the judged producer",
    !!(scan.judged && scan.judged.producers[0] && /tesseract/.test(scan.judged.producers[0].engine || "")), true);

  /* ---- 2. THE OVER-STRICTNESS ARM: a born-digital page is judged and labelled exactly as before ---- */
  console.log("\n-- 2. the born-digital page (over-strictness)");
  const born = rows.find((x) => x.key === docs[1].key) || {};
  const bjudged = txt(born, "txt") || "";
  t("the born-digital page is judged on its own text layer", /Staff Directory/.test(bjudged), true);
  t("and it is labelled tier 1 by the plane, from its producer", born.judged && born.judged.reader, "plane (text tier 1)");
  t("its judged text and its plain answer agree (tier 1 needs no OCR, so nothing moved)",
    bjudged.trim(), (txt(born, "plain.txt") || "").trim());

  /* ---- 3. THE MIXED DOCUMENT: two tiers judged, and the label names both ---- */
  console.log("\n-- 3. the mixed document (a text page, then the scanned page)");
  const mixed = rows.find((x) => x.key === docs[2].key) || {};
  const mjudged = txt(mixed, "txt") || "";
  const mpages = mjudged.split("\n\f\n");
  t("both pages are judged: the text page's own layer AND the scanned page's OCR text",
    [mpages.length, /Resolution cover sheet/.test(mpages[0] || ""), (mpages[1] || "").trim().length > 200], [2, true, true]);
  t("the plain answer holds the text page only (the scanned page is empty in it)",
    (txt(mixed, "plain.txt") || "").split("\n\f\n").map((p) => p.trim().length > 0), [true, false]);
  t("THE MIXED LABEL names both tiers from the per-page producers, not the one document-level text_tier",
    mixed.judged && { reader: mixed.judged.reader, producers: mixed.judged.producers.map((p) => [p.tier, p.member, p.pages]) },
    { reader: "plane (text tier 1+3)", producers: [[1, "plane", [0]], [3, "ocr-worker", [1]]] });
  t("and the judged text is the reading's own, by SHA-256", mixed.judged && mixed.judged.matches_reading, true);

  /* ---- 4. THE ROW'S TOTALITY: no document is labelled tier 3 unless tier-3 text was judged ---- */
  console.log("\n-- 4. every row");
  const lies = rows.filter((x) => /tier[^)]*3/.test((x.judged && x.judged.reader) || "")
                              && !((txt(x, "txt") || "").trim().length && x.judged.tiers.includes(3)));
  t(`NO ROW IS LABELLED TIER 3 UNLESS TIER-3 TEXT WAS JUDGED (${rows.length} rows)`, lies.map((x) => x.key), []);
  }
} finally {
  rmSync(pen, { recursive: true, force: true });
}
footReached = true;
console.log(`\nd557: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
