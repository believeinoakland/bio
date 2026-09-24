/* NEGATIVE CONTROL: RUN 2026-09-23 in /home/user/bio on land/worker/D-150, each arm ALONE on `src/store.mjs`, declared before arming, every restore by `cp` from a per-arm pristine copy verified by sha256 (a514ff99…f20b8, `sha256sum -c` OK) AND `cmp` (content identical, 2924150 bytes) — never `git checkout --`.
   (0) BASELINE, nothing armed -> 34 pass, 0 fail.
   (a) THE GATE THE RULE FORBIDS — `publishCase` refuses NO_ACKNOWLEDGEMENT when nobody but the author acknowledged the statement. Declared: MUST FAIL the one-member arm by name; MUST NOT fail block 1's refusals -> 17 pass, 4 fail: the THREE `ONE-MEMBER:` arms of block 4 by name, then block 5's fixture aborts (`publish doc`, a case with no acknowledgement — the same gate). AS DECLARED.
   (b) THE AUTHOR'S OWN — the STATEMENT_ACK_BY_ITS_AUTHOR refusal disarmed. Declared: MUST FAIL block 1's author arm and block 5's -> 30 pass, 4 fail: those two, block 4's one-member author arm, and block 1's review-copy list (iris's self-acknowledgement landed, so the list reads three). One more than declared, in the declared direction.
   (c) THE LIST NOT WRITTEN — `publishCase` hands the case document an empty list. Declared: MUST FAIL block 3's signed-bytes arms; MUST NOT fail block 4 -> 31 pass, 3 fail: block 3's signed block, its prose and the published case's committed list; block 4 green. AS DECLARED.

   RUN 2026-09-24 by c19-unionfix on block 8 (IC-246), each arm ALONE on `src/store.mjs`, declared before arming,
   restored by cp from a per-arm pristine copy verified by sha256 AND cmp (3,160,297 B). Baseline 40/0.
   (sa) A SILENT CUT — the documents read AT the bound (`ackMax`, not `ackMax + 1`), so the refusal can never fire.
   Declared: the refusal and nothing-written arms fail -> 36/4: those two, and the at-the-bound and DELTA arms
   (the cut had already re-authored eight documents and recorded the acknowledgement, so the later act is not new).
   Its first run ended the module at the fixture's signature (the cut had made the recorded sha stale); the
   INSTRUMENT was corrected to sign the bytes the document holds, never the arm.
   (proj) THE PROJECT MATCHED ONLY AFTER THE READ — `instr(text, projectLine)` removed from the statement. Declared:
   the at-the-bound arm fails -> 38/2: it and the DELTA — the other project's same-sentence document is the ninth
   row, so the act refuses where it should land. The refusal and nothing-written arms stay green.

   D-150 / BIO_Publication_v0_1.md §3 rule 11 (BOB #27, 2026-09-22) — THE EXCLUSION STATEMENT IS
   CHECKED BY A SECOND PERSON, AND THE CHECK IS DISCLOSED, NEVER ENFORCED.

   Every block is one sentence of the rule, driven through the control plane (`op=statementack`,
   `op=publish`, `op=caseratify`, `op=casedocument`, `op=publishedcase`, `op=reviewcopy`), never
   through the store:
     1. an acknowledgement is an authored, attributed, dated act by a JOINED participant other than
        the statement's author, or by a review-copy recipient through their grant — and the author's
        own is REFUSED BY NAME, as are an invited-not-joined member and an administrator;
     2. it is of ONE statement text: an edited statement starts with none;
     3. the SIGNED completeness block lists them (accepts-when, first clause), and the published case
        serves the list committed from the signed bytes;
     4. THE ONE-MEMBER ARM (accepts-when, second clause): a case nobody else acknowledged PUBLISHES
        and SAYS SO, in the frontmatter and in the prose — never refused for want of one;
     5. an unsigned case document can be acknowledged too, and the act RE-AUTHORS it to list the
        acknowledgement (its hash moves, so the owner signs what names the second reader); a signed
        one refuses by name;
     6. the member who publishes is the statement's author at that act, and their own
        acknowledgement is left out and counted;
     7. the catalogue refuses bytes that list the author as their own second reader (C-41.10).

   WHAT A LIAR WOULD DO AND WHICH ARM CATCHES IT: a gate demanding an acknowledgement passes every
   listing arm and fails block 4 by name (the control's arm (a)); a list read at the wrong moment, or
   never written, passes the act arms and fails block 3's signed-bytes arms (arm (c)); an
   author-acknowledges-self path passes the listing arms and fails block 1's refusal (arm (b)).
   EXPECTATIONS ARE NOT DERIVED FROM THE THING UNDER TEST: every statement is the string this suite
   passed in, and every fingerprint is computed here with node:crypto, sharing no code with `src/`. */

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
import { checkCaseDocument, parseFrontmatter } from "../checks/bio-checks.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- d150-statement-acknowledgement ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("d150-statement-acknowledgement: SKIPPED — ssh-keygen not on PATH; the listing is asserted in a "
    + "case document a member really signed");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d150", MEMBER_TOKEN: "mem-d150", PROBE_TOKEN: "prb-d150", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const bail = (what, r) => {
  console.log(`  FAIL  (fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`);
  fail++;
  console.log(`\nd150-statement-acknowledgement: ${pass} pass, ${fail} fail  [FIXTURE ABORTED]`);
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
const dir = mkdtempSync(join(tmpdir(), "d150-"));
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
  const add = rP(await POST("op=memberadd&token=adm-d150",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
await enrol("nadia", "nadia-passphrase-150", "admin", ["contribute", "publish", "create_projects"]);
/* iris OWNS PROJ and signs; ella is a JOINED participant (the second reader); pat is INVITED and
   NOT joined; omar is an ADMINISTRATOR with sight of every project and a place in none; sol OWNS a
   project of ONE member (Design Requirement 2). */
const OMAR = await enrol("omar", "omar-passphrase-150", "admin", ["contribute", "publish"]);
const IRIS = await enrol("iris", "iris-passphrase-150", "member", ["contribute", "publish"]);
const ELLA = await enrol("ella", "ella-passphrase-150", "member", ["contribute", "publish"]);
const PAT = await enrol("pat", "pat-passphrase-150", "member", ["contribute", "publish"]);
const SOL = await enrol("sol", "sol-passphrase-150", "member", ["contribute", "publish"]);
for (const who of ["iris", "sol"])
  rP(await POST("op=signeradd&token=adm-d150", { keyB64: mkKey(who), memberId: who, comment: `${who} laptop` }));

const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-d150", owner: "iris",
  name: "PROJ-2026-1500-second-reader", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
const SOLO = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-d150", owner: "sol",
  name: "PROJ-2026-1501-one-member", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
for (const [h, tok, join] of [["ella", ELLA, true], ["pat", PAT, false]]) {
  const inv = rP(await GET(`op=projectinvite&token=${IRIS}&projectId=${encodeURIComponent(PROJ)}&handle=${h}`));
  if (!inv?.ok) bail(`projectinvite ${h}`, inv);
  if (join) {
    const jn = rP(await GET(`op=projectjoin&token=${tok}&projectId=${encodeURIComponent(PROJ)}`));
    if (jn?.state !== "joined") bail(`projectjoin ${h}`, jn);
  }
}

/* ---- the corpus: reviewcopy.test.mjs's shapes, lifted rather than invented ---- */
let snapSeq = 0;
const promote = async (id, text, objectType, state) => rP(await POST("op=promote&token=adm-d150", {
  bundleId: id, base: null,
  snapKey: `20260923T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
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

const INFO = "INFO-2026-1500-memo";
const LEAD = "INQ-2026-1500-lead";      /* the case a participant AND a recipient acknowledge through a draft */
const DOCQ = "INQ-2026-1500-doc";       /* the case acknowledged through its unsigned case document */
const PUBQ = "INQ-2026-1500-publisher"; /* the case whose publisher had acknowledged an editor's statement */
const SOLQ = "INQ-2026-1500-solo";      /* the one-member project's case */
const Q = { [LEAD]: "Was the transfer authorised?", [DOCQ]: "Was notice given?",
            [PUBQ]: "Was the auditor told?", [SOLQ]: "Who signed the memo?" };
if ((await promote(INFO, infoMd(INFO), "information", "collected")).ok === false) bail("promote info", {});
for (const id of Object.keys(Q)) {
  const r = await promote(id, withAdoptableReading(inquiryMd(id, Q[id], INFO)), "inquiry", "open");
  if (r.ok === false) bail(`promote ${id}`, r);
}
for (const [id, tok] of [[LEAD, IRIS], [DOCQ, IRIS], [PUBQ, IRIS], [SOLQ, SOL]]) {
  const r = rP(await GET(`op=conclude&token=${tok}&target=${encodeURIComponent(id)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id}.`)}`
    + adoptedVersionParam()));
  if (!r.ok) bail(`conclude ${id}`, r);
}

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
const docOf = async (caseId, edition, token) =>
  rP(await GET(`op=casedocument&case=${caseId}&edition=${edition}&token=${token}`));
const ratify = async (who, token, caseId, edition, docSha) =>
  rP(await POST(`op=caseratify&token=${token}`, { caseId, edition, expectedSha: docSha,
                                                  sig: signCase(who, caseId, edition, docSha) }));

console.log("\n--- d150-statement-acknowledgement ---");

/* =========================================================================== 1 */
console.log("\n--- 1. who may acknowledge: a second person with a place in the project, or a recipient ---");
const D1r = rP(await POST(`op=casedraft&token=${IRIS}`, withRoles({ ...args(PROJ, "lead"), targets: [LEAD] })));
if (!D1r?.ok) bail("casedraft D1", D1r);
const D1 = D1r.draftId;
const G1 = rP(await POST(`op=reviewgrant&token=${IRIS}`, { draft: D1, recipient: "Dana Ruiz, City Auditor's office" }));
if (!G1?.ok || !G1.secret) bail("reviewgrant D1", G1);
const STMT = args(PROJ, "lead").statement;

t("THE AUTHOR'S OWN ACKNOWLEDGEMENT IS REFUSED BY NAME — iris wrote the draft's statement, and rule 11 is a "
+ "SECOND person",
  [(await ack(`draft=${D1}&token=${IRIS}`))?.reason], ["STATEMENT_ACK_BY_ITS_AUTHOR"]);
t("an INVITED member who has not joined is refused by name — view rights are not a place in the project",
  (await ack(`draft=${D1}&token=${PAT}`))?.reason, "STATEMENT_ACK_NOT_A_PARTICIPANT");
t("and so is an ADMINISTRATOR: sight of every project is a place in none",
  (await ack(`draft=${D1}&token=${OMAR}`))?.reason, "STATEMENT_ACK_NOT_A_PARTICIPANT");
t("a caller with neither a grant nor a session, and a machine credential, get the review copy's ONE dead answer",
  [(await ack(`draft=${D1}`))?.reason, (await ack(`draft=${D1}&token=mem-d150`))?.reason],
  ["NO_REVIEW_COPY", "NO_REVIEW_COPY"]);
t("a member of ANOTHER project (sol) cannot even see the draft, and is answered as for a draft that does not exist",
  (await ack(`draft=${D1}&token=${SOL}`))?.reason, "NO_REVIEW_COPY");

const A1 = await ack(`draft=${D1}&token=${ELLA}`);
t("A JOINED PARTICIPANT ACKNOWLEDGES — attributed to her, dated, of THIS statement's hash (computed here), at "
+ "the draft's case identity (a new case, edition 1)",
  [A1?.ok, A1?.existed, A1?.acknowledgement?.kind, A1?.acknowledgement?.by,
   A1?.acknowledgement?.statement_sha === sha(STMT), A1?.acknowledgement?.case_id, A1?.acknowledgement?.edition,
   /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(A1?.acknowledgement?.at || "")],
  [true, false, "participant", "ella", true, null, 1, true]);
t("and again is the SAME act, not a second one",
  [(await ack(`draft=${D1}&token=${ELLA}`))?.existed], [true]);
const A2 = await ack(`draft=${D1}&secret=${encodeURIComponent(G1.secret)}`);
t("A REVIEW-COPY RECIPIENT ACKNOWLEDGES THROUGH THEIR GRANT — attributed to the grant and the addressee its "
+ "issuer named, never to a member",
  [A2?.ok, A2?.acknowledgement?.kind, A2?.acknowledgement?.by, A2?.acknowledgement?.recipient],
  [true, "recipient", G1.grantId, "Dana Ruiz, City Auditor's office"]);
{
  const De = rP(await POST(`op=casedraft&token=${IRIS}`,
    withRoles({ ...args(PROJ, "empty", { statement: "" }), targets: [DOCQ] })));
  t("a draft that states nothing about what its case excludes has no statement to acknowledge — refused by name",
    (await ack(`draft=${De?.draftId}&token=${ELLA}`))?.reason, "STATEMENT_ACK_NO_STATEMENT");
}
t("a secret that was never issued gets the dead answer",
  (await ack(`draft=${D1}&secret=rv1_not-a-real-secret`))?.reason, "NO_REVIEW_COPY");
{
  const copy = rP(await GET(`op=reviewcopy&draft=${D1}&token=${IRIS}`));
  t("the review copy shows who has acknowledged the statement AS IT STANDS — the list op=publish would print",
    [copy?.statement_acknowledgements?.statement_sha === sha(STMT),
     (copy?.statement_acknowledgements?.acknowledgements || []).map((a) => [a.kind, a.by])],
    [true, [["participant", "ella"], ["recipient", G1.grantId]]]);
}

/* =========================================================================== 2 */
console.log("\n--- 2. an acknowledgement is of ONE sentence: an edited statement starts with none ---");
{
  const Dx = rP(await POST(`op=casedraft&token=${IRIS}`, withRoles({ ...args(PROJ, "edited"), targets: [DOCQ] })));
  if (!Dx?.ok) bail("casedraft Dx", Dx);
  if (!(await ack(`draft=${Dx.draftId}&token=${ELLA}`))?.ok) bail("ack Dx", {});
  const before = rP(await GET(`op=reviewcopy&draft=${Dx.draftId}&token=${IRIS}`));
  const ed = rP(await POST(`op=casedraft&token=${IRIS}`, { draft: Dx.draftId,
    ...withRoles({ ...args(PROJ, "edited", { statement: "A different sentence about what is left out." }),
                   targets: [DOCQ] }) }));
  if (!ed?.ok) bail("edit Dx", ed);
  const after = rP(await GET(`op=reviewcopy&draft=${Dx.draftId}&token=${IRIS}`));
  t("acknowledged, then the statement is EDITED: the new sentence has no second reader, and the old act is not "
  + "carried onto it",
    [before?.statement_acknowledgements?.acknowledgements?.length,
     after?.statement_acknowledgements?.acknowledgements?.length,
     after?.statement_acknowledgements?.statement_sha === sha("A different sentence about what is left out.")],
    [1, 0, true]);
}

/* =========================================================================== 3 */
console.log("\n--- 3. the SIGNED completeness block lists them ---");
const pubA = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(PROJ, "lead"), targets: [LEAD] })));
if (pubA?.ok === false || !pubA?.caseDocument?.doc_sha) bail("publish lead", pubA);
const CA = pubA.caseDocument.case_id;
t("op=publish answers the list it just wrote into the case document, in order, with the statement's hash",
  [pubA?.completeness?.statement_sha === sha(STMT),
   (pubA?.completeness?.acknowledgements || []).map((a) => [a.kind, a.by, a.recipient])],
  [true, [["participant", "ella", null], ["recipient", G1.grantId, "Dana Ruiz, City Auditor's office"]]]);
{
  const r = await ratify("iris", IRIS, CA, 1, pubA.caseDocument.doc_sha);
  if (r?.ok === false) bail("caseratify lead", r);
  const doc = await docOf(CA, 1, IRIS);
  const fm = fmOf(doc?.text);
  t("IN THE SIGNED BYTES: the document is ratified, its completeness block names the statement's hash and a count "
  + "of 2, and its list names ella and the grant",
    [doc?.ratified, doc?.doc_sha === sha(doc?.text || ""), fm.completeness?.statement_sha === sha(STMT),
     fm.completeness?.acknowledged,
     (fm.completeness_acknowledgements || []).map((a) => [a.kind, a.by])],
    [true, true, true, 2, [["participant", "ella"], ["recipient", G1.grantId]]]);
  t("AND IN THE PROSE a member reviewed and signed, beside the statement: both second readers named",
    [/Who else read this statement\.\*\* Acknowledged/.test(doc?.text || ""),
     (doc?.text || "").includes("- ella, a participant of " + PROJ),
     (doc?.text || "").includes(`review grant ${G1.grantId}, addressed by its issuer as 'Dana Ruiz, City Auditor's office'`)],
    [true, true, true]);
  const pc = rP(await GET(`op=publishedcase&id=${CA}`));
  t("the published case serves the list COMMITTED FROM THE SIGNED BYTES, to a caller with no credential",
    (pc?.completeness?.acknowledgements || pc?.case?.completeness?.acknowledgements || []).map((a) => [a.kind, a.by]),
    [["participant", "ella"], ["recipient", G1.grantId]]);
}

