/* UI-64 — THE NEGATIVE-CONTROL DRIVER FOR `conclude-nofalsifier.test.mjs`.
 *
 *     node civicos-ui/test/conclude-nofalsifier.control.mjs
 *
 * NOT A SUITE. Deliberately not named `*.test.mjs`: `civicos-ui/test/run.mjs`
 * discovers by filename and would run it, count it, and report a harness that
 * asserts nothing about the product.
 *
 * WHAT IT DOES. Each arm is ONE contiguous edit in `civicos-ui/app.html`,
 * applied ALONE with every other arm held open, the suite re-run, and the file
 * restored from a UNIQUELY-NAMED per-arm pristine copy — verified by sha256 AND
 * by `cmp`, with a byte count printed and a minimum guarded. `git checkout --`
 * is never used: it restores to HEAD rather than to what was there, and it has
 * silently discarded a session's own uncommitted work twice in this project.
 *
 * AN ARM THAT DID NOT ARM IS A FINDING, so every patch asserts it matched
 * EXACTLY ONCE before the suite is run. An arm whose anchor occurs twice, or
 * zero times, is reported as `ARM DID NOT ARM` and never scored.
 *
 * THE BASELINE ROW IS RUN FIRST AND IS NOT DECORATION. A harness whose first
 * run reports the same thing for every arm INCLUDING the baseline cannot
 * distinguish all-arms-broken from all-arms-working; only the baseline row
 * tells them apart.
 *
 * DECLARED BEFORE ARMING — each arm names what MUST fail and what MUST NOT.
 * ====================================================================
 * RESULTS, RUN 2026-09-17, are filled in beside each arm below.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: this driver calls `process.exit`
   on a refused baseline, and a writer's own exit must not discard the writer's own output —
   `run.mjs` and `check-mock-envelope.mjs` spawn with {stdio:"pipe"}, where the loss happens.
   Caught by `stdio-census.test.mjs` ARM B1 rather than by anybody noticing. */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const APP = fileURLToPath(new URL("../app.html", import.meta.url));
