/* case-inputs — what other acts record about a case before its next edition is prepared (requirements:
 * `build/requirements/case-inputs.md`; BIO_Publication_v0_1.md §3 rules 11, 13, §5A, §6A; BIO_Action_v0_2.md §3, rules 8,
 * 17). `case-authoring`'s `op=publish` reads what this module answers into the case document; this module writes no case
 * document but the acknowledgement list of an unsigned one (R2), and calls nothing of `case-authoring`'s. It holds:
 *   - the statement's acknowledgements (`op=statementack`, R1–R5): members and review recipients saying they have read
 *     the statement before it is signed, the one list of them, and who wrote the statement;
 *   - the drafts of a new edition's statement of what changed (`op=whatchangedpropose`, `op=whatchangeddrafts`, R6, R7);
 *   - the one source of a case's open requests for comment at signing, which `action-replies` fills (R8), and the sign
 *     step's sentences for them (R10, R17);
 *   - the one source of a case's minutes comparisons at signing, which `filings` fills, and the sign step's lines for
 *     them (R19);
 *   - the outcomes a member carries into a case's next edition, the service `consequences` calls (R9);
 *   - a case's standard details, beside the case and never in its signed document (`op=casedetailsset`,
 *     `op=casedetails`, the public read `casedetailspublic`, R20–R26, T51).
 *
 * Copied from `case-authoring` for size (N908; K617, K624; the map `build/extraction/case-authoring-split-2.md`), meaning
 * unchanged, each requirement naming its source id; `case-authoring` deletes its copies once this module is merged
 * (T47-32). The legacy code's comments moved with it. Its tables are `./schema.mjs`'s, its rows `./checks.mjs`', the
 * acknowledgement list's renderers `./document.mjs`'s.
 *
 * REACHED as `caseInputsOf(host, deps)` (K61; R16): one instance per host (the Durable Object's `ctx`), created on the
 * first call with `deps`, returned to every later caller. At creation it creates its tables and declares them to
 * record-core's purge (R11, K23). `case-authoring`'s factory creates it at its own creation, so the tables exist and are
 * declared at every boot. `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership   layer 2: `transact`, `mintOpaqueId`, `declarePurge`; `isJoinedParticipant`, `sight`.
 *   publication          `reviewProvider` (its R23; R1's doors and dead answer), `hasCaseStanding` (R1),
 *                        `reauthorSection` (its R21; R2).
 *   publishSchedule      `waitingEditionOf` (publish-schedule R7; R4).
 *   account              `case-account`'s `accountShaped` (its R5; R9's cites).
 *   entities, promotion  `has` (its R7; R21's `area.entity`), `fact("producingGroup")` (its R40; R24's `group`).
 *   publicRead           `registerPublicReads` (its R18): `casedetailspublic`, registered by `registerCaseInputsPublicReads` (R24),
 *                        which the plane calls at start; creating the instance registers nothing.
 *   now                  the clock for the instants it writes, `(precision) => ISO string` (default: the wall clock).
 *
 * READ CONTRACTS it joins in its own SQL, each named at its statement: record-core's `bundles` (R6's sight, its R37);
 * publication's `cases` and `case_documents` (R40; R1, R2, R4, R6, R9); review's `case_drafts` (its R26; R3). */

import { recordOf, stampInstant, mintExhausted } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { publicationOf } from "../publication/index.mjs";
/* R4 (N823; K2438): the waiting edition is `publish-schedule`'s (its R1, read through its R7). */
import { publishScheduleOf } from "../publish-schedule/index.mjs";
import { parseFrontmatter, isMachineIdentity, proposalLabel } from "../record-grammar/index.mjs";
/* R9: an outcome's cites in case-account R5's shape (`accountShaped`), asked of its one instance on this host. */
import { caseAccountOf } from "../case-account/index.mjs";
/* R2: the acknowledgements' locator (case-grammar R3) and the one front-matter spelling (N424); R9: the kinds of outcome
   and the one reading of a signed document's `outcomes:` block (its R29). */
import { SECTIONS, fmSafe, OUTCOME_KINDS, outcomesOf } from "../case-grammar/index.mjs";
import { STATEMENT_ACK_CHECKS, CARRIED_OUTCOME_CHECKS, fillWords } from "./checks.mjs";
import { CASE_INPUTS_TABLES, migrateCaseInputs } from "./schema.mjs";
import { statementSha, ackFrontmatterLines, ackBodyLines, withheldWriterStated } from "./document.mjs";
import { word, localize } from "../setup-words/index.mjs";
/* R21, R24 (T51): the entities a team holds; the group's slug; the public reads and C-98.8's row. */
import { entitiesOf } from "../entities/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { publicReadOf } from "../public-read/index.mjs";
import { rowOf } from "../public-read/checks.mjs";
import { CASE_DETAILS_FIELDS, CASE_DETAILS_HISTORY_MAX, CASE_DETAILS_WORDS, fillDetails, detailsShapeProblem } from "./details.mjs";

export { STATEMENT_ACK_CHECKS, CARRIED_OUTCOME_CHECKS, CASE_INPUTS_WORDS, fillWords } from "./checks.mjs";
export { CASE_INPUTS_SCHEMA, CASE_INPUTS_TABLES, migrateCaseInputs } from "./schema.mjs";
export { CASE_DETAILS_FIELDS, CASE_DETAILS_HISTORY_MAX, CASE_DETAILS_WORDS, DETAILS_LIMITS, RELATIONS, fillDetails } from "./details.mjs";
export { statementSha, ackFrontmatterLines, ackBodyLines, withheldWriterStated, ACK_PROSE_HEAD } from "./document.mjs";

/** R2: the most acknowledgements one list names; a list that reaches it says so (`truncated`). */
export const STATEMENT_ACK_MAX = 500;
/** R6 (DEC-101; K1019): the longest statement of what changed in an edition, or draft of one, in code points.
 *  `case-authoring` R38 imports it (one spelling). */
export const WHAT_CHANGED_MAX = 8000;
/** R6: the most drafts one list names; a list that reaches it says so (`truncated`), as R2's list does. */
export const WHAT_CHANGED_DRAFTS_MAX = 500;
/** R6: the prefix of a draft's opaque id (record-core R6), every one drawn through record-core's ledger. */
export const WHAT_CHANGED_DRAFT_PREFIX = "WCD";
/** R1 (DEC-88, K1030): the longest acknowledger's words, in code points. */
export const STATEMENT_ACK_REASON_MAX = 2000;
/** R3: the most drafts the writer read scans, the bound `review` R26 states for `case_drafts` (`REVIEW_LIST_MAX`):
 *  review is later in the order, so this is a copy of it (K57), never an import. */
export const DRAFTS_READ_MAX = 500;
/** R9: the longest carried outcome's statement, in code points: `case-authoring`'s `COMPLETENESS_MAX` (its R3), copied
 *  (K57), since case-authoring is later in the order and cannot be imported. */
export const CARRIED_TEXT_MAX = 2000;
const str = (v) => String(v ?? "").trim();

/* The one constructor of a refusal with a catalogue row (DEC-49): `reason` and `code` carry the same literal, and the
   row's `check` and `translation` join the site's own `detail` and keys. */
function refusal(family, key, extra = {}) {
  const row = family[key];
  return { ok: false, reason: key, code: key, check: row.check, translation: row.translation, ...extra };
}

/** R9 (T45): the kinds of outcome a member's act carries into a case's next edition, case-grammar R29's. */
export { OUTCOME_KINDS };
/** R9: the prefix of a carried outcome's opaque id (record-core R6), drawn through record-core's ledger. */
export const CARRIED_OUTCOME_PREFIX = "OUTC";
/** R9: the longest reason for withdrawing a carried outcome, in code points (R1's bound). */
export const CARRY_REASON_MAX = 2000;
/* R9: a calendar date `YYYY-MM-DD` that exists. */
const isDate = (v) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};
/** R8 (was case-authoring R70; T45; N880; Actions D13; v0.2 rule 8): the doors the open-requests source gives. */
const OPEN_REQUESTS_DOORS = Object.freeze(["openRequestsOn"]);
/** R10, R17 (T46: DEC-194, N913; T47: DEC-199, N992): the sign step's sentences, read by key from `words.json`
 *  (`CASE_INPUTS_WORDS`), one for each shape of row: with a window or with none (`nowindow.`), and a reply laid out
 *  (`line`), stated absent (`noreply`) or not laid out claim by claim, whether or not one came (`notlaidout`); and the
 *  step's one sentence when the source cannot be read (`unread`). */
export const OPEN_REQUEST_KEYS = Object.freeze({
  line: "signing.openrequest.line",
  noreply: "signing.openrequest.noreply",
  notlaidout: "signing.openrequest.notlaidout",
  "nowindow.line": "signing.openrequest.nowindow.line",
  "nowindow.noreply": "signing.openrequest.nowindow.noreply",
  "nowindow.notlaidout": "signing.openrequest.nowindow.notlaidout",
  unread: "signing.openrequest.unread",
});
const isCount = (n) => Number.isInteger(n) && n >= 0;
/* R8: one row the source answers, as R8 shapes it, or null when it is not one. `replied` (K2964), when stated, is
   whether a reply is recorded: a row stating none (`false`) while it answers a layout contradicts itself, and is
   malformed. */
