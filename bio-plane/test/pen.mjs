/* pen.mjs — M0-182: A CONTROL DRIVER'S PRISTINE COPIES LIVE OUTSIDE THE WORKTREE, IN ONE SPELLING.
 *
 * THE DEFECT THIS MOVES. A negative-control driver copies the sources it is about to break into a PEN and
 * restores from it. Across this estate that pen was a directory inside the worktree (`.rec82-control-pristine/`,
 * `.m0107-harness/`) or a sibling of the source itself (`src/store.mjs.nc-rec119-arm3.pristine`), so the tree
 * is DIRTY for as long as the control runs. That is not cosmetic here:
 *   — since D-293 a gate on a dirty tree RECORDS NOTHING, so a control run beside a gate costs the gate;
 *   — repository-walking suites WALK the pen: REC-185's `.rec185/` moved the battery's assertion total
 *     19513 -> 19512 with no source change, and D-486's scratch clone was walked by `statepaths`, 36 files;
 *   — `gates.mjs` §2e reads the extra files as under-inclusion;
 *   — and a pen written BESIDE its source is UNDECLARED, so no `.gitignore` line covers it and an interrupted
 *     arm leaves an untracked copy of a source file where the next walk enrols it AS a source.
 *
 * THE RULINGS. BOB #32 (2026-09-24, `kickoffs/WORKER.md`) put a driver's pristine copies outside the worktree,
 * superseding "inside your own worktree". BOB #33 (17:12Z, M0-172) held that an in-worktree pen which is
 * DECLARED — gitignored and item-named — is a driver's own mechanism and stands; an UNDECLARED one does not.
 * This helper is the one spelling, so that the question "where does this driver's pen go" has one answer and
 * `scripts/pensweep.mjs` can grade the class by reading for it.
 *
 * WHAT IT DOES NOT DO, and why — THE PEN IS NEVER REMOVED ON EXIT. An interrupted arm's pristine copy is the
 * ONLY way back to the source it broke, and a driver that deleted it at exit would turn a crash into lost
 * work. So the pen is created, its path is PRINTED (an interrupted run leaves a locatable pen rather than an
 * invisible one), and the driver's own restore is what empties it. Under `test/sandbox.mjs` (D-186) the pen
 * lands inside the process's own $TMPDIR and goes with it; standalone it is left in the system temp root,
 * outside the worktree, where nothing walks it.
 *
 * NEGATIVE CONTROL: `test/pen-sweep.test.mjs` arm (p8) points a scratch driver's pen back into the worktree
 * and the sweep NAMES it DIRTY; arm (p9) hands this helper's own spelling and the driver reads TEMP.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/* The pen for ONE control driver, named for its ITEM so two drivers on one machine cannot collide and a
   leftover pen says whose it is. `mkdtempSync` gives the uniqueness — the scratchpad is NOT isolated between
   sessions (two workers reported that), and neither is the system temp root, so a fixed name would be an
   identity nobody owns, which is the shape of the `/tmp/final-battery.log` incident (WORKER.md). */
export function controlPen(item, { quiet = false } = {}) {
  const tag = String(item || "").trim().replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!tag) throw new Error("controlPen(item): the item is what makes the pen findable — name it");
  const dir = mkdtempSync(join(tmpdir(), `nc-${tag}-`));
  if (!quiet) console.log(`  PEN (M0-182) ${item}: ${dir} — outside the worktree; NOT removed at exit, so an interrupted arm can be restored from it`);
  return dir;
}