/* =========================================================================== 4 */
console.log("\n--- 4. THE ONE-MEMBER ARM: a case nobody else acknowledged publishes, and says so ---");
{
  const Ds = rP(await POST(`op=casedraft&token=${SOL}`, withRoles({ ...args(SOLO, "solo"), targets: [SOLQ] })));
  t("in a project of one, the only member is the statement's author, and cannot be its second reader",
    (await ack(`draft=${Ds?.draftId}&token=${SOL}`))?.reason, "STATEMENT_ACK_BY_ITS_AUTHOR");
  const p = rP(await POST(`op=publish&token=${SOL}`, withRoles({ ...args(SOLO, "solo"), targets: [SOLQ] })));
  t("ONE-MEMBER: op=publish is NOT refused for want of an acknowledgement (a group may be one person)",
    [p?.ok !== false, p?.reason ?? null, (p?.completeness?.acknowledgements || []).length], [true, null, 0]);
  const CS = p?.caseDocument?.case_id;
  const r = CS ? await ratify("sol", SOL, CS, 1, p.caseDocument.doc_sha) : null;
  const doc = CS ? await docOf(CS, 1, SOL) : null;
  const fm = fmOf(doc?.text);
  t("ONE-MEMBER: the case is SIGNED, and its signed block SAYS nobody but its author acknowledged the statement — "
  + "a count of 0 and an empty list, never an absent key",
    [r?.ok !== false, doc?.ratified, fm.completeness?.acknowledged, fm.completeness_acknowledgements,
     /Nobody but its author acknowledged it\./.test(doc?.text || "")],
    [true, true, 0, [], true]);
  const pc = CS ? rP(await GET(`op=publishedcase&id=${CS}`)) : null;
  t("ONE-MEMBER: the published case serves an EMPTY list (a statement) — not null, which is reserved for a document "
  + "that says nothing about acknowledgements",
    pc?.completeness?.acknowledgements ?? pc?.case?.completeness?.acknowledgements ?? "absent", []);
}

