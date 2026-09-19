/* CASE-4's NEGATIVE CONTROL DRIVER — seven arms plus a baseline, re-runnable in
 * one step:
 *
 * TALLY CORRECTED 2026-09-14 (M0-29, D-343). This line read *"five arms plus a
 * baseline"* and the driver announced EIGHT. It was RIGHT AS A COUNT OF THE
 * QUESTIONS the list below asks — five — and wrong as a count of the ARMS that
 * ask them, because two of those questions are asked in TWO SHAPES EACH: (b) and
 * (b2) are set-but-never-clear's two failure shapes, and (d2) exists because (d)
 * measured something other than what it was written for, which its own comment
 * says at the site. Both splits landed inside this driver's OWN commit `7e10ca9`
 * and nobody moved the opening sentence. THE ARMS ARE REAL — every one has its
 * own anchor, subject and recorded result — so the DECLARATION is corrected and
 * no arm is restored or removed (`casepin.control.mjs` is D-333's precedent).
 *
 *     node test/caselifecycle.control.mjs            # every arm, in order
 *     node test/caselifecycle.control.mjs b          # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`, for the reason `d249-port.control.mjs` states:
 * it EDITS REAL SOURCES, and a file the battery discovers must never be one that
 * rewrites `src/` underneath the suites running beside it.
 *
 * THREE RULES THIS DRIVER OBEYS BECAUSE THIS PROJECT PAID FOR EACH OF THEM:
 *
 *   1. PRISTINE COPIES LIVE INSIDE THIS WORKTREE, never in a shared scratchpad.
 *      PL-10's harness was overwritten mid-turn by a concurrent worker writing
 *      the same path; the scratchpad is shared between sessions and a worktree
 *      is not. Each copy is UNIQUELY NAMED PER ARM, so two arms cannot restore
 *      each other's snapshot.
 *   2. EVERY RESTORE IS VERIFIED BY CONTENT AND BY sha256, with the byte count
 *      printed and floored. UI-38 met a harness that reported a byte-identical
 *      restore over a file it had not restored.
 *   3. THE SUITE'S OUTPUT IS CAPTURED TO A FILE, NEVER TO A PIPE. D-282: a suite
 *      calling `process.exit()` discards unflushed PIPE writes, and the tally
 *      read `-1` for exactly that reason on a control that looked fine.
 *
 * EACH ARM IS ARMED ALONE, with every other defence held open.
 *
 * WHAT THE SEVEN ARMS ARE FOR, since a list of edits is not a list of questions.
 * The list is written by QUESTION and there are five questions; the arm count is
 * SEVEN because two questions are asked in two shapes each, and the arm ids are
 * named against each question so the two numbers can never drift apart again:
 *   (a) asks the question this item exists for: if a revised member raises no
 *       flag, does anything notice?
 *   (b) and (b2) ask whether SET-BUT-NEVER-CLEAR is real, in its two failure
 *       shapes — a flag that clears itself on a later READ, and a discharge that
 *       reaches every project instead of the one that acted (D-266's scoping).
 *   (c) asks the question the whole item turns on: does the PRECONDITION survive
 *       the state's removal, or did it ride on the table that was deleted?
 *   (d) and (d2) ask the question a control usually forgets — whether the guard
 *       is WIDER than the rule it enforces, which here would freeze every
 *       concluded finding in the corpus. TWO ARMS, and (d2) is named in this
 *       list from 2026-09-14 (M0-29): it exists because (d) measured something
 *       other than what it was written for, which its own comment says at its
 *       site, and leaving it out of this list is what made the tally false.
 *   (e) asks whether the suite's own ANCHOR is real: block 9 parses its
 *       expectations out of the design document, and an anchor that silently
 *       matched nothing would make every arm pass over an empty string.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-caselifecycle");        /* inside this worktree, rule 1 */
