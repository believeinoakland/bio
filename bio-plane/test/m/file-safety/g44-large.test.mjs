/* G44 (fix round 6; K4655, K4662, K4665): the safe view of a large spreadsheet is its sheets' names and first whole rows with the
   cut stated, never every cell and never an empty view. R11 (the data answer, amended), R51 (a file above what a preview can
   show is stated with its size and bound, amended), R21 (the new bounds are exported). Every case goes through the
   real op (`fileSafetyOps(...).safeview`) over `filedWorld()`; the large ones run in a child whose old space is the platform
   object's (`capFor`, the plane's shape: 128 + 39 - the file's MB, less the plane's idle 87.7, plus the fixture's own idle),
   so a child that dies of memory fails the test. Not asserted: any compute time (R-CLOCK). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { filedWorld as world, enc } from "./fixture.mjs";
import * as FS from "../../../src/file-safety/index.mjs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { makeZip } from "../../make-zip.mjs";
import { genSheetXml, smallSheetXml, xlsxOf, csvOf, odsOf, MIB } from "./g44-fixtures.mjs";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const { GRADE_READ_MAX, fileSafetyOps } = FS;
const CELLS = FS.SAFE_VIEW_CELLS_MAX, SHEETS = FS.SAFE_VIEW_SHEETS_MAX, TOTAL = FS.SAFE_VIEW_TOTAL_CELLS_MAX;

/* The platform object's old space for a file of `mb` MB, the plane's idle taken out and the fixture's own put in (diagnosis-R6-g44 §2). */
const capFor = (mb, idle) => Math.max(40, Math.round(128 + 39 - mb - 87.7 + idle));
const seen = [];
async function inChild(t, name, bytes) {
  const dir = mkdtempSync(join(tmpdir(), "g44-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, name);
  writeFileSync(file, bytes);
  const child = async (cap, job) => JSON.parse((await run(process.execPath, ["--expose-gc", `--max-old-space-size=${cap}`, join(HERE, "g44-child.mjs"), file, job],
    { maxBuffer: 1 << 26 })).stdout);
  const idle = await child(512, "idle");
  const cap = capFor(bytes.length / 1e6, idle.idleMB);
  const out = await child(cap, "view");
  seen.push(`${name}: ${bytes.length} B, idle ${out.idleMB.toFixed(1)} MB, cap ${cap} MB, peak ${(out.peakMB - out.idleMB).toFixed(1)} MB above idle`);
  t.diagnostic(seen[seen.length - 1]);
  return out.answer;
}
const view = async (w, sha) => fileSafetyOps(w.fs, new URL(`http://x/safeview?capture=${sha}&viewer=member:m1`), {}, w.env).safeview();
const rowOf = (c) => Number(/(\d+)$/.exec(c.ref)[1]);

/* a first screen of a sheet is whole rows from row 1, cut where the sheet goes on, and says so */
function firstScreen(sheet, totalRows) {
  assert.ok(sheet.cells.length > 0 && sheet.cells.length <= CELLS, `${sheet.cells.length} cells`);
  const last = rowOf(sheet.cells[sheet.cells.length - 1]);
  assert.deepEqual(sheet.rows, { from: rowOf(sheet.cells[0]), to: last });
  assert.equal(sheet.rows.from, 1);
  assert.equal(sheet.truncated, true);
  assert.equal(sheet.next_row, last + 1);
  assert.equal(sheet.total_rows, totalRows);
  assert.equal("reason" in sheet, false);
  assert.ok(sheet.cells.every((c) => typeof c.ref === "string" && "value" in c && "type" in c));
}

test("R21 R11: the safe view's bounds are exported by name, with figures that keep the first screen small", () => {
  for (const k of ["SAFE_VIEW_CELLS_MAX", "SAFE_VIEW_SHEETS_MAX", "SAFE_VIEW_TOTAL_CELLS_MAX", "SAFE_VIEW_ODS_DECLARED_MAX"])
    assert.ok(Number.isInteger(FS[k]) && FS[k] > 0, k);
  assert.ok(CELLS <= TOTAL && TOTAL <= CELLS * SHEETS);
});

test("R11: the 10 MiB-declared workbook (73,792 rows x 3 cells, a 1.4 MB file) at the platform object's old space answers its first screen with the cut stated", async (t) => {
  const { xml, rows } = genSheetXml(10 * MIB);
  const a = await inChild(t, "ten.xlsx", xlsxOf([{ name: "Big", xml }]));
  assert.deepEqual([a.ok, a.kind, a.derived], [true, "data", true]);
  assert.equal(a.sheets.length, 1);
  assert.equal(a.sheets[0].name, "Big");
  firstScreen(a.sheets[0], rows);
  assert.deepEqual([a.sheets_total, a.sheets_truncated], [1, false]);
  assert.ok(JSON.stringify(a).length < 200_000, "the answer stays small");
  assert.ok(rows > 73_000, "the fixture is the walker's shape");
});

test("R11: a 4 MB and a 17.7 MB CSV at the platform object's old space answer their first screen with the cut stated", async (t) => {
  for (const size of [4_000_000, 17_700_000]) {
    const { bytes, rows } = csvOf(size);
    const a = await inChild(t, `${size}.csv`, bytes);
    assert.deepEqual([a.ok, a.kind], [true, "data"], `${size}`);
    assert.equal(a.sheets.length, 1);
    firstScreen(a.sheets[0], rows);
  }
});

test("R11: a row of 200,000 fields is cut to SAFE_VIEW_CELLS_MAX cells and the sheet says it is truncated; the answer stays small", async (t) => {
  /* 16,000 fields: under the reader's column bound (16,384, G124e), over the cut */
  const row = `${Array.from({ length: 16_000 }, () => "a").join(",")}\n`;
  const a = await inChild(t, "wide.csv", enc(row + row));
  assert.deepEqual([a.ok, a.kind], [true, "data"]);
  const s = a.sheets[0];
  assert.deepEqual([s.cells.length, s.truncated, s.rows, s.total_rows], [CELLS, true, { from: 1, to: 1 }, 2]);
  assert.ok(JSON.stringify(a).length < 200_000);
  /* control: the cells of a row under the cap are not cut */
  const w = world();
  const ok = (await view(w, await w.capture(enc(`${Array.from({ length: 50 }, (_, i) => i).join(",")}\n${Array.from({ length: 50 }, (_, i) => i).join(",")}\n`)))).sheets[0];
  assert.deepEqual([ok.cells.length, ok.truncated], [100, false]);
});

test("R11: a small workbook and a small CSV answer what they always did beside the new keys (every cell, truncated false, no reason); control for the cut", async () => {
  const w = world();
  const x = await w.capture(xlsxOf([{ name: "Budget", xml: smallSheetXml(2) }]));
  const v = await view(w, x);
  assert.deepEqual(v.sheets, [{ name: "Budget", cells: [{ ref: "A1", value: "1", type: "number" }, { ref: "A2", value: "2", type: "number" }],
    rows: { from: 1, to: 2 }, total_rows: 2, truncated: false, next_row: null }]);
  assert.deepEqual([v.sheets_total, v.sheets_truncated], [1, false]);
  const c = await view(w, await w.capture(enc("year,amount\n2025,310000\n")));
  assert.deepEqual(c.sheets, [{ name: "csv", cells: [{ ref: "A1", value: "year", type: "text" }, { ref: "B1", value: "amount", type: "text" },
    { ref: "A2", value: "2025", type: "text" }, { ref: "B2", value: "310000", type: "text" }], rows: { from: 1, to: 2 }, total_rows: 2, truncated: false, next_row: null }]);
  /* an empty sheet is an empty sheet: no rows, nothing cut, no reason */
  const e = await view(w, await w.capture(xlsxOf([{ name: "E", xml: smallSheetXml(0) }])));
  assert.deepEqual(e.sheets, [{ name: "E", cells: [], rows: null, total_rows: 0, truncated: false, next_row: null }]);
  /* the cut is the bound: a sheet of exactly SAFE_VIEW_CELLS_MAX single-cell rows is whole, one more row is cut */
  const whole = await view(w, await w.capture(xlsxOf([{ name: "W", xml: smallSheetXml(CELLS) }])));
  assert.deepEqual([whole.sheets[0].cells.length, whole.sheets[0].truncated, whole.sheets[0].next_row], [CELLS, false, null]);
  const cut = await view(w, await w.capture(xlsxOf([{ name: "W", xml: smallSheetXml(CELLS + 1) }])));
  assert.deepEqual([cut.sheets[0].cells.length, cut.sheets[0].truncated, cut.sheets[0].next_row, cut.sheets[0].total_rows], [CELLS, true, CELLS + 1, CELLS + 1]);
});

test("R11: the first rows of a cut sheet are the cells the reader lists for those rows, whether the workbook's cells came listed or held, and for a CSV", async () => {
  const w = world();
  /* 400 rows: its cells are listed; 20,000 rows: past the cap on listed cells, they are held and made by cellsIn */
  for (const n of [400, 20_000]) {
    const { xml, rows } = genSheetXml(n === 400 ? 60_000 : 2.9 * MIB);
    const bytes = xlsxOf([{ name: "Big", xml }]);
    const listed = (await xlsxEntry.text(bytes)).sheets[0].cells;
    const a = (await view(w, await w.capture(bytes))).sheets[0];
    assert.ok(a.cells.length > 0);
    assert.deepEqual(a.cells, listed.slice(0, a.cells.length).map((c) => ({ ref: c.source.cell, value: c.value, type: c.type })), `${n}: rows ${rows}`);
    assert.equal(a.total_rows, rows);
    assert.equal(a.truncated, a.cells.length < listed.length);
  }
  const { bytes, rows } = csvOf(300_000);
  const c = (await view(w, await w.capture(bytes))).sheets[0];
  const lines = new TextDecoder().decode(bytes).split("\n").slice(0, 3);
  assert.deepEqual(c.cells.slice(0, 3).map((x) => x.value), [lines[0].split(",")[0], "label 1 of the row", "1.5"]);
  assert.equal(c.total_rows, rows);
  assert.equal(c.truncated, true);
});

test("R11 R51: a file above what a preview can show is stated with its size and bound, never ok with no cells: a workbook over the whole-read bound, a CSV over its, a file over GRADE_READ_MAX, an ODS over its bound", async (t) => {
  const w = world();
  const stated = (r, reason, extra = {}) => {
    assert.ok(!(r instanceof Response));
    assert.deepEqual([r.ok, r.code, r.renderer_reason], [false, "SAFE_VIEW_FAILED", reason]);
    assert.ok(Number.isFinite(r.size) && Number.isFinite(r.bound) && r.size > r.bound, JSON.stringify([r.size, r.bound]));
    for (const [k, v] of Object.entries(extra)) assert.equal(r[k], v, k);
  };
  /* a workbook of 26.2 MB declared (read in pieces past 20 MiB): stated, size and bound */
  const { xml } = genSheetXml(26.2 * MIB);
  stated(await view(w, await w.capture(xlsxOf([{ name: "Big", xml }]))), "PREVIEW_NOT_DRAWN", { format: "xlsx" });
  /* a CSV of 18.5 MB is drawn (the light kinds take the standard's figure, K4834: the reader's old 17 MiB is gone) and one of 20,971,571 B (over GRADE_READ_MAX) is stated */
  assert.equal((await view(w, await w.capture(csvOf(18_500_000).bytes))).kind, "data");
  stated(await view(w, await w.capture(csvOf(20_971_571).bytes)), "TOO_LARGE", { format: "csv", bound: GRADE_READ_MAX });
  /* an xlsx file above GRADE_READ_MAX (the package, not its text): the zip is never loaded, and says why */
  const pad = new Uint8Array(21 * MIB);
  stated(await view(w, await w.capture(xlsxOf([{ name: "S", xml: smallSheetXml(2) }], [{ name: "xl/media/big.bin", data: pad, method: 0 }]))), "TOO_LARGE", { bound: GRADE_READ_MAX });
  /* an ODS whose content.xml declares more than its bound: stated, the part never read (the central directory lies, the bytes are small) */
  const lie = { central: { uncompressedSize: FS.SAFE_VIEW_ODS_DECLARED_MAX + 1 } };
  stated(await view(w, await w.capture(odsOf(1000, lie).bytes)), "PREVIEW_NOT_DRAWN", { format: "ods", bound: FS.SAFE_VIEW_ODS_DECLARED_MAX });
  /* an ODS whose entry answers no sheet (a repeat of two billion spaces): stated with the entry's own figures, not an empty view */
  const NS = 'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"';
  const type = "application/vnd.oasis.opendocument.spreadsheet";
  const repeat = makeZip([{ name: "mimetype", data: type, method: 0 }, { name: "META-INF/manifest.xml", data: '<?xml version="1.0"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"/>' },
    { name: "content.xml", data: `<?xml version="1.0"?><office:document-content ${NS} office:version="1.3"><office:body><office:spreadsheet><table:table table:name="S"><table:table-row><table:table-cell office:value-type="string"><text:p>a<text:s text:c="2000000000"/>b</text:p></table:table-cell></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>` }]);
  const rep = await view(w, await w.capture(repeat));
  assert.deepEqual([rep.ok, rep.code, rep.renderer_reason, rep.format], [false, "SAFE_VIEW_FAILED", "PREVIEW_NOT_DRAWN", "ods"]);
  assert.ok(Number.isFinite(rep.size) && Number.isFinite(rep.bound) && rep.size > rep.bound);
  /* controls: a workbook, a CSV and an ODS just inside their bounds are drawn */
  const inside = await view(w, await w.capture(xlsxOf([{ name: "S", xml: genSheetXml(19 * MIB).xml }])));
  assert.deepEqual([inside.ok, inside.kind], [true, "data"]);
  assert.equal((await view(w, await w.capture(csvOf(5_000_000).bytes))).kind, "data");
  assert.equal((await view(w, await w.capture(odsOf(100_000).bytes))).kind, "data");
});

test("R11: an ODS inside its bound at the platform object's old space answers its first rows, cut and stated (the entry has no cellsIn)", async (t) => {
  const { bytes, rows } = odsOf(FS.SAFE_VIEW_ODS_DECLARED_MAX - 100_000);
  const a = await inChild(t, "ods.ods", bytes);
  assert.deepEqual([a.ok, a.kind], [true, "data"]);
  firstScreen(a.sheets[0], rows);
  assert.equal(a.sheets[0].name, "S");
});

test("R11: a workbook of many sheets answers at most SAFE_VIEW_SHEETS_MAX sheets and TOTAL cells, and says how many there are", async () => {
  const w = world();
  const many = await view(w, await w.capture(xlsxOf(Array.from({ length: SHEETS + 5 }, (_, i) => ({ name: `S${i + 1}`, xml: smallSheetXml(3) })))));
  assert.equal(many.sheets.length, SHEETS);
  assert.deepEqual([many.sheets_total, many.sheets_truncated], [SHEETS + 5, true]);
  assert.deepEqual(many.sheets.map((s) => s.name), Array.from({ length: SHEETS }, (_, i) => `S${i + 1}`));
  /* the overall cell cap: sheets of SAFE_VIEW_CELLS_MAX cells each stop where the total is reached */
  const per = Math.ceil(CELLS * 0.9);
  const fat = await view(w, await w.capture(xlsxOf(Array.from({ length: SHEETS }, (_, i) => ({ name: `F${i + 1}`, xml: smallSheetXml(per) })))));
  const shown = fat.sheets.reduce((n, s) => n + s.cells.length, 0);
  assert.ok(shown <= TOTAL + per, `${shown} cells shown`);
  assert.equal(fat.sheets_truncated, fat.sheets.length < SHEETS);
  assert.equal(fat.sheets_total, SHEETS);
  /* control: a workbook of two small sheets is whole */
  const two = await view(w, await w.capture(xlsxOf([{ name: "A", xml: smallSheetXml(2) }, { name: "B", xml: smallSheetXml(2, "b") }])));
  assert.deepEqual([two.sheets.length, two.sheets_total, two.sheets_truncated], [2, 2, false]);
});

test("R11: a sheet that cannot be read states why on the sheet, never an empty sheet, and the others are drawn; a failure of cellsIn says so too", async () => {
  const w = world();
  const corrupt = { central: { crc32: 1 } };
  const v = await view(w, await w.capture(xlsxOf([{ name: "Good", xml: smallSheetXml(2) }, { name: "Bad", xml: smallSheetXml(2), entry: corrupt }])));
  assert.equal(v.ok, true);
  assert.deepEqual(v.sheets.map((s) => [s.name, s.cells.length, s.reason ?? null]), [["Good", 2, null], ["Bad", 0, "sheet_unreadable"]]);
  assert.deepEqual([v.sheets[1].rows, v.sheets[1].total_rows, v.sheets[1].truncated, v.sheets[1].next_row], [null, null, false, null]);
  /* a held workbook (its cells past the cap on listed cells) whose cellsIn fails for one sheet: that sheet states it, the other is drawn */
  const entries = { xlsx: { ...xlsxEntry, cellsIn: async (p, q) => (q.sheet === 1 ? { ok: false, reason: "cells_in_failed" } : xlsxEntry.cellsIn(p, q)) } };
  const held = xlsxOf([{ name: "One", xml: genSheetXml(1.5 * MIB).xml }, { name: "Two", xml: genSheetXml(1.5 * MIB).xml }]);
  const s = await FS.sheetsOf("xlsx", held, entries);
  assert.equal(s.ok, true);
  assert.deepEqual(s.sheets.map((x) => [x.name, x.cells.length > 0, x.reason ?? null]), [["One", true, null], ["Two", false, "cells_unreadable"]]);
  assert.equal(s.sheets[1].truncated, false);
  assert.equal(s.sheets[1].total_rows, null, "no size is stated for a sheet that could not be shown");
});

test("R11: the five words the safe view's cut and no-preview are told in are code-origin sentences taking their variables, keyed as the contract names them", () => {
  assert.deepEqual([...FS.SCREEN_WORD_KEYS].sort(), ["screen.open-file.safe.cut", "screen.open-file.safe.cut.more", "screen.open-file.safe.notdrawn",
    "screen.open-file.safe.sheet.unreadable", "screen.open-file.safe.sheetscut"]);
  const W = FS.SCREEN_WORDS;
  const said = [W.cut({ from: 1, to: 250, total: 70711 }), W.cutMore({ from: 1, to: 250 }), W.sheetsCut({ shown: 20, total: 25 }),
    W.notDrawn({ size: "26.2", bound: "20.0" }), W.sheetUnreadable({ name: "Bad" })];
  for (const s of said) assert.ok(typeof s === "string" && s.length > 0 && !/[{}]/.test(s), s);
  assert.match(said[0], /70711|70,711/);
  assert.match(said[3], /26\.2/);
  assert.match(said[4], /Bad/);
  /* every sentence tells the member the original holds the rest */
  for (const s of said) assert.match(s, /original/i);
  assert.equal(typeof word, "function");
});