/* =========================================================================== 5 */
console.log("\n--- 5. an unsigned case document can be acknowledged; a signed one cannot ---");
const pubB = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(PROJ, "doc"), targets: [DOCQ] })));
if (pubB?.ok === false || !pubB?.caseDocument?.doc_sha) bail("publish doc", pubB);
const CB = pubB.caseDocument.case_id;
pubB.__text = (await docOf(CB, 1, IRIS))?.text;
t("published with nobody else's acknowledgement: the unsigned document says 0 and lists none",
  [fmOf((await docOf(CB, 1, IRIS))?.text).completeness?.acknowledged,
   fmOf((await docOf(CB, 1, IRIS))?.text).completeness_acknowledgements],
  [0, []]);
t("its author (who published it) acknowledging it is refused BY NAME",
  (await ack(`case=${CB}&edition=1&token=${IRIS}`))?.reason, "STATEMENT_ACK_BY_ITS_AUTHOR");
const B1 = await ack(`case=${CB}&edition=1&token=${ELLA}`);
const B1doc = (B1?.case_documents || [])[0] || {};
t("a joined participant acknowledges the UNSIGNED document, and the act RE-AUTHORS it to list her — a new hash, "
+ "because op=publish cannot run twice over one prepared edition",
  [B1?.ok, B1?.acknowledgement?.case_id, B1?.acknowledgement?.edition, B1doc.case_id, B1doc.reauthored,
   B1doc.doc_sha !== pubB.caseDocument.doc_sha, B1doc.acknowledged],
  [true, CB, 1, CB, true, true, 1]);
{
  const doc = await docOf(CB, 1, IRIS);
  const fm = fmOf(doc?.text);
  t("the re-authored document names her in the block and in the prose, and its hash is the one served",
    [doc?.doc_sha === B1doc.doc_sha, doc?.doc_sha === sha(doc?.text || ""), fm.completeness?.acknowledged,
     (fm.completeness_acknowledgements || []).map((a) => a.by),
     (doc?.text || "").includes("- ella, a participant of " + PROJ),
     /Nobody but its author/.test(doc?.text || "")],
    [true, true, 1, ["ella"], true, false]);
  t("and ONLY the list moved: the document with the list lines removed is the document op=publish authored, "
  + "with its list lines removed",
    [doc?.text.split("\n").filter((l) => !/acknowledg|Acknowledg|^  statement_sha:|^    (kind|by|recipient|at):|^  - kind:|^- ella|^$/.test(l)).join("\n")
       === pubB.__text?.split("\n").filter((l) => !/acknowledg|Acknowledg|^  statement_sha:|^    (kind|by|recipient|at):|^  - kind:|^- ella|^$/.test(l)).join("\n")],
    [true]);
}
t("naming neither a draft nor a case edition is refused by name",
  (await ack(`token=${ELLA}`))?.reason, "STATEMENT_ACK_NO_SUBJECT");
