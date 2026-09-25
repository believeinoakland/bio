#!/usr/bin/env node
/* D-402's NEGATIVE CONTROL DRIVER — eight arms, M0-83's six, and an opening and closing baseline — over
 * `tools/retirable.mjs` and the suite that drives it, `bio-plane/test/retirable.test.mjs`.
 *
 *   node bio-plane/test/retirable.control.mjs        (from the repo root)
 *
 * COMMITTED so the next session re-runs it in ONE step instead of re-deriving how to break the
 * subject. Every arm is armed ALONE against a pristine copy kept in `.d402-harness/`, and every
 * restore is verified by sha256 AND `cmp` AND a floored byte count — `git checkout --` restores
 * to HEAD, which in a tree with uncommitted work is "throw mine away" and exits 0 either way
 * (CLAUDE.md, measured twice in two days).
 *
 * **NO ARM TOUCHES A SESSION, A REF, A WORKTREE OR A WORKING TREE.** The subject is driven
 * through the SUITE, whose arms build real repositories and real linked worktrees under
 * `os.tmpdir()`. The estate's sessions are never enumerated here and nothing is ever archived by
 * this driver. The one thing an arm perturbs is a source file.
 *
 * THE ARMS, each with what MUST fail and what MUST NOT, declared before arming:
 *
 *   A1  the task-run early return removed, so a    -> S1 FAILS. **This is the defect as it
 *       run-session is judged by the tree at its      actually occurred**: 14 run-sessions judged
 *       `cwd` (THE REAL DEFECT, RE-ARMED)             on the MAIN CHECKOUT they do not own.
 *   A2  `ownsWorktree` forced true                 -> S2 FAILS. The arm standing between a sweep
 *                                                     and `git worktree remove <main checkout>`.
 *   A3  the dirty-tree HOLD removed                -> S3 FAILS. Bob's clause is *their work
 *                                                     saved*, and uncommitted work is the half
 *                                                     no push can reach.
 *   A4  the unsaved-tip HOLD removed               -> S3 FAILS on the unpushed row. D-288's loss
 *                                                     shape, caused by D-402's own fix.
 *   A5  an unreadable status treated as clean      -> S4 FAILS. Concluding a value from an
 *                                                     absence with two causes, inside the safety
 *                                                     check itself.
 *   A6  the driving-lane protection removed        -> S5 FAILS. A live CONDUCT archived to
 *                                                     reclaim a worktree.
 *   A7  the idle threshold removed                 -> S6 FAILS. A session mid-task between turns
 *                                                     is not a corpse.
 *   A8  `saved` reduced to `onMain` only, dropping -> S3's OVER-STRICTNESS row FAILS and the HOLD
 *       the reachability walk (OVER-STRICTNESS)       rows do NOT. Work pushed under another
 *                                                     branch name reads as unsaved — D-399's
 *                                                     defect arriving one layer out, which is
 *                                                     exactly why this predicate REUSES
 *                                                     `strandedwork` rather than re-asking.
 *
 *   M0-83's six (BOB #23, 2026-09-21), each against section 9:
 *   A9  `laneOf` restored to the TRAILING-only regex -> "a SUFFIXED title is its lane's live holder"
 *                                                     FAILS: the holder is in no lane and its
 *                                                     predecessor is elected (BOB #19's defect).
 *   A10 the UNKNOWN-SELF refusal removed             -> "a --self FOUND in the input is REFUSED"
 *                                                     FAILS: a stranger is judged in the caller's
 *                                                     name (CONDUCT #8's, 2026-09-20).
 *   A11 the declared caller left out of the election -> "a DECLARED caller is its lane's newest"
 *                                                     FAILS: its predecessor is protected again.
 *   A12 the OUT-OF-SCOPE verdict removed             -> "names another repository's and a vanished
 *                                                     cwd OUT OF SCOPE" FAILS (BOB #21's 24 + 15).
 *   A13 scope by string PREFIX (OVER-STRICTNESS's    -> the SIBLING arm FAILS and the other-repository
 *       twin: the cheap defeat the row names)         arm does NOT — a prefix match passes it.
 *   A14 the election by ACTIVITY alone               -> "ORDERED by instance number" FAILS: a
 *                                                     predecessor that acted last is elected.
 *
 * **ONE ARM HAD TO BE RE-AIMED AFTER ITS FIRST RUN, AND THE REASON IS THE POINT OF THE DRIVER.**
 * A5 was written against S4's VERDICT assertion and could not fail: disabling the `unreadable`
 * check lets the row fall through into the `saved === null` branch and it is HOLD either way.
 * **A safety check was removed and every verdict stayed correct** — the redundancy is genuine and
 * is kept, but an assertion that cannot distinguish the check from its backstop is an assertion
 * that proves nothing. A5 now targets the REASON, which is what actually degrades and what a
 * human acts on. `hits === 1` said the patch applied; only re-aiming the assertion showed it had
 * an effect.
 *
 * MUST NOT fail in any arm: S7 (the summary separates HOLD from PROTECTED) is downstream of
 * nothing and an arm that takes it down has perturbed a second variable — the
 * arm-that-fired-at-the-wrong-thing class (CLAUDE.md).
 *
 * **AND THE LESSON THIS DRIVER WAS BUILT KNOWING, from `strandedwork.control.mjs` the same day:
 * A CONTROL ARM IS COUPLED TO WHERE THE BEHAVIOUR LIVES.** A correct refactor that moves a check
 * silently disarms the arm pointed at its old home, and the arm goes on matching once and
 * printing `the arm ARMED` over a green assertion. So every arm below asserts its downstream
 * failure, never merely its patch count — `hits === 1` proves a patch APPLIED and only the
 * assertion proves it had an EFFECT.
 */
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ANCHOR_DRY, anchorTable } from "../scripts/anchortable.mjs";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PEN = join(REPO, ".d402-harness");
const PRED = join(REPO, "tools/retirable.mjs");
const SUITE = join(REPO, "bio-plane/test/retirable.test.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

if (!ANCHOR_DRY) mkdirSync(PEN, { recursive: true });   /* M0-197: no pen under tools/anchordrift.mjs's dry read */
const copy = join(PEN, "pristine.retirable");
if (!ANCHOR_DRY) writeFileSync(copy, readFileSync(PRED));
const PRISTINE = { sha: sha(PRED), bytes: statSync(PRED).size };
const MIN_BYTES = 6000;
console.log(`  pristine predicate: ${PRISTINE.bytes} bytes, sha256 ${PRISTINE.sha.slice(0, 8)}…`);

function restore() {
  writeFileSync(PRED, readFileSync(copy));
  const got = sha(PRED), size = statSync(PRED).size;
  const cmp = spawnSync("cmp", ["-s", PRED, copy]).status === 0;
  const ok = got === PRISTINE.sha && cmp && size === PRISTINE.bytes && size >= MIN_BYTES;
  console.log(`  restored tools/retirable.mjs: ${size} bytes, sha256 ${got.slice(0, 8)}…, `
    + `cmp ${cmp ? "identical" : "DIFFERS"} — byte-identical: ${ok ? "YES" : "NO"}`);
  return ok;
}
/* An arm that did not arm is a finding, so every patch reports its own match count. */
function armPatch(from, to) {
  const before = readFileSync(PRED, "utf8");
  const hits = before.split(from).length - 1;
  if (hits === 1) writeFileSync(PRED, before.replace(from, to));
  return hits;
}
const suiteRun = () => {
  if (ANCHOR_DRY) return { out: "", pass: -1, fail: -1, reachedFoot: false, status: null, failed: [] };   /* M0-197 */
  const r = spawnSync(process.execPath, [SUITE], { cwd: REPO, encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tally = out.match(/retirable: (\d+) pass, (\d+) fail/);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]);
  return { out, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1,
           reachedFoot: !!tally, status: r.status, failed };
};
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
/* The arm that must survive every arm. A refutation that also takes it down has moved a second
   variable, and its confidence is the signature of `cannot reproduce`. */
const collateral = (s) => broke(s, "three verdicts, counted separately");

/* --------------------------------------------------------------- BASELINE */
console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = suiteRun();
  t("baseline · the suite reached its own FOOT", s.reachedFoot, true);
  t("baseline · the suite is GREEN", [s.pass > 30, s.fail, s.status], [true, 0, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
}

const ARMS = [
  { id: "A1", title: "the task-run early return REMOVED — a run-session judged by the tree at a "
                   + "`cwd` it does not own (THE REAL DEFECT, RE-ARMED)",
    from: `    if (isTaskRun(s))
      return verdict("RETIRABLE", "scheduled-task run-session, not running — owns no worktree and "
        + "carries nothing forward", { ownsWorktree: false });`,
    to: `    if (false)
      return verdict("RETIRABLE", "scheduled-task run-session, not running — owns no worktree and "
        + "carries nothing forward", { ownsWorktree: false });`,
    mustBreak: "a task run is RETIRABLE" },

  { id: "A2", title: "`ownsWorktree` forced TRUE — the guard between a sweep and removing the "
                   + "MAIN CHECKOUT",
    from: `  return { head, dirty, saved, onMain, carrier, unreadable: false, isPrimary,
           ownsWorktree: !isPrimary };`,
    to: `  return { head, dirty, saved, onMain, carrier, unreadable: false, isPrimary,
           ownsWorktree: true };`,
    mustBreak: "and is NOT owned" },

  { id: "A3", title: "the DIRTY-tree HOLD removed — uncommitted work is the half no push reaches",
    from: `    if (tree.dirty > 0)`,
    to: `    if (false)`,
    mustBreak: "a DIRTY tree is HOLD" },

  { id: "A4", title: "the UNSAVED-TIP HOLD removed — D-288's loss shape caused by D-402's own fix",
    from: `    if (!tree.saved)`,
    to: `    if (false)`,
    mustBreak: "an UNPUSHED tip is HOLD" },

  { id: "A5", title: "an UNREADABLE status treated as clean — an absence with two causes, inside "
                   + "the safety check",
    from: `    if (tree.unreadable)`,
    to: `    if (false)`,
    /* THE ARM'S TARGET IS THE REASON, NOT THE VERDICT, AND FINDING THAT OUT IS WHY THIS DRIVER
       EXISTS. Aimed at the verdict it CANNOT FAIL: with the `unreadable` check disabled a row
       falls through `dirty > 0` (null is not > 0) into `saved === null` and is HOLD anyway — so
       the verdict assertion stayed green over a removed safety check. **The redundancy is real
       and worth keeping; an assertion that cannot tell it from the check it stands in for is
       not.** What actually degrades is what the human is TOLD: *could not resolve origin/main*
       instead of *status unreadable*, which points at the wrong cause. Caught by RUNNING the
       control, never by reading the arm — the same lesson `strandedwork.control.mjs` learned
       hours earlier, arriving through a different door. */
    mustBreak: "and says unknown is not clean",
    mustNotBreak: ["an UNREADABLE status is HOLD"] },

  { id: "A6", title: "the STANDING-LANE protection removed — a live CONDUCT archived for disk",
    from: `    if (STANDING_LANES.includes(lane) && !isTaskRun(s) && newest && newest.id === s.sessionId)`,
    to: `    if (false)`,
    mustBreak: "the NEWEST CONDUCT is PROTECTED even at 9h idle" },

  { id: "A6b", title: "DIST and FLEET dropped from the standing lanes — the 2026-09-16 archive of both, reproduced",
    from: `export const STANDING_LANES = ["CONDUCT", "BOB", "DIST", "FLEET", "SCHEDULER"];`,
    to: `export const STANDING_LANES = ["CONDUCT", "BOB"];`,
    mustBreak: "the NEWEST DIST is PROTECTED even at 72h idle" },

  { id: "A7", title: "the IDLE THRESHOLD removed — a session mid-task between turns is not a corpse",
    from: `    if (idleH < idleHours)`,
    to: `    if (false)`,
    mustBreak: "a session idle UNDER the threshold is protected" },

  { id: "A8", title: "`saved` reduced to onMain only, dropping the reachability walk "
                   + "(OVER-STRICTNESS — D-399 one layer out)",
    from: `  const saved = onMain === null ? null : (onMain || !!carrier);`,
    to: `  const saved = onMain === null ? null : onMain;`,
    mustBreak: "work pushed under ANOTHER branch name is SAVED, so the session is RETIRABLE",
    mustNotBreak: ["a DIRTY tree is HOLD", "an UNPUSHED tip is HOLD"] },

  { id: "A9", title: "`laneOf` restored to the TRAILING-only regex — BOB #19's suffixed holder, in no lane",
    from: `export const laneOf = (s) => { const m = LANE_TITLE.exec(s.title || ""); return m ? m[1] : (s.title || "").trim(); };`,
    to: `export const laneOf = (s) => (s.title || "").replace(/\\s*#\\d+\\s*$/, "").trim();`,
    mustBreak: "a SUFFIXED title is its lane's live holder",
    mustNotBreak: ["a --self FOUND in the input is REFUSED"] },

  { id: "A10", title: "the UNKNOWN-SELF refusal removed — CONDUCT #8's stranger, protected in its name",
    from: `  if (found) throw new UnknownSelf(selfId, found.title || "");`,
    to: `  if (false) throw new UnknownSelf(selfId, found.title || "");`,
    mustBreak: "a --self FOUND in the input is REFUSED, by name",
    mustNotBreak: ["a SUFFIXED title is its lane's live holder"] },

  { id: "A11", title: "the DECLARED caller left out of its lane's election — its predecessor protected again",
    from: `  if (selfTitle) {
    const lane = laneOf({ title: selfTitle });
    const n = instanceOf({ title: selfTitle });`,
    to: `  if (false) {
    const lane = laneOf({ title: selfTitle });
    const n = instanceOf({ title: selfTitle });`,
    mustBreak: "a DECLARED caller is its lane's newest",
    mustNotBreak: ["UNDECLARED, the caller's predecessor is taken for the lane's holder"] },

  { id: "A12", title: "the OUT-OF-SCOPE verdict removed — BOB #21's other repositories, judged here",
    from: `    if (place === "out")`,
    to: `    if (false)`,
    mustBreak: "names another repository's and a vanished cwd OUT OF SCOPE" },

  { id: "A13", title: "scope by string PREFIX — the cheap defeat M0-83 names (OVER-STRICTNESS's twin)",
    from: `  return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(".." + sep));`,
    to: `  return String(p).startsWith(String(root));`,
    mustBreak: "a SIBLING directory sharing the repository's path as a PREFIX is out of scope",
    mustNotBreak: ["names another repository's and a vanished cwd OUT OF SCOPE"] },

  { id: "A14", title: "the election by ACTIVITY alone — a predecessor that acted last, elected",
    from: `  const outranks = (a, b) => (a[0] !== b[0] ? a[0] > b[0] : a[1] > b[1]);`,
    to: `  const outranks = (a, b) => a[1] > b[1];`,
    mustBreak: "the lane is ORDERED by instance number, not by who acted last" },
];
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.map((a) => ({ arm: a.id, file: PRED, find: a.from, put: a.to })));

for (const a of ARMS) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  const hits = armPatch(a.from, a.to);
  t(`${a.id} · the arm ARMED (patch matched exactly once)`, hits, 1);
  const s = suiteRun();
  t(`${a.id} · the suite FAILS at "${a.mustBreak.slice(0, 52)}…"`, broke(s, a.mustBreak), true);
  t(`${a.id} · ...and the suite survived to report it`, s.reachedFoot, true);
  t(`${a.id} · ...and the failure is not collateral`, collateral(s), false);
  for (const nb of a.mustNotBreak || [])
    t(`${a.id} · ...and "${nb.slice(0, 42)}…" does NOT fail, so this arm is isolated`, broke(s, nb), false);
  t(`${a.id} · RESTORED byte-identically`, restore(), true);
}

/* --------------------------------------------------------------- CLOSING BASELINE */
console.log("\n--- ARM BASELINE (closing) · every arm restored ---");
{
  const s = suiteRun();
  t("closing · the suite is GREEN again, so no arm leaked", [s.fail, s.status], [0, 0]);
  console.log(`  closing suite: ${s.pass} pass, ${s.fail} fail`);
}

console.log(`\nretirable.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
