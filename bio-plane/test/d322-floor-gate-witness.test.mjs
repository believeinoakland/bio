/* D-322 — THE WITNESS D-314's BLANK/NOISE GATE DID NOT HAVE, AND THE WHOLE
 * POINT IS THAT THE BATTERY RUNS IT.
 *
 * WHY THIS FILE EXISTS, and it is a measured gap rather than a tidy-up. CPDF-16
 * closed D-314 by giving CPDF-9's floor instrument (`ocr-measure-probe.mjs`) its
 * own control gate: the floor generates CPDF-11's uniform-noise page itself,
 * OCRs it beside a blank page for EVERY model, and a floor REFERENCE may only be
 * taken from a run that passed BOTH controls — the only agreement path,
 * `floorAgreement()`, answers the STRING `undetermined` naming the gate over a
 * failing run, never a number. That gate matters beyond one control: D-306
 * establishes that every corpus-scale fidelity figure in this project is
 * AGREEMENT WITH THIS FLOOR, and D-314 measured the floor engine inventing 9,968
 * characters on uniform noise — so a region where the floor invents is a region
 * where "agreement" is scored against noise.
 *
 * The gate was landed with arms, and every one of them lived in
 * `cpdf16-floor-controls.mjs`, which is NOT a `*.test.mjs` and is therefore not
 * in the battery. D-318's class sweep walked all 288 modules in this directory
 * and named this the one clear same-class instance: *a defence whose only
 * witness is an instrument nothing runs automatically.* Neutering the gate that
 * refuses a score over noise left EVERY automatic gate green. That is D-322, and
 * this file closes it on D-318's own template.
 *
 * WHAT IS PINNED HERE, AND WHY IT IS TWO HALVES RATHER THAN ONE. A gate can be
 * neutered in two quite different places and neither half sees the other:
 *
 *   BEHAVIOUR — `controlGate()` and `floorAgreement()` themselves. Grabbed out
 *     of the COPIED floor by the same technique the CPDF-14/CPDF-15
 *     comparability guards and CPDF-16's own driver use, and DRIVEN on
 *     constructed inputs: noise must fail the gate, the refusal must NAME the
 *     invented characters, and the only agreement path must answer the string
 *     `undetermined` over a failing gate.
 *   WIRING — whether the run path still asks. A `controlGate()` that is perfect
 *     and no longer called is a gate in name only: the arms below neuter the
 *     call (`const gate = { passed: true }`), the exit code, the agreement
 *     call's gate argument, the noise PAGE's own recipe (a white "noise" page
 *     passes the gate for free — an outcome that costs nothing to produce is
 *     not evidence), and the read that OCRs the noise page at all (pointing it
 *     back at the blank page reads the blank control twice). Each of those is
 *     invisible to the behavioural half, and the behavioural half's mutations
 *     are invisible to this one. The arms prove that, one at a time.
 *
 * D-305's FIFTH EXPRESSION IS COVERED TOO, and that is the class sweep rather
 * than scope creep: D-322's row names BOTH of the floor's additive regions as
 * the driver's subject, and the fifth expression (digit-position DISAGREEMENT)
 * is DELIBERATELY left unpinned by both probes' guards so that the additive edit
 * class stays legal — which means its behavioural claim, *a digit swapped for a
 * digit moves the new column and mints nothing*, also had no witness the battery
 * runs. Two rows below drive it, and one pins the floor's own self-refusing
 * exhibit as still running before any engine installs.
 *
 * WHICH CLOSURE THIS IS, AND WHAT THE OTHERS COST — stated rather than silently
 * declined, because D-322's row offers the shape as a choice.
 *
 *   (a) RENAME `cpdf16-floor-controls.mjs` TO `*.test.mjs`. Zero new code: its
 *       arms already exist and are already declared. NOT TAKEN, for the reason
 *       its own header gives — it mutates the COMMITTED floor in place, so as a
 *       battery suite it would race every other suite in the run and leave the
 *       tree dirty if it died mid-arm. Its real cost, unpaid here: the gate's
 *       arms are now stated in two files, and two statements of one thing can
 *       drift. The mitigation is a pointer in each header, not a promise.
 *   (b) EXTRACT THE GATE into an importable module and unit-test it directly.
 *       Cleanest testing shape by a distance, and NOT TAKEN because it edits the
 *       floor: every prior figure's comparability rests on those bytes (both
 *       landed probes pin four metric statements AND the ground truth by
 *       digest), and D-305/D-314 were both closed under a constraint that only
 *       ADDITIVE edits are legal there. Moving the gate out is not additive.
 *       Cost of not taking it, stated: this suite must grab `controlGate()` and
 *       `floorAgreement()` out of the source by regex, so RENAMING either
 *       function, or changing its signature, reads as GRAB FAILED. That is a
 *       refusal that names itself rather than a silent pass, which is the safe
 *       direction — but it is not the same as understanding the change.
 *   (c) THIS ONE: a battery-discovered suite over a PER-ARM TEMP-DIR COPY. It is
 *       what D-318 landed one instrument over, and D-322's row asks for it by
 *       name. Nothing committed is mutated, and the foot MEASURES that rather
 *       than asserting it.
 *
 * WHY A COPY PER ARM AND NOT THE COMMITTED FILE. `cpdf16-floor-controls.mjs`
 * mutates the real floor with a restore verified two ways, which is the stronger
 * instrument and is exactly why it must not be discovered. Copying is what both
 * probes' own `--controls` already do, and here every arm gets its OWN fresh
 * copy, so no arm can be disarmed by a previous arm's failure to restore — a
 * stronger property than restoring, not a weaker one.
 *
 * WHAT THIS SUITE CANNOT SEE, stated because a matcher's reach is the thing the
 * next reader cannot re-derive. It never runs an OCR engine, never fetches the
 * exhibit and never installs anything: it drives the gate's own code on
 * constructed inputs and reads the run path's wiring as TEXT. So it cannot see a
 * gate that is wired correctly and fed the wrong bytes at run time (the floor's
 * own full run is the only instrument for that, and D-314's finding came from
 * exactly such a run); it cannot see a semantic change made in a spelling its
 * regexes still match (a different comparison inside `controlGate` that happens
 * to keep `blankChars === 0 && noiseChars === 0` is impossible, but an equally
 * neutering edit made in `norm()` — which decides what "empty" MEANS — would be
 * caught only if it changed the numbers the rows below assert, and `norm()` is
 * digest-pinned by both landed probes rather than here); and because it mutates
 * a COPY, it cannot see a gate that reads a file by an absolute path instead of
 * relative to itself. It also says nothing about the FOUR pinned metric
 * expressions or the ground truth — those have a discovered witness already, in
 * `d315-guard-witness.test.mjs`, through the two probes' guards.
 *
 * NEGATIVE CONTROL: run 2026-09-12, each arm ALONE with every other defence held
 * open, every restore verified by sha256 AND `cmp` against a uniquely-named
 * per-arm pristine copy with the byte count printed and floored, the floor's
 * digest `7151886480c71bd2…` re-read after every arm.
 * (1) THE ARM THIS ITEM EXISTS FOR — neuter the gate in the REAL COMMITTED
 * FLOOR, `const passed = blankChars === 0 && noiseChars === 0;` to `const passed
 * = true;` -> this suite goes 3 pass / 13 FAIL, exit 1, the baseline row naming
 * all four gate checks (`gate-refuses-noise`, `refusal-names-the-noise`,
 * `gate-refuses-blank`, `agreement-is-undetermined`) and the two arms whose
 * anchor is now gone reporting ARM NEVER ARMED rather than passing quietly; and
 * `node scripts/battery.mjs d322-floor-gate-witness` reports `FAIL
 * d322-floor-gate-witness.test.mjs 3 pass, 13 FAIL`, `0/1 suites green`, exit 1,
 * which is the accepts-when driven rather than argued.
 * (2) THE HALF D-314 ADDED, dropped alone — `&& noiseChars === 0` removed,
 * exactly the pre-CPDF-16 state CPDF-9 shipped and ran for five weeks -> 3 pass
 * / 13 FAIL with the baseline naming THREE rows and `gate-refuses-blank` still
 * passing, so the gate's two halves are witnessed separately rather than
 * together.
 * (3) OVER-STRICTNESS — the untouched floor: 16 pass / 0 fail here, the whole
 * battery green, and the committed floor byte-identical by sha256 AND `cmp`,
 * so this suite witnesses the regression rather than fighting the gate.
 * (4) THE GATE'S OWN OVER-STRICTNESS, the direction a fence tighter than its
 * rule fails in — make the real gate refuse unconditionally (`const passed =
 * false;`) -> 3 pass / 13 FAIL with the baseline naming exactly the two CLEAN
 * rows (`gate-passes-clean-controls`,
 * `agreement-is-a-number-over-a-clean-gate`), so a gate that fires on health is
 * caught too; the in-suite `additive` arm holds the same line for the legal
 * ADDITIVE edit class on every run.
 * (5) ARM NEVER ARMED, proven rather than trusted — neuter this suite's own
 * mutation so an edit returns the source unchanged -> 4 pass / 12 FAIL, every
 * mutation arm reporting `ARM NEVER ARMED: the edit produced byte-identical
 * source`, because an arm that did not arm is a finding.
 * (6) REACH — truncate the REAL committed floor to 400 bytes -> the corpus row
 * FAILS naming the byte count (`the floor is a real file, not an empty one (400
 * B, floor 10000)`), 2 pass / 14 fail, since an assertion that passed over an
 * empty fixture is the receipt this project keeps re-earning.
 * (7) THE FIXTURE'S OWN GUARD — blank the per-arm copy inside `sandbox()` ->
 * every arm THREW `COPY IS NOT THE SUBJECT`, 3 pass / 13 fail, so the copy is
 * measured against the committed file rather than assumed equal to it.
 * (8) THE ARM THAT ARMED SOMEWHERE ELSE, recorded rather than smoothed — the
 * same blanking aimed with a four-space anchor landed in the FOOT's own `cmp`
 * block instead of in `sandbox()` (it occurs exactly once, just not where it was
 * aimed) -> 15 pass / 1 fail, the foot's `cmp` row, which is a finding about the
 * ARM and is also the only run in which the foot's second restore check was the
 * thing under test.
 * Arms 1, 2, 4 and 6 are one-line edits to `test/ocr-measure-probe.mjs` re-run
 * with `node test/d322-floor-gate-witness.test.mjs`; the real-file mutation path
 * is the whole subject of `test/cpdf16-floor-controls.mjs`, which is kept,
 * cross-referenced in both headers, and run by hand on a quiet tree.
 */
