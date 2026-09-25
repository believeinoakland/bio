/* NEGATIVE CONTROL: (run 2026-09-18, M0-67/D-425) FOUR ARMS ON `scripts/battery.mjs`, each armed ALONE by hand with the fixed runner copied aside (sha256 5b3da92e…, 48,439 B) and restored against that copy by sha256 AND `cmp` after every arm ("restored byte-identically: YES" each time). BASELINE (nothing armed): 27 pass, 0 fail. (0) `prefix` — the PRE-M0-67 runner itself (sha256 0c9d3d87…) -> 13 pass, 14 FAIL: every liar arm (the planted `3 pass, 2 fail` suite exiting 0 reads `ok` under `2/2 suites green` and the scratch battery EXITS 0 — D-425's question answered YES), the run-id arm, and every shared-log arm; the over-strictness arms stay GREEN. (a) `crosscheck` — `const lied = false` -> 20 pass, 7 FAIL, exactly the seven liar arms (got `2/2`, exit 0); log and over-strictness arms GREEN. (b) `logguard` — no start refusal AND `logIntrusions` returns [] -> 21 pass, 6 FAIL, exactly the six shared-log arms: B RUNS its suite onto A's file and A prints no LOG SHARED line; the tally arms and both SEQUENTIAL-append arms stay GREEN. (c) `refusal-only` — start refusal off, end check ON -> 22 pass, 5 FAIL: the four refusal arms, AS DECLARED, plus one NOT as declared — in the `>>` form A still names the file (`another run's header or completion line is in it … another battery still has it open`), but in the `>` form A's LOG SHARED line is ABSENT from the file while A's exit is still non-zero (got [false,false,true]): B, unrefused and truncating, finished after A and overwrote A's closing lines at the same offsets. The declaration was wrong and the arm was right — a later truncating writer can erase anything the first run prints, which is why the START refusal is the load-bearing half for `>` and the exit status is the only part of A's verdict a `>` collision cannot touch. THE BRIEF'S OWN CONTROL, on the real tree: one `t("M0-67 PLANTED", 1, 2)` added to `machinefences-dec49.test.mjs` (pristine sha256 3216a898…, 29,611 B) -> alone `70 pass, 1 fail`, exit 1 (unpiped); in the battery `FAIL … 70 pass, 1 FAIL`, `0/1 suites green`, exit 1. Then its exit forced to `process.exit(0)` -> alone `70 pass, 1 fail`, exit 0; PRE-FIX runner `ok … 70 pass, 1 FAIL`, `1/1 suites green`, EXIT 0; FIXED runner `FAIL … 70 pass, 1 FAIL — and EXITED 0 (D-425: counted RED)`, `0/1 suites green`, `EXIT/TALLY DISAGREE (D-425)` named, exit 1. Suite restored byte-identically. Recorded in MEASUREMENTS.md under M0-67. (run 2026-09-19, M0-65/D-413) FOUR MORE ARMS ON `scripts/battery.mjs`, driven by a scratch script that patches ONE anchor (asserting it matched exactly once), runs this suite, and restores from a per-arm copy of the fixed runner (sha256 61b485f0…, 51,166 B) by sha256 AND `cmp` ("MATCH … identical" every arm). BASELINE (nothing armed): 41 pass, 0 fail. (d) `widening` — the tally reverted to the pre-M0-65 pattern (`pass(?:ed)?,` then a REQUIRED fail count) -> 33 pass, 8 FAIL, exactly as declared: the `passing` fixture and the `passing, failing` fixture (each read `assertions unknown`), the exact sum (9, not 27), the headline segment and the other-direction arm (f3/f4 now named as excluded), the `12 passing, 2 failing` liar (read ok, exit 0) and both over-strictness arms (g2 unknown); `N pass, M fail`, `N passed, M failed`, both named-unknown arms and sections 1-3 stay GREEN. (e) `reportline` — the headline segment and the EXCLUDED line reverted to `N suite(s) reported no assertion count: …` -> 37 pass, 4 FAIL, as declared: the headline EXCLUDES segment, the EXCLUDED line naming both suites, the old-shrug-gone arm, and section 2's corrected no-count arm; every count and the exact sum stay GREEN (the old headline still parses). (f) `liar` — THE ROW'S LIAR CLAUSE BUILT: every group optional (`(\d+)?`), nothing filtered, so every suite "has a tally" and the last empty match counts NaN -> 23 pass, 18 FAIL: every exact count, the sum, both named-unknown arms, the EXCLUDED line, and section 1's liars (a NaN fail count never reaches the verdict). (g) over-strictness is carried IN the suite, not by an arm: a fully tallied run must print the old headline shape with no EXCLUDES segment and no EXCLUDED line, and a bare `3 passed` must stay UNCOUNTED — both GREEN at baseline. Recorded in MEASUREMENTS.md under M0-65. (run 2026-09-22, M0-107) THREE ARMS ON THE BUDGET VERDICT, driven by `test/m0107-budget.control.mjs`, each ALONE, restored by sha256 AND `cmp`; BASELINE 79 pass, 0 fail. (h) B2, the NOT MEASURED rule removed from the runner -> 68 pass, 11 FAIL: every (4a) arm, (4b)'s NOTM and its verdict-file arms, and the planted hang (4c) — the liar that raises budgets instead of reading them gets no NOTM at all; section 1's liar stays GREEN. (i) B3, the runner's pid filter removed -> 76 pass, 3 FAIL: (4b)'s echoed-marker arm and the two RED-count arms it moves; (4a) GREEN. (j) B4, `expired()` also taking a set signal (M0-103's "or the signal is set", NOT taken by BOB #28) -> 76 pass, 3 FAIL: the self-SIGTERM FINDING arm and the two RED-count arms; the planted hang (4c) GREEN. NEGATIVE CONTROL: (run 2026-09-25, D-566) the runner's DERIVED closure (`REAL_MODULES`, `moduleClosure` static mode), by a scratch driver, each arm ALONE, restored by `cp`, `cmp`, sha256 and byte count (`scripts/battery.mjs` 66903349… 61,229 B), the probe deleted after each. (A5) ACCEPTS-WHEN — `scripts/d566probe.mjs` imported STATICALLY by `scripts/battery.mjs`: MUST NOT fail; 79 / 0 (and gateverdict 42/0, battery-provenance 30/0, battery-residue 58/0 — those two carry the same derivation and were driven ONLY by this accepts arm, no hand-list arm of their own). (A6) THE CONTROL — A5 armed and the HAND list `["provenance.mjs", "residue.mjs"]` restored: MUST fail; exit 1, 41 named FAILs led by "THE LIAR: a suite printing `3 pass, 2 fail` and exiting 0 is RED in its own line", then the module dies at an `ENOENT` on the fixture's `env-probe` (the scratch runner never started). */
/* M0-67 / D-425: CAN THE BATTERY REPORT GREEN OVER A SUITE THAT PRINTED FAIL?
 *
 * Two mechanisms, both driven on purpose, because "cannot reproduce" from one clean
 * run is how this question would have been closed wrongly.
 *
 * 1. THE VERDICT. Until M0-67 `scripts/battery.mjs` decided green/red from the EXIT
 *    STATUS ALONE. It read each suite's `N pass, M fail` line — and printed it,
 *    uppercase FAIL and all — but M never reached the verdict. So a suite that printed
 *    `68 pass, 2 FAIL` and exited 0 read `ok` and counted green. No suite in the
 *    estate was measured doing that (the sweep is in MEASUREMENTS.md), which is
 *    exactly why it has to be pinned rather than trusted: the next suite written with
 *    an exit path that forgets its counter would pass the gate silently. The runner
 *    now cross-checks, and a printed failure with exit 0 is RED, named.
 *
 * 2. THE LOG. The observed line was REPRODUCED EXACTLY by two batteries writing ONE
 *    file: REC-124's in-flight tree prints `machinefences-dec49 68 pass, 2 FAIL` and
 *    the REC-133 tree cannot (67 assertions at d5aa3ec9, measured). Two runs into one
 *    log leave the other run's FAIL line above THIS run's green completion line and
 *    THIS run's exit 0 — the whole observed shape. The runner now refuses to start
 *    onto a log another battery is writing, stamps a run id on its header and its
 *    completion line, and reads its own log back at the end.
 *
 * Every arm drives the REAL runner, copied into a scratch estate (battery-residue's
 * method and reason: a fixture copy of the report would agree with itself). */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync, openSync, closeSync, readFileSync, existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { moduleClosure } from "./moduleclosure.mjs";   /* D-566: the runner's closure is derived, never listed */
