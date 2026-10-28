/* office-readers R46 (T53-541, K5648): the platform-shape memory case, sized from the active `xlsx.declared_text` figure. The
   plane's g41 probe runs a fixed 150,000-row workbook; this child runs the same harness (`shapeRun`, the probe's failures and cap)
   on a sheet that declares just under the active bound, its row count worked out here from the generator's own declared bytes.
   Run as its own process by r46-memory.test.mjs: its report is the one the probe prints, `cap N MB, child survived`, then `PASS`
   or `FAIL` with the cap. */
import { shapeRun, xlsxRowsDoc, report } from "../plane/shape/harness.mjs";
import { declaredSheetBytes, failures, g41Cap } from "../plane/shape/g41.probe.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";

const bound = boundOf("xlsx", "declared_text");
/* the generator's declared bytes per row, from two small sheets of the same shape (the fixed part of the sheet cancels) */
const a = 1000, b = 2000;
const da = await declaredSheetBytes((await xlsxRowsDoc(a)).recipe), db = await declaredSheetBytes((await xlsxRowsDoc(b)).recipe);
const perRow = (db - da) / (b - a);
let rows = Math.floor((0.99 * bound - (da - a * perRow)) / perRow);
/* the declared size of the candidate is the generator's own; correct the estimate until the sheet is just under the bound */
let doc, declared;
for (let i = 0; i < 4; i++) {
  doc = await xlsxRowsDoc(rows);
  declared = await declaredSheetBytes(doc.recipe);
  if (declared < bound && declared > 0.97 * bound) break;
  rows = Math.floor(rows * (0.985 * bound) / declared);
}
if (!(declared < bound)) throw new Error(`the sheet declares ${declared} B, not under the bound ${bound} B`);

const cap = g41Cap(doc.bytes);
const r = await shapeRun({ doc, search: doc.marks, readingEachTick: true, cellsOf: true, maxTicks: 600 }, { capMB: cap });
const f = failures(r, doc.bytes);
console.log(report(`G41 ${rows}-row xlsx (declared ${declared} B, under the bound ${bound} B)`, r));
console.log(`  ${f.length ? "FAIL: " + f.join("; ") : "PASS"} (cap ${cap} MB)`);
process.exit(f.length ? 1 : 0);
