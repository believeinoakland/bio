/* NEGATIVE CONTROL for D-282 — a suite's own exit must not discard its own tally.
 *
 * Run:  node test/tally-through-pipe.control.mjs [armId ...]      (default: all)
 *
 * DELIBERATELY NOT A `.test.mjs`. `scripts/battery.mjs` discovers by that suffix
 * and this driver EDITS REAL SOURCES while it runs; `walkfloor.control.mjs`,
 * `register.control.mjs` and `d249-port.control.mjs` are the precedent.
 *
 * WHY IT MATTERS MORE THAN ITS SIZE SUGGESTS. The subject is the INSTRUMENT every
 * other item in this repository is judged by, and D-282 was found by D-249's own
 * control arm catching ITSELF: the arm reported a tally of -1 and a verdict of
 * NOT AS DECLARED, and THE ARM WAS RIGHT WHILE THE HARNESS WAS WRONG. So this
 * driver captures every child to a FILE and never to a pipe — not because a pipe
 * is now unsafe (the whole point of this item is that it is not), but because a
 * control that depends on the fix it is testing proves nothing about it.
 *
 * THE RULES THIS DRIVER FOLLOWS, each of which this project paid to learn:
 *  - Each arm is armed ALONE, every other defence held OPEN.
 *  - Every arm DECLARES BEFORE IT RUNS what must fail and what must NOT.
 *  - A BASELINE arm exists, or a harness that breaks everything it touches is
 *    indistinguishable from four arms working.
 *  - Every restore is verified by sha256 AND by byte comparison against a
 *    UNIQUELY NAMED per-arm pristine copy, byte count PRINTED and floored.
 *  - A patch that matches ZERO times is a FINDING, not a silent no-op.
 *  - A tally that cannot be read is reported as -1, never as 0.
 *  - An OVER-STRICTNESS arm is included, and here it is the arm that decides
 *    between the two fixes D-282's row offered rather than a formality.
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync, openSync, closeSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const SUITE = join(DIR, "tally-through-pipe.test.mjs");
const STDIO = join(DIR, "stdio.mjs");
const HYGIENE = join(DIR, "hygiene.test.mjs");
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const MIN_BYTES = 1000;

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* CAPTURE TO A FILE, NEVER TO A PIPE. See the header: a control that reads its
   subject through the very channel the subject is about cannot distinguish a
   failing subject from a failing harness. This is the correction D-249's arm
   earned the hard way. */
let capN = 0;
const runToFile = (args, cwd = PLANE) => {
  const p = join(tmpdir(), `d282-control-${process.pid}-${capN++}.out`);
  const fd = openSync(p, "w");
  const r = spawnSync(process.execPath, args, { cwd, stdio: ["ignore", fd, fd] });
  closeSync(fd);
  const out = readFileSync(p, "utf8");
  unlinkSync(p);
  return { out, code: r.status, bytes: Buffer.byteLength(out) };
};

/* THE FOOT LINE IS THE EVIDENCE THE MODULE REACHED ITS OWN END. Without it a
   count is not a low number, it is NO number, and it is reported as -1. */
const runSuite = (rel, name) => {
  const r = runToFile([join(PLANE, rel)]);
  const m = r.out.match(new RegExp(`\\n${name}:\\s+(\\d+) pass, (\\d+) fail`));
  if (!m) return { pass: -1, fail: -1, reachedFoot: false, out: r.out, code: r.code };
  return { pass: +m[1], fail: +m[2], reachedFoot: true, out: r.out, code: r.code };
};

const named = (out, needle) => out.split("\n").filter((l) => l.includes("FAIL") && l.includes(needle));

/* ------------------------------------------------------------------ THE ARMS */

