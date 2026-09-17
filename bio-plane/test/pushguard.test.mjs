/* M0-56 — THE `docs/DECIDED.md` INDEX, CHECKED AT THE PUSH.
 *
 * The subject is `tools/pushguard.mjs`. The reason it exists is a measurement:
 * CONDUCT #2 pushed `main` RED on a stale `docs/DECIDED.md` FOUR TIMES in one
 * session and turned a merged-tree battery red a fifth, having derived the
 * correct rule mid-session, written it down, and then broken it twice more.
 *
 * THE ARM THIS SUITE EXISTS FOR IS THE END-TO-END PUSH, AND IT IS DRIVEN RATHER
 * THAN REASONED ABOUT. A hook has exactly one thing to prove — that GIT ACTUALLY
 * CALLS IT — and no amount of unit testing over `check()` or `install()` is
 * evidence of that. `op=invitelook` shipped with a ReferenceError while 1,276
 * assertions passed, and a hook asserted at the function level would fail the
 * same way: every part correct, nothing wired. So the end-to-end section builds a
 * REAL repository with a REAL corpus, installs the hook the way `plancheck` does,
 * and runs a REAL `git push` at a REAL bare remote, twice — once over a current
 * index and once over a stale one.
 *
 * AND THE TWO CAUSES ARE DRIVEN SEPARATELY, because they are not one defect:
 *
 *   (1) regenerate, then edit more prose. Ordinary forgetting, which every gate
 *       before the commit already catches.
 *   (2) regenerate, then REBASE, where a peer's commit lands new rulings
 *       UNDERNEATH a correct index. **NOTHING THE SESSION DID MADE IT STALE.**
 *       No gate that runs before the commit can see this, which is the entire
 *       argument for the check being at the push rather than in `gates.mjs`.
 *
 * Cause (2)'s arm is built so the REBASE IS THE ONLY VARIABLE: the same branch is
 * pushed twice, green before the rebase and refused after, with no prose edited
 * by the pushing session in between. A control whose method perturbs a second
 * variable produces a refutation more confident than the finding it refutes, and
 * this project has paid for that twice on `plancheck` alone.
 *
 * WHAT `plancheck` ARM 2b IS, AND WHY THIS SUITE PINS IT. Arm 2b already fails on
 * a stale index and is what caught all five occurrences. M0-56 forbids weakening
 * it, so this suite asserts BY NAME that it is still there and still a `fail`
 * rather than a `warn` — a row that mechanises a remedy and softens its detector
 * has traded a loud defect for a silent one.
 *
 * HOW A LIAR PASSES THIS SUITE, STATED BEFORE WHAT IT CHECKS. The cheapest green
 * is a mechanism that REGENERATES UNCONDITIONALLY AND NEVER REPORTS: it would
 * satisfy every staleness arm, always, and would hide a genuinely broken
 * generator behind its own success. Two arms close that and they are the reason
 * `check()` has four verdicts rather than two — a broken generator and a stale
 * index BOTH exit non-zero, and a guard that conflated them would tell a session
 * to run the tool that is broken. `generator-failed` is asserted distinct from
 * `stale`, and asserted to carry the generator's OWN output.
 *
 * OVER-STRICTNESS, AND IT IS THE ARM THAT DECIDES THIS IS SAFE TO SHIP. A
 * mechanism that dirtied a clean tree on every gate run would be worse than the
 * defect it closes. Two arms, both measured rather than argued: regeneration over
 * a current tree is BYTE-IDENTICAL, and `git status --porcelain` is BYTE-IDENTICAL
 * across an install — which is the whole answer to the objection that killed the
 * regenerating-gate candidate, since `.git/` is not the working tree.
 *
 * NEGATIVE CONTROL: run and recorded 2026-09-17 in worktree agent-a3378dc3df6e90e46,
 * against a REAL bare remote, each arm driven ALONE —
 * (1) delete `.git/hooks/pre-push` -> a branch staled by a prose edit after a
 * regeneration (cause 1) pushes EXIT 0 and the stale index LANDS on the remote;
 * (2) with the hook still deleted -> a branch staled by a REBASE (cause 2) likewise
 * pushes EXIT 0 and LANDS, which is the arm proving the mechanism covers the cause
 * care cannot reach;
 * (3) append a syntax error to `tools/decided.mjs`, on a branch whose index is
 * VERIFIED CURRENT first -> the push is REFUSED naming `generator-failed` and NOT
 * `stale`, carrying the real `SyntaxError`, which is the arm that stops a broken
 * generator reading as staleness;
 * (4) restore the hook by `cp`-back -> the very next push of the SAME ref is REFUSED
 * again, so the mechanism is shown to be what changed and not the branch;
 * (5) replace `check()`'s `r.status === 0` line with an unconditional
 * `return { ok: true, kind: "current" }` — the LIAR shape named above -> this suite
 * goes 44 pass / 16 FAIL, exit 1, and the sixteen are BOTH cause arms, both
 * ref-did-not-land arms and every `generator-failed` arm.
 *
 * Restores were by `cp`-back verified by sha256 AND `cmp`, NEVER by
 * `git checkout -- <file>` (which restores to HEAD, not to what you had, and has
 * silently eaten a session's own uncommitted work twice in this project).
 * Baseline 60 pass / 0 fail. Arm (5) restored at sha256 `48c75a13...`, 27,606 bytes.
 *
 * NEGATIVE CONTROL: D-406 / M0-59, run and recorded 2026-09-17 in worktree
 * agent-a20ba9ff2880e1eae, each arm driven ALONE against a REAL bare remote, with
 * `tools/pushguard.mjs` restored between arms by `cp`-back from a UNIQUELY NAMED
 * per-arm pristine copy, verified by sha256 AND `cmp` AND a byte count with a 30,000-byte
 * floor (pristine `21a3fcc7...`, 37,755 bytes) — NEVER by `git checkout -- <file>`.
 * **Baseline for these arms: 81 pass / 0 fail.**
 *
 * (1) THE FALLBACK REMOVED FROM THE SHIM — `shim()` reverted to v1's single source,
 * degrading open exactly as v1 did -> 73 pass / 6 FAIL (measured before arms (2)'s
 * hardening added two assertions, so against a 79-assertion baseline). The six are the
 * D-406 refusal arms, and the one that states the defect is *...and the stale bytes did
 * NOT reach the remote* FAILING — i.e. **the stale bytes DID reach the remote**, the
 * unguarded push reproduced on demand from a pre-guard worktree.
 * **THE OVER-STRICTNESS ARM STILL PASSED under this arm**, which is what shows the six
 * are specific to the defect rather than a suite that reddens at any perturbation.
 *
 * (2) `installCopy` NEUTERED TO A LIAR — returns `{ok:true, action:"installed"}` and
 * writes nothing, isolating the COPY half from the SHIM half -> 70 pass / 11 FAIL with the
 * FOOT sentinel REACHED. **THIS ARM FOUND A DEFECT IN THIS SUITE RATHER THAN IN ITS
 * SUBJECT, and it is the third time this project's controls have done that at this exact
 * spot.** The first run of it DID NOT FAIL — it DIED, `readFileSync` throwing ENOENT on the
 * absent copy, ending the module with NO TALLY and NO FOOT and losing every section after
 * it. Hardened to read through an `existsSync` guard, the arm now fails BY NAME. A control
 * that diagnoses beats one that merely goes red.
 * It also made an ARM-THAT-DID-NOT-ARM detector earn its place: *...and there is a cache to
 * corrupt, so the ordering arm below can actually arm* FAILS here, which says in one line
 * that the WORKTREE-FIRST arm could not arm in this configuration and its PASS is therefore
 * not evidence — rather than letting a vacuous pass read as a real one.
 *
 * (3) THE REJECTED FIX, DRIVEN RATHER THAN ARGUED — the naive shape D-406's row warned
 * against: v1's single source with the absent-script branch promoted to `exit 1` ->
 * 74 pass / 7 FAIL. **The decisive failures are `OVER-STRICTNESS — a CURRENT index pushes
 * cleanly from a previously-unguarded worktree` and `...and the ref actually landed`.**
 * Note what this arm proves about the SUITE: *THE FIX — a STALE index is REFUSED* PASSES
 * here, because a guard that refuses EVERYTHING also refuses stale ones. **The refusal arm
 * cannot tell a working guard from a blanket blockage; only the over-strictness arm can.**
 * That is why an over-strictness arm is mandatory here and not a courtesy — it is the only
 * instrument that separates D-406's fix from the failure D-406 predicted.
 *
 *   BASELINE, and it is a finding rather than a formality: the baseline battery
 *   measured 213/214 · 13,445 assertions, exit 1, with `strandedwork.test.mjs`
 *   failing its `plancheck --local exits 0` arm. THE CAUSE WAS THIS SUITE'S OWN
 *   SUBJECT HAPPENING LIVE — appending a CLAIM block to `CLAIMS.md` (cause (1))
 *   staled the index mid-run. Regenerating cleared it. M0-56's defect occurred,
 *   unprompted, to the worker measuring M0-56's baseline.
 *
 *   (1) THE MECHANISM REMOVED — `.git/hooks/pre-push` deleted after being copied
 *   aside. Cause (1)'s branch (a ruling planted in `MEASUREMENTS.md`, committed
 *   without regenerating) pushed with EXIT 0 and the stale index LANDED ON THE
 *   REMOTE, silently. Cause (2)'s rebased branch likewise: EXIT 0, landed. The
 *   defect reproduced on demand, in both causes, with nothing else perturbed —
 *   `git status --porcelain` stayed EMPTY throughout, because the hook is not a
 *   tracked path, so this control changes exactly one variable. Restored by
 *   `cp`-back, sha256 `8ed050ae...` identical, and the very next push of the same
 *   ref was REFUSED again.
 *
 *   (2) THE GENERATOR BROKEN — `tools/decided.mjs` copied aside and a syntax error
 *   appended, driven on a branch whose index was VERIFIED CURRENT first so that
 *   staleness could not confound the verdict. The push was REFUSED naming
 *   `generator-failed`, carrying the real `SyntaxError: Unexpected identifier
 *   'is'` and the sentence *This is NOT a stale index and regenerating will not
 *   clear it*. That is the arm that makes a broken generator visible instead of
 *   sending a session round a loop running the tool that is broken. Restored by
 *   `cp`-back, sha256 `880ac5a4...` identical, tree clean.
 *
 *   (3) CAUSE (2) ISOLATED, and this is the arm the row was written for. The SAME
 *   branch, the same working tree, no prose touched by the pushing session:
 *   pushed BEFORE the rebase it was accepted (`docs/DECIDED.md current`, exit 0);
 *   rebased onto a peer commit carrying one planted ruling; pushed AFTER, exit 1,
 *   REFUSED. The rebase is the only thing that changed between the two pushes.
 *
 *   (4) A DEFECT THE DRIVE FOUND THAT READING COULD NOT. The first draft's refusal
 *   message told the reader a rebase had landed a peer's rulings underneath them.
 *   Driving cause (1) produced that message over an event that was NOT a rebase.
 *   The guard compares an index to a corpus and cannot know which cause it is
 *   looking at, so naming one was the record claiming more than it can support —
 *   inside the output of the mechanism built to stop exactly that. It now names
 *   both and says it cannot tell them apart. Fixed at `4b64a7d9`.
 *
 *   (5) THIS SUITE'S OWN CONTROL — `check()`'s `r.status === 0` branch replaced by an
 *   unconditional `return { ok: true, kind: "current" }`, which is precisely the LIAR
 *   shape named above: a guard that always reports healthy. Baseline 60 pass / 0 fail;
 *   neutered **44 pass, 16 FAIL, exit 1**, and the sixteen are the ones that matter —
 *   BOTH cause arms, the ref-did-not-land arms, and every `generator-failed` arm.
 *   Restored by `cp`-back, sha256 `48c75a13...`, `cmp` clean at 27,606 bytes.
 *
 *   AND ARM (5) FOUND A DEFECT IN THIS SUITE RATHER THAN IN ITS SUBJECT, which is
 *   the second time this project's controls have done that at this exact spot. The
 *   FIRST neutered run DIED with a TypeError on `broke.output.includes` — `output` is
 *   undefined when the subject always returns `current` — so it reached its verdict by
 *   THROWING OUT OF THE MODULE, losing the tally and every section after it. That is
 *   D-93's unreadable failure arriving INSIDE a control, and `mintid.test.mjs` records
 *   the same finding from the same cause. Guarded with `|| ""`, the arm now fails BY
 *   NAME, which is the difference between a control that diagnoses and one that merely
 *   goes red. The 16/44 figures above are from the HARDENED run.
 *
 *   TO RE-RUN ARM (1) IN ONE STEP: `cp "$(git rev-parse --git-common-dir)/hooks/pre-push"
 *   /tmp/saved` then delete it, push a branch whose index is stale, and confirm exit 0;
 *   restore with `cp` and confirm sha256 matches. Never `git checkout --`.
 *   TO RE-RUN ARM (5): replace `check()`'s `r.status === 0` line with an unconditional
 *   `return { ok: true, kind: "current" }` and run this file. Expect 44/16.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, cpSync, rmSync, existsSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { install, hooksDir, check, shim, refsNotHead, corpusDirty,
         installCopy, commonDir, COPY_NAME,
         HOOK_MARKER, STALE_SIGNATURE, CORPUS_PATHS } from "../../tools/pushguard.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* The FOOT sentinel, `mintid.test.mjs`'s. A TypeError inside an assertion ends the
   module while the tally still reads clean, so every section bumps this and the last
   assertion requires all of them. A section that dies silently cannot leave a green
   count. */
