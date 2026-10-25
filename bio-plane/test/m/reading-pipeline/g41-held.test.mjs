/* reading-pipeline R28, R35, R44 (fix round 6, G41; K4636, K4639, K4642): a sheet whose typed cells the entry holds in the file,
   not in the reading. `read` asks an entry for its text with the inline cap (`{inlineCellsMax}`, opt-in), carries the entry's
   `cells_held` marker as the reading's `cells_held` (the sheets' names) beside `cells` null, still indexes every row's text in
   pieces (R40, R41), counts its words once (R35), and `cellsInRange` makes a range's cells from the held file through the
   entry's `cellsIn` and answers its reasons when it cannot.
   The seam tests (named "seam") run the REAL registered csv and xlsx entries over a 1 MB CSV and a 5,000-row workbook; they are
   red by name until csv-reader #3 (the marker, the cap, `cellsIn`) and office-readers #15 merge. The rest is at `read` and
   `cellsInRange` over scripted entries and is green on this module alone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { deflateRawSync } from "node:zlib";
import { read, cellsInRange, emittedFieldsOf, INLINE_CELLS_MAX_BYTES, wordsIn } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc, withEntry } from "./fixture.mjs";

const BUDGET = 512 * 1024;
const store = (b) => evidenceStore(b);
const readOf = (b, document, opts = {}) => read(document, { evidence: store(b), env: {}, storeName: "bio", ...opts });

/* Every piece of `read(document, {cursor})`, as a caller reading it whole does. */
async function allPieces(b, document) {
  const pieces = [];
  let cursor = null;
  for (let g = 0; g < 400; g++) {
    const out = await readOf(b, document, { unitsBudget: BUDGET, cursor });
    pieces.push(out);
    if (out.more !== true) break;
    cursor = out.cursor;
  }
  return pieces;
}
const unitsOf = (pieces) => pieces.flatMap((p) => p.text_units || []);

/* ---- the 1 MB CSV: rows of known fields; row 1 is the header, the last row LASTROWMARK ---- */
function csvRows(bytes) {
  const rows = [["id", "name", "amount", "note"]];
  for (let n = 20, i = 0; n < bytes; i++) {
    const r = [String(i), `name ${i}`, `${(i * 37) % 9973}.${i % 100}`, `council note ${i} budget line`];
    rows.push(r); n += r.join(",").length + 6;
  }
  rows.push(["LASTROWMARK", "last name", "1.00", "the final row of the sheet"]);
  return rows;
}
const csvText = (rows) => rows.map((r) => r.map((f) => (/[ ,]/.test(f) ? `"${f}"` : f)).join(",")).join("\n") + "\n";
const colLetter = (c) => String.fromCharCode(64 + c);
async function heldCsv(rows) {
  const b = bucket(), bytes = new TextEncoder().encode(csvText(rows));
  const d = await hold(b, bytes);
  return { b, document: doc({ digest: d, bytes: bytes.length, ct: "text/csv", format: "csv", fromText: true }) };
}

