#!/usr/bin/env node
/* NEGATIVE CONTROL for M0-57 — the design-status authority arm in `tools/corpuscheck.mjs`.
 *
 *   node bio-plane/test/m057-authority.control.mjs        (from the repo root, or anywhere)
 *
 * SIX ARMS, EACH ARMED ALONE with every other defence open, anchors validated BEFORE anything is
 * armed, restored by cp-back from uniquely-named pristine copies verified by sha256 AND a floored
 * byte count. Never `git checkout -- <file>`: in a tree with uncommitted work that is not "put it
 * back", it is "throw mine away", and it exits 0 either way (CLAUDE.md, measured twice).
 *
 * THE METHOD IS RECORDED BESIDE THE RESULT, because the obvious method gives the confident wrong
 * answer against this toolchain. The last controls here were defeated by the METHOD perturbing a
 * second variable: a rename and a `chmod 000` each dirty the tree, so `plancheck` failed on
 * UNPUBLISHED and exited 1 — a NAMED failure that feels like evidence while the subject was never
 * exercised. Every arm below drives `corpuscheck` DIRECTLY, which has no publication check at all
 * and so cannot fail for a reason the arm did not cause; the single plancheck arm runs `--local`,
 * which skips the publication half.
 *
 * ARM 1 is the RECEIPT REPRODUCED ON DISK: revert §18 item 6 to the words it carried before
 * 2026-09-17 and corpuscheck must go RED naming construct 8 and BOTH documents.
 * ARM 2 is the control the row asks for: same reverted corpus, ARM REMOVED — the claim-class pair
 * passes corpuscheck again, and the suite fails. That pair of measurements is what establishes the
 * arm is what catches it, rather than something else in the run.
 * ARMS 3-5 are OVER-STRICTNESS, armed from the strict side: each removes one of the four signals
 * and the corpus goes red or a healthy-state arm fails. An arm that fires on a healthy state is
 * worse than no arm.
 * ARM 6 is the baseline: nothing armed, output byte-identical, `plancheck --local` clean.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TOOL = join(ROOT, "tools/corpuscheck.mjs");
const FRAMEWORK = join(ROOT, "docs/architecture/BIO_Content_Framework_v0_10.md");
const FLOOR = { [TOOL]: 20000, [FRAMEWORK]: 100000 };

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const pristine = new Map();
let declared = 0, armed = 0, pass = 0, fail = 0;

const t = (label, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok || !detail ? "" : `\n          ${detail}`}`);
  ok ? pass++ : fail++;
};

function stash(p) {
  const copy = `${p}.m057-pristine-${process.pid}`;
  copyFileSync(p, copy);
  pristine.set(p, { copy, sha: sha(p), bytes: statSync(p).size });
  if (statSync(p).size < FLOOR[p]) throw new Error(`${p} is below its floor before we start — refusing to run`);
}
function restore(p) {
  const { copy, sha: want, bytes } = pristine.get(p);
  copyFileSync(copy, p);
  const ok = sha(p) === want && statSync(p).size === bytes;
  console.log(`          restored ${p.replace(ROOT + "/", "")} byte-identically: ${ok ? "YES" : "NO"} (${bytes} B)`);
  if (!ok) throw new Error(`RESTORE FAILED for ${p} — stop and fix the tree by hand`);
}
function cleanup() { for (const { copy } of pristine.values()) if (existsSync(copy)) unlinkSync(copy); }

/* An arm is a set of literal substitutions, EACH validated to occur exactly once before any is
   applied — an arm that did not arm produces a confident wrong answer. */
function patch(p, subs) {
  let text = readFileSync(p, "utf8");
  for (const [from] of subs) {
    const n = text.split(from).length - 1;
    if (n !== 1) throw new Error(`ANCHOR MISS in ${p}: ${JSON.stringify(from.slice(0, 60))} occurs ${n} times, want 1`);
  }
  for (const [from, to] of subs) text = text.replace(from, to);
  writeFileSync(p, text);
  armed++;
}

const run = (args) => {
  try {
    return { out: execFileSync("node", [TOOL, ...args], { cwd: ROOT, encoding: "utf8" }), code: 0 };
  } catch (e) { return { out: `${e.stdout || ""}${e.stderr || ""}`, code: e.status ?? 1 }; }
};
const suite = () => {
  try {
    execFileSync("node", ["test/corpuscheck.test.mjs"], { cwd: join(ROOT, "bio-plane"), encoding: "utf8" });
    return 0;
  } catch (e) { return e.status ?? 1; }
};