const SECTIONS = 8;
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "pushguard-"));
const git = (args, cwd) => spawnSync("git", args, { cwd, encoding: "utf8" });

/* ------------------------------------------------------------------ a real repo
 *
 * A REAL repository with a REAL corpus and the REAL generator — not a mock. The
 * generator resolves its corpus from its own location (`tools/..`), so a copy of
 * `decided.mjs` under `<tmp>/tools/` indexes `<tmp>/docs`, and the whole mechanism
 * runs end to end over a corpus small enough to reason about. */
function scratchRepo(name) {
  const root = join(SANDBOX, name);
  mkdirSync(join(root, "tools"), { recursive: true });
  mkdirSync(join(root, "docs"), { recursive: true });
  cpSync(join(REPO, "tools/decided.mjs"), join(root, "tools/decided.mjs"));
  cpSync(join(REPO, "tools/pushguard.mjs"), join(root, "tools/pushguard.mjs"));
  writeFileSync(join(root, "docs/seed.md"), "# seed\n\nDEC-1 was RULED on 2026-09-17 to exist.\n");
  writeFileSync(join(root, "CLAUDE.md"), "# scratch\n");
  git(["init", "-q", "-b", "main"], root);
  git(["config", "user.email", "m056@example.invalid"], root);
  git(["config", "user.name", "M0-56 suite"], root);
  return root;
}
const regen = (root) => spawnSync(process.execPath, [join(root, "tools/decided.mjs")], { cwd: root, encoding: "utf8" });
const commitAll = (root, msg) => { git(["add", "-A"], root); return git(["commit", "-q", "-m", msg], root); };
function bareRemote(name) {
  const p = join(SANDBOX, name);
  git(["init", "-q", "--bare", p], SANDBOX);
  return p;
}

