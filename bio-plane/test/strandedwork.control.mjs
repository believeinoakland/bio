#!/usr/bin/env node
/* M0-48's NEGATIVE CONTROL DRIVER — NINE arms plus an opening and closing baseline — over
 * the stranded-work predicate in `tools/strandedwork.mjs`, its arm in `tools/plancheck.mjs`,
 * and the suite that drives both, `bio-plane/test/strandedwork.test.mjs`.
 *
 *   node bio-plane/test/strandedwork.control.mjs        (from the repo root)
 *
 * COMMITTED so the next session re-runs it in ONE step instead of re-deriving how to break the
 * subject. Every arm is armed ALONE with the others held open, against a UNIQUELY-NAMED
 * pristine copy in this worktree's own pen (`.m048-harness/`, never a shared scratchpad), and
 * every restore is verified by sha256 AND by `cmp` AND by a floored byte count — because
 * `git checkout --` restores to HEAD, which in a tree with uncommitted work is "throw mine
 * away" and exits 0 either way (CLAUDE.md, measured twice in two days).
 *
 * **NO ARM TOUCHES A REF, A WORKTREE OR A WORKING TREE.** The caution carried onto M0-48's row
 * is that the last two controls run against `plancheck` were BOTH defeated by the method
 * dirtying the tree — a rename and a `chmod 000`, each of which made the run fail on
 * UNPUBLISHED and exit 1, producing a NAMED failure that felt like evidence while the subject
 * was never exercised. Here the subject is driven through the SUITE, whose own arms build real
 * repositories and real linked worktrees under `os.tmpdir()`; the estate's refs and trees are
 * READ and never written. The one thing an arm perturbs is a source file, and the baseline rows
 * are what prove the arms are the cause: a harness once reported `null` for every arm INCLUDING
 * the baseline, and only the baseline row distinguished six-arms-broken from six-arms-working.
 *
 * THE ARMS, each with what MUST fail and what MUST NOT, declared before arming:
 *
 *   A1  `unpushed` never classified            -> S2 FAILS. The NAMING path is what does the
 *                                                 work, not the size of the walk.
 *   A2  the `nothing committed` exemption gone  -> S5 FAILS. The quiet over an idle worktree is
 *                                                 a JUDGEMENT, not an empty corpus.
 *   A3  `carriedBy`'s ancestry fallback made     -> S8 FAILS: a remote that is AHEAD reads as
 *       sha-EQUALITY only                           stranded and the arm starts crying wolf,
 *       (OVER-STRICTNESS)                           which is how a WARN gets switched off.
 *                                                   IT ARMED `onRemote` UNTIL 2026-09-17 — see
 *                                                   the note under A9 for why that stopped
 *                                                   being able to fail.
 *   A4  `behind` collapsed into clear           -> S3 FAILS. D-288's literal name-presence
 *       (D-288's LITERAL reading)                  reading, and the receipt for comparing the
 *                                                 local HEAD against the REMOTE REF: both HEADs
 *                                                 M-38 caught this way ended in a release
 *                                                 commit that reached nobody.
 *   A5  the enumeration narrowed to a           -> S6 FAILS. The receipt for keying on what a
 *       `worktree-agent-*` name filter             worktree IS: the first specification's glob
 *       (THE FIRST SPECIFICATION, RE-ARMED)        could not see `rec111-unit-count-bound` or
 *                                                 any `claude/*` worktree — and would have
 *                                                 PASSED a control that planted a
 *                                                 `worktree-agent-*` branch.
 *   A6  the third window deleted                -> S4 FAILS and S5 STILL PASSES. Uncommitted
 *                                                 work is a window of its own that no push
 *                                                 closes, and removing it must not also break
 *                                                 the over-strictness arm.
 *   A7  plancheck's arm made unloadable         -> S9 FAILS. The arm proving the GATE rather
 *                                                 than the library.
 *   A8  plancheck's `warn(...)` -> `fail(...)`  -> S9's never-FAIL and exit-0 arms FAIL, which
 *       (BOB #12's ruling, inverted)               is the consequence the ruling forbids.
 *   A9  the carrier walk reverted to a lookup   -> S11 FAILS and its OVER-STRICTNESS TWIN DOES
 *       by BRANCH NAME                             NOT. The defect as the estate actually had
 *       (THE SPELLING DEFECT, RE-ARMED)            it on 2026-09-17, and the arm that proves
 *                                                  S11 is not passing for free.
 *
 * **THIS DRIVER FOUND TWO REAL DEFECTS IN THE SUBJECT, AND THEY ARE THE JUSTIFICATION FOR IT
 * EXISTING RATHER THAN A FOOTNOTE.** With A1 armed, a unit with no remote ref fell through the
 * `else if` into `behind`, and `strandedMessage` dereferenced a null `remoteSha` and THREW —
 * **`plancheck` died from inside a WARN path, which removes every check after it and is far
 * worse than the missing warning it stood in for.** Both ends are now fixed: each window's
 * condition states its own precondition instead of leaning on the arm above it, and the
 * message uses `?.` with a stated fallback. **Neither defect is reachable from the estate's
 * current state, so no run and no reader would have found them** — only breaking the thing on
 * purpose did.
 *
 * **AND THREE ARMS CAME BACK WRONG, ALL THREE FINDINGS ABOUT THE ARM RATHER THAN THE SUBJECT**,
 * which is what this project says controls mostly find.
 * One broke an import by appending a FRAGMENT to the specifier — **Node resolves `#fragment`
 * and `?query` on a file specifier**, so the patch matched once, reported `the arm ARMED`, and
 * changed nothing. A2 patched `onMain` and changed nothing either, because an idle worktree's
 * tip IS `origin/main` and the commit count is 0 by either route — the real exemption is
 * `ahead > 0`, which is what it arms now. And A5's second assertion was satisfied by the
 * ORPHAN-BRANCH pass: with the worktree enumeration narrowed, the branch reappeared through
 * pass B, so the arm still saw something. **That backstop is real and worth having, and an
 * assertion satisfied by it cannot tell a working enumeration from a broken one** — it now
 * asserts on the WORKTREE. Kept because `hits === 1` proves a patch APPLIED and only the
 * downstream assertion proves it had an EFFECT, and that distinction is the whole value of a
 * control driver.
 *
 * **A9 ADDED 2026-09-17, AND ARMING IT BROKE A3 — WHICH IS THE THIRD REAL DEFECT THIS DRIVER HAS
 * FOUND AND THE ONLY ONE IT FOUND IN ITSELF.** The fix that added `carriedBy` moved the
 * over-strictness protection out of `onRemote` and into the carrier walk, leaving `onRemote`
 * read by no window at all. A3 went on arming `onRemote`, matched exactly once, reported *the
 * arm ARMED* — and S8 stayed GREEN, because nothing downstream read what it had broken.
 * **An arm that cannot fail, manufactured by a correct fix to the subject, and invisible to
 * anyone who re-read the arm rather than running it.** `hits === 1` said the patch applied and
 * only the downstream assertion could say it had an EFFECT — the distinction this header
 * already named, arriving in the file that named it. The lesson generalises past this driver:
 * **a control arm is coupled to WHERE the behaviour lives, so a refactor that moves the
 * behaviour silently disarms every arm pointed at its old home.** Re-run the control after
 * changing the subject, and read the arms' results rather than the subject's.
 *
 * MUST NOT fail in any arm: the suite's section 1 (the sandbox is outside the estate) and
 * section 10 (the mechanism is in the loop the reader runs) — neither is downstream of any arm,
 * so an arm that takes them down has perturbed a second variable and its refutation is not
 * believable (CLAUDE.md, the arm-that-fired-at-the-wrong-thing class).
 */
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { ANCHOR_DRY, anchorRows, anchorTable } from "../scripts/anchortable.mjs";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
/* M0-197: under the dry read of tools/anchordrift.mjs the pristine copies land in its throwaway $TMPDIR, not the tree;
   nothing is patched, run or restored there — each arm's ONE armPatch call records its anchor (A1..A9, in file order). */
