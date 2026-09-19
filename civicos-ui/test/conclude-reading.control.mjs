/* UI-65 — THE NEGATIVE-CONTROL DRIVER FOR `conclude-reading.test.mjs`.
 *
 *     node civicos-ui/test/conclude-reading.control.mjs
 *
 * Each arm breaks ONE thing in `civicos-ui/app.html`, ALONE, with every other
 * arm held open; runs the suite; restores the file from that arm's own
 * uniquely-named pristine copy and PROVES the restore by sha256 AND `cmp` and
 * a byte count against a floor. Each arm DECLARES, before it is armed, what
 * MUST fail and what MUST NOT, and the summary scores both halves. An arm
 * whose anchor does not occur exactly once DID NOT ARM, and that is reported
 * as a finding, never as a pass. The driver is `conclude-nofalsifier.control.mjs`'s
 * (UI-64) with the arms replaced — one mechanism, so a lesson either learns
 * reaches both.
 *
 * THE BRIEF'S TWO ARMS ARE A AND B. A: send no version — the member picks, and
 * the commit is refused NO_CLAIM, rendered as the plane's own sentence (the
 * DEC-8 sweep, which must HOLD under the arm, is what makes "the plane's own"
 * a measurement). B: prefill the picker — the liar the row names.
 *
 * OVER-STRICTNESS TAKES NO EDIT: section 1 has the member pick the SECOND of
 * two adoptable readings, the one a first-in-the-list default would never
 * reach, and section 4 concludes for a project whose stood-on reading is not
 * the question's last. Correct work in a spelling the author did not lead with
 * must pass on every green run.
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
const SUITE = fileURLToPath(new URL("./conclude-reading.test.mjs", import.meta.url));
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* ==================================================================== */
const ARMS = [
  {
    id: "A-no-version",
    what: "SEND NO VERSION — the member picks a reading, and the surface never puts it on the wire. The plane refuses the commit NO_CLAIM and the member reads the plane's own sentence where the adoption should be. Everything the member SEES before the commit is still right, which is why only the wire and the record can catch it.",
    mustFail: ["THE COMMIT WAS ACCEPTED", "NO NO_CLAIM WAS RENDERED", "the commit named the PICKED reading on the wire",
               "THE RECORD ADOPTED THE PICKED READING", "THE CONCLUSION ADOPTS THE PICKED READING'S CLAIM WORD FOR WORD"],
    mustPass: ["NOTHING IS PREFILLED: no reading radio is checked", "THE CLAIM IS SHOWN BEFORE THE COMMIT, word for word — the picked reading's",
               "THE MEMBER SEES NO_CLAIM RENDERED AS THE PLANE'S OWN SENTENCE", "NOT ONE refusal sentence rendered originated in the surface"],
    from: "  if(CONCL.version) p.version = CONCL.version;\n",
    to:   "",
  },
  {
    id: "B-prefilled-picker",
    what: "THE LIAR THE ROW NAMES — the picker arrives with the first adoptable reading already picked. The member can still change it, the commit still adopts what ends up picked, and the record is still right; only the no-prefill arms can see that the member was handed an answer.",
    mustFail: ["NOTHING IS PREFILLED: no reading radio is checked", "NOTHING IS PREFILLED: the adoption slot",
               "NOTHING IS PREFILLED: no request the surface sent before the member picked carried a version"],
    mustPass: ["THE CONCLUSION ADOPTS THE PICKED READING'S CLAIM WORD FOR WORD", "THE MEMBER PICKED: the reading they chose is the one checked"],
    from: '    CONCL.readingsBound = (r && r.bound) || "";\n',
    to:   '    CONCL.readingsBound = (r && r.bound) || "";\n    CONCL.version = CONCL.readings.length ? String(CONCL.readings[0].name) : "";\n',
  },
  {
    id: "C-history-is-only-the-stance",
    what: "THE SECOND CHEAP GREEN — the history renders only its latest entry. The plane still appends, the stance still reads right, and a withdrawal erases the conclusion from what the member can see.",
    mustFail: ["THE HISTORY SHOWS BOTH, in order", "and all three render, in the record's order"],
    mustPass: ["WITHDRAWING APPENDS: the record holds BOTH entries", "THE STANCE RENDERS the withdrawal"],
    from: "      + STANCE.concHistory.map(stanceEntryHtml).join(\"\")\n",
    to:   "      + STANCE.concHistory.slice(-1).map(stanceEntryHtml).join(\"\")\n",
  },
  {
    id: "D-project-claim-not-shown",
    what: "THE PROJECT COMMITS BLIND — the project's act keeps its fields and its button and drops the claim it is about to adopt. The record is still right; the member never read what they put their name to.",
    mustFail: ["THE CLAIM IS SHOWN BEFORE THE COMMIT, word for word — the claim of the reading the project stands on"],
    mustPass: ["THE RECORD HOLDS ONE ENTRY", "WITHDRAWING APPENDS: the record holds BOTH entries"],
    from: "      + stanceCxClaimHtml()\n",
    to:   "",
  },
  {
    id: "E-undetermined-filled-in",
    what: "THE LEGACY CLAIM FILLED IN — a conclusion whose claim the record calls undetermined is rendered as adopted, with the concluding member's words standing in for the claim. It is the overclaim §7.1 item 2 names, drawn by the surface.",
    mustFail: ["THE LEGACY CLAIM IS RENDERED UNDETERMINED", "AND NEVER FILLED IN"],
    mustPass: ["the page renders what the question concluded with no project, with its claim ADOPTED, verbatim"],
    from: '  const c = npc.claim && typeof npc.claim === "object" ? npc.claim : null;\n',
    to:   '  const c = { state: "adopted", text: (npc.claim && npc.claim.text) || npc.conclusion, version: (npc.claim && npc.claim.version) || "" };\n',
  },
];

/* ==================================================================== */
function runSuite() {
  const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8", timeout: 600000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = /conclude-reading: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((x) => x[1]);
  /* A RUN THAT ENDS WITHOUT ITS OWN COMPLETION LINE DID NOT FINISH, whatever
     the exit status said. Reported as -1 rather than 0, because a missing tally
     read as zero is the number that looks like health. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, failed, code: r.status, out };
}

const results = [];
console.log("UI-65 NEGATIVE CONTROL — each arm ALONE, restored and verified by sha256 AND cmp\n");

const PRISTINE0 = APP + ".ui65-baseline.pristine";
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
  const PRISTINE = `${APP}.ui65-${arm.id}.pristine`;
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
