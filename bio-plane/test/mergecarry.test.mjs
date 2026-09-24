/* GATE: never-cache (history) — M0-126, BOB #30 (TREE-SHARING §3a condition 1); traced 2026-09-23. CORRECTED 2026-09-23 (M0-130):
   it no longer reads a LIVE REF — the historical register reads the merges up to `REGISTER_PIN`, a commit named in
   `tools/mergecarry.mjs`, and the planted-ref section proves the verdict is the same whatever `origin/main` holds. It stays
   never-cache because it still reads GIT HISTORY by commit id (e241672, 4355bfd, 7e5f9b0 and the pin's 752 merges), which
   no result key names and the tracer counts as HISTORY, and because it RUNS `tools/plancheck.mjs` (§3a as-built 4). */
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
 * satisfied it; it now runs plancheck and reads its report;
 * (9) make the `carried` classification unreachable (CONDUCT #15, 2026-09-23) -> A1b FAILS by
 * name (4355bfd's two paths read `dropped` again) and the "no UNREGISTERED historical drop"
 * arm FAILS, while e241672's real drop stays `dropped` — the proof containment is what
 * rescues 4355bfd, and that it rescues nothing that was really lost;
 * (10) M0-130: make `historicalRegister` read `origin/main` again instead of its pin -> the
 * planted-ref section's "the register's verdict is IDENTICAL whatever origin/main holds" arm
 * FAILS by name (a planted `origin/main` past the pin carries a dropped-edit merge), while the
 * "e241672's real drop is NOT carried" arm is held open — the proof the pin is what makes the
 * verdict a function of the tree. RUN 2026-09-23 (M0-130), arm 10 of `mergecarry.control.mjs`:
 * ARMED, suite exit 1 at 65 pass / 4 fail — the DECLARED identity arm failed by name, with "EXACTLY the
 * pinned corpus, 752 merges" (the shared `origin/main` had moved past the pin by then: the live-ref defect
 * itself, seen) and the two pin-catch arms; both held-open arms green; FOOT reached; `tools/mergecarry.mjs`
 * restored by sha256 66ba4a7aa444… and cmp; suite 69/0 after the restore.
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
import { auditMerge, carryAudit, historicalRegister, KNOWN_HISTORICAL_DROPS, REGISTER_PIN,
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
const SECTIONS = 15; /* 13 -> 14 2026-09-23 (CONDUCT #15): A1b, the `carried` class on the real 4355bfd.
                        14 -> 15 2026-09-23 (M0-130): the planted-ref section — the register reads its pin, not origin/main. */
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
section("A1b — A MERGE THAT KEPT MAIN'S BYTES, WHICH ALREADY HELD THE BRANCH'S CHANGE: carried, never failed.");
/* 4355bfd (CONDUCT #15's train, 2026-09-23): BOB #30's re-merge of three branches that had
   already landed in 8633310c, tree-identical. Before the `carried` class it read DROPPED and
   turned GitHub run #20 red on main. From the real commits, like A1. */
{
  const reachable = spawnSync("git", ["cat-file", "-e", "4355bfd"], { cwd: REPO }).status === 0;
  t("the real merge 4355bfd is reachable from this worktree", reachable, true);
  if (reachable) {
    const r = auditMerge({ repo: REPO, commit: "4355bfd" });
    const k = (path) => (r.sides[0].candidates.find((c) => c.path === path) || {}).klass;
    t("4355bfd: TREE-SHARING.md is CARRIED (the branch's change is in main's bytes), not dropped",
      k("docs/development/TREE-SHARING.md"), "carried");
    t("4355bfd: kickoffs/BOB.md is CARRIED, not dropped", k("docs/development/kickoffs/BOB.md"), "carried");
    t("4355bfd: nothing in it counts as dropped", r.counts.dropped, 0);
  }
  /* ...and the REAL drop stays one: the branch's change to check-refusal-codes.mjs is NOT in
     e241672's blob, so containment must not rescue it. */
  const r2 = auditMerge({ repo: REPO, commit: "e241672" });
  t("e241672's real drop is NOT carried — containment rescues only a change the merge holds",
    (r2.sides[0].candidates.find((c) => c.path === "civicos-ui/check-refusal-codes.mjs") || {}).klass, "dropped");
}

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
section("the historical register, graded in BOTH directions over the REAL corpus up to its PIN");
/* CORRECTED 2026-09-23 (M0-130), never exempted: this read `historicalRegister({ repo })`, whose range was
   `origin/main` — the LIVE remote ref — so its verdict moved with what had landed, not with the tree under
   test (GitHub run #20 on main; TREE-SHARING §3, "A GATE TEST DEPENDS ONLY ON THE CODE"). It now reads every
   merge reachable from `REGISTER_PIN`, named with its why in `tools/mergecarry.mjs`; the next section proves
   the verdict does not move with `origin/main`, and that the pinned arm still catches a drop inside its range. */
{
  const h = historicalRegister({ repo: REPO });
  console.log(`  corpus: ${h.merges} merge(s) reachable from the pin ${String(h.pin).slice(0, 8)} · ${h.dropped.length} dropped · `
    + `${h.counts.goneOnMain} goneOnMain · ${h.counts.moved} moved · ${h.counts.sameEnd} sameEnd`);
  t("the register reads the PINNED commit, never a ref name", [h.pin, /^[0-9a-f]{40}$/.test(h.pin)], [REGISTER_PIN, true]);
  /* FLOOR THE CORPUS. A totality assertion over an empty set has passed three times here. */
  t("the corpus is non-empty and large enough to mean something (>= 150 merges)", h.merges >= 150, true);
  /* EXACT, because the range is fixed: git objects are content-addressed, so the merges reachable from one
     commit are the same set in every clone. Measured 2026-09-23 at e62e08e1: 752. A different figure means
     the pin moved (move this with it) or this clone cannot see the pin's history (a shallow clone). */
  /* MOVED 2026-09-24 by c19-unionfix, 752 -> 889, with REGISTER_PIN (e62e08e1 -> b23f5c94, CONDUCT #19's ruling; its
     why is at the pin). The figure is this walk's own count from the new pin, and the move surfaced no `fresh` drop. */
  t("...and it is EXACTLY the pinned corpus, 889 merges, in every clone and on every day", h.merges, 889);
  t("no UNREGISTERED drop sits in main's history", h.fresh, []);
  t("no registered drop has quietly stopped being one", h.stale, []);
  /* CORRECTED 2026-09-14 (CONDUCT #9), 3 -> 4, never exempted: the pin exists so this list
     cannot become an exemption list, and it did its job — the fourth row (95e401b, the
     generated plane manifest at the D-334 x 0.58.0 merge) was found by THIS arm going red
     on origin/main, measured on the merged tree (fleetbundles 87/87: the surviving manifest
     is byte-identical to a fresh build), and registered with its why. The pin stays EXACT
     rather than relaxed to a floor, so the next row has to move it in the open too. */
  /* CORRECTED 2026-09-14 (CONDUCT #11), 4 -> 5, never exempted: the fifth row (cc8187d, REC-83's
     merge) was found by THIS arm going red on the merged tree - a declared drop whose
     `Dropped-from-branch:` line sat outside git's trailer block and so counted as undeclared,
     pushed before the message could be amended. Registered with its why; the pin stays EXACT. */
  /* CORRECTED 2026-09-23 (CONDUCT #15), 5 -> 4, never exempted: the `carried` class (BOB #30's design,
     GitHub run #20) finds that 95e401b's registered "drop" of bio-plane/dist/bio-plane.bundle.json
     was never one: the branch's change (bytes 14401 -> 16413, its sha256 line) is IN the merged blob
     (both added lines present, both removed lines absent; measured at the bytes). This file's own
     stale-register arm went red on it, which is the arm doing its job; the row came out. The pin
     stays EXACT. */
  /* CORRECTED 2026-09-24 (c19-unionfix, on CONDUCT #19's ruling), 4 -> 11, never exempted: plancheck's carry audit
     named seven undeclared drops in two pushed integration merges (ff7ed62, six paths; 8477cdb, IC-231.md). Each was
     diffed branch tip against merge and found SUPERSEDED, and each is registered with its why; the pin moved over them. */
  t("...and the register is the ELEVEN true drops the sweeps found, not a longer list",
    KNOWN_HISTORICAL_DROPS.length, 11);
  /* THE FALSE-POSITIVE CLAIM, AS A NUMBER RATHER THAN A PROMISE. Three findings over the
     whole of main's history is what earns this check its place in the gate; a check that
     cried wolf on a tenth of merges would be switched off within a week. */
  t("the finding rate over real history is under 5% of merges",
    (h.counts.dropped + h.counts.goneOnMain + h.counts.moved) / h.merges < 0.05, true);
}

/* ========================================================================== */
section("M0-130 — THE REGISTER'S VERDICT DOES NOT MOVE WITH origin/main, AND ITS PIN DOES NOT BLIND IT");
/* A scratch history with the register's shape: a DROPPED-EDIT merge INSIDE the pin (P1, which the arm must
   still catch — a pinned range whose arm is never shown to find a drop in it is how a liar passes) and a
   second dropped-edit merge PAST it (P2), which is what the planted `origin/main` carries. The arm is
   `historicalRegister` itself, called with the fixture's pin, so the control that points it back at
   `origin/main` breaks THIS section by name. Driven with the ref absent, at the pin, and past it: three
   states of the remote, one tree, one verdict. */
{
  const d = scratch();
  put(d, "A.md", `${BODY}\n`); put(d, "B.md", `${BODY}\n`); commit(d, "base");
  const dropEdit = (branch, file) => {
    g(d, "checkout", "-q", "-b", branch);
    put(d, file, `${BODY}\nBRANCH: ${branch}'s edit\n`); commit(d, `${branch} edits ${file}`);
    g(d, "checkout", "-q", "main");
    put(d, file, `${BODY}\nMAIN: a different edit to ${file}\n`); commit(d, `main edits ${file}`);
    if (merge(d, branch).status === 0) throw new Error(`expected a conflict on ${file} and got none`);
    g(d, "checkout", "--ours", "--", file); g(d, "add", file);
    g(d, "commit", "-q", "-m", `Merge ${branch} — took OURS on ${file}`);
    return g(d, "rev-parse", "HEAD");
  };
  const P1 = dropEdit("inside", "A.md");   /* the fixture's pin: a drop the arm MUST catch */
  const P2 = dropEdit("past", "B.md");     /* past the pin: what the planted origin/main carries */
  t("the planted ref really carries a dropped-edit merge (else the identity below costs nothing)",
    carryAudit({ repo: d, commit: P2 }).findings.map((f) => `${f.klass} ${f.path}`), ["dropped B.md"]);

  const verdictWith = (ref) => {
    if (ref) g(d, "update-ref", "refs/remotes/origin/main", ref);
    else spawnSync("git", ["update-ref", "-d", "refs/remotes/origin/main"], { cwd: d });
    const h = historicalRegister({ repo: d, pin: P1 });
    return JSON.stringify({ merges: h.merges, dropped: h.dropped, fresh: h.fresh, stale: h.stale, counts: h.counts });
  };
  const vAbsent = verdictWith(null), vPin = verdictWith(P1), vPast = verdictWith(P2);
  console.log(`  origin/main absent: ${vAbsent}\n  origin/main at pin: ${vPin}\n  origin/main planted past it: ${vPast}`);
  t("the register's verdict is IDENTICAL whatever origin/main holds (absent / the pin / a planted ref carrying a dropped-edit merge)",
    [vPin, vPast], [vAbsent, vAbsent]);
  const h = JSON.parse(vPast);
  t("...and the pinned arm still CATCHES the dropped-edit merge INSIDE its pinned range, by merge and path",
    h.fresh, [`${P1.slice(0, 7)}:A.md`]);
  t("...while the planted drop PAST the pin is not the pinned arm's to judge",
    h.dropped.includes(`${P2.slice(0, 7)}:B.md`), false);
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
