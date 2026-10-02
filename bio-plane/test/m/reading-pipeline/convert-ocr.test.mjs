/* reading-pipeline: moved from `extraction` (N513), its assertions unchanged. Its share of two legacy suites
   (`build/jobs/T17/legacy-tests.md`'s rows for `test/d606-perpage-ocr.test.mjs` and `test/textchain.test.mjs`) as
   module tests at `read`, called directly, over the
   real `pdf` format entry and real PDF bytes as those suites built them. The tier-3 member is the COMMITTED OCR
   member (`ocr-worker`'s bundle, wasm and model, booted by `ocr-worker/test/memberworker.mjs`) for D-606's real path,
   and a scripted member honouring its one-page contract (`chooseChunk`: lowest page taken, the rest in `deferred`)
   for the loop's failure modes. `textchain.test.mjs` was deleted in T20 (K931). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { Miniflare } from "miniflare";
import { fresh, hold, doc, member } from "./fixture.mjs";
import { ocrWorkerDef } from "../../../../ocr-worker/test/memberworker.mjs";

/* ---- PDF bytes, as the old suites assembled them ---- */
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
/* d606: N image-only pages, each a 16x16 grey Flate image: tier 1 marks every page `no_text_layer`. */
function scanPdf(n) {
  const objs = [{ num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: `<< /Type /Pages /Kids [${Array.from({ length: n }, (_, i) => `${3 + i * 3} 0 R`).join(" ")}] /Count ${n} >>` }];
  const img = deflateSync(Buffer.alloc(256, 0x80));
  const content = Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1");
  for (let i = 0; i < n; i++) {
    const p = 3 + i * 3;
    objs.push({ num: p, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>` });
    objs.push({ num: p + 1, head: `<< /Length ${content.length} >>`, stream: content });
    objs.push({ num: p + 2, head: `<< /Type /XObject /Subtype /Image /Width 16 /Height 16 /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${img.length} >>`, stream: img });
  }
  return pdf(objs);
}
/* textchain: a text-layer page (identity ToUnicode) and a scanned page (one full-page DCT image, no font). */
const CMAP = Buffer.from(`/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`, "latin1");
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const SCAN_CONTENT = Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1");
function mixedPdf(lines) {
  const cbuf = Buffer.from("BT /F1 10 Tf " + lines.map((l, i) => (i ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET", "latin1");
  return pdf([
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R 7 0 R] /Count 2 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
    { num: 4, head: `<< /Length ${cbuf.length} >>`, stream: cbuf },
    { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>" },
    { num: 6, head: `<< /Length ${CMAP.length} >>`, stream: CMAP },
    { num: 7, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 100 0 R >> >> /Contents 8 0 R >>" },
    { num: 8, head: `<< /Length ${SCAN_CONTENT.length} >>`, stream: SCAN_CONTENT },
    { num: 100, head: `<< /Type /XObject /Subtype /Image /Width 2550 /Height 3300 /Filter /DCTDecode /Length ${JPEG.length} >>`, stream: JPEG },
  ]);
}
function dctScan(pages) {
  const objs = [{ num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: `<< /Type /Pages /Kids [${Array.from({ length: pages }, (_, i) => `${3 + i * 2} 0 R`).join(" ")}] /Count ${pages} >>` }];
  for (let i = 0; i < pages; i++) {
    objs.push({ num: 3 + i * 2, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 ${100 + i} 0 R >> >> /Contents ${4 + i * 2} 0 R >>` });
    objs.push({ num: 4 + i * 2, head: `<< /Length ${SCAN_CONTENT.length} >>`, stream: SCAN_CONTENT });
  }
  for (let i = 0; i < pages; i++)
    objs.push({ num: 100 + i, head: `<< /Type /XObject /Subtype /Image /Width 2550 /Height 3300 /Filter /DCTDecode /Length ${JPEG.length} >>`, stream: JPEG });
  return pdf(objs);
}
const BLANK = pdf([{ num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" }, { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
                   { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" }]);
const agendaLines = (n1, n2, n3) => [
  "Thursday, July 16, 2026", "City of Oakland", "Office of the City Clerk",
  "*Rules & Legislation Committee", " Agenda - SUPPLEMENTAL", "Roll Call /  Call To Order",
  "Subject: ", "Grand Performance Mural", "From: ", "Councilmember Wang",
  "Recommendation: Adopt A Resolution On Consent", "3.1", n1,
  "Subject: ", "Coliseum Payment Allocation", "From: ", "Finance Department",
  "Recommendation: Receive An Informational Report", "3.2", n2,
  "Determination Of Schedule Of Outstanding Committee Items", "2", n3, "Open Forum", "Adjournment"];
const MIXED = mixedPdf(agendaLines("26-7601", "26-7602", "26-7603"));
const D460 = (n) => new Uint8Array(readFileSync(fileURLToPath(new URL(`../../fixtures/d460/${n}`, import.meta.url))));

/* Reads real bytes through the registered pdf entry. */
async function readReal(w, bytes, env = {}) {
  const d = await hold(w.evidence, bytes);
  return (await w.read(doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" }), { env })).reading;
}
const num = (re, s) => { const m = re.exec(String(s || "")); return m ? +m[1] : 0; };
const counts = (rd) => [num(/(\d+) scanned page\(s\) were transcribed/, rd.basis), num(/(\d+) page\(s\) with no text layer were not transcribed/, rd.basis)];
const steps = (rd) => (Array.isArray(rd.text_source) ? rd.text_source : []).map((s) => s.step);

/* d606's stub, as a scripted member: the lowest page taken, the rest deferred; `deviate(take)` answers otherwise. */
const ENV0 = { ok: true, engine: "tesseract-wasm", version: "0.11.0", cap: "C", measured_by: "CPDF-15", confidence_floor: null };
const region = (p) => ({ text: "SCANNED PAGE " + p, confidence: { value: 0.97, basis: "engine" },
                         source: { kind: "pdf-page", ref: "p" + p, page: p, rect: [72, 700, 540, 712] } });
const chunked = (deviate = () => null) => member((body) => {
  const clean = [...new Set(body.pages)].sort((a, b) => a - b);
  const take = clean[0], deferred = clean.slice(1);
  return deviate(take, deferred) ?? { ...ENV0, pages: [{ page: take, regions: [region(take)] }], deferred, notes: [] };
});

/* ===================================================================== *
 * d606-perpage-ocr.test.mjs
 * ===================================================================== */

/* R24: every read here is handed the view of the instance's profiles, as `extraction` (its R18) composes it; with none
   named a reader reads under the empty view, never a fallback to every held profile. */
const viewed = () => fresh({ profiles: ["oakland-alameda"] });

test("R4 R6 (d606 §1): the committed OCR member, bound as OCR_WORKER, reads D-460's two-page scan past its first page: both pages transcribed, none unread, the agenda on page 1 read; agenda-p1 still reads as before", { timeout: 120000 }, async () => {
  const mf = new Miniflare({ workers: [ocrWorkerDef()] });
  try {
    const captures = await mf.getR2Bucket("CAPTURES");
    const OCR_WORKER = await mf.getWorker("ocr-worker");
    for (const name of ["agenda-p2.pdf", "agenda-p1.pdf"]) {
      const w = fresh();
      const bytes = D460(name);
      const d = await hold(w.evidence, bytes);
      await captures.put(`bio/captures/${d}`, bytes);
      const rd = (await w.read(doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" }), { env: { OCR_WORKER } })).reading;
      assert.equal(rd.content_type, "meeting_agenda", name);
      assert.deepEqual(counts(rd), [2, 0], name);
      assert.equal(rd.tier3_candidate, undefined, name);
      assert.equal(rd.text_tier, 3, name);
      assert.deepEqual(steps(rd), ["pixels", "ocr"], name);
      assert.deepEqual(rd.text_source.filter((x) => x.step === "ocr").map((x) => x.engine && x.version ? "named" : "unnamed"), ["named"]);
    }
    /* the loop is what reads page 1: the same member with its `deferred` withheld reads page 0 alone */
    const w = fresh();
    const bytes = D460("agenda-p2.pdf");
    const d = await hold(w.evidence, bytes);
    await captures.put(`bio/captures/${d}`, bytes);
    const firstOnly = { async fetch(url, init) {
      const a = await (await OCR_WORKER.fetch(url, init)).json();
      return new Response(JSON.stringify({ ...a, deferred: [] }), { headers: { "content-type": "application/json" } });
    } };
    const one = (await w.read(doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" }), { env: { OCR_WORKER: firstOnly } })).reading;
    assert.notEqual(one.content_type, "meeting_agenda");
    assert.deepEqual(counts(one), [1, 1]);
    assert.equal(one.tier3_candidate, true);
  } finally { await mf.dispose(); }
});

test("R4 (d606 §2): under the budget every deferred page is asked, one per call in order: six calls, six transcribed, none unread, nothing said about a budget, not a candidate", async () => {
  const ocr = chunked();
  const rd = await readReal(viewed(), scanPdf(6), { OCR_WORKER: ocr });
  assert.deepEqual(ocr.calls.map((c) => c.body.pages), [[0, 1, 2, 3, 4, 5], [1], [2], [3], [4], [5]]);
  assert.deepEqual(counts(rd), [6, 0]);
  assert.doesNotMatch(rd.basis, /not asked for/);
  assert.equal(rd.tier3_candidate, undefined);
  assert.equal(rd.text_tier, 3);
});

test("R4 R9 (d606 §2): over the budget, 24 calls on a 30-page scan: 24 transcribed, 6 unread, the tail named from 1 with whose limit, still a candidate", async () => {
  const ocr = chunked();
  const rd = await readReal(viewed(), scanPdf(30), { OCR_WORKER: ocr });
  assert.equal(ocr.calls.length, 24);
  assert.equal(ocr.calls[0].body.pages.length, 30);
  assert.deepEqual(counts(rd), [24, 6]);
  assert.match(rd.basis, /6 of them \(pages 25-30\) were not asked for in this request.*32 Worker invocations per request — their claim/);
  assert.equal(rd.tier3_candidate, true);
});

test("R4 (d606 §3): a call that throws stops the loop: the pages before it kept, it and every page after it unread and named, the read itself not failed", async () => {
  const ocr = chunked((take) => (take === 3 ? new Error("the 33rd invocation") : null));
  const rd = await readReal(viewed(), scanPdf(6), { OCR_WORKER: ocr });
  assert.equal(ocr.calls.length, 4, "no call after the throw");
  assert.deepEqual(counts(rd), [3, 3]);
  assert.match(rd.basis, /the call for page 4 failed, so 3 page\(s\) from it on \(pages 4-6\) were not transcribed/);
  assert.equal(rd.text_tier, 3);
  assert.equal(rd.tier3_candidate, true);
  assert.deepEqual(rd.provenance.pages.filter((p) => p.tier === 3 && p.text_sha256).map((p) => p.page), [0, 1, 2]);
});

test("R4 (d606 §3): a refused FIRST page does not end the document: its deferred pages are still asked, each refused page keeps its marker, the others are read, the note counts the declined", async () => {
  const ocr = chunked((take, deferred) => (take === 0 || take === 2
    ? { ok: false, reason: "PAGE_NOT_RENDERABLE", detail: "x", page: take, deferred, notes: [] } : null));
  const rd = await readReal(viewed(), scanPdf(6), { OCR_WORKER: ocr });
  assert.equal(ocr.calls.length, 6);
  assert.deepEqual(counts(rd), [4, 2]);
  assert.match(rd.basis, /the OCR member declined 2 page\(s\) it was asked for one at a time \(pages 1, 3\)/);
  assert.equal(rd.tier3_candidate, true);
});

test("R4 R5 R10 (d606 §3): a page answered under another engine build is not merged and is named; the chain names the one build the merged pages came from", async () => {
  const ocr = chunked((take, deferred) => (take === 4
    ? { ...ENV0, version: "0.12.0", pages: [{ page: 4, regions: [region(4)] }], deferred, notes: [] } : null));
  const rd = await readReal(viewed(), scanPdf(6), { OCR_WORKER: ocr });
  assert.deepEqual(counts(rd), [5, 1]);
  assert.match(rd.basis, /1 page\(s\) \(page 5\) were answered under a different engine build/);
  assert.deepEqual(rd.text_source.map((s) => [s.step, s.engine ?? null, s.version ?? null]),
                   [["pixels", null, null], ["ocr", "tesseract-wasm", "0.11.0"]]);
});

test("R4 (d606 §3): a page answered to the wrong call is dropped and counted, and the page asked stays unread", async () => {
  const ocr = chunked((take, deferred) => (take === 2
    ? { ...ENV0, pages: [{ page: 5, regions: [region(5)] }], deferred, notes: [] } : null));
  const rd = await readReal(viewed(), scanPdf(6), { OCR_WORKER: ocr });
  assert.deepEqual(counts(rd), [5, 1]);
  assert.match(rd.basis, /1 page\(s\) the OCR member returned were not the page that call asked for, and were dropped/);
});

/* ===================================================================== *
 * converted from textchain.test.mjs
 * ===================================================================== */

test("R4 R10 R11 (textchain): with no OCR member bound a scan is a failed reading named a tier-3 candidate, saying no OCR engine is installed, its chain the layer alone", async () => {
  const rd = await readReal(viewed(), dctScan(2));
  assert.equal(rd.found, false);
  assert.equal(rd.tier3_candidate, true);
  assert.match(rd.basis, /no OCR engine is installed/);
  assert.deepEqual(steps(rd), ["layer"]);
});

test("R4 R10 (textchain, D-252): a mixed document with no OCR member still reads its text layer, is named a tier-3 candidate saying no OCR engine is installed, and its chain is the layer's, unscoped", async () => {
  const rd = await readReal(viewed(), MIXED);
  assert.equal(rd.found, true);
  assert.equal(rd.tier3_candidate, true);
  assert.match(rd.basis, /no OCR engine is installed/);
  assert.deepEqual(rd.text_source.map((s) => [s.step, s.extent]), [["layer", undefined]]);
});

test("R4 (textchain): a blank page (no font, no image) is not a tier-3 candidate and the OCR member is never asked", async () => {
  const bare = await readReal(viewed(), BLANK);
  assert.equal(bare.tier3_candidate, undefined);
  assert.doesNotMatch(bare.basis, /OCR/);
  const ocr = member(() => { throw new Error("never"); });
  const bound = await readReal(viewed(), BLANK, { OCR_WORKER: ocr });
  assert.equal(ocr.calls.length, 0);
  assert.equal(bound.tier3_candidate, undefined);
});

test("R4 R5 (textchain): an answer refused whole leaves the scan unread with its reason and no engine in the chain: ok:false, HTTP 500, no engine, no version, no measured_by", async () => {
  const good = { ok: true, engine: "tesseract", version: "5.3.4-fast", cap: "C", measured_by: "CPDF-9", confidence_floor: 0.6,
                 pages: [{ page: 0, regions: [region(0)] }, { page: 1, regions: [region(1)] }] };
  for (const [answer, says] of [
    [{ ok: false, reason: "PAGE_TOO_LARGE" }, /the OCR member declined to transcribe this document \(PAGE_TOO_LARGE\)/],
    [{ status: 500, body: "boom" }, /the OCR member answered 500, so this document stays unread/],
    [{ ...good, engine: "" }, /did not name its engine and version/],
    [{ ...good, version: "" }, /did not name its engine and version/],
    [{ ...good, measured_by: "" }, /reported no MEASURED fidelity for itself/],
  ]) {
    const rd = await readReal(viewed(), dctScan(2), { OCR_WORKER: member(() => answer) });
    assert.equal(rd.found, false, String(says));
    assert.match(rd.basis, says);
    assert.notEqual(rd.text_tier, 3);
    assert.equal(rd.tier3_candidate, true);
    assert.deepEqual(steps(rd), ["layer"], String(says));
  }
});

test("R5 R6 (textchain, D-252): an OCR answer with no anchored page is refused whole: a mixed document's layer text stands, the scanned page is named unread, the chain is [\"layer\"]", async () => {
  const empty = { ok: true, engine: "tesseract", version: "5.3.4-fast", cap: "C", measured_by: "CPDF-9", confidence_floor: 0.6, pages: [] };
  const ocr = member(() => empty);
  const rd = await readReal(viewed(), MIXED, { OCR_WORKER: ocr });
  assert.deepEqual(ocr.calls.map((c) => c.body.pages), [[1]]);
  assert.equal(rd.found, true);
  assert.match(rd.basis, /the OCR member returned no page this record could anchor/);
  assert.deepEqual(steps(rd), ["layer"]);
  assert.equal(rd.tier3_candidate, true);
});