/* The revert: strip the pointer this item added, leaving item 6 the words that misled BOB #12. */
const REVERT = [[/\*\*DESIGNED 2026-08-03[\s\S]*?Bob's direction of 2026-09-14/, "Bob's direction of 2026-09-14"]];
function revertFramework() {
  const text = readFileSync(FRAMEWORK, "utf8");
  const out = text.replace(REVERT[0][0], REVERT[0][1]);
  if (out === text) throw new Error("ANCHOR MISS: §18 item 6's pointer is not where this control expects it");
  writeFileSync(FRAMEWORK, out);
  armed++;
}

/* ---------------------------------------------------------------------------- the arms */
const ARMS = [
  ["1 · THE RECEIPT REPRODUCED — §18 item 6 reverted, arm intact → corpuscheck RED naming construct 8 and BOTH documents", () => {
    revertFramework();
    const r = run([]);
    t("arm 1 · corpuscheck exits non-zero", r.code === 1, `code ${r.code}`);
    t("arm 1 · and names construct 8", /DESIGN STATUS RESTATED — construct 8\b/.test(r.out));
    t("arm 1 · and names the document that RESTATES", r.out.includes("BIO_Content_Framework_v0_10.md §18 item 6"));
    t("arm 1 · and names the document that DESIGNED it", r.out.includes("BIO_Case_Making_v0_1.md"));
  }],
  ["2 · THE ARM REMOVED — same reverted corpus → the claim-class pair PASSES again, and the suite FAILS", () => {
    revertFramework();
    patch(TOOL, [["return { rows: rows.length, pairs, unresolved, fails };",
      "return { rows: rows.length, pairs, unresolved, fails: [] };"]]);
    const r = run([]);
    t("arm 2 · with the arm removed the receipt passes corpuscheck again", r.code === 0, `code ${r.code}`);
    t("arm 2 · and nothing in the output mentions the restatement", /DESIGN STATUS RESTATED/.test(r.out) === false);
    t("arm 2 · THE CONTROL FAILS — the suite goes red with the arm gone", suite() !== 0);
  }],
  ["3 · SIGNAL 3 REMOVED (an item that points at its design is no longer exempt) → the CORRECTED corpus goes red", () => {
    patch(TOOL, [["      if (POINTS_AT_A_DESIGN(item.raw)) { verdict(\"points-at-its-design\"); continue; }",
      "      if (false) { verdict(\"points-at-its-design\"); continue; }"]]);
    const r = run([]);
    t("arm 3 · the healthy, corrected corpus is now REFUSED — the exemption is load-bearing", r.code === 1, `code ${r.code}`);
    t("arm 3 · and the suite's over-strictness arm is the one that notices", suite() !== 0);
  }],
  ["4 · SIGNAL 4a REMOVED (a home document need no longer DECLARE the construct) → over-strictness", () => {
    patch(TOOL, [["if (fm.error || !new RegExp(`construct\\\\s+${row.n}\\\\b`, \"i\").test(fm.place)) continue;",
      "if (fm.error) continue;"]]);
    t("arm 4 · the suite's 'does not declare this construct' arm fails — cover is DECLARED, not assumed", suite() !== 0);
  }],
  ["5 · SIGNAL 4b WIDENED (a BODY mention counts as cover, not a heading) → over-strictness", () => {
    patch(TOOL, [["        const heading = bodyHeadings(text.split(\"\\n\"), fm.blockEnd, 6)\n          .find((h) => words.every((w) => new RegExp(`\\\\b${w}\\\\b`, \"i\").test(h.text)));",
      "        const heading = words.every((w) => new RegExp(`\\\\b${w}\\\\b`, \"i\").test(text)) ? { text: \"<body>\" } : null;"]]);
    t("arm 5 · the suite's 'no heading naming the piece' arm fails — a prose mention is not cover", suite() !== 0);
  }],
  ["6 · OVER-STRICTNESS BASELINE — nothing armed", () => {
    const r = run([]);
    t("arm 6 · corpuscheck is GREEN over the honest tree", r.code === 0, `code ${r.code}`);
    t("arm 6 · and it SAYS what it evaluated rather than only that nothing failed",
      /1 cited pair\(s\) evaluated, 0 unresolved/.test(r.out));
    t("arm 6 · output is byte-identical to the run this control opened with", sha(TOOL) === pristine.get(TOOL).sha);
    let code = 0;
    try { execFileSync("node", [join(ROOT, "tools/plancheck.mjs"), "--local"], { cwd: ROOT, encoding: "utf8" }); }
    catch (e) { code = e.status ?? 1; }
    t("arm 6 · plancheck --local is clean (--local isolates the variable; the publication half is skipped)", code === 0, `code ${code}`);
  }],
];

console.log(`M0-57 NEGATIVE CONTROL — ${ARMS.length} arms declared, each armed ALONE.\n`);
declared = ARMS.length;
stash(TOOL); stash(FRAMEWORK);
try {
  for (const [name, body] of ARMS) {
    console.log(`\n--- ARM ${name} ---`);
    const before = armed;
    try { body(); } finally {
      restore(TOOL); restore(FRAMEWORK);
    }
    if (name.startsWith("6") ? armed !== before : armed === before) {
      t(`ARM ${name.slice(0, 1)} ACTUALLY ARMED`, false, "the arm changed nothing — its result is about the wrong thing");
    }
  }
} finally { cleanup(); }

console.log(`\n${declared} arms declared, ${armed} armings applied, ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
