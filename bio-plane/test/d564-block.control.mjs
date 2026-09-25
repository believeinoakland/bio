/* d564-block.control.mjs — D-564's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it runs ARMED COPIES of the
 * suites D-564 and D-667 moved onto D-548's `block()` recorder, so the battery must not discover it. D-548's driver
 * (`d548-block.control.mjs`) generalised to a table of suites; its rules are kept: the real suite is never edited — each
 * arm's copy is written into a temporary mirror of the repository (its `bio-plane/test/` holds the armed copy beside
 * symlinks to every other test file; every other entry is a symlink), and the real suite is hashed before and after and
 * must be unchanged.
 *
 *   node test/d564-block.control.mjs [suite] [arm]      from bio-plane/   (D564_KEEP=1 keeps each arm's mirror and log)
 *
 * Per suite, three arms: BASELINE (every section reports its declared tally); FIXTURE — one section's fixture broken (a
 * call the plane refuses by name), so that section DIES with -1 and every other section still reports its baseline
 * tally; DISARMED — `block()` rethrows (the pre-D-564 shape: the first failure ends the run) over the same fixture, so
 * there is NO foot and no section tally, and the driver cannot read an early end as a finished run. Each anchor must
 * occur EXACTLY ONCE in the copy (an arm that did not arm is a finding). Output goes to a FILE (D-282: a pipe loses a
 * suite's tail at process.exit); tallies are read from the suite's own per-section lines and foot; a missing foot is -1.
 *
 * RUN 2026-09-25 on land/worker/D-564 (whole driver, seven suites): 21 arms, every one AS DECLARED, every real suite
 * hashed unchanged before and after; exit 0.
 *
 * D-667 (2026-09-25, WORKER D-667 (SCHEDULER #23)) — the sweep's remainder: eleven more suites join the table
 * (d448-review-copy-translation, d543-instant-precision, rec213-reviewcopy-writer, rec217-draft-binding,
 * case-edition-conclusion, case-project-conclusion, caselifecycle, caseratify-conclusion, current-shared-question,
 * d442-publish-writes-nothing, rec170-manifest-pair), eighteen in all, each with the same three arms.
 * RUN 2026-09-25 on land/worker/D-667 @ dc55ae9e (whole driver, eighteen suites): 54 arms, every one AS DECLARED,
 * every real suite hashed unchanged before and after; exit 0. A suite whose foot
 * reads `<name>.test.mjs:` rather than `<name>:` is matched as it prints (the foot pattern takes either); no foot's
 * wording was changed to suit the driver.
 * THE MATCHER'S BLIND SPOT, stated: the sweep that found these twenty-six suites (D-548's, D-564's, D-667's) matched
 * the text "FIXTURE ABORTED" and a `const bail|abort|die = …` helper reaching `process.exit`. It cannot see (i) an
 * abort under another name — a MODULE-WIDE `try { … } catch (e) { "FAIL  the suite threw" … }` that prints a foot
 * with one failure and names no section that never ran: 65 suites on this tree (measured 2026-09-25 by `git grep -l
 * "FAIL  the suite threw"` over bio-plane/test/*.test.mjs, none of them in this table); nor (ii) an INLINE top-level
 * `if (…) { …; process.exit(1) }` — casepin.test.mjs's rat1 guard is the one found. Both are D-711. Not in the class:
 * refusal-wire's corpus-floor HALT (it states that nothing below it is claimed — a deliberate closure) and
 * observation-meaning's foot guard (it prints -1, the unrun sentinel). A suite that throws with no catch at all prints
 * no foot, and the battery already reads it as a count it cannot read (RED, M0-107): not hidden, so not in the class.
 */
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, symlinkSync, readdirSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const PLANE = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const REPO = dirname(PLANE);

/* The recorder's own anchor, identical in all eighteen suites (the recorder text is shared verbatim). */
const DISARM = ["  catch (e) {\n    died = true;", "  catch (e) {\n    throw e;"];

/* Declared BEFORE running, per suite: the baseline per-section tallies measured 2026-09-25 on the D-564 tree, the one
   fixture patch, the sections that patch MUST kill, and the message each dead section MUST carry. */