/* M0-107: an expired budget MEASURED NOTHING — one named budget assertion per spawn or deadline, and the
   arms that would read the expired result are SKIPPED, so the battery reads this suite NOT MEASURED. */
import { budgetAssert, until, withinBudget } from "./budget.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REAL_RUNNER = join(DIR, "..", "scripts", "battery.mjs");
/* CORRECTED 2026-09-25 by D-566: this was a HAND LIST (`["provenance.mjs", "residue.mjs"]`), and D-237's comment above
   records the day it fell behind the runner's imports. It is now derived by `moduleClosure`'s STATIC mode (M0-169) from
   the runner itself, read at load time so a control driver's patched runner is the one whose closure is carried. A
   module outside `scripts/` would not land where the loops below put it, so that THROWS rather than copying wrong. */
const REAL_MODULES = moduleClosure({ repo: join(DIR, "..", ".."), roots: ["bio-plane/scripts/battery.mjs"],
  dynamic: false, includeRoots: false }).map((rel) => {
  if (!rel.startsWith("bio-plane/scripts/")) throw new Error(`D-566: battery.mjs reaches ${rel}, outside scripts/`);
  return rel.slice("bio-plane/scripts/".length);
});

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}\n          got  ${JSON.stringify(got)}\n          want ${JSON.stringify(want)}`); }
};

const LSOF_BUDGET_MS = 10_000, RUN_BUDGET_MS = 120_000, READY_BUDGET_MS = 30_000, REFUSE_BUDGET_MS = 60_000;
const LSOF = spawnSync("lsof", ["-v"], { encoding: "utf8", timeout: LSOF_BUDGET_MS });
/* M0-107: an EXPIRED probe is not an ABSENT tool. Until this line an `lsof -v` that ran out of time read
   as "lsof is absent" and the shared-log arms SKIPPED on a false reason; now the expiry is NOT MEASURED. */
const LSOF_MEASURED = budgetAssert(t, "lsof-budget: the `lsof -v` probe", LSOF, LSOF_BUDGET_MS,
  "whether lsof is present, so every shared-log arm of section 3");
const HAVE_LSOF = LSOF_MEASURED && !LSOF.error;

const bases = [];
const estate = (suites) => {
  const base = mkdtempSync(join(tmpdir(), "m067-"));
  bases.push(base);
  const repo = join(base, "repo");
  mkdirSync(join(repo, "bio-plane", "scripts"), { recursive: true });
  mkdirSync(join(repo, "bio-plane", "test"), { recursive: true });
  copyFileSync(REAL_RUNNER, join(repo, "bio-plane", "scripts", "battery.mjs"));
  for (const m of REAL_MODULES) copyFileSync(join(DIR, "..", "scripts", m), join(repo, "bio-plane", "scripts", m));
  for (const [rel, body] of Object.entries(suites)) writeFileSync(join(repo, "bio-plane", "test", rel), body);
  const g = (...args) => spawnSync("git", ["-C", repo, "-c", "user.email=m067@example.invalid", "-c", "user.name=M0-67",
    "-c", "commit.gpgsign=false", ...args], { encoding: "utf8" });
  g("init", "-q", "-b", "main"); g("add", "-A"); g("commit", "-q", "-m", "scratch base");
  /* the shared-temp report is D-237's and is not this suite's subject; point it at an
     empty root so the scratch runs stay fast and say nothing about the real estate */
  const shared = join(base, "shared"); mkdirSync(shared);
  return { base, cwd: join(repo, "bio-plane"), env: { ...process.env, BIO_SHARED_TEMP_ROOTS: shared } };
};
const suite = (name, { pass: p, fail: f, exit, extra = "", holdMs = 0 }) =>
  `${extra}\nconst done = () => { console.log("${name}: ${p} pass, ${f} fail"); process.exit(${exit}); };\n`
  + (holdMs ? `setTimeout(done, ${holdMs});\n` : `done();\n`);
let piped = 0;
const runPiped = (e, extraEnv = {}, budgetMs = RUN_BUDGET_MS) => {
  const r = spawnSync(process.execPath, ["scripts/battery.mjs"], { cwd: e.cwd, encoding: "utf8", timeout: budgetMs, env: { ...e.env, ...extraEnv } });
  piped++;
  /* M0-107: `measured` false means this scratch battery's budget EXPIRED; the block reading it is skipped. */
  const measured = budgetAssert(t, `run-budget: scratch battery ${piped}`, r, budgetMs,
    `every arm reading scratch battery ${piped}`);
  return { code: r.status, out: `${r.stdout || ""}${r.stderr || ""}`, measured };
};
const headline = (out) => (out.match(/^(\d+\/\d+) suites green/m) || [])[1] || null;
const statusOf = (out, file) => { const m = out.match(new RegExp(`^  (ok  |FAIL|skip|NOTM)  ${file.replace(/\./g, "\\.")}`, "m")); return m ? m[1].trim() : null; };

/* ============== 1. THE VERDICT READS THE PRINTED TALLY ============== */
console.log("\n--- 1. a printed failure is a failure, whatever the exit said ---");
{
  const e = estate({
    "honest.test.mjs": suite("honest", { pass: 4, fail: 0, exit: 0 }),
    "liar.test.mjs": suite("liar", { pass: 3, fail: 2, exit: 0 }),
  });
  const r = runPiped(e);
  if (r.measured) {
  t("THE LIAR: a suite printing `3 pass, 2 fail` and exiting 0 is RED in its own line", statusOf(r.out, "liar.test.mjs"), "FAIL");
  t("the headline counts it: 1/2 suites green, not 2/2", headline(r.out), "1/2");
  t("the battery's exit status says so (1 failed suite)", r.code, 1);
  t("the disagreement is NAMED, with the suite and both halves of it",
    /EXIT\/TALLY DISAGREE \(D-425\): liar\.test\.mjs printed 2 fail and exited 0/.test(r.out), true);
  t("the FAILED line names it", /FAILED: liar\.test\.mjs/.test(r.out), true);
  t("and the honest suite beside it is untouched", statusOf(r.out, "honest.test.mjs"), "ok");
  } /* end of r.measured (M0-107) */
}
{
  /* The `N passed, M failed` spelling — reextract and ocr-member-e2e print it from an
     `exit` listener when a suite ends before its own foot. Same rule, other spelling. */
  const e = estate({ "foot.test.mjs": `console.log("foot: 5 passed, 1 failed — SUITE ENDED BEFORE ITS OWN FOOT"); process.exit(0);\n` });
  const r = runPiped(e);
  if (r.measured) {
  t("the `passed/failed` spelling of a printed failure with exit 0 is RED too", [statusOf(r.out, "foot.test.mjs"), r.code], ["FAIL", 1]);
  } /* end of r.measured (M0-107) */
}
{
  /* A suite that prints a SKIPPED marker and ALSO a failing tally cannot hide behind the
     skip: a suite that printed failures did not merely skip. */
  const e = estate({ "skipfail.test.mjs": `console.log("skipfail: SKIPPED — no ssh-keygen");\nconsole.log("skipfail: 1 pass, 1 fail");\nprocess.exit(0);\n` });
  const r = runPiped(e);
  if (r.measured) {
  t("a SKIPPED marker does not launder a printed failure", [statusOf(r.out, "skipfail.test.mjs"), r.code], ["FAIL", 1]);
  } /* end of r.measured (M0-107) */
}

/* ============== 2. WHAT MUST NOT CHANGE (over-strictness) ============== */
console.log("\n--- 2. over-strictness: honest runs read exactly as before ---");
{
  const e = estate({
    "a.test.mjs": suite("a", { pass: 5, fail: 0, exit: 0 }),
    /* the word FAIL in a PASSING label, and a failure count of an INNER child printed
       before the suite's own tally: the LAST tally is the suite's, as it always was */
    "b.test.mjs": `console.log("  PASS  a FAIL path refuses");\nconsole.log("inner: 1 pass, 3 fail");\n`
      + suite("b", { pass: 6, fail: 0, exit: 0 }),
    "c.test.mjs": suite("c", { pass: 2, fail: 1, exit: 1 }),
    "d.test.mjs": `console.log("d: SKIPPED — the tool is absent"); process.exit(0);\n`,
    "e.test.mjs": `console.log("no count here"); process.exit(0);\n`,
  });
  const r = runPiped(e);
  if (r.measured) {
  t("an honest green suite stays ok", statusOf(r.out, "a.test.mjs"), "ok");
  t("a PASS label containing FAIL, and an inner child's failing count before the suite's own clean tally, stay ok",
    statusOf(r.out, "b.test.mjs"), "ok");
  t("an honest failure (exit 1) is RED exactly as before, and is NOT reported as a disagreement",
    [statusOf(r.out, "c.test.mjs"), /EXIT\/TALLY DISAGREE[^\n]*c\.test\.mjs/.test(r.out)], ["FAIL", false]);
  t("a named SKIP with no failing tally is still a skip", statusOf(r.out, "d.test.mjs"), "skip");
  /* CORRECTED 2026-09-19 by M0-65 (D-413), not exempted: this read
     `/reported no assertion count: e\.test\.mjs/`, and that wording WAS the defect — it
     named the suite as a formatting note while the headline's assertion total silently
     left it out. The line now says the total EXCLUDES it; the status half is unchanged. */
  t("a suite with no readable count is still UNKNOWN, not red and not zero",
    [statusOf(r.out, "e.test.mjs"), /EXCLUDED FROM THE ASSERTION TOTAL[^\n]*: [^\n]*e\.test\.mjs/.test(r.out)], ["ok", true]);
  t("headline 3/5 (a, b, e) and exit 1 (c only)", [headline(r.out), r.code], ["3/5", 1]);
  } /* end of r.measured (M0-107) */
}

/* ============== 2b. M0-65 / D-413: WHAT THE ASSERTION TOTAL COUNTS, AND SAYS IT LEAVES OUT ==============
 *
 * HOW A LIAR WOULD SATISFY THIS, stated before what it checks: widen the tally to
 * `(\d+)?` everywhere so every suite "has a tally" that counts nothing — no suite is
 * ever excluded, the loud line never prints, and the total reads 0 or NaN; or reword
 * the report line without naming the excluded suites. So every accepted form is held
 * to its EXACT count and the headline to the EXACT sum, the excluded suites are held
 * to be NAMED on a line that says EXCLUDED, and the tallied suites are held to be
 * absent from that line — both directions, in one estate. */
console.log("\n--- 2b. every accepted tally form is COUNTED; a suite with none is NAMED AS EXCLUDED (D-413) ---");
/* CORRECTED 2026-09-23 by M0-127, never exempted: the result line now ENDS ` · pid <n>` (the suite's own pid, so a
   D-186 residue names the suite that left it). This reader took everything after the duration as the COUNT, so it read
   `4 pass · pid 3042` where the count is `4 pass`; the pid is its own field and is stripped here. */
const countOf = (out, file) => { const m = out.match(new RegExp(`^  (?:ok  |FAIL|skip)  ${file.replace(/\./g, "\\.")}\\s+\\d+ms  (.*?)(?: · pid (?:\\d+|unknown))?$`, "m")); return m ? m[1] : null; };
const assertionsOf = (out) => { const m = out.match(/^\d+\/\d+ suites green · (?:\d+ skipped · )?(\d+) assertions passing · /m); return m ? +m[1] : null; };
const excludedLine = (out) => (out.match(/^  EXCLUDED FROM THE ASSERTION TOTAL[^\n]*/m) || [])[0] || null;
{
  const e = estate({
    "f1-passfail.test.mjs": `console.log("f1: 4 pass, 0 fail"); process.exit(0);\n`,
    "f2-passedfailed.test.mjs": `console.log("f2: 5 passed, 0 failed"); process.exit(0);\n`,
    "f3-passing.test.mjs": `console.log("f3: 7 passing"); process.exit(0);\n`,
    "f4-passingfailing.test.mjs": `console.log("f4: 11 passing, 0 failing"); process.exit(0);\n`,
    "n1-none.test.mjs": `console.log("n1 ran and printed no tally"); process.exit(0);\n`,
    /* a bare `N passed` is prose, not one of the four forms: it must stay UNCOUNTED
       and NAMED, or the widening has gone past what it was asked for */
    "n2-bare.test.mjs": `console.log("n2: 3 passed"); process.exit(0);\n`,
  });
  const r = runPiped(e);
  if (r.measured) {
  t("form `N pass, M fail` is COUNTED at its exact number", countOf(r.out, "f1-passfail.test.mjs"), "4 pass");
  t("form `N passed, M failed` is COUNTED at its exact number", countOf(r.out, "f2-passedfailed.test.mjs"), "5 pass");
  t("form `N passing` (no fail count) is COUNTED at its exact number — the `passing` fixture", countOf(r.out, "f3-passing.test.mjs"), "7 pass");
  t("form `N passing, M failing` is COUNTED at its exact number — the `passing, failing` fixture", countOf(r.out, "f4-passingfailing.test.mjs"), "11 pass");
  t("the headline's assertion total is the EXACT sum of the four tallied suites (4+5+7+11), not 0, not NaN", assertionsOf(r.out), 27);
  t("the two untallied suites are UNKNOWN in their own lines, never zero", [countOf(r.out, "n1-none.test.mjs"), countOf(r.out, "n2-bare.test.mjs")], ["assertions unknown", "assertions unknown"]);
  t("the HEADLINE itself says the total EXCLUDES them, as a segment right after the figure",
    /^6\/6 suites green · 27 assertions passing · EXCLUDES 2 untallied suite\(s\) · [\d.]+s · run \S+$/m.test(r.out), true);
  const ex = excludedLine(r.out) || "";
  t("the line below says EXCLUDED FROM THE ASSERTION TOTAL and names BOTH excluded suites",
    [!!excludedLine(r.out), /n1-none\.test\.mjs/.test(ex), /n2-bare\.test\.mjs/.test(ex), /counts NONE of their assertions/.test(ex)], [true, true, true, true]);
  t("and the other direction: no TALLIED suite is named on the excluded line",
    ["f1-passfail", "f2-passedfailed", "f3-passing", "f4-passingfailing"].filter((f) => ex.includes(f)), []);
  t("the old shrug is gone — `reported no assertion count` does not print", /reported no assertion count/.test(r.out), false);
  t("the tally moved NO suite status: 6/6 green, exit 0", [headline(r.out), r.code], ["6/6", 0]);
  } /* end of r.measured (M0-107) */
}
{
  /* the `passing, failing` form with failures and exit 0 reaches the verdict exactly as
     `N pass, M fail` does (D-425): widening the tally must widen the cross-check with it */
  const e = estate({ "pf-liar.test.mjs": `console.log("pf-liar: 12 passing, 2 failing"); process.exit(0);\n` });
  const r = runPiped(e);
  if (r.measured) {
  t("`12 passing, 2 failing` with exit 0 is RED and named as an EXIT/TALLY DISAGREE",
    [statusOf(r.out, "pf-liar.test.mjs"), /EXIT\/TALLY DISAGREE \(D-425\): pf-liar\.test\.mjs printed 2 fail/.test(r.out), r.code], ["FAIL", true, 1]);
  } /* end of r.measured (M0-107) */
}
{
  /* OVER-STRICTNESS: a run where every suite tallied prints the headline exactly as it
     did before M0-65 — no EXCLUDES segment and no EXCLUDED line. A loud line that also
     fires on a clean run is noise, and noise is how a loud line becomes a shrug again. */
  const e = estate({
    "g1.test.mjs": `console.log("g1: 2 pass, 0 fail"); process.exit(0);\n`,
    "g2.test.mjs": `console.log("g2: 3 passing"); process.exit(0);\n`,
  });
  const r = runPiped(e);
  if (r.measured) {
  t("a fully tallied run: headline `2/2 suites green · 5 assertions passing · <time> · run <id>`, no EXCLUDES segment",
    /^2\/2 suites green · 5 assertions passing · [\d.]+s · run \S+$/m.test(r.out), true);
  t("and no EXCLUDED line at all", excludedLine(r.out), null);
  } /* end of r.measured (M0-107) */
}

/* ============== 3. ONE LOG, ONE RUN ============== */
console.log("\n--- 3. a log another battery is writing is refused, and a shared log is named ---");
const runId = (out) => ({ head: (out.match(/^battery: .*· run (\S+)$/m) || [])[1] || null,
  foot: (out.match(/^\d+\/\d+ suites green .*· run (\S+)$/m) || [])[1] || null });
{
  const e = estate({ "a.test.mjs": suite("a", { pass: 1, fail: 0, exit: 0 }) });
  const r = runPiped(e);
  if (r.measured) {
  const id = runId(r.out);
  t("the header and the completion line carry the SAME run id, so a reader can tell one run from two",
    [!!id.head, id.head === id.foot], [true, true]);
  } /* end of r.measured (M0-107) */
}
/* M0-107: every wait in this section is a BUDGET, and every budget has its outcome check. Until this item
   the two readiness waits were hand-rolled `Date.now()` loops whose expiry fell through to the "(setup)"
   assertion as a FINDING (and about six findings after it), battery A had no budget at all, and the lsof
   probe's expiry read as "lsof is absent". Now: a readiness wait ends when the file appears (measured), when
   A EXITS first (a FINDING about A — a subject that dies before it gets there is never a timeout), or when
   its budget expires (NOT MEASURED, and the arms that would read it are skipped). */
const A_BUDGET_MS = 120_000;
const killOwn = (child) => { try { child.kill("SIGKILL"); } catch { /* gone already */ } };
if (!LSOF_MEASURED) {
  console.log("  battery-verdict: the shared-log arms NOT MEASURED — the `lsof -v` probe's budget expired (see lsof-budget)");
} else if (!HAVE_LSOF) {
  console.log("  battery-verdict: the shared-log arms SKIPPED BY NAME — `lsof` is absent, and the guard is best effort without it");
} else {
  /* A: a battery writing a FILE and holding it for ~4 s. B: a second battery pointed at
     the SAME file while A runs. B must refuse without running a suite; A must end red
     and name the shared log, because the file is no longer one run's record. */
  const e = estate({
    "slow.test.mjs": `import { writeFileSync } from "node:fs";\nwriteFileSync(process.env.M067_READY, "1");\n`
      + suite("slow", { pass: 1, fail: 0, exit: 0, holdMs: 4000 }),
  });
  const log = join(e.base, "shared.log");
  const ready = join(e.base, "ready");
  const fdA = openSync(log, "a");
  const a = spawn(process.execPath, ["scripts/battery.mjs"], { cwd: e.cwd, env: { ...e.env, M067_READY: ready }, stdio: ["ignore", fdA, fdA] });
  let aExited = false;
  const aDone = new Promise((res) => a.on("close", (code) => { aExited = true; res(code); }));
  const w = await until(() => existsSync(ready), READY_BUDGET_MS, { stop: () => aExited });
  if (budgetAssert(t, "ready-budget: battery A reaching its slow suite (>> form)", w, READY_BUDGET_MS,
    "every `>>`-form arm (B's refusal, A's LOG SHARED line)")) {
    t("(setup) battery A reached its slow suite, so it holds the log", existsSync(ready), true);
    const fdB = openSync(log, "a");
    const b = spawnSync(process.execPath, ["scripts/battery.mjs"], { cwd: e.cwd, env: { ...e.env, M067_READY: join(e.base, "ready-b") }, stdio: ["ignore", fdB, fdB], timeout: REFUSE_BUDGET_MS });
    closeSync(fdB);
    const bMeasured = budgetAssert(t, "refuse-budget: battery B onto A's log (>> form)", b, REFUSE_BUDGET_MS,
      "B's refusal, its exit 3 and the pid it names");
    const aw = await withinBudget(aDone, A_BUDGET_MS);
    if (aw.error) killOwn(a);
    const aMeasured = budgetAssert(t, "a-budget: battery A itself (>> form)", aw, A_BUDGET_MS,
      "A's reading of its own log and its exit");
    const codeA = aw.value;
    const text = readFileSync(log, "utf8");
    console.log(`  (\`>>\` form) A said: ${(text.match(/^LOG SHARED[^\n]*/m) || ["<no LOG SHARED line>"])[0]}`);
    if (bMeasured) {
      t("battery B REFUSES to start onto a log battery A is writing (exit 3)", b.status, 3);
      t("and B ran no suite: its slow suite never signalled", existsSync(join(e.base, "ready-b")), false);
      t("B's refusal NAMES the other battery's pid and D-425",
        new RegExp(`D-425: REFUSED[^\\n]*pid ${a.pid}`).test(text), true);
    }
    if (aMeasured) {
      t("battery A reads its own log back and names it SHARED, and its exit is non-zero", [/LOG SHARED \(D-425\)/.test(text), codeA !== 0], [true, true]);
      t("A's suites were still green — the red is about the LOG, and says so rather than blaming a suite",
        /^1\/1 suites green/m.test(text), true);
    }
  } else { killOwn(a); await aDone; }
  closeSync(fdA);

  /* THE `>` FORM: B opens the file TRUNCATING it (what `node battery.mjs > log` does),
     so B's refusal lands at offset 0 over whatever A had written, and A goes on writing
     at its own offset. The observed log's shape came from exactly this family of
     accident; A must still name its file shared rather than read it back as clean. */
  {
    const logT = join(e.base, "truncated.log");
    const readyT = join(e.base, "ready-t");
    const fdAT = openSync(logT, "w");
    const aT = spawn(process.execPath, ["scripts/battery.mjs"], { cwd: e.cwd, env: { ...e.env, M067_READY: readyT }, stdio: ["ignore", fdAT, fdAT] });
    let aTExited = false;
    const aTDone = new Promise((res) => aT.on("close", (code) => { aTExited = true; res(code); }));
    const wT = await until(() => existsSync(readyT), READY_BUDGET_MS, { stop: () => aTExited });
    if (budgetAssert(t, "ready-budget: battery A reaching its slow suite (> form)", wT, READY_BUDGET_MS,
      "both `>`-form arms")) {
      const fdBT = openSync(logT, "w");
      const bT = spawnSync(process.execPath, ["scripts/battery.mjs"], { cwd: e.cwd, env: { ...e.env, M067_READY: join(e.base, "ready-bt") }, stdio: ["ignore", fdBT, fdBT], timeout: REFUSE_BUDGET_MS });
      closeSync(fdBT);
      const bTMeasured = budgetAssert(t, "refuse-budget: battery B truncating A's log (> form)", bT, REFUSE_BUDGET_MS,
        "B's refusal in the `>` form");
      const awT = await withinBudget(aTDone, A_BUDGET_MS);
      if (awT.error) killOwn(aT);
      const aTMeasured = budgetAssert(t, "a-budget: battery A itself (> form)", awT, A_BUDGET_MS,
        "A's reading of its truncated log and its exit");
      const codeAT = awT.value;
      const textT = readFileSync(logT, "utf8");
      console.log(`  (\`>\` form) A said: ${(textT.match(/^LOG SHARED[^\n]*/m) || ["<no LOG SHARED line>"])[0]}`);
      if (bTMeasured) t("`>` form: B, truncating the file A is writing, still REFUSES (exit 3)", bT.status, 3);
      if (aTMeasured) t("`>` form: A names the file SHARED — its own header was overwritten or NULs mark the truncation — and exits non-zero",
        [/LOG SHARED \(D-425\)/.test(textT), /header is not in the file|NUL bytes|refusal/.test(textT), codeAT !== 0], [true, true, true]);
    } else { killOwn(aT); await aTDone; }
    closeSync(fdAT);
  }

  /* the over-strictness half: SEQUENTIAL runs appended to one file are not a shared log
     for the SECOND run, whose own header comes after the first run's completion. */
  const log2 = join(e.base, "sequential.log");
  let seqMeasured = true;
  for (let i = 0; i < 2; i++) {
    const fd = openSync(log2, "a");
    const r = spawnSync(process.execPath, ["scripts/battery.mjs", "slow"], { cwd: e.cwd, env: { ...e.env, M067_READY: join(e.base, `seq-${i}`) }, stdio: ["ignore", fd, fd], timeout: REFUSE_BUDGET_MS });
    closeSync(fd);
    if (budgetAssert(t, `seq-budget: sequential run ${i + 1}`, r, REFUSE_BUDGET_MS, `sequential run ${i + 1}'s exit and the shared-log check over both`))
      t(`sequential run ${i + 1} into one appended file is GREEN (exit 0) — one run after another is not interleaving`, r.status, 0);
    else seqMeasured = false;
  }
  if (seqMeasured) t("and neither sequential run named the log shared", /LOG SHARED/.test(readFileSync(log2, "utf8")), false);
}


