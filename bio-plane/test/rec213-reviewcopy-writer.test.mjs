/* NEGATIVE CONTROL: RUN 2026-09-24 by the REC-213 worker in /home/user/bio on land/worker/REC-213, each
 * arm ALONE (others restored and verified first), DECLARED BEFORE ARMING, every restore by `cp` from a
 * UNIQUELY-NAMED pristine copy in the SESSION SCRATCHPAD — never inside the worktree (BOB #32, 2026-09-24)
 * and never `git checkout --` — verified by sha256 (`sha256sum -c` OK,
 * 0c9cab9c793860e8cf1b231c87b8b0b5b11569b59c8b0b69510184b5d1348170) AND by `cmp` (content identical) with
 * the byte count printed and floored, 3,326,958 bytes. The suites run `src/index.mjs` raw under miniflare,
 * so no bundle rebuild is in the loop.
 *   (0) BASELINE, nothing armed — what distinguishes three-arms-broken from three-arms-working:
 *       rec213 19/0, d150 64/0, rec212 45/0. The TRUE pre-change baseline was measured separately by
 *       swapping `git show HEAD:bio-plane/src/store.mjs` in and back (restored by sha256 + `cmp`): d150
 *       64/0, rec212 45/0, reviewcopy 77/0, reviewcopy-inband 22/0 — IDENTICAL to the post-change figures,
 *       so this landing's whole delta is this suite's 19 assertions and no existing assertion moved.
 *   (a) THE ROW'S OWN CONTROL — `writer` DROPPED AT `reviewCopy`'s CALL (the sixth positional back to
 *       `null`, which is the state this landing found). DECLARED: MUST FAIL block 2's ACCEPTS-WHEN row
 *       (the list NAMES the writer), block 2's counted row, block 3's three count rows and block 5's two;
 *       MUST NOT fail blocks 1, 4, 6, nor d150, nor rec212. RESULT: rec213 12 pass, 7 FAIL — exactly those
 *       seven, the ACCEPTS-WHEN row reading `[["participant","ella"]]` where it wants `[]`, which IS the
 *       defect. d150 64/0 and rec212 45/0, as declared — AND THAT IS THE FINDING ABOUT WHY THIS SUITE
 *       EXISTS: both drive the CASE DOCUMENT's door, which REC-212 already fixed, so neither could ever
 *       have seen the review copy's.
 *   (b) OVER-STRICTNESS, SCOPED TO THIS SITE — every draft read as UNDETERMINED (`{ by: null }` forced),
 *       so EVERY participant row is withheld. Correct work in a spelling the rule allows must PASS, and
 *       this arm makes it fail. DECLARED: MUST FAIL block 1's listed row and its zero row, block 2's
 *       counted and undetermined-key rows, block 3's participant row, block 5's trap and relation rows,
 *       block 6's fresh-draft row; MUST NOT fail rec212 (the document door, which this arm does not
 *       touch). RESULT: rec213 9 pass, 10 FAIL — those, plus block 3's two recipient rows, which fail on
 *       the COUNT they also assert (2 where they want 1) and not on a withheld recipient: the recipient
 *       arm of the rule survives the arm, which is the half this control is for. d150 61/3, and that is
 *       NOT a surprise: d150 asserts the review copy's list at three sites, so an arm at this site is
 *       SUPPOSED to reach it. rec212 45/0, as declared.
 *   (c) THE `AND COUNTED` HALF OF BOB #33 REMOVED — the withholding kept, `withheld` forced to 0, so the
 *       surface hides rather than states. DECLARED: MUST FAIL every row that reads the count (block 2's
 *       counted row, block 3's three, block 5's two); MUST NOT fail block 2's ACCEPTS-WHEN absent row,
 *       which is about the LIST and must still pass. RESULT: rec213 13 pass, 6 FAIL — exactly those six,
 *       with the ACCEPTS-WHEN row still green. d150 64/0, rec212 45/0.
 *   D-540 (RUN 2026-09-25 by the D-540 worker on land/worker/D-540, each arm ALONE, DECLARED BEFORE ARMING,
 *   every restore by `cp` from a uniquely-named pristine copy in the session scratchpad, verified by sha256
 *   (`sha256sum -c` OK, 3b1f1cba9fed1c8262a0b4a59e476fb3ace82f492b9f264a876efda4743d63b3) AND `cmp`, 3,353,411
 *   bytes). BASELINE: rec213 20/0, rec212 46/0, d150 64/0.
 *     (d540-a) THE ROW'S OWN CONTROL — the writer exclusion DROPPED from `#statementAcknowledgements`' unbound
 *       count (its `acknowledger IS ?` bound to null). DECLARED: MUST FAIL rec213 block 4's count row (reads
 *       3) and its prose row; MUST NOT fail rec212 or d150. RESULT: rec213 18 pass, 2 FAIL — exactly those two,
 *       `got [..,3,..]` — rec212 46/0, d150 64/0, as declared.
 *     (d540-b) THE FOLD — writer-undetermined participant rows counted INTO `unbound` and the own key zeroed.
 *       DECLARED: MUST FAIL rec212 block 5's two D-540 rows; MUST NOT fail rec213 or d150. RESULT: rec212 44
 *       pass, 2 FAIL — exactly those two, `got [0,[],1,null,null]` — rec213 20/0, d150 64/0, as declared.
 *     NOT DRIVEN, SAID: a RECIPIENT's draft-given row under an UNDETERMINED writer (it stays in `unbound`);
 *       no fixture here holds one.
 *   NOT ARMED, AND SAID RATHER THAN SCORED: the shared `byTheWriter` predicate itself (widening it to
 *   RECIPIENT rows) is REC-212's subject, not this row's, and an arm there breaks the case document as
 *   well as the review copy — so it is not this suite's control and is named here so a reader does not
 *   read its absence as an untested claim. Block 3 asserts the recipient property positively instead.
 *
 * REC-213 / BIO_Publication_v0_1.md §6A + §3 rule 11 (BOB #33 RULED, 2026-09-24 19:06Z) —
 * `op=reviewcopy`'s LIVE STATEMENT LIST COULD SHOW THE WRITER'S OWN ACKNOWLEDGEMENT AMONG THE
 * SECOND READERS, while the case document had withheld it since REC-212.
 *
 * An acknowledgement is *I read what this case leaves out and I stand as its SECOND reader*
 * (§3 rule 11). A row by the sentence's own writer is not a second reading, so listing it claims a
 * reading nobody made — in the one artifact a reviewer is being ASKED to attack, and on the surface
 * whose whole purpose is to show who has read the statement. REC-212 pointed the case document's
 * exclusion at `completeness.statement_by` and left `op=reviewcopy`'s call NOT ASKED, on the
 * reasoning that the review copy is the LIVE list. That reasoning was wrong in one direction and the
 * direction is the point: *live* is about WHEN the list is read, not about what it may CLAIM.
 *
 * BOB #33 RULED the answer: the writer's row is WITHHELD **AND COUNTED**, with the count and its
 * reason stated beside the list, exactly as the case document does. §6A's *show everything recorded*
 * holds — nothing recorded is hidden, because what is not listed is counted and its reason printed.
 *
 * THE FIXTURE THAT ARMS THE TRAP IS THE WHOLE DIFFICULTY, and it is stated here rather than left to
 * be inferred from the code. Since REC-193 the draft door REFUSES the writer's own acknowledgement
 * (`STATEMENT_ACK_BY_ITS_AUTHOR`), so a writer's row cannot be taken directly and a suite that only
 * tried that would report the defect unreachable. It is reached the way the record actually reaches
 * it: `statement_by` follows the BYTES, so a member who acknowledges a sentence and LATER rewrites
 * it — or edits it away and back — becomes its writer while their earlier reading of those exact
 * bytes stays in the record at that same production. The row was taken when it was honest and the
 * list now claims something it never said. That is one edit of a wording and back, which is ordinary
 * drafting, not a contrivance.
 *
 * EVERY BLOCK IS DRIVEN THROUGH THE CONTROL PLANE (`op=casedraft`, `op=statementack`,
 * `op=reviewgrant`, `op=reviewcopy`, `op=publish`) and never through the store: a store-level test is
 * not evidence a caller can reach the feature.
 *   1. THE PLAIN CASE: a second reader IS listed, and `withheld` says zero in words.
 *   2. ACCEPTS-WHEN: the writer's own row is ABSENT from the list, COUNTED in `withheld` and in
 *      `acknowledgements_by_statement_writer_not_listed`, and its reason names the writer and rule 11.
 *   3. OVER-STRICTNESS: a participant who is NOT the writer, and a RECIPIENT through a grant, are
 *      both still listed with the withholding in force — a fence tighter than its rule is not safer.
 *   4. THE NARROWING HELD: a NEW case's document lists none of a draft's readings (REC-194), so an
 *      empty list there is the narrowing and not this landing.
 *   5. THE TWO DOORS ARE ONE READ: at a BINDABLE identity (a draft naming an existing case) `op=publish`
 *      withholds the same member and prints the same count as the review copy — §6A's own property.
 *   6. THE CORPUS, PRINTED AND FLOORED, with what this suite could NOT drive said plainly.
 */

