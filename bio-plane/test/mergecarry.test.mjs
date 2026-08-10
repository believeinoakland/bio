/* M0-20 — A MERGE THAT SILENTLY DROPS A FILE.
 *
 * The subject is `tools/mergecarry.mjs`. The reason it exists is a measurement:
 *
 *   2026-08-08, merge `e241672`. REC-69's branch changed TWELVE files; the merge carried
 *   ELEVEN. The missing one was `civicos-ui/check-refusal-codes.mjs`, holding SEVENTY lines
 *   of floor moves. NOTHING WENT RED — a dropped floor move goes SLACK, not broken. Eleven
 *   floors sat stale with the battery green, `coverage.mjs --strict` exit 0 and
 *   `civicos-ui/test/run.mjs` exit 0. It surfaced days later BY ACCIDENT, because REC-69 was
 *   re-run and its worker re-measured.
 *
 * A failure that reads as success is this project's most expensive shape, and it is the
 * same shape as the merge loop that ledgered four items done while `git merge` had errored
 * out entirely.
 *
 * WHY THE ARMS ARE REAL `git merge` INVOCATIONS AND NOT FIXTURES. The subject is git's
 * behaviour at a conflict, and every benign case in the list below is defined by what git
 * DOES rather than by what a fixture author believes it does — rename-following, the
 * modify/delete stop, `-s ours`, octopus refusal. A fixture that hand-writes the trees it
 * expects agrees with the check for free, and an equality that costs nothing to produce is
 * not evidence (CLAUDE.md). So each arm builds a scratch repository and runs the real
 * command. THE SCRATCH REPOSITORIES ARE UNDER `os.tmpdir()`, NEVER INSIDE THE ESTATE: one
 * worker put a scratch worktree inside it and `op-claims.test.mjs` reported 15,007 op
 * mentions off a nested second copy of the repository, and a bare `git init` inside a
 * worktree would do the same to every instrument that walks the tree. `git stash` is used
 * nowhere — `refs/stash` is repository-wide across ~85 worktrees.
 *
 * THE HARD PART IS THE FALSE POSITIVE. A merge legitimately carries fewer files than its
 * branch changed in several ordinary cases, and a check that cries wolf gets switched off —
 * that is `VERIFICATION.md`'s own stated reason for not making `--strict` the gate yet. So
 * the benign half of this suite is the larger half, and every case is DRIVEN:
 *
 *   B1  main already made the same change              -> sameEnd, exit 0
 *   B2  the file was deleted on main                   -> goneOnMain (WARN), exit 0
 *   B3  the file was renamed on main                   -> moved, exit 0
 *   B4  an octopus merge                               -> nothing dropped, exit 0
 *   B5  the branch was rebased before merging          -> nothing dropped, exit 0
 *   B6  a hand-resolution that took one side, DECLARED -> declared, exit 0
 *   B7  a fast-forward, so no merge commit at all      -> zero merges judged, exit 0
 *   B8  the branch DELETED the file and main kept it   -> sameEnd, exit 0
 *
 * WHAT THIS CANNOT DISTINGUISH, and it is stated here because the honest limit is the
 * point: a `dropped` finding is ALSO the shape of a correct hand-resolution that
 * deliberately took main's side. The trees are identical and no archaeology separates
 * them. The check does not claim to know which; it claims the drop must be DECLARED, and
 * B6 is the arm proving a declaration is honoured. REC-69's merge message named the file in
 * PROSE and promised a re-read that never came, which is why prose is not the escape hatch
 * — arm (3) of the control is the arm that proves that distinction is load-bearing.
 *
 * NEGATIVE CONTROL: `node test/mergecarry.control.mjs` from `bio-plane/`. Arms:
 * (1) in `tools/mergecarry.mjs` make the `dropped` classification unreachable (return
 * "moved" instead) -> the real-history arm and every MUST-FAIL arm here FAIL, which is the
 * proof the FAIL path is what does the work;
 * (2) remove the `atP1 === atPk` sameEnd escape -> B1 FAILS, which is the proof the benign
 * classification is doing work rather than the candidate set being empty;
 * (3) THE OVER-STRICTNESS ARM AND THE SHARPEST ONE — make `declaredDrops` accept a
 * BASENAME mentioned anywhere in the commit BODY instead of a `Dropped-from-branch:`
 * trailer -> the real `e241672` arm FAILS, because REC-69's own merge message names
 * `check-refusal-codes.mjs` in prose. That is the historical receipt turned into an arm:
 * had the escape hatch been prose, this check would have passed the very defect it exists
 * for;
 * (4) drop the `blobs.has(atPk)` rename test -> B3 FAILS, a legitimate rename reads as a
 * drop, and the check starts crying wolf;
 * (5) delete a row from `KNOWN_HISTORICAL_DROPS` -> the "no UNREGISTERED historical drop"
 * arm FAILS, which proves the register grades the real corpus and not a literal;
 * (6) add a bogus row to `KNOWN_HISTORICAL_DROPS` -> the "no registered drop has quietly
 * stopped being one" arm FAILS, closing the register from the other side so the list cannot
 * outlive its reason;
 * (7) remove the `mergecarry` mention from `docs/development/kickoffs/CONDUCT.md` -> the
 * "the mechanism is in the loop the reader actually runs" arm FAILS;
 * (8) point `tools/plancheck.mjs`'s section 2c at a different module -> the "plancheck
 * actually RUNS the carry check" arm FAILS, which is the arm proving the GATE and not
 * merely the library. That arm grepped plancheck's text in its first draft and a COMMENT
 * satisfied it; it now runs plancheck and reads its report.
 */

