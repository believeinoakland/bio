#!/usr/bin/env node
/* M0-107's NEGATIVE CONTROL DRIVER — 7 arms plus a baseline — over the budget verdict: `test/budget.mjs`,
 * `scripts/battery.mjs`, `scripts/budgetsweep.mjs` and the row's first site in `test/owed-controls.test.mjs`.
 *
 *   node bio-plane/test/m0107-budget.control.mjs          (from anywhere; one arm: add its id, e.g. B1)
 *
 * ARM TALLY DECLARED: 7 (asserted at the foot). Every arm is armed ALONE against a pristine copy kept in
 * `.m0107-harness/` (which ignores itself), restored by sha256 AND `cmp` AND a floored byte count — never
 * `git checkout --`. An exit hook restores an armed file on EVERY exit. No arm touches a ref, a remote or any
 * file but its one subject. Each arm declares BEFORE it runs what MUST fail and what MUST NOT, and asserts the
 * DOWNSTREAM failure, never merely its patch count (M-60 Q9).
 *
 *   B1  THE ROW'S OWN CONTROL: a 1 ms budget on     -> owed-controls fails `A13-budget` BY NAME and NO finding:
 *       owed-controls' `--strict` spawn (A13)          A13 and A13b are absent from its failures, its tally is
 *                                                      one fail; through the battery it reads NOTM, exit 124.
 *   B2  the NOT MEASURED rule removed from the     -> battery-verdict fails "(4a) a suite whose ONE failure…"
 *       runner (every marked suite read as before)     and the planted-hang arm (4c). MUST NOT: section 1's liar.
 *   B3  the runner's pid filter removed            -> "(4b) a CHILD's echoed marker … launders nothing" FAILS.
 *                                                      MUST NOT: (4a).
 *   B4  `expired()` also takes a set SIGNAL         -> "(4b) a subject dead by its OWN SIGTERM is a FINDING"
 *       (M0-103's "or the signal is set")              FAILS. MUST NOT: (4c), the planted hang.
 *   B5  the sweep's check widened to "any           -> budget-sweep "(s5) a budgetAssert naming a DIFFERENT
 *       budgetAssert in the file" (the liar)           binding…" FAILS. MUST NOT: (s2), (s4).
 *   B6  the sweep reads RAW source, not code        -> budget-sweep "(s4) a `timeout:` in a COMMENT or a
 *                                                      STRING is not a site" FAILS. MUST NOT: (s1), (s2).
 *   B7  owed-controls' A13 check pointed at the     -> budget-sweep "no suite site in the gate is UNCHECKED"
 *       WRONG binding (`realRun`)                      FAILS. MUST NOT: the scratch arms (s1)-(s7).
 */
import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DECLARED_ARMS = 7;
const PLANE = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPO = join(PLANE, "..");
const PEN = join(REPO, ".m0107-harness");
const F = {
  owed: join(PLANE, "test/owed-controls.test.mjs"),
  battery: join(PLANE, "scripts/battery.mjs"),
  budget: join(PLANE, "test/budget.mjs"),
  sweep: join(PLANE, "scripts/budgetsweep.mjs"),
};
const ONLY = process.argv.slice(2).filter((a) => /^B\d+$/.test(a));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (b) => createHash("sha256").update(b).digest("hex");
mkdirSync(PEN, { recursive: true });
if (!existsSync(join(PEN, ".gitignore"))) writeFileSync(join(PEN, ".gitignore"), "*\n");

/* The pristine copies, by name, with their hashes and a byte floor. */
const pristine = {};
for (const [k, p] of Object.entries(F)) {
  const b = readFileSync(p);
  if (b.length < 2000) throw new Error(`pristine ${k} is ${b.length} bytes — under the 2,000-byte floor`);
  const copy = join(PEN, `pristine-${k}`);
  writeFileSync(copy, b);
  pristine[k] = { path: p, copy, sha: sha(b), bytes: b.length };
  console.log(`  pristine ${k}: ${b.length} B sha256 ${sha(b).slice(0, 12)}…`);
}
let armedKey = null;
const restore = (k) => {
  const p = pristine[k];
  writeFileSync(p.path, readFileSync(p.copy));
  const now = readFileSync(p.path);
  const same = sha(now) === p.sha && Buffer.compare(now, readFileSync(p.copy)) === 0 && now.length === p.bytes;
  return same;
};
process.on("exit", () => {
  if (armedKey) restore(armedKey);
  for (const p of Object.values(pristine)) { try { unlinkSync(p.copy); } catch { /* gone */ } }
});
for (const [sig, code] of [["SIGINT", 130], ["SIGTERM", 143], ["SIGHUP", 129]]) process.on(sig, () => process.exit(code));

