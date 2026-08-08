/* M0-14 / D-233 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — `suggest.control.mjs`'s precedent, which took it
 * from `versionstate.control.mjs` and `check-refusal-codes.mjs`.
 *
 * IT LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. On 2026-08-07 a
 * worker's harness was OVERWRITTEN MID-TURN by another running worker, and a
 * harness silently replaced between ARM and RESTORE reports a restore it never
 * performed.
 *
 * EVERY ARM IS ARMED ALONE, the others held open, and every arm DECLARES BEFORE
 * IT RUNS what must fail AND what must not. An arm that fails "somewhere" proves
 * the instrument is sensitive to something; an arm that fails at its own
 * assertion and leaves its neighbours green proves the assertion is doing work.
 *
 * EVERY RESTORE IS VERIFIED AGAINST A PRISTINE PRE-ARM COPY, BY sha256 AND BY
 * CONTENT. A hash comparison answers "the bytes are the same" only if the reader
 * that produced both digests was the same reader; a byte comparison of the
 * strings answers it outright, and both are cheap.
 *
 * A MISSING TALLY IS REPORTED AS -1, NEVER AS 0 (REC-70's receipt: a harness
 * reading a missing figure as zero records "stayed GREEN" for a run that died).
 *
 * Run it:  node test/register.control.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = {
  register: ROOT + "scripts/control-register.mjs",
  suggest:  ROOT + "test/suggest.test.mjs",
  strength: ROOT + "test/strengthpair.test.mjs",
  capture:  ROOT + "test/capture.test.mjs",
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const PRISTINE = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const PRISTINE_SHA = Object.fromEntries(Object.entries(PRISTINE).map(([k, v]) => [k, sha(v)]));

let armsRun = 0, armsWrong = 0;

/* `capture.test.mjs` states its control TWICE, once as the register entry and once
   as header prose, and the two are byte-identical from "disable" onward — so every
   anchor into it must carry the MARKER to be unique. An anchor that matched both
   would edit a declaration this arm is not talking about. */
const CAP_DECL = "NEGATIVE CONTROL: (run 2026-07-31) disable the server-side integrity check"
  + " in the capture handler (guard `digest !== sha` with `false`, accepting a body whose"
  + " bytes do not match the sha256 parameter)";

/* --------------------------------------------------------------- readers */

/* The register's own published figures, parsed out of what the instrument
   PRINTS. Anything unreadable comes back -1, never 0. */
function coverage() {
  let out = "", code = 0;
  try {
    out = execFileSync(process.execPath, [ROOT + "scripts/coverage.mjs", "--strict"],
      { encoding: "utf8", timeout: 300000, cwd: ROOT });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); code = e.status == null ? -1 : e.status; }
  const num = (re) => { const m = re.exec(out); return m ? +m[1] : -1; };
  return {
    exit: code,
    arms: num(/(\d+) arms stated across/),
    classified: num(/arms stated across (\d+) classified/),
    corpus: num(/corpus \(suites read\) (\d+)\//),
    unclassifiedCount: num(/· (\d+) UNCLASSIFIED/),
    /* the names printed under the UNCLASSIFIED heading */
    unclassifiedNamed: (/UNCLASSIFIED — a declaration[\s\S]*?\n((?:    \S+\n)+)/.exec(out)?.[1] || "")
      .split("\n").map((s) => s.trim()).filter(Boolean),
    floorFired: /REGISTER FLOOR: /.test(out),
    newUnclassifiedFired: /^REGISTER: /m.test(out),
    undeclared: /No declared control/.test(out),
    out,
  };
}

function hygiene() {
  let out = "", code = 0;
  try {
    out = execFileSync(process.execPath, [ROOT + "test/hygiene.test.mjs"], { encoding: "utf8", timeout: 300000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); code = e.status == null ? -1 : e.status; }
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  return {
    exit: code,
    pass: m ? +m[1] : -1,
    fail: m ? +m[2] : -1,
    named: [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 120)),
    out,
  };
}

/* ---------------------------------------------------------------- editing */

function edit(key, pairs) {
  let src = readFileSync(F[key], "utf8");
  const before = src;
  for (const [from, to] of pairs) {
    const hits = src.split(from).length - 1;
    if (hits !== 1) throw new Error(`ANCHOR NOT UNIQUE in ${key} (${hits} hits): ${from.slice(0, 70)}`);
    src = src.replace(from, to);
  }
  if (src === before) throw new Error(`NO BYTES CHANGED in ${key} — the arm never armed`);
  writeFileSync(F[key], src);
  return { armedBytesChanged: true };
}

function restore(keys) {
  const report = [];
  for (const k of keys) {
    writeFileSync(F[k], PRISTINE[k]);
    const now = readFileSync(F[k], "utf8");
    const byHash = sha(now) === PRISTINE_SHA[k];
    const byContent = now === PRISTINE[k];
    report.push(`${k} restored: sha256 ${byHash ? "EQUAL" : "DIFFERENT"} · content ${byContent ? "IDENTICAL" : "DIFFERENT"}`);
    if (!byHash || !byContent) throw new Error(`RESTORE FAILED for ${k}`);
  }
  return report;
}

