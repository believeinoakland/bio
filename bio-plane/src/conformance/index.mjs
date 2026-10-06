/* conformance — the group's recorded judgment that a named government act is compliant, noncompliant or unclear
 * against named standards, resting on published findings (requirements: `build/requirements/conformance.md`;
 * Functional Architecture v3, Layer 2 "Analysis outputs" and Function 4). A member determines; a machine may prepare
 * the comparison (R12) and never determines (R1, R13). A compliant determination carries the same obligations as a
 * noncompliant one (R5). Nothing here ranks significance (R8): whether a breach warrants action, and how urgently, is a
 * member's judgment made with the consequences in front of them (Bob's ruling 1, K12).
 *
 * A new module (layer 9, K102, K171): nothing moved here from the legacy modules. Its tables are `./schema.mjs`, its
 * refusal rows `./checks.mjs` (family C-113).
 *
 * THE ACT (R25, R26; K1465, K1485). An act is an event `events` holds: what the government did, with its kind, `when`,
 * attestations and participants; the office that did it (`actor`, role and body, carrying the `office` entity it is, or
 * null when none is held), and the content ids that show it. The people who decided, wrote, signed or carried it out are
 * the event's participants, read beside the act and never its actor. Its date is the event's `when` (R3). "The same act"
 * is the event's equality, an `ACT-` alias resolved (`events.eventForAct`). Before T33 the first determination of an act
 * minted an `ACT-` id with a description and a date (K171 (6)); those rows read as recorded, and an id no member has yet
 * aliased to an event reads `act_unaliased: true` and is never determined again until one does. No `ACT-` id is minted.
 *
 * THE RECORD OBJECT (R17). Each determination is a `CONF-` bundle promoted through `promotion`, with history, audit and
 * export like a finding; its document states the act, the standards with their outcomes, the comparison, the pinned
 * findings and the questions. It is never edited: a correction is a new determination that supersedes it (R7), and a
 * step registered with promotion refuses any other write of a determination (R13).
 *
 * REACHED as `conformanceOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. At creation it creates its tables and declares them to record-core's
 * purge (K23), registers its step with promotion (R13, R17) and its listener with reevaluation's `onBasisChanged`
 * (R10). `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record        `allocId`, `transact`, `bundleInfo`, `declarePurge`; `stampInstant`.
 *   membership    `sight`, `existenceAct`, `projectAuthority`, `positionalMember`, `inSight`; `viewerPredicate`,
 *                 `noSuchProject` (its R78: R1's `NO_SUCH_PROJECT`, minted there with its one row, N274).
 *   promotion     `promote`, `registerStep` (R6, R17).
 *   content       `contentRow`, `passageNotice` (R1's evidence, R10); `passageText` (its R46: R21's `text`, N362).
 *   inquiry       `supersededBy`, `stateHistory` (R10); `contradictionLink` (its R48: R12, R21; N345).
 *   strength      `inquiryStrength` (R9).
 *   reevaluation  `onBasisChanged` (R10).
 *   publication   `publishedEditionsOf` (R2, R9, R10; its R37).
 *   standards     `standardRead`, `inForceAt` (R1, R3, R9, R10); `noSuchStandard` (its R17: R1's `NO_SUCH_STANDARD`).
 *   contradiction `candidatesFor` (R21: the two sides of the candidate a contradiction inquiry took up; N345).
 *   events       `readEvent`, `eventForAct` (R25, R26); `noSuchEvent` its one answer to an absent or unseen event.
 *   entities     `readEntity` (R25: whether the actor's entity is an `office`).
 *   officeEntityOf `({role, body})` → the `office` entity seeded for that office (the bridge, instance-setup R50), or
 *                null; wired by the composition root (as local-facts' `officeOf`). Absent, no office entity is held.
 *   now           the clock for the instants it writes, an ISO string (default: the wall clock, to the second).
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`bundle_id`, `object_type`, its R37), through
 * membership's viewer predicate over a determination's project (R11, R15). */

import { recordOf, stampInstant, instantOrder } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, Membership, noSuchProject } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { contentOf } from "../content/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { strengthOf } from "../strength/index.mjs";
import { reevaluationOf } from "../reevaluation/index.mjs";
import { publicationOf } from "../publication/index.mjs";
import { standardsOf, noSuchStandard } from "../standards/index.mjs";
import { contradictionOf } from "../contradiction/index.mjs";
import { entitiesOf } from "../entities/index.mjs";
import { eventsOf, noSuchEvent } from "../events/index.mjs";
import { localDay } from "../civil-time/index.mjs";
import { isMachineIdentity, proposalLabel, normalizeType, deriveInquiryTitle, idPattern } from "../record-grammar/index.mjs";
import { CONFORMANCE_CHECKS, refusal } from "./checks.mjs";
import { CONFORMANCE_TABLES, migrateConformance } from "./schema.mjs";

export { CONFORMANCE_CHECKS } from "./checks.mjs";
export { CONFORMANCE_SCHEMA, CONFORMANCE_TABLES } from "./schema.mjs";

/** R1, R4: the three outcomes, each given per standard by the member. */
export const OUTCOMES = Object.freeze(["compliant", "noncompliant", "unclear"]);
/** R1: a comparison row's reading. */
export const READINGS = Object.freeze(["aligns", "diverges", "open"]);
/** R8: the keys no input or answer carries. */
export const SIGNIFICANCE_KEYS = Object.freeze(["significance", "severity", "priority", "urgency", "rank", "score"]);
/** R7: the longest reason a supersession carries. */
export const REASON_MAX = 500;
/** R11: the most determinations one page lists. */
export const DETERMINATIONS_PAGE_MAX = 200;
/** The most of each part one determination or comparison carries (bounds, so every write and read is bounded). */
export const LIMITS = Object.freeze({ findings: 50, standards: 50, rows: 200, questions: 20, evidence: 50 });
/** The longest text of one part (a description, a row's `requires` or `did`, a question), in characters. */
export const TEXT_MAX = 4000;
/** R12: the sentence every proposal is answered with. */
export const PROPOSAL_SAYS = "This is a comparison, not a determination: it sets out what the standards require and what "
  + "was done, and it never states whether the act complied. Only a member's determination records that.";
/** R10: the sentence beside the flag. */
export const FLAG_SAYS = "This is a notice: something this determination rests on changed. The determination and its "
  + "outcomes are unchanged until a member supersedes it.";
/** R22: the longest cause statement, in characters. */
export const CAUSE_MAX = 2000;
/** R22: the sentence a determination with no cause reads. */
export const CAUSE_NOT_ESTABLISHED = "cause not established";
/** R22: the keys no determination carries: a recommendation is a proposed action, recorded by `actions`. */
export const RECOMMENDATION_KEYS = Object.freeze(["recommendation", "policy"]);
/** R21: the sentence every answer of `comparisonFacts` carries. */
export const FACTS_SAY = "These are facts the record holds, as the two sides of the question state them: what one side "
  + "says the standard requires, and what the other says was done. They are the record's, not an outcome: whether the "
  + "act complied is a member's determination.";
/** R9: the sentence beside `outcomes_differ` (DEC-84 item 3): a statement, with no duty. */
export const OUTCOMES_DIFFER_SAYS = "The outcomes differ from one standard to another. Each is the member's, given per "
  + "standard, and none is composed into one verdict.";

/** R25: the event roles read beside the act as who took part in it (K1465), never as its actor. */
export const ACT_ROLES = Object.freeze(["decider", "author", "signatory", "implementer"]);
/** R25: the sentence beside those participants. */
export const PARTICIPANTS_SAY = "These are the people the record states took part in the act (who decided, wrote, signed "
  + "or carried it out), each with what attests it. The actor is the office; they are never the actor, and nothing about "
  + "them changes the outcomes.";
/** R25: the sentence an actor with no office entity carries. */
export const NO_OFFICE_ENTITY = "no office entity is held for this role and body, so the actor stands as the office's "
  + "role and body only";
/** R26: the sentence an actor recorded before T33 carries (no actor then carried an entity). */
export const ACTOR_BEFORE_ENTITIES = "this actor was recorded before an act's office carried an entity";
/** R26: the sentence an act no member has yet linked to an event carries. */
export const UNALIASED_SAYS = "This act was recorded before acts were events, and no event is linked to it yet. It reads "
  + "as recorded; a member links it to its event (events' aliasAct) before it is determined again.";

const ACT_RE = idPattern("ACT");
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const text = (v) => (typeof v === "string" && v.trim() && v.length <= TEXT_MAX ? v.trim() : null);
const isDate = (v) => typeof v === "string" && DATE_RE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`))
  && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;
const q = (s) => `"${String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'")}"`;
const oneLine = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").trim();
const safeJson = (s, dflt = null) => { try { return s == null ? dflt : JSON.parse(s); } catch { return dflt; } };
const rand = (n) => Math.random().toString(36).slice(2, 2 + n).padEnd(n, "0");

/* R8: every key anywhere in `v` (objects and lists, nested) named one of SIGNIFICANCE_KEYS, compared lower-cased; the
   walk is bounded, and a value past the bound is not read further (the input's own bounds refuse it first). */
function significanceKeys(v, found = new Set(), depth = 0) {
  if (depth > 12 || found.size > 20) return found;
  if (Array.isArray(v)) { for (const x of v.slice(0, 500)) significanceKeys(x, found, depth + 1); return found; }
  if (isObj(v))
    for (const [k, x] of Object.entries(v).slice(0, 200)) {
      if (SIGNIFICANCE_KEYS.includes(String(k).toLowerCase())) found.add(k);
      significanceKeys(x, found, depth + 1);
    }
  return found;
}

/* R22: every key anywhere in `v` named one of RECOMMENDATION_KEYS, compared lower-cased, bounded as R8's walk is. */
function recommendationKeys(v, found = new Set(), depth = 0) {
  if (depth > 12 || found.size > 20) return found;
  if (Array.isArray(v)) { for (const x of v.slice(0, 500)) recommendationKeys(x, found, depth + 1); return found; }
  if (isObj(v))
    for (const [k, x] of Object.entries(v).slice(0, 200)) {
      if (RECOMMENDATION_KEYS.includes(String(k).toLowerCase())) found.add(k);
      recommendationKeys(x, found, depth + 1);
    }
  return found;
}

/* R12: whether a proposal names an outcome anywhere (an `outcome` or `outcomes` key, at any depth). */
function namesOutcome(v, depth = 0) {
  if (depth > 12) return false;
  if (Array.isArray(v)) return v.slice(0, 500).some((x) => namesOutcome(x, depth + 1));
  if (isObj(v))
    return Object.entries(v).slice(0, 200).some(([k, x]) =>
      ["outcome", "outcomes", "verdict"].includes(String(k).toLowerCase()) || namesOutcome(x, depth + 1));
  return false;
}

