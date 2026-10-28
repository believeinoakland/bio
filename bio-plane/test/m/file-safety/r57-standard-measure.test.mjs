/* file-safety R57, R21, R51, R56 (T53-510; R37, K5624): the readings hold at the beta's figures. `GRADE_READ_MAX` is `file_safety.grade_read`'s active
   figure (the row's `standard`, 100 MB, since the beta), so each file below is sized from the table at run time and no figure is pinned here. A file is
   held as a capture in a child process and read by one job (the grade, what opening would answer, the safe view); the memory it held above idle is
   printed beside the platform's headroom (`PLATFORM_FIGURES`), the measurement T53-510 asks to be reported for a figure the module cannot hold.
   The answers are asserted; the memory is not (no figure of a machine is a requirement, R-CLOCK's rule). Opt-in, because it writes files of about
   100 MB: FILE_SAFETY_MEASURE_STANDARD=1. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GRADE_READ_MAX } from "../../../src/file-safety/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { PLATFORM_FIGURES } from "../../../src/byte-ledger.mjs";
import { makeZip } from "../../make-zip.mjs";
import { pdf } from "./fixture.mjs";
import { genSheetXml, xlsxOf, MIB } from "./g44-fixtures.mjs";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const on = process.env.FILE_SAFETY_MEASURE_STANDARD === "1";
const headroom = Math.floor((PLATFORM_FIGURES.isolate_memory_bytes.value - PLATFORM_FIGURES.idle_bytes.value) / MIB);

const DOCX = (pad) => makeZip([
  { name: "[Content_Types].xml", data: '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>' },
  { name: "_rels/.rels", data: '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
  { name: "word/document.xml", data: '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>hello</w:t></w:r></w:p></w:body></w:document>' },
  { name: "word/media/pad.bin", data: new Uint8Array(pad), method: 0 }]);

async function measured(t, name, bytes, job) {
  const dir = mkdtempSync(join(tmpdir(), "fs-measure-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, name);
  writeFileSync(file, bytes);
  const out = JSON.parse((await run(process.execPath, ["--expose-gc", join(HERE, "measure-child.mjs"), file, name, job], { maxBuffer: 1 << 26 })).stdout);
  t.diagnostic(`${name} (${job}): ${out.size} B, held ${out.peak_above_idle_MiB.held} MiB above idle (heap ${out.peak_above_idle_MiB.heap}, backing ${out.peak_above_idle_MiB.external}), `
    + `the isolate's headroom ${headroom} MiB: ${out.peak_above_idle_MiB.held <= headroom ? "holds" : "DOES NOT HOLD"}`);
  return out.out;
}

test("R57 R56 R51 (T53-510): at GRADE_READ_MAX less a byte, a PDF and an office package are graded and answer what opening would, a spreadsheet inside its guards is drawn, and the memory each held is reported", { skip: !on && "FILE_SAFETY_MEASURE_STANDARD=1 to run" }, async (t) => {
  const big = new Uint8Array(GRADE_READ_MAX - 1).fill(66); big.set(pdf(false, "standard"), 0);
  const g = await measured(t, "pdf-at-the-bound.pdf", big, "grade");
  assert.equal(g.format, "pdf");
  const s = await measured(t, "pdf-at-the-bound.pdf", big, "state");
  assert.equal(typeof s.may_open, "boolean");
  const d = await measured(t, "docx-at-the-bound.docx", DOCX(GRADE_READ_MAX - 4 * MIB), "grade");
  assert.deepEqual([d.format, d.threat], ["docx", "low"]);
  /* T53-510 (K5704): above the bound a container is graded by its directory, read by ranges, up to the upload ceiling */
  const over = await measured(t, "docx-over-the-bound.docx", DOCX(GRADE_READ_MAX + 4 * MIB), "grade");
  assert.deepEqual([over.format, over.threat], ["docx", "low"]);
  const zip = await measured(t, "zip-over-the-bound.zip", makeZip([{ name: "a.bin", data: new Uint8Array(GRADE_READ_MAX + 4 * MIB), method: 0 }, { name: "b.txt", data: "hello" }]), "grade");
  assert.deepEqual([zip.format, zip.threat, zip.reasons], ["zip", "high", ["archive_not_opened"]]);
  const rows = 1_000_000;
  const csv = await measured(t, "csv-at-its-rows.csv", new TextEncoder().encode(Array.from({ length: rows }, (_, i) => `${i + 1},"label ${(i + 1) % 10007} of the row",${i + 1}.5`).join("\n") + "\n"), "view");
  assert.deepEqual([csv.ok, csv.kind], [true, "data"]);
  const x = await measured(t, "xlsx-inside-its-guard.xlsx", xlsxOf([{ name: "Big", xml: genSheetXml(boundOf("workbook", "cells_json_bytes") / 4).xml }]), "view");
  assert.deepEqual([x.ok, x.kind], [true, "data"]);
});
