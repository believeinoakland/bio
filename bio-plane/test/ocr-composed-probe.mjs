#!/usr/bin/env node
/* CPDF-14 instrument: is the COMPOSED SHAPE — detect the block, crop it,
 * transcribe the crop — a usable in-account OCR path? (MEASUREMENTS.md
 * 2026-09-10, DEC-35, and the verdict CPDF-10's placement waits on.)
 *
 * A PROBE, not in the battery — deliberately NOT named `*.test.mjs`, which is
 * the battery runner's whole discovery rule (`scripts/battery.mjs`: readdir +
 * endsWith(".test.mjs")), so it is not discovered and needs no skip marker. It
 * commits no product code and changes nothing the plane runs.
 *
 * WHAT IS ALREADY KNOWN, and it is the entire reason this item exists.
 * CPDF-11 measured Moondream 3.1 on the DEFAULT path and returned NO-GO on the
 * non-negotiable: `task=query` returns no coordinates, `task=detect` returns no
 * text, the boxes it does return do not align (2 of 24 checks), it returned a
 * CONFIDENT box for a figure not on the page, the same bytes did not transcribe
 * to the same text twice (3 runs, 2 distinct transcriptions), and rung R3
 * refused 0/3 while MINTING 16–20 digits per run in prose indistinguishable
 * from a clean read. In the same run, ONE incidental measurement did not fail:
 * the composed shape scored 99.62% characters, 10/10 digits and 0 minted on the
 * one trustworthy region — AT n=1. Unproven, not refuted. That n=1 is what this
 * probe replaces, because it is the only in-account shape that can carry the
 * image-region anchor and therefore the only thing standing between CPDF-10 and
 * the unfunded external tier.
 *
 * COMPARABILITY IS ENFORCED, NOT CLAIMED, AND IT IS ENFORCED HARDER HERE THAN
 * IN THE PRECEDENT. Like CPDF-11 this probe READS CPDF-9's ground truth and
 * scoring arithmetic out of `ocr-measure-probe.mjs` at run time rather than
 * copying it, and exits if a metric expression moved. Two guards are NEW, and
 * they are new because CPDF-11's guard has a hole this item had to look
 * straight at:
 *   - CPDF-11 grabs `GT_PAGE2` by regex and scores against WHATEVER IT FINDS.
 *     Change one digit of that ground truth and the guard is silent, the probe
 *     reports a number, and the number is incomparable with the 2026-08-03
 *     floor it is printed beside. So the NORMALISED ground truth is PINNED BY
 *     DIGEST here, and a moved ground truth EXITS.
 *   - The ladder rungs and the one prompt are CPDF-11's, read out of
 *     `ocr-moondream-probe.mjs` — the python that builds R0..R4/C1 and the
 *     controls is grabbed and executed verbatim, and PINNED BY DIGEST too.
 *     Copying the rung recipe would have produced a ladder that drifts away
 *     from the ladder its own numbers are compared against.
 * Every one of those exits is exit code 4, and all of them run BEFORE a byte is
 * uploaded anywhere.
 *
 * D-315 (2026-09-12) CLOSED A THIRD HOLE, AND IT WAS THIS GUARD'S OWN: the four
 * metric expressions were pinned by `.includes` SUBSTRING PRESENCE, so a
 * SUPERSTRING mutation — `* 100` becoming `* 100.0` — passed silently over a
 * genuinely moved expression (measured by CPDF-16's arm, not reasoned). They are
 * now pinned the way the ground truth always was: the STATEMENT carrying each
 * expression is digested and must be BYTE-IDENTICAL, each expression must occur
 * EXACTLY ONCE (a duplicate disarms every first-occurrence mutation arm), and
 * `norm()` and `levenshteinPairs()` — imported and RUN here — are digest-pinned
 * too. The exit code, the refusal shape and the `--controls` arm table are
 * unchanged: D-315 is a change of DETECTION, not of interface.
 *
 * WHAT IT MEASURES, in the item's own order.
 *
 *  (A) THE COMPOSED SHAPE ON THE CPDF-11 LADDER, on the ground-truthed page.
 *      At every rung: detect on the DEGRADED image (that is the shape as it
 *      would actually run), crop the DEGRADED image, and transcribe the crop.
 *      THE REGION GROUND TRUTH IS DERIVED FROM THE CLEAN PAGE at the same box —
 *      the referee reads clean pixels, the model reads degraded ones. Deriving
 *      it from the degraded crop instead would have let the ground truth rot at
 *      exactly the rate the subject does, which is a measurement of nothing.
 *
 *  (B) REPRODUCIBILITY OVER IDENTICAL BYTES, and it is TWO questions rather
 *      than one. The default path failed the text half (3 runs, 2 distinct
 *      transcriptions). The composed shape has a second half nobody has
 *      measured: DOES THE BOX COME BACK THE SAME? An anchor that moves between
 *      runs is not an anchor, however faithful the text inside it is. So the
 *      same page bytes are detected N times and the box sets compared by IoU,
 *      and the same crop bytes are transcribed N times and the texts compared.
 *
 *  (C) THE INVENTION BAND. Minting is what killed the default path, so it is
 *      scored at every rung against the region ground truth with the FLOOR'S
 *      OWN minted-digit expression — a digit in the output with no digit
 *      opposite it in the truth.
 *
 *  (D) CORPUS REACH BEYOND THE ANCHOR. Human ground truth exists for exactly
 *      ONE page in this project and that is a fact about the record, not a
 *      choice made here. So the corpus rungs carry a WEAKER, HONESTLY NAMED
 *      metric: agreement with the local-tesseract floor reading the same crop,
 *      and DIGIT DIVERGENCE FROM THE FLOOR rather than minting. Those two words
 *      are not interchangeable and the report never mixes them.
 *
 *  (NC1) THE BLANK AND NOISE CONTROLS, RE-RUN ON THE COMPOSED SHAPE. An engine
 *      that answers on noise disqualifies itself whatever its clean score. Run
 *      TWICE over: naturally (detect on the control page, transcribe whatever
 *      it boxes) and FORCED (a fixed central crop transcribed regardless).
 *      The forced half exists because a natural pass costs nothing to produce —
 *      if detect returns no boxes the composed shape "passes" without the
 *      transcriber ever being asked, and an outcome that costs nothing is not
 *      evidence.
 *
 *  (NC2) THE COMPARABILITY GUARD, ARMED. `--controls` copies this probe and the
 *      two files it reads into a temp dir, mutates ONE thing per arm, and runs
 *      the copy with `--guard-only`. Declared before arming: the pristine
 *      BASELINE arm must exit 0, and each of the three mutations must exit 4.
 *      A baseline row is here because a harness whose every arm reports the
 *      same thing is indistinguishable from a harness that never armed.
 *
 *  (NC3) OVER-STRICTNESS. A clean high-fidelity page must still pass end to
 *      end. Declared: rung R0 must produce at least one scorable region at
 *      >=95% character accuracy and must not refuse. If it does not, this
 *      instrument is sabotaging its subject and no NO-GO it returns is worth
 *      anything.
 *
 * FORBIDDEN AND NOT DONE (DEC-35): the model is never asked how confident it
 * is, and no self-reported number is thresholded anywhere.
 *
 * NOTHING IS FUNDED. The model is reached through a scratch Worker carrying the
 * `AI` binding — CPDF-11's worker source, uploaded VERBATIM under this item's
 * own slug, used, and DELETED with the deletion verified by a follow-up GET.
 * The account is asserted to be the pinned project account before any upload.
 * No real namespace, no version bump, nothing signed, nothing deployed.
 *
 * PREREQUISITES: python3 with pypdf and Pillow; network; `.env` carrying
 * CF_TOKEN/CF_ACCT.
 *
 * Run:  node test/ocr-composed-probe.mjs [--runs N] [--pages M] [--corpus L] [--keep]
 *       node test/ocr-composed-probe.mjs --controls      (NC2, the arms)
 *       node test/ocr-composed-probe.mjs --guard-only    (what an arm drives)
 *       node test/ocr-composed-probe.mjs --digests       (bootstrap: print the pins)
 */
