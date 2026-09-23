/* NEGATIVE CONTROL: (declared and RUN 2026-09-17, REC-96, worktree
   agent-a24e7153a704df2de) FOUR ARMS PLUS A BASELINE, each armed ALONE with every
   other defence held OPEN, RUN, and recorded here with the count it MEASURED
   rather than the count it was expected to. The driver is
   `test/casesearched.control.mjs` — COMMITTED, so every arm re-runs in one step
   with `node test/casesearched.control.mjs [arm]` — and every restore is verified
   by CONTENT and by sha256 against a UNIQUELY-NAMED per-arm pristine copy taken
   INSIDE THIS WORKTREE (never `git checkout --`, which restores to HEAD and has
   twice discarded a session's own uncommitted work).
   THE ARM THIS ITEM EXISTS FOR IS ARM A, AND IT IS THE LIE THIS SUITE IS BUILT TO
   CATCH — named without a parenthesised marker in this prose on purpose, because
   `control-register.mjs` treats one as OPENING A LIST ITEM. Stated before what the
   suite checks, because the cheapest way to make a coverage section green is not
   to forge a row — it is to choose the SUBJECT SET. Compute the section over the
   observation log's OWN subjects and every case is 100% searched by construction,
   every row in it honest and every number true, while the document says nothing
   whatever about the case. That is D-196's ancestor: Blair & Maron's attorneys
   stipulated 75% recall and sincerely believed it against a measured ~20%,
   because what they measured was not what they claimed.
   THIS WHOLE DECLARATION IS ONE PARAGRAPH AND THE ARMS FOLLOW IT WITH NOTHING
   BETWEEN, which is structural rather than stylistic and was learned by being
   scored zero twice: `control-register.mjs` reads the marker's own paragraph and
   then ONLY paragraphs that OPEN WITH A MARKER, so any prose dropped between the
   marker and the list — or between two arms — ENDS the span and every arm after
   it is silently uncounted (D-233; `bias.test.mjs` stated thirteen arms and
   scored zero for exactly this). The arms are also lettered from (a) and not from
   (b), because `FIRST_ORDINAL` requires the set to contain `1`, `a`, `i` or `1a`
   and a list running (0)(b)(c)(d)(e) counts as NO list at all.
   ALL FIVE RUN 2026-09-17, then RE-RUN the same day after CONDUCT #2's ruling
   added section 8's two-direction gate assertions; the counts below are the
   RE-MEASURED ones, and every restore verified sha256 MATCH + content IDENTICAL +
   size ok:

   (0) BASELINE, nothing armed -> **26 pass, 0 fail**. The row that distinguishes
   four-arms-broken from four-arms-working, and the one nobody runs.

   (a) SUBJECT SET FROM THE LOG — in `src/store.mjs`'s `#searchedForCase`, replace
   the case-derived capture list with every capture the observation log holds a
   content-level row for. The arithmetic stays honest and every state stays true;
   the never-looked case then reads SEARCHED, because the one capture nobody
   looked at is no longer in the set -> **23 pass, 3 fail**, the first naming the
   content level exactly as declared. **THE SECOND FAILURE WAS NOT DECLARED AND IS
   KEPT RATHER THAN SMOOTHED:** section 7's *the signed section does not move* also
   went red, because the lie does not stop at the computation — it reaches the
   SIGNED BYTES, and the document a stranger verifies then carries a coverage claim
   over a set that was never this case's. **AND A THIRD ON THE RE-RUN:** section 8's
   *an honest negative publishes* has nothing to find, because with the subject set
   swapped the case no longer HAS an honest negative — it reports `searched`. Three
   named failures from one swapped set, and not a forged value among them.

   (b) THE ONE-SIDED COERCION NEUTERED — in `src/airun.mjs`'s `searchedSection`,
   drop the `oneSided` branch so a caller's `never_looked` is taken at face value
   -> **24 pass, 2 fail**: the ENTITY arm and the FAIL-CLOSED arm both go red,
   which is correct and slightly more than declared — the inverted default is the
   same rule as the coercion and cannot survive it being removed.

   (c) ZERO OF ZERO — remove the `no_subjects` outcome so an empty level falls
   through to `searched` -> **25 pass, 1 fail**, exactly as declared. This is the
   costs-nothing rule wearing a percentage and it is the one a reader would never
   question, because 100% looks like the best possible answer.

   (d) OVER-STRICTNESS — make the gate REFUSE a `searched` block reporting
   `never_looked` at any level -> **1 pass, 1 fail, AND THE FIXTURE ABORTS AT
   `op=caseratify` WITH `GATE_REFUSED`.** The declared expectation was that the
   arms asserting an honest negative PUBLISHES would go red; what actually happens
   is sharper and is recorded as measured — **the case cannot be published AT
   ALL.** With the honest answer refused, a member's only remaining routes to a
   published case are to go and look, or to lie. That is a gate pressuring someone
   into inventing a coverage claim, which CLAUDE.md names as a bug in the gate
   rather than a safer gate. **THE IMPLEMENTATION DOES NOT CONTAIN THIS REFUSAL** —
   this arm INTRODUCES it, which is what an over-strictness arm is for — and
   section 8 pins the correct behaviour in both directions as positive assertions,
   so a future session tightening it goes red rather than shipping the defect.

   ---

   REC-96 / D-196 / IC-112 — THE COMPLETENESS STATEMENT'S `searched` SECTION,
   DRIVEN THROUGH THE CEREMONY ON A CASE WHOSE SUBJECTS ARE REAL.

   WHY THIS SUITE EXISTS RATHER THAN A SECTION IN `casesign.test.mjs`. That suite
   promotes with `register: []` and says why in its own words — registering
   captures to exercise a signing ceremony would be *a fixture doing someone
   else's work*. Its legs therefore carry no `content_id`, so its case's subjects
   cannot be IDENTIFIED at all, and the honest section it publishes reports
   exactly that. It is a real answer and it is asserted there. **It is not this
   item's acceptance criterion**, which is a case whose subjects ARE identified
   and were never looked for at the content level SAYING SO in the signed
   document. Reaching that needs a registered capture and a log that already
   carries content-level rows, which is a corpus `casesign` deliberately does not
   build — so it is built here instead of distorting a fixture nine other suites
   depend on.

   THE CORPUS IS THE ARGUMENT AND IT IS THE FIDDLY PART. Section 5.1's cause (3)
   — *nobody looked*, the only cause that licenses a positive statement — is
   reachable only when the log HAS content-level rows and the subject was
   registered after the earliest of them. So the ground is two documents that are
   not alike: SEEDED is promoted WITH a reading, which fires REC-94's content
   writer and puts a row in the log; CASED is promoted WITH a registered capture
   and NO reading, so it has no observation and no `readings` row. Only then does
   the case's own capture read `never_looked` rather than `undetermined`, and the
   difference between those two answers is the whole of section 5.1.
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
import { parseFrontmatter, SEARCHED_SUBJECT_SOURCES,
         checkCaseDocument, CASE_DOCUMENT_FAMILY } from "../checks/bio-checks.mjs";
import { searchedSection, SEARCHED_LEVEL_OUTCOMES,
         MEANING_EVIDENCE_IS_ONE_SIDED } from "../src/airun.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- casesearched ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("casesearched: SKIPPED — ssh-keygen not on PATH; this item's subject is a section inside a "
    + "REAL signature over a case document, and a ceremony proved with our own verifier proves our verifier");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r96", MEMBER_TOKEN: "mem-r96", PROBE_TOKEN: "prb-r96", VERSION: "test" },
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
  console.log(`\ncasesearched: ${pass} pass, ${fail} fail  [FIXTURE ABORTED]`);
  mf.dispose().then(() => process.exit(1));
  throw new Error("fixture");
};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const anon = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());

const dir = mkdtempSync(join(tmpdir(), "casesearched-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
/* THE STATEMENT WRITTEN OUT IN ASCII rather than imported from `src/sshsig.mjs`:
   an expectation taken from the thing under test agrees with it for free. */
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
  const add = rP(await POST("op=memberadd&token=adm-r96",
    { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
await enrol("nadia", "nadia-passphrase-r96", "admin", ["contribute", "publish", "create_projects"]);
await enrol("omar", "omar-passphrase-r96", "admin", ["contribute", "publish"]);
const IRIS = await enrol("iris", "iris-passphrase-r96", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-r96", { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" }));

/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7);
   the fixture takes a `name` and returns the minted id. */
