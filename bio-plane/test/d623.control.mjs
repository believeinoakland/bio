/* D-623 — the negative-control arms for `d266scope.test.mjs`'s two `D-623 SITE` assertions, committed so the
 * next session RE-RUNS them in one step.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS src/ and checks/ while it runs, so the battery must not discover it
 * (`rec-183-reinstate-retired.control.mjs` set the precedent).
 *
 *   node test/d623.control.mjs        baseline, then each arm ALONE
 *
 * THE SUBJECT: `op=proposedispose` refuses NO_PROJECT_SCOPE at two sites — a `{finding}` with no `project`
 * (SITE 1) and IC-60's `key` bridge (SITE 2) — and both now answer with DEC-49's code, check and canned
 * translation through ONE helper, `actNoProjectScope`.
 *
 * TWO INSTRUMENTS, AND WHY BOTH. (op) `d266scope.test.mjs`, which drives the op. (guard) the DEC-49 guard,
 * `civicos-ui/check-refusal-codes.mjs --strict`. THE FIRST RUN (2026-09-25) DECLARED `strip`, `site1raw` and
 * `site2raw` against the OP ALONE and all three came back GREEN — the arms were right and the declarations
 * were wrong: D-262's `dec49Attach` (index.mjs, `json()`) fills `code`, `check` and `translation` from the
 * catalogue row ON THE WAY OUT whenever a refusal lacks them, so once the ROW exists the wire carries the
 * sentence whatever the site wrote. Through the op, only the ROW is observable. The SITE's shape is the
 * guard's subject, and its arm G names a second literal mint site. Declarations below are the corrected ones.
 *
 * ARMS, each DECLARED before it runs:
 *
 *   rowempty   THE ROW'S NEGATIVE CONTROL — the CATALOGUE row's translation is stripped (emptied), so the
 *              helper THROWS (DEC-49: a code with no sentence must not reach a member). op MUST FAIL: SITE 1 and
 *              SITE 2 by name. op MUST HOLD: NO_FINDING, whose refusal does not pass through the helper.
 *              guard MUST FAIL.
 *   site1raw   SITE 1 alone goes back to a raw literal refusal with no code, check or sentence, the pre-D-623
 *              shape. op MUST HOLD everything (the wire decoration covers it). guard MUST FAIL, arm G naming
 *              NO_PROJECT_SCOPE at 2 literal sites.
 *   site2raw   SITE 2 alone, the same.
 *   strip      the helper stops sending `translation` itself. MEASURED INVISIBLE TO BOTH instruments, and
 *              HARMLESS: the member still receives the row's sentence through D-262's decoration, which never
 *              overwrites and never invents. Kept as a declared no-effect arm so that a future change making it
 *              visible (the decoration removed) is noticed. op MUST HOLD everything; guard MUST PASS.
 *   reword     OVER-STRICTNESS: the catalogue's sentence is reworded. The suite compares against the
 *              catalogue's row, never a copy of its words, so NOTHING may fail on either instrument.
 *
 * Every restore is verified by sha256 AND by a byte compare against a uniquely named per-arm pristine copy, and
 * the pristine copy's size is printed and floored. The pen is `controlPen("d623")` (M0-182), outside the tree.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { controlPen } from "./pen.mjs";
const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const STORE = join(PLANE, "src/store.mjs");
const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const SUITE = join(HERE, "d266scope.test.mjs");
const GUARD = join(PLANE, "..", "civicos-ui", "check-refusal-codes.mjs");
const SNAP = controlPen("d623");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const SITE1 = "D-623 SITE 1", SITE2 = "D-623 SITE 2";
const R1 = "a finding named with NO PROJECT", R2 = "a PRE-IC-60 SURFACE's", NOF = "a project named with NO FINDING";
const RAW = `((detail, extra) => ({ ok: false, reason: "NO_PROJECT_SCOPE", detail, ...extra }))(`;
const ROW_TR = `    translation: 'Setting this finding aside is a decision for one project\\'s own list, not for the '`;

const ALL = [SITE1, SITE2, R1, R2, NOF];
const ARMS = {
  rowempty: { file: CHECKS, floor: 500_000,
    from: ROW_TR, to: `    translation: '' && 'x'`,
    mustFail: [SITE1, SITE2], mustHold: [NOF], guardFails: /NO_PROJECT_SCOPE/ },
  site1raw: { file: STORE, floor: 1_000_000,
    from: `if (scoped && !proj) return actNoProjectScope(`, to: `if (scoped && !proj) return ${RAW}`,
    mustFail: [], mustHold: ALL, guardFails: /arm G: ACT_SHAPE_CHECKS\.NO_PROJECT_SCOPE is now minted at 2 literal sites/ },
  site2raw: { file: STORE, floor: 1_000_000,
    from: `      return actNoProjectScope(\n               "this names a FINDING`,
    to: `      return ${RAW}\n               "this names a FINDING`,
    mustFail: [], mustHold: ALL, guardFails: /arm G: ACT_SHAPE_CHECKS\.NO_PROJECT_SCOPE is now minted at 2 literal sites/ },
  strip: { file: STORE, floor: 1_000_000,
    from: `  return { ok: false, reason: "NO_PROJECT_SCOPE", code: "NO_PROJECT_SCOPE", check: row.check,\n`
        + `           translation: row.translation, detail, ...extra };`,
    to: `  return { ok: false, reason: "NO_PROJECT_SCOPE", code: "NO_PROJECT_SCOPE", check: row.check,\n`
      + `           detail, ...extra };`,
    mustFail: [], mustHold: ALL, guardFails: null },
  reword: { file: CHECKS, floor: 500_000,
    from: ROW_TR, to: `    translation: 'Reworded, correctly: dismissing or deferring this is one project\\'s own call, not the whole record\\'s '`,
    mustFail: [], mustHold: ALL, guardFails: null },
};

function runGuard() {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [GUARD, "--strict"], { cwd: join(PLANE, ".."), encoding: "utf8" }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? 1; }
  const foot = /^check-refusal-codes: /m.test(out);
  return { code, foot, fails: out.split("\n").filter((l) => l.startsWith("FAIL")) };
}

function runSuite() {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8" }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? 1; }
  const foot = /d266scope: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]);
  return { code, foot: foot ? { pass: +foot[1], fail: +foot[2] } : null, failed };
}

let bad = 0;
const base = runSuite();
console.log(`baseline: exit ${base.code} · ${base.foot ? `${base.foot.pass} pass / ${base.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
/* THE BASELINE ROW EXISTS SO A RUN WITH EVERY ARM BROKEN IS DISTINGUISHABLE FROM ONE WITH EVERY ARM WORKING. */
const gbase = runGuard();
console.log(`baseline guard: exit ${gbase.code} · ${gbase.foot ? "foot reached" : "UNREACHED-FOOT"} · ${gbase.fails.length} FAIL line(s)`);
if (base.code !== 0 || !base.foot || base.foot.fail || base.foot.pass < 40 || gbase.code !== 0 || !gbase.foot) {
  console.log("baseline is not green (op >= 40 pass, guard exit 0); no arm can mean anything"); process.exit(2);
}

