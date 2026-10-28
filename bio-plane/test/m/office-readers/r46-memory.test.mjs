/* office-readers R46 (fix round 9, G178; K5006): a workbook is read within its memory with room to spare. The text of a sheet and
   the document's are made once: not as one string per row beside the joined sheet and the joined document, and not while the
   unpacked parts they came from are all still held. Two parts: the answer is what it always was (the control), and the read's
   peak, measured in a child, is a small multiple of the document it makes. The whole case at the platform's shape (150,000 rows
   against `capFor(128)`) is plane's `g41-shape.test.mjs`, whose xlsx case carries the 85 % margin. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as F from "./fixtures.mjs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { generate } from "../../sheetgen.mjs";
import { capFor } from "../../../src/byte-ledger.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const sheetOf = (rows) => F.sheetXml({ rows: rows.map((cells, i) => ({ r: i + 1, cells: cells.map((is, j) => ({ r: `${"ABC"[j]}${i + 1}`, t: "inlineStr", is })) })) });

test("R46 control: a workbook of several sheets answers the same text: each sheet's own lines, the document the non-empty sheets' texts joined by a newline, every character exact", async () => {
  const one = [["naïve", "señor", "ordinance"], ["مدينة", "😀 emoji", "﻿first"], ["a&amp;b", "tab", "end"]];
  const three = [["x"], ["y", "z"]];
  const bytes = F.xlsx({ sheets: [
    { name: "One", xml: sheetOf(one) },
    { name: "Empty", data: { rows: [] } },
    { name: "Three", xml: sheetOf(three) },
  ] });
  const t = await xlsxEntry.text(bytes);
  assert.equal(t.ok, true);
  const want = [one.map((r) => r.join("\t").replace("a&amp;b", "a&b")).join("\n"), "", three.map((r) => r.join("\t")).join("\n")];
  assert.deepEqual(t.sheets.map((s) => s.text), want);
  assert.equal(t.document, `${want[0]}\n${want[2]}`);
  assert.equal(t.counts.chars, t.document.length);
  assert.deepEqual(t.sheets.map((s) => s.lineRows), [[1, 2, 3], [], [1, 2]]);
  /* the text is the sheet's own whatever the options are */
  const held = await xlsxEntry.text(bytes, { inlineCellsMax: 0 });
  assert.equal(held.document, t.document);
  assert.deepEqual(held.sheets.map((s) => s.text), want);
});

test("R46 control: a workbook of one sheet gives that sheet's text as its document; no sheet with text gives the empty document", async () => {
  const solo = await xlsxEntry.text(F.xlsx({ sheets: [{ name: "Solo", xml: sheetOf([["only", "row"]]) }] }));
  assert.equal(solo.document, "only\trow");
  assert.equal(solo.sheets[0].text, solo.document);
  const none = await xlsxEntry.text(F.xlsx({ sheets: [{ name: "A", data: { rows: [] } }, { name: "B", data: { rows: [] } }] }));
  assert.equal(none.document, "");
  assert.deepEqual(none.sheets.map((s) => s.text), ["", ""]);
  assert.equal(none.counts.chars, 0);
});

test("R46 control: a sheet that cannot be read to its end gives none of its lines, and the sheets around it are exactly their own (a part whose declared size is not its size is read in pieces and fails after its rows were walked)", async () => {
  const before = [["first", "sheet"], ["second", "row"]], after = [["last", "sheet"]];
  const bytes = F.xlsx({ sheets: [
    { name: "Before", xml: sheetOf(before) },
    { name: "Bad", xml: sheetOf([["never", "kept"], ["lost", "rows"]]), cd: F.OVER_WHOLE },
    { name: "After", xml: sheetOf(after) },
  ] });
  const t = await xlsxEntry.text(bytes);
  assert.equal(t.ok, true);
  assert.equal(t.sheets[1].text, "");
  assert.deepEqual(t.sheets[1].lineRows, undefined);
  assert.equal(t.sheets[1].cells, null);
  const text = (rows) => rows.map((r) => r.join("\t")).join("\n");
  assert.equal(t.sheets[0].text, text(before));
  assert.equal(t.sheets[2].text, text(after));
  assert.equal(t.document, `${text(before)}\n${text(after)}`);
  assert.ok(!t.document.includes("never") && !t.document.includes("lost"), "none of the unreadable sheet's rows is in the document");
});

