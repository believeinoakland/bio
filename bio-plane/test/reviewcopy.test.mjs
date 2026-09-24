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
   arm stays green because the liar was written into the read only.

   REC-133 (§6A.2, BOB #15) ADDED FOUR ARMS AND ELEVEN ASSERTIONS; ALL NINE ARMS RE-RUN
   2026-09-18 in worktree agent-a6516bd6e484436ba, every restore sha256 MATCH, content
   IDENTICAL, size ok. (0) BASELINE -> **63 pass, 0 fail**. Arms (a)-(d) re-measured: (a)
   58/5, (b) 62/1, (c) 61/2, (d) 61/2 — (a) and (d) each fail ONE MORE than REC-126
   recorded, and it is the same new arm in both: the owner-revoked G3 secret's
   byte-identical comparison, which is a revoked-secret arm like the others they break.

   (e) REVOKE WIDENED TO ADMINISTRATORS — `#reviewRevoke` admits `|| this.#isAdminMember`,
   which is §6A.2's FIRST version, corrected by BOB #15 the same day (administrators
   direct nothing). REC-133 built that version first and REVERTED it; this arm is the
   inverse of the control it then carried. Declared: MUST FAIL the administrator-cannot-
   revoke arm; MUST NOT fail the editor/plain-member arm -> **61 pass, 2 fail**: that arm,
   AND the owner-revokes arm after it, because the administrator's attempt succeeded
   first and the owner's revocation then reports `revokedBy: omar`. One more than
   declared, in the declared direction.

   (f) ISSUE WIDENED TO EDITORS — `#reviewGrant` asks `#isProjectEditor` instead of
   `#isProjectOwner`. Declared: MUST FAIL the editor-cannot-issue arm; MUST NOT fail the
   plain-member/administrator arm (neither is an editor) -> **62 pass, 1 fail**, that arm.
   AS DECLARED. The editor holds `publish`, which is what lets this arm reach the store.

   (g) THE LIAR'S WIDENING — authoring a draft admitted to ANY signed-in member (the
   `#isProjectEditor` line removed). Declared: MUST FAIL every authoring REFUSAL arm that
   the control plane does not answer first -> **59 pass, 4 fail**: VIC, OMAR, the plain
   member's draft and her edit. The UMA arm stays GREEN, correctly: she lacks
   `contribute`, and the control plane refuses her before the store is asked.

   (h) THE DRY RUN AS THE EDITOR — `#reviewGates` runs as `row.updated_by` again, not as
   `#draftPublisher`. Declared: MUST FAIL the editor's-draft-judged-as-publisher arm ->
   **62 pass, 1 fail**, that arm. AS DECLARED.

   REC-198 (BOB #32, 2026-09-23 23:08Z: the list of a project's drafts, fenced exactly like reading one) ADDED
   BLOCK 9 AND THREE ARMS. DECLARED 2026-09-23 BEFORE ARMING (results appended below when run):

   (i) THE FENCE DROPPED — `caseDraftList` stops asking `#seesProjectDrafts`. MUST FAIL, by name: the uninvited
   member's byte-identical arm ("THE UNINVITED MEMBER READS THE FENCE'S ANSWER"), the caller-by-caller table (vic
   admitted), the names-nothing arm, the other-way arm, and both structural arms. MUST NOT FAIL: the owner's and
   the joined editor's lists, the rows opening, the bound, and every block 1-8 arm.

   (j) THE LIAR'S SECOND FENCE — the list asks an inline copy that admits JOINED participants (and owners) only,
   the ruling's parenthesis taken literally, instead of calling the fence. It agrees with the fence on iris, ella
   and vic, so the owner/editor/uninvited arms stay GREEN; MUST FAIL the caller-by-caller table (pat, omar and the
   machine credential are admitted by the single read and refused by the copy) and both structural arms.

   (k) OVER-STRICTNESS — the list's local `pid` renamed `projectId` throughout, correct work in a spelling this
   suite did not write. MUST PASS, every arm.

   MEASURED 2026-09-23 by WORKER REC-198 (cloud session, CONDUCT #18) with `node test/reviewcopy.control.mjs`, each arm
   ALONE, every restore of `src/store.mjs` (2,955,040 B) sha256 MATCH, content IDENTICAL, size ok:
   (0) BASELINE -> **77 pass, 0 fail**. (i) -> **71 pass, 6 fail**: the caller-by-caller table, THE UNINVITED MEMBER
   READS THE FENCE'S ANSWER (by name), the names-nothing arm, the other-way arm and both structural arms. AS DECLARED.
   (j) -> **74 pass, 3 fail**: the caller-by-caller table and both structural arms; the owner, editor and uninvited arms
   GREEN, which is the liar's copy agreeing today exactly where it was built to. AS DECLARED. (k) -> **77 pass, 0 fail**.
   AS DECLARED. ARMS (a)-(h) RE-RUN in the same driver run: a 72/5, b 76/1, c 75/2, d 75/2, e 75/2, f 76/1, h 76/1 — each
   REC-133's failure count unchanged — and g 69/8, FOUR MORE than REC-133 recorded, all four block 9's: with authoring
   widened, vic, omar and pat write drafts into PROJ and the list reports more than the seven authorised drafts.

   REC-199 (BOB #32, 2026-09-23 23:08Z: `op=reviewcopy` answers `newCase`, because a read that drops a field an edit
   writes back loses it) ADDED BLOCK 10 AND THREE ARMS. DECLARED 2026-09-24 BEFORE ARMING (results appended below
   when run):

   (l) THE FIELD DROPPED — the `case` block stops carrying `newCase`, which is the plane exactly as it stood before
   REC-199. MUST FAIL, by name: "THE COPY SAYS THE FIELD BACK" (the field reads `undefined` for all four drafts),
   "REC-199 ACCEPTS-WHEN" (the write-back built from the answer cannot carry what the answer does not say, so the
   draft comes back DERIVED and its gates refuse ALREADY_A_CASE_MEMBER) and the FIXED POINT arm (its own untouched
   draft `DC` goes from `passed` to `refused` across one trip). MUST NOT FAIL: "THE TWO ROUTES ARE A REAL FORK"
   (it reads the drafts as authored, before any write-back) and "THE ROUND TRIP" (the edit still lands — losing a
   field is not an error), nor any arm of blocks 1-9.

   (m) THE LIAR'S FIELD — `newCase` answered from the CASE IDENTITY (`!ident.caseId`) rather than from the draft.
   IT AGREES FOR FREE wherever a new-case draft is looked at, which is why the round trip alone cannot catch it:
   MUST NOT FAIL "REC-199 ACCEPTS-WHEN", which reads a draft the liar is right about, nor the fork, nor the trip
   landing. MUST FAIL "THE COPY SAYS THE FIELD BACK" (the two drafts that named no case and asked for nothing are
   told back as new-case drafts) and the FIXED POINT arm (`DD`, the derived draft, is handed back with
   `newCase: true` written into it and its gates flip from refused to passed — the liar's answer MAKING ITSELF
   true, which is the loss running the other way).

   (n) OVER-STRICTNESS — the same truthiness in a spelling this suite did not write (`params.newCase ? true : false`
   for `!!params.newCase`). MUST PASS, every arm.

   MEASURED 2026-09-24 by WORKER REC-199 (cloud session, CONDUCT #20) with `node test/reviewcopy.control.mjs`, every
   arm ALONE, the pen in the SESSION SCRATCHPAD and not in the worktree (BOB #32, 2026-09-24; the driver's `PEN`
   now takes `BIO_NC_PEN`), every restore of `src/store.mjs` (3,287,730 B) sha256 MATCH, content IDENTICAL, size ok:
   (0) BASELINE -> **82 pass, 0 fail**. (l) -> **79 pass, 3 fail**: THE COPY SAYS THE FIELD BACK, REC-199
   ACCEPTS-WHEN and THE CLASS AND NOT THE FIELD, by name; the fork arm and the trip-lands arm GREEN. AS DECLARED,
   exactly. (m) -> **80 pass, 2 fail**: THE COPY SAYS THE FIELD BACK and THE CLASS AND NOT THE FIELD; ACCEPTS-WHEN
   GREEN, which is the arm's whole point — the liar is RIGHT about the one draft the round trip looks at, and only
   the draft that asked for nothing and the fixed point catch it. AS DECLARED. (n) -> **82 pass, 0 fail**. AS
   DECLARED. ARMS (a)-(k) RE-RUN in the same driver run: a 77/5, b 81/1, c 80/2, d 80/2, e 80/2, f 81/1, g 74/8,
   h 81/1, i 76/6, j 79/3, k 82/0 — EVERY failure count unchanged from REC-198's measurement, the five new arms
   landing whole in each tally's pass column.

   D-538 (the identity sentence reads the draft's `newCase`; §6A.4 with BOB #32's 2026-09-23 23:08Z ruling) ADDED
   BLOCK 11, CORRECTED block 2's new-case arm (it pinned the defect as the rule, see there) and RE-ANCHORED arm (l)
   on the identity line that now passes `newCase`. TWO ARMS, DECLARED 2026-09-24 BEFORE ARMING:

   (o) `newCase` IGNORED AGAIN — `#caseIdentitySentence` takes `newCase = !caseId`, the plane before D-538. MUST FAIL,
   by name: block 2's corrected arm (D2 told "a new case"), "D-538 ACCEPTS-WHEN" (DD told "a new case" in all four
   answers) and "A DRAFT THAT NAMES C1 AND ASKS FOR A NEW CASE" (told "the next edition"). MUST NOT FAIL: the fixture
   arm, the new-case-kept arm (DN IS a new case, so the liar agrees there for free), the naming-a-case arm, nor any
   arm of blocks 1-10.

   (p) OVER-STRICTNESS — the derived sentence REWORDED ("an undetermined case: publication will derive it …"), the same
   two facts in words this suite did not write. MUST PASS, every arm.

   MEASURED 2026-09-24 by WORKER D-538 (cloud) with `node test/reviewcopy.control.mjs`, all SIXTEEN arms in one driver
   run, every arm ALONE, the pen in the session scratchpad via `BIO_NC_PEN`, every restore of `src/store.mjs`
   (3,330,923 B, sha256 14b7f5d1…) sha256 MATCH, content IDENTICAL, size ok (16 of 16): (0) BASELINE -> **87 pass,
   0 fail**. (o) -> **84 pass, 3 fail**: block 2's corrected arm, "D-538 ACCEPTS-WHEN" and "A DRAFT THAT NAMES C1 AND
   ASKS FOR A NEW CASE", by name; the fixture, new-case-kept and naming-a-case arms GREEN. AS DECLARED, exactly.
   (p) -> **87 pass, 0 fail**. AS DECLARED. ARMS (a)-(n) RE-RUN: a 82/5, b 86/1, c 85/2, d 85/2, e 85/2, f 86/1,
   g 79/8, h 86/1, i 81/6, j 84/3, k 87/0, l 84/3 (re-anchored), m 85/2, n 87/0 — EVERY failure count unchanged
   from REC-199's measurement, the five new arms of block 11 landing whole in each tally's pass column. */

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

import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
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
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r126", MEMBER_TOKEN: "mem-r126", PROBE_TOKEN: "prb-r126", VERSION: "test" },
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

/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7);
   the fixture takes a `name` and returns the minted id (PROJ holds it; vic's own project is never cited). */
const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r126", owner: "iris",
  name: "PROJ-2026-1260-auditor", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
const VIC_PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r126", owner: "vic",
  name: "PROJ-2026-1261-elsewhere", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });

