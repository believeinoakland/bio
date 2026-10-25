/* workbooks R22 (exportRecipe is bounded: past the workbook bound refused with its size and bound, never a column past
   XFD, no whole-file base64 copy) and R23 (a bound table is read whole by asking for it: `rows: "all"`). Real
   `calculations` over a real captured CSV, as export.test.mjs builds them. Fix round 9, G182; K5017; S-31. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, xlsx, V } from "./fixture.mjs";
import { METHOD } from "../../../src/calc-grammar/index.mjs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { workbooksOps } from "../../../src/workbooks/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";

const RECIPE = {
  method: METHOD, inputs: [{ name: "pay", kind: "table" }],
  steps: [{ op: "count", as: "n", from: "pay" }], output: "n",
};
const XFD = 16384;

async function holdCalc(w, fields, rows) {
  const t = await w.table(fields, rows);
  const calcId = await w.calc({ inputs: [{ name: "pay", table: t }], recipe: RECIPE, kind: "count" });
  return { calcId, t };
}
const oneColumn = (n) => Array.from({ length: n }, (_, i) => [`r${i}`]);

test("R22 exportRecipe refuses a recipe past the workbook bound with its size and the bound, and accepts one at it; a refusal writes nothing", async () => {
  const w = await seeded();
  const bound = boundOf("workbook", "cells");
  /* the cells the recipe's own results and method sheets write, measured on a one-row table */
  const small = await holdCalc(w, [["v", "string"]], [["a"]]);
  const probe = await w.wb.exportRecipe({ calcId: small.calcId, viewer: V("bob") });
  assert.equal(probe.found, true);
  const overhead = probe.cells - 2;
  assert.ok(Number.isInteger(probe.cells) && overhead > 0, `the answer states the cells it wrote: ${probe.cells}`);
  /* one column of rows: header + rows + overhead cells */
  const atBound = await holdCalc(w, [["v", "string"]], oneColumn(bound - overhead - 1));
  const ok = await w.wb.exportRecipe({ calcId: atBound.calcId, viewer: V("bob") });
  assert.equal(ok.found, true, JSON.stringify(ok).slice(0, 300));
  assert.equal(ok.cells, bound, "exactly at the bound is accepted");
  const text = await xlsxEntry.text(ok.bytes);
  assert.equal(text.ok, true, "the file at the bound opens");
  const past = await holdCalc(w, [["v", "string"]], oneColumn(bound - overhead));
  const before = w.snapshot();
  const r = await w.wb.exportRecipe({ calcId: past.calcId, viewer: V("bob") });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "EXPORT_TOO_LARGE");
  assert.equal(r.cells, bound + 1, "the size it states");
  assert.equal(r.bound_cells, bound, "the bound it states, READ_BOUNDS' row");
  assert.equal(r.limit.bound, bound);
  assert.equal(r.limit.size, bound + 1);
  assert.equal(r.limit.key, "limit.workbook.cells");
  assert.equal(r.bytes, undefined, "no file");
  assert.deepEqual(w.snapshot(), before, "nothing written");
});

test("R22 exportRecipe never writes past column XFD: a table of 16,384 fields is accepted, one of 16,385 refused with its width and the bound", async () => {
  const w = await seeded();
  const wide = (n) => Array.from({ length: n }, (_, i) => [`c${i + 1}`, "string"]);
  const rowOf = (n) => [Array.from({ length: n }, (_, i) => `v${i + 1}`)];
  const ok = await holdCalc(w, wide(XFD), rowOf(XFD));
  const r = await w.wb.exportRecipe({ calcId: ok.calcId, viewer: V("bob") });
  assert.equal(r.found, true, JSON.stringify(r).slice(0, 300));
  const text = await xlsxEntry.text(r.bytes);
  const refs = text.sheets.find((s) => s.name === "pay").cells.map((c) => c.source.cell);
  assert.ok(refs.includes("XFD1") && refs.includes("XFD2"), "the last column is written");
  assert.ok(refs.every((x) => /^[A-Z]{1,3}[0-9]+$/.test(x)), "no reference past three letters");
  const over = await holdCalc(w, wide(XFD + 1), rowOf(XFD + 1));
  const before = w.snapshot();
  const no = await w.wb.exportRecipe({ calcId: over.calcId, viewer: V("bob") });
  assert.equal(no.ok, false);
  assert.equal(no.reason, "EXPORT_TOO_WIDE");
  assert.equal(no.columns, XFD + 1);
  assert.equal(no.bound_columns, XFD);
  assert.equal(no.bytes, undefined);
  assert.deepEqual(w.snapshot(), before, "nothing written");
});

