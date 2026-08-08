/* PL-4 / IS-4 / SWEEP 4b.1 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — PL-3's `suggest.control.mjs` precedent, which
 * took it from `versionstate.control.mjs` and `check-refusal-codes.mjs`.
 *
 * IT LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. On 2026-08-07
 * a worker's harness was OVERWRITTEN MID-TURN by another running worker, and a
 * harness silently replaced between ARM and RESTORE reports a restore it never
 * performed.
 *
 * EVERY RESTORE IS VERIFIED BY CONTENT AS WELL AS BY HASH. A sha256 comparison
 * answers "the bytes are the same" only if the reader that produced both digests
 * was the same reader; a byte comparison of the strings answers it outright, and
 * both are cheap.
 *
 * THE ITEM'S SPINE IS ARM (1). Everything else in this item is a rule about
 * BEHAVIOUR; arm (1) is the rule about WHO ACTS. If a caller can make the plane
 * fetch for it, nothing else here matters, because the AI would then be
 * capturing rather than requesting and DEC-47's structural gate would be gone.
 *
 * EACH CONDUCT ARM IS ARMED ALONE, with the others HELD OPEN, and each states
 * what must NOT fail. An arm that fails "somewhere" proves the suite is
 * sensitive to something; an arm that fails at its OWN rule and leaves its
 * neighbours green proves the rules are separate rules.
 *
 * TWO ARMS ARE ABOUT INSTRUMENTS RATHER THAN THE SUBJECT — (7) the purge, run
 * against `hygiene.test.mjs` rather than against this item's own suite, and (8)
 * the notification's attribution. Both are places where a defect would be
 * silent: a purge reporting scope ALL while rows stand, and a member-facing
 * item that cannot say whose act it announces.
 *
 * Run it:  node test/capturerequests.control.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = {
  store: ROOT + "src/store.mjs",
  index: ROOT + "src/index.mjs",
  checks: ROOT + "checks/bio-checks.mjs",
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

let armsRun = 0, armsWrong = 0;

/* The suite's own report, parsed from its `N pass, M fail` line. A suite whose
   count cannot be read is reported as UNKNOWN rather than as zero: an unreadable
   number and no assertions are different claims (D-93's lesson). */
function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 600000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 120));
  return m ? { pass: +m[1], fail: +m[2], named, out } : { pass: null, fail: null, named, out };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 70)}…' occurs ${n} times in ${key}. `
    + `An unguarded edit would have armed ${n} sites, and a control armed in more places than it claims `
    + `is not the control it reports.`);
  writeFileSync(F[key], src.replace(from, to));
}

function restoreAll() {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k}`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT: ${k}`);
  }
}