/* REC-133 — THE ROSTER §6A.2's THREE AUTHORITIES ARE DRIVEN AGAINST. Each holds the
   STRONGEST capabilities its position allows, so a refusal can only come from the
   POSITION the store checks and never from a capability the control plane lacked:
     ella — a JOINED participant of PROJ, not an owner, holding contribute AND
            publish: the EDITOR. She may author; she may not issue (publish is
            held, so only the owner rule can refuse her) and may not revoke.
     pat  — INVITED to PROJ and NOT joined, holding contribute AND publish: the
            PLAIN MEMBER with neither right (§7.5: view rights only).
     uma  — a JOINED participant holding publish WITHOUT contribute: the capability
            half of the edit permission, refused at the control plane.
   omar (above) is the ADMINISTRATOR who is not an owner and not a participant. */
const ELLA = await enrol("ella", "ella-passphrase-133", "member", ["contribute", "publish"]);
const PAT = await enrol("pat", "pat-passphrase-133", "member", ["contribute", "publish"]);
const UMA = await enrol("uma", "uma-passphrase-133", "member", ["publish"]);
for (const [h, tok, join] of [["ella", ELLA, true], ["pat", PAT, false], ["uma", UMA, true]]) {
  const inv = rP(await GET(`op=projectinvite&token=${IRIS}&projectId=${encodeURIComponent(PROJ)}&handle=${h}`));
  if (!inv?.ok) bail(`projectinvite ${h}`, inv);
  if (join) {
    const jn = rP(await GET(`op=projectjoin&token=${tok}&projectId=${encodeURIComponent(PROJ)}`));
    if (jn?.state !== "joined") bail(`projectjoin ${h}`, jn);
  }
}

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
/* CORRECTED by REC-133: this block's heading read "an owner's act, and nobody
   else's", which was REC-126's PROVISIONAL authority. §6A.2 (BOB #15) makes
   authoring the project's EDIT permission; the owner arms below still hold (an
   owner is an editor) and the editor arms are added after them. */