const SUITE = fileURLToPath(new URL("./conclude-nofalsifier.test.mjs", import.meta.url));
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* ==================================================================== */
const ARMS = [
  {
    id: "A-door-removed",
    what: "THE CONTROL REMOVED — the commit slot stops offering the door, so the member cannot reach the override at all. This is the row's first named arm: control removed -> the member cannot reach the override and the suite FAILS BY NAME.",
    /* CORRECTED AFTER THE FIRST RUN, AND THE CORRECTION IS THE ARM'S WHOLE
       VALUE. Declared first as also failing "THE OVERRIDE IS TAKEN" and "THE
       DOCUMENT CARRIES WHO OVERRODE", it came back with the whole of sections 4
       and 5 GREEN while the member could not reach the override at all —
       because the suite was calling `concludeNoFalsifier(true)` DIRECTLY. That
       is asserting against a handler, which is exactly what the row forbids.
       The suite now pulls the handler OUT OF THE RENDERED MARKUP and runs it,
       so removing the door removes the act, and the declaration below is what
       the arm really does. THE INSTRUMENT WAS WRONG AND THE ARM FOUND IT. */
    mustFail: ["THE DOOR IS OFFERED", "THE OVERRIDE IS TAKEN", "THE DOCUMENT CARRIES WHO OVERRODE"],
    mustPass: ["ONCE A FALSIFIER IS STATED THE ADDED PATH IS NOWHERE ON THE PAGE",
               "THE ADDED PATH CLOSES FOR THEM TOO"],
    from: "${actRefusalHtml(pf.refusal)}${concludeDoorHtml(pf.refusal)}${concludeStandingHtml()}",
    to:   "${actRefusalHtml(pf.refusal)}${concludeStandingHtml()}",
  },
  {
    id: "B-guard-removed",
    what: "THE LIAR'S CHECKBOX, AND IT IS THE ARM THAT IS THE RULING. The act's guard goes, so `concludeNoFalsifier(true)` sets the flag whenever it is called — the override becomes reachable WITHOUT the plane having refused, which is a member accepting something they were never shown. It is the cheapest green available for this row and it must go RED.",
    mustFail: ["CALLING THE OVERRIDE DIRECTLY, WITH THE PLANE REFUSING SOMETHING ELSE, DOES NOTHING"],
    mustPass: ["THE CONDITION IS SURFACED", "THE DOCUMENT CARRIES WHO OVERRODE"],
    from: '    const r = (CONCL.pf && !CONCL.pf.clear) ? CONCL.pf.refusal : null;\n    if(!r || r.reason !== "NO_FALSIFIER") return;\n',
    to:   '    const r = (CONCL.pf && !CONCL.pf.clear) ? CONCL.pf.refusal : null;\n',
  },
  {
    id: "C-shown-once-then-hidden",
    what: "SHOWN ONCE AND THEN HIDDEN — the standing block keeps the button and drops the record's own sentence, so the member reads the condition, takes the door, and commits over a condition that has left the screen. THIS IS THE ARM THE ROW CALLS THE ONE THAT MATTERS: reachable but SILENT. Every other clause of this item still holds under it.",
    mustFail: ["THE CONDITION IS STILL ON SCREEN AT THE MOMENT OF COMMIT"],
    mustPass: ["THE OVERRIDE IS TAKEN", "THE DOCUMENT CARRIES WHO OVERRODE",
               "THE RECEIPT NAMES WHO ACCEPTED THE ABSENCE AND WHEN"],
    from: '       + actRefusalHtml(CONCL.noFalsSaid)\n',
    to:   "",
  },
  {
    id: "D-receipt-forgets",
    what: "THE RECORD REMEMBERS AND THE MEMBER IS NOT TOLD — the receipt drops who and when. The DOCUMENT assertions stay green under this arm, which is the whole reason the surface half has its own arm: a record that is right about an act the member was never shown the outcome of is still a surface defect.",
    /* THE SECOND DECLARATION CAME BACK WRONG AND IT FOUND A COSTS-NOTHING
       ASSERTION. "the receipt's who and when are the DOCUMENT'S" was written as
       `rc.includes(<the document's override timestamp>)` and PASSED under this
       arm, which deletes the override cell from the receipt outright — because
       `falsifier_override_at` and the receipt's ordinary `at` are the SAME
       VALUE, so the check was being satisfied by a line that says nothing about
       the override. It now reads the `data-nofals="receipt"` cell and nothing
       else, and both declarations hold. */
    mustFail: ["THE RECEIPT NAMES WHO ACCEPTED THE ABSENCE AND WHEN",
               "the receipt's who and when are the DOCUMENT'S who and when"],
    mustPass: ["THE DOCUMENT CARRIES WHO OVERRODE", "THE DOCUMENT CARRIES WHEN"],
    from: '      ${r.falsifier_override && r.falsifier_override.by\n        ? `<div data-nofals="receipt">',
    to:   '      ${false && r.falsifier_override && r.falsifier_override.by\n        ? `<div data-nofals="receipt">',
  },
  {
    id: "E-wire-drops-it",
    what: "REACHABLE, VISIBLE, AND INERT — every word of the surface is right and the parameter never leaves the browser. The member reads the condition, takes the door, and the record stores nothing. This is REC-117's arm-B lesson from the other side: only asking the RECORD what it now holds can tell this apart from a working override.",
    mustFail: ["the pre-flight now carries the override", "THE DOCUMENT CARRIES WHO OVERRODE"],
    mustPass: ["THE CONDITION IS SURFACED", "THE DOOR IS OFFERED"],
    from: '  if(CONCL.noFals) p.no_falsifier = "1";\n',
    to:   "",
  },
];

/* OVER-STRICTNESS IS ARM F AND IT TAKES NO EDIT, because it runs on every green
   pass rather than only under a control: sections 6 and 6b of the suite drive a
   member who states a falsifier BY TYPING and a member who states one BY
   POINTING AT LEGS with an empty textarea, and require the path this item added
   to be absent from both — not offered, not standing, not disabled — with no
   `no_falsifier` anywhere on their wire and no override pair in their
   documents. The pointing case is the one an unanticipated spelling would break:
   a door keyed on *the textarea is blank* would still be standing open there. */