function openRequestRow(r) {
  if (!r || typeof r !== "object" || Array.isArray(r)) return null;
  const whom = typeof r.whom === "string" ? r.whom.trim() : "";
  const asked = typeof r.asked_at === "string" ? r.asked_at.trim() : "";
  if (!whom || !asked) return null;
  if (r.window_closes !== null && (typeof r.window_closes !== "string" || !r.window_closes.trim())) return null;
  const a = r.answers;
  if (a !== null && !(a && typeof a === "object" && !Array.isArray(a) && isCount(a.answered) && isCount(a.claims)
                      && a.answered <= a.claims)) return null;
  const replied = r.replied === undefined || r.replied === null ? null : r.replied;
  if (replied !== null && typeof replied !== "boolean") return null;
  if (replied === false && a !== null) return null;
  /* R18 (T48; Actions D13): `quotable`, when stated, is a boolean; a row not stating it (undefined) reads as `true`. */
  if (r.quotable !== undefined && typeof r.quotable !== "boolean") return null;
  return { whom, asked_at: asked, window_closes: r.window_closes === null ? null : r.window_closes.trim(),
           answers: a === null ? null : { answered: a.answered, claims: a.claims },
           /* stated only where the source states it, so a row of a source that does not reads as before */
           ...(replied === null ? {} : { replied }),
           /* R18: likewise stated only where the source states it */
           ...(r.quotable === undefined ? {} : { quotable: r.quotable }) };
}
/** R18 (T48-43; N880; Actions D13; T49; N1076; K3321 (B); DEC-232): the no-quotation line's key, its sentence read through
 *  `CASE_INPUTS_WORDS` with `{whom}` filled from the row. */
export const OPEN_REQUEST_NOQUOTE_KEY = "signing.openrequest.noquote";
/** R10, R17: one row's fact line, `{key, says}`, for `case-authoring` R34's sign step: the row's window (`window_closes`,
 *  or `nowindow.` when null) and its reply, laid out (`line`), stated absent (`replied: false`, `noreply`) or not laid
 *  out (`answers` null and `replied` true or absent, `notlaidout`: true whether a reply came or not, so "no reply is
 *  recorded" is never shown for a recorded reply), each filled with the row's `{whom}`, `{asked_at}`,
 *  `{window_closes}`, `{answered}` and `{claims}`. Every row R8 reads well-formed is keyed. R18: a row answering
 *  `quotable: false` also answers `quoting: {key, says}`. */
export function openRequestLine(r) {
  /* R18: a row answering `quotable: false` also answers `quoting`, shown once with its row's line; it asks no reason and
     refuses nothing. A row answering `true`, or not answering it, carries none. */
  const quoting = r.quotable === false
    ? { quoting: { key: OPEN_REQUEST_NOQUOTE_KEY, says: fillWords(OPEN_REQUEST_NOQUOTE_KEY, { whom: r.whom }) } } : {};
  const reply = r.answers ? "line" : r.replied === false ? "noreply" : "notlaidout";
  const key = OPEN_REQUEST_KEYS[r.window_closes ? reply : `nowindow.${reply}`];
  return { key, says: fillWords(key, { whom: r.whom, asked_at: r.asked_at,
                                       ...(r.window_closes ? { window_closes: r.window_closes } : {}),
                                       ...(r.answers ? { answered: r.answers.answered, claims: r.answers.claims } : {}) }),
           ...quoting };
}
/** R17 (DEC-198 (7), DEC-199): the step's one sentence when R8 reads `undetermined`, `signing.openrequest.unread`'s. */
export const OPEN_REQUESTS_UNREAD_SENTENCE = fillWords(OPEN_REQUEST_KEYS.unread);

/** R19 (T51; N880 (U4); DEC-340, U366; K3935): the doors the minutes comparisons' source gives. */
const MINUTES_DOORS = Object.freeze(["minutesComparisonsOn"]);
/** R19: the sign step's minutes sentences, read by key from `words.json` through `setup-words`' `word`: the one fact line
 *  (`{meeting}`, `{date}`), the two passages' labels, and, by `same`, the verdict. */
export const MINUTES_KEYS = Object.freeze({
  line: "signing.minutes.line",
  left: "signing.minutes.left",
  right: "signing.minutes.right",
  same: "signing.minutes.same",
  differs: "signing.minutes.differs",
});
/* R19: whitespace folded, so two texts differing only in runs of space, tab or line break read as equal. */
const foldSpace = (t) => t.replace(/\s+/g, " ").trim();
/* R19: one row the source answers, as R19 shapes it, or null when it is not one. `same` must be true exactly when the two
   texts are equal once whitespace is folded: a row saying otherwise would tell a member the two read alike (or not) when
   they do not, and is malformed. */
function minutesRow(r) {
  if (!r || typeof r !== "object" || Array.isArray(r)) return null;
  const meeting = typeof r.meeting === "string" ? r.meeting.trim() : "";
  const date = typeof r.date === "string" ? r.date.trim() : "";
  if (!meeting || !date) return null;
  if (typeof r.minutes !== "string" || typeof r.filed !== "string" || typeof r.same !== "boolean") return null;
  if (r.same !== (foldSpace(r.minutes) === foldSpace(r.filed))) return null;
  return { meeting, date, minutes: r.minutes, filed: r.filed, same: r.same };
}
/** R19: one row's lines for `case-authoring` R77's sign step, `{key, says, left, right, comparison}`: the fact line
 *  (`signing.minutes.line` with the row's `{meeting}` and `{date}`) beside the two passages' labels (`left`, `right`, each
 *  `{key, says}`) and, by `same`, `comparison`, `signing.minutes.same` or `signing.minutes.differs`. It asks no reason. */
export function minutesLine(r) {
  const keyed = (key, vars) => ({ key, says: word(key, vars) });
  return { ...keyed(MINUTES_KEYS.line, { meeting: r.meeting, date: r.date }),
           left: keyed(MINUTES_KEYS.left), right: keyed(MINUTES_KEYS.right),
           comparison: keyed(r.same ? MINUTES_KEYS.same : MINUTES_KEYS.differs) };
}

export class CaseInputs {
  #deps;
  /* R8: the one source of a case's open requests for comment, registered once at start (`action-replies` R3). */
  #openRequests = null;
  /* R19: the one source of a case's minutes comparisons, registered once at start (`filings` R64). */
  #minutes = null;

