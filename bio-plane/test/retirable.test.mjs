/* GATE: never-cache (history) — M0-126, BOB #30 (TREE-SHARING §3a condition 1): its verdict reads git ls-remote origin, which no
   result key can name; traced 2026-09-23.
   READS NO LIVE REF OF THIS CHECKOUT — M0-136, 2026-09-23. Until then sections 8 and 9 drove the REAL CLI, whose ROOT is
   this repository, so every CLI run listed THIS machine's worktrees (`git worktree list`) and asked THIS checkout's
   remote over the network (`git ls-remote --heads origin`): 5 of each a run, measured by a logging `git` on PATH. No
   asserted row used either answer (their sessions sit in /tmp or at a path that does not exist), but a network read of
   the live remote is not a gate unit's to make. The CLI now runs from a COPY inside a scratch repository with its own
   bare `origin` (`cliHome` below), so every ref, remote and worktree it reads is the fixture's. HOW CHECKED: the suite
   and both modules it imports (`tools/retirable.mjs`, `tools/strandedwork.mjs`) grepped for `execFileSync`/`spawnSync`/
   `git(` and for `origin/`, `coord`, `ls-remote`, `FETCH_HEAD`, `fetch`; and the suite run with a logging `git` first on
   PATH: after this change no git call has this checkout as its directory. The CLOCK: `classify` defaults `now` to the
   wall clock, which the CLI arms use; their fixture sessions are dated 2026-09-01 or `NOW` minus hours and judged past
   or under a 4h threshold that a later clock cannot reverse (`electHolders` takes the later of `now` and the clock), so
   the verdict does not move with the date. It stays never-cache: it runs git over fixture history. */
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
 * NEGATIVE CONTROL for SECTION 8 (RUN 2026-09-20 by BOB #18, baseline 60 pass / 0 fail, 8/8
 * sections): two arms, each armed ALONE against `tools/retirable.mjs` copied aside and restored by
 * `cp`, NOT by `git checkout` (CLAUDE.md §7 — checkout restores HEAD and would have discarded the
 * fix itself), with the restore verified by sha256 against the pre-arm digest
 * 8c391cac3d8bfe9c76abae89bafccb92b57d34661f82d55f1090f53fd46a3975.
 *   (B1) the `--total` gap branch made unreachable -> 4 NAMED assertions fail (56 pass / 4 fail):
 *        *--total greater than judged names the shortfall*, *says the verdict covers the rest NOT
 *        AT ALL*, *names WHICH rows a truncation drops first*, *suppresses the plain BOUND line*.
 *   (B2) the HINT branch made unreachable -> 2 NAMED assertions fail (58 pass / 2 fail): *a round
 *        input length raises a HINT*, *refuses to guess between truncation and a real estate of 50*.
 *   BOTH ARMS BREAK ONLY THE BRANCH THEY NAME — a one-token edit to a single condition, so no
 *   second variable moves and the other sections stay green in each run, which is what makes the
 *   two failures attributable rather than merely simultaneous.
 *
 * NEGATIVE CONTROL for SECTION 9 (RUN 2026-09-21 by BOB #23 for M0-83, baseline 83 pass / 0 fail,
 * 9/9 sections): six arms, A9–A14 of `node bio-plane/test/retirable.control.mjs`, each armed ALONE
 * against the pristine copy and restored by that driver (sha256 AND `cmp` AND a floored byte count);
 * driver exit 0, 85 pass / 0 fail, `tools/retirable.mjs` sha256 f2dba3e9f210fa42… before and after.
 *   (A9)  `laneOf` back to the TRAILING-only regex -> *a SUFFIXED title is its lane's live holder*
 *         FAILS, and the UNKNOWN-SELF arm does not: BOB #19's defect, re-armed.
 *   (A10) the UNKNOWN-SELF refusal removed -> *a --self FOUND in the input is REFUSED, by name*.
 *   (A11) the declared caller left out of the election -> *a DECLARED caller is its lane's newest*,
 *         and the UNDECLARED arm does not fail.
 *   (A12) the OUT-OF-SCOPE verdict removed -> *names another repository's and a vanished cwd OUT
 *         OF SCOPE* (BOB #21's 24 + 15).
 *   (A13) scope by string PREFIX, the cheap defeat M0-83 names -> the SIBLING arm FAILS and the
 *         other-repository arm does NOT: a prefix match passes that one, which is why both exist.
 *   (A14) the election by activity alone -> *the lane is ORDERED by instance number*.
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
import { mkdtempSync, writeFileSync, existsSync, chmodSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { classify, summarise, treeState, laneOf, isTaskRun, STANDING_LANES,
         DEFAULT_IDLE_HOURS, instanceOf, electHolders, UnknownSelf } from "../../tools/retirable.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 9;
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
/* M0-136: the CLI's home — a scratch repository with a bare origin, holding a COPY of the tool and the module it
   imports, taken at run time (so the control driver's patched tool is the one copied). The CLI's ROOT is its own
   location, so it lists this fixture's worktrees and asks this fixture's origin, never this checkout's. */
function cliHome() {
  const { work } = scratch();
  mkdirSync(join(work, "tools"), { recursive: true });
  for (const f of ["retirable.mjs", "strandedwork.mjs"])
    writeFileSync(join(work, "tools", f), readFileSync(join(REPO, "tools", f)));
  return { home: work, CLI: join(work, "tools/retirable.mjs") };
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
  /* CORRECTED 2026-09-21 by M0-83 (4), never exempted: this arm's vanished cwd sat in the SANDBOX, OUTSIDE
     the repository it was judged against — the shape M0-83 names out of scope (24 Supervisor sessions,
     their directories gone, judged RETIRABLE against this repository's remotes). The claim it made is kept
     where it is true: a vanished cwd INSIDE the repository is its own removed worktree, and holds nothing. */
  const rows = run([
    S({ sessionId: "gone", title: "CONTENT-PDF", cwd: join(work, ".claude/worktrees/does-not-exist") }),
    S({ sessionId: "gone-elsewhere", title: "CONTENT-PDF", cwd: join(SANDBOX, "does-not-exist") }),
  ], { repo: work });
  /* A path that does not exist holds nothing — that is a real absence, not an unknown one. */
  t("a cwd that does not exist holds nothing and is RETIRABLE", verdictOf(rows, "gone"), "RETIRABLE");
  t("...and one that is not this repository's is OUT OF SCOPE, not judged", verdictOf(rows, "gone-elsewhere"),
    "OUT_OF_SCOPE");

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
  t("the standing lanes are declared once", STANDING_LANES, ["CONDUCT", "BOB", "DIST", "FLEET", "SCHEDULER"]);
  const rowsDF = run([
    S({ sessionId: "d-new", title: "DIST", cwd: work, lastActivityAt: ago(72) }),
    S({ sessionId: "f-new", title: "FLEET #2", cwd: work, lastActivityAt: ago(96) }),
    S({ sessionId: "f-old", title: "FLEET #1", cwd: wt, lastActivityAt: ago(200) }),
    S({ sessionId: "s-new", title: "SCHEDULER", cwd: work, lastActivityAt: ago(50) }),
  ], { repo: work });
  t("the NEWEST DIST is PROTECTED even at 72h idle", verdictOf(rowsDF, "d-new"), "PROTECTED");
  t("the NEWEST FLEET is PROTECTED even at 96h idle", verdictOf(rowsDF, "f-new"), "PROTECTED");
  t("but a PREDECESSOR FLEET IS retirable", verdictOf(rowsDF, "f-old"), "RETIRABLE");
  t("the NEWEST SCHEDULER is PROTECTED even at 50h idle", verdictOf(rowsDF, "s-new"), "PROTECTED");
  t("laneOf strips the instance number", [laneOf({ title: "CONDUCT #2" }), laneOf({ title: "BOB" })],
    ["CONDUCT", "BOB"]);
}

/* ========================================================================== */
section("6 — SELF, RUNNING, AND THE IDLE THRESHOLD. A session mid-task between turns is not a "
      + "corpse, and the sweep must never archive the thing performing it.");
{
  const { work } = scratch();
  const wt = linked(work, "wt-fresh");
  /* CORRECTED 2026-09-21 by M0-83 (2), never exempted: this section fed the caller's OWN row in the input and
     asserted it PROTECTED as "this session". `list_sessions` never contains its caller, so that shape is
     PROOF the id is somebody else's — CONDUCT #8 drove it for real on 2026-09-20 and a stranger was
     protected in its name. The shape is now refused (section 9); here the caller is absent, as it always is. */
  const rows = run([
    S({ sessionId: "busy", title: "CAPTURE", cwd: wt, isRunning: true, lastActivityAt: ago(99) }),
    S({ sessionId: "fresh", title: "RECORD", cwd: wt, lastActivityAt: ago(1) }),
    S({ sessionId: "stale", title: "RECORD", cwd: wt, lastActivityAt: ago(20) }),
  ], { repo: work, selfId: "me" });
  t("the caller, absent from its own listing, is judged nowhere", rows.some((r) => r.sessionId === "me"), false);
  t("a RUNNING session is protected", verdictOf(rows, "busy"), "PROTECTED");
  t("a session idle UNDER the threshold is protected", verdictOf(rows, "fresh"), "PROTECTED");
  t("...and the reason states the threshold it was judged against",
    /threshold 4h/.test(reasonOf(rows, "fresh")), true);
  t("a session idle OVER the threshold with saved work is RETIRABLE", verdictOf(rows, "stale"), "RETIRABLE");
  t("the default threshold is declared once", DEFAULT_IDLE_HOURS, 4);
  t("...and exactly one of the three was named, so the sweep discriminates",
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

/* SECTION 8 — THE VERDICT STATES ITS OWN BOUND. Added 2026-09-20 by BOB #18 after the
   conduct-heartbeat measured this predicate going blind across four consecutive runs: called with
   a listing fixed at 50 while the estate held 53 and grew ~3/hour, it reported HOLD falling
   15 -> 14 -> 13 -> 12 while the true count never moved. Rows were pushed off the BOTTOM of the
   listing, which is where stranded work lives, and the number fell in the direction a reader reads
   as progress. Every arm here drives the CLI as a SUBPROCESS, because the defect and the fix are
   both in the CLI block and the rest of this suite imports the module's functions instead —
   a suite that never runs the entry point cannot see a bug that lives there. */
{
  section("8 · the verdict names what it did not judge");
  const { CLI } = cliHome();   /* M0-136: never the real CLI, whose ROOT is this checkout */
  const mk = (n) => JSON.stringify(Array.from({ length: n }, (_, i) => ({
    sessionId: `local_s${String(i).padStart(4, "0")}-0000-0000-0000-000000000000`,
    title: `s${i}`, cwd: "/tmp", isArchived: false, isRunning: false,
    lastActivityAt: "2026-09-01T00:00:00.000Z",
  })));
  const run = (rows, ...extra) =>
    execFileSync("node", [CLI, "--self", "local_none", ...extra],
      { input: mk(rows), encoding: "utf8" });

  /* An ordinary run says the bound even though nothing is wrong: a caveat that appears only on
     bad runs trains the reader to skip it, which is how the heartbeat's own reader missed four. */
  const plain = run(7);
  t("a plain run prints the BOUND line", /BOUND: this verdict covers the 7 session\(s\)/.test(plain), true);
  t("a plain run does not cry truncation", /NOT JUDGED|HINT, NOT A FINDING/.test(plain), false);

  /* --total is the only PROOF of a gap available to this tool, and it names the shortfall. */
  const gap = run(7, "--total", "53");
  t("--total greater than judged names the shortfall", /NOT JUDGED — 46 of 53/.test(gap), true);
  t("the gap arm says the verdict covers the rest NOT AT ALL", /says NOTHING about the other 46/.test(gap), true);
  t("the gap arm names WHICH rows a truncation drops first", /OLDEST rows first/.test(gap), true);
  t("the gap arm suppresses the plain BOUND line", /BOUND: this verdict covers/.test(gap), false);

  /* A round count is EVIDENCE of truncation and never proof; the tool must not collapse the two. */
  const hint = run(50);
  t("a round input length raises a HINT", /HINT, NOT A FINDING — the input was exactly 50 rows/.test(hint), true);
  t("the hint refuses to guess between truncation and a real estate of 50",
    /cannot tell them apart and does not guess/.test(hint), true);
  t("a hint is not reported as a finding", /NOT JUDGED —/.test(hint), false);

  /* --total EQUAL to judged is the caller asserting completeness: no gap, no hint, bound stated. */
  const exact = run(50, "--total", "50");
  t("--total equal to judged clears the hint", /HINT, NOT A FINDING/.test(exact), false);
  t("--total equal to judged still prints the bound", /BOUND: this verdict covers the 50/.test(exact), true);
}

/* SECTION 9 — M0-83 (BOB #23, 2026-09-21): four defects, each found by a lane acting on this tool's verdict,
   each moving a count the way a reader takes as SAFE. The arms drive both the module and, where the defect
   lives at the entry point, the CLI as a subprocess (section 8's reason). */
{
  section("9 — M0-83: a SUFFIXED lane title, a --self found in its own input, a DECLARED caller, and "
        + "another repository's sessions");
  const { home, CLI } = cliHome();   /* M0-136: never the real CLI, whose ROOT is this checkout */
  const cliRun = (rows, ...args) => spawnSync("node", [CLI, ...args], { input: JSON.stringify(rows), encoding: "utf8" });
  /* A cwd inside THE CLI'S repository that no longer exists: in scope, and it holds nothing, so no tree is read.
     CORRECTED 2026-09-23 (M0-136), never exempted: this was inside THIS checkout, which the real CLI judged; the CLI
     now lives in its own fixture, so "this repository" is that fixture's, and the property asked is unchanged. */
  const HERE = join(home, ".claude/worktrees/__m083-no-such-tree__");
  const { work } = scratch();
  const wtOld = linked(work, "wt-m083");

  /* (1) THE LANE OF A SUFFIXED TITLE. Both forms fed, so fitting one title shape cannot pass. */
  t("laneOf reads a SUFFIXED title's lane", laneOf({ title: "CONDUCT #8 (BIO) — integrator lane" }), "CONDUCT");
  t("...and still a TRAILING one and a bare one", [laneOf({ title: "CONDUCT #7" }), laneOf({ title: "BOB" })],
    ["CONDUCT", "BOB"]);
  t("instanceOf reads the number wherever it sits, and null where there is none",
    [instanceOf({ title: "CONDUCT #8 (BIO) — integrator lane" }), instanceOf({ title: "DIST" })], [8, null]);
  const r1 = run([
    S({ sessionId: "c7", title: "CONDUCT #7", cwd: wtOld, lastActivityAt: ago(30) }),
    S({ sessionId: "c8", title: "CONDUCT #8 (BIO) — integrator lane", cwd: work, lastActivityAt: ago(9) }),
  ], { repo: work });
  t("a SUFFIXED title is its lane's live holder, so its predecessor is not elected",
    [verdictOf(r1, "c8"), verdictOf(r1, "c7")], ["PROTECTED", "RETIRABLE"]);
  const r1b = run([
    S({ sessionId: "b22", title: "BOB #22", cwd: wtOld, lastActivityAt: ago(5) }),
    S({ sessionId: "b23", title: "BOB #23", cwd: work, lastActivityAt: ago(6) }),
  ], { repo: work });
  t("the lane is ORDERED by instance number, not by who acted last",
    [verdictOf(r1b, "b23"), verdictOf(r1b, "b22")], ["PROTECTED", "RETIRABLE"]);

  /* (2) A --self FOUND IN THE INPUT. */
  let refused = null;
  try { run([S({ sessionId: "stranger", title: "CONDUCT #8", cwd: work })], { repo: work, selfId: "stranger" }); }
  catch (e) { refused = e; }
  t("a --self FOUND in the input is REFUSED, by name",
    [refused instanceof UnknownSelf, refused ? refused.code : null], [true, "UNKNOWN_SELF"]);
  t("...naming the row it found", /as 'CONDUCT #8'/.test(refused ? refused.message : ""), true);
  const c2 = cliRun([{ sessionId: "local_x", title: "CONDUCT #8", cwd: HERE, isArchived: false, isRunning: false,
                       lastActivityAt: ago(2) }], "--self", "local_x");
  t("the CLI refuses it with exit 3, UNKNOWN-SELF, and prints NO verdict",
    [c2.status, /^UNKNOWN-SELF/m.test(c2.stdout), /retirable: \d+ retirable/.test(c2.stdout)], [3, true, false]);
  const r2 = run([S({ sessionId: "other", title: "CONTENT-PDF", cwd: wtOld })], { repo: work, selfId: "me" });
  t("a --self ABSENT from the input, as list_sessions leaves it, is accepted", verdictOf(r2, "other"), "RETIRABLE");

  /* (3) THE CALLER IS NEVER IN ITS OWN LISTING. */
  const pred = [S({ sessionId: "b22", title: "BOB #22", cwd: wtOld, lastActivityAt: ago(30) })];
  const r3 = run(pred, { repo: work, selfId: "me" });
  t("UNDECLARED, the caller's predecessor is taken for the lane's holder", verdictOf(r3, "b22"), "PROTECTED");
  t("...and the reason SAYS it is only the newest listed", /newest LISTED/.test(reasonOf(r3, "b22")), true);
  const r3b = run(pred, { repo: work, selfId: "me", selfTitle: "BOB #23" });
  t("a DECLARED caller is its lane's newest, so its predecessor is judged on its tree", verdictOf(r3b, "b22"),
    "RETIRABLE");
  const succ = [S({ sessionId: "b24", title: "BOB #24", cwd: wtOld, lastActivityAt: ago(30) })];
  t("...but a declared caller never displaces a listed SUCCESSOR",
    [electHolders(succ, { selfId: "me", selfTitle: "BOB #23", now: NOW }).get("BOB").id,
     verdictOf(run(succ, { repo: work, selfId: "me", selfTitle: "BOB #23" }), "b24")], ["b24", "PROTECTED"]);
  const c3 = cliRun([{ sessionId: "local_b24", title: "BOB #24", cwd: HERE, isArchived: false, isRunning: false,
                       lastActivityAt: ago(30) }], "--self", "local_me", "--self-title", "BOB #23");
  t("the CLI tells a declared caller that a successor outranks it",
    /NOT THIS LANE'S HOLDER — you declared 'BOB #23', and 'BOB #24' outranks it/.test(c3.stdout), true);

  /* (4) ANOTHER REPOSITORY'S SESSIONS. */
  const other = scratch();
  const sibling = `${work}-sibling`;
  mkdirSync(sibling, { recursive: true });
  const r4 = run([
    S({ sessionId: "bio", title: "CONTENT-PDF", cwd: wtOld }),
    S({ sessionId: "otherrepo", title: "Supervisor session", cwd: other.work }),
    S({ sessionId: "vanished", title: "Alpha Pipeline", cwd: join(SANDBOX, "vanished-elsewhere", "x") }),
    S({ sessionId: "sib", title: "CONTENT-HTML", cwd: sibling }),
    S({ sessionId: "nocwd", title: "a cloud session", cwd: null }),
    S({ sessionId: "c99", title: "CONDUCT #99", cwd: other.work, lastActivityAt: ago(0.1) }),
    S({ sessionId: "c2", title: "CONDUCT #2", cwd: work, lastActivityAt: ago(9) }),
    S({ sessionId: "busy-else", title: "Ticker Skill", cwd: other.work, isRunning: true }),
  ], { repo: work });
  t("a mixed input judges THIS repository's session", verdictOf(r4, "bio"), "RETIRABLE");
  t("...and names another repository's and a vanished cwd OUT OF SCOPE",
    [verdictOf(r4, "otherrepo"), verdictOf(r4, "vanished")], ["OUT_OF_SCOPE", "OUT_OF_SCOPE"]);
  t("a SIBLING directory sharing the repository's path as a PREFIX is out of scope", verdictOf(r4, "sib"),
    "OUT_OF_SCOPE");
  t("a session with no cwd is out of scope", verdictOf(r4, "nocwd"), "OUT_OF_SCOPE");
  t("another repository's CONDUCT #99 does not displace this lane's holder", verdictOf(r4, "c2"), "PROTECTED");
  t("a RUNNING session of another repository is out of scope, not protected", verdictOf(r4, "busy-else"),
    "OUT_OF_SCOPE");
  t("the summary COUNTS what it did not judge, apart from what it did",
    [summarise(r4).counts.outOfScope, summarise(r4).counts.judged, summarise(r4).counts.total], [6, 2, 8]);
  const r5 = classify([S({ sessionId: "u", title: "CONTENT-PDF", cwd: work })],
    { now: NOW, repo: work, remoteMap: new Map(), scope: null });
  t("a repository whose worktrees cannot be listed places nothing: UNDETERMINED, and it HOLDS",
    [verdictOf(r5, "u"), /could NOT BE LISTED/.test(reasonOf(r5, "u"))], ["HOLD", true]);
  const c4 = cliRun([
    { sessionId: "local_in", title: "CONTENT-PDF", cwd: HERE, isArchived: false, isRunning: false, lastActivityAt: ago(30) },
    { sessionId: "local_out", title: "Supervisor", cwd: other.work, isArchived: false, isRunning: false, lastActivityAt: ago(30) },
  ], "--self", "local_none");
  t("the CLI prints the out-of-scope COUNT apart from the verdicts, and both counts on its summary line",
    [/OUT OF SCOPE — 1 session\(s\)/.test(c4.stdout), /1 judged, 1 out of scope/.test(c4.stdout)], [true, true]);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`retirable: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