/* The answer's view of one strength axis: its state and grade, never composed with another axis (DEC-44). */
const axisOf = (a) => (isObj(a) ? { state: a.state ?? null, grade: a.grade ?? null } : null);

export class Conformance {
  #deps;
  #writing = new Set();   // R13, R17: the determination ids this module is promoting now

  constructor({ storage, record, membership, promotion, host = null, content = null, inquiry = null, strength = null,
                reevaluation = null, publication = null, standards = null, contradiction = null, events = null,
                entities = null, officeEntityOf = null, now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, content, inquiry, strength, reevaluation, publication, standards, contradiction, events, entities };
    this.officeEntityOf = typeof officeEntityOf === "function" ? officeEntityOf : null;
    this.now = typeof now === "function" ? now : () => stampInstant("second");
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get content() { return this.#deps.content ||= contentOf(this.#deps.host); }
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  get strength() { return this.#deps.strength ||= strengthOf(this.#deps.host); }
  get reevaluation() { return this.#deps.reevaluation ||= reevaluationOf(this.#deps.host); }
  get publication() { return this.#deps.publication ||= publicationOf(this.#deps.host); }
  get standards() { return this.#deps.standards ||= standardsOf(this.#deps.host); }
  get contradiction() { return this.#deps.contradiction ||= contradictionOf(this.#deps.host); }
  get events() { return this.#deps.events ||= eventsOf(this.#deps.host); }
  get entities() { return this.#deps.entities ||= entitiesOf(this.#deps.host); }

  migrate() { migrateConformance(this.sql); }

  #rows(sql, ...a) { return [...this.sql.exec(sql, ...a)]; }
  #one(sql, ...a) { for (const r of this.sql.exec(sql, ...a)) return r; return null; }
  #when() { const w = this.now(); return typeof w === "string" && w ? w : stampInstant("second"); }

  /* ===================================================================== *
   * THE REFUSALS THE ACTS SHARE (R1's head, R8, R15)
   * ===================================================================== */

  /* R1, R13: an empty or machine author. */
  #refuseMachine(author) {
    /* DEC-49 REGION is-determination-member */
    if (!str(author) || isMachineIdentity(author))
      return refusal("MACHINE_CANNOT_DETERMINE", "a determination is a member's judgment; this act names no member "
        + "author, or a machine credential. A machine may prepare a comparison (comparisonPropose). Nothing was written.",
        { author: str(author) });
    /* END DEC-49 REGION is-determination-member */
    return null;
  }

  /* R1, R15 (membership R44): a project the viewer sees only at existence answers membership's own refusal; one not
     seen, absent or not a project, one answer: membership's `noSuchProject` (its R78, N274), whose row is its own. */
  #projectRefusal(project, viewer) {
    const id = str(project);
    const existence = id ? this.membership.existenceAct(id, viewer) : null;
    if (existence) return existence;
    const info = id ? this.record.bundleInfo(id) : null;
    if (!info || normalizeType(info.type) !== "project" || this.membership.sight(id, viewer) !== Membership.SIGHT_FULL)
      return noSuchProject(id);
    return null;
  }

  /* R1: the author has joined the project (membership R55), translated to this module's code in one line (K171 (11)).
     An author naming no member (the founder's session included) has not joined. */
  #participantRefusal(project, author) {
    const member = this.membership.positionalMember(null, author);
    const denied = member ? this.membership.projectAuthority(project, author, "joined", "determine") : true;
    /* DEC-49 REGION is-project-joined */
    if (denied)
      return refusal("DETERMINATION_NOT_A_PARTICIPANT", "only a member who has joined the project records its determinations. "
        + "Nothing was written.", { project, author: str(author) });
    /* END DEC-49 REGION is-project-joined */
    return null;
  }

  /* The bounds every determination and comparison keeps (LIMITS). `of` names what the part belongs to when it is not
     the act or the determination itself (R22's cause). */
  #sizeRefusal(parts, of = null) {
    for (const [part, v] of Object.entries(parts)) {
      const n = Array.isArray(v) ? v.length : 0;
      /* DEC-49 REGION is-within-bounds */
      if (n > LIMITS[part])
        return refusal("DETERMINATION_TOO_LARGE", `${n} ${part}${of ? ` of the ${of}` : ""} is more than one carries (at `
          + `most ${LIMITS[part]}). Nothing was written.`, { part, count: n, max: LIMITS[part], ...(of ? { of } : {}) });
      /* END DEC-49 REGION is-within-bounds */
    }
    return null;
  }

  /* R8: no significance, severity, priority, urgency, rank or score, anywhere in the input. */
  #refuseSignificance(input) {
    const keys = [...significanceKeys(input)];
    /* DEC-49 REGION is-significance-absent */
    if (keys.length)
      return refusal("SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT", `the input carries ${keys.join(", ")}: whether and how much a `
        + "breach matters is a member's judgment made with the consequences in front of them, and this module records "
        + "none. Nothing was written.", { keys });
    /* END DEC-49 REGION is-significance-absent */
    return null;
  }

  /* R22: a cause, when one is given, is a statement of the member's own with evidence the author may see; a cause not
     yet shown stays in the working inquiry and never enters the determination. Absent (undefined or null) is no cause.
     Answers `{ok, cause}` (cause null when none) or the refusal, in R22's order. */
  #causeRefusal(cause, author) {
    if (cause === undefined || cause === null) return { ok: true, cause: null };
    const c = isObj(cause) ? cause : {};
    const statement = typeof c.statement === "string" ? c.statement.trim() : "";
    /* DEC-49 REGION is-cause-stated */
    if (!statement || statement.length > CAUSE_MAX)
      return refusal("CAUSE_UNSTATED", `a cause is stated as text of your own, of at most ${CAUSE_MAX} characters; this `
        + `${statement ? `is ${statement.length}` : "states none"}. Nothing was written.`, { max: CAUSE_MAX });
    /* END DEC-49 REGION is-cause-stated */
    const list = Array.isArray(c.evidence) ? c.evidence : typeof c.evidence === "string" ? [c.evidence] : [];
    const ids = list.map(str);
    const unseen = ids.filter((cid) => {
      if (!cid) return true;
      let row = null;
      try { row = this.content.contentRow(cid); } catch { row = null; }
      return !row || !this.membership.inSight(row.bundle_id, author);
    });
    /* DEC-49 REGION is-cause-evidenced */
    if (!ids.length || unseen.length)
      return refusal("CAUSE_NOT_EVIDENCED", ids.length
        ? "the cause names evidence you may not see, or that the record does not hold. A cause not yet shown stays in "
          + "the question where it is worked out. Nothing was written."
        : "the cause names no evidence. A cause not yet shown stays in the question where it is worked out, and the "
          + "determination says the cause is not established. Nothing was written.",
        { unresolved: unseen.filter(Boolean).slice(0, 20) });
    /* END DEC-49 REGION is-cause-evidenced */
    return { ok: true, cause: { statement, evidence: [...new Set(ids)] } };
  }

  /* R22: no recommendation or policy, anywhere in the input: a recommendation is a proposed action, recorded by
     `actions`, never a policy position held here. */
  #refuseRecommendation(input) {
    const keys = [...recommendationKeys(input)];
    /* DEC-49 REGION is-recommendation-absent */
    if (keys.length)
      return refusal("RECOMMENDATION_IS_AN_ACTION", `the input carries ${keys.join(", ")}: a determination records what `
        + "was required, what was done and why, never what should be done. Propose an action instead. Nothing was "
        + "written.", { keys });
    /* END DEC-49 REGION is-recommendation-absent */
    return null;
  }

  /* R12, R21 (inquiry R48): a contradiction inquiry the viewer may see, and the candidate it took up. Absent, unseen
     and a plain inquiry are one answer. */
  #contradictionInquiry(id, viewer) {
    const iid = str(id);
    let info = null, link = null;
    try { info = iid ? this.record.bundleInfo(iid) : null; } catch { info = null; }
    const seen = !!info && normalizeType(info.type) === "inquiry" && this.membership.inSight(iid, viewer);
    if (seen) { try { link = this.inquiry.contradictionLink(iid); } catch { link = null; } }
    /* DEC-49 REGION is-contradiction-inquiry-seen */
    if (!seen || !isObj(link) || !str(link.candidate))
      return refusal("NO_SUCH_CONTRADICTION_INQUIRY", "no question you may see answers to that id as one taken up from "
        + "a contradiction. One you may not see answers exactly as one that does not exist. Nothing was written.",
        { contradiction: iid });
    /* END DEC-49 REGION is-contradiction-inquiry-seen */
    return { ok: true, inquiry: iid, candidate: str(link.candidate), resolution: isObj(link.resolution) ? link.resolution : null };
  }

  /* ===================================================================== *
   * THE PARTS OF A DETERMINATION (R1–R4, R6, R7)
   * ===================================================================== */

  /* R25, R26, then R1's ACT_INCOMPLETE: the act `{event, actor: {role, body, entity_id?}, evidence}`. `event` (or a
     pre-T33 `id`) may be an `ACT-` id, resolved through `events.eventForAct`: aliased, it is its event; not, it is
     `ACT_NOT_AN_EVENT` when this project recorded it and an absent event otherwise. With `supersedes` and no act, the act
     is the predecessor's (R7); a pre-T33 act named by its `ACT-` id alone takes the actor and evidence it was recorded
     with. The event is read as `viewer` reads it (`NO_SUCH_EVENT`, absent and unseen alike, events' one answer). An
     `entity_id` given is an `office` entity or `ACTOR_NOT_AN_OFFICE`; absent, it is the office entity seeded for that
     role and body (`officeEntityOf`), or null, stated so on the read. */
  #actOf(act, project, supersedes, viewer) {
    let a = isObj(act) ? act : null;
    if (!a && str(supersedes)) {
      const prev = this.#one(`SELECT * FROM determinations WHERE determination_id=? AND project_id=?`, str(supersedes), project);
      if (prev) a = { event: prev.act_event ?? prev.act_id, evidence: safeJson(prev.act_evidence, []),
                      actor: { role: prev.act_role, body: prev.act_body, ...(prev.act_entity ? { entity_id: prev.act_entity } : {}) } };
    }
    a = a || {};
    const incomplete = (part, detail, extra = {}) => {
      /* DEC-49 REGION is-act-complete */
      const missing = { part, ...extra };
      return refusal("ACT_INCOMPLETE", `${detail} The act names its event, the office that did it and the content that `
        + "shows it. Nothing was written.", missing);
      /* END DEC-49 REGION is-act-complete */
    };
    const named = str(a.event) ?? str(a.id);
    /* DEC-49 REGION is-act-event-named */
    if (!named)
      return refusal("ACT_NO_EVENT", "the act names no event: a government act is the event that records what was done. "
        + "Nothing was written.", { part: "event" });
    /* END DEC-49 REGION is-act-event-named */
    let eventId = named;
    if (ACT_RE.test(named)) {
      let f = null;
      try { f = this.events.eventForAct(named); } catch { f = null; }
      const recorded = this.#one(`SELECT * FROM determinations WHERE act_id=? AND project_id=? ORDER BY determination_id DESC
                                  LIMIT 1`, named, project);
      if (!f || !f.found || !str(f.event_id)) {
        if (!recorded) return noSuchEvent(named, { act: named });
        /* DEC-49 REGION is-act-aliased */
        return refusal("ACT_NOT_AN_EVENT", `${named} was recorded before acts were events, and no event is linked to it `
          + "yet. A member links it to its event first. Nothing was written.", { act: named });
        /* END DEC-49 REGION is-act-aliased */
      }
      eventId = f.event_id;
      if (recorded && a.actor === undefined && a.evidence === undefined)
        a = { ...a, evidence: safeJson(recorded.act_evidence, []),
              actor: { role: recorded.act_role, body: recorded.act_body,
                       ...(recorded.act_entity ? { entity_id: recorded.act_entity } : {}) } };
    }
    let read = null;
    try { read = this.events.readEvent({ eventId, viewer }); } catch { read = null; }
    if (!read || read.ok === false || !read.found || !isObj(read.event)) return noSuchEvent(named);
    const ev = read.event;
    const actor = isObj(a.actor) ? a.actor : {};
    let entity = null;
    if (actor.entity_id !== undefined && actor.entity_id !== null) {
      entity = str(actor.entity_id);
      /* DEC-49 REGION is-actor-office */
      if (!this.#isOffice(entity))
        return refusal("ACTOR_NOT_AN_OFFICE", `${String(actor.entity_id).slice(0, 60)} is not an office entity: the actor `
          + "is the office, and the people who took part are the event's participants. Nothing was written.",
          { entity_id: entity });
      /* END DEC-49 REGION is-actor-office */
    }
    const role = text(actor.role), body = text(actor.body);
    if (!role || !body)
      return incomplete("actor", "the act names the office that did it by its official role and body, never by a person.");
    const ev0 = Array.isArray(a.evidence) ? a.evidence.map(str) : [];
    if (!ev0.length || ev0.some((x) => !x)) return incomplete("evidence", "the act names the content that shows it.");
    const unheld = [...new Set(ev0)].filter((cid) => { try { return !this.content.contentRow(cid); } catch { return true; } });
    if (unheld.length)
      return incomplete("evidence", "the act names content the record does not hold.", { unresolved: unheld.slice(0, 20) });
    if (!entity && this.officeEntityOf) {
      let found = null;
      try { found = str(this.officeEntityOf({ role, body })); } catch { found = null; }
      if (found && this.#isOffice(found)) entity = found;
    }
    return { ok: true, act: { event: ev.event_id, kind: ev.kind ?? null, when: ev.when ?? null, why: ev.why ?? null,
                              actor: { role, body, entity_id: entity }, evidence: [...new Set(ev0)] } };
  }

  /* R25: whether `id` names an `office` entity (an absent one is not). */
  #isOffice(id) {
    if (!id) return false;
    let r = null;
    try { r = this.entities.readEntity({ entityId: id, viewer: "class:daemon" }); } catch { r = null; }
    return !!(r && r.found !== false && isObj(r.entity) && r.entity.kind === "office");
  }

  /* The act as recorded (R9, R25, R26); with `seen` (R24), an evidence content id the viewer may not see leaves the list.
     From T33 it is `{id, event, actor: {role, body, entity_id, entity_why?}, evidence, when}`, `when` the event's as the
     author read it. A pre-T33 act keeps its description, date and period; aliased, `event` is its event, otherwise null
     with `act_unaliased: true` and the sentence saying so. */
  #actView(r, seen = null) {
    const all = safeJson(r.act_evidence, []);
    const evidence = seen ? seen.contents(all) : all;
    const actor = { role: r.act_role, body: r.act_body, entity_id: r.act_entity ?? null,
                    ...(r.act_entity ? {} : { entity_why: r.act_event ? NO_OFFICE_ENTITY : ACTOR_BEFORE_ENTITIES }) };
    if (r.act_event) return { id: r.act_id, event: r.act_event, actor, evidence, when: safeJson(r.act_when, null) };
    let f = null;
    try { f = this.events.eventForAct(r.act_id); } catch { f = null; }
    const event = f && f.found && str(f.event_id) ? f.event_id : null;
    return { id: r.act_id, event, actor, evidence, when: null, description: r.act_description, at: r.act_at ?? null,
             period: r.act_at ? null : { from: r.act_from, to: r.act_to },
             ...(event ? {} : { act_unaliased: true, act_says: UNALIASED_SAYS }) };
  }

  /* R25 (R24): the act's event as `viewer` reads it, with its participants in ACT_ROLES labelled as who took part; null
     when the viewer sees none of it (`seen` notes the withholding), or when the act names no event (R26). A participant
     events withholds from the viewer is left out whole, noted by comparing with the machine's read (only the flag says
     so). */
  #eventRead(eventId, viewer, seen) {
    if (!eventId) return null;
    let r = null;
    try { r = this.events.readEvent({ eventId, viewer }); } catch { r = null; }
    if (!r || r.ok === false || !r.found || !isObj(r.event)) { seen.withheld = true; return null; }
    const e = r.event;
    const took = (x) => (Array.isArray(x.participants) ? x.participants : [])
      .filter((p) => isObj(p) && ACT_ROLES.includes(p.role) && !p.superseded);
    const parts = took(e).map((p) => ({ entity_id: p.entity_id, role: p.role,
      attestation: (e.attestations || []).find((x) => x.attestation_id === p.attestation_id) || null,
      grades: p.grades ?? null }));
    let all = null;
    try { all = this.events.readEvent({ eventId, viewer: "class:daemon" }); } catch { all = null; }
    if (all && all.found && isObj(all.event) && took(all.event).length > parts.length) seen.withheld = true;
    return { id: e.event_id, kind: e.kind, status: e.status ?? null, when: e.when ?? null, ...(e.why ? { why: e.why } : {}),
             attestations: Array.isArray(e.attestations) ? e.attestations : [], participants: parts,
             participants_say: PARTICIPANTS_SAY };
  }

  /* R24 (K903 (4), DEC-36): one read's sight. Each filter keeps what `viewer` may see and leaves the rest out whole (no
     id, no placeholder, no count), noting that something was withheld; the read then states `out_of_view: true`, and
     nothing more. An id or content id the record does not hold (a proposal's free words) is authored, and stands. */
  #sight(viewer) {
    const self = this;
    return {
      withheld: false,
      sees(id) {
        if (self.membership.inSight(id, viewer)) return true;
        let info = null;
        try { info = self.record.bundleInfo(id); } catch { info = null; }
        if (!info) return true;
        this.withheld = true;
        return false;
      },
      seesContent(cid) {
        let row = null;
        try { row = self.content.contentRow(cid); } catch { row = null; }
        if (!row || self.membership.inSight(row.bundle_id, viewer)) return true;
        this.withheld = true;
        return false;
      },
      contents(list) { return (Array.isArray(list) ? list : []).filter((cid) => this.seesContent(cid)); },
      mark(answer) { return this.withheld ? { ...answer, out_of_view: true } : answer; },
    };
  }

  /* R3: the days a standard is read at: the act event's `when` on its local day, or each end of a band in its zone (the
     end exclusive). An end the `when` does not state (an upper bound's start; a `when` placed nowhere or undetermined)
     is `{date: null, why}`, read as undetermined. */
  static datesOf(act) {
    const w = act.when;
    const nowhere = (why) => [{ date: null, why }];
    if (w === null || w === undefined)
      return nowhere(`the act's event is placed nowhere${act.why ? ` (${act.why})` : ": no attestation of it is dated"}`);
    if (!isObj(w)) return nowhere(`the act's event's date is undetermined${act.why ? ` (${act.why})` : ""}`);
    const day = (instant, back = false) => {
      if (typeof instant !== "string" || !w.zone) return null;
      const t = Date.parse(instant);
      if (Number.isNaN(t)) return null;
      const at = new Date(back ? t - 1000 : t).toISOString().replace(/\.\d{3}Z$/, "Z");
      try { const d = localDay(at, w.zone); return typeof d === "string" ? d : null; } catch { return null; }
    };
    if (["day", "minute", "second"].includes(w.precision) && typeof w.value === "string" && isDate(w.value.slice(0, 10)))
      return [{ date: w.value.slice(0, 10), why: null }];
    if (w.precision === "upper_bound") {
      const end = typeof w.value === "string" && isDate(w.value.slice(0, 10)) ? w.value.slice(0, 10) : day(w.end, true);
      return [{ date: null, why: "the act's event is held only as on or before a date, so its start is not stated" },
              end ? { date: end, why: null } : { date: null, why: "the act's event's latest date is not stated" }];
    }
    const from = day(w.start), to = day(w.end, true);
    return [from ? { date: from, why: null } : { date: null, why: "the start of the act's event's band is not stated" },
            to ? { date: to, why: null } : { date: null, why: "the end of the act's event's band is not stated" }];
  }

  /* R2: each finding, pinned to a ratified edition of `project` (publication R37). An item is an id or
     `{finding, version?, case?, edition?}`; of the editions left, the latest edition of the last case is pinned. */
  #pinFindings(findings, project) {
    const list = Array.isArray(findings) ? findings : [];
    /* DEC-49 REGION is-finding-named */
    if (!list.length)
      return refusal("NO_FINDINGS", "a determination rests on at least one published finding (R14). Nothing was written.");
    /* END DEC-49 REGION is-finding-named */
    const pins = [], seen = new Set();
    for (const item of list) {
      const f = isObj(item) ? { finding: str(item.finding ?? item.id), version: str(item.version),
                                 case: str(item.case), edition: item.edition == null ? null : Number(item.edition) }
                            : { finding: str(item), version: null, case: null, edition: null };
      let items = [];
      if (f.finding) {
        let r = null;
        try { r = this.publication.publishedEditionsOf({ finding: f.finding, version: f.version, project }); } catch { r = null; }
        items = r && r.ok !== false && Array.isArray(r.items) ? r.items : [];
        items = items.filter((i) => i.project === project && (!f.case || i.case === f.case)
                                    && (f.edition == null || i.edition === f.edition));
      }
      /* DEC-49 REGION is-finding-published */
      if (!items.length)
        return refusal("FINDING_NOT_PUBLISHED", `${String(f.finding ?? "a finding named").slice(0, 80)} is not a finding `
          + "this project has published in a ratified case edition. A finding published only by another project, or not "
          + "at all, is not one. Nothing was written.", { finding: f.finding });
      /* END DEC-49 REGION is-finding-published */
      const pick = items.reduce((best, i) => (!best || i.case > best.case || (i.case === best.case && i.edition > best.edition)
        ? i : best), null);
      if (seen.has(f.finding)) continue;
      seen.add(f.finding);
      pins.push({ finding: f.finding, case: pick.case, edition: pick.edition, version_sha: pick.version_sha ?? null,
                  role: pick.role ?? null, frozen: pick.strength ?? null });
    }
    return { ok: true, pins };
  }