import { statedJSON } from "./stated.mjs";
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

/* BLOCK 5 NEEDS A RATIFIED EDITION 1 BEFORE A DRAFT CAN STAND AT EDITION 2, WHICH IS THE ONLY
   IDENTITY AT WHICH BOTH DOORS READ ONE LIST — so the suite signs, and skips WHOLE rather than
   half, because a half-run whose skipped half is the relation arm reads as a pass. */
if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- rec213-reviewcopy-writer ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("rec213-reviewcopy-writer: SKIPPED — ssh-keygen not on PATH; the two-doors-one-read block "
    + "needs a ratified edition 1, and a partial run would report the relation as untested");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r213", MEMBER_TOKEN: "mem-r213", PROBE_TOKEN: "prb-r213", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const bail = (what, r) => {
  console.log(`  FAIL  (fixture) ${what}: ${JSON.stringify(r).slice(0, 700)}`);
  fail++;
  console.log(`\nrec213-reviewcopy-writer: ${pass} pass, ${fail} fail  [FIXTURE ABORTED]`);
  mf.dispose().then(() => process.exit(1));
  throw new Error("fixture");
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const ack = async (q) => rP(await POST(`op=statementack&${q}`, {}));

const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-r213",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  if (!add?.ok || !add.invite) bail(`memberadd ${memberId}`, add);
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
/* ADMINS_FIRST: administrative access is shared before any ordinary member exists, so the second
   enrolment is an administrator too. omar takes no part in any block below. */
