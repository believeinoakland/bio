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

   NEGATIVE CONTROL: RUN 2026-09-24 by the REC-193 worker on block 9 (rule 13, `statement_by`), in /home/user/bio on
   land/worker/REC-193, the arm ALONE on `src/store.mjs`, declared before arming, restored by `cp` from a per-arm
   pristine copy verified by sha256 (`sha256sum -c` OK, b23856ca…5dfc) AND `cmp` (content identical, 3,166,538 B) —
   never `git checkout --`. The suite runs `src/index.mjs` directly, so no rebuild is in the loop.
   (0) BASELINE, nothing armed -> 49 pass, 0 fail.
   (le) THE LAST EDITOR READ AGAIN — `statementAuthor = d.statement_by ?? null` reverted to `d.updated_by` at BOTH
   draft doors, which is precisely the liar the row names (keep reading the last editor and add a column nobody
   reads). Declared: MUST FAIL block 9's accepts-when arm (B may acknowledge) and its "A is refused by name" arm;
   MUST NOT fail blocks 1–8, whose author is in every case also the last editor -> 46 pass, 3 fail: those two, and
   block 9's OVER-STRICTNESS arm (iris re-saves ella's sentence, so the last editor and the author disagree the
   other way round). One more than declared, in the declared direction, and it is the arm that measures the stamp
   following the TEXT rather than the act of editing. Blocks 1–8 green, as declared.
   NOT DRIVEN, AND SAID RATHER THAN SCORED: no arm exercises `STATEMENT_ACK_AUTHOR_UNDETERMINED`. A draft holding a
   statement and no `statement_by` cannot be produced by any act on a store this code wrote — the state exists only
   in stores written before this landing, where the migration adds the column NULL. Block 9's last arm asserts the
   totality this suite CAN reach (every draft it authored with a statement carries an author) and prints its corpus.

   NEGATIVE CONTROL: RUN 2026-09-25 by WORKER D-521 on block 8's corrected arms. C-82.1 restored beside an orphaned
   region: this suite 63 pass, 1 FAIL, exactly "RETIRED, not orphaned: C-82.1 …", and check-refusal-codes exit 1 naming
   the region. The full record, with every arm, is in `rec217-draft-binding.test.mjs`'s header.
   NEGATIVE CONTROL: RUN 2026-09-24 by the REC-194 worker on blocks 3, 6, 8, 10 and 11 (rule 13, the ONE-CASE-IDENTITY
   NARROWING), in /home/user/bio on land/worker/REC-194, each arm ALONE on `src/store.mjs`, DECLARED BEFORE ARMING,
   restored by `cp` from a UNIQUELY NAMED per-arm pristine copy verified by sha256 AND by `cmp` (content identical,
   floored at 3,000,000 B) — never `git checkout --`. The suite runs `src/index.mjs` directly, so no bundle is in
   the loop. **RUN TWICE, AND THE SECOND RUN IS THE ONE THAT COUNTS.** The first pass was taken at
   `8f6982e4...b57b1d` (3,231,780 B); the gate then found two real defects in the landing (a ternary around the
   listing read had moved it out of `derivation-bounds`' GRADED truncation roster, and block 8's rewrite had left
   C-82.1 named by no assertion anywhere in the battery, 449/449 -> 448/449 in `coverage.mjs`), and BOTH fixes
   CHANGED THE SUBJECT — arm (a)'s patch text no longer existed, so re-running was necessity and not diligence:
   an arm that does not arm is a finding, and a suite coupled to behaviour survives a shape change that disarms a
   control coupled to shape (`CLAUDE.md` §5). Both arms were re-armed against the FINAL source at
   `b87385ea...a734c5` (3,232,909 B) and returned the SAME figures as the first pass, recorded because agreement
   measured twice is worth more than agreement assumed once.
   (0) BASELINE, nothing armed -> 64 pass, 0 fail on the final source, and 64/0 AGAIN after EACH of the two
   restores, re-run to prove the restore rather than trusting `cp`.
   (a) MATCH BY THE STATEMENT'S HASH ALONE — the row's first named control: `#statementAcknowledgements`' two
   identity predicates made inert (`case_id IS ? OR 1=1`, `? = '*' OR draft_id = ? OR 1=1`), so the read matches
   project + statement_sha + edition and nothing else, which is D-150's defect at its widest. DECLARED: MUST FAIL
   block 10's "ACCEPTS-WHEN (first clause) ... TWIN-B ... lists NOBODY" BY NAME and block 3's REC-194 arms; MUST NOT
   FAIL block 9 (REC-193's stamp, untouched), block 4's one-member arms (the SOLO project holds no other reading of
   that sentence), or block 8's arms (which drive the DOCUMENT read, not this one) -> 51 pass, 13 fail: the named arm
   and both of block 10's altitudes of the same claim (signed bytes, public read), block 10's review-copy arm, all six
   of block 3, and block 6. Blocks 4, 8, 9 and 11 GREEN, as declared. ALL THIRTEEN ARE IN THE DECLARED DIRECTION, and
   one is worth naming: block 3's "the act re-authors it" arm fails too, because under hash-only matching the
   RE-AUTHOR path lists three readings where one is bound — the arm is sensitive to the defect at the second
   altitude as well as the first.
   (b) THE DRAFT DOOR MATCHED BY STATEMENT TEXT ACROSS THE PROJECT — the row's second named control:
   `acknowledgeStatement`'s document read restored to `(case_id=? OR ? IS NULL)` with no null short-circuit, so a
   draft naming no case reaches every same-sentence unsigned edition-1 document of the project. DECLARED: MUST FAIL
   block 8's and block 10's "ACCEPTS-WHEN (second clause)" arms BY NAME; MUST NOT FAIL block 10's first-clause listing
   arms, whose read this arm does not touch -> 58 pass, 6 fail: both named arms, block 8's three neighbouring
   measurements (the re-run act, the byte-identity of every document, and the C-82.1 arm, whose unreachability half
   is exactly what (b) re-reaches) and its RESIDUE
   arm. EVERY LISTING ARM STAYED GREEN, which is the point of running the two arms separately: the listing read and
   the document read are two mechanisms, each with its own arm, and neither control can pass for the other's reason.
   ONE SURPRISE, RECORDED RATHER THAN SMOOTHED: block 8's "and NOTHING WAS WRITTEN" arm stayed GREEN under (b). That
   is the arm behaving correctly — under (b) the FIRST act refuses over IC-246's bound and so writes nothing, and
   it is the SECOND act, after one document is signed, that re-authors MAX of them; the arm that catches the write is
   the byte-identity arm after both acts, which failed. An arm that reads "nothing was written" is about ONE act.

   NEGATIVE CONTROL: RE-RUN 2026-09-24 ON THE UNION by the REC-194 worker, after CONDUCT #20's merge of
   c20-batch24b (REC-212's `writer` exclusion) into this branch. **RE-RUN BECAUSE THE SUBJECT MOVED, NOT AS
   DILIGENCE:** the union put a parameter between `exceptAuthor` and `draftId` and rewrote the predicates
   these arms break, so a control taken before it is a claim about a function that no longer exists. Each arm
   ALONE on `src/store.mjs`, restored by `cp` from a uniquely-named per-arm pristine copy verified by sha256
   (`3d0a2e09...`, both arms) AND by `cmp` (content identical, 3,297,589 B, floored at 3,000,000) — never
   `git checkout --`. BOTH ARMS WERE RUN AGAINST TWO SUITES, because after the union two suites read this one
   function: this one and `rec212-statement-writer.test.mjs`.
   (0) BASELINE on the union, nothing armed -> d150 64/0, rec212 45/0, d507 63/0; and 64/0 again after EACH
   restore, re-run to prove the restore rather than trusting `cp`.
   (a) MATCH BY THE STATEMENT'S HASH ALONE (`case_id IS ? OR 1=1`, `? = '*' OR draft_id = ? OR 1=1`)
   -> d150 51/13, the named twin-case arm failing BY NAME, exactly as on the pre-union tree; AND rec212
   44/1. **THAT SECOND FIGURE IS THE MOST USEFUL THING THIS RE-RUN PRODUCED.** REC-194's narrowing moved a
   draft-given row out of REC-212's writer withholding and into `unbound`, so block 5's arm there had to be
   corrected — and a correction that merely ACCOMMODATED the narrowing would pass under this arm too. It
   fails instead, `want [0,[],1,null]` against `got [0,[],1,1]`: with hash-only matching the row is matched
   again and withheld as possibly-the-writer's, so the corrected arm PINS the narrowing at REC-212's altitude
   rather than yielding to it. A corrected assertion that cannot fail is worse than none.
   (b) THE DRAFT DOOR MATCHED BY STATEMENT TEXT ACROSS THE PROJECT -> d150 58/6, both accepts-when
   second-clause arms failing BY NAME, every LISTING arm green; rec212 45/0 UNTOUCHED, as it must be — that
   arm breaks the DOCUMENT read and REC-212 reads the LISTING one. The two arms remain separable on the union.
   AND D-507'S OWN CONTROL WAS RE-RUN ON THE UNION IN ONE STEP (`node
   test/d507-statement-ack-translation.control.mjs`, CONDUCT #20 asked for it because its arm (a) needle
   quotes the by-its-author region this merge touched): baseline 63/0 guard exit 0, arm (a) 61/2 guard exit 1
   naming `is-statement-ack-by-its-author`, arm (b) 61/2 guard exit 1, arm (c) over-strictness 63/0 guard
   exit 0 — ALL FOUR AS DECLARED, every restore verified by sha256, content AND `cmp`, pen removed. The
   union disarmed none of it.

   (d) D-564 (declared and RUN 2026-09-25, WORKER D-564 (SCHEDULER #22)), THE RECORDER — every section now runs in
   `block()` (D-548's recorder, from `d84-case-manifest.test.mjs`), and the subject is the SUITE, so the arms break a
   section's FIXTURE. Re-run in one step: `node test/d564-block.control.mjs d150-statement-acknowledgement` from
   bio-plane/. BASELINE -> **64 pass, 0 fail**, per section 0 (setup) 0/0, 0b (corpus) 0/0, 1 11/0, 2 1/0, 3 6/0,
   4 4/0, 5 8/0, 6 2/0, 7 4/0, 8 7/0, 9 9/0, 10 8/0, 11 4/0, foot reached.
   (d) SECTION 6's FIXTURE BROKEN — its draft authored by pat (invited, NOT joined) instead of ella, which the plane
   refuses REVIEW_NOT_PROJECT_OWNER. Declared: section 6 DIES by name with tally -1, every other section reports its
   baseline tally -> **62 pass, 1 fail**, `BLOCK 6 DIED: (fixture) casedraft De: {"ok":false,"reason":
   "REVIEW_NOT_PROJECT_OWNER"`, every other section at its baseline tally, foot reached, as declared. Before D-564
   the same break ended the run at `[FIXTURE ABORTED]` and sections 7-11 went unmeasured.
   (e) THE RECORDER DISARMED (`block()` rethrows) over (d)'s fixture — declared: NO foot and no section tally, exit 1
   -> **no foot, exit 1, no section tally**, as declared (run 2026-09-25 by `d564-block.control.mjs`; the real suite hashed unchanged before and after).

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
import { checkCaseDocument, parseFrontmatter, STATEMENT_ACK_CHECKS } from "../checks/bio-checks.mjs";

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
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
/* D-564: EVERY SECTION RUNS INSIDE `block()` — D-548's recorder (d84-case-manifest.test.mjs), adopted. Before it,
   `bail()` disposed the sandbox and exited on the FIRST fixture failure ("FIXTURE ABORTED"), so one broken fixture
   ended the run and every later section went unmeasured. Now a fixture failure is a THROW that `block()` records as
   ONE failure naming its section, and the sections after it still run and report. Each section's own tally is
   printed at the foot; a section that DIED prints -1, never the partial count it reached; a section expected but
   never reported fails by name. A section resting on an earlier one's values asks for them with `needs()` and dies
   naming the section it rests on. */
const bail = (what, r) => { throw new Error(`(fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`); };
const needs = (section, vals) => {
  const missing = Object.entries(vals).filter(([, v]) => v === undefined).map(([k]) => k);
  if (missing.length) throw new Error(`rests on section ${section}, which did not produce ${missing.join(", ")}`);
};
const TALLY = [];
const block = async (name, fn) => {
  const p0 = pass, f0 = fail;
  let died = false;
  try { await fn(); }
  catch (e) {
    died = true;
    fail++;
    console.log(`  FAIL  BLOCK ${name} DIED: ${String((e && e.message) || e).slice(0, 700)}`);
    console.log("         (the sections after this one still run — see below)");
  }
  TALLY.push({ name, pass: died ? -1 : pass - p0, fail: died ? -1 : fail - f0, died });
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
let OMAR, IRIS, ELLA, PAT, SOL, PROJ, SOLO;
console.log("\n--- 0. setup: members, signers, the two projects ---");
await block("0 (setup)", async () => {
await enrol("nadia", "nadia-passphrase-150", "admin", ["contribute", "publish", "create_projects"]);
/* iris OWNS PROJ and signs; ella is a JOINED participant (the second reader); pat is INVITED and
   NOT joined; omar is an ADMINISTRATOR with sight of every project and a place in none; sol OWNS a
   project of ONE member (Design Requirement 2). */
OMAR = await enrol("omar", "omar-passphrase-150", "admin", ["contribute", "publish"]);
IRIS = await enrol("iris", "iris-passphrase-150", "member", ["contribute", "publish"]);
ELLA = await enrol("ella", "ella-passphrase-150", "member", ["contribute", "publish"]);
PAT = await enrol("pat", "pat-passphrase-150", "member", ["contribute", "publish"]);
SOL = await enrol("sol", "sol-passphrase-150", "member", ["contribute", "publish"]);
for (const who of ["iris", "sol"])
  rP(await POST("op=signeradd&token=adm-d150", { keyB64: mkKey(who), memberId: who, comment: `${who} laptop` }));

PROJ = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-d150", owner: "iris",
  name: "PROJ-2026-1500-second-reader", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });
SOLO = await makePublishingProject({
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
});

/* ---- the corpus: reviewcopy.test.mjs's shapes, lifted rather than invented ---- */
let snapSeq = 0;
const promote = async (id, text, objectType, state) => rP(await POST("op=promote&token=adm-d150", {
  bundleId: id, base: null,
  snapKey: `20260923T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
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

const INFO = "INFO-2026-1500-memo";
const LEAD = "INQ-2026-1500-lead";      /* the case a participant AND a recipient acknowledge through a draft */
const DOCQ = "INQ-2026-1500-doc";       /* the case acknowledged through its unsigned case document */
const PUBQ = "INQ-2026-1500-publisher"; /* the case whose publisher had acknowledged an editor's statement */
const SOLQ = "INQ-2026-1500-solo";      /* the one-member project's case */
const Q = { [LEAD]: "Was the transfer authorised?", [DOCQ]: "Was notice given?",
            [PUBQ]: "Was the auditor told?", [SOLQ]: "Who signed the memo?" };
console.log("\n--- 0b. the corpus: the memo and the four inquiries, concluded ---");
await block("0b (corpus)", async () => {
needs("0 (setup)", { IRIS, SOL });
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
});

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
let G1, STMT, CA, CB;
console.log("\n--- 1. who may acknowledge: a second person with a place in the project, or a recipient ---");
await block("1", async () => {
needs("0 (setup)", { IRIS, PAT, OMAR, SOL, ELLA, PROJ });
const D1r = rP(await POST(`op=casedraft&token=${IRIS}`, withRoles({ ...args(PROJ, "lead"), targets: [LEAD] })));
if (!D1r?.ok) bail("casedraft D1", D1r);
const D1 = D1r.draftId;
G1 = rP(await POST(`op=reviewgrant&token=${IRIS}`, { draft: D1, recipient: "Dana Ruiz, City Auditor's office" }));
if (!G1?.ok || !G1.secret) bail("reviewgrant D1", G1);
STMT = args(PROJ, "lead").statement;

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
/* CORRECTED 2026-09-25 (D-543), NOT EXEMPTED: the date was pinned to WHOLE SECONDS, the one act on a review
   copy stamped that way while its edit, comments and grants carry milliseconds — so an acknowledgement made
   in the same second as a comment was dated EARLIER than it, and a string compare ranked it LATER. The
   acknowledgement is now stamped `stampInstant("millisecond")` like the copy's other acts; what this arm
   asserts, a real dated instant, is unchanged.
   CORRECTED 2026-09-25 (D-568), NOT EXEMPTED: the answer's edition was pinned at 1, the MINTED-case edition, for a
   draft that names no case and sets no `newCase` — whose case publication DERIVES, so which edition it becomes is
   UNDETERMINED here. The answer states `null`; the row is still written at the internal (no case, 1) key, which
   the "SAME act" arm below still reads. */
t("A JOINED PARTICIPANT ACKNOWLEDGES — attributed to her, dated, of THIS statement's hash (computed here), at "
+ "the draft's case identity (no case id, edition UNDETERMINED (null) — a draft naming no case, whose case "
+ "publication derives; the label read \"a new case\", which D-538 corrected: the draft sets no `newCase`)",
  [A1?.ok, A1?.existed, A1?.acknowledgement?.kind, A1?.acknowledgement?.by,
   A1?.acknowledgement?.statement_sha === sha(STMT), A1?.acknowledgement?.case_id, A1?.acknowledgement?.edition,
   /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(A1?.acknowledgement?.at || "")],
  [true, false, "participant", "ella", true, null, null, true]);
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
});

/* =========================================================================== 2 */
console.log("\n--- 2. an acknowledgement is of ONE sentence: an edited statement starts with none ---");
await block("2", async () => {
needs("0 (setup)", { IRIS, ELLA, PROJ });
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
});

/* =========================================================================== 3 */
console.log("\n--- 3. the SIGNED completeness block lists them ---");
await block("3", async () => {
needs("0 (setup)", { IRIS, ELLA, PROJ });
needs("1", { G1, STMT });
/* CORRECTED 2026-09-24 BY REC-194, NEVER EXEMPTED, AND THE OLD ASSERTION WAS WRONG RATHER THAN STALE.
   It read: a NEW case's `op=publish` lists the acknowledgements taken through the DRAFT it was prepared
   from — and the mechanism that made it pass matched every acknowledgement of the same SENTENCE in the
   project at edition 1, because a draft naming no case records no case identity. That is the mechanism
   §3 rule 13 rules out (BOB #32, 2026-09-23): the acknowledgement binds to ONE case identity, and a
   second case of the same project whose statement is byte-identical listed the first's second readers in
   its own SIGNED block (block 10 drives exactly that). A case id is minted only by publication, nothing
   binds a draft to the case it became, and so the honest answer for a new case is that the record cannot
   say — which this block now asserts, in the two halves the plane distinguishes:
     (a) `op=publish` of a NEW case lists NOBODY and SAYS HOW MANY readings it could not bind, and the
         document's prose states them as UNDETERMINED rather than printing "Nobody but its author";
     (b) the same second reader acknowledging the PREPARED, UNSIGNED document — the case door, whose
         acknowledgement IS bound to this case — is listed in the bytes the owner signs, which is the
         property the old arms were really about.
   WHAT IS LOST AND IS NOT PAPERED OVER: a review-copy RECIPIENT holds no session, so the case door is
   not theirs, and their reading of a new case's draft can reach no signed document at all. That is a
   design gap in rule 13's narrowing, reported by REC-194, not a property this suite asserts away. The
   recipient's listing in signed bytes is driven in block 11, where the draft names an EXISTING case and
   the acknowledgement is therefore bound. */
const pubA = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(PROJ, "lead"), targets: [LEAD] })));
if (pubA?.ok === false || !pubA?.caseDocument?.doc_sha) bail("publish lead", pubA);
CA = pubA.caseDocument.case_id;
t("REC-194: op=publish of a NEW case lists NOBODY — ella's and the recipient's readings were given for a draft "
+ "that names no case, so no case document may claim them — and the act SAYS how many it could not bind",
  [pubA?.completeness?.statement_sha === sha(STMT),
   (pubA?.completeness?.acknowledgements || []).map((a) => [a.kind, a.by, a.recipient]),
   pubA?.completeness?.acknowledged ?? 0,
   pubA?.completeness?.acknowledgements_unbindable_to_this_case],
  [true, [], 0, 2]);
{
  const doc0 = await docOf(CA, 1, IRIS);
  t("and the document it authored states them as UNDETERMINED rather than as nobody: the count is 2 in the prose, "
  + "no name appears, and the flat 'Nobody but its author' sentence is NOT printed",
    [/Nobody acknowledged it FOR THIS CASE\./.test(doc0?.text || ""),
     /holds 2 acknowledgements of this exact statement/.test(doc0?.text || ""),
     /whether any of them is a reading of THIS case is UNDETERMINED/.test(doc0?.text || ""),
     /Nobody but its author acknowledged it\./.test(doc0?.text || ""),
     (doc0?.text || "").includes("- ella, a participant of " + PROJ)],
    [true, true, true, false, false]);
}
const A3 = await ack(`case=${CA}&edition=1&token=${ELLA}`);
t("ella then acknowledges THIS CASE's prepared document — the case door, whose reading IS bound to this case id "
+ "and this edition — and the act re-authors it",
  [A3?.ok, A3?.bound_to_a_case, A3?.acknowledgement?.case_id, A3?.acknowledgement?.edition,
   (A3?.case_documents || []).map((d) => [d.case_id, d.reauthored, d.acknowledged])],
  [true, true, CA, 1, [[CA, true, 1]]]);
{
  const r = await ratify("iris", IRIS, CA, 1, (A3?.case_documents || [])[0]?.doc_sha);
  if (r?.ok === false) bail("caseratify lead", r);
  const doc = await docOf(CA, 1, IRIS);
  const fm = fmOf(doc?.text);
  t("IN THE SIGNED BYTES: the document is ratified, its completeness block names the statement's hash and a count "
  + "of 1, and its list names ella — the reading given FOR THIS CASE, and only that one",
    [doc?.ratified, doc?.doc_sha === sha(doc?.text || ""), fm.completeness?.statement_sha === sha(STMT),
     fm.completeness?.acknowledged,
     (fm.completeness_acknowledgements || []).map((a) => [a.kind, a.by])],
    [true, true, true, 1, [["participant", "ella"]]]);
  /* MEASURED RATHER THAN PREDICTED: the tail counts TWO, not one. Both draft-given readings stay unbindable —
     the recipient's, and ella's OWN reading of the draft, which is a different act from her reading of this
     case's document (a different case identity, so a different row). The record holds three readings of this
     sentence and can attribute exactly one of them to this case; the block names that one and the tail counts
     the other two, which is the whole distinction this row exists to draw. */
  t("AND IN THE PROSE a member reviewed and signed, beside the statement: ella is named, the TWO unbindable draft "
  + "readings (the recipient's, and ella's own of the draft) travel with the list as undetermined, and the grant "
  + "is NOT named as a reader",
    [/Who else read this statement\.\*\* Acknowledged/.test(doc?.text || ""),
     (doc?.text || "").includes("- ella, a participant of " + PROJ),
     /holds 2 acknowledgements of this exact statement/.test(doc?.text || ""),
     (doc?.text || "").includes(`review grant ${G1.grantId}, addressed by its issuer as 'Dana Ruiz, City Auditor's office'`)],
    [true, true, true, false]);
  const pc = rP(await GET(`op=publishedcase&id=${CA}`));
  t("the published case serves the list COMMITTED FROM THE SIGNED BYTES, to a caller with no credential",
    (pc?.completeness?.acknowledgements || pc?.case?.completeness?.acknowledgements || []).map((a) => [a.kind, a.by]),
    [["participant", "ella"]]);
}
});

