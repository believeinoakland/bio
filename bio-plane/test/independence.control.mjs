/* D-271 — THE NEGATIVE-CONTROL DRIVER for `test/independence.test.mjs`.
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS A REAL SOURCE while it runs, and the
 * battery must not discover it (`versionstate.control.mjs`'s precedent).
 *
 * THE RULES THIS HARNESS IS BUILT TO, each one a receipt this repository paid for:
 *   - Each arm is armed ALONE with every other defence held OPEN. An arm set that
 *     broke everything at once would prove only that the block exists.
 *   - Every arm's expected failure is DECLARED IN THE SUITE HEADER BEFORE it runs,
 *     and where the declaration turned out wrong that is reported as a finding
 *     about the ARM rather than smoothed away.
 *   - The anchor must occur EXACTLY ONCE and the bytes must REALLY CHANGE. An arm
 *     that never armed is a finding, and three have shipped here looking green.
 *   - Every restore is verified by sha256 AND by CONTENT (`cmp`-equivalent) against
 *     a per-arm UNIQUELY-NAMED pristine copy, with the byte count printed and a
 *     minimum guarded. Two harnesses once reported a restore byte-identical over an
 *     EMPTY manifest, caught only because a digest read `e3b0c442…`.
 *   - A BASELINE row runs FIRST AND LAST. Without it, a harness reporting the same
 *     number for every arm cannot be told from every-arm-broken.
 *   - The pen lives INSIDE THIS WORKTREE. A shared scratchpad silently substituted
 *     another session's file for one worker's on 2026-08-09.
 *   - It DISARMS on signals and on an uncaught throw: a control stopped from
 *     outside mid-arm once left a real source ARMED.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const TARGET = join(ROOT, "src", "store.mjs");
const PEN = join(ROOT, ".d271-harness", "pen");
const SUITE = join(DIR, "independence.test.mjs");

const sha = (b) => createHash("sha256").update(b).digest("hex");
mkdirSync(PEN, { recursive: true });

const ORIGINAL = readFileSync(TARGET);
const ORIGINAL_SHA = sha(ORIGINAL);
if (ORIGINAL.length < 100000)
  throw new Error(`REFUSING TO RUN: ${TARGET} is ${ORIGINAL.length} bytes, below the guarded minimum. `
    + `A pristine copy of the wrong thing is how a restore gets verified against nothing.`);
console.log(`PRISTINE  ${TARGET}\n          ${ORIGINAL.length} bytes · sha256 ${ORIGINAL_SHA}`);

let armed = false;
const disarm = () => {
  if (!armed) return;
  writeFileSync(TARGET, ORIGINAL);
  armed = false;
  console.log("DISARMED (signal or throw) — source restored from the in-memory pristine copy.");
};
for (const s of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(s, () => { disarm(); process.exit(130); });
process.on("uncaughtException", (e) => { disarm(); console.error(e); process.exit(1); });

/* Run the suite and report its tally. `-1` for a missing tally, NEVER 0: a
   TypeError inside an assertion goes through no assertion at all and ends the
   module while the count reads clean, so a suite that did not reach its own FOOT
   must be distinguishable from one that passed nothing. */
