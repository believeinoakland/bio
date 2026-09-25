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
 *      declared, not emitted), A4, A5 (the stamp still reads the catalogue's version), A6, A7, A8.
 *  (c) ADD A CHECK AT AN UNRESOLVABLE EMISSION SITE — `f(NEW_FAMILY.THING, …)` inside `checkBundle`, the
 *      spelling a census that scored an unreadable site as zero would swallow. MUST FAIL: A2 alone. A3 MUST
 *      NOT FAIL, and that is the point of splitting them: "I cannot read this site" and "a check was added"
 *      are different facts, and collapsing them is how a sweep reports a clean result while looking in the
 *      wrong place.
 *  (d) MOVE THE VERSION AND LEAVE THE PIN — `CATALOG_VERSION` to 1.99.0 (1.98.0 if the tree already reads
 *      1.99.0), the needle READ from gate.mjs's own declaration at run time (M0-192). MUST FAIL: A3 (no census recorded
 *      for that version) and A5 (the stamp no longer reads the bumped version). MUST NOT FAIL: the rest.
 *  (e) OVER-STRICTNESS — correct work in a spelling this suite did not anticipate: C-15.1's emission site
 *      rewritten with its arguments across four lines and extra whitespace. EVERY ARM MUST STAY GREEN. This
 *      item changes what is SEEN and must change nothing that is TRUE.
 *  (f) D-450's: a changed-check entry that does not say what changed — A4 alone.
 *  (g)-(k) M0-195 (2026-09-25), the SOURCE PIN (A9): (g) a check's BODY edited with no census row — A9 ALONE;
 *      (h) the same edit under a new version declaring `changed: ["C-15.1"]` — GREEN; (i) comment-only edits to
 *      the real catalogue — GREEN; (j) a behaviour-free code edit declared `behaviour: "unchanged"` — GREEN;
 *      (k) the same check changed again at a later version, a different source — A4 GREEN. Arms (b) and (c)
 *      also fail A9 from M0-195 on: a new row and a new emission site are code edits.
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
/* M0-192: THE NEEDLE IS READ FROM gate.mjs AT RUN TIME, NEVER QUOTED. The quoted literal this replaces was wrong
   by construction, not by neglect: it pinned the value of a constant whose whole job is to MOVE on every catalogue
   change, so every bump disarmed arm (d). It sat at 1.24.0 through four bumps (1.24.0 -> 1.28.0) and would have
   thrown NOT ARMED until CONDUCT #20 hand-moved it at c20-batch25. Now the arm reads the ONE line that declares the
   constant, whatever it holds, and requires it to occur EXACTLY ONCE — zero or two is refused by name here, before
   the preflight, because a needle computed from nothing would arm nothing. */
const VERSION_LINE = /^export const CATALOG_VERSION = "([^"\n]+)";$/gm;
const versionFound = [...readFileSync(GATE, "utf8").matchAll(VERSION_LINE)];
if (versionFound.length !== 1) {
  console.error(`NOT ARMED: arm (d) needs gate.mjs to declare \`export const CATALOG_VERSION = "…";\` on ONE line; `
              + `found ${versionFound.length} in ${GATE}`);
  process.exit(4);
}
const VERSION = versionFound[0][0];
const CURRENT_VERSION = versionFound[0][1];
/* The arm's bumped value must differ from the tree's, or arm (d) is a no-op edit: "1.99.0" unless that IS current. */
const BUMPED_VERSION = CURRENT_VERSION === "1.99.0" ? "1.98.0" : "1.99.0";

const A1 = "(A1) THE CENSUS IS NON-EMPTY AND FLOORED";
const A2 = "(A2) EVERY EMISSION SITE RESOLVES";
const A3 = "(A3) THE CENSUS PIN";
const A4 = "(A4) ONE VERSION, ONE CATALOGUE";
const A5 = "(A5) THE STAMP READS THE CATALOGUE'S VERSION";
const A6a = "(A6) OVER-STRICTNESS: a check emitted in a spelling";
const A6b = "(A6) OVER-STRICTNESS: a family table under a name";
const A7 = "(A7) THE MATCHER READS CODE, NOT PROSE";
const A8 = "(A8) THE LIMIT IS PRINTED";
const A9 = "(A9) THE SOURCE PIN";
const A10 = "(A10) THE STRIPPED SOURCE IS NOT EMPTY";
const A11a = "(A11) OVER-STRICTNESS FOR A9";
const A11b = "(A11) …and a code edit";

