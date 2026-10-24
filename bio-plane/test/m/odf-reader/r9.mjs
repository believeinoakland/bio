/* Shared builders for the fix-round-9 tests of odf-reader (R49-R55): spreadsheet, text and presentation bodies built
   the way a producer writes them, independent of the module under test. */
import { pkg } from "./pkg.mjs";
import { sheetCellRef } from "../../../src/formats-xlsx.mjs";

export const cellOf = (text, attrs = "") => `<table:table-cell office:value-type="string"${attrs ? " " + attrs : ""}><text:p>${text}</text:p></table:table-cell>`;
export const floatOf = (v) => `<table:table-cell office:value-type="float" office:value="${v}"><text:p>${v}</text:p></table:table-cell>`;
export const rowOf = (cells, attrs = "") => `<table:table-row${attrs ? " " + attrs : ""}>${cells}</table:table-row>`;
export const tableOf = (name, rows, attrs = "") => `<table:table table:name="${name}"${attrs ? " " + attrs : ""}>${rows}</table:table>`;
export const ods = (body, o = {}) => pkg("ods", { body, ...o });
export const odt = (body, o = {}) => pkg("odt", { body, ...o });
export const odp = (body, o = {}) => pkg("odp", { body, ...o });

/** A spreadsheet of `rows` rows of `cols` string cells, "r<row>c<col>" with `pad` more characters, one table. */
export function gridBody(rows, cols, { pad = "", name = "Grid" } = {}) {
  let out = `<table:table table:name="${name}"><table:table-column table:number-columns-repeated="${cols}"/>`;
  for (let r = 1; r <= rows; r++) {
    out += "<table:table-row>";
    for (let c = 1; c <= cols; c++) out += `<table:table-cell office:value-type="string"><text:p>r${r}c${c}${pad}</text:p></table:table-cell>`;
    out += "</table:table-row>";
  }
  return out + "</table:table>";
}

/** The cells (R46) the grid above holds, for the rows `from..to`, in row then column order. */
export function gridCells(sheet, cols, from, to, pad = "") {
  const out = [];
  const L = (i) => { let n = i, s = ""; do { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; } while (n >= 0); return s; };
  for (let r = from; r <= to; r++) for (let c = 1; c <= cols; c++) {
    out.push({ source: sheetCellRef(sheet, `${L(c - 1)}${r}`), value: `r${r}c${c}${pad}`, type: "text", declared: "string", cached: null, formula: null });
  }
  return out;
}
