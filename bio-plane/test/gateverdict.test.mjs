/* NEGATIVE CONTROL: (run 2026-09-23, M0-127) SIX ARMS, each ALONE by a scratch driver that patches ONE anchor (asserted to match exactly once), runs this suite, and restores from a per-arm pristine copy verified by sha256 AND `cmp` ("MATCH … SAME" every arm: battery.mjs 0828a077… 60,913 B; gateverdict.mjs f65bf30e… 6,378 B; pushguard.mjs 1adee7b7… 89,717 B). BASELINE 42 pass, 0 fail; CLOSING 42 / 0. (1) `mainbattery` — `scripts/battery.mjs` replaced WHOLE by origin/main's (b5ce975a), i.e. the battery BEFORE this item -> 33 pass, 9 FAIL: every pid arm, both residue attributions, the RESIDUE-by-path lines, the battery's RED line, and the annotation naming the residue by path; the acceptance arm "NEVER `FAILED=none`" STAYS GREEN, and that is the point of defence in depth — with no residue list the gate still names `residue:unlisted` from the verdict file's `leaking`. (2) `oldwriter` — THE LIAR: `composeVerdict` reverted to the pre-M0-127 workflow's rule (FAILED= from the battery's `  FAILED:` lines alone, no fallback) -> 26 pass, 16 FAIL: THE ROW'S ACCEPTANCE ("reads RED and NEVER `FAILED=none`" — it read `FAILED=none` over a RED again, the 6ef503c4 annotation reproduced), every cause arm of section 2 through the writer, and all seven liar-corpus arms. (3) `nounnamed` — only the last-resort `unnamed:` fallback removed -> 39 / 3: exactly the three corpus logs that name nothing finer (RED with no CAUSES and no battery lines, RED with an EMPTY CAUSES line, NOT MEASURED with no CAUSES). (4) `nopid` — the ` · pid N` segment dropped from the result line -> 38 / 4: the four arms that read a pid off a result line. (5) `nowindow` — the window attribution disabled -> 39 / 3: the windowed residue reads suite UNDETERMINED, so its attribution, its RESIDUE line and its annotation token fail; the pid-named residue stays GREEN. (6) `noresiduecause` — `stepCauses` ignores the verdict file's `residue` -> 39 / 3: the annotation no longer names either residue by path, while "NEVER `FAILED=none`" stays GREEN (the step falls back to `step:battery:exit=1`). OVER-STRICTNESS is section 4, green in every arm: a GREEN run names nothing even when a suite ECHOED a `  FAILED:` line, and the pid segment leaves the `  ok  |FAIL|skip|NOTM` prefix every reader matches intact. NEGATIVE CONTROL: (run 2026-09-25, D-566) the runner's DERIVED closure, same driver and restores as battery-verdict's D-566 line (`scripts/battery.mjs` 66903349… 61,229 B). (A5) ACCEPTS-WHEN — an import added to `scripts/battery.mjs`: MUST NOT fail; 42 / 0. (A7) THE CONTROL — A5 armed and the HAND list `["battery.mjs", "provenance.mjs", "residue.mjs"]` restored: MUST fail; 32 / 10, exit 1, led by "the incident's shape: every suite green (3/3)…" and "(b) EVERY result line ends with its suite's pid". */
/* M0-127 — A RED GATE NAMES WHAT IS RED, SUITE OR NOT, AND A RESIDUE NAMES THE SUITE THAT LEFT IT.
 *
 * THE INCIDENT. The GitHub gate on tree 6ef503c4 read RED with 282/282 suites green, and its `gate verdict`
 * annotation said `FAILED=none`. The red was D-186's residue check in `scripts/battery.mjs` — leaked miniflare
 * sandboxes left in the run's own $TMPDIR (M-111: a race in `test/sandbox.mjs`'s exit sweep, FIXED at cdfaea39) —
 * which is not a suite, and the workflow's FAILED= was the battery's `  FAILED:` line alone. A red GitHub run emails
 * Bob as an ALARM (TREE-SHARING §3), so a red that names nothing reads as a false alarm. M-111 also could not say
 * WHICH suite leaked: the battery printed no per-suite pid.
 *
 * THE SUBJECT: `scripts/battery.mjs` (the pid on each result line; each residue entry NAMED by path and attributed
 * to its suite by the pid in its name or the window it appeared in; the verdict file's `residue`),
 * `tools/pushguard.mjs`'s `stepCauses` and `causesLine` (which `tools/gates.mjs` prints as `gates: CAUSES …`), and
 * `tools/gateverdict.mjs`'s `composeVerdict`, which the workflow runs to write the annotation. The grammar's reader is `tools/pushguard.mjs`
 * parseVerdictAnnotation, driven here on every annotation the writer produces.
 *
 * HOW A LIAR PASSES THIS SUITE, STATED FIRST. (1) An annotation that names SOMETHING on a RED — any token — passes a
 * bare "not none" check, so the residue arm asserts the residue's PATH and SUITE are in FAILED=, read back through the
 * guard's parser. (2) A writer that names causes only when a CAUSES line exists passes every arm fed a tidy gate log,
 * so the corpus includes logs from a gate that DIED (no CAUSES, no RECORDED line) and a RED that printed nothing
 * finer. (3) A pid on the result line that is not the suite's own passes a "has a pid" check, so the pid printed on
 * the leaking suite's line must be the pid inside the residue's directory name, which the SUITE ITSELF chose.
 *
 * WHAT THIS CANNOT SEE: GitHub's runner. The workflow step runs `node tools/gateverdict.mjs` on the gate's log;
 * this suite drives that same file on logs whose battery half is a REAL battery run in a scratch estate and whose
 * gate half is printed by the same functions `tools/gates.mjs` prints with. The Actions runner itself — its
 * `::notice` handling, the check run, the annotation API — is not exercised here (pushguard-check.test.mjs reads
 * annotations through a `file://` fixture of the API).
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { budgetAssert } from "./budget.mjs";
import { moduleClosure } from "./moduleclosure.mjs";   /* D-566: the runner's closure is derived, never listed */

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "..", "..");
const WRITER = join(REPO, "tools", "gateverdict.mjs");
const { composeVerdict } = await import(pathToFileURL(WRITER).href);
const guard = await import(pathToFileURL(join(REPO, "tools", "pushguard.mjs")).href);
const { stepCauses, causesLine } = guard;

