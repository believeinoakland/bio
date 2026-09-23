#!/usr/bin/env node
/* contradiction-overstrict.control.mjs — M0-71's negative control, run with
 *     cd bio-plane && node test/contradiction-overstrict.control.mjs [arm]
 *
 * §7 of CONTRADICTION-IDENTIFY-DESIGN.md names THREE controls — the PAIRING arm
 * (disable K2), the JUDGEMENT arm (label every pair `world`), the EMPTY arm (an
 * empty record returns case (a)). This harness runs those three, plus the
 * disabled-judgement arm the row's accepts-when names and an over-strictness arm
 * on the GATE, each against a REAL source file:
 *   - each arm is armed ALONE, every other held open, and restored from a
 *     pristine copy named UNIQUELY PER ARM;
 *   - the restore is verified by sha256 AND `cmp`, with a byte count printed and
 *     a minimum guarded (never `git checkout --`, CLAUDE.md §7);
 *   - an anchor that matches other than once is ARM DID NOT ARM, and the arm is
 *     reported and skipped, never run green;
 *   - each arm DECLARES before arming what MUST fail and what MUST NOT, and both
 *     are checked; the BASELINE row is first.
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const SRC = { store: "src/store.mjs", judge: "test/contradiction-judge-baseline.mjs",
              gate: "test/contradiction-gate.mjs" };
const MIN_BYTES = { store: 100000, judge: 3000, gate: 3000 };
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const ARMS = {
  baseline: { file: null, why: "nothing armed. MUST be green" },
  pairing: { file: "store",
    find: `        : name === "K2" ? this.#contradictionK2(viewer, cap)`,
    to:   `        : name === "K2" ? { pairs: [], truncated: false, notes: [] }  /* ARMED */`,
    why: "§7 CONTROL 1 — K2 disabled in the plane. The fixture's record pairs on K2 are no longer "
       + "compared. MUST fail: K2 COMPARED, naming K2. MUST NOT fail: K1 COMPARED",
    must_fail: "K2 COMPARED", must_pass: "K1 COMPARED" },
  judgement: { file: "judge",
    find: `export function judgeBaseline(pair) {`,
    to:   `export function judgeBaseline(pair) { return { label: "world", reason: "ARMED" };`,
    why: "§7 CONTROL 2 — the candidate labels every pair `world`. MUST fail: the baseline gate "
       + "assertion. MUST NOT fail: the pairing (K2 COMPARED), which this arm does not touch",
    must_fail: "THE BASELINE CANDIDATE PASSES THE GATE", must_pass: "K2 COMPARED" },
  disabled: { file: "judge",
    find: `export function judgeBaseline(pair) {`,
    to:   `export function judgeBaseline(pair) { return undefined;`,
    why: "THE ROW'S DISABLED JUDGEMENT — no label at all. It has NO false conflicts, so a gate that "
       + "read zero as strict would pass it. MUST fail: the baseline gate assertion. MUST NOT fail: "
       + "the empty-record arm",
    must_fail: "THE BASELINE CANDIDATE PASSES THE GATE", must_pass: "EMPTY RECORD: the gate REFUSES" },
  empty: { file: "gate",
    find: `  if (!m || m.all.compared === 0) return { pass: false, fails: ["NOTHING_COMPARED"] };`,
    to:   `  /* ARMED */`,
    why: "§7 CONTROL 3 — the harness states a rate over nothing. MUST fail: EMPTY RECORD. MUST NOT "
       + "fail: the baseline gate over the built corpus",
    must_fail: "EMPTY RECORD: the gate REFUSES", must_pass: "THE BASELINE CANDIDATE PASSES THE GATE" },
  overstrict: { file: "gate",
    find: `    if (x.false_conflict_rate !== null && x.false_conflict_rate > threshold) fails.push(\`FALSE_CONFLICT:\${k}\`);`,
    to:   `    if (x.false_conflict_rate !== null && x.false_conflict_rate >= threshold) fails.push(\`FALSE_CONFLICT:\${k}\`);  /* ARMED */`,
    why: "THE GATE TIGHTER THAN ITS RULE: a rate EQUAL to the threshold now fails. MUST fail: the "
       + "oracle (correct work) arm. MUST NOT fail: the always-world arm, which fails either way",
    must_fail: "OVER-STRICTNESS OF THE GATE ITSELF", must_pass: "AN ALWAYS-`world` JUDGEMENT FAILS" },
};

const run = () => {
  try {
    return execFileSync(process.execPath, ["test/contradiction-overstrict.test.mjs"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
  } catch (e) { return String(e.stdout || "") + String(e.stderr || ""); }
};
/* THE SUITE'S OWN FOOT, OR -1 — never 0 (kickoffs/WORKER.md). */
const tally = (out) => {
  const m = /contradiction-overstrict: (\d+) pass, (\d+) fail/.exec(out);
  return m ? { pass: +m[1], fail: +m[2] } : { pass: -1, fail: -1 };
};
const failedLabels = (out) => out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.trim());

const only = process.argv[2] || null;
const rows = [];
for (const [name, arm] of Object.entries(ARMS)) {
  if (only && only !== name) continue;
  if (!arm.file) { rows.push({ name, patched: 0, ...tally(run()), restored: true, bytes: 0, sha: "n/a" }); continue; }
  const path = SRC[arm.file];
  const pristine = `test/.m071-pristine-${name}-${arm.file}.mjs`;
  copyFileSync(path, pristine);
  const before = sha(path);
  const src = readFileSync(path, "utf8");
  const patched = src.split(arm.find).length - 1;
  if (patched !== 1) {
    rows.push({ name, patched, note: `ARM DID NOT ARM — anchor matched ${patched} time(s)` });
    unlinkSync(pristine);
    continue;
  }
  writeFileSync(path, src.replace(arm.find, arm.to));
  const out = run();
  writeFileSync(path, readFileSync(pristine));
  const after = sha(path), bytes = readFileSync(path).length;
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", path, pristine]); } catch { cmpOk = false; }
  const labels = failedLabels(out);
  rows.push({ name, patched, ...tally(out),
              declared_fail: arm.must_fail, saw_fail: labels.some((l) => l.includes(arm.must_fail)),
              declared_pass: arm.must_pass, kept_pass: !labels.some((l) => l.includes(arm.must_pass)),
              restored: after === before && cmpOk && bytes > MIN_BYTES[arm.file], bytes, sha: after.slice(0, 12) });
  unlinkSync(pristine);
}

console.log("\nM0-71 NEGATIVE CONTROL — declared vs actual\n");
for (const r of rows) {
  if (r.note) { console.log(`  ${r.name.padEnd(11)} ${r.note}`); continue; }
  const ok = r.name === "baseline" ? r.fail === 0 && r.pass > 0 : r.saw_fail && r.kept_pass;
  console.log(`  ${r.name.padEnd(11)} ${String(r.pass).padStart(3)}/${String(r.fail).padStart(2)}  armed=${r.patched}  `
    + `restored=${r.restored} (${r.bytes} B, ${r.sha})  ${ok ? "AS DECLARED" : "NOT AS DECLARED"}`
    + (r.name === "baseline" ? "" : `\n${" ".repeat(15)}must fail: ${r.saw_fail} "${r.declared_fail}"`
      + `\n${" ".repeat(15)}must pass: ${r.kept_pass} "${r.declared_pass}"`));
}
const bad = rows.filter((r) => r.note || r.restored !== true
  || (r.name === "baseline" ? !(r.fail === 0 && r.pass > 0) : !(r.saw_fail && r.kept_pass)));
console.log(`\n${rows.length - bad.length}/${rows.length} arm(s) AS DECLARED, every file restored by sha256 and cmp.`);
process.exit(bad.length ? 1 : 0);
