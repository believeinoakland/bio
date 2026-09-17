#!/usr/bin/env node
/* M0-35 — CENSUS of every figure quoted in the reference-iteration CPU currency.
 *
 * WHY THIS IS A TOOL AND NOT A GREP. The row asks how many figures exist, where
 * they live, and how many can be attributed to a runtime NOW. A grep answers the
 * first badly and the third not at all, and the cheap defeat the brief names is a
 * sweep that matches a convenient set and reports 100% over it. So this prints its
 * CORPUS and its REACH before it prints a result, and it names what it cannot see.
 *
 * WHAT THE UNIT IS. `cpu.mjs`'s `burn(n)` runs n iterations of a fixed LCG step.
 * Figures in the corpus take THREE forms and they are NOT equally affected:
 *
 *   COUNT  a number of reference iterations (40,000,000; ~54M ref-iter; 2M/step).
 *          A count is RUNTIME-PORTABLE: burn(4e7) is 4e7 multiplications in any
 *          runtime. A count needs no runtime stamp and this tool says so.
 *   RATE   iterations per millisecond (25,032 iter/ms node; 155,538 workerd).
 *          A rate is the CONVERSION FACTOR and is NOT portable — 6.21x, D-368.
 *          A rate is meaningless without a runtime stamp.
 *   DERIVED a millisecond figure obtained by dividing a COUNT by a RATE, or a
 *          count obtained by multiplying a millisecond figure by a RATE. This
 *          INHERITS the rate's runtime and is the dangerous class, because it
 *          wears an absolute physical unit (ms) while being runtime-relative.
 *
 * THE MATCHER SEES COUNT AND RATE LEXICALLY. IT CANNOT SEE DERIVED, because a
 * derived figure is spelled `257 ms` and nothing in those five characters says it
 * came through a rate. DERIVED figures are found by reading the provenance prose
 * around a RATE site and are listed here by hand, each with the line that proves
 * it. That hand list is this tool's declared blind spot, printed on every run.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

/* --- REACH: what this tool walks, stated rather than implied ------------- */
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "release"]);
const EXTS = [".md", ".mjs", ".js", ".json", ".ts", ".jsonc"];

/* `dist/` and `release/` are BUNDLES — generated copies of sources this walk
 * already reads. Counting them would double-count `cpu.mjs`'s own `burn()` and
 * inflate the census with derivatives nobody edits. Excluded ON PURPOSE, and the
 * run prints how many files that removed so the exclusion is auditable. */

/* GENERATED FILES, excluded BY CONSTRUCTION and named individually so the
 * exclusion is auditable rather than a silent filter. Each is a derived copy of
 * text this walk already reads at its source, so counting it would report the
 * same figure twice and inflate the census.
 *
 *   docs/DECIDED.md          `tools/decided.mjs`'s generated index
 *   newgroup/src/release.mjs a whole bundle embedded as one JS string literal
 *
 * AND THIS FILE ITSELF. A sweep that counts its own prose is the
 * sweep-arm-that-cites-itself class — WORKER.md records it, M0-34 hit it inside
 * the fix for a defect of its own shape, and the FIRST run of this census
 * scored 8 sites in its own source. `decided.mjs`'s `scan()` excludes the
 * generated index by construction for the same reason; this does the same. */
const GENERATED = new Set([
  "docs/DECIDED.md",
  "newgroup/src/release.mjs",
  /* THIS ITEM'S OWN TWO FILES. The census tool and the probe both QUOTE the
   * figures they exist to measure, so counting them reports M0-35's own prose as
   * corpus. The probe escaped the RATE bucket on the first run only because a
   * comment line break happened to fall between `25,032` and `iter/ms` — luck,
   * not construction, and luck is not an exclusion. Both are named here. */
  "tools/m035-refiter-census.mjs",
  "bio-plane/test/m035-cpu-currency-probe.mjs",
  "bio-plane/test/m035-workload-generality.mjs",
]);

