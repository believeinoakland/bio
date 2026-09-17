/* nc-m036.mjs — M0-36's NEGATIVE CONTROL DRIVER. Deliberately NOT a `.test.mjs`,
 * so `run.mjs` does not discover it and no baseline counts it.
 *
 * WHY THE METHOD IS WRITTEN DOWN BESIDE THE RESULT. CLAUDE.md: a control whose
 * method perturbs a second variable produces a refutation that looks more confident
 * than the finding it refutes. Two second variables were available here and both are
 * avoided on purpose:
 *
 *   1. A TERMINAL. THE DEFECT DOES NOT EXIST ON A TTY — node's writes to a POSIX tty
 *      are synchronous. Every arm below therefore drives `civicos-ui/test/run.mjs`,
 *      whose own loop spawns each suite with `{stdio:"pipe"}`, and reads the bytes
 *      run.mjs itself captured. A run of any of this in a terminal shows the tally
 *      arriving whether the fix is present or not, which is *cannot reproduce*
 *      wearing the costume of a refutation.
 *   2. ARMING A REAL SUITE'S LOGIC. Making an existing suite FAIL means editing what
 *      it asserts, which changes the subject as well as the variable. Arms 1 and 2
 *      therefore install a PURPOSE-BUILT suite next to the real ones — same shape as
 *      every suite here (flood, tally, `process.exit(1)`) — differing between the two
 *      arms in exactly one line: the shared import. Arm 3, which must act on a real
 *      repaired file, edits ONE LINE of one suite and restores it by `cp` from a
 *      pristine copy taken first, verified by sha256 AND by content. `git checkout --`
 *      is NOT used: it restores to HEAD, which in a tree with uncommitted work throws
 *      this session's own edits away and exits 0 either way.
 *
 * The armed suite is created and removed inside a `finally`, and its absence is
 * asserted at the end — an untracked `.test.mjs` left in this directory is exactly
 * M0-15's phantom, which got counted into a baseline.
 */
import "../../bio-plane/test/stdio.mjs";   /* this driver exits and is itself read through a pipe */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = path.resolve(HERE, "../..");
const RUNNER = path.join(HERE, "run.mjs");
const ARMED = path.join(HERE, "zz-nc-m036-armed.test.mjs");
const IMPORT = 'import "../../bio-plane/test/stdio.mjs";';
const TALLY = "zz-nc-m036-armed: 0 pass, 1 fail";

const sha = b => crypto.createHash("sha256").update(b).digest("hex");

/* THE ARMING EDIT, AND WHY IT IS NOT A ONE-LINE DELETE. The import landed as a
   FIVE-line construct — the statement plus the four-line comment that states at the
   site why the module is shared rather than copied. Deleting only the first line
   leaves the comment's remaining lines as bare source and the file is then a SYNTAX
   ERROR, which is a second variable: arm 3 would still go red and arm 4 would still
   differ, both for a reason that has nothing to do with flushing. Measured here
   rather than assumed — the first draft of this driver did exactly that. So the
   stripper removes the statement AND its trailing comment, and asserts it removed
   something. */
const stripImport = text => {
  const lines = text.split("\n");
  const i = lines.findIndex(l => l.startsWith(IMPORT));
  if (i < 0) return null;
  let j = i;
  while (j < lines.length && !/\*\/\s*$/.test(lines[j]) && !/;\s*$/.test(lines[j])) j++;
  lines.splice(i, j - i + 1);
  const out = lines.join("\n");
  return out.includes(IMPORT) ? null : out;   /* one construct only; a second occurrence means re-judge */
};
/* THE VERDICT IS A PREDICATE OVER THE MEASUREMENT, NOT A STRING COMPARISON.
   Recorded because this driver's FIRST run got it wrong: `declared` and `actual` were
   free prose and the comparator was `declared === actual`, so all five arms reported
   NOT AS DECLARED — including three that had plainly succeeded. An instrument that
   cannot return OK is an instrument whose reds mean nothing, and it is the same shape
   as `hygiene` staying green under `unflush`: the check was not looking at its subject.
   `agree` is now computed by the arm and the prose only explains it. */
const results = [];
const record = (arm, agree, declared, actual, note) => {
  results.push({ arm, declared, actual, agree, note });
  console.log(`${agree ? "OK  " : "MISS"}  ${arm}\n        declared: ${declared}\n        actual:   ${actual}${note ? "\n        " + note : ""}`);
};

/* The armed suite. ~2.4 MB of dump, then the tally, then `process.exit(1)` — the
   shape of every failing suite in this directory. `withImport` is the ONLY difference
   between arm 1 and arm 2. */
