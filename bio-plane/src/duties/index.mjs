/* duties — the one obligation object (requirements: `build/requirements/duties.md`; plan T33-35; K1431, K1440 as
 * amended by K1453, K1442, K1443, K1444, K1447, K1466, K1470, K1505 (12)). Who owes what, to whom, by when, under which
 * authority. A duty `DUT-` is a duty, a prohibition or a power, held from its source at its version and adopted by a
 * member's act (R1–R8). Its occurrences are derived on read from its trigger, its source in force and the events that
 * meet it (R9–R12); each change of an occurrence's state is recorded, append-only (R13, R14). "Overdue" raises a
 * question, never a violation (R11). Powers are read as the instruments that grant them (R15).
 *
 * No place is named here (R23): the response vocabulary, the rules and the calendar are the active jurisdiction
 * profiles' data, read through the view. No due date is stored (R21): `civil-time` computes it on every read, and
 * nothing here reads "now" for a state: every derivation takes its caller's `asOf` (R9).
 *
 * REACHED as `dutiesOf(host, deps)` (K61): one instance per host, created on the first call with `deps`, which creates
 * and declares its tables (R22) and registers its store gates (R21) and its connection owner (R18). `deps`:
 *   record, membership     the real modules on the same host unless a test passes its own.
 *   entities, standards, events, lines, money, provenance, content
 *                          the services of the modules this one uses, as their requirements state them; `plane` wires
 *                          the real ones (T33-90). A service a call needs and does not have answers undetermined.
 *   view()                 the active jurisdiction view (default: record-core's `jurisdiction_profiles` combined).
 *   registry               connection-grammar's registry (default: the plane's default registry).
 *   factOf(entry)          a calendar entry's status on this instance (`local-facts`' R2, as `civil-time` R9 takes it;
 *                          plane wires it), so a disputed or corrected closure list moves the due date.
 *   now(), clockMs()       the module's clock for act stamps (an ISO instant) and the transitions' time budget. */

import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { canonicalJson, isHypothesisId, sha256HexSync, ISO_TS_RE } from "../record-grammar/index.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, listenerRefusal, MODULE_ORDER } from "../membership/index.mjs";
import { noSuchEntity, noEntity, entitiesOf } from "../entities/index.mjs";
import { noSuchStandard, standardsOf } from "../standards/index.mjs";
import { noSuchEvent, eventsOf } from "../events/index.mjs";
import { linesOf } from "../lines/index.mjs";
import { noSuchFact, moneyOf } from "../money/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { contentOf } from "../content/index.mjs";
import { OBSERVATION_LEVELS } from "../observation-log/index.mjs";
import { compare, bounds, due as civilDue, overdueOn, expandRecurrence, isCalendarDate, validAt as civilValidAt } from "../civil-time/index.mjs";
import { defaultRegistry, derivedId, BOUNDS } from "../connection-grammar/index.mjs";
import { relate } from "../calc-grammar/decimal.mjs";
import { combine as combineProfiles } from "../../../jurisdictions/index.mjs";
import { DUTIES_CHECKS, refusal } from "./checks.mjs";
import { DUTIES_TABLES, migrateDuties } from "./schema.mjs";
import { MODALITIES, SOURCE_KINDS, TRIGGER_KINDS, BASIS_KINDS, OCCURRENCE_STATES, PUBLIC_KINDS, ORGANISATION_KINDS,
         ACTING_LINES, LEVEL_SEARCHED, CONNECTION_KINDS } from "./vocab.mjs";

export { DUTIES_CHECKS } from "./checks.mjs";
export { DUTIES_SCHEMA, DUTIES_TABLES, DUTIES_TABLE_NAMES } from "./schema.mjs";
export * from "./vocab.mjs";

export const MODULE = "duties";
/** R7: `dutiesOf`'s bounds. */
export const LIST_DEFAULT = 100, LIST_MAX = 500;
/** R13: the transitions' consumer reads each tracked duty's occurrences from this many days before its adoption. */
export const TRACK_BACK_DAYS = 366;
/** R13: the stamp the scheduler's consumer records under unless its caller stamps its own (DEC-52). */
export const SCHEDULER_STAMP = "class:scheduler";
/** Bounds on a member's words, in characters. */
export const WORDS_MAX = 4000, CLAUSE_MAX = 2000, REASON_MAX = 2000;

