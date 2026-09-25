/* NEGATIVE CONTROL: RUN 2026-09-24 by the REC-212 worker in /home/user/bio on land/worker/REC-212, each arm
   ALONE (others restored and verified first), declared BEFORE arming, every restore by `cp` from a
   UNIQUELY-NAMED per-arm pristine copy in the session scratchpad, verified by sha256 (`sha256sum -c` OK) AND
   by `cmp` (content identical) with its byte count printed and floored — never `git checkout --`. The suites
   run `src/index.mjs` and `checks/bio-checks.mjs` directly, so no bundle rebuild is in the loop.
   (0) BASELINE, nothing armed -> rec212 41 pass, 0 fail; d150 49 pass, 0 fail.
   (a) THE ROW'S OWN CONTROL — C-41.10 POINTED BACK AT `author`: the writer branch of the exclusion made
   unreachable (`false &&`), so the only name it reads is `completeness.author`. Declared: MUST FAIL block 3's
   two writer rows; MUST NOT fail blocks 1, 2, 4, 5, 6, 7, block 3's other rows, or d150. Result: rec212 38
   pass, 2 FAIL — exactly those two, the refusal row reading `[true, []]` where it wants `[false, ["C-41.10"]]`
   (the writer's own acknowledgement ADMITTED, which is the defect). d150 49/0, as declared: its fixture's
   writer and publisher are both iris, so the publisher branch still catches its arm — which is why that
   suite could never have found this and why this one exists.
       THE ARM'S FIRST RUN FOUND THE INSTRUMENT WRONG, NOT THE SUBJECT, and it is recorded rather than
   smoothed: three rows reached `gate(...).findings[0].detail` on a gate that — correctly, with the arm in —
   returned NO findings, and the TypeError ENDED THE MODULE at block 3 of 7. Nine arms never ran, no tally
   printed, and the run was indistinguishable from a suite that merely stops (`kickoffs/WORKER.md`'s own
   receipt). `detailOf`/`repairsOf` now read the finding BY CHECK and answer "" when there is none, so a
   missing refusal fails an assertion instead of silencing the file. The figures above are the re-run.
   (b) THE BACK-FILL THE ROW FORBIDS — `#statementWriter`'s two UNDETERMINED returns changed to
   `by: publisher`, which is *never back-filled from `author`* inverted, at the two sites that decide it.
   Declared: MUST FAIL every row that names `null` as the writer (block 5's, block 6's undetermined row,
   block 7's totality); MUST NOT fail blocks 1-4 or block 3's hand-built arms. First run: 33 pass, 7 FAIL —
   as declared, EXCEPT that block 5's PROSE row PASSED over bytes whose frontmatter now named iris.
   A SURPRISING GREEN, AND IT WAS A HOLE IN THIS SUITE: the prose row is coupled to the SENTENCE and the key
   row to the KEY, and the arm moved only the key — so a case document contradicting itself under a
   signature (frontmatter naming a writer, body disclaiming one) would have passed. An agreement row was
   added asserting the two as a RELATION, and the arm re-run ALONE against it: 33 pass, 8 FAIL, the new row
   among them. d150 49/0 both times.
   (c) OVER-STRICTNESS — A FENCE TIGHTER THAN ITS RULE: both exclusions widened to RECIPIENT rows as well as
   participants. Correct work in a spelling the rule allows must PASS, and this arm makes it fail. Declared:
   MUST FAIL block 3's recipient-admitted row; MUST NOT fail the writer or publisher rows, blocks 1-2, or
   d150. Result: rec212 40 pass, 1 FAIL — exactly that row. d150 49/0.
   (d) THE SUBJECT CHANGED AFTER (a)-(c), SO (b) WAS RE-RUN AGAINST IT, which is `CLAUDE.md` §5's rule rather than
   diligence: the full gate went RED on `provenance-marker.test.mjs` §I's swallowed-read CEILING (39 of 38), and the
   site it named was this item's own `#statementWriter`, whose first cut returned `false` for a draft whose arguments
   would not parse — the smoothed non-match that class exists to refuse, which would have credited the publisher
   with a sentence an editor may have written. The correction is a stated UNDETERMINED (`draft_unreadable`), asked
   BEFORE the no-draft branch. Arm (b) was then re-armed ALONE on the corrected `src/store.mjs` (restored by `cp`,
   sha256 `sha256sum -c` OK fa247397…c730f9, `cmp` identical, 3,244,593 bytes): 33 pass, 8 FAIL, the same eight rows
   — the control still bites on the changed subject. `provenance-marker.test.mjs`'s OWN ceiling arm was re-run for
   the move to 39 and is recorded on that suite's header, not here.
   NOT DRIVEN, AND SAID RATHER THAN SCORED: no arm reaches `#statementWriter`'s `drafts_unbounded` answer
   (it needs more than REVIEW_LIST_MAX drafts of one project), and none produces a draft holding a statement
   with no `statement_by` — REC-193 measured that state unreachable through any act on a store this code
   wrote. Block 5 reaches the STATED null through two drafts DISAGREEING, which is reachable, and block 3
   reaches it as bytes. Block 7 prints its corpus and names both gaps.
    D-540 (RUN 2026-09-25 by the D-540 worker on land/worker/D-540, each arm ALONE, DECLARED BEFORE ARMING,
    every restore by `cp` from a uniquely-named pristine copy in the session scratchpad, verified by sha256
    (`sha256sum -c` OK, 3b1f1cba9fed1c8262a0b4a59e476fb3ace82f492b9f264a876efda4743d63b3) AND `cmp`, 3,353,411
    bytes). BASELINE: rec213 20/0, rec212 46/0, d150 64/0.
      (d540-a) THE ROW'S OWN CONTROL — the writer exclusion DROPPED from `#statementAcknowledgements`' unbound
        count (its `acknowledger IS ?` bound to null). DECLARED: MUST FAIL rec213 block 4's count row (reads
        3) and its prose row [rec213-reviewcopy-writer]; MUST NOT fail rec212 or d150. RESULT: rec213 18 pass, 2 FAIL — exactly those two,
        `got [..,3,..]` — rec212 46/0, d150 64/0, as declared.
      (d540-b) THE FOLD — writer-undetermined participant rows counted INTO `unbound` and the own key zeroed.
        DECLARED: MUST FAIL rec212 block 5's two D-540 rows; MUST NOT fail rec213 or d150. RESULT: rec212 44
        pass, 2 FAIL — exactly those two, `got [0,[],1,null,null]` — rec213 20/0, d150 64/0, as declared.
      NOT DRIVEN, SAID: a RECIPIENT's draft-given row under an UNDETERMINED writer (it stays in `unbound`);
        no fixture here holds one.

   REC-212 / BIO_Publication_v0_1.md §3 rule 13 (BOB #32 RULED (b), 2026-09-24 06:11Z) — THE CASE
   DOCUMENT NAMED ONE ACT WHERE THERE ARE TWO, AND C-41.10's EXCLUSION READ THE WRONG ONE.

   `completeness.author` names the member who PREPARED AND PUBLISHED the case. It was also the only
   name C-41.10's acknowledgement exclusion had. So where an EDITOR wrote the exclusion statement and
   somebody ELSE published the case, the editor's own acknowledgement of their own sentence passed both
   the act and the gate, and a SIGNED case document listed them as a second reader of what the case
   leaves out. Rule 11's whole content is a SECOND person's reading; the document claimed one nobody
   made. That is the overclaim this record exists to refuse, in the artifact a stranger holds.

   REC-193 already measured the writer on the DRAFT side (`case_drafts.statement_by`, stamped by the
   server at the write that CHANGED the statement text). This item carries that stamp onto the document
   as `completeness.statement_by`, points the exclusion at it, and tells the three states apart.

   EVERY BLOCK IS ONE CLAUSE OF THE ROW, DRIVEN THROUGH THE CONTROL PLANE (`op=casedraft`,
   `op=statementack`, `op=publish`, `op=caseratify`, `op=casedocument`, `op=publishedcase`) and never
   through the store, EXCEPT the gate blocks, which run `runCaseGate` — the function `op=caseratify`
   runs and nothing else does — over bytes this plane itself authored with ONE field changed:
     1. THE CARRY: ella writes the statement in a draft, iris publishes, and the signed bytes name
        BOTH — `statement_by: ella` beside `author: iris`, in the frontmatter and in the body prose.
     2. ACCEPTS-WHEN: the statement's WRITER cannot acknowledge (and so cannot be ratified into) a case
        ANOTHER member published — refused by name at the case-document door, where `author` admitted
        her — while a THIRD participant still may (the over-strictness arm).
     3. THE GATE: bytes listing the writer are refused by C-41.10; so are bytes listing the publisher,
        on its own reason and in its own words; a /3 document SILENT about the writer is refused by
        C-41.13 — which is the row's "a pre-existing case with none ... its ratify is refused by name" —
        and a /2 document is read in its own shape and still ratifies.
     4. NO DRAFT HOLDS THE SENTENCE: the publisher wrote those bytes AT THE PUBLISHING ACT, and the
        document says so — two acts, one member, which is the common case and is not a conflation.
     5. UNDETERMINED IS STATED AND NEVER BACK-FILLED: two drafts of one project hold the same sentence
        under different authors, so who wrote the bytes cannot be established. The document says null,
        the prose says why, the participant acknowledgement already recorded is WITHHELD and COUNTED,
        the writer is refused at the door BY NAME — and the case PUBLISHES AND RATIFIES anyway, because
        nothing about an acknowledgement ever refuses a publication (rule 11).
     6. BOTH NAMES IN BOTH ANSWERS: `op=caseratify`'s own answer and `op=publishedcase`'s committed
        block, the second committed FROM THE SIGNED BYTES and never from `author`.
     7. TOTALITY over a printed corpus: every case document this suite published carries the key.

   WHAT A LIAR WOULD DO, STATED BEFORE WHAT IS CHECKED. (a) Add the key and leave the exclusion reading
   `author`: every block-1 and block-6 row reads right and block 2's refusal and block 3's writer arm
   fail — that is exactly the control at the foot. (b) Point the exclusion at the writer and back-fill
   the writer from `author` when the record cannot say: blocks 1–4 pass and block 5's null, its withheld
   count and its UNDETERMINED refusal all fail. (c) Require the key of EVERY format: blocks 1–6 pass
   and block 3's /2 row stops ratifying — a document that already crossed. (d) Refuse the ratification
   of a case whose writer is undetermined: block 5's PUBLISHES-ANYWAY row fails, and it is the row that
   holds rule 11's own sentence that a case never needs a second reader.

   EXPECTATIONS ARE NOT DERIVED FROM THE THING UNDER TEST: every statement is a string this suite passed
   in, every member id is one this suite enrolled, and the statement fingerprint is computed here with
   node:crypto, sharing no code with `src/`. */

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
import { parseFrontmatter } from "../checks/bio-checks.mjs";
import { runCaseGate } from "../src/gate.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- rec212-statement-writer ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("rec212-statement-writer: SKIPPED — ssh-keygen not on PATH; every clause is asserted in a case "
    + "document a member really signed");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r212", MEMBER_TOKEN: "mem-r212", PROBE_TOKEN: "prb-r212", VERSION: "test" },
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
  console.log(`\nrec212-statement-writer: ${pass} pass, ${fail} fail  [FIXTURE ABORTED]`);
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
const dir = mkdtempSync(join(tmpdir(), "rec212-"));
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
  const add = rP(await POST("op=memberadd&token=adm-r212",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  if (!add?.ok || !add.invite) bail(`memberadd ${memberId}`, add);
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
await enrol("nadia", "nadia-passphrase-212", "admin", ["contribute", "publish", "create_projects"]);
/* ADMINS_FIRST: administrative access is shared among at least two people before any ordinary member
   exists, so the second enrolment is an administrator too. omar takes no part in any block below. */
await enrol("omar", "omar-passphrase-212", "admin", ["contribute", "publish"]);
/* iris OWNS the project and signs; ella and pat are JOINED participants — ella writes statements, pat
   is the THIRD member the over-strictness arm needs, and both writing one sentence is what makes the
   writer UNDETERMINED in block 5. */
const IRIS = await enrol("iris", "iris-passphrase-212", "member", ["contribute", "publish"]);
const ELLA = await enrol("ella", "ella-passphrase-212", "member", ["contribute", "publish"]);
const PAT = await enrol("pat", "pat-passphrase-212", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-r212", { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));

const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r212", owner: "iris",
  name: "PROJ-2026-2120-two-acts", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
for (const [h, tok] of [["ella", ELLA], ["pat", PAT]]) {
  const inv = rP(await GET(`op=projectinvite&token=${IRIS}&projectId=${encodeURIComponent(PROJ)}&handle=${h}`));
  if (!inv?.ok) bail(`projectinvite ${h}`, inv);
  const jn = rP(await GET(`op=projectjoin&token=${tok}&projectId=${encodeURIComponent(PROJ)}`));
  if (jn?.state !== "joined") bail(`projectjoin ${h}`, jn);
}

/* ---- the corpus: d150's shapes, lifted rather than invented ---- */
let snapSeq = 0;
const promote = async (id, text, objectType, state) => rP(await POST("op=promote&token=adm-r212", {
  bundleId: id, base: null,
  snapKey: `20260924T${String(300000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
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

const INFO = "INFO-2026-2120-memo";
const CARRY = "INQ-2026-2120-carry";   /* block 1/2/3/6: ella writes, iris publishes */
const OWNSTMT = "INQ-2026-2120-own";   /* block 4: no draft holds the sentence */
const SPLIT = "INQ-2026-2120-split";   /* block 5: two drafts, two authors, one sentence */
const Q = { [CARRY]: "Was the transfer authorised?", [OWNSTMT]: "Was notice given?",
            [SPLIT]: "Was the auditor told?" };
if ((await promote(INFO, infoMd(INFO), "information", "collected")).ok === false) bail("promote info", {});
for (const id of Object.keys(Q)) {
  const r = await promote(id, withAdoptableReading(inquiryMd(id, Q[id], INFO)), "inquiry", "open");
  if (r.ok === false) bail(`promote ${id}`, r);
  const c = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(id)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id}.`)}`
    + adoptedVersionParam()));
  if (!c.ok) bail(`conclude ${id}`, c);
}

const args = (tag, over = {}) => ({
  project: PROJ, scope: `Whether the transfer was authorised (${tag}).`,
  statement: `This case covers the FY2024 transfer only (${tag}); the FY2023 memo is out of it.`,
  excluded: [{ target: null, description: `the FY2023 memo (${tag})`, reason: "a records request is outstanding" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: `We put the claims to the City Administrator (${tag}).`,
  biasAcknowledgement: `This group holds that transfers should be adopted in public (${tag}).`,
  ...over,
});
const withRoles = (b) => ({ ...b, roles: allLoadBearing(b) });
const fmOf = (text) => parseFrontmatter(text || "").data || {};
const bodyOf = (text) => parseFrontmatter(text || "").body || "";
const docOf = async (caseId, edition, token) =>
  rP(await GET(`op=casedocument&case=${caseId}&edition=${edition}&token=${token}`));
const ratify = async (who, token, caseId, edition, docSha) =>
  rP(await POST(`op=caseratify&token=${token}`, { caseId, edition, expectedSha: docSha,
                                                  sig: signCase(who, caseId, edition, docSha) }));
/* THE REAL DOOR: `runCaseGate` is what op=caseratify runs over the signed frontmatter, and nothing
   else does. `body` is passed where the arm is about the document this plane authored; a mutated
   fixture needs no body, because C-3.1's section arm is BLINDED by its absence rather than softened
   and every arm asserted below names its own check. */
const gate = (fm, body = null) => runCaseGate({ caseId: fm.case_id, edition: fm.case_edition, fm,
                                                priorCase: null, body });
const checksOf = (fm, body = null) => gate(fm, body).findings.map((x) => x.check);
/* THE INSTRUMENT IS HARDENED AGAINST ITS OWN ABSENT FINDING, and this is a FINDING ABOUT THIS SUITE
   RATHER THAN A PRECAUTION: the first run of control arm (a) below reached `findings[0].detail` on a
   gate that — correctly, with the arm in — returned NO findings, and the TypeError ENDED THE MODULE.
   Nine arms never ran and no tally printed, so the run was indistinguishable from a suite that simply
   stops, which is exactly `kickoffs/WORKER.md`'s receipt (*a TypeError inside an assertion goes through
   no assertion at all*). These two read the finding by CHECK and answer "" when there is none, so a
   missing refusal FAILS an assertion instead of silencing the rest of the file. */
const detailOf = (fm, check, body = null) => {
  const hit = gate(fm, body).findings.find((x) => x.check === check);
  return hit ? String(hit.detail ?? "") : "";
};
const repairsOf = (fm, check, body = null) => {
  const hit = gate(fm, body).findings.find((x) => x.check === check);
  return hit && Array.isArray(hit.repairs) ? hit.repairs.join(" ") : "";
};
const clone = (fm) => JSON.parse(JSON.stringify(fm));

console.log("\n--- rec212-statement-writer ---");

/* =========================================================================== 1 */
console.log("\n--- 1. THE CARRY: ella writes the statement, iris publishes, and the signed bytes name both ---");
const CARRY_ARGS = args("carry");
const Dc = rP(await POST(`op=casedraft&token=${ELLA}`, withRoles({ ...CARRY_ARGS, targets: [CARRY] })));
if (!Dc?.ok) bail("casedraft by ella", Dc);
{
  const copy = rP(await GET(`op=reviewcopy&draft=${Dc.draftId}&token=${IRIS}`));
  t("FIXTURE ARMS THE TRAP: the DRAFT's server stamp says ella wrote the statement (REC-193), and it is "
  + "IRIS who will publish — the only state in which the two names can disagree",
    [copy?.statement_by, copy?.updated_by], ["ella", "ella"]);
}
const Pc = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...CARRY_ARGS, targets: [CARRY] })));
if (!Pc?.ok) bail("publish carry", Pc);
const CC = Pc.caseDocument.case_id;
const docC = await docOf(CC, 1, IRIS);
const fmC = fmOf(docC?.text);
t("ACCEPTS-WHEN, first clause: the SIGNED-FOR-REVIEW bytes name the WRITER and the PUBLISHER APART — "
+ "completeness.statement_by is ella, completeness.author is iris",
  [fmC.completeness?.statement_by, fmC.completeness?.author], ["ella", "iris"]);
t("and the BODY — the thing a member reviews and signs — says both in prose, naming ella as the writer and "
+ "iris as having prepared and published",
  [/\*\*Who wrote this statement\.\*\* ella wrote this exclusion statement/.test(bodyOf(docC?.text)),
   /iris prepared and published the case/.test(bodyOf(docC?.text))],
  [true, true]);
t("op=publish's own answer carries both, with the sentence that says how the record knows",
  [Pc.completeness?.statement_by, Pc.completeness?.author,
   /^ella wrote this exclusion statement, in the draft it was prepared in\./.test(Pc.completeness?.statement_by_stated || "")],
  ["ella", "iris", true]);
t("and the gate accepts the document this plane authored — no finding at all",
  [gate(fmC, docC.text).ok, checksOf(fmC, docC.text)], [true, []]);

/* =========================================================================== 2 */
console.log("\n--- 2. ACCEPTS-WHEN: the statement's WRITER cannot acknowledge a case another member published ---");
{
  const aE = await ack(`case=${CC}&edition=1&token=${ELLA}`);
  t("ELLA, WHO WROTE THE STATEMENT, IS REFUSED BY NAME AT THE CASE-DOCUMENT DOOR, and the refusal names HER "
  + "and not iris — while `author` was the only name this door read, she walked straight through it",
    [aE?.ok, aE?.reason, aE?.author], [false, "STATEMENT_ACK_BY_ITS_AUTHOR", "ella"]);
  const aP = await ack(`case=${CC}&edition=1&token=${PAT}`);
  t("OVER-STRICTNESS: a THIRD joined participant is still admitted — this narrows the exclusion to the "
  + "writer and nothing else",
    [aP?.ok, aP?.acknowledgement?.kind, aP?.acknowledgement?.by], [true, "participant", "pat"]);
  const aI = await ack(`case=${CC}&edition=1&token=${IRIS}`);
  t("and iris, who PUBLISHED it and authored this completeness block at that act, is refused too — two acts, "
  + "two names, and neither of them is a second reader; the refusal names HER and says which act it means",
    [aI?.reason, aI?.author, /prepared and published this case/.test(aI?.detail || "")],
    ["STATEMENT_ACK_BY_ITS_AUTHOR", "iris", true]);
}
const docC2 = await docOf(CC, 1, IRIS);
const fmC2 = fmOf(docC2?.text);
t("pat's acknowledgement RE-AUTHORED the unsigned document, which now lists her and nobody else — and its "
+ "statement_by is untouched: the writer is a fact about the sentence, not about who has read it",
  [fmC2.completeness?.acknowledged, (fmC2.completeness_acknowledgements || []).map((a) => [a.kind, a.by]),
   fmC2.completeness?.statement_by],
  [1, [["participant", "pat"]], "ella"]);
t("and those re-authored bytes pass the gate: a list the splice wrote can never say what C-41.10 refuses",
  [gate(fmC2, docC2.text).ok, checksOf(fmC2, docC2.text)], [true, []]);

/* =========================================================================== 3 */
console.log("\n--- 3. THE GATE: C-41.10 excludes the WRITER; C-41.13 refuses a /3 silent about them ---");
{
  const AT = "2026-09-24T00:00:00Z";
  const listing = (fm, by) => {
    const d = clone(fm);
    d.completeness_acknowledgements = [{ kind: "participant", by, recipient: null, at: AT }];
    d.completeness.acknowledged = 1;
    return d;
  };
  t("A DOCUMENT LISTING ITS STATEMENT'S WRITER (ella) AS HAVING ACKNOWLEDGED IT IS REFUSED, by C-41.10 and by "
  + "nothing else — this is the row's defect, and `author` (iris) is not the name that catches it",
    [gate(listing(fmC, "ella")).ok, checksOf(listing(fmC, "ella"))], [false, ["C-41.10"]]);
  t("and the finding says WHICH field it read and WHY, so a reader is not left to guess which act was meant",
    [/completeness\.statement_by/.test(detailOf(listing(fmC, "ella"), "C-41.10")),
     /rule 13/.test(detailOf(listing(fmC, "ella"), "C-41.10"))],
    [true, true]);
  t("THE PUBLISHER'S OWN STAYS REFUSED, on its own reason and in its own words — completeness.author is named "
  + "as having PREPARED AND PUBLISHED the case, never as the statement's author",
    [checksOf(listing(fmC, "iris")),
     /PREPARED AND PUBLISHED/.test(detailOf(listing(fmC, "iris"), "C-41.10")),
     /completeness\.statement_by/.test(detailOf(listing(fmC, "iris"), "C-41.10"))],
    [["C-41.10"], true, false]);
  t("a THIRD participant listed is admitted by the same arm — the fence is the two acts, never the list",
    [gate(listing(fmC, "pat")).ok, checksOf(listing(fmC, "pat"))], [true, []]);

  /* THE STATED UNDETERMINED, AS BYTES: block 5 drives it through op=publish. Here it is asked of the
     gate on its own, because the gate is also the fence over bytes a STRANGER hands us. */
  const undet = listing(fmC, "pat"); undet.completeness.statement_by = null;
  t("A /3 DOCUMENT THAT SAYS ITS WRITER IS UNDETERMINED AND LISTS A PARTICIPANT IS REFUSED — any one of them "
  + "may BE the writer's own, and a document that cannot name the first reader cannot claim a second",
    [gate(undet).ok, checksOf(undet)], [false, ["C-41.10"]]);
  const undetR = clone(fmC);
  undetR.completeness.statement_by = null;
  undetR.completeness_acknowledgements = [{ kind: "recipient", by: "RV-1", recipient: "Dana Ruiz", at: AT }];
  undetR.completeness.acknowledged = 1;
  t("but the same document listing only a RECIPIENT is admitted: a grant's holder is never the statement's "
  + "writer, so an undetermined writer says nothing about them",
    [gate(undetR).ok, checksOf(undetR)], [true, []]);
  const undetNone = clone(fmC);
  undetNone.completeness.statement_by = null;
  t("and an undetermined writer with NO list at all is admitted — nothing here ever requires a second reader "
  + "(rule 11), which is the gate the row forbids",
    [gate(undetNone).ok, checksOf(undetNone)], [true, []]);

  /* C-41.13: THE ROW'S "a pre-existing case with none reads UNDETERMINED and its ratify is refused by name". */
  const silent = clone(fmC); delete silent.completeness.statement_by;
  t("A /3 DOCUMENT SILENT ABOUT THE WRITER IS REFUSED BY C-41.13 — the row's pre-existing case, whose ratify "
  + "is refused BY NAME rather than back-filled from its publisher",
    [gate(silent).ok, checksOf(silent)], [false, ["C-41.13"]]);
  t("the refusal names the key, says NULL is legal and an ABSENT key is not, and routes to op=publish",
    [/completeness\.statement_by/.test(detailOf(silent, "C-41.13")),
     /NULL is a statement/.test(detailOf(silent, "C-41.13")),
     /statement_by/.test(repairsOf(silent, "C-41.13"))],
    [true, true, true]);
  const empty = clone(fmC); empty.completeness.statement_by = "";
  t("and so is an EMPTY name: a blank is not a statement about anybody",
    [checksOf(empty)], [["C-41.13"]]);
  const legacy = clone(fmC);
  legacy.format = "bio-case-document/2";
  delete legacy.completeness.statement_by;
  t("/2-STILL-RATIFIES: the same bytes as a /2, carrying no statement_by, raise NOTHING — a document authored "
  + "before rule 13 is read in its own shape, and what already crossed stays crossed",
    [gate(legacy).ok, checksOf(legacy)], [true, []]);
  const legacySelf = listing(legacy, "iris"); delete legacySelf.completeness.statement_by;
  legacySelf.format = "bio-case-document/2";
  t("and that /2's exclusion still reads `author`, its own bytes' only name — the pre-rule-13 reading, kept "
  + "for the documents it was the reading OF",
    [checksOf(legacySelf)], [["C-41.10"]]);
}

/* =========================================================================== 4 */
console.log("\n--- 4. NO DRAFT HOLDS THE SENTENCE: the publisher wrote those bytes at the publishing act ---");
{
  const OWN = args("own-statement");
  const p = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...OWN, targets: [OWNSTMT] })));
  if (!p?.ok) bail("publish own", p);
  const d = await docOf(p.caseDocument.case_id, 1, IRIS);
  const fm = fmOf(d?.text);
  t("iris published a sentence NO draft of this project holds, so she wrote those bytes in this act: the "
  + "document names her as BOTH, and says so — two acts, one member, which is not a conflation",
    [fm.completeness?.statement_by, fm.completeness?.author,
     /two acts, one member/.test(bodyOf(d?.text))],
    ["iris", "iris", true]);
  t("and the gate accepts it: the common case is not the defect",
    [gate(fm, d.text).ok, checksOf(fm, d.text)], [true, []]);
  t("her own acknowledgement of it is refused by name, as the writer AND as the publisher",
    [(await ack(`case=${p.caseDocument.case_id}&edition=1&token=${IRIS}`))?.reason],
    ["STATEMENT_ACK_BY_ITS_AUTHOR"]);
  t("OVER-STRICTNESS: ella, who wrote no part of THIS sentence, is admitted — the exclusion follows the "
  + "sentence, never the member",
    [(await ack(`case=${p.caseDocument.case_id}&edition=1&token=${ELLA}`))?.ok], [true]);
}

/* =========================================================================== 5 */
console.log("\n--- 5. UNDETERMINED IS STATED, NEVER BACK-FILLED — and the case publishes anyway ---");
let SPLIT_CASE = null;
{
  const SP = args("split");
  const dE = rP(await POST(`op=casedraft&token=${ELLA}`, withRoles({ ...SP, targets: [SPLIT] })));
  const dP = rP(await POST(`op=casedraft&token=${PAT}`, withRoles({ ...SP, targets: [SPLIT] })));
  if (!dE?.ok || !dP?.ok || dE.draftId === dP.draftId) bail("casedraft split", { dE, dP });
  t("FIXTURE ARMS THE TRAP: TWO drafts of this project, at this case identity, hold the SAME sentence under "
  + "DIFFERENT authors — so which member wrote the bytes about to be published is genuinely unestablishable",
    [(rP(await GET(`op=reviewcopy&draft=${dE.draftId}&token=${IRIS}`)))?.statement_by,
     (rP(await GET(`op=reviewcopy&draft=${dP.draftId}&token=${IRIS}`)))?.statement_by],
    ["ella", "pat"]);
  const pre = await ack(`draft=${dP.draftId}&token=${ELLA}`);
  t("and ella acknowledges pat's draft first, legitimately — pat wrote THAT draft's sentence, so ella's "
  + "reading of it is a second person's: the row exists in the record before the publication",
    [pre?.ok, pre?.acknowledgement?.by], [true, "ella"]);

  const p = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...SP, targets: [SPLIT] })));
  if (!p?.ok) bail("publish split", p);
  SPLIT_CASE = p.caseDocument.case_id;
  const d = await docOf(SPLIT_CASE, 1, IRIS);
  const fm = fmOf(d?.text);
  t("THE DOCUMENT SAYS null AND NEVER iris: UNDETERMINED is stated, and is not back-filled from the publisher "
  + "who prepared and published the case",
    [fm.completeness?.statement_by, fm.completeness?.author], [null, "iris"]);
  t("the BODY says WHY, names both candidates, and says in words that it is not read off the publisher",
    [/\*\*Who wrote this statement\.\*\* UNDETERMINED: 2 drafts/.test(bodyOf(d?.text)),
     /ella/.test(bodyOf(d?.text).split("**Who wrote this statement.**")[1].split("\n")[0]),
     /It is NOT read off iris/.test(bodyOf(d?.text))],
    [true, true, true]);
  /* ADDED AFTER CONTROL ARM (b), WHICH FOUND THIS ARM MISSING: the prose row above is coupled to the
     SENTENCE and the key row to the KEY, so an arm that back-filled the key and left the sentence alone
     passed the prose row — over a document whose frontmatter named iris while its body said UNDETERMINED.
     Nothing asserted that the two AGREE, and a case document contradicting itself under a signature is
     worse than either half being wrong. This row is the agreement, asserted as a RELATION. */
  t("and the KEY and the PROSE are one claim: the frontmatter says null exactly when the body says "
  + "UNDETERMINED — a document cannot name a writer in one half and disclaim one in the other",
    [fm.completeness?.statement_by === null,
     /\*\*Who wrote this statement\.\*\* UNDETERMINED/.test(bodyOf(d?.text))],
    [true, true]);
  /* CORRECTED 2026-09-24 BY REC-194 AT THE UNION, never exempted, and the PROPERTY IS UNCHANGED: ella's
     row is still COUNTED and still never listed. What moved is WHICH count holds it, and the new one is a
     STRONGER reason. ella acknowledged a DRAFT of a case whose id did not exist yet, so after §3 rule 13's
     one-case-identity narrowing her reading is not this case's to withhold in the first place: it is
     UNBINDABLE. That dominates the writer question — the row could not be listed here even if the writer
     were known — so the document counts it as unbindable and the writer withholding never runs. Asserting
     the old key would now assert 0 dressed as 1. THE WITHHOLDING ITSELF IS NOT LEFT UNDRIVEN: it needs a
     row BOUND to the case, which after the narrowing means a draft naming an EXISTING case, and block 5b
     drives exactly that. */
  /* CORRECTED AGAIN 2026-09-25 BY D-540, never exempted, and the PROPERTY IS STILL UNCHANGED: ella's row is
     counted and never listed. What was wrong was the claim that unbindability DOMINATES the writer question.
     It does not: `acknowledgements_unbindable_to_this_case` is stated in the document as readings that MAY
     be second readings of this case, and with the writer UNDETERMINED the record cannot rule out that
     ella's is the writer's own — which is not a second reading at any identity (§3 rule 13). Two unknowns
     at once, so the row is counted under its OWN key, `acknowledgements_unbindable_writer_undetermined`,
     never folded into the unbindable count (claiming a possible second reading) nor into the withheld one
     (it is not this case's row to withhold). The old 1 in the unbindable key was that fold. */
  t("THE PARTICIPANT ACKNOWLEDGEMENT ALREADY RECORDED IS COUNTED AND NEVER LISTED — it is UNBINDABLE (ella "
  + "read a DRAFT of a case that had no id yet) AND its writer is UNDETERMINED, so it is counted under its "
  + "own key, never folded into the unbindable count or the withheld one (D-540)",
    [fm.completeness?.acknowledged, fm.completeness_acknowledgements,
     p.completeness?.acknowledgements_unbindable_to_this_case ?? null,
     p.completeness?.acknowledgements_unbindable_writer_undetermined ?? null,
     p.completeness?.acknowledgements_withheld_writer_undetermined ?? null],
    [0, [], null, 1, null]);
  t("D-540: and the PROSE states it apart, in its own sentence — never as a possible second reading of this case",
    [/also holds 1 acknowledgement of this exact statement in [^,]+, given by a participant for a draft, of which it is UNDETERMINED both whether any is a reading of THIS case and whether any is the statement's writer's own/
       .test(bodyOf(d?.text)),
     /given for a case whose identity was not yet allocated/.test(bodyOf(d?.text)),
     /Nobody acknowledged it FOR THIS CASE/.test(bodyOf(d?.text))],
    [true, false, true]);
  t("so the bytes op=publish authored pass their own gate — it can never author a document C-41.10 refuses",
    [gate(fm, d.text).ok, checksOf(fm, d.text)], [true, []]);
  t("ella is refused at the door BY NAME, with the UNDETERMINED code and not the author code — the plane "
  + "cannot tell whether she is the first reader, and says that instead of guessing",
    [(await ack(`case=${SPLIT_CASE}&edition=1&token=${ELLA}`))?.reason],
    ["STATEMENT_ACK_AUTHOR_UNDETERMINED"]);
  t("and so is pat, and so is iris: the refusal is about the SENTENCE's unknown author, not about a member",
    [(await ack(`case=${SPLIT_CASE}&edition=1&token=${PAT}`))?.reason,
     (await ack(`case=${SPLIT_CASE}&edition=1&token=${IRIS}`))?.reason],
    ["STATEMENT_ACK_AUTHOR_UNDETERMINED", "STATEMENT_ACK_AUTHOR_UNDETERMINED"]);
  const r = await ratify("iris", IRIS, SPLIT_CASE, 1, d.doc_sha);
  t("PUBLISHES-AND-RATIFIES ANYWAY: nothing about an acknowledgement, or about an unknown writer, refuses a "
  + "publication (rule 11) — the case crosses, and says what it does not know",
    [r?.ok, r?.statement?.by, /^UNDETERMINED: this case document states/.test(r?.statement?.stated || "")],
    [true, null, true]);
}

/* ========================================================================= 5b */
console.log("\n--- 5b. REC-194 at the union: the writer withholding, driven through a BOUND acknowledgement ---");
/* ADDED 2026-09-24 BY REC-194 AT THE UNION, because the narrowing took block 5's row out of the writer
   withholding's reach and a mechanism nobody drives is the defect this project meets most often. After the
   narrowing, `withheldWriterUndetermined` needs a row BOUND to the case identity, which means a draft that
   NAMES AN EXISTING CASE — it stands at that case's next edition, so a reading of it is that edition's.
   SPLIT_CASE is ratified at edition 1 above, so this drives edition 2: two drafts naming it hold one
   sentence under two authors (the writer is genuinely unestablishable), ella acknowledges PAT's draft (whose
   own `statement_by` is pat, so the door admits her), and iris publishes. Her row is BOUND, so REC-194 does
   not touch it; the writer is UNDETERMINED, so REC-212 withholds it and COUNTS it. The last arm is the
   DELTA that tells the two counts apart: unbindable here is ABSENT where block 5 had it, and withheld is
   PRESENT where block 5 does not. */
{
  const SPLIT2 = "INQ-2026-2120-split2";
  const r0 = await promote(SPLIT2, withAdoptableReading(inquiryMd(SPLIT2, "Was the second notice given?", INFO)),
                           "inquiry", "open");
  if (r0.ok === false) bail(`promote ${SPLIT2}`, r0);
  const c0 = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(SPLIT2)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${SPLIT2} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${SPLIT2}.`)}`
    + adoptedVersionParam()));
  if (!c0.ok) bail(`conclude ${SPLIT2}`, c0);
  const S2 = args("split2", { caseId: SPLIT_CASE });
  const dE2 = rP(await POST(`op=casedraft&token=${ELLA}`, withRoles({ ...S2, targets: [SPLIT2] })));
  const dP2 = rP(await POST(`op=casedraft&token=${PAT}`, withRoles({ ...S2, targets: [SPLIT2] })));
  if (!dE2?.ok || !dP2?.ok || dE2.draftId === dP2.draftId) bail("casedraft split2", { dE2, dP2 });
  const cpE = rP(await GET(`op=reviewcopy&draft=${dE2.draftId}&token=${IRIS}`));
  const cpP = rP(await GET(`op=reviewcopy&draft=${dP2.draftId}&token=${IRIS}`));
  t("FIXTURE ARMS THE TRAP: both drafts NAME the ratified case, so both stand at its NEXT edition (2) and a "
  + "reading of either is BOUND — and they hold one sentence under two authors, so the writer is undetermined",
    [cpE?.case?.case_id ?? cpE?.caseId ?? null, cpE?.case?.edition ?? cpE?.edition ?? null,
     cpP?.case?.edition ?? cpP?.edition ?? null, cpE?.statement_by, cpP?.statement_by],
    [SPLIT_CASE, 2, 2, "ella", "pat"]);
  const a2 = await ack(`draft=${dP2.draftId}&token=${ELLA}`);
  t("ella acknowledges PAT's draft — that draft's own writer is pat, so the door admits her — and the row is "
  + "BOUND to the case and the edition, not to no case at all",
    [a2?.ok, a2?.bound_to_a_case, a2?.acknowledgement?.case_id, a2?.acknowledgement?.edition],
    [true, true, SPLIT_CASE, 2]);
  const p2 = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...S2, targets: [SPLIT2] })));
  if (!p2?.ok) bail("publish split2", p2);
  const d2 = await docOf(SPLIT_CASE, 2, IRIS);
  const fm2 = fmOf(d2?.text);
  t("THE WITHHOLDING RUNS AND IS COUNTED: edition 2 states its writer UNDETERMINED, lists NOBODY, and says in "
  + "its own answer that ONE participant row was withheld because the record cannot rule out that she wrote it",
    [p2?.caseDocument?.edition, fm2.completeness?.statement_by, fm2.completeness?.acknowledged,
     fm2.completeness_acknowledgements,
     p2.completeness?.acknowledgements_withheld_writer_undetermined],
    [2, null, 0, [], 1]);
  t("DELTA between the two reasons, which is why both counts exist: block 5's row was UNBINDABLE and not "
  + "withheld; this one is WITHHELD and not unbindable — neither count stands in for the other",
    [p2.completeness?.acknowledgements_unbindable_to_this_case ?? null,
     p2.completeness?.acknowledgements_withheld_writer_undetermined ?? null],
    [null, 1]);
}

/* =========================================================================== 6 */
console.log("\n--- 6. BOTH NAMES IN BOTH ANSWERS — op=caseratify's own, and op=publishedcase's from signed bytes ---");
{
  const d = await docOf(CC, 1, IRIS);
  const r = await ratify("iris", IRIS, CC, 1, d.doc_sha);
  if (r?.ok === false) bail("caseratify carry", r);
  t("op=caseratify ANSWERS WITH BOTH NAMES, from the bytes it just committed",
    [r?.statement?.author, r?.statement?.by,
     /^ella wrote this case's exclusion statement; iris prepared and published the case/.test(r?.statement?.stated || "")],
    ["iris", "ella", true]);
  const pub = rP(await GET(`op=publishedcase&id=${CC}`));
  t("and op=publishedcase serves both, COMMITTED FROM THE SIGNED BYTES — a stranger holding no credential "
  + "reads the two acts apart",
    [pub?.completeness?.statement_by, pub?.completeness?.author,
     /iris prepared and published the case/.test(pub?.completeness?.statement_by_stated || "")],
    ["ella", "iris", true]);
  const pubS = rP(await GET(`op=publishedcase&id=${SPLIT_CASE}`));
  t("and the undetermined case serves null with its reason — never the publisher's name in the writer's slot",
    [pubS?.completeness?.statement_by, pubS?.completeness?.author,
     /^UNDETERMINED/.test(pubS?.completeness?.statement_by_stated || ""),
     /iris/.test((pubS?.completeness?.statement_by_stated || "").split("NOT read off")[0])],
    [null, "iris", true, false]);
}

/* =========================================================================== 7 */
console.log("\n--- 7. TOTALITY over a printed corpus: every case document this suite published carries the key ---");
{
  const cases = [];
  for (const cid of [CC, SPLIT_CASE]) {
    const d = await docOf(cid, 1, IRIS);
    cases.push([cid, fmOf(d?.text)]);
  }
  const own = rP(await GET(`op=publishedmanifest`));
  console.log(`         corpus: ${cases.length} case document(s) this suite authored and read back, `
    + `${(own?.published || []).length} row(s) in the published index`);
  t("over a NON-EMPTY corpus: every one of them carries completeness.statement_by as a KEY — a name or a "
  + "stated null, and never silence",
    [cases.length > 0,
     cases.map(([, fm]) => Object.prototype.hasOwnProperty.call(fm.completeness || {}, "statement_by")),
     cases.map(([, fm]) => fm.completeness.statement_by)],
    [true, [true, true], ["ella", null]]);
  t("and each carries completeness.author beside it, unchanged in meaning: the member who prepared and "
  + "published the case",
    cases.map(([, fm]) => fm.completeness.author), ["iris", "iris"]);
  /* WHAT THIS SUITE CANNOT SEE, SAID RATHER THAN SCORED. (1) `statement_by: null` arising from a DRAFT
     that predates REC-193's column: no act on a store this code wrote can produce such a draft (REC-193
     measured the same thing about its own door), so the stated-null state is reached here through two
     drafts DISAGREEING, which is reachable, and through the gate directly on bytes. (2) The
     `drafts_unbounded` answer: it needs more than REVIEW_LIST_MAX drafts of one project, which this
     suite does not build — the branch is asserted by reading, not by driving, and is named here so a
     reader can tell an unexercised path from a passing one. Nor the `draft_unreadable` answer: every
     `case_drafts.params` this plane writes is `JSON.stringify`'d, so no act can produce a draft whose
     arguments will not parse, and that branch exists for a row no act of this code wrote. (3) A publisher who RETYPES a sentence an
     editor wrote in a draft that has since been EDITED is credited with it by block 4's rule: the
     record keeps no history of a draft's statement text, and this is the residue the document prints
     its provenance sentence FOR. */
  console.log("         NOT DRIVEN (said, never scored): a pre-REC-193 draft's NULL stamp (unreachable through "
    + "any act), and the drafts_unbounded answer (needs more than REVIEW_LIST_MAX drafts of one project).");
}

console.log(`\nrec212-statement-writer: ${pass} pass, ${fail} fail  [FOOT REACHED]`);
await mf.dispose();
process.exit(fail ? 1 : 0);
