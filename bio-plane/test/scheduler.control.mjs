/* FL-4 / IS-9 — THE SUSPENDED RUN'S WAKE: THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — PL-4's `capturerequests.control.mjs`
 * precedent, whose harness this takes function for function rather than
 * rewriting (a second copy of a control harness is a second place for it to
 * drift, and this one has already been corrected twice by its own findings).
 *
 * IT LIVES INSIDE THIS WORKTREE and never in a shared scratchpad: a worker's
 * harness was OVERWRITTEN MID-TURN by another running worker on 2026-08-07, and
 * a harness silently replaced between ARM and RESTORE reports a restore it
 * never performed.
 *
 * EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT, against uniquely-named
 * per-arm pristine copies taken before the arm, with a printed byte count under
 * a floor. A digest agreeing with itself over an empty read is the failure two
 * harnesses in this repository have already reported as a clean restore.
 *
 * WHAT THE ARMS ARE FOR, AND WHY THESE FIVE PROPERTIES. FL-4's whole risk is
 * the one WORKER.md names most often: a mechanism believed because it EXISTS.
 * A consumer that is registered, ticks, and does nothing observable would look
 * exactly like this one. So every arm below removes ONE thing the consumer
 * does and asserts the suite notices BY NAME, with its neighbours held open:
 *
 *   (1) THE WAKE           — the run is never told the daemon answered.
 *   (2) THE HOLD           — a run waiting on our own daemon is reaped as dead.
 *   (3) THE STAMP          — the completion is delivered again, and again.
 *   (4) THE BOUND          — the hold becomes an immortality clause.
 *   (5) SELF-TERMINATION   — an idle instance carries a timer.
 *   (6) THE SECOND ALARM   — the plan row's OWN declared control, armed.
 *   (7) THE CRON           — the other half of the same recorded decision.
 *   (8) THE NAMING         — the consumer disappears into `probes`.
 *   (9) OVER-STRICTNESS    — correct work in a spelling the suite did not
 *                            anticipate must PASS. A fence tighter than its
 *                            rule is an undeclared interface change.
 *   (0) BASELINE           — no edit at all. Without this row, six broken arms
 *                            and six working ones read the same.
 *
 * Run it:  node test/scheduler.control.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = {
  store: ROOT + "src/store.mjs",
  wrangler: ROOT + "wrangler.jsonc",
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));
/* THE FLOOR ON THE PRISTINE COPY. A restore verified against an empty or
   truncated snapshot passes for free — measured twice in this repository, once
   caught only because a digest read `e3b0c442…`, the sha256 of the empty
   string. */
const FLOOR = { store: 400000, wrangler: 1000 };
for (const [k, v] of Object.entries(ORIGINAL)) {
  console.log(`  pristine ${k}: ${v.length} bytes · ${ORIGINAL_SHA[k].slice(0, 12)}…`);
  if (v.length < FLOOR[k]) throw new Error(`PRISTINE COPY BELOW FLOOR: ${k} read ${v.length} bytes`);
}

let armsRun = 0, armsWrong = 0;

/* The suite's own report, parsed from its `N passed, M failed` line. A suite
   whose count cannot be READ is reported as UNKNOWN and never as zero: an
   unreadable number and no assertions are different claims (D-93's lesson, and
   WORKER.md's "report a missing tally as -1, never 0"). */
function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 600000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const m = /(\d+) passed, (\d+) failed/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 130));
  /* THE SUITE MUST HAVE REACHED ITS OWN FOOT. A TypeError inside an assertion
     goes through no assertion at all: it ends the module while the tally reads
     clean, so an arm that killed the suite outright would otherwise be scored
     as an arm that changed nothing. */
  return m ? { pass: +m[1], fail: +m[2], named, reachedFoot: true, out }
           : { pass: -1, fail: -1, named, reachedFoot: false, out };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 70)}…' occurs ${n} times in ${key}. `
    + `An unguarded edit would have armed ${n} sites, and a control armed in more places than it claims `
    + `is not the control it reports.`);
  writeFileSync(F[key], src.replace(from, to));
}

function restoreAll(armId) {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (now.length < FLOOR[k]) throw new Error(`RESTORE BELOW FLOOR (${armId}): ${k} read ${now.length} bytes`);
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH (${armId}): ${k}`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT (${armId}): ${k}`);
  }
}

/* `mustPass` is the over-strictness direction: an arm may declare that the
   suite stays entirely GREEN, which is the ONE case where a green run is the
   correct answer rather than a control proving nothing. */