const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v) => (typeof v === "string" ? v.trim() : "");
const said = (v) => typeof v === "string" && v.trim() !== "";
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const AMOUNT_KEYS = new Set(["amount", "amounts", "sum", "total", "value_amount", "figure", "as_read"]);
const DUE_KEYS = new Set(["due", "due_date", "due_at_date", "deadline_date"]);
/* membership R43's recognised viewers; any other string sees nothing (fail closed). */
const KNOWN_VIEWER = /^(class:(admin|member|probe|daemon|ai)|member:[A-Za-z0-9._:-]{1,128}|admin)$/;
const isMember = (by) => said(by) && !isMachineIdentity(str(by));
const isUndet = (x) => !!(x && typeof x === "object" && (x.undetermined || x.refused));
const minusSecond = (instant) => new Date(Date.parse(instant) - 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
const addDays = (day, n) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

/* Every string value anywhere in `v`, and every key, walked once (R21's one-home checks). */
function walk(v, fn, key = null) {
  fn(key, v);
  if (Array.isArray(v)) for (const x of v) walk(x, fn, null);
  else if (isObj(v)) for (const [k, x] of Object.entries(v)) walk(x, fn, k);
}

/* ===================================================================== *
 * Refusals answered at one site each (DEC-49)
 * ===================================================================== */

/** R2, R3, R6, R12, R13: an act only a member makes. */
function memberOnly(by, act) {
  /* DEC-49 REGION is-duty-member */
  if (isMember(by)) return null;
  return refusal("MEMBER_ACT_ONLY", `${act} is a member's own act; the machine may only propose.`, { by: said(by) ? str(by) : null });
  /* END DEC-49 REGION is-duty-member */
}
/** R2, R3: adoption names its clause. */
function noClause(clause) {
  /* DEC-49 REGION is-duty-clause */
  if (said(clause) && clause.length <= CLAUSE_MAX) return null;
  return refusal("NO_CLAUSE", `name the clause the obligation rests on, in 1 to ${CLAUSE_MAX} characters.`, { max: CLAUSE_MAX });
  /* END DEC-49 REGION is-duty-clause */
}
/** R6, R12: a reason in the member's words. */
function noReason(reason) {
  /* DEC-49 REGION is-duty-reason */
  if (said(reason) && reason.length <= REASON_MAX) return null;
  return refusal("NO_REASON", `give your reason, in 1 to ${REASON_MAX} characters.`, { max: REASON_MAX });
  /* END DEC-49 REGION is-duty-reason */
}
/** R7: a request naming no duty. */
function noDuty() {
  /* DEC-49 REGION is-duty-named */
  return refusal("NO_DUTY", "an obligation is named by its id (DUT-...).");
  /* END DEC-49 REGION is-duty-named */
}
/** R6, R7, R9, R12–R14, R17: no duty the caller may see answers to the id; an invisible one answers alike. */
function noSuchDuty(dutyId) {
  /* DEC-49 REGION is-duty-held */
  return refusal("NO_SUCH_DUTY", "no obligation you can see answers to that id.", { duty_id: typeof dutyId === "string" ? dutyId.slice(0, 80) : null });
  /* END DEC-49 REGION is-duty-held */
}

/* ===================================================================== *
 * The module
 * ===================================================================== */

export class Duties {
  #sources = [];   /* R16: [{module, fn}] */
  #deps = {};      /* the used modules' services, each an instance or a function answering it on first use */
  #evidence = [];  /* R12: [{module, fn}] */

  constructor({ storage, record, membership = null, entities = null, standards = null, events = null, lines = null,
                money = null, provenance = null, content = null, view = null, registry = defaultRegistry,
                now = null, clockMs = null, factOf = null } = {}) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.#deps = { entities, standards, events, lines, money, provenance, content };
    this.registry = registry;
    this.factOf = typeof factOf === "function" ? factOf : null;
    this.viewFn = typeof view === "function" ? view : null;
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
    this.clockMs = typeof clockMs === "function" ? clockMs : () => Date.now();
    migrateDuties(this.sql);
  }

  #dep(name) { const d = this.#deps[name]; return typeof d === "function" ? (this.#deps[name] = d()) : d ?? null; }
  get entities() { return this.#dep("entities"); }
  get standards() { return this.#dep("standards"); }
  get events() { return this.#dep("events"); }
  get lines() { return this.#dep("lines"); }
  get money() { return this.#dep("money"); }
  get provenance() { return this.#dep("provenance"); }
  get content() { return this.#dep("content"); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { return this.#rows(q, ...a)[0] || null; }
  #stamp() { return stampInstant("second", Date.parse(this.now())); }
  migrate() { migrateDuties(this.sql); }

  /** The active jurisdiction view (record-core R26, jurisdictions R12–R16); `{}` when none combines. */
  view() {
    if (this.viewFn) { try { return this.viewFn() || {}; } catch { return {}; } }
    const ids = this.record.getSetting("jurisdiction_profiles");
    if (!Array.isArray(ids) || !ids.length) return {};
    const c = combineProfiles(ids);
    return c && c.ok ? c.view : {};
  }
  #zone(view = this.view()) { return view.time_zone && typeof view.time_zone.value === "string" ? view.time_zone.value : "UTC"; }

  /* A date-time as civil-time takes it: a `YYYY-MM-DD` day in the view's zone, an instant, or a date-time object. */
  #dt(v, zone = this.#zone()) {
    if (typeof v === "string") {
      if (DAY_RE.test(v)) return isCalendarDate(v) ? { value: v, precision: "day", zone } : null;
      return ISO_TS_RE.test(v) ? v : null;
    }
    if (isObj(v) && typeof v.value === "string" && typeof v.precision === "string")
      return { value: v.value, precision: v.precision, zone: typeof v.zone === "string" ? v.zone : zone };
    return null;
  }
  /* An event's `when` (events R9) as a date-time; null for "placed nowhere", `{undetermined, why}` for a stale cache. */
  #whenOf(ev) {
    const w = ev && ev.when;
    if (w === null || w === undefined) return null;
    if (w === "undetermined") return { undetermined: true, why: ev.why || "the event's date is undetermined (cache stale)" };
    if (isUndet(w)) return { undetermined: true, why: w.why || "the event's date is undetermined" };
    if (typeof w === "string" || (isObj(w) && typeof w.value === "string")) return this.#dt(w, isObj(w) && w.zone ? w.zone : this.#zone());
    if (isObj(w) && typeof w.start === "string") {
      const p = w.precision || "day";
      const cut = { day: 10, minute: 16, second: 19 }[p];
      const value = cut ? w.start.slice(0, cut) : w.start;
      return this.#dt({ value, precision: cut ? p : "edtf", zone: w.zone || this.#zone() });
    }
    return { undetermined: true, why: "the event's date is not in a form this module reads" };
  }

  /* ---- other modules' services, each optional: an absent one answers null ---- */
  #entity(id) {
    if (!said(id) || !this.entities) return null;
    try { const r = this.entities.readEntity({ entityId: id, viewer: SYSTEM_VIEWER }); return r && r.ok && r.found ? r.entity : null; } catch { return null; }
  }
  #standard(id, viewer = null) {
    if (!said(id) || !this.standards) return null;
    try { const r = this.standards.standardRead({ id, viewer: viewer ?? SYSTEM_VIEWER }); return r && r.ok !== false ? r : null; } catch { return null; }
  }
  #event(id, viewer = null) {
    if (!said(id) || !this.events) return null;
    try { const r = this.events.readEvent({ eventId: id, viewer: viewer ?? SYSTEM_VIEWER }); return r && r.ok !== false && r.found !== false ? (r.event || r) : null; } catch { return null; }
  }
  #fact(id, viewer = null) {
    if (!said(id) || !this.money) return null;
    try { const r = this.money.readFact({ factId: id, viewer: viewer ?? SYSTEM_VIEWER }); return r && r.ok !== false && r.found !== false ? (r.fact || r) : null; } catch { return null; }
  }
  #isPublic(e) {
    if (!e) return false;
    if (e.kind === "office") return true;
    return ORGANISATION_KINDS.includes(e.kind) && e.sector === "government";
  }

  /* ===================================================================== *
   * R1: the refusals for a duty's fields, in order
   * ===================================================================== */

  /** R1 (and R4, R22): `null` when the fields stand, else the first refusal. The fields are normalised into `out`. */
  fieldRefusal(f, out = {}) {
    const view = this.view();
    /* DEC-49 REGION is-duty-modality */
    if (!MODALITIES.includes(f.modality))
      return refusal("UNKNOWN_MODALITY", `a modality is one of ${MODALITIES.join(", ")}.`, { modalities: [...MODALITIES] });
    /* END DEC-49 REGION is-duty-modality */
    /* DEC-49 REGION is-duty-obligor */
    if (!said(f.obligor)) return refusal("NO_OBLIGOR", "an obligation names its obligor (an entity id).");
    /* END DEC-49 REGION is-duty-obligor */
    const obligor = this.#entity(f.obligor);
    if (!obligor) return noSuchEntity(f.obligor, { end: "obligor" });
    for (const end of ["obligee", "enforcer", "observed_by"]) {
      if (f[end] === undefined || f[end] === null) continue;
      if (!said(f[end]) || !this.#entity(f[end])) return noSuchEntity(f[end] ?? null, { end });
    }
    const src = isObj(f.source) ? f.source : {};
    if (obligor.kind === "person") {
      /* DEC-49 REGION is-duty-person */
      if (!["standard", "court"].includes(src.kind) || !said(src.binds))
        return refusal("PERSON_OBLIGOR_NEEDS_LAW", "a person owes an obligation only where a held law or court order binds "
          + "them by name or role: cite it as the source and say what it binds (source.binds).");
      /* END DEC-49 REGION is-duty-person */
    } else if (!PUBLIC_KINDS.includes(obligor.kind) && !this.#isPublic(obligor)) {
      const acting = ORGANISATION_KINDS.includes(obligor.kind) ? this.#actingFor(f.obligor) : null;
      /* DEC-49 REGION is-duty-public */
      if (!acting)
        return refusal("NOT_ACTING_FOR_PUBLIC", ORGANISATION_KINDS.includes(obligor.kind)
          ? `this organisation's sector is ${obligor.sector ?? "undetermined"}, and no ${ACTING_LINES.join(" or ")} line ties it to a public body.`
          : `an entity of kind ${obligor.kind} owes no obligation.`, { obligor: f.obligor });
      /* END DEC-49 REGION is-duty-public */
      /* DEC-49 REGION is-duty-enforcer */
      if (!said(f.enforcer))
        return refusal("NO_ENFORCER", "an obligation owed by an organisation outside government names the office that enforces it (enforcer).");
      /* END DEC-49 REGION is-duty-enforcer */
      out.acting_for = acting;
    }
    const s = this.#sourceRefusal(src);
    if (s) return s;
    const t = this.#triggerRefusal(isObj(f.trigger) ? f.trigger : {}, view);
    if (t) return t;
    const tm = isObj(f.time) ? f.time : {};
    /* DEC-49 REGION is-duty-basis */
    if (!BASIS_KINDS.includes(tm.basis))
      return refusal("UNKNOWN_BASIS_KIND", `a due date's basis is one of ${BASIS_KINDS.join(", ")}.`, { bases: [...BASIS_KINDS] });
    /* END DEC-49 REGION is-duty-basis */
    /* DEC-49 REGION is-duty-time */
    if (tm.basis === "rule" && !said(tm.rule)) return refusal("BAD_TIME", "a rule basis names the rule (time.rule) it is computed from.");
    if ((tm.basis === "commitment" || tm.basis === "window") && tm.date !== undefined && !this.#dt(tm.date))
      return refusal("BAD_TIME", "a commitment's or window's date is a calendar day or a date-time.");
    if (tm.basis === "dependency" && (tm.lead === undefined || tm.lead === null || !said(tm.why)))
      return refusal("BAD_TIME", "a dependency names its lead (time.lead) and why (time.why).");
    /* END DEC-49 REGION is-duty-time */
    /* DEC-49 REGION is-duty-performance */
    if (!isObj(f.performance) || !said(f.performance.act) || f.performance.act.length > WORDS_MAX)
      return refusal("NO_PERFORMANCE", `say the act owed, in 1 to ${WORDS_MAX} characters (performance.act).`);
    /* END DEC-49 REGION is-duty-performance */
    const a = this.#amountRefusal(f);
    if (a) return a;
    for (const id of Array.isArray(f.performance.money_facts) ? f.performance.money_facts : []) {
      if (!this.#fact(id)) return noSuchFact(typeof id === "string" ? id.slice(0, 80) : null);
    }
    if (f.arising_in !== undefined && f.arising_in !== null) {
      const ai = f.arising_in;
      const proc = said(ai) && /^ENT-/.test(ai) ? this.#entity(ai) : null;
      const home = said(ai) && /^[0-9a-f]{64}$/.test(ai) && this.provenance ? this.provenance.homeOf(ai) : null;
      /* DEC-49 REGION is-duty-arising */
      if (!(proc && proc.kind === "proceeding") && !home)
        return refusal("ARISING_IN_NOT_HELD", "arising_in names a registered proceeding or a held capture.", { arising_in: said(ai) ? ai.slice(0, 80) : null });
      /* END DEC-49 REGION is-duty-arising */
    }
    const statuses = Array.isArray(view.response_statuses) ? view.response_statuses.map((x) => x && x.status).filter(said) : [];
    for (const rs of Array.isArray(f.reported_status) ? f.reported_status : f.reported_status === undefined ? [] : [f.reported_status]) {
      /* DEC-49 REGION is-duty-reported */
      if (!isObj(rs) || !statuses.includes(rs.status))
        return refusal("UNKNOWN_REPORTED_STATUS", statuses.length
          ? `a reported status is one of the profile's response vocabulary: ${statuses.join(", ")}.`
          : "the active jurisdiction profiles hold no response vocabulary, so no status can be quoted.", { statuses });
      /* END DEC-49 REGION is-duty-reported */
      const row = said(rs.extent) && this.content ? this.content.contentRow(rs.extent) : null;
      /* DEC-49 REGION is-duty-extent */
      if (!row) return refusal("EXTENT_NOT_HELD", "a reported status quotes a held passage (its content id).", { extent: said(rs.extent) ? rs.extent.slice(0, 80) : null });
      /* END DEC-49 REGION is-duty-extent */
    }
    if (f.project !== undefined && f.project !== null && !(said(f.project) && this.record.bundleInfo(f.project)))
      return refusal("ARISING_IN_NOT_HELD", "the project named is not held.", { project: said(f.project) ? f.project.slice(0, 80) : null });
    return null;
  }

  /* K1440, K1505 (12): a live `acts_for` or `contracts_with` line from the organisation to a public body, or null. */
  #actingFor(entity) {
    if (!this.lines) return null;
    let r;
    try { r = this.lines.linesOf({ entity, kinds: [...ACTING_LINES], direction: "both", limit: LIST_MAX, viewer: SYSTEM_VIEWER }); } catch { return null; }
    const lines = r && Array.isArray(r.lines) ? r.lines : r && Array.isArray(r.items) ? r.items : [];
    for (const l of lines) {
      if (!l || l.withdrawn || !ACTING_LINES.includes(l.kind)) continue;
      const other = l.from === entity ? l.to : l.kind === "contracts_with" && l.to === entity ? l.from : null;
      if (other && this.#isPublic(this.#entity(other))) return { line: l.line_id ?? null, kind: l.kind, body: other };
    }
    return null;
  }

  /* R1: the source union. */
  #sourceRefusal(src) {
    /* DEC-49 REGION is-duty-source */
    if (!SOURCE_KINDS.includes(src.kind))
      return refusal("UNKNOWN_SOURCE_KIND", `a source is one of ${SOURCE_KINDS.join(", ")}.`, { kinds: [...SOURCE_KINDS] });
    /* END DEC-49 REGION is-duty-source */
    if (src.kind === "standard" || src.kind === "court") {
      const std = this.#standard(src.standard);
      if (!std) return noSuchStandard(said(src.standard) ? src.standard : null);
      if (src.kind === "court" && std.kind !== "court")
        return refusal("UNKNOWN_SOURCE_KIND", "a court source names a standard of kind court (an order, decree, or recommendation held as one).");
      const held = said(std.portion) ? std.portion : std.portion && said(std.portion.path) ? std.portion.path : null;
      /* DEC-49 REGION is-duty-portion */
      if (src.portion !== undefined && src.portion !== null
          && (!said(src.portion) || (held && src.portion !== held && !src.portion.startsWith(`${held}/`))))
        return refusal("NO_PORTION", "the portion named is not one the standard holds.", { portion: said(src.portion) ? src.portion.slice(0, 200) : null, held });
      /* END DEC-49 REGION is-duty-portion */
      if (src.version !== undefined && src.version !== null) {
        const v = this.#standard(src.version);
        const key = (x) => (!x ? null : said(x.instrument) ? x.instrument : x.instrument && said(x.instrument.key) ? x.instrument.key : null);
        /* DEC-49 REGION is-duty-version */
        if (!v || (key(std) ? key(std) !== key(v) : src.version !== src.standard))
          return refusal("VERSION_NOT_HELD", "the version named is not a held version of the standard's instrument.", { version: said(src.version) ? src.version.slice(0, 80) : null });
        /* END DEC-49 REGION is-duty-version */
      }
      return null;
    }
    if (src.kind === "practice" && !said(src.statement))
      return refusal("UNKNOWN_SOURCE_KIND", "a practice source states the measured practice (source.statement).");
    if (src.kind === "dependency" && !said(src.why))
      return refusal("UNKNOWN_SOURCE_KIND", "a dependency source says why the obligation must precede its event (source.why).");
    return null;
  }

  /* R1: the trigger union. */
  #triggerRefusal(t, view) {
    /* DEC-49 REGION is-duty-trigger */
    if (!TRIGGER_KINDS.includes(t.kind))
      return refusal("UNKNOWN_TRIGGER", `a trigger is one of ${TRIGGER_KINDS.join(", ")}.`, { kinds: [...TRIGGER_KINDS] });
    if (t.kind === "event" && !said(t.event_kind))
      return refusal("UNKNOWN_TRIGGER", "an event trigger names the event kind (trigger.event_kind) and the entity it concerns.");
    if (t.kind === "source" && !said(t.source))
      return refusal("UNKNOWN_TRIGGER", "a source trigger names the module whose items start it (trigger.source).");
    if (t.kind === "date" && !this.#dt(t.date))
      return refusal("UNKNOWN_TRIGGER", "a date trigger states its date (a calendar day or a date-time).");
    /* END DEC-49 REGION is-duty-trigger */
    if (t.kind === "event" && !this.#entity(t.entity)) return noSuchEntity(t.entity ?? null, { end: "trigger" });
    if (t.kind === "recurrence") {
      let r;
      try {
        r = typeof t.rrule === "string" && t.dtstart !== undefined
          ? expandRecurrence({ rrule: t.rrule, dtstart: t.dtstart, zone: t.zone || this.#zone(view), from: "2000-01-01", to: "2000-01-02" })
          : { refused: "RRULE_MISSING", why: "a recurrence names its rrule and dtstart" };
      } catch (e) { r = { refused: "RRULE_UNREADABLE", why: String(e && e.message || e) }; }
      /* DEC-49 REGION is-duty-recurrence */
      if (r.refused) return refusal("BAD_RECURRENCE", r.why, { civil_time: r.refused });
      /* END DEC-49 REGION is-duty-recurrence */
    }
    return null;
  }

  /* R1, R21: a duty never holds an amount (INT C-7); a pay duty cites money facts. */
  #amountRefusal(f) {
    let found = null;
    walk(f, (k) => { if (!found && k && AMOUNT_KEYS.has(k)) found = k; });
    /* DEC-49 REGION is-duty-amount */
    if (found) return refusal("HOLDS_AMOUNT", `the field '${found}' holds an amount; cite money facts (performance.money_facts) instead.`, { field: found });
    /* END DEC-49 REGION is-duty-amount */
    return null;
  }

  /** R21: the one-home checks every write to the module's tables asks (record-core R78's store gate). */
  oneHome(row, { op } = {}) {
    if (op !== "insert" && (row && (row.table === "duty_transitions" || row.table === "duty_versions" || row.table === "duty_matches")))
      return refusal("APPEND_ONLY", `${row.table} is appended to and never ${op === "delete" ? "deleted from" : "updated"}.`);
    const fields = row && row.fields_json ? safeJson(row.fields_json) : null;
    let hyp = null, dueKey = null, amount = null;
    walk(row, (k, v) => {
      if (!hyp && typeof v === "string") for (const tok of v.split(/[^A-Za-z0-9-]+/)) if (isHypothesisId(tok)) { hyp = tok; break; }
    });
    if (fields) walk(fields, (k, v) => {
      if (!dueKey && k && DUE_KEYS.has(k)) dueKey = k;
      if (!amount && k && AMOUNT_KEYS.has(k)) amount = k;
      if (!hyp && typeof v === "string") for (const tok of v.split(/[^A-Za-z0-9-]+/)) if (isHypothesisId(tok)) { hyp = tok; break; }
    });
    /* DEC-49 REGION is-duty-no-hypothesis */
    if (hyp) return refusal("HOLDS_HYPOTHESIS", "a hypothesis id is held in a field.", { id: hyp });
    /* END DEC-49 REGION is-duty-no-hypothesis */
    /* DEC-49 REGION is-duty-no-due */
    if (dueKey) return refusal("HOLDS_DUE_DATE", `the field '${dueKey}' would store a due date.`, { field: dueKey });
    /* END DEC-49 REGION is-duty-no-due */
    if (amount) return refusal("HOLDS_AMOUNT", `the field '${amount}' holds an amount.`, { field: amount });
    return null;
  }

  /* Every write goes through here: the store gate asked first, inside the caller's transaction (R21, R19's one site). */
  #write(table, row, op = "insert") {
    const g = this.record.storeGate(MODULE, table, { table, ...row }, op);
    if (g) return g;
    if (op !== "insert") throw new Error(`duties writes ${table} only by insert or by its pointer columns`);
    const cols = Object.keys(row);
    this.sql.exec(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`, ...cols.map((c) => row[c]));
    return null;
  }

  /* The fields a duty holds (Terms), normalised: only the known keys, never a due date or an amount (R21). */
  static #fields(f) {
    const keys = ["modality", "obligor", "obligee", "performance", "source", "trigger", "time", "exceptions", "enforcer",
                  "observed_by", "arising_in", "reported_status", "delegation", "project"];
    const out = {};
    for (const k of keys) if (f[k] !== undefined && f[k] !== null) out[k] = clone(f[k]);
    if (!Array.isArray(out.exceptions)) out.exceptions = out.exceptions === undefined ? [] : [out.exceptions];
    if (out.reported_status !== undefined && !Array.isArray(out.reported_status)) out.reported_status = [out.reported_status];
    return out;
  }

  /* ===================================================================== *
   * R2, R3, R5: propose, adopt, declare
   * ===================================================================== */

  /** R2: a duty a rule computed or the machine (or a member) proposed, stored apart and labelled, never tracked. */
  propose(a = {}) {
    const b = isObj(a) ? a : {};
    if (!said(b.by)) return memberOnly(b.by, "proposing an obligation with no stamp");
    const fields = Duties.#fields(b);
    const r = this.fieldRefusal(fields);
    if (r) return r;
    const at = this.#stamp();
    return this.record.transact(() => {
      const g = this.#write("duty_proposals", { fields_json: canonicalJson(fields), proposed_by: str(b.by), why: said(b.why) ? b.why.slice(0, WORDS_MAX) : null, at });
      if (g) return g;
      const id = this.#one(`SELECT last_insert_rowid() AS id`).id;
      return { ok: true, proposal_id: id, label: Duties.#label(str(b.by)), tracked: false, at,
               says: "a proposed obligation: stored apart, never tracked until a member adopts it" };
    });
  }

  static #label(by) {
    const machine = isMachineIdentity(by);
    return { by, machine_work: machine, state: machine ? "machine_proposed" : "member_proposed" };
  }

  /** R5: a profile deadline proposed as a generic duty of the office the rule names, triggered through a registered
   *  source (R16), its due computed by the rule (`time.basis: rule`). The caller names the office's entity and the
   *  held standard the rule comes from; the rule must be held by the active profiles. */
  proposeFromRule(a = {}) {
    const b = isObj(a) ? a : {};
    const view = this.view();
    const rules = Array.isArray(view.deadlines) ? view.deadlines : [];
    const rule = rules.find((d) => d && d.rule === b.rule && (!said(b.applies_to) || d.applies_to === b.applies_to));
    if (!rule) return refusal("BAD_TIME", "the active jurisdiction profiles hold no such rule.", { rule: said(b.rule) ? b.rule : null });
    return this.propose({
      modality: "duty", obligor: b.office, obligee: b.obligee ?? null,
      performance: { act: said(b.act) ? b.act : `respond as ${rule.citation || rule.rule} requires` },
      source: b.source, trigger: { kind: "source", source: b.trigger_source },
      time: { basis: "rule", rule: rule.rule, applies_to: rule.applies_to, ...(said(b.office_role) ? { office: b.office_role } : {}) },
      by: b.by, why: `computed from the profile rule ${rule.rule} (${rule.citation || "no citation"})`,
    });
  }

  /** R2, R3: a member adopts a proposal in one act, naming the clause. */
  adopt(a = {}) {
    const b = isObj(a) ? a : {};
    const m = memberOnly(b.by, "adopting an obligation");
    if (m) return m;
    const c = noClause(b.clause);
    if (c) return c;
    const p = this.#one(`SELECT * FROM duty_proposals WHERE proposal_id=?`, Number(b.proposalId));
    /* DEC-49 REGION is-duty-proposal */
    if (!p) return refusal("NO_SUCH_PROPOSAL", "no proposal answers to that id.", { proposal_id: b.proposalId ?? null });
    if (p.adopted_duty) return refusal("ALREADY_ADOPTED", "the proposal was adopted.", { duty_id: p.adopted_duty });
    /* END DEC-49 REGION is-duty-proposal */
    const fields = safeJson(p.fields_json);
    const r = this.fieldRefusal(fields);
    if (r) return r;
    return this.#adoptFields(fields, { by: str(b.by), clause: b.clause, proposal: p.proposal_id });
  }

  /** R3: a member's own declaration is its adoption in the same act. */
  declare(a = {}) {
    const b = isObj(a) ? a : {};
    const m = memberOnly(b.by, "declaring an obligation");
    if (m) return m;
    const c = noClause(b.clause);
    if (c) return c;
    const fields = Duties.#fields(b);
    const r = this.fieldRefusal(fields);
    if (r) return r;
    return this.#adoptFields(fields, { by: str(b.by), clause: b.clause, proposal: null });
  }

  /* R3: allocates `DUT-<year>-NNNN`, records who, when and the clause, version 1. */
  #adoptFields(fields, { by, clause, proposal }) {
    const at = this.#stamp();
    return this.record.transact(() => {
      const alloc = this.record.allocId("DUT", at.slice(0, 4));
      if (!alloc || !alloc.id) return alloc;
      const id = alloc.id;
      let g = this.#write("duties", { duty_id: id, modality: fields.modality, obligor: fields.obligor, obligee: fields.obligee ?? null,
                                      enforcer: fields.enforcer ?? null, arising_in: Duties.capturedIn(fields), version: 1, adopted_by: by, adopted_at: at, clause: clause.trim(),
                                      proposal_id: proposal });
      if (g) return g;
      g = this.#write("duty_versions", { duty_id: id, version: 1, fields_json: canonicalJson(fields), reason: null, by_member: by, at });
      if (g) return g;
      if (proposal !== null) this.sql.exec(`UPDATE duty_proposals SET adopted_duty=? WHERE proposal_id=? AND adopted_duty IS NULL`, id, proposal);
      return { ok: true, duty_id: id, version: 1, adopted_by: by, at, clause: clause.trim(), proposal_id: proposal, tracked: true };
    });
  }

  /* ===================================================================== *
   * R6: revise, withdraw
   * ===================================================================== */

  /** R6: a new version with who, when and why; R1 re-checked; every earlier version kept. */
  revise(a = {}) {
    const b = isObj(a) ? a : {};
    const m = memberOnly(b.by, "revising an obligation");
    if (m) return m;
    const n = noReason(b.reason);
    if (n) return n;
    if (!said(b.dutyId)) return noDuty();
    const d = this.#one(`SELECT * FROM duties WHERE duty_id=?`, b.dutyId);
    if (!d) return noSuchDuty(b.dutyId);
    /* DEC-49 REGION is-duty-live */
    if (d.withdrawn_at) return refusal("DUTY_WITHDRAWN", "a withdrawn obligation is not revised.", { duty_id: d.duty_id });
    /* END DEC-49 REGION is-duty-live */
    const cur = this.#fieldsOf(d.duty_id, d.version);
    const changes = Duties.#fields(b);
    const next = Duties.#fields({ ...cur, ...changes });
    const r = this.fieldRefusal(next);
    if (r) return r;
    const at = this.#stamp();
    return this.record.transact(() => {
      const v = d.version + 1;
      const g = this.#write("duty_versions", { duty_id: d.duty_id, version: v, fields_json: canonicalJson(next), reason: b.reason.trim(), by_member: str(b.by), at });
      if (g) return g;
      this.sql.exec(`UPDATE duties SET version=?, obligee=?, enforcer=?, obligor=?, modality=?, arising_in=? WHERE duty_id=?`,
                    v, next.obligee ?? null, next.enforcer ?? null, next.obligor, next.modality, Duties.capturedIn(next), d.duty_id);
      return { ok: true, duty_id: d.duty_id, version: v, prior_version: d.version, by: str(b.by), at, reason: b.reason.trim() };
    });
  }

  /** R6: a withdrawn duty remains, shown withdrawn, and derives no further occurrences. */
  withdraw(a = {}) {
    const b = isObj(a) ? a : {};
    const m = memberOnly(b.by, "withdrawing an obligation");
    if (m) return m;
    const n = noReason(b.reason);
    if (n) return n;
    if (!said(b.dutyId)) return noDuty();
    const d = this.#one(`SELECT * FROM duties WHERE duty_id=?`, b.dutyId);
    if (!d) return noSuchDuty(b.dutyId);
    if (d.withdrawn_at) return { ok: true, already: true, duty_id: d.duty_id, withdrawn_at: d.withdrawn_at, withdrawn_by: d.withdrawn_by };
    const at = this.#stamp();
    return this.record.transact(() => {
      this.sql.exec(`UPDATE duties SET withdrawn_at=?, withdrawn_by=?, withdraw_reason=? WHERE duty_id=? AND withdrawn_at IS NULL`,
                    at, str(b.by), b.reason.trim(), d.duty_id);
      return { ok: true, duty_id: d.duty_id, withdrawn_at: at, withdrawn_by: str(b.by), reason: b.reason.trim() };
    });
  }

  /** R20 (K1563): the capture a duty's source item rests on, for the read contract's `arising_in`; else null. */
  static capturedIn(fields) {
    return said(fields.arising_in) && /^[0-9a-f]{64}$/.test(fields.arising_in) ? fields.arising_in : null;
  }

  #fieldsOf(dutyId, version) {
    const v = this.#one(`SELECT fields_json FROM duty_versions WHERE duty_id=? AND version=?`, dutyId, version);
    return v ? safeJson(v.fields_json) : null;
  }

  /* ===================================================================== *
   * R7, R8, R22: reads, sight, in force
   * ===================================================================== */

  /** R22: whether `viewer` may see a duty: every bundle its fields name (its project, the capture it arises in, each
   *  quoted passage's) must be in the viewer's sight; one with none follows its source, group-wide. An absent viewer
   *  sees nothing (internal callers pass `INTERNAL`). */
  visible(fields, viewer) {
    if (viewer === INTERNAL) return true;
    if (typeof viewer !== "string" || !KNOWN_VIEWER.test(viewer) || !fields) return false;
    const bundles = [];
    if (said(fields.project)) bundles.push(fields.project);
    if (said(fields.arising_in) && /^[0-9a-f]{64}$/.test(fields.arising_in)) {
      const h = this.provenance ? this.provenance.homeOf(fields.arising_in) : null;
      bundles.push(h ? h.bundleId : null);
    }
    for (const rs of Array.isArray(fields.reported_status) ? fields.reported_status : []) {
      const row = this.content && said(rs.extent) ? this.content.contentRow(rs.extent) : null;
      if (!row) bundles.push(null);
      else if (row.bundle_id) bundles.push(row.bundle_id);
    }
    return bundles.every((bid) => said(bid) && !!this.membership && this.membership.inSight(bid, viewer));
  }

  /** R8: `in_force` derived at `date`, never stored. */
  inForce(fields, date, viewer = null) {
    const src = fields.source || {};
    if (src.kind === "practice") return { state: "held as practice", why: "a measured practice is held as practice, never as a law in force" };
    if (src.kind === "dependency") return { state: "held as a dependency", why: "a dependency is held as a dependency, never as a law in force" };
    if (!this.standards || typeof this.standards.inForceAt !== "function")
      return { state: "undetermined", why: "the standards service is not available to answer whether the source is in force" };
    try {
      const r = this.standards.inForceAt({ standard: src.standard, portion: src.portion, date, viewer });
      if (!r || !r.state) return { state: "undetermined", why: "the standard's in-force answer was not given" };
      return { state: r.state, why: r.why ?? null, ...(r.version ? { version: r.version } : {}) };
    } catch (e) { return { state: "undetermined", why: `the in-force read failed: ${String(e && e.message || e).slice(0, 200)}` }; }
  }

  #dutyView(d, viewer, date) {
    const fields = this.#fieldsOf(d.duty_id, d.version);
    const versions = this.#rows(`SELECT version, fields_json, reason, by_member, at FROM duty_versions WHERE duty_id=? ORDER BY version`, d.duty_id)
      .map((v) => ({ version: v.version, fields: safeJson(v.fields_json), reason: v.reason, by: v.by_member, at: v.at }));
    const p = d.proposal_id === null ? null : this.#one(`SELECT * FROM duty_proposals WHERE proposal_id=?`, d.proposal_id);
    return {
      duty_id: d.duty_id, ...fields, version: d.version, versions,
      proposal: p ? { proposal_id: p.proposal_id, ...Duties.#label(p.proposed_by), why: p.why, at: p.at } : null,
      adoption: { by: d.adopted_by, at: d.adopted_at, clause: d.clause },
      withdrawn: d.withdrawn_at ? { at: d.withdrawn_at, by: d.withdrawn_by, reason: d.withdraw_reason } : null,
      in_force: { date, ...this.inForce(fields, date, viewer) },
      words: fields.modality === "power" ? "power" : "obligation",
    };
  }

  /** R7: every field, its versions, its proposal and adoption, and `in_force` at the read's date. */
  readDuty(a = {}) {
    const b = isObj(a) ? a : {};
    if (!said(b.dutyId)) return noDuty();
    const d = this.#one(`SELECT * FROM duties WHERE duty_id=?`, b.dutyId);
    if (!d || !this.visible(this.#fieldsOf(d.duty_id, d.version), b.viewer)) return { ok: true, found: false, duty_id: b.dutyId };
    const date = said(b.at) ? b.at.slice(0, 10) : this.#stamp().slice(0, 10);
    return { ok: true, found: true, duty: this.#dutyView(d, b.viewer, date) };
  }

  /** R7: the duties by the entity's place in them, bounded 1–500, from the index `duties (obligor)`. */
  dutiesOf(a = {}) {
    const b = isObj(a) ? a : {};
    if (!said(b.entity)) return noEntity("duties are listed for one entity, named by its id");
    const as = b.as === undefined || b.as === null ? "obligor" : b.as;
    if (!["obligor", "obligee", "enforcer"].includes(as))
      return { ok: false, reason: "BAD_PLACE", detail: "as is one of obligor, obligee, enforcer" };
    const n = Number(b.limit);
    const limit = Number.isInteger(n) ? Math.min(Math.max(n, 1), LIST_MAX) : LIST_DEFAULT;
    const date = said(b.at) ? b.at.slice(0, 10) : this.#stamp().slice(0, 10);
    const out = [];
    let truncated = false;
    for (const d of this.#rows(`SELECT * FROM duties WHERE ${as}=? ORDER BY duty_id`, b.entity)) {
      if (!this.visible(this.#fieldsOf(d.duty_id, d.version), b.viewer)) continue;
      if (out.length === limit) { truncated = true; break; }
      out.push(this.#dutyView(d, b.viewer, date));
    }
    return { ok: true, entity: b.entity, as, duties: out, count: out.length, limit, truncated };
  }

  /* ===================================================================== *
   * R9–R12, R16: occurrences derived on read
   * ===================================================================== */

  /** R16: a later module registers once; `fn({duty, from, to})` answers its items that trigger an occurrence. */
  registerTriggerSource(module, fn) {
    const r = listenerRefusal(this.#sources, module, fn, { slot: "trigger_source" });
    if (r) return r;
    this.#sources.push({ module, fn });
    Duties.#order(this.#sources);
    return { ok: true, module };
  }
  /** R12: a later module registers once; `fn({duty, occurrence})` answers measured evidence R10 reads as a match. */
  registerOccurrenceEvidence(module, fn) {
    const r = listenerRefusal(this.#evidence, module, fn, { slot: "occurrence_evidence" });
    if (r) return r;
    this.#evidence.push({ module, fn });
    Duties.#order(this.#evidence);
    return { ok: true, module };
  }
  static #order(list) {
    const rank = (m) => { const i = MODULE_ORDER.indexOf(m); return i < 0 ? MODULE_ORDER.length : i; };
    list.sort((x, y) => rank(x.module) - rank(y.module));
  }

  /* R9: the occurrence key, deterministic from the duty, its version and its trigger instance. */
  static occurrenceKey(dutyId, version, kind, ref) {
    return `OCC-${sha256HexSync(canonicalJson({ duty: dutyId, version, trigger: kind, ref })).slice(0, 32)}`;
  }

  /* R9, R16: the trigger instances in the window, each `{kind, ref, date, label?}`; `sourceErrors` beside. */
  #instances(dutyId, version, fields, from, to, viewer) {
    const t = fields.trigger || {};
    const zone = this.#zone();
    const out = [], errors = [];
    const inWindow = (dt) => {
      if (!dt || isUndet(dt)) return true;
      const a = compare(dt, this.#dt(from, zone)), b = compare(dt, this.#dt(to, zone));
      return a !== "before" && b !== "after";
    };
    if (t.kind === "event") {
      let r = null;
      try { r = this.events ? this.events.eventsFor({ entity: t.entity, kinds: [t.event_kind], from, to, limit: LIST_MAX, viewer: viewer === INTERNAL || !viewer ? SYSTEM_VIEWER : viewer }) : null; } catch (e) { errors.push({ source: "events", error: String(e && e.message || e).slice(0, 200) }); }
      const evs = r ? [...(Array.isArray(r.events) ? r.events : Array.isArray(r.items) ? r.items : []),
                       ...(Array.isArray(r.placed_nowhere) ? r.placed_nowhere : [])] : [];
      if (r && r.truncated) errors.push({ source: "events", error: `the events read stopped at its bound of ${r.limit ?? LIST_MAX}`, truncated: true });
      if (!this.events) errors.push({ source: "events", error: "the events service is not available" });
      for (const ev of evs) {
        if (ev.kind !== undefined && ev.kind !== t.event_kind) continue;
        const date = this.#whenOf(ev);
        if (!inWindow(date)) continue;
        out.push({ kind: "event", ref: ev.event_id, date, label: ev.label ?? null });
      }
    } else if (t.kind === "recurrence") {
      let r;
      try { r = expandRecurrence({ rrule: t.rrule, dtstart: t.dtstart, zone: t.zone || zone, from: String(from).slice(0, 10), to: String(to).slice(0, 10) }); }
      catch (e) { r = { refused: "RRULE_UNREADABLE", why: String(e && e.message || e) }; }
      if (r.refused || r.undetermined) errors.push({ source: "recurrence", error: r.why });
      else {
        for (const i of r.instances) out.push({ kind: "recurrence", ref: i.value, date: { value: i.value, precision: i.precision, zone: i.zone } });
        if (r.truncated) errors.push({ source: "recurrence", error: "the expansion stopped at its bound (24 months or 500 instances)", truncated: true });
      }
    } else if (t.kind === "date") {
      const date = this.#dt(t.date, zone);
      if (inWindow(date)) out.push({ kind: "date", ref: typeof t.date === "string" ? t.date : t.date.value, date });
    } else if (t.kind === "source") {
      const s = this.#sources.find((x) => x.module === t.source);
      if (!s) errors.push({ source: t.source, error: "no module has registered this trigger source" });
      else {
        let items;
        try { items = s.fn({ duty: { duty_id: dutyId, version, ...clone(fields) }, from, to }); }
        catch (e) { errors.push({ source: t.source, error: String(e && e.message || e).slice(0, 200) }); items = []; }
        for (const it of Array.isArray(items) ? items : []) {
          /* R23: the group's own checkpoint is never an occurrence of a body's duty */
          if (!isObj(it) || it.group_checkpoint === true || !said(it.ref)) continue;
          const date = it.date === undefined || it.date === null ? null : this.#dt(it.date, zone) || { undetermined: true, why: "the source item's date is not readable" };
          if (!inWindow(date)) continue;
          out.push({ kind: "source", source: t.source, ref: it.ref, date, label: it.label ?? null });
        }
      }
    }
    return { instances: out, errors };
  }

  /* R9, R18 (K1431): the due date of one instance, `{due, basis_kind, law_set, trace}` or undetermined. */
  #dueOf(fields, date, view) {
    const tm = fields.time || {};
    if (!date) return { undetermined: true, why: "the trigger has no date: it is placed nowhere" };
    if (isUndet(date)) return { undetermined: true, why: `the trigger's date is undetermined: ${date.why}` };
    try {
      if (tm.basis === "rule") {
        const rules = Array.isArray(view.deadlines) ? view.deadlines : [];
        const rule = rules.find((d) => d && d.rule === tm.rule && (!said(tm.applies_to) || d.applies_to === tm.applies_to));
        if (!rule) return { undetermined: true, why: `the active jurisdiction profiles hold no rule ${tm.rule}${said(tm.applies_to) ? ` for ${tm.applies_to}` : ""}`, basis_kind: "rule", law_set: true };
        return civilDue({ basis: "rule", rule, anchor: date, view, office: tm.office ?? null, factOf: this.factOf });
      }
      if (tm.basis === "commitment" || tm.basis === "window") {
        const d = tm.date !== undefined ? this.#dt(tm.date) : date;
        return civilDue({ basis: tm.basis, date: d, citation: tm.citation ?? null });
      }
      if (tm.basis === "dependency") return civilDue({ basis: "dependency", precedes: date, lead: tm.lead, why: tm.why, view, factOf: this.factOf });
    } catch (e) { return { undetermined: true, why: `the due date could not be computed: ${String(e && e.message || e).slice(0, 200)}` }; }
    return { undetermined: true, why: "the due date's basis is unknown" };
  }

  /* R10: met, met late, or undetermined, for a match dated `when` against `due`. */
  static #metState(when, due) {
    if (!when || isUndet(when)) return { state: "undetermined", why: when ? `the matched event's date is undetermined: ${when.why}` : "the matched event is placed nowhere" };
    const b = bounds(when);
    if (isUndet(b) || b.earliest === null || b.latest === null) return { state: "undetermined", why: "the matched event's date has an open end" };
    const onTime = overdueOn({ due, at: minusSecond(b.latest), side: "body" });
    if (onTime === "not_overdue") return { state: "met", why: "the matching event falls on or before the due date" };
    const late = overdueOn({ due, at: b.earliest, side: "body" });
    if (late === "overdue") return { state: "met_late", why: "the matching event falls after the due date" };
    return { state: "undetermined", why: `whether the matching event falls on or before the due date is not settled: ${isObj(onTime) ? onTime.why : isObj(late) ? late.why : "the precision held does not say"}` };
  }

  /** R9–R12: each occurrence in the window, its state as of `asOf`, why, its evidence and its recorded transitions. */
  occurrencesOf(a = {}) {
    const b = isObj(a) ? a : {};
    if (!said(b.dutyId)) return noDuty();
    /* DEC-49 REGION is-duty-as-of */
    if (!said(b.asOf) || !ISO_TS_RE.test(b.asOf)) return refusal("NO_AS_OF", "asOf is an instant (YYYY-MM-DDTHH:MM:SSZ); nothing reads now itself.");
    /* END DEC-49 REGION is-duty-as-of */
    const d = this.#one(`SELECT * FROM duties WHERE duty_id=?`, b.dutyId);
    if (!d) return noSuchDuty(b.dutyId);
    const fields = this.#fieldsOf(d.duty_id, d.version);
    if (!this.visible(fields, b.viewer)) return noSuchDuty(b.dutyId);
    const from = b.from ?? addDays(d.adopted_at.slice(0, 10), -TRACK_BACK_DAYS), to = b.to ?? b.asOf.slice(0, 10);
    return { ok: true, duty_id: d.duty_id, version: d.version, as_of: b.asOf, from, to, ...this.#derive(d, fields, from, to, b.asOf, b.viewer) };
  }

  #derive(d, fields, from, to, asOf, viewer) {
    const view = this.view();
    const { instances, errors } = this.#instances(d.duty_id, d.version, fields, from, to, viewer);
    const occurrences = [];
    const inForce = this.inForce(fields, asOf.slice(0, 10), viewer);
    for (const inst of instances) {
      /* R6: a withdrawn duty derives no occurrence triggered after its withdrawal */
      if (d.withdrawn_at && inst.date && !isUndet(inst.date) && compare(inst.date, d.withdrawn_at) === "after") continue;
      const key = Duties.occurrenceKey(d.duty_id, d.version, inst.kind, inst.ref);
      occurrences.push(this.#occurrence(d, fields, inst, key, asOf, view, inForce, viewer));
    }
    return { occurrences, source_errors: errors, withdrawn: d.withdrawn_at ? { at: d.withdrawn_at, by: d.withdrawn_by, reason: d.withdraw_reason } : null };
  }

  #occurrence(d, fields, inst, key, asOf, view, inForce, viewer) {
    const due = this.#dueOf(fields, inst.date, view);
    const dueUndet = isUndet(due);
    const basis = (fields.time || {}).basis;
    const occ = {
      key, trigger: { kind: inst.kind, ref: inst.ref, date: inst.date, ...(inst.source ? { source: inst.source } : {}), ...(inst.label ? { label: inst.label } : {}) },
      due: dueUndet ? { undetermined: true, why: due.why } : { date: due.due, basis_kind: due.basis_kind, law_set: due.law_set, trace: due.trace,
                                                              ...(due.extension ? { extension: due.extension } : {}) },
      evidence: [], transitions: this.#transitions(d.duty_id, key),
    };
    occ.derivation = { source_in_force: inForce, trigger_date: inst.date, due_date: dueUndet ? null : due.due,
                       basis_kind: basis, law_set: basis === "rule", level_searched: LEVEL_SEARCHED,
                       level_says: OBSERVATION_LEVELS[LEVEL_SEARCHED] ? "the record's meaning: its held events and registered evidence" : null };
    /* R12: the governing match, as known on asOf (the latest act recorded on or before it) */
    const acts = this.#rows(`SELECT * FROM duty_matches WHERE duty_id=? AND occurrence_key=? AND at<=? ORDER BY seq`, d.duty_id, key, asOf);
    const latest = acts.length ? acts[acts.length - 1] : null;
    let state = null;
    if (latest && latest.exception !== null && latest.exception !== undefined) {
      const ex = (fields.exceptions || [])[latest.exception];
      occ.evidence.push({ kind: "exception", exception: ex ?? null, by: latest.by_member, at: latest.at, reason: latest.reason });
      state = { state: "discharged", why: `a held exception applies, as ${latest.by_member} recorded on ${latest.at.slice(0, 10)}` };
    } else if (latest && latest.event_id) {
      const ev = this.#event(latest.event_id, viewer === INTERNAL ? null : viewer);
      const when = ev ? this.#whenOf(ev) : { undetermined: true, why: "the matched event is not readable" };
      occ.evidence.push({ kind: "event", event_id: latest.event_id, when, by: latest.by_member, at: latest.at, reason: latest.reason,
                          corrects: acts.length > 1 ? acts.slice(0, -1).map((x) => x.seq) : [] });
      state = dueUndet ? { state: "undetermined", why: `an event is matched, and the due date is undetermined: ${due.why}` } : Duties.#metState(when, due.due);
    }
    if (!state) {
      for (const { module, fn } of this.#evidence) {
        let got;
        try { got = fn({ duty: { duty_id: d.duty_id, version: d.version, ...clone(fields) }, occurrence: { key, trigger: occ.trigger, due: occ.due } }); }
        catch (e) { occ.evidence.push({ kind: "measured", source: module, error: String(e && e.message || e).slice(0, 200) }); continue; }
        for (const g of Array.isArray(got) ? got : got ? [got] : []) {
          const when = g.when ? this.#dt(g.when) : null;
          occ.evidence.push({ kind: "measured", source: module, evidence: g.evidence ?? null, when, says: "measured evidence, cited as such" });
          if (!state && when) state = dueUndet ? { state: "undetermined", why: `measured evidence is held, and the due date is undetermined: ${due.why}` } : Duties.#metState(when, due.due);
        }
      }
    }
    if (!state) {
      if (dueUndet) state = { state: "undetermined", why: due.why };
      else {
        const o = overdueOn({ due: due.due, at: asOf, side: "body" });
        if (o === "not_overdue") state = { state: "pending", why: "the due date has not passed and no matching event is held" };
        else if (o === "overdue") state = { state: "overdue", why: "the due date has passed and no matching event is held, as known on the day asked" };
        else state = { state: "undetermined", why: o && o.why ? o.why : "whether the due date has passed is not settled" };
      }
    }
    occ.state = state.state;
    occ.why = state.why;
    if (occ.state === "overdue") {
      const dueWords = typeof due.due === "string" ? due.due : due.due && due.due.value ? due.due.value
        : due.due && due.due.candidates ? `${due.due.candidates[0].value}–${due.due.candidates[1].value}` : "the due date";
      if (basis === "dependency")
        occ.question = `A fact about sequence: the record holds no matching event before ${dueWords}, which this obligation was to precede. This is not a deadline the law sets.`;
      else occ.question = `Was "${(fields.performance || {}).act}" done by ${dueWords}? The record holds no matching event as known on ${asOf.slice(0, 10)}; this is a question, not a finding.`;
    }
    return occ;
  }

  /* ===================================================================== *
   * R12: matching an event to an occurrence (a member's act)
   * ===================================================================== */

  /* An occurrence key the duty derives in a broad window around `asOf` (two years either side), or null. */
  #occurrenceAt(d, fields, key, asOf) {
    const day = asOf.slice(0, 10);
    const { instances } = this.#instances(d.duty_id, d.version, fields, addDays(day, -731), addDays(day, 731), INTERNAL);
    for (const inst of instances) if (Duties.occurrenceKey(d.duty_id, d.version, inst.kind, inst.ref) === key) return inst;
    return null;
  }

  /** R12: a member matches an event (or a held exception) to an occurrence, recorded with who, when and why, and
   *  correctable by a later act that keeps this one. */
  matchEvent(a = {}) {
    const b = isObj(a) ? a : {};
    const m = memberOnly(b.by, "matching an event to an obligation");
    if (m) return m;
    const n = noReason(b.reason);
    if (n) return n;
    if (!said(b.dutyId)) return noDuty();
    const d = this.#one(`SELECT * FROM duties WHERE duty_id=?`, b.dutyId);
    if (!d) return noSuchDuty(b.dutyId);
    const fields = this.#fieldsOf(d.duty_id, d.version);
    const exception = b.exception === undefined || b.exception === null ? null : Number(b.exception);
    if (exception !== null && !(Number.isInteger(exception) && exception >= 0 && exception < (fields.exceptions || []).length))
      return noSuchEvent(null, { exception: b.exception });
    if (exception === null && !this.#event(b.eventId, b.viewer ?? null)) return noSuchEvent(said(b.eventId) ? b.eventId.slice(0, 80) : null);
    const at = this.#stamp();
    /* DEC-49 REGION is-duty-occurrence */
    if (!said(b.occurrenceKey) || !this.#occurrenceAt(d, fields, b.occurrenceKey, at))
      return refusal("NO_SUCH_OCCURRENCE", "no occurrence of this obligation answers to that key.", { occurrence_key: said(b.occurrenceKey) ? b.occurrenceKey.slice(0, 80) : null });
    /* END DEC-49 REGION is-duty-occurrence */
    return this.record.transact(() => {
      const g = this.#write("duty_matches", { duty_id: d.duty_id, occurrence_key: b.occurrenceKey, event_id: exception === null ? b.eventId : null,
                                              exception, reason: b.reason.trim(), by_member: str(b.by), at });
      if (g) return g;
      return { ok: true, duty_id: d.duty_id, occurrence_key: b.occurrenceKey, event_id: exception === null ? b.eventId : null, exception,
               by: str(b.by), at, reason: b.reason.trim() };
    });
  }

  /* ===================================================================== *
   * R13, R14: transitions, recorded append-only
   * ===================================================================== */

  #transitions(dutyId, key) {
    return this.#rows(`SELECT * FROM duty_transitions WHERE duty_id=? AND occurrence_key=? ORDER BY at, seq`, dutyId, key).map(Duties.#transitionView);
  }
  static #transitionView(t) {
    return { duty_id: t.duty_id, occurrence_key: t.occurrence_key, state: t.state, as_of: t.as_of, at: t.at, cause: t.cause,
             evidence: safeJson(t.evidence_json), by: t.by_member, seq: t.seq };
  }

  /** R13: the scheduler's consumer: each tracked occurrence's state as of `asOf`, appended only where it differs from
   *  the last recorded, in slices within `budgetMs` with a cursor. */
  recordTransitions(a = {}) {
    const b = isObj(a) ? a : {};
    if (!said(b.asOf) || !ISO_TS_RE.test(b.asOf)) return refusal("NO_AS_OF", "asOf is an instant (YYYY-MM-DDTHH:MM:SSZ).");
    const by = said(b.by) ? str(b.by) : SCHEDULER_STAMP;
    const budget = Number.isFinite(Number(b.budgetMs)) && Number(b.budgetMs) > 0 ? Number(b.budgetMs) : 1000;
    const start = this.clockMs();
    const duties = this.#rows(`SELECT * FROM duties WHERE duty_id > ? ORDER BY duty_id`, said(b.cursor) ? b.cursor : "");
    let recorded = 0, read = 0, cursor = null;
    const at = this.#stamp();
    for (let i = 0; i < duties.length; i++) {
      const d = duties[i];
      if (read > 0 && this.clockMs() - start >= budget) { cursor = duties[i - 1].duty_id; break; }
      read++;
      const fields = this.#fieldsOf(d.duty_id, d.version);
      const { occurrences } = this.#derive(d, fields, addDays(d.adopted_at.slice(0, 10), -TRACK_BACK_DAYS), b.asOf.slice(0, 10), b.asOf, INTERNAL);
      for (const o of occurrences) {
        const last = o.transitions.length ? o.transitions[o.transitions.length - 1] : null;
        if (last && last.state === o.state) continue;
        const g = this.record.transact(() => this.#write("duty_transitions", {
          duty_id: d.duty_id, occurrence_key: o.key, state: o.state, as_of: b.asOf, at, cause: o.why,
          evidence_json: canonicalJson({ derivation: o.derivation, evidence: o.evidence }), by_member: by }));
        if (!g) recorded++;
      }
    }
    return { ok: true, as_of: b.asOf, duties_read: read, recorded, cursor, done: cursor === null };
  }

  /** R13: a member's own recording of an occurrence's state. */
  recordTransition(a = {}) {
    const b = isObj(a) ? a : {};
    const m = memberOnly(b.by, "recording an occurrence's state");
    if (m) return m;
    /* DEC-49 REGION is-duty-state */
    if (!OCCURRENCE_STATES.includes(b.state)) return refusal("UNKNOWN_STATE", `a state is one of ${OCCURRENCE_STATES.join(", ")}.`, { states: [...OCCURRENCE_STATES] });
    /* END DEC-49 REGION is-duty-state */
    /* DEC-49 REGION is-duty-cause */
    if (!said(b.cause)) return refusal("NO_CAUSE", "say why, in your own words (cause).");
    /* END DEC-49 REGION is-duty-cause */
    if (!said(b.asOf) || !ISO_TS_RE.test(b.asOf)) return refusal("NO_AS_OF", "asOf is an instant (YYYY-MM-DDTHH:MM:SSZ).");
    if (!said(b.dutyId)) return noDuty();
    const d = this.#one(`SELECT * FROM duties WHERE duty_id=?`, b.dutyId);
    if (!d) return noSuchDuty(b.dutyId);
    const fields = this.#fieldsOf(d.duty_id, d.version);
    if (!said(b.occurrenceKey) || !this.#occurrenceAt(d, fields, b.occurrenceKey, b.asOf))
      return refusal("NO_SUCH_OCCURRENCE", "no occurrence of this obligation answers to that key.", { occurrence_key: said(b.occurrenceKey) ? b.occurrenceKey.slice(0, 80) : null });
    const at = this.#stamp();
    return this.record.transact(() => {
      const g = this.#write("duty_transitions", { duty_id: d.duty_id, occurrence_key: b.occurrenceKey, state: b.state, as_of: b.asOf, at,
                                                  cause: b.cause.trim().slice(0, WORDS_MAX), evidence_json: canonicalJson(b.evidence ?? null), by_member: str(b.by) });
      if (g) return g;
      return { ok: true, duty_id: d.duty_id, occurrence_key: b.occurrenceKey, state: b.state, as_of: b.asOf, at, by: str(b.by) };
    });
  }

  /** R14: the recorded transitions in order of `at`, never rewritten, for `action-plans` to condition a step on. */
  transitionsOf(a = {}) {
    const b = isObj(a) ? a : {};
    const where = [], args = [];
    if (said(b.dutyId)) { where.push("duty_id=?"); args.push(b.dutyId); }
    if (said(b.occurrenceKey)) { where.push("occurrence_key=?"); args.push(b.occurrenceKey); }
    const rows = this.#rows(`SELECT * FROM duty_transitions ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY at, seq`, ...args);
    const seen = new Map();
    const out = [];
    for (const t of rows) {
      if (!seen.has(t.duty_id)) {
        const d = this.#one(`SELECT * FROM duties WHERE duty_id=?`, t.duty_id);
        seen.set(t.duty_id, !!d && this.visible(this.#fieldsOf(d.duty_id, d.version), b.viewer));
      }
      if (seen.get(t.duty_id)) out.push(Duties.#transitionView(t));
    }
    return { ok: true, transitions: out, count: out.length };
  }

  /* ===================================================================== *
   * R15: powers read as instruments
   * ===================================================================== */

  /** R15: the duties of modality `power` whose obligor is the office, in force at `at`, each with its instrument and any
   *  delegation instrument held; undetermined ones apart, with why. Never whether an act was within a power. */
  powersOf(a = {}) {
    const b = isObj(a) ? a : {};
    if (!said(b.office)) return noEntity("powers are read for one office, named by its entity id");
    const e = this.#entity(b.office);
    if (!e) return noSuchEntity(b.office);
    /* DEC-49 REGION is-duty-office */
    if (e.kind !== "office") return refusal("NOT_AN_OFFICE", "powers are read for an office.", { entity_id: b.office, kind: e.kind });
    /* END DEC-49 REGION is-duty-office */
    const date = said(b.at) ? b.at.slice(0, 10) : this.#stamp().slice(0, 10);
    const powers = [], undetermined = [];
    for (const d of this.#rows(`SELECT * FROM duties WHERE obligor=? AND modality='power' ORDER BY duty_id`, b.office)) {
      const fields = this.#fieldsOf(d.duty_id, d.version);
      if (!this.visible(fields, b.viewer)) continue;
      if (d.withdrawn_at && d.withdrawn_at.slice(0, 10) <= date) continue;
      const inForce = this.inForce(fields, date, b.viewer);
      const instrument = (x) => {
        if (!isObj(x)) return null;
        const std = x.standard ? this.#standard(x.standard, b.viewer) : null;
        return { kind: x.kind ?? null, standard: x.standard ?? null, portion: x.portion ?? null, cite: std ? std.cite ?? null : null,
                 instrument: !std ? null : said(std.instrument) ? std.instrument : std.instrument && std.instrument.key ? std.instrument.key : null };
      };
      const item = { duty_id: d.duty_id, performance: fields.performance, instrument: instrument(fields.source),
                     delegation: fields.delegation ? instrument(fields.delegation) : null, in_force: inForce };
      if (inForce.state === "in_force") powers.push(item);
      else if (inForce.state === "not_in_force") continue;
      else undetermined.push({ ...item, why: inForce.why ?? `in force: ${inForce.state}` });
    }
    return { ok: true, office: b.office, at: date, powers, undetermined,
             says: "the powers held in force on the date, each read as the instrument that grants it; whether any act was within a power is a member's determination, not this read" };
  }

  /* ===================================================================== *
   * R17: restrictions and thresholds set against money facts
   * ===================================================================== */

  /** R17: the money facts in the duty's scope and period, each compared to the cited term as a computed fact, and a
   *  question; never "breach" or "unauthorised" (D275). */
  setAgainst(a = {}) {
    const b = isObj(a) ? a : {};
    if (!said(b.dutyId)) return noDuty();
    const d = this.#one(`SELECT * FROM duties WHERE duty_id=?`, b.dutyId);
    if (!d) return noSuchDuty(b.dutyId);
    const fields = this.#fieldsOf(d.duty_id, d.version);
    if (!this.visible(fields, b.viewer)) return noSuchDuty(b.dutyId);
    const p = fields.performance || {};
    const scope = isObj(p.scope) ? [...(p.scope.funds || []), ...(p.scope.entities || [])].filter(said) : [];
    const terms = Array.isArray(p.money_facts) ? p.money_facts : [];
    /* DEC-49 REGION is-duty-scope */
    if (!(fields.modality === "prohibition" || p.threshold === true) || !scope.length || !terms.length)
      return refusal("NOT_A_SET_AGAINST", "a prohibition or threshold whose terms cite money facts and name funds or entities.", { duty_id: d.duty_id });
    /* END DEC-49 REGION is-duty-scope */
    if (!this.money) return { ok: true, duty_id: d.duty_id, undetermined: true, why: "the money service is not available", items: [] };
    const termFacts = terms.map((id) => ({ id, fact: this.#fact(id, b.viewer) }));
    const items = [], undetermined = [];
    for (const ent of scope) {
      let r;
      try { r = this.money.moneyOf({ entity: ent, period: b.period ?? null, limit: LIST_MAX, viewer: b.viewer ?? SYSTEM_VIEWER }); } catch (e) { undetermined.push({ entity: ent, why: String(e && e.message || e).slice(0, 200) }); continue; }
      for (const f of r && Array.isArray(r.facts) ? r.facts : r && Array.isArray(r.items) ? r.items : []) {
        if (terms.includes(f.fact_id)) continue;
        for (const t of termFacts) {
          const comparison = t.fact ? Duties.#compareFacts(f, t.fact) : { relation: "undetermined", why: "the term's money fact is not readable", label: "computed fact" };
          items.push({ entity: ent, fact: f.fact_id, term: t.id, comparison,
                       question: `How does ${f.fact_id} stand against the cited term ${t.id}? A computed fact for a member to read, never a finding.` });
        }
      }
      if (r && r.truncated) undetermined.push({ entity: ent, why: "the money facts were truncated at the read's bound" });
    }
    return { ok: true, duty_id: d.duty_id, period: b.period ?? null, items, undetermined };
  }

  /* calc-grammar's comparison of two money facts' figures (its R10): a labelled computed fact. */
  static #compareFacts(a, b) {
    const fig = (f) => {
      if (isObj(f.amount)) return { precision: "range", sign: f.sign === "-" ? "-" : "+", low: String(f.amount.low), high: String(f.amount.high),
                                    ...(f.currency ? { currency: f.currency } : {}) };
      const amt = String(f.amount ?? "");
      const neg = amt.startsWith("-") || f.sign === "-";
      const abs = amt.replace(/^[+-]/, "");
      const out = { precision: f.precision || "exact", sign: neg ? "-" : "+", ...(f.currency ? { currency: f.currency } : {}) };
      if (out.precision === "range") return { ...out, low: String(f.low ?? ""), high: String(f.high ?? "") };
      return { ...out, value: abs };
    };
    let r;
    try { r = relate(fig(a), fig(b)); } catch (e) { r = { undetermined: true, why: String(e && e.message || e) }; }
    if (typeof r === "string") return { relation: r, label: "computed fact" };
    return { relation: "undetermined", why: r.why || r.refused, label: "computed fact" };
  }

  /* ===================================================================== *
   * R18: the connection owner
   * ===================================================================== */

  /** R18: the connections at `node` as of `at`, in connection-grammar's shape, paged by its bounds. */
  neighbours(a = {}) {
    const b = isObj(a) ? a : {};
    if (b.viewer === undefined || b.viewer === null || b.viewer === "")
      return { refused: "VIEWER_MISSING", why: "a read names the member reading; an absent viewer is neither an administrator nor the public" };
    const kinds = Array.isArray(b.kinds) ? b.kinds : CONNECTION_KINDS.map((k) => k.kind);
    const at = b.at;
    const zone = this.#zone();
    const all = [];
    const node = String(b.node || "");
    const dutyRows = node.startsWith("DUT-") ? this.#rows(`SELECT * FROM duties WHERE duty_id=?`, node)
      : node.startsWith("ENT-") ? this.#rows(`SELECT * FROM duties WHERE obligor=? OR obligee=? ORDER BY duty_id`, node, node) : [];
    const day = (iso) => iso.slice(0, 10);
    for (const d of dutyRows) {
      const fields = this.#fieldsOf(d.duty_id, d.version);
      if (!this.visible(fields, b.viewer)) continue;
      const valid = { from: day(d.adopted_at), to: d.withdrawn_at ? day(d.withdrawn_at) : null, precision: "day", zone };
      const evidence = [{ source: fields.source && fields.source.standard ? fields.source.standard : `${d.duty_id} (${(fields.source || {}).kind})`,
                          clause: d.clause }];
      const base = { evidence, grade: { assertion: "D", ends: ["D", "D"] }, derived: null, valid, owner: MODULE };
      const push = (kind, from, to) => all.push({ id: `${d.duty_id}:${kind}`, kind, from, to, ...base });
      if (fields.modality === "power") push("holds_power", d.obligor, d.duty_id);
      else push("owes", d.obligor, d.duty_id);
      if (said(d.obligee)) push("owed_to", d.duty_id, d.obligee);
    }
    if (at !== undefined && at !== null && (node.startsWith("DUT-") || node.startsWith("EVT-"))) {
      const matches = node.startsWith("DUT-")
        ? this.#rows(`SELECT * FROM duty_matches WHERE duty_id=? AND event_id IS NOT NULL ORDER BY seq`, node)
        : this.#rows(`SELECT * FROM duty_matches WHERE event_id=? ORDER BY seq`, node);
      const asOfDay = typeof at === "string" ? at.slice(0, 10) : at && at.value ? at.value.slice(0, 10) : null;
      const governing = new Map();
      for (const m of matches) if (!asOfDay || m.at.slice(0, 10) <= asOfDay) governing.set(`${m.duty_id}|${m.occurrence_key}`, m);
      for (const m of governing.values()) {
        const d = this.#one(`SELECT * FROM duties WHERE duty_id=?`, m.duty_id);
        if (!d || !this.visible(this.#fieldsOf(d.duty_id, d.version), b.viewer) || !m.event_id) continue;
        const method = "duties/met-by/1: a member's match of the event to the occurrence, governing as of the date";
        const as_of = asOfDay;
        all.push({ id: derivedId({ kind: "met_by", from: m.duty_id, to: m.event_id, as_of, method }), kind: "met_by", from: m.duty_id, to: m.event_id,
                   owner: MODULE, valid: { from: as_of, to: as_of, precision: "day", zone },
                   evidence: [{ source: m.event_id, occurrence_key: m.occurrence_key, by: m.by_member, reason: m.reason }],
                   grade: { assertion: "D", ends: ["D", "D"] }, derived: { method, inputs: [m.duty_id, m.event_id, m.occurrence_key], as_of } });
      }
    }
    let items = all.filter((c) => kinds.includes(c.kind) && (c.from === node || c.to === node));
    const marked = [];
    for (const c of items) {
      let v;
      try { v = at === undefined ? "in" : validAtOf(c, at); } catch { v = { undetermined: true, why: "the date asked is not readable" }; }
      if (v === "out") continue;
      marked.push(v === "in" ? c : { ...c, undetermined: { why: v.why || "undetermined at the date asked" } });
    }
    items = marked.sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
    if (items.length > BOUNDS.hub) return { items: [], hub: { set_size: items.length, why: `more than ${BOUNDS.hub} connections at this node` } };
    const offset = Number.isInteger(b.page) && b.page > 0 ? b.page : 0;
    const page = items.slice(offset, offset + BOUNDS.fanout);
    const next = offset + BOUNDS.fanout < items.length ? offset + BOUNDS.fanout : undefined;
    return next === undefined ? { items: page } : { items: page, next };
  }
}

/** The stamp duties' own reads of other modules carry when no member is reading (a machine credential sees every bundle,
 *  membership R43): the R1 checks at an act, and the scheduler's consumer. A member's read passes the member's own. */
const SYSTEM_VIEWER = "class:daemon";

/** The viewer an internal caller (the scheduler's consumer) reads as: every duty, nothing fenced. Never sent by a
 *  route: the ops map always passes the control plane's stamp. */
export const INTERNAL = Symbol("duties-internal-reader");

function validAtOf(c, at) { return civilValidAt({ valid: c.valid, basis: null }, at); }

/* ===================================================================== *
 * R19: the ops map
 * ===================================================================== */

/** R19: one route arm per act and read; the control plane routes, authenticates and stamps (`by` and `viewer` in the
 *  query, read after the body so a body cannot set them). Op names are provisional until op-declarations (T33-88). */
export function dutiesOps(s, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = isObj(body) ? body : {};
  const act = (extra = {}) => ({ ...b, ...extra, by: q("by"), viewer: q("viewer") });
  return {
    dutypropose: () => s.propose(act()),
    dutyadopt: () => s.adopt(act()),
    dutydeclare: () => s.declare(act()),
    dutyrevise: () => s.revise(act()),
    dutywithdraw: () => s.withdraw(act()),
    duty: () => s.readDuty({ dutyId: q("id"), at: q("at"), viewer: q("viewer") }),
    dutiesof: () => s.dutiesOf({ entity: q("entity"), as: q("as"), at: q("at"), limit: q("limit") === null ? undefined : Number(q("limit")), viewer: q("viewer") }),
    dutyoccurrences: () => s.occurrencesOf({ dutyId: q("id"), from: q("from") ?? undefined, to: q("to") ?? undefined, asOf: q("as_of"), viewer: q("viewer") }),
    dutymatch: () => s.matchEvent(act()),
    dutytransition: () => s.recordTransition(act()),
    dutytransitions: () => s.transitionsOf({ dutyId: q("id"), occurrenceKey: q("key"), viewer: q("viewer") }),
    powersof: () => s.powersOf({ office: q("office"), at: q("at"), viewer: q("viewer") }),
    dutysetagainst: () => s.setAgainst({ dutyId: q("id"), period: b.period ?? null, viewer: q("viewer") }),
  };
}

const instances = new WeakMap();
const live = new Set();

/** R18 (K1563 (1)): the read registered at load. With `host` it answers that host's instance; without one, the
 *  registering instance when it registered into a registry of its own, else the isolate's one instance; else it
 *  refuses OWNER_HOST_AMBIGUOUS, never guessing a store. */
function neighboursRead(bound) {
  return (args) => {
    const a = isObj(args) ? args : {};
    const { host, ...rest } = a;
    const s = host !== undefined && host !== null ? instances.get(host) : bound || (live.size === 1 ? [...live][0] : null);
    if (!s) return { refused: "OWNER_HOST_AMBIGUOUS", why: host !== undefined && host !== null
      ? "no duties instance answers for the host named" : "several stores hold duties in this isolate; the read names its host" };
    return s.neighbours(rest);
  };
}

/** K61: the one instance per host, created on the first call with `deps`: its tables created and declared (R22), its
 *  store gates registered (R21) and its connection owner registered once (R18). */
export function dutiesOf(host, deps) {
  let s = instances.get(host);
  if (!s) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    /* K1563 (1): the real modules by default, each reached on first use on the same host */
    const real = {
      entities: () => entitiesOf(host, { record, membership }),
      standards: () => standardsOf(host, { record, membership }),
      events: () => eventsOf(host, { record, membership }),
      lines: () => linesOf(host, { record }),
      money: () => moneyOf(host, { record, membership }),
      provenance: () => provenanceOf(host, { record, membership }),
      content: () => contentOf(host, { record, membership }),
    };
    const pick = (k) => (d[k] !== undefined ? d[k] : real[k]);
    s = new Duties({ ...d, storage, record, membership, entities: pick("entities"), standards: pick("standards"), events: pick("events"),
                     lines: pick("lines"), money: pick("money"), provenance: pick("provenance"), content: pick("content") });
    instances.set(host, s);
    if (s.registry === defaultRegistry) live.add(s);   /* the plane's instances, which the default registry serves */
    record.declareTable(MODULE, DUTIES_TABLES.map((t) => ({ ...t })));
    for (const t of DUTIES_TABLES) record.registerStoreGate(MODULE, t.name, (row, ctx) => s.oneHome(row, ctx));
    const reg = s.registry;
    if (reg && typeof reg.registerOwner === "function" && !(reg.owners().some((o) => o.owner === MODULE)))
      reg.registerOwner({ owner: MODULE, kinds: CONNECTION_KINDS.map((k) => ({ ...k })), neighbours: neighboursRead(reg === defaultRegistry ? null : s) });
  }
  return s;
}