import { execFileSync, execSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, statSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const argv = process.argv.slice(2);
const flagN = (name, dflt) => (argv.includes(name) ? Number(argv[argv.indexOf(name) + 1]) : dflt);
const RUNS = flagN("--runs", 3);
const CORPUS_PAGES = flagN("--pages", 12);
const CORPUS_LIMIT = flagN("--corpus", 60);
/* How many image-only pages one document may contribute. The first run of this
   probe took ONE per document to spread the reach across documents, and that was
   the right instinct and the wrong number: the image-only class in this corpus is
   CONCENTRATED — 13 image-only pages lived in two documents — so a per-document
   cap of 1 threw away eleven of the thirteen pages the census had just found, and
   the corpus arm measured n=2. Spreading is still preferred; it is now a cap
   rather than a floor of one. */
const PER_DOC = flagN("--perdoc", 4);
const KEEP = argv.includes("--keep");
const GUARD_ONLY = argv.includes("--guard-only");
const CONTROLS = argv.includes("--controls");
const DIGESTS = argv.includes("--digests");

const MODEL = "@cf/moondream/moondream3.1-9B-A2B";
const PINNED_ACCOUNT = "20b533579290b9b93168345edd3b7f72";
const SLUG = "bio-ocrcomposed";
const UA = "CivicOS/0.55.0 (+https://github.com/believeinoakland/bio; instance biosmoke7; acquire)";
const ANCHOR_ID = "legistar-attach-15721260";
const ANCHOR_URL = "https://oakland.legistar.com/View.ashx?M=F&ID=15721260&GUID=8F04A287-4A49-44DC-83B7-29FAD97140C2";
const CORPUS_CACHE = join(tmpdir(), "cpdf14-corpus");

const sha = (s) => createHash("sha256").update(s).digest("hex");
const median = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];

/* THE THREE PINS. Measured 2026-09-10 from the files named beside them, on the
 * tree that carries CPDF-9's and CPDF-11's landed instruments. They are not
 * decoration: each one is a thing that, if it moved, would make the figures in
 * this probe's MEASUREMENTS.md row incomparable with the floor printed next to
 * them, WITHOUT any expression-level guard noticing. */
const PIN_GT = "17dff6b39a5dfff3010246825537173b928befbeaa94fef6df7afaa94015c37b";      // norm(GT_PAGE2), 2,687 chars
const PIN_LADDER = "34796b3003bc32f0a87aa40bb109bcf3c9b806242a9378c42849b8db4bec6d10";  // CPDF-11's rung recipe, 2,068 chars
const PIN_PROMPT = "de8320f456cd863ffdfb27684f524df90a94a907b54dc0d5423049d93c5d59bf";  // CPDF-11's OCR_PROMPT, 244 chars
/* D-315's class sweep, and it is a hole the four expression pins never covered:
 * `norm()` and `levenshteinPairs()` are not merely READ out of the floor, they
 * are IMPORTED AND EXECUTED to produce every number this probe prints — and they
 * carried no identity check at all. `norm` was only INDIRECTLY constrained (a
 * mutation that changes `norm(GT_PAGE2)` trips PIN_GT; one that does not — a
 * `.replace()` for a character the ground truth happens not to contain — was
 * invisible), and `levenshteinPairs` was not constrained in any direction, while
 * every distance, pairing and therefore every digit column comes out of it.
 * Measured 2026-09-12 from the committed floor, over the same grabbed bytes the
 * import runs. */
const PIN_NORM = "94cf0d4397807d11a40c64eca33687ac6f090d0de9bae7a8512ab264db432f9e";    // the floor's norm(), 97 chars as grabbed (105 B UTF-8 — it carries curly quotes)
const PIN_LEV = "7f6520500a0ef8a682ec0dba014a120a2cfe42b4d9612d89784487acd29ee6e4";     // the floor's levenshteinPairs(), 771 chars as grabbed

/* ==========================================================================
 * NC2's ARMS. Run first when asked, because the guard they exercise is the
 * only reason any number below can be printed next to the floor.
 * ======================================================================== */
