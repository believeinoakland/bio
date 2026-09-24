#!/usr/bin/env node
/* CPDF-20 / D-283 — THE NEGATIVE CONTROL for the per-page tier-1/tier-2 rule.
 *
 * NOT a suite (`battery.mjs` and `coverage.mjs` do not discover `nc-*.mjs`): it
 * EDITS `src/textchain.mjs` on disk, one arm at a time, and restores it. Run it
 * directly:  node bio-plane/test/nc-cpdf20.mjs
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DECLARED BEFORE ARMING — what MUST fail, what MUST NOT, and why each exists
 * ─────────────────────────────────────────────────────────────────────────────
 *   BASELINE  the suite, untouched.                                MUST PASS
 *             Without this row, six-arms-broken and six-arms-working produce
 *             the identical report. A harness here once read `null` for every
 *             arm INCLUDING the baseline and only the baseline row told anyone.
 *
 *   A1  INVERT THE RULE — tier 2 wins exactly where it used to lose.
 *                                                                  MUST FAIL
 *       The row the item's NEGATIVE CONTROL names: "the rule inverted on one
 *       page -> the chain records the loser and the fixture's arm fails by name".
 *
 *   A2  SHIP §5.2 EXACTLY AS WRITTEN — drop the second condition, so a page is
 *       awarded on "fewer undetermined characters" alone.            MUST FAIL
 *       This is the design's own rule, armed. It must fail on `legistar-73618`
 *       page 1 — 709 characters traded for one unmapped glyph. If this arm ever
 *       PASSES, the corrected rule is no longer load-bearing and D-283 should be
 *       re-opened rather than the arm deleted.
 *
 *   A3  DROP THE PER-PAGE TIER STAMP — merge correctly, record nothing.
 *                                                                  MUST FAIL
 *       "The chain records which tier produced each page" is half the item, and
 *       a merge that is right but silent would otherwise pass every other arm.
 *
 *   A4  REPLACE EVERY PAGE UNCONDITIONALLY — the wholesale assignment D-283 is
 *       about, restored.                                            MUST FAIL
 *       Must break the over-strictness assertion on the fully-decodable PDF.
 *
 *   A5  TRUNCATE THE FIXTURE — hide three of the four PDFs.          MUST FAIL
 *       A totality assertion over a near-empty corpus passes for free (three
 *       times in this repository). The floor must catch it, not the assertions.
 *
 *   A6  OVER-STRICTNESS — rewrite the rule in a DIFFERENT but EQUIVALENT
 *       spelling (early returns instead of one conjunction).     MUST NOT FAIL
 *       Correct work in a spelling nobody anticipated must pass. An arm that
 *       fails here means the suite is pinned to how the rule is written rather
 *       than to what it does.
 *
 *   A7  RESTORE RAW `text.length` in `decodedChars` — the D-501 defect, put back.
 *                                                                  MUST FAIL
 *       Added 2026-09-24. The award is supposed to count GLYPHS; it counted the
 *       whole string, whitespace and all, so a change to EITHER tier's newline
 *       policy moved it with no glyph changing hands (D-481 moved tier 1's and
 *       the margin on `legistar-73618` p1 fell 129 -> 77). This arm must fail on
 *       the NEWLINE ARM by name — specifically on `strip`, which drops tier 1 to
 *       486 against tier 2's 580 and hands the trap page to tier 2. If this arm
 *       ever PASSES, the newline arm has stopped discriminating and D-501 should
 *       be re-opened rather than the arm deleted.
 *
 * A SURPRISING GREEN IS A FINDING ABOUT THE ARM. Recorded, never smoothed.
 */
