/* CASE-3's NEGATIVE CONTROL DRIVER — six arms plus a baseline, re-runnable in
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
 * THE TALLY WAS CORRECTED 2026-09-14 (D-333), NEVER EXEMPTED, AND IT IS THE
 * FIRST THING THE NEW INSTRUMENT FOUND. This header read "five arms plus a
 * baseline" and the driver announces SEVEN — baseline plus (a) to (f). **Every
 * anchor was live the whole time**, which is precisely D-333's point: the count
 * decayed while nothing about the anchors did, so no static check and no
 * re-anchoring pass could ever have seen it. It went wrong when arm (f) was
 * added to this driver — its own note below records at length why (f) was added
 * and says nothing about the header, which is the shape of this defect — and it
 * sat wrong until `m025-arm-census.mjs` began holding a driver's declaration
 * against its own run. The old number was right when it was written; it is
 * corrected here rather than excused, because a declaration nobody reconciles is
 * the record overclaiming.
 *
 * WHAT THE SIX ARMS ARE FOR, since a list of edits is not a list of questions:
 *   (a) and (e) ask whether the FREEZE is real — written, and readable.
 *   (b) asks the question this item exists for: if a pin can be moved off the
 *       hash it holds, does anything notice?
 *   (c) asks whether the MINT is enforced or merely documented.
 *   (d) asks the question a control usually forgets — whether the fence is
 *       WIDER than the rule it enforces.
 *   (f) asks (b)'s question again BY THE ROUTE THAT IS ACTUALLY REACHABLE — the
 *       READ rather than the write. It is kept beside (b) rather than replacing
 *       it; the note at the arm says why.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { preflight } from "../scripts/armdecay.mjs";

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
   subject as unbreakable, which is the one wrong answer a control can give.

   D-331, 2026-09-14 — THE DRY MODE, AND IT IS THE WHOLE FIX. This driver's throw
   is what made M0-25's census read 2 of 6 arm announcements while FOUR anchors
   were dead: the throw fired at arm (a) and arms (c), (d), (e) — and later (f) —
   were never reached, so their staleness was hidden behind the first one. **A
   DEAD ANCHOR IS NOT A LOCAL FAILURE; IT BLINDS EVERY ARM BEHIND IT.**
   With `DRY` set, `edit()` RECORDS the (file, needle) pair and writes nothing, so
   every arm's own `apply()` can be run as a dry pass and the WHOLE anchor table
   reported before a byte moves. The throw is KEPT for the real pass — a
   half-armed tree is still never measured, which is the property this shape
   exists for and the one record-and-continue gives up. */
