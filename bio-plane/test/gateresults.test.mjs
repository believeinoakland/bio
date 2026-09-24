/* M0-126 — THE SHARED, PER-SUITE, CONTENT-ADDRESSED RESULT RECORD (TREE-SHARING.md §3a). One file set
 * (`tools/gates.mjs`, `tools/gateresults.mjs`, `tools/gatetrace.mjs`, the `gate-results` arm of `tools/pushguard.mjs`),
 * one suite, one control (`gateresults.control.mjs`).
 *
 * NEGATIVE CONTROL (CONDUCT #16, 2026-09-23, at the merge with M0-127): `keyCauses` dropped from the step's `causes` in
 * tools/gates.mjs -> "...CAUSES line names it `underinclusion:`" and "...names it `history:`" FAIL (50/2); restored by
 * cp, sha256 e2a60e35… before and after; 52/0.
 * NEGATIVE CONTROL: RAN 2026-09-23 by the M0-126 worker, driver `bio-plane/test/gateresults.control.mjs` (fifteen arms
 * plus a baseline), each arm ALONE against pristine copies restored by sha256 AND `cmp` AND a byte floor (gates.mjs
 * da7f271d…, gateresults.mjs af22c33a…, pushguard.mjs 445bf093…, gates.yml ba431a6c…, each byte-identical after every arm);
 * baseline 50/0, closing 50/0, driver 95 pass / 0 fail. Each broke at its declared assertion: (R1) one `data/` input
 * dropped from every key -> "...and it names NO under-inclusion" and machine A RED (34/16); (R2) PASS ignored -> "...it
 * REUSED every cacheable unit" (36/14); (R3) key ignores inputs -> "a data file ONE suite reads: only that suite" (40/10);
 * (R4) never-cache ignored -> "a never-cached unit runs EVERY time" (39/11); (R5) revocation ignored -> "the next ordinary
 * gate RUNS beta (REVOKED…" (49/1); (R6) `--no-reuse` ignored -> "THE BACKSTOP catches it" (49/1); (R7) the guard lets a
 * record be MODIFIED -> "a record MODIFIED … is REFUSED" (49/1); (R8) the trace comparison off -> "...the failure NAMES
 * the unit and the file" (46/4); (R9) the plane runtime set dropped -> "a plane RUNTIME file: every plane and fleet unit
 * runs" (48/2); (R10) a declared read ignored -> "OVER-STRICTNESS: the read DECLARED" (49/1); (R11) the GitHub run back
 * on the derived class -> "the run on `main` gates EVERY unit" (49/1); (R12) a reusing run written as a backstop ->
 * "machine B's FULL runs … NEVER a backstop" (48/2); (R13) the backstop reader ignoring the steps -> "...the same record
 * with its class and flag EDITED … NOT a backstop" (49/1); (R14) a git-history read ignored -> "a suite that runs `git
 * log` … FAILS by name" (49/1); (R15) the tree-keyed GREEN shortcut taken with the record on -> "...a PLAIN gate on that
 * same GREEN tree still RUNS the never-cached unit" (49/1). The first run found ONE wrong declaration, the ARM's and not
 * the subject's: R4 said "...the rest are REUSED" must hold, and with the marker ignored the clock suite earns a PASS and
 * is reused too — corrected in the driver, said at its site.
 *
 * WHY A FIXTURE AND NEVER THIS REPOSITORY. `gate-results` on `origin` is SHARED state that every lane's gate reads: a
 * record this suite wrote there would be REUSED by a real gate. So every arm builds its own repositories under the
 * battery's temp ground — a bare `origin`, and CLONES of it that stand for two different machines (two git directories:
 * no D-293 record passes between them) — with the REAL four tools copied in and the REAL hook installed. The fixture's
 * battery is a small real runner: it RUNS each suite it is asked for (so the tracer sees real reads) and writes the
 * verdict file the gate reads (`passed`, `failed`). Every suite is real and tiny, and says it ran in the fixture log.
 *
 * HOW A LIAR PASSES THIS, STATED BEFORE WHAT IT CHECKS, and each is DRIVEN below:
 *   - a HAND-WRITTEN PASS record for a unit that is red. It is indistinguishable where it sits, and the ordinary gate
 *     REUSES it (asserted: the lie succeeds there — the record proves a procedure, never an actor). What catches it is
 *     the backstop, `--full --no-reuse` (every release cut; the GitHub run on `main`), which reads RED at that unit; the
 *     key is then REVOKED and the next ordinary gate runs the unit and names who wrote the lie.
 *   - an INPUT OMITTED from the key: a suite that reads a file through a path MENTION cannot see. Its PASS would be
 *     reused after that file changed. The trace catches the read, the unit FAILS by name, and no PASS is ever written
 *     for it; declaring the read (`GATE: reads <dir>/`) puts it in the key, and the unit then passes and records.
 *   - rewriting `gate-results` (a record MODIFIED, the branch DELETED): refused by the guard's append-only arm.
 *   - a reuse that ignores the inputs: the one-input-change arm re-runs exactly the unit whose key moved, and a plane
 *     runtime change re-runs every plane and fleet unit while the UI's are reused.
 */
/* NEGATIVE CONTROL: RAN 2026-09-24 by the M0-154 worker, by hand, over the DERIVED fixture copy list
 * (`test/gatedeps.mjs`). Declared before arming; each arm ALONE, the other three suites held open; every
 * restore by `cp` from a uniquely-named pristine copy, verified by sha256 AND `cmp` AND a byte count.
 *   BASELINE (this tree, before the arms): gateresults.test.mjs 52 pass / 0 fail.
 *   (A1) ACCEPTS-WHEN — `tools/m0154probe.mjs` added and imported by `tools/gates.mjs`. MUST NOT fail:
 *        all four suites GREEN, each fixture's printed `gatedeps:` list one file longer. ACTUAL: green
 *        (gates 96/0, gateresults 52/0, entries 59/0, train 53/0), every list carrying `tools/m0154probe.mjs`.
 *   (A2) THE CONTROL THE ROW NAMES — A1 still armed, and `gates.test.mjs`'s HAND copy list restored verbatim.
 *        MUST fail, BY NAME, at "the fixture carries the REAL … (DERIVED)". ACTUAL (in `gates.test.mjs`,
 *        the suite armed): 24 pass / 72 fail, that assertion first and naming the file —
 *        `want [true,true,true,[]] got [true,true,true,["tools/m0154probe.mjs"]]`.
 *   (A2') A FINDING ABOUT THE ARM, not smoothed: A2's FIRST run threw `ENOENT` out of the assertion and
 *        ended the module with NO TALLY AT ALL — a control that dies proves nothing (`kickoffs/WORKER.md`).
 *        `missingFrom` below is that correction; A2 as recorded is the re-run against it.
 *   (A3) OVER-STRICTNESS — the same import written three ways the derivation was not written against:
 *        `await import("./m0154probe.mjs")`, `export { … } from "./m0154reexport.mjs"`, and an
 *        `import … from "./m0154absent.mjs"` inside a COMMENT whose target EXISTS on disk. MUST pass, and
 *        MUST copy the first two and NOT the third. ACTUAL: exactly that; gates 96/0, entries 59/0.
 *   (A4) THE HELPER'S OWN REFUSALS, driven directly: a `without` naming a file outside the closure THROWS
 *        (a stale exclusion cannot outlive its import); a missing root THROWS; `const IMPORT_RE` renamed in
 *        a scratch copy of `tools/gates.mjs` THROWS naming the line. All three as declared.
 */
