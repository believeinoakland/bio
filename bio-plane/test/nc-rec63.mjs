#!/usr/bin/env node
/* nc-rec63.mjs — REC-63's NEGATIVE-CONTROL HARNESS.
 *
 * `node test/nc-rec63.mjs` from `bio-plane/`. It arms each arm ALONE with every
 * other held open, runs `test/provenance-marker.test.mjs`, and restores.
 *
 * THE DISCIPLINE, and every clause of it is a receipt from a control that went
 * wrong in this repository rather than a style note:
 *
 *  - EACH ARM ALONE. Two arms armed together cannot tell you which one a
 *    failure belongs to, and an arm that never armed reads exactly like an arm
 *    that armed and found nothing.
 *  - DECLARED BEFORE RUNNING. Each arm states MUST-FAIL and MUST-NOT-FAIL up
 *    front, and the harness compares the declaration to the outcome. A surprising
 *    green is a FINDING about the arm, printed as such rather than smoothed.
 *  - THE ARM MUST ACTUALLY CHANGE THE SOURCE. If the replacement matched
 *    nothing the harness ABORTS that arm rather than reporting a delta over an
 *    unarmed file — "an arm that never armed" is this project's most repeated
 *    control defect.
 *  - THE BASELINE IS AN ARM. A harness whose first run reported the same thing
 *    for every arm INCLUDING the baseline has been sighted here; without a
 *    baseline row, six-broken and six-working look identical.
 *  - RESTORE VERIFIED BY sha256 AND BY `cmp`, against a pristine copy named
 *    UNIQUELY PER ARM, inside this worktree and never in a shared scratchpad.
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const STORE = HERE + "../src/store.mjs";
const SUITE = HERE + "provenance-marker.test.mjs";
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const ARMS = [
  {
    id: "a", file: STORE,
    title: "THE MARKER REMOVED — the act records nothing",
    from: "    if (!same) {\n      const seq =",
    to:   "    if (false) {\n      const seq =",
    mustFail: "the arms showing a `verified` row that says nothing about what could not be shown: "
            + "op=list still answers NEVER_LOOKED after an assessment, op=audit's LOOKED_INDETERMINATE "
            + "tally stays 0, and the act itself reports marked:false",
    mustNotFail: "sections D (a good route still reads PRESENT... it too now records nothing, so this "
               + "arm is expected to be broad) — declared broad rather than pretended narrow",
  },
  {
    id: "b", file: STORE,
    title: "THE TWO ABSENCES COLLAPSED — nobody-looked answers as looked-and-fine",
    from: `    if (!mark)
      return { applies: true, assessed: false, marked: false,
               finding: "NEVER_LOOKED", means: OBSERVATION_STATES.NEVER_LOOKED,`,
    to:   `    if (!mark)
      return { applies: true, assessed: true, marked: false,
               finding: "PRESENT", means: OBSERVATION_STATES.PRESENT,`,
    mustFail: "THE ARM THIS ITEM TURNS ON — every assertion that tells the two absences apart in "
            + "section C, and the NEVER_LOOKED arms in section A",
    mustNotFail: "section E (no retraction edge) and section F (the four DEC-49 codes), which are "
               + "about a different property entirely",
  },
  {
    id: "c", file: STORE,
    title: "OVER-STRICTNESS — mark unconditionally, so a showable route is doubted too",
    from: `    const finding = (registerState !== "readable" || undetermined > 0)
      ? "LOOKED_INDETERMINATE" : "PRESENT";`,
    to:   `    const finding = "LOOKED_INDETERMINATE";`,
    mustFail: "section D — a verification whose route CAN be shown must carry no marker and must not "
            + "be refused",
    mustNotFail: "section A, which is why this arm runs ALONE: an item that only ever fails in one "
               + "direction has not shown its subject is what is being measured",
  },
  {
    id: "d", file: STORE,
    title: "THE PUBLICATION REMOVED — the marker is stored and no read publishes it (REC-74's defect)",
    from: "    const out = { ...r, route: Store.routeFinding(r.object_type, mark) };",
    to:   "    const out = { ...r };",
    mustFail: "every op=list arm, in sections A, B, C, D, G and H. The store still HOLDS the marker: "
            + "the point of the arm is that the record has gone silent for anybody who was not there",
    mustNotFail: "the op=audit arms in section B, which is the other read and must still carry it",
  },
  {
    id: "e", file: SUITE,
    title: "THE CLASS SWEEP NEUTERED — the walk finds nothing",
    from: "  const silentCatches = (src) => [...strip(src).matchAll(/\\bcatch\\s*(?:\\([^)]*\\))?\\s*\\{/g)].map((m) => m.index);",
    to:   "  const silentCatches = (src) => [];",
    mustFail: "the sweep's non-empty arm and its DELTA arm — a walk that finds nothing reports a "
            + "beautiful roster of zero, which is why the reach is a delta and never an absolute",
    mustNotFail: "everything else: the sweep is an instrument beside the subject, not the subject",
  },
];

function runSuite() {
  try {
    const out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", cwd: HERE + ".." });
    return { out, code: 0 };
  } catch (e) {
    return { out: String(e.stdout || "") + String(e.stderr || ""), code: e.status ?? 1 };
  }
}
const tallyOf = (out) => {
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  return m ? { pass: +m[1], fail: +m[2] } : { pass: null, fail: null };
};
const footOf = (out) => /FOOT REACHED/.test(out);
const failedLabels = (out) =>
  [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1].trim());

/* THE BASELINE IS AN ARM. Without this row, six-broken and six-working print
   the same page. */
