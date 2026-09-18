/* NEGATIVE CONTROL: DECLARED BEFORE ARMING and RUN by `test/reviewcopy.control.mjs`
   — COMMITTED, so every arm re-runs in one step with `node test/reviewcopy.control.mjs
   [arm]` from `bio-plane/`. Each arm is armed ALONE, every other defence held open,
   and every restore of `src/store.mjs` is verified by sha256 AND by content against a
   uniquely-named per-arm pristine copy taken inside this worktree (never
   `git checkout --`, which restores to HEAD). ALL FIVE RUN 2026-09-18 in worktree
   agent-abd7c5e99752beec6, RE-RUN the same day after the fence moved to one door
   (`reviewAct`) and the copy's lists were bounded; the counts below are the RE-MEASURED ones and
   every restore read sha256 MATCH, content IDENTICAL, size ok:

   (0) BASELINE, nothing armed -> **52 pass, 0 fail**.

   (a) THE REVOCATION CHECK REMOVED — in `src/store.mjs`'s `#liveReviewGrant`, drop
   `revoked_at IS NULL` from the lookup, so a withdrawn grant still answers. Declared:
   MUST FAIL the revoked-secret arms and MUST NOT fail the edition arms -> **48 pass,
   4 fail**: the revoked recipient reads the copy, the byte-identical comparison, the
   carries-nothing arm and the comment's byte-identical arm. AS DECLARED.

   (b) THE EDITION BINDING REMOVED — in the same method, stop comparing the grant's
   case edition with the edition the draft stands at now. Declared: MUST FAIL the
   edition-moved arms (the review copy AND the next edition's unsigned case document)
   -> **51 pass, 1 fail**: the review copy arm only. **THE CASE-DOCUMENT ARM STAYED
   GREEN AND THAT IS A FINDING ABOUT THE SUBJECT, NOT THE ARM:** `#grantAdmitsCaseEdition`
   compares the requested edition with the grant's BOUND edition on its own, so the
   unsigned document of edition 3 stays shut even with the draft-side binding gone.
   Two defences, one of them was armed, and the other held — recorded rather than
   smoothed.

   (c) OVER-STRICTNESS — `#liveReviewGrant` also demands that the draft's gates PASS,
   the gate pressuring a member into filling a gap to send the copy (§6A.4). Declared:
   MUST FAIL the recipient-reads-an-incomplete-draft arm -> **50 pass, 2 fail**: that
   arm, and ALSO the gap-1 arm, because once edition 2 has been authored by a real
   `op=publish` the draft's own dry run refuses (its finding is claimed by the
   unsigned document), so a gates-must-pass grant dies at exactly the moment a
   recipient would read the document. More than declared, and in the declared
   direction.

   (d) THE LIAR'S REFUSAL — a revoked grant's READ answers `REVIEW_GRANT_REVOKED`
   instead of the one dead answer. Declared: MUST FAIL the byte-identical arms and ONLY
   those; the arm asserting that the revoked recipient reads nothing STAYS GREEN, which
   is the finding the arm exists for -> **51 pass, 1 fail**: the read's byte-identical
   arm, and the reads-nothing arm green exactly as declared. The COMMENT's byte-identical
   arm stays green because the liar was written into the read only. */

