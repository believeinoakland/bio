/* d564-block.control.mjs — D-564's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it runs ARMED COPIES of the seven
 * suites D-564 moved onto D-548's `block()` recorder, so the battery must not discover it. D-548's driver
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
 * RE-RUN 2026-09-25 at the c22-batch30 union: 6 arms NOT AS DECLARED on the first run, each a baseline main's
 * later arms had moved (rec212 section 5, casesign section 7, reviewcopy's new section 13); those three baselines were
 * re-declared from the union's print, and the three suites' nine arms re-ran AS DECLARED; the other twelve arms were
 * AS DECLARED on the first run.
 * RE-RUN 2026-09-25 at the c23-batch30 union (reviewcopy only): baseline and fixture NOT AS DECLARED on the first run,
 * each for D-618's new section 14 (4/0) alone; reviewcopy's baseline re-declared from the union's print and its three
 * arms re-ran AS DECLARED.
 */
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, symlinkSync, readdirSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const PLANE = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const REPO = dirname(PLANE);

/* The recorder's own anchor, identical in all seven suites (the recorder text is shared verbatim). */
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
            /* RE-DECLARED 2026-09-25 at the c22-batch30 union: section 5 is 11, not 10 — D-540 (on main, after this
               driver's base) added one arm there; measured by this driver's baseline on the union. */
            "5": [11, 0], "5b": [4, 0], "6": [3, 0], "7": [2, 0] },
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
            /* RE-DECLARED 2026-09-25 at the c22-batch30 union: section 7 is 18, not 16 — REC-219 (C-41.14/C-41.15, on
               main, after this driver's base) added two arms there; measured by this driver's baseline on the union. */
            "6": [3, 0], "7": [18, 0] },
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
            "5": [6, 0], "6": [6, 0], "7": [13, 0], "8": [7, 0], "9": [14, 0], "10": [5, 0], "11": [5, 0], "12": [6, 0],
            /* ADDED 2026-09-25 at the c22-batch30 union: D-568's block 13 (on main, after this driver's base) now runs
               inside block() too; 5/0, measured by this driver's baseline on the union. */
            "13": [5, 0],
            /* ADDED 2026-09-25 at the c23-batch30 union: D-618's block 14 runs inside block() at the union; 4/0,
               measured by this driver's baseline on the union (the old base, which lacked it, read it as an extra). */
            "14": [4, 0] },
    fixture: ['answered?`, INFO), "inquiry", "open")', 'answered?`, INFO), "nosuchtype", "open")'],
    died: { "11": "(fixture) promote INQ-2026-1260-later-lb (after the trip)" } },
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
      const foot = log.match(new RegExp(`^${suite}: (\\d+) pass, (\\d+) fail {2}\\[FOOT REACHED`, "m"));
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
