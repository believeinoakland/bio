/* following — the group's following of what happens at a body and in a register, on the scheduler's one alarm
 * (requirements: `build/requirements/following.md`; ladders §4.4, §5B.4, §6.4, §7.4, §8.5; K1443, K1444, K1449, K1468,
 * K1484). A body a member follows is read from its Legistar records so that `events` writes what it did; a document
 * watched per meeting is captured before each meeting by the body's notice period; a public register is re-read (or
 * re-rendered) on the tick, and one behind a member's account or a fee only at that member's act; a member may follow
 * a register's own query for one identifier naming a person; a portal's dataset is snapshotted and diffed by key.
 * Each policy the group holds is watched at its published copy with no member act, every version seen kept, its
 * changes read by `notice-producers` (R20, R21; K1727, K1740). Like `monitoring`, it watches and captures; what a
 * change means is never its to say (R16).
 *
 * New code beside `monitoring` (plan T33 Choices 7; no copy seam was found). Every tick runs under
 * `monitoring.sweepHost()` (its R65: one pause, one idempotence key, one landing), as `link-sweep` does (N506).
 *
 * REACHED as `followingOf(host, deps)` (K61, K1563 (1)): one instance per host, created on the first call; it creates
 * its tables and declares them with their classes (R17). `deps` (each reached through its factory on the same host
 * unless given; a test passes its own):
 *   record, membership   layer 2: `transact`, `declareTable`, `getSetting`, `evidenceStore`; `inSight`.
 *   capture              `acquire` (its capture-request arm; the render path, R7; a member's own credential, R8).
 *   entities, events     a body's existence and Legistar identifier (R1); its observed meetings (R4) and the
 *                        Legistar write (`followedImport`, R2).
 *   monitoring           `sweepHost()` (R13), `schedule(now)` (R4: the `per_meeting` subjects), `monitor` (R4's capture).
 *   standards            the held policies (`standardsIn`, `standardRead`), who may read one (`isMeasure`), and the
 *                        amendments of one (`lawRelationsOf`) (R20, R21). A policy's text capture is read through
 *                        `content`'s read contract (its R45) and its address through `provenance`'s (its R48).
 *   view                 the jurisdiction view, or a function answering it (default: `jurisdictions.combine` of the
 *                        instance's active profiles, record-core R26).
 *   now                  the instance clock in milliseconds.
 *   bytes(sha)           a capture's bytes (default: record-core's evidence store). */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, listenerRefusal } from "../membership/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { entitiesOf } from "../entities/index.mjs";
import { eventsOf } from "../events/index.mjs";
import { monitoringOf, MONITOR_VIEWER, MONITOR_CADENCE_MS } from "../monitoring/index.mjs";
import { standardsOf } from "../standards/index.mjs";
import { isMachineIdentity, isPublicHttpsLocator } from "../record-grammar/index.mjs";
import { isCalendarDate, validAt, localDay } from "../civil-time/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { parse as parseLegistar, KEY as LEGISTAR_KEY } from "../../../legistar-reader/index.mjs";
import { FOLLOWING_TABLES, migrateFollowing } from "./schema.mjs";
import { legistarBodyId, eventsAddress, itemsAddress, votesAddress, mattersAddress, matterAddress, enactmentOf } from "./legistar.mjs";
import { noticeRule, meetingsOf, dueBefore } from "./meetings.mjs";
import { portalKey, readDataset, diffRows } from "./snapshot.mjs";
import { followRefusal } from "./checks.mjs";

export { FOLLOWING_SCHEMA, FOLLOWING_TABLES, migrateFollowing } from "./schema.mjs";
export { legistarSystems, bodySchemes, legistarBodyId } from "./legistar.mjs";
export { noticeRule, meetingsOf, dueBefore, MEETING_HORIZON_MONTHS } from "./meetings.mjs";
export { portalKey, readDataset, diffRows } from "./snapshot.mjs";
export { FOLLOWING_CHECKS, followRefusal } from "./checks.mjs";

export const FOLLOWING_MODULE = "following";
/** R13: the consumer name under the host's epoch and running set. */
export const FOLLOW_CONSUMER = "following";
/** R13: subjects read per tick; with the scheduler's rank, ten times as many are read before ranking (monitoring R19). */
export const FOLLOW_TICK_BATCH = 50;
/** R2: fetches one body's read makes in one tick (its events, items, votes and matters), beyond which it says so. */
export const BODY_READ_FETCHES = 200;
/** R12: the cadences a follow may name: daily (the default) or longer, from monitoring's intervals (its R14). */
export const FOLLOW_CADENCES = Object.freeze(["daily", "weekly", "monthly"]);
export const FOLLOW_KINDS = Object.freeze(["body", "register", "person-query", "portal", "policy"]);
/** R20 (K1881, K1941): a policy watch's cadence, every 7 days from its last read; no act shortens it. */
export const POLICY_WATCH_CADENCE = "weekly";
/** R20: the access of a policy (standards R41) that is never read on the tick (R8, R15). */
export const POLICY_GATED_ACCESS = Object.freeze(["paywalled", "reading_room"]);
/** R21: the most changes one answer gives, and its default. */
export const POLICY_CHANGES_MAX = 200;
export const FOLLOW_PURPOSE = "following";
const MACHINE = MONITOR_VIEWER;
const EPOCH_MS = 3600000;
const STATIC_ONLY = "only its static form is followed: the register is not re-rendered, so what a visitor's browser would add is not seen";
const NOT_PUBLIC = "not reproducible by the public: it was read with a member's own credential or for a fee";
const POLICY_PAGE = 200;

const said = (v) => typeof v === "string" && v.trim() !== "";
/* every refusal carries its C-137 row (DEC-49; `checks.mjs`) */
const refuse = followRefusal;
const json = (v) => { try { return v == null ? null : JSON.parse(v); } catch { return null; } };
const ms = (s) => Date.parse(s);
const instant = (t) => stampInstant("second", t);
/* R21: an instant (ms since the epoch, or a non-empty string `Date.parse` reads, record-core R48's "readable instant")
   as the first whole second at or after it, in the record's `…:SSZ` spelling; else null (as `bias` R44 reads one). */
function wholeSecondFrom(v) {
  const t = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Date.parse(v) : NaN;
  if (!Number.isFinite(t)) return null;
  try { return instant(Math.ceil(t / 1000) * 1000); } catch { return null; }
}

/* ---- the instance (K61) ---- */

const instances = new WeakMap();

export function followingOf(host, deps = {}) {
  const storage = host && host.storage ? host.storage : host;
  let f = instances.get(storage);
  if (!f) {
    const record = deps.record || recordOf(host);
    const membership = deps.membership || membershipOf(host, { record });
    const lazy = (given, make) => { let v = given || null; return () => (v ||= make()); };
    f = new Following({ storage, record, membership, now: deps.now || null, view: deps.view || null, bytes: deps.bytes || null,
      capture: lazy(deps.capture, () => captureOf(host)),
      entities: lazy(deps.entities, () => entitiesOf(host)),
      events: lazy(deps.events, () => eventsOf(host)),
      standards: lazy(deps.standards, () => standardsOf(host, { record, membership })),
      monitoring: lazy(deps.monitoring, () => monitoringOf(host, { record, membership })) });
    instances.set(storage, f);
    f.migrate();
  }
  return f;
}

export class Following {
  #sql; #declared = false; #listeners = [];

