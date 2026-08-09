/* D-237: THE BATTERY MUST MAKE RESIDUE OUTSIDE `$TMPDIR` VISIBLE, NOT MERELY ABSENT.
 *
 * WHY THIS SUITE EXISTS. `scripts/battery.mjs` accounts for temp residue by
 * counting INSIDE the `$TMPDIR` it hands each suite. That is a true sentence
 * about the fence and it was read as a sentence about the estate: on 2026-08-08
 * M0-10 found the runner printing `0 directories, 0 miniflare sandboxes` while
 * 12 MB of Durable Object and R2 SQLite sat in `/tmp/mfp`, put there by
 * `bootstrap.test.mjs`'s hardcoded persist root and ACCUMULATING SINCE
 * 2026-07-31. A suite writing outside the fence was not under-reported. It was
 * UNREPORTED — wrong in the generous direction, which is the direction this
 * project treats as worst.
 *
 * The same shape had already defeated the other instrument: `hygiene.test.mjs`
 * required every temp-making suite to IMPORT `sandbox.mjs`, both offenders did,
 * and both passed, because the check certified the IMPORT and never the
 * CONTAINMENT. M0-10 closed the containment half STRUCTURALLY and that check
 * FAILS the battery. This is the reporting half, for what a source read cannot
 * see: a literal built by concatenation, a path in a variable, a path from an
 * environment variable, and a path a DEPENDENCY chooses.
 *
 * WHAT IS ASSERTED HERE IS THE RUNNER, DRIVEN END TO END rather than read. Each
 * arm builds a throwaway git repository AND a throwaway shared temp root in this
 * process's own sandbox, copies the REAL `scripts/battery.mjs` and the REAL
 * `scripts/residue.mjs` into it, and runs it. A source-shape assertion would
 * pass over a report that never fires; these fire it. The scratch shared root
 * is handed in through `BIO_SHARED_TEMP_ROOTS` for one reason and it is the
 * item's own reason: a suite that had to contaminate the machine's real `/tmp`
 * in order to prove a point about the machine's real `/tmp` would be the defect
 * it is testing.
 *
 * THE CORPUS IS PRINTED by the reach arm, because a check narrowed to nothing
 * reports a beautiful 100% over an empty corpus — the failure mode M0-14's
 * register floor exists to catch and M0-15's own harness fell into.
 *
 * NEGATIVE CONTROL: FOUR ARMS, each armed ALONE with the others held open, in
 * `test/battery-residue.control.mjs` (deliberately not a `.test.mjs`: it edits
 * real sources, so the battery must not discover it). Every restore verified by
 * sha256 AND by `cmp` against a uniquely-named per-arm pristine copy, with a
 * byte floor printed.
 *   subject — the `NAMED —` branch of `reportResidue` made unreachable, so
 *     residue outside the fence is counted and never named. RUN 2026-08-08:
 *     DECLARED (b) (c) (d) -> GOT (b) (c) (d), 21 pass / 12 fail. As declared.
 *   blind — `scanShared` narrowed to nothing, i.e. the PRE-D-237 STATE in which
 *     the runner cannot see outside `$TMPDIR` at all. This is the arm that
 *     reproduces the HISTORICAL defect rather than a mutation of the fix. RUN:
 *     DECLARED (b) (c) (d) -> GOT (b) (c) (d) AND (f), 19 pass / 14 fail.
 *     **DECLARED THREE AND GOT FOUR, and the declaration was corrected to the
 *     measurement rather than the arm to the declaration:** (f) asserts that an
 *     unreadable root reports UNVERIFIED, and that report is produced by the
 *     same root loop the arm neutered. A blinded scanner cannot report a root it
 *     could not read, because it did not try to read one.
 *   held — the pid closure widened from "descendants of this battery" to "every
 *     process". THE OVER-ATTRIBUTION DIRECTION, and it CAME BACK GREEN THE FIRST
 *     TIME: in a scratch estate the only processes touching the scratch root were
 *     already ours, so the arm COULD NEVER HAVE BEEN HONOURED. That is a finding
 *     about the arm and it is why (j) exists.
 *   strict — the `mtime touched, no bytes` summarisation removed, so every mtime
 *     touch is NAMED. OVER-STRICTNESS: no assertion here may fail.
 * The eleven arms those four controls are armed against, and what each is for —
 * written as an enumerated list opening the paragraph after this one, because
 * `scripts/control-register.mjs` reads a declaration to the end of its paragraph
 * and continues ONLY into a paragraph that OPENS with a list item. The first
 * spelling of this header put a heading line here instead, so the register read
 * 2 arms where the suite declares eleven — D-233's shape, in the file that is meant
 * to know better, caught by reading the printed register figure rather than
 * assuming it:
 *   (a) OVER-STRICTNESS: a clean shared root -> the report FIRES, states its
 *       roots and its reach, names NOTHING, and the run stays green. A report
 *       that only ever appears when something is wrong cannot be trusted to have
 *       looked, which is the whole of D-233.
 *   (b) THE ARM THIS ITEM EXISTS FOR: a workerd persistence ground planted in
 *       the shared root BEFORE the run -> NAMED, PRE-EXISTING, and the run is
 *       STILL GREEN. A green run with 12 MB outside the fence is the case that
 *       actually happened, so an assertion that only fired on a red run would
 *       have missed the whole defect.
 *   (c) a suite that WRITES outside the fence during the run -> NAMED as
 *       APPEARED, and the SUITE is named beside it, because the battery runs its
 *       suites sequentially.
 *   (d) HELD, the only conclusive attribution: a suite holding a file open
 *       outside the fence -> named HELD BY THIS RUN with a pid. Skipped BY NAME
 *       if `lsof` is unavailable rather than passing vacuously.
 *   (e) THE STATED BLIND SPOT, PINNED RATHER THAN DESCRIBED: a suite that writes
 *       outside the fence and CLEANS UP leaves no arrival, because residue is
 *       what is LEFT. Asserted so the limit cannot quietly become untrue in
 *       either direction.
 *   (f) a root that cannot be read -> UNVERIFIED, and NOT a clean report. An
 *       instrument that reports "all good" when it could not look is D-233.
 *   (g) OVER-STRICTNESS, second direction: a suite that mints plenty of temp
 *       files INSIDE the fence must produce no word in the outside report.
 *   (h) the fenced line SAYS it is the fenced line. `INSIDE $TMPDIR` is the
 *       three-word change that stops the old sentence being read as an estate
 *       report, and it is pinned here so it cannot be edited away.
 *   (i) `lsof` unavailable -> the HELD arm says UNVERIFIED rather than reporting
 *       that nothing was held. Same rule as (f), different instrument.
 *   (j) THE OPPOSITE DEFECT: a FOREIGN process — a sibling of the battery, not a
 *       descendant, holding a file in the same shared root and visible to the
 *       same `lsof` scope — must be made VISIBLE and must NOT be claimed. A
 *       report that credits this run with another process's residue is the same
 *       defect pointing the other way. This arm is what makes the `held` control
 *       above capable of failing, and it CAUGHT A REAL DEFECT ON ITS FIRST RUN —
 *       in the harness, not the subject: `/HELD BY THIS RUN/` also matches the
 *       ATTRIBUTION paragraph that EXPLAINS the phrase, so every run read as
 *       holding something. Matched on the row's own line since.
 *   (k) THE RUN'S OWN FENCE IS NOT "OUTSIDE THE FENCE". Added after the FIRST
 *       FULL BATTERY caught what nine scratch arms could not: `RUN_TMP` is built
 *       from `os.tmpdir()` (`/var/folders/…`) while the roots are REALPATHS
 *       (`/private/var/folders/…`), so the exclusion compared two spellings of
 *       one directory and the run's own sandbox was reported as somebody else's,
 *       with every sandbox a suite held inside it attributed as residue OUTSIDE
 *       the fence. Every other arm put the scratch fence where the scanned root
 *       does not contain it; this one reproduces the real layout. THE ARGUMENT
 *       FOR RUNNING THE REAL THING ON THE REAL MACHINE BEFORE BELIEVING A
 *       HARNESS, and it is recorded rather than quietly fixed.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync, chmodSync, existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const REAL_RUNNER = join(DIR, "..", "scripts", "battery.mjs");
/* The runner cannot start without the modules it imports, and a FIXTURE copy of
   the report would agree with itself and prove nothing about what actually runs
   — M0-15's reason for copying the runner, one module further out. */
