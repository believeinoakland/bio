/* local-facts — members' confirmation of the profile's local calendar and offices on this instance (requirements:
 * `build/requirements/local-facts.md`; design `build/plan/draft-filing-templates.md` §2, as §5 amends it; K921, K924,
 * K925, K927). A profile's holidays, office hours and time zone (`jurisdictions` R33, R41–R44) are researched facts:
 * this module records each member's `confirm`, `correct` or `dispute` of one (R1), answers each fact's status and the
 * value that governs here (R2), lapses a confirmation at its horizon (R3) and lists the facts that are due (R4).
 * A member confirms; a machine never does (R5): an assistant's re-check reaches a member as a run's output and enters
 * here only by the member's own act, whose `how` may name it. No machine proposal is stored (K927).
 *
 * In layer 5 since T33 (K1438), directly after `lines`, it reads no action (P4): which facts a live deadline reads is
 * `action-clocks.calendarFactsRead`'s answer, which its caller passes to `factsDue({paths})` (`queue-producers` R21).
 *
 * Every day here is a local day of the fact's profile's time zone (`civil-time.localDay`, R3; K1444 (iii)), never the
 * UTC day; a profile with no time zone answers a horizon undetermined, saying so. `governingPath` (R6) follows an
 * office's `part_of` lines upward through `lines.structureAt` to the nearest entity whose fact the profile holds, with
 * the profile's `offices` grouping as the fallback (ladders §5.4's bridge).
 *
 * No place is named here (R8): every fact is read from the active profiles (record-core's `jurisdiction_profiles`,
 * `jurisdictions.combine`), and one they do not hold reads `absent`.
 *
 * REACHED as `localFactsOf(host, deps)` (K61): one instance per host, created on the first call with `deps`. At
 * creation it creates its table and declares it with its classes (R5, R9). `deps`:
 *   record, membership   the modules it uses, through their factories on the same host unless a test passes its own.
 *   combine, get, validate   `jurisdictions`' services (default); a test passes its own for profiles it wrote.
 *   lines        an object with `lines.structureAt` (its R10), passed by the composition root; absent, `governingPath`
 *                answers the fallback, saying `lines` is not reachable here.
 *   officeOf     `(entityId, profile)` → the profile office `{role, body}` or `{venue}` an entity stands for (ladders
 *                §5.4's bridge: each profile office is seeded as an entity at setup), or null; absent, no entity maps.
 *   now          the module's clock, an ISO instant (default: the wall clock). */

import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { canonicalJson } from "../record-grammar/json.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { combine as combineProfiles, get as getProfile, validate as validateProfile } from "../../../jurisdictions/index.mjs";
import { localDay } from "../civil-time/index.mjs";
import { BOUNDS } from "../connection-grammar/index.mjs";
import { LOCAL_FACTS_CHECKS, refusal } from "./checks.mjs";
import { LOCAL_FACTS_TABLE_CLASSES, migrateLocalFacts } from "./schema.mjs";
import { factPath, parseFactPath, officesToken } from "./paths.mjs";

export { LOCAL_FACTS_CHECKS } from "./checks.mjs";
export { LOCAL_FACTS_SCHEMA, LOCAL_FACTS_TABLES, LOCAL_FACTS_TABLE_CLASSES } from "./schema.mjs";
export { LOCAL_FACT_KINDS, factPath, parseFactPath } from "./paths.mjs";

/** R7: a member's three acts on a fact. */
export const LOCAL_FACT_ACTS = Object.freeze(["confirm", "correct", "dispute"]);
/** R7: a fact's five statuses (R2). */
export const LOCAL_FACT_STATUSES = Object.freeze(["confirmed", "unconfirmed", "corrected", "disputed", "absent"]);
/** R3, R7: the horizons, per profile fact (K921 Q7). A holiday year's confirmation lasts until that year ends, and a
 *  year is due from 1 November of the year before; an office's hours, and the time zone, lapse 183 days after their
 *  confirmation. Every day is a local day of the fact's profile's time zone (`civil-time.localDay`), never the UTC
 *  day: a year ends, 1 November falls and the 183rd day lapses at that zone's local midnight. */