if (CONTROLS) {
  const SELF = join(HERE, "ocr-composed-probe.mjs");
  const FLOOR = join(HERE, "ocr-measure-probe.mjs");
  const MOON = join(HERE, "ocr-moondream-probe.mjs");
  /* DECLARED BEFORE ARMING. Each arm mutates exactly ONE thing, others held
     open. `must` is the exit code the arm is REQUIRED to produce. */
  const ARMS = [
    { id: "baseline", must: 0, what: "pristine copy, nothing mutated",
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
  ];
  console.log("=== NC2 — THE COMPARABILITY GUARD, ARMED. Each arm ALONE, others held open. ===");
  console.log("DECLARED: baseline MUST exit 0; every mutation MUST exit 4 (the guard's own code)");
  console.log("          and MUST do so BEFORE anything is uploaded.\n");
  let bad = 0;
  for (const a of ARMS) {
    const d = mkdtempSync(join(tmpdir(), `cpdf14-nc-${a.id}-`));
    for (const f of [SELF, FLOOR, MOON]) copyFileSync(f, join(d, f.slice(f.lastIndexOf("/") + 1)));
    let armed = true, why = "";
    try { a.apply(d); } catch (e) { armed = false; why = e.message; }
    const r = armed
      ? spawnSync(process.execPath, [join(d, "ocr-composed-probe.mjs"), "--guard-only"], { encoding: "utf8" })
      : null;
    const got = armed ? r.status : -1;
    const ok = armed && got === a.must;
    if (!ok) bad++;
    console.log(`  ${a.id.padEnd(12)} ${a.what.padEnd(58)} declared exit ${a.must}  actual ${got}  ${ok ? "AS DECLARED" : (armed ? "*** NOT AS DECLARED ***" : "*** " + why + " ***")}`);
    if (armed && got !== 0) {
      const line = (r.stderr || "").split("\n").find((l) => l.startsWith("STOP:")) || (r.stderr || "").trim().split("\n")[0] || "";
      console.log(`               refusal said: ${JSON.stringify(line.slice(0, 140))}`);
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
const FLOOR_SRC = readFileSync(join(HERE, "ocr-measure-probe.mjs"), "utf8");
const MOON_SRC = readFileSync(join(HERE, "ocr-moondream-probe.mjs"), "utf8");
const grab = (src, re, what) => { const m = re.exec(src); if (!m) stop(`${what} is gone.`); return m[1]; };

/* D-315: EXACTLY ONCE, ASSERTED RATHER THAN OBSERVED. CPDF-16 measured by hand
 * that each pinned literal occurs once in the floor and STATED the measurement
 * as un-mechanised; this is the mechanism. A duplicate is not cosmetic: every
 * mutation arm over these files — this probe's own `--controls`, CPDF-15's, and
 * `cpdf16-floor-controls.mjs` — rewrites the FIRST occurrence with
 * `String.replace(from, to)`, so a second copy silently disarms the arm while
 * the run still prints AS DECLARED. The non-greedy `grab` regexes take the first
 * match for the same reason. */
const occurrences = (src, needle) => src.split(needle).length - 1;
const once = (src, where, needle, what) => {
  const n = occurrences(src, needle);
  if (n === 0) stop(`${what} is gone from ${where}.`);
  if (n !== 1) {
    stop(`${what} occurs ${n} times in ${where}; EXACTLY ONE occurrence is the pin, because every ` +
      `mutation arm over this file rewrites the first occurrence only and a duplicate disarms it silently.`);
  }
};
for (const [src, where, anchor, what] of [
  [FLOOR_SRC, "ocr-measure-probe.mjs", "const GT_PAGE2 = `", "the ground truth's declaration"],
  [FLOOR_SRC, "ocr-measure-probe.mjs", "const norm = (s) =>", "the norm() normaliser's declaration"],
  [FLOOR_SRC, "ocr-measure-probe.mjs", "function levenshteinPairs(a, b) {", "levenshteinPairs()'s declaration"],
  [MOON_SRC, "ocr-moondream-probe.mjs", "const OCR_PROMPT =", "CPDF-11's OCR_PROMPT declaration"],
  [MOON_SRC, "ocr-moondream-probe.mjs", "const REFUSAL = \"", "CPDF-11's REFUSAL token declaration"],
]) once(src, where, anchor, what);

const GT_PAGE2 = grab(FLOOR_SRC, /const GT_PAGE2 = `([\s\S]*?)`;/, "the GT_PAGE2 ground truth");
const NORM_SRC = grab(FLOOR_SRC, /(const norm = \(s\) =>[\s\S]*?;\n)/, "the norm() normaliser");
const LEV_SRC = grab(FLOOR_SRC, /(function levenshteinPairs\(a, b\) \{[\s\S]*?\n\})/, "levenshteinPairs()");
/* THE FOUR METRIC EXPRESSIONS, PINNED BY THE BYTES OF THE STATEMENT THAT CARRIES
 * THEM. D-315, and the whole reason that row exists.
 *
 * WHAT WAS WRONG HERE, MEASURED RATHER THAN REASONED (CPDF-16's `nc3-expr` arm,
 * first run, 2026-09-11): this was `FLOOR_SRC.includes(expr)` — SUBSTRING
 * PRESENCE — and a superstring still contains its own substring. `* 100` mutated
 * to `* 100.0` in the REAL floor left BOTH landed guards at exit 0 over a
 * genuinely moved expression. `* 100.5`, or `.length - 1` appended to any of the
 * three digit expressions, hides in exactly the same place: the pin refused
 * DELETION and REWRITING but not EXTENSION. The ground-truth and ladder pins were
 * always immune, because a digest sees every byte — so the fix is to give the
 * expressions the same discipline rather than a longer literal.
 *
 * WHAT IT IS NOW, in order, and each step is load-bearing:
 *   1. presence, unchanged — a REMOVED expression is still named as gone, so the
 *      old detection is KEPT rather than traded away for the new one;
 *   2. EXACTLY ONE occurrence (see `once` above);
 *   3. the single source LINE carrying the expression, trimmed, digested, and
 *      compared against a pin measured from the committed floor.
 * "The expression is present" has become "the expression's statement is
 * BYTE-IDENTICAL".
 *
 * WHY THE LINE AND NOT THE FUNCTION: `score()` has to stay open to ADDITIVE
 * lines — D-305's fifth expression landed as exactly that edit class and moved
 * none of these four — so a digest over the whole function would refuse the one
 * edit the floor is allowed. A line-scoped digest sees every byte of the
 * statement it pins and nothing else.
 *
 * WHAT THIS PIN STILL CANNOT SEE, stated because a matcher's reach is the thing
 * the next reader cannot re-derive: a change on a DIFFERENT line that moves
 * these numbers (`dist` or `pairs` rebound upstream) — which is why `norm()` and
 * `levenshteinPairs()`, the two regions this probe IMPORTS AND RUNS, are digest-
 * pinned below as well; and re-indentation of a pinned line, deliberately
 * outside the pin, because the statement is trimmed before it is digested and
 * indentation is not the metric.
 *
 * ONE CONSEQUENCE FOR THE LEGAL EDIT CLASS, and it is deliberate: an additive
 * line that RE-SPELLS one of these four expressions verbatim is now refused by
 * step 2. Write the new column against its own spelling — D-305's fifth
 * expression already did — or move the pin in the same turn. */
const METRIC_EXPRS = [
  { what: "char accuracy", expr: "(1 - dist / gt.length) * 100",
    pin: "ff03ab0c3519142926e122a6f9a68ac97846dc5493cbb6d6178c7efa347a8d0c" },
  { what: "GT digit total", expr: "pairs.filter(([g]) => g && /[0-9]/.test(g)).length",
    pin: "ab8ab627691245f647ce2ae8aa44ee8fefc6fd3dc627844ff3059291f3856e3f" },
  { what: "digit errors", expr: "pairs.filter(([g, o]) => g && /[0-9]/.test(g) && g !== o).length",
    pin: "308ec3e3f14fe2fb064d396ffb569287507c5c22bdf8a0f6fb36f28248fa3337" },
  { what: "digits MINTED", expr: "pairs.filter(([g, o]) => o && /[0-9]/.test(o) && (!g || !/[0-9]/.test(g))).length",
    pin: "8457c947e8010cc278cfa8388ce42538bb98c0230a5d3d96a5a8351fb5c0539b" },
];
const metricStatement = ({ what, expr }) => {
  if (!FLOOR_SRC.includes(expr)) stop(`the floor's scoring expression ${JSON.stringify(expr)} is gone from ocr-measure-probe.mjs.`);
  once(FLOOR_SRC, "ocr-measure-probe.mjs", expr, `the floor's ${what} expression ${JSON.stringify(expr)}`);
  return FLOOR_SRC.split("\n").find((l) => l.includes(expr)).trim();
};
const METRIC_PINS = METRIC_EXPRS.map((e) => ({ ...e, stmt: metricStatement(e), found: sha(metricStatement(e)) }));
const { norm, levenshteinPairs } = await import(
  "data:text/javascript," + encodeURIComponent(`${NORM_SRC}\n${LEV_SRC}\nexport { norm, levenshteinPairs };`));

/* CPDF-11's ladder recipe and its one prompt, grabbed rather than copied. */
const LADDER_PY = grab(MOON_SRC, /execFileSync\("python3", \["-c", `([\s\S]*?)`,\s*pdf, work\]/, "CPDF-11's rung recipe");
const PROMPT_SRC = grab(MOON_SRC, /const OCR_PROMPT =\n([\s\S]*?);\n/, "CPDF-11's OCR_PROMPT");
const { OCR_PROMPT } = await import(
  "data:text/javascript," + encodeURIComponent(`export const OCR_PROMPT = ${PROMPT_SRC.trim()};`));
const REFUSAL = grab(MOON_SRC, /const REFUSAL = "([A-Z]+)";/, "CPDF-11's REFUSAL token");

const GT_DIGEST = sha(norm(GT_PAGE2));
const LADDER_DIGEST = sha(LADDER_PY);
const PROMPT_DIGEST = sha(OCR_PROMPT);
const NORM_DIGEST = sha(NORM_SRC);
const LEV_DIGEST = sha(LEV_SRC);
if (DIGESTS) {
  console.log(`PIN_GT     = "${GT_DIGEST}"   (norm(GT_PAGE2), ${norm(GT_PAGE2).length} chars)`);
  console.log(`PIN_LADDER = "${LADDER_DIGEST}"   (CPDF-11 rung recipe, ${LADDER_PY.length} chars)`);
  console.log(`PIN_PROMPT = "${PROMPT_DIGEST}"   (CPDF-11 OCR_PROMPT, ${OCR_PROMPT.length} chars)`);
  console.log(`PIN_NORM   = "${NORM_DIGEST}"   (the floor's norm(), ${NORM_SRC.length} B as grabbed)`);
  console.log(`PIN_LEV    = "${LEV_DIGEST}"   (the floor's levenshteinPairs(), ${LEV_SRC.length} B as grabbed)`);
  for (const m of METRIC_PINS) console.log(`  metric ${JSON.stringify(m.what)} pin = "${m.found}"   (${m.stmt.length} B: ${JSON.stringify(m.stmt)})`);
  process.exit(0);
}
if (GT_DIGEST !== PIN_GT) stop(`the floor's GROUND TRUTH has moved (pinned ${PIN_GT.slice(0, 16)}…, found ${GT_DIGEST.slice(0, 16)}…).`);
if (LADDER_DIGEST !== PIN_LADDER) stop(`CPDF-11's LADDER RECIPE has moved (pinned ${PIN_LADDER.slice(0, 16)}…, found ${LADDER_DIGEST.slice(0, 16)}…).`);
if (PROMPT_DIGEST !== PIN_PROMPT) stop(`CPDF-11's OCR PROMPT has moved (pinned ${PIN_PROMPT.slice(0, 16)}…, found ${PROMPT_DIGEST.slice(0, 16)}…).`);
if (NORM_DIGEST !== PIN_NORM) stop(`the floor's norm() NORMALISER has moved (pinned ${PIN_NORM.slice(0, 16)}…, found ${NORM_DIGEST.slice(0, 16)}…) — this probe imports and RUNS it, so every number below would be computed by different code.`);
if (LEV_DIGEST !== PIN_LEV) stop(`the floor's levenshteinPairs() has moved (pinned ${PIN_LEV.slice(0, 16)}…, found ${LEV_DIGEST.slice(0, 16)}…) — this probe imports and RUNS it, so every distance and digit column below would be computed by different code.`);
/* D-315: the four expression pins, enforced BY DIGEST and no longer by presence
   alone. The message names the expression AND says which failure this is, because
   "still present but the statement moved" is precisely the superstring case that
   walked through the old check. */
for (const m of METRIC_PINS) {
  if (m.found !== m.pin) {
    stop(`the floor's ${m.what} STATEMENT has moved — the pinned expression ${JSON.stringify(m.expr)} is still ` +
      `PRESENT, so this is an EXTENSION or a rewrite around it, which is exactly D-315's blind side ` +
      `(pinned ${m.pin.slice(0, 16)}…, found ${m.found.slice(0, 16)}…; statement now ${JSON.stringify(m.stmt)}).`);
  }
}

console.log(`comparability: ground truth ${norm(GT_PAGE2).length} normalised chars, digest pinned; ` +
  `all four floor metric expressions BYTE-IDENTICAL by statement digest and each occurring exactly once (D-315); ` +
  `norm() and levenshteinPairs() digest-pinned before they are run; ` +
  `CPDF-11 ladder recipe and prompt pinned and read, not copied`);
if (GUARD_ONLY) { console.log("guard-only: every comparability guard passed"); process.exit(0); }

/** The floor's four numbers, computed with the floor's own expressions. */
function stats(gtRaw, ocrRaw) {
  const gt = norm(gtRaw), ocr = norm(ocrRaw);
  const { dist, pairs } = levenshteinPairs(gt, ocr);
  const digTotal = pairs.filter(([g]) => g && /[0-9]/.test(g)).length;
  const digErr = pairs.filter(([g, o]) => g && /[0-9]/.test(g) && g !== o).length;
  const minted = pairs.filter(([g, o]) => o && /[0-9]/.test(o) && (!g || !/[0-9]/.test(g))).length;
  return {
    gtLen: gt.length, ocrLen: ocr.length, dist,
    charAcc: gt.length ? (1 - dist / gt.length) * 100 : 0,
    digTotal, digErr, digAcc: digTotal ? (1 - digErr / digTotal) * 100 : 0, minted,
    errs: pairs.filter(([g, o]) => g !== o),
  };
}

/* ==========================================================================
 * 2. PREREQUISITES, THE CORPUS, AND THE IMAGES.
 * ======================================================================== */
try { execFileSync("python3", ["-c", "import pypdf, PIL"], { stdio: "pipe" }); }
catch { console.error("PREREQUISITE MISSING: python3 with pypdf and Pillow."); process.exit(2); }

const work = mkdtempSync(join(tmpdir(), "cpdf14-composed-"));
console.log("workdir:", work);

/* --- the anchor: the one page in this project that has human ground truth. */
const pdf = join(work, `${ANCHOR_ID}.pdf`);
{
  const r = await fetch(ANCHOR_URL, { headers: { "user-agent": UA } });
  if (!r.ok) { console.error(`anchor exhibit fetch: HTTP ${r.status}`); process.exit(1); }
  writeFileSync(pdf, Buffer.from(await r.arrayBuffer()));
}
console.log(`anchor exhibit: ${ANCHOR_ID}.pdf ${statSync(pdf).size.toLocaleString()} B`);

/* CPDF-11's own python, executed verbatim: the same page extraction (including
   the /Rotate 270 correction), the same two controls, the same six rungs. */
execFileSync("python3", ["-c", LADDER_PY, pdf, work], { stdio: ["ignore", "inherit", "inherit"] });
const PAGE = join(work, "page1.png");
if (!existsSync(PAGE)) { console.error("the anchor page image was not produced"); process.exit(1); }
console.log(`anchor page: ${statSync(PAGE).size.toLocaleString()} B PNG (image-only re-verified by CPDF-11's own assertion)`);

/* --- the corpus beyond the anchor: real Oakland PDFs, image-only pages only.
   The same harvest CPDF-12's census used (the attachments of the most recently
   modified Legistar matters, which is where the scanned class actually lives).
   A page is image-only on pypdf's own reading: no extractable text, no /Font,
   at least one embedded image — the same three conditions CPDF-11 asserted on
   the anchor. */
mkdirSync(CORPUS_CACHE, { recursive: true });
const corpusDocs = [];
{
  const wanted = [];
  try {
    const matters = await (await fetch(
      "https://webapi.legistar.com/v1/oakland/matters?%24top=40&%24orderby=MatterLastModifiedUtc%20desc",
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
  } catch (e) {
    console.log(`  ! Legistar matter listing unavailable (${e.message})`);
  }
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
}
console.log(`corpus harvested: ${corpusDocs.length} real Oakland PDFs ` +
  `(${(corpusDocs.reduce((n, d) => n + d.size, 0) / 1e6).toFixed(1)} MB), cached in ${CORPUS_CACHE}`);

/* Census + page extraction for the corpus, in one python pass. */
const corpusDir = join(work, "corpus");
mkdirSync(corpusDir, { recursive: true });
let census = { docs: 0, pages: 0, unreadable: 0, textPages: 0, novector: 0, imageOnly: 0, extracted: [] };
if (corpusDocs.length) {
  const manifest = join(work, "corpus-manifest.json");
  writeFileSync(manifest, JSON.stringify(corpusDocs.map((d) => ({ id: d.id, path: d.path }))));
  const out = execFileSync("python3", ["-c", `
import sys, json
from pypdf import PdfReader
from PIL import Image
docs = json.load(open(sys.argv[1])); outdir = sys.argv[2]; want = int(sys.argv[3]); perdoc = int(sys.argv[4])
res = {"docs":0,"pages":0,"unreadable":0,"textPages":0,"novector":0,"imageOnly":0,"extracted":[]}
for d in docs:
    try: r = PdfReader(d["path"])
    except Exception: res["unreadable"] += 1; continue
    if getattr(r, "is_encrypted", False):
        try: r.decrypt("")
        except Exception: res["unreadable"] += 1; continue
    res["docs"] += 1
    got_from_this_doc = 0
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
        # spread the reach across DOCUMENTS rather than take eight pages of one
        # unlucky scan — a CAP per document, not a floor of one
        if got_from_this_doc >= perdoc or len(res["extracted"]) >= want: continue
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
            got_from_this_doc += 1
        except Exception:
            pass
print(json.dumps(res))
`, manifest, corpusDir, String(CORPUS_PAGES), String(PER_DOC)], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  census = JSON.parse(out.trim().split("\n").pop());
}
console.log(`corpus census: ${census.docs} readable PDFs, ${census.pages} pages — ` +
  `${census.textPages} carry a text layer, ${census.novector} have neither text nor image, ` +
  `${census.imageOnly} are IMAGE-ONLY (the class OCR is for)`);
console.log(`corpus pages taken forward (<=${PER_DOC} per document, >=600px): ${census.extracted.length}` +
  (census.extracted.length ? "" : "   <-- ZERO: the corpus half of this probe measures NOTHING and says so"));
for (const e of census.extracted) console.log(`    ${e.id} page ${e.page} — ${e.w}x${e.h}, /Rotate ${e.rotate}`);

/* ==========================================================================
 * 3. THE SCRATCH WORKER — CPDF-11's source, uploaded verbatim, under this
 *    item's own slug. Used, deleted, and the deletion VERIFIED.
 * ======================================================================== */
const api = `https://api.cloudflare.com/client/v4/accounts/${ACCT}/workers/scripts/${SLUG}`;
const H = { authorization: `Bearer ${TOKEN}` };
const PROBE_TOKEN = randomBytes(16).toString("hex");
{
  const meta = {
    main_module: "index.mjs",
    compatibility_date: "2026-07-01",
    bindings: [
      { type: "ai", name: "AI" },
      { type: "plain_text", name: "PROBE_TOKEN", text: PROBE_TOKEN },
    ],
  };
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([readFileSync(join(HERE, "ocr-moondream-worker.mjs"), "utf8")],
    { type: "application/javascript+module" }), "index.mjs");
  const r = await fetch(api, { method: "PUT", headers: H, body: fd });
  const j = await r.json().catch(() => null);
  console.log(`scratch worker upload: HTTP ${r.status} success=${j && j.success}` +
    (j && !j.success ? " " + JSON.stringify(j.errors).slice(0, 300) : ""));
  if (!j || !j.success) process.exit(1);
  await fetch(api + "/subdomain", {
    method: "POST", headers: { ...H, "content-type": "application/json" },
    body: JSON.stringify({ enabled: true, previews_enabled: false }),
  });
}
const sub = await (async () => {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCT}/workers/subdomain`, { headers: H });
  const j = await r.json();
  return j && j.result && j.result.subdomain;
})();
const URLBASE = `https://${SLUG}.${sub}.workers.dev`;
console.log("scratch worker:", URLBASE);

let DELETED = null;
async function teardown() {
  if (KEEP) { console.log(`\nscratch worker LEFT UP at ${URLBASE} (--keep)`); return; }
  const r = await fetch(api, { method: "DELETE", headers: H });
  /* THE DELETION IS VERIFIED, NOT ASSUMED. A 200 on DELETE is the service
     saying it accepted the request; the account saying the script is gone is a
     404 on the GET afterwards, and that is the thing the item accepts. */
  const g = await fetch(api, { headers: H });
  DELETED = { del: r.status, get: g.status, gone: g.status === 404 };
  console.log(`\nscratch worker deleted: DELETE HTTP ${r.status}; follow-up GET HTTP ${g.status} — ` +
    `${g.status === 404 ? "VERIFIED GONE from the account" : "*** STILL PRESENT — NOT VERIFIED GONE ***"}`);
}
process.on("exit", () => {
  if (!KEEP && DELETED === null) console.error("\n*** the scratch worker teardown did not run — it may still be up ***");
});

/* D-108's lesson: the upload landing is not the new build serving. */
async function waitReady() {
  const t0 = Date.now();
  for (let i = 1; i <= 30; i++) {
    try {
      const res = await fetch(URLBASE, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: PROBE_TOKEN, ping: true }),
      });
      const j = JSON.parse(await res.text());
      if (j && j.ok && j.run === "function") {
        console.log(`scratch worker ready after ${Math.round((Date.now() - t0) / 1000)}s (${i} ping${i === 1 ? "" : "s"}); env.AI binding present`);
        return;
      }
    } catch { /* mid-rollout a request can simply fail; that is not an answer either */ }
    await new Promise((s) => setTimeout(s, 3000));
  }
  console.error("scratch worker never answered a ping with this run's gate — refusing to measure.");
  await teardown();
  process.exit(1);
}
await waitReady();

let NEURONS = 0, IN_TOK = 0, OUT_TOK = 0, CALLS = 0, FAILED_CALLS = 0;
async function ai(input, { tries = 4 } = {}) {
  for (let i = 1; i <= tries; i++) {
    let res;
    try {
      res = await fetch(URLBASE, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: PROBE_TOKEN, model: MODEL, input }),
      });
    } catch { await new Promise((s) => setTimeout(s, 4000)); continue; }
    const text = await res.text();
    let j = null; try { j = JSON.parse(text); } catch { /* mid-rollout HTML */ }
    if (!j) { await new Promise((s) => setTimeout(s, 4000)); continue; }
    if (j.ok === false && /unauthorized/.test(j.error || "")) {
      console.error("scratch worker rejected the probe token"); await teardown(); process.exit(1);
    }
    if (j.ok && j.out && j.out.usage) {
      CALLS++; NEURONS += j.out.usage.neurons || 0;
      IN_TOK += j.out.usage.prompt_tokens || 0; OUT_TOK += j.out.usage.completion_tokens || 0;
    }
    if (j.ok || i === tries) { if (!j.ok) FAILED_CALLS++; return j; }
    await new Promise((s) => setTimeout(s, 3000 * i));
  }
  FAILED_CALLS++;
  return { ok: false, error: "no answer" };
}

const dataUri = (p) => "data:image/png;base64," + readFileSync(p).toString("base64");
const transcribe = (imgPath) => ai({
  task: "query", image: dataUri(imgPath), question: OCR_PROMPT,
  stream: false, reasoning: false, max_tokens: 8192,
});
const answerOf = (j) => (j && j.ok && j.out && j.out.result && typeof j.out.result.answer === "string") ? j.out.result.answer : null;
const detect = (imgPath, target) => ai({
  task: "detect", image: dataUri(imgPath), target, stream: false, max_objects: 50,
});
const objectsOf = (j) => (j && j.ok && j.out && j.out.result && Array.isArray(j.out.result.objects)) ? j.out.result.objects : null;
const refusedBy = (n) => n === "" || n === REFUSAL || n.startsWith(REFUSAL);

/* ==========================================================================
 * 4. THE REFEREE — the local tesseract the floor was measured with. It says
 *    what a crop contains; the model never grades its own work.
 * ======================================================================== */
console.log("\ninstalling the referee (tesseract.js 7.0.0, into the temp dir — nothing is added to the repo)…");
execSync("npm init -y >/dev/null 2>&1 && npm install --no-audit --no-fund tesseract.js@7.0.0 >/dev/null 2>&1",
  { cwd: work, shell: "/bin/sh" });
const { createWorker } = await import(join(work, "node_modules/tesseract.js/src/index.js"));
mkdirSync(join(work, "cache"), { recursive: true });
const referee = await createWorker("eng", 1, { cachePath: join(work, "cache") });
const refereeRead = async (p) => norm((await referee.recognize(p)).data.text);

let CROPN = 0;
/** Crop a normalised box out of any image, with CPDF-11's padding. */
function crop(src, box, name, pad = 0.004) {
  const out = join(work, `crop-${name}-${CROPN++}.png`);
  execFileSync("python3", ["-c", `
from PIL import Image
import sys
im = Image.open(sys.argv[1]); W,H = im.size
x0,y0,x1,y1,pad = [float(v) for v in sys.argv[3:8]]
b = (max(0,int((x0-pad)*W)), max(0,int((y0-pad)*H)), min(W,int((x1+pad)*W)), min(H,int((y1+pad)*H)))
if b[2]<=b[0] or b[3]<=b[1]: raise SystemExit("degenerate box")
im.crop(b).save(sys.argv[2])
`, src, out, String(box.x_min), String(box.y_min), String(box.x_max), String(box.y_max), String(pad)],
    { stdio: ["ignore", "pipe", "pipe"] });
  return out;
}

/** Longest common substring length and its offset in `a`. CPDF-11's. */
function lcs(a, b) {
  const n = a.length, m = b.length;
  let prev = new Int32Array(m + 1), cur = new Int32Array(m + 1), best = 0, at = -1;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : 0;
      if (cur[j] > best) { best = cur[j]; at = i - best; }
    }
    [prev, cur] = [cur, prev]; cur.fill(0);
  }
  return { len: best, at };
}