const PUBLISHING_PROJECT = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-r96", owner: "iris",
  name: "PROJ-2026-9600-auditor", created: "2026-07-01T00:00:00Z", updated: "2026-07-02T00:00:00Z" });

const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";

/* THE DOCUMENT SHAPES ARE `casesign.test.mjs`'s, which took them from
   `caselifecycle.test.mjs`, and they are lifted rather than hand-rolled for that
   suite's own stated reason: what this suite is about is the SECTION, and a
   hand-rolled bundle the catalog happens to accept for the wrong reason would
   make every arm below measure a document nobody would publish. This suite's own
   first draft proved the point — it invented an inquiry shape and was refused by
   C-6.3 before a single arm ran. */
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

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { register = [], reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return rP(await POST("op=promote&token=adm-r96", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260917T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "concluded" : "collected",
            created: NOW, last_updated: LATER },
    files, register }));
};
const mustPromote = async (id, text, type, opts = {}) => {
  const r = await promote(id, text, type, opts);
  if (r.ok === false) bail(`promote ${id}`, r);
  HEAD.set(id, r.bundleSha);
  return r;
};

/* ===========================================================================
   0. THE GROUND — two documents that are deliberately NOT alike.
   =========================================================================== */
console.log("\n--- 0. the ground: one document the record READ, one it only HOLDS ---");

