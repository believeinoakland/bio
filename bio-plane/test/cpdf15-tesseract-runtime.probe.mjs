#!/usr/bin/env node
/* CPDF-15 instrument: WHAT DOES wasm TESSERACT COST ON THE DEPLOYED WORKERS
 * RUNTIME, and does it fit? (MEASUREMENTS.md 2026-09-10; DEC-42's CPU question,
 * D-245; the in-account path CPDF-10 waits on.)
 *
 * A PROBE, not in the battery — deliberately NOT named `*.test.mjs`, which is
 * the battery runner's whole discovery rule (`scripts/battery.mjs`: readdir +
 * `endsWith(".test.mjs")`), so it is not discovered and needs no skip marker.
 * It commits no product code and changes nothing the plane runs.
 *
 * WHAT IS ALREADY KNOWN, and it is the entire reason this item exists.
 * DEC-42 (2026-08-04) measured the PLAN and said so in its own entry: a Worker
 * uploaded with `limits.cpu_ms: 50000` was ACCEPTED (HTTP 200, the limit echoed
 * back), so the account is on Workers PAID and the 10 ms Free CPU ceiling that
 * ruled tesseract out is gone. That entry then states, in so many words, what it
 * does NOT establish: "that tesseract actually FITS the CPU envelope in workerd,
 * or that memory holds (a 3300x2550 RGBA frame is 33.6 MB against a 128 MB
 * isolate)". D-245 records the same gap from the other side — CPDF-12 produced
 * no Worker CPU figure and no isolate memory figure, because the renderer was
 * the gate and the engine's own cost was never taken. This probe takes them.
 *
 * THE INSTRUMENT, AND WHY IT IS NOT A STOPWATCH. A Worker CANNOT TIME ITSELF:
 * Cloudflare freezes `Date.now()` across synchronous execution as a timing-attack
 * defence (D-56, `src/cpu.mjs`), so any millisecond a Worker reports about its own
 * compute is invented. Every cpu and memory figure here therefore comes off the
 * PLATFORM's own billing surface — the GraphQL Analytics API,
 *   viewer.accounts.workersInvocationsAdaptive {
 *     sum { cpuTimeUs requests subrequests errors wallTime }
 *     quantiles { cpuTimeP50 cpuTimeP99 wallTimeP50 memoryUsageBytesP50
 *                 memoryUsageBytesP99 }
 *     dimensions { scriptName scriptTag usageModel status } }
 * — through FL-1's gate (`recordCpuMs`), which THROWS on any other provenance.
 * That gate is re-armed here rather than trusted: an empty-shape control and a
 * deliberately self-timed reading are both offered to it and both must be refused.
 *
 * ATTRIBUTION, and it is the instrument's sharpest edge. FL-1 measured that a
 * FRESH script's rows come back with `scriptName` AND `scriptTag` as the literal
 * "__unknown__" — the name has not propagated into the analytics pipeline, and an
 * exact-name filter therefore matches NOTHING. So attribution here is by EXCLUSIVE
 * WINDOW: every arm is invoked inside a window of its own, separated from its
 * neighbours by a quiet gap on both sides, and the arm's rows are the ones the
 * platform reports under a script name that is not one of this account's REAL
 * scripts. This probe's scratch Worker is the only non-real script on the account
 * while it runs, which is checked rather than assumed (the pre-run listing is
 * printed). A window that produces no such row reports NO NUMBER, never a zero.
 *
 * WHAT IT MEASURES, in the item's own order.
 *
 *  (A) cpu_ms PER PAGE, PER RUNG, from the platform, with n stated. CPDF-11's six
 *      rungs are run VERBATIM (its python is read out of `ocr-moondream-probe.mjs`
 *      and executed, never copied), plus two arms that exist so the OCR number can
 *      be read rather than guessed at: INGEST (body in, RGBA frame built, stop) and
 *      INIT (engine created, model loaded, no image). The recognition-only figure
 *      is then ARITHMETIC over three measured arms and is labelled as arithmetic.
 *
 *  (B) MEMORY AGAINST THE 128 MB CEILING. The platform's own
 *      `memoryUsageBytesP50/P99` per arm, plus an OFF-LADDER MEMORY WALK that
 *      finds the ceiling the way this project finds every ceiling: BY BEING
 *      REFUSED. The same page is sent at 1.5x and 2.0x its own pixel dimensions
 *      (RGBA frames of 75.7 MB and 134.6 MB against a 128 MB isolate). NOTE, and
 *      it is a property of CPDF-11's ladder rather than a choice here: every rung
 *      is resized BACK to the page's own dimensions, so the ladder degrades
 *      LEGIBILITY and not SIZE — the memory figure is per FRAME, and the walk is
 *      the only thing in this probe that moves it.
 *
 *  (C) FIDELITY, IN TWO COLUMNS THAT ARE NEVER MIXED (D-306). The anchor page is
 *      the ONE page in this project with human ground truth, so it carries true
 *      character/digit ACCURACY against `GT_PAGE2`. Every corpus page carries
 *      AGREEMENT WITH THE LOCAL-TESSERACT FLOOR reading the same bytes, which is a
 *      different claim wearing similar digits. The columns are named apart and the
 *      report never averages one into the other.
 *
 *  (D) THE INVENTION BAND, AND D-305's BLIND SPOT REPORTED BESIDE IT. Minted
 *      digits are scored with THE FLOOR'S OWN expression, read out of CPDF-9's
 *      file. D-305 measured that expression blind to a digit SUBSTITUTION
 *      ($50,000 -> $10,000 mints zero), so digit-position DISAGREEMENT is reported
 *      here as ITS OWN COLUMN, computed in THIS file. **CPDF-9's floor expressions
 *      are NOT edited** — that is D-305's own instruction (the fix is additive and
 *      belongs to whoever next moves the floor), and editing them mid-measurement
 *      is exactly what the comparability guard below exists to refuse.
 *
 *  (E) REPRODUCIBILITY OVER IDENTICAL BYTES, in two halves. The TEXT half: the
 *      same bytes are OCR'd N times and the distinct transcriptions counted (the
 *      question that returned 2-of-3 for Moondream). The ANCHOR half: word boxes
 *      over the same bytes, compared as exact geometry — the question CPDF-14 died
 *      on, asked of an engine that actually emits coordinates.
 *
 *  (NC1) BLANK AND NOISE. An engine that answers on noise disqualifies itself
 *      whatever its clean score. There is no detection step to short-circuit here
 *      — tesseract transcribes whatever it is handed — so the "forced" half
 *      CPDF-14 had to add is inherent, and both controls are run on the RUNTIME
 *      and on the LOCAL floor, at the anchor page's own dimensions.
 *
 *  (NC2) THE COMPARABILITY GUARD, ARMED. `--controls` copies this probe and the
 *      two files it reads into a temp dir, mutates ONE thing per arm, and runs the
 *      copy with `--guard-only`. Declared before arming: the pristine BASELINE arm
 *      exits 0; the three floor mutations exit 4; the ENGINE mutation exits 5. A
 *      baseline row is here because a harness whose every arm reports the same
 *      thing is indistinguishable from one that never armed.
 *
 *  (NC3) OVER-STRICTNESS. A clean high-fidelity page must pass end to end.
 *      Declared: rung R0 must reach >=95% character accuracy against the human
 *      ground truth on the deployed runtime. If it does not, this instrument is
 *      sabotaging its subject and no verdict it returns is worth anything.
 *
 * COMPARABILITY IS ENFORCED, NOT CLAIMED, and it is enforced over FIVE things.
 * CPDF-9's ground truth (by digest), its `norm`/`levenshteinPairs` and its four
 * metric expressions (asserted literally present), and CPDF-11's ladder recipe (by
 * digest) — CPDF-14's set. Plus, new here and necessary because this item's
 * subject is a piece of vendor code rather than a hosted model: THE ENGINE ITSELF
 * IS PINNED BY DIGEST — the wasm core, the JS glue and the traineddata — because
 * "tesseract" is not a version and a figure from a different build is not
 * comparable with this row. Every floor exit is code 4; the engine exit is code 5;
 * all of them fire BEFORE a byte is uploaded anywhere.
 *
 * NOTHING IS FUNDED, AND THE ACCOUNT IS PINNED FIRST. The scratch Worker is
 * uploaded under this item's own slug, used, DELETED, and the deletion verified
 * twice — a follow-up GET that must read 404, and an independent listing of the
 * whole account that must show no residue. No real slug, no version bump, nothing
 * signed, nothing deployed.
 *
 * THE CEILING BRANCH IS A DELIVERABLE. The plan is re-confirmed BY PROVOCATION
 * today rather than inherited from DEC-42's 2026-08-04 reading: a throwaway script
 * with `limits.cpu_ms: 50000`. If the account is not on Paid, that upload is
 * refused with code 100328, and this probe REPORTS the refusal exactly — the
 * error, the arm, and where the ceiling bit — and STOPS. Funding Paid is DEC-74's
 * open half with Bob and is not this probe's to take.
 *
 * PREREQUISITES: python3 with pypdf and Pillow; network; `.env` carrying
 * CF_TOKEN/CF_ACCT.
 *
 * Run:  node test/cpdf15-tesseract-runtime.probe.mjs [--runs N] [--corpus M]
 *                                                    [--no-walk] [--keep]
 *       node test/cpdf15-tesseract-runtime.probe.mjs --controls     (NC2, the arms)
 *       node test/cpdf15-tesseract-runtime.probe.mjs --guard-only   (what an arm drives)
 *       node test/cpdf15-tesseract-runtime.probe.mjs --digests      (bootstrap: print the pins)
 */
import { execFileSync, execSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, statSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const argv = process.argv.slice(2);
const flagN = (name, dflt) => (argv.includes(name) ? Number(argv[argv.indexOf(name) + 1]) : dflt);
const flagS = (name, dflt) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : dflt);
const RUNS = flagN("--runs", 3);
const CORPUS_PAGES = flagN("--corpus", 3);
const CORPUS_LIMIT = flagN("--corpus-docs", 40);
const WALK = !argv.includes("--no-walk");
const KEEP = argv.includes("--keep");
const GUARD_ONLY = argv.includes("--guard-only");
const CONTROLS = argv.includes("--controls");
const DIGESTS = argv.includes("--digests");
const ENGINE_DIR = flagS("--engine", null);

const PINNED_ACCOUNT = "20b533579290b9b93168345edd3b7f72";
const SLUG = "bio-ocrtess";
/* This account's REAL scripts, listed 2026-09-10 from the account itself. A
   throwaway may never collide with one, and rows carrying one of these names are
   somebody else's traffic and are reported separately, never attributed here. */
