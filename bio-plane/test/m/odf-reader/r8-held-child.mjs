/* The child of r8-held-cells.test.mjs: reads a big .ods at a capped heap and prints what it found. */
import { readFileSync } from "node:fs";
import { odsEntry } from "../../../src/odf.mjs";
import { gridCells } from "./r9.mjs";

const [bin, jsonPath] = process.argv.slice(2);
const { ROWS, COLS, pad } = JSON.parse(readFileSync(jsonPath, "utf8"));
const bytes = new Uint8Array(readFileSync(bin));
const parts = await odsEntry.parts(bytes);
const t = await odsEntry.text(parts, { inlineCellsMax: 1_000_000, yieldNow: async () => {} });
const s = t.sheets?.[0];
const lines = s ? s.text.split("\n") : [];
const from = 70000;
const win = await odsEntry.cellsIn(parts, { sheet: "Grid", fromRow: from, toRow: from + 10 });
const want = gridCells("Grid", COLS, from, from + 10, pad);
const lastWant = Array.from({ length: COLS }, (_, c) => `r${ROWS}c${c + 1}${pad}`).join("\t");
console.log(JSON.stringify({
  contentBytes: parts.declared?.total,
  checks: {
    ok: t.ok, cells: s?.cells, cells_held: s?.cells_held, usedRows: s?.usedRows, usedCols: s?.usedCols,
    lastLine: lines[lines.length - 1] === lastWant, cellCount: t.counts?.cells,
    window: win.ok && JSON.stringify(win.cells) === JSON.stringify(want),
  },
}));
