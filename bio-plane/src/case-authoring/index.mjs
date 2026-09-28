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
 * now `./searched.mjs`; N138) and `bio-checks.mjs` (C-44.1, C-44.3–C-44.5, C-82.2–C-82.7, now `./checks.mjs`). Its
 * table is `./schema.mjs`. The legacy code's comments moved with it, shortened where they only restated the code.
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
 *   now                  the clock for the instants it writes, `(precision) => ISO string` (default: the wall clock).
 *
 * READ CONTRACTS it joins in its own SQL, each named at its statement: record-core's `bundles` (R37); publication's
 * `cases`, `published_cases`, `published_case_members`, `published_bundles`, `case_documents` (R40); review's
 * `case_drafts` (R26); inquiry's `inquiry_basis` (R40); content's `content` (R45); provenance's `register` and
 * `captured_locators` (R48); extraction's `readings` (R58); observation-log's `observation_log` (R29). */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { observationLogOf } from "../observation-log/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { strengthOf, STRENGTH_AXES } from "../strength/index.mjs";
import { biasOf } from "../bias/index.mjs";
import { reevaluationOf } from "../reevaluation/index.mjs";
import { publicationOf } from "../publication/index.mjs";
import { ratificationOf, SUBJECT_POSITIONS, completenessFields } from "../ratification/index.mjs";
import { parseFrontmatter, normalizeType, isMachineIdentity, createSha256, OBJECT_TYPES, BASIS_GRADES,
         MACHINE_FENCE_CHECKS } from "../../checks/bio-checks.mjs";
import { CASE_DERIVATION_CHECKS, STATEMENT_ACK_CHECKS } from "./checks.mjs";
import { CASE_AUTHORING_TABLES, migrateCaseAuthoring } from "./schema.mjs";
import { searchedSection } from "./searched.mjs";
import { fmSafe, statementSha, caseDocumentText, ackFrontmatterLines, ackBodyLines, withheldWriterStated,
         ACK_PROSE_HEAD } from "./document.mjs";

export { CASE_DERIVATION_CHECKS, STATEMENT_ACK_CHECKS } from "./checks.mjs";
export { CASE_AUTHORING_SCHEMA, CASE_AUTHORING_TABLES } from "./schema.mjs";
export { searchedSection, SEARCHED_LEVEL_OUTCOMES } from "./searched.mjs";
export { caseDocumentText, statementSha, withheldWriterStated, fmSafe, ackFrontmatterLines, ackBodyLines,
         ACK_PROSE_HEAD, CASE_CITATION_WORDS } from "./document.mjs";

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
/** R16: the id chunk for the citations' grouped read, this module's own copy of `retrieval`'s (K57). */
export const SELECTION_ID_CHUNK = 64;
/** R21: the most drafts the writer read scans, the bound `review` R26 states for `case_drafts` (`REVIEW_LIST_MAX`):
 *  review is later in the order, so this is a copy of it (K57), never an import. */
export const DRAFTS_READ_MAX = 500;
/** R17: the IN lists of the searched section's reads are chunked at 50, under D-36's 100-bound-parameter ceiling. */
const SEARCHED_CHUNK = 50;

const str = (v) => String(v ?? "").trim();

/* The one constructor of a refusal with a catalogue row (DEC-49): `reason` and `code` carry the same literal, and the
   row's `check` and `translation` join the site's own `detail` and keys. */
function refusal(family, key, extra = {}) {
  const row = family[key];
  return { ok: false, reason: key, code: key, check: row.check, translation: row.translation, ...extra };
}

export class CaseAuthoring {
  #deps;