const REAL_SCRIPTS = new Set(["agent-worker", "biosmoke7", "civicos", "newgroup", "pdf-worker"]);
const UA = "CivicOS/0.55.0 (+https://github.com/believeinoakland/bio; instance biosmoke7; acquire)";
const ANCHOR_ID = "legistar-attach-15721260";
const ANCHOR_URL = "https://oakland.legistar.com/View.ashx?M=F&ID=15721260&GUID=8F04A287-4A49-44DC-83B7-29FAD97140C2";
const CORPUS_CACHE = join(tmpdir(), "cpdf15-corpus");

/* THE ENGINE, NAMED EXACTLY. "tesseract" is not a version. */
const ENGINE_PKG = "tesseract-wasm@0.11.0";           // the wasm engine, deployed
const FLOOR_PKG = "tesseract.js@7.0.0";               // CPDF-9's local floor instrument
const MODEL_URL = "https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/eng.traineddata";

const sha = (s) => createHash("sha256").update(s).digest("hex");
const shaFile = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const median = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const sleep = (ms) => new Promise((s) => setTimeout(s, ms));
const isoAt = (t) => new Date(t).toISOString().replace(/\.\d+Z$/, "Z");

/* THE PINS. Measured 2026-09-10 from the files named beside them. Each is a thing
 * that, if it moved, would make this row's figures incomparable with the floor
 * printed next to them WITHOUT any expression-level guard noticing. */
const PIN_GT = "17dff6b39a5dfff3010246825537173b928befbeaa94fef6df7afaa94015c37b";      // norm(GT_PAGE2), 2,687 chars
const PIN_LADDER = "34796b3003bc32f0a87aa40bb109bcf3c9b806242a9378c42849b8db4bec6d10";  // CPDF-11's rung recipe, 2,068 chars
/* The ENGINE pins, new in this item: the exact bytes that were deployed. */
const PIN_WASM = "3822dc6ee83d507f2bd2f83b97a3dd5dabf3ea71a9836d951602c9054615137e";   // tesseract-wasm@0.11.0 dist/tesseract-core.wasm (SIMD build), 1,839,004 B
const PIN_LIB = "ed6b39d775484081affa3d21bf491f705673c2a3fd616b2f7bce9020ed8eba13";    // tesseract-wasm@0.11.0 dist/lib.js (vendor, PRE-patch), 97,684 B
const PIN_MODEL = "7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2";  // tessdata_fast eng.traineddata, 4,113,088 B (fetched 2026-09-10)

/* THE TWO ANCHORED SUBSTITUTIONS applied to the vendor glue, and nothing else.
 * Both are asserted present before either is applied; a missing anchor stops the
 * probe rather than silently shipping an unpatched engine that cannot start. */
const LIB_PATCHES = [
  ["async function createOCREngine({ wasmBinary, progressChannel, } = {}) {\n    if (!wasmBinary) {",
   "async function createOCREngine({ wasmBinary, progressChannel, instantiateWasm, locateFile, } = {}) {\n    if (!wasmBinary && !instantiateWasm) {"],
  ["const tessLib = await Module({ wasmBinary });",
   "const tessLib = await Module({ wasmBinary, instantiateWasm, locateFile });"],
];

/* ==========================================================================
 * NC2's ARMS. Run first when asked, because the guards they exercise are the
 * only reason any number below can be printed next to the floor.
 * ======================================================================== */
if (CONTROLS) {
  const SELF = join(HERE, "cpdf15-tesseract-runtime.probe.mjs");
  const FLOOR = join(HERE, "ocr-measure-probe.mjs");
  const MOON = join(HERE, "ocr-moondream-probe.mjs");
  /* The engine arms need an installed engine to mutate, and installing it once
     and copying it per arm is the only way each arm can be armed ALONE. */
  const engRoot = mkdtempSync(join(tmpdir(), "cpdf15-nc-engine-"));
  console.log("=== NC2 — THE COMPARABILITY GUARDS, ARMED. Each arm ALONE, others held open. ===");
  console.log(`installing ${ENGINE_PKG} + fetching the model once, to be copied per arm…`);
  execSync(`npm init -y >/dev/null 2>&1 && npm install --no-audit --no-fund ${ENGINE_PKG} >/dev/null 2>&1`,
    { cwd: engRoot, shell: "/bin/sh" });
  {
    const r = await fetch(MODEL_URL, { headers: { "user-agent": UA } });
    if (!r.ok) { console.error(`model fetch: HTTP ${r.status}`); process.exit(2); }
    writeFileSync(join(engRoot, "eng.traineddata"), Buffer.from(await r.arrayBuffer()));
  }
  copyFileSync(join(engRoot, "node_modules/tesseract-wasm/dist/tesseract-core.wasm"), join(engRoot, "tesseract-core.wasm"));
  copyFileSync(join(engRoot, "node_modules/tesseract-wasm/dist/lib.js"), join(engRoot, "lib.js"));

  /* DECLARED BEFORE ARMING. Each arm mutates exactly ONE thing, others held
     open. `must` is the exit code the arm is REQUIRED to produce. */
  const ARMS = [
    { id: "baseline", must: 0, what: "pristine copies, nothing mutated",
      apply: () => {} },
    { id: "metric", must: 4, what: "the floor's char-accuracy expression moved",
      apply: (d) => {
        const p = join(d, "ocr-measure-probe.mjs"); const s = readFileSync(p, "utf8");
        const from = "(1 - dist / gt.length) * 100";
        if (!s.includes(from)) throw new Error("ARM NEVER ARMED: the expression it mutates is not in the floor");
        writeFileSync(p, s.replace(from, "(1 - dist / Math.max(1, gt.length)) * 100"));
      } },
    { id: "groundtruth", must: 4, what: "ONE DIGIT of the floor's ground truth changed",
      apply: (d) => {
        const p = join(d, "ocr-measure-probe.mjs"); const s = readFileSync(p, "utf8");
        const from = "$21,180,436.10";
        if (!s.includes(from)) throw new Error("ARM NEVER ARMED: the digit string it mutates is not in the ground truth");
        writeFileSync(p, s.replace(from, "$21,180,436.19"));
      } },
    { id: "ladder", must: 4, what: "CPDF-11's rung recipe changed (R3's blur radius)",
      apply: (d) => {
        const p = join(d, "ocr-moondream-probe.mjs"); const s = readFileSync(p, "utf8");
        const from = 'rung("rung3", 0.25, blur=2.0)';
        if (!s.includes(from)) throw new Error("ARM NEVER ARMED: the rung it mutates is not in CPDF-11's recipe");
        writeFileSync(p, s.replace(from, 'rung("rung3", 0.25, blur=2.5)'));
      } },
    { id: "engine", must: 5, what: "ONE BYTE of the deployed wasm engine changed",
      engine: true,
      apply: (d, eng) => {
        const p = join(eng, "tesseract-core.wasm"); const b = readFileSync(p);
        if (b.length < 1_000_000) throw new Error("ARM NEVER ARMED: the wasm core is not where it should be");
        b[b.length - 1] = b[b.length - 1] ^ 0xff;
        writeFileSync(p, b);
      } },
  ];
  console.log("DECLARED: baseline MUST exit 0; the three FLOOR mutations MUST exit 4 (the floor guard's");
  console.log("          own code); the ENGINE mutation MUST exit 5 (the engine guard's own code);");
  console.log("          and every one of them MUST do so BEFORE anything is uploaded.\n");
  let bad = 0;
  for (const a of ARMS) {
    const d = mkdtempSync(join(tmpdir(), `cpdf15-nc-${a.id}-`));
    for (const f of [SELF, FLOOR, MOON]) copyFileSync(f, join(d, f.slice(f.lastIndexOf("/") + 1)));
    const eng = join(d, "engine");
    mkdirSync(eng, { recursive: true });
    for (const f of ["tesseract-core.wasm", "lib.js", "eng.traineddata"]) copyFileSync(join(engRoot, f), join(eng, f));
    let armed = true, why = "";
    try { a.apply(d, eng); } catch (e) { armed = false; why = e.message; }
    const r = armed
      ? spawnSync(process.execPath, [join(d, "cpdf15-tesseract-runtime.probe.mjs"), "--guard-only", "--engine", eng],
          { encoding: "utf8" })
      : null;
    const got = armed ? r.status : -1;
    const ok = armed && got === a.must;
    if (!ok) bad++;
    console.log(`  ${a.id.padEnd(12)} ${a.what.padEnd(52)} declared exit ${a.must}  actual ${got}  ${ok ? "AS DECLARED" : (armed ? "*** NOT AS DECLARED ***" : "*** " + why + " ***")}`);
    if (armed && got !== 0) {
      const line = (r.stderr || "").split("\n").find((l) => l.startsWith("STOP:")) || (r.stderr || "").trim().split("\n")[0] || "";
      console.log(`               refusal said: ${JSON.stringify(line.slice(0, 150))}`);
    }
  }
  console.log(`\nNC2 FOOT REACHED — ${ARMS.length} arms, ${bad} not as declared`);
  process.exit(bad ? 1 : 0);
}

/* ==========================================================================
 * 0. THE ACCOUNT. Asserted before a byte is uploaded (CLAUDE.md: a deploy to
 *    the wrong account SUCCEEDS and nobody notices).
 * ======================================================================== */