/* ============== 4. M0-107: AN EXPIRED BUDGET READS NOT MEASURED, NEVER A FINDING AND NEVER GREEN ==============
 *
 * HOW A LIAR PASSES M0-107, stated before what it checks: raise every budget until none expires, so no
 * timeout is ever printed and a hang is read as nothing. So (4c) PLANTS A HANG behind a 400 ms budget and
 * asserts the runner NAMES it NOT MEASURED, promptly; and the other arms hold the verdict rules in both
 * directions — timeouts alone are NOT MEASURED (never RED, never green), one failure more than the markers is
 * RED, a CHILD's echoed marker launders nothing, a marker with no fail count is RED, and a subject that dies
 * by its own SIGTERM is a FINDING (BOB #28: ETIMEDOUT is the only test). */
console.log("\n--- 4. M0-107: an expired budget is NOT MEASURED; a finding beside it is RED ---");
const marker = (what) => `console.log("TIMEOUT (M0-107) [pid " + process.pid + "]: ${what} — NOT MEASURED: its arms");\n`;
const verdictFile = (e) => join(e.base, "verdict.json");
const readJson = (p) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } };
{
  /* (4a) TIMEOUTS ONLY: two suites whose every failure is a marked expiry, beside one green suite that
     also reports whether the verdict variable reached it (it must not: the runner strips it). */
  const e = estate({
    "nm.test.mjs": marker("planted site one") + `console.log("nm: 3 pass, 1 fail"); process.exit(1);\n`,
    "nm0.test.mjs": marker("planted site two") + `console.log("nm0: 2 pass, 0 fail"); process.exit(0);\n`,
    "green.test.mjs": `import { writeFileSync } from "node:fs";\nwriteFileSync(process.env.M107_ENV_PROBE, String(process.env.BIO_BATTERY_VERDICT ?? "none"));\n`
      + suite("green", { pass: 4, fail: 0, exit: 0 }),
  });
  const probe = join(e.base, "env-probe");
  const r = runPiped(e, { BIO_BATTERY_VERDICT: verdictFile(e), M107_ENV_PROBE: probe });
  if (r.measured) {
    t("(4a) a suite whose ONE failure is its own marked expiry reads NOTM, not FAIL", statusOf(r.out, "nm.test.mjs"), "NOTM");
    t("(4a) a marker with exit 0 and no failure reads NOTM — NEVER green", statusOf(r.out, "nm0.test.mjs"), "NOTM");
    t("(4a) the green suite beside them stays ok", statusOf(r.out, "green.test.mjs"), "ok");
    t("(4a) the headline counts them out of green and SAYS so, after the assertion figure",
      /^1\/3 suites green · 9 assertions passing · NOT MEASURED 2 suite\(s\), a budget expired \(M0-107\) · /m.test(r.out), true);
    t("(4a) the NOT MEASURED line names each suite and what its marker said was not measured",
      [/^  NOT MEASURED \(M0-107\): nm\.test\.mjs — planted site one/m.test(r.out), /nm0\.test\.mjs — planted site two/.test(r.out)], [true, true]);
    t("(4a) a timeouts-only run EXITS 124 — not a failure count, not 0", r.code, 124);
    t("(4a) and it is NOT reported as FAILED", /^  FAILED:/m.test(r.out), false);
    const v = readJson(verdictFile(e));
    t("(4a) the verdict file says NOT MEASURED and names the two units, for the gate to record",
      [v && v.verdict, v && v.exit, v && v.notMeasured.map((x) => x.unit).sort(), v && v.failed],
      ["NOT MEASURED", 124, ["plane:nm.test.mjs", "plane:nm0.test.mjs"], []]);
    t("(4a) the verdict variable is STRIPPED from every suite's environment", readFileSync(probe, "utf8"), "none");
  }
}
{
  /* (4b) A FINDING OUTRANKS THE TIMEOUTS, in every shape a laundering could take. */
  const e = estate({
    "nm.test.mjs": marker("planted site") + `console.log("nm: 3 pass, 1 fail"); process.exit(1);\n`,
    "mixed.test.mjs": marker("planted site") + `console.log("mixed: 3 pass, 2 fail"); process.exit(1);\n`,
    /* a CHILD's marker, echoed: pid 1 is never this suite */
    "echoed.test.mjs": `console.log("TIMEOUT (M0-107) [pid 1]: a child's site — NOT MEASURED: its arms");\nconsole.log("echoed: 3 pass, 1 fail"); process.exit(1);\n`,
    "notally.test.mjs": marker("planted site") + `console.log("no count here"); process.exit(1);\n`,
    /* a subject that dies by its OWN SIGTERM, under a budget that did NOT expire: the budget assertion
       passes and the finding over the dead child FAILS — the signal alone is never a timeout */
    "selfterm.test.mjs": `import { spawnSync } from "node:child_process";\nimport { budgetAssert } from "./budget.mjs";\n`
      + `let pass = 0, fail = 0; const t = (n, g, w) => { JSON.stringify(g) === JSON.stringify(w) ? pass++ : fail++; };\n`
      + `const r = spawnSync(process.execPath, ["-e", "process.kill(process.pid, 'SIGTERM')"], { timeout: 20000 });\n`
      + `if (budgetAssert(t, "selfterm-budget", r, 20000, "the child's exit")) t("the child exits 0", r.status, 0);\n`
      + `console.log("selfterm: " + pass + " pass, " + fail + " fail"); process.exit(fail ? 1 : 0);\n`,
  });
  copyFileSync(join(DIR, "budget.mjs"), join(e.cwd, "test", "budget.mjs"));
  const r = runPiped(e, { BIO_BATTERY_VERDICT: verdictFile(e) });
  if (r.measured) {
    t("(4b) the timeouts-only suite is still NOTM beside the RED ones", statusOf(r.out, "nm.test.mjs"), "NOTM");
    t("(4b) ONE failure more than its markers is RED", statusOf(r.out, "mixed.test.mjs"), "FAIL");
    t("(4b) a CHILD's echoed marker (another pid) launders nothing: RED", statusOf(r.out, "echoed.test.mjs"), "FAIL");
    t("(4b) a marker with NO readable fail count is RED — a timeout cannot be told from a finding", statusOf(r.out, "notally.test.mjs"), "FAIL");
    t("(4b) a subject dead by its OWN SIGTERM is a FINDING, never NOT MEASURED (ETIMEDOUT is the only test)",
      [statusOf(r.out, "selfterm.test.mjs"), /TIMEOUT: [^\n]*selfterm/.test(r.out)], ["FAIL", false]);
    t("(4b) RED outranks NOT MEASURED: the run exits its failure count (4), never 124", r.code, 4);
    const v = readJson(verdictFile(e));
    t("(4b) the verdict file says RED and still names the one NOT MEASURED unit",
      [v && v.verdict, v && v.notMeasured.map((x) => x.unit)], ["RED", ["plane:nm.test.mjs"]]);
  }
}
{
  /* (4c) THE LIAR ARM: a REAL hang, planted behind a 400 ms budget through the real helper. The runner must
     NAME it NOT MEASURED and the suite must finish promptly: a version that raised or ignored the budget would
     sit in the hang until this scratch battery's own budget expired, and read NOT MEASURED HERE instead. */
  const e = estate({
    "hang.test.mjs": `import { spawnSync } from "node:child_process";\nimport { budgetAssert } from "./budget.mjs";\n`
      + `let pass = 0, fail = 0; const t = (n, g, w) => { JSON.stringify(g) === JSON.stringify(w) ? pass++ : fail++; };\n`
      + `const r = spawnSync(process.execPath, ["-e", "setInterval(() => {}, 1000)"], { timeout: 400 });\n`
      + `if (budgetAssert(t, "planted hang", r, 400, "the hung child's output")) t("the child answered", r.status, 0);\n`
      + `console.log("hang: " + pass + " pass, " + fail + " fail"); process.exit(fail ? 1 : 0);\n`,
  });
  copyFileSync(join(DIR, "budget.mjs"), join(e.cwd, "test", "budget.mjs"));
  const r = runPiped(e, {}, 30_000);
  if (r.measured) {
    const ms = Number((r.out.match(/^  \S+\s+hang\.test\.mjs\s+(\d+)ms/m) || [])[1]);
    t("(4c) a planted hang is NAMED: NOTM, its marker quoted, the run exits 124",
      [statusOf(r.out, "hang.test.mjs"), /TIMEOUT: planted hang — its 400 ms budget EXPIRED \(ETIMEDOUT\)/.test(r.out), r.code], ["NOTM", true, 124]);
    t("(4c) and PROMPTLY — the hung suite ended inside 15 s, so no budget was raised past the hang", ms > 0 && ms < 15_000, true);
  }
}
for (const b of bases) rmSync(b, { recursive: true, force: true });
t("the arms drove the estates they declared (a floor, so a walk that lost an arm fails)", bases.length, (HAVE_LSOF ? 9 : 8) + 3);   /* M0-65: +3 (section 2b); M0-107: +3 (section 4) */

console.log(`\nbattery-verdict: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
