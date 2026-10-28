/* file-safety R57, R21 (fix round 9, G124; K4835 (1)): no numeric literal in this module's code is a read ceiling it keeps; each is read from
   READ_BOUNDS. At the module's interface (its exports) and over its source (R57 asks for the reading of `src`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import * as FS from "../../../src/file-safety/index.mjs";
import { READ_BOUNDS, boundOf } from "../../../src/read-bounds.mjs";

const SRC = new URL("../../../src/file-safety/", import.meta.url);

test("R57 R21: GRADE_READ_MAX and SAFE_VIEW_ODS_DECLARED_MAX are the table's active figures, and the table names both rows", () => {
  assert.equal(FS.GRADE_READ_MAX, boundOf("file_safety", "grade_read"));
  assert.equal(FS.SAFE_VIEW_ODS_DECLARED_MAX, boundOf("file_safety", "ods_declared"));
  /* T53-510: each is a row of the table whose active column is read, never a figure pinned here (the alpha column keeps today's, the standard the beta's) */
  for (const name of ["grade_read", "ods_declared"]) {
    const row = READ_BOUNDS.file_safety[name];
    assert.ok([row.standard, row.alpha].includes(boundOf("file_safety", name)), name);
    assert.ok(Number.isInteger(row.alpha) && row.alpha > 0 && row.standard >= row.alpha, name);
  }
  assert.equal(FS.SCANNER_CALL_BOUND_MS, 8_000);
});

test("R57: this module's source holds no numeric literal that is a read ceiling: none of the byte figures of the table (an expression of MiB, 1024 products, or the figure written out) is written in a file of it", () => {
  const ceilings = new Set();
  for (const kind of Object.values(READ_BOUNDS)) for (const row of Object.values(kind)) for (const n of [row.standard, row.alpha, row.protective]) if (n >= 1_000_000) ceilings.add(n);
  const files = readdirSync(SRC).filter((f) => f.endsWith(".mjs")).sort();
  assert.ok(files.length >= 8);
  for (const f of files) {
    const code = readFileSync(new URL(f, SRC), "utf8").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
    assert.doesNotMatch(code, /\b\d+\s*\*\s*1024\s*\*\s*1024\b/, `${f}: a MiB product`);
    assert.doesNotMatch(code, /\b1024\s*\*\s*1024\b/, `${f}: a MiB product`);
    assert.doesNotMatch(code, /\b\d+\s*\*\s*MiB\b/i, `${f}: a MiB product`);
    for (const m of code.matchAll(/\b\d[\d_]*\b/g)) {
      const n = Number(m[0].replace(/_/g, ""));
      assert.ok(!ceilings.has(n), `${f}: ${m[0]} is a ceiling of the table`);
    }
    if (f === "index.mjs" || f === "formats.mjs") assert.match(code, /boundOf\(/, `${f}: quotes the table`);
  }
});
