/* REC-96's NEGATIVE CONTROL DRIVER — four arms plus a baseline, re-runnable in
 * one step:
 *
 *     node test/casesearched.control.mjs            # every arm, in order
 *     node test/casesearched.control.mjs a          # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES, and a file the battery
 * discovers must never be one that rewrites `src/` underneath the suites running
 * beside it (`d249-port.control.mjs`'s rule).
 *
 * THE THREE RULES THIS DRIVER OBEYS, each of which this project paid for:
 *   1. PRISTINE COPIES LIVE INSIDE THIS WORKTREE, uniquely named per arm and per
 *      file — never a shared scratchpad, which a concurrent worker overwrote
 *      mid-turn (PL-10).
 *   2. EVERY RESTORE IS VERIFIED BY CONTENT AND BY sha256 with the byte count
 *      floored (UI-38 met a harness reporting a byte-identical restore over a
 *      file it had not restored).
 *   3. OUTPUT IS CAPTURED TO A FILE, NEVER A PIPE — D-282, a suite calling
 *      `process.exit()` discards unflushed pipe writes and the tally reads -1.
 *
 * WHAT THE ARMS ARE FOR, since a list of edits is not a list of questions. This
 * item's subject is a COVERAGE CLAIM IN A SIGNED DOCUMENT, so every arm asks the
 * same question from a different side: can the record be made to say it looked
 * for something it did not look for?
 *
 *   (a) is the arm this item exists for, and it is the LIE rather than a bug.
 *       Nothing is forged: the subject SET is swapped for the observation log's
 *       own subjects. Every row stays real, every state stays true, the
 *       arithmetic stays honest — and the case that never looked at its own
 *       document reads SEARCHED, because the document it never looked at is no
 *       longer in the set. This is D-196's ancestor exactly: Blair & Maron's
 *       attorneys stipulated 75% recall against a measured ~20% because what they
 *       measured was not what they claimed.
 *   (b) asks whether the ONE-SIDED coercion is load-bearing or decorative: with
 *       it gone, a caller's `never_looked` over an entity is taken at face value
 *       and the record positively asserts an absence it cannot know.
 *   (c) asks whether zero-of-zero reads as coverage — the costs-nothing rule
 *       wearing a percentage, and the one a reader would never question because
 *       100% looks like the best possible answer.
 *   (d) is the OVER-STRICTNESS direction, which a control usually forgets. A gate
 *       refusing the UNFAVOURABLE answer would pressure a member into inventing a
 *       coverage claim to publish at all — the bug-in-the-gate shape CLAUDE.md
 *       names by that name, and the reason the publication fence moved off the
 *       content axis in the first place.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { preflight } from "../scripts/armdecay.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-casesearched");        /* inside this worktree, rule 1 */