const REAL_MODULES = ["provenance.mjs", "residue.mjs"];

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  if (!ok) console.log(`FAIL: ${name}\n  got:  ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`);
};

const LSOF = spawnSync("lsof", ["-v"], { encoding: "utf8", timeout: 10_000 });
const HAVE_LSOF = !LSOF.error;

/* A suite the scratch battery runs in milliseconds. `body` runs before the tail
   line the runner parses, which is a suite's only contract with it. */
const suiteSrc = (n, body = "") =>
  `import { mkdirSync, writeFileSync, rmSync, openSync } from "node:fs";\n`
  + `import { join } from "node:path";\n`
  + `import { tmpdir } from "node:os";\n`
  + `const OUTSIDE = process.env.D237_ARM_DIR;\n`
  + `${body}\n`
  + `const done = () => { console.log("scratch: ${n} pass, 0 fail"); process.exit(0); };\n`
  + `if (typeof HOLD_MS === "undefined") done(); else setTimeout(done, HOLD_MS);\n`;

/* One MB of bytes, so a size in the report is a real measurement rather than a
   zero that any empty directory would also produce. */
const PAYLOAD = "x".repeat(64 * 1024);

let corpus = 0;
/* A synchronous wait with no subprocess, so the FOREIGN holder below is known to
   have its file open before the battery starts rather than hoped to have. */