/* ========================================================================== */
section("THE END-TO-END PUSH — git actually calls it, over a real corpus");
/* The only arm that can establish a hook is wired. Everything else in this file
   would pass over a hook git never invokes. */
{
  const root = scratchRepo("e2e");
  const remote = bareRemote("e2e-remote.git");
  git(["remote", "add", "origin", remote], root);

  const inst = install({ repo: root });
  t("install into a fresh repo reports `installed`", inst.action, "installed");
  t("...at the path git reads hooks from", inst.path, join(hooksDir({ repo: root }).dir, "pre-push"));
  t("...and the hook file is on disk", existsSync(inst.path), true);

  regen(root);
  commitAll(root, "seed with a current index");
  const green = git(["push", "origin", "main"], root);
  t("A CURRENT index pushes — exit 0", green.status, 0);
  t("...and the guard says so rather than passing silently",
    green.stderr.includes(`${HOOK_MARKER}: docs/DECIDED.md current`), true);
  t("...and the ref actually landed on the remote",
    git(["rev-parse", "--verify", "main"], remote).status, 0);

  /* CAUSE (1): a prose edit after a regeneration. */
  writeFileSync(join(root, "docs/later.md"), "DEC-2 was RULED on 2026-09-17, after the index was built.\n");
  commitAll(root, "a ruling added after the regeneration");
  const red = git(["push", "origin", "main"], root);
  t("CAUSE (1) — a prose edit after a regeneration is REFUSED, exit 1", red.status === 0 ? 0 : 1, 1);
  t("...naming the remedy, so the reader can act in one step",
    red.stderr.includes("node tools/decided.mjs"), true);
  t("...and saying it is the INDEX that is stale", red.stderr.includes("STALE"), true);
  t("...and the stale bytes did NOT reach the remote",
    git(["rev-parse", "main"], remote).stdout.trim() === git(["rev-parse", "main"], root).stdout.trim(), false);

  /* And it clears the way the message says it does — a remedy that does not work
     is worse than no remedy, because the reader spends the trust before finding out. */
  regen(root);
  commitAll(root, "regenerated");
  const cleared = git(["push", "origin", "main"], root);
  t("...and running the named remedy CLEARS it — the advice is true", cleared.status, 0);
}

