/* standards — what a government act is measured against (requirements: `build/requirements/standards.md`; Functional
 * Architecture, Layer 2 Function 1). A standard is a statute, regulation, ordinance, court decision or order, adopted
 * policy or public commitment, held as content in the record: its citation, kind and issuer, its own words as captured
 * (content ids), where it comes from (a jurisdiction profile's `standard_sources`, or undetermined) and the period it
 * was in force. It answers which standards were in force at a date. It judges nothing about a government act
 * (`conformance` does) and nothing about a standard's merit (R12).
 *
 * A new module (K102, K171): nothing moves (its map, §1). A standard is a record document of type `standard` (R15),
 * `STD-<year>-NNNN-<kind>`, promoted through `promotion` outside any project (K171 (12)); `record-grammar` knows the
 * type (one state, `recorded`, no edges: N129). It is never edited: a correction is a new standard that supersedes
 * it, at most once (R4, R6). It is recorded with the declarer's reason, the member's own words on why the group
 * holds its government to it (R1, R10; DEC-88), never the proposer's `why`. Its registered check refuses every other
 * write of a standard (R11). The reads answer from this module's own tables (`./schema.mjs`), written once per act
 * and never updated (R14). A proposal (the Legal/Policy Lookup skill's work, or a member's suggestion) is stored apart
 * and labelled by `record-grammar`'s `proposalLabel(proposer, "standard")` (R9); a member's adoption records a
 * standard naming it (R10).
 *
 * No place is named here (R13): where a citation comes from is read from the active profiles' combined view
 * (`jurisdictions.combine` over record-core's `jurisdiction_profiles`), and a fact they do not supply is undetermined.
 *
 * REACHED as `standardsOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps` and returned to every later caller. At creation it creates its tables (R16), registers its check
 * with `promotion` (R39) and its tables with purge (R14). `deps`:
 *   record, membership, promotion, content   the modules it uses, through their factories on the same host unless a
 *                test passes its own (`content` is reached lazily, on first use).
 *   combine      `jurisdictions.combine` (default); a test passes its own, which resolves profiles it wrote by id.
 *   now          the module's clock, an ISO instant (default: the wall clock).
 *   events       `events`' instance, or a function answering it (R19, R20, R28: an event's `when`, through its
 *                `readEvent({eventId, viewer})`, events R26); `eventsOf(host)` by default (K1563 (1), K1574). Without
 *                one, an event bound or node answers undetermined, saying so, never a default.
 *   keyedStore   the store `acquisition.citationLookup` reads the group's key through (R25: `{credentials, env,
 *                governor}`), or a function answering it; absent, the keyed lookup answers that it is off.
 *   citationLookup, recognise   test seams: `acquisition.citationLookup` and `id-spaces.recogniseCitations` by default.
 *
 * T33 (T33-31; K1438, K1442, K1446, K1447, K1449): the module moved to layer 5. A declaration may name where the
 * standard sits in its law (R18, R19): its instrument key (composed only from profile data, `./instrument.mjs`), a
 * portion, the passages it requires, its copy, how current the copy is and what its period rests on. In force at a date
 * is R20's `inForceAt`, through `civil-time.validAt` over each version's period, bounded by adopted temporal relations
 * and by a codifier copy's lag; `inForce` stays its alias (Choices 18). Law relations, court links and treatment rows,
 * the citation resolver and the connection owner are `./law.mjs`'s. */

import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { normalizeType } from "../record-grammar/types.mjs";
import { proposalLabel } from "../record-grammar/labels.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { contentOf } from "../content/index.mjs";
import { combine as combineProfiles, SOURCE_KINDS } from "../../../jurisdictions/index.mjs";
import { validAt, localDay } from "../civil-time/index.mjs";
import { eventsOf } from "../events/index.mjs";
import { registerOwner, isRecordId } from "../connection-grammar/index.mjs";
import { citationLookup as acquisitionCitationLookup } from "../acquisition/index.mjs";
import { recogniseCitations } from "../idspaces.mjs";
import { STANDARDS_CHECKS, refusal } from "./checks.mjs";
import { STANDARDS_TABLES, migrateStandards } from "./schema.mjs";
import { instrumentKey, matchSource, referenceKey, sourceCopy, foldCite } from "./instrument.mjs";
import { LawRecords, LAW_RELATIONS, COURT_LINKS, TREATMENTS, CONNECTION_KINDS, CONNECTION_OWNER, IN_FORCE_METHOD,
         weakestCeiling } from "./law.mjs";

export { STANDARDS_CHECKS } from "./checks.mjs";
export { STANDARDS_SCHEMA, STANDARDS_TABLES } from "./schema.mjs";
export { instrumentKey, referenceKey } from "./instrument.mjs";
export { LAW_RELATIONS, COURT_LINKS, TREATMENTS, CONNECTION_KINDS, CONNECTION_OWNER, IN_FORCE_METHOD };

export const STANDARD = "standard";
/** R1, R12: the six kinds, `jurisdictions`' own list (its R23), never a copy: the whole vocabulary of a standard. */
export const STANDARD_KINDS = SOURCE_KINDS;
/** R7: the three answers of `inForce`. */
export const IN_FORCE_STATES = Object.freeze(["in_force", "not_in_force", "undetermined"]);
/** R1: a citation's bound; R9: a proposal's `why`; R8: a page; R2: the passages one standard's text names; the bound on
 *  a proposal's named act; R1: the declarer's reason, in characters (DEC-88). */
export const CITE_MAX = 200, WHY_MAX = 240, PAGE_MAX = 200, TEXTS_MAX = 50, ACT_MAX = 200, REASON_MAX = 2000;
/** R12: the fields each act takes. Anything else is refused by name, never ignored: a field silently dropped is a view
 *  the caller believes was recorded. */
const DECLARE_KEYS = Object.freeze(["cite", "kind", "issuer", "reason", "text", "period", "supersedes", "instrument",
                                    "portion", "requires", "copy", "current_through", "period_basis", "author", "viewer"]);
/** R19: a copy's statuses (`jurisdictions` R6). */
export const COPY_STATES = Object.freeze(["official", "codifier", "undetermined"]);
/** R21: the reverse index's page, clamped. */
export const FOR_LIMIT_MAX = 500, FOR_LIMIT_DEFAULT = 100;
/* R20: the viewer an internal read (no viewer named) asks `events` as: the machine's stamp (DEC-52). */
const INTERNAL_READER = "class:daemon";
/* R21: the most reference rows one reverse read scans; past it the answer says it is truncated. */
const SCAN_FOR = 5000;
const PROPOSE_KEYS = Object.freeze(["cite", "kind", "issuer", "text", "why", "act", "proposer", "viewer"]);
const ADOPT_KEYS = Object.freeze([...DECLARE_KEYS, "proposal"]);