/* REC-126 / DEC-31 — THE REVIEW COPY: AN ADDRESSED ACT BESIDE PUBLISH THAT NEVER
 * LEAVES THE INSTANCE. `BIO_Publication_v0_1.md` §6A is the authority, and every
 * block below is one of its sentences driven through an op.
 *
 * THE THREE OBJECTS, and what each block measures about them:
 *   - THE DRAFT CASE (§6A.4, gap 3) — the production, identified BEFORE the publish
 *     gates run, holding the arguments `op=publish` would take. Its WHAT IS MISSING
 *     list is the publish gates' OWN refusal, obtained by running the real act and
 *     rolling it back. Block 3 drives three drafts with three DIFFERENT known gate
 *     states and asserts each one's own answer, so a hardcoded list cannot pass it.
 *   - THE GRANT (§6A.2) — scoped to one production, revocable, read-and-comment,
 *     attributed, never a bucket. Its READ SECRET is generated at the edge and the
 *     store holds only its SHA-256 (aicredentialmint's shape, PL-11).
 *   - THE COMMENT — attributed, and a recipient's comment is a RECIPIENT's.
 *
 * WHAT A LIAR WOULD DO AND WHICH ARM CATCHES IT:
 *   - a grant that reads EVERYTHING passes "the recipient can read": block 5 asserts
 *     the refusals — another draft, another case, another edition, an attested act.
 *   - status codes compared instead of bodies: block 7 compares STATUS, CONTENT TYPE
 *     AND BODY BYTES, read as text and never parsed (REC-130's `rawOf`).
 *   - a stored secret: block 4 asserts the stored fingerprint is the SHA-256 this
 *     suite computed itself, and that no answer anywhere carries the value again.
 *   - a hardcoded missing list: block 3, above.
 *
 * EXPECTATIONS ARE NOT DERIVED FROM THE THING UNDER TEST: every authored sentence is
 * the string this suite passed in, and every fingerprint is computed here with
 * node:crypto, sharing no code with `src/`.
 */

import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- reviewcopy ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("reviewcopy: SKIPPED — ssh-keygen not on PATH; the edition binding is driven across a REAL "
    + "case ratification, and a signature proved with our own verifier proves our verifier");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SCHEMA_SRC = readFileSync(fileURLToPath(new URL("../src/schema.mjs", import.meta.url)), "utf8");
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r126", MEMBER_TOKEN: "mem-r126", PROBE_TOKEN: "prb-r126", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const bail = (what, r) => {
  console.log(`  FAIL  (fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`);
  fail++;
  console.log(`\nreviewcopy: ${pass} pass, ${fail} fail  [FIXTURE ABORTED]`);
  mf.dispose().then(() => process.exit(1));
  throw new Error("fixture");
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
/* THE RAW ANSWER — status, content type and the BODY'S BYTES, never parsed. Two JSON
   objects that deep-equal can still differ in field order or a header. */
const rawOf = async (q, init) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`, init);
  return { status: r.status, type: r.headers.get("content-type"), body: await r.text() };
};
const rawPost = (q, body) => rawOf(q, { method: "POST", body: JSON.stringify(body ?? {}) });
const parsed = (raw) => { try { return rP(JSON.parse(raw.body)); } catch { return null; } };

/* ---- keys and roster ---- */
const dir = mkdtempSync(join(tmpdir(), "reviewcopy-"));
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
  const add = rP(await POST("op=memberadd&token=adm-r126",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
await enrol("nadia", "nadia-passphrase-126", "admin", ["contribute", "publish", "create_projects"]);
const OMAR = await enrol("omar", "omar-passphrase-126", "admin", ["contribute", "publish"]);
const IRIS = await enrol("iris", "iris-passphrase-126", "member", ["contribute", "publish"]);
/* A MEMBER WITH NO STANDING in the producing project — signed in, holding `publish`,
   owning a project of her own. The caller a member-side read is refused to. */
const VIC = await enrol("vic", "vic-passphrase-126", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-r126", { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));

const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r126", owner: "iris",
  id: "PROJ-2026-1260-auditor", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r126", owner: "vic",
  id: "PROJ-2026-1261-elsewhere", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });

/* ---- the corpus: the shapes are casesign.test.mjs's, lifted rather than invented ---- */
let snapSeq = 0;
const promote = async (id, text, objectType, state) => rP(await POST("op=promote&token=adm-r126", {
  bundleId: id, base: null,
  snapKey: `20260918T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
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