console.log("\n--- 2. the draft case: the project's editors' act (§6A.2), and nobody else's ---");
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
/* CORRECTED by D-538: this arm read "a draft naming no case is a NEW case at edition 1" and pinned the
   sentence *not yet allocated* on D2, which names no case and does NOT set `newCase`. That was the defect
   pinned as the rule: `publishCase` DERIVES such a draft's case (a further edition of the one case its
   findings serve, a new case only if they serve none), so "a new case" claimed an answer only publication
   can give. D2's identity is stated as DERIVED and UNDETERMINED, never invented; block 11 drives all three
   routes through every answer that prints the sentence. */
t("a draft naming no case and not asking for a new one stands at edition 1 with no case id, and its identity "
+ "is STATED as derived at publication and UNDETERMINED here — never as a new case, which only publication "
+ "could establish",
  [D2r.caseId, D2r.edition, typeof D2r.caseIdentity === "string" && /deriv/i.test(D2r.caseIdentity)
     && /undetermined/i.test(D2r.caseIdentity) && !/not yet allocated/i.test(D2r.caseIdentity)],
  [null, 1, true]);
/* CORRECTED by REC-133: the first label said the authority was publish's (DEC-72).
   It is the project's EDIT permission now (§6A.2); VIC is still refused, because she
   holds no position in PROJ at all — the reason changed, the answer did not. */
t("a draft is REFUSED to a member with no position in the producing project, whatever she holds "
+ "(§6A.2: authoring needs the project's edit permission)",
  (await draft(VIC, withRoles({ ...args(2), caseId: C1, targets: [LEAD2] })))?.reason, "REVIEW_NOT_PROJECT_OWNER");
t("and to an administrator who is not an owner — an administrator sees every project and directs none",
  (await draft(OMAR, withRoles({ ...args(2), caseId: C1, targets: [LEAD2] })))?.reason, "REVIEW_NOT_PROJECT_OWNER");

/* REC-133: AUTHORING IS THE EDITOR'S ACT (§6A.2). */
const DEr = await draft(ELLA, withRoles({ ...args(1), targets: [LEAD5] }));
t("REC-133: A NON-OWNER EDITOR AUTHORS A DRAFT — a joined participant holding contribute, the draft "
+ "attributed to her project and standing as a new case",
  [DEr?.ok, DEr?.project, DEr?.edited, DEr?.edition], [true, PROJ, false, 1]);
const D6r = await draft(IRIS, withRoles({ ...args(1), targets: [LEAD3] }));
if (!D6r?.ok) bail("casedraft D6", D6r);
const D6e = await draft(ELLA, { draft: D6r.draftId, ...withRoles({ ...args(1), targets: [LEAD3] }) });
t("and she EDITS the owner's draft IN PLACE — a review copy is mutable, and editing is the editor's act",
  [D6e?.ok, D6e?.draftId, D6e?.edited], [true, D6r.draftId, true]);
t("THE PLAIN MEMBER — invited, NOT joined, holding contribute AND publish — may NOT author: §7.5 gives an "
+ "invited member view rights only",
  (await draft(PAT, withRoles({ ...args(1), targets: [LEAD5] })))?.reason, "REVIEW_NOT_PROJECT_OWNER");
t("nor edit an existing draft of the project",
  (await draft(PAT, { draft: D6r.draftId, ...withRoles({ ...args(1), targets: [LEAD3] }) }))?.reason,
  "REVIEW_NOT_PROJECT_OWNER");
