/* d548-block.control.mjs — D-548's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it runs ARMED COPIES of
 * `test/d84-case-manifest.test.mjs`, so the battery must not discover it. The real suite is never edited: each arm's
 * copy is written into a temporary mirror of the repository (its `bio-plane/test/` holds the armed copy beside
 * symlinks to every other test file; every other entry is a symlink), and the real suite is hashed before and after and must
 * be unchanged.
 *
 *   node test/d548-block.control.mjs [arm]      from bio-plane/   (D548_KEEP=1 keeps each arm's mirror and log)
 *
 * The subject is the SUITE's recorder, not the plane, so the arms break a section's FIXTURE — a promote the plane
 * refuses by name (ENVELOPE_TYPE_DISAGREES) — and read what the rest of the run still reports. Each anchor must occur
 * EXACTLY ONCE in the copy (an arm that did not arm is a finding). Output goes to a FILE (D-282: a pipe loses a
 * suite's tail at process.exit); the tallies are read from the suite's own per-section lines and foot, and a
 * missing foot reads -1.
 */
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, symlinkSync, readdirSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const PLANE = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const REPO = dirname(PLANE);
const NAME = "d84-case-manifest.test.mjs";
const SUITE = join(PLANE, "test", NAME);
const digest = () => { const b = readFileSync(SUITE); return `${b.length} B ${createHash("sha256").update(b).digest("hex")}`; };

const S4_DRAFT = 'biasMd(BQ, "draft", "q1", TXT_Q1), "bias", "draft")';
const S2_PROJECT = 'await promote(IRIS, BP, biasMd(BP, st, "p1", TXT_P1), "bias", st);';

/* Declared BEFORE running: per section, a tally [pass, fail] or "DIED"; `diedBecause` names the message each DIED
   section must carry. Baseline figures are the suite's measured 2026-09-24 tallies (35 pass). */
const BASE = { "0 (setup)": [0, 0], "1": [5, 0], "2": [7, 0], "3": [5, 0], "4": [8, 0], "5": [10, 0] };
const ARMS = {
  baseline: { patches: [], want: BASE, exit: 0, diedBecause: {} },
  /* THE ROW'S CONTROL: break ONE section's fixture. Section 4 is the one no later section reads, so every other
     section MUST report its baseline tally and section 4 MUST read DIED, by name, with -1. */
  "s4-fixture": {
    patches: [[S4_DRAFT, 'biasMd(BQ, "draft", "q1", TXT_Q1), "nosuchtype", "draft")']],
    want: { ...BASE, "4": "DIED" }, exit: 1,
    diedBecause: { "4": "(fixture) promote BIAS-2026-8400-amended -> draft" } },
  /* A section OTHERS REST ON: section 2's fixture broken. 3 and 5 read its case, so they MUST die NAMING the section
     they rest on (never a bare TypeError); 1 and 4 MUST still report their baseline tallies. */
  "s2-fixture": {
    patches: [[S2_PROJECT, 'await promote(IRIS, BP, biasMd(BP, st, "p1", TXT_P1), "nosuchtype", st);']],
    want: { ...BASE, "2": "DIED", "3": "DIED", "5": "DIED" }, exit: 1,
    diedBecause: { "2": "(fixture) promote BIAS-2026-8400-project -> draft",
                   "3": "rests on section 1 and 2", "5": "rests on section 1, 2 and 3" } },
  /* THE SUBJECT DISARMED: the recorder rethrows (the pre-D-548 shape: the first failure ends the run) over the
     s4 fixture. It MUST reach NO foot, sections 4 and 5 MUST report nothing (-1), and 0-3 MUST still have printed
     nothing either, since the tallies print only at the foot — so this arm proves the driver cannot read a run that
     ended early as one that finished. */
  "recorder-disarmed": {
    patches: [[S4_DRAFT, 'biasMd(BQ, "draft", "q1", TXT_Q1), "nosuchtype", "draft")'],
              ["  catch (e) {\n    died = true;", "  catch (e) {\n    throw e;"]],
    want: { "0 (setup)": undefined, "1": undefined, "2": undefined, "3": undefined, "4": undefined, "5": undefined },
    exit: 1, foot: false, diedBecause: {} },
};

