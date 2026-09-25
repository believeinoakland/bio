/* NEGATIVE CONTROL: (declared before arming; the run's figures are filled in below from what the suite printed)
   (0) BASELINE, nothing armed. MUST be green.
   (a) THE ROW'S OWN CONTROL — BIND BY STATEMENT BYTES INSTEAD OF THE NAMED DRAFT: in `#statementAcknowledgements`
       the link arm `(case_id IS NULL AND draft_id = ?)` becomes `(case_id IS NULL AND ? <> '')`, so a case
       document naming ANY draft lists every same-sentence reading recorded at no case identity. DECLARED: MUST
       FAIL block 3's "THE TWIN ... lists NOBODY" row BY NAME (the twin lists ella); MUST NOT fail block 1's
       accepts-when rows or block 2's undetermined row.
   (b) THE LINK DROPPED — `op=publish` ignores `draft=` (`boundDraft` never set). DECLARED: MUST FAIL block 1's
       accepts-when rows (the list is empty and the reading is counted undetermined); MUST NOT fail block 2.
   (c) OVER-STRICTNESS — the draft door keeps REC-194's "a draft naming no case reaches NOTHING" (`found` asks
       `case_id IS ?` alone). DECLARED: MUST FAIL block 4's post-publication rows (participant and recipient);
       MUST NOT fail blocks 1-3.
   Every restore by `cp` from a uniquely-named per-arm pristine copy in the session scratchpad, verified by
   sha256 AND `cmp`, never `git checkout --`.
   CONTROL RUN 2026-09-24 by the REC-217 worker on land/worker/REC-217, each arm ALONE on `src/store.mjs` (the suite
   runs `src/index.mjs` directly, so no bundle is in the loop); every restore `sha256sum -c` OK (1dcfc508…a4d960) and
   `cmp` identical, 3,336,642 bytes:
   (0) BASELINE 23 pass, 0 fail.
   (a) 20 pass, 3 FAIL — block 3's "THE TWIN ... lists NOBODY" BY NAME, as declared; blocks 1 and 2 GREEN, as
       declared. The two further FAILs were not in the declaration and are the same defect seen from two more rows,
       recorded rather than smoothed: block 3's next row (the byte-bound twin also stops printing "Nobody but its
       author") and block 6's (a second draft of one sentence then lists the reading of the FIRST draft too).
   (b) 8 pass, 15 FAIL — every block-1 accepts-when row, block 3's, block 4's and block 6's (each needs the link),
       and block 5's ALREADY_BOUND row (nothing was bound to refuse); block 2 GREEN, as declared.
   (c) 19 pass, 4 FAIL — exactly block 4's four post-publication rows (participant, recipient, re-authored bytes,
       the stale-then-fresh ratify); blocks 1-3, 5 and 6 GREEN, as declared.
   ALL THREE AS DECLARED, with (a)'s two extra rows stated above.
   THE SUBJECT CHANGED AFTER THE CONTROL: the gate's `bounds.test.mjs` refused a SQL literal (`LIMIT 1`) inside
   `acknowledgeStatement` — this item's own read of the draft's link — so that read moved to `#draftLinkOf`. Arm (b)
   was RE-RUN ALONE on the changed `src/store.mjs` (restored `sha256sum -c` OK e52d8160…0786c9, `cmp` identical,
   3,337,185 bytes): 8 pass, 15 FAIL, the same fifteen rows, block 2 GREEN — the control still bites.

   D-626 NEGATIVE CONTROL (block 7; declared before arming, each arm ALONE on `src/store.mjs` or
   `checks/bio-checks.mjs`, restored by `cp` from a per-arm pristine copy, `cmp` identical, sha256 c1a6c2a7…
   3,472,824 bytes and 2c6b96a8… 1,006,280 bytes):
   (0) BASELINE 28 pass, 0 fail.
   (a) THE ROW'S OWN CONTROL — `newCase` dropped from is-publish-draft-this-case's `#caseIdentitySentence` call.
       DECLARED: MUST FAIL block 7's two new-case rows (boolean and string spellings) BY NAME; MUST NOT fail the
       derivation, C-87.6 or acknowledgement rows. RAN 26 pass, 2 FAIL — exactly those two. AS DECLARED.
   (b) `newCase` dropped from `acknowledgeStatement`'s `listed` call. DECLARED: MUST FAIL the acknowledgement row
       alone. RAN 27 pass, 1 FAIL — that row. AS DECLARED.
   (c) OVER-STRICTNESS — `newCase === true` in place of truthiness. DECLARED: MUST FAIL the string-spelling row
       alone. RAN 27 pass, 1 FAIL — that row. AS DECLARED.
   (d) C-87.6's translation reverted to "Leave the name off and the draft is a new case." DECLARED: MUST FAIL the
       C-87.6 row alone. RAN 27 pass, 1 FAIL — that row. AS DECLARED.

   D-680 NEGATIVE CONTROL (blocks 7 and 8; BOB #35 2026-09-25 07:35Z; declared before arming, each arm ALONE on
   `src/store.mjs`, restored by `cp` from a per-arm pristine copy, `sha256sum -c` OK 3ed5b3a6…8de5 and `cmp`
   identical, 3,479,349 bytes):
   (0) BASELINE 39 pass, 0 fail.
   (a) THE ROW'S OWN CONTROL — `predicted !== 1` restored for the derivation arm of is-publish-draft-this-case.
       DECLARED: MUST FAIL block 8's ACCEPTS-WHEN row BY NAME; MUST NOT fail blocks 1-6. RAN 27 pass, 8 FAIL and
       FIXTURE ABORTED: the ACCEPTS-WHEN row BY NAME, with its dependents (the derived-case answer, the draft door,
       the signed list, the signed document, the public read) and block 7's derivation row (C1 named: refused
       NOT_THIS_CASE); then the second reopen aborts, because a finding edition 2 never published is not
       reopenable. Blocks 1-6 GREEN. AS DECLARED, the abort recorded rather than smoothed.
   (b) is-publish-draft-derived-case disarmed (a named case that is not the derived one accepted). DECLARED: MUST
       FAIL block 7's derivation row and block 8's C-44.6 row. RAN 35 pass, 4 FAIL — those two, and the liar's own
       write cascading: the mismatched act PREPARED Q8 into C1, so the new-case act meets that unsigned preparation
       (ALREADY_A_CASE_MEMBER) and the no-case row loses its second case. Accepts-when GREEN.
   (c) OVER-STRICTNESS — the `!newCase` exemption dropped, so a publisher asking for a new case is refused. DECLARED:
       MUST FAIL block 8's new-case row and the no-case row that rests on it; MUST NOT fail accepts-when. RAN 37
       pass, 2 FAIL — exactly those. AS DECLARED.
   (d) `edition=?` restored over the link arm of `#statementAcknowledgements`. DECLARED: MUST FAIL block 8's
       ACCEPTS-WHEN and signed-list rows; MUST NOT fail blocks 1-7. RAN 36 pass, 3 FAIL — those two and the draft
       door's (it counts one reading, not two). Blocks 1-7 GREEN.
   (e) `edition=?` restored over the draft arm of `acknowledgeStatement`'s document read. DECLARED: MUST FAIL block
       8's draft-door row; MUST NOT fail block 4. RAN 37 pass, 2 FAIL — the draft door and the signed list that
       rests on it. Block 4 GREEN.

   D-683 NEGATIVE CONTROL (block 9; declared before arming, each arm ALONE on `src/store.mjs`, restored by `cp` from a
   per-arm pristine copy, `sha256sum -c` OK 6b496324…, `cmp` identical, 3,479,680 bytes):
   (0) BASELINE 41 pass, 0 fail. (Before the fix, driven through op=publish: 40 pass, 1 FAIL — block 9's ACCEPTS-WHEN,
       got a count of none and "Nobody but its author" on edition 2.)
   (a) THE ROW'S OWN CONTROL — `edition=?` restored on the unbound count's `case_id IS NULL` arm. DECLARED: MUST FAIL
       block 9's ACCEPTS-WHEN BY NAME; MUST NOT fail blocks 1-8. RAN 40 pass, 1 FAIL — exactly that row. AS DECLARED.
   (b) OVER-STRICTNESS — the count spelled `edition=1`, the edition D-568 records every no-case reading at. DECLARED:
       MUST PASS every row (the suite asserts the count, not the predicate's shape). RAN 41 pass, 0 fail. AS DECLARED.

   D-703 NEGATIVE CONTROL (block 9's writer row; declared before arming, each arm ALONE on `src/store.mjs`, restored by
   `cp` from a per-arm pristine copy, `sha256sum -c` OK 79aaa1d0…3dedd, `cmp` identical, 3,480,624 bytes):
   (0) BASELINE 42 pass, 0 fail. (Before the fix, driven through op=publish: 41 pass, 1 FAIL — the D-703 ACCEPTS-WHEN,
       got statement_by "iris" in the answer and the signed bytes, and "iris wrote this exclusion statement in the act
       that published this case".)
   (a) THE ROW'S OWN CONTROL — `&& Number(edition) === 1` restored on `#statementWriter`'s no-case arm of `here`.
       DECLARED: MUST FAIL the D-703 ACCEPTS-WHEN BY NAME; MUST NOT fail any other row. RAN 41 pass, 1 FAIL — exactly
       that row. AS DECLARED.
   (b) OVER-STRICTNESS — `here` spelled `d.case_id == null || d.case_id === caseId`. DECLARED: MUST PASS every row.
       RAN 42 pass, 0 fail. AS DECLARED.

   D-725 NEGATIVE CONTROL (block 10; declared before arming, each arm ALONE on `src/store.mjs`, restored by `cp` from a
   per-arm pristine copy, `sha256sum -c` OK 9935f0a6…abeb59b, `cmp` identical, 3,481,597 bytes):
   (0) BASELINE 44 pass, 0 fail. (Before the fix, driven through op=publish: 42 pass, 2 FAIL — both block-10 rows: the
       named draft by pat beside ella's same-bytes draft for another case got statement_by null and "UNDETERMINED: 2
       drafts"; the named draft holding other bytes got statement_by "ella", the foreign draft's author, signed.)
   (a) THE ROW'S OWN CONTROL — `#statementWriter` reads every project draft again (`const rows = named` spelled
       `const rows = false`). DECLARED: MUST FAIL both block-10 rows BY NAME; MUST NOT fail any other row. RAN 42 pass,
       2 FAIL — exactly those. AS DECLARED.
   (b) OVER-STRICTNESS — the named draft read by filtering the project's bounded set in JS instead of by `draft_id=?`.
       DECLARED: MUST PASS every row. RAN 44 pass, 0 fail. AS DECLARED.

   REC-217 / BIO_Publication_v0_1.md §3 rules 11 and 13 — BOB #33 RULED 2026-09-24 19:14Z: `op=publish` NAMES THE
   DRAFT IT PUBLISHES (`draft=`, optional, additive), and AT THAT ACT the readings taken through that draft BIND to
   the case it produced. The link is an ACT, recorded with who made it (the publisher) and when, and the case
   document states it in words — "readings given on draft <id>, which <publisher> named as this case's draft at
   publication" — so a signature covers a link whose author is named, not an inference. Without `draft=`,
   REC-194's provisional STANDS: an unbindable reading is counted and stated UNDETERMINED, never named.

   EVERY BLOCK IS DRIVEN THROUGH THE CONTROL PLANE (`op=casedraft`, `op=reviewgrant`, `op=statementack`,
   `op=publish`, `op=casedocument`, `op=caseratify`, `op=publishedcase`, `op=reviewcopy`), never the store:
     1. ACCEPTS-WHEN: a participant's and a review-copy RECIPIENT's readings of a NEW case's draft appear in the
        published case's SIGNED list, each marked with the draft, with the link stated in the frontmatter and in
        the ruling's own words in the prose — and the public read serves both, committed from the signed bytes;
     2. WITHOUT `draft=` REC-194's undetermined count STANDS (the measured failure this row moves);
     3. THE TWIN: another case whose statement is BYTE-IDENTICAL, published naming ITS OWN draft, lists NOBODY —
        the named draft binds, the sentence does not (the row's negative control fails exactly here);
     4. THE DRAFT DOOR AFTER PUBLICATION: a reading given through the named draft while its case document is
        unsigned re-authors that document — for a RECIPIENT too, which is REC-194's reported gap closed;
     5. THE THREE REFUSALS, each by its catalogue row, each leaving the finding unprepared;
     6. A READING OF ONE SENTENCE ON TWO DRAFTS IS TWO READINGS (the idempotence key this landing corrected).

   WHAT A LIAR WOULD DO: bind by the statement's bytes (block 3 fails); accept `draft=` and bind nothing (block 1
   fails); bind and never say so (block 1's prose and frontmatter rows fail); bind the draft door only before
   publication (block 4 fails). EXPECTATIONS ARE NOT DERIVED FROM THE THING UNDER TEST: every statement is a
   string this suite passed in and every fingerprint is computed here with node:crypto. */

