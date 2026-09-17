/* M0-48 — D-288's DETECTION half: work on this disk that reaches NOBODY.
 *
 * The subject is `tools/strandedwork.mjs` and the `plancheck` arm that runs it. The reason it
 * exists is a measurement, then a loss, then a sweep:
 *
 *   2026-08-10. 137 local `worktree-agent-*` branches, ZERO on the remote. The row was filed
 *   with a good disposition and nothing chased it for FIVE WEEKS, because `plancheck` fails an
 *   open debt row with NO disposition and this one HAD one — the estate's own watchdog was
 *   satisfied for the entire period the exposure was total.
 *
 *   2026-09-15. REC-91 finished, committed and released on its branch. Its integrator was
 *   stood down before merging. The work reached nobody for a day and was recovered only
 *   because Bob got a session onto the physical machine that held the disk.
 *
 *   2026-09-16, M-38. A sweep of all nine worktrees found FOUR live exposures in THREE
 *   distinct shapes — and the first row was M0-48's own worktree, two commits on no remote:
 *   the alarm for stranded work was itself stranded work while it was being built. Both times
 *   these exposures were found, the only instrument was somebody's curiosity. Twice in one
 *   hour.
 *
 * ---------------------------------------------------------------------------------------
 * WHY THE FIXTURE ENCODES SHAPES AND NOT M-38's TABLE, which is the sharpest thing this file
 * has to say. The obvious acceptance is *reproduce M-38's five rows*. **That table expired
 * within the hour it was written.** `a8eea05132b9aee1d` is named there as the canonical
 * over-strictness row — *"NOTHING — and this row is why the arm needs a third word"* — and
 * minutes later it read 9 modified tracked files with nothing committed. It had started
 * working. **It crossed into the third window with no commit, no push and no event anything
 * could hook.** A fixture pinned to that snapshot would assert a world that no longer exists
 * and would have to be re-pinned by hand every time a worker typed. So the arms below build
 * the SHAPES — each one a real repository with real `git worktree add`, a real bare remote and
 * real commits — and the live estate is walked separately and REPORTED rather than asserted.
 *
 * WHY THE ARMS ARE REAL GIT AND NOT FIXTURES. The subject is what git considers reachable and
 * what it reports as changed: ancestry against `origin/main`, ancestry against a remote ref,
 * `worktree list`'s own enumeration, and `status --porcelain`'s tracked/untracked split. Every
 * one is defined by what git DOES, and a fixture that hand-writes the classification it
 * expects agrees with the predicate for free — an equality that costs nothing to produce is
 * not evidence (CLAUDE.md). THE SCRATCH REPOSITORIES ARE UNDER `os.tmpdir()`, NEVER INSIDE THE
 * ESTATE — a worker once put a scratch worktree inside it and `op-claims.test.mjs` reported
 * 15,007 op mentions off a nested second copy — and section 1 asserts that rather than
 * trusting it.
 *
 * THE DEFEAT THIS SUITE IS DESIGNED AGAINST, because M0-48's acceptance names it: **the
 * cheapest way to make this green is a walk that matches nothing and congratulates itself.**
 * It is not hypothetical here — the predicate's first draft did exactly that (a `/bin/sh`
 * quoting bug swallowed by an `allowFail` path, reporting all-zero over seven branches), and
 * the FIRST SPECIFICATION did it a second way: a `worktree-agent-*` glob that cannot see
 * `rec111-unit-count-bound` or any `claude/*` session worktree, **and that would have passed
 * its own negative control, because a planted `worktree-agent-*` branch is exactly what the
 * glob does see.** A control that cannot fail for the population it misses. So:
 *   - S2/S3/S4 are the three windows DRIVEN, each asserted to be named IN ITS OWN WORDS.
 *   - S5 is the over-strictness arm: a genuinely idle worktree is NOT named.
 *   - S6 plants a branch whose name matches NO convention, which the original glob would miss.
 *   - S7 walks the real estate and asserts the walk is NON-EMPTY and that every unit was
 *     classified — an arm that found nothing here would satisfy everything above.
 *   - Every benign arm asserts the candidate set is non-empty in the same breath as asserting
 *     nothing was named, so "nothing stranded" can never be satisfied by "nothing looked at".
 *
 * NEGATIVE CONTROL: `node bio-plane/test/strandedwork.control.mjs` from the repo root — eight
 * arms plus an opening and a closing baseline, each armed ALONE against a uniquely-named
 * pristine copy in `.m048-harness/`, every restore verified by sha256 AND `cmp` AND a floored
 * byte count.
 *   (A1) `unpushed` classified as clear -> S2 fails: the naming path is what does the work.
 *   (A2) the `nothing committed past origin/main` exemption removed -> S5 fails: the quiet over
 *        an idle worktree is a JUDGEMENT and not an empty corpus.
 *   (A3) `onRemote` made sha-EQUALITY only -> S8 fails: a remote that is AHEAD reads as
 *        stranded and the arm starts crying wolf. OVER-STRICTNESS.
 *   (A4) `behind` collapsed into clear — D-288's literal name-presence reading -> S3 fails,
 *        which is the receipt for comparing the HEAD against the REMOTE REF.
 *   (A5) the worktree enumeration narrowed back to a `worktree-agent-*` name filter -> S6
 *        fails, which is the receipt for keying on what a worktree IS.
 *   (A6) the third window deleted -> S4 fails and S5 still passes: uncommitted work is a
 *        window of its own, and no push closes it.
 *   (A7) plancheck's arm unloadable -> S9 fails: the arm proving the GATE, not the library.
 *   (A8) plancheck's `warn(...)` promoted to `fail(...)` -> S9's never-FAIL and exit-0 arms
 *        fail, which is the consequence BOB #12's ruling forbids.
 */

