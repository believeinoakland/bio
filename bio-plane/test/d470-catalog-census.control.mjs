/* D-470's NEGATIVE CONTROL DRIVER — four arms plus a baseline, re-runnable in one step from `bio-plane/`.
 *
 *     node test/d470-catalog-census.control.mjs        # every arm, in order
 *     node test/d470-catalog-census.control.mjs b      # one arm
 *
 * Built on `rec170-manifest-pair.control.mjs`, whose rules it keeps: DELIBERATELY NOT A `.test.mjs`, because
 * it EDITS A REAL SOURCE. Pristine copies live INSIDE THIS WORKTREE (`bio-plane/.nc-d470/`, given its own
 * `.gitignore` line — there is no blanket `.nc-*` rule in this repository, and checking rather than
 * assuming one is what keeps a failed restore's pristine copies out of a commit), uniquely named per arm; every restore is verified by sha256, by content AND by `cmp`, with
 * the byte count printed and floored; the suite's output goes to a FILE, never a pipe. Each arm is armed
 * ALONE with the others held open. A missing tally is -1, never 0. Every arm DECLARES which assertions must
 * fail and which must not, as fragments of the suite's own labels, and the run is checked as a TOTAL.
 *
 * THE ARMS (declared 2026-09-24 by the D-470 worker, before the first run):
 *  (a) BASELINE — nothing armed. Every arm GREEN; the row that distinguishes four-arms-working from
 *      four-arms-broken.
 *  (b) ADD A CHECK WITHOUT MOVING THE VERSION — THE ROW'S OWN NAMED CONTROL, and the shape of the defect
 *      itself: one new row (`C-73.99`) in `GOVERNING_LAW_CHECKS`, the catalog moved, the stamp not.
 *      MUST FAIL: A3, the census pin, alone. MUST NOT FAIL: A1 (the census only grew), A2 (the new row is
 *      declared, not emitted), A4, A5 (the stamp still reads the catalogue's version, 1.24.0 since D-507), A6, A7, A8.
 *  (c) ADD A CHECK AT AN UNRESOLVABLE EMISSION SITE — `f(NEW_FAMILY.THING, …)` inside `checkBundle`, the
 *      spelling a census that scored an unreadable site as zero would swallow. MUST FAIL: A2 alone. A3 MUST
 *      NOT FAIL, and that is the point of splitting them: "I cannot read this site" and "a check was added"
 *      are different facts, and collapsing them is how a sweep reports a clean result while looking in the
 *      wrong place.
 *  (d) MOVE THE VERSION AND LEAVE THE PIN — `CATALOG_VERSION` to 1.99.0. MUST FAIL: A3 (no census recorded
 *      for that version) and A5 (the stamp no longer reads the bumped version). MUST NOT FAIL: the rest.
 *  (e) OVER-STRICTNESS — correct work in a spelling this suite did not anticipate: C-15.1's emission site
 *      rewritten with its arguments across four lines and extra whitespace. EVERY ARM MUST STAY GREEN. This
 *      item changes what is SEEN and must change nothing that is TRUE.
 *
 * MEASURED figures are at the foot of this file.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { preflight } from "../scripts/armdecay.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-d470");
const CATALOG = join(ROOT, "checks", "bio-checks.mjs");
const GATE = join(ROOT, "src", "gate.mjs");
const SUITE = join(DIR, "d470-catalog-census.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

let DRY = null;
const edit = (file, needle, replacement) => {
  if (DRY) { DRY.push({ file, needle }); return; }
  /* BYTE-WISE: the catalog is large and CLAUDE.md §7 warns that a source in this tree can carry a stray byte. */
  const src = readFileSync(file);
  const nb = Buffer.from(needle, "utf8");
  const first = src.indexOf(nb);
  const n = first < 0 ? 0 : (src.indexOf(nb, first + 1) < 0 ? 1 : 2);
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, Buffer.concat([src.subarray(0, first), Buffer.from(replacement, "utf8"),
                                     src.subarray(first + nb.length)]));
};

const FAMILY_HEAD = "export const GOVERNING_LAW_CHECKS = {\n";
const EMIT_C151 = "    findings.push(f('C-15.1', 'error', 'every Problem, in every disposition including dismissed, carries at least one recheck trigger', ['author a trigger, dual-audience shape, dated when time-bound']));";
const VERSION = 'export const CATALOG_VERSION = "1.29.0";'; /* D-450 (2026-09-25): 1.28.0 -> 1.29.0, C-41.12 changed. */ /* CONDUCT #20 at c20-batch25: moved to the UNION's constant 1.28.0 — the needle must match the tree it arms; c20-batch22/23/25 moved the constant 1.24.0 -> 1.25.0 -> 1.26.0 -> 1.27.0 -> 1.28.0 and this needle was left at 1.24.0 (it would have thrown NOT ARMED). Branch histories: D-507 and c20-batch14 (ours), D-510 1.23.0 -> 1.24.0 for C-86.1 (theirs). */

