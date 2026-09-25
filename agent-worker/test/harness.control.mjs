#!/usr/bin/env node
/* THE NEGATIVE CONTROL DRIVER for FL-3 (the run harness, IS-9) — NINETEEN ARMS
 * IN THREE FAMILIES, no baseline row. Deliberately NOT a `.test.mjs`: it EDITS
 * REAL SOURCES while it runs, and neither `scripts/battery.mjs` nor the fleet
 * walk must discover it (FL-2/PL-3/PL-4's precedent).
 *
 * THE FAMILIES, so a reader can hold the count against the run without reading
 * to the foot: **H1-H10** are FL-3's own arms (H10 is the over-strictness arm);
 * **F1-F4** are FL-8's, on the launch gate's vocabulary; **G1-G5** are D-323 and
 * D-324's, on a gate-refused run's STATUS; **T1-T2** are FL-11's and FL-12's (2026-09-23), on the run's
 * target and the capture request's `address`; **D1-D2** are D-452's (2026-09-24), on a dropped candidate
 * dropping ONE candidate and not the pass. 25 announcements, driven — MEASURED 2026-09-24 (the 21 this
 * line carried before D-452 did not count SK-8's E1/E2).
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
import { ANCHOR_DRY, anchorRows, anchorTable } from "../../bio-plane/scripts/anchortable.mjs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const MEMBER = join(HERE, "..");
const REPO = join(MEMBER, "..");
const PLANE = join(REPO, "bio-plane");

const HARNESS = join(MEMBER, "src", "harness.mjs");
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
  if (ANCHOR_DRY) return { ran: false, pass: 0, fail: -1, failed: [], out: "" };   /* M0-197: no suite under the dry read */
  const r = spawnSync(process.execPath, [join(HERE, file)], { cwd: MEMBER, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(new RegExp(`${label}:\\s*(\\d+) passed,\\s*(\\d+) failed`));
  const failed = [...out.matchAll(/^\s*FAIL\s+(.+)$/gm)].map((x) => x[1].trim());
  return m ? { ran: true, pass: +m[1], fail: +m[2], failed, out }
           : { ran: false, pass: 0, fail: -1, failed, out };
}
const runHarness = () => runNamed("harness.test.mjs", "harness");
const runMember = () => runNamed("agent-worker.test.mjs", "agent-worker");

/* FL-7's arms reach ACROSS THE TREE, and they have to. This item's defect had
   one half in `agent-worker/src/harness.mjs` (the gate's ending) and the other
   in `bio-plane/src/airun.mjs` (the catalogue that defines it), and the whole
   point of the fix is that the two are now asserted against EACH OTHER. An arm
   that could only run the member's suites could not measure that at all.
   The plane's suites print `<label>: N pass, M fail` — a DIFFERENT tail from the
   member's `N passed, M failed` — so the shape is matched explicitly rather than
   loosened into one regex that would quietly match neither on a rename. A suite
   that DIED still reports `fail: -1`, the same rule as above. */
function runPlane(file, label) {
  if (ANCHOR_DRY) return { ran: false, pass: 0, fail: -1, failed: [], out: "" };   /* M0-197: no suite under the dry read */
  const r = spawnSync(process.execPath, [join(PLANE, "test", file)], { cwd: PLANE, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(new RegExp(`${label}:\\s*(\\d+) pass,\\s*(\\d+) fail`));
  const failed = [...out.matchAll(/^\s*FAIL\s+(.+)$/gm)].map((x) => x[1].trim());
  return m ? { ran: true, pass: +m[1], fail: +m[2], failed, out }
           : { ran: false, pass: 0, fail: -1, failed, out };
}
const runAirun = () => runPlane("airun.test.mjs", "airun");
const runSeq = () => runPlane("skillsequencing.test.mjs", "skillsequencing");
const AIRUN = join(PLANE, "src", "airun.mjs");

function runCoverageStrict() {
  const r = spawnSync(process.execPath, [join(PLANE, "scripts", "coverage.mjs"), "--strict"],
    { cwd: PLANE, encoding: "utf8" });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

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
  if (ANCHOR_DRY) return "M0-197 dry read: nothing was patched";
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

let DRY_ARM = null;   /* M0-197: the arm whose anchors the dry read is recording */
function patch(file, find, replace) {
  if (ANCHOR_DRY) return (anchorRows([{ arm: DRY_ARM, file, find, put: replace }]), { armed: true, hits: 1 });
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, hits: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, hits: 1 };
}

function arm({ id, subject, what, mustFail, mustNot, file, find, replace, run }) {
  /* M0-197: under tools/anchordrift.mjs an arm is READ, never armed — its run() too, for H1's second patch. */
  if (ANCHOR_DRY) { DRY_ARM = id; patch(file, find, replace); try { run(); } catch { /* dummy results */ } return; }
  if (only.length && !only.includes(id)) return;
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
  id: "H1", subject: "DEDUP-BEFORE-WRITE IS THE SHAPE OF THE TABLE",
  what: "`compose` gains a direct edge to `submit`, and nextStep takes it — dedup becomes skippable",
  mustFail: "the no-compose-to-submit edge arm AND the through-the-op arm that observes basisversions being read before any suggest",
  /* THE MUST-NOT WAS WRONG ON THE FIRST RUN AND THE ARM WAS RIGHT — recorded,
     not smoothed. It declared that the F10 arms must HOLD, and 28 assertions
     failed including every F10 arm. The measurement is a real COUPLING and it is
     worth having found: **`queue` is DEDUP'S OWN OUTPUT.** Skip dedup and
     nothing is ever queued, so `submit` has no candidate, so no refusal is ever
     earned and F10 has nothing to route. The declaration was treating two
     dependent things as independent. What CAN honestly be required to hold is
     the gate and the budget arms, which share no state with the queue — and
     they did. */
  mustNot: "the gate arm and the budget arms — NOT the F10 arms, which cannot hold: `queue` is dedup's own output, so a run that skips dedup never submits and never earns a refusal to route",
  file: HARNESS,
  /* THE FIRST SPELLING OF THIS PATCH MATCHED ZERO TIMES AND THE HARNESS SAID SO
     RATHER THAN REPORTING THE GREEN RUN UNDERNEATH IT. It assumed the `to:` line
     was immediately followed by `},\n  submit: {`; `dedup` sits between them.
     Recorded rather than silently corrected, because "the arm never armed" is
     the failure mode that looks most like a pass. */
  find: `       the shape of the table, and this absent edge IS the enforcement. */
    to:     ["dedup", "close"],`,
  replace: `       the shape of the table, and this absent edge IS the enforcement. */
    to:     ["dedup", "submit", "close"],`,
  run: () => {
    /* The edge alone is not enough: `nextStep` must actually take it, or the
       arm proves only that a comment changed. Both halves are patched — this is
       ONE defence (dedup-before-write) taken down, not two. */
    const o2 = takeOriginal(HARNESS);
    patch(HARNESS, `      return { step: "dedup", why: \``, `      if ((state?.candidates || []).length) return { step: "submit", why: \`SKIPPED DEDUP\` };
      return { step: "dedup", why: \``);
    const r = runHarness();
    restore(o2);
    const edgeArm = anyFailed(r, /NO edge from `compose` to `submit`|goes to `dedup` and to `close`|only row that can reach/);
    const gateHeld = !anyFailed(r, /gate|investigate/i);
    const budgetHeld = !anyFailed(r, /exhausted budget stops it and NAMES the bound|ABSENT allowance is not an exhausted one|bound named is deterministic/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · dedup edge arms ${edgeArm ? "FAILED" : "did NOT fail"} · gate ${gateHeld ? "held" : "also failed"} · budget ${budgetHeld ? "held" : "also failed"} · (F10 falls with it BY DESIGN — queue is dedup's output)`,
      asDeclared: r.ran && edgeArm && gateHeld && budgetHeld,
    };
  },
});

arm({
  id: "H2", subject: "F10 — DENIED MEANS ADJUST, NEVER A VERBATIM RETRY",
  what: "a refused submit routes straight back to `submit` instead of to `adjust` — the verbatim retry F10 forbids",
  mustFail: "the F10 routing arms AND the through-the-op arm that PL-3's `repeats` counter stayed at zero",
  mustNot: "the dedup arms, the gate arm, or the empty-run arm",
  file: HARNESS,
  find: `      if (s.refusal) return { step: "adjust", why:`,
  replace: `      if (s.refusal) return { step: "submit", why:`,
  run: () => {
    const r = runHarness();
    const routing = anyFailed(r, /refused submit goes to `adjust`|does NOT go back to `submit`|routed to ADJUST/);
    /* THE COUNTER IS THE POINT. A retry loop that only the budget could see is
       exactly what F10 exists to make visible, so this half is what separates
       "the table changed" from "the harm arrived". */
    const counter = anyFailed(r, /repeats. counter stayed at ZERO|repeats. counter never moved|called twice/);
    const dedupHeld = !anyFailed(r, /NO edge from `compose` to `submit`|compared against 2 on the record/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · F10 routing ${routing ? "FAILED" : "did NOT fail"} · repeats-counter arm ${counter ? "FAILED" : "held"} · dedup ${dedupHeld ? "held" : "also failed"}`,
      asDeclared: r.ran && routing && counter && dedupHeld,
    };
  },
});

arm({
  id: "H3", subject: "F10's PRECONDITION — an unadjusted submission is DROPPED",
  what: "`adjust` returns to `submit` whether or not the submission actually changed",
  mustFail: "the unadjusted-drops-the-candidate arm AND the through-the-op arm that the same bytes were never sent twice",
  mustNot: "the dedup arms, the gate, the four-level fan-out, the empty-run arm, or B5b's D-452 arms (a drop with a queue behind it goes to `submit` under this arm as under the fix)",
  file: HARNESS,
  find: `      if (!s.adjusted)
        return { step: "next-pass",`,
  replace: `      if (false)
        return { step: "next-pass",`,
  run: () => {
    const r = runHarness();
    /* D-452 (2026-09-24) RENAMED the A3 assertion this arm fails by: "an UNADJUSTED one drops the candidate
       instead" asserted `next-pass` over a non-empty queue, which was the defect. Its successor with NOTHING
       behind it is what this arm now fails; B5b's D-452 arms (a drop WITH a queue behind it) must HOLD,
       because this arm sends that case to `submit` exactly as the fix does. */
    const dropArm = anyFailed(r, /UNADJUSTED one with NOTHING behind it|DROPPED the candidate|called ONCE|repeats. counter never moved|nothing was adjusted|nothing was resent/);
    const fanoutHeld = !anyFailed(r, /LEVELS is exactly the plane's set|four spawn payloads/);
    const d452Held = !anyFailed(r, /^D-452:|^B5b:/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · drop/resend arms ${dropArm ? "FAILED" : "did NOT fail"} · fan-out ${fanoutHeld ? "held" : "also failed"} · D-452 arms ${d452Held ? "held" : "also failed"}`,
      asDeclared: r.ran && dropArm && fanoutHeld && d452Held,
    };
  },
});

arm({
  id: "H4", subject: "LOOP TERMINATION IS NOT THE MODEL'S (SK-2's review criterion, as code)",
  what: "`maxPasses` is removed from NOT_JUDGEABLE, so a judgement can set the loop bound",
  mustFail: "the per-field overreach arm for `maxPasses`, by name, AND the through-the-op JUDGEMENT_OVERREACH arm",
  mustNot: "the budget arms — the two are different mechanisms and this is what shows it",
  file: HARNESS,
  find: `export const NOT_JUDGEABLE = ["pass", "maxPasses", "step", "budget", "mode", "bound", "run", "store", "target"];`,
  replace: `export const NOT_JUDGEABLE = ["pass", "step", "budget", "mode", "bound", "run", "store", "target"];`,
  run: () => {
    const r = runHarness();
    const named = anyFailed(r, /judgement setting `maxPasses` is REFUSED|JUDGEMENT_OVERREACH|the field is named/);
    const budgetHeld = !anyFailed(r, /exhausted budget stops it and NAMES the bound|ABSENT allowance is not an exhausted one/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · overreach arms ${named ? "FAILED by name" : "did NOT fail"} · budget arms ${budgetHeld ? "held (as declared)" : "also failed"}`,
      asDeclared: r.ran && named && budgetHeld,
    };
  },
});

arm({
  id: "H5", subject: "SK-4's GATE IS A ROW IN THIS TABLE",
  what: "`MODES.investigate.deployed` is flipped to true — investigate-fresh becomes reachable before VF-5 verified CHECK's first live run",
  mustFail: "the gate arms, pure AND through the op (an investigate run must spend nothing)",
  mustNot: "ANY other arm — which is precisely what shows the gate is a row and not a side effect of something else",
  file: HARNESS,
  find: `  investigate: { deployed: false,`,
  replace: `  investigate: { deployed: true,`,
  run: () => {
    const r = runHarness();
    const gate = anyFailed(r, /investigate-fresh is NOT deployed|investigate run is CLOSED at the gate|closed at the gate|no sub-session was spawned/);
    const othersHeld = !anyFailed(r, /dedup|F10|repeats|empty|LEVELS|overreach/i);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · gate arms ${gate ? "FAILED" : "did NOT fail"} · every other arm ${othersHeld ? "held (as declared)" : "ALSO failed"}`,
      asDeclared: r.ran && gate && othersHeld,
    };
  },
});

/* ---- E-ARMS, APPENDED 2026-09-14 BY FLEET ON SK-8's DELEGATION: the extract
 * row entered the table NOT deployed, and the record's `order` moved with it in
 * the same commit. Both directions of that pairing are armed here, because the
 * defect each guards against has one half in each tree and only a driver that
 * runs BOTH suites can measure the agreement (F1's precedent). */
arm({
  id: "E1", subject: "THE EXTRACT ROW FLIPPED WITHOUT THE RECORD MOVING",
  what: "`MODES.extract.deployed` is set to true — the EXTRACT role becomes drivable before §7.3(7)'s open question was ever answered",
  mustFail: "this suite's NOT-deployed and closed-at-the-gate extract arms, AND skillsequencing ARM B4 across the tree (index 0 is no longer the only deployed mode)",
  mustNot: "the CHECK arms, the investigate arms, skillsequencing ARM B3 (the SET is unchanged — only a flag moved)",
  file: HARNESS,
  find: `  extract:     { deployed: false,`,
  replace: `  extract:     { deployed: true,`,
  run: () => {
    const r = runHarness();
    const seq = runSeq();
    const gate = anyFailed(r, /it is NOT deployed — §7\.3|extract run is CLOSED at the gate|NOT DEPLOYED YET/);
    const seqB4 = anyFailed(seq, /ARM B4/);
    const held = !anyFailed(r, /CHECK is deployed|investigate-fresh is NOT deployed|investigate run is CLOSED/) && !anyFailed(seq, /ARM B3/);
    return {
      observed: `harness ${r.pass}/${r.fail} · skillsequencing ${seq.pass}/${seq.fail} · extract gate arms ${gate ? "FAILED" : "did NOT fail"} · seq B4 ${seqB4 ? "FAILED" : "did NOT fail"} · check/investigate/B3 ${held ? "held" : "ALSO failed"}`,
      asDeclared: r.ran && gate && seqB4 && held,
    };
  },
});

arm({
  id: "E2", subject: "THE EXTRACT ROW REMOVED WHILE THE RECORD STILL NAMES IT — the other direction of the pairing",
  what: "the `extract` row is deleted from `MODES` with `DEPLOYMENT_SEQUENCE.order` untouched",
  mustFail: "this suite's row-EXISTS and NOT-DEPLOYED-YET arms (an unknown word again), AND skillsequencing ARM B3 (recorded, not in the table) and ARM B4 (the partition lost a member)",
  mustNot: "the CHECK and investigate arms; the unknown-word arm must still hold, because that is exactly what extract has become",
  file: HARNESS,
  find: `  extract:     { deployed: false,`,
  replace: `  extract_gone: { deployed: false,`,
  run: () => {
    const r = runHarness();
    const seq = runSeq();
    const gone = anyFailed(r, /an `extract` row EXISTS|NOT DEPLOYED YET/);
    const seqB3 = anyFailed(seq, /ARM B3/);
    const held = !anyFailed(r, /CHECK is deployed|investigate-fresh is NOT deployed|unknown word's refusal/);
    return {
      observed: `harness ${r.pass}/${r.fail} · skillsequencing ${seq.pass}/${seq.fail} · extract-row arms ${gone ? "FAILED" : "did NOT fail"} · seq B3 ${seqB3 ? "FAILED" : "did NOT fail"} · check/investigate/unknown ${held ? "held" : "ALSO failed"}`,
      asDeclared: r.ran && gone && seqB3 && held,
    };
  },
});

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
  find: `    const tick = await call("airuntick", null,
      { run: runId, log: [entry], consume });`,
  replace: `    const tick = decision.step === "close"
      ? { reached: true, status: 200, body: { ok: true, result: {} } }
      : await call("airuntick", null, { run: runId, log: [entry], consume });`,
  run: () => {
    const r = runHarness();
    const logArm = anyFailed(r, /every step the trace names produced a log entry|last entry is terminal|and names the bound/);
    const gateHeld = !anyFailed(r, /investigate-fresh is NOT deployed/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · log-always arms ${logArm ? "FAILED" : "did NOT fail"} · gate ${gateHeld ? "held" : "also failed"}`,
      asDeclared: r.ran && logArm && gateHeld,
    };
  },
});

arm({
  id: "H7", subject: "THE FOUR-LEVEL FAN-OUT, AND THE LEVELS ARE THE PLANE'S",
  what: "`internet` is dropped from LEVELS — the run searches three levels and reports on a four-level design",
  mustFail: "the source pin against the plane's OBSERVATION_LEVELS AND the four-sub-sessions arm through the op",
  mustNot: "the F10 arms or the gate — a member searching fewer levels is a coverage lie, not a control-flow break",
  file: HARNESS,
  find: `export const LEVELS = ["meaning", "content", "document", "internet"];`,
  replace: `export const LEVELS = ["meaning", "content", "document"];`,
  run: () => {
    const r = runHarness();
    const pin = anyFailed(r, /LEVELS is exactly the plane's set|four spawn payloads|one per level|four candidates, one per level|four levels/);
    const f10Held = !anyFailed(r, /routes to `adjust`|repeats. counter stayed/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · level pin + fan-out ${pin ? "FAILED" : "did NOT fail"} · F10 ${f10Held ? "held" : "also failed"}`,
      asDeclared: r.ran && pin && f10Held,
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
    const pinnedH = anyFailed(rh, /op the DRIVER actually names is in the pinned set|named in exactly one place|subset of the pinned set/);
    const pinnedM = anyFailed(rm, /every op named in the source is in the pinned set|every op named is in the pinned set/);
    const writeHeld = !anyFailed(rm, /record moved only through ops in the pinned set/)
                   && !anyFailed(rm, /one distinct credential/);
    return {
      observed: `harness ${rh.pass}/${rh.fail} · member ${rm.pass}/${rm.fail} · pinned-set arms ${pinnedH || pinnedM ? "FAILED" : "did NOT fail"} (harness ${pinnedH}, member ${pinnedM}) · write arms ${writeHeld ? "held (as declared)" : "also failed"}`,
      asDeclared: rh.ran && rm.ran && (pinnedH || pinnedM) && writeHeld,
    };
  },
});

arm({
  id: "H9", subject: "THE EMPTY-RUN INSTRUMENT (VF-1's owed control 7)",
  what: "`emptyLevelCandidates` returns nothing, so a run that honestly found nothing emits nothing",
  mustFail: "the empty-run arms — an empty run and a SILENT FAILURE become indistinguishable, which is exactly what §9's kind exists to prevent",
  mustNot: "the dedup arms, the F10 arms, or the gate — this is a reporting defect, not a control-flow one, and the suite must be able to tell them apart",
  file: HARNESS,
  find: `  const reports = Array.isArray(state?.reports) ? state.reports : [];
  const out = [];`,
  replace: `  const reports = [];
  const out = [];`,
  run: () => {
    const r = runHarness();
    const empty = anyFailed(r, /one candidate, for the one level|FOUR level-empty suggestions|each names its level|COUNTABLE|all four empty produce four candidates/);
    const f10Held = !anyFailed(r, /routes to `adjust`|repeats. counter stayed at ZERO/);
    const dedupHeld = !anyFailed(r, /NO edge from `compose` to `submit`/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · empty-run arms ${empty ? "FAILED" : "did NOT fail"} · F10 ${f10Held ? "held" : "also failed"} · dedup ${dedupHeld ? "held" : "also failed"}`,
      asDeclared: r.ran && empty && f10Held && dedupHeld,
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
  id: "F1", subject: "THE MISATTRIBUTION ITSELF — the gate regresses to the member's word",
  what: "`gate-mode` closes a refused launch on `cancelled` again, exactly as it did before FL-7. The plane's catalogue is untouched and still defines `mode-not-deployed`",
  mustFail: "the harness gate arms, A6b's DIRECTION 2 (code -> header), the through-the-op B7 arms INCLUDING the named misattribution arm, and — across the tree — skillsequencing ARM D1/D3/D4/D5 and D5b, which must NAME the misattribution rather than report an unequal string",
  mustNot: "A6b's DIRECTION 1 (the header still names a word the catalogue still defines, so that half is genuinely undisturbed) — and `airun.test.mjs`, whose subject is the catalogue and not the gate, must stay GREEN",
  file: HARNESS,
  find: `return { step: "close", bound: "mode-not-deployed",`,
  replace: `return { step: "close", bound: "cancelled",`,
  run() {
    const rh = runHarness();
    const seq = runSeq();
    const air = runAirun();
    const namedIt = seq.failed.some((l) => /D5b|misattribution/i.test(l))
                 || rh.failed.some((l) => /misattribution/i.test(l));
    const dir2 = anyFailed(rh, /DIRECTION 2/);
    const dir1Held = !anyFailed(rh, /DIRECTION 1/);
    return {
      observed: `harness ${rh.pass}/${rh.fail} FAIL · skillsequencing ${seq.pass}/${seq.fail} FAIL · airun ${air.pass}/${air.fail} FAIL`
        + ` · DIRECTION 2 failed: ${dir2} · DIRECTION 1 held: ${dir1Held} · a misattribution arm NAMED it: ${namedIt}`,
      asDeclared: rh.ran && seq.ran && air.ran && rh.fail > 0 && seq.fail > 0
                  && air.fail === 0 && dir2 && dir1Held && namedIt,
    };
  },
});

arm({
  id: "F2", subject: "THE CATALOGUE LOSES THE WORD — the header promises what nothing defines",
  what: "`mode-not-deployed` is removed from the plane's RUN_ENDINGS, restoring the exact pre-FL-7 condition on the catalogue side while the gate still tries to close on it",
  mustFail: "A6b's DIRECTION 1 (header -> catalogue) BY NAME; airun ARM V6/V6b; and the through-the-op arms G1/G2 — C-22.5 must refuse a bound the vocabulary no longer holds, which is the proof the op path is real and not a store-level assertion",
  mustNot: "nothing in this section is exempt — but the failure must be about the VOCABULARY, so `harness.test.mjs`'s A6 gate-step arms (which read `nextStep`'s return, not the plane) keep passing on step and why",
  file: AIRUN,
  find: `  "mode-not-deployed":`,
  replace: `  "mode-not-deployed-REMOVED-BY-CONTROL-ARM-F2":`,
  run() {
    const rh = runHarness();
    const air = runAirun();
    const dir1 = anyFailed(rh, /DIRECTION 1/);
    const opArm = anyFailed(air, /ARM G1|ARM G2/);
    const v6 = anyFailed(air, /ARM V6/);
    return {
      observed: `harness ${rh.pass}/${rh.fail} FAIL · airun ${air.pass}/${air.fail} FAIL`
        + ` · DIRECTION 1 failed: ${dir1} · through-the-op G1/G2 failed: ${opArm} · V6 failed: ${v6}`,
      asDeclared: rh.ran && air.ran && rh.fail > 0 && air.fail > 0 && dir1 && opArm && v6,
    };
  },
});

arm({
  id: "F3", subject: "ONE DIRECTION ONLY — the header names a DIFFERENT REAL ending",
  what: "the header's terminates-on claim is changed from `mode-not-deployed` to `cancelled`. **Both words are real endings the catalogue defines**, so the header -> catalogue direction is satisfied and only the code -> header direction is violated. This is the arm that shows the two directions are two independent assertions rather than one restated",
  mustFail: "A6b's DIRECTION 2 ALONE (the gate produces `mode-not-deployed`, the header now promises `cancelled`)",
  mustNot: "A6b's DIRECTION 1 — `cancelled` IS in the catalogue, so that half must stay GREEN, and a run in which both directions fail together would mean this suite holds one assertion written twice",
  file: HARNESS,
  find: "terminates on `mode-not-deployed` before",
  replace: "terminates on `cancelled` before",
  run() {
    const rh = runHarness();
    const dir2 = anyFailed(rh, /DIRECTION 2/);
    const dir1Held = !anyFailed(rh, /DIRECTION 1/);
    return {
      observed: `harness ${rh.pass}/${rh.fail} FAIL · DIRECTION 2 failed: ${dir2} · DIRECTION 1 held GREEN: ${dir1Held}`,
      asDeclared: rh.ran && rh.fail > 0 && dir2 && dir1Held,
    };
  },
});

arm({
  id: "F4", subject: "OVER-STRICTNESS, ARMED — a GENUINE member cancellation must still read as `cancelled`",
  what: "NOTHING about the member's ending is touched; instead the plane's `cancelled` TEXT is rewritten to a different sentence. The correction must not have made the member's ending vestigial: arms that assert a member cancellation is recorded as a member act must still be LIVE and must notice",
  mustFail: "airun ARM V6b and skillsequencing ARM D5 — both read `cancelled`'s sentence and both must object, which is what shows the member's ending is still genuinely asserted rather than left as a word nobody checks",
  mustNot: "the gate arms, DIRECTION 1 or DIRECTION 2 — none of them is about the member's ending, and a fix that made `cancelled` and `mode-not-deployed` interchangeable would show up as those failing too",
  file: AIRUN,
  find: `  cancelled:  "a member stopped it",`,
  replace: `  cancelled:  "the run came to an end somehow",`,
  run() {
    const air = runAirun();
    const seq = runSeq();
    const rh = runHarness();
    const memberArms = anyFailed(air, /ARM V6b/) || anyFailed(seq, /ARM D5/);
    const gateHeld = !anyFailed(rh, /DIRECTION 1|DIRECTION 2/) && rh.fail === 0;
    return {
      observed: `airun ${air.pass}/${air.fail} FAIL · skillsequencing ${seq.pass}/${seq.fail} FAIL · harness ${rh.pass}/${rh.fail} FAIL`
        + ` · a member-ending arm objected: ${memberArms} · the gate/two-way arms held: ${gateHeld}`,
      asDeclared: air.ran && seq.ran && rh.ran && memberArms && gateHeld,
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

const STORE = join(PLANE, "src", "store.mjs");

arm({
  id: "G1", subject: "THE DEFECT ITSELF RESTORED — a gate-refused run recorded as one that FINISHED",
  what: "`RUN_NEVER_STARTED` is emptied in the plane's airun.mjs, so `runStatusFor` falls through exactly as the pre-FL-8 ternary did and a launch the deployment gate refused is recorded `finished` again",
  mustFail: "airun ARM H1 (the status through three ops) and ARM H2, which must NAME the misdescription rather than report an unequal string; ARM W3, because `never-started` becomes a published term with no producer; ARM W5, which joins the ending and the status on one run; and the member suite's own FL-8 arm",
  mustNot: "ARM H3 (the over-strictness partition — nothing about a completed, cancelled or bound-stopped run moves), ARM V9 (the vocabulary is untouched), ARM W1 (the store still asks airun.mjs), W2 or W4",
  file: AIRUN,
  find: `export const RUN_NEVER_STARTED = { "mode-not-deployed": 1 };`,
  replace: `export const RUN_NEVER_STARTED = {};`,
  run() {
    const air = runAirun();
    const rh = runHarness();
    const named = anyFailed(air, /ARM H1|ARM H2/);
    const namesIt = /MISDESCRIBED: a launch the gate refused is on record as a run that FINISHED/.test(air.out);
    const heldOpen = !anyFailed(air, /ARM H3|ARM V9|ARM W1|ARM W2|ARM W4/);
    return {
      observed: `airun ${air.pass}/${air.fail} FAIL · harness ${rh.pass}/${rh.fail} FAIL`
        + ` · the status arms failed: ${named} · the failure NAMES the misdescription: ${namesIt}`
        + ` · the over-strictness, vocabulary and source arms held: ${heldOpen}`,
      asDeclared: air.ran && rh.ran && named && namesIt && heldOpen
                  && anyFailed(air, /ARM W3/) && rh.fail > 0,
    };
  },
});

arm({
  id: "G2", subject: "A SECOND COPY OF THE RULE THAT AGREES — the arm that earns the two-way claim",
  what: "the store stops ASKING airun.mjs and decides the status itself, with a copy that returns IDENTICAL answers for every bound and every ending. Nothing a caller can observe changes; only where the rule lives does",
  mustFail: "airun ARM W1, and EXACTLY THAT ONE. It is the whole point of this arm: a source-agreement assertion that failed here together with the behavioural arms would be the same comparison written twice, which is what FL-7's F3 measured one item ago",
  mustNot: "every other assertion in the suite — H1, H2, H3, H4, V9, W2, W3, W4, W5 — because the record a caller reads is byte-for-byte what it was",
  file: STORE,
  find: `      const status = runStatusFor(bound);`,
  replace: `      const status = bound === "mode-not-deployed" ? "never-started"\n                   : (stoppedByBound ? "stopped" : "finished");`,
  run() {
    const air = runAirun();
    const w1 = anyFailed(air, /ARM W1/);
    return {
      observed: `airun ${air.pass}/${air.fail} FAIL · W1 failed: ${w1} · failing arms: `
        + `${air.failed.length ? air.failed.map((l) => (l.match(/ARM \w+/) || ["?"])[0]).join(", ") : "none"}`,
      asDeclared: air.ran && w1 && air.fail === 1,
    };
  },
});

arm({
  id: "G3", subject: "THE VOCABULARY POINTED ELSEWHERE — a status term with no producer",
  what: "a FIFTH status term (`abandoned`) is added to `RUN_STATUS` with nothing anywhere able to produce it — the shape of every vocabulary drift this repository has recorded: a published word nothing writes",
  mustFail: "airun ARM V9 (the vocabulary is asserted as an exact SET, the guard `RUN_ENDINGS` has had since FL-7 and the status vocabulary had NEVER had) and ARM W3 (vocabulary -> keying: every terminal term must be REACHABLE). Two assertions, and they are two claims rather than one — V9 is about what the set IS, W3 about whether anything can write it",
  mustNot: "ARM W2 (keying -> vocabulary is unaffected: producing a subset is still producing terms the vocabulary holds), ARM W1, ARM W4, or any behavioural arm — nothing a run does changes",
  file: AIRUN,
  find: `export const RUN_STATUS = { running: 1, finished: 1, stopped: 1, "never-started": 1 };`,
  replace: `export const RUN_STATUS = { running: 1, finished: 1, stopped: 1, "never-started": 1, abandoned: 1 };`,
  run() {
    const air = runAirun();
    const both = anyFailed(air, /ARM V9/) && anyFailed(air, /ARM W3/);
    const held = !anyFailed(air, /ARM W1|ARM W2|ARM W4|ARM H1|ARM H2|ARM H3|ARM H4/);
    return {
      observed: `airun ${air.pass}/${air.fail} FAIL · V9 and W3 both failed: ${both}`
        + ` · the keying and behavioural arms held: ${held}`,
      asDeclared: air.ran && both && held && air.fail === 2,
    };
  },
});

arm({
  id: "G4", subject: "OVER-STRICTNESS, ARMED — the fix must not sweep every ending into `never-started`",
  what: "`RUN_NEVER_STARTED` gains `cancelled` and `completed`, so a run that genuinely RAN to its end and one a member stopped are ALSO recorded as never having started. This is the over-reach the queue row's second control exists to catch, and it is the shape a careless fix would actually take",
  mustFail: "airun ARM H3 (the whole partition in one assertion, naming which one moved), ARM C4 (the member cancellation's own status, which has read `finished` since IS-6 and is deliberately left standing by FL-8), and ARM W3 — because with every ending swept up, `finished` becomes the term with no producer",
  mustNot: "ARM H1 or H2 — the gate refusal still reads `never-started`, which is what shows this arm measures OVER-reach and not the fix itself; nor ARM V9, W1, W2 or W4",
  file: AIRUN,
  find: `export const RUN_NEVER_STARTED = { "mode-not-deployed": 1 };`,
  replace: `export const RUN_NEVER_STARTED = { "mode-not-deployed": 1, cancelled: 1, completed: 1 };`,
  run() {
    const air = runAirun();
    const overreach = anyFailed(air, /ARM H3/) && anyFailed(air, /ARM C4/) && anyFailed(air, /ARM W3/);
    const gateHeld = !anyFailed(air, /ARM H1|ARM H2|ARM V9|ARM W1|ARM W2|ARM W4/);
    return {
      observed: `airun ${air.pass}/${air.fail} FAIL · the over-strictness arms objected: ${overreach}`
        + ` · the gate's own arms held: ${gateHeld}`,
      asDeclared: air.ran && overreach && gateHeld,
    };
  },
});

arm({
  id: "G5", subject: "THE MOCK DECIDES AGAIN — the instrument defect FL-8 found, put back",
  what: "the plane mock's `airunclose` branch stops looking the status up and reproduces the plane's keying by hand, in the exact spelling it carried from FL-3 until FL-8 (`bound === \"completed\" || bound === \"cancelled\" ? \"finished\" : \"stopped\"`). This is not a hypothetical: it is what the file actually said, and it had been answering `stopped` for `mode-not-deployed` while the plane answered `finished`, with nothing comparing the two",
  mustFail: "harness A6c2 (the source assertion that the hand-written keying is GONE and the table arrived as data) and B7's FL-8 arm, which reads the status the member's refused launch is recorded under",
  mustNot: "A6c itself — the interpolated table is still correct, which is exactly why a table alone was never the fix; nor A6b's two directions, nor any airun arm, because the plane is untouched",
  file: join(MEMBER, "test", "harness.test.mjs"),
  find: `      S.status = STATUS_BY_BOUND[bound] || "finished";`,
  replace: `      S.status = bound === "completed" || bound === "cancelled" ? "finished" : "stopped";`,
  run() {
    const rh = runHarness();
    const air = runAirun();
    const objected = anyFailed(rh, /A6c2/) && anyFailed(rh, /NEVER STARTED/);
    const held = !anyFailed(rh, /A6c \(FL-8\)|DIRECTION 1|DIRECTION 2/) && air.ran && air.fail === 0;
    return {
      observed: `harness ${rh.pass}/${rh.fail} FAIL · airun ${air.pass}/${air.fail} FAIL`
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
  mustNot: "FT0 (the mock refuses on its own, driven directly), FT1d/FT1e (a reading aimed outside is still refused "
    + "and still not compared), FT2 (a project run never had a target) and the fanout suite's FL-12a (the mock alone)",
  file: DRIVER,
  find: `    target: seeded.target, targetBasis: seeded.basis,`,
  replace: `    targetBasis: seeded.basis,`,
  run() {
    const rh = runHarness();
    const rf = runFanout();
    const failedAsDeclared = [/^FT1 \(FL-11\)/, /^FT1b /, /^FT1c /, /^FT3 /, /^FT4 \(FL-12/, /FOUR level-empty suggestions/]
      .every((re) => anyFailed(rh, re)) && anyFailed(rf, /^FL-12b /);
    const held = !anyFailed(rh, /^FT0|^FT1d |^FT1e |^FT2/) && !anyFailed(rf, /^FL-12a/);
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

arm({
  id: "D1", subject: "D-452 — THE DEFECT RESTORED: a drop at `adjust` ends the pass",
  what: "`adjust` with nothing adjusted and a non-empty queue routes back to `next-pass`, as before D-452",
  mustFail: "harness `D-452: the rest of the pass is written` BY NAME, with the sent-exactly-once, drop-went-to-submit "
    + "and counts-what-it-wrote D-452 arms and A3's `with candidates queued behind it goes on to submit the REST`; "
    + "and fanout B6b's `while the legal candidate ahead of it … LANDED` (its level-empty candidate sits behind a drop)",
  mustNot: "`D-452: the DROPPED candidate was sent ONCE and never landed` and `D-452: nothing was resent verbatim` "
    + "(the defect loses candidates, it resends none), B5's single-candidate drop, B4's adjust, A3's NOTHING-behind-it "
    + "arm, B6's empty run and every FT arm",
  file: HARNESS,
  find: `      if (!s.adjusted && queue.length)
        return { step: "submit",`,
  replace: `      if (!s.adjusted && queue.length)
        return { step: "next-pass",`,
  run() {
    const r = runHarness();
    const rf = runFanout();
    const failedAsDeclared = [/^D-452: the rest of the pass is written/, /^D-452: …and each was SENT exactly once/,
      /^D-452: the drop went on to `submit`/, /^D-452: the run counts what it wrote/,
      /with candidates queued behind it goes on to `submit` the REST/].every((re) => anyFailed(r, re))
      && anyFailed(rf, /^while the legal candidate ahead of it in the queue LANDED/);
    const held = !anyFailed(r, /^D-452: the DROPPED candidate|^D-452: nothing was resent|DROPPED the candidate rather|called ONCE|NOTHING behind it|adjusted version LANDED|^FT|FOUR level-empty/)
      && !anyFailed(rf, /the illegal candidate did NOT land|^FL-12/);
    return {
      observed: `harness ${r.pass}/${r.fail} FAIL · fanout ${rf.pass}/${rf.fail} FAIL · the declared arms failed by name: ${failedAsDeclared} · the MUST-NOT arms held: ${held}`,
      asDeclared: r.ran && rf.ran && failedAsDeclared && held,
    };
  },
});

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
    + "verbatim` BY NAME (PL-3's `repeats` climbs), with B5's called-ONCE arm; COUPLED, and declared: FT1d, FT2d "
    + "and FT3, each of which drives a refusal",
  mustNot: "`D-452: the rest of the pass is written` — which is exactly why that arm alone could not tell the fix from "
    + "the liar, and the sent-once/never-landed arm exists — and B4's adjusted landing, B6's four level-empty "
    + "suggestions, FT0*, FT1/FT1b/FT1c",
  file: DRIVER,
  find: `      if (changed) queue.unshift(state.submission);`,
  replace: `      if (changed) queue.unshift(state.submission); else queue.push(state.refusedSubmission);`,
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
 * SECTION O — OVER-STRICTNESS. Correct work in a spelling nobody anticipated
 * must PASS. Nothing is edited here: the arms already in the suites are the
 * subject, and this section exists to record that they were RUN on a clean tree
 * and were green — an over-strictness claim nobody measured is a claim.
 * ========================================================================== */
anchorTable();   /* M0-197: prints the arms read above and exits, under the dry read only (H10 patches nothing) */
if (!only.length || only.includes("H10")) {
  armsRun++;
  console.log(`\n=== ARM H10 · OVER-STRICTNESS (nothing is broken)`);
  console.log(`    MUST PASS      : a run with no judgements at all; MORE judgements than judged steps;`);
  console.log(`                     an empty judgement object; an explicit max_steps; a run id with`);
  console.log(`                     punctuation; a namespace with capitals and a hyphen; turns exactly`);
  console.log(`                     at the bound. Both suites green and coverage --strict exit 0.`);
  const rh = runHarness();
  const rm = runMember();
  const cov = runCoverageStrict();
  const ok = rh.ran && rh.fail === 0 && rm.ran && rm.fail === 0 && cov.code === 0;
  console.log(`    OBSERVED       : harness ${rh.pass} pass / ${rh.fail} FAIL · member ${rm.pass} pass / ${rm.fail} FAIL · coverage --strict exit ${cov.code}`);
  if (ok) { armsAsDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
  else { console.log(`    VERDICT        : *** NOT AS DECLARED ***`); findings.push(`H10: harness ${rh.fail} FAIL, member ${rm.fail} FAIL, coverage exit ${cov.code}`); }
}

console.log(`\n${"=".repeat(78)}`);
console.log(`arms run: ${armsRun} · as declared: ${armsAsDeclared} · findings about the arms: ${findings.length}`);
for (const f of findings) console.log(`  FINDING: ${f}`);
console.log(`Every arm was armed ALONE with the other defences held open; every restore was`);
console.log(`verified by sha256 AND by cmp against a copy taken before the edit.`);
process.exit(findings.length ? 1 : 0);
