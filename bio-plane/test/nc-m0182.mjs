#!/usr/bin/env node
/* nc-m0182.mjs — M0-182's NEGATIVE CONTROL DRIVER.  `cd bio-plane && node test/nc-m0182.mjs [arm|all]`
 *
 * THE SUBJECT is `scripts/pensweep.mjs` and `test/pen-sweep.test.mjs`: the sweep that says every `nc-*.mjs`
 * driver keeps its pristine copy OUTSIDE the worktree, and the suite that floors the class at zero. A sweep
 * is an instrument, and this project's measured experience is that a control here finds the INSTRUMENT wrong
 * more often than the subject — so each arm breaks ONE thing and DECLARES, before it runs, what must fail and
 * what must NOT.
 *
 * THE PEN IS OUTSIDE THE WORKTREE — `controlPen("m0182")` from `test/pen.mjs`, which is the helper this very
 * item lands. A control for the pen rule that broke the pen rule would be its own first finding.
 *
 * ARMS, each ALONE with every other defence held open, and each DECLARED here:
 *   (p1) `test/nc-rec82.mjs`'s pen pointed BACK into the worktree (`controlPen("rec82")` ->
 *        `join(REPO, ".rec82-control-pristine")`).
 *        MUST FAIL: "THE ROW'S ACCEPTS-WHEN: no driver in the floored class names an untracked, unignored
 *        worktree path", NAMING bio-plane/test/nc-rec82.mjs.
 *        MUST NOT FAIL: the scratch-estate arms of section 3 — a real driver's pen says nothing about them.
 *   (p2) the ignore probe asked of the path BARE only, dropping the trailing-slash probe.
 *        MUST FAIL: "(p3) an in-worktree pen a .gitignore line DOES cover is declared, not dirty".
 *        This is the defect this driver's own first run found in the sweep: `git check-ignore` will not match
 *        a `dir/` pattern against a path that does not exist, and on a clean tree NO pen exists.
 *        MUST NOT FAIL: "(p1) an in-worktree pen no .gitignore line covers is IN-WORKTREE/DIRTY" — the arm
 *        must not simply blind the sweep.
 *        CORRECTED 2026-09-24 AFTER ITS FIRST RUN, AND THE CORRECTION IS THE ARM'S OWN FINDING. It was
 *        declared MUST-NOT-FAIL for the floored-class arm too, on the assumption that the class keeps no
 *        in-worktree pen at all. It came back NOT AS DECLARED, and the sweep was right: TWO drivers in the
 *        floored class name in-worktree paths that are DECLARED — nc-d355's `_m025/nc-d355` run logs and
 *        nc-m034's gitignored `docs/DECIDED.md` — so the trailing-slash probe is load-bearing for the floored
 *        class as well, not only for the estate. The declaration was wrong; the instrument was not.
 *   (p3) `stripComments` swapped for the raw source, so a comment is code.
 *        MUST FAIL: "(p5) a pen path spelled in PROSE is not a path the driver names".
 *        MUST NOT FAIL: "(p1) an in-worktree pen no .gitignore line covers is IN-WORKTREE/DIRTY".
 *   (p4) one `UNIGNORED_PENS` name re-introduced into a driver (`.m0107-harness` into nc-rec82.mjs).
 *        MUST FAIL: "the seven pens no .gitignore line covered are not named again".
 *        MUST NOT FAIL: the scratch-estate arms.
 *   (p5) OVER-STRICTNESS — a floored driver's pen written in a spelling this item did NOT introduce
 *        (`mkdtempSync(join(tmpdir(), "nc-rec82-"))` instead of `controlPen("rec82")`).
 *        MUST NOT FAIL: anything. Correct work in an unanticipated spelling must PASS, or the sweep is
 *        enforcing a habit rather than a property.
 *
 * EVERY RESTORE is verified by sha256 AND by `cmp` AND by a floored byte count, against a pristine copy named
 * uniquely PER ARM — never `git checkout --`, which restores to HEAD and in a tree with uncommitted work is
 * "throw mine away" at exit 0 either way.
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";
import { anchorTable } from "../scripts/anchortable.mjs";

const PEN = controlPen("m0182");
const P = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const SWEEP = P("../scripts/pensweep.mjs");
const SUITE = P("./pen-sweep.test.mjs");
const REC82 = P("./nc-rec82.mjs");
const ONLY = (process.argv[2] || "all").trim();

const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
const FLOOR = { [SWEEP]: 8000, [SUITE]: 5000, [REC82]: 2000 };

/* The suite's own foot, and the FAIL lines it printed. A suite that never reached its foot is -1, never 0. */
function runSuite() {
  const r = spawnSync(process.execPath, [SUITE], { cwd: P("../"), encoding: "utf8", timeout: 240000 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const foot = /pen-sweep: (\d+) pass, (\d+) fail/.exec(out);
  return {
    pass: foot ? Number(foot[1]) : -1,
    fail: foot ? Number(foot[2]) : -1,
    exit: r.status,
    fails: (out.match(/^ {2}FAIL {2}(.+)$/gm) || []).map((s) => s.replace(/^ {2}FAIL {2}/, "").slice(0, 120)),
    out,
  };
}

const ARMS = [
  { id: "p1", file: REC82, declared: "the floored-class arm FAILS naming nc-rec82",
    mustFail: [/no driver in the floored class names an untracked, unignored worktree path/],
    mustNotFail: [/\(p1\) an in-worktree pen no \.gitignore line covers/, /\(p3\) an in-worktree pen a \.gitignore line DOES cover/],
    from: 'const SAFE = controlPen("rec82");',
    to: 'const SAFE = join(REPO, ".rec82-control-pristine");' },
  { id: "p2", file: SWEEP, declared: "the DECLARED-pen arm fails: a `dir/` pattern does not match a path that does not exist",
    mustFail: [/\(p3\) an in-worktree pen a \.gitignore line DOES cover/],
    /* NOT the floored-class arm — see the CORRECTED note in this file's header: two floored drivers keep
       DECLARED in-worktree paths, so breaking the ignore probe legitimately reaches them. */
    mustNotFail: [/\(p1\) an in-worktree pen no \.gitignore line covers/],
    from: '  const ignored = new Set(cand.filter((c) => hitSet.has(c) || hitSet.has(`${c}/`)));',
    to: '  const ignored = new Set(cand.filter((c) => hitSet.has(c)));' },
  { id: "p3", file: SWEEP, declared: "a pen path in PROSE is read as a path the driver names",
    mustFail: [/\(p5\) a pen path spelled in PROSE is not a path the driver names/],
    mustNotFail: [/\(p1\) an in-worktree pen no \.gitignore line covers/],
    from: "  const code = stripComments(src);\n  const local = { ...ctx, file, code, binds: bindings(code) };",
    to: "  const code = src;\n  const local = { ...ctx, file, code, binds: bindings(code) };" },
  { id: "p4", file: REC82, declared: "the pinned-by-name arm FAILS naming .m0107-harness",
    mustFail: [/the seven pens no \.gitignore line covered are not named again/],
    mustNotFail: [/\(p1\) an in-worktree pen no \.gitignore line covers/],
    from: 'const SAFE = controlPen("rec82");',
    to: 'const SAFE = controlPen("rec82");\nconst UNUSED_PEN = join(REPO, ".m0107-harness");' },
  { id: "p5", file: REC82, declared: "OVER-STRICTNESS: nothing fails — an unanticipated spelling of a correct pen PASSES",
    mustFail: [],
    mustNotFail: [/no driver in the floored class names an untracked, unignored worktree path/,
                  /the helper the class rides is a real module the drivers import/],
    from: 'const SAFE = controlPen("rec82");',
    to: 'const SAFE = mkdtempSync(join(tmpdir(), "nc-rec82-"));\nimport { mkdtempSync } from "node:fs";\nimport { tmpdir } from "node:os";' },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.map((a) => ({ arm: a.id, file: a.file, find: a.from, put: a.to })));

/* D-331: every anchor is counted BEFORE anything is armed, so an arm that could never have armed is a
   finding about the arm rather than a surprising green. */
console.log("=== M0-182 · NEGATIVE CONTROLS · preflight (every anchor counted before anything is armed) ===");
let refused = 0;
for (const a of ARMS) {
  const n = readFileSync(a.file, "utf8").split(a.from).length - 1;
  console.log(`  ${a.id}  anchor occurs ${n} time(s) in ${a.file.split("/").pop()}${n === 1 ? "" : "  <-- REFUSING TO ARM"}`);
  if (n !== 1) refused++;
}
if (refused) { console.log(`\nREFUSED: ${refused} arm(s) have no unique anchor. Nothing was armed.`); process.exit(3); }

console.log("\n=== BASELINE (no arm) ===");
const base = runSuite();
console.log(`  pen-sweep: ${base.pass} pass, ${base.fail} fail (exit ${base.exit})`);
if (base.fail !== 0 || base.pass < 20) { console.log("REFUSING TO ARM: the baseline is not green — measure that first."); process.exit(4); }

let wrong = 0, ran = 0;
for (const a of ARMS) {
  if (ONLY !== "all" && ONLY !== a.id) continue;
  ran++;
  console.log(`\n=== ARM ${a.id} — ${a.declared}`);
  const pristine = `${PEN}/${a.file.split("/").pop()}.pristine.${a.id}`;
  copyFileSync(a.file, pristine);
  const before = sha(a.file), beforeBytes = statSync(a.file).size;
  if (beforeBytes < FLOOR[a.file]) { console.log(`  REFUSING: ${a.file} is ${beforeBytes} bytes, under its floor`); process.exit(5); }
  writeFileSync(a.file, readFileSync(a.file, "utf8").replace(a.from, a.to));
  if (sha(a.file) === before) { console.log("  THE ARM NEVER ARMED — bytes unchanged. THIS IS A FINDING."); wrong++; }
  else {
    const r = runSuite();
    console.log(`  pen-sweep: ${r.pass} pass, ${r.fail} fail (exit ${r.exit})`);
    const hit = (re) => r.fails.some((f) => re.test(f)) || (r.pass === -1 && re.test(r.out));
    const missing = a.mustFail.filter((re) => !hit(re));
    const brokeHeldOpen = a.mustNotFail.filter((re) => hit(re));
    const noFoot = r.pass === -1;
    for (const f of r.fails) console.log(`      FAILED: ${f}`);
    const asDeclared = !missing.length && !brokeHeldOpen.length && !noFoot
      && (a.mustFail.length ? r.fail > 0 : r.fail === 0);
    console.log(`  VERDICT ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`
      + (noFoot ? " — THE SUITE NEVER REACHED ITS OWN FOOT (reported -1, never 0)" : "")
      + (missing.length ? ` — ${missing.length} declared failure(s) did NOT happen` : "")
      + (brokeHeldOpen.length ? ` — ${brokeHeldOpen.length} assertion(s) held open FAILED too` : ""));
    if (!asDeclared) wrong++;
  }
  copyFileSync(pristine, a.file);
  const okSha = sha(a.file) === before;
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", a.file, pristine]); } catch { cmpOk = false; }
  const bytes = statSync(a.file).size;
  console.log(`  RESTORED byte-identically: ${okSha && cmpOk && bytes === beforeBytes ? "YES" : "NO"} `
    + `(sha256 ${okSha ? "equal" : "DIFFERENT"}, cmp ${cmpOk ? "equal" : "DIFFERENT"}, ${bytes}/${beforeBytes} bytes, floor ${FLOOR[a.file]})`);
  if (!okSha || !cmpOk || bytes < FLOOR[a.file]) { console.log("  RESTORE FAILED — stopping before the next arm measures a moved tree."); process.exit(6); }
}

console.log(`\n=== CLOSING BASELINE ===`);
const close = runSuite();
console.log(`  pen-sweep: ${close.pass} pass, ${close.fail} fail (exit ${close.exit})`);
const leftovers = ARMS.map((a) => `${PEN}/${a.file.split("/").pop()}.pristine.${a.id}`).filter(existsSync);
console.log(`  pristine copies left in the pen (outside the worktree, kept on purpose): ${leftovers.length}`);
console.log(`\n${ran} arm(s) run · ${wrong} NOT AS DECLARED · closing baseline ${close.pass === base.pass && close.fail === 0 ? "EQUALS the opening" : "DIFFERS FROM THE OPENING"}`);
process.exit(wrong || close.fail !== 0 || close.pass !== base.pass ? 1 : 0);
