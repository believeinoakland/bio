#!/usr/bin/env node
/* nc-m0196.mjs — M0-196's NEGATIVE CONTROL DRIVER.  `cd bio-plane && node test/nc-m0196.mjs [arm|all]`
 *
 * THE SUBJECT is `scripts/pensweep.mjs`'s reading of the copy-source drivers' TREE ROOT, and the ceiling and
 * by-name arm `test/pen-sweep.test.mjs` holds it to. The row said the walk could not read
 * `fileURLToPath(new URL("..", import.meta.url))`; measured, that expression already resolved, and what was
 * unread were THREE shapes around it, each landed as its own resolution and each broken here ALONE:
 *   — the trailing-slash strip `PLANE.replace(/\/$/, "")` (blanked by `stripComments`, then an unread call);
 *   — a comma-continued declaration `const plane = …, test = …`;
 *   — `join(PLANE, p)` with `p` bound elsewhere in the file to a temp path.
 *
 * THE PEN IS OUTSIDE THE WORKTREE — `controlPen("m0196")`.
 *
 * ARMS, each ALONE, each DECLARED here before it runs:
 *   (n1) drop the trailing-slash strip.
 *        MUST FAIL: the ceiling (<= 13), the BY-NAME arm (naming d510, d526, d547, rec180), (m1).
 *        MUST NOT FAIL: (m4), (m5) — the other two resolutions stand.
 *   (n2) drop the comma continuation in `bindings`.
 *        MUST FAIL: the ceiling, the BY-NAME arm (naming d548), (m4).
 *        MUST NOT FAIL: (m1), (m5).
 *   (n3) drop `join`'s below-the-first-root reading of a later temp segment.
 *        MUST FAIL: the ceiling, the BY-NAME arm (naming d526), (m5).
 *        MUST NOT FAIL: (m1), (m4).
 *   (n4) THE ROW'S CONTROL: all three dropped together — the walk as it stood before M0-196.
 *        MUST FAIL: the ceiling and the BY-NAME arm, naming all five drivers.
 *   (n5) OVER-STRICTNESS — d526's driver rewritten to the `/\/+$/` spelling of the same strip.
 *        MUST NOT FAIL: anything.
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";

const PEN = controlPen("m0196");
const P = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const SWEEP = P("../scripts/pensweep.mjs");
const SUITE = P("./pen-sweep.test.mjs");
const D526 = P("./d526-refusal-order.control.mjs");
const ONLY = (process.argv[2] || "all").trim();

const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
const FLOOR = { [SWEEP]: 8000, [D526]: 2000 };

/* The suite's own foot and the FAIL lines it printed, each with its `got` line so a by-name failure shows
   the names. A suite that never reached its foot is -1, never 0. */
