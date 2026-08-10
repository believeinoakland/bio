/* D-267 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — PL-3's `suggest.control.mjs` precedent, taken
 * up by PL-4, PL-13, PL-14 and PL-15.
 *
 * THE PEN LIVES INSIDE THIS WORKTREE and never in a shared scratchpad, and
 * `.d267-harness/` is gitignored for the reason written at the ignore line: an
 * interrupted driver must not leave an untracked file that becomes somebody
 * else's corpus.
 *
 * EVERY RESTORE IS VERIFIED THREE WAYS — by sha256, by CONTENT, and by `cmp`
 * against a per-arm pristine copy named with the ARM ID as well as the path,
 * plus a pristine-of-record taken before any arm ran.
 *
 * EVERY ARM IS ARMED **ALONE**, with every other defence HELD OPEN, and every
 * arm DECLARES BEFORE IT RUNS what must fail and what must NOT. Arms (A) and (B)
 * take the two halves of one method apart on purpose: this item found that the
 * BASIS half had the identical blindness and nothing had named it, so an arm
 * that broke both together could not tell a half-fix from a whole one.
 *
 * TWO SUITES ARE DRIVEN, not one. `severedhomes.test.mjs` is this item's own;
 * `current.test.mjs` carries PL-13's three pins, CORRECTED by this item, and an
 * arm that reopens the defect must take those back down or the corrections were
 * decoration.
 *
 * AND AN ARM THAT COMES BACK GREEN WHEN RED WAS PREDICTED IS A FINDING ABOUT THE
 * ARM, recorded rather than smoothed. Arm (D) is declared green in advance for
 * exactly that reason.
 *
 * Run it:  node test/severedhomes.control.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = { store: ROOT + "src/store.mjs" };
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

/* THE FLOOR ON THE PRISTINE COPIES. A harness has reported a restore
   byte-identical over an EMPTY manifest, caught only because a digest read
   `e3b0c442…` — the sha256 of the empty string. So the sizes are printed and
   floored before anything is armed. */