const str = (v) => (typeof v === "string" ? v.trim() : "");
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const rand = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
/* A token the front matter holds bare; any other string is quoted, with no quote, backslash or line break. */
const TOKEN = /^[A-Za-z0-9][A-Za-z0-9._:\/-]{0,199}$/;
const q = (s) => `"${String(s).replace(/["\\\r\n]/g, " ")}"`;
const bare = (s) => (TOKEN.test(String(s)) ? String(s) : q(s));
/* A member's words kept whole in a body section: a line that would open a heading is set in by one space. */
const bodyText = (s) => String(s).trim().replace(/^#/gm, " #");

/* R1 (DEC-88): what is wrong with a declarer's reason, or null when it is one: a string with something other than white
   space in it, at most `REASON_MAX` characters. */
const reasonFault = (reason) =>
  reason === undefined || reason === null ? "carries no reason"
  : typeof reason !== "string" ? `carries a reason that is not text (${Array.isArray(reason) ? "a list" : typeof reason})`
  : !reason.trim() ? "carries a reason with nothing in it"
  : [...reason].length > REASON_MAX ? `carries a reason of ${[...reason].length} characters, over the ${REASON_MAX} kept`
  : null;

/** R1, R7: a calendar date, `YYYY-MM-DD`, that exists. */
export function isDate(v) {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** R7: a stated period against a date, with why, as R20 answers it with no event bound, relation or copy to read: the
 *  state is `civil-time.validAt`'s (`in`, `out`, undetermined). `not_in_force` only when a stated bound excludes the
 *  date; `undetermined` when a bound needed to decide is null; never a default. Bounds are inclusive. */
export function periodInForce(period, date) {
  const from = period ? period.from ?? null : null, to = period ? period.to ?? null : null;
  if (from !== null && date < from)
    return { state: "not_in_force", why: `the period in force starts ${from}, after ${date}` };
  if (to !== null && date > to)
    return { state: "not_in_force", why: `the period in force ended ${to}, before ${date}` };
  if (from !== null && to !== null)
    return { state: "in_force", why: `${date} lies within the period in force, ${from} to ${to}` };
  const missing = [from === null ? "when it came into force" : null, to === null ? "when it ceased to be in force" : null]
    .filter(Boolean).join(" or ");
  return { state: "undetermined",
           why: `the record does not state ${missing}, so whether it was in force on ${date} is undetermined` };
}

export class Standards {
  #writing = null;   // the standard this module is promoting, for its own check (R11)
  #law;              // R22–R28: `./law.mjs`, over this instance's internal reads

  constructor({ storage, record, membership, promotion, content = null, combine = combineProfiles, now = null,
                events = null, keyedStore = null, citationLookup = acquisitionCitationLookup,
                recognise = recogniseCitations } = {}) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.contentRef = content;
    this.combine = combine;
    this.eventsRef = events;
    this.keyedStoreRef = keyedStore;
    this.lookupFn = citationLookup;
    this.recognise = recognise;
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
    migrateStandards(this.sql);   // R16: the tables exist once the instance does, so no caller migrates (N220, N267)
    this.#law = new LawRecords(this.#internal());
  }

  #rows(qs, ...a) { return [...this.sql.exec(qs, ...a)]; }
  #one(qs, ...a) { const r = this.#rows(qs, ...a); return r.length ? r[0] : null; }
  get content() { return typeof this.contentRef === "function" ? this.contentRef() : this.contentRef; }
  get events() { return typeof this.eventsRef === "function" ? this.eventsRef() : this.eventsRef; }
  #when() { return stampInstant("second", Date.parse(this.now())); }

  /* The reads `./law.mjs` works through: this instance's tables and the modules it uses, never a copy of them. */
  #internal() {
    return {
      sql: this.sql, record: this.record, membership: this.membership,
      rows: (q, ...a) => this.#rows(q, ...a), one: (q, ...a) => this.#one(q, ...a),
      row: (id) => this.#row(id), texts: (id) => this.#texts(id), readable: (id, v) => this.#readable(id, v),
      content: () => this.content, when: () => this.#when(), nonce: () => rand(8),
      noSuchStandard, portionUnknown: (end, standard, portion) => portionUnknown(standard, portion, { end }), refuseNoId, refuseDateInvalid, refuseFieldUnknown, refuseReason: refuseLawReason,
      refuseNoSuchProposal, refuseProposalAdopted, refuseProposerUnnamed, refuseWhyInvalid,
      inForceAt: (a) => this.inForceAt(a), periodOf: (row) => this.#periodOf(row, null),
      eventDay: (event, edge, viewer) => this.#eventDay(event, edge, viewer),
      eventWhen: (event, viewer) => { const d = this.#eventDay(event, "start", viewer); return d.day ? d : null; },
      gradeOf: (ids) => weakestCeiling(ids.length ? this.content.standings(ids) : {}, ids), zone: () => this.#zone(),
      recognise: (t) => this.recognise(t),
      citationLookup: ({ text, viewer }) => this.lookupFn(
        (typeof this.keyedStoreRef === "function" ? this.keyedStoreRef() : this.keyedStoreRef) || {}, { text, viewer }),
    };
  }

  #texts(id) {
    return this.#rows(`SELECT content_id FROM standard_texts WHERE standard_id=? ORDER BY ord`, id).map((t) => t.content_id);
  }

  /* The zone a day is compared in: the view's `time_zone`. Two calendar days compared in one zone compare alike in
     every zone, so with none stated the days are compared in UTC and nothing depends on it. */
  #zone() {
    const { view } = this.#view();
    return view && view.time_zone && typeof view.time_zone.value === "string" ? view.time_zone.value : "UTC";
  }

  /** The module's tables (R14), created at construction (R16); kept, idempotent, for a caller that still calls it. */
  migrate() { migrateStandards(this.sql); }

  /* ===================================================================== *
   * R3: WHERE A CITATION COMES FROM
   * ===================================================================== */

  /* The active profiles' combined view (record-core R26, jurisdictions R12–R16), or why there is none. */
  #view() {
    const ids = this.record.getSetting("jurisdiction_profiles");
    if (!Array.isArray(ids) || !ids.length)
      return { view: null, why: "the instance has no active jurisdiction profile, so no source of standards is known" };
    const c = this.combine(ids);
    if (!c || !c.ok)
      return { view: null, why: "the instance's active jurisdiction profiles could not be combined ("
               + `${[...new Set(((c && c.errors) || []).map((e) => e.code))].join(", ") || "unreadable"}), so no source `
               + "of standards is known" };
    return { view: c.view, why: null };
  }

  /** R3: the citation against every `standard_sources` entry of the active profiles, in order. The first match gives
   *  the source; entries of different profiles that match and disagree are a fact the profiles withhold between them
   *  (jurisdictions R15: nothing chooses between profiles that disagree), so the answer is undetermined. A declared
   *  kind or issuer that differs from the match's is stated beside it, never corrected. Never throws. */
  sourceOf(cite, declared = {}) {
    const undetermined = (why, extra) => ({ state: "undetermined", why, ...(extra || {}) });
    const { view, why } = this.#view();
    if (!view) return undetermined(why);
    const entries = Array.isArray(view.standard_sources) ? view.standard_sources : [];
    if (!entries.length) return undetermined("the active jurisdiction profiles list no source of standards");
    const text = String(cite ?? "");
    const matches = entries.filter((e) => {
      try { return !!e.cite && new RegExp(e.cite.re, e.cite.flags || "").test(text); } catch { return false; }
    });
    if (!matches.length)
      return undetermined("the citation matches the citation form of no source the active jurisdiction profiles list; "
                          + "the standard is held all the same, and where it comes from is undetermined");
    const first = matches[0];
    const key = (e) => JSON.stringify([e.source, e.kind, e.issuer, e.level ?? null]);
    const disagree = matches.filter((m) => m.profile !== first.profile && key(m) !== key(first));
    if (disagree.length)
      return undetermined("the citation matches sources of different active jurisdiction profiles that disagree about "
                          + "it, and none is chosen between them, so where it comes from is undetermined",
                          { disagreeing: [first, ...disagree].map((e) => ({ profile: e.profile, source: e.source,
                            kind: e.kind, issuer: e.issuer, level: e.level ?? null, basis: e.basis })) });
    const level = typeof first.level === "string" && first.level ? first.level : "undetermined";
    const differs = [];
    for (const f of ["kind", "issuer"])
      if (str(declared[f]) && str(declared[f]) !== first[f])
        differs.push({ field: f, declared: str(declared[f]), source: first[f],
                       says: `recorded as declared; the matched source says ${f} '${first[f]}'` });
    return { state: "matched", source: first.source, kind: first.kind, issuer: first.issuer, level,
             ...(level === "undetermined" ? { level_why: "the matched source states no level" } : {}),
             profile: first.profile, basis: first.basis, ...(differs.length ? { differs } : {}) };
  }

  /* ===================================================================== *
   * THE REGISTERED CHECK (promotion R39): R11, R4 at the write
   * ===================================================================== */

  /** R11: a standard is written only by this module's R1 and R10, as a creation; every other promotion of one (a raw
   *  promotion, a revision) is refused. A replay (a restore of the record's own history) is admitted. */
  check(c) {
    const headType = c.head ? normalizeType(c.head.type) : null;
    if (c.promotedType !== STANDARD && headType !== STANDARD) return null;
    return this.#checkStandard(c);
  }

  #checkStandard(c) {
    if (c.replay || (c.creation && this.#writing !== null && c.bundleId === this.#writing)) return null;
    /* DEC-49 REGION is-standard-written-here */
    return refusal("STANDARD_WRITTEN_ELSEWHERE", c.head
      ? "a standard is never edited: a correction is a new standard that supersedes it. Nothing was written."
      : "a standard is recorded by a member's act, never by a raw promotion. Nothing was written.",
      { bundleId: c.bundleId ?? null });
    /* END DEC-49 REGION is-standard-written-here */
  }

  /* ===================================================================== *
   * DECLARING (R1–R4, R6)
   * ===================================================================== */

  /** R1–R4, R6: record a standard. */
  standardDeclare(args = {}) {
    const a = isObj(args) ? args : {};
    const byMachine = machineRefusal(a.author);
    if (byMachine) return byMachine;
    const unknown = refuseFieldUnknown(a, DECLARE_KEYS);
    if (unknown) return unknown;
    const d = this.#declareRefusal(a);
    if (d.ok === false) return d;
    return this.#write(d.fields, str(a.author), a.viewer ?? null, null);
  }

  /* R1's refusals after the author, in R1's order, then R6's; `{ok: true, fields}`, checked, when none applies. */
  #declareRefusal(a) {
    const cite = str(a.cite);
    if (!cite || cite.length > CITE_MAX) return refuseNoCite(cite.length);
    if (!STANDARD_KINDS.includes(a.kind)) return refuseKindUnknown(a.kind);
    const issuer = str(a.issuer);
    /* DEC-49 REGION is-standard-issuer */
    if (!issuer)
      return refusal("STANDARD_NO_ISSUER", "a standard names the body that made it. Nothing was written.");
    /* END DEC-49 REGION is-standard-issuer */
    const fault = reasonFault(a.reason);
    /* DEC-49 REGION is-standard-reason */
    if (fault)
      return refusal("STANDARD_NO_REASON", `this declaration ${fault}. The reason is the declarer's own words on why the `
                     + "group holds its government to this standard, kept with it and read back with it. Nothing was "
                     + "written.", { max_chars: REASON_MAX });
    /* END DEC-49 REGION is-standard-reason */
    const texts = textIds(a.text);
    /* DEC-49 REGION is-standard-text */
    if (!texts || !texts.length || texts.length > TEXTS_MAX)
      return refusal("STANDARD_NO_TEXT", texts && texts.length > TEXTS_MAX
        ? `a standard's text names at most ${TEXTS_MAX} passages. Nothing was written.`
        : "a standard is held with its own words as captured: name one or more content ids. Nothing was written.",
        { max: TEXTS_MAX });
    /* END DEC-49 REGION is-standard-text */
    const unresolved = this.#unresolvedText(texts, a.viewer ?? null);
    if (unresolved) return refuseTextUnresolved(unresolved);
    const period = periodOf(a.period);
    /* DEC-49 REGION is-standard-period */
    if (!period)
      return refusal("STANDARD_PERIOD_INVALID", "a period is {from, to}, each a YYYY-MM-DD date or null, and `to` is "
                     + "not before `from`. Nothing was written.");
    /* END DEC-49 REGION is-standard-period */
    const supersedes = a.supersedes == null || a.supersedes === "" ? null : String(a.supersedes);
    if (supersedes !== null) {
      /* DEC-49 REGION is-superseded-held */
      if (!this.#row(supersedes))
        return refusal("STANDARD_SUPERSEDES_UNKNOWN", "no standard answers to the id this one is said to supersede. "
                       + "Nothing was written.", { supersedes });
      /* END DEC-49 REGION is-superseded-held */
      const later = this.#successorOf(supersedes);
      /* DEC-49 REGION is-supersession-once */
      if (later)
        return refusal("STANDARD_ALREADY_SUPERSEDED", `${supersedes} is already superseded by ${later}. Nothing was `
                       + "written.", { supersedes, superseded_by: later });
      /* END DEC-49 REGION is-supersession-once */
    }
    const law = this.#lawFields(a, cite, texts, period, a.viewer ?? null);
    if (law.ok === false) return law;
    return { ok: true, fields: { cite, kind: a.kind, issuer, reason: a.reason, texts, period, supersedes, ...law.fields } };
  }

  /* R18, R19: where the standard sits in its law, each field checked, in the order R18–R19 name them; `{ok: true,
     fields}` when none is malformed. The instrument key is composed, never typed: a declared one must be the key the
     profiles compose. */
  #lawFields(a, cite, texts, period, viewer) {
    const { view } = this.#view();
    const key = instrumentKey({ cite, view });
    const bad = (field, why) => {
      /* DEC-49 REGION is-standard-law-field */
      return refusal("STANDARD_FIELD_INVALID", `${field} ${why}. Nothing was written.`, { field });
      /* END DEC-49 REGION is-standard-law-field */
    };
    if (a.instrument != null && a.instrument !== "" && a.instrument !== key.key)
      return bad("instrument", key.key ? `is composed from the profiles as ${key.key}, and a different key was given`
                                       : `cannot be given: ${key.why}`);
    let portion = null;
    if (a.portion != null) {
      const p = a.portion;
      if (!isObj(p) || Object.keys(p).some((k) => k !== "path" && k !== "content_id") || typeof p.path !== "string"
          || !p.path.trim() || p.path.length > 200 || typeof p.content_id !== "string")
        return bad("portion", "is {path, content_id}: a path within the instrument of at most 200 characters and the "
                   + "content id of its extent");
      /* DEC-49 REGION is-portion-in-text */
      if (!texts.includes(p.content_id.trim()))
        return refusal("STANDARD_PORTION_NOT_IN_TEXT", `${p.content_id.slice(0, 80)} is not one of this standard's text `
                       + "passages. Nothing was written.", { content_id: p.content_id.slice(0, 80) });
      /* END DEC-49 REGION is-portion-in-text */
      portion = { path: p.path.trim(), content_id: p.content_id.trim() };
    }
    let requires = [];
    if (a.requires != null) {
      const r = textIds(a.requires);
      if (!r || !r.length || r.length > TEXTS_MAX || r.some((c) => !texts.includes(c)))
        return bad("requires", "is a list of the standard's own text passages (content ids among its text), quoted as "
                   + "captured, never paraphrased");
      requires = r;
    }
    const m = matchSource(view, cite);
    const sourceCopyIs = m ? sourceCopy(view, m.entry) : "undetermined";
    if (a.copy != null && !COPY_STATES.includes(a.copy)) return bad("copy", `is one of ${COPY_STATES.join(", ")}`);
    const copy = a.copy ?? sourceCopyIs;
    const copyAnswer = { copy, source_copy: sourceCopyIs, declared: a.copy != null,
                         ...(a.copy != null && a.copy !== sourceCopyIs
                           ? { says: `recorded as declared; the matched source's code states ${sourceCopyIs}` } : {}) };
    let currentThrough = null;
    if (a.current_through != null) {
      const c = a.current_through;
      if (!isObj(c) || !isDate(c.date) || typeof c.basis !== "string" || !this.#heldFor(c.basis, viewer))
        return bad("current_through", "is {date, basis}: the date the copy states it is current through (YYYY-MM-DD) "
                   + "and the captured passage stating it, which you may read");
      currentThrough = { date: c.date, basis: c.basis.trim() };
    }
    let periodBasis = null;
    if (a.period_basis != null) {
      const pb = a.period_basis;
      if (!isObj(pb) || Object.keys(pb).some((k) => k !== "from" && k !== "to"))
        return bad("period_basis", "is {from?, to?}, each a cited passage {passage} or an enactment event {event, edge}");
      periodBasis = {};
      for (const side of ["from", "to"]) {
        const b = pb[side];
        if (b == null) continue;
        if (isObj(b) && typeof b.passage === "string" && Object.keys(b).length === 1 && this.#heldFor(b.passage, viewer))
          periodBasis[side] = { passage: b.passage.trim() };
        else if (isObj(b) && typeof b.event === "string" && /^EVT-/.test(b.event) && isRecordId(b.event)
                 && (b.edge === "start" || b.edge === "end") && Object.keys(b).length === 2) {
          if (period[side] !== null)
            return bad("period_basis", `gives an event for the period's ${side}, which also states a date: a bound is a date `
                       + "or an event, never both");
          periodBasis[side] = { event: b.event, edge: b.edge };
        } else return bad("period_basis", `'s ${side} is a held passage {passage: content id} or an enactment event `
                          + "{event: EVT-…, edge: start or end}");
      }
    }
    return { ok: true, fields: { instrument: key, portion, requires, copy: copyAnswer, current_through: currentThrough,
                                 period_basis: periodBasis } };
  }

  /* A content id `content` holds, in a document the viewer may see. */
  #heldFor(contentId, viewer) {
    if (typeof contentId !== "string" || !contentId.trim()) return false;
    const row = this.content.contentRow(contentId.trim());
    return !!row && (viewer === null || this.membership.inSight(row.bundle_id, viewer));
  }

  /* R2: the first named content id `content.contentRow` does not hold (or, for a viewer, whose document the viewer
     may not see: one answer), or null. */
  #unresolvedText(texts, viewer) {
    for (const id of texts) {
      const row = this.content.contentRow(id);
      if (!row || (viewer !== null && !this.membership.inSight(row.bundle_id, viewer))) return id;
    }
    return null;
  }

  /* R1, R10: the one write. The id is allocated, the document promoted and the rows written in one transaction, so a
     refusal anywhere leaves nothing (record-core R32). */
  #write(f, author, viewer, proposalId) {
    return this.record.transact(() => {
      const at = this.#when();
      const id = `${this.record.allocId("STD", at.slice(0, 4)).id}-${f.kind}`;
      const source = this.sourceOf(f.cite, f);
      const text = standardDoc({ id, ...f, source, proposal: proposalId, author, at });
      this.#writing = id;
      let r;
      try {
        r = this.promotion.promote({ bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${rand(4)}`, author,
          files: [{ path: "bundle.md", text }],
          meta: { object_type: STANDARD, title: titleOf(f.cite), current_state: "recorded", created: at, last_updated: at },
          actorIdentity: author, actorViewer: viewer ?? author });
      } finally { this.#writing = null; }
      if (!r || !r.ok) return r;
      this.sql.exec(`INSERT INTO standards (standard_id, cite, kind, issuer, period_from, period_to, supersedes,
                       source_json, proposal_id, declared_by, declared_at, reason, instrument, instrument_json, portion_path,
                       portion_content, requires_json, copy, copy_json, current_through, current_through_basis,
                       period_basis_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    id, f.cite, f.kind, f.issuer, f.period.from, f.period.to, f.supersedes, JSON.stringify(source),
                    proposalId, author, at, f.reason, f.instrument.key, JSON.stringify(f.instrument),
                    f.portion ? f.portion.path : null, f.portion ? f.portion.content_id : null, JSON.stringify(f.requires),
                    f.copy.copy, JSON.stringify(f.copy), f.current_through ? f.current_through.date : null,
                    f.current_through ? f.current_through.basis : null,
                    f.period_basis ? JSON.stringify(f.period_basis) : null);
      f.texts.forEach((c, i) => this.sql.exec(`INSERT INTO standard_texts (standard_id, ord, content_id) VALUES (?,?,?)`,
                                              id, i, c));
      if (proposalId)
        this.sql.exec(`INSERT INTO standard_adoptions (proposal_id, standard_id, adopted_by, adopted_at) VALUES (?,?,?,?)`,
                      proposalId, id, author, at);
      return { ok: true, ...this.#answer(this.#row(id)), bundleSha: r.bundleSha };
    });
  }

  /* ===================================================================== *
   * READING (R5–R8)
   * ===================================================================== */

  #row(id) {
    return typeof id === "string" && id ? this.#one(`SELECT * FROM standards WHERE standard_id=?`, id) : null;
  }

  #successorOf(id) {
    const r = this.#one(`SELECT standard_id FROM standards WHERE supersedes=?`, id);
    return r ? r.standard_id : null;
  }

  /* R1's fields, R3's source, the declarer, time and reason (R4), both ends of a supersession (R6), the proposal (R10).
     A standard recorded before the reason was asked for answers `reason: null`. */
  #answer(row) {
    const texts = this.#rows(`SELECT content_id FROM standard_texts WHERE standard_id=? ORDER BY ord`, row.standard_id)
      .map((t) => t.content_id);
    return { id: row.standard_id, cite: row.cite, kind: row.kind, issuer: row.issuer, reason: row.reason ?? null,
             text: texts,
             period: { from: row.period_from ?? null, to: row.period_to ?? null }, source: safeJson(row.source_json),
             declared_by: row.declared_by, declared_at: row.declared_at, supersedes: row.supersedes ?? null,
             superseded_by: this.#successorOf(row.standard_id), proposal: row.proposal_id ?? null,
             ...this.#lawAnswer(row) };
  }

  /* R18, R19 as read back: a standard recorded before them states none (its key undetermined, said so). */
  #lawAnswer(row) {
    const instrument = safeJson(row.instrument_json)
      || { state: "undetermined", key: null, why: "recorded before instrument keys were composed" };
    return { instrument,
             portion: row.portion_path ? { path: row.portion_path, content_id: row.portion_content } : null,
             requires: safeJson(row.requires_json) || [],
             copy: safeJson(row.copy_json) || { copy: "undetermined", source_copy: null, declared: false,
                                                 says: "recorded before a copy status was recorded" },
             current_through: row.current_through ? { date: row.current_through, basis: row.current_through_basis } : null,
             period_basis: safeJson(row.period_basis_json) };
  }

  /** R5: one standard, with each text passage's standing and whether a newer capture of its document holds it. */
  standardRead({ id = null, viewer = null } = {}) {
    const sid = str(id);
    if (!sid) return refuseNoId("standard");
    const row = this.#row(sid);
    if (!row || !this.#readable(sid, viewer)) return refuseNoSuchStandard(sid);
    const a = this.#answer(row);
    const standings = this.content.standings(a.text);
    const texts = a.text.map((contentId) => ({ content_id: contentId, standing: standings[contentId] ?? null,
                                               newer: this.content.passageNotice({ contentId, viewer }) }));
    const quoted = a.requires.map((contentId) => ({ content_id: contentId, text: this.content.passageText(contentId) }));
    return { ok: true, ...a, texts, requires_quoted: quoted,
             says: "a standard as the record holds it: what it is and where it comes from, never whether it is a good "
                 + "one. Each passage of its text says whether a newer capture of its document still holds it; "
                 + "nothing is moved." };
  }

  /* R5: what a viewer may read. A standard is a bundle outside any project, so membership R43 lets every member, machine
     credential and the founder see it; any other viewer, and none, is answered as for an absent standard. */
  #readable(id, viewer) { return viewer !== null && viewer !== undefined && this.membership.inSight(id, viewer); }

  /** R7: whether a standard was in force on a date, with why: the alias of R20's `inForceAt({standard: id, date})`,
   *  answering exactly its state and why (Choices 18), so its callers need no change. */
  inForce(id, date) {
    if (!str(id)) return refuseNoId("standardinforce");
    if (!isDate(date)) return refuseDateInvalid(date);
    const r = this.inForceAt({ standard: str(id), date });
    if (r.ok === false) return r;
    return { ok: true, id: str(id), date, state: r.state, why: r.why };
  }

  /* ===================================================================== *
   * R20: IN FORCE AT A DATE
   * ===================================================================== */

  /* A day an event's `when` gives at `edge` (events R9, R26), or why there is none. */
  #eventDay(eventId, edge, viewer) {
    const ev = this.events;
    if (!ev || typeof ev.readEvent !== "function")
      return { day: null, why: `the event ${eventId} cannot be read here: the events module is not wired to standards` };
    let r;
    /* a caller that names no viewer is internal and is not asked sight (membership's terms); events fails closed on an
       absent viewer, so the internal read is asked as the machine's stamp, which sees every bundle (membership R43) and
       only reads */
    try { r = ev.readEvent({ eventId, viewer: viewer ?? INTERNAL_READER }); } catch { r = null; }
    if (!r || r.ok === false || r.found === false)
      return { day: null, why: `the event ${eventId} is not held, or may not be read` };
    const w = r.when !== undefined ? r.when : r.event ? r.event.when : undefined;
    if (!w || w === "undetermined" || w.undetermined)
      return { day: null, why: `the event ${eventId} has no when the record can read (${w && w.why ? w.why : "placed nowhere"})` };
    if (w.precision === "edtf") return { day: null, why: `the event ${eventId}'s when is a band (${w.value ?? w.start}), not a day` };
    if (w.precision === "upper_bound")
      return { day: null, why: `the event ${eventId}'s when is an upper bound only ("on or before"), not a day` };
    /* events R9: `start` and `end` are the half-open span of instants the when covers, in its zone; the edge's day is
       the local day of its first or last instant */
    let d = null;
    try {
      const at = edge === "end" ? (typeof w.end === "string" ? new Date(Date.parse(w.end) - 1000).toISOString().replace(/\.\d{3}Z$/, "Z") : null)
        : w.start;
      d = typeof at === "string" && typeof w.zone === "string" ? localDay(at, w.zone) : null;
    } catch { d = null; }
    return isDate(d) ? { day: d, why: null } : { day: null, why: `the event ${eventId}'s when states no day at its ${edge}` };
  }

  /* R20: a version's period as the record states it: its stated bounds, a bound given as an event read from that
     event's when, and its end bounded by each adopted temporal relation that amends, repeals, renumbers or recodifies it
     (the day before its effective date). `{from, to, why: {from?, to?}, bound_by}`; a bound that cannot be read is
     null with why. */
  #periodOf(row, viewer) {
    const out = { from: row.period_from ?? null, to: row.period_to ?? null, why: {}, bound_by: [] };
    const basis = safeJson(row.period_basis_json) || {};
    for (const side of ["from", "to"]) {
      const b = basis[side];
      if (!b || !b.event) continue;
      const d = this.#eventDay(b.event, b.edge, viewer);
      if (d.day) out[side] = d.day; else out.why[side] = d.why;
    }
    for (const r of this.#law.boundsOn(row.standard_id)) {
      const eff = r.effective_date ? { day: r.effective_date } : this.#eventDay(r.effective_event, r.effective_edge, viewer);
      if (!eff.day) { out.why.to = `${r.relation_id} (${r.type}) bounds it, and ${eff.why}`; out.unread = true; continue; }
      const end = new Date(Date.parse(`${eff.day}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
      if (out.to === null || end < out.to) out.to = end;
      out.bound_by.push({ relation: r.relation_id, type: r.type, effective: eff.day });
    }
    return out;
  }

  /* R20: one version against a date: civil-time.validAt over its period, then a codifier copy's lag. */
  #versionAt(row, date, viewer) {
    const p = this.#periodOf(row, viewer);
    const zone = this.#zone();
    const bound = (side) => (p[side] !== null ? p[side] : p.why[side] ? { event: "unread", edge: side } : null);
    let v;
    try {
      v = validAt({ valid: { from: bound("from"), to: p.unread && p.to === null ? { event: "unread", edge: "to" } : bound("to"),
                             precision: "day", zone } }, { value: date, precision: "day", zone });
    } catch { v = { undetermined: true, why: "the period could not be read" }; }
    const by = p.bound_by.length ? ` (bounded by ${p.bound_by.map((b) => `${b.relation}, which ${b.type.replace(/s$/, "s")} it `
                                                     + `effective ${b.effective}`).join("; ")})` : "";
    let state, why;
    if (v === "out") {
      state = "not_in_force";
      why = p.from !== null && date < p.from ? `the period in force starts ${p.from}, after ${date}${by}`
        : `the period in force ended ${p.to}, before ${date}${by}`;
    } else if (v === "in") {
      state = "in_force"; why = `${date} lies within the period in force, ${p.from} to ${p.to}${by}`;
    } else {
      state = "undetermined";
      const missing = [p.from === null ? p.why.from || "when it came into force" : null,
                       p.to === null ? p.why.to || "when it ceased to be in force" : null].filter(Boolean);
      why = missing.length && !p.why.from && !p.why.to
        ? `the record does not state ${missing.join(" or ")}, so whether it was in force on ${date} is undetermined`
        : missing.length ? `${missing.join("; ")}, so whether it was in force on ${date} is undetermined`
        : (v && v.why) || `whether it was in force on ${date} is undetermined`;
    }
    /* codifier lag (`measures-T33/time-law.md` §4): a codifier's copy speaks only through its current-through date */
    if (state !== "not_in_force" && row.copy === "codifier" && row.current_through && date > row.current_through) {
      const later = row.instrument ? this.#one(`SELECT standard_id FROM standards WHERE instrument=? AND standard_id<>?
                                                 AND period_from IS NOT NULL AND period_from > ? LIMIT 1`,
                                               row.instrument, row.standard_id, row.current_through) : null;
      if (!later) { state = "undetermined"; why = `versions after ${row.current_through} not held: this copy is a codifier's, `
                                                 + `current through ${row.current_through}, and ${date} is after it`; }
    }
    return { state, why, period: { from: p.from, to: p.to }, bound_by: p.bound_by };
  }

  /** R20: `inForceAt({key | standard, portion?, date, viewer?})` → `{state, why, standard, version}`. With a standard,
   *  that version; with a key, the version whose period covers the date, two that both cover it or none deciding it
   *  answering undetermined naming them (never the later one preferred). Writes nothing and never throws. */
  inForceAt({ key = null, standard = null, portion = null, date = null, viewer = null } = {}) {
    try {
      if (!str(key) && !str(standard)) return refuseNoId("inforceat");
      if (!isDate(date)) return refuseDateInvalid(date);
      if (str(standard)) {
        const row = this.#row(str(standard));
        if (!row || (viewer !== null && !this.#readable(row.standard_id, viewer))) return refuseNoSuchStandard(str(standard));
        const v = this.#versionAt(row, date, viewer);
        return { ok: true, date, state: v.state, why: v.why, standard: row.standard_id,
                 version: { standard: row.standard_id, ...v.period, bound_by: v.bound_by } };
      }
      const p = portion == null || portion === "" ? null : String(portion);
      const rows = this.#rows(`SELECT * FROM standards WHERE instrument=? ${p !== null ? "AND portion_path=?" : ""}
                               ORDER BY standard_id LIMIT ?`, ...(p !== null ? [str(key), p] : [str(key)]), PAGE_MAX + 1);
      const base = { ok: true, date, key: str(key), portion: p };
      if (!rows.length)
        return { ...base, state: "undetermined", standard: null, version: null,
                 why: `no version of ${str(key)}${p !== null ? ` at ${p}` : ""} is held, so whether it was in force is undetermined` };
      const vs = rows.slice(0, PAGE_MAX).map((r) => ({ id: r.standard_id, ...this.#versionAt(r, date, viewer) }));
      const inn = vs.filter((v) => v.state === "in_force"), unsure = vs.filter((v) => v.state === "undetermined");
      if (inn.length === 1 && !unsure.length)
        return { ...base, state: "in_force", why: inn[0].why, standard: inn[0].id, version: { standard: inn[0].id, ...inn[0].period } };
      if (inn.length > 1)
        return { ...base, state: "undetermined", standard: null, version: null, versions: inn.map((v) => v.id),
                 why: `${inn.map((v) => v.id).join(" and ")} each cover ${date}; none is preferred, so which was in force is undetermined` };
      if (unsure.length)
        return { ...base, state: "undetermined", standard: null, version: null, versions: [...inn, ...unsure].map((v) => v.id),
                 why: `no held version decides ${date}: ${unsure.map((v) => `${v.id}: ${v.why}`).join("; ")}` };
      return { ...base, state: "not_in_force", standard: null, version: null, versions: vs.map((v) => v.id),
               why: `every held version's period excludes ${date}: ${vs.map((v) => `${v.id}: ${v.why}`).join("; ")}`,
               ...(rows.length > PAGE_MAX ? { truncated: true } : {}) };
    } catch {
      return { ok: true, date, state: "undetermined", standard: null, version: null, why: "the versions could not be read" };
    }
  }

  /** R8: the standards the filters admit, in id order, at most `PAGE_MAX` per page; with `at`, each with R7's answer
   *  and the ones not in force left out. The stated period filters in SQL (a superset: a stated bound that excludes
   *  the date excludes it in R7 too), then R7 (with its relations and event bounds) is asked of each row, reading on
   *  until the page and the row past it are found, so the page and its cut are exact. */
  standardsIn({ at = null, kind = null, source = null, cite = null, after = null, limit = null, viewer = null } = {}) {
    const date = at == null || at === "" ? null : at;
    if (date !== null && !isDate(date)) return refuseDateInvalid(date);
    if (kind != null && kind !== "" && !STANDARD_KINDS.includes(kind)) return refuseKindUnknown(kind);
    const n = Number.isInteger(Number(limit)) && limit !== null && limit !== "" ? Math.min(PAGE_MAX, Math.max(1, Number(limit)))
      : PAGE_MAX;
    const gate = viewerPredicate(viewer);
    const where = [`(${gate.sql})`], args = [...gate.args];
    if (kind) { where.push("s.kind=?"); args.push(kind); }
    if (str(source) === "undetermined") where.push(`json_extract(s.source_json, '$.state')='undetermined'`);
    else if (str(source)) { where.push(`json_extract(s.source_json, '$.source')=?`); args.push(str(source)); }
    if (str(cite)) { where.push("instr(lower(s.cite), lower(?)) > 0"); args.push(str(cite)); }
    if (date) { where.push("NOT ((s.period_from IS NOT NULL AND s.period_from > ?) OR (s.period_to IS NOT NULL AND s.period_to < ?))");
                args.push(date, date); }
    const kept = [];
    let cursor = str(after) || null;
    for (;;) {
      const page = this.#rows(`SELECT s.* FROM standards s JOIN bundles b ON b.bundle_id = s.standard_id
                                WHERE ${[...where, ...(cursor ? ["s.standard_id > ?"] : [])].join(" AND ")}
                                ORDER BY s.standard_id LIMIT ?`, ...args, ...(cursor ? [cursor] : []), n + 1);
      for (const r of page) {
        const f = date ? this.#versionAt(r, date, viewer) : null;
        if (f && f.state === "not_in_force") continue;
        kept.push({ r, f });
        if (kept.length > n) break;
      }
      if (kept.length > n || page.length < n + 1) break;
      cursor = page[page.length - 1].standard_id;
    }
    const truncated = kept.length > n;
    const page = kept.slice(0, n);
    const items = page.map(({ r, f }) => ({ ...this.#answer(r), ...(f ? { in_force: { state: f.state, why: f.why } } : {}) }));
    return { ok: true, items, count: items.length, limit: n, truncated,
             cursor: truncated ? page[page.length - 1].r.standard_id : null,
             ...(date ? { at: date, says: `standards in force on ${date}, or whose period does not decide it (stated `
                                          + "undetermined); a standard whose period excludes the date is left out" }
                      : {}) };
  }

  /* ===================================================================== *
   * R21: THE REVERSE INDEX (LAW N4)
   * ===================================================================== */

  /** R21: `standardsFor({target, limit, viewer})`: for a held standard, or an instrument key (`/eli/…`, or `{key,
   *  portion?}`), every document whose reading cites it (a reference `extraction` holds whose recognised key or cite
   *  matches, by R3's patterns); for a document (a bundle id or a capture digest), the held standards its readings
   *  cite. Each item says how it matched. A document the viewer may not see is neither answered nor counted. Reads
   *  `extraction`'s `reading_refs` under its read contract (R58 there). Writes nothing and never throws. */
  standardsFor({ target = null, limit = null, viewer = null } = {}) {
    const n = Number.isInteger(Number(limit)) && limit !== null && limit !== ""
      ? Math.min(FOR_LIMIT_MAX, Math.max(1, Number(limit))) : FOR_LIMIT_DEFAULT;
    const t = isObj(target) ? str(target.key) : str(target);
    if (!t) return refuseNoId("standardsfor");
    try {
      const { view } = this.#view();
      const row = this.#row(t);
      if (row || t.startsWith("/eli/")) {
        if (row && !this.#readable(row.standard_id, viewer)) return refuseNoSuchStandard(t);
        const key = row ? row.instrument ?? null : t;
        const cite = row ? foldCite(row.cite) : null;
        /* a prefilter, a superset of what matches: the key's number, else the cite's last word */
        const probe = key ? key.slice(key.lastIndexOf("/") + 1) : cite.split(" ").pop();
        const refs = this.#rows(`SELECT DISTINCT capture_sha, bundle_id, ref, ref_kind, ref_key, label FROM reading_refs
                                 WHERE instr(lower(coalesce(label,'') || ' ' || coalesce(ref_key,'') || ' ' || ref), lower(?)) > 0
                                 ORDER BY capture_sha, ref LIMIT ?`, probe, SCAN_FOR);
        const docs = new Map();
        for (const r of refs) {
          const rk = key ? referenceKey(view, r) : null;
          const how = rk && rk.key === key ? rk.how
            : cite && [r.label, r.ref_key, r.ref].some((x) => typeof x === "string" && foldCite(x) === cite) ? "cite" : null;
          if (!how) continue;
          if (!docs.has(r.capture_sha)) {
            if (!this.membership.inSight(r.bundle_id, viewer)) continue;
            if (docs.size > n) break;
            docs.set(r.capture_sha, { capture_sha: r.capture_sha, bundle_id: r.bundle_id, references: [] });
          }
          docs.get(r.capture_sha).references.push({ ref: r.ref, label: r.label ?? null, how });
        }
        const items = [...docs.values()].slice(0, n);
        return { ok: true, target: t, of: row ? "standard" : "instrument", key, items, count: items.length, limit: n,
                 truncated: docs.size > n || refs.length >= SCAN_FOR,
                 says: "documents whose readings cite it, as the readings state their references; a document you may not "
                     + "see is neither answered nor counted" };
      }
      const byCapture = /^[0-9a-f]{64}$/.test(t);
      const refs = this.#rows(`SELECT DISTINCT capture_sha, bundle_id, ref, ref_kind, ref_key, label FROM reading_refs
                               WHERE ${byCapture ? "capture_sha" : "bundle_id"}=? ORDER BY ref LIMIT ?`, t, SCAN_FOR);
      const visible = refs.filter((r) => this.membership.inSight(r.bundle_id, viewer));
      const found = new Map();
      for (const r of visible) {
        const rk = referenceKey(view, r);
        const byKey = rk ? this.#rows(`SELECT standard_id FROM standards WHERE instrument=? ORDER BY standard_id LIMIT ?`,
                                      rk.key, n + 1).map((x) => [x.standard_id, rk.how]) : [];
        const byCite = [r.label, r.ref_key].filter((x) => typeof x === "string" && x.trim()).flatMap((x) =>
          this.#rows(`SELECT standard_id FROM standards WHERE lower(cite)=? ORDER BY standard_id LIMIT ?`, foldCite(x), n + 1)
            .map((y) => [y.standard_id, "cite"]));
        for (const [sid, how] of [...byKey, ...byCite]) {
          if (!found.has(sid)) found.set(sid, { standard: sid, references: [] });
          const e = found.get(sid);
          if (!e.references.some((x) => x.ref === r.ref && x.how === how)) e.references.push({ ref: r.ref, label: r.label ?? null, how });
        }
      }
      const all = [...found.values()].sort((a, b) => (a.standard < b.standard ? -1 : 1));
      const items = all.slice(0, n).map((e) => ({ ...e, cite: this.#row(e.standard).cite }));
      return { ok: true, target: t, of: "document", items, count: items.length, limit: n,
               truncated: all.length > n || refs.length >= SCAN_FOR,
               says: visible.length || !refs.length ? "the held standards this document's readings cite"
                 : "no document you may see answers to that id" };
    } catch {
      return { ok: true, target: t, items: [], count: 0, limit: n, truncated: false,
               undetermined: { why: "the readings' references could not be read here, so what cites what is undetermined" } };
    }
  }

  /* ===================================================================== *
   * R22–R28: LAW RELATIONS, COURT LINKS, TREATMENTS, THE RESOLVER, THE OWNER (`./law.mjs`)
   * ===================================================================== */

  lawRelate(args) { return this.#law.lawRelate(args); }
  lawRelationsOf(args) { return this.#law.lawRelationsOf(args); }
  lawWithdraw(args) { return this.#law.lawWithdraw(args); }
  lawPropose(args) { return this.#law.lawPropose(args); }
  courtLink(args) { return this.#law.courtLink(args); }
  courtTreat(args) { return this.#law.courtTreat(args); }
  stillStanding(args) { return this.#law.stillStanding(args); }
  addressesOf(args) { return this.#law.addressesOf(args); }
  resolveCourtCitation(args) { return this.#law.resolveCourtCitation(args); }
  neighbours(args) { return this.#law.neighbours(args); }

  /* ===================================================================== *
   * PROPOSALS (R9, R10)
   * ===================================================================== */

  /** R9: a proposal, stored apart from standards and labelled with who proposed it and whether it is machine work. */
  standardPropose(args = {}) {
    const a = isObj(args) ? args : {};
    const unknown = refuseFieldUnknown(a, PROPOSE_KEYS);
    if (unknown) return unknown;
    const who = str(a.proposer);
    /* DEC-49 REGION is-proposer-named */
    if (!who)
      return refusal("STANDARD_PROPOSER_UNNAMED", "the plane stamps the proposer from the credential that asked, and this "
                     + "call carries nobody. Nothing was written.");
    /* END DEC-49 REGION is-proposer-named */
    const cite = str(a.cite);
    if (!cite || cite.length > CITE_MAX) return refuseNoCite(cite.length);
    if (a.kind != null && a.kind !== "" && !STANDARD_KINDS.includes(a.kind)) return refuseKindUnknown(a.kind);
    const texts = a.text == null ? [] : textIds(a.text);
    if (texts === null || texts.length > TEXTS_MAX) return refuseTextUnresolved(null);
    const unresolved = this.#unresolvedText(texts, a.viewer ?? null);
    if (unresolved) return refuseTextUnresolved(unresolved);
    const why = str(a.why);
    /* DEC-49 REGION is-proposal-why */
    if (!why || why.length > WHY_MAX)
      return refusal("STANDARD_WHY_INVALID", `a proposal says why, in 1 to ${WHY_MAX} characters. Nothing was written.`,
                     { max: WHY_MAX });
    /* END DEC-49 REGION is-proposal-why */
    const act = a.act == null || a.act === "" ? null : a.act;
    /* DEC-49 REGION is-proposal-act */
    if (act !== null && (typeof act !== "string" || !act.trim() || act.length > ACT_MAX))
      return refusal("STANDARD_ACT_INVALID", `the act a proposal names is an id of at most ${ACT_MAX} characters. `
                     + "Nothing was written.", { max: ACT_MAX });
    /* END DEC-49 REGION is-proposal-act */
    return this.record.transact(() => {
      const at = this.#when();
      const id = this.record.allocId("STDP", at.slice(0, 4)).id;
      const kind = a.kind || null, issuer = str(a.issuer) || null;
      this.sql.exec(`INSERT INTO standard_proposals (proposal_id, cite, kind, issuer, text_json, why, act, proposed_by,
                       proposed_at) VALUES (?,?,?,?,?,?,?,?,?)`,
                    id, cite, kind, issuer, JSON.stringify(texts), why, act === null ? null : act.trim(), who, at);
      return { ok: true, proposal: this.#proposalAnswer(this.#proposal(id)), standard: false,
               says: "this is a proposal and not a standard: it is not in the record's standards and no list of "
                   + "standards shows it. Only a member recording a standard, or adopting this proposal, enters one."
                   + (texts.length ? "" : " It is stored with no captured text, and cannot be adopted until a member "
                                          + "names the captured passages that hold the standard's words (R9)."),
               ...(texts.length ? {} : { text_held: false }) };
    });
  }

  #proposal(id) {
    return typeof id === "string" && id ? this.#one(`SELECT * FROM standard_proposals WHERE proposal_id=?`, id) : null;
  }

  #proposalAnswer(p) {
    const adopted = this.#one(`SELECT standard_id, adopted_by, adopted_at FROM standard_adoptions WHERE proposal_id=?`,
                              p.proposal_id);
    return { id: p.proposal_id, cite: p.cite, kind: p.kind ?? null, issuer: p.issuer ?? null,
             text: safeJson(p.text_json) || [], why: p.why, act: p.act ?? null, at: p.proposed_at,
             ...proposalLabel(p.proposed_by, STANDARD),
             adoption: adopted ? { standard: adopted.standard_id, by: adopted.adopted_by, at: adopted.adopted_at } : null };
  }

  /** R10: a member adopts a proposal: R1 by that member, naming it. A field the member does not state is the
   *  proposal's, and the answer says which were; the standard records the proposal, and the proposal its adoption. The
   *  reason is never taken from the proposal: the adopting member's own is R1's, and the proposal's `why` is the
   *  proposer's (DEC-88), answered beside it as theirs. */
  standardAdopt(args = {}) {
    const a = isObj(args) ? args : {};
    const byMachine = machineRefusal(a.author);
    if (byMachine) return byMachine;
    const unknown = refuseFieldUnknown(a, ADOPT_KEYS);
    if (unknown) return unknown;
    const p = this.#proposal(str(a.proposal));
    /* DEC-49 REGION is-proposal-held */
    if (!p || (a.viewer != null && viewerPredicate(a.viewer).scope === "DENY"))
      return refusal("STANDARD_NO_SUCH_PROPOSAL", "no proposal of a standard answers to that id here. Nothing was "
                     + "written.", { proposal: str(a.proposal) || null });
    /* END DEC-49 REGION is-proposal-held */
    const done = this.#adoptRefusal(p);
    if (done) return done;
    const fromProposal = [];
    const take = (k, v) => { if (a[k] == null || a[k] === "") { if (v != null) fromProposal.push(k); return v; } return a[k]; };
    const fields = { ...a, cite: take("cite", p.cite), kind: take("kind", p.kind), issuer: take("issuer", p.issuer),
                     text: take("text", (safeJson(p.text_json) || []).length ? safeJson(p.text_json) : null) };
    const d = this.#declareRefusal(fields);
    if (d.ok === false) return d;
    const r = this.#write(d.fields, str(a.author), a.viewer ?? null, p.proposal_id);
    if (!r || !r.ok) return r;
    return { ...r, adopted: { proposal: p.proposal_id, from_proposal: fromProposal, why: p.why, why_by: p.proposed_by,
                              says: fromProposal.length ? `${fromProposal.join(", ")} taken from the proposal as it was made`
                                                        : "every field stated by the adopting member" } };
  }

  /* R10: a proposal is adopted at most once. */
  #adoptRefusal(p) {
    const held = this.#one(`SELECT standard_id FROM standard_adoptions WHERE proposal_id=?`, p.proposal_id);
    /* DEC-49 REGION is-proposal-open */
    if (held)
      return refusal("STANDARD_PROPOSAL_ADOPTED", `${p.proposal_id} was adopted as ${held.standard_id}. Nothing was written.`,
                     { proposal: p.proposal_id, standard: held.standard_id });
    /* END DEC-49 REGION is-proposal-open */
    return null;
  }
}

/* ---- the document (R15) ---- */

/** The title a standard's document carries: its citation, as the front matter can hold it. */
const titleOf = (cite) => String(cite).replace(/["\\\r\n]/g, " ").slice(0, CITE_MAX);

/* The core fields every record document states (C-2.2): a member's act, nothing pending, nothing drawn. `group` is
   stamped by `promotion` (its R13). */
const CORE_TAIL = Object.freeze(["produced_by:", "  mode: human", "  capability_tier: session", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []"]);

/** R15: a new standard's document, `recorded`. The citation, issuer and the declarer's reason, which may hold any
 *  character, are kept whole in body sections; the front matter holds what the grammar holds bare. */
function standardDoc({ id, cite, kind, issuer, reason, texts, period, supersedes, source, proposal, author, at }) {
  const src = source && source.state === "matched"
    ? `Matched: ${source.source} (${source.kind}, ${source.issuer}, level ${source.level}), from the profile `
      + `${source.profile} (basis ${source.basis}).`
    : `Undetermined: ${source ? source.why : "not read"}.`;
  return ["---", `id: ${id}`, `object_type: ${STANDARD}`, `schema: ${STANDARD}@1`, `title: ${q(titleOf(cite))}`,
    "current_state: recorded", "prior_state: null", `created: ${q(at)}`, `last_updated: ${q(at)}`, `kind: ${kind}`,
    `period_from: ${period.from === null ? "null" : q(period.from)}`, `period_to: ${period.to === null ? "null" : q(period.to)}`,
    `supersedes: ${supersedes ?? "null"}`, `adopted_from: ${proposal ?? "null"}`, `texts: [${texts.join(", ")}]`,
    `author: ${bare(author)}`, ...CORE_TAIL, "---", "", "## Citation", "", bodyText(cite), "", "## Issuer", "",
    bodyText(issuer), "", "## Reason", "", bodyText(reason), "", "## Source", "", bodyText(src), "", "## Session Log", "",
    `### Session ${at} | Recorded | ${author}`,
    `Changes: standard recorded${supersedes ? `, superseding ${supersedes}` : ""}${proposal ? `, adopting ${proposal}` : ""}.`,
    ""].join("\n");
}

/* ---- the fields ---- */

/* R2: one or more content ids, as a string or a list; null when not in that shape. Repeats are kept once. */
function textIds(v) {
  const list = typeof v === "string" ? [v] : Array.isArray(v) ? v : null;
  if (!list || !list.every((x) => typeof x === "string")) return null;
  return [...new Set(list.map((x) => x.trim()).filter(Boolean))];
}

/* R1: `{from, to}`, each a date or null (absent is null); the period with nulls, or null when invalid. */
function periodOf(p) {
  if (p === undefined || p === null) return { from: null, to: null };
  if (!isObj(p) || Object.keys(p).some((k) => k !== "from" && k !== "to")) return null;
  const from = p.from ?? null, to = p.to ?? null;
  if ((from !== null && !isDate(from)) || (to !== null && !isDate(to))) return null;
  if (from !== null && to !== null && to < from) return null;
  return { from, to };
}

/* DEC-49: a code several acts answer is minted at one site, its own function here, which builds the refusal whole from
   its row; each act relays it with its own detail. */

/* R1, R10, R11: recording a standard is a named member's act. */
function machineRefusal(author) {
  /* DEC-49 REGION is-standard-member */
  if (str(author) && !isMachineIdentity(str(author))) return null;
  return refusal("MACHINE_CANNOT_DECLARE_STANDARD", "recording a standard is a named member's act; a machine proposes one "
                 + "(standardPropose). Nothing was written.");
  /* END DEC-49 REGION is-standard-member */
}

function refuseFieldUnknown(a, keys) {
  const unknown = Object.keys(a).filter((k) => !keys.includes(k)).sort();
  /* DEC-49 REGION is-standard-field */
  if (unknown.length)
    return refusal("STANDARD_FIELD_UNKNOWN", `this act takes ${keys.join(", ")}, and not ${unknown.join(", ")}. Nothing `
                   + "was written.", { rejected: unknown, accepted: [...keys] });
  /* END DEC-49 REGION is-standard-field */
  return null;
}

/* R23, R26, R27, R30: the refusals `./law.mjs`'s acts share with R1, R9 and R10, each minted as theirs are. */
function refuseLawReason(fault) {
  /* DEC-49 REGION is-standard-reason */
  return refusal("STANDARD_NO_REASON", `this act ${fault}. The reason is the member's own words on why the record holds `
                 + "this row. Nothing was written.", { max_chars: REASON_MAX });
  /* END DEC-49 REGION is-standard-reason */
}
function refuseNoSuchProposal(id) {
  /* DEC-49 REGION is-proposal-held */
  return refusal("STANDARD_NO_SUCH_PROPOSAL", "no proposal of that kind answers to that id here. Nothing was written.",
                 { proposal: id });
  /* END DEC-49 REGION is-proposal-held */
}
function refuseProposalAdopted(id, as) {
  /* DEC-49 REGION is-proposal-open */
  return refusal("STANDARD_PROPOSAL_ADOPTED", `${id} was adopted as ${as}. Nothing was written.`, { proposal: id, adopted_as: as });
  /* END DEC-49 REGION is-proposal-open */
}
function refuseProposerUnnamed() {
  /* DEC-49 REGION is-proposer-named */
  return refusal("STANDARD_PROPOSER_UNNAMED", "the plane stamps the proposer from the credential that asked, and this call "
                 + "carries nobody. Nothing was written.");
  /* END DEC-49 REGION is-proposer-named */
}
function refuseWhyInvalid() {
  /* DEC-49 REGION is-proposal-why */
  return refusal("STANDARD_WHY_INVALID", `a proposal says why, in 1 to ${WHY_MAX} characters. Nothing was written.`,
                 { max: WHY_MAX });
  /* END DEC-49 REGION is-proposal-why */
}

function refuseNoCite(length) {
  /* DEC-49 REGION is-standard-cited */
  return refusal("STANDARD_NO_CITE", length ? `a citation is at most ${CITE_MAX} characters, and this one is ${length}. `
                 + "Nothing was written." : "a standard is recorded with its citation. Nothing was written.",
                 { max: CITE_MAX });
  /* END DEC-49 REGION is-standard-cited */
}

function refuseKindUnknown(kind) {
  /* DEC-49 REGION is-standard-kind */
  return refusal("STANDARD_KIND_UNKNOWN", `a standard's kind is one of ${STANDARD_KINDS.join(", ")}. Nothing was written.`,
                 { kind: typeof kind === "string" ? kind.slice(0, 40) : null, kinds: [...STANDARD_KINDS] });
  /* END DEC-49 REGION is-standard-kind */
}

function refuseTextUnresolved(contentId) {
  /* DEC-49 REGION is-standard-text-held */
  return refusal("STANDARD_TEXT_UNRESOLVED", contentId
    ? `no content row is held for ${String(contentId).slice(0, 80)}. Nothing was written.`
    : `a proposal's text is a list of at most ${TEXTS_MAX} content ids. Nothing was written.`,
    { content_id: contentId === null ? null : String(contentId).slice(0, 80) });
  /* END DEC-49 REGION is-standard-text-held */
}

/** R17 (N309, K231, K275): THE answer to one condition, no standard the caller may read answers to `standardId`
 *  (absent, or any id for a viewer naming no member, answered alike). The code is minted here and nowhere else: R5 and
 *  R7 answer through it, and so does every later module answering this condition (`conformance` R1). `standard` is the
 *  id as asked (null when none) and `detail` one fixed sentence; `extra` adds a caller's own fields and never replaces
 *  these. It writes nothing and never throws. */
export function noSuchStandard(standardId, extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !NO_SUCH_STANDARD_FIXED.has(k));
  } catch { own = []; }
  /* DEC-49 REGION is-standard-held */
  const row = STANDARDS_CHECKS.NO_SUCH_STANDARD;
  return { ok: false, reason: "NO_SUCH_STANDARD", code: "NO_SUCH_STANDARD", check: row.check,
           translation: row.translation, standard: standardId ?? null, ...Object.fromEntries(own),
           detail: NO_SUCH_STANDARD_DETAIL };
  /* END DEC-49 REGION is-standard-held */
}
const NO_SUCH_STANDARD_DETAIL = "no standard answers to that id here. One your credential may not read is answered "
  + "exactly as one that does not exist.";
