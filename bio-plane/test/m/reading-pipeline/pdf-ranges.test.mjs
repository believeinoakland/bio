/* reading-pipeline R40 for a PDF (fix round 6, G26; K4606), at `read`'s interface over a stored PDF capture whose format entry
   reads page ranges (`structureRange`, pdf-reader). In pieces mode a PDF is read range by range, the cursor a page: each piece
   calls the entry once for its pages, never the whole-document `structure`, so a tick holds one range and the whole is one
   parse. The first piece's reading is the reading of its range; a later piece is units alone. Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read, PDF_RANGE_PAGES } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc, withEntry } from "./fixture.mjs";

const N = 1000;
const BUDGET = 512 * 1024;
const pageText = (p) => `Page ${p}. ` + "The budget of the department for the year. ".repeat(4);
function entryOf({ pages = N, text = pageText } = {}) {
  const calls = { range: [], whole: 0 };
  return { calls, entry: { format: "pdf", structure: async () => { calls.whole++; throw new Error("the whole document must not be parsed"); },
    structureRange: async (_bytes, { from, count }) => {
      calls.range.push([from, count]);
      const n = Math.max(0, Math.min(count, pages - from));
      const list = Array.from({ length: n }, (_, i) => ({ page: from + i, text: text(from + i), undetermined: [] }));
      return { ok: true, pages, from, count: n, text: { pages: list, undetermined: [], counts: { chars: list.reduce((a, p) => a + p.text.length, 0), undetermined: 0 } } };
    } } };
}
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
const world = async () => {
  const b = bucket(), d = await hold(b, "%PDF-1.7 ranges");
  return { b, document: doc({ digest: d, bytes: 15, ct: "application/pdf", format: "pdf" }) };
};

test("R40: a PDF read in pieces is read by page ranges, one structureRange call a piece from the cursor's page, the whole document never parsed; every page once, in order, seq the page", async () => {
  const { b, document } = await world();
  const { entry, calls } = entryOf();
  await withEntry(entry, async () => {
    const pieces = await allPieces(b, document);
    assert.equal(calls.whole, 0);
    assert.equal(pieces.length, Math.ceil(N / PDF_RANGE_PAGES));
    assert.deepEqual(calls.range, pieces.map((_, i) => [i * PDF_RANGE_PAGES, PDF_RANGE_PAGES]));
    const units = pieces.flatMap((p) => p.text_units);
    assert.deepEqual(units.map((u) => u.extent.page), Array.from({ length: N }, (_, i) => i));
    assert.deepEqual(units.map((u) => u.seq), units.map((u) => u.extent.page));
    assert.equal(units[N - 1].text, pageText(N - 1));
    assert.ok(pieces.slice(1).every((p) => p.reading === undefined), "a later piece is units alone");
    const last = pieces[pieces.length - 1];
    assert.equal(last.more, false); assert.equal(last.cursor, null);
    assert.equal(last.read_through, N); assert.equal(last.total, N, "for a PDF read_through and total count pages");
    assert.deepEqual(pieces[1].piece.pages, [PDF_RANGE_PAGES, 2 * PDF_RANGE_PAGES]);
  });
});

test("R40: the first piece of a PDF read in ranges is the reading of its range: page_count the document's, words_total null, the provenance saying which pages it digests", async () => {
  const { b, document } = await world();
  const { entry } = entryOf();
  await withEntry(entry, async () => {
    const first = await readOf(b, document, { unitsBudget: BUDGET, cursor: null, rangePages: 40 });
    assert.equal(first.more, true);
    assert.equal(first.reading.page_count, N);
    assert.equal(first.reading.words_total, null);
    assert.equal(first.reading.words_read, first.piece.words);
    assert.equal(first.text_units.length, 40);
    assert.deepEqual(first.reading.provenance.text_scope, { pages: [0, 40] });
  });
});

test("R40: a PDF read without a cursor is read whole by structure as before; a cursor for another page count, digest or shape is refused", async () => {
  const { b, document } = await world();
  const { entry, calls } = entryOf({ pages: 300 });
  const whole = { ok: true, pages: 3, text: { document: "a\nb", pages: [{ page: 0, text: "a", undetermined: [] }, { page: 1, text: "b", undetermined: [] }], undetermined: [], counts: { chars: 3, undetermined: 0 } }, notes: [] };
  await withEntry({ ...entry, structure: async () => whole }, async () => {
    const out = await readOf(b, document, { unitsBudget: BUDGET });
    assert.equal(out.text_units.length, 2); assert.equal(out.more, undefined); assert.equal(calls.range.length, 0);
    const first = await readOf(b, document, { unitsBudget: BUDGET, cursor: null, rangePages: 100 });
    assert.equal(first.more, true);
    const bad = await readOf(b, document, { unitsBudget: BUDGET, cursor: "not-a-cursor" });
    assert.equal(bad.refused && bad.refused.code, "CURSOR_MISMATCH"); assert.equal(bad.reading, undefined);
    await withEntry(entryOf({ pages: 200 }).entry, async () => {
      const other = await readOf(b, document, { unitsBudget: BUDGET, cursor: first.cursor });
      assert.equal(other.refused && other.refused.code, "CURSOR_MISMATCH");
    });
  });
});

test("R40: a range whose units do not fit the budget moves the cursor to the first page not carried, so no page is lost or doubled", async () => {
  const { b, document } = await world();
  const big = (p) => `Page ${p}. ` + "x".repeat(60 * 1024);
  const { entry } = entryOf({ pages: 50, text: big });
  await withEntry(entry, async () => {
    const pieces = await allPieces(b, document, { rangePages: 20, unitsBudget: 200 * 1024 });
    const pagesOf = pieces.flatMap((p) => p.text_units.map((u) => u.extent.page));
    assert.deepEqual(pagesOf, Array.from({ length: 50 }, (_, i) => i));
    assert.ok(pieces.every((p) => p.text_units.length >= 1));
  });
});
