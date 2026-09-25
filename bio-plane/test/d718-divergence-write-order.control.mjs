/* D-718 — the negative-control arms for `d718-divergence-write-order.test.mjs`,
 * committed so the next session RE-RUNS them in one step.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS checks/bio-checks.mjs while it runs, so the battery must not discover it
 * (`retirement.control.mjs` set the precedent).
 *
 *   node test/d718-divergence-write-order.control.mjs        baseline, then each arm ALONE
 *
 * ARMS, each DECLARED before it runs:
 *   key       the row's control: classifyDivergence's walk sorted by snap KEY again (its `order` still from
 *             historyWriteOrder, so only the walk moves). MUST FAIL §1, §2 and §4's sparse arm; MUST HOLD §3.
 *   silent    C-17.2's key-order fallback stops saying so. MUST FAIL §3; MUST HOLD §1, §2, §4.
 *   spelling  OVER-STRICTNESS: the says-so condition spelled `order !== 'write' && walked >= 2`. MUST FAIL nothing.
 *   compare   OVER-STRICTNESS: historyWriteOrder's seq comparator spelled as a three-way compare. MUST FAIL nothing.
 *
 * Every restore is verified by sha256 AND by a byte compare against a uniquely named per-arm pristine copy in the
 * item's pen (`controlPen`, outside the worktree, M0-182), and the pristine copy's size is printed and floored. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const SUITE = join(HERE, "d718-divergence-write-order.test.mjs");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const WALK_SITE = "const { order, entries } = historyWriteOrder(hist.entries);";
const SAY_SITE = "if (cls.order === 'key' && cls.walked > 1) {";
const SORT_SITE = "? { order: 'write', entries: [...list].sort((a, b) => a.seq - b.seq) }";
const ALL = ["§1 ", "§2 ", "§3 ", "§4 "];
const but = (...fail) => ALL.filter((p) => !fail.includes(p));
const ARMS = {
  key:      { file: CHECKS, from: WALK_SITE,
              to: "const { order } = historyWriteOrder(hist.entries); const entries = (Array.isArray(hist.entries) ? [...hist.entries] : []).sort((a, b) => a.key < b.key ? -1 : 1);",
              mustFail: ["§1 ", "§2 ", "§4 "], mustHold: but("§1 ", "§2 ", "§4 ") },
  silent:   { file: CHECKS, from: SAY_SITE, to: "if (false && cls.order === 'key' && cls.walked > 1) {",
              mustFail: ["§3 "], mustHold: but("§3 ") },
  spelling: { file: CHECKS, from: SAY_SITE, to: "if (cls.order !== 'write' && cls.walked >= 2) {",
              mustFail: [], mustHold: ALL },
  compare:  { file: CHECKS, from: SORT_SITE, to: "? { order: 'write', entries: [...list].sort((a, b) => (a.seq > b.seq) - (a.seq < b.seq)) }",
              mustFail: [], mustHold: ALL },
};

function runSuite() {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8" }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? 1; }
  const foot = /d718-divergence-write-order: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]);
  return { code, foot: foot ? { pass: +foot[1], fail: +foot[2] } : null, failed };
}

let bad = 0;
const base = runSuite();
console.log(`baseline: exit ${base.code} · ${base.foot ? `${base.foot.pass} pass / ${base.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
if (base.code !== 0 || !base.foot || base.foot.fail || base.foot.pass < 13) { console.log("baseline is not green; no arm can mean anything"); process.exit(2); }

const PEN = controlPen("d718");
for (const [arm, a] of Object.entries(ARMS)) {
  const bytes = readFileSync(a.file);
  if (bytes.length < 500_000) { console.log(`REFUSING: ${a.file} is ${bytes.length} bytes`); process.exit(2); }
  const dest = join(PEN, `${arm}--${"checks_bio-checks"}.mjs.pristine`);
  writeFileSync(dest, bytes);
  console.log(`\narm ${arm}: pristine ${"checks/bio-checks.mjs"} ${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 12)}…`);
  const text = bytes.toString("latin1");
  const n = text.split(a.from).length - 1;
  if (n !== 1) { console.log(`  ARM DID NOT ARM: anchor matched ${n} times, want 1`); bad++; continue; }
  writeFileSync(a.file, Buffer.from(text.split(a.from).join(a.to), "latin1"));
  let r;
  try { r = runSuite(); }
  finally {
    writeFileSync(a.file, bytes);
    const now = readFileSync(a.file), pristine = readFileSync(dest);
    const eq = sha(now) === sha(pristine) && now.equals(pristine);
    console.log(`  restored: sha256 ${eq ? "EQUAL" : "**DIFFERENT**"} ${sha(now).slice(0, 12)}… · byte compare ${now.equals(pristine) ? "IDENTICAL" : "**DIFFERS**"}`);
    if (!eq) process.exit(2);
  }
  console.log(`  result: exit ${r.code} · ${r.foot ? `${r.foot.pass} pass / ${r.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
  for (const f of r.failed) console.log(`    failed: ${f.split("\n")[0].slice(0, 110)}`);
  const hit = (p) => r.failed.some((f) => f.startsWith(p));
  const missing = a.mustFail.filter((p) => !hit(p)), leaked = a.mustHold.filter(hit);
  const ok = r.foot && !missing.length && !leaked.length;
  console.log(`  verdict: ${ok ? "AS DECLARED" : "NOT AS DECLARED"}${missing.length ? ` · did not fail: ${missing.join(" | ")}` : ""}`
    + `${leaked.length ? ` · failed but must hold: ${leaked.join(" | ")}` : ""}`);
  if (!ok) bad++;
}
console.log(`\nd718 control: ${bad ? `${bad} arm(s) NOT as declared` : "every arm AS DECLARED"}`);
process.exit(bad ? 1 : 0);