const runSuite = () => {
  let out = "", code = 0;
  try {
    out = execFileSync(process.execPath, [SUITE], { cwd: ROOT, encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    out = `${e.stdout ?? ""}${e.stderr ?? ""}`;
    code = e.status ?? 1;
  }
  const m = out.match(/independence:\s+(\d+)\s+pass,\s+(\d+)\s+fail/);
  const named = [...out.matchAll(/^\s*FAIL\s+(ARM [A-Z]\d+[a-z]?|[^\n]{0,60})/gm)].map((x) => x[1].trim());
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, code, reachedFoot: !!m, named };
};

const arms = [
  { id: 0, name: "BASELINE — armed with nothing",
    declared: "nothing fails; this row is what distinguishes six-arms-broken from six-arms-working",
    from: null, to: null },

  { id: 1, name: "DROP THE PUBLICATION",
    declared: "A1 A2 A3 A4 A5 B1 B3 B4 C1 fail; B2 C2 D1 stay GREEN (the write gate is a separate mechanism)",
    from: `      independence: this.#independenceOf(legRows,
        new Set(legRows.map((l) => String(l.ground ?? "").trim()).filter(Boolean)).size),\n`,
    to: `` },

  { id: 2, name: "REPLAY THE WRITE INSTEAD OF RECOMPUTING",
    declared: "B3 MUST fail — this is the arm the item exists for; A1 A2 A3 A5 B1 fail with it; D1 GREEN",
    from: `      independence: this.#independenceOf(legRows,
        new Set(legRows.map((l) => String(l.ground ?? "").trim()).filter(Boolean)).size),`,
    to: `      independence: { checked: true, parts: 0, shared: [], complete: true, limit: 200 },` },

  { id: 3, name: "COLLAPSE `checked` INTO A CONSTANT",
    declared: "A2 and A3 fail; every other arm GREEN",
    from: `    const checked = parts > 1;`,
    to: `    const checked = true;` },

  { id: 4, name: "COLLAPSE `complete` FROM null TO true",
    declared: "A3 ALONE fails",
    from: `    return { checked, parts, shared, complete: checked ? complete : null, limit: OMAX };`,
    to: `    return { checked, parts, shared, complete: checked ? complete : true, limit: OMAX };` },

  { id: 5, name: "BREAK THE ONE IMPLEMENTATION — a second, inlined origin walk",
    declared: "C1 MUST fail on the definition/call/walk counts; B2 and D1 fail too, because a drifted "
      + "second walk stops refusing",
    from: `    const ind = this.#independenceOf(walkLegs, declaredLabels.length);`,
    to: `    const ind = (() => {
      for (const l of walkLegs) {
        for (const r of this.#rows(\`SELECT capture_sha FROM register WHERE bundle_id=? LIMIT ?\`, l.target_id, 201))
          this.#rows(\`SELECT address_norm FROM captured_locators WHERE capture_sha=? LIMIT ?\`, r.capture_sha, 201);
      }
      return { checked: declaredLabels.length > 1, parts: declaredLabels.length,
               shared: [], complete: true, limit: 200 };
    })();` },

  { id: 6, name: "OVER-STRICTNESS — report a shared origin between any two parts",
    declared: "B1 MUST fail (correct work reported as sharing). Without this arm every other arm is "
      + "satisfied by a function that always answers `shared`",
    from: `          const common = [...originSets[i][1]].filter((o) => originSets[j][1].has(o));`,
    to: `          const common = ["bundle:manufactured"];` },
];

const results = [];
for (const arm of arms) {
  const pristine = join(PEN, `arm${arm.id}-store.mjs`);
  writeFileSync(pristine, ORIGINAL);
  const pristineSha = sha(readFileSync(pristine));
  if (pristineSha !== ORIGINAL_SHA)
    throw new Error(`ARM ${arm.id}: pristine copy does not match the original before arming.`);

  let src = ORIGINAL.toString("utf8");
  let reallyArmed = false;
  if (arm.from !== null) {
    const hits = src.split(arm.from).length - 1;
    if (hits !== 1) {
      console.log(`\nARM ${arm.id} ${arm.name}\n  NEVER ARMED: anchor occurred ${hits} times, expected exactly 1. `
        + `AN ARM THAT DID NOT ARM IS A FINDING, not a pass.`);
      results.push({ ...arm, status: `NEVER ARMED (anchor x${hits})`, pass: -1, fail: -1 });
      rmSync(pristine, { force: true });
      continue;
    }
    const next = src.replace(arm.from, arm.to);
    if (next === src) {
      console.log(`\nARM ${arm.id} ${arm.name}\n  NEVER ARMED: bytes did not change.`);
      results.push({ ...arm, status: "NEVER ARMED (no byte change)", pass: -1, fail: -1 });
      rmSync(pristine, { force: true });
      continue;
    }
    src = next;
    writeFileSync(TARGET, src);
    armed = true;
    reallyArmed = true;
  }

  console.log(`\nARM ${arm.id} ${arm.name}`);
  console.log(`  DECLARED: ${arm.declared}`);
  if (reallyArmed)
    console.log(`  ARMED: ${Buffer.byteLength(src)} bytes · sha256 ${sha(Buffer.from(src))} (was ${ORIGINAL_SHA})`);

  const r = runSuite();
  console.log(`  ACTUAL: exit ${r.code} · ${r.pass} pass, ${r.fail} fail`
    + `${r.reachedFoot ? "" : "  <-- SUITE DID NOT REACH ITS FOOT: tally reported as -1, never 0"}`);
  if (r.named.length) console.log(`  FAILED: ${r.named.join(" | ")}`);
  results.push({ ...arm, status: reallyArmed ? "armed" : "baseline", ...r });

  /* RESTORE, then verify BY HASH AND BY CONTENT against this arm's own copy. */
  writeFileSync(TARGET, ORIGINAL);
  armed = false;
  const back = readFileSync(TARGET), keep = readFileSync(pristine);
  const byHash = sha(back) === ORIGINAL_SHA;
  const byContent = Buffer.compare(back, keep) === 0;
  console.log(`  RESTORED: ${back.length} bytes · sha256 ${byHash ? "MATCH" : "MISMATCH"}`
    + ` · content ${byContent ? "IDENTICAL" : "DIFFERS"} (vs ${pristine.split("/").pop()})`);
  if (!byHash || !byContent || back.length < 100000)
    throw new Error(`ARM ${arm.id}: RESTORE NOT PROVEN — hash ${byHash}, content ${byContent}, `
      + `${back.length} bytes. Stopping with the pen intact so the state is inspectable.`);
  rmSync(pristine, { force: true });
}

/* THE CLOSING BASELINE. */
console.log(`\nCLOSING BASELINE (the source is restored; this must equal ARM 0)`);
const closing = runSuite();
console.log(`  ${closing.pass} pass, ${closing.fail} fail · exit ${closing.code}`);

console.log(`\n================ D-271 CONTROL SUMMARY ================`);
for (const r of results)
  console.log(`  ARM ${r.id}  ${String(r.pass).padStart(3)} pass / ${String(r.fail).padStart(2)} fail  `
    + `${r.status === "armed" || r.status === "baseline" ? "" : r.status + "  "}${r.name}`);
console.log(`  CLOSING BASELINE  ${closing.pass} pass / ${closing.fail} fail`);
const opening = results.find((r) => r.id === 0);
console.log(opening && closing.pass === opening.pass && closing.fail === opening.fail
  ? `  OPENING AND CLOSING BASELINES AGREE — the tree this control leaves behind is the one it found.`
  : `  *** BASELINES DISAGREE: opening ${opening?.pass}/${opening?.fail}, closing ${closing.pass}/${closing.fail}. ***`);

try { rmSync(PEN, { recursive: true, force: true }); } catch { /* leave it: an inspectable pen beats a hidden failure */ }
if (existsSync(PEN)) console.log(`  NOTE: pen retained at ${PEN}`);
