#!/usr/bin/env node
/* nc-instr-cluster.mjs — THE NEGATIVE-CONTROL DRIVER FOR THE INSTRUMENT CLUSTER
 * (M0-78, D-414, D-433), SEVEN ARMS PLUS A BASELINE.
 *
 *     node bio-plane/test/nc-instr-cluster.mjs            # every arm, in order
 *     node bio-plane/test/nc-instr-cluster.mjs 3          # one arm alone
 *
 * WHY ONE DRIVER FOR THREE ROWS. SCHEDULER placed the three together because
 * they are ONE DOCTRINE — *an instrument answering about a thing it cannot
 * see* — and the arms below are the same sentence three times: break the
 * instrument's sight and watch a NAMED assertion fail. Holding them in one
 * driver is what makes the shared shape checkable rather than asserted.
 *
 * WHAT EACH ARM MUST SATISFY, and these are this estate's rules rather than
 * this file's preferences: each is armed ALONE with every other defence held
 * open; each DECLARES before arming what must fail and what must not; every
 * restore is verified by sha256 AND by `cmp` against a UNIQUELY-NAMED per-arm
 * pristine copy with the byte count printed and floored; and THE BASELINE IS AN
 * ARM — without one, seven arms broken for an unrelated reason reads exactly
 * like seven arms working (this estate has a receipt for precisely that).
 *
 * D-331'S RULE IS HONOURED THROUGH `preflight`: every anchor is counted in the
 * file its arm will write BEFORE anything is armed, so one dead anchor cannot
 * hide the arms behind it, and the throw is kept so a half-armed tree is never
 * measured.
 *
 * **AND THE LIMIT, STATED FIRST (M0-42): nothing here proves a control RAN.**
 * This file is an artifact a worker can write without running anything. What it
 * does buy is that a later session re-runs every arm in ONE STEP instead of
 * re-deriving how to break three instruments. The run of record is written into
 * each subject's own `NEGATIVE CONTROL:` declaration with its date and figures.
 */

import { readFileSync, writeFileSync, copyFileSync, rmSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));          /* bio-plane/ */
const REPO = fileURLToPath(new URL("../../", import.meta.url));
const ONLY = process.argv[2] || null;

const F = {
  deriv:   ROOT + "test/derivation-bounds.test.mjs",
  bounds:  ROOT + "test/bounds.test.mjs",
  caseprod: ROOT + "test/caseproduction.test.mjs",
  control: ROOT + "test/caseproduction.control.mjs",
};
const PLANTED = REPO + "civicos-ui/test/nc-d433-planted.test.mjs";

const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

const PEN = ROOT + "../.nc-instr-cluster";
rmSync(PEN, { recursive: true, force: true });
mkdirSync(PEN, { recursive: true });
for (const [k, p] of Object.entries(F)) copyFileSync(p, join(PEN, `record.${k}`));