const INFO = "INFO-2026-1260-memo";
const LEAD = "INQ-2026-1260-lead";        /* edition 1 of the signed case */
const LEAD2 = "INQ-2026-1260-second";     /* the draft of edition 2 */
const LEAD3 = "INQ-2026-1260-third";      /* the draft with no bias acknowledgement */
const LEAD4 = "INQ-2026-1260-fourth";     /* edition 3, published after the grant's edition is signed */
const LEAD5 = "INQ-2026-1260-fifth";      /* a NEW case whose every gate passes */
const OPENQ = "INQ-2026-1260-open";       /* never concluded */
const Q = { [LEAD]: "Was the transfer authorised?", [LEAD2]: "Was notice given?",
            [LEAD3]: "Was the memo adopted?", [LEAD4]: "Was the auditor told?",
            [LEAD5]: "Who signed the memo?", [OPENQ]: "Is the fund solvent?" };
if ((await promote(INFO, infoMd(INFO), "information", "collected")).ok === false) bail("promote info", {});
/* CORRECTED 2026-09-18 (REC-136, INVESTIGATIVE-SESSION.md §7.1 item 6): a
   conclusion drawn with no project NAMES the accepted reading whose claim it
   adopts, and an unnamed one is refused NO_CLAIM. These inquiries were concluded
   with no reading because the act took none; the five this suite CONCLUDES now
   carry one (`withAdoptableReading`) and the call names it. OPENQ is never
   concluded and is left exactly as it was. */
for (const id of Object.keys(Q)) {
  const md = inquiryMd(id, Q[id], INFO);
  const r = await promote(id, id === OPENQ ? md : withAdoptableReading(md), "inquiry", "open");
  if (r.ok === false) bail(`promote ${id}`, r);
}
for (const id of [LEAD, LEAD2, LEAD3, LEAD4, LEAD5]) {
  const r = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(id)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id}.`)}`
    + adoptedVersionParam()));
  if (!r.ok) bail(`conclude ${id}`, r);
}

/* THE AUTHORED ARGUMENTS, per edition. C-21.1 demands a fresh statement and a fresh
   acknowledgement per edition, so each carries its own. */
const args = (n, over = {}) => ({
  project: PROJ, scope: `Whether the transfer was authorised, edition ${n}.`,
  statement: `This case covers the FY2024 transfer only, at edition ${n}.`,
  excluded: [{ target: null, description: `the FY2023 memo, edition ${n}`, reason: "a records request is outstanding" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: `We put the claims to the City Administrator for edition ${n}.`,
  biasAcknowledgement: `This group holds that transfers should be adopted in public, edition ${n}.`,
  ...over,
});
const withRoles = (b) => ({ ...b, roles: allLoadBearing(b) });

console.log("\n--- reviewcopy ---");

/* =========================================================================== 1
 * THE GROUND: a signed case at edition 1, so a draft can name an existing case.
 * ========================================================================= */
console.log("\n--- 1. the ground: case edition 1 is published and SIGNED ---");
const pub1 = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(1), targets: [LEAD] })));
if (pub1.ok === false || !pub1.caseDocument?.doc_sha) bail("publish edition 1", pub1);
const C1 = pub1.caseDocument.case_id;
{
  const r = rP(await POST(`op=caseratify&token=${IRIS}`, { caseId: C1, edition: 1,
    expectedSha: pub1.caseDocument.doc_sha, sig: signCase("iris", C1, 1, pub1.caseDocument.doc_sha) }));
  if (r.ok === false) bail("caseratify edition 1", r);
}
t("the ground: the case the drafts will name is signed at edition 1 and is what a stranger can read",
  (parsed(await rawOf(`op=casedocument&case=${C1}&edition=1`)) || {}).ratified, true);

/* =========================================================================== 2
 * THE DRAFT: authored by the project's owner, identified BEFORE any gate runs.
 * ========================================================================= */
