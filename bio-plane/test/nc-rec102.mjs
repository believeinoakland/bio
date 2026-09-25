#!/usr/bin/env node
/* REC-102 / D-372 — THE NEGATIVE CONTROL for the TIER-3 LAYER PARTITION.
 *
 * NOT a suite (`battery.mjs` and `coverage.mjs` do not discover `nc-*.mjs`): it
 * EDITS files on disk, one arm at a time, and restores each. Run it directly:
 *
 *     node bio-plane/test/nc-rec102.mjs
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DECLARED BEFORE ARMING — what MUST fail, what MUST NOT, and why each exists
 * ─────────────────────────────────────────────────────────────────────────────
 *   BASELINE  the suite, untouched.                                 MUST PASS
 *             Without this row, four-arms-broken and four-arms-working produce
 *             the identical report. A harness in this estate once read `null`
 *             for every arm INCLUDING the baseline, and only the baseline row
 *             told anyone which it was.
 *
 *   A1  THE FIX REVERTED — the partition emptied, so every layer page falls to
 *       the single `baseTier` part, which is the pre-item code EXACTLY.
 *                                                                   MUST FAIL
 *       **THE ARM THAT PROVES THE GAP WAS REAL.** It must fail on the D-372
 *       assertions BY NAME, and it must NOT fail on either over-strictness
 *       section — a revert that also broke the single-merge documents would be
 *       measuring something other than this item.
 *
 *   A2  THE CARRY DROPPED — `tier2PerPage = m.perPageTier` removed at the
 *       TIER-2 site, leaving the tier-3 site with nothing to partition by.
 *                                                                   MUST FAIL
 *       The same collapse through a DIFFERENT DOOR, and it is a separate arm
 *       deliberately: the partition and the carry are two halves and a landing
 *       that shipped only one would pass A1's arm completely. A1 proves the
 *       composition is load-bearing; A2 proves the carry is, and that it is not
 *       a variable the fix merely happens to read.
 *
 *   A3  OVER-STRICTNESS — the SAME partition, spelled the other way round:
 *       walking the layer pages and asking which list each is in, rather than
 *       filtering each list by the layer pages.                      MUST PASS
 *       Correct work in a spelling nobody anticipated must pass, or the suite is
 *       pinning an implementation rather than a behaviour.
 *
 *   A4  THE FIXTURE'S MARGIN BROKEN — `GOOD_LINE` lengthened past the marker
 *       count in the SUITE, so `needsTier2` stops escalating and the subject
 *       document no longer reaches merge one at all.                 MUST FAIL
 *       **THIS IS THE ARM THAT CATCHES GREEN-OVER-NOTHING**, and it is the one
 *       this estate has paid for three times: a headline totality assertion that
 *       passed over an empty corpus. Every claim this suite makes about the
 *       chain is worthless if its document never reached both merges, so the
 *       suite must FAIL — naming the premise — rather than pass quietly. It must
 *       fail on the PREMISE assertions (section 0 and section 4), which is a
 *       different set from A1's and A2's.
 *
 *   A5  D-514: THE LAYER FILTER BACK ON RAW `text.length` — the defect exactly
 *       as D-514 found it, so a page of whitespace "carries text" again and
 *       re-enters the `layer` part of the chain.                    MUST FAIL
 *       **THE ROW'S OWN DECLARED CONTROL.** It must fail in D-514's ATTRIBUTION
 *       set BY NAME and stray into no other set — not REC-102's, and not D-514's
 *       own routing set, because this arm changes nothing either of those reads.
 *
 *   A6  OVER-STRICTNESS for D-514 — the same predicate written as a `\S` test
 *       rather than a glyph count.                                  MUST PASS
 *       What an author who had never seen `glyphCount` would reach for. An arm
 *       that fails here means the suite pins a spelling, not a behaviour.
 *
 *   A7  D-514: THE ROUTING BACK ON RAW `counts.chars` — `needsTier2` comparing
 *       markers against the raw character count again.              MUST FAIL
 *       Armed SEPARATELY from A5 for the reason A1 and A2 are separate: D-514
 *       has two halves and a landing that shipped one would pass the other's arm
 *       completely. It must fail in the ROUTING set only.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A1 AND A3 DID NOT ARM BETWEEN REC-102's LANDING AND 2026-09-24 — FOUND AND
 * REPAIRED BY D-514, AND RECORDED HERE RATHER THAN QUIETLY FIXED.
 * ─────────────────────────────────────────────────────────────────────────────
 * Both anchors were written with TWENTY-SIX spaces of indentation, matching the
 * read-time re-extraction copy of the partition that CPDF-19 had added at
 * `op=pdfstructure&ocr=1`. `src/index.mjs` carries the block at FOURTEEN, and
 * carries exactly one copy of it. `patch()` matches literally, so both anchors
 * matched ZERO times and both arms reported `ARM DID NOT ARM` — which this
 * driver does print as a finding rather than as a pass, and which is the only
 * reason it was recoverable. What it means for the record: **A1, the arm that
 * proves D-372's gap was real, and A3, its over-strictness counterpart, have
 * not been evidence since the two copies were collapsed into one.** A2 and A4
 * were unaffected (their anchors sit at their own depths and matched once).
 * The repair is the anchors dedented by twelve; the arms, their declarations and
 * their named sets are unchanged. **The general shape, which is why this note is
 * long: an anchor is a claim about the subject's TEXT, so it goes stale exactly
 * when the subject is refactored — the moment an arm is most worth having.**
 *
 * A SURPRISING GREEN IS A FINDING ABOUT THE ARM. Recorded, never smoothed.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";
import { ANCHOR_DRY, anchorRows, anchorTable } from "../scripts/anchortable.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SUITE = join(HERE, "tier3-layer-parts.test.mjs");
const PEN = controlPen("rec102");

/* TWO SUBJECTS, because two different things can make this suite lie. The WIRE
   is `index.mjs`'s and A1-A3 aim there. A4 aims at the SUITE ITSELF, because the
   failure it controls for — a fixture that quietly stops being the class it
   claims to be — lives in the fixture and nowhere else. This file EDITS AND
   RESTORES both; it lands nothing in either, and every restore is verified by
   sha256 AND by `cmp` against a uniquely-named per-arm pristine copy, with the
   byte count printed and floored. */