let ACCT = null, TOKEN = null;
if (!GUARD_ONLY && !DIGESTS) {
  if (!existsSync(join(REPO, ".env"))) { console.error("no .env at the repo root"); process.exit(2); }
  const ENV = Object.fromEntries(readFileSync(join(REPO, ".env"), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
  ACCT = ENV.CF_ACCT; TOKEN = ENV.CF_TOKEN;
  if (!ACCT || !TOKEN) { console.error("CF_ACCT / CF_TOKEN not in .env"); process.exit(2); }
  if (ACCT !== PINNED_ACCOUNT) {
    console.error("STOP: CF_ACCT is not the pinned project account. Refusing to upload anything.");
    process.exit(3);
  }
  console.log(`account: pinned project account confirmed (${PINNED_ACCOUNT})`);
}

/* ==========================================================================
 * 1. THE COMPARABILITY GUARD. Everything below is read, never copied.
 * ======================================================================== */
const stop = (msg) => {
  console.error(`STOP: ${msg}`);
  console.error("The floor and this probe would stop being comparable, which is the only reason");
  console.error("this probe reads those files instead of holding its own copy. No number is printed.");
  process.exit(4);
};
const stopEngine = (msg) => {
  console.error(`STOP: ${msg}`);
  console.error("A figure from a different engine build is not comparable with this row, and");
  console.error("\"tesseract\" is not a version. No number is printed and nothing is uploaded.");
  process.exit(5);
};
const FLOOR_SRC = readFileSync(join(HERE, "ocr-measure-probe.mjs"), "utf8");
const MOON_SRC = readFileSync(join(HERE, "ocr-moondream-probe.mjs"), "utf8");
const grab = (src, re, what) => { const m = re.exec(src); if (!m) stop(`${what} is gone.`); return m[1]; };

const GT_PAGE2 = grab(FLOOR_SRC, /const GT_PAGE2 = `([\s\S]*?)`;/, "the GT_PAGE2 ground truth");
const NORM_SRC = grab(FLOOR_SRC, /(const norm = \(s\) =>[\s\S]*?;\n)/, "the norm() normaliser");
const LEV_SRC = grab(FLOOR_SRC, /(function levenshteinPairs\(a, b\) \{[\s\S]*?\n\})/, "levenshteinPairs()");
/* The four metric expressions, asserted LITERALLY present in the floor's own
   score() before they are used here. CPDF-11's and CPDF-14's guarantee, unchanged
   — and deliberately NOT extended, because D-305's fifth expression belongs to
   whoever next moves the floor, not to a probe measuring against it. */
const METRIC_EXPRS = [
  "(1 - dist / gt.length) * 100",
  "pairs.filter(([g]) => g && /[0-9]/.test(g)).length",
  "pairs.filter(([g, o]) => g && /[0-9]/.test(g) && g !== o).length",
  "pairs.filter(([g, o]) => o && /[0-9]/.test(o) && (!g || !/[0-9]/.test(g))).length",
];
for (const e of METRIC_EXPRS) {
  if (!FLOOR_SRC.includes(e)) stop(`the floor's scoring expression ${JSON.stringify(e)} is gone from ocr-measure-probe.mjs.`);
}
const { norm, levenshteinPairs } = await import(
  "data:text/javascript," + encodeURIComponent(`${NORM_SRC}\n${LEV_SRC}\nexport { norm, levenshteinPairs };`));

/* CPDF-11's ladder recipe, grabbed rather than copied. */
const LADDER_PY = grab(MOON_SRC, /execFileSync\("python3", \["-c", `([\s\S]*?)`,\s*pdf, work\]/, "CPDF-11's rung recipe");

const GT_DIGEST = sha(norm(GT_PAGE2));
const LADDER_DIGEST = sha(LADDER_PY);

/** The engine pins, checked wherever the engine is (a real install, or an NC2
 *  arm's copy). Returns the three digests so the report can print them. */
function checkEnginePins(dir, { enforce = true } = {}) {
  const files = { wasm: "tesseract-core.wasm", lib: "lib.js", model: "eng.traineddata" };
  const out = {};
  for (const [k, f] of Object.entries(files)) {
    const p = join(dir, f);
    if (!existsSync(p)) stopEngine(`the deployed engine's ${f} is not where this probe put it (${p}).`);
    out[k] = { digest: shaFile(p), bytes: statSync(p).size };
  }
  if (!enforce) return out;
  const pins = { wasm: PIN_WASM, lib: PIN_LIB, model: PIN_MODEL };
  for (const k of Object.keys(files)) {
    if (pins[k] === "PENDING") continue;  // bootstrap only; a real run has all three
    if (out[k].digest !== pins[k]) {
      stopEngine(`the deployed engine's ${files[k]} has MOVED (pinned ${pins[k].slice(0, 16)}…, found ${out[k].digest.slice(0, 16)}…).`);
    }
  }
  return out;
}

if (DIGESTS) {
  console.log(`PIN_GT     = "${GT_DIGEST}"   (norm(GT_PAGE2), ${norm(GT_PAGE2).length} chars)`);
  console.log(`PIN_LADDER = "${LADDER_DIGEST}"   (CPDF-11 rung recipe, ${LADDER_PY.length} chars)`);
  if (ENGINE_DIR) {
    const e = checkEnginePins(ENGINE_DIR, { enforce: false });
    console.log(`PIN_WASM   = "${e.wasm.digest}"   (${ENGINE_PKG} tesseract-core.wasm, ${e.wasm.bytes} B)`);
    console.log(`PIN_LIB    = "${e.lib.digest}"   (${ENGINE_PKG} lib.js, ${e.lib.bytes} B)`);
    console.log(`PIN_MODEL  = "${e.model.digest}"   (tessdata_fast eng.traineddata, ${e.model.bytes} B)`);
  } else {
    console.log("(pass --engine <dir> holding tesseract-core.wasm, lib.js and eng.traineddata for the engine pins)");
  }
  process.exit(0);
}
if (GT_DIGEST !== PIN_GT) stop(`the floor's GROUND TRUTH has moved (pinned ${PIN_GT.slice(0, 16)}…, found ${GT_DIGEST.slice(0, 16)}…).`);
if (LADDER_DIGEST !== PIN_LADDER) stop(`CPDF-11's LADDER RECIPE has moved (pinned ${PIN_LADDER.slice(0, 16)}…, found ${LADDER_DIGEST.slice(0, 16)}…).`);
console.log(`comparability: ground truth ${norm(GT_PAGE2).length} normalised chars, digest pinned; ` +
  `all four floor metric expressions present; CPDF-11's ladder recipe pinned and read, not copied`);

if (GUARD_ONLY) {
  if (ENGINE_DIR) {
    const e = checkEnginePins(ENGINE_DIR);
    console.log(`engine pins: wasm ${e.wasm.digest.slice(0, 12)}… lib ${e.lib.digest.slice(0, 12)}… model ${e.model.digest.slice(0, 12)}… — all as pinned`);
  }
  console.log("guard-only: every comparability guard passed");
  process.exit(0);
}

/** The floor's four numbers, computed with the floor's own expressions, PLUS the
 *  two columns D-305 says the floor cannot see. The floor's file is not touched:
 *  these two live here, and they are named for what they are. */
function stats(gtRaw, ocrRaw) {
  const gt = norm(gtRaw), ocr = norm(ocrRaw);
  const { dist, pairs } = levenshteinPairs(gt, ocr);
  const digTotal = pairs.filter(([g]) => g && /[0-9]/.test(g)).length;
  const digErr = pairs.filter(([g, o]) => g && /[0-9]/.test(g) && g !== o).length;
  const minted = pairs.filter(([g, o]) => o && /[0-9]/.test(o) && (!g || !/[0-9]/.test(g))).length;
  /* D-305, reported BESIDE the floor's columns and never mixed into them: a
     ground-truth digit position whose output character differs at all, and the
     subset where a digit was swapped for ANOTHER DIGIT — the silent class, which
     mints nothing and reads clean. */
  const digDisagree = pairs.filter(([g, o]) => g && /[0-9]/.test(g) && o !== g).length;
  const digSubst = pairs.filter(([g, o]) => g && /[0-9]/.test(g) && o && /[0-9]/.test(o) && o !== g).length;
  return {
    gtLen: gt.length, ocrLen: ocr.length, dist,
    charAcc: gt.length ? (1 - dist / gt.length) * 100 : 0,
    digTotal, digErr, digAcc: digTotal ? (1 - digErr / digTotal) * 100 : 0, minted,
    digDisagree, digSubst,
  };
}

/* ==========================================================================
 * 2. PREREQUISITES, THE ENGINE, AND THE IMAGES.
 * ======================================================================== */
try { execFileSync("python3", ["-c", "import pypdf, PIL"], { stdio: "pipe" }); }
catch { console.error("PREREQUISITE MISSING: python3 with pypdf and Pillow."); process.exit(2); }

const work = mkdtempSync(join(tmpdir(), "cpdf15-tess-"));
console.log("workdir:", work);

console.log(`\ninstalling the engine (${ENGINE_PKG}) and the local floor instrument (${FLOOR_PKG}) into the temp dir —`);
console.log("nothing is added to the repo or to any package.json…");
execSync(`npm init -y >/dev/null 2>&1 && npm install --no-audit --no-fund ${ENGINE_PKG} ${FLOOR_PKG} >/dev/null 2>&1`,
  { cwd: work, shell: "/bin/sh" });
const engDir = join(work, "engine");
mkdirSync(engDir, { recursive: true });
copyFileSync(join(work, "node_modules/tesseract-wasm/dist/tesseract-core.wasm"), join(engDir, "tesseract-core.wasm"));
copyFileSync(join(work, "node_modules/tesseract-wasm/dist/lib.js"), join(engDir, "lib.js"));
{
  const r = await fetch(MODEL_URL, { headers: { "user-agent": UA } });
  if (!r.ok) { console.error(`model fetch: HTTP ${r.status}`); process.exit(2); }
  writeFileSync(join(engDir, "eng.traineddata"), Buffer.from(await r.arrayBuffer()));
}
const ENG = checkEnginePins(engDir);
console.log(`engine pinned: ${ENGINE_PKG} core ${ENG.wasm.bytes.toLocaleString()} B (${ENG.wasm.digest.slice(0, 12)}…), ` +
  `glue ${ENG.lib.bytes.toLocaleString()} B (${ENG.lib.digest.slice(0, 12)}…), ` +
  `tessdata_fast eng ${ENG.model.bytes.toLocaleString()} B (${ENG.model.digest.slice(0, 12)}…)`);
{
  const { gzipSync } = await import("node:zlib");
  const gz = (p) => gzipSync(readFileSync(p), { level: 9 }).length;
  const parts = ["tesseract-core.wasm", "lib.js", "eng.traineddata"].map((f) => [f, statSync(join(engDir, f)).size, gz(join(engDir, f))]);
  const raw = parts.reduce((n, p) => n + p[1], 0), gtot = parts.reduce((n, p) => n + p[2], 0);
  console.log(`deployed payload: ${(raw / 1e6).toFixed(2)} MB raw / ${(gtot / 1e6).toFixed(2)} MB gzip-9 ` +
    `(DEC-42's PLAN figure was 2.72 MB gz — re-measured here, not inherited)`);
  for (const [f, r2, g] of parts) console.log(`    ${f}: ${r2.toLocaleString()} / ${g.toLocaleString()}`);
}

/* the vendor glue, patched at its two anchors and nowhere else */
const patchedLib = (() => {
  let lib = readFileSync(join(engDir, "lib.js"), "utf8");
  for (const [from] of LIB_PATCHES) {
    if (!lib.includes(from)) {
      stopEngine(`the vendor glue's patch anchor ${JSON.stringify(from.slice(0, 48))}… is gone — ` +
        `this engine build cannot be started in workerd without it, and shipping it unpatched would fail at runtime.`);
    }
  }
  for (const [from, to] of LIB_PATCHES) lib = lib.replace(from, to);
  const p = join(work, "lib.patched.js");
  writeFileSync(p, lib);
  console.log(`vendor glue patched at ${LIB_PATCHES.length} anchors (instantiateWasm + locateFile passthrough), ` +
    `${lib.length.toLocaleString()} B, digest ${sha(lib).slice(0, 12)}…`);
  return p;
})();

/* --- the anchor: the one page in this project that has human ground truth. */
const pdf = join(work, `${ANCHOR_ID}.pdf`);
{
  const r = await fetch(ANCHOR_URL, { headers: { "user-agent": UA } });
  if (!r.ok) { console.error(`anchor exhibit fetch: HTTP ${r.status}`); process.exit(1); }
  writeFileSync(pdf, Buffer.from(await r.arrayBuffer()));
}
console.log(`\nanchor exhibit: ${ANCHOR_ID}.pdf ${statSync(pdf).size.toLocaleString()} B`);
/* CPDF-11's own python, executed verbatim: the same page extraction (including
   the /Rotate 270 correction), the same two controls, the same six rungs. */
execFileSync("python3", ["-c", LADDER_PY, pdf, work], { stdio: ["ignore", "inherit", "inherit"] });
const PAGE = join(work, "page1.png");
if (!existsSync(PAGE)) { console.error("the anchor page image was not produced"); process.exit(1); }

/** PNG -> raw 8-bit grayscale, which is what the Worker is sent (it expands to
 *  RGBA inside the isolate, where the ceiling is). Returns {path, w, h}. */
function toRaw(png, tag, scale = 1) {
  const out = join(work, `raw-${tag}.gray`);
  const dims = execFileSync("python3", ["-c", `
from PIL import Image
import sys
im = Image.open(sys.argv[1]).convert("L")
s = float(sys.argv[4])
if s != 1.0:
    im = im.resize((max(1,int(im.width*s)), max(1,int(im.height*s))), Image.LANCZOS)
open(sys.argv[2], "wb").write(im.tobytes())
print(im.width, im.height)
`, png, out, tag, String(scale)], { encoding: "utf8" }).trim().split(/\s+/).map(Number);
  return { path: out, w: dims[0], h: dims[1] };
}
const anchorRaw = toRaw(PAGE, "page1");
console.log(`anchor page: ${anchorRaw.w}x${anchorRaw.h} = ${(anchorRaw.w * anchorRaw.h).toLocaleString()} px; ` +
  `raw grayscale ${(anchorRaw.w * anchorRaw.h / 1e6).toFixed(2)} MB sent, ` +
  `RGBA frame ${(anchorRaw.w * anchorRaw.h * 4 / 1e6).toFixed(2)} MB built INSIDE the isolate ` +
  `(DEC-42's 33.6 MB, re-measured on this page's real dimensions)`);

/* --- the corpus beyond the anchor: real Oakland PDFs, image-only pages only.
   The same harvest CPDF-12's census and CPDF-14 used. NO HUMAN GROUND TRUTH
   EXISTS for these pages, so they carry AGREEMENT WITH THE FLOOR and nothing
   else (D-306). */
mkdirSync(CORPUS_CACHE, { recursive: true });
const corpusDocs = [];
let census = { docs: 0, pages: 0, unreadable: 0, textPages: 0, novector: 0, imageOnly: 0, extracted: [] };
if (CORPUS_PAGES > 0) {
  const wanted = [];
  try {
    const matters = await (await fetch(
      `https://webapi.legistar.com/v1/oakland/matters?%24top=40&%24orderby=MatterLastModifiedUtc%20desc`,
      { headers: { "user-agent": UA } })).json();
    for (const m of matters) {
      if (wanted.length >= CORPUS_LIMIT) break;
      let atts = [];
      try {
        atts = await (await fetch(`https://webapi.legistar.com/v1/oakland/matters/${m.MatterId}/attachments`,
          { headers: { "user-agent": UA } })).json();
      } catch { continue; }
      for (const a of atts) {
        if (wanted.length >= CORPUS_LIMIT) break;
        if (!a.MatterAttachmentHyperlink) continue;
        wanted.push({ id: `legistar-${a.MatterAttachmentId}`, url: a.MatterAttachmentHyperlink });
      }
    }
  } catch (e) { console.log(`  ! Legistar matter listing unavailable (${e.message})`); }
  for (const w of wanted) {
    const p = join(CORPUS_CACHE, `${w.id}.pdf`);
    try {
      if (!existsSync(p)) {
        const r = await fetch(w.url, { headers: { "user-agent": UA }, redirect: "follow" });
        if (!r.ok) continue;
        writeFileSync(p, Buffer.from(await r.arrayBuffer()));
      }
      const b = readFileSync(p);
      if (b[0] !== 0x25 || b[1] !== 0x50) continue;
      corpusDocs.push({ ...w, path: p, size: b.length });
    } catch { /* a document that will not fetch is not a finding about pages */ }
  }
  console.log(`corpus harvested: ${corpusDocs.length} real Oakland PDFs ` +
    `(${(corpusDocs.reduce((n, d) => n + d.size, 0) / 1e6).toFixed(1)} MB), cached in ${CORPUS_CACHE}`);
  if (corpusDocs.length) {
    const corpusDir = join(work, "corpus");
    mkdirSync(corpusDir, { recursive: true });
    const manifest = join(work, "corpus-manifest.json");
    writeFileSync(manifest, JSON.stringify(corpusDocs.map((d) => ({ id: d.id, path: d.path }))));
    const out = execFileSync("python3", ["-c", `
import sys, json
from pypdf import PdfReader
from PIL import Image
docs = json.load(open(sys.argv[1])); outdir = sys.argv[2]; want = int(sys.argv[3])
res = {"docs":0,"pages":0,"unreadable":0,"textPages":0,"novector":0,"imageOnly":0,"extracted":[]}
for d in docs:
    try: r = PdfReader(d["path"])
    except Exception: res["unreadable"] += 1; continue
    if getattr(r, "is_encrypted", False):
        try: r.decrypt("")
        except Exception: res["unreadable"] += 1; continue
    res["docs"] += 1
    got = 0
    for i, p in enumerate(r.pages):
        res["pages"] += 1
        try:
            txt = (p.extract_text() or "").strip()
            fonts = (p.get("/Resources", {}) or {}).get("/Font")
            imgs = list(p.images)
        except Exception:
            res["unreadable"] += 1; continue
        if txt or fonts: res["textPages"] += 1; continue
        if not imgs: res["novector"] += 1; continue
        res["imageOnly"] += 1
        if got >= 1 or len(res["extracted"]) >= want: continue
        try:
            im = imgs[0].image
            im = im.convert("L" if im.mode == "1" else im.mode)
            rot = int(p.get("/Rotate", 0) or 0) % 360
            # A PAGE IS NOT ITS IMAGE (CPDF-12's first failure). /Rotate is applied.
            if rot: im = im.rotate(360 - rot, expand=True)
            if im.width < 600 or im.height < 600: continue
            f = "%s/%s-p%d.png" % (outdir, d["id"], i)
            im.save(f)
            res["extracted"].append({"id": d["id"], "page": i, "file": f, "w": im.width, "h": im.height, "rotate": rot})
            got += 1
        except Exception:
            pass
print(json.dumps(res))
`, manifest, corpusDir, String(CORPUS_PAGES)], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    census = JSON.parse(out.trim().split("\n").pop());
  }
  console.log(`corpus census: ${census.docs} readable PDFs, ${census.pages} pages — ` +
    `${census.textPages} carry a text layer, ${census.novector} have neither text nor image, ` +
    `${census.imageOnly} are IMAGE-ONLY (the class OCR is for)`);
  console.log(`corpus pages taken forward: ${census.extracted.length}` +
    (census.extracted.length ? "" : "   <-- ZERO from the harvest"));
  /* THE FALLBACK, AND IT EXISTS BECAUSE THE FIRST RUN OF THIS PROBE NEEDED IT.
     On 2026-09-10 the same harvest CPDF-14 used (the 40 most recently modified
     Legistar matters' attachments) censused 1,377 pages and found **ZERO**
     image-only ones, where CPDF-14's pass over the same surface weeks earlier
     found 13 of 1,458 concentrated in two documents. The class is RARE and
     CLUMPED, so which 40 matters are recent decides whether the agreement column
     has anything in it at all — a property of the corpus, not of the engine.
     Rather than report an empty column, the ANCHOR EXHIBIT'S OTHER PAGES are
     used: the same scanned 4-page resolution, pages 1, 3 and 4, which are
     image-only on the same test and carry NO human ground truth. They are a
     WEAKER corpus than three unrelated documents would be — one document, one
     scanner, one day — and the report says so beside the number rather than
     letting "corpus" imply a reach it does not have. */
  if (!census.extracted.length) {
    console.log(`  FALLBACK: the harvest found no image-only page, so the agreement column is measured on`);
    console.log(`  the ANCHOR EXHIBIT'S OTHER PAGES — image-only on the same test, NO human ground truth,`);
    console.log(`  and a WEAKER reach than unrelated documents would be (one document, one scanner).`);
    for (const p of [0, 2, 3]) {
      const f = join(work, `page${p}.png`);
      if (!existsSync(f) || census.extracted.length >= CORPUS_PAGES) continue;
      const dims = execFileSync("python3", ["-c",
        `from PIL import Image\nimport sys\nim=Image.open(sys.argv[1])\nprint(im.width, im.height)`, f],
        { encoding: "utf8" }).trim().split(/\s+/).map(Number);
      census.extracted.push({ id: `${ANCHOR_ID}-SAME-DOCUMENT`, page: p, file: f, w: dims[0], h: dims[1], rotate: 270 });
    }
  }
  for (const e of census.extracted) console.log(`    ${e.id} page ${e.page} — ${e.w}x${e.h}, /Rotate ${e.rotate}`);
}

/* ==========================================================================
 * 3. THE PLAN, RE-CONFIRMED BY PROVOCATION — and the CEILING BRANCH.
 * ======================================================================== */
const base = `https://api.cloudflare.com/client/v4/accounts/${ACCT}`;
const api = `${base}/workers/scripts/${SLUG}`;
const H = { authorization: `Bearer ${TOKEN}` };
const PROBE_TOKEN = randomBytes(16).toString("hex");

const preList = await (await fetch(`${base}/workers/scripts`, { headers: H })).json();
const preNames = (preList.result || []).map((w) => w.id);
console.log(`\naccount listing BEFORE anything is uploaded: ${JSON.stringify(preNames)}`);
if (preNames.includes(SLUG)) {
  console.error(`STOP: ${SLUG} already exists on the account. Refusing to overwrite something this probe did not create.`);
  process.exit(2);
}
for (const n of preNames) {
  if (!REAL_SCRIPTS.has(n)) {
    console.log(`  ! ${n} is on the account and is not in this probe's REAL_SCRIPTS set — ` +
      `attribution below assumes this probe's script is the only non-real script emitting traffic, so this is stated.`);
  }
}

const formOf = (parts, meta) => {
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  for (const [name, path, type] of parts) fd.append(name, new Blob([readFileSync(path)], { type }), name);
  return fd;
};
console.log("\n== the plan, re-confirmed by PROVOKING the platform today (never inherited from DEC-42's reading) ==");
const planSrc = join(work, "plan.mjs");
writeFileSync(planSrc, "export default { async fetch(){ return new Response('ok'); } };\n");
const planUp = await fetch(api, { method: "PUT", headers: H,
  body: formOf([["index.mjs", planSrc, "application/javascript+module"]],
    { main_module: "index.mjs", compatibility_date: "2026-07-01", limits: { cpu_ms: 50000 } }) });
const planJson = await planUp.json().catch(() => null);
const PLAN = planUp.ok && planJson && planJson.success
  ? { paid: true, evidence: `HTTP ${planUp.status}, limits.cpu_ms=50000 ACCEPTED`, echoed: planJson.result && planJson.result.limits }
  : { paid: false, evidence: `HTTP ${planUp.status}`, service_said: planJson && planJson.errors };
console.log(`  ${PLAN.paid ? "Workers PAID" : "Workers FREE"} — ${PLAN.evidence}` +
  (PLAN.paid ? ` (echoed ${JSON.stringify(PLAN.echoed)})` : ` ${JSON.stringify(PLAN.service_said)}`));
if (!PLAN.paid) {
  console.log("\n=== THE MEASURED CEILING REFUSAL — this is the deliverable in this branch ===");
  console.log(`  arm: the plan provocation (a throwaway script with limits.cpu_ms=50000)`);
  console.log(`  the service said: ${JSON.stringify(PLAN.service_said)}`);
  console.log(`  On Free the per-invocation CPU ceiling is 10 ms. Tesseract's own page cost is ORDERS`);
  console.log(`  above that (CPDF-9 measured ~17-54M reference iterations per page as a node proxy), so`);
  console.log(`  the ladder is not run: it would measure a refusal, not an engine. STOPPING HERE.`);
  console.log(`  Funding Workers Paid is inside DEC-74 with Bob and is not this probe's to take.`);
  const d = await fetch(api, { method: "DELETE", headers: H });
  const g = await fetch(api, { headers: H });
  console.log(`  teardown: DELETE HTTP ${d.status}; follow-up GET HTTP ${g.status} — ${g.status === 404 ? "VERIFIED GONE" : "*** STILL PRESENT ***"}`);
  const l = await (await fetch(`${base}/workers/scripts`, { headers: H })).json();
  console.log(`  independent account listing: ${JSON.stringify((l.result || []).map((w) => w.id))}`);
  process.exit(0);
}

/* ==========================================================================
 * 4. THE SCRATCH WORKER — this item's own source, the pinned engine, uploaded
 *    under this item's own slug. Used, deleted, and the deletion VERIFIED.
 * ======================================================================== */
const CPU_LIMIT_ASK = 300000;
let LIMITS = { asked: CPU_LIMIT_ASK, accepted: null, service_said: null, echoed: null };
{
  const parts = [
    ["index.mjs", join(HERE, "cpdf15-tesseract-worker.mjs"), "application/javascript+module"],
    ["lib.js", patchedLib, "application/javascript+module"],
    ["tesseract-core.wasm", join(engDir, "tesseract-core.wasm"), "application/wasm"],
    ["eng.traineddata", join(engDir, "eng.traineddata"), "application/octet-stream"],
  ];
  const meta = (limits) => ({
    main_module: "index.mjs", compatibility_date: "2026-07-01",
    ...(limits ? { limits } : {}),
    bindings: [{ type: "plain_text", name: "PROBE", text: PROBE_TOKEN }],
  });
  let r = await fetch(api, { method: "PUT", headers: H, body: formOf(parts, meta({ cpu_ms: CPU_LIMIT_ASK })) });
  let j = await r.json().catch(() => null);
  if (j && j.success) { LIMITS.accepted = true; LIMITS.echoed = j.result && j.result.limits; }
  else {
    LIMITS.accepted = false; LIMITS.service_said = j && j.errors;
    r = await fetch(api, { method: "PUT", headers: H, body: formOf(parts, meta(null)) });
    j = await r.json().catch(() => null);
  }
  console.log(`\nscratch worker upload: HTTP ${r.status} success=${j && j.success}` +
    (j && !j.success ? " " + JSON.stringify(j.errors).slice(0, 400) : "") +
    ` [cpu_ms=${CPU_LIMIT_ASK} ${LIMITS.accepted ? "ACCEPTED" : "REFUSED — " + JSON.stringify(LIMITS.service_said)}]`);
  if (!j || !j.success) process.exit(1);
  await fetch(api + "/subdomain", {
    method: "POST", headers: { ...H, "content-type": "application/json" },
    body: JSON.stringify({ enabled: true, previews_enabled: false }),
  });
}
const sub = (await (await fetch(`${base}/workers/subdomain`, { headers: H })).json()).result.subdomain;
const URLBASE = `https://${SLUG}.${sub}.workers.dev`;
console.log("scratch worker:", URLBASE);

let DELETED = null, LISTING_AFTER = null;
async function teardown() {
  if (KEEP) { console.log(`\nscratch worker LEFT UP at ${URLBASE} (--keep)`); return; }
  const r = await fetch(api, { method: "DELETE", headers: H });
  /* THE DELETION IS VERIFIED, NOT ASSUMED, AND THEN VERIFIED AGAIN INDEPENDENTLY.
     A 200 on DELETE is the service saying it accepted the request; a 404 on the
     GET is the account saying the script is gone; and a listing of every script
     on the account is the only thing that can show NO RESIDUE of any kind. */
  const g = await fetch(api, { headers: H });
  const l = await (await fetch(`${base}/workers/scripts`, { headers: H })).json();
  const names = (l.result || []).map((w) => w.id);
  DELETED = { del: r.status, get: g.status, gone: g.status === 404 };
  LISTING_AFTER = names;
  console.log(`\nscratch worker deleted: DELETE HTTP ${r.status}; follow-up GET HTTP ${g.status} — ` +
    `${g.status === 404 ? "VERIFIED GONE from the account" : "*** STILL PRESENT — NOT VERIFIED GONE ***"}`);
  console.log(`independent post-run account listing: ${JSON.stringify(names)} — ` +
    `${names.includes(SLUG) ? "*** RESIDUE ***" : "zero residue from this probe"}`);
}
process.on("exit", () => {
  if (!KEEP && DELETED === null) console.error("\n*** the scratch worker teardown did not run — it may still be up ***");
});

/* ==========================================================================
 * 5. THE PLATFORM INSTRUMENT and FL-1's provenance gate, re-armed here.
 * ======================================================================== */
const PLATFORM_SOURCES = new Set(["graphql:workersInvocationsAdaptive"]);
class FabricatedMeasurement extends Error {}
/** The ONLY way a cpu figure enters this probe's findings (FL-1's gate, same
 *  shape, same refusal). A Worker cannot time itself; a millisecond it reports
 *  about its own compute is a fabrication and is refused rather than caveated. */
function recordCpuMs(reading) {
  if (!reading || typeof reading !== "object") throw new FabricatedMeasurement("no reading");
  if (reading.provenance !== "platform-observed") {
    throw new FabricatedMeasurement(
      `REFUSED: provenance ${JSON.stringify(reading.provenance)} is not the platform's observed billing ` +
      `surface. A Worker cannot time itself (D-56, src/cpu.mjs); a millisecond it reports about its own ` +
      `compute is a fabrication, and this probe will not record one.`);
  }
  if (!PLATFORM_SOURCES.has(reading.source)) throw new FabricatedMeasurement(`REFUSED: source ${JSON.stringify(reading.source)} is not an allowed instrument`);
  if (!Number.isFinite(reading.cpu_ms)) throw new FabricatedMeasurement("REFUSED: cpu_ms is not a number");
  return { cpu_ms: reading.cpu_ms, source: reading.source };
}
const Q_WINDOW = `query($a:String!,$from:Time!,$to:Time!){
  viewer { accounts(filter:{accountTag:$a}) {
    workersInvocationsAdaptive(limit:200, filter:{datetime_geq:$from, datetime_leq:$to}) {
      sum { cpuTimeUs requests subrequests errors wallTime responseBodySize }
      quantiles { cpuTimeP50 cpuTimeP99 wallTimeP50 durationP50 memoryUsageBytesP50 memoryUsageBytesP99 }
      dimensions { scriptName scriptTag usageModel status }
    } } } }`;
async function readWindow(fromISO, toISO) {
  const r = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST", headers: { ...H, "content-type": "application/json" },
    body: JSON.stringify({ query: Q_WINDOW, variables: { a: ACCT, from: fromISO, to: toISO } }),
  });
  const j = await r.json().catch(() => null);
  if (!j || j.errors) return { error: (j && j.errors ? j.errors.map((e) => e.message) : [`HTTP ${r.status}`]) };
  const rows = (j.data && j.data.viewer && j.data.viewer.accounts && j.data.viewer.accounts[0]
    && j.data.viewer.accounts[0].workersInvocationsAdaptive) || [];
  return {
    mine: rows.filter((x) => !REAL_SCRIPTS.has(x.dimensions.scriptName)),
    theirs: rows.filter((x) => REAL_SCRIPTS.has(x.dimensions.scriptName)),
  };
}

/* ==========================================================================
 * 6. THE ARMS. Each one is invoked inside a window of its own, and the windows
 *    are kept EXCLUSIVE by quiet gaps on both sides — the only attribution a
 *    fresh script allows (FL-1: its name is "__unknown__" to the surface).
 * ======================================================================== */
const GAP_MS = 20000;        // quiet before an arm's window opens
const PAD_BEFORE_MS = 5000;  // the window opens slightly before the first request
const PAD_AFTER_MS = 60000;  // and closes well after the last, so a late timestamp is not clipped
const QUIET_AFTER_MS = 65000;// nothing is invoked until the previous window has closed

const hit = async (qs, body, timeoutMs = 600000) => {
  const t0 = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const r = await fetch(`${URLBASE}/?${qs}`, {
      method: "POST", headers: { "x-probe": PROBE_TOKEN }, body, signal: ac.signal, cache: "no-store",
    });
    const t = await r.text();
    let j = null; try { j = JSON.parse(t); } catch { /* an edge error page is not an answer */ }
    /* WHEN THE RUNTIME KILLS AN INVOCATION THERE IS NO JSON — the isolate dies and
       the EDGE answers with its own HTML page. The only thing in that page worth
       keeping is Cloudflare's numeric error code, which says WHICH limit was hit
       (1102 = the Worker exceeded its resource limits). Truncating the page to
       its first 200 bytes throws that away, which the first run of this probe
       did: the walk arm reported "503 <!DOCTYPE html>" and nothing else. */
    const code = j ? null : (/error code:\s*(\d+)/i.exec(t) || [])[1] || null;
    return { status: r.status, body: j, cf_code: code,
      cf_ray: r.headers.get("cf-ray"),
      text: j ? undefined : (code ? `edge error page, Cloudflare error code ${code}` : t.slice(0, 160)),
      wall: Date.now() - t0 };
  } catch (e) {
    return { status: 0, error: `${e.name}: ${e.message}`, wall: Date.now() - t0 };
  } finally { clearTimeout(timer); }
};

/* D-108's lesson: the upload landing is not the new build serving. */
{
  let ready = false;
  const t0 = Date.now();
  for (let i = 1; i <= 40 && !ready; i++) {
    const p = await hit("mode=ping", "");
    if (p.status === 200 && p.body && p.body.ok) {
      ready = true;
      console.log(`scratch worker ready after ${Math.round((Date.now() - t0) / 1000)}s (${i} ping${i === 1 ? "" : "s"}) — ` +
        `wasm arrived as a WebAssembly.Module: ${p.body.wasm_is_module}; model ${p.body.model_bytes.toLocaleString()} B`);
    } else await sleep(3000);
  }
  if (!ready) {
    console.error("scratch worker never answered a ping with this run's gate — refusing to measure.");
    await teardown(); process.exit(1);
  }
  /* the pings are traffic too: let their window close before the first arm */
  await sleep(QUIET_AFTER_MS);
}

const ARMS = [];
/** Run one arm inside its own exclusive window. `calls` is a list of
 *  {qs, body} — every call in an arm is the SAME work, so the platform's mean
 *  over the window is a mean over identical invocations. */
async function runArm(id, what, calls, { timeoutMs = 600000 } = {}) {
  await sleep(GAP_MS);
  const from = isoAt(Date.now() - PAD_BEFORE_MS);
  const runs = [];
  for (const c of calls) runs.push(await hit(c.qs, c.body, timeoutMs));
  const to = isoAt(Date.now() + PAD_AFTER_MS);
  const arm = { id, what, sent: calls.length, window: { from, to }, runs };
  ARMS.push(arm);
  const ok = runs.filter((r) => r.status === 200 && r.body && r.body.ok).length;
  console.log(`  ${id.padEnd(12)} ${ok}/${runs.length} answered ok; client wall ` +
    `${Math.min(...runs.map((r) => r.wall))}–${Math.max(...runs.map((r) => r.wall))} ms` +
    (ok < runs.length ? `  <-- ${JSON.stringify(runs.find((r) => !(r.body && r.body.ok)) || {}).slice(0, 240)}` : ""));
  await sleep(QUIET_AFTER_MS);
  return arm;
}

const rawBody = (r) => readFileSync(r.path);
const qsFor = (r, mode) => `mode=${mode}&w=${r.w}&h=${r.h}`;

console.log(`\n=== THE ARMS — one exclusive analytics window each, ${RUNS} invocations per ladder rung ===`);

/* (A0) INGEST: body in, RGBA frame built, stop. The floor every OCR number is
   read against, and the arm that prices the 33.6 MB frame on its own. */
await runArm("ingest", "body in + RGBA frame built, no engine",
  Array.from({ length: RUNS + 2 }, () => ({ qs: qsFor(anchorRaw, "ingest"), body: rawBody(anchorRaw) })));

/* (A1) INIT: engine created and model loaded, no image. What a cold fleet
   member pays before it has read a single pixel. */
await runArm("init", "engine created + model loaded, no image",
  Array.from({ length: RUNS }, () => ({ qs: "mode=init", body: "" })));

/* (A) THE LADDER, on the deployed runtime. */
const RUNGS = [
  ["R0", "rung0", "300 dpi, the original page"],
  ["R1", "rung1", "150 dpi equivalent"],
  ["R2", "rung2", "75 dpi equivalent"],
  ["R3", "rung3", "75 dpi + gaussian blur 2.0"],
  ["R4", "rung4", "37.5 dpi + gaussian blur 3.0"],
  ["C1", "contrast", "OFF-LADDER: contrast collapsed to 16 greys"],
];
const rungRaw = {};
for (const [id, file] of RUNGS) rungRaw[id] = toRaw(join(work, `${file}.png`), file);
for (const [id, , desc] of RUNGS) {
  const r = rungRaw[id];
  await runArm(id, desc, Array.from({ length: RUNS }, () => ({ qs: qsFor(r, "ocr"), body: rawBody(r) })));
}

/* (E, second half) THE ANCHOR: word boxes over identical bytes. */
await runArm("boxes", "R0 again, with word boxes — the anchor question, asked of an engine that emits coordinates",
  Array.from({ length: RUNS }, () => ({ qs: qsFor(rungRaw.R0, "boxes"), body: rawBody(rungRaw.R0) })));

/* (NC1) BLANK AND NOISE, at the anchor page's own dimensions. */
const ncRaw = {
  blank: toRaw(join(work, "control-blank.png"), "control-blank"),
  noise: toRaw(join(work, "control-noise.png"), "control-noise"),
};
for (const k of ["blank", "noise"]) {
  await runArm(`nc-${k}`, `NEGATIVE CONTROL: ${k} page at ${ncRaw[k].w}x${ncRaw[k].h}`,
    Array.from({ length: 2 }, () => ({ qs: qsFor(ncRaw[k], "ocr"), body: rawBody(ncRaw[k]) })));
}

/* (B) THE MEMORY WALK, OFF-LADDER. Found the way every ceiling here is found. */
const walkRaw = {};
/* THE WALK POINTS, AND THE FIRST RUN CHOSE THEM WRONG. It walked 1.5x and 2.0x
   expecting the smaller one to survive; 1.5x (a 75.7 MB RGBA frame) was KILLED
   0/2 — the edge answered with its own error page, which is what a dead isolate
   looks like from outside. So the ceiling is somewhere between the page's own
   33.7 MB frame, which completes, and 75.7 MB, which does not, and a walk whose
   points are both on the far side of a ceiling does not locate it. These three
   bracket it. */
const WALK_POINTS = [1.2, 1.35, 1.5];
if (WALK) {
  for (const s of WALK_POINTS) {
    const r = toRaw(PAGE, `walk-${s}`, s);
    walkRaw[s] = r;
    await runArm(`walk-${s}x`, `OFF-LADDER MEMORY WALK: the page at ${s}x its own dimensions ` +
      `(${r.w}x${r.h}, RGBA frame ${(r.w * r.h * 4 / 1e6).toFixed(1)} MB against a 128 MB isolate)`,
      Array.from({ length: 2 }, () => ({ qs: qsFor(r, "ocr"), body: rawBody(r) })));
  }
}

/* (C, agreement half) THE CORPUS. */
const corpusRaw = [];
for (const e of census.extracted) {
  const r = toRaw(e.file, `corp-${e.id}-p${e.page}`);
  corpusRaw.push({ ...e, raw: r });
  await runArm(`corp-${corpusRaw.length}`, `${e.id} p${e.page} (${r.w}x${r.h}) — AGREEMENT WITH THE FLOOR, never accuracy`,
    Array.from({ length: 2 }, () => ({ qs: qsFor(r, "ocr"), body: rawBody(r) })));
}

/* ==========================================================================
 * 7. THE LOCAL FLOOR — CPDF-9's own instrument, on the same bytes. It says what
 *    a conventional tesseract reads; the deployed engine never grades itself.
 * ======================================================================== */
console.log(`\n=== THE LOCAL FLOOR (${FLOOR_PKG}, tessdata_fast eng — CPDF-9's instrument, re-measured not inherited) ===`);
const { createWorker } = await import(join(work, "node_modules/tesseract.js/src/index.js"));
/* cachePath keeps the traineddata cache in the temp dir; langPath serves the
   SAME tessdata_fast model the Worker carries (CPDF-9 found the hard way that a
   shared cache silently serves one model's bytes for another's run). */
const langPath = join(work, "floor-lang"), cachePath = join(work, "floor-cache");
mkdirSync(langPath, { recursive: true }); mkdirSync(cachePath, { recursive: true });
copyFileSync(join(engDir, "eng.traineddata"), join(langPath, "eng.traineddata"));
const floorWorker = await createWorker("eng", 1, { langPath, gzip: false, cachePath });
const floorRead = async (png) => norm((await floorWorker.recognize(png)).data.text);
const floorText = {};
for (const [id, file] of RUNGS) {
  floorText[id] = await floorRead(join(work, `${file}.png`));
  console.log(`  floor ${id}: ${floorText[id].length} chars`);
}
for (const k of ["blank", "noise"]) {
  floorText[`nc-${k}`] = await floorRead(join(work, `control-${k}.png`));
  console.log(`  floor nc-${k}: ${JSON.stringify(floorText[`nc-${k}`].slice(0, 80))} (${floorText[`nc-${k}`].length} chars)`);
}
for (let i = 0; i < corpusRaw.length; i++) {
  floorText[`corp-${i + 1}`] = await floorRead(corpusRaw[i].file);
  console.log(`  floor corp-${i + 1}: ${floorText[`corp-${i + 1}`].length} chars`);
}
await floorWorker.terminate();

/* ==========================================================================
 * 8. READ THE BILLING SURFACE, per arm, by that arm's own window.
 * ======================================================================== */
console.log("\n=== THE PLATFORM'S OWN OBSERVATION (polling for ingestion; NO NUMBER rather than a stale zero) ===");
const armStats = {};
for (let poll = 1; poll <= 30; poll++) {
  let missing = 0;
  for (const a of ARMS) {
    if (armStats[a.id] && armStats[a.id].ok) continue;
    const r = await readWindow(a.window.from, a.window.to);
    if (r.error) { missing++; continue; }
    const mine = r.mine || [];
    if (!mine.length) { missing++; continue; }
    const requests = mine.reduce((n, x) => n + (x.sum.requests || 0), 0);
    const cpuUs = mine.reduce((n, x) => n + (x.sum.cpuTimeUs || 0), 0);
    armStats[a.id] = {
      ok: true, rows: mine, theirs: r.theirs || [], requests, cpuUs,
      errors: mine.reduce((n, x) => n + (x.sum.errors || 0), 0),
      wallMs: mine.reduce((n, x) => n + (x.sum.wallTime || 0), 0) / 1000,
      memP50: Math.max(...mine.map((x) => x.quantiles.memoryUsageBytesP50 || 0)),
      memP99: Math.max(...mine.map((x) => x.quantiles.memoryUsageBytesP99 || 0)),
      cpuP50: Math.max(...mine.map((x) => x.quantiles.cpuTimeP50 || 0)),
      cpuP99: Math.max(...mine.map((x) => x.quantiles.cpuTimeP99 || 0)),
      statuses: mine.map((x) => `${x.dimensions.status}:${x.sum.requests}`).join(","),
    };
  }
  const got = ARMS.filter((a) => armStats[a.id] && armStats[a.id].ok).length;
  console.log(`  poll ${poll}: ${got}/${ARMS.length} arms have a platform row`);
  if (!missing) break;
  await sleep(20000);
}

/** cpu per invocation, through FL-1's gate. Never a number this probe made up. */
function cpuOf(id) {
  const s = armStats[id];
  if (!s || !s.ok || !s.requests) return null;
  return recordCpuMs({ cpu_ms: s.cpuUs / 1000 / s.requests, provenance: "platform-observed",
    source: "graphql:workersInvocationsAdaptive" }).cpu_ms;
}

/* THE GATE, ARMED — it must refuse a self-timed reading and every empty shape,
   and must still accept a real platform reading. A control that also accepts
   nothing asserts nothing. */
const gateArms = [];
for (const bad of [undefined, null, {}, { cpu_ms: 12 },
                   { cpu_ms: 12, provenance: "worker-self-clock", source: "worker:Date.now" },
                   { cpu_ms: 12, provenance: "platform-observed", source: "vendor-docs" },
                   { provenance: "platform-observed", source: "graphql:workersInvocationsAdaptive" }]) {
  try { recordCpuMs(bad); gateArms.push({ input: JSON.stringify(bad) || "undefined", REFUSED: false }); }
  catch { gateArms.push({ input: JSON.stringify(bad) || "undefined", REFUSED: true }); }
}
const gateAccepts = (() => { try {
  return !!recordCpuMs({ cpu_ms: 1, provenance: "platform-observed", source: "graphql:workersInvocationsAdaptive" });
} catch { return false; } })();

/* ==========================================================================
 * 9. THE REPORT.
 * ======================================================================== */
const textOf = (arm) => arm.runs.map((r) => (r.body && r.body.ok && typeof r.body.text === "string") ? norm(r.body.text) : null);
const armById = (id) => ARMS.find((a) => a.id === id);
const fmtMB = (b) => b === null || b === undefined ? "—" : `${(b / 1e6).toFixed(1)} MB`;
const fmtMs = (x) => x === null ? "NO NUMBER" : `${x.toFixed(1)}`;

const ingestCpu = cpuOf("ingest"), initCpu = cpuOf("init");
console.log(`\n=== (A) cpu_ms PER PAGE, FROM THE PLATFORM — n = invocations the platform SAW in the arm's window ===`);
console.log(`  ARM       | what it is                                   | n(sent/seen) | cpu_ms/inv | cpuP99 ms | wall ms/inv | mem P50 | mem P99 | status`);
for (const a of ARMS) {
  const s = armStats[a.id];
  const cpu = cpuOf(a.id);
  console.log(`  ${a.id.padEnd(9)} | ${a.what.slice(0, 44).padEnd(44)} | ` +
    `${String(`${a.sent}/${s && s.ok ? s.requests : "—"}`).padEnd(12)} | ` +
    `${fmtMs(cpu).padEnd(10)} | ${(s && s.ok ? (s.cpuP99 / 1000).toFixed(1) : "—").padEnd(9)} | ` +
    `${(s && s.ok ? (s.wallMs / s.requests).toFixed(0) : "—").padEnd(11)} | ` +
    `${fmtMB(s && s.ok ? s.memP50 : null).padEnd(7)} | ${fmtMB(s && s.ok ? s.memP99 : null).padEnd(7)} | ` +
    `${s && s.ok ? s.statuses : "NO ROW"}`);
}
console.log(`  cpu_ms/inv is the platform's billed cpuTimeUs for the window divided by the requests IT saw.`);
console.log(`  An arm with NO ROW reports NO NUMBER — never a zero, and never a number borrowed from a neighbour.`);
if (ingestCpu !== null && initCpu !== null) {
  console.log(`\n  ARITHMETIC, offered as arithmetic and not as a measurement: recognition-only cpu_ms =`);
  console.log(`  (the rung's cpu_ms) − init ${initCpu.toFixed(1)} ms − ingest ${ingestCpu.toFixed(1)} ms:`);
  for (const [id] of RUNGS) {
    const c = cpuOf(id);
    if (c !== null) console.log(`    ${id}: ${(c - initCpu - ingestCpu).toFixed(1)} ms of recognition on a ${(anchorRaw.w * anchorRaw.h / 1e6).toFixed(1)} Mpx page`);
  }
}
console.log(`\n  AGAINST THE CEILINGS: the default Workers CPU limit is 30,000 ms per invocation and this`);
console.log(`  script asked for ${CPU_LIMIT_ASK.toLocaleString()} (${LIMITS.accepted ? "ACCEPTED, echoed " + JSON.stringify(LIMITS.echoed) : "REFUSED: " + JSON.stringify(LIMITS.service_said)});`);
console.log(`  the Free plan's ceiling, which DEC-42 bought Paid to escape, is 10 ms.`);

console.log(`\n=== (B) MEMORY AGAINST THE 128 MB ISOLATE ===`);
console.log(`  Every ladder rung is resized BACK to the page's own dimensions by CPDF-11's recipe, so the`);
console.log(`  ladder moves LEGIBILITY and not SIZE: one frame size, ${(anchorRaw.w * anchorRaw.h * 4 / 1e6).toFixed(1)} MB of RGBA, across R0..C1.`);
for (const a of ARMS) {
  const s = armStats[a.id];
  if (!s || !s.ok) continue;
  if (!/^(ingest|R0|walk|corp)/.test(a.id)) continue;
  console.log(`  ${a.id.padEnd(10)} platform memoryUsageBytes P50 ${fmtMB(s.memP50)}, P99 ${fmtMB(s.memP99)} — ${a.what.slice(0, 70)}`);
}
if (WALK) {
  console.log(`  THE WALK, and a refusal here is the measurement:`);
  for (const s of WALK_POINTS) {
    const a = armById(`walk-${s}x`);
    if (!a) continue;
    const frame = walkRaw[s].w * walkRaw[s].h * 4;
    const failures = a.runs.filter((r) => !(r.body && r.body.ok));
    console.log(`    ${s}x (${walkRaw[s].w}x${walkRaw[s].h}, RGBA ${(frame / 1e6).toFixed(1)} MB): ` +
      `${a.runs.length - failures.length}/${a.runs.length} completed` +
      (failures.length ? `; the runtime said ${JSON.stringify(failures.map((f) => f.body ? { stage: f.body.stage, error: f.body.error, name: f.body.name } : { status: f.status, error: f.error, text: f.text })).slice(0, 400)}` : ""));
    const st = armStats[`walk-${s}x`];
    if (st && st.ok) console.log(`        platform row: ${st.statuses}; mem P99 ${fmtMB(st.memP99)}; cpu ${fmtMs(cpuOf(`walk-${s}x`))} ms/inv`);
  }
}

console.log(`\n=== (C/D/E) FIDELITY ON THE GROUND-TRUTHED PAGE — true ACCURACY, n=${RUNS} per rung ===`);
console.log(`  This is the ONE page in the project with human ground truth (D-306). The columns below are`);
console.log(`  ACCURACY against GT_PAGE2; the corpus table further down is AGREEMENT and is never mixed in.`);
console.log(`  RUNG | what it is                                  | chars | DISTINCT/n | char acc | GT digits | MINTED | digit DISAGREE (subst)`);
const ladderRows = [];
for (const [id, , desc] of RUNGS) {
  const a = armById(id);
  const texts = textOf(a).filter((t) => t !== null);
  const scored = texts.map((t) => stats(GT_PAGE2, t));
  const distinct = new Set(texts).size;
  const row = { id, desc, n: texts.length, distinct,
    charAcc: scored.length ? median(scored.map((s) => s.charAcc)) : null,
    charWorst: scored.length ? Math.min(...scored.map((s) => s.charAcc)) : null,
    digTotal: scored.length ? scored[0].digTotal : null,
    digRight: scored.length ? median(scored.map((s) => s.digTotal - s.digErr)) : null,
    minted: scored.length ? Math.max(...scored.map((s) => s.minted)) : null,
    disagree: scored.length ? Math.max(...scored.map((s) => s.digDisagree)) : null,
    subst: scored.length ? Math.max(...scored.map((s) => s.digSubst)) : null,
    chars: scored.length ? median(scored.map((s) => s.ocrLen)) : 0,
    sample: texts[0] || "" };
  ladderRows.push(row);
  console.log(`  ${id.padEnd(4)} | ${desc.padEnd(43)} | ${String(row.chars).padEnd(5)} | ` +
    `${String(`${distinct}/${texts.length}`).padEnd(10)} | ` +
    `${(row.charAcc === null ? "—" : `${row.charAcc.toFixed(2)}%`).padEnd(8)} | ` +
    `${(row.digTotal === null ? "—" : `${row.digRight}/${row.digTotal}`).padEnd(9)} | ` +
    `${String(row.minted === null ? "—" : row.minted).padEnd(6)} | ` +
    `${row.disagree === null ? "—" : `${row.disagree} (${row.subst})`}`);
}
console.log(`  MINTED is the FLOOR'S OWN expression, read out of CPDF-9's file and not edited.`);
console.log(`  digit DISAGREE (subst) is D-305's blind spot reported BESIDE it and computed HERE: a`);
console.log(`  ground-truth digit position whose character differs, and in brackets the subset where a`);
console.log(`  digit was swapped for ANOTHER DIGIT — the class that mints nothing and reads clean.`);
for (const row of ladderRows) {
  console.log(`    ${row.id} said: ${JSON.stringify(row.sample.slice(0, 150))}`);
}

console.log(`\n  THE LOCAL FLOOR ON THE SAME RUNGS (${FLOOR_PKG}, same model bytes) — the deployed engine is`);
console.log(`  compared with a conventional tesseract reading the same images, so "the runtime degraded it"`);
console.log(`  and "this rung is hard" stay different claims:`);
console.log(`  RUNG | floor char acc | floor GT digits | floor MINTED | runtime-vs-floor agreement`);
for (const [id] of RUNGS) {
  const f = stats(GT_PAGE2, floorText[id] || "");
  const a = armById(id);
  const t = textOf(a).find((x) => x !== null);
  const agree = t === undefined ? null : stats(floorText[id] || "", t).charAcc;
  console.log(`  ${id.padEnd(4)} | ${`${f.charAcc.toFixed(2)}%`.padEnd(14)} | ${`${f.digTotal - f.digErr}/${f.digTotal}`.padEnd(15)} | ` +
    `${String(f.minted).padEnd(12)} | ${agree === null ? "—" : `${agree.toFixed(2)}%`}`);
}

if (corpusRaw.length) {
  console.log(`\n=== (C, the other column) THE CORPUS — AGREEMENT WITH THE FLOOR, NEVER ACCURACY (D-306) ===`);
  console.log(`  No human ground truth exists for these pages. Where both engines are wrong the same way,`);
  console.log(`  this column reads high and nothing notices. It is not accuracy and it is not minting.`);
  console.log(`  page                                   | chars | DISTINCT/n | agree w/ floor | floor digits matched | digits DIVERGING`);
  for (let i = 0; i < corpusRaw.length; i++) {
    const a = armById(`corp-${i + 1}`);
    const ref = floorText[`corp-${i + 1}`] || "";
    const texts = textOf(a).filter((t) => t !== null);
    const scored = texts.map((t) => stats(ref, t));
    const e = corpusRaw[i];
    console.log(`  ${`${e.id} p${e.page} (${e.raw.w}x${e.raw.h})`.slice(0, 38).padEnd(38)} | ` +
      `${String(scored.length ? median(scored.map((s) => s.ocrLen)) : 0).padEnd(5)} | ` +
      `${String(`${new Set(texts).size}/${texts.length}`).padEnd(10)} | ` +
      `${(scored.length ? `${median(scored.map((s) => s.charAcc)).toFixed(2)}%` : "—").padEnd(14)} | ` +
      `${(scored.length ? `${scored[0].digTotal - median(scored.map((s) => s.digErr))}/${scored[0].digTotal}` : "—").padEnd(20)} | ` +
      `${scored.length ? Math.max(...scored.map((s) => s.minted)) : "—"}`);
  }
}

console.log(`\n=== (E) REPRODUCIBILITY OVER IDENTICAL BYTES ===`);
{
  const all = [...RUNGS.map(([id]) => id), ...corpusRaw.map((_, i) => `corp-${i + 1}`)];
  let nonRepro = 0, measured = 0;
  for (const id of all) {
    const a = armById(id);
    if (!a) continue;
    const texts = textOf(a).filter((t) => t !== null);
    if (texts.length < 2) continue;
    measured++;
    if (new Set(texts).size > 1) nonRepro++;
  }
  console.log(`  TEXT half: ${measured} image(s) transcribed ${RUNS}x (corpus 2x) on identical bytes — ` +
    `${nonRepro} gave MORE THAN ONE distinct text` + (measured ? ` (${(100 * nonRepro / measured).toFixed(0)}%)` : ""));
  const b = armById("boxes");
  const geos = b ? b.runs.map((r) => (r.body && r.body.ok) ? r.body.box_geometry : null).filter((x) => x !== null) : [];
  const counts = b ? b.runs.map((r) => (r.body && r.body.ok) ? r.body.words : null) : [];
  console.log(`  ANCHOR half (the question CPDF-14 died on): ${geos.length} runs of R0 returning word boxes; ` +
    `word counts ${JSON.stringify(counts)}; DISTINCT box geometries ${new Set(geos).size}/${geos.length}`);
  console.log(`  READ THIS AS: ${geos.length >= 2 && new Set(geos).size === 1
    ? "the region a claim would be anchored to comes back EXACTLY over identical bytes"
    : geos.length < 2 ? "NOT MEASURED — fewer than two runs returned boxes"
    : "THE REGION MOVES over identical bytes"}`);
  if (b && b.runs[0] && b.runs[0].body && b.runs[0].body.box_sample) {
    console.log(`  a sample of what the engine returns per word (rect + its OWN confidence, which is NEVER`);
    console.log(`  thresholded here — DEC-35 forbids pseudo-confidence): ${JSON.stringify(b.runs[0].body.box_sample).slice(0, 300)}`);
  }
}

console.log(`\n=== (NC1) BLANK AND NOISE — armed alone, run on the runtime AND on the local floor ===`);
console.log(`  DECLARED: nothing may transcribe to text. There is no detection step to short-circuit —`);
console.log(`  tesseract transcribes whatever it is handed — so CPDF-14's "forced" half is inherent here.`);
let controlFailures = 0;
for (const k of ["blank", "noise"]) {
  const a = armById(`nc-${k}`);
  const texts = textOf(a);
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    if (t === null) {
      /* A run that never answered is NOT a pass and NOT an invention — it is an
         arm that did not arm, and that is a finding about the arm. */
      console.log(`  runtime ${k} run ${i + 1}: NO ANSWER — the control did not arm on this run: ` +
        `${JSON.stringify(a.runs[i]).slice(0, 200)}`);
      continue;
    }
    const ok = t === "";
    if (!ok) controlFailures++;
    console.log(`  runtime ${k} run ${i + 1}: ${ok ? "PASS (yields nothing)" : "FAIL — INVENTED TEXT"} ${JSON.stringify(t.slice(0, 200))}`);
  }
  const f = floorText[`nc-${k}`];
  console.log(`  floor   ${k}: ${f === "" ? "PASS (yields nothing)" : "FAIL — INVENTED TEXT"} ${JSON.stringify((f || "").slice(0, 200))}`);
}

