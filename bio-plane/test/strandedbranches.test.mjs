/* M0-48 — D-288's DETECTION half: a local worker branch whose commits exist NOWHERE ELSE.
 *
 * The subject is `tools/strandedbranches.mjs` and the `plancheck` arm that runs it. The
 * reason it exists is a measurement and then a loss:
 *
 *   2026-08-10. 137 local `worktree-agent-*` branches, ZERO on the remote. The row was
 *   filed with a good disposition and nothing chased it for FIVE WEEKS, because `plancheck`
 *   fails an open debt row with NO disposition and this one HAD one — the estate's own
 *   watchdog was satisfied for the entire period the exposure was total.
 *
 *   2026-09-15. REC-91 finished, committed and released on `worktree-agent-aabecaced11e00db1`.
 *   Its integrator was stood down before merging. The work reached nobody for a day and was
 *   recovered only because Bob got a session onto the physical machine that held the disk.
 *
 * WHY THE ARMS BUILD REAL REPOSITORIES WITH A REAL REMOTE. The subject is what GIT
 * considers reachable — ancestry against `origin/main`, ancestry against a remote ref, and
 * what `ls-remote` says versus what `refs/remotes` remembers. Every one of those is defined
 * by what git DOES, and a fixture that hand-writes the classification it expects agrees
 * with the predicate for free: an equality that costs nothing to produce is not evidence
 * (CLAUDE.md). So each arm runs `git init`, `git push`, `git merge` for real, against a
 * BARE repository standing in for `origin`. THE SCRATCH REPOSITORIES ARE UNDER
 * `os.tmpdir()`, NEVER INSIDE THE ESTATE — a worker once put a scratch worktree inside it
 * and `op-claims.test.mjs` reported 15,007 op mentions off a nested second copy — and
 * section 1 asserts that rather than trusting it.
 *
 * THE DEFEAT THIS SUITE IS DESIGNED AGAINST, named because M0-48's acceptance names it:
 * **the cheapest way to make this green is an arm that matches no branches and
 * congratulates itself.** A silent `plancheck` is what a walk over an empty candidate set
 * looks like, and this project has recorded that outcome three times. So the acceptance is
 * never the arm's silence:
 *   - C1 and C2 are the row's two control halves DRIVEN — plant a branch and see it NAMED,
 *     merge it and see it go QUIET. A conditioned assertion is only believable once
 *     somebody has seen it fire.
 *   - Every benign arm asserts the CANDIDATE SET IS NON-EMPTY in the same breath as
 *     asserting nothing was named, so "nothing stranded" can never be satisfied by
 *     "nothing looked at".
 *   - The real-estate arm asserts this repository's own `worktree-agent-*` branches are
 *     actually WALKED, so the predicate cannot pass by finding the corpus empty.
 *
 * THE OVER-STRICTNESS HALF IS THE LARGER ONE, because a warning that cries wolf gets
 * switched off and this arm is a WARN precisely so it survives inherited state:
 *   B1  a branch that IS merged into origin/main                  -> silent
 *   B2  a branch that IS on the remote at the same sha            -> silent
 *   B3  a branch on the remote whose tip is AHEAD of the local one -> silent
 *   B4  a branch that is not `worktree-agent-*`                   -> out of scope, silent
 *
 * AND THE ARM THAT JUSTIFIES A DESIGN DECISION RATHER THAN A BEHAVIOUR. D1/D2 drive the
 * same pruned remote two ways: `ls-remote` says the branch is gone (STRANDED, correct) and
 * the un-pruned tracking ref still says it is there (published, STALE AND WRONG). That is
 * the receipt for asking the remote instead of the cache, and it matters now rather than
 * theoretically: D-288 item 3 (M0-49) makes CONDUCT DELETE the remote branch on merge, so
 * this estate is about to start manufacturing exactly those stale refs.
 *
 * NEGATIVE CONTROL: `node test/strandedbranches.control.mjs` from `bio-plane/`.
 */

import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard its own output */
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { strandedAudit, strandedMessage, localBranches, remoteBranches, PREFIX }
  from "../../tools/strandedbranches.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* The FOOT sentinel. A TypeError inside an assertion goes through no assertion at all and
   ends the module while the tally reads clean; this project has met that. */
