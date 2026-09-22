#!/usr/bin/env node
/* pushguard.control.mjs — the NEGATIVE-CONTROL DRIVER of the push guard as M0-99 left it, 7 ARMS PLUS A
 * BASELINE, for `tools/pushguard.mjs` and its suite `bio-plane/test/pushguard.test.mjs`.
 *
 *     node bio-plane/test/pushguard.control.mjs        # from the repo root: the baseline, then every arm
 *     node bio-plane/test/pushguard.control.mjs 3      # the baseline, then one arm
 *
 * THE RULES, which are this estate's and not this file's: each arm patches `tools/pushguard.mjs` ALONE
 * from a pristine tree and DECLARES before arming which NAMED assertion must fail and which must NOT;
 * the suite must still reach its own foot (a crash is a second variable, not a result), and one
 * assertion no arm can reach — the retired-arm fixture's own index state, which reads the generator and
 * `.gitignore` and never the guard — must stay green, so a red is not collateral. D-331: every anchor is
 * counted in the file BEFORE anything is armed, through `preflight`. Every restore is verified by sha256
 * AND `cmp` against the arm's own uniquely-named copy in `.m099-harness/`, with the byte count printed
 * and floored; the copy is removed as its restore verifies, and an `exit` hook restores from memory and
 * removes the pen on EVERY exit. The suite runs as an asynchronous child, so a signal is honoured when
 * it arrives rather than after the run.
 *
 * THE LIMIT, STATED FIRST (M0-42): nothing here proves a control RAN. The run of record is written,
 * dated and with its figures, into the suite's `NEGATIVE CONTROL:` block and M0-99's claim.
 */
import "./stdio.mjs";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const GUARD = path.join(REPO, "tools", "pushguard.mjs");
const SUITE = path.join(REPO, "bio-plane", "test", "pushguard.test.mjs");
const PEN = path.join(REPO, ".m099-harness");
const ONLY = process.argv[2] || null;
const DECLARED_ARMS = 7;
const FLOOR_BYTES = 30000;

const sha = (b) => createHash("sha256").update(b).digest("hex");
const PRISTINE = fs.readFileSync(GUARD);
const DIGEST = sha(PRISTINE);
if (PRISTINE.length < FLOOR_BYTES || DIGEST === sha(Buffer.alloc(0))) {
  console.log(`** tools/pushguard.mjs is implausibly small (${PRISTINE.length} B); refusing to arm over it`);
  process.exit(1);
}
console.log(`pristine tools/pushguard.mjs: ${PRISTINE.length} bytes, sha256 ${DIGEST.slice(0, 12)}…`);