export const LOCAL_FACT_HORIZONS = Object.freeze({
  holidays: Object.freeze({ lasts: "until_year_end", due_from: Object.freeze({ month: 11, day: 1, years_before: 1 }) }),
  hours: Object.freeze({ lapse_days: 183 }),
  time_zone: Object.freeze({ lapse_days: 183 }),
});
/** R1: `how` and a correction's `source`, in characters. */
export const HOW_MAX = 500, SOURCE_MAX = 500;

const str = (v) => (typeof v === "string" ? v.trim() : "");
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
/* Calendar arithmetic on a local day's own label (`YYYY-MM-DD`): the day n days after it. No instant and no zone is
   involved, so a daylight-saving change cannot move it; the day itself is always `civil-time.localDay`'s (R3). */
const addDays = (day, n) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
/* R3: the local day of an instant in a zone, or null when the zone is none or not one `civil-time` knows. */
const dayIn = (instant, zone) => {
  if (typeof zone !== "string" || !zone) return null;
  try { const d = localDay(instant, zone); return typeof d === "string" ? d : null; } catch { return null; }
};

/* ===================================================================== *
 * Reading a fact out of a profile, or out of the combined view
 * ===================================================================== */

/* Every profile that gives a fact in the combined view (jurisdictions R13, R14); a raw profile gives its own. */
const givers = (x, own) => (own ? [own] : [x.profile, ...((x.bases || []).map((b) => b.profile))].filter(Boolean));
/* A holiday entry of the office calendar (`jurisdictions` R43): one with no closure `list` (R47). R6's paths name a year
   and its offices only, so an entry of a named list (a court's judicial holidays) is never one of this module's facts. */
const officeCalendar = (h) => isObj(h) && (h.list === undefined || h.list === null);

/** The fact `parts` names in `p` (a held profile, `own` its id, or the combined view, `own` null), as
 *  `{value, status, basis}`, or null. The value is what a correction replaces (R1): the year's `days`, the office's
 *  `{weekly}`, the time zone's name. */
