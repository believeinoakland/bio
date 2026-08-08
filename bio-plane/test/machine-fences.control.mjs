/* REC-73 / D-229 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — PL-3's, PL-4's and PL-11's precedent.
 *
 * IT LIVES INSIDE THIS WORKTREE and never in a shared scratchpad, and every
 * restore is verified BY CONTENT as well as BY HASH.
 *
 * ARM (1) IS THE ITEM. PL-11 ran exactly this edit against `aicredential`'s
 * block 8 and all twelve refusals STOPPED FIRING while the suite reported them
 * refused — each one falling through to an ordinary payload complaint behind
 * the fence, and one of them (`MACHINE_CANNOT_DECLARE`) going all the way
 * through. Here the payloads are COMPLETE, so the same edit must make all
 * twelve arms fail NAMING THE MACHINE REFUSAL rather than naming a complaint.
 * That difference is the whole of what this item bought, and this arm is where
 * it is measured rather than asserted.
 *
 * WHAT ARM (1) ALSO PRINTS, because "they all failed" is the generous reading:
 * what each act ANSWERED once the fence was gone. With a complete payload the
 * honest answer is that the act SUCCEEDS — the record moves, a machine
 * concludes a question, publishes a case, resolves an obligation. PL-11 could
 * only show that for one act. This shows it for twelve.
 *
 * Run it:  node test/machine-fences.control.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = {
  checks: ROOT + "checks/bio-checks.mjs",
  suite: ROOT + "test/machine-fences.test.mjs",
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

let armsRun = 0, armsWrong = 0;

function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 900000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 150));
  /* WIDE ON PURPOSE, for PL-11's reason: the content of arm (1) is WHAT EACH
     ACT DID once the fence was gone, and a truncated line would leave the record
     saying "they all failed" without saying what happened instead. */
  const got = [...out.matchAll(/^ {9}got {2}(.+)$/gm)].map((x) => x[1].slice(0, 600));
  return m ? { pass: +m[1], fail: +m[2], named, got, out } : { pass: null, fail: null, named, got, out };
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