let pass = 0, fail = 0;
const t = (label, ok) => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`); ok ? pass++ : fail++; };

/* ---------------------------------------------------------------- the pen, on every exit */
const WRITTEN = new Set();
process.on("exit", (code) => {
  if (sha(fs.readFileSync(GUARD)) !== DIGEST) {
    fs.writeFileSync(GUARD, PRISTINE);
    console.log(`  exit ${code}: tools/pushguard.mjs restored from memory — sha256 ${sha(fs.readFileSync(GUARD)) === DIGEST ? "match" : "**MISMATCH**"}`);
  }
  for (const p of WRITTEN) { try { fs.rmSync(p, { force: true }); } catch {} }
  /* `rmdirSync` alone, never a listing first: it refuses a non-empty directory, so a copy kept after a
     failed restore stays as evidence — and `hygiene.test.mjs` fails any new `readdirSync` walk by name. */
  try { if (fs.existsSync(PEN)) fs.rmdirSync(PEN); } catch {}
  console.log(`pushguard.control pen: ${fs.existsSync(PEN) ? `REMAINS at ${PEN}` : "absent"} · exit ${code}`);
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
      const tally = /^(\d+) pass, (\d+) fail$/m.exec(text);
      resolve({ code, text, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, foot: /PASS {2}FOOT/.test(text),
                failed: [...text.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]) });
    });
  });
}
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
const COLLATERAL = "the fixture's index exists on disk and is NOT in the commit";

/* ---------------------------------------------------------------- the arms
   Each patch is one quoted string of the file, asserted to occur exactly ONCE before anything arms. */
const SHIM_ORDER = [
  "    \"top=$(git rev-parse --show-toplevel 2>/dev/null)\",",
  "    'if [ -n \"$top\" ] && [ -f \"$top/tools/pushguard.mjs\" ]; then',",
  "    '  exec node \"$top/tools/pushguard.mjs\" --run',",
  "    \"fi\",",
  "    \"common=$(git rev-parse --git-common-dir 2>/dev/null)\",",
  "    `if [ -n \"$common\" ] && [ -f \"$common/${COPY_NAME}\" ]; then`,",
  "    `  exec node \"$common/${COPY_NAME}\" --run`,",
  "    \"fi\",",
];
const ARMS = [
  { id: "1", title: "THE LIAR — the hook body exits 0 at its first line: a guard that always reports healthy",
    patches: [["function run(stdin) {\n", "function run(stdin) {\n  return 0;\n"]],
    mustBreak: "A COMMITTED MERGE MARKER IS REFUSED",
    alsoBreak: ["THE FIX — a committed merge marker is REFUSED from a worktree that predates the guard", "NO REGRESSION"],
    mustNotBreak: ["A CLEAN TREE PUSHES"] },
  { id: "2", title: "`install()` writes the hook where git never reads it — a file, a success message, and no guard",
    patches: [["  const path = join(h.dir, \"pre-push\");", "  const path = join(h.dir, \"pre-push.never-read\");"]],
    mustBreak: "...at the path git reads hooks from", alsoBreak: ["A COMMITTED MERGE MARKER IS REFUSED"],
    mustNotBreak: ["the clone-wide copy installs into the git COMMON dir"] },
  { id: "3", title: "THE RETIRED ARM RE-ARMED — a push refused whenever the generator's `--check` is not 0",
    patches: [["  /* M0-99, 2026-09-22: THE INDEX ARM THAT STOOD HERE IS RETIRED.",
      "  { const gen = join(repo, \"tools/decided.mjs\");\n"
      + "    if (existsSync(gen) && spawnSync(process.execPath, [gen, \"--check\"], { cwd: repo, encoding: \"utf8\" }).status !== 0) {\n"
      + "      process.stderr.write(`  PUSH REFUSED — ${HOOK_MARKER}\\n  the ruling index is not current\\n`); return 1; } }\n"
      + "  /* M0-99, 2026-09-22: THE INDEX ARM THAT STOOD HERE IS RETIRED."]],
    mustBreak: "M0-99 — A RULING ADDED AFTER THE INDEX WAS WRITTEN PUSHES",
    alsoBreak: ["M0-99 — A REBASE THAT LANDS A PEER'S RULING PUSHES"],
    mustNotBreak: ["A CLEAN TREE PUSHES", "A COMMITTED MERGE MARKER IS REFUSED"] },
  { id: "4", title: "the marker scan reads nothing",
    patches: [["  for (const f of list) {", "  for (const f of []) {"]],
    mustBreak: "A COMMITTED MERGE MARKER IS REFUSED",
    alsoBreak: ["THE FIX — a committed merge marker is REFUSED from a worktree that predates the guard"],
    mustNotBreak: ["A CLEAN TREE PUSHES", "OVER-STRICTNESS — a clean tree pushes cleanly from a previously-unguarded worktree"] },
  { id: "5", title: "the shim's fallback removed — v1's single source, which D-406 measured unguarded in 6 of 9 worktrees",
    patches: [[SHIM_ORDER.slice(4).join("\n") + "\n", ""]],
    mustBreak: "THE FIX — a committed merge marker is REFUSED from a worktree that predates the guard",
    alsoBreak: ["...and the guard now gives a REAL VERDICT there instead of `NOT guarded`"],
    mustNotBreak: ["A COMMITTED MERGE MARKER IS REFUSED", "WORKTREE-FIRST, DRIVEN"] },
  { id: "6", title: "the shim's order reversed — the clone-wide cache before the pushing worktree's own script",
    patches: [[SHIM_ORDER.join("\n") + "\n", [...SHIM_ORDER.slice(4), ...SHIM_ORDER.slice(0, 4)].join("\n") + "\n"]],
    mustBreak: "WORKTREE-FIRST, DRIVEN",
    mustNotBreak: ["A COMMITTED MERGE MARKER IS REFUSED", "THE FIX — a committed merge marker is REFUSED from a worktree that predates the guard"] },
  { id: "7", title: "the downgrade guard disabled",
    patches: [["    if (Number.isFinite(haveVersion) && haveVersion > HOOK_VERSION) {", "    if (false) {"]],
    mustBreak: "NEVER DOWNGRADE — an installer older than the installed hook LEAVES IT ALONE",
    mustNotBreak: ["...and an installer at the SAME version still reports current"] },
];
if (ARMS.length !== DECLARED_ARMS) { console.log(`** ${ARMS.length} arms in the table against ${DECLARED_ARMS} declared — the head is wrong`); process.exit(1); }