const ALL = [A1, A2, A3, A4, A5, A6a, A6b, A7, A8, A9, A10, A11a, A11b];

/* M0-195: arm (h) needs the source digest of the EDITED catalogue, which cannot be written down in advance — so,
   as the pin's own instructions say, it is read from THE SUITE'S OWN PRINT on the armed tree, never computed here. */
const printedSource = () => {
  try {
    execFileSync("/bin/sh", ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
      { cwd: ROOT, stdio: "ignore" });
  } catch { /* A9 red is expected here */ }
  const m = /SOURCE: .* sha256 ([a-f0-9]{64})/.exec(existsSync(LOG) ? readFileSync(LOG, "utf8") : "");
  if (!m) throw new Error("NOT ARMED: the suite printed no SOURCE digest");
  return m[1];
};
const CENSUS_HEAD = "const CATALOG_CENSUS = {\n";
const A5_PIN = `["plane-gate/1.0 (bio-checks ${CURRENT_VERSION})", "${CURRENT_VERSION}"]`;
/* The edited lines are written OUT, never derived with a string replace: the M0-25 anchor witness reads a
   `.replace(` argument in a driver as an arm anchor, and 'error' occurs in the catalogue many times. */
const EMIT_C151_WARNING = "    findings.push(f('C-15.1', 'warning', 'every Problem, in every disposition including dismissed, carries at least one recheck trigger', ['author a trigger, dual-audience shape, dated when time-bound']));";
const EMIT_C151_COMMENTED = "    // M0-195 arm (i): a comment on its own line\n"
  + "    findings.push( /* M0-195 arm (i):\n       a block comment across lines */ f('C-15.1', 'error', 'every Problem, in every disposition including dismissed, carries at least one recheck trigger', ['author a trigger, dual-audience shape, dated when time-bound'])); // and a trailing one";