function arm(label, declared, keys, pairs, run, judge) {
  armsRun++;
  console.log(`\n=== ARM ${label}`);
  console.log(`    DECLARED — MUST FAIL:     ${declared.mustFail}`);
  console.log(`    DECLARED — MUST NOT FAIL: ${declared.mustNotFail}`);
  let result, err = null;
  try {
    for (const [k, ps] of Object.entries(pairs)) edit(k, ps);
    result = run();
  } catch (e) { err = e; }
  const restored = restore(keys);
  if (err) { armsWrong++; console.log(`    ARM ERRORED: ${err.message}`); restored.forEach((r) => console.log(`    ${r}`)); return; }
  const verdict = judge(result);
  console.log(`    ACTUAL: ${verdict.actual}`);
  console.log(`    ${verdict.ok ? "AS DECLARED" : "*** NOT AS DECLARED — this is a finding about the arm, recorded rather than smoothed"}`);
  if (!verdict.ok) armsWrong++;
  restored.forEach((r) => console.log(`    ${r}`));
}

/* ------------------------------------------------------------- the baseline */

console.log("=== BASELINE, measured before any arm ===");
const BASE = coverage();
const BASE_HYG = hygiene();
console.log(`    coverage --strict exit ${BASE.exit} · ${BASE.arms} arms · ${BASE.classified} classified · `
  + `corpus ${BASE.corpus} · ${BASE.unclassifiedCount} unclassified ${JSON.stringify(BASE.unclassifiedNamed)}`);
console.log(`    hygiene exit ${BASE_HYG.exit} · ${BASE_HYG.pass} pass, ${BASE_HYG.fail} fail`);
if (BASE.exit !== 0 || BASE_HYG.exit !== 0) {
  console.log("    BASELINE IS NOT GREEN — every arm below would be measuring something else. Stopping.");
  process.exit(1);
}

/* ------------------------------------------------------------------- arms */

/* (1) DELETE REAL ARMS. Three of `suggest.test.mjs`'s eight enumerated arms lose
   their ordinal, so the declaration states five. The tally must FALL and the
   FLOOR must FIRE — a tally that only ever rises is a ceiling, and a ceiling
   could never have caught D-233. */
arm("1 — THREE REAL ARMS DELETED FROM suggest.test.mjs",
  { mustFail: "coverage --strict exits 1, REGISTER FLOOR fires, arms fall 462 -> 459",
    mustNotFail: "suggest still DECLARES a control (no 'No declared control'); classified stays 119; corpus stays 120" },
  ["suggest"],
  { suggest: [["   (6) CHECK 6,", "   CHECK 6,"], ["   (7) F10,", "   F10,"], ["   (8) OVER-STRICTNESS,", "   OVER-STRICTNESS,"]] },
  coverage,
  (r) => ({
    ok: r.exit === 1 && r.floorFired && r.arms === BASE.arms - 3 && !r.undeclared
        && r.classified === BASE.classified && r.corpus === BASE.corpus,
    actual: `exit ${r.exit} · arms ${r.arms} (was ${BASE.arms}) · floor fired ${r.floorFired} · `
          + `classified ${r.classified} · corpus ${r.corpus} · undeclared-control reported ${r.undeclared}`,
  }));

/* (2) THE ARM THIS ITEM EXISTS FOR. `capture.test.mjs`'s single arm is rewritten
   with a transition marking the matcher was never taught. It must be COUNTED or
   NAMED as unclassified — NEVER scored zero in silence. */
arm("2 — AN ARM DECLARED IN A FORM THE MATCHER WAS NEVER TAUGHT (capture.test.mjs)",
  { mustFail: "coverage --strict exits 1 and NAMES capture.test.mjs as UNCLASSIFIED (the REGISTER: line fires)",
    mustNotFail: "capture must NOT read as 'No declared control', and must NOT be silently scored 0 — the unclassified count must RISE to 2" },
  ["capture"],
  { capture: [[CAP_DECL + " -> ", CAP_DECL + " ==> "]] },
  coverage,
  (r) => ({
    ok: r.exit === 1 && r.newUnclassifiedFired && !r.undeclared
        && r.unclassifiedCount === BASE.unclassifiedCount + 1
        && r.unclassifiedNamed.includes("capture.test.mjs"),
    actual: `exit ${r.exit} · unclassified ${r.unclassifiedCount} ${JSON.stringify(r.unclassifiedNamed)} · `
          + `new-unclassified gate fired ${r.newUnclassifiedFired} · undeclared-control reported ${r.undeclared} · `
          + `arms ${r.arms} (was ${BASE.arms})`,
  }));

/* (2b) THE POSITIVE HALF, because NAMING alone would be a walk that never counts
   anything new. A second arm is added to `capture.test.mjs` in a marking that
   file has never used — an ordinal list with NO arrow — and the tally must RISE.
   Nothing may fail. */
