/* case-authoring — preparing a case before anything is signed (requirements: `build/requirements/case-authoring.md`;
 * BIO_Publication_v0_1.md §3 rules 4, 12, 13, 15, 16, 18, §6A). The owner of a project prepares a case: which concluded
 * findings it rests on and in what role, what it covers and excludes, who wrote its statement, what was searched and
 * with what outcome, and what bias it acknowledges. This module judges that preparation (`op=publish`), authors the
 * case document's text from the record and the owner's words (`./document.mjs`), and stores it unsigned through
 * `publication` (its R21). It also holds the statement's acknowledgements (`op=statementack`): members and review
 * recipients saying they have read the statement before it is signed.
 *
 * Extracted from the legacy modules (T8, layer 8; K3, K6, K57, K61, K82 (5), K94, K102): `store.mjs` (`publishCase`,
 * `#caseCitations`, `#caseDocumentText`, `#searchedForCase` with its two evidence probes, the acknowledgements
 * `STATEMENT_ACK_MAX` … `#statementWriter`, `#draftLinkOf`, `COMPLETENESS_MAX`, `MEMBER_ROLES`, `SEARCHED_SUBJECT_MAX`,
 * the dispatch entries `publishcase` and `statementack`), `airun.mjs` (`searchedSection`, `SEARCHED_LEVEL_OUTCOMES`,
 * now `./searched.mjs`; N138) and the check catalogue (C-44.1, C-44.3–C-44.5, C-82.2–C-82.7, now `./checks.mjs`).
 * Its tables are `./schema.mjs`'s. The legacy code's comments moved with it, shortened where they only restated the code.
 * The record's grammar (front matter, object types, grades, the machine predicate, the hash) is `record-grammar`'s;
 * the acknowledgements' locator and the one front-matter spelling (`fmSafe`) are `case-grammar`'s (N424).
 *
 * WHAT IS AUTHORED AND WHAT IS STAMPED (R22, R25). Authored, caller-supplied and never prefilled: the scope, the
 * completeness statement, every exclusion row, the subject position with its justification (DEC-13), the bias
 * acknowledgement (DEC-46), the load-bearing partition (DEC-72 clause 4). Stamped or read from the record at the act:
 * the author (the control plane's stamp), the time, the case edition (from the published record, never a parameter),
 * each member's pin, own edition and frozen pair, the conclusion it rests on, the bar, the bias manifest, the
 * citations, the searched section, the acknowledgements and the statement's writer. Nothing is composed, summarised or
 * inferred, and no answer or document composes a case-level strength (R24, DEC-44).
 *
 * PUBLISHING WRITES NOTHING ON A MEMBER FINDING (R13, R23; D-442, rule 12): each member is pinned at the `bundle_sha`
 * it has as prepared, so one project's preparation never moves another project's pin.
 *
 * REACHED as `caseAuthoringOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the
 * first call with `deps`, returned to every later caller. At creation it creates its table and declares it to
 * record-core's purge (R28, K23). It registers nothing (map §6 item 4).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership   layer 2: `readFile`, `head`, `transact`, `mintOpaqueId`, `declarePurge`; `viewerPredicate`,
 *                        `isProjectOwner`, `isJoinedParticipant`, `existenceAct`.
 *   inquiry              `basisFor` (R12's hunch legs).
 *   basisVersions        `testimonyReach` (R14's attributions).
 *   strength             `strengthOf`, `projectBar` (R6, R14).
 *   bias                 `biasManifest` (R14).
 *   observations         observation-log's `missingCauseAt` (R17).
 *   reevaluation         `raise` (R15).
 *   publication          `caseRelation`, `storeCaseDocument`, `reauthorSection`, `attributionStatements`,
 *                        `hasCaseStanding`, `reviewProvider` (its R4, R17, R21, R23).
 *   ratification         `caseConclusionFor`, `editionsRecordingConclusion` (its R1).
 *   contradiction        `unresolvedRecordOn` (its R29; R31, R32: N345).
 *   provenance           `captureGrade` (its R24–R27, R51; R35: N364).
 *   attestation          `attestationsOf` (its R7; R35: N364, re-pointed from provenance by N512).
 *   capture              `lateAttestationsOf`, `captureAccountsOf` (its R68, R69; R35, R36: N364).
 *   sources              `sourceOf` to find a capture's source, then `publishableAt` (its R1, R8; R37: N364).
 *   networkNotices       `noticeReferenceOf` (its R19; R41, R42: DEC-111).
 *   now                  the clock for the instants it writes, `(precision) => ISO string` (default: the wall clock).
 *
 * READ CONTRACTS it joins in its own SQL, each named at its statement: record-core's `bundles` (R37); publication's
 * `cases`, `published_cases`, `published_case_members`, `published_bundles`, `case_documents` (R40); review's
 * `case_drafts` (R26); inquiry's `inquiry_basis` (R40); content's `content` (R45); provenance's `register` and
 * `captured_locators` (R48); extraction's `readings` (R58); observation-log's `observation_log` (R29). */

import { recordOf, stampInstant, mintExhausted } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, noSuchProject } from "../membership/index.mjs";
import { observationLogOf } from "../observation-log/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { strengthOf, STRENGTH_AXES, DEPTH_BOUND, GRADING_METHOD_VERSION } from "../strength/index.mjs";
import { extractionOf } from "../extraction/index.mjs";
import { promotionOf, CATALOG_VERSION } from "../promotion/index.mjs";
import { parseImportedFindingRef } from "../inquiry-grammar/index.mjs";
import { biasOf } from "../bias/index.mjs";
import { reevaluationOf } from "../reevaluation/index.mjs";
import { publicationOf, sourceStatement, unnamedSourceStatement } from "../publication/index.mjs";
import { ratificationOf, SUBJECT_POSITIONS, completenessFields } from "../ratification/index.mjs";
import { contradictionOf } from "../contradiction/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { attestationOf } from "../attestation/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { sourcesOf } from "../sources/index.mjs";
import { networkNoticesOf } from "../network-notices/index.mjs";
import { parseFrontmatter, normalizeType, isMachineIdentity, OBJECT_TYPES, BASIS_GRADES,
         EARNED_CAPTURE_CEILING, isPublicHttpsLocator, proposalLabel, canonicalJson,
         createSha256 } from "../record-grammar/index.mjs";
import { SECTIONS } from "../case-grammar/index.mjs";
import { PUBLISH_ACT_CHECKS, CASE_DERIVATION_CHECKS, STATEMENT_ACK_CHECKS, CASE_DISCLOSURE_CHECKS } from "./checks.mjs";
import { CASE_AUTHORING_TABLES, migrateCaseAuthoring } from "./schema.mjs";
import { searchedSection } from "./searched.mjs";
import { chainsOf, materialHeld, materialRows } from "./materials.mjs";
import { flagsListed, flagsJudged, acceptedWorkRow, FLAG_SENTENCE, FLAGS_SAY } from "./accepted.mjs";
import { fmSafe, statementSha, caseDocumentText, ackFrontmatterLines, ackBodyLines, withheldWriterStated,
         CEREMONY_HIGHLIGHT_SENTENCE, NOT_SHOWN_WORDS, TENSIONS_DEPTH_STATED, tensionSide,
         SELF_ATTESTED_SENTENCE } from "./document.mjs";

export { PUBLISH_ACT_CHECKS, CASE_DERIVATION_CHECKS, STATEMENT_ACK_CHECKS, CASE_DISCLOSURE_CHECKS } from "./checks.mjs";
export { CASE_AUTHORING_SCHEMA, CASE_AUTHORING_TABLES } from "./schema.mjs";
export { searchedSection, SEARCHED_LEVEL_OUTCOMES } from "./searched.mjs";
export { caseDocumentText, statementSha, withheldWriterStated, fmSafe, ackFrontmatterLines, ackBodyLines,
         ACK_PROSE_HEAD, CASE_CITATION_WORDS, TENSION_TEMPLATES, tensionSentence, HIGHLIGHT_SENTENCE,
         CEREMONY_HIGHLIGHT_SENTENCE, NOT_SHOWN_WORDS, TENSIONS_DEPTH_STATED, tensionSide, SELF_ATTESTED_SENTENCE }
  from "./document.mjs";

/** R3: the longest authored field (the statement, the subject justification, the scope, the bias acknowledgement, and
 *  each exclusion's description and reason). */
export const COMPLETENESS_MAX = 2000;
/** R5: the two designations a case member can carry, spelled as `published_case_members.role` spells them (CASE-1),
 *  `load_bearing` first because a refusal listing them should name the one that carries the case first. */
export const MEMBER_ROLES = Object.freeze(["load_bearing", "supporting"]);
/** R17: how many subjects a case's searched section computes over. A bound rather than a scan (D-225 / REC-70); the
 *  overflow is published as `unidentified`, so a case past it reads `partial`, never `searched` over a truncated set. */
export const SEARCHED_SUBJECT_MAX = 500;
/** R20: the most acknowledgements one list names; a list that reaches it says so (`truncated`). */
export const STATEMENT_ACK_MAX = 500;
/** R38, R39 (DEC-101; K1019): the longest statement of what changed in an edition, or draft of one, in code points. */
export const WHAT_CHANGED_MAX = 8000;
/** R39: the most drafts one list names; a list that reaches it says so (`truncated`), as R20's list does. */
export const WHAT_CHANGED_DRAFTS_MAX = 500;
/** R39: the prefix of a draft's opaque id (record-core R6), every one drawn through record-core's ledger. */
export const WHAT_CHANGED_DRAFT_PREFIX = "WCD";
/** R19 (DEC-88, K1030): the longest acknowledger's words, in code points. */
export const STATEMENT_ACK_REASON_MAX = 2000;
/** R42 (DEC-111; K1119): what step one adds when the project has a notice (R41), one plain sentence until the UX design
 *  stream gives the words. */
export const NOTICE_SEALS_SENTENCE = "This project has a public notice that the group is working on it, so publishing "
  + "this edition also opens the notice's sealed weeks for the work this edition publishes.";
/** R34 (DEC-112 (4)): what step one adds, one plain sentence until the UX design stream gives the words. */
export const REPUBLISH_SENTENCE = "The published case republishes in full every document it includes, and judging whether "
  + "they may be republished, copyright included, is the group's.";
/** R16: the id chunk for the citations' grouped read, this module's own copy of `retrieval`'s (K57). */
export const SELECTION_ID_CHUNK = 64;
/** R21: the most drafts the writer read scans, the bound `review` R26 states for `case_drafts` (`REVIEW_LIST_MAX`):
 *  review is later in the order, so this is a copy of it (K57), never an import. */
export const DRAFTS_READ_MAX = 500;
/** R17: the IN lists of the searched section's reads are chunked at 50, under D-36's 100-bound-parameter ceiling. */
const SEARCHED_CHUNK = 50;
/** R40: the manifest's page, bias R18's largest, so a lens is read in as few pages as the bound allows. */
const LENS_PAGE = 2000;
/** R40: publication R12's `publishedTargets` reads at most 200 ids a call. */
const PUBLISHED_TARGETS_CHUNK = 200;

const str = (v) => String(v ?? "").trim();
/** R34: what the pre-flight throws to roll back its run of op=publish (record-core R32). */
const PREFLIGHT_ROLLBACK = Symbol("case-authoring pre-flight rollback");

/* The one constructor of a refusal with a catalogue row (DEC-49): `reason` and `code` carry the same literal, and the
   row's `check` and `translation` join the site's own `detail` and keys. */
function refusal(family, key, extra = {}) {
  const row = family[key];
  return { ok: false, reason: key, code: key, check: row.check, translation: row.translation, ...extra };
}
/* Each family's own helper, the code its literal first argument, so the DEC-49 guard judges the code at each site
   against the rows that govern it (N259, N275). */
const derivationRefusal = (key, extra) => refusal(CASE_DERIVATION_CHECKS, key, extra);
const actRefusal = (key, extra) => refusal(PUBLISH_ACT_CHECKS, key, extra);
const disclosureRefusal = (key, extra) => refusal(CASE_DISCLOSURE_CHECKS, key, extra);

export class CaseAuthoring {
  #deps;

