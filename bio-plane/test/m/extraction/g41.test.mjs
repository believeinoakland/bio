/* extraction R96, R97, R98 (fix round 6, G41; K4636, K4639, K4642): A READING IS KEPT UNDER 1 MiB, AND A SHEET'S CELLS ARE MADE FOR A RANGE. The walker's shape is a 1 MB CSV
   (about 18,000 rows) whose reading was 11 MB of typed cells: one SQL value the object's SQLite refuses above about 2.1 MB (`SQLITE_TOOBIG`), so the read died, nothing was indexed,
   and no fixture refused a bound value. Run under the platform's limit (`node --import <platform-sqlite.mjs> --test`), through the module's real entry: `readHeld` (which
   `op=readheld` and the plane's ledger call) and `writeReading`, the writer the re-read and the promotion share. Tests that need the readers' marker (`cells_held`, csv-reader,
   office-readers, reading-pipeline's `cellsInRange`) stay red by name until those providers are merged. Each test names the requirement id it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { fresh, bundle, bucket, doc, sha } from "./fixture.mjs";
import * as F from "../office-readers/fixtures.mjs";
import { extractionOps, Extraction, READING_ROW_MAX_BYTES, PRIOR_READING_COPY_MAX_BYTES, CELLS_RANGE_MAX, SCREEN_WORDS } from "../../../src/extraction/index.mjs";
import * as pipeline from "../../../src/reading-pipeline/index.mjs";

const MiB = 1048576;
const XLSX_CT = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const register = (rows) => ({ homeOf: (s) => rows.get(s) ?? null, onTestimony: () => ({ ok: true }) });
const bytesOf = (s) => Buffer.byteLength(s);
const viaOp = (w, d) => extractionOps(w.x, new URL(`http://x/reading?sha256=${d}&viewer=class:admin`), null, {}).reading();

/* the harness's CSV: header, rows, a last row carrying a marker */
function csvRows(bytes) {
  const rows = [["id", "name", "amount", "note"]];
  for (let n = 20, i = 0; n < bytes; i++) { const r = [String(i), `name ${i}`, `${(i * 37) % 9973}.${i % 100}`, `council note ${i} budget line`]; rows.push(r); n += r.join(",").length + 8; }
  rows.push(["LASTROWMARK", "last name", "1.00", "the final row of the sheet"]);
  return rows;
}
const csvText = (rows) => rows.map((r) => r.map((v, c) => (c === 1 || c === 3 ? `"${v}"` : v)).join(",")).join("\n") + "\n";
const COLS = "ABCDEFGHIJ";
const cellOf = (sheet, row, col, value) => ({ source: { kind: "sheet-cell", ref: `${sheet}!${COLS[col]}${row}`, sheet, cell: `${COLS[col]}${row}` }, value, type: "text", declared: null, cached: null, formula: null });

/* a held home: the bytes in the evidence store, the register naming it, the document in its bundle's provenance document */
async function home(bytes, { ct, format, name = "t", readHooks = null, fromText = false } = {}) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, readHooks, provenance: register(rows) });
  bundle(w.s, "INFO-1");
  const u8 = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  const d = sha(u8);
  rows.set(d, { bundleId: "INFO-1", path: name, encoding: "binary", bytes: u8.length, registered: "t", authored: false });
  await evidence.put(`bio/captures/${d}`, u8);
  const document = doc({ digest: d, bytes: u8.length, ct, format, fromText });
  w.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
  return { w, d, bytes: u8 };
}
const readAll = async (w, d) => { let a, n = 0; do { a = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} }); } while (a.more && ++n < 200); return a; };
const largestStored = (w) => Math.max(
  ...w.rows(`SELECT length(CAST(reading AS BLOB)) n FROM readings`).map((r) => r.n),
  ...w.rows(`SELECT length(CAST(reading AS BLOB)) n FROM reading_history`).map((r) => r.n),
  ...w.rows(`SELECT length(CAST(provenance AS BLOB)) n FROM reading_history WHERE provenance IS NOT NULL`).map((r) => r.n), 0);