t("THE CAPABILITY HALF: a JOINED participant without `contribute` is refused at the control plane, "
+ "before the store — the edit permission is position AND capability, and neither alone",
  (await draft(UMA, withRoles({ ...args(1), targets: [LEAD5] })))?.reason, "NOT_CAPABLE");
let DEO_ID = null;   /* REC-198: every draft of PROJ is tracked by the id its act answered, for block 9's list */
{
  /* THE GATES ARE RUN AS THE PUBLISHER. `publishCase` runs its owner fence first, so
     a dry run as the non-owner editor would answer NOT_THE_PROJECT_OWNER for every
     editor's draft and hide the real gaps. A complete editor's draft must PASS, and
     an incomplete one must name ITS gap. */
  const DE_read = rP(await GET(`op=reviewcopy&draft=${DEr.draftId}&token=${IRIS}`));
  const DEo = await draft(ELLA, withRoles({ ...args(1), targets: [OPENQ] }));
  const DEo_read = rP(await GET(`op=reviewcopy&draft=${DEo.draftId}&token=${ELLA}`));
  DEO_ID = DEo?.draftId ?? null;
  t("REC-133: AN EDITOR'S DRAFT IS JUDGED BY THE GATES AS ITS PUBLISHER WOULD MEET THEM — complete passes; "
  + "over an open question names NOT_CONCLUDED, never the editor's want of ownership",
    [DE_read?.gates, DE_read?.missing?.length, DE_read?.updated_by,
     DEo_read?.gates, DEo_read?.missing?.[0]?.reason],
    ["passed", 0, "ella", "refused", "NOT_CONCLUDED"]);
}
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
/* REC-133: ISSUING IS THE OWNER'S, UNCHANGED (§6A.2), and each refusal is asserted,
   because widening all three acts to any member would pass every positive arm. */
t("REC-133: A NON-OWNER EDITOR CANNOT ISSUE A GRANT — not on the owner's draft and not on HER OWN — though "
+ "she holds publish, so only the owner rule can be what refuses her",
  [(await grant(ELLA, { draft: D1, recipient: "x" }))?.reason,
   (await grant(ELLA, { draft: DEr.draftId, recipient: "x" }))?.reason],
  ["REVIEW_NOT_PROJECT_OWNER", "REVIEW_NOT_PROJECT_OWNER"]);
t("nor can the plain member, nor an administrator who is not an owner (no administrator bypass: DEC-72)",
  [(await grant(PAT, { draft: D1, recipient: "x" }))?.reason,
   (await grant(OMAR, { draft: D1, recipient: "x" }))?.reason],
  ["REVIEW_NOT_PROJECT_OWNER", "REVIEW_NOT_PROJECT_OWNER"]);
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
{
  /* REC-133: REVOKING STAYS THE OWNER'S (§6A.2, CORRECTED by BOB #15 the same day —
     its first version said *the owner or any administrator*, which contradicted
     Membership v2 §4: administrators direct nothing). This worker built the
     administrator arm from the first version and reverted it on CONDUCT #5's
     correction; the arms below assert the refusals instead. A fresh grant, read LIVE
     first, so "still live after they tried" is a measurement and not a fixture that
     never worked; then the OWNER revokes it and the dead answer is byte-identical. */
  const G3 = await grant(IRIS, { draft: D1, recipient: "Lee Park, ethics commission" });
  if (!G3?.ok || !G3.secret) bail("reviewgrant G3", G3);
  const liveBefore = parsed(await recipientRead(G3.secret))?.kind;
  const refusedTo = [
    rP(await POST(`op=reviewrevoke&token=${ELLA}`, { grant: G3.grantId }))?.reason,
    rP(await POST(`op=reviewrevoke&token=${PAT}`, { grant: G3.grantId }))?.reason,
  ];
  const adminTried = rP(await POST(`op=reviewrevoke&token=${OMAR}`, { grant: G3.grantId }))?.reason;
  const stillLive = parsed(await recipientRead(G3.secret))?.kind;
  t("REC-133: THE EDITOR AND THE PLAIN MEMBER CANNOT REVOKE — neither owns the project",
    [liveBefore, refusedTo], ["review-copy", ["REVIEW_NOT_PROJECT_OWNER", "REVIEW_NOT_PROJECT_OWNER"]]);
  t("REC-133: AN ADMINISTRATOR WHO IS NOT THE OWNER CANNOT REVOKE — administrators direct nothing "
  + "(§6A.2 as corrected) — and the grant is still live after all three tried",
    [adminTried, stillLive], ["REVIEW_NOT_PROJECT_OWNER", "review-copy"]);
  const RVO = rP(await POST(`op=reviewrevoke&token=${IRIS}`, { grant: G3.grantId }));
  t("the OWNER revokes it, and the secret then answers BYTE-IDENTICALLY to one that was never issued",
    [RVO?.ok, RVO?.revokedBy, await recipientRead(G3.secret)], [true, "iris", never]);
}
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
/* CORRECTED 2026-09-19 (REC-151, IC-164): this arm asserted the dry runs ROLLED BACK `allocId`'s CASE counter by
   reading the next real case's id as the second number ever minted ("0002"). There is no CASE counter any more — a
   new case's id is OPAQUE, drawn from the CSPRNG and checked unique (Membership v2 §7, *"A MINTED ID CARRIES NO
   COUNT"*) — so a dry run has no sequence to burn, and the old reading would now pass or fail by chance. What
   stays true and is asserted: the dry run's gates passed, and the real case minted after them is a well-formed id
   that is not the first case's. The minter itself is pinned in `opaque-ids.test.mjs`. */
