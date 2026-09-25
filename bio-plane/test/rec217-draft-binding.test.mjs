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

   NEGATIVE CONTROL: RUN 2026-09-25 by WORKER D-521 on land/worker/D-521b, over origin/main 5e8a65a8. D-521 retired
   C-82.1 (STATEMENT_ACK_DOCUMENTS_OVER_BOUND) and added block 7. Each arm ran ALONE and was declared before arming.
   Every restore was by `cp` from per-arm pristine copies in the session scratchpad, verified by `sha256sum -c`
   (store.mjs 4c49a0f2…12b2fd1, bio-checks.mjs bcffa6fc…0bc3e58a, both OK) and `cmp` (identical; 3,471,251 B and
   1,005,816 B).
   (0) BASELINE: this suite 26 pass, 0 fail; `civicos-ui/check-refusal-codes.mjs --strict` exit 0.
   (a) THE ROW'S OWN: C-82.1's catalogue row restored in STATEMENT_ACK_CHECKS, and its DEC-49 region
       `is-statement-ack-documents-bound` restored as an EMPTY marker pair at the read, with no refusal site in it.
       DECLARED: check-refusal-codes MUST exit 1 naming the orphan; this suite and d507 MUST NOT move.
       RESULT: exit 1, naming the orphan by its region-size floor ("region `is-statement-ack-documents-bound` …
       (STATEMENT_ACK_DOCUMENTS_OVER_BOUND): the marked span is 2 line(s) / 0 characters"). NOT fully as declared,
       in two ways, recorded rather than smoothed. The FLOOR SLACK lines for rows, census, reach and governedSites
       also fired, because the floors had just moved down and one more row is slack. And d507 (62/1) and d150 (63/1)
       each failed exactly their own "C-82.1 is GONE" arm, which is those arms working. My declaration was wrong
       to say d507 would not move.
   (a') the same, with the region widened past the size floor by a comment, so the guard judges the region's
       CONTENT. DECLARED: MUST exit 1 naming the region as holding no refusal. RESULT: exit 1, "arm C judged NO
       refusal inside the region `is-statement-ack-documents-bound` of acknowledgeStatement in src/store.mjs,
       named by STATEMENT_ACK_DOCUMENTS_OVER_BOUND". AS DECLARED.
   (b) THE COLLAPSE THE ROW'S SCOPE NAMED: `found.slice(0, 1)`, which is `#one` over the same ordered read.
       DECLARED: block 7's "THE READ RETURNS TWO" MUST fail; blocks 1-6 MUST NOT. RESULT: 24 pass, 2 FAIL, both in
       block 7. On this run X sorted first, so the read kept X's row and Y's document, the one the reading belongs
       to, was NOT re-authored: the second block-7 row failed too, with Y listing nobody. That is the loss the
       collapse would ship. Which row fails second depends on the opaque ids' order. AS DECLARED for block 7;
       blocks 1-6 GREEN.
   THE SUBJECT CHANGED AFTER THE CONTROL. The full gate's `derivation-bounds` (71/1) and `meaning-bounds` (95/1)
   refused the one statement once its LIMIT was gone, counting it as an unbounded row source; they cannot see a
   read bounded by its keys. So the read became TWO keyed `#one` reads, by identity and by link, merged once per
   document. Both instruments went back to green, and no ceiling moved. RE-RUN ALONE on the changed store.mjs
   (pristine 517ac29a…eba8b42, restores `sha256sum -c` OK and `cmp` identical, 3,472,115 B), with the suite now
   27 pass at baseline because block 7 gained the same-document row:
   (a') exit 1, naming `is-statement-ack-documents-bound` as holding no refusal, plus the same slack lines. AS BEFORE.
   (b) 24 pass, 2 FAIL (the suite was 26 then), both block 7 rows, Y listing nobody. AS DECLARED.
   (c) NEW — THE MERGE DROPPED: the once-per-document filter becomes `.filter((d) => d)`. DECLARED: block 7's
       "identity and link name ONE document … ONCE" MUST fail; nothing else. RESULT: 26 pass, 1 FAIL, exactly that
       row: the same document came back twice, both marked re-authored. AS DECLARED.

   NEGATIVE CONTROL: RUN 2026-09-25 by WORKER D-720 on land/worker/D-720, stacked on land/worker/D-708 @ 656b0817.
   D-720 added block 8 (BOB #36, 11:30Z: a draft naming a case AND asking for a new one keys its reading at NO case).
   REPRODUCED FIRST through `op=statementack` on 656b0817's unchanged store, before any change: block 8's first five
   rows ran 27 pass, 5 FAIL. Each arm below ran ALONE, declared before arming, over the FINAL block 8 (eight rows);
   every restore by `cp` from a per-arm pristine copy in the session scratchpad, verified by sha256
   (bdc07c14…cbfb5dd, MATCH) AND `cmp` (IDENTICAL), 3,661,091 B each time.
   (0) BASELINE: 34 pass, 0 fail.
   (R) THE REPRODUCTION — 656b0817's store.mjs whole. DECLARED: every block-8 row that states the defect fails.
       RESULT: 28 pass, 6 FAIL — keyed-at-no-case, both "not listed" ACCEPTS-WHEN rows, the counted-not-Nobody row,
       the review-copy row and the binding row. The bound-leaves-the-count row PASSES there, and that is a fact about
       the row rather than the fix: nothing is counted on 656b0817, so zero is free (§5: an outcome that costs
       nothing is not evidence) — arm (e) is what shows the count bites.
   (a) THE ROW'S OWN — THE C1 KEY RESTORED: `#ackKey` returns `ident`. DECLARED: MUST fail both "not listed"
       ACCEPTS-WHEN rows by name ("another draft", "the case door"), with the rows resting on the same key; MUST NOT
       fail blocks 1-7. RESULT: 28 pass, 6 FAIL — the same six rows as (R), both "not listed" rows by name; blocks 1-7
       GREEN. AS DECLARED.
   (b) THE LINK ARM KEEPS `edition=?` (the pre-D-720 WHERE). DECLARED: MUST fail the binding row alone (L's edition 3
       is not 1). RESULT: 33 pass, 1 FAIL, exactly "D-720 ACCEPTS-WHEN (the binding)". AS DECLARED.
   (c) THE REVIEW COPY READS AT `ident`. DECLARED: MUST fail the review-copy row alone. RESULT: 33 pass, 1 FAIL,
       exactly that row (DP's copy lists pat's case-door reading of K). AS DECLARED.
   (e) THE UNBOUND COUNT ASKS `edition=?` ALONE (its draft-names-this-case clause disarmed). DECLARED: MUST fail the
       counted-not-Nobody row alone. RESULT: 33 pass, 1 FAIL, exactly that row. AS DECLARED.
   (d) OVER-STRICTNESS — `#ackKey` spelled another way with the same meaning (`if (newCase && ident.caseId != null)
       return { edition: 1, caseId: null }; return { ...ident };`). DECLARED: MUST pass. RESULT: 34 pass, 0 fail.
       AS DECLARED.

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
  meta: { object_type: objectType, group: "believe-in-oakland",
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
console.log("\n--- 7. D-521: the draft door's read can return TWO documents, never more ---");
/* WHY THIS BLOCK EXISTS (D-521, 2026-09-25). REC-194 left `acknowledgeStatement`'s document read keyed on
   `(case_id, edition)`, `case_documents`' primary key, so it returned at most one row and IC-246's bound (8,
   refusing over it as C-82.1) could not fire. D-521 was queued to collapse the read to one row and retire the
   refusal. REC-217 then WIDENED the read to `edition=? AND (case_id IS ? OR draft_id = ?)`, a UNION of two
   keys: the draft's own case identity, and the ONE document a publisher named the draft for. The second is
   unique per draft (PUBLISH_DRAFT_ALREADY_BOUND); the first is unique by the primary key. So the read returns
   at most TWO rows. They are two different documents when a bound draft is re-pointed at another case, which
   `op=casedraft` does not refuse. This block drives that case through the ops: collapsing the read to one row
   could drop the document the reading belongs to, and the bound of 8 is still unreachable (2 < 8).
   MEASURED on 5e8a65a8, the tree D-521 was spawned on: TWO rows come back. Y's document is re-authored, since the
   reading is at Y's identity. X's document is found and left alone (`reauthored: false`): its list binds a
   draft's readings only where they were recorded at NO case identity, and ella's is at Y's. So the second row
   is harmless today. The FIRST row is the risk. The read orders by `case_id`, and case ids are opaque, so a
   read collapsed to `#one` would keep X instead of Y whenever X sorts first, and Y's document would then keep a
   list without ella, with no refusal and nothing said. */
{
  const qx = await finding("rtX1"), qy = await finding("rtY1");
  const pX = await publish("rtX1", [qx]), pY = await publish("rtY1", [qy]);
  if (pX?.ok === false || !pX?.caseDocument?.doc_sha) bail("publish rtX1", pX);
  if (pY?.ok === false || !pY?.caseDocument?.doc_sha) bail("publish rtY1", pY);
  const X = pX.caseDocument.case_id, Y = pY.caseDocument.case_id;
  for (const [c, s] of [[X, pX.caseDocument.doc_sha], [Y, pY.caseDocument.doc_sha]]) {
    const r = await ratify(c, 1, s);
    if (r?.ok === false) bail(`caseratify ${c}`, r);
  }
  const qx2 = await finding("rtX2"), qy2 = await finding("rtY2");
  const SR = args(PROJ, "retarget").statement;
  const DR = await draftOf("retarget", [qx2], { caseId: X });
  const PX2 = await publish("retarget", [qx2], { caseId: X, draft: DR });
  if (PX2?.ok === false || !PX2?.caseDocument?.doc_sha) bail("publish X edition 2 naming DR", PX2);
  /* BOTH KEYS, ONE DOCUMENT: while DR still names X, its identity (X, 2) and its link (X, 2) are the same row.
     The read asks by each key, and the answer must count that document once. */
  const Ap = await ack(`draft=${DR}&token=${PAT}`);
  t("while DR still names X, its identity and its link name ONE document, and pat's reading re-authors it ONCE",
    [Ap?.ok, Ap?.acknowledgement?.case_id, (Ap?.case_documents || []).map((d) => [d.case_id, d.edition, d.reauthored])],
    [true, X, [[X, 2, true]]]);
  const moved = rP(await POST(`op=casedraft&token=${IRIS}`,
    withRoles({ ...args(PROJ, "retarget"), caseId: Y, targets: [qy2], draft: DR })));
  const PY2 = await publish("retarget", [qy2], { caseId: Y });
  if (PY2?.ok === false || !PY2?.caseDocument?.doc_sha) bail("publish Y edition 2", PY2);
  const shaX = (await docOf(X, 2))?.doc_sha, shaY = PY2.caseDocument.doc_sha;
  t("FIXTURE ARMS THE TRAP: DR was named for edition 2 of X, then re-pointed at Y (op=casedraft accepted it), and "
  + "edition 2 of Y is authored, unsigned, carrying the SAME sentence (hash computed here)",
    [PX2?.caseDocument?.edition, PX2?.completeness?.draft?.draft_id, moved?.ok, moved?.draftId,
     PY2?.caseDocument?.edition, fmOf((await docOf(X, 2))?.text).completeness?.statement_sha === sha(SR),
     fmOf((await docOf(Y, 2))?.text).completeness?.statement_sha === sha(SR)],
    [2, DR, true, DR, 2, true, true]);
  const Ar = await ack(`draft=${DR}&token=${ELLA}`);
  t("THE READ RETURNS TWO: one reading of DR finds BOTH unsigned documents, Y's by the draft's identity and X's by "
  + "the link, and re-authors Y's; nothing refuses, because 2 is under the bound of 8",
    [Ar?.ok, Ar?.reason ?? null, Ar?.acknowledgement?.case_id, Ar?.acknowledgement?.edition,
     (Ar?.case_documents || []).map((d) => [d.case_id, d.edition, d.reauthored]).sort()],
    [true, null, Y, 2, [[X, 2, false], [Y, 2, true]].sort()]);
  t("and only Y's bytes moved: Y lists ella, X lists pat alone, because ella's reading is Y's and not X's",
    [(await docOf(X, 2))?.doc_sha === shaX, (await docOf(Y, 2))?.doc_sha !== shaY,
     (fmOf((await docOf(X, 2))?.text).completeness_acknowledgements || []).map((a) => a.by),
     (fmOf((await docOf(Y, 2))?.text).completeness_acknowledgements || []).map((a) => a.by)],
    [true, true, ["pat"], ["ella"]]);
}

/* =========================================================================== 8 */
console.log("\n--- 8. D-720: a draft naming a case AND asking for a new one keys its reading at NO case ---");
/* D-720 / BIO_Publication_v0_1.md §3 rule 13 (BOB #36 RULED 2026-09-25 11:30Z, option (1)). Since D-618 a draft that
   names K AND sets `newCase` has an UNDETERMINED case: publication refuses the pair together (CASE_IDENTITY_AMBIGUOUS)
   and every answer states `edition: null`. But `op=statementack` still WROTE its reading at K's next edition, and
   `#statementAcknowledgements`' '*' draft match lists every row at a case identity — so K's next document listed a
   reading given on a draft that may become ANOTHER case: the record claiming a binding nobody made.
   MEASURED FIRST THROUGH THE OP on 656b0817 (D-708's tip, the tree D-720 was spawned on), before any change: ella's
   reading answered `case_id: K` and `bound_to_a_case: true`; K's next edition, authored from ANOTHER draft with
   the byte-identical statement, listed ella; L's next edition, authored at the CASE DOOR (no draft=), listed pat;
   DP's review copy listed a case-door reading of K's; and neither case a publish naming the draft produced listed
   the reading. The ruling: the reading is keyed at NO case identity, bound to the draft, as a derived draft's is,
   and binds only by REC-217's act — a publish naming the draft — whichever instruction was withdrawn first. */
{
  const S8 = args(PROJ, "d720").statement;
  const qk = await finding("d720k"), ql = await finding("d720l");
  const pK = await publish("d720k", [qk]), pL = await publish("d720l", [ql]);
  if (pK?.ok === false || !pK?.caseDocument?.doc_sha) bail("publish d720k", pK);
  if (pL?.ok === false || !pL?.caseDocument?.doc_sha) bail("publish d720l", pL);
  const K = pK.caseDocument.case_id, L = pL.caseDocument.case_id;
  for (const [c, s] of [[K, pK.caseDocument.doc_sha], [L, pL.caseDocument.doc_sha]]) {
    const r = await ratify(c, 1, s);
    if (r?.ok === false) bail(`caseratify ${c}`, r);
  }
  const qp = await finding("d720p"), qo = await finding("d720o"), qm = await finding("d720m"), qd = await finding("d720d");
  const DP = await draftOf("d720", [qp], { caseId: K, newCase: true, statement: S8 });
  const DM = await draftOf("d720", [qm], { caseId: L, newCase: true, statement: S8 });
  const aE = await ack(`draft=${DP}&token=${ELLA}`);
  const aP = await ack(`draft=${DM}&token=${PAT}`);
  t("D-720: THE READING OF A PAIR DRAFT IS KEYED AT NO CASE — case_id null, bound to the draft, edition stated null, "
  + "and the answer claims no binding to a case",
    [aE?.ok, aE?.acknowledgement?.case_id, aE?.acknowledgement?.draft_id, aE?.acknowledgement?.edition,
     aE?.bound_to_a_case, aP?.ok, aP?.acknowledgement?.case_id, aP?.bound_to_a_case],
    [true, null, DP, null, false, true, null, false]);
  /* K's NEXT EDITION FROM ANOTHER DRAFT, byte-identical statement (hash computed here). */
  const DO = await draftOf("d720", [qo], { caseId: K, statement: S8 });
  const PK2 = await publish("d720", [qo], { caseId: K, draft: DO, statement: S8 });
  if (PK2?.ok === false || !PK2?.caseDocument?.doc_sha) bail("publish K edition 2 naming DO", PK2);
  const fmK2 = fmOf((await docOf(K, 2))?.text);
  t("D-720 ACCEPTS-WHEN (another draft): K's next edition, authored from ANOTHER draft carrying the byte-identical "
  + "statement, does NOT list ella's reading of the pair draft",
    [PK2?.caseDocument?.edition, fmK2.completeness?.statement_sha === sha(S8),
     (PK2?.completeness?.acknowledgements || []).map((a) => a.by),
     (fmK2.completeness_acknowledgements || []).map((a) => a.by)],
    [2, true, [], []]);
  /* THE CASE DOOR: L's next edition published with no draft=, byte-identical statement. */
  const PL2 = await publish("d720", [qd], { caseId: L, statement: S8 });
  if (PL2?.ok === false || !PL2?.caseDocument?.doc_sha) bail("publish L edition 2 at the case door", PL2);
  const fmL2 = fmOf((await docOf(L, 2))?.text);
  t("D-720 ACCEPTS-WHEN (the case door): L's next edition, published with no draft= and the byte-identical "
  + "statement, does NOT list pat's reading of the pair draft",
    [PL2?.caseDocument?.edition, fmL2.completeness?.statement_sha === sha(S8),
     (PL2?.completeness?.acknowledgements || []).map((a) => a.by),
     (fmL2.completeness_acknowledgements || []).map((a) => a.by)],
    [2, true, [], []]);
  /* NOT LISTED IS NOT "NOBODY": each reading may still become that case's (a publish naming its draft, `newCase`
     withdrawn), so REC-194's provisional stands — COUNTED and stated UNDETERMINED, never named, and never covered by
     "Nobody but its author acknowledged it" (BOB #33: without draft=, an unbindable reading is counted). */
  const whoElse = (text) => (text || "").split("**Who else read this statement.**")[1]?.split("## What Was Searched")[0] || "";
  const [k2, l2] = [whoElse((await docOf(K, 2))?.text), whoElse((await docOf(L, 2))?.text)];
  t("D-720: AND EACH IS COUNTED AS UNDETERMINED, NOT PRINTED AS NOBODY — K's and L's next editions each count one "
  + "reading whose case is not established, and each says nobody acknowledged it FOR THIS CASE, never 'nobody but "
  + "its author'",
    [PK2?.completeness?.acknowledgements_unbindable_to_this_case, PL2?.completeness?.acknowledgements_unbindable_to_this_case,
     /Nobody but its author/.test(k2) || !/Nobody acknowledged it FOR THIS CASE/.test(k2),
     /Nobody but its author/.test(l2) || !/Nobody acknowledged it FOR THIS CASE/.test(l2),
     /This record also holds 1 acknowledgement/.test(k2),
     /This record also holds 1 acknowledgement/.test(l2), /\bella\b/.test(k2), /\bpat\b/.test(l2)],
    [1, 1, false, false, true, true, false, false]);
  /* AND THE OTHER DIRECTION: a reading given at K's case door is K's, not the pair draft's. */
  const aK = await ack(`case=${K}&edition=2&token=${PAT}`);
  const copyP = rP(await GET(`op=reviewcopy&draft=${DP}&token=${IRIS}`));
  t("D-720: THE PAIR DRAFT'S REVIEW COPY lists ella's reading of IT, and not pat's reading of K's edition 2 given "
  + "at K's case door",
    [aK?.ok, aK?.acknowledgement?.case_id,
     (copyP?.statement_acknowledgements?.acknowledgements || []).map((a) => a.by)],
    [true, K, ["ella"]]);
  for (const [c, doc] of [[K, await docOf(K, 2)], [L, await docOf(L, 2)]]) {
    const r = await ratify(c, 2, doc?.doc_sha);
    if (r?.ok === false) bail(`caseratify ${c} edition 2`, r);
  }
  /* BINDING, WHICHEVER INSTRUCTION IS WITHDRAWN. DP drops K and publishes a NEW case naming itself; DM drops
     `newCase` and publishes L's next edition (3) naming itself. */
  const reP = rP(await POST(`op=casedraft&token=${IRIS}`,
    withRoles({ ...args(PROJ, "d720"), statement: S8, newCase: true, targets: [qp], draft: DP })));
  const reM = rP(await POST(`op=casedraft&token=${IRIS}`,
    withRoles({ ...args(PROJ, "d720"), statement: S8, caseId: L, targets: [qm], draft: DM })));
  if (!reP?.ok) bail("casedraft DP withdraws K", reP);
  if (!reM?.ok) bail("casedraft DM withdraws newCase", reM);
  const PN = await publish("d720", [qp], { newCase: true, draft: DP, statement: S8 });
  if (PN?.ok === false || !PN?.caseDocument?.doc_sha) bail("publish new case naming DP", PN);
  const PL3 = await publish("d720", [qm], { caseId: L, draft: DM, statement: S8 });
  if (PL3?.ok === false || !PL3?.caseDocument?.doc_sha) bail("publish L edition 3 naming DM", PL3);
  t("D-720 ACCEPTS-WHEN (the binding): after a publish NAMING the draft, the reading IS listed in the case that "
  + "publish produced, marked with the draft — a NEW case when K was withdrawn, L's edition 3 when newCase was",
    [PN?.caseDocument?.case_id !== K && PN?.caseDocument?.edition === 1,
     (PN?.completeness?.acknowledgements || []).map((a) => [a.by, a.draft ?? null]),
     PL3?.caseDocument?.case_id === L && PL3?.caseDocument?.edition === 3,
     (PL3?.completeness?.acknowledgements || []).map((a) => [a.by, a.draft ?? null]),
     (fmOf((await docOf(L, 3))?.text).completeness_acknowledgements || []).map((a) => [a.by, a.draft ?? null])],
    [true, [["ella", DP]], true, [["pat", DM]], [["pat", DM]]]);
  t("D-720: AND A BOUND READING LEAVES THE COUNT — L's edition 3 lists pat by the link and counts nothing undetermined",
    [PL3?.completeness?.acknowledgements_unbindable_to_this_case ?? 0], [0]);
}

console.log(`\nrec217-draft-binding: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