console.log("\nnc-instr-cluster — M0-78 / D-414 / D-433. THE BASELINE FIRST, so every arm is a DELTA.");
for (const [k, v] of Object.entries(ORIGINAL)) {
  console.log(`  pristine ${k}: ${v.length} bytes · sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
  /* A FLOOR ON THE PRISTINE SIZE. Two harnesses in this estate reported a
     restore byte-identical OVER AN EMPTY MANIFEST, caught only because a digest
     read `e3b0c442…`. An implausibly small subject is refused rather than armed. */
  if (v.length < 10000) { console.log(`  ** ${k} is implausibly small; refusing to arm over it`); process.exit(1); }
}

let armsRun = 0, armsWrong = 0;

/* --------------------------------------------------------------- INSTRUMENTS
   Each returns a small object the arms assert against. Every one reads the
   instrument's OWN printed output rather than its exit status alone, because a
   compound command reports the wrapper's status and this estate has paid for
   that distinction more than once. */
function run(cmd, args, cwd) {
  try { return { out: execFileSync(cmd, args, { cwd, encoding: "utf8", timeout: 3600000 }), code: 0 }; }
  catch (e) { return { out: String(e.stdout || "") + String(e.stderr || ""), code: e.status ?? -1 }; }
}
const suite = (name) => {
  const r = run(process.execPath, [ROOT + "test/" + name], ROOT);
  const m = /(\d+) pass, (\d+) fail/.exec(r.out);
  const named = [...r.out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 160));
  /* `-1`, NEVER `0`: a suite that threw and a suite with no failures are
     different claims, and folding them is how a dead arm reads clean. */
  return m ? { pass: +m[1], fail: +m[2], named, out: r.out, code: r.code }
           : { pass: -1, fail: -1, named, out: r.out, code: r.code };
};
const guard = () => {
  const r = run(process.execPath, [REPO + "civicos-ui/check-refusal-codes.mjs"], REPO);
  const reach = /arm B: REACH (\d+) codes/.exec(r.out);
  const fed = /R3 FED by a harness mock (\d+)/.exec(r.out);
  const obs = /OBSERVED-ONLY (\d+) code\(s\)/.exec(r.out);
  return { reach: reach ? +reach[1] : null, fed: fed ? +fed[1] : null,
           observed: obs ? +obs[1] : null, code: r.code, out: r.out };
};
const census = () => {
  const r = run(process.execPath,
    [ROOT + "test/m025-arm-census.mjs", "--only", "caseproduction.control.mjs", "--logs", PEN + "/logs"], REPO);
  const threw = /drivers whose FIXTURE THREW : (\d+)/.exec(r.out);
  return { threw: threw ? +threw[1] : null, code: r.code,
           verdict: /FIXTURE-THREW/.test(r.out) ? "FIXTURE-THREW" : (/ALL-ARMED/.test(r.out) ? "ALL-ARMED" : "?"),
           out: r.out };
};

/* ------------------------------------------------------------------- THE ARMS */
const SIG_NEW = "  const sig = /^ {2}(?:static\\s+|async\\s+)?(?:\\*\\s*)?(#?[A-Za-z_$][\\w$]*)\\s*\\(/;";
const SIG_OLD = "  const sig = /^ {2}(?:static\\s+|async\\s+)?(#?[A-Za-z_$][\\w$]*)\\s*\\(/;";
const SIG_SHORT = "  const sig = /^ {2}(?:static\\s+|async\\s+)?\\*?\\s*(#?[A-Za-z_$][\\w$]*)\\s*\\(/;";
const RATIFY_GUARDED = "    try {\n      await ratifyCase(async (q, b) => rP(await POST(q, b)), r, { dir, key: \"pilar\", token: tok });";
const RATIFY_BARE = "    {\n      await ratifyCase(async (q, b) => rP(await POST(q, b)), r, { dir, key: \"pilar\", token: tok });";
const ARM_H_REG = 'arm("H", "THE `cases` ROW COMMITTED FROM A REQUEST';
const ARM_H_GONE = 'const _armHDeleted = ("THE `cases` ROW COMMITTED FROM A REQUEST';

const QUEUE = [];
const arm = (id, title, edits, check) => QUEUE.push({ id, title, edits, check });

/* ===== (1) D-414 — THE REGRESSION, IN ONE COPY ONLY, WHICH IS HOW A LIAR PASSES THE ROW. */
arm("1", "D-414 REVERTED IN ONE WALK ONLY (derivation-bounds) — the generator goes back to being "
  + "invisible. DECLARED: derivation-bounds' CENSUS CEILING fails BY NAME with the figure back at 109, "
  + "AND bounds' D-414 PARITY arm fails because the five copies no longer agree. The parity arm is the "
  + "point: fixing or breaking ONE copy is exactly what this row's liar does.",
  [["deriv", SIG_NEW, SIG_OLD]],
  () => {
    const d = suite("derivation-bounds.test.mjs"), b = suite("bounds.test.mjs");
    const dNamed = d.named.some((n) => /CENSUS IS A CEILING|CENSUS IS A FLOOR/.test(n));
    const bNamed = b.named.some((n) => /D-414 PARITY/.test(n));
    return { ok: d.fail > 0 && dNamed && b.fail > 0 && bNamed,
      say: `derivation-bounds ${d.pass}/${d.fail} (census arm named: ${dNamed}) · `
         + `bounds ${b.pass}/${b.fail} (parity arm named: ${bNamed})` };
  });

/* ===== (2) D-414 — THE SHORTER SPELLING, WHICH IS THE TRAP THE FIX AVOIDED. */
arm("2", "D-414 WRITTEN THE SHORT WAY (`\\*?\\s*`) IN ONE WALK — the spelling the row's own words "
  + "suggest, and the one that also lets `\\s*` eat a THIRD space of indent. DECLARED: it matches at "
  + "ANY depth, so the segment count balloons and derivation-bounds fails; and bounds' PARITY arm "
  + "fails too, because the copies diverge. This arm exists because the widening ONLY EVER ADDS "
  + "segments, which no count guard in this estate was watching for.",
  [["deriv", SIG_NEW, SIG_SHORT]],
  () => {
    const d = suite("derivation-bounds.test.mjs"), b = suite("bounds.test.mjs");
    return { ok: d.fail > 0 && b.named.some((n) => /D-414 PARITY/.test(n)),
      say: `derivation-bounds ${d.pass}/${d.fail} · bounds ${b.pass}/${b.fail} · `
         + `first derivation failure: ${d.named[0] || "(none)"}` };
  });

/* ===== (3) M0-78 — THE FIXTURE PUT BACK, WHICH IS THE DEFECT THE ROW NAMES. */
/* THIS ARM'S DECLARATION WAS CORRECTED FROM ITS OWN MEASUREMENT, 2026-09-19, and the correction
   matters because the overstated version would have made this row's case stronger than the evidence.
   It first read *"Before this row it reported the same driver as healthy"*. **It did not.** Measured
   on this tree with BOTH the census and the fixture reverted to HEAD: the census printed
   `caseproduction.control.mjs  UNCLASSIFIED  exit=1 arms=?  decl=?  13.8s`, reported
   `8 anchor(s), 0 NOT LIVE`, and **EXITED 0**.

   So the pre-M0-78 state is more precise and slightly less lurid than "reported healthy": the driver's
   own non-zero exit WAS visible, the census declined to score it either way — which is that
   instrument's own deliberate rule, and a good one — and then **did not gate on it**, because only a
   stale anchor or a decayed tally carried the exit. An arm that measured nothing sat in the one bucket
   that is printed for a human and enforced on nobody. The preflight, meanwhile, reported all eight
   anchors live and was right to: it proves the ANCHOR is live and can never prove the FIXTURE runs.
   The 13.8s is itself the tell — a driver that ran its eight arms would take minutes; this one died
   early, eight times over, and nothing was watching the clock either. */
arm("3", "M0-78 REVERTED — the ratify-stage refusal THROWS again instead of being surfaced, which is "
  + "exactly the state arms (C) and (H) sat in. DECLARED: the CENSUS must now report the driver as "
  + "FIXTURE-THREW and EXIT NON-ZERO, where before this row it read UNCLASSIFIED and exited 0 — "
  + "printed for a human, enforced on nobody.",
  [["caseprod", RATIFY_GUARDED, RATIFY_BARE]],
  () => {
    const c = census();
    return { ok: c.verdict === "FIXTURE-THREW" && c.code !== 0 && c.threw >= 1,
      say: `census verdict ${c.verdict} · FIXTURE THREW count ${c.threw} · exit ${c.code}` };
  });

/* ===== (4) M0-78 — THE LIAR'S ROUTE: DELETE THE ARM THAT WAS FAILING. */
arm("4", "M0-78's LIAR — arm (H)'s registration removed from the driver. DECLARED: the witness suite's "
  + "A8 roster pin fails BY NAME, reporting seven ids where eight are pinned. Every other M0-78 check "
  + "asks whether an arm MEASURED anything; none of them asks whether it is still THERE, and deleting "
  + "it is the cheapest way past all of them.",
  [["control", ARM_H_REG, ARM_H_GONE]],
  () => {
    const w = suite("m025-arm-anchor-witness.test.mjs");
    return { ok: w.fail > 0 && w.named.some((n) => /A8/.test(n)),
      say: `witness ${w.pass}/${w.fail} · A8 named: ${w.named.filter((n) => /A8/.test(n)).length}` };
  });

/* ===== (5) D-433 — A SUITE THAT ONLY *OBSERVES* A CODE MUST NOT RAISE THE REACH. */
arm("5", "D-433's OWN ARM — a planted UI suite that ASSERTS a refusal code by name and never feeds it "
  + "to a surface. DECLARED: the reach and R3's FED half BOTH stay where they were, and the code "
  + "appears in the OBSERVED half of the print. Before this row the same suite raised a ratchet that "
  + "may only rise, so the inflation was permanent.",
  [],
  () => {
    const before = guard();
    writeFileSync(PLANTED,
      "/* PLANTED by nc-instr-cluster.mjs arm 5. Removed by the arm. */\n"
      + "const r = await fetch('/x').then((x) => x.json());\n"
      + "ok(r.reason === \"ALREADY_ALIASED\");\n"
      + "ok(r.reason !== \"ALREADY_ALIASED\");\n");
    const after = guard();
    unlinkSync(PLANTED);
    const obs = /ALREADY_ALIASED/.test(after.out);
    return { ok: after.reach === before.reach && after.fed === before.fed && obs,
      say: `reach ${before.reach} -> ${after.reach} · R3 fed ${before.fed} -> ${after.fed} · `
         + `the planted code appears in the print: ${obs}` };
  });

/* ===== (6) D-433 — AND A MOCK THAT *HANDS* THE SAME CODE STILL MUST. */
arm("6", "D-433's OVER-STRICTNESS DIRECTION, and it is the arm that stops the fix from being a way of "
  + "reporting a smaller number: the SAME code, in the SAME planted suite, HANDED to the surface by a "
  + "mock. DECLARED: the reach and R3's FED half BOTH rise by one. A partition that excluded this "
  + "would have made the instrument blind in the other direction.",
  [],
  () => {
    const before = guard();
    writeFileSync(PLANTED,
      "/* PLANTED by nc-instr-cluster.mjs arm 6. Removed by the arm. */\n"
      + "globalThis.fetch = async () => ({ json: async () => ({ ok: false, reason: \"ALREADY_ALIASED\" }) });\n");
    const after = guard();
    unlinkSync(PLANTED);
    return { ok: after.reach === before.reach + 1 && after.fed === before.fed + 1,
      say: `reach ${before.reach} -> ${after.reach} · R3 fed ${before.fed} -> ${after.fed}` };
  });

/* ===== (7) THE BASELINE. NOT DECORATION — see the header. */
arm("7", "THE BASELINE — nothing armed. DECLARED: every instrument GREEN. Without this row, seven arms "
  + "failing for a reason unrelated to their subjects is indistinguishable from seven arms working.",
  [],
  () => {
    const d = suite("derivation-bounds.test.mjs"), b = suite("bounds.test.mjs");
    const w = suite("m025-arm-anchor-witness.test.mjs"), g = guard();
    return { ok: d.fail === 0 && b.fail === 0 && w.fail === 0 && g.code === 0,
      say: `derivation-bounds ${d.pass}/${d.fail} · bounds ${b.pass}/${b.fail} · `
         + `witness ${w.pass}/${w.fail} · guard exit ${g.code} (reach ${g.reach}, fed ${g.fed}, observed ${g.observed})` };
  });

/* ------------------------------------------------------------------- RUN ALL */
function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: anchor occurs ${n} times in ${key}`);
  writeFileSync(F[key], src.replace(from, to));
}
function restoreAll(id) {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k} (arm ${id})`);
    execFileSync("cmp", ["-s", p, join(PEN, `arm${id}.${k}`)]);
    execFileSync("cmp", ["-s", p, join(PEN, `record.${k}`)]);
    console.log(`    ${k}: ${now.length} bytes restored, verified by sha256 and by cmp x2`);
  }
  if (existsSync(PLANTED)) { unlinkSync(PLANTED); console.log(`    planted suite removed`); }
}

const willRun = QUEUE.filter((q) => !ONLY || ONLY === q.id).map((q) => q.id);
preflight("nc-instr-cluster.mjs",
  QUEUE.map((q) => ({ id: q.id, anchors: q.edits.map(([k, from]) => ({ file: F[k], needle: from })) })),
  { fatalFor: willRun });

for (const q of QUEUE) {
  if (ONLY && ONLY !== q.id) continue;
  armsRun++;
  console.log(`\n=== (${q.id}) ${q.title}`);
  for (const k of Object.keys(F)) copyFileSync(F[k], join(PEN, `arm${q.id}.${k}`));
  try {
    for (const [k, from, to] of q.edits) edit(k, from, to);
    const r = q.check();
    console.log(`  MEASURED: ${r.say}`);
    if (r.ok) console.log("  as declared.");
    else { console.log("  ** NOT AS DECLARED"); armsWrong++; }
  } catch (e) {
    console.log(`  ** NOT AS DECLARED — the arm itself threw: ${String(e.message).slice(0, 300)}`);
    armsWrong++;
  } finally { restoreAll(q.id); }
}

console.log(`\n==== ${armsRun} arm(s) run, ${armsWrong} NOT AS DECLARED.`);
console.log("Every file restored and verified by sha256 and by cmp against BOTH a per-arm pristine copy\n"
          + "and the pristine-of-record taken before any arm ran.");
rmSync(PEN, { recursive: true, force: true });
process.exit(armsWrong ? 1 : 0);
