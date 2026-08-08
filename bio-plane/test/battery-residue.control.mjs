#!/usr/bin/env node
/* D-237's negative controls, RUN rather than described.
 *
 * Deliberately NOT a `.test.mjs`: `scripts/battery.mjs` discovers by that suffix
 * and nothing else, so this harness moves the battery by zero and runs on
 * demand. It EDITS REAL SOURCES, which is why every arm restores from a
 * UNIQUELY-NAMED per-arm pristine copy and verifies the restore by sha256 AND by
 * `cmp`, printing a byte count and refusing a suspiciously small one — this
 * estate has twice had a harness report two EMPTY files byte-identical.
 *
 *   node test/battery-residue.control.mjs            every arm, each ALONE
 *   node test/battery-residue.control.mjs subject    just the named arm
 *
 * ARMS, and what MUST fail and MUST NOT fail is DECLARED before each is armed:
 *
 *  subject   — the `NAMED —` branch of `reportResidue` made unreachable, so
 *              residue outside the fence is counted and never named. MUST FAIL:
 *              (b) (c) (d)'s naming assertions. MUST NOT FAIL: (a) (e) (g) (h),
 *              which have nothing to name, and the reach arm.
 *  blind     — `scanShared` narrowed to nothing, i.e. the pre-D-237 state where
 *              the runner sees nothing outside `$TMPDIR`. MUST FAIL: (b) (c) (d)
 *              and (f) — (f) was NOT declared the first time this ran and failed
 *              anyway, correctly: an unreadable root is reported by the same root
 *              loop this arm neuters, and a scanner that never tried to read a
 *              root cannot report that it could not. The DECLARATION was
 *              corrected to the measurement — TWICE, because after arm (k) was
 *              added the blinded run also failed (a) and (k), both of which
 *              assert that the report STATES ITS REACH ("1 shared temp root(s)",
 *              "0 top-level entries"), and a scanner with no roots states a
 *              different reach. Correct in both cases, and declared now. MUST NOT
 *              FAIL: (h), the fenced line, which does not depend on the scan at
 *              all. This is the arm that reproduces the HISTORICAL defect rather
 *              than a mutation of the fix.
 *  held      — the pid-chain closure widened from "descendants of this battery"
 *              to "every process", so a FOREIGN process's open path is attributed
 *              to this run. THE OVER-ATTRIBUTION DIRECTION. MUST FAIL: (j).
 *              **THIS ARM CAME BACK GREEN THE FIRST TIME IT WAS RUN AND THAT IS
 *              A FINDING ABOUT THE ARM, RECORDED RATHER THAN SMOOTHED:** the
 *              suite then contained no process that was NOT the battery's
 *              descendant, so widening the closure could change nothing and the
 *              arm COULD NEVER HAVE BEEN HONOURED. Arm (j) — a sibling process
 *              holding a planted ground — was written to make it capable of
 *              failing, and on its own first run it caught a defect in the
 *              HARNESS: the matcher `/HELD BY THIS RUN/` also matches the
 *              ATTRIBUTION paragraph that explains the phrase.
 *  strict    — OVER-STRICTNESS: the `mtime touched, no bytes` summarisation
 *              removed, so every mtime touch is NAMED. MUST NOT FAIL any suite
 *              assertion (the scratch root is quiet), and the harness reports
 *              the count difference on the REAL machine, which is where the
 *              filter earns its place.
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const RESIDUE = join(DIR, "..", "scripts", "residue.mjs");
const SUITE = join(DIR, "battery-residue.test.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const only = process.argv[2] || null;
let armsRun = 0, armsAsDeclared = 0;

/* A restore is not believed on the strength of having been attempted. */
const restore = (arm, path, pristine, bytesFloor) => {
  copyFileSync(pristine, path);
  const size = statSync(path).size;
  const digest = sha(path);
  const cmp = spawnSync("cmp", ["-s", path, pristine]);
  const ok = cmp.status === 0 && size >= bytesFloor;
  console.log(`  restore[${arm}]: ${size} bytes (floor ${bytesFloor}) · sha256 ${digest.slice(0, 8)}…`
    + ` · cmp ${cmp.status === 0 ? "IDENTICAL" : "DIFFERS"}${ok ? "" : "  *** RESTORE NOT VERIFIED ***"}`);
  if (!ok) process.exitCode = 1;
  rmSync(pristine, { force: true });
};