  constructor({ storage, record, membership, now, view, bytes, capture, entities, events, standards, monitoring }) {
    this.#sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.now = typeof now === "function" ? now : () => Date.now();
    this.viewOpt = view;
    this.bytesOpt = bytes;
    this.dep = { capture, entities, events, standards, monitoring };
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  get capture() { return this.dep.capture(); }
  get entities() { return this.dep.entities(); }
  get events() { return this.dep.events(); }
  get standards() { return this.dep.standards(); }
  get monitoring() { return this.dep.monitoring(); }
  get host() { return this.monitoring.sweepHost(); }

  /** R17: the tables, and their declaration with their classes, once. */
  migrate() {
    migrateFollowing(this.#sql);
    if (!this.#declared && this.record && typeof this.record.declareTable === "function") {
      this.#declared = true;
      const d = this.record.declareTable(FOLLOWING_MODULE, FOLLOWING_TABLES.map((t) => ({ ...t, keys: [...t.keys] })));
      if (d && d.ok === false && d.reason !== "TABLE_DECLARED") throw new Error(`following: record-core refused its tables: ${d.reason}`);
    }
    return { ok: true };
  }

  /** R18: the instance's jurisdiction view; every local fact comes from it. */
  view() {
    if (this.viewOpt) return typeof this.viewOpt === "function" ? this.viewOpt() : this.viewOpt;
    const ids = typeof this.record.getSetting === "function" ? this.record.getSetting("jurisdiction_profiles") : null;
    const c = combine(Array.isArray(ids) ? ids : []);
    return c && c.ok ? c.view : {};
  }
  zone() { const z = this.view().time_zone; return z && typeof z.value === "string" ? z.value : "UTC"; }

  async #bytes(sha) {
    if (this.bytesOpt) return this.bytesOpt(sha);
    const store = typeof this.record.evidenceStore === "function" ? this.record.evidenceStore() : null;
    if (!store || !/^[0-9a-f]{64}$/.test(String(sha))) return null;
    try { const o = await store.get(sha); return o ? new Uint8Array(await o.arrayBuffer()) : null; } catch { return null; }
  }

  /** R19 (K1666): one listener per module, told `{follow, due}` after a follow is recorded, ended, or its next due
   *  instant changes, so `scheduler` re-arms its wake. A malformed or second registration is refused through
   *  `membership.listenerRefusal`. */
  onFollowed(module, fn) {
    const refused = listenerRefusal(this.#listeners, module, fn);
    if (refused) return refused;
    this.#listeners.push({ module, fn });
    return { ok: true, module };
  }
  /* R19: each listener once, after the act; one that throws never undoes it, nor stops the others. */
  #tell(follow, due) {
    for (const l of this.#listeners) { try { l.fn({ follow, due }); } catch { /* the act stands (R19) */ } }
  }
  /* R19: a follow's next due instant as R12 computes it (null when it is ended). */
  #nextDue(id) {
    const f = this.#follow(id);
    if (!f || f.ended_at) return null;
    const iv = MONITOR_CADENCE_MS[f.cadence] ?? MONITOR_CADENCE_MS.daily;
    return f.last_read ? instant(ms(f.last_read) + iv) : instant(this.now());
  }
  /* R19: a per-meeting watch's next capture instant, or null when it is unscheduled. */
  #meetingDue(address) {
    const m = this.#meetingPlan(this.now()).find((x) => x.address === address);
    return m && !m.unscheduled ? m.due_at : null;
  }

  /* ===================================================================== *
   * THE ACTS (R1, R7–R10; R4's link). Each refuses in order and writes nothing when it refuses.
   * ===================================================================== */