const SUBJECTS = {
  wire:  { path: join(HERE, "..", "src", "index.mjs"), floor: 200_000, label: "src/index.mjs" },
  suite: { path: SUITE,                               floor:  10_000, label: "test/tier3-layer-parts.test.mjs" },
};

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

function runSuite() {
  try {
    const out = execFileSync(process.execPath, [SUITE],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 256 * 1024 * 1024 });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status === undefined ? -1 : e.status, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

/** Patch the subject, and REFUSE if the anchor did not match exactly once — an
 *  arm that did not arm is a finding, and arms that matched zero times (or
 *  twice) have been reported as clean in this estate before. */
function patch(pristineText, from, to) {
  const n = pristineText.split(from).length - 1;
  if (n !== 1) return { ok: false, why: `anchor matched ${n} time(s), not exactly 1` };
  return { ok: true, text: pristineText.replace(from, to) };
}

mkdirSync(PEN, { recursive: true });
for (const s of Object.values(SUBJECTS)) {
  s.text = readFileSync(s.path, "utf8");
  s.sha = sha(s.path);
  s.bytes = readFileSync(s.path).length;
  if (s.bytes < s.floor) {
    console.error(`REFUSED: ${s.label} is ${s.bytes} B, below its ${s.floor} B floor — `
                + `restoring a truncated file byte-identically proves nothing.`);
    process.exit(2);
  }
  console.log(`subject: ${s.label} · ${s.bytes} B · ${s.sha.slice(0, 16)}`);
}
console.log(`suite:   test/tier3-layer-parts.test.mjs\n`);

const results = [];

function restoreAndVerify(armName, s) {
  const copy = join(PEN, `${armName}.pristine.mjs`);
  writeFileSync(s.path, s.text);
  const back = sha(s.path), bytes = readFileSync(s.path).length;
  let cmpOk = false;
  try { execFileSync("cmp", ["-s", s.path, copy]); cmpOk = true; } catch { cmpOk = false; }
  const okSha = back === s.sha;
  console.log(`      restored ${s.label}: ${bytes} B · sha ${okSha ? "MATCH" : "MISMATCH"} · cmp ${cmpOk ? "identical" : "DIFFERS"}`);
  if (!okSha || !cmpOk || bytes < s.floor) {
    console.error(`      RESTORE FAILED after ${armName}. Stopping rather than measuring a wrong tree.`);
    process.exit(3);
  }
}

/* THE D-372 assertions and the PREMISE assertions are two NAMED SETS, not one
   regex, because "it failed" and "it failed at the thing the arm aimed at" are
   different findings and A1 and A4 must be told apart. Read off the suite's own
   assertion labels. */
const D372  = /PARTITIONED by tier|recorded as TIER 1|NOT ALSO claimed by the tier-2 step|covered exactly once/;
const PREMISE = /TIER-2 member was consulted|TIER-3 member was consulted, and ONLY|clear it with margin|ordered three pages/;
const OVERSTRICT = /byte-for-byte the shape|REC-98's scoped two-part chain|did NOT escalate to tier 2|NEVER consulted/;
/* D-514's TWO NAMED SETS, 2026-09-24, kept apart from each other and from every
   set above for the same reason those three are kept apart: "it failed" and "it
   failed at the thing the arm aimed at" are different findings, and the
   ATTRIBUTION half is a different claim from the ROUTING half. A5 must land in
   the first and A7 in the second, and neither may stray into the other. */
const D514_LAYER = /in NO layer part|names page 0|four spaces are not text/;
const D514_ROUTE = /CONSULTED the tier-2 member for it/;

function arm({ name, declared, subject = "wire", edits, mustName, mustNotName }) {
  if (ANCHOR_DRY) return void anchorRows(edits.map(([from, to]) => ({ arm: name, file: SUBJECTS[subject].path, find: from, put: to })));   /* M0-197: read, never armed */
  const s = SUBJECTS[subject];
  const copy = join(PEN, `${name}.pristine.mjs`);
  copyFileSync(s.path, copy);                  // uniquely-named, per-arm
  let text = s.text, why = null;
  for (const [from, to] of edits) {
    const p = patch(text, from, to);
    if (!p.ok) { why = p.why; break; }
    text = p.text;
  }
  if (why) {
    console.log(`  ${name}  ARM DID NOT ARM: ${why}  <-- THIS IS A FINDING, not a pass`);
    results.push({ name, declared, actual: "DID NOT ARM", agree: false });
    restoreAndVerify(name, s);
    return;
  }
  writeFileSync(s.path, text);
  const armedSha = sha(s.path);
  const r = runSuite();
  const actual = r.code === 0 ? "PASS" : "FAIL";
  const tally = r.out.match(/tier3-layer-parts: (-?\d+) pass, (-?\d+) fail/);
  const fails = (r.out.match(/ {2}FAIL .*/g) || []).join("\n");
  const named = mustName ? mustName.test(fails) : null;
  const strayed = mustNotName ? mustNotName.test(fails) : false;
  console.log(`  ${name}  declared ${declared.padEnd(8)} actual ${actual.padEnd(5)} `
            + `(${tally ? `${tally[1]}/${tally[2]}` : "NO TALLY — report as -1, never 0"}, `
            + `${s.label}, armed sha ${armedSha.slice(0, 8)}, exit ${r.code})`);
  if (actual === "FAIL") {
    for (const l of (r.out.match(/ {2}FAIL .*/g) || []).slice(0, 4)) console.log(`      ${l.trim()}`);
    if (mustName)    console.log(`      failed BY NAME at its own target: ${named ? "yes" : "NO — the arm broke something unnamed"}`);
    if (mustNotName) console.log(`      strayed into the set it must NOT touch: ${strayed ? "YES — a finding about the arm" : "no"}`);
  }
  results.push({ name, declared, actual, agree: actual === declared && (named !== false) && !strayed, named, strayed });
  restoreAndVerify(name, s);
}

/* ── BASELINE ─────────────────────────────────────────────────────────────── */
if (!ANCHOR_DRY) {   /* M0-197: no suite runs under the dry read */
  const r = runSuite();
  const actual = r.code === 0 ? "PASS" : "FAIL";
  const tally = r.out.match(/tier3-layer-parts: (-?\d+) pass, (-?\d+) fail/);
  console.log(`  BASELINE  declared PASS     actual ${actual.padEnd(5)} `
            + `(${tally ? `${tally[1]} assertions` : "NO TALLY — report as -1, never 0"}, exit ${r.code})`);
  results.push({ name: "BASELINE", declared: "PASS", actual, agree: actual === "PASS" });
  if (actual !== "PASS") {
    for (const l of (r.out.match(/ {2}FAIL .*/g) || []).slice(0, 6)) console.log(`      ${l.trim()}`);
    console.error("  BASELINE IS RED. Every arm below would be meaningless.");
    process.exit(4);
  }
}

/* ── A1 · THE FIX REVERTED — one part at one document-level tier ──────────── */
arm({
  name: "A1", declared: "FAIL", mustName: D372, mustNotName: OVERSTRICT,
  edits: [[
`              const spokenFor = tier2PerPage
                ? [[1, (tier2PerPage.tier1 || []).filter((p) => layerSet.has(p))],
                   [2, (tier2PerPage.tier2 || []).filter((p) => layerSet.has(p))]]
                : [];`,
`              /* NC A1: THE FIX REVERTED. With no partition every layer page is
                 unspoken and falls to the single baseTier part below — which is
                 the pre-item code exactly, in the same position. */
              const spokenFor = [];`,
  ]],
});

/* ── A2 · THE CARRY DROPPED at the tier-2 site ────────────────────────────── */
arm({
  name: "A2", declared: "FAIL", mustName: D372, mustNotName: OVERSTRICT,
  edits: [[
`                          tier2PerPage = m.perPageTier;`,
`                          /* NC A2: THE CARRY DROPPED. The merge still computes the
                             partition; nothing carries it to the tier-3 site. */
                          void m.perPageTier;`,
  ]],
});

/* ── A3 · OVER-STRICTNESS: the same partition, spelled the other way round ── */
arm({
  name: "A3", declared: "PASS",
  edits: [[
`              const spokenFor = tier2PerPage
                ? [[1, (tier2PerPage.tier1 || []).filter((p) => layerSet.has(p))],
                   [2, (tier2PerPage.tier2 || []).filter((p) => layerSet.has(p))]]
                : [];`,
`              /* NC A3: THE SAME PARTITION, SPELLED THE OTHER WAY ROUND. */
              const ncTierOf = (p) =>
                (tier2PerPage && (tier2PerPage.tier1 || []).includes(p)) ? 1
              : (tier2PerPage && (tier2PerPage.tier2 || []).includes(p)) ? 2 : null;
              const spokenFor = [1, 2].map((tr) =>
                [tr, layerPages.filter((p) => layerSet.has(p) && ncTierOf(p) === tr)]);`,
  ]],
});

/* ── A4 · THE FIXTURE'S MARGIN BROKEN — the document stops reaching merge 1 ─ */
arm({
  name: "A4", declared: "FAIL", subject: "suite", mustName: PREMISE,
  edits: [[
`const GOOD_LINE = "Item 3.1";`,
`const GOOD_LINE = "Item 3.1 " + "Determination Of Schedule Of Outstanding Committee Items ".repeat(6);`,
  ]],
});

/* ── A5 · D-514: THE LAYER FILTER BACK ON RAW `text.length` ──────────────── */
/* THE ROW'S OWN DECLARED CONTROL. Restore the defect exactly as D-514 found it:
   a page "carries text" when its string is non-empty, whitespace included. The
   whitespace page then re-enters the `layer` part and the record names a tier-1
   derivation for a page that decoded no glyph. MUST FAIL, and must fail in
   D-514's ATTRIBUTION set — not in the routing set, and not in any set that
   belonged to REC-102, because this arm changes nothing those assertions read. */
arm({
  name: "A5", declared: "FAIL", mustName: D514_LAYER,
  mustNotName: new RegExp(`${D372.source}|${OVERSTRICT.source}|${D514_ROUTE.source}`),
  edits: [[
`                            && typeof p.text === "string" && glyphCount(p.text) > 0)`,
`                            && typeof p.text === "string" && p.text.length)   /* NC A5: the D-514 defect */`,
  ]],
});

/* ── A6 · OVER-STRICTNESS: the same rule, a spelling nobody anticipated ───── */
/* Correct work must PASS however it is written. `\S` tests for a non-whitespace
   character rather than counting them, which is a different expression of the
   same predicate and is what an author who had never seen `glyphCount` would
   reach for. An arm that FAILS here means the suite is pinned to how the rule is
   spelled rather than to what it does. */
arm({
  name: "A6", declared: "PASS",
  edits: [[
`                            && typeof p.text === "string" && glyphCount(p.text) > 0)`,
`                            && typeof p.text === "string" && /\\S/u.test(p.text))   /* NC A6: the same rule, spelled differently */`,
  ]],
});

/* ── A7 · D-514: THE ROUTING BACK ON RAW `counts.chars` ──────────────────── */
/* The other half of D-514, armed SEPARATELY from A5 because a landing that
   shipped one half would pass the other's arm completely — the same reasoning
   that keeps A1 and A2 apart. The routing witness sits one character inside the
   band where the two rules disagree, so restoring the raw comparison stops the
   plane consulting the member for it. MUST FAIL, in the ROUTING set only. */
arm({
  name: "A7", declared: "FAIL", mustName: D514_ROUTE,
  mustNotName: new RegExp(`${D372.source}|${OVERSTRICT.source}|${D514_LAYER.source}`),
  edits: [[
`  const glyphs = typeof text.document === "string" ? glyphCount(text.document) : c.chars;
  if (!(c.undetermined > glyphs)) return false;`,
`  if (!(c.undetermined > c.chars)) return false;   /* NC A7: the D-514 defect — whitespace routed as decoded text */`,
  ]],
});

anchorTable();   /* M0-197: prints the arms read above and exits, under the dry read only */

/* ── THE REPORT ───────────────────────────────────────────────────────────── */
console.log("\n  arm       declared  actual");
for (const r of results)
  console.log(`  ${r.name.padEnd(9)} ${String(r.declared).padEnd(9)} ${String(r.actual).padEnd(6)}`
            + `${r.agree ? "" : "   <-- DISAGREES WITH ITS DECLARATION"}`);
const bad = results.filter((r) => !r.agree);
console.log(`\nnc-rec102: ${results.length - bad.length}/${results.length} arms agreed with their declaration`);
process.exit(bad.length ? 1 : 0);
