/* D-310 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — `caseproduction.control.mjs`'s precedent, and
 * `d280-strengthbar.control.mjs` before it. The pen lives INSIDE this worktree
 * and never in a shared scratchpad (PL-10: two workers wrote a harness to the
 * same scratchpad path and the second replaced the first BETWEEN arming and
 * restoring). `.d310-harness/` is gitignored.
 *
 * ---- WHAT THIS ITEM IS, so the arms read as a shape and not a list
 *
 * `op=affordances` published `publish` on a concluded, non-case-member inquiry
 * with NO condition on who was asking, while `publishCase()` refuses a non-owner
 * BY NAME (`NOT_THE_PROJECT_OWNER`, DEC-72 clause 5). That is the DEC-8
 * disagreement `affordances.mjs`'s own header calls the one thing it exists to
 * prevent, on the heaviest act in the system. D-310 adds ONE FACT to the store
 * (`project_owner`, three-valued) and ONE clause to the act's predicate.
 *
 * ---- THE PAIR IN (2a) AND (2b) IS THE WHOLE SHAPE, AND IT IS D-280's LESSON
 *
 * The narrowing can be wrong in TWO opposite directions and the headline
 * assertion cannot see either.
 *   (2a) makes the predicate `=== true` instead of `!== false`. Every MEMBER
 *        still gets the right answer, so **the DEC-8 agreement property stays
 *        GREEN** — while a machine credential, which holds no position and is
 *        answered `null`, silently loses an act. A fence tighter than its rule.
 *   (2b) makes the fact always `false` for a member. The machine is untouched
 *        and its arm stays GREEN, while the OWNER loses the offer.
 * Either arm alone proves nothing; run apart, they are what distinguishes "the
 * gate works" from "the gate refuses everything" and from "the gate refuses the
 * wrong population".
 *
 * ---- AND THE MACHINE CLAIM IS MEASURED IN BYTES, NOT ASSERTED
 *
 * `caseproduction.test.mjs` §3a prints `D310-MACHINE-ACTS <json>` — the act set
 * `op=affordances` publishes to a `class:member` credential on the same
 * concluded finding. This driver diffs that string across arms:
 *   BASELINE vs (1)  MUST BE IDENTICAL — removing the clause changes nothing a
 *                    machine credential sees, which IS the byte-unchanged claim.
 *   BASELINE vs (2a) MUST DIFFER — otherwise the probe is blind and the
 *                    identity above was free. An equality that costs nothing is
 *                    not evidence, so the probe carries its own control.
 *
 * Run it:  node test/d310.control.mjs [armId]
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = { affordances: ROOT + "src/affordances.mjs", store: ROOT + "src/store.mjs" };
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));
const ONLY = process.argv[2] || null;

/* THE FLOOR ON THE PRISTINE COPIES. A harness in this estate once reported a
   restore byte-identical over an EMPTY manifest, caught only because a digest
   read `e3b0c442…` — the sha256 of the empty string. Sizes printed and floored
   before anything is armed. */
for (const [k, v] of Object.entries(ORIGINAL)) {
  console.log(`  pristine ${k}: ${v.length} bytes · sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
  if (v.length < 5000) { console.log(`  ** ${k} is implausibly small; refusing to arm over it`); process.exit(1); }
}

const PEN = ROOT + "../.d310-harness";
rmSync(PEN, { recursive: true, force: true });
mkdirSync(PEN, { recursive: true });
for (const [k, p] of Object.entries(F)) copyFileSync(p, join(PEN, `record.${k}`));

let armsRun = 0, armsWrong = 0;

function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 900000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  /* A suite that THREW has NO tally and is reported as `-1` rather than `0`: a
     thrown module and a module with zero failures are different claims, and a
     TypeError inside an assertion goes through no assertion at all while the
     tally reads clean (D-93). */
  const m = /(\d+) pass(?:ed)?, (\d+) (?:FAIL|fail(?:ed)?)/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 200));
  const machine = /^ {2}D310-MACHINE-ACTS (.*)$/m.exec(out);
  return m ? { pass: +m[1], fail: +m[2], named, machine: machine ? machine[1] : null, out }
           : { pass: -1, fail: -1, named, machine: machine ? machine[1] : null, out };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 70)}…' occurs ${n} times in `
    + `${key}. An unguarded edit would have armed ${n} sites, and a control armed in more places than `
    + `it claims is not the control it reports.`);
  writeFileSync(F[key], src.replace(from, to));
}

function restoreAll(armId) {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k} (arm ${armId})`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT: ${k} (arm ${armId})`);
    execFileSync("cmp", ["-s", p, join(PEN, `arm${armId}.${k}`)]);
    execFileSync("cmp", ["-s", p, join(PEN, `record.${k}`)]);
    console.log(`    ${k}: ${now.length} bytes restored, verified by sha256, by content, and by cmp x2`);
  }
}

const OWN = "caseproduction.test.mjs", AFF = "affordances.test.mjs";
let BASELINE_MACHINE = null;

/* `machine` is one of "same" (must be byte-identical to the baseline's line),
   "differs" (must NOT be), or undefined (not asked of this arm). */
