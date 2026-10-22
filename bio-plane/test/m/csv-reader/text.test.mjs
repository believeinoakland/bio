/* csv-reader, R5–R7: text() — the I2 text shape, the size guard (CSV body bytes) and the dialect. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { csvEntry, CSV_SHEET_NAME } from "../../../src/csv-reader/index.mjs";
import { STREAMED_TEXT_BOUND_BYTES } from "../../../src/ooxml.mjs";
import * as F from "./fixtures.mjs";

const bytes = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const MiB = 1024 * 1024;
const BOUND = 20 * MiB;
/* The ceiling of a read in pieces (R9): over it, and only over it, the text is refused. */
const CEIL = STREAMED_TEXT_BOUND_BYTES;

/* ------------------------------------------------------------------ R5 */

test("R5 csv text carries {ok, container, document, undetermined, counts, images, sheets}; ok:false when parts failed", async () => {
  const t = await csvEntry.text(F.enc("a\n"));
  assert.equal(t.ok, true);
  assert.equal(t.container, "csv");
  for (const k of ["document", "undetermined", "counts", "images", "sheets"]) assert.ok(k in t, `csv.text has ${k}`);
  assert.ok(Array.isArray(t.undetermined));
  assert.deepEqual(await csvEntry.text(new Uint8Array(0)), { ok: false, container: "csv", reason: "empty_body" });
  assert.deepEqual(await csvEntry.text(undefined), { ok: false, container: "csv", reason: "PARTS_ABSENT" });
});

test("R5 csv images is always [] — a zero of the format, not of a walk", async () => {
  assert.deepEqual((await csvEntry.text(F.enc("a,b\n"))).images, []);
  assert.deepEqual((await csvEntry.text(bytes("a\x96,b\n"))).images, []);
});

test("R5 csv text: one sheet, null bound, row 1 is row 1, empty fields are measured emptiness, quoted fields per RFC 4180", async () => {
  const t = await csvEntry.text(F.enc('name,note\r\n"Smith, J","said ""hi"""\r\n,x\r\n\r\nlast,row'));
  assert.equal(t.dialect.delimiter, "comma");
  assert.equal(t.document, 'name\tnote\nSmith, J\tsaid "hi"\nx\nlast\trow');
  assert.deepEqual(t.sheets.map(({ cells, ...s }) => s), [{ sheet: 0, name: CSV_SHEET_NAME, hidden: false, rows: null, cols: null, usedRows: 5, usedCols: 2,
    range: { kind: "sheet-range", ref: `${CSV_SHEET_NAME}!A1:B5`, sheet: CSV_SHEET_NAME, range: "A1:B5" }, text: t.document, undetermined: [] }]);
  assert.deepEqual(t.undetermined, []);
  assert.equal(t.counts.cells, 7);
  // a line break inside quotes is literal; it does not end the record (past the signature's 50 lines)
  const m = await csvEntry.text(F.enc("a,b\n".repeat(50) + '"one\ntwo",3\n'));
  assert.equal(m.sheets[0].usedRows, 51);
  assert.ok(m.document.endsWith("\none\ntwo\t3"));
  // no delimiter determined: one column, rows still rows
  const one = await csvEntry.text(F.enc("x\ny\n"));
  assert.equal(one.document, "x\ny");
  assert.equal(one.sheets[0].usedCols, 1);
});

test("R5 csv text: under an undetermined encoding the grid stands; only fields holding a byte >= 0x80 are undetermined, by sheet-cell, never mojibake", async () => {
  const t = await csvEntry.text(bytes("id,dash\n1,a\x96b\n2,plain\n\x93q\x94,3\n"));
  assert.equal(t.dialect.encoding, null);
  assert.equal(t.document, "id\tdash\n1\n2\tplain\n3");
  assert.deepEqual(t.undetermined, [{ sheet: 0, cell: "B2", reason: "encoding_undetermined" }, { sheet: 0, cell: "A4", reason: "encoding_undetermined" }]);
  assert.equal(t.sheets[0].usedRows, 4);
  assert.equal(t.sheets[0].usedCols, 2);
});

