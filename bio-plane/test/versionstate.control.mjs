/* PL-2 / IS-2 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — `check-refusal-codes.mjs`'s `.control.mjs`
 * precedent, and VF-2's own reason for the same split.
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
 * THE SHAPE OF THE THREE-LAYER ARM, and it is the item. VERIFICATION rule 3a: a
 * rule enforced in N places carries an assertion at EACH place. The fence that
 * stops a machine credential settling a reading lives in THREE layers —
 *
 *    1. the CREDENTIAL STAMP  (index.mjs: a machine is `token:<class>`, and a
 *       caller-supplied `author` is overwritten rather than honoured)
 *    2. the ENDPOINT          (index.mjs NEEDS: the op requires `contribute`)
 *    3. the TRANSITION        (store.mjs: `isMachineIdentity` refuses by shape)
 *
 * — and each ABSORBS the others when it is whole. An `ai` credential refused at
 * the credential layer never reaches the transition refusal, so a control that
 * broke all three at once would prove nothing about any of them. Each layer is
 * therefore broken ALONE, WITH THE OTHER TWO HELD OPEN, and THAT layer's own
 * assertion is required to fail.
 *
 * AND THE COUNT OF IMPLEMENTATIONS IS PINNED TOO, because IS-6's C-22.4 control
 * left its suite GREEN AT 98/98: the rule it broke had TWO implementations, one
 * inlined in a second function, so removing either left the other absorbing the
 * control and NO behavioural arm could see it. Arm (2) adds a second
 * implementation and requires the pin — and only the pin — to fail.
 *
 * Run it:  node test/versionstate.control.mjs
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
  /* THE SUITE ITSELF IS A RESTORABLE FILE, added 2026-08-09 for arm (9). An arm
     that removes an assertion's SUBJECT proves the subject matters; an arm that
     removes the CALL THAT DRIVES a refusal proves the FLOOR matters, and that
     one has to edit the suite. It is under the same sha256-and-content restore
     discipline as the three sources, because a harness that can rewrite the
     suite and not put it back is worse than no harness. */
  suite: ROOT + "test/versionstate.test.mjs",
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

let armsRun = 0, armsWrong = 0;

/* The suite's own report, parsed from its `N pass, M fail` line. A suite whose
   count cannot be read is reported as UNKNOWN rather than as zero: an unreadable
   number and no assertions are different claims (D-93's lesson, and the battery
   runner's own rule). */
function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 300000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 96));
  return m ? { pass: +m[1], fail: +m[2], named, out } : { pass: null, fail: null, named, out };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 60)}…' occurs ${n} times in ${key}. `
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

/* An arm states which assertions MUST fail, by a fragment of their label. An arm
   that fails "somewhere" proves the suite is sensitive to something; an arm that
   fails AT ITS OWN LAYER proves the layer is doing the work. */
