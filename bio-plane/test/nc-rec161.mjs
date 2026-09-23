/* REC-161's NEGATIVE CONTROL for test/partitionindependence.test.mjs. Run from bio-plane/:
 *   node test/nc-rec161.mjs
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
const PEN = join(ROOT, ".nc-rec161");
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
  { name: "second-derivation",
    /* A copy of the walk that agrees on bundles and captures and OMITS the address branch. */
    from: "      independence: this.#independenceOf(legs, new Set(legs.map((l) => l.ground)).size),\n",
    to: `      independence: (() => {
        const by = new Map();
        for (const l of legs) { if (!by.has(l.ground)) by.set(l.ground, new Set()); const s = by.get(l.ground);
          s.add("bundle:" + l.target_id);
          for (const c of this.sql.exec("SELECT capture_sha FROM register WHERE bundle_id=? LIMIT 201", l.target_id).toArray())
            s.add("capture:" + c.capture_sha); }
        const e = [...by]; const shared = [];
        if (e.length > 1) for (let i = 0; i < e.length; i++) for (let j = i + 1; j < e.length; j++) {
          const common = [...e[i][1]].filter((o) => e[j][1].has(o));
          if (common.length) shared.push({ a: e[i][0], b: e[j][0], through: common.slice(0, 5) }); }
        return { checked: e.length > 1, parts: e.length, shared, complete: e.length > 1 ? true : null, limit: 200 };
      })(),\n`,
    mustFail: ["ARM D2", "ARM E1"], mustPass: ["ARM A1", "ARM B1", "ARM C1", "ARM D1"] },
  { name: "overstrict",
    from: "          if (common.length)\n            shared.push({ a: originSets[i][0], b: originSets[j][0], through: common.slice(0, 5) });\n",
    to: "          if (true)\n            shared.push({ a: originSets[i][0], b: originSets[j][0], through: common.slice(0, 5) });\n",
    mustFail: ["ARM B1", "ARM B2", "ARM D1"], mustPass: ["ARM A1", "ARM C1", "ARM E1", "ARM F4"] },
  { name: "no-totality",
    from: "    if (unplaced.length)\n      return refusal(\"PARTITION_INDEPENDENCE_NOT_TOTAL\",",
    to: "    if (false)\n      return refusal(\"PARTITION_INDEPENDENCE_NOT_TOTAL\",",
    mustFail: ["ARM F4"], mustPass: ["ARM A1", "ARM B1", "ARM C1", "ARM D1", "ARM D2", "ARM E1", "ARM F5", "ARM F6"] },
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
console.log(`nc-rec161: ${ok ? "ALL ARMS AS DECLARED" : "SOME ARM NOT AS DECLARED"}`);
process.exit(ok ? 0 : 1);