/* THE DUMP IS SIZED TO ISOLATE ONE VARIABLE, AND THE FIRST DRAFT DID NOT.
   It must be comfortably PAST the 64 KiB pipe buffer — below that the tally survives
   and the arm refutes nothing — and comfortably UNDER the reader's `maxBuffer`, or the
   arm measures D-387's truncation instead of D-282's discard and reports a confident
   wrong answer. The first draft wrote ~2.4 MB and did exactly that: ARM 2 came back RED
   with the fix installed, and the byte counts (1,051,059 · 1,096,225) were the tell,
   because those are not pipe-buffer numbers. 100 lines × ~4.1 KB ≈ 410 KB sits 6× above
   one pipe buffer and 2.5× below 1 MiB. ARM 5 drives the OTHER variable on purpose. */
const armedSource = (withImport, lines = 100) =>
  (withImport ? IMPORT + "\n" : "")
  + `/* M0-36 control arm — installed and removed by nc-m036.mjs. If you are reading this\n`
  + `   in a committed tree, the control did not clean up and the baseline is contaminated. */\n`
  + `const pad = "x".repeat(4096);\n`
  + `for (let i = 0; i < ${lines}; i++) console.log("dump " + i + " " + pad);\n`
  + `console.log(${JSON.stringify(TALLY)});\n`
  + `console.error("zz-nc-m036-armed: the one deliberate failure");\n`
  + `process.exit(1);\n`;

/* run.mjs exits 1 when any suite fails, so execFileSync throws and the bytes are on
   the error. Both streams are read, because run.mjs concatenates them for a FAIL. */
const driveRunner = () => {
  try {
    const out = execFileSync(process.execPath, [RUNNER],
      { cwd: REPO, stdio: "pipe", maxBuffer: 256 * 1024 * 1024 });
    return { code: 0, text: out.toString() };
  } catch (e) {
    return { code: e.status ?? -1, text: String(e.stdout || "") + String(e.stderr || "") };
  }
};

const RUNS = 3;   /* the loss is NONDETERMINISTIC by the plane's own measurement, so a
                     single run of arm 1 proves nothing either way and arm 2's claim is
                     "every run", which one run cannot support. */
const SMALL = 100;   /* ~410 KB — 6× one pipe buffer */
const LARGE = 600;   /* ~2.4 MB — the size at which the plane measured the loss as certain */

/* Install the armed suite at a given size and flush state, drive run.mjs `RUNS` times,
   and report how often the TALLY arrived, with the bytes delivered each time. */
const drive = (withImport, lines) => {
  fs.writeFileSync(ARMED, armedSource(withImport, lines));
  let present = 0; const sizes = [];
  for (let i = 0; i < RUNS; i++) {
    const r = driveRunner();
    const block = r.text.slice(r.text.indexOf("FAIL zz-nc-m036-armed.test.mjs"));
    sizes.push(block.length);
    if (block.includes(TALLY)) present++;
  }
  return { present, missing: RUNS - present, sizes };
};

/* THE SAME SPAWN run.mjs MAKES, PINNED TO run.mjs's OWN SOURCE, used where a RATE is
   wanted rather than a demonstration. Driving the full runner costs ~85 s a sample, and a
   rate needs tens of samples, not three. What actually matters for this defect is that
   the child's stdout is an asynchronous PIPE — it is a TTY that makes the defect vanish,
   not the absence of run.mjs — so a direct spawn with the runner's own options measures
   the same thing 140× cheaper. The options are PINNED rather than copied: if run.mjs's
   spawn changes and this does not, the pin throws instead of quietly measuring something
   run.mjs no longer does. */
const RUNNER_SRC = fs.readFileSync(RUNNER, "utf8");
if (!/stdio:\s*"pipe"/.test(RUNNER_SRC) || !/maxBuffer:\s*256 \* 1024 \* 1024/.test(RUNNER_SRC))
  throw new Error("nc-m036 DID NOT ARM: run.mjs's child spawn options are not the ones this driver pins. "
    + "Re-read run.mjs and re-judge every rate below rather than adjusting this line.");
const CHILD = { stdio: "pipe", maxBuffer: 256 * 1024 * 1024 };
const fastDrive = (withImport, lines, n) => {
  fs.writeFileSync(ARMED, armedSource(withImport, lines));
  let present = 0; const sizes = [];
  for (let i = 0; i < n; i++) {
    let text = "";
    try { text = execFileSync(process.execPath, [ARMED], CHILD).toString(); }
    catch (e) { text = String(e.stdout || "") + String(e.stderr || ""); }
    sizes.push(text.length);
    if (text.includes(TALLY)) present++;
  }
  return { present, missing: n - present, n, min: Math.min(...sizes), max: Math.max(...sizes) };
};