for (const [arm, a] of Object.entries(ARMS)) {
  const bytes = readFileSync(a.file);
  const what = a.file === STORE ? "src/store.mjs" : "checks/bio-checks.mjs";
  if (bytes.length < a.floor) { console.log(`REFUSING: ${what} is ${bytes.length} bytes`); process.exit(2); }
  const dest = join(SNAP, `${arm}--${a.file === STORE ? "src_store" : "checks_bio-checks"}.mjs.pristine`);
  writeFileSync(dest, bytes);
  console.log(`\narm ${arm}: pristine ${what} ${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 12)}…`);
  const text = bytes.toString("latin1");
  const n = text.split(a.from).length - 1;
  if (n !== 1) { console.log(`  ARM DID NOT ARM: anchor matched ${n} times`); bad++; continue; }
  writeFileSync(a.file, Buffer.from(text.replace(a.from, () => a.to), "latin1"));
  let r, g;
  try { r = runSuite(); g = runGuard(); }
  finally {
    writeFileSync(a.file, bytes);
    const now = readFileSync(a.file), pristine = readFileSync(dest);
    const eq = sha(now) === sha(pristine) && now.equals(pristine);
    console.log(`  restored: sha256 ${eq ? "EQUAL" : "**DIFFERENT**"} ${sha(now).slice(0, 12)}… · byte compare ${now.equals(pristine) ? "IDENTICAL" : "**DIFFERS**"} · ${now.length} B`);
    if (!eq) process.exit(2);
  }
  console.log(`  result: exit ${r.code} · ${r.foot ? `${r.foot.pass} pass / ${r.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
  for (const f of r.failed) console.log(`    failed: ${f.split("\n")[0].slice(0, 110)}`);
  const hit = (p) => r.failed.some((f) => f.startsWith(p));
  const missing = a.mustFail.filter((p) => !hit(p)), leaked = a.mustHold.filter(hit);
  console.log(`  guard: exit ${g.code} · ${g.foot ? "foot reached" : "UNREACHED-FOOT"}`);
  for (const f of g.fails) console.log(`    guard ${f.slice(0, 130)}`);
  const guardOk = a.guardFails ? (g.code !== 0 && g.fails.some((f) => a.guardFails.test(f)))
                               : (g.code === 0 && g.foot);
  const ok = r.foot && !missing.length && !leaked.length && guardOk;
  console.log(`  verdict: ${ok ? "AS DECLARED" : "NOT AS DECLARED"}${missing.length ? ` · did not fail: ${missing.join(" | ")}` : ""}`
    + `${leaked.length ? ` · failed but must hold: ${leaked.join(" | ")}` : ""}`
    + `${guardOk ? "" : ` · guard ${a.guardFails ? "did not fail as declared" : "failed but must pass"}`}`);
  if (!ok) bad++;
}
rmSync(SNAP, { recursive: true, force: true });
console.log(`\nd623 control: ${bad ? `${bad} arm(s) NOT as declared` : "every arm AS DECLARED"}`);
process.exit(bad ? 1 : 0);
