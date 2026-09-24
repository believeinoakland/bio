/* REC-192's NEGATIVE CONTROL for test/partitionindependence.test.mjs. Run from bio-plane/:
 *   node test/nc-rec192.mjs
 * Each arm patches src/store.mjs ALONE, runs the suite, and restores from a UNIQUELY-NAMED per-arm pristine
 * copy kept inside this worktree, verified by sha256 AND by content (cmp), with the byte count printed and a
 * minimum guarded. An arm whose patch anchor does not occur exactly once is reported as NOT ARMED. */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STORE = join(ROOT, "src", "store.mjs");
const PEN = join(ROOT, ".nc-rec192");
mkdirSync(PEN, { recursive: true });
const sha = (b) => createHash("sha256").update(b).digest("hex");
const ORIG = readFileSync(STORE);
if (ORIG.length < 1_000_000) throw new Error(`store.mjs is ${ORIG.length} bytes — not the subject`);
const ORIG_SHA = sha(ORIG);
console.log(`subject src/store.mjs ${ORIG.length} bytes sha256 ${ORIG_SHA}`);

const run = () => {
  const r = spawnSync(process.execPath, ["test/partitionindependence.test.mjs"], { cwd: ROOT, encoding: "utf8", timeout: 600000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const failed = [...out.matchAll(/^  FAIL  (ARM [A-Z]\d|WITNESS|FIXTURE|BLOCK DIED)/gm)].map((m) => m[1]);
  const foot = out.match(/partitionindependence: (\d+) pass, (\d+) fail/);
  return { exit: r.status, pass: foot ? +foot[1] : -1, fail: foot ? +foot[2] : -1, failed };
};

const ARMS = [
  { name: "strength-field",
    /* THE ROW'S OWN CONTROL: a strength field on the version-arm answer. */
    from: "      head = { version: row.name, version_state: row.state, legs_read: legs.length,\n",
    to: "      head = { pair: { capture: null, connection: null, testimony: null },\n               version: row.name, version_state: row.state, legs_read: legs.length,\n",
    mustFail: ["ARM H2", "ARM H3"],
    mustPass: ["ARM H0", "ARM H1", "ARM H4", "ARM H5", "ARM H6", "ARM H7", "ARM H8", "ARM D1", "ARM D2", "ARM E1"] },
  { name: "state-gated",
    /* OVER-STRICT: versionstrength's default state set borrowed onto the version arm — a reading not yet
       accepted is refused as if absent, which is exactly the reading the accept ceremony asks about. */
    from: "      if (!row)\n        return refusal(\"PARTITION_INDEPENDENCE_NO_SUCH_VERSION\",",
    to: "      if (!row || row.state !== \"accepted\")\n        return refusal(\"PARTITION_INDEPENDENCE_NO_SUCH_VERSION\",",
    mustFail: ["ARM H1", "ARM H3", "ARM H4", "ARM H5"],
    mustPass: ["ARM H0", "ARM H2", "ARM H6", "ARM H7", "ARM H8", "ARM D1", "ARM D2", "ARM E1"] },
];

const rows = [];
const base0 = run();
console.log(`(0) BASELINE first: exit ${base0.exit}, ${base0.pass} pass, ${base0.fail} fail`);
rows.push(["baseline-first", base0.pass, base0.fail, base0.failed.join(" "), base0.fail === 0 && base0.pass > 0 ? "AS DECLARED" : "NOT AS DECLARED"]);
for (const arm of ARMS) {
  const pristine = join(PEN, `store.pristine.${arm.name}.mjs`);
  copyFileSync(STORE, pristine);
  const src = ORIG.toString("utf8");
  const n = src.split(arm.from).length - 1;
  if (n !== 1) { rows.push([arm.name, "-", "-", `NOT ARMED (anchor occurs ${n}x)`, "NOT ARMED"]); continue; }
  writeFileSync(STORE, src.replace(arm.from, arm.to));
  let r;
  try { r = run(); }
  finally {
    copyFileSync(pristine, STORE);
    const back = readFileSync(STORE);
    const cmp = spawnSync("cmp", [STORE, pristine]).status;
    if (sha(back) !== ORIG_SHA || cmp !== 0 || back.length !== ORIG.length)
      throw new Error(`RESTORE FAILED after ${arm.name}: sha ${sha(back)} cmp ${cmp}`);
    console.log(`    restored ${back.length} bytes, sha256 ${sha(back).slice(0, 16)}… == pristine, cmp 0`);
  }
  const missing = arm.mustFail.filter((a) => !r.failed.includes(a));
  const broke = arm.mustPass.filter((a) => r.failed.includes(a));
  const verdict = !missing.length && !broke.length ? "AS DECLARED" : `NOT AS DECLARED (missing ${missing.join(",") || "-"}; broke ${broke.join(",") || "-"})`;
  console.log(`(${arm.name}) exit ${r.exit}, ${r.pass} pass, ${r.fail} fail: ${r.failed.join(" ")} -> ${verdict}`);
  rows.push([arm.name, r.pass, r.fail, r.failed.join(" "), verdict]);
}
const base1 = run();
console.log(`(0) BASELINE last: exit ${base1.exit}, ${base1.pass} pass, ${base1.fail} fail`);
rows.push(["baseline-last", base1.pass, base1.fail, base1.failed.join(" "), base1.fail === 0 && base1.pass > 0 ? "AS DECLARED" : "NOT AS DECLARED"]);
console.log("\nRESULTS");
for (const r of rows) console.log(`  ${r[0]}: ${r[1]} pass / ${r[2]} fail  [${r[3]}]  ${r[4]}`);
const ok = rows.every((r) => r[4] === "AS DECLARED");
console.log(`nc-rec192: ${ok ? "ALL ARMS AS DECLARED" : "SOME ARM NOT AS DECLARED"}`);
process.exit(ok ? 0 : 1);