t("a signature over the bytes as FIRST authored is refused as stale — the owner signs what lists the second reader",
  (await ratify("iris", IRIS, CB, 1, pubB.caseDocument.doc_sha))?.reason, "CASE_RATIFY_STALE");
{
  const r = await ratify("iris", IRIS, CB, 1, B1doc.doc_sha);
  if (r?.ok === false) bail("caseratify doc", r);
}
t("SIGNED, the edition refuses a further acknowledgement by name — the list is inside a signature now",
  (await ack(`case=${CB}&edition=1&token=${ELLA}`))?.reason, "STATEMENT_ACK_ALREADY_SIGNED");

/* =========================================================================== 6 */
console.log("\n--- 6. the member who publishes becomes the statement's author, and their own is left out ---");
{
  const De = rP(await POST(`op=casedraft&token=${ELLA}`, withRoles({ ...args(PROJ, "publisher"), targets: [PUBQ] })));
  if (!De?.ok) bail("casedraft De", De);
  const ai = await ack(`draft=${De.draftId}&token=${IRIS}`);
  t("the OWNER may acknowledge an EDITOR's statement — the draft's statement is ella's",
    [ai?.ok, ai?.acknowledgement?.by], [true, "iris"]);
  const p = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(PROJ, "publisher"), targets: [PUBQ] })));
  if (p?.ok === false) bail("publish publisher", p);
  const fm = fmOf((await docOf(p.caseDocument.case_id, 1, IRIS))?.text);
  t("but iris PUBLISHES it, becoming its author at that act: her acknowledgement is NOT listed, the document says "
  + "0, and the act's answer counts the one it left out",
    [fm.completeness?.author, fm.completeness?.acknowledged, fm.completeness_acknowledgements,
     p?.completeness?.acknowledgements_by_author_not_listed],
    ["iris", 0, [], 1]);
}