/* =========================================================================== 4 */
console.log("\n--- 4. THE ONE-MEMBER ARM: a case nobody else acknowledged publishes, and says so ---");
await block("4", async () => {
needs("0 (setup)", { SOL, SOLO });
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
});

/* =========================================================================== 5 */
console.log("\n--- 5. an unsigned case document can be acknowledged; a signed one cannot ---");
await block("5", async () => {
needs("0 (setup)", { IRIS, ELLA, PROJ });
const pubB = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(PROJ, "doc"), targets: [DOCQ] })));
if (pubB?.ok === false || !pubB?.caseDocument?.doc_sha) bail("publish doc", pubB);
CB = pubB.caseDocument.case_id;
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
});

/* =========================================================================== 6 */
console.log("\n--- 6. the member who publishes becomes the statement's author, and their own is left out ---");
await block("6", async () => {
needs("0 (setup)", { IRIS, ELLA, PROJ });
{
  const De = rP(await POST(`op=casedraft&token=${ELLA}`, withRoles({ ...args(PROJ, "publisher"), targets: [PUBQ] })));
  if (!De?.ok) bail("casedraft De", De);
  const ai = await ack(`draft=${De.draftId}&token=${IRIS}`);
  t("the OWNER may acknowledge an EDITOR's statement — the draft's statement is ella's",
    [ai?.ok, ai?.acknowledgement?.by], [true, "iris"]);
  const p = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(PROJ, "publisher"), targets: [PUBQ] })));
  if (p?.ok === false) bail("publish publisher", p);
  const doc6 = await docOf(p.caseDocument.case_id, 1, IRIS);
  const fm = fmOf(doc6?.text);
  /* CORRECTED 2026-09-24 BY REC-194, never exempted. The old arm asserted `acknowledgements_by_author_not_listed:
     1` here — the publisher's own reading COUNTED as one left out. It counted because a draft-given reading
     matched this new case by its statement's bytes, which §3 rule 13 rules out: iris's reading was given for a
     DRAFT naming no case, so this case's document cannot count it either way. What is still true, and is what
     the block exists for, is that iris becomes the statement's author at the publish act and her own reading is
     not a second reader's; so the document says 0, lists nobody, and — because the only unbindable reading is
     the AUTHOR's own, which is never a second reading — prints the plain "Nobody but its author" sentence with
     no undetermined tail. THE COUNTING OF AN AUTHOR'S OWN IS NOT LEFT UNDRIVEN: it needs an acknowledgement
     BOUND to the case, which after this narrowing means a draft naming an EXISTING case, and block 11 drives it
     at that case's next edition. */
  t("but iris PUBLISHES it, becoming its author at that act: her acknowledgement is NOT listed, the document says "
  + "0 — and REC-194: it is not COUNTED as left out either, because a reading given for a draft that names no "
  + "case is bound to no case, and the author's own is never an undetermined second reader",
    [fm.completeness?.author, fm.completeness?.acknowledged, fm.completeness_acknowledgements,
     p?.completeness?.acknowledgements_by_author_not_listed ?? null,
     p?.completeness?.acknowledgements_unbindable_to_this_case ?? null,
     /Nobody but its author acknowledged it\./.test(doc6?.text || ""),
     /UNDETERMINED/.test(doc6?.text || "")],
    ["iris", 0, [], null, null, true, false]);
}
});