  /* R1: the refusals every follow shares: a machine (or absent) author, and a home the author may not see. */
  #actorRefusal(author, viewer, home) {
    if (!said(author) || isMachineIdentity(author))
      return refuse("MACHINE_CANNOT_FOLLOW", "a follow is a member's own act; the machine follows nothing of its own accord");
    if (home != null && (!said(home) || !this.membership.inSight(home, viewer ?? author)))
      return refuse("NO_SUCH_HOME", "the follow's home is a bundle you may see, whose project it lives in");
    return null;
  }
  #cadence(c) { return c == null || c === "" ? "daily" : FOLLOW_CADENCES.includes(c) ? c : null; }
  /* `lastRead`: R20's watch counts its policy's own text capture as its first read, so it is next due 7 days after it. */
  #insert(kind, subject, { home = null, author, from = null, until = null, cadence = "daily", gated = null, at: given = null,
                           lastRead = null }) {
    const at = given || instant(this.now());
    this.#sql.exec(`INSERT INTO follows (kind, subject, home, author, from_day, until_day, cadence, gated, at, last_read, last_outcome)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?)`, kind, JSON.stringify(subject), home, author, from, until, cadence,
                   gated ? JSON.stringify(gated) : null, at, lastRead, lastRead ? "held" : null);
    const id = Number(this.#one(`SELECT max(follow_id) AS n FROM follows`).n);
    this.#tell(id, lastRead ? this.#nextDue(id) : at);
    return { ok: true, follow: id, kind, at, ...(kind === "register" && !subject.render ? { form: "static", note: STATIC_ONLY } : {}) };
  }
  /* R8: an account or fee gate as declared by the following member; anything else is a public register. */
  #gated(g) {
    if (g == null || g === false) return { gated: null };
    if (typeof g !== "object") return { bad: "a gate is {kind: 'account' | 'fee', price?}" };
    if (g.kind === "account") return { gated: { kind: "account" } };
    if (g.kind === "fee" && said(g.price)) return { gated: { kind: "fee", price: g.price.trim() } };
    return { bad: "a fee-bearing register names its price, so the member sees it before any refresh" };
  }

  /** R1: a member's follow of a body for a period. */
  followBody({ body, from, until = null, cadence = null, home = null, author, viewer = null } = {}) {
    const r = this.#actorRefusal(author, viewer, home);
    if (r) return r;
    const ents = this.entities;
    const seen = said(body) && ents.has(body.trim()) && viewerPredicate(viewer ?? author).scope !== "DENY";
    if (!seen) return refuse("NO_SUCH_BODY", "no body by that id is registered that you may see");
    const id = this.#legistarId(body.trim());
    if (!id) return refuse("NO_LEGISTAR_ID", "the body holds no identifier in a scheme the active profiles name for Legistar");
    if (!said(from) || !isCalendarDate(from.trim()) || (until != null && (!said(until) || !isCalendarDate(until.trim()) || until.trim() < from.trim())))
      return refuse("BAD_PERIOD", "a follow names the days it covers: from (a day), and until (a day not before it) or none");
    const c = this.#cadence(cadence);
    if (!c) return refuse("BAD_FOLLOW_CADENCE", `a follow is read daily or at a longer cadence: ${FOLLOW_CADENCES.join(", ")}`);
    return this.#insert("body", { kind: "body", id: body.trim(), legistar: id }, { home, author, from: from.trim(),
      until: until == null ? null : until.trim(), cadence: c });
  }
  #legistarId(body) {
    let ids = null;
    try { ids = this.entities.identifiersOf(body); } catch { ids = null; }
    return legistarBodyId(ids && ids.ok ? ids.identifiers : [], this.view());
  }

  /** R1: a follow ends only by its author's act. */
  unfollow({ follow, author } = {}) {
    const row = this.#follow(follow);
    if (!row) return refuse("NO_SUCH_FOLLOW", "no follow by that id is held");
    if (!said(author) || author !== row.author) return refuse("NOT_THE_AUTHOR", "a follow is ended only by the member who made it");
    if (row.ended_at) return { ok: true, already: true, follow: row.follow_id, ended_at: row.ended_at };
    const at = instant(this.now());
    this.#sql.exec(`UPDATE follows SET ended_at=?, ended_by=? WHERE follow_id=?`, at, author, row.follow_id);
    this.#tell(Number(row.follow_id), null);
    return { ok: true, follow: row.follow_id, ended_at: at };
  }
  #follow(id) { const n = Number(id); return Number.isSafeInteger(n) ? this.#one(`SELECT * FROM follows WHERE follow_id=?`, n) : null; }

  /** R7, R8: a member switching a watch on for a register. */
  followRegister({ address, render = false, gated = null, cadence = null, home = null, author, viewer = null } = {}) {
    const r = this.#actorRefusal(author, viewer, home);
    if (r) return r;
    if (!said(address) || !isPublicHttpsLocator(address.trim())) return refuse("NO_LOCATOR", "a register is followed at a public https locator");
    if (render !== true && render !== false && render != null) return refuse("BAD_RENDER", "render is true or false");
    const g = this.#gated(gated);
    if (g.bad) return refuse("BAD_GATE", g.bad);
    const c = this.#cadence(cadence);
    if (!c) return refuse("BAD_FOLLOW_CADENCE", `a follow is read daily or at a longer cadence: ${FOLLOW_CADENCES.join(", ")}`);
    return this.#insert("register", { kind: "register", address: address.trim(), render: render === true }, { home, author, cadence: c, gated: g.gated });
  }

  /** R9: a register's own query for one identifier a member names for a person. */
  followPersonQuery({ register, scheme, value, address, person = null, gated = null, cadence = null, home = null, author, viewer = null } = {}) {
    const r = this.#actorRefusal(author, viewer, home);
    if (r) return r;
    const no = (detail) => refuse("PERSON_QUERY_NOT_NAMED", detail);
    const view = this.view();
    const sch = (Array.isArray(view.identifier_schemes) ? view.identifier_schemes : []).find((s) => s && s.scheme === scheme);
    if (!said(register) || !sch || !Array.isArray(sch.systems) || !sch.systems.includes(register))
      return no("the query names one register and a scheme the active profiles list for it; a query by name alone or across registers is not followed");
    if (!this.#inScheme(view, sch, value)) return no("the value is not an identifier of that scheme's form; a name is not an identifier");
    if (!said(address) || !isPublicHttpsLocator(address.trim()) || !this.#ofRegister(view, register, address.trim())
        || !decodeURIComponent(address).includes(String(value).trim()))
      return no("the query is the register's own address for that identifier, on the register's host, carrying the value");
    if (!said(home)) return no("a person query's follow lives in its author's project: name its home");
    if (person != null && !(said(person) && this.entities.has(person.trim()))) return no("the person named is not a registered entity");
    const g = this.#gated(gated);
    if (g.bad) return refuse("BAD_GATE", g.bad);
    const c = this.#cadence(cadence);
    if (!c) return refuse("BAD_FOLLOW_CADENCE", `a follow is read daily or at a longer cadence: ${FOLLOW_CADENCES.join(", ")}`);
    return this.#insert("person-query", { kind: "person-query", register, scheme, value: String(value).trim(), address: address.trim(),
      person: person == null ? null : person.trim() }, { home, author, cadence: c, gated: g.gated });
  }
  #inScheme(view, sch, value) {
    if (value == null || String(value).trim() === "") return false;
    const space = view.spaces && view.spaces[sch.space];
    const forms = (space && Array.isArray(space.forms) ? space.forms : []).filter((f) => !sch.form || f.form === sch.form);
    return forms.some((f) => { try { return new RegExp(f.pattern.re, f.pattern.flags || "").test(String(value).trim()); } catch { return false; } });
  }
  #ofRegister(view, origin, address) {
    let u;
    try { u = new URL(address); } catch { return false; }
    return (Array.isArray(view.systems) ? view.systems : []).some((s) => {
      if (!s || s.origin !== origin || !Array.isArray(s.hosts) || !s.hosts.map((h) => String(h).toLowerCase()).includes(u.host.toLowerCase())) return false;
      if (!s.path) return true;
      try { return new RegExp(s.path.re, s.path.flags || "").test(`${u.pathname}${u.search}`); } catch { return false; }
    });
  }

  /** R10: a portal's dataset, keyed to its query, with a declared key field. */
  followPortal({ address, query = null, key, cadence = null, home = null, author, viewer = null } = {}) {
    const r = this.#actorRefusal(author, viewer, home);
    if (r) return r;
    if (!said(address) || !isPublicHttpsLocator(address.trim())) return refuse("NO_LOCATOR", "a portal is followed at a public https locator");
    const q = portalKey(address.trim(), query);
    if (!q) return refuse("NO_LOCATOR", "a portal is followed at a public https locator");
    if (!said(key)) return refuse("NO_KEY", "a portal follow declares the field that keys its rows");
    const c = this.#cadence(cadence);
    if (!c) return refuse("BAD_FOLLOW_CADENCE", `a follow is read daily or at a longer cadence: ${FOLLOW_CADENCES.join(", ")}`);
    const held = this.#rows(`SELECT follow_id, subject FROM follows WHERE kind='portal' AND ended_at IS NULL`)
      .find((x) => { const s = json(x.subject); return s && s.address === q && s.key === key.trim(); });
    if (held) return { ok: true, already: true, follow: Number(held.follow_id) };
    return this.#insert("portal", { kind: "portal", address: q, key: key.trim() }, { home, author, cadence: c });
  }

  /** R4 (K1505 (15)): the body and notice period of a `per_meeting` watch. */
  perMeetingBody({ address, body, notice = null, author, viewer = null } = {}) {
    if (!said(author) || isMachineIdentity(author))
      return refuse("MACHINE_CANNOT_FOLLOW", "naming a watch's body is a member's own act");
    const sub = this.#perMeetingSubjects(this.now()).find((s) => s.address === (said(address) ? address.trim() : null)
      && this.membership.inSight(s.bundle, viewer ?? author));
    if (!sub) return refuse("NO_SUCH_MEETING_ADDRESS", "no address you may see is watched per meeting");
    if (!said(body) || !this.entities.has(body.trim())) return refuse("NO_SUCH_BODY", "no body by that id is registered that you may see");
    const at = instant(this.now());
    this.#sql.exec(`INSERT INTO per_meeting_links (address, bundle_id, body, notice, author, at) VALUES (?,?,?,?,?,?)`,
                   sub.address, sub.bundle, body.trim(), said(notice) ? notice.trim() : null, author, at);
    this.#tell(`per_meeting:${sub.address}`, this.#meetingDue(sub.address));
    return { ok: true, address: sub.address, body: body.trim(), notice: said(notice) ? notice.trim() : null, at };
  }

  /* ===================================================================== *
   * THE PLAN (R4, R5, R12): what is due, when, and what is not scheduled.
   * ===================================================================== */

  /* The `per_meeting` subjects monitoring holds (its R14, R16: unscheduled, no interval). */
  #perMeetingSubjects(nowMs) {
    let s = null;
    try { s = this.monitoring.schedule(nowMs); } catch { s = null; }
    return (s && Array.isArray(s.unscheduled) ? s.unscheduled : []).filter((u) => u.frequency === "per_meeting" && said(u.address));
  }

  /* R4, R5: each per_meeting watch's next capture, or why it is unscheduled. */
  #meetingPlan(nowMs) {
    const out = [];
    const view = this.view(), zone = this.zone();
    for (const sub of this.#perMeetingSubjects(nowMs)) {
      const link = this.#one(`SELECT * FROM per_meeting_links WHERE address=? ORDER BY seq DESC LIMIT 1`, sub.address);
      const base = { kind: "meeting", address: sub.address, bundle: sub.bundle };
      if (!link || !link.body) { out.push({ ...base, unscheduled: "the watch names no body whose meetings it is captured before" }); continue; }
      const n = noticeRule(view, link.notice);
      if (n.why) { out.push({ ...base, body: link.body, unscheduled: n.why }); continue; }
      let label = null, observed = [];
      try { const e = this.entities.readEntity({ entityId: link.body, viewer: MACHINE }); label = e && e.entity ? e.entity.label : null; } catch { label = null; }
      try { const e = this.events.eventsFor({ entity: link.body, kinds: ["meeting"], viewer: MACHINE, limit: 500 }); observed = e && e.ok ? e.events : []; } catch { observed = []; }
      const since = ms(link.at);
      const m = meetingsOf({ view, bodyLabel: label, observed, fromMs: since, zone });
      if (m.why) { out.push({ ...base, body: link.body, unscheduled: m.why }); continue; }
      let next = null, why = null;
      for (const meeting of m.meetings) {
        if (this.#one(`SELECT 1 AS x FROM per_meeting_captures WHERE address=? AND meeting=?`, sub.address, meeting.instant)) continue;
        const d = dueBefore(meeting, n.rule, view);
        if (d.why) { why = d.why; continue; }
        if (ms(meeting.instant) < since) continue;
        next = { ...base, body: link.body, notice: n.rule.rule, meeting: meeting.instant, meeting_source: meeting.source,
                 ...(meeting.event_id ? { event_id: meeting.event_id } : {}), due_at: d.at };
        break;
      }
      if (next) out.push(next);
      else if (why) out.push({ ...base, body: link.body, unscheduled: why });
    }
    return out;
  }

  /* R12: each live follow's next read: due daily (or at its longer cadence) from its last read; never read, now. */
  #followPlan(nowMs) {
    return this.#rows(`SELECT * FROM follows WHERE ended_at IS NULL ORDER BY follow_id`).map((f) => {
      const iv = MONITOR_CADENCE_MS[f.cadence] ?? MONITOR_CADENCE_MS.daily;
      const due = f.last_read ? ms(f.last_read) + iv : null;
      return { kind: "follow", follow: f, id: Number(f.follow_id), due_at: due == null ? null : instant(due), dueMs: due ?? 0 };
    });
  }

  /** R12: everything due now, oldest due first, and the earliest instant one falls due. */
  plan(now) {
    const nowMs = Number.isFinite(now) ? now : this.now();
    this.#syncPolicies(nowMs);
    const follows = this.#followPlan(nowMs), meetings = this.#meetingPlan(nowMs);
    const due = [], unscheduled = [];
    let wake = null;
    const consider = (t) => { if (wake === null || t < wake) wake = t; };
    for (const f of follows) { if (f.dueMs <= nowMs) due.push(f); else consider(f.dueMs); }
    for (const m of meetings) {
      if (m.unscheduled) { unscheduled.push(m); continue; }
      const t = ms(m.due_at);
      if (t <= nowMs) due.push({ ...m, dueMs: t }); else consider(t);
    }
    /* oldest due first; then follows by id, then meetings by address */
    due.sort((a, b) => (a.dueMs - b.dueMs) || ((a.id ?? Infinity) - (b.id ?? Infinity))
      || String(a.address ?? "").localeCompare(String(b.address ?? "")) || 0);
    return { due, unscheduled, wake };
  }

  /** R12: due while any follow or per-meeting capture is due. */
  followDue(now) { return this.plan(now).due.length > 0; }
  /** R12: the earliest instant one falls due (now when one is), or null. */
  followWake(now) {
    const nowMs = Number.isFinite(now) ? now : this.now();
    const p = this.plan(nowMs);
    return p.due.length ? nowMs : p.wake;
  }

  /* ===================================================================== *
   * THE TICK (R13), and each subject's read (R2, R3, R4, R6–R10).
   * ===================================================================== */

  /** R13: at most 50 due subjects, oldest due first or in the rank's order, each claimed under the host's epoch. */
  async followTick(now, rank = null) {
    const h = this.host;
    const nowMs = Number.isFinite(now) ? now : this.now();
    const at = instant(nowMs);
    const answer = { configured: true, at, epoch: null, read: [], captured: [], unscheduled: [], member_act_required: [], failed: [], paused: h.paused() };
    if (answer.paused.paused) return { ...answer, note: "the daemon is paused by an administrator: nothing was read" };
    if (h.running.has(FOLLOW_CONSUMER)) return { ...answer, busy: true };
    h.running.add(FOLLOW_CONSUMER);
    try {
      const p = this.plan(nowMs);
      answer.unscheduled = p.unscheduled.map((u) => ({ address: u.address, bundle: u.bundle, ...(u.body ? { body: u.body } : {}), reason: u.unscheduled }));
      const read = typeof rank === "function" ? p.due.slice(0, FOLLOW_TICK_BATCH * 10) : p.due;
      const batch = h.ranked(read, (x) => ({ kind: x.kind === "meeting" ? "meeting" : `follow:${x.follow.kind}`, id: this.#subjectKey(x),
                                            waitingSince: x.dueMs > 0 ? x.dueMs : null }), rank, nowMs).slice(0, FOLLOW_TICK_BATCH);
      const epoch = h.openEpoch(FOLLOW_CONSUMER, nowMs, EPOCH_MS);
      answer.epoch = epoch;
      const skipped = [];
      for (const x of batch) {
        const key = this.#subjectKey(x);
        if (!h.claim(FOLLOW_CONSUMER, key, epoch)) { skipped.push(key); continue; }
        try {
          const r = x.kind === "meeting" ? await this.#readMeeting(x, nowMs) : await this.#readFollow(x.follow, nowMs);
          if (r.member_act_required) answer.member_act_required.push(r.member_act_required);
          else answer.read.push(r.read);
          for (const c of r.captured || []) answer.captured.push(c);
          for (const f of r.failed || []) answer.failed.push(f);
        } catch (e) { answer.failed.push({ subject: key, reason: String((e && e.message) || e).slice(0, 200) }); }
      }
      if (skipped.length) answer.skipped = skipped;
      if (!answer.failed.length && !skipped.length) h.closeEpoch(FOLLOW_CONSUMER, epoch);
      return answer;
    } finally { h.running.delete(FOLLOW_CONSUMER); }
  }
  #subjectKey(x) { return x.kind === "meeting" ? `meeting:${x.address}@${x.meeting}` : `follow:${x.id}`; }

  /* R4, R6: the watch's capture before its meeting, through monitoring's own check of the document, with the lateness. */
  async #readMeeting(x, nowMs) {
    const r = await this.monitoring.monitor({ bundleId: x.bundle, viewer: MACHINE, actorClass: "machine", actor: MACHINE });
    const b = (r && r.body) || {};
    const lateness = nowMs - ms(x.due_at);
    const taken = instant(nowMs);
    const outcome = b.ok ? "captured" : `failed: ${b.reason || "no answer"}`;
    const entry = { address: x.address, bundle: x.bundle, meeting: x.meeting, due_at: x.due_at, taken_at: taken, lateness_ms: lateness,
                    after_meeting_began: nowMs >= ms(x.meeting), ...(b.capture ? { capture: b.capture.sha256 ?? null } : {}) };
    if (!b.ok) return { read: { subject: `meeting:${x.address}`, outcome }, failed: [{ ...entry, reason: b.reason || "the check did not answer" }] };
    this.#sql.exec(`INSERT OR REPLACE INTO per_meeting_captures (address, meeting, bundle_id, due_at, taken_at, lateness_ms, outcome) VALUES (?,?,?,?,?,?,?)`,
                   x.address, x.meeting, x.bundle, x.due_at, taken, lateness, outcome);
    this.#tell(`per_meeting:${x.address}`, this.#meetingDue(x.address));
    return { read: { subject: `meeting:${x.address}`, outcome: "captured", lateness_ms: lateness }, captured: [{ kind: "per_meeting", ...entry }] };
  }

  /* One follow's read, by its kind. */
  async #readFollow(f, nowMs) {
    const subject = json(f.subject) || {};
    const at = instant(nowMs);
    const gated = json(f.gated);
    let r;
    if (f.kind === "policy" && POLICY_GATED_ACCESS.includes(subject.access)) {
      /* R20, R8, R15: a policy behind an account or a fee is never read on the tick, nothing fetched */
      r = { member_act_required: { follow: Number(f.follow_id), kind: f.kind, standard: subject.standard, gate: subject.access,
            why: "this policy is read only by a member's own act: its copy is behind an account or a fee" }, outcome: "member_act_required" };
    } else if (gated && (f.kind === "register" || f.kind === "person-query")) {
      /* R8, R15: never read on the tick, nothing fetched */
      r = { member_act_required: { follow: Number(f.follow_id), kind: f.kind, gate: gated.kind, ...(gated.price ? { price: gated.price } : {}),
            why: "this register is read only by the act of the member whose own credential or fee it uses" }, outcome: "member_act_required" };
    } else if (f.kind === "body") r = await this.#readBody(f, subject, nowMs);
    else if (f.kind === "portal") r = await this.#readPortal(f, subject, nowMs);
    else if (f.kind === "policy") r = await this.#readPolicy(f, subject, nowMs);
    else r = await this.#readRegister(f, subject, nowMs);
    /* a failed read stays due (its epoch stays open, so this tick's retry reads it again only under a fresh epoch); a
       policy watch's failed attempt counts as its read, so its address is fetched at most every 7 days (R20, K1881) */
    if (r.outcome === "failed" && f.kind !== "policy") this.#sql.exec(`UPDATE follows SET last_outcome=? WHERE follow_id=?`, r.outcome, f.follow_id);
    else {
      this.#sql.exec(`UPDATE follows SET last_read=?, last_outcome=? WHERE follow_id=?`, at, r.outcome, f.follow_id);
      this.#tell(Number(f.follow_id), this.#nextDue(f.follow_id));
    }
    return r;
  }

  /* One address read through acquire's capture-request arm (R2, R7, R9, R10), held bytes compared, and landed when new.
     `member` and `credential` are R8's (a member's own act); the tick passes neither (R15). */
  async #take(f, address, nowMs, { render = false, reading = null, member = null, credential = null, notPublic = false, title = null,
                                   home = f.home } = {}) {
    const held = this.#one(`SELECT * FROM follow_reads WHERE follow_id=? AND address=?`, f.follow_id, address);
    const opts = { cls: member ? "member" : "daemon", member: !!member, sessMember: member || null,
      captureRequest: { locator: address, purpose: FOLLOW_PURPOSE, agent: null, render: render === true,
        ...(held ? { heldSha: held.capture_sha } : {}), ...(credential ? { credential } : {}) } };
    let a;
    try { const r = await this.capture.acquire({}, opts); a = (r && r.body) || r || { ok: false, reason: "NO_ANSWER" }; }
    catch (e) { a = { ok: false, reason: String((e && e.message) || e).slice(0, 160) }; }
    if (!a.ok) return { failed: { address, reason: a.reason || a.code || "failed" } };
    const sha = (a.document && a.document.capture && a.document.capture.sha256) || (a.capture && a.capture.sha256) || null;
    if (!sha) return { failed: { address, reason: "the capture named no digest" } };
    if (a.unchanged === true || (held && held.capture_sha === sha)) return { sha, same: true, bundle: held ? held.bundle_id : null };
    const at = instant(nowMs);
    const doc = { ...a.document };
    let bytes = null;
    if (reading) {
      bytes = await this.#bytes(sha);
      const rd = bytes ? reading(bytes, doc.locator || address, at) : null;
      if (rd) doc.reading = rd;
    }
    if (notPublic) doc.capture = { ...doc.capture, reproducible_by_public: false };
    const by = f.kind === "policy" ? "the group's standing watch of a policy it holds" : `a member's standing act (${f.author})`;
    const landed = this.host.land({ id: `follow ${f.follow_id}`, bundle: home, locators: [address], target: null }, { locator: address, doc }, at, {
      title: title || `Followed: ${address}`,
      summary: `The answer served at ${address}, read for the follow ${f.follow_id}.`,
      notes: `Read for the follow ${f.follow_id} (${f.kind}), ${by}. Collected ${at}. Filed at collected and `
           + `never higher: verifying it is a named member's decision.${notPublic ? ` ${NOT_PUBLIC}.` : ""}`,
      trigger: `follow ${f.follow_id}` });
    if (!landed || !landed.ok) return { failed: { address, reason: (landed && (landed.reason || landed.detail)) || "NOT_FILED" } };
    this.#sql.exec(`INSERT OR REPLACE INTO follow_reads (follow_id, address, capture_sha, bundle_id, facts, at) VALUES (?,?,?,?,?,?)`,
                   f.follow_id, address, sha, landed.bundle_id, held ? held.facts : null, at);
    return { sha, same: false, bundle: landed.bundle_id, bytes, reading: doc.reading || null };
  }

  /* R2, R3: a body's Legistar records for its followed period, each read handed to `legistar-reader` and to events. */
  async #readBody(f, s, nowMs) {
    const { client, id } = s.legistar || {};
    const to = f.until_day || null;
    const period = { from: f.from_day, to: f.until_day };
    const captured = [], failed = [], imported = [];
    let fetches = 0, truncated = false;
    const legistarReading = (bytes, locator, at) => {
      try { return { content_type: LEGISTAR_KEY, reader_version: 1, found: true, at, entities: [], facts: parseLegistar({ locator, bytes, at }) }; }
      catch { return null; }
    };
    const read = async (address, imports = true) => {
      if (fetches >= BODY_READ_FETCHES) { truncated = true; return null; }
      fetches++;
      const t = await this.#take(f, address, nowMs, { reading: legistarReading, title: `Followed body ${s.id}: ${address}` });
      if (t.failed) { failed.push({ follow: Number(f.follow_id), ...t.failed }); return null; }
      if (!t.same) captured.push({ kind: "legistar", follow: Number(f.follow_id), address, capture: t.sha, bundle: t.bundle });
      if (!t.same && imports) {
        let imp;
        try { imp = this.events.followedImport({ captureSha: t.sha, body: s.id, period, by: MACHINE }); }
        catch (e) { imp = { ok: false, reason: String((e && e.message) || e).slice(0, 160) }; }
        if (imp && imp.ok === false) failed.push({ follow: Number(f.follow_id), address, reason: `events refused the import: ${imp.reason}` });
        else imported.push({ address, capture: t.sha });
      }
      return t;
    };
    const rowsOf = async (t, locator) => {
      if (!t) return [];
      const bytes = t.bytes || await this.#bytes(t.sha);
      if (!bytes) return [];
      try { return parseLegistar({ locator, bytes, at: null }).rows; } catch { return []; }
    };
    /* the meetings, then each meeting's items, then each item's votes (an item is written within its meeting) */
    const evAt = eventsAddress(client, id, f.from_day, to);
    const ev = await read(evAt);
    for (const e of await rowsOf(ev && ev.same ? null : ev, evAt)) {
      const itAt = itemsAddress(client, e.ids.EventId);
      const items = await read(itAt);
      for (const it of await rowsOf(items && items.same ? null : items, itAt)) await read(votesAddress(client, it.ids.EventItemId));
    }
    /* R3: a matter whose enactment record moved is captured anew at its own address (a new version there) */
    const mtAt = mattersAddress(client, id, f.from_day, to);
    const mt = await read(mtAt, false);
    for (const m of await rowsOf(mt && mt.same ? null : mt, mtAt)) {
      const key = matterAddress(client, m.ids.MatterId);
      const now = enactmentOf(m);
      const held = this.#one(`SELECT facts FROM follow_reads WHERE follow_id=? AND address=?`, f.follow_id, key);
      if (held && JSON.stringify(json(held.facts)) === JSON.stringify(now)) continue;
      const t = await read(key, false);
      if (t) this.#sql.exec(`UPDATE follow_reads SET facts=? WHERE follow_id=? AND address=?`, JSON.stringify(now), f.follow_id, key);
      if (t && !t.same) captured[captured.length - 1].enactment = now;
    }
    const outcome = failed.length ? "failed" : captured.length ? "captured" : "unchanged";
    return { read: { follow: Number(f.follow_id), kind: "body", outcome, fetches, imported: imported.length, ...(truncated ? { truncated: true } : {}) },
             captured, failed, outcome };
  }

  /* R7, R9: a public register (or a person query on one), re-read, or re-rendered when the follow says so. */
  async #readRegister(f, s, nowMs) {
    const t = await this.#take(f, s.address, nowMs, { render: s.render === true, title: `Followed register: ${s.address}` });
    const form = f.kind === "register" && !s.render ? { form: "static", note: STATIC_ONLY } : {};
    if (t.failed) return { read: { follow: Number(f.follow_id), kind: f.kind, outcome: "failed", ...form }, failed: [{ follow: Number(f.follow_id), ...t.failed }], outcome: "failed" };
    const outcome = t.same ? "unchanged" : "captured";
    return { read: { follow: Number(f.follow_id), kind: f.kind, outcome, capture: t.sha, ...form },
             captured: t.same ? [] : [{ kind: f.kind, follow: Number(f.follow_id), address: s.address, capture: t.sha, bundle: t.bundle }], outcome };
  }

  /* R10: a portal's answer as a snapshot, a vintage valid at its capture instant. */
  async #readPortal(f, s, nowMs) {
    const t = await this.#take(f, s.address, nowMs, { title: `Portal snapshot: ${s.address}` });
    if (t.failed) return { read: { follow: Number(f.follow_id), kind: "portal", outcome: "failed" }, failed: [{ follow: Number(f.follow_id), ...t.failed }], outcome: "failed" };
    if (t.same) return { read: { follow: Number(f.follow_id), kind: "portal", outcome: "unchanged", capture: t.sha }, outcome: "unchanged" };
    const bytes = await this.#bytes(t.sha);
    const ds = bytes ? readDataset(new TextDecoder("utf-8", { fatal: false }).decode(bytes)) : { why: "the snapshot's bytes could not be read back" };
    const seq = Number(this.#one(`SELECT COALESCE(max(seq), 0) + 1 AS n FROM portal_snapshots WHERE follow_id=?`, f.follow_id).n);
    const at = instant(nowMs);
    this.#sql.exec(`INSERT INTO portal_snapshots (follow_id, seq, capture_sha, bundle_id, at, rows, why) VALUES (?,?,?,?,?,?,?)`,
                   f.follow_id, seq, t.sha, t.bundle, at, ds.rows ? JSON.stringify(ds.rows) : null, ds.why || null);
    return { read: { follow: Number(f.follow_id), kind: "portal", outcome: "captured", capture: t.sha, snapshot: seq },
             captured: [{ kind: "portal", follow: Number(f.follow_id), address: s.address, capture: t.sha, bundle: t.bundle, snapshot: seq,
                          valid: vintage(at) }], outcome: "captured" };
  }

  /** R8: a register behind an account or a fee, refreshed only by the act of the member whose credential it uses. */
  async refreshRegister({ follow, author, credential = null, price = null } = {}) {
    const f = this.#follow(follow);
    if (!f || f.ended_at || !["register", "person-query"].includes(f.kind)) return refuse("NO_SUCH_FOLLOW", "no live register follow by that id is held");
    const gated = json(f.gated);
    if (!gated) return refuse("NOT_GATED", "a public register is read on the tick; a member's refresh is for one behind an account or a fee");
    if (!said(author) || isMachineIdentity(author) || author !== f.author)
      return refuse("NOT_THE_FOLLOWER", "only the member who follows this register refreshes it, with their own credential");
    if (gated.kind === "fee" && price !== gated.price)
      return refuse("PRICE_FIRST", `this register charges ${gated.price}; the refresh runs only once that price is accepted as shown`, { price: gated.price });
    if (gated.kind === "account" && (!credential || typeof credential !== "object"))
      return refuse("NO_CREDENTIAL", "an account-gated register is read with the member's own credential");
    const s = json(f.subject) || {};
    const t = await this.#take(f, s.address, this.now(), { render: s.render === true, member: author, credential, notPublic: true,
      title: `Refreshed by its member: ${s.address}` });
    if (t.failed) return refuse("NOT_READ", t.failed.reason);
    this.#sql.exec(`UPDATE follows SET last_read=?, last_outcome=? WHERE follow_id=?`, instant(this.now()), t.same ? "unchanged" : "captured", f.follow_id);
    this.#tell(Number(f.follow_id), this.#nextDue(f.follow_id));
    return { ok: true, follow: Number(f.follow_id), capture: t.sha, unchanged: t.same, reproducible_by_public: false, note: NOT_PUBLIC };
  }

  /* ===================================================================== *
   * THE POLICIES A GROUP HOLDS (R20, R21; K1727, K1740).
   * ===================================================================== */

  /* R20: every policy `standards` holds whose text is held from a capture with a direct receipt at a public https
     address, one entry per (policy, address): `{standard, address, capture, at, home, access}`, the latest of its text
     captures at that address. A superseded policy, one held cited or absent, and one whose text has no such capture
     are not watched. `home` is the text's bundle while the policy is held at its source's sight (standards R37), so
     each capture takes the policy's sight; else null (group-wide). Null when standards cannot be read. */
  #heldPolicies() {
    const out = new Map();
    let after = null;
    try {
      for (let page = 0; page < 1000; page++) {
        const r = this.standards.standardsIn({ kind: "policy", after, limit: POLICY_PAGE, viewer: MACHINE });
        if (!r || r.ok === false || !Array.isArray(r.items)) return null;
        for (const p of r.items) {
          if ((p.held || "text") !== "text" || p.superseded_by) continue;
          const bundleSight = p.sight && p.sight.class === "bundle";
          for (const contentId of Array.isArray(p.text) ? p.text : []) {
            const c = this.#one(`SELECT capture_sha, bundle_id FROM content WHERE content_id=?`, contentId);
            if (!c) continue;
            for (const l of this.#rows(`SELECT address, first_retrieved FROM captured_locators WHERE capture_sha=? AND via='direct'
                                         ORDER BY first_retrieved`, c.capture_sha)) {
              if (!said(l.address) || !isPublicHttpsLocator(l.address)) continue;
              const key = `${p.id}\n${l.address}`;
              const was = out.get(key);
              if (!was || l.first_retrieved > was.at)
                out.set(key, { standard: p.id, address: l.address, capture: c.capture_sha, at: l.first_retrieved,
                               home: bundleSight ? c.bundle_id : null, access: p.access ?? null });
            }
          }
        }
        if (!r.truncated || !r.cursor) break;
        after = r.cursor;
      }
    } catch { return null; }
    return out;
  }

  /* R20: the watches made when a policy's text is first held and ended when it is superseded or no longer watchable;
     each make and end tells R19's listeners. Nothing changes when standards cannot be read. */
  #syncPolicies(nowMs) {
    const held = this.#heldPolicies();
    if (!held) return;
    const live = new Map();
    for (const w of this.#rows(`SELECT follow_id, subject FROM follows WHERE kind='policy' AND ended_at IS NULL`)) {
      const s = json(w.subject) || {};
      live.set(`${s.standard}\n${s.address}`, Number(w.follow_id));
    }
    for (const [key, id] of live) {
      if (held.has(key)) continue;
      this.#sql.exec(`UPDATE follows SET ended_at=?, ended_by=? WHERE follow_id=?`, instant(nowMs), MACHINE, id);
      this.#tell(id, null);
    }
    for (const [key, p] of held) {
      if (live.has(key)) continue;
      const r = this.#insert("policy", { kind: "policy", standard: p.standard, address: p.address, access: p.access },
                             { home: p.home, author: "", cadence: POLICY_WATCH_CADENCE, at: instant(nowMs), lastRead: p.at });
      /* the policy's own text capture is the first version seen, and the bytes the first read compares with */
      this.#sql.exec(`INSERT INTO policy_versions (follow_id, seq, capture_sha, bundle_id, at) VALUES (?, 1, ?, ?, ?)`,
                     r.follow, p.capture, p.home, p.at);
      this.#sql.exec(`INSERT OR REPLACE INTO follow_reads (follow_id, address, capture_sha, bundle_id, facts, at) VALUES (?,?,?,?,NULL,?)`,
                     r.follow, p.address, p.capture, p.home, p.at);
    }
  }

  /* R20: one policy watch's read: its address, compared with the last version seen; bytes that differ are kept as a new
     version beside every earlier one, landed with the policy's sight. */
  async #readPolicy(f, s, nowMs) {
    let home = f.home;
    try {
      const a = this.standards.standardRead({ id: s.standard, viewer: MACHINE });
      if (a && a.ok !== false && a.sight && a.sight.class !== "bundle") home = null;   /* released (standards R37) */
    } catch { /* keep the watch's own home */ }
    const t = await this.#take(f, s.address, nowMs, { home, title: `Policy watched: ${s.address}` });
    const base = { follow: Number(f.follow_id), kind: "policy", standard: s.standard };
    if (t.failed) return { read: { ...base, outcome: "failed" }, failed: [{ ...base, ...t.failed }], outcome: "failed" };
    if (t.same) return { read: { ...base, outcome: "unchanged", capture: t.sha }, outcome: "unchanged" };
    const prev = this.#one(`SELECT seq, capture_sha, at FROM policy_versions WHERE follow_id=? ORDER BY seq DESC LIMIT 1`, f.follow_id);
    const at = instant(nowMs);
    this.#sql.exec(`INSERT INTO policy_versions (follow_id, seq, capture_sha, bundle_id, at) VALUES (?,?,?,?,?)`,
                   f.follow_id, (prev ? Number(prev.seq) : 0) + 1, t.sha, t.bundle, at);
    return { read: { ...base, outcome: "captured", capture: t.sha },
             captured: [{ ...base, address: s.address, capture: t.sha, bundle: t.bundle,
                          ...(prev ? { before: { capture: prev.capture_sha, at: prev.at } } : {}) }], outcome: "captured" };
  }

  /* R14, R21: whether the viewer may read the watched policy (standards' own sight, R37): `isMeasure` answers exactly
     that for a policy held with its text, the only kind watched. A viewer naming no one reads none. */
  #readsPolicy(standard, viewer) {
    if (!said(viewer) || viewerPredicate(viewer).scope === "DENY" || !said(standard)) return false;
    try { return this.standards.isMeasure(standard, viewer) === true; } catch { return false; }
  }

  /** R21: the policy changes a member reviews as "Noticed": one entry per kept version whose bytes differ from the one
   *  before, in order of the later capture's instant (then of keeping), after the cursor `after`, at most `limit`;
   *  with `since`, only those whose later capture's instant is at or after it (T36, N741), the order, `after`, `limit`
   *  and `cursor` unchanged. A `since` that is not an instant answers none and says so (`since_invalid`, as `bias`
   *  R44's). A change in a policy the viewer may not read is left out whole. Writes nothing; says nothing of what a
   *  change means. */
  policyChanges({ after = null, since = null, limit = null, viewer = null } = {}) {
    const n = Number.isInteger(Number(limit)) && limit !== null && limit !== ""
      ? Math.min(POLICY_CHANGES_MAX, Math.max(1, Number(limit))) : POLICY_CHANGES_MAX;
    const lo = since === null || since === undefined ? null : wholeSecondFrom(since);
    if (since !== null && since !== undefined && lo === null)
      return { ok: true, changes: [], cursor: null, since_invalid: true,
               note: "since is not an instant, so no policy change is listed" };
    const from = said(String(after ?? "")) ? this.#one(`SELECT change_id, at FROM policy_versions WHERE change_id=?`, Number(after)) : null;
    /* every later capture's `at` is the tick's whole-second stamp (`instant`), so the instants compare as text */
    const rows = this.#rows(`SELECT v.change_id, v.follow_id, v.capture_sha, v.at, p.capture_sha AS before_sha, p.at AS before_at, f.subject
                             FROM policy_versions v JOIN policy_versions p ON p.follow_id = v.follow_id AND p.seq = v.seq - 1
                             JOIN follows f ON f.follow_id = v.follow_id
                             WHERE v.capture_sha <> p.capture_sha ${lo ? "AND v.at >= ?" : ""}
                               ${from ? "AND (v.at > ? OR (v.at = ? AND v.change_id > ?))" : ""}
                             ORDER BY v.at, v.change_id`, ...(lo ? [lo] : []), ...(from ? [from.at, from.at, Number(from.change_id)] : []));
    const seen = new Map();
    const changes = [];
    let more = false;
    for (const r of rows) {
      const s = json(r.subject) || {};
      if (!seen.has(s.standard)) seen.set(s.standard, this.#readsPolicy(s.standard, viewer));
      if (!seen.get(s.standard)) continue;
      if (changes.length === n) { more = true; break; }
      changes.push({ change: Number(r.change_id), watch: Number(r.follow_id), standard: s.standard, address: s.address,
                     before: { capture: r.before_sha, at: r.before_at }, after: { capture: r.capture_sha, at: r.at },
                     amendment_held: this.#amendmentHeld(s.standard, r.before_at, r.at) });
    }
    return { ok: true, changes: changes.map(({ change, ...c }) => c),
             cursor: more ? String(changes[changes.length - 1].change) : null,
             note: "a difference between two captures of a policy's published copy, never a finding: what it means is a member's to say" };
  }

  /* R21: whether standards holds an amendment of the policy, or a version superseding it, effective between the two
     captures' local days (inclusive): the successor's stated start or the later capture of its version basis
     (standards R38), or an adopted temporal relation into it (`law-relations` R2, through `lawRelationsOf`). */
  #amendmentHeld(standard, beforeAt, afterAt) {
    const zone = this.zone();
    let lo, hi;
    try { lo = localDay(beforeAt, zone); hi = localDay(afterAt, zone); } catch { return false; }
    const within = (d) => typeof d === "string" && isCalendarDate(d) && d >= lo && d <= hi;
    try {
      const a = this.standards.standardRead({ id: standard, viewer: MACHINE });
      const next = a && a.ok !== false ? a.superseded_by : null;
      if (next) {
        const b = this.standards.standardRead({ id: next, viewer: MACHINE });
        if (b && b.ok !== false) {
          if (within(b.period && b.period.from)) return true;
          if (b.version_basis && typeof b.version_basis.through === "string" && within(localDay(b.version_basis.through, zone))) return true;
        }
      }
    } catch { /* not held, read as none */ }
    try {
      const r = this.standards.lawRelationsOf({ standard, viewer: MACHINE });
      for (const t of r && Array.isArray(r.temporal) ? r.temporal : []) {
        if (t.direction !== "in" || t.withdrawn || !t.effective) continue;
        const day = t.effective.date ? t.effective.date : this.#eventDay(t.effective.event, t.effective.edge);
        if (within(day)) return true;
      }
    } catch { /* none held */ }
    return false;
  }

  /* R21: the local day an event's `when` gives at its edge (`events`), or null. */
  #eventDay(eventId, edge) {
    try {
      const r = this.events.readEvent({ eventId, viewer: MACHINE });
      const w = r && r.event ? r.event.when : null;
      if (!w || typeof w.zone !== "string") return null;
      const at = edge === "end" ? (typeof w.end === "string" ? instant(Date.parse(w.end) - 1000) : null) : w.start;
      return typeof at === "string" ? localDay(at, w.zone) : null;
    } catch { return null; }
  }

  /* ===================================================================== *
   * THE READS (R11, R14).
   * ===================================================================== */

  #sees(f, viewer) {
    if (viewerPredicate(viewer).scope === "DENY") return false;
    if (f.kind === "policy") return this.#readsPolicy((json(f.subject) || {}).standard, viewer);
    return f.home == null || this.membership.inSight(f.home, viewer);
  }

  /** R11: between two snapshots of one portal follow, what was added, removed and changed by key. Writes nothing. */
  snapshotDiff({ follow, from, to, viewer = null } = {}) {
    const f = this.#follow(follow);
    if (!f || f.kind !== "portal" || !this.#sees(f, viewer)) return refuse("NO_SUCH_FOLLOW", "no portal follow by that id you may see");
    const snap = (n) => this.#one(`SELECT * FROM portal_snapshots WHERE follow_id=? AND seq=?`, f.follow_id, Number(n));
    const a = snap(from), b = snap(to);
    if (!a || !b) return refuse("NO_SUCH_SNAPSHOT", "both snapshots are of this follow, by their sequence numbers");
    const key = (json(f.subject) || {}).key;
    const base = { ok: true, follow: Number(f.follow_id), key, from: { seq: a.seq, at: a.at, valid: vintage(a.at) }, to: { seq: b.seq, at: b.at, valid: vintage(b.at) },
                   note: "a difference between two answers of the portal, never a finding" };
    const unread = [a, b].filter((x) => !x.rows);
    if (unread.length) return { ...base, added: [], removed: [], changed: [],
      undetermined: unread.map((x) => ({ key: null, snapshot: x.seq, why: x.why || "the snapshot was not read as rows" })) };
    return { ...base, ...diffRows(json(a.rows) || [], json(b.rows) || [], key) };
  }

  /** R10: a portal's snapshots, each a vintage whose validity is its capture instant (`civil-time` `validAt`). */
  snapshots({ follow, at = null, viewer = null } = {}) {
    const f = this.#follow(follow);
    if (!f || f.kind !== "portal" || !this.#sees(f, viewer)) return refuse("NO_SUCH_FOLLOW", "no portal follow by that id you may see");
    const list = this.#rows(`SELECT seq, capture_sha, at, why FROM portal_snapshots WHERE follow_id=? ORDER BY seq`, f.follow_id)
      .map((x) => ({ seq: Number(x.seq), capture: x.capture_sha, at: x.at, valid: vintage(x.at),
                     ...(at ? { valid_at: validAt({ valid: vintage(x.at) }, at) } : {}), ...(x.why ? { why: x.why } : {}) }));
    return { ok: true, follow: Number(f.follow_id), snapshots: list };
  }

  /** R14: every follow the viewer may see, and every per-meeting watch, with what is not being read and why. */
  follows({ viewer = null, now = null } = {}) {
    const nowMs = Number.isFinite(Number(now)) && now !== null && now !== "" ? Number(now) : this.now();
    this.#syncPolicies(nowMs);
    const plan = this.#followPlan(nowMs);
    const items = [];
    for (const p of plan) {
      const f = p.follow;
      if (!this.#sees(f, viewer)) continue;
      const s = json(f.subject) || {};
      const gated = json(f.gated);
      items.push({ follow: p.id, kind: f.kind, subject: s, author: f.kind === "policy" ? null : f.author, home: f.home,
        period: f.kind === "body" ? { from: f.from_day, until: f.until_day } : null, cadence: f.cadence, at: f.at,
        last_read: f.last_read, last_outcome: f.last_outcome, next_due: p.due_at ?? instant(nowMs),
        ...(gated ? { gated, unscheduled: "read only at its member's own act (R8); the tick fetches nothing" } : {}),
        ...(f.kind === "policy" ? { watch: "the group's standing watch of a policy it holds: no member made it, and it ends when the policy is superseded",
                                    ...(POLICY_GATED_ACCESS.includes(s.access) ? { unscheduled: "read only by a member's own act: the policy's copy is behind an account or a fee; the tick fetches nothing" } : {}) } : {}),
        ...(f.kind === "register" && !s.render ? { form: "static", note: STATIC_ONLY } : {}) });
    }
    for (const m of this.#meetingPlan(nowMs)) {
      if (!this.membership.inSight(m.bundle, viewer)) continue;
      items.push({ kind: "per_meeting", subject: { address: m.address, bundle: m.bundle, body: m.body ?? null },
        ...(m.unscheduled ? { unscheduled: m.unscheduled } : { notice: m.notice, meeting: m.meeting, meeting_source: m.meeting_source, next_due: m.due_at }),
        last_capture: this.#one(`SELECT meeting, due_at, taken_at, lateness_ms FROM per_meeting_captures WHERE address=? ORDER BY taken_at DESC LIMIT 1`, m.address) });
    }
    return { ok: true, as_of: instant(nowMs), items };
  }
}

/** R10: a snapshot's validity: the capture instant, at second precision (`civil-time`'s value). */
export function vintage(at) { const v = String(at).slice(0, 19); return { from: v, to: v, precision: "second", zone: "UTC" }; }

/** The module's ops (K3), spread into the plane's op map. `viewer` and `by` are the control plane's stamps, read from
 *  the url; a body's own copy is never read. */
export function followingOps(f, url, body) {
  const q = (k) => url.searchParams.get(k);
  const act = (fn) => () => fn({ ...(body || {}), author: q("by") ?? null, viewer: q("viewer") ?? null });
  return {
    followbody: act((b) => f.followBody(b)),
    unfollow: act((b) => f.unfollow(b)),
    followregister: act((b) => f.followRegister(b)),
    followpersonquery: act((b) => f.followPersonQuery(b)),
    followportal: act((b) => f.followPortal(b)),
    permeetingbody: act((b) => f.perMeetingBody(b)),
    refreshregister: act((b) => f.refreshRegister(b)),
    follows: () => f.follows({ viewer: q("viewer"), now: q("now") }),
    snapshots: () => f.snapshots({ follow: q("follow"), at: q("at"), viewer: q("viewer") }),
    snapshotdiff: () => f.snapshotDiff({ follow: q("follow"), from: q("from"), to: q("to"), viewer: q("viewer") }),
  };
}