/* `sandbox.mjs` FIRST, and `hygiene.test.mjs` is what found it missing rather than a reader:
   any suite calling `mkdtempSync` must own its ground, because $TMPDIR is otherwise shared
   and 23,263 orphaned sandboxes once filled a disk to zero. It also happens to make this
   suite's scratch repositories survivable — they are removed on exit even if an arm throws,
   which matters more here than usual because a leaked `git init` tree is the exact hazard
   the header warns about. It does NOT weaken the outside-the-estate property: sandbox.mjs
   repoints $TMPDIR within the system temp root, and section 1 asserts that. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { auditMerge, carryAudit, historicalRegister, KNOWN_HISTORICAL_DROPS,
         unregisteredDrops } from "../../tools/mergecarry.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* The FOOT sentinel. A TypeError inside an assertion goes through no assertion at all and
   ends the module while the tally reads clean; this project has met that. */
const SECTIONS = 13;
let reached = 0;
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };

/* ------------------------------------------------------------ scratch repositories
   OUTSIDE the estate, by construction: `tmpdir()` is /var/folders on darwin and /tmp on
   linux, and the path is asserted not to sit under the repository root before anything is
   written into it. That assertion is not decoration — it is the arm that would have caught
   the worker whose scratch worktree turned into a nested second copy of this repository. */
const SANDBOX = mkdtempSync(join(tmpdir(), "mergecarry-"));