function walk(dir, out = [], skipped = { dirs: 0, files: 0 }) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) { skipped.dirs++; continue; }
      walk(p, out, skipped);
    } else if (e.isFile()) {
      if (EXTS.some((x) => e.name.endsWith(x))) out.push(p);
      else skipped.files++;
    }
  }
  return out;
}

/* --- The classifier, written by ASKING WHAT MAKES A FIGURE RECOGNISABLE IN
 * PRINCIPLE rather than by listing spellings seen so far.
 *
 * A figure is in this currency when a NUMBER stands next to a token naming the
 * currency. The currency is named in exactly two ways that can be enumerated
 * from its DEFINITION rather than from the corpus: by the unit
 * (reference iteration / ref-iter / iter), or by the INSTRUMENT that produces it
 * (`burn`, `cpuProbe`, `op=cpuprobe`). Anything else is DERIVED and invisible. */

const NUM = String.raw`[\d][\d,_.]*\s*(?:[MKB]\b|million|thousand)?`;
const RATE_RE = new RegExp(String.raw`(${NUM})\s*(?:reference[- ]?)?iter(?:ation)?s?\s*(?:/|per\s+)\s*ms\b`, "i");
/* The COUNT matcher requires the number to be IMMEDIATELY followed by the unit
 * word. Its first draft allowed slack and matched `M0-35 REFERENCE-ITERATION`
 * in this file's own banner, scoring the literal `35` as a figure — a false
 * positive produced by the item's own id. `\s*` with no other separator is what
 * closes it, and the case is kept in `--selftest` so it cannot come back. */
/* `(?<![\w-])` is load-bearing: without it `M0-35 REFERENCE-ITERATION` scores the
 * `35` out of this item's OWN id as a figure, because `\b` treats `-` as a
 * boundary. A draft did exactly that. */