  constructor({ storage, record, membership, host = null, inquiry = null, basisVersions = null, strength = null,
                bias = null, observations = null, reevaluation = null, publication = null, ratification = null,
                contradiction = null, provenance = null, attestation = null, capture = null, sources = null,
                networkNotices = null, extraction = null, caseImport = null, promotion = null, now = null } = {}) {
    this.sql = storage.sql;
    this.storage = storage;
    this.record = record;
    this.membership = membership;
    this.#deps = { host, inquiry, basisVersions, strength, bias, observations, reevaluation, publication, ratification,
                   contradiction, provenance, attestation, capture, sources, networkNotices, extraction, caseImport,
                   promotion };
    this.now = typeof now === "function" ? now : (precision) => stampInstant(precision);
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  get basisVersions() { return this.#deps.basisVersions ||= basisVersionsOf(this.#deps.host); }
  get strength() { return this.#deps.strength ||= strengthOf(this.#deps.host); }
  get bias() { return this.#deps.bias ||= biasOf(this.#deps.host); }
  get observations() { return this.#deps.observations ||= observationLogOf(this.#deps.host); }
  get reevaluation() { return this.#deps.reevaluation ||= reevaluationOf(this.#deps.host); }
  get publication() { return this.#deps.publication ||= publicationOf(this.#deps.host); }
  get ratification() { return this.#deps.ratification ||= ratificationOf(this.#deps.host); }
  get contradiction() { return this.#deps.contradiction ||= contradictionOf(this.#deps.host); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host); }
  get attestation() { return this.#deps.attestation ||= attestationOf(this.#deps.host); }
  get capture() { return this.#deps.capture ||= captureOf(this.#deps.host); }
  get sources() { return this.#deps.sources ||= sourcesOf(this.#deps.host); }
  get networkNotices() { return this.#deps.networkNotices ||= networkNoticesOf(this.#deps.host); }
  get extraction() { return this.#deps.extraction ||= extractionOf(this.#deps.host); }
  get promotion() { return this.#deps.promotion ||= promotionOf(this.#deps.host); }
  /* TODO(T28, until case-import merges): `caseImportOf(this.#deps.host)`. */
  get caseImport() {
    if (!this.#deps.caseImport) throw new Error("case-import is not composed on this host");
    return this.#deps.caseImport;
  }

  migrate() { migrateCaseAuthoring(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  /* The act's instant, from the clock it was given. A clock that answers no instant is carried as it answers, so the
     searched section refuses it by name (R11) rather than stamping one the clock did not give. */
  #when(precision) { const w = this.now(precision); return typeof w === "string" ? w : stampInstant(precision); }

  /* The review provider publication holds (its R23): with none registered, every door refuses and `deadAnswer()` is
     still C-87.1's answer, so R19's dead answer is one answer either way. */
  #review() { return this.publication.reviewProvider(); }

  /* The live `bundle.md` text of a held bundle, or null (blob-backed or absent): record-core R13. */
  #liveText(id) {
    const f = this.record.readFile(id, "bundle.md");
    return f && typeof f.text === "string" ? f.text : null;
  }

  /* ==========================================================================================================
   * op=publish: publishCase (R1–R18)
   *
   * THE ORDER IS THE POINT. Authoring the document CHANGES ITS HASH, so the signature can only be taken afterwards:
   * this act authors, `op=caseratify` signs (ratification). EVERY MEMBER IS JUDGED BEFORE ANY MEMBER MOVES, and every
   * refusal is asked before anything is written; the act runs as one transaction (record-core R32), so a refusal after
   * an id was drawn takes the id back and writes nothing (R11), and a caller's own transaction may roll the whole act
   * back (R18: the review copy's dry run).
   * ========================================================================================================== */
  publishCase(args = {}) {
    return this.record.transact(() => this.#publishCase(args));
  }

  /* `run` is the pre-flight's (R34): `preflight` skips reevaluation's raise, whose listeners are told synchronously and
     must not hear of an edition a rolled-back run never made, and `seen` receives what the act read, for its steps. */
  #publishCase({ target = null, targets = null, caseId = null, newCase = false, scope = "",
                 statement = "", excluded = null, subjectPosition = "",
                 subjectJustification = "", biasAcknowledgement = "",
                 project = null, roles = null, draft = null, tensionsDisclosed = null, selfAttested = null,
                 flagsDisclosed = null,
                 whatChanged = undefined, viewer = null, author = null } = {}, run = {}) {
    const seen = run.seen || {};
    const who = str(author);
    /* DEC-49 REGION is-machine-publish — R1 / C-32.6. The fence alone, before anything else is read. */
    if (!who || isMachineIdentity(who))
      return actRefusal("MACHINE_CANNOT_PUBLISH", {
        detail: "publishing puts the group's name on a case. A machine credential may prepare one and "
              + "may never author the completeness assertion or the position on putting it to its "
              + "subject, both of which are declared bias. Sign in as a member." });
    /* END DEC-49 REGION is-machine-publish */

    /* R2: the authority fences, beside the machine fence (`#authority`). */
    const auth = this.#authority(project, viewer, who);
    if (auth.ok === false) return auth;
    const { proj, gate } = auth;

    /* R3 — REC-44: THE SET. `targets` is the shape; `target` is the one-finding degenerate case (DEC-44 determination
       5), normalised here so nothing below has two arities. A comma-separated string is accepted because a query
       parameter has no arrays. */
    const set = Array.isArray(targets) ? targets
              : typeof targets === "string" && targets.trim() ? targets.split(",")
              : target ? [target] : [];
    const members = set.map((s) => str(s)).filter(Boolean);
    if (!members.length)
      return { ok: false, reason: "NO_TARGET",
               detail: "a published case is a CONTAINER over ONE OR MORE FINDINGS, scoped to the question "
                     + "that brought them together: pass targets=[<inquiry id>, ...]. One finding is legal "
                     + "and is the degenerate case (DEC-44); what is not legal is publishing nothing." };
    {
      const seen = new Set();
      for (const m of members) {
        if (seen.has(m))
          return { ok: false, reason: "DUPLICATE_MEMBER", target: m,
                   detail: `${m} appears twice in this case. A finding is in a case once — listing it twice `
                         + `would give the container two copies of one document and the ordinal no meaning.` };
        seen.add(m);
      }
    }

    const stmt = str(statement);
    const just = str(subjectJustification);
    const pos = str(subjectPosition);
    /* DEC-44 determination 2: the SCOPE is authored, never derived from the findings' titles. Completeness says what
       the case left OUT; scope says what it is ABOUT. */
    const scp = str(scope);
    /* REC-47 / DEC-46 (a): the bias acknowledgement is authored and disclosed, never a bar (DEC-20). */
    const back = str(biasAcknowledgement);
    /* DEC-49 REGION is-publish-statement — R3 / REC-64 / C-33.14. */
    if (!stmt)
      return actRefusal("NO_STATEMENT", {
        detail: "a published case states what it does NOT cover. A case silent about its own limits is "
              + "claiming to cover everything, which is the overclaim this record exists to refuse." });
    /* END DEC-49 REGION is-publish-statement */
    if (!SUBJECT_POSITIONS.includes(pos))
      return { ok: false, reason: "NO_SUBJECT_POSITION", allowed: SUBJECT_POSITIONS,
               detail: "declare the group's position on putting this case to its subject. The gate is that the "
                     + "position is DECLARED — never that contact happened, and never that the answer was "
                     + "favourable (DEC-13). Deciding not to give notice is a legitimate position and is "
                     + "declared like any other." };
    if (!just)
      return { ok: false, reason: "NO_SUBJECT_JUSTIFICATION",
               detail: "a declared position with no reasoning behind it is the checkbox this gate exists to "
                     + "refuse. Say why — including why the group chose not to give notice — and a reader "
                     + "weighs it exactly as they weigh any other declared bias." };
    if (!Array.isArray(excluded))
      return { ok: false, reason: "NO_EXCLUSION_FIELD",
               detail: "pass excluded[]. An EMPTY list is a claim — this case left nothing material out — and "
                     + "is legal; an ABSENT field is silence, and silence about what a case excludes is what "
                     + "the completeness assertion exists to refuse." };
    /* The later items' refusals go LAST, so an existing caller's diagnosis does not change under them. */
    if (!scp)
      return { ok: false, reason: "NO_SCOPE",
               detail: "a published case states its own SCOPE — what brought these findings together and what "
                     + "question the case as a whole answers. It is authored by the group and never derived "
                     + "from the findings' titles: a scope this plane wrote is not a scope the group made "
                     + "(DEC-44). Completeness says what the case left OUT; scope says what it is ABOUT." };
    if (!back)
      return { ok: false, reason: "NO_BIAS_ACKNOWLEDGEMENT",
               detail: "a published case carries the bias it was produced under, as a fact the reader weighs. "
                     + "Acknowledge it here, in the ceremony, fresh for this edition — a pre-flight checkbox "
                     + "would be the checkbox this gate exists to refuse (DEC-46). This is a DISCLOSURE and "
                     + "never a bar: declaring a bias does not stop a case being published, and nothing here "
                     + "reads WHICH bias you name (DEC-20). The only bias that disqualifies is an uncleared "
                     + "HUNCH, and that is refused by name before any signature exists." };
    const rows = [];
    for (let i = 0; i < excluded.length; i++) {
      const r = excluded[i];
      if (!r || typeof r !== "object")
        return { ok: false, reason: "BAD_EXCLUSION", ord: i, detail: `excluded[${i}] is not an object` };
      const tgt = typeof r.target === "string" && r.target.trim() !== "" ? r.target.trim() : null;
      const desc = str(r.description);
      const why = str(r.reason);
      /* C-9: target OR prose, NEVER NEITHER. A row may name something not in the record (an outstanding records
         request has no id), so a required target would force the member to invent a referent. */
      if (!tgt && !desc)
        return { ok: false, reason: "BAD_EXCLUSION", ord: i,
                 detail: `excluded[${i}] names neither a target nor a description. Every exclusion row carries `
                       + `a target id OR prose, never neither — otherwise the row asserts nothing and the `
                       + `index cannot answer "which published cases excluded this document".` };
      if (!why)
        return { ok: false, reason: "BAD_EXCLUSION", ord: i,
                 detail: `excluded[${i}] carries no reason. WHAT was left out and WHY are two statements and `
                       + `one does not stand in for the other.` };
      rows.push({ target: tgt, description: desc, reason: why });
    }
    /* The restricted frontmatter grammar has no escapes, so a quote, a backslash or a line break in an authored field
       would produce a document the parser cannot read back: refused by name rather than silently mangled. */
    for (const [name, v] of [["statement", stmt], ["subject_justification", just], ["scope", scp],
                             ["bias_acknowledgement", back],
                             ...rows.flatMap((r, i) => [[`excluded[${i}].description`, r.description],
                                                        [`excluded[${i}].reason`, r.reason]])]) {
      if (v.length > COMPLETENESS_MAX || /["\\\r\n]/.test(v))
        return { ok: false, reason: "BAD_COMPLETENESS", field: name,
                 detail: `${name} is at most ${COMPLETENESS_MAX} characters and cannot contain a quote, `
                       + `a backslash, or a newline: the restricted frontmatter grammar has no escapes` };
    }

    /* R4: every member judged before any member moves (`#judgeMembers`). */
    const judged = this.#judgeMembers(members, proj, viewer, gate);
    if (judged.ok === false) return judged;
    const { prepared } = judged;

    /* R5: the authored load-bearing partition (`#rolesOf`). */
    const partition = this.#rolesOf(prepared, roles, members);
    if (partition.ok === false) return partition;
    const { memberRoles, loadBearing } = partition;

    /* R6: the project's bar, read once, asked of each load-bearing member (`#barJudged`); the first shortfall refuses. */
    const barJudged = this.#barJudged(proj, loadBearing);
    if (barJudged.shortfalls.length) return barJudged.shortfalls[0];
    const bar = barJudged.bar;
    /* AND NOTHING IS ASKED OF THE SUPPORTING MEMBERS (Bob, on DEC-71: "The citation doesn't have to be severed"). */

    /* R12: hunch debt (`#hunchDebt`), asked of every member before the case identity is derived. */
    const hunch = this.#hunchDebt(prepared);
    if (hunch) return hunch;

    /* R31: the conflicts to disclose (`#tensionsJudged`), after R12 and before the case identity is derived. */
    const tensionsJ = this.#tensionsJudged(prepared, viewer, tensionsDisclosed);
    if (tensionsJ.refusals.length) return tensionsJ.refusals[0];
    const read = { entries: tensionsJ.entries, unread: tensionsJ.unread };
    const listed = { byCandidate: tensionsJ.byCandidate };

    /* R35 — N364 (DEC-81 items 1 and 3): EACH DOCUMENT'S GRADE AND CO-ATTESTATION, and the owner's acknowledgement of
       a load-bearing document at `EARNED_CAPTURE_CEILING` (Grade B) that is not co-attested. Read and judged before the
       case identity is derived, so a refusal draws no id and writes nothing. The case is never refused because a document
       is not co-attested. */
    const resting = this.#restingCaptures(prepared);
    const facts = new Map([...new Set(resting.map((r) => r.capture))].map((sha) => [sha, this.#captureFacts(sha)]));
    const selfJ = this.#selfAttestedJudged(resting, facts, memberRoles, selfAttested);
    if (selfJ.refusals.length) return selfJ.refusals[0];

    /* R44–R46 (DEC-112 (4)): what each member's chain reaches, and whether a load-bearing one rests on material this
       copy does not hold whole; asked before the case identity is derived, so a refusal draws no id. */
    const reached = this.#materialsJudged(prepared, memberRoles, viewer);
    if (reached.refusals.length) return reached.refusals[0];
    /* R51, R52 (DEC-96 item 4): another group's work the chains reach, its acceptance in force, then its open flags. */
    const accepted = this.#acceptedWorkJudged(reached.refs, viewer);
    if (accepted.refusals.length) return accepted.refusals[0];
    const flagsJ = this.#flagsJudged(accepted.editions, flagsDisclosed);
    if (flagsJ.refusals.length) return flagsJ.refusals[0];

    /* R7 — REC-44: THE CASE IDENTITY, DECIDED FROM THE RECORD. Name one, derive one from what the members already serve,
       or mint one; a caller never mints an identity. D-309 / DEC-72 clause 6: a finding may serve many cases, so the
       derivation is over ALL cases per member (publication R40: `published_case_members`). */
    const belongs = new Map();
    for (const id of members) {
      const rs = this.#rows(
        `SELECT DISTINCT case_id FROM published_case_members WHERE bundle_id=? ORDER BY case_id`, id);
      if (rs.length) belongs.set(id, rs.map((r) => r.case_id));
    }
    const distinct = [...new Set([...belongs.values()].flat())];
    /* THE CASE THIS ACT'S OWN UNSIGNED PREPARATION NAMES (R7's third route), consulted after the published record and
       only so a publisher who prepares again lands on the same case rather than on a second minted id. Since D-442 a
       member's bytes name no case, so the preparation is read where it lives: the unsigned case document pinning the
       member at its current bytes (publication R4's `prepared`). */
    const preparedCases = [...new Set(prepared.map((p) => p.preparedIn).filter(Boolean))];
    /* DEC-49 REGION case-identity-derivation — C-44.1. The line is drawn at MORE THAN ONE CANDIDATE: with none the act
       mints, with one the derivation reads a fact, `caseId` answers the question one way and `newCase` the other.
       With two there is no default that is anybody's meaning, and that is what this refuses. */
    if (newCase && str(caseId))
      return derivationRefusal("CASE_IDENTITY_AMBIGUOUS", {
        cases: [str(caseId)],
        members: [...belongs].map(([id, cs]) => ({ target: id, cases: cs })),
        detail: `this act both NAMES case ${str(caseId)} and asks for a new case to be minted. `
              + `Those are opposite instructions and the record will not choose between them: name the `
              + `case to publish a further edition of it, or ask for a new one, not both.` });
    if (!newCase && !str(caseId) && distinct.length > 1)
      return derivationRefusal("CASE_IDENTITY_AMBIGUOUS", {
        cases: distinct.slice().sort(),
        members: [...belongs].map(([id, cs]) => ({ target: id, cases: cs })),
        detail: `these findings already serve ${distinct.length} published cases `
              + `(${distinct.slice().sort().join(", ")}), and this act did not say which case it is `
              + `publishing. A finding can serve many cases (DEC-72 clause 6), so membership no longer `
              + `says which case this is: name the case to publish a further edition of it, or say so `
              + `and a new case is minted. The record will not choose for you.` });
    /* END DEC-49 REGION case-identity-derivation */
    /* `newCase` short-circuits both derivation routes, the prepared-bytes claim included, and mints. */
    let theCase = newCase ? null
                : str(caseId) || distinct[0]
                || (preparedCases.length === 1 ? preparedCases[0] : null) || null;
    if (caseId && !this.#one(`SELECT case_id FROM published_cases WHERE case_id=? LIMIT 1`, theCase))
      return { ok: false, reason: "NO_SUCH_CASE", caseId: theCase,
               detail: `no published case answers to ${theCase}. A case identity is minted by this act and `
                     + `carried in the signed bytes; it is never taken from a caller, because an identity a `
                     + `caller can hand us is one a caller can invent.` };
    /* R8 — D-442: ALREADY_A_CASE_MEMBER IS ASKED OF THE CASE THIS ACT PUBLISHES, AND OF NO OTHER. The same bytes may be
       pinned by several cases (rule 12), and an edition of case X recording this conclusion says nothing about case Y.
       An unsigned preparation still refuses, whichever case it is of. Asked before an id is minted. */
    for (const p of prepared) {
      const same = p.warrant ? p.warrant.same.filter((e) =>
        (theCase && e.case_id === theCase) || e.state === "prepared") : [];
      if (same.length)
        return { ok: false, reason: "ALREADY_A_CASE_MEMBER", target: p.id, from: p.b.current_state,
                 project: proj, relationship: p.conclusion.relationship,
                 recorded_by: same.map((e) => ({ case_id: e.case_id, edition: e.edition, state: e.state })),
                 detail: "this finding is already a member of a published case at the version it stands "
                       + "at now, and that edition already records the conclusion this act would record "
                       + "(the publishing project's relationship, its reading and its claim — "
                       + "INVESTIGATIVE-SESSION.md §7.1 item 9), so there is nothing here a new edition "
                       + "would say differently. An EDITION IS A SEPARATE DOCUMENT (DEC-12): it carries its "
                       + "own conclusion, its own falsifier and its own freshly authored completeness, and "
                       + "minting one that says what an edition already says would make the edition number "
                       + "a count of publish calls rather than a record of what changed. Two routes lead to "
                       + "a new edition, and each leaves a reader able to see what moved: the project "
                       + "withdraws its conclusion and concludes again (op=withdrawconclusion, then "
                       + "op=conclude&project=), or the finding is reopened (op=reopen), worked, concluded "
                       + "again and published — the route DEC-12 built." };
    }
    /* R9 — REC-217 / §3 rule 13 (BOB #33): THE DRAFT THIS ACT PUBLISHES, NAMED BY THE PUBLISHER. The link is an act,
       recorded with its author and time on the case document row and in words, so the owner who signs signs a stated
       link. Three refusals, each for a link that would be false, asked before an id is minted. The draft door is the
       review provider's (publication R23); with none, every `draft=` is C-44.3. */
    const draftNamed = str(draft) || null;
    let boundDraft = null;
    let namedDraftRow = null;
    if (draftNamed) {
      const review = this.#review();
      const d = review.draftForMember(draftNamed, viewer);
      const predicted = theCase ? this.#highestEdition(theCase) + 1 : 1;
      /* DEC-49 REGION is-publish-draft-found */
      if (!d || d.project_id !== proj)
        return derivationRefusal("PUBLISH_DRAFT_NOT_FOUND", { draft: draftNamed, project: proj,
          detail: `no draft of ${proj} that you can read answers to ${draftNamed}. A draft you cannot read is `
                + `answered exactly as one that does not exist. Name the draft this case was prepared in, or `
                + `publish without draft= and its readings are stated as undetermined.` });
      /* END DEC-49 REGION is-publish-draft-found */
      const di = review.draftIdentity(d);
      /* DEC-49 REGION is-publish-draft-this-case */
      if (di.caseId ? (di.caseId !== theCase || di.edition !== predicted) : predicted !== 1)
        return derivationRefusal("PUBLISH_DRAFT_NOT_THIS_CASE", { draft: draftNamed,
          draft_case: di.caseId ?? null, draft_edition: di.edition,
          case_id: theCase ?? null, edition: predicted,
          detail: `draft ${draftNamed} is prepared for ${review.caseIdentitySentence(di.caseId, di.edition)}, and `
                + `this act publishes ${theCase ? `edition ${predicted} of ${theCase}` : "a new case"}. Naming it `
                + `would bind its readings to a case they were not given for. Publish the case the draft names `
                + (di.caseId ? `(case=${di.caseId})` : `(newCase=true)`) + `, or name the draft of this one.` });
      /* END DEC-49 REGION is-publish-draft-this-case */
      /* publication R40's read contract: one draft, one case edition it produced. */
      const already = this.#one(`SELECT case_id, edition FROM case_documents WHERE draft_id=?
                                   AND NOT (case_id IS ? AND edition=?) LIMIT 1`, d.draft_id, theCase ?? null, predicted);
      /* DEC-49 REGION is-publish-draft-bound */
      if (already)
        return derivationRefusal("PUBLISH_DRAFT_ALREADY_BOUND", { draft: draftNamed,
          bound_to: { case_id: already.case_id, edition: Number(already.edition) },
          detail: `draft ${draftNamed} was already named as the draft of edition ${already.edition} of `
                + `${already.case_id}, and its readings bound to that case at that act. One draft produces one `
                + `case: binding its readings to a second would list the same readers under two productions.` });
      /* END DEC-49 REGION is-publish-draft-bound */
      boundDraft = d.draft_id;
      namedDraftRow = d;
    }
    const minted = !theCase;
    /* REC-151: a NEW case's id is OPAQUE (record-core R6), unique against every table a case id lives in (publication
       R40) and against the minter's own ledger. Drawn inside this act's transaction, so a later refusal takes it back. */
    if (minted) {
      theCase = this.record.mintOpaqueId("CASE", this.#when("second").slice(0, 4), "", (id) =>
        !!(this.#one(`SELECT 1 FROM cases WHERE case_id=?`, id)
          || this.#one(`SELECT 1 FROM published_cases WHERE case_id=? LIMIT 1`, id)
          || this.#one(`SELECT 1 FROM case_documents WHERE case_id=? LIMIT 1`, id)
          || this.#one(`SELECT 1 FROM published_case_members WHERE case_id=? LIMIT 1`, id)));
      /* N322: no free id is record-core's one answer (its R62, C-59.6), never worded here. */
      if (!theCase) return mintExhausted("CASE");
    }

    /* R7 — CASE-2 / DEC-72: A CASE NEVER CHANGES PROJECT. The bar is read from the publishing project at act time, so a
       case that could change hands is a case whose standard of evidence changes with nobody authoring the change. The
       ratified row is asked first (publication R40: `cases`), then the case's own unsigned preparation, whose
       `case_project` is the project that prepared it. */
    const ownedBy = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, theCase);
    const claimedProject = ownedBy ? ownedBy.project_id : this.#preparedProject(theCase);
    if (claimedProject && claimedProject !== proj)
      return { ok: false, reason: "CASE_BELONGS_TO_ANOTHER_PROJECT", caseId: theCase,
               project: proj, owner: claimedProject, ratified: !!ownedBy,
               detail: `case ${theCase} is ${claimedProject}'s production, and a case does not change hands `
                     + `between editions (DEC-72). The bar a case is held to is read from its publishing `
                     + `project at the moment of publication, so letting edition 2 name a different project `
                     + `would change this case's standard of evidence with nobody authoring the change. `
                     + `Publish the new edition as ${claimedProject}, or publish this material as a new case.` };

    /* R13 — DEC-12 as DEC-44 rehomes it: the CASE's edition is its highest published edition plus one; each member's
       own edition is its own (CASE-5: the next on its own published chain, unless R13's crossed arm below). */
    const edition = this.#highestEdition(theCase) + 1;
    /* R38 (DEC-101 (1)(2)): an edition above 1 says what changed in it and why, judged once the edition is known and
       before anything is written (`#whatChangedJudged`). A first edition carries none. */
    const changed = edition > 1 ? this.#whatChangedJudged(whatChanged, theCase, edition) : null;
    if (changed && changed.ok === false) return changed;
    const memberEditions = new Map();
    for (const id of members) {
      const mt = this.#one(`SELECT MAX(edition) AS m FROM published_bundles WHERE bundle_id=?`, id);
      memberEditions.set(id, (mt && mt.m != null ? Number(mt.m) : 0) + 1);
    }

    /* R10 — C-21.1 AT CASE ALTITUDE, before anything moves: against the previous RATIFIED edition of THIS case, compared
       through ratification's one shape (`completenessFields`). The scope is not compared. Two refusal names, because a
       reprinted statement and a reprinted acknowledgement of bias are two different mistakes; the check is C-21.1.
       Each code is the literal at its own return (N242), never looked up. */
    const priorCase = this.#one(
      `SELECT edition, completeness, bias_acknowledgement FROM published_cases
       WHERE case_id=? AND edition<? AND ratified_at IS NOT NULL ORDER BY edition DESC LIMIT 1`,
      theCase, edition);
    const priorCompleteness = priorCase && priorCase.completeness ? JSON.parse(priorCase.completeness) : null;
    if (priorCompleteness) {
      const now = { ...completenessFields({ completeness: { statement: stmt, subject_justification: just },
                                            completeness_excluded: rows }),
                    bias_acknowledgement: back };
      const was = { ...priorCompleteness, bias_acknowledgement: priorCase.bias_acknowledgement ?? null };
      const LABEL = { statement: "statement", subject_justification: "the subject-position justification",
                      excluded: "the exclusion list" };
      const carried = (k) => now[k] != null && was[k] != null && now[k] === was[k];
      for (const k of Object.keys(LABEL))
        if (carried(k))
          return { ok: false, reason: "COMPLETENESS_CARRIED_FORWARD", field: k, edition,
                   check: "C-21.1", caseId: theCase, prior: priorCase.edition,
                   detail: `${LABEL[k]} is byte-identical to edition ${priorCase.edition}'s. A completeness claim `
                         + `carried forward unchanged is a checkbox, and C-21.1 exists to refuse it: every edition is `
                         + `a separate document and states its own limits in its own words, as of its own date. If `
                         + `nothing about the limits changed, say THAT, as of this edition.` };
      if (carried("bias_acknowledgement"))
        return { ok: false, reason: "BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD", field: "bias_acknowledgement", edition,
                 check: "C-21.1", caseId: theCase, prior: priorCase.edition,
                 detail: `the bias acknowledgement is byte-identical to edition ${priorCase.edition}'s. An `
                       + `acknowledgement of the bias a case was produced under is AUTHORED at the moment of export `
                       + `and never carried forward (DEC-46): reprinting the last edition's sentence is evidence `
                       + `nobody looked. The lens itself may well be unchanged — what must be fresh is what it means `
                       + `for THIS edition's findings. Say that, as of this edition. Declaring a bias never blocks `
                       + `publication (DEC-20).` };
    }

    const when = this.#when("second");
    const written = [];
    /* R13, R23 — D-442 / rule 12: PUBLISHING WRITES NOTHING ON A MEMBER FINDING. The pin is the `bundle_sha` each
       member has AS PREPARED; everything the old promotion wrote into a member is stated once, in the case document.
       A member's own edition is the published edition of that sha when another case already carried it across (one
       document, one number), else the next on its own chain. */
    const frozen = new Map();
    for (const p of prepared) {
      const { id: memberId, b, fm } = p;
      /* R24 / DEC-21: both axis objects, derived and frozen, per finding; never composed. MK-2: `testimony` is frozen
         only when it carries something (graded, or undetermined). */
      const pair = this.strength.strengthOf(memberId);
      const frozenAxes = STRENGTH_AXES.filter((axis) =>
        axis !== "testimony" || (pair[axis] && pair[axis].state !== "unrated"));
      const frozenGrounds = frozenAxes.flatMap((axis) => (pair[axis].grounds ?? []).map((g) => [axis, g]));
      const already = this.#one(`SELECT edition FROM published_bundles WHERE bundle_id=? AND bundle_sha=?`,
                                memberId, p.bundleSha);
      const memberEdition = already ? Number(already.edition) : memberEditions.get(memberId);
      frozen.set(memberId, { edition: memberEdition, pair, axes: frozenAxes, grounds: frozenGrounds,
                             crossed: !!already });
      written.push({ target: memberId, state: b.current_state, case_id: theCase, case_edition: edition,
                     bundleSha: p.bundleSha,
                     promoted: false,
                     title: fm.title ?? null,
                     edition: memberEdition,
                     strength: frozenAxes.map((axis) => ({ axis, state: pair[axis].state,
                       grade: pair[axis].grade,
                       weakest: pair[axis].weakest ? pair[axis].weakest.target_id : null })),
                     frozen_in: "case_document",
                     required: bar,
                     role: (memberRoles.find((m) => m.target === memberId) || {}).role ?? null,
                     /* REC-157 / §7.1 item 9: why an edition was minted over bytes a case already pins. */
                     ...(p.warrant ? { edition_warranted: {
                         because: "the_publishing_projects_conclusion_moved",
                         pinned_editions: p.warrant.pinned.map((e) => ({
                           case_id: e.case_id, edition: e.edition, state: e.state, recorded: e.recorded })) } }
                       : {}),
                     /* R15 — REC-17 / DEC-12: a NEW edition of the finding above 1 surfaces the re-evaluation
                        obligation on everything whose basis names it (reevaluation R7); bytes another case already
                        carried across are the edition a leg already rests on, so nothing moved under anybody. */
                     ...(!already && memberEdition > 1
                       ? { reevaluation: run.preflight
                           ? { source: "edition", edition: memberEdition, raised_when: "published" }
                           : this.reevaluation.raise({ target: memberId, source: "edition", since: when,
                                                      edition: memberEdition, viewer }) }
                       : {}) });
    }

    /* R14 — CASE-5b / DEC-72: THE CASE DOCUMENT, AUTHORED HERE, after every member's pin is known, naming the whole
       roster at its hashes in one statement. It is stored UNSIGNED (publication R21) and commits nothing: no row
       exists in `cases`, `published_cases` or `published_case_members` until `op=caseratify`. */
    const pinOf = new Map(written.map((w) => [w.target, w.bundleSha]));
    /* R11, R17 — COMPUTED HERE AND ONLY HERE: the signature covers `doc_sha`, taken over these bytes, so computing the
       section later would rewrite what the member reviewed. A section that cannot be computed honestly stops the
       ceremony rather than publishing a blank. */
    const searched = this.#searchedForCase(members, when);
    if (!searched.ok)
      return { ok: false, reason: "CASE_SEARCHED_UNCOMPUTABLE", code: "CASE_SEARCHED_UNCOMPUTABLE", case: theCase, edition,
               detail: `the case document's searched section could not be computed: ${searched.why}. `
                     + `A case document publishes what was looked for beside what it claims to cover `
                     + `(D-196); it does not publish the claim with the record of the looking left blank.` };
    /* R37: what may be stated of the source of each capture a chain reaches (R35's, one level deep, and every document
       R45 lists), read after the last refusal (reading a source mints its id, sources R1, inside this act's
       transaction). R46, R48 (K1316): a capture R37 states "Withheld" is off-the-record. */
    const documentsReached = reached.materials.filter((m) => m.kind === "document").map((m) => m.sha);
    const sourceRows = this.#sourcesStated([...new Set([...facts.keys(), ...documentsReached])], viewer);
    const withheld = CaseAuthoring.#withheld(sourceRows);
    /* MK-7 / §4.3: each observation this edition reaches (basis-versions R39), at the level its author chose, or
       UNCHOSEN (publication R17); and, K1316, each off-the-record capture a chain reaches, at its attesting member's
       level (publication R60), its row keyed by the capture: the section is written when either is reached. */
    const reach = this.basisVersions.testimonyReach(members);
    const observations = [...new Set([...reach.self, ...reach.via.map((v) => v.observation)])];
    const attributions = this.publication.attributionStatements(theCase, edition, proj,
      [...observations, ...documentsReached.filter((sha) => withheld.has(sha))]);
    const attributionOf = new Map((Array.isArray(attributions) ? attributions : [])
      .map((r) => [r.capture ?? r.observation, r]));
    /* R48: a member credited at `cover` or `name` is named as they chose; at `group`, `project` or none yet, never by
       handle, key or signature. */
    const named = (sha) => { const l = (attributionOf.get(sha) || {}).level; return l === "cover" || l === "name"; };
    /* R35, R36: each (member, capture) row, the owner's acknowledgement (the `author` stamp at this act) on every row of
       an acknowledged capture, and each capture's signed accounts, an off-the-record one's text only unless its member
       chose to be named (R48). */
    const accountsCarried = new Set();
    const captureRows = resting.map((r) => {
      const { accounts_read, ...f } = facts.get(r.capture);
      const ack = selfJ.byCapture.get(r.capture) || null;
      /* A capture's accounts ride on its first row only, so each is written once (publication R20 reads them back by
         capture). */
      const first = !accountsCarried.has(r.capture);
      accountsCarried.add(r.capture);
      const hidden = withheld.has(r.capture) && !named(r.capture);
      return { ...f, member: r.member, self_attested_only: !!ack,
               ...(ack ? { acknowledgement: { reason: ack.reason, acknowledged_by: who, at: when,
                                              sentence: SELF_ATTESTED_SENTENCE } } : {}),
               accounts: !first ? [] : hidden ? accounts_read.map((x) => ({ ...x, by: null, signature: null })) : accounts_read };
    });
    /* R45 (K1134 Q6, BOB's decision 15): each material a chain reaches and its attestations. */
    const factsOf = (sha) => { if (!facts.has(sha)) facts.set(sha, this.#captureFacts(sha)); return facts.get(sha); };
    const group = (() => { const f = this.promotion.fact("producingGroup"); return f && f.ok ? f.value ?? null : null; })();
    const materialBlocks = materialRows(reached.materials, { project: proj, group, at: when, facts: factsOf,
      origin: (sha) => withheld.has(sha) ? null : (this.#one(`SELECT address FROM captured_locators WHERE capture_sha=?
                         AND address NOT LIKE 'knock:%' ORDER BY first_retrieved, address LIMIT 1`, sha) || {}).address ?? null,
      registered: (sha) => this.#one(`SELECT bundle_id, registered FROM register WHERE capture_sha=?`, sha),
      member: (m, f) => {
        const attr = attributionOf.get(m.kind === "observation" ? m.ref : m.sha) || null;
        if (m.kind === "observation")
          return [{ by: attr ? attr.shown ?? null : null, level: attr ? attr.level ?? null : null, at: null, signature: null }];
        const accounts = f && Array.isArray(f.accounts_read) ? f.accounts_read : [];
        if (!withheld.has(m.sha)) return accounts.map((x) => ({ by: x.by, level: null, at: x.at, signature: x.signature }));
        const level = attr ? attr.level ?? null : null, open = named(m.sha);
        const shown = open ? attr.shown ?? null : null;
        return accounts.length ? accounts.map((x) => ({ by: shown, level, at: x.at, signature: open ? x.signature : null }))
                               : [{ by: shown, level, at: null, signature: null }];
      } });
    /* R54 (K1315): each reached finding's grading facts and relied-on passages, signed with the document. */
    const findingFacts = this.#findingFacts(reached.findings, viewer);
    /* R52: each open flag disclosed, the owner's words marked as the owner's, acknowledged by the `author` stamp. */
    const flagRows = flagsJ.open.map((f) => ({ ref: f.ref, edition: f.edition, flag: f.flag, issue: f.issue,
      flagged_at: f.at, words: flagsJ.byFlag.get(f.flag).words, acknowledged_by: who, acknowledged_at: when }));

    /* REC-135: the conclusion each member rests on, from the SAME answer the NOT_CONCLUDED gate decided on. */
    const conclusionRows = prepared.map((p) => ({ target: p.id, ...p.conclusion }));
    /* D-84 — THE BIAS MANIFEST IN FORCE, STAMPED BY THE PLANE AND FROZEN (bias R13–R18), for the project's scope READ AS
       THE PLANE (`admin`): the manifest is a fact about the project's scope, and a reader's sight must not turn it into
       "no manifest was in force". `limit: 1` because the stamp needs the pairs and the hash, which covers the whole set
       before any bound. */
    const lens = this.bias.biasManifest({ scope: "project", scopeId: proj, viewer: "admin", limit: 1 });
    const manifest = {
      /* REC-187: `null` is the manifest's UNDETERMINED, carried as null with its own sentence (R26). */
      in_force: lens.in_force === null ? null : lens.in_force === true,
      scope: "project", scope_id: proj,
      statements_sha: lens.in_force === true ? (lens.statements_sha ?? null) : null,
      bundles: (lens.in_force === true && Array.isArray(lens.bundles) ? lens.bundles : [])
        .map((x) => ({ bundle_id: x.bundle_id, revision: x.revision, scope: x.scope })),
      lock_violations: Array.isArray(lens.lock_violations) ? lens.lock_violations.length : 0,
      stated: lens.in_force === true
        ? `the effective bias set in force for ${proj} at publication, frozen here and never recomputed`
        : lens.in_force === null ? String(lens.stated) : "no manifest was in force",
      /* REC-219 / §3 rule 18: every adoption whose pin is a PROPOSED revision, in all three lens states, naming the
         bundle, the revision, the scope and its own state, never who adopted it (§3 rule 7). */
      pins_proposed: (Array.isArray(lens.pins_proposed) ? lens.pins_proposed : [])
        .map((x) => ({ bundle_id: x.bundle_id, revision: x.revision, scope: x.scope,
                       pinned_state: x.pinned_state ?? null })),
    };
    /* R40 — DEC-103: the lens it was produced under, every statement of the manifest frozen above, read at this act. */
    const lensStatements = this.#lensStatements(proj);
    /* R16 — REC-219 / D-579(a): the project's citation edges, with the version each was made against. */
    const citations = this.#caseCitations(proj);
    /* R21 — REC-212 / §3 rule 13: WHO WROTE THE SENTENCE, established before the list is read, because it decides what
       the list may contain (a reading by the writer is not a second reading). */
    const writer = this.#statementWriter(proj, theCase, edition, stmt, who, namedDraftRow);
    /* R9 / REC-217: the link this act makes, when the publisher named a draft. */
    const draftLink = boundDraft ? { draft: boundDraft, by: who, at: when } : null;
    /* R20 — D-150 / §3 rule 11: who acknowledged this statement, read at the act that authors the document the owner
       signs, so the list is inside the signature. None is required, and none is ever a gate. */
    const acks = this.statementAcknowledgements(proj, theCase, edition, stmt, who, writer, null, draftLink);
    /* R41 (DEC-111): the project reference, read at this act from the project's notice. */
    const workingOn = this.#workingOn(proj);
    const docText = caseDocumentText({
      caseId: theCase, edition, project: proj, workingOn, scope: scp, bias: back, bar,
      roster: members, roles: memberRoles, pins: pinOf,
      statement: stmt, position: pos, justification: just, excluded: rows,
      author: who, at: when, searched, conclusions: conclusionRows,
      statementBy: writer.by, statementByStated: writer.stated,
      frozen, manifest, acks, citations,
      attributions,
      /* R31: each entry, the owner's words marked as the owner's, the acknowledgement the `author` stamp at this act. */
      tensions: read.entries.map((e) => ({ ...e, words: listed.byCandidate.get(e.candidate).words,
                                           acknowledged_by: who, acknowledged_at: when })),
      tensionsUnread: read.unread,
      captures: captureRows, sources: sourceRows,
      /* R38: the statement as the member signs it, with the R39 draft it began as and whether its words were kept. */
      whatChanged: changed ? { text: changed.text, began_as: changed.began_as, draft: changed.draft,
                               adopted_as_drafted: changed.adopted_as_drafted } : null,
      /* R40: the frozen manifest's statements, every page, each citation printed or withheld. */
      lens: lensStatements,
      /* R43 (DEC-112 (3)): the versions the owner signs under. */
      method: { grading: GRADING_METHOD_VERSION, checks: CATALOG_VERSION },
      /* R45, R51, R52, R54. */
      materials: materialBlocks, group, accepted: { rows: accepted.rows, flags: flagRows },
      grading: findingFacts.grading, passages: findingFacts.passages,
    });
    const docBytes = new TextEncoder().encode(docText);
    /* publication R21: stored unsigned, replacing an unsigned document of this case edition and never a signed one; the
       exclusions are projected in the same write. What this act answers with is what the store holds after the call. */
    const stored = this.publication.storeCaseDocument({ caseId: theCase, edition, text: docText, author: who, at: when,
                                                        draft: boundDraft });
    /* R34's steps read what this act read, from the same values (never a second reading). */
    Object.assign(seen, { workingOn, excluded: rows, searched, manifest, bias: back, captures: captureRows, sources: sourceRows,
                          materials: materialBlocks, accepted: accepted.rows, flags: flagRows,
                          tensions: read.entries, memberEditions: [...frozen].map(([target, z]) =>
                            ({ target, edition: z.edition, crossed: z.crossed })) });

    return { ok: true, caseId: theCase, minted, edition,
             caseDocument: { case_id: theCase, edition, doc_sha: stored ? stored.doc_sha ?? null : null,
                             bytes: docBytes.length,
                             read: `op=casedocument&case=${theCase}&edition=${edition}` },
             /* THE SET, in the order the member published it. */
             findings: written,
             /* DEC-44 determination 5: the one-finding case answers `target`, `bundleSha` and `state` at the top as it
                always did; a case of two answers neither, so no caller reads one member's sha as the case's. */
             ...(written.length === 1 ? { target: written[0].target, bundleSha: written[0].bundleSha,
                                          state: written[0].state } : {}),
             scope: scp,
             project: proj, required: bar,
             roles: memberRoles,
             /* REC-47: BESIDE the completeness block, not inside it (DEC-46). */
             bias_acknowledgement: back,
             bias_manifest: manifest,
             case_citations: citations,
             /* R31: what the document discloses, as it states it (R33: a highlighted one carries its seen side only). */
             tensions: read.entries.map((e) => ({ ...e, words: listed.byCandidate.get(e.candidate).words,
                                                  acknowledged_by: who, acknowledged_at: when })),
             tensions_highlighted: read.entries.filter((e) => e.unseen_other_side).length,
             tensions_legs_unread: read.unread,
             completeness: { statement: stmt, subject_position: pos, subject_justification: just,
                             author: who, at: when, excluded: rows.length,
                             statement_sha: acks.statementSha, acknowledgements: acks.rows,
                             acknowledgements_truncated: acks.truncated,
                             ...(acks.byAuthor ? { acknowledgements_by_author_not_listed: acks.byAuthor } : {}),
                             statement_by: writer.by, statement_by_stated: writer.stated,
                             ...(acks.byWriter ? { acknowledgements_by_statement_writer_not_listed: acks.byWriter } : {}),
                             ...(acks.withheldWriterUndetermined
                               ? { acknowledgements_withheld_writer_undetermined: acks.withheldWriterUndetermined }
                               : {}),
                             ...(acks.unbound ? { acknowledgements_unbindable_to_this_case: acks.unbound } : {}),
                             ...(draftLink ? { draft: { draft_id: draftLink.draft, named_by: draftLink.by,
                                                        named_at: draftLink.at,
                                                        acknowledgements_bound: acks.boundByLink } } : {}),
                             ...(acks.unboundWriterUndetermined
                               ? { acknowledgements_unbindable_writer_undetermined: acks.unboundWriterUndetermined }
                               : {}) },
             author: who, at: when, weight: "single",
             /* THERE IS NO CASE-LEVEL `strength` KEY AND THERE MUST NEVER BE ONE (R24). */
             next: `review the CASE DOCUMENT (op=casedocument&case=${theCase}&edition=${edition}) and `
               + `ratify it (op=caseratify): it carries the case's scope, its completeness assertion, its `
               + `bias acknowledgement, its standard of evidence, the whole roster PINNED AT THE VERSION `
               + `HASHES each finding has now, and each member's own edition and frozen strength as this `
               + `case reads it — and your signature over it is what commits them. Nothing was written on `
               + `any finding (BIO_Publication_v0_1.md §3 rule 12). `
               + (written.length === 1
                 ? `Then ratify the finding itself (op=ratify): it is signed on its own bytes because the `
                 + `finding is the unit of truth.`
                 : `Then ratify EACH of these ${written.length} findings (op=ratify): every finding is signed `
                 + `on its own bytes because the finding is the unit of truth, and this case edition becomes `
                 + `servable as a container when the last of them lands.`) };
  }

  /** R38 (DEC-101 (1)(2); K1019, K1025): the "What changed" statement of an edition above 1, `{text, draft?}`. Absent, not
   *  a string or blank is `NO_WHAT_CHANGED`; over `WHAT_CHANGED_MAX` characters (code points) `BAD_WHAT_CHANGED`; a
   *  named `draft` must be one of this case's R39 drafts, else `NO_SUCH_WHAT_CHANGED_DRAFT`. Codes without catalogue
   *  rows (R29 names none). Answers the refusal or `{ok: true, text, began_as, draft, adopted_as_drafted}`: with a draft,
   *  `machine_draft`, its id, and whether `text` is its words unchanged; without one, `member`, null, null
   *  (`case-grammar` R8). */
  #whatChangedJudged(whatChanged, caseId, edition) {
    const wc = whatChanged && typeof whatChanged === "object" && !Array.isArray(whatChanged) ? whatChanged : null;
    const text = wc && typeof wc.text === "string" ? wc.text : null;
    if (text === null || !text.trim())
      return { ok: false, reason: "NO_WHAT_CHANGED", caseId, edition,
               detail: `edition ${edition} of ${caseId} must say what changed in it since the edition before, and why `
                     + `(whatChanged: {text}): a reader of a later edition is owed the difference in the group's own `
                     + `words, not left to compare two documents (DEC-101). A first edition carries none. Nothing was `
                     + `written.` };
    const length = [...text].length;
    if (length > WHAT_CHANGED_MAX)
      return { ok: false, reason: "BAD_WHAT_CHANGED", caseId, edition, length, max: WHAT_CHANGED_MAX,
               detail: `what changed in this edition is at most ${WHAT_CHANGED_MAX} characters, and this statement is `
                     + `${length}. Say it shorter. Nothing was written.` };
    const named = wc.draft == null ? "" : String(wc.draft).trim();
    if (!named) return { ok: true, text, began_as: "member", draft: null, adopted_as_drafted: null };
    const d = this.#one(`SELECT draft_id, text FROM what_changed_drafts WHERE draft_id=? AND case_id=?`, named, caseId);
    if (!d)
      return { ok: false, reason: "NO_SUCH_WHAT_CHANGED_DRAFT", caseId, edition, draft: named,
               detail: `no draft of ${caseId}'s statement of what changed answers to ${named} `
                     + `(op=whatchangeddrafts&case=${caseId} lists them). Name one of them, or write the statement in `
                     + `your own words (whatChanged: {text}) and publish again. Nothing was written.` };
    return { ok: true, text, began_as: "machine_draft", draft: d.draft_id, adopted_as_drafted: text === d.text };
  }

  /* ==========================================================================================================
   * op=whatchangedpropose, op=whatchangeddrafts: drafts of a new edition's statement (R39; DEC-101 (1), DEC-84 (14))
   *
   * A DRAFT IS NEVER A STATEMENT. Any credential may propose one, a machine's labelled machine work
   * (`record-grammar`'s `proposalLabel(proposedBy, "edition_statement")`, its R43); it becomes the edition's statement
   * only when a member adopts or rewrites it at op=publish (R38), which records the draft it began as and whether its
   * words were kept. Drafts are append-only: nothing here updates or removes one.
   * ========================================================================================================== */

  /* R39: the published case `viewer` may see, or the one refusal for every other (R27: a case not published and one
     whose project the viewer may not see answer alike). Published is a ratified edition (publication R40's `cases`,
     written at the first ratification); sight is of the case's project, through membership's one rule (its R43). */
  #caseInSight(caseId, viewer) {
    const id = str(caseId);
    const row = id ? this.#one(`SELECT project_id FROM cases WHERE case_id=?`, id) : null;
    const gate = viewerPredicate(viewer);
    const seen = row && gate.scope !== "DENY"
      && !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, row.project_id, ...gate.args);
    if (seen) return { ok: true, caseId: id };
    return { ok: false, reason: "NO_SUCH_CASE",
             detail: "no published case you can see answers to that id. A case not yet published, and one you cannot "
                   + "see, are answered alike. Nothing was written." };
  }

  /** R39: store a draft of a new edition's statement of what changed in `case`, labelled by
   *  `proposalLabel(proposedBy, "edition_statement")`. Refusals, in order: `NO_SUCH_CASE`; `text` not a string, empty
   *  after trimming, or over `WHAT_CHANGED_MAX` code points `BAD_WHAT_CHANGED`. Each writes nothing. Answers
   *  `{ok: true, draft: {id, case, text, label, at}}`. */
  proposeWhatChanged({ case: caseId = null, text = undefined, proposedBy = null, viewer = null } = {}) {
    const seen = this.#caseInSight(caseId, viewer);
    if (seen.ok === false) return seen;
    const length = typeof text === "string" ? [...text].length : null;
    if (length === null || !text.trim() || length > WHAT_CHANGED_MAX)
      return { ok: false, reason: "BAD_WHAT_CHANGED", case: seen.caseId, length, max: WHAT_CHANGED_MAX,
               detail: `a draft of what changed in an edition is words, at most ${WHAT_CHANGED_MAX} characters: `
                     + (length === null ? "none were given" : !text.trim() ? "the words given were blank"
                       : `the words given are ${length} characters`) + `. Nothing was written.` };
    const by = proposedBy == null || !String(proposedBy).trim() ? null : String(proposedBy).trim();
    const label = proposalLabel(by, "edition_statement");
    return this.record.transact(() => {
      const at = this.#when("millisecond");
      const id = this.record.mintOpaqueId(WHAT_CHANGED_DRAFT_PREFIX, at.slice(0, 4), "", (x) =>
        !!this.#one(`SELECT 1 AS x FROM what_changed_drafts WHERE draft_id=?`, x));
      if (!id) return mintExhausted(WHAT_CHANGED_DRAFT_PREFIX);
      this.sql.exec(`INSERT INTO what_changed_drafts (draft_id, case_id, text, proposed_by, label, at)
                     VALUES (?,?,?,?,?,?)`, id, seen.caseId, text, by, JSON.stringify(label), at);
      return { ok: true, draft: { id, case: seen.caseId, text, label, at },
               next: `a member adopts it as written, or rewrites it, at op=publish (whatChanged: {text, draft: "${id}"}); `
                   + `until then it is a draft and never the group's statement` };
    });
  }

  /** R39: the drafts of `case`'s statement of what changed, oldest first, each `{id, text, label, at}`, at most
   *  `WHAT_CHANGED_DRAFTS_MAX` (`truncated` when there are more). `NO_SUCH_CASE` as R39's proposal answers it. Writes
   *  nothing. */
  whatChangedDrafts({ case: caseId = null, viewer = null } = {}) {
    const seen = this.#caseInSight(caseId, viewer);
    if (seen.ok === false) return seen;
    const rows = this.#rows(`SELECT draft_id, text, label, at FROM what_changed_drafts WHERE case_id=?
                             ORDER BY seq LIMIT ?`, seen.caseId, WHAT_CHANGED_DRAFTS_MAX + 1);
    const truncated = rows.length > WHAT_CHANGED_DRAFTS_MAX;
    return { ok: true, case: seen.caseId, truncated,
             drafts: rows.slice(0, WHAT_CHANGED_DRAFTS_MAX).map((r) => ({ id: r.draft_id, text: r.text,
                                                                         label: JSON.parse(r.label), at: r.at })) };
  }

  /** R2, asked by `op=publish` and by R32's read alike: the publishing project named, seen, a project, and owned by
   *  `who`. Answers the refusal itself (`ok: false` at the top level, N370) or `{ok: true, proj, gate}`. */
  #authority(project, viewer, who) {
      /* R2 — CASE-2 / DEC-72: PUBLICATION IS A PRODUCTION OF A PROJECT, wielded by an OWNER of it. These authority fences
         fire first, beside the machine fence: a project-less caller is not making a legal call, and ordering their
         diagnosis behind the ceremony would make them author a bias acknowledgement for a request that cannot succeed. */
      const gate = viewerPredicate(viewer);
      const proj = str(project);
      if (!proj)
        return { ok: false, reason: "NO_PUBLISHING_PROJECT",
                 detail: "a case is a PRODUCTION OF A PROJECT (DEC-72): pass project=<project id>. The project is "
                       + "what supplies the standard of evidence this case is held to, read from that project "
                       + "alone at this moment — so a publication naming no project is one whose bar nobody "
                       + "declared, and an absent publisher is not a publisher of none." };
      /* record-core R37's read contract, through membership's one sight rule (its R43). */
      const pb = this.#one(`SELECT b.bundle_id, b.object_type FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
                           proj, ...gate.args);
      /* REC-149: at EXISTENCE the positional C-70.1 (membership R77); NONE is membership's one answer (its R78). */
      if (!pb) { const existence = this.membership.existenceAct(proj, viewer); if (existence) return existence; }
      if (!pb) return noSuchProject(proj);
      if (normalizeType(pb.object_type) !== "project")
        return { ok: false, reason: "NOT_A_PROJECT", project: proj, object_type: pb.object_type,
                 detail: `${proj} is a ${pb.object_type}, and only a PROJECT has a standard of evidence to hold a `
                       + `case to (DEC-72). Publication is wielded at the top of a project's roster.` };
      /* Membership's own owner predicate (its R54), never restated. No administrator arm: an administrator sees every
         project and directs none of them (v2 4.9), and publishing is the most directing act there is. */
      if (!this.membership.isProjectOwner(proj, who))
        return { ok: false, reason: "NOT_THE_PROJECT_OWNER", project: proj, author: who,
                 detail: `publishing is ${proj}'s own production and is wielded by an OWNER of it (DEC-72). An `
                       + `administrator sees every project and directs none of them, and a participant who is not `
                       + `an owner contributes to the work without putting the project's name on it.` };
    return { ok: true, proj, gate };
  }

  /** R4, asked by `op=publish` and by R32's read alike: each member in order, every one judged before any moves.
   *  Answers the refusal itself (N370) or `{ok: true, prepared}`, each prepared member with its current pin (`bundleSha`, R13). */
  #judgeMembers(members, proj, viewer, gate) {
      /* R4 — EVERY MEMBER IS JUDGED BEFORE ANY MEMBER MOVES: a case that took two of three findings and then refused
         the third would assert a case that does not exist. */
      const prepared = [];
      for (const id of members) {
        /* record-core R37's read contract, gated by membership's rule: absent and invisible are one answer. */
        const b = this.#one(`SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b
                             WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args);
        if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target: id };
        if (normalizeType(b.object_type) !== "inquiry")
          return { ok: false, reason: "NOT_AN_INQUIRY", target: id, object_type: b.object_type,
                   detail: "a FINDING is an inquiry that reached a conclusion; nothing else is publishable as a "
                         + "member of a case." };
        const text = this.#liveText(id);
        if (text === null)
          return { ok: false, reason: "NO_DOCUMENT", target: id,
                   detail: "this inquiry has no readable bundle.md, so its state cannot be moved" };
        const fm = parseFrontmatter(text).data || {};
        const head = this.record.head(id);
        /* CASE-4 / DEC-72 and REC-135 / §7.1 item 4: ONLY A CONCLUDED FINDING MAY BE A CASE MEMBER, and `concluded` is
           asked of the PUBLISHING PROJECT'S relationship with the question (ratification R1), never of the shared
           question's own word. THE RULE'S OWN SENTENCE LEADS EVERY BRANCH (CASE-AS-PRODUCTION's supersession table
           verbatim); what the branch adds is WHICH fact was met, because "not concluded" is four different facts. */
        const conc = this.ratification.caseConclusionFor(proj, id, viewer, b.current_state);
        if (conc.state !== "concluded")
          return { ok: false, reason: "NOT_CONCLUDED", target: id, project: proj,
                   from: b.current_state, object_type: fm.object_type ?? b.object_type,
                   relationship: conc.relationship, why: conc.why,
                   stance: conc.stance, concluded_elsewhere: conc.concluded_elsewhere,
                   concluded_elsewhere_bounds: conc.concluded_elsewhere_bounds,
                   detail: "only a CONCLUDED finding may be a case member: a material set cannot be "
                     + "asserted over a question with no conclusion, and `concluded` is asked of the "
                     + "PUBLISHING PROJECT'S relationship with it (INVESTIGATIVE-SESSION.md §7.1 item 4). "
                     + (conc.why === "question_not_case_bearing"
                     ? `This question is ${b.current_state}, and a case cannot be asserted over one the group `
                       + `has set down or carried forward. Reopen it (op=reopen) or work the children a `
                       + `division produced (DEC-28); a conclusion a project wrote while the question was `
                       + `open does not survive the question leaving the states a case can rest on. `
                     : conc.why === "project_withdrew_its_conclusion"
                     ? `${proj} concluded this question and WITHDREW that conclusion, so it stands on none `
                       + `today (op=withdrawconclusion; §7.1 item 7 — the withdrawal is history, never the `
                       + `stance). Conclude it again for this project (op=conclude&project=${proj}). `
                     : conc.why === "project_stance_undetermined"
                     ? `${proj}'s latest entry about this question names an act this plane does not know, so `
                       + `what it stands on is UNDETERMINED rather than concluded, and it is not guessed at. `
                     : `${proj} has not concluded this question. A conclusion belongs to the project's `
                       + `relationship with the inquiry (§7.1): another team's conclusion, and a conclusion `
                       + `written in the question's own bytes with no project, are both readable here and `
                       + `neither is this project's. Conclude it for this project `
                       + `(op=conclude&project=${proj}&version=<reading>). `)
                     + (conc.concluded_elsewhere.length
                       ? `${conc.concluded_elsewhere.length} other project(s) this viewer can see HAVE `
                         + `concluded it (${conc.concluded_elsewhere.map((o) => o.project).join(", ")}) — `
                         + `information, never this project's stance (§7.1 item 8). `
                       : "")
                     + "A finding already in a published case is REOPENED first (op=reopen) and concluded "
                     + "again, which is what makes the next edition a separate document carrying its own "
                     + "conclusion, its own falsifier and its own freshly authored completeness "
                     + "(DEC-12, DEC-72)." };
        /* R8 — REC-157 / §7.1 item 9: a finding in a case at its current bytes is asked whether some edition pinning
           them ALREADY RECORDS the conclusion this act would record, compared on the SAME answer the gate above was
           decided on (`conc`, never re-read). The refusal itself is asked below, once the case is known (D-442). */
        const rel = this.publication.caseRelation(id);
        const recorded = rel && rel.member ? this.ratification.editionsRecordingConclusion(id, rel, conc) : null;
        prepared.push({ id, b, fm, bundleSha: head ? head.bundleSha : null, conclusion: conc, warrant: recorded,
                        preparedIn: rel && rel.prepared ? rel.prepared.case_id ?? null : null });
      }
    return { ok: true, prepared };
  }

  /** R5, asked by `op=publish` and by R34's pre-flight alike: the authored load-bearing partition. Answers the refusal
   *  itself or `{ok: true, memberRoles, loadBearing}`. */
  #rolesOf(prepared, roles, members) {
    /* R5 — CASE-2 / DEC-72 clause 4: THE AUTHORED LOAD-BEARING PARTITION. Both halves are authored and neither is a
       default: a member designated by omission was designated by nobody. A map keyed by member id, never a list,
       because a partition that can silently reorder against the roster is not one anybody authored. */
    const roleMap = roles && typeof roles === "object" && !Array.isArray(roles) ? roles : null;
    if (roles != null && !roleMap)
      return { ok: false, reason: "BAD_ROLES", allowed: MEMBER_ROLES,
               detail: "roles is a map from finding id to designation — {\"INQ-…\": \"load_bearing\"} — one entry "
                     + "per member of this case. It is not a list: a list would be positional against the "
                     + "roster, and a partition that can silently reorder is not one anybody authored." };
    const memberRoles = [];
    for (const p of prepared) {
      const r = roleMap ? str(roleMap[p.id]) : "";
      if (!r)
        return { ok: false, reason: "NO_MEMBER_ROLE", target: p.id, allowed: MEMBER_ROLES,
                 detail: `${p.id} carries no authored designation. Every member of a case is declared `
                       + `load_bearing or supporting BY THE PUBLISHER (DEC-72): a load-bearing finding is one `
                       + `the case rests on and must meet the project's standard of evidence, and a supporting `
                       + `one travels with the case without being presented as carrying it. There is no `
                       + `default, because a member designated by omission was designated by nobody.` };
      if (!MEMBER_ROLES.includes(r))
        return { ok: false, reason: "BAD_MEMBER_ROLE", target: p.id, role: r, allowed: MEMBER_ROLES,
                 detail: `${p.id} is designated '${r}', which is not one of: ${MEMBER_ROLES.join(", ")}. `
                       + `The two terms are the record's own and are spelled as the schema spells them.` };
      memberRoles.push({ target: p.id, role: r });
    }
    /* DEC-72's second ruled default: all-supporting material would assert nothing conclusive while the completeness
       ceremony claims coverage of a question no member answers. */
    const loadBearing = memberRoles.filter((m) => m.role === "load_bearing");
    if (!loadBearing.length)
      return { ok: false, reason: "NO_LOAD_BEARING_MEMBER", members: members.slice(),
               detail: "a case rests on at least one LOAD-BEARING finding (DEC-72). Every member here is "
                     + "supporting, so the case asserts nothing conclusively — while its completeness "
                     + "assertion claims coverage of a question no member answers. Designate the finding "
                     + "the case actually rests on, or do not publish this as a case yet." };
    return { ok: true, memberRoles, loadBearing };
  }

  /** R6: `{bar, shortfalls}`, one `BELOW_PROJECT_STRENGTH` per (load-bearing member, declared axis) that does not reach
   *  the bar, in member and axis order: `op=publish` answers the first, R34's pre-flight lists them all. */
  #barJudged(proj, loadBearing) {
    /* R6 — CASE-2 / DEC-72 clause 2: THE BAR, READ FROM THE PUBLISHING PROJECT ALONE, AT ACT TIME, AND ONCE: the bar is
       the case's property, so members stamped with different bars would be the old model surviving in the bytes. THE
       GROUP DEFAULT IS NOT CONSULTED (it seeds new projects and gates no publication). An absent bar gates nothing and
       is not a bar of zero. */
    const bar = this.strength.projectBar(proj);
    const shortfalls = [];
    if (bar.declared) {
      const rank = (g) => BASIS_GRADES.indexOf(g);
      for (const m of loadBearing) {
        const pair = this.strength.strengthOf(m.target);
        for (const axis of STRENGTH_AXES) {
          const want = bar[axis];
          if (!BASIS_GRADES.includes(want)) continue;   /* an axis the project left unset gates nothing */
          const got = pair[axis];
          /* A DERIVED GRADE OF NULL DOES NOT MEET A DECLARED BAR: `unrated` and `undetermined` are frozen facts, not
             grades, and treating either as clearing a bar would claim a standard was met by material nobody graded. */
          if (got.grade === null || rank(got.grade) > rank(want))
            shortfalls.push({ ok: false, reason: "BELOW_PROJECT_STRENGTH", target: m.target, axis,
                     project: proj, required: want, reached: got.grade, state: got.state,
                     detail: `${m.target} is LOAD-BEARING in this case and reaches ${axis} `
                           + `${got.grade === null ? got.state + " (no grade)" : "'" + got.grade + "'"}, `
                           + `against ${proj}'s declared standard of '${want}'. A case rests on its `
                           + `load-bearing findings, so those are what the project's bar is asked of. `
                           + `A finding below the bar may still travel with this case — designate it `
                           + `SUPPORTING and it is published, marked as not carrying the case (DEC-72). `
                           + `That is the honest move and never severing the citation.` });
        }
      }
    }
    return { bar, shortfalls };
  }

  /** R12 — HUNCH DEBT REFUSES PUBLICATION (Publication §3 rule 4; DEC-20; Declared Bias, "HUNCH DEBT"): the one bias
   *  that must be cleared before a case publishes. Cleared means the case holds without the hunch, so a member whose
   *  live basis still carries a leg whose grade source is `hunch` carries the debt. Asked of EVERY member, load-bearing
   *  or supporting, before the case identity is derived, so a refusal draws no id and writes nothing (K240); R34's
   *  pre-flight answers it before the first screen. Answers C-120.7 or null. */
  #hunchDebt(prepared) {
    const hunches = [];
    for (const p of prepared) {
      const basis = this.inquiry.basisFor(p.id);
      for (const leg of (basis && Array.isArray(basis.legs) ? basis.legs : []))
        if (leg && leg.grade_source === "hunch") hunches.push({ target: p.id, ord: leg.ord, leg_target: leg.target_id });
    }
    if (!hunches.length) return null;
    /* DEC-49 REGION is-hunch-cleared */
    return disclosureRefusal("UNCLEARED_HUNCH", { hunches,
      detail: `${hunches.length} basis leg(s) of this case's findings rest on a HUNCH (`
            + hunches.map((h) => `${h.target} leg ${h.ord} on ${h.leg_target}`).join("; ")
            + `). A hunch is temporary declared bias, and it is the one bias that must be cleared before `
            + `publication (DEC-20): the case must still hold with the hunch removed. Give each leg a grade `
            + `the record earns, or take the hunch out of the basis, and publish again. Nothing was written.` });
    /* END DEC-49 REGION is-hunch-cleared */
  }

  /** R31 — N345 (DEC-76 item 4, DEC-84 items 11–13, DEC-85): A CASE DISCLOSES EVERY UNRESOLVED CONFLICT ON WHAT IT RESTS
   *  ON, ONE LEVEL DEEP, AND IS NEVER REFUSED BECAUSE ONE EXISTS. Each member is read at the bytes this act pins (R13),
   *  as the viewer, so a side the publisher may not see comes back highlighted with nothing of it (R33). Answers
   *  `{refusals, entries, unread, byCandidate}`: the list's own malformation or C-120.3 alone, else C-120.1 and C-120.2
   *  in that order, each once; `op=publish` answers the first, R34's pre-flight lists them all. */
  #tensionsJudged(prepared, viewer, tensionsDisclosed) {
    const listed = this.#disclosuresListed(tensionsDisclosed);
    if (listed.ok === false) return { refusals: [listed], entries: [], unread: [], byCandidate: new Map() };
    const read = this.#tensionsRead(prepared, viewer);
    if (read.ok === false) return { refusals: [read], entries: [], unread: [], byCandidate: listed.byCandidate };
    const refusals = [];
    const undisclosed = read.entries.filter((e) => !listed.byCandidate.has(e.candidate));
    /* DEC-49 REGION is-tension-disclosed */
    if (undisclosed.length)
      refusals.push(disclosureRefusal("TENSION_NOT_DISCLOSED", {
        undisclosed: undisclosed.map((e) => this.#namedInRefusal(e)),
        detail: `${undisclosed.length} unresolved conflict(s) on what this case rests on are not disclosed (`
              + undisclosed.map((e) => `${e.candidate} on ${e.finding}`
                + (e.unseen_other_side ? `, ${NOT_SHOWN_WORDS}` : "")).join("; ")
              + `). A case is published with its conflicts disclosed, never refused because one exists (DEC-76 `
              + `item 4): list each in tensionsDisclosed, or resolve it first. Nothing was published.` }));
    /* END DEC-49 REGION is-tension-disclosed */
    const standing = new Set(read.entries.map((e) => e.candidate));
    const notStanding = [...listed.byCandidate.values()].filter((d) => !standing.has(d.candidate));
    /* DEC-49 REGION is-disclosure-standing */
    if (notStanding.length)
      refusals.push(disclosureRefusal("DISCLOSURE_NOT_STANDING", {
        not_standing: notStanding.map((d) => ({ candidate: d.candidate, ord: d.ord })),
        detail: `${notStanding.map((d) => d.candidate).join(", ")} is not an unresolved conflict on this case's `
              + `findings at the bytes this act pins: it may have been resolved since, or it names nothing this `
              + `case rests on. Read the list again (op=publishtensions). Nothing was published.` }));
    /* END DEC-49 REGION is-disclosure-standing */
    return { refusals, entries: read.entries, unread: read.unread, byCandidate: listed.byCandidate };
  }

  /** R35 — WHAT EACH MEMBER RESTS ON, AS CAPTURES, ONE LEVEL DEEP (as R29 and R31 read): each document leg of the
   *  member's basis at the bytes this act pins, either role, names its content row's capture, else every capture its
   *  target registers (provenance R48's `register`); an inquiry leg names none (that finding states its own when it is
   *  published). Answers `[{member, capture}]` in member order, then leg order, each pair once. Set-based: one read per
   *  chunk of ids over inquiry R40's `inquiry_basis`, content R45's `content`, record-core R37's `bundles` and provenance
   *  R48's `register`. */
  #restingCaptures(prepared) {
    const chunked = (vals, fn) => { for (let i = 0; i < vals.length; i += SEARCHED_CHUNK) fn(vals.slice(i, i + SEARCHED_CHUNK)); };
    const marks = (part) => part.map(() => "?").join(",");
    const legsOf = new Map(prepared.map((p) => [p.id, []]));
    chunked(prepared.map((p) => p.id), (part) => {
      for (const r of this.#rows(`SELECT bundle_id, ord, target_id, content_id FROM inquiry_basis
                                   WHERE bundle_id IN (${marks(part)}) ORDER BY bundle_id, ord`, ...part))
        legsOf.get(r.bundle_id).push(r);
    });
    const legs = [...legsOf.values()].flat();
    const captureOfContent = new Map();
    chunked([...new Set(legs.map((l) => l.content_id).filter((c) => typeof c === "string" && c))], (part) => {
      for (const r of this.#rows(`SELECT content_id, capture_sha FROM content WHERE content_id IN (${marks(part)})`, ...part))
        if (typeof r.capture_sha === "string" && r.capture_sha) captureOfContent.set(r.content_id, r.capture_sha);
    });
    const whole = [...new Set(legs.filter((l) => !captureOfContent.has(l.content_id)).map((l) => l.target_id)
      .filter((t) => typeof t === "string" && t))];
    const documents = new Set();
    const registered = new Map();
    chunked(whole, (part) => {
      for (const r of this.#rows(`SELECT bundle_id, object_type FROM bundles WHERE bundle_id IN (${marks(part)})`, ...part))
        if (normalizeType(r.object_type) === "information") documents.add(r.bundle_id);
    });
    chunked([...documents], (part) => {
      for (const r of this.#rows(`SELECT bundle_id, capture_sha FROM register WHERE bundle_id IN (${marks(part)})
                                   ORDER BY bundle_id, capture_sha`, ...part)) {
        if (!registered.has(r.bundle_id)) registered.set(r.bundle_id, []);
        registered.get(r.bundle_id).push(r.capture_sha);
      }
    });
    const out = [];
    for (const p of prepared) {
      const had = new Set();
      for (const l of legsOf.get(p.id)) {
        const caps = captureOfContent.has(l.content_id) ? [captureOfContent.get(l.content_id)]
                   : documents.has(l.target_id) ? (registered.get(l.target_id) || []) : [];
        for (const c of caps) if (!had.has(c)) { had.add(c); out.push({ member: p.id, capture: c }); }
      }
    }
    return out;
  }

  /** R35, R36: one capture's grade (`provenance.captureGrade`) and co-attestation, read at the act. It is co-attested
   *  only when it holds both a timestamp and a co-archive: first as recorded at capture (`attestation.attestationsOf`),
   *  else a late one that succeeded (`capture.lateAttestationsOf`; a late co-archive whose replay holds other bytes
   *  corroborates nothing and is not counted), a late one stated as late. The capturing member's signed accounts
   *  (`capture.captureAccountsOf`) travel with it, their exact text and signature (publication R20 writes them as
   *  base64 of the exact bytes, so each still verifies). Never throws: a read that fails states less, never more. */
  #captureFacts(sha) {
    const safe = (fn) => { try { return fn(); } catch { return null; } };
    const g = safe(() => this.provenance.captureGrade(sha)) || {};
    const att = safe(() => this.attestation.attestationsOf(sha));
    const late = safe(() => this.capture.lateAttestationsOf(sha));
    const acc = safe(() => this.capture.captureAccountsOf(sha));
    const held = att && att.ok !== false && Array.isArray(att.attestations) ? att.attestations : [];
    const lateHeld = late && Array.isArray(late.late_attestations) ? late.late_attestations : [];
    const onTs = held.find((a) => a && a.kind === "rfc3161");
    const onCa = held.find((a) => a && a.kind === "co_archive" && a.locator);
    const lateTs = lateHeld.find((a) => a && a.kind === "timestamp" && a.ok === true);
    const lateCa = lateHeld.find((a) => a && a.kind === "co_archive" && a.ok === true && a.matches !== false
                                        && a.archived_locator);
    const ts = onTs ? { at: onTs.at ?? null, late: false } : lateTs ? { at: lateTs.at ?? null, late: true } : null;
    const ca = onCa ? { locator: onCa.locator, late: false } : lateCa ? { locator: lateCa.archived_locator, late: true } : null;
    const accounts = acc && Array.isArray(acc.accounts) ? acc.accounts : [];
    return { capture: sha, grade: g.grade ?? null, grade_basis: g.basis ?? null, grade_why: g.why ?? null,
             co_attested: !!(ts && ca), timestamp_at: ts ? ts.at : null, co_archive: ca ? ca.locator : null,
             late: !!((ts && ts.late) || (ca && ca.late)),
             accounts_read: accounts.map((a) => ({ by: a.by ?? null, at: a.at ?? null, text: String(a.text ?? ""),
                                                  signature: a.signature == null ? null : String(a.signature) })) };
  }

  /** R35 (DEC-81 item 3 (b), (d)): `selfAttested: [{capture, reason}]`, the owner's attributed acknowledgement of a
   *  document published as self-attested only. Any malformed shape is R3's `BAD_COMPLETENESS` naming the field (the
   *  pattern of `tensionsDisclosed`, K498); a capture listed twice is acknowledged once, its first reason kept. Then, in
   *  R35's order: a load-bearing capture at `EARNED_CAPTURE_CEILING` (Grade B, provenance R24's one definition) not
   *  co-attested and not listed is C-120.4, naming each; a listed one with an empty reason C-120.5; a listed one that
   *  is co-attested, or not in the case, C-120.6. Answers `{refusals, byCapture}`; `op=publish` answers the first, R34's
   *  pre-flight lists them all. Nothing here refuses a case because a document is not co-attested. */
  #selfAttestedJudged(resting, facts, memberRoles, list) {
    const byCapture = new Map();
    const bad = (field, detail) => ({ refusals: [{ ok: false, reason: "BAD_COMPLETENESS", field, detail }], byCapture });
    if (list != null) {
      if (!Array.isArray(list))
        return bad("selfAttested", "selfAttested is a list of {capture, reason}, one per document published as "
                                 + "self-attested only");
      for (let i = 0; i < list.length; i++) {
        const d = list[i];
        const capture = d && typeof d === "object" && !Array.isArray(d) && typeof d.capture === "string"
          ? d.capture.trim().toLowerCase() : "";
        if (!capture) return bad(`selfAttested[${i}]`, `selfAttested[${i}] is not {capture, reason} naming a capture`);
        if (d.reason != null && typeof d.reason !== "string")
          return bad(`selfAttested[${i}].reason`, `selfAttested[${i}].reason is the owner's reason, a string`);
        const reason = typeof d.reason === "string" ? d.reason.trim() : "";
        if (reason.length > COMPLETENESS_MAX || /["\\\r\n]/.test(reason))
          return bad(`selfAttested[${i}].reason`, `selfAttested[${i}].reason is at most ${COMPLETENESS_MAX} characters `
            + `and cannot contain a quote, a backslash, or a newline: the restricted frontmatter grammar has no escapes`);
        if (!byCapture.has(capture)) byCapture.set(capture, { capture, ord: i, reason });
      }
    }
    const roleOf = new Map(memberRoles.map((m) => [m.target, m.role]));
    const membersOf = new Map();
    for (const r of resting) {
      if (!membersOf.has(r.capture)) membersOf.set(r.capture, []);
      membersOf.get(r.capture).push(r.member);
    }
    const refusals = [];
    const unacknowledged = [...facts.values()].filter((f) => f.grade === EARNED_CAPTURE_CEILING && !f.co_attested
      && membersOf.get(f.capture).some((m) => roleOf.get(m) === "load_bearing") && !byCapture.has(f.capture));
    /* DEC-49 REGION is-co-attestation-acknowledged */
    if (unacknowledged.length)
      refusals.push(disclosureRefusal("CO_ATTESTATION_UNACKNOWLEDGED", {
        unacknowledged: unacknowledged.map((f) => ({ capture: f.capture, members: membersOf.get(f.capture), grade: f.grade,
                                                     timestamp_at: f.timestamp_at, co_archive: f.co_archive })),
        detail: `${unacknowledged.length} load-bearing Grade ${EARNED_CAPTURE_CEILING} document(s) hold no trusted timestamp `
              + `and co-archive (`
              + unacknowledged.map((f) => `${f.capture} under ${membersOf.get(f.capture).join(", ")}`).join("; ")
              + `). Retry them (op=reattest), or list each in selfAttested with your reason to publish it as `
              + `self-attested only (DEC-81 item 3). The case is never refused because a document is not co-attested. `
              + `Nothing was written.` }));
    /* END DEC-49 REGION is-co-attestation-acknowledged */
    const noReason = [...byCapture.values()].filter((d) => !d.reason);
    /* DEC-49 REGION is-self-attested-reasoned */
    if (noReason.length)
      refusals.push(disclosureRefusal("SELF_ATTESTED_NO_REASON", {
        no_reason: noReason.map((d) => ({ capture: d.capture, ord: d.ord })),
        detail: `${noReason.map((d) => `selfAttested[${d.ord}]`).join(", ")} gives no reason. Publishing a document as `
              + `self-attested only is an attributed act with a stated reason (DEC-81 item 3 (b)). Nothing was written.` }));
    /* END DEC-49 REGION is-self-attested-reasoned */
    const notStanding = [...byCapture.values()].filter((d) => !facts.has(d.capture) || facts.get(d.capture).co_attested);
    /* DEC-49 REGION is-self-attestation-standing */
    if (notStanding.length)
      refusals.push(disclosureRefusal("SELF_ATTESTATION_NOT_STANDING", {
        not_standing: notStanding.map((d) => ({ capture: d.capture, ord: d.ord,
                                                why: facts.has(d.capture) ? "co_attested" : "not_in_case" })),
        detail: `${notStanding.map((d) => d.capture).join(", ")} needs no acknowledgement: `
              + notStanding.map((d) => (facts.has(d.capture) ? `${d.capture} is co-attested` : `${d.capture} is not a `
                + `document this case rests on`)).join("; ") + `. Remove it from selfAttested. Nothing was written.` }));
    /* END DEC-49 REGION is-self-attestation-standing */
    return { refusals, byCapture };
  }

  /** R44–R46, R50 (DEC-112 (4); K1134 reading 1): each member's chain (`chainsOf`, as `viewer` sees the record), each
   *  material it reaches with what this copy holds of it (`materialHeld`), and C-120.8 for every load-bearing member
   *  whose chain reaches material not held whole, naming each member and each material. Material only supporting
   *  members reach is listed `included: false` and never refused. Answers `{refusals, materials, refs, findings}`;
   *  `op=publish` answers the first refusal, R34's pre-flight lists it. */
  #materialsJudged(prepared, memberRoles, viewer) {
    const gate = viewerPredicate(viewer);
    const io = {
      rows: (q, ...a) => this.#rows(q, ...a), one: (q, ...a) => this.#one(q, ...a), normalizeType,
      parseRef: (t) => parseImportedFindingRef(t),
      visible: (id) => gate.scope !== "DENY"
        && !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args),
      readFile: (b, p) => this.record.readFile(b, p),
      unitsOf: (sha) => this.extraction.unitsOf(sha),
      sha256: (s) => createSha256().update(new TextEncoder().encode(s)).hex(), canonicalJson,
    };
    const roleOf = new Map(memberRoles.map((m) => [m.target, m.role]));
    const chains = chainsOf(prepared.map((p) => ({ id: p.id, role: roleOf.get(p.id) })), io, DEPTH_BOUND);
    const materials = chains.materials.map((m) => {
      const held = materialHeld(m, io);
      return { ...m, held, included: held.whole };
    });
    const short = materials.filter((m) => !m.included && m.rests_under === "load_bearing");
    const refusals = [];
    /* DEC-49 REGION is-relied-on-presentable */
    if (short.length) {
      const byMember = memberRoles.filter((r) => r.role === "load_bearing")
        .map((r) => ({ target: r.target, materials: short.filter((m) => m.members.includes(r.target))
          .map((m) => ({ ref: m.ref, kind: m.kind, sha: m.sha, missing: m.held.missing })) }))
        .filter((x) => x.materials.length);
      refusals.push(disclosureRefusal("RELIED_ON_NOT_PRESENTABLE", { not_presentable: byMember,
        detail: `${short.length} document(s) or observation(s) a load-bearing finding of this case rests on are not held `
              + `whole by this copy (` + byMember.map((x) => `${x.target}: ` + x.materials.map((m) => `${m.ref} `
                + `${m.sha} lacks ${m.missing.join(" and ")}`).join(", ")).join("; ")
              + `). Everything a case relies on travels with it in full (DEC-112 (4)): find a presentable copy, stop `
              + `relying on the material, or make the finding supporting. Nothing was written.` }));
    }
    /* END DEC-49 REGION is-relied-on-presentable */
    return { refusals, materials, refs: chains.refs, findings: chains.findings };
  }

  /** R54 (DEC-112 (3); K1305, K1315): for each finding a member's chain reaches (R46), its legs exactly as
   *  `strength.gradingFacts` (its R35) answers them at the act, with `levels` null (`recomputePair` takes the levels the
   *  signed attribution section states), one `grading_facts:` row each, `{finding, ord}` beside the answer's fields; and
   *  each relied-on passage, one `passages:` row per leg naming a content row, `{finding, ord, content_id, capture_sha,
   *  extent, quoted}`, `quoted` the text of the extracted unit at that extent (`extraction.unitsOf`), null where the copy
   *  holds none there. A finding `gradingFacts` refuses contributes no row, and the refusal is kept in `unread`, stated. */
  #findingFacts(findings, viewer) {
    const grading = [], passages = [], unread = [];
    const units = new Map();
    const unitsOf = (sha) => {
      if (!units.has(sha)) { let u = null; try { u = this.extraction.unitsOf(sha); } catch { u = null; } units.set(sha, u); }
      return units.get(sha);
    };
    for (const id of [...new Set(findings.map((f) => f.id))]) {
      let gf = null;
      try { gf = this.strength.gradingFacts({ inquiry: id, levels: null, viewer }); } catch (e) { gf = { ok: false, reason: String(e && e.message || e).slice(0, 160) }; }
      if (!gf || gf.ok !== true) { unread.push({ finding: id, reason: gf ? gf.reason ?? null : null }); continue; }
      gf.legs.forEach((leg, ord) => grading.push({ finding: id, ord, ...leg }));
      for (const leg of this.#rows(`SELECT b.ord, c.content_id, c.capture_sha, c.extent FROM inquiry_basis b
                                    JOIN content c ON c.content_id = b.content_id WHERE b.bundle_id=? ORDER BY b.ord`, id)) {
        const u = unitsOf(leg.capture_sha);
        const at = u && Array.isArray(u.units) ? u.units.find((x) => canonicalJson(x.extent) === leg.extent) : null;
        passages.push({ finding: id, ord: Number(leg.ord), content_id: leg.content_id, capture_sha: leg.capture_sha,
                        extent: leg.extent, quoted: at && !at.truncated ? at.text : null });
      }
    }
    return { grading, passages, unread };
  }

  /** R46, R48 (K1316): the off-the-record captures, those whose `sources:` row (R37) states the identity "Withheld":
   *  `basis` null is `publication`'s `unnamedSourceStatement`, the one spelling. */
  static #withheld(sourceRows) {
    return new Set(sourceRows.filter((r) => r.basis === null).map((r) => r.capture));
  }

  /** R51 (DEC-96 item 4; N522): for each leg a member's chain reaches on another group's finding, the acceptance in force
   *  at the leg's `target_edition` (`case-import.acceptanceOf`, its R9) and the imported edition's facts
   *  (`importedCase`, its R4), as `accepted_work:` rows. A leg with none in force is C-120.10, naming each member, leg,
   *  source case and edition. The edition is read from the inquiry's own `bundle.md` `basis[ord]` (K1305 (2)). Answers
   *  `{refusals, rows, editions}`, `editions` each (import, edition) named with its refs, for R52. */
  #acceptedWorkJudged(refs, viewer) {
    const rows = [], missing = [], editions = new Map();
    for (const leg of refs) {
      const parsed = parseImportedFindingRef(leg.ref);
      const text = this.#liveText(leg.leg_of);
      const basis = text !== null ? (parseFrontmatter(text).data || {}).basis : null;
      const at = Array.isArray(basis) ? basis[leg.ord] : null;
      const ed = at && Number.isInteger(Number(at.target_edition)) && Number(at.target_edition) > 0
        ? Number(at.target_edition) : null;
      const read = (fn) => { try { return fn(); } catch { return null; } };
      const imported = ed === null ? null : read(() => this.caseImport.importedCase({ import: parsed.import, edition: ed, viewer }));
      const edition = imported && imported.ok !== false
        ? (Array.isArray(imported.editions) ? imported.editions.find((e) => Number(e.edition) === ed) : imported) || null
        : null;
      const acceptance = ed === null ? null
        : read(() => this.caseImport.acceptanceOf({ import: parsed.import, edition: ed, finding: parsed.finding }));
      const source = { group: edition ? edition.group ?? null : null, case: edition ? edition.case ?? null : null, edition: ed };
      if (!acceptance || acceptance.ok === false) {
        missing.push({ target: leg.member, leg_of: leg.leg_of, ord: leg.ord, ref: leg.ref, source });
        continue;
      }
      const found = edition && Array.isArray(edition.findings)
        ? edition.findings.find((f) => f.finding === parsed.finding) || null : null;
      rows.push(acceptedWorkRow({ ...leg, target_edition: ed }, parsed, acceptance, edition, found));
      const key = `${parsed.import}#${ed}`;
      if (!editions.has(key)) editions.set(key, { import: parsed.import, edition: ed, refs: [] });
      editions.get(key).refs.push({ ref: leg.ref, finding: parsed.finding, member: leg.member });
    }
    const refusals = [];
    /* DEC-49 REGION is-accepted-work-in-force */
    if (missing.length)
      refusals.push(disclosureRefusal("ACCEPTED_WORK_NOT_IN_FORCE", { not_in_force: missing,
        detail: `${missing.length} leg(s) of this case's findings rest on another group's finding with no acceptance of `
              + `that edition in force (` + missing.map((m) => `${m.target}: ${m.leg_of} leg ${m.ord} on ${m.ref}, `
                + `${m.source.case ?? "an imported case"} edition ${m.source.edition ?? "not stated"}`).join("; ")
              + `). Accept that edition again (op=importaccept), or take the leg out. Nothing was written.` }));
    /* END DEC-49 REGION is-accepted-work-in-force */
    return { refusals, rows, editions: [...editions.values()] };
  }

  /** R52 (DEC-96 items 2, 4; DEC-84 (13)): the open flags on each edition R51 names (`case-import.openFlagsOn`, its
   *  R9), judged against `flagsDisclosed` (`flagsJudged`): a failed or incomplete read C-120.12 alone; else an open flag
   *  not listed C-120.11, naming each, and a listed one not open C-120.13. Never refused because a flag is open. Answers
   *  `{refusals, open, byFlag}`. */
  #flagsJudged(editions, flagsDisclosed) {
    const listed = flagsListed(flagsDisclosed);
    if (listed.ok === false) return { refusals: [listed], open: [], byFlag: new Map() };
    const reads = editions.map((e) => {
      let answer;
      try { answer = this.caseImport.openFlagsOn({ import: e.import, edition: e.edition }); }
      catch (x) { answer = { failed: String(x && x.message || x).slice(0, 160) }; }
      return { ...e, answer };
    });
    const j = flagsJudged(reads, listed);
    const refusals = [];
    /* DEC-49 REGION is-flags-determined */
    if (j.failed.length)
      return { refusals: [disclosureRefusal("FLAGS_UNDETERMINED", { undetermined: j.failed,
        detail: `the flags on another group's work this case rests on could not be read whole (`
              + j.failed.map((f) => `edition ${f.edition} of import ${f.import}: ${f.why}`).join("; ")
              + `), so what this case must disclose is not known. Try again. Nothing was published.` })],
        open: [], byFlag: listed.byFlag };
    /* END DEC-49 REGION is-flags-determined */
    /* DEC-49 REGION is-flag-disclosed */
    if (j.undisclosed.length)
      refusals.push(disclosureRefusal("FLAG_NOT_DISCLOSED", {
        undisclosed: j.undisclosed.map((f) => ({ flag: f.flag, ref: f.ref, edition: f.edition, issue: f.issue })),
        detail: `${j.undisclosed.length} open flag(s) on another group's work this case rests on are not disclosed (`
              + j.undisclosed.map((f) => `flag ${f.flag} on ${f.ref} edition ${f.edition}`).join("; ")
              + `). A case is published with its open flags disclosed, never refused because one is open (DEC-96 item `
              + `4): list each in flagsDisclosed, or clear it first. Nothing was published.` }));
    /* END DEC-49 REGION is-flag-disclosed */
    /* DEC-49 REGION is-flag-disclosure-standing */
    if (j.notStanding.length)
      refusals.push(disclosureRefusal("FLAG_DISCLOSURE_NOT_STANDING", {
        not_standing: j.notStanding.map((d) => ({ flag: d.flag, ord: d.ord })),
        detail: `${j.notStanding.map((d) => d.flag).join(", ")} is not an open flag on work this case rests on: it may `
              + `have been cleared since. Read the list again (op=publishpreflight). Nothing was published.` }));
    /* END DEC-49 REGION is-flag-disclosure-standing */
    return { refusals, open: j.open, byFlag: listed.byFlag };
  }

  /** R37 (DEC-78 item 5): what may be stated of the source of each capture given to the group rather than fetched. The
   *  capture's source is found through `sources.sourceOf` (a capture no source stands behind, a fetched one, has none,
   *  and nothing is stated: the capturing member is never its source), and for each source only what
   *  `sources.publishableAt({audience: "public"})` answers is stated, spelled by publication's `sourceStatement`, with its
   *  basis. With nothing publishable, publication's `unnamedSourceStatement`: "an unnamed source" and the receipt's
   *  digest and time, basis null. Rows are `{capture, stated, basis}` (K549); no authored field adds to them, and no
   *  source or entry id is written (an opaque id in two cases would itself link them). A source read that fails states
   *  the unnamed row: less, never more. */
  #sourcesStated(shas, viewer) {
    const rows = [];
    const unnamed = (capture, receipt) => ({ capture, basis: null,
      stated: unnamedSourceStatement({ capture: receipt && receipt.sha256 ? receipt.sha256 : capture,
                                       received: receipt && receipt.received ? receipt.received : null }) });
    for (const sha of shas) {
      let of = null;
      try { of = this.sources.sourceOf({ captureSha: sha, viewer }); } catch { of = null; }
      if (of && of.ok === false && of.reason === "NO_SUCH_SOURCE") continue;
      if (!of || of.ok !== true) { rows.push(unnamed(sha, null)); continue; }
      const each = Array.isArray(of.sources) && of.sources.length ? of.sources
        : [{ sourceId: of.sourceId, source: of.source }];
      for (const s of each) {
        let pa = null;
        try { pa = this.sources.publishableAt({ source: s.sourceId, audience: "public" }); } catch { pa = null; }
        const entries = (pa && pa.ok === true && Array.isArray(pa.entries) ? pa.entries : [])
          .map((e) => ({ stated: sourceStatement(e), basis: e.basis ?? null })).filter((e) => e.stated);
        /* The unnamed statement is the capture's, from its first pulled knock (`sourceOf`'s own `source`), whichever
           source says nothing: publication R51 re-derives it that way at the commit. */
        if (!entries.length) { rows.push(unnamed(sha, of.source && of.source.receipt)); continue; }
        for (const e of entries) rows.push({ capture: sha, stated: e.stated, basis: e.basis });
      }
    }
    /* Each statement once: two knockers of the same bytes with nothing publishable are one unnamed statement. */
    const once = new Set();
    return rows.filter((r) => { const k = JSON.stringify([r.capture, r.stated, r.basis]); return once.has(k) ? false : once.add(k); });
  }

  /** R31's input: `tensionsDisclosed`, `[{candidate, words?}]`, as a map by candidate (a candidate listed twice is
   *  disclosed once, its first words kept). Absent or null is none. Any malformed shape is R3's `BAD_COMPLETENESS`
   *  naming the field (K498): a list that is not one, an entry that is not an object naming a `candidate` string, and
   *  words over `COMPLETENESS_MAX` or holding a character the grammar cannot carry (a double quote, a backslash, a line
   *  break; an apostrophe is legal inside its quoted string). C-120.2 is only for a well-formed candidate. */
  #disclosuresListed(list) {
    const byCandidate = new Map();
    const bad = (field, detail) => ({ ok: false, reason: "BAD_COMPLETENESS", field, detail });
    if (list == null) return { ok: true, byCandidate };
    if (!Array.isArray(list))
      return bad("tensionsDisclosed", "tensionsDisclosed is a list of {candidate, words?}, one per conflict disclosed");
    for (let i = 0; i < list.length; i++) {
      const d = list[i];
      const candidate = d && typeof d === "object" && !Array.isArray(d) && typeof d.candidate === "string"
        ? d.candidate.trim() : "";
      if (!candidate)
        return bad(`tensionsDisclosed[${i}]`, `tensionsDisclosed[${i}] is not {candidate, words?} naming a candidate`);
      if (d.words != null && typeof d.words !== "string")
        return bad(`tensionsDisclosed[${i}].words`, `tensionsDisclosed[${i}].words is the owner's words, a string`);
      const words = typeof d.words === "string" ? d.words.trim() || null : null;
      if (words !== null && (words.length > COMPLETENESS_MAX || /["\\\r\n]/.test(words)))
        return bad(`tensionsDisclosed[${i}].words`, `tensionsDisclosed[${i}].words is at most ${COMPLETENESS_MAX} `
          + `characters and cannot contain a quote, a backslash, or a newline: the restricted frontmatter grammar has `
          + `no escapes`);
      if (!byCandidate.has(candidate)) byCandidate.set(candidate, { candidate, ord: i, words });
    }
    return { ok: true, byCandidate };
  }

  /** R31, R32: THE ONE READ of what a case over `prepared` must disclose: `contradiction.unresolvedRecordOn` (its R29)
   *  for each member at its pin, as `viewer`. A read that fails or is truncated is C-120.3 (what cannot be read cannot
   *  be disclosed). A leg the read could name no referent for (`undetermined_legs`: a document leg with no content row)
   *  is stated, never filled (R26): counted per member in `unread`. Answers C-120.3 itself or `{ok: true, entries, unread}`, one
   *  entry per candidate and member, each with its sides as the document states them, and a highlighted one with its
   *  seen side only (R33). Never throws. */
  #tensionsRead(prepared, viewer) {
    const entries = [];
    const failed = [];
    const unread = [];
    for (const p of prepared) {
      let r = null;
      try { r = this.contradiction.unresolvedRecordOn({ finding: p.id, sha: p.bundleSha, viewer }); }
      catch (e) { r = { undetermined: true, why: String(e && e.message || e).slice(0, 160) }; }
      if (!r || r.ok === false || r.undetermined || r.truncated || !Array.isArray(r.candidates)) {
        failed.push({ finding: p.id, sha: p.bundleSha,
                      why: !r ? "no answer" : r.truncated ? `more than ${r.bound ?? "its bound of"} candidates on it`
                         : r.why || "the read failed" });
        continue;
      }
      if (Number(r.undetermined_legs) > 0) unread.push({ finding: p.id, legs: Number(r.undetermined_legs) });
      for (const c of r.candidates) {
        if (c.unseen_other_side)
          entries.push({ candidate: c.candidate, finding: p.id, state: c.state, kind: null, unseen_other_side: true,
                         side: tensionSide(c.side), depth: 1 });
        else
          entries.push({ candidate: c.candidate, finding: p.id, state: c.state, kind: c.kind ?? null,
                         unseen_other_side: false, a: tensionSide(c.a), b: tensionSide(c.b),
                         explanation: c.explanation ?? null, depth: 1 });
      }
    }
    if (failed.length) return CaseAuthoring.#undetermined(failed);
    return { ok: true, entries, unread };
  }

  /* C-120.3's one site: a read of conflicts that could not be made whole, naming each finding and why. */
  static #undetermined(failed) {
    /* DEC-49 REGION is-tensions-determined */
    return disclosureRefusal("TENSIONS_UNDETERMINED", { undetermined: failed,
      detail: `the record could not be read whole for conflicts on ${failed.map((f) => `${f.finding ?? "this case's "
                + "findings"} (${f.why})`).join("; ")}, so what this case must disclose is not known. Nothing was `
            + `published.` });
    /* END DEC-49 REGION is-tensions-determined */
  }

  /* R31, R33: how C-120.1 names an undisclosed entry. A half-seen one by its candidate and its finding only. */
  #namedInRefusal(e) {
    return e.unseen_other_side
      ? { candidate: e.candidate, finding: e.finding, unseen_other_side: true, says: NOT_SHOWN_WORDS }
      : { candidate: e.candidate, finding: e.finding, state: e.state, kind: e.kind, a: e.a, b: e.b };
  }

  /* ==========================================================================================================
   * op=publishtensions: tensionsToDisclose (R32; DEC-85: the ceremony tells the publisher before the act)
   * ========================================================================================================== */
  /** R32: the candidates `op=publish` would require this act to disclose, read exactly as R31 reads them. R2's
   *  refusals, then R4's per member, then C-120.3. Writes nothing and never throws. */
  tensionsToDisclose({ project = null, targets = null, target = null, viewer = null, author = null } = {}) {
    try {
      const who = str(author);
      const auth = this.#authority(project, viewer, who);
      if (auth.ok === false) return auth;
      const { proj, gate } = auth;
      const set = Array.isArray(targets) ? targets
                : typeof targets === "string" && targets.trim() ? targets.split(",")
                : target ? [target] : [];
      const members = [...new Set(set.map((x) => str(x)).filter(Boolean))];
      const judged = this.#judgeMembers(members, proj, viewer, gate);
      if (judged.ok === false) return judged;
      const read = this.#tensionsRead(judged.prepared, viewer);
      if (read.ok === false) return read;
      const candidates = read.entries.map((e) => (e.unseen_other_side
        ? { ...e, highlighted: true, sentence: CEREMONY_HIGHLIGHT_SENTENCE } : e));
      return { ok: true, wrote: false, project: proj,
               findings: judged.prepared.map((p) => ({ target: p.id, bundleSha: p.bundleSha })),
               candidates, count: candidates.length,
               highlighted: candidates.filter((c) => c.highlighted).length,
               legs_unread: read.unread,
               depth_stated: TENSIONS_DEPTH_STATED,
               says: "publishing discloses each of these, and is never blocked by a conflict (DEC-76 item 4): list "
                   + "each in tensionsDisclosed at op=publish, with your own words if you choose. A highlighted one "
                   + "rests on a side in conflict with a record you cannot see; the published case will not name "
                   + "that record or who holds it." };
    } catch (e) {
      return CaseAuthoring.#undetermined([{ finding: null, why: String(e && e.message || e).slice(0, 160) }]);
    }
  }

  /* ==========================================================================================================
   * op=publishpreflight: publishPreflight (R34; N364, DEC-80 item 3, REC-15: the ceremony's pre-flight)
   * ========================================================================================================== */
  /** R34: THE REAL REFUSALS, WITHOUT WRITING, BEFORE THE FIRST SCREEN. It runs `publishCase` over the same arguments
   *  inside a transaction it rolls back (R18), then `ratification.caseRatifyPreflight` (its R18) over the text that act
   *  would store, with `author` as signer. It answers `{ok: true, wrote: false, ready, first, blockers, steps}`:
   *  - `first` is exactly the refusal `op=publish` would give (DEC-8), or null when it would publish;
   *  - `blockers` is every other refusal reachable independently: each load-bearing member's shortfall on each axis of
   *    the bar (R6), hunch debt (R12), R35's, R31's as R32 reads it, and ratification R18's list (reached only when the
   *    act would publish, since it reads the document's bytes);
   *  - `ready` is true only when there is neither and ratification's list was read;
   *  - `steps` is the five steps' content (DEC-80 item 2), read from the same run.
   *  The rolled-back run does not raise re-evaluation (R15): its listeners are told synchronously and must not hear of
   *  an edition that was never made. It writes nothing.
   *
   *  `viewer` is the control plane's stamp, or `{stamp, aiCred}` when it stamps the caller's minted agent credential
   *  (N435, N407's other half): the act and every read here are asked as `stamp`, and ratification's pre-flight is
   *  given the whole, so its machine fences (its R18) hold an agent whatever its viewer stamp. */
  publishPreflight(args = {}) {
    const given = args && typeof args === "object" ? args : {};
    const carried = given.viewer && typeof given.viewer === "object" ? given.viewer : null;
    const a = carried ? { ...given, viewer: carried.stamp ?? null } : given;
    const seen = {};
    let answer = null, text = null;
    try {
      this.record.transact(() => {
        answer = this.#publishCase(a, { preflight: true, seen });
        if (answer && answer.ok === true) {
          const d = this.#one(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, answer.caseId, answer.edition);
          text = d ? d.text : null;
        }
        throw PREFLIGHT_ROLLBACK;
      });
    } catch (e) { if (e !== PREFLIGHT_ROLLBACK) throw e; }
    const first = answer && answer.ok === false ? answer : null;
    const ratify = text === null
      ? { reached: false, refusals: [],
          why: "ratification's pre-flight reads the document op=publish would store, and op=publish refuses first" }
      : this.#ratifyPreflight(text, str(a.author), given.viewer ?? null);
    /* The independent reads, each over the same arguments, each stopping only where its own prerequisite refuses. */
    const found = [];
    const who = str(a.author);
    const auth = who && !isMachineIdentity(who) ? this.#authority(a.project ?? null, a.viewer ?? null, who) : null;
    let judged = null, partition = null, tensions = null, rests = null;
    if (auth && auth.ok !== false) {
      const set = Array.isArray(a.targets) ? a.targets
                : typeof a.targets === "string" && a.targets.trim() ? a.targets.split(",") : a.target ? [a.target] : [];
      const members = [...new Set(set.map((x) => str(x)).filter(Boolean))];
      judged = members.length ? this.#judgeMembers(members, auth.proj, a.viewer ?? null, auth.gate) : null;
      if (judged && judged.ok !== false) {
        partition = this.#rolesOf(judged.prepared, a.roles ?? null, members);
        if (partition.ok !== false) found.push(...this.#barJudged(auth.proj, partition.loadBearing).shortfalls);
        const hunch = this.#hunchDebt(judged.prepared);
        if (hunch) found.push(hunch);
        if (partition.ok !== false) {
          const resting = this.#restingCaptures(judged.prepared);
          const facts = new Map([...new Set(resting.map((r) => r.capture))].map((sha) => [sha, this.#captureFacts(sha)]));
          found.push(...this.#selfAttestedJudged(resting, facts, partition.memberRoles, a.selfAttested ?? null).refusals);
          /* R44, then R53: R51's acceptances and R52's flags, read as op=publish reads them. */
          const reached = this.#materialsJudged(judged.prepared, partition.memberRoles, a.viewer ?? null);
          found.push(...reached.refusals);
          const accepted = this.#acceptedWorkJudged(reached.refs, a.viewer ?? null);
          found.push(...accepted.refusals);
          const flags = this.#flagsJudged(accepted.editions, a.flagsDisclosed ?? null);
          found.push(...flags.refusals);
          rests = { accepted: accepted.rows, flags };
        }
        tensions = this.#tensionsJudged(judged.prepared, a.viewer ?? null, a.tensionsDisclosed ?? null);
        found.push(...tensions.refusals);
      }
    }
    found.push(...ratify.refusals);
    const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
    const blockers = [];
    for (const r of found) if (!(first && same(r, first)) && !blockers.some((b) => same(b, r))) blockers.push(r);
    /* R42: whether the project has a notice, asked only of a project the act's own authority fences let through. */
    const notice = auth && auth.ok !== false ? this.#workingOn(auth.proj) : null;
    /* R42 says so whenever the project has a notice: whatever reference R41 would write. */
    const steps = this.#preflightSteps(a, answer, seen, ratify, notice, rests);
    /* Ready only when nothing refuses AND ratification's list was read: a list not reached is not a list that is empty. */
    return { ok: true, wrote: false, ready: !first && !blockers.length && ratify.reached, first, blockers, steps };
  }

  /* R34: ratification R18 over the text op=publish would store, with `signer` the act's author, folded into
     `{reached, refusals, why?}`. With no pre-flight offered, that is stated, never read as none. */
  #ratifyPreflight(text, signer, viewer) {
    const r = this.ratification;
    if (!r || typeof r.caseRatifyPreflight !== "function")
      return { reached: false, refusals: [], why: "ratification offers no pre-flight of the signing ceremony here" };
    let out = null;
    try { out = r.caseRatifyPreflight({ text, signer, viewer }); } catch { out = null; }
    /* K552 (5): `{ok: true, ready, refusals}`, or `PREFLIGHT_UNDETERMINED`, which is itself the blocker. */
    if (out && out.ok === true && Array.isArray(out.refusals))
      return { reached: true, refusals: out.refusals.filter((x) => x && typeof x === "object") };
    const undetermined = out && out.ok === false ? out
      : { ok: false, reason: "PREFLIGHT_UNDETERMINED", detail: "ratification's pre-flight gave no answer" };
    return { reached: false, refusals: [undetermined], why: undetermined.detail ?? "ratification's pre-flight is undetermined" };
  }

  /* R34: the five steps (DEC-80 item 2), each read from the rolled-back run when it published, and each part it could
     not reach stated as not reached, never filled. Step three carries R32's read as the ceremony shows it. */
  #preflightSteps(a, answer, seen, ratify, notice = null, rests = null) {
    const ok = !!(answer && answer.ok === true);
    const notReached = ok ? null : `not reached: op=publish refuses first (${answer ? answer.reason : "no answer"})`;
    const tensions = this.tensionsToDisclose({ project: a.project ?? null, targets: a.targets ?? null,
                                               target: a.target ?? null, viewer: a.viewer ?? null, author: a.author ?? null });
    return [
      { step: 1, name: "what becomes permanent",
        says: "Signing publishes this case edition, and each finding in it at the version pinned here. A published "
            + "edition is never withdrawn or edited: it is corrected only by a later edition."
            /* R42 (DEC-111; K1031 (3)): the plain sentence until the UX design stream gives the words. */
            /* R34 (DEC-112 (4)): the plain sentence until the UX design stream gives the words. */
            + ` ${REPUBLISH_SENTENCE}`
            + (notice !== null ? ` ${NOTICE_SEALS_SENTENCE}` : ""),
        working_on: notice,
        ...(ok ? { case: answer.caseId, edition: answer.edition, document: answer.caseDocument,
                   pinned: answer.findings.map((f) => ({ target: f.target, bundleSha: f.bundleSha })) }
               : { stated: notReached }) },
      { step: 2, name: "what this rests on",
        ...(ok ? { roles: answer.roles, required: answer.required,
                   pairs: answer.findings.map((f) => ({ target: f.target, role: f.role, strength: f.strength })) }
               : { stated: notReached }),
        /* R53: each accepted_work: row, as R51 reads it. */
        accepted_work: rests ? rests.accepted : { stated: "not reached: the members or their roles are refused first" } },
      { step: 3, name: "what you are leaving out",
        tensions: tensions.ok === false ? tensions : { candidates: tensions.candidates, count: tensions.count,
                                                        highlighted: tensions.highlighted, says: tensions.says },
        /* R53: the flags R52 requires, read as R52 reads them, beside R32's tensions. */
        flags: !rests ? { stated: "not reached: the members or their roles are refused first" }
          : rests.flags.refusals.some((x) => x.reason === "FLAGS_UNDETERMINED") ? rests.flags.refusals[0]
          : { open: rests.flags.open.map(({ flag, ref, edition, issue, at }) => ({ flag, ref, edition, issue, at })),
              count: rests.flags.open.length, says: FLAGS_SAY },
        ...(ok ? { excluded: seen.excluded, searched: seen.searched, bias: { acknowledgement: seen.bias,
                                                                              manifest: seen.manifest },
                   self_attested: seen.captures.filter((c) => c.self_attested_only)
                     .map((c) => ({ capture: c.capture, member: c.member, reason: c.acknowledgement.reason,
                                    sentence: SELF_ATTESTED_SENTENCE })),
                   not_co_attested: [...new Set(seen.captures.filter((c) => !c.co_attested).map((c) => c.capture))],
                   sources: seen.sources,
                   /* R34 (DEC-112 (5)): each source the case shows as "Withheld" (R37). */
                   withheld: seen.sources.filter((x) => x.basis === null) }
               : { stated: notReached }) },
      { step: 4, name: "the edition this creates",
        ...(ok ? { case: answer.caseId, edition: answer.edition, minted: answer.minted, members: seen.memberEditions }
               : { stated: notReached }) },
      { step: 5, name: "sign", signer: str(a.author) || null,
        ratification: ratify.reached ? { reached: true, refusals: ratify.refusals }
                                     : { reached: false, why: ratify.why },
        next: ok ? `op=caseratify over op=publish's document (case ${answer.caseId}, edition ${answer.edition})`
                 : "op=publish first" },
    ];
  }

  /** R41 (DEC-111; `case-grammar` R10): the project reference a case carries, `network-notices.noticeReferenceOf`
   *  (its R19) exactly as it answers for `project`: the notice id of the project's open or most recent notice, or null
   *  (undefined read as null). It is written only through case-grammar's `workingOnLines`, which writes no line for
   *  null and writes any other value as handed, so a malformed one reaches ratification R38's refusal at signing and is
   *  never corrected or dropped here (K1144). R42 reads the same answer. */
  #workingOn(project) {
    const ref = this.networkNotices.noticeReferenceOf(project);
    return ref === undefined ? null : ref;
  }

  /* The project an unsigned preparation of a case names, or null (publication R40: `case_documents`). */
  #preparedProject(caseId) {
    const d = this.#one(`SELECT text FROM case_documents WHERE case_id=? AND sig_armored IS NULL
                         ORDER BY edition DESC LIMIT 1`, caseId);
    const named = d ? str((parseFrontmatter(d.text).data || {}).case_project) : "";
    return named || null;
  }

  /* A case's highest published edition, 0 when it has none (publication R40: `published_cases`). */
  #highestEdition(caseId) {
    const t = this.#one(`SELECT MAX(edition) AS m FROM published_cases WHERE case_id=?`, caseId);
    return t && t.m != null ? Number(t.m) : 0;
  }

  /** R16 — REC-219 / D-579(a): A CASE'S CITATION EDGES AND THE VERSION EACH RESTS ON, read at the act. The project's
   *  `references[]` entries of `rel: cites` that are not severed, in the document's order, each classified from its
   *  own bytes first: an `extent_capture` on the edge is the pin. Without one, what the record can say depends on how
   *  many captures it holds of the document NOW: one (`only_capture`), several (`undetermined`, never back-filled),
   *  none (`no_capture`). A question has no bytes (`no_bytes`). Set-based: one grouped count per chunk of targets
   *  (provenance R48's `register`, extraction R58's `readings`), never one read per edge. */
  #caseCitations(project) {
    const text = this.#liveText(project);
    const refs = text !== null ? (parseFrontmatter(text).data?.references || []) : [];
    const edges = (Array.isArray(refs) ? refs : []).filter((r) => r && typeof r === "object" && r.rel === "cites"
      && r.status !== "severed" && typeof r.target === "string" && r.target.trim());
    const isDocument = (t) => normalizeType(OBJECT_TYPES[t.split("-")[0]]) === "information";
    const docs = [...new Set(edges.map((r) => r.target.trim()).filter(isDocument))];
    const held = new Map();
    const half = Math.floor(SELECTION_ID_CHUNK / 2);
    for (let i = 0; i < docs.length; i += half) {
      const part = docs.slice(i, i + half), qs = part.map(() => "?").join(",");
      for (const r of this.#rows(
        `SELECT bundle_id AS t, COUNT(DISTINCT capture_sha) AS n, MIN(capture_sha) AS one FROM (
           SELECT bundle_id, capture_sha FROM register WHERE bundle_id IN (${qs})
           UNION ALL
           SELECT bundle_id, capture_sha FROM readings WHERE bundle_id IN (${qs}))
         GROUP BY bundle_id`, ...part, ...part)) held.set(r.t, { n: r.n, one: r.one });
    }
    return edges.map((r) => {
      const t = r.target.trim();
      const pin = typeof r.extent_capture === "string" && /^[0-9a-f]{64}$/.test(r.extent_capture.trim())
        ? r.extent_capture.trim() : null;
      if (!isDocument(t)) return { target: t, version: "no_bytes", capture: null };
      if (pin) return { target: t, version: "pinned", capture: pin };
      const h = held.get(t);
      if (!h || !h.n) return { target: t, version: "no_capture", capture: null };
      return h.n === 1 ? { target: t, version: "only_capture", capture: h.one }
                       : { target: t, version: "undetermined", capture: null };
    });
  }

  /** R40 — DEC-103: THE LENS THIS CASE WAS PRODUCED UNDER, READ WHOLE. Every statement in the effective set of the
   *  manifest frozen at this act (bias R13–R18, every page, read as the plane like the stamp beside it), each with each
   *  of its citations marked whether it may be printed: public material only, being a public web address
   *  (record-grammar's public-locator test, its R19) or a bundle or hash this copy has published (publication's
   *  registries: R12's `publishedTargets` for a bundle id; R40's `published_shas` and `published_bundles.bundle_sha` for
   *  a hash). Every other citation is handed on as withheld, so case-grammar R9 counts it and never writes it. Answers
   *  `{in_force, stated, statements: [{bundle, id, kind, subject, text, justification, citations: [{citation,
   *  printed}]}]}`; with no manifest in force, or one undetermined, no statement. */
  #lensStatements(project) {
    const read = (offset) => this.bias.biasManifest({ scope: "project", scopeId: project, viewer: "admin",
                                                      limit: LENS_PAGE, offset });
    let page = read(0);
    if (!page || page.in_force !== true)
      return { in_force: page && page.in_force === null ? null : false,
               stated: page && page.in_force === null ? String(page.stated ?? "") : "no manifest was in force",
               statements: [] };
    const all = [...(Array.isArray(page.statements) ? page.statements : [])];
    while (page.truncated && Array.isArray(page.statements) && page.statements.length) {
      page = read(all.length);
      all.push(...(Array.isArray(page.statements) ? page.statements : []));
    }
    const cited = (s) => (Array.isArray(s.citations) ? s.citations : [])
      .map((c) => (c == null ? "" : String(c).trim())).filter(Boolean);
    const asked = [...new Set(all.flatMap(cited).filter((c) => !isPublicHttpsLocator(c)))];
    const hashes = asked.filter((c) => /^[0-9a-f]{64}$/i.test(c)).map((c) => c.toLowerCase());
    const published = new Set();
    /* Each hash is bound twice, so half a chunk keeps the statement under D-36's ceiling. */
    const half = Math.floor(SEARCHED_CHUNK / 2);
    for (let i = 0; i < hashes.length; i += half) {
      const part = hashes.slice(i, i + half), marks = part.map(() => "?").join(",");
      for (const r of this.#rows(`SELECT sha256 AS h FROM published_shas WHERE sha256 IN (${marks})
                                  UNION SELECT bundle_sha AS h FROM published_bundles WHERE bundle_sha IN (${marks})`,
                                 ...part, ...part)) published.add(String(r.h).toLowerCase());
    }
    const ids = asked.filter((c) => !/^[0-9a-f]{64}$/i.test(c));
    for (let i = 0; i < ids.length; i += PUBLISHED_TARGETS_CHUNK) {
      const t = this.publication.publishedTargets(ids.slice(i, i + PUBLISHED_TARGETS_CHUNK));
      for (const [id, e] of Object.entries((t && t.registry) || {}))
        if (e && e.editions && Object.keys(e.editions).length) published.add(id);
    }
    const isPublic = (c) => isPublicHttpsLocator(c) || published.has(/^[0-9a-f]{64}$/i.test(c) ? c.toLowerCase() : c);
    return { in_force: true, stated: null,
             statements: all.map((s) => ({ bundle: s.bundle_id, id: s.statement_id, kind: s.kind, subject: s.subject,
                                           text: s.text, justification: s.justification,
                                           citations: cited(s).map((c) => ({ citation: c, printed: isPublic(c) })) })) };
  }

  /** R17 — THE CASE'S OWN SUBJECTS, GATHERED DOWNWARD (`OBSERVATION-LOG-DESIGN.md` §8 row 4). `searchedSection` decides
   *  what the answers MEAN; this decides WHAT IS ASKED ABOUT, which is the half a dishonest section gets wrong. The
   *  direction is one-way: subjects come DOWN from the members (inquiry R40's `inquiry_basis.content_id` → content R45's
   *  `content.capture_sha` → provenance R48's `captured_locators.address_norm`), and the log (observation-log R29) is
   *  consulted only to ask what became of a subject the case already named.
   *
   *  A leg with no content row is a referent the case rests on that cannot be named at the content level, which is not
   *  a referent nobody looked at: counted as `unidentified`, capping its level at `partial`. The DOCUMENT level cannot
   *  say `never_looked`: every document-level subject is the address of a capture we hold, so possession IS the look
   *  (`pre_log` always). Past `SEARCHED_SUBJECT_MAX` captures the overflow is folded into `unidentified`. */
  #searchedForCase(members, at) {
    const roster = [...new Set((members || []).filter((m) => typeof m === "string" && m))];
    const chunked = (vals, fn) => { for (let i = 0; i < vals.length; i += SEARCHED_CHUNK) fn(vals.slice(i, i + SEARCHED_CHUNK)); };

    /* THE BASIS LEGS of the findings this case rests on; a member with no legs contributes nothing. */
    const contentIds = new Set();
    let legsUnresolved = 0;
    if (roster.length) chunked(roster, (part) => {
      const marks = part.map(() => "?").join(",");
      for (const r of this.#rows(`SELECT content_id FROM inquiry_basis WHERE bundle_id IN (${marks})`, ...part)) {
        if (typeof r.content_id === "string" && r.content_id) contentIds.add(r.content_id);
        else legsUnresolved += 1;   /* the nullable column, counted where it is met */
      }
    });

    /* THE CAPTURES THOSE LEGS NAME; a content id with no row is unresolved for the same reason a null one is. */
    const captures = new Set();
    let contentUnresolved = 0;
    if (contentIds.size) chunked([...contentIds], (part) => {
      const marks = part.map(() => "?").join(",");
      const seen = new Set();
      for (const r of this.#rows(`SELECT content_id, capture_sha FROM content WHERE content_id IN (${marks})`, ...part)) {
        seen.add(r.content_id);
        if (typeof r.capture_sha === "string" && r.capture_sha) captures.add(r.capture_sha);
      }
      contentUnresolved += part.filter((c) => !seen.has(c)).length;
    });

    const capList = [...captures].slice(0, SEARCHED_SUBJECT_MAX);
    const capOver = Math.max(0, captures.size - capList.length);

    /* THE ADDRESSES (the earliest fetch answers "was this looked for") AND THE REGISTRATION TIMES §5.1's order needs. */
    const addrOf = new Map();
    const registeredOf = new Map();
    if (capList.length) chunked(capList, (part) => {
      const marks = part.map(() => "?").join(",");
      for (const r of this.#rows(
        `SELECT capture_sha, address_norm, MIN(first_retrieved) AS first_retrieved
           FROM captured_locators WHERE capture_sha IN (${marks}) GROUP BY capture_sha`, ...part))
        if (typeof r.address_norm === "string" && r.address_norm) addrOf.set(r.capture_sha, r.address_norm);
      for (const r of this.#rows(`SELECT capture_sha, registered FROM register WHERE capture_sha IN (${marks})`, ...part))
        registeredOf.set(r.capture_sha, r.registered || null);
    });

    /* THE LOOKUP, BATCHED PER LEVEL: the latest row per subject, `MAX(seq) GROUP BY subject` narrowed by level and kind
       (the frontier's own shape), never a point read per subject. */
    const latestMap = (level, kind, subjects) => {
      const out = new Map();
      if (!subjects.length) return out;
      chunked(subjects, (part) => {
        const marks = part.map(() => "?").join(",");
        for (const r of this.#rows(
          `SELECT subject, state FROM observation_log
            WHERE seq IN (SELECT MAX(seq) FROM observation_log
                           WHERE level = ? AND subject_kind = ? AND subject IN (${marks})
                           GROUP BY subject)`, level, kind, ...part))
          out.set(r.subject, r.state ? String(r.state) : null);
      });
      return out;
    };

    const levels = [];
    /* DOCUMENT — addresses. `pre_log` always, never cause (3). The unresolved legs count here too: the chain to an
       address runs through the same missing row, so omitting them would report `no_subjects` about a case resting on
       referents it merely could not name. */
    {
      const addrs = capList.map((sha) => addrOf.get(sha)).filter(Boolean);
      const seen = latestMap("document", "address", addrs);
      const subjects = addrs.map((addr) => {
        const state = seen.get(addr) || null;
        return { subject: addr, state, cause: state ? null : "pre_log" };
      });
      const missingAddr = capList.filter((s) => !addrOf.has(s)).length;
      levels.push({ level: "document", subject_kind: "address", subjects,
                    unidentified: missingAddr + capOver + legsUnresolved + contentUnresolved });
    }
    /* CONTENT — captures, under §5.1's rule with the content level's pre-log evidence (`readings`). */
    {
      const seen = latestMap("content", "capture", capList);
      const subjects = capList.map((sha) => {
        const state = seen.get(sha) || null;
        return { subject: sha, state, cause: state ? null : this.#missingContentCause(sha, registeredOf.get(sha) || null) };
      });
      levels.push({ level: "content", subject_kind: "capture", subjects,
                    unidentified: legsUnresolved + contentUnresolved + capOver });
    }
    /* MEANING — the reader run over each capture. ONLY THE `capture` SUBJECT KIND: the references and entities inside a
       document are what a derivation would discover, so enumerating them from the case would mean enumerating them from
       the log, the one direction this computation refuses. */
    {
      const seen = latestMap("meaning", "capture", capList);
      const subjects = capList.map((sha) => {
        const state = seen.get(sha) || null;
        return { subject: sha, state, cause: state ? null : this.#missingMeaningCause(sha, registeredOf.get(sha) || null) };
      });
      levels.push({ level: "meaning", subject_kind: "capture", subjects,
                    unidentified: legsUnresolved + contentUnresolved + capOver });
    }
    return searchedSection({ at, subjectSource: "case_basis", levels });
  }

  /* REC-94: which of §5.1's causes explains a missing CONTENT-level row: observation-log's rule (its R11), asked with
     this level's pre-log evidence, a reading of the capture (extraction R58's `readings`). One indexed hit. */
  #missingContentCause(captureSha, registeredAt = null) {
    const hasReading = !!this.#one(`SELECT 1 x FROM readings WHERE capture_sha = ?`, captureSha);
    return this.observations.missingCauseAt("content", { hasArtifact: hasReading, registeredAt });
  }

  /* REC-95: the same at the MEANING level for a capture subject, whose pre-log evidence is also a reading; the case's
     searched section computes only the capture kind (above), so the reference and entity probes stay with the log's
     other readers. */
  #missingMeaningCause(captureSha, enteredAt = null) {
    const hasReading = !!this.#one(`SELECT 1 x FROM readings WHERE capture_sha = ?`, captureSha);
    return this.observations.missingCauseAt("meaning", { hasArtifact: hasReading, registeredAt: enteredAt });
  }

  /* ==========================================================================================================
   * op=statementack: acknowledgeStatement (R19–R21), with the acknowledger's own words (`reason`, DEC-88)
   *
   * D-150 / §3 rule 11: a SECOND person's reading of the case's exclusion statement, before it is signed. The act is
   * keyed on the statement's SHA-256 (as the document prints it), the project and the case identity it stood at, so
   * an edited statement is a different sentence and its old acknowledgements match nothing. NOTHING HERE, AND NOTHING
   * IN `publishCase`, REFUSES PUBLICATION FOR WANT OF ONE: a group may be one person.
   *
   * THE DOORS ARE THE REVIEW COPY'S (publication R23's provider): a recipient through a live grant, a member through
   * the draft door or, for an unsigned case document, publication's standing test (its R1). Every caller neither door
   * admits gets the one dead answer. POSITION is membership's `isJoinedParticipant`: sight is not a place.
   * ========================================================================================================== */
  acknowledgeStatement({ draft = null, caseId = null, edition = null, secretSha = null, viewer = null,
                         bySecret = false, reason = undefined } = {}) {
    const review = this.#review();
    let project, ident, statement, statementAuthor, kind, by, grantId = null, recipient = null, draftId = null;
    /* D-568: whether the draft asked for a new case; the answer states the edition through the provider's rule. */
    let draftNewCase = false;
    /* REC-193: the author was read from a DRAFT's `statement_by`, the one place its UNDETERMINED is reachable. */
    let authorFromDraft = false;
    const ack = (code, detail, extra) => refusal(STATEMENT_ACK_CHECKS, code, { detail, ...(extra || {}) });
    /* REC-212: the case document door's own UNDETERMINED (its `statement_by` present and null). */
    let authorStatedUndetermined = false;
    /* REC-212: the case document's `completeness.author`, who PREPARED AND PUBLISHED it: a second exclusion. */
    let blockAuthor = null;
    if (bySecret) {
      const live = review.liveGrant(secretSha);
      if (!live || (draft && String(draft).trim() !== live.draft.draft_id)) return review.deadAnswer();
      const d = live.draft;
      const params = JSON.parse(d.params);
      project = d.project_id; ident = review.draftIdentity(d); draftId = d.draft_id;
      draftNewCase = !!params.newCase;
      /* REC-193 / §3 rule 13: the statement's author is WHO WROTE ITS CURRENT BYTES, stamped at the draft write that
         changed them, never `updated_by`. */
      statement = params.statement; statementAuthor = d.statement_by ?? null;
      authorFromDraft = true;
      kind = "recipient"; by = live.grant.grant_id; grantId = live.grant.grant_id; recipient = live.grant.recipient;
    } else {
      const v = String(viewer ?? "");
      if (!v.startsWith("member:")) return review.deadAnswer();
      const who = v.slice("member:".length);
      if (draft) {
        const d = review.draftForMember(draft, v);
        if (!d) return review.deadAnswer();
        const params = JSON.parse(d.params);
        project = d.project_id; ident = review.draftIdentity(d); draftId = d.draft_id;
        draftNewCase = !!params.newCase;
        statement = params.statement; statementAuthor = d.statement_by ?? null;
        authorFromDraft = true;
      } else {
        const cid = str(caseId), ed = Number(edition);
        /* DEC-49 REGION is-statement-ack-subject */
        if (!cid || !Number.isInteger(ed) || ed < 1)
          return ack("STATEMENT_ACK_NO_SUBJECT",
                     "name the statement to acknowledge: draft=<a draft case's id>, or case=<case id>&"
                   + "edition=<n> for a case document authored and not yet signed.");
        /* END DEC-49 REGION is-statement-ack-subject */
        /* publication R40's read contract; the standing test is publication's (its R1). */
        const doc = this.#one(`SELECT case_id, edition, text, ratified_at FROM case_documents
                               WHERE case_id=? AND edition=?`, cid, ed);
        if (!doc || !this.publication.hasCaseStanding(doc, v)) return review.deadAnswer();
        /* DEC-49 REGION is-statement-ack-signed */
        if (doc.ratified_at)
          return ack("STATEMENT_ACK_ALREADY_SIGNED",
                     `case ${cid} edition ${ed} is signed, and its completeness block — which lists who `
                   + `acknowledged its statement — is what the signature covers. An acknowledgement now `
                   + `could appear in no signed document of this edition; a published edition is `
                   + `corrected forward, by the next one (DEC-12).`,
                     { caseId: cid, edition: ed });
        /* END DEC-49 REGION is-statement-ack-signed */
        const fm = parseFrontmatter(doc.text).data || {};
        project = str(fm.case_project);
        ident = { caseId: cid, edition: ed };
        const c = fm.completeness && typeof fm.completeness === "object" ? fm.completeness : {};
        statement = c.statement;
        /* REC-212 / §3 rule 13 — ON THIS DOOR TOO, THE EXCLUSION IS OF THE SENTENCE'S WRITER AND NOT OF THE CASE'S
           PUBLISHER; and the publisher stays refused, since they authored the block at publication. A document with no
           `statement_by` key predates rule 13 and is read in its own shape (`author` is the only name it holds). */
        if (Object.prototype.hasOwnProperty.call(c, "statement_by")) {
          statementAuthor = typeof c.statement_by === "string" ? c.statement_by.trim() : "";
          authorStatedUndetermined = !statementAuthor;
          blockAuthor = str(c.author) || null;
        } else {
          statementAuthor = str(c.author);
        }
      }
      /* DEC-49 REGION is-statement-ack-participant */
      if (!project || !this.membership.isJoinedParticipant(project, who))
        return ack("STATEMENT_ACK_NOT_A_PARTICIPANT",
                   "an acknowledgement of a case's exclusion statement is given by a JOINED participant of "
                 + "the project that produces the case, or by the recipient of a review copy through their "
                 + "grant (BIO_Publication §3 rule 11). Sight of a project is not a place in it: an "
                 + "invited member who has not joined, and an administrator, are neither.");
      /* END DEC-49 REGION is-statement-ack-participant */
      kind = "participant"; by = who;
    }
    const text = fmSafe(statement);
    /* DEC-49 REGION is-statement-ack-statement */
    if (!text)
      return ack("STATEMENT_ACK_NO_STATEMENT",
                 "this draft states nothing about what its case excludes, so there is no statement to "
               + "acknowledge yet. The draft's editor authors it (statement=); acknowledge it then.");
    /* END DEC-49 REGION is-statement-ack-statement */
    /* REC-193 / §3 rule 13 — A WRITER NOT RECORDED IS STATED, NOT GUESSED: an acknowledgement recorded against an
       unknown author may BE the author's own. It costs the act and not the case. A recipient is unaffected. */
    /* DEC-49 REGION is-statement-ack-author-undetermined */
    if (kind === "participant" && (authorFromDraft || authorStatedUndetermined) && !statementAuthor)
      return ack("STATEMENT_ACK_AUTHOR_UNDETERMINED",
                 (authorFromDraft
                   ? `this draft records no author for its exclusion statement: it was written before the `
                   + `plane stamped one, and who wrote the sentence that now stands is UNDETERMINED. `
                   : `this case document states that who wrote its exclusion statement could not be `
                   + `established, so the author of the sentence is UNDETERMINED — and it is not the member `
                   + `named as the case's author, who prepared and published it (BIO_Publication §3 rule 13). `)
                   + `An acknowledgement is a SECOND person's reading (BIO_Publication §3 rule 11), and the `
                   + `plane cannot tell here whether you are the first — reading the draft's last editor `
                   + `would attribute the statement to whoever last touched any part of it. `
                   + (authorFromDraft
                     ? `An editor of this project saves the statement again (op=casedraft with statement=), `
                     + `which records who wrote its current bytes; acknowledge it then. `
                     : `Publish this edition again from a draft whose statement carries an author `
                     + `(op=publish), and this document will name the member who wrote the sentence. `)
                   + `The case publishes either way.`,
                 { draft: draftId, author: null });
    /* END DEC-49 REGION is-statement-ack-author-undetermined */
    /* THE AUTHOR'S OWN ACKNOWLEDGEMENT IS REFUSED BY NAME: the rule's whole content is a SECOND person. The author is
       the member who wrote the statement's current bytes (§3 rule 13), and on the case door the publisher too. */
    /* DEC-49 REGION is-statement-ack-by-its-author */
    if (kind === "participant" && ((statementAuthor && by === statementAuthor)
                                   || (blockAuthor && by === blockAuthor)))
      return ack("STATEMENT_ACK_BY_ITS_AUTHOR",
                 (statementAuthor && by === statementAuthor
                   ? `you wrote this statement, and its acknowledgement is a SECOND person's reading of what `
                   + `the case leaves out (BIO_Publication §3 rule 11). `
                   : `you prepared and published this case and authored its completeness block at that act, so `
                   + `you are its FIRST reader; an acknowledgement is a SECOND person's reading of what the `
                   + `case leaves out (BIO_Publication §3 rule 11). Who WROTE the statement is a separate `
                   + `fact, stated separately in these bytes (§3 rule 13). `)
                   + `Ask a participant of this project, or `
                   + `hand the draft to a reader through a review grant. The case publishes without one and `
                   + `says so.`,
                 { author: statementAuthor && by === statementAuthor ? statementAuthor : blockAuthor });
    /* END DEC-49 REGION is-statement-ack-by-its-author */
    /* R19 — DEC-88 (K1025, K1030): THE ACKNOWLEDGER'S OWN WORDS, kept with the acknowledgement and shown in R20's list.
       Asked after C-82.6, the last refusal before anything is read for the write, so nothing is written. Counted in code
       points (K1050's reading); blank is empty after trimming. */
    /* DEC-49 REGION is-statement-ack-reasoned */
    if (typeof reason !== "string" || !reason.trim() || [...reason].length > STATEMENT_ACK_REASON_MAX)
      return ack("STATEMENT_ACK_NO_REASON",
                 `an acknowledgement of a case's exclusion statement is recorded with the acknowledger's own words on `
               + `it (reason=), at most ${STATEMENT_ACK_REASON_MAX} characters: say what you read and what you make of `
               + `what the case leaves out. ` + (typeof reason !== "string" ? "None were given." : !reason.trim()
                 ? "The words given were blank." : `The words given are ${[...reason].length} characters.`)
               + ` Nothing was written.`);
    /* END DEC-49 REGION is-statement-ack-reasoned */
    const sha = statementSha(text);
    /* THE UNSIGNED DOCUMENTS OF THIS STATEMENT, AT THIS CASE IDENTITY, IN THIS PROJECT, read before anything is written
       (publication R40): the case door's own document, or the one a publisher named this draft for (REC-217). At most
       two, by two keyed reads: `(case_id, edition)` is the key, and one draft is bound to one case edition. A draft
       naming no case has no identity and reaches only the document it was named for (REC-194). */
    const needle = `\n  statement_sha: ${sha}\n`;
    const projectLine = `\ncase_project: ${project}\n`;
    const docCols = `case_id, edition, doc_sha, text, draft_id, authored_by, authored_at`;
    const docMatch = `sig_armored IS NULL AND edition=? AND instr(text, ?) > 0 AND instr(text, ?) > 0`;
    const byIdentity = ident.caseId == null ? null
      : this.#one(`SELECT ${docCols} FROM case_documents WHERE case_id=? AND ${docMatch}`,
                  ident.caseId, ident.edition, needle, projectLine);
    const byLink = !draftId ? null
      : this.#one(`SELECT ${docCols} FROM case_documents WHERE draft_id=? AND ${docMatch}`,
                  draftId, ident.edition, needle, projectLine);
    const found = [byIdentity, byLink]
      .filter((d, i, all) => d && all.findIndex((e) => e && e.case_id === d.case_id) === i)
      .sort((a, b) => (a.case_id < b.case_id ? -1 : a.case_id > b.case_id ? 1 : 0));
    /* R20: keyed by the statement, the project, the identity it was given at and the acknowledger; at no case identity
       the draft is part of what was read (REC-217). A repeat answers `existed: true`. */
    const same = this.#one(`SELECT ack_id, at, reason FROM statement_acknowledgements
                            WHERE project_id=? AND statement_sha=? AND case_id IS ? AND edition=?
                              AND acknowledger_kind=? AND acknowledger=?
                              AND (? IS NOT NULL OR draft_id IS ?)`,
                           project, sha, ident.caseId ?? null, ident.edition, kind, by,
                           ident.caseId ?? null, draftId);
    const when = same ? same.at : this.#when("millisecond");
    /* A repeat keeps the first reason (R20: `existed: true`, nothing rewritten). */
    if (!same)
      this.sql.exec(`INSERT INTO statement_acknowledgements (project_id,case_id,edition,statement_sha,draft_id,
                     acknowledger_kind,acknowledger,recipient,at,reason) VALUES (?,?,?,?,?,?,?,?,?,?)`,
                    project, ident.caseId ?? null, ident.edition, sha, draftId, kind, by, recipient, when, reason);
    /* The parse is the authority on the project, the SQL match its index. */
    const docs = found.filter((d) => str((parseFrontmatter(d.text).data || {}).case_project) === project);
    const reauthored = docs.map((d) => this.#reauthorAcknowledgements(d));
    /* REC-217: which case edition, if any, a publisher named this draft for (signed or not). */
    const linkedTo = ident.caseId == null && draftId ? this.#draftLinkOf(draftId) : null;
    return { ok: true, existed: !!same,
             acknowledgement: { kind, by, recipient, grant_id: grantId, at: when,
                                reason: same ? same.reason ?? null : reason, project,
                                case_id: ident.caseId ?? null, edition: review.statedEdition(ident, draftNewCase),
                                draft_id: draftId, statement_sha: sha },
             /* Each unsigned document of this statement, re-authored to list it: its NEW hash is what the owner signs. */
             case_documents: reauthored,
             bound_to_a_case: ident.caseId != null || !!linkedTo,
             ...(linkedTo ? { draft_link: { case_id: linkedTo.case_id, edition: Number(linkedTo.edition),
                                            named_by: linkedTo.authored_by ?? null,
                                            named_at: linkedTo.authored_at ?? null,
                                            signed: !!linkedTo.sig_armored } } : {}),
             listed: linkedTo
               ? `this is a reading of draft ${draftId}, which ${linkedTo.authored_by} named as the draft of `
                   + `edition ${linkedTo.edition} of ${linkedTo.case_id} when publishing it (${linkedTo.authored_at}), `
                   + `so it is a reading of that case (BIO_Publication §3 rule 13). `
                   + (linkedTo.sig_armored
                     ? `That edition is already SIGNED, and its list is what the signature covers: this reading `
                       + `can appear in no signed document of it, and is recorded as the act it was.`
                     : `Its case document is authored and unsigned, so it now lists this reading (case_documents), `
                       + `re-authored; its owner signs the new bytes.`)
               : ident.caseId != null
               ? `the completeness block of ${review.caseIdentitySentence(ident.caseId, ident.edition)} `
                   + `lists this acknowledgement when its case document is authored with this exact statement `
                   + `(op=publish), or — if that document is already authored and unsigned — now, re-authored `
                   + `(case_documents). A statement edited afterwards is a different sentence, and this `
                   + `acknowledgement is not listed under it. It is listed under NO OTHER CASE, even one whose `
                   + `statement is byte-identical: reading this case's statement is not reading that one's.`
               : `this is a reading of draft ${draftId}, which names no case — a case id is minted only by `
                   + `publication, so this acknowledgement is bound to NO case identity yet. op=reviewcopy `
                   + `lists it for this draft. NO case document lists it, and that is deliberate: a case `
                   + `document that named you would be claiming you read ITS statement, which this record `
                   + `cannot establish of any case (§3 rule 13) — UNTIL the case is published naming this draft `
                   + `(op=publish&draft=${draftId}): at that act this reading binds to the case it produced, `
                   + `and its document lists it with the link stated (REC-217, BOB #33). Published without `
                   + `draft=, it is counted there as undetermined and never named. A statement edited `
                   + `afterwards is a different sentence, and this acknowledgement is not listed under it.` };
  }

  /* REC-217 / §3 rule 13 (BOB #33): the case edition a publisher named this draft for, read off the act's own record
     (publication R40's `case_documents.draft_id`, with the act's `authored_by` and `authored_at`), or null. One row at
     most by construction: R9 refuses a second binding of one draft. */
  #draftLinkOf(draftId) {
    return this.#one(`SELECT case_id, edition, authored_by, authored_at, sig_armored FROM case_documents
                      WHERE draft_id=? LIMIT 1`, String(draftId ?? ""));
  }

  /* R20: AN ACKNOWLEDGEMENT THAT LANDS WHILE ITS CASE DOCUMENT IS AUTHORED AND UNSIGNED RE-AUTHORS THAT DOCUMENT'S LIST,
     because the list must be inside the signature and `op=publish` cannot run twice over one prepared edition. Only
     the list's two runs change, through publication's one splice (its R21), and only while the document is unsigned
     and still at the hash read, so a signature over the old bytes is refused stale and the owner signs what names the
     second reader. A document authored before this landing carries neither run and is left as it is, and says so. The
     runs are located by case-grammar's one locator (its R3, N424), the one `reauthorSection` splices by. */
  #reauthorAcknowledgements(doc) {
    const fm = parseFrontmatter(doc.text).data || {};
    const c = fm.completeness && typeof fm.completeness === "object" ? fm.completeness : {};
    if (!SECTIONS.acknowledgements(doc.text.split("\n")))
      return { case_id: doc.case_id, edition: doc.edition, reauthored: false,
               why: "this case document was authored before acknowledgements were recorded, so it has no list "
                  + "to add to; it is left exactly as it was signed-for-review" };
    const project = str(fm.case_project);
    /* REC-212: the writer exclusion travels with the splice, read from the document's own bytes; a document with no
       `statement_by` key predates rule 13 and is not asked. */
    const writer = Object.prototype.hasOwnProperty.call(c, "statement_by")
      ? { by: typeof c.statement_by === "string" && c.statement_by.trim() ? c.statement_by.trim() : null }
      : null;
    /* REC-217: the link read off the row's own record of the act, so a splice lists exactly what `op=publish` would. */
    const link = doc.draft_id ? { draft: doc.draft_id, by: doc.authored_by ?? null, at: doc.authored_at ?? null } : null;
    const acks = this.statementAcknowledgements(project, doc.case_id, doc.edition, c.statement ?? "",
                                                str(c.author) || null, writer, null, link);
    const after = this.publication.reauthorSection({ caseId: doc.case_id, edition: doc.edition, docSha: doc.doc_sha,
                                                     section: "acknowledgements",
                                                     lines: { frontmatter: ackFrontmatterLines(acks),
                                                              body: ackBodyLines(acks, project) } });
    const nowSha = after ? after.doc_sha ?? null : null;
    if (nowSha === doc.doc_sha) return { case_id: doc.case_id, edition: doc.edition, reauthored: false, doc_sha: doc.doc_sha };
    return { case_id: doc.case_id, edition: doc.edition, reauthored: nowSha !== null,
             doc_sha: nowSha, acknowledged: acks.rows.length,
             read: `op=casedocument&case=${doc.case_id}&edition=${doc.edition}` };
  }

  /** R20: THE ACKNOWLEDGEMENTS OF ONE STATEMENT AT ONE CASE IDENTITY, the one list: `op=publish` prints it (R14) and
   *  the review copy shows it, so the list a reviewer sees and the list a document prints are one read. Bounded, and
   *  a list that hit the bound says so.
   *
   *  THREE EXCLUSIONS AND A LINK, each a different question about one list:
   *   - `exceptAuthor` is the member PUBLISHING: they author the completeness block, so their own reading of it is not a
   *     second one (D-150; counted as `byAuthor`).
   *   - `writer` is who wrote the SENTENCE (R21): `null` means not asked; `{by: '<member>'}` withholds that member's
   *     rows; `{by: null}` is UNDETERMINED and withholds EVERY participant row, since any may be the writer's own. A
   *     recipient row is never withheld (a grant's holder is never the writer). Every withholding is counted.
   *   - `draftId` is the identity match for a draft naming no case (REC-194): its readings are those given through THAT
   *     draft, never another's of the same sentence.
   *   - `link` (`{draft, by, at}`, REC-217) is the draft a publisher named for this case edition: its no-identity
   *     readings join the list, each carrying `draft`.
   *  `unbound` is the honest remainder: readings of this sentence at no case identity, through a draft nobody has named,
   *  counted and never named (and `unboundWriterUndetermined` apart, D-540). `withheld_stated` is the review copy's
   *  sentence for what the list withheld by the writer (REC-213), null when the writer was not asked. */
  statementAcknowledgements(project, caseId, edition, statement, exceptAuthor = null, writer = null,
                            draftId = null, link = null) {
    const sha = statementSha(statement);
    const unallocated = caseId == null;
    const linked = !unallocated && link && link.draft ? String(link.draft) : "";
    /* The draft filter is in the SQL, not in a branch around the call: `draftMatch` is the draft whose readings are
       wanted, or `*` for every row at this identity (no draft id can be spelled `*`); an unallocated identity with no
       draft named asks for `draft_id = ''`, which no row carries. */
    const draftMatch = unallocated ? String(draftId ?? "") : "*";
    const rows = this.#rows(
      `SELECT acknowledger_kind, acknowledger, recipient, at, case_id, draft_id, reason
         FROM statement_acknowledgements
        WHERE project_id=? AND statement_sha=? AND edition=?
          AND ((case_id IS ? AND (? = '*' OR draft_id = ?))
               OR (case_id IS NULL AND draft_id = ?))
        ORDER BY at, ack_id LIMIT ?`,
      project, sha, edition, caseId ?? null, draftMatch, draftMatch, linked,
      STATEMENT_ACK_MAX + 1);
    const truncated = rows.length > STATEMENT_ACK_MAX;
    const all = rows.slice(0, STATEMENT_ACK_MAX);
    const byPublisher = (r) => !!(exceptAuthor && r.acknowledger_kind === "participant"
                                  && r.acknowledger === exceptAuthor);
    const byTheWriter = (r) => !!(writer && writer.by && r.acknowledger_kind === "participant"
                                  && r.acknowledger === writer.by && !byPublisher(r));
    const undeterminedWithheld = (r) => !!(writer && writer.by === null
                                           && r.acknowledger_kind === "participant" && !byPublisher(r));
    const listed = all.filter((r) => !byPublisher(r) && !byTheWriter(r) && !undeterminedWithheld(r));
    /* The unbindable remainder, asked only for a case document: readings at NO case identity, through a draft no
       publisher has named (publication R40's `case_documents.draft_id`), other than this document's own link. The
       publisher's and the writer's own are excluded as from the list; with the writer UNDETERMINED a participant row is
       counted under its own key, never folded into `unbound`. */
    const writerBy = writer && typeof writer.by === "string" ? writer.by : null;
    const writerUndetermined = writer && writer.by === null ? 1 : 0;
    const unboundRow = unallocated ? null
      : this.#one(`SELECT COALESCE(SUM(CASE WHEN acknowledger_kind='participant' AND acknowledger IS ? THEN 0
                                            WHEN acknowledger_kind='participant' AND ? = 1 THEN 0
                                            WHEN acknowledger_kind='participant' AND acknowledger IS ? THEN 0
                                            ELSE 1 END), 0) AS n,
                          COALESCE(SUM(CASE WHEN acknowledger_kind='participant' AND acknowledger IS ? THEN 0
                                            WHEN acknowledger_kind='participant' AND ? = 1 THEN 1
                                            ELSE 0 END), 0) AS u
                   FROM statement_acknowledgements
                   WHERE project_id=? AND statement_sha=? AND edition=? AND case_id IS NULL
                     AND (draft_id IS NULL
                          OR draft_id NOT IN (SELECT draft_id FROM case_documents WHERE draft_id IS NOT NULL))
                     AND (draft_id IS NULL OR draft_id <> ?)`,
                  exceptAuthor ?? null, writerUndetermined, writerBy,
                  exceptAuthor ?? null, writerUndetermined,
                  project, sha, edition, linked);
    const byWriter = all.filter(byTheWriter).length;
    const withheldWriterUndetermined = all.filter(undeterminedWithheld).length;
    return { statementSha: sha, truncated,
             link: linked ? { draft: linked, by: link.by ?? null, at: link.at ?? null } : null,
             boundByLink: linked ? listed.filter((r) => r.case_id == null).length : 0,
             byAuthor: all.filter(byPublisher).length,
             byWriter,
             withheldWriterUndetermined,
             unbound: unboundRow ? Number(unboundRow.n) : 0,
             unboundWriterUndetermined: unboundRow ? Number(unboundRow.u) : 0,
             withheld: byWriter + withheldWriterUndetermined,
             withheld_stated: writer ? withheldWriterStated(byWriter + withheldWriterUndetermined, writerBy) : null,
             /* R19: each row carries its acknowledger's words, null on one recorded before DEC-88. The document's
                lines (`ackFrontmatterLines`, `ackBodyLines`) print the fields they always printed, so the signed
                acknowledgement lines are unchanged. */
             rows: listed.map((r) => ({ kind: r.acknowledger_kind, by: r.acknowledger,
                                        recipient: r.recipient ?? null, at: r.at, reason: r.reason ?? null,
                                        ...(linked && r.case_id == null ? { draft: r.draft_id } : {}) })) };
  }

  /** R21 — REC-212 / §3 rule 13: WHO WROTE THE STATEMENT THIS CASE IS ABOUT TO PUBLISH, as distinct from who prepared
   *  and published it (two acts, two names, never conflated). It carries review's server stamp (`case_drafts
   *  .statement_by`, review R26's read contract, REC-193) onto the document, matched by the STATEMENT'S OWN IDENTITY
   *  (`fmSafe` of the sentence, the normalisation the acknowledgements hash).
   *
   *  THE NAMED DRAFT FIRST (R9's link): when the publisher named the draft and it holds this sentence, its stamp is the
   *  writer, and no other draft is consulted; a named draft with no stamp is UNDETERMINED. A named draft holding
   *  another sentence says nothing about these bytes, so the project's drafts are asked as below (K240).
   *  Otherwise, four answers, each a fact and none a fallback:
   *   (1) drafts at this identity hold this sentence and agree on its author — that member;
   *   (2) no draft at this identity holds it — the PUBLISHER wrote these bytes at this act (`statement=` is authored);
   *   (3) a matching draft records no author, or two name different members — UNDETERMINED, stated;
   *   (4) the project holds more drafts than one bounded read lists — UNDETERMINED, with that reason.
   *  A draft at this identity whose arguments will not parse is UNDETERMINED, asked before (2) so it can never be
   *  absorbed by it. The document prints where the name came from beside the name. */
  #statementWriter(project, caseId, edition, statement, publisher, namedDraft = null) {
    const want = fmSafe(statement);
    const notFromAuthor = `It is NOT read off ${publisher}, who prepared and published this case: `
      + `preparing a case is not writing its statement (BIO_Publication §3 rule 13).`;
    if (!want) return { by: null, from: "no_statement",
                        stated: "UNDETERMINED: this case document prints no exclusion statement, so there is "
                              + "no sentence for anybody to have written." };
    if (namedDraft) {
      let p = null;
      try { p = JSON.parse(namedDraft.params); } catch { p = null; }
      if (p && fmSafe(p.statement) === want) {
        const stamp = typeof namedDraft.statement_by === "string" && namedDraft.statement_by.trim()
          ? namedDraft.statement_by.trim() : null;
        if (!stamp)
          return { by: null, from: "named_draft_unrecorded",
                   stated: `UNDETERMINED: ${publisher} named draft ${namedDraft.draft_id} as this case's draft, and `
                         + `that draft records no author for this sentence — it was written before the plane stamped `
                         + `one — so who wrote the bytes this case publishes cannot be established. ${notFromAuthor} `
                         + `An editor who saves the statement again records who wrote the bytes that stand.` };
        return { by: stamp, from: "named_draft",
                 stated: stamp === publisher
                   ? `${stamp} wrote this exclusion statement, in draft ${namedDraft.draft_id}, which ${publisher} `
                     + `named as this case's draft, and also prepared and published the case — two acts, one member.`
                   : `${stamp} wrote this exclusion statement, in draft ${namedDraft.draft_id}, which ${publisher} `
                     + `named as this case's draft. ${publisher} prepared and published the case: two acts, two `
                     + `names (BIO_Publication §3 rule 13).` };
      }
    }
    const cap = DRAFTS_READ_MAX;
    /* review R26's read contract on `case_drafts`, under its bound. */
    const rows = this.#rows(`SELECT draft_id, case_id, params, statement_by FROM case_drafts
                             WHERE project_id=? ORDER BY created_at, draft_id LIMIT ?`, project, cap + 1);
    if (rows.length > cap)
      return { by: null, from: "drafts_unbounded",
               stated: `UNDETERMINED: ${project} holds more drafts than one bounded read of them lists `
                     + `(${cap}), so which draft this sentence was written in — and therefore who wrote it — `
                     + `cannot be established here. ${notFromAuthor}` };
    const here = (d) => (d.case_id ?? null) === (caseId ?? null)
                      || ((d.case_id ?? null) === null && Number(edition) === 1);
    const unreadable = [];
    const matches = rows.filter((d) => {
      if (!here(d)) return false;
      let p = null;
      try { p = JSON.parse(d.params); } catch { unreadable.push(d.draft_id); return false; }
      return fmSafe(p && p.statement) === want;
    });
    if (unreadable.length)
      return { by: null, from: "draft_unreadable",
               stated: `UNDETERMINED: ${unreadable.length} draft(s) of ${project} at this case identity `
                     + `(${unreadable.join(", ")}) hold arguments this plane cannot read, so whether this `
                     + `sentence was written in one of them, and by whom, cannot be established. ${notFromAuthor}` };
    if (!matches.length)
      return { by: publisher, from: "this_act",
               stated: `${publisher} wrote this exclusion statement in the act that published this case, and `
                     + `prepared and published the case — two acts, one member: no draft of ${project} at `
                     + `this case identity holds this sentence, so these bytes arrived with this publication.` };
    if (matches.some((d) => !d.statement_by))
      return { by: null, from: "draft_unrecorded",
               stated: `UNDETERMINED: the draft this sentence stands in (${matches.map((d) => d.draft_id)
                     .join(", ")}) records no author — it was written before the plane stamped one — so who `
                     + `wrote the bytes this case publishes cannot be established. ${notFromAuthor} An editor `
                     + `who saves the statement again records who wrote the bytes that stand.` };
    const names = [...new Set(matches.map((d) => d.statement_by))];
    if (names.length > 1)
      return { by: null, from: "drafts_disagree",
               stated: `UNDETERMINED: ${names.length} drafts of ${project} at this case identity hold this `
                     + `sentence and name different authors (${names.join(", ")}), so which member wrote the `
                     + `bytes this case publishes cannot be established. ${notFromAuthor}` };
    return { by: names[0], from: "draft",
             stated: names[0] === publisher
               ? `${names[0]} wrote this exclusion statement, in the draft it was prepared in, and also `
                 + `prepared and published the case — two acts, one member.`
               : `${names[0]} wrote this exclusion statement, in the draft it was prepared in. ${publisher} `
                 + `prepared and published the case: two acts, two names (BIO_Publication §3 rule 13).` };
  }
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It creates its table and declares it to
 *  record-core's purge (R28, K23). */
export function caseAuthoringOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    c = new CaseAuthoring({ ...d, host, storage, record, membership });
    instances.set(host, c);
    c.migrate();
    record.declarePurge("case-authoring", CASE_AUTHORING_TABLES);
  }
  return c;
}

/** Which purge declaration names this module's table (record-core R21: each owner declares its own). */
export function caseAuthoringOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return CASE_AUTHORING_TABLES.some((x) => x.name === name);
}

/** The module's ops (K3), as entries of the plane's op map (`plane/store.mjs`). `viewer` and `author` are the control plane's stamps,
 *  read from the query and spread AFTER the body, so a caller's own copy is overwritten, never honoured. */
export function caseAuthoringOps(c, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    /* R1–R18. The BODY carries the authored material (an exclusion list and the roles map are what a query string
       cannot express honestly); `targets`, `caseId`, `project` and `draft` also arrive on the query as the one-line
       form a probe can reach, and `newCase` from either, its string forms spelled out so `newCase=false` means false. */
    publishcase: () => c.publishCase({ ...b,
      target: q("target") || b.target,
      targets: b.targets || q("targets") || null,
      caseId: q("caseId") || b.caseId || null,
      newCase: (() => {
        const v = q("newCase") != null ? q("newCase") : b.newCase;
        return v === true || v === "true" || v === "1" || v === "yes";
      })(),
      project: q("project") || b.project || null,
      draft: q("draft") || b.draft || null,
      viewer: q("viewer"),
      author: q("author") }),
    /* R32 (N345): the ceremony's read before op=publish; `viewer` and `author` are the stamps, as op=publish's. */
    publishtensions: () => c.tensionsToDisclose({ ...b,
      target: q("target") || b.target,
      targets: b.targets || q("targets") || null,
      project: q("project") || b.project || null,
      viewer: q("viewer"),
      author: q("author") }),
    /* R34 (N364): the ceremony's pre-flight, over op=publish's own arguments and stamps; it writes nothing. The door
       stamps `aiCred` (the minted agent credential's token id and principal) beside `viewer` for an agent (N435); one
       that does not parse is still an agent's, so ratification's fences hold (fail closed). */
    publishpreflight: () => c.publishPreflight({ ...b,
      target: q("target") || b.target,
      targets: b.targets || q("targets") || null,
      caseId: q("caseId") || b.caseId || null,
      newCase: (() => {
        const v = q("newCase") != null ? q("newCase") : b.newCase;
        return v === true || v === "true" || v === "1" || v === "yes";
      })(),
      project: q("project") || b.project || null,
      draft: q("draft") || b.draft || null,
      viewer: q("aiCred") ? { stamp: q("viewer"), aiCred: (() => {
        try { const v = JSON.parse(q("aiCred")); return v && typeof v === "object" ? v : {}; } catch { return {}; }
      })() } : q("viewer"),
      author: q("author") }),
    /* R39: a draft of a new edition's statement of what changed. The words come in the body (a statement of up to
       8,000 characters is not a query parameter), the case from either; `proposedBy` is the `author` stamp. */
    whatchangedpropose: () => c.proposeWhatChanged({ case: q("case") || b.case || null,
      text: typeof b.text === "string" ? b.text : (q("text") ?? undefined),
      viewer: q("viewer"), proposedBy: q("author") }),
    /* R39: the case's drafts, oldest first. */
    whatchangeddrafts: () => c.whatChangedDrafts({ case: q("case") || b.case || null, viewer: q("viewer") }),
    /* R19–R21: the review copy's two doors, and a member's third subject (an unsigned case document). */
    statementack: () => c.acknowledgeStatement({ draft: q("draft"), caseId: q("case"), edition: q("edition"),
      secretSha: q("secretSha"), viewer: q("viewer"), bySecret: q("bySecret") === "1",
      /* R19 (DEC-88): the acknowledger's words, from the query as the subject is; absent stays absent. */
      reason: q("reason") ?? undefined }),
  };
}
