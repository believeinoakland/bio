#!/usr/bin/env node
/* D-404's NEGATIVE CONTROL DRIVER — seven arms (A3 withdrawn) plus an opening and closing baseline — over
 * `tools/rowsubstrate.mjs` and the suite that drives it.
 *
 *   node bio-plane/test/rowsubstrate.control.mjs        (from the repo root)
 *
 * **A5 IS THE ARM THIS DRIVER EXISTS FOR, AND IT IS A KIND THIS ESTATE HAS NEVER ARMED BEFORE.**
 * Every other control here proves SENSITIVITY — that an arm CAN fail when its subject breaks.
 * A5 proves PRECISION — that the arm does NOT fire when the subject is FINE. The withdrawn
 * anchor signal is why: it would have passed a sensitivity control effortlessly (plant a row
 * citing a missing section and it fires), while every one of its findings on the HEALTHY corpus
 * was false. **Nothing in this repository obliged anyone to measure that**, so a tool could be
 * green, controlled, and worthless at the same time.
 *
 * No arm touches the estate's queue or corpus: the suite injects its own queue, governed set and
 * document reader. The one thing an arm perturbs is a source file, restored and verified.
 */
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ANCHOR_DRY, anchorTable } from "../scripts/anchortable.mjs";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PEN = join(REPO, ".d404-harness");
const PRED = join(REPO, "tools/rowsubstrate.mjs");
const SUITE = join(REPO, "bio-plane/test/rowsubstrate.test.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* M0-197: under tools/anchordrift.mjs's dry read no pen is made and no suite runs; the arms below are READ. */
if (!ANCHOR_DRY) mkdirSync(PEN, { recursive: true });
const copy = join(PEN, "pristine.rowsubstrate");
if (!ANCHOR_DRY) writeFileSync(copy, readFileSync(PRED));
const PRISTINE = { sha: sha(PRED), bytes: statSync(PRED).size };
const MIN_BYTES = 5000;
console.log(`  pristine predicate: ${PRISTINE.bytes} bytes, sha256 ${PRISTINE.sha.slice(0, 8)}…`);

function restore() {
  writeFileSync(PRED, readFileSync(copy));
  const got = sha(PRED), size = statSync(PRED).size;
  const cmp = spawnSync("cmp", ["-s", PRED, copy]).status === 0;
  const ok = got === PRISTINE.sha && cmp && size === PRISTINE.bytes && size >= MIN_BYTES;
  console.log(`  restored tools/rowsubstrate.mjs: ${size} bytes, sha256 ${got.slice(0, 8)}…, `
    + `cmp ${cmp ? "identical" : "DIFFERS"} — byte-identical: ${ok ? "YES" : "NO"}`);
  return ok;
}
function armPatch(from, to) {
  const before = readFileSync(PRED, "utf8");
  const hits = before.split(from).length - 1;
  if (hits === 1) writeFileSync(PRED, before.replace(from, to));
  return hits;
}
const suiteRun = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: REPO, encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tally = out.match(/rowsubstrate: (\d+) pass, (\d+) fail/);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]);
  return { out, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1,
           reachedFoot: !!tally, status: r.status, failed };
};
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
/* Downstream of nothing — an arm that takes this down moved a second variable. */
/* The sentinel must be downstream of NO arm. `the unjudged count is REPORTED` was the first
   choice and A6 legitimately moves it — removing the symbol gate changes that count by design —
   so it reported collateral damage on a correct arm. The closed-row skip is touched by nothing. */
const collateral = (s) => broke(s, "a CLOSED row is not judged at all");