const GTN = norm(GT_PAGE2);
/* THE REGION GROUND TRUTH, AND ITS TRUSTWORTHINESS GATE — CPDF-11's, kept
   because its second run is why it exists: a region scored 1.58% on a window
   derived from a referee read that was only 47% placeable in the page's ground
   truth. That is UNSCOREABLE, not a failure, and the difference has to live in
   the instrument. The referee always reads the CLEAN page here, never a rung. */
async function cleanRead(box, tag) {
  try { return await refereeRead(crop(PAGE, box, tag)); } catch { return ""; }
}
function windowFor(read) {
  if (!read.length) return { ok: false, why: "the referee read nothing out of the clean crop" };
  const { len, at } = lcs(GTN, read);
  const placeable = len / read.length;
  if (len < 40 || placeable < 0.8) {
    return { ok: false, placeable, why: `the referee's own read of the CLEAN crop is only ${(placeable * 100).toFixed(0)}% placeable in the page ground truth` };
  }
  return { ok: true, placeable, at, window: GTN.slice(at, at + read.length) };
}

/* ==========================================================================
 * (A) THE COMPOSED SHAPE ON CPDF-11's LADDER.
 * ======================================================================== */
console.log(`\n=== (A) THE COMPOSED SHAPE ON THE CPDF-11 LADDER — detect on the rung, crop the rung, transcribe the crop`);
console.log(`    region ground truth derived from the CLEAN page at the SAME box, ${RUNS} transcriptions per region ===`);
const RUNGS = [
  ["R0", "rung0", "300 dpi, the original page"],
  ["R1", "rung1", "150 dpi equivalent"],
  ["R2", "rung2", "75 dpi equivalent"],
  ["R3", "rung3", "75 dpi + gaussian blur 2.0"],
  ["R4", "rung4", "37.5 dpi + gaussian blur 3.0"],
  ["C1", "contrast", "OFF-LADDER: contrast collapsed to 16 greys"],
];
const ladder = [];
for (const [id, file, desc] of RUNGS) {
  const img = join(work, `${file}.png`);
  const objs = objectsOf(await detect(img, "paragraph of text"));
  const row = { id, desc, boxes: objs === null ? -1 : objs.length, regions: [], unscoreable: 0 };
  if (objs === null) {
    console.log(`  ${id}: DETECT returned no objects field — the composed shape cannot even START at this rung`);
    ladder.push(row); continue;
  }
  if (objs.length === 0) {
    console.log(`  ${id}: DETECT returned 0 boxes — STRUCTURAL REFUSAL: the composed shape has nothing to transcribe`);
    ladder.push(row); continue;
  }
  const byArea = objs.map((b, i) => ({ b, i, area: (b.x_max - b.x_min) * (b.y_max - b.y_min) }))
    .sort((p, q) => q.area - p.area).slice(0, 3);
  console.log(`  ${id} (${desc}): ${objs.length} box(es); scoring the ${byArea.length} largest`);
  for (const { b, i } of byArea) {
    const clean = await cleanRead(b, `${id}-clean${i}`);
    const w = windowFor(clean);
    if (!w.ok) {
      row.unscoreable++;
      console.log(`      box ${i} y=${b.y_min.toFixed(3)}..${b.y_max.toFixed(3)}: NOT SCORED — ${w.why}`);
      continue;
    }
    const rungCrop = (() => { try { return crop(img, b, `${id}-rung${i}`); } catch { return null; } })();
    if (!rungCrop) { row.unscoreable++; console.log(`      box ${i}: NOT SCORED — degenerate crop`); continue; }
    const texts = [], scored = [];
    let refusals = 0;
    for (let r = 0; r < RUNS; r++) {
      const a = answerOf(await transcribe(rungCrop));
      const n = a === null ? "" : norm(a);
      texts.push(n);
      if (refusedBy(n)) { refusals++; continue; }
      scored.push(stats(w.window, a));
    }
    const distinct = new Set(texts).size;
    const reg = {
      i, y: [b.y_min, b.y_max], gtLen: w.window.length, placeable: w.placeable,
      refusals, distinct, runs: RUNS,
      charAcc: scored.length ? median(scored.map((s) => s.charAcc)) : null,
      digTotal: scored.length ? scored[0].digTotal : null,
      digRight: scored.length ? median(scored.map((s) => s.digTotal - s.digErr)) : null,
      mintedMax: scored.length ? Math.max(...scored.map((s) => s.minted)) : null,
      outLen: scored.length ? median(scored.map((s) => s.ocrLen)) : 0,
      sample: texts[0] || "",
    };
    row.regions.push(reg);
    console.log(`      box ${i} y=${b.y_min.toFixed(3)}..${b.y_max.toFixed(3)}: region GT ${w.window.length} chars ` +
      `(${(w.placeable * 100).toFixed(0)}% placeable); refused ${refusals}/${RUNS}; DISTINCT transcriptions ${distinct}/${RUNS}` +
      (scored.length
        ? `; median char ${reg.charAcc.toFixed(2)}%; GT digits ${reg.digRight}/${reg.digTotal}; MINTED max ${reg.mintedMax}`
        : ""));
    console.log(`          model said: ${JSON.stringify(reg.sample.slice(0, 140))}`);
  }
  ladder.push(row);
}

