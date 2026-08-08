/* M0-16 / D-238 — ONE PROVENANCE CHECK, FOR EVERY WALK THAT DISCOVERS OVER A
 * DIRECTORY IT DOES NOT CONTROL.
 *
 * WHY THIS MODULE EXISTS AT ALL, AND WHY IT IS NOT A SECOND MECHANISM. M0-15
 * closed this hole for `scripts/battery.mjs` by writing the check inline, and
 * NAMED the walks it had not closed rather than stopping: `scripts/coverage.mjs`
 * (suites, and fleet manifests) and `test/hygiene.test.mjs` (three corpus walks).
 * Seven walks, two guarded. Copying M0-15's block three more times would give
 * this project four statements of one rule, and this repository has measured
 * five times over what a copy costs: a copy agrees with the original at ZERO
 * COST, satisfies every assertion, and then goes stale in ONE of its homes while
 * the others hold still. So M0-15's code MOVED HERE and its runner now imports
 * it. There is one mechanism; the walks are its callers.
 *
 * THE DEFECT, in one sentence (the full mechanism is in D-238 and in
 * `scripts/battery.mjs`'s header): `git stash` is REPOSITORY-WIDE across all
 * sixty worktrees of this repository, `git stash push -u` carries UNTRACKED
 * files, so a `pop` in one worktree deposits another worker's uncommitted files
 * — including a whole `.test.mjs`, and including a whole fleet directory — into
 * a tree that never wrote them. Anything that then DISCOVERS over that directory
 * counts the phantom and reports a number nobody else can reproduce.
 *
 * WHY IT OUTRANKS ITS SIZE. Every worker here is instructed to MEASURE ITS OWN
 * BASELINE AND TRUST IT OVER ITS BRIEF. A baseline that silently includes a
 * phantom makes that instruction produce a WRONG NUMBER WITH FULL CONFIDENCE.
 * And a number quoted from a contaminated run does not stay in the run: the
 * `REGISTER_FLOOR` in `scripts/coverage.mjs` is MOVED BY HAND to the figure a
 * green run PRINTED — seven items moved it in one day — so a floor set while a
 * phantom was present is PERMANENTLY TOO HIGH, fails every honest run
 * afterwards, and gets switched off. The payload of this defect is not a wrong
 * number. It is a disabled ratchet.
 *
 * THE FOUR RULES, all four inherited from M0-15 and none of them incidental:
 *
 *  1. ASK `git ls-tree HEAD`, NEVER `git status`. An IGNORED file does not
 *     appear in `git status` at all, and `.claude/worktrees/` is ignored in this
 *     repository — which is precisely how the original phantom stayed invisible.
 *     The question is "is this file in the commit", so the answer comes from the
 *     commit. This is the rule the ignored-not-untracked control arm exists to
 *     prove is still being followed.
 *  2. DISTINGUISH UNTRACKED FROM STAGED-NOT-COMMITTED. "I have not committed
 *     yet" and "this arrived from somewhere else" are different claims about the
 *     same absence, and only one of them is a phantom.
 *  3. PRINT THE REPRODUCIBLE TOTAL BESIDE THE CONTAMINATED ONE. A reader who is
 *     about to quote a figure into a floor, a debt row or a handoff needs to be
 *     told which figure another checkout reproduces. Naming the file without
 *     restating the number leaves the reader to do the arithmetic, and the
 *     arithmetic is the whole point.
 *  4. SAY UNVERIFIED, NEVER CLEAN, WHEN GIT CANNOT ANSWER. An instrument that
 *     reports "all good" when it could not look is D-233 exactly.
 *
 * AND IT REPORTS, IT DOES NOT FAIL. M0-15's provisional, kept deliberately and
 * for its stated reason: a worker writes a suite and runs the battery before
 * committing it dozens of times an hour, and failing on that would be a FALSE
 * RED on the whole estate — worse than the condition it reports. THE RESIDUAL,
 * stated rather than discovered later: a run whose totals include a phantom is
 * still GREEN, and only this report says so. Closing that means failing on an
 * uncommitted suite, which is a decision about how workers work rather than
 * about any instrument.
 *
 * ---- WHAT THIS CHECK CANNOT SEE. Stated here, in the instrument, because a
 * matcher that does not publish its blind spots is read as though it had none.
 *
 *  - CONTENT. `ls-tree HEAD --name-only` answers about a PATH. A tracked file
 *    whose CONTENT was replaced — by a `stash pop`, by an editor, by anything —
 *    is in the commit by this test and reads as reproducible. This check
 *    detects an ARRIVAL, not a MODIFICATION. `git status` sees modifications and
 *    is the wrong instrument for arrivals, which is why the two are different
 *    questions and this one answers only the second.
 *  - HEAD ITSELF. If the worktree's HEAD is not what the reader thinks it is,
 *    every answer here is about a commit nobody else has. The short SHA is
 *    printed for exactly that reason and is worth reading.
 *  - ANYTHING DISCOVERY NEVER ADMITTED. This check is handed the list a walk
 *    actually counted. A file the walk's own filter excluded is invisible here,
 *    correctly — but it means a NARROWED walk reports a clean provenance over
 *    an empty corpus. That is why every caller PRINTS ITS CORPUS SIZE and why
 *    the corpus is asserted against a floor: a beautiful 100% over nothing is
 *    the failure mode this project keeps meeting (M0-14's register, and M0-15's
 *    own harness, whose restore check used a BSD-absent `xargs` flag, compared
 *    two EMPTY files and reported them byte-identical).
 *  - SUBMODULES AND SYMLINKS. A path that resolves outside this repository is
 *    reported as not-in-HEAD, which is the honest direction but is not a
 *    statement about the file it points at.
 */