function arm(id, title, edits, mustFail, mustNotFail = [], { mustStayGreen = false } = {}) {
  armsRun++;
  console.log(`\n=== ${id} ${title}`);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite("scheduler.test.mjs");
    console.log(`  MEASURED: ${r.pass} passed, ${r.fail} failed${r.reachedFoot ? "" : "  ** THE SUITE DID NOT REACH ITS OWN FOOT"}`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    if (!r.reachedFoot) { console.log("  ** WRONG: no tally — the arm may have ended the module rather than failed an assertion"); wrong = true; }
    for (const frag of mustFail)
      if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
    if (mustStayGreen) {
      if (r.fail !== 0) { console.log("  ** WRONG: correct work in an unanticipated spelling was REFUSED — the suite is tighter than the rule"); wrong = true; }
    } else if (!r.fail) {
      console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing."); wrong = true;
    }
    if (wrong) armsWrong++; else console.log("  as declared");
  } finally {
    restoreAll(id);
    console.log("  restored: every file verified by sha256 AND by content, against a floored pristine copy");
  }
}

console.log("\nFL-4 — negative controls. Whole-tree BASELINE first, so every arm below is a DELTA.");
const base = runSuite("scheduler.test.mjs");
console.log(`  (0) BASELINE scheduler.test.mjs, NO EDIT: ${base.pass} passed, ${base.fail} failed`);
if (base.fail !== 0 || !base.reachedFoot) {
  console.log("  ** the tree is not whole; every arm below would measure the wrong thing");
  process.exit(1);
}

arm("(1)", "THE WAKE. Make the wake loop iterate nothing, holds left live. The daemon answers and "
  + "the run is never told: no observation entry, no stamp, no lease renewed for the resumption. This "
  + "is the arm that distinguishes a consumer that is REGISTERED from one that DOES something.",
  [["store", "    for (const r of this.#aiRunWakeRuns()) {", "    for (const r of []) {"]],
  ["ONE run was woken, for ONE completion",
   "the run's log carries exactly one wake entry",
   "the completed request is stamped with WHEN the run was told"],
  ["the drain captured one and held the other",
   "the registry is exactly the ten real consumers, in order"]);

arm("(2)", "THE HOLD. Make the hold loop iterate nothing, the wake left live. A run waiting on OUR "
  + "OWN daemon stops being held, its five-second lease lapses, and the reaper takes it — writing "
  + "`lease` as the bound that stopped it. That is our pacing recorded as the run's death, which is "
  + "the defect this consumer exists to close, and it is D-104's split inverted at the run grain.",
  /* THIS ARM'S DECLARATION WAS CORRECTED AFTER ITS FIRST RUN AND THE CORRECTION
     IS THE FINDING, not a tidy-up. It declared that "the run is STILL RUNNING,
     not reaped" and "the hold moved the lease out beyond the clock" would fail,
     and NEITHER DID — because the suite's only suspended run had also received
     a completion, and the WAKE renews a lease too. The suite was measuring the
     wake where it claimed to measure the hold. A SECOND RUN that has heard
     nothing back at all was added to the suite so the hold has an arm of its
     own, and that arm is what this control now names. */
  [["store", "    for (const r of this.#aiRunWakeHolds(iso)) {", "    for (const r of []) {"]],
  ["and BOTH runs were HELD",
   "the run that has heard NOTHING back is alive too, on the hold alone",
   "past the request's OWN expiry the hold stops"],
  ["ONE run was woken, for ONE completion"]);

arm("(3)", "THE STAMP. Remove the `run_woken_at` write. Every alarm re-delivers the same completion "
  + "for ever: a fresh observation entry each time, a lease renewed on a run nothing is waiting for, "
  + "and a consumer that never self-terminates. Delivered-exactly-once is the whole of the idempotence "
  + "here and nothing else enforces it.",
  [["store", `          this.sql.exec(\`UPDATE capture_requests SET run_woken_at = ? WHERE request = ?\`, iso, q.request);`,
    `          void q;`]],
  ["a second alarm delivers NOTHING new",
   "the completed request is stamped with WHEN the run was told"],
  ["the registry is exactly the ten real consumers, in order"]);

