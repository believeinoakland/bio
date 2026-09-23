/* REC-183 — the negative-control arms for `rec-183-reinstate-retired.test.mjs`,
 * committed so the next session RE-RUNS them in one step.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS src/ while it runs, so the battery
 * must not discover it (`rec-181-promote-retire.control.mjs` set the precedent).
 *
 *   node test/rec-183-reinstate-retired.control.mjs         baseline, then each arm ALONE
 *
 * ARMS, each DECLARED before it runs:
 *   skip        #edgeTransition's retired check is dropped (`if (false && retiredMembers.length)`).
 *               MUST FAIL: §1's member, machine, mixed and nothing-landed arms, and §2's "edge onto RET is STILL
 *               severed" (corrected — see the arm). MUST HOLD: §2's live and removed-source landings.
 *   overstrict  every reinstate is refused (`if (true || retiredMembers.length)`).
 *               MUST FAIL: §2's live and removed-source arms. MUST HOLD: §1's member, machine and mixed arms.
 *   preflight   src/affordances.mjs offers `reinstate` on a retired item again.
 *               MUST FAIL: §3. MUST HOLD: §1, §2.
 *
 * Every restore is verified by sha256 AND by a byte compare against a uniquely named per-arm
 * pristine copy kept INSIDE this worktree, and the pristine copy's size is printed and floored. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const WORK = join(PLANE, "..");
const SNAP = join(WORK, ".rec-183-control");
const STORE = join(PLANE, "src/store.mjs");
const AFF = join(PLANE, "src/affordances.mjs");
const SUITE = join(HERE, "rec-183-reinstate-retired.test.mjs");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const SITE = `      if (retiredMembers.length)\n        return { ok: false, reason: "RETIRED_NOT_CITABLE", code: "RETIRED_NOT_CITABLE",`;
const PRE = `&& !(ty === "information" && f.current_state === "retired"))`;
const S1 = ["§1 MEMBER: reinstating", "§1 MACHINE CREDENTIAL", "§1 A MIXED SELECTION"];
const S2 = ["§2 a LIVE target reinstates", "§2 ... and its edge is confirmed", "§2 a `source_status: removed`", "§2 ... and the edge onto RET"];
const ARMS = {
  skip: {
    file: STORE, floor: 1_000_000, from: SITE, to: SITE.replace("if (retiredMembers.length)", "if (false && retiredMembers.length)"),
    /* DECLARATION CORRECTED 2026-09-23 after the first run: §2's "edge onto RET is STILL severed" was declared
       to HOLD and failed — correctly, since with no check §1's member reinstate lands RET's edge. The arm was
       right and the declaration was wrong. */
    mustFail: [...S1, "§1 ... and nothing landed", "§2 ... and the edge onto RET"], mustHold: S2.slice(0, 3),
  },
  overstrict: {
    file: STORE, floor: 1_000_000, from: SITE, to: SITE.replace("if (retiredMembers.length)", "if (true || retiredMembers.length)"),
    mustFail: ["§2 a LIVE target reinstates", "§2 a `source_status: removed`"], mustHold: S1,
  },
  preflight: {
    file: AFF, floor: 100_000, from: PRE, to: ")",
    mustFail: ["§3 op=affordances"], mustHold: [...S1, ...S2],
  },
};

function runSuite() {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8" }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? 1; }
  const foot = /rec-183-reinstate-retired: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]);
  return { code, foot: foot ? { pass: +foot[1], fail: +foot[2] } : null, failed };
}

let bad = 0;
const base = runSuite();
console.log(`baseline: exit ${base.code} · ${base.foot ? `${base.foot.pass} pass / ${base.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
if (base.code !== 0 || !base.foot || base.foot.fail || base.foot.pass < 14) { console.log("baseline is not green; no arm can mean anything"); process.exit(2); }

for (const [arm, a] of Object.entries(ARMS)) {
  mkdirSync(SNAP, { recursive: true });
  const bytes = readFileSync(a.file);
  if (bytes.length < a.floor) { console.log(`REFUSING: ${a.file} is ${bytes.length} bytes`); process.exit(2); }
  const dest = join(SNAP, `${arm}--${a.file === STORE ? "src_store" : "src_affordances"}.mjs.pristine`);
  writeFileSync(dest, bytes);
  console.log(`\narm ${arm}: pristine ${a.file === STORE ? "src/store.mjs" : "src/affordances.mjs"} ${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 12)}…`);
  const text = bytes.toString("latin1");
  const n = text.split(a.from).length - 1;
  if (n !== 1) { console.log(`  ARM DID NOT ARM: anchor matched ${n} times`); bad++; continue; }
  writeFileSync(a.file, Buffer.from(text.replace(a.from, a.to), "latin1"));
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
rmSync(SNAP, { recursive: true, force: true });
console.log(`\nrec-183 control: ${bad ? `${bad} arm(s) NOT as declared` : "every arm AS DECLARED"}`);
process.exit(bad ? 1 : 0);