/* NEGATIVE CONTROL: RAN 2026-09-24 by the M0-179 worker, driver `bio-plane/test/gateresults.control.mjs` arms R16–R18,
 * each armed ALONE against pristine copies restored by `cp` and verified by sha256 AND `cmp` AND a floored byte count
 * (gates.mjs 3e2e0a9a… 93684 B, gateresults.mjs 88d66ce7… 22662 B, pushguard.mjs 54ac3096… 98150 B, gates.yml
 * 9392d638… 5206 B — byte-identical after every arm). BASELINE 67 pass / 0 fail (measured 52/0 on `origin/main`
 * e9b21be6, so the fifteen arms of this item are the whole delta); closing 67/0; driver 31 pass / 0 fail.
 *   (R16) THE ROW'S OWN — §3b's refusal of a non-descending tip removed, the tip PLANTED in the fixture: 63/4, at
 *         "the next gate REUSES NOTHING" and, declared after the corrected arm's first run, at the three assertions
 *         the restored reuse CARRIES (the teeth arm, the write arm, the does-not-heal arm).
 *   (R17) `descentOf` disarmed so every tip reads as descending: 62/5, at "descentOf names FOUR outcomes" and the four
 *         above. The over-strictness arm PASSES, as declared: a judgement that always says yes still reuses.
 *   (R18) OVER-STRICTNESS — the fence tightened to demand EQUALITY of tip and record: 65/2, at "OVER-STRICTNESS:
 *         another machine's ordinary APPEND" and at descentOf's four outcomes. The planted tip is still refused, so the
 *         arm proves the over-strictness assertion can SEE a fence tighter than its rule.
 *   TWO FINDINGS ABOUT THE ARMS, NOT THE SUBJECT, both recorded at their sites and neither smoothed:
 *   (i)   R16's FIRST run came back GREEN — 67/0 with the refusal removed. The planted tip held no record any of this
 *         clone's keys named, so `reused` was 0 whatever the gate decided, and the assertion was satisfied by the
 *         WRITER's refusal sentence appearing anywhere in the output. The plant now carries the tip's OWN TREE (so the
 *         descent is the only thing that can refuse it) and the assertion is anchored to the reuse arm's own line.
 *   (ii)  R18's `mustNotBreak` PASSED on a fragment that could no longer match any label, because the labels were
 *         reworded by (i). A stale `mustBreak` fails loudly; a stale `mustNotBreak` passes silently. The fragments are
 *         now the labels' stable middles. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { install, gateResultsCheck, readRuns, isBackstop } from "../../tools/pushguard.mjs";
import { appendRecords, resultPath, revokedPath, listPaths, descentOf, recordRef, descentHolds,
  DESCENT_REFUSED } from "../../tools/gateresults.mjs";
import { gateDeps } from "./gatedeps.mjs";     /* M0-154: the fixture's copy list is DERIVED, never kept by hand */

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");
/* M0-154 · WHAT THE FIXTURE CARRIES, DERIVED FROM `tools/gates.mjs`'s OWN IMPORTS, transitively, by the ONE
   shared helper — never a hand list here (D-93). This suite carries the whole closure, `tools/gateresults.mjs`
   included, since the per-unit record IS its subject. `tools/gatetrace.mjs` is an extra ROOT because no import
   names it: the gate hands it to a child through `NODE_OPTIONS --import=` at a path it computes, which is
   exactly the reach the helper states it cannot see. */
const GATE_DEPS = gateDeps({ repo: REPO, roots: ["tools/gates.mjs", "tools/gatetrace.mjs"] });
console.log(`gatedeps: gateresults.test.mjs fixture carries ${GATE_DEPS.length} derived file(s) — ${GATE_DEPS.join(", ")}`);
/* A FILE THE FIXTURE LACKS MUST FAIL AN ASSERTION, NEVER THROW PAST ONE. Found by this item's own control
   arm (M0-154, 2026-09-24): the first draft compared with a bare `readFileSync` on both sides, so a fixture
   missing a derived file ended the module with an ENOENT and NO TALLY AT ALL — a control that "fails" by
   dying proves nothing about the assertion, and `kickoffs/WORKER.md` records the same shape as a suite whose
   count reads clean. It reports the offending paths BY NAME instead. */
const missingFrom = (dir) => GATE_DEPS.filter((p) => {
  try { return !readFileSync(join(dir, p)).equals(readFileSync(join(REPO, p))); } catch { return true; }
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 11;
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "gateresults-"));
const LOG = join(SANDBOX, "ran.log");
const ID = ["-c", "user.email=m0126@example.invalid", "-c", "user.name=M0-126 suite"];
const git = (args, cwd, env) => spawnSync("git", args, { cwd, encoding: "utf8", env: env ? { ...process.env, ...env } : process.env });
const out1 = (args, cwd) => git(args, cwd).stdout.trim();

/* ------------------------------------------------------------------ the fixture */
const logRan = `import { appendFileSync } from "node:fs";\nexport const ran = (u) => { if (process.env.GATES_FIXTURE_LOG) appendFileSync(process.env.GATES_FIXTURE_LOG, "ran " + u + "\\n"); };\n`;
const stubLogged = (name) => `import { appendFileSync } from "node:fs";\nif (process.env.GATES_FIXTURE_LOG) appendFileSync(process.env.GATES_FIXTURE_LOG, "ran ${name}\\n");\nprocess.exit(0);\n`;
/* A small REAL battery: the real one's discovery and filter rule (a plane suite whose FILE NAME includes a filter, a
   fleet suite whose `<member>/<file>` label does), each suite RUN, the verdict file written with `passed` and `failed`. */