const NO_SUCH_STANDARD_FIXED = new Set(["ok", "reason", "code", "check", "translation", "standard", "detail"]);

/** R23 (K1563 (10)): THE answer to one condition, a portion named that the standard does not record (`PORTION_UNKNOWN`):
 *  minted here and nowhere else; R23, R26 and `progressions` R39 answer through it. `extra` adds a caller's own fields
 *  and never replaces these. It writes nothing and never throws. */
export function portionUnknown(standardId, portion, extra = null) {
  let own = [];
  try { if (extra && typeof extra === "object" && !Array.isArray(extra)) own = Object.entries(extra); } catch { own = []; }
  const p = portion == null ? null : String(portion).slice(0, 200);
  /* DEC-49 REGION is-portion-held */
  return refusal("PORTION_UNKNOWN", `${standardId ?? "the standard"} records no portion '${p ?? ""}'. Nothing was written.`,
                 { ...Object.fromEntries(own.filter(([k]) => !["ok", "reason", "code", "check", "translation", "detail",
                                                                "standard", "portion"].includes(k))),
                   standard: standardId ?? null, portion: p });
  /* END DEC-49 REGION is-portion-held */
}

/* R5, R7: this module's own answer, through R17, naming the id also as `id` (the field its readers key on, filings R14). */
const refuseNoSuchStandard = (id) => noSuchStandard(id, { id });