console.log("\n--- 2. the draft case: an owner's act, and nobody else's ---");
const draft = async (token, body) => rP(await POST(`op=casedraft&token=${token}`, body));
const D1r = await draft(IRIS, withRoles({ ...args(2), caseId: C1, targets: [LEAD2] }));
const D2r = await draft(IRIS, withRoles({ ...args(1), targets: [OPENQ] }));
const D3r = await draft(IRIS, withRoles({ ...args(1, { biasAcknowledgement: "" }), targets: [LEAD3] }));
const D5r = await draft(IRIS, withRoles({ ...args(1), targets: [LEAD5] }));
for (const [n, r] of [["D1", D1r], ["D2", D2r], ["D3", D3r], ["D5", D5r]]) if (!r?.ok) bail(`casedraft ${n}`, r);
const [D1, D2, D3, D5] = [D1r.draftId, D2r.draftId, D3r.draftId, D5r.draftId];

t("a draft naming an existing case stands at THAT CASE'S NEXT EDITION — the edition is read from the "
+ "published record, never taken from the caller",
  [D1r.caseId, D1r.edition], [C1, 2]);
t("a draft naming no case is a NEW case at edition 1, and its identity is STATED as not yet allocated "
+ "rather than invented — a case id is minted only by publication",
  [D2r.caseId, D2r.edition, typeof D2r.caseIdentity === "string" && /not yet allocated/i.test(D2r.caseIdentity)],
  [null, 1, true]);
t("a draft is REFUSED to a member who does not own the producing project (the authority is publish's, "
+ "DEC-72: the act stands beside publish)",
  (await draft(VIC, withRoles({ ...args(2), caseId: C1, targets: [LEAD2] })))?.reason, "REVIEW_NOT_PROJECT_OWNER");
t("and to an administrator who is not an owner — an administrator sees every project and directs none",
  (await draft(OMAR, withRoles({ ...args(2), caseId: C1, targets: [LEAD2] })))?.reason, "REVIEW_NOT_PROJECT_OWNER");
t("and to a machine credential, BY NAME — a review copy is an attributed act addressed to a person",
  (await draft("mem-r126", withRoles({ ...args(2), caseId: C1, targets: [LEAD2] })))?.reason,
  "MACHINE_CANNOT_REVIEW");
t("a draft naming a case this project does not own is answered exactly as a case that does not exist",
  [(await draft(IRIS, withRoles({ ...args(2), caseId: "CASE-2026-9999", targets: [LEAD2] })))?.reason],
  ["REVIEW_NO_SUCH_CASE"]);

/* =========================================================================== 3
 * WHAT IS MISSING IS THE PUBLISH GATES' OWN REFUSAL, RUN AND ROLLED BACK.
 * ========================================================================= */
console.log("\n--- 3. what is missing: the publish gates' own refusals, not a list ---");
const ownerRead = async (d) => rP(await GET(`op=reviewcopy&draft=${d}&token=${IRIS}`));
const O1 = await ownerRead(D1), O2 = await ownerRead(D2), O3 = await ownerRead(D3), O5 = await ownerRead(D5);
t("THREE DRAFTS, THREE DIFFERENT GATE ANSWERS — the one whose every gate passes names nothing; the one "
+ "over an open question names NOT_CONCLUDED on THAT question; the one with no acknowledgement names "
+ "NO_BIAS_ACKNOWLEDGEMENT. A hardcoded list could not produce all three",
  [O1?.gates, O1?.missing?.length,
   O2?.gates, O2?.missing?.[0]?.reason, O2?.missing?.[0]?.target,
   O3?.gates, O3?.missing?.[0]?.reason],
  ["passed", 0, "refused", "NOT_CONCLUDED", OPENQ, "refused", "NO_BIAS_ACKNOWLEDGEMENT"]);
t("and each refusal arrives with the gate's OWN words — the detail `op=publish` itself would answer, "
+ "not a paraphrase (§6A.4: the same refusals, in the same words)",
  [O3?.missing?.[0]?.detail === rP(await POST(`op=publish&token=${IRIS}`,
     withRoles({ ...args(1, { biasAcknowledgement: "" }), targets: [LEAD3] })))?.detail],
  [true]);
t("the gates run in their own order and stop at the first refusal, and the copy SAYS SO — what lies "
+ "beyond it is undetermined, not absent",
  typeof O2?.evaluated === "string" && /first refusal/i.test(O2.evaluated), true);
