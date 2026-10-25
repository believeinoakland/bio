/* store-assembly's copy of plane's test. plane G124f (fix round 9; S-9, P8; corpus R set, plan section 7 item 3; K4426 "Still MISSING" row 2): the heavy spreadsheet kinds at their ALPHA bounds, through plane's shape runner (the real plane in a
   child under the one cap convention and the platform's value limit), each file read to its end by the ledger. Every figure is read from `READ_BOUNDS` by `boundOf` (never a literal here); a case is a file whose
   figure is exactly `bound - 2`, `bound` or `bound + 1`, made by `shape/exact-gen.mjs` (the declared uncompressed text-part bytes of an XLSX's sheet or an ODS's content.xml, or the file's own bytes, to the byte).
     C03  bound - 2   read whole              C04  the bound   read whole              C05  bound + 1   REFUSED, stated with its size and its limit (the figures, not a sentence about a "region")
     C06  a 30,000,000 B XLSX of 1,048,576 rows (over the whole-read ceiling): refused with size and limit
     C07  1,048,576 rows x one narrow column, no row or cell references (the only way such a sheet stays under the declared-text bound): read whole, or refused with size and limit      C08  1,048,577 rows: the same
     C07r, C08r  the same rows WITH references: over the declared-text bound, refused with size and limit
     X05  a 33 MiB declared XLSX (the walker's 236,709-row file's size): refused with size and limit, never "undecodable" (S-8)
   The three bounds: an XLSX's declared text (`xlsx.declared_text`), an ODS's declared content.xml (`ods.content_xml`), and the entry's whole-read ceiling in file bytes (`pdf.bytes`, read by `wholeReadRow`).
   A refusal passes only with a numeric `size` equal to the file's figure and `bound` equal to the table's, and the member's sentence (the reading's `why`/`basis`) holding both figures and not the word "undecodable".
   Counts, never clocks (R-CLOCK). HEAVY: run alone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { shapeRun, capFor, report } from "./shape/harness.mjs";
import { exactFile } from "./shape/exact-gen.mjs";
import { whole, refused } from "./shape/reading-judge.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";

const MiB = 1048576;
const BOUNDS = {
  "xlsx declared text": { kind: "xlsx", bound: boundOf("xlsx", "declared_text"), figure: "declared" },
  "ods declared content.xml": { kind: "ods", bound: boundOf("ods", "content_xml"), figure: "declared" },
  "entry file bytes": { kind: "xlsx", bound: boundOf("pdf", "bytes"), figure: "file" },
};
async function read(rec) {
  const f = await exactFile(rec);
  const r = await shapeRun({ doc: { kind: "file", path: f.path, bytes: f.bytes, name: f.name, type: f.type, marks: [] }, maxTicks: 400, pageAll: false }, { capMB: capFor(Math.min(f.bytes, 2 * MiB) / MiB) });
  console.log(report(`${JSON.stringify(rec)} -> ${f.bytes} B file, ${f.rows} rows`, r));
  return { f, r };
}
for (const [name, { kind, bound, figure }] of Object.entries(BOUNDS)) {
  const rec = (n) => (figure === "declared" ? { kind, declared: n } : { kind, declared: 1_000_000, padTo: n });
  test(`G124f SHEET C03 ${name}: ${bound} - 2 is read whole`, { timeout: 1_800_000 }, async () => { const { r } = await read(rec(bound - 2)); whole(r, `C03 ${name}`); });
  test(`G124f SHEET C04 ${name}: the bound ${bound} itself is read whole`, { timeout: 1_800_000 }, async () => { const { r } = await read(rec(bound)); whole(r, `C04 ${name}`); });
  test(`G124f SHEET C05 ${name}: ${bound} + 1 is refused with its size and its limit`, { timeout: 1_800_000 }, async () => { const { r } = await read(rec(bound + 1)); refused(r, `C05 ${name}`, bound + 1, bound); });
}

test("G124f SHEET C06: a 30,000,000 B XLSX of 1,048,576 narrow rows is refused with its size and the entry's limit", { timeout: 1_800_000 }, async () => {
  const { f, r } = await read({ kind: "xlsx", declared: null, narrow: true, rows: 1_048_576, padTo: 30_000_000 });
  assert.equal(f.bytes, 30_000_000); assert.ok(f.bytes > boundOf("pdf", "bytes"), "the file is over the whole-read ceiling");
  refused(r, "C06", f.bytes, boundOf("pdf", "bytes"));
});

for (const [id, rows] of [["C07", 1_048_576], ["C08", 1_048_577]]) {
  test(`G124f SHEET ${id}: ${rows} rows x one narrow column (XLSX) is read whole or refused with its size and limit`, { timeout: 1_800_000 }, async () => {
    const { f, r } = await read({ kind: "xlsx", declared: null, narrow: true, rows });
    assert.equal(f.rows, rows);
    assert.equal(r.died, false, r.error || r.stderr);
    const g = r.reading; assert.ok(g, "no reading was made");
    if (g.refusal) refused(r, id, Number(g.refusal.size), Number(g.refusal.bound)); else whole(r, id);
    console.log(`${id}: ${g.refusal ? "REFUSED " + JSON.stringify(g.refusal) : "READ WHOLE, " + g.total + " characters"} (declared ${f.declared} B)`);
  });
}

/* the same ladder with the row and cell references every writer puts in (an XLSX of 1,048,576 rows is then over the declared-text bound at about 48 MB, so the heavy kind is refused for its bytes, with size and limit) */
for (const [id, rows] of [["C07r", 1_048_576], ["C08r", 1_048_577]]) {
  test(`G124f SHEET ${id}: ${rows} rows x one narrow column with references (XLSX) is refused with its declared size and the xlsx limit`, { timeout: 1_800_000 }, async () => {
    const { f, r } = await read({ kind: "xlsx", declared: null, narrow: "refs", rows });
    assert.equal(f.rows, rows);
    assert.ok(f.declared > boundOf("xlsx", "declared_text"), `the sheet declares ${f.declared} B, over the xlsx bound`);
    refused(r, id, f.declared, boundOf("xlsx", "declared_text"));
  });
}

/* PRODUCT FINDING F1 (corpus-1-T51.md): the smallest case of C07/C08. A workbook whose rows and cells carry no `r` attribute (optional in the format; test-support's `no-r` file) is read by the XLSX entry (`text()`: 2,000 cells) yet the
   reading is `none`, no unit, no statement: `formats-xlsx.mjs:764` advances `usedRows` only for a row with an integer `r`, so the sheet's used range is empty and no block is made. */
test("G124f finding F1: a 1,000-row workbook without row and cell references is read whole, never recorded as an empty reading", { timeout: 600_000 }, async () => {
  const { r } = await read({ kind: "xlsx", declared: null, narrow: true, rows: 1000 });
  whole(r, "F1");
  assert.ok(r.done.units > 0, "F1: the reading holds units");
});

test("G124f SHEET X05: a 33 MiB declared XLSX is refused with its size and limit, never worded 'undecodable' (S-8)", { timeout: 1_800_000 }, async () => {
  const declared = 33 * MiB, bound = boundOf("xlsx", "declared_text");
  assert.ok(declared > bound, "33 MiB is over the table's xlsx bound");
  const { r } = await read({ kind: "xlsx", declared });
  refused(r, "X05", declared, bound);
});
