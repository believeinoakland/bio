/* M0-51 — THE DRIVER CENSUS. `coverage.mjs` used to answer "does this suite have
 * a control driver?" with `existsSync(test/<suite>.control.mjs)`, so it measured
 * a NAMING CONVENTION and printed the answer as a fact about the estate. A
 * correctly written, committed, runnable driver under any other name read as
 * ABSENT. Measured on this tree 2026-09-17 by a literal walk: 19 of 71 drivers
 * have no same-named sibling, up from 12 the day before — the population is
 * GROWING, which is why the spot fix (rename one driver to please the matcher)
 * was refused as tuning the SUBJECT to fit the INSTRUMENT.
 *
 * THE FIX INVERTS THE TEST RATHER THAN LENGTHENING A LIST OF SPELLINGS
 * (VERIFICATION.md's driver law, REC-70's lesson): walk the DRIVERS, and read
 * which suites each one NAMES IN CODE.
 *
 * WHAT THIS SUITE DRIVES, and it is deliberately not the real tree. Every arm
 * builds a THROWAWAY REPOSITORY, plants fixture suites and drivers in it, and
 * runs the REAL `scripts/coverage.mjs` inside it. A fixture copy of the reader
 * would agree with itself at zero cost and prove nothing about what runs.
 *
 * THE THREE FACTS THIS ROW EXISTS TO SEPARATE, each with its own arm, because
 * collapsing them is the defect:
 *   NOT FOUND          — no driver for this suite anywhere (gamma).
 *   I HAVE IT AND CANNOT READ IT — a driver walked, naming no suite in code (mute, prose).
 *   NOT WHERE I LOOKED — a file whose name claims a control, outside the walk (shell).
 *
 * NEGATIVE CONTROL: (1) restore the OLD naming test — make `hasDriver` read
 * `existsSync(test/<suite>.control.mjs)` again -> A2 FAILS BY NAME, because
 * `zulu.control.mjs` drives `beta.test.mjs` under a name the old matcher could
 * never match, while A1 stays GREEN because the same-name case never depended on
 * the fix. (2) READ THE DRIVER RAW instead of through `codeOnly` -> A3 and A4
 * FAIL: `prose.control.mjs` MENTIONS `gamma.test.mjs` in a comment and would be
 * credited with driving it, which is the D-277 defect pointing at drivers. (3)
 * DROP the UNREADABLE list, reporting only a percentage -> A4 and A5 FAIL BY
 * NAME: a census that reports a FIGURE instead of a JUDGEMENT hides exactly the
 * drivers nobody can resolve. (4) DROP the NOT WALKED list -> A6 FAILS, and with
 * it the only thing that tells a driver RENAMED OUT of the walk apart from one
 * DELETED outright. (5) DELETE THE LIMIT — remove the sentence in which the
 * census admits it cannot establish that a driver RAN -> A8 FAILS BY NAME,
 * because an instrument that quietly drops its own caveat keeps printing the
 * figure while the reader stops being told what it is worth. (6) OVER-STRICTNESS
 * -> rename every fixture driver to an unrelated name, keeping each one's CODE
 * reference intact, and EVERY arm stays GREEN: this item changes what is SEEN and
 * must change nothing that is TRUE. (7) BASELINE -> nothing armed, all arms
 * GREEN, so a run of failures cannot be mistaken for a run of passes.
 * RUN 2026-09-17 by M0-51 via `node test/m051-driver-census.control.mjs`, each
 * arm armed ALONE with the others held open, every restore verified by sha256
 * AND by byte comparison against a per-arm pristine copy under a byte floor.
 * RESULTS: 7 of 7 ARMED, 7 of 7 as declared.
 *
 * THE LIMIT, AND IT IS THE POINT OF STATING IT HERE TOO: these arms establish
 * that the census SEES a driver and names what it cannot see. They do NOT
 * establish that any driver RAN. A code reference is not an execution; the
 * instrument for that half is M0-42's `run:` key and nothing here may be read to
 * imply it. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
/* Built from the instrument's own constant, never typed as a literal: a real
   marker written in this file would plant a declaration in the corpus the
   register reads, and this suite's fixtures would then be counted as its own. */
import { CONTROL_MARKER } from "../scripts/control-register.mjs";
/* D-265: the copy list, derived from `coverage.mjs`'s own import graph rather
   than kept by hand. Miss a module and the scratch repository throws
   ERR_MODULE_NOT_FOUND and every arm fails IN THE HARNESS. */
import { instrumentDeps } from "./instrument-deps.mjs";
/* M0-107: an expired budget MEASURED NOTHING — one named budget assertion for the scratch run, and every arm
   reading it is SKIPPED on expiry, so the battery reads this suite NOT MEASURED, never RED. */
import { budgetAssert } from "./budget.mjs";
const RUN_BUDGET_MS = 60_000;