test("R22 the export op carries the file as base64 built in pieces, never as one whole-file string handed to btoa, and the bytes decode to the file", async () => {
  const w = await seeded();
  const { calcId } = await holdCalc(w, [["v", "string"]], oneColumn(60000));
  const direct = await w.wb.exportRecipe({ calcId, viewer: V("bob") });
  assert.ok(direct.bytes.length > 300000, `a file of some size: ${direct.bytes.length}`);
  const url = new URL(`http://x/?calc=${calcId}&viewer=${V("bob")}`);
  const seen = [];
  const real = globalThis.btoa;
  globalThis.btoa = (s) => { seen.push(s.length); return real(s); };
  let r;
  try { r = await workbooksOps(w.wb, url, {}).workbookexport(); } finally { globalThis.btoa = real; }
  assert.equal(r.found, true);
  assert.deepEqual([...Buffer.from(r.bytes_base64, "base64")], [...direct.bytes], "the same file");
  assert.ok(seen.length > 1, "more than one piece");
  assert.ok(Math.max(...seen) <= 0x10000, `no piece is the whole file: ${Math.max(...seen)}`);
  /* the refusal passes through the op as the service gives it */
  const none = await workbooksOps(w.wb, new URL(`http://x/?calc=CALC-2026-9999&viewer=${V("bob")}`), {}).workbookexport();
  assert.deepEqual(none, { ok: true, found: false });
});

test("R23 a bind and an export of a table of more rows than one page carry every row, each asking calculations.readTable for rows: \"all\"", async () => {
  const w = await seeded();
  const ROWS = 1200;
  const rows = Array.from({ length: ROWS }, (_, i) => [String(i + 1)]);
  const t = await w.table([["amount", "number"]], rows);
  const calls = [];
  const real = w.calculations.readTable.bind(w.calculations);
  w.calculations.readTable = (args) => { calls.push({ ...args }); return real(args); };
  const cells = {};
  for (let i = 1; i <= ROWS; i++) cells[`A${i}`] = i;
  const cap = w.capture(xlsx([{ name: "Data", cells }])).capSha;
  const add = await w.wb.addWorkbook({ captureSha: cap, question: "q", period: "FY2025", project: w.P, by: V("bob") });
  assert.equal(add.ok, true, JSON.stringify(add).slice(0, 300));
  calls.length = 0;
  const b = await w.wb.bind({ captureSha: cap, project: w.P, range: `Data!A1:A${ROWS}`, input: { table: t, range: `A1:A${ROWS}` }, by: V("bob") });
  assert.equal(b.ok, true, JSON.stringify(b).slice(0, 300));
  assert.equal(b.binding.compared, ROWS, "every row of the table compared");
  assert.equal(b.binding.agrees, true);
  assert.ok(calls.some((c) => c.rows === "all"), "the bind asked for the whole table");
  assert.ok(calls.every((c) => c.rows === "all" || c.limit === 1), "any other read asked for one row only");
  /* the export */
  calls.length = 0;
  const calcId = await w.calc({ inputs: [{ name: "pay", table: t }], recipe: RECIPE, kind: "count" });
  const r = await w.wb.exportRecipe({ calcId, viewer: V("bob") });
  assert.equal(r.found, true, JSON.stringify(r).slice(0, 300));
  assert.ok(calls.some((c) => c.rows === "all"), "the export asked for the whole table");
  assert.ok(calls.every((c) => c.rows === "all" || c.limit === 1), "any other read asked for one row only");
  const text = await xlsxEntry.text(r.bytes);
  const pay = text.sheets.find((s) => s.name === "pay").cells;
  assert.equal(pay.filter((c) => c.source.cell.startsWith("A")).length, ROWS + 1, "the header and every row");
  assert.equal(pay.find((c) => c.source.cell === `A${ROWS + 1}`).value, String(ROWS), "the last row");
});
