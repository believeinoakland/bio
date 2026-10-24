/* csv-reader R6, R9, R18 at the standard's size (fix round 9, G131i; K4834): a CSV of exactly 50 MB and 1,048,576 rows (both
   bounds at once) is read in windows and its LAST row is in the text and reachable by cellsIn; the bytes pulled are at most
   twice the file. Heavy: this file runs alone (R-NOLOAD). The generator shares no code with the reader: 1,048,576 rows of 50
   bytes make exactly the 50 MB bound, and a row's cells are computed from its number. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { csvEntry } from "../../../src/csv-reader/index.mjs";
import * as F from "./fixtures.mjs";

const ROWS = F.ROWS_BOUND;
const pad = (n, w) => String(n).padStart(w, "0");
/** Row r: `<7-digit r>,<second field>,<x padding>\n` = 50 bytes; every 1,000th row's second field holds a doubled quote, every 4,001st a comma. */
const rowText = (r) => {
  const tag = r % 1000 === 0 ? `"q ""${pad(r, 7)}"" z"` : r % 4001 === 0 ? `"a, ${pad(r, 7)}, z"` : `name-${pad(r, 7)}`;
  return `${pad(r, 7)},${tag}`;
};
function build() {
  const out = new Uint8Array(F.BYTES_BOUND);
  let at = 0;
  const encoder = new TextEncoder();
  for (let r = 1; r <= ROWS; r++) {
    const base = rowText(r);
    const line = `${base},${"x".repeat(48 - base.length)}\n`;
    assert.equal(line.length, 50, `row ${r}: ${line.length}`);
    at += encoder.encodeInto(line, out.subarray(at)).written;
  }
  assert.equal(at, F.BYTES_BOUND);
  return out;
}
const valueOf = (r) => (r % 1000 === 0 ? `q "${pad(r, 7)}" z` : r % 4001 === 0 ? `a, ${pad(r, 7)}, z` : `name-${pad(r, 7)}`);

test("R6 R9 a CSV of exactly 50 MB and 1,048,576 rows is read: the last row is found, equal to the truth, and the counts are whole (SHEET C04)", async () => {
  const bytes = build();
  const t = await csvEntry.text(bytes, { inlineCellsMax: 512 * 1024 });
  assert.equal(t.ok, true);
  assert.equal(t.sheets[0].usedRows, ROWS);
  assert.equal(t.sheets[0].usedCols, 3);
  assert.equal(t.counts.cells, 3 * ROWS);
  assert.equal(t.sheets[0].cells, null);
  assert.equal(t.sheets[0].cells_held, true);
  assert.equal(t.sheets[0].lineRows.length, ROWS);
  assert.equal(t.sheets[0].lineRows.at(-1), ROWS);
  assert.ok(t.document.endsWith(`\n${pad(ROWS, 7)}\t${valueOf(ROWS)}\t${"x".repeat(48 - rowText(ROWS).length)}`), "the last row is the truth");
  assert.deepEqual(t.undetermined, []);
  const last = await csvEntry.cellsIn(bytes, { fromRow: ROWS, toRow: ROWS });
  assert.deepEqual(last.cells.map((c) => c.value), [pad(ROWS, 7), valueOf(ROWS), "x".repeat(48 - rowText(ROWS).length)]);
  const mid = await csvEntry.cellsIn(bytes, { fromRow: 524288, toRow: 524289 });
  assert.deepEqual(mid.cells.map((c) => c.value), [pad(524288, 7), valueOf(524288), "x".repeat(48 - rowText(524288).length), pad(524289, 7), valueOf(524289), "x".repeat(48 - rowText(524289).length)]);
});

test("R9 the bytes pulled reading 50 MB are at most twice the file's, and a point read at the last row pulls a window, not the offset", async () => {
  const bytes = build();
  const meter = { n: 0 };
  class Counting extends Uint8Array { subarray(a, b) { const r = super.subarray(a, b); meter.n += r.length; return r; } }
  const probe = new Counting(bytes.buffer, bytes.byteOffset, bytes.length);
  const parts = await csvEntry.parts(probe);
  assert.equal(parts.ok, true);
  const t = await csvEntry.text(parts, { inlineCellsMax: 512 * 1024 });
  assert.equal(t.ok, true);
  assert.ok(meter.n <= 2 * F.BYTES_BOUND + 65536, `pulled ${meter.n} of ${F.BYTES_BOUND}`);
  meter.n = 0;
  const r = await csvEntry.cellsIn(parts, { fromRow: ROWS - 1, toRow: ROWS });
  assert.deepEqual(r.cells.map((c) => c.value), [pad(ROWS - 1, 7), valueOf(ROWS - 1), "x".repeat(48 - rowText(ROWS - 1).length), pad(ROWS, 7), valueOf(ROWS), "x".repeat(48 - rowText(ROWS).length)]);
  assert.ok(meter.n <= 2 * 1048576 + 1024, `a point read at row ${ROWS} pulled ${meter.n} bytes`);
});