const DIR = dirname(fileURLToPath(import.meta.url));
const SCRIPTS = join(DIR, "..", "scripts");
const { files: REAL } = instrumentDeps("coverage.mjs");

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  if (!ok) console.log(`FAIL: ${name}\n  got:  ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`);
};

const opsSrc = `const OPS = {\n  ping: { mutating: false, classes: null },\n};\nexport { OPS };\n`;
const checksSrc = `/* C-1.1 the scratch catalog's only check */\nexport const CHECKS = ["C-1.1"];\n`;
/* A fixture suite: declares a control with one countable arm, so the register
   reads it rather than filing it as undeclared noise. */
const suiteSrc = (note) =>
  `/* ${CONTROL_MARKER} break the only check -> its own assertion fails\n`
  + `   ${note} */\n/* drives doGet("ping") via dispatchFetch, names C-1.1 */\n`
  + `console.log("scratch ok");\n`;

/* THE FIXTURE DRIVERS. Each one is a plain module; what matters is only whether
   it NAMES a suite, and whether it names it in CODE or in PROSE. */
const driverCode = (suite) =>
  `/* a driver: it runs the suite below */\n`
  + `import { spawnSync } from "node:child_process";\n`
  + `spawnSync(process.execPath, ["test/${suite}"]);\n`;
const driverProse = (suite) =>
  `/* This driver DISCUSSES ${suite} at length and never touches it. A reader\n`
  + `   that credits a mention is crediting a sentence. */\n`
  + `console.log("talks only");\n`;
const driverMute = `/* a driver that names no suite of this battery at all */\nconsole.log("mute");\n`;

const drive = () => {
  const repo = mkdtempSync(join(tmpdir(), "m051-cov-"));
  const g = (...args) => spawnSync("git", ["-C", repo,
    "-c", "user.email=m051@example.invalid", "-c", "user.name=M0-51",
    "-c", "commit.gpgsign=false", ...args], { encoding: "utf8" });
  const put = (rel, body) => {
    mkdirSync(join(repo, dirname(rel)), { recursive: true });
    writeFileSync(join(repo, rel), body);
  };
  mkdirSync(join(repo, "bio-plane", "scripts"), { recursive: true });
  for (const f of REAL) copyFileSync(join(SCRIPTS, f), join(repo, "bio-plane", "scripts", f));
  put("bio-plane/src/index.mjs", opsSrc);
  put("bio-plane/checks/bio-checks.mjs", checksSrc);

  /* alpha — the SAME-NAME case the old rule already resolved. It is here as the
     over-strictness anchor: whatever else changes, this must keep reading. */
  put("bio-plane/test/alpha.test.mjs", suiteSrc("same-named driver"));
  put("bio-plane/test/alpha.control.mjs", driverCode("alpha.test.mjs"));
  /* beta — THE ARM THIS ROW EXISTS FOR. Its driver is named `zulu`, which the old
     matcher could never match under any widening of the naming rule. */
  put("bio-plane/test/beta.test.mjs", suiteSrc("driver under an unrelated name"));
  put("bio-plane/test/zulu.control.mjs", driverCode("beta.test.mjs"));
  /* gamma — NOT FOUND. `prose.control.mjs` talks about it and never drives it. */
  put("bio-plane/test/gamma.test.mjs", suiteSrc("no driver anywhere"));
  put("bio-plane/test/prose.control.mjs", driverProse("gamma.test.mjs"));
  /* delta — THE OVER-STRICTNESS ANCHOR, and it is why a fourth fixture exists.
     Its driver is a same-named sibling that names NO suite in code, so delta is
     credited by the SIBLING path ALONE. That isolates the old rule as a variable:
     if a later edit ever drops the same-name arm in favour of the code read,
     delta loses its driver and says so, while alpha — credited by both paths —
     would go on reading healthy and hide it. */
  put("bio-plane/test/delta.test.mjs", suiteSrc("sibling driver naming nothing in code"));
  put("bio-plane/test/delta.control.mjs", driverMute);
  /* a driver naming nothing, and a control the walk does not reach. */
  put("bio-plane/test/mute.control.mjs", driverMute);
  put("bio-plane/test/shell.control.sh", "#!/bin/sh\necho 'a control driver in shell'\n");

  g("init", "-q", "-b", "main");
  g("add", "-A");
  g("commit", "-q", "-m", "scratch base");
  const r = spawnSync(process.execPath, ["scripts/coverage.mjs"],
    { cwd: join(repo, "bio-plane"), encoding: "utf8", timeout: RUN_BUDGET_MS });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  rmSync(repo, { recursive: true, force: true });
  return { out, measured: budgetAssert(t, "run-budget: the scratch census", r, RUN_BUDGET_MS, "every arm, A1-A8") };
};

const { out, measured } = drive();
/* A driver is READ when the census prints it followed by what it drives. */
const reads = (driver, suite) =>
  new RegExp(`^\\s+${driver.replace(/\./g, "\\.")}\\s+drives\\s+.*\\b${suite.replace(/\./g, "\\.")}`, "m").test(out);
