/* REC-126's NEGATIVE CONTROL DRIVER — eight arms plus a baseline ((a)-(d) REC-126's, (e)-(h)
 * REC-133's, §6A.2's authority), re-runnable in one step:
 *
 *     node test/reviewcopy.control.mjs            # every arm, in order
 *     node test/reviewcopy.control.mjs a          # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES, and a file the battery
 * discovers must never rewrite `src/` underneath the suites running beside it.
 *
 * `casesign.control.mjs`'s three rules, obeyed for its reasons: pristine copies live
 * INSIDE THIS WORKTREE and are uniquely named per arm; every restore is verified by
 * CONTENT and by sha256 with the byte count floored; the suite's output is captured
 * to a FILE, never a pipe (D-282). Each arm is armed ALONE.
 *
 * THE DECLARATIONS ARE IN THE SUITE'S OWN `NEGATIVE CONTROL:` HEADER, made before
 * arming. The MEASURED figures are recorded at the foot of this file.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { preflight } from "../scripts/armdecay.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-reviewcopy");          /* inside this worktree */
const STORE = join(ROOT, "src", "store.mjs");
const SUITE = join(DIR, "reviewcopy.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

/* ONE UNIQUE STRING REPLACEMENT PER EDIT, THROWING on an absent or ambiguous needle
   — an arm that silently edited nothing reports the subject as unbreakable. With
   `DRY` set it records the anchor and writes nothing (D-331's preflight). */
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

  a: { files: [STORE],
       label: "(a) THE REVOCATION CHECK REMOVED: a withdrawn grant's secret still answers",
       apply: () => edit(STORE,
         "`SELECT * FROM review_grants WHERE secret_sha=? AND revoked_at IS NULL`",
         "`SELECT * FROM review_grants WHERE secret_sha=?`") },

  b: { files: [STORE],
       label: "(b) THE EDITION BINDING REMOVED: a grant bound to edition 2 keeps answering once the draft "
            + "stands at edition 3",
       apply: () => edit(STORE,
         "if ((now.caseId ?? null) !== (g.case_id ?? null) || now.edition !== Number(g.edition)) return null;",
         "if ((now.caseId ?? null) !== (g.case_id ?? null)) return null;") },

  c: { files: [STORE],
       label: "(c) OVER-STRICTNESS: a grant is live only while its draft PASSES every publish gate — the gate "
            + "pressuring a member into filling a gap to send the copy",
       apply: () => edit(STORE,
         "    const now = this.#draftIdentity(d);\n    if ((now.caseId",
         "    if (this.#reviewGates(d).gates !== \"passed\") return null;\n"
       + "    const now = this.#draftIdentity(d);\n    if ((now.caseId") },

  d: { files: [STORE],
       label: "(d) THE LIAR'S REFUSAL: a revoked grant's READ answers REVIEW_GRANT_REVOKED instead of the one "
            + "dead answer — the copy is still withheld, and the holder learns their access existed",
       apply: () => edit(STORE,
         "      if (!live || (draft && String(draft).trim() !== live.draft.draft_id)) return Store.#noReviewCopy();\n"
       + "      d = live.draft; grant = live.grant; reader = \"recipient\";",
         "      if (!live && this.#one(`SELECT 1 AS x FROM review_grants WHERE secret_sha=? AND revoked_at IS NOT NULL`, "
       + "String(secretSha ?? \"\"))) return { ok: false, reason: \"REVIEW_GRANT_REVOKED\", detail: \"withdrawn\" };\n"
       + "      if (!live || (draft && String(draft).trim() !== live.draft.draft_id)) return Store.#noReviewCopy();\n"
       + "      d = live.draft; grant = live.grant; reader = \"recipient\";") },

  /* REC-133 — §6A.2's authority (BOB #15). Declarations in the suite's header. */
  e: { files: [STORE],
       label: "(e) REVOKE RE-GATED AT OWNER-ONLY (REC-126's provisional): an administrator who is not the owner "
            + "can no longer withdraw a grant",
       apply: () => edit(STORE,
         "if (!g || !(this.#isProjectOwner(g.project_id, a.who) || this.#isAdminMember(a.who)))",
         "if (!g || !this.#isProjectOwner(g.project_id, a.who))") },

  f: { files: [STORE],
       label: "(f) ISSUE WIDENED TO EDITORS: a joined participant who is not an owner hands the draft outside",
       apply: () => edit(STORE,
         "if (!d || !this.#isProjectOwner(d.project_id, a.who)) return Store.#notReviewOwner(\"grant\");",
         "if (!d || !this.#isProjectEditor(d.project_id, a.who)) return Store.#notReviewOwner(\"grant\");") },

  g: { files: [STORE],
       label: "(g) THE LIAR'S WIDENING: authoring a draft admitted to ANY signed-in member, position ignored",
       apply: () => edit(STORE,
         "    if (!this.#isProjectEditor(owning, a.who)) return Store.#notReviewOwner(\"draft\");\n",
         "") },

  h: { files: [STORE],
       label: "(h) THE DRY RUN AS THE EDITOR: the gates run as the draft's last editor, so a non-owner editor's "
            + "draft reads NOT_THE_PROJECT_OWNER instead of its real gaps",
       apply: () => edit(STORE,
         "        const by = this.#draftPublisher(row);",
         "        const by = row.updated_by;") },
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
preflight("reviewcopy.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

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
    tally = (/reviewcopy: (\d+) pass, (\d+) fail/.exec(out) || [])[0]
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

/* MEASURED 2026-09-18, from this driver's own printed SUMMARY (worktree
   agent-abd7c5e99752beec6), every restore sha256 MATCH / content IDENTICAL:
     baseline  reviewcopy: 52 pass, 0 fail
     a         reviewcopy: 48 pass, 4 fail   as declared
     b         reviewcopy: 51 pass, 1 fail   the case-document arm HELD — a second, independent defence
     c         reviewcopy: 50 pass, 2 fail   one more than declared, same direction
     d         reviewcopy: 51 pass, 1 fail   the reads-nothing arm green, as declared
   The reasoning for each is in the suite's own NEGATIVE CONTROL header.

   RE-MEASURED 2026-09-18 by REC-133 (worktree agent-a6516bd6e484436ba), all nine arms,
   every restore sha256 MATCH / content IDENTICAL / size ok:
     baseline  reviewcopy: 63 pass, 0 fail
     a         reviewcopy: 58 pass, 5 fail   +1: the administrator-revoked secret's byte-identical arm
     b         reviewcopy: 62 pass, 1 fail
     c         reviewcopy: 61 pass, 2 fail
     d         reviewcopy: 61 pass, 2 fail   +1: the same new arm
     e         reviewcopy: 61 pass, 2 fail   as declared (revoke re-gated at owner-only)
     f         reviewcopy: 62 pass, 1 fail   as declared (issue widened to editors)
     g         reviewcopy: 59 pass, 4 fail   as declared (authoring widened to any member)
     h         reviewcopy: 62 pass, 1 fail   as declared (dry run as the editor) */
