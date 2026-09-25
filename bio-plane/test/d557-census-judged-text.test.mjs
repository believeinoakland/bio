/* NEGATIVE CONTROL: RUN 2026-09-25 through `node test/nc-d557.mjs` from `bio-plane/` — see the driver's RESULTS for the figures. (a) baseline, nothing armed -> green. (b) plain, the row's own: the census judges the PLAIN `op=pdfstructure` answer again -> the TIER-3 arm fails BY NAME (the tier-3 text judged reads empty), and the over-strictness arm on the tier-1 document stays green. (c) texttier, the label read off the document's `text_tier` again -> the label arm fails.
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
 *
 * WHAT IT CANNOT SEE: the member transcribes ONE page per acquire (D-606, unbuilt), so a multi-page scan's
 * "tier-3 text" is its first scanned page; a page of pure whitespace is not a unit (D-531) and so is never
 * judged; the Python caller's own use of the label (`plane_text`) is not run here — it reads the row's
 * `judged.reader`, which is what this suite asserts.
 */
import "./stdio.mjs";                 /* D-282 */
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

/* ---- one run of the instrument, as its caller runs it ---- */
const pen = mkdtempSync(join(tmpdir(), "d557-census-"));
const docs = [{ key: "d557/scan-ccitt-g4-page.pdf", bytes: SCAN }, { key: "d557/born-digital.pdf", bytes: TEXT }];
const man = docs.map((d) => ({ key: d.key, sha: sha(d.bytes), bytes: d.bytes.length }));
mkdirSync(join(pen, "pdf")); mkdirSync(join(pen, "txt"));
for (const d of docs) writeFileSync(join(pen, "pdf", `${sha(d.bytes)}.pdf`), d.bytes);
writeFileSync(join(pen, "man.json"), JSON.stringify(man));
let rows = [];
try {
  const r = spawnSync(process.execPath, [SCRIPT, join(pen, "man.json"), join(pen, "pdf"), join(pen, "out.json")],
    { cwd: ROOT, encoding: "utf8", env: { ...process.env, FW20_TEXT_DIR: join(pen, "txt") }, maxBuffer: 64 << 20,
      timeout: 240_000 });
  console.log(`\n-- the instrument ran: exit ${r.status}, ${String(r.stdout || "").split("\n").filter((l) => l.startsWith("CENSUS")).join("") || "NO CENSUS LINE"}`);
  if (r.status !== 0) console.log(String(r.stderr || "").slice(-1500));
  t("the census instrument exits 0 over the two documents", r.status, 0);
  rows = existsSync(join(pen, "out.json")) ? JSON.parse(readFileSync(join(pen, "out.json"), "utf8")) : [];
  t("it wrote one row per document (the corpus is not empty)", rows.length, 2);
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

  /* ---- 3. THE ROW'S TOTALITY: no document is labelled tier 3 unless tier-3 text was judged ---- */
  console.log("\n-- 3. every row");
  const lies = rows.filter((x) => /tier[^)]*3/.test((x.judged && x.judged.reader) || "")
                              && !((txt(x, "txt") || "").trim().length && x.judged.tiers.includes(3)));
  t(`NO ROW IS LABELLED TIER 3 UNLESS TIER-3 TEXT WAS JUDGED (${rows.length} rows)`, lies.map((x) => x.key), []);
} finally {
  rmSync(pen, { recursive: true, force: true });
}
footReached = true;
console.log(`\nd557: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