const SECTIONS = 10;
let reached = 0;
/* EVERY `stranded[0]`/`branches[0]` read below is written `[0]?.`, and that is not style.
   The control driver's A7 arm — which restores the shell plumbing that once made the walk
   return an empty list — found this suite ending at section 2 with a TypeError on
   `a.stranded[0].state`, so the module died and sections 3..10 reported nothing at all. The
   FOOT sentinel caught that the run was truncated, which is what it is for, but a suite that
   cannot survive its own subject failing hides every OTHER thing that subject broke. That is
   D-93's shape inside one file. With `?.` the arm now fails BY NAME in two places. */
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "strandedbranches-"));
const g = (repo, ...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();

let n = 0;
/* A working repository with a BARE repository standing in for `origin`, wired the way a
   real clone is — `origin/main` is a fetched tracking ref and not a local alias, because
   the predicate resolves `origin/main` and an alias would let it pass on a shape that does
   not exist in the estate. */
function scratch() {
  const id = `r${++n}`;
  const bare = join(SANDBOX, `${id}.git`), work = join(SANDBOX, id);
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", bare], { encoding: "utf8" });
  execFileSync("git", ["init", "-q", "-b", "main", work], { encoding: "utf8" });
  g(work, "config", "user.name", "m0-48");
  g(work, "config", "user.email", "m0-48@example.invalid");
  g(work, "config", "commit.gpgsign", "false");
  g(work, "remote", "add", "origin", bare);
  writeFileSync(join(work, "base.md"), "base\n");
  g(work, "add", "-A"); g(work, "commit", "-q", "-m", "base");
  g(work, "push", "-q", "origin", "main");
  g(work, "fetch", "-q", "origin");
  return { work, bare };
}
const commitOn = (repo, branch, body) => {
  g(repo, "checkout", "-q", "-b", branch);
  writeFileSync(join(repo, `${branch}.md`), body);
  g(repo, "add", "-A"); g(repo, "commit", "-q", "-m", `work on ${branch}`);
  const sha = g(repo, "rev-parse", "HEAD");
  g(repo, "checkout", "-q", "main");
  return sha;
};
const audit = (work, opts = {}) => strandedAudit({ repo: work, network: true, ...opts });
const named = (a) => a.stranded.map((r) => r.name).sort();

const B = `${PREFIX}aTEST0001`;   /* in scope */
const B2 = `${PREFIX}aTEST0002`;
const OUT = "feature-not-a-worker-branch";

/* ========================================================================== */
section("1 — the sandbox is outside the estate, and that is asserted rather than assumed");
{
  const root = g(REPO, "rev-parse", "--show-toplevel");
  t("the scratch root is NOT under the repository", SANDBOX.startsWith(root + "/"), false);
  t("...and the repository root is a real path", existsSync(join(root, "CLAUDE.md")), true);
}

/* ========================================================================== */
section("2 — C1, THE ROW'S FIRST CONTROL HALF: PLANT a branch and the arm must NAME it");
/* This is the item rather than a formality. Until somebody has seen the arm fire, a
   conditioned assertion is a belief. */
{
  const { work } = scratch();
  const sha = commitOn(work, B, "unpushed, unmerged\n");
  const a = audit(work);
  t("C1 the planted branch is NAMED", named(a), [B]);
  t("C1 ...and classified `absent` rather than merely counted", a.stranded[0]?.state, "absent");
  t("C1 ...at its own tip sha", a.stranded[0]?.sha, sha);
  t("C1 ...and the walk actually looked at it (candidate set non-empty)", a.branches.length, 1);
  const msg = strandedMessage(a);
  t("C1 the MESSAGE names the branch, which is what a reader acts on", msg.includes(B), true);
  t("C1 ...and says it is not on the remote at all", msg.includes("not on the remote at all"), true);
  t("C1 ...and states that it never fails the run", msg.includes("NEVER fails the run"), true);

  /* C2 — the second half, on the SAME repository, so the transition is what is measured
     and not two unrelated corpora. */
  section("3 — C2, THE SECOND CONTROL HALF: MERGE it and the arm must go QUIET");
  g(work, "merge", "-q", "--no-ff", "--no-edit", B);
  g(work, "push", "-q", "origin", "main");
  g(work, "fetch", "-q", "origin");
  const b = audit(work);
  t("C2 the branch is no longer named", named(b), []);
  t("C2 ...because it is `integrated`, not because it vanished", b.branches.map((r) => r.state), ["integrated"]);
  t("C2 ...and the candidate set is STILL non-empty — silence is not emptiness",
    b.branches.length, 1);
  t("C2 the branch still exists locally, so the quiet is a judgement",
    localBranches({ repo: work }).branches.map((r) => r.name), [B]);
}

/* ========================================================================== */
section("4 — B1..B4, OVER-STRICTNESS. Each of these MUST stay unnamed, and the walk must "
      + "still have seen it.");
{
  /* B2 — pushed, not merged. The literal reading of D-288's phrase, and it must be silent. */
  const { work } = scratch();
  commitOn(work, B, "pushed but not merged\n");
  g(work, "push", "-q", "origin", B);
  g(work, "fetch", "-q", "origin");
  const a = audit(work);
  t("B2 a branch that IS on the remote is unnamed", named(a), []);
  t("B2 ...classified `published`", a.branches.map((r) => r.state), ["published"]);

  /* B3 — the remote is AHEAD. Another clone pushed more onto the same branch; the local
     tip is an ancestor of the remote's, so nothing is stranded. A sha-equality test would
     cry wolf here, which is why the predicate tests ancestry. */
  const other = join(SANDBOX, `clone${n}`);
  execFileSync("git", ["clone", "-q", g(work, "remote", "get-url", "origin"), other], { encoding: "utf8" });
  g(other, "config", "user.name", "m0-48"); g(other, "config", "user.email", "m0-48@example.invalid");
  g(other, "checkout", "-q", B);
  writeFileSync(join(other, "more.md"), "more\n");
  g(other, "add", "-A"); g(other, "commit", "-q", "-m", "someone else pushed more");
  g(other, "push", "-q", "origin", B);
  g(work, "fetch", "-q", "origin");
  const b = audit(work);
  t("B3 the remote being AHEAD is not stranding", named(b), []);
  t("B3 ...still `published`", b.branches.map((r) => r.state), ["published"]);
  t("B3 ...and the shas genuinely differ, so this arm is not vacuous",
    b.branches[0]?.sha === b.branches[0]?.remoteSha, false);

  /* B1 — merged into origin/main but never pushed as a branch. */
  const { work: w2 } = scratch();
  commitOn(w2, B, "merged, never pushed\n");
  g(w2, "merge", "-q", "--no-ff", "--no-edit", B);
  g(w2, "push", "-q", "origin", "main");
  g(w2, "fetch", "-q", "origin");
  const c = audit(w2);
  t("B1 a merged branch is unnamed even though it was never pushed", named(c), []);
  t("B1 ...and it was NOT on the remote, which is what makes the arm non-trivial",
    c.branches[0]?.remoteSha, null);

  /* B4 — out of scope by name. */
  const { work: w3 } = scratch();
  commitOn(w3, OUT, "not a worker branch\n");
  const d = audit(w3);
  t("B4 a non-worker branch is not walked at all", d.branches.length, 0);
  t("B4 ...and nothing is named", named(d), []);
}

/* ========================================================================== */
section("5 — DIVERGED. On the remote BY NAME, but holding local commits the remote lacks. "
      + "This estate is already in this state, which is why the literal test is not enough.");
{
  const { work } = scratch();
  commitOn(work, B, "first\n");
  g(work, "push", "-q", "origin", B);
  g(work, "checkout", "-q", B);
  writeFileSync(join(work, "second.md"), "work that exists only here\n");
  g(work, "add", "-A"); g(work, "commit", "-q", "-m", "a second commit, never pushed");
  g(work, "checkout", "-q", "main");
  g(work, "fetch", "-q", "origin");
  const a = audit(work);
  /* `typeof … === "string"` rather than `!== null`: with `?.` the absent case yields
     `undefined`, which `!== null` accepts — an assertion that passes over an empty walk is
     the vacuous shape this whole suite exists to refuse. */
  t("the branch IS on the remote by name", typeof a.branches[0]?.remoteSha, "string");
  t("...and is NAMED anyway, because its tip is not reachable from there", named(a), [B]);
  t("...classified `diverged` rather than `absent`", a.stranded[0]?.state, "diverged");
  t("...with the exact count of commits at risk", a.stranded[0]?.unpublished, 1);
  const msg = strandedMessage(a);
  t("the message tells the reader the remote HAS the name", msg.includes("on the remote at"), true);
  t("...and how much is not on it", msg.includes("1 local commit(s) NOT on it"), true);
}

/* ========================================================================== */
section("6 — D1/D2, WHY THE REMOTE IS ASKED AND THE CACHE IS NOT TRUSTED. A pruned remote, "
      + "driven both ways.");
{
  const { work, bare } = scratch();
  commitOn(work, B, "pushed then pruned\n");
  g(work, "push", "-q", "origin", B);
  g(work, "fetch", "-q", "origin");
  /* CONDUCT deletes the remote branch when it merges the item — D-288 item 3. The local
     clone is NOT pruned, which is what a plain `git fetch` does. */
  g(bare, "update-ref", "-d", `refs/heads/${B}`);
  const live = audit(work, { network: true });
  t("D1 ls-remote sees the branch is GONE and names it", named(live), [B]);
  t("D1 ...as `absent`", live.stranded[0]?.state, "absent");
  t("D1 ...and the audit reports which evidence it used", live.source, "ls-remote");

  const cached = audit(work, { network: false });
  t("D2 the un-pruned tracking ref STILL says published — the stale answer, driven",
    named(cached), []);
  t("D2 ...and the audit says the evidence was a cache, never presenting it as measured",
    cached.source, "tracking-refs");
  t("D2 ...and `--local` is a CHOICE, not a degradation", cached.degraded, false);
  t("D2 the tracking ref really is still present, so D2 is measuring staleness and not a bug",
    remoteBranches({ repo: work, network: false }).map.has(B), true);
}

/* ========================================================================== */
section("7 — THE REAL ESTATE. The predicate must actually walk this repository's own "
      + "branches; an arm that finds nothing here would satisfy every assertion above.");
{
  const a = strandedAudit({ repo: REPO, network: false });
  t("this clone has local worker branches to judge", a.branches.length > 0, true);
  t("...every one got a classification, none fell through",
    a.branches.filter((r) => !r.state).length, 0);
  t("...the four states are the only ones produced",
    [...new Set(a.branches.map((r) => r.state))].filter(
      (s) => !["integrated", "published", "absent", "diverged"].includes(s)), []);
  t("...`origin/main` resolved, so the merged test was really applied", a.mainResolved, true);
  t("...and the walk is reported as having SUCCEEDED, not merely as empty", a.walkFailed, false);
  /* NOT an assertion that the estate is clean or dirty. Either is legitimate and the
     instrument is not entitled to an opinion; what it is entitled to is having LOOKED. */
  console.log(`  note  estate: ${JSON.stringify(a.counts)} (reported, not asserted — `
            + `inherited state is not a defect)`);

  /* THE RECEIPT FROM THIS MODULE'S OWN FIRST DRAFT, turned into an arm. It shelled out
     through `execSync`, `--format=%(refname:short)` was a /bin/sh syntax error, the
     failure was swallowed, and the audit reported all-zero over an estate holding seven
     branches — the liar M0-48's acceptance names, arriving in the first ten minutes of
     writing the thing designed against it. A FAILED enumeration must therefore be a
     DISTINCT state and never an empty one. */
  const nowhere = strandedAudit({ repo: SANDBOX, network: false });
  t("a walk that could not enumerate says so", nowhere.walkFailed, true);
  t("...and an empty list therefore means `no branches` and nothing else",
    nowhere.branches.length, 0);
  t("...which a caller can tell apart from a clean estate", a.walkFailed === nowhere.walkFailed, false);
}

/* ========================================================================== */
section("8 — THE MESSAGE IS HONEST ABOUT ITS OWN CAP. A capped list must never read as a "
      + "short one.");
{
  const many = { main: "origin/main", source: "ls-remote", degraded: false,
    stranded: Array.from({ length: 20 }, (_, i) => ({
      name: `${PREFIX}a${String(i).padStart(16, "0")}`, sha: "0".repeat(40),
      state: "absent", remoteSha: null, current: false })) };
  const msg = strandedMessage(many, { cap: 3 });
  t("the exact total is stated", msg.includes("20 local"), true);
  t("...and the remainder is named rather than dropped", msg.includes("and 17 more"), true);
  t("...only the cap is listed", (msg.match(/worktree-agent-a0/g) || []).length, 3);
}

/* ========================================================================== */
section("9 — THE GATE. `plancheck` must actually RUN this, and must NOT fail on it. A "
      + "library nobody calls is not a mechanism.");
/* Driven by RUNNING plancheck and reading its report, never by grepping its source:
   mergecarry's equivalent arm grepped, and a COMMENT satisfied it. */
{
  const r = spawnSync(process.execPath, ["tools/plancheck.mjs", "--local"],
                      { cwd: REPO, encoding: "utf8" });
  const out = `${r.stdout}${r.stderr}`;
  t("plancheck reports the stranded-branch walk in its notes",
    /note\s+worker branches:/.test(out), true);
  t("...and names the count it judged rather than only a verdict",
    /worker branches: \d+ local/.test(out), true);
  t("the finding is a WARN, never a FAIL — the ruling this arm exists under",
    /FAIL\s+STRANDED BRANCH/.test(out), false);
  t("...and plancheck --local exits 0 with stranded branches present", r.status, 0);
}

/* ========================================================================== */
section("10 — THE MECHANISM IS IN THE LOOP THE READER ACTUALLY RUNS");
/* `CLAUDE.md`: a mechanism that is not in the loop the reader runs is not a mechanism.
   The reader here is the WORKER, whose own branch this is. */
{
  const worker = g(REPO, "show", "HEAD:docs/development/kickoffs/WORKER.md");
  t("WORKER.md's push step exists (D-288 item 1, the PREVENTION half)",
    /push/i.test(worker), true);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`strandedbranches: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