const BATTERY = `import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOP = join(ROOT, "..");
const filters = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const suites = [];
for (const f of readdirSync(join(ROOT, "test")).filter((f) => f.endsWith(".test.mjs")).sort())
  if (!filters.length || filters.some((x) => f.includes(x))) suites.push({ unit: "plane:" + f, cwd: ROOT, rel: join("test", f) });
for (const d of readdirSync(TOP).sort()) {
  let m; try { m = JSON.parse(readFileSync(join(TOP, d, "fleet-member.json"), "utf8")); } catch { continue; }
  const td = join(TOP, d, m.testDir || "test");
  for (const f of (existsSync(td) ? readdirSync(td) : []).filter((f) => f.endsWith(".test.mjs")).sort()) {
    const label = d + "/" + f;
    if (!filters.length || filters.some((x) => label.includes(x))) suites.push({ unit: "fleet:" + label, cwd: join(TOP, d), rel: join(m.testDir || "test", f) });
  }
}
const env = { ...process.env }; const vf = env.BIO_BATTERY_VERDICT; delete env.BIO_BATTERY_VERDICT;
const passed = [], failed = [];
for (const s of suites) { const r = spawnSync(process.execPath, [s.rel], { cwd: s.cwd, env, stdio: "inherit" }); (r.status === 0 ? passed : failed).push(s.unit); }
if (vf) writeFileSync(vf, JSON.stringify({ v: 1, verdict: failed.length ? "RED" : "GREEN", failed, passed, leaking: false, sharedLog: false, notMeasured: [] }));
console.log(passed.length + "/" + suites.length + " suites green");
process.exit(failed.length ? 1 : 0);
`;
const FILES = {
  "tools/plancheck.mjs": stubLogged("plancheck"),
  "tools/alpha.mjs": "export const alpha = () => 1;\n",
  "bio-plane/package.json": `${JSON.stringify({ name: "fixture-plane", private: true, type: "module", scripts: { "test:battery": "node scripts/battery.mjs" } }, null, 1)}\n`,
  "bio-plane/scripts/battery.mjs": BATTERY,
  "bio-plane/scripts/coverage.mjs": stubLogged("coverage"),
  "bio-plane/src/index.mjs": "export default { plane: 1 };\n",
  "bio-plane/test/log.mjs": logRan,
  /* reads its tool by IMPORT */
  "bio-plane/test/alpha.test.mjs": `import { ran } from "./log.mjs";\nimport { alpha } from "../../tools/alpha.mjs";\nran("plane:alpha.test.mjs");\nprocess.exit(alpha() === 1 ? 0 : 1);\n`,
  /* reads a data file through a STRING path; exits 1 when the file says "bad" */
  "bio-plane/test/beta.test.mjs": [`import { ran } from "./log.mjs";`, `import { readFileSync } from "node:fs";`,
    `ran("plane:beta.test.mjs");`, `process.exit(readFileSync(new URL("../../data/beta.txt", import.meta.url), "utf8").includes("bad") ? 1 : 0);`, ""].join("\n"),
  /* reads the clock, and says so */
  "bio-plane/test/clock.test.mjs": `/* GATE: never-cache (its verdict reads the clock) */\nimport { ran } from "./log.mjs";\nran("plane:clock.test.mjs");\nprocess.exit(Date.now() > 0 ? 0 : 1);\n`,
  "data/beta.txt": "good\n",
  "vault/secret.dat": "sealed\n",
  "civicos-ui/app.html": "<!doctype html>\n",
  "civicos-ui/test/run.mjs": `/* the fixture harness runs "../check-a.mjs" */\n${stubLogged("ui-harness")}`,
  "civicos-ui/test/uione.test.mjs": [`import { ran } from "../../bio-plane/test/log.mjs";`, `import { readFileSync } from "node:fs";`,
    `ran("ui:uione.test.mjs");`, `process.exit(readFileSync(new URL("../app.html", import.meta.url), "utf8").length ? 0 : 1);`, ""].join("\n"),
  "civicos-ui/check-a.mjs": `import { ran } from "../bio-plane/test/log.mjs";\nran("uicheck:check-a.mjs");\nprocess.exit(0);\n`,
  "pdf-worker/fleet-member.json": `${JSON.stringify({ name: "pdf-worker", testDir: "test" })}\n`,
  "pdf-worker/src/index.mjs": "export default {};\n",
  "pdf-worker/test/member.test.mjs": `import { ran } from "../../bio-plane/test/log.mjs";\nran("fleet:pdf-worker/member.test.mjs");\nprocess.exit(0);\n`,
  "docs/notes/a.md": "# a\n",
  "CLAUDE.md": "# fixture\n",
  ".gitignore": "node_modules/\n",
};
/* a suite reading a file through a path MENTION cannot see: assembled from pieces none of which is its name, its stem
   or its directory. Added only by the arm that drives condition 2. */
const SNEAKY = [`import { ran } from "./log.mjs";`, `import { readFileSync } from "node:fs";`, `import { join, dirname } from "node:path";`,
  `import { fileURLToPath } from "node:url";`, `ran("plane:sneaky.test.mjs");`,
  `const top = join(dirname(fileURLToPath(import.meta.url)), "../..");`,
  `const where = ["va", "ult"].join(""), what = ["sec", "ret", ".", "dat"].join("");`,
  `process.exit(readFileSync(join(top, where, what), "utf8").length ? 0 : 1);`, ""].join("\n");
const CACHEABLE = ["plane:alpha.test.mjs", "plane:beta.test.mjs", "fleet:pdf-worker/member.test.mjs", "coverage", "ui:uione.test.mjs", "uicheck:check-a.mjs"];

const put = (root, rel, body) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), body); };
const commitAll = (root, msg) => { git(["add", "-A"], root); return git([...ID, "commit", "-q", "-m", msg], root); };

function origin(name, extra = {}) {
  const seed = join(SANDBOX, `${name}-seed`);
  for (const p of GATE_DEPS) put(seed, p, readFileSync(join(REPO, p)));
  for (const [rel, body] of Object.entries({ ...FILES, ...extra })) put(seed, rel, body);
  git(["init", "-q", "-b", "main"], seed);
  commitAll(seed, "base");
  const bare = join(SANDBOX, `${name}.git`);
  git(["init", "-q", "--bare", "-b", "main", bare], SANDBOX);
  git(["push", "-q", "--no-verify", bare, "main"], seed);
  return bare;
}
/* A clone stands for a MACHINE: its own git directory, its own D-293 record, the real hook installed. */
function clone(bare, name) {
  const root = join(SANDBOX, name);
  git(["clone", "-q", bare, root], SANDBOX);
  git(["config", "user.email", "m0126@example.invalid"], root);
  git(["config", "user.name", "M0-126 suite"], root);
  install({ repo: root });
  return root;
}
/* THE FIXTURE'S GATE NEVER INHERITS THE REAL GATE'S RESULT WIRING. Found by this suite's first run INSIDE a real gate
   (2026-09-23): the outer gate's `BIO_GATE_RESULTS_REMOTE` reached the fixture's gates, which then read and WROTE the
   fixture's PASS records to the outer gate's results remote (13 assertions red, six fixture records written there).
   Every variable the real gate sets for its units is dropped here, so a fixture always uses its own `origin`. */
