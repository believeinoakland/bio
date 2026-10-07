#!/usr/bin/env node
/* THE NEGATIVE CONTROL DRIVER for FL-3 (the run harness, IS-9) — NINETEEN ARMS
 * IN THREE FAMILIES, no baseline row. Deliberately NOT a `.test.mjs`: it EDITS
 * REAL SOURCES while it runs, and no runner may discover it — the package's
 * `npm test` and `node --test` take only `*.test.mjs` (FL-2/PL-3/PL-4's precedent).
 *
 * THE FAMILIES, so a reader can hold the count against the run without reading
 * to the foot: **H1-H10** are FL-3's own arms (H10 is the over-strictness arm);
 * **F1-F4** are FL-8's, on the launch gate's vocabulary; **G1-G5** are D-323 and
 * D-324's, on a gate-refused run's STATUS; **T1-T2** are FL-11's and FL-12's (2026-09-23), on the run's
 * target and the capture request's `address`; **T3** is D-451's (2026-09-25), on a project run's published
 * questions; **D1-D2** are D-452's (2026-09-24), on a dropped candidate
 * dropping ONE candidate and not the pass. 26 announcements, driven — MEASURED 2026-09-25 by D-451 (25 `arm()`
 * calls and H10; 25 before T3; the 21 this line carried before D-452 did not count SK-8's E1/E2).
 * T21 (AGENT-WORKER #8, N467, N469): the E, F and G arms that ran the plane's deleted `airun.test.mjs` and
 * `skillsequencing.test.mjs` are re-pointed to the module tests that took their shares (run-rules R1 and R9, ai-runs
 * R14, and this member's `requirements.test.mjs` R14, R42, R44), each said at its arm; G2 is retired (its subject was
 * a source-text arm no test holds now), as F3 was by N421; and **S1-S2** carry REC-100's two arms from its deleted
 * driver, `nc-rec100.mjs`. 28 announcements: 25 armed, F3 and G2 retired, H10 run.
 *
 * TALLY DECLARED HERE 2026-09-14 (M0-29, D-343), AND THE OLD SENTENCE IS KEPT
 * RATHER THAN CORRECTED, BECAUSE IT WAS NEVER WRONG. The only arm count this
 * file carried was in the RESULTS block below — *"ALL TEN ARMS AS DECLARED ON
 * THE RECORDED PASS"* — and that sentence is a true statement about a PAST RUN
 * on 2026-08-08, when ten arms were all there were. It reads as this driver's
 * tally only because nothing else here stated one; the F and G families arrived
 * after it, appended by later items (FL-8, then D-323+D-324), and appending arms
 * to a driver whose only count sits inside a dated results block is how the two
 * numbers came apart. So the RESULTS block keeps its ten, dated, and the
 * DECLARATION is this paragraph. THE ARMS ARE REAL: all nineteen announce, and
 * none is restored or removed.
 *
 *   node agent-worker/test/harness.control.mjs            all arms
 *   node agent-worker/test/harness.control.mjs H2 H9      named arms only
 *
 * THE RULES THIS HARNESS ENFORCES ON ITSELF are FL-2's, unchanged, and every one
 * of them was paid for by a defect this project has already met:
 *
 *  - **IT LIVES INSIDE THIS WORKTREE**, never in a shared scratchpad: a
 *    concurrent worker overwrote a harness between ARM and RESTORE once already.
 *  - **EVERY ARM IS ARMED ALONE**, with every other defence held OPEN.
 *  - **EVERY ARM DECLARES WHAT MUST FAIL *AND* WHAT MUST NOT** before it runs.
 *  - **AN ARM THAT DOES NOT ARM IS A FINDING, NOT A PASS.**
 *  - **A SUITE THAT DIED REPORTS `fail: -1`, NEVER 0** — a harness reading a
 *    missing tally as zero once recorded a killed suite as "stayed GREEN", which
 *    is the single most expensive instrument defect this estate has recorded.
 *  - **EVERY RESTORE IS VERIFIED BY sha256 AND BY `cmp`** against a copy taken
 *    before the edit. Two independent instruments, because one instrument
 *    agreeing with itself costs nothing.
 *  - **AN ARM THAT COMES BACK GREEN WHEN RED WAS PREDICTED IS RECORDED AS A
 *    FINDING ABOUT THE ARM**, not smoothed away.
 *
 * ===========================================================================
 * RESULTS — 2026-08-08, worktree agent-ad6e5ed43aac4a2ab, AND THE TEN BELOW IS
 * THE TEN THAT EXISTED ON THAT DATE (M0-29, 2026-09-14: kept as right when it
 * was written; the driver's current tally is the nineteen declared at the head).
 * Baseline before every
 * arm: `harness.test.mjs` **194 pass / 0 fail**, `agent-worker.test.mjs`
 * **98 pass / 0 fail**, `coverage.mjs --strict` exit 0. Every figure below is
 * MEASURED. **ALL TEN ARMS AS DECLARED ON THE RECORDED PASS — but FOUR CAME
 * BACK WRONG FIRST AND EVERY ONE OF THEM WAS A FINDING ABOUT THE INSTRUMENT
 * RATHER THAN THE SUBJECT. They are recorded, not smoothed.**
 *
 *   H1  compose gains a `submit` edge and nextStep takes it -> **166 pass, 28
 *       FAIL**: the edge arms fail; the gate and budget arms hold.
 *       **CAME BACK WRONG TWICE.** (i) The patch matched ZERO times — it assumed
 *       `to:` was followed immediately by `submit: {` and `dedup` sits between
 *       them; the harness reported "THE ARM DID NOT ARM" rather than the green
 *       run underneath it, which is the failure mode that looks most like a
 *       pass. (ii) Re-armed, it exited 2 on a RESTORE MISMATCH: this arm takes a
 *       second snapshot of the same file, and `takeOriginal` named its copy from
 *       the file PATH alone, so the second snapshot OVERWROTE the first and the
 *       outer `cmp` compared the restored original against patched bytes. **The
 *       instrument was right and the harness was wrong** — and a harness
 *       trusting its own sha256 alone would have passed, because that hash was
 *       taken correctly. Copies now carry a counter.
 *       (iii) Its MUST-NOT was then wrong: it declared the F10 arms must hold
 *       and they did not. That is a real COUPLING and worth having found —
 *       `queue` is DEDUP'S OWN OUTPUT, so a run that skips dedup never submits,
 *       never earns a refusal, and gives F10 nothing to route. The declaration
 *       was corrected to the two families that share no state with the queue.
 *   H2  a refused submit routes back to `submit` -> **184 pass, 10 FAIL**: the
 *       F10 routing arms AND the `repeats`-counter arm fail; dedup holds.
 *       **CAME BACK WRONG FIRST: `0 pass, -1 FAIL` — the suite DIED rather than
 *       failing**, because `submits[1].body` threw when the armed defect made
 *       that collection short. A harness reading a missing tally as `0` would
 *       have recorded it as "stayed GREEN"; reporting `-1` is the only reason it
 *       was visible. THE CLASS WAS SWEPT: every nested read in the suite is now
 *       null-tolerant, not just the site that bit.
 *   H3  `adjust` returns to `submit` regardless of `adjusted` -> **191 pass,
 *       3 FAIL**: the dropped-candidate and never-sent-twice arms fail; the
 *       fan-out holds.
 *   H4  `maxPasses` removed from NOT_JUDGEABLE -> **189 pass, 4 FAIL**: the
 *       overreach arms fail BY NAME; the budget arms hold. This is SK-2's
 *       review criterion as code.
 *   H5  `MODES.investigate.deployed = true` -> **186 pass, 8 FAIL**: the gate
 *       arms fail and EVERY other arm holds, which is what shows the gate is a
 *       row rather than a side effect of something else.
 *   H6  the driver skips its tick on the terminal step -> **193 pass, 1 FAIL**:
 *       the log-always arms fail; the gate holds.
 *   H7  `internet` dropped from LEVELS -> **191 pass, 3 FAIL**: the source pin
 *       against the plane's OBSERVATION_LEVELS and the four-sub-sessions arm
 *       both fail; F10 holds.
 *   H8  a SECOND meaning reader named -> harness **192 pass, 2 FAIL** and member
 *       **95 pass, 3 FAIL**: the pinned-op-set arms fail in BOTH suites; the
 *       write arms hold, because the gained op is non-mutating — which is
 *       exactly why a write test alone would not catch it.
 *       **RE-MEASURED 2026-08-09 UNDER FL-5, WHICH MOVED THIS ARM'S SITE: harness
 *       193/1 and member 96/2, still AS DECLARED.** FL-5 gave the member a second
 *       CONSUMER of PL-9's read and routed both through one `meaningRead` helper,
 *       so the arm now inserts the second reader beside the citation re-read. The
 *       old find-string no longer exists in the source, and an arm whose patch
 *       matches zero times reports nothing while looking like a green run — which
 *       is why the figures are corrected here rather than left.
 *   H9  `emptyLevelCandidates` returns nothing -> **187 pass, 7 FAIL**: the
 *       empty-run arms fail. An empty run and a silent failure become
 *       indistinguishable, which is the defect §9's kind exists to prevent.
 *       **ALSO DIED (`-1`) ON THE FIRST RUN, same class as H2, swept with it.**
 *   H10 OVER-STRICTNESS, nothing broken -> harness **194 pass / 0 FAIL**, member
 *       **98 pass / 0 FAIL**, `coverage.mjs --strict` **exit 0**.
 *
 * ===========================================================================
 * RESULTS — FL-7's FOUR ARMS, 2026-08-10, worktree agent-a0301fcdabdaf43c6.
 * Baseline before every arm: `harness.test.mjs` **209 pass / 0 fail**,
 * `airun.test.mjs` **114 / 0**, `skillsequencing.test.mjs` **27 / 0**, battery
 * 164/164 · 10,117 assertions, `coverage.mjs --strict` exit 0. **ALL FOUR AS
 * DECLARED on the recorded pass; ONE came back wrong first and it was a finding
 * about the INSTRUMENT, recorded rather than smoothed.**
 *
 *   F1  the gate regresses to `cancelled` -> **harness 203/6 · skillsequencing
 *       22/5 · airun 114/0 (GREEN, as declared — its subject is the catalogue,
 *       which is untouched)**. DIRECTION 2 failed, DIRECTION 1 HELD, and a
 *       misattribution arm NAMED it rather than reporting an unequal string.
 *   F2  `mode-not-deployed` removed from the plane's RUN_ENDINGS -> **harness
 *       207/2 · airun 108/6**; DIRECTION 1 failed, the through-the-op arms G1/G2
 *       failed (C-22.5 refuses a bound the vocabulary no longer holds — which is
 *       what proves the op path is real), V6 failed.
 *       **CAME BACK WRONG FIRST: `airun 0 pass, -1 FAIL` — the suite DIED rather
 *       than failing.** FL-7's own new ARM G2 read
 *       `gl.entries[gl.entries.length - 1].bound`, and with the close REFUSED the
 *       log had no terminal entry, so the read threw and took every arm behind it
 *       down. Identical to this driver's H2/H9 and to FL-2's A3, and the fix was
 *       the same: **the CLASS was swept, not the site** — every nested read in
 *       FL-7's arms is null-tolerant now. Worth stating plainly: knowing the
 *       defect class did not prevent it, and running the control did.
 *   F3  the header's terminates-on claim changed to `cancelled` (a DIFFERENT
 *       REAL ending) -> **harness 208/1**. EXACTLY ONE assertion failed:
 *       DIRECTION 2 alone, with DIRECTION 1 GREEN. **This is the arm that earns
 *       the two-way claim** — it shows the two directions are two independent
 *       assertions and not one written twice, which no other arm can show.
 *   F4  OVER-STRICTNESS, ARMED: `cancelled`'s own sentence rewritten -> **airun
 *       112/2 · skillsequencing 26/1 · harness 209/0**. A genuine member
 *       cancellation is still asserted to read as a member act; the gate and the
 *       two-way arms were untouched, which is what shows the fix ADDED a word
 *       rather than making the two endings interchangeable.
 * ===========================================================================
 * RESULTS — FL-8's FIVE ARMS, 2026-09-10, worktree agent-a50bd4cc90737bcaf.
 * Baseline before every arm: `harness.test.mjs` **213 pass / 0 fail**,
 * `airun.test.mjs` **126 / 0**, battery **167/167 · 10,279 assertions** measured
 * on `main` before any edit. **ALL FIVE AS DECLARED, each armed ALONE.**
 *
 *   G1  the plane's `RUN_NEVER_STARTED` emptied, so a gate-refused run is
 *       recorded `finished` again -> **airun 122/4 · harness 212/1**. H1, H2,
 *       W3 and W5 failed and H2 NAMED the misdescription ("MISDESCRIBED: a
 *       launch the gate refused is on record as a run that FINISHED") rather
 *       than reporting an unequal string; the over-strictness partition H3, the
 *       vocabulary pin V9 and the source arm W1 all HELD.
 *   G2  the store's `runStatusFor(bound)` call replaced by an INLINE COPY that
 *       returns identical answers -> **airun 125/1. EXACTLY ONE assertion:
 *       ARM W1 alone.** Every behavioural arm stayed green, because nothing a
 *       caller can observe changed — only where the rule lives. **This is the
 *       arm that earns the two-way claim**, FL-7's F3 one item on: it shows the
 *       source-agreement assertion is a second independent claim rather than the
 *       behavioural one written twice, which no arm that breaks behaviour can
 *       show.
 *   G3  a FIFTH status term (`abandoned`) added with no producer -> **airun
 *       124/2**: V9 (the exact SET — the guard this vocabulary had never had)
 *       and W3 (vocabulary -> keying: every terminal term must be REACHABLE)
 *       failed, and nothing else. Two assertions because they are two claims.
 *   G4  OVER-STRICTNESS, ARMED: `cancelled` and `completed` swept into
 *       `RUN_NEVER_STARTED` -> **airun 123/3**: H3 (the whole partition), C4
 *       (the member cancellation's status, which FL-8 deliberately leaves
 *       standing) and W3 (`finished` becomes the term with no producer) failed;
 *       H1 and H2 HELD, which is what shows the arm measures OVER-reach and not
 *       the fix.
 *   G5  the plane mock's hand-written status keying put back, in the exact
 *       spelling it carried from FL-3 until FL-8 -> **harness 211/2 · airun
 *       126/0**: A6c2 and B7's FL-8 arm failed; A6c itself and both A6b
 *       directions held. **The defect this arm re-creates was REAL and was found
 *       by measurement rather than by a control: the mock had answered `stopped`
 *       for `mode-not-deployed` since FL-7 minted the ending while the plane
 *       answered `finished`, and nothing compared the two.**
 * ===========================================================================
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const MEMBER = join(HERE, "..");
const REPO = join(MEMBER, "..");
const PLANE = join(REPO, "bio-plane");

/* R65 (N586, T35): this member re-exports no other module's code, so `src/harness.mjs` is gone, and with it every
   arm that patched it. Those arms had armed nothing since T33-57 made the file a seven-line re-export (the code they
   named moved to `agent-harness`, whose own suite holds it). The arms below edit this member's own driver, or the
   files named beside each. */
