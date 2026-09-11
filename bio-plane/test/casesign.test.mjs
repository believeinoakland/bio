/* NEGATIVE CONTROL: FIVE ARMS PLUS A BASELINE, each armed ALONE with every other
   defence held OPEN, RUN, and recorded at the foot of this file with the count it
   MEASURED rather than the count it was expected to. The driver is
   `test/casesign.control.mjs` — COMMITTED, so every arm re-runs in one step with
   `node test/casesign.control.mjs [arm]` — and every restore is verified by
   CONTENT and by sha256 against a UNIQUELY-NAMED per-arm pristine copy taken
   INSIDE THIS WORKTREE (never the shared scratchpad: PL-10's harness was
   overwritten mid-turn by a concurrent worker, and UI-38 met an NC harness that
   reported a byte-identical restore over a file it had not restored).
   ALL SIX RUN 2026-09-10 AGAINST THIS FILE, with the count each one MEASURED:

   (0) BASELINE, nothing armed -> **54 pass, 0 fail**. The row that distinguishes
   five-arms-broken from five-arms-working, and the one nobody runs. It is
   NUMBERED rather than named because the register's `OPENS_ITEM` grammar accepts
   at most two letters inside the parentheses: CASE-1 measured a declaration
   scored UNCLASSIFIED for opening its list with the word `(baseline)`, and that
   receipt is used here rather than earned again.

   (a) THE ARM THIS ITEM EXISTS FOR — in `src/index.mjs`'s `op=caseratify`, drop
   `sigArmored: body.sig,` from the committer call, leaving the control plane's
   own signature verification standing, so a case assertion arrives at the COMMIT
   from an unsigned request -> **15 pass, 1 fail**, and the failure is the
   committer refusing `CASE_UNSIGNED` BY NAME with the case and edition in the
   answer. Nothing case-side is written, so the fixture cannot go on and the tally
   stops at 15 — which is the shape of a fence that holds rather than one that
   reports. This is the only route to that refusal: no caller can reach the
   committer without a verified signature, which is why the suite pins it
   structurally and this arm drives it.

   (b) STRIP THE KEYS WITHOUT THE CEREMONY'S FENCE — in `checks/bio-checks.mjs`,
   neuter the C-2.8 arm that refuses the eight case keys in a finding's bytes,
   which is the deletion half of this item standing alone -> **53 pass, 1 fail**,
   naming the gate arm. A member can then assert its own case identity, roster,
   scope, bar and acknowledgement in bytes nobody reviewed at case altitude, and
   nothing refuses it. **ON ITS FIRST RUN THIS ARM REPORTED 48/2, AND THE SECOND
   FAILURE WAS A CASCADE WORTH READING RATHER THAN NOISE:** the lie PROMOTED and
   RATIFIED, so the member's published sha moved, and the container a stranger
   verifies in block 5 was assembled over different bytes. The deletion done first
   does not merely go unrefused — it reaches the signed artifact that travels.

   (2b) THE SAME QUESTION AT THE OTHER DEPTH, and the queue row's second arm in
   its most literal reading: remove the CEREMONY itself — `op=publish` stops
   authoring a case document — while the eight keys stay gone from member bytes,
   which is the tree as it would be if the deletion had been done first ->
   **0 pass, 1 fail**, and the failure is the FIXTURE saying there is no ceremony
   to perform. **THE MEASUREMENT IS AN ABSENCE AND THAT IS THE FINDING:** with the
   keys gone and no document to sign, NO CASE FACT IS COMMITTED BY ANY ROUTE —
   `CASE_UNSIGNED` cannot fire because nothing reaches the committer, and arm (a)'s
   question stops being askable. The ceremony is not a fence standing in front of
   the deletion; it is the only thing that makes the deletion representable. **IT
   TOOK TWO CORRECTIONS TO PRODUCE A TALLY AT ALL** — it first died on
   `pub.caseDocument.doc_sha` with no count, and a guard on the KEY alone still let
   it through because `op=publish` reads its row back rather than assuming the
   write landed, so the answer carried a `caseDocument` with a null sha. A control
   that produces no count cannot be compared with the baseline it exists to be
   compared with (CASE-4's arm (d), same shape).

   (c) OVER-STRICTNESS — make the case document's bar arm demand a DECLARED bar
   rather than a STATED one -> **15 pass, 1 fail**: every case published by a
   project that never set a standard is refused at the ceremony. An absent bar is
   not a bar of zero, and a gate that forgot it would pressure a group into
   declaring a standard so they can publish. **THIS ARM'S FIRST DRAFT CAME BACK
   GREEN AT 50/0 AND THE ARM WAS WRONG, NOT THE SUBJECT** — it added a guard to
   `isCaseMemberBytes` that made the predicate FALSE for every member, so the
   published ceremony stopped running altogether: it loosened the gate while
   trying to tighten it. Recorded at the arm in the driver.

   (d) THE PIN IS NOT WHAT RESOLVES A MEMBER — in `store.mjs`'s `publish()`, widen
   the roster match to `bundle_id` alone -> **53 pass, 1 fail**, naming the
   diverged-member arm. **THIS ARM ALSO CAME BACK GREEN FIRST TIME, AND TWICE:**
   once because deleting the predicate left its bound parameter behind and the
   statement failed to prepare (a SQL error is not a measurement), and once
   because THIS SUITE HAD NO DIVERGED MEMBER — every finding sat at exactly the
   version its case had pinned, so id-only matching answered identically. The
   suite was given a member that has genuinely moved on, which is the arm that now
   fails. A fixture where the two agree cannot see this defect, and that is an
   instrument limit rather than a defence holding.

   See `test/casesign.control.mjs` for each arm's exact edit and its reasoning. */

