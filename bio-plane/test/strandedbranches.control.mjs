#!/usr/bin/env node
/* M0-48's NEGATIVE CONTROL DRIVER — seven arms plus a baseline — over the stranded-branch
 * predicate in `tools/strandedbranches.mjs`, its arm in `tools/plancheck.mjs`, and the
 * suite that drives both, `bio-plane/test/strandedbranches.test.mjs`.
 *
 *   node bio-plane/test/strandedbranches.control.mjs        (from the repo root)
 *
 * COMMITTED so the next session re-runs it in ONE step instead of re-deriving how to break
 * the subject. Every arm is armed ALONE with the others held open, against a UNIQUELY-NAMED
 * pristine copy in this worktree's own pen (`.m048-harness/`, never a shared scratchpad),
 * and every restore is verified by sha256 AND by `cmp` AND by a floored byte count —
 * because `git checkout --` restores to HEAD, which in a tree with uncommitted work is
 * "throw mine away" and exits 0 either way (CLAUDE.md, measured twice in two days).
 *
 * **NO ARM TOUCHES A BRANCH OR A REF.** The caution carried onto M0-48's row is that the
 * last two controls run against `plancheck` were BOTH defeated by the method dirtying the
 * tree — a rename and a `chmod 000`, each of which made the run fail on UNPUBLISHED and
 * exit 1, producing a NAMED failure that felt like evidence while the subject was never
 * exercised. Here the subject is driven through the SUITE, whose own arms build real
 * repositories under `os.tmpdir()`; the estate's refs are read and never written. The one
 * thing an arm does perturb is a source file, and the baseline row is what proves the arms
 * are the cause: a harness once reported `null` for every arm INCLUDING the baseline, and
 * only the baseline row distinguished six-arms-broken from six-arms-working.
 *
 * The arms, each with what MUST fail and what MUST NOT, declared before arming:
 *
 *   A1  `absent` classified as `published`         -> C1 FAILS. The NAMING path is what
 *       (the naming path made unreachable)            does the work, not the walk's size.
 *   A2  the `integrated` escape removed            -> C2 and B1 FAIL. The quiet is a
 *                                                     JUDGEMENT, not an empty corpus.
 *   A3  `published` made sha-EQUALITY only         -> B3 FAILS: a remote that is AHEAD
 *       (OVER-STRICTNESS)                             reads as stranded and the warning
 *                                                     starts crying wolf, which is how a
 *                                                     WARN gets switched off.
 *   A4  `diverged` collapsed into `published`      -> section 5 FAILS. This is the receipt
 *       (D-288's LITERAL name-presence reading)       for reading the row's phrase as
 *                                                     REACHABILITY: the literal test is
 *                                                     quiet over live unpublished work,
 *                                                     and this estate is in that state.
 *   A5  plancheck's arm deleted                    -> section 9 FAILS. The arm proving the
 *                                                     GATE and not merely the library.
 *   A6  plancheck's `warn(...)` promoted to `fail` -> section 9's "never FAIL" and
 *       (the ruling, inverted)                        "exits 0" arms FAIL.
 *   A7  the shell-string plumbing restored         -> section 7's real-estate arms FAIL.
 *       (THIS MODULE'S OWN FIRST DEFECT)              `--format=%(refname:short)` is a
 *                                                     /bin/sh syntax error, the failure was
 *                                                     swallowed, and the audit reported
 *                                                     all-zero over seven branches. The
 *                                                     liar M0-48's acceptance names,
 *                                                     re-armed from the real receipt.
 *
 * **TWO OF THESE SEVEN CAME BACK WRONG ON THEIR FIRST RUN AND BOTH FINDINGS WERE ABOUT THE
 * ARM RATHER THAN THE SUBJECT**, which is what this project says controls mostly find. A5
 * broke the import by appending a FRAGMENT to the specifier — Node resolves `#fragment` on a
 * file specifier, so the patch matched once, reported `the arm ARMED`, and changed nothing:
 * an arm that did not arm. A7 did arm, but the suite ended at section 2 on a TypeError
 * reading `stranded[0].state` of an empty list, so the assertion A7 predicted never ran. The
 * fixes are at both ends — A5 now names a module that does not exist, A7 also asserts the
 * suite reached its FOOT, and every `[0]` read in the suite is now `[0]?.`. Kept in the
 * header because `hits === 1` proves a patch APPLIED and only the downstream assertion proves
 * it had an EFFECT, and that distinction is the whole value of a control driver.
 *
 * MUST NOT fail in any arm: the suite's section 1 (the sandbox is outside the estate) and
 * section 10 (the mechanism is in WORKER.md's loop) — neither is downstream of any arm, so
 * an arm that takes them down has perturbed a second variable and its refutation is not
 * believable (CLAUDE.md, the arm-that-fired-at-the-wrong-thing class).
 */
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PEN = join(REPO, ".m048-harness");
const PRED = join(REPO, "tools/strandedbranches.mjs");
const PLANCHECK = join(REPO, "tools/plancheck.mjs");
const SUITE = join(REPO, "bio-plane/test/strandedbranches.test.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

mkdirSync(PEN, { recursive: true });
const pristine = new Map();
for (const [name, p] of [["predicate", PRED], ["plancheck", PLANCHECK]]) {
  const copy = join(PEN, `pristine.${name}`);
  writeFileSync(copy, readFileSync(p));
  pristine.set(p, { copy, sha: sha(p), bytes: statSync(p).size });
  console.log(`  pristine ${name}: ${statSync(p).size} bytes, sha256 ${sha(p).slice(0, 8)}…`);
}
const MIN_BYTES = { [PRED]: 6000, [PLANCHECK]: 15000 };
function restore(p) {
  const { copy, sha: want, bytes } = pristine.get(p);
  writeFileSync(p, readFileSync(copy));
  const got = sha(p), size = statSync(p).size;
  const cmp = spawnSync("cmp", ["-s", p, copy]).status === 0;
  const ok = got === want && cmp && size === bytes && size >= MIN_BYTES[p];
  console.log(`  restored ${p.slice(REPO.length + 1)}: ${size} bytes, sha256 ${got.slice(0, 8)}…, `
    + `cmp ${cmp ? "identical" : "DIFFERS"} — byte-identical: ${ok ? "YES" : "NO"}`);
  return ok;
}

/* An arm that did not arm is a finding, so every patch reports its own match count and the
   arm asserts it before believing anything downstream. */
function armPatch(file, from, to) {
  const before = readFileSync(file, "utf8");
  const hits = before.split(from).length - 1;
  if (hits === 1) writeFileSync(file, before.replace(from, to));
  return hits;
}

const suiteRun = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: REPO, encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tally = out.match(/strandedbranches: (\d+) pass, (\d+) fail/);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]);
  return { out, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1,
           reachedFoot: !!tally, status: r.status, failed };
};
/* Did a NAMED assertion fail? Substring, because the labels carry prose. */
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
/* The two arms that must survive every arm — a refutation that also takes these down has
   moved a second variable. */