let pass = 0, fail = 0, reached = 0;
const SECTIONS = 4;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}\n          got  ${JSON.stringify(got)}\n          want ${JSON.stringify(want)}`); }
};
const T1 = "1".repeat(40);
const RECORD = (v) => `gates: RECORDED ${v} for tree 11111111 (class FULL) — x; the push guard reads it (D-293)`;
const annot = (log, exit = 1) => composeVerdict({ log, tree: T1, exit, wall: 5 });
const parsed = (log, exit = 1) => guard.parseVerdictAnnotation(annot(log, exit).annotation);

/* ======================================================================================================== */
section("1. THE INCIDENT, END TO END: a run whose ONLY failure is a residue reads RED NAMING the residue and its suite");
const RUN_BUDGET_MS = 120_000;
const base = mkdtempSync(join(tmpdir(), "m0127-"));
const repo = join(base, "repo");
mkdirSync(join(repo, "bio-plane", "scripts"), { recursive: true });
mkdirSync(join(repo, "bio-plane", "test"), { recursive: true });
/* CORRECTED 2026-09-25 by D-566: the runner's modules were a HAND LIST (`["battery.mjs", "provenance.mjs",
   "residue.mjs"]`), silent the day `battery.mjs` gains an import. Derived now by `moduleClosure`'s STATIC mode (M0-169). */
for (const rel of moduleClosure({ repo: REPO, roots: ["bio-plane/scripts/battery.mjs"], dynamic: false })) {
  mkdirSync(dirname(join(repo, rel)), { recursive: true });
  copyFileSync(join(REPO, rel), join(repo, rel));
}
const tally = (name) => `console.log("${name}: 3 pass, 0 fail"); process.exit(0);\n`;
const fsImports = `import { mkdirSync, writeFileSync } from "node:fs"; import { tmpdir } from "node:os"; import { join } from "node:path";\n`;
/* `pidnamed` leaves a sandbox-shaped directory named as test/sandbox.mjs names one (`bio-battery-<its pid>-…`), holding
   two miniflare sandboxes — the runner's shape on 6ef503c4. `windowed` leaves a bare `miniflare-*` (a suite that never
   imported the sandbox), whose name carries no pid. `clean` leaves nothing. All three exit 0 with a clean tally. */
const suites = {
  "clean.test.mjs": tally("clean"),
  "pidnamed.test.mjs": fsImports
    + `const d = join(tmpdir(), "bio-battery-" + process.pid + "-plant");\n`
    + `for (const m of ["miniflare-aa0", "miniflare-aa1"]) { mkdirSync(join(d, m), { recursive: true }); writeFileSync(join(d, m, "db.sqlite"), "x"); }\n`
    + tally("pidnamed"),
  "windowed.test.mjs": fsImports
    + `mkdirSync(join(tmpdir(), "miniflare-bb0"), { recursive: true });\n` + tally("windowed"),
};
for (const [f, body] of Object.entries(suites)) writeFileSync(join(repo, "bio-plane", "test", f), body);
const g = (...args) => spawnSync("git", ["-C", repo, "-c", "user.email=m0127@example.invalid", "-c", "user.name=M0-127",
  "-c", "commit.gpgsign=false", ...args], { encoding: "utf8" });
g("init", "-q", "-b", "main"); g("add", "-A"); g("commit", "-q", "-m", "scratch base");
const shared = join(base, "shared"); mkdirSync(shared);
const vfile = join(base, "verdict.json");
const r = spawnSync(process.execPath, ["scripts/battery.mjs"], { cwd: join(repo, "bio-plane"), encoding: "utf8",
  timeout: RUN_BUDGET_MS, env: { ...process.env, BIO_SHARED_TEMP_ROOTS: shared, BIO_BATTERY_VERDICT: vfile } });
const measured = budgetAssert(t, "run-budget: the scratch battery", r, RUN_BUDGET_MS, "every arm of section 1");
if (measured) {
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  let v = null;
  try { v = JSON.parse(readFileSync(vfile, "utf8")); } catch { /* asserted below */ }
  const line = (f) => (out.match(new RegExp(`^  (?:ok  |FAIL|skip|NOTM)  ${f.replace(/\./g, "\\.")} .*$`, "m")) || [""])[0];
  const pidOf = (f) => Number((/ · pid (\d+)$/.exec(line(f)) || [])[1] || NaN);
  t("the incident's shape: every suite green (3/3) — the suite figure says nothing is wrong", (out.match(/^(\d+\/\d+) suites green/m) || [])[1], "3/3");
  t("...and the run is RED all the same (D-186 fails the run)", r.status !== 0, true);
  t("(b) EVERY result line ends with its suite's pid", ["clean.test.mjs", "pidnamed.test.mjs", "windowed.test.mjs"].map((f) => Number.isInteger(pidOf(f))), [true, true, true]);
  const pidDir = v && Array.isArray(v.residue) ? v.residue.find((x) => /bio-battery-\d+-plant$/.test(x.path)) : null;
  const winDir = v && Array.isArray(v.residue) ? v.residue.find((x) => /miniflare-bb0$/.test(x.path)) : null;
  t("the verdict file lists BOTH residue entries", v && Array.isArray(v.residue) ? v.residue.length : -1, 2);
  t("(b) the pid on pidnamed's result line IS the pid the suite put in its directory's name",
    pidDir ? Number((/bio-battery-(\d+)-plant$/.exec(pidDir.path) || [])[1]) : null, pidOf("pidnamed.test.mjs"));
  t("...so the residue is attributed to it BY PID", pidDir && [pidDir.suite, pidDir.pid, pidDir.basis, pidDir.sandboxes],
    ["pidnamed.test.mjs", pidOf("pidnamed.test.mjs"), "pid", 2]);
  t("a residue with no pid in its name is attributed by the WINDOW it appeared in, and says so",
    winDir && [winDir.suite, winDir.pid, winDir.basis], ["windowed.test.mjs", pidOf("windowed.test.mjs"), "window"]);
  t("the battery prints each residue BY PATH, with its suite",
    [!!pidDir && out.includes(`RESIDUE (D-186): ${pidDir.path} — 2 miniflare sandbox(es) — left by pidnamed.test.mjs (pid ${pidDir.pid}, by the pid in its name)`),
     !!winDir && out.includes(`RESIDUE (D-186): ${winDir.path} — 1 miniflare sandbox(es) — left by windowed.test.mjs (pid ${winDir.pid}, by the window it appeared in)`)], [true, true]);
  t("the battery's own RED line names the residue, not only the suite count",
    /^battery verdict: RED · RESIDUE \(D-186\): .*bio-battery-\d+-plant \(pidnamed\.test\.mjs\)/m.test(out), true);
  /* THE GATE HALF: what tools/gates.mjs prints for this step, from the same functions, then what the workflow writes. */
  const step = { label: "battery (all)" };
  const causes = stepCauses(step, { status: r.status }, v);
  const log = `=== gates · battery (all): npm run test:battery\n${out}\ngates: RED · class FULL\n`
    + `${causesLine([{ label: step.label, ok: false, causes }], "RED")}\n${RECORD("RED")}\n`;
  const a = annot(log, 1);
  const p = guard.parseVerdictAnnotation(a.annotation);
  t("THE ROW'S ACCEPTANCE: the annotation reads RED and NEVER `FAILED=none`", [p && p.verdict, /FAILED=none/.test(a.annotation)], ["RED", false]);
  t("...it names the residue BY PATH and the suite that left it, read back through the guard's parser",
    p && pidDir ? p.causes.some((c) => c.kind === "residue" && c.detail === `${pidDir.path}:by=pidnamed.test.mjs:pid=${pidDir.pid}`) : false, true);
  t("...and the second residue too", p && winDir ? p.causes.some((c) => c.kind === "residue" && c.detail.startsWith(`${winDir.path}:by=windowed.test.mjs:`)) : false, true);
  t("...and no suite, because none failed", p ? p.causes.filter((c) => c.kind === "suite").length : -1, 0);
  /* THE WORKFLOW'S OWN INVOCATION: the CLI on a log file, with the step summary Actions reads. */
  const logFile = join(base, "gate.log"), summary = join(base, "summary.md");
  writeFileSync(logFile, log);
  const cli = spawnSync(process.execPath, [WRITER, "--log", logFile, "--tree", T1, "--exit", "1", "--t0", "10", "--t1", "70"],
    { encoding: "utf8", env: { ...process.env, GITHUB_STEP_SUMMARY: summary } });
  let sum = ""; try { sum = readFileSync(summary, "utf8"); } catch { /* asserted */ }
  t("the CLI the workflow runs prints the same annotation, exits non-zero, and its summary names the residue",
    [String(cli.stdout).includes(`::notice title=gate verdict::VERDICT=RED TREE=${T1} CLASS=FULL EXIT=1 WALL=60s FAILED=residue:`), cli.status,
     !!pidDir && sum.includes(`residue:${pidDir.path}:by=pidnamed.test.mjs`)], [true, 1, true]);
}
rmSync(base, { recursive: true, force: true });

/* ======================================================================================================== */
section("2. EVERY OTHER CAUSE THAT CAN TURN THE GATE RED IS NAMED");
{
  const ok0 = { status: 0 };
  t("a passing step names nothing", stepCauses({ label: "coverage --strict" }, ok0, null), []);
  t("coverage --strict failing is NAMED", stepCauses({ label: "coverage --strict" }, { status: 1 }, null), ["step:coverage--strict:exit=1"]);
  t("the civicos-ui harness failing is NAMED", stepCauses({ label: "civicos-ui (all)" }, { status: 3 }, null), ["step:civicos-ui:exit=3"]);
  t("plancheck failing is NAMED", stepCauses({ label: "plancheck --local" }, { status: 1 }, null), ["step:plancheck:exit=1"]);
  t("a targeted UI suite failing is NAMED by its label", stepCauses({ label: "ui some.test.mjs" }, { status: 1 }, null), ["step:ui-some.test.mjs:exit=1"]);
  t("a battery that died before writing its verdict file is NAMED as such",
    stepCauses({ label: "battery (all)" }, { status: null, signal: "SIGKILL" }, null), ["step:battery:exit=none:signal=SIGKILL:no-verdict-file"]);
  t("a failed suite is named by its unit", stepCauses({ label: "battery (all)" }, { status: 1 }, { verdict: "RED", failed: ["plane:x.test.mjs"] }), ["plane:x.test.mjs"]);
  t("a shared log (D-425) is NAMED", stepCauses({ label: "battery (all)" }, { status: 1 }, { verdict: "RED", failed: [], sharedLog: true }), ["sharedlog:battery"]);
  t("a leak whose entries could not be listed is still NAMED",
    stepCauses({ label: "battery (all)" }, { status: 1 }, { verdict: "RED", failed: [], leaking: true }), ["residue:unlisted:by=UNDETERMINED:pid=unknown"]);
  t("an expired budget is NAMED as NOT MEASURED, per unit",
    stepCauses({ label: "battery (all)" }, { status: 124 }, null, { timedOut: true, unmeasured: ["plane:slow.test.mjs"] }), ["notmeasured:plane:slow.test.mjs"]);
  /* through the writer: a planted coverage failure in a gate log, and a gate that crashed */
  const cov = [{ label: "battery (all)", ok: true, causes: [] }, { label: "coverage --strict", ok: false, causes: stepCauses({ label: "coverage --strict" }, { status: 1 }, null) }];
  t("PLANTED COVERAGE FAILURE: the annotation names coverage --strict",
    parsed(`=== gates · coverage --strict: node scripts/coverage.mjs --strict\ngates: RED · class FULL\n${causesLine(cov, "RED")}\n${RECORD("RED")}\n`).failed, ["step:coverage--strict:exit=1"]);
  t("a gate that CRASHED BEFORE THE BATTERY reads UNDETERMINED and says so",
    parsed("gates: change class FULL — x\nTypeError: boom\n").failed, ["gate:no-record:before-any-step:exit=1"]);
  t("a gate that died MID-BATTERY names the battery's own FAILED and RESIDUE lines and where it died",
    parsed("=== gates · battery (all): npm run test:battery\n  FAILED: a.test.mjs, b.test.mjs\n  RESIDUE (D-186): /t/bio-battery-9-x — 1 miniflare sandbox(es) — left by c.test.mjs (pid 9, by the pid in its name)\n", 143).failed,
    ["a.test.mjs", "b.test.mjs", "residue:/t/bio-battery-9-x:by=c.test.mjs:pid=9", "gate:no-record:after=battery-(all):exit=143"]);
  t("a gate that ran but could not RECORD (the tree moved) says so",
    parsed(`gates: RED · class FULL\n${causesLine([{ ok: false, causes: ["plane:a.test.mjs"] }], "RED")}\ngates: NOT RECORDED — the tree changed while the gate ran\n`).failed,
    ["plane:a.test.mjs", "gate:not-recorded", "gate:no-record:before-any-step:exit=1"]);
}

/* ======================================================================================================== */
section("3. THE LIAR: a verdict that says RED (or anything but GREEN) with FAILED=none is IMPOSSIBLE");
{
  const corpus = {
    "RED recorded, CAUSES line present": `gates: RED · class FULL\ngates: CAUSES plane:a.test.mjs\n${RECORD("RED")}\n`,
    "RED recorded, NO CAUSES line and no battery lines (a pre-M0-127 gate)": `gates: RED · class FULL\n${RECORD("RED")}\n`,
    "RED recorded, an EMPTY CAUSES line": `gates: CAUSES \n${RECORD("RED")}\n`,
    "RED recorded, the 6ef503c4 shape: 282/282 green and a LEAKING line only": `282/282 suites green · 16000 assertions passing · 900.0s · run 1.a\n  LEAKING 2 miniflare sandbox(es) in 1 director(ies) (D-186): bio-battery-3964-eIXKeF\n${RECORD("RED")}\n`,
    "NOT MEASURED recorded, no CAUSES": `${RECORD("NOT MEASURED")}\n`,
    "nothing recorded, empty log": "",
    "nothing recorded, a GREEN-looking log": "gates: GREEN · class FULL\n",
  };
  let reds = 0;
  for (const [name, log] of Object.entries(corpus)) {
    const a = annot(log, 1), p = guard.parseVerdictAnnotation(a.annotation);
    if (a.verdict === "RED") reds++;
    t(`${name}: reads ${a.verdict}, and FAILED= names at least one cause`, [p && p.failed.length > 0, p && p.unnamed, /FAILED=none/.test(a.annotation)], [true, false, false]);
  }
  t("the 6ef503c4 shape names the leaked directory itself, its suite UNDETERMINED (that battery printed no pid)",
    parsed(corpus["RED recorded, the 6ef503c4 shape: 282/282 green and a LEAKING line only"]).failed, ["residue:bio-battery-3964-eIXKeF:by=UNDETERMINED:pid=3964"]);
  t("the corpus is not empty and holds REDs (a liar check over no RED proves nothing)", [Object.keys(corpus).length, reds], [7, 4]);
  t("the gate's own line names SOMETHING even when no step recorded a cause", causesLine([], "RED"), "gates: CAUSES unnamed:RED-with-no-failed-step");
}

/* ======================================================================================================== */
section("4. OVER-STRICTNESS: a GREEN run names nothing, whatever its suites printed");
{
  const green = `  ok    battery-verdict.test.mjs    900ms  79 pass · pid 12\n  FAILED: liar.test.mjs\n          (a scratch battery's line, echoed)\ngates: GREEN · class FULL\n${RECORD("GREEN")}\n`;
  const a = annot(green, 0);
  t("GREEN reads FAILED=none, and the writer exits 0", [a.verdict, a.failed, / FAILED=none$/.test(a.annotation), a.exitCode], ["GREEN", [], true, 0]);
  t("a pid on the result line does not disturb the prefix every status reader matches",
    /^ {2}(ok {2}|FAIL|skip|NOTM) {2}battery-verdict\.test\.mjs/m.test(green), true);
}

t(`FOOT — all ${SECTIONS} sections reached`, reached, SECTIONS);
console.log(`\ngateverdict: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