/* CASE-5b / DEC-72 — THE CASE-LEVEL SIGNING CEREMONY, AND THEN THE DELETION IT IS
 * THE PRECONDITION FOR.
 *
 * THE WALL THIS ITEM WAS SCOPED OFF, IN CASE-5'S OWN WORDS: *"Every case fact
 * this plane commits is committed from the SIGNED BYTES and from nothing else
 * (`#publishEdges`' doctrine, restated at seven sites in `publish()`), and there
 * is no signature over a case for those facts to move to."* So finding bytes went
 * on naming a case — `case_id`, `case_edition`, `case_project`, `case_scope`,
 * `case_findings`, `case_roles`, `bias_acknowledgement`, `required_strength` —
 * and `caseflip.test.mjs` ASSERTED that they did, so that "still there" stayed
 * distinguishable from "nobody checked".
 *
 * THE CONSTRAINT THAT SHAPED THE ANSWER is the container manifest's own sentence:
 * *a case-level signature would be a signature over something nobody reviewed.*
 * What is signed here is therefore NOT a synthesised summary of the roster. It is
 * the publisher's own authored assertions — the scope, the completeness
 * statement, each exclusion with its reason, the subject position and its
 * justification, the bias acknowledgement, the load-bearing partition, the bar —
 * every one of them an argument a member typed at `op=publish`, assembled into a
 * document with a frontmatter half the gate reads and a prose half a person
 * reads. Block 2 asserts that clause by RECONSTRUCTING every authored sentence
 * from the arguments the act was given, so "nothing was synthesised" is measured
 * rather than claimed.
 *
 * EVERY ARM IS DRIVEN THROUGH AN OP. `op=invitelook` shipped with a ReferenceError
 * while 1,276 assertions passed, and the caller this item is FOR — a stranger
 * holding a published case — holds no credential at all.
 *
 * AND THE EXPECTATIONS ARE NOT DERIVED FROM THE THING UNDER TEST, which is the
 * class that has bitten six items on this arc:
 *   - every expected authored sentence is the STRING THIS SUITE PASSED IN, never
 *     one read back out of the document and compared to itself;
 *   - the signed hash is the sha this suite fed to `ssh-keygen -Y sign` BEFORE
 *     ratification, captured by the signing helper and never read back out of
 *     `case_documents`;
 *   - block 5's signatures are verified by `ssh-keygen -Y verify`, an external
 *     binary sharing no code path with anything in `src/`, over bytes this plane
 *     cannot reach at the moment of the check;
 *   - this suite does NOT use `test/caseceremony.mjs`, the shared fixture the
 *     other nine suites drive the ceremony with. The CEREMONY is what this suite
 *     tests, so a helper performing it would have the suite asserting against its
 *     own scaffolding — `caseproduction.test.mjs`'s reason one item earlier.
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
import { checkCaseDocument, CASE_DOCUMENT_FAMILY, CASE_DOCUMENT_FORMAT,
         parseFrontmatter } from "../checks/bio-checks.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- casesign ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("casesign: SKIPPED — ssh-keygen not on PATH; this item's whole subject is a REAL signature "
    + "over a case document, and a ceremony proved with our own verifier proves our verifier");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-c5b", MEMBER_TOKEN: "mem-c5b", PROBE_TOKEN: "prb-c5b", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
/* A FIXTURE THAT FAILS QUIETLY PRODUCES A SUITE WHOSE ASSERTIONS ALL MEASURE THE
   WRONG THING, and a bare `throw` names nothing (CASE-4's arm (d) measured
   exactly that: no tally at all). `bail` prints, tallies the failure and exits
   with the suite's own foot reached. */
