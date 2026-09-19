/* REC-135's NEGATIVE CONTROL DRIVER — six arms plus a baseline, re-runnable in one
 * step from `bio-plane/`:
 *
 *     node test/case-project-conclusion.control.mjs        # every arm, in order
 *     node test/case-project-conclusion.control.mjs a      # one arm
 *
 * Built on `conclude-project.control.mjs`'s driver, whose rules it keeps and which
 * is the control for the act this item reads from.
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES, and a file the battery
 * discovers must never rewrite `src/` underneath the suites running beside it.
 *
 * Pristine copies live INSIDE THIS WORKTREE and are uniquely named per arm; every
 * restore is verified by CONTENT and by sha256 with the byte count floored; the
 * suite's output is captured to a FILE, never a pipe (D-282). Each arm is armed
 * ALONE, every other held open.
 *
 * A MISSING TALLY IS REPORTED AS -1 AND NEVER AS 0. A TypeError inside an assertion
 * goes through no assertion at all and ends the module with a clean-looking count,
 * so the FOOT is what is read. The suite itself was hardened against that first —
 * every read of a case document it might not have is defensive — so an arm that
 * breaks the gate produces FAILING ASSERTIONS rather than a dead module, which is
 * the difference between a control that measures and one that merely survives.
 *
 * DECLARED BEFORE ARMING (2026-09-19, REC-135 worker), each arm ALONE:
 *  (a) THE GATE POINTED BACK AT THE INQUIRY'S SHARED STATE — the row's own named
 *      control, and the liar this whole item exists to refuse.
 *      MUST FAIL: §1's A-publishes arm, the SAME-QUESTION-TWO-ANSWERS
 *      discriminator, §2's four document arms, §4's "D can publish while it stands
 *      on its conclusion" fixture arm and its after-withdrawal arm (D's question is
 *      `open` too, so no publish succeeds), §6's act-succeeds arm and the
 *      publish-IS-offered arm's third element is unaffected but the act one is.
 *      MUST NOT FAIL: §3 (the legacy path reads the state word and is unchanged),
 *      §5 (already refused), §6's OVER-STRICTNESS arm.
 *  (b) THE STATE FLOOR DROPPED — every state is treated as case-bearing.
 *      MUST FAIL: §5's arm alone.  MUST NOT FAIL: everything else.
 *  (c) THE RELATIONSHIP COLLAPSED IN THE RECORD — a no-project conclusion is
 *      recorded as the publishing project's own.
 *      MUST FAIL: §3's disclosure arm and §3's body arm.  MUST NOT FAIL: the rest,
 *      INCLUDING every arm in §1 and §2 — which is the point: a case document can
 *      be complete, every field populated and every number true, and still say the
 *      publisher concluded something it did not.
 *  (d) THE WITHDRAWAL MADE INVISIBLE — the gate reads the raw stance instead of
 *      `#conclusionOf`, so a withdrawn conclusion still counts.
 *      MUST FAIL: §4's after-withdrawal arm alone.  MUST NOT FAIL: everything else.
 *  (e) THE STRICT READING OF §7.1 ITEM 8 — the no-project disjunct removed, so only
 *      a project's OWN conclusion admits a case. This arm is not only a control: it
 *      MEASURES what the tightening the report puts to BOB would cost, at this
 *      suite's altitude.  MUST FAIL: §3's three arms.  MUST NOT FAIL: §1, §2, §4,
 *      §5, §6.
 *  (f) THE AFFORDANCE BACK ON THE STATE WORD — the `concluded_for_project` disjunct
 *      removed from the `publish` predicate.
 *      MUST FAIL: §6's publish-IS-offered arm alone. MUST NOT FAIL: everything
 *      else, including §6's over-strictness arm and the act-succeeds arm — the
 *      store still accepts it, which is exactly the DEC-8 disagreement the fact
 *      exists to prevent and is what makes this arm worth having.
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
const PEN = join(ROOT, ".nc-case-project-conclusion");   /* inside this worktree */
const STORE = join(ROOT, "src", "store.mjs");
const AFF = join(ROOT, "src", "affordances.mjs");
const SUITE = join(DIR, "case-project-conclusion.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

/* ONE UNIQUE STRING REPLACEMENT PER EDIT, THROWING on an absent or ambiguous
   needle — an arm that silently edited nothing reports the subject as
   unbreakable. With `DRY` set it records the anchor and writes nothing. */
let DRY = null;
const edit = (file, needle, replacement) => {
  if (DRY) { DRY.push({ file, needle }); return; }
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes six-arms-working from six-arms-broken",
              apply: () => {} },

  a: { files: [STORE],
       label: "(A) THE GATE POINTED BACK AT THE INQUIRY'S SHARED STATE: publishCase asks "
            + "b.current_state again, the single stance §7 forbids and the row's own named control",
       apply: () => edit(STORE,
         "      const conc = this.#caseConclusionFor(proj, id, viewer, b.current_state);\n"
       + "      if (conc.state !== \"concluded\")",
         "      const conc = this.#caseConclusionFor(proj, id, viewer, b.current_state);\n"
       + "      if (b.current_state !== \"concluded\")") },

  b: { files: [STORE],
       label: "(B) THE STATE FLOOR DROPPED: every state is case-bearing, so a conclusion written while "
            + "the question was open outlives the group setting it down or dividing it",
       apply: () => edit(STORE,
         "    const bearing = Store.CASE_BEARING_STATES.includes(currentState);",
         "    const bearing = true;") },

  c: { files: [STORE],
       label: "(C) THE RELATIONSHIP COLLAPSED IN THE RECORD: a no-project conclusion is recorded as the "
            + "PUBLISHING PROJECT'S own — every field populated, every number true, and the bytes wrong",
       apply: () => edit(STORE,
         "      return { state: \"concluded\", relationship: \"no_project\", project: null, inquiry: inq,",
         "      return { state: \"concluded\", relationship: \"project\", project: pid || null, inquiry: inq,") },

  d: { files: [STORE],
       label: "(D) THE WITHDRAWAL MADE INVISIBLE: the gate reads the raw stance instead of "
            + "#conclusionOf, so a conclusion a project WITHDREW still admits a case",
       apply: () => edit(STORE,
         "    const own = pid && bearing ? this.#conclusionOf(pid, inq, viewer) : null;",
         "    const own = pid && bearing ? (this.#conclusionRecordOf(pid, inq, viewer).stance || null) : null;") },

  e: { files: [STORE],
       label: "(E) THE STRICT READING OF §7.1 ITEM 8: the no-project disjunct removed, so ONLY a "
            + "project's own conclusion admits a case — the tightening the report puts to BOB, measured",
       apply: () => edit(STORE,
         "    const np = bearing ? this.#noProjectConclusionOf(inq) : null;",
         "    const np = null;") },

  f: { files: [AFF],
       label: "(F) THE AFFORDANCE BACK ON THE STATE WORD: the publish predicate drops "
            + "concluded_for_project, so the surface hides an act the store would accept (DEC-8)",
       apply: () => edit(AFF,
         "                     && (f.current_state === \"concluded\" || f.concluded_for_project === true)",
         "                     && f.current_state === \"concluded\"") },
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
preflight("case-project-conclusion.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

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

  let tally = "(not run)", counted = -1;
  try {
    arm.apply();
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    const m = /case-project-conclusion\.test\.mjs: (\d+) pass, (\d+) fail/.exec(out);
    /* -1, NEVER 0: a suite that died before its own FOOT reported nothing, and a
       zero there reads as "no failures" to every eye that scans a column. */
    counted = m ? Number(m[2]) : -1;
    tally = m ? m[0] : "(NO TALLY — the suite died before its own summary; counted as -1)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((f) => f[1].slice(0, 130));
    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f}`);
    if (!failed.length && name !== "baseline") console.log("    (no named failure — see the tally above)");
    results.push({ arm: name, tally, failed: counted });
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
for (const r of results) console.log(`  ${r.arm.padEnd(9)} ${r.tally}   (${r.failed} failing assertion(s))`);
rmSync(PEN, { recursive: true, force: true });
console.log(`\npen removed: ${PEN}`);

/* MEASURED 2026-09-19 by the REC-135 worker (`node test/case-project-conclusion.control.mjs`
   from `bio-plane/`, worktree `.claude/worktrees/rec135-record`, branch
   `rec-135-project-conclusion-to-case`). EVERY RESTORE sha256 MATCH and content
   IDENTICAL; `store.mjs` 2,694,268 bytes, `affordances.mjs` 144,527 bytes, both
   well over the 1,000-byte floor. All six anchors LIVE at the preflight.
   RE-RUN after the subject moved (the refusal's detail regained the rule's own
   sentence, which `caselifecycle.test.mjs` asserts the plane and the design
   document print identically): EVERY FIGURE BELOW IDENTICAL. That is the property
   worth having — this control is coupled to BEHAVIOUR, so a change to what the
   refusal SAYS does not move it, and M-60 Q9's failure mode (a control coupled to
   shape, disarmed by a refactor) is not this one's.

     baseline  25 pass, 0 fail
     (a)       17 pass, 8 fail   the gate back on the shared state
     (b)       24 pass, 1 fail   the state floor dropped
     (c)       23 pass, 2 fail   the relationship collapsed in the record
     (d)       24 pass, 1 fail   the withdrawal made invisible
     (e)       22 pass, 3 fail   the strict reading of item 8
     (f)       24 pass, 1 fail   the affordance back on the state word

   EVERY ARM AS DECLARED, and the MUST-NOT halves held. TWO DIFFERENCES BETWEEN
   THE DECLARATION AND THE MEASUREMENT, recorded rather than smoothed:

   1. Arm (a) was declared to fail §4's AFTER-WITHDRAWAL arm as well, and it did
      NOT. The reason is a fact about the ARM and not about the subject: (a)
      changes only the `if` CONDITION and leaves `#caseConclusionFor` computing
      the answer the refusal reports, so D's refusal still carries
      `why: project_withdrew_its_conclusion` and `stance.act: withdrawn` and the
      assertion still passes. Declared 9, measured 8. That is worth writing down
      because it names what arm (a) can and cannot see: it sees WHICH FACT THE
      GATE DECIDES ON, and it is blind to what the refusal SAYS.
   2. Arm (e) — the strict reading — is the one arm whose result is also a
      MEASUREMENT for BOB rather than only a control: three assertions, all in
      §3, and every one of them is the legacy path. At this suite's altitude the
      tightening costs exactly the no-project publication route. The battery-wide
      cost is larger and is reported separately; it was NOT measured by this
      driver, and saying so is the point.

   WHAT NO ARM HERE CAN SEE, stated so the next reader does not have to test it:
   nothing in this driver breaks `op=reopen`, because this item does not change
   it (the report argues why reopen reads the shared state BY DESIGN); and no arm
   touches the published case CONTAINER, so a claim that already-signed editions
   verify byte-identically rests on those bytes being stored rather than
   recomputed, which `casesign`/`publishedcase` own and this driver does not. */
