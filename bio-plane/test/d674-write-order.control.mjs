/* D-674 — the negative-control arms for `d674-write-order.test.mjs`,
 * committed so the next session RE-RUNS them in one step.
 *
 * Deliberately NOT a `.test.mjs`: it EDITS src/store.mjs while it runs, so the
 * battery must not discover it (`retirement.control.mjs` set the precedent).
 *
 *   node test/d674-write-order.control.mjs            baseline, then each arm ALONE
 *
 * ARMS, each DECLARED before it runs. Each of the first five puts ONE reader back on the writer's date:
 *   export     exportManifest's promotions `ORDER BY rowid` -> `ORDER BY created, rowid`.  MUST FAIL §1; MUST HOLD §2..§6.
 *   gate       gateFacts' manifest `ORDER BY rowid` -> `ORDER BY created, rowid`.          MUST FAIL §2; MUST HOLD §1, §3..§6.
 *   revision   #revisionKind `ORDER BY rowid DESC` -> `ORDER BY created DESC, rowid DESC`. MUST FAIL §3; MUST HOLD §1, §2, §4..§6.
 *   latest     the unattended condition's latest, the same.                               MUST FAIL §4; MUST HOLD §1..§3, §5, §6.
 *   started    the unattended condition's started `ORDER BY rowid` -> `ORDER BY created, rowid`. MUST FAIL §5; MUST HOLD §1..§4, §6.
 *   clock      the OTHER fix, the plane's clock stamped into manifest.created at both promote INSERTs.
 *              MUST FAIL §6 (created stops being the writer's date C-12.1 compares against); MUST HOLD §1..§5.
 *   spelling   OVER-STRICTNESS: export's `ORDER BY rowid` spelled `ORDER BY _rowid_` (SQLite's alias, the same order).
 *              MUST FAIL nothing.
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
const STORE = join(PLANE, "src/store.mjs");
const SUITE = join(HERE, "d674-write-order.test.mjs");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const EXPORT_SITE = "FROM manifest WHERE bundle_id=? ORDER BY rowid`, b.bundle_id),";
const GATE_SITE = "FROM manifest WHERE bundle_id=? ORDER BY rowid`, bundleId),";
const REVISION_SITE = "`SELECT writer, operation FROM manifest WHERE bundle_id=? ORDER BY rowid DESC LIMIT 1`";
const LATEST_SITE = "WHERE bundle_id=? ORDER BY rowid DESC LIMIT 1`, b.bundle_id);";
const STARTED_SITE = "ORDER BY rowid LIMIT 1`, b.bundle_id, machine);";
const CLOCK_SITE = "meta.last_updated || new Date().toISOString(),\n          JSON.stringify(files.map(";
const ALL = ["§1 ", "§2 ", "§3 ", "§4 ", "§5 ", "§6 "];
const but = (...fail) => ALL.filter((p) => !fail.includes(p));
/* `n` is how many times the anchor must match: the clock arm edits BOTH promote INSERTs (creation and revision). */
const ARMS = {
  export:   { from: EXPORT_SITE, to: EXPORT_SITE.replace("ORDER BY rowid", "ORDER BY created, rowid"), mustFail: ["§1 "], mustHold: but("§1 ") },
  gate:     { from: GATE_SITE, to: GATE_SITE.replace("ORDER BY rowid", "ORDER BY created, rowid"), mustFail: ["§2 "], mustHold: but("§2 ") },
  revision: { from: REVISION_SITE, to: REVISION_SITE.replace("ORDER BY rowid DESC", "ORDER BY created DESC, rowid DESC"), mustFail: ["§3 "], mustHold: but("§3 ") },
  latest:   { from: LATEST_SITE, to: LATEST_SITE.replace("ORDER BY rowid DESC", "ORDER BY created DESC, rowid DESC"), mustFail: ["§4 "], mustHold: but("§4 ") },
  started:  { from: STARTED_SITE, to: STARTED_SITE.replace("ORDER BY rowid", "ORDER BY created, rowid"), mustFail: ["§5 "], mustHold: but("§5 ") },
  clock:    { from: CLOCK_SITE, to: CLOCK_SITE.replace("meta.last_updated || new Date().toISOString()", "new Date().toISOString()"), n: 2,
              mustFail: ["§6 "], mustHold: but("§6 ") },
  spelling: { from: EXPORT_SITE, to: EXPORT_SITE.replace("ORDER BY rowid", "ORDER BY _rowid_"), mustFail: [], mustHold: ALL },
};

function runSuite() {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8" }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? 1; }
  const foot = /d674-write-order: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]);
  return { code, foot: foot ? { pass: +foot[1], fail: +foot[2] } : null, failed };
}

let bad = 0;
const base = runSuite();
console.log(`baseline: exit ${base.code} · ${base.foot ? `${base.foot.pass} pass / ${base.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
if (base.code !== 0 || !base.foot || base.foot.fail || base.foot.pass < 13) { console.log("baseline is not green; no arm can mean anything"); process.exit(2); }

const PEN = controlPen("d674");
for (const [arm, a] of Object.entries(ARMS)) {
  const bytes = readFileSync(STORE);
  if (bytes.length < 1_000_000) { console.log(`REFUSING: store.mjs is ${bytes.length} bytes`); process.exit(2); }
  const dest = join(PEN, `${arm}--src_store.mjs.pristine`);
  writeFileSync(dest, bytes);
  console.log(`\narm ${arm}: pristine src/store.mjs ${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 12)}…`);
  const text = bytes.toString("latin1");
  const n = text.split(a.from).length - 1;
  if (n !== (a.n ?? 1)) { console.log(`  ARM DID NOT ARM: anchor matched ${n} times, want ${a.n ?? 1}`); bad++; continue; }
  writeFileSync(STORE, Buffer.from(text.split(a.from).join(a.to), "latin1"));
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
console.log(`\nd674 control: ${bad ? `${bad} arm(s) NOT as declared` : "every arm AS DECLARED"}`);
process.exit(bad ? 1 : 0);