const STORE = join(ROOT, "src", "store.mjs");
const AIRUN = join(ROOT, "src", "airun.mjs");
const CHECKS = join(ROOT, "checks", "bio-checks.mjs");
const SUITE = join(DIR, "casesearched.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;                                /* a "restore" of a truncated file is not a restore */

let DRY = null;
const edit = (file, needle, replacement) => {
  if (DRY) { DRY.push({ file, needle }); return; }
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes four-arms-working from four-arms-broken",
              apply: () => {} },

  /* (a) BREAKS ONLY THE SUBJECT SET. The edit replaces the case-derived capture
     list with the log's own content-level subjects and changes NOTHING else — not
     the states, not the causes, not the outcome rule. That isolation is the
     point: a control whose method perturbs a second variable produces a
     refutation more confident than the finding it refutes. */
  a: { files: [STORE],
       label: "(a) THE ARM THIS ITEM EXISTS FOR — THE SUBJECT SET COMES FROM THE LOG. Nothing is forged and "
            + "no state is altered: the captures the case names are replaced by the captures the observation "
            + "log already holds a content-level row for. Every number stays true and the case that never "
            + "looked at its own document reads SEARCHED, because that document is no longer in the set",
       apply: () => edit(STORE,
         "    const capList = [...captures].slice(0, Store.SEARCHED_SUBJECT_MAX);",
         "    const capList = this.#rows(`SELECT DISTINCT subject FROM observation_log "
       + "WHERE level = 'content' AND subject_kind = 'capture'`).map((r) => r.subject)"
       + ".slice(0, Store.SEARCHED_SUBJECT_MAX);") },

  b: { files: [AIRUN],
       label: "(b) THE ONE-SIDED COERCION NEUTERED — a caller's `never_looked` is taken at face value at "
            + "every subject kind. A reference or an entity is then reported as POSITIVELY never looked at "
            + "over a window in which a look that found nothing leaves no trace, so the claim is not merely "
            + "unproven but unprovable. REC-95's measured finding stops being consulted",
       apply: () => edit(AIRUN,
         "        if (oneSided) { undetermined += 1; coerced += 1; } else neverLooked += 1;",
         "        neverLooked += 1;") },

  c: { files: [AIRUN],
       label: "(c) ZERO OF ZERO READS AS 100% — remove the `no_subjects` outcome so a level with nothing to "
            + "compute over falls through to `searched`. This is the costs-nothing rule wearing a percentage: "
            + "an equality that took no work to produce, reported as coverage, and the one a reader would "
            + "never question because 100% looks like the best possible answer",
       apply: () => edit(AIRUN,
         "    if (counted === 0 && unidentified === 0)           outcome = \"no_subjects\";",
         "    if (counted === 0 && unidentified === 0)           outcome = \"searched\";") },

  /* (d) IS THE DIRECTION THAT WOULD LOOK LIKE CAUTION AND IS NOT. A gate refusing
     a case that admits it never looked would make the honest answer unpublishable
     — so the only way to publish would be to look, or to lie. That is a fence
     tighter than its rule wearing the costume of rigour, and every arm asserting
     that an honest negative PUBLISHES must go red when it is armed. */
  d: { files: [CHECKS],
       label: "(d) OVER-STRICTNESS — make the gate REFUSE a searched section that reports `never_looked` at "
            + "any level. The honest negative then becomes unpublishable, so a member's only routes to a "
            + "published case are to look or to lie. A gate that pressures someone into inventing a coverage "
            + "claim is a bug in the gate, not a safer gate",
       apply: () => edit(CHECKS,
         "    if (!Number.isInteger(srch.subjects) || srch.subjects < 0)",
         "    if (Array.isArray(fm?.searched_levels) && fm.searched_levels.some((r) => r.outcome === 'never_looked'))\n"
       + "      findings.push(f(C41.COMPLETENESS, 'error', 'ARMED (e): a case reporting never_looked is refused'));\n"
       + "    if (!Number.isInteger(srch.subjects) || srch.subjects < 0)") },
};

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

/* D-331 · THE PREFLIGHT — every arm's anchor counted in the file that arm will
   write, and the WHOLE table printed, BEFORE anything is armed, so one dead
   anchor cannot take every arm behind it down unrun and unreported. */
const preflightArms = [];
for (const name of Object.keys(ARMS)) {
  DRY = [];
  try { ARMS[name].apply(); } catch (e) { console.log(`  (arm ${name} could not be dry-run: ${e.message})`); }
  preflightArms.push({ id: name, anchors: DRY });
  DRY = null;
}
preflight("casesearched.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

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

  let tally = "(not run)";
  try {
    arm.apply();
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    tally = (/casesearched: (\d+) pass, (\d+) fail/.exec(out) || [])[0]
         || "(suite produced no tally — it died before its own summary)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1].slice(0, 130));
    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f}`);
    if (!failed.length && name !== "baseline") console.log("    (no named failure — see the tally above)");
    results.push({ arm: name, tally, failed: failed.length });
  } finally {
    for (const s of snaps) {
      writeFileSync(s.file, readFileSync(s.copy));
      const now = readFileSync(s.file);
      const okSha = sha(now) === s.sha;
      const okBytes = now.length === s.bytes && now.length >= FLOOR;
      const okContent = now.equals(readFileSync(s.copy));
      console.log(`  restored ${s.file.split("/").pop()}  ${now.length} bytes  sha256 ${okSha ? "MATCH" : "MISMATCH"}  `
                + `content ${okContent ? "IDENTICAL" : "DIFFERS"}  size ${okBytes ? "ok" : "WRONG"}`);
      if (!(okSha && okBytes && okContent)) {
        console.error(`RESTORE FAILED for ${s.file}. The pristine copy is at ${s.copy} and is NOT being deleted.`);
        process.exit(3);
      }
    }
  }
}

console.log("\n=== SUMMARY ===");
for (const r of results) console.log(`  ${r.arm.padEnd(9)} ${r.tally}   (${r.failed} named failure(s))`);
rmSync(PEN, { recursive: true, force: true });
console.log(`\npen removed: ${PEN}`);