const r0 = ladderRows.find((r) => r.id === "R0");
const nc3 = !!(r0 && r0.charAcc !== null && r0.charAcc >= 95);
console.log(`\n=== (NC3) OVER-STRICTNESS — a clean high-fidelity page must pass end to end ===`);
console.log(`  DECLARED: R0 on the DEPLOYED runtime must reach >=95% character accuracy against the human ground truth.`);
console.log(`  ACTUAL:   ${r0 && r0.charAcc !== null ? r0.charAcc.toFixed(2) + "%" : "NOT SCORABLE"} -> ` +
  `${nc3 ? "AS DECLARED (the instrument is not sabotaging its subject)" : "*** NOT AS DECLARED — no verdict from this run is worth anything until this is understood ***"}`);

console.log(`\n=== THE PROVENANCE GATE, ARMED (FL-1's, re-armed here) ===`);
console.log(`  refuses every bad shape including the empty one: ${gateArms.every((g) => g.REFUSED)} ` +
  `(${gateArms.filter((g) => g.REFUSED).length}/${gateArms.length}); still accepts a platform reading: ${gateAccepts}`);
console.log(`  the self-timed shape it refuses: ${JSON.stringify(gateArms[4])}`);

console.log(`\n=== REACH, STATED, because a number without its n is not a measurement ===`);
console.log(`  engine measured:                                ${ENGINE_PKG} (wasm core ${ENG.wasm.digest.slice(0, 12)}…), model tessdata_fast eng ${ENG.model.digest.slice(0, 12)}…`);
console.log(`  local floor instrument:                         ${FLOOR_PKG}, the SAME model bytes`);
console.log(`  page with HUMAN ground truth:                   1 (the only one this project has)`);
console.log(`  ladder rungs on the deployed runtime:           ${RUNGS.length}, n=${RUNS} invocations each`);
console.log(`  corpus image-only pages measured:               ${corpusRaw.length}, n=2 each (agreement only)`);
console.log(`  memory-walk points:                             ${WALK ? WALK_POINTS.length : 0} (${WALK ? WALK_POINTS.join("x, ") + "x" : "none"}), n=2 each`);
console.log(`  arms with a platform row:                       ${ARMS.filter((a) => armStats[a.id] && armStats[a.id].ok).length}/${ARMS.length}`);
console.log(`  total invocations sent:                         ${ARMS.reduce((n, a) => n + a.sent, 0)}`);
console.log(`  WHAT THIS PROBE CANNOT SEE, stated beside the numbers:`);
console.log(`    - cpuTimeUs is CLOUDFLARE'S OWN statement of what it billed. It is not independently`);
console.log(`      verifiable by us; it is the surface the bill is computed from, which is what D-245 asks about.`);
console.log(`    - The surface aggregates per script and per window, never per invocation. Every cpu_ms here`);
console.log(`      is a MEAN over the arm's invocations, beside the platform's own P50/P99.`);
console.log(`    - memoryUsageBytes is likewise the platform's quantile over the window, not a peak this probe`);
console.log(`      watched. A spike shorter than the platform's sampling is invisible to it.`);
console.log(`    - Attribution rests on this probe's script being the only NON-REAL script emitting traffic`);
console.log(`      while its window is open. The pre-run listing is printed above so that is checkable.`);
console.log(`    - HUMAN ground truth exists for ONE page. Every corpus figure is agreement with the local`);
console.log(`      tesseract FLOOR, so a place where both engines are wrong the same way is invisible (D-306).`);
console.log(`    - ONE engine at ONE version, ONE model (tessdata_fast eng), ONE page shape (a 300 dpi`);
console.log(`      letter-size bilevel scan). Nothing here is a statement about another engine or another scan.`);
console.log(`    - The client sends one byte per pixel; a real fleet member would receive a PDF image stream`);
console.log(`      and decode it in-isolate (CPDF-12's pagepixels.mjs). THAT decode is not in these figures.`);

