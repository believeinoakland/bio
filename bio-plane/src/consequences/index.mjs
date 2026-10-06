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
 *   now            the clock for the instants it writes, an ISO string (default: the wall clock, to the second).
 *
 * READ CONTRACTS it joins in its own SQL: none. Its own tables are `./schema.mjs`. */

import { recordOf, stampInstant, instantOrder } from "../record-core/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { contentOf } from "../content/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { strengthOf } from "../strength/index.mjs";
import { conformanceOf, noSuchDetermination, determinationSuperseded } from "../conformance/index.mjs";
import { moneyOf } from "../money/index.mjs";
import { calculationsOf } from "../calculations/index.mjs";
import { entitiesOf } from "../entities/index.mjs";
import { peopleOf } from "../people/index.mjs";
import { isMachineIdentity, MACHINE_CLASS_PREFIX } from "../record-grammar/actors.mjs";
import { normalizeType } from "../record-grammar/types.mjs";
import { BASIS_GRADES } from "../record-grammar/grades.mjs";
import { OPS, RATIO_ROUNDING, exactOf, isZero, order, readFigure, passageHolds, compute, measureOfFigure,
         addMeasures } from "./measures.mjs";
import { CONSEQUENCES_TABLES, migrateConsequences } from "./schema.mjs";
import { CONSEQUENCES_CHECKS } from "./checks.mjs";

export { OPS, RATIO_ROUNDING, exactOf } from "./measures.mjs";
export { CONSEQUENCES_SCHEMA, CONSEQUENCES_TABLES } from "./schema.mjs";
export { CONSEQUENCES_CHECKS } from "./checks.mjs";

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
  not_in_record: "the figure is not in the record",
  form_not_read: "the record holds it in a form not read",
  not_assessed: "nobody has assessed it",
  not_computable: "the record holds the figures, and the computation named cannot be carried out over them",
});
/* R4: why a computation with no measure stated is undetermined (it names no operand, so R15 keeps it). */
const NO_UNIT = "no measure is stated, so the computation has no unit";
/** R3: the longest rationale an assessment carries. */
export const RATIONALE_MAX = 2000;
/** R6, R9: the longest reason a revision or an addressed record carries (conformance R7's bound). */
export const REASON_MAX = 500;

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
  return refuse("NO_SUCH_PART", "no consequence part answers to that id here; one you may not see is answered exactly "
    + `as one that does not exist.${wrote ? NOTHING : ""}`, { id: id ?? null });
}

/** R6, R9: the part has a successor, which carries the record forward. */
function alreadySuperseded(id, next) {
  return refuse("ALREADY_SUPERSEDED", `${id} has been revised by ${next}; act on that one.${NOTHING}`,
                { id, superseded_by: next });
}