const A1 = "(A1) THE CENSUS IS NON-EMPTY AND FLOORED";
const A2 = "(A2) EVERY EMISSION SITE RESOLVES";
const A3 = "(A3) THE CENSUS PIN";
const A4 = "(A4) ONE VERSION, ONE CATALOGUE";
const A5 = "(A5) THE STAMP READS THE CATALOGUE'S VERSION";
const A6a = "(A6) OVER-STRICTNESS: a check emitted in a spelling";
const A6b = "(A6) OVER-STRICTNESS: a family table under a name";
const A7 = "(A7) THE MATCHER READS CODE, NOT PROSE";
const A8 = "(A8) THE LIMIT IS PRINTED";

const ALL = [A1, A2, A3, A4, A5, A6a, A6b, A7, A8];
const except = (...xs) => ALL.filter((x) => !xs.includes(x));

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes four-arms-working from four-arms-broken",
              apply: () => {}, mustFail: [], mustNotFail: ALL, expectGreen: true },
  b: { files: [CATALOG], label: "(B) ADD A CHECK WITHOUT MOVING THE VERSION — the row's own control: C-73.99 joins GOVERNING_LAW_CHECKS",
       apply: () => edit(CATALOG, FAMILY_HEAD,
         FAMILY_HEAD + "  ARM_D470_ADDED: { check: 'C-73.99', where: 'nowhere — a control arm', translation: 'x' },\n"),
       mustFail: [A3], mustNotFail: except(A3) },
  c: { files: [CATALOG], label: "(C) ADD A CHECK AT AN UNRESOLVABLE EMISSION SITE — f(NEW_FAMILY.THING, …)",
       apply: () => edit(CATALOG, EMIT_C151,
         EMIT_C151 + "\n    if (false) findings.push(f(NEW_FAMILY.THING, 'error', 'a control arm the census cannot read'));"),
       mustFail: [A2], mustNotFail: except(A2) },
  d: { files: [GATE], label: "(D) MOVE THE VERSION AND LEAVE THE PIN — CATALOG_VERSION to 1.99.0",
       apply: () => edit(GATE, VERSION, 'export const CATALOG_VERSION = "1.99.0";'),
       mustFail: [A3, A5], mustNotFail: except(A3, A5) },
  e: { files: [CATALOG], label: "(E) OVER-STRICTNESS — C-15.1's emission site rewritten across lines; every arm must stay GREEN",
       apply: () => edit(CATALOG, EMIT_C151,
         "    findings.push(f(\n      'C-15.1',\n      'error',\n      'every Problem, in every disposition including dismissed, carries at least one recheck trigger',\n      ['author a trigger, dual-audience shape, dated when time-bound']\n    ));"),
       mustFail: [], mustNotFail: ALL, expectGreen: true },
  /* D-450 (2026-09-25): A4 keys on census + `changed`. Strip `changed` from 1.29.0, whose census is 1.28.0's
     (a CHANGED check, nothing added) — the entry is then indistinguishable from 1.28.0 and A4 must name it. */
  f: { files: [SUITE], label: "(F) A CHANGED-CHECK ENTRY THAT DOES NOT SAY WHAT CHANGED — `changed` dropped from 1.29.0",
       apply: () => edit(SUITE, '              changed: ["C-41.12"] },', '              },'),
       mustFail: [A4], mustNotFail: except(A4) },
};

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