function arm(title, edits, mustFail, mustNotFail = [], suite = "capturerequests.test.mjs") {
  armsRun++;
  console.log(`\n=== ${title}`);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite(suite);
    console.log(`  MEASURED (${suite}): ${r.pass} pass, ${r.fail} fail`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    for (const frag of mustFail)
      if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
    if (!r.fail) { console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing."); wrong = true; }
    if (wrong) armsWrong++;
  } finally {
    restoreAll();
    console.log("  restored: every file verified by sha256 AND by content");
  }
}

console.log("PL-4 / IS-4 — negative controls. Whole-tree baseline first, so every arm is a DELTA.");
const base = runSuite("capturerequests.test.mjs");
console.log(`  BASELINE capturerequests.test.mjs: ${base.pass} pass, ${base.fail} fail`);
const baseHyg = runSuite("hygiene.test.mjs");
console.log(`  BASELINE hygiene.test.mjs: ${baseHyg.pass} pass, ${baseHyg.fail} fail`);
if (base.fail !== 0 || baseHyg.fail !== 0) {
  console.log("  ** the tree is not whole; arms below would measure the wrong thing");
  process.exit(1);
}

/* ====================== (1) THE SPINE ==================================== */

arm("(1) THE SPINE — THE AI DOES NOT CAPTURE, IT REQUESTS. Neuter the `draining` gate on "
  + "op=acquire's capture-request arm and a caller holding a real request id can make the plane fetch "
  + "for it. That is DEC-47's structural gate gone: the fetch the AI wanted would be performed at the "
  + "AI's timing, by the AI's call, and the daemon would be a formality. Three callers, three classes, "
  + "one shape — which is why the gate is a shape and not a class list.",
  [["index", `  if (!d || d.draining !== true) {`, `  if (false) {`]],
  ["a member session's credential holding a real request id is refused",
   "an OPERATOR's credential holding a real request id is refused",
   "the DAEMON's own credential, outside a drain tick",
   "EVERY code in the family was DRIVEN out of the plane"],
  ["a request that can name only ONE principal is refused at the drain BY NAME",
   "a request to a host in cool-off is HELD by name"]);

/* ====================== (2)-(5) DEC-47's CONDUCT, ONE AT A TIME =========== */

arm("(2) CONDUCT 1 — THE AGENT'S CONTACT URL (C-28.6), the other rules HELD OPEN. "
  + "D-94's ladder MEASURED that removing this component flips admission 200 to 403 uniformly, so it "
  + "is what decides whether the fetch happens at all — and SOURCE-ACCESS.md's standing position is "
  + "that BIO does not disguise its requests. With the check gone an unrecognised agent mode reaches "
  + "the source.",
  /* C-28.6 HAS TWO PRODUCERS AND THIS ARM NEUTERS THE DRIVABLE ONE, deliberately
     leaving the other live — PL-3's arm (6) finding, which is that the DEC-49
     floor measures a CODE'S reachability and not a BRANCH'S. The roster refusal
     is the producer a caller can reach; the contact-URL refusal behind it guards
     the composed CivicOS string, which carries the component by construction, so
     it is unreachable today and is kept as the statement of the rule D-94
     measured rather than as a drivable arm. */
  [["store", `    if (!CAPTURE_UA_MODES.includes(q.ua_mode))`, `    if (false)`]],
  ["an agent mode outside the two legible forms is refused at the drain by name",
   "EVERY code in the family was DRIVEN out of the plane"],
  ["a member-browser fetch under a question that records NO member agent is refused",
   "a request to a host in cool-off is HELD by name",
   "OVER-STRICTNESS ARM: with the member's own agent RECORDED"]);

arm("(3) CONDUCT 1b — THE MEMBER AGENT MUST BE RECORDED, NEVER INVENTED (C-28.7), the other rules "
  + "HELD OPEN. BOB-3 permits DELEGATING an agent a member actually used; composing one would be the "
  + "fabricated-Mozilla case wearing the ruling's clothes. AND THE OVER-STRICTNESS ARM MUST STAY GREEN: "
  + "a recorded member agent is a PERMITTED fetch and a check that refuses it is a defect in the check.",
  [["store", `      if (!ua)\n        return { ok: false, terminal: true, code: "CAPTURE_CONDUCT_UA_UNRECORDED",`,
             `      if (false)\n        return { ok: false, terminal: true, code: "CAPTURE_CONDUCT_UA_UNRECORDED",`]],
  ["a member-browser fetch under a question that records NO member agent is refused",
   "EVERY code in the family was DRIVEN out of the plane"],
  ["OVER-STRICTNESS ARM: with the member's own agent RECORDED",
   "and the agent that left is the member's own, verbatim"]);

arm("(4) CONDUCT 2 — THE PURPOSE TOKEN (C-28.8), the other rules HELD OPEN. "
  + "DEC-47 requires an investigation fetch to introduce or reuse a purpose token DELIBERATELY. With "
  + "this gone, an arbitrary word rides into the user-agent and the instance tells a source something "
  + "false about why it is asking — and the source can no longer tell a first capture from a re-check.",
  [["store", `    if (!CAPTURE_PURPOSES.includes(q.purpose))`, `    if (false)`]],
  ["and the DRAIN turns it away by name",
   "EVERY code in the family was DRIVEN out of the plane"],
  ["a request to a host in cool-off is HELD by name",
   "OVER-STRICTNESS ARM: with the member's own agent RECORDED"]);

arm("(5) CONDUCT 3 — RATE (C-28.9), the other rules HELD OPEN. "
  + "DEC-47 bounds discovery more tightly than re-fetch because a stranger's server has no "
  + "relationship with this instance. With this gone the drain fetches from a host that has just "
  + "refused us or asked us to slow down, and the run's log stops carrying D-104's governed split.",
  /* THIS ARM'S DECLARATION WAS CORRECTED AFTER ITS FIRST RUN, AND THE
     CORRECTION IS A FINDING RATHER THAN A REPAIR (PL-3's arm 6 precedent). It
     originally also required "THE HELD REQUEST IS STILL QUEUED" to fail. It did
     not, and the arm was right while the declaration was wrong: with the drain's
     rate rule gone the fetch is still refused ONE LAYER DOWN, by the per-host
     governor inside `governedFetch`, so the row lands back in `requested`
     anyway. WHAT THE DRAIN'S RULE ACTUALLY BUYS is therefore visible exactly
     where the arm does fail: the request is turned away BEFORE the attempt,
     named as pacing, and the run's log carries D-104's GOVERNED split — instead
     of consuming a drain slot, incrementing `attempts`, and telling the run "the
     fetch did not land", which is our own politeness reported as the source
     failing. That distinction is the whole of D-104. */
  [["store", `    if (this.#captureRequestHostHeld(q.host, nowMs))`, `    if (false)`]],
  ["a request to a host in cool-off is HELD by name",
   "and the run's log says so in the record's own vocabulary",
   "EVERY code in the family was DRIVEN out of the plane"],
  ["and the DRAIN turns it away by name",
   "OVER-STRICTNESS ARM: with the member's own agent RECORDED"]);

/* ====================== (6) BOTH PRINCIPALS =============================== */

arm("(6) ATTRIBUTION — A RECORD NAMING ONE OF THE TWO PRINCIPALS (C-28.11). "
  + "DEC-27(b): the record states BOTH — the plane credential whose scope the writes ran under, and "
  + "WHICH LEVEL of the Claude-account cascade paid for the reasoning. With the composer's guard gone "
  + "a capture is MADE for an act the record cannot attribute, and the sentence it states names one "
  + "party where two acted.",
  [["store", `    if (!row || !plane || !claude)`, `    if (false)`]],
  ["a request that can name only ONE principal is refused at the drain BY NAME",
   "and NO fetch was made for an act the record could not attribute",
   "the READ answers with the same refusal rather than a half attribution",
   "EVERY code in the family was DRIVEN out of the plane"],
  ["a request to a host in cool-off is HELD by name"]);

/* ====================== (7) THE PURGE, AGAINST hygiene =================== */

arm("(7a) THE PURGE (D-113), MEASURED AGAINST `hygiene.test.mjs` — THE INSTRUMENT THAT IS SUPPOSED "
  + "TO CATCH THIS. PL-12's merge nearly dropped two tables from `purge` in exactly this way, and the "
  + "failure is SILENT: a whole-store purge reports scope ALL and leaves rows, so the caller believes "
  + "the store is empty. Here the leftover is worse than usual — an outbound queue of addresses this "
  + "instance is about to go and fetch, which is a leftover visible from OUTSIDE the instance.",
  [["store", `        this.sql.exec(\`DELETE FROM capture_requests\`);\n`, ``],
   ["store", `        this.sql.exec(\`DELETE FROM capture_requests WHERE target=?\`, bundleId);\n`, ``]],
  ["tables covered by purge or a stated exemption"],
  [],
  "hygiene.test.mjs");

/* MEASURED AND REPORTED: `hygiene.test.mjs` CANNOT SEE HALF OF THIS DEFECT.
   Arm (7a) had to remove BOTH deletes to make it fail, because the D-113 check
   derives its covered set from `DELETE FROM <table>` anywhere inside the purge
   METHOD — so ONE arm satisfies it and a table purged per-bundle but not
   whole-store reads as covered. That is exactly the silent leftover the check
   exists to prevent, in the half it cannot reach. Arm (7b) is this item's own
   cover for that gap and the finding is delegated rather than fixed here: the
   check is hygiene's, and widening a landed instrument from a neighbouring item
   is the mistake REC-71 exists to correct. */
arm("(7b) THE WHOLE-STORE ARM ALONE, against this item's own suite — the half hygiene cannot see. "
  + "Remove only the whole-store DELETE and a purge that reports scope ALL leaves the outbound queue "
  + "standing.",
  [["store", `        this.sql.exec(\`DELETE FROM capture_requests\`);\n`, ``]],
  ["purge deletes capture_requests in BOTH arms",
   "a WHOLE-STORE purge reports scope ALL and takes the rest",
   "nothing survives it"],
  ["a PER-BUNDLE purge takes the requests asked under THAT question and names the scope"]);

/* ====================== (8) THE NOTIFICATION ============================== */

arm("(8) THE COMPLETION NOTIFICATION. §4 requires the run waiting on a capture to be TOLD, and the "
  + "notification is the EXISTING catalogued kind with a different subscriber rather than an invented "
  + "channel. Unregister the producer and a completed capture is silent: the run waits on something "
  + "that already happened, which is the failure mode a notification exists to prevent.",
  [["store", `      ...this.#conditionsCaptureRequested(viewer, now),\n`, ``]],
  ["a completed request surfaces as an item on the EXISTING catalogued kind"],
  ["a request that can name only ONE principal is refused at the drain BY NAME"]);

/* ====================== the report ======================================= */

console.log(`\n=== ${armsRun} arms run, ${armsWrong} behaved differently from their declaration`);
restoreAll();
console.log("final restore: every file verified by sha256 AND by content");
if (armsWrong) process.exit(1);