const SUITES = {
  casesearched: {
    base: { "0 (setup)": [0, 0], "0": [1, 0], "1": [1, 0], "2": [5, 0], "3": [4, 0], "4": [2, 0], "5": [2, 0],
            "6": [4, 0], "7": [3, 0], "8": [4, 0] },
    fixture: ['const BEFORE = doc.text;\nawait mustPromote(CASED, infoMd(CASED), "information", {',
              'const BEFORE = doc.text;\nawait mustPromote(CASED, infoMd(CASED), "nosuchtype", {'],
    died: { "7": "(fixture) promote INFO-2026-9600-cased" } },
  /* Section 6's draft is asked for by PAT, invited and never joined, so the plane refuses it; no later section reads 6. */
  "d150-statement-acknowledgement": {
    base: { "0 (setup)": [0, 0], "0b (corpus)": [0, 0], "1": [11, 0], "2": [1, 0], "3": [6, 0], "4": [4, 0],
            "5": [8, 0], "6": [2, 0], "7": [4, 0], "8": [7, 0], "9": [9, 0], "10": [8, 0], "11": [4, 0] },
    fixture: ['op=casedraft&token=${ELLA}`, withRoles({ ...args(PROJ, "publisher")',
              'op=casedraft&token=${PAT}`, withRoles({ ...args(PROJ, "publisher")'],
    died: { "6": "(fixture) casedraft De" } },
  /* Section 4's publish targets a bundle that does not exist (NO_SUCH_BUNDLE); no later section reads 4. */
  "rec212-statement-writer": {
    base: { "0 (setup)": [0, 0], "0b (corpus)": [0, 0], "1": [5, 0], "2": [5, 0], "3": [12, 0], "4": [4, 0],
            "5": [10, 0], "5b": [4, 0], "6": [3, 0], "7": [2, 0] },
    fixture: ["targets: [OWNSTMT]", 'targets: ["INQ-2026-2120-nosuch"]'],
    died: { "4": "(fixture) publish own" } },
  /* Every fixture of this suite is section 3's, and 4 and 5 read it: the arm breaks 3's first promote, and 4 and 5 MUST
     die NAMING section 3 (never a bare TypeError) while 1, 2 and 6 report their baseline tallies. */
  "d507-statement-ack-translation": {
    base: { "1": [21, 0], "2": [23, 0], "3": [1, 0], "4": [15, 0], "5": [2, 0], "6": [1, 0] },
    fixture: ['infoMd(INFO), "information", "collected")', 'infoMd(INFO), "nosuchtype", "collected")'],
    died: { "3": "(fixture) promote info", "4": "rests on section 3, which did not produce D1, DNOSTMT, CS",
            "5": "rests on section 3, which did not produce D1" } },
  /* Section 6's SOLO inquiry is promoted under a type the plane refuses; no later section reads 6. */
  casesign: {
    base: { "0 (setup)": [0, 0], "1": [4, 0], "1b": [15, 0], "2": [12, 0], "3": [9, 0], "4": [9, 0], "5": [7, 0],
            "6": [3, 0], "7": [16, 0] },
    fixture: ['"inquiry", "open");   /* REC-136', '"nosuchtype", "open");   /* REC-136'],
    died: { "6": "(fixture) promote INQ-2026-7700-solo" } },
  /* Section 7's member comment is posted to a draft id that does not exist (NO_REVIEW_COPY); no later section reads 7.
     Section 7 passes two arms before it dies, so the foot's total is 25 and not 23 — the per-section -1 is the tally. */
  "reviewcopy-inband": {
    base: { "0 (setup)": [0, 0], "1": [4, 0], "2": [3, 0], "6a": [1, 0], "3": [2, 0], "6b": [2, 0], "4": [7, 0],
            "5": [4, 0], "7": [8, 0] },
    fixture: ['D7}&token=${IRIS}`, { text: "a member', 'D7}-BROKEN&token=${IRIS}`, { text: "a member'],
    died: { "7": "(fixture) reviewcomment (block 7, member)" } },
  /* Section 11's after-the-trip promote names a type the plane refuses (it answers SURFACE_NO_RUN first); no later
     section reads 11, and section 12 MUST still report 6/0 after it. */
  reviewcopy: {
    base: { "0 (setup)": [0, 0], "0 (corpus)": [0, 0], "1": [1, 0], "2": [12, 0], "3": [6, 0], "4": [12, 0],
            "5": [6, 0], "6": [6, 0], "7": [13, 0], "8": [7, 0], "9": [14, 0], "10": [5, 0], "11": [5, 0], "12": [6, 0] },
    fixture: ['answered?`, INFO), "inquiry", "open")', 'answered?`, INFO), "nosuchtype", "open")'],
    died: { "11": "(fixture) promote INQ-2026-1260-later-lb (after the trip)" } },
  /* D-667. Section 8's INFORMATION re-promote names a type the plane refuses (ENVELOPE_TYPE_DISAGREES); no later section
     reads 8, and 9 and 10 MUST still report 6/0. Section 8 passes one arm before it dies, so the foot's total is 66. */
  caselifecycle: {
    base: { "0 (setup)": [0, 0], "0b (findings)": [0, 0], "0c (cases)": [5, 0], "1": [5, 0], "2": [7, 0], "3": [5, 0],
            "4": [6, 0], "5": [8, 0], "6": [13, 0], "7": [4, 0], "8": [3, 0], "9": [6, 0], "10": [6, 0] },
    fixture: ['infoMd(INFO_B) + "\\n", "information", "collected"', 'infoMd(INFO_B) + "\\n", "nosuchtype", "collected"'],
    died: { "8": "(fixture) promote INFO-2026-4400-left-out" } },
  /* D-667. The fixture's acknowledgement is made with a secret no grant issued (NO_REVIEW_COPY), so "fixture" DIES, and
     3 and 2, which read that acknowledgement, MUST die NAMING it; 1 and 4 report their baseline tallies. */
  "d543-instant-precision": {
    base: { "1": [3, 0], "fixture": [0, 0], "3": [2, 0], "2": [3, 0], "4": [3, 0] },
    fixture: ['op=statementack&draft=${DRAFT}&secret=${SEC}`', 'op=statementack&draft=${DRAFT}&secret=${SEC}-BROKEN`'],
    died: { "fixture": "(fixture) statementack", "3": "rests on section fixture, which did not produce a1",
            "2": "rests on section fixture, which did not produce a1" } },
  /* D-667. Section 4's project D is made current on a reading its question does not hold (VERSION_ACT_NO_SUCH_VERSION);
     no later section reads 4, so every other section reports its baseline tally. */
  "case-project-conclusion": {
    base: { "0 (setup)": [0, 0], "1": [8, 0], "2": [4, 0], "3": [5, 0], "4": [2, 0], "5": [2, 0], "6": [4, 0] },
    fixture: ["makeCurrent(D, WD, VA.name)", 'makeCurrent(D, WD, "nosuch reading")'],
    died: { "4": "(fixture) D stands on the reading" } },
  /* D-667. Every bail of this suite is setup's or section 1's: the arm breaks 1's first make-current (no such reading),
     and 2 and 3, which read its case and pin, MUST die NAMING section 1; 4 reports its baseline tally. */
  "current-shared-question": {
    base: { "0 (setup)": [0, 0], "1": [4, 0], "2": [7, 0], "3": [5, 0], "4": [2, 0] },
    fixture: ["makeCurrent(A, Q, V1.name)", 'makeCurrent(A, Q, "nosuch reading")'],
    died: { "1": "(fixture) A stands on reading 1", "2": "rests on section 1, which did not produce CASE, PIN, pinnedText",
            "3": "rests on section 1, which did not produce CASE, PIN, pinnedText" } },
  /* D-667. Section 2's project B is made current on a reading Q does not hold (no such reading); 3, 4 and 5 read B's case
     and its document, so they MUST die NAMING section 2, while 1 reports its baseline tally. */
  "d442-publish-writes-nothing": {
    base: { "0 (setup)": [0, 0], "1": [4, 0], "2": [13, 0], "3": [4, 0], "4": [7, 0], "5": [7, 0] },
    fixture: ["makeCurrent(B, V2.name)", 'makeCurrent(B, "nosuch reading")'],
    died: { "2": "(fixture) B stands on reading 2", "3": "rests on section 2, which did not produce pubB",
            "4": "rests on section 2, which did not produce pubB, fmB",
            "5": "rests on section 2, which did not produce pubB, fmB, bodyB" } },
  /* D-667. Section 7's project P is made current on a question id that does not exist (VERSION_ACT_NO_SUCH_VERSION); no
     later section reads 7 (8 and 9 own their projects), so every other section reports its baseline tally. */
  "case-edition-conclusion": {
    base: { "0 (setup)": [0, 0], "1": [2, 0], "2": [4, 0], "3": [3, 0], "4": [8, 0], "5": [2, 0], "6": [4, 0],
            "7": [5, 0], "8": [6, 0], "9": [2, 0] },
    fixture: ["makeCurrent(P, QP, VA.name)", 'makeCurrent(P, "INQ-2026-4157-nosuch", VA.name)'],
    died: { "7": "(fixture) P stands on reading A" } },
  /* D-667. Section 3's re-publication targets a bundle that does not exist (NO_SUCH_BUNDLE); no later section reads 3
     (4 owns project U), so every other section reports its baseline tally. */
  "caseratify-conclusion": {
    base: { "0 (setup)": [0, 0], "1": [8, 0], "2": [5, 0], "3": [6, 0], "4": [2, 0] },
    fixture: ["const prep2 = await publish(A, Q);", 'const prep2 = await publish(A, "INQ-2026-4167-nosuch");'],
    died: { "3": "(fixture) A publishes again" } },
  /* D-667. Section 2's re-grade of Q0 is promoted under a type the plane refuses (ENVELOPE_TYPE_DISAGREES); section 3
     reads case Y, which 2 produces, so it MUST die NAMING section 2, while 1 reports its baseline tally. */
  "rec170-manifest-pair": {
    base: { "0 (setup)": [0, 0], "1": [2, 0], "2": [3, 0], "3": [8, 0] },
    fixture: ['q0Md("C", "2026-07-03T00:00:00Z"), "inquiry"', 'q0Md("C", "2026-07-03T00:00:00Z"), "nosuchtype"'],
    died: { "2": "(fixture) Q0 re-graded to C", "3": "rests on section 2, which did not produce CASE_Y, ED_Y, yQ, yS" } },
  /* D-667. Section 3's fixture draft names a project that does not exist (the plane answers REVIEW_NOT_PROJECT_OWNER);
     section 4 reads only the source, so 0, 1, 2 and 4 report their baseline tallies. */
  "d448-review-copy-translation": {
    base: { "0": [1, 0], "1": [36, 0], "2": [44, 0], "3": [47, 0], "4": [2, 0] },
    fixture: ['{ project: PROJ, scope: "Whether', '{ project: "PROJ-2026-1448-BROKEN", scope: "Whether'],
    died: { "3": "(fixture) casedraft fixture" } },
  /* D-667. Section 5's ED2 inquiry is promoted under a type the plane refuses (it answers SURFACE_NO_RUN first); no
     later section reads 5, and section 6 MUST still report 2/0 after it. */
  "rec213-reviewcopy-writer": {
    base: { "0 (setup)": [0, 0], "0b (corpus)": [0, 0], "1": [3, 0], "2": [6, 0], "3": [3, 0], "4": [1, 0],
            "5": [4, 0], "6": [2, 0] },
    fixture: ['recorded?`, INFO)), "inquiry", "open")', 'recorded?`, INFO)), "nosuchtype", "open")'],
    died: { "5": "(fixture) promote INQ-2026-2130-ed2" } },
  /* D-667. Section 2's acknowledgement names a draft that does not exist; no later section reads 2 (its reading is of
     the "plain" sentence alone), so 3-6 report their baseline tallies. */
  "rec217-draft-binding": {
    base: { "0 (setup)": [0, 0], "0b (corpus)": [0, 0], "1": [7, 0], "2": [1, 0], "3": [3, 0], "4": [5, 0],
            "5": [5, 0], "6": [2, 0] },
    fixture: ['ack(`draft=${D2}&token=${ELLA}`)', 'ack(`draft=${D2}-BROKEN&token=${ELLA}`)'],
    died: { "2": "(fixture) ack D2" } },
};