const found = (w, term) => w.rows(`SELECT 1 FROM capture_text_fts WHERE capture_text_fts MATCH ?`, term).length > 0;
const keyed = (n, size, rest = {}) => ({ found: true, entities: [], content_type: "text/plain", text_source: null, basis: "t", at: "2026-10-22T00:00:00Z",
  ...Object.fromEntries(Array.from({ length: n }, (_, i) => [`k${i}`, "x".repeat(size + (i === 7 ? 10_000 : 0))])), ...rest });
const write = (w, d, reading, extra = {}) => w.core.transact(() => w.x.writeReading({ bundleId: "INFO-1", captureSha: d, reading, composed: true, ...extra }));

/* ---------------------------------------------------------------------------------------------------- R96, R97: the row guard */

test("R96 R97 (G41): a reading of 12 keys of 200 KB is stored as a small stated reading, the size and the largest key in its basis, no SQLITE_TOOBIG", () => {
  const w = fresh({}); bundle(w.s, "INFO-1");
  const d = sha("twelve keys");
  const reading = keyed(12, 200_000);
  const size = bytesOf(JSON.stringify(reading));
  assert.ok(size > 2_400_000, "the reading is over the platform's single-value limit");
  const out = write(w, d, reading);
  const row = w.one(`SELECT reading, found, entity_count FROM readings WHERE capture_sha=?`, d);
  const stored = JSON.parse(row.reading);
  assert.ok(row.reading.length < 2_000, `the stored row is ${row.reading.length} characters`);
  assert.deepEqual([stored.found, stored.failure, row.found, row.entity_count], [false, "final", 0, 0]);
  assert.deepEqual(stored.too_large, { bytes: size, key: "k7", key_bytes: bytesOf(JSON.stringify(reading.k7)), limit: READING_ROW_MAX_BYTES });
  assert.ok(stored.basis.includes("k7") && stored.basis.includes(String(size)), stored.basis);
  assert.equal(stored.cells, undefined);
  assert.deepEqual(out.stated, stored.too_large, "the writer says it stated the reading");
  const hist = w.rows(`SELECT reading, reading_sha256 FROM reading_history WHERE capture_sha=?`, d);
  assert.equal(hist.length, 1);
  assert.equal(hist[0].reading, row.reading, "the history keeps the statement, not the reading it stands for");
  assert.equal(hist[0].reading_sha256, createHash("sha256").update(row.reading).digest("hex"));
  assert.ok(largestStored(w) < MiB);
});

test("R96 R97 (G41): `op=reading` and `readingFor` state it: found, not read, completeness `stated`, `more` not true, the Document page's data present; nothing is thrown", () => {
  const w = fresh({}); bundle(w.s, "INFO-1");
  const d = sha("twelve keys, stated");
  write(w, d, keyed(12, 200_000));
  const a = viaOp(w, d);
  assert.equal(a.ok, true);
  assert.deepEqual([a.found, a.reader_found, a.reading.failure], [true, false, "final"]);
  assert.equal(a.completeness.state, "stated");
  assert.equal(a.completeness.failure, "final");
  assert.ok(a.completeness.why.includes("k7"));
  assert.notEqual(a.more, true, "no piece follows a statement");
  assert.deepEqual(a.text_units, []);
  assert.equal(a.reading.too_large.key, "k7");
});