const waitFor = (path, ms) => {
  const clock = new Int32Array(new SharedArrayBuffer(4));
  for (let waited = 0; waited < ms; waited += 20) {
    if (existsSync(path)) return true;
    Atomics.wait(clock, 0, 0, 20);
  }
  return existsSync(path);
};

/* Build a throwaway repository AND a throwaway shared temp root, run the REAL
   runner against both, return its output. `plant` is written into the shared
   root BEFORE the run; `suites` are `.test.mjs` files committed into the repo;
   `foreignHold` is a planted path a SIBLING process holds open while it runs. */
const drive = ({ suites = {}, plant = {}, unreadableRoot = false, noLsof = false, foreignHold = null,
  fenceInsideRoot = false }) => {
  corpus++;
  const base = mkdtempSync(join(tmpdir(), "d237-"));
  const repo = join(base, "repo");
  const shared = join(base, "shared");
  mkdirSync(join(repo, "bio-plane", "scripts"), { recursive: true });
  mkdirSync(join(repo, "bio-plane", "test"), { recursive: true });
  mkdirSync(shared, { recursive: true });
  copyFileSync(REAL_RUNNER, join(repo, "bio-plane", "scripts", "battery.mjs"));
  for (const m of REAL_MODULES)
    copyFileSync(join(DIR, "..", "scripts", m), join(repo, "bio-plane", "scripts", m));
  for (const [rel, body] of Object.entries(suites))
    writeFileSync(join(repo, "bio-plane", "test", rel), body);
  for (const [rel, body] of Object.entries(plant)) {
    mkdirSync(join(shared, dirname(rel)), { recursive: true });
    writeFileSync(join(shared, rel), body);
  }
  const g = (...args) => spawnSync("git", ["-C", repo,
    "-c", "user.email=d237@example.invalid", "-c", "user.name=D-237",
    "-c", "commit.gpgsign=false", ...args], { encoding: "utf8" });
  g("init", "-q", "-b", "main");
  g("add", "-A");
  g("commit", "-q", "-m", "scratch base");
  if (unreadableRoot) chmodSync(shared, 0o000);
  const env = { ...process.env, BIO_SHARED_TEMP_ROOTS: shared, D237_ARM_DIR: shared };
  /* (k) reproduces the REAL layout, where the run's own `$TMPDIR` is a top-level
     entry OF a scanned shared root. Every other arm puts the fence elsewhere,
     which is why every other arm was blind to the defect (k) exists for. */
  if (fenceInsideRoot) env.TMPDIR = shared;
  /* (i) drives the UNVERIFIED path for the HELD arm by making `lsof`
     unreachable. `process.execPath` is absolute, so node still starts. */
  if (noLsof) env.PATH = join(base, "no-such-bin");
  /* (j)'s FOREIGN holder. A child of THIS suite, so it is a SIBLING of the
     battery and not a descendant of it — which is the whole point: the pid
     closure must exclude it, and if it ever stopped excluding it the report
     would blame this run for another process's files. It is `node`, so it is
     inside the `-c node` scope the HELD arm samples: the arm SEES it and must
     still decline to claim it. */
  let holder = null;
  if (foreignHold) {
    const target = join(shared, foreignHold);
    const ready = join(base, "holder-ready");
    holder = spawn(process.execPath, ["-e",
      `const fs=require("fs");fs.openSync(${JSON.stringify(target)},"r");`
      + `fs.writeFileSync(${JSON.stringify(ready)},"1");setTimeout(()=>{},120000);`],
      { stdio: "ignore" });
    if (!waitFor(ready, 10_000)) console.log("battery-residue: (j) holder never signalled ready");
  }
  const r = spawnSync(process.execPath, ["scripts/battery.mjs"],
    { cwd: join(repo, "bio-plane"), encoding: "utf8", timeout: 120_000, env });
  if (holder) { try { holder.kill("SIGKILL"); } catch { /* gone already */ } }
  if (unreadableRoot) { try { chmodSync(shared, 0o700); } catch { /* best effort */ } }
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  rmSync(base, { recursive: true, force: true });
  return { out, code: r.status, shared };
};