const BODY_EDIT = () => edit(CATALOG, EMIT_C151, EMIT_C151_WARNING);
const except = (...xs) => ALL.filter((x) => !xs.includes(x));

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes four-arms-working from four-arms-broken",
              apply: () => {}, mustFail: [], mustNotFail: ALL, expectGreen: true },
  b: { files: [CATALOG], label: "(B) ADD A CHECK WITHOUT MOVING THE VERSION — the row's own control: C-73.99 joins GOVERNING_LAW_CHECKS",
       apply: () => edit(CATALOG, FAMILY_HEAD,
         FAMILY_HEAD + "  ARM_D470_ADDED: { check: 'C-73.99', where: 'nowhere — a control arm', translation: 'x' },\n"),
       mustFail: [A3, A9], mustNotFail: except(A3, A9) },
  c: { files: [CATALOG], label: "(C) ADD A CHECK AT AN UNRESOLVABLE EMISSION SITE — f(NEW_FAMILY.THING, …)",
       apply: () => edit(CATALOG, EMIT_C151,
         EMIT_C151 + "\n    if (false) findings.push(f(NEW_FAMILY.THING, 'error', 'a control arm the census cannot read'));"),
       mustFail: [A2, A9], mustNotFail: except(A2, A9) },
  d: { files: [GATE], label: `(D) MOVE THE VERSION AND LEAVE THE PIN — CATALOG_VERSION ${CURRENT_VERSION} -> ${BUMPED_VERSION}`,
       apply: () => edit(GATE, VERSION, `export const CATALOG_VERSION = "${BUMPED_VERSION}";`),
       mustFail: [A3, A5], mustNotFail: except(A3, A5) },
  e: { files: [CATALOG], label: "(E) OVER-STRICTNESS — C-15.1's emission site rewritten across lines; every arm must stay GREEN",
       apply: () => edit(CATALOG, EMIT_C151,
         "    findings.push(f(\n      'C-15.1',\n      'error',\n      'every Problem, in every disposition including dismissed, carries at least one recheck trigger',\n      ['author a trigger, dual-audience shape, dated when time-bound']\n    ));"),
       mustFail: [], mustNotFail: ALL, expectGreen: true },
  /* D-450 (2026-09-25): A4 keys on census + `changed`. Strip `changed` from 1.29.0, whose census is 1.28.0's
     (a CHANGED check, nothing added) — the entry is then indistinguishable from 1.28.0 and A4 must name it.
     RE-POINTED at c21-batch28 (CONDUCT #21), not exempted: at the union D-450's change rides 1.30.0 with 36
     arrivals, so no recorded entry is a changed-only successor any more and stripping `changed` alone collided
     with nothing (the arm read 9/0, NOT AS DECLARED). The arm now PLANTS the shape it was written for — a
     changed-only successor "1.30.1" carrying 1.30.0's census — and strips `changed` from 1.30.0, so the two
     entries are indistinguishable exactly as 1.28.0/1.29.0 were on D-450's branch, and A4 must name it. */
  /* RE-ANCHORED by M0-195, not exempted: 1.30.0's entry now carries `source` on the line after `changed`, so the
     old anchor (`changed` closing the entry) no longer existed. The arm is the same: strip `changed`, plant a
     changed-only successor with 1.30.0's census. */
  f: { files: [SUITE], label: "(F) A CHANGED-CHECK ENTRY THAT DOES NOT SAY WHAT CHANGED — `changed` dropped beside a planted changed-only successor",
       apply: () => { edit(SUITE, '              changed: ["C-41.12"],\n', "");
         edit(SUITE, CENSUS_HEAD, CENSUS_HEAD + '  "1.30.1": { count: 502, digest: "b55afdc7fb1fbce736a34f447d2df960032900e099a15a8efe02e027d9f17d8f" },\n'); },
       mustFail: [A4], mustNotFail: except(A4) },
  /* M0-195 (2026-09-25) — rule 17's backstop, a CHANGED check. */
  g: { files: [CATALOG], label: "(G) EDIT A CHECK'S BODY WITH NO CENSUS ROW — the row's own control: C-15.1 'error' -> 'warning', no id moved",
       apply: BODY_EDIT, mustFail: [A9], mustNotFail: except(A9) },
  h: { files: [CATALOG, GATE, SUITE], label: `(H) ACCEPTS-WHEN — the same body edit under a NEW version ${BUMPED_VERSION} whose row declares changed: ["C-15.1"]`,
       apply: () => {
         BODY_EDIT();
         const source = DRY ? "0".repeat(64) : printedSource();
         edit(GATE, VERSION, `export const CATALOG_VERSION = "${BUMPED_VERSION}";`);
         edit(SUITE, A5_PIN, `["plane-gate/1.0 (bio-checks ${BUMPED_VERSION})", "${BUMPED_VERSION}"]`);
         edit(SUITE, CENSUS_HEAD, CENSUS_HEAD + `  "${BUMPED_VERSION}": { count: 502, digest: "b55afdc7fb1fbce736a34f447d2df960032900e099a15a8efe02e027d9f17d8f", changed: ["C-15.1"], source: "${source}" },\n`);
       },
       mustFail: [], mustNotFail: ALL, expectGreen: true },
  i: { files: [CATALOG], label: "(I) OVER-STRICTNESS — COMMENT-ONLY edits to the real catalogue: a line comment above C-15.1, a trailing one, a block across lines",
       apply: () => edit(CATALOG, EMIT_C151, EMIT_C151_COMMENTED),
       mustFail: [], mustNotFail: ALL, expectGreen: true },
  j: { files: [CATALOG, SUITE], label: "(J) A CODE EDIT DECLARED `behaviour: \"unchanged\"` under the same version — `void 0;` before C-15.1, the print's digest declared",
       apply: () => {
         edit(CATALOG, EMIT_C151, "    void 0;\n" + EMIT_C151);
         const source = DRY ? "0".repeat(64) : printedSource();
         edit(SUITE, '              changed: ["C-41.12"],\n',
           `              changed: ["C-41.12"],\n              unchanged: [{ source: "${source}", behaviour: "unchanged", by: "M0-195 arm (j)" }],\n`);
       },
       mustFail: [], mustNotFail: ALL, expectGreen: true },
  k: { files: [SUITE], label: "(K) OVER-STRICTNESS FOR A4 — the same check changed AGAIN at a later version, nothing added: a distinct source is a distinct catalogue",
       apply: () => edit(SUITE, CENSUS_HEAD, CENSUS_HEAD + '  "1.30.1": { count: 502, digest: "b55afdc7fb1fbce736a34f447d2df960032900e099a15a8efe02e027d9f17d8f", changed: ["C-41.12"], source: "' + "1".repeat(64) + '" },\n'),
       mustFail: [], mustNotFail: ALL, expectGreen: true },
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