const COUNT_RE = new RegExp(String.raw`(?<![\w-])(${NUM})[ \t]*(?:reference[- ]iterations?|ref-iter|iterations?\b(?!\s*(?:/|per)\s*ms))`, "i");
const UNIT_MENTION_RE = /reference[- ]?iterat|ref-iter|iter\/ms|iterations?\s+per\s+ms|cpuprobe|\bburn\(|cpuProbe/i;

/* RUNTIME ATTRIBUTION, AND IT IS DELIBERATELY TOO STRICT.
 *
 * The row's instruction is absolute: `undetermined` is first-class and must
 * never be resolved by whichever guess is convenient, because a figure
 * retro-labelled with a guessed runtime is WORSE than one labelled unknown — it
 * looks settled. So this attributes only when a runtime token sits on the SAME
 * LINE within a tight window of the figure itself.
 *
 * THE FIRST DRAFT SEARCHED A THREE-LINE WINDOW AND COMMITTED THE EXACT DEFECT
 * THIS ITEM MEASURES. `MEASUREMENTS.md`'s M-20 reads:
 *
 *     ... **25,032 iter/ms in
 *     node**, **155,538 iter/ms inside workerd** — a factor of **6.21**.
 *
 * The three-line window found `node` first and stamped the WORKERD figure
 * `runtime=node`. An instrument built to catch mislabelled runtimes was
 * mislabelling one. Kept here as a comment rather than deleted, because the
 * narrow window below is only obviously right once you know what the wide one
 * did. */
const RUNTIME_TOKENS = /\b(node|workerd|miniflare|deployed|browser|v8)\b/gi;
const ATTRIB_WINDOW = 40;

/** The runtime qualifying a figure, or null meaning UNDETERMINED.
 *
 *  THE RULE, AND IT UNDER-ATTRIBUTES ON PURPOSE. In this corpus's prose the
 *  runtime FOLLOWS the figure it qualifies — "25,032 iter/ms in node",
 *  "155,538 iter/ms inside workerd", "40M reference iterations ... at this run's
 *  workerd rate". So only tokens AFTER the matched figure-and-unit count. A
 *  token BEFORE the figure is ignored, because in the one line where it matters
 *  it belongs to the PRECEDING figure — M-20's `node**, **155,538 iter/ms inside
 *  workerd**` is exactly the sentence that made a wide window stamp the workerd
 *  figure `node`.
 *
 *  Two DIFFERENT runtimes both in range still yields null. A guess is worse
 *  than `undetermined`: it looks settled.
 *
 *  THE COST OF THIS STRICTNESS IS REAL AND IS PRINTED RATHER THAN HIDDEN. A
 *  figure whose runtime is stated on the NEXT line — `MEASUREMENTS.md`'s 40M
 *  window is — scores UNDETERMINED here even though a reader can attribute it
 *  in two seconds. That is the safe direction and the summary says how many
 *  figures it costs. */
function attribute(line, figureIndex, figureLength) {
  RUNTIME_TOKENS.lastIndex = 0;
  const end = figureIndex + figureLength;
  const near = [];
  let m;
  while ((m = RUNTIME_TOKENS.exec(line))) {
    if (m.index < end) continue;                 // before/inside the figure: not its qualifier
    const d = m.index - end;
    if (d <= ATTRIB_WINDOW) near.push({ tok: m[0].toLowerCase(), d });
  }
  if (near.length === 0) return null;
  near.sort((a, b) => a.d - b.d);
  if (new Set(near.map((x) => x.tok)).size > 1) return null;   // ambiguous -> UNDETERMINED
  return near[0].tok;
}

/* --- SELF-TEST: the matcher's own arms, so its reach is DRIVEN rather than
 * believed on the strength of its existence. Every case below is either a real
 * line from this corpus or a defect a draft of this tool actually produced. */
if (process.argv.includes("--selftest")) {
  const cases = [
    // [line, expected kind, expected runtime-or-null, why]
    ["**25,032 iter/ms in node**", "RATE", "node", "a rate with its runtime adjacent"],
    ["node**, **155,538 iter/ms inside workerd** — a factor of **6.21**.", "RATE", "workerd",
      "M-20's second half. The THREE-LINE window stamped this `node`; the narrow one must not."],
    ["M0-35 REFERENCE-ITERATION CURRENCY CENSUS", null, null,
      "this tool's OWN banner. A draft scored the literal `35` as a COUNT — the item's id"
      + " becoming a figure. This case exists because that happened."],
    ["| CPU | **40,000,000 reference iterations fit**; killed during the next 2,000,000",
      "COUNT", null, "a real count with NO runtime on the line: must be UNDETERMINED, not guessed"],
    ["window is 40M reference iterations at this run's workerd rate", "COUNT", "workerd",
      "a count whose runtime IS adjacent and AFTER it"],
    ["The measured per-invocation window is 40M reference iterations (`op=cpuprobe`,",
      "COUNT", null,
      "the REAL MEASUREMENTS.md:12517 line. Its runtime is stated on the NEXT line, so"
      + " same-line attribution scores it UNDETERMINED. That is this matcher's declared"
      + " under-attribution, pinned here so nobody 'fixes' it into a guess."],
    ["    burn(iterationsPerStep);", null, null, "plumbing, no figure"],
  ];
  let pass = 0, fail = 0;
  for (const [line, wantKind, wantRt, why] of cases) {
    const rate = RATE_RE.exec(line);
    const count = rate ? null : COUNT_RE.exec(line);
    const gotKind = rate ? "RATE" : count ? "COUNT" : null;
    const at = rate ? rate.index : count ? count.index : -1;
    const gotRt = at >= 0 ? attribute(line, at, (rate || count)[0].length) : null;
    const ok = gotKind === wantKind && gotRt === wantRt;
    console.log(`${ok ? "  ok  " : "FAIL  "}kind=${gotKind} runtime=${gotRt}  (want ${wantKind}/${wantRt})`);
    console.log(`        ${why}`);
    ok ? pass++ : fail++;
  }
  console.log(`\nselftest: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

const files = [];
const skipped = { dirs: 0, files: 0 };
walk(ROOT, files, skipped);

const rows = [];
let filesWithMention = 0;
let generatedSkipped = 0;
for (const f of files) {
  const rel = relative(ROOT, f);
  if (GENERATED.has(rel)) { generatedSkipped++; continue; }
  let src;
  try { src = readFileSync(f, "utf8"); } catch { continue; }
  if (!UNIT_MENTION_RE.test(src)) continue;
  filesWithMention++;
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (!UNIT_MENTION_RE.test(L)) continue;
    const rate = RATE_RE.exec(L);
    const count = rate ? null : COUNT_RE.exec(L);
    let kind = "MENTION-NO-FIGURE";
    let value = null, at = -1;
    if (rate) { kind = "RATE"; value = rate[1].trim(); at = rate.index; }
    else if (count) { kind = "COUNT"; value = count[1].trim(); at = count.index; }
    rows.push({
      file: rel, line: i + 1, kind, value,
      runtime: at >= 0 ? attribute(L, at, (rate || count)[0].length) : null,
      archived: rel.startsWith("docs/archive/"),
      text: L.trim().slice(0, 150),
    });
  }
}

/* --- DECLARED BLIND SPOT: the DERIVED figures, by hand, each with its proof
 * line. These cannot be matched lexically and are NOT scored by the walk above.
 * Listed so the census's own reach is legible instead of flattering. */
const DERIVED_BY_HAND = [
  { file: "docs/development/MEASUREMENTS.md", near: 1373,
    what: "OCR per-page ms -> ref-iter, whole table (8 cells)",
    rate: "26,036 iter/ms", runtime: "node",
    proof: "'Node-proxy medians (5 warm runs/page), calibrated: 40,000,000 reference iterations = 1,536 ms on this machine (26,036 iter/ms)'" },
  { file: "docs/development/MEASUREMENTS.md", near: 1376,
    what: "'the ceiling's currency converts on this machine to ~1.54 s'",
    rate: "26,036 iter/ms", runtime: "node",
    proof: "same calibration sentence; 40M / 26,036 = 1,536 ms" },
  { file: "docs/development/MEASUREMENTS.md", near: 12518,
    what: "'the 40M window ... at this run's workerd rate is 257 ms'",
    rate: "155,538 iter/ms", runtime: "workerd (miniflare)",
    proof: "'The workerd rate is the one used above, because the work being converted runs in workerd'" },
  { file: "docs/development/MEASUREMENTS.md", near: 12501,
    what: "promote ladder 'ref-iter/unit' column (6 rows) + '% of the 40M window' (6 rows)",
    rate: "155,538 iter/ms", runtime: "workerd (miniflare)",
    proof: "same sentence as above" },
  { file: "docs/development/MEASUREMENTS.md", near: 12523,
    what: "predicted-ms / %-of-window table (4 rows) from ms = 0.0076*units + 0.054*KiB",
    rate: "155,538 iter/ms", runtime: "workerd (miniflare)",
    proof: "'The measured per-invocation window is 40M reference iterations ... which at this run's workerd rate is 257 ms'" },
];

/* --- OUTPUT ------------------------------------------------------------- */
const n = (x) => x.toLocaleString("en-US");
console.log("M0-35 REFERENCE-ITERATION CURRENCY CENSUS");
console.log("=".repeat(78));
console.log("REACH (printed before any result, so the corpus is auditable):");
console.log(`  files walked ..................... ${n(files.length)}`);
console.log(`  directories skipped by name ...... ${n(skipped.dirs)}  (${[...SKIP_DIRS].join(", ")})`);
console.log(`  files skipped by extension ....... ${n(skipped.files)}`);
console.log(`  GENERATED files excluded ......... ${n(generatedSkipped)}  (${[...GENERATED].join(", ")})`);
console.log(`  files mentioning the currency .... ${n(filesWithMention)}`);
console.log(`  extensions walked ................ ${EXTS.join(" ")}`);
console.log("");

if (files.length < 100) { console.error("REFUSE: corpus floor not met — a walk over <100 files is not this repository."); process.exit(2); }
if (rows.length === 0) { console.error("REFUSE: zero sites. The matcher found nothing, which for this corpus means the matcher broke."); process.exit(2); }

const byKind = {};
for (const r of rows) (byKind[r.kind] ||= []).push(r);

for (const kind of ["RATE", "COUNT"]) {
  const rs = byKind[kind] || [];
  const live = rs.filter((r) => !r.archived), arch = rs.filter((r) => r.archived);
  console.log(`--- ${kind} — ${n(rs.length)} site${rs.length === 1 ? "" : "s"} ` +
              `(${n(live.length)} live, ${n(arch.length)} archived) ---`);
  for (const r of [...live, ...arch]) {
    const stamp = r.runtime ? `runtime=${r.runtime}` : "runtime=UNDETERMINED";
    console.log(`  ${r.archived ? "[arch] " : "       "}${r.file}:${r.line}  [${r.value}] ${stamp}`);
    console.log(`         ${r.text}`);
  }
  console.log("");
}
{
  const rs = byKind["MENTION-NO-FIGURE"] || [];
  const byFile = {};
  for (const r of rs) (byFile[r.file] ||= []).push(r.line);
  console.log(`--- MENTION-NO-FIGURE — ${n(rs.length)} sites in ${n(Object.keys(byFile).length)} files ---`);
  console.log("  (the currency is NAMED but no figure is quoted: plumbing, op dispatch, prose.");
  console.log("   Listed per file rather than per line — these are not figures and owe no stamp.)");
  for (const [f, ls] of Object.entries(byFile).sort()) console.log(`  ${f}  x${ls.length}`);
  console.log("");
}

console.log("--- DERIVED (the class the matcher CANNOT see; hand-adjudicated) ---");
for (const d of DERIVED_BY_HAND) {
  console.log(`  ${d.file}:~${d.near}  runtime=${d.runtime}  via ${d.rate}`);
  console.log(`      ${d.what}`);
  console.log(`      proof: ${d.proof}`);
}
console.log("");

const rateRows = byKind.RATE || [];
const countRows = byKind.COUNT || [];
const attributableRates = rateRows.filter((r) => r.runtime).length;
console.log("SUMMARY");
console.log("=".repeat(78));
console.log(`  RATE figures (NOT portable; need a stamp) .......... ${n(rateRows.length)}`);
console.log(`    of which the line/context names a runtime ........ ${n(attributableRates)}`);
console.log(`    UNDETERMINED .................................... ${n(rateRows.length - attributableRates)}`);
console.log(`  COUNT figures (portable; a stamp is NOT owed) ...... ${n(countRows.length)}`);
console.log(`  DERIVED figure GROUPS (hand-adjudicated) .......... ${n(DERIVED_BY_HAND.length)}`);
console.log("");
console.log("WHAT THIS CENSUS CANNOT SEE, and it is the load-bearing paragraph:");
console.log("  - Any DERIVED figure not in the hand list. A derived figure is spelled");
console.log("    `257 ms` and nothing in it says a rate was applied. The hand list was");
console.log("    built by reading every RATE site's surrounding prose; a derived figure");
console.log("    whose rate was applied SILENTLY, in a document that never names the");
console.log("    currency, is invisible to both halves and is honestly UNDETERMINED.");
console.log("  - Figures inside `dist/` and `release/` bundles (generated; excluded).");
console.log("  - Figures in a non-walked extension, and any figure in an image or table");
console.log("    image. Extensions walked are printed above.");
console.log("  - Whether a COUNT is portable IN PRACTICE for non-burn work: a count is");
console.log("    portable as a count, but converting OTHER work into it needs a rate.");
