/* calculations, fix round 9 (T51): R45 (G131d, S-3 (b)) an empty cell keeps its column, and R1's amendment (G123f) a range the
   provider answers `cells_truncated` with `next_row` is read on to its end. The same data is declared through every route
   `declareTable` has (a range of cells, a CSV file's bytes, a document's lines) and the routes must agree to the byte, so to the sha.
   The content provider is the real merged content over the fixture's reading, except where a test says it answers a window. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";
import { FILE_ENGINE } from "../../../src/calculations/index.mjs";

const F = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const HEADER = F.map((f) => f.name);
const code = (r) => (r && r.ok === false ? r.reason : "ok");
const declare = (w, source, extra = {}) => w.c.declareTable({ source, schema: { fields: F }, header: HEADER, by: V("bob"), ...extra });
const cell = (a, v) => ({ source: { kind: "sheet-cell", cell: a }, value: v, type: "s" });
const COLS = ["A", "B", "C"];
/* the cells of a block of rows, row 1 the header; an empty value is a cell the reader does not list (a spreadsheet lists none) */
const cellsOf = (rows, first = 1) => rows.flatMap((r, i) => r.flatMap((v, c) => (v === "" ? [] : [cell(`${COLS[c]}${first + i}`, v)])));
const readRows = async (w, sha, limit = 1000) => (await w.c.readTable({ sha, viewer: V("bob"), limit })).page.rows;
const csvText = (rows, sep = ",") => `${rows.map((r) => r.join(sep)).join("\n")}\n`;

/* the data of SHEET C17: an empty first column, a middle one, a last one, a whole empty row, all inside a small file */
const BODY = [["P100", "", "100"], ["", "P002", "7"], ["P003", "P004", ""], ["", "", ""], ["P005", "P006", "12"]];

test("R45 (G131d): a range whose first column is empty in every row keeps that column: the values after it do not move one column left, and the table is the CSV file's of the same data", async () => {
  const w = seeded();
  const body = BODY.map((r) => ["", r[1], r[2]]);
  const range = await declare(w, w.sheet(cellsOf(body, 2), "A2:C6"));
  assert.equal(code(range), "ok", JSON.stringify(range).slice(0, 300));
  assert.deepEqual(await readRows(w, range.sha), body, "payer empty, payee and amount in their columns");
  const file = await declare(w, w.csv(csvText([HEADER, ...body])));
  assert.equal(code(file), "ok");
  assert.equal(file.sha, range.sha, "one table has one sha whichever route made it");
});

test("R45 (G131d): a column empty in the middle of a range, and a whole empty row, each keep their place; the empty cells are counted whole", async () => {
  const w = seeded();
  const body = BODY.map((r) => [r[0], "", r[2]]);
  const mid = await declare(w, w.sheet(cellsOf(body, 2), "A2:C6"));
  assert.equal(code(mid), "ok");
  assert.deepEqual(await readRows(w, mid.sha), body, "the empty second column stays the second column, the empty row stays a row");
  const file = await declare(w, w.csv(csvText([HEADER, ...body])));
  assert.equal(file.sha, mid.sha);
  const empties = body.flat().filter((v) => v === "").length;
  assert.equal(mid.undetermined.count >= empties, true, "every empty cell is counted, none closed up");
  const noEmpty = await declare(w, w.sheet(cellsOf([["P1", "P2", "1"], ["P3", "P4", "2"]], 2), "A2:C3"));
  assert.deepEqual(await readRows(w, noEmpty.sha), [["P1", "P2", "1"], ["P3", "P4", "2"]], "control: no empty cell, as before");
  assert.equal(noEmpty.undetermined.count, 0);
});

test("R45 (G131d): a range that includes the declared header row, with the empty cells in its data rows, is the same table as its CSV file and its tab twin", async () => {
  const w = seeded();
  const all = [HEADER, ...BODY];
  const range = await declare(w, w.sheet(cellsOf(all, 1), "A1:C6"));
  assert.equal(code(range), "ok");
  assert.deepEqual(await readRows(w, range.sha), BODY);
  const comma = await declare(w, w.csv(csvText(all)));
  const tab = await declare(w, w.csv(csvText(all, "\t")));
  assert.equal(comma.sha, range.sha);
  assert.equal(tab.sha, range.sha);
});

