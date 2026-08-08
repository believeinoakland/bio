#!/usr/bin/env node
/* REC-74's NEGATIVE-CONTROL HARNESS. Lives in THIS WORKTREE and nowhere shared.
 *
 * Deliberately NOT a `.test.mjs`: `scripts/battery.mjs` discovers
 * `.endsWith(".test.mjs")` and nothing else, and this script EDITS REAL SOURCES
 * while it runs. PL-2's `versionstate.control.mjs` is the precedent.
 *
 * FOUR RULES, EACH BOUGHT WITH SOMEBODY'S TIME:
 *
 *   1. THE HARNESS IS INSIDE THE WORKTREE IT MUTATES. On 2026-08-07 a worker's
 *      harness was overwritten mid-turn by another running worker, and a harness
 *      silently replaced between ARM and RESTORE reports a restore it never
 *      performed.
 *   2. EVERY SNAPSHOT IS NAMED UNIQUELY PER ARM. A harness hours before this one
 *      took two snapshots of one file, named both from the PATH ALONE, and the
 *      second overwrote the first — so its outer check compared a correctly
 *      restored original against patched bytes. The snapshot name here carries
 *      the ARM NUMBER and a nonce.
 *   3. EVERY RESTORE IS VERIFIED THREE WAYS: sha256, an in-memory byte
 *      comparison, and `cmp` against the uniquely-named on-disk snapshot. `cmp`
 *      caught what sha256 could not.
 *   4. EVERY ARM PROVES ITS ANCHOR IS UNIQUE AND THAT THE BYTES CHANGED before
 *      any suite runs. An arm that NEVER ARMED reports a finding that is really
 *      the green underneath it.
 *
 *   node test/run-conditions.control.mjs            every arm  (from bio-plane/)
 *   node test/run-conditions.control.mjs 2 4        only these arm numbers
 *
 * ---------------------------------------------------------------------------
 * MEASURED 2026-08-08, rec74-run-conditions. Clean tree: run-conditions 51 pass
 * 0 fail. Every arm below was RUN ALONE with every other defence held OPEN.
 * The per-arm results are printed by the script and are quoted in the suite's
 * own `NEGATIVE CONTROL:` header.
 * ------------------------------------------------------------------------- */
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PLANE = join(dirname(fileURLToPath(import.meta.url)), "..");
const sha = (s) => createHash("sha256").update(s).digest("hex");