const CLEAN_ENV = (() => {
  const e = { ...process.env };
  for (const k of Object.keys(e)) if (/^BIO_GATE_(RESULTS|TRACE)/.test(k)) delete e[k];
  delete e.NODE_OPTIONS;
  return e;
})();
const gates = (root, args = [], env = {}) => {
  writeFileSync(LOG, "");
  const r = spawnSync(process.execPath, [join(root, "tools/gates.mjs"), ...args],
    { cwd: root, encoding: "utf8", env: { ...CLEAN_ENV, GATES_FIXTURE_LOG: LOG, ...env } });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  return { status: r.status, out,
    ran: [...new Set(readFileSync(LOG, "utf8").split("\n").filter(Boolean).map((l) => l.replace(/^ran /, "")))].sort(),
    reused: [...out.matchAll(/^gates: {3}REUSED (\S+) {2}<- /gm)].map((m) => m[1]).sort(),
    keys: Object.fromEntries([...out.matchAll(/^gates: {3}KEY (\S+) ([0-9a-f]{64})$/gm)].map((m) => [m[1], m[2]])),
    verdict: (out.match(/^gates: (GREEN|RED|NOT MEASURED) · class/m) || [])[1] || null,
    wrote: +((out.match(/WROTE (\d+) PASS record/) || [])[1] || 0) };
};
/* What origin holds, read in the bare repository itself — never through a fetch that would write a ref there. */
const remoteResults = (bare) => new Set(out1(["ls-tree", "-r", "--name-only", "refs/heads/gate-results"], bare).split("\n").filter(Boolean));
const sorted = (a) => [...a].sort();
/* The guard's append-only arm, in-process: a commit on the tip ADDING a record path, and one adding any other path. */
function gateResultsCheckFor(root, tip) {
  const onTip = (path) => {
    const idx = join(SANDBOX, `idx-${Math.random().toString(36).slice(2)}`);
    const env = { GIT_INDEX_FILE: idx };
    git(["read-tree", tip], root, env);
    const blob = spawnSync("git", ["hash-object", "-w", "--stdin"], { cwd: root, input: "{}\n", encoding: "utf8" }).stdout.trim();
    git(["update-index", "--add", "--cacheinfo", `100644,${blob},${path}`], root, env);
    const tree = git(["write-tree"], root, env).stdout.trim();
    return spawnSync("git", [...ID, "commit-tree", tree, "-p", tip, "-m", "probe"], { cwd: root, encoding: "utf8" }).stdout.trim();
  };
  const judge = (sha) => gateResultsCheck({ repo: root, stdin: `refs/heads/x ${sha} refs/heads/gate-results ${tip}\n` }).ok;
  return { add: judge(onTip(`results/plane/probe.test.mjs/${"a".repeat(64)}.json`)), other: judge(onTip("README.md")) };
}

/* ================================================================== */
section("the fixture");
const O = origin("o");
const A = clone(O, "machine-a");
/* CORRECTED 2026-09-24 (M0-154), never exempted: this named the same files the copy list did, so it agreed
   for free and could not fail when the list fell behind `gates.mjs`'s imports. It now reads the DERIVED list —
   the same one the fixture was built from — and floors its size, since a totality assertion over an empty
   corpus passes (three receipts in `kickoffs/WORKER.md`). The list is PRINTED so the selection is auditable. */
t("the fixture carries the REAL gates, results, trace and guard tools, and all they import (DERIVED)",
  [GATE_DEPS.length >= 7, ["tools/gates.mjs", "tools/gateresults.mjs", "tools/gatetrace.mjs", "tools/pushguard.mjs"].every((p) => GATE_DEPS.includes(p)),
   missingFrom(A)],
  [true, true, []]);
t("origin holds NO gate-results branch before the first gate", out1(["ls-remote", "--heads", O, "gate-results"], A), "");

/* ================================================================== */
section("the first machine: everything runs, every cacheable PASS is recorded, the branch is created");
const a1 = gates(A, ["--full"]);
t("machine A's FULL gate is GREEN", [a1.verdict, a1.status], ["GREEN", 0]);
t("...and every unit RAN there (nothing to reuse yet)", a1.ran, sorted([...CACHEABLE, "plane:clock.test.mjs", "plancheck"]));
t("...and it names NO under-inclusion: every traced read is covered by its unit's key", /UNDER-INCLUSION/.test(a1.out), false);
t("...and it wrote one PASS per cacheable unit, and none for the never-cached one or plancheck", a1.wrote, CACHEABLE.length);
t("...and the FIRST write CREATED the branch on origin (no branch existed; nothing was deleted to make it)",
  [/the branch was CREATED by this write/.test(a1.out), out1(["ls-remote", "--heads", O, "gate-results"], A).length > 0], [true, true]);
const recs = [...remoteResults(O)].filter((p) => p.startsWith("results/"));
t("the records on origin are one file per key, under results/<unit>/<hash>.json",
  sorted(recs.map((p) => p.split("/").slice(1, -1).join("/"))),
  sorted(CACHEABLE.map((u) => u.replace(":", "/"))));

/* ================================================================== */
section("a second machine: a tree whose units the first passed runs NONE of them");
const B = clone(O, "machine-b");
const b1 = gates(B, ["--full"]);
t("machine B's FULL gate is GREEN", [b1.verdict, b1.status], ["GREEN", 0]);
t("...and it REUSED every cacheable unit, naming each record", b1.reused, sorted(CACHEABLE));
t("...and RAN only the never-cached unit and plancheck (0 of the units A passed)", b1.ran, ["plancheck", "plane:clock.test.mjs"]);
t("...and the D-293 record says FULLREUSE, never FULL (a release's GREEN FULL is a run of everything)",
  /RECORDED GREEN for tree \w+ \(class FULLREUSE\)/.test(b1.out), true);
const b2 = gates(B, ["--full"]);
t("a never-cached unit runs EVERY time (and plancheck is never cached)", b2.ran, ["plancheck", "plane:clock.test.mjs"]);

/* ================================================================== */
section("one input change re-runs exactly the units whose key moved");
put(B, "data/beta.txt", "good, and longer\n");
commitAll(B, "beta moves");
const c1 = gates(B, ["--full"]);
t("a data file ONE suite reads: only that suite (and the never-cached) runs", c1.ran, ["plancheck", "plane:beta.test.mjs", "plane:clock.test.mjs"]);
t("...and the rest are REUSED", c1.reused, sorted(CACHEABLE.filter((u) => u !== "plane:beta.test.mjs")));
put(B, "bio-plane/src/index.mjs", "export default { plane: 2 };\n");
commitAll(B, "plane moves");
const c2 = gates(B, ["--full"]);
t("a plane RUNTIME file: every plane and fleet unit runs (the FULL runtime set is in each key); UI, coverage reused",
  c2.ran, ["fleet:pdf-worker/member.test.mjs", "plancheck", "plane:alpha.test.mjs", "plane:beta.test.mjs", "plane:clock.test.mjs"]);
t("...and the UI suite, the UI check and coverage are REUSED", c2.reused, ["coverage", "ui:uione.test.mjs", "uicheck:check-a.mjs"]);
const cDirty = (() => { put(B, "tools/alpha.mjs", "export const alpha = () => 1; // uncommitted\n"); const r = gates(B, ["--full"]); put(B, "tools/alpha.mjs", "export const alpha = () => 1;\n"); return r; })();
t("an UNCOMMITTED edit moves the key exactly as a commit does: alpha runs on a dirty tree", cDirty.ran.includes("plane:alpha.test.mjs"), true);
t("...and a dirty tree writes NO record (a verdict binds only a clean tree)", [cDirty.wrote, /NOT RECORDED — the tree was not clean/.test(cDirty.out)], [0, true]);