function arm(id, title, edits, suites, { machine } = {}) {
  if (ONLY && ONLY !== id) return;
  armsRun++;
  console.log(`\n=== (${id}) ${title}`);
  for (const k of Object.keys(F)) copyFileSync(F[k], join(PEN, `arm${id}.${k}`));
  let wrong = false;
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    let totalFail = 0;
    for (const s of suites) {
      const r = runSuite(s.name);
      console.log(`  MEASURED ${s.name}: ${r.pass} pass, ${r.fail} fail`
        + `${r.fail === -1 ? "  ** NO TALLY — the suite THREW rather than failing, reported as -1" : ""}`);
      for (const n of r.named) console.log(`    FAILED: ${n}`);
      totalFail += Math.max(0, r.fail);
      const hit = (frag) => r.named.some((n) => n.includes(frag));
      for (const frag of (s.mustFail || []))
        if (!hit(frag) && r.fail !== -1) { console.log(`  ** WRONG: in ${s.name}, expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
      for (const frag of (s.mustNotFail || []))
        if (hit(frag)) { console.log(`  ** WRONG: in ${s.name}, "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
      if (r.fail === -1) { console.log(`  ** WRONG: ${s.name} produced no tally at all`); wrong = true; }
      if (machine && s.name === OWN) {
        if (r.machine === null) { console.log("  ** WRONG: the machine-acts probe printed nothing; the byte claim cannot be made"); wrong = true; }
        else {
          const same = r.machine === BASELINE_MACHINE;
          console.log(`  MACHINE ACTS ${same ? "BYTE-IDENTICAL to" : "DIFFER from"} the baseline (${r.machine.length} bytes)`);
          if (machine === "same" && !same) { console.log("  ** WRONG: a machine credential's view MOVED under an arm that must not touch it"); wrong = true; }
          if (machine === "differs" && same) { console.log("  ** WRONG: the machine probe did not move under an arm that MUST move it — the probe is blind, so every byte-identity it reports is free"); wrong = true; }
        }
      }
    }
    if (totalFail === 0) {
      console.log("  ** WRONG: every suite stayed GREEN. A control that cannot fail proves nothing.");
      wrong = true;
    }
    if (wrong) armsWrong++; else console.log("  as declared.");
  } finally {
    restoreAll(id);
  }
}

console.log("\nD-310 — negative controls. THE BASELINE FIRST, so every arm is a DELTA and so a run in\n"
          + "which every arm is broken is distinguishable from one in which every arm works.");
if (!ONLY) {
  for (const n of [OWN, AFF]) {
    const b = runSuite(n);
    console.log(`  BASELINE ${n}: ${b.pass} pass, ${b.fail} fail`);
    if (n === OWN) {
      BASELINE_MACHINE = b.machine;
      console.log(`  BASELINE machine acts: ${BASELINE_MACHINE === null ? "** NONE PRINTED **" : `${BASELINE_MACHINE.length} bytes · sha256 ${sha(BASELINE_MACHINE).slice(0, 16)}…`}`);
      if (!BASELINE_MACHINE || BASELINE_MACHINE.length < 20) {
        console.log("  ** the machine probe printed nothing usable; the byte arms below would compare emptiness");
        process.exit(1);
      }
    }
    if (b.fail !== 0) {
      console.log("  ** the tree is not whole; every arm below would measure the wrong thing");
      process.exit(1);
    }
  }
}

/* ===================================================== (1) THE DISAGREEMENT, RE-OPENED */
arm("1", "THE ITEM'S OWN ARM — THE DEC-8 DISAGREEMENT PUT BACK. Drop `&& f.project_owner !== false` "
  + "from the `publish` act, so the pre-flight offers publication to a caller `publishCase()` refuses "
  + "by name. DECLARED: caseproduction's ONE agreement property MUST fail, NAMING BOTH SURFACES in "
  + "its own label, and the fixture guard MUST fail with it because the table goes uniform; "
  + "affordances' `ONLY act that consults the position` MUST fail. The STORE's own owner refusal MUST "
  + "stay green — the fence is untouched and a control that took both down would not have isolated "
  + "the pre-flight. And a MACHINE credential's published acts must be BYTE-IDENTICAL to the "
  + "baseline's, which is the byte-unchanged claim measured rather than asserted.",
  /* RE-ANCHORED 2026-09-21 by the REC-157 worker, and the anchor had been DEAD since
     2026-09-19: REC-135 (IC-166) rewrote the `publish` predicate's condition lines, so the
     quote `f.current_state === "concluded" && !f.case_member …` matched ZERO times and this
     arm threw before arming — a driver M0-25's witness cannot read (its anchors sit in a
     nested array), so nothing said so. REC-157 moves the same predicate again (the
     membership half gains `edition_warranted_for_project`). THE ARM IS UNCHANGED IN WHAT IT
     BREAKS: it still drops `&& f.project_owner !== false` and nothing else; only the quote
     moved to the lines that now carry it. RE-RUN THE SAME DAY, WHOLE DRIVER, on REC-157's
     tree: 4 arms, 0 other than declared — arm (1) caseproduction 72/3 and affordances 86/3,
     the machine's published acts byte-identical to the baseline (2,819 bytes); (2a) 74/1 and
     88/1 with the machine's acts DIFFERING (2,657 bytes); (2b) 72/3; (3) 74/1 and 88/1. Every
     restore verified by sha256, content and cmp. (The driver prints string LENGTHS as
     "bytes": `store.mjs` is 2,786,693 bytes on disk and 2,779,039 UTF-16 units.) */
  [["affordances", `&& (!f.case_member || f.edition_warranted_for_project === true)\n                     && f.project_owner !== false }`,
                   `&& (!f.case_member || f.edition_warranted_for_project === true) }`]],
  [{ name: OWN,
     mustFail: ["THE DEC-8 AGREEMENT, AS ONE PROPERTY", "FIXTURE GUARD: the table is not uniform"],
     mustNotFail: ["A JOINED PARTICIPANT WHO IS NOT AN OWNER IS REFUSED",
                   "OVER-STRICTNESS: a MACHINE credential's answer does not narrow"] },
   { name: AFF,
     mustFail: ["and it is the ONLY act that consults the position"],
     mustNotFail: ["the seven roster acts are still NON_ACTS"] }],
  { machine: "same" });

/* ============================== (2a) OVER-STRICTNESS — THE UNDETERMINED CASE NARROWED */
arm("2a", "OVER-STRICTNESS, AND THE HEADLINE STAYS GREEN THROUGH IT — `!== false` becomes `=== true`, "
  + "so a viewer whose position is UNDETERMINED loses the act. Every MEMBER still gets the right "
  + "answer, so the DEC-8 agreement property MUST NOT fail; what fails is the machine arm and the "
  + "predicate's truth table. DECLARED: caseproduction's machine over-strictness arm MUST fail and "
  + "its machine acts MUST DIFFER from the baseline (which is also this probe's own control — an "
  + "identity nothing can move is free); affordances' `narrows on a STATED false and on nothing "
  + "else` MUST fail; the agreement property MUST stay green.",
  [["affordances", "&& f.project_owner !== false }", "&& f.project_owner === true }"]],
  [{ name: OWN,
     mustFail: ["OVER-STRICTNESS: a MACHINE credential's answer does not narrow"],
     mustNotFail: ["THE DEC-8 AGREEMENT, AS ONE PROPERTY"] },
   { name: AFF,
     mustFail: ["narrows on a STATED false and on nothing else"] }],
  { machine: "differs" });

/* ================================== (2b) OVER-STRICTNESS — THE OWNER LOSES THE OFFER */
arm("2b", "OVER-STRICTNESS, THE OTHER DIRECTION — the fact answers `false` for every member, so an "
  + "OWNER loses an act the store would have let them perform. DECLARED: caseproduction's agreement "
  + "property MUST fail and the fixture guard with it (the table goes uniform the other way); the "
  + "MACHINE arm MUST stay green and its bytes UNCHANGED, because a machine is answered `null` and "
  + "this arm cannot reach it — which is what separates the member gate from the machine gate.",
  [["store", ".some((p) => this.#isProjectOwner(p.project_id, memberId))",
             ".some((p) => p && false)"]],
  [{ name: OWN,
     mustFail: ["THE DEC-8 AGREEMENT, AS ONE PROPERTY", "FIXTURE GUARD: the table is not uniform"],
     mustNotFail: ["OVER-STRICTNESS: a MACHINE credential's answer does not narrow",
                   "A JOINED PARTICIPANT WHO IS NOT AN OWNER IS REFUSED"] }],
  { machine: "same" });

/* ======================================================== (3) DEC-69 — THE NAG PLANTED */
arm("3", "DEC-69 — THE NARROWED ANSWER TURNED INTO A NAG. The `publish` act grows a PROMPT that "
  + "re-states the owner rule at the act, which is the second telling DEC-69 forbids (*the workflow "
  + "must not be nagging or second-guessing users*) — informing at the act ONCE is respect, and this "
  + "is the shape that turns it into ceremony. DECLARED: caseproduction's DEC-69 arm MUST fail and "
  + "affordances' prompt-totality assertion MUST fail with it (a prompt is a published wording and "
  + "the catalogue holds the set); the agreement property MUST stay green, because nagging is a "
  + "different defect from disagreeing and an arm that took both down would isolate neither.",
  [["affordances", `  { id: "publish", label: "Publish (author the case)", weight: "single", types: ["inquiry"],`,
                   `  { id: "publish", label: "Publish (author the case)", weight: "single", types: ["inquiry"],\n`
                   + `    prompt: "You are an owner of a project. Confirm once more that you mean to publish.",`]],
  [{ name: OWN,
     mustFail: ["DEC-69: the narrowing informs by ABSENCE"],
     mustNotFail: ["THE DEC-8 AGREEMENT, AS ONE PROPERTY"] },
   { name: AFF,
     mustFail: ["every act that carries a PROMPT carries its own published wording"] }]);

console.log(`\n${armsRun} arm(s) run, ${armsWrong} came back other than declared.`);
rmSync(PEN, { recursive: true, force: true });
process.exit(armsWrong === 0 ? 0 : 1);
