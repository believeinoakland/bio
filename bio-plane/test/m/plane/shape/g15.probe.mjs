/* G15 at the real reading path (K4426 (3); plan G15 (3)): a 1 MB CSV (about 20,000 rows) uploaded by the member's path and read by the real plane's
 * ledger through csv-reader, reading-pipeline's row blocks and extraction's index; its last row (LASTROWMARK) must be in `text_units`
 * (`capture_text_fts`) and found by the search op (`op=search` with `passage:`, the viewer a member of the town). Reports the units the sheet became
 * (the row-block cut): count, how many are cut, the longest, and the first and last unit's reference.
 *   node g15.probe.mjs [capMB ...]     extra caps after the real one (127) */
import { shapeRun, capFor, csvDoc, report } from "./harness.mjs";
const doc = csvDoc(1_048_576);
for (const cap of [capFor(1), ...process.argv.slice(2).map(Number).filter(Boolean)]) {
  const r = await shapeRun({ doc, search: ["LASTROWMARK"] }, { capMB: cap });
  console.log(report("G15 1 MB CSV", r));
  if (r.done) console.log(`  last unit: ${JSON.stringify(r.done.last)}`);
}
process.exit(0);