/* ================================================================== */
section("condition 2 — an input omitted from the key FAILS the unit by name, and is never recorded");
const O2 = origin("o2", { "bio-plane/test/sneaky.test.mjs": SNEAKY });
const S = clone(O2, "machine-s");
const s1 = gates(S, ["--full"]);
t("the suite reading vault/secret.dat through a path MENTION cannot see: the gate is RED", [s1.verdict, s1.status], ["RED", 1]);
t("...and the failure NAMES the unit and the file its key does not cover",
  /UNDER-INCLUSION \(M0-126 condition 2\) — plane:sneaky\.test\.mjs read 1 file\(s\) its key does not cover: vault\/secret\.dat/.test(s1.out), true);
/* CONDUCT #16, at the merge with M0-127 (a RED names every cause): the unit exited 0, so the cause is M0-126's alone. */
t("...and the gate's CAUSES line names it `underinclusion:` (M0-127: a RED names every cause, even on a clean exit)",
  /^gates: CAUSES .*\bunderinclusion:plane:sneaky\.test\.mjs\b/m.test(s1.out), true);
t("...and NO PASS is written for it, while every unit that read only its inputs IS recorded",
  [[...remoteResults(O2)].some((p) => p.startsWith("results/plane/sneaky.test.mjs/")), s1.wrote], [false, CACHEABLE.length]);
t("...and the D-293 record opens that unit alone, so the next plain run re-runs it (and it fails again)",
  (() => { const r = gates(S); return [r.verdict, r.ran.includes("plane:sneaky.test.mjs")]; })(), ["RED", true]);
/* OVER-STRICTNESS: the same read, DECLARED, is covered — and a correct suite in a spelling the derivation did not
   anticipate passes and records. */
put(S, "bio-plane/test/sneaky.test.mjs", `/* GATE: reads vault/ (the fixture's sealed file, read through an assembled path) */\n${SNEAKY}`);
commitAll(S, "declare the read");
const s2 = gates(S, ["--full"]);
t("OVER-STRICTNESS: the read DECLARED (`GATE: reads vault/`) is covered — GREEN, and its PASS is recorded",
  [s2.verdict, [...remoteResults(O2)].some((p) => p.startsWith("results/plane/sneaky.test.mjs/"))], ["GREEN", true]);
put(S, "vault/secret.dat", "sealed, and changed\n");
commitAll(S, "the vault moves");
t("...and a change to the declared file now moves ITS key: the suite runs again",
  gates(S, ["--full"]).ran.includes("plane:sneaky.test.mjs"), true);

/* BOB #30 (condition 1): a suite whose verdict reads this checkout's GIT HISTORY reads what no key names. */
const HISTORIAN = [`import { ran } from "./log.mjs";`, `import { spawnSync } from "node:child_process";`,
  `import { join, dirname } from "node:path";`, `import { fileURLToPath } from "node:url";`, `ran("plane:historian.test.mjs");`,
  `const top = join(dirname(fileURLToPath(import.meta.url)), "../..");`,
  `const r = spawnSync("git", ["log", "--oneline", "-1"], { cwd: top, encoding: "utf8" });`,
  `process.exit(r.status === 0 && r.stdout.length ? 0 : 1);`, ""].join("\n");