const armsOf = (spec) => ({
  baseline: { patches: [], want: spec.base, exit: 0, diedBecause: {} },
  fixture: { patches: [spec.fixture],
             want: { ...spec.base, ...Object.fromEntries(Object.keys(spec.died).map((s) => [s, "DIED"])) },
             exit: 1, diedBecause: spec.died },
  disarmed: { patches: [spec.fixture, DISARM],
              want: Object.fromEntries(Object.keys(spec.base).map((s) => [s, undefined])),
              exit: 1, foot: false, diedBecause: {} },
});

const [onlySuite, onlyArm] = process.argv.slice(2);
if (onlySuite && !SUITES[onlySuite]) { console.log(`no suite ${onlySuite}; suites: ${Object.keys(SUITES).join(", ")}`); process.exit(2); }

let bad = 0;
for (const [suite, spec] of Object.entries(SUITES)) {
  if (onlySuite && suite !== onlySuite) continue;
  const NAME = `${suite}.test.mjs`, SUITE = join(PLANE, "test", NAME);
  const digest = () => { const b = readFileSync(SUITE); return `${b.length} B ${createHash("sha256").update(b).digest("hex")}`; };
  const before = digest();
  console.log(`\n=== ${suite}\nreal suite before: ${before}`);
  const ARMS = armsOf(spec);
  if (onlyArm && !ARMS[onlyArm]) { console.log(`no arm ${onlyArm}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
  for (const [arm, a] of Object.entries(ARMS)) {
    if (onlyArm && arm !== onlyArm) continue;
    const root = mkdtempSync(join(tmpdir(), `d564-${suite}-${arm}-`));
    try {
      /* The WHOLE repository is mirrored: miniflare resolves `src/index.mjs`'s imports by path, and some reach outside
         bio-plane (D-548's finding). */
      const plane = join(root, "bio-plane"), test = join(plane, "test");
      mkdirSync(test, { recursive: true });
      for (const d of readdirSync(REPO)) if (d !== "bio-plane") symlinkSync(join(REPO, d), join(root, d));
      for (const d of readdirSync(PLANE)) if (d !== "test") symlinkSync(join(PLANE, d), join(plane, d));
      for (const f of readdirSync(join(PLANE, "test"))) if (f !== NAME) symlinkSync(join(PLANE, "test", f), join(test, f));
      let src = readFileSync(SUITE, "utf8"), armed = true;
      for (const [x, y] of a.patches) {
        const n = src.split(x).length - 1;
        if (n !== 1) { console.log(`ARM ${suite}/${arm}: NEVER ARMED — anchor occurs ${n} times`); armed = false; continue; }
        src = src.replace(x, y);
      }
      if (!armed) { bad++; continue; }
      writeFileSync(join(test, NAME), src);
      const out = join(root, "out.log"), fd = openSync(out, "w");
      const r = spawnSync(process.execPath, [join(test, NAME)], { cwd: plane, stdio: ["ignore", fd, fd] });
      closeSync(fd);
      const log = readFileSync(out, "utf8");
      const foot = log.match(new RegExp(`^${suite}(?:\\.test\\.mjs)?: (\\d+) pass, (\\d+) fail {2}\\[FOOT REACHED`, "m"));
      const got = {};
      for (const m of log.matchAll(/^ {2}section (.+?): (-?\d+) pass, (-?\d+) fail( {2}\[DIED\])?$/gm))
        got[m[1]] = m[4] ? "DIED" : [Number(m[2]), Number(m[3])];
      const miss = [];
      if (r.status !== a.exit) miss.push(`exit ${r.status}, declared ${a.exit}`);
      if (!foot !== (a.foot === false)) miss.push(foot ? "a FOOT was reached, declared none" : "NO FOOT (tally -1)");
      for (const [s, w] of Object.entries(a.want))
        if (JSON.stringify(got[s]) !== JSON.stringify(w)) miss.push(`section ${s}: got ${JSON.stringify(got[s] ?? -1)}, declared ${JSON.stringify(w)}`);
      for (const s of Object.keys(got)) if (!(s in a.want)) miss.push(`section ${s} reported, never declared`);
      for (const [s, why] of Object.entries(a.diedBecause))
        if (!log.includes(`FAIL  BLOCK ${s} DIED: ${why}`)) miss.push(`section ${s} did not die naming "${why}"`);
      console.log(`ARM ${suite}/${arm}: foot ${foot ? `${foot[1]} pass, ${foot[2]} fail` : "-1"}; exit ${r.status}; `
        + `sections ${JSON.stringify(got)} -> ${miss.length ? `NOT AS DECLARED: ${miss.join("; ")}` : "AS DECLARED"}`);
      if (miss.length) bad++;
    } finally { if (process.env.D564_KEEP) console.log("kept", root); else rmSync(root, { recursive: true, force: true }); }
  }
  const after = digest();
  console.log(`real suite after:  ${after} ${after === before ? "(unchanged)" : "CHANGED"}`);
  if (after !== before) bad++;
}
console.log(`\nd564-block.control: ${bad ? `${bad} NOT AS DECLARED` : "every arm AS DECLARED"}`);
process.exit(bad ? 1 : 0);