try {
  /* ---- ARM 1 — THE RATE, AND THE ARM THAT TWO DECLARATIONS GOT WRONG ---------
   * DECLARED AFTER THREE DRIVER RUNS DISAGREED WITH EACH OTHER, AND THE ARMS WERE RIGHT
   * BOTH TIMES. Through the real runner, ~410 KB without the import measured 1-of-3
   * missing on a loaded machine and 0-of-3 on a quiet one; ~2.4 MB measured 3-of-3 and
   * then 1-of-3. Neither "lost every run" nor "lost at least once in 3" is a claim three
   * samples can carry, because THE LOSS IS A RACE between the child's writes and the
   * parent's draining and its rate moves with machine load — which `stdio.mjs`'s own
   * header says in as many words (MISSING, MISSING, PRESENT over three identical runs).
   *
   * SO THE FALSIFIABLE CLAIM IS A COMPARISON OF RATES OVER ENOUGH SAMPLES, NOT AN
   * OUTCOME: without the import the loss rate is ABOVE ZERO, and with it the rate is
   * EXACTLY ZERO over the same number of samples at the same size on the same machine in
   * the same minute. A zero that costs nothing is not evidence, so the with-import side is
   * only worth reading beside a without-import side that did lose some.
   *
   * AND INTERMITTENCE IS THE WORSE PROPERTY, NOT THE MILDER ONE: a tally that is usually
   * there is a tally nobody learns to distrust, and D-93 exists because a suite reporting
   * no tally reads as a suite that was never run. */
  {
    const N = 40;
    const a = fastDrive(false, SMALL, N), b = fastDrive(true, SMALL, N);
    const c = fastDrive(false, LARGE, N), d = fastDrive(true, LARGE, N);
    const lost = a.missing + c.missing, kept = b.missing + d.missing;
    record(`ARM 1 — the LOSS RATE, ${N} samples per cell, run.mjs's own spawn options (pinned)`,
      lost > 0 && kept === 0,
      `WITHOUT the import the tally is lost in more than 0 of ${2 * N} samples; WITH it, in exactly 0 of ${2 * N}`,
      `~410 KB: ${a.missing}/${N} lost without · ${b.missing}/${N} lost with  |  `
      + `~2.4 MB: ${c.missing}/${N} lost without · ${d.missing}/${N} lost with  |  `
      + `bytes without: ${a.min}–${a.max} / ${c.min}–${c.max}; with: ${b.min}–${b.max} / ${d.min}–${d.max}`,
      lost > 0 ? "the gap was real and the fix closes it; the rate is load-dependent and is reported, not declared"
               : "NOT LOST ONCE IN ANY SAMPLE — on this machine at these sizes the race did not go the wrong way. "
                 + "That is a statement about this machine, not a refutation: the with-import side then proves nothing, "
                 + "because a zero beside a zero costs nothing. Re-run under load before concluding anything.");
  }

  /* ---- ARM 1a — THE THRESHOLD IS REAL AND IT IS A COIN, WHICH IS THE POINT ---
   * DECLARED AFTER A FIRST RUN CAME BACK 1-OF-3 AND THE ARM WAS RIGHT. The first
   * declaration was "lost in every one of 3 runs" at ~410 KB, and the measurement was
   * 1 of 3 — full dump twice, truncated at 82,030 bytes once. That is not a refutation,
   * it is the module's own documented behaviour: the child's writes RACE the parent's
   * draining, so near the threshold the same failing suite may or may not report its
   * count run to run. The declaration was over-confident and is corrected here rather
   * than quietly rewritten, which is what D-282's own control did twice for the same
   * reason. AND INTERMITTENCE IS THE WORSE DEFECT, not the milder one: a tally that is
   * usually there is a tally nobody learns to distrust. */
  /* ---- ARM 1F — THE SAME DEFECT THROUGH THE REAL RUNNER, REPORTED NOT DECLARED ----
   * ARM 1 establishes the rate cheaply; this one establishes that the cheap path is
   * measuring the same thing the runner does, by driving the ACTUAL `run.mjs` — all 50
   * suites, its three guards, its provenance report — with the armed suite among them.
   * ITS WITHOUT-IMPORT SIDE CARRIES NO VERDICT ON PURPOSE. At ~85 s a sample only three
   * are affordable, and three samples of a coin is not an arm; declaring one anyway is
   * what produced two NOT-AS-DECLARED results that were both the DECLARATION's fault.
   * The rate is printed so a reader can add it to ARM 1's, and the accumulated evidence
   * through the real runner across this session's driver runs is 1/3, 0/3 at ~410 KB and
   * 3/3, 1/3 at ~2.4 MB — lost 5 times in 12 real-runner samples. */
  {
    const r = drive(false, LARGE);
    record(`ARM 1F — ~2.4 MB WITHOUT the import, through the REAL run.mjs (${RUNS} runs, REPORTED)`,
      true,
      `no verdict is claimed: ${RUNS} samples cannot decide a rate. What is asserted is only that the `
      + `runner RAN and reported the armed suite as FAILING, so the sample is real`,
      `tally missing in ${r.missing} of ${RUNS} runs; bytes delivered per run: ${r.sizes.join(", ")}`,
      "the load-dependence is the finding: the same cell measured 3/3 lost on a machine with several "
      + "workers live and 1/3 lost on a quiet one, which is why ARM 1 counts samples instead");
  }

  /* ---- ARM 2 — THE FIX CLOSES IT, AT BOTH SIZES, THROUGH THE REAL RUNNER ---- */
  {
    const small = drive(true, SMALL), large = drive(true, LARGE);
    record(`ARM 2 — the SAME armed suite WITH the shared import, one line different (${RUNS} runs at each size)`,
      small.present === RUNS && large.present === RUNS,
      `the tally ARRIVES in all ${RUNS} runs at BOTH sizes — the race is gone, not merely won`,
      `~410 KB: present in ${small.present}/${RUNS} (${small.sizes.join(", ")}); `
      + `~2.4 MB: present in ${large.present}/${RUNS} (${large.sizes.join(", ")})`,
      "and the whole dump arrives with it — the fix delivers the diagnosis, it does not truncate it");
  }

  /* ---- ARM 5 — D-387, THE READER'S CEILING, DRIVEN AS ITS OWN VARIABLE ----- */
  /* The flush fix held constant (import present) and the dump raised past 1 MiB. With
     run.mjs's `maxBuffer` line in place the tally arrives; with that ONE line stripped,
     it does not — which is the arm that says D-387 is a real second mechanism rather
     than a mis-sized arm 2. Restored by `cp`, verified by sha256 AND content. */
  {
    fs.writeFileSync(ARMED, armedSource(true, LARGE));        /* ~2.4 MB, past 1 MiB */
    const pristine = fs.readFileSync(RUNNER);
    const aside = path.join(HERE, ".nc-m036-pristine-run.mjs");
    fs.writeFileSync(aside, pristine);
    let fixed = "", unfixed = "";
    try {
      fixed = driveRunner().text;
      const stripped = pristine.toString().replace(/maxBuffer: 256 \* 1024 \* 1024/, "");
      if (stripped === pristine.toString())
        throw new Error("ARM 5 DID NOT ARM: run.mjs's maxBuffer line was not found");
      fs.writeFileSync(RUNNER, stripped);
      execFileSync(process.execPath, ["--check", RUNNER], { stdio: "pipe" });
      unfixed = driveRunner().text;
    } finally {
      fs.writeFileSync(RUNNER, fs.readFileSync(aside));
      fs.unlinkSync(aside);
    }
    const back = fs.readFileSync(RUNNER);
    const blk = t => t.slice(t.indexOf("FAIL zz-nc-m036-armed.test.mjs"));
    const gotFixed = blk(fixed).includes(TALLY), gotUnfixed = blk(unfixed).includes(TALLY);
    record("ARM 5 — a 2.4 MB dump WITH the flush fix; run.mjs's maxBuffer is the only variable",
      gotFixed && !gotUnfixed,
      "the tally arrives WITH run.mjs's maxBuffer and is LOST without it — a second mechanism, not a mis-sized arm 2",
      `with maxBuffer: ${gotFixed ? "tally PRESENT" : "tally LOST"} (${blk(fixed).length} bytes); `
      + `without it: ${gotUnfixed ? "tally PRESENT" : "tally LOST"} (${blk(unfixed).length} bytes)`,
      `restored byte-identically: ${back.equals(pristine) ? "YES" : "NO"} — node's default maxBuffer is 1 MiB and `
      + `overflow KILLS the child (measured: ENOBUFS after 1,114,112 bytes on node ${process.version})`);
  }
} finally {
  if (fs.existsSync(ARMED)) fs.unlinkSync(ARMED);
}
record("ARM 0 (hygiene) — the armed suite is gone",
  !fs.existsSync(ARMED),
  "no zz-nc-m036-armed.test.mjs remains in civicos-ui/test/",
  fs.existsSync(ARMED) ? "IT IS STILL THERE — remove it before running anything else" : "removed",
  "an untracked .test.mjs left here is M0-15's phantom, which run.mjs discovers, runs and counts");