/** R6, R9: a revision's or an addressed record's reason: null when it is stated and within `REASON_MAX`. */
function reasonRefusal(reason) {
  if (!str(reason)) return refuse("NO_REASON", `the record says why.${NOTHING}`);
  if (reason.trim().length > REASON_MAX)
    return refuse("BAD_REASON", `a reason is at most ${REASON_MAX} characters.${NOTHING}`);
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

/* ===================================================================== *
 * THE TERMS, CHECKED (R1's shape refusals, R10). Pure.
 * ===================================================================== */

/** R1, R10: an affected is `{kind, description, role?, person?}`; answers the canonical form or a refusal. Its shape
 *  only: whether a person's entity is a person, and whether the passage names them, is the module's (`#checkPerson`).
 *  A role is an office, `{role, body}`; a `person` belongs to kind `person` alone, `{entity, named_in}` (R10). */
export function checkAffected(a) {
  const o = isObj(a) ? a : {};
  const kind = str(o.kind) ? o.kind.trim().toLowerCase() : null;
  const unknown = (why) => refuse("AFFECTED_UNKNOWN_KIND", `${why}: kind one of ${AFFECTED_KINDS.join(", ")}, with a `
    + "description; an office is {role, body}, and a person {entity, named_in}. Nothing was written.", { kind: kind ?? null });
  if (!isObj(a)) return unknown("an affected is {kind, description, role?, person?}");
  if (!kind || !AFFECTED_KINDS.includes(kind)) return unknown(`"${String(o.kind ?? "")}" is not a kind of affected`);
  if (!str(o.description)) return unknown("an affected is described");
  if (o.role != null && (!isObj(o.role) || !str(o.role.role) || !str(o.role.body)))
    return unknown("a role is an office, {role, body}: the office and the body it belongs to");
  if (o.person != null && kind !== "person") return unknown(`a person is named only on kind "person", and this is ${kind}`);
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
    return refuse("MEASURE_UNKNOWN_UNIT", `a measure's unit is one of ${UNITS.join(", ")}. Nothing was written.`,
                  { unit: isObj(m) ? m.unit ?? null : null });
  const unit = m.unit.trim();
  const bad = (why) => refuse("MEASURE_INVALID", `${why}. Nothing was written.`, { unit });
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
  const bad = (why) => refuse("PERIOD_INVALID", `${why}. Nothing was written.`);
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
           why: "the measure is zero: the part states no harm, so there is no causation to establish" };
}

/* ===================================================================== *
 * THE MODULE
 * ===================================================================== */

export class Consequences {
  #deps;