const SHA_SEEDED = sha("rec96-seeded-bytes");
const SHA_CASED = sha("rec96-cased-bytes");
const SEEDED = "INFO-2026-9600-seeded";
const CASED = "INFO-2026-9600-cased";
const LEAD = "INQ-2026-9600-lead";

/* SEEDED — promoted WITH a reading, so REC-94's content-level writer fires and
   the log acquires a content-level row. Without this the log holds NO content
   rows at all, `#missingContentCause` answers `purged` for everything (an empty
   table is equally the never-written case and the purged one), and cause (3) is
   unreachable — which would make this suite assert `undetermined` while
   believing it had asserted `never_looked`. */
const reg = (s) => [{ sha256: s, path: `data/${s.slice(0, 4)}.pdf`, encoding: "binary", bytes: 10 }];
/* THE READING SHAPE IS REC-94's OWN (`observation-content.test.mjs`), lifted
   rather than invented: `text_source` and `text_tier` are what
   `contentObservationsFor` reads to decide the row, and a reading without them
   writes no content-level observation at all — which this suite's first draft
   did, leaving the ground silently absent. */
const readingOf = (over) => ({ content_type: "meeting_calendar", reader_version: 1,
                               read_from_text: true, found: false, entities: [], facts: {},
                               at: NOW, text_container: "pdf", ...over });
const WHOLE1 = [{ step: "layer", tier: 1, container: "pdf" }];

await mustPromote(SEEDED, infoMd(SEEDED), "information", {
  register: reg(SHA_SEEDED),
  reading: { capture: { sha256: SHA_SEEDED, encoding: "binary", bytes: 10 },
             reading: readingOf({ text_source: WHOLE1, text_tier: 1 }) },
});

/* CASED — the capture this case will rest on. REGISTERED so it is a real
   subject, and promoted with NO reading so nothing has looked INSIDE it. This is
   the document the signed case must confess to never having read. */
await mustPromote(CASED, infoMd(CASED), "information", { register: reg(SHA_CASED) });

await mustPromote(LEAD, inquiryMd(LEAD, {
  question: "Was the transfer authorised?",
  refs: [CASED],
  legs: [{ target: CASED, grade: "D", axis: "connection", source: "testimony" }],
}), "inquiry");

const shaOf = async (id) => {
  const l = await GET(`op=list&token=${IRIS}&limit=1000`);
  const rows = l.result?.bundles || l.result || [];
  return (rows.find((b) => b.bundle_id === id) || {}).bundle_sha ?? null;
};

