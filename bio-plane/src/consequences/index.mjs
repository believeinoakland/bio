/* consequences — what a breach did, and to whom (requirements: `build/requirements/consequences.md`; Bob's ruling K12;
 * Roadmap v5 §5 Operational Principle 6; Functional Architecture v3 Layer 2 Function 4 and Layer 3 Function 5).
 *
 * For one standard's noncompliant outcome of a live determination (`conformance`), a PART records who or what is
 * affected (a class, a fund, a program, a service, a body, or a person a document names, R10, R16), the measure and the
 * period, in one of three states that are never composed (R11): COMPUTED, `calc-grammar`'s exact arithmetic over the
 * figures the cited passages hold, money facts and calculation outputs, graded by the weakest operand (R2, DEC-21);
 * every value is an exact decimal, never a floating-point number (Terms; C:A-11: this module holds no parser);
 * ASSESSED, a member's stated value with a rationale and
 * what it rests on (R3); UNDETERMINED, with why, never read as zero (R4). That the harm follows from the act is a
 * finding: a part names the inquiry that concluded it, or its causation is `unproven`, stated and never refused or
 * graded low (R5, R12; DEC-14's discipline, applied to the government's act); a part whose measure is zero claims no
 * harm, and its causation is `not_applicable` (R5, N257). A part is never edited: a revision is a
 * successor (R6). A member records each part addressed or not, with evidence (R9), which `escalation` reads.
 * Significance is not here (K12): no answer carries a significance, severity, priority or score (R11).
 *
 * T45 (N855 6c; v0.2 §3, rules 1, 16, 17): an `addressed` statement is reasoned, may carry plain words and never a
 * percentage (R9); no new part is recorded on a void determination (R1, conformance R33). This module also holds the
 * SUCCESS RECORD (R17–R21): a member's statement of what changed and when, on evidence, with figures computed as R2
 * computes a part, a sequence that is never a cause, and a cause only on evidence other than the group's own act (the
 * reader `actions` registers, R19). A success record is never a consequence part (R23). An outcome (a success, a harm
 * addressed, a cure) is carried into a case's next edition only through `case-inputs.carryOutcome` (R22; T47, N908).
 *
 * T46 (N911, R24): each success record is a `success_record` record object (`SUC-`, record-grammar R59), promoted through
 * `promotion` with history, audit and export as a part is (R14); one held in this module's rows before T46 is promoted at
 * creation with its id, fields, author and time unchanged. (N913, R25) Seventeen refusal rows and R19's two sentences
 * read `words.json`'s words by key (`./checks.mjs`, `CONSEQUENCES_WORDS`).
 *
 * A new module (layer 9): no `from`, nothing moved. REACHED as `consequencesModule(host, deps)` (K171 (17)): one instance
 * per host (the Durable Object's `ctx`), created on the first call with `deps`, returned to every later caller. At
 * creation it creates its tables and declares them to record-core's purge (R13, K23). Each part is also a `CONS-`
 * record object promoted through `promotion` (R14), so it has history, audit and export like a finding.
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership, promotion   layer 2: `allocId`, `transact`, `declarePurge`, `head`, `readFile`, `bundleInfo`;
 *                                   `sight`, `inSight`, `projectAuthority`; `promote`.
 *   conformance    `determinationRead` (conformance R9; R1 here); default `conformanceOf(host)`. With neither a host nor
 *                  a `conformance`, every determination reads as absent (fail closed). Its module-level
 *                  `noSuchDetermination` and `determinationSuperseded` (its R19, R20) answer those two conditions
 *                  (R1, R7, R9; N309): this module mints neither code.
 *   content        `contentRow` (R2's operands, R9's evidence, R10's passage), `passageNotice` (R8).
 *   passageText    `(contentId) → text | null`, the passage an operand's figure is read from (R2); default
 *                  `content.passageText` (content R46), whose null is "held in a form not read" (R4).
 *   provenance     `captureGrade` (R2, K171 (8)).
 *   inquiry        `supersededBy`, `stateHistory` (R5, R8).
 *   strength       `inquiryStrength` (R5).
 *   money          `readFact` (R2's money operands and their grade; R15's sight), `summable` (R2: a total across
 *                  money facts it refuses is refused by its code); default `moneyOf(host)`.
 *   calculations   `calcStatusOf` and `gradeFactsOf` (its R31, R30; N576): whether a calculation operand is held
 *                  and visible to the author or viewer, and the capture axis of its grade facts (R2, R15); `read` (R2's
 *                  calculation outputs, named by calculation and result key); default `calculationsOf(host)`. Its
 *                  `read` answers a promise, so an act naming a calculation operand the author may see answers one
 *                  too; every other act and every read stays synchronous.
 *   entities       `readEntity` (R10: the person entity, its label and aliases); default `entitiesOf(host)`.
 *   people         `sourceLinkSight(person)` (its R34; N600): the source↔person link's sight, null when no link is
 *                  held (R10, R16); default `peopleOf(host)`.
 *   basisVersions  `conclusionOf` (its R22; R27): whether the project the determination is in has concluded a causation inquiry,
 *                  which leaves the question's own state `open` (its R18); default `basisVersionsOf(host)`.
 *   caseInputs     `carryOutcome` (its R9; R22): the one instance for the host, `caseInputsOf(host)` (its R16), unless
 *                  given (T47, N908: `case-authoring` R71 before). (T45) conformance's
 *                  `determinationVoided`, `curesOf` (its R33, R37; R1, R22); civil-time's `isCalendarDate`, `parseEdtf`
 *                  (R17); membership's `noSuchProject`, `listenerRefusal` (R17, R19).
 *   now            the clock for the instants it writes, an ISO string (default: the wall clock, to the second).
 *
 * READ CONTRACTS it joins in its own SQL: none. Its own tables are `./schema.mjs`. */

import { recordOf, stampInstant, instantOrder, mintExhausted } from "../record-core/index.mjs";
import { membershipOf, noSuchProject, listenerRefusal } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { contentOf } from "../content/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { strengthOf } from "../strength/index.mjs";
import { conformanceOf, noSuchDetermination, determinationSuperseded, determinationVoided } from "../conformance/index.mjs";
import { moneyOf } from "../money/index.mjs";
import { calculationsOf } from "../calculations/index.mjs";
import { entitiesOf } from "../entities/index.mjs";
import { peopleOf } from "../people/index.mjs";
import { caseInputsOf } from "../case-inputs/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { isMachineIdentity, MACHINE_CLASS_PREFIX } from "../record-grammar/actors.mjs";
import { normalizeType } from "../record-grammar/types.mjs";
import { isCalendarDate, parseEdtf } from "../civil-time/index.mjs";
import { BASIS_GRADES } from "../record-grammar/grades.mjs";
import { OPS, RATIO_ROUNDING, exactOf, isZero, order, readFigure, passageHolds, compute, measureOfFigure,
         addMeasures } from "./measures.mjs";
import { CONSEQUENCES_TABLES, migrateConsequences } from "./schema.mjs";
import { CONSEQUENCES_CHECKS, consequencesWords } from "./checks.mjs";
import { word, localize } from "../setup-words/index.mjs";

export { OPS, RATIO_ROUNDING, exactOf } from "./measures.mjs";
export { CONSEQUENCES_SCHEMA, CONSEQUENCES_TABLES } from "./schema.mjs";
export { CONSEQUENCES_CHECKS, CONSEQUENCES_WORDS, consequencesWords } from "./checks.mjs";

/** Terms: who or what is affected (R10: a person only as a document names them). */
export const AFFECTED_KINDS = Object.freeze(["class", "fund", "program", "service", "body", "person", "other"]);
/** R2: what an operand is: a figure in a cited passage, a money fact, or a calculation's output. */
export const OPERAND_KINDS = Object.freeze(["content", "money", "calculation"]);
/** Terms: what a measure counts. */
export const UNITS = Object.freeze(["money", "benefits", "services", "time", "count"]);
/** Terms: the three states of a part, never composed (R11). */
export const PART_STATES = Object.freeze(["computed", "assessed", "undetermined"]);
/** R9: what a member records of a part. */
export const ADDRESSED_STATES = Object.freeze(["addressed", "not_addressed"]);
/** R4: why a part is undetermined (the requirement's three, and a computation the arithmetic cannot carry out). */
export const UNDETERMINED_WHY = Object.freeze({
  not_in_record: word("consequences.not_in_record"),
  form_not_read: word("consequences.form_not_read"),
  not_assessed: word("consequences.not_assessed"),
  not_computable: word("consequences.not_computable"),
});
/* R4: why a computation with no measure stated is undetermined (it names no operand, so R15 keeps it). */
const NO_UNIT = word("consequences.no_unit");
/** R3: the longest rationale an assessment carries. */
export const RATIONALE_MAX = 2000;
/** R6: the longest reason a revision of a part carries (conformance R7's bound). */
export const REASON_MAX = 500;
/** R9 (T45; v0.2 rule 17): the plain words an `addressed` statement may carry, at most `ADDRESSED_WORDS_MAX` distinct. */
export const ADDRESSED_WORDS = Object.freeze(["remedied", "mitigated", "compensated", "acknowledged", "cannot_be_undone"]);
export const ADDRESSED_WORDS_MAX = 5;
/** R9 (T45): the keys that would state redress as a figure, refused wherever they appear in a statement. */
export const REDRESS_FIGURE_KEYS = Object.freeze(["percent", "percentage", "share", "ratio", "score"]);
/** R9, R17, R19, R21 (T45): the longest reason or statement a member writes here. */
export const STATEMENT_MAX = 2000;
/** R17 (T45): a success record's caps. */
export const SUCCESS_LIMITS = Object.freeze({ evidence: 50, figures: 20, sequence: 1000 });
/** R20 (T45): the longest page of success records. */
export const SUCCESS_PAGE_MAX = 200;
/** R22 (T45): what an outcome carried into a case's next edition is (case-inputs R9's kinds, `case-grammar`'s `OUTCOME_KINDS`). */
export const CARRY_KINDS = Object.freeze({ success: "success", addressed: "harm_addressed", cure: "cure" });
/** R19 (T45), R25 (T46): the keys of the sentences a success record's read answers beside its sequence and its absent
 *  cause; their words are `words.json`'s, read by key (`CONSEQUENCES_WORDS`). */
export const SEQUENCE_NOT_CAUSE = "consequences.success.sequence_not_cause";
export const CAUSE_NOT_STATED = "consequences.success.cause_not_stated";

/* A causation inquiry has concluded when its state is one of these (inquiry R1: `published` is read, never entered). */
const CONCLUDED = new Set(["concluded", "published"]);
const INTERNAL = `${MACHINE_CLASS_PREFIX}admin`;

const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const q = (v) => JSON.stringify(v ?? null);
const json = (v) => (v == null ? null : JSON.stringify(v));
const parse = (s) => { if (s == null) return null; try { return JSON.parse(s); } catch { return null; } };
const machine = (who) => !str(who) || isMachineIdentity(str(who));
const second = (iso) => String(iso).replace(/\.\d+Z$/, "Z");
const fold = (t) => String(t).normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
const rand = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
const HEX64 = /^[0-9a-f]{64}$/;
const DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/;

/* R10: an entity's live aliases, as entities' read answers them (`{alias, withdrawn}`). */
const aliasesOf = (ent) => (Array.isArray(ent.aliases) ? ent.aliases : [])
  .filter((a) => isObj(a) ? !a.withdrawn : typeof a === "string").map((a) => (isObj(a) ? a.alias : a));

/* DEC-49: every refusal carries its code, its C-114 row and the member's translation (`./checks.mjs`). */
function refuse(code, detail, extra = {}) {
  const row = CONSEQUENCES_CHECKS[code];
  return { ok: false, reason: code, code, ...(row ? { check: row.check, translation: row.translation } : {}), detail,
           ...extra };
}

/* One code, one site (K231): each refusal minted by more than one act of this module is minted by one helper here,
   and its row's `where` names that helper. `wrote` adds the sentence an act that writes ends its refusal with. */
const NOTHING = " Nothing was written.";

/** R6, R9, R13: no part answers to the id, or the reader may not see it: one answer. */
function noSuchPart(id, wrote = false) {
  return refuse("NO_SUCH_PART", localize("consequences.index.no_consequence_part_answers_to", "no consequence part answers to that id here; one you may not see is answered exactly as one that does not exist.{v1}", { v1: String(wrote ? NOTHING : "") }), { id: id ?? null });
}

/** R6, R9: the part has a successor, which carries the record forward. */
function alreadySuperseded(id, next) {
  return refuse("ALREADY_SUPERSEDED", localize("consequences.index.id_has_been_revised_by", "{id} has been revised by {next}; act on that one.{NOTHING}", { id: String(id), next: String(next), NOTHING: String(NOTHING) }),
                { id, superseded_by: next });
}

/** R6: a revision's reason: null when it is stated and within `REASON_MAX` (an addressed record's is R9's own, T45). */
function reasonRefusal(reason) {
  if (!str(reason)) return refuse("NO_REASON", localize("consequences.index.the_record_says_why", "the record says why.{NOTHING}", { NOTHING: String(NOTHING) }));
  if (reason.trim().length > REASON_MAX)
    return refuse("BAD_REASON", localize("consequences.index.a_reason_is_at_most", "a reason is at most {REASON_MAX} characters.{NOTHING}", { REASON_MAX: String(REASON_MAX), NOTHING: String(NOTHING) }));
  return null;
}

/** R2, R3: a basis this module cannot read as a computation, or an assessment's rests-on that is not a list. */
function basisUnreadable(why, extra = {}) {
  return refuse("BASIS_UNREADABLE", `${why}.${NOTHING}`, extra);
}

/** R2: a refusal R2 answers by its owner's code (calc-grammar's `UNIT_MISMATCH`; money's summation codes): the code
 *  and the owner's words stand, with this act's ending; no row of this module's is attached (DEC-49: the code is
 *  theirs). */
function foreignRefusal(code, why, extra = {}) {
  return { ok: false, reason: code, code, detail: `${String(why ?? "").replace(/\.?\s*$/, "")}.${NOTHING}`, ...extra };
}

/** R9 (T45): the first key, anywhere in a statement, that states redress as a figure (`REDRESS_FIGURE_KEYS`, case
 *  folded); null when none. */
function redressFigureKey(v, depth = 0) {
  if (depth > 8 || v === null || typeof v !== "object") return null;
  for (const [k, x] of Object.entries(v)) {
    if (!Array.isArray(v) && REDRESS_FIGURE_KEYS.includes(String(k).toLowerCase())) return k;
    const inner = redressFigureKey(x, depth + 1);
    if (inner) return inner;
  }
  return null;
}