/* =========================================================================== 7 */
console.log("\n--- 7. the gate: bytes listing the author as their own second reader are refused (C-41.10) ---");
{
  const good = fmOf((await docOf(CA, 1, IRIS))?.text);
  const errs = (fm) => checkCaseDocument(fm, { caseId: CA, edition: 1 })
    .filter((x) => x.severity === "error" && /acknowledg/.test(x.message || x.msg || "")).map((x) => x.check);
  t("the signed document op=publish authored raises no acknowledgement finding",
    errs(good), []);
  const self = { ...good, completeness_acknowledgements: [{ kind: "participant", by: good.completeness.author,
                                                            recipient: null, at: "2026-09-23T00:00:00Z" }],
                 completeness: { ...good.completeness, acknowledged: 1 } };
  t("a document listing its statement's AUTHOR as having acknowledged it is refused, C-41.10",
    errs(self), ["C-41.10"]);
  const miscount = { ...good, completeness: { ...good.completeness, acknowledged: 5 } };
  t("and so is a count that disagrees with its own list", errs(miscount), ["C-41.10"]);
  /* CORRECTED 2026-09-24 (REC-188), never exempted: this arm deleted the list from the document op=publish
     had JUST authored and asserted no refusal. That was right while op=publish authored `bio-case-document/2`,
     which is the shape a document authored before acknowledgements were recorded carries. REC-188 moved
     op=publish to `/3`, which is OBLIGED to carry the list (C-41.13), so a /3 document without it is exactly
     what the row refuses — the old assertion would now demand the hole the row closes. The property this
     arm guards is about what ALREADY CROSSED, and that is a /2 document: so the arm now states /2, and the
     /3 counterpart is asserted by `d84-case-manifest.test.mjs` section 4. */
  const legacy = { ...good, format: "bio-case-document/2" };
  delete legacy.completeness_acknowledgements;
  t("a /2 document with NO list (authored before acknowledgements were recorded) is not refused — what already "
  + "crossed stays crossed", errs(legacy), []);
}