/* ========================================================================== */
section("CAUSE (2) — THE REBASE, with the rebase as the ONLY variable");
/* The cause care cannot reach: the corpus changed while this session touched
   nothing. The same branch is pushed twice and only a rebase happens in between,
   so a pass-then-fail cannot be attributed to anything else. */
{
  const root = scratchRepo("rebase");
  const remote = bareRemote("rebase-remote.git");
  git(["remote", "add", "origin", remote], root);
  install({ repo: root });

  regen(root);
  commitAll(root, "base, index current");
  git(["push", "-q", "origin", "main"], root);

  /* A peer branch: another session lands a ruling. This stands in for origin/main
     moving, which is exactly the receipt — main was pushed RED four times. */
  git(["checkout", "-q", "-b", "peer"], root);
  writeFileSync(join(root, "docs/peer.md"), "DEC-3 was RULED on 2026-09-17 by a session this one never spoke to.\n");
  commitAll(root, "peer lands a ruling");

  /* My branch, from the base: a change that touches NO prose at all. */
  git(["checkout", "-q", "-b", "mine", "main"], root);
  writeFileSync(join(root, "tools/mine.mjs"), "// no prose here\n");
  commitAll(root, "worker work, no prose touched");

  t("the index is CURRENT before the rebase — verified, not assumed",
    check({ repo: root }).kind, "current");
  const before = git(["push", "origin", "mine:refs/heads/mine"], root);
  t("the branch pushes GREEN before the rebase", before.status, 0);

  const rb = git(["rebase", "peer"], root);
  t("the rebase succeeds cleanly — no conflict to confound the arm", rb.status, 0);

  t("AFTER the rebase the index is STALE, with nothing edited by this session",
    check({ repo: root }).kind, "stale");
  const after = git(["push", "origin", "mine:refs/heads/mine2"], root);
  t("CAUSE (2) — the push is REFUSED, exit 1", after.status === 0 ? 0 : 1, 1);
  t("...naming the remedy", after.stderr.includes("node tools/decided.mjs"), true);

  /* THE MESSAGE MUST NOT ASSERT WHICH CAUSE. The guard compares an index to a
     corpus; it cannot know why they differ. An earlier draft named the rebase, and
     driving cause (1) caught it telling a true story about the wrong event. */
  t("...and the message does NOT claim to know which cause staled it",
    after.stderr.includes("CANNOT TELL YOU WHICH CASE"), true);

  t("...and the ref did not land", git(["rev-parse", "--verify", "mine2"], remote).status === 0, false);
}