/* ---- a workbook of `n` rows by 4 inline-string cells, one sheet "Budget"; row n's first cell is LASTROWMARK ---- */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) { c ^= buf[i]; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1; }
  return (c ^ 0xffffffff) >>> 0;
}
const u16 = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]);
const u32 = (n) => Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name, "utf-8"), data = Buffer.from(f.data, "utf-8");
    const comp = deflateRawSync(data), crc = crc32(data);
    locals.push(Buffer.concat([u32(0x04034b50), u16(20), u16(0x0800), u16(8), u16(0), u16(0x21),
      u32(crc), u32(comp.length), u32(data.length), u16(name.length), u16(0), name, comp]));
    centrals.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(8), u16(0), u16(0x21),
      u32(crc), u32(comp.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]));
    offset += locals[locals.length - 1].length;
  }
  const cd = Buffer.concat(centrals);
  return new Uint8Array(Buffer.concat([...locals, cd, u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cd.length), u32(offset), u16(0)]));
}
const XLSX_CT = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const XMLNS = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
const bookRows = (n) => Array.from({ length: n }, (_, i) => [i === n - 1 ? "LASTROWMARK" : `r${i + 1}c1`, `r${i + 1}c2`, `r${i + 1}c3`, `r${i + 1}c4`]);
function workbook(rows) {
  const sheet = `<?xml version="1.0"?><worksheet ${XMLNS}><sheetData>`
    + rows.map((cells, i) => `<row r="${i + 1}">` + cells.map((v, j) => `<c r="${colLetter(j + 1)}${i + 1}" t="inlineStr"><is><t>${v}</t></is></c>`).join("") + `</row>`).join("")
    + `</sheetData></worksheet>`;
  const R = (inner) => `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${inner}</Relationships>`;
  const T = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  return zip([
    { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${XLSX_CT}.main+xml"/></Types>` },
    { name: "_rels/.rels", data: R(`<Relationship Id="rId1" Type="${T}/officeDocument" Target="xl/workbook.xml"/>`) },
    { name: "xl/workbook.xml", data: `<?xml version="1.0"?><workbook ${XMLNS} xmlns:r="${T}"><sheets><sheet name="Budget" sheetId="1" r:id="rId1"/></sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", data: R(`<Relationship Id="rId1" Type="${T}/worksheet" Target="worksheets/sheet1.xml"/>`) },
    { name: "xl/worksheets/sheet1.xml", data: sheet },
  ]);
}
async function heldBook(rows) {
  const b = bucket(), bytes = workbook(rows);
  const d = await hold(b, bytes);
  return { b, document: doc({ digest: d, bytes: bytes.length, ct: XLSX_CT, format: "xlsx" }) };
}

/* the sum of the words the pieces hold is the words of the text, never past it (R35) */
function wordsAddUp(pieces) {
  const total = pieces[0].reading.words_total;
  let sum = 0;
  for (const p of pieces) { sum += p.piece.words; assert.ok(sum <= total, `words read so far ${sum} never pass the total ${total}`); }
  assert.equal(sum, total, "words_read equals words_total when the whole text was read");
  assert.ok(pieces[0].reading.words_read <= total);
}
/* every row's text is a line of some unit; a block's repeated header line is the sheet's first (R41) */
function everyRowIn(units, expectedLines) {
  const have = new Set(units.flatMap((u) => u.text.split("\n")));
  const missing = expectedLines.filter((l) => !have.has(l));
  assert.deepEqual(missing.slice(0, 3), [], `${missing.length} row(s) of ${expectedLines.length} are in no unit`);
}
/* the cell a typed-cell list holds for (row, col): the fixture's own value, whatever else the entry states of it */
const refOf = (c) => (typeof c.source === "string" ? c.source : c.source && typeof c.source.cell === "string" ? c.source.cell : c.source && c.source.ref) || "";
const cellAt = (cells, row, col) => cells.find((c) => refOf(c).split("!").pop() === `${colLetter(col)}${row}`);

/* ============================= R28, R35 and R44 at the real entries: the seam ============================= */

test("R28 R44 (G41, seam csv-reader #3): a 1 MB CSV read whole in pieces names its sheet in `cells_held`, lists no cell (`cells` null for it), and indexes every row's text, the last row included, the pieces' words adding up to words_total (R35, R-STOP)", async () => {
  const rows = csvRows(1_048_576);
  const { b, document } = await heldCsv(rows);
  const pieces = await allPieces(b, document);
  assert.ok(pieces.length > 1 && pieces[pieces.length - 1].more === false, `${pieces.length} pieces, the last one whole`);
  const first = pieces[0].reading;
  const names = Object.keys(first.cells || {});
  assert.equal(names.length, 1, "the CSV's one sheet is named in `cells`");
  assert.ok(first.cells[names[0]] === null, `its cells are not listed (${Array.isArray(first.cells[names[0]]) ? first.cells[names[0]].length + " cells are" : "null"})`);
  assert.deepEqual(first.cells_held, [names[0]], "and the reading says they are held in the file");
  const units = unitsOf(pieces);
  everyRowIn(units, rows.map((r) => r.join("\t")));
  assert.ok(units.some((u) => u.text.includes("LASTROWMARK")), "the last row is in the units");
  wordsAddUp(pieces);
});

test("R28 R44 (G41, control): a 3-row CSV lists its cells and carries no `cells_held`; the entry's cells are as before", async () => {
  const { b, document } = await heldCsv([["id", "name"], ["1", "a b"], ["2", "c"]]);
  const r = (await readOf(b, document)).reading;
  const [name] = Object.keys(r.cells);
  assert.ok(Array.isArray(r.cells[name]) && r.cells[name].length === 6, "six cells listed");
  assert.equal("cells_held" in r, false);
});

test("R28 R44 (G41, seam office-readers #15): a 5,000-row x 4-cell workbook names its sheet in `cells_held`, lists no cell, and indexes every row's text, the last row included, the pieces' words adding up", async () => {
  const rows = bookRows(5000);
  const { b, document } = await heldBook(rows);
  const pieces = await allPieces(b, document);
  assert.equal(pieces[pieces.length - 1].more, false);
  const first = pieces[0].reading;
  assert.ok(first.cells && first.cells.Budget === null, `its cells are not listed (${Array.isArray(first.cells && first.cells.Budget) ? first.cells.Budget.length + " cells are" : "null"})`);
  assert.deepEqual(first.cells_held, ["Budget"]);
  const units = unitsOf(pieces);
  everyRowIn(units, rows.map((r) => r.join("\t")));
  wordsAddUp(pieces);
});

test("R28 R44 (G41, control): a 200-cell workbook lists its cells and carries no `cells_held`", async () => {
  const { b, document } = await heldBook(bookRows(50));
  const r = (await readOf(b, document)).reading;
  assert.ok(Array.isArray(r.cells.Budget) && r.cells.Budget.length === 200);
  assert.equal("cells_held" in r, false);
});

test("R44 (G41, seam csv-reader #3): `cellsInRange` of the 1 MB CSV's last rows answers exactly the fixture's cells, absolute row numbers, columns and values", async () => {
  const rows = csvRows(1_048_576);
  const { b, document } = await heldCsv(rows);
  const [name] = Object.keys((await readOf(b, document, { unitsBudget: BUDGET, cursor: null })).reading.cells);
  const n = rows.length;
  const out = await cellsInRange(store(b), document, { format: "csv", sheet: name, fromRow: n - 2, toRow: n });
  assert.equal(out.ok, true, JSON.stringify(out).slice(0, 300));
  assert.equal(out.cells.length, 3 * 4, "three rows of four cells");
  for (const row of [n - 2, n - 1, n]) rows[row - 1].forEach((v, j) => {
    const c = cellAt(out.cells, row, j + 1);
    assert.ok(c, `a cell at ${colLetter(j + 1)}${row}`);
    assert.equal(c.value, v);
  });
  assert.equal(cellAt(out.cells, n - 3, 1), undefined, "no cell above the range");
  assert.equal("next_row" in out, false, "a range answered whole names no next_row (K4647)");
  /* K4647: 1-based as a spreadsheet numbers, both ends inclusive; row 1 is the header, column 1 is A */
  const top = await cellsInRange(store(b), document, { format: "csv", sheet: name, fromRow: 1, toRow: 1 });
  assert.equal(top.ok, true);
  assert.deepEqual(top.cells.map((c) => c.value), rows[0], "row 1 is the sheet's first row, its header");
  assert.ok(cellAt(top.cells, 1, 1), "A1 is row 1, column 1");
  const cols = await cellsInRange(store(b), document, { format: "csv", sheet: name, fromRow: n, toRow: n, fromCol: 1, toCol: 1 });
  assert.deepEqual(cols.cells.map((c) => c.value), ["LASTROWMARK"], "column 1 is A, fromCol and toCol inclusive");
  const more = await cellsInRange(store(b), document, { format: "csv", sheet: name, fromRow: 1, toRow: n, maxCells: 6 });
  assert.equal(more.ok, true);
  assert.equal(more.cells.length, 4, "maxCells counts in-extent cells; the entry gives whole rows, stopping before the row that would pass it");
  assert.equal(more.next_row, 2, "next_row is the first row not returned");
});

test("R44 (G41, seam office-readers #15): `cellsInRange` of the 5,000-row workbook's last rows answers exactly the fixture's cells; a column subset and `maxCells` pass to the entry", async () => {
  const rows = bookRows(5000);
  const { b, document } = await heldBook(rows);
  const out = await cellsInRange(store(b), document, { format: "xlsx", sheet: "Budget", fromRow: 4999, toRow: 5000 });
  assert.equal(out.ok, true, JSON.stringify(out).slice(0, 300));
  assert.equal(out.cells.length, 8);
  for (const row of [4999, 5000]) rows[row - 1].forEach((v, j) => assert.equal(cellAt(out.cells, row, j + 1)?.value, v));
  const cols = await cellsInRange(store(b), document, { format: "xlsx", sheet: "Budget", fromRow: 4999, toRow: 5000, fromCol: 2, toCol: 3 });
  assert.equal(cols.ok, true);
  assert.deepEqual(cols.cells.map((c) => c.value), [rows[4998][1], rows[4998][2], rows[4999][1], rows[4999][2]]);
  const few = await cellsInRange(store(b), document, { format: "xlsx", sheet: "Budget", fromRow: 1, toRow: 5000, maxCells: 5 });
  assert.equal(few.ok, true);
  assert.ok(few.cells.length >= 1 && few.cells.length <= 5, "stopped within maxCells in-extent cells");
  assert.equal(few.next_row, Math.max(...few.cells.map((c) => Number(refOf(c).replace(/\D+/g, "")))) + 1, "and names the first row not returned (K4647)");
  assert.equal("next_row" in out, false, "a range answered whole names no next_row");
  /* K4647: 1-based both ends, inclusive: row 1 and the last row, column 1 is A */
  const top = await cellsInRange(store(b), document, { format: "xlsx", sheet: "Budget", fromRow: 1, toRow: 1 });
  assert.deepEqual(top.cells.map((c) => c.value), rows[0], "row 1 is the sheet's first row");
  assert.ok(cellAt(top.cells, 1, 1));
  const end = await cellsInRange(store(b), document, { format: "xlsx", sheet: "Budget", fromRow: 5000, toRow: 5000, fromCol: 4, toCol: 4 });
  assert.deepEqual(end.cells.map((c) => c.value), ["r5000c4"], "the last row, column 4 is D");
  assert.ok(cellAt(end.cells, 5000, 4), "D5000");
});

/* ============================= R44 at `read` and `cellsInRange`, scripted entries ============================= */

const held = (name, extra = {}) => ({ name, rows: null, cols: null, usedRows: 3, usedCols: 2, range: { kind: "sheet-range", sheet: name, range: "A1:B3" },
  text: "a\tb\nc\td\ne\tf", cells: null, cells_held: true, undetermined: [], lineRows: [1, 2, 3], ...extra });
const listed = (name) => ({ name, rows: null, cols: null, usedRows: 1, usedCols: 1, range: { kind: "sheet-range", sheet: name, range: "A1:A1" },
  text: "x", cells: [{ source: "A1", value: "x", type: "text", declared: null, cached: null, formula: null }], undetermined: [] });
const book = (sheets) => ({ ok: true, container: "xlsx", document: sheets.map((s) => s.text).join("\n"), sheets,
  counts: { chars: 10, undetermined: 0 }, undetermined: [] });

test("R44 (G41): `read` asks the entry for its text with the inline cap, `{inlineCellsMax: INLINE_CELLS_MAX_BYTES}`, and with nothing else changed", async () => {
  const asked = [];
  const entry = { format: "t41", text: async (...args) => { asked.push(args); return book([held("Big")]); } };
  const b = bucket();
  const d = await hold(b, "t41 bytes");
  await withEntry(entry, async () => { await readOf(b, doc({ digest: d, bytes: 9, ct: "application/x-t41", format: "t41" })); });
  assert.equal(asked.length, 1);
  assert.deepEqual(asked[0][1], { inlineCellsMax: INLINE_CELLS_MAX_BYTES });
  assert.equal(INLINE_CELLS_MAX_BYTES, 512 * 1024);
});

test("R28 R44 (G41): the reading carries `cells_held`, the names of the sheets whose cells are held, beside `cells` (null for each); a workbook with a held and a listed sheet names only the held one; a workbook with none carries no key", async () => {
  const b = bucket();
  const d = await hold(b, "t41 bytes");
  const document = doc({ digest: d, bytes: 9, ct: "application/x-t41", format: "t41" });
  const go = (sheets) => withEntry({ format: "t41", text: async () => book(sheets) }, async () => (await readOf(b, document)).reading);
  const mixed = await go([held("Big"), listed("Small"), held("Huge")]);
  assert.deepEqual(mixed.cells_held, ["Big", "Huge"]);
  assert.deepEqual(Object.keys(mixed.cells), ["Big", "Small", "Huge"]);
  assert.equal(mixed.cells.Big, null); assert.equal(mixed.cells.Huge, null);
  assert.equal(mixed.cells.Small.length, 1);
  const none = await go([listed("Small")]);
  assert.equal("cells_held" in none, false);
  assert.equal(none.cells.Small.length, 1);
  /* a sheet over an entry's own guard has cells null and no marker (R28): not held, not listed */
  const guarded = await go([{ ...listed("Over"), cells: null }]);
  assert.equal("cells_held" in guarded, false);
  assert.deepEqual(guarded.cells, { Over: null });
  /* the marker is read only where the entry said `true`, and only for a sheet with a name */
  assert.equal(emittedFieldsOf(book([held("A", { cells_held: "yes" }), { ...held("B"), cells: [] }])).cells_held, undefined);
  assert.equal(emittedFieldsOf(book([{ ...held("A"), name: undefined }])).cells_held, undefined, "a sheet with no name is no key and is not named");
});

test("R35 R44 (G41): a held sheet's rows stay indexed in pieces and counted once: every row is in the units and the pieces' words equal words_total", async () => {
  const lines = Array.from({ length: 9000 }, (_, i) => (i === 0 ? "Fund\tAmount" : `Fund ${i}\t${i * 100}`));
  const entry = { format: "t41", text: async () => book([{ ...held("Big"), text: lines.join("\n"), usedRows: 9000, range: { kind: "sheet-range", sheet: "Big", range: "A1:B9000" }, lineRows: lines.map((_, i) => i + 1) }]) };
  const b = bucket();
  const d = await hold(b, "t41 bytes");
  await withEntry(entry, async () => {
    const pieces = await allPieces(b, doc({ digest: d, bytes: 9, ct: "application/x-t41", format: "t41" }));
    assert.deepEqual(pieces[0].reading.cells_held, ["Big"]);
    everyRowIn(unitsOf(pieces), lines);
    wordsAddUp(pieces);
    assert.equal(pieces[0].reading.words_total, lines.reduce((n, l) => n + wordsIn(l), 0));
  });
});

test("R44 (G41): `cellsInRange` reads the held bytes (the whole object, or the parts), hands them and the range to the format's `cellsIn`, and answers its answer as it is", async () => {
  const seen = [];
  const entry = { format: "t41", cellsIn: async (bytes, ask) => { seen.push({ text: new TextDecoder().decode(bytes), ask }); return { ok: true, cells: [{ source: "A9", value: "v" }], rows: { from: 9, to: 9 }, next_row: 10 }; } };
  const b = bucket();
  const d = await hold(b, "t41 bytes");
  await withEntry(entry, async () => {
    const document = doc({ digest: d, bytes: 9, ct: "application/x-t41", format: "t41" });
    const out = await cellsInRange(store(b), document, { format: "t41", sheet: "Big", fromRow: 9, toRow: 9, fromCol: 1, toCol: 2, maxCells: 100 });
    assert.deepEqual(out, { ok: true, cells: [{ source: "A9", value: "v" }], rows: { from: 9, to: 9 }, next_row: 10 });
    assert.deepEqual(seen, [{ text: "t41 bytes", ask: { sheet: "Big", fromRow: 9, toRow: 9, fromCol: 1, toCol: 2, maxCells: 100 } }]);
    await cellsInRange(store(b), document, { format: "t41", sheet: "Big" });
    assert.deepEqual(seen[1].ask, { sheet: "Big" }, "a parameter not given is not passed");
    /* held in parts, no whole under the document's digest: assembled as `bytesOf` does */
    const p1 = await hold(b, "t41 "), p2 = await hold(b, "bytes");
    const split = doc({ digest: "f".repeat(64), bytes: 9, ct: "application/x-t41", format: "t41", parts: [{ sha256: p1, bytes: 4 }, { sha256: p2, bytes: 5 }] });
    assert.equal((await cellsInRange(store(b), split, { format: "t41", sheet: "Big" })).ok, true);
    assert.equal(seen[2].text, "t41 bytes");
  });
});

test("R44 (G41): `cellsInRange` answers `cells_not_interpretable` for an entry without the slot, an unknown format or none, and `bytes_not_held` (transient) for bytes the store does not hold; it never throws", async () => {
  const b = bucket();
  const d = await hold(b, "t41 bytes");
  const document = doc({ digest: d, bytes: 9, ct: "application/x-t41", format: "t41" });
  await withEntry({ format: "t41", text: async () => book([held("Big")]) }, async () => {
    assert.deepEqual(await cellsInRange(store(b), document, { format: "t41", sheet: "Big" }), { ok: false, reason: "cells_not_interpretable" });
  });
  assert.deepEqual(await cellsInRange(store(b), document, { format: "nosuchformat" }), { ok: false, reason: "cells_not_interpretable" });
  assert.deepEqual(await cellsInRange(store(b), document, {}), { ok: false, reason: "cells_not_interpretable" });
  assert.deepEqual(await cellsInRange(store(b), document), { ok: false, reason: "cells_not_interpretable" });
  await withEntry({ format: "t41", cellsIn: async () => ({ ok: true, cells: [] }) }, async () => {
    const missing = doc({ digest: "e".repeat(64), bytes: 9, ct: "application/x-t41", format: "t41" });
    const gone = await cellsInRange(store(b), missing, { format: "t41", sheet: "Big" });
    assert.equal(gone.ok, false); assert.equal(gone.reason, "bytes_not_held"); assert.equal(gone.failure, "transient");
    const noStore = await cellsInRange(null, document, { format: "t41", sheet: "Big" });
    assert.equal(noStore.ok, false); assert.equal(noStore.reason, "bytes_not_held");
    const thrown = await cellsInRange({ head: () => { throw new Error("store down"); }, get: () => { throw new Error("store down"); } }, document, { format: "t41", sheet: "Big" });
    assert.equal(thrown.ok, false); assert.equal(thrown.reason, "bytes_not_held"); assert.equal(thrown.failure, "transient");
    const nothing = await cellsInRange(store(b), null, { format: "t41", sheet: "Big" });
    assert.equal(nothing.ok, false);
  });
  await withEntry({ format: "t41", cellsIn: async () => { throw new Error("entry broke"); } }, async () => {
    const out = await cellsInRange(store(b), document, { format: "t41", sheet: "Big" });
    assert.equal(out.ok, false); assert.equal(out.reason, "cells_not_interpretable");
  });
  await withEntry({ format: "t41", cellsIn: async () => "not an answer" }, async () => {
    assert.deepEqual(await cellsInRange(store(b), document, { format: "t41", sheet: "Big" }), { ok: false, reason: "cells_not_interpretable" });
  });
  await withEntry({ format: "t41", cellsIn: async () => ({ ok: false, reason: "no_such_sheet" }) }, async () => {
    assert.deepEqual(await cellsInRange(store(b), document, { format: "t41", sheet: "Nope" }), { ok: false, reason: "no_such_sheet" }, "an entry's own refusal is answered as it is");
  });
});

test("R44 (G41, K4656): one refusal shape whatever the entry: `reason` is set from an entry that answers only `why`, `why` kept; both real readers' refusals (a sheet that is not there, a bad range)", async () => {
  const b = bucket();
  const d = await hold(b, "t41 bytes");
  const document = doc({ digest: d, bytes: 9, ct: "application/x-t41", format: "t41" });
  await withEntry({ format: "t41", cellsIn: async () => ({ ok: false, why: "bad_range" }) }, async () => {
    assert.deepEqual(await cellsInRange(store(b), document, { format: "t41" }), { ok: false, why: "bad_range", reason: "bad_range" });
  });
  // fixtures-own: synthetic a plug-in format entry registered through this module's own seam (`withEntry`), whose cellsIn answers both `reason` and `why` to test the one refusal shape; no other module's answer
  await withEntry({ format: "t41", cellsIn: async () => ({ ok: false, reason: "r", why: "w" }) }, async () => {
    assert.deepEqual(await cellsInRange(store(b), document, { format: "t41" }), { ok: false, reason: "r", why: "w" });
  });
  const csv = await heldCsv([["a", "b"], ["1", "2"]]);
  const bad = await cellsInRange(store(csv.b), csv.document, { format: "csv", sheet: "csv", fromRow: 0 });
  assert.equal(bad.ok, false); assert.equal(typeof bad.reason, "string"); assert.ok(bad.reason.length > 0);
  const nosheet = await cellsInRange(store(csv.b), csv.document, { format: "csv", sheet: "No such sheet" });
  assert.equal(nosheet.ok, false); assert.equal(nosheet.reason, "no_such_sheet");
  const book = await heldBook(bookRows(3));
  const nb = await cellsInRange(store(book.b), book.document, { format: "xlsx", sheet: "No such sheet", fromRow: 1, toRow: 1 });
  assert.equal(nb.ok, false); assert.equal(typeof nb.reason, "string"); assert.ok(nb.reason.length > 0);
  const bb = await cellsInRange(store(book.b), book.document, { format: "xlsx", sheet: "Budget", fromRow: 0 });
  assert.equal(bb.ok, false); assert.equal(typeof bb.reason, "string");
});
