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
 *   - S11 pushes a branch under a DIFFERENT NAME and requires silence, because **an arm that
 *     pushes under the SAME name cannot tell the fixed predicate from the broken one** — the
 *     broken one is silent there too (CONDUCT #2, 2026-09-17). Its twin in the same run is a
 *     genuinely uncarried tree that must still be NAMED, or the false positive has been traded
 *     for a false negative in the direction that loses work.
 *   - Every benign arm asserts the candidate set is non-empty in the same breath as asserting
 *     nothing was named, so "nothing stranded" can never be satisfied by "nothing looked at".
 *
 * NEGATIVE CONTROL: `node bio-plane/test/strandedwork.control.mjs` from the repo root — NINE
 * arms plus an opening and a closing baseline, each armed ALONE against a uniquely-named
 * pristine copy in `.m048-harness/`, every restore verified by sha256 AND `cmp` AND a floored
 * byte count.
 *   (A1) `unpushed` classified as clear -> S2 fails: the naming path is what does the work.
 *   (A2) the `nothing committed past origin/main` exemption removed -> S5 fails: the quiet over
 *        an idle worktree is a JUDGEMENT and not an empty corpus.
 *   (A3) `carriedBy`'s ancestry fallback made sha-EQUALITY only -> S8 fails: a remote that is
 *        AHEAD reads as stranded and the arm starts crying wolf. OVER-STRICTNESS. It armed
 *        `onRemote` until 2026-09-17, when the fix that added `carriedBy` left `onRemote` read
 *        by no window — **the arm went on matching once and reporting ARMED while S8 stayed
 *        green.** A control arm is coupled to WHERE the behaviour lives.
 *   (A4) `behind` collapsed into clear — D-288's literal name-presence reading -> S3 fails,
 *        which is the receipt for comparing the HEAD against the REMOTE REF.
 *   (A5) the worktree enumeration narrowed back to a `worktree-agent-*` name filter -> S6
 *        fails, which is the receipt for keying on what a worktree IS.
 *   (A6) the third window deleted -> S4 fails and S5 still passes: uncommitted work is a
 *        window of its own, and no push closes it.
 *   (A7) plancheck's arm unloadable -> S9 fails: the arm proving the GATE, not the library.
 *   (A8) plancheck's `warn(...)` promoted to `fail(...)` -> S9's never-FAIL and exit-0 arms
 *        fail, which is the consequence BOB #12's ruling forbids.
 *   (A9) the carrier walk reverted to a lookup by BRANCH NAME -> S11 fails and its
 *        over-strictness twin does NOT. The spelling defect as the estate actually had it.
 *   (A10) BOB #29, 2026-09-23, RUN BY HAND: plancheck's `stateFail` made `fail` unconditionally
 *        (coord state deciding the tree's verdict again) -> S9's planted-coord arms fail by name,
 *        "a coord finding is REPORTED under --local…" and "…plancheck --local exits 0 over a tree
 *        whose only defect is coord's state": 89 pass / 2 fail; restored by `cp`, sha256
 *        95c986df… before and after, `cmp` identical; the plant took in both runs.
 *   (A11) D-569, 2026-09-25, RUN BY HAND: plancheck's UNPUSHED routing reverted to `fail()` unconditionally
 *        (the defect) -> "D-569: plancheck routes a NOTE grade to notes, not to fail()" fails by name, alone;
 *        93 pass / 1 fail, exit 1 (baseline 94 / 0). Restored by `cp`, `cmp` identical, sha256 4f624ba0… before and after.
 *
 * M0-49 ADDS TWO ARMS TO SECTION 10, AND THEY ARE DRIVEN BY HAND RATHER THAN BY THE DRIVER
 * ABOVE, because their subject is a COMMITTED document and `g(REPO, "show", "HEAD:…")` cannot
 * see a working-tree edit. Both were RUN on 2026-09-17; the method is recorded beside the
 * result because the obvious way to re-drive it gives a confident wrong answer:
 *   (B1) the PRUNE-ON-MERGE step deleted from `kickoffs/CONDUCT.md` and COMMITTED -> the four
 *        key arms and the positional arm fail. Presence is real.
 *   (B2) the step MOVED, byte-for-byte, from the integration sequence to the end of the file
 *        and committed -> **only the positional arm fails, every key arm still passes.** This
 *        is the arm that matters: the row's point is WHERE the step lives, and without B2 the
 *        positional arm could be passing for free alongside the presence arms.
 *   METHOD, and it is the trap in CLAUDE.md: restore by `cp` from a copy taken aside, NEVER by
 *   `git checkout --`, which restores to HEAD and silently discards uncommitted work; undo the
 *   temporary commit with `git reset --soft HEAD~1` (never `--hard`, which is denied outright)
 *   and verify the restore by sha256 rather than by the absence of a complaint.
 */

import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard its own output */
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
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
const SECTIONS = 11;
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
    /note {2}stranded work \[/.test(out), true);
  t("...naming the counts it judged rather than only a verdict",
    /\d+ worktree\(s\) \+ \d+ branch\(es\)/.test(out), true);
  t("the finding is a WARN, never a FAIL — BOB #12's ruling, and the arm that pins it",
    /FAIL {2}STRANDED WORK/.test(out), false);
  t("...and plancheck --local exits 0", r.status, 0);

  /* THE EXIT-0 ARM ABOVE MUST NOT MOVE WITH LIVE `coord` STATE (Bob, 2026-09-23; TREE-SHARING §3 (c)). It went RED
     twice on GitHub (land/conduct/batch6, runs 6 and 7) while the tree was unchanged and passed here 88/0: plancheck
     read coord's BACKLOG.md 381 B over a budget and FAILed P5, and a gate record is keyed by the TREE (D-293). The
     arm itself was right — this suite's finding must never FAIL plancheck — and what was wrong was plancheck letting a
     coord finding decide a tree's verdict; that is fixed in plancheck's `stateFail`, and these arms pin it by PLANTING
     an over-budget coord (BIO_COORD_REF) and driving plancheck --local against it. */
  const coordTip = (() => { try { return g(REPO, "rev-parse", "--verify", "--quiet", "origin/coord^{commit}"); } catch { return ""; } })();
  if (!coordTip) {
    console.log("  NOTE  origin/coord does not resolve on this clone, so the planted-coord arms have nothing to plant from (fetch coord)");
    t("origin/coord resolves, so the planted-coord arms can run", false, true);
  } else {
    const planted = `refs/bio-test/coord-overbudget-${process.pid}`;
    const idx = join(SANDBOX, "planted.index");
    const env = { ...process.env, GIT_INDEX_FILE: idx };
    const gi = (...args) => execFileSync("git", args, { cwd: REPO, encoding: "utf8", env }).trim();
    const backlog = "docs/development/BACKLOG.md";
    try {
      gi("read-tree", `${coordTip}^{tree}`);
      const body = execFileSync("git", ["show", `${coordTip}:${backlog}`], { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 26 });
      const pad = `${body}\n<!-- planted by strandedwork.test.mjs: ${"x".repeat(240 * 1024)} -->\n`;
      const blob = execFileSync("git", ["hash-object", "-w", "--stdin"], { cwd: REPO, input: pad, encoding: "utf8" }).trim();
      gi("update-index", "--cacheinfo", `100644,${blob},${backlog}`);
      const tree = gi("write-tree");
      const commit = execFileSync("git", ["commit-tree", tree, "-p", coordTip, "-m", "planted: BACKLOG.md over every budget"],
        { cwd: REPO, encoding: "utf8", env: { ...env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@invalid", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@invalid" } }).trim();
      g(REPO, "update-ref", planted, commit);
      const p = spawnSync(process.execPath, ["tools/plancheck.mjs", "--local"],
        { cwd: REPO, encoding: "utf8", env: { ...process.env, BIO_COORD_REF: planted } });
      const po = `${p.stdout || ""}${p.stderr || ""}`;
      t("the plant took: plancheck read the planted coord and found P5 violated",
        /PIPELINE INVARIANT P5/.test(po), true);
      t("a coord finding is REPORTED under --local, as a WARN naming why, never as a FAIL",
        [/WARN {2}\[coord state — reported, never this tree's verdict under --local[^\n]*PIPELINE INVARIANT P5/.test(po),
         /FAIL {2}PIPELINE INVARIANT/.test(po)], [true, false]);
      t("...so plancheck --local exits 0 over a tree whose only defect is coord's state", p.status, 0);
    } finally {
      try { g(REPO, "update-ref", "-d", planted); } catch { /* absent already */ }
    }
  }

  /* THE VANTAGE ARMS. Two sessions went to the artifact on 2026-09-17 and reached opposite
     answers about one worktree, because this file's arm is ESTATE-WIDE and plancheck's
     `UNPUSHED` arm is LOCAL-HEAD, and neither output said so. Nothing about being careful
     prevents that — only the instrument declaring where it was standing does. */
  t("the estate-wide arm DECLARES its scope in the line it always prints",
    /stranded work \[SCOPE: ESTATE-WIDE/.test(out), true);
  t("...naming the unit that scope covers, not merely the word",
    /ESTATE-WIDE, every worktree on this clone\]/.test(out), true);

  /* THE LOCAL-HEAD ARM CANNOT BE DRIVEN FROM HERE and the limit is STATED rather than papered
     over: it fires only on a tree that is ahead of `origin/main`, `plancheck` resolves its root
     from its own location so it cannot be pointed at a scratch repo, and an assertion that
     depends on whether THIS checkout happens to be ahead is an arm that passes for free. So it
     is read from the SOURCE — which section 9 otherwise forbids, because mergecarry's
     equivalent arm grepped and A COMMENT SATISFIED IT.

     The guard against exactly that: the marker must sit on a line that is part of the EMITTED
     TEMPLATE — a line carrying a backtick — which a block-comment line cannot be. The working
     tree is read rather than the committed blob, because a change is uncommitted at the moment
     the suite that proves it runs. The estate-wide half above is DRIVEN and needs none of
     this. */
  const src = readFileSync(join(REPO, "tools/plancheck.mjs"), "utf8");
  const emitted = (marker) => src.split("\n")
    .some((l) => l.includes(marker) && l.includes("`"));
  t("the local-head arm declares ITS scope too", src.includes("SCOPE: THIS CHECKOUT ONLY"), true);
  t("...in EMITTED text and not merely in a comment, which is how the equivalent arm was "
  + "satisfied for free elsewhere", emitted("SCOPE: THIS CHECKOUT ONLY"), true);
  t("...and points the reader at the estate-wide arm rather than leaving the gap",
    /says nothing[\s\S]{0,160}STRANDED WORK arm is the estate-wide one/.test(src), true);
  t("...and the two scopes are DIFFERENT words, so a reader cannot read one as the other",
    src.includes("SCOPE: ESTATE-WIDE") && src.includes("SCOPE: THIS CHECKOUT ONLY"), true);

  /* D-569: THE LOCAL-HEAD ARM'S GRADE IS ITS OWN TEXT'S — "a failure on main and a note anywhere else". It called
     `fail()` on every branch, so no worker's pushed `land/` branch could read 0 fail. The grade is `unpushedGrade`
     (driven over real git in `unpushedgrade.test.mjs`, which stays cacheable because it does not name this gate);
     what only the SOURCE can show, for the reason stated above, is that the gate ROUTES by it. Read from the arm's
     own span, so a `fail(` elsewhere in plancheck is not this arm's. */
  const arm = src.slice(src.indexOf('const ahead = sh("git rev-list --count origin/main..HEAD")'),
                        src.indexOf("warn(`local main is behind origin/main"));
  t("D-569: the UNPUSHED arm's span was found", arm.length > 200 && arm.includes("UNPUSHED —"), true);
  t("D-569: plancheck grades UNPUSHED by strandedwork's unpushedGrade",
    /import\("\.\/strandedwork\.mjs"\)/.test(arm) && /unpushedGrade\(\{ branch, head \}\)/.test(arm), true);
  t("D-569: plancheck routes a NOTE grade to notes, not to fail()",
    /if \(graded\.grade === "note"\) notes\.push\(/.test(arm) && !/^\s*fail\(`UNPUSHED/m.test(arm), true);
}

/* ========================================================================== */
section("10 — THE MECHANISM IS IN THE LOOP THE READER ACTUALLY RUNS");
/* CLAUDE.md: a mechanism that is not in the loop the reader runs is not a mechanism. Both
   readers of this one already run `plancheck` — WORKER.md step 4, CONDUCT.md step 1 — which is
   why M0-48 added no step to either file. Asserted from the COMMIT, not the working tree.

   CORRECTED 2026-09-17 by M0-49, and the old wording is wrong rather than merely narrow: it
   read "this ITEM adds no step", which was true of M0-48's DETECTION half and was then read as
   a property of D-288. D-288 item 3 — PRUNE-ON-MERGE — IS a step, in CONDUCT.md's integration
   sequence, and it is what MAINTAINS the signal the detector above reads. M0-48 landed an arm
   that judges a remote branch list; nothing kept that list meaningful. So this section now
   covers both halves, and the keys below were each measured at ZERO occurrences in CONDUCT.md
   before the change — `prune`, the obvious key, was already in the file three times over the
   worktree-removal section and would have been an assertion that costs nothing to satisfy. */
{
  const worker = g(REPO, "show", "HEAD:docs/development/kickoffs/WORKER.md");
  const conduct = g(REPO, "show", "HEAD:docs/development/kickoffs/CONDUCT.md");
  t("WORKER.md runs plancheck", /plancheck/.test(worker), true);
  t("...and tells the worker to PUSH (D-288 item 1, the PREVENTION half)", /push/i.test(worker), true);
  t("CONDUCT.md runs plancheck too", /plancheck/.test(conduct), true);

  /* D-288 item 3 (M0-49). Keyed on the ACT — the command — and not on the word "prune". */
  t("CONDUCT.md carries PRUNE-ON-MERGE, the act and not only the intention",
    /git push origin --delete/.test(conduct), true);
  t("...attributed to the ruling it implements, so the step is not free-floating advice",
    /D-288 item 3/.test(conduct), true);
  t("...and verified from the REMOTE, the same discipline the worker owes on the way in",
    /ls-remote --heads origin/.test(conduct), true);

  /* WHERE it sits is the half CLAUDE.md's rule is actually about: a step in an appendix is
     documentation, and the reader performing the integration never reaches it. Positional, so
     moving the step out of the sequence FAILS even though every key above still matches. */
  {
    const stepTwo   = conduct.indexOf("2. **When a worker reports:");
    const stepThree = conduct.indexOf("3. **Enqueue decompositions from BOB**");
    const prune     = conduct.indexOf("git push origin --delete");
    t("step 2 and step 3 both located, so the positional arm is measuring something",
      stepTwo > 0 && stepThree > stepTwo, true);
    t("PRUNE-ON-MERGE is INSIDE the integration sequence, not filed elsewhere in the file",
      prune > stepTwo && prune < stepThree, true);
  }

  /* The two acts must stay separate at the site. Pruning a REMOTE BRANCH destroys nothing once
     the merge is pushed; REMOVING A WORKTREE can take a live worker's uncommitted tree. */
  t("...and the step refuses to read as licence for worktree removal",
    /LICENCE TO REMOVE THE WORKTREE/.test(conduct), true);

  /* The hazard M0-49 was told to state beside the ancestry criterion. The measurement is that
     ancestry called six LIVE workers prunable — a positively wrong answer, not an unknown. */
  {
    const disk     = conduct.indexOf("WHEN THE DISK FORCES YOUR HAND");
    const prunable = conduct.indexOf("prunable");
    t("the disk-pressure section is located", disk > 0, true);
    t("the started-worker hazard is stated BESIDE the ancestry criterion it defeats",
      prunable > disk, true);
    t("...and ancestry is named as necessary-never-sufficient rather than as the criterion",
      /NECESSARY AND NEVER\s+SUFFICIENT/.test(conduct), true);
  }
}

/* ========================================================================== */
section("11 — REACHABILITY, NOT THE SPELLING. Work pushed under a DIFFERENT branch name is "
      + "NOT stranded, and the arm that proves it is the one that pushes under a different "
      + "name — an arm that pushes under the SAME name cannot tell the fixed predicate from "
      + "the broken one, because the broken one goes quiet there too (CONDUCT #2).");
{
  const { work } = scratch();
  /* The estate's real shape, 2026-09-17: an integrator's worktree on `claude/…`, its HEAD
     pushed to a WIP branch under another name entirely. Reported as NEVER PUSHED for a day. */
  const p = addWorktree(work, "claude-session-tree", { commits: 3 });
  g(p, "push", "-q", "origin", "HEAD:conduct-wip-20260917");
  g(work, "fetch", "-q", "origin");

  const a = A(work);
  const u = a.all.find((x) => x.name === "claude-session-tree-wt");
  t("the work IS past main, so the unit was really examined", u?.ahead, 3);
  t("...and NO remote ref shares its branch name", u?.remoteSha, null);
  t("THE DEFECT: it is NOT named as stranded", named(a).includes("claude-session-tree-wt"), false);
  t("...in NO window at all", u?.windows, []);
  /* The quiet must be a JUDGEMENT rather than an empty walk — the header's own rule about
     never reporting an idle worktree as clean, applied to this verdict. */
  t("...and the carrier is IDENTIFIED, so the silence is a finding not an omission",
    u?.carrier?.ref, "conduct-wip-20260917");
  t("...and reported in the counts the caller prints", a.counts.carriedElsewhere >= 1, true);

  /* THE OVER-STRICTNESS TWIN. Without this the false positive has simply been traded for a
     false NEGATIVE, which is the direction that LOSES WORK. Same repo, same run. */
  addWorktree(work, "genuinely-stranded", { commits: 2 });
  const b = A(work);
  t("a tree NO ref carries is still NAMED", named(b).includes("genuinely-stranded-wt"), true);
  t("...in the `unpushed` window", windowsOf(b, "genuinely-stranded-wt"), ["unpushed"]);
  t("...and the carried tree is STILL silent in the same run, so the two are discriminated",
    named(b).includes("claude-session-tree-wt"), false);
  t("...so the message names exactly one of them",
    (strandedMessage(b).match(/-wt /g) || []).length, 1);

  /* The remedy line is the dangerous half: a reader acting on a false NEVER-PUSHED publishes
     a live integrator's ungated tree under a second name — a strand MANUFACTURED by the
     detector. Pinned so a regression is reported in the words that say why it matters. */
  t("the remedy the reader would have acted on is still the push instruction",
    WINDOWS.unpushed.act.includes("git push origin HEAD:"), true);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`strandedwork: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