const ARMS = [
  {
    id: "baseline",
    file: null,
    declares:
      "NOTHING ARMED. `tally-through-pipe` green at 13/0 and `hygiene` green. It is not\n" +
      "     decoration: it is what distinguishes three-arms-working from a harness that\n" +
      "     breaks whatever it touches.",
    run() {
      const s = runSuite("test/tally-through-pipe.test.mjs", "tally-through-pipe");
      const h = runSuite("test/hygiene.test.mjs", "hygiene");
      const ok = s.reachedFoot && s.fail === 0 && h.reachedFoot && h.fail === 0;
      return { ok, note: `tally-through-pipe ${s.pass}/${s.fail}, hygiene ${h.pass}/${h.fail}` };
    },
  },

  {
    id: "unflush",
    file: STDIO,
    /* THE ARM THIS ITEM EXISTS FOR. It restores the pre-D-282 state at its
       source: the suites still import the module, the module still exists, and it
       simply stops making the streams synchronous — which is exactly the tree
       every battery ran on before 2026-08-10. */
    patch: (src) => {
      const anchor = "        s._handle.setBlocking(true);";
      if (!src.includes(anchor)) return null;
      return src.replace(anchor, "        /* ARMED (D-282 control, `unflush`): the pre-fix state — no flush before exit */");
    },
    declares:
      "8 pass, 5 FAIL. Arm A (`the flooding suite's tally is readable through a PIPE`)\n" +
      "     fails, arm B (byte equality) fails, and THREE of arm C's four fail — the MIDDLE,\n" +
      "     the TAIL and the byte-identity. `C. the HEAD of the diagnosis arrives` MUST STILL\n" +
      "     PASS, and that is the defect's own signature rather than a gap in the arm: the\n" +
      "     early lines survive and the TAIL is what is discarded, which is why D-282 reads as\n" +
      "     `FAILED: lines and no count` rather than as a silent suite.\n" +
      "     ARM D MUST STAY GREEN — it measures the DEFECT rather than the fix, and an arm\n" +
      "     that fell over with everything else would be telling us nothing.\n" +
      "     AND `hygiene` MUST STAY GREEN, which is a finding rather than a comfort: the\n" +
      "     census there is a SPELLING check and cannot see a neutered module, so the\n" +
      "     behavioural suite is the load-bearing half and this arm is what proves it.\n" +
      "     THIS DECLARATION WAS CORRECTED AFTER ITS FIRST RUN. It originally said all four\n" +
      "     C assertions would fail; the arm came back NOT AS DECLARED and the ARM WAS RIGHT.\n" +
      "     Recorded rather than quietly rewritten, and it is the inverse of the way D-282\n" +
      "     itself was found — there the harness was wrong, here the declaration was.",
    run() {
      const s = runSuite("test/tally-through-pipe.test.mjs", "tally-through-pipe");
      const h = runSuite("test/hygiene.test.mjs", "hygiene");
      const armA = named(s.out, "A. the flooding suite's tally is readable").length === 1;
      const armB = named(s.out, "B. the same child delivers the same byte count").length === 1;
      const headKept = named(s.out, "C. the head of the diagnosis arrives").length === 0;
      const cLost = named(s.out, "C. ").length === 3;
      const armDgreen = !s.out.split("\n").some((l) => l.includes("FAIL") && l.includes("D. "));
      const ok = s.reachedFoot && s.fail === 5 && armA && armB && headKept && cLost && armDgreen
              && h.reachedFoot && h.fail === 0;
      return {
        ok,
        note: `tally-through-pipe ${s.pass}/${s.fail} (A failed: ${armA}, B failed: ${armB}, `
            + `C failures: ${named(s.out, "C. ").length}/4 with the HEAD kept: ${headKept}, `
            + `D still green: ${armDgreen}); hygiene ${h.pass}/${h.fail}`,
      };
    },
  },

  {
    id: "overstrict",
    file: SUITE,
    /* THE OVER-STRICTNESS ARM, AND IT IS THE ARM THAT DECIDES BETWEEN THE TWO
       FIXES D-282's ROW OFFERED. The alternative was to CAP `t()`'s `got` dump.
       This arm applies that cap to the suite's own fixture — a genuinely large
       but perfectly READABLE diagnosis, truncated — and requires the suite to go
       RED for it. A fix that makes every large failure unreadable is the opposite
       defect and worse than the bug; if this arm ever passes, the guard against
       that has been removed and the choice recorded in `stdio.mjs` no longer
       holds. */
    patch: (src) => {
      const anchor = 'console.log("         got  ${MARK_HEAD}" + filler + "${MARK_MID}" + filler + "${MARK_TAIL}");';
      if (!src.includes(anchor)) return null;
      return src.replace(anchor,
        'console.log(("         got  ${MARK_HEAD}" + filler + "${MARK_MID}" + filler + "${MARK_TAIL}").slice(0, 200) + " … and 999999 more");');
    },
    declares:
      "8 pass, 4 FAIL, and the SHAPE of the four is the whole argument for the fix\n" +
      "     that was chosen. THE CAP MAKES EVERY ARM THAT MEASURES LOSS GO GREEN: arm A (the\n" +
      "     tally arrives), arm B (pipe bytes EQUAL file bytes, 312 and 312) and arm C's\n" +
      "     byte-identity all PASS, because a capped dump fits in the pipe buffer and the two\n" +
      "     captures then agree perfectly. What FAILS is the MIDDLE and the TAIL of the\n" +
      "     diagnosis — destroyed — plus the two VACUITY guards, `the fixture floods past the\n" +
      "     pipe buffer` and `the unfixed child's FILE capture is whole`, which correctly\n" +
      "     report that the suite's own subject has been capped out of existence.\n" +
      "     THAT IS WHY D-282 WAS NOT CLOSED BY CAPPING `t()`'s `got` DUMP: the cap is the\n" +
      "     fix that would have looked green while the diagnosis was gone, and a fix that\n" +
      "     makes every large failure unreadable is the opposite defect.\n" +
      "     THIS DECLARATION WAS ALSO CORRECTED AFTER ITS FIRST RUN — it said arm B would\n" +
      "     fail. It does not, and could not: capping changes what the child SAYS, not what\n" +
      "     the pipe delivers. The arm was right and the declaration was wrong.",
    run() {
      const s = runSuite("test/tally-through-pipe.test.mjs", "tally-through-pipe");
      const armApass = named(s.out, "A. the flooding suite's tally is readable").length === 0;
      const armBpass = named(s.out, "B. the same child delivers the same byte count").length === 0;
      const identityPass = named(s.out, "C. and the pipe capture is byte-identical").length === 0;
      const mid = named(s.out, "C. the MIDDLE of the diagnosis arrives").length === 1;
      const tail = named(s.out, "C. the tail of the diagnosis arrives").length === 1;
      const vacuity = named(s.out, "the fixture floods past the pipe buffer").length === 1
                   && named(s.out, "D. the unfixed child's FILE capture is whole").length === 1;
      const ok = s.reachedFoot && s.fail === 4 && armApass && armBpass && identityPass && mid && tail && vacuity;
      return {
        ok,
        note: `tally-through-pipe ${s.pass}/${s.fail} (loss arms all still GREEN — A: ${armApass}, `
            + `B: ${armBpass}, byte-identity: ${identityPass}; diagnosis destroyed — MIDDLE lost: ${mid}, `
            + `TAIL lost: ${tail}; vacuity guards fired: ${vacuity})`,
      };
    },
  },

  {
    id: "d93",
    file: null,
    /* D-93's ORIGINAL SHAPE, RE-RUN. Two suites are planted: one dies mid-run
       with NO tally line at all, and one that runs to completion AFTER it. D-93
       is both halves — a suite whose count cannot be read must be reported as
       unreadable rather than as zero or as green, and a suite that dies must not
       hide the state of every suite behind it (`npm test` used to chain with
       `&&`). It must be GREEN both before and after this item, which is what
       makes D-93 and D-282 two defects rather than one thing measured twice.

       IT PLANTS INTO `test/` AND SAYS SO. The runner discovers by directory, and
       M0-15's provenance line will correctly report the planted files as not in
       the commit at HEAD. That is the instrument being right, not the arm being
       sloppy, and both files are removed in the `finally` below. */
    plant: true,
    declares:
      "the runner reports the tally-less crashing suite as FAILED with `assertions\n" +
      "     unknown`, names it under `reported no assertion count`, NEVER counts it as zero\n" +
      "     assertions passing and never as green — and the suite planted AFTER it still\n" +
      "     RUNS and reports its own count. Independent of D-282: green before and after.",
    run() {
      const crash = join(DIR, "zz-d93probe-crash.test.mjs");
      const after = join(DIR, "zz-d93probe-after.test.mjs");
      try {
        writeFileSync(crash,
          '/* D-93 control probe, planted and removed by test/tally-through-pipe.control.mjs. */\n' +
          'import "./stdio.mjs";\n' +
          'console.log("  PASS  something that ran before the crash");\n' +
          'throw new Error("D-93 probe: dies mid-run, prints no tally");\n');
        writeFileSync(after,
          '/* D-93 control probe, planted and removed by test/tally-through-pipe.control.mjs. */\n' +
          'import "./stdio.mjs";\n' +
          'let pass = 2, fail = 0;\n' +
          'console.log(`\\nzz-d93probe-after: ${pass} pass, ${fail} fail`);\n' +
          'process.exit(fail ? 1 : 0);\n');
        const r = runToFile([join(PLANE, "scripts", "battery.mjs"), "zz-d93probe"]);
        const crashUnknown = /FAIL\s+zz-d93probe-crash\.test\.mjs.*assertions unknown/.test(r.out);
        const namedUnknown = /reported no assertion count:.*zz-d93probe-crash\.test\.mjs/.test(r.out);
        const afterRan = /ok\s+zz-d93probe-after\.test\.mjs.*2 pass/.test(r.out);
        const notGreen = r.code !== 0;
        const ok = crashUnknown && namedUnknown && afterRan && notGreen;
        return {
          ok,
          note: `battery exit ${r.code} (crash reported unknown: ${crashUnknown}, named in summary: ${namedUnknown}, `
              + `the suite after it still ran: ${afterRan})`,
        };
      } finally {
        for (const p of [crash, after]) if (existsSync(p)) unlinkSync(p);
      }
    },
  },
];