t("THE DRY RUNS LEAVE NO CASE BEHIND: the passing new-case draft had its every gate run (which mints a case id "
+ "inside the act) each time it was read, and the next real case is a fresh, well-formed id of its own",
  [O5?.gates, /^CASE-\d{4}-\d{4}$/.test(C2), C2 !== C1], ["passed", true, true]);
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

/* =========================================================================== 9
 * REC-198 — THE LIST OF A PROJECT'S DRAFTS, FENCED EXACTLY LIKE READING ONE.
 * BOB #32 (2026-09-23 23:08Z; BIO_Publication §3 rule 15 (a)): *"a list read of a project's drafts, fenced exactly like
 * reading one draft (joined participants)"*. Until this, every read of `case_drafts` was keyed by draft_id,
 * so a draft whose id was lost was a lost draft.
 *
 * HOW A LIAR PASSES THIS: a SECOND fence that agrees with the first today. So the arms below (1) assert the
 * list and the single read CALL THE SAME FUNCTION, off the source, and (2) drive the callers a copied fence
 * would most plausibly treat differently — the INVITED-NOT-JOINED participant (pat) and the ADMINISTRATOR who
 * is no participant (omar), whom a "joined participants" copy would refuse while the single read admits them —
 * and assert the list admits EXACTLY whom the single read admits, caller by caller.
 *
 * WHAT THIS CANNOT SEE: a caller holding NO credential is refused by the op table's class gate before any
 * fence (the list is gated; `reviewcopy` is not, for its recipient door), so for that caller the two answers
 * differ in shape by design and only "reads no drafts" is asserted. The uninvited arm is a SIGNED-IN member.
 * ========================================================================= */
console.log("\n--- 9. REC-198: the list of a project's drafts, fenced exactly like reading one ---");
const PROJ_DRAFTS = [D1, D2, D3, D5, DEr.draftId, D6r.draftId, DEO_ID];
if (PROJ_DRAFTS.some((d) => !d) || new Set(PROJ_DRAFTS).size !== 7) bail("block 9's draft roster", PROJ_DRAFTS);
const listOf = async (token, extra = "") => rP(await GET(`op=casedrafts&token=${token}&project=${encodeURIComponent(PROJ)}${extra}`));
const L_OWNER = await listOf(IRIS);
const L_ELLA = await listOf(ELLA);
const idsOf = (l) => (l?.drafts || []).map((d) => d.draft_id).sort();
t("REC-198: THE OWNER LISTS EVERY DRAFT OF THE PROJECT — the seven this suite authored, each by the id its act "
+ "answered, and the count and total say it is all of them",
  [idsOf(L_OWNER), L_OWNER?.total, L_OWNER?.count, L_OWNER?.truncated, L_OWNER?.project],
  [[...PROJ_DRAFTS].sort(), 7, 7, false, PROJ]);
t("REC-198: A JOINED PARTICIPANT WHO IS NOT THE OWNER LISTS THE SAME SEVEN — the accepts-when clause",
  [idsOf(L_ELLA), L_ELLA?.total], [[...PROJ_DRAFTS].sort(), 7]);
{
  /* EACH ROW OPENS: the `read` it names is the single read, and it answers the draft the row names. */
  const opened = [];
  for (const row of L_ELLA?.drafts || []) {
    const q = String(row.read || "");
    const r = q.startsWith("op=reviewcopy&draft=") ? rP(await GET(`${q}&token=${ELLA}`)) : null;
    opened.push(r?.kind === "review-copy" && r?.draft === row.draft_id);
  }
  t("and every row OPENS: the read it names is `op=reviewcopy`, and it answers the draft the row names",
    [opened.length, opened.every(Boolean)], [7, true]);
}
{
  const row = (L_OWNER?.drafts || []).find((d) => d.draft_id === D1);
  const own = await ownerRead(D1);
  t("a row states the draft's case identity exactly as the single read does — the edition read from the "
  + "published record, never stored",
    [row?.case?.case_id, row?.case?.edition, row?.case?.identity], [own?.case?.case_id, own?.case?.edition, own?.case?.identity]);
}

