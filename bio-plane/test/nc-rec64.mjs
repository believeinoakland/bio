#!/usr/bin/env node
/* nc-rec64.mjs — REC-64's NEGATIVE CONTROL HARNESS. Lives INSIDE this worktree,
 * never in a shared scratchpad, because a control that writes outside its own
 * tree is a control another session can be destroyed by.
 *
 * FOUR ARMS, EACH ARMED ALONE WITH THE OTHERS HELD OPEN. That is not
 * ceremony: an arm armed alongside another cannot tell you which one the
 * failure came from, and this project has already recorded a control that was
 * ARMED WRONG AND CAUGHT ITSELF (a duplicate key inserted BEFORE the real one
 * does nothing, since the later key wins — the guard was right to pass).
 *
 * EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT (`cmp`), against a
 * PRISTINE copy taken before the arm was armed. UI-38's harness once reported a
 * BYTE-IDENTICAL RESTORE over a file that had NOT been restored, which is why
 * one check is not enough.
 *
 * WHAT EACH ARM DECLARES IS WRITTEN BEFORE IT RUNS, and the run either matches
 * the declaration or the arm is reported as a FINDING ABOUT THE INSTRUMENT
 * rather than smoothed. A surprising green is a finding about the arm.
 *
 *     node bio-plane/test/nc-rec64.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
const P = {
  store:   path.join(ROOT, "bio-plane", "src", "store.mjs"),
  catalog: path.join(ROOT, "bio-plane", "checks", "bio-checks.mjs"),
  guard:   path.join(ROOT, "civicos-ui", "check-refusal-codes.mjs"),
};
const PRISTINE = path.join(HERE, ".nc-rec64-pristine");

const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

/* THE TWO SUBJECTS. Each returns {exit, out}. Neither is piped — a pipe reports
   the LAST command's status and this project recorded a false `exit 0` that way. */
