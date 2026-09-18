/* retirable — Bob's ruling of 2026-09-17 driven: *"Sessions must be cleanly retired, their work
 * saved, resources released, and the session archived every time."*
 *
 * WHAT THIS SUITE IS DEFENDING AGAINST, stated before the arms, because the cheapest way to make
 * a retirement sweep green is to retire NOTHING and the second cheapest is to retire EVERYTHING.
 * Both are catastrophic in opposite directions and both look like a passing suite:
 *
 *   - RETIRE NOTHING: the population keeps growing (14 task runs at 3/hour, an area session
 *     holding 635 MB for 21 hours) and every arm asserting "X was not retired" stays green.
 *     **So every safety arm asserts a RETIRABLE row in the same run** — a sweep that named
 *     nothing would fail the over-strictness arms immediately.
 *   - RETIRE EVERYTHING: the integrator is archived to reclaim disk, or a session holding
 *     unpushed work is archived and the work is gone — D-288's loss shape, caused by the fix
 *     for D-402. **So the HOLD arms drive real dirty and real unpushed trees.**
 *
 * WHY REAL GIT REPOSITORIES. The predicate's whole job is to answer *is this work saved*, which
 * is defined by what git considers reachable and changed. A fixture that hand-writes the verdict
 * agrees with the predicate for free — an equality that costs nothing to produce is not evidence
 * (CLAUDE.md), and this estate has measured that five times on five subjects. Scratch repos live
 * under `os.tmpdir()`, never inside the estate.
 *
 * THE DEFECT THIS SUITE WAS WRITTEN AFTER, kept because it is why arm 1 exists: the first
 * version of the predicate judged a task run by READING THE TREE AT ITS `cwd` — which is the
 * MAIN CHECKOUT, a directory it does not own. Fourteen run-sessions came back judged on somebody
 * else's working directory, protected by an idle threshold that should never have applied, and a
 * sweep acting on it would have tried to remove the main checkout. Found by DRIVING the
 * predicate on the real estate, not by reading it. It is the wrong-unit class — the fourth
 * instance on 2026-09-17.
 *
 * NEGATIVE CONTROL: (all eight RUN 2026-09-17 by BOB #13, exit 0, 46 pass / 0 fail, both
 * baselines green) `node bio-plane/test/retirable.control.mjs` from the repo root — eight arms,
 * each armed ALONE against a pristine copy in `.d402-harness/`, every restore verified by
 * sha256 AND `cmp` AND a floored byte count.
 *   (A1) the task-run early return removed, so a run-session is judged by the tree at a `cwd` it
 *        does not own -> S1 fails. THE REAL DEFECT, RE-ARMED: 14 run-sessions judged on the main
 *        checkout, protected by an idle threshold that should never have applied.
 *   (A2) `ownsWorktree` forced true -> S2 fails: the guard between a sweep and `git worktree
 *        remove <the main checkout>`.
 *   (A3) the dirty-tree HOLD removed -> S3 fails. Bob's clause is *their work saved*.
 *   (A4) the unsaved-tip HOLD removed -> S3 fails on the unpushed row: D-288's loss shape,
 *        caused by D-402's own fix.
 *   (A5) an unreadable status treated as clean -> S4 fails ON ITS REASON. **Re-aimed after its
 *        first run: against the VERDICT it could not fail**, because the row falls through into
 *        the `saved === null` branch and is HOLD either way. A safety check was removed and every
 *        verdict stayed correct; what degrades is what the human is told.
 *   (A6) the driving-lane protection removed -> S5 fails: a live CONDUCT archived to reclaim disk.
 *   (A7) the idle threshold removed -> S6 fails: a session mid-task between turns is not a corpse.
 *   (A8) OVER-STRICTNESS — `saved` reduced to `onMain` only, dropping the reachability walk ->
 *        S3's carried-under-another-name row fails and the HOLD rows do NOT. D-399's defect one
 *        layer out, and the reason this predicate REUSES `strandedwork` rather than re-asking.
 */

import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, existsSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { classify, summarise, treeState, laneOf, isTaskRun, STANDING_LANES,
         DEFAULT_IDLE_HOURS } from "../../tools/retirable.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 7;
