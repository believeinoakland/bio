/* reading-pipeline R37 (fix round 4b, F4 F8 F9 F10; K4487): a failure says whether it is final; caps defer or state.
 * Every case enters at the module's interface, `read` (and the pieces R23 names), over real PDF bytes through the
 * registered `pdf` entry, with scripted fleet members honouring the OCR member's one-page contract. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import { fresh, hold, doc, member, bucket, evidenceStore, sha } from "./fixture.mjs";
import { read, tier2Escalate, WHOLE_READ_MAX, MULTIPART_READ_MAX } from "../../../src/reading-pipeline/index.mjs";
import { synthPdf } from "./bigpdf.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";

registerDoctypes(registerDoctype);

/* ---- a scan of N image-only pages (d606's), and the OCR member's one-page contract ---- */
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
const ENV0 = { ok: true, engine: "tesseract-wasm", version: "0.11.0", cap: "C", measured_by: "CPDF-15", confidence_floor: null };
const region = (p) => ({ text: "SCANNED PAGE " + p, confidence: { value: 0.97, basis: "engine" },
                         source: { kind: "pdf-page", ref: "p" + p, page: p, rect: [72, 700, 540, 712] } });
/* the member's chunk rule: the lowest page taken, the rest in `deferred` */
const chunked = (deviate = () => null) => member((body) => {
  const clean = [...new Set(body.pages)].sort((a, b) => a - b);
  const take = clean[0], deferred = clean.slice(1);
  return deviate(take, deferred) ?? { ...ENV0, pages: [{ page: take, regions: [region(take)] }], deferred, notes: [] };
});
const pdfDoc = (digest, bytes) => doc({ digest, bytes, ct: "application/pdf", format: "pdf" });
const numOf = (re, s) => { const m = re.exec(String(s || "")); return m ? +m[1] : 0; };

/* ---- 1. a failure says whether its cause is outside the document ---- */

test("R37 (F4): evidence.get throws once during a read of a 3 MB PDF: the failed reading says `transient`; the next read, the store answering, is a reading with no failure", async () => {
  const bytes = synthPdf({ pages: 40, linesPerPage: 60, targetBytes: 3_000_000 });
  const b = bucket();
  const d = await hold(b, bytes);
  const store = evidenceStore(b);
  let throwOnce = true;
  const flaky = { head: store.head, put: store.put, get: async (k) => { if (throwOnce) { throwOnce = false; throw new Error("R2 read error"); } return store.get(k); } };
  const document = pdfDoc(d, bytes.length);
  const first = (await read(document, { evidence: flaky, env: {} })).reading;
  assert.equal(first.found, false);
  assert.equal(first.failure, "transient", first.basis);
  const again = (await read(document, { evidence: flaky, env: {} })).reading;
  assert.equal(again.failure, undefined, "a reading that is not a failed one carries no failure");
  assert.equal(again.page_count, 40);
});

test("R37 (F4): a capture whose object is not held, no store bound, and a part not held are `transient`; an entry that produces no text from the bytes is the document's own, `final`", async () => {
  const w = fresh();
  const missing = (await w.read(pdfDoc("a".repeat(64), 1000))).reading;
  assert.equal(missing.failure, "transient", "an object not held (yet) can be held later");
  const noStore = (await read(pdfDoc("a".repeat(64), 1000), { evidence: null })).reading;
  assert.equal(noStore.failure, "transient");
  const parts = [{ sha256: "b".repeat(64), bytes: 1000 }, { sha256: "c".repeat(64), bytes: 1000 }];
  const noPart = (await w.read(doc({ digest: "d".repeat(64), bytes: 2000, ct: "application/pdf", format: "pdf", parts }))).reading;
  assert.equal(noPart.failure, "transient");
  const noSha = (await w.read({ ...pdfDoc("e".repeat(64), 10), capture: { content_type: "application/pdf" } })).reading;
  assert.equal(noSha.failure, "final", "a document that names no digest has nothing to read again");
  const junk = new TextEncoder().encode("this is not a pdf at all, only words ".repeat(20));
  const d = await hold(w.evidence, junk);
  const own = (await w.read(pdfDoc(d, junk.length))).reading;
  assert.equal(own.found, false);
  assert.equal(own.failure, "final", own.basis);
});

test("R37 (F4): a scanned PDF read while the OCR member answers 503 or is unreachable is `transient`; a member that answers and declines the page is the document's own, `final`", async () => {
  const bytes = scanPdf(3);
  const run = async (m) => {
    const w = fresh({ env: { OCR_WORKER: m } });
    const d = await hold(w.evidence, bytes);
    return (await w.read(pdfDoc(d, bytes.length))).reading;
  };
  const down = await run({ async fetch() { return new Response("busy", { status: 503 }); } });
  assert.equal(down.found, false);
  assert.equal(down.failure, "transient", down.basis);
  assert.equal(down.tier3_candidate, true);
  const gone = await run({ async fetch() { throw new Error("binding down"); } });
  assert.equal(gone.failure, "transient", gone.basis);
  const declined = await run(member(() => ({ ok: false, reason: "PAGE_NOT_RENDERABLE", page: 0, deferred: [], notes: [] })));
  assert.equal(declined.found, false);
  assert.equal(declined.failure, "final", declined.basis);
});