function factIn(p, parts, own = null) {
  if (!isObj(p)) return null;
  const mine = (x) => givers(x, own).includes(parts.profile);
  if (parts.fact === "time_zone") {
    const z = p.time_zone;
    return isObj(z) && mine(z) ? { value: z.value, status: z.status, basis: z.basis } : null;
  }
  if (parts.fact === "holidays") {
    const key = officesToken(parts.offices);
    const h = (Array.isArray(p.holidays) ? p.holidays : [])
      .find((e) => officeCalendar(e) && Number(e.year) === parts.year && officesToken(e.offices) === key && mine(e));
    if (!h) return null;
    const days = (h.days || []).map((d) => ({ date: d.date, name: d.name }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return { value: days, status: h.status, basis: h.basis };
  }
  if (parts.fact === "hours") {
    const hoursOf = (h) => (isObj(h) && mine(h) ? { value: { weekly: clone(h.weekly) }, status: h.status, basis: h.basis } : null);
    if (parts.office.venue !== undefined) {
      const k = (Array.isArray(p.action_kinds) ? p.action_kinds : []).find((e) => isObj(e) && e.kind === parts.office.venue);
      return k && isObj(k.venue) ? hoursOf(k.venue.hours) : null;
    }
    const c = (Array.isArray(p.counterparties) ? p.counterparties : [])
      .find((e) => isObj(e) && e.role === parts.office.role && e.body === parts.office.body && isObj(e.hours));
    return c ? hoursOf(c.hours) : null;
  }
  return null;
}

/** Every fact a held profile gives, as its parts (R2, R4 without a path). */
function factsOf(p) {
  const out = [];
  if (!isObj(p)) return out;
  if (isObj(p.time_zone)) out.push({ profile: p.id, fact: "time_zone" });
  for (const h of Array.isArray(p.holidays) ? p.holidays : [])
    if (officeCalendar(h)) out.push({ profile: p.id, fact: "holidays", year: Number(h.year), ...(h.offices ? { offices: h.offices } : {}) });
  for (const c of Array.isArray(p.counterparties) ? p.counterparties : [])
    if (isObj(c) && isObj(c.hours)) out.push({ profile: p.id, fact: "hours", office: { role: c.role, body: c.body } });
  for (const k of Array.isArray(p.action_kinds) ? p.action_kinds : [])
    if (isObj(k) && isObj(k.venue) && isObj(k.venue.hours)) out.push({ profile: p.id, fact: "hours", office: { venue: k.kind } });
  return out;
}

/** R1: the held profile with the fact's value replaced by `value`, for `jurisdictions.validate`; null when the value
 *  is not of the fact's form. */
function withValue(p, parts, value) {
  const q = clone(p);
  if (parts.fact === "time_zone") {
    if (typeof value !== "string") return null;
    q.time_zone.value = value;
  } else if (parts.fact === "holidays") {
    if (!Array.isArray(value)) return null;
    const key = officesToken(parts.offices);
    const h = q.holidays.find((e) => officeCalendar(e) && Number(e.year) === parts.year && officesToken(e.offices) === key);
    h.days = clone(value);
  } else {
    if (!isObj(value) || Object.keys(value).join() !== "weekly") return null;
    const target = parts.office.venue !== undefined
      ? q.action_kinds.find((k) => k.kind === parts.office.venue).venue
      : q.counterparties.find((c) => c.role === parts.office.role && c.body === parts.office.body);
    target.hours.weekly = clone(value.weekly);
  }
  return q;
}

/* ===================================================================== *
 * The module
 * ===================================================================== */

export class LocalFacts {
  constructor({ storage, record, membership = null, combine = combineProfiles, get = getProfile,
                validate = validateProfile, lines = null, officeOf = null, now = null } = {}) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.combine = combine;
    this.getProfile = get;
    this.validate = validate;
    this.lines = lines;
    this.officeOf = typeof officeOf === "function" ? officeOf : null;
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
    migrateLocalFacts(this.sql);   // the table exists once the instance does, so no caller migrates
  }

  #rows(qs, ...a) { return [...this.sql.exec(qs, ...a)]; }
  #instant() { return stampInstant("second", Date.parse(this.now())); }

  /* R3: the zone a profile's days are counted in: its `time_zone` as it governs here (a member's latest correction of
     it, R2, Q6; else the held profile's own), or null when it holds none. */
  #zone(profile, active) {
    const fixed = [...this.#acts(`${profile}/time_zone`)].reverse().find((a) => a.act === "correct");
    if (fixed && typeof fixed.value === "string") return fixed.value;
    const p = active.held.get(profile);
    return isObj(p) && isObj(p.time_zone) && typeof p.time_zone.value === "string" ? p.time_zone.value : null;
  }

  /** The module's table, created at construction; kept, idempotent, for the composition root's migration pass. */
  migrate() { migrateLocalFacts(this.sql); }

  /* The active profiles: their ids as held, and the combined view (record-core R26, jurisdictions R12–R16). A profile
     the instance names but cannot resolve, or a list that does not combine, gives no fact. */
  #active() {
    const ids = this.record.getSetting("jurisdiction_profiles");
    const held = new Map();
    if (Array.isArray(ids)) for (const id of ids) {
      if (typeof id !== "string" || held.has(id)) continue;
      const p = this.getProfile(id);
      if (isObj(p)) held.set(id, p);
    }
    let view = null;
    if (held.size) {
      const c = this.combine([...held.keys()]);
      if (c && c.ok) view = c.view;
      else held.clear();
    }
    return { held, view };
  }

  /* A viewer that membership refuses sees no fact; no viewer sent is a direct internal call and sees every one. */
  static #blind(viewer) { return viewer !== undefined && viewer !== null && viewerPredicate(viewer).scope === "DENY"; }

  #acts(path) {
    return this.#rows(`SELECT seq, act, how, value_json, source, by_member, at FROM local_fact_acts WHERE path=? ORDER BY seq`, path)
      .map((r) => ({ act: r.act, by: r.by_member, at: r.at, how: r.how, value: safeJson(r.value_json),
                     ...(r.act === "correct" ? { source: r.source } : {}) }));
  }

  /* R2, R3: one named fact's status, from its acts and the view. `held` is the profile's own fact (R1: what may be
     acted on), `inView` the fact as the active profiles combine it (absent when withheld as a conflict). Every day it
     shows or counts is a local day of the fact's profile's zone (R3); with no zone, an act's instant is shown whole
     and the horizon is undetermined, never read on the UTC day. */
  #status(path, parts, held, inView, active) {
    const zone = this.#zone(parts.profile, active);
    const when = (at) => dayIn(at, zone) ?? at;
    const acts = this.#acts(path);
    const latest = acts.length ? acts[acts.length - 1] : null;
    const said = (a) => (a ? { act: a.act, by: a.by, at: a.at, how: a.how } : null);
    const base = { path, fact: parts, latest: said(latest), acts: acts.length };
    if (!inView) {
      return { ...base, status: "absent", due: false, profile: null, governs: null,
               why: held ? "the active jurisdiction profiles disagree on this fact, so it is withheld: what depends on it is undetermined"
                         : "no active jurisdiction profile holds this fact, so what depends on it is undetermined" };
    }
    const correction = [...acts].reverse().find((a) => a.act === "correct") || null;
    const profile = { value: clone(inView.value), status: inView.status, basis: inView.basis };
    const governs = correction
      ? { value: clone(correction.value), origin: "corrected", source: correction.source,
          says: `corrected locally by ${correction.by}, ${when(correction.at)}` }
      : { value: clone(inView.value), origin: "profile" };
    const horizon = this.#horizon(parts, latest, zone);
    const out = { ...base, profile, governs, ...horizon.dates, ...(horizon.undetermined ? { horizon: horizon.undetermined } : {}) };
    if (!latest) return { ...out, status: "unconfirmed", due: horizon.due, why: `no member has confirmed it${horizon.dueWhy}` };
    if (latest.act === "dispute") return { ...out, status: "disputed", due: true, why: `disputed by ${latest.by}, ${when(latest.at)}` };
    if (latest.act === "correct") return { ...out, status: "corrected", due: false, why: governs.says };
    /* a confirm: it confirms the value that governed when it was made, until its horizon (R3) */
    if (canonicalJson(latest.value) !== canonicalJson(governs.value))
      return { ...out, status: "unconfirmed", due: horizon.due, lapsed: said(latest),
               why: `the value ${latest.by} confirmed on ${when(latest.at)} has since changed${horizon.dueWhy}` };
    if (horizon.undetermined)
      return { ...out, status: "unconfirmed", due: horizon.due, lapsed: said(latest),
               why: `the confirmation by ${latest.by} at ${latest.at} cannot be shown in force: ${horizon.undetermined.why}` };
    if (horizon.lapsed)
      return { ...out, status: "unconfirmed", due: horizon.due, lapsed: said(latest),
               why: `the confirmation by ${latest.by} on ${when(latest.at)} lapsed on ${horizon.dates.lapses_on}${horizon.dueWhy}` };
    return { ...out, status: "confirmed", due: false, why: `confirmed by ${latest.by}, ${when(latest.at)}` };
  }

  /* R3: when a confirmation of this fact lapses, and from when the fact is due, on local days of `zone`. Without a
     zone the days that need one are undetermined, and `due` is null. */
  #horizon(parts, latest, zone) {
    const today = dayIn(this.#instant(), zone);
    const confirmedAt = latest && latest.act === "confirm" ? latest.at : null;
    const confirmed = confirmedAt ? dayIn(confirmedAt, zone) : null;
    const undetermined = today === null
      ? { undetermined: true, why: `the profile ${parts.profile} holds no time zone this instance can read, so its local `
          + "days, and this fact's horizon, are undetermined" }
      : null;
    if (parts.fact === "holidays") {
      const y = parts.year, due_from = `${y - 1}-11-01`, lapses_on = `${y + 1}-01-01`;
      if (undetermined)
        return { due: null, lapsed: false, undetermined, dueWhy: `; whether the year is due (from ${due_from}) is undetermined`,
                 dates: { due_from, ...(confirmedAt ? { lapses_on } : {}) } };
      const due = today >= due_from;
      return { due, lapsed: !!confirmed && today >= lapses_on,
               dueWhy: due ? `; the year is due from ${due_from}` : `; the year falls due on ${due_from}`,
               dates: { due_from, ...(confirmed ? { lapses_on } : {}) } };
    }
    if (undetermined) return { due: confirmedAt ? null : true, lapsed: false, undetermined, dueWhy: "", dates: {} };
    const lapses_on = confirmed ? addDays(confirmed, LOCAL_FACT_HORIZONS[parts.fact].lapse_days) : null;
    return { due: true, lapsed: !!confirmed && today >= lapses_on, dueWhy: "",
             dates: lapses_on ? { lapses_on } : {} };
  }

  /* One path against the active profiles: its parts, the held fact and the view's, or why it names none. */
  #resolve(path, active) {
    const parts = parseFactPath(path);
    if (!parts) return { named: false };
    const p = active.held.get(parts.profile);
    if (!p) return { named: false, parts };
    const held = factIn(p, parts, parts.profile);
    return { named: true, parts, p, held, inView: held ? factIn(active.view, parts) : null };
  }

  /* ===================================================================== *
   * R1: factConfirm
   * ===================================================================== */

  /** R1, R5: records a member's `confirm`, `correct` or `dispute` of the fact at `path`, appended and never replaced.
   *  Refusals in order: MACHINE_CANNOT_CONFIRM, NO_SUCH_FACT, FACT_ACT_REFUSED, FACT_HOW_REFUSED, FACT_VALUE_REFUSED. */
  factConfirm(a = {}) {
    const b = isObj(a) ? a : {};
    const machine = machineRefusal(b.by);
    if (machine) return machine;
    const path = typeof b.path === "string" ? b.path : null;
    const active = this.#active();
    const r = path && !LocalFacts.#blind(b.viewer) ? this.#resolve(path, active) : { named: false };
    if (!r.named || !r.held) return noSuchFact(path);
    const act = b.act;
    /* DEC-49 REGION is-fact-act */
    if (!LOCAL_FACT_ACTS.includes(act))
      return refusal("FACT_ACT_REFUSED", `the act is one of ${LOCAL_FACT_ACTS.join(", ")}.`,
                     { act: typeof act === "string" ? act.slice(0, 40) : null, acts: [...LOCAL_FACT_ACTS] });
    /* END DEC-49 REGION is-fact-act */
    const how = str(b.how);
    /* DEC-49 REGION is-fact-how */
    if (!how || how.length > HOW_MAX)
      return refusal("FACT_HOW_REFUSED", `say how you checked, in 1 to ${HOW_MAX} characters.`, { max: HOW_MAX });
    /* END DEC-49 REGION is-fact-how */
    let value = null, source = null;
    if (act === "correct") {
      source = str(b.source);
      const q = b.value === undefined ? null : withValue(r.p, r.parts, b.value);
      const v = q ? this.validate(q) : null;
      /* DEC-49 REGION is-fact-correction */
      if (!source || source.length > SOURCE_MAX || !v || !v.ok)
        return refusal("FACT_VALUE_REFUSED", "a correction gives the corrected value in the form the profile holds it, "
                       + `and its source in 1 to ${SOURCE_MAX} characters.`,
                       { errors: v && !v.ok ? v.errors.slice(0, 10) : undefined, max: SOURCE_MAX });
      /* END DEC-49 REGION is-fact-correction */
      value = b.value;
    } else {
      /* a confirm or a dispute is about the value that governs now (R2): the latest correction's, else the profile's */
      const s = r.inView ? this.#status(path, r.parts, r.held, r.inView, active) : null;
      value = s && s.governs ? s.governs.value : r.held.value;
    }
    const at = this.#instant();
    const by = str(b.by);
    return this.record.transact(() => {
      this.sql.exec(`INSERT INTO local_fact_acts (path, profile, act, how, value_json, source, by_member, at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    path, r.parts.profile, act, how, canonicalJson(value), source, by, at);
      return { ok: true, path, act, at };
    });
  }

  /* ===================================================================== *
   * R2: factStatus
   * ===================================================================== */

  /** R2, R3: one fact's status (with `path`), or every fact of the active profiles, corrections and disputes first. */
  factStatus(a = {}) {
    const b = isObj(a) ? a : {};
    const active = this.#active();
    const blind = LocalFacts.#blind(b.viewer);
    if (b.path !== undefined && b.path !== null && b.path !== "") {
      const r = !blind && typeof b.path === "string" ? this.#resolve(b.path, active) : { named: false };
      if (!r.named) return noSuchFact(typeof b.path === "string" ? b.path : null);
      return { ok: true, ...this.#status(b.path, r.parts, r.held, r.inView, active) };
    }
    const facts = blind ? [] : this.#all(active);
    const rank = (f) => (f.status === "corrected" || f.status === "disputed" ? 0 : 1);
    facts.sort((x, y) => rank(x) - rank(y) || (x.path < y.path ? -1 : x.path > y.path ? 1 : 0));
    return { ok: true, facts, count: facts.length,
             note: "corrections and disputes come first, for a member to report for a profile fix; this instance transmits nothing" };
  }

  /* Every fact of the active profiles, once each, with its status. */
  #all(active) {
    const out = new Map();
    for (const p of active.held.values()) for (const parts of factsOf(p)) {
      const path = factPath(parts);
      if (!path || out.has(path)) continue;
      const r = this.#resolve(path, active);
      if (r.named && r.held) out.set(path, this.#status(path, r.parts, r.held, r.inView, active));
    }
    return [...out.values()];
  }

  /* ===================================================================== *
   * R4: factsDue
   * ===================================================================== */

  /** R4: every fact that is unconfirmed (lapsed included) or disputed, once each; with `paths`, only those of them. A
   *  path that does not name a fact of an active profile is listed in `unknown`; one that names a fact the active
   *  profiles do not hold, in `absent`. Writes nothing. */
  factsDue(a = {}) {
    const b = isObj(a) ? a : {};
    const active = this.#active();
    const blind = LocalFacts.#blind(b.viewer);
    /* every unconfirmed fact (lapsed included) and every disputed one, whatever its due date (K986); its `why` says
       when it falls or fell due, or when it lapsed, or who disputed it */
    const pick = (s) => s.status === "disputed" || s.status === "unconfirmed";
    const shape = (s) => ({ path: s.path, fact: s.fact, status: s.status, due: s.due, why: s.why, latest: s.latest,
                            ...(s.lapsed ? { lapsed: s.lapsed } : {}), ...(s.due_from ? { due_from: s.due_from } : {}),
                            ...(s.lapses_on ? { lapses_on: s.lapses_on } : {}), ...(s.horizon ? { horizon: s.horizon } : {}) });
    if (b.paths === undefined || b.paths === null) {
      const due = blind ? [] : this.#all(active).filter(pick).map(shape);
      return { ok: true, due, unknown: [], absent: [] };
    }
    const asked = [...new Set(Array.isArray(b.paths) ? b.paths : [b.paths])];
    const due = [], unknown = [], absent = [];
    for (const path of asked) {
      const r = !blind && typeof path === "string" ? this.#resolve(path, active) : { named: false };
      if (!r.named) { unknown.push(typeof path === "string" ? path.slice(0, 1000) : null); continue; }
      const s = this.#status(path, r.parts, r.held, r.inView, active);
      if (s.status === "absent") absent.push(path);
      else if (pick(s)) due.push(shape(s));
    }
    return { ok: true, due, unknown, absent };
  }

  /* ===================================================================== *
   * R6: governingPath
   * ===================================================================== */

  /** R6 (T33-28; ladders §5.4's bridge): the path whose fact governs an office. `fact` is `hours`, `holidays` (of
   *  `year`, else the local year of `at` in the profile's zone) or `time_zone`; `office` is a counterparty's
   *  `{role, body}` or a venue's `{venue}`. The office's own fact when the profile holds one; else, with `entity` (the
   *  office's registry entity), the fact of the nearest entity it is `part_of` at `at` (`lines.structureAt`, one line at
   *  a time upward, at most `connection-grammar`'s default depth) that the profile holds, naming each line followed;
   *  else the profile's `offices` grouping (a holiday year's entry for every office), saying so. A `part_of` line
   *  undetermined at `at`, two at once, or a read `lines` refuses, stops the walk there and answers the fallback with
   *  why. Answers `{ok, path, via, lines, why}`, `path` null when nothing governs; writes nothing; never throws. */
  governingPath(a = {}) {
    try { return this.#governing(isObj(a) ? a : {}); }
    catch (e) { return { ok: true, path: null, via: "none", lines: [], why: `undetermined: the walk failed (${String(e && e.message || e).slice(0, 200)})` }; }
  }

  #governing(b) {
    const active = this.#active();
    const profile = typeof b.profile === "string" ? b.profile : null;
    if (LocalFacts.#blind(b.viewer) || !profile || !active.held.has(profile)) return noSuchFact(profile);
    const p = active.held.get(profile);
    const fact = b.fact;
    if (fact === "time_zone") {
      const path = factPath({ profile, fact });
      return factIn(p, { profile, fact }, profile)
        ? { ok: true, path, via: "profile", lines: [], why: "the time zone is the profile's, for every office" }
        : { ok: true, path: null, via: "none", lines: [], why: "the profile holds no time zone, so it is undetermined" };
    }
    if (fact !== "hours" && fact !== "holidays") return noSuchFact(null);
    const at = typeof b.at === "string" ? b.at : null;
    let year = null;
    if (fact === "holidays") {
      year = Number.isInteger(b.year) ? b.year : null;
      if (year === null && at) {
        const d = /^\d{4}-\d{2}-\d{2}$/.test(at) ? at : dayIn(at, this.#zone(profile, active));
        year = d ? Number(d.slice(0, 4)) : null;
      }
      if (year === null)
        return { ok: true, path: null, via: "none", lines: [],
                 why: "the year is undetermined: give `year`, or `at` with a profile time zone to read its local year" };
    }
    /* the path of `office`'s own fact in the profile, or null */
    const own = (office) => {
      if (!isObj(office) && !(fact === "holidays" && typeof office === "string")) return null;
      if (fact === "hours") {
        const parts = { profile, fact, office };
        const path = factPath(parts);
        return path && factIn(p, parts, profile) ? path : null;
      }
      /* a holiday entry names an office by its role, or a venue by its kind (`jurisdictions` R43) */
      const named = typeof office === "string" ? office : typeof office.role === "string" ? office.role
        : office.venue !== undefined ? { venue: office.venue } : null;
      const tok = named === null ? null : officesToken([named]);
      if (!tok) return null;
      const entries = factsOf(p).filter((f) => f.fact === "holidays" && f.year === year && f.offices
                                                 && (officesToken(f.offices) || "").split(",").includes(tok))
        .map((f) => factPath(f)).filter(Boolean).sort();
      return entries[0] || null;
    };
    const fallback = (why, followed = []) => {
      if (fact === "holidays") {
        const parts = { profile, fact, year };
        const path = factIn(p, parts, profile) ? factPath(parts) : null;
        return { ok: true, path, via: path ? "fallback" : "none", lines: followed,
                 why: path ? `${why}; the profile's entry for every office governs (its \`offices\` grouping)`
                           : `${why}; the profile holds no entry for every office in ${year}, so it is undetermined` };
      }
      return { ok: true, path: null, via: "none", lines: followed, why: `${why}; the profile holds no hours that govern this office, so they are undetermined` };
    };
    const mine = own(b.office);
    if (mine) return { ok: true, path: mine, via: "own", lines: [], why: "the profile holds this office's own fact" };
    const entity = typeof b.entity === "string" && b.entity ? b.entity : null;
    if (!entity) return fallback("no registry entity was given for the office, so no part_of line was followed");
    if (!this.lines || typeof this.lines.structureAt !== "function")
      return fallback("`lines` is not reachable on this host, so no part_of line was followed");
    if (!at) return fallback("no date was given, so no part_of line could be judged");
    const followed = [], seen = new Set([entity]);
    let cur = entity;
    for (let hop = 0; hop < BOUNDS.depth_default; hop++) {
      const r = this.lines.structureAt({ entity: cur, at, kinds: ["part_of"], viewer: b.viewer });
      if (!isObj(r) || r.ok === false)
        return fallback(`lines refused the structure of ${cur} at ${at}${isObj(r) && r.reason ? ` (${r.reason})` : ""}`, followed);
      const up = (list) => (Array.isArray(list) ? list : []).filter((l) => isObj(l) && l.kind === "part_of" && l.from === cur);
      const open = up(r.undetermined);
      if (open.length)
        return fallback(`the part_of line ${open.map((l) => l.line_id).join(", ")} from ${cur} is undetermined at ${at}`
                        + (open[0].why ? ` (${open[0].why})` : ""), followed);
      const held = up(r.lines ?? r.held);
      if (!held.length) return fallback(`${cur} is part of no entity at ${at} that the profile holds a fact for`, followed);
      if (held.length > 1)
        return fallback(`${cur} is part of ${held.length} entities at ${at} (${held.map((l) => l.line_id).join(", ")}), so which governs is undetermined`, followed);
      const line = held[0];
      followed.push({ line_id: line.line_id, from: line.from, to: line.to });
      if (typeof line.to !== "string" || seen.has(line.to)) return fallback(`the part_of lines from ${entity} return to an entity already followed`, followed);
      seen.add(line.to);
      cur = line.to;
      const office = this.officeOf ? this.officeOf(cur, profile) : null;
      const path = own(office);
      if (path)
        return { ok: true, path, via: "part_of", lines: followed,
                 why: `the office's own fact is not held; it is part of ${cur} (${followed.map((l) => l.line_id).join(" → ")}), whose fact the profile holds` };
    }
    return fallback(`no entity within ${BOUNDS.depth_default} part_of lines of ${entity} has a fact the profile holds`, followed);
  }
}