/* a document whose index is lines of text (a tab file read as text: one unit a line), not a csv container */
function lined(w, rows, sep) {
  const text = csvText(rows, sep);
  const id = w.csv(text);
  const cap = w.content.contentRow(id).capture_sha;
  w.ex.readings[cap] = { pageCount: 1, captureFormat: "text" };
  w.ex.units[cap] = { units: rows.map((r, i) => ({ seq: i, extent: { kind: "doc-para", para: i }, ref: `u${i}`, text: r.join(sep), truncated: false })), state: "whole" };
  w.ev.m.delete(cap);
  return id;
}

test("R45 (G131d): a document extent whose text is lines keeps the empty cells of each line (P100,,100 is three cells), and a short line is padded and counted", async () => {
  const w = seeded();
  const all = [HEADER, ...BODY.slice(0, 3), ["P009", "P010"]];
  for (const sep of [",", "\t"]) {
    const t = await declare(w, lined(w, all, sep));
    assert.equal(code(t), "ok", sep);
    assert.deepEqual(await readRows(w, t.sha), [BODY[0], BODY[1], BODY[2], ["P009", "P010", ""]], JSON.stringify(sep));
    assert.ok(t.undetermined.count >= 4, "the empty cells are counted, the padded one too");
  }
  const a = await declare(w, lined(w, all, ","));
  const b = await declare(w, lined(w, all, "\t"));
  assert.equal(a.sha, b.sha, "the same sha whichever the delimiter");
  const csv = await declare(w, w.csv(csvText(all)));
  assert.equal(csv.sha, a.sha, "and the CSV file's bytes make the same table");
});

/* ---- R1 (G123f): a range over the call's bound is read on by next_row ---- */