console.log("\n--- ARM BASELINE · nothing armed ---");
if (!ANCHOR_DRY) {
  const s = suiteRun();
  t("baseline · the suite reached its own FOOT", s.reachedFoot, true);
  t("baseline · the suite is GREEN", [s.pass > 20, s.fail, s.status], [true, 0, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
}

const ARMS = [
  { id: "A1", title: "`symbolsOf` widened back to ANY backticked identifier — the first version, "
                   + "which returned a row's verification TOOL as a construct it builds",
    from: 'export const SYMBOL_RE = /`(op=[A-Za-z0-9_.]+|[A-Z][A-Z0-9_]{3,})`/g;',
    to:   'export const SYMBOL_RE = /`([A-Za-z_][A-Za-z0-9_]*)`/g;',
    mustBreak: "a tool a row was VERIFIED WITH is NOT a symbol" },

  { id: "A2", title: "the anchor→document binding reverted to a CROSS PRODUCT (mechanism 1)",
    from: "    if (m[2]) { current = m[2]; if (!out.has(current)) out.set(current, new Set()); }\n    else if (m[3] && current) out.get(current).add(m[3]);",
    to:   "    if (m[2]) { current = m[2]; if (!out.has(current)) out.set(current, new Set()); }\n    else if (m[3]) for (const k of out.keys()) out.get(k).add(m[3]);",
    mustBreak: "so no document inherits a number it was never given" },

  /* A3 WITHDRAWN BEFORE IT SHIPPED, AND THE REASON IS A FINDING ABOUT THE SUBJECT. It was to
     arm mechanism 2 — named anchors yielding a number. No patch can make it fail, because the
     quoted alternative in the token regex is INERT once anchors bind by ADJACENCY: a named
     anchor carries no digits, so whether the regex consumes it or skips it, no number binds to
     its document either way. Mechanism 2 is SUBSUMED by mechanism 1's fix. Section 2 of the
     suite is kept as regression documentation of the intent, but it is NOT controlled and this
     comment says so rather than letting a passing arm imply that it is — an arm that cannot
     fail is the defect this driver family exists to catch, and catching one in advance is
     cheaper than catching it after it has been trusted. */
  { id: "A4", title: "`sectionText` returns \"\" instead of null for an ABSENT anchor — absent and "
                   + "empty stop being distinguishable (mechanism 3's root)",
    from: "  if (start < 0) return null;",
    to:   '  if (start < 0) return "";',
    mustBreak: "an ABSENT anchor returns null" },

  { id: "A5", title: "THE PRECISION ARM — the `covered` test INVERTED, so a healthy row whose "
                   + "cited section DOES mention its symbol is reported as a finding",
    from: "        if (hits.length) covered = true;",
    to:   "        if (!hits.length) covered = true;",
    /* Inverting `covered` SWAPS which row is reported and leaves the COUNT at one, so the
       discrimination arm is NOT downstream of this and must not be expected to fail. Measured,
       not assumed: the first version expected it and was wrong. */
    mustBreak: "the covered row is NOT reported" },

  { id: "A6", title: "rows with no symbols scored as COVERED rather than UNJUDGED — an unaskable "
                   + "question scored clean, the unearned-absence class",
    from: "    if (!cited.length || !syms.length) {",
    to:   "    if (!cited.length) {",
    mustBreak: "a row with no machine-readable symbol is UNJUDGED" },

  { id: "A7", title: "D-541 — the token capture restored to DIGITS AND DOTS ONLY, so `§6A` reads as "
                   + "`§6`, the section before the one cited",
    from: '|§\\s*(?:"[^"]*"|(\\d+(?:[A-Za-z](?![A-Za-z0-9]))?(?:\\.\\d+(?:[A-Za-z](?![A-Za-z0-9]))?)*))/g;',
    to:   '|§\\s*(?:"[^"]*"|(\\d+(?:\\.\\d+)*))/g;',
    mustBreak: "`§6A` reads as §6A, never as the §6 before it" },
];
anchorTable(ARMS.map((a) => ({ arm: a.id, file: PRED, find: a.from, put: a.to })));   /* M0-197: a no-op outside the dry read */

for (const a of ARMS) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  const hits = armPatch(a.from, a.to);
  t(`${a.id} · the arm ARMED (patch matched exactly once)`, hits, 1);
  const s = suiteRun();
  t(`${a.id} · the suite FAILS at "${a.mustBreak.slice(0, 46)}…"`, broke(s, a.mustBreak), true);
  if (a.alsoBreak) t(`${a.id} · ...and the discrimination arm fails with it`, broke(s, a.alsoBreak), true);
  t(`${a.id} · ...and the suite survived to report it`, s.reachedFoot, true);
  t(`${a.id} · ...and the failure is not collateral`, collateral(s), false);
  t(`${a.id} · RESTORED byte-identically`, restore(), true);
}

console.log("\n--- ARM BASELINE (closing) · every arm restored ---");
{
  const s = suiteRun();
  t("closing · the suite is GREEN again, so no arm leaked", [s.fail, s.status], [0, 0]);
  console.log(`  closing suite: ${s.pass} pass, ${s.fail} fail`);
}

console.log(`\nrowsubstrate.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