test("R96 (G41): the bound is on the UTF-8 bytes: a reading at exactly 1 MiB is stored, at 1 MiB plus one byte it is stated; two-byte characters count twice", () => {
  const w = fresh({}); bundle(w.s, "INFO-1");
  const base = keyed(0, 0, { pad: "" });
  const room = READING_ROW_MAX_BYTES - bytesOf(JSON.stringify(base));
  const exact = { ...base, pad: "p".repeat(room) };
  assert.equal(bytesOf(JSON.stringify(exact)), READING_ROW_MAX_BYTES);
  const d1 = sha("exactly 1 MiB"), d2 = sha("one byte over"), d3 = sha("two bytes a character");
  write(w, d1, exact);
  assert.equal(JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d1).reading).pad.length, room, "stored as it is");
  write(w, d2, { ...base, pad: "p".repeat(room + 1) });
  assert.equal(JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d2).reading).failure, "final", "stated");
  const wide = { ...base, pad: "é".repeat(600_000) };
  assert.ok(JSON.stringify(wide).length < READING_ROW_MAX_BYTES && bytesOf(JSON.stringify(wide)) > READING_ROW_MAX_BYTES);
  write(w, d3, wide);
  assert.equal(JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d3).reading).failure, "final", "1.2 MB of bytes in 600,000 characters is stated");
  assert.ok(largestStored(w) <= READING_ROW_MAX_BYTES);
});

test("R96 (G41): a reading that is stated replaces the capture's earlier reading, its references and its text index, in one write; the history keeps the earlier one", () => {
  const w = fresh({}); bundle(w.s, "INFO-1");
  const d = sha("replaced");
  write(w, d, { found: true, entities: [{ kind: "person", key: "ann", label: "Ann" }], content_type: "text/plain", text_source: null, basis: "t", at: "2026-10-01T00:00:00Z" },
    { textUnits: [{ extent: { kind: "document" }, text: "ann was here", seq: 0 }] });
  assert.equal(w.rows(`SELECT 1 FROM capture_text WHERE capture_sha=?`, d).length, 1);
  write(w, d, keyed(12, 200_000, { at: "2026-10-02T00:00:00Z" }), { textUnits: [{ extent: { kind: "document" }, text: "never indexed", seq: 0 }] });
  assert.equal(JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading).failure, "final");
  assert.equal(w.rows(`SELECT 1 FROM reading_refs WHERE capture_sha=?`, d).length, 0);
  assert.equal(w.rows(`SELECT 1 FROM capture_text WHERE capture_sha=?`, d).length, 0, "a statement owns no units");
  assert.deepEqual(w.rows(`SELECT seq FROM reading_history WHERE capture_sha=? ORDER BY seq`, d).map((r) => r.seq), [1, 2]);
});

test("R97 (G41): through `readHeld`, a docx whose tables hold more than 1 MiB of cells is stated, not thrown; `readHeld` answers read with no `more`, and does not loop", async () => {
  const cellsRow = (r) => `<w:tr>${Array.from({ length: 6 }, (_, c) => `<w:tc>${F.wp(F.wr(`r${r}c${c} some words in a cell`))}</w:tc>`).join("")}</w:tr>`;
  const body = `<w:tbl><w:tblGrid>${"<w:gridCol/>".repeat(6)}</w:tblGrid>${Array.from({ length: 1500 }, (_, r) => cellsRow(r)).join("")}</w:tbl>`;
  const bytes = F.docx({ body });
  const { w, d } = await home(bytes, { ct: DOCX_CT, format: "docx" });
  const first = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} });
  assert.deepEqual([first.ok, first.read, first.found, first.more], [true, true, false, undefined], JSON.stringify(first));
  const stored = JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading);
  assert.equal(stored.failure, "final");
  assert.equal(stored.too_large.key, "cells", "the largest part is the tables' cells");
  assert.ok(stored.too_large.bytes > MiB);
  assert.ok(largestStored(w) < MiB);
  assert.equal((await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} })).why, "READING_HELD", "a second call reads nothing more");
  const a = viaOp(w, d);
  assert.equal(a.completeness.state, "stated");
});