test("R5 csv text: bytes past the signature window that the signature's encoding cannot read are stated per cell, never decoded into invented characters", async () => {
  const pad = "a,b\n".repeat((MiB >> 2) + 10); // more than the 1 MiB window, all ASCII
  const ascii = await csvEntry.text(new Uint8Array([...F.enc(pad), ...bytes("x,\x96\n")]));
  assert.equal(ascii.dialect.encoding, "us-ascii");
  const row = (MiB >> 2) + 11;
  assert.deepEqual(ascii.undetermined, [{ sheet: 0, cell: `B${row}`, reason: "not_us_ascii" }]);
  assert.ok(ascii.document.endsWith("\nx"));
  const utf = await csvEntry.text(new Uint8Array([...F.enc("é,1\n"), ...F.enc(pad), ...F.enc("ü,"), 0xc3, 0x28, 0x0a]));
  assert.equal(utf.dialect.encoding, "utf-8");
  assert.deepEqual(utf.undetermined, [{ sheet: 0, cell: `B${row + 1}`, reason: "invalid_utf8" }]);
  assert.ok(utf.document.startsWith("é\t1\n"));
  assert.ok(utf.document.endsWith("\nü"));
  assert.ok(!utf.document.includes("�"));
});

test("R5 csv text: a UTF-16 body (BOM) is decoded whole; a body that is not valid UTF-16 states the cells it spoils", async () => {
  const le = (s) => { const out = [0xff, 0xfe]; for (const c of s) { const n = c.charCodeAt(0); out.push(n & 255, n >> 8); } return new Uint8Array(out); };
  const ok = await csvEntry.text(le("a,é\n1,2\n"));
  assert.equal(ok.document, "a\té\n1\t2");
  const bad = new Uint8Array([...le("a,b\n1,"), 0x00, 0xd8, 0x0a, 0x00]); // a lone high surrogate
  const t = await csvEntry.text(bad);
  assert.deepEqual(t.undetermined, [{ sheet: 0, cell: "B2", reason: "invalid_utf16" }]);
  assert.equal(t.document, "a\tb\n1");
});

/* ------------------------------------------------------------------ R6 */

test("R6 csv guard: the body's own byte length after any BOM against MEASURED_CSV_TEXT_BOUND_BYTES; over it both structure and text carry the marker; the dialect stands", async () => {
  const line = "aaaaaaa,b\n";
  const body = F.enc(line.repeat(Math.ceil((CEIL + 1) / line.length)));
  const t = await csvEntry.text(body);
  assert.equal(t.document, null);
  assert.deepEqual(t.undetermined, [{ ok: false, text: "undetermined", why: "over_size_bound", size: body.length, bound: CEIL, boundName: "STREAMED_TEXT_BOUND_BYTES", metric: "body_bytes", final: true }]);
  assert.equal(t.dialect.delimiter, "comma");
  const s = await csvEntry.structure(body);
  assert.deepEqual(s.evidentiary.undetermined[0].guard, t.undetermined[0]);
  assert.equal(s.dialect.delimiter, "comma");
  // exactly the bound, with a BOM on top, is not over it: the BOM is not body
  const at = new Uint8Array(BOUND + 3).fill(0x61);
  at.set([0xef, 0xbb, 0xbf]);
  for (let i = 3; i < at.length; i += 10) at[i] = 0x0a;
  const under = await csvEntry.text(at);
  assert.notEqual(under.document, null);
});

/* ------------------------------------------------------------------ R7 */

