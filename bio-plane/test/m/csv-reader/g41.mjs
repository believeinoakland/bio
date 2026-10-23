/* Helpers for g41-held.test.mjs (G41, K4636): the plane harness's CSV generator (`plane/shape/harness.mjs`, `csvChunks`)
 * reproduced byte for byte, so a body here is the body the shape runs read, and the row/column arithmetic the expected
 * cells are computed with, which shares no code with the reader. Not a test. */
import { CSV_SHEET_NAME } from "../../../src/csv-reader/index.mjs";

const encoder = new TextEncoder();

/** The harness's body of about `total` bytes: a header row, rows `i,"name i",amount,"council note i budget line"`, and a
 *  last row beginning LASTROWMARK. Returns the bytes, the record count (= the last row's number) and the generator's
 *  own cells (row, col, value), computed from the field lists and never from the reader. */
export function harnessCsv(total) {
  const fields = [["id", "name", "amount", "note"]];
  const lines = ["id,name,amount,note\n"];
  let n = 20;
  for (let i = 0; n < total; i++) {
    const line = `${i},"name ${i}",${(i * 37) % 9973}.${i % 100},"council note ${i} budget line"\n`;
    fields.push([String(i), `name ${i}`, `${(i * 37) % 9973}.${i % 100}`, `council note ${i} budget line`]);
    lines.push(line);
    n += line.length;
  }
  fields.push(["LASTROWMARK", "last name", "1.00", "the final row of the sheet"]);
  lines.push(`LASTROWMARK,"last name",1.00,"the final row of the sheet"\n`);
  return { bytes: encoder.encode(lines.join("")), rows: fields.length, fields };
}

/** The typed cell the entry must give the field at (row, col), both 1-based. */
export const letters = (c) => { let s = ""; for (let n = c; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s; return s; };
export const cellAt = (row, col, value) => ({
  source: { kind: "sheet-cell", ref: `${CSV_SHEET_NAME}!${letters(col)}${row}`, sheet: CSV_SHEET_NAME, cell: `${letters(col)}${row}` },
  value, type: "text", declared: null, cached: null, formula: null,
});

/** The cells of rows `fromRow..toRow`, columns `fromCol..toCol`, of a field list, empty fields left out (a measured emptiness). */
export function expectedCells(fields, { fromRow = 1, toRow = Infinity, fromCol = 1, toCol = Infinity } = {}) {
  const out = [];
  for (let r = fromRow; r <= Math.min(toRow, fields.length); r++) {
    fields[r - 1].forEach((v, c0) => {
      const c = c0 + 1;
      if (c >= fromCol && c <= toCol && v !== "") out.push(cellAt(r, c, v));
    });
  }
  return out;
}

/** The row number a cell reference ("B17040") names. */
export const rowOfCell = (cell) => Number(/\d+$/.exec(cell)[0]);