import { spawnSync } from "node:child_process";
import { relative } from "node:path";

/* The three questions, asked once. `null` from any of them means git could not
   answer, which is a THIRD state and never folded into "no". */
export function readGitProvenance(repoRoot) {
  const git = (args) => {
    const r = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8", timeout: 30_000,
      maxBuffer: 128 * 1024 * 1024 });
    return (r.error || r.status !== 0 || typeof r.stdout !== "string") ? null : r.stdout;
  };
  const setOf = (out) => out === null ? null : new Set(out.split("\0").filter(Boolean));
  return {
    repoRoot,
    inHead: setOf(git(["ls-tree", "-r", "--name-only", "-z", "HEAD"])),
    inIndex: setOf(git(["ls-files", "-z"])),
    headSha: (git(["rev-parse", "--short", "HEAD"]) || "").trim(),
  };
}

/* Repo-relative, POSIX-shaped, which is the spelling `ls-tree` answers in. */
export const repoPath = (repoRoot, abs) => relative(repoRoot, abs).split("\\").join("/");

/* RULE 2 lives here: three states, not two. */
export function stateOf(prov, path) {
  if (prov.inHead === null) return "UNVERIFIED";
  if (prov.inHead.has(path)) return "in the commit";
  if (prov.inIndex === null) return "index unreadable";
  return prov.inIndex.has(path) ? "staged, not yet committed" : "UNTRACKED";
}

/* `items` is what a walk ACTUALLY COUNTED: [{ path, what, counted }], `path`
   repo-relative. Returns the classification and, deliberately, the size of the
   corpus it was handed — a caller that prints `accounted` prints its own reach,
   and a walk that narrowed to nothing cannot hide behind a clean report. */
export function classifyDiscovered(prov, items) {
  const verified = prov.inHead !== null;
  const rows = items.map((it) => ({ ...it, state: stateOf(prov, it.path) }));
  return {
    verified,
    headSha: prov.headSha,
    accounted: rows.length,
    rows,
    off: verified ? rows.filter((r) => r.state !== "in the commit") : [],
    inCommit: verified ? rows.filter((r) => r.state === "in the commit").map((r) => r.path) : [],
  };
}

/* RULE 3 as a printed line. `totals` is a list of
   { label, contaminated, reproducible } the CALLER computes, because only the
   caller knows what its own number means — assertions for the battery, arms and
   classified declarations for the register, suites for a corpus walk. Printing
   them here rather than at each site keeps the SENTENCE that explains them in
   one place, which is the same argument as the module itself. */
export function reportProvenance({ prov, items, instrument, corpus = "", totals = [], log = console.log }) {
  const c = classifyDiscovered(prov, items);
  if (!c.verified) {
    log(`provenance: UNVERIFIED over all ${c.accounted} discovered item(s) — git could not`
      + ` answer \`ls-tree HEAD\` in ${prov.repoRoot}.`);
    log(`  Nothing ${instrument} counted was checked against a commit, so its totals may include work no`);
    log(`  other checkout of this repository has. That is not the same claim as "all in a commit" (M0-16).`);
    return c;
  }
  log(`provenance: ${c.accounted - c.off.length} of ${c.accounted} discovered item(s)`
    + ` are in the commit at HEAD (${c.headSha})${corpus ? ` · ${corpus}` : ""}`);
  if (!c.off.length) return c;
  log(`  NOT IN ANY COMMIT — ${instrument} COUNTED work no other checkout can see (D-238):`);
  for (const r of c.off) log(`    ${r.path}  (${r.state}) — ${r.what}: ${r.counted}`);
  for (const tt of totals) {
    log(`  ${tt.contaminated} ${tt.label} were counted above; ${tt.reproducible} of them come from`
      + ` ${tt.source || "items"}`);
    log(`  that are in the commit. ${tt.reproducible} is the figure another checkout at ${c.headSha}`);
    log(`  reproduces, and it is the one a floor or a baseline may be quoted from.`);
  }
  log(`  An UNTRACKED item here did not have to be written in this tree: \`git stash\` is REPOSITORY-WIDE`);
  log(`  across every worktree, so a \`pop\` can deposit another worker's untracked files — including a`);
  log(`  whole fleet directory — here. See scripts/provenance.mjs and D-238.`);
  return c;
}
