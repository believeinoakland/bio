/* reading-pipeline: the tier-2 wire and the two merges' chain at `read` and `tier2Escalate`, converted from
   `test/tier2-wire.test.mjs` (REC-98) and `test/tier3-layer-parts.test.mjs` (REC-102, D-372, D-514, D-607), the share
   of `build/jobs/T17/legacy-tests.md`'s two rows that is this module's; moved from `extraction` (N513), its assertions
   unchanged. `extraction` keeps the arms through `op=pdfstructure` (its R31). `read` runs over stored bytes with the
   real tier-1 `pdf` entry: the committed CPDF-20 PDFs with the real `pdf-worker` member bound to its own `fetch` (as
   staffdirectory.test.mjs binds it), and synthesised PDFs in the page shapes the class needs with scripted members.
   Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fresh, hold, doc, member, ocrAnswer, i2 } from "./fixture.mjs";
import pdfWorker from "../../../../pdf-worker/src/index.mjs";
import { getFormat } from "../../../src/formats.mjs";
import { mergeTier2Text, tier2Note, glyphCount } from "../../../src/textchain.mjs";
import { tier2Escalate, decodeView, LAYER_FIDELITY_SOURCE, NAMED_ENGINE_SOURCE } from "../../../src/reading-pipeline/index.mjs";

const CPDF20 = (f) => new Uint8Array(readFileSync(new URL(`../../fixtures/cpdf20/${f}`, import.meta.url)));
const MIXED = CPDF20("legistar-73545.pdf");     // 7 pages: 0-5 to tier 2, 6 kept at tier 1
const CLEAN = CPDF20("legistar-73450.pdf");     // fully decodable: never escalates
const RECOVERS = CPDF20("legistar-73550.pdf");  // all three pages to tier 2
const DEGRADES = CPDF20("legistar-73618.pdf");  // CPDF-20's page; tier 1 reads it, so it never escalates

/* The real member over the store's evidence bucket; each call's body and answer recorded. */
function realMember(w) {
  const calls = [];
  return { calls, async fetch(url, init) {
    const res = await pdfWorker.fetch(new Request(url, init), { CAPTURES: w.evidence, VERSION: "test" });
    calls.push({ body: JSON.parse(init.body), answer: await res.clone().json() });
    return res;
  } };
}
const tier1 = async (bytes) => (await getFormat("pdf").structure(bytes)).text;
const readPdf = async (w, bytes, env) => {
  const d = await hold(w.evidence, bytes);
  return (await w.read(doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" }), { env, storeName: "bio" })).reading;
};
const layer = (tier, pages) => ({ step: "layer", tier, container: "pdf", cap: null, measured_by: LAYER_FIDELITY_SOURCE, calibration: null,
                                  ...(pages ? { extent: { kind: "pages", pages } } : {}) });
const TIER2_WORDS = /tier-2 decoder|merge of two decodes|tier2_/;

/* ---------------------------------------------------------------- tier2-wire.test.mjs (REC-98) */

test("R3 R10 R11 (tier2-wire): the reading of the mixed legistar-73545 carries a chain of two page-scoped layer parts, tier 1 over page 6 and tier 2 over 0-5, both at the undetermined cap; tier 2; the basis carries the merge statement", async () => {
  const w = fresh();
  const pw = realMember(w);
  const r = await readPdf(w, MIXED, { PDF_WORKER: pw });
  assert.equal(r.text_tier, 2);
  assert.deepEqual(r.text_source, [layer(1, [6]), layer(2, [0, 1, 2, 3, 4, 5])]);
  const note = tier2Note(mergeTier2Text(await tier1(MIXED), pw.calls[0].answer.text));
  assert.ok(r.basis.includes(note), "the basis names the tier-2 note");
  assert.match(r.basis, /merge of two decodes and its chain names the tier per page/);
  assert.match(r.basis, /\(tier 2\)/);
});

test("R3 R10 (tier2-wire): one tier throughout gives one unscoped layer part: legistar-73450 is never escalated (tier 1, no tier-2 note), legistar-73550 wholly won by tier 2 records tier 2 unscoped with all three pages re-read", async () => {
  const w = fresh();
  const pw = realMember(w);
  const clean = await readPdf(w, CLEAN, { PDF_WORKER: pw });
  assert.equal(pw.calls.length, 0, "the member is not asked for a document tier 1 read");
  assert.equal(clean.text_tier, 1);
  assert.deepEqual(clean.text_source, [layer(1)]);
  assert.doesNotMatch(clean.basis, TIER2_WORDS);
  const rec = await readPdf(w, RECOVERS, { PDF_WORKER: pw });
  assert.equal(pw.calls.length, 1);
  assert.equal(rec.text_tier, 2);
  assert.deepEqual(rec.text_source, [layer(2)]);
  assert.match(rec.basis, /3 page\(s\) were re-read by the tier-2 decoder, which recovered text tier 1 could not map and more of it; the other 0 page\(s\) kept tier 1's reading/);
  assert.doesNotMatch(rec.basis, /merge of two decodes/, "one provenance is not called a merge");
});

test("R3 (tier2-wire): the real legistar-73618 does not escalate: its undetermined markers do not outnumber its glyphs, the member is never asked, and the reading is tier 1's own layer", async () => {
  const w = fresh();
  const pw = realMember(w);
  const t1 = await tier1(DEGRADES);
  const weighed = decodeView(t1).counts.undetermined;
  assert.ok(weighed >= 1 && weighed <= glyphCount(t1.document), "markers do not outnumber glyphs");
  const r = await readPdf(w, DEGRADES, { PDF_WORKER: pw });
  assert.equal(pw.calls.length, 0);
  assert.deepEqual([r.text_tier, r.text_source], [1, [layer(1)]]);
});

/* Two synthesised one-page PDFs (tier2-wire §7): a layer whose /Info producer names ABBYY, and an encrypted document
   (tier 1's pageless early return, the only shape that reaches the merge's wholesale branch). */
const classic = (bodies, trailer) => {
  let s = "%PDF-1.7\n%\xe2\xe3\xcf\xd3\n"; const off = [];
  bodies.forEach((b, i) => { off[i] = s.length; s += `${i + 1} 0 obj\n${b}\nendobj\n`; });
  const x = s.length, n = bodies.length + 1;
  let xr = `xref\n0 ${n}\n0000000000 65535 f \n`;
  for (let i = 0; i < bodies.length; i++) xr += `${String(off[i]).padStart(10, "0")} 00000 n \n`;
  s += xr + `trailer\n<< /Size ${n} /Root 1 0 R ${trailer} >>\nstartxref\n${x}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(s, "latin1"));
};
const HELLO = "BT /F1 24 Tf 72 700 Td (Hello Oakland 2026) Tj ET";
const ABBYY = classic(["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${HELLO.length} >>\nstream\n${HELLO}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  "<< /Producer (ABBYY FineReader 15) >>"], "/Info 6 0 R");
const ENCRYPTED = classic(["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>",
  "<< /Filter /Standard /V 2 /R 3 /O (0000000000000000) /U (0000000000000000) /P -44 >>"], "/Encrypt 4 0 R");

test("R3 R10 (tier2-wire): the tier-1 producer marker is carried when the member supplies none: on the reading's chain as ocr(<product>) uncapped after the tier-2 layer", async () => {
  const w = fresh();
  const pw = realMember(w);
  const t1 = await tier1(ABBYY);
  assert.deepEqual([t1.producer.determination, t1.producer.ocr.engine], ["ocr", "ABBYY FineReader 15"], "the arm is real");
  const r = await readPdf(w, ABBYY, { PDF_WORKER: pw });
  assert.equal("producer" in pw.calls[0].answer.text, false, "the member supplies no producer");
  assert.equal(r.text_tier, 2);
  assert.deepEqual(r.text_source, [layer(2), { step: "ocr", engine: "ABBYY FineReader 15", version: null, field: "producer", marker: "abbyy",
                                               cap: null, measured_by: NAMED_ENGINE_SOURCE }]);
});

test("R3 (tier2-wire): in the merge's wholesale branch (an encrypted document, no pages and no glyph) tier 1's producer is carried onto the member's text, with the real member and with a member that decodes it, through tier2Escalate; a member's own producer stands", async () => {
  const w = fresh();
  const pw = realMember(w);
  const t1 = await tier1(ENCRYPTED);
  assert.deepEqual([t1.pages.length, t1.counts.chars, t1.producer.why], [0, 0, "encrypted"], "the wholesale shape");
  const d = await hold(w.evidence, ENCRYPTED);
  const e0 = await tier2Escalate({ PDF_WORKER: pw }, { sha: d, storeName: "bio", text: t1 });
  assert.equal(pw.calls.length, 1, "it escalates");
  assert.equal("producer" in pw.calls[0].answer.text, false);
  assert.deepEqual(e0.text.producer, t1.producer, "the merged text still says why its /Info could not be read");
  assert.deepEqual(e0.replaced, [], "no page was replaced, so the wired tier stays 1");
  /* the same branch with a member that decodes it: the member's text whole, tier 1's producer on it */
  const decoded = i2([{ page: 0, text: "decrypted" }]);
  const e = await tier2Escalate({ PDF_WORKER: member(() => ({ ok: true, text: decoded })) }, { sha: d, storeName: "bio", text: t1 });
  assert.equal(e.outcome, "merged");
  assert.deepEqual(e.text, { ...decoded, producer: t1.producer });
  const own = { determination: "text", ocr: null, why: null };
  const e2 = await tier2Escalate({ PDF_WORKER: member(() => ({ ok: true, text: { ...decoded, producer: own } })) }, { sha: d, storeName: "bio", text: t1 });
  assert.deepEqual(e2.text.producer, own);
});

/* ---------------------------------------------------------------- converted from tier3-layer-parts.test.mjs (REC-102) */

/* Synthesised PDFs in the page shapes the class needs: an unmappable page (a font with no /ToUnicode, one marker per
   run, no glyph), a scan (no font, one full-page image: `no_text_layer`), and a text page through an identity CMap. */
function pdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"), o.stream, Buffer.from("\nendstream\n", "latin1"));
    else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
const CMAP = Buffer.from(["/CIDInit /ProcSet findresource begin 12 dict begin begincmap", "/CMapName /Adobe-Identity-UCS def",
  "1 begincodespacerange", "<20> <7e>", "endcodespacerange", "1 beginbfrange", "<20> <7e> <0020>", "endbfrange",
  "endcmap CMapName currentdict /CMap defineresource pop end end"].join("\n"), "latin1");
const show = (lines) => Buffer.from("BT /F1 10 Tf " + lines.map((l, i) => (i ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET", "latin1");
const IMG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const runs = (n) => Array.from({ length: n }, (_, i) => `Resolution 26-77${String(i).padStart(2, "0")}`);
const page = (b, res, ops) => [{ num: b, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << ${res} >> /Contents ${b + 1} 0 R >>` },
                               { num: b + 1, head: `<< /Length ${ops.length} >>`, stream: ops }];
const UNMAP = (n) => (b) => [...page(b, `/Font << /F1 ${b + 2} 0 R >>`, show(runs(n))), { num: b + 2, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Garamond-Custom >>" }];
const SCAN = (b) => page(b, "/XObject << /Im0 100 0 R >>", Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1"));
const TEXT = (lines) => (b) => [...page(b, `/Font << /F1 ${b + 2} 0 R >>`, show(lines)),
  { num: b + 2, body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode ${b + 3} 0 R >>` },
  { num: b + 3, head: `<< /Length ${CMAP.length} >>`, stream: CMAP }];
const build = (...pages) => pdf([{ num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: `<< /Type /Pages /Kids [${pages.map((_, i) => `${10 + i * 10} 0 R`).join(" ")}] /Count ${pages.length} >>` },
  ...pages.flatMap((p, i) => p(10 + i * 10)),
  { num: 100, head: `<< /Type /XObject /Subtype /Image /Width 2550 /Height 3300 /Filter /DCTDecode /Length ${IMG.length} >>`, stream: IMG }]);
const GOOD = "Item 3.1";   // 8 characters, 7 glyphs
const BOTH = build(UNMAP(20), SCAN, TEXT([GOOD]));   // reaches both merges
const TIER3ONLY = build(TEXT([GOOD]), SCAN);          // scan markers only: tier 3 alone
const TIER2ONLY = build(UNMAP(20), TEXT([GOOD]));     // no scan: tier 2 alone
const WSLAYER = build(TEXT(["    "]), SCAN);          // the text page holds four spaces
const EMPTYLAYER = build(TEXT([]), SCAN);             // the text page holds nothing
const ALLSCAN = build(SCAN, SCAN);

/* The scripted tier 2 answers page 0 of an unmappable document with the runs' text and says nothing of other pages;
   the scripted OCR member transcribes every page asked for. */
const T2 = runs(20).join("\n");
const tiers = () => ({
  PDF_WORKER: member(() => ({ ok: true, tier: 2, notes: [], links: [], structure: {},
                              text: { document: T2, pages: [{ page: 0, text: T2, undetermined: [] }], undetermined: [], counts: { chars: T2.length, undetermined: 0 } } })),
  OCR_WORKER: member((body) => ocrAnswer(body.pages)),
});
const OCR_PART = (pages) => [
  { step: "pixels", cap: "C", measured_by: "M-1", calibration: null, ...(pages ? { extent: { kind: "pages", pages } } : {}) },
  { step: "ocr", engine: "tess", version: "5.3", cap: "C", measured_by: "M-1", calibration: null, ...(pages ? { extent: { kind: "pages", pages } } : {}) }];
const SAID = "were transcribed by the OCR member and merged into this document's own text";
const KEPT = "already had text kept it";

test("R6 R3 R5 (tier3-layer-parts): a document reaching both merges gets the four-part chain: tier 1 over the page the tier-2 merge kept, tier 2 over the page it won, and the engine's pixels and ocr over the page filled; tier 3", async () => {
  const w = fresh();
  const env = tiers();
  const r = await readPdf(w, BOTH, env);
  assert.equal(env.PDF_WORKER.calls.length, 1, "merge one was reached");
  assert.deepEqual(env.OCR_WORKER.calls.map((c) => c.body.pages), [[1]], "merge two was reached, for the scan only");
  assert.equal(r.text_tier, 3);
  assert.deepEqual(r.text_source, [layer(1, [2]), layer(2, [0]), ...OCR_PART([1])]);
  assert.match(r.basis, /1 page\(s\) were re-read by the tier-2 decoder, .*; the other 2 page\(s\) kept tier 1's reading; this document's text layer is a merge of two decodes/);
  assert.ok(r.basis.includes(`1 scanned page(s) ${SAID}; the pages that ${KEPT}`), "R9: two pages kept their text");
});

test("R6 R3 (tier3-layer-parts): a document reaching only the tier-3 merge gets one layer part at the wired tier and the engine's two; one reaching only the tier-2 merge keeps its two scoped layer parts and asks no OCR", async () => {
  const w = fresh();
  const e3 = tiers();
  const only3 = await readPdf(w, TIER3ONLY, e3);
  assert.equal(e3.PDF_WORKER.calls.length, 0, "scan markers alone do not escalate");
  assert.deepEqual(e3.OCR_WORKER.calls.map((c) => c.body.pages), [[1]]);
  assert.equal(only3.text_tier, 3);
  assert.deepEqual(only3.text_source, [layer(1, [0]), ...OCR_PART([1])]);
  assert.ok(only3.basis.includes(`1 scanned page(s) ${SAID}; the page that ${KEPT}`));
  const e2 = tiers();
  const only2 = await readPdf(w, TIER2ONLY, e2);
  assert.equal(e2.PDF_WORKER.calls.length, 1);
  assert.equal(e2.OCR_WORKER.calls.length, 0, "no scan marker survived");
  assert.equal(only2.text_tier, 2);
  assert.deepEqual(only2.text_source, [layer(1, [1]), layer(2, [0])]);
});

test("R6 R9 (tier3-layer-parts): a whitespace-only text page is in no part and records the very chain an empty page does, the engine's two unscoped; neither note says a page kept text, nor does a wholly scanned document's", async () => {
  const w = fresh();
  const t1 = await tier1(WSLAYER);
  assert.deepEqual([t1.pages[0].text, glyphCount(t1.pages[0].text)], ["    ", 0], "the arm is real: four spaces, no glyph");
  const ew = tiers(), ee = tiers(), ea = tiers();
  const ws = await readPdf(w, WSLAYER, ew);
  const mt = await readPdf(w, EMPTYLAYER, ee);
  const all = await readPdf(w, ALLSCAN, ea);
  assert.deepEqual([ew, ee].map((e) => [e.PDF_WORKER.calls.length, e.OCR_WORKER.calls.map((c) => c.body.pages)]), [[0, [[1]]], [0, [[1]]]]);
  assert.deepEqual(ea.OCR_WORKER.calls.map((c) => c.body.pages), [[0, 1]]);
  for (const r of [ws, mt, all]) {
    assert.equal(r.text_tier, 3);
    assert.deepEqual(r.text_source, OCR_PART(null));
    assert.equal(r.basis.includes(KEPT), false, "no page held text");
  }
  assert.ok(ws.basis.includes(`1 scanned page(s) ${SAID}`));
  assert.ok(mt.basis.includes(`1 scanned page(s) ${SAID}`));
  assert.ok(all.basis.includes(`2 scanned page(s) ${SAID}`));
});

test("R3 (tier3-layer-parts): the escalation weighs glyphs, never raw characters: 8 markers against the good line's 8 characters and 7 glyphs is sent to tier 2; 7 markers is not", async () => {
  const w = fresh();
  const m8 = build(UNMAP(8), TEXT([GOOD])), m7 = build(UNMAP(7), TEXT([GOOD]));
  const t8 = await tier1(m8), t7 = await tier1(m7);
  assert.deepEqual([t8.counts.undetermined, t8.counts.chars, glyphCount(t8.document)], [8, 8, 7], "in the band where the two rules differ");
  assert.deepEqual([t7.counts.undetermined, glyphCount(t7.document)], [7, 7]);
  const asked8 = member(() => ({ status: 500, body: { ok: false } }));
  const r8 = await readPdf(w, m8, { PDF_WORKER: asked8 });
  assert.equal(asked8.calls.length, 1);
  assert.match(r8.basis, /the pdf-worker member answered without improving it/);
  const asked7 = member(() => { throw new Error("tier 2 must not be asked"); });
  await readPdf(w, m7, { PDF_WORKER: asked7 });
  assert.equal(asked7.calls.length, 0);
  /* the same weighing where tier 1 also emits pdf-reader R34's image_unread: 22 markers, 21 weighed, against 7 glyphs */
  const tb = await tier1(BOTH);
  assert.deepEqual([tb.counts.undetermined, decodeView(tb).counts.undetermined, glyphCount(tb.document)], [22, 21, 7]);
});