/* ========================================================================== */
section("A BROKEN GENERATOR IS NOT A STALE INDEX — the liar arm");
/* Both exit non-zero. A guard that conflated them would send a session to run the
   tool that is broken, and would let a regenerate-always mechanism look healthy
   forever. This is the arm that makes the generator's failure visible. */
{
  const fake = (status, stdout = "", stderr = "") => () => ({ status, stdout, stderr });
  t("exit 0 is `current`", check({ run: fake(0, "DECIDED.md is current\n") }).kind, "current");
  t("the generator's own STALE line is `stale`",
    check({ run: fake(1, "", `FAIL  docs/DECIDED.md ${STALE_SIGNATURE} — run it`) }).kind, "stale");
  const broke = check({ run: fake(1, "", "SyntaxError: Unexpected token '}'\n") });
  t("exit 1 WITHOUT the STALE line is `generator-failed`, NOT `stale`", broke.kind, "generator-failed");
  t("...it refuses all the same — the safe direction", broke.ok, false);
  /* `|| ""` IS NOT TIDYING — IT IS WHAT MAKES THIS A READABLE CONTROL. Neutering
     `check()` to always return `current` leaves `output` undefined, and the first
     run of this suite's own negative control DIED HERE with a TypeError, taking the
     tally and every later section with it. That is D-93's unreadable failure
     arriving INSIDE a control, and `mintid.test.mjs` records the same instrument
     finding from the same cause. A control must fail by NAME, not by throwing. */
  t("...and carries the generator's OWN output, untranslated",
    (broke.output || "").includes("SyntaxError"), true);
  t("...and says regenerating will not help",
    (broke.message || "").includes("regenerating will not help"), true);
  t("a non-1 non-zero exit is also `generator-failed`",
    check({ run: fake(127, "", "not found") }).kind, "generator-failed");

  /* Driven on disk too, because a synthetic runner is not evidence the real CLI
     path reaches this branch. */
  const root = scratchRepo("broken");
  install({ repo: root });
  regen(root);
  t("the scratch repo's index is current before the generator is broken",
    check({ repo: root }).kind, "current");
  writeFileSync(join(root, "tools/decided.mjs"),
    readFileSync(join(root, "tools/decided.mjs"), "utf8") + "\nthis is not javascript }{\n");
  t("a REAL broken generator on disk reads `generator-failed`, not `stale`",
    check({ repo: root }).kind, "generator-failed");
}

/* ========================================================================== */
section("OVER-STRICTNESS — a clean tree must stay clean, and a current index must not move");
/* The arm that decides this is safe to ship. A mechanism that dirtied the tree on
   every gate run would be worse than the defect it closes. */
{
  /* Regeneration is idempotent: the property the whole gate rests on. */
  const root = scratchRepo("idem");
  regen(root);
  const first = readFileSync(join(root, "docs/DECIDED.md"));
  regen(root);
  const second = readFileSync(join(root, "docs/DECIDED.md"));
  t("regenerating over a CURRENT tree is BYTE-IDENTICAL", Buffer.compare(first, second), 0);
  t("...and the guard still says `current`", check({ repo: root }).kind, "current");

  /* THE MUTATION QUESTION, ANSWERED BY MEASUREMENT. This is what killed the
     regenerating-gate candidate, so it is measured rather than argued: an install
     writes `.git/hooks/`, which is not tracked and not in the working tree. */
  commitAll(root, "seed");
  const before = git(["status", "--porcelain"], root).stdout;
  install({ repo: root });
  install({ repo: root });
  const after = git(["status", "--porcelain"], root).stdout;
  t("`git status --porcelain` is BYTE-IDENTICAL across TWO installs", after, before);
  t("...and it was actually clean, so the arm is not passing over an empty comparison",
    before.trim(), "");

  /* Idempotent by bytes, so a second install does not even touch the file. */
  t("a second install reports `current`, not a rewrite", install({ repo: root }).action, "current");
}