const collateral = (s) => broke(s, "scratch root is NOT under the repository")
                       || broke(s, "WORKER.md's push step");

/* --------------------------------------------------------------- BASELINE */
console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = suiteRun();
  t("baseline · the suite reached its own FOOT (a TypeError inside an assertion ends the "
  + "module with the tally reading clean)", s.reachedFoot, true);
  t("baseline · the suite is GREEN", [s.pass > 30, s.fail, s.status], [true, 0, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
}

/* ------------------------------------------------- A1 · the arm this item exists for */
console.log("\n--- ARM A1 · `absent` classified as `published` (armed ALONE) ---");
{
  const hits = armPatch(PRED, `else if (!r.remoteSha) r.state = "absent";`,
                              `else if (!r.remoteSha) r.state = "published";`);
  t("A1 · the arm ARMED (patch matched exactly once)", hits, 1);
  const s = suiteRun();
  t("A1 · C1 FAILS — the planted branch is no longer named",
    broke(s, "C1 the planted branch is NAMED"), true);
  t("A1 · ...and the failure is not collateral", collateral(s), false);
  t("A1 · RESTORED byte-identically", restore(PRED), true);
}

/* ------------------------------------------- A2 · the quiet is a judgement, not emptiness */
console.log("\n--- ARM A2 · the `integrated` escape REMOVED (armed ALONE) ---");
{
  const hits = armPatch(PRED, `if (mainSha && reachable(repo, b.sha, mainSha)) r.state = "integrated";`,
                              `if (false) r.state = "integrated";`);
  t("A2 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A2 · C2 FAILS — a merged branch is named again",
    broke(s, "C2 the branch is no longer named"), true);
  t("A2 · B1 FAILS too — the same escape, reached from the other side",
    broke(s, "B1 a merged branch is unnamed"), true);
  t("A2 · ...and the failure is not collateral", collateral(s), false);
  t("A2 · RESTORED byte-identically", restore(PRED), true);
}

/* --------------------------------------------------- A3 · THE OVER-STRICTNESS ARM */
console.log("\n--- ARM A3 · `published` made sha-EQUALITY only, dropping the ancestry "
          + "fallback (armed ALONE) ---");
{
  const hits = armPatch(PRED,
    `else if (r.remoteSha === b.sha || reachable(repo, b.sha, r.remoteSha)) r.state = "published";`,
    `else if (r.remoteSha === b.sha) r.state = "published";`);
  t("A3 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A3 · B3 FAILS — a remote that is AHEAD now reads as stranded",
    broke(s, "B3 the remote being AHEAD is not stranding"), true);
  t("A3 · C1 does NOT fail — the naming path is untouched, so this arm is over-strictness "
  + "and not a second break", broke(s, "C1 the planted branch is NAMED"), false);
  t("A3 · ...and the failure is not collateral", collateral(s), false);
  t("A3 · RESTORED byte-identically", restore(PRED), true);
}

/* ------------------------------- A4 · D-288's LITERAL reading, which is the design receipt */
console.log("\n--- ARM A4 · `diverged` collapsed into `published` — the NAME-PRESENCE "
          + "reading of D-288's phrase (armed ALONE) ---");
{
  const hits = armPatch(PRED,
    `else if (r.remoteSha === b.sha || reachable(repo, b.sha, r.remoteSha)) r.state = "published";`,
    `else if (r.remoteSha) r.state = "published";`);
  t("A4 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A4 · the DIVERGED arm FAILS — a branch on the remote by name, holding local commits "
  + "the remote lacks, goes unnamed",
    broke(s, "is NAMED anyway, because its tip is not reachable"), true);
  t("A4 · ...and the failure is not collateral", collateral(s), false);
  t("A4 · RESTORED byte-identically", restore(PRED), true);
}

/* ------------------------------------------------------------- A5 · THE GATE */
console.log("\n--- ARM A5 · plancheck's arm DELETED (armed ALONE) ---");
{
  /* THE SPELLING MATTERS AND THE FIRST ONE DID NOT ARM — recorded rather than smoothed,
     because it is this file's own instance of the class it was written to catch. The first
     draft appended a FRAGMENT (`…strandedbranches.mjs#gone`), reasoning that a bad specifier
     would throw into plancheck's `.catch`. **Node resolves `#fragment` and `?query` on a file
     specifier** — the import succeeded, the arm changed nothing, and the run reported
     `the arm ARMED` on a patch that had matched exactly once and done nothing. `hits === 1`
     proves a patch APPLIED; only the downstream assertion proves it had an EFFECT. */
  const hits = armPatch(PLANCHECK, `await import("./strandedbranches.mjs")`,
                                   `await import("./strandedbranches-DELETED-BY-A5.mjs")`);
  t("A5 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A5 · the GATE arm FAILS — plancheck no longer reports the walk",
    broke(s, "plancheck reports the stranded-branch walk"), true);
  t("A5 · ...and the failure is not collateral", collateral(s), false);
  t("A5 · RESTORED byte-identically", restore(PLANCHECK), true);
}

/* ---------------------------------------------- A6 · the WARN ruling, inverted */
console.log("\n--- ARM A6 · plancheck's WARN promoted to a FAIL (armed ALONE) ---");
{
  const hits = armPatch(PLANCHECK, `if (a.stranded.length) warn(strandedMessage(a));`,
                                   `if (a.stranded.length) fail(strandedMessage(a));`);
  t("A6 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A6 · the `never a FAIL` arm FAILS",
    broke(s, "the finding is a WARN, never a FAIL"), true);
  t("A6 · ...and the exit-0 arm FAILS with it, which is the consequence the ruling forbids",
    broke(s, "plancheck --local exits 0"), true);
  t("A6 · ...and the failure is not collateral", collateral(s), false);
  t("A6 · RESTORED byte-identically", restore(PLANCHECK), true);
}

/* --------------------------- A7 · THIS MODULE'S OWN FIRST DEFECT, RE-ARMED FROM THE RECEIPT */
console.log("\n--- ARM A7 · the shell-string plumbing restored — the silent empty walk "
          + "(armed ALONE) ---");
{
  const hits = armPatch(PRED, `    return execFileSync("git", args, {`,
    `    return execFileSync("/bin/sh", ["-c", \`git \${args.join(" ")}\`], {`);
  t("A7 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A7 · the REAL-ESTATE arm FAILS — the walk finds nothing where seven branches exist",
    broke(s, "this clone has local worker branches to judge"), true);
  t("A7 · ...and C1 fails too: the planted branch is not seen either",
    broke(s, "C1 the planted branch is NAMED"), true);
  /* The suite must still REACH ITS FOOT while failing. This arm is why every `[0]` read in
     the suite is `[0]?.`: the first run of it ended the module at section 2 on a TypeError,
     so sections 3..10 reported nothing and the real-estate arm above never ran. A suite that
     dies on its own subject's failure hides everything else that failure broke. */
  t("A7 · ...and the suite survived to report it rather than dying at the first assertion",
    s.reachedFoot, true);
  t("A7 · ...and the failure is not collateral", collateral(s), false);
  t("A7 · RESTORED byte-identically", restore(PRED), true);
}

/* --------------------------------------------------------------- CLOSING BASELINE */
console.log("\n--- ARM BASELINE (closing) · every arm restored ---");
{
  const s = suiteRun();
  t("closing · the suite is GREEN again, so no arm leaked", [s.fail, s.status], [0, 0]);
  console.log(`  closing suite: ${s.pass} pass, ${s.fail} fail`);
}

console.log(`\nstrandedbranches.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
