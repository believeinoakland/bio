/* stdio-census.test.mjs — M0-36. D-282'S OTHER ESTATE, ASSERTED AS A POPULATION
 * RATHER THAN COUNTED IN A ROW.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/nc-m036.mjs` — six arms and one reported cell,
 * each armed ALONE, every one driven through a PIPE and none through a terminal (the
 * defect does not exist on a TTY, so a control run in a terminal refutes nothing while
 * looking exactly like a refutation). ARM 1: the LOSS RATE over 40 samples per cell at two
 * dump sizes, using `run.mjs`'s own spawn options pinned to its source — without the import
 * the rate is above zero, with it exactly zero. ARM 1F: the same cell through the ACTUAL
 * `run.mjs`, REPORTED WITHOUT A VERDICT because three samples cannot decide a rate.
 * ARM 2: with the import, the tally arrives in every run at both sizes through the real
 * runner. ARM 3: this census with the import stripped from one repaired suite must FAIL
 * and must NAME that suite. ARM 4 (over-strictness): a currently-PASSING suite's output is
 * byte-identical and non-empty with and without the import. ARM 5: D-387 — 2.4 MB, flush
 * fix held CONSTANT, `run.mjs`'s `maxBuffer` the only variable.
 *
 * THE LOSS IS A RACE AND TWO DECLARATIONS GOT THAT WRONG BEFORE THE ARM DID. Declared
 * *lost in every one of 3 runs* it measured 1 of 3; re-declared *lost at least once in 3*
 * it measured 0 of 3 on a quieter machine. Both times the arm was right and the
 * DECLARATION was wrong, and the fix was to stop declaring an outcome and start counting
 * samples. Intermittence is the WORSE property, not the milder one: a tally that is
 * usually there is a tally nobody learns to distrust.
 *
 * ARM 5 EXISTS BECAUSE THE FIRST DRAFT'S ARM 2 CAME BACK RED OVER A WORKING SUBJECT.
 * The dump was sized at 2.4 MB, which is past node's DEFAULT `execFileSync` maxBuffer of
 * 1 MiB — so the reader killed the child and truncated it, and the flush fix could not
 * have shown through. The tell was the byte counts (1,051,059 · 1,096,225 — not
 * pipe-buffer numbers), and the finding is recorded rather than smoothed: it is a second,
 * independent tally-loss mechanism, now D-387, fixed in `run.mjs` and pinned by ARM 5.
 *
 * ============================================================================
 * WHAT THIS FILE IS FOR
 * ============================================================================
 * `civicos-ui/test/run.mjs` spawns every suite with `{stdio:"pipe"}`, and
 * `civicos-ui/check-mock-envelope.mjs` spawns every suite AGAIN with `{stdio:"pipe"}`
 * for its second pass. On darwin a write to a pipe is ASYNCHRONOUS, so a suite that
 * ends `process.exit(...)` — which `hygiene`'s dispose rule requires of the plane's
 * suites and which this estate copied — returns to the OS with its tail still queued.
 * The tail is where the TALLY lives, and D-93 exists because a suite that reports no
 * tally reads as a suite that was never run. The whole mechanism, the measurements
 * and the two fixes that were rejected are in `bio-plane/test/stdio.mjs`'s header.
 *
 * THE JUDGEMENT M0-36 HAD TO MAKE, STATED HERE AND AT ALL 53 SITES: the module is
 * SHARED across the package boundary, not copied into this estate. Three reasons,
 * none of them taste:
 *   1. THE PRECEDENT IS ALREADY HERE AND IT IS NOT MINE. `run.mjs` itself imports
 *      `../../bio-plane/scripts/provenance.mjs`, and `member-respect.test.mjs` was
 *      already importing this very module by this very path. A copy would have made
 *      the estate inconsistent with itself to avoid a hop it already takes.
 *   2. A COPY WOULD BE UNGUARDED. The module reaches `_handle.setBlocking`, which is
 *      PRIVATE node API, and `bio-plane/test/tally-through-pipe.test.mjs` is what
 *      turns the day node closes that door into a red battery instead of a quiet
 *      one. That guard covers the file it imports. A second copy here would be a
 *      second implementation of a private-API trick with no guard on it at all —
 *      the failure mode being guarded against, reintroduced by the fix for it.
 *   3. THE MODULE IS A SIDE EFFECT WITH NO SHAPE. It exports nothing this estate
 *      calls and takes no configuration, so there is no interface to drift and
 *      nothing an installer or a release has to carry. Sharing costs a relative
 *      path; copying costs a second thing to keep right forever.
 *
 * ============================================================================
 * THE POPULATION, MEASURED 2026-09-16 RATHER THAN INHERITED
 * ============================================================================
 * M0-36's row carried "38 of the 53 UI suites that call `process.exit`", and the row
 * itself said to re-measure before editing. Re-measured, BOTH of its figures turn out
 * to be right about a population, and they are not the same population:
 *
 *   - 53 is the count of files in `civicos-ui/test/` that call `process.exit` and
 *     LACK the import — over the whole directory, `.test.mjs` and harnesses alike.
 *   - 38 is the count of `.test.mjs` suites that call `process.exit` and contain no
 *     occurrence of the string `stdio` AT ALL. It under-counts the suites by three
 *     (`auth-surface`, `intent-write`, `refusal-codes`), which spawn children of
 *     their own with `stdio:"pipe"` and so matched a scan for `stdio` while importing
 *     nothing. A grep for a substring of the answer is not a census for the answer.
 *
 * The figure to edit on was neither: 49 suites are discovered by `run.mjs`, 42 of them
 * call `process.exit`, 1 already imported the module, so 41 suites were repaired —
 * plus 11 `.control.mjs`/harness drivers and `run.mjs` itself, 53 files in all.
 *
 * THE HARNESSES ARE IN SCOPE ON PURPOSE AND IT IS NOT COMPLETENESS FOR ITS OWN SAKE:
 * D-282 WAS FOUND BY A CONTROL ARM CATCHING ITSELF, reporting a tally of `-1`. A
 * control driver that loses its own verdict through a pipe produces the most expensive
 * output this project has — a confident wrong refutation. And `run.mjs` is the same
 * defect one layer out: it prints `civicos-ui: all harnesses green` on the line after a
 * `process.exit(1)` branch, so a session piping it to a log or driving it from a
 * control can lose the one line it reads the verdict from.
 *
 * ============================================================================
 * THE RESIDUAL, NAMED HERE RATHER THAN LEFT TO A REGISTER
 * ============================================================================
 * `civicos-ui/check-*.mjs` is OUTSIDE M0-36's claimed region and is not repaired.
 * `check-semantics.mjs` has the live form of the defect — it prints its `OK: …`
 * verdict and calls `process.exit(fail ? 1 : 0)` on the next line. The other two are
 * at risk on their failure path only. A DELEGATION carries it to UI; ARM D below
 * PINS the residual so that landing it turns this file red, and whoever lands it
 * shrinks the list here in the same turn rather than discovering it later.
 */