/* THE MEMBERS ARE NOT RATIFIED HERE, AND THAT IS THE CEREMONY'S OWN ORDER rather
   than a shortcut. `op=publish` authors the case document FIRST and its own
   `next:` says so: review and ratify the case document, THEN ratify each finding.
   A fixture that ratified the findings first would be driving a sequence the
   plane does not ask for. */

/* THE GROUND IS ASSERTED AND NOT ASSUMED. Every arm in section 3 measures the
   wrong thing if this asymmetry is absent: with no content-level row anywhere,
   `#missingContentCause` answers `purged` for everything (an empty table is
   equally the never-written case and the purged one) and this suite would assert
   `undetermined` while believing it had asserted `never_looked`. */
const contentSubjects = async () => {
  const f = rP(await GET(`op=frontier&level=content&token=${IRIS}&limit=500`));
  return (f && Array.isArray(f.looked) ? f.looked : []).map((r) => r.subject);
};
{
  const seen = await contentSubjects();
  t("the ground is what this suite claims it is: the document the record READ has a content-level "
  + "observation and the case's own document has NONE — the asymmetry section 5.1's cause (3) needs",
    [seen.includes(SHA_SEEDED), seen.includes(SHA_CASED)], [true, false]);
}

/* ===========================================================================
   1. THE CEREMONY — publish and sign a case resting on the unread document.
   =========================================================================== */
console.log("\n--- 1. the case is published and signed, resting on a document nobody has read inside ---");

const CASE = "CASE-2026-9600-transfer";
const STMT = "This case does not cover the 2025 transfers.";
const JUST = "The subject was asked and declined to comment.";
const BACK = "The publishing project is funded by a party with an interest in the outcome.";

const pub = rP(await POST(`op=publish&token=${IRIS}`, {
  project: PUBLISHING_PROJECT, scope: "Whether the 2026 transfer was authorised.",
  targets: [LEAD], roles: allLoadBearing({ targets: [LEAD] }),
  statement: STMT, subjectPosition: "sought_no_answer", subjectJustification: JUST,
  biasAcknowledgement: BACK,
  excluded: [{ target: null, description: "The 2025 transfers", reason: "Out of scope." }],
}));
if (pub.ok === false || !pub.caseDocument?.doc_sha) bail("publish case", pub);

const CASE_ID = pub.caseDocument.case_id;
const rat = rP(await POST(`op=caseratify&token=${IRIS}`, {
  caseId: CASE_ID, edition: 1, expectedSha: pub.caseDocument.doc_sha,
  sig: signCase("iris", CASE_ID, 1, pub.caseDocument.doc_sha) }));
if (rat.ok === false) bail("caseratify", rat);

const doc = await anon(`op=casedocument&case=${CASE_ID}&edition=1`);
const FM = parseFrontmatter(doc.text).data;
const LV = (lvl) => (FM.searched_levels || []).find((r) => r.level === lvl) || {};

t("the case is SIGNED and the document a stranger reads is the ratified one",
  [doc.ratified, typeof doc.sig_armored === "string"], [true, true]);

/* ===========================================================================
   2. THE SECTION IS IN THE SIGNED BYTES, IN BOTH SURFACES.
   =========================================================================== */
console.log("\n--- 2. the searched section is in the signed bytes, and a PERSON can read it ---");

t("the signed frontmatter carries the searched block with the source it was computed from",
  [typeof FM.searched === "object", FM.searched?.subject_source], [true, "case_basis"]);

t("and the subject source is one this record recognises — the vocabulary is the fence, and the "
+ "observation log is deliberately not a member of it",
  Object.prototype.hasOwnProperty.call(SEARCHED_SUBJECT_SOURCES, FM.searched.subject_source), true);

t("the three levels are reported as an ARRAY OF FLAT OBJECTS, which is the only shape the frontmatter "
+ "grammar has for a list — a map holding an array has no slot in it and would be read as stray indentation",
  (FM.searched_levels || []).map((r) => r.level), ["document", "content", "meaning"]);

