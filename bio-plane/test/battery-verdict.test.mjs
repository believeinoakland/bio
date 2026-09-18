/* NEGATIVE CONTROL: (run 2026-09-18, M0-67/D-425) FOUR ARMS ON `scripts/battery.mjs`, each armed ALONE by hand with the fixed runner copied aside (sha256 5b3da92e…, 48,439 B) and restored against that copy by sha256 AND `cmp` after every arm ("restored byte-identically: YES" each time). BASELINE (nothing armed): 27 pass, 0 fail. (0) `prefix` — the PRE-M0-67 runner itself (sha256 0c9d3d87…) -> 13 pass, 14 FAIL: every liar arm (the planted `3 pass, 2 fail` suite exiting 0 reads `ok` under `2/2 suites green` and the scratch battery EXITS 0 — D-425's question answered YES), the run-id arm, and every shared-log arm; the over-strictness arms stay GREEN. (a) `crosscheck` — `const lied = false` -> 20 pass, 7 FAIL, exactly the seven liar arms (got `2/2`, exit 0); log and over-strictness arms GREEN. (b) `logguard` — no start refusal AND `logIntrusions` returns [] -> 21 pass, 6 FAIL, exactly the six shared-log arms: B RUNS its suite onto A's file and A prints no LOG SHARED line; the tally arms and both SEQUENTIAL-append arms stay GREEN. (c) `refusal-only` — start refusal off, end check ON -> 22 pass, 5 FAIL: the four refusal arms, AS DECLARED, plus one NOT as declared — in the `>>` form A still names the file (`another run's header or completion line is in it … another battery still has it open`), but in the `>` form A's LOG SHARED line is ABSENT from the file while A's exit is still non-zero (got [false,false,true]): B, unrefused and truncating, finished after A and overwrote A's closing lines at the same offsets. The declaration was wrong and the arm was right — a later truncating writer can erase anything the first run prints, which is why the START refusal is the load-bearing half for `>` and the exit status is the only part of A's verdict a `>` collision cannot touch. THE BRIEF'S OWN CONTROL, on the real tree: one `t("M0-67 PLANTED", 1, 2)` added to `machinefences-dec49.test.mjs` (pristine sha256 3216a898…, 29,611 B) -> alone `70 pass, 1 fail`, exit 1 (unpiped); in the battery `FAIL … 70 pass, 1 FAIL`, `0/1 suites green`, exit 1. Then its exit forced to `process.exit(0)` -> alone `70 pass, 1 fail`, exit 0; PRE-FIX runner `ok … 70 pass, 1 FAIL`, `1/1 suites green`, EXIT 0; FIXED runner `FAIL … 70 pass, 1 FAIL — and EXITED 0 (D-425: counted RED)`, `0/1 suites green`, `EXIT/TALLY DISAGREE (D-425)` named, exit 1. Suite restored byte-identically. Recorded in MEASUREMENTS.md under M0-67. */
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