import { withSurfacingRun } from "./surfacing-run.mjs";
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { parseFrontmatter, CASE_DERIVATION_CHECKS } from "../checks/bio-checks.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- rec217-draft-binding ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("rec217-draft-binding: SKIPPED — ssh-keygen not on PATH; the binding is asserted in a case document "
    + "a member really signed");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r217", MEMBER_TOKEN: "mem-r217", PROBE_TOKEN: "prb-r217", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const bail = (what, r) => {
  console.log(`  FAIL  (fixture) ${what}: ${JSON.stringify(r).slice(0, 700)}`);
  fail++;
  console.log(`\nrec217-draft-binding: ${pass} pass, ${fail} fail  [FIXTURE ABORTED]`);
  mf.dispose().then(() => process.exit(1));
  throw new Error("fixture");
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const ack = async (q) => rP(await POST(`op=statementack&${q}`, {}));

/* ---- keys and roster ---- */
const dir = mkdtempSync(join(tmpdir(), "rec217-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
const signCase = (who, caseId, edition, docSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify-case ${caseId} ${edition} ${docSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-r217",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  if (!add?.ok || !add.invite) bail(`memberadd ${memberId}`, add);
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
await enrol("nadia", "nadia-passphrase-217", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-217", "admin", ["contribute", "publish"]);
/* iris OWNS both projects, writes every statement and signs; ella and pat are JOINED participants of PROJ. */
const IRIS = await enrol("iris", "iris-passphrase-217", "member", ["contribute", "publish"]);
const ELLA = await enrol("ella", "ella-passphrase-217", "member", ["contribute", "publish"]);
const PAT = await enrol("pat", "pat-passphrase-217", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-r217", { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));

const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r217", owner: "iris",
  name: "PROJ-2026-2170-named-draft", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
const OTHER = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r217", owner: "iris",
  name: "PROJ-2026-2171-other", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
for (const [h, tok] of [["ella", ELLA], ["pat", PAT]]) {
  const inv = rP(await GET(`op=projectinvite&token=${IRIS}&projectId=${encodeURIComponent(PROJ)}&handle=${h}`));
  if (!inv?.ok) bail(`projectinvite ${h}`, inv);
  const jn = rP(await GET(`op=projectjoin&token=${tok}&projectId=${encodeURIComponent(PROJ)}`));
  if (jn?.state !== "joined") bail(`projectjoin ${h}`, jn);
}

/* ---- the corpus: d150's shapes, lifted rather than invented ---- */
let snapSeq = 0;
const promote = async (id, text, objectType, state) => rP(await POST("op=promote&token=adm-r217", {
  bundleId: id, base: null,
  snapKey: `20260924T${String(400000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: "2026-07-01T00:00:00Z", last_updated: "2026-07-02T00:00:00Z" },
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: [],
}));
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiryMd = (id, question, info) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", `  - target: ${info}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${info}`, "    role: supports", "    grade: D",
  "    grade_axis: connection", "    grade_source: testimony",
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const INFO = "INFO-2026-2170-memo";
if ((await promote(INFO, infoMd(INFO), "information", "collected")).ok === false) bail("promote info", {});
const finding = async (tag) => {
  const id = `INQ-2026-2170-${tag}`;
  const r = await promote(id, withAdoptableReading(inquiryMd(id, `Was ${tag} authorised?`, INFO)), "inquiry", "open");
  if (r.ok === false) bail(`promote ${id}`, r);
  const c = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(id)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id}.`)}` + adoptedVersionParam()));
  if (!c.ok) bail(`conclude ${id}`, c);
  return id;
};
const args = (project, tag, over = {}) => ({
  project, scope: `Whether the transfer was authorised (${tag}).`,
  statement: `This case covers the FY2024 transfer only (${tag}); the FY2023 memo is out of it.`,
  excluded: [{ target: null, description: `the FY2023 memo (${tag})`, reason: "a records request is outstanding" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: `We put the claims to the City Administrator (${tag}).`,
  biasAcknowledgement: `This group holds that transfers should be adopted in public (${tag}).`,
  ...over,
});
const withRoles = (b) => ({ ...b, roles: allLoadBearing(b) });
const fmOf = (text) => parseFrontmatter(text || "").data || {};
const docOf = async (caseId, edition) => rP(await GET(`op=casedocument&case=${caseId}&edition=${edition}&token=${IRIS}`));
const ratify = async (caseId, edition, docSha) =>
  rP(await POST(`op=caseratify&token=${IRIS}`, { caseId, edition, expectedSha: docSha,
                                                  sig: signCase("iris", caseId, edition, docSha) }));
const draftOf = async (tag, targets, over = {}) => {
  const d = rP(await POST(`op=casedraft&token=${IRIS}`, withRoles({ ...args(PROJ, tag, over), targets })));
  if (!d?.ok) bail(`casedraft ${tag}`, d);
  return d.draftId;
};
const publish = async (tag, targets, extra = {}) =>
  rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(PROJ, tag), targets, ...extra })));
const LINK = (d) => `Readings given on draft ${d}, which iris named as this case's draft at publication`;

console.log("\n--- rec217-draft-binding ---");

/* =========================================================================== 1 */
console.log("\n--- 1. ACCEPTS-WHEN: a reading of a NEW case's draft reaches the signed list, the link stated ---");
const LEAD = await finding("lead");
const S1 = args(PROJ, "lead").statement;
const D1 = await draftOf("lead", [LEAD]);
const G1 = rP(await POST(`op=reviewgrant&token=${IRIS}`, { draft: D1, recipient: "Dana Ruiz, City Auditor's office" }));
if (!G1?.ok || !G1.secret) bail("reviewgrant D1", G1);
const A1 = await ack(`draft=${D1}&token=${ELLA}`);
const A2 = await ack(`draft=${D1}&secret=${encodeURIComponent(G1.secret)}`);
t("FIXTURE: ella and the recipient read the draft of a NEW case — recorded at no case identity, through D1",
  [A1?.ok, A1?.acknowledgement?.case_id, A1?.acknowledgement?.draft_id, A2?.ok, A2?.acknowledgement?.draft_id,
   A1?.bound_to_a_case],
  [true, null, D1, true, D1, false]);
const P1 = await publish("lead", [LEAD], { draft: D1 });
if (P1?.ok === false || !P1?.caseDocument?.doc_sha) bail("publish lead with draft", P1);
const C1 = P1.caseDocument.case_id;
t("op=publish NAMING the draft lists BOTH readings — ella and the recipient's grant — each marked with the draft, "
+ "and counts NONE as unbindable",
  [(P1?.completeness?.acknowledgements || []).map((a) => [a.kind, a.by, a.draft ?? null]),
   P1?.completeness?.acknowledgements_unbindable_to_this_case ?? 0],
  [[["participant", "ella", D1], ["recipient", G1.grantId, D1]], 0]);
t("and the answer states the link AS AN ACT: which draft, named by whom, when — the publisher, at this act",
  [P1?.completeness?.draft?.draft_id, P1?.completeness?.draft?.named_by,
   P1?.completeness?.draft?.named_at === P1?.at, P1?.completeness?.draft?.acknowledgements_bound],
  [D1, "iris", true, 2]);
{
  const doc = await docOf(C1, 1);
  const fm = fmOf(doc?.text);
  t("THE DOCUMENT'S FRONTMATTER carries the link beside its author — draft, draft_named_by, draft_named_at — and "
  + "its list marks each row with the draft",
    [fm.completeness?.draft, fm.completeness?.draft_named_by, fm.completeness?.draft_named_at === fm.completeness?.at,
     fm.completeness?.acknowledged, (fm.completeness_acknowledgements || []).map((a) => [a.by, a.draft])],
    [D1, "iris", true, 2, [["ella", D1], [G1.grantId, D1]]]);
  t("THE PROSE a member reviews says it in the ruling's own words, names each reader on the draft, and prints "
  + "neither the undetermined tail nor 'Nobody'",
    [(doc?.text || "").includes(LINK(D1)),
     (doc?.text || "").includes(`- ella, a participant of ${PROJ}, on ${A1.acknowledgement.at} — given on draft ${D1}`),
     (doc?.text || "").includes(`review grant ${G1.grantId}`),
     /UNDETERMINED: a case id is minted only by publication/.test(doc?.text || ""),
     /whether any of them is a reading of THIS case is UNDETERMINED/.test(doc?.text || ""),
     /Nobody/.test((doc?.text || "").split("**Who else read this statement.**")[1]?.split("## What Was Searched")[0] || "")],
    [true, true, true, false, false, false]);
  const r = await ratify(C1, 1, doc?.doc_sha);
  t("THE OWNER SIGNS THE STATED LINK: op=caseratify admits the bytes (C-41.10 over a list naming a recipient and a "
  + "participant, neither the statement's writer nor its publisher)",
    [r?.ok !== false, r?.reason ?? null], [true, null]);
  const pc = rP(await GET(`op=publishedcase&id=${C1}`));
  const comp = pc?.completeness ?? pc?.case?.completeness ?? {};
  t("THROUGH THE PUBLIC READ, committed FROM THE SIGNED BYTES: both readers with their draft, and the link with "
  + "its author and time",
    [(comp.acknowledgements || []).map((a) => [a.kind, a.by, a.draft ?? null]),
     comp.draft?.draft_id, comp.draft?.named_by, comp.draft?.named_at === fm.completeness?.draft_named_at],
    [[["participant", "ella", D1], ["recipient", G1.grantId, D1]], D1, "iris", true]);
}

/* =========================================================================== 2 */
console.log("\n--- 2. WITHOUT draft=, REC-194's undetermined count STANDS ---");
{
  const Q2 = await finding("plain");
  const D2 = await draftOf("plain", [Q2]);
  if (!(await ack(`draft=${D2}&token=${ELLA}`))?.ok) bail("ack D2", {});
  const P2 = await publish("plain", [Q2]);
  if (P2?.ok === false || !P2?.caseDocument?.doc_sha) bail("publish plain", P2);
  const doc = await docOf(P2.caseDocument.case_id, 1);
  t("the same act WITHOUT draft= lists nobody, COUNTS ella's reading as unbindable, states no link, and the "
  + "document says UNDETERMINED and not 'Nobody but its author' — the measured state this row moves, unmoved",
    [(P2?.completeness?.acknowledgements || []).length, P2?.completeness?.acknowledgements_unbindable_to_this_case,
     P2?.completeness?.draft ?? null, fmOf(doc?.text).completeness?.draft ?? null,
     /whether any of them is a reading of THIS case is UNDETERMINED/.test(doc?.text || ""),
     /Nobody but its author acknowledged it\./.test(doc?.text || ""),
     (doc?.text || "").includes("named as this case's draft at publication")],
    [0, 1, null, null, true, false, false]);
}

/* =========================================================================== 3 */
console.log("\n--- 3. THE TWIN: a BYTE-IDENTICAL statement under another named draft binds nothing ---");
{
  const QT = await finding("twin");
  /* The SAME sentence as block 1's, on purpose: `args(PROJ, "lead")` — asserted byte-identical from the strings. */
  const DT = await draftOf("twin", [QT], { statement: S1 });
  const copyT = rP(await GET(`op=reviewcopy&draft=${DT}&token=${IRIS}`));
  t("FIXTURE ARMS THE TRAP: the twin's draft holds block 1's sentence byte for byte (hash computed here), and "
  + "nobody has read the twin's draft",
    [copyT?.authored?.statement === S1, copyT?.statement_acknowledgements?.statement_sha === sha(S1),
     (copyT?.statement_acknowledgements?.acknowledgements || []).length],
    [true, true, 0]);
  const PT = await publish("twin", [QT], { draft: DT, statement: S1 });
  if (PT?.ok === false || !PT?.caseDocument?.doc_sha) bail("publish twin", PT);
  const doc = await docOf(PT.caseDocument.case_id, 1);
  t("THE TWIN, published naming ITS OWN draft, lists NOBODY — ella read block 1's draft, which carries the same "
  + "sentence and is another production; the named draft binds, the sentence does not",
    [(PT?.completeness?.acknowledgements || []).map((a) => a.by), fmOf(doc?.text).completeness?.acknowledged,
     PT?.completeness?.draft?.draft_id, PT?.completeness?.draft?.acknowledgements_bound],
    [[], 0, DT, 0]);
  t("and it does not count block 1's readings as UNDETERMINED either — they are bound, to block 1's case — so the "
  + "document says nobody but its author read it, beside its own link",
    [PT?.completeness?.acknowledgements_unbindable_to_this_case ?? 0,
     /Nobody but its author acknowledged it\./.test(doc?.text || ""), (doc?.text || "").includes(LINK(DT))],
    [0, true, true]);
}

/* =========================================================================== 4 */
console.log("\n--- 4. THE DRAFT DOOR AFTER PUBLICATION reaches the document the draft was named for ---");
{
  const Q4 = await finding("late");
  const D4 = await draftOf("late", [Q4]);
  const G4 = rP(await POST(`op=reviewgrant&token=${IRIS}`, { draft: D4, recipient: "Lee Park, Civil Grand Jury" }));
  if (!G4?.ok || !G4.secret) bail("reviewgrant D4", G4);
  const P4 = await publish("late", [Q4], { draft: D4 });
  if (P4?.ok === false || !P4?.caseDocument?.doc_sha) bail("publish late", P4);
  const C4 = P4.caseDocument.case_id;
  const before = P4.caseDocument.doc_sha;
  const Ap = await ack(`draft=${D4}&token=${PAT}`);
  t("pat reads the named draft AFTER publication: the act says the reading binds to that case, names the link, and "
  + "re-authors the UNSIGNED document",
    [Ap?.ok, Ap?.bound_to_a_case, Ap?.draft_link?.case_id, Ap?.draft_link?.named_by, Ap?.draft_link?.signed,
     (Ap?.case_documents || []).map((d) => [d.case_id, d.reauthored, d.acknowledged])],
    [true, true, C4, "iris", false, [[C4, true, 1]]]);
  const Ar = await ack(`draft=${D4}&secret=${encodeURIComponent(G4.secret)}`);
  t("AND A RECIPIENT, who holds no session and so has no case door, reaches the new case's signed list the same "
  + "way — REC-194's reported gap, closed by the link",
    [Ar?.ok, Ar?.bound_to_a_case, (Ar?.case_documents || []).map((d) => [d.case_id, d.reauthored, d.acknowledged])],
    [true, true, [[C4, true, 2]]]);
  const doc = await docOf(C4, 1);
  t("the re-authored bytes list both, each on the draft, with the link sentence kept — and the old hash is stale",
    [doc?.doc_sha !== before, (fmOf(doc?.text).completeness_acknowledgements || []).map((a) => [a.by, a.draft]),
     (doc?.text || "").includes(LINK(D4)), fmOf(doc?.text).completeness?.draft],
    [true, [["pat", D4], [G4.grantId, D4]], true, D4]);
  const stale = await ratify(C4, 1, before);
  const r = await ratify(C4, 1, doc?.doc_sha);
  t("the owner signs what names them: the pre-reading hash is refused as stale, the re-authored one ratifies",
    [stale?.ok === false, r?.ok !== false], [true, true]);
  const after = await ack(`draft=${D4}&token=${ELLA}`);
  t("once SIGNED, a further reading of the draft is recorded, re-authors nothing, and the act says it can appear in "
  + "no signed document of that edition",
    [after?.ok, after?.draft_link?.signed, (after?.case_documents || []).length, /already SIGNED/.test(after?.listed || "")],
    [true, true, 0, true]);
}

/* =========================================================================== 5 */
console.log("\n--- 5. THE THREE REFUSALS: a link that would be false is refused by its row ---");
{
  const Q5 = await finding("refused");
  const row = (code) => [code, CASE_DERIVATION_CHECKS[code].check, CASE_DERIVATION_CHECKS[code].translation];
  const said = (r) => [r?.reason, r?.check, r?.translation];
  const nf = await publish("refused", [Q5], { draft: "DRAFT-2026-9999" });
  t("a draft that does not exist: PUBLISH_DRAFT_NOT_FOUND, with C-44.3's row", said(nf), row("PUBLISH_DRAFT_NOT_FOUND"));
  const otherDraft = rP(await POST(`op=casedraft&token=${IRIS}`,
    withRoles({ ...args(OTHER, "other"), targets: [Q5] })));
  if (!otherDraft?.ok) bail("casedraft other project", otherDraft);
  const op = await publish("refused", [Q5], { draft: otherDraft.draftId });
  t("ANOTHER PROJECT'S draft, though its caller can read it, is answered the same — it is not this project's",
    said(op), row("PUBLISH_DRAFT_NOT_FOUND"));
  const Dc = rP(await POST(`op=casedraft&token=${IRIS}`, withRoles({ ...args(PROJ, "named"), caseId: C1, targets: [Q5] })));
  if (!Dc?.ok) bail("casedraft naming C1", Dc);
  const nt = await publish("refused", [Q5], { draft: Dc.draftId, newCase: true });
  t("a draft of an EXISTING case named on a NEW one: PUBLISH_DRAFT_NOT_THIS_CASE, with C-44.4's row, naming both",
    [...said(nt), nt?.draft_case, nt?.case_id], [...row("PUBLISH_DRAFT_NOT_THIS_CASE"), C1, null]);
  const ab = await publish("refused", [Q5], { draft: D1 });
  t("block 1's draft, already bound to its case, named for another: PUBLISH_DRAFT_ALREADY_BOUND, with C-44.5's row",
    [...said(ab), ab?.bound_to?.case_id, ab?.bound_to?.edition], [...row("PUBLISH_DRAFT_ALREADY_BOUND"), C1, 1]);
  const ok = await publish("refused", [Q5]);
  t("and none of them left anything behind: no refused act prepared the finding, so it then publishes, without "
  + "draft=, as a new case (ALREADY_A_CASE_MEMBER would refuse a finding a refused act had prepared)",
    [ok?.ok !== false, typeof ok?.caseId === "string" && ok.caseId !== C1], [true, true]);
}

/* =========================================================================== 6 */
console.log("\n--- 6. ONE SENTENCE READ ON TWO DRAFTS IS TWO READINGS ---");
{
  const Qa = await finding("pairA"), Qb = await finding("pairB");
  const SP = args(PROJ, "pair").statement;
  const Da = await draftOf("pair", [Qa]);
  const Db = await draftOf("pair", [Qb], { statement: SP });
  const first = await ack(`draft=${Da}&token=${ELLA}`);
  const second = await ack(`draft=${Db}&token=${ELLA}`);
  t("ella reads the same sentence on two drafts of new cases: the SECOND is a new act on its own draft, not "
  + "'existed' on the first — so the second draft's review copy lists her",
    [first?.existed, second?.existed, second?.acknowledgement?.draft_id,
     (rP(await GET(`op=reviewcopy&draft=${Db}&token=${IRIS}`))?.statement_acknowledgements?.acknowledgements || [])
       .map((a) => a.by)],
    [false, false, Db, ["ella"]]);
  const Pb = await publish("pair", [Qb], { draft: Db, statement: SP });
  t("and the case the second draft produced lists her reading of THAT draft, and counts her reading of the first "
  + "as undetermined (nobody named that draft)",
    [(Pb?.completeness?.acknowledgements || []).map((a) => [a.by, a.draft]),
     Pb?.completeness?.acknowledgements_unbindable_to_this_case],
    [[["ella", Db]], 1]);
}

/* =========================================================================== 7 */
/* D-626 (D-538's class): a draft that names no case is TWO drafts — one asking for a new case, one leaving
   publication to DERIVE the case — and three plane sentences still told them apart by the case id alone. Every
   expectation below is a phrase this suite writes out, never one read off the sentence helper. */
console.log("\n--- 7. D-626: A DRAFT THAT NAMES NO CASE IS NOT CALLED A NEW CASE UNLESS IT ASKS FOR ONE ---");
{
  const NEW = /prepared for a new case, whose identity is not yet allocated/;
  const DERIVED = /prepared for a case this draft does not name and publication DERIVES/;
  const Q7 = await finding("d626");
  const Dn = await draftOf("d626n", [Q7], { newCase: true });
  const Ds = await draftOf("d626s", [Q7], { newCase: "true" });
  const Dd = await draftOf("d626d", [Q7]);
  const onC1 = (d) => publish("d626", [Q7], { draft: d, caseId: C1 });
  const rn = await onC1(Dn), rs = await onC1(Ds), rd = await onC1(Dd);
  t("a NEW-CASE draft named on a further edition of C1 is refused, and its detail reads the NEW-CASE sentence "
  + "and the new-case remedy — never the derivation sentence",
    [rn?.reason, NEW.test(rn?.detail || ""), DERIVED.test(rn?.detail || ""),
     /Publish the new case the draft asks for \(newCase=true\)/.test(rn?.detail || "")],
    ["PUBLISH_DRAFT_NOT_THIS_CASE", true, false, true]);
  t("the same with newCase spelled as the string \"true\" — read for truthiness, as publication reads it",
    [rs?.reason, NEW.test(rs?.detail || ""), DERIVED.test(rs?.detail || "")],
    ["PUBLISH_DRAFT_NOT_THIS_CASE", true, false]);
  /* CORRECTED BY D-680 (BOB #35, 2026-09-25 07:35Z), never exempted. This row asserted PUBLISH_DRAFT_NOT_THIS_CASE
     and D-626's remedy "accepted here only at a new case's first edition", which was true of the plane D-626 worded
     and is the defect D-680 corrects: a derivation draft binds to the case publication DERIVES, any edition. Here
     derivation yields a NEW case (Q7 serves none) and the act names C1, so the two disagree and the act is refused by
     name with BOTH cases (C-44.6). The derivation arm of C-44.4 — derivation yields NO case — is driven in block 8. */
  t("a draft that names no case and asks for none, named on C1 while its findings derive a NEW case: refused "
  + "PUBLISH_DRAFT_CASE_NOT_DERIVED naming both, never called a new-case draft, and no remedy claims it names a case",
    [rd?.reason, rd?.case_id, rd?.derived_case, NEW.test(rd?.detail || ""),
     /the case the draft names/.test(rd?.detail || ""),
     /derives a new case for these findings; this act names /.test(rd?.detail || ""),
     (rd?.detail || "").includes(`this act names ${C1}`)],
    ["PUBLISH_DRAFT_CASE_NOT_DERIVED", C1, null, false, false, true, true]);
  const ns = rP(await POST(`op=casedraft&token=${IRIS}`,
    withRoles({ ...args(PROJ, "d626x"), caseId: "CASE-2026-9999-none", targets: [Q7] })));
  t("C-87.6 REVIEW_NO_SUCH_CASE, driven through op=casedraft: its translation no longer says leaving the name off "
  + "makes a new case — it says publication derives the case, and a new case is a separate choice",
    [ns?.reason ?? ns?.code, /the draft is a new case/.test(ns?.translation || ""),
     /publication derives the case/.test(ns?.translation || ""),
     /asking for a new case is a separate choice/.test(ns?.translation || "")],
    ["REVIEW_NO_SUCH_CASE", false, true, true]);
  const Da = await draftOf("d626a", [Q7], { caseId: C1, newCase: true });
  const aa = await ack(`draft=${Da}&token=${ELLA}`);
  t("a draft naming C1 AND asking for a new case: the statement acknowledgement states that identity as "
  + "UNDETERMINED, never as the next edition of C1 alone",
    [aa?.ok, /also asks for a new case/.test(aa?.listed || ""), /UNDETERMINED until one of them is withdrawn/.test(aa?.listed || "")],
    [true, true, true]);
}

/* =========================================================================== 8 */
/* D-680 (BOB #35, 2026-09-25 07:35Z; BIO_Publication §3 rule 13): A DERIVATION DRAFT — no caseId, no newCase —
   DEFERS ITS CASE TO PUBLICATION and binds to the case publication derives at that act, a first edition OR A
   FURTHER ONE. A case the publisher also names binds it only if it IS the derived case; if not, refused by name
   with both. Derivation yielding no case is refused as before. The signed document states how the case was
   settled. Every expected phrase is written out here, never read off the plane's helpers. */
console.log("\n--- 8. D-680: A DERIVATION DRAFT BINDS TO THE CASE PUBLICATION DERIVES, ANY EDITION ---");
{
  let n8 = 0;
  /* THE ROUTE DEC-12 BUILT TO A FURTHER EDITION: the finding is reopened and concluded again, so its bytes move and
     ALREADY_A_CASE_MEMBER (which compares the pin for a finding concluded with no project) does not refuse. */
  const reconclude = async (id) => {
    n8++;
    const o = rP(await GET(`op=reopen&token=${IRIS}&target=${encodeURIComponent(id)}`
      + `&reason=${encodeURIComponent(`D-680 re-read ${n8}: the memo has to be read again`)}`));
    if (o?.ok === false) bail(`reopen ${id} ${n8}`, o);
    const c = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(id)}`
      + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo (re-read ${n8}).`)}`
      + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id} (re-read ${n8}).`)}` + adoptedVersionParam()));
    if (c?.ok === false) bail(`reconclude ${id} ${n8}`, c);
  };
  /* A REFUSED publication is a FAILED ROW above it, never a fixture crash here: a control arm must fail by name. */
  const signIt = async (P, what) => {
    if (!P?.caseDocument) return null;
    const doc = await docOf(P.caseDocument.case_id, P.caseDocument.edition ?? P.edition);
    const r = await ratify(P.caseDocument.case_id, P.caseDocument.edition ?? P.edition, doc?.doc_sha);
    if (r?.ok === false) bail(`ratify ${what}`, r);
    return doc;
  };
  const Q8 = await finding("d680");
  const P1st = await publish("d680", [Q8]);
  if (P1st?.ok === false || !P1st?.caseDocument?.doc_sha) bail("publish d680 edition 1", P1st);
  const C8 = P1st.caseDocument.case_id;
  await signIt(P1st, "d680 edition 1");
  await reconclude(Q8);
  const D8 = await draftOf("d680e2", [Q8]);
  const A8 = await ack(`draft=${D8}&token=${ELLA}`);
  if (!A8?.ok) bail("ack D8", A8);
  const P2nd = await publish("d680e2", [Q8], { draft: D8 });
  t("ACCEPTS-WHEN: a DERIVATION draft publishes as a FURTHER EDITION of the case publication derives — edition 2 of "
  + "C8, not refused PUBLISH_DRAFT_NOT_THIS_CASE — and binds ella's reading of it",
    [P2nd?.ok !== false, P2nd?.reason ?? null, P2nd?.caseDocument?.case_id === C8, P2nd?.caseDocument?.edition ?? P2nd?.edition,
     (P2nd?.completeness?.acknowledgements || []).map((a) => [a.by, a.draft ?? null])],
    [true, null, true, 2, [["ella", D8]]]);
  t("and the answer states HOW the case was settled: DERIVED AT PUBLICATION, beside the link's author and time",
    [P2nd?.completeness?.draft?.draft_id, P2nd?.completeness?.draft?.named_by, P2nd?.completeness?.draft?.case],
    [D8, "iris", "derived_at_publication"]);
  const Ap8 = await ack(`draft=${D8}&token=${PAT}`);
  t("THE DRAFT DOOR AFTER PUBLICATION reaches the FURTHER edition the derivation draft bound to: pat's reading "
  + "re-authors edition 2 of C8, unsigned",
    [Ap8?.ok, Ap8?.bound_to_a_case, Ap8?.draft_link?.case_id === C8, Ap8?.draft_link?.edition,
     (Ap8?.case_documents || []).map((d) => [d.case_id === C8, d.edition, d.reauthored, d.acknowledged])],
    [true, true, true, 2, [[true, 2, true, 2]]]);
  const doc2 = await signIt(P2nd, "d680 edition 2");
  t("and the signed edition 2 lists ella and pat, each on the draft",
    [(fmOf(doc2?.text).completeness_acknowledgements || []).map((a) => [a.by, a.draft])],
    [[["ella", D8], ["pat", D8]]]);
  t("THE SIGNED DOCUMENT states it: `draft_case: derived_at_publication` in the frontmatter and the words DERIVED AT "
  + "PUBLICATION, with the publisher, in the prose",
    [fmOf(doc2?.text).completeness?.draft_case,
     (doc2?.text || "").includes(`Draft ${D8} named no case and left its case to publication: this case was DERIVED AT PUBLICATION`),
     (doc2?.text || "").includes("at iris's act on ")],
    ["derived_at_publication", true, true]);
  const pc2 = rP(await GET(`op=publishedcase&id=${C8}&edition=2`));
  const comp2 = pc2?.completeness ?? pc2?.case?.completeness ?? {};
  t("THROUGH THE PUBLIC READ, committed FROM THE SIGNED BYTES: the link carries case derived_at_publication",
    [comp2.draft?.draft_id, comp2.draft?.case], [D8, "derived_at_publication"]);

  await reconclude(Q8);
  const D8c = await draftOf("d680e3", [Q8]);
  const P3rd = await publish("d680e3", [Q8], { draft: D8c, caseId: C8 });
  t("NAMED AND CONFIRMED: the publisher names C8 and C8 IS the derived case, so the derivation draft binds — edition "
  + "3 — and the document says NAMED AND CONFIRMED",
    [P3rd?.ok !== false, P3rd?.reason ?? null, P3rd?.caseDocument?.edition ?? P3rd?.edition, P3rd?.completeness?.draft?.case],
    [true, null, 3, "named_and_confirmed"]);
  const doc3 = await signIt(P3rd, "d680 edition 3");
  t("and the signed bytes carry `draft_case: named_and_confirmed` and the sentence",
    [fmOf(doc3?.text).completeness?.draft_case, (doc3?.text || "").includes("NAMED AND CONFIRMED, at iris's act on ")],
    ["named_and_confirmed", true]);

  const D8x = await draftOf("d680x", [Q8]);
  const rx = await publish("d680x", [Q8], { draft: D8x, caseId: C1 });
  t("A NAMED CASE THAT IS NOT THE DERIVED ONE is refused by name, C-44.6's row, stating BOTH cases",
    [rx?.reason, rx?.check, rx?.translation, rx?.case_id, rx?.derived_case,
     (rx?.detail || "").includes(`derives the case ${C8} for these findings; this act names ${C1}`)],
    ["PUBLISH_DRAFT_CASE_NOT_DERIVED", CASE_DERIVATION_CHECKS.PUBLISH_DRAFT_CASE_NOT_DERIVED.check,
     CASE_DERIVATION_CHECKS.PUBLISH_DRAFT_CASE_NOT_DERIVED.translation, C1, C8, true]);

  const D8n = await draftOf("d680n", [Q8]);
  const Pn = await publish("d680n", [Q8], { draft: D8n, newCase: true });
  t("A PUBLISHER WHO ASKS FOR A NEW CASE is not deriving: the derivation draft binds to the new case exactly as "
  + "before this row, and the document says the new case was the publisher's ask",
    [Pn?.ok !== false, Pn?.reason ?? null, typeof Pn?.caseDocument?.case_id === "string" && Pn.caseDocument.case_id !== C8,
     Pn?.completeness?.draft?.case],
    [true, null, true, "new_case_asked_at_publication"]);
  const CN = Pn?.caseDocument?.case_id ?? null;
  await signIt(Pn, "d680 new case");

  await reconclude(Q8);
  const D8z = await draftOf("d680z", [Q8]);
  const rz = await publish("d680z", [Q8], { draft: D8z, caseId: C8 });
  t("DERIVATION YIELDS NO CASE — the findings now serve two cases — so a named case is refused as before, "
  + "PUBLISH_DRAFT_NOT_THIS_CASE with C-44.4's row, and the detail says why derivation yields none",
    [rz?.reason, rz?.check, rz?.translation,
     (rz?.detail || "").includes(`serve 2 published cases (${[C8, CN].sort().join(", ")})`),
     /accepted here only at a new case's first edition/.test(rz?.detail || "")],
    ["PUBLISH_DRAFT_NOT_THIS_CASE", CASE_DERIVATION_CHECKS.PUBLISH_DRAFT_NOT_THIS_CASE.check,
     CASE_DERIVATION_CHECKS.PUBLISH_DRAFT_NOT_THIS_CASE.translation, true, false]);
}

/* =========================================================================== 9 */
/* D-683 (BIO_Publication §3 rule 13; §6A.4): A READING OF A NO-CASE DRAFT IS COUNTED UNDETERMINED ON A FURTHER EDITION
   PUBLISHED WITHOUT `draft=`, exactly as block 2 counts it on a first. The reading is recorded at the draft's identity,
   whose edition reads 1 (D-568), so the unbound count may not ask the edition either — as D-680 took it off the link
   arm. Without it, edition 2 printed no tail over a record holding a reading of its exact sentence. */
console.log("\n--- 9. D-683: WITHOUT draft=, A FURTHER EDITION COUNTS THE NO-CASE DRAFT'S READING UNDETERMINED ---");
{
  const Q9 = await finding("d683");
  const P9a = await publish("d683", [Q9]);
  if (P9a?.ok === false || !P9a?.caseDocument?.doc_sha) bail("publish d683 edition 1", P9a);
  const C9 = P9a.caseDocument.case_id;
  const d9a = await docOf(C9, 1);
  if ((await ratify(C9, 1, d9a?.doc_sha))?.ok === false) bail("ratify d683 edition 1", {});
  const ro = rP(await GET(`op=reopen&token=${IRIS}&target=${encodeURIComponent(Q9)}`
    + `&reason=${encodeURIComponent("D-683 re-read: the memo has to be read again")}`));
  if (ro?.ok === false) bail("reopen d683", ro);
  const rc = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(Q9)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${Q9} is on the memo (re-read).`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${Q9} (re-read).`)}` + adoptedVersionParam()));
  if (rc?.ok === false) bail("reconclude d683", rc);
  const D9 = await draftOf("d683e2", [Q9]);
  const A9 = await ack(`draft=${D9}&token=${ELLA}`);
  t("FIXTURE: ella reads a draft naming no case — recorded at no case identity, at edition 1 (D-568)",
    [A9?.ok, A9?.acknowledgement?.case_id, A9?.acknowledgement?.draft_id, A9?.acknowledgement?.edition],
    [true, null, D9, 1]);
  const P9 = await publish("d683e2", [Q9]);
  if (P9?.ok === false || !P9?.caseDocument?.doc_sha) bail("publish d683 edition 2", P9);
  const doc = await docOf(C9, 2);
  t("ACCEPTS-WHEN: edition 2 of the case, published WITHOUT draft=, lists nobody, COUNTS ella's reading of the "
  + "no-case draft as unbindable, and says UNDETERMINED — never 'Nobody but its author'",
    [P9?.caseDocument?.case_id === C9, P9?.caseDocument?.edition ?? P9?.edition,
     (P9?.completeness?.acknowledgements || []).length, P9?.completeness?.acknowledgements_unbindable_to_this_case,
     /whether any of them is a reading of THIS case is UNDETERMINED/.test(doc?.text || ""),
     /Nobody but its author acknowledged it\./.test(doc?.text || "")],
    [true, 2, 0, 1, true, false]);

  /* D-703 (BIO_Publication §3 rule 13; §6A.4): WHO WROTE THE SENTENCE ON A FURTHER EDITION PUBLISHED WITHOUT `draft=`.
     `#statementWriter` matched a no-case draft only at edition 1, so ella's sentence, written in a draft naming no case
     and published by iris as edition 2, found no draft and was credited to iris as "wrote this exclusion statement in
     the act that published this case" — the publisher credited with an editor's bytes, inside a signed document. The
     draft's identity reads edition 1 (D-568) and since D-680 it publishes any edition, so the writer read may not ask
     the edition either. A fresh case, so ella's draft is the only one holding this sentence. */
  const Q9w = await finding("d703");
  const P9w1 = await publish("d703", [Q9w]);
  if (P9w1?.ok === false || !P9w1?.caseDocument?.doc_sha) bail("publish d703 edition 1", P9w1);
  const C9w = P9w1.caseDocument.case_id;
  if ((await ratify(C9w, 1, (await docOf(C9w, 1))?.doc_sha))?.ok === false) bail("ratify d703 edition 1", {});
  if (rP(await GET(`op=reopen&token=${IRIS}&target=${encodeURIComponent(Q9w)}`
    + `&reason=${encodeURIComponent("D-703 re-read: the memo has to be read again")}`))?.ok === false) bail("reopen d703", {});
  if (rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(Q9w)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${Q9w} is on the memo (re-read).`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${Q9w} (re-read).`)}`
    + adoptedVersionParam()))?.ok === false) bail("reconclude d703", {});
  const Dw = rP(await POST(`op=casedraft&token=${ELLA}`, withRoles({ ...args(PROJ, "d703e2"), targets: [Q9w] })));
  if (!Dw?.ok) bail("casedraft d703e2 by ella", Dw);
  const Pw = await publish("d703e2", [Q9w]);
  if (Pw?.ok === false || !Pw?.caseDocument?.doc_sha) bail("publish d703 edition 2", Pw);
  const docW = await docOf(C9w, 2);
  const fmW = fmOf(docW?.text);
  t("D-703 ACCEPTS-WHEN: edition 2, published by iris WITHOUT draft=, names ELLA — who wrote the sentence in a draft "
  + "naming no case — as its writer, in the answer and in the signed bytes, and never credits iris with it",
    [Pw?.caseDocument?.case_id === C9w, Pw?.caseDocument?.edition ?? Pw?.edition,
     Pw?.completeness?.statement_by, fmW.completeness?.statement_by,
     (docW?.text || "").includes("ella wrote this exclusion statement, in the draft it was prepared in."),
     /iris wrote this exclusion statement in the act that published this case/.test(docW?.text || "")],
    [true, 2, "ella", "ella", true, false]);
}

/* =========================================================================== 10 */
/* D-725 (BIO_Publication §3 rule 13; §6A.4): THE DRAFT NAMED IS THE DRAFT READ, FOR THE WRITER AS FOR THE READINGS.
   `#statementWriter` read EVERY no-case draft of the project holding the sentence, not the draft `draft=` named, so a
   no-case draft prepared for ANOTHER case holding the same bytes answered for this one: two authors answered
   `drafts_disagree` (UNDETERMINED, needlessly), and one foreign draft alone named ITS author in signed bytes. Both
   drafts here name no case and hold one sentence (one tag); ella's is for another finding, pat's is for this one. */
console.log("\n--- 10. D-725: WITH draft=, THE WRITER IS READ OFF THE NAMED DRAFT ALONE ---");
{
  const Q10 = await finding("d725"), Q10x = await finding("d725x");
  const Dx = rP(await POST(`op=casedraft&token=${ELLA}`, withRoles({ ...args(PROJ, "d725"), targets: [Q10x] })));
  if (!Dx?.ok) bail("casedraft d725 by ella (another case's)", Dx);
  const Dn = rP(await POST(`op=casedraft&token=${PAT}`, withRoles({ ...args(PROJ, "d725"), targets: [Q10] })));
  if (!Dn?.ok) bail("casedraft d725 by pat (this case's)", Dn);
  const P10 = await publish("d725", [Q10], { draft: Dn.draftId });
  if (P10?.ok === false || !P10?.caseDocument?.doc_sha) bail("publish d725 naming pat's draft", P10);
  const doc10 = await docOf(P10.caseDocument.case_id, 1);
  const fm10 = fmOf(doc10?.text);
  t("D-725 ACCEPTS-WHEN: published naming PAT's draft, while ELLA's draft for another case holds the same bytes, the "
  + "case names PAT as its writer, in the answer and in the signed bytes — never ella, never UNDETERMINED",
    [P10?.completeness?.statement_by, fm10.completeness?.statement_by,
     (doc10?.text || "").includes("pat wrote this exclusion statement, in the draft it was prepared in."),
     /ella/.test(String(fm10.completeness?.statement_by_stated ?? "")) || /\bella wrote\b/.test(doc10?.text || ""),
     /UNDETERMINED: 2 drafts/.test(doc10?.text || "")],
    ["pat", "pat", true, false, false]);

  /* The named draft does NOT hold the published bytes, and only a foreign draft does: the named draft is the draft this
     case was prepared in, so these bytes arrived with this act — the publisher's, stated as such — never ella's. */
  const Q10b = await finding("d725b"), Q10bx = await finding("d725bx");
  const Dbx = rP(await POST(`op=casedraft&token=${ELLA}`, withRoles({ ...args(PROJ, "d725b"), targets: [Q10bx] })));
  if (!Dbx?.ok) bail("casedraft d725b by ella (another case's)", Dbx);
  const Dbn = rP(await POST(`op=casedraft&token=${PAT}`, withRoles({ ...args(PROJ, "d725b-own"), targets: [Q10b] })));
  if (!Dbn?.ok) bail("casedraft d725b-own by pat", Dbn);
  const P10b = await publish("d725b", [Q10b], { draft: Dbn.draftId });
  if (P10b?.ok === false || !P10b?.caseDocument?.doc_sha) bail("publish d725b naming pat's draft", P10b);
  const doc10b = await docOf(P10b.caseDocument.case_id, 1);
  t("D-725: the named draft holds OTHER bytes and only another case's draft holds these — the publisher wrote them at "
  + "this act, said so naming the draft, and ella (the foreign draft's author) is never named",
    [P10b?.completeness?.statement_by, fmOf(doc10b?.text).completeness?.statement_by,
     (doc10b?.text || "").includes(`the draft this case was named as prepared in, ${Dbn.draftId}, does not hold this sentence`),
     /\bella wrote\b/.test(doc10b?.text || "")],
    ["iris", "iris", true, false]);
}

console.log(`\nrec217-draft-binding: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
