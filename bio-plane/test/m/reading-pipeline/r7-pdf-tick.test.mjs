/* reading-pipeline G68 (fix round 7), R40: a PDF read in page ranges is opened once for its pieces. pdf-reader's `openPdfRange(bytes)`
   (R44, PDF-READER #13) does the whole-file read a range needs and answers `{ok, pages, range({from, count, maxBytes})}`; this module
   keeps the open document between the pieces of one digest (one entry; replaced by another digest's, dropped by the last piece or
   a failed range), and a tick that finds its digest open does not read the object at all. Counted by WORK at the interface (R-CLOCK):
   the bytes the evidence store hands out each tick, and the pages of every piece against the one-piece read.
   (`openPdfRange` is pdf-reader's R44, merged before this module.) */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as pdfReader from "../../../src/pdfstructure.mjs";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";
import { synthPdf } from "./bigpdf.mjs";

const seam = () => assert.equal(typeof pdfReader.openPdfRange, "function", "seam: pdf-reader's openPdfRange (R44, PDF-READER #13) is not merged yet");
const PAGES = 60;

async function world(seed = 0, pages = PAGES) {
  const b = bucket();
  const bytes = synthPdf({ pages: pages + seed, linesPerPage: 30, targetBytes: 0 });
  const digest = await hold(b, bytes);
  return { b, store: evidenceStore(b), bytes, document: doc({ digest, bytes: bytes.length, ct: "application/pdf", format: "pdf" }) };
}
const tick = (w, cursor, extra = {}) => read(w.document, { evidence: w.store, env: {}, storeName: "bio", cursor, unitsBudget: Infinity, rangePages: 7, ...extra });
async function ticks(w, extra) {
  const out = [];
  let cursor = null;
  for (let guard = 0; guard < 100; guard++) {
    const served = w.b.served, calls = w.b.calls.length;
    const p = await tick(w, cursor, extra);
    out.push({ p, served: w.b.served - served, calls: w.b.calls.length - calls });
    if (p.more !== true) break;
    cursor = p.cursor;
  }
  return out;
}

test("R40 (G68): the pieces of a PDF after the first do not read the object: the first tick reads it once, the document stays open", async () => {
  seam();
  const w = await world();
  const run = await ticks(w);
  assert.ok(run.length >= Math.ceil(PAGES / 7), `${run.length} pieces`);
  assert.ok(run[0].served >= w.bytes.length, "the first tick reads the object");
  run.slice(1).forEach((t, i) => { assert.equal(t.served, 0, `tick ${i + 1}: bytes the store handed out`); assert.equal(t.calls, 0, `tick ${i + 1}: calls to the store`); });
  assert.equal(run[run.length - 1].p.more, false);
  assert.deepEqual(run.flatMap((t) => t.p.text_units.map((u) => u.extent.page)), Array.from({ length: PAGES }, (_, i) => i), "every page once, in order");
});

test("R40 (G68): the pieces from an open document are the one-piece read's units, page for page", async () => {
  seam();
  const w = await world();
  const want = await tick(w, null, { rangePages: 1000 });
  assert.equal(want.more, false);
  const run = await ticks(w);
  assert.deepEqual(run.flatMap((t) => t.p.text_units), want.text_units);
  assert.equal(run[0].p.reading.page_count, PAGES);
  assert.deepEqual(run[0].p.reading.provenance.text_scope, { pages: [0, 7] });
});

test("R40 (G68): one document is open at a time: another digest's piece replaces it, and the first, asked again, is read from the store; the last piece lets the document go", async () => {
  seam();
  const a = await world(0), c = await world(3);
  const a1 = await tick(a, null);
  assert.equal(a1.more, true);
  const c1 = await tick(c, null);   /* another digest opens: a's document is let go */
  const served = a.b.served;
  const a2 = await tick(a, a1.cursor);
  assert.ok(a.b.served - served >= a.bytes.length, "a's second piece reads the object again: its document was replaced");
  assert.equal(a2.piece.pages[0], 7);
  const cServed = c.b.served;
  const c2 = await tick(c, c1.cursor);   /* a's open document replaced c's */
  assert.ok(c.b.served - cServed >= c.bytes.length);
  assert.equal(c2.piece.pages[0], 7);
  /* the last piece: a read to its end, then a new first tick of the same digest reads the object again */
  let cursor = c2.cursor, last = c2;
  while (last.more) { last = await tick(c, cursor); cursor = last.cursor; }
  const before = c.b.served;
  await tick(c, null);
  assert.ok(c.b.served - before >= c.bytes.length, "after the last piece nothing is kept open");
});

test("R40 R24 (G68): a cursor for another page count is refused though the document is open; an open document is not read for a cursor of another kind", async () => {
  seam();
  const w = await world();
  const first = await tick(w, null);
  const cur = JSON.parse(Buffer.from(first.cursor, "base64url").toString());
  assert.equal(cur.k, "p");
  const bad = await tick(w, Buffer.from(JSON.stringify({ ...cur, n: cur.n + 1 })).toString("base64url"));
  assert.equal(bad.refused && bad.refused.code, "CURSOR_MISMATCH");
  assert.equal(bad.reading, undefined);
  const next = await tick(w, first.cursor);
  assert.equal(next.piece.pages[0], 7, "the right cursor still reads");
});
