/* csv-reader, G41 (K4636, K4642): a sheet's typed cells are not all made at intake. Proposed R17 (the inline cap, opt-in;
   `cells_held`) and R18 (`cellsIn`, the typed cells of a range made from the held body). Every body is built here by a route
   that shares no code with the reader, and every test goes through the entry's real interface (`csvEntry.text/cellsIn`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { csvEntry, CSV_SHEET_NAME } from "../../../src/csv-reader/index.mjs";
import { enc } from "./fixtures.mjs";
import { harnessCsv, expectedCells, cellAt, rowOfCell } from "./g41.mjs";

const MIB = 1024 * 1024;
const INLINE = 512 * 1024;   // INLINE_CELLS_MAX_BYTES: what reading-pipeline passes as `inlineCellsMax`

const jsonBytes = (v) => new TextEncoder().encode(JSON.stringify(v)).length;

test("R17 (proposed) a 1 MB CSV read with {inlineCellsMax} has cells null and cells_held true; its text and lineRows are those of the whole read", async () => {
  const { bytes, rows } = harnessCsv(MIB);
  const all = (await csvEntry.text(bytes)).sheets[0];                  // no option: every cell, as before
  assert.equal(all.cells.length, rows * 4);
  assert.equal("cells_held" in all, false);
  const t = await csvEntry.text(bytes, { inlineCellsMax: INLINE });
  assert.equal(t.ok, true);
  const s = t.sheets[0];
  assert.ok(s.cells === null, "cells is null (held)");
  assert.equal(s.cells_held, true);
  assert.equal(s.text, all.text);
  assert.deepEqual(s.lineRows, all.lineRows);
  assert.equal(s.usedRows, rows);
  assert.equal(s.usedCols, 4);
  assert.deepEqual(s.undetermined, []);
  assert.equal(t.counts.cells, rows * 4, "the count of cells is the sheet's, held or listed");
  assert.equal(t.document, s.text);
  assert.equal(t.piecewise, undefined, "piecewise keeps meaning 'over the bound, read in pieces' and is not set by this rule");
  assert.ok(s.text.includes("LASTROWMARK"), "the last row is in the text");
});

test("R17 (proposed) controls: no option lists every cell; a 3-row CSV lists its cells and has no marker, with the option too", async () => {
  const small = enc("a,b\nc,d\ne,f\n");
  for (const opts of [undefined, { inlineCellsMax: INLINE }]) {
    const s = (await csvEntry.text(small, opts)).sheets[0];
    assert.deepEqual(s.cells, expectedCells([["a", "b"], ["c", "d"], ["e", "f"]]));
    assert.equal("cells_held" in s, false);
  }
  const { bytes, rows } = harnessCsv(200 * 1024);                      // over the windowed walk's threshold, cells far over the cap
  const noOption = (await csvEntry.text(bytes)).sheets[0];
  assert.equal(noOption.cells.length, rows * 4);
  assert.equal("cells_held" in noOption, false);
});

test("R17 (proposed) the cap is on the sheet's cells JSON in bytes: a body whose cells fit exactly are listed, one byte under the fit they are held", async () => {
  const { bytes, fields } = harnessCsv(40 * 1024);
  const listed = (await csvEntry.text(bytes)).sheets[0].cells;
  assert.deepEqual(listed, expectedCells(fields));
  const size = jsonBytes(listed);
  const fit = (await csvEntry.text(bytes, { inlineCellsMax: size })).sheets[0];
  assert.ok(fit.cells != null && fit.cells.length === listed.length, "the cells that fit are listed");
  assert.equal("cells_held" in fit, false);
  const over = (await csvEntry.text(bytes, { inlineCellsMax: size - 1 })).sheets[0];
  assert.ok(over.cells === null, "cells is null (held)");
  assert.equal(over.cells_held, true);
});

test("R17 (proposed) a body over the size bound read in pieces: cells null, cells_held true, piecewise stated, with or without the option", async () => {
  const { bytes } = harnessCsv(21 * MIB);
  for (const opts of [undefined, { inlineCellsMax: INLINE }]) {
    const t = await csvEntry.text(bytes, opts);
    assert.equal(t.ok, true);
    assert.ok(t.sheets[0].cells === null, "cells is null");
    assert.equal(t.sheets[0].cells_held, true);
    assert.ok(t.piecewise);
  }
});

/* ------------------------------------------------------------------ */

