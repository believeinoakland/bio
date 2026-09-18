/* CASE-5b's NEGATIVE CONTROL DRIVER — five arms plus a baseline, and REC-130's four
 * (e)-(h) at the foot of the table, re-runnable in one step:
 *
 *     node test/casesign.control.mjs            # every arm, in order
 *     node test/casesign.control.mjs a          # one arm
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
 *   (a) is the arm this item exists for: if a case assertion arrives at the
 *       commit from an UNSIGNED request, is it REFUSED BY NAME — or written?
 *   (b) is the queue row's second arm, and it is the one that proves the ORDER
 *       of this item: strip the keys WITHOUT the ceremony's fence and (a)'s
 *       question stops being askable, because nothing refuses a member that
 *       asserts a case for itself.
 *   (2b) asks the same thing one level deeper — remove the CEREMONY rather than
 *       its fence, which is the tree as it would be if the deletion had been done
 *       first. **IT IS NUMBERED `2b` AND NOT `b2`, AND THAT IS A RECEIPT RATHER
 *       THAN A PREFERENCE:** `control-register.mjs`'s `OPENS_ITEM` grammar
 *       accepts `(<digits><letters>)` and `(<one or two letters>)`, so `(b2)` —
 *       letter then digit — opens no list item, ENDS the declaration's paragraph,
 *       and silently drops every arm after it. MEASURED: the register read 886
 *       arms against a floor of 888 and NAMED the shrink, which is the floor
 *       doing exactly the job D-233 built it for.
 *   (c) asks the question a control usually forgets — is the fence WIDER than
 *       the rule? Correct work in a spelling this item did not anticipate must
 *       still pass.
 *   (d) asks whether the PIN is what resolves a member, or whether the id alone
 *       would do — because if the id alone does, the freeze is decoration.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { preflight } from "../scripts/armdecay.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-casesign");            /* inside this worktree, rule 1 */