/* ========================================================================== */
section("ARMING — the two ways this could have installed somewhere git never looks");
/* Both are the arm-that-did-not-arm class: a file, a success message, and no guard. */
{
  const root = scratchRepo("arming");

  /* THE SHIM MUST RESOLVE THE PUSHING WORKTREE. One hook file is shared by every
     worktree of a clone, so a baked-in absolute path would validate the INSTALLING
     tree on behalf of all the others — a worker's branch certified against main's
     corpus. */
  const s = shim();
  t("the shim resolves the pushing worktree with --show-toplevel", s.includes("--show-toplevel"), true);
  t("...and bakes in NO absolute path", /\/Users\/|\/home\/|\/private\//.test(s), false);
  t("...and never uses --git-dir, which in a worktree is not where hooks live",
    s.includes("--git-dir"), false);
  t("...and says so on stderr rather than waving a push through silently when the tool is absent",
    s.includes("NOT guarded"), true);

  /* `core.hooksPath` WINS OVER `.git/hooks`. Installing into `.git/hooks` while it is
     set produces a file git never reads. */
  const alt = join(SANDBOX, "alt-hooks");
  mkdirSync(alt, { recursive: true });
  git(["config", "core.hooksPath", alt], root);
  const h = hooksDir({ repo: root });
  t("core.hooksPath is honoured over .git/hooks", h.dir, alt);
  t("...and named as the source, so a reader can see where it went", h.source, "core.hooksPath");
  t("...and the hook is installed THERE", install({ repo: root }).path, join(alt, "pre-push"));

  /* A configured hooksPath that does not exist is the operator's business. */
  git(["config", "core.hooksPath", join(SANDBOX, "does-not-exist")], root);
  const missing = install({ repo: root });
  t("a hooksPath that does not exist REFUSES rather than conjuring a directory",
    missing.action, "no-hooks-dir");
  t("...and reports not-ok, so a caller cannot read it as armed", missing.ok, false);
  git(["config", "--unset", "core.hooksPath"], root);

  /* NEVER CLOBBER A HOOK WE DID NOT WRITE. */
  const own = hooksDir({ repo: root }).dir;
  writeFileSync(join(own, "pre-push"), "#!/bin/sh\n# somebody else's hook\nexit 0\n");
  const foreign = install({ repo: root });
  t("a foreign pre-push is NOT overwritten", foreign.action, "foreign");
  t("...and reports not-ok, because an install that did not happen must not read as one that did",
    foreign.ok, false);
  t("...and the foreign hook's bytes are untouched",
    readFileSync(join(own, "pre-push"), "utf8").includes("somebody else's hook"), true);
  t("...while OUR own hook IS replaced when its bytes differ (an older shim must not persist)",
    (writeFileSync(join(own, "pre-push"), `#!/bin/sh\n# ${HOOK_MARKER} v0 stale\nexit 0\n`),
     install({ repo: root }).action), "replaced");
}

/* ========================================================================== */
section("THE SCOPE OF THE VERDICT — what it checked, and what it did not");
/* Undetermined is first-class and must be STATED. A guard reporting `current` over
   a tree it had not actually checked would be the costs-nothing-equality defect
   wearing a green tick. */
{
  const head = "a".repeat(40);
  t("a ref at HEAD is one the guard spoke for",
    refsNotHead(`refs/heads/x ${head} refs/heads/x ${"b".repeat(40)}`, head), []);
  t("a ref that is NOT HEAD is NAMED rather than silently covered",
    refsNotHead(`refs/heads/x ${"c".repeat(40)} refs/heads/x ${"b".repeat(40)}`, head).length, 1);
  t("a DELETION carries no corpus and is not named",
    refsNotHead(`refs/heads/x ${"0".repeat(40)} refs/heads/x ${"b".repeat(40)}`, head), []);
  t("empty stdin names nothing", refsNotHead("", head), []);

  /* The corpus paths are the generator's OWN roots. A change outside them cannot
     stale the index, so consulting them would raise a false alarm. */
  t("the dirtiness question is asked over the generator's own roots", CORPUS_PATHS, ["docs", "CLAUDE.md"]);

  const root = scratchRepo("scope");
  regen(root);
  commitAll(root, "seed");
  t("a clean corpus reads clean", corpusDirty({ repo: root }), false);
  writeFileSync(join(root, "docs/seed.md"), "# seed\n\nDEC-1 was RULED to exist, and edited.\n");
  t("an uncommitted corpus edit reads DIRTY — the verdict then describes the TREE, not the push",
    corpusDirty({ repo: root }), true);
}

/* ========================================================================== */
section("THE DETECTOR THIS ROW MAY NOT WEAKEN, AND THE LOOP THAT ARMS IT");
/* M0-56 is explicit: make the index correct more reliably, NEVER make the check
   quieter. Arm 2b of `plancheck` caught all five occurrences and is pinned here by
   name, because a row that mechanises a remedy and softens its detector has traded
   a loud defect for a silent one. */
{
  const pc = readFileSync(join(REPO, "tools/plancheck.mjs"), "utf8");
  t("plancheck still shells the generator's --check", pc.includes('"--check"') || pc.includes("--check"), true);
  t("...and still FAILS on a stale index, not warns",
    /fail\(`STALE — docs\/DECIDED\.md does not match the corpus it indexes/.test(pc), true);
  t("...and still names the remedy in its own failure",
    pc.includes("Run \\`node tools/decided.mjs\\`"), true);

  /* A MECHANISM NOT IN THE LOOP THE READER RUNS IS NOT A MECHANISM. The hook is
     installed by the gate every worker already runs, so nobody has to remember. */
  t("plancheck imports the guard, so running the gate ARMS the hook",
    pc.includes('import("./pushguard.mjs")'), true);
  t("...and says in its own output that it wrote to .git/",
    pc.includes("not in the working tree"), true);

  /* The real repository's own hook, if a gate has run here, must be ours. */
  const live = hooksDir({ repo: REPO });
  const livePath = live.dir ? join(live.dir, "pre-push") : null;
  const liveOk = !livePath || !existsSync(livePath)
    || readFileSync(livePath, "utf8").includes(HOOK_MARKER);
  t("any pre-push installed in THIS clone is ours (or absent — a fresh clone is the stated limit)",
    liveOk, true);
}

/* ========================================================================== */
section("D-406 — A WORKTREE WHOSE COMMIT PREDATES THE GUARD");
/* THE DEFECT THIS SECTION EXISTS FOR, and it is the reason the section is an END-TO-END
   PUSH rather than an assertion about `shim()`.  The hook is installed ONCE in the shared
   common dir — so it FIRES in every worktree — but v1 resolved its SCRIPT from the pushing
   worktree alone.  A checkout whose tip predates M0-56 does not contain `tools/pushguard.mjs`,
   so the hook found nothing to run, printed one stderr line, and EXITED 0.  Measured at 6 of 9
   worktrees by BOB #13 INCLUDING THE MAIN CHECKOUT, and re-measured at 5 of 15 on this tree
   with the main checkout still among them.

   **THE ABSENCE AND THE PRESENCE OF THE GUARD PRODUCED THE SAME VISIBLE OUTCOME — a successful
   push.**  That is why no function-level arm can establish this and why a real `git push` from
   a real linked worktree at a real pre-guard commit is the only shape that can.

   Commit A carries the corpus and the generator but NOT the guard script; commit B adds it.
   `main` sits at B and a linked worktree sits at A. That is D-406's exact geometry. */
{
  const root = join(SANDBOX, "d406");
  mkdirSync(join(root, "tools"), { recursive: true });
  mkdirSync(join(root, "docs"), { recursive: true });
  cpSync(join(REPO, "tools/decided.mjs"), join(root, "tools/decided.mjs"));
  writeFileSync(join(root, "docs/seed.md"), "# seed\n\nDEC-1 was RULED on 2026-09-17 to exist.\n");
  writeFileSync(join(root, "CLAUDE.md"), "# scratch\n");
  git(["init", "-q", "-b", "main"], root);
  git(["config", "user.email", "d406@example.invalid"], root);
  git(["config", "user.name", "D-406 suite"], root);

  regen(root);
  commitAll(root, "A — corpus and generator, NO guard script (predates M0-56)");
  const shaA = git(["rev-parse", "HEAD"], root).stdout.trim();
  cpSync(join(REPO, "tools/pushguard.mjs"), join(root, "tools/pushguard.mjs"));
  commitAll(root, "B — the guard script lands");

  install({ repo: root });
  const copy = installCopy({ repo: root });
  t("the clone-wide copy installs into the git COMMON dir", copy.action, "installed");
  t("...under its bio-* name, beside the ledger mintid has kept there since M0-17",
    copy.path, join(commonDir({ repo: root }), COPY_NAME));
  /* READ THROUGH A GUARD, NOT DIRECTLY. A bare `readFileSync` here THROWS when the copy is
     absent, which ends the module with no tally and no FOOT — the suite reaches a verdict by
     DYING instead of by failing, and every section after it is lost. Found by this row's own
     arm (2), where a lying `installCopy` reported `installed` and wrote nothing; it is the
     same defect M0-56's control found at this same spot, and `mintid.test.mjs` records it too.
     A control that diagnoses beats one that merely goes red. */
  const copyBody = copy.path && existsSync(copy.path) ? readFileSync(copy.path, "utf8") : "";
  t("...and the copy REALLY EXISTS on disk — an install that reported success wrote something",
    copyBody.length > 0, true);
  t("...and is a copy of a REAL pushguard, not an empty or truncated file",
    copyBody.includes("export function shim"), true);
  t("...idempotent by bytes — a second call does not rewrite it",
    installCopy({ repo: root }).action, "current");

  /* The pre-guard worktree. */
  const old = join(SANDBOX, "d406-old");
  git(["worktree", "add", "-q", "-b", "oldbranch", old, shaA], root);
  t("the old worktree genuinely lacks the guard script — the D-406 geometry, not a mock",
    existsSync(join(old, "tools/pushguard.mjs")), false);
  t("...but DOES carry the generator, so the fallback has something real to check",
    existsSync(join(old, "tools/decided.mjs")), true);

  const remote = bareRemote("d406-remote.git");
  git(["remote", "add", "origin", remote], old);

  /* ---------------------------------------------------------------- OVER-STRICTNESS FIRST.
     It matters more here than usual.  A guard that hard-failed in every checkout predating it
     would refuse pushes from the MAIN CHECKOUT on a tree that has done nothing wrong — trading
     a silent gap for a loud blockage, which is the failure D-406's row explicitly warned
     against.  A correct tree must push CLEANLY and SILENTLY. */
  regen(old);
  commitAll(old, "old worktree, index regenerated — nothing wrong here");
  const healthy = git(["push", "origin", "oldbranch"], old);
  t("OVER-STRICTNESS — a CURRENT index pushes cleanly from a previously-unguarded worktree",
    healthy.status, 0);
  t("...and the ref actually landed", git(["rev-parse", "--verify", "oldbranch"], remote).status, 0);
  t("...and the guard now gives a REAL VERDICT there instead of `NOT guarded`",
    healthy.stderr.includes(`${HOOK_MARKER}: docs/DECIDED.md current`), true);
  t("...and does NOT announce itself as inactive, which is what v1 said here",
    healthy.stderr.includes("NOT guarded"), false);

  /* ---------------------------------------------------------------- THE REFUSAL THAT DID NOT
     HAPPEN BEFORE.  Under v1 this exact push exited 0 and the stale bytes LANDED. */
  const before = git(["rev-parse", "oldbranch"], remote).stdout.trim();
  writeFileSync(join(old, "docs/later.md"),
    "DEC-2 was RULED on 2026-09-17, after the index was built.\n");
  commitAll(old, "a ruling added WITHOUT regenerating the index");
  const stale = git(["push", "origin", "oldbranch"], old);
  t("THE FIX — a STALE index is REFUSED from a worktree that predates the guard",
    stale.status === 0 ? 0 : 1, 1);
  t("...and the stale bytes did NOT reach the remote",
    git(["rev-parse", "oldbranch"], remote).stdout.trim() !== before, false);
  t("...naming the remedy, so the reader can act in one step",
    stale.stderr.includes("node tools/decided.mjs"), true);
  t("...and saying it is the INDEX that is stale", stale.stderr.includes("STALE"), true);

  /* The remedy must actually clear it — advice that does not work spends the reader's
     trust before they find out. */
  regen(old);
  commitAll(old, "regenerated");
  t("...and running the named remedy CLEARS it, from the old worktree too",
    git(["push", "origin", "oldbranch"], old).status, 0);

  /* ---------------------------------------------------------------- NO REGRESSION.
     A worktree that ALREADY had the guard must still refuse, and must still do it through
     its OWN tracked script rather than the cache — worktree-first is the whole of the chosen
     ordering and an arm that does not pin the ORDER would pass under either. */
  git(["remote", "add", "origin", remote], root);
  regen(root); commitAll(root, "main, index current");
  t("a tree WITH its own script still pushes clean", git(["push", "-q", "origin", "main"], root).status, 0);
  writeFileSync(join(root, "docs/more.md"), "DEC-4 was RULED on 2026-09-17 with no regeneration.\n");
  commitAll(root, "stale again on main");
  t("NO REGRESSION — a tree where the guard already worked STILL refuses a stale index",
    git(["push", "origin", "main"], root).status === 0 ? 0 : 1, 1);

  /* THE ORDER, pinned by BEHAVIOUR rather than by reading the shim.  Corrupt the CACHE only.
     If the hook preferred the cache, this push would die on a SyntaxError; worktree-first
     means the tracked script answers and the corrupt cache is never opened. */
  /* Guarded for the reason given above — this arm must not be able to END the module. */
  const cacheSaved = copyBody;
  t("...and there is a cache to corrupt, so the ordering arm below can actually arm",
    cacheSaved.length > 0, true);
  if (cacheSaved) writeFileSync(copy.path, "this is not valid javascript {{{\n");
  regen(root); commitAll(root, "regenerated, index current again");
  const withBadCache = git(["push", "origin", "main"], root);
  t("WORKTREE-FIRST, DRIVEN — a corrupt CACHE cannot affect a tree that carries its own script",
    withBadCache.status, 0);
  if (cacheSaved) writeFileSync(copy.path, cacheSaved);
  t("...and the cache was restored byte-identically for the arms after it",
    existsSync(copy.path) && readFileSync(copy.path, "utf8") === cacheSaved, true);
}

/* ========================================================================== */
t(`FOOT — all ${SECTIONS} sections reached (a section that dies silently cannot leave a green count)`,
  reached, SECTIONS);

rmSync(SANDBOX, { recursive: true, force: true });
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