const namesBlock = (out) => /NAMED — the fenced figure above/.test(out);
/* A ROW's state line, never the ATTRIBUTION paragraph. The paragraph explains
   what `HELD BY THIS RUN` means and therefore CONTAINS the phrase, so a bare
   substring test reports every run as holding something — which is exactly what
   it did, and (j) is the arm that caught it. A check that matches its own
   explanation is this estate's most repeated instrument defect (REC-70's sweep
   citing itself, M0-16's correction quoting the token it corrected). */
const heldRow = (out) => /^ {6}HELD BY THIS RUN/m.test(out);
const names = (out, leaf) => new RegExp(`^\\s+\\S*${leaf}\\s`, "m").test(out);
const outsideLine = (out) => (out.match(/^outside the fence: .*$/m) || [""])[0];

/* ---- (a) OVER-STRICTNESS: a clean shared root ---------------------------- */
{
  const { out, code } = drive({ suites: { "clean.test.mjs": suiteSrc(4) } });
  t("(a) a clean shared root leaves the run green", code, 0);
  t("(a) the report FIRES ANYWAY — it says it looked, and where",
    /^outside the fence: 1 shared temp root\(s\) walked to depth \d+/m.test(out), true);
  t("(a) and names its roots, so a scan narrowed to nothing cannot hide",
    /^ {2}roots: \S+/m.test(out), true);
  t("(a) it names nothing", namesBlock(out), false);
  t("(a) and it states the REACH of the pid-chain arm, so 0 HELD cannot be read as 'we looked'",
    /^ {2}HELD arm: \d+ lsof sample\(s\) covering \d+ of \d+ suite\(s\)/m.test(out), true);
  t("(a) and says so in words rather than by silence",
    /nothing outside the fence grew or arrived while this run ran/.test(out), true);
}

/* ---- (b) THE ARM THIS ITEM EXISTS FOR: a standing ground, green run ------- */
{
  const { out, code } = drive({
    suites: { "clean.test.mjs": suiteSrc(4) },
    plant: { "mfp/do/-Store/metadata.sqlite": PAYLOAD, "mfp/r2/miniflare-R2BucketObject/x.sqlite": PAYLOAD },
  });
  t("(b) a green run with residue outside the fence is STILL GREEN — the case that happened", code, 0);
  t("(b) the standing ground is NAMED", names(out, "mfp"), true);
  t("(b) it is recognised as workerd persistence", /workerd persistence/.test(out), true);
  t("(b) and stated to be PRE-EXISTING rather than blamed on this run",
    /PRE-EXISTING, untouched by this run/.test(out), true);
  t("(b) the fenced figure is explicitly scoped to $TMPDIR beside it",
    /statement about \$TMPDIR ONLY/.test(out), true);
  t("(b) its size is printed, not just its name", /mfp\s+0\.1 MB · 2 file\(s\)/.test(out), true);
}

