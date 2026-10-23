/* csv-reader, R8: typed cells, and the metadata and active a csv never carries, at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import * as F from "./fixtures.mjs";
import { csvEntry, CSV_SHEET_NAME } from "../../../src/csv-reader/index.mjs";

const ref = (sheet, cell) => ({ kind: "sheet-cell", ref: `${sheet}!${cell}`, sheet, cell });
const cellOf = (sheet, cell, value, type, declared, cached = null, formula = null) =>
  ({ source: ref(sheet, cell), value, type, declared, cached, formula });

test("R8 csv cells: one per non-empty field, every one text with no declared type, the decoded text as value, row then column; an unreadable field keeps its entry with value null", async () => {
  const t = await csvEntry.text(F.enc('a,0.10\r\n,"x, y"\r\nlast,\r\n'));
  assert.deepEqual(t.sheets[0].cells, [
    cellOf(CSV_SHEET_NAME, "A1", "a", "text", null),
    cellOf(CSV_SHEET_NAME, "B1", "0.10", "text", null),
    cellOf(CSV_SHEET_NAME, "B2", "x, y", "text", null),
    cellOf(CSV_SHEET_NAME, "A3", "last", "text", null),
  ]);
  const u = await csvEntry.text(new Uint8Array([0x61, 0x2c, 0x96, 0x0a, 0x62, 0x2c, 0x63, 0x0a]));
  assert.equal(u.dialect.encoding, null);
  assert.deepEqual(u.sheets[0].cells, [
    cellOf(CSV_SHEET_NAME, "A1", "a", "text", null),
    cellOf(CSV_SHEET_NAME, "B1", null, "text", null),
    cellOf(CSV_SHEET_NAME, "A2", "b", "text", null),
    cellOf(CSV_SHEET_NAME, "B2", "c", "text", null),
  ]);
  assert.deepEqual(u.undetermined, [{ sheet: 0, cell: "B1", reason: "encoding_undetermined" }]);
});

test("R8 csv cells: the value is the field's decoded text, never re-rendered (leading zeros, spaces and quotes kept)", async () => {
  const t = await csvEntry.text(F.enc('007, padded ,"""q"""\n1,2,3\n'));
  assert.deepEqual(t.sheets[0].cells.slice(0, 3).map((c) => c.value), ["007", " padded ", '"q"']);
  for (const c of t.sheets[0].cells) assert.deepEqual([c.type, c.declared, c.cached, c.formula], ["text", null, null, null]);
});

test("R8 over the size guard no sheet is walked, so no cells are given (sheets [])", async () => {
  const big = new Uint8Array(32 * 1024 * 1024 + 2).fill(0x61);
  const c = await csvEntry.text(big);
  assert.equal(c.document, null);
  assert.deepEqual(c.sheets, []);
});

test("R8 csv metadata is always null, in text() of every body", async () => {
  assert.equal((await csvEntry.text(F.enc("a,b\n1,2\n"))).metadata, null);
  assert.equal((await csvEntry.text(new Uint8Array([0x61, 0x96, 0x0a]))).metadata, null);
  assert.equal((await csvEntry.text(new Uint8Array(32 * 1024 * 1024 + 1).fill(0x61))).metadata, null);
});

test("R8 csv active is always [] in structure() and text(), and the entry carries no variant", async () => {
  for (const body of ["a,b\n1,2\n", "x"]) {
    assert.deepEqual((await csvEntry.structure(F.enc(body))).active, []);
    assert.deepEqual((await csvEntry.text(F.enc(body))).active, []);
  }
  const big = new Uint8Array(32 * 1024 * 1024 + 1).fill(0x61);
  assert.deepEqual((await csvEntry.structure(big)).active, []);
  assert.deepEqual((await csvEntry.text(big)).active, []);
  assert.ok(!("variant" in await csvEntry.structure(F.enc("a,b\n1,2\n"))));
  assert.ok(!("variant" in await csvEntry.text(F.enc("a,b\n1,2\n"))));
});
