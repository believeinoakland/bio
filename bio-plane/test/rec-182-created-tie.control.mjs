/* REC-182 — the negative-control arms for `rec-182-created-tie.test.mjs`,
 * committed so the next session RE-RUNS them in one step.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS src/store.mjs while it runs, so the
 * battery must not discover it (`retirement.control.mjs` set the precedent).
 *
 *   node test/rec-182-created-tie.control.mjs            baseline, then each arm ALONE
 *
 * ARMS, each DECLARED before it runs:
 *   export  `exportManifest`'s promotions read drops `, rowid` (the defect at site 1).
 *           MUST FAIL: §1. MUST HOLD: §2, §3.
 *   gate    `gateFacts`' manifest read drops `, rowid` (the defect at site 2).
 *           MUST FAIL: §2. MUST HOLD: §1, §3.
 *
 * Every restore is verified by sha256 AND by a byte compare against a uniquely named per-arm
 * pristine copy kept INSIDE this worktree, and the pristine copy's size is printed and floored. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { anchorTable } from "../scripts/anchortable.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const WORK = join(PLANE, "..");
const SNAP = join(WORK, ".rec-182-control");
const STORE = join(PLANE, "src/store.mjs");
const SUITE = join(HERE, "rec-182-created-tie.test.mjs");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const EXPORT_SITE = "FROM manifest WHERE bundle_id=? ORDER BY created, rowid`, b.bundle_id),";
const GATE_SITE = "FROM manifest WHERE bundle_id=? ORDER BY created, rowid`, bundleId),";
const ARMS = {
  export: {
    from: EXPORT_SITE, to: EXPORT_SITE.replace("ORDER BY created, rowid", "ORDER BY created"),
    mustFail: ["§1 op=export returns"],
    mustHold: ["§2 the gate's facts", "§3 I-20 says"],
  },
  gate: {
    from: GATE_SITE, to: GATE_SITE.replace("ORDER BY created, rowid", "ORDER BY created"),
    mustFail: ["§2 the gate's facts"],
    mustHold: ["§1 op=export returns", "§3 I-20 says"],
  },
};

function runSuite() {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8" }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? 1; }
  const foot = /rec-182-created-tie: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]);
  return { code, foot: foot ? { pass: +foot[1], fail: +foot[2] } : null, failed };
}

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).map(([arm, a]) => ({ arm, file: STORE, find: a.from, put: a.to })));

let bad = 0;
const base = runSuite();
console.log(`baseline: exit ${base.code} · ${base.foot ? `${base.foot.pass} pass / ${base.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
if (base.code !== 0 || !base.foot || base.foot.fail || base.foot.pass < 7) { console.log("baseline is not green; no arm can mean anything"); process.exit(2); }

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
console.log(`\nrec-182 control: ${bad ? `${bad} arm(s) NOT as declared` : "every arm AS DECLARED"}`);
process.exit(bad ? 1 : 0);
