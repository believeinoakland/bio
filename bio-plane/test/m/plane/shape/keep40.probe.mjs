/* 2a-5 at the platform's shape (K4426 (4); plan section 2a E3 40 MB; diagnosis-R6-2a t3): a 40,014,922 B upload (5 parts of 8 MiB, the walker's
 * size), uploaded by the member's path through the real plane (`uploadCapture` with the door's bound spent, so the whole is owed, not made in
 * the request: `keep_pending`), then the ledger's `keep` (record-core `putFromParts`, one part in memory at a time) and the `reading` it enters
 * in the same tick, which a file over `WHOLE_READ_MAX` (24 MiB) states from its size and never loads. The object holds one 8 MiB part at a
 * time, so the cap is 128 less two parts (112); the stand-in bucket's own bytes are R2's and are not counted (harness.mjs).
 *   node keep40.probe.mjs [capMB ...]     extra caps after 112, e.g. 90 60 */
import { shapeRun, capFor, textDoc, report } from "./harness.mjs";
for (const cap of [capFor(16), ...process.argv.slice(2).map(Number).filter(Boolean)])
  console.log(report("2a-5 40 MB keep", await shapeRun({ doc: textDoc(40_014_922), keepLater: "ledger", search: ["ENDMARKER"] }, { capMB: cap })));
process.exit(0);