test("R97 (G41): the same for an ods workbook whose cells pass 1 MiB (the entry keeps whole cells)", async () => {
  const odf = await import("../odf-reader/pkg.mjs");
  const cell = (t) => `<table:table-cell office:value-type="string"><text:p>${t}</text:p></table:table-cell>`;
  const rows = Array.from({ length: 1500 }, (_, r) => `<table:table-row>${Array.from({ length: 6 }, (_, c) => cell(`r${r}c${c} some words in a cell`)).join("")}</table:table-row>`).join("");
  const bytes = odf.pkg("ods", { body: `<table:table table:name="Budget">${rows}</table:table>` });
  const { w, d } = await home(bytes, { ct: "application/vnd.oasis.opendocument.spreadsheet", format: "ods" });
  const first = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} });
  assert.deepEqual([first.ok, first.read, first.found, first.more], [true, true, false, undefined], JSON.stringify(first));
  const stored = JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading);
  assert.equal(stored.failure, "final");
  assert.equal(stored.too_large.key, "cells");
  assert.ok(largestStored(w) < MiB);
});

test("R97 (G41): a pptx reading is stated when it passes 1 MiB, as the others are; the real pptx entry lists no cells, so a 6,000-slide deck read by `readHeld` is far under the bound and stored whole (control)", async () => {
  const deck = F.pptx({ slides: Array.from({ length: 6000 }, (_, i) => ({ file: `slide${i + 1}.xml`, texts: [`slide ${i} words that make a text shape`, `second shape ${i}`] })) });
  const { w, d } = await home(deck, { ct: "application/vnd.openxmlformats-officedocument.presentationml.presentation", format: "pptx" });
  const first = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} });
  assert.deepEqual([first.ok, first.read, first.stated], [true, true, undefined], JSON.stringify(first));
  assert.equal(JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading).failure, undefined, "a deck's reading is stored as it is");
  /* a pptx-shaped reading whose tables' cells pass 1 MiB (no reader makes one today): the statement, through the writer the promotion and the re-read share */
  const cells = Object.fromEntries(Array.from({ length: 8 }, (_, t) => [`table ${t + 1}`, Array.from({ length: 1000 }, (_, i) => ({ source: { kind: "slide-shape", slide: t + 1, shape: i, cell: `A${i + 1}` }, value: `cell ${t} ${i} with some words`, type: "text", declared: null, cached: null, formula: null }))]));
  const reading = { found: true, entities: [], content_type: "text/plain", text_container: "pptx", text_source: null, basis: "t", at: "2026-10-22T00:00:00Z", cells };
  assert.ok(bytesOf(JSON.stringify(reading)) > MiB);
  const d2 = sha("a pptx with tables");
  const out = write(w, d2, reading);
  assert.equal(out.stated.key, "cells");
  assert.equal(JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d2).reading).failure, "final");
  assert.ok(largestStored(w) < MiB);
});

test("R96 (G41): a reading of 1.5 MiB stored by the code before G41 is read again and kept in the history whole: the copy of a prior reading is exempt up to the platform's limit", async () => {
  const text = "id,name\n1,ann\n2,bob\n";
  const { w, d } = await home(text, { ct: "text/csv", format: "csv", fromText: true });
  const old = JSON.stringify({ found: false, entities: [], failure: "transient", basis: "the store could not be read", at: "2026-10-01T00:00:00Z", content_type: null, pad: "p".repeat(Math.round(1.5 * MiB)) });
  assert.ok(bytesOf(old) > READING_ROW_MAX_BYTES && bytesOf(old) < PRIOR_READING_COPY_MAX_BYTES);
  w.s.sql.exec(`INSERT INTO readings (capture_sha,bundle_id,content_type,reader_version,found,entity_count,reading,at) VALUES (?,?,?,?,?,?,?,?)`, d, "INFO-1", null, null, 0, 0, old, "2026-10-01T00:00:00Z");
  const done = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} });
  assert.deepEqual([done.ok, done.read], [true, true], JSON.stringify(done));
  const hist = w.rows(`SELECT seq, length(CAST(reading AS BLOB)) n FROM reading_history WHERE capture_sha=? ORDER BY seq`, d);
  assert.deepEqual(hist.map((h) => h.seq), [1, 2]);
  assert.equal(hist[0].n, bytesOf(old), "the old reading is kept as it was stored");
  assert.ok(hist[1].n < MiB && found(w, "ann"));
});