const O6 = origin("o6", { "bio-plane/test/historian.test.mjs": HISTORIAN });
const H = clone(O6, "machine-h");
const h1 = gates(H, ["--full"]);
t("a suite that runs `git log` over this checkout FAILS by name (BOB #30: history is outside every key)",
  [h1.verdict, /HISTORY READ \(M0-126 condition 1, BOB #30\) — plane:historian\.test\.mjs ran 1 git command\(s\)/.test(h1.out),
    [...remoteResults(O6)].some((p) => p.startsWith("results/plane/historian.test.mjs/"))], ["RED", true, false]);
t("...and the gate's CAUSES line names it `history:` (M0-127: a RED names every cause, even on a clean exit)",
  /^gates: CAUSES .*\bhistory:plane:historian\.test\.mjs\b/m.test(h1.out), true);
put(H, "bio-plane/test/historian.test.mjs", `/* GATE: never-cache (history) */\n${HISTORIAN}`);
commitAll(H, "mark the historian");
const h2 = gates(H, ["--full"]);
t("...and marked `GATE: never-cache (history)` it is never-cached: GREEN, and it RAN though everything else is REUSED",
  [h2.verdict, h2.ran.includes("plane:historian.test.mjs"), h2.reused.includes("plane:alpha.test.mjs")], ["GREEN", true, true]);
const h3 = gates(H);
/* The plain gate's class is TARGETED (the marked suite is this branch's change), whose selection holds the historian;
   the tree is already recorded GREEN by the wider run, so before BOB #30 the tree-keyed shortcut ran NOTHING here. */
t("...and a PLAIN gate on that same GREEN tree still RUNS the never-cached unit it selects (a record never answers for it)",
  [h3.verdict, h3.ran.includes("plane:historian.test.mjs"),
    /already recorded GREEN, but a record never answers for a never-cached unit/.test(h3.out)], ["GREEN", true, true]);

/* ================================================================== */
section("the liar's record: reused by the ordinary gate, caught by the backstop, revoked, its writer named");
const L = clone(O, "machine-liar");
put(L, "data/beta.txt", "bad\n");
commitAll(L, "beta goes red");
const lk = gates(L, ["--full", "--explain"]);
const betaKey = lk.keys["plane:beta.test.mjs"];
t("--explain prints each unit's key (the name a record and a revocation use)", /^[0-9a-f]{64}$/.test(String(betaKey)), true);
t("an honest gate over the red tree is RED at beta", (() => { const r = gates(L, ["--full"]); return [r.verdict, /results\/plane\/beta/.test(r.out)]; })(), ["RED", false]);
/* THE LIE: a PASS file written by hand for beta's red key. */
const lie = appendRecords({ repo: L, remote: "origin", message: "a liar's record",
  files: [{ path: resultPath("plane:beta.test.mjs", betaKey), body: `${JSON.stringify({ unit: "plane:beta.test.mjs", inputHash: betaKey,
    verdict: "PASS", run: "forged", tree: "0".repeat(40), clone: "liar-clone", session: "liar-session", at: "2026-09-23T00:00:00Z" })}\n` }] });
t("the hand-written record lands (append-only does not know an honest file from a forged one)", lie.status, "pushed");
const l1 = gates(L, ["--full"]);
t("THE LIE SUCCEEDS where it sits: the ordinary gate REUSES beta and reads GREEN (stated, not hidden)",
  [l1.verdict, l1.reused.includes("plane:beta.test.mjs"), l1.ran.includes("plane:beta.test.mjs")], ["GREEN", true, false]);
const l2 = gates(L, ["--full", "--no-reuse"]);
t("THE BACKSTOP catches it: `--full --no-reuse` (every release cut; the GitHub run on main) runs beta and reads RED",
  [l2.verdict, l2.ran.includes("plane:beta.test.mjs"), l2.reused.length], ["RED", true, 0]);
const rv = spawnSync(process.execPath, [join(L, "tools/gateresults.mjs"), "revoke", "plane:beta.test.mjs", betaKey, "--reason", "hid a red beta"],
  { cwd: L, encoding: "utf8", env: CLEAN_ENV });
t("the key is REVOKED by an append (`revoked/<unit>/<hash>.json`), naming the lie's writer",
  [rv.status, /"clone": "liar-clone"/.test(rv.stdout), [...remoteResults(O)].includes(revokedPath("plane:beta.test.mjs", betaKey))], [0, true, true]);
const l3 = gates(L, ["--full"]);
t("...and the next ordinary gate RUNS beta (REVOKED, its writer named) and reads RED",
  [l3.verdict, l3.ran.includes("plane:beta.test.mjs"), /plane:beta\.test\.mjs: key \w+ is REVOKED \(hid a red beta\) — its PASS was written by clone liar-clone, session liar-session/.test(l3.out)],
  ["RED", true, true]);

/* ================================================================== */
section("gate-results is APPEND-ONLY, at the guard");
const G = clone(O, "machine-g");
git(["fetch", "-q", "origin", "gate-results:refs/remotes/origin/gate-results"], G);
const tip = out1(["rev-parse", "refs/remotes/origin/gate-results"], G);
const firstRec = [...listPaths({ repo: G, tip })].find((p) => p.startsWith("results/"));
const rewrite = (() => {
  const w = join(SANDBOX, "rewrite");
  git(["worktree", "add", "-q", "--detach", w, tip], G);
  put(w, firstRec, "{\"tampered\":true}\n");
  commitAll(w, "tamper");
  const sha = out1(["rev-parse", "HEAD"], w);
  const p = git(["push", "origin", `${sha}:refs/heads/gate-results`], G);
  return { status: p.status, err: `${p.stdout}${p.stderr}` };
})();
t("a record MODIFIED on gate-results is REFUSED by the guard, by name",
  [rewrite.status !== 0, /gate-results IS APPEND-ONLY/.test(rewrite.err), /M results\//.test(rewrite.err)], [true, true, true]);
const del = git(["push", "origin", ":refs/heads/gate-results"], G);
t("a DELETION of gate-results is REFUSED by the guard", [del.status !== 0, /DELETION of gate-results/.test(`${del.stdout}${del.stderr}`)], [true, true]);
t("the guard's arm, read in-process, passes an ADD of a record path and refuses any other path",
  gateResultsCheckFor(G, tip), { add: true, other: false });

/* ================================================================== */
section("off, and absent");
const off = gates(B, ["--full"], { BIO_GATE_RESULTS: "off" });
t("BIO_GATE_RESULTS=off: the gate as it stood before M0-126 — nothing keyed, nothing reused, the UI harness whole",
  [/results \(M0-126\) — OFF: BIO_GATE_RESULTS=off/.test(off.out), off.reused.length, off.ran.includes("ui-harness")], [true, 0, true]);
const NR = clone(O, "machine-noremote");
git(["remote", "set-url", "origin", join(SANDBOX, "nowhere.git")], NR);
const nr = gates(NR, ["--full"]);
t("a results remote that cannot be fetched reuses NOTHING and says why (a fetch failure is not an absent branch)",
  [nr.reused.length, /gate-results could not be fetched from origin/.test(nr.out)], [0, true]);

/* ================================================================== */
section("the backstop (BOB #30): a FULL record is one ONLY when its run reused NOTHING and used no --since");
const runsAt = (root, rev) => readRuns({ repo: root, tree: out1(["rev-parse", `${rev}^{tree}`], root) }).runs;
{
  const aRuns = runsAt(A, "HEAD");
  t("machine A's FULL run, which REUSED NOTHING, is recorded FULL with backstop:true and reads as a BACKSTOP",
    [aRuns.length, aRuns[0].class, aRuns[0].backstop, isBackstop(aRuns[0]), /^gates: BACKSTOP — /m.test(a1.out)], [1, "FULL", true, true, true]);
  const bRuns = runsAt(B, "origin/main");
  t("machine B's FULL runs, which reused units, are FULLREUSE and NEVER a backstop",
    [bRuns.length >= 2, bRuns.every((r) => r.class === "FULLREUSE" && r.backstop === false && !isBackstop(r)),
      /^gates: NOT A BACKSTOP — 6 unit\(s\) REUSED/m.test(b1.out)], [true, true, true]);
}
/* THE LIAR'S CASE: a FULL run that reused exactly ONE unit. A fresh origin whose only PASS is alpha's, written by a
   TARGETED gate on the first machine; the second machine's `--full` then reuses that one unit and runs the rest. */
const O5 = origin("o5");
const X = clone(O5, "machine-x");
put(X, "tools/alpha.mjs", "export const alpha = () => 1; // moved\n");
commitAll(X, "alpha moves");
const x1 = gates(X);
t("a TARGETED gate on machine X runs alpha alone and records its one PASS", [x1.ran, x1.wrote], [["plancheck", "plane:alpha.test.mjs"], 1]);
git(["push", "-q", "--no-verify", "origin", "main"], X);
const Y = clone(O5, "machine-y");
const y1 = gates(Y, ["--full"]);
const yRun = runsAt(Y, "HEAD").pop();
t("machine Y's FULL run reused EXACTLY ONE unit and ran every other",
  [y1.reused, y1.ran.includes("plane:beta.test.mjs"), y1.verdict], [["plane:alpha.test.mjs"], true, "GREEN"]);
t("...and a FULL run that reused ONE unit is FULLREUSE, backstop:false — NOT a backstop, and says so",
  [yRun.class, yRun.backstop, isBackstop(yRun), /^gates: NOT A BACKSTOP — 1 unit\(s\) REUSED/m.test(y1.out)], ["FULLREUSE", false, false, true]);
t("...and the same record with its class and flag EDITED to FULL/true still reads NOT a backstop (its REUSED step stands)",
  isBackstop({ ...yRun, class: "FULL", backstop: true }), false);
t("...and a record from before the field (no `backstop` key) is not a backstop: the absence never reads as the word",
  isBackstop({ ...runsAt(A, "HEAD")[0], backstop: undefined }), false);

/* ================================================================== */
/* M0-179 (2026-09-24) — THE BRANCH'S ONE LAW, READ ON THE WAY IN. `gate-results` is APPEND-ONLY (TREE-SHARING.md §3a).
   Before this, the law was enforced only at the PUSH: a tip whose history had been rewritten was read and REUSED
   exactly like an honest one, and the run failed only when it came to write. A reused PASS is a GREEN verdict, so a
   rewritten cache could carry a green gate on records nobody can trace — the reason the row sits at the backlog head.
   The arms below plant a real non-descending tip in a fixture (a divergent root commit moved onto the branch with
   `update-ref` INSIDE the bare repository, so nothing is force-pushed and no hook is bypassed) and drive the refusal,
   its persistence, the write, and — the over-strictness arm — an ordinary append by another machine, which must still
   be REUSED. */
section("M0-179 — a tip this clone's record does not descend from is REFUSED for reuse, by name");
const O7 = origin("o7");
const M = clone(O7, "machine-m");
const m1 = gates(M, ["--full"]);
const m1Tip = out1(["rev-parse", "refs/heads/gate-results"], O7);
t("machine M's first FULL gate is GREEN, records its PASSes, and leaves a LOCAL RECORD of the branch's tip",
  [m1.verdict, m1.wrote > 0, out1(["rev-parse", recordRef("origin")], M) === m1Tip], ["GREEN", true, true]);
/* A DIVERGENT tip CARRYING THE SAME TREE: a ROOT commit (no parent) whose tree IS the tip's, so it holds every record
   the first gate wrote and the DESCENT is the ONLY thing that can refuse it.
   WRITTEN THIS WAY BY THIS ITEM'S OWN CONTROL, R16, WHICH FIRST CAME BACK GREEN (2026-09-24). The first draft planted
   a root commit holding one unrelated record path — so the tip held NONE of M's keys, `reused` was 0 whatever the gate
   decided, and the assertion below was satisfied by the WRITER's refusal sentence appearing anywhere in the output.
   With the reuse refusal removed the suite still read 67/0: an arm that agrees for free, which is the defect this
   project meets most (`kickoffs/WORKER.md`). Two corrections, both here: the planted tip now HOLDS the reusable
   PASSes, so a gate that does not refuse it REUSES them; and the assertion is anchored to the reuse arm's OWN line
   (`gates:` + three spaces, ending in "every unit RUNS"), never to any line carrying the sentence. */
const m1Recs = remoteResults(O7).size;
const orphanTip = (() => {
  const tree = out1(["rev-parse", `${m1Tip}^{tree}`], M);
  const sha = spawnSync("git", [...ID, "commit-tree", tree, "-m", "a divergent root"], { cwd: M, encoding: "utf8" }).stdout.trim();
  git(["push", "-q", "--no-verify", "origin", `${sha}:refs/heads/m0179-planted`], M);   /* carry the objects over */
  git(["update-ref", "refs/heads/gate-results", sha], O7);                              /* the REWRITE, in the bare */
  return sha;
})();
t("the planted tip is non-descending AND holds every record the first gate wrote, so only the DESCENT can refuse it",
  [orphanTip !== m1Tip, out1(["rev-parse", "refs/heads/gate-results"], O7) === orphanTip,
    git(["merge-base", "--is-ancestor", m1Tip, orphanTip], M).status !== 0,
    out1(["rev-parse", `${orphanTip}^{tree}`], M) === out1(["rev-parse", `${m1Tip}^{tree}`], M),
    remoteResults(O7).size === m1Recs, m1Recs > 3],
  [true, true, true, true, true, true]);
const m2 = gates(M, ["--full"]);
/* THE REUSE ARM'S OWN LINE, and nothing else: `gates:` + three spaces is how §3b prints a result note, and only the
   reuse refusal ends in "every unit RUNS". The writer's refusal of the same tip is a DIFFERENT line, asserted below. */
const reuseRefusal = (out) => new RegExp(`^gates: {3}gate-results @ ${orphanTip.slice(0, 8)} does NOT descend from this `
  + `clone's record of the branch \\(record ${m1Tip.slice(0, 8)}: [^)]+\\) — the branch is APPEND-ONLY `
  + "\\(TREE-SHARING\\.md §3a\\), so nothing is reused from it and nothing is written onto it; every unit RUNS$", "m").test(out);
t("...the next gate REUSES NOTHING, and its REUSE arm names the tip, the record and the branch's law on its own line",
  [m2.reused.length, reuseRefusal(m2.out)], [0, true]);
t("...and the refusal has TEETH: the units that tip HOLDS a PASS for RUN anyway, and the run is GREEN on its own work",
  [m2.ran.includes("plane:alpha.test.mjs"), m2.ran.includes("plane:beta.test.mjs"), m2.verdict,
    m1.reused.length], [true, true, "GREEN", 0]);
t("...and NOTHING is written onto that tip either: the writer refuses it on its OWN line, and the branch does not grow",
  [/^gates: results \(M0-126\) — NOT WRITTEN: gate-results @ [0-9a-f]{8} does NOT descend from this clone's record/m.test(m2.out),
    remoteResults(O7).size, m1Recs], [true, m1Recs, m1Recs]);
const m3 = gates(M, ["--full"]);
t("...and the refusal DOES NOT HEAL ITSELF: the record was not advanced to the planted tip, so the next gate refuses again",
  [out1(["rev-parse", recordRef("origin")], M) === m1Tip, m3.reused.length, reuseRefusal(m3.out)], [true, 0, true]);
/* OVER-STRICTNESS — the append this branch exists for. The tip is put back and a SECOND machine appends its own
   records on top; M's record does not name that tip either, but it DESCENDS from it, so reuse must work. A refusal
   here would be a fence tighter than its rule (`kickoffs/WORKER.md`). */
git(["update-ref", "refs/heads/gate-results", m1Tip], O7);
const N = clone(O7, "machine-n");
put(N, "tools/alpha.mjs", "export const alpha = () => 1; // machine N moved it\n");
commitAll(N, "alpha moves on N");
const n1 = gates(N, ["--full"]);
const nTip = out1(["rev-parse", "refs/heads/gate-results"], O7);
const m4 = gates(M, ["--full"]);
t("OVER-STRICTNESS: another machine's ordinary APPEND is a tip M's record descends from — M reuses, and advances its record",
  [n1.wrote > 0, nTip !== m1Tip, git(["merge-base", "--is-ancestor", m1Tip, nTip], M).status, m4.reused.length > 0,
    reuseRefusal(m4.out), /does NOT descend/.test(m4.out), out1(["rev-parse", recordRef("origin")], M) === nTip],
  [true, true, 0, true, false, false, true]);
/* THE JUDGEMENT ITSELF, driven directly — the four outcomes, and above all that an ancestry it CANNOT READ is
   `undetermined` and never `non-descending`. Conflating those two is the whole of this row: the guard's one message
   called both "(history rewritten)", and the row it produced claimed a rewrite of `origin/gate-results` that never
   happened (78f2412e is an ancestor of the branch's tip; its 215 commits are linear and every one only ADDS). */
t("descentOf names FOUR outcomes and never rounds an unreadable ancestry off to a rewrite",
  [descentOf({ repo: M, prior: null, tip: nTip }).descent,
    descentOf({ repo: M, prior: m1Tip, tip: nTip }).descent,
    descentOf({ repo: M, prior: m1Tip, tip: m1Tip }).descent,
    descentOf({ repo: M, prior: m1Tip, tip: orphanTip }).descent,
    descentOf({ repo: M, prior: m1Tip, tip: "0".repeat(40) }).descent,
    descentOf({ repo: M, prior: m1Tip, tip: null }).descent],
  ["first", "ok", "ok", "non-descending", "undetermined", "non-descending"]);
t("...and only `first` and `ok` let a caller read or write records at that tip",
  [descentHolds({ descent: "first" }), descentHolds({ descent: "ok" }), descentHolds({ descent: "non-descending" }),
    descentHolds({ descent: "undetermined" })], [true, true, false, false]);
/* THE GUARD'S DIAGNOSIS (the other half of M0-179): a push that does not descend is still refused, but the message now
   says WHICH cause it could establish. The stale base is the ordinary race REC-211 met; it must NOT read as a rewrite,
   and it must carry the code the writer re-applies on. */
const guardSays = (local, remote) => gateResultsCheck({ repo: M, stdin: `refs/heads/x ${local} refs/heads/gate-results ${remote}\n` }).bad.join(" | ");
const onTipOf = (parent) => {
  const idx = join(SANDBOX, `idx-m0179-${Math.random().toString(36).slice(2)}`);
  const env = { GIT_INDEX_FILE: idx };
  const blob = spawnSync("git", ["hash-object", "-w", "--stdin"], { cwd: M, input: "{}\n", encoding: "utf8" }).stdout.trim();
  git(["read-tree", parent], M, env);
  git(["update-index", "--add", "--cacheinfo", `100644,${blob},results/plane/m0179b.test.mjs/${"c".repeat(64)}.json`], M, env);
  const tree = git(["write-tree"], M, env).stdout.trim();
  return spawnSync("git", [...ID, "commit-tree", tree, "-p", parent, "-m", "a record on a now-stale tip"], { cwd: M, encoding: "utf8" }).stdout.trim();
};
const staleLocal = onTipOf(m1Tip);
const stale = guardSays(staleLocal, nTip);          /* the remote moved on past this commit's base */
const rewritten = guardSays(staleLocal, orphanTip); /* the remote dropped this commit's base */
/* NOT all-zeros: git spells "the ref does not exist yet" that way and the guard reads it as the branch's CREATION.
   Found by this arm's first run, which reported four falses because the guard had nothing to refuse (`bad` empty). */
const unreadable = guardSays(staleLocal, "b".repeat(40));
t("the guard refuses a STALE BASE as the concurrent-append race, NOT as a rewrite, and codes it for the writer",
  [/was built on a STALE fetch/.test(stale), /GATE_RESULTS_STALE_BASE/.test(stale), /REWRITTEN/.test(stale),
    stale.includes(m1Tip.slice(0, 8))], [true, true, false, true]);
t("...reads a tip that DROPPED this commit's base as a possible REWRITE, and says only that it may have been",
  [/may have been REWRITTEN/.test(rewritten), /STALE fetch/.test(rewritten)], [true, false]);
t("...and an ancestry it cannot read at all is UNDETERMINED, refused, and explicitly not read as a rewrite",
  [/UNDETERMINED/.test(unreadable), /NOT read as a rewrite/.test(unreadable), /may have been REWRITTEN/.test(unreadable),
    /GATE_RESULTS_STALE_BASE/.test(unreadable)], [true, true, false, true]);
t("...and a descending push is still judged only on its PATHS (the arm did not widen the guard)",
  gateResultsCheckFor(M, nTip), { add: true, other: false });
/* THE WRITER'S RETRY, DRIVEN — REC-211's "the write failed" in full. A pre-push hook's refusal carries none of git's
   own words (measured 2026-09-24: the output is the hook's text plus `error: failed to push some refs`), so the loop's
   predicate never matched the guard's stale-base refusal and ONE ordinary concurrent append was reported as a failed
   write. The hook below refuses its FIRST invocation with the REAL guard's REAL stale-base text — taken from
   `gateResultsCheck` above, not written by hand here — and delegates every later one, so what is driven is the loop's
   own re-fetch-and-re-apply on that message. */
const P = clone(O7, "machine-p");
const marker = join(SANDBOX, "m0179-hook-fired");
writeFileSync(join(P, ".git/hooks/pre-push"), `#!/bin/sh
if [ ! -f ${JSON.stringify(marker).slice(1, -1)} ]; then
  : > ${JSON.stringify(marker).slice(1, -1)}
  echo "" >&2
  echo "  PUSH REFUSED — bio-pushguard" >&2
  echo "  gate-results IS APPEND-ONLY (M0-126, TREE-SHARING.md §3a):" >&2
  echo "      ${stale.replace(/"/g, '\\"')}" >&2
  exit 1
fi
exec node "${P}/tools/pushguard.mjs" --run
`);
spawnSync("chmod", ["+x", join(P, ".git/hooks/pre-push")]);
const retried = appendRecords({ repo: P, remote: "origin",
  files: [{ path: `results/plane/m0179retry.test.mjs/${"d".repeat(64)}.json`, body: "{}\n" }],
  message: "gate-results: M0-179 retry arm" });
t("the writer RE-APPLIES on the guard's stale-base refusal instead of reporting a failed write",
  [retried.status, retried.attempts >= 2, retried.added,
    remoteResults(O7).has(`results/plane/m0179retry.test.mjs/${"d".repeat(64)}.json`)], ["pushed", true, 1, true]);
t("...and the one sentence every refusal is written from names the tip, the record and the law",
  [/^gate-results @ abcdef12 does NOT descend from this clone's record of the branch \(record 12345678: why\)/
    .test(DESCENT_REFUSED({ tip: "abcdef12".padEnd(40, "0"), priorTip: "12345678".padEnd(40, "0"), descent: "non-descending", descentWhy: "why" })),
    /nothing is reused from it and nothing is written onto it$/
      .test(DESCENT_REFUSED({ tip: "a", priorTip: "b", descent: "undetermined", descentWhy: "w" }))], [true, true]);

/* ================================================================== */
section("the GitHub backstop's wiring (condition 3), read from the workflow's own text");
const wf = readFileSync(join(REPO, ".github/workflows/gates.yml"), "utf8").split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
t("the run on `main` gates EVERY unit (`--full`), whatever the derived class (on main the derived diff is empty: DOCS)",
  /\n\s+GATE_FULL: --full\n/.test(wf) && /node tools\/gates\.mjs \$GATE_FULL/.test(wf), true);
t("...and it neither reuses nor writes a per-unit record (BIO_GATE_RESULTS off)", /\n\s+BIO_GATE_RESULTS: "off"\n/.test(wf), true);

/* ================================================================== */
t("FOOT — every section reached", reached, SECTIONS);
console.log(`\ngateresults: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