const PEN = ANCHOR_DRY ? join(tmpdir(), "m048-harness") : join(REPO, ".m048-harness");
const PRED = join(REPO, "tools/strandedwork.mjs");
const PLANCHECK = join(REPO, "tools/plancheck.mjs");
const SUITE = join(REPO, "bio-plane/test/strandedwork.test.mjs");

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
const MIN_BYTES = { [PRED]: 8000, [PLANCHECK]: 15000 };
function restore(p) {
  if (ANCHOR_DRY) return true;   /* M0-197 */
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
let dryArms = 0;   /* M0-197 */
function armPatch(file, from, to) {
  if (ANCHOR_DRY) return (anchorRows([{ arm: `A${++dryArms}`, file, find: from, put: to }]), 1);   /* M0-197: read, never armed */
  const before = readFileSync(file, "utf8");
  const hits = before.split(from).length - 1;
  if (hits === 1) writeFileSync(file, before.replace(from, to));
  return hits;
}

const suiteRun = () => {
  if (ANCHOR_DRY) return { out: "", pass: -1, fail: -1, reachedFoot: false, status: null, failed: [] };   /* M0-197: no suite */
  const r = spawnSync(process.execPath, [SUITE], { cwd: REPO, encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tally = out.match(/strandedwork: (\d+) pass, (\d+) fail/);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]);
  return { out, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1,
           reachedFoot: !!tally, status: r.status, failed };
};
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
/* The two arms that must survive every arm — a refutation that also takes these down has moved
   a second variable, and its confidence is the signature of `cannot reproduce`. */
const collateral = (s) => broke(s, "scratch root is NOT under the repository")
                       || broke(s, "WORKER.md runs plancheck");

/* --------------------------------------------------------------- BASELINE */
console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = suiteRun();
  t("baseline · the suite reached its own FOOT (a TypeError inside an assertion ends the "
  + "module with the tally reading clean)", s.reachedFoot, true);
  t("baseline · the suite is GREEN", [s.pass > 40, s.fail, s.status], [true, 0, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
}

/* ---------------------------------------------- A1 · the naming path for window 1 */
console.log("\n--- ARM A1 · `unpushed` never classified (armed ALONE) ---");
{
  const hits = armPatch(PRED, `if (ahead > 0 && !carrier && !remoteSha) windows.push("unpushed");`,
                              `if (false) windows.push("unpushed");`);
  t("A1 · the arm ARMED (patch matched exactly once)", hits, 1);
  const s = suiteRun();
  t("A1 · S2 FAILS — the never-pushed worktree is no longer named",
    broke(s, "the worktree is NAMED"), true);
  t("A1 · ...and the suite survived to report it", s.reachedFoot, true);
  t("A1 · ...and the failure is not collateral", collateral(s), false);
  t("A1 · RESTORED byte-identically", restore(PRED), true);
}

/* ------------------------------------------- A2 · the quiet is a judgement, not emptiness */
console.log("\n--- ARM A2 · the `nothing committed` exemption REMOVED (armed ALONE) ---");
{
  /* THE ESCAPE IS `ahead > 0`, NOT the `onMain` boolean — and the first version of this arm
     patched `onMain` and CHANGED NOTHING, because an idle worktree's tip is `origin/main` so
     the commit count is 0 either way. It reported `the arm ARMED` on a patch that had matched
     once and had no effect: the arm-that-did-not-arm class, caught by the downstream
     assertion rather than by the patch count. */
  const hits = armPatch(PRED, `if (ahead > 0 && !carrier && !remoteSha) windows.push("unpushed");`,
                              `if (!carrier && !remoteSha) windows.push("unpushed");`);
  t("A2 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A2 · S5 FAILS — an idle worktree is named", broke(s, "an idle worktree is NOT named"), true);
  t("A2 · ...and the suite survived to report it", s.reachedFoot, true);
  t("A2 · ...and the failure is not collateral", collateral(s), false);
  t("A2 · RESTORED byte-identically", restore(PRED), true);
}

/* --------------------------------------------------- A3 · THE OVER-STRICTNESS ARM */
console.log("\n--- ARM A3 · `onRemote` made sha-EQUALITY only, dropping the ancestry "
          + "fallback (armed ALONE) ---");
{
  /* THE ARM MOVED WITH THE PROTECTION, AND THE MOVE IS THE FINDING. This armed `onRemote`
     until 2026-09-17, when `carriedBy` took over the classification and `onRemote` stopped
     being read by any window — at which point THIS ARM COULD NO LONGER FAIL and reported a
     green S8 over a broken predicate. It was caught by running the control after the change
     rather than by anyone re-reading the arm. The ancestry fallback that protects against
     over-strictness now lives in `carriedBy`, so that is what this arms. */
  const hits = armPatch(PRED,
    `    return (sha === head || ancestor(repo, head, sha)) ? { ref, sha } : null;`,
    `    return (sha === head) ? { ref, sha } : null;`);
  t("A3 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A3 · S8 FAILS — a remote that is AHEAD now reads as stranded",
    broke(s, "a remote that is AHEAD is NOT stranding"), true);
  /* S11 pushes to a sha EQUAL to the head, so dropping the ancestry fallback must not touch
     it. If it did, this arm would be perturbing reachability as well as over-strictness. */
  t("A3 · S11 does NOT fail — this arm is over-strictness alone, not the spelling defect",
    broke(s, "THE DEFECT: it is NOT named as stranded"), false);
  t("A3 · S2 does NOT fail — the naming path for window 1 is untouched, so this arm is "
  + "over-strictness and not a second break", broke(s, "the worktree is NAMED"), false);
  t("A3 · ...and the failure is not collateral", collateral(s), false);
  t("A3 · RESTORED byte-identically", restore(PRED), true);
}

/* -------------------------- A4 · D-288's LITERAL reading, which is the design receipt */
console.log("\n--- ARM A4 · `behind` collapsed into clear — the NAME-PRESENCE reading of "
          + "D-288's phrase (armed ALONE) ---");
{
  const hits = armPatch(PRED, `else if (ahead > 0 && !carrier && remoteSha) windows.push("behind");`,
                              `else if (false) windows.push("behind");`);
  t("A4 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A4 · S3 FAILS — a worktree on the remote by name, holding commits the remote lacks, "
  + "goes unnamed", broke(s, "and the worktree is NAMED anyway"), true);
  t("A4 · ...and the suite survived to report it", s.reachedFoot, true);
  t("A4 · ...and the failure is not collateral", collateral(s), false);
  t("A4 · RESTORED byte-identically", restore(PRED), true);
}

/* ------------------------- A5 · THE FIRST SPECIFICATION'S GLOB, RE-ARMED FROM THE RECEIPT */
console.log("\n--- ARM A5 · the enumeration narrowed back to a `worktree-agent-*` name filter "
          + "(armed ALONE) ---");
{
  const hits = armPatch(PRED, `  return { units: units.filter((u) => !u.bare), failed: false };`,
    `  return { units: units.filter((u) => !u.bare && (u.branch || "").startsWith("worktree-agent-")), failed: false };`);
  t("A5 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A5 · S6 FAILS — a `rec*`-style branch becomes invisible",
    broke(s, "a `rec*`-style branch is seen"), true);
  t("A5 · ...and so does a `claude/*` session worktree",
    broke(s, "and a `claude/*` session worktree is seen too, AS A WORKTREE"), true);
  t("A5 · ...and the suite survived to report it", s.reachedFoot, true);
  t("A5 · ...and the failure is not collateral", collateral(s), false);
  t("A5 · RESTORED byte-identically", restore(PRED), true);
}

/* --------------------------------------------------------- A6 · the third window */
console.log("\n--- ARM A6 · the UNCOMMITTED window deleted (armed ALONE) ---");
{
  const hits = armPatch(PRED,
    `    if (u.tree && (u.tree.modified > 0 || u.tree.untracked > 0)) windows.push("uncommitted");`,
    `    if (false) windows.push("uncommitted");`);
  t("A6 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A6 · S4 FAILS — a clean tip with modified tracked files goes unnamed",
    broke(s, "the worktree is NAMED although its tip is exactly origin/main"), true);
  t("A6 · ...and S5's over-strictness half STILL PASSES, so this arm removed one window "
  + "and not the judgement", broke(s, "an idle worktree is NOT named"), false);
  t("A6 · ...and the failure is not collateral", collateral(s), false);
  t("A6 · RESTORED byte-identically", restore(PRED), true);
}

/* ------------------------------------------------------------- A7 · THE GATE */
console.log("\n--- ARM A7 · plancheck's arm made UNLOADABLE (armed ALONE) ---");
{
  const hits = armPatch(PLANCHECK, `await import("./strandedwork.mjs")`,
                                   `await import("./strandedwork-DELETED-BY-A7.mjs")`);
  t("A7 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A7 · S9 FAILS — plancheck no longer reports the walk",
    broke(s, "plancheck reports the stranded-work walk"), true);
  t("A7 · ...and the failure is not collateral", collateral(s), false);
  t("A7 · RESTORED byte-identically", restore(PLANCHECK), true);
}

/* ---------------------------------------------- A8 · BOB #12's WARN ruling, inverted */
console.log("\n--- ARM A8 · plancheck's WARN promoted to a FAIL (armed ALONE) ---");
{
  const hits = armPatch(PLANCHECK, `if (a.exposed.length) warn(strandedMessage(a));`,
                                   `if (a.exposed.length) fail(strandedMessage(a));`);
  t("A8 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A8 · the `never a FAIL` arm FAILS",
    broke(s, "the finding is a WARN, never a FAIL"), true);
  t("A8 · ...and the exit-0 arm FAILS with it, which is the consequence the ruling forbids",
    broke(s, "plancheck --local exits 0"), true);
  t("A8 · ...and the failure is not collateral", collateral(s), false);
  t("A8 · RESTORED byte-identically", restore(PLANCHECK), true);
}

/* ------------------------------- A9 · REACHABILITY REVERTED TO THE SPELLING (the real defect) */
console.log("\n--- ARM A9 · the carrier walk removed, so the remote is asked by BRANCH NAME "
          + "again — the state the estate was actually in on 2026-09-17 (armed ALONE) ---");
{
  /* THIS ARM IS THE DEFECT ITSELF, NOT A HYPOTHETICAL: reverting `carriedBy` to the same-name
     lookup restores the predicate that called `origin/conduct2-wip-20260917`'s own tip *no
     remote ref at all* and told the reader to push a live integrator's ungated tree under a
     second name. **The obvious arm — push under the branch's OWN name and require silence —
     cannot fail here, because the broken predicate is silent there too** (CONDUCT #2). S11 is
     built on a push under a DIFFERENT name for exactly that reason, and this arm is what
     proves S11 is not passing for free. */
  const hits = armPatch(PRED,
    `    const carrier = ahead > 0 ? carriedBy(repo, u.head, rem.map, u.branch) : null;`,
    `    const carrier = remoteSha && onRemote ? { ref: u.branch, sha: remoteSha } : null;`);
  t("A9 · the arm ARMED", hits, 1);
  const s = suiteRun();
  t("A9 · S11 FAILS — work pushed under another name reads as stranded again",
    broke(s, "THE DEFECT: it is NOT named as stranded"), true);
  t("A9 · ...and the carrier is no longer identified, so the silence had a REASON and not "
  + "merely an outcome", broke(s, "the carrier is IDENTIFIED"), true);
  /* The discriminating half, stated as an assertion rather than as a hope: the over-strictness
     twin must be UNAFFECTED. If it broke too, the arm has moved a second variable and its
     refutation is not believable — the arm-that-fired-at-the-wrong-thing class. */
  t("A9 · S11's over-strictness twin does NOT fail — a genuinely stranded tree is still "
  + "named, so this arm is the spelling defect and not a second break",
    broke(s, "a tree NO ref carries is still NAMED"), false);
  t("A9 · S2 does NOT fail either — window 1's naming path is untouched",
    broke(s, "the worktree is NAMED"), false);
  t("A9 · ...and the suite survived to report it", s.reachedFoot, true);
  t("A9 · ...and the failure is not collateral", collateral(s), false);
  t("A9 · RESTORED byte-identically", restore(PRED), true);
}

anchorTable();   /* M0-197: prints the arms read above and exits, under the dry read only */

/* --------------------------------------------------------------- CLOSING BASELINE */
console.log("\n--- ARM BASELINE (closing) · every arm restored ---");
{
  const s = suiteRun();
  t("closing · the suite is GREEN again, so no arm leaked", [s.fail, s.status], [0, 0]);
  console.log(`  closing suite: ${s.pass} pass, ${s.fail} fail`);
}

console.log(`\nstrandedwork.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
