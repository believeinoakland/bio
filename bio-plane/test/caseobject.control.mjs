/* CASE-1's NEGATIVE CONTROL DRIVER — five arms plus a baseline, re-runnable in
 * one step:
 *
 *     node test/caseobject.control.mjs            # every arm, in order
 *     node test/caseobject.control.mjs d          # one arm
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
 * EACH ARM IS ARMED ALONE, with every other defence held open. An arm that
 * requires two edits says so and makes both, because breaking one of a pair
 * leaves the other refusing and measures nothing.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-caseobject");          /* inside this worktree, rule 1 */
const SCHEMA = join(ROOT, "src", "schema.mjs");
const STORE = join(ROOT, "src", "store.mjs");
const SUITE = join(DIR, "caseobject.test.mjs");
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
  baseline: { files: [], label: "nothing armed — what distinguishes five-arms-working from five-arms-broken",
              apply: () => {} },

  a: { files: [SCHEMA],
       label: "(a) THE OBJECT ITSELF: drop the `cases` table from schema.mjs. The public index's LEFT JOIN "
            + "then names a table SQLite cannot resolve and the whole op goes down — which is the finding: "
            + "this schema is not a string in a file, it is a thing a caller reaches",
       apply: () => edit(SCHEMA,
         "CREATE TABLE IF NOT EXISTS cases (",
         "CREATE TABLE IF NOT EXISTS cases_ARMED_AWAY (") },

  b: { files: [SCHEMA, STORE],
       label: "(b) THE TWO MEMBER FACTS: drop `version_sha` and `role` from BOTH schema.mjs and store.mjs's "
            + "ADD COLUMN ladder. BOTH halves together, because a fresh store takes the CREATE TABLE and a "
            + "migrated one takes the ladder, so breaking one alone leaves the other supplying the column",
       apply: () => {
         edit(SCHEMA,
           "  version_sha TEXT,               -- the member finding's pinned bundle_sha. NULL = not pinned, and STATED\n"
         + "  role        TEXT,               -- 'load_bearing' | 'supporting'. NULL = nobody authored one, and STATED\n",
           "");
         edit(STORE,
           '      ["published_case_members", "version_sha", "TEXT"],\n'
         + '      ["published_case_members", "role", "TEXT"],\n',
           "");
       } },

  c: { files: [STORE],
       label: "(c) THE JOIN'S DIRECTION: make the case->project join INNER instead of LEFT. BLOCK 1 STAYS "
            + "GREEN AND BLOCK 2 GOES RED, and that asymmetry is the arm's whole value — over an empty store "
            + "an inner join answers [] exactly as a left join does, so only a REAL published case can see "
            + "published material being deleted from the public record",
       apply: () => edit(STORE,
         "FROM published_cases c LEFT JOIN cases k ON k.case_id = c.case_id",
         "FROM published_cases c JOIN cases k ON k.case_id = c.case_id") },

  d: { files: [SCHEMA],
       label: "(d) OVER-STRICTNESS — the direction a control usually forgets. Give `role` a "
            + "`NOT NULL DEFAULT 'supporting'`, which looks like tightening and is a DESIGNATION MANUFACTURED "
            + "BY A MIGRATION: the shipped ratify path still succeeds and the member comes back designated "
            + "by nobody. A fence tighter than its rule is an undeclared interface change wearing the "
            + "costume of caution",
       /* THE COMMENT IS KEPT VERBATIM AND ONLY THE CONSTRAINT MOVES. The first
          version of this arm deleted the line whole, which also took the
          vocabulary comment the block-3 spelling arm greps — so it measured
          15/2 and one of the two failures was collateral. An over-strictness arm
          that drags an unrelated assertion down cannot say which direction it
          proved. Corrected rather than explained away. */
       apply: () => edit(SCHEMA,
         "  role        TEXT,               -- 'load_bearing' | 'supporting'. NULL = nobody authored one, and STATED",
         "  role        TEXT NOT NULL DEFAULT 'supporting', -- 'load_bearing' | 'supporting'. ARMED: a default") },

  e: { files: [SUITE],
       label: "(e) REACH — neuter block 3's expectation by pointing the design-document lookup at paths that "
            + "do not exist. The FOUND arm fails while blocks 1 and 2 stay green, which is why that arm is "
            + "separate: a detector that finds nothing passes everything",
       apply: () => edit(SUITE,
         'const homes = [join(DIR, "..", "..", "docs", "development", "CASE-AS-PRODUCTION.md"),',
         'const homes = [join(DIR, "..", "..", "docs", "development", "NO-SUCH-DESIGN.md"),') },
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
    /* CAPTURED TO A FILE, NEVER A PIPE (rule 3), and run ONCE — a second run
       would double the cost and could disagree with the first for reasons that
       have nothing to do with the arm. A red suite exits 1, which is the
       EXPECTED outcome of an armed arm and is a result rather than an error. */
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    tally = (/caseobject: (\d+) pass, (\d+) fail/.exec(out) || [])[0] || "(suite produced no tally — it died before its own summary)";
    const failed = [...out.matchAll(/^  FAIL {2}(.+)$/gm)].map((m) => m[1].slice(0, 120));
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
