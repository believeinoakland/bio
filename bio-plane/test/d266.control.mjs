/* D-266 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — PL-3's `suggest.control.mjs` precedent, taken
 * up by PL-4, PL-13, PL-14 and PL-15.
 *
 * THE PEN LIVES INSIDE THIS WORKTREE, never in the shared scratchpad, which is
 * not isolated between sessions: a harness silently replaced between ARM and
 * RESTORE reports a restore it never performed. `.d266-harness/` is gitignored
 * for its own stated reason.
 *
 * EVERY ARM RUNS **BOTH** SUITES, and that is this driver's own shape rather
 * than an inherited one. D-266's subject spans two feeds that must agree —
 * `op=proposals` has always published a disposition and `op=queue` did not —
 * so an arm that only re-ran the suite it expects to break could not show that
 * it broke NOTHING ELSE. The must-not-fail lists below therefore name
 * assertions in the OTHER suite on purpose.
 *
 * EVERY RESTORE IS VERIFIED by sha256, by CONTENT, and by `cmp` against a
 * per-arm pristine copy named with the ARM ID as well as the path, plus a
 * pristine-of-record taken before any arm ran.
 *
 * EVERY ARM IS ARMED **ALONE**, with every other defence HELD OPEN, and
 * DECLARES BEFORE IT RUNS what must fail and what must NOT.
 *
 * AND AN ARM THAT COMES BACK GREEN WHEN RED WAS PREDICTED IS A FINDING ABOUT
 * THE ARM, recorded rather than smoothed.
 *
 * Run it:  cd bio-plane && node test/d266.control.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = { store: ROOT + "src/store.mjs" };
const SUITES = ["proposedispose.test.mjs", "current.test.mjs"];
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

/* THE FLOOR ON THE PRISTINE COPIES. A harness has reported a restore
   byte-identical over an EMPTY manifest, caught only because a digest read
   `e3b0c442…`, the sha256 of the empty string. So the sizes are PRINTED and
   floored before anything is armed. */
