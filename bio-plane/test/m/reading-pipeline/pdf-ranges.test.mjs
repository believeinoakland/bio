/* reading-pipeline R40 for a PDF (fix round 6, G26; K4606, K4608), at `read`'s interface over a stored PDF capture. In pieces mode a
   PDF is read range by range through pdf-reader's `extractPdfRange` (R43), the cursor a page: a tick holds one range, and the
   pieces together are the units of the one whole read, every page once, `seq` the page. The first piece's reading is the reading of
   its range; a later piece is units alone. Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read, PDF_RANGE_PAGES } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";
import { synthPdf } from "./bigpdf.mjs";

const N = 400;
const BUDGET = 512 * 1024;
const readOf = (b, document, opts = {}) => read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", ...opts });
async function allPieces(b, document, extra = {}) {
  const pieces = [];
  let cursor = null;
  for (let g = 0; g < 400; g++) {
    const out = await readOf(b, document, { unitsBudget: BUDGET, cursor, ...extra });
    pieces.push(out);
    if (out.more !== true) break;
    cursor = out.cursor;
  }
  return pieces;
}
const world = async (pages = N) => {
  const b = bucket(), bytes = synthPdf({ pages, linesPerPage: 30, targetBytes: 0 }), d = await hold(b, bytes);
  return { b, document: doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" }) };
};

test("R40: a PDF read in pieces is read by page ranges from the cursor's page: the units of the whole read, every page once in order, seq the page, a later piece units alone", async () => {
  const { b, document } = await world();
  const whole = await readOf(b, document, { unitsBudget: Infinity });
  assert.equal(whole.text_units.length, N);
  const pieces = await allPieces(b, document);
  assert.ok(pieces.length >= Math.ceil(N / PDF_RANGE_PAGES) && pieces.length < N / 20, `${pieces.length} pieces`);
  assert.deepEqual(pieces.flatMap((p) => p.text_units), whole.text_units);
  assert.deepEqual(pieces.flatMap((p) => p.text_units).map((u) => u.seq), Array.from({ length: N }, (_, i) => i));
  /* R40, R57 (K4911): a later range is its units and the facts its pages add; the chain of its own pages (`piece_chain`) is one, and no part of the first reading */
  assert.ok(pieces.slice(1).every((p) => p.reading === undefined || Object.keys(p.reading).every((k) => k === "piece_chain" || /^(?:ocr_|units_skipped|pictures_unread|legibility|folio_pages)/.test(k))), "a later piece is units and the facts its pages add");
  const last = pieces[pieces.length - 1];
  assert.equal(last.more, false); assert.equal(last.cursor, null);
  assert.equal(last.read_through, N); assert.equal(last.total, N, "for a PDF read_through and total count pages");
  assert.equal(pieces[1].piece.pages[0], pieces[0].piece.pages[1], "a piece starts where the one before ended");
});

test("R40: the first piece of a PDF read in ranges is the reading of its range: page_count the document's, words_total null, the provenance saying which pages it digests", async () => {
  const { b, document } = await world();
  const first = await readOf(b, document, { unitsBudget: BUDGET, cursor: null, rangePages: 40 });
  assert.equal(first.more, true);
  assert.equal(first.reading.page_count, N);
  assert.equal(first.reading.words_total, null);
  assert.equal(first.reading.words_read, first.piece.words);
  assert.equal(first.text_units.length, 40);
  assert.deepEqual(first.reading.provenance.text_scope, { pages: [0, 40] });
});

test("R40: a PDF read without a cursor is read whole as before; a cursor for another digest, page count or shape is refused", async () => {
  const { b, document } = await world(60);
  const out = await readOf(b, document, { unitsBudget: BUDGET });
  assert.equal(out.text_units.length, 60); assert.equal(out.more, undefined); assert.equal(out.reading.provenance.text_scope, undefined);
  const first = await readOf(b, document, { unitsBudget: BUDGET, cursor: null, rangePages: 20 });
  assert.equal(first.more, true);
  const bad = await readOf(b, document, { unitsBudget: BUDGET, cursor: "not-a-cursor" });
  assert.equal(bad.refused && bad.refused.code, "CURSOR_MISMATCH"); assert.equal(bad.reading, undefined);
  const other = await world(100);
  const mismatch = await readOf(other.b, other.document, { unitsBudget: BUDGET, cursor: first.cursor });
  assert.equal(mismatch.refused && mismatch.refused.code, "CURSOR_MISMATCH", "another digest");
});

test("R40: a range whose units do not fit the budget moves the cursor to the first page not carried, so no page is lost or doubled", async () => {
  const { b, document } = await world(50);
  const pieces = await allPieces(b, document, { rangePages: 20, unitsBudget: 6 * 1024 });
  const pagesOf = pieces.flatMap((p) => p.text_units.map((u) => u.extent.page));
  assert.deepEqual(pagesOf, Array.from({ length: 50 }, (_, i) => i));
  assert.ok(pieces.length > 3 && pieces.every((p) => p.text_units.length >= 1));
});