const runSuite = (name) => {
  const r = spawnSync(process.execPath, [join("test", `${name}.test.mjs`)],
    { cwd: PLANE, encoding: "utf8", timeout: 900_000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = [...out.matchAll(/(\d+)\s+pass,\s+(\d+)\s+fail/g)].pop();
  const fails = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((x) => x[1].trim().slice(0, 120));
  /* A MISSING TALLY IS REPORTED AS -1 AND NEVER AS 0. An arm that KILLS a suite
     rather than failing it reads `0 pass, 0 fail` and looks like a clean sweep;
     `-1` is what makes the difference visible. */
  return { code: r.status, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, fails };
};

/* A CONTROL KILLED FROM OUTSIDE LEAVES THE TREE ARMED, AND THAT HAPPENED HERE.
 * On 2026-08-08 this harness was stopped mid-arm-1 while the suite it drives was
 * hanging on an undisposed Miniflare; the `finally` never ran, `src/store.mjs`
 * was left carrying `NC-REC74-ARM1`, and only the uniquely-named snapshot made
 * the recovery PROVABLE (`cmp` against it, and the restored sha matched the
 * `ARMED:` line's own before-hash). The snapshot is what saved it, so the rule
 * about naming it uniquely is not bookkeeping. These handlers close the window
 * rather than relying on it. */
const ARMED_NOW = new Map();                                    // path -> original bytes
const disarmAll = () => {
  for (const [p, bytes] of ARMED_NOW) { try { writeFileSync(p, bytes); } catch { /* best effort */ } }
  ARMED_NOW.clear();
};
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(sig, () => { console.log(`\n*** ${sig} — disarming before exit ***`); disarmAll(); process.exit(130); });
process.on("uncaughtException", (e) => { console.log(`\n*** uncaught: ${e && e.message} — disarming ***`); disarmAll(); process.exit(2); });

const arm = ({ n, what, file, from, to, marker, suites, expect }) => {
  const path = join(PLANE, file);
  const before = readFileSync(path, "utf8");
  const beforeSha = sha(before);
  /* THE UNIQUELY NAMED SNAPSHOT — arm number AND a nonce, so two arms over one
     file can never name the same copy. */
  const snap = join(PLANE, `.nc-rec74-arm${n}-${randomBytes(4).toString("hex")}.snapshot`);
  writeFileSync(snap, before);

  console.log(`\n=== ARM ${n}: ${what}`);
  const hits = before.split(from).length - 1;
  if (hits !== 1) {
    console.log(`  ABORTED: anchor occurs ${hits} times in ${file}, must be exactly 1 — `
              + `AN ARM THAT NEVER ARMED IS NOT A FINDING, it is the green underneath it`);
    unlinkSync(snap); return false;
  }
  const after = before.replace(from, to);
  if (after === before) { console.log("  ABORTED: replacement changed no bytes"); unlinkSync(snap); return false; }
  writeFileSync(path, after);
  const check = readFileSync(path, "utf8");
  if (sha(check) === beforeSha || !check.includes(marker)) {
    writeFileSync(path, before);
    console.log("  ABORTED: the mutation did not land on disk"); unlinkSync(snap); return false;
  }
  ARMED_NOW.set(path, before);
  console.log(`  ARMED: ${file} ${beforeSha.slice(0, 12)} -> ${sha(check).slice(0, 12)} · snapshot ${snap.split("/").pop()}`);

  const results = {};
  try {
    for (const s of suites) {
      const r = runSuite(s);
      results[s] = r;
      console.log(`  ${s}: exit ${r.code}, ${r.pass} pass, ${r.fail} fail`);
      /* EVERY failure printed, never a head. A control that truncates its own
         list invites its header to be written from a guess about the rest. */
      for (const f of r.fails) console.log(`      FAILED: ${f}`);
    }
  } finally {
    writeFileSync(path, before);
    ARMED_NOW.delete(path);
    const back = readFileSync(path, "utf8");
    const okSha = sha(back) === beforeSha;
    const okContent = back === before && !back.includes(marker);
    const c = spawnSync("cmp", [path, snap], { encoding: "utf8" });
    const okCmp = c.status === 0;
    console.log(`  RESTORED: sha256 ${okSha ? "OK" : "MISMATCH"} · content ${okContent ? "OK (byte-identical AND the mutation is gone)" : "MISMATCH"} · cmp ${okCmp ? "OK" : `MISMATCH (${(c.stdout || c.stderr || "").trim()})`}`);
    if (!okSha || !okContent || !okCmp) { console.log("  *** RESTORE FAILED — STOP ***"); process.exit(2); }
    unlinkSync(snap);
  }
  const verdict = expect(results);
  console.log(`  VERDICT: ${verdict ? "the control FAILED the suite, as required" : "*** THE SUITE STAYED GREEN — the control proves nothing ***"}`);
  return verdict;
};

const named = (r, re) => r.fails.some((f) => re.test(f));

const ARMS = [
  /* (1) DROP THE NEW PUBLICATION. The item's own subject, removed. */
  { n: 1, what: "DROP THE PUBLICATION — `op=airun` stops publishing the run's third condition, which "
              + "is exactly what it did before this item",
    file: "src/store.mjs",
    from: "      standard: this.#standardForRun(row),\n    } };",
    to:   "      /* NC-REC74-ARM1 */\n    } };",
    marker: "NC-REC74-ARM1",
    suites: ["run-conditions"],
    expect: (r) => r["run-conditions"].fail > 0
      && named(r["run-conditions"], /ARM T1|ARM T2/)
      && named(r["run-conditions"], /ARM P2|BLOCK T DIED|BLOCK A DIED/) },

  /* (2) THE ARM THIS ITEM EXISTS FOR. */
  { n: 2, what: "PUBLISH THE ABSENT CASE AS AN INDISTINGUISHABLE NULL — the key is present and says "
              + "nothing, which is the shape the item was written to prevent",
    file: "src/store.mjs",
    from: "      pair: basis === \"recorded\" ? { capture, connection } : null,",
    to:   "      pair: basis === \"recorded\" ? { capture, connection } : null,\n"
        + "      basis: basis === \"recorded\" ? basis : null, /* NC-REC74-ARM2 */\n"
        + "      stated: basis === \"recorded\" ? STANDARD_BASIS[basis] : null,",
    marker: "NC-REC74-ARM2",
    suites: ["run-conditions"],
    /* THE ARM PASSES ONLY IF THE CONSUMER ARMS ARE THE ONES THAT FAIL. A
       failure anywhere would not do: the claim is that a CONSUMER can no longer
       tell the absences apart, so ARM C2 and ARM C5 are what must go red. */
    expect: (r) => r["run-conditions"].fail > 0
      && named(r["run-conditions"], /ARM C2|ARM C5/) },

  /* (3) NEUTER THE WALK. */
  { n: 3, what: "NEUTER THE STORED-VS-PUBLISHED WALK — the reader scan finds nothing, and REACH must "
              + "fail AS A DELTA with the corpus size printed rather than sweeping an empty corpus",
    file: "test/run-conditions.test.mjs",
    from: "    if (/FROM\\s+ai_runs/.test(body)) hits.push(marks[i].name);",
    to:   "    if (false && /FROM\\s+ai_runs/.test(body)) hits.push(marks[i].name); /* NC-REC74-ARM3 */",
    marker: "NC-REC74-ARM3",
    suites: ["run-conditions"],
    expect: (r) => r["run-conditions"].fail > 0
      && named(r["run-conditions"], /ARM W2/) && named(r["run-conditions"], /ARM W4/) },

  /* (4) LOSE DEC-17's DISTINCTION. The over-strictness direction is driven
     IN-SUITE (ARM A3/A3b — a projectless run must READ CLEANLY and must not be
     refused); this is its opposite number, and it is the arm that proves the
     two absences are told apart by the code rather than by the fixture. */
  { n: 4, what: "COLLAPSE THE TWO ABSENCES — a projectless run reports `none-recorded` like any other, "
              + "losing DEC-17's *an inquiry outside any project has no bar*",
    file: "src/store.mjs",
    from: "      : row.context_type === \"project\" ? \"none-recorded\"\n      : \"context-has-no-project\";",
    to:   "      : \"none-recorded\"; /* NC-REC74-ARM4 */",
    marker: "NC-REC74-ARM4",
    suites: ["run-conditions"],
    expect: (r) => r["run-conditions"].fail > 0
      && named(r["run-conditions"], /ARM A3\b|ARM A3:/) && named(r["run-conditions"], /ARM C2|ARM C5/) },

  /* (5) POLARITY, on the branch that costs nothing to get wrong. */
  { n: 5, what: "ACCEPT A BAR THAT NAMES NEITHER AXIS AS A REAL BAR — PL-4's class: a value that "
              + "survives a falsiness guard while naming nothing reads as PRESENT and travels",
    file: "src/store.mjs",
    from: "      : parsed !== null ? (capture === null && connection === null ? \"names-no-axis\" : \"recorded\")",
    to:   "      : parsed !== null ? \"recorded\" /* NC-REC74-ARM5 */",
    marker: "NC-REC74-ARM5",
    suites: ["run-conditions"],
    expect: (r) => r["run-conditions"].fail > 0
      && named(r["run-conditions"], /ARM A4/) && named(r["run-conditions"], /ARM A7|ARM A9/) },
];

const want = process.argv.slice(2).map(Number).filter((n) => Number.isFinite(n));
const chosen = want.length ? ARMS.filter((a) => want.includes(a.n)) : ARMS;
console.log(`REC-74 negative controls — running ${chosen.length} of ${ARMS.length} arm(s), each ALONE`);
let ok = 0;
for (const a of chosen) if (arm(a)) ok++;
console.log(`\n${ok}/${chosen.length} arms behaved as declared.`);
process.exitCode = ok === chosen.length ? 0 : 1;