const g = (repo, ...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();

let n = 0;
function scratch() {
  const d = join(SANDBOX, `r${++n}`);
  execFileSync("git", ["init", "-q", "-b", "main", d], { encoding: "utf8" });
  g(d, "config", "user.name", "m0-20");
  g(d, "config", "user.email", "m0-20@example.invalid");
  g(d, "config", "commit.gpgsign", "false");
  return d;
}
const put = (repo, path, body) => writeFileSync(join(repo, path), body);
const commit = (repo, msg) => { g(repo, "add", "-A"); g(repo, "commit", "-q", "-m", msg); return g(repo, "rev-parse", "HEAD"); };
/* `--no-ff` everywhere a merge is wanted: a fast-forward is not a merge and B7 is the arm
   that pins what the check does with one. Failure is EXPECTED at a conflict, so the merge
   is spawned rather than exec'd and its status is returned for the arm to use. */
const merge = (repo, ...args) => spawnSync("git", ["merge", "--no-ff", "--no-edit", ...args], { cwd: repo, encoding: "utf8" });

const BODY = Array.from({ length: 40 }, (_, i) => `line ${i} of a file long enough for rename detection`).join("\n");

/* Build "branch changed F, merge took main's F whole" — REC-69's exact shape. */
function droppedRepo({ declare = null } = {}) {
  const d = scratch();
  put(d, "F.md", `${BODY}\n`);
  put(d, "other.md", "untouched\n");
  commit(d, "base");
  g(d, "checkout", "-q", "-b", "topic");
  put(d, "F.md", `${BODY}\nBRANCH: the floor moved to 148\n`);
  put(d, "new.md", "the branch's other work\n");
  commit(d, "topic changes F and adds new.md");
  g(d, "checkout", "-q", "main");
  put(d, "F.md", `${BODY}\nMAIN: a different edit to the same tail\n`);
  commit(d, "main changes F too");
  const m = merge(d, "topic");
  if (m.status === 0) throw new Error("expected a conflict and got none");
  g(d, "checkout", "--ours", "--", "F.md");
  g(d, "add", "F.md");
  const msg = "Merge topic — F.md took OURS on the floor hunks"
    + (declare ? `\n\nDropped-from-branch: ${declare} — the branch's figure was measured on an older tree` : "");
  g(d, "commit", "-q", "-m", msg);
  return d;
}

const klasses = (d) => auditMerge({ repo: d, commit: g(d, "rev-parse", "HEAD") });

/* ========================================================================== */
section("the sandbox is outside the estate, and that is asserted rather than assumed");
{
  const root = g(REPO, "rev-parse", "--show-toplevel");
  t("the scratch root is NOT under the repository", SANDBOX.startsWith(root + "/"), false);
  t("...and the repository root is a real path", existsSync(join(root, "CLAUDE.md")), true);
}

/* ========================================================================== */
section("A1 — THE REAL 2026-08-08 DROP. This must FAIL, from the real commits.");
/* Driven against the commits themselves, not a reconstruction. If the objects are ever
   unreachable the arm says so instead of passing over nothing — a headline assertion that
   passed over an empty corpus is a mistake this project has made THREE times. */
{
  const reachable = spawnSync("git", ["cat-file", "-e", "e241672"], { cwd: REPO }).status === 0;
  t("the real merge e241672 is reachable from this worktree (a linked worktree shares the "
    + "object store, so a checkout of ONE commit can still judge any merge)", reachable, true);
  if (!reachable) throw new Error("e241672 unreachable — this suite cannot judge anything");

  const r = auditMerge({ repo: REPO, commit: "e241672" });
  t("its branch changed 12 files", r.sides[0].branchChanged, 12);
  t("...and the merge carried 11", r.sides[0].carried, 11);
  t("...and the check reports exactly ONE dropped path", r.counts.dropped, 1);
  t("...NAMED, and it is the one the accident found",
    r.findings.filter((f) => f.klass === "dropped").map((f) => f.path),
    ["civicos-ui/check-refusal-codes.mjs"]);
  t("...with the size of what was lost, derived rather than quoted from the brief",
    r.findings[0].lines, 70);
  /* The merge's own message names this file in prose and describes taking main's side. If
     prose counted, this arm would pass and the check would be worthless. */
  t("...and the merge's PROSE names the file, which is why prose is not the escape hatch",
    /check-refusal-codes\.mjs/.test(g(REPO, "show", "-s", "--format=%B", "e241672")), true);
  t("...while it carries NO Dropped-from-branch trailer", r.counts.declared, 0);
}

/* ========================================================================== */
section("A2 — the same shape, built from scratch and driven through real git");
{
  const r = klasses(droppedRepo());
  t("a hand-resolution that took main's F whole is DROPPED", r.counts.dropped, 1);
  t("...naming F.md and nothing else", r.findings.map((f) => f.path), ["F.md"]);
  t("...and the branch's OTHER file was carried, so this is not a blanket alarm",
    r.sides[0].carried >= 1, true);
}

/* ========================================================================== */
section("A3 — the merge that carried NOTHING (`-s ours`), which is the four-ledgered-items shape");
{
  const d = scratch();
  put(d, "F.md", "base\n"); commit(d, "base");
  g(d, "checkout", "-q", "-b", "topic");
  put(d, "F.md", "branch work\n"); put(d, "G.md", "more branch work\n");
  commit(d, "topic");
  g(d, "checkout", "-q", "main");
  put(d, "H.md", "main moved on\n"); commit(d, "main");
  const m = merge(d, "-s", "ours", "topic");
  t("`git merge -s ours` succeeds and looks like every other merge", m.status, 0);
  const r = klasses(d);
  t("...and EVERY file the branch touched is reported dropped", r.counts.dropped, 2);
  t("...by name", r.findings.map((f) => f.path).sort(), ["F.md", "G.md"]);
  /* THIS ARM IS A FINDING ABOUT THE INSTRUMENT, PINNED SO IT CANNOT COME BACK. G.md is a
     file the BRANCH ADDED, absent from main at the merge — and the first draft of the
     classifier scored it `goneOnMain`, a WARN, because it tested "absent at the first
     parent" without asking WHY. Absent because main deleted it and absent because it never
     existed there are opposite facts, and conflating them was wrong in the FALSE-NEGATIVE
     direction: brand-new work, carried nowhere, reported as a decision somebody made. The
     base is what tells them apart. Caught by this arm, not by reading the code. */
  t("...including one the branch ADDED, which is absent at the first parent for the "
    + "OPPOSITE reason to a deletion and must not be excused as gone-on-main",
    r.findings.filter((f) => f.path === "G.md").map((f) => f.klass), ["dropped"]);
  t("...and gone-on-main is NOT what this merge produced", r.counts.goneOnMain, 0);
}

/* ========================================================================== */
section("B1 — main already made the SAME change. Must PASS.");
{
  const d = scratch();
  put(d, "F.md", "base\n"); commit(d, "base");
  g(d, "checkout", "-q", "-b", "topic");
  put(d, "F.md", "the identical correction\n"); commit(d, "topic fixes F");
  g(d, "checkout", "-q", "main");
  put(d, "F.md", "the identical correction\n"); commit(d, "main fixes F the same way");
  t("git merges it with no conflict", merge(d, "topic").status, 0);
  const r = klasses(d);
  t("F.md is a CANDIDATE — the branch changed it and the merge carried nothing of it",
    r.sides[0].candidates.map((c) => c.path), ["F.md"]);
  t("...classified sameEnd, because the branch's end state IS the merge's", r.counts.sameEnd, 1);
  t("...and NOTHING is dropped", r.counts.dropped, 0);
  t("...and it is not even reported, because printing this class is how a check becomes noise",
    r.findings.length, 0);
}

/* ========================================================================== */
section("B2 — the file was DELETED on main. Must PASS, and must be NAMED.");
{
  const d = scratch();
  put(d, "F.md", `${BODY}\n`); commit(d, "base");
  g(d, "checkout", "-q", "-b", "topic");
  put(d, "F.md", `${BODY}\nbranch edit\n`); commit(d, "topic edits F");
  g(d, "checkout", "-q", "main");
  rmSync(join(d, "F.md")); commit(d, "main deletes F");
  const m = merge(d, "topic");
  t("git STOPS at the modify/delete rather than choosing", m.status !== 0, true);
  g(d, "rm", "-q", "-f", "F.md"); g(d, "commit", "-q", "-m", "Merge topic — took main's delete");
  const r = klasses(d);
  t("...classified goneOnMain, not dropped", [r.counts.goneOnMain, r.counts.dropped], [1, 0]);
  t("...and it is REPORTED, because the branch's work on it is genuinely gone",
    r.findings.map((f) => f.path), ["F.md"]);
}

/* ========================================================================== */
section("B3 — the file was RENAMED on main. Must PASS.");
{
  const d = scratch();
  put(d, "F.md", `${BODY}\n`); commit(d, "base");
  g(d, "checkout", "-q", "-b", "topic");
  put(d, "F.md", `${BODY}\nbranch edit\n`); commit(d, "topic edits F");
  g(d, "checkout", "-q", "main");
  g(d, "mv", "F.md", "G.md"); commit(d, "main renames F to G");
  t("git follows the rename and merges cleanly", merge(d, "topic").status, 0);
  const r = klasses(d);
  t("F.md is a candidate at its OLD path", r.sides[0].candidates.map((c) => c.path), ["F.md"]);
  /* ALSO A FINDING ABOUT THE INSTRUMENT. Main renaming F to G leaves F absent at the first
     parent, so the first draft classified a perfectly ordinary rename as `goneOnMain` and
     reported lost work that was sitting right there under another name. That is the
     cry-wolf direction, and cry-wolf is how a check gets switched off. The fix is ordering:
     ask whether the branch's blob is anywhere in the merged tree BEFORE asking whether its
     old path survived. The `goneOnMain` count is asserted too, because "not dropped" was
     what let this through the first time. */
  t("...classified moved, because the branch's blob is elsewhere in the merged tree",
    [r.counts.moved, r.counts.dropped, r.counts.goneOnMain], [1, 0, 0]);
  t("...and the branch's bytes really are at the new path",
    g(d, "show", "HEAD:G.md"), `${BODY}\nbranch edit`);
}

/* ========================================================================== */
section("B4 — an OCTOPUS merge. Must PASS, and must be judged per parent.");
{
  const d = scratch();
  put(d, "base.md", "base\n"); commit(d, "base");
  for (const b of ["t1", "t2"]) {
    g(d, "checkout", "-q", "-b", b, "main");
    put(d, `${b}.md`, `${b} work\n`); commit(d, `${b}`);
  }
  g(d, "checkout", "-q", "main");
  t("the octopus merge succeeds", merge(d, "t1", "t2").status, 0);
  const r = klasses(d);
  t("...it is recognised as an octopus", [r.octopus, r.parents.length], [true, 3]);
  t("...both non-first parents are judged, not just the second", r.sides.length, 2);
  t("...and nothing is dropped", r.counts.dropped, 0);
}

/* ========================================================================== */
section("B5 — the branch was REBASED before merging. Must PASS.");
{
  const d = scratch();
  put(d, "F.md", "base\n"); commit(d, "base");
  g(d, "checkout", "-q", "-b", "topic");
  put(d, "G.md", "branch work\n"); commit(d, "topic");
  g(d, "checkout", "-q", "main");
  put(d, "H.md", "main work\n"); commit(d, "main moves on");
  g(d, "checkout", "-q", "topic");
  g(d, "rebase", "-q", "main");
  g(d, "checkout", "-q", "main");
  t("the post-rebase merge succeeds", merge(d, "topic").status, 0);
  const r = klasses(d);
  /* The merge base after a rebase is the tip of main, so branch-changed is exactly the
     rebased commits' contribution and nothing else — the case that would produce a storm of
     candidates if the base were taken from the ORIGINAL fork point. */
  t("...branch-changed is the rebased contribution only", r.sides[0].branchChanged, 1);
  t("...and nothing is dropped", r.counts.dropped, 0);
}

/* ========================================================================== */
section("B6 — a DECLARED hand-resolution. Must PASS. The over-strictness arm.");
{
  const r = klasses(droppedRepo({ declare: "F.md" }));
  t("the identical tree, with a trailer, is `declared` rather than `dropped`",
    [r.counts.declared, r.counts.dropped], [1, 0]);
  t("...and it is still REPORTED, because a declared drop is visible, not excused",
    r.findings.map((f) => `${f.klass} ${f.path}`), ["declared F.md"]);

  /* The declaration is per PATH, not per merge. A trailer naming something else must not
     launder a different file — a fence tighter or looser than its rule is not the rule. */
  const r2 = klasses(droppedRepo({ declare: "some/other/path.md" }));
  t("a trailer naming a DIFFERENT path does not launder this one", r2.counts.dropped, 1);
  const r3 = klasses(droppedRepo({ declare: "F" }));
  t("...nor does a prefix of the path", r3.counts.dropped, 1);
}

/* ========================================================================== */
section("B7/B8 — a fast-forward, and a branch DELETION main declined. Must PASS.");
{
  const d = scratch();
  put(d, "F.md", "base\n"); commit(d, "base");
  g(d, "checkout", "-q", "-b", "topic");
  put(d, "F.md", "branch work\n"); commit(d, "topic");
  g(d, "checkout", "-q", "main");
  g(d, "merge", "-q", "--ff-only", "topic");
  const a = carryAudit({ repo: d, range: `${g(d, "rev-parse", "HEAD")}~1..HEAD` });
  t("B7: a fast-forward produces no merge commit, so there is nothing to judge",
    [a.merges.length, a.counts.dropped], [0, 0]);

  const e = scratch();
  put(e, "F.md", `${BODY}\n`); commit(e, "base");
  g(e, "checkout", "-q", "-b", "topic");
  rmSync(join(e, "F.md")); commit(e, "topic deletes F");
  g(e, "checkout", "-q", "main");
  put(e, "F.md", `${BODY}\nmain keeps working on it\n`); commit(e, "main edits F");
  const m = merge(e, "topic");
  t("B8: git STOPS at the delete/modify", m.status !== 0, true);
  g(e, "checkout", "--ours", "--", "F.md"); g(e, "add", "F.md");
  g(e, "commit", "-q", "-m", "Merge topic — kept the file");
  const r = klasses(e);
  t("...a DELETION the merge declined is sameEnd, not a lost edit", [r.counts.sameEnd, r.counts.dropped], [1, 0]);
}

/* ========================================================================== */
section("the historical register, graded in BOTH directions over the REAL corpus");
{
  const h = historicalRegister({ repo: REPO });
  console.log(`  corpus: ${h.merges} merge(s) in origin/main · ${h.dropped.length} dropped · `
    + `${h.counts.goneOnMain} goneOnMain · ${h.counts.moved} moved · ${h.counts.sameEnd} sameEnd`);
  /* FLOOR THE CORPUS. A totality assertion over an empty set has passed three times here. */
  t("the corpus is non-empty and large enough to mean something (>= 150 merges)", h.merges >= 150, true);
  t("no UNREGISTERED drop sits in main's history", h.fresh, []);
  t("no registered drop has quietly stopped being one", h.stale, []);
  t("...and the register is the three the sweep found, not a longer list",
    KNOWN_HISTORICAL_DROPS.length, 3);
  /* THE FALSE-POSITIVE CLAIM, AS A NUMBER RATHER THAN A PROMISE. Three findings over the
     whole of main's history is what earns this check its place in the gate; a check that
     cried wolf on a tenth of merges would be switched off within a week. */
  t("the finding rate over real history is under 5% of merges",
    (h.counts.dropped + h.counts.goneOnMain + h.counts.moved) / h.merges < 0.05, true);
}

/* ========================================================================== */
section("THE MECHANISM IS IN THE LOOP THE READER ACTUALLY RUNS");
{
  /* Documenting it is necessary and never sufficient (CLAUDE.md). CONDUCT is the only
     session that merges, so CONDUCT's kickoff must name the command. */
  const k = readFileSync(join(REPO, "docs/development/kickoffs/CONDUCT.md"), "utf8");
  t("kickoffs/CONDUCT.md names mergecarry", /mergecarry/.test(k), true);
  t("...and names the trailer, so the escape hatch is discoverable at the keystroke",
    /Dropped-from-branch/.test(k), true);

  /* THE GATE IS DRIVEN, NOT GREPPED, and the first draft of this arm grepped. Asserting
     that `plancheck.mjs` CONTAINS the string `mergecarry.mjs` is satisfied by a COMMENT
     mentioning it — a mechanism believed on the strength of its existence rather than its
     behaviour, which is the defect this project meets most, appearing inside the suite
     written to catch a cousin of it. So plancheck is RUN and its own report is read.
     `--local` because the publication half fetches and is not what this arm is about. */
  const pc = spawnSync(process.execPath, [join(REPO, "tools/plancheck.mjs"), "--local"],
    { cwd: REPO, encoding: "utf8" });
  t("plancheck actually RUNS the carry check and reports it in its own output",
    /merge carry: \d+ merge\(s\)/.test(pc.stdout), true);
  t("...and reports the DROPPED tally there, so a drop cannot be a silent zero",
    /DROPPED/.test(pc.stdout), true);

  const d = droppedRepo();
  const a = carryAudit({ repo: d, range: `${g(d, "rev-parse", "HEAD")}~1..HEAD` });
  t("...and the shared predicate reports the drop over an arbitrary range too",
    unregisteredDrops(a.findings).map((f) => f.path), ["F.md"]);

  /* The CLI is driven, because a store-level pass is not evidence a caller can reach it. */
  const cli = spawnSync(process.execPath, [join(REPO, "tools/mergecarry.mjs"), "--commit", "e241672"],
    { cwd: REPO, encoding: "utf8" });
  t("the CLI exits 1 on the real drop", cli.status, 1);
  t("...and names the path in its output", /civicos-ui\/check-refusal-codes\.mjs/.test(cli.stdout), true);
  const ok = spawnSync(process.execPath, [join(REPO, "tools/mergecarry.mjs"), "--commit", "7e5f9b0"],
    { cwd: REPO, encoding: "utf8" });
  t("...and exits 0 on an honest merge, so the CLI is not simply always red", ok.status, 0);
}

/* ========================================================================== */
rmSync(SANDBOX, { recursive: true, force: true });
t(`this suite reached its own FOOT — all ${SECTIONS} sections ran (${reached})`, reached, SECTIONS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
