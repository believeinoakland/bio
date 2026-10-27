/* odf-reader R49 (fix round 9, G133a; S-2): held cells and windows. `text(partsOrBytes, {inlineCellsMax, yieldNow})` and
   the optional `cellsIn` slot, through the entry's real operations; the 20,400,000-byte content.xml runs in a child at
   --max-old-space-size=112. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { odsEntry } from "../../../src/odf.mjs";
import { ods, gridBody, gridCells, tableOf, rowOf, cellOf, floatOf } from "./r9.mjs";

const here = dirname(fileURLToPath(import.meta.url));

test("R49 inlineCellsMax: past the bound every sheet has cells null and cells_held true, and text, lineRows, extent and counts are the whole read's", async () => {
  const bytes = ods(gridBody(30, 4, { name: "A" }) + gridBody(10, 2, { name: "B" }));
  const whole = await odsEntry.text(bytes);
  assert.equal(whole.sheets[0].cells.length, 120);
  assert.equal("cells_held" in whole.sheets[0], false);
  const held = await odsEntry.text(bytes, { inlineCellsMax: 1000 });
  assert.equal(held.ok, true);
  for (const [i, s] of held.sheets.entries()) {
    assert.equal(s.cells, null);
    assert.equal(s.cells_held, true);
    for (const k of ["text", "lineRows", "usedRows", "usedCols", "range", "name", "hidden"]) assert.deepEqual(s[k], whole.sheets[i][k], k);
  }
  assert.deepEqual(held.counts, whole.counts);
  assert.equal(held.document, whole.document);
});

test("R49 inlineCellsMax: within the bound every cell is listed and no sheet says held", async () => {
  const bytes = ods(gridBody(3, 2));
  const whole = await odsEntry.text(bytes);
  const roomy = await odsEntry.text(bytes, { inlineCellsMax: 1e6 });
  assert.deepEqual(roomy.sheets[0].cells, whole.sheets[0].cells);
  assert.equal("cells_held" in roomy.sheets[0], false);
  const none = await odsEntry.text(bytes, { inlineCellsMax: 0 });
  assert.equal(none.sheets[0].cells, null);
});

test("R49 cellsIn: the typed cells of exactly those rows and columns, in row then column order, identical to the whole read's", async () => {
  const bytes = ods(gridBody(40, 5));
  const whole = (await odsEntry.text(bytes)).sheets[0].cells;
  assert.equal(typeof odsEntry.cellsIn, "function");
  const a = await odsEntry.cellsIn(bytes, { sheet: "Grid", fromRow: 10, toRow: 14 });
  assert.equal(a.ok, true);
  assert.deepEqual(a.cells, whole.slice(45, 70));
  assert.deepEqual(a.rows, { from: 10, to: 14 });
  assert.equal("next_row" in a, false);
  const b = await odsEntry.cellsIn(bytes, { sheet: 0, fromRow: 3, toRow: 4, fromCol: 2, toCol: 3 });
  assert.deepEqual(b.cells, gridCells("Grid", 5, 3, 4).filter((c) => /^[BC]/.test(c.source.cell)));
  const parts = await odsEntry.parts(bytes);
  assert.deepEqual((await odsEntry.cellsIn(parts, { sheet: "Grid", fromRow: 40, toRow: 40 })).cells, whole.slice(195));
});

test("R49 cellsIn: maxCells stops before the row that would pass it and names it; the first row is given whole", async () => {
  const bytes = ods(gridBody(20, 5));
  const a = await odsEntry.cellsIn(bytes, { sheet: "Grid", fromRow: 2, maxCells: 12 });
  assert.equal(a.ok, true);
  assert.equal(a.cells.length, 10);
  assert.deepEqual(a.rows, { from: 2, to: 3 });
  assert.equal(a.next_row, 4);
  const one = await odsEntry.cellsIn(bytes, { sheet: "Grid", fromRow: 2, maxCells: 1 });
  assert.equal(one.cells.length, 5);
  assert.equal(one.next_row, 3);
});

test("R49 cellsIn: no_such_sheet, bad_range and the guard's marker, never a throw", async () => {
  const bytes = ods(gridBody(3, 2));
  assert.deepEqual(await odsEntry.cellsIn(bytes, { sheet: "Nope" }), { ok: false, why: "no_such_sheet" });
  assert.deepEqual(await odsEntry.cellsIn(bytes, { sheet: "Grid", fromRow: 0 }), { ok: false, why: "bad_range" });
  assert.deepEqual(await odsEntry.cellsIn(bytes, { sheet: "Grid", fromRow: 5, toRow: 2 }), { ok: false, why: "bad_range" });
  for (const junk of [null, undefined, 7, "x", new Uint8Array(0), new Uint8Array([1, 2, 3]), {}]) {
    const r = await odsEntry.cellsIn(junk, { sheet: "Grid" });
    assert.equal(r.ok, false);
  }
  assert.equal((await odsEntry.cellsIn(bytes, null)).ok, false);
  const huge = ods(`<table:table table:name="H"><table:table-row table:number-rows-repeated="1000"><table:table-cell office:value-type="string" table:number-columns-repeated="1000"><text:p>x</text:p></table:table-cell></table:table-row></table:table>`);
  const over = await odsEntry.cellsIn(huge, { sheet: "H" });
  assert.equal(over.ok, false);
  assert.equal(over.why, "over_repeat_bound");
});

test("R49 yieldNow: awaited between windows when a function, the answer the same with or without it, a failing one ignored", async () => {
  const bytes = ods(gridBody(9000, 12, { pad: "-padding-padding" }));
  const plain = await odsEntry.text(bytes);
  let calls = 0;
  const yielded = await odsEntry.text(bytes, { yieldNow: async () => { calls++; } });
  assert.equal(calls >= 2, true, `windows: ${calls}`);
  assert.deepEqual(yielded, plain);
  const failing = await odsEntry.text(bytes, { yieldNow: () => { throw new Error("no"); } });
  assert.deepEqual(failing, plain);
  const notAFunction = await odsEntry.text(bytes, { yieldNow: 5 });
  assert.deepEqual(notAFunction, plain);
});

test("R49 two reads in flight at once keep their own repeat meters", async () => {
  const bytes = ods(gridBody(3000, 12, { pad: "-padding-padding" }));
  const huge = ods(`<table:table table:name="H"><table:table-row table:number-rows-repeated="1000"><table:table-cell office:value-type="string" table:number-columns-repeated="1000"><text:p>x</text:p></table:table-cell></table:table-row></table:table>`);
  const slow = async () => { await new Promise((r) => setTimeout(r, 1)); };
  const [a, b, c] = await Promise.all([odsEntry.text(bytes, { yieldNow: slow }), odsEntry.text(huge, { yieldNow: slow }), odsEntry.text(bytes, { yieldNow: slow })]);
  assert.equal(a.ok && a.sheets[0].usedRows, 3000);
  assert.equal(c.sheets[0].usedRows, 3000);
  assert.equal(b.undetermined[0].why, "over_repeat_bound");
});

test("R49 a 20,400,000-byte content.xml (172,302 cells) is read whole at --max-old-space-size=112: cells held, the last row in the text, cellsIn rows 70000-70010 equal the listing", async () => {
  const dir = mkdtempSync(join(tmpdir(), "odf-r49-"));
  try {
    const COLS = 2, ROWS = 86151; // 172,302 cells
    const base = gridBody(ROWS, COLS).length;
    const pad = "-".repeat(Math.round((20_400_000 - base - 1500) / (ROWS * COLS)));
    const body = gridBody(ROWS, COLS, { pad });
    const bytes = ods(body);
    writeFileSync(join(dir, "big.ods"), bytes);
    writeFileSync(join(dir, "expect.json"), JSON.stringify({ ROWS, COLS, pad }));
    const r = spawnSync(process.execPath, ["--max-old-space-size=112", join(here, "r8-held-child.mjs"), join(dir, "big.ods"), join(dir, "expect.json")], { encoding: "utf8", maxBuffer: 1 << 24 });
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    const got = JSON.parse(r.stdout.trim().split("\n").pop());
    assert.equal(got.contentBytes >= 20_300_000 && got.contentBytes <= 20_500_000, true, String(got.contentBytes));
    assert.deepEqual(got.checks, { ok: true, cells: null, cells_held: true, usedRows: ROWS, usedCols: COLS, lastLine: true, cellCount: ROWS * COLS, window: true });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