const STORE = join(ROOT, "src", "store.mjs");
const INDEX = join(ROOT, "src", "index.mjs");
const CHECKS = join(ROOT, "checks", "bio-checks.mjs");
const SUITE = join(DIR, "casesign.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;                                /* a "restore" of a truncated file is not a restore */

/* ONE UNIQUE STRING REPLACEMENT PER EDIT, and it THROWS if the needle is absent
   or ambiguous. An arm that silently edited nothing is an arm that reports the
   subject as unbreakable, which is the one wrong answer a control can give.

   D-331, 2026-09-14 — THE DRY MODE. M0-25's census measured this driver's shape
   as one of the three that THROW on a zero-match anchor, which means one dead
   anchor takes every arm behind it down unrun and unreported (this driver's own
   arm (d) note records exactly that happening: a stale anchor "made `edit()`
   THROW and took arms (e) and (f) down with it unrun"). With `DRY` set, `edit()`
   RECORDS the (file, needle) pair and writes nothing, so every arm's own
   `apply()` is run as a dry pass and the WHOLE anchor table is reported before a
   byte moves. The throw is KEPT for the real pass: a half-armed tree is still
   never measured. */
let DRY = null;
const edit = (file, needle, replacement) => {
  if (DRY) { DRY.push({ file, needle }); return; }
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes five-arms-working from five-arms-broken",
              apply: () => {} },

  a: { files: [INDEX],
       label: "(a) THE ARM THIS ITEM EXISTS FOR: a case assertion arrives at the commit from an UNSIGNED "
            + "request. The control plane still verifies the signature and still refuses a bad one — only "
            + "the PASSING of it to the committer is removed — so what this measures is the committer's own "
            + "fence, `CASE_UNSIGNED`, which no caller route can otherwise reach",
       apply: () => edit(INDEX,
         "          sigArmored: body.sig, attestorKey: sv.keyB64,",
         "          attestorKey: sv.keyB64,") },

  b: { files: [CHECKS],
       label: "(b) STRIP THE KEYS WITHOUT THE CEREMONY'S FENCE — the queue row's second arm, and the one "
            + "that proves the ORDER. Neuter the C-2.8 arm that refuses the eight case keys in a finding's "
            + "bytes, leaving the ceremony itself standing. A member can then assert its own case identity, "
            + "roster, scope, bar and acknowledgement in bytes nobody reviewed at case altitude, and "
            + "NOTHING refuses it — which is what the deletion looks like when it is done first",
       apply: () => edit(CHECKS,
         "  for (const k of ['case_id', 'case_edition', 'case_project', 'case_scope', 'case_findings', 'case_roles',\n"
       + "                   'bias_acknowledgement', 'required_strength']) {",
         "  for (const k of []) {") },

  /* (2b) IS THE QUEUE ROW'S SECOND ARM IN ITS MOST LITERAL READING, and it is
     kept BESIDE (b) rather than instead of it because the two ask the same
     question at two different depths. The row says: *"strip the six keys WITHOUT
     the ceremony and the unsigned-commit arm must fail — proving the ceremony is
     the precondition and not decoration."* (b) neuters the FENCE that keeps a
     member from asserting a case in its own bytes, which is the half a caller can
     attack. (2b) removes the CEREMONY ITSELF — op=publish stops authoring a case
     document — leaving the deletion standing entirely alone, which is exactly the
     state the tree would be in if this item had been done in the other order.
     WHAT IT MEASURES IS AN ABSENCE RATHER THAN A REFUSAL, and that is the point:
     with the keys gone and no document to sign, NO CASE FACT IS EVER COMMITTED BY
     ANY ROUTE. `CASE_UNSIGNED` cannot fire because nothing reaches the committer;
     `op=caseratify` has nothing to read. A published case simply does not exist.
     So the ceremony is not a fence in front of the deletion — it is the only
     thing that makes the deletion representable, and an arm that expected a named
     refusal here would be looking for a door in a wall with no room behind it. */
  "2b": { files: [STORE],
        label: "(2b) THE DELETION STANDING ENTIRELY ALONE — remove the CEREMONY, not its fence: op=publish "
             + "stops authoring a case document while the eight keys stay gone from member bytes. No case "
             + "fact is committed by any route, so the case never exists and the unsigned-commit arm has "
             + "nothing to refuse. This is the tree as it would be if the deletion had been done first",
        apply: () => edit(STORE,
          "    this.sql.exec(\n"
        + "      `INSERT INTO case_documents (case_id,edition,doc_sha,text,authored_at,authored_by)",
          "    if (false) this.sql.exec(\n"
        + "      `INSERT INTO case_documents (case_id,edition,doc_sha,text,authored_at,authored_by)") },

  /* ===== (c) WAS ARMED IN THE WRONG DIRECTION ON ITS FIRST RUN AND CAME BACK
     GREEN — 50 pass, 0 fail — AND THE CORRECTION IS WORTH MORE THAN THE ARM.
     The first (c) added `if (!caseEditionClaimed(fm)) return false;` to
     `isCaseMemberBytes`, meaning to make the gate demand a `case_edition` again.
     What it ACTUALLY did was make the predicate false for every published member,
     so `checkPublishedExtension` stopped running at all: it LOOSENED the gate
     instead of tightening it, and a loosened gate refuses nothing, which is why
     the suite stayed green. That is an instrument defect rather than a defence
     holding — the same shape CASE-5's own over-strictness arm hit — and it is
     recorded here rather than smoothed, because an arm running green for the
     wrong reason is precisely what an over-strictness arm exists to catch in the
     SUBJECT.
     THE ARM IT WAS REPLACED WITH is over-strictness in the direction this item
     could most plausibly have got wrong: refusing an ABSENT bar. *An absent bar is
     not a bar of zero* is doctrine (DEC-72, and the design doc's own clause on
     publishing where no bar was ever declared), and a gate demanding
     `declared: true` would refuse every case published by a project that never
     set a standard — pressuring a group into declaring one so they can publish,
     which is the bug-in-the-gate shape CLAUDE.md names by that name. */
  c: { files: [CHECKS],
       label: "(c) OVER-STRICTNESS — the direction a control usually forgets, and the direction this item "
            + "could most plausibly have got wrong: make the case document's bar arm demand a DECLARED bar "
            + "rather than a STATED one. Every case published by a project that never set a standard is then "
            + "refused, which would pressure a group into declaring one so they can publish. An absent bar "
            + "is not a bar of zero, and this arm is red when the gate forgets that",
       apply: () => edit(CHECKS,
         "  if (!rq || typeof rq.declared !== 'boolean') {",
         "  if (!rq || rq.declared !== true) {") },

  d: { files: [STORE],
  /* (d)'s FIRST DRAFT DELETED THE PIN CLAUSE AND LEFT ITS BOUND PARAMETER BEHIND,
     so the statement failed to prepare and the arm measured a SQL error —
     `STORE_DID_NOT_ANSWER` — rather than the plane. A crash is not a
     measurement: it is indistinguishable from any other way of breaking the
     store, so it could not tell whether the PIN is what resolves a member. The
     predicate is OR-ed away instead, which leaves the parameter bound and the
     statement valid while making the match id-only, which is the question. */
       label: "(d) THE PIN IS NOT WHAT RESOLVES A MEMBER: widen the roster match to `bundle_id` alone, by "
            + "OR-ing the pin predicate away rather than deleting it — the first draft deleted the clause "
            + "and left the bound parameter behind, so the arm measured a SQL error instead of the plane. "
            + "Every member still lands in its case, so the happy path is untouched — what goes is the "
            + "property that makes the freeze mean anything, since a finding revised after publication "
            + "would then be resolved into the case at whatever version it happens to hold now",
     /* RE-ANCHORED 2026-09-13 BY M0-25's ARM-LIVENESS CENSUS, AND THE FINDING IS
        KEPT: **THIS ARM HAD STOPPED ARMING ON `main`, ON WHITESPACE ALONE.** The
        anchor carried TEN leading spaces, the indentation this clause had when
        case-5b wrote it (`808342f`). `d720333` (D-309, "a finding may serve many
        cases") moved the query into `#pinnedCaseEditionsOf` and re-indented it to
        EIGHT. Nothing about the statement changed — same columns, same predicate,
        same bound parameters — and the arm has matched zero times ever since,
        which made `edit()` THROW and took arms (e) and (f) down with it unrun.
        Measured: the 8-space form occurs exactly once in `src/store.mjs`, the
        10-space form zero times; `git log -S` names `808342f` as its author and
        `d720333` as the commit that removed it.
        **THE POINT WORTH CARRYING: two spaces disarmed a control.** The OR-ing
        form is kept exactly as it was — the header above records why deleting the
        clause instead measured a SQL error rather than the plane — so only the
        indentation moved. */
       apply: () => edit(STORE,
         "        WHERE m.bundle_id=? AND m.version_sha=?\n",
         "        WHERE m.bundle_id=? AND (m.version_sha=? OR 1=1)\n") },

  /* ===== REC-130's FOUR ARMS, 2026-09-18. The subject is ONE LINE in
     `caseDocumentFacts`, so every arm edits that line or the predicate it calls,
     and each asks a different question of it. */
  e: { files: [STORE],
       label: "(e) THE STANDING CHECK REMOVED — the tree as CASE-5b left it. An unsigned case document "
            + "answers anybody again, so every stranger arm in block 1b (anonymous, unknown token, member of "
            + "another project, probe, another member's agent) and the op=caseratify oracle arm must FAIL",
       apply: () => edit(STORE,
         "    if (!doc.ratified_at && !this.#hasCaseStanding(doc, viewer)\n"
       + "        && !this.#grantAdmitsCaseEdition(secretSha, doc.case_id, doc.edition))\n"
       + "      return Store.#noCaseDocument(id, ed);",
         "    if (false) return Store.#noCaseDocument(id, ed);") },

  /* REC-126, 2026-09-18: arms (e), (f) and (g) RE-ANCHORED, not re-thought. The
     gate line they arm gained a third clause — a LIVE REVIEW GRANT for exactly
     this case edition is the second party the design's precondition admits — and
     the single line was split over three. Each arm makes the SAME edit it always
     made (remove the gate; answer NOT_PERMITTED; drop the ratified test), carried
     over the new text, and all three were re-run after the move. */
  f: { files: [STORE],
       label: "(f) THE LIAR — a DISTINGUISHABLE refusal. The text is still withheld from every stranger, but "
            + "the answer says NOT_PERMITTED instead of what a missing case says, so an enumerator walking the "
            + "sequence learns exactly which ids are live. The byte-for-byte arms must FAIL; an arm that only "
            + "checked the text was withheld would stay green, which is why none of them does",
       apply: () => edit(STORE,
         "    if (!doc.ratified_at && !this.#hasCaseStanding(doc, viewer)\n"
       + "        && !this.#grantAdmitsCaseEdition(secretSha, doc.case_id, doc.edition))\n"
       + "      return Store.#noCaseDocument(id, ed);",
         "    if (!doc.ratified_at && !this.#hasCaseStanding(doc, viewer)\n"
       + "        && !this.#grantAdmitsCaseEdition(secretSha, doc.case_id, doc.edition))\n"
       + "      return { ok: false, reason: \"NOT_PERMITTED\", caseId: id, edition: ed };") },

  g: { files: [STORE],
       label: "(g) OVER-STRICTNESS ON THE SIGNED SIDE — the gate applied to a RATIFIED document too. The "
            + "stranger-verification path then depends on this instance's goodwill; the signed-public arms "
            + "must FAIL while every unsigned-side arm stays green",
       apply: () => edit(STORE,
         "    if (!doc.ratified_at && !this.#hasCaseStanding(doc, viewer)\n"
       + "        && !this.#grantAdmitsCaseEdition(secretSha, doc.case_id, doc.edition))\n"
       + "      return Store.#noCaseDocument(id, ed);",
         "    if (!this.#hasCaseStanding(doc, viewer)\n"
       + "        && !this.#grantAdmitsCaseEdition(secretSha, doc.case_id, doc.edition))\n"
       + "      return Store.#noCaseDocument(id, ed);") },

  h: { files: [STORE],
       label: "(h) OVER-STRICTNESS ON THE UNSIGNED SIDE — standing narrowed to the instance-level machine "
            + "credential, so no identified member reads the document they are about to sign. The owner, the "
            + "administrator, the participant and the owner's agent arms must FAIL (and the ceremony cannot "
            + "proceed past them); the stranger arms stay green, which is why they cannot be the only arms",
       apply: () => edit(STORE,
         "    if (gate.scope === \"member\") return true;\n    const named =",
         "    if (gate.scope === \"member\") return true;\n    if (gate.scope === \"participant\") return false;\n    const named =") },
};

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

/* ---------------------------------------------------- D-331 · THE PREFLIGHT
   Every arm's anchor counted in the file that arm will write, and the WHOLE
   table printed, BEFORE anything is armed. The report covers every arm even when
   one is selected on the command line; the refusal is scoped to the arms this
   invocation runs, so a stale arm cannot stop a healthy one being driven. */
const preflightArms = [];
for (const name of Object.keys(ARMS)) {
  DRY = [];
  try { ARMS[name].apply(); } catch (e) { console.log(`  (arm ${name} could not be dry-run: ${e.message})`); }
  preflightArms.push({ id: name, anchors: DRY });
  DRY = null;
}
preflight("casesign.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

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
    tally = (/casesign: (\d+) pass, (\d+) fail/.exec(out) || [])[0]
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