const runSuite = () => {
  const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8", timeout: 600_000, cwd: join(DIR, "..") });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = [...out.matchAll(/(\d+) pass, (\d+) fail/g)].pop();
  /* A suite that dies before its foot reports NOTHING, and reporting that as
     zero failures is D-93's shape. `-1` is the honest value. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, out };
};

const arm = ({ name, file, edit, mustFail, mustNotFail, floor }) => {
  if (only && only !== name) return;
  armsRun++;
  const pristine = `${file}.pristine-${name}`;
  copyFileSync(file, pristine);
  const before = readFileSync(file, "utf8");
  const after = edit(before);
  if (after === before) {
    console.log(`ARM ${name}: *** NEVER ARMED — the patch matched zero times. That is a FINDING. ***`);
    rmSync(pristine, { force: true });
    return;
  }
  writeFileSync(file, after);
  console.log(`\nARM ${name}: DECLARED must-fail [${mustFail.join(", ")}] · must-not-fail [${mustNotFail.join(", ")}]`);
  const r = runSuite();
  console.log(`  suite: ${r.pass} pass, ${r.fail} fail`);
  const failed = [...r.out.matchAll(/^FAIL: (\([a-z]\)|the reach arm)/gm)].map((x) => x[1]);
  const distinct = [...new Set(failed)];
  console.log(`  arms that failed: ${distinct.length ? distinct.join(", ") : "none"}`);
  const missing = mustFail.filter((x) => !distinct.includes(x));
  const surprises = distinct.filter((x) => mustNotFail.includes(x));
  if (r.pass === -1) console.log(`  *** THE SUITE NEVER REACHED ITS FOOT — no tally at all. ***`);
  if (missing.length) console.log(`  *** DECLARED TO FAIL AND DID NOT: ${missing.join(", ")} ***`);
  if (surprises.length) console.log(`  *** DECLARED NOT TO FAIL AND DID: ${surprises.join(", ")} ***`);
  if (!missing.length && !surprises.length && r.pass !== -1) { armsAsDeclared++; console.log(`  AS DECLARED.`); }
  restore(name, file, pristine, floor);
};

/* ---- subject: the naming branch made unreachable ------------------------- */
arm({
  name: "subject", file: RESIDUE, floor: 12_000,
  mustFail: ["(b)", "(c)", "(d)", "(j)"], mustNotFail: ["(a)", "(e)", "(f)", "(g)", "(h)", "(i)", "the reach arm"],
  edit: (s) => s.replace(
    '  log(`  NAMED — the fenced figure above is a statement about $TMPDIR ONLY, and these are outside it (D-237):`);',
    '  if (rows.length) { return { rows, counts, summarised }; }'),
});

/* ---- blind: the pre-D-237 state, where nothing outside the fence is seen -- */
arm({
  name: "blind", file: RESIDUE, floor: 12_000,
  mustFail: ["(a)", "(b)", "(c)", "(d)", "(f)", "(j)", "(k)"], mustNotFail: ["(h)"],
  /* Blinded at the ROOTS rather than inside the scan, and that respelling is a
     finding rather than a preference. The first version anchored on the scan's
     own directory-listing line, quoting that call verbatim inside the patch
     string — and `hygiene.test.mjs`'s class census, which counts that call by
     matching a literal in a file's SOURCE, read THIS HARNESS as a directory walk
     and failed the battery by name. It walks nothing; the token was inside a
     quoted patch. That is the census's own stated blind spot (it reads source
     text, not semantics) meeting a file that quotes the token it is looking for
     — the shape this project has already met as a sweep failing by citing
     itself, and as a check catching its own correction because the correction
     quoted the token it corrected. THE SECOND SPELLING FAILED IT TOO, from THIS
     COMMENT, which is why the call is described here and never written out.
     Anchoring on the roots is also a TRUER pre-D-237 state: it blinds the scan,
     the arrival snapshot and the pid-chain arm together, where the old anchor
     blinded only the first. */
  edit: (s) => s.replace(
    "  return { roots, overridden };",
    "  return { roots: [], overridden };"),
});

/* ---- held: the pid closure widened to EVERY process ----------------------- */
arm({
  name: "held", file: RESIDUE, floor: 12_000,
  mustFail: ["(j)"], mustNotFail: ["(a)", "(b)", "(c)", "(d)", "(e)", "(f)", "(g)", "(h)", "(i)", "(k)", "the reach arm"],
  edit: (s) => s.replace(
    "  const mine = new Set([ownPid]);",
    "  const mine = new Set([ownPid, ...openPaths.keys()]);"),
});

/* ---- strict: the no-bytes summarisation removed --------------------------- */
arm({
  name: "strict", file: RESIDUE, floor: 12_000,
  mustFail: [], mustNotFail: ["(a)", "(b)", "(c)", "(d)", "(e)", "(f)", "(g)", "(h)", "(i)", "(j)", "(k)", "the reach arm"],
  edit: (s) => s.replace(
    '    if (!heldHere && !isGround && !appeared && grew <= 0) { bump("mtime touched, no bytes written", a.bytes); continue; }',
    '    /* strict arm: summarisation removed */'),
});

console.log(`\n${armsRun} arm(s) run, ${armsAsDeclared} behaved exactly as declared.`);
console.log(`Every arm above was armed ALONE, with the others held open, and every restore was`);
console.log(`verified by sha256 AND by cmp against a uniquely-named per-arm pristine copy.`);