const DIR = dirname(fileURLToPath(import.meta.url));
const REAL_RUNNER = join(DIR, "..", "scripts", "battery.mjs");
const REAL_MODULES = ["provenance.mjs", "residue.mjs"];

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}\n          got  ${JSON.stringify(got)}\n          want ${JSON.stringify(want)}`); }
};

const LSOF = spawnSync("lsof", ["-v"], { encoding: "utf8", timeout: 10_000 });
const HAVE_LSOF = !LSOF.error;

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
const runPiped = (e) => {
  const r = spawnSync(process.execPath, ["scripts/battery.mjs"], { cwd: e.cwd, encoding: "utf8", timeout: 120_000, env: e.env });
  return { code: r.status, out: `${r.stdout || ""}${r.stderr || ""}` };
};
const headline = (out) => (out.match(/^(\d+\/\d+) suites green/m) || [])[1] || null;
const statusOf = (out, file) => { const m = out.match(new RegExp(`^  (ok  |FAIL|skip)  ${file.replace(/\./g, "\\.")}`, "m")); return m ? m[1].trim() : null; };

/* ============== 1. THE VERDICT READS THE PRINTED TALLY ============== */
console.log("\n--- 1. a printed failure is a failure, whatever the exit said ---");
{
  const e = estate({
    "honest.test.mjs": suite("honest", { pass: 4, fail: 0, exit: 0 }),
    "liar.test.mjs": suite("liar", { pass: 3, fail: 2, exit: 0 }),
  });
  const r = runPiped(e);
  t("THE LIAR: a suite printing `3 pass, 2 fail` and exiting 0 is RED in its own line", statusOf(r.out, "liar.test.mjs"), "FAIL");
  t("the headline counts it: 1/2 suites green, not 2/2", headline(r.out), "1/2");
  t("the battery's exit status says so (1 failed suite)", r.code, 1);
  t("the disagreement is NAMED, with the suite and both halves of it",
    /EXIT\/TALLY DISAGREE \(D-425\): liar\.test\.mjs printed 2 fail and exited 0/.test(r.out), true);
  t("the FAILED line names it", /FAILED: liar\.test\.mjs/.test(r.out), true);
  t("and the honest suite beside it is untouched", statusOf(r.out, "honest.test.mjs"), "ok");
}
{
  /* The `N passed, M failed` spelling — reextract and ocr-member-e2e print it from an
     `exit` listener when a suite ends before its own foot. Same rule, other spelling. */
  const e = estate({ "foot.test.mjs": `console.log("foot: 5 passed, 1 failed — SUITE ENDED BEFORE ITS OWN FOOT"); process.exit(0);\n` });
  const r = runPiped(e);
  t("the `passed/failed` spelling of a printed failure with exit 0 is RED too", [statusOf(r.out, "foot.test.mjs"), r.code], ["FAIL", 1]);
}
{
  /* A suite that prints a SKIPPED marker and ALSO a failing tally cannot hide behind the
     skip: a suite that printed failures did not merely skip. */
  const e = estate({ "skipfail.test.mjs": `console.log("skipfail: SKIPPED — no ssh-keygen");\nconsole.log("skipfail: 1 pass, 1 fail");\nprocess.exit(0);\n` });
  const r = runPiped(e);
  t("a SKIPPED marker does not launder a printed failure", [statusOf(r.out, "skipfail.test.mjs"), r.code], ["FAIL", 1]);
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
  t("an honest green suite stays ok", statusOf(r.out, "a.test.mjs"), "ok");
  t("a PASS label containing FAIL, and an inner child's failing count before the suite's own clean tally, stay ok",
    statusOf(r.out, "b.test.mjs"), "ok");
  t("an honest failure (exit 1) is RED exactly as before, and is NOT reported as a disagreement",
    [statusOf(r.out, "c.test.mjs"), /EXIT\/TALLY DISAGREE[^\n]*c\.test\.mjs/.test(r.out)], ["FAIL", false]);
  t("a named SKIP with no failing tally is still a skip", statusOf(r.out, "d.test.mjs"), "skip");
  t("a suite with no readable count is still UNKNOWN, not red and not zero",
    [statusOf(r.out, "e.test.mjs"), /reported no assertion count: e\.test\.mjs/.test(r.out)], ["ok", true]);
  t("headline 3/5 (a, b, e) and exit 1 (c only)", [headline(r.out), r.code], ["3/5", 1]);
}

/* ============== 3. ONE LOG, ONE RUN ============== */
console.log("\n--- 3. a log another battery is writing is refused, and a shared log is named ---");
const runId = (out) => ({ head: (out.match(/^battery: .*· run (\S+)$/m) || [])[1] || null,
  foot: (out.match(/^\d+\/\d+ suites green .*· run (\S+)$/m) || [])[1] || null });
{
  const e = estate({ "a.test.mjs": suite("a", { pass: 1, fail: 0, exit: 0 }) });
  const r = runPiped(e);
  const id = runId(r.out);
  t("the header and the completion line carry the SAME run id, so a reader can tell one run from two",
    [!!id.head, id.head === id.foot], [true, true]);
}
if (!HAVE_LSOF) {
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
  const aDone = new Promise((res) => a.on("close", (code) => res(code)));
  const t0 = Date.now();
  while (!existsSync(ready) && Date.now() - t0 < 30_000) await new Promise((r) => setTimeout(r, 50));
  t("(setup) battery A reached its slow suite, so it holds the log", existsSync(ready), true);
  const fdB = openSync(log, "a");
  const b = spawnSync(process.execPath, ["scripts/battery.mjs"], { cwd: e.cwd, env: { ...e.env, M067_READY: join(e.base, "ready-b") }, stdio: ["ignore", fdB, fdB], timeout: 60_000 });
  closeSync(fdB);
  const codeA = await aDone;
  closeSync(fdA);
  const text = readFileSync(log, "utf8");
  console.log(`  (\`>>\` form) A said: ${(text.match(/^LOG SHARED[^\n]*/m) || ["<no LOG SHARED line>"])[0]}`);
  t("battery B REFUSES to start onto a log battery A is writing (exit 3)", b.status, 3);
  t("and B ran no suite: its slow suite never signalled", existsSync(join(e.base, "ready-b")), false);
  t("B's refusal NAMES the other battery's pid and D-425",
    new RegExp(`D-425: REFUSED[^\\n]*pid ${a.pid}`).test(text), true);
  t("battery A reads its own log back and names it SHARED, and its exit is non-zero", [/LOG SHARED \(D-425\)/.test(text), codeA !== 0], [true, true]);
  t("A's suites were still green — the red is about the LOG, and says so rather than blaming a suite",
    /^1\/1 suites green/m.test(text), true);

  /* THE `>` FORM: B opens the file TRUNCATING it (what `node battery.mjs > log` does),
     so B's refusal lands at offset 0 over whatever A had written, and A goes on writing
     at its own offset. The observed log's shape came from exactly this family of
     accident; A must still name its file shared rather than read it back as clean. */
  {
    const logT = join(e.base, "truncated.log");
    const readyT = join(e.base, "ready-t");
    const fdAT = openSync(logT, "w");
    const aT = spawn(process.execPath, ["scripts/battery.mjs"], { cwd: e.cwd, env: { ...e.env, M067_READY: readyT }, stdio: ["ignore", fdAT, fdAT] });
    const aTDone = new Promise((res) => aT.on("close", (code) => res(code)));
    const t1 = Date.now();
    while (!existsSync(readyT) && Date.now() - t1 < 30_000) await new Promise((r) => setTimeout(r, 50));
    const fdBT = openSync(logT, "w");
    const bT = spawnSync(process.execPath, ["scripts/battery.mjs"], { cwd: e.cwd, env: { ...e.env, M067_READY: join(e.base, "ready-bt") }, stdio: ["ignore", fdBT, fdBT], timeout: 60_000 });
    closeSync(fdBT);
    const codeAT = await aTDone;
    closeSync(fdAT);
    const textT = readFileSync(logT, "utf8");
    console.log(`  (\`>\` form) A said: ${(textT.match(/^LOG SHARED[^\n]*/m) || ["<no LOG SHARED line>"])[0]}`);
    t("`>` form: B, truncating the file A is writing, still REFUSES (exit 3)", bT.status, 3);
    t("`>` form: A names the file SHARED — its own header was overwritten or NULs mark the truncation — and exits non-zero",
      [/LOG SHARED \(D-425\)/.test(textT), /header is not in the file|NUL bytes|refusal/.test(textT), codeAT !== 0], [true, true, true]);
  }

  /* the over-strictness half: SEQUENTIAL runs appended to one file are not a shared log
     for the SECOND run, whose own header comes after the first run's completion. */
  const log2 = join(e.base, "sequential.log");
  for (let i = 0; i < 2; i++) {
    const fd = openSync(log2, "a");
    const r = spawnSync(process.execPath, ["scripts/battery.mjs", "slow"], { cwd: e.cwd, env: { ...e.env, M067_READY: join(e.base, `seq-${i}`) }, stdio: ["ignore", fd, fd], timeout: 60_000 });
    closeSync(fd);
    t(`sequential run ${i + 1} into one appended file is GREEN (exit 0) — one run after another is not interleaving`, r.status, 0);
  }
  t("and neither sequential run named the log shared", /LOG SHARED/.test(readFileSync(log2, "utf8")), false);
}

for (const b of bases) rmSync(b, { recursive: true, force: true });
t("the arms drove the estates they declared (a floor, so a walk that lost an arm fails)", bases.length, HAVE_LSOF ? 6 : 5);

console.log(`\nbattery-verdict: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
