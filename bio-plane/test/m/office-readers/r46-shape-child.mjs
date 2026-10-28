/* office-readers R46 (T53-541, K5648): the platform-shape memory case, sized from the active `xlsx.declared_text` figure. The
   plane's g41 probe runs a fixed 150,000-row workbook; this child runs the same harness (`shapeRun`, the probe's failures and cap)
   on a sheet that declares just under the active bound, its row count worked out here from the generator's own declared bytes.
   Run as its own process by r46-memory.test.mjs: its report is the one the probe prints, `cap N MB, child survived`, then `PASS`
   or `FAIL` with the cap. */
import { shapeRun, xlsxRowsDoc, report } from "../plane/shape/harness.mjs";
import { declaredSheetBytes, failures, g41Cap } from "../plane/shape/g41.probe.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";

const bound = boundOf("xlsx", "declared_text");
/* the generator's declared bytes per row, from a small sheet of the same shape */
const sample = await xlsxRowsDoc(1000);
const perRow = (await declaredSheetBytes(sample.recipe)) / 1000;
const rows = Math.floor((0.99 * bound) / perRow);
const doc = await xlsxRowsDoc(rows);
const declared = await declaredSheetBytes(doc.recipe);
if (!(declared < bound)) throw new Error(`the sheet declares ${declared} B, not under the bound ${bound} B`);

const cap = g41Cap(doc.bytes);
const r = await shapeRun({ doc, search: doc.marks, readingEachTick: true, cellsOf: true, maxTicks: 600 }, { capMB: cap });
const f = failures(r, doc.bytes);
console.log(report(`G41 ${rows}-row xlsx (declared ${declared} B, under the bound ${bound} B)`, r));
console.log(`  ${f.length ? "FAIL: " + f.join("; ") : "PASS"} (cap ${cap} MB)`);
process.exit(f.length ? 1 : 0);