const selected = ARMS.filter((a) => !ONLY || a.id === ONLY);
if (ONLY && !selected.length) { console.log(`** no arm ${ONLY}`); process.exit(1); }
const rows = preflight("pushguard.control", ARMS.map((a) => ({ id: a.id, anchors: a.patches.map(([needle]) => ({ file: GUARD, needle })) })),
  { fatalFor: selected.map((a) => a.id) });
const dead = rows.filter((r) => r.n !== r.want && selected.some((a) => a.id === r.id));
if (dead.length) { console.log(`** ${dead.length} anchor(s) of the selected arm(s) are not live — REFUSED TO ARM BLIND`); process.exit(1); }

function restore(id) {
  fs.writeFileSync(GUARD, PRISTINE);
  const now = fs.readFileSync(GUARD);
  const copy = path.join(PEN, `arm${id}--pushguard.mjs`);
  let cmp = true;
  try { execFileSync("cmp", ["-s", GUARD, copy]); } catch { cmp = false; }
  const ok = sha(now) === DIGEST && cmp && now.length >= FLOOR_BYTES;
  t(`arm ${id} · RESTORED byte-identically (${now.length} B, floor ${FLOOR_BYTES}, sha256 ${ok ? "match" : "**MISMATCH**"}, cmp ${cmp ? "identical" : "DIFFERS"})`, ok);
  if (ok) { fs.rmSync(copy, { force: true }); WRITTEN.delete(copy); }
  return ok;
}

/* ---------------------------------------------------------------- the run */
console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = await runSuite();
  t(`baseline · the suite reached its foot and is GREEN (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot && s.fail === 0 && s.code === 0 && s.pass > 60);
}
let armsRun = 0;
for (const a of selected) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  console.log(`    DECLARED: "${a.mustBreak}" FAILS; ${(a.mustNotBreak || []).map((x) => `"${x}"`).join(", ")} and "${COLLATERAL}" stay green; the suite reaches its foot`);
  fs.mkdirSync(PEN, { recursive: true });
  const copy = path.join(PEN, `arm${a.id}--pushguard.mjs`);
  fs.writeFileSync(copy, PRISTINE); WRITTEN.add(copy);
  let src = PRISTINE.toString("utf8"), armed = true;
  for (const [from, to] of a.patches) {
    const n = src.split(from).length - 1;
    if (n !== 1) { armed = false; break; }
    src = src.replace(from, () => to);
  }
  t(`arm ${a.id} · ARMED (${a.patches.length} patch${a.patches.length === 1 ? "" : "es"}, each matched exactly once)`, armed);
  if (armed) {
    fs.writeFileSync(GUARD, src);
    const s = await runSuite();
    armsRun++;
    t(`arm ${a.id} · "${a.mustBreak}" FAILS`, broke(s, a.mustBreak));
    for (const x of a.alsoBreak || []) t(`arm ${a.id} · ...and "${x}" fails with it`, broke(s, x));
    for (const x of a.mustNotBreak || []) t(`arm ${a.id} · ...while "${x}" stays green`, !broke(s, x));
    t(`arm ${a.id} · the suite reached its foot (${s.pass} pass, ${s.fail} fail)`, s.foot);
    t(`arm ${a.id} · the red is not collateral ("${COLLATERAL}" stays green)`, !broke(s, COLLATERAL));
    console.log(`    ACTUAL: ${s.failed.length} failing assertion(s): ${s.failed.map((l) => l.slice(0, 70)).join(" | ")}`);
  }
  if (!restore(a.id)) { console.log("** a restore did not verify; stopping before the next arm measures an unsound tree"); process.exit(1); }
}

console.log("\n--- CLOSING · every arm restored ---");
{
  const s = await runSuite();
  t(`closing · the suite is GREEN again, so no arm leaked (${s.pass} pass, ${s.fail} fail)`, s.foot && s.fail === 0 && s.code === 0);
  t(`closing · tools/pushguard.mjs is the pristine file (sha256 ${DIGEST.slice(0, 12)}…)`, sha(fs.readFileSync(GUARD)) === DIGEST);
}
t(`the arm tally held: ${armsRun} run of ${selected.length} selected${ONLY ? "" : ` · ${DECLARED_ARMS} declared`}`, armsRun === selected.length && (ONLY || armsRun === DECLARED_ARMS));
console.log(`\npushguard.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
