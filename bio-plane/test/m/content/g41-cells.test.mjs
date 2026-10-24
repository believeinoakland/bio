/* content: a sheet whose cells the reading does not list (`cells_held`, fix round 6 G41) has its cells made from the held
   file when a member opens or cites a range (R52 `cellsAt`, now async). The held file is stood in by the fixture's
   `cellsOf` (the contract of `extraction.cellsOf`: `{cells, interpreted, next_row}` or `{cells: null, reason, why}`); the
   same cases through the real merged extraction on a 1 MB CSV are `g41-real.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";

const DOC = "INFO-2026-0041-a", NEW = "INFO-2026-0042-b";
const SHEET = "Data", ROWS = 400, COLS = "ABCD";

/** The generator's cell at (row, col): a value no other cell shares, so a wrong cell is never equal. */
const cellAt = (r, c, sheet = SHEET) => ({ source: { sheet, cell: `${COLS[c - 1]}${r}` }, value: String(r * 100 + c), type: "number",
                                           declared: null, cached: null, formula: null });
const sheetCells = (rows = ROWS, sheet = SHEET) => {
  const out = [];
  for (let r = 1; r <= rows; r++) for (let c = 1; c <= COLS.length; c++) out.push(cellAt(r, c, sheet));
  return out;
};
const readingOf = ({ held = true, rows = ROWS } = {}) => ({
  reading: { cells: held ? { [SHEET]: null } : { [SHEET]: sheetCells(rows) }, ...(held ? { cells_held: [SHEET] } : {}) },
  containerExtent: { levels: ["sheets"], sheets: [{ name: SHEET, rows, cols: COLS.length }], tables: [], images: [] },
  textContainer: "csv", captureFormat: "csv",
});
const sheetUnit = (rows = ROWS, text = "all rows") => ({
  extent: canonicalExtent({ kind: "sheet-range", sheet: SHEET, range: `A1:${COLS[COLS.length - 1]}${rows}` }), ref: "sheet Data", text });

/** A world holding a held sheet (its whole cell list stood in for the file) for DOC; `cite` mints a row over it. */
function held({ w = world(), id = DOC, text = "held sheet", rows = ROWS, listed = false, units = [sheetUnit(rows)] } = {}) {
  const cap = w.cap(`${id}-cap`, text);
  w.doc(id, [cap]);
  w.read(cap.sha, readingOf({ held: !listed, rows }), units);
  w.ex.heldSheets[cap.sha] = { [SHEET]: sheetCells(rows) };
  const cite = (extent) => {
    const m = w.content.mint({ bundleId: id, captureSha: cap.sha, extent, mintedBy: V("bo") });
    assert.equal(m.ok, true, JSON.stringify(m));
    return m.content_id;
  };
  return { w, cap, sha: cap.sha, cite };
}
const range = (range) => ({ kind: "sheet-range", sheet: SHEET, range });
const cellsOfRows = (rows, cols = [1, 2, 3, 4]) => rows.flatMap((r) => cols.map((c) => cellAt(r, c)));
const no = (got, reason) => { assert.equal(got.cells, null); assert.equal(got.reason, reason); assert.equal(typeof got.why, "string"); };

test("R52: a range of a held sheet answers the typed cells of the extent's rows, equal to the file's, and states the rows interpreted", async () => {
  const { w, cite, sha } = held();
  const id = cite(range("A397:D400"));
  const before = w.snapshot();
  const got = await w.content.cellsAt(id);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  assert.deepEqual(got.cells, cellsOfRows([397, 398, 399, 400]), "the last rows' cells, in row then column order");
  assert.deepEqual(got.interpreted, { sheet: SHEET, from_row: 397, to_row: 400 });
  assert.equal(got.cells_truncated, undefined);
  assert.equal(got.next_row, undefined);
  assert.deepEqual([got.content_id, got.capture_sha, got.extent_kind, got.extent], [id, sha, "sheet-range", { kind: "sheet-range", sheet: SHEET, range: "A397:D400" }]);
  assert.deepEqual(w.ex.cellsOfCalls, [{ sha, sheet: SHEET, fromRow: 397, toRow: 400, fromCol: 1, toCol: 4 }], "asked for the extent's box only");
});

test("R52: a sheet-cell of a held sheet answers that one cell; a cell the file does not hold is a measured empty list", async () => {
  const { w, cite, sha } = held();
  w.ex.heldSheets[sha][SHEET] = w.ex.heldSheets[sha][SHEET].filter((c) => c.source.cell !== "D5"); /* an empty cell inside the grid */
  const one = await w.content.cellsAt(cite({ kind: "sheet-cell", sheet: SHEET, cell: "C399" }));
  assert.deepEqual(one.cells, [cellAt(399, 3)]);
  assert.deepEqual(one.interpreted, { sheet: SHEET, from_row: 399, to_row: 399 });
  const none = await w.content.cellsAt(cite({ kind: "sheet-cell", sheet: SHEET, cell: "D5" }));
  assert.deepEqual(none.cells, [], "a cell with nothing in it is not undetermined");
});