/* MEASURED 2026-09-24 by the M0-192 worker (cloud clone, branch `land/worker/M0-192`, base origin/main 9f8b69e6,
   CATALOG_VERSION 1.28.0; gate.mjs 15,779 B, 492fe85ed26fcc1e…). THE NEEDLE IS NOW READ, NOT QUOTED:
     tree as-is, every arm          baseline 9/0 · (b) 8/1 A3 · (c) 8/1 A2 · (d) 7/2 A3+A5 · (e) 9/0 — all AS DECLARED
     ACCEPTS-WHEN: gate.mjs's constant hand-bumped to 1.29.0, `d` alone
                                    arm (d) ARMED (1.29.0 to 1.99.0), 7/2, A3 and A5 by name, AS DECLARED, exit 0
     NEGATIVE CONTROL: the pre-M0-192 driver (literal needle "1.28.0") restored, constant at 1.29.0, `d` alone
                                    exit 1, refused BY NAME before anything armed: `ARM PREFLIGHT d  <<< occurs 0 times
                                    (want 1) in …/src/gate.mjs` / `ARM PREFLIGHT FAILED … d:0` — the NOT ARMED the row
                                    names, which the fixed driver no longer produces on a bump
     THE FIX'S OWN REFUSAL: the declaration respaced (`CATALOG_VERSION="1.28.0";`), `d` alone
                                    exit 4, `NOT ARMED: arm (d) needs gate.mjs to declare … found 0` — a reformatted
                                    declaration is refused loudly, never read as a silent no-op
   Every edit to gate.mjs and to this file restored from a scratchpad copy and verified sha256 OK and cmp SAME. */

/* MEASURED 2026-09-25 by the M0-195 worker (cloud clone, branch `land/worker/M0-195`, base origin/main 5e8a65a8,
   CATALOG_VERSION 1.30.0, esbuild 0.25.12). 15 anchors over 10 arms, every one LIVE at the preflight; every label
   fragment present in the suite; every restore sha256 MATCH, content IDENTICAL and cmp SAME — bio-checks.mjs
   1,006,173 B, gate.mjs 24,856 B, the suite 50,959 B (at the run, before its record was written). Driver exit 0.
     baseline 13/0 · (b) 11/2 A3+A9 · (c) 11/2 A2+A9 · (d) 11/2 A3+A5 · (e) 13/0 · (f) 12/1 A4
     (g) 12/1 A9 ALONE — THE ROW'S CONTROL: a body edit A3 cannot see, named by A9
     (h) 13/0 — ACCEPTS-WHEN: the edit under 1.99.0 with changed: ["C-15.1"] and the printed source
     (i) 13/0 — comment-only edits to the real catalogue move nothing
     (j) 13/0 — `behaviour: "unchanged"` against the printed digest is honoured
     (k) 13/0 — a second change to C-41.12 at a new source is not a collision
   11 OF 11 AS DECLARED. */
