#!/usr/bin/env node
/* coord.control.mjs — M0-110's NEGATIVE-CONTROL DRIVER: three arms plus a baseline, against `coord.test.mjs`.
 *
 *     node bio-plane/test/coord.control.mjs          # from the repo root: the baseline, then every arm
 *     node bio-plane/test/coord.control.mjs R        # the baseline, then the named arm(s)
 *
 * DECLARED BEFORE ARMING (the row's NEGATIVE CONTROL, and TREE-SHARING.md §1's):
 *   R  ONE READER POINTED BACK AT MAIN'S OLD PATH — `ledger.mjs`' `readRel` reads the working tree's file again, as it
 *      did before M0-110. On a switched tree that file is the one-line pointer.
 *        MUST FAIL: "§2 findId answers the same row from coord" (and the other §2 answers that go through `readRel`).
 *   W  THE WRITE MADE A TEXTUAL MERGE — `addLine` appends at the END OF THE FILE instead of at the end of its anchored
 *      block, which is exactly where a textual merge of two tail appends puts the line (BOB #27's receipt: BOB #26's
 *      DISCHARGED line landed inside DIST #4's claim).
 *        MUST FAIL: "§5 the line is in ITS OWN block" and "...and NOT inside the block that landed meanwhile".
 *   C  THE WRITE'S LEDGER CHECKS SKIPPED — BOB #28's ruling 2 control: the planted closed row is then pushed.
 *        MUST FAIL: "§6 the planted closed row is REFUSED".
 *   S  THE STATUS NOTE REPLACES THE HEADING'S TAIL AGAIN — M0-164's defect restored exactly: `setStatus` writes
 *      `<state> — <note>` over everything after the state word and writes no `status:` line, which is how all 15 rows
 *      CONDUCT #20 flipped on 2026-09-24 lost the headlines naming their defects.
 *        MUST FAIL: "M0-164 the flip leaves the row's HEADLINE byte-identical — only the state word moves" and
 *        "M0-164 ...and the note is on a `status:` line of the row's own, directly under the heading".
 * What MUST NOT fail: the baseline and the closing run, and every restore. Arms W and C may redden OTHER assertions
 * too (the in-block arm has two halves; with the checks off, every refusal-by-check in §6–§7 goes) — each arm
 * declares the names that MUST be among its failures, and prints every failure it saw, so collateral is visible.
 *
 * THE RULES, which are this estate's: every anchor is counted before anything arms (`preflight`, D-331); each arm
 * patches from the pristine file and is restored before the next arms, verified by sha256 AND `cmp` against that arm's
 * own uniquely-named copy, byte count printed and floored; an `exit` hook restores from memory on EVERY exit. THE PEN is
 * `controlPen("m0110")`, OUTSIDE the worktree (M0-182: it was `.m0110-harness/`, which no `.gitignore` line covered
 * and which ignored ITSELF from inside — a window between the mkdir and the write), so an interrupted run leaves
 * nothing untracked in the tree at all.
 * THE LIMIT, STATED FIRST: nothing here proves a control RAN; the run of record is written, dated and with its
 * figures, onto `coord.test.mjs`' `NEGATIVE CONTROL RESULT:` line.
 */
import "./stdio.mjs";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";
import { controlPen } from "./pen.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const SUITE = path.join(REPO, "bio-plane", "test", "coord.test.mjs");
const COORD = path.join(REPO, "tools", "coord.mjs");
const LEDGER = path.join(REPO, "tools", "ledger.mjs");
const PEN = controlPen("m0110");
const PEN_IGNORE = path.join(PEN, ".gitignore");
const ONLY = process.argv.slice(2);
const DECLARED_ARMS = 4;

const sha = (b) => createHash("sha256").update(b).digest("hex");
const EMPTY_SHA = sha(Buffer.alloc(0));
const SUBJECTS = new Map([
  [COORD, { name: "coord.mjs", floorBytes: 30000 }],
  [LEDGER, { name: "ledger.mjs", floorBytes: 30000 }],
]);
for (const [p, s] of SUBJECTS) {
  s.pristine = fs.readFileSync(p);
  s.digest = sha(s.pristine);
  if (s.pristine.length < s.floorBytes || s.digest === EMPTY_SHA) {
    console.log(`** ${s.name} is implausibly small (${s.pristine.length} B, floor ${s.floorBytes}); refusing to arm over it`);
    process.exit(1);
  }
  console.log(`pristine ${s.name}: ${s.pristine.length} bytes, sha256 ${s.digest.slice(0, 12)}…`);
}