test("R52: a column subset and a reversed-corner range of a held sheet answer exactly their cells, as a listed sheet does", async () => {
  const { w, cite } = held();
  const sub = await w.content.cellsAt(cite(range("B10:C12")));
  assert.deepEqual(sub.cells, cellsOfRows([10, 11, 12], [2, 3]), "only columns B and C");
  const rev = await w.content.cellsAt(cite(range("$C$12:b10")));
  assert.deepEqual(rev.cells, sub.cells, "a range spelled bottom-right first names the same cells");
  /* Control: the same extents over the same cells LISTED in the reading answer the same cells (no interpreted). */
  const l = held({ id: "INFO-2026-0043-c", text: "listed sheet", listed: true });
  const listed = await l.w.content.cellsAt(l.cite(range("$C$12:b10")));
  assert.deepEqual(listed.cells, sub.cells);
  assert.equal(listed.interpreted, undefined);
  assert.deepEqual(l.w.ex.cellsOfCalls, [], "a sheet the reading lists is never asked of the held file");
});

test("R52: a small sheet whose cells the reading lists answers as before and states no interpreted rows", async () => {
  const { w, cite } = held({ listed: true, rows: 6, units: [sheetUnit(6)] });
  const got = await w.content.cellsAt(cite(range("A2:D3")));
  assert.deepEqual(got.cells, cellsOfRows([2, 3]));
  for (const k of ["interpreted", "cells_truncated", "next_row"]) assert.equal(k in got, false, k);
  assert.deepEqual(w.ex.cellsOfCalls, []);
});

test("R52: a range over the bound of one call says cells_truncated and names next_row, never a silently shorter list", async () => {
  const { w, cite } = held();
  w.ex.cellsRangeMax = 10; /* 4 cells a row: two whole rows, the third would split */
  const got = await w.content.cellsAt(cite(range("A1:D400")));
  assert.equal(got.cells_truncated, true);
  assert.equal(got.next_row, 3);
  assert.deepEqual(got.cells, cellsOfRows([1, 2]), "whole rows only");
  assert.deepEqual(got.interpreted, { sheet: SHEET, from_row: 1, to_row: 2 });
  /* The next call from next_row picks up where the first stopped (a second extent, a second row). */
  const rest = await w.content.cellsAt(cite(range("A3:D4")));
  assert.deepEqual(rest.cells, cellsOfRows([3, 4]));
  assert.equal(rest.cells_truncated, undefined, "control: a range within the bound is not truncated");
});

test("R52: a held sheet's cells that cannot be made are null with a reason, never an empty list and never a throw", async () => {
  const mk = () => held();
  { const { w, cite } = mk(); const id = cite(range("A1:B2")); w.ex.provider.cellsOf = async () => { throw new Error("store down"); };
    no(await w.content.cellsAt(id), "not_read"); }
  { const { w, cite } = mk(); const id = cite(range("A1:B2")); w.ex.provider.cellsOf = async () => ({ cells: null, reason: "bytes_not_held", why: "transient" });
    no(await w.content.cellsAt(id), "not_read"); }
  { const { w, cite } = mk(); const id = cite(range("A1:B2")); w.ex.provider.cellsOf = async () => ({ cells: null, reason: "cells_not_held", why: "no such sheet" });
    const got = await w.content.cellsAt(id); no(got, "cells_not_held"); assert.equal(got.why, "no such sheet"); }
  { const { w, cite } = mk(); const id = cite(range("A1:B2")); delete w.ex.provider.cellsOf; no(await w.content.cellsAt(id), "not_read"); }
  { const { w, cite } = mk(); const id = cite(range("A1:B2")); w.ex.provider.cellsOf = async () => null; no(await w.content.cellsAt(id), "not_read"); }
  /* The refusals before the held arm are unchanged: a stale row, another kind, no row. */
  const { w, sha, cite } = mk();
  const id = cite(range("A1:B2"));
  assert.equal((await w.content.cellsAt(id)).cells.length, 4, "control: read before the re-read");
  w.content.markStale(sha, [{ step: "layer", tier: 1, container: "csv", cap: null, mark: "re-read" }]);
  no(await w.content.cellsAt(id), "stale");
  no(await w.content.cellsAt(cite({ kind: "document" })), "not_a_sheet_extent");
  no(await w.content.cellsAt("f".repeat(64)), "not_held");
  assert.equal(w.ex.cellsOfCalls.length, 1, "a stale or other-kind row is refused before the file is asked");
});

test("R46: a held sheet's passage text is the indexed unit's, a cell of it is not held whole, and the cells are not asked for it", async () => {
  const { w, cite } = held({ units: [sheetUnit(ROWS, "r1\tr2")] });
  assert.equal(w.content.passageText(cite(range(`A1:D${ROWS}`))), "r1\tr2", "the units rule, as for a sheet with no list");
  assert.equal(w.content.passageText(cite({ kind: "sheet-cell", sheet: SHEET, cell: "B2" })), null);
  assert.deepEqual(w.ex.cellsOfCalls, [], "passageText is synchronous and never reads the held file");
});