/* ==========================================================================
 * (B) REPRODUCIBILITY OVER IDENTICAL BYTES — the second half nobody measured.
 *     Does the BOX come back the same? An anchor that moves is not an anchor.
 * ======================================================================== */
console.log(`\n=== (B) REPRODUCIBILITY OVER IDENTICAL BYTES — the DETECT half, ${RUNS} runs on the same clean page ===`);
const iou = (a, b) => {
  const x0 = Math.max(a.x_min, b.x_min), y0 = Math.max(a.y_min, b.y_min);
  const x1 = Math.min(a.x_max, b.x_max), y1 = Math.min(a.y_max, b.y_max);
  const inter = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
  const ua = (a.x_max - a.x_min) * (a.y_max - a.y_min) + (b.x_max - b.x_min) * (b.y_max - b.y_min) - inter;
  return ua > 0 ? inter / ua : 0;
};
const detectRuns = [];
for (let r = 0; r < RUNS; r++) {
  const objs = objectsOf(await detect(PAGE, "paragraph of text"));
  detectRuns.push(objs || []);
  console.log(`  detect run ${r + 1}: ${objs === null ? "NO OBJECTS FIELD" : objs.length + " box(es)"}` +
    (objs && objs.length ? " " + objs.slice(0, 4).map((b) => `[${b.y_min.toFixed(3)},${b.y_max.toFixed(3)}]`).join(" ") : ""));
}
/** Score one page's repeated detect runs for anchor stability. */
function boxStability(label, runs) {
  const out = { label, pairs: 0, matched: 0, medIoU: null, sameCount: null, counts: runs.map((d) => d.length) };
  if (runs.length < 2) return out;
  out.sameCount = new Set(out.counts).size === 1;
  const ious = [];
  for (let r = 1; r < runs.length; r++) {
    for (const b of runs[0]) {
      out.pairs++;
      const best = runs[r].length ? Math.max(...runs[r].map((c) => iou(b, c))) : 0;
      ious.push(best);
      if (best >= 0.5) out.matched++;
    }
  }
  out.medIoU = ious.length ? median(ious) : null;
  console.log(`  ${label}: box counts ${out.counts.join(", ")} — same count: ${out.sameCount}; ` +
    `every run-1 box matched to its best counterpart in a later run: median IoU ` +
    `${out.medIoU === null ? "—" : out.medIoU.toFixed(3)}; ${out.matched}/${out.pairs} at IoU>=0.5`);
  console.log(`  READ THIS AS: ${out.pairs > 0 && out.matched === out.pairs && out.sameCount
    ? "the anchor region is STABLE over identical bytes"
    : "THE ANCHOR REGION IS NOT STABLE over identical bytes — the same page yields a different region"}`);
  return out;
}
const boxRepro = boxStability("anchor page", detectRuns);
/* ONE PAGE IS A PROPERTY OF ONE PAGE. The same question is asked on every corpus
   page, because "this scan is hard to box" and "this model does not box the same
   way twice" are different claims and only the second one is a verdict. */