  constructor({ storage, record, membership, promotion, host = null, conformance = null, content = null,
                provenance = null, inquiry = null, strength = null, money = null, calculations = null, entities = null,
                people = null, passageText = null, now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, conformance, content, provenance, inquiry, strength, money, calculations, entities, people,
                   passageText };
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
    return { id, project: body.project ?? null, outcome, live, supersededBy: str(supersededBy) };
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
  #causationNow(inquiryId, viewer) {
    if (!str(inquiryId))
      return { state: "unproven", inquiry: null,
               why: "no inquiry is named whose finding is that the harm follows from the act; sequence alone does not "
                  + "establish it (DEC-14), so the causation is unproven until one concludes" };
    const who = viewer ?? INTERNAL;
    const info = this.record.bundleInfo(inquiryId);
    if (!info || !this.membership.inSight(inquiryId, who) || normalizeType(info.type) !== "inquiry")
      return { state: "unproven", inquiry: inquiryId,
               why: "the inquiry named is not one this record holds that you may see, so it establishes nothing here" };
    const head = this.record.head(inquiryId);
    const st = head ? head.currentState : null;
    const sup = this.#supersededBy(inquiryId);
    if (sup.length)
      return { state: "unproven", inquiry: inquiryId,
               why: "the inquiry named has been superseded, so its finding does not stand" };
    if (!CONCLUDED.has(st))
      return { state: "unproven", inquiry: inquiryId,
               why: `the inquiry named is ${st ?? "in no state"}, not concluded: until it concludes that the harm follows `
                  + "from the act, the causation is unproven" };
    return { state: "established", inquiry: inquiryId,
             why: `the inquiry named has concluded; its finding is that the harm follows from the act` };
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
    return refuse("NO_SUCH_EVIDENCE", `${what} content or findings this record holds and you may see.${NOTHING}`,
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
      return refuse("AFFECTED_NOT_A_PERSON", `${person.entity ? `${person.entity} is not a person this record holds`
        : "an affected person names the person entity"}: a harmed person is a registered person entity.${NOTHING}`,
        { entity: person.entity ?? null });
    const notNamed = (why) => refuse("AFFECTED_PERSON_NOT_NAMED", `${why}: a person is recorded as affected only as a `
      + `document in the record names them.${NOTHING}`, { entity: person.entity, named_in: person.named_in ?? null });
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
    return refuse("CONSEQUENCE_NOT_A_PARTICIPANT", `acting on a consequence is work inside ${project}, and `
      + `${str(author)} has not joined it.${NOTHING}`, { project });
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
    if (!str(standard) || d.outcome(standard) !== "noncompliant")
      return refuse("CONSEQUENCE_NOT_NONCOMPLIANT", `${d.id}'s outcome for ${str(standard) ?? "that standard"} is `
        + `${d.outcome(standard) ?? "not stated"}, not noncompliant: a consequence is what a breach did.${NOTHING}`,
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
    const cause = isZeroMeasure(b.measure) ? zeroCausation(causation) : this.#causationNow(causation, who);
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
      return refuse("MACHINE_CANNOT_ASSESS", "a machine may prepare a computed part, from the record's own figures, and "
        + "propose an assessment as text for a member; it never records an assessment or an undetermined judgment. "
        + "Nothing was written.");
    if (hasFigure) {
      /* R3: a member's assessment. */
      const rationale = isObj(basis) ? str(basis.rationale) : null;
      if (!rationale) return refuse("NO_RATIONALE", "an assessed value says why: a rationale of at most "
                                    + `${RATIONALE_MAX} characters. Nothing was written.`);
      if (rationale.length > RATIONALE_MAX)
        return refuse("BAD_RATIONALE", `a rationale is at most ${RATIONALE_MAX} characters. Nothing was written.`);
      const rests = basis.rests_on ?? basis.restsOn ?? [];
      if (!Array.isArray(rests))
        return basisUnreadable("what an assessment rests on is a list of content ids or findings, possibly empty");
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
  #computation(basis, measure, who) {
    const op = str(basis.op);
    if (!op || !OPS.includes(op))
      return basisUnreadable(`a computation names its op, one of ${OPS.join(", ")}`, { op: basis.op ?? null });
    const given = Array.isArray(basis.operands) ? basis.operands.map(operandOf) : null;
    if (!given || given.some((o) => !o))
      return basisUnreadable("a computation's operands are a list, each {content, figure} (the content id whose passage "
        + "holds the figure, and the figure as read), {money} (a money fact) or {calculation, key} (a calculation's "
        + "result, named by its key)");
    const read = given.map((o, i) => this.#readOperand(o, i, op, who));
    const fault = read.find((r) => r && r.ok === false);
    if (fault) return fault;
    if (read.some((r) => r && typeof r.then === "function"))
      return Promise.all(read).then((all) => {
        const late = all.find((r) => r.ok === false);
        return late || this.#finish(op, all, measure, who);
      });
    return this.#finish(op, read, measure, who);
  }

  /* R2: one operand read: `{ok: true, kind, ref, key?, figure?, exact?, fig?, capture_sha?, grade, route, determined,
     basis, lacking?}`, a refusal (a figure as read that calc-grammar does not read), or for a calculation operand a
     promise of either. */
  #readOperand(o, i, op, who) {
    const base = { ok: true, kind: o.kind, ref: o.ref, ...(o.key ? { key: o.key } : {}),
                   ...(o.kind === "content" ? { figure: o.figure } : {}) };
    const lacking = (code, why) => ({ ...base, grade: null, route: null, determined: false, basis: null,
                                      lacking: { code, why: `operand ${i} ${why}` } });
    if (o.kind === "content") {
      const row = this.content.contentRow(o.ref);
      if (!row || !this.membership.inSight(row.bundle_id, who ?? INTERNAL))
        return lacking("not_in_record", "names content this record does not hold, or that you may not see");
      const g = this.provenance.captureGrade(row.capture_sha) || {};
      const out = { ...base, capture_sha: row.capture_sha, grade: g.grade ?? null, route: g.route ?? null,
                    determined: !!g.determined, basis: g.basis ?? null };
      if (op === "count") return out;
      if (o.figure == null || !String(o.figure).trim())
        return { ...out, lacking: { code: "not_in_record", why: `operand ${i} states no figure as read` } };
      const f = readFigure(o.figure);
      if (!f.ok) return basisUnreadable(`operand ${i}: ${f.why}`, { operand: i });
      const text = this.#passageText(o.ref);
      if (text === null)
        return { ...out, lacking: { code: "form_not_read", why: `operand ${i}'s passage is held in a form this module does not read` } };
      if (!passageHolds(text, o.figure))
        return { ...out, lacking: { code: "not_in_record", why: `operand ${i}'s passage does not hold the figure "${o.figure}"` } };
      return { ...out, fig: f.figure, exact: measureOfFigure(f.figure) };
    }
    if (o.kind === "money") {
      let r = null;
      try { r = this.money ? this.money.readFact({ factId: o.ref, viewer: who ?? INTERNAL }) : null; } catch { r = null; }
      const fact = r && r.ok !== false && r.found !== false ? r.fact : null;
      if (!fact) return lacking("not_in_record", "names a money fact this record does not hold, or that you may not see");
      const grade = isObj(fact.grade) ? fact.grade.reading ?? null : null;
      const out = { ...base, grade, route: "money fact", determined: grade !== null,
                    basis: grade ? `its reading grade, ${grade}` : "its reading grade is not stated" };
      if (fact.withdrawn) return { ...out, lacking: { code: "not_in_record", why: `operand ${i}'s money fact is withdrawn and never counted` } };
      if (op === "count") return out;
      const fig = factFigure(fact);
      return fig ? { ...out, fig, exact: measureOfFigure(fig) }
        : { ...out, lacking: { code: "form_not_read", why: `operand ${i}'s money fact holds no amount this module reads` } };
    }
    /* A calculation's output, named by its key (N576): whether it is held and visible to the author, and its grade
       (the capture axis of its grade facts), are read synchronously (calculations R31, R30); one not held or not
       visible is an operand not in the record (R4). Only its value waits on `read`. */
    const viewer = who ?? INTERNAL;
    const absent = () => lacking("not_in_record", "names a calculation this record does not hold, or that you may not see");
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
        : { ...out, lacking: { code: "not_computable", why: `operand ${i}'s calculation holds no figure under the key "${o.key}"` } };
    };
    let r;
    try { r = this.calculations.read({ calcId: o.ref, viewer }); } catch { r = null; }
    return r && typeof r.then === "function" ? r.then(settle, () => settle(null)) : settle(r);
  }

  /* R2, R4: the computation finished over its read operands. */
  #finish(op, operands, measure, who) {
    const stored = operands.map(({ ok, fig, lacking, ...o }) => o);
    const docOps = stored.map(operandAsGiven);
    const missing = operands.find((o) => o.lacking);
    let lacking = missing ? missing.lacking : null;
    if (!lacking && !measure) lacking = { code: "not_assessed", why: NO_UNIT };
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
      if (!result.ok && result.refused) return foreignRefusal(result.refused, `calc-grammar refuses the computation: ${result.why}`);
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
    if (r.unit !== undefined || (r.currency !== undefined && (measure.unit !== "money"
        || (measure.currency && measure.currency !== r.currency))))
      return foreignRefusal("UNIT_MISMATCH", `the operands' result is in ${dims}, and the measure is of ${measure.unit}`
        + `${measure.currency ? ` in ${measure.currency}` : ""}`);
    const value = r.range ? { range: r.range } : { value: r.value };
    const currency = measure.currency ?? r.currency;
    /* DEC-21: the part's grade is its weakest operand's grade, named; one undetermined operand leaves it
       undetermined, naming that operand. */
    const rank = (g) => BASIS_GRADES.indexOf(g);
    const open = stored.findIndex((o) => !o.grade);
    let grade = null; let gradeWhy;
    if (open >= 0) {
      gradeWhy = `operand ${open}'s ${GRADE_OF[stored[open].kind]} is undetermined (${stored[open].basis ?? stored[open].route ?? "no route"}), `
               + "so the weakest link is not known";
    } else {
      const w = stored.reduce((acc, o, i) => (rank(o.grade) > rank(stored[acc].grade) ? i : acc), 0);
      grade = stored[w].grade;
      gradeWhy = `the weakest operand is ${w} (${NAMED[stored[w].kind]} ${stored[w].ref}), whose ${GRADE_OF[stored[w].kind]} is ${grade} `
               + `(${stored[w].route}); a computation is as strong as its weakest figure (DEC-21)`;
    }
    const exact = { ...value, precision: r.precision, ...(r.approximate ? { approximate: true } : {}),
                    ...(op === "ratio" ? { rounding: RATIO_ROUNDING } : {}) };
    return { ok: true, state: "computed", op, measure: { ...unitOnly, ...(currency ? { currency } : {}), ...value },
             value: exact, grade, gradeWhy, operands: stored, doc: { op, operands: docOps, value: exact, grade } };
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
        says: "calc-grammar's exact arithmetic over the operands, never the author's and never floating point" };
    }
    if (r.state === "computed") {
      out.grade = { grade: r.grade, determined: r.grade !== null, why: gradeWhyFor(r, place) };
      out.label = r.machine
        ? { machine_work: true, says: `machine work: computed by ${r.author || "a machine"} from the operands shown` }
        : { machine_work: false, says: `computed from the operands shown; recorded by ${r.author}` };
    } else if (r.state === "assessed") {
      const recorded = parse(r.rests_on) || [];
      const rests = recorded.filter((x) => this.#resolvesEvidence(x, who));
      if (rests.length < recorded.length) withheld = true;
      out.assessment = { by: r.author, at: r.at, rationale: r.rationale, rests_on: rests,
        says: rests.length ? "a member's assessment, resting on the ids listed"
          : "a member's assessment, resting on nothing in the record (stated as none)" };
      out.label = { machine_work: false, says: "a member's assessment: never presented, summed or graded as computed" };
    } else {
      out.undetermined = { code: r.undetermined_code, why: undeterminedWhyFor(r, place, withheld),
                           says: "undetermined: not known, and never read as zero" };
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
              says: "per axis, never composed (DEC-44)" }
          : { capture: null, connection: null, testimony: null, says: "the inquiry's strength could not be read for you" };
        /* strength R6 withheld a member of the pair inside the answer: something of the part's answer was withheld. */
        if (s && s.ok && s.out_of_view === true) withheld = true;
      }
    }
    const a = this.#addressedOf(r.bundle_id);
    if (a) {
      const recorded = parse(a.evidence) || [];
      const evidence = recorded.filter((x) => this.#resolvesEvidence(x, who));
      if (evidence.length < recorded.length) withheld = true;
      out.addressed = { state: a.state, evidence, reason: a.reason, by: a.author, at: a.at };
    } else {
      out.addressed = { state: "never_assessed", says: "no member has recorded whether this consequence has been addressed" };
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
          causes.push({ cause: "newer_capture", operand: at, why: `a newer capture of operand ${at}'s document `
            + "does not carry its passage; nothing is recomputed until a member revises this part" });
      }
    }
    if (r.causation && causationSeen && r.causation_state !== "not_applicable") {
      const sup = this.#supersededBy(r.causation);
      if (sup.length) causes.push({ cause: "causation_superseded", why: "the causation inquiry has been superseded" });
      else if (r.causation_state === "established") {
        const head = this.record.head(r.causation);
        let reopened = head && !CONCLUDED.has(head.currentState);
        if (!reopened) {
          let h = null;
          try { h = this.inquiry.stateHistory(r.causation); } catch { h = null; }
          reopened = !!(h && h.ok && h.transitions.some((t) => t.to === "open" && t.at && instantOrder(t.at, r.at) > 0));
        }
        if (reopened) causes.push({ cause: "causation_reopened", why: "the causation inquiry has been reopened since "
                                     + "this part was recorded" });
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
      says: `${g.state} parts only, in ${g.unit}${g.currency ? ` (${g.currency})` : ""}: never added to parts in another `
          + "state, unit or currency" }));
    return { ok: true, determination: d.id, standard: str(standard), parts, totals,
             undetermined: parts.filter((p) => p.state === "undetermined").map((p) => p.id),
             unproven: parts.filter((p) => p.causation.state === "unproven").map((p) => p.id),
             says: parts.length ? "each part is what it is: computed, assessed or undetermined; nothing here is composed "
                                  + "into one figure, and nothing ranks it"
                                : "no consequence recorded" };
  }

  /* ===================================================================== *
   * R9: ADDRESSED
   * ===================================================================== */

  /** R9: a member records a part addressed or not, with evidence and a reason. */
  addressedRecord({ id = null, state = null, evidence = null, reason = null, author = null, viewer = null } = {}) {
    if (machine(author))
      return refuse("MACHINE_CANNOT_ADDRESS", "whether a consequence has been addressed is a member's judgment, with "
        + "evidence; a machine never records it. Nothing was written.");
    const who = viewer ?? str(author);
    const r = this.#part(id, who);
    if (!r) return noSuchPart(id, true);
    const next = this.#successor(r.bundle_id);
    if (next) return alreadySuperseded(r.bundle_id, next);
    const denied = this.#participantRefusal(r.project, author, "addressedRecord"); if (denied) return denied;
    if (!ADDRESSED_STATES.includes(state))
      return refuse("ADDRESSED_UNKNOWN_STATE", `a part is recorded ${ADDRESSED_STATES.join(" or ")}. Nothing was written.`,
                    { state: state ?? null });
    const bad = reasonRefusal(reason); if (bad) return bad;
    const ev = evidence == null ? [] : Array.isArray(evidence) ? evidence : [evidence];
    if (state === "addressed" && !ev.length)
      return refuse("ADDRESSED_NO_EVIDENCE", "a consequence is recorded addressed with the evidence that it was: content "
        + "or findings in the record. Partial redress does not end an escalation. Nothing was written.");
    const unseen = this.#evidenceRefusal(ev, who, "evidence is"); if (unseen) return unseen;
    const at = this.#when();
    this.record.transact(() => this.sql.exec(`INSERT INTO consequence_addressed (part_id, state, evidence, reason, author, at)
      VALUES (?,?,?,?,?,?)`, r.bundle_id, state, JSON.stringify(ev.map(String)), reason.trim(), str(author), at));
    return { ok: true, id: r.bundle_id, state, evidence: ev.map(String), reason: reason.trim(), by: str(author), at };
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
      return { ok: true, determination: d.id, state: "undetermined", parts, why: "no consequence recorded" };
    const open = parts.filter((p) => p.part_state === "undetermined" || p.causation === "unproven");
    if (open.length)
      return { ok: true, determination: d.id, state: "undetermined", parts,
               why: `${open.map((p) => p.id).join(", ")} ${open.length === 1 ? "is" : "are"} undetermined or unproven, `
                  + "so whether the consequences are addressed is not known" };
    const not = parts.filter((p) => p.addressed !== "addressed");
    if (not.length)
      return { ok: true, determination: d.id, state: "not_addressed", parts,
               why: `${not.map((p) => p.id).join(", ")} ${not.length === 1 ? "is" : "are"} not addressed or never `
                  + "assessed; partial redress does not end an escalation" };
    return { ok: true, determination: d.id, state: "addressed", parts, why: "every live part is recorded addressed, with evidence" };
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
    ? "an operand's capture grade is undetermined, so the weakest link is not known"
    : `the weakest operand's capture grade is ${r.grade}; a computation is as strong as its weakest figure (DEC-21)`;
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
const PERSON_IN_TABLE = "a person a document names: answered by this module's reads only to a viewer who may see the "
  + "passage naming them (R16)";

function titleOf(p) {
  if (p.affected.kind === "person") return "person: named in the record";
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
  };
}