/* ---- (c) a suite that writes outside the fence during the run ------------- */
{
  const { out, code } = drive({
    suites: {
      "leaky.test.mjs": suiteSrc(7,
        `mkdirSync(join(OUTSIDE, "leaked"), { recursive: true });\n`
        + `writeFileSync(join(OUTSIDE, "leaked", "blob.bin"), "${PAYLOAD}");\n`),
    },
  });
  t("(c) writing outside the fence does not fail the run — it is REPORTED", code, 0);
  t("(c) the arrival is NAMED", names(out, "leaked"), true);
  t("(c) and stated as APPEARED while this run ran", /APPEARED while this run ran/.test(out), true);
  t("(c) the suite it appeared under is named beside it", /suite: leaky\.test\.mjs/.test(out), true);
  t("(c) it is called a CANDIDATE and not an attribution",
    /APPEARED and CHANGED are\n\s+CANDIDATES ONLY/.test(out), true);
}

/* ---- (d) HELD: the only conclusive attribution ---------------------------- */
if (!HAVE_LSOF) {
  console.log("battery-residue: (d) SKIPPED — `lsof` is not available on this machine, so the HELD arm"
    + " cannot be driven. It is NOT asserted here rather than being asserted vacuously.");
} else {
  const { out, code } = drive({
    suites: {
      "holder.test.mjs": suiteSrc(3,
        `mkdirSync(join(OUTSIDE, "held"), { recursive: true });\n`
        + `writeFileSync(join(OUTSIDE, "held", "open.bin"), "${PAYLOAD}");\n`
        + `openSync(join(OUTSIDE, "held", "open.bin"), "r");\n`
        + `const HOLD_MS = 1600;\n`),
    },
  });
  t("(d) holding a path outside the fence does not fail the run", code, 0);
  t("(d) it is attributed to THIS RUN by a pid chain", heldRow(out), true);
  t("(d) with the pid printed", /HELD BY THIS RUN.*pid \d+/.test(out), true);
  t("(d) and the suite named", /HELD BY THIS RUN · suite: holder\.test\.mjs/.test(out), true);
  t("(d) the headline counts it", /· 1 HELD by this run/.test(out), true);
}

/* ---- (e) THE STATED BLIND SPOT, PINNED --------------------------------- */
{
  const { out, code } = drive({
    suites: {
      "tidy.test.mjs": suiteSrc(2,
        `mkdirSync(join(OUTSIDE, "transient"), { recursive: true });\n`
        + `writeFileSync(join(OUTSIDE, "transient", "blob.bin"), "${PAYLOAD}");\n`
        + `rmSync(join(OUTSIDE, "transient"), { recursive: true, force: true });\n`),
    },
  });
  t("(e) a suite that writes outside the fence and CLEANS UP leaves the run green", code, 0);
  t("(e) and leaves NOTHING named — residue is what is LEFT, and residue.mjs says so",
    names(out, "transient"), false);
  t("(e) the headline still reports a reach rather than going silent",
    /walked to depth \d+ · \d+ top-level/.test(outsideLine(out)), true);
}

/* ---- (f) a root that cannot be read -> UNVERIFIED, never clean ------------ */
{
  const { out } = drive({ suites: { "clean.test.mjs": suiteSrc(4) }, unreadableRoot: true });
  t("(f) an unreadable root is reported UNVERIFIED", /UNVERIFIED for 1 root\(s\) that could not be read/.test(out), true);
  t("(f) and the figures are called a FLOOR, not a total", /the figures above are a FLOOR/.test(out), true);
}

/* ---- (g) OVER-STRICTNESS: temp files INSIDE the fence say nothing --------- */
{
  const { out, code } = drive({
    suites: {
      "inside.test.mjs": suiteSrc(9,
        `mkdirSync(join(tmpdir(), "miniflare-abc123"), { recursive: true });\n`
        + `writeFileSync(join(tmpdir(), "miniflare-abc123", "blob.bin"), "${PAYLOAD}");\n`),
    },
  });
  t("(g) a suite minting temp files inside the fence produces no outside finding", namesBlock(out), false);
  t("(g) and the fenced accounting still sees them — the two halves are independent claims",
    /this run left 1 directory holding 1 miniflare sandbox INSIDE \$TMPDIR/.test(out), true);
  t("(g) which fails the run, exactly as D-186 requires and as it did before", code, 1);
}