const corpusBoxRepro = [];

/* ==========================================================================
 * (D) CORPUS REACH BEYOND THE ANCHOR. No human ground truth exists here and
 *     the metric is named for what it actually is.
 * ======================================================================== */
console.log(`\n=== (D) CORPUS REACH — the composed shape on ${census.extracted.length} image-only page(s) from other documents`);
console.log(`    NO HUMAN GROUND TRUTH EXISTS FOR THESE PAGES. The reference is the local-tesseract floor`);
console.log(`    reading the SAME crop, so the columns are AGREEMENT-WITH-THE-FLOOR and DIGIT DIVERGENCE`);
console.log(`    FROM THE FLOOR — neither one is accuracy and neither one is minting. ===`);
const corpusRows = [];
for (const e of census.extracted) {
  /* The detect half, RUNS times, on identical page bytes — the anchor-stability
     question from (B) asked again on a page that is not the anchor. The FIRST of
     these runs is the one whose boxes are then cropped and transcribed, so this
     costs RUNS-1 extra calls per page and nothing else changes. */
  const dRuns = [];
  for (let r = 0; r < RUNS; r++) dRuns.push(objectsOf(await detect(e.file, "paragraph of text")) || []);
  corpusBoxRepro.push(boxStability(`${e.id} p${e.page}`, dRuns));
  const objs = dRuns[0];
  if (objs.length === 0) {
    console.log(`  ${e.id} p${e.page}: DETECT returned 0 boxes on run 1 — STRUCTURAL REFUSAL`);
    corpusRows.push({ id: e.id, page: e.page, boxes: 0, regions: [] });
    continue;
  }
  const byArea = objs.map((b, i) => ({ b, i, area: (b.x_max - b.x_min) * (b.y_max - b.y_min) }))
    .sort((p, q) => q.area - p.area).slice(0, 2);
  const row = { id: e.id, page: e.page, boxes: objs.length, regions: [], unscoreable: 0 };
  console.log(`  ${e.id} p${e.page}: ${objs.length} box(es); scoring the ${byArea.length} largest`);
  for (const { b, i } of byArea) {
    let cropFile = null, ref = "";
    try { cropFile = crop(e.file, b, `corp-${e.id}-${i}`); } catch { cropFile = null; }
    if (cropFile) { try { ref = await refereeRead(cropFile); } catch { ref = ""; } }
    if (!cropFile || ref.length < 40) {
      row.unscoreable++;
      console.log(`      box ${i}: NOT SCORED — the floor engine reads ${ref.length} chars out of this crop, ` +
        `so there is no reference to compare against (this is a statement about the REFERENCE, not about the model)`);
      continue;
    }
    const texts = [], scored = [];
    let refusals = 0;
    for (let r = 0; r < RUNS; r++) {
      const a = answerOf(await transcribe(cropFile));
      const n = a === null ? "" : norm(a);
      texts.push(n);
      if (refusedBy(n)) { refusals++; continue; }
      scored.push(stats(ref, a));
    }
    const distinct = new Set(texts).size;
    const reg = {
      i, refLen: ref.length, refusals, distinct, runs: RUNS,
      agree: scored.length ? median(scored.map((s) => s.charAcc)) : null,
      digTotal: scored.length ? scored[0].digTotal : null,
      digMatch: scored.length ? median(scored.map((s) => s.digTotal - s.digErr)) : null,
      divergeMax: scored.length ? Math.max(...scored.map((s) => s.minted)) : null,
      sample: texts[0] || "",
    };
    row.regions.push(reg);
    console.log(`      box ${i}: floor reads ${ref.length} chars; refused ${refusals}/${RUNS}; ` +
      `DISTINCT transcriptions ${distinct}/${RUNS}` +
      (scored.length ? `; median agreement ${reg.agree.toFixed(2)}%; floor digits matched ${reg.digMatch}/${reg.digTotal}; ` +
        `digits DIVERGING from the floor max ${reg.divergeMax}` : ""));
  }
  corpusRows.push(row);
}