/* DEC-49: a code several acts answer is minted at one site, its own function here. */

/* R1, R5: a confirmation, correction or dispute is a named member's act. */
function machineRefusal(by) {
  /* DEC-49 REGION is-fact-member */
  if (str(by) && !isMachineIdentity(str(by))) return null;
  return refusal("MACHINE_CANNOT_CONFIRM", "confirming, correcting or disputing a local fact is a named member's act; "
                 + "an assistant's re-check reaches a member as its run's output. Nothing was written.");
  /* END DEC-49 REGION is-fact-member */
}

/* R1, R2: a path R6 does not name in an active profile. */
function noSuchFact(path) {
  /* DEC-49 REGION is-fact-named */
  return refusal("NO_SUCH_FACT", "no local fact of the active jurisdiction profiles answers to that path.",
                 { path: typeof path === "string" ? path.slice(0, 1000) : null });
  /* END DEC-49 REGION is-fact-named */
}

/** The ops whose handlers are this module's (K3): the control plane routes, authenticates and stamps them (`by` in the
 *  body; `viewer` in the URL, read after the body so a body cannot set it). `plane` composes them (its R11). A read's
 *  `paths` are the body's list, or the query's repeated `path`. */
export function localFactsOps(s, url, body) {
  const qp = (k) => url.searchParams.get(k);
  const b = isObj(body) ? body : {};
  const paths = () => (Array.isArray(b.paths) ? b.paths : url.searchParams.getAll("path").length ? url.searchParams.getAll("path") : undefined);
  return {
    factconfirm: () => s.factConfirm({ ...b, viewer: qp("viewer") }),
    factstatus: () => s.factStatus({ path: qp("path") ?? b.path, viewer: qp("viewer") }),
    factsdue: () => s.factsDue({ paths: paths(), viewer: qp("viewer") }),
  };
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. Its table is created with it and declared
 *  with its classes (R5, R9, K23). */
export function localFactsOf(host, deps) {
  let s = instances.get(host);
  if (!s) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    s = new LocalFacts({ ...d, storage, record, membership });
    instances.set(host, s);
    record.declareTable("local-facts", LOCAL_FACTS_TABLE_CLASSES.map((e) => ({ ...e, keys: [...e.keys] })));
  }
  return s;
}