test("R96 (G41 control): a reading under 1 MiB is stored exactly as before: row, history, `reading_sha256`, `composed_readings`, `readingOf` (pinned from the code before G41)", async () => {
  const rows = csvRows(20_000);
  const { w, d } = await home(csvText(rows), { ct: "text/csv", format: "csv", fromText: true });
  assert.deepEqual([(await readAll(w, d)).ok, w.rows(`SELECT 1 FROM readings WHERE capture_sha=?`, d).length], [true, 1]);
  const row = w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading;
  const digest = createHash("sha256").update(row).digest("hex");
  const hist = w.rows(`SELECT reading_sha256, reading FROM reading_history WHERE capture_sha=?`, d);
  assert.deepEqual(hist.map((h) => [h.reading_sha256, h.reading === row]), [[digest, true]]);
  assert.deepEqual(w.rows(`SELECT reading_sha256 FROM composed_readings`).map((r) => r.reading_sha256), [digest]);
  assert.equal(JSON.stringify(w.x.readingOf(d).reading), row, "readingOf answers the stored reading whole");
  assert.deepEqual([row.length, digest], PINNED_SMALL_CSV, "the row's length and digest, taken on the code before G41");
});
const PINNED_SMALL_CSV = [230882, "ee9361bca9d63273eaf3799522f9f1a6f056ca17fb4cf993fcedbda2f49f4712"];

test("R96 (G41 control): a second read of the same bytes adds no history row, and a fresh `Extraction` over the same database answers the same `readingOf`", async () => {
  const { w, d } = await home(csvText(csvRows(30_000)), { ct: "text/csv", format: "csv", fromText: true });
  await readAll(w, d);
  const before = w.rows(`SELECT seq FROM reading_history WHERE capture_sha=?`, d).length;
  const again = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} });
  assert.deepEqual([again.ok, again.read, again.why], [true, false, "READING_HELD"]);
  const row = w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading;
  w.core.transact(() => w.x.writeReading({ bundleId: "INFO-1", captureSha: d, reading: JSON.parse(row), composed: true }));
  assert.equal(w.rows(`SELECT seq FROM reading_history WHERE capture_sha=?`, d).length, before, "the same reading is not kept again");
  const x2 = new Extraction(w.s, { record: w.core, membership: w.membership, env: {} });
  assert.deepEqual(x2.readingOf(d), w.x.readingOf(d));
});

/* ---------------------------------------------------------------------------------------------------- the readers' seam: the 1 MB CSV and the 5,000-row workbook */

test("R96 (G41 a): a 1 MB CSV read through `readHeld` until no `more` ends read, its last row is in the text index, and the largest stored value is under 1 MiB", async () => {
  const rows = csvRows(1_048_576);
  const { w, d } = await home(csvText(rows), { ct: "text/csv", format: "csv", fromText: true });
  const done = await readAll(w, d);
  assert.deepEqual([done.ok, done.read], [true, true], JSON.stringify(done));
  assert.equal(done.found, true, `the CSV is read, not stated: ${JSON.stringify(JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading).basis)}`);
  assert.ok(found(w, "LASTROWMARK"), "the last row is searchable");
  assert.ok(largestStored(w) < MiB, `the largest stored value is ${largestStored(w)} B`);
  const stored = JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading);
  assert.deepEqual(stored.cells_held, ["csv"], "its cells are held, to be made for a range");
});

test("R96 (G41 b): an xlsx of 5,000 rows of 4 cells read through `readHeld` ends read, its last row is in the text index, and the largest stored value is under 1 MiB", async () => {
  const bytes = F.xlsx({ sheets: [{ name: "Budget", data: { rows: Array.from({ length: 5000 }, (_, i) => ({ r: i + 1,
    cells: ["A", "B", "C", "D"].map((c, k) => ({ r: `${c}${i + 1}`, t: "inlineStr", is: i === 4999 && k === 0 ? "LASTROWMARK" : `value ${i} ${k}` })) })) } }] });
  const { w, d } = await home(bytes, { ct: XLSX_CT, format: "xlsx" });
  const done = await readAll(w, d);
  assert.deepEqual([done.ok, done.read, done.found], [true, true, true], JSON.stringify(done));
  assert.ok(found(w, "LASTROWMARK"));
  assert.ok(largestStored(w) < MiB);
  assert.deepEqual(JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading).cells_held, ["Budget"]);
});