console.log(`\n=== COST (in the account, nothing funded) ===`);
{
  const invocations = ARMS.reduce((n, a) => n + a.sent, 0);
  const cpuTotalMs = ARMS.reduce((n, a) => n + ((armStats[a.id] && armStats[a.id].ok) ? armStats[a.id].cpuUs / 1000 : 0), 0);
  console.log(`  ${invocations} invocations of one scratch Worker; ${(cpuTotalMs / 1000).toFixed(1)} s of billed CPU in total, as the platform reports it.`);
  console.log(`  Vendor's CLAIM for Workers Paid, labelled as theirs: $5/month includes 10M requests and 30M CPU-ms,`);
  console.log(`  then $0.30/M requests and $0.02/M CPU-ms -> this whole run is ${(cpuTotalMs / 1e6 * 0.02 + invocations / 1e6 * 0.30).toFixed(5)} dollars of usage`);
  console.log(`  inside an allocation the account already pays for. Nothing was funded and no plan was changed.`);
}

await teardown();

console.log(`\nFOOT REACHED — every section above ran to its end. An absent tally reads NO NUMBER, never 0.`);
if (controlFailures > 0) {
  console.error(`\nPATH FAILURE: ${controlFailures} blank/noise control run(s) produced text.`);
  process.exitCode = 1;
}
if (!nc3) process.exitCode = 1;
console.log("workdir left for inspection:", work);