import "../../bio-plane/test/stdio.mjs";   /* this suite is in its own population */
import { synchronousStdio } from "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
/* M0-16 / D-301 — THIS FILE DISCOVERS ITS OWN CORPUS, SO IT MUST SAY WHAT IT DISCOVERED.
   Caught by `hygiene.test.mjs` at this item's own gate, and the catch is right: a census
   that reads a directory it does not control and prints a population is exactly the shape
   that let M0-15's phantom into a baseline, and `refs/stash` is repository-wide across
   every worktree of this clone. GUARDED rather than added to hygiene's named-and-unguarded
   list, because the figure this file prints is the answer, not a diagnostic — a reader
   about to quote "53 writers repaired" is owed the reproducible total beside it. */
import { readGitProvenance, repoPath, reportProvenance } from "../../bio-plane/scripts/provenance.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const UIDIR = path.resolve(HERE, "..");
const MODULE_REL = "../../bio-plane/test/stdio.mjs";
const MODULE_ABS = path.resolve(HERE, MODULE_REL);

let n = 0; const fails = [];
const ok = (cond, msg) => { n++; if (!cond) fails.push(msg); };

/* ---- ARM A — THE MODULE THIS ESTATE SHARES ACTUALLY EXISTS AND ACTUALLY APPLIED -- */
ok(fs.existsSync(MODULE_ABS),
   `ARM A1: the shared module is missing at ${MODULE_REL}. 53 files in this directory import it by that `
   + `relative path; if the plane's test estate moved it, MOVE THE IMPORTS, do not copy the module here — `
   + `a copy is a second unguarded use of a private node API (see this file's header, reason 2).`);
{
  const r = synchronousStdio();
  /* Imported at the top for its side effect, so a second call must report `already`.
     This is the idempotence the module promises, asserted rather than trusted. */
  ok(r.already === true,
     `ARM A2: importing the module twice re-applied it (already=${r.already}) — the module's own idempotence `
     + `guarantee is what makes it safe to import in a suite that also imports \`sandbox.mjs\`.`);
}