test("R37 (F4): tier 2 says `transient` when the PDF member answers 5xx or its binding throws, and not when it answers and cannot help", async () => {
  const text = { document: "x", pages: [{ page: 0, text: "x", undetermined: [] }], undetermined: [{ page: 0, reason: "undecoded_font", count: 9 }], counts: { chars: 1, undetermined: 9 } };
  const ask = (fetch) => tier2Escalate({ PDF_WORKER: { fetch } }, { sha: "a".repeat(64), storeName: "bio", text });
  assert.equal((await ask(async () => new Response("down", { status: 503 }))).transient, true);
  assert.equal((await ask(async () => { throw new Error("binding down"); })).transient, true);
  const declined = await ask(async () => Response.json({ ok: false, reason: "NOT_FOUND" }));
  assert.equal(declined.outcome, "no_improvement");
  assert.ok(!declined.transient);
});

/* ---- 2. the units budget binds the acquire answer only ---- */

test("R37 (F8): a 400-page text PDF: the acquire answer carries the wire's units and names those left out; read for the index (`unitsBudget: Infinity`) gives every page, each findable by its text, and the words read are the words of the text", async () => {
  const bytes = synthPdf({ pages: 400, linesPerPage: 70, targetBytes: 1 });
  const w = fresh();
  const d = await hold(w.evidence, bytes);
  const document = pdfDoc(d, bytes.length);
  const wire = await w.read(document);
  assert.ok(wire.text_units.length < 400, `the wire kept ${wire.text_units.length}`);
  assert.ok(wire.text_units_over_bound > 0 && Array.isArray(wire.text_units_skipped), "what the wire left out is named");
  assert.ok(wire.reading.words_read < wire.reading.words_total);
  const all = await read(document, { evidence: evidenceStore(w.evidence), env: {}, unitsBudget: Infinity });
  assert.equal(all.text_units.length, 400);
  assert.equal(all.text_units_over_bound, undefined);
  assert.equal(all.text_units_skipped, undefined);
  assert.deepEqual(all.text_units.map((u) => u.extent.page), Array.from({ length: 400 }, (_, i) => i));
  assert.ok(all.text_units.every((u) => u.text.length > 100 && !u.truncated));
  assert.equal(all.reading.words_read, all.reading.words_total);
  assert.equal(all.reading.words_total, wire.reading.words_total, "the text is the same text either way");
});

/* ---- 3. OCR past its per-request pages owes the rest, from a stated cursor ---- */

test("R37 (F9; fix round 9, G126j): a 60-page scan: 24 pages read, the reading states the cursor (24) and the 36 pages left, counted owed 36; the retired owe hook is never called", async () => {
  const bytes = scanPdf(60);
  const m = chunked();
  const w = fresh({ env: { OCR_WORKER: m } });
  const d = await hold(w.evidence, bytes);
  const owed = [];
  const out = await read(pdfDoc(d, bytes.length), { evidence: evidenceStore(w.evidence), env: w.env, owe: async (o) => { owed.push(o); } });
  const rd = out.reading;
  assert.equal(m.calls.length, 24, "the request's OCR calls");
  assert.equal(numOf(/(\d+) scanned page\(s\) were transcribed/, rd.basis), 24);
  assert.deepEqual(rd.ocr_left, { cursor: 24, pages: 36 });
  assert.deepEqual(owed, [], "nothing here registers owed work (R55)");
  assert.equal(out.counters.owed, 36);
  assert.equal(rd.tier3_candidate, true);
  assert.equal(rd.failure, undefined, "a reading with 24 pages read is no failed reading");
});

test("R37 (F9): the OCR budget is the caller's (`ocrInvocations`): with room for 60 calls every page is read and nothing is owed; a hook that throws never fails the read; a scan inside the default budget owes nothing", async () => {
  const run = async (pages, opts = {}) => {
    const bytes = scanPdf(pages);
    const m = chunked();
    const w = fresh({ env: { OCR_WORKER: m } });
    const d = await hold(w.evidence, bytes);
    const owed = [];
    const out = await read(pdfDoc(d, bytes.length), { evidence: evidenceStore(w.evidence), env: w.env, owe: async (o) => { owed.push(o); }, ...opts });
    return { rd: out.reading, owed, calls: m.calls.length };
  };
  const wide = await run(60, { ocrInvocations: 60 });
  assert.equal(wide.calls, 60);
  assert.equal(numOf(/(\d+) scanned page\(s\) were transcribed/, wide.rd.basis), 60);
  assert.equal(wide.rd.ocr_left, undefined);
  assert.deepEqual(wide.owed, []);
  assert.equal(wide.rd.tier3_candidate, undefined);
  const small = await run(10);
  assert.equal(small.rd.ocr_left, undefined);
  assert.deepEqual(small.owed, []);
  const bytes = scanPdf(30);
  const w = fresh({ env: { OCR_WORKER: chunked() } });
  const d = await hold(w.evidence, bytes);
  const out = await read(pdfDoc(d, bytes.length), { evidence: evidenceStore(w.evidence), env: w.env, owe: async () => { throw new Error("ledger down"); } });
  assert.deepEqual(out.reading.ocr_left, { cursor: 24, pages: 6 });
});