  constructor({ storage, record, membership, host = null, inquiry = null, basisVersions = null, strength = null,
                bias = null, observations = null, reevaluation = null, publication = null, ratification = null,
                now = null } = {}) {
    this.sql = storage.sql;
    this.storage = storage;
    this.record = record;
    this.membership = membership;
    this.#deps = { host, inquiry, basisVersions, strength, bias, observations, reevaluation, publication, ratification };
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

  migrate() { migrateCaseAuthoring(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #when(precision) { const w = this.now(precision); return typeof w === "string" && w ? w : stampInstant(precision); }

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

  #publishCase({ target = null, targets = null, caseId = null, newCase = false, scope = "",
                 statement = "", excluded = null, subjectPosition = "",
                 subjectJustification = "", biasAcknowledgement = "",
                 project = null, roles = null, draft = null,
                 viewer = null, author = null } = {}) {
    const who = str(author);
    /* DEC-49 REGION is-machine-publish — R1 / C-32.6. The fence alone, before anything else is read. */
    if (!who || isMachineIdentity(who))
      return { ...refusal(MACHINE_FENCE_CHECKS, "MACHINE_CANNOT_PUBLISH"),
               detail: "publishing puts the group's name on a case. A machine credential may prepare one and "
                     + "may never author the completeness assertion or the position on putting it to its "
                     + "subject, both of which are declared bias. Sign in as a member." };
    /* END DEC-49 REGION is-machine-publish */

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
    /* REC-149: at EXISTENCE the positional C-70.1 (membership R77); NONE falls to the unchanged answer below. */
    if (!pb) { const existence = this.membership.existenceAct(proj, viewer); if (existence) return existence; }
    if (!pb)
      return { ok: false, reason: "NO_SUCH_PROJECT", project: proj,
               detail: `no project answers to ${proj}. A project you cannot see is answered exactly as one that `
                     + `does not exist, which is this record's standing posture and not a hint.` };
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
    /* DEC-49 REGION is-publish-statement — REC-64/C-33.14. */
    if (!stmt)
      return { ok: false, reason: "NO_STATEMENT",
               detail: "a published case states what it does NOT cover. A case silent about its own limits is "
                     + "claiming to cover everything, which is the overclaim this record exists to refuse." };
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
      prepared.push({ id, b, fm, bundleSha: head ? head.bundleSha : null, conclusion: conc, warrant: recorded });
    }

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

    /* R6 — CASE-2 / DEC-72 clause 2: THE BAR, READ FROM THE PUBLISHING PROJECT ALONE, AT ACT TIME, AND ONCE: the bar is
       the case's property, so members stamped with different bars would be the old model surviving in the bytes. THE
       GROUP DEFAULT IS NOT CONSULTED (it seeds new projects and gates no publication). An absent bar gates nothing and
       is not a bar of zero. */
    const bar = this.strength.projectBar(proj);
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
            return { ok: false, reason: "BELOW_PROJECT_STRENGTH", target: m.target, axis,
                     project: proj, required: want, reached: got.grade, state: got.state,
                     detail: `${m.target} is LOAD-BEARING in this case and reaches ${axis} `
                           + `${got.grade === null ? got.state + " (no grade)" : "'" + got.grade + "'"}, `
                           + `against ${proj}'s declared standard of '${want}'. A case rests on its `
                           + `load-bearing findings, so those are what the project's bar is asked of. `
                           + `A finding below the bar may still travel with this case — designate it `
                           + `SUPPORTING and it is published, marked as not carrying the case (DEC-72). `
                           + `That is the honest move and never severing the citation.` };
        }
      }
    }
    /* AND NOTHING IS ASKED OF THE SUPPORTING MEMBERS (Bob, on DEC-71: "The citation doesn't have to be severed"). */

    /* R12 — HUNCH DEBT REFUSES PUBLICATION (Publication §3 rule 4; DEC-20; Declared Bias, "HUNCH DEBT"): the one bias
       that must be cleared before a case publishes. Cleared means the case holds without the hunch, so a member whose
       live basis still carries a leg whose grade source is `hunch` carries the debt. Asked of EVERY member, load-bearing
       or supporting, before the case identity is derived, so a refusal draws no id and writes nothing (K240). The
       ceremony's own preflight screens (REC-15) stay deferred on DEC-33. */
    const hunches = [];
    for (const p of prepared) {
      const basis = this.inquiry.basisFor(p.id);
      for (const leg of (basis && Array.isArray(basis.legs) ? basis.legs : []))
        if (leg && leg.grade_source === "hunch") hunches.push({ target: p.id, ord: leg.ord, leg_target: leg.target_id });
    }
    if (hunches.length)
      return { ok: false, reason: "UNCLEARED_HUNCH", hunches,
               detail: `${hunches.length} basis leg(s) of this case's findings rest on a HUNCH (`
                     + hunches.map((h) => `${h.target} leg ${h.ord} on ${h.leg_target}`).join("; ")
                     + `). A hunch is temporary declared bias, and it is the one bias that must be cleared before `
                     + `publication (DEC-20): the case must still hold with the hunch removed. Give each leg a grade `
                     + `the record earns, or take the hunch out of the basis, and publish again. Nothing was written.` };

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
    /* The WORKING document's own claim, consulted after the published record and only so a member refused at the gate
       who publishes again lands on the same case rather than a second minted id. */
    const claimedInBytes = [...new Set(prepared
      .map((p) => (typeof p.fm.case_id === "string" && p.fm.case_id !== "null" ? p.fm.case_id : null))
      .filter(Boolean))];
    /* DEC-49 REGION case-identity-derivation — C-44.1. The line is drawn at MORE THAN ONE CANDIDATE: with none the act
       mints, with one the derivation reads a fact, `caseId` answers the question one way and `newCase` the other.
       With two there is no default that is anybody's meaning, and that is what this refuses. */
    if (newCase && str(caseId))
      return refusal(CASE_DERIVATION_CHECKS, "CASE_IDENTITY_AMBIGUOUS", {
        cases: [str(caseId)],
        members: [...belongs].map(([id, cs]) => ({ target: id, cases: cs })),
        detail: `this act both NAMES case ${str(caseId)} and asks for a new case to be minted. `
              + `Those are opposite instructions and the record will not choose between them: name the `
              + `case to publish a further edition of it, or ask for a new one, not both.` });
    if (!newCase && !str(caseId) && distinct.length > 1)
      return refusal(CASE_DERIVATION_CHECKS, "CASE_IDENTITY_AMBIGUOUS", {
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
                || (claimedInBytes.length === 1 ? claimedInBytes[0] : null) || null;
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
        return refusal(CASE_DERIVATION_CHECKS, "PUBLISH_DRAFT_NOT_FOUND", { draft: draftNamed, project: proj,
          detail: `no draft of ${proj} that you can read answers to ${draftNamed}. A draft you cannot read is `
                + `answered exactly as one that does not exist. Name the draft this case was prepared in, or `
                + `publish without draft= and its readings are stated as undetermined.` });
      /* END DEC-49 REGION is-publish-draft-found */
      const di = review.draftIdentity(d);
      /* DEC-49 REGION is-publish-draft-this-case */
      if (di.caseId ? (di.caseId !== theCase || di.edition !== predicted) : predicted !== 1)
        return refusal(CASE_DERIVATION_CHECKS, "PUBLISH_DRAFT_NOT_THIS_CASE", { draft: draftNamed,
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
        return refusal(CASE_DERIVATION_CHECKS, "PUBLISH_DRAFT_ALREADY_BOUND", { draft: draftNamed,
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
      if (!theCase) return { ok: false, reason: "MINT_EXHAUSTED",
                             detail: "the plane could not find a free case id; nothing was published" };
    }

    /* R7 — CASE-2 / DEC-72: A CASE NEVER CHANGES PROJECT. The bar is read from the publishing project at act time, so a
       case that could change hands is a case whose standard of evidence changes with nobody authoring the change. The
       ratified row is asked first (publication R40: `cases`), the working bytes second. */
    const ownedBy = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, theCase);
    const claimedProject = ownedBy ? ownedBy.project_id
      : [...new Set(prepared.map((p) => (typeof p.fm.case_project === "string"
          && p.fm.case_project !== "null" ? p.fm.case_project : null)).filter(Boolean))][0] || null;
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
    const memberEditions = new Map();
    for (const id of members) {
      const mt = this.#one(`SELECT MAX(edition) AS m FROM published_bundles WHERE bundle_id=?`, id);
      memberEditions.set(id, (mt && mt.m != null ? Number(mt.m) : 0) + 1);
    }

    /* R10 — C-21.1 AT CASE ALTITUDE, before anything moves: against the previous RATIFIED edition of THIS case, compared
       through ratification's one shape (`completenessFields`). The scope is not compared. Two refusal names, because a
       reprinted statement and a reprinted acknowledgement of bias are two different mistakes; the check is C-21.1. */
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
                      excluded: "the exclusion list", bias_acknowledgement: "the bias acknowledgement" };
      const REASON = { bias_acknowledgement: "BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD" };
      const WHY = { bias_acknowledgement:
        `An acknowledgement of the bias a case was produced under is AUTHORED at the moment of export and `
        + `never carried forward (DEC-46): reprinting the last edition's sentence is evidence nobody looked. `
        + `The lens itself may well be unchanged — what must be fresh is what it means for THIS edition's `
        + `findings. Say that, as of this edition. Declaring a bias never blocks publication (DEC-20).` };
      for (const k of Object.keys(LABEL))
        if (now[k] != null && was[k] != null && now[k] === was[k])
          return { ok: false, reason: REASON[k] || "COMPLETENESS_CARRIED_FORWARD", field: k, edition,
                   check: "C-21.1", caseId: theCase, prior: priorCase.edition,
                   detail: `${LABEL[k]} is byte-identical to edition ${priorCase.edition}'s. ${WHY[k]
                         || `A completeness claim carried forward unchanged is a checkbox, and C-21.1 exists to `
                          + `refuse it: every edition is a separate document and states its own limits in its `
                          + `own words, as of its own date. If nothing about the limits changed, say THAT, as `
                          + `of this edition.`}` };
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
                       ? { reevaluation: this.reevaluation.raise({ target: memberId, source: "edition", since: when,
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
    /* MK-7 / §4.3: each observation this edition reaches (basis-versions R39), at the level its author chose, or
       UNCHOSEN (publication R17). */
    const reach = this.basisVersions.testimonyReach(members);
    const observations = [...new Set([...reach.self, ...reach.via.map((v) => v.observation)])];
    const docText = caseDocumentText({
      caseId: theCase, edition, project: proj, scope: scp, bias: back, bar,
      roster: members, roles: memberRoles, pins: pinOf,
      statement: stmt, position: pos, justification: just, excluded: rows,
      author: who, at: when, searched, conclusions: conclusionRows,
      statementBy: writer.by, statementByStated: writer.stated,
      frozen, manifest, acks, citations,
      attributions: this.publication.attributionStatements(theCase, edition, proj, observations),
    });
    const docBytes = new TextEncoder().encode(docText);
    /* publication R21: stored unsigned, replacing an unsigned document of this case edition and never a signed one; the
       exclusions are projected in the same write. What this act answers with is what the store holds after the call. */
    const stored = this.publication.storeCaseDocument({ caseId: theCase, edition, text: docText, author: who, at: when,
                                                        draft: boundDraft });

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
   * op=statementack: acknowledgeStatement (R19–R21)
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
                         bySecret = false } = {}) {
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
    const same = this.#one(`SELECT ack_id, at FROM statement_acknowledgements
                            WHERE project_id=? AND statement_sha=? AND case_id IS ? AND edition=?
                              AND acknowledger_kind=? AND acknowledger=?
                              AND (? IS NOT NULL OR draft_id IS ?)`,
                           project, sha, ident.caseId ?? null, ident.edition, kind, by,
                           ident.caseId ?? null, draftId);
    const when = same ? same.at : this.#when("millisecond");
    if (!same)
      this.sql.exec(`INSERT INTO statement_acknowledgements (project_id,case_id,edition,statement_sha,draft_id,
                     acknowledger_kind,acknowledger,recipient,at) VALUES (?,?,?,?,?,?,?,?,?)`,
                    project, ident.caseId ?? null, ident.edition, sha, draftId, kind, by, recipient, when);
    /* The parse is the authority on the project, the SQL match its index. */
    const docs = found.filter((d) => str((parseFrontmatter(d.text).data || {}).case_project) === project);
    const reauthored = docs.map((d) => this.#reauthorAcknowledgements(d));
    /* REC-217: which case edition, if any, a publisher named this draft for (signed or not). */
    const linkedTo = ident.caseId == null && draftId ? this.#draftLinkOf(draftId) : null;
    return { ok: true, existed: !!same,
             acknowledgement: { kind, by, recipient, grant_id: grantId, at: when, project,
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
     second reader. A document authored before this landing carries neither run and is left as it is, and says so. */
  #reauthorAcknowledgements(doc) {
    const fm = parseFrontmatter(doc.text).data || {};
    const c = fm.completeness && typeof fm.completeness === "object" ? fm.completeness : {};
    const lines = doc.text.split("\n");
    const f0 = lines.findIndex((l) => l.startsWith("  statement_sha: "));
    const f1 = lines.indexOf("completeness_excluded:");
    const b0 = lines.findIndex((l) => l.startsWith(ACK_PROSE_HEAD));
    const b1 = lines.indexOf("## What Was Searched");
    if (f0 < 0 || f1 < f0 || b0 < 0 || b1 < b0 + 1)
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
      `SELECT acknowledger_kind, acknowledger, recipient, at, case_id, draft_id
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
             rows: listed.map((r) => ({ kind: r.acknowledger_kind, by: r.acknowledger,
                                        recipient: r.recipient ?? null, at: r.at,
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

/** The module's ops (K3), as entries of the legacy store's op map. `viewer` and `author` are the control plane's stamps,
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
    /* R19–R21: the review copy's two doors, and a member's third subject (an unsigned case document). */
    statementack: () => c.acknowledgeStatement({ draft: q("draft"), caseId: q("case"), edition: q("edition"),
      secretSha: q("secretSha"), viewer: q("viewer"), bySecret: q("bySecret") === "1" }),
  };
}