test("R18 (proposed) cellsIn: rows 17,040 to the last of a 1 MB CSV equal the cells the whole read makes for them", async () => {
  const { bytes, rows, fields } = harnessCsv(MIB);
  const fromRow = rows - 1058;
  const whole = (await csvEntry.text(bytes)).sheets[0].cells.filter((c) => rowOfCell(c.source.cell) >= fromRow);
  const r = await csvEntry.cellsIn(bytes, { sheet: CSV_SHEET_NAME, fromRow, toRow: rows });
  assert.equal(r.ok, true);
  assert.deepEqual(r.cells, whole);
  assert.deepEqual(r.cells, expectedCells(fields, { fromRow, toRow: rows }));
  assert.deepEqual(r.rows, { from: fromRow, to: rows });
  assert.equal(r.next_row ?? null, null);
  assert.deepEqual(r.cells.at(-4), cellAt(rows, 1, "LASTROWMARK"));
});

test("R18 (proposed) cellsIn: a column subset, a toRow past the end, rows before any, a range of empty rows", async () => {
  const { bytes, rows, fields } = harnessCsv(MIB);
  const sub = await csvEntry.cellsIn(bytes, { fromRow: 100, toRow: 120, fromCol: 2, toCol: 3 });
  assert.deepEqual(sub.cells, expectedCells(fields, { fromRow: 100, toRow: 120, fromCol: 2, toCol: 3 }));
  assert.deepEqual(sub.rows, { from: 100, to: 120 });
  const past = await csvEntry.cellsIn(bytes, { fromRow: rows - 1, toRow: rows + 500 });
  assert.deepEqual(past.cells, expectedCells(fields, { fromRow: rows - 1 }));
  assert.deepEqual(past.rows, { from: rows - 1, to: rows });
  const first = await csvEntry.cellsIn(bytes, { sheet: 0, fromRow: 1, toRow: 2 });
  assert.deepEqual(first.cells, expectedCells(fields, { fromRow: 1, toRow: 2 }));
  const blanks = await csvEntry.cellsIn(enc("a,b\n,\n,\nc,d\n"), { fromRow: 2, toRow: 3 });
  assert.deepEqual(blanks.cells, []);
  assert.deepEqual(blanks.rows, { from: 2, to: 3 });
});

test("R18 (proposed) cellsIn: maxCells stops at a row boundary and next_row names the row to resume at; resuming reproduces the whole range", async () => {
  const { bytes, rows, fields } = harnessCsv(MIB);
  const fromRow = rows - 1058;
  const first = await csvEntry.cellsIn(bytes, { fromRow, toRow: rows, maxCells: 102 });
  assert.equal(first.cells.length, 100, "25 whole rows of 4; a 26th would pass 102");
  assert.equal(first.next_row, fromRow + 25);
  assert.deepEqual(first.rows, { from: fromRow, to: fromRow + 24 });
  assert.deepEqual(first.cells, expectedCells(fields, { fromRow, toRow: fromRow + 24 }));
  const one = await csvEntry.cellsIn(bytes, { fromRow, toRow: rows, maxCells: 2 });
  assert.equal(one.cells.length, 4, "a first row alone over maxCells is given whole, so every call advances");
  assert.equal(one.next_row, fromRow + 1);
  const got = []; let at = fromRow, calls = 0;
  while (at != null && calls++ < 100) {
    const r = await csvEntry.cellsIn(bytes, { fromRow: at, toRow: rows, maxCells: 500 });
    got.push(...r.cells); at = r.next_row ?? null;
  }
  assert.deepEqual(got, expectedCells(fields, { fromRow, toRow: rows }));
  const full = await csvEntry.cellsIn(bytes, { fromRow, toRow: fromRow + 9, maxCells: 40 });
  assert.equal(full.next_row ?? null, null, "the range ended exactly at the limit: nothing left to name");
  assert.equal(full.cells.length, 40);
});

/** A body of about 2.2 MiB whose 1 MiB and 2 MiB window edges fall inside a `""` of a quoted field holding a line break and
 *  between the CR and LF of a record end, with a byte no encoding reads past the signature's head. */