t("and a PERSON can read it: the section is in the BODY under its own heading, not only in the "
+ "frontmatter a machine parses — what is SIGNED must be a thing a member actually reviewed",
  doc.text.includes("## What Was Searched"), true);

/* THE PUBLISHED PROSE IS THE VOCABULARY'S OWN WORDS AND NOT A SECOND SPELLING OF
   THEM. This is the mirror-and-drift class: a renderer that paraphrased an
   outcome would let the signed document and the constant disagree about what
   `never_looked` MEANS, and the document is the half a stranger reads. Asserted
   against the imported constant, so a reworded outcome must move both or go red. */
t("every level's published `detail` OPENS WITH THE VOCABULARY'S OWN SENTENCE for its outcome — the "
+ "signed document and `SEARCHED_LEVEL_OUTCOMES` cannot drift apart into two meanings for one word",
  (FM.searched_levels || []).map((r) => r.detail.startsWith(SEARCHED_LEVEL_OUTCOMES[r.outcome])),
  (FM.searched_levels || []).map(() => true));

/* ===========================================================================
   3. THE ACCEPTS-WHEN. This is the item.
   =========================================================================== */
console.log("\n--- 3. THE ITEM: a case whose subjects were never looked for at the content level SAYS SO ---");

t("THE CONTENT LEVEL REPORTS never_looked FOR THIS CASE'S OWN DOCUMENT — the record holds the bytes "
+ "and has never looked inside them, and the SIGNED document says so rather than leaving a "
+ "completeness claim with nothing behind it (D-196)",
  [LV("content").outcome, LV("content").never_looked, LV("content").looked], ["never_looked", 1, 0]);

t("and it says so IN THE BODY, in a sentence a reader outside this project meets without decoding "
+ "a key-value block",
  /content level.*NEVER LOOKED/i.test(doc.text), true);

/* THE DOCUMENT LEVEL'S ANSWER HERE IS A FINDING RATHER THAN A DEFAULT, and this
   arm asserts the honest version rather than the one first drafted. This capture
   was REGISTERED directly and never ACQUIRED at an address, so `captured_locators`
   holds no row for it and there is no address to be a document-level subject at
   all. The record therefore cannot name what it would have to look for, and says
   so — it does NOT report the level as searched on the strength of holding the
   bytes. The first draft of this arm expected `searched` and was wrong about the
   corpus, not about the code. */
t("the document level does NOT claim coverage it cannot support: a capture registered directly was "
+ "never fetched at an address, so there is no document-level subject to name, and the level reports "
+ "the unresolvable referent instead of reading as searched",
  [LV("document").outcome, LV("document").looked, LV("document").unidentified >= 1],
  ["partial", 0, true]);

t("the section names ONE subject at the content level and it is the case's own capture, not every "
+ "capture the store holds — the seeded document the record DID read is NOT in this case's set",
  [LV("content").subjects, FM.searched.subjects >= 1], [1, true]);

/* ===========================================================================
   4. ZERO OF ZERO IS NOT 100%.
   =========================================================================== */
console.log("\n--- 4. an empty level is `no_subjects`, never `searched` ---");

t("a level with no subjects and nothing unidentified reports no_subjects — zero of zero is not "
+ "coverage, and reporting it as searched is the costs-nothing rule wearing a percentage",
  searchedSection({ at: NOW, subjectSource: "case_basis",
    levels: [{ level: "content", subject_kind: "capture", subjects: [], unidentified: 0 }] })
    .levels[0].outcome, "no_subjects");

t("and an unidentified referent CAPS its level at partial however clean the identified half looks — "
+ "a coverage claim over the subjects we could name, published without saying others could not be "
+ "named, is the overclaim this section exists to refuse",
  searchedSection({ at: NOW, subjectSource: "case_basis",
    levels: [{ level: "content", subject_kind: "capture",
               subjects: [{ subject: "a", state: "PRESENT" }], unidentified: 1 }] })
    .levels[0].outcome, "partial");

/* ===========================================================================
   5. THE SUBJECT SET IS THE FENCE.
   =========================================================================== */
console.log("\n--- 5. the subject set is the fence, and it is structural rather than conventional ---");