  /* R1, R3, R4: the standards, each read through `standards.inForce` at the act's dates; the outcome is checked later,
     in R1's order (OUTCOME_UNKNOWN after ROWS_INCOMPLETE). */
  #readStandards(standards, act, viewer) {
    const list = Array.isArray(standards) ? standards : [];
    /* DEC-49 REGION is-standard-named */
    if (!list.length)
      return refusal("NO_STANDARDS", "a determination measures the act against at least one standard the record holds "
        + "(R14). Nothing was written.");
    /* END DEC-49 REGION is-standard-named */
    const out = [], byId = new Map();
    for (const item of list) {
      const id = isObj(item) ? str(item.standard ?? item.id) : str(item);
      const outcome = isObj(item) ? item.outcome : undefined;
      let read = null;
      try { read = id ? this.standards.standardRead({ id, viewer }) : null; } catch { read = null; }
      /* R1 (standards R17): one answer, standards' own, whatever the read said. */
      if (!read || read.ok === false) return noSuchStandard(id);
      const answers = Conformance.datesOf(act).map((d) => (d.date ? this.#inForce(id, d.date, viewer)
                                                                  : { date: null, answer: "undetermined", why: d.why }));
      const not = answers.find((x) => x.answer === "not_in_force");
      /* DEC-49 REGION is-standard-in-force */
      if (not)
        return refusal("STANDARD_NOT_IN_FORCE", `${id} was not in force on ${not.date}${not.why ? ` (${not.why})` : ""}. `
          + "Nothing was written.", { standard: id, date: not.date });
      /* END DEC-49 REGION is-standard-in-force */
      const und = answers.find((x) => x.answer !== "in_force");
      if (byId.has(id)) { byId.get(id).outcomes.push(outcome); continue; }
      const s = { standard: id, outcome, outcomes: [outcome], in_force: und ? "undetermined" : "in_force",
                  in_force_why: und ? (und.date ? `on ${und.date}: ${und.why ?? "the record does not decide it"}` : und.why) : null };
      byId.set(id, s);
      out.push(s);
    }
    return { ok: true, standards: out };
  }

  /* R3: standards R20's answer (`{state, why, standard, version}`) as a word and why. A refusal or an unreadable answer
     is undetermined, never in force. */
  #inForce(id, date, viewer) {
    let r = null;
    try { r = this.standards.inForceAt({ standard: id, date, viewer }); } catch { r = null; }
    const ok = isObj(r) && r.ok !== false;
    const answer = ok && ["in_force", "not_in_force", "undetermined"].includes(r.state) ? r.state : "undetermined";
    return { date, answer, why: ok ? (r.why ?? null) : (isObj(r) ? (r.detail ?? r.reason ?? null) : "standards did not answer") };
  }

  /* R1: every standard has a row, and every row states what the standard requires, what was done and its reading. */
  #readRows(rows, standards) {
    const list = Array.isArray(rows) ? rows : [];
    const named = new Set(standards.map((s) => s.standard));
    const out = [];
    const incomplete = (detail, extra = {}) => {
      /* DEC-49 REGION is-comparison-complete */
      const where = { ...extra };
      return refusal("ROWS_INCOMPLETE", `${detail} Each standard named has a row stating what it requires, what was `
        + "done and its reading. Nothing was written.", where);
      /* END DEC-49 REGION is-comparison-complete */
    };
    for (const [i, r] of list.entries()) {
      const row = isObj(r) ? r : {};
      const standard = str(row.standard), requires = text(row.requires), did = text(row.did);
      const reading = READINGS.includes(row.reading) ? row.reading : null;
      if (!standard || !named.has(standard))
        return incomplete(`row ${i} names no standard this determination names.`, { row: i });
      if (!requires || !did || !reading)
        return incomplete(`row ${i} states ${[!requires && "what the standard requires", !did && "what was done",
          !reading && `a reading (${READINGS.join(", ")})`].filter(Boolean).join(", ")}: each is required.`, { row: i });
      const content = Array.isArray(row.content) ? row.content.map(str).filter(Boolean).slice(0, LIMITS.evidence)
        : str(row.content) ? [str(row.content)] : [];
      out.push({ standard, requires, did, reading, content });
    }
    const bare = standards.find((s) => !out.some((r) => r.standard === s.standard));
    if (bare) return incomplete(`${bare.standard} has no row: each standard named is compared.`, { standard: bare.standard });
    return { ok: true, rows: out };
  }

  /* R6: the questions, each `{question, inquiry?}`: an inquiry the author may see, or a new one opened in the act. */
  #readQuestions(questions, outcomes, author) {
    const list = Array.isArray(questions) ? questions : [];
    const out = [];
    const bad = (detail, extra = {}) => {
      /* DEC-49 REGION is-question-named */
      const which = { ...extra };
      return refusal("UNCLEAR_NO_QUESTION", `${detail} Each question is sent back to an inquiry the author may see, or `
        + "to a new one opened with this determination. Nothing was written.", which);
      /* END DEC-49 REGION is-question-named */
    };
    for (const [i, x] of list.entries()) {
      const item = isObj(x) ? x : { question: x };
      const question = text(item.question);
      if (!question) return bad(`question ${i} states no question.`, { question: i });
      const inquiry = str(item.inquiry);
      if (inquiry) {
        const info = this.record.bundleInfo(inquiry);
        if (!info || normalizeType(info.type) !== "inquiry" || !this.membership.inSight(inquiry, author))
          return bad(`question ${i} names no inquiry you may see.`, { question: i });
      }
      out.push({ question, inquiry });
    }
    if (outcomes.includes("unclear") && !out.length)
      return bad("an unclear outcome names at least one open question, each sent back to an inquiry.");
    return { ok: true, questions: out };
  }

  /* R7: `supersedes` names an earlier determination of the same act in the same project, not yet superseded, with a
     reason: an absent one is `CONFORMANCE_NO_REASON`, one over REASON_MAX characters or not text
     `CONFORMANCE_BAD_REASON` (N233, K264; R23: this module's own codes, never progressions' `NO_REASON`/`BAD_REASON`). */
  #supersession(supersedes, reason, act, project, viewer) {
    const id = str(supersedes);
    if (!id) return { ok: true, prev: null };
    const prev = this.#one(`SELECT * FROM determinations WHERE determination_id=?`, id);
    if (!prev || prev.project_id !== project || this.membership.sight(prev.project_id, viewer) !== Membership.SIGHT_FULL)
      return noSuchDetermination(id, { supersedes: id });
    /* R7, R25: the same act is the same event, an `ACT-` alias resolved; a predecessor whose act no member has linked
       to an event is no act this one can be shown to be. */
    const prevEvent = this.#eventOfRow(prev);
    /* DEC-49 REGION is-same-act */
    if (act.event !== prevEvent)
      return refusal("SUPERSEDES_ANOTHER_ACT", `${id} is a determination of ${prev.act_id}, and this names ${act.event}. `
        + "Nothing was written.", { supersedes: id, act: act.event, predecessor_act: prevEvent ?? prev.act_id });
    /* END DEC-49 REGION is-same-act */
    const why = typeof reason === "string" ? reason.trim() : reason == null ? "" : null;
    /* DEC-49 REGION is-reason-given */
    if (why === "")
      return refusal("CONFORMANCE_NO_REASON", "superseding a determination says why it is superseded; this names no reason. "
        + "Nothing was written.", { supersedes: id, max: REASON_MAX });
    /* END DEC-49 REGION is-reason-given */
    /* DEC-49 REGION is-reason-stated */
    if (why === null || why.length > REASON_MAX)
      return refusal("CONFORMANCE_BAD_REASON", `superseding a determination says why, as text of at most ${REASON_MAX} characters. `
        + "Nothing was written.", { supersedes: id, max: REASON_MAX });
    /* END DEC-49 REGION is-reason-stated */
    /* R7, R20: superseded at most once; the successor is in the same project, which the viewer sees in full. */
    const by = this.#one(`SELECT superseded_by FROM determination_supersessions WHERE superseded=?`, id);
    if (by) return determinationSuperseded(id, by.superseded_by, { supersedes: id });
    return { ok: true, prev, reason: why };
  }

  /* R7, R11, R26: the event a determination's act is, an `ACT-` id resolved through its alias; null for one not aliased. */
  #eventOfRow(r) {
    if (r.act_event) return r.act_event;
    if (!ACT_RE.test(String(r.act_id ?? ""))) return r.act_id ?? null;
    let f = null;
    try { f = this.events.eventForAct(r.act_id); } catch { f = null; }
    return f && f.found && str(f.event_id) ? f.event_id : null;
  }

  /* ===================================================================== *
   * R1–R8, R13, R14, R16, R17: determine
   * ===================================================================== */

  /** R1–R8: a member's determination that `act` is compliant, noncompliant or unclear against each named standard,
   *  resting on findings `project` has published. Refusals in R1's order, then R12's proposal and R7's supersession. The
   *  determination and every inquiry it opens land together or not at all (R6). */
  determine(input = {}) {
    const { project = null, act = null, findings = null, standards = null, rows = null, questions = null,
            supersedes = null, reason = null, proposal = null, cause = null, author = null } = isObj(input) ? input : {};
    const viewer = input && input.viewer != null ? input.viewer : author;
    const byMachine = this.#refuseMachine(author);
    if (byMachine) return byMachine;
    const pid = str(project);
    const unseen = this.#projectRefusal(pid, viewer);
    if (unseen) return unseen;
    const notJoined = this.#participantRefusal(pid, author);
    if (notJoined) return notJoined;
    const large = this.#sizeRefusal({ findings, standards, rows, questions,
                                      evidence: isObj(act) ? act.evidence : null })
      || this.#sizeRefusal({ evidence: isObj(cause) && Array.isArray(cause.evidence) ? cause.evidence : null }, "cause");
    if (large) return large;
    const a = this.#actOf(act, pid, supersedes, viewer);
    if (!a.ok) return a;
    const f = this.#pinFindings(findings, pid);
    if (!f.ok) return f;
    const s = this.#readStandards(standards, a.act, viewer);
    if (!s.ok) return s;
    const r = this.#readRows(rows, s.standards);
    if (!r.ok) return r;
    for (const x of s.standards) {
      const outcomes = [...new Set(x.outcomes)];
      /* DEC-49 REGION is-outcome-stated */
      if (outcomes.length !== 1 || !OUTCOMES.includes(outcomes[0]))
        return refusal("OUTCOME_UNKNOWN", `${x.standard} carries ${outcomes.length > 1 ? "two outcomes" : "no outcome"}: `
          + `each standard carries one of ${OUTCOMES.join(", ")}. Nothing was written.`, { standard: x.standard });
      /* END DEC-49 REGION is-outcome-stated */
      x.outcome = outcomes[0];
    }
    const qs = this.#readQuestions(questions, s.standards.map((x) => x.outcome), author);
    if (!qs.ok) return qs;
    const sig = this.#refuseSignificance(input);
    if (sig) return sig;
    const why = this.#causeRefusal(cause, author);
    if (!why.ok) return why;
    const rec = this.#refuseRecommendation(input);
    if (rec) return rec;
    const drew = str(proposal);
    if (drew && !this.#one(`SELECT proposal_id FROM comparison_proposals WHERE proposal_id=? AND project_id=?`, drew, pid))
      return refuseNoSuchComparison(drew);
    const sup = this.#supersession(supersedes, reason, a.act, pid, viewer);
    if (!sup.ok) return sup;
    return this.#write({ project: pid, act: a, pins: f.pins, standards: s.standards, rows: r.rows,
                         questions: qs.questions, sup, proposal: drew, cause: why.cause, author: str(author), viewer });
  }

  /* R6, R16, R17: one outer transaction: each new inquiry, then the determination's own promotion, then this module's
     rows. A refused promotion refuses the whole act, and nothing is written, no id spent (record-core R32). */
  #write({ project, act, pins, standards, rows, questions, sup, proposal, cause, author, viewer }) {
    const at = this.#when();
    const year = at.slice(0, 4);
    let id = null;
    const out = this.record.transact(() => {
      id = `${this.record.allocId("CONF", year).id}-determination`;
      const theAct = { ...act.act, id: act.act.event };
      const qs = [];
      for (const x of questions) {
        if (x.inquiry) { qs.push({ ...x, opened: false }); continue; }
        const opened = this.#openInquiry(x.question, id, project, author, viewer, at);
        if (!opened.ok) return { ...opened, question: x.question };
        qs.push({ question: x.question, inquiry: opened.bundleId, opened: true });
      }
      this.#writing.add(id);
      let p;
      try {
        p = this.promotion.promote({ bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${rand(4)}`, author,
          files: [{ path: "bundle.md", text: determinationDoc({ id, project, act: theAct, pins, standards, rows,
                                                                    questions: qs, sup, proposal, cause, author,
                                                                    at }) }],
          meta: { object_type: "determination", current_state: "recorded", created: at, last_updated: at },
          actorIdentity: author, actorViewer: viewer });
      } finally { this.#writing.delete(id); }
      if (!p || !p.ok) return p || { ok: false, reason: "PROMOTION_FAILED" };
      this.sql.exec(
        `INSERT INTO determinations (determination_id, project_id, act_id, act_minted, act_description, act_role, act_body,
           act_at, act_from, act_to, act_evidence, proposal_id, supersedes, reason, author, at, act_event, act_entity,
           act_when) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        id, project, theAct.event, 0, "", theAct.actor.role, theAct.actor.body, null, null, null,
        JSON.stringify(theAct.evidence), proposal, sup.prev ? sup.prev.determination_id : null,
        sup.prev ? sup.reason : null, author, at, theAct.event, theAct.actor.entity_id,
        JSON.stringify(theAct.when ?? null));
      standards.forEach((x, i) => this.sql.exec(
        `INSERT INTO determination_standards (determination_id, ord, standard_id, outcome, in_force, in_force_why)
         VALUES (?,?,?,?,?,?)`, id, i, x.standard, x.outcome, x.in_force, x.in_force_why));
      rows.forEach((x, i) => this.sql.exec(
        `INSERT INTO determination_rows (determination_id, ord, standard_id, requires, did, reading, content)
         VALUES (?,?,?,?,?,?,?)`, id, i, x.standard, x.requires, x.did, x.reading, JSON.stringify(x.content)));
      pins.forEach((x, i) => this.sql.exec(
        `INSERT INTO determination_findings (determination_id, ord, finding_id, case_id, edition, version_sha, role, frozen)
         VALUES (?,?,?,?,?,?,?,?)`, id, i, x.finding, x.case, x.edition, x.version_sha, x.role,
        x.frozen ? JSON.stringify(x.frozen) : null));
      qs.forEach((x, i) => this.sql.exec(
        `INSERT INTO determination_questions (determination_id, ord, question, inquiry_id, opened, project_id)
         VALUES (?,?,?,?,?,?)`, id, i, x.question, x.inquiry, x.opened ? 1 : 0, project));
      if (sup.prev)
        this.sql.exec(`INSERT INTO determination_supersessions (superseded, superseded_by, reason, author, at)
                       VALUES (?,?,?,?,?)`, sup.prev.determination_id, id, sup.reason, author, at);
      if (proposal)
        this.sql.exec(`INSERT INTO comparison_proposal_uses (proposal_id, determination_id, at) VALUES (?,?,?)`,
                      proposal, id, at);
      if (cause)
        this.sql.exec(`INSERT INTO determination_causes (determination_id, statement, evidence, author, at)
                       VALUES (?,?,?,?,?)`, id, cause.statement, JSON.stringify(cause.evidence), author, at);
      return { ok: true };
    });
    if (!out || !out.ok) return out;
    return { ...this.determinationRead({ id, viewer }), wrote: true };
  }

  /* R6: a new inquiry, `open`, titled from the question, through promotion (so inquiry's own check runs), recorded in
     `project` by this module's rows and named so in its Session Log. */
  #openInquiry(question, determination, project, author, viewer, at) {
    const id = `${this.record.allocId("INQ", at.slice(0, 4)).id}-question`;
    const title = deriveInquiryTitle(question) ?? question.slice(0, 120);
    const md = ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: ${q(title)}`,
      "current_state: open", "prior_state: null", `created: ${q(at)}`, `last_updated: ${q(at)}`,
      "produced_by:", "  mode: human", "  capability_tier: session", "references: []", "state_history: []",
      "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
      "surfaced_by: human", 'disposition_reason: ""', "---", "", "## Question", "", question, "",
      "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
      `### Session ${at} | Opened | ${oneLine(author)}`,
      `Changes: opened by the determination ${determination} in the project ${project}, whose outcome is unclear on this `
      + "question.", "", "## Review Notes", ""].join("\n");
    return this.promotion.promote({ bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${rand(4)}`, author,
      files: [{ path: "bundle.md", text: md }],
      meta: { object_type: "inquiry", current_state: "open", created: at, last_updated: at },
      actorIdentity: author, actorViewer: viewer });
  }

  /* ===================================================================== *
   * R9, R10, R15: the reads
   * ===================================================================== */

  /* R15: the determination's row when the viewer sees its project in full, else null (absent and unseen alike). */
  #seen(id, viewer) {
    const r = str(id) ? this.#one(`SELECT * FROM determinations WHERE determination_id=?`, str(id)) : null;
    return r && this.membership.sight(r.project_id, viewer) === Membership.SIGHT_FULL ? r : null;
  }

  /** R9: one determination: the act, each standard with its outcome, whether it was in force and its rows (with any
   *  disagreement stated, R4), each finding's pinned edition with its frozen pair beside its live pair per axis (never
   *  composed), the questions, the author and time, the supersession links and R10's flag. THE ONE SHAPE (K248), which
   *  `consequences`, `actions`, `filings` and `escalation` read, and of which each R11 item is a subset:
   *    {ok, id, project, act: {id, event, actor: {role, body, entity_id, entity_why?}, evidence, when} (R25; a pre-T33
   *     act also carries description, at and period, and `act_unaliased`, `act_says` when no event is linked, R26),
   *     event: null | {id, kind, status, when, why?, attestations, participants: [{entity_id, role, attestation,
   *     grades}], participants_say} (R25: who took part, never the actor), outcomes: [{standard,
   *     outcome}], standards: [{standard, outcome, in_force, in_force_why, rows: [{requires, did, reading, content}],
   *     disagreement}], findings: [{finding, case, edition, version_sha, role, frozen, live}], questions: [{question,
   *     inquiry?, opened}], author, at, supersedes, reason, superseded_by, live, proposal,
   *     basis_changed: null | {causes: [{kind, subject, source, since, detail?, affects?}], says},
   *     cause: null | {statement, evidence: [content id]}, cause_says: null | "cause not established",
   *     outcomes_differ, outcomes_differ_says: null | sentence, out_of_view?: true}
   *  R24 (DEC-36): what the viewer may not see is withheld whole: the act's event, a participant of it, a pinned
   *  finding, a standard with its outcome, rows and disagreement, a question's `inquiry` key, an evidence content id of
   *  the act, a row or the cause, and a cause of the flag whose subject is one; `out_of_view: true` says only that
   *  something was. What is authored on the determination stands: `outcomes_differ` is over every standard (DEC-84 item
   *  3: a statement, with no duty), and `basis_changed` stands while any cause is left. */
  determinationRead({ id = null, viewer = null } = {}) {
    const r = this.#seen(id, viewer);
    if (!r) return noSuchDetermination(str(id));
    const did = r.determination_id;
    const seen = this.#sight(viewer);
    const rows = this.#rows(`SELECT * FROM determination_rows WHERE determination_id=? ORDER BY ord LIMIT ?`,
                            did, LIMITS.rows);
    const all = this.#rows(`SELECT * FROM determination_standards WHERE determination_id=? ORDER BY ord LIMIT ?`,
                           did, LIMITS.standards);
    const differ = new Set(all.map((s) => s.outcome)).size > 1;
    const standards = all.filter((s) => seen.sees(s.standard_id)).map((s) => {
      const mine = rows.filter((x) => x.standard_id === s.standard_id);
      const readings = mine.map((x) => x.reading);
      /* R4: the member's outcome stands; a disagreement with the rows is stated beside it, never corrected. */
      const disagreement = s.outcome === "noncompliant" && readings.length && readings.every((x) => x === "aligns")
        ? "every row reads aligns, and the member's outcome is noncompliant"
        : s.outcome === "compliant" && readings.includes("diverges")
          ? "a row reads diverges, and the member's outcome is compliant" : null;
      return { standard: s.standard_id, outcome: s.outcome, in_force: s.in_force, in_force_why: s.in_force_why,
               rows: mine.map((x) => ({ requires: x.requires, did: x.did, reading: x.reading,
                                        content: seen.contents(safeJson(x.content, [])) })),
               disagreement };
    });
    const findings = this.#rows(`SELECT * FROM determination_findings WHERE determination_id=? ORDER BY ord LIMIT ?`,
                                did, LIMITS.findings).filter((x) => seen.sees(x.finding_id)).map((x) => {
      let live = null;
      try { live = this.strength.inquiryStrength({ id: x.finding_id, viewer }); } catch { live = null; }
      const frozen = safeJson(x.frozen, null);
      return { finding: x.finding_id, case: x.case_id, edition: Number(x.edition), version_sha: x.version_sha,
               role: x.role, frozen: frozen ? { capture: axisOf(frozen.capture), connection: axisOf(frozen.connection),
                                                testimony: axisOf(frozen.testimony) } : null,
               live: live && live.ok !== false ? { capture: axisOf(live.capture), connection: axisOf(live.connection),
                                                   testimony: axisOf(live.testimony) } : null };
    });
    /* A question's text is authored on the determination and stands; an inquiry the viewer may not see loses its key. */
    const questions = this.#rows(`SELECT * FROM determination_questions WHERE determination_id=? ORDER BY ord LIMIT ?`,
                                 did, LIMITS.questions).map((x) => ({ question: x.question,
      ...(x.inquiry_id && !seen.sees(x.inquiry_id) ? {} : { inquiry: x.inquiry_id }), opened: x.opened === 1 }));
    const by = this.#one(`SELECT * FROM determination_supersessions WHERE superseded=?`, did);
    const flag = this.#flag(r, viewer);
    if (flag.withheld) seen.withheld = true;
    const act = this.#actView(r, seen);
    const event = this.#eventRead(act.event, viewer, seen);
    const cz = this.#one(`SELECT statement, evidence FROM determination_causes WHERE determination_id=?`, did);
    const cause = cz ? { statement: cz.statement,
                         evidence: seen.contents(safeJson(cz.evidence, []).slice(0, LIMITS.evidence)) } : null;
    return seen.mark({ ok: true, id: did, project: r.project_id, act, event,
             outcomes: standards.map((s) => ({ standard: s.standard, outcome: s.outcome })), standards, findings,
             questions, author: r.author, at: r.at, supersedes: r.supersedes ?? null, reason: r.reason ?? null,
             superseded_by: by ? by.superseded_by : null, live: !by, proposal: r.proposal_id ?? null,
             basis_changed: flag.causes.length ? { causes: flag.causes, says: FLAG_SAYS } : null,
             cause, cause_says: cause ? null : CAUSE_NOT_ESTABLISHED,
             outcomes_differ: differ, outcomes_differ_says: differ ? OUTCOMES_DIFFER_SAYS : null });
  }

  /* R10: every cause standing on the determination: what reevaluation told (its R8, recorded as it came), and what the
     record answers now (a finding reopened or superseded since, or published in a later edition of its case; a
     standard superseded; a newer capture of a text or evidence passage that does not carry it, or may not). Each once.
     R24: a cause whose subject `viewer` may not see (a finding, a standard, a passage) is left out whole, its detail with
     it, as is every cause of a standard whose read is refused; a superseding standard the viewer may not see takes the
     cause's `detail` with it. `withheld` says something was left out. Answers `{causes, withheld}`. */
  #flag(r, viewer) {
    const causes = [], keys = new Set();
    const seen = this.#sight(viewer);
    const visible = (c) => (c.kind === "passage" ? seen.seesContent(c.subject) : seen.sees(c.subject));
    const add = (c) => {
      const k = `${c.kind}|${c.subject}|${c.source}`;
      if (keys.has(k) || !visible(c)) return;
      keys.add(k);
      causes.push(c);
    };
    /* reevaluation names a finding's supersession `supersession` (its R2); the record's answer below names it
       `superseded`, so the one cause is named once, in this module's word. The notice is stored as it was told. */
    for (const x of this.#rows(`SELECT * FROM determination_flags WHERE determination_id=? ORDER BY at, kind, subject
                                LIMIT 200`, r.determination_id))
      add({ kind: x.kind, subject: x.subject,
            source: x.kind === "finding" && x.source === "supersession" ? "superseded" : x.source,
            since: x.since || null, detail: x.detail ?? null });
    const pins = this.#rows(`SELECT * FROM determination_findings WHERE determination_id=? ORDER BY ord LIMIT ?`,
                            r.determination_id, LIMITS.findings);
    for (const p of pins) {
      if (!seen.sees(p.finding_id)) continue;
      let by = [];
      try { by = this.inquiry.supersededBy(p.finding_id) || []; } catch { by = []; }
      if (by.length) add({ kind: "finding", subject: p.finding_id, source: "superseded", since: null,
                           detail: `${p.finding_id} is superseded` });
      let h = null;
      try { h = this.inquiry.stateHistory(p.finding_id); } catch { h = null; }
      const reopened = (h && h.ok && Array.isArray(h.transitions) ? h.transitions : [])
        .filter((t) => ["open", "surfaced"].includes(t.to) && t.from && t.from !== t.to && t.at
                       && instantOrder(t.at, r.at) >= 0).pop();
      if (reopened) add({ kind: "finding", subject: p.finding_id, source: "reopened", since: reopened.at,
                          detail: `${p.finding_id} was reopened` });
      let eds = null;
      try { eds = this.publication.publishedEditionsOf({ finding: p.finding_id, project: r.project_id }); } catch { eds = null; }
      const later = (eds && Array.isArray(eds.items) ? eds.items : [])
        .filter((i) => i.case === p.case_id && i.edition > Number(p.edition)).pop();
      if (later) add({ kind: "finding", subject: p.finding_id, source: "edition", since: null,
                       detail: `${p.case_id} is published at edition ${later.edition}; this determination pins edition `
                             + `${p.edition}` });
    }
    const passages = new Set(safeJson(r.act_evidence, []));
    for (const s of this.#rows(`SELECT standard_id FROM determination_standards WHERE determination_id=? ORDER BY ord
                                LIMIT ?`, r.determination_id, LIMITS.standards)) {
      if (!seen.sees(s.standard_id)) continue;
      let read = null;
      try { read = this.standards.standardRead({ id: s.standard_id, viewer }); } catch { read = null; }
      if (!read || read.ok === false) { seen.withheld = true; continue; }
      const next = str(read.superseded_by);
      if (next)
        add({ kind: "standard", subject: s.standard_id, source: "superseded", since: null,
              ...(this.membership.inSight(next, viewer) ? { detail: `${s.standard_id} is superseded by ${next}` }
                                                         : (seen.withheld = true, {})) });
      for (const t of (Array.isArray(read.text) ? read.text : []).slice(0, LIMITS.evidence))
        if (typeof t === "string") passages.add(t); else if (isObj(t) && str(t.content_id ?? t.id)) passages.add(str(t.content_id ?? t.id));
    }
    for (const cid of [...passages].slice(0, 2 * LIMITS.evidence)) {
      if (!seen.seesContent(cid)) continue;
      let n = null;
      try { n = this.content.passageNotice({ contentId: cid, viewer }); } catch { n = null; }
      if (n && n.ok !== false && n.newer && ["affected", "undetermined"].includes(n.affects))
        add({ kind: "passage", subject: cid, source: "newer_capture", since: null, affects: n.affects,
              detail: n.affects === "affected" ? "a newer capture of its document does not carry this passage"
                                               : "a newer capture of its document may not carry this passage" });
    }
    return { causes, withheld: seen.withheld };
  }

  /** R11: the determinations the filters admit, in id order, at most 200 a page (a lower `limit` honoured), `truncated`
   *  measured by reading one past; only those in projects the viewer sees in full (R15). */
  determinationsFor({ project = null, act = null, standard = null, finding = null, outcome = null, live = null,
                      after = null, limit = null, viewer = null } = {}) {
    const pid = str(project);
    if (pid) { const unseen = this.#projectRefusal(pid, viewer); if (unseen) return unseen; }
    const cap = Number.isInteger(Number(limit)) && Number(limit) >= 1
      ? Math.min(Number(limit), DETERMINATIONS_PAGE_MAX) : DETERMINATIONS_PAGE_MAX;
    const gate = viewerPredicate(viewer);
    const where = [`d.determination_id > ?`, `(${gate.sql})`], args = [str(after) ?? "", ...gate.args];
    if (pid) { where.push(`d.project_id = ?`); args.push(pid); }
    if (str(act)) {
      const ids = this.#actIds(str(act));
      where.push(`d.act_id IN (${ids.map(() => "?").join(",")})`);
      args.push(...ids);
    }
    if (str(standard)) {
      where.push(`EXISTS (SELECT 1 FROM determination_standards s WHERE s.determination_id = d.determination_id
                          AND s.standard_id = ?)`);
      args.push(str(standard));
    }
    if (str(outcome)) {
      where.push(`EXISTS (SELECT 1 FROM determination_standards s WHERE s.determination_id = d.determination_id
                          AND s.outcome = ?)`);
      args.push(str(outcome));
    }
    if (str(finding)) {
      where.push(`EXISTS (SELECT 1 FROM determination_findings f WHERE f.determination_id = d.determination_id
                          AND f.finding_id = ?)`);
      args.push(str(finding));
    }
    if (live === true || live === "true" || live === "1")
      where.push(`NOT EXISTS (SELECT 1 FROM determination_supersessions x WHERE x.superseded = d.determination_id)`);
    const page = this.#rows(
      `SELECT d.* FROM determinations d JOIN bundles b ON b.bundle_id = d.project_id
        WHERE ${where.join(" AND ")} ORDER BY d.determination_id LIMIT ?`, ...args, cap + 1);
    const truncated = page.length > cap;
    /* R24: each item withholds whole what the viewer may not see and states `out_of_view: true` itself; the page never. */
    const items = page.slice(0, cap).map((r) => {
      const by = this.#one(`SELECT superseded_by FROM determination_supersessions WHERE superseded=?`, r.determination_id);
      const seen = this.#sight(viewer);
      return seen.mark({ id: r.determination_id, project: r.project_id, act: this.#actView(r, seen),
               outcomes: this.#rows(`SELECT standard_id, outcome FROM determination_standards WHERE determination_id=?
                                     ORDER BY ord LIMIT ?`, r.determination_id, LIMITS.standards)
                 .filter((s) => seen.sees(s.standard_id)).map((s) => ({ standard: s.standard_id, outcome: s.outcome })),
               findings: this.#rows(`SELECT finding_id, case_id, edition, version_sha, role FROM determination_findings
                                     WHERE determination_id=? ORDER BY ord LIMIT ?`, r.determination_id, LIMITS.findings)
                 .filter((f) => seen.sees(f.finding_id))
                 .map((f) => ({ finding: f.finding_id, case: f.case_id, edition: Number(f.edition),
                                version_sha: f.version_sha, role: f.role })),
               author: r.author, at: r.at, supersedes: r.supersedes ?? null,
               superseded_by: by ? by.superseded_by : null, live: !by });
    });
    return { ok: true, items, limit: cap, truncated, cursor: truncated ? items[items.length - 1].id : null };
  }

  /* R11, R26: the act ids that name the same act as `act`: the event an `ACT-` alias resolves to, and every pre-T33
     `ACT-` id this module holds that resolves to that event (bounded); an id not aliased names only itself. */
  #actIds(act) {
    let event = act;
    if (ACT_RE.test(act)) {
      let f = null;
      try { f = this.events.eventForAct(act); } catch { f = null; }
      if (!f || !f.found || !str(f.event_id)) return [act];
      event = f.event_id;
    }
    const out = new Set([act, event]);
    for (const r of this.#rows(`SELECT DISTINCT act_id FROM determinations WHERE act_event IS NULL AND act_id LIKE 'ACT-%'
                                ORDER BY act_id LIMIT 1000`))
      if (this.#eventOfRow(r) === event) out.add(r.act_id);
    return [...out];
  }

  /* ===================================================================== *
   * R12: the comparison proposed
   * ===================================================================== */

  /** R12: a comparison a machine prepared or a member suggested, stored apart from determinations, labelled with who
   *  made it and whether it is machine work, and answered with the sentence that it is not a determination. It carries
   *  rows and questions and never an outcome. It may name `contradiction`, the contradiction inquiry it came from
   *  (inquiry R48, N345): the proposal records the link, and still carries no outcome. */
  comparisonPropose(input = {}) {
    const { project = null, act = null, standards = null, rows = null, questions = null, proposer = null,
            contradiction = null } = isObj(input) ? input : {};
    const viewer = input && input.viewer != null ? input.viewer : proposer;
    const pid = str(project);
    const unseen = this.#projectRefusal(pid, viewer);
    if (unseen) return unseen;
    const large = this.#sizeRefusal({ standards, rows, questions, evidence: isObj(act) ? act.evidence : null });
    if (large) return large;
    /* DEC-49 REGION is-proposal-outcomeless */
    if (namesOutcome(input))
      return refusal("PROPOSAL_CANNOT_DETERMINE", "a comparison carries rows and questions and never an outcome: only a "
        + "member's determination records whether the act complied. Nothing was written.");
    /* END DEC-49 REGION is-proposal-outcomeless */
    const sig = this.#refuseSignificance(input);
    if (sig) return sig;
    let from = null;
    if (contradiction !== null && contradiction !== undefined) {
      from = this.#contradictionInquiry(contradiction, viewer);
      if (!from.ok) return from;
    }
    const a = isObj(act) ? act : {};
    /* R25: the act as proposed, `{event, actor, evidence}`, kept as given and judged only by a member's determination */
    const theAct = { event: str(a.event) ?? str(a.id),
                     actor: isObj(a.actor) ? { role: text(a.actor.role), body: text(a.actor.body),
                                               entity_id: str(a.actor.entity_id) } : null,
                     evidence: Array.isArray(a.evidence) ? a.evidence.map(str).filter(Boolean) : [] };
    const stds = (Array.isArray(standards) ? standards : []).map((x) => (isObj(x) ? str(x.standard ?? x.id) : str(x)))
      .filter(Boolean);
    const rs = (Array.isArray(rows) ? rows : []).filter(isObj).map((x) => ({
      standard: str(x.standard), requires: text(x.requires), did: text(x.did),
      reading: READINGS.includes(x.reading) ? x.reading : null,
      content: Array.isArray(x.content) ? x.content.map(str).filter(Boolean).slice(0, LIMITS.evidence) : [] }));
    const qs = (Array.isArray(questions) ? questions : []).map((x) => (isObj(x) ? x : { question: x }))
      .map((x) => ({ question: text(x.question), inquiry: str(x.inquiry) })).filter((x) => x.question);
    const at = this.#when();
    const who = str(proposer);
    let id = null;
    this.record.transact(() => {
      id = this.record.allocId("CMP", at.slice(0, 4)).id;
      this.sql.exec(`INSERT INTO comparison_proposals (proposal_id, project_id, act, standards, rows, questions, proposer,
                       machine, at) VALUES (?,?,?,?,?,?,?,?,?)`,
                    id, pid, JSON.stringify(theAct), JSON.stringify(stds), JSON.stringify(rs), JSON.stringify(qs), who,
                    proposalLabel(who, "comparison").machine_work ? 1 : 0, at);
      if (from)
        this.sql.exec(`INSERT INTO comparison_proposal_contradictions (proposal_id, inquiry_id, candidate, at)
                       VALUES (?,?,?,?)`, id, from.inquiry, from.candidate, at);
      return { ok: true };
    });
    return { ok: true, proposal: this.#proposalView(this.#one(`SELECT * FROM comparison_proposals WHERE proposal_id=?`, id),
                                                    viewer), wrote: true };
  }

  /** R12: one proposal, its label and the determinations that drew on it; absent, unseen and another project's alike. */
  comparisonRead({ id = null, viewer = null } = {}) {
    const r = str(id) ? this.#one(`SELECT * FROM comparison_proposals WHERE proposal_id=?`, str(id)) : null;
    if (!r || this.membership.sight(r.project_id, viewer) !== Membership.SIGHT_FULL) return refuseNoSuchComparison(id);
    return { ok: true, proposal: this.#proposalView(r, viewer) };
  }

  /* R12, R24: a proposal as `viewer` may see it. A standard the viewer may not see leaves `standards`, its rows with it;
     an evidence content id of the act or a row, and a question's `inquiry`, the same; a `contradiction` the viewer may
     not see is left out (not null) and the proposal states `out_of_view: true`. One naming none keeps `contradiction:
     null`. */
  #proposalView(r, viewer) {
    const label = proposalLabel(r.proposer ?? null, "comparison");
    const uses = this.#rows(`SELECT determination_id, at FROM comparison_proposal_uses WHERE proposal_id=?
                             ORDER BY determination_id LIMIT ?`, r.proposal_id, DETERMINATIONS_PAGE_MAX);
    const from = this.#one(`SELECT inquiry_id FROM comparison_proposal_contradictions WHERE proposal_id=?`, r.proposal_id);
    const seen = this.#sight(viewer);
    const act = safeJson(r.act, null);
    const hidden = new Set(safeJson(r.standards, []).filter((s) => !seen.sees(s)));
    const rows = safeJson(r.rows, []).filter((x) => !isObj(x) || !x.standard || (!hidden.has(x.standard) && seen.sees(x.standard)))
      .map((x) => (isObj(x) && Array.isArray(x.content) ? { ...x, content: seen.contents(x.content) } : x));
    const questions = safeJson(r.questions, []).map((x) => {
      if (!isObj(x) || !x.inquiry || seen.sees(x.inquiry)) return x;
      const { inquiry: _i, ...rest } = x;
      return rest;
    });
    const link = from ? (seen.sees(from.inquiry_id) ? { contradiction: from.inquiry_id } : {}) : { contradiction: null };
    return seen.mark({ id: r.proposal_id, project: r.project_id,
             act: isObj(act) ? { ...act, evidence: seen.contents(act.evidence) } : act,
             standards: safeJson(r.standards, []).filter((s) => !hidden.has(s)),
             rows, questions, proposer: r.proposer ?? null, label,
             machine_work: label.machine_work, at: r.at, says: PROPOSAL_SAYS,
             drawn_on_by: uses.map((u) => ({ determination: u.determination_id, at: u.at })), ...link });
  }

  /** R21 (N345; DEC-76 item 3, DEC-84 item 10): the rows a comparison may start from, as facts: `requires` from the
   *  side of the contradiction inquiry's candidate named `standardSide` (`a` or `b`, the member's, never defaulted) and
   *  `did` from the other, each with its source, content id, date and `text` (the passage's words, `#sideText`; N362),
   *  labelled the record's and never an outcome; and
   *  the question's resolution when it is concluded. R12's refusal applies. It writes nothing.
   *    {ok, wrote: false, contradiction, candidate, standard_side, rows: [{requires, did, origin: "record",
   *     machine_work: false}], resolution: null | {kind, …}, concluded, says} */
  comparisonFacts({ contradiction = null, standardSide = null, viewer = null } = {}) {
    const from = this.#contradictionInquiry(contradiction, viewer);
    if (!from.ok) return from;
    const side = typeof standardSide === "string" ? standardSide : null;
    /* DEC-49 REGION is-standard-side-named */
    if (side !== "a" && side !== "b")
      return refusal("STANDARD_SIDE_UNNAMED", "name which side of the question states what the standard requires, a or "
        + "b: the plane never chooses it. Nothing was written.", { contradiction: from.inquiry });
    /* END DEC-49 REGION is-standard-side-named */
    let listed = null;
    try { listed = this.contradiction.candidatesFor({ on: { candidate: from.candidate }, viewer }); } catch { listed = null; }
    const cand = listed && Array.isArray(listed.candidates)
      ? listed.candidates.find((x) => x && x.candidate === from.candidate) : null;
    /* A candidate whose two sides the viewer may not both see is no question they may see as one taken up from a
       contradiction (contradiction R10): one answer, which says nothing of an unseen side. */
    if (!cand || !isObj(cand.a) || !isObj(cand.b)) return this.#contradictionInquiry(null, viewer);
    const fact = (x) => ({ kind: x.kind ?? null, text: this.#sideText(x), note: x.note ?? null, source: x.source ?? null,
                           content_id: x.content_id ?? null, ref: x.ref ?? null, date: x.date ?? null,
                           doctype: x.doctype ?? null, capture_sha: x.capture_sha ?? null, stale: x.stale ?? null });
    const other = side === "a" ? "b" : "a";
    return { ok: true, wrote: false, contradiction: from.inquiry, candidate: from.candidate, standard_side: side,
             rows: [{ requires: fact(cand[side]), did: fact(cand[other]), origin: "record", machine_work: false }],
             resolution: from.resolution, concluded: !!from.resolution, says: FACTS_SAY };
  }

  /* R21 (N362, K569): a side's `text`. A side naming a content id (a leg or an extent) carries the passage's words as
     `content.passageText` answers them (its R46), `null` where it answers `null` (a stale row, text not held whole);
     a claim or stance side names no passage and keeps its claim's words as contradiction shows them. Asked only of a
     side this viewer already sees (the caller's R12 gate); a read that throws is `null`, never guessed. */
  #sideText(x) {
    const cid = str(x.content_id);
    if (!cid) return typeof x.text === "string" ? x.text : null;
    try { const t = this.content.passageText(cid); return typeof t === "string" ? t : null; } catch { return null; }
  }

  /* ===================================================================== *
   * R10: the notice reevaluation gives (its R8); R13, R17: the step promotion runs
   * ===================================================================== */

  /** R10: reevaluation's `onBasisChanged` listener. A finding's move flags every determination pinning it; a passage's
   *  newer capture (affected or undetermined) flags every determination whose act it evidences. Recorded once; the
   *  determination itself is not touched. */
  basisChanged(event) {
    if (!isObj(event) || !str(event.subject)) return { flagged: 0 };
    const kind = event.kind === "passage" ? "passage" : "finding";
    if (kind === "passage" && !["affected", "undetermined"].includes(event.affects)) return { flagged: 0 };
    const subject = str(event.subject);
    const ids = kind === "finding"
      ? this.#rows(`SELECT DISTINCT determination_id FROM determination_findings WHERE finding_id=?
                    ORDER BY determination_id LIMIT 1000`, subject)
      : this.#rows(`SELECT d.determination_id FROM determinations d, json_each(d.act_evidence) e WHERE e.value=?
                    ORDER BY d.determination_id LIMIT 1000`, subject);
    const at = this.#when();
    const source = str(event.source) ?? (kind === "passage" ? "newer_capture" : "changed");
    const since = str(event.since) ?? "";
    const detail = typeof event.detail === "string" ? event.detail.slice(0, 500) : null;
    this.record.transact(() => {
      for (const { determination_id } of ids)
        this.sql.exec(`INSERT INTO determination_flags (determination_id, kind, subject, source, since, detail, at)
                       VALUES (?,?,?,?,?,?,?) ON CONFLICT DO NOTHING`, determination_id, kind, subject, source, since,
                      detail, at);
      return { ok: true };
    });
    return { flagged: ids.length };
  }

  /** R13, R17 (promotion R39): a determination is written only by `determine`, and never revised: any other promotion
   *  of a `determination` (a raw `op=promote`, a revision) is refused. A migration replay is not asked. */
  check(c) {
    const type = normalizeType(c && c.promotedType);
    if (type !== "determination" || c.replay || this.#writing.has(c.bundleId)) return null;
    /* DEC-49 REGION is-determination-act */
    return refusal("DETERMINATION_ONLY_BY_ITS_ACT", "a determination is recorded by the determination act and never "
      + "revised: a correction is a new determination that supersedes it. Nothing was written.",
      { bundleId: c.bundleId ?? null });
    /* END DEC-49 REGION is-determination-act */
  }
}

/* R19, R20: each code's fixed fields; a caller's `extra` adds its own and never replaces one of these. */
const NO_SUCH_DETERMINATION_DETAIL = "no determination answers to that id here. One you may not see is answered exactly "
  + "as one that does not exist, so this is not a hint either way.";
const DETERMINATION_SUPERSEDED_DETAIL = "that determination has been superseded, and a determination is superseded once "
  + "and not acted on once superseded. The one that superseded it is the determination to use.";
const NO_SUCH_DETERMINATION_FIXED = ["ok", "reason", "code", "check", "translation", "determination", "detail"];
const DETERMINATION_SUPERSEDED_FIXED = [...NO_SUCH_DETERMINATION_FIXED, "superseded_by"];
const asId = (v) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 200) : null);
function ownFields(extra, fixed) {
  try {
    return extra && typeof extra === "object" && !Array.isArray(extra)
      ? Object.fromEntries(Object.entries(extra).filter(([k]) => !fixed.includes(k))) : {};
  } catch { return {}; }
}

/** R19 (N309, K275): the one answer to "no determination the caller may see answers to `determinationId`", absent and
 *  unseen alike (R9, R15). Every module that answers this condition answers through it; it writes nothing and never
 *  throws. `determination` is the id as asked (null when none); `detail` is fixed, the same for every caller. */
export function noSuchDetermination(determinationId, extra = null) {
  const own = ownFields(extra, NO_SUCH_DETERMINATION_FIXED);
  /* DEC-49 REGION is-determination-seen */
  const row = CONFORMANCE_CHECKS.NO_SUCH_DETERMINATION;
  return { ok: false, reason: "NO_SUCH_DETERMINATION", code: "NO_SUCH_DETERMINATION", check: row.check,
           translation: row.translation, determination: asId(determinationId), ...own,
           detail: NO_SUCH_DETERMINATION_DETAIL };
  /* END DEC-49 REGION is-determination-seen */
}

/** R20 (N309, N312, K275): the one answer to "the determination `determinationId` names has been superseded" (not live,
 *  R10). `superseded_by` is the determination that superseded it, as the caller passes it (null when the caller cannot
 *  read it). R7's second supersession and every later module's act on a superseded determination answer through it; it
 *  writes nothing and never throws. */
export function determinationSuperseded(determinationId, supersededBy = null, extra = null) {
  const own = ownFields(extra, DETERMINATION_SUPERSEDED_FIXED);
  /* DEC-49 REGION is-determination-live */
  const row = CONFORMANCE_CHECKS.DETERMINATION_SUPERSEDED;
  return { ok: false, reason: "DETERMINATION_SUPERSEDED", code: "DETERMINATION_SUPERSEDED", check: row.check,
           translation: row.translation, determination: asId(determinationId), superseded_by: asId(supersededBy),
           ...own, detail: DETERMINATION_SUPERSEDED_DETAIL };
  /* END DEC-49 REGION is-determination-live */
}

/* R18: the one "no such comparison" answer, absent, unseen and another project's alike. */
function refuseNoSuchComparison(id) {
  /* DEC-49 REGION is-comparison-seen */
  return refusal("NO_SUCH_COMPARISON", "no comparison answers to that id in this project. One you may not see answers "
    + "exactly as one that does not exist. Nothing was written.", { proposal: str(id) });
  /* END DEC-49 REGION is-comparison-seen */
}

/* R3, R17: the act event's `when` in words, as the author read it. */
function whenWords(w, why) {
  if (w === null || w === undefined) return `placed nowhere${why ? ` (${oneLine(why)})` : ""}`;
  if (!isObj(w)) return `its date undetermined${why ? ` (${oneLine(why)})` : ""}`;
  if (w.precision === "upper_bound") return `on or before ${w.value}${w.zone ? ` (${w.zone})` : ""}`;
  return `${w.precision === "day" || w.precision === "edtf" ? "in" : "at"} ${w.value}${w.zone ? ` (${w.zone})` : ""}`;
}

/* R17: the determination's own document, the record's word on it, as promotion stores it (history, audit, export). Its
   front matter carries the core fields every record document states; its body states every part in words. */
export function determinationDoc({ id, project, act, pins, standards, rows, questions, sup, proposal, cause = null, author,
                                   at }) {
  const title = `Determination: the ${oneLine(act.kind ?? "act")} ${act.event}`;
  const lines = ["---", `id: ${id}`, "object_type: determination", "schema: determination@1", `title: ${q(title)}`,
    "current_state: recorded", "prior_state: null", `created: ${q(at)}`, `last_updated: ${q(at)}`,
    `project: ${project}`, `act_id: ${act.id}`, `act_event: ${act.event}`, `author: ${q(author)}`,
    ...(sup && sup.prev ? [`supersedes: ${sup.prev.determination_id}`] : []),
    ...(proposal ? [`drew_on: ${proposal}`] : []),
    "produced_by:", "  mode: human", "  capability_tier: session", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "---", "",
    "## Act", "", `The ${oneLine(act.kind ?? "act")} ${act.event}, ${whenWords(act.when, act.why)}.`, "",
    `Done by the office ${oneLine(act.actor.role)}, ${oneLine(act.actor.body)}`
      + `${act.actor.entity_id ? ` (${act.actor.entity_id})` : ` (${NO_OFFICE_ENTITY})`}. Shown by: ${act.evidence.join(", ")}.`, "",
    "## Standards and Outcomes", "",
    ...standards.map((s) => `- ${s.standard}: ${s.outcome}${s.in_force === "undetermined"
      ? ` (whether it was in force is undetermined: ${oneLine(s.in_force_why)})` : ""}`), "",
    "## Comparison", "",
    ...rows.map((r) => `- ${r.standard} requires: ${oneLine(r.requires)}. Done: ${oneLine(r.did)}. Reading: ${r.reading}.`
      + (r.content.length ? ` Shown by: ${r.content.join(", ")}.` : "")), "",
    "## Findings", "",
    ...pins.map((p) => `- ${p.finding}, pinned at ${p.case} edition ${p.edition}${p.version_sha ? ` (${p.version_sha})` : ""}`),
    "", "## Open Questions", "",
    ...(questions.length ? questions.map((x) => `- ${oneLine(x.question)} (${x.inquiry})`) : ["None."]), "",
    "## Cause", "", ...(cause ? [oneLine(cause.statement), "", `Shown by: ${cause.evidence.join(", ")}.`]
                                : [`${CAUSE_NOT_ESTABLISHED[0].toUpperCase()}${CAUSE_NOT_ESTABLISHED.slice(1)}.`]), "",
    ...(sup && sup.prev ? ["## Supersedes", "", `${sup.prev.determination_id}: ${oneLine(sup.reason)}`, ""] : []),
    "## Session Log", "", `### Session ${at} | Determined | ${oneLine(author)}`,
    `Changes: determination recorded in ${project}.`, ""];
  return lines.join("\n");
}

