/* REC-113 / IC-116 — THE NEGATIVE CONTROL, IN ONE STEP.
 *
 *     node test/nc-rec113.mjs [arm|all]
 *
 * THE DRIVER LIVES INSIDE THIS WORKTREE, which is this project's practice for a
 * reason: an arm that edits source must restore it, and a restore is only
 * believable if it is MEASURED. Every arm here is armed ALONE with every other
 * defence held open, is DECLARED before it runs, passes an
 * anchor-occurs-EXACTLY-ONCE guard and a bytes-really-changed guard, and every
 * restore is verified by sha256 AND by `cmp` against a PRISTINE copy named
 * UNIQUELY PER ARM, with a byte count printed and a floor guarded.
 *
 * `git checkout -- <file>` IS NEVER USED TO UNDO AN ARM. It restores to HEAD,
 * not to what was here, and it exits 0 either way — this repository has twice
 * measured it silently discarding a session's own uncommitted work, once losing
 * a whole implementation. The arms `cp` aside and `cp` back.
 *
 * AN OPENING AND A CLOSING BASELINE BRACKET THE RUN, because a harness that
 * reported the same answer for every arm INCLUDING the baseline is on record
 * here, and without a baseline row six reds read exactly like six arms working.
 *
 * WHAT THE SUBJECT IS. This item widened `op=airunlog` to project
 * `result_kind` / `result_ref` and to STATE a per-row `coverage`. Its two
 * failures are not symmetric and the arms are built around that asymmetry:
 * under-stating (a row whose claim cannot be read at all — the defect) and
 * OVER-stating (a row read as `undetermined` when the record does know — which
 * is the record claiming LESS than it can support, and the arm that matters
 * more, because `accepts-when` says so in as many words).
 *
 * WHAT THESE ARMS CANNOT SEE, stated rather than left to be discovered: they are
 * local to this plane's source under miniflare. Nothing here exercises the real
 * account, a deploy, a second instance, or `agent-worker`'s live use of the op —
 * whose own suites MOCK `op=airunlog`, so a consumer break there would not
 * surface in this battery at all. The consumer census that covers that gap was
 * done by reading every call site and is recorded in this item's report, not
 * measured here.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { controlPen } from "./pen.mjs";
import { anchorTable } from "../scripts/anchortable.mjs";

const PEN = controlPen("rec113");
/* M0-182: a pristine copy is named for its subject's BASENAME inside the pen, never beside the subject. */
const penPath = (f, suffix) => `${PEN}/${f.split("/").pop()}.${suffix}`;

const ROOT   = fileURLToPath(new URL("../..", import.meta.url));
const STORE  = `${ROOT}bio-plane/src/store.mjs`;
const AIRUN  = `${ROOT}bio-plane/src/airun.mjs`;
const SUITE  = `${ROOT}bio-plane/test/observation-log.test.mjs`;
const IDENT  = `${ROOT}bio-plane/test/rec113-identity.mjs`;
const PRE    = process.env.REC113_PRECHANGE || "/tmp/rec113-pristine-agent-ab3bf809046a052e6";

/* FLOORS, so a truncated or emptied file cannot be restored "successfully".
   MEASURED on this tree 2026-09-17, not recalled. */
const FLOOR = { [STORE]: 2_000_000, [AIRUN]: 100_000 };

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* ---------------------------------------------------------------- *
 * THE ARMS. Each names the file, a UNIQUE anchor, its replacement, and
 * DECLARES before it runs what MUST fail and what MUST NOT.
 * ---------------------------------------------------------------- */