/* =========================================================================== 7 */
console.log("\n--- 7. the gate: bytes listing the author as their own second reader are refused (C-41.10) ---");
await block("7", async () => {
needs("0 (setup)", { IRIS });
needs("3", { CA });
{
  const good = fmOf((await docOf(CA, 1, IRIS))?.text);
  const errs = (fm) => checkCaseDocument(fm, { caseId: CA, edition: 1 })
    .filter((x) => x.severity === "error" && /acknowledg/.test(x.message || x.msg || "")).map((x) => x.check);
  t("the signed document op=publish authored raises no acknowledgement finding",
    errs(good), []);
  /* CORRECTED 2026-09-24 (REC-212), never exempted: this arm's ASSERTION stands — the bytes it builds are
     still refused by C-41.10 — but its LABEL said "its statement's AUTHOR" of `completeness.author`, and
     §3 rule 13 (BOB #32 (b)) rules that field to be who PREPARED AND PUBLISHED the case, with the
     statement's writer a separate name (`completeness.statement_by`, REC-212). In THIS fixture the two
     coincide — iris wrote the draft's statement in block 1 and iris published — so this arm cannot tell
     them apart and must not be read as covering rule 13: `rec212-statement-writer.test.mjs` is where the
     two names are driven apart, and it is the suite whose control arms the exclusion. The label now says
     which field these bytes name. */
  const self = { ...good, completeness_acknowledgements: [{ kind: "participant", by: good.completeness.author,
                                                            recipient: null, at: "2026-09-23T00:00:00Z" }],
                 completeness: { ...good.completeness, acknowledged: 1 } };
  t("a document listing the member named in completeness.author as having acknowledged it is refused, C-41.10 "
  + "(in this fixture that member also WROTE the statement, so this arm does not separate the two names — "
  + "rec212-statement-writer does)",
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
});

/* =========================================================================== 8 */
console.log("\n--- 8. REC-194: the draft door of a NEW case re-authors NO other case's document ---");
await block("8", async () => {
needs("0 (setup)", { IRIS, SOL, ELLA, PROJ, SOLO });
/* WAS block 8 of IC-246 (c19-unionfix, 2026-09-24): MAX + 1 unsigned edition-1 case documents of ONE statement in
   ONE project, reached THROUGH A DRAFT naming no case, plus a document of the same sentence in another project. Its
   arms asserted that the act re-authored all MAX of them and refused over the bound.
   CORRECTED 2026-09-24 BY REC-194, NEVER EXEMPTED, AND THE PREMISE WAS THE DEFECT RATHER THAN THE ARITHMETIC.
   "every such edition-1 document is the act's to re-author" is exactly what §3 rule 13 rules out (BOB #32): those
   MAX documents are MAX DIFFERENT CASES, and acknowledging one draft may not put a second reader's name into any of
   them, least of all into bytes their owners then sign. So the accepts-when of REC-194 is asserted over the same
   fixture, which is the sharpest one this suite has for it: the draft door of a new case finds NONE of them.
   IC-246's two defects it was built for are NOT un-tested by this correction — both live in the SQL of the read
   this narrowing replaced (a silent cut at the bound, and the project matched after the cut), and the read now
   names `case_id` and `edition`, which are `case_documents`' PRIMARY KEY, so it returns at most ONE row: the cut
   and the crowd-out are unreachable by construction rather than guarded. The bound's refusal
   (STATEMENT_ACK_DOCUMENTS_OVER_BOUND, C-82.1) is therefore UNREACHABLE and is retained as a guard over the read;
   its removal moves a DEC-49 floor and is reported by REC-194 as a nameable fix, not taken here. The arm below
   asserts the unreachability as a MEASUREMENT rather than leaving it to be assumed.
   CORRECTED 2026-09-25 BY D-521, NEVER EXEMPTED: THE BOUND IS GONE, SO ITS ARMS ARE TOO. D-521 re-derived the count
   on REC-217's wider read (a union of the case identity and the one document a draft is bound to): at most TWO
   rows, driven in `rec217-draft-binding.test.mjs` block 7, against a bound of 8. So C-82.1, its region and
   `STATEMENT_ACK_DOCUMENTS_MAX` are retired, and with them the envelope's `case_documents_limit` and
   `case_documents_truncated`, which reported a bound that no longer exists. This block keeps its fixture, since it
   is still the sharpest one for REC-194: NINE same-sentence documents, the figure that was max + 1, now a plain
   count this suite owns. The arms that read the bound are removed. The arm that named C-82.1 now asserts it is
   gone, so the catalogue's coverage cannot lose it silently. */
{
  const SA_MAX = 8;   /* D-521: was read off STATEMENT_ACK_DOCUMENTS_MAX, now retired. The fixture holds SA_MAX + 1 = nine documents, a size this suite sets. */
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
  t("FIXTURE ARMS THE TRAP: there are NINE unsigned documents of this "
  + "one statement in this project, and one more of the same sentence in ANOTHER project",
    [Number.isInteger(SA_MAX) && SA_MAX > 0, pubs.length, new Set(pubs.map((x) => x.caseId)).size,
     before.every((x) => typeof x === "string"), fmOf((await docOf(po.caseDocument.case_id, 1, SOL))?.text).case_project],
    [true, SA_MAX + 1, SA_MAX + 1, true, SOLO]);
  const over = await ack(`draft=${Dm.draftId}&token=${ELLA}`);
  /* CORRECTED 2026-09-25 (D-568), NOT EXEMPTED: the edition was pinned at 1 for a draft naming no case and not
     setting `newCase`, whose case (and so edition) publication DERIVES; the answer states null. What this arm is
     about — the door lands and re-authors none of the MAX + 1 documents — is unchanged. */
  t("ACCEPTS-WHEN (second clause): with nine unsigned edition-1 documents of this EXACT sentence in this "
  + "project, the draft door of a new case LANDS and re-authors NONE OF THEM — a draft that names no case has no "
  + "document of its own, and none of those nine cases is it",
    [over?.ok, over?.existed, over?.bound_to_a_case, over?.acknowledgement?.case_id, over?.acknowledgement?.edition,
     over?.acknowledgement?.draft_id, (over?.case_documents || []).length, over?.reason ?? null],
    [true, false, false, null, null, Dm.draftId, 0, null]);
  t("and NOTHING WAS WRITTEN to any document: every one, this project's nine and the other project's, holds the "
  + "bytes it was authored with",
    await shaNow(), before);
  /* The owner signs the bytes the document HOLDS NOW, read back, so an arm that re-authored one is measured here
     rather than ending the module at a stale signature. */
  const signed = await ratify("iris", IRIS, pubs[0].caseId, 1, (await docOf(pubs[0].caseId, 1, IRIS))?.doc_sha);
  if (signed?.ok === false) bail("caseratify many00", signed);
  const at = await ack(`draft=${Dm.draftId}&token=${ELLA}`);
  const after = await shaNow();
  /* CORRECTED by D-521: this arm also read `case_documents_limit` (SA_MAX) and `case_documents_truncated` (false).
     Both reported the retired bound and are gone from the envelope, so the arm now asserts their ABSENCE. */
  t("acknowledging again is the SAME act, still binds to no case, and still re-authors nothing — signing one of the "
  + "nine changes neither, because none of them was ever this draft's; and no retired bound is reported",
    [at?.ok, at?.existed, (at?.case_documents || []).length, "case_documents_limit" in (at || {}),
     "case_documents_truncated" in (at || {})],
    [true, true, 0, false, false]);
  t("every document is byte-identical to before the two acts, the OTHER project's included", after, before);
  /* THE ORPHANED GUARD WAS NAMED HERE BY REC-194 so the catalogue could not lose it silently: `coverage.mjs` counts a
     check covered when a suite NAMES it, and this was C-82.1's only naming. CORRECTED 2026-09-25 by D-521, never
     exempted: C-82.1 is RETIRED, so the arm now asserts it is gone from the catalogue and that neither act here was
     refused by any code. The ceiling on what the draft door reaches is asserted in rec217 block 7, where two
     documents are driven. */
  t("RETIRED, not orphaned: C-82.1 (STATEMENT_ACK_DOCUMENTS_OVER_BOUND) holds no catalogue row, and over nine "
  + "same-sentence documents the act neither refuses nor re-authors",
    ["STATEMENT_ACK_DOCUMENTS_OVER_BOUND" in STATEMENT_ACK_CHECKS,
     Object.values(STATEMENT_ACK_CHECKS).some((r) => r.check === "C-82.1"),
     over?.reason ?? null, at?.reason ?? null, (over?.case_documents || []).length,
     (at?.case_documents || []).length],
    [false, false, null, null, 0, 0]);
  /* THE RESIDUE, MEASURED AND STATED RATHER THAN SCORED AWAY (REC-194). These MAX + 1 documents were authored
     BEFORE any reading of this sentence existed, so each carries the flat "Nobody but its author acknowledged it"
     sentence — and nothing re-authors them now, because re-authoring them is precisely the cross-case reach this
     row forbids. So an unsigned document prepared before an unbindable reading arrived keeps a sentence that has
     since become undetermined. It CANNOT be fixed from this side without the forbidden reach; the fix that would
     fix it is the one REC-194 reports (op=publish naming the draft it publishes, so the reading binds and the
     question never arises). Asserted here so the next reader finds it measured rather than assumed either way. */
  t("RESIDUE: a document authored BEFORE the unbindable reading arrived keeps its 'Nobody but its author' sentence "
  + "and is not re-authored — the undetermined tail reaches only documents authored after the reading",
    [/Nobody but its author acknowledged it\./.test((await docOf(pubs[1].caseId, 1, IRIS))?.text || ""),
     /UNDETERMINED/.test((await docOf(pubs[1].caseId, 1, IRIS))?.text || ""),
     (await docOf(pubs[1].caseId, 1, IRIS))?.doc_sha === before[1]],
    [true, false, true]);
}
});

/* =========================================================================== 9 */
console.log("\n--- 9. REC-193 / §3 rule 13: the statement's author is WHO WROTE ITS CURRENT BYTES ---");
await block("9", async () => {
needs("0 (setup)", { IRIS, ELLA, PROJ });
/* THE DEFECT THIS BLOCK EXISTS TO CATCH, and D-150 named it PROVISIONAL at the site: the author was read
   from `case_drafts.updated_by`, which is the last editor of ANY field. So a participant who corrected the
   SCOPE after somebody else wrote the statement was refused as its author, and the member who actually wrote
   the sentence was admitted as its own second reader — rule 11 inverted, in both directions at once, with
   nothing in the record reading differently. The stamp is the server's, at the write that CHANGES THE TEXT.
   WHAT A LIAR WOULD DO: keep reading the last editor and add a column nobody reads. Arms 2 and 3 fail it by
   name (the negative control at the head of this file arms exactly that), and arm 5 fails it in the OTHER
   direction — the liar's answer there is right for the wrong reason, so arm 5 alone proves nothing and is
   here to pin the stamp to the TEXT rather than to the act of editing. */
{
  const S_A = "Written by iris: this case covers the FY2024 transfer only (rule13); the FY2023 memo is out of it.";
  const S_B = "Rewritten by ella: the FY2022 ledger is out of this case too (rule13).";
  const mk = (over = {}) => withRoles({ ...args(PROJ, "rule13", { statement: S_A, ...over }), targets: [DOCQ] });
  const D9r = rP(await POST(`op=casedraft&token=${IRIS}`, mk()));
  if (!D9r?.ok) bail("casedraft D9", D9r);
  const D9 = D9r.draftId;
  const fresh = rP(await GET(`op=reviewcopy&draft=${D9}&token=${IRIS}`));
  t("A WRITES THE STATEMENT and the SERVER stamps who wrote it — no caller field reaches it (the act passed "
  + "none), and the draft's own editor reads the same at this moment",
    [fresh?.statement_by, fresh?.updated_by, /wrote the exclusion statement/.test(fresh?.statement_by_stated || "")],
    ["iris", "iris", true]);
  /* B EDITS ANOTHER SECTION: a different scope, the statement BYTE FOR BYTE what A wrote. */
  const ed = rP(await POST(`op=casedraft&token=${ELLA}`,
    { draft: D9, ...mk({ scope: "Whether the transfer was authorised (rule13, as ella narrowed the scope)." }) }));
  if (!ed?.ok) bail("edit D9 as ella", ed);
  const copy = rP(await GET(`op=reviewcopy&draft=${D9}&token=${IRIS}`));
  t("FIXTURE ARMS THE TRAP: ella edited LAST, iris wrote the statement, and the statement text has NOT MOVED — "
  + "the two facts now disagree, which is the only state in which either arm below can be read",
    [copy?.updated_by, copy?.statement_by, copy?.authored?.statement === S_A,
     copy?.statement_acknowledgements?.statement_sha === sha(S_A)],
    ["ella", "iris", true, true]);
  const byB = await ack(`draft=${D9}&token=${ELLA}`);
  t("ACCEPTS-WHEN: B, WHO EDITED ANOTHER SECTION AFTER A WROTE THE STATEMENT, MAY ACKNOWLEDGE — editing the "
  + "scope is not writing the sentence, and her reading of it is a second person's",
    [byB?.ok, byB?.acknowledgement?.kind, byB?.acknowledgement?.by,
     byB?.acknowledgement?.statement_sha === sha(S_A)],
    [true, "participant", "ella", true]);
  const byA = await ack(`draft=${D9}&token=${IRIS}`);
  t("AND A, WHO WROTE THE STATEMENT, IS REFUSED BY NAME — named as the author in the refusal, though she is "
  + "not the draft's last editor",
    [byA?.ok, byA?.reason, byA?.author], [false, "STATEMENT_ACK_BY_ITS_AUTHOR", "iris"]);
  /* THE STAMP FOLLOWS THE TEXT, NOT THE EDITOR: B rewrites the SENTENCE and becomes its author. */
  const ed2 = rP(await POST(`op=casedraft&token=${ELLA}`, { draft: D9, ...mk({ statement: S_B }) }));
  if (!ed2?.ok) bail("rewrite D9 statement as ella", ed2);
  const copy2 = rP(await GET(`op=reviewcopy&draft=${D9}&token=${IRIS}`));
  const byA2 = await ack(`draft=${D9}&token=${IRIS}`);
  const byB2 = await ack(`draft=${D9}&token=${ELLA}`);
  t("B THEN REWRITES THE STATEMENT ITSELF: the stamp MOVES to her, A may acknowledge the new sentence, and B "
  + "is now the one refused by name — the stamp tracks the TEXT, not the act of editing",
    [copy2?.statement_by, copy2?.authored?.statement === S_B,
     byA2?.ok, byA2?.acknowledgement?.by, byA2?.acknowledgement?.statement_sha === sha(S_B),
     byB2?.ok, byB2?.reason, byB2?.author],
    ["ella", true, true, "iris", true, false, "STATEMENT_ACK_BY_ITS_AUTHOR", "ella"]);
  /* OVER-STRICTNESS ARM: an edit that re-saves the SAME sentence in a spelling the plane normalises the same
     way must NOT move the author. `#fmSafe` is what the case document prints and what `#statementSha` hashes,
     so two statements the record cannot tell apart must not have different authors either. */
  const ed3 = rP(await POST(`op=casedraft&token=${IRIS}`, { draft: D9, ...mk({ statement: S_B }) }));
  if (!ed3?.ok) bail("re-save D9 statement as iris", ed3);
  const copy3 = rP(await GET(`op=reviewcopy&draft=${D9}&token=${IRIS}`));
  t("OVER-STRICTNESS: iris SAVES ella's sentence again, unchanged — the author does not move to the saver, and "
  + "ella stays refused while iris stays admitted",
    [copy3?.statement_by, copy3?.updated_by, (await ack(`draft=${D9}&token=${ELLA}`))?.reason,
     (await ack(`draft=${D9}&token=${IRIS}`))?.ok],
    ["ella", "iris", "STATEMENT_ACK_BY_ITS_AUTHOR", true]);
  /* A RECIPIENT IS UNAFFECTED: the exclusion is of the AUTHOR, and a grant's holder is never one. */
  const G9 = rP(await POST(`op=reviewgrant&token=${IRIS}`, { draft: D9, recipient: "Rae Kim, records desk" }));
  if (!G9?.ok || !G9.secret) bail("reviewgrant D9", G9);
  t("a REVIEW-COPY RECIPIENT still acknowledges through the grant: the author exclusion is about the author, "
  + "and this landing narrowed nothing else",
    [(await ack(`draft=${D9}&secret=${encodeURIComponent(G9.secret)}`))?.acknowledgement?.kind], ["recipient"]);
  /* AN EMPTIED STATEMENT HAS NO AUTHOR — the column is not a record of who once wrote one. */
  {
    const De = rP(await POST(`op=casedraft&token=${IRIS}`, { draft: D9, ...mk({ statement: "" }) }));
    if (!De?.ok) bail("empty D9 statement", De);
    const ce = rP(await GET(`op=reviewcopy&draft=${D9}&token=${IRIS}`));
    t("the statement is EMPTIED: no sentence stands, so no author is recorded, and the act refuses for want of "
    + "a statement rather than naming a stale author",
      [ce?.statement_by, /^UNDETERMINED/.test(ce?.statement_by_stated || ""),
       (await ack(`draft=${D9}&token=${ELLA}`))?.reason],
      [null, true, "STATEMENT_ACK_NO_STATEMENT"]);
  }
  /* WHAT THIS BLOCK CANNOT DRIVE, STATED RATHER THAN SCORED ZERO. `STATEMENT_ACK_AUTHOR_UNDETERMINED` answers a
     draft that holds a statement and NO `statement_by`. No act can produce that row on a store this code wrote:
     every write through `op=casedraft` stamps one whenever a statement stands, and the state exists only in
     stores written BEFORE this landing, where the migration adds the column NULL. So the arm below is a
     TOTALITY assertion in the direction this suite can reach — every draft it has authored with a statement
     carries an author — and it says nothing about the refusal's own text, which is exercised by no arm here.
     The corpus is printed so a reader can see it is not empty. */
  {
    const list = rP(await GET(`op=casedrafts&token=${IRIS}&project=${encodeURIComponent(PROJ)}`));
    const rows = (list?.drafts || []);
    const withStatement = [];
    for (const r of rows) {
      const c = rP(await GET(`op=reviewcopy&draft=${r.draft_id}&token=${IRIS}`));
      if (c?.authored?.statement) withStatement.push([r.draft_id, c.statement_by]);
    }
    console.log(`         corpus: ${rows.length} draft(s) of ${PROJ}, ${withStatement.length} holding a statement`);
    t("TOTALITY, over a non-empty corpus: EVERY draft of this project that holds a statement carries an author "
    + "for it — the UNDETERMINED answer is unreachable through any act on a store this code wrote",
      [rows.length > 0, withStatement.length > 0, withStatement.filter(([, by]) => !by)],
      [true, true, []]);
  }
}
});

/* ========================================================================== 10 */
console.log("\n--- 10. REC-194 / §3 rule 13: AN ACKNOWLEDGEMENT BINDS TO ONE CASE IDENTITY ---");
await block("10", async () => {
needs("0 (setup)", { IRIS, ELLA, PROJ });
/* THE ROW'S FIRST ACCEPTS-WHEN CLAUSE, AND THE DEFECT IT NAMES. Two cases of ONE project whose exclusion
   statements are BYTE-IDENTICAL, one acknowledged. Before this landing the listing read matched
   `(case_id IS ? OR (case_id IS NULL AND edition=1))`, so ella's reading of TWIN-A's draft was listed in
   TWIN-B's completeness block — in the bytes B's owner signs, naming a second reader who never read B.
   BOB #32 (2026-09-23): *an acknowledgement binds to ONE case identity. It never matches another case whose
   statement is byte-identical, because reading A's statement is not reading B's.*
   WHAT A LIAR WOULD DO AND WHICH ARM CATCHES IT: match by the statement's hash alone (the negative control
   the row names) and arm 3 fails by name, because B then lists both ella's draft reading and her bound
   reading of A. Keep the case id but restore the `case_id IS NULL` half of the OR and arm 3 still fails on
   the draft reading alone — the two halves of the control are separable, and arm 2 pins which is which.
   The statements are asserted byte-identical HERE, from the strings this suite passed in, so the arms cannot
   pass over two sentences that merely look alike. */
{
  const TWINA = "INQ-2026-1500-twina", TWINB = "INQ-2026-1500-twinb";
  for (const id of [TWINA, TWINB]) {
    const r = await promote(id, withAdoptableReading(inquiryMd(id, `Was ${id} noticed?`, INFO)), "inquiry", "open");
    if (r.ok === false) bail(`promote ${id}`, r);
    const c = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(id)}`
      + `&conclusion=${encodeURIComponent(`The answer to ${id} is on the memo.`)}`
      + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${id}.`)}` + adoptedVersionParam()));
    if (!c.ok) bail(`conclude ${id}`, c);
  }
  const TW = args(PROJ, "twin").statement;
  const DA = rP(await POST(`op=casedraft&token=${IRIS}`, withRoles({ ...args(PROJ, "twin"), targets: [TWINA] })));
  const DB = rP(await POST(`op=casedraft&token=${IRIS}`, withRoles({ ...args(PROJ, "twin"), targets: [TWINB] })));
  if (!DA?.ok || !DB?.ok) bail("casedraft twins", { DA, DB });
  const copyA = rP(await GET(`op=reviewcopy&draft=${DA.draftId}&token=${IRIS}`));
  const copyB = rP(await GET(`op=reviewcopy&draft=${DB.draftId}&token=${IRIS}`));
  t("FIXTURE ARMS THE TRAP: two DIFFERENT drafts of ONE project whose statements are BYTE-IDENTICAL (asserted "
  + "from the strings this suite passed in) and whose hashes therefore agree — the only state in which a "
  + "match by statement bytes can be told from a match by case identity",
    [DA.draftId !== DB.draftId, copyA?.authored?.statement === TW, copyB?.authored?.statement === TW,
     copyA?.statement_acknowledgements?.statement_sha === sha(TW),
     copyB?.statement_acknowledgements?.statement_sha === sha(TW)],
    [true, true, true, true, true]);
  const AA = await ack(`draft=${DA.draftId}&token=${ELLA}`);
  if (!AA?.ok) bail("ack twin A draft", AA);
  t("ella acknowledges TWIN-A's DRAFT, and the review copies part company: A's lists her, B's — the same sentence, "
  + "another production — lists NOBODY",
    [(rP(await GET(`op=reviewcopy&draft=${DA.draftId}&token=${IRIS}`))?.statement_acknowledgements
       ?.acknowledgements || []).map((a) => a.by),
     (rP(await GET(`op=reviewcopy&draft=${DB.draftId}&token=${IRIS}`))?.statement_acknowledgements
       ?.acknowledgements || []).map((a) => a.by)],
    [["ella"], []]);
  const PA = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(PROJ, "twin"), targets: [TWINA] })));
  if (PA?.ok === false || !PA?.caseDocument?.doc_sha) bail("publish twin A", PA);
  const TA = PA.caseDocument.case_id;
  const AB = await ack(`case=${TA}&edition=1&token=${ELLA}`);
  if (!AB?.ok) bail("ack twin A case door", AB);
  t("TWIN-A is published and ella acknowledges its prepared document: that reading is BOUND to A's case id and "
  + "edition, and A's document lists her",
    [AB?.bound_to_a_case, AB?.acknowledgement?.case_id, (AB?.case_documents || []).map((d) => d.case_id),
     fmOf((await docOf(TA, 1, IRIS))?.text).completeness?.acknowledged],
    [true, TA, [TA], 1]);
  const PB = rP(await POST(`op=publish&token=${IRIS}`, withRoles({ ...args(PROJ, "twin"), targets: [TWINB] })));
  if (PB?.ok === false || !PB?.caseDocument?.doc_sha) bail("publish twin B", PB);
  const TB = PB.caseDocument.case_id;
  const fmB = fmOf((await docOf(TB, 1, IRIS))?.text);
  t("ACCEPTS-WHEN (first clause): TWIN-B is published with the BYTE-IDENTICAL statement and its completeness block "
  + "lists NOBODY — neither ella's reading of A's draft nor her reading BOUND to A — though the statement hash "
  + "B prints is the very hash both were recorded under",
    [TB !== TA, fmB.completeness?.statement_sha === sha(TW), fmB.completeness?.statement_sha
       === fmOf((await docOf(TA, 1, IRIS))?.text).completeness?.statement_sha,
     fmB.completeness?.acknowledged, fmB.completeness_acknowledgements,
     (PB?.completeness?.acknowledgements || []).map((a) => a.by)],
    [true, true, true, 0, [], []]);
  t("and B does not say NOBODY READ IT either: the one reading this record cannot bind to any case (ella's, of A's "
  + "draft) is COUNTED as undetermined and NOT NAMED, while the reading bound to A is not mentioned at all",
    [PB?.completeness?.acknowledgements_unbindable_to_this_case,
     /Nobody acknowledged it FOR THIS CASE\./.test((await docOf(TB, 1, IRIS))?.text || ""),
     /whether any of them is a reading of THIS case is UNDETERMINED/.test((await docOf(TB, 1, IRIS))?.text || ""),
     (await docOf(TB, 1, IRIS))?.text.includes("- ella, a participant of " + PROJ)],
    [1, true, true, false]);
  {
    const r = await ratify("iris", IRIS, TB, 1, PB.caseDocument.doc_sha);
    if (r?.ok === false) bail("caseratify twin B", r);
    const pcB = rP(await GET(`op=publishedcase&id=${TB}`));
    t("IN B's SIGNED BYTES AND THROUGH THE PUBLIC READ: its committed list is EMPTY — a statement (nobody read "
    + "THIS case's sentence), never null, and never the other case's readers",
      [fmOf((await docOf(TB, 1, IRIS))?.text).completeness_acknowledgements,
       pcB?.completeness?.acknowledgements ?? pcB?.case?.completeness?.acknowledgements ?? "absent"],
      [[], []]);
  }
  /* A IS LEFT UNSIGNED FOR THIS ARM ON PURPOSE — the row's second clause is about two cases' UNSIGNED edition-1
     documents, and a signed one refuses the act for a different reason (STATEMENT_ACK_ALREADY_SIGNED), which
     would pass this arm without ever testing the narrowing. A is ratified after it, for the public read below. */
  t("ACCEPTS-WHEN (second clause), at the two cases' own unsigned documents: A's document is unsigned and carries "
  + "the identical sentence, and the draft door of B — a draft naming no case — re-authors NOTHING, not A's and "
  + "not its own project's any other",
    await (async () => {
      const docA = await docOf(TA, 1, IRIS);
      const act = await ack(`draft=${DB.draftId}&token=${ELLA}`);
      return [docA?.ratified === true, docA?.doc_sha != null, act?.ok, act?.bound_to_a_case,
              (act?.case_documents || []).length, (await docOf(TA, 1, IRIS))?.doc_sha === docA?.doc_sha];
    })(),
    [false, true, true, false, 0, true]);
  {
    const shaA = (await docOf(TA, 1, IRIS))?.doc_sha;
    const r = await ratify("iris", IRIS, TA, 1, shaA);
    if (r?.ok === false) bail("caseratify twin A", r);
    const pcA = rP(await GET(`op=publishedcase&id=${TA}`));
    const pcB = rP(await GET(`op=publishedcase&id=${TB}`));
    t("THROUGH THE PUBLIC READ, BOTH CASES SIGNED: the same sentence, two cases, two answers — A names ella, B "
    + "names nobody, and neither borrows the other's",
      [(pcA?.completeness?.acknowledgements ?? pcA?.case?.completeness?.acknowledgements ?? "absent")
         .map?.((a) => a.by) ?? "absent",
       pcB?.completeness?.acknowledgements ?? pcB?.case?.completeness?.acknowledgements ?? "absent"],
      [["ella"], []]);
  }
}
});

/* ========================================================================== 11 */
console.log("\n--- 11. REC-194: a BOUND acknowledgement at an existing case's next edition ---");
await block("11", async () => {
needs("0 (setup)", { IRIS, ELLA, PROJ });
needs("5", { CB });
/* WHAT THE NARROWING LEAVES REACHABLE, DRIVEN RATHER THAN ASSUMED. After it, only an acknowledgement recorded
   AT a case identity reaches a case document — through the case door, or through a draft that NAMES AN EXISTING
   CASE, which stands at that case's next edition (`#draftIdentity`). Two properties this suite would otherwise
   lose with block 3's and block 6's corrections live only here, and both are about a DRAFT-given reading that
   IS bound:
     (a) a review-copy RECIPIENT's acknowledgement in the SIGNED bytes. A recipient holds no session, so the
         case door is not theirs; a draft naming an existing case is the only door through which their reading
         can reach a signature at all. (For a NEW case it cannot — REC-194's reported design gap.)
     (b) the PUBLISHER's own reading left out AND COUNTED (`acknowledgements_by_author_not_listed`): the acker
         must become the statement's author at the publish act, which needs the reading bound before it. */
{
  const ED2 = "INQ-2026-1500-ed2";
  const r = await promote(ED2, withAdoptableReading(inquiryMd(ED2, `Was ${ED2} recorded?`, INFO)), "inquiry", "open");
  if (r.ok === false) bail(`promote ${ED2}`, r);
  const c = rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(ED2)}`
    + `&conclusion=${encodeURIComponent(`The answer to ${ED2} is on the memo.`)}`
    + `&falsifier=${encodeURIComponent(`An adopted resolution would overturn ${ED2}.`)}` + adoptedVersionParam()));
  if (!c.ok) bail(`conclude ${ED2}`, c);
  /* ELLA authors the draft, so the statement is HERS and iris is free to acknowledge it (§3 rule 13's
     `statement_by`); the draft NAMES CB, the case block 5 published and ratified at edition 1. */
  const D2 = rP(await POST(`op=casedraft&token=${ELLA}`,
    withRoles({ ...args(PROJ, "ed2"), caseId: CB, targets: [ED2] })));
  if (!D2?.ok) bail("casedraft ed2", D2);
  const copy2 = rP(await GET(`op=reviewcopy&draft=${D2.draftId}&token=${IRIS}`));
  t("FIXTURE: the draft NAMES an existing case, so its identity is that case's NEXT edition — not a new case, "
  + "which is what makes every reading of it BINDABLE",
    [copy2?.case?.case_id ?? copy2?.caseId ?? null, copy2?.case?.edition ?? copy2?.edition ?? null,
     copy2?.statement_by],
    [CB, 2, "ella"]);
  const G2 = rP(await POST(`op=reviewgrant&token=${IRIS}`,
    { draft: D2.draftId, recipient: "Ivo Marsh, Budget Office" }));
  if (!G2?.ok || !G2.secret) bail("reviewgrant ed2", G2);
  const ar = await ack(`draft=${D2.draftId}&secret=${encodeURIComponent(G2.secret)}`);
  const ai = await ack(`draft=${D2.draftId}&token=${IRIS}`);
  t("a RECIPIENT and the OWNER each acknowledge that draft, and BOTH readings are bound to the case and edition "
  + "the draft stands at — never to no case",
    [ar?.ok, ar?.bound_to_a_case, ar?.acknowledgement?.case_id, ar?.acknowledgement?.edition,
     ai?.ok, ai?.bound_to_a_case, ai?.acknowledgement?.case_id, ai?.acknowledgement?.edition],
    [true, true, CB, 2, true, true, CB, 2]);
  const p2 = rP(await POST(`op=publish&token=${IRIS}`,
    withRoles({ ...args(PROJ, "ed2"), caseId: CB, targets: [ED2] })));
  if (p2?.ok === false || !p2?.caseDocument?.doc_sha) bail("publish ed2", p2);
  t("IRIS publishes edition 2, becoming the statement's author at that act: the RECIPIENT's bound reading is "
  + "listed, iris's own is left out AND COUNTED, and the edition is 2 of the same case",
    [p2?.caseDocument?.case_id, p2?.caseDocument?.edition,
     (p2?.completeness?.acknowledgements || []).map((a) => [a.kind, a.by, a.recipient]),
     p2?.completeness?.author, p2?.completeness?.acknowledgements_by_author_not_listed,
     p2?.completeness?.acknowledgements_unbindable_to_this_case ?? null],
    [CB, 2, [["recipient", G2.grantId, "Ivo Marsh, Budget Office"]], "iris", 1, null]);
  {
    const rr = await ratify("iris", IRIS, CB, 2, p2.caseDocument.doc_sha);
    if (rr?.ok === false) bail("caseratify ed2", rr);
    const doc = await docOf(CB, 2, IRIS);
    const fm = fmOf(doc?.text);
    t("AND IN THE SIGNED BYTES OF EDITION 2: a count of 1, the recipient named with the addressee its issuer gave, "
    + "iris absent, and edition 1's own list untouched by any of it",
      [doc?.ratified, fm.completeness?.acknowledged,
       (fm.completeness_acknowledgements || []).map((a) => [a.kind, a.by]),
       (doc?.text || "").includes(`review grant ${G2.grantId}, addressed by its issuer as 'Ivo Marsh, Budget Office'`),
       (doc?.text || "").includes("- iris, a participant of " + PROJ),
       (fmOf((await docOf(CB, 1, IRIS))?.text).completeness_acknowledgements || []).map((a) => a.by)],
      [true, 1, [["recipient", G2.grantId]], true, false, ["ella"]]);
  }
}
});

/* D-564: every section's own tally, -1 for one that DIED; a section that never recorded at all is named missing
   rather than read as clean — the foot counts the sections it expected against the ones that reported. */
const EXPECTED = ["0 (setup)", "0b (corpus)", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
console.log("\n--- per-section tallies (D-564: -1 = the section DIED, its tally is missing) ---");
for (const n of EXPECTED) {
  const r = TALLY.find((x) => x.name === n);
  if (!r) { fail++; console.log(`  FAIL  section ${n}: NEVER REPORTED — tally -1`); continue; }
  console.log(`  section ${n}: ${r.pass} pass, ${r.fail} fail${r.died ? "  [DIED]" : ""}`);
}
const DIED = TALLY.filter((x) => x.died).map((x) => x.name);
console.log(`\nd150-statement-acknowledgement: ${pass} pass, ${fail} fail  [FOOT REACHED${DIED.length ? `; DIED: ${DIED.join(", ")}` : ""}]`);
await mf.dispose();
process.exit(fail ? 1 : 0);