const arm = (k, from, to) => {
  const src = readFileSync(F[k], "utf8");
  const hits = src.split(from).length - 1;
  if (hits === 1) { armedKey = k; writeFileSync(F[k], src.replace(from, to)); }
  return hits;
};
const run = (args, cwd = PLANE) => {
  const r = spawnSync(process.execPath, args, { cwd, encoding: "utf8", timeout: 600_000, env: { ...process.env, BIO_BATTERY_VERDICT: "" } });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const failed = [...out.matchAll(/^\s*FAIL:?\s+(.+)$/gm)].map((m) => m[1]);
  const tally = out.match(/(\d+) pass, (\d+) fail\s*$/m);
  return { out, status: r.status, failed, tally: tally ? [+tally[1], +tally[2]] : null, expired: !!(r.error && r.error.code === "ETIMEDOUT") };
};
const broke = (s, label) => s.failed.some((f) => f.startsWith(label));

const ARMS = [
  { id: "B1", key: "owed", from: "A13_BUDGET_MS = 120_000", to: "A13_BUDGET_MS = 1",
    check: () => {
      const s = run(["test/owed-controls.test.mjs"]);
      console.log(`  armed owed-controls: ${s.tally} · failed: ${s.failed.join(" | ") || "(none)"}`);
      t("B1 · owed-controls fails its A13 BUDGET assertion by name", broke(s, "A13-budget"), true);
      t("B1 · ...and NO finding: neither A13 nor A13b fails, and it is the ONLY failure",
        [s.failed.some((f) => /^A13b? /.test(f)), s.failed.length, s.tally && s.tally[1]], [false, 1, 1]);
      t("B1 · ...and it printed ONE marker, with its own pid", (s.out.match(/^TIMEOUT \(M0-107\) \[pid \d+\]: A13-budget/gm) || []).length, 1);
      const b = run(["scripts/battery.mjs", "owed-controls"]);
      t("B1 · through the battery it reads NOT MEASURED, and the run exits 124 — no RED",
        [/^  NOTM  owed-controls\.test\.mjs/m.test(b.out), b.status, /^  FAILED:/m.test(b.out)], [true, 124, false]);
    } },
  { id: "B2", key: "battery", from: "  const notMeasured = timeouts.length > 0 &&", to: "  const notMeasured = false && timeouts.length > 0 &&",
    suite: "test/battery-verdict.test.mjs",
    mustBreak: ["(4a) a suite whose ONE failure is its own marked expiry reads NOTM", "(4c) a planted hang is NAMED"],
    mustNotBreak: ["THE LIAR: a suite printing `3 pass, 2 fail` and exiting 0 is RED"] },
  { id: "B3", key: "battery", from: "  .filter((m) => Number(m[1]) === pid)", to: "  .filter(() => true)",
    suite: "test/battery-verdict.test.mjs",
    mustBreak: ["(4b) a CHILD's echoed marker (another pid) launders nothing"],
    mustNotBreak: ["(4a) a suite whose ONE failure is its own marked expiry reads NOTM"] },
  { id: "B4", key: "budget", from: `r.code === "ETIMEDOUT"));`, to: `r.code === "ETIMEDOUT" || r.signal));`,
    suite: "test/battery-verdict.test.mjs",
    mustBreak: ["(4b) a subject dead by its OWN SIGTERM is a FINDING"],
    mustNotBreak: ["(4c) a planted hang is NAMED"] },
  { id: "B5", key: "sweep", from: "          const chk = checkOf(code, m.index, name);",
    to: "          const chk = /budgetAssert\\s*\\(/.test(code) ? { how: \"budgetAssert\", at: 0 } : null;",
    suite: "test/budget-sweep.test.mjs",
    mustBreak: ["(s5) a budgetAssert naming a DIFFERENT binding leaves the site UNCHECKED"],
    mustNotBreak: ["(s2) a spawn handed to budgetAssert", "(s4) a `timeout:` in a COMMENT"] },
  { id: "B6", key: "sweep", from: "    const code = stripToCode(src);", to: "    const code = src;",
    suite: "test/budget-sweep.test.mjs",
    mustBreak: ["(s4) a `timeout:` in a COMMENT or a STRING is not a site"],
    mustNotBreak: ["(s1) a spawn whose result is never checked", "(s2) a spawn handed to budgetAssert"] },
  { id: "B7", key: "owed", from: "run A13 and A13b read\", strictRun, A13_BUDGET_MS,", to: "run A13 and A13b read\", realRun, A13_BUDGET_MS,",
    suite: "test/budget-sweep.test.mjs",
    mustBreak: ["no suite site in the gate is UNCHECKED"],
    mustNotBreak: ["(s1) a spawn whose result is never checked", "(s5) a budgetAssert naming a DIFFERENT binding"] },
];
t(`the driver's arm table carries the ${DECLARED_ARMS} arms its head declares`, ARMS.length, DECLARED_ARMS);