for (const [k, v] of Object.entries(ORIGINAL)) {
  console.log(`  pristine ${k}: ${v.length} bytes · sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
  if (v.length < 2000) { console.log(`  ** ${k} is implausibly small; refusing to arm over it`); process.exit(1); }
}

const PEN = ROOT + "../.d267-harness";
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
     `TypeError` inside an assertion goes through no assertion at all while the
     tally reads clean. */
  const m = /(\d+) pass(?:ed)?, (\d+) (?:FAIL|fail(?:ed)?)/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 170));
  return m ? { pass: +m[1], fail: +m[2], named, out }
           : { pass: -1, fail: -1, named, out };
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

/* `suites` is [{name, mustFail[], mustNotFail[]}]. An arm names its expectation
   PER SUITE, because this item's whole point is that one defect shows up in two
   places and correcting the pins in the second is half the work. */
function arm(id, title, edits, suites, expectGreen = false) {
  armsRun++;
  console.log(`\n=== (${id}) ${title}`);
  for (const [k] of edits) copyFileSync(F[k], join(PEN, `arm${id}.${k}`));
  for (const k of Object.keys(F)) {
    try { readFileSync(join(PEN, `arm${id}.${k}`)); }
    catch { copyFileSync(F[k], join(PEN, `arm${id}.${k}`)); }
  }
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
    }
    if (expectGreen) {
      if (totalFail !== 0) { console.log("  ** WRONG: this arm was DECLARED green and something failed"); wrong = true; }
      else console.log("  as declared: GREEN — and the green is the RESULT, not a pass. See the arm's own note.");
    } else if (totalFail === 0) {
      console.log("  ** WRONG: both suites stayed GREEN. A control that cannot fail proves nothing.");
      wrong = true;
    }
    if (wrong) armsWrong++; else console.log("  as declared.");
  } finally {
    restoreAll(id);
  }
}

console.log("\nD-267 — negative controls. THE BASELINE FIRST, so every arm is a DELTA and so a run in\n"
          + "which every arm is broken is distinguishable from one in which every arm works.");
for (const n of ["severedhomes.test.mjs", "current.test.mjs"]) {
  const b = runSuite(n);
  console.log(`  BASELINE ${n}: ${b.pass} pass, ${b.fail} fail`);
  if (b.fail !== 0) {
    console.log("  ** the tree is not whole; every arm below would measure the wrong thing");
    process.exit(1);
  }
}

const OWN = "severedhomes.test.mjs", PL13 = "current.test.mjs";

/* ===================== (A) THE CITES HALF, ALONE ========================== */

arm("A", "THE CITES HALF. `#queueAncestorEdges` takes its `refs kind='cites'` candidates WITHOUT "
  + "confirming them, which is D-267's original defect restored on the citation edge alone. "
  + "DECLARED: this item's severed-project and cites-half-ungrouped arms MUST fail, and PL-13's "
  + "three CORRECTED pins MUST fail — if those pins did not come back down, correcting them was "
  + "decoration. The BASIS arms MUST stay green, because the other half is still confirmed.",
  [["store", `      consider(r.bundle_id, "cites");`,
              `      up.set(r.bundle_id, true);`]],
  /* The basis arms MUST stay green here, and they only can because the §3
     fixture references its subject as `relates_to` rather than `cites`. The
     first run of this arm found them failing — the fixture, not the plane — and
     the fixture was corrected. Recorded at both sites. */
  [{ name: OWN,
     mustFail: ["THE DEFECT, CLOSED", "a document whose ONLY citing project withdrew is UNGROUPED"],
     mustNotFail: ["THE HALF THE ROW DID NOT PREDICT", "the sole-dependent case",
                   "OVER-STRICTNESS"] },
   { name: PL13,
     mustFail: ["and it is filed under BOTH projects drawing on the question",
                "A's reading is NOT filed under A", "the mirror holds for B's reading"],
     mustNotFail: ["the SEVERED project is not in the conversation at all"] }]);

/* ===================== (B) THE BASIS HALF, ALONE ========================== */

arm("B", "THE BASIS HALF, AND IT IS THE ONE NOTHING HAD NAMED. `inquiry_basis` is the same kind of "
  + "projection and drops `status` identically, so the walk's other edge kind was blind in the same "
  + "way — D-267's row names `refs` and did not predict this. Here the basis candidates go "
  + "unconfirmed. "
  + "DECLARED: this item's basis arms MUST fail. §2 and PL-13's pins MUST stay green, because the "
  + "citation half is still confirmed — which is what proves the two halves are doing their own work "
  + "rather than one covering for the other.",
  [["store", `      consider(r.bundle_id, null);`,
              `      up.set(r.bundle_id, true);`]],
  [{ name: OWN,
     mustFail: ["THE HALF THE ROW DID NOT PREDICT", "the sole-dependent case"],
     mustNotFail: ["THE DEFECT, CLOSED", "a document whose ONLY citing project withdrew is UNGROUPED",
                   "OVER-STRICTNESS"] },
   { name: PL13, mustFail: [],
     mustNotFail: ["and it is filed under BOTH projects drawing on the question",
                   "A's reading is NOT filed under A", "the mirror holds for B's reading"] }]);

/* ====== (C) THE PREDICATE'S CONSERVATIVE ARM — AN UNRECOGNISED VALUE ====== */

arm("C", "NORMALISING THE STATUS VALUE. `#refEdgeSevered` starts trimming and lower-casing before it "
  + "compares, so `Severed` and `severed ` become withdrawals — the plausible, well-meant version of "
  + "this predicate, and the one that quietly widens a refusal into shapes the catalog never wrote. "
  + "DECLARED: the over-strictness arm MUST fail, and the DEFECT-CLOSED and BASIS arms MUST stay "
  + "green — so this measures the over-strictness fixtures rather than the walk.",
  [["store", `    return !!entry && entry.status === "severed";   // unrecorded is LIVE`,
              `    return !!entry && String(entry.status ?? "").trim().toLowerCase() === "severed";`]],
  [{ name: OWN, mustFail: ["OVER-STRICTNESS"],
     mustNotFail: ["THE DEFECT, CLOSED", "THE HALF THE ROW DID NOT PREDICT"] },
   { name: PL13, mustFail: [], mustNotFail: [] }]);

/* ======= (C2) THE OTHER CONSERVATIVE ARM — UNRECORDED IS LIVE ============= */

/* **DECLARED RED, CAME BACK GREEN ON ITS FIRST RUN, AND THE FINDING IS ABOUT THE
   SUBJECT RATHER THAN THE ARM — SO IT IS REDECLARED AND KEPT.** Narrowing on
   ABSENCE is the direction `#refEdgeSevered`'s comment says it must never take,
   and no fixture in either suite can reach it: `refs` and `inquiry_basis` are
   BOTH written from `references[]` inside `promote`'s one transaction, so a
   candidate edge always has a matching frontmatter entry and `!entry` is
   unreachable through the ops. The branch is DEFENSIVE, not load-bearing today —
   and it earns its place anyway, because the one other writer of `refs` (the
   `links_to` link projector) inserts rows with NO frontmatter entry behind them,
   and the day anything walks that relation the absence arm is the only thing
   standing between a projected link and a phantom severance. */
arm("C2", "SEVERANCE NARROWING ON ABSENCE — a target with no matching reference entry is read as a "
  + "WITHDRAWAL. "
  + "DECLARED GREEN, having been declared RED and measured otherwise: both projections are written "
  + "from the same `references[]` in the same transaction, so no fixture here can produce a "
  + "candidate edge without a matching entry. The green is the RESULT and the branch's "
  + "unreachability is the measurement, never evidence that the branch is unnecessary.",
  [["store", `    return !!entry && entry.status === "severed";   // unrecorded is LIVE`,
              `    return !entry || entry.status === "severed";`]],
  [{ name: OWN, mustFail: [], mustNotFail: [] },
   { name: PL13, mustFail: [], mustNotFail: [] }], true);

/* ======== (D) THE OTHER CONSERVATIVE ARM — UNREADABLE IS LIVE ============= */

/* **DECLARED GREEN IN ADVANCE, AND THE GREEN IS THE RESULT RATHER THAN A PASS.**
   Every bundle either suite promotes has a readable `bundle.md`, and no op
   leaves a bundle row with its document gone, so neither suite can reach this
   branch through the control plane. Arming it and reporting the green is what
   turns "we did not test that" into a measurement of the instrument. The
   behaviour itself was `retire`'s rule before it was this predicate's and is
   asserted there. */
arm("D", "THE UNREADABLE BRANCH. A citing document whose `bundle.md` cannot be read is treated as "
  + "having WITHDRAWN, instead of as live. "
  + "DECLARED GREEN: neither suite can reach this branch — every fixture bundle has a readable "
  + "document and no op removes one. The green is this arm's RESULT and is recorded as a gap in the "
  + "instrument, never as evidence that the branch is right.",
  [["store", `    if (!md || md.content === null) return false;   // unreadable is LIVE`,
              `    if (!md || md.content === null) return true;`]],
  [{ name: OWN, mustFail: [], mustNotFail: [] },
   { name: PL13, mustFail: [], mustNotFail: [] }], true);

/* ============ (E) THE SHARED PREDICATE IS ACTUALLY SHARED ================= */

arm("E", "A FAITHFUL COPY. `#citesInto` stops calling the shared predicate and reads the document "
  + "inline again — behaviourally identical, and that is precisely the point. "
  + "DECLARED: ONLY the STRUCTURAL arm may fail, and every behavioural arm in both suites MUST stay "
  + "green. D-267 exists because this rule had four inline implementations and grew a fifth reader "
  + "that did not know it existed; no behavioural arm anywhere could have caught that, which is the "
  + "whole argument for counting the call sites off the source.",
  [["store", `      (this.#refEdgeSevered(r.bundle_id, id, "cites") ? severed : confirmed).push(r.bundle_id);`,
              `    {
      const md = this.#one(\`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'\`, r.bundle_id);
      const fmr = md && md.content !== null ? parseFrontmatter(md.content).data?.references : null;
      const entry = (Array.isArray(fmr) ? fmr : []).find((x) => x && x.rel === "cites" && x.target === id);
      (entry && entry.status === "severed" ? severed : confirmed).push(r.bundle_id);
    }`]],
  [{ name: OWN,
     mustFail: ["STRUCTURAL: the severance rule has ONE definition and THREE callers"],
     mustNotFail: ["THE DEFECT, CLOSED", "THE HALF THE ROW DID NOT PREDICT", "OVER-STRICTNESS",
                   "NOT WALKED IS NOT DELETED"] },
   { name: PL13, mustFail: [],
     mustNotFail: ["and it is filed under BOTH projects drawing on the question",
                   "A's reading is NOT filed under A"] }]);

/* ===================== (F) THE BASELINE, RESTORED ========================= */

console.log("\n=== (G) BASELINE — every arm restored, both suites re-run");
let baseWrong = false;
for (const n of [OWN, PL13]) {
  const r = runSuite(n);
  console.log(`  ${n}: ${r.pass} pass, ${r.fail} fail`);
  if (r.fail !== 0) baseWrong = true;
}
if (baseWrong) { console.log("  ** WRONG: the tree did not come back whole"); armsWrong++; }
else console.log("  the tree came back whole — six-arms-working, not six-arms-broken");
armsRun++;

rmSync(PEN, { recursive: true, force: true });
console.log(`\nD-267 controls: ${armsRun} arm(s) run, ${armsWrong} came back WRONG`);
if (armsWrong) process.exitCode = 1;