arm("2b — A NEW ARM IN AN ORDINAL LIST, NO ARROW ANYWHERE (capture.test.mjs)",
  { mustFail: "nothing — this is the positive half",
    mustNotFail: "coverage --strict stays exit 0; the tally RISES by exactly the arms added (462 -> 464); capture stays classified" },
  ["capture"],
  { capture: [[CAP_DECL, "NEGATIVE CONTROL: (1) disable the server-side integrity check in the capture"
    + " handler (2) blank the stamped digest and the same assertion fails on the other field"
    + " (3) drop the length header and the size assertion fails"]] },
  coverage,
  (r) => ({
    ok: r.exit === 0 && r.arms === BASE.arms + 2 && r.unclassifiedCount === BASE.unclassifiedCount
        && r.classified === BASE.classified,
    actual: `exit ${r.exit} · arms ${r.arms} (was ${BASE.arms}) · classified ${r.classified} · unclassified ${r.unclassifiedCount}`,
  }));

/* (3) NEUTER THE WALK — the ordinal matcher made unmatchable. The REACH arms in
   `hygiene.test.mjs` must fail as a DELTA with the corpus size printed, and the
   register must not report a triumphant figure over a corpus it can no longer
   read. */
arm("3 — THE ORDINAL MATCHER NEUTERED IN control-register.mjs",
  { mustFail: "hygiene FAILS, naming the arrowless-corpus arm and the strip-delta arm; coverage --strict exits 1 on the floor AND on newly-unclassified suites",
    mustNotFail: "the register must still READ 120 suites — a matcher narrowed to nothing must not report 100% over an empty corpus" },
  ["register"],
  { register: [["const ENUM = /(?:^|\\s)\\((\\d{1,2}[a-z]{0,2}|[a-z]{1,2}|[ivx]{1,4})\\)(?=\\s)/g;",
                "const ENUM = /(?!x)x/g;"]] },
  () => ({ h: hygiene(), c: coverage() }),
  ({ h, c }) => ({
    ok: h.exit === 1 && h.fail > 0 && c.exit === 1 && c.floorFired && c.newUnclassifiedFired && c.corpus === BASE.corpus,
    actual: `hygiene exit ${h.exit} ${h.pass}/${h.fail} — FAILED: ${JSON.stringify(h.named)} · `
          + `coverage exit ${c.exit} · arms ${c.arms} (was ${BASE.arms}) · classified ${c.classified} · `
          + `corpus ${c.corpus} · floor fired ${c.floorFired} · new-unclassified fired ${c.newUnclassifiedFired}`,
  }));

/* (4) OVER-STRICTNESS. Prose that MENTIONS an arm without declaring one must NOT
   be counted. A lone bracketed letter in a sentence is not a list. */
arm("4 — PROSE MENTIONING AN ARM, DECLARING NONE (capture.test.mjs)",
  { mustFail: "nothing at all",
    mustNotFail: "coverage --strict stays exit 0 and the tally does NOT move — 462 before, 462 after" },
  ["capture"],
  { capture: [[CAP_DECL, CAP_DECL + " — see (b) of the block at the foot of that other suite for the arm this one is modelled on —"]] },
  coverage,
  (r) => ({
    ok: r.exit === 0 && r.arms === BASE.arms && r.classified === BASE.classified,
    actual: `exit ${r.exit} · arms ${r.arms} (was ${BASE.arms}) · classified ${r.classified}`,
  }));

/* (5) THE FLOOR HAS NO SLACK. Exactly ONE arm removed, and it must fire. A floor
   with slack is not a ratchet — REC-71's census floor sat 19 codes low and had
   already flipped a control from RED to GREEN. */
arm("5 — EXACTLY ONE ARM REMOVED (strengthpair.test.mjs)",
  { mustFail: "coverage --strict exits 1 and the REGISTER FLOOR fires at 461 against a floor of 462",
    mustNotFail: "strengthpair stays classified and still declares a control" },
  ["strength"],
  { strength: [["(9) the state set defaulted", "the state set defaulted"]] },
  coverage,
  (r) => ({
    ok: r.exit === 1 && r.floorFired && r.arms === BASE.arms - 1 && r.classified === BASE.classified && !r.undeclared,
    actual: `exit ${r.exit} · arms ${r.arms} (was ${BASE.arms}) · floor fired ${r.floorFired} · classified ${r.classified}`,
  }));

/* ------------------------------------------------------------------ report */

console.log("\n=== RESTORE, FINAL — every file against its PRISTINE pre-arm copy ===");
for (const k of Object.keys(F)) {
  const now = readFileSync(F[k], "utf8");
  console.log(`    ${k}: sha256 ${sha(now) === PRISTINE_SHA[k] ? "EQUAL" : "DIFFERENT"} · content ${now === PRISTINE[k] ? "IDENTICAL" : "DIFFERENT"}`);
}
console.log(`\nregister.control: ${armsRun} arms run, ${armsWrong} behaved other than declared`);
process.exit(armsWrong ? 1 : 0);