let pass = 0, fail = 0;
const t = (label, ok) => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`); ok ? pass++ : fail++; };

const WRITTEN = new Set();
process.on("exit", (code) => {
  for (const [p, s] of SUBJECTS) {
    if (sha(fs.readFileSync(p)) !== s.digest) {
      fs.writeFileSync(p, s.pristine);
      console.log(`  exit ${code}: ${s.name} restored from memory — sha256 ${sha(fs.readFileSync(p)) === s.digest ? "match" : "**MISMATCH**"}`);
    }
  }
  const clean = [...SUBJECTS].every(([p, s]) => sha(fs.readFileSync(p)) === s.digest);
  if (clean) for (const p of WRITTEN) { try { fs.rmSync(p, { force: true }); WRITTEN.delete(p); } catch {} }
  if (!WRITTEN.size) { try { fs.rmSync(PEN_IGNORE, { force: true }); if (fs.existsSync(PEN)) fs.rmdirSync(PEN); } catch {} }
  console.log(`coord.control pen: ${fs.existsSync(PEN) ? `REMAINS at ${PEN} (${WRITTEN.size} copy(ies) kept as evidence)` : "absent"} · exit ${code}`);
});
let CURRENT = null;
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(sig, () => { if (CURRENT) { try { CURRENT.kill("SIGTERM"); } catch {} } process.exit(130); });

function runSuite() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SUITE], { cwd: path.join(REPO, "bio-plane"), stdio: ["ignore", "pipe", "pipe"] });
    CURRENT = child;
    const out = [];
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => out.push(d));
    child.on("close", (code) => {
      CURRENT = null;
      const text = Buffer.concat(out).toString("utf8");
      const tally = /^coord: (\d+) pass, (\d+) fail$/m.exec(text);
      resolve({ code, text, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, foot: !!tally,
                failed: [...text.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]) });
    });
  });
}

/* ---------------------------------------------------------------- the arms
   Each patch quotes one line of its subject, asserted to occur exactly ONCE before anything arms. */
const anchorReader = "const readRel = (repo, rel) => readState(repo, rel);";
const anchorAddLine = "  const at = findAnchor(lines, anchor);";
const anchorChecks = "      if (checks) {\n        checked = await ledgerChecks({ repo: dir, today });";
/* M0-164's arm: the ONE line that carries the headline through. Restoring the old right-hand side restores the
   defect — the note written over the heading's tail, and no `status:` line at all. */
const anchorHead = "  return [...lines.slice(0, start), `${head[1]}${state}${head[3]}`, ...body, ...lines.slice(end)].join(\"\\n\");";
const armHead = "  return [...lines.slice(0, start), `${head[1]}${state}${note === null ? head[3] : ` \u2014 ${note}`}`, ...lines.slice(start + 1, end), ...lines.slice(end)].join(\"\\n\");";
const ARMS = [
  { id: "R", title: "ONE READER pointed back at main's old path (`ledger.mjs` readRel reads the working tree again)",
    must: ["§2 findId answers the same row from coord"],
    patches: [[LEDGER, anchorReader, "const readRel = (repo, rel) => { try { return readFileSync(join(repo, rel), \"utf8\"); } catch { return null; } };"]] },
  { id: "W", title: "the write made a TEXTUAL MERGE: the line lands at the end of the file, not of its block",
    must: ["§5 the line is in ITS OWN block", "...and NOT inside the block that landed meanwhile"],
    patches: [[COORD, anchorAddLine, anchorAddLine + " if (at >= 0) return withNL(text) + add.replace(/\\n+$/, \"\") + \"\\n\";"]] },
  { id: "C", title: "the write's LEDGER CHECKS skipped (BOB #28's ruling 2 control)",
    must: ["§6 the planted closed row is REFUSED"],
    patches: [[COORD, anchorChecks, anchorChecks.replace("if (checks) {", "if (false) {")]] },
  { id: "S", title: "M0-164's defect restored: the status note is written OVER the heading's tail, and no `status:` line",
    must: ["M0-164 the flip leaves the row's HEADLINE byte-identical — only the state word moves",
           "M0-164 ...and the note is on a `status:` line of the row's own, directly under the heading"],
    patches: [[COORD, anchorHead, armHead]] },
];
if (ARMS.length !== DECLARED_ARMS) { console.log(`** ${ARMS.length} arms against ${DECLARED_ARMS} declared — the head is wrong`); process.exit(1); }
const selected = ARMS.filter((a) => !ONLY.length || ONLY.includes(a.id));
if (!selected.length || ONLY.some((id) => !ARMS.some((a) => a.id === id))) { console.log(`** no arm ${ONLY.join(", ")}`); process.exit(1); }
const rows = preflight("coord.control", ARMS.map((a) => ({ id: a.id, anchors: a.patches.map(([file, needle]) => ({ file, needle })) })),
  { fatalFor: selected.map((a) => a.id) });
if (rows.some((r) => r.n !== r.want && selected.some((a) => a.id === r.id))) { console.log("** an anchor of a selected arm is not live — REFUSED TO ARM BLIND"); process.exit(1); }

function restore(id, file) {
  const s = SUBJECTS.get(file);
  fs.writeFileSync(file, s.pristine);
  const now = fs.readFileSync(file);
  const copy = path.join(PEN, `arm${id}--${s.name}`);
  let cmp = true;
  try { execFileSync("cmp", ["-s", file, copy]); } catch { cmp = false; }
  const ok = sha(now) === s.digest && cmp && now.length >= s.floorBytes;
  t(`arm ${id} · RESTORED ${s.name} byte-identically (${now.length} B, sha256 ${ok ? "match" : "**MISMATCH**"}, cmp ${cmp ? "identical" : "DIFFERS"})`, ok);
  if (ok) { fs.rmSync(copy, { force: true }); WRITTEN.delete(copy); }
  return ok;
}

console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = await runSuite();
  t(`baseline · coord.test reached its foot and is GREEN (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot && s.fail === 0 && s.code === 0 && s.pass > 50);
  for (const a of selected) for (const m of a.must) t(`baseline · "${m}" is an assertion the suite RUNS (it is not named in a failure)`, s.foot && s.text.includes(`PASS  ${m}`));
}
let armsRun = 0;
for (const a of selected) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  console.log(`    DECLARED: the suite goes RED, and among its failures: ${a.must.map((m) => `"${m}"`).join(", ")}`);
  fs.mkdirSync(PEN, { recursive: true });
  if (!fs.existsSync(PEN_IGNORE)) fs.writeFileSync(PEN_IGNORE, "*\n");
  const touched = [...new Set(a.patches.map(([file]) => file))];
  for (const file of touched) {
    const copy = path.join(PEN, `arm${a.id}--${SUBJECTS.get(file).name}`);
    fs.writeFileSync(copy, SUBJECTS.get(file).pristine); WRITTEN.add(copy);
  }
  const src = new Map(touched.map((f) => [f, SUBJECTS.get(f).pristine.toString("utf8")]));
  let armed = true;
  for (const [file, from, to] of a.patches) {
    const n = src.get(file).split(from).length - 1;
    if (n !== 1) { armed = false; console.log(`    anchor matched ${n} time(s) in ${SUBJECTS.get(file).name}`); break; }
    src.set(file, src.get(file).replace(from, () => to));
  }
  t(`arm ${a.id} · ARMED (each patch matched exactly once)`, armed);
  if (armed) {
    for (const [file, text] of src) fs.writeFileSync(file, text);
    const s = await runSuite();
    armsRun++;
    t(`arm ${a.id} · the suite reached its foot (${s.pass} pass, ${s.fail} fail, exit ${s.code}) — a crash is not a result`, s.foot);
    t(`arm ${a.id} · the suite went RED`, s.fail > 0 && s.code !== 0);
    for (const m of a.must) t(`arm ${a.id} · FAILS BY NAME: "${m}"`, s.failed.includes(m));
    console.log(`    ACTUAL: ${s.pass} pass, ${s.fail} fail, exit ${s.code}; failing: ${s.failed.map((l) => l.slice(0, 90)).join(" | ") || "none"}`);
  }
  for (const file of touched) if (!restore(a.id, file)) { console.log("** a restore did not verify; stopping"); process.exit(1); }
}

console.log("\n--- CLOSING · every arm restored ---");
{
  const s = await runSuite();
  t(`closing · coord.test is GREEN again, so no arm leaked (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot && s.fail === 0 && s.code === 0);
}
for (const [p, s] of SUBJECTS) t(`closing · ${s.name} is the pristine file (sha256 ${s.digest.slice(0, 12)}…)`, sha(fs.readFileSync(p)) === s.digest);
t(`the arm tally held: ${armsRun} run of ${selected.length} selected`, armsRun === selected.length);
console.log(`\ncoord.control: ${pass} pass, ${fail} fail  (${armsRun} arm(s) run of ${DECLARED_ARMS} declared, plus a baseline)`);
process.exit(fail ? 1 : 0);
