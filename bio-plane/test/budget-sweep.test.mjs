/* M0-107 — EVERY BUDGET SITE IN THE GATE HAS ITS OUTCOME CHECK, AND THE SWEEP THAT SAYS SO CAN SEE WHAT IT CLAIMS.
 *
 * The row's accepts-when, first half: *"a sweep names every `timeout:` and budget site with its outcome
 * check."* `scripts/budgetsweep.mjs` is the sweep; this suite (1) holds the REAL estate to it — no UNCHECKED
 * suite site, no UNLEDGERED helper site, no ledger drift, the corpus floored so a walk narrowed to nothing
 * cannot pass — and (2) drives the sweep over a SCRATCH repository whose every site's grade is known, both
 * directions, so a matcher gone blind or gone generous fails here by name. (3) pins the one restated shape:
 * the marker regex `scripts/battery.mjs` carries must equal `test/budget.mjs`'s.
 *
 * HOW A LIAR PASSES THIS, stated before what it checks: grade a suite CHECKED because it calls `budgetAssert`
 * ANYWHERE (arm s5 plants a check of a DIFFERENT binding); read `timeout:` in a comment or a fixture string
 * as a site, or read NONE because the lexer blanked too much (arms s4 and the real-estate floor); or ledger
 * a helper by FILE rather than by count, so a new site in it passes unread (arm s6b).
 *
 * NEGATIVE CONTROL: RUN 2026-09-22 by the M0-107 worker, driver `test/m0107-budget.control.mjs` (49 pass, 0 fail), each
 * arm ALONE against pristine copies restored by sha256 AND `cmp`; baseline 20 pass, 0 fail. The arms on THIS suite
 * (driver B5, B6, B7; each came back as declared — B5 19/1, B6 16/4 with the real-estate arms beside (s4), B7 17/3): (1) the binding check widened to "any budgetAssert in the file" in
 * `scripts/budgetsweep.mjs` -> "(s5) a budgetAssert naming a DIFFERENT binding leaves the site UNCHECKED" FAILS;
 * (2) `stripToCode` swapped for the raw source -> "(s4) a `timeout:` in a COMMENT or a STRING is not a site"
 * FAILS; (3) a site's check removed in `owed-controls.test.mjs` (its A13 budgetAssert renamed away) -> the
 * real-estate arm "no suite site in the gate is UNCHECKED" FAILS, naming owed-controls.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sweepBudgets, report } from "../scripts/budgetsweep.mjs";
import { TIMEOUT_MARKER_RE } from "./budget.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}\n          got  ${statedJSON(got)}\n          want ${statedJSON(want)}`); }
};

/* ============== 1. THE REAL ESTATE ============== */
console.log("\n--- 1. the real estate: every budget site in the gate has its outcome check ---");
const real = sweepBudgets();
const lines = [];
const code = report(real, (l) => lines.push(l));
console.log(lines[0]);
const of = (state) => real.sites.filter((s) => s.state === state);
t("the walk RAN (a failed listing says nothing, and is not zero sites)", real.walkFailed, false);
/* FLOORS, so a walk narrowed to nothing cannot pass: the corpus and the gate as measured 2026-09-22 (780 .mjs,
   428 in the gate, 323 suites, 25 gate sites) less a margin for honest deletions. */
t("the corpus is not narrowed to nothing (>= 600 .mjs files; the gate >= 300; its suites >= 250)",
  [real.corpus >= 600, real.gate >= 300, real.suites >= 250], [true, true, true]);
t("the gate carries budget sites at all (>= 20), so 'none unchecked' is not a claim over an empty list",
  real.sites.length >= 20, true);
t("no suite site in the gate is UNCHECKED", of("UNCHECKED").map((s) => `${s.file}:${s.line}`), []);
t("no helper site in the gate is UNLEDGERED", of("UNLEDGERED").map((s) => `${s.file}:${s.line}`), []);
t("no ledgered count has drifted", real.ledgerDrift, []);
t("the CLI's verdict agrees (exit 0)", code, 0);
/* The row's FIRST SITE by name, and every suite M0-107 found a budget in: each is CHECKED. */
const checkedFiles = [...new Set(of("CHECKED").map((s) => s.file))].sort();
t("the six suites with a budget are each CHECKED — owed-controls (M0-103's first site) among them",
  ["battery-provenance", "battery-residue", "battery-verdict", "coverage-provenance", "m051-driver-census", "owed-controls"]
    .map((n) => checkedFiles.includes(`bio-plane/test/${n}.test.mjs`)), [true, true, true, true, true, true]);
t("owed-controls' three spawns are three CHECKED sites",
  of("CHECKED").filter((s) => s.file === "bio-plane/test/owed-controls.test.mjs").length, 3);
t("the sites OUTSIDE the gate are NAMED per file, not dropped (>= 30 files)", real.outside.size >= 30, true);

/* ============== 2. THE MARKER HAS ONE SHAPE ============== */
console.log("\n--- 2. the runner's restated marker equals the helper's ---");
{
  const src = readFileSync(join(DIR, "..", "scripts", "battery.mjs"), "utf8");
  const m = src.match(/^const TIMEOUT_MARKER_RE = (\/.*\/[gimsuy]*);$/m);
  t("scripts/battery.mjs restates TIMEOUT_MARKER_RE exactly as test/budget.mjs exports it",
    m ? m[1] : null, `/${TIMEOUT_MARKER_RE.source}/${TIMEOUT_MARKER_RE.flags}`);
}

