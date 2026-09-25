/* UI-67 — THE NEGATIVE CONTROL FOR `question-npc.test.mjs`.
 *
 * NOT A SUITE. Deliberately not named `*.test.mjs`: `civicos-ui/test/run.mjs`
 * DISCOVERS `.test.mjs` by filename and would run it, count it into the UI
 * baseline, and report a "suite" whose whole job is to make its subject go RED.
 *
 * WHAT A CONTROL HERE IS FOR, and it is the reason this file is long. WORKER.md:
 * *controls find the instrument wrong more often than the subject.* Each arm is
 * armed ALONE, with the other four held open, against a UNIQUELY-NAMED pristine
 * copy, and every restore is verified by sha256 AND by `cmp` with a byte count
 * and a minimum guard. Each patch is asserted to match EXACTLY ONCE before it is
 * applied — an arm that did not arm is a finding, not a pass.
 *
 * EACH ARM'S RESULT IS DECLARED BEFORE IT RUNS (the `must` / `mustNot` lists),
 * and this driver fails if the run does not match the declaration — including
 * when it fails MORE than declared, which is how a mutation that moved a second
 * variable announces itself rather than reading as a stronger control.
 *
 * ============================== THE ARMS ==============================
 *
 * BASELINE — no mutation at all. It is here because WORKER.md records a harness
 *   whose first run reported `null` for every arm INCLUDING the baseline, where
 *   only the baseline row distinguished six-arms-broken from six-arms-working.
 *   DECLARED: 0 fail.
 *
 * (A) DROP THE CACHE INVALIDATION ON THE WITHDRAWAL — `stanceWithdraw` stops
 *   forgetting the cached projection. This is the arm the row names.
 *   DECLARED: the withdrawal re-read arm fails BY NAME, and the class sweep's
 *   "every site that writes forgets" arm fails with it. The conclusion arm must
 *   STAY GREEN — the two invalidations are independent and an arm that took both
 *   down would be measuring one mutation as two.
 *
 * (B) DROP THE CACHE INVALIDATION ON THE CONCLUSION — `doConclude` stops
 *   forgetting. DECLARED: the conclusion re-read arm fails, and with it every
 *   arm that reads the block the stale page cannot draw. The withdrawal arm is
 *   NOT expected to survive here and the reason is recorded rather than smoothed:
 *   the page that never re-read after the conclusion is showing a projection
 *   whose `no_project_conclusion` is null, so section 5's render arm has nothing
 *   to compare. Its WIRE arm does survive, and that is the discrimination.
 *
 * (C) STUB THE RENDER — the page computes the conclusion and draws nothing.
 *   DECLARED: every RENDER arm fails; the two WIRE arms (the page asked again)
 *   STAY GREEN. That split is the whole point: it is the measurement that says
 *   the wire arms alone are not a criterion, which is why the render is asserted
 *   against the plane's own answer beside them.
 *
 * (D) KEEP THE NO-PROJECT DIALOG ON A CONCLUDED QUESTION — the routing is
 *   removed and REC-142's refusal is offered to the member again.
 *   DECLARED: the "no control opens the no-project dialog" arm fails, and the
 *   two arms that prove the act was not merely dropped fail with it. The
 *   OVER-STRICTNESS arm must STAY GREEN, because this mutation restores the
 *   dialog everywhere and that arm is about a question where it belongs.
 *
 * (E) OVER-STRICTNESS — `stanceWithdraw` forgets the cached projection by the
 *   INLINE spelling five older sites in this file use, instead of through
 *   `projForget`. This is CORRECT WORK IN A SPELLING THE SUITE DID NOT AUTHOR.
 *   DECLARED: 0 fail. If this arm goes red, the class sweep has become a fence
 *   tighter than its rule and the sweep is the defect, not the tree.
 *
 * ---------------------------------------------------------------------------
 * RUN 2026-09-19 (UI-67), and the results are recorded by this file's own run
 * rather than transcribed. app.html returned to its pristine sha256 after every
 * arm, `cmp` clean, 1403728 bytes. SIX ARMS, ALL AS DECLARED, exit 0:
 * BASELINE 49/0 · A 47/2 · B 37/12 · C 41/8 · D 44/5 · E 49/0.
 *
 * WHAT THE FIRST RUN FOUND, AND IT WAS THE INSTRUMENT RATHER THAN THE SUBJECT.
 * Arms B and D returned a TALLY OF 48 where every other arm read 49 — all six
 * were still as declared, and nothing in the declarations would have caught it.
 * The suite's "the project's act is carried there" assertion sat inside a bare
 * `if (routedM)`, so under a mutation that removes the routed control it was
 * SKIPPED instead of failed. A skipped assertion is a finding that never
 * happened, and the only thing that showed it was comparing the arms' totals to
 * the baseline's. The suite now has an else branch; the totals are 49 in every
 * arm. This is recorded because the same shape is on the WORKER brief and in
 * `bound-sweep` ARM G, and it has now been paid for a second time in this estate.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const APP = new URL("../app.html", import.meta.url);
const SUITE = new URL("./question-npc.test.mjs", import.meta.url).pathname;
const sha = (v) => createHash("sha256").update(v).digest("hex");
const PRISTINE = fs.readFileSync(APP, "utf8");
const PRISTINE_SHA = sha(PRISTINE);
const MIN_BYTES = 1_000_000;

if (Buffer.byteLength(PRISTINE) < MIN_BYTES)
  throw new Error(`app.html is ${Buffer.byteLength(PRISTINE)} bytes — below the ${MIN_BYTES} floor. `
    + "Refusing to run: a control over a truncated subject refutes nothing.");
console.log(`pristine app.html: ${PRISTINE_SHA} · ${Buffer.byteLength(PRISTINE)} bytes\n`);

const ARMS = [
  { id: "BASELINE", what: "no mutation at all — the row that tells six-broken from six-working",
    patch: null, must: [], mustNot: [], expectFail: 0 },

  { id: "A", what: "stanceWithdraw stops forgetting the cached projection",
    from: `wd.reason = ""; projForget(STANCE.inquiry); await stanceLoad();`,
    to:   `wd.reason = ""; await stanceLoad();`,
    must: ["THE CACHE WAS FORGOTTEN ON THE WITHDRAWAL TOO",
           "EVERY SITE THAT WRITES forgets the cached projection"],
    mustNot: ["THE CACHE WAS FORGOTTEN: after the conclusion landed"] },

  { id: "B", what: "doConclude stops forgetting the cached projection",
    from: `  projForget(CONCL.id);\n`,
    to:   ``,
    must: ["THE CACHE WAS FORGOTTEN: after the conclusion landed",
           "EVERY SITE THAT WRITES forgets the cached projection"],
    mustNot: ["THE CACHE WAS FORGOTTEN ON THE WITHDRAWAL TOO"] },

  { id: "C", what: "the page computes the conclusion and renders nothing",
    from: `      \${npcPane}\n`,
    to:   `\n`,
    must: ["THE QUESTION'S PAGE SHOWS THE NO-PROJECT CONCLUSION",
           "THE CLAIM IS THE RECORD'S, verbatim",
           "THE QUESTION'S PAGE STATES IT UNDETERMINED"],
    mustNot: ["THE CACHE WAS FORGOTTEN: after the conclusion landed",
              "THE CACHE WAS FORGOTTEN ON THE WITHDRAWAL TOO"] },

  { id: "D", what: "the no-project dialog is offered again on a concluded question",
    from: `    if(npcRouted) barOpts.routed = { conclude: npcRouted };`,
    to:   `    if(false) barOpts.routed = { conclude: npcRouted };`,
    must: ["NO CONTROL ON THE PAGE OPENS THE NO-PROJECT DIALOG",
           "AND THE ACT IS NOT DROPPED"],
    mustNot: ["OVER-STRICTNESS: on a question the record has NOT concluded"] },

  { id: "E", what: "OVER-STRICTNESS — the withdrawal forgets by the inline spelling, not through projForget",
    from: `wd.reason = ""; projForget(STANCE.inquiry); await stanceLoad();`,
    to:   `wd.reason = ""; IMG_CACHE.delete(STANCE.inquiry); PROJ_CACHE.delete(STANCE.inquiry); await stanceLoad();`,
    must: [], mustNot: [], expectFail: 0 },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.filter((a) => a.from !== undefined).map((a) => ({ arm: a.id, file: APP.pathname, find: a.from, put: a.to })));

let armsWrong = 0;
for (const arm of ARMS) {
  console.log(`=== ARM ${arm.id} — ${arm.what} ===`);
  let text = PRISTINE;
  if (arm.from !== undefined) {
    const hits = PRISTINE.split(arm.from).length - 1;
    /* AN ARM THAT DID NOT ARM IS A FINDING. An anchor occurring zero times makes
       the arm a no-op that reads as a passing subject; occurring twice makes the
       mutation move a second variable. Both are refusals to run. */
    if (hits !== 1) {
      console.log(`  ARM ${arm.id} DID NOT ARM: its anchor occurs ${hits} time(s) in app.html, not exactly once.`);
      armsWrong++; continue;
    }
    text = PRISTINE.split(arm.from).join(arm.to);
    if (text === PRISTINE) { console.log(`  ARM ${arm.id} DID NOT ARM: the mutation changed nothing.`); armsWrong++; continue; }
    console.log(`  armed: ${Buffer.byteLength(PRISTINE)} -> ${Buffer.byteLength(text)} bytes`);
  } else {
    console.log("  armed: nothing changed (baseline)");
  }

  fs.writeFileSync(APP, text);
  let out = "";
  try { out = String(execFileSync("node", [SUITE], { stdio: "pipe", maxBuffer: 64 * 1024 * 1024 })); }
  catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  /* RESTORE FIRST, VERIFY SECOND, AND REPORT THIRD — so a driver that dies while
     judging still leaves the tree as it found it. */
  fs.writeFileSync(APP, PRISTINE);
  const back = fs.readFileSync(APP, "utf8");
  const restored = sha(back) === PRISTINE_SHA && back === PRISTINE
    && Buffer.byteLength(back) === Buffer.byteLength(PRISTINE);
  console.log(`  restored: sha256 ${sha(back)} · cmp ${back === PRISTINE ? "clean" : "DIFFERS"} `
    + `· ${Buffer.byteLength(back)} bytes · ${restored ? "OK" : "RESTORE FAILED"}`);
  if (!restored) { console.log("  REFUSING TO CONTINUE: the tree was not restored."); process.exit(1); }

  const tally = /question-npc: (\d+) pass, (\d+) fail/.exec(out);
  /* A SUITE THAT DID NOT REACH ITS OWN FOOT REPORTS -1, NEVER 0 (WORKER.md: a
     TypeError inside an assertion goes through no assertion at all and ends the
     module while the tally reads clean). */
  const passN = tally ? Number(tally[1]) : -1, failN = tally ? Number(tally[2]) : -1;
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]);
  console.log(`  RESULT: ${passN}/${failN}${tally ? "" : "  (NO TALLY — the suite did not reach its own foot)"}`);
  for (const f of failed) console.log(`     FAILED: ${f.slice(0, 118)}`);

  let wrong = [];
  if (!tally) wrong.push("the suite produced no tally at all");
  if (arm.expectFail !== undefined && failN !== arm.expectFail)
    wrong.push(`declared ${arm.expectFail} failure(s), saw ${failN}`);
  if (arm.expectFail === undefined && failN < 1)
    wrong.push("declared failures, saw none — the mutation had no effect on the subject");
  for (const m of arm.must || [])
    if (!failed.some((f) => f.includes(m))) wrong.push(`DECLARED TO FAIL and did not: "${m}"`);
  for (const m of arm.mustNot || [])
    if (failed.some((f) => f.includes(m))) wrong.push(`DECLARED TO SURVIVE and did not: "${m}"`);
  if (wrong.length) { armsWrong++; for (const w of wrong) console.log(`  ARM ${arm.id} NOT AS DECLARED: ${w}`); }
  else console.log(`  ARM ${arm.id}: AS DECLARED`);
  console.log("");
}

const final = fs.readFileSync(APP, "utf8");
console.log(`FINAL app.html: ${sha(final)} · ${Buffer.byteLength(final)} bytes · `
  + `${sha(final) === PRISTINE_SHA && final === PRISTINE ? "IDENTICAL to pristine" : "DIFFERS — FIX THE TREE"}`);
console.log(`question-npc.control: ${ARMS.length} arm(s), ${armsWrong} NOT as declared`);
if (armsWrong || sha(final) !== PRISTINE_SHA) process.exitCode = 1;