test("R96 (G41 boundary): a workbook whose cells are just under INLINE_CELLS_MAX_BYTES (512 KiB) keeps them in the reading; one just over holds them", async () => {
  assert.equal(typeof pipeline.INLINE_CELLS_MAX_BYTES, "number", "reading-pipeline provides the constant the readers are given");
  assert.equal(pipeline.INLINE_CELLS_MAX_BYTES, 512 * 1024);
  const make = async (n) => {
    const bytes = F.xlsx({ sheets: [{ name: "Budget", data: { rows: Array.from({ length: n }, (_, i) => ({ r: i + 1, cells: [{ r: `A${i + 1}`, t: "inlineStr", is: `v${i}` }] })) } }] });
    const { w, d } = await home(bytes, { ct: XLSX_CT, format: "xlsx" });
    await readAll(w, d);
    return JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading);
  };
  const perCell = JSON.stringify((await make(1)).cells.Budget[0]).length + 1;
  const under = await make(Math.floor((pipeline.INLINE_CELLS_MAX_BYTES * 0.98) / perCell));
  const over = await make(Math.ceil((pipeline.INLINE_CELLS_MAX_BYTES * 1.02) / perCell));
  assert.ok(Array.isArray(under.cells.Budget) && under.cells_held === undefined, "just under: inline");
  assert.deepEqual([over.cells.Budget, over.cells_held], [null, ["Budget"]], "just over: held");
});

/* ---------------------------------------------------------------------------------------------------- R98: cellsOf */

test("R98 (G41): `cellsOf` of the 1 MB CSV's last rows equals the generator's cells, `interpreted` names the rows, `next_row` is null", async () => {
  const rows = csvRows(1_048_576);
  const { w, d } = await home(csvText(rows), { ct: "text/csv", format: "csv", fromText: true });
  await readAll(w, d);
  const last = rows.length;
  const got = await w.x.cellsOf(d, "csv", { fromRow: last - 2, toRow: last });
  const expected = [];
  for (let r = last - 2; r <= last; r++) rows[r - 1].forEach((v, c) => expected.push(cellOf("csv", r, c, v)));
  assert.deepEqual(got.cells, expected);
  assert.deepEqual(got.interpreted, { sheet: "csv", from_row: last - 2, to_row: last });
  assert.equal(got.next_row, null);
});

test("R98 (G41): the column box is honoured: `fromCol`/`toCol` answer only those columns of those rows, in row then column order", async () => {
  const rows = csvRows(1_048_576);
  const { w, d } = await home(csvText(rows), { ct: "text/csv", format: "csv", fromText: true });
  await readAll(w, d);
  const last = rows.length;
  const got = await w.x.cellsOf(d, "csv", { fromRow: last - 1, toRow: last, fromCol: 2, toCol: 3 });
  const expected = [];
  for (let r = last - 1; r <= last; r++) for (const c of [1, 2]) expected.push(cellOf("csv", r, c, rows[r - 1][c]));
  assert.deepEqual(got.cells, expected);
});