function arm(title, edits, mustFail, mustNotFail = []) {
  armsRun++;
  console.log(`\n=== ${title}`);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite("versionstate.test.mjs");
    console.log(`  MEASURED: ${r.pass} pass, ${r.fail} fail`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    for (const frag of mustFail)
      if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must be ABSORBED there`); wrong = true; }
    if (!r.fail) { console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing."); wrong = true; }
    if (wrong) armsWrong++;
  } finally {
    restoreAll();
    console.log("  restored: every file verified by sha256 AND by content");
  }
}

console.log("PL-2 / IS-2 — negative controls. Whole-tree baseline first, so every arm is a DELTA.");
const base = runSuite("versionstate.test.mjs");
console.log(`  BASELINE: ${base.pass} pass, ${base.fail} fail`);
if (base.fail !== 0) { console.log("  ** the tree is not whole; arms below would measure the wrong thing"); process.exit(1); }

/* ------------------------------------------------------------------ (1a) */
/* CORRECTED WHILE RUNNING, and the first draft is kept here because the
   correction is the finding. The first (1a) DELETED the stamp outright, which
   also unstamps every MEMBER session — so the suite fell over in fourteen places
   and none of them was about impersonation. A control that breaks everything
   proves nothing about the one thing it names. The arm below is surgical: the
   stamp still fires for a signed-in member and STOPS firing for a machine
   credential, which is precisely the impersonation layer 1 exists to prevent. */
arm("(1a) LAYER 1 — THE CREDENTIAL STAMP, with layers 2 and 3 HELD OPEN. "
  + "Let the stamp fire for member sessions and NOT for machine credentials: a machine's "
  + "caller-supplied `author: ruth` is then HONOURED, the store sees a perfectly good member name, and "
  + "the act lands under a FALSE ATTRIBUTION. Layer 3's refusal is still there and cannot see it — "
  + "which is the point.",
  /* ANCHOR CORRECTED 2026-08-09, AND THE STALENESS IS ITSELF A FINDING. This arm
     was written against `|| VERSION_ACTIONS.includes(op)\n || op ===
     "provenancechain")` — two adjacent lines in the author-stamp condition. PL-3
     landed `|| op === "suggest"` BETWEEN them, so on today's `main` the anchor
     occurs ZERO times and THE ITEM'S HEADLINE CONTROL COULD NOT ARM AT ALL. It
     did not fail quietly: the harness's occurs-exactly-once guard threw and named
     the count, which is the one reason this was visible rather than reported as a
     green run. **VF-5 requires CONDUCT to re-run this three-layer control on the
     integrated build**, so an unarmable arm here is a gate that would have passed
     over nothing. Re-anchored on the SINGLE line it actually edits, which cannot
     be split by a neighbour inserting a clause after it; the occurs-once guard
     still holds it, because `VERSION_ACTIONS.includes(op)` at this indent appears
     once in the stamp condition and once in the viewer condition several hundred
     lines up — so the anchor keeps the `if (` line above it to stay unique. */
  [["index", `        || DECLARATION_ACTIONS.includes(op) || STRUCTURE_ACTIONS.includes(op)\n        || VERSION_ACTIONS.includes(op)`,
             `        || DECLARATION_ACTIONS.includes(op) || STRUCTURE_ACTIONS.includes(op)\n        || (VERSION_ACTIONS.includes(op) && viaSession)`]],
  ["EVERY ONE OF THE SIX refuses a machine credential",
   "caller-supplied `author` was OVERWRITTEN"]);

/* ------------------------------------------------------------------ (1b) */
arm("(1b) LAYER 2 — THE ENDPOINT CAPABILITY, with layers 1 and 3 HELD OPEN. "
  + "Delete the six `contribute` rows from NEEDS: a signed-in member holding no `contribute` then "
  + "reaches the store, which sees a perfectly good member name and moves the reading. Layers 1 and 3 "
  + "are untouched and neither has anything to say about a capability.",
  [["index", `  versionaccept:    "contribute",
  versionreject:    "contribute",
  versionconsider:  "contribute",
  versionrevert:    "contribute",
  versioncurrent:   "contribute",
  versionhide:      "contribute",`, ``]],
  ["LAYER 2"]);

/* ------------------------------------------------------------------ (1c) */
arm("(1c) LAYER 3 — THE TRANSITION, with layers 1 and 2 HELD OPEN. "
  + "Disable the store's one machine-identity guard: the credential is still honestly stamped "
  + "`token:member` and still holds no capability question to answer, so nothing else stops it.",
  [["store", `    if (!who || isMachineIdentity(who))\n      return refuse("MACHINE_CANNOT_MOVE_VERSION",`,
             `    if (false)\n      return refuse("MACHINE_CANNOT_MOVE_VERSION",`]],
  ["EVERY ONE OF THE SIX refuses a machine credential"]);

/* ------------------------------------------------------------------- (2) */
arm("(2) THE IMPLEMENTATION-COUNT PIN — a SECOND implementation of the machine-identity rule, inlined "
  + "in one entry point. EVERY BEHAVIOURAL ARM STILL PASSES, because the second copy does the first "
  + "one's job. This is IS-6's C-22.4 defect reproduced on purpose, and ONLY the count pin can see it.",
  [["store", `  versionAccept(a)   { return this.#moveVersionState("accept", a); }`,
             `  versionAccept(a)   { if (isMachineIdentity(String(a?.author ?? ""))) return { ok: false, reason: "MACHINE_CANNOT_MOVE_VERSION", code: "MACHINE_CANNOT_MOVE_VERSION", check: "C-25.24" };\n    return this.#moveVersionState("accept", a); }`]],
  ["ONE IMPLEMENTATION EACH"],
  /* HELD OPEN AND REQUIRED TO STAY GREEN: the behavioural arm sees nothing,
     which is the whole finding. */
  ["EVERY ONE OF THE SIX refuses a machine credential"]);

/* ------------------------------------------------------------------- (3) */
arm("(3) DROP THE REASON REQUIREMENT AT THE OP. A reading is turned down with nothing recorded — "
  + "D-214's anti-omission instrument, worthless without the reason.",
  [["store", `    if (versionNeedsReason(to) && !why)`, `    if (false && versionNeedsReason(to) && !why)`]],
  ["LAYER 1 (the op)"]);

/* ------------------------------------------------------------------ (3b) */
arm("(3b) DROP THE CATALOG'S HALF INSTEAD. The op still refuses, so only the arm that hand-authors a "
  + "document ALREADY claiming a reason-bearing state can see it — which is why one layer could not "
  + "carry this rule and why rule 3a asks for an assertion at each.",
  [["checks", `    if (versionNeedsReason(v.state)) {`, `    if (false) {`]],
  ["LAYER 2 (the catalog), REACHED ALONE"],
  ["LAYER 1 (the op)"]);

/* ------------------------------------------------------------------- (4) */
arm("(4) MOVE THE FENCE OUT OF THE CODE. Delete the store's machine-identity refusal entirely and leave "
  + "the act's published LABEL saying what a machine may not do. EVERY FENCE IS CODE, NEVER A LINE IN A "
  + "SKILL OR A LABEL — and the source assertion is what says so.",
  [["store", `      return refuse("MACHINE_CANNOT_MOVE_VERSION",`, `      return refuse("VERSION_ACT_NO_VERSION",`]],
  ["FENCE LAYER 3", "EVERY ONE OF THE SIX refuses a machine credential"]);

/* ------------------------------------------------------------------- (5) */
arm("(5) BREAK THE TRANSITIVE CYCLE CHECK AT ACCEPT. A reading whose leg names a question that already "
  + "rests on this one is accepted, and the answer becomes its own support.",
  [["store", `      cycle = inqTargets.length ? this.#basisCyclePath(target, inqTargets) : null;`,
             `      cycle = null;`]],
  ["ACCEPTING IT IS REFUSED"]);

/* ------------------------------------------------------------------ (5b) */
arm("(5b) WRITE A SECOND CYCLE WALK rather than calling the existing one. The behaviour is identical "
  + "TODAY, which is exactly the condition under which a second walk drifts from the first — PL-1 "
  + "recorded this edge rather than half-building it for this reason.",
  [["store", `  #basisCyclePath(bundleId, targets) {`,
             `  #basisCyclePathTwo(bundleId, targets) { return this.#basisCyclePath(bundleId, targets); }\n  #basisCyclePath(bundleId, targets) {`]],
  /* CORRECTED WHILE RUNNING: the pin that fires is the CALL-SITE count, not the
     DEFINITION count — a second walk under a second NAME leaves
     `#basisCyclePath(bundleId, targets) {` at one while the call count moves.
     That is the pin doing the right thing and the control's first claim being
     wrong about which arm would say so. */
  ["THE CYCLE CHECK CALLS THE EXISTING WALK"]);

/* ------------------------------------------------------------------- (6) */
/* THE DEFECT ITSELF, RE-ARMED — and this arm is different in kind from the eight
   above it, because it puts the tree back into the state `main` was actually in
   until 2026-08-09 rather than into a state nobody ever shipped. A control that
   can restore a real past defect is the strongest evidence that the correction
   corrected something: if this arm came back green, the C-25.32 rows would be
   assertions about a distinction nobody could ever have got wrong.
   THE HELD-OPEN HALF IS THE POINT. The ABSENT-reason arms must STAY GREEN while
   this one is armed — under the collapsed code a missing reason still answers
   C-25.26 correctly, and it always did. Only the PRESENT-but-unstorable reason
   was being misdescribed, and requiring the absent arms to stay green is what
   distinguishes "these two conditions are separable" from "the reason guard is
   broken in some way". */
arm("(7) COLLAPSE THE TWO REASON CONDITIONS BACK INTO ONE, which is what `main` did until this turn: "
  + "answer a reason that ARRIVED and cannot be stored with VERSION_NO_REASON, whose canned "
  + "translation tells the member it is \"worth nothing without the reason\" — about a reason they "
  + "supplied, and on three acts that require no reason at all.",
  [["store", `      return refuse("VERSION_REASON_MALFORMED",`, `      return refuse("VERSION_NO_REASON",`]],
  ["A REASON THE MEMBER GAVE AND THE RECORD CANNOT STORE",
   "AND ON THE THREE ACTS THAT REQUIRE NO REASON AT ALL",
   "THE DRIVEN SET EQUALS THE REGISTRY"],
  /* HELD OPEN AND REQUIRED TO STAY GREEN — the half that was always right. */
  ["A REASON THAT IS PRESENT AND EMPTY IS REFUSED EXACTLY AS AN ABSENT ONE",
   "LAYER 1 (the op)"]);

/* ------------------------------------------------------------------- (7) */
/* OVER-STRICTNESS, ARMED RATHER THAN ASSUMED. *"A fence tighter than its rule is
   not a safer fence — it is an undeclared interface change wearing the costume
   of caution."* The over-strictness assertion added with C-25.32 claims that a
   500-character reason carrying an apostrophe LANDS; an assertion that correct
   work passes is worth nothing unless something can make it fail. Widening the
   grammar to refuse an apostrophe is the smallest edit that does. */
arm("(8) TIGHTEN THE FENCE PAST ITS RULE — refuse an apostrophe as well. Every refusal arm above stays "
  + "green (a tighter fence still refuses everything it refused before), and ONLY the over-strictness "
  + "assertion can see it: a member's ordinary prose stops being storable.",
  /* ANCHORED ON THE REFUSAL BENEATH IT, not on the guard alone: the identical
     grammar test occurs THREE times in `store.mjs` (#moveAction, #divide and
     here), so the guard line by itself would have armed three sites and the
     harness would have refused to arm blind — which it did, on the first run of
     this arm. */
  [["store", `    if (why.length > Store.RELEASE_ACK_MAX || /["\\\\\\r\\n]/.test(why))\n      return refuse("VERSION_REASON_MALFORMED",`,
             `    if (why.length > Store.RELEASE_ACK_MAX || /["'\\\\\\r\\n]/.test(why))\n      return refuse("VERSION_REASON_MALFORMED",`]],
  ["OVER-STRICTNESS: a reason of EXACTLY the 500-character bound"],
  ["A REASON THE MEMBER GAVE AND THE RECORD CANNOT STORE"]);

/* ------------------------------------------------------------------- (8) */
/* THE FLOOR, NOT THE CEILING. Block 11 requires the DRIVEN set to EQUAL the
   registry, so a code that stops being reachable through the control plane fails
   there — *a ceiling passes trivially over nothing*. Removing the one call that
   drives C-25.32 is the arm that proves the floor is load-bearing rather than
   decorative, and it is the shape that would catch the next row somebody adds to
   the catalog and never wires to a caller. */
arm("(9) STOP DRIVING C-25.32 OUT OF THE PLANE — leave the row in the registry and remove the call "
  + "that provokes it. The FLOOR must fail: a refusal nobody can reach is a rule nobody is enforcing, "
  + "and a set-equality assertion that only checked the ceiling would report this as fine.",
  [["suite", `  drive(await act("reject", { version: "the audit alone",
                              body: { reason: 'the audit says "it never cleared"' } }));`, ``]],
  ["THE DRIVEN SET EQUALS THE REGISTRY"]);

console.log(`\n${armsRun} arms run, ${armsWrong} did not behave as the control claims.`);
restoreAll();
console.log("final restore: every file verified by sha256 AND by content");
if (armsWrong) process.exit(1);