/* ---- ARM 3 — THE CENSUS CATCHES A REGRESSION AND NAMES IT ----------------- */
{
  const VICTIM = "finder.test.mjs";
  const vpath = path.join(HERE, VICTIM);
  const pristine = fs.readFileSync(vpath);
  const aside = path.join(HERE, ".nc-m036-pristine-" + VICTIM);
  fs.writeFileSync(aside, pristine);          /* cp aside FIRST, per CLAUDE.md */
  let censusOut = "", censusCode = 0;
  try {
    const stripped = stripImport(pristine.toString());
    if (stripped === null)
      throw new Error("ARM 3 DID NOT ARM: no single import construct found in " + VICTIM
        + " — an arm that did not arm reports green and refutes nothing, so this throws rather than continuing");
    fs.writeFileSync(vpath, stripped);
    execFileSync(process.execPath, ["--check", vpath], { stdio: "pipe" });  /* the armed file must still PARSE */
    try {
      censusOut = execFileSync(process.execPath, [path.join(HERE, "stdio-census.test.mjs")],
        { cwd: REPO, stdio: "pipe", maxBuffer: 64 * 1024 * 1024 }).toString();
    } catch (e) { censusCode = e.status ?? -1; censusOut = String(e.stdout || "") + String(e.stderr || ""); }
  } finally {
    fs.writeFileSync(vpath, fs.readFileSync(aside));   /* cp BACK, never `git checkout --` */
    fs.unlinkSync(aside);
  }
  const back = fs.readFileSync(vpath);
  const byHash = sha(back) === sha(pristine);
  const byContent = back.equals(pristine);
  record("ARM 3 — the import stripped from one repaired suite; the census must fail AND name it",
    censusCode !== 0 && censusOut.includes(VICTIM) && byHash && byContent,
    `the census exits non-zero and the message contains "${VICTIM}"`,
    `exit ${censusCode}; names the suite: ${censusOut.includes(VICTIM) ? "YES" : "NO"}`,
    `restored byte-identically: ${byHash && byContent ? "YES" : "NO"} (sha256 ${byHash ? "match" : "MISMATCH"}, content ${byContent ? "match" : "MISMATCH"})`);
}