await enrol("nadia", "nadia-passphrase-213", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-213", "admin", ["contribute", "publish"]);
/* iris OWNS the project (she issues grants and publishes); ella and pat are JOINED participants.
   ella is the member who becomes the statement's writer AFTER acknowledging it; pat is the third
   member the over-strictness arm needs, so that the withholding can be shown to bite on ONE name
   and not on the class. */
const dir = mkdtempSync(join(tmpdir(), "rec213-"));
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
const IRIS = await enrol("iris", "iris-passphrase-213", "member", ["contribute", "publish"]);
const ELLA = await enrol("ella", "ella-passphrase-213", "member", ["contribute", "publish"]);
const PAT = await enrol("pat", "pat-passphrase-213", "member", ["contribute", "publish"]);

rP(await POST("op=signeradd&token=adm-r213", { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));

const PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r213", owner: "iris",
  name: "PROJ-2026-2130-second-reader", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
for (const [h, tok] of [["ella", ELLA], ["pat", PAT]]) {
  const inv = rP(await GET(`op=projectinvite&token=${IRIS}&projectId=${encodeURIComponent(PROJ)}&handle=${h}`));
  if (!inv?.ok) bail(`projectinvite ${h}`, inv);
  const jn = rP(await GET(`op=projectjoin&token=${tok}&projectId=${encodeURIComponent(PROJ)}`));
  if (jn?.state !== "joined") bail(`projectjoin ${h}`, jn);
}

/* ---- the corpus: d150's and rec212's shapes, lifted rather than invented ---- */
let snapSeq = 0;
const promote = async (id, text, objectType, state) => rP(await POST("op=promote&token=adm-r213", {
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

const INFO = "INFO-2026-2130-memo";
const TURN = "INQ-2026-2130-turn";     /* blocks 1-4: ella acknowledges, then becomes the writer */
const FRESH = "INQ-2026-2130-fresh";   /* block 1's zero arm: nobody has acknowledged anything */
const Q = { [TURN]: "Was the transfer authorised?", [FRESH]: "Was notice given?" };
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

const S_ONE = "This case covers the FY2024 transfer only (rec213); the FY2023 memo is out of it.";
const S_TWO = "This case covers the FY2024 transfer only (rec213, as ella reworded it); the memo is out.";
const args = (tag, over = {}) => ({
  project: PROJ, scope: `Whether the transfer was authorised (${tag}).`,
  statement: S_ONE,
  excluded: [{ target: null, description: `the FY2023 memo (${tag})`, reason: "a records request is outstanding" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: `We put the claims to the City Administrator (${tag}).`,
  biasAcknowledgement: `This group holds that transfers should be adopted in public (${tag}).`,
  ...over,
});
const withRoles = (b) => ({ ...b, roles: allLoadBearing(b) });
const copyOf = async (draft, token) => rP(await GET(`op=reviewcopy&draft=${draft}&token=${token}`));
/* THE READS ARE BY NAME AND ANSWER A STATED ABSENCE, never `undefined` bubbling into a comparison:
   a suite that compares `undefined` to `undefined` agrees for free, which is the equality that costs
   nothing to produce (`CLAUDE.md` §5). `saOf` also FAILS LOUDLY on a copy that did not answer, so a
   refusal cannot read as an empty list. */
const saOf = (copy) => {
  const sa = copy && copy.statement_acknowledgements;
  if (!sa || typeof sa !== "object") return { MISSING: true };
  return sa;
};
const listedOf = (copy) => (saOf(copy).acknowledgements || []).map((a) => [a.kind, a.by]);

/* =========================================================================== 1 */
console.log("\n--- 1. the plain case: a second reader is LISTED, and the withheld count says ZERO in words ---");
const TURN_ARGS = args("turn");
const D1r = rP(await POST(`op=casedraft&token=${IRIS}`, withRoles({ ...TURN_ARGS, targets: [TURN] })));
if (!D1r?.ok) bail("casedraft TURN", D1r);
const D1 = D1r.draftId;
{
  const before = await copyOf(D1, IRIS);
  t("FIXTURE: iris wrote the statement, so the SERVER stamps her as its writer, and the fresh list is empty",
    [before?.statement_by, before?.updated_by, listedOf(before),
     saOf(before).statement_sha === sha(S_ONE)],
    ["iris", "iris", [], true]);
  t("A FRESH DRAFT WITHHOLDS NOTHING, AND SAYS SO RATHER THAN LEAVING IT BLANK — zero is a statement "
  + "(D-150's own precedent), and the sentence names the writer it found nothing by",
    [saOf(before).withheld,
     /Nothing is withheld from this list/.test(saOf(before).withheld_stated || ""),
     /no acknowledgement of this statement by iris, who wrote it/.test(saOf(before).withheld_stated || ""),
     Object.prototype.hasOwnProperty.call(saOf(before), "acknowledgements_by_statement_writer_not_listed")],
    [0, true, true, false]);
  const a1 = await ack(`draft=${D1}&token=${ELLA}`);
  if (!a1?.ok) bail("ella acknowledges D1", a1);
  const after = await copyOf(D1, IRIS);
  t("ACCEPTS-WHEN'S OTHER HALF: ella, who did NOT write the sentence, acknowledges it and IS listed — "
  + "her reading is a second person's, and nothing is withheld",
    [listedOf(after), saOf(after).withheld,
     /no acknowledgement of this statement by iris, who wrote it/.test(saOf(after).withheld_stated || "")],
    [[["participant", "ella"]], 0, true]);
}

/* =========================================================================== 2 */
console.log("\n--- 2. ACCEPTS-WHEN: the writer's own row is ABSENT from the list and COUNTED beside it ---");
{
  /* ella rewords the sentence and puts it back. `statement_by` follows the BYTES (REC-193), so she is
     now the writer of a sentence she acknowledged while somebody else was. Nothing is deleted: the
     acknowledgement is keyed on the statement's sha at this production, so it matches again the moment
     the bytes come back. THIS IS THE STATE THE ROW IS ABOUT and it is reached by ordinary drafting. */
  const e1 = rP(await POST(`op=casedraft&token=${ELLA}`,
    { draft: D1, ...withRoles({ ...args("turn", { statement: S_TWO }), targets: [TURN] }) }));
  if (!e1?.ok) bail("ella rewords D1", e1);
  const between = await copyOf(D1, IRIS);
  t("FIXTURE, STEP 1 — ella rewords the statement: the stamp MOVES to her and the new sentence has no "
  + "second reader at all (an acknowledgement is of ONE sentence)",
    [between?.statement_by, listedOf(between), saOf(between).statement_sha === sha(S_TWO),
     saOf(between).withheld],
    ["ella", [], true, 0]);
  const e2 = rP(await POST(`op=casedraft&token=${ELLA}`,
    { draft: D1, ...withRoles({ ...TURN_ARGS, targets: [TURN] }) }));
  if (!e2?.ok) bail("ella restores D1's statement", e2);
  const copy = await copyOf(D1, IRIS);
  t("FIXTURE, STEP 2 ARMS THE TRAP — the sentence is back to the bytes ella acknowledged, and she is now "
  + "its writer: the two facts the review copy has to hold at once, and the only state in which the "
  + "defect is visible",
    [copy?.statement_by, copy?.updated_by, copy?.authored?.statement === S_ONE,
     saOf(copy).statement_sha === sha(S_ONE)],
    ["ella", "ella", true, true]);
  t("ACCEPTS-WHEN: THE WRITER'S OWN ROW IS ABSENT from the review copy's list — the measured failure it "
  + "moves is ella LISTED here among the second readers of her own sentence",
    listedOf(copy), []);
  t("AND IT IS COUNTED BESIDE THE LIST, NOT HIDDEN (BOB #33): the count, the publish answer's own key for "
  + "it, and a reason naming the writer and rule 11",
    [saOf(copy).withheld, saOf(copy).acknowledgements_by_statement_writer_not_listed,
     /recorded and NOT listed above, by the statement's writer, ella/.test(saOf(copy).withheld_stated || ""),
     /not a SECOND reading of it \(BIO_Publication §3 rule 11\)/.test(saOf(copy).withheld_stated || ""),
     /everything recorded is shown or stated/.test(saOf(copy).withheld_stated || "")],
    [1, 1, true, true, true]);
  t("THE UNDETERMINED KEY IS ABSENT, because this withholding has a NAME: a row withheld as the writer's "
  + "own and a row withheld because nobody knows who the writer is are two different facts",
    [Object.prototype.hasOwnProperty.call(saOf(copy), "acknowledgements_withheld_writer_undetermined"),
     /UNDETERMINED/.test(saOf(copy).withheld_stated || "")],
    [false, false]);
  t("AND THE RECORD STILL HOLDS THE ROW — it is withheld, never deleted: ella cannot acknowledge again, "
  + "and the plane refuses her BY NAME as the statement's author",
    [(await ack(`draft=${D1}&token=${ELLA}`))?.reason,
     (await ack(`draft=${D1}&token=${ELLA}`))?.author],
    ["STATEMENT_ACK_BY_ITS_AUTHOR", "ella"]);
}

/* =========================================================================== 3 */
console.log("\n--- 3. OVER-STRICTNESS: the withholding bites on ONE name, not on the class ---");
let G1 = null;
{
  const a2 = await ack(`draft=${D1}&token=${PAT}`);
  if (!a2?.ok) bail("pat acknowledges D1", a2);
  const copy = await copyOf(D1, IRIS);
  t("A PARTICIPANT WHO IS NOT THE WRITER IS STILL LISTED with the withholding in force — a fence tighter "
  + "than its rule is not a safer fence, and the count does not move",
    [listedOf(copy), saOf(copy).withheld, saOf(copy).acknowledgements_by_statement_writer_not_listed],
    [[["participant", "pat"]], 1, 1]);
  G1 = rP(await POST(`op=reviewgrant&token=${IRIS}`,
    { draft: D1, recipient: "Dana Ruiz, City Auditor's office" }));
  if (!G1?.ok || !G1.secret) bail("reviewgrant D1", G1);
  const a3 = await ack(`draft=${D1}&secret=${encodeURIComponent(G1.secret)}`);
  if (!a3?.ok) bail("recipient acknowledges D1", a3);
  const copy2 = await copyOf(D1, IRIS);
  t("A RECIPIENT'S ROW IS NEVER WITHHELD by either exclusion — a grant's holder is never the member who "
  + "wrote the statement (REC-193's own sentence) — and the count still does not move",
    [listedOf(copy2), saOf(copy2).withheld],
    [[["participant", "pat"], ["recipient", G1.grantId]], 1]);
  const bySecret = rP(await GET(`op=reviewcopy&secret=${encodeURIComponent(G1.secret)}`));
  t("THE RECIPIENT'S OWN DOOR READS THE SAME LIST AND THE SAME COUNT — one read, two doors, and a "
  + "recipient is exactly the reader this surface exists for",
    [listedOf(bySecret), saOf(bySecret).withheld,
     saOf(bySecret).withheld_stated === saOf(copy2).withheld_stated],
    [[["participant", "pat"], ["recipient", G1.grantId]], 1, true]);
}

/* =========================================================================== 4 */
console.log("\n--- 4. a NEW case's document is untouched by the draft's readings (REC-194's narrowing, held) ---");
let CB = null;
{
  const P = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...TURN_ARGS, targets: [TURN] })));
  if (P?.ok === false || !P?.caseDocument?.doc_sha) bail("publish TURN", P);
  CB = P.caseDocument.case_id;
  const c = P?.completeness || {};
  /* REC-194's narrowing, NOT this row's doing and asserted here so the next block's contrast is
     readable: a reading given for a draft that named NO case is not a reading of the case the draft
     BECAME, so a new case's document lists none of them and counts them as unbindable instead. The
     writer withholding therefore has nothing to bite on HERE, and saying so is what tells an absent
     list caused by the narrowing apart from one caused by this landing. */
  /* CORRECTED 2026-09-25 BY D-540, never exempted: this arm asserted 3, and 3 WAS THE DEFECT, pinned. D1
     holds three draft-given readings — ella's, pat's and the grant's recipient's — and ella WROTE the
     sentence, so hers is not a second reading of it at any identity (§3 rule 13; §6A.4: *a row by the
     sentence's own writer is not a second reading at any moment*). `#statementAcknowledgements`' unbound
     count asked only the publisher's exclusion (REC-212 put the writer's on the LIST alone), so the
     document stated her own reading as one more reading that might be THIS case's. The honest count is 2:
     pat's and the recipient's. The writer is DETERMINED here, so nothing is stated as writer-undetermined. */
  t("the new case carries ella as the statement's writer and iris as the block's author, lists NOBODY, and "
  + "counts the draft-given readings as UNBINDABLE rather than as second readers of this case — TWO, pat's and "
  + "the recipient's, never the writer ella's own (D-540)",
    [c.statement_by, c.author, (c.acknowledgements || []).map((a) => [a.kind, a.by]),
     c.acknowledgements_unbindable_to_this_case ?? null,
     c.acknowledgements_by_statement_writer_not_listed ?? null,
     c.acknowledgements_unbindable_writer_undetermined ?? null],
    ["ella", "iris", [], 2, null, null]);
  const docB = rP(await GET(`op=casedocument&case=${CB}&edition=1&token=${IRIS}`));
  t("D-540: and the PROSE the owner signs says the same TWO — the key and the sentence are one claim",
    [/This record also holds 2 acknowledgements of this exact statement/.test(docB?.text || ""),
     /also holds 3 acknowledgements/.test(docB?.text || ""),
     /whether any is the statement's writer's own/.test(docB?.text || "")],
    [true, false, false]);
  const rr = rP(await POST(`op=caseratify&token=${IRIS}`,
    { caseId: CB, edition: 1, expectedSha: P.caseDocument.doc_sha,
      sig: signCase("iris", CB, 1, P.caseDocument.doc_sha) }));
  if (rr?.ok === false) bail("caseratify CB edition 1", rr);
}

/* =========================================================================== 5 */
console.log("\n--- 5. the two doors are ONE READ: at a BINDABLE identity both withhold the same member ---");
{
  /* A DRAFT THAT NAMES AN EXISTING CASE STANDS AT THAT CASE'S NEXT EDITION, so every reading given
     through it is BOUND to a case identity and reaches `op=publish` (REC-194). That is the only
     identity at which the review copy and the case document read ONE list, and §6A's property — *the
     list a reviewer sees and the list a case document prints are one read* — is therefore assertable
     here and nowhere else. The reword-and-restore turn is run again, because it is still the only way
     a writer can hold a reading of their own sentence. */
  const ED2 = "INQ-2026-2130-ed2";
  const r = await promote(ED2, withAdoptableReading(inquiryMd(ED2, `Was ${ED2} recorded?`, INFO)), "inquiry", "open");
  if (r.ok === false) bail(`promote ${ED2}`, r);
  const cc = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(ED2)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${ED2} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${ED2}.`)}` + adoptedVersionParam()));
  if (!cc.ok) bail(`conclude ${ED2}`, cc);
  const E2 = args("ed2", { statement: S_ONE });
  const D2r = rP(await POST(`op=casedraft&token=${IRIS}`,
    withRoles({ ...E2, caseId: CB, targets: [ED2] })));
  if (!D2r?.ok) bail("casedraft ed2", D2r);
  const D2 = D2r.draftId;
  const c0 = await copyOf(D2, IRIS);
  t("FIXTURE: the draft NAMES an existing case, so it stands at edition 2 and every reading of it is "
  + "BINDABLE — and iris, who wrote this copy of the sentence, is its writer for now",
    [c0?.case?.case_id, c0?.case?.edition, c0?.statement_by, saOf(c0).withheld],
    [CB, 2, "iris", 0]);
  if (!(await ack(`draft=${D2}&token=${ELLA}`))?.ok) bail("ella acknowledges D2", {});
  if (!(await ack(`draft=${D2}&token=${PAT}`))?.ok) bail("pat acknowledges D2", {});
  const e1 = rP(await POST(`op=casedraft&token=${ELLA}`,
    { draft: D2, ...withRoles({ ...args("ed2", { statement: S_TWO }), caseId: CB, targets: [ED2] }) }));
  if (!e1?.ok) bail("ella rewords D2", e1);
  const e2 = rP(await POST(`op=casedraft&token=${ELLA}`,
    { draft: D2, ...withRoles({ ...E2, caseId: CB, targets: [ED2] }) }));
  if (!e2?.ok) bail("ella restores D2", e2);
  const copy = await copyOf(D2, IRIS);
  t("THE TRAP, ARMED AT A BINDABLE IDENTITY: ella acknowledged the sentence and is now its writer, so the "
  + "review copy lists pat alone and counts hers",
    [copy?.statement_by, listedOf(copy), saOf(copy).withheld,
     saOf(copy).acknowledgements_by_statement_writer_not_listed],
    ["ella", [["participant", "pat"]], 1, 1]);
  const P2 = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...E2, caseId: CB, targets: [ED2] })));
  if (P2?.ok === false || !P2?.caseDocument?.doc_sha) bail("publish ed2", P2);
  const c2 = P2?.completeness || {};
  t("§6A's PROPERTY, ASSERTED AS A RELATION RATHER THAN TWICE: the document iris is about to hand round "
  + "withholds the SAME member, counts it in the SAME number and lists the SAME readers as the review copy "
  + "she just read — one read, two doors",
    [c2.statement_by, c2.acknowledgements_by_statement_writer_not_listed === saOf(copy).withheld,
     JSON.stringify((c2.acknowledgements || []).map((a) => [a.kind, a.by])) === JSON.stringify(listedOf(copy)),
     c2.statement_sha === saOf(copy).statement_sha,
     (c2.acknowledgements || []).map((a) => [a.kind, a.by])],
    ["ella", true, true, true, [["participant", "pat"]]]);
  const rr = rP(await POST(`op=caseratify&token=${IRIS}`,
    { caseId: CB, edition: 2, expectedSha: P2.caseDocument.doc_sha,
      sig: signCase("iris", CB, 2, P2.caseDocument.doc_sha) }));
  if (rr?.ok === false) bail("caseratify CB edition 2", rr);
  const doc = rP(await GET(`op=casedocument&case=${CB}&edition=2&token=${IRIS}`));
  const fm = parseFrontmatter(doc?.text || "").data || {};
  t("AND IN THE SIGNED BYTES A STRANGER READS: one second reader, named, with the writer absent from the "
  + "list and named beside it as the writer — the claim the record can support and no more",
    [doc?.ratified, fm.completeness?.acknowledged,
     (fm.completeness_acknowledgements || []).map((a) => a.by),
     fm.completeness?.statement_by, fm.completeness?.author,
     (doc?.text || "").includes("- ella, a participant of " + PROJ)],
    [true, 1, ["pat"], "ella", "iris", false]);
}

