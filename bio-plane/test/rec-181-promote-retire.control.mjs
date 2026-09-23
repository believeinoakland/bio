/* REC-181 — the negative-control arms for `rec-181-promote-retire.test.mjs`,
 * committed so the next session RE-RUNS them in one step.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS src/store.mjs while it runs, so the
 * battery must not discover it (`retirement.control.mjs` set the precedent).
 *
 *   node test/rec-181-promote-retire.control.mjs            baseline, then each arm ALONE
 *
 * ARMS, each DECLARED before it runs:
 *   skip        promote's transition check is skipped (`if (false && citedBy.length)`).
 *               MUST FAIL: §1's "op=promote moving a CASE-CITED verified item INTO retired is refused CITED",
 *               §2's question-leg arm, §3's same-refusal arm. MUST HOLD: §4's three landing arms.
 *   overstrict  promote refuses EVERY transition into retired (`if (true || citedBy.length)`).
 *               MUST FAIL: §4's uncited arm and §4's severed arm. MUST HOLD: §1, §2, §3.
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
const SNAP = join(WORK, ".rec-181-control");
const STORE = join(PLANE, "src/store.mjs");
const SUITE = join(HERE, "rec-181-promote-retire.test.mjs");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const SITE = `        if (citedBy.length)\n          return { ok: false, reason: "CITED", to: "retired", offenders: [{ id: bundleId, citedBy }],`;
const ARMS = {
  skip: {
    from: SITE, to: SITE.replace("if (citedBy.length)", "if (false && citedBy.length)"),
    mustFail: ["§1 op=promote moving a CASE-CITED", "§2 op=promote moving an item a QUESTION", "§3 op=retire over the same item"],
    mustHold: ["§4 an UNCITED", "§4 an EDIT", "§4 an item whose only edge is SEVERED"],
  },
  overstrict: {
    from: SITE, to: SITE.replace("if (citedBy.length)", "if (true || citedBy.length)"),
    mustFail: ["§4 an UNCITED", "§4 an item whose only edge is SEVERED"],
    mustHold: ["§1 op=promote moving a CASE-CITED", "§2 op=promote moving an item a QUESTION", "§3 op=retire over the same item"],
  },
};

function runSuite() {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8" }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? 1; }
  const foot = /rec-181-promote-retire: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]);
  return { code, foot: foot ? { pass: +foot[1], fail: +foot[2] } : null, failed };
}

let bad = 0;
const base = runSuite();
console.log(`baseline: exit ${base.code} · ${base.foot ? `${base.foot.pass} pass / ${base.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
if (base.code !== 0 || !base.foot || base.foot.fail || base.foot.pass < 12) { console.log("baseline is not green; no arm can mean anything"); process.exit(2); }

for (const [arm, a] of Object.entries(ARMS)) {
  mkdirSync(SNAP, { recursive: true });
  const bytes = readFileSync(STORE);
  if (bytes.length < 1_000_000) { console.log(`REFUSING: store.mjs is ${bytes.length} bytes`); process.exit(2); }
  const dest = join(SNAP, `${arm}--src_store.mjs.pristine`);
  writeFileSync(dest, bytes);
  console.log(`\narm ${arm}: pristine src/store.mjs ${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 12)}…`);
  const text = bytes.toString("latin1");
  const n = text.split(a.from).length - 1;
  if (n !== 1) { console.log(`  ARM DID NOT ARM: anchor matched ${n} times`); bad++; continue; }
  writeFileSync(STORE, Buffer.from(text.replace(a.from, a.to), "latin1"));
  let r;
  try { r = runSuite(); }
  finally {
    writeFileSync(STORE, bytes);
    const now = readFileSync(STORE), pristine = readFileSync(dest);
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
console.log(`\nrec-181 control: ${bad ? `${bad} arm(s) NOT as declared` : "every arm AS DECLARED"}`);
process.exit(bad ? 1 : 0);
