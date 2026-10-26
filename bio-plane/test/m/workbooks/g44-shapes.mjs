/* G44: large workbooks as the member's file has them, built as real deflated packages (the office-readers fixtures'
   `xlsx`), each returned with its cell count, its formula count and the size its sheet part declares. Not a test. */
import * as F from "../office-readers/fixtures.mjs";

const NS = `xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"`;
const pack = (body, name = "Big") => {
  const xml = `<?xml version="1.0"?><worksheet ${NS}><sheetData>${body.join("")}</sheetData></worksheet>`;
  return { xml, declared: F.enc(xml).length };
};

/** `rows` rows of a number, an inline string and a decimal: 3 cells a row, the shape OFFICE-READERS #15 measured
 *  (73,792 rows declare 10 MiB). */
export function constants(rows) {
  const body = [];
  for (let r = 1; r <= rows; r++)
    body.push(`<row r="${r}"><c r="A${r}"><v>${r}</v></c><c r="B${r}" t="inlineStr"><is><t>w${String(r % 10007).padStart(5, "0")}</t></is></c><c r="C${r}" s="1"><v>${r}.5</v></c></row>`);
  const { xml, declared } = pack(body);
  return { bytes: F.xlsx({ sheets: [{ name: "Big", xml }] }), cells: rows * 3, formulas: 0, declared };
}

/** `cols` one-character cells a row: the smallest cell JSON, the most objects for a byte (the worst case for count). */
export function minimal(rows, cols = 8) {
  const body = [];
  for (let r = 1; r <= rows; r++) {
    let cs = "";
    for (let c = 0; c < cols; c++) cs += `<c r="${"ABCDEFGHIJKLMNOP"[c]}${r}"><v>1</v></c>`;
    body.push(`<row r="${r}">${cs}</row>`);
  }
  const { xml, declared } = pack(body);
  return { bytes: F.xlsx({ sheets: [{ name: "Big", xml }] }), cells: rows * cols, formulas: 0, declared };
}

/** `rows` rows of one constant and `perRow` formulas that each carry their cached value; `pad` terms lengthen each formula's text
 *  (`long` is 12 terms). */
export function formulas(rows, { perRow = 2, long = false, pad: terms = long ? 12 : 0 } = {}) {
  const body = [];
  const pad = terms ? "+" + Array.from({ length: terms }, (_, i) => `A$1*${i + 2}`).join("+") : "";
  for (let r = 1; r <= rows; r++) {
    let cs = `<c r="A${r}"><v>${r}</v></c>`;
    for (let k = 1; k <= perRow; k++) cs += `<c r="${"BCDEFG"[k - 1]}${r}"><f>A${r}*${k + 1}${pad}</f><v>${r * (k + 1)}</v></c>`;
    body.push(`<row r="${r}">${cs}</row>`);
  }
  const { xml, declared } = pack(body);
  return { bytes: F.xlsx({ sheets: [{ name: "Big", xml }] }), cells: rows * (perRow + 1), formulas: rows * perRow, declared };
}

/** `n` cells of `len` characters each: few cells, a great many bytes of cell JSON. */
export function wide(n, len) {
  const body = [];
  for (let r = 1; r <= n; r++) body.push(`<row r="${r}"><c r="A${r}" t="inlineStr"><is><t>${String(r % 10).repeat(len)}</t></is></c></row>`);
  const { xml, declared } = pack(body);
  return { bytes: F.xlsx({ sheets: [{ name: "Big", xml }] }), cells: n, formulas: 0, declared };
}

/** exactly `n` cells, eight a row: the first three of column A constants `1`, every tenth cell after them a formula
 *  (`A$1*2`, cached 2) and the rest one-character constants. The count is the point (SHEET X20). */
export function exact(n, cols = 8) {
  const body = [];
  let formulas = 0;
  for (let i = 0; i < n; i += cols) {
    const r = i / cols + 1;
    let cs = "";
    for (let c = 0; c < cols && i + c < n; c++) {
      const k = i + c, ref = `${"ABCDEFGHIJKLMNOP"[c]}${r}`;
      if (k >= 3 && k % 10 === 9) { cs += `<c r="${ref}"><f>A$1*2</f><v>2</v></c>`; formulas++; }
      else cs += `<c r="${ref}"><v>1</v></c>`;
    }
    body.push(`<row r="${r}">${cs}</row>`);
  }
  const { xml, declared } = pack(body);
  return { bytes: F.xlsx({ sheets: [{ name: "Big", xml }] }), cells: n, formulas, declared };
}