const instances = new WeakMap();

/** K61: the one instance per host. At creation: its tables, their purge declaration (K23), its step with promotion
 *  (R13, R17) and its listener with reevaluation (R10). */
export function conformanceOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    c = new Conformance({ ...d, host, storage, record, membership, promotion });
    instances.set(host, c);
    c.migrate();
    record.declarePurge("conformance", CONFORMANCE_TABLES);
    promotion.registerStep("conformance", { check: (x) => c.check(x) });
    c.reevaluation.onBasisChanged("conformance", (e) => c.basisChanged(e));
  }
  return c;
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function conformanceOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return CONFORMANCE_TABLES.some((x) => x.name === name);
}

/** The module's ops (K3), as entries of the plane's op map (`plane`'s store, `src/plane/store.mjs`, spreads them).
 *  `author`, `viewer` are the control plane's stamps, read from the query after the body, so a caller's own copy never
 *  wins. */
export function conformanceOps(c, url, body) {
  const qp = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  const stamped = { author: qp("author"), viewer: qp("viewer") };
  return {
    determine: () => c.determine({ ...b, ...stamped }),
    determination: () => c.determinationRead({ id: qp("id") ?? b.id, viewer: qp("viewer") }),
    determinations: () => c.determinationsFor({ project: qp("project"), act: qp("act"), standard: qp("standard"),
                                                finding: qp("finding"), outcome: qp("outcome"), live: qp("live"),
                                                after: qp("after"), limit: qp("limit"), viewer: qp("viewer") }),
    comparisonpropose: () => c.comparisonPropose({ ...b, proposer: qp("author"), viewer: qp("viewer") }),
    comparison: () => c.comparisonRead({ id: qp("id") ?? b.id, viewer: qp("viewer") }),
    comparisonfacts: () => c.comparisonFacts({ contradiction: qp("contradiction") ?? b.contradiction ?? null,
                                               standardSide: qp("standardSide") ?? b.standardSide ?? null,
                                               viewer: qp("viewer") }),
  };
}