test("R98 (G41): a range over CELLS_RANGE_MAX cells in its extent answers the first 20,000 and `next_row`, and going on from it makes the next cells, none twice", async () => {
  assert.equal(CELLS_RANGE_MAX, 20000);
  const rows = csvRows(1_048_576);
  const { w, d } = await home(csvText(rows), { ct: "text/csv", format: "csv", fromText: true });
  await readAll(w, d);
  const first = await w.x.cellsOf(d, "csv", { fromRow: 1, toRow: rows.length });
  assert.equal(first.cells.length, CELLS_RANGE_MAX);
  assert.deepEqual([first.next_row, first.interpreted.from_row, first.interpreted.to_row], [5001, 1, 5000]);
  const second = await w.x.cellsOf(d, "csv", { fromRow: first.next_row, toRow: rows.length });
  assert.equal(second.cells.length, CELLS_RANGE_MAX);
  assert.deepEqual(second.cells[0], cellOf("csv", 5001, 0, rows[5000][0]));
  assert.equal(second.next_row, 10001);
});

test("R98 (G41): a small sheet is answered from its reading: the cells of the rows asked, `interpreted` null; a column box and reversed corners are honoured", async () => {
  const rows = csvRows(400);
  const { w, d } = await home(csvText(rows), { ct: "text/csv", format: "csv", fromText: true });
  await readAll(w, d);
  const reading = JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading);
  assert.ok(Array.isArray(reading.cells.csv) && reading.cells_held === undefined, "a small sheet lists its cells");
  const got = await w.x.cellsOf(d, "csv", { fromRow: 2, toRow: 3 });
  assert.deepEqual(got.cells, reading.cells.csv.filter((c) => /^[A-D][23]$/.test(c.source.cell)).sort((a, b) => Number(a.source.cell.slice(1)) - Number(b.source.cell.slice(1)) || a.source.cell.localeCompare(b.source.cell)));
  assert.deepEqual([got.interpreted, got.next_row], [null, null]);
  const box = await w.x.cellsOf(d, "csv", { fromRow: 3, toRow: 2, fromCol: 3, toCol: 2 });
  assert.deepEqual(box.cells.map((c) => c.source.cell), ["B2", "C2", "B3", "C3"]);
});

test("R98 (G41): `cellsOf` never throws and never answers a short list silently: no reading, a sheet not named, a missing sheet argument each answer `{cells: null, reason, why}`", async () => {
  const w = fresh({});
  assert.deepEqual(Object.keys(await w.x.cellsOf(sha("none"), "csv", {})).sort(), ["cells", "reason", "why"]);
  assert.equal((await w.x.cellsOf(sha("none"), "csv", {})).reason, "no_reading");
  assert.equal((await w.x.cellsOf("", "csv", {})).reason, "no_reading");
  const { w: w2, d } = await home(csvText(csvRows(400)), { ct: "text/csv", format: "csv", fromText: true });
  await readAll(w2, d);
  const missing = await w2.x.cellsOf(d, "Nope", { fromRow: 1, toRow: 2 });
  assert.deepEqual([missing.cells, missing.reason], [null, "sheet_not_named"]);
  assert.equal(typeof missing.why, "string");
  assert.equal((await w2.x.cellsOf(d, undefined, {})).reason, "sheet_not_named");
});

test("R98 (G41): bytes the store does not hold are a transient `{cells: null, reason: bytes_not_held}`, not a shorter answer and not a throw", async () => {
  const rows = csvRows(1_048_576);
  const { w, d } = await home(csvText(rows), { ct: "text/csv", format: "csv", fromText: true });
  await readAll(w, d);
  w.evidence.held.delete(`bio/captures/${d}`);
  const got = await w.x.cellsOf(d, "csv", { fromRow: 1, toRow: 3 });
  assert.equal(got.cells, null);
  assert.equal(got.reason, "bytes_not_held");
  assert.equal(got.transient, true);
});

test("R97 (G41): the two Document-page sentences are code-origin rows: the held-cells sentence, and the too-large sentence filled with its size and largest part", () => {
  assert.equal(SCREEN_WORDS.cellsHeld, "This sheet's text is read whole and every line can be searched and cited; its cells are interpreted for a range when you open or cite it.");
  assert.equal(SCREEN_WORDS.tooLarge({ size: "2.4 MiB", key: "cells" }), "This document's reading is too large to keep whole: 2.4 MiB; the largest part is cells.");
});