/* D-331: every anchor, counted and PRINTED before anything arms. */
console.log("\n--- PREFLIGHT · every arm's anchor, counted in the file it will write ---");
let dead = 0;
for (const a of ARMS) {
  const n = readFileSync(F[a.key], "utf8").split(a.from).length - 1;
  console.log(`  ${a.id}  ${a.key.padEnd(8)} ${n === 1 ? "live" : `DEAD (${n} matches)`}`);
  if (n !== 1 && (!ONLY.length || ONLY.includes(a.id))) dead++;
}
if (dead) { console.log(`\n${dead} anchor(s) not live — nothing armed.`); process.exit(2); }

console.log("\n--- BASELINE · nothing armed ---");
for (const suite of ["test/owed-controls.test.mjs", "test/battery-verdict.test.mjs", "test/budget-sweep.test.mjs"]) {
  const s = run([suite]);
  t(`baseline · ${suite} is GREEN`, [s.status, s.tally && s.tally[1]], [0, 0]);
  console.log(`  baseline ${suite}: ${s.tally}`);
}

let ran = 0;
for (const a of ARMS.filter((x) => !ONLY.length || ONLY.includes(x.id))) {
  console.log(`\n--- ARM ${a.id} (armed ALONE) ---`);
  const hits = arm(a.key, a.from, a.to);
  t(`${a.id} · the arm ARMED (its patch matched exactly once)`, hits, 1);
  if (a.check) a.check();
  else {
    const s = run([a.suite]);
    console.log(`  armed ${a.suite}: ${s.tally} · failed: ${s.failed.map((f) => f.slice(0, 70)).join(" | ") || "(none)"}`);
    for (const mb of a.mustBreak) t(`${a.id} · FAILS at "${mb.slice(0, 60)}…"`, broke(s, mb), true);
    for (const nb of a.mustNotBreak) t(`${a.id} · ...and "${nb.slice(0, 50)}…" does NOT fail`, broke(s, nb), false);
    t(`${a.id} · ...and the suite reached its foot (a tally printed)`, s.tally !== null, true);
  }
  t(`${a.id} · RESTORED byte-identically (sha256, cmp, bytes)`, restore(a.key), true);
  armedKey = null;
  ran++;
}

console.log("\n--- CLOSING · every arm restored ---");
for (const [k, p] of Object.entries(pristine)) t(`closing · ${k} is its pristine bytes`, sha(readFileSync(p.path)), p.sha);
if (!ONLY.length) t(`FOOT · ${ran} arms ran of the ${DECLARED_ARMS} declared`, ran, DECLARED_ARMS);
console.log(`\nm0107-budget.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