const ARMS = {
  /* (a) The row that distinguishes five-arms-broken from five-arms-working. */
  baseline: null,

  /* (b) THE ROW'S OWN ARM: remove the projection. The two columns leave the
         SELECT, so the referent is stored and invisible again — exactly the
         state REC-100 measured and refused to paper over. */
  projection: {
    file: STORE,
    find: `SELECT seq, at, level, subject, state, governed, condition, bound, terminal, detail,
              result_kind, result_ref
       FROM observation_log`,
    repl: `SELECT seq, at, level, subject, state, governed, condition, bound, terminal, detail
       FROM observation_log`,
    /* DECLARATION CORRECTED 2026-09-17 AFTER THE ARM REFUTED IT, AND THE
       CORRECTION IS THIS CONTROL'S MOST USEFUL RESULT.
       First declaration: MUST FAIL I2 I2b I2c I2d. ACTUAL: I2 and I2c only.
       I2b and I2d CAME BACK GREEN OVER A READ THAT PROJECTS NOTHING AT ALL, and
       that is a fact about those assertions rather than a fault in this arm.
       WHY, and it is this repository's own rule arriving inside its suite: with
       the columns gone, `e.result_ref` is `undefined`, so a row that HAS no
       referent reads `null / null / undetermined` — WHICH IS EXACTLY WHAT IT
       SHOULD READ. An assertion over a row with nothing to show cannot tell "the
       record has no referent for this row" from "the read dropped the column",
       because those two causes produce identical bytes. That is D-366's own
       shape one level up: an absence with two causes.
       THE CONSEQUENCE WORTH CARRYING: only an assertion over a row that HAS a
       referent can detect a missing projection. I2 and I2c are those arms, and
       this is the measurement that says they are load-bearing rather than
       decorative — a suite built only around the undetermined case would have
       passed over a read that projected nothing. */
    mustFail:    ["I2", "I2c"],
    mustNotFail: ["I2b", "I2d", "I2e", "I2f"],
    note: "I2e/I2f are PURE — they drive `observationCoverage` and `checkObservation` "
        + "directly and never touch the read, so they must survive this arm. I2b/I2d "
        + "survive for a DIFFERENT and more interesting reason: see the correction above.",
  },

  /* (c) PROJECTED BUT NOT STATED — the arm that separates this item's two
         halves. The columns come back; the sentence does not. If the suite
         still passed, the `coverage` field would be decoration and the row's
         "STATED as undetermined" would be satisfied by a null after all. */
  statement: {
    file: STORE,
    find: `                        coverage: observationCoverage({ state: e.state, resultRef: e.result_ref }) }));`,
    repl: `                        coverage: undefined }));`,
    mustFail:    ["I2", "I2b", "I2c", "I2d"],
    mustNotFail: ["I2e", "I2f"],
  },

  /* (d) THE COSTLY DIRECTION, ARM ONE: manufacture an unknown. Drop the state
         test so ANY row without a referent reads `undetermined` — a
         LOOKED_ABSENT row then says the record does not know something it does
         know. This is the arm `accepts-when` calls the one that matters. */
  manufacture: {
    file: AIRUN,
    find: `  if (state === "PRESENT") return OBSERVATION_COVERAGE_UNDETERMINED;
  return "none_owed";`,
    repl: `  return OBSERVATION_COVERAGE_UNDETERMINED;`,
    mustFail:    ["I2d", "I2e"],
    mustNotFail: ["I2", "I2b", "I2c", "I2f"],
    note: "I2/I2b/I2c must SURVIVE: a backed row still reads `backed` and a bare PRESENT "
        + "still reads `undetermined` under this mutation. An arm that reddened everything "
        + "would not have isolated the variable.",
  },

  /* (e) THE COSTLY DIRECTION, ARM TWO AND THE WORST ONE: ignore the referent
         entirely. Every row reads `undetermined`, including the rows the record
         CAN back. The identity driver's own must-fail arm is here too. */
  blind: {
    file: AIRUN,
    find: `  const named = resultRef != null && String(resultRef) !== "";
  if (named) return "backed";`,
    repl: `  const named = false;
  if (named) return "backed";`,
    mustFail:    ["I2", "I2c", "I2e"],
    mustNotFail: ["I2b", "I2f"],
    identityMustFail: true,
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).filter(([, a]) => a).map(([arm, a]) => ({ arm, file: a.file, find: a.find, put: a.repl })));

/* ---------------------------------------------------------------- *
 * THE RUNNERS
 * ---------------------------------------------------------------- */