const before = digest();
console.log(`real suite before: ${before}`);
const only = process.argv[2];
if (only && !ARMS[only]) { console.log(`no arm ${only}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let bad = 0;
for (const [arm, spec] of Object.entries(ARMS)) {
  if (only && arm !== only) continue;
  const root = mkdtempSync(join(tmpdir(), `d548-${arm}-`));
  try {
    /* The WHOLE repository is mirrored, not bio-plane alone: miniflare resolves `src/index.mjs`'s imports by
       path, and some reach outside bio-plane (`../../docprofile/`) — a mirror of three directories died at setup. */
    const plane = join(root, "bio-plane"), test = join(plane, "test");
    mkdirSync(test, { recursive: true });
    for (const d of readdirSync(REPO)) if (d !== "bio-plane") symlinkSync(join(REPO, d), join(root, d));
    for (const d of readdirSync(PLANE)) if (d !== "test") symlinkSync(join(PLANE, d), join(plane, d));
    for (const f of readdirSync(join(PLANE, "test"))) if (f !== NAME) symlinkSync(join(PLANE, "test", f), join(test, f));
    let src = readFileSync(SUITE, "utf8");
    for (const [a, b] of spec.patches) {
      const n = src.split(a).length - 1;
      if (n !== 1) { console.log(`ARM ${arm}: NEVER ARMED — anchor occurs ${n} times`); bad++; continue; }
      src = src.replace(a, b);
    }
    writeFileSync(join(test, NAME), src);
    const out = join(root, "out.log"), fd = openSync(out, "w");
    const r = spawnSync(process.execPath, [join(test, NAME)], { cwd: plane, stdio: ["ignore", fd, fd] });
    closeSync(fd);
    const log = readFileSync(out, "utf8");
    const foot = log.match(/^d84-case-manifest: (\d+) pass, (\d+) fail {2}\[FOOT REACHED/m);
    const got = {};
    for (const m of log.matchAll(/^ {2}section (.+?): (-?\d+) pass, (-?\d+) fail( {2}\[DIED\])?$/gm))
      got[m[1]] = m[4] ? "DIED" : [Number(m[2]), Number(m[3])];
    const miss = [];
    if (r.status !== spec.exit) miss.push(`exit ${r.status}, declared ${spec.exit}`);
    if (!foot !== (spec.foot === false)) miss.push(foot ? "a FOOT was reached, declared none" : "NO FOOT (tally -1)");
    for (const [s, w] of Object.entries(spec.want))
      if (JSON.stringify(got[s]) !== JSON.stringify(w)) miss.push(`section ${s}: got ${JSON.stringify(got[s] ?? -1)}, declared ${JSON.stringify(w)}`);
    for (const [s, why] of Object.entries(spec.diedBecause))
      if (!log.includes(`FAIL  BLOCK ${s} DIED: ${why}`)) miss.push(`section ${s} did not die naming "${why}"`);
    console.log(`ARM ${arm}: foot ${foot ? `${foot[1]} pass, ${foot[2]} fail` : "-1"}; exit ${r.status}; `
      + `sections ${JSON.stringify(got)} -> ${miss.length ? `NOT AS DECLARED: ${miss.join("; ")}` : "AS DECLARED"}`);
    if (miss.length) bad++;
  } finally { if (process.env.D548_KEEP) console.log("kept", root); else rmSync(root, { recursive: true, force: true }); }
}
const after = digest();
console.log(`real suite after:  ${after} ${after === before ? "(unchanged)" : "CHANGED"}`);
process.exit(bad || after !== before ? 1 : 0);