function runSuite() {
  const r = spawnSync(process.execPath, [SUITE], { cwd: P("../"), encoding: "utf8", timeout: 240000 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const foot = /pen-sweep: (\d+) pass, (\d+) fail/.exec(out);
  return {
    pass: foot ? Number(foot[1]) : -1,
    fail: foot ? Number(foot[2]) : -1,
    exit: r.status,
    fails: (out.match(/^ {2}FAIL {2}.+\n {10}got .+$/gm) || []).map((s) => s.replace(/^ {2}FAIL {2}/, "").replace(/\n +/, "  || ").slice(0, 400)),
    out,
  };
}

const STRIP = { from: "  if (strip && closer(", to: "  if (false && strip && closer(" };
const COMMA = { from: "      if (next) bindingAt(code, i + 1 + next[0].length, next[1], map);\n    }\n  }\n  return map;",
  to: "      if (next && false) bindingAt(code, i + 1 + next[0].length, next[1], map);\n    }\n  }\n  return map;" };
const JOIN = { from: '(r.root === "UNKNOWN" || underFirst) ? "*"', to: 'r.root === "UNKNOWN" ? "*"' };
const CEIL = /UNCLASSIFIED drivers have not grown past what M0-196 left/;
const BYNAME = (...names) => new RegExp(`M0-196, BY NAME[^|]*\\|\\|[^\\n]*${names.map((n) => `(?=[^\\n]*${n})`).join("")}`);

const ARMS = [
  { id: "n1", file: SWEEP, patches: [STRIP], declared: "the trailing-slash strip unread: four drivers UNCLASSIFIED by name",
    mustFail: [CEIL, BYNAME("d510", "d526", "d547", "rec180"), /\(m1\)/], mustNotFail: [/\(m4\)/, /\(m5\)/, BYNAME("d548")] },
  { id: "n2", file: SWEEP, patches: [COMMA], declared: "the comma continuation unread: d548 UNCLASSIFIED by name",
    mustFail: [CEIL, BYNAME("d548"), /\(m4\)/], mustNotFail: [/\(m1\)/, /\(m5\)/, BYNAME("d510")] },
  { id: "n3", file: SWEEP, patches: [JOIN], declared: "join's later temp segment a disagreement again: d526 UNCLASSIFIED by name",
    mustFail: [CEIL, BYNAME("d526"), /\(m5\)/], mustNotFail: [/\(m1\)/, /\(m4\)/, BYNAME("d548")] },
  { id: "n4", file: SWEEP, patches: [STRIP, COMMA, JOIN], declared: "THE ROW'S CONTROL: all three dropped, all five named",
    mustFail: [CEIL, BYNAME("d510", "d526", "d547", "d548", "rec180")], mustNotFail: [] },
  { id: "n5", file: D526, patches: [{ from: 'const REPO = dirname(PLANE.replace(/\\/$/, ""));', to: 'const REPO = dirname(PLANE.replace(/\\/+$/, ""));' }],
    declared: "OVER-STRICTNESS: the `/\\/+$/` spelling of the same strip — nothing fails",
    mustFail: [], mustNotFail: [CEIL, /M0-196, BY NAME/] },
];

/* D-331: every anchor counted BEFORE anything is armed. */
console.log("=== M0-196 · NEGATIVE CONTROLS · preflight (every anchor counted before anything is armed) ===");
let refused = 0;
for (const a of ARMS) for (const p of a.patches) {
  const n = readFileSync(a.file, "utf8").split(p.from).length - 1;
  console.log(`  ${a.id}  anchor occurs ${n} time(s) in ${a.file.split("/").pop()}${n === 1 ? "" : "  <-- REFUSING TO ARM"}`);
  if (n !== 1) refused++;
}
if (refused) { console.log(`\nREFUSED: ${refused} anchor(s) not unique. Nothing was armed.`); process.exit(3); }

console.log("\n=== BASELINE (no arm) ===");
const base = runSuite();
console.log(`  pen-sweep: ${base.pass} pass, ${base.fail} fail (exit ${base.exit})`);
if (base.fail !== 0 || base.pass < 30) { console.log("REFUSING TO ARM: the baseline is not green — measure that first."); process.exit(4); }

let wrong = 0, ran = 0;
for (const a of ARMS) {
  if (ONLY !== "all" && ONLY !== a.id) continue;
  ran++;
  console.log(`\n=== ARM ${a.id} — ${a.declared}`);
  const pristine = `${PEN}/${a.file.split("/").pop()}.pristine.${a.id}`;
  copyFileSync(a.file, pristine);
  const before = sha(a.file), beforeBytes = statSync(a.file).size;
  if (beforeBytes < FLOOR[a.file]) { console.log(`  REFUSING: ${a.file} is ${beforeBytes} bytes, under its floor`); process.exit(5); }
  writeFileSync(a.file, a.patches.reduce((s, p) => s.replace(p.from, p.to), readFileSync(a.file, "utf8")));
  if (sha(a.file) === before) { console.log("  THE ARM NEVER ARMED — bytes unchanged. THIS IS A FINDING."); wrong++; }
  else {
    const r = runSuite();
    console.log(`  pen-sweep: ${r.pass} pass, ${r.fail} fail (exit ${r.exit})`);
    const hit = (re) => r.fails.some((f) => re.test(f));
    const missing = a.mustFail.filter((re) => !hit(re));
    const brokeHeldOpen = a.mustNotFail.filter((re) => hit(re));
    const noFoot = r.pass === -1;
    for (const f of r.fails) console.log(`      FAILED: ${f}`);
    const asDeclared = !missing.length && !brokeHeldOpen.length && !noFoot && (a.mustFail.length ? r.fail > 0 : r.fail === 0);
    console.log(`  VERDICT ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`
      + (noFoot ? " — THE SUITE NEVER REACHED ITS OWN FOOT (reported -1, never 0)" : "")
      + (missing.length ? ` — ${missing.length} declared failure(s) did NOT happen: ${missing.join(" ")}` : "")
      + (brokeHeldOpen.length ? ` — ${brokeHeldOpen.length} assertion(s) held open FAILED too: ${brokeHeldOpen.join(" ")}` : ""));
    if (!asDeclared) wrong++;
  }
  copyFileSync(pristine, a.file);
  const okSha = sha(a.file) === before;
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", a.file, pristine]); } catch { cmpOk = false; }
  const bytes = statSync(a.file).size;
  console.log(`  RESTORED byte-identically: ${okSha && cmpOk && bytes === beforeBytes ? "YES" : "NO"} `
    + `(sha256 ${okSha ? "equal" : "DIFFERENT"} ${before.slice(0, 12)}, cmp ${cmpOk ? "equal" : "DIFFERENT"}, ${bytes}/${beforeBytes} bytes, floor ${FLOOR[a.file]})`);
  if (!okSha || !cmpOk || bytes < FLOOR[a.file]) { console.log("  RESTORE FAILED — stopping before the next arm measures a moved tree."); process.exit(6); }
}

console.log("\n=== CLOSING BASELINE ===");
const close = runSuite();
console.log(`  pen-sweep: ${close.pass} pass, ${close.fail} fail (exit ${close.exit})`);
const leftovers = ARMS.map((a) => `${PEN}/${a.file.split("/").pop()}.pristine.${a.id}`).filter(existsSync);
console.log(`  pristine copies left in the pen (outside the worktree, kept on purpose): ${leftovers.length}`);
console.log(`\n${ran} arm(s) run · ${wrong} NOT AS DECLARED · closing baseline ${close.pass === base.pass && close.fail === 0 ? "EQUALS the opening" : "DIFFERS FROM THE OPENING"}`);
process.exit(wrong || close.fail ? 1 : 0);