t("THE DRY RUN WROTE NOTHING: the edition-2 case document the passing draft would have authored does "
+ "not exist, even to its owner",
  rP(await GET(`op=casedocument&case=${C1}&edition=2&token=${IRIS}`))?.reason, "NO_CASE_DOCUMENT");
t("the copy is MARKED as what it is, names its signature as absent, and is never a publication",
  [O1?.kind, /REVIEW COPY/.test(O1?.marking || ""), O1?.signature?.signed, O1?.published],
  ["review-copy", true, false, false]);
t("and it is as complete as a publication can be: every authored argument, and each finding's own "
+ "document, which a stranger would otherwise see only once signed",
  [O1?.authored?.scope, O1?.authored?.statement, O1?.findings?.map((f) => f.target),
   (O1?.findings?.[0]?.text || "").includes(Q[LEAD2])],
  [args(2).scope, args(2).statement, [LEAD2], true]);

/* =========================================================================== 4
 * THE GRANT: issued by the owner, attributed, its secret never stored.
 * ========================================================================= */
console.log("\n--- 4. the grant: attributed, scoped to one production, its secret held only as a hash ---");
const membersBefore = (rP(await GET("op=memberlist&token=adm-r126"))?.members || []).length;
const grant = async (token, body) => rP(await POST(`op=reviewgrant&token=${token}`, body));
const G1 = await grant(IRIS, { draft: D1, recipient: "Dana Ruiz, City Auditor's office" });
const G2 = await grant(IRIS, { draft: D2, recipient: "Sam Ortiz, council staff" });
if (!G1?.ok || !G1.secret) bail("reviewgrant D1", G1);
if (!G2?.ok || !G2.secret) bail("reviewgrant D2", G2);
const S1 = G1.secret, S2 = G2.secret;
t("the grant is ATTRIBUTED — who issued it, to whom, and against which case edition",
  [G1.issuedBy, G1.recipient, G1.draftId, G1.caseId, G1.edition],
  ["iris", "Dana Ruiz, City Auditor's office", D1, C1, 2]);
t("the secret is shown once and is a long random value, not an id a caller could walk",
  [typeof S1, S1.length >= 40, S1 !== S2, S1.includes(G1.grantId)], ["string", true, true, false]);
t("a grant is REFUSED to a member who does not own the producing project",
  (await grant(VIC, { draft: D1, recipient: "x" }))?.reason, "REVIEW_NOT_PROJECT_OWNER");
t("and to a machine credential, by name",
  (await grant("mem-r126", { draft: D1, recipient: "x" }))?.reason, "MACHINE_CANNOT_REVIEW");
t("and a grant names its recipient — an addressed act with no addressee is not attributed",
  (await grant(IRIS, { draft: D1, recipient: "" }))?.reason, "REVIEW_NO_RECIPIENT");
{
  const listing = O1 && (await ownerRead(D1));
  const row = (listing?.grants || []).find((g) => g.grant_id === G1.grantId);
  t("THE STORED FINGERPRINT IS THE SHA-256 THIS SUITE COMPUTED, and is not the secret",
    [row?.secret_sha === sha(S1), row?.secret_sha !== S1], [true, true]);
  t("and the value appears NOWHERE in what a member reads back about the grant",
    JSON.stringify(listing).includes(S1), false);
}
t("STRUCTURALLY: the grant table carries `secret_sha` and has no column that could hold the value",
  (() => { const m = /CREATE TABLE IF NOT EXISTS review_grants \(([\s\S]*?)\n\);/.exec(SCHEMA_SRC);
           const body = m ? m[1] : "";
           return [!!m, /\bsecret_sha\b/.test(body), /^\s*secret\s/m.test(body)]; })(),
  [true, true, false]);
t("and the store is never handed the value: the secret is generated at the edge, as `aicredentialmint`'s is",
  /rv1_/.test(STORE_SRC), false);