test("R7 dialect encoding: BOM certain; no high byte us-ascii certain; valid utf-8 likely; otherwise null with encoding_undetermined", () => {
  const cases = [
    [[0xef, 0xbb, 0xbf, ...F.enc("a,b\n1,2\n")], "utf-8", "certain"],
    [[0xff, 0xfe, 0x61, 0, 0x0a, 0], "utf-16le", "certain"],
    [[0xfe, 0xff, 0, 0x61, 0, 0x0a], "utf-16be", "certain"],
    [F.enc("a,b\n1,2\n"), "us-ascii", "certain"],
    [F.enc("é,b\n1,2\n"), "utf-8", "likely"],
    [[0x61, 0x96, 0x0a], null, "none"],
    [[0xff, 0xfe, 0x00, 0x00, 0x61], null, "none"], // UTF-32LE is not read as UTF-16LE
  ];
  for (const [b, encoding, conf] of cases) {
    const d = csvEntry.dialect(new Uint8Array(b));
    assert.equal(d.encoding, encoding, JSON.stringify(b.slice(0, 5)));
    assert.equal(d.encodingConfidence, conf);
    assert.ok(Array.isArray(d.encodingSignals) && d.encodingSignals.length);
    assert.equal(d.undetermined.includes("encoding_undetermined"), encoding == null);
  }
  // only the first 1 MiB is the window, and a character the window's end cuts in two is not invalid
  const a = new Uint8Array(MiB + 10).fill(0x61);
  a[MiB + 5] = 0x96;
  assert.equal(csvEntry.dialect(a).encoding, "us-ascii");
  const u = new Uint8Array(MiB + 10).fill(0x61);
  u[MiB - 1] = 0xc3; u[MiB] = 0xa9;
  assert.equal(csvEntry.dialect(u).encoding, "utf-8");
});

test("R7 dialect delimiter: exactly one consistent candidate certain; tied, none consistent and too few lines each undetermined by name", () => {
  const d = (s) => csvEntry.dialect(F.enc(s));
  for (const [s, name] of [["a,b\n1,2\n", "comma"], ["a;b\n1;2\n", "semicolon"], ["a\tb\n1\t2\n", "tab"], ["a|b\n1|2\n", "pipe"], ['a,"x;y"\n1,"2;3;4"\n', "comma"]]) {
    const r = d(s);
    assert.equal(r.delimiter, name, s);
    assert.equal(r.delimiterConfidence, "certain");
    assert.deepEqual(r.undetermined, []);
  }
  const tied = d("a,b;c\n1,2;3\n");
  assert.equal(tied.delimiter, null);
  assert.deepEqual(tied.undetermined, ["delimiter_undetermined_tied"]);
  assert.deepEqual(d("a,b\n1,2,3\n").undetermined, ["delimiter_undetermined_none_consistent"]);
  assert.deepEqual(d("plain\nwords\n").undetermined, ["delimiter_undetermined_none_consistent"]);
  assert.deepEqual(d("a,b\n").undetermined, ["delimiter_undetermined_too_few_lines"]);
  assert.deepEqual(d("a,b\n1,2").undetermined, ["delimiter_undetermined_too_few_lines"], "the unterminated last line is not complete");
  // the first 50 complete lines decide: an inconsistency on line 51 does not count
  assert.equal(d("a,b\n".repeat(50) + "a,b,c\n").delimiter, "comma");
  assert.equal(d("a,b\n".repeat(49) + "a,b,c\n").delimiter, null);
  // both undetermined at once
  assert.deepEqual(csvEntry.dialect(new Uint8Array([0x96, 0x0a])).undetermined, ["encoding_undetermined", "delimiter_undetermined_too_few_lines"]);
});

test("R7 dialect: null for empty bytes or an undecodable BOM; the same computation structure() and text() report", async () => {
  assert.equal(csvEntry.dialect(new Uint8Array(0)), null);
  for (const s of ["a,b\n1,2\n", "a;b\n", "é|x\n1|2\n", "\x96,1\n2,3\n"]) {
    const b = bytes(s);
    const d = csvEntry.dialect(b);
    assert.deepEqual((await csvEntry.structure(b)).dialect, d);
    assert.deepEqual((await csvEntry.text(b)).dialect, d);
    assert.deepEqual(Object.keys(d).sort(), ["delimiter", "delimiterConfidence", "delimiterSignals", "encoding", "encodingConfidence", "encodingSignals", "undetermined"]);
  }
  const Real = globalThis.TextDecoder;
  globalThis.TextDecoder = class extends Real { constructor(l, o) { if (/utf-16/i.test(String(l))) throw new RangeError("x"); super(l, o); } };
  try { assert.equal(csvEntry.dialect(new Uint8Array([0xff, 0xfe, 0x61, 0])), null); } finally { globalThis.TextDecoder = Real; }
});