const preflightArms = [];
for (const name of Object.keys(ARMS)) {
  DRY = [];
  try { ARMS[name].apply(); } catch (e) { console.log(`  (arm ${name} could not be dry-run: ${e.message})`); }
  preflightArms.push({ id: name, anchors: DRY });
  DRY = null;
}
preflight("d470-catalog-census.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

{
  const suiteSrc = readFileSync(SUITE, "utf8");
  const dead = [...new Set(Object.values(ARMS).flatMap((a) => [...a.mustFail, ...a.mustNotFail]))]
    .filter((f) => !suiteSrc.includes(f.trim()));
  if (dead.length) {
    console.log(`\nDECLARATION REFERS TO ${dead.length} LABEL(S) THE SUITE DOES NOT CONTAIN — refusing to arm:`);
    for (const f of dead) console.log(`  - ${f}`);
    process.exit(4);
  }
}

mkdirSync(PEN, { recursive: true });
const results = [];

for (const name of order) {
  const arm = ARMS[name];
  const snaps = arm.files.map((f) => {
    const buf = readFileSync(f);
    if (buf.length < FLOOR) throw new Error(`refusing to snapshot a suspiciously small ${f}: ${buf.length} bytes`);
    const copy = join(PEN, `${name}--${f.split("/").pop()}.pristine`);
    writeFileSync(copy, buf);
    return { file: f, copy, bytes: buf.length, sha: sha(buf) };
  });
  console.log(`\n=== ARM ${name} ===\n${arm.label}`);
  for (const s of snaps) console.log(`  pristine ${s.file.split("/").pop()}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 16)}…`);

  let tally = "(not run)", counted = -1, verdict = "NOT RUN";
  try {
    arm.apply();
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    const m = /d470-catalog-census\.test\.mjs: (\d+) pass, (\d+) fail/.exec(out);
    counted = m ? Number(m[2]) : -1;
    tally = m ? m[0] : "(NO TALLY — the suite died before its own summary; counted as -1)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((f) => f[1]);
    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f.slice(0, 130)}`);
    const hits = (frag) => failed.some((f) => f.startsWith(frag));
    const missing = arm.mustFail.filter((f) => !hits(f));
    const wrongly = arm.mustNotFail.filter((f) => hits(f));
    const undeclared = failed.filter((f) => !arm.mustFail.some((k) => f.startsWith(k)));
    if (!m) verdict = "NOT AS DECLARED (no tally)";
    else if (missing.length || wrongly.length || undeclared.length) verdict = "NOT AS DECLARED";
    else if (!arm.expectGreen && counted === 0) verdict = "NOT AS DECLARED (stayed green)";
    else verdict = "AS DECLARED";
    for (const f of missing) console.log(`    DECLARED TO FAIL, DID NOT: ${f}`);
    for (const f of wrongly) console.log(`    DECLARED NOT TO FAIL, DID: ${f}`);
    for (const f of undeclared) console.log(`    FAILED, AND NO DECLARATION NAMED IT: ${f.slice(0, 110)}`);
    console.log(`  ${verdict}  (declared to fail: ${arm.mustFail.length})`);
    results.push({ arm: name, tally, failed: counted, verdict });
  } finally {
    for (const s of snaps) {
      writeFileSync(s.file, readFileSync(s.copy));
      const now = readFileSync(s.file);
      const okSha = sha(now) === s.sha;
      const okBytes = now.length === s.bytes && now.length >= FLOOR;
      const okContent = now.equals(readFileSync(s.copy));
      let okCmp = true;
      try { execFileSync("cmp", ["-s", s.file, s.copy]); } catch { okCmp = false; }
      console.log(`  restored ${s.file.split("/").pop()}  ${now.length} bytes  sha256 ${okSha ? "MATCH" : "MISMATCH"}  `
                + `content ${okContent ? "IDENTICAL" : "DIFFERS"}  cmp ${okCmp ? "SAME" : "DIFFERS"}  size ${okBytes ? "ok" : "WRONG"}`);
      if (!(okSha && okBytes && okContent && okCmp)) {
        console.error(`RESTORE FAILED for ${s.file}. The pristine copy is at ${s.copy} and is NOT being deleted.`);
        process.exit(3);
      }
    }
  }
}

console.log("\n=== SUMMARY ===");
for (const r of results) console.log(`  ${r.arm.padEnd(9)} ${r.tally}   (${r.failed} failing)   ${r.verdict}`);
rmSync(PEN, { recursive: true, force: true });
console.log(`\npen removed: ${PEN}`);
process.exit(results.every((r) => r.verdict === "AS DECLARED") ? 0 : 1);

/* MEASURED 2026-09-24 by the D-470 worker (`node test/d470-catalog-census.control.mjs` from `bio-plane/`,
   branch `land/worker/D-470`, base origin/main 548eb2c5). Every anchor LIVE at the preflight (4 anchors over
   4 arms); every label fragment present in the suite; every restore sha256 MATCH, content IDENTICAL and cmp
   SAME — bio-checks.mjs 908,493 B (47f2541bd144131e…), gate.mjs 9,348 B (22ab12b40d817a0b…).

     baseline  9 pass, 0 fail   AS DECLARED
     (b)       8 pass, 1 fail   AS DECLARED  the row's own: a check added, the stamp unmoved — A3 ALONE, and the
                                             failure prints the measured census beside the recorded one and the
                                             line to record after the bump
     (c)       8 pass, 1 fail   AS DECLARED  an unreadable emission site — A2 ALONE; A3 stayed GREEN, which is the
                                             split the arm exists to prove: "I cannot read this" is not "a check
                                             was added", and a census that scored the site zero would have said
                                             neither
     (d)       7 pass, 2 fail   AS DECLARED  the version moved with no census recorded — A3 and A5
     (e)       9 pass, 0 fail   AS DECLARED  over-strictness: C-15.1's emission across four lines, green

   NOTHING CAME BACK OTHER THAN AS DECLARED, which is itself worth reading with suspicion rather than relief —
   so the baseline row is above, and arm (c) was written specifically to try to make the pin lie in the
   direction a census usually lies (silence over an unreadable site) rather than the direction it is aimed at. */