for (const [k, v] of Object.entries(ORIGINAL)) {
  console.log(`  pristine ${k}: ${v.length} bytes · sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
  if (v.length < 100000) { console.log(`  ** ${k} is implausibly small; refusing to arm over it`); process.exit(1); }
}

const PEN = ROOT + "../.d266-harness/pen";
rmSync(PEN, { recursive: true, force: true });
mkdirSync(PEN, { recursive: true });
for (const [k, p] of Object.entries(F)) copyFileSync(p, join(PEN, `record.${k}`));

let armsRun = 0, armsWrong = 0;

function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 900000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  /* A suite that THREW has NO tally and is reported as `-1`, never `0`: a thrown
     module and a module with zero failures are different claims, and a
     TypeError inside an assertion goes through no assertion at all while the
     tally reads clean. */
  const m = /(\d+) pass(?:ed)?, (\d+) (?:FAIL|fail(?:ed)?)/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 160));
  return m ? { name, pass: +m[1], fail: +m[2], named } : { name, pass: -1, fail: -1, named };
}
const runAll = () => SUITES.map(runSuite);

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

function arm(id, title, edits, mustFail, mustNotFail = [], expectGreen = false) {
  armsRun++;
  console.log(`\n=== (${id}) ${title}`);
  for (const k of Object.keys(F)) copyFileSync(F[k], join(PEN, `arm${id}.${k}`));
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const rs = runAll();
    for (const r of rs) {
      console.log(`  MEASURED ${r.name}: ${r.pass} pass, ${r.fail} fail`
        + (r.fail === -1 ? "  ** NO TALLY — the suite THREW rather than failing, reported as -1" : ""));
      for (const n of r.named) console.log(`    FAILED: ${n}`);
    }
    const hit = (frag) => rs.some((r) => r.named.some((n) => n.includes(frag)));
    const anyThrew = rs.some((r) => r.fail === -1);
    const totalFail = rs.reduce((a, r) => a + Math.max(0, r.fail), 0);
    let wrong = false;
    for (const frag of mustFail)
      if (!hit(frag) && !anyThrew) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
    if (expectGreen) {
      if (totalFail !== 0 || anyThrew) { console.log("  ** WRONG: this is an OVER-STRICTNESS arm and MUST stay green — correct work in a spelling the item did not anticipate must PASS"); wrong = true; }
      else console.log("  as declared: GREEN across both suites. A correct wiring in an unanticipated spelling is not refused.");
    } else if (totalFail === 0 && !anyThrew) {
      console.log("  ** WRONG: both suites stayed GREEN. A control that cannot fail proves nothing.");
      wrong = true;
    }
    if (wrong) armsWrong++; else console.log("  as declared.");
  } finally {
    restoreAll(id);
  }
}

console.log("\nD-266 — negative controls. THE BASELINE FIRST, so every arm is a DELTA and a run in which\n"
          + "every arm is broken is distinguishable from one in which every arm works.");
const base = runAll();
for (const r of base) console.log(`  BASELINE ${r.name}: ${r.pass} pass, ${r.fail} fail`);
if (base.some((r) => r.fail !== 0)) {
  console.log("  ** the tree is not whole; every arm below would measure the wrong thing");
  process.exit(1);
}

/* ============ (1) THE PUBLICATION NEUTERED — THE BLOCK IS THERE AND EMPTY === */

arm("1", "PUBLISH THE BLOCK AND PUT NOTHING IN IT. `disposedOut` is built over an empty array, so "
  + "op=queue answers with `disposed: { count: 0, findings: [] }` for a member who HAS dismissed a "
  + "finding. This is the subtle half of the defect and the reason two arms exist rather than one: "
  + "the block is present, the sparse sentence is intact, and the answer is a LIE about what the "
  + "record holds. "
  + "DECLARED MUST FAIL: the published-decision arm, the published-identity arm and the "
  + "re-decided arm. MUST NOT FAIL: the BEFORE arm (which asserts an empty block and is therefore "
  + "blind to this — stated so the arm's own limit is on the record), the ageing arm, and "
  + "op=proposals' own dispositions[] arm, which keeps working and is exactly why this defect "
  + "survived: one feed had it right the whole time.",
  [["store", `    const disposedOut = dispAll.slice(0, dispCap).map((d) => ({`,
              `    const disposedOut = [].map((d) => ({`]],
  ["AND IT IS NOW SAID", "THE PUBLISHED IDENTITY IS THE ITEM'S OWN", "a RE-DECIDED finding keeps ONE published decision"],
  ["before any disposition, op=queue carries BOTH findings as open items",
   "the `disposed` block is PRESENT AND EMPTY",
   "the dismissed finding is GONE FROM THE OPEN ITEMS",
   "the dismissed proposal is AGED into dispositions[]"]);

/* ====== (2) THE SHARP ONE — KEYED ON THE READ INSTEAD OF THE IDENTITY ====== */

arm("2", "KEY THE PUBLISHED DECISION ON THE ACT'S CIRCUMSTANCES RATHER THAN THE FINDING'S IDENTITY. "
  + "The id becomes decider-and-instant instead of `FINDING::<progression>::<stage>`. Everything a "
  + "reader can SEE is still there — the state, the member's reason, who and when — and the one "
  + "thing that makes the ruling true is gone: a surface can no longer tie the decision to the "
  + "thing it removed, and a decision keyed on when it was taken is a decision that cannot be "
  + "re-triaged as the same decision. THIS IS THE ARM THE WHOLE ITEM TURNS ON. "
  + "DECLARED MUST FAIL: the published-identity arm. MUST NOT FAIL: the published-decision arm, "
  + "the personal-false arm and the detail arm — so the control distinguishes 'publishes "
  + "something' from 'publishes the identity', which a single arm could not.",
  [["store", '      id: `FINDING::${d.key}`,', '      id: `FINDING::${d.decided_by}::${d.at}`,']],
  ["THE PUBLISHED IDENTITY IS THE ITEM'S OWN"],
  ["AND IT IS NOW SAID",
   "the two ways this feed gets shorter SAY WHOSE ACT SHORTENED IT",
   "the answer does NOT claim the underlying gap is closed"]);

/* ================ (3) THE REVERT — NO BLOCK AT ALL ======================== */

arm("3", "THE PRE-D-266 ANSWER, RESTORED. The envelope publishes the block under a name no reader "
  + "asks for, so `q.disposed` is `undefined` — which is the shape this op had yesterday: the "
  + "dismissed finding is simply not in the answer and nothing says why. "
  + "DECLARED MUST FAIL: the BEFORE arm as well as every publication arm, and THAT is the arm's "
  + "whole point beside arm 1 — an ABSENT block and an EMPTY one are different facts, arm 1 breaks "
  + "only the second, and a member must be able to tell 'the record looked and holds none' from "
  + "'this plane cannot say'. MUST NOT FAIL: the ageing arm and the over-strictness arm, because "
  + "reverting the publication must not disturb what the feed was already right about.",
  [["store", `      disposed: {
        personal: false,`,
              `      disposed_not_read_by_anybody: {
        personal: false,`]],
  ["the `disposed` block is PRESENT AND EMPTY", "AND IT IS NOW SAID",
   "THE PUBLISHED IDENTITY IS THE ITEM'S OWN",
   "the two ways this feed gets shorter SAY WHOSE ACT SHORTENED IT"],
  ["the dismissed finding is GONE FROM THE OPEN ITEMS",
   "OVER-STRICTNESS: the UNdismissed finding is untouched"]);

/* ============ (4) THE FOLDED GAP — THE SILENCE MADE SILENT AGAIN ========== */

arm("4", "REPORT THE UNATTRIBUTABLE READINGS AS NONE. The count the producer computed is thrown "
  + "away at the return, so the feed says it attributed everything it met. Nothing about the ITEMS "
  + "changes — no reading is announced, no team is invented — which is precisely the state D-266 "
  + "found: correct silence, indistinguishable from having nothing to be silent about. "
  + "DECLARED MUST FAIL: the counted-silence arm in current.test.mjs. MUST NOT FAIL: the "
  + "run-less-version arm, the two-items arm, and every arm in proposedispose.test.mjs — the two "
  + "halves of this item are independent and the arm proves it.",
  [["store", `    out.unattributed = unattributed;`, `    out.unattributed = 0;`]],
  ["THE SILENCE IS COUNTED"],
  ["TWO items and not three", "the run-less version is absent for a REASON THE PRODUCER PUBLISHES",
   "the count did NOT come at the price of an invented item",
   "AND IT IS NOW SAID"]);

/* ==== (5) COUNT ONE BRANCH OF THE SILENCE AND NOT THE OTHER ============== */

arm("5", "COUNT THE HAND-COMPOSED READINGS AND NOT THE ONES WHOSE RUN SAT SOMEWHERE ELSE. The "
  + "second increment is removed, so the answer is 1 where the truth is 2. This is the arm that "
  + "makes the exact figure in the suite worth writing: a count asserted only as 'at least one' "
  + "would pass over a producer that found the obvious half and dropped the other, and the fixture "
  + "for the second half did not exist until this item wrote it. "
  + "DECLARED MUST FAIL: the counted-silence arm. MUST NOT FAIL: the two-items arm and the "
  + "no-invented-item arm, since the ITEMS are unaffected by how the silence is counted.",
  [["store", `        if (!from) {
          unattributed += 1;`,
              `        if (!from) {
          unattributed += 0;`]],
  ["THE SILENCE IS COUNTED"],
  ["TWO items and not three", "the count did NOT come at the price of an invented item"]);

/* ================= (6) OVER-STRICTNESS — AND IT PASSES ==================== */

arm("6", "OVER-STRICTNESS, AND IT MUST STAY GREEN. `#findingsStanceDiverged` is re-wired through a "
  + "LOCAL instead of being spread directly into `items` — correct code, in the second of the two "
  + "forms the language offers, and a form this producer does not use today. It is aimed straight "
  + "at the pin D-266 had to correct: `current.test.mjs`'s producer-wiring arm used to require the "
  + "literal `items.push(...this.#findingsX(`, and a correct wiring failed it. If the corrected "
  + "matcher has merely traded one spelling for two, this arm goes red and says so. "
  + "DECLARED: BOTH SUITES GREEN. A fence tighter than its rule is not a safer fence.",
  [["store", `    items.push(...this.#findingsStanceDiverged(viewer, now));`,
              `    const stanceItems = this.#findingsStanceDiverged(viewer, now);
    items.push(...stanceItems);`]],
  [], [], true);

console.log(`\n=== D-266 controls: ${armsRun} arm(s) run, ${armsWrong} NOT as declared.`);
if (armsWrong === 0) rmSync(ROOT + "../.d266-harness/pen", { recursive: true, force: true });
process.exit(armsWrong ? 1 : 0);