const DRIVER = join(MEMBER, "src", "index.mjs");

const WORK = mkdtempSync(join(tmpdir(), "fl3-control-"));
process.on("exit", () => { try { rmSync(WORK, { recursive: true, force: true }); } catch { /* */ } });

const sha = (b) => createHash("sha256").update(b).digest("hex");
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));

let armsRun = 0, armsAsDeclared = 0;
const findings = [];

/* ------------------------------------------------------------- the runners */

/* A suite that DIED mid-run reports no tail line at all, and reading that as
   "0 failures" is how a control once read a whole file as "stayed GREEN". */
function runNamed(file, label) {
  const r = spawnSync(process.execPath, [join(HERE, file)], { cwd: MEMBER, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(new RegExp(`${label}:\\s*(\\d+) passed,\\s*(\\d+) failed`));
  const failed = [...out.matchAll(/^\s*FAIL\s+(.+)$/gm)].map((x) => x[1].trim());
  return m ? { ran: true, pass: +m[1], fail: +m[2], failed, out }
           : { ran: false, pass: 0, fail: -1, failed, out };
}
const runHarness = () => runNamed("harness.test.mjs", "harness");
const runMember = () => runNamed("agent-worker.test.mjs", "agent-worker");

const runReq = () => runNamed("requirements.test.mjs", "requirements");

/* FL-7's arms reach ACROSS THE TREE, and they have to. This item's defect had
   one half in the gate's ending (then `agent-worker/src/harness.mjs`, now `agent-harness`) and the other
   in run-rules (`bio-plane/src/run-rules/rules.mjs`, the catalogue that defines it), and the whole
   point of the fix is that the two are now asserted against EACH OTHER. An arm
   that could only run the member's suites could not measure that at all.
   RE-POINTED BY AGENT-WORKER #8 (T21, N467). These arms ran the plane's `airun.test.mjs` and
   `skillsequencing.test.mjs`, which failed at load before T20 and were deleted by it (LEGACY-TESTS #18); the
   properties they held are now the module tests of their owners, run here one file at a time under `node --test`:
   run-rules' R1 (`m/run-rules/rules.test.mjs`: the bounds, endings and statuses, `runStatusFor`, `cancelled`'s
   sentence), its R9 (`m/run-rules/deployment.test.mjs`) and ai-runs' R14 (`m/ai-runs/tick-close.test.mjs`: the one
   exit, read back from the run's row), and, for the deployment order's pins on this member, `requirements.test.mjs`
   (R14, R42, R44). A module test is named by its test's title; a file that did not report a tally (it died, or
   never ran) reads `fail: -1`, the same rule as above. */
function runModule(rel) {
  const r = spawnSync(process.execPath, ["--test", "--test-reporter=spec", join(PLANE, "test", "m", rel)],
    { cwd: REPO, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const p = out.match(/^ℹ pass (\d+)$/m), f = out.match(/^ℹ fail (\d+)$/m);
  const failed = [...new Set([...out.matchAll(/^\s*✖ (.+?) \([\d.]+m?s\)$/gm)].map((x) => x[1].trim())
    .filter((name) => !name.endsWith(".mjs")))];
  return p && f ? { ran: true, pass: +p[1], fail: +f[1], failed, out }
                : { ran: false, pass: 0, fail: -1, failed, out };
}
const runRules = () => runModule("run-rules/rules.test.mjs");
const runDeployment = () => runModule("run-rules/deployment.test.mjs");
const runTickClose = () => runModule("ai-runs/tick-close.test.mjs");
const RULES_R1 = /^R1: the bounds and endings/;
const DEPLOY_R9 = /^R9: DEPLOYMENT_SEQUENCE/;
const CLOSE_R14 = /^R14: the one exit/;
/* The run vocabulary moved from `airun.mjs` to run-rules (the ai-runs split, K617); the arms that edit it follow it
   (found by AGENT-WORKER #6 in T19: F2 had stopped arming). */
const AIRUN = join(PLANE, "src", "run-rules", "rules.mjs");

/* `scripts/coverage.mjs` is retired (legacy-index, K636 BOB-4): no arm spawns it any more. */

/* --------------------------------------------------------- arm / restore ---- */

/* THE COPY'S NAME CARRIES A COUNTER, AND THIS IS A CORRECTION PAID FOR ON THE
   FIRST RUN RATHER THAN A PRECAUTION. FL-2's harness derived the copy's name
   from the FILE PATH alone, which is correct while an arm takes one snapshot.
   H1 takes a SECOND snapshot of the same file inside its own `run()` (the arm
   patches two halves of one fence), and the second `takeOriginal` OVERWROTE the
   first copy with the already-patched bytes — so the outer restore wrote the
   real original and then `cmp`'d it against a copy that was no longer the
   original, reported a MISMATCH, and stopped the whole run at exit 2.
   **The instrument was right and the harness was wrong**, which is the outcome
   the two-instrument rule exists to produce: had `restore` trusted its own
   sha256 alone it would have passed, because the hash it compared against was
   taken correctly. Recorded rather than smoothed. */
let snapshots = 0;
function takeOriginal(file) {
  const bytes = readFileSync(file);
  const copy = join(WORK, `${++snapshots}-${file.replace(/[^\w]/g, "_")}.orig`);
  writeFileSync(copy, bytes);
  return { file, bytes, copy, sha: sha(bytes) };
}

function restore(orig) {
  writeFileSync(orig.file, orig.bytes);
  const hashOk = sha(readFileSync(orig.file)) === orig.sha;
  /* THE SECOND INSTRUMENT. A harness that trusted its own hash reported a
     byte-identical restore over a file it had never written. */
  const contentOk = spawnSync("cmp", ["-s", orig.file, orig.copy]).status === 0;
  if (!hashOk || !contentOk) {
    console.error(`\n  !!! RESTORE FAILED for ${orig.file} — sha256 ${hashOk ? "ok" : "MISMATCH"}, `
      + `cmp ${contentOk ? "ok" : "MISMATCH"}. STOPPING: the tree is not as it was found.`);
    process.exit(2);
  }
  return "restore verified (sha256 + cmp)";
}

function patch(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, hits: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, hits: 1 };
}

function arm({ id, subject, what, mustFail, mustNot, file, find, replace, run, retired }) {
  if (only.length && !only.includes(id)) return;
  /* An arm whose subject no longer exists says so rather than reading its absence as a finding (N421 retired one). */
  if (retired) { console.log(`\n=== ARM ${id} · ${subject}\n    RETIRED        : ${retired}`); return; }
  armsRun++;
  console.log(`\n=== ARM ${id} · ${subject}`);
  console.log(`    WHAT IS BROKEN : ${what}`);
  console.log(`    MUST FAIL      : ${mustFail}`);
  console.log(`    MUST NOT FAIL  : ${mustNot}`);

  const orig = takeOriginal(file);
  const p = patch(file, find, replace);
  if (!p.armed) {
    console.log(`    >>> THE ARM DID NOT ARM: the patch matched ${p.hits} time(s), not once.`);
    console.log(`        THIS IS A FINDING ABOUT THE ARM, not a green result. Nothing was measured.`);
    findings.push(`${id}: never armed (patch matched ${p.hits} times)`);
    restore(orig);
    return;
  }

  let result;
  try { result = run(); }
  finally { console.log(`    ${restore(orig)}`); }

  console.log(`    OBSERVED       : ${result.observed}`);
  if (result.asDeclared) { armsAsDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
  else {
    console.log(`    VERDICT        : *** NOT AS DECLARED — recorded as a finding about the arm ***`);
    findings.push(`${id}: ${result.observed}`);
  }
}

const anyFailed = (r, re) => r.failed.some((l) => re.test(l));

/* ============================================================================
 * SECTION H — FL-3. THE CONTROL FLOW TABLE'S OWN FENCES.
 * ========================================================================== */

arm({
  id: "H6", subject: "LOG-ALWAYS — the log is written whether or not the run succeeds",
  what: "the driver skips its tick on the terminal step, so the last thing a run did is never recorded",
  mustFail: "the one-entry-per-step arm and the terminal-entry arms; §14b.6's whole point is that the log's value is the FAILURE path",
  mustNot: "the gate arm, the dedup arms, or the F10 arms",
  file: DRIVER,
  /* ANCHOR MOVED 2026-09-18 BY REC-100 (IC-130), with the line it quotes: the
     entry is now built once as `entry` before the tick, so the drive loop can
     count a model-judged PRESENT it records as indeterminate. The arm's subject
     — skip the terminal step's tick — is unchanged. Found by
     `m025-arm-anchor-witness` A4, which is that instrument doing its job. */
  /* RE-ANCHORED 2026-09-28 by AGENT-WORKER #1 (T7, R26/K148): the tick now sends an entry only when the step
     stated a look (`entry ? [entry] : []`), and B1's arm it fails by was renamed with it (every step TICKS). */
  /* RE-ANCHORED 2026-09-28 by AGENT-WORKER #2 (T10, R11/N153): the tick also publishes the table's state. */
  find: `    const tick = await call("airuntick", null,
      { run: runId, log: entry ? [entry] : [], consume,`,
  replace: `    const tick = decision.step === "close"
      ? { reached: true, status: 200, body: { ok: true, result: {} } }
      : await call("airuntick", null, { run: runId, log: entry ? [entry] : [], consume,`,
  run: () => {
    const r = runHarness();
    const logArm = anyFailed(r, /every step the trace names ticked|last entry is terminal|and names the bound/);
    const gateHeld = !anyFailed(r, /investigate-fresh is NOT deployed/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · log-always arms ${logArm ? "FAILED" : "did NOT fail"} · gate ${gateHeld ? "held" : "also failed"}`,
      asDeclared: r.ran && logArm && gateHeld,
    };
  },
});

arm({
  id: "H8", subject: "QUERY-NEVER-LOAD: the op set is PINNED, floor AND ceiling",
  what: "the member gains an op nobody decided to give it — a SECOND meaning reader beside PL-9's",
  mustFail: "the pinned-op-set arms in BOTH suites (a GAINED call fails an exact equality just as a lost one does)",
  mustNot: "the write arms — the gained op is non-mutating, which is exactly why a write test alone would not catch it",
  file: DRIVER,
  /* THE PATCH TARGET MOVED AT FL-5 AND IS CORRECTED HERE RATHER THAN LEFT TO GO
     STALE — "an arm that did not arm is a finding" is what this file is for, and
     an arm whose find-string no longer exists reports nothing while looking like
     a green run. FL-5 gave the member a SECOND consumer of PL-9's read (the
     parent re-reads a citation by address), and rather than a second call site
     naming the op it routed both through one `meaningRead` helper — which is what
     the "named in exactly one place" arm is actually protecting. The arm now
     inserts the second reader at the new site. */
  /* RE-ANCHORED 2026-09-13 (by D-323, which found it), AND THE FINDING IS KEPT
     RATHER THAN QUIETLY REPAIRED: THIS ARM HAD STOPPED ARMING ON `main`, AND NOT
     BECAUSE OF THE ITEM THAT FOUND IT. D-276 changed this call site from the
     literal `rows: "legs"` to `rows: MEANING_ARM` — which is the whole point of
     D-276, since `"legs"` is an arm the plane's compiler does not hold — and the
     patch string here was not moved with it. Measured: `agent-worker/src/index.mjs`
     last moved at `f5ed2bf` (FL-6), D-323 touched it not at all, and the old
     anchor occurs ZERO times in the tree D-323 found. So from D-276 until now
     this arm reported `THE ARM DID NOT ARM` — visible only because this harness
     treats that as a finding instead of counting the green run underneath it.
     Re-anchored on the line as it now reads. **This is the third time in this
     estate that a landed fix has left a control arm's patch string behind**
     (walkfloor's `stripper`, FL-5's H8 before this, and now D-276's) and the
     lesson is the same one: an arm whose find-string no longer exists proves
     nothing while looking exactly like a pass. */
  find: `        const got = await meaningRead(call, { rows: MEANING_ARM, limit: 1, ids: [address] });`,
  replace: `        await call("meaningquery", { q: address });
        const got = await meaningRead(call, { rows: MEANING_ARM, limit: 1, ids: [address] });`,
  run: () => {
    const rh = runHarness();
    const rm = runMember();
    /* N421: A9's driver arms are measured at the interface now; their labels are matched beside the old ones. */
    const pinnedH = anyFailed(rh, /op the DRIVER actually names is in the pinned set|op the DRIVER actually sent the plane|every meaning read went through that one op|named in exactly one place|subset of the pinned set/);
    const pinnedM = anyFailed(rm, /every op named in the source is in the pinned set|every op named is in the pinned set|every op that reached the plane is in the pinned set/);
    const writeHeld = !anyFailed(rm, /record moved only through ops in the pinned set/)
                   && !anyFailed(rm, /one distinct credential/);
    return {
      observed: `harness ${rh.pass}/${rh.fail} · member ${rm.pass}/${rm.fail} · pinned-set arms ${pinnedH || pinnedM ? "FAILED" : "did NOT fail"} (harness ${pinnedH}, member ${pinnedM}) · write arms ${writeHeld ? "held (as declared)" : "also failed"}`,
      asDeclared: rh.ran && rm.ran && (pinnedH || pinnedM) && writeHeld,
    };
  },
});

/* ============================================================================
 * SECTION F7 — FL-7. THE GATE'S ENDING NAMES WHO ACTUALLY ACTED, AND THE
 * HEADER AND THE CATALOGUE ARE HELD TO EACH OTHER IN BOTH DIRECTIONS.
 *
 * THE DEFECT THESE ARMS ARE BUILT AGAINST WAS REAL AND WAS SHIPPED: from FL-3
 * until FL-7 the gate closed a refused launch on `cancelled` ("a member stopped
 * it" — no member did), while this file's own header promised it terminated on
 * `mode-not-deployed`, a word defined NOWHERE in the repository. Two halves,
 * and the reason neither was caught is that NOTHING COMPARED THEM. F1 and F2
 * arm each half separately; **F3 is the arm that matters most**, because it
 * breaks only ONE direction of the agreement and shows the other direction
 * stays green — which is what proves the two-way assertion is genuinely two
 * assertions and not one written twice.
 * ========================================================================== */

arm({
  id: "F2", subject: "THE CATALOGUE LOSES THE WORD — the header promises what nothing defines",
  what: "`mode-not-deployed` is removed from the plane's RUN_ENDINGS, restoring the exact pre-FL-7 condition on the catalogue side while the gate still tries to close on it",
  /* RE-POINTED T21 (N467): airun's V6 (the vocabulary) is run-rules' R1 and R9 tests; its G1/G2 (the close refused
     through the op) is ai-runs' R14 test, which closes a run on mode-not-deployed and reads the row back. */
  mustFail: "A6b's DIRECTION 1 (gate -> catalogue) BY NAME; run-rules' R1 test (the endings are exactly the named ones) and its R9 test (mode-not-deployed is the ending the gate closes on); and ai-runs' R14 test, whose close on mode-not-deployed the plane must now refuse (C-22.5), which is the proof the plane's own exit path is real",
  mustNot: "nothing in this section is exempt — but the failure must be about the VOCABULARY, so `harness.test.mjs`'s A6 gate-step arms (which read `nextStep`'s return, not the plane) keep passing on step and why",
  file: AIRUN,
  find: `  "mode-not-deployed":`,
  replace: `  "mode-not-deployed-REMOVED-BY-CONTROL-ARM-F2":`,
  run() {
    const rh = runHarness();
    const rules = runRules(), dep = runDeployment(), close = runTickClose();
    const dir1 = anyFailed(rh, /DIRECTION 1/);
    const vocab = anyFailed(rules, RULES_R1) && anyFailed(dep, DEPLOY_R9);
    const opArm = anyFailed(close, CLOSE_R14);
    const stepHeld = !anyFailed(rh, /a CHECK run passes the gate|an investigate run is CLOSED at the gate/);
    return {
      observed: `harness ${rh.pass}/${rh.fail} FAIL · run-rules R1/R9 failed: ${vocab} · ai-runs R14 failed: ${opArm}`
        + ` · DIRECTION 1 failed: ${dir1} · A6 gate-step arms ${stepHeld ? "held" : "ALSO failed"}`,
      asDeclared: rh.ran && rules.ran && dep.ran && close.ran && dir1 && vocab && opArm && stepHeld,
    };
  },
});

arm({
  id: "F4", subject: "OVER-STRICTNESS, ARMED — a GENUINE member cancellation must still read as `cancelled`",
  what: "NOTHING about the member's ending is touched; instead the plane's `cancelled` TEXT is rewritten to a different sentence. The correction must not have made the member's ending vestigial: arms that assert a member cancellation is recorded as a member act must still be LIVE and must notice",
  /* RE-POINTED T21 (N467): airun's V6b and skillsequencing's D5 read `cancelled`'s sentence; run-rules' R1 test does. */
  mustFail: "run-rules' R1 test, which reads `cancelled`'s sentence (`a member stopped it`) and must object, which is what shows the member's ending is still genuinely asserted rather than left as a word nobody checks",
  mustNot: "the gate arms, DIRECTION 1 or DIRECTION 2 — none of them is about the member's ending, and a fix that made `cancelled` and `mode-not-deployed` interchangeable would show up as those failing too",
  file: AIRUN,
  find: `  cancelled:  "a member stopped it",`,
  replace: `  cancelled:  "the run came to an end somehow",`,
  run() {
    const rules = runRules();
    const rh = runHarness();
    const memberArms = anyFailed(rules, RULES_R1);
    const gateHeld = !anyFailed(rh, /DIRECTION 1|DIRECTION 2/) && rh.fail === 0;
    return {
      observed: `run-rules R1 file ${rules.pass}/${rules.fail} FAIL · harness ${rh.pass}/${rh.fail} FAIL`
        + ` · the member-ending arm objected: ${memberArms} · the gate/two-way arms held: ${gateHeld}`,
      asDeclared: rules.ran && rh.ran && memberArms && gateHeld,
    };
  },
});


/* ============================================================================
 * SECTION G — FL-8 / IC-67. WHAT BECAME OF A RUN, AND WHETHER THE THREE
 * VOCABULARIES ARE HELD IN AGREEMENT OR ONLY SAID TO BE.
 *
 * FL-7 fixed the ENDING and NAMED this residue in IC-62 rather than reaching
 * into a third vocabulary mid-item. FL-8 is that place, arrived at deliberately:
 * a gate-refused run was recorded with STATUS `finished`, because
 * `#aiRunTerminate` keyed the status on whether the ending was a BOUND and a
 * refusal reaches none. **A launch the gate refused did not FINISH; it never
 * started.**
 *
 * THE ARMS ARE DESIGNED AS A SET RATHER THAN AS FOUR VARIATIONS, and G2 is the
 * one that earns the rest — FL-7's F3 lesson one item on. A control that breaks
 * BEHAVIOUR proves the behavioural arms are live; only a control that leaves the
 * behaviour EXACTLY AS IT IS while moving where the rule LIVES can show that the
 * source-agreement arm is a second independent claim rather than the first one
 * written twice.
 * ========================================================================== */

/* RE-ANCHORED 2026-09-29 BY AGENT-WORKER #4 (T12, N304): `#aiRunTerminate` moved whole from `store.mjs` into
   ai-runs' own `src/ai-runs/index.mjs` (T7), and airun's ARM W1 reads it there; G2's anchor moved with it and
   matched ZERO times until now. The arm's subject is unchanged. */
const AI_RUNS = join(PLANE, "src", "ai-runs", "index.mjs");

arm({
  id: "G1", subject: "THE DEFECT ITSELF RESTORED — a gate-refused run recorded as one that FINISHED",
  what: "`RUN_NEVER_STARTED` is emptied in run-rules, so `runStatusFor` falls through exactly as the pre-FL-8 ternary did and a launch the deployment gate refused is recorded `finished` again",
  /* RE-POINTED T21 (N467): airun's H1/H2/W3/W5 are run-rules' R1 test (runStatusFor and RUN_NEVER_STARTED) and
     ai-runs' R14 test (the gate-refused close read back from the run's row as `never-started`). */
  mustFail: "run-rules' R1 test (runStatusFor answers never-started for mode-not-deployed), ai-runs' R14 test (a close on mode-not-deployed recorded never-started, read back from the run's row), and this suite's own FL-8 arm (B7: the status the member's refused launch is recorded under, from the mock's table built by runStatusFor)",
  mustNot: "this suite's A6b DIRECTION 1 and 2 and A6c (the table still equals runStatusFor, whatever it answers): the ending is untouched, only the status it is keyed to moved",
  file: AIRUN,
  find: `export const RUN_NEVER_STARTED = { "mode-not-deployed": 1 };`,
  replace: `export const RUN_NEVER_STARTED = {};`,
  run() {
    const rules = runRules(), close = runTickClose();
    const rh = runHarness();
    const named = anyFailed(rules, RULES_R1) && anyFailed(close, CLOSE_R14);
    const fl8 = anyFailed(rh, /NEVER STARTED/);
    const heldOpen = !anyFailed(rh, /DIRECTION 1|DIRECTION 2|^A6c \(FL-8\)/);
    return {
      observed: `run-rules R1 file ${rules.pass}/${rules.fail} · ai-runs tick-close ${close.pass}/${close.fail} · harness ${rh.pass}/${rh.fail} FAIL`
        + ` · run-rules R1 and ai-runs R14 failed: ${named} · the member's FL-8 arm failed: ${fl8}`
        + ` · the two-way and table arms held: ${heldOpen}`,
      asDeclared: rules.ran && close.ran && rh.ran && named && fl8 && heldOpen,
    };
  },
});

arm({
  id: "G2", subject: "A SECOND COPY OF THE RULE THAT AGREES — the arm that earns the two-way claim",
  retired: "RETIRED T21 (N467). Its one subject was airun ARM W1, an assertion over ai-runs' SOURCE TEXT (the store "
         + "asks run-rules rather than deciding the status itself); `airun.test.mjs` was deleted in T20, and no module "
         + "test reads source text now (N421: tests check behaviour at the interface). This arm changes no behaviour by "
         + "construction, so no remaining test can fail under it, and an arm that cannot fail proves nothing.",
  what: "the store stops ASKING run-rules and decides the status itself, with a copy that returns IDENTICAL answers for every bound and every ending. Nothing a caller can observe changes; only where the rule lives does",
  mustFail: "airun ARM W1, and EXACTLY THAT ONE. It is the whole point of this arm: a source-agreement assertion that failed here together with the behavioural arms would be the same comparison written twice, which is what FL-7's F3 measured one item ago",
  mustNot: "every other assertion in the suite — H1, H2, H3, H4, V9, W2, W3, W4, W5 — because the record a caller reads is byte-for-byte what it was",
  file: AI_RUNS,
  find: `      const status = runStatusFor(bound);`,
  replace: `      const status = bound === "mode-not-deployed" ? "never-started"\n                   : (stoppedByBound ? "stopped" : "finished");`,
});

arm({
  id: "G3", subject: "THE VOCABULARY POINTED ELSEWHERE — a status term with no producer",
  what: "a FIFTH status term (`abandoned`) is added to `RUN_STATUS` with nothing anywhere able to produce it — the shape of every vocabulary drift this repository has recorded: a published word nothing writes",
  /* RE-POINTED T21 (N467): airun's V9 (the exact SET) is run-rules' R1 test; W3 (every term reachable) has no
     successor, so this arm now proves the set's pin alone. */
  mustFail: "run-rules' R1 test, which asserts RUN_STATUS as an exact SET (running, finished, stopped, never-started) — and nothing else in that file",
  mustNot: "ai-runs' R14 test and this suite: nothing a run does changes, only a word with no producer was published",
  file: AIRUN,
  find: `export const RUN_STATUS = { running: 1, finished: 1, stopped: 1, "never-started": 1 };`,
  replace: `export const RUN_STATUS = { running: 1, finished: 1, stopped: 1, "never-started": 1, abandoned: 1 };`,
  run() {
    const rules = runRules(), close = runTickClose();
    const rh = runHarness();
    const set = anyFailed(rules, RULES_R1) && rules.fail === 1;
    const held = close.ran && close.fail === 0 && rh.fail === 0;
    return {
      observed: `run-rules R1 file ${rules.pass}/${rules.fail} FAIL · ai-runs tick-close ${close.pass}/${close.fail} · harness ${rh.pass}/${rh.fail}`
        + ` · R1 (the set) failed, alone: ${set} · ai-runs and this suite held: ${held}`,
      asDeclared: rules.ran && rh.ran && set && held,
    };
  },
});

arm({
  id: "G4", subject: "OVER-STRICTNESS, ARMED — the fix must not sweep every ending into `never-started`",
  what: "`RUN_NEVER_STARTED` gains `cancelled` and `completed`, so a run that genuinely RAN to its end and one a member stopped are ALSO recorded as never having started. This is the over-reach the queue row's second control exists to catch, and it is the shape a careless fix would actually take",
  /* RE-POINTED T21 (N467): airun's H3 (the partition) and C4 (a member cancellation reads `finished`) are run-rules'
     R1 test (exactly mode-not-deployed never-started, finished otherwise) and ai-runs' R14 test (a completed and a
     cancelled close read back `finished`). */
  mustFail: "run-rules' R1 test (RUN_NEVER_STARTED is exactly mode-not-deployed) and ai-runs' R14 test (a completed run and a member's cancellation recorded `finished`)",
  mustNot: "this suite's FL-8 arm (B7: the gate refusal still reads `never-started`), which is what shows this arm measures OVER-reach and not the fix itself; nor A6b's two directions",
  file: AIRUN,
  find: `export const RUN_NEVER_STARTED = { "mode-not-deployed": 1 };`,
  replace: `export const RUN_NEVER_STARTED = { "mode-not-deployed": 1, cancelled: 1, completed: 1 };`,
  run() {
    const rules = runRules(), close = runTickClose();
    const rh = runHarness();
    const overreach = anyFailed(rules, RULES_R1) && anyFailed(close, CLOSE_R14);
    const gateHeld = !anyFailed(rh, /NEVER STARTED|DIRECTION 1|DIRECTION 2/);
    return {
      observed: `run-rules R1 file ${rules.pass}/${rules.fail} · ai-runs tick-close ${close.pass}/${close.fail} · harness ${rh.pass}/${rh.fail}`
        + ` · the over-reach arms objected: ${overreach} · the gate's own arms held: ${gateHeld}`,
      asDeclared: rules.ran && close.ran && rh.ran && overreach && gateHeld,
    };
  },
});

arm({
  id: "G5", subject: "THE MOCK DECIDES AGAIN — the instrument defect FL-8 found, put back",
  what: "the plane mock's `airunclose` branch stops looking the status up and reproduces the plane's keying by hand, in the exact spelling it carried from FL-3 until FL-8 (`bound === \"completed\" || bound === \"cancelled\" ? \"finished\" : \"stopped\"`). This is not a hypothetical: it is what the file actually said, and it had been answering `stopped` for `mode-not-deployed` while the plane answered `finished`, with nothing comparing the two",
  mustFail: "harness A6c2 (the source assertion that the hand-written keying is GONE and the table arrived as data) and B7's FL-8 arm, which reads the status the member's refused launch is recorded under",
  /* RE-POINTED T21 (N467): the plane's half is run-rules' R1 test and ai-runs' R14 test, both untouched. */
  mustNot: "A6c itself — the interpolated table is still correct, which is exactly why a table alone was never the fix; nor A6b's two directions, nor run-rules' R1 or ai-runs' R14 test, because the plane is untouched",
  file: join(MEMBER, "test", "harness.test.mjs"),
  find: `      S.status = STATUS_BY_BOUND[bound] || "finished";`,
  replace: `      S.status = bound === "completed" || bound === "cancelled" ? "finished" : "stopped";`,
  run() {
    const rh = runHarness();
    const rules = runRules(), close = runTickClose();
    const objected = anyFailed(rh, /A6c2/) && anyFailed(rh, /NEVER STARTED/);
    const held = !anyFailed(rh, /A6c \(FL-8\)|DIRECTION 1|DIRECTION 2/) && rules.ran && rules.fail === 0
      && close.ran && close.fail === 0;
    return {
      observed: `harness ${rh.pass}/${rh.fail} FAIL · run-rules R1 file ${rules.pass}/${rules.fail} · ai-runs tick-close ${close.pass}/${close.fail}`
        + ` · the mock's own arms objected: ${objected} · the table arm and the plane held: ${held}`,
      asDeclared: rh.ran && objected && held,
    };
  },
});

/* ============================================================================
 * SECTION T — FL-11 AND FL-12: THE RUN'S TARGET AND THE REQUEST'S ADDRESS (2026-09-23).
 * Each arm breaks ONE line of `src/index.mjs` and nothing else; the mocks are untouched, and they are what
 * refuses — derived from the plane, so a green under an arm would be a mock saying yes.
 * ========================================================================== */
const runFanout = () => runNamed("fanout.test.mjs", "fanout");

arm({
  id: "T1", subject: "FL-11 — THE SEEDING DROPPED: the run never takes its context as its target",
  what: "`state.target` is no longer seeded from `runContextTarget(session)` at the open — the member as it was "
    + "before FL-11, where nothing set it",
  mustFail: "harness FT1 (the published target), FT1b (dedup's read under the run's target), FT1c (the level-empty "
    + "and untargeted readings land), FT3 (a target-less suggestion is refused C-27.1 BEFORE the principal gate is "
    + "reached, the plane's order), FT4 and fanout FL-12b (a request's target defaults to the run's), and B6's four "
    + "level-empty suggestions — each BY NAME, refused by the mock's SUGGEST_NO_TARGET / CAPTURE_REQUEST_NOT_AN_INQUIRY. "
    + "Every older arm that asserts a suggestion LANDS fails with them (B4, B8, B9, fanout's parent-writes arms): the "
    + "strict mock now sees the pre-FL-11 member everywhere it suggests, which is the point",
  /* CORRECTED 2026-09-25 by D-451, never exempted: this declared FT2 MUST-NOT because "a project run never had a
     target" — the defect D-451 fixes. A project run citing ONE question is now seeded from the plane's published
     `context.questions`, so dropping the seeding fails FT2, FT2d and FT2g with the rest; FT2b/FT2c/FT2e/FT2f (no
     call names the project, the cited reading lands, several and none stay UNDETERMINED) must still hold. */
  mustNot: "FT0 (the mock refuses on its own, driven directly), FT1d/FT1e (a reading aimed outside is still refused "
    + "and still not compared), FT2b/FT2c/FT2e/FT2f (a project run never names the project, and several or no "
    + "published questions leave it UNDETERMINED) and the fanout suite's FL-12a (the mock alone). FT2, FT2d and FT2g "
    + "FAIL with the declared arms since D-451: a project run citing one question is seeded too",
  file: DRIVER,
  find: `    target: seeded.target, targetBasis: seeded.basis,`,
  replace: `    targetBasis: seeded.basis,`,
  run() {
    const rh = runHarness();
    const rf = runFanout();
    const failedAsDeclared = [/^FT1 \(FL-11\)/, /^FT1b /, /^FT1c /, /^FT3 /, /^FT4 \(FL-12/, /FOUR level-empty suggestions/]
      .every((re) => anyFailed(rh, re)) && anyFailed(rf, /^FL-12b /);
    const held = !anyFailed(rh, /^FT0|^FT1d |^FT1e |^FT2b |^FT2c |^FT2e |^FT2f /) && !anyFailed(rf, /^FL-12a/);
    return {
      observed: `harness ${rh.pass}/${rh.fail} FAIL · fanout ${rf.pass}/${rf.fail} FAIL · the declared arms failed by `
        + `name: ${failedAsDeclared} · the MUST-NOT arms held: ${held}`,
      asDeclared: rh.ran && rf.ran && failedAsDeclared && held,
    };
  },
});

arm({
  id: "T2", subject: "FL-12 — THE LOCATOR SENT AS `url` AGAIN, the field the plane never reads",
  what: "`op=capturerequest`'s body names the locator `url` instead of `address` — the member as it was before FL-12",
  mustFail: "harness FT4 (the ADDRESS arm: the public locator is queued by `address`), FT4b (no body carries `url`), "
    + "FT4c (exactly ONE refusal — with `url` the public locator is refused too) and fanout FL-12b (the fan-out's "
    + "ADDRESS arm) — each BY NAME, the mock answering CAPTURE_REQUEST_NOT_PUBLIC",
  mustNot: "FT0d/FT0e and fanout FL-12a (the mock refuses `url` and queues `address` when driven directly), and every "
    + "FL-11 arm (FT1*, FT2*, FT3) — the suggestion path shares no field with the request",
  file: DRIVER,
  find: `{ run: runId, target: t.target ?? state.target ?? null, address: t.url ?? null }), "capturerequest");`,
  replace: `{ run: runId, target: t.target ?? state.target ?? null, url: t.url ?? null }), "capturerequest");`,
  run() {
    const rh = runHarness();
    const rf = runFanout();
    const failedAsDeclared = [/^FT4 \(FL-12/, /^FT4b /, /^FT4c /].every((re) => anyFailed(rh, re))
      && anyFailed(rf, /^FL-12b /);
    const held = !anyFailed(rh, /^FT0|^FT1|^FT2|^FT3 /) && !anyFailed(rf, /^FL-12a/);
    return {
      observed: `harness ${rh.pass}/${rh.fail} FAIL · fanout ${rf.pass}/${rf.fail} FAIL · the declared arms failed by `
        + `name: ${failedAsDeclared} · the MUST-NOT arms held: ${held}`,
      asDeclared: rh.ran && rf.ran && failedAsDeclared && held,
    };
  },
});

/* ============================================================================
 * SECTION D — D-452 (2026-09-24). A DROPPED CANDIDATE DROPS ONE CANDIDATE, NOT THE PASS.
 * ========================================================================== */

/* D2 CAME BACK NOT AS DECLARED ON ITS FIRST RUN (2026-09-24), AND IT WAS THE ARM. It re-queued the
   refused bytes at the queue's HEAD (`unshift`), which is not the liar the row names: the resent `v1` is
   refused again and put back in front, a verbatim-retry loop that starves everything behind it — so
   `the rest of the pass is written` FAILED too (harness 243/12). The liar that writes the rest AND
   resends the dropped one puts it at the TAIL; that is the arm below. FT1d, FT2d and FT3 are COUPLED to
   it and declared so: each drives a refusal, and a re-queued refusal is a verbatim retry wherever one
   occurs. */
arm({
  id: "D2", subject: "D-452 — THE LIAR'S FIX: the dropped candidate is RE-QUEUED behind the rest instead of dropped",
  what: "`adjust` puts the refused submission at the END of the queue whether or not it changed — so the rest of "
    + "the pass is written, AND the dropped bytes are sent again",
  mustFail: "harness `D-452: the DROPPED candidate was sent ONCE and never landed` and `D-452: nothing was resent "
    + "verbatim` BY NAME (PL-3's `repeats` climbs), with B5's called-ONCE arm; COUPLED, and declared: FT1d, FT2e "
    + "and FT3, each of which drives a refusal (FT2e since D-451, 2026-09-25: FT2d no longer drives one — a project "
    + "run citing one question now FILES its level-empty candidate)",
  mustNot: "`D-452: the rest of the pass is written` — which is exactly why that arm alone could not tell the fix from "
    + "the liar, and the sent-once/never-landed arm exists — and B4's adjusted landing, B6's four level-empty "
    + "suggestions, FT0*, FT1/FT1b/FT1c",
  file: DRIVER,
  /* RE-ANCHORED T21 (AGENT-WORKER #8): the line occurs twice since mode plan's `adjust` (K660), so this arm had NOT
     ARMED; the anchor now includes the check-mode row's own note. */
  find: `      if (changed) queue.unshift(state.submission);\n      out.note = changed\n        ? "the submission was changed`,
  replace: `      if (changed) queue.unshift(state.submission); else queue.push(state.refusedSubmission);\n      out.note = changed\n        ? "the submission was changed`,
  run() {
    const r = runHarness();
    const failedAsDeclared = [/^D-452: the DROPPED candidate was sent ONCE/, /^D-452: nothing was resent verbatim/,
      /called ONCE/].every((re) => anyFailed(r, re));
    const held = !anyFailed(r, /^D-452: the rest of the pass is written|adjusted version LANDED|FOUR level-empty|^FT0|^FT1 |^FT1b |^FT1c /);
    return {
      observed: `harness ${r.pass}/${r.fail} FAIL · the declared arms failed by name: ${failedAsDeclared} · the MUST-NOT arms held: ${held}`,
      asDeclared: r.ran && failedAsDeclared && held,
    };
  },
});

/* ============================================================================
 * SECTION S — REC-100 / IC-130: THE STEP LOG AGAINST THE REAL PLANE'S REFUSAL (harness.test.mjs section R).
 * CARRIED T21 by AGENT-WORKER #8 (N469): these are the two arms REC-100 declared and ran on 2026-09-18 through its
 * own driver, `bio-plane/test/nc-rec100.mjs` (`aw-steplog`, `aw-refused`), which T20 deleted with the old battery.
 * ========================================================================== */

arm({
  id: "S2", subject: "REC-100 aw-refused — the tick's per-entry refusals left unread",
  what: "the driver stops reading the tick's `refused[]`, so an entry the plane refused vanishes from the run's output",
  mustFail: "REC100-2, REC100-2b and REC100-2c by name — an entry the REAL plane refused is no longer named in `log_refused` or `refusals`, so what was SENT is neither held nor named",
  mustNot: "REC100-1 and REC100-1b — the entries this run sends are still the ones the plane accepts, and `logged` still counts what landed",
  file: DRIVER,
  find: `      const refusedEntries = Array.isArray(t?.refused) ? t.refused : [];`,
  replace: `      const refusedEntries = [];`,
  run() {
    const r = runHarness();
    const failed = [/^REC100-2:/, /^REC100-2b:/, /^REC100-2c:/].every((re) => anyFailed(r, re));
    const held = !anyFailed(r, /^REC100-1:|^REC100-1b:/);
    return {
      observed: `harness ${r.pass}/${r.fail} FAIL · REC100-2, 2b and 2c failed by name: ${failed} · REC100-1/1b held: ${held}`,
      asDeclared: r.ran && failed && held,
    };
  },
});

/* ============================================================================
 * SECTION O — OVER-STRICTNESS. Correct work in a spelling nobody anticipated
 * must PASS. Nothing is edited here: the arms already in the suites are the
 * subject, and this section exists to record that they were RUN on a clean tree
 * and were green — an over-strictness claim nobody measured is a claim.
 * ========================================================================== */
if (!only.length || only.includes("H10")) {
  armsRun++;
  console.log(`\n=== ARM H10 · OVER-STRICTNESS (nothing is broken)`);
  console.log(`    MUST PASS      : a run with no judgements at all; MORE judgements than judged steps;`);
  console.log(`                     an empty judgement object; an explicit max_steps; a run id with`);
  console.log(`                     punctuation; a namespace with capitals and a hyphen; turns exactly`);
  console.log(`                     at the bound. Both suites green.`);
  const rh = runHarness();
  const rm = runMember();
  const ok = rh.ran && rh.fail === 0 && rm.ran && rm.fail === 0;
  console.log(`    OBSERVED       : harness ${rh.pass} pass / ${rh.fail} FAIL · member ${rm.pass} pass / ${rm.fail} FAIL`);
  if (ok) { armsAsDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
  else { console.log(`    VERDICT        : *** NOT AS DECLARED ***`); findings.push(`H10: harness ${rh.fail} FAIL, member ${rm.fail} FAIL`); }
}

console.log(`\n${"=".repeat(78)}`);
console.log(`arms run: ${armsRun} · as declared: ${armsAsDeclared} · findings about the arms: ${findings.length}`);
for (const f of findings) console.log(`  FINDING: ${f}`);
console.log(`Every arm was armed ALONE with the other defences held open; every restore was`);
console.log(`verified by sha256 AND by cmp against a copy taken before the edit.`);
process.exit(findings.length ? 1 : 0);