const WINDOW = 4;   /* rows of a window of the provider under test */
function provider(w, { rows, honours = true, noNext = false, fail = null }) {
  const calls = [];
  const content = new Proxy(w.content, { get: (t, k) => (k === "cellsAt"
    ? async (id, opts = {}) => {
      calls.push(opts && opts.fromRow !== undefined ? opts.fromRow : null);
      if (fail !== null && calls.length === fail) throw new Error("the held bytes could not be read");
      const from = honours && opts && Number.isInteger(opts.fromRow) ? opts.fromRow : 2;
      const lines = rows.slice(from - 2, from - 2 + WINDOW);
      const next = from - 2 + WINDOW < rows.length ? from + WINDOW : null;
      return { content_id: id, cells: cellsOf(lines, from), ...(next !== null ? { cells_truncated: true, ...(noNext ? {} : { next_row: next }) } : {}) };
    }
    : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  const c = w.build({ content });
  return { c, calls };
}
const data = (n) => Array.from({ length: n }, (_, i) => [`P${String(i).padStart(3, "0")}`, "P002", String(1 + (i % 97))]);

test("R1 (G123f): a range the provider answers in windows (cells_truncated with next_row) is read on from next_row to the provider's last answer, the table made from all of it and equal to the CSV file's", async () => {
  const w = seeded({ construct: false });
  const rows = data(10);
  const { c, calls } = provider(w, { rows });
  const id = w.sheet([], "A2:C11");
  const r = await c.declareTable({ source: id, schema: { fields: F }, header: HEADER, by: V("bob") });
  assert.equal(code(r), "ok", JSON.stringify(r).slice(0, 300));
  assert.equal(r.rows, 10, "every row of the range, none lost at a window's edge, none read twice");
  assert.deepEqual(calls, [null, 6, 10], "the first call asks the range, each next asks from the row the last named");
  const ref = seeded();
  const file = await declare(ref, ref.csv(csvText([HEADER, ...rows])));
  assert.equal(r.sha, file.sha);
  assert.deepEqual((await c.readTable({ sha: r.sha, viewer: V("bob"), limit: 100 })).page.rows, rows);
});

test("R1 (G123f): a range ending exactly on a window's last row (no next_row) is whole, and a range of one window is read by one call", async () => {
  const w = seeded({ construct: false });
  const edge = provider(w, { rows: data(WINDOW) });
  const r = await edge.c.declareTable({ source: w.sheet([], `A2:C${WINDOW + 1}`), schema: { fields: F }, header: HEADER, by: V("bob") });
  assert.equal(code(r), "ok");
  assert.equal(r.rows, WINDOW);
  assert.deepEqual(edge.calls, [null], "one call");
});

test("R1 (G123f): a provider that cannot continue (it ignores fromRow, or names no next_row, or fails in a later call) is refused SOURCE_NOT_READ naming the range, nothing written, never a short table and never a loop", async () => {
  for (const [label, behave] of [["ignores fromRow", { honours: false }], ["no next_row", { noNext: true }], ["fails on the second call", { fail: 2 }]]) {
    const w = seeded({ construct: false });
    const { c, calls } = provider(w, { rows: data(10), ...behave });
    const before = w.count("calc_tables");
    const r = await c.declareTable({ source: w.sheet([], "A2:C11"), schema: { fields: F }, header: HEADER, by: V("bob") });
    assert.equal(code(r), "SOURCE_NOT_READ", label);
    assert.equal(typeof r.detail, "string", label);
    assert.ok(r.detail.length > 0, label);
    assert.equal(w.count("calc_tables"), before, `${label}: nothing written`);
    assert.ok(calls.length <= 3, `${label}: it stopped (${calls.length} calls)`);
  }
});

test("R9 (G123f): a formula in a later window of a range makes the table's engine the file's spreadsheet program, as it would in the first window; a range the provider cannot finish is never declared at all", async () => {
  const w = seeded({ construct: false });
  const rows = data(10);
  const content = new Proxy(w.content, { get: (t, k) => (k === "cellsAt"
    ? async (id, opts = {}) => {
      const from = opts && Number.isInteger(opts.fromRow) ? opts.fromRow : 2;
      const lines = rows.slice(from - 2, from - 2 + WINDOW);
      const next = from - 2 + WINDOW < rows.length ? from + WINDOW : null;
      const cells = cellsOf(lines, from);
      if (from > 2) cells[0] = { ...cells[0], formula: "A2&B2", cached: cells[0].value };   /* a formula only in the later windows */
      return { content_id: id, cells, ...(next !== null ? { cells_truncated: true, next_row: next } : {}) };
    }
    : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  const c = w.build({ content });
  const r = await c.declareTable({ source: w.sheet([], "A2:C11"), schema: { fields: F }, header: HEADER, by: V("bob") });
  assert.equal(code(r), "ok", JSON.stringify(r).slice(0, 300));
  assert.equal(r.source.engine.name, FILE_ENGINE, "the formula of window two is seen");
  const read = await c.readTable({ sha: r.sha, viewer: V("bob") });
  assert.equal(read.table.grade_facts.engine, FILE_ENGINE);
  assert.equal(read.table.grade_facts.grade, null, "a third-party engine's value is undetermined until measured (R9)");
});

/* the seam (red by name until content R52's `cellsAt(contentId, {fromRow})` merges, K4922): the REAL content over an extraction that answers a window
   of rows a call, a range over the window is read on to its end and is the CSV file's table */
test("R1 (G123f, seam: waits for CONTENT's cellsAt fromRow): the real content over a held sheet answered in windows is read to its last row, and equals the CSV file's table", async () => {
  const w = seeded();
  const rows = data(10);
  const d = w.document("held workbook");
  w.ex.readings[d.capSha] = { pageCount: 1, chain: [{ step: "layer", tier: 1, container: "xlsx", cap: null, measured_by: null, calibration: null }],
    textContainer: { sheets: ["S"] }, reading: { cells_held: ["S"] } };
  w.ex.cellsOf = (_sha, _sheet, { fromRow, toRow }) => {
    const last = Math.min(toRow, fromRow + WINDOW - 1);
    const next = last < toRow ? last + 1 : null;
    return { cells: cellsOf(rows.slice(fromRow - 2, last - 1), fromRow), interpreted: { sheet: "S", from_row: fromRow, to_row: last }, next_row: next };
  };
  const m = w.content.mint({ bundleId: d.bundleId, captureSha: d.capSha, extent: { kind: "sheet-range", sheet: "S", range: "A2:C11" }, mintedBy: V("bob") });
  assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
  const r = await declare(w, m.content_id);
  assert.equal(code(r), "ok", JSON.stringify(r).slice(0, 300));
  assert.equal(r.rows, 10);
  const file = await declare(w, w.csv(csvText([HEADER, ...rows])));
  assert.equal(r.sha, file.sha);
});