t("THE RECIPIENT NEVER BECOMES A MEMBER — issuing two grants added nobody to the roster",
  (rP(await GET("op=memberlist&token=adm-r126"))?.members || []).length, membersBefore);

/* =========================================================================== 5
 * THE RECIPIENT READS ONE PRODUCTION AND NOTHING ELSE.
 * ========================================================================= */
console.log("\n--- 5. the recipient: one production, read and comment, and nothing else ---");
const recipientRead = (secret, extra = "") => rawOf(`op=reviewcopy&secret=${encodeURIComponent(secret)}${extra}`);
const R1raw = await recipientRead(S1);
const R1 = parsed(R1raw);
t("a recipient holding the secret reads THE ONE production, with no credential at all",
  [R1raw.status, R1?.kind, R1?.draft, R1?.reader, R1?.findings?.map((f) => f.target)],
  [200, "review-copy", D1, "recipient", [LEAD2]]);
t("and does NOT see the grant roster — who else was handed this copy is the issuer's to know",
  R1 && "grants" in R1, false);
t("A RECIPIENT OF AN INCOMPLETE DRAFT SEES WHAT IS MISSING — an honest gap is the normal case, not a "
+ "reason to withhold the copy (§6A.4)",
  [parsed(await recipientRead(S2))?.missing?.[0]?.reason], ["NOT_CONCLUDED"]);
const DEAD = await rawOf(`op=reviewcopy&secret=${encodeURIComponent("rv1_" + "A".repeat(43))}`);
t("NOT ANOTHER DRAFT: the secret for one draft, naming another, is the dead answer",
  await recipientRead(S1, `&draft=${D2}`), DEAD);
t("NOT AN ATTESTED ACT: the secret presented as a credential to op=publish is not a credential",
  [parsed(await rawPost(`op=publish&token=${encodeURIComponent(S1)}`, withRoles({ ...args(2), caseId: C1, targets: [LEAD2] })))?.ok,
   parsed(await rawPost(`op=caseratify&token=${encodeURIComponent(S1)}`, { caseId: C1, edition: 1 }))?.ok,
   parsed(await rawPost(`op=casedraft&token=${encodeURIComponent(S1)}`, withRoles({ ...args(2), caseId: C1, targets: [LEAD2] })))?.ok,
   parsed(await rawPost(`op=reviewgrant&token=${encodeURIComponent(S1)}`, { draft: D1, recipient: "self" }))?.ok],
  [false, false, false, false]);
t("and it is not a member's read either: op=list with the secret as a token reads nothing",
  parsed(await rawOf(`op=list&token=${encodeURIComponent(S1)}`))?.ok === true, false);

/* =========================================================================== 6
 * THE COMMENT: attributed, and a recipient's comment is a recipient's.
 * ========================================================================= */
console.log("\n--- 6. comments: a recipient's is a RECIPIENT's, a member's is a member's ---");
const RC = parsed(await rawPost(`op=reviewcomment&secret=${encodeURIComponent(S1)}`,
  { text: "Page 3 cites a memo I have not seen." }));
const MC = rP(await POST(`op=reviewcomment&draft=${D1}&token=${IRIS}`, { text: "We will attach the memo." }));
t("a recipient's comment is recorded as a RECIPIENT's, under the grant that admitted it, never as a member's",
  [RC?.ok, RC?.comment?.author_kind, RC?.comment?.grant_id, RC?.comment?.author === G1.grantId],
  [true, "recipient", G1.grantId, true]);