t("a section computed from the OBSERVATION LOG's own subjects is REFUSED rather than published — the "
+ "log is deliberately not a member of the vocabulary, so the cheapest lie is unrepresentable and "
+ "not merely discouraged",
  searchedSection({ at: NOW, subjectSource: "observation_log", levels: [] }).ok, false);

t("and the refusal SAYS WHY, naming the failure mode, so a caller meets the reasoning rather than a "
+ "rejected enum",
  /100% searched by construction/.test(
    searchedSection({ at: NOW, subjectSource: "observation_log", levels: [] }).why), true);

/* ===========================================================================
   6. THE ONE-SIDED COERCION (REC-95's finding, consumed rather than re-derived).
   =========================================================================== */
console.log("\n--- 6. where the evidence is one-sided, `never_looked` is refused and stated as undetermined ---");

t("REC-95's finding is CONSUMED and not re-spelled: at two of the meaning level's three subject kinds "
+ "the pre-log evidence exists only where the answer was YES",
  [MEANING_EVIDENCE_IS_ONE_SIDED.capture, MEANING_EVIDENCE_IS_ONE_SIDED.reference,
   MEANING_EVIDENCE_IS_ONE_SIDED.entity], [false, true, true]);

t("so a caller asserting never_looked over an ENTITY is OVERRULED into undetermined — cause (3) is "
+ "not merely unproven there, it is unprovable, and the record must not say otherwise",
  searchedSection({ at: NOW, subjectSource: "case_basis",
    levels: [{ level: "meaning", subject_kind: "entity",
               subjects: [{ subject: "e", state: null, cause: "never_looked" }], unidentified: 0 }] })
    .levels[0], (() => {
      const l = searchedSection({ at: NOW, subjectSource: "case_basis",
        levels: [{ level: "meaning", subject_kind: "entity",
                   subjects: [{ subject: "e", state: null, cause: "never_looked" }], unidentified: 0 }] })
        .levels[0];
      return { ...l, outcome: "undetermined", never_looked: 0, undetermined: 1 };
    })());

t("the SAME assertion over a CAPTURE at the same level is NOT overruled, because there the evidence "
+ "is two-sided — one rule consulted per subject kind, never a list of kinds written at the site",
  searchedSection({ at: NOW, subjectSource: "case_basis",
    levels: [{ level: "meaning", subject_kind: "capture",
               subjects: [{ subject: "c", state: null, cause: "never_looked" }], unidentified: 0 }] })
    .levels[0].outcome, "never_looked");

t("and a meaning subject kind this record has no evidence answer for is FAIL-CLOSED rather than waved "
+ "through — an inverted default, so a later kind inherits the refusal by omission",
  searchedSection({ at: NOW, subjectSource: "case_basis",
    levels: [{ level: "meaning", subject_kind: "description",
               subjects: [{ subject: "d", state: null, cause: "never_looked" }], unidentified: 0 }] })
    .levels[0].outcome, "undetermined");

/* ===========================================================================
   7. THE SIGNED SECTION DOES NOT MOVE (design section 9's own control).
   =========================================================================== */
console.log("\n--- 7. alter the log after signing and the signed section does not move ---");

const BEFORE = doc.text;
await mustPromote(CASED, infoMd(CASED), "information", {
  register: reg(SHA_CASED),
  reading: { capture: { sha256: SHA_CASED, encoding: "binary", bytes: 10 },
             reading: readingOf({ text_source: WHOLE1, text_tier: 1, at: LATER }) },
});

const after = await anon(`op=casedocument&case=${CASE_ID}&edition=1`);
t("the log has MOVED — the case's document has now been READ, so a section recomputed today would "
+ "answer `searched` where the signed one says `never_looked`. WITHOUT THIS ROW the next assertion "
+ "proves only that nothing happened, which is the shape of a control that cannot fail",
  (await contentSubjects()).includes(SHA_CASED), true);

t("and the SIGNED section does not move: it was computed once, at authoring, and the signature covers "
+ "those bytes — a section recomputed at read time would be a signed document whose contents change "
+ "after it is signed",
  [after.text === BEFORE, parseFrontmatter(after.text).data.searched_levels
    .find((r) => r.level === "content").outcome], [true, "never_looked"]);