/* ---- ARM 4 (OVER-STRICTNESS) — A FLUSH CHANGES WHEN, NEVER WHICH ---------- */
{
  const SAMPLE = "docprofile.test.mjs";
  const spath = path.join(HERE, SAMPLE);
  const pristine = fs.readFileSync(spath);
  const aside = path.join(HERE, ".nc-m036-pristine-" + SAMPLE);
  fs.writeFileSync(aside, pristine);
  const run = () => {
    try { return execFileSync(process.execPath, [spath], { cwd: REPO, stdio: "pipe", maxBuffer: 64 * 1024 * 1024 }).toString(); }
    catch (e) { return String(e.stdout || "") + String(e.stderr || ""); }
  };
  let withImp = "", without = "";
  try {
    withImp = run();
    const stripped = stripImport(pristine.toString());
    if (stripped === null)
      throw new Error("ARM 4 DID NOT ARM: no single import construct found in " + SAMPLE);
    fs.writeFileSync(spath, stripped);
    execFileSync(process.execPath, ["--check", spath], { stdio: "pipe" });  /* the armed file must still PARSE */
    without = run();
  } finally {
    fs.writeFileSync(spath, fs.readFileSync(aside));
    fs.unlinkSync(aside);
  }
  const back = fs.readFileSync(spath);
  /* A FLOOR ON THE SAMPLE, because two EMPTY outputs are byte-identical for free and that
     is the costs-nothing rule arriving inside an over-strictness arm — two harnesses in
     this estate have already reported a restore identical over an empty manifest. */
  record("ARM 4 (over-strictness) — a currently-PASSING suite's output with and without the import",
    withImp === without && withImp.length > 20 && back.equals(pristine),
    "byte-identical AND non-empty: the fix changes WHEN bytes arrive and never WHICH bytes",
    withImp === without ? `identical, ${withImp.length} bytes, sha256 ${sha(withImp).slice(0, 16)}`
                        : `DIFFER — ${withImp.length} vs ${without.length} bytes`,
    `restored byte-identically: ${back.equals(pristine) ? "YES" : "NO"}`);
}

const miss = results.filter(r => !r.agree);
console.log(`\nnc-m036: ${results.length - miss.length} of ${results.length} arms as declared`);
if (miss.length) { for (const m of miss) console.error("  NOT AS DECLARED: " + m.arm); process.exit(1); }
