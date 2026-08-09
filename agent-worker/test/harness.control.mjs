#!/usr/bin/env node
/* THE NEGATIVE CONTROL DRIVER for FL-3 (the run harness, IS-9). Deliberately NOT
 * a `.test.mjs`: it EDITS REAL SOURCES while it runs, and neither
 * `scripts/battery.mjs` nor the fleet walk must discover it (FL-2/PL-3/PL-4's
 * precedent).
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
 * RESULTS — 2026-08-08, worktree agent-ad6e5ed43aac4a2ab. Baseline before every
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
  const r = spawnSync(process.execPath, [join(HERE, file)], { cwd: MEMBER, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(new RegExp(`${label}:\\s*(\\d+) passed,\\s*(\\d+) failed`));
  const failed = [...out.matchAll(/^\s*FAIL\s+(.+)$/gm)].map((x) => x[1].trim());
  return m ? { ran: true, pass: +m[1], fail: +m[2], failed, out }
           : { ran: false, pass: 0, fail: -1, failed, out };
}
const runHarness = () => runNamed("harness.test.mjs", "harness");
const runMember = () => runNamed("agent-worker.test.mjs", "agent-worker");

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

function arm({ id, subject, what, mustFail, mustNot, file, find, replace, run }) {
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
  mustNot: "the dedup arms, the gate, the four-level fan-out, or the empty-run arm",
  file: HARNESS,
  find: `      if (!s.adjusted)
        return { step: "next-pass",`,
  replace: `      if (false)
        return { step: "next-pass",`,
  run: () => {
    const r = runHarness();
    const dropArm = anyFailed(r, /UNADJUSTED one drops the candidate|DROPPED the candidate|called ONCE|repeats. counter never moved|nothing was adjusted|nothing was resent/);
    const fanoutHeld = !anyFailed(r, /LEVELS is exactly the plane's set|four spawn payloads/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · drop/resend arms ${dropArm ? "FAILED" : "did NOT fail"} · fan-out ${fanoutHeld ? "held" : "also failed"}`,
      asDeclared: r.ran && dropArm && fanoutHeld,
    };
  },
});

arm({
  id: "H4", subject: "LOOP TERMINATION IS NOT THE MODEL'S (SK-2's review criterion, as code)",
  what: "`maxPasses` is removed from NOT_JUDGEABLE, so a judgement can set the loop bound",
  mustFail: "the per-field overreach arm for `maxPasses`, by name, AND the through-the-op JUDGEMENT_OVERREACH arm",
  mustNot: "the budget arms — the two are different mechanisms and this is what shows it",
  file: HARNESS,
  find: `export const NOT_JUDGEABLE = ["pass", "maxPasses", "step", "budget", "mode", "bound", "run", "store"];`,
  replace: `export const NOT_JUDGEABLE = ["pass", "step", "budget", "mode", "bound", "run", "store"];`,
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

arm({
  id: "H6", subject: "LOG-ALWAYS — the log is written whether or not the run succeeds",
  what: "the driver skips its tick on the terminal step, so the last thing a run did is never recorded",
  mustFail: "the one-entry-per-step arm and the terminal-entry arms; §14b.6's whole point is that the log's value is the FAILURE path",
  mustNot: "the gate arm, the dedup arms, or the F10 arms",
  file: DRIVER,
  find: `    const tick = await call("airuntick", null,
      { run: runId, log: [stepLog(state, decision)], consume });`,
  replace: `    const tick = decision.step === "close"
      ? { reached: true, status: 200, body: { ok: true, result: {} } }
      : await call("airuntick", null, { run: runId, log: [stepLog(state, decision)], consume });`,
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
  find: `        const got = await meaningRead(call, { rows: "legs", limit: 1, ids: [address] });`,
  replace: `        await call("meaningquery", { q: address });
        const got = await meaningRead(call, { rows: "legs", limit: 1, ids: [address] });`,
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