/* ---- (h) the fenced line says WHAT IT IS MEASURING ------------------------ */
{
  const { out } = drive({ suites: { "clean.test.mjs": suiteSrc(4) } });
  t("(h) the fenced line scopes itself to $TMPDIR in its own words",
    /^temp: this run left .* INSIDE \$TMPDIR /m.test(out), true);
}

/* ---- (i) lsof unavailable -> the HELD arm says UNVERIFIED ----------------- */
{
  const { out } = drive({ suites: { "clean.test.mjs": suiteSrc(4) }, noLsof: true });
  t("(i) with no lsof, the HELD arm reports UNVERIFIED",
    /UNVERIFIED for the HELD arm/.test(out), true);
  t("(i) and says plainly that is a different claim from 'this run held nothing'",
    /not the same claim as "this run held nothing"/.test(out), true);
}

/* ---- (j) THE OPPOSITE DEFECT: a FOREIGN process's residue is NOT ours -----
 * This arm exists because the `held` control arm came back GREEN the first time
 * it was run. Widening the pid closure to every process on the machine broke
 * NOTHING, which meant the arm could never have been honoured: in a scratch
 * estate the only processes touching the scratch root were already ours. An arm
 * that cannot fail is not a control, so the estate gained a process that is
 * genuinely somebody else's — a sibling of the battery, visible to the same
 * `lsof` scope, holding a file in the same shared root. Recorded here rather
 * than the control quietly rewritten.
 *
 * It is also the sharper half of the item. Making residue visible is easy; a
 * report that credits this run with another process's 12 MB is the SAME defect
 * pointing the other way, and this is the assertion that stops it.
 *
 * THE FIRST SPELLING OF THIS ARM DID NOT FIRE EITHER, and that is recorded
 * because it is a finding about the report rather than about the arm: the
 * foreign holder created its directory BEFORE the battery started, so the entry
 * was pre-existing, unchanged and not a workerd ground — correctly filtered out
 * as the machine's ordinary noise. The arm was respelled to hold a PLANTED
 * GROUND, which is named unconditionally, so the assertion is about attribution
 * and not about whether the row appears at all. */
if (!HAVE_LSOF) {
  console.log("battery-residue: (j) SKIPPED — `lsof` is not available, so the over-attribution arm cannot"
    + " be driven. NOT asserted here rather than asserted vacuously.");
} else {
  const { out, code } = drive({
    /* THE SUITE MUST OUTLIVE THE FIRST SAMPLE, and that is not a detail: the
       first spelling of this arm used a suite that exited in ~40 ms, so the
       battery's 60 ms `lsof` timer never fired, the HELD arm never sampled, and
       the arm PASSED VACUOUSLY — asserting that nothing was attributed by
       machinery that had not run. It was caught only because the `held` control
       arm stayed green when it should have gone red. */
    suites: { "slow.test.mjs": suiteSrc(4, `const HOLD_MS = 900;\n`) },
    plant: { "foreignmf/r2/miniflare-R2BucketObject/blob.sqlite": PAYLOAD },
    foreignHold: "foreignmf/r2/miniflare-R2BucketObject/blob.sqlite",
  });
  t("(j) a foreign process's residue leaves the run green", code, 0);
  t("(j) THE ARM ACTUALLY LOOKED — the pid-chain arm sampled and covered the suite",
    /HELD arm: [1-9]\d* lsof sample\(s\) covering 1 of 1 suite\(s\)$/m.test(out), true);
  t("(j) it is still made VISIBLE — silence about what cannot be attributed is the defect",
    names(out, "foreignmf"), true);
  t("(j) but it is NOT claimed by this run", heldRow(out), false);
  t("(j) and the report says on what evidence, rather than leaving an absence to be read",
    /not held by any descendant of this battery in \d+ lsof sample\(s\)/.test(out), true);
  t("(j) the headline counts zero held", /· 0 HELD by this run/.test(out), true);
}

