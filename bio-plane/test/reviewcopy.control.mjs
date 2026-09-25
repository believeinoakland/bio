/* REC-126's NEGATIVE CONTROL DRIVER — sixteen arms plus a baseline ((a)-(d) REC-126's, (e)-(h)
 * REC-133's, §6A.2's authority, (i)-(k) REC-198's, the list of a project's drafts, (l)-(n) REC-199's,
 * the copy saying `newCase` back, (o)-(p) D-538's, the identity sentence reading it), re-runnable in one step:
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
/* THE PEN. BOB #32 RULED ON 2026-09-24 that a scratch file belongs OUTSIDE the worktree — a file
   in it is WALKED by the repository-reading suites, trips `gates.mjs` §2e's under-inclusion check
   and makes the tree dirty, which is how D-293 refuses to record a green verdict (three items paid
   in one night; see `kickoffs/WORKER.md`). The default is unchanged, so no other lane's run moves;
   `BIO_NC_PEN` points it at the session scratchpad, which is how REC-199 ran it. */
const PEN = process.env.BIO_NC_PEN || join(ROOT, ".nc-reviewcopy");
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
       label: "(e) REVOKE WIDENED TO ADMINISTRATORS (§6A.2's first, corrected version): an administrator who is "
            + "not the owner withdraws a grant",
       apply: () => edit(STORE,
         "if (!g || !this.#isProjectOwner(g.project_id, a.who)) return Store.#notReviewOwner(\"revoke\");",
         "if (!g || !(this.#isProjectOwner(g.project_id, a.who) || this.#isAdminMember(a.who))) "
       + "return Store.#notReviewOwner(\"revoke\");") },

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

  /* REC-198 — the list of a project's drafts (BOB #32: fenced exactly like reading one). Declarations in the
     suite's header, made before arming. */
  i: { files: [STORE],
       label: "(i) THE FENCE DROPPED: the list answers any caller the op table admits, for any project that exists",
       apply: () => edit(STORE,
         "\n        || !this.#seesProjectDrafts(pid, viewer)) return Store.#noReviewCopy();",
         ") return Store.#noReviewCopy();") },

  j: { files: [STORE],
       label: "(j) THE LIAR'S SECOND FENCE: the list asks a COPY that agrees today on owner, editor and uninvited "
            + "member — joined participants only, as the ruling's parenthesis reads — instead of calling the fence",
       apply: () => edit(STORE,
         "\n        || !this.#seesProjectDrafts(pid, viewer)) return Store.#noReviewCopy();",
         "\n        || !this.#isProjectEditor(pid, String(viewer ?? \"\").replace(/^member:/, \"\"))) "
       + "return Store.#noReviewCopy();") },

  k: { files: [STORE],
       label: "(k) OVER-STRICTNESS: correct work in a spelling the suite did not write — the list's local `pid` "
            + "renamed `projectId` throughout — must PASS",
       apply: () => {
         const src = readFileSync(STORE, "utf8");
         const a = src.indexOf("  caseDraftList({ project = null");
         const b = src.indexOf("  /* ===== END REC-126", a);
         if (a < 0 || b < 0) throw new Error("ARM k: caseDraftList's span not found");
         const span = src.slice(a, b);
         const renamed = span.replace(/\bpid\b/g, "projectId");
         if (renamed === span || (span.match(/\bpid\b/g) || []).length < 4)
           throw new Error("ARM k: the rename matched too little to be an arm");
         if (DRY) { DRY.push({ file: STORE, needle: "  caseDraftList({ project = null" }); return; }
         writeFileSync(STORE, src.slice(0, a) + renamed + src.slice(b));
       } },

  /* REC-199 — `op=reviewcopy` answers `newCase` (BOB #32, 2026-09-23 23:08Z). Declarations in the
     suite's header, made before arming. */
  l: { files: [STORE],
       label: "(l) THE FIELD DROPPED: the copy stops saying `newCase` back, which is the state of the plane "
            + "before REC-199 — an edit written from the answer loses the draft's new-case intent",
       apply: () => edit(STORE,
         /* RE-ANCHORED by D-538: the identity line now passes the draft's `newCase` to the sentence. The arm
            still drops the FIELD alone; the sentence beside it is (o)'s subject, not this one's. */
         "              identity: Store.#caseIdentitySentence(ident.caseId, ident.edition, !!params.newCase),\n"
       + "              newCase: !!params.newCase },",
         "              identity: Store.#caseIdentitySentence(ident.caseId, ident.edition, !!params.newCase) },") },

  m: { files: [STORE],
       label: "(m) THE LIAR'S FIELD: `newCase` answered from the CASE IDENTITY (`!ident.caseId`) instead of "
            + "from the draft — free agreement wherever a new-case draft is looked at, and wrong about every "
            + "draft that named no case and asked for nothing",
       apply: () => edit(STORE,
         "              newCase: !!params.newCase },",
         "              newCase: !ident.caseId },") },

  n: { files: [STORE],
       label: "(n) OVER-STRICTNESS: correct work in a spelling this suite did not write — the same truthiness "
            + "as a ternary rather than `!!` — must PASS",
       apply: () => edit(STORE,
         "              newCase: !!params.newCase },",
         "              newCase: params.newCase ? true : false },") },

  /* D-538 — the identity sentence reads the draft's `newCase`. Declarations in the suite's header. */
  o: { files: [STORE],
       label: "(o) `newCase` IGNORED AGAIN: the sentence treats every draft naming no case as a new case, and "
            + "every draft naming one as its next edition — the plane exactly as it stood before D-538",
       apply: () => edit(STORE,
         "  static #caseIdentitySentence(caseId, edition, newCase) {",
         "  static #caseIdentitySentence(caseId, edition, _ignored, newCase = !caseId) {") },

  p: { files: [STORE],
       label: "(p) OVER-STRICTNESS: the derived sentence REWORDED, saying the same two facts (derived at "
            + "publication; undetermined here) in words this suite did not write — must PASS",
       apply: () => edit(STORE,
         "    return \"a case this draft does not name and publication DERIVES, so which case it is stays UNDETERMINED \"",
         "    return \"an undetermined case: publication will derive it from the record, since this draft names none \"\n"
       + "         + \"and asks for no new one; until then \"") },
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
     a         reviewcopy: 58 pass, 5 fail   +1: the owner-revoked G3 secret's byte-identical arm
     b         reviewcopy: 62 pass, 1 fail
     c         reviewcopy: 61 pass, 2 fail
     d         reviewcopy: 61 pass, 2 fail   +1: the same new arm
     e         reviewcopy: 61 pass, 2 fail   revoke widened to administrators: the admin-refusal arm, and the
                                             owner-revokes arm after it (revokedBy reads omar) — one more than declared
     f         reviewcopy: 62 pass, 1 fail   as declared (issue widened to editors)
     g         reviewcopy: 59 pass, 4 fail   as declared (authoring widened to any member)
     h         reviewcopy: 62 pass, 1 fail   as declared (dry run as the editor)

   RE-MEASURED 2026-09-23 by WORKER REC-198 (BOB #32's list of a project's drafts), ALL TWELVE rows in one driver run,
   every restore sha256 MATCH / content IDENTICAL / size ok (11 of 11):
     baseline  reviewcopy: 77 pass, 0 fail
     a         reviewcopy: 72 pass, 5 fail   unchanged count
     b         reviewcopy: 76 pass, 1 fail
     c         reviewcopy: 75 pass, 2 fail
     d         reviewcopy: 75 pass, 2 fail
     e         reviewcopy: 75 pass, 2 fail
     f         reviewcopy: 76 pass, 1 fail
     g         reviewcopy: 69 pass, 8 fail   +4 over REC-133's figure, all block 9's: authoring widened to any member lets
                                             vic, omar and pat write drafts into PROJ, so the owner's and the editor's
                                             lists, the rows-open count and the bite's total read more than the seven
                                             authorised — the list SEEING the widening, in the declared direction
     h         reviewcopy: 76 pass, 1 fail
     i         reviewcopy: 71 pass, 6 fail   as declared (the fence dropped; the uninvited arm fails by name)
     j         reviewcopy: 74 pass, 3 fail   as declared (a second, joined-only fence: the admission table and structure)
     k         reviewcopy: 77 pass, 0 fail   as declared (over-strictness: a renamed local passes) 

   RE-MEASURED 2026-09-24 by REC-199 (cloud, CONDUCT #20), all FOURTEEN arms, pen in the session
   scratchpad via `BIO_NC_PEN`, every restore of a 3,287,730-byte `store.mjs` sha256 MATCH / content
   IDENTICAL / size ok:
     baseline  82/0
     a 77/5   b 81/1   c 80/2   d 80/2   e 80/2   f 81/1   g 74/8   h 81/1
     i 76/6   j 79/3   k 82/0
     l 79/3   the field dropped — as declared, and the fork and trip-lands arms GREEN
     m 80/2   the liar agreed for free on the draft the round trip reads; the says-back and fixed-point
              arms are what caught it — recorded because it is the arm's finding, not a shortfall
     n 82/0   the unanticipated spelling passes
   Every (a)-(k) failure count is REC-198's, unchanged; the three new arms of block 10 are the only movement.

   RE-MEASURED 2026-09-24 by WORKER D-538 (cloud), all SIXTEEN arms against the FINAL store, pen in the session
   scratchpad via `BIO_NC_PEN`, every restore of a 3,331,204-byte `store.mjs` sha256 MATCH / content IDENTICAL /
   size ok:
     baseline  88/0
     a 83/5   b 87/1   c 86/2   d 86/2   e 86/2   f 87/1   g 80/8   h 87/1
     i 82/6   j 85/3   k 88/0   l 85/3 (re-anchored on the identity line)   m 86/2   n 88/0
     o 85/3   `newCase` ignored again — block 2's corrected arm, ACCEPTS-WHEN and the names-C1-and-asks-new arm;
              the new-case-kept arm GREEN, the liar agreeing for free on the one draft it is right about
     p 88/0   the reworded derived sentence passes
   Every (a)-(n) failure count is REC-199's, unchanged; block 11's six arms are the only movement.
*/