function edgeBody() {
  const fields = [];
  let text = "";
  const add = (row, raw) => { fields.push(row); text += raw; };
  const fill = (target) => { for (let i = 0; text.length < target; i++) add([`r${i}`, `val ${i}`, "x"], `r${i},val ${i},x\n`); };
  fill(MIB - 100);
  /* the first `"` of the doubled quote is the byte at 1 MiB - 1: the second is the first byte of the next window */
  const pad = "p".repeat(MIB - 1 - (text.length + 3));
  add(["q", `${pad}"end\nsecond line`, "z"], `q,"${pad}""end\nsecond line",z\n`);
  fill(2 * MIB - 100);
  /* the CR is the byte at 2 MiB - 1, the LF the first byte of the next window */
  const tail = "t".repeat(2 * MIB - 1 - (text.length + 4));
  add(["s", "t", tail], `s,t,${tail}\r\n`);
  add(["after", "edge", "ok"], "after,edge,ok\n");
  add(["bad", "\u0001", "ok"], "bad,\u0001,ok\n");                 // \u0001 becomes the byte 0x96 below
  add(["last", "row", "ok"], "last,row,ok\n");
  const bytes = new TextEncoder().encode(text);
  const at = bytes.lastIndexOf(1);
  bytes[at] = 0x96;
  fields[fields.length - 2][1] = null;                             // an unreadable field: a cell with a null value
  return { bytes, fields };
}

test("R18 (proposed) cellsIn equals the whole read at the window edges: a quoted line break split mid-quote, a CRLF split, an unreadable field", async () => {
  const { bytes, fields } = edgeBody();
  /* the fixture's own claim: the edges fall where the test says */
  assert.deepEqual([bytes[MIB - 1], bytes[MIB]], [0x22, 0x22], "the two quotes of a doubled quote straddle the first window edge");
  assert.deepEqual([bytes[2 * MIB - 1], bytes[2 * MIB]], [0x0d, 0x0a], "the CR and LF of a record end straddle the second");
  const rows = fields.length;
  const whole = await csvEntry.text(bytes);
  assert.deepEqual(whole.sheets[0].cells, expectedCells(fields), "the whole read agrees with the generator");
  const quotedRow = fields.findIndex((f) => f[0] === "q") + 1;
  for (const [fromRow, toRow] of [[quotedRow, quotedRow], [quotedRow - 1, quotedRow + 1], [rows - 4, rows], [1, rows]]) {
    const r = await csvEntry.cellsIn(bytes, { fromRow, toRow });
    assert.equal(r.ok, true);
    assert.deepEqual(r.cells, expectedCells(fields, { fromRow, toRow }), `rows ${fromRow}-${toRow}`);
    assert.deepEqual(r.cells, whole.sheets[0].cells.filter((c) => { const n = rowOfCell(c.source.cell); return n >= fromRow && n <= toRow; }));
  }
  const bad = await csvEntry.cellsIn(bytes, { fromRow: rows - 1, toRow: rows - 1 });
  assert.deepEqual(bad.cells, [cellAt(rows - 1, 1, "bad"), cellAt(rows - 1, 2, null), cellAt(rows - 1, 3, "ok")]);
});

test("R18 (proposed) cellsIn: a held CSV in UTF-16 and with a BOM give the same cells as the whole read; the sheet name is csv", async () => {
  const text = "id,name\n1,ann\n2,\"bo, b\"\n3,cy\n";
  const u16 = new Uint8Array(2 + text.length * 2);
  u16.set([0xff, 0xfe]);
  for (let i = 0; i < text.length; i++) { u16[2 + 2 * i] = text.charCodeAt(i); u16[3 + 2 * i] = 0; }
  const bom = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode(text)]);
  for (const body of [u16, bom]) {
    const whole = (await csvEntry.text(body)).sheets[0].cells;
    const r = await csvEntry.cellsIn(body, { sheet: "csv", fromRow: 2, toRow: 3 });
    assert.deepEqual(r.cells, whole.filter((c) => { const n = rowOfCell(c.source.cell); return n >= 2 && n <= 3; }));
    assert.equal(r.cells[0].source.sheet, CSV_SHEET_NAME);
  }
});