/* =========================================================================== 8 */
console.log("\n--- 8. IC-246: more unsigned documents than one act re-authors REFUSES, and writes nothing ---");
/* Added at integration by c19-unionfix (2026-09-24, CONDUCT #19's spec), with the REAL bite: MAX + 1 unsigned case
   documents of ONE statement in ONE project, reached through a draft (a new case: identity null, edition 1, so every
   such edition-1 document is the act's to re-author), plus a document of the SAME SENTENCE in ANOTHER project.
   Two defects of D-150's first cut are driven here: over the bound it CUT silently (`LIMIT 8`), leaving the ninth
   document listing fewer second readers than the record held for its owner to sign; and it filtered the project
   AFTER that limit, so another project's documents could crowd this one's out. */
{
  const SA_MAX = Number((/static STATEMENT_ACK_DOCUMENTS_MAX = (\d+);/.exec(
    readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8")) || [])[1]);
  const MANY = Array.from({ length: SA_MAX + 1 }, (_, i) => `INQ-2026-1500-many${String(i).padStart(2, "0")}`);
  const OTHER = "INQ-2026-1500-manysolo";
  for (const [id, tok] of [...MANY.map((m) => [m, IRIS]), [OTHER, SOL]]) {
    const r = await promote(id, withAdoptableReading(inquiryMd(id, `Was notice ${id} given?`, INFO)), "inquiry", "open");
    if (r.ok === false) bail(`promote ${id}`, r);
    const c = rP(await GET(`op=conclude&token=${tok}&target=${encodeURIComponent(id)}`
      + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo.`)}`
      + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id}.`)}` + adoptedVersionParam()));
    if (!c.ok) bail(`conclude ${id}`, c);
  }
  const pubs = [];
  for (const id of MANY) {
    const p = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(PROJ, "many"), targets: [id] })));
    if (p?.ok === false || !p?.caseDocument?.doc_sha) bail(`publish ${id}`, p);
    pubs.push({ caseId: p.caseDocument.case_id, sha: p.caseDocument.doc_sha });
  }
  const po = rP(await POST(`op=publish&token=${SOL}`, withRoles({ ...args(SOLO, "many"), targets: [OTHER] })));
  if (po?.ok === false || !po?.caseDocument?.doc_sha) bail("publish other project", po);
  const Dm = rP(await POST(`op=casedraft&token=${IRIS}`, withRoles({ ...args(PROJ, "many"), targets: [MANY[0]] })));
  if (!Dm?.ok) bail("casedraft many", Dm);
  const shaNow = async () => [...(await Promise.all(pubs.map(async (x) => (await docOf(x.caseId, 1, IRIS))?.doc_sha))),
                              (await docOf(po.caseDocument.case_id, 1, SOL))?.doc_sha];
  const before = await shaNow();
  t("FIXTURE ARMS THE TRAP: STATEMENT_ACK_DOCUMENTS_MAX is a number and there are MAX + 1 unsigned documents of this "
  + "one statement in this project, and one more of the same sentence in ANOTHER project",
    [Number.isInteger(SA_MAX) && SA_MAX > 0, pubs.length, new Set(pubs.map((x) => x.caseId)).size,
     before.every((x) => typeof x === "string"), fmOf((await docOf(po.caseDocument.case_id, 1, SOL))?.text).case_project],
    [true, SA_MAX + 1, SA_MAX + 1, true, SOLO]);
  const over = await ack(`draft=${Dm.draftId}&token=${ELLA}`);
  t("OVER THE BOUND THE ACT IS REFUSED BY NAME (C-82.1), naming the bound, the statement and the case identity — "
  + "never a silent cut",
    [over?.ok, over?.reason, over?.check, typeof over?.translation, over?.limit, over?.edition, over?.case_id,
     /^[0-9a-f]{64}$/.test(over?.statement_sha || "")],
    [false, "STATEMENT_ACK_DOCUMENTS_OVER_BOUND", "C-82.1", "string", SA_MAX, 1, null, true]);
  t("and NOTHING WAS WRITTEN: every document, this project's and the other's, holds the bytes it was authored with",
    await shaNow(), before);
  /* The owner signs the bytes the document HOLDS NOW, read back, so an arm that re-authored it (a silent cut) is
     measured by the arms below rather than ending the module at a stale signature. */
  const signed = await ratify("iris", IRIS, pubs[0].caseId, 1, (await docOf(pubs[0].caseId, 1, IRIS))?.doc_sha);
  if (signed?.ok === false) bail("caseratify many00", signed);
  const at = await ack(`draft=${Dm.draftId}&token=${ELLA}`);
  const after = await shaNow();
  t("AT THE BOUND — one document signed, MAX unsigned remain — the act LANDS, is NEW (the refusal wrote no "
  + "acknowledgement), and re-authors EXACTLY those MAX documents, publishing the bound",
    [at?.ok, at?.existed, (at?.case_documents || []).map((d) => d.case_id).sort(),
     (at?.case_documents || []).every((d) => d.reauthored), at?.case_documents_limit, at?.case_documents_truncated],
    [true, false, pubs.slice(1).map((x) => x.caseId).sort(), true, SA_MAX, false]);
  t("the OTHER project's document of the same sentence is untouched — the project is matched in the statement, "
  + "never after a cut it could crowd",
    after[after.length - 1], before[before.length - 1]);
  t("DELTA: 'more than one act may re-author' and 'every one of them re-authored' do NOT read alike",
    [over?.ok, at?.ok], [false, true]);
}

console.log(`\nd150-statement-acknowledgement: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