const runGuard = () => {
  try {
    const out = execFileSync("node", [path.join(ROOT, "civicos-ui", "test", "run.mjs")],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { exit: 0, out };
  } catch (e) { return { exit: e.status ?? -1, out: `${e.stdout || ""}${e.stderr || ""}` }; }
};
const runSuite = () => {
  try {
    const out = execFileSync("node", [path.join(HERE, "machinefences-dec49.test.mjs")],
      { cwd: path.join(ROOT, "bio-plane"), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { exit: 0, out };
  } catch (e) { return { exit: e.status ?? -1, out: `${e.stdout || ""}${e.stderr || ""}` }; }
};

/* ---------------------------------------------------------------- scaffolding */
fs.rmSync(PRISTINE, { recursive: true, force: true });
fs.mkdirSync(PRISTINE, { recursive: true });
const baseline = {};
for (const [k, f] of Object.entries(P)) {
  fs.copyFileSync(f, path.join(PRISTINE, k));
  baseline[k] = sha(f);
}

const results = [];
function arm({ n, name, declare, file, mutate, expect }) {
  console.log(`\n${"=".repeat(78)}\nARM ${n} — ${name}`);
  console.log(`  DECLARED BEFORE ARMING:\n${declare.split("\n").map((l) => "    " + l).join("\n")}`);
  const f = P[file];
  const before = fs.readFileSync(f, "utf8");
  const mutated = mutate(before);
  if (mutated === before) {
    console.log("  !! THE MUTATION DID NOT CHANGE THE FILE. The arm is ARMED WRONG and is reported as\n"
              + "     such rather than as a pass — this is the duplicate-key shape that caught itself.");
    results.push({ n, name, verdict: "ARMED WRONG (no-op mutation)" });
    return;
  }
  fs.writeFileSync(f, mutated);
  let observed;
  try { observed = expect(); }
  finally {
    /* RESTORE, THEN PROVE THE RESTORE TWICE. */
    fs.copyFileSync(path.join(PRISTINE, file), f);
    const okSha = sha(f) === baseline[file];
    let okContent = false;
    try { execFileSync("cmp", ["-s", f, path.join(PRISTINE, file)]); okContent = true; } catch (_) {}
    console.log(`  RESTORE: sha256 ${okSha ? "MATCHES" : "*** DOES NOT MATCH ***"} · `
              + `cmp ${okContent ? "byte-identical" : "*** DIFFERS ***"} (against the pristine pre-arm copy)`);
    if (!okSha || !okContent) { console.log("  !! RESTORE FAILED — stop and fix the tree by hand."); process.exit(2); }
  }
  console.log(`  OBSERVED: ${observed.summary}`);
  console.log(`  VERDICT:  ${observed.ok ? "AS DECLARED" : "*** NOT AS DECLARED — this is a finding ***"}`);
  results.push({ n, name, verdict: observed.ok ? "as declared" : "NOT AS DECLARED", detail: observed.summary });
}

/* ============================================================ THE BASELINE */
console.log("BASELINE (all arms held open) — both subjects must be GREEN before anything is armed.");
{
  const g = runGuard(), s = runSuite();
  console.log(`  guard exit ${g.exit} · suite exit ${s.exit}`);
  if (g.exit !== 0 || s.exit !== 0) {
    console.log("  !! The tree is not green. Every arm below would be uninterpretable. Stopping.");
    process.exit(2);
  }
}

/* ==================================================================== ARM 1 */
arm({
  n: 1,
  name: "A REFUSABLE CONDITION WITH NO TRANSLATION, planted at a GOVERNED SITE "
      + "(the guard the ruling calls not optional)",
  declare:
    "MUST FAIL: `node civicos-ui/test/run.mjs` exits NON-ZERO, and the failure NAMES the file,\n"
  + "  the line, the enclosing function, the region and the offending code — not merely a count.\n"
  + "MUST NOT: the failure must not be about anything else. If the guard fails for a reason that\n"
  + "  does not name the planted code, the arm has measured the wrong thing.\n"
  + "WHY THIS IS THE SHARP ONE: DEC-49 licenses a surface to render an AUTHORED translation only\n"
  + "  because an untranslated code FAILS THE HARNESS rather than reaching a member. If this arm\n"
  + "  comes back green, the ruling is unsafe and the whole item is decoration.",
  file: "store",
  mutate: (src) => src.replace(
    '    if (!concl)\n      return { ok: false, reason: "NO_CONCLUSION",',
    '    if (concl === "nc-rec64") return { ok: false, reason: "NC_REC64_UNTRANSLATED" };\n'
  + '    if (!concl)\n      return { ok: false, reason: "NO_CONCLUSION",'),
  expect: () => {
    const g = runGuard();
    const names = /NC_REC64_UNTRANSLATED/.test(g.out) && /store\.mjs:\d+/.test(g.out)
               && /in conclude/.test(g.out) && /is-conclude-answer/.test(g.out);
    return { ok: g.exit !== 0 && names,
             summary: `guard exit ${g.exit}; names the planted code ${names ? "WITH" : "WITHOUT"} `
                    + `file:line, function and region` };
  },
});

/* ==================================================================== ARM 2 */
arm({
  n: 2,
  name: "A SURFACE MADE TO COMPUTE A REFUSAL RATHER THAN RECEIVE ITS CODE (DEC-8)",
  declare:
    "MUST FAIL: the suite's BLOCK C fails, and the failing arm's own text NAMES DEC-8 — because\n"
  + "  DEC-8's protection is the one DEC-49 amended in wording and left intact in substance.\n"
  + "MUST NOT: BLOCK A and BLOCK B must be unaffected. The eleven fences are still translated;\n"
  + "  what this arm removes is the plane SENDING the sentence, so a surface would have to look\n"
  + "  one up or compose one — which is computing a refusal.\n"
  + "MECHANISM: strip `translation:` from the run-open door's refusal, leaving the code. The code\n"
  + "  is still RECEIVED; the sentence is not. That is exactly the half DEC-8 forbids a surface\n"
  + "  from supplying for itself.",
  file: "store",
  mutate: (src) => src.replace(
    "               translation: ACT_SHAPE_CHECKS.AI_RUN_CAPABILITY_UNAVAILABLE.translation,\n", ""),
  expect: () => {
    const s = runSuite();
    const c2 = /FAIL\s+ARM C2:[^\n]*DEC-8/.test(s.out);
    const aOk = !/FAIL\s+ARM A/.test(s.out) && !/FAIL\s+ARM B/.test(s.out);
    return { ok: s.exit !== 0 && c2 && aOk,
             summary: `suite exit ${s.exit}; ARM C2 ${c2 ? "FAILED naming DEC-8" : "did NOT fail"}; `
                    + `blocks A and B ${aOk ? "unaffected" : "ALSO failed — the arm is not isolated"}` };
  },
});

/* ==================================================================== ARM 3 */
arm({
  n: 3,
  name: "THE WALK THAT ENUMERATES REFUSABLE CONDITIONS, NEUTERED (matcher M2)",
  declare:
    "MUST FAIL: the guard exits NON-ZERO on a FLOOR — the census or the reach SHRANK — and the\n"
  + "  failure PRINTS THE CORPUS SIZE so the delta is a measurement rather than an impression.\n"
  + "MUST NOT: it must not fail only on the ceiling. A ceiling alone cannot see a walk that has\n"
  + "  gone blind — REC-70's neutered walk sat GREEN at 0 of 40 — and the whole reason every\n"
  + "  figure here carries a floor is that failure mode.\n"
  + "WHY M2: it is the widest matcher and the one that EARNED the matcher set. Neutering it once\n"
  + "  before, at PL-1, took the census 341 -> 325 and the guard PASSED, because the floor had\n"
  + "  19 codes of slack. This arm re-runs that experiment against floors moved in the same turn.",
  file: "guard",
  mutate: (src) => src.replace(
    "  'M2 reason:<expr>':  src => {\n    const out = new Set();",
    "  'M2 reason:<expr>':  src => {\n    const out = new Set(); return out; /* nc-rec64 arm 3 */"),
  expect: () => {
    const g = runGuard();
    const floorFail = /the plane census is \d+ refusal codes, floor is \d+/.test(g.out)
                   || /the reach is \d+ codes, floor is \d+/.test(g.out);
    const printsCorpus = /walk: M2 reason:<expr>\s+\d+ codes/.test(g.out)
                      && /UNION \(the census\)\s+\d+ codes/.test(g.out);
    const m2 = /walk: M2 reason:<expr>\s+(\d+) codes/.exec(g.out);
    const union = /UNION \(the census\)\s+(\d+) codes/.exec(g.out);
    return { ok: g.exit !== 0 && floorFail && printsCorpus,
             summary: `guard exit ${g.exit}; FLOOR failure ${floorFail ? "present" : "ABSENT"}; `
                    + `corpus printed ${printsCorpus ? "yes" : "NO"} — M2 yielded ${m2 ? m2[1] : "?"} `
                    + `(was 304), union ${union ? union[1] : "?"} (was 406)` };
  },
});

/* ==================================================================== ARM 4 */
arm({
  n: 4,
  name: "OVER-STRICTNESS — a correctly coded-and-translated refusal phrased UNLIKE ANYTHING "
      + "REC-64 WROTE must PASS",
  declare:
    "MUST NOT FAIL: the guard exits 0 and the suite exits 0. The translation below is in SPANISH,\n"
  + "  which is VF-2's own standard for this arm and is deliberate: a guard that only accepts the\n"
  + "  voice its author happened to use is a guard that will be switched off the first time\n"
  + "  somebody writes a good sentence differently.\n"
  + "MUST STILL HOLD: it is a REAL translation — over 40 characters, six or more words, no machine\n"
  + "  vocabulary inside it, and not a copy of another row's. The arm tests TOLERANCE OF VOICE,\n"
  + "  not tolerance of rubbish, and a guard that accepted an empty string would be failing the\n"
  + "  other way.\n"
  + "IF THIS ARM COMES BACK RED the guard is over-strict and the finding is about the instrument.",
  file: "catalog",
  mutate: (src) => src.replace(
    "    translation: 'A project always has at least one owner, so the last one cannot be removed — the '\n"
  + "      + 'result would be work nobody is answerable for. Add another owner first, or stand the '\n"
  + "      + 'project down.',",
    "    translation: 'Un proyecto siempre tiene al menos una persona responsable, asi que no se puede '\n"
  + "      + 'quitar a la ultima: el resultado seria un trabajo del que nadie responde. Anada otra '\n"
  + "      + 'persona responsable primero, o cierre el proyecto.',"),
  expect: () => {
    const g = runGuard(), s = runSuite();
    return { ok: g.exit === 0 && s.exit === 0,
             summary: `guard exit ${g.exit}, suite exit ${s.exit} — a Spanish-voiced, correctly coded `
                    + `and translated refusal ${g.exit === 0 && s.exit === 0 ? "PASSES" : "was REFUSED"}` };
  },
});

/* ================================================================= THE CLOSE */
console.log(`\n${"=".repeat(78)}\nFINAL STATE — every file back to its pre-arm bytes, proved twice:`);
let clean = true;
for (const [k, f] of Object.entries(P)) {
  const okSha = sha(f) === baseline[k];
  let okContent = false;
  try { execFileSync("cmp", ["-s", f, path.join(PRISTINE, k)]); okContent = true; } catch (_) {}
  clean = clean && okSha && okContent;
  console.log(`  ${k.padEnd(8)} sha256 ${okSha ? "ok" : "MISMATCH"} · cmp ${okContent ? "ok" : "DIFFERS"}`);
}
const post = runGuard(), postS = runSuite();
console.log(`  and RE-RUN after restore: guard exit ${post.exit}, suite exit ${postS.exit}`);

console.log(`\n${"=".repeat(78)}\nSUMMARY`);
for (const r of results) console.log(`  ARM ${r.n}: ${r.verdict}${r.detail ? ` — ${r.detail}` : ""}`);
fs.rmSync(PRISTINE, { recursive: true, force: true });
const bad = results.filter((r) => r.verdict !== "as declared");
console.log(bad.length ? `\n${bad.length} arm(s) DID NOT MATCH their declaration — that is a finding about `
                       + `the instrument and must be recorded, not smoothed.`
                       : `\nAll ${results.length} arms behaved as declared.`);
process.exit(clean && post.exit === 0 && postS.exit === 0 && !bad.length ? 0 : 1);