test("R18 (proposed) cellsIn never throws: no such sheet, a bad range, an empty body, a body over the ceiling are answers", async () => {
  const body = enc("a,b\nc,d\n");
  assert.deepEqual(await csvEntry.cellsIn(body, { sheet: "other", fromRow: 1, toRow: 2 }), { ok: false, why: "no_such_sheet" });
  assert.deepEqual(await csvEntry.cellsIn(body, { sheet: 1, fromRow: 1, toRow: 2 }), { ok: false, why: "no_such_sheet" });
  for (const bad of [{ fromRow: 0, toRow: 1 }, { fromRow: 3, toRow: 2 }, { fromRow: 1.5, toRow: 2 }, { fromRow: 1, toRow: 2, fromCol: 0 }, { fromRow: 1, toRow: 2, fromCol: 3, toCol: 2 }, { fromRow: 1, toRow: 2, maxCells: 0 }]) {
    assert.deepEqual(await csvEntry.cellsIn(body, bad), { ok: false, why: "bad_range" }, JSON.stringify(bad));
  }
  assert.deepEqual(await csvEntry.cellsIn(new Uint8Array(0), { fromRow: 1, toRow: 1 }), { ok: false, why: "empty_body" });
  assert.deepEqual(await csvEntry.cellsIn(null, { fromRow: 1, toRow: 1 }), { ok: false, why: "empty_body" });
  const huge = await csvEntry.cellsIn(new Uint8Array(32 * MIB + 1).fill(0x61), { fromRow: 1, toRow: 1 });
  assert.equal(huge.ok, false);
  assert.equal(huge.why, "over_size_bound");
  assert.equal(huge.final, true);
  const parts = await csvEntry.parts(body);
  assert.deepEqual((await csvEntry.cellsIn(parts, { fromRow: 2, toRow: 2 })).cells, expectedCells([["a", "b"], ["c", "d"]], { fromRow: 2, toRow: 2 }));
});

/** UTF-16LE with a BOM from a string. */
const utf16le = (text) => {
  const u = new Uint8Array(2 + text.length * 2);
  u.set([0xff, 0xfe]);
  for (let i = 0; i < text.length; i++) { const c = text.charCodeAt(i); u[2 + 2 * i] = c & 0xff; u[3 + 2 * i] = c >> 8; }
  return u;
};

test("R18 (proposed) a UTF-16 body over the window size: a surrogate pair split across two windows reads whole; a lone surrogate is a stated unreadable cell, as in the whole read", async () => {
  const fields = [];
  let text = "";
  /* the body's window edge is at the byte 1 MiB after the 2-byte BOM, so the character index 2^19 begins the second window */
  for (let i = 0; text.length < (1 << 19) - 40; i++) { fields.push([`r${i}`, "v", "w"]); text += `r${i},v,w\n`; }
  const pad = "p".repeat((1 << 19) - 1 - (text.length + 3));
  fields.push(["e", `${pad}\u{1F600}`, "z"]);                       // the pair's high surrogate is the last unit of window one
  text += `e,${pad}\u{1F600},z\n`;
  for (let i = 0; i < 50; i++) { fields.push([`s${i}`, "v", "w"]); text += `s${i},v,w\n`; }
  const valid = utf16le(text);
  assert.ok(valid.length > (1 << 20) + 2);
  const whole = (await csvEntry.text(valid)).sheets[0].cells;
  assert.deepEqual(whole, expectedCells(fields));
  const row = fields.findIndex((f) => f[0] === "e") + 1;
  const got = await csvEntry.cellsIn(valid, { fromRow: row, toRow: row });
  assert.deepEqual(got.cells, expectedCells(fields, { fromRow: row, toRow: row }));
  assert.ok(got.cells[1].value.endsWith("\u{1F600}"));

  const broken = utf16le(text.replace("s7,", "\ud800,"));               // a lone high surrogate: not valid UTF-16
  const t = await csvEntry.text(broken);
  const bad = t.undetermined.filter((u) => u.reason === "invalid_utf16");
  assert.equal(bad.length, 1);
  const s7 = fields.findIndex((f) => f[0] === "s7") + 1;
  const part = await csvEntry.cellsIn(broken, { fromRow: s7, toRow: s7 });
  assert.deepEqual(part.cells.map((c) => c.value), [null, "v", "w"]);
});