/* ---- ARM B — THE CENSUS ------------------------------------------------------- */
/* THE MATCHER IS AN IMPORT STATEMENT, NOT A SUBSTRING — AND THIS FILE EARNED THAT
   SENTENCE THE HARD WAY. The first draft asked `text.includes(MODULE_REL)`, and it
   scored `nc-m036.mjs` GUARDED because that driver carries the import line as a STRING
   CONSTANT in order to strip it from a suite during an arm. A control driver that never
   imported the module was counted as importing it, by the census whose own header says a
   grep for a substring of the answer is not a census for the answer. Anchored at line
   start, with or without a binding, so a mention in prose or in a constant cannot satisfy
   it — and the driver now imports it for real. */
const IMPORTED = new RegExp(
  '^import\\s+(?:[^;\\n]*\\sfrom\\s+)?["\']' + MODULE_REL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '["\']', "m");
const files = fs.readdirSync(HERE).filter(f => f.endsWith(".mjs")).sort();
const reads = new Map(files.map(f => [f, fs.readFileSync(path.join(HERE, f), "utf8")]));
const exits  = files.filter(f => /process\.exit/.test(reads.get(f)));
const shared = files.filter(f => IMPORTED.test(reads.get(f)));
const gap    = exits.filter(f => !IMPORTED.test(reads.get(f)));

ok(gap.length === 0,
   `ARM B1: ${gap.length} file(s) in civicos-ui/test/ call \`process.exit\` without importing the flush module, `
   + `so each can lose its own tally when run.mjs (or check-mock-envelope.mjs) spawns it with {stdio:"pipe"}: `
   + `${gap.join(", ")}. THE FIX IS ONE LINE — \`import "${MODULE_REL}";\` before the first top-level import — `
   + `and it is never an exemption: a file exempted from this census is a writer nobody is guarding.`);

/* THE CENSUS MUST NOT BE VACUOUS. A sweep over an empty population passes, and this
   file's whole value is the population it walks — the costs-nothing rule applied to
   an assertion rather than to a digest. */
ok(exits.length >= 50,
   `ARM B2 (anti-vacuity): only ${exits.length} file(s) in this directory call \`process.exit\`, against 55 measured `
   + `2026-09-16. A census that walks a collapsed population is green for the wrong reason. If suites were `
   + `legitimately deleted, LOWER THIS FLOOR IN THE SAME TURN and say in this message what was deleted.`);
ok(files.filter(f => f.endsWith(".test.mjs")).length >= 45,
   `ARM B3 (anti-vacuity): only ${files.filter(f => f.endsWith(".test.mjs")).length} suites discovered here, against 50 `
   + `measured 2026-09-16 (49 pre-existing plus this one). Same rule as B2 — move the floor deliberately or not at all.`);
/* THE MATCHER IS TESTED AGAINST ITS OWN FAILURE MODE, IN THE FILE THAT USES IT. Without
   this, the tightening above is a claim: a census that cannot be shown to REJECT anything
   is a census whose greens mean nothing — `hygiene` staying green under `unflush` is the
   same shape. Both directions, because a matcher that rejects everything also passes a
   one-sided test. */