arm("(4)", "THE BOUND. Remove the request's own expiry from the hold's predicate. A request nothing "
  + "can ever satisfy then holds its run open for ever: the hold stops being a way to survive a wait "
  + "and becomes an immortality clause, and a run that cannot die is a worse defect than the one the "
  + "hold closes.",
  /* THE ANCHOR IS THE `EXISTS` CLAUSE AND NOT THE WHOLE QUERY, and the first
     version of this arm REFUSED TO ARM BLIND rather than arming the wrong site
     — the guard earning its keep. It anchored a query that had since gained a
     `LIMIT ?` (the derivation-bounds ratchet made it bounded), matched zero
     times, and stopped. An arm that did not arm is a finding, and it is
     recorded here rather than quietly re-anchored. */
  [["store", `                       WHERE cr.run = r.run AND cr.state IN ('requested','draining') AND cr.expires > ?)
        ORDER BY r.run LIMIT ?\`, iso, iso, Store.AI_RUN_WAKE_TICK_BATCH);`,
    `                       WHERE cr.run = r.run AND cr.state IN ('requested','draining') AND ? IS NOT NULL)
        ORDER BY r.run LIMIT ?\`, iso, iso, Store.AI_RUN_WAKE_TICK_BATCH);`]],
  ["past the request's OWN expiry the hold stops"],
  ["ONE run was woken, for ONE completion"]);

arm("(5)", "SELF-TERMINATION. Make the wake unconditional. An instance with nothing suspended then "
  + "arms an alarm and re-arms it for ever — the property REC-1 prized and the one the sovereign "
  + "instances the installer targets are paid for. It is also the property a consumer is most likely "
  + "to lose by accident, because nothing about a working instance looks different.",
  [["store", "    if (this.#aiRunWakePending(now) <= 0) return null;\n    return now + this.#aiRunWakeTickMs();",
    "    return now + this.#aiRunWakeTickMs();"]],
  ["an instance with nothing suspended arms no alarm at all"],
  ["ONE run was woken, for ONE completion",
   "and the SAME run was HELD"]);

arm("(6)", "THE PLAN ROW'S OWN CONTROL, ARMED: *add the run's own alarm*. Give the wake consumer a "
  + "second `setAlarm` of its own, outside the one reconcile. SCHEDULER.md's recorded decision is ONE "
  + "reconciling alarm, and a second one is not a scheduling detail — it is a consumer that can no "
  + "longer be starved OR reconciled, which is how per-consumer sprawl starts. Before FL-4 this suite "
  + "carried the declaration and no assertion that could fail on it.",
  [["store", "  #aiRunWake(now) {\n    const iso = Store.#aiIso(now);",
    "  #aiRunWake(now) {\n    this.ctx.storage.setAlarm(now + 1000);\n    const iso = Store.#aiIso(now);"]],
  ["EVERY setAlarm in the plane is inside #reconcileAlarm"],
  ["the registry is exactly the ten real consumers, in order",
   "and NO cron: wrangler.jsonc declares no triggers block"]);

arm("(7)", "THE OTHER HALF OF THE SAME DECISION: *or cron*. Add a cron trigger to wrangler.jsonc. A "
  + "cron cannot serve the one-second drain and fires every minute on every idle instance for ever, "
  + "which is the second scheduler SCHEDULER.md exists to refuse — and it would be invisible to every "
  + "behavioural arm in this suite, because the consumers would all still work.",
  [["wrangler", `  "observability": { "enabled": true }`,
    `  "triggers": { "crons": ["*/1 * * * *"] },\n  "observability": { "enabled": true }`]],
  ["and NO cron: wrangler.jsonc declares no triggers block"],
  ["EVERY setAlarm in the plane is inside #reconcileAlarm",
   "ONE run was woken, for ONE completion"]);

arm("(8)", "THE NAMING. Remove the consumer's `else if` in onAlarm and it falls through to `probes` — "
  + "reported as a TEST PROBE. The wake still happens; the alarm's own account of itself stops saying "
  + "so, which is how a real clock disappears from the record of what ran. Four consumers before this "
  + "one are named for exactly this reason and none of them had an arm proving it.",
  [["store", `      else if (c.name === "ai-run-wake") airunwake = r && r.airunwake;\n`, ""]],
  ["the alarm's own answer NAMES the wake",
   "ONE run was woken, for ONE completion"],
  ["the drain captured one and held the other"]);

arm("(9)", "OVER-STRICTNESS: correct work in a spelling the suite did not anticipate. The wake's "
  + "terminal set is written as an SQL `IN`; here it is written as two `OR`d equalities, which is the "
  + "same rule differently spelled. The suite MUST STAY GREEN. A suite that pins the SQL rather than "
  + "the behaviour is a fence tighter than its rule, which is an undeclared interface change wearing "
  + "the costume of caution.",
  [["store", `                       WHERE cr.run = r.run AND cr.state IN ('captured','refused')
                         AND cr.run_woken_at IS NULL)`,
    `                       WHERE cr.run = r.run AND (cr.state = 'captured' OR cr.state = 'refused')
                         AND cr.run_woken_at IS NULL)`]],
  [], [], { mustStayGreen: true });

console.log(`\nFL-4 controls: ${armsRun} arms run, ${armsWrong} NOT as declared.`);
process.exit(armsWrong ? 1 : 0);