t("a member's comment is recorded as the member's",
  [MC?.ok, MC?.comment?.author_kind, MC?.comment?.author, MC?.comment?.grant_id], [true, "member", "iris", null]);
{
  const back = parsed(await recipientRead(S1));
  t("both are on the copy, each with its own kind and the recipient named as the issuer addressed them",
    (back?.comments || []).map((c) => [c.author_kind, c.text, c.recipient ?? null]),
    [["recipient", "Page 3 cites a memo I have not seen.", "Dana Ruiz, City Auditor's office"],
     ["member", "We will attach the memo.", null]]);
}
{
  /* THE LISTS' BOUND, DRIVEN in `bounds.test.mjs`'s loop shape (that suite lists
     `reviewcopy` in DRIVEN_ELSEWHERE and points here): a bite of 1 against two
     comments, `list_limit` read back as the CLAMPED cap, `comments_truncated`
     TRUE on the bite and FALSE at the default, and an over-ask answered at the
     ceiling. */
  const bite = rP(await GET(`op=reviewcopy&draft=${D1}&token=${IRIS}&limit=1`));
  const whole = rP(await GET(`op=reviewcopy&draft=${D1}&token=${IRIS}`));
  const over = rP(await GET(`op=reviewcopy&draft=${D1}&token=${IRIS}&limit=99999`));
  t("THE COPY'S LISTS ARE BOUNDED AND SAY SO: a bite of 1 over two comments is cut and says it was; the "
  + "default reads both and says it was not; an over-ask is answered at the published ceiling",
    [bite?.comments?.length, bite?.comments_truncated, bite?.list_limit,
     whole?.comments?.length, whole?.comments_truncated, over?.list_limit],
    [1, true, 1, 2, false, 500]);
}
t("a comment is refused with no text",
  parsed(await rawPost(`op=reviewcomment&secret=${encodeURIComponent(S1)}`, { text: "  " }))?.reason,
  "REVIEW_NO_COMMENT_TEXT");
t("a comment on ANOTHER draft with this draft's secret is the dead answer",
  (await rawPost(`op=reviewcomment&secret=${encodeURIComponent(S1)}&draft=${D2}`, { text: "x" })).body,
  (await rawPost(`op=reviewcomment&secret=${encodeURIComponent("rv1_" + "A".repeat(43))}`, { text: "x" })).body);

/* =========================================================================== 7
 * REVOCATION, AND THE ONE DEAD ANSWER.
 * ========================================================================= */
console.log("\n--- 7. revocation is real, and a dead secret is a secret that never existed ---");
t("revocation is REFUSED to a member who does not own the producing project",
  rP(await POST(`op=reviewrevoke&token=${VIC}`, { grant: G2.grantId }))?.reason, "REVIEW_NOT_PROJECT_OWNER");
const RV = rP(await POST(`op=reviewrevoke&token=${IRIS}`, { grant: G2.grantId }));
t("the owner revokes, and the revocation is attributed",
  [RV?.ok, RV?.revokedBy, typeof RV?.revokedAt], [true, "iris", "string"]);
const revoked = await recipientRead(S2);
t("THE REVOKED RECIPIENT READS NOTHING", parsed(revoked)?.kind === "review-copy", false);
const never = await recipientRead("rv1_" + "B".repeat(43));
const malformed = await recipientRead("not-a-secret");
const empty = await rawOf("op=reviewcopy&secret=");
t("REVOKED, NEVER-ISSUED AND MALFORMED ARE BYTE-IDENTICAL — status, content type and every byte of the body",
  [revoked, malformed, empty], [never, never, never]);
t("and the dead answer carries nothing about the grant it was: no id, no draft, no recipient",
  [revoked.body.includes(G2.grantId), revoked.body.includes(D2), revoked.body.includes("Sam Ortiz")],
  [false, false, false]);
t("the same holds for the COMMENT: revoked, never-issued and malformed secrets answer one set of bytes",
  [await rawPost(`op=reviewcomment&secret=${encodeURIComponent(S2)}`, { text: "x" }),
   await rawPost(`op=reviewcomment&secret=not-a-secret`, { text: "x" })],
  [await rawPost(`op=reviewcomment&secret=${encodeURIComponent("rv1_" + "B".repeat(43))}`, { text: "x" }),
   await rawPost(`op=reviewcomment&secret=${encodeURIComponent("rv1_" + "B".repeat(43))}`, { text: "x" })]);
t("a member with NO standing in the producing project is answered exactly as for a draft that does not exist",
  (await rawOf(`op=reviewcopy&draft=${D1}&token=${VIC}`)).body,
  (await rawOf(`op=reviewcopy&draft=DRAFT-2026-9999&token=${VIC}`)).body);