ok(!IMPORTED.test(`const IMPORT = "${MODULE_REL}";`) && !IMPORTED.test(` * see ${MODULE_REL} for why`),
   `ARM B0 (instrument): the import matcher accepts a MENTION of the module path — in a string constant or in `
   + `prose — as an import. That is the exact false positive this file was caught making (it scored nc-m036.mjs `
   + `guarded because that driver carries the path as a constant), and it would report a whole estate green.`);
ok(IMPORTED.test(`import "${MODULE_REL}";`) && IMPORTED.test(`import { synchronousStdio } from "${MODULE_REL}";`),
   `ARM B0b (instrument, the other direction): the matcher rejects a REAL import, bare or bound. A matcher that `
   + `accepts nothing passes ARM B0 for free and would report the estate unguarded.`);
ok(shared.length === exits.length,
   `ARM B4: ${shared.length} file(s) import the module and ${exits.length} call \`process.exit\` — these must agree. `
   + `A file importing the module without exiting is harmless but unexplained; a file exiting without it is the defect.`);

/* ---- ARM C — THE PRECONDITION IS PINNED, NOT ASSUMED --------------------------- */
{
  const runner = reads.get("run.mjs") || "";
  ok(/maxBuffer/.test(runner),
     `ARM C0 (D-387): run.mjs no longer sets a \`maxBuffer\` on the children it spawns, so it is back on node's `
     + `DEFAULT of 1 MiB — and on overflow node KILLS the child and truncates its output. That loses a failing `
     + `suite's tally for a reason the D-282 flush fix cannot touch, and from the reader's seat the two are `
     + `indistinguishable: a FAIL line with no count after it. Measured 2026-09-16: ENOBUFS after 1,114,112 bytes.`);
  ok(/stdio:\s*"pipe"/.test(runner),
     `ARM C1: run.mjs no longer spawns its suites with {stdio:"pipe"}. That may be an IMPROVEMENT rather than a `
     + `regression — handing children a file descriptor fixes this reader. It is pinned because the writer-side `
     + `fix was chosen over the reader-side one on a count (three scripts and ~60 harnesses in this estate spawn `
     + `and read a child), so if a reader changed, RE-JUDGE this census's argument rather than deleting it.`);
  const envelope = fs.readFileSync(path.join(UIDIR, "check-mock-envelope.mjs"), "utf8");
  ok(/\{ stdio:"pipe"/.test(envelope) || /stdio:"pipe"/.test(envelope),
     `ARM C2: check-mock-envelope.mjs no longer spawns suites piped. It is the SECOND piped reader of the same `
     + `writers, and it is pinned for the same reason as C1 — the writer-side fix serves every reader, including `
     + `the ones nobody has written yet.`);
}

/* ---- ARM D — THE RESIDUAL, PINNED SO LANDING IT CLEARS THIS NOTE --------------- */
{
  const RESIDUAL = ["check-semantics.mjs", "check-refusal-codes.mjs", "check-mock-envelope.mjs"];
  const still = RESIDUAL.filter(f => {
    const s = fs.readFileSync(path.join(UIDIR, f), "utf8");
    return /process\.exit/.test(s) && !s.includes("test/stdio.mjs");
  });
  ok(still.length === RESIDUAL.length,
     `ARM D1: this file's header and the 2026-09-16 M0->UI DELEGATION both say all ${RESIDUAL.length} guards in `
     + `civicos-ui/ still carry the defect, and ${still.length} do. If a guard was repaired, this is not a failure of `
     + `the tree — it is THIS FILE being stale. Remove the repaired guard from RESIDUAL, shrink the header's residual `
     + `section, and discharge the DELEGATION in CLAIMS.md, all in the same turn. Do not exempt this arm.`);
  /* D-387's residual is the SAME file list read for a DIFFERENT property, and it is kept
     separate on purpose: check-mock-envelope.mjs is a piped READER of every suite here as
     well as an unflushed WRITER itself, so repairing one half of it does not repair the
     other. Reported rather than failed — it is outside this item's region either way. */
  const envelope = fs.readFileSync(path.join(UIDIR, "check-mock-envelope.mjs"), "utf8");
  console.log(`  ARM D: residual OUTSIDE this item's region — ${still.length} guard(s) still exiting unflushed: ${still.join(", ")}`);
  console.log(`  ARM D (D-387): check-mock-envelope.mjs spawns all ${exits.length - 1} suites piped and sets maxBuffer: `
    + `${/maxBuffer/.test(envelope) ? "YES" : "NO — still on node's 1 MiB default, so it truncates a suite dumping past it"}`);
}

/* ---- ARM E — THE MECHANISM IS DRIVEN, NOT ARGUED ------------------------------- */
/* A child that floods past the pipe buffer and then `process.exit`s, spawned through a
   REAL pipe exactly as run.mjs spawns a suite. With the shared import its tally must
   arrive. `nc-m036.mjs` runs the same child WITHOUT the import and shows it does not —
   that arm is the one that proves the gap was real and it lives in the control driver,
   because a suite cannot assert its own subject is broken. */
{
  const flood = `import ${JSON.stringify("file://" + MODULE_ABS)};\n`
    + `const pad = "x".repeat(4096);\n`
    + `for (let i = 0; i < 600; i++) console.log(i + " " + pad);\n`
    + `console.log("drive: 1 pass, 0 fail");\n`
    + `process.exit(0);\n`;
  let out = "";
  try {
    out = execFileSync(process.execPath, ["--input-type=module", "-e", flood],
                       { stdio: "pipe", maxBuffer: 64 * 1024 * 1024 }).toString();
  } catch (e) { out = String(e.stdout || ""); }
  ok(out.includes("drive: 1 pass, 0 fail"),
     `ARM E1: a child writing ~2.4 MB and then exiting delivered ${out.length} bytes through a PIPE and its TALLY `
     + `was not among them, WITH the shared module imported. That is the module failing, not this estate — the `
     + `private \`_handle.setBlocking\` door it uses may have closed in this node build. Check `
     + `bio-plane/test/tally-through-pipe.test.mjs, which guards the same thing from the plane's side.`);
  ok(out.length > 2_000_000,
     `ARM E2: only ${out.length} bytes arrived through the pipe from a child that wrote ~2.4 MB. The tally may still `
     + `have made it, but bytes are being lost, which is the defect wearing a milder symptom. The fix delivers the `
     + `dump WHOLE — that was the fourth argument against capping the dump instead.`);
  console.log(`  ARM E: ${out.length} bytes delivered through a real pipe, tally present`);
}

/* THE PROVENANCE OF THE POPULATION THIS FILE JUST JUDGED — every file it admitted,
   classified against `git ls-tree HEAD`, with the reproducible total printed beside the
   contaminated one so a reader about to quote this census is told which figure another
   checkout at this HEAD reproduces (M0-16 rule 3). */
{
  const REPO = path.resolve(HERE, "../..");
  const prov = readGitProvenance(REPO);
  const items = files.map(f => ({ path: repoPath(REPO, HERE + f), what: f,
    counted: "walked by this census, and counted into its population figures" }));
  const repro = prov.inHead === null ? files.length
    : items.filter(i => prov.inHead.has(i.path)).length;
  reportProvenance({
    prov, items, instrument: "the civicos-ui stdio census",
    corpus: `civicos-ui/test/: ${files.length} .mjs file(s) walked, ${exits.length} calling process.exit`,
    totals: prov.inHead === null ? []
      : [{ label: "files walked", contaminated: files.length, reproducible: repro, source: "files" }],
  });
}
console.log(`  population: ${files.length} .mjs in civicos-ui/test/ · ${exits.length} call process.exit · ${shared.length} import the shared flush module · ${gap.length} unguarded`);
console.log(`stdio-census.test.mjs: ${n - fails.length} pass, ${fails.length} fail`);
if (fails.length) {
  console.error(`\nstdio-census: ${fails.length} of ${n} assertions FAILED, all listed:`);
  for (const f of fails) console.error("  - " + f);
  process.exit(1);
}