test("R37 (F9): a call that fails (a 5xx for one page) leaves that page and the pages after it owed, from the first of them", async () => {
  const bytes = scanPdf(6);
  const w = fresh({ env: { OCR_WORKER: { async fetch(url, init) {
    const body = JSON.parse(init.body);
    const clean = [...new Set(body.pages)].sort((a, b) => a - b);
    if (clean[0] === 3) return new Response("busy", { status: 503 });
    return Response.json({ ...ENV0, pages: [{ page: clean[0], regions: [region(clean[0])] }], deferred: clean.slice(1), notes: [] });
  } } } });
  const d = await hold(w.evidence, bytes);
  const owed = [];
  const rd = (await read(pdfDoc(d, bytes.length), { evidence: evidenceStore(w.evidence), env: w.env, owe: async (o) => { owed.push(o); } })).reading;
  assert.equal(numOf(/(\d+) scanned page\(s\) were transcribed/, rd.basis), 5, rd.basis);
  assert.deepEqual(rd.ocr_left, { cursor: 3, pages: 1 });
  assert.deepEqual(owed, [], "the retired owe hook is never called (R55)");
});

/* ---- 4. a whole too large for the object's memory is never loaded ---- */

const LIMIT = WHOLE_READ_MAX;
function heavy(size, calls) {
  /* a store whose object is `size` bytes and which fails the test if its bytes are asked for */
  return { head: async (k) => { calls.push(["head", k]); return { size }; },
           get: async (k) => { calls.push(["get", k]); throw new Error("the whole must never be loaded"); } };
}

test("R37 (F10): a whole held over the largest the object can read is never loaded: the reading is `final` and states the size, and the store is never asked for the bytes", async () => {
  const size = LIMIT + 5 * 1024 * 1024;
  const calls = [];
  const d = "f".repeat(64);
  const rd = (await read(pdfDoc(d, size), { evidence: heavy(size, calls), env: {} })).reading;
  assert.equal(rd.found, false);
  assert.equal(rd.failure, "final");
  assert.ok(rd.basis.includes(String(size)), `the basis states the size: ${rd.basis}`);
  assert.ok(rd.basis.includes(String(LIMIT)), `and the limit: ${rd.basis}`);
  assert.ok(calls.every(([op]) => op === "head"), JSON.stringify(calls));
  /* a document that states no size is judged by the store's */
  const bare = (await read({ ...pdfDoc(d, 0), capture: { sha256: d, content_type: "application/pdf" } }, { evidence: heavy(size, []), env: {} })).reading;
  assert.equal(bare.failure, "final");
  assert.ok(bare.basis.includes(String(size)));
});

test("R37 (F10): a capture in parts whose bytes add up to more than the object can read is `final` at once, before any part is asked for; one that fits only waits (`transient`) while its whole is not held", async () => {
  const part = 8 * 1024 * 1024;
  const n = Math.ceil((LIMIT + 1) / part);
  const parts = Array.from({ length: n }, (_, i) => ({ sha256: sha(String(i)), bytes: part }));
  const calls = [];
  const store = { head: async (k) => { calls.push(["head", k]); return null; }, get: async (k) => { calls.push(["get", k]); return null; } };
  const big = (await read(doc({ digest: "9".repeat(64), bytes: part * n, ct: "application/pdf", format: "pdf", parts }), { evidence: store, env: {} })).reading;
  assert.equal(big.failure, "final");
  assert.ok(big.basis.includes(String(part * n)), big.basis);
  assert.ok(calls.every(([op]) => op !== "get"), "no part and no whole was loaded");
  /* over MULTIPART_READ_MAX but within the ceiling, no whole held: it can still arrive */
  const mid = Math.floor((MULTIPART_READ_MAX + LIMIT) / 2 / part) + 1;
  const midParts = Array.from({ length: mid }, (_, i) => ({ sha256: sha("m" + i), bytes: part }));
  assert.ok(part * mid > MULTIPART_READ_MAX && part * mid <= LIMIT, `${part * mid}`);
  const held = (await read(doc({ digest: "8".repeat(64), bytes: part * mid, ct: "application/pdf", format: "pdf", parts: midParts }), { evidence: store, env: {} })).reading;
  assert.equal(held.failure, "transient", held.basis);
});