/* ===================================================================== *
 * THE TERMS, CHECKED (R1's shape refusals, R10). Pure.
 * ===================================================================== */

/** R1, R10: an affected is `{kind, description, role?, person?}`; answers the canonical form or a refusal. Its shape
 *  only: whether a person's entity is a person, and whether the passage names them, is the module's (`#checkPerson`).
 *  A role is an office, `{role, body}`; a `person` belongs to kind `person` alone, `{entity, named_in}` (R10). */
export function checkAffected(a) {
  const o = isObj(a) ? a : {};
  const kind = str(o.kind) ? o.kind.trim().toLowerCase() : null;
  const unknown = (why) => refuse("AFFECTED_UNKNOWN_KIND", localize("consequences.index.kind_one_of", "{why}: kind one of {kinds}, with a description; an office is {role, body}, and a person {entity, named_in}. Nothing was written.", { why: String(why), kinds: String(AFFECTED_KINDS.join(", ")) }), { kind: kind ?? null });
  if (!isObj(a)) return unknown(localize("consequences.index.an_affected_is_kind", "an affected is {kind, description, role?, person?}"));
  if (!kind || !AFFECTED_KINDS.includes(kind)) return unknown(localize("consequences.index.is_not_a_kind_of_affected", "{kind} is not a kind of affected", { kind: `"${String(o.kind ?? "")}"` }));
  if (!str(o.description)) return unknown(localize("consequences.index.an_affected_is_described", "an affected is described"));
  if (o.role != null && (!isObj(o.role) || !str(o.role.role) || !str(o.role.body)))
    return unknown(localize("consequences.index.a_role_is_an_office", "a role is an office, {role, body}: the office and the body it belongs to"));
  if (o.person != null && kind !== "person") return unknown(localize("consequences.index.a_person_is_named_only", 'a person is named only on kind "person", and this is {kind}', { kind: String(kind) }));
  const role = o.role != null ? { role: o.role.role.trim(), body: o.role.body.trim() } : null;
  const out = { kind, description: o.description.trim(), ...(role ? { role } : {}) };
  if (kind === "person") {
    const p = isObj(o.person) ? o.person : {};
    out.person = { entity: str(p.entity), named_in: str(p.named_in) };
  }
  return { ok: true, affected: out };
}

/** R1: a measure is `{unit, currency?, value | range}`, each value an exact decimal read through `calc-grammar`, never
 *  a floating-point number (Terms); answers the canonical form, values as signed decimal strings (value and range both
 *  optional here: which a state needs is R2–R4's), or a refusal. */
export function checkMeasure(m) {
  if (m == null) return { ok: true, measure: null };
  if (!isObj(m) || !str(m.unit) || !UNITS.includes(m.unit.trim()))
    return refuse("MEASURE_UNKNOWN_UNIT", localize("consequences.index.a_measures_unit_is_one", "a measure's unit is one of {UNITS}. Nothing was written.", { UNITS: String(UNITS.join(", ")) }),
                  { unit: isObj(m) ? m.unit ?? null : null });
  const unit = m.unit.trim();
  const bad = (why) => refuse("MEASURE_INVALID", localize("consequences.index.why_nothing_was_written", "{why}. Nothing was written.", { why: String(why) }), { unit });
  if (m.currency != null && m.currency !== "") {
    if (unit !== "money") return bad(`a currency belongs to a measure of money, and this one is of ${unit}`);
    if (!str(m.currency)) return bad("a currency is named by its code, such as USD");
  }
  const hasValue = m.value !== undefined && m.value !== null;
  const hasRange = m.range !== undefined && m.range !== null;
  if (hasValue && hasRange) return bad("a measure carries a value or a range, not both");
  const out = { unit, ...(str(m.currency) ? { currency: m.currency.trim().toUpperCase() } : {}) };
  if (hasValue) {
    const v = exactOf(m.value);
    if (v === null) return bad("the value does not read as an exact decimal, such as 1200.50");
    out.value = v;
  }
  if (hasRange) {
    const [low0, high0] = Array.isArray(m.range) ? m.range : isObj(m.range) ? [m.range.low, m.range.high] : [];
    const low = exactOf(low0); const high = exactOf(high0);
    if (low === null || high === null) return bad("a range's bounds are two exact decimals, {low, high}");
    if (order(low, high) > 0) return bad("the range is reversed: its low bound is above its high bound");
    out.range = { low, high };
  }
  return { ok: true, measure: out };
}

/** A measure as recorded, answered with exact decimal strings: one recorded before T33 held numbers, read now as the
 *  exact decimals of their shortest form (the row is never rewritten, R6, R13). */
export function measureAsHeld(m) {
  if (!isObj(m)) return m ?? null;
  const d = (x) => (typeof x === "number" ? exactOf(x) ?? String(x) : x);
  const out = { ...m };
  if (m.value !== undefined && m.value !== null) out.value = d(m.value);
  if (isObj(m.range)) out.range = { low: d(m.range.low), high: d(m.range.high) };
  return out;
}

/** R1: a period is `{from, to}`, two dates (or instants), `from` not after `to`. */
export function checkPeriod(p) {
  const bad = (why) => refuse("PERIOD_INVALID", localize("consequences.index.why_nothing_was_written_2", "{why}. Nothing was written.", { why: String(why) }));
  if (!isObj(p)) return bad("a period is {from, to}: the dates the consequence ran between");
  const from = str(p.from); const to = str(p.to);
  if (!from || !to || !DATE.test(from) || !DATE.test(to) || Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to)))
    return bad("a period's from and to are dates, YYYY-MM-DD, or instants");
  if (Date.parse(from) > Date.parse(to)) return bad("the period is reversed: it ends before it starts");
  return { ok: true, period: { from, to } };
}

/** R5 (N257): a measure of zero, value 0 or range [0, 0], states that the part did no harm. */
export function isZeroMeasure(m) {
  const h = measureAsHeld(m);
  if (!isObj(h)) return false;
  if (h.value !== undefined && h.value !== null) return isZero(h.value);
  return isObj(h.range) && isZero(h.range.low) && isZero(h.range.high);
}

/* R5 (N257, K283): a zero measure answers causation `not_applicable`: there is no harm whose following from the act
   needs a finding, and R9 does not count it unproven, so a group's judgment of no consequence can be addressed. An
   inquiry named is kept, and read again when a revision gives the part a measure that is not zero. */
function zeroCausation(inquiryId) {
  return { state: "not_applicable", inquiry: str(inquiryId),
           why: word("consequences.why.measure_zero_part") };
}

/* ===================================================================== *
 * THE MODULE
 * ===================================================================== */

export class Consequences {
  #deps;

  constructor({ storage, record, membership, promotion, host = null, conformance = null, content = null,
                provenance = null, inquiry = null, strength = null, money = null, calculations = null, entities = null,
                people = null, caseInputs = null, basisVersions = null, passageText = null, now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, conformance, content, provenance, inquiry, strength, money, calculations, entities, people,
                   caseInputs, basisVersions, passageText };
    this.now = typeof now === "function" ? now : () => stampInstant("second");
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get content() { return this.#deps.content ||= contentOf(this.#deps.host); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host); }
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  get strength() { return this.#deps.strength ||= strengthOf(this.#deps.host); }
  get conformance() { return this.#deps.conformance ||= (this.#deps.host ? conformanceOf(this.#deps.host) : null); }
  get money() { return this.#deps.money ||= (this.#deps.host ? moneyOf(this.#deps.host) : null); }
  get calculations() { return this.#deps.calculations ||= (this.#deps.host ? calculationsOf(this.#deps.host) : null); }
  get entities() { return this.#deps.entities ||= (this.#deps.host ? entitiesOf(this.#deps.host) : null); }
  get people() { return this.#deps.people ||= (this.#deps.host ? peopleOf(this.#deps.host) : null); }
  get basisVersions() { return this.#deps.basisVersions ||= (this.#deps.host ? basisVersionsOf(this.#deps.host) : null); }
  get caseInputs() { return this.#deps.caseInputs ||= (this.#deps.host ? caseInputsOf(this.#deps.host) : null); }

  /* R19 (T45): the one registered reader of the group's own acts (`actions` fills it). */
  #ownActReader = null;

  migrate() { migrateConsequences(this.sql); }

  #rows(qs, ...a) { return [...this.sql.exec(qs, ...a)]; }
  #one(qs, ...a) { for (const r of this.sql.exec(qs, ...a)) return r; return null; }
  #when() { const w = this.now(); return second(typeof w === "string" && w ? w : stampInstant("second")); }

  /* R2: the text of the passage an operand names, or null when it is held in a form this module does not read. */
  #passageText(contentId) {
    try {
      const fn = this.#deps.passageText || (typeof this.content.passageText === "function"
        ? (id) => this.content.passageText(id) : null);
      const t = fn ? fn(contentId) : null;
      return typeof t === "string" ? t : isObj(t) && typeof t.text === "string" ? t.text : null;
    } catch { return null; }
  }

  /* R13 (K171 (10)): whether the viewer sees a project's contents: sight first, FULL only. An internal caller (no
     viewer) is not asked; a part outside any project is seen as its determination is. */
  #seesProject(project, viewer) {
    if (viewer === null || viewer === undefined || !project) return true;
    return this.membership.sight(project, viewer) === "full";
  }

  /* R1: the determination through conformance's read (its R9), as `{id, project, outcome(standard), live,
     supersededBy}`; null when
     absent, invisible, or conformance is not here to answer (fail closed). Read through one adapter so the spelling of
     conformance's answer lives in one place. */
  #determination(id, viewer) {
    const c = this.conformance;
    if (!str(id) || !c || typeof c.determinationRead !== "function") return null;
    let d;
    try { d = c.determinationRead({ id, viewer: viewer ?? INTERNAL }); } catch { return null; }
    if (!isObj(d) || d.ok === false) return null;
    const body = isObj(d.determination) ? { ...d, ...d.determination } : d;
    const outcomes = body.outcomes ?? body.outcome_per_standard ?? body.standards ?? null;
    const outcome = (std) => {
      if (Array.isArray(outcomes)) {
        const o = outcomes.find((x) => isObj(x) && (x.standard === std || x.id === std || (isObj(x.standard) && x.standard.id === std)));
        return o ? o.outcome ?? null : null;
      }
      if (isObj(outcomes)) { const v = outcomes[std]; return isObj(v) ? v.outcome ?? null : v ?? null; }
      return null;
    };
    const sup = body.superseded_by ?? body.supersededBy ?? body.links?.superseded_by ?? null;
    const live = body.live === false ? false : !(Array.isArray(sup) ? sup.length : sup);
    const supersededBy = (Array.isArray(sup) ? sup[0] : isObj(sup) ? sup.id : sup) ?? null;
    /* conformance R33: a void determination is answered with `void: {causes}`, derived on its every read. */
    const voided = isObj(body.void) ? (Array.isArray(body.void.causes) ? body.void.causes : []) : null;
    return { id, project: body.project ?? null, outcome, live, supersededBy: str(supersededBy), voided };
  }

  /* A part's row, or null when absent or in a project the viewer may not see (R13: one answer). */
  #part(id, viewer) {
    if (!str(id)) return null;
    const r = this.#one(`SELECT * FROM consequence_parts WHERE bundle_id=?`, id);
    if (!r || !this.#seesProject(r.project, viewer)) return null;
    return r;
  }

  #successor(id) { return this.#one(`SELECT bundle_id FROM consequence_parts WHERE supersedes=?`, id)?.bundle_id ?? null; }

  /* R5: a named inquiry's causation, as it reads now: established when it is an inquiry the reader may see that has
     concluded and is not superseded; unproven otherwise, with why. */
  #causationNow(inquiryId, viewer, project = null) {
    if (!str(inquiryId))
      return { state: "unproven", inquiry: null,
               why: localize("consequences.index.no_inquiry_is_named_whose", "no inquiry is named whose finding is that the harm follows from the act; sequence alone does not establish it (DEC-14), so the causation is unproven until one concludes") };
    const who = viewer ?? INTERNAL;
    const info = this.record.bundleInfo(inquiryId);
    if (!info || !this.membership.inSight(inquiryId, who) || normalizeType(info.type) !== "inquiry")
      return { state: "unproven", inquiry: inquiryId,
               why: word("consequences.why.inquiry_named_record") };
    const head = this.record.head(inquiryId);
    const st = head ? head.currentState : null;
    const sup = this.#supersededBy(inquiryId);
    if (sup.length)
      return { state: "unproven", inquiry: inquiryId,
               why: word("consequences.why.inquiry_named_superseded") };
    if (!this.#concluded(inquiryId, st, project, who))
      return { state: "unproven", inquiry: inquiryId,
               why: word("consequences.why.inquiry_named_concluded", { state: String(st ?? word("consequences.why.state")) }) };
    return { state: "established", inquiry: inquiryId,
             why: word("consequences.why.inquiry_named_concluded_finding") };
  }

  /* R27: an inquiry is concluded when its own state says so, or when `project` has concluded it (basis-versions R18, R22),
     which leaves the question's state as it was; a project's withdrawal ends it, and a conclusion in another project is none. */
  #concluded(inquiryId, state, project, viewer) {
    if (CONCLUDED.has(state)) return true;
    if (!str(project)) return false;
    try { return !!this.basisVersions?.conclusionOf(project, inquiryId, viewer); } catch { return false; }
  }

  #supersededBy(id) {
    try { const s = this.inquiry.supersededBy(id); return Array.isArray(s) ? s : s ? [s] : []; } catch { return []; }
  }

  /* R9, R3: an evidence or rests-on id resolves to a content row, or a finding (an inquiry), the author may see. */
  #resolvesEvidence(id, who) {
    if (!str(id)) return false;
    if (HEX64.test(id)) {
      const row = this.content.contentRow(id);
      return !!row && this.membership.inSight(row.bundle_id, who);
    }
    const info = this.record.bundleInfo(id);
    return !!info && normalizeType(info.type) === "inquiry" && this.membership.inSight(id, who);
  }

  /* R3, R9: null when every id resolves (`#resolvesEvidence`); else the refusal naming the ids that do not. */
  #evidenceRefusal(ids, who, what) {
    const unknown = ids.filter((x) => !this.#resolvesEvidence(x, who));
    if (!unknown.length) return null;
    return refuse("NO_SUCH_EVIDENCE", localize("consequences.index.what_content_or_findings_this", "{what} content or findings this record holds and you may see.{NOTHING}", { what: String(what), NOTHING: String(NOTHING) }),
                  { unknown: unknown.map((x) => (typeof x === "string" ? x : null)) });
  }

  /* R10: a person named as affected is a registered `person` entity (AFFECTED_NOT_A_PERSON, an absent one alike), and
     `named_in` is content of a held capture the author may see whose passage names them: its text holds the entity's
     label or a live alias, white space and case folded (AFFECTED_PERSON_NOT_NAMED). Null when both hold. */
  #checkPerson(person, who) {
    let e = null;
    try { e = person.entity ? this.entities.readEntity({ entityId: person.entity, viewer: who }) : null; } catch { e = null; }
    const ent = e && e.ok !== false && e.found !== false ? e.entity : null;
    if (!ent || ent.kind !== "person")
      return refuse("AFFECTED_NOT_A_PERSON", localize("consequences.index.v1_a_harmed_person_is", "{v1}: a harmed person is a registered person entity.{NOTHING}", { v1: String(person.entity ? localize("consequences.index.entity_is_not_a_person", "{entity} is not a person this record holds", { entity: String(person.entity) })
        : localize("consequences.index.an_affected_person_names", "an affected person names the person entity")), NOTHING: String(NOTHING) }),
        { entity: person.entity ?? null });
    const notNamed = (why) => refuse("AFFECTED_PERSON_NOT_NAMED", localize("consequences.index.why_a_person_is_recorded", "{why}: a person is recorded as affected only as a document in the record names them.{NOTHING}", { why: String(why), NOTHING: String(NOTHING) }), { entity: person.entity, named_in: person.named_in ?? null });
    if (!person.named_in) return notNamed("no passage naming the person is given (named_in)");
    const row = HEX64.test(person.named_in) ? this.content.contentRow(person.named_in) : null;
    if (!row || !this.membership.inSight(row.bundle_id, who)) return notNamed("named_in is not content of a held capture you may see");
    const text = this.#passageText(person.named_in);
    const names = [ent.label, ...aliasesOf(ent)].filter((x) => str(x)).map(fold);
    if (text === null || !names.some((n) => fold(text).includes(n)))
      return notNamed(`the passage ${text === null ? "is held in a form this module does not read, so it cannot be shown to name"
        : "does not name"} the person (${str(ent.label) ?? person.entity})`);
    return null;
  }

  /* R16 (DEC-78): whether the viewer may be answered the person a part names: the passage naming them is in a capture
     the viewer may see, and, when the record holds the person as a protected source, the link's sight admits the
     viewer. An internal caller (no viewer) is not asked. people's `sourceLinkSight(person)` (its R34, N600) answers the
     link's sight: null when no link is held, so the capture's sight alone decides; else the members every held link
     admits. A person withheld for a link is answered exactly as for a capture the viewer may not see (R16). Without
     people here to answer, whether a link is held is not known, and the person is withheld (fail closed). */
  #seesPerson(person, viewer) {
    if (viewer === null || viewer === undefined) return true;
    if (!isObj(person) || !person.entity) return false;
    const row = person.named_in ? this.content.contentRow(person.named_in) : null;
    if (!row || !this.membership.inSight(row.bundle_id, viewer)) return false;
    const member = /^member:(.+)$/.exec(viewer)?.[1] ?? (viewer === "admin" ? "admin" : null);
    try {
      const sight = this.people.sourceLinkSight(person.entity);
      if (sight === null) return true;
      return Array.isArray(sight) && !!member && sight.includes(member);
    } catch { return false; }
  }

  /* R15: whether the viewer may see a money fact (money's own sight, its R21: an unseen fact reads as absent). */
  #seesFact(id, who) {
    try {
      const f = this.money ? this.money.readFact({ factId: id, viewer: who }) : null;
      return !!f && f.ok !== false && f.found !== false;
    } catch { return false; }
  }