let reached = 0;
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "retirable-"));
const g = (repo, ...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
let n = 0;

/* A working repo with a bare "origin", wired as a real clone: origin/main is a FETCHED tracking
   ref, because the predicate resolves it and a local alias would let it pass on a shape the
   estate does not have. */
function scratch() {
  const id = `s${++n}`;
  const bare = join(SANDBOX, `${id}.git`), work = join(SANDBOX, id);
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", bare]);
  execFileSync("git", ["init", "-q", "-b", "main", work]);
  for (const [k, v] of [["user.name", "d402"], ["user.email", "d402@example.invalid"],
                        ["commit.gpgsign", "false"]]) g(work, "config", k, v);
  g(work, "remote", "add", "origin", bare);
  writeFileSync(join(work, "base.md"), "base\n");
  g(work, "add", "-A"); g(work, "commit", "-q", "-m", "base");
  g(work, "push", "-q", "origin", "main");
  g(work, "fetch", "-q", "origin");
  return { work, bare, id };
}
function linked(root, name, { commits = 0, push = null, dirty = 0 } = {}) {
  const path = join(SANDBOX, `${name}-wt`);
  g(root, "worktree", "add", "-q", "-b", name, path, "main");
  for (let i = 0; i < commits; i++) {
    writeFileSync(join(path, `c${i}.md`), `c${i}\n`);
    g(path, "add", "-A"); g(path, "commit", "-q", "-m", `${name} ${i}`);
  }
  if (push) { g(path, "push", "-q", "origin", `HEAD:${push}`); g(root, "fetch", "-q", "origin"); }
  for (let i = 0; i < dirty; i++) writeFileSync(join(path, `d${i}.md`), `dirty ${i}\n`);
  return path;
}
const HOUR = 3_600_000;
const NOW = Date.parse("2026-09-17T18:00:00Z");
const ago = (h) => new Date(NOW - h * HOUR).toISOString();
const S = (o) => ({ isArchived: false, isRunning: false, lastActivityAt: ago(24), ...o });
const verdictOf = (rows, id) => (rows.find((r) => r.sessionId === id) || {}).verdict;
const reasonOf = (rows, id) => (rows.find((r) => r.sessionId === id) || {}).reason || "";
const run = (sessions, opts = {}) =>
  classify(sessions, { now: NOW, repo: opts.repo || REPO, ...opts });

/* ========================================================================== */
section("1 — A TASK RUN OWNS NO WORKTREE, AND ITS `cwd` IS SOMEBODY ELSE'S. The defect this "
      + "suite was written after: 14 run-sessions judged on the MAIN CHECKOUT.");
{
  const { work } = scratch();
  /* Its cwd is a REAL repository — the shape that broke the first version. The predicate must
     not read it, because the session does not own it. */
  const rows = run([
    S({ sessionId: "hb1", title: "CONDUCT heartbeat — keep the BIO integrator from going idle",
        cwd: work, lastActivityAt: ago(0.2) }),
  ], { repo: work });
  t("a task run is RETIRABLE", verdictOf(rows, "hb1"), "RETIRABLE");
  t("...even though it has been idle only 0.2h, far under the threshold",
    reasonOf(rows, "hb1").includes("threshold"), false);
  t("...and it is marked as owning NO worktree, so a sweep cannot remove the tree it sat in",
    rows.find((r) => r.sessionId === "hb1").ownsWorktree, false);
  t("...and the reason says what it is rather than merely that it passed",
    /owns no worktree and carries nothing forward/.test(reasonOf(rows, "hb1")), true);
  /* The classifier's own helpers, pinned so a rename cannot silently widen the population. */
  t("isTaskRun keys on the title", [isTaskRun({ title: "CONDUCT heartbeat — x" }),
                                    isTaskRun({ title: "CONDUCT #2" })], [true, false]);
  t("a RUNNING task run is still protected", verdictOf(run([
    S({ sessionId: "hb2", title: "CONDUCT heartbeat", cwd: work, isRunning: true })], { repo: work }),
    "hb2"), "PROTECTED");
}

/* ========================================================================== */
section("2 — THE MAIN CHECKOUT IS NEVER 'OWNED'. A sweep that removed it would take every "
      + "worktree with it, and git's own primary-worktree test is what answers this.");
{
  const { work } = scratch();
  const wt = linked(work, "linked-a");
  const primary = treeState(work, { repo: work });
  const secondary = treeState(wt, { repo: work });
  t("the primary worktree is identified as primary", primary.isPrimary, true);
  t("...and is NOT owned", primary.ownsWorktree, false);
  t("a linked worktree is NOT primary", secondary.isPrimary, false);
  t("...and IS owned, so it is the thing a sweep may remove", secondary.ownsWorktree, true);
  /* An ordinary session sitting in the main checkout is still retirable — the SESSION goes, the
     TREE stays — and the reason must say so, because that distinction is where damage lives. */
  const rows = run([S({ sessionId: "amb", title: "CLAUDE.md and environment setup", cwd: work })],
                   { repo: work });
  t("a session in the main checkout is RETIRABLE", verdictOf(rows, "amb"), "RETIRABLE");
  t("...and its reason WARNS not to remove that tree",
    /MAIN CHECKOUT — archive it, never remove that tree/.test(reasonOf(rows, "amb")), true);
}

/* ========================================================================== */
section("3 — WORK NOT SAVED IS *HOLD*, NEVER RETIRABLE. Bob's clause is 'their work saved', and "
      + "this is the arm that stops the D-402 fix from causing D-288's loss.");
{
  const { work } = scratch();
  const dirtyWt = linked(work, "wt-dirty", { commits: 1, push: "wt-dirty", dirty: 3 });
  const unpushedWt = linked(work, "wt-unpushed", { commits: 2 });

  const rows = run([
    S({ sessionId: "d", title: "CONTENT-PDF", cwd: dirtyWt }),
    S({ sessionId: "u", title: "CAPTURE", cwd: unpushedWt }),
  ], { repo: work });

  t("a DIRTY tree is HOLD", verdictOf(rows, "d"), "HOLD");
  t("...naming the count, because a number is actionable and a verdict is not",
    /3 uncommitted change\(s\)/.test(reasonOf(rows, "d")), true);
  t("...and saying no push can reach them", /no push can reach them/.test(reasonOf(rows, "d")), true);
  t("an UNPUSHED tip is HOLD", verdictOf(rows, "u"), "HOLD");
  t("...named as committed here and nowhere else", /on NO remote ref/.test(reasonOf(rows, "u")), true);
  t("neither is RETIRABLE", summarise(rows).counts.retirable, 0);

  /* THE OVER-STRICTNESS TWIN, in the same run: pushed under a DIFFERENT branch name is SAVED.
     Reusing strandedwork's reachability walk is what makes this right, and an implementation
     that asked by branch name would fail here exactly as D-399 did. */
  const carried = linked(work, "wt-carried", { commits: 2, push: "some-other-name" });
  const rows2 = run([S({ sessionId: "c", title: "CAPTURE", cwd: carried })], { repo: work });
  t("work pushed under ANOTHER branch name is SAVED, so the session is RETIRABLE",
    verdictOf(rows2, "c"), "RETIRABLE");
  t("...and the carrier is NAMED, so the verdict is a finding and not a shrug",
    /carried by origin\/some-other-name/.test(reasonOf(rows2, "c")), true);
}

/* ========================================================================== */
section("4 — AN UNREADABLE TREE IS 'HOLD', NOT 'CLEAN'. Concluding a value from an absence with "
      + "two causes, inside the safety check itself.");
{
  const { work } = scratch();
  const rows = run([S({ sessionId: "gone", title: "CONTENT-PDF", cwd: join(SANDBOX, "does-not-exist") })],
                   { repo: work });
  /* A path that does not exist holds nothing — that is a real absence, not an unknown one. */
  t("a cwd that does not exist holds nothing and is RETIRABLE", verdictOf(rows, "gone"), "RETIRABLE");

  /* A path that EXISTS but whose status cannot be read is the dangerous one. */
  const rows2 = classify([S({ sessionId: "unread", title: "CONTENT-PDF", cwd: work })],
    { now: NOW, repo: work, remoteMap: new Map(),
      treeReader: () => ({ head: "deadbeef", dirty: null, saved: null, unreadable: true,
                           isPrimary: false, ownsWorktree: true }) });
  t("an UNREADABLE status is HOLD", verdictOf(rows2, "unread"), "HOLD");
  t("...and says unknown is not clean", /could NOT BE READ — unknown is not clean/.test(reasonOf(rows2, "unread")), true);

  const rows3 = classify([S({ sessionId: "nomain", title: "CONTENT-PDF", cwd: work })],
    { now: NOW, repo: work, remoteMap: new Map(),
      treeReader: () => ({ head: "deadbeef", dirty: 0, saved: null, unreadable: false,
                           isPrimary: false, ownsWorktree: true }) });
  t("an unresolvable origin/main leaves 'saved' UNDETERMINED and holds", verdictOf(rows3, "nomain"), "HOLD");
  t("...stated as undetermined rather than decided", /UNDETERMINED/.test(reasonOf(rows3, "nomain")), true);
}

/* ========================================================================== */
section("5 — THE STANDING LANES. Retiring a live CONDUCT to reclaim disk would trade the estate's "
      + "throughput for a worktree, by a robot, with nobody watching.");
{
  const { work } = scratch();
  const wt = linked(work, "wt-lane");
  const sessions = [
    S({ sessionId: "c-old", title: "CONDUCT #1", cwd: wt, lastActivityAt: ago(30) }),
    S({ sessionId: "c-new", title: "CONDUCT #2", cwd: work, lastActivityAt: ago(9) }),
    S({ sessionId: "b-new", title: "BOB #13", cwd: work, lastActivityAt: ago(48) }),
  ];
  const rows = run(sessions, { repo: work });
  t("the NEWEST CONDUCT is PROTECTED even at 9h idle", verdictOf(rows, "c-new"), "PROTECTED");
  t("...for the stated reason, not incidentally",
    /live holder of the CONDUCT lane/.test(reasonOf(rows, "c-new")), true);
  t("the NEWEST BOB is PROTECTED even at 48h idle", verdictOf(rows, "b-new"), "PROTECTED");
  t("but a PREDECESSOR in a driving lane IS retirable", verdictOf(rows, "c-old"), "RETIRABLE");
  t("...which is the over-strictness half: protecting the lane must not protect its corpses",
    summarise(rows).counts.retirable, 1);
  /* CORRECTED 2026-09-18 (Bob's ruling): DIST and FLEET are standing lanes too. This asserted
     ["CONDUCT", "BOB"], and the fixtures in sections 3, 4, 6 and 7 used "DIST" as their example of an
     ORDINARY area session — which is exactly the treatment that archived the only DIST and FLEET
     sessions with a question unanswered. Those fixtures now use CONTENT-PDF / CONTENT-HTML. */
  t("the standing lanes are declared once", STANDING_LANES, ["CONDUCT", "BOB", "DIST", "FLEET"]);
  const rowsDF = run([
    S({ sessionId: "d-new", title: "DIST", cwd: work, lastActivityAt: ago(72) }),
    S({ sessionId: "f-new", title: "FLEET #2", cwd: work, lastActivityAt: ago(96) }),
    S({ sessionId: "f-old", title: "FLEET #1", cwd: wt, lastActivityAt: ago(200) }),
  ], { repo: work });
  t("the NEWEST DIST is PROTECTED even at 72h idle", verdictOf(rowsDF, "d-new"), "PROTECTED");
  t("the NEWEST FLEET is PROTECTED even at 96h idle", verdictOf(rowsDF, "f-new"), "PROTECTED");
  t("but a PREDECESSOR FLEET IS retirable", verdictOf(rowsDF, "f-old"), "RETIRABLE");
  t("laneOf strips the instance number", [laneOf({ title: "CONDUCT #2" }), laneOf({ title: "BOB" })],
    ["CONDUCT", "BOB"]);
}

/* ========================================================================== */
section("6 — SELF, RUNNING, AND THE IDLE THRESHOLD. A session mid-task between turns is not a "
      + "corpse, and the sweep must never archive the thing performing it.");
{
  const { work } = scratch();
  const wt = linked(work, "wt-fresh");
  const rows = run([
    S({ sessionId: "me", title: "CONTENT-PDF", cwd: wt, lastActivityAt: ago(99) }),
    S({ sessionId: "busy", title: "CAPTURE", cwd: wt, isRunning: true, lastActivityAt: ago(99) }),
    S({ sessionId: "fresh", title: "RECORD", cwd: wt, lastActivityAt: ago(1) }),
    S({ sessionId: "stale", title: "RECORD", cwd: wt, lastActivityAt: ago(20) }),
  ], { repo: work, selfId: "me" });
  t("SELF is protected", verdictOf(rows, "me"), "PROTECTED");
  t("...by name, so the reason is auditable", reasonOf(rows, "me"), "this session");
  t("a RUNNING session is protected", verdictOf(rows, "busy"), "PROTECTED");
  t("a session idle UNDER the threshold is protected", verdictOf(rows, "fresh"), "PROTECTED");
  t("...and the reason states the threshold it was judged against",
    /threshold 4h/.test(reasonOf(rows, "fresh")), true);
  t("a session idle OVER the threshold with saved work is RETIRABLE", verdictOf(rows, "stale"), "RETIRABLE");
  t("the default threshold is declared once", DEFAULT_IDLE_HOURS, 4);
  t("...and exactly one of the four was named, so the sweep discriminates",
    summarise(rows).counts.retirable, 1);
}

/* ========================================================================== */
section("7 — THE SUMMARY SEPARATES 'HOLDING UNSAVED WORK' FROM 'NOT RETIRABLE'. Collapsing them "
      + "would hide the only row a human must see.");
{
  const { work } = scratch();
  const dirtyWt = linked(work, "wt-sum", { commits: 1, dirty: 2 });
  const cleanWt = linked(work, "wt-sum2");
  const rows = run([
    S({ sessionId: "h", title: "CONTENT-PDF", cwd: dirtyWt }),
    S({ sessionId: "r", title: "CONTENT-HTML", cwd: cleanWt }),
    S({ sessionId: "p", title: "CONDUCT #2", cwd: work, lastActivityAt: ago(1) }),
  ], { repo: work });
  const s = summarise(rows);
  t("three verdicts, counted separately",
    [s.counts.hold, s.counts.retirable, s.counts.protected], [1, 1, 1]);
  t("...and they account for every row judged", s.counts.total, 3);
  t("HOLD is its own list and not folded into protected", s.hold.map((r) => r.sessionId), ["h"]);
  t("every row carries a non-empty reason", rows.every((r) => (r.reason || "").length > 10), true);
  t("every row carries its idle age as a number", rows.every((r) => typeof r.idleHours === "number"), true);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`retirable: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