/* R5, R7: a read that names no standard (N269: its own coded row, never a codeless `NO_ID`; K275). */
function refuseNoId(op) {
  /* DEC-49 REGION is-standard-named */
  return refusal("STANDARD_NO_ID", `a standard is read by its id, and none was named: ${op} takes id=<standard id>. `
                 + "Nothing was answered.", { op });
  /* END DEC-49 REGION is-standard-named */
}

function refuseDateInvalid(date) {
  /* DEC-49 REGION is-date-readable */
  return refusal("STANDARD_DATE_INVALID", "a date is written YYYY-MM-DD and names a day that exists.",
                 { date: typeof date === "string" ? date.slice(0, 40) : null });
  /* END DEC-49 REGION is-date-readable */
}

/** The ops whose handlers are this module's (K3): the control plane routes, authenticates and stamps them (`author` and
 *  `proposer` in the body; `viewer` in the URL, read after the body so a body cannot set it). `plane` spreads them into
 *  its route table (`src/plane/store.mjs`). The body is passed whole, so a declaration's `reason` reaches R1. */
export function standardsOps(s, url, body) {
  const qp = (k) => url.searchParams.get(k);
  const b = body || {};
  return {
    standarddeclare: () => s.standardDeclare({ ...b, viewer: qp("viewer") }),
    standard: () => s.standardRead({ id: qp("id"), viewer: qp("viewer") }),
    standards: () => s.standardsIn({ at: qp("at"), kind: qp("kind"), source: qp("source"), cite: qp("cite"),
                                     after: qp("after"), limit: qp("limit"), viewer: qp("viewer") }),
    standardinforce: () => s.inForce(qp("id"), qp("date")),
    standardpropose: () => s.standardPropose({ ...b, viewer: qp("viewer") }),
    standardadopt: () => s.standardAdopt({ ...b, viewer: qp("viewer") }),
    /* T33-31: R20, R21, R23–R27 (the ops are declared by op-declarations, T33-88) */
    inforceat: () => s.inForceAt({ key: qp("key"), standard: qp("id"), portion: qp("portion"), date: qp("date"),
                                   viewer: qp("viewer") }),
    standardsfor: () => s.standardsFor({ target: qp("target"), limit: qp("limit"), viewer: qp("viewer") }),
    lawrelate: () => s.lawRelate({ ...b, viewer: qp("viewer") }),
    lawrelations: () => s.lawRelationsOf({ standard: qp("id"), viewer: qp("viewer") }),
    lawwithdraw: () => s.lawWithdraw({ relation: b.relation ?? null, reason: b.reason ?? null, author: b.author ?? null }),
    lawpropose: () => s.lawPropose({ ...b, viewer: qp("viewer") }),
    lawaddresses: () => s.addressesOf({ key: qp("key"), portion: qp("portion"), viewer: qp("viewer") }),
    courtlink: () => s.courtLink({ ...b, viewer: qp("viewer") }),
    courttreat: () => s.courtTreat({ ...b, viewer: qp("viewer") }),
    stillstanding: () => s.stillStanding({ decision: qp("id"), date: qp("date"), viewer: qp("viewer") }),
    citationresolve: () => s.resolveCourtCitation({ citation: qp("citation"), lookup: qp("lookup") === "1",
                                                   viewer: qp("viewer") }),
  };
}