let DRY = null;
const edit = (file, needle, replacement) => {
  if (DRY) { DRY.push({ file, needle }); return; }
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

/* RE-ANCHORED 2026-09-13 BY M0-25's ARM-LIVENESS CENSUS, AND THE FINDINGS ARE KEPT
   AT THE SITE RATHER THAN QUIETLY REPAIRED. **FOUR OF THIS DRIVER'S SIX ARMS HAD
   STOPPED ARMING ON A GREEN `main`, AND ONLY ONE OF THEM WAS VISIBLE**, because
   `edit()` THROWS on a zero-match and the throw happened at arm (a) — so arms (c),
   (d) and (e) were never reached and their staleness was hidden behind the first
   one. **A DEAD ANCHOR IS NOT A LOCAL FAILURE; IT BLINDS EVERY ARM BEHIND IT.**
   That is the single most useful thing this census measured about driver shape.

   TWO COMMITS DID IT, neither of them wrong and neither of them aware:

   - `808342f` (case-5b, "the case-level signing ceremony, and then the deletion it
     was the precondition for") replaced CASE-3's per-member pin UPDATE with ONE
     upsert writing all N pins from the SIGNED case document in a single act. The
     `UPDATE published_case_members SET version_sha=? … WHERE … version_sha IS NULL`
     this constant held (written at `e8f6c85`, CASE-3) is gone. Arms (a) and (b).
   - `7e10ca9` (CASE-4 / DEC-72) ended `published` as a lifecycle state and replaced
     `current_state === "published"` with the ONE case-relation predicate
     `this.#caseRelationOf(target).member`. Arms (c) and (d).
   - Arm (e)'s SELECT gained a `, role` column in the same era.

   Each new anchor was COUNTED against the file before it was written (exactly one
   occurrence each, measured against the committed blob rather than the working
   tree). What the ARMS MEAN is preserved; only the shape they are written in moved.

   ARM (a) UNDER THE NEW MECHANISM. Its declared state is *"exactly the state the
   tree was in BEFORE this item — CASE-1's column existed and nothing on earth
   filled it"*. Deleting the whole upsert would now delete the ROSTER too, which is
   more than the arm claims and would fail for the wrong reason. Binding `null` in
   place of the signed document's value is the same state, minimally: the row is
   written, the column is there, and nothing fills it. */
const PIN_WRITE = "          id, ed, i, m, r.version_sha ?? null, r.role ?? null);";

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes six-arms-working from six-arms-broken",
              apply: () => {} },

  a: { files: [STORE],
       label: "(a) THE FREEZE NEVER HAPPENS: delete the pin write from publish() entirely. This is exactly "
            + "the state the tree was in BEFORE this item — CASE-1's column existed and nothing on earth "
            + "filled it — so this arm measures the size of the hole the item closed",
       apply: () => edit(STORE, PIN_WRITE, "          id, ed, i, m, null /* ARMED AWAY: the pin */, r.role ?? null);") },

  b: { files: [STORE],
       label: "(b) THE PIN IS MUTATED IN PLACE — THE ARM THIS ITEM EXISTS FOR. Drop `AND version_sha IS "
            + "NULL`, so every ratification re-pins and edition 2's hash overwrites the hash edition 1 was "
            + "frozen at. The case then says what the finding says NOW rather than what it said when it was "
            + "published, which is the overclaim the whole clause is against",
     /* ARM (b) RE-ANCHORED 2026-09-13 BY M0-25, AND IT MOVED UP A LEVEL BECAUSE
        THE PREDICATE IT NAMED IS GONE — which is the finding, not a workaround.
        (b) dropped `AND version_sha IS NULL` from CASE-3's per-member pin so that
        "every ratification re-pins". Under `808342f` (case-5b) that statement does
        not exist; the pins are one upsert keyed `(case_id, EDITION, bundle_id)`, so
        a later edition cannot reach an earlier edition's row at all — **the defect
        (b) was written against is now closed BY CONSTRUCTION, and it was closed in
        the same commit that killed the arm, with neither half recorded.** This
        driver's own header had already MEASURED the old predicate as unreachable
        and added arm (f) for the route that is reachable; case-5b then deleted the
        unreachable predicate outright.
        THE WRITE-ONCE GUARD DID NOT DISAPPEAR — IT MOVED TO THE CEREMONY. The
        signature write is `UPDATE case_documents SET … WHERE … AND sig_armored IS
        NULL`: the same shape, one level up, and it is what makes re-ratifying a
        signed edition impossible. Drop it and a second ratification of an edition
        already on the record runs the roster upsert again, whose
        `DO UPDATE SET version_sha=excluded.version_sha` re-pins every member —
        which is (b)'s declared defect exactly, now at the site that can produce it.
        The arm is CORRECTED rather than exempted, and the old expectation is on the
        record above as right when it was written. */
       apply: () => edit(STORE,
         "           ratified_at=? WHERE case_id=? AND edition=? AND sig_armored IS NULL`,",
         "           ratified_at=? WHERE case_id=? AND edition=?`,") },

  c: { files: [STORE],
       label: "(c) THE MINT IS NOT ENFORCED: remove the PUBLISHED_CANNOT_MOVE_VERSION arm, so an edit "
            + "touching a published version LANDS instead of being routed to a new edition. The door goes "
            + "back to standing open while its two neighbours stay shut",
     /* ARM (c) RE-ANCHORED 2026-09-13 BY M0-25. Staling commit `7e10ca9` (CASE-4 /
        DEC-72): `published` stopped being an inquiry lifecycle state, and the five
        guards that asked the STATE WORD were collapsed onto ONE predicate,
        `this.#caseRelationOf(target).member`. The fence is the same fence and the
        arm is the same arm — `false &&` in front of it — only the question it asks
        is now spelled as the case RELATION rather than the state. */
       apply: () => edit(STORE,
         '    if (to !== null && this.#caseRelationOf(target).member)',
         '    if (false && to !== null && this.#caseRelationOf(target).member)') },

  d: { files: [STORE],
       label: "(d) OVER-STRICTNESS — the direction a control usually forgets. Widen the fence from the four "
            + "acts that MOVE a state to all six, catching `hide` (a display prune that D-214 rules never "
            + "deletes) and `current` (a PROJECT's stance, written on the project). Nothing about a published "
            + "finding's claims has moved in either case, so this is a rule wider than the ruling it "
            + "enforces — an undeclared interface change wearing the costume of caution",
     /* ARM (d) RE-ANCHORED 2026-09-13 BY M0-25, same cause as (c) (`7e10ca9`,
        CASE-4). The over-strictness direction is unchanged: drop `to !== null` and
        the fence widens from the four acts that MOVE a state to all six. */
       apply: () => edit(STORE,
         '    if (to !== null && this.#caseRelationOf(target).member)',
         '    if (this.#caseRelationOf(target).member)') },

  e: { files: [STORE],
       label: "(e) THE FREEZE IS WRITTEN AND NO READER CAN SEE IT: drop `version_sha` from "
            + "#caseEditionState's roster SELECT. The pin is still committed, so arm (a) would not catch "
            + "this — a freeze nobody can read is not one a reader can rely on, and that is a separate "
            + "failure from not freezing at all",
     /* ARM (e) RE-ANCHORED 2026-09-13 BY M0-25 — the smallest of the four and the
        one that shows the class best: the SELECT gained a `, role` column and this
        anchor was not moved with it. Nothing about the arm changed; a column was
        added to a list. **This is the whole D-276 class in one line, and it sat
        behind arm (a)'s throw where nothing could see it.** */
       apply: () => edit(STORE,
         "      `SELECT ord, bundle_id, version_sha, role FROM published_case_members",
         "      `SELECT ord, bundle_id, NULL AS version_sha, role FROM published_case_members") },

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
     /* ARM (f) RE-ANCHORED 2026-09-13 BY M0-25, and it is the FIFTH stale anchor in
        this one driver — found only after (a) stopped throwing, which is exactly
        D-331's point. Same cause as arm (e): the roster SELECT gained a `, role`
        column and neither arm's quote moved with it. */
       apply: () => edit(STORE,
         "      `SELECT ord, bundle_id, version_sha, role FROM published_case_members",
         "      `SELECT ord, bundle_id, (SELECT pb.bundle_sha FROM published_bundles pb\n"
       + "          WHERE pb.bundle_id=published_case_members.bundle_id\n"
       + "          ORDER BY pb.edition DESC LIMIT 1) AS version_sha, role FROM published_case_members") },
};

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

/* ---------------------------------------------------- D-331 · THE PREFLIGHT
   Every arm's anchor is counted in the file that arm will write, and the WHOLE
   table is printed, BEFORE anything is armed. The report covers every arm in the
   table even when one is selected on the command line, because the complete
   report is the point; the refusal is scoped to the arms this invocation will
   actually run, so a stale arm cannot stop a healthy one from being driven. */
const preflightArms = [];
for (const name of Object.keys(ARMS)) {
  DRY = [];
  try { ARMS[name].apply(); } catch (e) { console.log(`  (arm ${name} could not be dry-run: ${e.message})`); }
  preflightArms.push({ id: name, anchors: DRY });
  DRY = null;
}
preflight("casepin.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

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