t("the document's digest is unchanged too, which is the property the signature actually rests on",
  after.doc_sha === doc.doc_sha, true);

/* ===========================================================================
   8. THE GATE REFUSES SILENCE AND PUBLISHES AN HONEST NEGATIVE — BOTH DIRECTIONS,
      AS POSITIVE ASSERTIONS RATHER THAN ONLY AS AN OVER-STRICTNESS ARM.

   RULED BY CONDUCT #2, 2026-09-17, and the ruling's own argument is that this is
   the behaviour a future session is most likely to "tighten" by accident — so it
   needs an assertion that goes red when someone does, not a control arm somebody
   has to remember to run.

   THE TWO STATES ARE DIFFERENT AND ONLY ONE IS THE DEFECT THIS ITEM CLOSES. A
   document with NO `searched` section says nothing about coverage, and a signed
   case that is MUTE about what was looked for lets a reader supply the missing
   claim themselves — that is the silence C-41.10 exists to refuse. A document
   whose section honestly reads `never_looked` has STATED ITS OWN WEAKNESS IN THE
   SIGNED BYTES, which is the strongest thing this record can do: undetermined is
   first-class and must be stated. Refusing it would convert an honest weak case
   into NO case, and this project's doctrine is that a case built on a record that
   OVERCLAIMS is worse than no case — never that a weak case is.
   =========================================================================== */
console.log("\n--- 8. the gate refuses SILENCE about coverage and publishes an HONEST NEGATIVE ---");
{
  /* `checkCaseDocument(fm, ctx)` TAKES THE FRONTMATTER POSITIONALLY. This
     harness's first draft passed `{caseId, edition, fm, priorCase}` as `fm` —
     `runCaseGate`'s shape one layer up — and the checker then saw an object with
     no `completeness` and no `searched` and reported BOTH missing. It read as two
     real gate failures on a document that had just ratified cleanly, which is the
     controls-find-the-instrument-wrong shape: the subject was never exercised. */
  const findingsOf = (text) => checkCaseDocument(parseFrontmatter(text).data,
    { caseId: CASE_ID, edition: 1 })
    .filter((f) => f.check === CASE_DOCUMENT_FAMILY.COMPLETENESS.check);

  /* THE POSITIVE DIRECTION, AND IT IS THE ONE THE RULING ASKED FOR. This is the
     REAL signed document, whose content level reports `never_looked` — asserted
     in section 3 above, over the same bytes. */
  t("AN HONEST NEGATIVE PUBLISHES: this document reports `never_looked` at the content level and "
  + "draws NO C-41.10 finding — it was signed and ratified above, and the gate does not refuse a "
  + "case for admitting what it did not look for",
    [LV("content").outcome, findingsOf(doc.text).length], ["never_looked", 0]);

  /* THE NEGATIVE DIRECTION: SILENCE. The section is removed from the frontmatter
     of the very document that just passed, so the ONLY thing that changed is
     whether the case says anything about coverage at all. */
  const muted = doc.text.replace(/^searched:\n(?: {2}\S.*\n)+/m, "")
                        .replace(/^searched_levels:\n(?: {2,4}[-\S].*\n)+/m, "");
  t("THE ARM IS ARMED — the section really is gone from the bytes, so the next row is measuring "
  + "silence and not a no-op edit",
    [/^searched:/m.test(muted), muted.length < doc.text.length], [false, true]);
  t("AND SILENCE IS REFUSED: the same document with its searched section removed draws C-41.10 BY "
  + "NAME. A completeness claim with no record of the looking behind it is D-196 verbatim, and it "
  + "is refused whoever hands us the bytes",
    findingsOf(muted).length > 0, true);
  t("and the refusal says an empty or negative answer is LEGAL and silence is not, so a member "
  + "meets the distinction rather than being told to produce a number",
    /SILENCE is not/.test(findingsOf(muted).map((f) => f.message).join(" ")), true);
}

console.log(`\ncasesearched: ${pass} pass, ${fail} fail  [FOOT REACHED]`);
await mf.dispose();
process.exit(fail ? 1 : 0);