t("and so is a caller with nothing at all",
  (await rawOf(`op=reviewcopy&draft=${D1}`)).body, (await rawOf(`op=reviewcopy&draft=DRAFT-2026-9999`)).body);
t("a revocation that names no grant is the payload complaint it is, not an answer about what exists",
  rP(await POST(`op=reviewrevoke&token=${IRIS}`, {}))?.reason, "REVIEW_NO_GRANT");
t("revoking again is idempotent and says so",
  rP(await POST(`op=reviewrevoke&token=${IRIS}`, { grant: G2.grantId }))?.existed, true);

/* =========================================================================== 8
 * THE EDITION BINDING, driven across a real publication and a real signature.
 * ========================================================================= */
console.log("\n--- 8. bound to one case edition: the unsigned document of THAT edition, and no other ---");
const pub2 = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(2), caseId: C1, targets: [LEAD2] })));
if (pub2.ok === false || pub2.caseDocument?.edition !== 2) bail("publish edition 2", pub2);
const docAnon2 = await rawOf(`op=casedocument&case=${C1}&edition=2`);
t("REC-130's gap-1 party, now built: a LIVE GRANT HOLDER reads the UNSIGNED case document of the edition "
+ "the grant is bound to, while a stranger is answered as for a case that does not exist",
  [parsed(await rawOf(`op=casedocument&case=${C1}&edition=2&secret=${encodeURIComponent(S1)}`))?.ratified,
   parsed(docAnon2)?.reason],
  [false, "NO_CASE_DOCUMENT"]);
t("A REVOKED grant holder is the stranger again",
  (await rawOf(`op=casedocument&case=${C1}&edition=2&secret=${encodeURIComponent(S2)}`)).body, docAnon2.body);
const pubNew = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(1), targets: [LEAD5] })));
if (pubNew.ok === false) bail("publish a new case", pubNew);
const C2 = pubNew.caseDocument.case_id;
t("THE DRY RUNS ROLLED BACK THE CASE-ID SEQUENCE TOO: the passing new-case draft had its every gate run — "
+ "which mints a case id inside the act — each time it was read, and the next real case is still the second "
+ "id ever minted",
  [O5?.gates, C2.slice(-4)], ["passed", "0002"]);
t("NOT ANOTHER CASE: the secret reads another case's unsigned document exactly as a stranger does",
  (await rawOf(`op=casedocument&case=${C2}&edition=1&secret=${encodeURIComponent(S1)}`)).body,
  (await rawOf(`op=casedocument&case=${C2}&edition=1`)).body);
{
  const r = rP(await POST(`op=caseratify&token=${IRIS}`, { caseId: C1, edition: 2,
    expectedSha: pub2.caseDocument.doc_sha, sig: signCase("iris", C1, 2, pub2.caseDocument.doc_sha) }));
  if (r.ok === false) bail("caseratify edition 2", r);
}
t("once edition 2 is SIGNED the draft stands at edition 3, and the grant bound to edition 2 is DEAD — "
+ "byte-identical to a secret that never existed",
  [await recipientRead(S1), (await ownerRead(D1))?.case?.edition], [never, 3]);
const pub3 = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(3), caseId: C1, targets: [LEAD4] })));
if (pub3.ok === false || pub3.caseDocument?.edition !== 3) bail("publish edition 3", pub3);
t("NOT ANOTHER EDITION: the edition-2 secret reads the UNSIGNED edition-3 document exactly as a stranger does",
  (await rawOf(`op=casedocument&case=${C1}&edition=3&secret=${encodeURIComponent(S1)}`)).body,
  (await rawOf(`op=casedocument&case=${C1}&edition=3`)).body);
t("and the owner still reads the draft, now at edition 3 — the copy is MUTABLE and its grants are not",
  (await ownerRead(D1))?.ok, true);

console.log(`\nreviewcopy: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