function runSuite() {
  const r = spawnSync(process.execPath, [SUITE], { cwd: `${ROOT}bio-plane`, encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  /* THE FOOT IS CHECKED, NOT THE TALLY ALONE. A TypeError inside an assertion
     goes through NO assertion at all: it ends the module while the count reads
     clean. A missing tally is reported as -1 and never as 0. */
  const m = out.match(/observation-log: (\d+) pass, (\d+) fail/);
  const failedNames = [...out.matchAll(/^ {2}FAIL {2}(I2[a-f]?|C\d+|[A-Z]\d+[a-z]?):/gm)]
    .map((x) => x[1]);
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, reachedFoot: !!m,
           exit: r.status, failedNames: [...new Set(failedNames)] };
}

function runIdentity() {
  if (!existsSync(`${PRE}/bio-plane/src/index.mjs`)) return { exit: null, skipped: true };
  const r = spawnSync(process.execPath, [IDENT, PRE], { cwd: `${ROOT}bio-plane`, encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  return { exit: r.status, skipped: false,
           failed: [...out.matchAll(/^ {2}FAIL {2}(.{0,70})/gm)].map((x) => x[1].trim()) };
}

function armOne(name) {
  const arm = ARMS[name];
  if (!arm) return { name, ...runSuite(), identity: runIdentity(), armed: false };

  const { file, find, repl } = arm;
  const keep = penPath(file, `pristine-rec113-${name}`);
  copyFileSync(file, keep);
  const before = readFileSync(file, "utf8");
  const beforeSha = sha(file);

  /* ANCHOR OCCURS EXACTLY ONCE. An anchor that matches twice mutates a second
     site nobody declared; one that matches zero times is an arm that DID NOT
     ARM, which is a finding and not a pass. */
  const hits = before.split(find).length - 1;
  if (hits !== 1) {
    unlinkSync(keep);
    return { name, armed: false, error: `ANCHOR MATCHED ${hits} TIMES, expected exactly 1 — `
           + `this arm DID NOT ARM and its result would be meaningless` };
  }

  const after = before.replace(find, repl);
  if (after === before) {
    unlinkSync(keep);
    return { name, armed: false, error: "the replacement changed NO BYTES — arm did not arm" };
  }
  writeFileSync(file, after);

  let result;
  try {
    result = { name, armed: true, ...runSuite(), identity: runIdentity() };
  } finally {
    /* RESTORE, THEN MEASURE THE RESTORE. Two ways, because one of them has been
       fooled before: sha256 AND `cmp`, against the per-arm pristine copy. */
    copyFileSync(keep, file);
    const bytes = readFileSync(file).length;
    const okSha = sha(file) === beforeSha;
    let okCmp = false;
    try { execFileSync("cmp", ["-s", file, keep]); okCmp = true; } catch { okCmp = false; }
    const okFloor = bytes >= FLOOR[file];
    result = result || { name, armed: true };
    result.restore = { bytes, sha256: okSha, cmp: okCmp, aboveFloor: okFloor,
                       byteIdentical: okSha && okCmp && okFloor };
    unlinkSync(keep);
  }
  return result;
}

/* ---------------------------------------------------------------- */
const want = process.argv[2] || "all";
const order = want === "all"
  ? ["baseline", "projection", "statement", "manufacture", "blind", "baseline"]
  : [want];

console.log(`REC-113 / IC-116 — negative control`);
console.log(`  pre-change checkout for the identity arm: ${PRE}`
          + `${existsSync(`${PRE}/bio-plane/src/index.mjs`) ? "" : "  (ABSENT — identity arm SKIPPED)"}`);
console.log("");

let seen = 0;
for (const name of order) {
  const label = name === "baseline" && seen++ ? "baseline (closing)" : name;
  const r = armOne(name);
  const arm = ARMS[name];
  console.log(`--- ${label} ---`);
  if (r.error) { console.log(`  DID NOT ARM: ${r.error}`); continue; }
  if (arm) {
    console.log(`  declared MUST FAIL     : ${arm.mustFail.join(" ")}`);
    console.log(`  declared MUST NOT FAIL : ${arm.mustNotFail.join(" ")}`);
  }
  console.log(`  suite    : ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`
            + `${r.reachedFoot ? "" : "   *** SUITE DID NOT REACH ITS FOOT — tally reported as -1 ***"}`);
  if (r.failedNames?.length) console.log(`  FAILED BY NAME : ${r.failedNames.join(" ")}`);
  if (r.identity && !r.identity.skipped)
    console.log(`  identity : exit ${r.identity.exit}`
              + `${r.identity.failed?.length ? `  (${r.identity.failed.length} arm(s) red)` : ""}`);
  if (r.restore)
    console.log(`  restored : ${r.restore.bytes} bytes · sha256 ${r.restore.sha256 ? "OK" : "MISMATCH"}`
              + ` · cmp ${r.restore.cmp ? "OK" : "DIFFERS"} · above floor `
              + `${r.restore.aboveFloor ? "yes" : "NO"} · byte-identical: `
              + `${r.restore.byteIdentical ? "YES" : "**NO**"}`);
  if (arm) {
    const missing = arm.mustFail.filter((n) => !r.failedNames.includes(n));
    const extra   = arm.mustNotFail.filter((n) => r.failedNames.includes(n));
    console.log(`  VERDICT  : ${(!missing.length && !extra.length) ? "AS DECLARED"
      : `NOT AS DECLARED — did not fail [${missing.join(" ") || "-"}]`
        + ` · unexpectedly failed [${extra.join(" ") || "-"}]`}`);
    if (arm.note) console.log(`  note     : ${arm.note}`);
  }
  console.log("");
}
