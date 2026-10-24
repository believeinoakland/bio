/* plane R85 (proposed, fix round 6, G44; K4662, K4665), THE SHAPE PROOF OF THE TWO CALLERS: a workbook added as a workbook and a file previewed in the safe view are asked of the real door in a child
   under TEST-SUPPORT #9's value limit and the cap `capFor(N)` (the one cap convention, G123a) for a file of N MB (165 for the 1.44 MB workbook; `shape/g44.probe.mjs`), the file held, a project and a member set up. The 10 MiB-declared
   short-row workbook: the add is refused WORKBOOK_TOO_LARGE with its count and the bound, nothing written; the safe view answers within its bound with the first sheet's cut stated; the child lives in both.
   Controls: the 20,000-cell workbook is added, read, linted, its inputs read and previewed; a 60-sheet workbook states how many sheets it has; an ODS over file-safety's bound is refused with its size and
   bound; a 4 MB and a 17.7 MB CSV are previewed with the cut stated. Green on the merged WORKBOOKS and FILE-SAFETY (K4680). HEAVY: run alone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { runCase, CASES } from "./shape/g44.probe.mjs";
import { report } from "./shape/harness.mjs";

const WHAT = {
  add10: "the add of a short-row workbook past the 250,000-cell row is refused WORKBOOK_TOO_LARGE with its count and the bound, nothing written, the child alive (WORKBOOKS; K4945)",
  hold10: "the add of the 10 MiB-declared short-row workbook (221,529 cells, a 1.4 MB file) is held whole, the child alive (WORKBOOKS, G137e; K4945)",
  view10: "the safe view of the same workbook answers kind data within its bound, the first sheet's truncated, next_row and total_rows stated, the child alive (FILE-SAFETY)",
  small: "a workbook of about 20,000 cells is added, read, linted, its inputs read and previewed, the cut stated",
  sheets: "a 60-sheet workbook's safe view states the sheet total and what it shows (FILE-SAFETY)",
  ods: "an ODS of 25 MiB declared is refused a preview with its size and bound, never ok without cells (FILE-SAFETY)",
  odssmall: "an ODS inside file-safety's bound is previewed cut, the cut stated",
  big26: "a workbook of 26.2 MB declared is refused the add (WORKBOOK_FILE_TOO_LARGE with size and bound) and a preview (PREVIEW_NOT_DRAWN with size and bound)",
  csv4: "a 4 MB CSV's safe view is answered alive with the cut stated (FILE-SAFETY)",
  csv17: "a 17.7 MB CSV's safe view is answered alive with the cut stated (FILE-SAFETY)",
};
for (const name of Object.keys(CASES)) {
  test(`R85 G44: ${WHAT[name]}`, { timeout: 1_800_000 }, async () => {
    const out = await runCase(name);
    console.log(report(out.label, out.r));
    assert.deepEqual(out.failed, [], `${out.label} at cap ${out.cap} MB`);
  });
}