/* =========================================================================== 6 */
console.log("\n--- 6. the corpus, and what this suite could NOT drive ---");
{
  const Dfr = rP(await POST(`op=casedraft&token=${PAT}`,
    withRoles({ ...args("fresh", { statement: S_ONE }), targets: [FRESH] })));
  if (!Dfr?.ok) bail("casedraft FRESH", Dfr);
  const fresh = await copyOf(Dfr.draftId, PAT);
  t("A SECOND PRODUCTION OF THE SAME SENTENCE IS NOT THIS ONE'S (REC-194's narrowing, held): pat's new "
  + "draft carries the same bytes, its own writer, no readings and nothing withheld",
    [fresh?.statement_by, saOf(fresh).statement_sha === sha(S_ONE), listedOf(fresh), saOf(fresh).withheld,
     /no acknowledgement of this statement by pat, who wrote it/.test(saOf(fresh).withheld_stated || "")],
    ["pat", true, [], 0, true]);
  const copies = [await copyOf(D1, IRIS), fresh];
  console.log(`         corpus: ${copies.length} review copies read back through op=reviewcopy, `
    + `${copies.reduce((n, c) => n + (saOf(c).acknowledgements || []).length, 0)} acknowledgement(s) listed, `
    + `${copies.reduce((n, c) => n + (saOf(c).withheld || 0), 0)} withheld and counted`);
  t("OVER A NON-EMPTY CORPUS, FLOORED: every review copy this suite read carries `withheld` as a NUMBER "
  + "and `withheld_stated` as a non-empty SENTENCE — never silence, and never one without the other",
    [copies.length >= 2,
     copies.map((c) => typeof saOf(c).withheld === "number"),
     copies.map((c) => typeof saOf(c).withheld_stated === "string" && saOf(c).withheld_stated.length > 40)],
    [true, [true, true], [true, true]]);
  /* WHAT THIS SUITE CANNOT SEE, SAID RATHER THAN SCORED (`CLAUDE.md` §5, and WORKER.md's rule that a
     matcher's reach is load-bearing). The UNDETERMINED arm — `writer.by === null`, which withholds
     EVERY participant row — is NOT DRIVEN here and cannot be: it needs a draft holding a statement
     with a NULL `statement_by`, and since REC-193 the server stamps that column at every write that
     changes the statement's bytes, so no sequence of ops on a store this code wrote produces one.
     REC-212's suite measured the same unreachability from the document side. The branch and its
     sentence are asserted by READING, not by driving, and are named here so a reader can tell an
     unexercised path from a passing one. */
  console.log("         NOT DRIVEN (said, never scored): the UNDETERMINED withholding (`statement_by` NULL on a "
    + "draft) — unreachable through any act since REC-193 stamps the column at every statement write.");
}

console.log(`\nrec213-reviewcopy-writer: ${pass} pass, ${fail} fail  [FOOT REACHED]`);
await mf.dispose();
process.exit(fail ? 1 : 0);