import { readFileSync, writeFileSync, copyFileSync, renameSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SUBJECT = join(HERE, "..", "src", "textchain.mjs");
const SUITE = join(HERE, "tier-pagewise.test.mjs");
const FIX = join(HERE, "fixtures", "cpdf20");
const PEN = controlPen("cpdf20");

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

function runSuite() {
  try {
    const out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status === undefined ? -1 : e.status, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

/** Patch the subject, and REFUSE if the anchor did not match exactly once —
 *  an arm that did not arm is a finding, and this file exists because arms
 *  that matched zero times (or twice) have been reported as clean before. */
function patch(pristineText, from, to) {
  const n = pristineText.split(from).length - 1;
  if (n !== 1) return { ok: false, why: `anchor matched ${n} time(s), not exactly 1` };
  return { ok: true, text: pristineText.replace(from, to) };
}

mkdirSync(PEN, { recursive: true });
const PRISTINE_TEXT = readFileSync(SUBJECT, "utf8");
const PRISTINE_SHA = sha(SUBJECT);
const PRISTINE_BYTES = readFileSync(SUBJECT).length;
if (PRISTINE_BYTES < 20000) {
  console.error(`REFUSED: the subject is ${PRISTINE_BYTES} B, below the 20,000 B floor — `
              + `restoring a truncated file byte-identically proves nothing.`);
  process.exit(2);
}
console.log(`subject: src/textchain.mjs · ${PRISTINE_BYTES} B · ${PRISTINE_SHA.slice(0, 16)}`);
console.log(`suite:   test/tier-pagewise.test.mjs\n`);

const results = [];

function restoreAndVerify(armName) {
  const copy = join(PEN, `${armName}.pristine.mjs`);
  writeFileSync(SUBJECT, PRISTINE_TEXT);
  const back = sha(SUBJECT), bytes = readFileSync(SUBJECT).length;
  let cmpOk = false;
  try { execFileSync("cmp", ["-s", SUBJECT, copy]); cmpOk = true; } catch { cmpOk = false; }
  const okSha = back === PRISTINE_SHA;
  console.log(`      restored: ${bytes} B · sha ${okSha ? "MATCH" : "MISMATCH"} · cmp ${cmpOk ? "identical" : "DIFFERS"}`);
  if (!okSha || !cmpOk || bytes < 20000) {
    console.error(`      RESTORE FAILED after ${armName}. Stopping rather than measuring a wrong tree.`);
    process.exit(3);
  }
}

function sourceArm({ name, declared, from, to }) {
  const copy = join(PEN, `${name}.pristine.mjs`);
  copyFileSync(SUBJECT, copy);                 // uniquely-named, per-arm
  const p = patch(PRISTINE_TEXT, from, to);
  if (!p.ok) {
    console.log(`  ${name}  ARM DID NOT ARM: ${p.why}  <-- THIS IS A FINDING, not a pass`);
    results.push({ name, declared, actual: "DID NOT ARM", agree: false });
    restoreAndVerify(name);
    return;
  }
  writeFileSync(SUBJECT, p.text);
  const armedSha = sha(SUBJECT);
  const r = runSuite();
  const actual = r.code === 0 ? "PASS" : "FAIL";
  /* D-501 added `newline policy` and `glyph count`: A7's failure lands on the
     newline arm, which names neither the fixture page nor any earlier phrase. */
  const named = /73618|tier that produced|BYTE-IDENTICAL|fixture floor|perPageTier|tier 2 reports ZERO|newline policy|glyph count/.test(r.out);
  console.log(`  ${name}  declared ${declared.padEnd(8)} actual ${actual.padEnd(5)} `
            + `(armed sha ${armedSha.slice(0, 8)}, exit ${r.code})`);
  if (actual === "FAIL") {
    const first = (r.out.match(/ {2}FAIL .*/g) || []).slice(0, 2);
    for (const l of first) console.log(`      ${l.trim()}`);
    console.log(`      failed BY NAME: ${named ? "yes" : "NO — the arm broke something unnamed"}`);
  }
  results.push({ name, declared, actual, agree: actual === declared, named });
  restoreAndVerify(name);
}

/* ── BASELINE ─────────────────────────────────────────────────────────────── */
{
  const r = runSuite();
  const actual = r.code === 0 ? "PASS" : "FAIL";
  const tally = (r.out.match(/tier-pagewise: (\d+) pass, (\d+) fail/) || []);
  console.log(`  BASELINE  declared PASS     actual ${actual.padEnd(5)} `
            + `(${tally[1] ? `${tally[1]} assertions` : "NO TALLY — report as -1, never 0"}, exit ${r.code})`);
  results.push({ name: "BASELINE", declared: "PASS", actual, agree: actual === "PASS" });
  if (actual !== "PASS") { console.error("  BASELINE IS RED. Every arm below would be meaningless."); process.exit(4); }
}

/* ── A1 · invert the rule ─────────────────────────────────────────────────── */
sourceArm({
  name: "A1", declared: "FAIL",
  from: `  return (u2 < u1 && c2 > c1) ? "tier2" : "tier1";`,
  to:   `  return (u2 < u1 && c2 > c1) ? "tier1" : "tier2";   /* NC A1: INVERTED */`,
});

/* ── A2 · §5.2 exactly as written — the second condition dropped ──────────── */
sourceArm({
  name: "A2", declared: "FAIL",
  from: `  return (u2 < u1 && c2 > c1) ? "tier2" : "tier1";`,
  to:   `  return (u2 < u1) ? "tier2" : "tier1";   /* NC A2: the design as written */`,
});

/* ── A3 · merge correctly, record no tier ─────────────────────────────────── */
sourceArm({
  name: "A3", declared: "FAIL",
  from: `                   undetermined: Array.isArray(cand.undetermined) ? cand.undetermined : [],
                   tier: 2 });`,
  to:   `                   undetermined: Array.isArray(cand.undetermined) ? cand.undetermined : [] });   /* NC A3: no stamp */`,
});

/* ── A4 · replace every page unconditionally ──────────────────────────────── */
sourceArm({
  name: "A4", declared: "FAIL",
  from: `    const winner = perPageTierWinner(b, cand);`,
  to:   `    const winner = cand ? "tier2" : "tier1";   /* NC A4: wholesale, the D-283 defect restored */`,
});

/* ── A5 · truncate the fixture ────────────────────────────────────────────── */
{
  const hidden = ["legistar-73545.pdf", "legistar-73550.pdf", "legistar-73618.pdf"];
  const stash = join(PEN, "A5-fixtures");
  mkdirSync(stash, { recursive: true });
  for (const f of hidden) renameSync(join(FIX, f), join(stash, f));
  const r = runSuite();
  const actual = r.code === 0 ? "PASS" : "FAIL";
  /* THE NAME-CHECK WAS WIDENED, AND THE REASON IS A FINDING RATHER THAN A TIDY-UP.
     This arm first read `failed BY NAME: NO` — and the arm was right, the check was
     stale. The suite originally discovered its corpus with `readdirSync`, so hiding
     three PDFs shrank the corpus silently and only the `fixture floor` assertion
     noticed. The suite now carries an explicit MANIFEST instead (a walk makes the
     corpus "whatever is in the directory", which is the silent-shrink this whole
     estate floors against), so it fails EARLIER and more precisely: it names the
     missing file. That is a better failure, not a lost one — so the check follows
     the subject rather than the subject being bent back to the check. */
  const named = /fixture present:|fixture floor|every fixture page was checked/.test(r.out);
  console.log(`  A5  declared FAIL     actual ${actual.padEnd(5)} (3 of 4 PDFs hidden, exit ${r.code})`);
  console.log(`      failed BY NAME (the floor, not a downstream assertion): ${named ? "yes" : "NO"}`);
  results.push({ name: "A5", declared: "FAIL", actual, agree: actual === "FAIL", named });
  for (const f of hidden) renameSync(join(stash, f), join(FIX, f));
  let allBack = true;
  for (const f of hidden) if (!existsSync(join(FIX, f))) allBack = false;
  console.log(`      fixture restored: ${allBack ? "all 3 files back" : "MISSING FILES"}`);
  if (!allBack) process.exit(3);
}

/* ── A6 · OVER-STRICTNESS: an equivalent rule, spelled differently ────────── */
sourceArm({
  name: "A6", declared: "PASS",
  from: `  return (u2 < u1 && c2 > c1) ? "tier2" : "tier1";`,
  to:   `  /* NC A6: the same rule, spelled as guards rather than one conjunction. */
  if (!(u2 < u1)) return "tier1";
  if (!(c2 > c1)) return "tier1";
  return "tier2";`,
});

/* ── A7 · D-501: the award back on RAW `text.length` ─────────────────── */
sourceArm({
  name: "A7", declared: "FAIL",
  from: `  let n = 0;
  for (const ch of page.text) if (!WHITESPACE.test(ch)) n++;
  return n;`,
  to:   `  return page.text.length;   /* NC A7: the D-501 defect — whitespace counted as decoded */`,
});

/* ── the ledger ───────────────────────────────────────────────────────────── */
console.log(`\n  arm       declared  actual  agree`);
for (const r of results)
  console.log(`  ${r.name.padEnd(9)} ${r.declared.padEnd(9)} ${String(r.actual).padEnd(7)} ${r.agree ? "yes" : "NO  <-- FINDING"}`);

const disagreed = results.filter((r) => !r.agree);
const finalSha = sha(SUBJECT), finalBytes = readFileSync(SUBJECT).length;
console.log(`\n  subject after every arm: ${finalBytes} B · sha ${finalSha === PRISTINE_SHA ? "MATCHES pristine" : "DOES NOT MATCH — the tree is dirty"}`);
rmSync(PEN, { recursive: true, force: true });
console.log(`  pen removed: ${existsSync(PEN) ? "NO" : "yes"} (a control that leaves a pen behind is a finding of its own)`);

if (finalSha !== PRISTINE_SHA) process.exit(3);
console.log(`\nnc-cpdf20: ${results.length - disagreed.length} of ${results.length} arm(s) as declared`);
process.exit(disagreed.length ? 1 : 0);