const instances = new WeakMap();
/* R28 (K1563 (1)): the instance the module's one registration in connection-grammar's default registry reads: the
   host's, when the registry passes `host`, else the isolate's one instance; with several and no host, ambiguous. */
let current = null, constructed = 0;
function ownerRead(a) {
  const { host, ...rest } = a && typeof a === "object" ? a : {};
  const s = host !== undefined && host !== null ? instances.get(host) : constructed === 1 ? current : null;
  if (s) return s.neighbours(rest);
  return host !== undefined && host !== null
    ? { refused: "OWNER_NOT_READY", why: "no standards instance is constructed on this host yet" }
    : constructed === 0 ? { refused: "OWNER_NOT_READY", why: "no standards instance is constructed yet" }
    : { refused: "OWNER_HOST_AMBIGUOUS", why: `${constructed} standards instances are held here and the read names no host` };
}
/** R28: the owner's registration (`connection-grammar` R2), over an instance, for a registry a caller holds. */
export const connectionOwnerOf = (s) => ({ owner: CONNECTION_OWNER, kinds: CONNECTION_KINDS.map((k) => ({ ...k })),
                                          neighbours: (a) => s.neighbours(a) });
/* R28: registered once at load as a connection owner. */
registerOwner({ owner: CONNECTION_OWNER, kinds: CONNECTION_KINDS.map((k) => ({ ...k })),
  neighbours: ownerRead });

/** K61: the one instance per host, created on the first call with `deps`. Its tables are created with it (R16); it
 *  registers its check with promotion (R39, for R11) and its tables with purge (R14). */
export function standardsOf(host, deps) {
  let s = instances.get(host);
  if (!s) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    s = new Standards({ ...d, storage, record, membership, promotion,
                        content: d.content || (() => contentOf(host, { record, membership })),
                        events: d.events || (() => eventsOf(host, { record, membership })) });
    instances.set(host, s);
    current = s;
    constructed++;
    record.declareTable("standards", STANDARDS_TABLES.map((t) => ({ ...t })));
    promotion.registerStep("standards", { check: (c) => s.check(c) });
  }
  return s;
}