/* ==================================================================== */
function runSuite() {
  const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8", timeout: 600000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = /conclude-nofalsifier: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((x) => x[1]);
  /* A RUN THAT ENDS WITHOUT ITS OWN COMPLETION LINE DID NOT FINISH, whatever
     the exit status said. Reported as -1 rather than 0, because a missing tally
     read as zero is the number that looks like health. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, failed, code: r.status, out };
}

const results = [];
console.log("UI-64 NEGATIVE CONTROL — each arm ALONE, restored and verified by sha256 AND cmp\n");

const PRISTINE0 = APP + ".ui64-baseline.pristine";
copyFileSync(APP, PRISTINE0);
const SHA0 = sha(APP);
const BYTES0 = readFileSync(APP).length;
console.log(`BASELINE app.html  sha256 ${SHA0}  ${BYTES0} bytes`);
if (BYTES0 < 500000) { console.error(`REFUSING TO RUN: app.html is ${BYTES0} bytes, far below the floor — a control over a truncated file measures nothing.`); process.exit(2); }

const base = runSuite();
console.log(`  BASELINE RUN: ${base.pass} pass, ${base.fail} fail  (exit ${base.code})`);
if (base.fail !== 0 || base.pass <= 0) {
  console.error("REFUSING TO RUN THE ARMS: the baseline is not green, so no arm's result would mean anything.");
  console.error(base.out.slice(-3000));
  unlinkSync(PRISTINE0);
  process.exit(2);
}

for (const arm of ARMS) {
  const PRISTINE = `${APP}.ui64-${arm.id}.pristine`;
  copyFileSync(APP, PRISTINE);
  const before = sha(APP);
  const src = readFileSync(APP, "utf8");

  const hits = src.split(arm.from).length - 1;
  if (hits !== 1) {
    console.log(`\n--- ${arm.id} --- ARM DID NOT ARM: its anchor occurs ${hits} time(s), not once. NOT SCORED.`);
    results.push({ arm, armed: false, hits });
    unlinkSync(PRISTINE);
    continue;
  }
  writeFileSync(APP, src.replace(arm.from, arm.to));
  const armedSha = sha(APP);
  if (armedSha === before) {
    console.log(`\n--- ${arm.id} --- ARM DID NOT ARM: the file is byte-identical after the patch. NOT SCORED.`);
    results.push({ arm, armed: false, hits });
    copyFileSync(PRISTINE, APP); unlinkSync(PRISTINE);
    continue;
  }

  console.log(`\n--- ${arm.id} ---`);
  console.log(`  ${arm.what}`);
  const r = runSuite();
  console.log(`  RUN: ${r.pass} pass, ${r.fail} fail  (exit ${r.code})`);
  for (const f of r.failed) console.log(`      FAILED: ${f}`);

  /* RESTORE, AND PROVE IT — by sha256 AND by cmp, against this arm's own copy. */
  copyFileSync(PRISTINE, APP);
  const after = sha(APP);
  const bytes = readFileSync(APP).length;
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", APP, PRISTINE]); } catch (_) { cmpOk = false; }
  const restored = after === before && cmpOk && bytes === BYTES0;
  console.log(`  restored byte-identically: ${restored ? "YES" : "NO"}  (sha256 ${after}, cmp ${cmpOk ? "same" : "DIFFERS"}, ${bytes} bytes)`);
  unlinkSync(PRISTINE);

  const declaredFails = arm.mustFail.filter((n) => r.failed.some((f) => f.includes(n)));
  const brokePass = arm.mustPass.filter((n) => r.failed.some((f) => f.includes(n)));
  const mustFailOk = declaredFails.length === arm.mustFail.length;
  const mustPassOk = brokePass.length === 0;
  console.log(`  DECLARED must-FAIL: ${declaredFails.length}/${arm.mustFail.length} ${mustFailOk ? "as declared" : `— MISSING ${JSON.stringify(arm.mustFail.filter((n) => !declaredFails.includes(n)))}`}`);
  console.log(`  DECLARED must-PASS: ${mustPassOk ? "held" : `BROKEN — ${JSON.stringify(brokePass)}`}`);
  results.push({ arm, armed: true, r, restored, mustFailOk, mustPassOk });
}

copyFileSync(PRISTINE0, APP);
const finalSha = sha(APP);
let finalCmp = true;
try { execFileSync("cmp", ["-s", APP, PRISTINE0]); } catch (_) { finalCmp = false; }
unlinkSync(PRISTINE0);
if (existsSync(PRISTINE0)) console.error("  WARNING: the baseline pristine copy is still on disk");

console.log("\n==================== SUMMARY ====================");
console.log(`baseline: ${base.pass} pass, ${base.fail} fail`);
for (const x of results) {
  if (!x.armed) { console.log(`  ${x.arm.id}: ARM DID NOT ARM (${x.hits} anchor hit(s)) — a finding, not a pass`); continue; }
  console.log(`  ${x.arm.id}: ${x.r.pass} pass, ${x.r.fail} fail · must-fail ${x.mustFailOk ? "ok" : "MISSED"} · must-pass ${x.mustPassOk ? "ok" : "BROKEN"} · restored ${x.restored ? "YES" : "NO"}`);
}
console.log(`final app.html sha256 ${finalSha} — ${finalSha === SHA0 && finalCmp ? "IDENTICAL to the baseline" : "*** NOT RESTORED ***"}`);

const bad = results.filter((x) => !x.armed || !x.restored || !x.mustFailOk || !x.mustPassOk);
if (bad.length || finalSha !== SHA0 || !finalCmp) {
  console.log(`\nCONTROL NOT CLEAN: ${bad.length} arm(s) did not behave as declared.`);
  process.exitCode = 1;
} else {
  console.log(`\nCONTROL CLEAN: ${results.length} arms, each broken alone, each failing exactly where declared and nowhere it was declared not to, each restored byte-identically.`);
}
