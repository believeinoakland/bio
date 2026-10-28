/* register-readers R1: a delimited piece read as rows under a definition, streaming. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readRows, ROW_KEY_SEPARATOR } from "../../../src/register-readers/index.mjs";
import { walkRecords } from "../../../src/csv-reader/index.mjs";
import { CONTRIB, CONTRIB_HEADER, CONTRIB_ROWS, CONTRIB_CSV, TAB, PIPE, CONTENT, delimited, enc, chunked, all } from "./fixtures.mjs";

const rowsOf = (items) => items.filter((x) => x.cells);
const cellsOf = (def, row) => Object.fromEntries(def.columns.map((c) => [c.name, row[CONTRIB_HEADER.indexOf(c.name)]]));

test("R1 a comma file reads to rows in file order: row_no from 1 after the header, the definition's cells, the row_key key", async () => {
  const items = await all(readRows(chunked(enc(CONTRIB_CSV)), CONTRIB, "y2025"));
  assert.deepEqual(items[0], { ok: true, header: CONTRIB_HEADER, encoding: "utf-8", assumed: true, delimiter: "comma" });
  const rows = rowsOf(items);
  assert.equal(rows.length, CONTRIB_ROWS.length);
  rows.forEach((r, i) => {
    assert.equal(r.row_no, i + 1);
    assert.deepEqual(r.cells, cellsOf(CONTRIB, CONTRIB_ROWS[i]));
    assert.equal(r.key, CONTRIB_ROWS[i][0]);
  });
  assert.deepEqual(items.at(-1), { done: true, rows: 5, undetermined_rows: 0, encoding: "utf-8", assumed: true });
});

test("R1 comma, tab and pipe files read to the same rows", async () => {
  const comma = rowsOf(await all(readRows(chunked(enc(CONTRIB_CSV)), CONTRIB, "y2025")));
  const tab = rowsOf(await all(readRows(chunked(enc(delimited([CONTRIB_HEADER, ...CONTRIB_ROWS], "\t"))), TAB, "t")));
  const pipe = rowsOf(await all(readRows(chunked(enc(delimited(CONTRIB_ROWS, "|"))), PIPE, "p", { header: enc(delimited([CONTRIB_HEADER], "|")) })));
  assert.deepEqual(tab, comma);
  assert.deepEqual(pipe, comma);
});

test("R1 a separate header file supplies the names; without it the piece is header_missing", async () => {
  const body = enc(delimited(CONTRIB_ROWS, "|"));
  const items = await all(readRows(chunked(body), PIPE, "p", { header: enc(delimited([CONTRIB_HEADER], "|", "\r\n")) }));
  assert.deepEqual(items[0].header, CONTRIB_HEADER);
  assert.equal(rowsOf(items).length, 5);
  assert.equal(rowsOf(items)[0].row_no, 1, "the first line of the body is a data row");
  assert.deepEqual(await all(readRows(chunked(body), PIPE, "p")), [{ ok: false, why: "header_missing" }]);
});

test("R1 a row split at a window edge, or a byte either side, reads whole, at every split of the source", async () => {
  const bytes = enc(CONTRIB_CSV);
  const whole = rowsOf(await all(readRows(chunked(bytes), CONTRIB, "y2025")));
  for (const windowBytes of [16, 17, 64]) {
    for (let cut = 1; cut < bytes.length; cut++) {
      const got = rowsOf(await all(readRows(chunked(bytes, [cut, bytes.length]), CONTRIB, "y2025", { windowBytes })));
      assert.deepEqual(got, whole, `window ${windowBytes}, cut at ${cut}`);
    }
  }
  const oneByte = rowsOf(await all(readRows(chunked(bytes, [1]), CONTRIB, "y2025", { windowBytes: 16 })));
  assert.deepEqual(oneByte, whole);
});

test("R1 quoting: doubled quotes and line breaks inside quotes; CRLF, LF and a final line without a break", async () => {
  const want = rowsOf(await all(readRows(chunked(enc(CONTRIB_CSV)), CONTRIB, "y2025")));
  assert.equal(want[3].cells.Memo, 'line one\nline "two"');
  for (const [eol, last] of [["\r\n", true], ["\n", false], ["\r\n", false]]) {
    const text = delimited([CONTRIB_HEADER, ...CONTRIB_ROWS], ",", eol, last);
    assert.deepEqual(rowsOf(await all(readRows(chunked(enc(text), [7]), CONTRIB, "y2025"))), want, JSON.stringify(eol) + (last ? "" : " no final break"));
  }
});

test("R1 a ragged row is undetermined with its counts, never padded or cut, counted, and the next row is intact", async () => {
  const rows = CONTRIB_ROWS.map((r) => r.slice());
  rows[1] = rows[1].slice(0, 9);
  rows[2] = [...rows[2], "extra"];
  const items = await all(readRows(chunked(enc(delimited([CONTRIB_HEADER, ...rows]))), CONTRIB, "y2025"));
  const bad = items.filter((x) => x.undetermined === true);
  assert.deepEqual(bad, [
    { row_no: 2, undetermined: true, why: "field_count", fields: 9, expected: 14 },
    { row_no: 3, undetermined: true, why: "field_count", fields: 15, expected: 14 },
  ]);
  const good = rowsOf(items);
  assert.deepEqual(good.map((r) => r.row_no), [1, 4, 5]);
  assert.deepEqual(good[1].cells, cellsOf(CONTRIB, CONTRIB_ROWS[3]));
  assert.deepEqual(items.at(-1), { done: true, rows: 3, undetermined_rows: 2, encoding: "utf-8", assumed: true });
});

test("R1 a quote left open at the end is unterminated_quote on the row it opened", async () => {
  const text = `${delimited([CONTRIB_HEADER, ...CONTRIB_ROWS.slice(0, 2)])}T9,F,"never closed\nmore,text`;
  const items = await all(readRows(chunked(enc(text)), CONTRIB, "y2025"));
  assert.deepEqual(items.filter((x) => x.undetermined === true), [{ row_no: 3, undetermined: true, why: "unterminated_quote" }]);
  assert.equal(rowsOf(items).length, 2);
});

test("R1 a header lacking a listed column is column_missing before any row", async () => {
  const header = CONTRIB_HEADER.filter((h) => h !== "Amount");
  const rows = CONTRIB_ROWS.map((r) => r.filter((_, i) => CONTRIB_HEADER[i] !== "Amount"));
  assert.deepEqual(await all(readRows(chunked(enc(delimited([header, ...rows]))), CONTRIB, "y2025")), [{ ok: false, why: "column_missing", column: "Amount" }]);
});

test("R1 encodings: a UTF-8 BOM, UTF-16LE and UTF-16BE BOMs are stated and not assumed; bytes that are not UTF-8 are read as windows-1252, assumed, even past the first window", async () => {
  const text = delimited([CONTRIB_HEADER, ...CONTRIB_ROWS.map((r) => r.map((v, i) => (i === 2 ? `${v} Peña` : v)))]);
  const want = rowsOf(await all(readRows(chunked(enc(text)), CONTRIB, "y2025")));
  const le = new Uint8Array(2 + text.length * 2), be = new Uint8Array(2 + text.length * 2);
  le.set([0xff, 0xfe]); be.set([0xfe, 0xff]);
  for (let i = 0; i < text.length; i++) { const c = text.charCodeAt(i); le[2 + 2 * i] = c & 0xff; le[3 + 2 * i] = c >> 8; be[2 + 2 * i] = c >> 8; be[3 + 2 * i] = c & 0xff; }
  const cp = Uint8Array.from([...text].map((ch) => (ch === "ñ" ? 0xf1 : ch.charCodeAt(0))));
  for (const [bytes, encoding, assumed] of [[new Uint8Array([0xef, 0xbb, 0xbf, ...enc(text)]), "utf-8", false], [le, "utf-16le", false], [be, "utf-16be", false], [cp, "windows-1252", true]]) {
    const items = await all(readRows(chunked(bytes, [5]), CONTRIB, "y2025", { windowBytes: 64 }));
    assert.equal(items.at(-1).encoding, encoding);
    assert.equal(items.at(-1).assumed, assumed);
    assert.deepEqual(items[0].header, CONTRIB_HEADER, `${encoding}: the BOM is not part of the first name`);
    assert.deepEqual(rowsOf(items), want, encoding);
  }
});

test("R1 row_key_basis content: the key is the kept cells' digest and the occurrence number", async () => {
  const rows = [CONTRIB_ROWS[0], CONTRIB_ROWS[1], CONTRIB_ROWS[0]];
  const got = rowsOf(await all(readRows(chunked(enc(delimited([CONTRIB_HEADER, ...rows]))), CONTENT, "y2025")));
  const [a, b, c] = got.map((r) => r.key.split(ROW_KEY_SEPARATOR));
  assert.match(a[0], /^[0-9a-f]{64}$/);
  assert.equal(a[1], "1");
  assert.notEqual(b[0], a[0]);
  assert.deepEqual(c, [a[0], "2"], "the same kept cells a second time: the same digest, occurrence 2");
  const phoneOnly = CONTRIB_ROWS[0].map((v, i) => (CONTRIB_HEADER[i] === "Phone" ? "other" : v));
  const d = rowsOf(await all(readRows(chunked(enc(delimited([CONTRIB_HEADER, phoneOnly]))), CONTENT, "y2025")))[0].key.split(ROW_KEY_SEPARATOR);
  assert.equal(d[0], a[0], "a dropped column is not part of the digest");
});

test("R1 a 200 MiB stream reads under a 64 MB heap cap", { timeout: 600_000 }, () => {
  const child = fileURLToPath(new URL("./memory-child.mjs", import.meta.url));
  const r = spawnSync(process.execPath, ["--max-old-space-size=64", child, String(200 * 1024 * 1024)], { encoding: "utf8", timeout: 590_000 });
  assert.equal(r.status, 0, r.stderr.slice(-2000));
  const out = JSON.parse(r.stdout.trim().split("\n").at(-1));
  assert.ok(out.bytes >= 200 * 1024 * 1024, `streamed ${out.bytes}`);
  assert.equal(out.rows, out.expected, "every row read");
  assert.equal(out.undetermined, 0);
});

test("R1 control: an unragged file's rows equal csv-reader's cells", async () => {
  for (const [def, piece, d] of [[CONTRIB, "y2025", ","], [TAB, "t", "\t"]]) {
    const text = delimited([CONTRIB_HEADER, ...CONTRIB_ROWS], d, "\r\n");
    const records = walkRecords(text, d);
    const got = rowsOf(await all(readRows(chunked(enc(text), [3]), def, piece)));
    assert.equal(got.length, records.length - 1);
    got.forEach((r, i) => {
      for (const c of def.columns) assert.equal(r.cells[c.name], records[i + 1][records[0].indexOf(c.name)]);
    });
  }
});