/* ============== 3. THE SWEEP SEES WHAT IT CLAIMS: a scratch repository, every grade known ============== */
console.log("\n--- 3. the sweep over a scratch repository whose every grade is known ---");
{
  const repo = mkdtempSync(join(tmpdir(), "m0107-sweep-"));
  const put = (rel, body) => { mkdirSync(join(repo, dirname(rel)), { recursive: true }); writeFileSync(join(repo, rel), body); };
  const spawnHead = `import { spawnSync } from "node:child_process";\nimport { budgetAssert } from "./budget.mjs";\nconst t = () => {};\n`;
  put("bio-plane/test/budget.mjs", "export const budgetAssert = () => true;\n");
  /* (s1) unchecked */
  put("bio-plane/test/s1.test.mjs", `${spawnHead}const r = spawnSync("x", [], { timeout: 5 });\nconsole.log(r.status);\n`);
  /* (s2) checked */
  put("bio-plane/test/s2.test.mjs", `${spawnHead}const r = spawnSync("x", [], { timeout: 5 });\nif (budgetAssert(t, "s2", r, 5, "x")) console.log(r.status);\n`);
  /* (s3) a hand-rolled wall-clock deadline */
  put("bio-plane/test/s3.test.mjs", `const t0 = Date.now();\nwhile (Date.now() - t0 < 30000) { break; }\n`);
  /* (s4) OVER-STRICTNESS: the token in a COMMENT and in a fixture STRING is not a site */
  put("bio-plane/test/s4.test.mjs", `// a spawn with timeout: 5 would go here\nconst fixture = "spawnSync(x, { timeout: 5 })";\nconsole.log(fixture);\n`);
  /* (s5) THE LIAR: a budgetAssert in the file, naming a DIFFERENT binding */
  put("bio-plane/test/s5.test.mjs", `${spawnHead}const other = {};\nbudgetAssert(t, "s5", other, 5, "x");\nconst r = spawnSync("x", [], { timeout: 5 });\nconsole.log(r.status);\n`);
  /* (s6) a HELPER the gate imports: one site ledgered below, (s6b) a second site in it is NOT */
  put("bio-plane/scripts/helper.mjs", `import { spawnSync } from "node:child_process";\nexport const a = () => spawnSync("x", [], { timeout: 5 });\nexport const b = () => spawnSync("y", [], { timeout: 5 });\n`);
  put("bio-plane/test/s6.test.mjs", `import { a } from "../scripts/helper.mjs";\na();\n`);
  /* (s7) OUTSIDE the gate: a control driver, never executed by the gate */
  put("bio-plane/test/s7.control.mjs", `import { spawnSync } from "node:child_process";\nspawnSync("x", [], { timeout: 5 });\n`);
  spawnSync("git", ["init", "-q", "-b", "main"], { cwd: repo });
  const ledger = { "bio-plane/scripts/helper.mjs": { counts: { "timeout:": 1 }, why: "fixture" } };
  const res = sweepBudgets({ repo, ledger });
  const at = (f) => res.sites.filter((s) => s.file === `bio-plane/test/${f}`).map((s) => `${s.kind}:${s.state}`);
  console.log(`  scratch corpus: ${res.corpus} file(s), ${res.sites.length} gate site(s), ${res.outside.size} outside file(s)`);
  t("(scratch) the corpus is what was planted (9 files), untracked files included", res.corpus, 9);
  t("(s1) a spawn whose result is never checked is UNCHECKED", at("s1.test.mjs"), ["timeout::UNCHECKED"]);
  t("(s2) a spawn handed to budgetAssert within the window is CHECKED", at("s2.test.mjs"), ["timeout::CHECKED"]);
  t("(s3) a hand-rolled Date.now() deadline is UNCHECKED — the fix is until()", at("s3.test.mjs"), ["deadline loop:UNCHECKED"]);
  t("(s4) a `timeout:` in a COMMENT or a STRING is not a site", at("s4.test.mjs"), []);
  t("(s5) a budgetAssert naming a DIFFERENT binding leaves the site UNCHECKED", at("s5.test.mjs"), ["timeout::UNCHECKED"]);
  t("(s6) a helper the gate imports is IN the gate, and its sites are graded by the ledger",
    res.sites.filter((s) => s.file === "bio-plane/scripts/helper.mjs").map((s) => s.state), ["LEDGERED", "LEDGERED"]);
  t("(s6b) ...and a ledger COUNT that no longer matches is DRIFT, named — a second site does not pass unread",
    res.ledgerDrift, ["bio-plane/scripts/helper.mjs: 2 timeout: site(s), the ledger says 1"]);
  t("(s7) a control driver is OUTSIDE the gate: named, never graded", [res.outside.get("bio-plane/test/s7.control.mjs"), at("s7.control.mjs")], [1, []]);
  rmSync(repo, { recursive: true, force: true });
}

console.log(`\nbudget-sweep: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