/* ==========================================================================
 * (NC1) THE BLANK AND NOISE CONTROLS, ON THE COMPOSED SHAPE. Armed alone in
 *       the sense that matters: they are their own pages, nothing else is
 *       touched, and BOTH halves are run.
 * ======================================================================== */
console.log(`\n=== (NC1) BLANK AND NOISE, ON THE COMPOSED SHAPE — ${RUNS} runs each, both halves ===`);
console.log(`    DECLARED: nothing may transcribe to text. A detect returning 0 boxes is a pass that`);
console.log(`    COSTS NOTHING, so the transcriber is ALSO asked directly on a forced central crop.`);
let controlFailures = 0;
const ncRows = [];
for (const [name, file] of [["blank white page", "control-blank.png"], ["uniform noise page", "control-noise.png"]]) {
  const src = join(work, file);
  const objs = objectsOf(await detect(src, "paragraph of text"));
  const nBoxes = objs === null ? -1 : objs.length;
  console.log(`  ${name} — natural half: detect returned ${nBoxes === -1 ? "NO OBJECTS FIELD" : nBoxes + " box(es)"}`);
  const natural = [];
  if (objs && objs.length) {
    for (const b of objs.slice(0, 2)) {
      let f = null; try { f = crop(src, b, `nc-${name.replace(/\W+/g, "")}`); } catch { f = null; }
      if (!f) continue;
      for (let r = 0; r < RUNS; r++) {
        const a = answerOf(await transcribe(f));
        const n = a === null ? "" : norm(a);
        const ok = refusedBy(n);
        if (!ok) controlFailures++;
        natural.push(ok);
        console.log(`      natural crop run ${r + 1}: ${ok ? "PASS (nothing / refusal)" : "FAIL — INVENTED TEXT"} ${JSON.stringify(n.slice(0, 200))}`);
      }
    }
  }
  /* THE FORCED HALF. A fixed central crop, so the control cannot pass for free. */
  const forcedBox = { x_min: 0.25, y_min: 0.25, x_max: 0.75, y_max: 0.75 };
  const forced = [];
  let ff = null; try { ff = crop(src, forcedBox, `ncforced-${name.replace(/\W+/g, "")}`); } catch { ff = null; }
  if (!ff) { console.log(`      forced half: COULD NOT CROP — the arm did not arm, and that is a finding`); }
  else {
    for (let r = 0; r < RUNS; r++) {
      const a = answerOf(await transcribe(ff));
      const n = a === null ? "" : norm(a);
      const ok = refusedBy(n);
      if (!ok) controlFailures++;
      forced.push(ok);
      console.log(`      FORCED central crop run ${r + 1}: ${ok ? "PASS (nothing / refusal)" : "FAIL — INVENTED TEXT"} ${JSON.stringify(n.slice(0, 200))}`);
    }
  }
  ncRows.push({ name, boxes: nBoxes, natural: natural.length, naturalPass: natural.filter(Boolean).length,
    forced: forced.length, forcedPass: forced.filter(Boolean).length });
}

/* ==========================================================================
 * THE SUMMARY, THE ARMS' VERDICTS, AND THE FOOT.
 * ======================================================================== */
/* THE ROLL-UP IS THE WORST REGION, NOT THE MEDIAN ONE, AND THE FIRST RUN OF THIS
   PROBE IS WHY. A median-of-region-medians put R1 at 99.01% on a rung where one
   of its two regions scored 89.47% while MINTING SEVEN DIGITS: the roll-up hid
   the only thing on the row that mattered. A summary statistic that averages a
   minting region away is the wrong instrument giving the more flattering number,
   which is this project's most-measured instrument failure. Both numbers print. */
console.log(`\n=== (A/C) THE LADDER, COMPOSED — one row per rung. The char column is MEDIAN (WORST REGION). ===`);
console.log(`  RUNG | what it is                                  | boxes | scorable | refused | DISTINCT/runs | char med (worst) | GT digits | MINTED`);
for (const row of ladder) {
  const rs = row.regions;
  const refused = rs.reduce((n, r) => n + r.refusals, 0);
  const totalRuns = rs.length * RUNS;
  const distinctWorst = rs.length ? Math.max(...rs.map((r) => r.distinct)) : null;
  const chars = rs.filter((r) => r.charAcc !== null).map((r) => r.charAcc);
  const mint = rs.filter((r) => r.mintedMax !== null).map((r) => r.mintedMax);
  const dig = rs.filter((r) => r.digTotal !== null);
  console.log(`  ${row.id.padEnd(4)} | ${row.desc.padEnd(43)} | ${String(row.boxes).padEnd(5)} | ` +
    `${String(rs.length).padEnd(8)} | ${String(totalRuns ? `${refused}/${totalRuns}` : "—").padEnd(7)} | ` +
    `${String(distinctWorst === null ? "—" : `${distinctWorst}/${RUNS}`).padEnd(13)} | ` +
    `${(chars.length ? `${median(chars).toFixed(2)}% (${Math.min(...chars).toFixed(2)}%)` : "—").padEnd(16)} | ` +
    `${(dig.length ? `${dig.reduce((n, r) => n + r.digRight, 0)}/${dig.reduce((n, r) => n + r.digTotal, 0)}` : "—").padEnd(9)} | ` +
    `${mint.length ? Math.max(...mint) : "—"}`);
}
console.log(`  A rung reading "0 scorable" is UNDETERMINED, NEVER "it refused": it means DETECT moved the boxes`);
console.log(`  onto regions whose CLEAN content the referee cannot place in the page ground truth, so no`);
console.log(`  trustworthy region truth exists to score against. The model may or may not have invented there.`);