/* ---- (k) THE RUN'S OWN FENCE IS NOT "OUTSIDE THE FENCE" -------------------
 * THIS ARM EXISTS BECAUSE THE FIRST FULL BATTERY CAUGHT THE DEFECT AND NINE
 * SCRATCH ARMS DID NOT, which is the whole argument for running the real thing
 * on the real machine before believing a harness. The report accused the run of
 * holding a path outside its own fence — `HELD BY THIS RUN · suite:
 * acquire.test.mjs · another battery's fence` — over a directory that WAS this
 * run's `$TMPDIR`. `battery.mjs` builds `RUN_TMP` from `os.tmpdir()`, which
 * answers `/var/folders/…/T`, while the roots are REALPATHS answering
 * `/private/var/folders/…/T`: two spellings of one directory, so the exclusion
 * compared them and said NO. The run's own sandbox was walked as somebody
 * else's, and every miniflare sandbox a suite legitimately held inside it came
 * back attributed as residue OUTSIDE the fence. THE OVER-ATTRIBUTION DIRECTION,
 * arriving through the same `/private` aliasing that made the original defect
 * invisible.
 *
 * Every other arm here put the scratch fence somewhere the scanned root does not
 * contain, so none of them could see it. This one reproduces the real layout:
 * `$TMPDIR` IS the scanned shared root, so the run's fence is a top-level entry
 * of it, exactly as on the machine. */
if (!HAVE_LSOF) {
  console.log("battery-residue: (k) SKIPPED — `lsof` is not available, so the HELD half of this arm"
    + " cannot be driven. NOT asserted here rather than asserted vacuously.");
} else {
  const { out, code } = drive({
    fenceInsideRoot: true,
    suites: {
      /* Mints a sandbox INSIDE the fence, holds it open across a sample, and
         cleans it up — the ordinary, correct behaviour of every suite here. */
      "inside.test.mjs": suiteSrc(6,
        `const d = join(tmpdir(), "miniflare-inside-the-fence");\n`
        + `mkdirSync(d, { recursive: true });\n`
        + `writeFileSync(join(d, "blob.bin"), "${PAYLOAD}");\n`
        + `openSync(join(d, "blob.bin"), "r");\n`
        + `const HOLD_MS = 900;\n`
        + `setTimeout(() => rmSync(d, { recursive: true, force: true }), 600);\n`),
    },
  });
  t("(k) correct in-fence behaviour leaves the run green", code, 0);
  t("(k) the pid-chain arm DID sample, so this arm is not passing on an absence",
    /HELD arm: [1-9]\d* lsof sample\(s\) covering 1 of 1 suite\(s\)$/m.test(out), true);
  t("(k) the run's own $TMPDIR is NOT reported as held outside the fence", heldRow(out), false);
  t("(k) and the headline counts zero held", /· 0 HELD by this run/.test(out), true);
  /* Asserted as "nothing was named" and as "the walk did not even SEE it", not by
     grepping the output for `bio-battery-`: the scratch root itself lives inside
     THIS suite's own sandbox, whose name carries that very prefix, so the first
     spelling matched the roots line and failed over a path that was never a
     finding. A matcher that greps the whole report for a token the report's own
     paths contain is the same defect (j) already caught once. */
  t("(k) the run's own fence is not named at all", namesBlock(out), false);
  t("(k) and it is EXCLUDED from the walk rather than merely unreported",
    /· 0 top-level entr/.test(out), true);
}

/* THE REACH ARM. Every assertion above is a delta over a scratch estate this
   suite built, so the corpus is STATED rather than assumed: a harness narrowed
   to nothing would report a clean report eight times over and pass. */
console.log(`corpus: ${corpus} scratch estates (git repository + shared temp root) driven through the`
  + ` REAL scripts/battery.mjs and scripts/residue.mjs · lsof ${HAVE_LSOF ? "available" : "ABSENT"}`);
/* Declared 8 on the first run and the arm reported 9 — nine drives, not eight,
   because (h) takes a drive of its own. The DECLARATION was corrected to the
   measurement rather than the arm to the declaration, and it is recorded here
   because a reach arm that never disagrees with its author has not been tested
   either. */
t("the reach arm drove every scratch estate it declared", corpus, HAVE_LSOF ? 11 : 8);

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
