/* CASE-3's NEGATIVE CONTROL DRIVER — five arms plus a baseline, re-runnable in
 * one step:
 *
 *     node test/casepin.control.mjs            # every arm, in order
 *     node test/casepin.control.mjs b          # one arm
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
 * WHAT THE FIVE ARMS ARE FOR, since a list of edits is not a list of questions:
 *   (a) and (e) ask whether the FREEZE is real — written, and readable.
 *   (b) asks the question this item exists for: if a pin can be moved off the
 *       hash it holds, does anything notice?
 *   (c) asks whether the MINT is enforced or merely documented.
 *   (d) asks the question a control usually forgets — whether the fence is
 *       WIDER than the rule it enforces.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-casepin");             /* inside this worktree, rule 1 */
const STORE = join(ROOT, "src", "store.mjs");
const SUITE = join(DIR, "casepin.test.mjs");
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

const PIN_WRITE =
  "        this.sql.exec(\n"
+ "          `UPDATE published_case_members SET version_sha=?\n"
+ "           WHERE case_id=? AND edition=? AND bundle_id=? AND version_sha IS NULL`,\n"
+ "          bundleSha, caseId, ed, bundleId);";

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes five-arms-working from five-arms-broken",
              apply: () => {} },

  a: { files: [STORE],
       label: "(a) THE FREEZE NEVER HAPPENS: delete the pin write from publish() entirely. This is exactly "
            + "the state the tree was in BEFORE this item — CASE-1's column existed and nothing on earth "
            + "filled it — so this arm measures the size of the hole the item closed",
       apply: () => edit(STORE, PIN_WRITE, "        /* ARMED AWAY: the pin write */") },

  b: { files: [STORE],
       label: "(b) THE PIN IS MUTATED IN PLACE — THE ARM THIS ITEM EXISTS FOR. Drop `AND version_sha IS "
            + "NULL`, so every ratification re-pins and edition 2's hash overwrites the hash edition 1 was "
            + "frozen at. The case then says what the finding says NOW rather than what it said when it was "
            + "published, which is the overclaim the whole clause is against",
       apply: () => edit(STORE,
         "           WHERE case_id=? AND edition=? AND bundle_id=? AND version_sha IS NULL`,",
         "           WHERE case_id=? AND edition=? AND bundle_id=?`,") },

  c: { files: [STORE],
       label: "(c) THE MINT IS NOT ENFORCED: remove the PUBLISHED_CANNOT_MOVE_VERSION arm, so an edit "
            + "touching a published version LANDS instead of being routed to a new edition. The door goes "
            + "back to standing open while its two neighbours stay shut",
       apply: () => edit(STORE,
         '    if (to !== null && b.current_state === "published")\n'
       + '      return refuse("PUBLISHED_CANNOT_MOVE_VERSION",',
         '    if (false && to !== null && b.current_state === "published")\n'
       + '      return refuse("PUBLISHED_CANNOT_MOVE_VERSION",') },

  d: { files: [STORE],
       label: "(d) OVER-STRICTNESS — the direction a control usually forgets. Widen the fence from the four "
            + "acts that MOVE a state to all six, catching `hide` (a display prune that D-214 rules never "
            + "deletes) and `current` (a PROJECT's stance, written on the project). Nothing about a published "
            + "finding's claims has moved in either case, so this is a rule wider than the ruling it "
            + "enforces — an undeclared interface change wearing the costume of caution",
       apply: () => edit(STORE,
         '    if (to !== null && b.current_state === "published")',
         '    if (b.current_state === "published")') },

  e: { files: [STORE],
       label: "(e) THE FREEZE IS WRITTEN AND NO READER CAN SEE IT: drop `version_sha` from "
            + "#caseEditionState's roster SELECT. The pin is still committed, so arm (a) would not catch "
            + "this — a freeze nobody can read is not one a reader can rely on, and that is a separate "
            + "failure from not freezing at all",
       apply: () => edit(STORE,
         "      `SELECT ord, bundle_id, version_sha FROM published_case_members",
         "      `SELECT ord, bundle_id, NULL AS version_sha FROM published_case_members") },

  /* ARM (f) EXISTS BECAUSE ARM (b) MEASURED SOMETHING OTHER THAN WHAT IT WAS
     WRITTEN TO MEASURE, and the two are kept side by side rather than the weaker
     one being quietly replaced.
     (b) removes the write-once predicate and the suite goes red on ONE arm — the
     STRUCTURAL one. That is the honest result and it is a finding about the
     PLANE, not about the suite: the pin UPDATE is keyed (case_id, EDITION,
     bundle_id), so a later edition writes a later edition's ROW and can never
     reach edition 1's, and a second sha at an edition already published is
     refused by EDITION_EXISTS long before the pin write. **The write-once
     predicate is therefore genuinely unreachable, which is what the item claimed
     at the site and is now MEASURED rather than argued.**
     So (f) mutates a pinned version in place BY THE ROUTE THAT IS REACHABLE —
     the READ. It makes the served pin follow the finding to its newest published
     version, which is precisely the defect CASE-5's artifact flip exists to
     prevent and precisely what "a published case is a claim about the present"
     looks like from a reader's chair. This is the behavioural half of the arm
     this item exists for. */
  f: { files: [STORE],
       label: "(f) THE PINNED VERSION IS MUTATED IN PLACE, BY THE ROUTE THAT IS ACTUALLY REACHABLE — the "
            + "READ. Serve each member's pin from the finding's LATEST published edition instead of from "
            + "the frozen membership row, so edition 1 starts answering with edition 2's hash. Nothing is "
            + "written and the case still silently becomes a claim about the present",
       apply: () => edit(STORE,
         "      `SELECT ord, bundle_id, version_sha FROM published_case_members",
         "      `SELECT ord, bundle_id, (SELECT pb.bundle_sha FROM published_bundles pb\n"
       + "          WHERE pb.bundle_id=published_case_members.bundle_id\n"
       + "          ORDER BY pb.edition DESC LIMIT 1) AS version_sha FROM published_case_members") },
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
    tally = (/casepin: (\d+) passed, (\d+) failed/.exec(out) || [])[0]
         || "(suite produced no tally — it died before its own summary)";
    const failed = [...out.matchAll(/^  FAIL {2}(.+)$/gm)].map((m) => m[1].slice(0, 130));
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