import "./sandbox.mjs";
import "./stdio.mjs";
import { mkdtempSync, copyFileSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FLOOR_NAME = "ocr-measure-probe.mjs";
const FLOOR = join(HERE, FLOOR_NAME);
const sha = (b) => createHash("sha256").update(b).digest("hex");
const shaFile = (p) => sha(readFileSync(p));

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) console.log(`        got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
};

/* THE CORPUS, PRINTED AND FLOORED. Three headline totality assertions in this
   repository have PASSED OVER AN EMPTY CORPUS, so the subject is measured before
   a single arm runs and a suspiciously small file stops the suite rather than
   letting every row below succeed against nothing. */
console.log("\n--- D-322: D-314's blank/noise gate in the floor, witnessed by something the battery runs ---");
const ORIGIN = { sha: shaFile(FLOOR), bytes: statSync(FLOOR).size };
console.log(`  subject: ${FLOOR_NAME}  ${ORIGIN.bytes} B  sha256 ${ORIGIN.sha.slice(0, 16)}…`);
t(`the floor is a real file, not an empty one (${ORIGIN.bytes} B, floor 10000)`, ORIGIN.bytes >= 10000, true);

/* -- the grab: the gate's OWN code, out of the bytes under test --------------
 * The same technique the two landed comparability guards and CPDF-16's driver
 * use. It is applied to the COPY, so what an arm exercises is what that arm
 * mutated — and a rename of either function is a GRAB FAILED finding rather
 * than a silent pass (stated in the header as (b)'s unpaid cost). */
const GRABS = [
  [/const GT_PAGE2 = `([\s\S]*?)`;/, "GT_PAGE2", true],
  [/(const norm = \(s\) =>[\s\S]*?;\n)/, "norm()"],
  [/(function levenshteinPairs\(a, b\) \{[\s\S]*?\n\})/, "levenshteinPairs()"],
  [/(function score\(label, gtRaw, ocrRaw\) \{[\s\S]*?\n\})/, "score()"],
  [/(function controlGate\(blankText, noiseText\) \{[\s\S]*?\n\})/, "controlGate()"],
  [/(function floorAgreement\(gate, floorText, otherText\) \{[\s\S]*?\n\})/, "floorAgreement()"],
];
async function loadGate(src) {
  const got = {};
  for (const [re, what] of GRABS) {
    const m = re.exec(src);
    if (!m) throw new Error(`GRAB FAILED: ${what} not found in the floor under test`);
    got[what] = m[1];
  }
  const mod = await import("data:text/javascript," + encodeURIComponent(
    `${got["norm()"]}\n${got["levenshteinPairs()"]}\n${got["score()"]}\n${got["controlGate()"]}\n${got["floorAgreement()"]}\n` +
    `export { norm, score, controlGate, floorAgreement };`));
  return { mod, gt: got.GT_PAGE2 };
}

/* The floor's `score()` prints four lines per call and this suite calls it twice
   per arm. The NUMBERS it returns are what the rows assert and the arm prints
   its own verdict, so the transcript is not the evidence here — it is noise that
   would bury the rows that are. Errors still propagate; only output is held. */
function quiet(fn) {
  const real = console.log;
  console.log = () => {};
  try { return fn(); } finally { console.log = real; }
}

/* -- WHAT "THE GATE HOLDS" MEANS, in one place ------------------------------
 * `inspect()` returns the list of FAILED check ids. An arm declares the exact
 * set it expects, so an arm that trips a check it should not have is caught in
 * the same breath as one that trips nothing — a mutation arm asserting only
 * "something failed" would pass for the wrong reason. */
const NOISE = "ee — TPS oe oo . co a 8 oo ee Coes S ce a oe oe ree! ".repeat(3);  // D-314's exhibit shape
const BLANK_INVENTION = "l .";                                                     // what a blank page must never yield

async function inspect(dir) {
  const src = readFileSync(join(dir, FLOOR_NAME), "utf8");
  const bad = [];
  const check = (id, ok, why) => { if (!ok) bad.push(`${id} (${why})`); };

  let mod, gt;
  try { ({ mod, gt } = await loadGate(src)); }
  catch (e) { return { bad: [`grab (${e.message})`], detail: "the gate's code could not be read out of the floor" }; }

  /* A 200-character slice of the ground truth: it carries `$50,000` and the word
     `transaction`, which is everything the two D-305 rows need. The full page is
     ~2,800 chars and Levenshtein is quadratic — the floor's own run scores the
     WHOLE page and is the instrument for that; this suite must stay under a
     second inside a 180-suite battery, and the slice is real ground-truth bytes
     rather than a constructed string. */
  const SLICE = gt.slice(0, 200);
  if (!SLICE.includes("$50,000") || !SLICE.includes("transaction"))
    return { bad: [`fixture (the ground-truth slice lost its anchors: ${JSON.stringify(SLICE.slice(0, 60))})`], detail: "fixture" };

  const { score, controlGate, floorAgreement } = mod;

  /* -- BEHAVIOUR: the gate's own code, driven -------------------------------- */
  const onNoise = controlGate("", NOISE);
  check("gate-refuses-noise", onNoise.passed === false,
    `controlGate("", <${NOISE.length} chars of noise-read>).passed = ${onNoise.passed}`);
  check("refusal-names-the-noise",
    typeof onNoise.reason === "string" && /invented \d+ chars on uniform noise/.test(onNoise.reason)
      && onNoise.noiseChars > 0,
    `reason = ${JSON.stringify(onNoise.reason)}`);
  const onBlank = controlGate(BLANK_INVENTION, "");
  check("gate-refuses-blank", onBlank.passed === false && /chars on a blank page/.test(String(onBlank.reason)),
    `controlGate(<invented blank text>, "").passed = ${onBlank.passed}, reason = ${JSON.stringify(onBlank.reason)}`);

  const overNoise = floorAgreement(onNoise, NOISE, SLICE);
  check("agreement-is-undetermined",
    overNoise.agreement === "undetermined" && typeof overNoise.agreement !== "number"
      && /noise gate/.test(String(overNoise.reason)),
    `agreement = ${JSON.stringify(overNoise.agreement)}, reason = ${JSON.stringify(overNoise.reason)}`);

  /* The gate's OWN over-strictness, and it is not decoration: a gate that
     refuses everything would satisfy every row above while destroying the
     instrument it protects. */
  const clean = controlGate("", "");
  check("gate-passes-clean-controls", clean.passed === true && clean.reason === null,
    `controlGate("", "") = ${JSON.stringify(clean)}`);
  const same = floorAgreement(clean, SLICE, SLICE);
  const near = floorAgreement(clean, SLICE, SLICE.replace("$50,000", "$10,000"));
  check("agreement-is-a-number-over-a-clean-gate",
    typeof same.agreement === "number" && Math.abs(same.agreement - 100) < 1e-9
      && typeof near.agreement === "number" && near.agreement > 99 && near.agreement < 100,
    `identical = ${JSON.stringify(same.agreement)}, one-digit-off = ${JSON.stringify(near.agreement)}`);

  /* -- D-305's FIFTH EXPRESSION, the floor's other additive region ----------- */
  const subst = quiet(() => score("d322", SLICE, SLICE.replace("$50,000", "$10,000")));
  check("fifth-column-sees-a-digit-substitution", subst.disagree === 1 && subst.minted === 0,
    `disagree = ${subst.disagree} (want 1), minted = ${subst.minted} (want 0)`);
  const letter = quiet(() => score("d322", SLICE, SLICE.replace("transaction", "transactiom")));
  check("fifth-column-ignores-a-letter-error", letter.disagree === 0 && letter.minted === 0 && letter.dist === 1,
    `disagree = ${letter.disagree}, minted = ${letter.minted}, dist = ${letter.dist}`);

  /* -- WIRING: does the run path still ASK? ---------------------------------
   * Read as text, deliberately whitespace-tolerant: a re-indentation is not a
   * regression, and a fence tighter than its rule is an undeclared interface
   * change wearing the costume of caution. */
  check("gate-is-built-from-both-control-reads",
    /const gate = controlGate\(\s*blank\.text\s*,\s*noiseRead\.text\s*\)/.test(src),
    "the run path no longer builds its gate from the blank AND noise reads");
  check("a-noise-failure-exits-nonzero", /if\s*\(\s*!noiseOk\s*\)\s*process\.exitCode\s*=\s*1\s*;/.test(src),
    "an engine that invents on noise no longer makes the instrument exit 1");
  check("a-blank-failure-exits-nonzero", /if\s*\(\s*!ok\s*\)\s*process\.exitCode\s*=\s*1\s*;/.test(src),
    "an engine that invents on a blank page no longer makes the instrument exit 1");
  check("the-agreement-path-uses-the-runs-own-gate", /floorAgreement\(\s*ref\.gate\s*,/.test(src),
    "the agreement loop no longer passes the run's own gate verdict");
  check("the-noise-page-is-random-at-the-scanned-page-size",
    /random\.seed\(11\)/.test(src) && /noise\.putdata\(\[random\.randint\(0,\s*255\)/.test(src)
      && /W,\s*H\s*=\s*gtpage\.size/.test(src) && /noise\.save\(/.test(src),
    "the noise control page is no longer CPDF-11's seeded random recipe at the ground-truthed page's own size");
  check("the-noise-control-reads-the-noise-page",
    /worker\.recognize\(\s*join\(work,\s*"noise\.png"\)\s*\)/.test(src),
    "the second control read no longer points at the noise page");
  check("the-d305-exhibit-is-driven-and-self-refusing",
    /score\("D-305 exhibit/.test(src) && /if \(!\(ex\.disagree > 0 && ex\.minted === 0\)\)/.test(src)
      && /D-305 EXHIBIT BROKEN/.test(src),
    "the fifth expression's self-refusing exhibit no longer runs before the engines install");

  return { bad, detail: `${bad.length} finding(s)` };
}

/** A fresh sandbox holding a pristine copy of the floor. Per ARM, so no arm can
 *  be disarmed by a previous arm — the copy-per-arm shape both probes'
 *  `--controls` already use. */
function sandbox(id) {
  const d = mkdtempSync(join(tmpdir(), `d322-${id}-`));
  copyFileSync(FLOOR, join(d, FLOOR_NAME));
  /* The copy is the fixture; if it is not byte-identical the arm is measuring
     something else entirely. Cheap, and it is how a fixture stops being taken
     on trust. */
  if (shaFile(join(d, FLOOR_NAME)) !== ORIGIN.sha)
    throw new Error(`COPY IS NOT THE SUBJECT: ${FLOOR_NAME} differs from the committed file`);
  return d;
}

/** One arm: a fresh copy, one or more edits applied to THE COPY, then the same
 *  `inspect()` every other arm runs — and the FULL set of findings asserted, so
 *  an arm that trips the wrong check fails as loudly as one that trips none. */
async function arm(id, what, edits, expect) {
  console.log(`\n  [${id}] ${what}`);
  console.log(`    DECLARED: inspect() reports exactly ${JSON.stringify(expect)}`);
  let got;
  try {
    const d = sandbox(id);
    const p = join(d, FLOOR_NAME);
    for (const [from, to] of edits) {
      const before = readFileSync(p, "utf8");
      /* An arm that did not arm is a finding, never a pass — all three halves:
         the anchor must be there, it must be there EXACTLY ONCE (String.replace
         rewrites the first occurrence only, so a duplicate disarms the arm
         silently), and the edit must reach the disk. */
      const hits = before.split(from).length - 1;
      if (hits !== 1) throw new Error(`ARM NEVER ARMED: ${JSON.stringify(from.slice(0, 56))} occurs ${hits} times, want exactly 1`);
      const after = before.replace(from, to);
      if (after === before) throw new Error("ARM NEVER ARMED: the edit produced byte-identical source");
      writeFileSync(p, after);
    }
    if (edits.length && shaFile(p) === ORIGIN.sha) throw new Error("ARM NEVER ARMED: the copied floor on disk is unchanged after the write");
    const r = await inspect(d);
    got = r.bad.map((b) => b.split(" (")[0]).sort();
    for (const b of r.bad) console.log(`    finding: ${b}`);
  } catch (e) {
    got = `THREW: ${e.message}`;
  }
  t(`${id} · the witness reports exactly the declared finding(s)`, got, [...expect].sort());
}

/* -- the baseline, which is also the over-strictness arm ---------------------
 * Without this row every arm below would pass against an `inspect()` that simply
 * always reported everything, and the suite would be indistinguishable from a
 * broken one. It is the one row that separates all-arms-working from
 * all-arms-broken — and it is the row that FAILS if the committed gate is ever
 * neutered, which is the whole item. */
await arm("baseline", "a pristine copy, nothing mutated — the committed gate as it stands", [], []);

/* -- NC1: THE ARMS THIS ITEM EXISTS FOR — the gate neutered in the copy ------ */
const PASSED_LINE = "const passed = blankChars === 0 && noiseChars === 0;";
await arm("gate-always-passes", "THE NEUTERING: the gate's verdict hard-wired to true",
  [[PASSED_LINE, "const passed = true;"]],
  ["gate-refuses-noise", "refusal-names-the-noise", "gate-refuses-blank", "agreement-is-undetermined"]);

await arm("noise-clause-dropped", "the half D-314 ADDED, removed alone — the pre-CPDF-16 state CPDF-9 shipped and ran for five weeks",
  [[PASSED_LINE, "const passed = blankChars === 0;"]],
  ["gate-refuses-noise", "refusal-names-the-noise", "agreement-is-undetermined"]);

await arm("agreement-ungated", "the ONLY agreement path stops consulting the gate — a number scored against noise",
  [["if (!gate || !gate.passed) {", "if (false) {"]],
  ["agreement-is-undetermined"]);

await arm("refusal-unnamed", "the gate still refuses but stops NAMING the invented characters",
  [["parts.push(`the floor engine invented ${noiseChars} chars on uniform noise`)", 'parts.push("a control failed")']],
  ["refusal-names-the-noise"]);

/* -- the WIRING arms: every one of these leaves `controlGate()` itself perfect,
 * and a purely behavioural witness would call each of them green. ----------- */
await arm("gate-not-wired", "`controlGate()` is never called — the run path invents a passing verdict",
  [["const gate = controlGate(blank.text, noiseRead.text);", "const gate = { passed: true };"]],
  ["gate-is-built-from-both-control-reads"]);

await arm("no-exit-on-noise", "a noise-inventing engine no longer makes the instrument exit 1 (CPDF-16's honest exit)",
  [["  if (!noiseOk) process.exitCode = 1;\n", ""]],
  ["a-noise-failure-exits-nonzero"]);

await arm("no-exit-on-blank", "the same for the blank control — CPDF-9's original half",
  [["  if (!ok) process.exitCode = 1;\n", ""]],
  ["a-blank-failure-exits-nonzero"]);

await arm("agreement-bypasses-the-run-gate", "the agreement loop passes a fabricated verdict instead of the run's own",
  [["floorAgreement(ref.gate, ref.page2Text, other.page2Text)", "floorAgreement({ passed: true }, ref.page2Text, other.page2Text)"]],
  ["the-agreement-path-uses-the-runs-own-gate"]);

await arm("noise-page-is-white", "the `noise` control page is filled WHITE — the gate then passes for free, which is an outcome that costs nothing to produce",
  [["noise.putdata([random.randint(0,255) for _ in range(W*H)])", "noise.putdata([255 for _ in range(W*H)])"]],
  ["the-noise-page-is-random-at-the-scanned-page-size"]);

await arm("noise-read-points-at-the-blank", "the second control read OCRs the BLANK page again — two controls, one page",
  [['const { data: noiseRead } = await worker.recognize(join(work, "noise.png"));',
    'const { data: noiseRead } = await worker.recognize(join(work, "blank.png"));']],
  ["the-noise-control-reads-the-noise-page"]);

await arm("d305-exhibit-disarmed", "the fifth expression's self-refusing exhibit stops refusing",
  [["if (!(ex.disagree > 0 && ex.minted === 0)) {", "if (false) {"]],
  ["the-d305-exhibit-is-driven-and-self-refusing"]);

/* -- OVER-STRICTNESS, in the direction this estate treats as its own hazard --
 * The ADDITIVE edit is the legal edit class in this file — it is what D-305's
 * fifth expression established and what both landed guards' line-scoped digests
 * deliberately leave room for. A witness that fired on one would be a fence
 * tighter than its rule, and it would be found by whoever next tries to extend
 * the instrument, at their cost rather than at this item's. */
await arm("additive", "TWO legal ADDITIVE edits — a new sibling function and an extra diagnostic line in the run path",
  [["function floorAgreement(gate, floorText, otherText) {",
    "function floorAgreementLabel() { return \"additive: the legal edit class\"; }\nfunction floorAgreement(gate, floorText, otherText) {"],
   ["  const gate = controlGate(blank.text, noiseRead.text);",
    "  console.log(\"  (an additive diagnostic line)\");\n  const gate = controlGate(blank.text, noiseRead.text);"]],
  []);

/* -- the foot: this suite touches nothing committed, MEASURED not asserted ----
 * `git checkout --` losing a session's own work twice in two days is why a
 * restore claim in this repository is only believed when it is measured, and the
 * same standard applies to a claim that nothing needed restoring. */
console.log("\n  [foot] the committed floor this suite READ is byte-identical to its pre-run state");
{
  const now = shaFile(FLOOR), bytes = statSync(FLOOR).size;
  t(`${FLOOR_NAME} unchanged (${bytes} B, sha256 ${now.slice(0, 16)}…)`, { sha: now, bytes }, ORIGIN);
}
/* And by CONTENT as well as by digest — two harnesses here once reported a
   restore byte-identical over an EMPTY manifest, caught only because a digest
   read e3b0c442…, the sha256 of the empty string. `cmp` against a copy taken now
   cannot make that mistake. */
{
  const d = mkdtempSync(join(tmpdir(), "d322-foot-"));
  let clean = true, why = "";
  try {
    copyFileSync(FLOOR, join(d, FLOOR_NAME));
    execFileSync("cmp", [join(d, FLOOR_NAME), FLOOR]);   // throws on any byte difference
  } catch (e) { clean = false; why = e.message; }
  t(`${FLOOR_NAME} cmp-clean against a copy taken now${clean ? "" : ` (${why})`}`, clean, true);
}

console.log(`\nd322-floor-gate-witness: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