test("R31: the version notice of a passage in a held sheet grades by the units, as for a sheet with no list", async () => {
  const w = world();
  const a = held({ w, units: [sheetUnit(ROWS, "rows v1")] });
  const b = held({ w, id: NEW, text: "held sheet v2", units: [sheetUnit(ROWS, "rows v1")] });
  w.prov.recordReceipt({ address: "https://ex.org/d.csv", addressNorm: "ex.org/d.csv", captureSha: a.sha, retrieved: "2026-09-01T00:00:00Z" });
  w.prov.recordReceipt({ address: "https://ex.org/d.csv", addressNorm: "ex.org/d.csv", captureSha: b.sha, retrieved: "2026-09-20T00:00:00Z" });
  const notice = (id) => w.content.passageNotice({ contentId: id, viewer: V("bo") }).candidates[0];
  assert.equal(notice(a.cite(range(`A1:D${ROWS}`))).grade, "A", "identical units");
  w.ex.units[b.sha] = { units: [sheetUnit(ROWS, "rows v2 are different words")], state: "whole" };
  assert.equal(notice(a.cite(range(`A1:D${ROWS}`))).affects, "affected", "changed units");
  assert.deepEqual(w.ex.cellsOfCalls, [], "the notice is synchronous and never reads the held file");
  /* A cell: no unit carries it, so it is undetermined, as a sheet with no list answers. */
  assert.equal(notice(a.cite({ kind: "sheet-cell", sheet: SHEET, cell: "B2" })).grade, "UNDETERMINED");
});

test("R52 (K4922): cellsAt(id, {fromRow}) answers the extent's cells from that row, with cells_truncated and next_row as for the first window, so a range is read over the window call after call", async () => {
  const { w, cite, sha } = held();
  w.ex.cellsRangeMax = 20;   /* five rows of four cells a call */
  const id = cite(range("A1:D400"));
  const first = await w.content.cellsAt(id);
  assert.equal(first.cells_truncated, true);
  const seen = [...first.cells];
  let next = first.next_row, calls = 1;
  while (next) {
    const part = await w.content.cellsAt(id, { fromRow: next });
    assert.deepEqual(part.cells.slice(0, 4), cellsOfRows([next]), "begins at the row asked for");
    assert.equal(part.interpreted.from_row, next);
    seen.push(...part.cells);
    next = part.cells_truncated ? part.next_row : null;
    calls++;
  }
  assert.deepEqual(seen, cellsOfRows(Array.from({ length: 400 }, (_, i) => i + 1)), "every row once, in order");
  assert.equal(calls, 100, "four whole rows a call of 20 cells");
  assert.equal(w.ex.cellsOfCalls.at(-1).fromRow, 397);
  /* the first row of the extent is a fromRow like any other; a column subset is kept */
  const sub = await w.content.cellsAt(cite(range("B10:C12")), { fromRow: 11 });
  assert.deepEqual(sub.cells, cellsOfRows([11, 12], [2, 3]));
  /* a listed sheet is answered from row fromRow too (no interpreted, nothing truncated) */
  const l = held({ listed: true, id: NEW });
  const lid = l.cite(range("A1:D400"));
  assert.deepEqual((await l.w.content.cellsAt(lid, { fromRow: 399 })).cells, cellsOfRows([399, 400]));
  assert.equal((await l.w.content.cellsAt(lid, { fromRow: 1 })).cells.length, 1600);
  assert.equal(sha.length, 64);
});

test("R52 (K4922): a fromRow outside the extent, or not a whole number from 1, is refused and stated, nothing read", async () => {
  const { w, cite } = held();
  const id = cite(range("A10:D20"));
  const calls = w.ex.cellsOfCalls.length;
  for (const bad of [9, 21, 0, -1, 10.5, "11", NaN, Infinity, {}])
    no(await w.content.cellsAt(id, { fromRow: bad }), "from_row_outside_extent");
  assert.equal(w.ex.cellsOfCalls.length, calls, "the file is not asked");
  no(await w.content.cellsAt(cite({ kind: "sheet-cell", sheet: SHEET, cell: "B7" }), { fromRow: 8 }), "from_row_outside_extent");
  assert.equal((await w.content.cellsAt(cite({ kind: "sheet-cell", sheet: SHEET, cell: "B7" }), { fromRow: 7 })).cells.length, 1);
  const l = held({ listed: true, id: NEW });
  no(await l.w.content.cellsAt(l.cite(range("A10:D20")), { fromRow: 21 }), "from_row_outside_extent");
  /* control: none, null and an empty options object are the first window as before */
  for (const o of [undefined, null, {}, { fromRow: null }, { fromRow: undefined }])
    assert.equal((await w.content.cellsAt(id, o)).cells.length, 44);
  /* the other refusals come first */
  no(await w.content.cellsAt("0".repeat(64), { fromRow: 5 }), "not_held");
});