const STORE = join(ROOT, "src", "store.mjs");
const SUITE = join(DIR, "caselifecycle.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;                                 /* a "restore" of a truncated file is not a restore */

/* ONE UNIQUE STRING REPLACEMENT PER EDIT, and it THROWS if the needle is absent
   or ambiguous. An arm that silently edited nothing is an arm that reports the
   subject as unbreakable, which is the one wrong answer a control can give. */
const edit = (file, needle, replacement) => {
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

const ARMS = {
  /* The count in this label is the SAME CLAIM as the head's tally and was stale the same way
     (`five` against a table of seven); corrected 2026-09-14 by M0-29 with the head, because
     correcting one and leaving the other is the half-fix that makes the next reader believe
     the wrong half. */
  baseline: { files: [], label: "nothing armed — what distinguishes seven-arms-working from seven-arms-broken",
              apply: () => {} },

  a: { files: [STORE],
       label: "(a) THE ARM THIS ITEM EXISTS FOR — a revised member raises NO FLAG. `#flagCasesOnRevision` "
            + "returns before it reads the roster, so `promote` mints versions exactly as it does today "
            + "and no containing case is ever told. This is the state the tree was in before this item, "
            + "so the arm measures the size of the hole it closed",
       apply: () => edit(STORE,
         "    if (!bundleId || !replacedSha) return [];",
         "    if (!bundleId || !replacedSha) return [];\n    return []; /* ARMED: the flag is never raised */") },

  b: { files: [STORE],
       label: "(b) THE FLAG CLEARS ITSELF ON A LATER READ — `caseFlags` drops any row whose `revised_sha` "
            + "is no longer the finding's head, which is the DERIVED-ON-READ design this item considered "
            + "and rejected. Nothing is deleted and no act is recorded; the flag simply stops being "
            + "raised, which is indistinguishable from a project having dealt with it (D-79, one altitude "
            + "up)",
       apply: () => edit(STORE,
         "    const flags = rows.map((r) => ({",
         "    /* ARMED: the derived read, which clears itself */\n"
       + "    for (let i = rows.length - 1; i >= 0; i--) {\n"
       + "      const h = this.#one(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, rows[i].bundle_id);\n"
       + "      if (!h || h.bundle_sha !== rows[i].revised_sha) rows.splice(i, 1);\n"
       + "    }\n"
       + "    const flags = rows.map((r) => ({") },

  b2: { files: [STORE],
        label: "(b2) ONE PROJECT ACTING CLEARS EVERY CASE — drop `case_id=?` from the discharge UPDATE, so "
             + "a ratified edition of ANY case answers every outstanding flag in the store. This is "
             + "D-266's scoping ruling removed: a disposition that is not scoped to the key's own "
             + "subject, which here means one project's deliberate act silently speaking for another "
             + "project's case",
        apply: () => edit(STORE,
          "        WHERE case_id=? AND acted_at IS NULL`, when, by ?? null, edition ?? null, caseId);",
          "        WHERE acted_at IS NULL`, when, by ?? null, edition ?? null);") },

  c: { files: [STORE],
       label: "(c) THE PRECONDITION DOES NOT SURVIVE THE STATE'S REMOVAL — delete the NOT_CONCLUDED "
            + "refusal from publishCase(). This is the exact shape of the damage the item was warned "
            + "about: the old guard `legalFrom.includes(\"published\")` is false from every state once the "
            + "edge is gone, so anyone repairing that noise by deleting the guard lets an UNCONCLUDED "
            + "finding into a case — a material set asserted over a question nobody has answered",
       /* RE-ANCHORED 2026-09-19 by REC-135, and the anchor MOVED because the SUBJECT
          moved, not because the arm was wrong. §7.1 item 4 makes `concluded` a
          question about the PUBLISHING PROJECT'S relationship, so the refusal now
          tests `conc.state` — the answer of the one reader `#caseConclusionFor` —
          where it used to test the inquiry's own `b.current_state`. THE ARM IS
          UNCHANGED IN WHAT IT BREAKS: the NOT_CONCLUDED refusal is still what is
          deleted, and the damage it names is still an unconcluded finding admitted
          to a case. Found by `m025-arm-anchor-witness.test.mjs` arm A4 (a line
          CHANGED IN PLACE under a quote that was not moved with it, the D-276
          class) rather than by anybody remembering to look, which is the instrument
          doing exactly what it exists for. */
       apply: () => edit(STORE,
         '      if (conc.state !== "concluded")',
         '      if (false && conc.state !== "concluded")') },

  d: { files: [STORE],
       label: "(d) OVER-STRICTNESS — the case relation is widened to every `concluded` finding, so the "
            + "guards that fence a signed edition fence the whole corpus. Divide, restructure, dispose "
            + "and publish all vanish from a finding nobody ever published, and every refusal in block 4 "
            + "still fires, so a suite testing only the refusals would read this as a stronger plane "
            + "rather than as a change that froze the record",
       apply: () => edit(STORE,
         "    return { member: pinned.length > 0 || prepared !== null, pinned, prepared };",
         "    const b2 = this.#one(`SELECT current_state FROM bundles WHERE bundle_id=?`, bundleId);\n"
       + "    return { member: pinned.length > 0 || prepared !== null\n"
       + "               || (b2 && b2.current_state === \"concluded\"), pinned, prepared };") },

  /* ARM (d2) EXISTS BECAUSE ARM (d) MEASURED SOMETHING OTHER THAN WHAT IT WAS
     WRITTEN TO MEASURE, AND BOTH ARE KEPT rather than the weaker one being
     quietly replaced — CASE-3's arm (f) and CASE-5's arm (c), same shape.
     (d) widens the case relation ITSELF, which turns out to be so over-strict
     that `op=publish` refuses the FIRST publication (ALREADY_A_CASE_MEMBER) and
     the fixture cannot be built at all: the arm fails at assertion one and
     never reaches block 4's over-strictness arm, which is the arm it was written
     to exercise. That is a real and useful measurement — the widening is caught
     immediately and catastrophically — but it is not the one declared.
     (d2) therefore widens ONE GUARD instead of the relation, which is the
     realistic shape of this mistake: a worker translating
     `current_state === "published"` reaches for `=== "concluded"` because that
     is what a published member now says, and fences every concluded finding in
     the corpus with it. The fixture builds, every refusal in block 4 still
     fires, and ONLY the over-strictness arm bites. */
  d2: { files: [STORE],
        label: "(d2) OVER-STRICTNESS, THE REALISTIC SHAPE — ONE guard is translated from the state word to "
             + "`concluded` instead of to the case relation, so op=inquiryground refuses every concluded "
             + "finding whether or not any case ever froze it. The fixture still builds and every refusal "
             + "in block 4 still fires, so a suite asserting only that the guards bite would read this as "
             + "a stronger plane rather than as a fence around the whole corpus",
        apply: () => edit(STORE,
          "    if (this.#caseRelationOf(target).member)\n"
        + '      return { ok: false, reason: "PUBLISHED_CANNOT_RESTRUCTURE", target, from: b.current_state,',
          '    if (b.current_state === "concluded")\n'
        + '      return { ok: false, reason: "PUBLISHED_CANNOT_RESTRUCTURE", target, from: b.current_state,') },

  e: { files: [SUITE],
       label: "(e) THE SUITE'S OWN ANCHOR — break block 9's design-document parse so the bullet is never "
            + "found. Every expectation in that block is PARSED OUT OF CASE-AS-PRODUCTION.md at run time "
            + "precisely so it cannot move with the code, and a parse that silently matched nothing would "
            + "make four arms pass over an empty string. The anchor arm must go red FIRST",
       apply: () => edit(SUITE,
         'const bullet = (doc.match(/\\*\\*CASE-4 · lifecycle and the revision flag\\.\\*\\*([\\s\\S]*?)Depends/) || [])[1] || "";',
         'const bullet = (doc.match(/\\*\\*CASE-4 · NO SUCH BULLET\\.\\*\\*([\\s\\S]*?)Depends/) || [])[1] || "";') },
};

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

mkdirSync(PEN, { recursive: true });
const results = [];

for (const name of order) {
  const arm = ARMS[name];
  /* SNAPSHOT FIRST, uniquely named per arm AND per file (rule 1). */
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
    /* CAPTURED TO A FILE, NEVER A PIPE (rule 3), and run ONCE. A red suite exits
       1, which is the EXPECTED outcome of an armed arm and is a result rather
       than an error. */
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    tally = (/caselifecycle: (\d+) pass, (\d+) fail/.exec(out) || [])[0]
         || "(suite produced no tally — it died before its own summary)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1].slice(0, 130));
    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f}`);
    if (!failed.length && name !== "baseline") console.log("    (no named failure — see the tally above)");
    results.push({ arm: name, tally, failed: failed.length });
  } finally {
    /* RESTORE, AND VERIFY BY CONTENT AND BY sha256 (rule 2). */
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