  /* R2, R15 (N576): whether a calculation is held and visible to `who`, through calculations' synchronous
     `calcStatusOf` (its R31; R10: one with an input the viewer may not see is withheld whole). One not visible is
     answered exactly as one not held. An internal caller is not asked. */
  #seesCalculation(id, who) {
    if (who === INTERNAL) return true;
    return this.#calcStatus(id, who).visible;
  }

  #calcStatus(id, who) {
    try {
      const s = this.calculations ? this.calculations.calcStatusOf({ calcId: id, viewer: who }) : null;
      return { held: !!s && s.held === true, visible: !!s && s.held === true && s.visible === true };
    } catch { return { held: false, visible: false }; }
  }

  /* R1, R9: a member acting on a part has joined the determination's project (K171 (11): membership's refusal,
     translated); null when the author has, or the part is in no project. */
  #participantRefusal(project, author, act) {
    if (!project) return null;
    const denied = this.membership.projectAuthority(project, str(author), "joined", act);
    if (!denied) return null;
    return refuse("CONSEQUENCE_NOT_A_PARTICIPANT", localize("consequences.index.acting_on_a_consequence_is", "acting on a consequence is work inside {project}, and {str} has not joined it.{NOTHING}", { project: String(project), str: String(str(author)), NOTHING: String(NOTHING) }), { project });
  }

  /* ===================================================================== *
   * R1–R6: RECORDING A PART
   * ===================================================================== */

  /** R1–R5: record one part against one standard's noncompliant outcome of a live determination. */
  consequenceRecord(args = {}) { return this.#record(args, null); }

  /** R6: a part is never edited; a revision records a successor with R1's refusals, and the earlier part stays
   *  readable with the link. The successor keeps the earlier part's determination and standard. */
  consequenceRevise(args = {}) {
    const { id = null, reason = null, author = null, viewer = null } = args;
    const who = viewer ?? author;
    const old = this.#part(id, who);
    if (!old) return noSuchPart(id, true);
    const next = this.#successor(old.bundle_id);
    if (next) return alreadySuperseded(old.bundle_id, next);
    const bad = reasonRefusal(reason); if (bad) return bad;
    const pick = (k, stored) => (k in args ? args[k] : stored);
    const oldBasis = old.op ? { op: old.op, operands: this.#operands(old.bundle_id).map(operandAsGiven) }
      : old.state === "assessed" ? { rationale: old.rationale, rests_on: parse(old.rests_on) || [] }
      : { why: old.undetermined_code };
    return this.#record({
      determination: old.determination, standard: old.standard,
      affected: pick("affected", parse(old.affected)), measure: pick("measure", measureAsHeld(parse(old.measure))),
      period: pick("period", parse(old.period)), basis: pick("basis", oldBasis),
      causation: pick("causation", old.causation), author, viewer,
    }, { supersedes: old.bundle_id, reason: reason.trim() });
  }

  /* R1–R6. Synchronous, except that a basis naming a calculation operand reads it through `calculations.read`, which
     answers a promise: then the act answers a promise of the same answer. */
  #record({ determination = null, standard = null, affected = null, measure = null, period = null, basis = null,
            causation = null, author = null, viewer = null } = {}, rev) {
    const who = viewer ?? (str(author) || null);
    const byMachine = machine(author);
    /* R1, in order: the determination's two conditions answered through conformance's helpers (its R19, R20). */
    const d = this.#determination(determination, who);
    if (!d || !this.#seesProject(d.project, who)) return noSuchDetermination(determination ?? null);
    if (!d.live) return determinationSuperseded(d.id, d.supersededBy);
    /* R1 (T45; l9a doubt 8): no new part, nor a revision, on a void determination (conformance R33), answered through
       conformance's one site; the parts already recorded stand and are read as before. */
    if (d.voided) return determinationVoided(d.id, d.voided);
    if (!str(standard) || d.outcome(standard) !== "noncompliant")
      return refuse("CONSEQUENCE_NOT_NONCOMPLIANT", localize("consequences.index.id_s_outcome_for_v1", "{id}'s outcome for {v1} is {v2}, not noncompliant: a consequence is what a breach did.{NOTHING}", { id: String(d.id), v1: String(str(standard) ?? "that standard"), v2: String(d.outcome(standard) ?? "not stated"), NOTHING: String(NOTHING) }),
        { determination: d.id, standard: standard ?? null });
    /* A member author has joined the determination's project; a machine's computed part answers no project authority
       (K171 (9)), and a machine may record nothing else (R3, below). K171 (11): membership's refusal, translated. */
    if (!byMachine) { const denied = this.#participantRefusal(d.project, author, "consequenceRecord"); if (denied) return denied; }
    const a = checkAffected(affected); if (!a.ok) return a;
    if (a.affected.kind === "person") { const bad = this.#checkPerson(a.affected.person, who ?? INTERNAL); if (bad) return bad; }
    const m = checkMeasure(measure); if (!m.ok) return m;
    const p = checkPeriod(period); if (!p.ok) return p;

    const b = this.#basis(basis, m.measure, who, byMachine);
    const land = (b2) => (b2.ok ? this.#land({ d, standard, a, p, b: b2, causation, author, byMachine, who, rev }) : b2);
    return b && typeof b.then === "function" ? b.then(land) : land(b);
  }

  /* R1–R6: the part written, once every check has passed. */
  #land({ d, standard, a, p, b, causation, author, byMachine, who, rev }) {
    /* R5: the causation, as it reads when recorded; nothing recomputes it (R8). A zero measure claims no harm, so it
       has no causation to prove (N257). */
    const cause = isZeroMeasure(b.measure) ? zeroCausation(causation) : this.#causationNow(causation, who, d.project);
    const at = this.#when();
    return this.record.transact(() => {
      const id = `${this.record.allocId("CONS", at.slice(0, 4)).id}-${a.affected.kind}`;
      const part = { determination: d.id, standard, project: d.project, affected: a.affected,
        measure: b.measure, period: p.period, state: b.state, causation: cause, author: str(author) ?? "",
        machine: byMachine, at, supersedes: rev ? rev.supersedes : null, reason: rev ? rev.reason : null, ...b.doc };
      const done = this.promotion.promote({ bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${rand(4)}`,
        author: str(author) ?? INTERNAL, files: [{ path: "bundle.md", text: partDoc(id, part) }],
        meta: { object_type: "consequence", title: titleOf(part), current_state: "recorded", created: at, last_updated: at } });
      if (done.ok === false) return done;
      this.sql.exec(`INSERT INTO consequence_parts (bundle_id, determination, standard, project, affected, measure,
          period, state, op, value, grade, grade_why, rationale, rests_on, undetermined_code, undetermined_why,
          causation, causation_state, causation_why, machine, author, at, supersedes, reason)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        id, d.id, standard, d.project, json(a.affected), json(b.measure), json(p.period), b.state, b.op ?? null,
        json(b.value), b.grade ?? null, b.gradeWhy ?? null, b.rationale ?? null, json(b.restsOn), b.undeterminedCode ?? null,
        b.undeterminedWhy ?? null, cause.inquiry, cause.state, cause.why, byMachine ? 1 : 0, str(author) ?? "", at,
        rev ? rev.supersedes : null, rev ? rev.reason : null);
      (b.operands || []).forEach((o, i) => this.sql.exec(`INSERT INTO consequence_operands (part_id, ord, content_id,
          figure, number, capture_sha, grade, route, determined, basis, kind, result_key, exact)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        id, i, o.ref, o.figure ?? null, null, o.capture_sha ?? null, o.grade ?? null, o.route ?? null,
        o.determined ? 1 : 0, o.basis ?? null, o.kind, o.key ?? null, json(o.exact)));
      return { ok: true, id, part: this.#answer(this.#one(`SELECT * FROM consequence_parts WHERE bundle_id=?`, id), who) };
    });
  }

  /* R2–R4: what the basis makes of the part: its state, measure and the fields that state carries, or a refusal (or a
     promise of either, R2's calculation operands). */
  #basis(basis, measure, who, byMachine) {
    const computation = isObj(basis) && ("op" in basis || "operands" in basis);
    if (computation) return this.#computation(basis, measure, who);
    const hasFigure = measure && ("value" in measure || "range" in measure);
    if (byMachine)
      return refuse("MACHINE_CANNOT_ASSESS", localize("consequences.index.a_machine_may_prepare_a", "a machine may prepare a computed part, from the record's own figures, and propose an assessment as text for a member; it never records an assessment or an undetermined judgment. Nothing was written."));
    if (hasFigure) {
      /* R3: a member's assessment. */
      const rationale = isObj(basis) ? str(basis.rationale) : null;
      if (!rationale) return refuse("NO_RATIONALE", localize("consequences.index.an_assessed_value_says_why", "an assessed value says why: a rationale of at most {RATIONALE_MAX} characters. Nothing was written.", { RATIONALE_MAX: String(RATIONALE_MAX) }));
      if (rationale.length > RATIONALE_MAX)
        return refuse("BAD_RATIONALE", localize("consequences.index.a_rationale_is_at_most", "a rationale is at most {RATIONALE_MAX} characters. Nothing was written.", { RATIONALE_MAX: String(RATIONALE_MAX) }));
      const rests = basis.rests_on ?? basis.restsOn ?? [];
      if (!Array.isArray(rests))
        return basisUnreadable(localize("consequences.index.what_an_assessment_rests", "what an assessment rests on is a list of content ids or findings, possibly empty"));
      const unseen = this.#evidenceRefusal(rests, who, "an assessment rests on"); if (unseen) return unseen;
      return { ok: true, state: "assessed", measure, rationale, restsOn: rests.map(String),
               doc: { rationale, rests_on: rests.map(String) } };
    }
    /* R4: no figure stated: undetermined, with why. */
    const code = isObj(basis) && str(basis.why) && UNDETERMINED_WHY[basis.why.trim()] ? basis.why.trim() : "not_assessed";
    return { ok: true, state: "undetermined", measure, undeterminedCode: code, undeterminedWhy: UNDETERMINED_WHY[code],
             doc: { undetermined: code } };
  }

  /* R2, R4: a computation over the record. Each operand is read for its figure and grade (`#readOperand`); the value is
     calc-grammar's exact arithmetic over them. An operand not held, or a figure its passage does not hold, leaves the
     computation lacking it (undetermined); calc-grammar's and money's refusals are the act's. */
  #computation(basis, measure, who, figure = false) {
    const op = str(basis.op);
    if (!op || !OPS.includes(op))
      return basisUnreadable(localize("consequences.index.a_computation_names_its", "a computation names its op, one of {ops}", { ops: String(OPS.join(", ")) }), { op: basis.op ?? null });
    const given = Array.isArray(basis.operands) ? basis.operands.map(operandOf) : null;
    if (!given || given.some((o) => !o))
      return basisUnreadable(localize("consequences.index.a_computation_operands_are", "a computation's operands are a list, each {content, figure} (the content id whose passage holds the figure, and the figure as read), a money fact (its id) or {calculation, key} (a calculation's result, named by its key)"));
    const read = given.map((o, i) => this.#readOperand(o, i, op, who));
    const fault = read.find((r) => r && r.ok === false);
    if (fault) return fault;
    if (read.some((r) => r && typeof r.then === "function"))
      return Promise.all(read).then((all) => {
        const late = all.find((r) => r.ok === false);
        return late || this.#finish(op, all, measure, who, figure);
      });
    return this.#finish(op, read, measure, who, figure);
  }

  /* R2: one operand read: `{ok: true, kind, ref, key?, figure?, exact?, fig?, capture_sha?, grade, route, determined,
     basis, lacking?}`, a refusal (a figure as read that calc-grammar does not read), or for a calculation operand a
     promise of either. */
  #readOperand(o, i, op, who) {
    const base = { ok: true, kind: o.kind, ref: o.ref, ...(o.key ? { key: o.key } : {}),
                   ...(o.kind === "content" ? { figure: o.figure } : {}) };
    const lacking = (code, why) => ({ ...base, grade: null, route: null, determined: false, basis: null,
                                      lacking: { code, why: localize("consequences.index.operand_i_why_2", "operand {i} {why}", { i: String(i), why }) } });
    if (o.kind === "content") {
      const row = this.content.contentRow(o.ref);
      if (!row || !this.membership.inSight(row.bundle_id, who ?? INTERNAL))
        return lacking("not_in_record", word("consequences.lacking.names_content_record"));
      const g = this.provenance.captureGrade(row.capture_sha) || {};
      const out = { ...base, capture_sha: row.capture_sha, grade: g.grade ?? null, route: g.route ?? null,
                    determined: !!g.determined, basis: g.basis ?? null };
      if (op === "count") return out;
      if (o.figure == null || !String(o.figure).trim())
        return { ...out, lacking: { code: "not_in_record", why: word("consequences.why.operand_states_figure", { i: String(i) }) } };
      const f = readFigure(o.figure);
      if (!f.ok) return basisUnreadable(localize("consequences.index.operand_i_why", "operand {i}: {why}", { i: String(i), why: String(f.why) }), { operand: i });
      const text = this.#passageText(o.ref);
      if (text === null)
        return { ...out, lacking: { code: "form_not_read", why: word("consequences.why.operand_passage_held", { i: String(i) }) } };
      if (!passageHolds(text, o.figure))
        return { ...out, lacking: { code: "not_in_record", why: word("consequences.why.operand_passage_hold", { i: String(i), figure: String(o.figure) }) } };
      return { ...out, fig: f.figure, exact: measureOfFigure(f.figure) };
    }
    if (o.kind === "money") {
      let r = null;
      try { r = this.money ? this.money.readFact({ factId: o.ref, viewer: who ?? INTERNAL }) : null; } catch { r = null; }
      const fact = r && r.ok !== false && r.found !== false ? r.fact : null;
      if (!fact) return lacking("not_in_record", word("consequences.lacking.names_money_fact"));
      const grade = isObj(fact.grade) ? fact.grade.reading ?? null : null;
      const out = { ...base, grade, route: "money fact", determined: grade !== null,
                    basis: grade ? word("consequences.basis.reading_grade", { grade: String(grade) }) : word("consequences.basis.reading_grade_stated") };
      if (fact.withdrawn) return { ...out, lacking: { code: "not_in_record", why: word("consequences.why.operand_money_fact", { i: String(i) }) } };
      if (op === "count") return out;
      const fig = factFigure(fact);
      return fig ? { ...out, fig, exact: measureOfFigure(fig) }
        : { ...out, lacking: { code: "form_not_read", why: word("consequences.why.operand_money_fact_holds", { i: String(i) }) } };
    }
    /* A calculation's output, named by its key (N576): whether it is held and visible to the author, and its grade
       (the capture axis of its grade facts), are read synchronously (calculations R31, R30); one not held or not
       visible is an operand not in the record (R4). Only its value waits on `read`. */
    const viewer = who ?? INTERNAL;
    const absent = () => lacking("not_in_record", word("consequences.lacking.names_calculation_record"));
    if (!this.#calcStatus(o.ref, viewer).visible) return absent();
    let g = null;
    try { g = this.calculations.gradeFactsOf({ calcId: o.ref, viewer }); } catch { g = null; }
    if (!isObj(g) || g.found !== true) return absent();
    const cap = isObj(g.capture) ? g.capture : {};
    const out = { ...base, grade: cap.grade ?? null, route: "calculation", determined: !!cap.grade, basis: cap.why ?? null };
    if (op === "count") return out;
    const settle = (r) => {
      const c = r && r.ok !== false && r.found !== false ? r : null;
      if (!c) return absent();
      const fig = resultFigure(c.results, o.key);
      return fig ? { ...out, fig, exact: measureOfFigure(fig) }
        : { ...out, lacking: { code: "not_computable", why: word("consequences.why.operand_calculation_holds", { i: String(i), key: String(o.key) }) } };
    };
    let r;
    try { r = this.calculations.read({ calcId: o.ref, viewer }); } catch { r = null; }
    return r && typeof r.then === "function" ? r.then(settle, () => settle(null)) : settle(r);
  }

  /* R2, R4: the computation finished over its read operands. */
  #finish(op, operands, measure, who, figure = false) {
    const stored = operands.map(({ ok, fig, lacking, ...o }) => o);
    const docOps = stored.map(operandAsGiven);
    const missing = operands.find((o) => o.lacking);
    let lacking = missing ? missing.lacking : null;
    /* R18: a success record's figure states no measure: its unit and currency are the arithmetic's own. */
    if (!lacking && !measure && !figure) lacking = { code: "not_assessed", why: NO_UNIT };
    let result = null;
    if (!lacking) {
      /* R2: a total across money facts money refuses is refused by its code (its R10). */
      const facts = operands.filter((o) => o.kind === "money").map((o) => o.ref);
      if ((op === "sum" || op === "difference") && facts.length > 1 && this.money) {
        let s = null;
        try { s = this.money.summable({ factIds: facts, viewer: who ?? INTERNAL }); } catch { s = null; }
        if (s && s.ok === false) return foreignRefusal(s.code || s.reason, s.detail, { ...(s.facts ? { facts: s.facts } : {}) });
      }
      result = compute(op, operands.map((o) => o.fig));
      if (!result.ok && result.refused) return foreignRefusal(result.refused, localize("consequences.index.calc_grammar_refuses_the_computation", "calc-grammar refuses the computation: {why}", { why: String(result.why) }));
      if (!result.ok && result.code === "operands_extra") return basisUnreadable(result.why);
      if (!result.ok) lacking = { code: result.code === "operand_missing" ? "not_in_record" : "not_computable", why: result.why };
    }
    const unitOnly = measure ? { unit: measure.unit, ...(measure.currency ? { currency: measure.currency } : {}) } : null;
    if (lacking)
      return { ok: true, state: "undetermined", op, measure: unitOnly, operands: stored,
               undeterminedCode: lacking.code, undeterminedWhy: `${UNDETERMINED_WHY[lacking.code]}: ${lacking.why}`,
               doc: { op, operands: docOps, undetermined: lacking.code } };
    /* R2: the result's dimensions are calc-grammar's; they must be the measure's (a currency only on money, the
       measure's currency when it names one; no other unit). */
    const r = measureOfFigure(result.figure);
    const dims = r.unit !== undefined ? `unit ${r.unit}` : r.currency !== undefined ? `currency ${r.currency}` : null;
    if (figure) return { ok: true, state: "computed", op, operands: stored, figure: r, ...this.#weakest(stored),
                         rounding: op === "ratio" ? RATIO_ROUNDING : null };
    if (r.unit !== undefined || (r.currency !== undefined && (measure.unit !== "money"
        || (measure.currency && measure.currency !== r.currency))))
      return foreignRefusal("UNIT_MISMATCH", localize("consequences.index.the_operands_result_is_in", "the operands' result is in {dims}, and the measure is of {unit}{v1}", { dims: String(dims), unit: String(measure.unit), v1: String(measure.currency ? ` in ${measure.currency}` : "") }));
    const value = r.range ? { range: r.range } : { value: r.value };
    const currency = measure.currency ?? r.currency;
    const { grade, gradeWhy } = this.#weakest(stored);
    const exact = { ...value, precision: r.precision, ...(r.approximate ? { approximate: true } : {}),
                    ...(op === "ratio" ? { rounding: RATIO_ROUNDING } : {}) };
    return { ok: true, state: "computed", op, measure: { ...unitOnly, ...(currency ? { currency } : {}), ...value },
             value: exact, grade, gradeWhy, operands: stored, doc: { op, operands: docOps, value: exact, grade } };
  }

  /* DEC-21 (R2, R18): a computation's grade is its weakest operand's grade, named; one undetermined operand leaves it
     undetermined, naming that operand. */
  #weakest(stored) {
    const rank = (g) => BASIS_GRADES.indexOf(g);
    const open = stored.findIndex((o) => !o.grade);
    if (open >= 0)
      return { grade: null, gradeWhy: word("consequences.grade_why", { open: String(open), kind: String(GRADE_OF[stored[open].kind]), route: String(stored[open].basis ?? stored[open].route ?? "no route") }) };
    const w = stored.reduce((acc, o, i) => (rank(o.grade) > rank(stored[acc].grade) ? i : acc), 0);
    const grade = stored[w].grade;
    return { grade, gradeWhy: localize("consequences.index.the_weakest_operand_is_w", "the weakest operand is {w} ({v1} {ref}), whose {v2} is {grade} ({route}); a computation is as strong as its weakest figure (DEC-21)", { w: String(w), v1: String(NAMED[stored[w].kind]), ref: String(stored[w].ref), v2: String(GRADE_OF[stored[w].kind]), grade: String(grade), route: String(stored[w].route) }) };
  }

  #operands(id) {
    return this.#rows(`SELECT * FROM consequence_operands WHERE part_id=? ORDER BY ord`, id);
  }

  #addressedOf(id) {
    return this.#one(`SELECT * FROM consequence_addressed WHERE part_id=? ORDER BY seq DESC LIMIT 1`, id);
  }

  /* ===================================================================== *
   * THE ANSWER FOR ONE PART (R2–R5, R7, R8, R12)
   * ===================================================================== */

  /* R15 (K903 (4), DEC-36): what the part's answer holds is withheld whole where the viewer may not see it, as strength
     R6 withholds a member: an operand whose content lies in a bundle the viewer may not see leaves the operands, a
     causation inquiry the viewer may not see is not named (its state stands, its `inquiry`, `why` and `strength` keys
     go), an id of `rests_on` or of an addressed record's `evidence` the viewer may not see leaves its list, and R8's
     causes about either go with it. No id, title, state, placeholder or count is left in their place: a sentence the
     part recorded that names an operand by its place is renumbered among the operands answered, and one about an
     operand withheld, or one that counts or orders the operands, keeps only its first clause. `out_of_view: true`
     says only that something was withheld; a viewer who may see everything is answered as before, with no such key.
     An id that names nothing is answered as one the viewer may not see (R13's one answer). The computed value and
     grade, and every other fact the part records, stand. */
  #answer(r, viewer) {
    const who = viewer ?? INTERNAL;
    let withheld = false;
    /* R16: a person the part names is answered only to a viewer who may see the passage naming them and whom a
       protected source's link admits; to any other, `{kind: person}` alone. */
    let affected = parse(r.affected);
    if (isObj(affected) && affected.kind === "person" && !this.#seesPerson(affected.person, viewer)) {
      affected = { kind: "person" };
      withheld = true;
    }
    const out = { id: r.bundle_id, determination: r.determination, standard: r.standard, project: r.project,
      affected, measure: measureAsHeld(parse(r.measure)), period: parse(r.period), state: r.state,
      author: r.author || null, at: r.at, supersedes: r.supersedes, reason: r.reason,
      superseded_by: this.#successor(r.bundle_id) };
    /* Each operand's place among the operands answered, by its recorded place; a withheld one has none. */
    const place = new Map();
    if (r.state === "computed" || r.op) {
      const ops = this.#operands(r.bundle_id).flatMap((o) => {
        const kind = o.kind || "content";
        let seen;
        if (kind === "money") seen = this.#seesFact(o.content_id, who);
        else if (kind === "calculation") seen = this.#seesCalculation(o.content_id, who);
        else { const row = this.content.contentRow(o.content_id); seen = !!row && this.membership.inSight(row.bundle_id, who); }
        if (!seen) { withheld = true; return []; }
        place.set(o.ord, place.size);
        const exact = parse(o.exact) || (o.number !== null && o.number !== undefined
          ? { value: exactOf(o.number) ?? String(o.number) } : null);
        return [{ kind, ...operandAsGiven(o), ...(exact ? (exact.range ? { range: exact.range } : { value: exact.value }) : {}),
                  ...(exact && exact.precision ? { precision: exact.precision } : {}),
                  ...(kind === "content" ? { capture: o.capture_sha } : {}),
                  grade: o.grade, route: o.route, determined: !!o.determined }];
      });
      const v = parse(r.value);
      out.computation = { op: r.op, operands: ops,
        ...(isObj(v) && v.precision ? { precision: v.precision } : {}), ...(isObj(v) && v.rounding ? { rounding: v.rounding } : {}),
        says: word("consequences.says.calc_grammar_exact") };
    }
    if (r.state === "computed") {
      out.grade = { grade: r.grade, determined: r.grade !== null, why: gradeWhyFor(r, place) };
      out.label = r.machine
        ? { machine_work: true, says: word("consequences.says.machine_work_computed", { machine: String(r.author || "a machine") }) }
        : { machine_work: false, says: word("consequences.says.computed_operands_shown", { author: String(r.author) }) };
    } else if (r.state === "assessed") {
      const recorded = parse(r.rests_on) || [];
      const rests = recorded.filter((x) => this.#resolvesEvidence(x, who));
      if (rests.length < recorded.length) withheld = true;
      out.assessment = { by: r.author, at: r.at, rationale: r.rationale, rests_on: rests,
        says: rests.length ? word("consequences.says.member_assessment_resting")
          : word("consequences.says.member_assessment_resting_record") };
      out.label = { machine_work: false, says: word("consequences.says.member_assessment_presented") };
    } else {
      out.undetermined = { code: r.undetermined_code, why: undeterminedWhyFor(r, place, withheld),
                           says: word("consequences.says.undetermined_known_read") };
    }
    const causationSeen = !r.causation || this.membership.inSight(r.causation, who);
    if (!causationSeen) {
      withheld = true;
      out.causation = { state: r.causation_state };
    } else {
      out.causation = { state: r.causation_state, inquiry: r.causation, why: r.causation_why };
      if (r.causation_state === "established" && r.causation) {
        let s = null;
        try { s = this.strength.inquiryStrength({ id: r.causation, viewer: who }); } catch { s = null; }
        out.causation.strength = s && s.ok
          ? { capture: s.capture ?? null, connection: s.connection ?? null, testimony: s.testimony ?? null,
              says: localize("consequences.index.per_axis_never_composed", "per axis, never composed (DEC-44)") }
          : { capture: null, connection: null, testimony: null, says: word("consequences.says.inquiry_strength_read") };
        /* strength R6 withheld a member of the pair inside the answer: something of the part's answer was withheld. */
        if (s && s.ok && s.out_of_view === true) withheld = true;
      }
    }
    const a = this.#addressedOf(r.bundle_id);
    if (a) {
      const recorded = parse(a.evidence) || [];
      const evidence = recorded.filter((x) => this.#resolvesEvidence(x, who));
      if (evidence.length < recorded.length) withheld = true;
      const plain = parse(a.words);
      out.addressed = { state: a.state, evidence, reason: a.reason, ...(Array.isArray(plain) ? { words: plain } : {}),
                        by: a.author, at: a.at };
    } else {
      out.addressed = { state: "never_assessed", says: word("consequences.says.member_recorded_consequence") };
    }
    const changed = this.#basisChanged(r, who, place, causationSeen);
    if (changed.length) out.basis_changed = changed;
    if (withheld) out.out_of_view = true;
    return out;
  }

  /* R8: a notice, never a recomputation: an operand passage whose document has a newer capture that does not carry it,
     or a causation inquiry reopened or superseded since the part was recorded. R15: a withheld operand (no `place`)
     or a withheld causation raises no cause, and an operand is named by its place among the operands answered. */
  #basisChanged(r, who, place, causationSeen) {
    const causes = [];
    if (r.op) {
      for (const o of this.#operands(r.bundle_id)) {
        if (!place.has(o.ord) || (o.kind || "content") !== "content") continue;
        let n = null;
        try { n = this.content.passageNotice({ contentId: o.content_id, viewer: who }); } catch { n = null; }
        const at = place.get(o.ord);
        if (n && n.affects === "affected")
          causes.push({ cause: "newer_capture", operand: at, why: word("consequences.why.newer_capture_operand", { at: String(at) }) });
      }
    }
    if (r.causation && causationSeen && r.causation_state !== "not_applicable") {
      const sup = this.#supersededBy(r.causation);
      if (sup.length) causes.push({ cause: "causation_superseded", why: word("consequences.why.causation_inquiry_superseded") });
      else if (r.causation_state === "established") {
        const head = this.record.head(r.causation);
        const own = !!head && CONCLUDED.has(head.currentState);
        let reopened = !!head && !own && !this.#concluded(r.causation, head.currentState, r.project, who);
        if (!reopened && own) {
          let h = null;
          try { h = this.inquiry.stateHistory(r.causation); } catch { h = null; }
          reopened = !!(h && h.ok && h.transitions.some((t) => t.to === "open" && t.at && instantOrder(t.at, r.at) > 0));
        }
        if (reopened) causes.push({ cause: "causation_reopened", why: word("consequences.why.causation_inquiry_reopened") });
      }
    }
    return causes;
  }

  /* ===================================================================== *
   * R6, R7: READS
   * ===================================================================== */

  /** R6, R13: one part, superseded or not, with its links; absent and unseen are one answer. */
  consequenceRead({ id = null, viewer = null } = {}) {
    const r = this.#part(id, viewer);
    if (!r) return noSuchPart(id);
    return { ok: true, part: this.#answer(r, viewer) };
  }

  /* The live parts of a determination (not revised by a successor), optionally of one standard, in id order. */
  #liveParts(determination, standard = null) {
    return this.#rows(`SELECT p.* FROM consequence_parts p WHERE p.determination=? AND (? IS NULL OR p.standard=?)
        AND NOT EXISTS (SELECT 1 FROM consequence_parts s WHERE s.supersedes = p.bundle_id) ORDER BY p.bundle_id`,
      determination, standard, standard);
  }

  /** R7: every live part of the determination, totals only within one state, unit and currency, and the parts that
   *  are undetermined or unproven, in front of the member. */
  consequencesOf({ determination = null, standard = null, viewer = null } = {}) {
    const d = this.#determination(determination, viewer);
    if (!d || !this.#seesProject(d.project, viewer)) return noSuchDetermination(determination ?? null);
    const rows = this.#liveParts(d.id, str(standard)).filter((r) => this.#seesProject(r.project, viewer));
    const parts = rows.map((r) => this.#answer(r, viewer));
    const groups = new Map();
    for (const p of parts) {
      if (p.state === "undetermined" || !p.measure) continue;
      const key = `${p.state}\u0000${p.measure.unit}\u0000${p.measure.currency ?? ""}`;
      if (!groups.has(key)) groups.set(key, { state: p.state, unit: p.measure.unit, currency: p.measure.currency ?? null, items: [] });
      groups.get(key).items.push(p);
    }
    const totals = [...groups.values()].map((g) => ({ state: g.state, unit: g.unit, currency: g.currency,
      ...addMeasures(g.items.map((p) => p.measure)), parts: g.items.map((p) => p.id),
      says: word("consequences.says.parts_added_parts", { state: String(g.state), unit: String(g.unit), currency: String(g.currency ? ` (${g.currency})` : "") }) }));
    return { ok: true, determination: d.id, standard: str(standard), parts, totals,
             undetermined: parts.filter((p) => p.state === "undetermined").map((p) => p.id),
             unproven: parts.filter((p) => p.causation.state === "unproven").map((p) => p.id),
             says: parts.length ? word("consequences.says.part_computed_assessed")
                                : word("escalation.consequence_recorded") };
  }

  /* ===================================================================== *
   * R9: ADDRESSED
   * ===================================================================== */

  /** R9: a member records a part addressed or not, with evidence and a reason. */
  addressedRecord(args = {}) {
    const { id = null, state = null, evidence = null, reason = null, words = undefined, author = null, viewer = null } = args;
    if (machine(author))
      return refuse("MACHINE_CANNOT_ADDRESS", localize("consequences.index.whether_a_consequence_has_been", "whether a consequence has been addressed is a member's judgment, with evidence; a machine never records it. Nothing was written."));
    const who = viewer ?? str(author);
    const r = this.#part(id, who);
    if (!r) return noSuchPart(id, true);
    const next = this.#successor(r.bundle_id);
    if (next) return alreadySuperseded(r.bundle_id, next);
    const denied = this.#participantRefusal(r.project, author, "addressedRecord"); if (denied) return denied;
    if (!ADDRESSED_STATES.includes(state))
      return refuse("ADDRESSED_UNKNOWN_STATE", localize("consequences.index.a_part_is_recorded_addressed", "a part is recorded {ADDRESSED_STATES}. Nothing was written.", { ADDRESSED_STATES: String(ADDRESSED_STATES.join(" or ")) }),
                    { state: state ?? null });
    /* R9 (T45): the reason is required for both states, at most 2,000 characters. */
    if (!str(reason))
      return refuse("ADDRESSED_NO_REASON", localize("consequences.index.whether_a_part_is_addressed", "whether a part is addressed or not is said with a reason.{NOTHING}", { NOTHING: String(NOTHING) }));
    if ([...reason.trim()].length > STATEMENT_MAX)
      return refuse("ADDRESSED_BAD_REASON", localize("consequences.index.a_reason_is_at_most_2", "a reason is at most {STATEMENT_MAX} characters.{NOTHING}", { STATEMENT_MAX: String(STATEMENT_MAX), NOTHING: String(NOTHING) }));
    /* R9 (T45; v0.2 rule 17): no percentage, share, ratio or score of redress, anywhere in the statement. */
    const figureKey = redressFigureKey(args);
    if (figureKey || (Array.isArray(words) && words.some((x) => typeof x === "string" && x.includes("%"))))
      return refuse("ADDRESSED_NO_PERCENTAGE", localize("consequences.index.v1_redress_as_a_figure", "{v1} redress as a figure; say it in words, with evidence.{NOTHING}", { v1: String(figureKey ? `"${figureKey}" states` : "a % in words states"), NOTHING: String(NOTHING) }), figureKey ? { key: figureKey } : {});
    /* R9 (T45): the plain words, at most five distinct of the list, on `addressed` alone. */
    let plain = null;
    if (words !== undefined && words !== null) {
      const list = Array.isArray(words) ? words : null;
      const why = state !== "addressed" ? word("consequences.text.plain_words_carried")
        : !list ? word("consequences.text.words_list")
        : list.some((x) => !ADDRESSED_WORDS.includes(x)) ? word("consequences.text.word", { addressed_words: String(ADDRESSED_WORDS.join(", ")) })
        : new Set(list).size !== list.length ? word("consequences.text.word_given_once")
        : list.length > ADDRESSED_WORDS_MAX ? word("consequences.text.words", { addressed_words_max: String(ADDRESSED_WORDS_MAX) }) : null;
      if (why) return refuse("ADDRESSED_WORD_REFUSED", `${why}.${NOTHING}`);
      plain = [...list];
    }
    const ev = evidence == null ? [] : Array.isArray(evidence) ? evidence : [evidence];
    if (state === "addressed" && !ev.length)
      return refuse("ADDRESSED_NO_EVIDENCE", localize("consequences.index.a_consequence_is_recorded_addressed", "a consequence is recorded addressed with the evidence that it was: content or findings in the record. Partial redress does not end an escalation. Nothing was written."));
    const unseen = this.#evidenceRefusal(ev, who, "evidence is"); if (unseen) return unseen;
    const at = this.#when();
    this.record.transact(() => this.sql.exec(`INSERT INTO consequence_addressed (part_id, state, evidence, reason, author, at,
      words) VALUES (?,?,?,?,?,?,?)`, r.bundle_id, state, JSON.stringify(ev.map(String)), reason.trim(), str(author), at,
      json(plain)));
    return { ok: true, id: r.bundle_id, state, evidence: ev.map(String), reason: reason.trim(), ...(plain ? { words: plain } : {}),
             by: str(author), at };
  }

  /** R9: per part, and overall: `addressed` only when every live part is addressed; any undetermined part or unproven
   *  causation makes it `undetermined` (what is not known cannot be addressed); otherwise any part not addressed, or
   *  never assessed, makes it `not_addressed`. No live part is `undetermined`, "no consequence recorded" (K172). Read
   *  for a superseded determination too (escalation R14). */
  addressed({ determination = null, viewer = null } = {}) {
    const d = this.#determination(determination, viewer);
    if (!d || !this.#seesProject(d.project, viewer)) return noSuchDetermination(determination ?? null);
    const parts = this.#liveParts(d.id).filter((r) => this.#seesProject(r.project, viewer)).map((r) => {
      const a = this.#addressedOf(r.bundle_id);
      return { id: r.bundle_id, standard: r.standard, part_state: r.state, causation: r.causation_state,
               addressed: a ? a.state : "never_assessed" };
    });
    if (!parts.length)
      return { ok: true, determination: d.id, state: "undetermined", parts, why: word("escalation.consequence_recorded") };
    const open = parts.filter((p) => p.part_state === "undetermined" || p.causation === "unproven");
    if (open.length)
      return { ok: true, determination: d.id, state: "undetermined", parts,
               why: word("consequences.why.undetermined_unproven_consequences", { id: String(open.map((p) => p.id).join(", ")), are: String(open.length === 1 ? "is" : "are") }) };
    const not = parts.filter((p) => p.addressed !== "addressed");
    if (not.length)
      return { ok: true, determination: d.id, state: "not_addressed", parts,
               why: word("consequences.why.addressed_assessed_partial", { id: String(not.map((p) => p.id).join(", ")), are: String(not.length === 1 ? "is" : "are") }) };
    return { ok: true, determination: d.id, state: "addressed", parts, why: word("consequences.why.live_part_recorded") };
  }

  /* ===================================================================== *
   * R17–R21, R23 (T45): THE SUCCESS RECORD. Per matter, a member's statement of what changed and when, on evidence,
   * optionally with figures computed exactly as R2 computes a part (R18); it may state the sequence of events, and says
   * the group's action caused the change only on evidence other than the group's own act (R19). Never a consequence
   * part (R23): no read of parts reads, lists or counts one. Its own append-only rows (`success_records`), fenced by
   * its project as a part is (R13), declared to purge, which every read answers from. Since T46 (R24) each is also a
   * `SUC-` record object of type `success_record`, promoted through `promotion` in the act that records it, with history,
   * audit and export as a part has (R14); one recorded in the rows before T46 is promoted at the module's creation.
   * ===================================================================== */

  /** R19: `actions` registers, once, the reader of the group's own acts: `fn({ids, viewer})` answers the ids that are an
   *  action of this group or the capture of one of its `sent` entries. A second registration, or a malformed one, is
   *  membership's refusal (`listenerRefusal`, K31's pattern). */
  registerOwnActReader(fn, module = "actions") {
    const refused = listenerRefusal(this.#ownActReader ? { module: this.#ownActReader.module } : null, module, fn);
    if (refused) return refused;
    this.#ownActReader = { module, fn };
    return { ok: true, module };
  }

  /** R17: record a success record. Synchronous, except that a figure naming a calculation operand answers a promise of
   *  the same answer (R2's rule). */
  successRecord(args = {}) { return this.#success(args, null); }

  /** R21: a success record is never edited: a revision records a successor with R17's refusals and a reason; the
   *  earlier one stays readable with the link. Each field not given is carried from the earlier record. */
  successRevise(args = {}) {
    const { id = null, reason = null, author = null, viewer = null } = args;
    const who = viewer ?? (str(author) || null);
    const machineRefused = this.#successRefusal("machine", { author });
    if (machineRefused) return machineRefused;
    const old = this.#successRow(id, who);
    if (!old) return noSuchSuccessRecord(id, true);
    const next = this.#successSuccessor(old.id);
    if (next) return successSuperseded(old.id, next);
    if (!str(reason))
      return refuse("SUCCESS_NO_REASON", localize("consequences.index.a_revision_of_a_success", "a revision of a success record says why.{NOTHING}", { NOTHING: String(NOTHING) }));
    if ([...reason.trim()].length > STATEMENT_MAX)
      return refuse("SUCCESS_BAD_REASON", localize("consequences.index.a_reason_is_at_most_3", "a reason is at most {STATEMENT_MAX} characters.{NOTHING}", { STATEMENT_MAX: String(STATEMENT_MAX), NOTHING: String(NOTHING) }));
    const pick = (k, stored) => (k in args ? args[k] : stored);
    const figures = (parse(old.figures) || []).map((f) => ({ label: f.label, basis: f.basis }));
    return this.#success({
      project: old.project, matter: pick("matter", parse(old.matter)), statement: pick("statement", old.statement),
      changed_on: pick("changed_on", old.changed_on), evidence: pick("evidence", parse(old.evidence)),
      figures: pick("figures", figures), sequence: pick("sequence", old.sequence), cause: pick("cause", parse(old.cause)),
      author, viewer,
    }, { supersedes: old.id, reason: reason.trim() });
  }

  /** R18: a figure computed for a member to adopt: `{ok: true, figure}`, labelled machine work when a machine computed
   *  it, or R2's refusal. Writes nothing; a machine may call it, and never records the success record (R17). */
  successFigure({ label = null, basis = null, author = null, viewer = null } = {}) {
    const who = viewer ?? (str(author) || null);
    const f = this.#successFigures([{ label, basis }], who, machine(author));
    const done = (r) => (r.ok === false ? r : { ok: true, figure: r.figures[0] });
    return f && typeof f.then === "function" ? f.then(done) : done(f);
  }

  /* R17's refusals in order; R18's and R19's in their places. */
  #success({ project = null, matter = null, statement = null, changed_on = null, evidence = null, figures = null,
             sequence = null, cause = null, author = null, viewer = null } = {}, rev) {
    const who = viewer ?? (str(author) || null);
    const early = this.#successRefusal("machine", { author })
      || this.#successRefusal("project", { project, who })
      || this.#successRefusal("participant", { project, author })
      || this.#successRefusal("statement", { statement, sequence })
      || this.#successRefusal("date", { changed_on })
      || this.#successRefusal("evidence", { evidence, who });
    if (early) return early;
    const figs = figures == null ? [] : figures;
    const computed = this.#successFigures(figs, who, false);
    const then = (fr) => {
      if (fr.ok === false) return fr;
      const c = this.#causeRefusal(cause, who);
      if (c && c.ok === false) return c;
      const large = this.#successRefusal("size", { evidence, figures: figs, sequence });
      if (large) return large;
      return this.#successLand({ project: project.trim(), matter, statement: statement.trim(), changed_on: changed_on.trim(),
        evidence: evidence.map(String), figures: fr.figures, sequence: str(sequence), cause: c ? c.cause : null,
        author: str(author), who, rev });
    };
    return computed && typeof computed.then === "function" ? computed.then(then) : then(computed);
  }

  /* R17: one refusal of a success record's own conditions, or null. Every code of R17's is minted here (K231). */
  #successRefusal(which, a) {
    if (which === "machine")
      return machine(a.author) ? refuse("MACHINE_CANNOT_RECORD_SUCCESS", localize("consequences.index.a_success_record_is_a", "a success record is a member's statement; a machine may compute a figure for a member to adopt, and never records one.{NOTHING}", { NOTHING: String(NOTHING) })) : null;
    if (which === "project")
      return !str(a.project) || !this.#seesProject(a.project.trim(), a.who ?? INTERNAL) || !this.#projectHeld(a.project.trim())
        ? noSuchProject(str(a.project)) : null;
    if (which === "participant") {
      const denied = this.membership.projectAuthority(a.project.trim(), str(a.author), "joined", "successRecord");
      return denied ? refuse("SUCCESS_NOT_A_PARTICIPANT", localize("consequences.index.recording_a_success_is_work", "recording a success is work inside {project}, and {str} has not joined it.{NOTHING}", { project: String(a.project.trim()), str: String(str(a.author)), NOTHING: String(NOTHING) }), { project: a.project.trim() }) : null;
    }
    if (which === "statement") {
      if (!str(a.statement) || [...a.statement.trim()].length > STATEMENT_MAX)
        return refuse("SUCCESS_NO_STATEMENT", localize("consequences.index.what_changed_is_stated_in", "what changed is stated in the member's words, 1 to {STATEMENT_MAX} characters.{NOTHING}", { STATEMENT_MAX: String(STATEMENT_MAX), NOTHING: String(NOTHING) }));
      if (a.sequence != null && typeof a.sequence !== "string")
        return refuse("SUCCESS_NO_STATEMENT", localize("consequences.index.the_sequence_of_events_is", "the sequence of events is the member's text.{NOTHING}", { NOTHING: String(NOTHING) }), { part: "sequence" });
      return null;
    }
    if (which === "date")
      return isSuccessDate(a.changed_on) ? null : refuse("SUCCESS_BAD_DATE", localize("consequences.index.when_the_change_took_place", "when the change took place is a real calendar date, YYYY-MM-DD, or an EDTF band of dates.{NOTHING}", { NOTHING: String(NOTHING) }), { changed_on: a.changed_on ?? null });
    if (which === "evidence") {
      const ev = a.evidence;
      const unseen = Array.isArray(ev) ? ev.filter((x) => !this.#resolvesEvidence(x, a.who ?? INTERNAL)) : null;
      return !Array.isArray(ev) || !ev.length || unseen.length ? refuse("SUCCESS_NO_EVIDENCE", localize("consequences.index.a_success_rests_on_evidence", "a success rests on evidence: content or findings this record holds and you may see.{NOTHING}", { NOTHING: String(NOTHING) })) : null;
    }
    /* size: the caps, named. */
    const over = a.evidence.length > SUCCESS_LIMITS.evidence ? ["evidence", SUCCESS_LIMITS.evidence]
      : a.figures.length > SUCCESS_LIMITS.figures ? ["figures", SUCCESS_LIMITS.figures]
      : typeof a.sequence === "string" && [...a.sequence.trim()].length > SUCCESS_LIMITS.sequence ? ["sequence", SUCCESS_LIMITS.sequence]
      : null;
    return over ? refuse("SUCCESS_TOO_LARGE", localize("consequences.index.v1_is_over_its_cap", "{v1} is over its cap of {v2}.{NOTHING}", { v1: String(over[0]), v2: String(over[1]), NOTHING: String(NOTHING) }),
                         { part: over[0], cap: over[1] }) : null;
  }

  /* R17: whether a project is held (membership answers sight for a held one only). */
  #projectHeld(project) {
    const info = this.record.bundleInfo(project);
    return !!info && normalizeType(info.type) === "project";
  }

  /* R18: each figure `{label, basis: {op, operands}}` computed exactly as R2 computes a part (`#computation`, figure
     mode: no measure, its unit and currency the arithmetic's), with its operands shown and the weakest grade named. A
     stated `value` or `range` is SUCCESS_FIGURE_NOT_COMPUTED; R2's refusals are the act's. `{figures}`, a refusal, or a
     promise of either (a calculation operand). */
  #successFigures(figures, who, byMachine) {
    if (!Array.isArray(figures))
      return basisUnreadable(localize("consequences.index.a_success_records_figures", "a success record's figures are a list, each {label, basis: {op, operands}}"));
    for (const [i, f] of figures.entries()) {
      if (!isObj(f) || !str(f.label) || f.label.trim().length > 200)
        return basisUnreadable(localize("consequences.index.figure_i_is_label", "figure {i} is {label, basis: {op, operands}}, its label words of at most 200 characters", { i: String(i) }),
                               { figure: i });
      const stated = ["value", "range"].some((k) => k in f || (isObj(f.basis) && k in f.basis));
      if (stated || !isObj(f.basis) || !("op" in f.basis || "operands" in f.basis))
        return refuse("SUCCESS_FIGURE_NOT_COMPUTED", localize("consequences.index.figure_i_is_computed_from", "figure {i} ({label}) is computed from cited sources, never stated: give its computation {op, operands}.{NOTHING}", { i: String(i), label: String(str(f.label) ?? "unlabelled"), NOTHING: String(NOTHING) }), { figure: i });
    }
    const all = figures.map((f) => this.#computation(f.basis, null, who, true));
    const shape = (rs) => {
      const bad = rs.find((r) => r.ok === false);
      if (bad) return bad;
      return { ok: true, figures: rs.map((r, i) => figureAnswer(figures[i], r, byMachine)) };
    };
    return all.some((r) => r && typeof r.then === "function") ? Promise.all(all).then(shape) : shape(all);
  }

  /* R19: the cause, checked: null without one; `{ok: true, cause}`; or its refusal. The own-act reader decides
     SUCCESS_CAUSE_OWN_ACT_ONLY; with none, or one that throws or answers no list, the cause is unchecked and refused. */
  #causeRefusal(cause, who) {
    if (cause === null || cause === undefined) return null;
    const c = isObj(cause) ? cause : {};
    if (!str(c.statement) || [...c.statement.trim()].length > STATEMENT_MAX)
      return refuse("SUCCESS_CAUSE_UNSTATED", localize("consequences.index.that_the_teams_action_caused", "that the team's action caused the change is stated in the member's words, 1 to {STATEMENT_MAX} characters.{NOTHING}", { STATEMENT_MAX: String(STATEMENT_MAX), NOTHING: String(NOTHING) }));
    const ev = c.evidence;
    if (!Array.isArray(ev) || !ev.length || ev.length > SUCCESS_LIMITS.evidence
        || ev.some((x) => !this.#resolvesEvidence(x, who ?? INTERNAL)))
      return refuse("SUCCESS_CAUSE_NOT_EVIDENCED", localize("consequences.index.a_cause_rests_on_1", "a cause rests on 1 to {evidence} items of evidence this record holds and you may see.{NOTHING}", { evidence: String(SUCCESS_LIMITS.evidence), NOTHING: String(NOTHING) }));
    const ids = ev.map(String);
    let own = null;
    try { own = this.#ownActReader ? this.#ownActReader.fn({ ids: [...ids], viewer: who ?? INTERNAL }) : null; } catch { own = null; }
    if (!Array.isArray(own))
      return refuse("SUCCESS_CAUSE_UNCHECKABLE", localize("consequences.index.whether_the_causes_evidence_is", "whether the cause's evidence is only the team's own acts could not be read, so the cause is not accepted; the sequence of events may be stated instead.{NOTHING}", { NOTHING: String(NOTHING) }));
    const mine = new Set(own.map(String));
    if (ids.every((x) => mine.has(x)))
      return refuse("SUCCESS_CAUSE_OWN_ACT_ONLY", localize("consequences.index.every_item_of_the_causes", "every item of the cause's evidence is the team's own act, which is never evidence that it caused the change; the sequence of events may be stated instead.{NOTHING}", { NOTHING: String(NOTHING) }));
    return { ok: true, cause: { statement: c.statement.trim(), evidence: ids } };
  }

  /* R17, R24: the record written, once every check has passed: its row, and its `SUC-` record object promoted in the
     same transaction, so a promotion refused writes nothing. Its id is minted in `ID_TABLE`'s form for `SUC`
     (sequential, record-grammar R59), stepping past any id a record of T45's own minting already holds. */
  #successLand({ project, matter, statement, changed_on, evidence, figures, sequence, cause, author, who, rev }) {
    this.#promoteHeld();
    const at = this.#when();
    return this.record.transact(() => {
      const id = this.#mintSuccessId(at.slice(0, 4));
      if (!id) return mintExhausted(SUCCESS_PREFIX);
      const row = { id, project, matter: json(matter), statement, changed_on, evidence: JSON.stringify(evidence),
        figures: JSON.stringify(figures), sequence, cause: json(cause), author, at, supersedes: rev ? rev.supersedes : null,
        reason: rev ? rev.reason : null };
      const done = this.#promoteSuccess(row);
      if (done.ok === false) return done;
      this.sql.exec(`INSERT INTO success_records (id, project, matter, statement, changed_on, evidence, figures, sequence,
          cause, author, at, supersedes, reason) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        row.id, row.project, row.matter, row.statement, row.changed_on, row.evidence, row.figures, row.sequence, row.cause,
        row.author, row.at, row.supersedes, row.reason);
      return { ok: true, id, success: this.#successAnswer(this.#one(`SELECT * FROM success_records WHERE id=?`, id), who) };
    });
  }

  /* R24: the next `SUC-<year>-NNNN` from record-core's counter that no success record, and no record object, holds (a T45
     id was four random digits); null after 64 held in a row. Inside the caller's transaction. */
  #mintSuccessId(year) {
    for (let i = 0; i < 64; i++) {
      const got = this.record.allocId(SUCCESS_PREFIX, year);
      const id = got && got.id;
      if (!id) return null;
      if (!this.#one(`SELECT 1 AS x FROM success_records WHERE id=?`, id) && !this.record.bundleInfo(id)) return id;
    }
    return null;
  }

  /* R24: a success record's row promoted as its `success_record` object: created at the row's time, by its author, in
     its project (so membership fences the object as the reads are fenced, R13), state `recorded`. */
  #promoteSuccess(row) {
    return this.promotion.promote({ bundleId: row.id, base: null, snapKey: `${second(row.at).replace(/[-:]/g, "")}_${rand(4)}`,
      author: str(row.author) ?? INTERNAL, files: [{ path: "bundle.md", text: successDoc(row) }],
      meta: { object_type: SUCCESS_TYPE, title: successTitle(row), current_state: "recorded", created: row.at,
              last_updated: row.at } });
  }

  /* R24 (N911): every success record held in this module's rows with no record object (recorded before T46) promoted,
     in id order, with its id, fields, author and time unchanged (its successor's `supersedes` names it, as before). One
     the record refuses (no producing group set yet, say) is left in its rows, read as before, and
     tried again at the next success record written or the module's next creation. Never throws. */
  #heldPending = true;
  #promoteHeld() {
    if (!this.#heldPending) return { ok: true, promoted: [] };
    const promoted = [], left = [];
    let rows = [];
    try { rows = this.#rows(`SELECT * FROM success_records ORDER BY id`); } catch { return { ok: false, promoted, left }; }
    for (const r of rows) {
      if (this.record.bundleInfo(r.id)) continue;
      let done;
      try { done = this.record.transact(() => this.#promoteSuccess(r)); } catch (e) { done = { ok: false }; }
      (done && done.ok !== false ? promoted : left).push(r.id);
    }
    this.#heldPending = left.length > 0;
    return { ok: !left.length, promoted, left };
  }

  /** R24: promote the success records held before T46 (`#promoteHeld`); the module's creation calls it. Answers
   *  `{ok, promoted, left}`, the ids promoted now and those the record refused. */
  promoteHeldSuccessRecords() { this.#heldPending = true; return this.#promoteHeld(); }

  /* A success record's row, or null when absent or in a project the viewer may not see (R13's one answer). */
  #successRow(id, viewer) {
    if (!str(id)) return null;
    const r = this.#one(`SELECT * FROM success_records WHERE id=?`, id.trim());
    return r && this.#seesProject(r.project, viewer) ? r : null;
  }

  #successSuccessor(id) { return this.#one(`SELECT id FROM success_records WHERE supersedes=?`, id)?.id ?? null; }

  /* R20, R15: a success record as the viewer may see it: evidence, a figure's operands and the cause's evidence the
     viewer may not see leave their lists, `out_of_view: true` saying only that something was withheld. */
  #successAnswer(r, viewer) {
    const who = viewer ?? INTERNAL;
    let withheld = false;
    const seen = (ids) => { const out = ids.filter((x) => this.#resolvesEvidence(x, who)); if (out.length < ids.length) withheld = true; return out; };
    const figures = (parse(r.figures) || []).map((f) => {
      const place = new Map();
      const operands = (f.operands || []).filter((o, i) => {
        const ok = this.#seesOperand(o.kind, o[o.kind], who);
        if (ok) place.set(i, place.size); else withheld = true;
        return ok;
      });
      const g = f.grade ? { ...f.grade, why: figureGradeWhy(f.grade, place) } : f.grade;
      const u = f.undetermined ? { ...f.undetermined, why: place.size < (f.operands || []).length
        ? UNDETERMINED_WHY[f.undetermined.code] ?? f.undetermined.why : f.undetermined.why } : undefined;
      const basis = f.basis ? { ...f.basis, operands: (f.basis.operands || []).filter((o, i) => place.has(i)) } : f.basis;
      return { ...f, basis, operands, ...(g ? { grade: g } : {}), ...(u ? { undetermined: u } : {}) };
    });
    const cause = parse(r.cause);
    const next = this.#successSuccessor(r.id);
    const out = { id: r.id, project: r.project, matter: parse(r.matter), statement: r.statement, changed_on: r.changed_on,
      evidence: seen(parse(r.evidence) || []), figures,
      sequence: r.sequence ? { text: r.sequence, key: SEQUENCE_NOT_CAUSE, says: consequencesWords(SEQUENCE_NOT_CAUSE) } : null,
      cause: cause ? { statement: cause.statement, evidence: seen(cause.evidence || []) } : null,
      ...(cause ? {} : { cause_key: CAUSE_NOT_STATED, cause_says: consequencesWords(CAUSE_NOT_STATED) }),
      author: r.author, at: r.at, supersedes: r.supersedes, reason: r.reason, superseded_by: next, live: !next,
      carries: this.#carriesOf(r.id) };
    if (withheld) out.out_of_view = true;
    return out;
  }

  /* R15's sight of one operand, by its kind (R2's three). */
  #seesOperand(kind, ref, who) {
    if (kind === "money") return this.#seesFact(ref, who);
    if (kind === "calculation") return this.#seesCalculation(ref, who);
    const row = this.content.contentRow(ref);
    return !!row && this.membership.inSight(row.bundle_id, who);
  }

  #carriesOf(recordId, ref = null) {
    return this.#rows(`SELECT * FROM consequence_carries WHERE record_id=? AND (? IS NULL OR ref=?) ORDER BY seq`,
                      recordId, ref, ref)
      .map((c) => ({ carried: c.outcome, kind: c.kind, case: c.case_id, by: c.by, at: c.at }));
  }

  /** R20: one success record, superseded or not, with its links and carries; absent and unseen are one answer. */
  successRecordRead({ id = null, viewer = null } = {}) {
    const r = this.#successRow(id, viewer);
    if (!r) return noSuchSuccessRecord(id);
    return { ok: true, success: this.#successAnswer(r, viewer) };
  }

  /** R20: the live success records the viewer may see, of one project or matter if named, at most 200 per page in id
   *  order after `after`, `truncated` when more follow. A project the viewer may not see is membership's one answer. */
  successRecordsFor({ project = null, matter = null, after = null, limit = null, viewer = null } = {}) {
    if (str(project) && (!this.#seesProject(project.trim(), viewer) || !this.#projectHeld(project.trim())))
      return noSuchProject(project.trim());
    const n = Number.isInteger(limit) && limit > 0 ? Math.min(limit, SUCCESS_PAGE_MAX) : SUCCESS_PAGE_MAX;
    const key = matter == null ? null : canonical(matter);
    const rows = this.#rows(`SELECT r.* FROM success_records r WHERE (? IS NULL OR r.project=?) AND (? IS NULL OR r.id > ?)
        AND NOT EXISTS (SELECT 1 FROM success_records s WHERE s.supersedes = r.id) ORDER BY r.id`,
      str(project), str(project), str(after), str(after))
      .filter((r) => this.#seesProject(r.project, viewer) && (key === null || canonical(parse(r.matter)) === key));
    const page = rows.slice(0, n);
    return { ok: true, records: page.map((r) => this.#successAnswer(r, viewer)), truncated: rows.length > n,
             ...(rows.length > n ? { next: page[page.length - 1].id } : {}) };
  }

  /* ===================================================================== *
   * R22 (T45): CARRYING AN OUTCOME INTO THE CASE'S NEXT EDITION, only through case-inputs' `carryOutcome` (its R9; T47, N908),
   * reached on the one case-inputs instance for the host (`caseInputsOf`); its refusals and answer pass through unchanged.
   * Only text and cites pass: figures, sequence and cause stay here, unpublished, so a carried outcome states no cause.
   * ===================================================================== */

  /** R22: `{carry, case, text?, author, viewer}`, `carry` one of `{success: id}`, `{addressed: part}` or
   *  `{cure: {determination, standard}}` (the job's reading, J1). Answers carryOutcome's answer. */
  outcomeCarry({ carry = null, case: caseId = null, text = null, author = null, viewer = null } = {}) {
    if (machine(author))
      return refuse("MACHINE_CANNOT_CARRY", localize("consequences.index.carrying_an_outcome_into_a", "carrying an outcome into a case's next edition is a member's act.{NOTHING}", { NOTHING: String(NOTHING) }));
    const who = viewer ?? str(author);
    const c = isObj(carry) ? carry : {};
    const which = ["success", "addressed", "cure"].filter((k) => c[k] !== undefined && c[k] !== null);
    let out;
    if (which.length !== 1) return noSuchSuccessRecord(null, true, localize("consequences.index.a_carry_names_one", "a carry names one of {success}, {addressed} or {cure}", { success: "success", addressed: "addressed", cure: "cure" }));
    if (which[0] === "success") {
      const r = this.#successRow(c.success, who);
      if (!r) return noSuchSuccessRecord(c.success, true);
      const next = this.#successSuccessor(r.id);
      if (next) return successSuperseded(r.id, next);
      out = { record: r.id, ref: null, kind: CARRY_KINDS.success, text: r.statement, cites: citesOf(parse(r.evidence) || []),
              on: r.changed_on };
    } else if (which[0] === "addressed") {
      const p = this.#part(c.addressed, who);
      if (!p) return noSuchPart(c.addressed, true);
      const a = this.#addressedOf(p.bundle_id);
      if (!a || a.state !== "addressed")
        return refuse("CARRY_NOT_ADDRESSED", localize("consequences.index.bundle_id_s_latest_statement", "{bundle_id}'s latest statement is {v1}, not addressed.{NOTHING}", { bundle_id: String(p.bundle_id), v1: String(a ? a.state : "none"), NOTHING: String(NOTHING) }),
                      { part: p.bundle_id });
      out = { record: p.bundle_id, ref: null, kind: CARRY_KINDS.addressed, text: a.reason, cites: citesOf(parse(a.evidence) || []),
              on: String(a.at).slice(0, 10) };
    } else {
      const cure = this.#standingCure(c.cure, who);
      if (cure.ok === false) return cure;
      out = { record: cure.determination, ref: cure.standard, kind: CARRY_KINDS.cure, text, cites: cure.cites, on: cure.on };
    }
    const ci = this.caseInputs;
    const by = memberOf(author);
    const at = this.#when();
    return this.record.transact(() => {
      const r = ci.carryOutcome({ case: caseId, kind: out.kind, text: out.text, cites: out.cites, on: out.on, by });
      if (!r || r.ok !== true) return r;
      this.sql.exec(`INSERT INTO consequence_carries (record_id, kind, ref, case_id, outcome, by, at) VALUES (?,?,?,?,?,?,?)`,
                    out.record, out.kind, out.ref, String(caseId), String(r.outcome), str(author), at);
      return r;
    });
  }

  /* R22: the standing cure link of a determination and standard (`conformance.curesOf`, its R37), with the curing
     determination's act date and findings (`determinationRead`): `{determination, standard, on, cites}`, conformance's
     refusal passed through, or CARRY_NO_CURE. */
  #standingCure(cure, who) {
    const k = isObj(cure) ? cure : {};
    const conf = this.conformance;
    if (!str(k.determination) || !str(k.standard) || !conf || typeof conf.curesOf !== "function")
      return noCure(k);
    let res;
    try { res = conf.curesOf({ determination: k.determination.trim(), standard: k.standard.trim(), viewer: who ?? INTERNAL }); }
    catch { return noCure(k); }
    if (isObj(res) && res.ok === false) return res;
    const link = standingLink(res, k.standard.trim());
    if (!link || link.cure_standing === false || !str(link.cure)) return noCure(k);
    let d = null;
    try { d = conf.determinationRead({ id: link.cure, viewer: who ?? INTERNAL }); } catch { d = null; }
    const body = isObj(d) && d.ok !== false ? (isObj(d.determination) ? { ...d, ...d.determination } : d) : null;
    if (!body) return noCure(k);
    const when = isObj(body.act) ? body.act.when : body.when;
    const on = typeof when === "string" ? when : isObj(when) ? when.value ?? null : null;
    const findings = (Array.isArray(body.findings) ? body.findings : [])
      .map((f) => (typeof f === "string" ? f : isObj(f) ? f.finding ?? f.id ?? null : null)).filter((x) => str(x));
    return { ok: true, determination: k.determination.trim(), standard: k.standard.trim(),
             on: typeof on === "string" ? on.slice(0, 10) : null, cites: findings.map((f) => ({ kind: "finding", ref: f })) };
  }
}

/* ===================================================================== *
 * R2: OPERANDS
 * ===================================================================== */

/* What R2's grade sentences call each kind of operand and its grade. */
const NAMED = Object.freeze({ content: "content", money: "money fact", calculation: "calculation" });
const GRADE_OF = Object.freeze({ content: "capture grade", money: "reading grade", calculation: "capture axis" });

/* R2: an operand as given, `{content, figure}`, `{money}` or `{calculation, key}`, to `{kind, ref, figure?, key?}`;
   null when it is none of them. */
function operandOf(raw) {
  if (!isObj(raw)) return null;
  const kinds = OPERAND_KINDS.filter((k) => raw[k] !== undefined);
  if (kinds.length !== 1 || !str(raw[kinds[0]])) return null;
  const kind = kinds[0];
  const ref = raw[kind].trim();
  if (kind === "content")
    return { kind, ref, figure: typeof raw.figure === "string" ? raw.figure : raw.figure == null ? null : String(raw.figure) };
  if (kind === "calculation") return str(raw.key) ? { kind, ref, key: raw.key.trim() } : null;
  return { kind, ref };
}

/* R2, R6: an operand as it was given, from a stored row (`consequence_operands`) or a read one, so a revision carries
   it and the part's document states it. A row before T33 is a content operand. */
function operandAsGiven(o) {
  const kind = o.kind || "content";
  const ref = o.ref ?? o.content_id;
  if (kind === "content") return { content: ref, figure: o.figure ?? null };
  if (kind === "calculation") return { calculation: ref, key: o.key ?? o.result_key };
  return { money: ref };
}

/* R2: a money fact's amount as held (money R8: unsigned, with its sign; a range's bounds unsigned) as a calc-grammar
   figure in its currency; null when it holds none. */
function factFigure(f) {
  const cur = str(f.currency) ? { currency: f.currency } : {};
  const neg = f.sign === "-";
  if (isObj(f.amount)) {
    const { low, high } = f.amount;
    if (!str(low) || !str(high)) return null;
    return { low: neg ? `-${high}` : low, high: neg ? `-${low}` : high, sign: neg ? "-" : "+", precision: "range", ...cur };
  }
  if (!str(f.amount)) return null;
  const precision = ["exact", "rounded", "approximate"].includes(f.precision) ? f.precision : "exact";
  return { value: f.amount, sign: neg && !isZero(f.amount) ? "-" : "+", precision, ...cur };
}

/* R2: a calculation's result named by its key (a step of its results, or `output`) as a calc-grammar figure: a figure,
   or a ratio's value; null when the key names no figure (a table, a comparison, or an undetermined value). */
function resultFigure(results, key) {
  if (!isObj(results) || !str(key)) return null;
  const steps = isObj(results.steps) ? results.steps : {};
  let x = key === "output" && !(key in steps) ? results.output : steps[key];
  for (let i = 0; i < 3 && isObj(x) && !isFigure(x); i++) x = x.value;
  return isFigure(x) ? x : null;
}
const isFigure = (x) => isObj(x) && typeof x.precision === "string" && (typeof x.value === "string" || typeof x.low === "string");

/* ===================================================================== *
 * R17–R22 (T45): THE SUCCESS RECORD'S PIECES. Pure.
 * ===================================================================== */

/* R17, R24: a success record's id prefix (record-grammar R59: sequential) and its object type. */
const SUCCESS_PREFIX = "SUC";
const SUCCESS_TYPE = "success_record";

/* R24: a success record's object: its title, the member's statement cut to a line. */
const successTitle = (r) => `success: ${String(r.statement)}`.replace(/\s+/g, " ").slice(0, 110);

/* R24: a success record's document, a `success_record` record object in its one state, `recorded`, holding the fields
   its row holds (R17) as recorded; its project in the front matter, so membership R43 fences it as the reads are. */
function successDoc(r) {
  const body = { project: r.project, matter: parse(r.matter), statement: r.statement, changed_on: r.changed_on,
    evidence: parse(r.evidence) || [], figures: parse(r.figures) || [], sequence: r.sequence ?? null, cause: parse(r.cause),
    author: r.author, at: r.at, supersedes: r.supersedes ?? null, reason: r.reason ?? null };
  return ["---", `id: ${r.id}`, `object_type: ${SUCCESS_TYPE}`, `schema: ${SUCCESS_TYPE}@1`, `title: ${q(successTitle(r))}`,
    "current_state: recorded", "prior_state: null", `created: ${q(r.at)}`, `last_updated: ${q(r.at)}`,
    `project: ${q(r.project)}`, `supersedes: ${q(r.supersedes ?? null)}`, `author: ${q(r.author)}`, "machine_work: false",
    "produced_by:", "  mode: human", "  capability_tier: session", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "---", "",
    "## Success Record", "", "```json", JSON.stringify(body, null, 2), "```", "",
    ...(r.reason ? ["## Why It Was Revised", "", r.reason, ""] : []),
    "## Session Log", "", `### Session ${r.at} | Recorded | ${r.author}`,
    `Changes: success record recorded${r.supersedes ? `, superseding ${r.supersedes}` : ""}.`, ""].join("\n");
}

/** R20, R22: no success record answers to the id, or the reader may not see it: one answer. */
function noSuchSuccessRecord(id, wrote = false, why = null) {
  return refuse("NO_SUCH_SUCCESS_RECORD", localize("consequences.index.v1_no_success_record_answers", "{v1}no success record answers to that id here; one you may not see is answered exactly as one that does not exist.{v2}", { v1: String(why ? `${why}; ` : ""), v2: String(wrote ? NOTHING : "") }), { id: str(id) });
}

/** R21, R22: the success record has a successor, which carries the record forward. */
function successSuperseded(id, next) {
  return refuse("SUCCESS_SUPERSEDED", localize("consequences.index.id_has_been_revised_by_2", "{id} has been revised by {next}; act on that one.{NOTHING}", { id: String(id), next: String(next), NOTHING: String(NOTHING) }),
                { id, superseded_by: next });
}

/** R22: no standing cure is linked for that determination and standard (the job's reading, J1). */
function noCure(k) {
  return refuse("CARRY_NO_CURE", localize("consequences.index.no_standing_cure_is_linked", "no standing cure is linked to {v1} for {v2}.{NOTHING}", { v1: String(str(k.determination) ?? "that determination"), v2: String(str(k.standard) ?? "that standard"), NOTHING: String(NOTHING) }), { determination: str(k.determination), standard: str(k.standard) });
}

/* R22: the standing link `curesOf` answers for one standard (its R37 answer, K2850: `{standards: [{standard, link,
   ended}]}`, `link` the standing link `{link, cure, standard, by, at, cure_standing}` or null); null when none stands. */
function standingLink(res, standard) {
  const rows = isObj(res) && Array.isArray(res.standards) ? res.standards : [];
  const row = rows.find((x) => isObj(x) && x.standard === standard);
  return row && isObj(row.link) ? row.link : null;
}

/* R22: evidence ids as case-account R5's cites: a passage by its content id, a finding by its id. */
const citesOf = (ids) => ids.map((x) => (HEX64.test(String(x)) ? { kind: "passage", ref: String(x) } : { kind: "finding", ref: String(x) }));

/* R22: case-inputs' `by` is the member's own id, the stamp without its `member:` mark. */
const memberOf = (who) => (str(who) ? str(who).replace(/^member:/, "") : null);

/** R17: a real calendar date (`civil-time.isCalendarDate`) or an EDTF band (`civil-time.parseEdtf`). */
export function isSuccessDate(v) {
  if (typeof v !== "string" || !v.trim()) return false;
  const t = v.trim();
  if (isCalendarDate(t)) return true;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return false;
  try { const r = parseEdtf(t); return !!r && !r.refused; } catch { return false; }
}

/* R20: a matter's canonical form, keys sorted, so `{plan, matter}` matches however it was spelled. */
function canonical(v) {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (isObj(v)) return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`;
  return JSON.stringify(v ?? null);
}

/* R18: one figure as answered: its label, its computation as given (so a revision recomputes it), the operands shown
   with their grades, the value exactly as calc-grammar gives it, the weakest grade named, or undetermined with why;
   labelled machine work when a machine computed it (R2's label). */
function figureAnswer(given, r, byMachine) {
  const operands = r.operands.map((o) => {
    const exact = o.exact || null;
    return { kind: o.kind, ...operandAsGiven(o), ...(exact ? (exact.range ? { range: exact.range } : { value: exact.value }) : {}),
             ...(exact && exact.precision ? { precision: exact.precision } : {}),
             ...(o.kind === "content" ? { capture: o.capture_sha ?? null } : {}),
             grade: o.grade ?? null, route: o.route ?? null, determined: !!o.determined };
  });
  const base = { label: given.label.trim(), basis: { op: r.op, operands: r.operands.map(operandAsGiven) }, op: r.op, operands,
    label_says: byMachine ? { machine_work: true, says: word("consequences.says.machine_work_computed_operands") }
      : { machine_work: false, says: word("consequences.says.computed_operands_shown_2") } };
  if (r.state !== "computed")
    return { ...base, state: "undetermined", undetermined: { code: r.undeterminedCode, why: r.undeterminedWhy,
             says: word("consequences.says.undetermined_known_read") } };
  const f = r.figure;
  return { ...base, state: "computed", ...(f.range ? { range: f.range } : { value: f.value }), precision: f.precision,
           ...(f.currency !== undefined ? { currency: f.currency } : {}), ...(r.rounding ? { rounding: r.rounding } : {}),
           grade: { grade: r.grade, determined: r.grade !== null, why: r.gradeWhy },
           says: word("consequences.says.calc_grammar_exact") };
}

/* R15 for a figure's grade sentence: renumbered among the operands answered, or the finding with no place or id. */
function figureGradeWhy(g, place) {
  if (typeof g.why !== "string") return g.why;
  const t = renumbered(g.why, place);
  if (t !== null) return t;
  return g.grade === null ? word("consequences.text.operand_grade_undetermined")
    : localize("consequences.index.the_weakest_operands_grade_is", "the weakest operand's grade is {grade}; a computation is as strong as its weakest figure (DEC-21)", { grade: String(g.grade) });
}

/* ===================================================================== *
 * R15: THE SENTENCES A PART RECORDED ABOUT ITS OPERANDS, AS ONE VIEWER READS THEM
 * ===================================================================== */

/* A sentence naming operands by their recorded places (`operand 1`, `operand is 1`), each renumbered to its place among
   the operands answered (`place`); null when it names one withheld. With nothing withheld every place is its own. */
function renumbered(text, place) {
  let gone = false;
  const t = String(text).replace(/\b(operand (?:is )?)(\d+)/g, (m, w, n) => {
    if (!place.has(Number(n))) { gone = true; return m; }
    return `${w}${place.get(Number(n))}`;
  });
  return gone ? null : t;
}

/* R2's grade sentence: renumbered, or, when the operand it names was withheld, the same finding with no place or id. */
function gradeWhyFor(r, place) {
  if (r.grade_why == null) return r.grade_why;
  const t = renumbered(r.grade_why, place);
  if (t !== null) return t;
  return r.grade === null
    ? word("consequences.text.operand_capture_grade")
    : localize("consequences.index.the_weakest_operands_capture_grade", "the weakest operand's capture grade is {grade}; a computation is as strong as its weakest figure (DEC-21)", { grade: String(r.grade) });
}

/* R4's sentence: `<why the part is undetermined>: <what the computation lacked>`. With an operand withheld, the second
   clause stays only when it names an answered operand (renumbered) or no operand at all; one about a withheld
   operand, or one that counts or orders the operands (the arithmetic's own sentences), goes, and R4's why stands. */
function undeterminedWhyFor(r, place, withheld) {
  const head = UNDETERMINED_WHY[r.undetermined_code];
  const why = r.undetermined_why;
  if (!withheld || !head || typeof why !== "string" || !why.startsWith(`${head}: `)) return why;
  const detail = why.slice(head.length + 2);
  if (/^operand \d+/.test(detail)) { const t = renumbered(detail, place); return t === null ? head : `${head}: ${t}`; }
  return detail === NO_UNIT ? why : head;
}

/* ===================================================================== *
 * THE PART'S DOCUMENT (R14): a `CONS-` record object, one state `recorded`.
 * ===================================================================== */

/* R16 (DEC-78): a person the part names never enters its document or title, which are fenced by the project's sight
   alone; the part's own reads answer them, to a viewer R16 admits. */
const PERSON_IN_TABLE = localize("consequences.index.a_person_a_document", "a person a document names: answered by this module's reads only to a viewer who may see the passage naming them (R16)");

function titleOf(p) {
  if (p.affected.kind === "person") return word("consequences.text.person_named_record");
  return `${p.affected.kind}: ${p.affected.description}`.replace(/\s+/g, " ").slice(0, 110);
}

function partDoc(id, p) {
  const { causation, ...rest } = p;
  const body = { ...rest, causation: { state: causation.state, inquiry: causation.inquiry },
                 ...(p.affected.kind === "person" ? { affected: { kind: "person", says: PERSON_IN_TABLE } } : {}) };
  return ["---", `id: ${id}`, "object_type: consequence", "schema: consequence@1", `title: ${q(titleOf(p))}`,
    "current_state: recorded", "prior_state: null", `created: ${q(p.at)}`, `last_updated: ${q(p.at)}`,
    /* R13, promotion R53: the part belongs to its determination's project, so membership R43 fences the object too. */
    ...(p.project ? [`project: ${q(p.project)}`] : []),
    `determination: ${q(p.determination)}`, `standard: ${q(p.standard)}`, `part_state: ${p.state}`,
    `causation: ${q(causation.inquiry)}`, `supersedes: ${q(p.supersedes)}`, `author: ${q(p.author)}`,
    `machine_work: ${p.machine ? "true" : "false"}`, "produced_by:", `  mode: ${p.machine ? "agent" : "human"}`,
    "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:",
    "  flag: false", "  since: null", "  source: null", "visuals: []", "---", "", "## Part", "", "```json",
    JSON.stringify(body, null, 2), "```", "", ...(p.reason ? ["## Why It Was Revised", "", p.reason, ""] : []),
    "## Session Log", "", `### Session ${p.at} | Recorded | ${p.author || "machine"}`,
    `Changes: consequence part recorded${p.supersedes ? `, superseding ${p.supersedes}` : ""}.`, ""].join("\n");
}

/* ===================================================================== *
 * HOW THE MODULE IS REACHED
 * ===================================================================== */

const instances = new WeakMap();

/** K171 (17): one instance per host, created on the first call with `deps`. */
export function consequencesModule(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    c = new Consequences({ ...d, host, storage, record, membership, promotion });
    instances.set(host, c);
    c.migrate();
    record.declarePurge("consequences", CONSEQUENCES_TABLES);
    /* R24 (N911): the success records held before T46, promoted as their record objects. */
    c.promoteHeldSuccessRecords();
  }
  return c;
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function consequencesOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return CONSEQUENCES_TABLES.some((x) => (typeof x === "string" ? x : x.name) === name);
}

/** The module's ops (K3), as entries of the plane's one route map (`plane/store.mjs`, plane R5). `viewer` and `author` are the control plane's stamps,
 *  read from the query after the body, so a caller's own copy never wins. */
export function consequencesOps(c, url, body) {
  const qp = (k) => url.searchParams.get(k);
  const b = isObj(body) ? body : {};
  const stamps = { author: qp("author"), viewer: qp("viewer") };
  return {
    consequencerecord: () => c.consequenceRecord({ ...b, ...stamps }),
    consequencerevise: () => c.consequenceRevise({ ...b, ...stamps }),
    consequence: () => c.consequenceRead({ id: qp("id"), viewer: qp("viewer") }),
    consequencesof: () => c.consequencesOf({ determination: qp("determination"), standard: qp("standard"),
                                             viewer: qp("viewer") }),
    addressedrecord: () => c.addressedRecord({ ...b, ...stamps }),
    addressed: () => c.addressed({ determination: qp("determination"), viewer: qp("viewer") }),
    /* T45 (R17–R22). */
    successrecord: () => c.successRecord({ ...b, ...stamps }),
    successrevise: () => c.successRevise({ ...b, ...stamps }),
    successread: () => c.successRecordRead({ id: qp("id"), viewer: qp("viewer") }),
    successrecords: () => c.successRecordsFor({ project: qp("project"), after: qp("after"),
      limit: qp("limit") === null ? null : Number(qp("limit")),
      matter: qp("plan") !== null || qp("matter") !== null ? { plan: qp("plan"), matter: qp("matter") } : null,
      viewer: qp("viewer") }),
    outcomecarry: () => c.outcomeCarry({ ...b, ...stamps }),
  };
}

/* R26 (T51; K4168; op-declarations R80, op-grades R49): the ops this module serves that the screens send, declared by their owner beside
   the ops map: each row's class, weight and description are the op's existing rows', its fields are what the arm reads. */
export const DECLARED_OPS = Object.freeze({
  consequencerecord: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("consequences.declared.consequencerecord", "determination-directed: a member records one consequence part against one standard's noncompliant outcome, keyed by (determination, standard); writes a CONS- bundle"),
    fields: { accepts: ["determination","standard","affected","measure","period","basis","causation"], requires: ["determination","standard","affected","period"] } },
  consequencerevise: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("consequences.declared.consequencerevise", "consequence-directed: a member revises a consequence part with its reason, keyed by part id; writes a successor CONS- bundle, the earlier one kept"),
    fields: { accepts: ["id","reason","affected","measure","period","basis","causation"], requires: ["id","reason"] } },
  addressedrecord: { classes: ["admin","member","probe"], mutating: true, weight: "reasoned", description: localize("consequences.declared.addressedrecord", "consequence-directed: a member records a part addressed or not addressed, with a reason, keyed by part id; writes a `consequence_addressed` row"),
    fields: { accepts: ["id","state","evidence","reason","words"], requires: ["id","state","evidence","reason"] } },
  successrecord: { classes: ["admin","member"], machineClasses: [], mutating: true, weight: "undetermined", description: localize("consequences.declared.successrecord", "success-directed: keyed by a new SUC- id in a project; a member's statement of what changed and when, on evidence; never a consequence part; moves no bundle"),
    fields: { accepts: ["project","matter","statement","changed_on","evidence","figures","sequence","cause"], requires: ["project","statement","changed_on","evidence"] } },
});