import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard its own output */
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { strandedAudit, strandedMessage, worktrees, localBranches, remoteHeads,
         WINDOW_ORDER, WINDOWS } from "../../tools/strandedwork.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* The FOOT sentinel. A TypeError inside an assertion goes through no assertion at all and
   ends the module while the tally reads clean; this project has met that, and this suite met
   it during its own control run — which is why every indexed read below is `?.`. */
const SECTIONS = 10;
let reached = 0;
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "strandedwork-"));
const g = (repo, ...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();

let n = 0;
/* A working repository with a BARE repository standing in for `origin`, wired the way a real
   clone is — `origin/main` is a FETCHED tracking ref and not a local alias, because the
   predicate resolves `origin/main` and an alias would let it pass on a shape the estate does
   not have. */
function scratch() {
  const id = `r${++n}`;
  const bare = join(SANDBOX, `${id}.git`), work = join(SANDBOX, id);
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", bare], { encoding: "utf8" });
  execFileSync("git", ["init", "-q", "-b", "main", work], { encoding: "utf8" });
  for (const [k, v] of [["user.name", "m0-48"], ["user.email", "m0-48@example.invalid"],
                        ["commit.gpgsign", "false"]]) g(work, "config", k, v);
  g(work, "remote", "add", "origin", bare);
  writeFileSync(join(work, "base.md"), "base\n");
  g(work, "add", "-A"); g(work, "commit", "-q", "-m", "base");
  g(work, "push", "-q", "origin", "main");
  g(work, "fetch", "-q", "origin");
  return { work, bare, id };
}
/* A real linked worktree on its own branch — the unit under test. */
function addWorktree(root, branch, { commits = 0, push = false } = {}) {
  const path = join(SANDBOX, `${branch}-wt`);
  g(root, "worktree", "add", "-q", "-b", branch, path, "main");
  for (let i = 0; i < commits; i++) {
    writeFileSync(join(path, `c${i}.md`), `commit ${i} of ${branch}\n`);
    g(path, "add", "-A"); g(path, "commit", "-q", "-m", `${branch} commit ${i}`);
  }
  if (push) { g(path, "push", "-q", "origin", branch); g(root, "fetch", "-q", "origin"); }
  return path;
}
const A = (work, opts = {}) => strandedAudit({ repo: work, network: true, ...opts });
const named = (a) => a.exposed.map((u) => u.name).sort();
const windowsOf = (a, name) => (a.all.find((u) => u.name === name) || {}).windows;

/* ========================================================================== */
section("1 — the sandbox is outside the estate, and that is asserted rather than assumed");
{
  const root = g(REPO, "rev-parse", "--show-toplevel");
  t("the scratch root is NOT under the repository", SANDBOX.startsWith(root + "/"), false);
  t("...and the repository root is a real path", existsSync(join(root, "CLAUDE.md")), true);
  t("the three windows are declared once and ordered", WINDOW_ORDER,
    ["unpushed", "behind", "uncommitted"]);
  /* The two push-windows share a VERB and must not share a SENTENCE — a reader told the same
     thing twice learns the distinction is decorative. The third must never say push. */
  t("...each carries its own NEXT ACT, and the third is not a push",
    WINDOW_ORDER.map((w) => WINDOWS[w].act.split(" ")[0]), ["PUSH", "PUSH", "COMMIT"]);
  t("...and the two push-windows give DIFFERENT reasons, not one sentence twice",
    WINDOWS.unpushed.act === WINDOWS.behind.act, false);
  t("...and no window's act is empty", WINDOW_ORDER.every((w) => WINDOWS[w].act.length > 30), true);
}

/* ========================================================================== */
section("2 — WINDOW 1, NEVER PUSHED. M-38's first row, and the state M0-48 was itself in "
      + "while it was being built.");
{
  const { work } = scratch();
  addWorktree(work, "w-unpushed", { commits: 2 });
  const a = A(work);
  t("the worktree is NAMED", named(a).includes("w-unpushed-wt"), true);
  t("...in the `unpushed` window and no other", windowsOf(a, "w-unpushed-wt"), ["unpushed"]);
  t("...with the count of commits at risk", a.exposed.find((u) => u.name === "w-unpushed-wt")?.ahead, 2);
  t("...and the walk actually looked at more than it named", a.all.length > 1, true);
  const msg = strandedMessage(a);
  t("the MESSAGE uses this window's own words", msg.includes("NEVER PUSHED"), true);
  t("...and gives the act that closes it", msg.includes("PUSH IT"), true);
  t("...and never claims a push helps the other window", msg.includes("COMMIT FIRST"), false);
}

/* ========================================================================== */
section("3 — WINDOW 2, PUSHED THEN BEHIND. D-288's literal `present on the remote` calls this "
      + "healthy; both HEADs M-38 caught this way ended in a `release the claim` commit.");
{
  const { work } = scratch();
  const p = addWorktree(work, "w-behind", { commits: 1, push: true });
  writeFileSync(join(p, "after.md"), "committed AFTER the push\n");
  g(p, "add", "-A"); g(p, "commit", "-q", "-m", "the commit that reaches nobody");
  g(p, "clean", "-qfd");
  const a = A(work);
  t("the branch IS on the remote by name", typeof a.all.find((u) => u.name === "w-behind-wt")?.remoteSha, "string");
  t("...and the worktree is NAMED anyway", named(a).includes("w-behind-wt"), true);
  t("...in the `behind` window, distinct from `unpushed`", windowsOf(a, "w-behind-wt"), ["behind"]);
  const msg = strandedMessage(a);
  t("the message says the remote HAS the branch but not these commits",
    msg.includes("PUSHED, THEN BEHIND"), true);
  t("...and tells the reader it only LOOKS backed up", msg.includes("only looks backed up"), true);
}

/* ========================================================================== */
section("4 — WINDOW 3, UNCOMMITTED. Only a worktree has this window, and NO PUSH CLOSES IT — "
      + "which is why the unit is the worktree and not the branch.");
{
  const { work } = scratch();
  const p = addWorktree(work, "w-dirty", { commits: 0 });
  writeFileSync(join(p, "base.md"), "base\nMODIFIED, tracked, uncommitted\n");
  writeFileSync(join(p, "scratch.log"), "untracked\n");
  const a = A(work);
  t("the worktree is NAMED although its tip is exactly origin/main",
    named(a).includes("w-dirty-wt"), true);
  t("...in the `uncommitted` window alone — there is nothing to push",
    windowsOf(a, "w-dirty-wt"), ["uncommitted"]);
  const u = a.exposed.find((x) => x.name === "w-dirty-wt");
  t("...with MODIFIED and UNTRACKED counted SEPARATELY and never merged",
    [u?.tree?.modified, u?.tree?.untracked], [1, 1]);
  t("...and nothing committed past origin/main, which is the whole point", u?.ahead, 0);
  const msg = strandedMessage(a);
  t("the message gives the only act that helps", msg.includes("COMMIT FIRST"), true);
  t("...and reports the counts rather than judging scratch-versus-work",
    /1 modified, 1 untracked/.test(msg), true);
  t("...and does NOT tell the reader to push, which would not help",
    /NEVER PUSHED|PUSHED, THEN BEHIND/.test(msg), false);
}

/* ========================================================================== */
section("5 — THE OVER-STRICTNESS ARM, and it decides whether this survives contact. A "
      + "genuinely idle worktree must NOT be named.");
{
  const { work } = scratch();
  addWorktree(work, "w-idle", { commits: 0 });
  const a = A(work);
  t("an idle worktree is NOT named", named(a).includes("w-idle-wt"), false);
  t("...and it was WALKED, so the silence is a judgement and not an empty corpus",
    a.all.some((u) => u.name === "w-idle-wt"), true);
  t("...carrying no windows at all", windowsOf(a, "w-idle-wt"), []);
  t("nothing in the whole scratch estate is named", a.exposed.length, 0);

  /* THE EXEMPTION IS EVALUATED ON THE STATE, NEVER INFERRED FROM THE TIP. M-38 named this
     exact shape as the canonical row that must stay silent; minutes later the same worktree
     held 9 modified tracked files with nothing committed. It crossed the line with no commit,
     no push and no event anything could hook — so an implementation that exempted on
     `0 commits`, or cached the verdict, would go blind on the row it was told to protect. */
  const p = join(SANDBOX, "w-idle-wt");
  writeFileSync(join(p, "base.md"), "base\nit started working\n");
  const b = A(work);
  t("...and the MOMENT it starts working, with no commit and no push, it IS named",
    named(b).includes("w-idle-wt"), true);
  t("...in the third window", windowsOf(b, "w-idle-wt"), ["uncommitted"]);
  t("...which is a re-read of the STATE, not a cached verdict from the tip",
    b.all.find((u) => u.name === "w-idle-wt")?.ahead, 0);
}

/* ========================================================================== */
section("6 — THE POPULATION, NOT THE SPELLING. A branch named nothing like a convention must "
      + "be seen; the first specification's glob would have missed it AND passed its control.");
{
  const { work } = scratch();
  addWorktree(work, "rec102-tier3-layer-parts", { commits: 1 });
  addWorktree(work, "claude/objective-elgamal-295877", { commits: 1 });
  const a = A(work);
  t("a `rec*`-style branch is seen", named(a).includes("rec102-tier3-layer-parts-wt"), true);
  /* Asserted on the WORKTREE, not merely on the branch. The control's A5 arm — which narrows
     the worktree enumeration back to the first specification's glob — showed why: with the
     worktree filtered out, its branch reappears through the ORPHAN-BRANCH pass and the arm
     still sees SOMETHING. That backstop is real and worth having, but an assertion satisfied
     by it cannot tell a working enumeration from a broken one. */
  t("...and a `claude/*` session worktree is seen too, AS A WORKTREE",
    named(a).includes("objective-elgamal-295877-wt"), true);
  t("...neither matching `worktree-agent-*`, which is the glob that would have gone quiet",
    a.exposed.every((u) => !u.branch?.startsWith("worktree-agent-")), true);

  /* Pass B — a branch that OUTLIVES its worktree. REC-91's exact shape: the worktree is
     reaped, the branch remains, and the commits are still on no remote. */
  const p = join(SANDBOX, "rec102-tier3-layer-parts-wt");
  g(work, "worktree", "remove", "--force", p);
  const b = A(work);
  t("a branch whose worktree was REAPED is still judged",
    b.orphans.some((u) => u.branch === "rec102-tier3-layer-parts"), true);
  t("...and still named", named(b).includes("rec102-tier3-layer-parts"), true);
  t("...as `unpushed`, with no third window because it has no working tree",
    windowsOf(b, "rec102-tier3-layer-parts"), ["unpushed"]);
}

/* ========================================================================== */
section("7 — THE REAL ESTATE. The predicate must actually walk this clone; an arm that found "
      + "nothing here would satisfy every assertion above.");
{
  const a = strandedAudit({ repo: REPO, network: false });
  t("this clone has worktrees to judge", a.units.length > 0, true);
  t("...and the primary worktree is among them", a.units.some((u) => u.primary), true);
  t("...every unit got a windows array, none fell through",
    a.all.filter((u) => !Array.isArray(u.windows)).length, 0);
  t("...only the three declared windows are ever produced",
    [...new Set(a.all.flatMap((u) => u.windows))].filter((w) => !WINDOW_ORDER.includes(w)), []);
  t("...`origin/main` resolved, so the ancestry test was really applied", a.mainResolved, true);
  t("...and the walk is reported as having SUCCEEDED, not merely as empty", a.walkFailed, false);
  /* REPORTED, NOT ASSERTED. Whether this estate is clean is not something the instrument is
     entitled to an opinion about, and M-38's table expired in an hour — pinning a figure here
     would be pinning a snapshot. What IS asserted is that it looked. */
  console.log(`  note  live estate: ${JSON.stringify(a.counts)} (reported, not asserted — the`
            + ` population moves and inherited state is not a defect)`);

  /* THE RECEIPT FROM THIS MODULE'S OWN FIRST DRAFT, turned into an arm. It shelled out through
     `execSync`, `--format=%(refname:short)` was a /bin/sh syntax error, the failure was
     swallowed, and the audit reported all-zero over an estate holding seven branches. A FAILED
     enumeration must be a DISTINCT state and never an empty one. */
  const nowhere = strandedAudit({ repo: SANDBOX, network: false });
  t("a walk that could not enumerate says so", nowhere.walkFailed, true);
  t("...and an empty list therefore means `nothing found` and nothing else", nowhere.all.length, 0);
  t("...which a caller can tell apart from a clean estate",
    a.walkFailed === nowhere.walkFailed, false);
}

/* ========================================================================== */
section("8 — THE REMOTE IS ASKED, THE CACHE IS NOT TRUSTED. A remote that is AHEAD is not "
      + "stranding; a pruned remote is, and only `ls-remote` can tell.");
{
  const { work, bare } = scratch();
  const p = addWorktree(work, "w-remote", { commits: 1, push: true });
  /* Another clone pushes more onto the same branch. The local HEAD is an ancestor of the
     remote's, so nothing is stranded — a sha-equality test would cry wolf here. */
  const other = join(SANDBOX, "otherclone");
  execFileSync("git", ["clone", "-q", bare, other], { encoding: "utf8" });
  for (const [k, v] of [["user.name", "x"], ["user.email", "x@y.invalid"]]) g(other, "config", k, v);
  g(other, "checkout", "-q", "w-remote");
  writeFileSync(join(other, "more.md"), "more\n");
  g(other, "add", "-A"); g(other, "commit", "-q", "-m", "someone else pushed more");
  g(other, "push", "-q", "origin", "w-remote");
  g(work, "fetch", "-q", "origin");
  const ahead = A(work);
  t("a remote that is AHEAD is NOT stranding", named(ahead).includes("w-remote-wt"), false);
  t("...and the shas genuinely differ, so this arm is not vacuous",
    ahead.all.find((u) => u.name === "w-remote-wt")?.head
      !== ahead.all.find((u) => u.name === "w-remote-wt")?.remoteSha, true);

  /* CONDUCT deletes the remote branch when it merges the item — D-288 item 3 / M0-49. The
     local clone is NOT pruned, which is what a plain `git fetch` does. */
  g(bare, "update-ref", "-d", "refs/heads/w-remote");
  const live = A(work, { network: true });
  const cached = A(work, { network: false });
  t("D1 ls-remote sees the branch is GONE and names the worktree",
    named(live).includes("w-remote-wt"), true);
  t("D1 ...and reports which evidence it used", live.source, "ls-remote");
  t("D2 the un-pruned tracking ref STILL says pushed — the stale answer, driven",
    named(cached).includes("w-remote-wt"), false);
  t("D2 ...and the audit says the evidence was a cache, never presenting it as measured",
    cached.source, "tracking-refs");
  t("D2 ...and `--local` is a CHOICE, not a degradation", cached.degraded, false);
  t("D2 the tracking ref really is still present, so D2 measures staleness and not a bug",
    remoteHeads({ repo: work, network: false }).map.has("w-remote"), true);
  void p;
}

/* ========================================================================== */
section("9 — THE GATE. `plancheck` must actually RUN this and must NOT fail on it. A library "
      + "nobody calls is not a mechanism.");
/* Driven by RUNNING plancheck and reading its report, never by grepping its source:
   mergecarry's equivalent arm grepped, and a COMMENT satisfied it. */
{
  const r = spawnSync(process.execPath, ["tools/plancheck.mjs", "--local"],
                      { cwd: REPO, encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  t("plancheck reports the stranded-work walk in its notes",
    /note {2}stranded work:/.test(out), true);
  t("...naming the counts it judged rather than only a verdict",
    /stranded work: \d+ worktree\(s\)/.test(out), true);
  t("the finding is a WARN, never a FAIL — BOB #12's ruling, and the arm that pins it",
    /FAIL {2}STRANDED WORK/.test(out), false);
  t("...and plancheck --local exits 0", r.status, 0);
}

/* ========================================================================== */
section("10 — THE MECHANISM IS IN THE LOOP THE READER ACTUALLY RUNS");
/* CLAUDE.md: a mechanism that is not in the loop the reader runs is not a mechanism. Both
   readers of this one already run `plancheck` — WORKER.md step 4, CONDUCT.md step 1 — which is
   why this item adds no step to either file. Asserted from the COMMIT, not the working tree. */
{
  const worker = g(REPO, "show", "HEAD:docs/development/kickoffs/WORKER.md");
  const conduct = g(REPO, "show", "HEAD:docs/development/kickoffs/CONDUCT.md");
  t("WORKER.md runs plancheck", /plancheck/.test(worker), true);
  t("...and tells the worker to PUSH (D-288 item 1, the PREVENTION half)", /push/i.test(worker), true);
  t("CONDUCT.md runs plancheck too", /plancheck/.test(conduct), true);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`strandedwork: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