test("R46 a 150,000-row workbook of 3 cells a row (the platform's shape) is read holding at most 6.5 bytes for each character of the document above its idle, while the unpacked parts are streamed and the text is made once", async (t) => {
  const recipe = { kind: "xlsx", seed: "hx150000", size: { rows: 150_000, cols: 3 }, header: "one", types: ["text", "integer", "text"] };
  const chunks = [];
  for await (const c of generate(recipe).chunks()) chunks.push(Buffer.from(c));
  const dir = mkdtempSync(join(tmpdir(), "r46-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, "table.xlsx");
  writeFileSync(file, Buffer.concat(chunks));
  const child = async () => JSON.parse((await run(process.execPath, ["--expose-gc", "--max-old-space-size=202", "--max-semi-space-size=2",
    join(HERE, "r46-peak-child.mjs"), file], { maxBuffer: 1 << 26 })).stdout);
  /* the least of three: a collector that runs late shows in one run, not in all */
  const runs = [await child(), await child(), await child()];
  const best = runs.reduce((a, b) => (b.aboveIdleMB < a.aboveIdleMB ? b : a));
  t.diagnostic(`above idle ${runs.map((r) => r.aboveIdleMB.toFixed(1)).join(", ")} MB for a document of ${best.documentLength} characters`);
  assert.equal(best.ok, true);
  assert.equal(best.sheetIsDocument, true, "one sheet: its text is the document, held once");
  assert.equal(best.lines, 150_001);
  assert.ok(best.piecewise, "over the whole-read bound the sheet is read in pieces");
  assert.ok(best.aboveIdleMB * 1048576 <= 6.5 * best.documentLength, `${best.aboveIdleMB.toFixed(1)} MB above idle for ${best.documentLength} characters`);
});

/* The platform shape (T53-541, K5655): the largest workbook under the active `xlsx.declared_text` bound, read whole by `xlsxEntry.text()`
   in five child processes pinned to one core beside three CPU burners on that same core. The child's old space is its idle heap plus
   `capFor(128)`, and its peak above that idle must stay within 85 % of `capFor(128)`. Nothing here is imported from a later module. */
const R46_CAP = capFor(128);
const R46_RECIPE = (rows) => ({ kind: "xlsx", seed: "r46-shape", size: { rows, cols: 3 }, header: "none" });

/* the declared text of a workbook: its worksheets' uncompressed sizes, from the central directory */
function declaredSheetBytes(bytes) {
  const buf = Buffer.from(bytes);
  /* the generator writes zip64: the directory's offset and any size of 0xFFFFFFFF are in the zip64 records */
  const z64 = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x06, 0x06]));
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  let off = z64 >= 0 ? Number(buf.readBigUInt64LE(z64 + 48)) : buf.readUInt32LE(eocd + 16), total = 0;
  while (off + 46 <= buf.length && buf.readUInt32LE(off) === 0x02014b50) {
    const nl = buf.readUInt16LE(off + 28), xl = buf.readUInt16LE(off + 30), cl = buf.readUInt16LE(off + 32);
    const name = buf.toString("utf8", off + 46, off + 46 + nl);
    let size = buf.readUInt32LE(off + 24);
    if (size === 0xffffffff) size = Number(buf.readBigUInt64LE(off + 46 + nl + 4));
    if (name.startsWith("xl/worksheets/")) total += size;
    off += 46 + nl + xl + cl;
  }
  return total;
}

/* the largest sheet under the bound: two sample sheets give the bytes a row (the fixed part cancels), then the estimate is corrected
   against the generated sheet's own declared bytes until it is just under the bound */
async function sheetUnder(bound) {
  const a = 1000, b = 2000;
  const da = declaredSheetBytes(await generate(R46_RECIPE(a)).bytes()), db = declaredSheetBytes(await generate(R46_RECIPE(b)).bytes());
  const perRow = (db - da) / (b - a);
  let rows = Math.floor((0.99 * bound - (da - a * perRow)) / perRow), buf, declared;
  for (let i = 0; i < 4; i++) {
    buf = await generate(R46_RECIPE(rows)).bytes();
    declared = declaredSheetBytes(buf);
    if (declared < bound && declared > 0.97 * bound) break;
    rows = Math.floor((rows * 0.985 * bound) / declared);
  }
  return { buf, rows, declared };
}

test("R46 the largest xlsx under xlsx.declared_text, read whole by xlsxEntry.text() in five runs pinned to one core beside three CPU burners, peaks at most 85 % of capFor(128)", async (t) => {
  const bound = boundOf("xlsx", "declared_text");
  const { buf, rows, declared } = await sheetUnder(bound);
  assert.ok(declared < bound && declared > 0.97 * bound, `${rows} rows declare ${declared} B against the bound ${bound} B`);
  const dir = mkdtempSync(join(tmpdir(), "r46-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, "sheet.xlsx");
  writeFileSync(file, buf);
  const child = join(HERE, "r46-read-child.mjs");
  const idle = JSON.parse((await run(process.execPath, ["--expose-gc", child, file, "--idle"])).stdout).idleHeapMB;
  const oldSpace = Math.ceil(idle) + R46_CAP;
  const burners = [0, 1, 2].map(() => spawn("taskset", ["-c", "0", process.execPath, "-e", "for(;;){}"], { stdio: "ignore" }));
  const runs = [];
  try {
    for (let i = 0; i < 5; i++) {
      const out = await run("taskset", ["-c", "0", process.execPath, "--expose-gc", `--max-old-space-size=${oldSpace}`, "--max-semi-space-size=2", child, file, "--read"], { maxBuffer: 1 << 26, timeout: 1_800_000 });
      runs.push(JSON.parse(out.stdout));
    }
  } finally {
    for (const b of burners) b.kill("SIGKILL");
  }
  const peaks = runs.map((r) => r.aboveStartMB);
  const peak = Math.max(...peaks);
  t.diagnostic(`${rows} rows, declared ${declared} B; old space ${oldSpace} MB (idle ${idle.toFixed(1)} + capFor(128) ${R46_CAP}); above start ${peaks.map((p) => p.toFixed(1)).join(", ")} MB; the margin ${(0.85 * R46_CAP).toFixed(1)} MB`);
  assert.ok(runs.every((r) => r.ok === true), "every run reads the sheet");
  assert.ok(peak <= 0.85 * R46_CAP, `peak ${peak.toFixed(1)} MB is ${(100 * peak / R46_CAP).toFixed(1)} % of capFor(128) ${R46_CAP} MB`);
});