/* --------------------------------------------------------------- THE DRIVER */

const want = process.argv.slice(2);
const chosen = want.length ? ARMS.filter((a) => want.includes(a.id)) : ARMS;
if (!chosen.length) { console.log(`no arm matched ${JSON.stringify(want)}; have: ${ARMS.map((a) => a.id).join(", ")}`); process.exit(1); }

let asDeclared = 0, notAsDeclared = 0, restoreFailures = 0;

for (const arm of chosen) {
  console.log(`\n================ ARM ${arm.id} ================`);
  console.log(`  DECLARED BEFORE RUNNING: ${arm.declares}`);

  let pristine = null, before = null;
  if (arm.file) {
    pristine = `${arm.file}.pristine-${arm.id}`;
    copyFileSync(arm.file, pristine);
    before = sha(arm.file);
    const bytes = readFileSync(pristine).length;
    if (before === EMPTY_SHA || bytes < MIN_BYTES) {
      console.log(`  RESTORE GUARD REFUSED TO ARM: pristine copy is ${bytes} bytes (floor ${MIN_BYTES}), sha ${before.slice(0, 8)}`);
      restoreFailures++;
      unlinkSync(pristine);
      continue;
    }
    const patched = arm.patch(readFileSync(arm.file, "utf8"));
    if (patched === null) {
      /* A patch that matches nothing is a FINDING. An arm that did not arm is
         the most common way a control lies. */
      console.log("  ARM DID NOT ARM: the patch anchor was not found. Reported, not skipped silently.");
      notAsDeclared++;
      unlinkSync(pristine);
      continue;
    }
    writeFileSync(arm.file, patched);
    console.log(`  armed: ${arm.file.split("/").pop()} (${before.slice(0, 8)} -> ${sha(arm.file).slice(0, 8)})`);
  }

  let result;
  try { result = arm.run(); }
  catch (e) { result = { ok: false, note: `THE ARM ITSELF THREW: ${e && e.message}` }; }

  if (arm.file) {
    copyFileSync(pristine, arm.file);
    const after = sha(arm.file);
    const bytes = readFileSync(arm.file).length;
    const identical = readFileSync(arm.file).equals(readFileSync(pristine));
    const restored = after === before && identical && bytes >= MIN_BYTES;
    console.log(`  restored: sha ${after.slice(0, 8)} ${after === before ? "EQUAL" : "DIFFERENT"}, `
      + `content ${identical ? "IDENTICAL" : "DIFFERENT"}, ${bytes} bytes (floor ${MIN_BYTES})`);
    if (!restored) restoreFailures++;
    unlinkSync(pristine);
  }

  console.log(`  OBSERVED: ${result.note}`);
  console.log(`  ${result.ok ? "AS DECLARED" : "NOT AS DECLARED"}`);
  result.ok ? asDeclared++ : notAsDeclared++;
}

console.log(`\n${asDeclared} of ${chosen.length} arm(s) behaved AS DECLARED; `
  + `${notAsDeclared} did not; ${restoreFailures} restore failure(s).`);
process.exit(notAsDeclared || restoreFailures ? 1 : 0);