console.log("=".repeat(78));
console.log("REC-63 NEGATIVE CONTROLS — baseline first, then each arm ALONE");
console.log("=".repeat(78));
const base = runSuite();
const baseT = tallyOf(base.out);
console.log(`\nBASELINE: ${baseT.pass} pass, ${baseT.fail} fail · exit ${base.code} · FOOT ${footOf(base.out) ? "REACHED" : "NOT REACHED"}`);
if (baseT.fail !== 0 || !footOf(base.out)) {
  console.log("BASELINE IS NOT GREEN OR DID NOT REACH ITS FOOT — every delta below would be meaningless. Stopping.");
  process.exit(1);
}

let wrong = 0;
for (const arm of ARMS) {
  const pristine = `${arm.file}.pristine.rec63-${arm.id}`;   // UNIQUE PER ARM
  copyFileSync(arm.file, pristine);
  const beforeSha = sha(arm.file);

  const src = readFileSync(arm.file, "utf8");
  if (!src.includes(arm.from)) {
    console.log(`\n--- ARM (${arm.id}) ${arm.title}\n    ABORTED: the replacement matched NOTHING, so any delta would be a `
              + `measurement of an unarmed file. Nothing was changed.`);
    unlinkSync(pristine);
    wrong++;
    continue;
  }
  writeFileSync(arm.file, src.replace(arm.from, arm.to));
  const armedSha = sha(arm.file);
  const armed = armedSha !== beforeSha;

  console.log(`\n${"-".repeat(78)}`);
  console.log(`ARM (${arm.id}) ${arm.title}`);
  console.log(`  ARMED: ${armed ? "yes" : "NO — ABORT"} (${beforeSha.slice(0, 8)} -> ${armedSha.slice(0, 8)})`);
  console.log(`  DECLARED MUST-FAIL:     ${arm.mustFail}`);
  console.log(`  DECLARED MUST-NOT-FAIL: ${arm.mustNotFail}`);

  const r = armed ? runSuite() : { out: "", code: -1 };
  const tl = tallyOf(r.out);
  const labels = failedLabels(r.out);
  console.log(`  ACTUAL: ${tl.pass} pass, ${tl.fail} fail · exit ${r.code} · FOOT ${footOf(r.out) ? "REACHED" : "NOT REACHED"}`);
  console.log(`  FIRST FAILING ASSERTIONS (up to 6):`);
  for (const l of labels.slice(0, 6)) console.log(`    - ${l}`);
  if (!labels.length) {
    console.log(`    (NONE — SURPRISING GREEN. This is a FINDING about the arm and is recorded, not smoothed.)`);
    wrong++;
  }

  /* RESTORE, verified BOTH ways. */
  copyFileSync(pristine, arm.file);
  const afterSha = sha(arm.file);
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", arm.file, pristine]); } catch { cmpOk = false; }
  console.log(`  RESTORED: sha256 ${afterSha === beforeSha ? "MATCHES" : "DOES NOT MATCH"} (${afterSha.slice(0, 8)}) · cmp ${cmpOk ? "identical" : "DIFFERS"}`);
  if (afterSha !== beforeSha || !cmpOk) { console.log("  RESTORE FAILED — stop and fix the tree by hand."); process.exit(2); }
  unlinkSync(pristine);
}

/* AND THE RE-RUN AFTER EVERYTHING, because a restore that verifies by hash and
   leaves a broken tree has been sighted: the file is right and the run is what
   proves it. */
const again = runSuite();
const againT = tallyOf(again.out);
console.log(`\n${"=".repeat(78)}`);
console.log(`AFTER ALL ARMS, RE-RUN: ${againT.pass} pass, ${againT.fail} fail · exit ${again.code} · FOOT ${footOf(again.out) ? "REACHED" : "NOT REACHED"}`);
console.log(`baseline was ${baseT.pass} pass — ${againT.pass === baseT.pass && againT.fail === 0 ? "IDENTICAL, the tree is as it was" : "DIFFERENT — the tree did not come back"}`);
console.log(`arms that did not behave as declared: ${wrong}`);
process.exit(againT.pass === baseT.pass && againT.fail === 0 ? 0 : 3);
