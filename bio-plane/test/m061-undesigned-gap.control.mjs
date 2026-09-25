#!/usr/bin/env node
/* NEGATIVE CONTROL for M0-61 — what `UNDESIGNED`'s gap may span (`tools/corpuscheck.mjs`) and the
 * REMOTE-trip classifier that replaced the cross-line flag (`tools/statussweep.mjs`).
 *
 *   node bio-plane/test/m061-undesigned-gap.control.mjs        (from anywhere)
 *
 * FOUR ARMS, EACH ARMED ALONE, anchors validated BEFORE arming (an anchor that does not match is
 * reported NOT ARMED rather than read as a pass), restored by cp-back from a uniquely-named
 * pristine copy verified by sha256 AND a floored byte count — never `git checkout -- <file>`,
 * which in a tree with uncommitted work is "throw mine away" and exits 0 either way. Every arm
 * drives the two suites DIRECTLY; neither has a publication check, so neither can fail for a
 * reason the arm did not cause. Exit 0 only when every arm came out as declared.
 *
 *   A  the gap reverted to `\s+` (the fix undone)       -> both suites FAIL on the paragraph-break arm
 *   B  the classifier reverted to `/\n/.test(mm[0])`   -> statussweep FAILS naming RECONCILED.md and
 *      (M0-58's cross-line CORRELATE)                     its 10 items once the receipt is re-wrapped
 *                                                         onto one line, and the genuine soft-wrapped
 *                                                         list is mislabelled false
 *   C  THE LIAR — the gap narrowed to a literal space   -> corpuscheck FAILS on the corpus's own
 *                                                         genuine soft-wrapped claims; statussweep
 *                                                         FAILS because the receipt simply VANISHES
 *                                                         (0 items), which is the cheapest green
 *   D  baseline, nothing armed                          -> both suites green
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { anchorTable } from "../scripts/anchortable.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PLANE = join(ROOT, "bio-plane");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const FLOOR = 10000;

const GAP = "const GAP = String.raw`(?:[ \\t]+(?:\\r?\\n)?|\\r?\\n)[ \\t]*`;";
const REMOTE = "const remote = rows.some((r) => isItemRow(r.cells)) && !UNDESIGNED.test(s.heading) && !UNDESIGNED.test(introducingBlock(preamble));";
const ARMS = [
  { name: "A the gap reverted to \\s+", file: "tools/corpuscheck.mjs", from: GAP, to: "const GAP = String.raw`\\s+`;",
    want: { "corpuscheck": ["a PARAGRAPH break is never spanned"], "statussweep": ["a paragraph break is never spanned"] } },
  { name: "B the classifier reverted to the cross-line correlate", file: "tools/statussweep.mjs", from: REMOTE, to: "const remote = /\\n/.test(mm[0]);",
    want: { "corpuscheck": [], "statussweep": ["re-wrapped onto ONE line: docs/development/research/RECONCILED.md", "genuine soft-wrapped introduction"] } },
  { name: "C the liar: a literal space", file: "tools/corpuscheck.mjs", from: GAP, to: "const GAP = String.raw` +`;",
    want: { "corpuscheck": ["SOFT-WRAPPED mid-phrase", "Functional Architecture", "tabs, runs of spaces"],
      "statussweep": ["as wrapped in the corpus: docs/development/research/RECONCILED.md", "genuine soft-wrapped introduction"] } },
  { name: "D baseline, nothing armed", file: null, want: { "corpuscheck": [], "statussweep": [] } },
];
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read); includes + replace arms on >=1. */
anchorTable(ARMS.filter((a) => a.file).map((a) => ({ arm: a.name, file: join(ROOT, a.file), find: a.from, put: a.to, sites: "any" })));

let asDeclared = 0;
for (const arm of ARMS) {
  let path, before, aside;
  if (arm.file) {
    path = join(ROOT, arm.file);
    const src = readFileSync(path, "utf8");
    if (!src.includes(arm.from)) { console.log(`${arm.name}: ANCHOR NOT FOUND — NOT ARMED`); continue; }
    before = sha(path);
    aside = join(tmpdir(), `m061-pristine-${process.pid}-${arm.file.replace(/\//g, "_")}`);
    copyFileSync(path, aside);
    writeFileSync(path, src.replace(arm.from, arm.to));
    if (sha(path) === before) { console.log(`${arm.name}: substitution did not take — NOT ARMED`); copyFileSync(aside, path); continue; }
  }
  console.log(`\n${arm.name}`);
  let ok = true;
  try {
    for (const suite of ["corpuscheck", "statussweep"]) {
      const r = spawnSync("node", [`test/${suite}.test.mjs`], { cwd: PLANE, encoding: "utf8" });
      const out = `${r.stdout}${r.stderr}`;
      const done = /\d+ pass, \d+ fail/.exec(out);
      const fails = out.split("\n").filter((l) => /^\s+FAIL/.test(l)).map((l) => l.trim());
      console.log(`  ${suite}: exit ${r.status}; ${done ? done[0] : "NO COMPLETION LINE"}`);
      for (const f of fails) console.log(`    ${f}`);
      const want = arm.want[suite];
      const matched = want.every((w) => fails.some((f) => f.includes(w))) && fails.length === want.length;
      if (!done || !matched || (want.length ? r.status === 0 : r.status !== 0)) { ok = false; console.log("    ^ NOT AS DECLARED"); }
    }
  } finally {
    if (arm.file) {
      copyFileSync(aside, path);
      unlinkSync(aside);
      const same = sha(path) === before && readFileSync(path).length > FLOOR;
      console.log(`  restored byte-identically: ${same ? "YES" : "NO"} (${readFileSync(path).length} B)`);
      if (!same) ok = false;
    }
  }
  if (ok) asDeclared++;
}
console.log(`\n${asDeclared}/${ARMS.length} arms as declared`);
process.exit(asDeclared === ARMS.length ? 0 : 1);