console.log(`\n=== (D) THE CORPUS, COMPOSED — one row per page ===`);
console.log(`  document / page                         | boxes | scorable | refused | DISTINCT/runs | agree w/ floor | floor digits | DIVERGING`);
for (const row of corpusRows) {
  const rs = row.regions;
  const refused = rs.reduce((n, r) => n + r.refusals, 0);
  const totalRuns = rs.length * RUNS;
  const distinctWorst = rs.length ? Math.max(...rs.map((r) => r.distinct)) : null;
  const ag = rs.filter((r) => r.agree !== null).map((r) => r.agree);
  const dv = rs.filter((r) => r.divergeMax !== null).map((r) => r.divergeMax);
  const dig = rs.filter((r) => r.digTotal !== null);
  console.log(`  ${(row.id + " p" + row.page).padEnd(39)} | ${String(row.boxes).padEnd(5)} | ` +
    `${String(rs.length).padEnd(8)} | ${String(totalRuns ? `${refused}/${totalRuns}` : "—").padEnd(7)} | ` +
    `${String(distinctWorst === null ? "—" : `${distinctWorst}/${RUNS}`).padEnd(13)} | ` +
    `${(ag.length ? median(ag).toFixed(2) + "%" : "—").padEnd(14)} | ` +
    `${(dig.length ? `${dig.reduce((n, r) => n + r.digMatch, 0)}/${dig.reduce((n, r) => n + r.digTotal, 0)}` : "—").padEnd(12)} | ` +
    `${dv.length ? Math.max(...dv) : "—"}`);
}

console.log(`\n=== (B) ANCHOR STABILITY, POOLED OVER EVERY PAGE — the question CPDF-10's anchor rests on ===`);
{
  const all = [boxRepro, ...corpusBoxRepro];
  const pairs = all.reduce((n, r) => n + r.pairs, 0);
  const matched = all.reduce((n, r) => n + r.matched, 0);
  const sameCount = all.filter((r) => r.sameCount === true).length;
  const meds = all.filter((r) => r.medIoU !== null).map((r) => r.medIoU);
  console.log(`  pages measured for anchor stability:            ${all.length} (the anchor page + ${corpusBoxRepro.length} corpus page(s))`);
  console.log(`  pages returning the SAME BOX COUNT on ${RUNS} runs:  ${sameCount}/${all.length}`);
  console.log(`  run-1 boxes with a counterpart at IoU>=0.5:     ${matched}/${pairs}` +
    (pairs ? `  (${(100 * matched / pairs).toFixed(1)}%)` : ""));
  console.log(`  median of the per-page median best-match IoU:   ${meds.length ? median(meds).toFixed(3) : "—"}`);
  console.log(`  VERDICT ON THE ANCHOR: ${pairs > 0 && matched === pairs && sameCount === all.length
    ? "the region a claim would be anchored to COMES BACK over identical bytes"
    : "THE REGION A CLAIM WOULD BE ANCHORED TO DOES NOT RELIABLY COME BACK over identical bytes"}`);
  console.log(`  WHAT THIS CANNOT SEE: whether a DIFFERENT detect target, a fixed grid, or a classic`);
  console.log(`  layout analyser would be stable. It measures THIS model's detect step and nothing else.`);
}

/* NC3, the over-strictness arm, evaluated from what actually ran. */
const r0 = ladder.find((r) => r.id === "R0");
const r0best = r0 && r0.regions.length ? Math.max(...r0.regions.filter((x) => x.charAcc !== null).map((x) => x.charAcc)) : null;
const r0refusals = r0 ? r0.regions.reduce((n, x) => n + x.refusals, 0) : -1;
const nc3 = r0best !== null && r0best >= 95 && r0refusals === 0;
console.log(`\n=== (NC3) OVER-STRICTNESS — a clean high-fidelity page must still pass end to end ===`);
console.log(`  DECLARED: R0 must yield at least one scorable region at >=95% character accuracy, with no refusals.`);
console.log(`  ACTUAL:   best R0 region ${r0best === null ? "NONE SCORABLE" : r0best.toFixed(2) + "%"}; refusals ${r0refusals}` +
  ` -> ${nc3 ? "AS DECLARED (the instrument is not sabotaging its subject)" : "*** NOT AS DECLARED — no NO-GO from this run is worth anything until this is understood ***"}`);

console.log(`\n=== (NC1) CONTROLS — summary ===`);
for (const r of ncRows) {
  console.log(`  ${r.name.padEnd(20)} detect boxes ${String(r.boxes).padStart(3)}; ` +
    `natural crops ${r.naturalPass}/${r.natural} pass; FORCED crops ${r.forcedPass}/${r.forced} pass`);
}
console.log(`  total control runs producing text: ${controlFailures} ` +
  `(${controlFailures === 0 ? "the path does not answer on a page with no text on it" : "PATH FAILURE"})`);

console.log(`\n=== REACH, STATED, because a number without its n is not a measurement ===`);
console.log(`  anchor page with HUMAN ground truth:            1 (the only one this project has)`);
console.log(`  ladder rungs measured on it:                    ${ladder.length}`);
console.log(`  scorable anchor regions, all rungs:             ${ladder.reduce((n, r) => n + r.regions.length, 0)}`);
console.log(`  anchor transcriptions of identical crop bytes:  ${ladder.reduce((n, r) => n + r.regions.length, 0) * RUNS}`);
console.log(`  corpus PDFs harvested / readable:               ${corpusDocs.length} / ${census.docs}`);
console.log(`  corpus pages censused:                          ${census.pages} (${census.imageOnly} image-only)`);
console.log(`  corpus image-only pages measured:               ${census.extracted.length} (<=${PER_DOC} per document)`);
console.log(`  corpus regions scored against the floor:        ${corpusRows.reduce((n, r) => n + r.regions.length, 0)}`);
console.log(`  corpus transcriptions of identical crop bytes:  ${corpusRows.reduce((n, r) => n + r.regions.length, 0) * RUNS}`);
console.log(`  pages measured for anchor stability:            ${1 + corpusBoxRepro.length}`);
{
  const regs = [...ladder.flatMap((r) => r.regions), ...corpusRows.flatMap((r) => r.regions)];
  const nonRepro = regs.filter((r) => r.distinct > 1).length;
  console.log(`  regions transcribed ${RUNS}x on IDENTICAL bytes:     ${regs.length}` +
    (regs.length ? ` — ${nonRepro} gave MORE THAN ONE distinct text (${(100 * nonRepro / regs.length).toFixed(0)}%)` : ""));
}
console.log(`  model calls that never answered:                ${FAILED_CALLS}`);
console.log(`  WHAT THIS PROBE CANNOT SEE, stated beside the numbers:`);
console.log(`    - HUMAN ground truth exists for ONE page. Every corpus figure is agreement with the`);
console.log(`      local-tesseract FLOOR, so a place where both engines are wrong the same way is invisible.`);
console.log(`    - A rung with 0 scorable regions is UNDETERMINED: detect moved the boxes somewhere the`);
console.log(`      referee cannot place, so this probe does NOT know what the model did at that rung.`);
console.log(`    - No Worker CPU, memory or latency figure. This ran against a shared machine with other`);
console.log(`      workers live on it and every millisecond here is harness wall time, so none is reported.`);
console.log(`    - One detect TARGET ("paragraph of text") and one prompt. A different ask is unmeasured.`);
console.log(`    - One model at one version. Nothing here is a statement about any other engine.`);

console.log(`\n=== COST (in the account, free allocation, nothing funded) ===`);
console.log(`  ${CALLS} model calls; ${IN_TOK.toLocaleString()} input tokens, ${OUT_TOK.toLocaleString()} output tokens; ${NEURONS.toFixed(0)} neurons`);
console.log(`  vendor-stated price for this model: $0.30 / M input tokens, $1.00 / M output tokens ` +
  `(vendor's CLAIM, retrieved 2026-08-04, labelled as theirs) -> this whole run ~$${((IN_TOK * 0.30 + OUT_TOK * 1.00) / 1e6).toFixed(4)}`);

await referee.terminate();
await teardown();

console.log(`\nFOOT REACHED — every section above ran to its end. Tallies that are absent read -1, never 0.`);
if (controlFailures > 0) {
  console.error(`\nPATH FAILURE: ${controlFailures} blank/noise control run(s) produced text.`);
  process.exitCode = 1;
}
if (!nc3) process.exitCode = 1;
console.log("workdir left for inspection:", work);