/* THE FENCE, CALLER BY CALLER. For each caller the single read's admission of D1 and the list's admission of
   PROJ must agree. pat (invited, not joined) and omar (an administrator, no participant) are the callers a
   copied "joined participants" fence would refuse while the single read admits them; vic (a member with no
   position in PROJ) is the caller dropping the fence would admit. */
{
  const callers = [["iris", IRIS], ["ella", ELLA], ["pat", PAT], ["uma", UMA], ["omar", OMAR], ["vic", VIC],
                   ["machine", "mem-r126"]];
  const single = [], list = [];
  for (const [who, tok] of callers) {
    single.push([who, rP(await GET(`op=reviewcopy&draft=${D1}&token=${tok}`))?.kind === "review-copy"]);
    list.push([who, (await listOf(tok))?.ok === true]);
  }
  t("REC-198: THE LIST ADMITS EXACTLY WHOM THE SINGLE READ ADMITS, caller by caller — including the invited-not-"
  + "joined participant and the non-participant administrator, where a second fence would part from the first",
    list, single);
  console.log(`         the single read's admission, printed: ${JSON.stringify(single)}`);
  t("and the table is not vacuous: the single read admits some of these callers and refuses others",
    [single.some(([, a]) => a), single.some(([, a]) => !a)], [true, true]);
}
{
  const uninvited = await rawOf(`op=casedrafts&token=${VIC}&project=${encodeURIComponent(PROJ)}`);
  const singleDead = await rawOf(`op=reviewcopy&draft=${D1}&token=${VIC}`);
  const noProject = await rawOf(`op=casedrafts&token=${VIC}&project=PROJ-2026-9999-nowhere`);
  t("REC-198: THE UNINVITED MEMBER READS THE FENCE'S ANSWER — status, content type and every byte of the single "
  + "read's dead answer, and the same bytes as a project that does not exist",
    [uninvited, noProject], [singleDead, singleDead]);
  t("and the dead answer names nothing of the project: no id, no draft",
    [uninvited.body.includes(PROJ), PROJ_DRAFTS.some((d) => uninvited.body.includes(d))], [false, false]);
  t("and the fence runs the other way too: PROJ's owner, no participant of vic's project, reads the same dead answer there",
    [(await rawOf(`op=casedrafts&token=${IRIS}&project=${encodeURIComponent(VIC_PROJ)}`)).body, singleDead.body],
    [singleDead.body, singleDead.body]);
  t("a caller with no credential at all reads no drafts (the op is gated; see this block's 'cannot see')",
    parsed(await rawOf(`op=casedrafts&project=${encodeURIComponent(PROJ)}`))?.drafts === undefined, true);
}
{
  const empty = rP(await GET(`op=casedrafts&token=${VIC}&project=${encodeURIComponent(VIC_PROJ)}`));
  t("a project with no drafts answers an EMPTY list that says it is the whole — a stated zero, not a refusal",
    [empty?.ok, empty?.drafts?.length, empty?.total, empty?.truncated], [true, 0, 0, false]);
}
{
  /* THE BOUND, in `bounds.test.mjs`'s loop shape (that suite drives `casedrafts` in its own loop too). */
  const bite = await listOf(IRIS, "&limit=1");
  const over = await listOf(IRIS, "&limit=99999");
  t("REC-198: THE LIST IS BOUNDED AND SAYS SO: a bite of 1 over seven is cut, publishes the bound it applied and "
  + "the total; the default reads all seven and says it did; an over-ask is answered at the ceiling",
    [bite?.drafts?.length, bite?.limit, bite?.total, bite?.truncated, L_OWNER?.truncated, over?.limit],
    [1, 1, 7, true, false, 500]);
}
{
  /* STRUCTURALLY: ONE FENCE, CALLED BY BOTH READS. A behavioural arm cannot see a faithful copy of a rule. */
  const body = (name) => {
    const at = STORE_SRC.search(new RegExp(`\\n  ${name.replace(/[#$]/g, (c) => "\\" + c)}\\(`));
    if (at < 0) return "";
    const next = STORE_SRC.slice(at + 1).search(/\n  (?:static |async )?[#A-Za-z_$][\w$]*\([^)]*\)\s*\{/);
    return next < 0 ? "" : STORE_SRC.slice(at, at + 1 + next);
  };
  const single = body("#draftForMember"), list = body("caseDraftList");
  t("REC-198: THE LIST AND THE SINGLE READ CALL THE SAME FENCE — `#seesProjectDrafts` is called from both, and "
  + "neither compiles a viewer predicate of its own",
    [single.length > 0, list.length > 0, /this\.#seesProjectDrafts\(/.test(single),
     /this\.#seesProjectDrafts\(/.test(list),
     /viewerPredicate\(/.test(single), /viewerPredicate\(/.test(list)],
    [true, true, true, true, false, false]);
  t("and the fence has exactly those two callers in the store",
    (STORE_SRC.match(/this\.#seesProjectDrafts\(/g) || []).length, 2);
}

/* =========================================================================== 10
 * REC-199 / BOB #32 (2026-09-23 23:08Z), `BIO_Publication_v0_1.md` §6A.4: `op=reviewcopy`
 * ANSWERS `newCase`, BECAUSE A READ THAT DROPS A FIELD AN EDIT WRITES BACK LOSES IT.
 *
 * WHY THE LOSS IS BEHAVIOURAL AND NOT COSMETIC — which is what makes an arm possible at
 * all. D-309's `newCase` is the ONLY way a caller can SAY "this material starts a new
 * case" when its findings already serve one; the identity a draft stands at is otherwise
 * DERIVED. LEAD is already published as case C1 edition 1 (block 1), so the two routes
 * answer differently through the gates and nothing internal has to be believed:
 *   - with `newCase`   -> the dry run mints, and every gate PASSES.
 *   - without it       -> the derivation finds C1 and the gates refuse ALREADY_A_CASE_MEMBER.
 * A copy that drops the field turns the first draft into the second at the next edit, in
 * exactly the direction D-309 exists to refuse: the publisher's NEW-CASE intent silently
 * overridden. `case.case_id` cannot stand in for it — it is `null` for both.
 *
 * THE ROUND TRIP IS DRIVEN, NEVER ASSERTED. `bodyFromCopy` rebuilds `op=casedraft`'s body
 * FROM THE ANSWER AND NOTHING ELSE — the shape `civicos-ui`'s `rvcFormFromCopy` +
 * `rvcDraftBody` pair has, and the act the UI performs when a member re-opens a draft to
 * edit it. So an arm cannot pass because this suite remembered what it sent: if the answer
 * does not say a thing, the write-back cannot say it either.
 *
 * AND THE LAST ARM IS THE CLASS, NOT THE FIELD. A list of field names goes stale the day a
 * twelfth is added to `REVIEW_DRAFT_FIELDS`, so the property asserted is that a review copy
 * is a FIXED POINT of read -> write-back -> read: every authored fact, the case identity and
 * the gates' own verdict survive the trip unchanged. Any future field the answer drops fails
 * it without anybody remembering to extend a list.
 * ========================================================================= */
console.log("\n--- 10. REC-199: the copy says `newCase` back, so an edit does not lose it ---");
{
  /* THE WRITE-BACK, BUILT FROM THE ANSWER ALONE. Every value here is read off the review
     copy; nothing is carried over from the body that made the draft. */
  const bodyFromCopy = (c) => {
    const b = { project: c?.project, draft: c?.draft };
    const fs = Array.isArray(c?.findings) ? c.findings : [];
    if (fs.length) {
      b.targets = fs.map((f) => f.target);
      const roles = {};
      for (const f of fs) if (f.role) roles[f.target] = f.role;
      if (Object.keys(roles).length) b.roles = roles;
    }
    if (c?.case?.case_id) b.caseId = c.case.case_id;
    if (c?.case?.newCase) b.newCase = c.case.newCase;
    const a = c?.authored || {};
    for (const k of ["scope", "statement", "subjectPosition", "subjectJustification", "biasAcknowledgement"])
      if (a[k]) b[k] = a[k];
    if (Array.isArray(a.excluded)) b.excluded = a.excluded;
    return b;
  };
  /* The comparable part of a copy: what an EDIT is supposed to preserve. `updated_at` moves
     on every write and is REC-200's subject, not this one's; the lists and the marking are
     not authored. */
  const authoredPart = (c) => ({ case: c?.case, authored: c?.authored, gates: c?.gates,
                                 missing: c?.missing, findings: c?.findings });
  const copyOf = async (id) => rP(await GET(`op=reviewcopy&draft=${id}&token=${IRIS}`));

  const DNr = await draft(IRIS, withRoles({ ...args(9), targets: [LEAD], newCase: true }));
  if (!DNr?.ok) bail("casedraft DN (the new-case draft over a finding C1 already publishes)", DNr);
  const DDr = await draft(IRIS, withRoles({ ...args(9), targets: [LEAD] }));
  if (!DDr?.ok) bail("casedraft DD (the same material with the field unset)", DDr);

  const DN1 = await copyOf(DNr.draftId), DD1 = await copyOf(DDr.draftId);
  const D1c = await copyOf(D1), D2c = await copyOf(D2);

  t("REC-199: THE TWO ROUTES ARE A REAL FORK, and the draft's own answer proves the fixture before any "
  + "arm rests on it — the same findings, `newCase` the only difference: one mints and passes every gate, "
  + "the other derives C1 and is refused ALREADY_A_CASE_MEMBER",
    [DN1?.gates, DN1?.missing?.length, DD1?.gates, DD1?.missing?.[0]?.reason],
    ["passed", 0, "refused", "ALREADY_A_CASE_MEMBER"]);

  t("REC-199: THE COPY SAYS THE FIELD BACK, and says it of the DRAFT rather than of the case identity: "
  + "`true` only where the draft asked for a new case, `false` where it named a case AND where it said "
  + "nothing — the two the case identity cannot tell apart, since `case_id` is null for both",
    [DN1?.case?.newCase, DD1?.case?.newCase, D1c?.case?.newCase, D2c?.case?.newCase,
     DD1?.case?.case_id, D2c?.case?.case_id, D1c?.case?.case_id],
    [true, false, false, false, null, null, C1]);

  /* THE ROUND TRIP, through the op, as a member editing a draft they have just read. */
  const wrote = await draft(IRIS, bodyFromCopy(DN1));
  t("REC-199: THE ROUND TRIP — the copy is read, `op=casedraft`'s body is rebuilt FROM THE ANSWER ALONE "
  + "and written back to the same draft, and the edit lands",
    [wrote?.ok, wrote?.draftId, wrote?.edited], [true, DNr.draftId, true]);
  const DN2 = await copyOf(DNr.draftId);
  t("REC-199 ACCEPTS-WHEN: AND THE DRAFT IS STILL THE NEW CASE IT WAS — the field survives the trip and "
  + "the gates still pass. A copy that dropped it would hand this draft back as the derived one, refused "
  + "ALREADY_A_CASE_MEMBER, which is the whole defect",
    [DN2?.case?.newCase, DN2?.gates, DN2?.missing?.length], [true, "passed", 0]);

  /* THE CLASS. IT RUNS OVER A DRAFT OF ITS OWN (`DC`), NOT OVER `DN`: the round trip above
     has already written `DN` back, so a copy that dropped the field would have turned it into
     the derived draft on that first trip and every trip after it would be a fixed point of
     the WRONG draft — an arm that cannot fail once the damage is done. `DC` is authored the
     same way and read for the first time here. */
  const DCr = await draft(IRIS, withRoles({ ...args(9), targets: [LEAD], newCase: true }));
  if (!DCr?.ok) bail("casedraft DC (the class arm's own untouched new-case draft)", DCr);
  const RT = async (id) => {
    const before = await copyOf(id);
    const w = await draft(IRIS, bodyFromCopy(before));
    return [authoredPart(before), w?.ok === true, authoredPart(await copyOf(id))];
  };
  const [bN, okN, aN] = await RT(DCr.draftId);
  const [bD, okD, aD] = await RT(DDr.draftId);
  const [b1, ok1, a1] = await RT(D1);
  const [b2, ok2, a2] = await RT(D2);
  t("REC-199, THE CLASS AND NOT THE FIELD: A REVIEW COPY IS A FIXED POINT OF read -> write-back -> read. "
  + "Four drafts — the new case, the derived one, one naming an existing case and one saying nothing — "
  + "each rewritten from its own answer, and every authored fact, the case identity and the gates' own "
  + "verdict come back unchanged. A twelfth field the answer forgets fails this without a list to extend",
    [[okN, okD, ok1, ok2], JSON.stringify([bN, bD, b1, b2]) === JSON.stringify([aN, aD, a1, a2])],
    [[true, true, true, true], true]);
}

/* =========================================================================== 11
 * D-538 (`BIO_Publication_v0_1.md` §6A.4, with BOB #32's newCase ruling of 2026-09-23 23:08Z): THE
 * IDENTITY SENTENCE READS THE DRAFT'S `newCase`, IN EVERY ANSWER THAT PRINTS IT.
 *
 * THE MEASURED FAILURE IT MOVES is block 10's draft DD: it names no case and does not set `newCase`,
 * its findings already serve C1, and its own gates DERIVE C1 and refuse ALREADY_A_CASE_MEMBER — while
 * `#caseIdentitySentence(null, 1)` told the casedraft, casedrafts and reviewcopy answers (and the grant's
 * `boundTo`) that it was *a new case, whose identity is not yet allocated*. That is the record asserting
 * a new case where it will derive an existing one. Three drafts are read through FOUR answers each:
 *   DN — `newCase` set          -> the new-case sentence (the only draft it is true of);
 *   DD — nothing named or asked  -> DERIVED at publication, UNDETERMINED here, never "a new case";
 *   D1 — names C1                -> the next edition (2) of C1, unchanged.
 * And DB, which names C1 AND asks for a new case — a pair publication refuses together — is told so,
 * rather than "the next edition" of a case it cannot become as it stands.
 * ========================================================================= */
console.log("\n--- 11. D-538: the identity sentence reads `newCase`, in every answer that prints it ---");
{
  /* Matched by what the sentence must SAY, not by its spelling: arm (p) rewords it and must pass. */
  const NEW = /not yet allocated/i, DERIVED = (x) => typeof x === "string" && /deriv/i.test(x)
    && /undetermined/i.test(x) && !NEW.test(x);
  const DNr = await draft(IRIS, withRoles({ ...args(9), targets: [LEAD], newCase: true }));
  const DDr = await draft(IRIS, withRoles({ ...args(9), targets: [LEAD] }));
  const DBr = await draft(IRIS, withRoles({ ...args(9), targets: [LEAD], caseId: C1, newCase: true }));
  for (const [n, r] of [["DN", DNr], ["DD", DDr], ["DB", DBr]]) if (!r?.ok) bail(`casedraft ${n} (block 11)`, r);
  const copy = async (id) => rP(await GET(`op=reviewcopy&draft=${id}&token=${IRIS}`));
  const [cN, cD, c1, cB] = [await copy(DNr.draftId), await copy(DDr.draftId), await copy(D1), await copy(DBr.draftId)];
  const list = rP(await GET(`op=casedrafts&token=${IRIS}&project=${encodeURIComponent(PROJ)}`));
  const row = (id) => (list?.drafts || []).find((d) => d.draft_id === id)?.case?.identity;
  const gN = await grant(IRIS, { draft: DNr.draftId, recipient: "D-538 reader, new case" });
  const gD = await grant(IRIS, { draft: DDr.draftId, recipient: "D-538 reader, derived case" });
  for (const [n, r] of [["DN", gN], ["DD", gD]]) if (!r?.ok) bail(`reviewgrant ${n} (block 11)`, r);

  t("D-538: THE FIXTURE IS THE MEASURED FAILURE — DD's own gates derive C1 and refuse ALREADY_A_CASE_MEMBER, "
  + "DN's mint and pass, and the list holds every draft this block reads (so a missing row cannot pass)",
    [cD?.gates, cD?.missing?.[0]?.reason, cN?.gates, list?.truncated,
     [DNr, DDr, DBr].every((r) => typeof row(r.draftId) === "string") && typeof row(D1) === "string"],
    ["refused", "ALREADY_A_CASE_MEMBER", "passed", false, true]);
  t("D-538 ACCEPTS-WHEN: DRAFT DD READS THE DERIVATION — DERIVED at publication and UNDETERMINED here, never "
  + "\"a new case\" — in all three reads (casedraft, casedrafts, reviewcopy) and in its grant's boundTo",
    [DERIVED(DDr.caseIdentity), DERIVED(row(DDr.draftId)), DERIVED(cD?.case?.identity), DERIVED(gD.boundTo)],
    [true, true, true, true]);
  t("D-538: AND THE NEW-CASE SENTENCE IS KEPT FOR THE ONE DRAFT IT IS TRUE OF — DN, which asked for a new case, "
  + "in the same four answers (an arm that deleted the sentence everywhere fails here)",
    [NEW.test(DNr.caseIdentity), NEW.test(row(DNr.draftId)), NEW.test(cN?.case?.identity), NEW.test(gN.boundTo)],
    [true, true, true, true]);
  /* The edition is read from the published record at each read (C1 has moved past 1 by this block), so the
     sentence is pinned against the edition the SAME answer states, and that edition against "next". */
  t("D-538: A DRAFT NAMING A CASE IS UNCHANGED — the next edition of C1, in its copy and its list row",
    [c1?.case?.case_id, c1?.case?.edition >= 2, c1?.case?.identity, row(D1)],
    [C1, true, `the next edition (${c1?.case?.edition}) of ${C1}`, `the next edition (${c1?.case?.edition}) of ${C1}`]);
  t("D-538: A DRAFT THAT NAMES C1 AND ASKS FOR A NEW CASE is told publication refuses the pair "
  + "(CASE_IDENTITY_AMBIGUOUS) and that its case is UNDETERMINED — its own gates' verdict, not \"the next edition\"",
    [cB?.gates, cB?.missing?.[0]?.reason, /CASE_IDENTITY_AMBIGUOUS/.test(cB?.case?.identity ?? ""),
     /undetermined/i.test(DBr.caseIdentity ?? ""), /undetermined/i.test(row(DBr.draftId) ?? "")],
    ["refused", "CASE_IDENTITY_AMBIGUOUS", true, true, true]);
}

console.log(`\nreviewcopy: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