const bail = (what, r) => {
  console.log(`  FAIL  (fixture) ${what}: ${JSON.stringify(r).slice(0, 500)}`);
  fail++;
  console.log(`\ncasesign: ${pass} pass, ${fail} fail  [FIXTURE ABORTED]`);
  mf.dispose().then(() => process.exit(1));
  throw new Error("fixture");
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
/* THE ANONYMOUS CALLER — no token, no cookie, no header. The ceremony exists so a
   reader who holds nothing can check a case, so that reader is who asks. */
const anonRaw = async (q) => mf.dispatchFetch(`http://x/api/?${q}`);
const anon = async (q) => rP(await (await anonRaw(q)).json());

/* ---- keys and roster ---- */
const dir = mkdtempSync(join(tmpdir(), "casesign-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
/* THE TWO STATEMENTS, WRITTEN OUT IN ASCII rather than imported from
   `src/sshsig.mjs`. An expectation taken from the thing under test agrees with it
   for free; if either statement's shape changes, this suite must go red. */
const signBytes = (who, text) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, text);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const signRatify = (who, bundleId, bundleSha) => signBytes(who, `bio-ratify ${bundleId} ${bundleSha}\n`);
const signCase = (who, caseId, edition, docSha) =>
  signBytes(who, `bio-ratify-case ${caseId} ${edition} ${docSha}\n`);

const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-c5b",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
/* TWO administrators before any ordinary member (ADMINS_FIRST), which is the
   roster rule and not a fixture preference — `op=memberadd` refuses to mint an
   ordinary member's invitation while the instance has fewer than two admins. */
await enrol("nadia", "nadia-passphrase-5b", "admin", ["contribute", "publish", "create_projects"]);
const OMAR = await enrol("omar", "omar-passphrase-5b", "admin", ["contribute", "publish"]);
const IRIS = await enrol("iris", "iris-passphrase-5b", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-c5b", { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));
/* A SECOND REGISTERED SIGNER, for one arm only: the second-attestation refusal
   cannot be reached with one key, because re-signing the same statement with the
   same ed25519 key is byte-identical and is therefore a retry by construction. */
rP(await POST("op=signeradd&token=adm-c5b", { keyB64: mkKey("omar"), memberId: "omar", comment: "omar laptop" }));

const listRow = async (id) => ((await GET(`op=list&token=${IRIS}&limit=1000`)).result?.bundles
  || (await GET(`op=list&token=${IRIS}&limit=1000`)).result || []).find((b) => b.bundle_id === id);
const shaOf = async (id) => (await listRow(id))?.bundle_sha ?? null;
const imageOf = async (id) => {
  const im = rP(await GET(`op=image&token=${IRIS}&id=${encodeURIComponent(id)}`));
  return String(im?.files?.["bundle.md"] ?? im?.["bundle.md"] ?? "");
};

const PUBLISHING_PROJECT = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-c5b", owner: "iris",
  id: "PROJ-2026-7700-auditor", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });

/* ---- the corpus: one capture, one connection, two concluded findings ---- */
let snapSeq = 0;
const promote = async (id, text, objectType, state, base) => rP(await POST("op=promote&token=adm-c5b", {
  bundleId: id, base: base ?? null,
  snapKey: `20260910T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: "2026-07-01T00:00:00Z", last_updated: "2026-07-02T00:00:00Z" },
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: [],
}));
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (r.ok === false) bail(`promote ${a[0]}`, r);
  return r;
};

const INFO = "INFO-2026-7700-memo";
const LEFT = "INFO-2026-7700-left-out";
const LEAD = "INQ-2026-7700-lead";
const SUPP = "INQ-2026-7700-supporting";

/* THE DOCUMENT SHAPES ARE `caselifecycle.test.mjs`'s, kept deliberately close to a
   fixture the estate already exercises: what this suite is about is the CEREMONY,
   and a hand-rolled bundle that the catalog happens to accept for the wrong
   reason would make every arm above measure a document nobody would publish. */
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

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
      `    grade: ${l.grade}`, `    grade_axis: ${l.axis}`, `    grade_source: ${l.source}`])]
  : [];
const inquiryMd = (id, { question = `What does ${id} rest on?`, refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

/* THE CONNECTION AXIS, ON TESTIMONY — the one leg shape this suite can build
   honestly. The CAPTURE axis is EARNED from the capture record (C-2.8 refuses a
   capture grade with no registered bytes, and refuses a capture grade sourced
   from testimony, both correctly), and registering captures to exercise a signing
   ceremony would be a fixture doing someone else's work. A member's account of a
   CONNECTION is exactly what testimony is for, so both members publish with a
   real frozen pair: connection graded D, capture honestly unrated. Grade D and no
   higher, because DEC-15 permits no authored grade above it but a hunch. */
const LEGS = [{ target: INFO, grade: "D", axis: "connection", source: "testimony" }];

await mustPromote(INFO, infoMd(INFO), "information", "collected");
await mustPromote(LEFT, infoMd(LEFT), "information", "collected");
await mustPromote(LEAD, inquiryMd(LEAD, { question: "Was the transfer authorised?",
  refs: [INFO], legs: LEGS }), "inquiry", "open");
await mustPromote(SUPP, inquiryMd(SUPP, { question: "Was notice given?",
  refs: [INFO], legs: LEGS }), "inquiry", "open");

const conclude = async (target, conclusion, falsifier) =>
  rP(await GET(`op=conclude&token=${IRIS}&target=${encodeURIComponent(target)}`
    + `&conclusion=${encodeURIComponent(conclusion)}&falsifier=${encodeURIComponent(falsifier)}`));
for (const [id, c, fz] of [[LEAD, "The transfer rests on a memo nobody adopted.",
                            "An adopted resolution naming the transfer would overturn this."],
                           [SUPP, "No notice was published before the transfer.",
                            "A published agenda item naming the transfer before its date."]]) {
  const r = await conclude(id, c, fz);
  if (!r.ok) bail(`conclude ${id}`, r);
}

/* ===== THE AUTHORED ARGUMENTS. Every one of these strings is typed HERE, passed
   to `op=publish`, and then demanded back out of the case document verbatim. That
   round trip is what block 2 measures: the document carries what a person wrote
   and nothing this plane composed. */
const SCOPE = "Whether the FY2024 transfer was authorised and whether notice was given, on the documents in hand.";
const STMT = "This case covers the FY2024 transfer only, on the documents in hand at edition 1.";
const JUST = "We put the claims to the City Administrator on 2026-06-20 and printed what came back.";
const BACK = "This group holds a declared position that transfers should be adopted in public session, "
           + "and edition 1 reads the FY2024 record through it.";
const EXCL_D = "the FY2023 comparison memo";
const EXCL_R = "a records request for it is still outstanding with the City Clerk";

const CEREMONY = {
  project: PUBLISHING_PROJECT, scope: SCOPE, statement: STMT,
  excluded: [{ target: LEFT, description: EXCL_D, reason: EXCL_R }],
  subjectPosition: "sought_and_answered", subjectJustification: JUST,
  biasAcknowledgement: BACK,
};

const publish = async (body) => rP(await POST(`op=publish&token=${IRIS}`,
  { ...CEREMONY, roles: allLoadBearing(body), ...body }));

console.log("\n--- casesign ---");

/* =========================================================================== 1
 * THE WINDOW: op=publish AUTHORS AND COMMITS NOTHING.
 * ========================================================================= */
console.log("\n--- 1. op=publish authors a case document and commits NOT ONE case fact ---");
const pub = await publish({ targets: [LEAD, SUPP],
  roles: { [LEAD]: "load_bearing", [SUPP]: "supporting" } });
if (!pub.ok) bail("publish the two-finding case", pub);
/* AND THE ANSWER MUST CARRY A CASE DOCUMENT, checked HERE rather than let to throw
   forty lines down. Control arm (2b) removes the ceremony entirely, and on its
   first run this suite died with NO TALLY AT ALL —
   which is CASE-4's arm (d) exactly: a bare throw names nothing, and a control
   that produces no count cannot be compared with the baseline it exists to be
   compared with. Named, the same arm reports a fixture failure and a tally.
   THE GUARD CHECKS THE SHA AND NOT MERELY THE KEY, which is the correction the
   arm's SECOND run forced: with the document write armed away, `op=publish` still
   answers a `caseDocument` object — it reads the row back rather than assuming the
   write landed — but with `doc_sha: null`. A guard on the key alone passed it
   straight through and the suite died four blocks later on `doc1.text`. The
   read-back is the right design and the guard has to match it. */
if (!pub.caseDocument || !/^[0-9a-f]{64}$/.test(String(pub.caseDocument.doc_sha)))
  bail("op=publish authored no case document — there is no ceremony to perform", pub);
const CASE = pub.caseId;
{
  t("op=publish answers the CASE DOCUMENT to review, with its hash and its byte length",
    [/^CASE-\d{4}-\d{4}$/.test(CASE), pub.caseDocument.case_id === CASE, pub.caseDocument.edition,
     /^[0-9a-f]{64}$/.test(pub.caseDocument.doc_sha), pub.caseDocument.bytes > 500],
    [true, true, 1, true, true]);
  t("and its `next:` names the ACT that closes the window, and names it FIRST — the case document is "
  + "ratified before any member, because it is what writes the roster and the pins",
    [/op=caseratify/.test(pub.next), pub.next.indexOf("op=caseratify") < pub.next.indexOf("op=ratify")],
    [true, true]);
  /* THE FENCE THE WHOLE ITEM RESTS ON, MEASURED RATHER THAN ARGUED. */
  const idx0 = await anon("op=publishedmanifest");
  t("NOTHING CASE-SIDE IS COMMITTED: no case edition, no roster row, and the public read answers "
  + "NOT_PUBLISHED — a case exists in bytes nobody has signed, and the record says nothing about it",
    [(idx0.cases || []).length, (idx0.caseMembers || []).length,
     (await anon(`op=publishedcase&id=${CASE}`))?.reason ?? null],
    [0, 0, "NOT_PUBLISHED"]);
  t("and the document is READABLE while unsigned, saying so IN ITS OWN FIELD rather than leaving a "
  + "reader to infer a ceremony-in-progress from a null",
    [(await anon(`op=casedocument&case=${CASE}&edition=1`)).ratified,
     (await anon(`op=casedocument&case=${CASE}&edition=1`)).sig_armored], [false, null]);
}

/* =========================================================================== 2
 * WHAT IS SIGNED IS A THING A MEMBER REVIEWED.
 * ========================================================================= */
console.log("\n--- 2. the document carries what a person AUTHORED, not a summary this plane composed ---");
const doc1 = await anon(`op=casedocument&case=${CASE}&edition=1`);
{
  t("the document declares its format, so a stranger holding these bytes knows what they are reading",
    parseFrontmatter(doc1.text).data.format, CASE_DOCUMENT_FORMAT);
  /* EVERY AUTHORED SENTENCE, ROUND-TRIPPED. The expectation is the string this
     suite passed IN, so a document that paraphrased, truncated or re-ordered any
     of them fails here. */
  t("EVERY AUTHORED SENTENCE IS IN IT VERBATIM — the scope, the completeness statement, the subject "
  + "justification, the bias acknowledgement, and the exclusion with its own reason",
    [SCOPE, STMT, JUST, BACK, EXCL_D, EXCL_R].map((s) => doc1.text.includes(s)),
    [true, true, true, true, true, true]);
  t("and a PERSON can read it: every authored sentence is in the BODY too, under canonical headings, "
  + "not only in the frontmatter a machine parses",
    ["## Scope", "## Findings In This Case", "## What This Excludes", "## Bias Acknowledgement",
     "## Standard Of Evidence"].map((h) => doc1.text.includes(h)), [true, true, true, true, true]);
  t("the partition is AUTHORED and named per member, with the PIN beside it — the design's member is "
  + "(finding id, version hash, role, ordinal) and this is where all four are asserted at once",
    (parseFrontmatter(doc1.text).data.case_roles || [])
      .map((r) => [r.target, r.role, /^[0-9a-f]{64}$/.test(String(r.version_sha))]),
    [[LEAD, "load_bearing", true], [SUPP, "supporting", true]]);
  /* THE PINS ARE THE MEMBERS' OWN SHAS — taken from op=list, which is a different
     read from the one that produced the document. */
  t("and the pins are the members' OWN current version hashes, taken from a read that shares no code "
  + "path with the one that wrote them",
    (parseFrontmatter(doc1.text).data.case_roles || []).map((r) => r.version_sha),
    [await shaOf(LEAD), await shaOf(SUPP)]);
  t("the roster's ORDER is the authored publish order, which is the order every rendering takes",
    parseFrontmatter(doc1.text).data.case_findings, [LEAD, SUPP]);
  t("and the document tells a reader what LOAD-BEARING means, in prose, rather than leaving a "
  + "vocabulary word to be decoded",
    [/A LOAD-BEARING finding is one this case rests on/.test(doc1.text),
     /A SUPPORTING finding travels with the case and is not presented as carrying it/.test(doc1.text)],
    [true, true]);
  /* THE ABSENT BAR, PRINTED AS A SENTENCE. This project's bar is undeclared, so
     this is the shape a reader actually meets — and "an absent bar is not a bar
     of zero" is the sentence a renderer is tempted to shorten into a dash. */
  t("an ABSENT bar is stated as absent, in a sentence, and says what its absence means — never a dash "
  + "and never a bar of zero",
    [/NO STANDARD OF EVIDENCE WAS DECLARED/.test(doc1.text),
     /An absent bar is not a bar of zero/.test(doc1.text),
     parseFrontmatter(doc1.text).data.required_strength.declared], [true, true, false]);
}

/* =========================================================================== 3
 * THE SIGNATURE COMMITS THE CASE.
 * ========================================================================= */
console.log("\n--- 3. a member signs it, and THAT is what commits the case's own assertions ---");
const SIGNED_DOC_SHA = pub.caseDocument.doc_sha;   /* captured BEFORE ratification */
{
  /* THE REFUSALS FIRST, so the success below cannot be read as a door that never
     shuts. Each is driven through the op with everything else held right. */
  const badSha = "0".repeat(64);
  t("a signature over a DIFFERENT sha is refused BY NAME before anything is committed",
    (await POST(`op=caseratify&token=${IRIS}`,
      { caseId: CASE, edition: 1, expectedSha: badSha, sig: signCase("iris", CASE, 1, badSha) })).reason,
    "CASE_RATIFY_STALE");
  t("and a signature that does not VERIFY is refused by name, with nothing committed — this is the "
  + "arm this item exists for, reached through the op a caller actually has",
    [(await POST(`op=caseratify&token=${IRIS}`,
       { caseId: CASE, edition: 1, expectedSha: SIGNED_DOC_SHA,
         sig: signCase("iris", CASE, 99, SIGNED_DOC_SHA) })).reason,
     ((await anon("op=publishedmanifest")).cases || []).length],
    ["SIG_BAD_SIGNATURE", 0]);
  /* AND THE STRUCTURAL FENCE BEHIND THEM, NAMED. `CASE_UNSIGNED` is the store's
     own refusal and no caller route reaches it — the control plane verifies a
     signature before the committer is called — so it is pinned against the source
     and NOT claimed as a reachable refusal. Control arm (a) drives it by removing
     the signature at the call site, which is the only way it can be reached. */
  t("the committer's own fence is NAMED IN THE SOURCE: a commit that arrives with no armored signature "
  + "is refused `CASE_UNSIGNED` rather than silently skipped (NOT driven here: the control plane "
  + "verifies first — control arm (a) reaches it)",
    /reason: "CASE_UNSIGNED"/.test(STORE_SRC), true);

  const rat = await POST(`op=caseratify&token=${IRIS}`,
    { caseId: CASE, edition: 1, expectedSha: SIGNED_DOC_SHA,
      sig: signCase("iris", CASE, 1, SIGNED_DOC_SHA) });
  if (!rat.ok) bail("caseratify", rat);
  t("THE CEREMONY LANDS: the case's own assertions are committed, and the answer states the window "
  + "that is still open rather than implying the case is complete",
    [rat.ok, rat.caseId, rat.edition, rat.project, rat.roster, rat.awaiting.sort(),
     rat.attestor.member],
    [true, CASE, 1, PUBLISHING_PROJECT, [LEAD, SUPP], [LEAD, SUPP].sort(), "iris"]);
  const idx = await anon("op=publishedmanifest");
  t("and the record now holds the case, its producing project, its roster, its roles and its PINS — "
  + "every one of them out of the bytes a member signed",
    [(idx.cases || []).map((c) => [c.case_id, c.edition, c.project_id]),
     (idx.caseMembers || []).map((m) => [m.bundle_id, m.role, m.version_sha === (doc1.text.match(
       new RegExp(`- target: ${m.bundle_id}\\n\\s+role: \\S+\\n\\s+version_sha: ([0-9a-f]{64})`)) || [])[1]])],
    [[[CASE, 1, PUBLISHING_PROJECT]],
     [[LEAD, "load_bearing", true], [SUPP, "supporting", true]]]);
  /* IDEMPOTENCE AND THE SECOND-ATTESTATION REFUSAL ARE TWO DIFFERENT ANSWERS AND
     BOTH ARE DRIVEN, because a committer that answered the same way to both would
     either refuse honest retries or silently accept a second attestor. The SAME
     signature is a RETRY and reports `existed`; a DIFFERENT one over the same
     edition is refused by name, since an edition answers forever and two
     attestations would leave a reader unable to say who stood behind what they
     read. Both re-runs are asserted to write nothing new. */
  const retry = await POST(`op=caseratify&token=${IRIS}`,
    { caseId: CASE, edition: 1, expectedSha: SIGNED_DOC_SHA,
      sig: signCase("iris", CASE, 1, SIGNED_DOC_SHA) });
  t("re-ratifying the SAME bytes with the SAME signature is a RETRY, not a revision: it reports `existed` and writes nothing",
    [retry.ok, retry.existed, ((await anon("op=publishedmanifest")).cases || []).length],
    [true, true, 1]);
  /* A SECOND ATTESTOR, WITH A REAL SECOND KEY. Re-signing with the SAME key is
     byte-identical (ed25519 signing here is deterministic), so it is a retry by
     construction and could never reach this refusal — the adversary has to be a
     different signer, which is also the shape the refusal is actually about. */
  const second = await POST(`op=caseratify&token=${OMAR}`,
    { caseId: CASE, edition: 1, expectedSha: SIGNED_DOC_SHA,
      sig: signCase("omar", CASE, 1, SIGNED_DOC_SHA) });
  t("but a DIFFERENT MEMBER'S signature over the same edition is REFUSED BY NAME — an edition answers forever, so two attestations of one would leave a reader unable to say who stood behind what they read",
    [second.ok, second.reason, second.caseId, second.edition],
    [false, "CASE_EDITION_ALREADY_RATIFIED", CASE, 1]);
  t("and the record still names the FIRST attestor, unchanged — the refusal protected an answer rather than merely declining a request",
    (await anon(`op=casedocument&case=${CASE}&edition=1`)).attestor_member, "iris");
}

/* =========================================================================== 4
 * AND THE FINDING'S BYTES STOP NAMING A CASE.
 * ========================================================================= */
console.log("\n--- 4. the deletion: a finding's bytes name no case, and the GATE refuses one that does ---");
const ratifyMember = async (id) => {
  const s = await shaOf(id);
  return rP(await POST(`op=ratify&token=${IRIS}`,
    { bundleId: id, expectedSha: s, sig: signRatify("iris", id, s) }));
};
{
  const r1 = await ratifyMember(LEAD);
  const r2 = await ratifyMember(SUPP);
  if (!r1.ok || !r2.ok) bail("ratify the members", { r1, r2 });
  t("both members ratify on their OWN bytes, and each is resolved into the case BY ITS PIN",
    [r1.ok, r1.caseId, r1.case.edition, r2.ok, r2.caseId], [true, CASE, 1, true, CASE]);
  /* READ OUT OF THE PUBLISHED BYTES THEMSELVES, by their own sha, through the
     anonymous surface — the claim is about what a finding's DOCUMENT carries. */
  const bytes = new TextDecoder().decode(new Uint8Array(
    await (await anonRaw(`op=publishedbytes&sha256=${r1.bundleSha}`)).arrayBuffer()));
  t("NOT ONE OF THE EIGHT KEYS SURVIVES in the published document — this is the assertion CASE-5 "
  + "could not make, and the one CASE-5b exists for",
    ["case_id:", "case_edition:", "case_project:", "case_findings:", "case_roles:", "case_scope:",
     "bias_acknowledgement:", "required_strength:"].filter((k) => bytes.includes(k)), []);
  t("and what the member's bytes DO still carry is everything that is genuinely the FINDING's — its "
  + "own edition on its own chain, its completeness block, its exclusions and its frozen pair",
    [/^edition: 1$/m.test(bytes), /^completeness:$/m.test(bytes),
     /^completeness_excluded:$/m.test(bytes), /^published_strength:$/m.test(bytes)],
    [true, true, true, true]);
  /* THE DELETION IS A PROPERTY OF THE FORMAT, not of op=publish remembering. */
  const lie = bytes.replace(/^(---\n)/, `$1case_id: ${CASE}\n`);
  await mustPromote(LEAD, lie, "inquiry", "concluded", await shaOf(LEAD));
  const refused = await ratifyMember(LEAD);
  t("and a hand-written document that names a case IS REFUSED BY THE GATE — the absence is a property "
  + "of the FORMAT rather than of op=publish remembering not to write it",
    [refused.reason,
     (refused.findings || []).some((x) => x.check === "C-2.8"
       && /a finding's bytes name a case \(case_id\)/.test(x.detail))],
    ["GATE_REFUSED", true]);
  await mustPromote(LEAD, bytes, "inquiry", "concluded", await shaOf(LEAD));
  t("(fixture) the honest bytes are restored, so nothing below reads the wreckage of an attack",
    (await shaOf(LEAD)) === r1.bundleSha, true);

  /* ===== AND THE PIN IS WHAT RESOLVES A MEMBER, PROVED ON A DIVERGED ONE.
     ADDED AFTER CONTROL ARM (d) CAME BACK GREEN, and that is the honest order of
     events: (d) widens the roster match from `bundle_id AND version_sha` to
     `bundle_id` alone, and this suite did not notice, because every member in it
     sat at exactly the version its case had pinned. A fixture where the two
     agree CANNOT see this defect — the same instrument limit CASE-5's own
     over-strictness arm measured and CASE-4's arm (b2) measured again — so the
     suite is given a member that has genuinely moved on.
     SUPP is re-promoted to legal bytes that differ from the ones the case froze.
     Its id is unchanged and its pin is now stale, so a plane resolving by id
     alone would place a version nobody signed for into a published case. */
  const suppBytes = await imageOf(SUPP);
  /* THE REVISION MINTS A NEW VERSION AT A NEW EDITION, which is clause 3 working
     rather than a fixture convenience: re-ratifying different bytes under the
     edition already published is refused by EDITION_EXISTS, and that refusal is
     right — an edition is a separate document and answers forever. So the member
     does what a revising publisher does, and increments its OWN edition on its
     OWN chain. */
  const moved = suppBytes
    .replace("## Review Notes\n", "## Review Notes\n\nRe-read after the budget cycle.\n")
    .replace(/^edition: 1$/m, "edition: 2");
  await mustPromote(SUPP, moved, "inquiry", "concluded", await shaOf(SUPP));
  const movedSha = await shaOf(SUPP);
  t("(fixture) the member really moved: its current version is not the one the case pinned",
    [movedSha !== r2.bundleSha, /^[0-9a-f]{64}$/.test(movedSha)], [true, true]);
  const movedRat = rP(await POST(`op=ratify&token=${IRIS}`,
    { bundleId: SUPP, expectedSha: movedSha, sig: signRatify("iris", SUPP, movedSha) }));
  if (!movedRat.ok) bail("ratify the revised member", movedRat);
  t("THE PIN IS WHAT RESOLVES A MEMBER: the revised version ratifies as ITSELF, at its OWN next edition, "
  + "and is NOT placed into the case — the case committed to a VERSION and not to an id",
    [movedRat.ok, movedRat.edition, movedRat.caseId ?? null], [true, 2, null]);
  /* AND THE CASE IS UNMOVED, which is the half worth stating plainly: it goes on
     serving the version it FROZE. `awaiting` stays empty because that version is
     still published and still answerable — a revision does not unpublish what was
     signed, which is the whole of "a case is a record of an act and never a claim
     about the present". The assertion that matters is the SHA, not the roster:
     the case must serve edition 1's hash and not the hash the finding now holds. */
  const served = (await anon(`op=publishedcase&id=${CASE}`)).findings
    .find((f) => f.bundle_id === SUPP);
  t("and the case is UNMOVED: it serves the version it FROZE and not the one the finding now holds, "
  + "so a revision is a new version beside the case rather than a silent edit inside it",
    [served.bundle_sha === r2.bundleSha, served.bundle_sha === movedSha,
     served.version_sha === r2.bundleSha], [true, false, true]);
  /* RESTORED, so block 5's container is a whole case rather than the wreckage of
     an experiment. Restoring the CONTENT restores the SHA, which is what
     re-matches the pin — the property that makes the pin a statement about BYTES
     rather than about an act. */
  await mustPromote(SUPP, suppBytes, "inquiry", "concluded", await shaOf(SUPP));
  t("(fixture) restoring the CONTENT restores the SHA, so the member re-enters the case it left",
    [(await shaOf(SUPP)) === r2.bundleSha,
     (await anon(`op=publishedcase&id=${CASE}`)).complete], [true, true]);
}

/* =========================================================================== 5
 * THE STRANGER, WITH THE INSTANCE UNREACHABLE.
 * ========================================================================= */
console.log("\n--- 5. a stranger verifies the CASE and its members with the instance UNREACHABLE ---");
{
  const cs = await anon(`op=publishedcase&id=${CASE}`);
  if (!cs || !cs.manifest_sha) bail("the container was not assembled", cs);
  const manifest = JSON.parse(new TextDecoder().decode(new Uint8Array(
    await (await anonRaw(`op=publishedbytes&sha256=${cs.manifest_sha}`)).arrayBuffer())));
  t("the container names its format and carries the SIGNED CASE DOCUMENT — the bytes, their hash, the "
  + "statement in ASCII, and the armored signature a member made over them",
    [manifest.format, manifest.case_document.doc_sha === SIGNED_DOC_SHA,
     manifest.case_document.signature.statement,
     manifest.case_document.signature.armored.startsWith("-----BEGIN SSH SIGNATURE-----"),
     manifest.case_document.attestor.member],
    ["bio-case-container/5", true, `bio-ratify-case ${CASE} 1 ${SIGNED_DOC_SHA}\n`, true, "iris"]);

  /* ===== PHASE B: THE INSTANCE IS GONE. `dispatchFetch` is REPLACED WITH A
     THROW, so it is unreachable rather than merely uncalled — an instance we
     simply did not ask proves nothing about a reader who cannot ask. */
  const realFetch = mf.dispatchFetch.bind(mf);
  mf.dispatchFetch = () => { throw new Error("the instance is unreachable"); };
  const verify = (text, statement, sig, keyB64) => {
    const base = join(dir, `v-${Math.random().toString(36).slice(2)}`);
    writeFileSync(base, statement);
    writeFileSync(base + ".sig", sig);
    writeFileSync(join(dir, "allowed"), `iris@bio ssh-ed25519 ${keyB64}\n`);
    const r = spawnSync("ssh-keygen", ["-Y", "verify", "-f", join(dir, "allowed"), "-I", "iris@bio",
                                       "-n", "bio-ratify", "-s", base + ".sig"],
                        { input: statement });
    return r.status === 0;
  };
  const docKey = manifest.case_document.attestor.key_b64;
  t("THE CASE'S OWN SIGNATURE VERIFIES with an external binary, against the key the artifact names, "
  + "over a statement rebuilt from the artifact's own case id, edition and hash",
    verify(manifest.case_document.text,
           `bio-ratify-case ${manifest.case} ${manifest.edition} ${manifest.case_document.doc_sha}\n`,
           manifest.case_document.signature.armored, docKey), true);
  t("and the document's bytes really hash to the sha the signature covers, so the verification is "
  + "over the text the stranger is holding and not over a number the manifest asserts",
    sha(manifest.case_document.text), manifest.case_document.doc_sha);
  t("EVERY MEMBER'S OWN SIGNATURE verifies too — the finding is still the unit of truth and each one "
  + "is signed on its own bytes",
    manifest.findings.map((f) => verify("", `bio-ratify ${f.bundle_id} ${f.bundle_sha}\n`,
                                        f.signature.armored, f.attestor.key_b64)),
    [true, true]);
  /* AND THE VERIFICATION IS NOT VACUOUS: one flipped byte fails, the untouched
     copy still passes. A verifier that accepts everything accepts nothing. */
  /* THE FLIP IS COMPUTED, NOT ASSUMED. Writing "0" over the last hex digit is a
     NO-OP one time in sixteen — when that digit already is "0" — and the arm then
     verifies the untouched statement twice and reports the check as vacuous while
     looking fine. Measured on this suite's own first run. */
  const flipped = manifest.case_document.doc_sha.slice(0, 63)
    + (manifest.case_document.doc_sha.endsWith("0") ? "1" : "0");
  t("ONE FLIPPED BYTE FAILS while the untouched copy still passes — the check is a check",
    [flipped !== manifest.case_document.doc_sha,
     verify(manifest.case_document.text,
            `bio-ratify-case ${manifest.case} ${manifest.edition} ${flipped}\n`,
            manifest.case_document.signature.armored, docKey),
     verify(manifest.case_document.text,
            `bio-ratify-case ${manifest.case} ${manifest.edition} ${manifest.case_document.doc_sha}\n`,
            manifest.case_document.signature.armored, docKey)],
    [true, false, true]);
  /* AND EVERY CASE FACT A STRANGER NEEDS IS INSIDE THE BYTES THEY JUST VERIFIED,
     rather than being a field this instance asserted beside them. */
  t("and every case fact the stranger needs is INSIDE the bytes they just verified — not a manifest "
  + "field this instance asserted beside them",
    [SCOPE, STMT, JUST, BACK, EXCL_R, PUBLISHING_PROJECT, LEAD, SUPP]
      .map((s) => manifest.case_document.text.includes(s)),
    [true, true, true, true, true, true, true, true]);
  mf.dispatchFetch = realFetch;
  t("(fixture) the instance is restored, so the arms below are not measuring a dead harness",
    (await anon(`op=publishedcase&id=${CASE}`))?.caseId, CASE);
}

/* =========================================================================== 6
 * OVER-STRICTNESS: correct work still publishes.
 * ========================================================================= */
console.log("\n--- 6. OVER-STRICTNESS: a legitimately signed case publishes, and DEC-44's one-finding case stays legal ---");
{
  const SOLO = "INQ-2026-7700-solo";
  await mustPromote(SOLO, inquiryMd(SOLO, { question: "Was the index kept?", refs: [INFO], legs: LEGS }), "inquiry", "open");
  const cn = await conclude(SOLO, "The clerk's index omits the transfer.",
                            "An index entry naming the transfer would overturn this.");
  if (!cn.ok) bail("conclude SOLO", cn);
  const solo = await publish({ targets: [SOLO], roles: { [SOLO]: "load_bearing" },
    scope: "Whether the clerk's index recorded the transfer.",
    statement: "This case covers the indexing question only, at its own edition 1.",
    excluded: [],
    biasAcknowledgement: "The same declared position is in force, and this case reads the clerk's "
                       + "index through it — the first source here the group did not itself request." });
  if (!solo.ok) bail("publish the one-finding case", solo);
  const soloRat = await POST(`op=caseratify&token=${IRIS}`,
    { caseId: solo.caseId, edition: 1, expectedSha: solo.caseDocument.doc_sha,
      sig: signCase("iris", solo.caseId, 1, solo.caseDocument.doc_sha) });
  t("DEC-44's ONE-FINDING CASE IS STILL LEGAL, and its ceremony is the same ceremony — not superseded "
  + "by DEC-72 and not made harder by this item",
    [solo.ok, soloRat.ok, soloRat.roster, soloRat.awaiting], [true, true, [SOLO], [SOLO]]);
  const soloMember = await ratifyMember(SOLO);
  t("and it completes, serves a container, and answers the anonymous read like any other case",
    [soloMember.ok, (await anon(`op=publishedcase&id=${solo.caseId}`)).complete,
     (await anon(`op=publishedcase&id=${solo.caseId}`)).findings.map((f) => f.bundle_id)],
    [true, true, [SOLO]]);
  /* A VACUITY GUARD, because "a case published" is satisfiable by a gate that
     gave up: the all-supporting case DEC-72's second ruled default refuses must
     still be refused, in the same act, on the same fixture. */
  t("VACUITY GUARD: an all-SUPPORTING case is still refused, so 'a case published' above cannot be "
  + "read as the gate having stopped asking",
    (await publish({ targets: [SOLO], roles: { [SOLO]: "supporting" },
      scope: "x", statement: "y", excluded: [] })).ok, false);
}

/* =========================================================================== 7
 * THE CATALOG FAMILY, EVERY ARM NAMED AND FIRED.
 * ========================================================================= */
console.log("\n--- 7. C-41: every arm of the case document's gate, driven over a real document ---");
{
  const fm = parseFrontmatter(doc1.text).data;
  const ctx = { caseId: CASE, edition: 1 };
  const fires = (mutate, check) => checkCaseDocument(mutate({ ...fm }), ctx)
    .some((x) => x.check === check);
  /* THE BASELINE, AND IT IS NOT DECORATION: a gate that refuses everything makes
     every arm below pass. The real document must draw NO finding at all. */
  t("BASELINE: the real signed document draws NO C-41 finding — without this row, twelve arms that "
  + "fire prove only that the gate fires",
    checkCaseDocument(fm, ctx), []);
  /* EACH ARM CARRIES ITS C-NUMBER AS A LITERAL, and that is load-bearing twice
     rather than a spelling choice. It PINS the family's numbering — renumber a
     member in the catalog and this suite goes red naming it, where a number read
     out of `CASE_DOCUMENT_FAMILY` would follow the change silently and agree with
     the thing under test for free. And `scripts/coverage.mjs` credits a check as
     NAMED BY AN ASSERTION only from a literal in a suite's CODE (D-277: a check
     whose coverage is prose is the C-20.1 class, clean because it was not
     looking), so a family driven only through a computed key reads as never
     named — exercised solely in the direction that passes. */
  const arms = [
    ["FORMAT",       "C-41.1",  (d) => { d.format = "nope"; return d; }],
    ["IDENTITY",     "C-41.2",  (d) => { d.case_id = "CASE-2026-9999"; return d; }],
    ["EDITION",      "C-41.3",  (d) => { d.case_edition = 7; return d; }],
    ["PROJECT",      "C-41.4",  (d) => { d.case_project = null; return d; }],
    ["SCOPE",        "C-41.5",  (d) => { d.case_scope = ""; return d; }],
    ["BIAS",         "C-41.6",  (d) => { d.bias_acknowledgement = ""; return d; }],
    ["ROSTER",       "C-41.7",  (d) => { d.case_findings = []; return d; }],
    ["ROLES",        "C-41.8",  (d) => { d.case_roles = d.case_roles.map((r) => ({ ...r, role: "supporting" })); return d; }],
    ["PINS",         "C-41.9",  (d) => { d.case_roles = d.case_roles.map((r) => ({ ...r, version_sha: null })); return d; }],
    ["COMPLETENESS", "C-41.10", (d) => { d.completeness = { ...d.completeness, statement: "" }; return d; }],
    ["EXCLUDED",     "C-41.11", (d) => { delete d.completeness_excluded; return d; }],
    ["BAR",          "C-41.12", (d) => { delete d.required_strength; return d; }],
  ];
  /* ONE ASSERTION PER ARM, EACH NAMING ITS OWN C-NUMBER, because a bare count of
     twelve is satisfied by any twelve and a family graded as a whole hides the
     member nobody wrote. */
  for (const [key, num, mutate] of arms) {
    t(`${num} is what the catalog declares for ${key}, and it FIRES on ${CASE_DOCUMENT_FAMILY[key].what}`,
      [CASE_DOCUMENT_FAMILY[key].check, fires(mutate, num)], [num, true]);
  }
  t("and the twelve arms cover the family EXACTLY — a member added to the catalog and not driven here "
  + "fails this row rather than being silently unexercised",
    arms.map(([k]) => k).sort(), Object.keys(CASE_DOCUMENT_FAMILY).sort());
  /* C-21.1 AT CASE ALTITUDE, which moved here from checkCompletenessFreshness.
     The prior edition is INJECTED, so the expectation shares no code path with
     the document under test. */
  const prior = { edition: 0, statement: STMT, bias_acknowledgement: BACK };
  t("C-21.1 moved to this altitude with the claim: an edition reprinting the previous one's statement "
  + "or its acknowledgement is refused, and a freshly authored one is not",
    [checkCaseDocument(fm, { ...ctx, priorCase: prior }).filter((x) => x.check === "C-21.1").length,
     checkCaseDocument(fm, { ...ctx, priorCase: { edition: 0, statement: "different",
       bias_acknowledgement: "also different" } }).filter((x) => x.check === "C-21.1").length],
    [2, 0]);
}

/* ===========================================================================
 * NEGATIVE CONTROL — RUN 2026-09-10, four arms plus a baseline, each armed ALONE
 * and recorded with what it MEASURED rather than with what it was expected to.
 * The driver is `test/casesign.control.mjs`; see the header of this file for the
 * arm list and the restore discipline. The measured results are written into the
 * driver itself, beside each arm, so the arm and its receipt cannot drift apart.
 * ========================================================================= */

await mf.dispose();
console.log(`\ncasesign: ${pass} pass, ${fail} fail  [FOOT REACHED]`);
process.exit(fail ? 1 : 0);