const namedUnreadable = (driver) =>
  new RegExp(`^\\s+${driver.replace(/\./g, "\\.")}\\s+names no suite in code\\s*$`, "m").test(out);
const namedNotWalked = (f) => new RegExp(`^\\s+${f.replace(/\./g, "\\.")}\\s*$`, "m").test(out);
const suitesWithDriver = (() => {
  const m = out.match(/(\d+)\/(\d+) suites have a driver/);
  return m ? [Number(m[1]), Number(m[2])] : null;
})();
/* The PER-SUITE signal, read out of the register's own report rather than
   recomputed here: a suite the census credits carries `(has a driver)` beside its
   grade. Recomputing it in this file would be two copies of the rule agreeing
   with each other, which costs nothing to produce and proves nothing. */
const credited = (suite) =>
  new RegExp(`^\\s+\\S+\\s+.*\\s${suite.replace(/\./g, "\\.")}\\s+\\(has a driver\\)\\s*$`, "m").test(out);

console.log(`  census as the scratch tree read it: ${suitesWithDriver ? suitesWithDriver.join("/") : "NOT PRINTED"}`
  + ` · credited: alpha=${credited("alpha.test.mjs")} beta=${credited("beta.test.mjs")}`
  + ` delta=${credited("delta.test.mjs")} gamma=${credited("gamma.test.mjs")}`);

if (measured) {
/* (A1) OVER-STRICTNESS ANCHOR, and it is `delta` rather than `alpha` on purpose.
   `delta` is credited by the SAME-NAME PATH ALONE — its sibling driver names no
   suite in code — so this arm fails the moment that path stops working, which
   `alpha` (credited twice over) could not detect. This item changes what is SEEN
   and must change nothing that is TRUE. On the REAL tree the same property was
   MEASURED rather than assumed: 52 suites had a driver under the old rule and 73
   under this one, and the number that LOST one was ZERO. */
t("(A1) a suite whose ONLY driver is its same-named sibling is still credited — the "
+ "old rule is kept as one way in, not replaced, so nothing this reader credited "
+ "before has stopped being credited",
  [credited("delta.test.mjs"), credited("alpha.test.mjs")], [true, true]);

/* (A2) THE ARM THE ROW EXISTS FOR. A driver under a name the old matcher could
   never match is READ, and the suite it drives is credited. */
t("(A2) a driver named `zulu` is READ as driving `beta.test.mjs`, and `beta` is "
+ "credited — a driver the OLD matcher misses, which is the acceptance this row "
+ "was written to and which no widening of a naming rule could have reached",
  [reads("zulu.control.mjs", "beta.test.mjs"), credited("beta.test.mjs")], [true, true]);

/* (A3) NOT FOUND, and the prose refusal that makes it true. */
t("(A3) a suite whose only mention lives in a driver's COMMENT is NOT credited — "
+ "`prose.control.mjs` is never printed as driving `gamma.test.mjs`, and `gamma` "
+ "carries no driver at all",
  [reads("prose.control.mjs", "gamma.test.mjs"), credited("gamma.test.mjs")], [false, false]);

/* (A4) and (A5) I HAVE IT AND CANNOT READ IT — named, not dropped, not counted
   healthy. A census reporting a percentage would have hidden both. */
t("(A4) the driver that only TALKS about a suite is NAMED as unreadable rather than "
+ "silently dropped", namedUnreadable("prose.control.mjs"), true);
t("(A5) the driver that names no suite at all is NAMED as unreadable",
  namedUnreadable("mute.control.mjs"), true);

/* (A6) NOT WHERE I LOOKED. Without this list a driver RENAMED OUT of the walk and
   one DELETED outright are the same absence, and they are not the same fact. */
t("(A6) a file whose NAME claims a control but which the walk does not reach is NAMED "
+ "as NOT WALKED — the only thing distinguishing a renamed-out driver from a deleted one",
  namedNotWalked("shell.control.sh"), true);

/* (A7) THE CENSUS REPORTS A JUDGEMENT, NOT A FIGURE. Every driver in the tree is
   accounted for in one of the printed categories; none is quietly absent. */
t("(A7) every fixture driver appears in the census by name",
  [reads("zulu.control.mjs", "beta.test.mjs"), namedUnreadable("prose.control.mjs"),
   namedUnreadable("mute.control.mjs"), namedNotWalked("shell.control.sh")],
  [true, true, true, true]);

/* (A8) THE LIMIT IS PRINTED. Same shape as the register's own D-263 arm: an
   instrument that drops its caveat keeps printing the figure while the reader
   stops being told what the figure is worth. */
t("(A8) the census PRINTS the limit — that it establishes a driver EXISTS and cannot "
+ "establish that it RAN",
  /cannot establish that it RAN/i.test(out) && /reference is not an execution/i.test(out), true);

} /* end of measured (M0-107) */

console.log(`\nm051-driver-census: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