  constructor({ storage, record, membership, host = null, publication = null, publishSchedule = null, account = null,
                entities = null, promotion = null, now = null } = {}) {
    this.sql = storage.sql;
    this.storage = storage;
    this.record = record;
    this.membership = membership;
    this.#deps = { host, publication, publishSchedule, account, entities, promotion };
    this.now = typeof now === "function" ? now : (precision) => stampInstant(precision);
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get publication() { return this.#deps.publication ||= publicationOf(this.#deps.host); }
  /* R4: the waiting edition's one read (publish-schedule R7), viewer-free and in-process. */
  get publishSchedule() { return this.#deps.publishSchedule ||= publishScheduleOf(this.#deps.host); }
  /* R9: `case-account`, the one instance on this host, for an outcome's cites (its R5). */
  get account() { return this.#deps.account ||= caseAccountOf(this.#deps.host); }
  /* R21: `entities`, the one instance on this host, for the bodies a team holds. */
  get entities() { return this.#deps.entities ||= entitiesOf(this.#deps.host); }
  /* R24: `promotion`, the one instance on this host, for the producing group's slug. */
  get promotion() { return this.#deps.promotion ||= promotionOf(this.#deps.host); }

  migrate() { migrateCaseInputs(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  /* The act's instant, from the clock it was given; one that answers no instant is replaced by the wall clock's. */
  #when(precision) { const w = this.now(precision); return typeof w === "string" ? w : stampInstant(precision); }

  /* The review provider publication holds (its R23): with none registered, every door refuses and `deadAnswer()` is
     still C-87.1's answer, so R1's dead answer is one answer either way. */
  #review() { return this.publication.reviewProvider(); }

  /* ==========================================================================================================
   * R8 (was case-authoring R70; T45; N880; Actions D13; v0.2 rule 8): THE OPEN REQUESTS AT SIGNING. A later module
   * (`action-replies`, its R3) fills, once at start, the one source of a case's open requests for comment;
   * `case-authoring` R34's sign step lists what it answers. Nothing here refuses, writes, or enters the document (publication R77's pattern).
   * ========================================================================================================== */
  /** R8: `registerOpenRequests({openRequestsOn})`, or `registerOpenRequests(module, source)`. A second registration is
   *  refused `PROVIDER_DECLARED`, one without the door `PROVIDER_MALFORMED`, each registering nothing. */
  registerOpenRequests(moduleOrSource, maybeSource = undefined) {
    const source = typeof moduleOrSource === "string" ? maybeSource : moduleOrSource;
    const module = typeof moduleOrSource === "string" ? str(moduleOrSource) : str(source && source.module) || "unnamed";
    if (!source || typeof source !== "object" || !OPEN_REQUESTS_DOORS.every((d) => typeof source[d] === "function"))
      return { ok: false, reason: "PROVIDER_MALFORMED",
               detail: localize("case-inputs.index.the_open_requests_source_gives", "the open requests' source gives the door {OPEN_REQUESTS_DOORS}. Nothing was registered.", { OPEN_REQUESTS_DOORS: String(OPEN_REQUESTS_DOORS.join(", ")) }) };
    if (this.#openRequests)
      return { ok: false, reason: "PROVIDER_DECLARED", module: this.#openRequests.module,
               detail: localize("case-inputs.index.the_open_requests_source_is", "the open requests' source is already registered by {module}. Nothing was registered.", { module: String(this.#openRequests.module) }) };
    this.#openRequests = { module, openRequestsOn: source.openRequestsOn };
    return { ok: true, module };
  }

  /** R8: whether the open requests' source is registered, and by whom. */
  openRequestsSource() {
    return this.#openRequests ? { registered: true, module: this.#openRequests.module } : { registered: false, module: null };
  }

  /** R8: the open requests for comment on `case`, its `members` (`[{bundle_id, version_sha}]`) at the pinned bytes, as
   *  `viewer` asks: `{ok: true, rows}` in the source's order, `[]` with none registered; `{ok: false, undetermined: true}`
   *  when the source throws or answers anything but a list of R8's rows. Synchronous; never throws. */
  openRequestsOn({ case: caseId = null, members = [], viewer = null } = {}) {
    if (!this.#openRequests) return { ok: true, rows: [] };
    let read;
    try { read = this.#openRequests.openRequestsOn({ case: caseId, members, viewer }); }
    catch (e) { return { ok: false, undetermined: true, why: String(e && e.message || e).slice(0, 200) }; }
    if (!Array.isArray(read)) return { ok: false, undetermined: true, why: word("case-inputs.why.source_answered_list") };
    const rows = read.map(openRequestRow);
    if (rows.some((r) => r === null)) return { ok: false, undetermined: true, why: word("case-inputs.why.source_answered_malformed") };
    return { ok: true, rows };
  }

  /* ==========================================================================================================
   * R19 (T51; N880 (U4); DEC-340, U366; K3935; P4's seam, BOB's shape): THE MINUTES BESIDE THE GROUP'S PUBLIC COMMENT. A
   * later module (`filings`, its R64) fills, once at start, the one source of a case's minutes comparisons;
   * `case-authoring` R77's sign step lists what it answers, beside R8's open requests. R8's pattern: nothing here
   * refuses, writes, or enters the document, and it asks no reason (a declaration, DEC-13).
   * ========================================================================================================== */
  /** R19: `registerMinutesComparisons({minutesComparisonsOn})`, or `registerMinutesComparisons(module, source)`. A second
   *  registration is refused `PROVIDER_DECLARED`, one without the door `PROVIDER_MALFORMED`, each registering nothing. */
  registerMinutesComparisons(moduleOrSource, maybeSource = undefined) {
    const source = typeof moduleOrSource === "string" ? maybeSource : moduleOrSource;
    const module = typeof moduleOrSource === "string" ? str(moduleOrSource) : str(source && source.module) || "unnamed";
    if (!source || typeof source !== "object" || !MINUTES_DOORS.every((d) => typeof source[d] === "function"))
      return { ok: false, reason: "PROVIDER_MALFORMED",
               detail: localize("case-inputs.index.the_minutes_comparisons_source_gives", "the minutes comparisons' source gives the door {MINUTES_DOORS}. Nothing was registered.", { MINUTES_DOORS: String(MINUTES_DOORS.join(", ")) }) };
    if (this.#minutes)
      return { ok: false, reason: "PROVIDER_DECLARED", module: this.#minutes.module,
               detail: localize("case-inputs.index.the_minutes_comparisons_source_is", "the minutes comparisons' source is already registered by {module}. Nothing was registered.", { module: String(this.#minutes.module) }) };
    this.#minutes = { module, minutesComparisonsOn: source.minutesComparisonsOn };
    return { ok: true, module };
  }

  /** R19: whether the minutes comparisons' source is registered, and by whom. */
  minutesComparisonsSource() {
    return this.#minutes ? { registered: true, module: this.#minutes.module } : { registered: false, module: null };
  }

  /** R19: the minutes comparisons for `case`, its `members` (`[{bundle_id, version_sha}]`) at the pinned bytes, as `viewer`
   *  asks: `{ok: true, rows}` in the source's order, `[]` with none registered; `{ok: false, undetermined: true}` when the
   *  source throws or answers anything but a list of R19's rows. Synchronous; never throws. */
  minutesComparisonsOn({ case: caseId = null, members = [], viewer = null } = {}) {
    if (!this.#minutes) return { ok: true, rows: [] };
    let read;
    try { read = this.#minutes.minutesComparisonsOn({ case: caseId, members, viewer }); }
    catch (e) { return { ok: false, undetermined: true, why: String(e && e.message || e).slice(0, 200) }; }
    if (!Array.isArray(read)) return { ok: false, undetermined: true, why: word("case-inputs.why.source_answered_list") };
    const rows = read.map(minutesRow);
    if (rows.some((r) => r === null)) return { ok: false, undetermined: true, why: word("case-inputs.why.source_answered_malformed") };
    return { ok: true, rows };
  }

  /* ==========================================================================================================
   * R9 (was case-authoring R71; T45; N855 (6c); Actions D5, D6c; v0.2 §3 Success record, rule 17): OUTCOMES CARRIED
   * INTO A CASE'S NEXT EDITION.
   *
   * A service with no op: its one caller is `consequences`' carrying act (its R22, `op=outcomecarry`), inside that
   * member's act, for a success record, a harm addressed and a cure. This module reads nothing of layer 9. An outcome is
   * PENDING until a ratified edition's signed document holds it, read from publication's `case_documents` (its R40), so
   * no write marks it carried and a replaced preparation carries it again. Rows are append-only.
   * ========================================================================================================== */
  /** R9: record one pending outcome of `case` for its next edition, by the member `by`, and answer `{ok: true,
   *  outcome}`. Refusals, in order, each writing nothing: `MACHINE_CANNOT_CARRY_OUTCOME`; `NO_SUCH_CASE` (no ratified
   *  edition, or a project `by` does not see in full, one answer); `CARRY_NOT_A_PARTICIPANT`; `BAD_CARRIED_OUTCOME`
   *  naming the field. Writes inside its caller's transaction. */
  carryOutcome({ case: caseId = null, kind = null, text = undefined, cites = undefined, on = null, by = null } = {}) {
    const C = CARRIED_OUTCOME_CHECKS;
    const who = str(by);
    /* DEC-49 REGION is-carry-machine */
    if (!who || isMachineIdentity(who))
      return refusal(C, "MACHINE_CANNOT_CARRY_OUTCOME", { detail: localize("case-inputs.index.an_outcome_is_carried_into", "an outcome is carried into a case's next edition by a member's act, and no member, or an automated credential, asked. Nothing was written.") });
    /* END DEC-49 REGION is-carry-machine */
    const ratified = this.#ratifiedCase(caseId, who);
    if (!ratified) return this.#noSuchCase();
    /* DEC-49 REGION is-carry-participant */
    if (!this.membership.isJoinedParticipant(ratified.project, who))
      return refusal(C, "CARRY_NOT_A_PARTICIPANT", { case: ratified.caseId, detail: localize("case-inputs.index.who_has_not_joined_project", "{who} has not joined {project}, the project that makes this case. Nothing was written.", { who: String(who), project: String(ratified.project) }) });
    /* END DEC-49 REGION is-carry-participant */
    /* R17 (DEC-199): C-136.5's sentence, true of a missing and a malformed field alike, with `{field}` the field named. */
    const bad = (field, why) => refusal(C, "BAD_CARRIED_OUTCOME", { field, detail: localize("case-inputs.index.field_why_nothing_was_written", "{field}: {why} Nothing was written.", { field: String(field), why: String(why) }),
      translation: fillWords("refusal.BAD_CARRIED_OUTCOME", { field }) });
    const shaped = this.account.accountShaped([{ text: "cites", cites }], null, 0);
    /* DEC-49 REGION is-carry-shaped */
    if (!OUTCOME_KINDS.includes(kind)) return bad("kind", localize("case-inputs.index.an_outcome_is_one_of", "an outcome is one of {OUTCOME_KINDS}.", { OUTCOME_KINDS: String(OUTCOME_KINDS.join(", ")) }));
    if (typeof text !== "string" || !text.trim() || [...text].length > CARRIED_TEXT_MAX || /["\\\r\n]/.test(text))
      return bad("text", localize("case-inputs.index.the_members_statement_is_words", "the member's statement is words on one line, at most {CARRIED_TEXT_MAX} characters, with no quote, backslash or line break.", { CARRIED_TEXT_MAX: String(CARRIED_TEXT_MAX) }));
    if (cites === undefined || cites === null || shaped.ok === false)
      return bad("cites", localize("case-inputs.index.what_the_outcome_rests_on", "what the outcome rests on is a list of cites in case-account R5's shape, {kind, ref, ord}."));
    if (!isDate(on)) return bad("on", localize("case-inputs.index.the_date_the_outcome_occurred", "the date the outcome occurred, YYYY-MM-DD."));
    /* END DEC-49 REGION is-carry-shaped */
    const at = this.#when("millisecond");
    const id = this.record.mintOpaqueId(CARRIED_OUTCOME_PREFIX, at.slice(0, 4), "", (x) =>
      !!this.#one(`SELECT 1 AS x FROM carried_outcomes WHERE outcome_id=?`, x));
    if (!id) return mintExhausted(CARRIED_OUTCOME_PREFIX);
    this.sql.exec(`INSERT INTO carried_outcomes (outcome_id, case_id, kind, text, cites, on_date, carried_by, at)
                   VALUES (?,?,?,?,?,?,?,?)`, id, ratified.caseId, kind, text.trim(),
                  JSON.stringify(shaped.sentences[0].cites), on, who, at);
    return { ok: true, outcome: id };
  }

  /** R9: withdraw a pending outcome, with `reason` (R1's bounds). Refusals, in order, each writing nothing:
   *  `MACHINE_CANNOT_CARRY_OUTCOME`; `NO_SUCH_CARRIED_OUTCOME` (absent, or of a case whose project `by` does not see in
   *  full, alike); `CARRIED_OUTCOME_SETTLED` (a ratified edition carries it, or it was withdrawn); `CARRY_NO_REASON`. */
  withdrawCarriedOutcome({ outcome = null, reason = undefined, by = null } = {}) {
    const C = CARRIED_OUTCOME_CHECKS;
    const who = str(by);
    if (!who || isMachineIdentity(who))
      return refusal(C, "MACHINE_CANNOT_CARRY_OUTCOME", { detail: localize("case-inputs.index.an_outcome_is_withdrawn_from", "an outcome is withdrawn from a case's next edition by a member's act, and no member, or an automated credential, asked. Nothing was written.") });
    const row = str(outcome) ? this.#one(`SELECT outcome_id, case_id FROM carried_outcomes WHERE outcome_id=?`, str(outcome)) : null;
    /* DEC-49 REGION is-carried-outcome-found */
    if (!row || !this.#ratifiedCase(row.case_id, who))
      return refusal(C, "NO_SUCH_CARRIED_OUTCOME", { outcome: str(outcome) || null,
        detail: localize("case-inputs.index.no_outcome_carried_into_a", "no outcome carried into a case you can see answers to that id. Nothing was written.") });
    /* END DEC-49 REGION is-carried-outcome-found */
    const state = this.#outcomeStates(row.case_id).get(row.outcome_id);
    /* DEC-49 REGION is-carried-outcome-pending */
    if (state && state.state !== "pending")
      return refusal(C, "CARRIED_OUTCOME_SETTLED", { outcome: row.outcome_id, state: state.state,
        ...(state.edition ? { edition: state.edition } : {}),
        detail: state.state === "carried" ? localize("case-inputs.index.edition_edition_of_case_id", "edition {edition} of {case_id}, signed, carries this outcome. Nothing was written.", { edition: String(state.edition), case_id: String(row.case_id) }) : localize("case-inputs.index.this_outcome_was_already_withdrawn", "this outcome was already withdrawn. Nothing was written.") });
    /* END DEC-49 REGION is-carried-outcome-pending */
    /* DEC-49 REGION is-carry-reasoned */
    if (typeof reason !== "string" || !reason.trim() || [...reason].length > CARRY_REASON_MAX)
      return refusal(C, "CARRY_NO_REASON", { detail: localize("case-inputs.index.withdrawing_an_outcome_is_recorded", "withdrawing an outcome is recorded with your own words on why, at most {CARRY_REASON_MAX} characters. Nothing was written.", { CARRY_REASON_MAX: String(CARRY_REASON_MAX) }) });
    /* END DEC-49 REGION is-carry-reasoned */
    const at = this.#when("millisecond");
    this.sql.exec(`INSERT INTO carried_outcome_withdrawals (outcome_id, reason, by, at) VALUES (?,?,?,?)`,
                  row.outcome_id, reason, who, at);
    return { ok: true, outcome: row.outcome_id, withdrawn: { reason, by: who, at } };
  }

  /** R9: the case's outcomes, in the order carried, each `{outcome, kind, text, cites, on, carried_by, carried_at, state}`,
   *  `state` `pending`, `carried` (with its `edition`) or `withdrawn` (with its `withdrawal`). Fenced as R1's member door:
   *  a member who is a joined participant of the case's project; every other caller receives R1's dead answer. */
  carriedOutcomesOf({ case: caseId = null, viewer = null } = {}) {
    const v = String(viewer ?? "");
    const who = v.startsWith("member:") ? v.slice("member:".length) : "";
    const ratified = who ? this.#ratifiedCase(caseId, who) : null;
    if (!ratified || !this.membership.isJoinedParticipant(ratified.project, who)) return this.#review().deadAnswer();
    const states = this.#outcomeStates(ratified.caseId);
    return { ok: true, case: ratified.caseId,
             outcomes: this.#outcomeRows(ratified.caseId).map((r) => ({ ...r, ...states.get(r.outcome) })) };
  }

  /* R9: the case `caseId` names when it has a ratified edition (publication R40's `cases`, written at the first
     ratification) whose project `who` sees in full (membership R44), `{caseId, project}`; else null. */
  #ratifiedCase(caseId, who) {
    const id = str(caseId);
    const row = id ? this.#one(`SELECT project_id FROM cases WHERE case_id=?`, id) : null;
    if (!row || this.membership.sight(row.project_id, `member:${who}`) !== "full") return null;
    return { caseId: id, project: row.project_id };
  }

  /* R9: NO_SUCH_CASE, one answer for a case with no ratified edition and one whose project the member does not see. */
  #noSuchCase() {
    return { ok: false, reason: "NO_SUCH_CASE", detail: localize("case-inputs.index.no_published_case_you_can", "no published case you can see answers to that id. A case not yet published, and one you cannot see, are answered alike. Nothing was written.") };
  }

  /** R9: the case's pending outcomes in the order carried, each `{outcome, kind, text, cites, on, carried_by,
   *  carried_at}`, asking no viewer and writing nothing; `case-authoring` R74 reads it into an edition of `caseId`. */
  pendingOutcomes(caseId) {
    const states = this.#outcomeStates(caseId);
    return this.#outcomeRows(caseId).filter((r) => (states.get(r.outcome) || {}).state === "pending");
  }

  /* R9: every outcome carried for `caseId`, in the order carried. */
  #outcomeRows(caseId) {
    return this.#rows(`SELECT outcome_id, kind, text, cites, on_date, carried_by, at FROM carried_outcomes
                       WHERE case_id=? ORDER BY seq`, caseId)
      .map((r) => ({ outcome: r.outcome_id, kind: r.kind, text: r.text, cites: JSON.parse(r.cites), on: r.on_date,
                     carried_by: r.carried_by, carried_at: r.at }));
  }

  /* R9: each outcome's state, read at the act: `carried` with the edition when a ratified edition's signed document
     holds it (publication R40's `case_documents`, its `outcomes:` block, case-grammar R29), else `withdrawn` with the
     withdrawal, else `pending`. */
  #outcomeStates(caseId) {
    const carriedIn = new Map();
    for (const d of this.#rows(`SELECT edition, text FROM case_documents WHERE case_id=? AND ratified_at IS NOT NULL
                                AND sig_armored IS NOT NULL ORDER BY edition`, caseId))
      for (const o of outcomesOf(parseFrontmatter(d.text).data || {}))
        if (o && o.outcome && !carriedIn.has(o.outcome)) carriedIn.set(o.outcome, Number(d.edition));
    const out = new Map();
    for (const r of this.#outcomeRows(caseId)) {
      if (carriedIn.has(r.outcome)) { out.set(r.outcome, { state: "carried", edition: carriedIn.get(r.outcome) }); continue; }
      const w = this.#one(`SELECT reason, by, at FROM carried_outcome_withdrawals WHERE outcome_id=?`, r.outcome);
      out.set(r.outcome, w ? { state: "withdrawn", withdrawal: { reason: w.reason, by: w.by, at: w.at } } : { state: "pending" });
    }
    return out;
  }

  /* ==========================================================================================================
   * op=whatchangedpropose, op=whatchangeddrafts: drafts of a new edition's statement (R6, was
   * case-authoring R39; DEC-101 (1), DEC-84 (14))
   *
   * A DRAFT IS NEVER A STATEMENT. Any credential may propose one, a machine's labelled machine work
   * (`record-grammar`'s `proposalLabel(proposedBy, "edition_statement")`, its R43); it becomes the edition's statement
   * only when a member adopts or rewrites it at op=publish (`case-authoring` R38), which records the draft it began as and whether its
   * words were kept. Drafts are append-only: nothing here updates or removes one.
   * ========================================================================================================== */

  /* R6: the published case `viewer` may see, or the one refusal for every other (R14: a case not published and one
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
             detail: localize("case-inputs.index.no_published_case_you_can_2", "no published case you can see answers to that id. A case not yet published, and one you cannot see, are answered alike. Nothing was written.") };
  }

  /** R6: store a draft of a new edition's statement of what changed in `case`, labelled by
   *  `proposalLabel(proposedBy, "edition_statement")`. Refusals, in order: `NO_SUCH_CASE`; `text` not a string, empty
   *  after trimming, or over `WHAT_CHANGED_MAX` code points `BAD_WHAT_CHANGED`. Each writes nothing. Answers
   *  `{ok: true, draft: {id, case, text, label, at}}`. */
  proposeWhatChanged({ case: caseId = null, text = undefined, proposedBy = null, viewer = null } = {}) {
    const seen = this.#caseInSight(caseId, viewer);
    if (seen.ok === false) return seen;
    const length = typeof text === "string" ? [...text].length : null;
    if (length === null || !text.trim() || length > WHAT_CHANGED_MAX)
      return { ok: false, reason: "BAD_WHAT_CHANGED", case: seen.caseId, length, max: WHAT_CHANGED_MAX,
               detail: localize("case-inputs.index.a_draft_of_what_changed", "a draft of what changed in an edition is words, at most {WHAT_CHANGED_MAX} characters: {v1}. Nothing was written.", { WHAT_CHANGED_MAX: String(WHAT_CHANGED_MAX), v1: String(length === null ? localize("case-inputs.index.none_were_given", "none were given") : !text.trim() ? localize("case-inputs.index.the_words_given_were_blank", "the words given were blank")
                       : localize("case-inputs.index.the_words_given_are_length", "the words given are {length} characters", { length: String(length) })) }) };
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
               next: localize("case-inputs.index.a_member_adopts_it_as", "a member adopts it as written, or rewrites it, at op=publish (whatChanged: {text, draft: \"{id}\"}); until then it is a draft and never the team's statement", { id: String(id) }) };
    });
  }

  /** R6: the drafts of `case`'s statement of what changed, oldest first, each `{id, text, label, at}`, at most
   *  `WHAT_CHANGED_DRAFTS_MAX` (`truncated` when there are more). `NO_SUCH_CASE` as R6's proposal answers it. Writes
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
  /** R7 (new; the map's §2): the draft of `caseId`'s statement of what changed that `draftId` names, `{draft_id, text}`,
   *  or null when none does (a draft of another case included). It asks no viewer, writes nothing and never throws: the
   *  one read of a draft `case-authoring` R38 makes. */
  whatChangedDraftOf(caseId, draftId) {
    try {
      const id = str(caseId), named = str(draftId);
      if (!id || !named) return null;
      const d = this.#one(`SELECT draft_id, text FROM what_changed_drafts WHERE draft_id=? AND case_id=?`, named, id);
      return d ? { draft_id: d.draft_id, text: d.text } : null;
    } catch { return null; }
  }

  /* ==========================================================================================================
   * R20–R26 (T51; K4169, K4171, K4185; UC-101; Design Requirements 6, 10; DEC-111 item 9): A CASE'S STANDARD DETAILS.
   *
   * Four fields (area of government, point of contact, related work, relationship disclosure) sit BESIDE the case and
   * never enter its signed document (K4164 goal 1; R25): they change after signing, as a contact moves, which a signed
   * edition cannot do honestly. One row per set, append-only; a field's standing value is its latest. Not stated is
   * shown "not stated", never refused at publication and never filled in (Declared Bias, DEC-20: disclosed, never blocking).
   * ========================================================================================================== */
  /* R20, R23, R24: the case `caseId` names and its project: published when its first edition was ratified (publication
     R40's `cases`), else an unsigned preparation (the project its latest `case_documents` row prints), else null. */
  #detailsCase(caseId) {
    const id = str(caseId);
    if (!id) return null;
    const pub = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, id);
    if (pub) return { caseId: id, project: pub.project_id, published: true };
    const doc = this.#one(`SELECT text FROM case_documents WHERE case_id=? ORDER BY edition DESC LIMIT 1`, id);
    const project = doc ? str((parseFrontmatter(doc.text).data || {}).case_project) : "";
    return project ? { caseId: id, project, published: false } : null;
  }

  /* R20, R23: whether `viewer` sees the project in full (membership R43's rule, through its one `sight`). */
  #detailsFull(project, viewer) {
    return typeof viewer === "string" && !!viewer && this.membership.sight(project, viewer) === "full";
  }

  /* R20, R23: one answer for a case that has neither a preparation nor an edition and one the viewer cannot see (R14). */
  #detailsNoSuchCase() {
    return { ok: false, reason: "NO_SUCH_CASE", detail: fillDetails("noSuchCase"), translation: fillDetails("noSuchCase") };
  }

  /* R22: each field's standing value, `{stated, value, set_by, set_at}` (null where not stated). */
  #detailsStanding(caseId, handles = true) {
    const out = {};
    for (const field of CASE_DETAILS_FIELDS) {
      const r = this.#one(`SELECT value, set_by, at FROM case_details WHERE case_id=? AND field=? ORDER BY seq DESC LIMIT 1`,
                          caseId, field);
      const value = r && r.value !== "null" ? JSON.parse(r.value) : null;
      out[field] = value === null ? { stated: false, value: null, set_by: null, set_at: null }
        : { stated: true, value, set_by: handles ? this.membership.memberFacts(r.set_by)?.handle ?? null : null, set_at: r.at };
    }
    return out;
  }

  /** R20: record one field of a case's details, or clear it (`value: null`). Refusals, in order, each writing nothing:
   *  `MACHINE_CANNOT_SET_DETAILS`; the existence refusal (C-70.1) or `NO_SUCH_CASE`; `NOT_THE_PROJECT_OWNER`;
   *  `DETAILS_FIELD_UNKNOWN`; `DETAILS_MALFORMED` naming the part. Answers `{ok: true, case, field, value, at}`. */
  caseDetailsSet({ case: caseId = null, field = null, value = undefined, by = null, viewer = null } = {}) {
    const who = str(by);
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_SET_DETAILS", detail: fillDetails("machine") };
    const found = this.#detailsCase(caseId);
    if (!found) return this.#detailsNoSuchCase();
    const existence = this.membership.existenceAct(found.project, viewer);
    if (existence) return existence;
    if (!this.#detailsFull(found.project, viewer)) return this.#detailsNoSuchCase();
    if (!this.membership.isProjectOwner(found.project, who))
      return { ok: false, reason: "NOT_THE_PROJECT_OWNER", project: found.project, author: who, detail: fillDetails("notOwner") };
    if (typeof field !== "string" || !CASE_DETAILS_FIELDS.includes(field))
      return { ok: false, reason: "DETAILS_FIELD_UNKNOWN", field: typeof field === "string" ? field.slice(0, 80) : null,
               fields: [...CASE_DETAILS_FIELDS],
               detail: fillDetails("fieldUnknown", { field: typeof field === "string" ? field.slice(0, 80) : String(field), fields: CASE_DETAILS_FIELDS.join(", ") }) };
    const bad = value === undefined ? "value" : value === null ? null : detailsShapeProblem(field, value, (e) => this.entities.has(e));
    if (bad)
      return { ok: false, reason: "DETAILS_MALFORMED", field, part: bad, detail: fillDetails("malformed", { field, part: bad }) };
    const json = JSON.stringify(value);
    return this.record.transact(() => {
      const at = this.#when("millisecond");
      this.sql.exec(`INSERT INTO case_details (case_id, field, value, set_by, at) VALUES (?,?,?,?,?)`,
                    found.caseId, field, json, who, at);
      return { ok: true, case: found.caseId, field, value: JSON.parse(json), at };
    });
  }

  /** R22, R23: the four standing values and the history, to a member who sees the case's project in full; every other
   *  caller receives the answer for a case that does not exist (R14). Writes nothing and never throws. */
  caseDetails({ case: caseId = null, viewer = null } = {}) {
    try {
      const found = this.#detailsCase(caseId);
      if (!found || !this.#detailsFull(found.project, viewer)) return this.#detailsNoSuchCase();
      const rows = this.#rows(`SELECT field, value, set_by, at FROM case_details WHERE case_id=? ORDER BY seq DESC LIMIT ?`,
                              found.caseId, CASE_DETAILS_HISTORY_MAX + 1);
      return { ok: true, case: found.caseId, published: found.published, details: this.#detailsStanding(found.caseId),
               truncated: rows.length > CASE_DETAILS_HISTORY_MAX,
               history: rows.slice(0, CASE_DETAILS_HISTORY_MAX).reverse().map((r) => ({
                 field: r.field, value: r.value === "null" ? null : JSON.parse(r.value),
                 by: this.membership.memberFacts(r.set_by)?.handle ?? null, at: r.at })) };
    } catch { return this.#detailsNoSuchCase(); }
  }

  /** R24: the credential-free public read of a published case's details: the four standing values (never who set them),
   *  the team's slug and the sentence that they are its current statement, not part of the signed edition. A case with
   *  no published edition, an unsigned preparation included, is `NOT_PUBLISHED` (C-98.8) and nothing of it. */
  caseDetailsPublic({ case: caseId = null } = {}) {
    const id = str(caseId);
    if (!id || !this.#one(`SELECT 1 AS x FROM cases WHERE case_id=?`, id))
      return { ok: false, reason: "NOT_PUBLISHED", ...rowOf("NOT_PUBLISHED"), detail: fillDetails("notPublished") };
    let group = null;
    try { const f = this.promotion.fact("producingGroup"); group = f && f.ok && str(f.value) ? str(f.value) : null; } catch { group = null; }
    const standing = this.#detailsStanding(id, false);
    const details = {};
    for (const field of CASE_DETAILS_FIELDS) {
      const { stated, value, set_at } = standing[field];
      details[field] = { stated, value, set_at, ...(stated ? {} : { says: fillDetails("notStated") }) };
    }
    return { ok: true, case: id, group, details, sentence: fillDetails("publicCurrent") };
  }

  /* R4 (was case-authoring R59; N681, N823): whether `publish-schedule` holds this case edition waiting (its R1, read
     through its R7, the same read as `case-authoring` R58's): signed, for acknowledgeStatement. */
  #waits(caseId, edition) {
    const w = this.publishSchedule.waitingEditionOf(caseId);
    return !!(w && Number(w.edition) === Number(edition));
  }

  /* ==========================================================================================================
   * op=statementack: acknowledgeStatement (R1–R5, was case-authoring R19–R21, R59, R62), with the
   * acknowledger's own words (`reason`, DEC-88)
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
  /** R1–R5: one act, inside one transaction (record-core R32), since it inserts its row and re-authors an unsigned
   *  document's list through publication R21, which writes only inside its caller's transaction: either both land or
   *  neither does. The providers are reached first, outside it, so one created lazily on the host keeps its tables
   *  whatever the act answers. */
  acknowledgeStatement(args = {}) {
    void this.publication; void this.publishSchedule;
    return this.record.transact(() => this.#acknowledgeStatement(args));
  }

  #acknowledgeStatement({ draft = null, caseId = null, edition = null, secretSha = null, viewer = null,
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
                     localize("case-inputs.index.name_the_statement_to_acknowledge", "name the statement to acknowledge: draft=<a draft case's id>, or case=<case id>&edition=<n> for a case document authored and not yet signed."));
        /* END DEC-49 REGION is-statement-ack-subject */
        /* publication R40's read contract; the standing test is publication's (its R1). */
        const doc = this.#one(`SELECT case_id, edition, text, ratified_at FROM case_documents
                               WHERE case_id=? AND edition=?`, cid, ed);
        if (!doc || !this.publication.hasCaseStanding(doc, v)) return review.deadAnswer();
        /* R4 (N681, N823): a document publish-schedule holds waiting (its R1, R7) is signed here, as a ratified one is: its
           signature covers the list, and nothing is re-authored. A cancelled edition's is again a preparation. */
        /* DEC-49 REGION is-statement-ack-signed */
        if (doc.ratified_at || this.#waits(cid, ed))
          return ack("STATEMENT_ACK_ALREADY_SIGNED",
                     localize("case-inputs.index.case_cid_edition_ed_is", "case {cid} edition {ed} is signed{v1}, and its completeness block — which lists who acknowledged its statement — is what the signature covers. An acknowledgement now could appear in no signed document of this edition; a published edition is corrected forward, by the next one (DEC-12).", { cid: String(cid), ed: String(ed), v1: String(doc.ratified_at ? "" : localize("case-inputs.index.and_waiting_to_be_published", " and waiting to be published at its set time")) }),
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
                   localize("case-inputs.index.an_acknowledgement_of_a_cases", "an acknowledgement of a case's exclusion statement is given by a JOINED participant of the project that produces the case, or by the recipient of a review copy through their grant (BIO_Publication §3 rule 11). Sight of a project is not a place in it: an invited member who has not joined, and an administrator, are neither."));
      /* END DEC-49 REGION is-statement-ack-participant */
      kind = "participant"; by = who;
    }
    const text = fmSafe(statement);
    /* DEC-49 REGION is-statement-ack-statement */
    if (!text)
      return ack("STATEMENT_ACK_NO_STATEMENT",
                 localize("case-inputs.index.this_draft_states_nothing_about", "this draft states nothing about what its case excludes, so there is no statement to acknowledge yet. The draft's editor authors it (statement=); acknowledge it then."));
    /* END DEC-49 REGION is-statement-ack-statement */
    /* REC-193 / §3 rule 13 — A WRITER NOT RECORDED IS STATED, NOT GUESSED: an acknowledgement recorded against an
       unknown author may BE the author's own. It costs the act and not the case. A recipient is unaffected. */
    /* DEC-49 REGION is-statement-ack-author-undetermined */
    if (kind === "participant" && (authorFromDraft || authorStatedUndetermined) && !statementAuthor)
      return ack("STATEMENT_ACK_AUTHOR_UNDETERMINED",
                 localize("case-inputs.index.v1_an_acknowledgement_is_a", "{v1}An acknowledgement is a SECOND person's reading (BIO_Publication §3 rule 11), and your team's Civicsmith cannot tell here whether you are the first — reading the draft's last editor would attribute the statement to whoever last touched any part of it. {v2}The case publishes either way.", { v1: String(authorFromDraft
                   ? localize("case-inputs.index.this_draft_records_no_author", "this draft records no author for its exclusion statement: it was written before your team's Civicsmith stamped one, and who wrote the sentence that now stands is UNDETERMINED. ")
                   : localize("case-inputs.index.this_case_document_states_that", "this case document states that who wrote its exclusion statement could not be established, so the author of the sentence is UNDETERMINED — and it is not the member named as the case's author, who prepared and published it (BIO_Publication §3 rule 13). ")), v2: String(authorFromDraft
                     ? localize("case-inputs.index.an_editor_of_this_project", "An editor of this project saves the statement again (op=casedraft with statement=), which records who wrote its current bytes; acknowledge it then. ")
                     : localize("case-inputs.index.publish_this_edition_again_from", "Publish this edition again from a draft whose statement carries an author (op=publish), and this document will name the member who wrote the sentence. ")) }),
                 { draft: draftId, author: null });
    /* END DEC-49 REGION is-statement-ack-author-undetermined */
    /* THE AUTHOR'S OWN ACKNOWLEDGEMENT IS REFUSED BY NAME: the rule's whole content is a SECOND person. The author is
       the member who wrote the statement's current bytes (§3 rule 13), and on the case door the publisher too. */
    /* DEC-49 REGION is-statement-ack-by-its-author */
    if (kind === "participant" && ((statementAuthor && by === statementAuthor)
                                   || (blockAuthor && by === blockAuthor)))
      return ack("STATEMENT_ACK_BY_ITS_AUTHOR",
                 localize("case-inputs.index.v1_ask_a_participant_of", "{v1}Ask a participant of this project, or hand the draft to a reader through a review grant. The case publishes without one and says so.", { v1: String(statementAuthor && by === statementAuthor
                   ? localize("case-inputs.index.you_wrote_this_statement_and", "you wrote this statement, and its acknowledgement is a SECOND person's reading of what the case leaves out (BIO_Publication §3 rule 11). ")
                   : localize("case-inputs.index.you_prepared_and_published_this", "you prepared and published this case and authored its completeness block at that act, so you are its FIRST reader; an acknowledgement is a SECOND person's reading of what the case leaves out (BIO_Publication §3 rule 11). Who WROTE the statement is a separate fact, stated separately in these bytes (§3 rule 13). ")) }),
                 { author: statementAuthor && by === statementAuthor ? statementAuthor : blockAuthor });
    /* END DEC-49 REGION is-statement-ack-by-its-author */
    /* R1 — DEC-88 (K1025, K1030): THE ACKNOWLEDGER'S OWN WORDS, kept with the acknowledgement and shown in R2's list.
       Asked after C-82.6, the last refusal before anything is read for the write, so nothing is written. Counted in code
       points (K1050's reading); blank is empty after trimming. */
    /* DEC-49 REGION is-statement-ack-reasoned */
    if (typeof reason !== "string" || !reason.trim() || [...reason].length > STATEMENT_ACK_REASON_MAX)
      return ack("STATEMENT_ACK_NO_REASON",
                 localize("case-inputs.index.an_acknowledgement_of_a_cases_2", "an acknowledgement of a case's exclusion statement is recorded with the acknowledger's own words on it (reason=), at most {STATEMENT_ACK_REASON_MAX} characters: say what you read and what you make of what the case leaves out. {v1} Nothing was written.", { STATEMENT_ACK_REASON_MAX: String(STATEMENT_ACK_REASON_MAX), v1: String(typeof reason !== "string" ? localize("case-inputs.index.none_were_given_2", "None were given.") : !reason.trim()
                 ? localize("case-inputs.index.the_words_given_were_blank_2", "The words given were blank.") : localize("case-inputs.index.the_words_given_are_length_2", "The words given are {length} characters.", { length: String([...reason].length) })) }));
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
    /* R4: a document held waiting is signed, so no draft door re-authors it either (publication R21 refuses it). */
    const found = [byIdentity, byLink]
      .filter((d, i, all) => d && all.findIndex((e) => e && e.case_id === d.case_id) === i)
      .filter((d) => !this.#waits(d.case_id, d.edition))
      .sort((a, b) => (a.case_id < b.case_id ? -1 : a.case_id > b.case_id ? 1 : 0));
    /* R2: keyed by the statement, the project, the identity it was given at and the acknowledger; at no case identity
       the draft is part of what was read (REC-217). A repeat answers `existed: true`. */
    const same = this.#one(`SELECT ack_id, at, reason FROM statement_acknowledgements
                            WHERE project_id=? AND statement_sha=? AND case_id IS ? AND edition=?
                              AND acknowledger_kind=? AND acknowledger=?
                              AND (? IS NOT NULL OR draft_id IS ?)`,
                           project, sha, ident.caseId ?? null, ident.edition, kind, by,
                           ident.caseId ?? null, draftId);
    const when = same ? same.at : this.#when("millisecond");
    /* A repeat keeps the first reason (R2: `existed: true`, nothing rewritten). */
    if (!same)
      this.sql.exec(`INSERT INTO statement_acknowledgements (project_id,case_id,edition,statement_sha,draft_id,
                     acknowledger_kind,acknowledger,recipient,at,reason) VALUES (?,?,?,?,?,?,?,?,?,?)`,
                    project, ident.caseId ?? null, ident.edition, sha, draftId, kind, by, recipient, when, reason);
    /* The parse is the authority on the project, the SQL match its index. */
    const docs = found.filter((d) => str((parseFrontmatter(d.text).data || {}).case_project) === project);
    const reauthored = docs.map((d) => this.#reauthorAcknowledgements(d));
    /* REC-217: which case edition, if any, a publisher named this draft for (signed or not). */
    const linkedTo = ident.caseId == null && draftId ? this.#draftLinkOf(draftId) : null;
    /* R4: an edition held waiting is signed, as a ratified one is. */
    const linkedSigned = !!(linkedTo && (linkedTo.sig_armored || this.#waits(linkedTo.case_id, linkedTo.edition)));
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
                                            signed: linkedSigned } } : {}),
             listed: linkedTo
               ? localize("case-inputs.index.this_is_a_reading_of", "this is a reading of draft {draftId}, which {authored_by} named as the draft of edition {edition} of {case_id} when publishing it ({authored_at}), so it is a reading of that case (BIO_Publication §3 rule 13). {v1}", { draftId: String(draftId), authored_by: String(linkedTo.authored_by), edition: String(linkedTo.edition), case_id: String(linkedTo.case_id), authored_at: String(linkedTo.authored_at), v1: String(linkedSigned
                     ? localize("case-inputs.index.that_edition_is_already_signed", "That edition is already SIGNED, and its list is what the signature covers: this reading can appear in no signed document of it, and is recorded as the act it was.")
                     : localize("case-inputs.index.its_case_document_is_authored", "Its case document is authored and unsigned, so it now lists this reading (case_documents), re-authored; its owner signs the new bytes.")) })
               : ident.caseId != null
               ? localize("case-inputs.index.the_completeness_block_of_caseidentitysentence", "the completeness block of {caseIdentitySentence} lists this acknowledgement when its case document is authored with this exact statement (op=publish), or — if that document is already authored and unsigned — now, re-authored (case_documents). A statement edited afterwards is a different sentence, and this acknowledgement is not listed under it. It is listed under NO OTHER CASE, even one whose statement is byte-identical: reading this case's statement is not reading that one's.", { caseIdentitySentence: String(review.caseIdentitySentence(ident.caseId, ident.edition)) })
               : localize("case-inputs.index.this_is_a_reading_of_2", "this is a reading of draft {draftId}, which names no case — a case id is minted only by publication, so this acknowledgement is bound to NO case identity yet. op=reviewcopy lists it for this draft. NO case document lists it, and that is deliberate: a case document that named you would be claiming you read ITS statement, which this record cannot establish of any case (§3 rule 13) — UNTIL the case is published naming this draft (op=publish&draft={draftId_2}): at that act this reading binds to the case it produced, and its document lists it with the link stated (REC-217, BOB #33). Published without draft=, it is counted there as undetermined and never named. A statement edited afterwards is a different sentence, and this acknowledgement is not listed under it.", { draftId: String(draftId), draftId_2: String(draftId) }) };
  }

  /* REC-217 / §3 rule 13 (BOB #33): the case edition a publisher named this draft for, read off the act's own record
     (publication R40's `case_documents.draft_id`, with the act's `authored_by` and `authored_at`), or null. One row at
     most by construction: `case-authoring` R9 refuses a second binding of one draft. */
  #draftLinkOf(draftId) {
    return this.#one(`SELECT case_id, edition, authored_by, authored_at, sig_armored FROM case_documents
                      WHERE draft_id=? LIMIT 1`, String(draftId ?? ""));
  }

  /* R2: AN ACKNOWLEDGEMENT THAT LANDS WHILE ITS CASE DOCUMENT IS AUTHORED AND UNSIGNED RE-AUTHORS THAT DOCUMENT'S LIST,
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
               why: localize("case-inputs.index.this_case_document_was_authored", "this case document was authored before acknowledgements were recorded, so it has no list to add to; it is left exactly as it was signed-for-review") };
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

  /** R2: THE ACKNOWLEDGEMENTS OF ONE STATEMENT AT ONE CASE IDENTITY, the one list: `op=publish` prints it (`case-authoring` R14) and
   *  the review copy shows it, so the list a reviewer sees and the list a document prints are one read. Bounded, and
   *  a list that hit the bound says so.
   *
   *  THREE EXCLUSIONS AND A LINK, each a different question about one list:
   *   - `exceptAuthor` is the member PUBLISHING: they author the completeness block, so their own reading of it is not a
   *     second one (D-150; counted as `byAuthor`).
   *   - `writer` is who wrote the SENTENCE (R3): `null` means not asked; `{by: '<member>'}` withholds that member's
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
             /* R1: each row carries its acknowledger's words, null on one recorded before DEC-88. The document's
                lines (`ackFrontmatterLines`, `ackBodyLines`) print the fields they always printed, so the signed
                acknowledgement lines are unchanged. */
             rows: listed.map((r) => ({ kind: r.acknowledger_kind, by: r.acknowledger,
                                        recipient: r.recipient ?? null, at: r.at, reason: r.reason ?? null,
                                        ...(linked && r.case_id == null ? { draft: r.draft_id } : {}) })) };
  }

  /** R3 (was case-authoring R21) — REC-212 / §3 rule 13: WHO WROTE THE STATEMENT THIS CASE IS ABOUT TO PUBLISH, as distinct from who prepared
   *  and published it (two acts, two names, never conflated). It carries review's server stamp (`case_drafts
   *  .statement_by`, review R26's read contract, REC-193) onto the document, matched by the STATEMENT'S OWN IDENTITY
   *  (`fmSafe` of the sentence, the normalisation the acknowledgements hash).
   *
   *  THE NAMED DRAFT FIRST (`case-authoring` R9's link): when the publisher named the draft and it holds this sentence, its stamp is the
   *  writer, and no other draft is consulted; a named draft with no stamp is UNDETERMINED. A named draft holding
   *  another sentence says nothing about these bytes, so the project's drafts are asked as below (K240).
   *  Otherwise, four answers, each a fact and none a fallback:
   *   (1) drafts at this identity hold this sentence and agree on its author — that member;
   *   (2) no draft at this identity holds it — the PUBLISHER wrote these bytes at this act (`statement=` is authored);
   *   (3) a matching draft records no author, or two name different members — UNDETERMINED, stated;
   *   (4) the project holds more drafts than one bounded read lists — UNDETERMINED, with that reason.
   *  A draft at this identity whose arguments will not parse is UNDETERMINED, asked before (2) so it can never be
   *  absorbed by it. The document prints where the name came from beside the name. */
  statementWriter(project, caseId, edition, statement, publisher, namedDraft = null) {
    const want = fmSafe(statement);
    const notFromAuthor = localize("case-inputs.index.it_is_not_read_off", "It is NOT read off {publisher}, who prepared and published this case: preparing a case is not writing its statement (BIO_Publication §3 rule 13).", { publisher: String(publisher) });
    if (!want) return { by: null, from: "no_statement",
                        stated: word("case-inputs.stated.undetermined_case_document") };
    if (namedDraft) {
      let p = null;
      try { p = JSON.parse(namedDraft.params); } catch { p = null; }
      if (p && fmSafe(p.statement) === want) {
        const stamp = typeof namedDraft.statement_by === "string" && namedDraft.statement_by.trim()
          ? namedDraft.statement_by.trim() : null;
        if (!stamp)
          return { by: null, from: "named_draft_unrecorded",
                   stated: word("case-inputs.stated.undetermined_named_draft", { publisher: String(publisher), draft_id: String(namedDraft.draft_id), not_from_author: String(notFromAuthor) }) };
        return { by: stamp, from: "named_draft",
                 stated: stamp === publisher
                   ? word("case-inputs.stated.wrote_exclusion_statement", { stamp: String(stamp), draft_id: String(namedDraft.draft_id), publisher: String(publisher) })
                   : localize("case-inputs.index.stamp_wrote_this_exclusion_statement", "{stamp} wrote this exclusion statement, in draft {draft_id}, which {publisher} named as this case's draft. {publisher_2} prepared and published the case: two acts, two names (BIO_Publication §3 rule 13).", { stamp: String(stamp), draft_id: String(namedDraft.draft_id), publisher: String(publisher), publisher_2: String(publisher) }) };
      }
    }
    const cap = DRAFTS_READ_MAX;
    /* review R26's read contract on `case_drafts`, under its bound. */
    const rows = this.#rows(`SELECT draft_id, case_id, params, statement_by FROM case_drafts
                             WHERE project_id=? ORDER BY created_at, draft_id LIMIT ?`, project, cap + 1);
    if (rows.length > cap)
      return { by: null, from: "drafts_unbounded",
               stated: word("case-inputs.stated.undetermined_holds_drafts", { project: String(project), cap: String(cap), not_from_author: String(notFromAuthor) }) };
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
               stated: word("case-inputs.stated.undetermined_draft_case", { unreadable: String(unreadable.length), project: String(project), unreadable3: String(unreadable.join(", ")), not_from_author: String(notFromAuthor) }) };
    if (!matches.length)
      return { by: publisher, from: "this_act",
               stated: word("case-inputs.stated.wrote_exclusion_statement_act", { publisher: String(publisher), project: String(project) }) };
    if (matches.some((d) => !d.statement_by))
      return { by: null, from: "draft_unrecorded",
               stated: word("case-inputs.stated.undetermined_draft_sentence", { draft_id: String(matches.map((d) => d.draft_id)
                     .join(", ")), not_from_author: String(notFromAuthor) }) };
    const names = [...new Set(matches.map((d) => d.statement_by))];
    if (names.length > 1)
      return { by: null, from: "drafts_disagree",
               stated: word("case-inputs.stated.undetermined_drafts_case", { names: String(names.length), project: String(project), names3: String(names.join(", ")), not_from_author: String(notFromAuthor) }) };
    return { by: names[0], from: "draft",
             stated: names[0] === publisher
               ? word("case-inputs.stated.wrote_exclusion_statement_draft_prepared", { names: String(names[0]) })
               : localize("case-inputs.index.v1_wrote_this_exclusion_statement", "{v1} wrote this exclusion statement, in the draft it was prepared in. {publisher} prepared and published the case: two acts, two names (BIO_Publication §3 rule 13).", { v1: String(names[0]), publisher: String(publisher) }) };
  }}

const instances = new WeakMap();

/** R16 (K61; `case-account` R12's form): the one instance per host, created on the first call with `deps`. It creates its
 *  tables with the DDL `case-authoring` created them by, so a running store's rows are kept with no data move, and
 *  declares them to record-core's purge (R11, K23). R11 (K2675's form): a declaration record-core refuses
 *  (`TABLE_DECLARED`: another owner already holds a table, so none of this module's is declared) is thrown at creation
 *  and no instance is kept, rather than leaving the tables silently outside the purge. */
export function caseInputsOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    c = new CaseInputs({ ...d, host, storage, record, membership });
    c.migrate();
    const declared = record.declarePurge("case-inputs", CASE_INPUTS_TABLES);
    if (declared && declared.ok === false)
      throw new Error(`case-inputs: record-core refused its table declaration: ${declared.reason} (${declared.table})`);
    instances.set(host, c);
  }
  return c;
}

/** R16 (K3): the module's ops, as entries of the plane's op map (`plane/store.mjs`), which spreads it directly before
 *  `case-authoring`'s. `viewer` and `author` are the control plane's stamps, read from the query, never a body's. Each
 *  arm answers exactly what its service answers. */
export function caseInputsOps(c, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    /* R6: a draft of a new edition's statement of what changed. The words come in the body (a statement of up to
       8,000 characters is not a query parameter), the case from either; `proposedBy` is the `author` stamp. */
    whatchangedpropose: () => c.proposeWhatChanged({ case: q("case") || b.case || null,
      text: typeof b.text === "string" ? b.text : (q("text") ?? undefined),
      viewer: q("viewer"), proposedBy: q("author") }),
    /* R6: the case's drafts, oldest first. */
    whatchangeddrafts: () => c.whatChangedDrafts({ case: q("case") || b.case || null, viewer: q("viewer") }),
    /* R1, R5: the review copy's two doors, and a member's third subject (an unsigned case document). R5 (N761;
       K2175): the grant's digest is read from the BODY only, where the control plane sets it after removing any a
       caller sent; a `secretSha` in the query is never read, so it opens no door (the dead answer), and no digest
       travels in an internal address. */
    statementack: () => c.acknowledgeStatement({ draft: q("draft"), caseId: q("case"), edition: q("edition"),
      secretSha: typeof b.secretSha === "string" ? b.secretSha : null, viewer: q("viewer"),
      bySecret: q("bySecret") === "1",
      /* R1 (DEC-88): the acknowledger's words, from the query as the subject is; absent stays absent. */
      reason: q("reason") ?? undefined }),
    /* R20 (T51): one field of a case's details. `case` from the query, else the body; `field` and `value` from the body,
       else the query (a value in the query is a JSON text; one that is not JSON is passed as the text it is, and is
       malformed); `by` and `viewer` the stamps. */
    casedetailsset: () => c.caseDetailsSet({ case: q("case") || b.case || null, field: b.field !== undefined ? b.field : q("field"),
      value: b.value !== undefined ? b.value : url.searchParams.has("value") ? jsonText(q("value")) : undefined,
      by: q("by") ?? q("author"), viewer: q("viewer") }),
    /* R23: the details and their history, to a member who sees the case's project. */
    casedetails: () => c.caseDetails({ case: q("case") || b.case || null, viewer: q("viewer") }),
  };
}

/* R20: a value that came in the query, a JSON text; text that is not JSON is passed as it is, for R21 to refuse. */
function jsonText(t) {
  try { return JSON.parse(t); } catch { return t; }
}

const registered = new WeakMap();

/** R24 (public-read R18, as `case-checker`'s `registerCaseCheckerPublicReads`): at start, register `casedetailspublic` once
 *  per host with `public-read`; the registration's answer is kept and returned, so a refused one is seen. Creating the
 *  instance (R16) does not register, so it reaches no other module's instance on the host; the plane calls this where it
 *  registers the other modules' public reads. */
export function registerCaseInputsPublicReads(host, deps = {}) {
  if (registered.has(host)) return registered.get(host);
  const publicRead = deps.publicRead || publicReadOf(host);
  const answer = publicRead.registerPublicReads("case-inputs", caseDetailsPublicReads(caseInputsOf(host, deps)));
  registered.set(host, answer);
  return answer;
}

/** R24 (public-read R18): the one credential-free read this module registers at start, `casedetailspublic`, taking the
 *  query parameter `case`. */
export function caseDetailsPublicReads(c) {
  return { casedetailspublic: { read: (a) => c.caseDetailsPublic({ case: a.case ?? null }), params: ["case"] } };
}

/* R27, R29 (T51; K4168, K4202; op-declarations R80, op-grades R49): the ops of this module that a screen sends or that this
   tranche adds, declared by their owner beside the ops map. `casedetailsset`, `casedetails` and `casedetailspublic` are
   new; `statementack` and `whatchangedpropose` take their classes, weight and description from their hand rows
   (op-declarations, op-grades, op-capabilities), which these rows agree with. `casedetailspublic` is served by
   public-read's door (R24), so no arm of `caseInputsOps` carries it. `fields.accepts` is every field the arm reads from
   the address and the body, the stamps excepted; `requires` the ones it refuses without. `statementack` is the one
   judgment: a recipient arrives with `secret`, which the control plane hashes and strips, handing the arm its digest as
   the body's `secretSha` and the mark `bySecret=1` (R5), so those two are door-set stamps and the field a caller sends,
   which the screens send, is `secret`. */
export const DECLARED_OPS = Object.freeze({
  casedetailsset: { classes: ["admin","member"], machineClasses: [], mutating: true, weight: "reversible", stamps: ["by","viewer"], needs: "contribute", description: localize("case-inputs.declared.casedetailsset", "case-directed: keyed by a case, reached from the case editor; an owner sets or clears one of its standard details, kept beside the case and never in its signed document"),
    fields: { accepts: ["case","field","value"], requires: ["case","field","value"] } },
  casedetails: { classes: ["admin","member"], machineClasses: [], mutating: false, weight: "read", description: localize("case-inputs.declared.casedetails", "read: a case's standard details and their history, to a member who sees its project; writes nothing"),
    fields: { accepts: ["case"], requires: ["case"] } },
  casedetailspublic: { classes: null, mutating: false, weight: "read", description: localize("case-inputs.declared.casedetailspublic", "read: a published case's standard details as its team currently states them, public, no credential; writes nothing"),
    fields: { accepts: ["case"], requires: ["case"] } },
  statementack: { classes: null, mutating: true, weight: "reasoned", description: localize("case-inputs.declared.statementack", "case-directed: keyed by a case edition; a member acknowledges what the case does not cover"),
    fields: { accepts: ["draft","case","edition","secret","reason"], requires: [["draft","case","secret"],"reason"] } },
  whatchangedpropose: { classes: ["admin","member","probe"], mutating: true, weight: "undetermined", description: localize("case-inputs.declared.whatchangedpropose", "case-directed: keyed by a published case, reached from its next edition; a draft, never a statement until a member adopts it"),
    fields: { accepts: ["case","text"], requires: ["case","text"] } },
});