function arm(title, edits, mustFail, mustNotFail = [], suite = "machine-fences.test.mjs") {
  armsRun++;
  console.log(`\n=== ${title}`);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite(suite);
    console.log(`  MEASURED (${suite}): ${r.pass} pass, ${r.fail} fail`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    for (const g of r.got) console.log(`      got: ${g}`);
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

console.log("REC-73 / D-229 — negative controls. Whole-tree baseline first, so every arm is a DELTA.");
const base = runSuite("machine-fences.test.mjs");
console.log(`  BASELINE machine-fences.test.mjs: ${base.pass} pass, ${base.fail} fail`);
if (base.fail !== 0) {
  console.log("  ** the tree is not whole; arms below would measure the wrong thing");
  process.exit(1);
}

const TWELVE = ["MACHINE_CANNOT_RELEASE", "MACHINE_CANNOT_CONCLUDE", "MACHINE_CANNOT_REOPEN",
  "MACHINE_CANNOT_PUBLISH", "MACHINE_CANNOT_MOVE_ACTION", "MACHINE_CANNOT_CORRESPOND",
  "MACHINE_CANNOT_DIVIDE", "MACHINE_CANNOT_GROUND", "MACHINE_CANNOT_DECLARE",
  "MACHINE_CANNOT_MOVE_VERSION", "MACHINE_CANNOT_FORWARD", "MACHINE_CANNOT_RESOLVE"];

/* ============ (1) NEUTER THE PREDICATE — ALL TWELVE, BY NAME =============== */

arm("(1) **THE ITEM.** Neuter REC-46's ONE predicate — `isMachineStamp` returns false — and every "
  + "MACHINE_CANNOT_* stops firing for `token:ai` at once. Under PL-11's payloads that edit left the "
  + "twelve answering NO_ACKNOWLEDGMENT / NO_CONCLUSION / NO_REASON / NO_TARGET / NO_SUCH_TASK, and a "
  + "control that read those as 'refused' was reading the complaint BEHIND the fence. Under COMPLETE "
  + "payloads all twelve must fail NAMING THE MACHINE REFUSAL — and what they answer instead is the "
  + "act GOING THROUGH, which is the thing the fences exist to prevent and which nobody had seen for "
  + "eleven of them.",
  [["checks", `export function isMachineStamp(who) {\n  const s = String(who ?? '').trim().toLowerCase();\n  return s !== '' && MACHINE_STAMP_PREFIXES.some((p) => s.startsWith(p));`,
              `export function isMachineStamp(who) {\n  const s = String(who ?? '').trim().toLowerCase();\n  return false && s !== '' && MACHINE_STAMP_PREFIXES.some((p) => s.startsWith(p));`]],
  [...TWELVE.map((c) => `${c} — the machine is refused BY NAME`),
   "every one of them answered with its OWN name"],
  /* WHAT MUST SURVIVE: the walk and the harvest do not depend on this predicate
     at all. If they went red here too, the sweep would be measuring the fence
     rather than the estate, and its result would be worth nothing. */
  ["the harvest found a REAL family",
   "(the walk reached a real corpus",
   "the walk SEES the class it was built from",
   "the identity refusals that shadow something and that NO suite pins at all"]);

/* ============ (2) THE SENTINEL, ON ITS OWN ================================ */

arm("(2) **THE REGRESSION SENTINEL, ISOLATED.** `MACHINE_CANNOT_DECLARE` is the one act PL-11 "
  + "measured going ALL THE WAY THROUGH — a machine SET THE GROUP'S REQUIRED EVIDENTIARY STRENGTH, "
  + "because its payload was already complete and there was no complaint behind the fence to catch it. "
  + "So it is the act whose arm must fail FIRST and LOUDEST under any weakening, and it is named on "
  + "its own here rather than left inside arm (1)'s list. Note the second assertion it must take down: "
  + "the bar is READ BACK and found DECLARED — the machine did not merely get past a refusal, it "
  + "changed what the group requires of its own evidence.",
  [["checks", `export function isMachineIdentity(who) {`,
              `export function isMachineIdentity(who) {\n  if (String(who ?? '').startsWith('token:')) return false;`]],
  ["MACHINE_CANNOT_DECLARE — the machine is refused BY NAME",
   "and NOTHING was declared by the machine's call"],
  ["the harvest found a REAL family",
   "the walk SEES the class it was built from"]);

/* ============ (3) THE SWEEP'S OWN TEETH ================================== */

arm("(3) **THE SWEEP MUST BE ABLE TO GO BLIND, AND SAY SO.** Make the identity predicate match "
  + "nothing and the walk finds no identity-flavoured refusals anywhere. The corpus floor catches it "
  + "as a DELTA rather than reporting a clean estate — which is the failure a ceiling cannot see "
  + "(REC-70's lesson, arriving on the floor side). Without this arm the sweep could quietly stop "
  + "reaching the plane and read as good news.",
  [["suite", `  const IDENTITY = /isMachineIdentity|isMachineStamp|isAdminMember|#isAdmin|\\bactor\\b|\\bauthor\\b|\\bwho\\b|\\bviewer\\b|principal|assignee|owner/;`,
              `  const IDENTITY = /\\bTHIS_MATCHES_NOTHING_AT_ALL\\b/;`]],
  ["(the walk reached a real corpus",
   "the walk SEES the class it was built from"],
  [...TWELVE.map((c) => `${c} — the machine is refused BY NAME`)]);

/* ============ (4) THE HARVEST IS A RATCHET, NOT A LABEL =================== */

arm("(4) **A THIRTEENTH FENCE MUST NOT ARRIVE UNMEASURED.** Drop one act out of the driven set — "
  + "`MACHINE_CANNOT_GROUND` stops registering — and the completeness arm must name it. A walk that "
  + "graded 55 of 156 ops once read as a complete sweep in this repository; the guard against that is "
  + "comparing what was DRIVEN against what the plane MINTS, and this is the arm proving the "
  + "comparison is live rather than decorative.",
  [["suite", `  DRIVEN.push({ code, payload, machineAnswer });`,
              `  if (code !== "MACHINE_CANNOT_GROUND") DRIVEN.push({ code, payload, machineAnswer });`]],
  ["EVERY MACHINE_CANNOT_* the plane can mint was driven under a COMPLETE payload",
   "(twelve acts were actually driven"],
  ["the walk SEES the class it was built from",
   "MACHINE_CANNOT_GROUND — the machine is refused BY NAME"]);

/* ============ (5) OVER-STRICTNESS — THESE MUST STAY GREEN ================= */

/* NOT an `arm()`, because it asserts the ABSENCE of a failure and `arm()`
   requires one. A fence that refuses correct work is a defect IN THE FENCE, and
   in this suite the over-strictness arm is not a separate block: it is the
   SECOND half of every one of the twelve pins, because the payload is only
   shown to be complete by a member succeeding with it. So the whole tree is
   re-measured and the twelve member arms are named. */
console.log("\n=== (5) OVER-STRICTNESS, AND IT IS BUILT INTO EVERY PIN. Each of the twelve payloads is "
  + "driven a SECOND time by a signed-in member and must SUCCEED — that is what makes it complete "
  + "rather than merely valid, and it is what would catch a fence that had started refusing correct "
  + "work. Re-measured on the WHOLE tree rather than under an edit.");
{
  armsRun++;
  const r = runSuite("machine-fences.test.mjs");
  const want = [
    "and the SAME payload releases for a signed-in member",
    "and the SAME payload concludes for a signed-in member",
    "and the SAME payload reopens for a signed-in member",
    "and the SAME payload publishes at EDITION 1 for a signed-in member",
    "and the SAME payload moves the action for a signed-in member",
    "and the SAME payload records the entry for a signed-in member",
    "and the SAME payload divides for a signed-in member",
    "and the SAME payload groups for a signed-in member",
    "and the SAME payload sets the group's required strength for a signed-in member",
    "and the SAME payload accepts the reading for a signed-in member",
    "and the SAME payload forwards it for the signed-in assignee",
    "and the SAME payload resolves it for the signed-in assignee",
  ];
  console.log(`  MEASURED: ${r.pass} pass, ${r.fail} fail`);
  const broken = want.filter((w) => r.named.some((n) => n.includes(w)));
  if (r.fail !== 0 || broken.length) {
    console.log(`  ** WRONG: the fence refuses correct work: ${JSON.stringify(broken)}`);
    armsWrong++;
  } else {
    console.log(`  all ${want.length} member arms GREEN — every one of the twelve payloads is one the plane ACCEPTS`);
  }
}

/* ====================== the report ======================================= */

console.log(`\n=== ${armsRun} arms run, ${armsWrong} behaved differently from their declaration`);
restoreAll();
console.log("final restore: every file verified by sha256 AND by content");
if (armsWrong) process.exit(1);
