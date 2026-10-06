/* lines (layer 5; T33-27, K1441, K1443, K1453, K1455, K1470): the dated, cited, graded lines between registered
   entities (`build/requirements/lines.md`). The structure of bodies and offices, who held each post and in what
   capacity, people's memberships, schooling, credentials, interests and ties, and the parties and links of
   proceedings. A line is a claim about the world: its assertion and each end's resolution are graded apart and never
   combined. It answers the structure and the holder of an office as of a date, `undetermined` where the record does
   not settle it, and is the one home of `holderAt`. It holds no amount (money given is a money fact) and walks no
   chain (that is `explore`'s).

   Reached through `linesOf(ctx)` (K61). Acts and reads: `recordLine` (R1–R5), the bound cache (R6, R7),
   `withdrawLine`, `readLine`, `linesOf` (R8, R9), `structureAt` (R10), `holderAt` (R11, R12), `partiesOf` and
   `proceedingLinks` (R13), the connection owner's `neighbours` (R14), the vocabularies (R15), the ops map (R16), the
   read contract (R17, `schema.mjs`), the store gate (R18), sight and the table classes (R19), and no conclusion drawn
   (R20). `entities` and `events` are the services this module reads its ends and its event bounds through. */
import { recordOf } from "../record-core/index.mjs";
import { viewerPredicate } from "../membership/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { canonicalExtent, checkContentExtent } from "../content/index.mjs";
import { noSuchEntity, noEntity } from "../entities/index.mjs";
import { isHypothesisId, isMachineIdentity, ISO_TS_RE } from "../record-grammar/index.mjs";
import { validAt, bounds as dtBounds, compare } from "../civil-time/index.mjs";
import { defaultRegistry, BOUNDS } from "../connection-grammar/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { LINES_SCHEMA, LINES_TABLES } from "./schema.mjs";
import { LINE_KINDS, STRUCTURE_KINDS, PEOPLE_KINDS, PROCEEDING_KINDS, CAPACITIES, ROLES, END_KINDS, OWNER,
         CONNECTION_KINDS, connectionKind, lineKindOf, PARTY_ROLES, OCDS_PARTY_ROLES } from "./vocab.mjs";

export { LINE_KINDS, STRUCTURE_KINDS, PEOPLE_KINDS, PROCEEDING_KINDS, CAPACITIES, ROLES, PARTY_ROLES, OCDS_PARTY_ROLES,
         CONNECTION_KINDS, LINES_SCHEMA, LINES_TABLES };

/* R9: `linesOf`'s bound. */
export const LINES_LIMIT_DEFAULT = 100;
export const LINES_LIMIT_MAX = 500;
/* R10, R13: a structure or party read is bounded at the connection fan-out, `truncated` measured by reading one past. */
export const STRUCTURE_LIMIT = BOUNDS.fanout;
/* R8: a withdrawal's reason, at most. */
export const REASON_MAX = 2000;
/* R1: a testimony's statement, at most. */
export const STATEMENT_MAX = 4000;
/* R4: a profile entry backs a line with no capture behind it: graded one rank below a fetched capture (reading J1 (4)). */
export const PROFILE_ASSERTION_GRADE = "C";
/* Testimony, and an end a member linked that the cited capture does not resolve, are graded D. */
export const TESTIMONY_GRADE = "D";
export const MACHINE_VIEWER = "class:admin";
const GRADES = ["A", "B", "C", "D"];
const PRECISIONS = ["day", "minute", "second", "edtf"];
const EDGES = ["start", "end"];
const PROCEEDING_LINKS = ["appeal_of", "consolidated_with", "remanded_to", "arises_from"];

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const filled = (v) => typeof v === "string" && v.trim() !== "";
const refuse = (reason, detail, extra = {}) => ({ ok: false, reason, code: reason, detail, ...extra });
const json = (v) => JSON.stringify(v);
const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };

/* ---- the vocabularies (R15) ---- */

/** R15: the closed kind list, frozen. */
export const kinds = () => LINE_KINDS;
/** R15: the closed capacity list (`holds` only), frozen. */
export const capacities = () => CAPACITIES;
/** R15: the closed role list of a kind, frozen; an empty list for a kind that takes none, null for no kind. */
export const roles = (kind) => (LINE_KINDS.includes(kind) ? ROLES[kind] ?? Object.freeze([]) : null);

const instances = new WeakMap();

/** K61: one instance per storage. `opts.entities` and `opts.events` are the services lines reads its ends and event
 *  bounds through; `opts.registry` the connection registry it registers into (the default the plane wires). */
export function linesOf(ctx, opts = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let l = instances.get(storage);
  if (!l) {
    const record = opts.record ?? recordOf(ctx);
    l = new Lines(storage, { ...opts, record,
                             provenance: opts.provenance ?? provenanceOf(ctx) });
    instances.set(storage, l);
  }
  return l;
}

export class Lines {
  #sql; #record; #provenance; #content; #entities; #events; #registry; #now;
  #migrated = false;

  constructor(storage, { record, provenance = null, content = null, entities = null, events = null,
                         registry = defaultRegistry, now = null } = {}) {
    this.#sql = storage.sql;
    this.#record = record;
    this.#provenance = provenance;
    this.#content = content;
    this.#entities = entities;
    this.#events = events;
    this.#registry = registry;
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* ---- boot (R6, R14, R18, R19) ---- */

  /** The tables, their declaration (R19), the store gate (R18), the one `onWhenChanged` registration (R6) and the one
   *  connection-owner registration (R14), at every boot, idempotent. A refusal of any registration is a defect of the
   *  wiring and throws. */
  migrate() {
    const bare = LINES_SCHEMA.split("\n").map((l) => l.replace(/--.*$/, "")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.#sql.exec(t); }
    if (this.#migrated) return { ok: true, already: true };
    const must = (what, r) => {
      if (r && (r.ok === false || r.refused)) throw new Error(`lines: ${what} refused: ${r.reason || r.refused} ${r.detail || r.why || ""}`);
    };
    must("declareTable", this.declareTables());
    must("registerStoreGate", this.#record.registerStoreGate(OWNER, "lines", (row) => Lines.gateCheck(row)));
    if (this.#events && typeof this.#events.onWhenChanged === "function")
      must("onWhenChanged", this.#events.onWhenChanged(OWNER, (change) => this.#whenChanged(change)));
    if (this.#registry && !(this.#registry.owners().some((o) => o.owner === OWNER)))
      must("registerOwner", this.#registry.registerOwner({ owner: OWNER, kinds: [...CONNECTION_KINDS],
                                                           neighbours: (a) => this.neighbours(a) }));
    this.#migrated = true;
    return { ok: true };
  }

  /** R19 (plan T33, Rules (6)): every table declared explicitly. The registry of lines is group-wide and cleared by
   *  the whole-store purge only; a line follows its source's sight; `line_bound_cache` is derived and rebuildable. */
  declareTables() {
    const base = { purge: "clear", expunge: "none", version_chain: false, keys: [] };
    return this.#record.declareTable(OWNER, [
      { ...base, name: "lines", export: "yes", sight: "source", derive: "stored" },
      { ...base, name: "line_withdrawals", export: "yes", sight: "source", derive: "stored" },
      { ...base, name: "line_bound_cache", export: "yes", sight: "source", derive: "derived-rebuildable",
        key: ["line_id"], rebuild: (scope) => this.#rebuildRows(scope) },
    ]);
  }

  /** R18: the one-home checks every write to `lines` passes inside its transaction: no amount, no total, no
   *  hypothesis id as an end or in the basis. Answers a refusal `{code}` or null. */
  static gateCheck(row) {
    if (!isObj(row)) return { code: "LINE_ROW_MALFORMED", detail: "a line row is an object" };
    const money = Object.keys(row).find((k) => /amount|currency|total|sum/i.test(k));
    if (money) return { code: "LINE_HOLDS_NO_AMOUNT", detail: `a line holds no amount (${money}): money given or received is a money fact` };
    const ids = [row.from_entity, row.to_entity];
    const basis = typeof row.basis_json === "string" ? parse(row.basis_json) : row.basis;
    const walk = (v) => { if (typeof v === "string") ids.push(v); else if (isObj(v)) Object.values(v).forEach(walk); else if (Array.isArray(v)) v.forEach(walk); };
    walk(basis);
    const hyp = ids.find((v) => isHypothesisId(v));
    if (hyp) return { code: "LINE_NO_HYPOTHESIS", detail: `${hyp} is a hypothesis: it is never an end or a basis of a line (K1467)` };
    return null;
  }

  /* ---- the jurisdiction view (R3) ---- */

  #zone() {
    try {
      const ids = this.#record.getSetting("jurisdiction_profiles");
      const c = combine(Array.isArray(ids) ? ids : []);
      const z = c && c.ok && c.view && c.view.time_zone ? c.view.time_zone.value : null;
      return filled(z) ? z : null;
    } catch { return null; }
  }

  /* ---- sight (R19; K1489) ---- */

  /* The viewer's gate over `lines l`: a machine or the founder sees every line, an absent or unknown viewer none, a
     member every group-wide line and a fenced one only where membership lets them see its bundle. */
  #gate(viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return { sql: "1=1", args: [] };
    if (g.scope === "DENY") return { sql: "0=1", args: [] };
    return { sql: `(l.sight_bundle IS NULL OR EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = l.sight_bundle AND (${g.sql})))`,
             args: g.args };
  }
  #visible(lineId, viewer) {
    const g = this.#gate(viewer);
    return this.#one(`SELECT l.* FROM lines l WHERE l.line_id = ? AND ${g.sql}`, lineId, ...g.args);
  }

  /* ---- ends (R1, R2, R4) ---- */

  #entityKind(id) {
    try {
      const r = this.#entities.readEntity({ entityId: id, viewer: MACHINE_VIEWER });
      return r && r.found ? r.entity.kind : null;
    } catch { return null; }
  }
  #byIdentifier(ident) {
    if (!isObj(ident) || !filled(ident.scheme) || !filled(ident.id) || typeof this.#entities.entityByIdentifier !== "function") return null;
    try {
      const r = this.#entities.entityByIdentifier({ scheme: ident.scheme, id: ident.id });
      if (typeof r === "string") return r;
      if (isObj(r)) return r.entity_id ?? (isObj(r.entity) ? r.entity.entity_id : null) ?? null;
      return null;
    } catch { return null; }
  }
  /* An end's resolution grade in a capture: its strongest resolution there, or null when it is not resolved there. */
  #resolutionIn(captureSha, entityId) {
    try {
      const r = this.#entities.resolutionsFor({ captureSha, limit: 5000, viewer: MACHINE_VIEWER });
      const gs = (r && Array.isArray(r.resolutions) ? r.resolutions : []).filter((x) => x.entity_id === entityId).map((x) => x.grade);
      return GRADES.find((g) => gs.includes(g)) ?? null;
    } catch { return null; }
  }

  /* ---- bounds (R3, R6) ---- */

  /* An event's `when`, read through `events` (its R26), as `{start, end, precision, zone}`; null when the event has no
     `when`, undefined when no such event is held. */
  #when(eventId) {
    if (!this.#events || typeof this.#events.readEvent !== "function") return undefined;
    let a;
    try { a = this.#events.readEvent({ eventId, viewer: MACHINE_VIEWER }); } catch { return undefined; }
    if (!a || a.ok === false || a.found === false) return undefined;
    const ev = isObj(a.event) ? a.event : a;
    const w = ev.when;
    return isObj(w) && !w.undetermined && (w.start != null || w.end != null) ? w : null;
  }

  /* R3: a bound as given, read into `null`, a value string at the validity's precision, or `{event, edge}`; or a
     refusal. */
  #bound(b, side, precision, zone) {
    if (b === undefined || b === null) return { b: null };
    if (typeof b === "string") return this.#value(b, side, precision, zone);
    if (!isObj(b)) return { refusal: refuse("BAD_DATE", `the validity's ${side} is a date-time value, an event bound or null`) };
    const hasValue = b.value !== undefined && b.value !== null;
    const hasEvent = b.event !== undefined && b.event !== null;
    if (hasValue && hasEvent) return { refusal: refuse("BOUND_BOTH", `the validity's ${side} gives both a value and an event; a bound is one or the other` , { side }) };
    if (hasValue) return typeof b.value === "string" ? this.#value(b.value, side, precision, zone)
      : { refusal: refuse("BAD_DATE", `the validity's ${side} value is a string`, { side }) };
    if (hasEvent) {
      if (!filled(b.event) || this.#when(b.event) === undefined)
        return { refusal: refuse("NO_SUCH_EVENT", `the validity's ${side} names an event the record does not hold`, { side, event: b.event ?? null }) };
      if (!EDGES.includes(b.edge))
        return { refusal: refuse("BAD_EDGE", `an event bound names the edge start or end of the event's when`, { side }) };
      return { b: { event: b.event, edge: b.edge } };
    }
    return { b: null };
  }
  #value(v, side, precision, zone) {
    let r;
    try { r = dtBounds({ value: v, precision, zone }); } catch (e) { r = { refused: "DATE_INVALID", why: String(e.message || e) }; }
    if (r.refused) return { refusal: refuse("BAD_DATE", `the validity's ${side} ${v} is not a ${precision}-precision date-time in ${zone}: ${r.why}`, { side }) };
    return { b: v };
  }

  /* R6: a bound's resolved value: a value as given; an event bound as that event's `when` edge (`override` stands in
     for one event's `when` while it changes); null ("not stated") when the event has no `when`. */
  #resolve(b, valid, override) {
    if (b === null) return { v: null, p: null, z: null };
    if (typeof b === "string") return { v: b, p: valid.precision, z: valid.zone };
    const w = override && override.eventId === b.event ? override.after : this.#when(b.event);
    if (!isObj(w)) return { v: null, p: null, z: null };
    const v = b.edge === "start" ? w.start : w.end;
    if (v === null || v === undefined) return { v: null, p: null, z: null };
    return { v: String(v), p: PRECISIONS.includes(w.precision) ? w.precision : valid.precision, z: filled(w.zone) ? w.zone : valid.zone };
  }
  #cacheRow(lineId, valid, override = null) {
    const f = this.#resolve(valid.from, valid, override), t = this.#resolve(valid.to, valid, override);
    return { line_id: lineId, from_instant: f.v, to_instant: t.v, precision: valid.precision, zone: valid.zone,
             from_precision: f.p, to_precision: t.p, from_zone: f.z, to_zone: t.z };
  }
  #writeCache(row) {
    const cols = Object.keys(row);
    this.#sql.exec(`INSERT OR REPLACE INTO line_bound_cache (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
                   ...cols.map((c) => row[c]));
  }
  /* R77's rebuild, for `rebuildAndCompare` and `rebuildDerived`. */
  #rebuildRows(scope) {
    const rows = scope && filled(scope.line_id)
      ? this.#rows(`SELECT line_id, valid_json FROM lines WHERE line_id = ?`, scope.line_id)
      : this.#rows(`SELECT line_id, valid_json FROM lines`);
    return rows.map((r) => this.#cacheRow(r.line_id, parse(r.valid_json)));
  }

  /* R6: `events` tells this module, inside the transaction that moves an event's `when`, so every line bounded by it
     moves its cache in that transaction. A throw fails the write (events R15). */
  #whenChanged(change) {
    const eventId = isObj(change) ? change.eventId : null;
    if (!filled(eventId)) return;
    const override = { eventId, after: isObj(change.after) ? change.after : null };
    for (const r of this.#rows(`SELECT line_id, valid_json FROM lines WHERE from_event = ? OR to_event = ?`, eventId, eventId))
      this.#writeCache(this.#cacheRow(r.line_id, parse(r.valid_json), override));
  }

  /* R7: the held cache, and whether it equals its rebuild. A missing, marked or differing row is stale. */
  #cacheOf(line) {
    const held = this.#one(`SELECT * FROM line_bound_cache WHERE line_id = ?`, line.line_id);
    let marked = false;
    try { marked = this.#record.readDerived(OWNER, "line_bound_cache", line.line_id).stale === true && !!held; } catch { marked = true; }
    const rebuilt = this.#cacheRow(line.line_id, parse(line.valid_json));
    const same = !!held && Object.keys(rebuilt).every((k) => (held[k] ?? null) === (rebuilt[k] ?? null));
    return { held, stale: !held || marked || !same };
  }

  /* The validity a line is judged by: its stated values, and each event bound with the cached edge as its `at`. */
  #validFor(line, cache) {
    const valid = parse(line.valid_json);
    const side = (b, which) => {
      if (b === null || typeof b === "string") return b;
      const v = cache.held ? cache.held[`${which}_instant`] : null;
      return v === null || v === undefined || cache.stale ? { event: b.event, edge: b.edge }
        : { event: b.event, edge: b.edge, at: { value: v, precision: cache.held[`${which}_precision`], zone: cache.held[`${which}_zone`] } };
    };
    return { from: side(valid.from, "from"), to: side(valid.to, "to"), precision: valid.precision, zone: valid.zone };
  }

  /* R10's rule: `in`, `out` or `{undetermined: why}` at `at`. A stale cache is undetermined, "cache stale" (R7). A day
     string is read as that day in the line's own zone. */
  #judge(line, at) {
    const cache = this.#cacheOf(line);
    if (cache.stale) return { state: "undetermined", why: "cache stale" };
    const valid = this.#validFor(line, cache);
    const date = typeof at === "string" && /^\d{4}-\d{2}-\d{2}$/.test(at) ? { value: at, precision: "day", zone: valid.zone } : at;
    let r;
    try { r = validAt({ valid, basis: null }, date); } catch (e) { r = { undetermined: true, why: String(e.message || e) }; }
    if (r === "in" || r === "out") return { state: r };
    return { state: "undetermined", why: r.why || `the date could not be read: ${r.refused}` };
  }
  static #atRefusal(at) {
    if (at === undefined || at === null || at === "") return refuse("NO_DATE", "a read as of a date names the date (`at`)");
    if (typeof at === "string" && (ISO_TS_RE.test(at) || /^\d{4}-\d{2}-\d{2}$/.test(at))) return null;
    if (isObj(at) && typeof at.value === "string") return null;
    return refuse("BAD_DATE", "`at` is a day (YYYY-MM-DD), an instant (YYYY-MM-DDTHH:MM:SSZ) or a date-time {value, precision, zone}");
  }

  /* ---- basis (R1, R4, R5, R19) ---- */

  #captureHeld(sha, viewer) {
    if (!/^[0-9a-f]{64}$/.test(sha)) return null;
    const home = this.#provenance.homeOf(sha);
    if (!home) return null;
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return home;
    if (g.scope === "DENY") return null;
    return this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id = ? AND (${g.sql})`, home.bundleId, ...g.args) ? home : null;
  }
  #captureGrade(sha) {
    try { const g = this.#provenance.captureGrade(sha); return g && GRADES.includes(g.grade) ? g.grade : TESTIMONY_GRADE; }
    catch { return TESTIMONY_GRADE; }
  }

  /* A basis read into its form, or a refusal. `by` is the viewer the cited capture is checked against. */
  #basis(basis, by) {
    if (!isObj(basis)) return { refusal: refuse("NO_BASIS", "a line rests on a passage {captureSha, extent}, a system rule {rule, source} or a member's testimony {statement}") };
    if ("captureSha" in basis || "extent" in basis) {
      const sha = typeof basis.captureSha === "string" ? basis.captureSha.trim().toLowerCase() : "";
      if (!sha) return { refusal: refuse("NO_SHA", "a passage names its capture by its sha256") };
      const home = this.#captureHeld(sha, by);
      if (!home) return { refusal: refuse("CAPTURE_NOT_HELD", "the record holds no such capture, or it may not be seen") };
      if (!isObj(basis.extent)) return { refusal: refuse("NO_EXTENT", "a passage names the part of the capture it cites (an extent)") };
      let bad = null;
      try {
        canonicalExtent(basis.extent);
        const ctx = this.#content && typeof this.#content.contentContextFor === "function" ? this.#content.contentContextFor(sha) : {};
        bad = checkContentExtent(basis.extent, ctx);
      } catch (e) { bad = { reason: "CONTENT_EXTENT_UNREADABLE", detail: String(e.message || e) }; }
      if (bad) return { refusal: refuse("EXTENT_NOT_IN_CAPTURE", `the extent is not a part of that capture: ${bad.detail || bad.reason || bad.code}`, { extent_refusal: bad.reason || bad.code || null }) };
      return { form: "passage", basis: { captureSha: sha, extent: basis.extent }, captureSha: sha, sight: home.bundleId,
               assertion: this.#captureGrade(sha) };
    }
    if ("rule" in basis || "source" in basis) {
      if (!filled(basis.rule)) return { refusal: refuse("NO_BASIS", "a system rule names the rule it applies") };
      const ids = isObj(basis.ids) ? { from: basis.ids.from ?? null, to: basis.ids.to ?? null } : null;
      const recordedAt = basis.recorded_at ?? null;
      if (recordedAt !== null && !(typeof recordedAt === "string" && ISO_TS_RE.test(recordedAt)))
        return { refusal: refuse("NO_BASIS", "a register row's own record instant is an instant (YYYY-MM-DDTHH:MM:SSZ)") };
      const system = filled(basis.system) ? basis.system.trim() : null;
      if (typeof basis.source === "string") {
        const sha = basis.source.trim().toLowerCase();
        const home = this.#captureHeld(sha, by);
        if (!home) return { refusal: refuse("CAPTURE_NOT_HELD", "the system rule's source is a capture the record does not hold, or it may not be seen") };
        if (system && !recordedAt) return { refusal: refuse("NO_BASIS", `a ${system} register row states its own record instant (recorded_at)`) };
        return { form: "rule", basis: { rule: basis.rule.trim(), source: sha, ...(ids ? { ids } : {}), ...(system ? { system } : {}),
                                        ...(recordedAt ? { recorded_at: recordedAt } : {}), ...(basis.row !== undefined ? { row: basis.row } : {}) },
                 captureSha: sha, sight: home.bundleId, assertion: this.#captureGrade(sha), recordedAt };
      }
      if (isObj(basis.source) && filled(basis.source.profile) && basis.source.entry !== undefined)
        return { form: "rule", basis: { rule: basis.rule.trim(), source: { profile: basis.source.profile, entry: basis.source.entry },
                                        ...(ids ? { ids } : {}) },
                 captureSha: null, sight: null, assertion: PROFILE_ASSERTION_GRADE, recordedAt: null };
      return { refusal: refuse("NO_BASIS", "a system rule's source is a held capture or a profile entry {profile, entry}") };
    }
    if ("statement" in basis) {
      if (!filled(basis.statement)) return { refusal: refuse("NO_STATEMENT", "a member's testimony states what they know, in their own words") };
      let sight = null;
      if (basis.project !== undefined && basis.project !== null) {
        const p = this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id = ? AND object_type = 'project'`, String(basis.project));
        if (!p) return { refusal: refuse("NO_BASIS", "testimony inside a project names a project the record holds") };
        sight = p.bundle_id;
      }
      return { form: "testimony", basis: { statement: basis.statement.trim().slice(0, STATEMENT_MAX), ...(sight ? { project: sight } : {}) },
               captureSha: null, sight, assertion: TESTIMONY_GRADE };
    }
    return { refusal: refuse("NO_BASIS", "a line rests on a passage {captureSha, extent}, a system rule {rule, source} or a member's testimony {statement}") };
  }

  /* ---- recordLine (R1–R5) ---- */

  recordLine({ kind, from, to, role, capacity, valid, basis, by } = {}) {
    const k = typeof kind === "string" ? kind.trim() : "";
    if (!LINE_KINDS.includes(k))
      return refuse("UNKNOWN_LINE_KIND", `a line's kind is one of ${LINE_KINDS.join(", ")}; money given or received is a money fact, never a line`,
                    { kinds: [...LINE_KINDS] });
    if (!filled(from) || !filled(to)) return refuse("NO_ENDS", "a line names both its ends (from and to), each a registered entity");
    if (from === to) return refuse("SELF_LINE", "a line runs between two different entities");
    for (const [end, id] of [["from", from], ["to", to]])
      if (!this.#entities.has(id)) return noSuchEntity(id, { end });
    const fk = this.#entityKind(from), tk = this.#entityKind(to);
    const ek = END_KINDS[k];
    if (ek && ((ek.from && !ek.from.includes(fk)) || (ek.to && !ek.to.includes(tk))))
      return refuse(ek.code, `${k} runs from ${ek.from ? `an entity of kind ${ek.from.join(" or ")}` : "any registered entity"} to one of kind ${ek.to.join(" or ")}`,
                    { from_kind: fk, to_kind: tk });
    if (k === "holds" && fk !== "person")
      return refuse("HOLDER_NOT_A_PERSON", "a post is held by a person entity, the same entity across every role it has held (K1452)", { from_kind: fk });
    const allowed = ROLES[k];
    if (role !== undefined && role !== null && role !== "" && (!allowed || !allowed.includes(role)))
      return refuse("BAD_ROLE", allowed ? `${k} takes a role of ${allowed.join(", ")}` : `${k} takes no role`, { roles: allowed ? [...allowed] : [] });
    if (k === "holds") {
      if (!filled(capacity)) return refuse("NO_CAPACITY", `a post is held in a capacity: ${CAPACITIES.join(", ")}`);
      if (!CAPACITIES.includes(capacity)) return refuse("UNKNOWN_CAPACITY", `a capacity is one of ${CAPACITIES.join(", ")}`, { capacities: [...CAPACITIES] });
    } else if (capacity !== undefined && capacity !== null && capacity !== "")
      return refuse("BAD_CAPACITY", "only a holds line carries a capacity");
    const b = this.#basis(basis, by);
    if (b.refusal) return b.refusal;
    /* R3 */
    const v = isObj(valid) ? valid : {};
    const precision = v.precision === undefined || v.precision === null ? "day" : v.precision;
    if (!PRECISIONS.includes(precision)) return refuse("BAD_DATE", `a validity's precision is one of ${PRECISIONS.join(", ")}`);
    const zone = filled(v.zone) ? v.zone : this.#zone();
    const vf = this.#bound(v.from, "from", precision, zone ?? "UTC");
    if (vf.refusal) return vf.refusal;
    const vt = this.#bound(v.to, "to", precision, zone ?? "UTC");
    if (vt.refusal) return vt.refusal;
    if (!zone) return refuse("BAD_DATE", "a validity carries its zone, and no zone is stated and the active profiles give none");
    const norm = { from: vf.b, to: vt.b, precision, zone };
    const probe = this.#cacheRow("probe", norm);
    if (probe.from_instant !== null && probe.to_instant !== null) {
      let c;
      try {
        c = compare({ value: probe.from_instant, precision: probe.from_precision, zone: probe.from_zone },
                    { value: probe.to_instant, precision: probe.to_precision, zone: probe.to_zone });
      } catch { c = null; }
      if (c === "after") return refuse("BOUNDS_REVERSED", "the validity's from is after its to");
    }
    /* R4: a machine records a line only from a system rule whose two ends its scheme identifiers name. */
    const machine = isMachineIdentity(by);
    const idFrom = b.form === "rule" && b.basis.ids ? this.#byIdentifier(b.basis.ids.from) : null;
    const idTo = b.form === "rule" && b.basis.ids ? this.#byIdentifier(b.basis.ids.to) : null;
    if (machine && !(b.form === "rule" && idFrom === from && idTo === to))
      return refuse("MACHINE_NEEDS_IDENTIFIERS", "the machine records a line only from a system rule whose two ends are identified by scheme identifiers; a line from a name match is a member's act (K1443)");
    if (!filled(by)) return refuse("NO_BY", "a line is recorded by the act's stamped author");
    /* The ends' grades: A by a scheme identifier; the cited capture's resolution; D for testimony or an end the cited
       capture does not resolve (reading J1 (4)). */
    const endGrade = (id, byId) => {
      if (byId === id) return "A";
      if (b.form === "testimony" || !b.captureSha) return TESTIMONY_GRADE;
      return this.#resolutionIn(b.captureSha, id) ?? TESTIMONY_GRADE;
    };
    const ends = { from: endGrade(from, idFrom), to: endGrade(to, idTo) };
    const at = this.#now();
    const row = { kind: k, from_entity: from, to_entity: to, role: filled(role) ? role : null, capacity: k === "holds" ? capacity : null,
                  valid_json: json(norm), from_event: isObj(norm.from) ? norm.from.event : null, to_event: isObj(norm.to) ? norm.to.event : null,
                  basis_form: b.form, basis_json: json(b.basis), capture_sha: b.captureSha, sight_bundle: b.sight,
                  recorded_at: b.recordedAt ?? null, asserted_by: by, assertion: b.assertion, end_from: ends.from, end_to: ends.to, at };
    return this.#record.transact(() => {
      const gate = this.#record.storeGate(OWNER, "lines", row, "insert");
      if (gate) return { ...gate, ok: false };
      const id = this.#record.allocId("LIN", at.slice(0, 4));
      if (!id || !id.id) return id;
      const full = { line_id: id.id, ...row };
      const cols = Object.keys(full);
      this.#sql.exec(`INSERT INTO lines (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`, ...cols.map((c) => full[c]));
      this.#writeCache(this.#cacheRow(id.id, norm));
      return { ok: true, line_id: id.id, kind: k, from, to, assertion: b.assertion, ends, at };
    });
  }

  /* ---- withdrawLine, readLine, linesOf (R8, R9) ---- */

  withdrawLine({ lineId, reason, by } = {}) {
    if (!filled(reason)) return refuse("NO_REASON", "a withdrawal says why, in the member's own words");
    const line = filled(lineId) ? this.#one(`SELECT line_id, withdrawn FROM lines WHERE line_id = ?`, lineId) : null;
    if (!line) return refuse("NO_SUCH_LINE", "no line with that id is held", { line_id: lineId ?? null });
    if (!filled(by)) return refuse("NO_BY", "a withdrawal is made by the act's stamped author");
    const held = this.#one(`SELECT * FROM line_withdrawals WHERE line_id = ?`, lineId);
    if (held) return { ok: true, already: true, line_id: lineId, withdrawn: { by: held.by_actor, at: held.at, reason: held.reason } };
    const at = this.#now();
    return this.#record.transact(() => {
      this.#sql.exec(`INSERT INTO line_withdrawals (line_id, reason, by_actor, at) VALUES (?,?,?,?)`, lineId, reason.trim().slice(0, REASON_MAX), by, at);
      this.#sql.exec(`UPDATE lines SET withdrawn = 1 WHERE line_id = ?`, lineId);
      return { ok: true, line_id: lineId, withdrawn: { by, at, reason: reason.trim().slice(0, REASON_MAX) } };
    });
  }

  /* R5: a register row's bounds are the source's account, labelled with its own record instant. */
  static #recordedLabel(basis, recordedAt) {
    return basis && filled(basis.system) && recordedAt ? `as recorded by ${basis.system} on ${recordedAt}` : null;
  }

  /* A line as every read answers it: its fields, basis and citation, both grade axes, its bounds as given and as
     cached, its withdrawal. A stale cache answers `valid` undetermined, "cache stale" (R7). */
  #view(line) {
    const cache = this.#cacheOf(line);
    const given = parse(line.valid_json);
    const basis = parse(line.basis_json);
    const w = line.withdrawn ? this.#one(`SELECT reason, by_actor, at FROM line_withdrawals WHERE line_id = ?`, line.line_id) : null;
    const label = Lines.#recordedLabel(basis, line.recorded_at);
    return {
      line_id: line.line_id, kind: line.kind, from: line.from_entity, to: line.to_entity, role: line.role ?? null,
      capacity: line.capacity ?? null,
      valid: cache.stale ? { undetermined: true, why: "cache stale" } : this.#validFor(line, cache),
      bounds: { given, cached: cache.held ? { from: cache.held.from_instant ?? null, to: cache.held.to_instant ?? null,
                                              from_precision: cache.held.from_precision ?? null, to_precision: cache.held.to_precision ?? null,
                                              zone: cache.held.zone ?? null } : null,
                ...(label ? { label } : {}) },
      basis: { form: line.basis_form, ...basis }, citation: Lines.#citation(line.basis_form, basis),
      ...(label ? { recorded: label, recorded_at: line.recorded_at } : {}),
      asserted_by: line.asserted_by, assertion: line.assertion, ends: { from: line.end_from, to: line.end_to }, at: line.at,
      withdrawn: w ? { by: w.by_actor, at: w.at, reason: w.reason } : null,
    };
  }
  static #citation(form, basis) {
    if (form === "passage") return `capture ${basis.captureSha}`;
    if (form === "rule") return typeof basis.source === "string" ? `${basis.rule}, capture ${basis.source}`
      : `${basis.rule}, profile ${basis.source.profile}`;
    return "a member's testimony";
  }

  readLine({ lineId, viewer } = {}) {
    if (!filled(lineId)) return refuse("NO_LINE", "a line is read by its id (LIN-...)");
    const line = this.#visible(lineId, viewer);
    if (!line) return { ok: true, found: false, line_id: lineId };
    return { ok: true, found: true, line: this.#view(line) };
  }

  linesOf({ entity, kinds: ks, direction = "both", limit, viewer } = {}) {
    if (!filled(entity)) return noEntity("lines are read for one registered entity, named by its id");
    const kk = Lines.#kindList(ks, LINE_KINDS);
    if (kk.refusal) return kk.refusal;
    const dir = direction ?? "both";
    if (!["from", "to", "both"].includes(dir)) return refuse("BAD_DIRECTION", "direction is from, to or both");
    const n = Number(limit);
    const cap = Number.isFinite(n) && n >= 1 ? Math.min(Math.floor(n), LINES_LIMIT_MAX) : LINES_LIMIT_DEFAULT;
    const g = this.#gate(viewer);
    const end = dir === "from" ? "l.from_entity = ?" : dir === "to" ? "l.to_entity = ?" : "(l.from_entity = ? OR l.to_entity = ?)";
    const endArgs = dir === "both" ? [entity, entity] : [entity];
    const rows = this.#rows(`SELECT l.* FROM lines l WHERE ${end} AND l.kind IN (${kk.list.map(() => "?").join(",")}) AND ${g.sql}
                              ORDER BY l.at, l.line_id LIMIT ?`, ...endArgs, ...kk.list, ...g.args, cap + 1);
    const truncated = rows.length > cap;
    const page = truncated ? rows.slice(0, cap) : rows;
    return { ok: true, entity, direction: dir, count: page.length, limit: cap, truncated, lines: page.map((r) => this.#view(r)) };
  }

  static #kindList(ks, within) {
    if (ks === undefined || ks === null || ks === "") return { list: [...within] };
    const list = Array.isArray(ks) ? ks : String(ks).split(",").map((s) => s.trim()).filter(Boolean);
    const bad = list.find((k) => !within.includes(k));
    if (bad !== undefined) return { refusal: refuse("UNKNOWN_LINE_KIND", `${bad} is not one of ${within.join(", ")}`, { kinds: [...within] }) };
    return { list };
  }

  /* The live lines at `entity` of `kinds`, visible to `viewer`, bounded, with `truncated` by reading one past. */
  #liveAt(sqlEnd, endArgs, kindList, viewer) {
    const g = this.#gate(viewer);
    const rows = this.#rows(`SELECT l.* FROM lines l WHERE ${sqlEnd} AND l.withdrawn = 0 AND l.kind IN (${kindList.map(() => "?").join(",")})
                              AND ${g.sql} ORDER BY l.at, l.line_id LIMIT ?`, ...endArgs, ...kindList, ...g.args, STRUCTURE_LIMIT + 1);
    return { rows: rows.slice(0, STRUCTURE_LIMIT), truncated: rows.length > STRUCTURE_LIMIT };
  }

  /* ---- structureAt (R10) ---- */

  structureAt({ entity, at, kinds: ks, viewer } = {}) {
    if (!filled(entity)) return noEntity("the structure is read around one registered entity, named by its id");
    const bad = Lines.#atRefusal(at);
    if (bad) return bad;
    const kk = Lines.#kindList(ks, STRUCTURE_KINDS);
    if (kk.refusal) return kk.refusal;
    const { rows, truncated } = this.#liveAt("(l.from_entity = ? OR l.to_entity = ?)", [entity, entity], kk.list, viewer);
    const held = [], undetermined = [];
    for (const r of rows) {
      const j = this.#judge(r, at);
      if (j.state === "in") held.push(this.#view(r));
      else if (j.state === "undetermined") undetermined.push({ line: this.#view(r), why: j.why });
    }
    return { ok: true, entity, at, held, undetermined, truncated };
  }

  /* ---- holderAt (R11, R12): the one home ---- */

  holderAt({ office, at, viewer } = {}) {
    if (!filled(office)) return noEntity("a holder is asked of one office, named by its entity id");
    if (!this.#entities.has(office)) return noSuchEntity(office);
    if (this.#entityKind(office) !== "office")
      return refuse("NOT_AN_OFFICE", "a holder is asked of an entity of kind office; a line to an organisation is a career, never a holder");
    const bad = Lines.#atRefusal(at);
    if (bad) return bad;
    const { rows, truncated } = this.#liveAt("l.to_entity = ?", [office], ["holds"], viewer);
    const inn = [], und = [];
    for (const r of rows) {
      const j = this.#judge(r, at);
      if (j.state === "in") inn.push(r);
      else if (j.state === "undetermined") und.push({ line_id: r.line_id, why: j.why });
    }
    if (inn.length === 1 && und.length === 0 && !truncated) {
      const v = this.#view(inn[0]);
      return { ok: true, office, at, holder: inn[0].from_entity, line: v, capacity: v.capacity, basis: v.basis,
               assertion: v.assertion, ends: v.ends };
    }
    if (inn.length === 0 && und.length === 0 && !truncated)
      return { ok: true, office, at, holder: null, undetermined: "no line covers the date", lines: [] };
    const why = inn.length > 1 ? `${inn.length} lines hold the post at the date` : truncated ? "more lines than one read holds name this office"
      : "a line naming this office may cover the date, and the record does not settle it";
    return { ok: true, office, at, holder: null, undetermined: why,
             lines: [...inn.map((r) => ({ line_id: r.line_id, state: "in" })), ...und.map((u) => ({ ...u, state: "undetermined" }))] };
  }

  /* ---- partiesOf, proceedingLinks (R13) ---- */

  #proceeding(id, what) {
    if (!filled(id)) return noEntity(`${what} is asked of one proceeding, named by its entity id`);
    if (!this.#entities.has(id)) return noSuchEntity(id);
    if (this.#entityKind(id) !== "proceeding") return refuse("NOT_A_PROCEEDING", "this read is asked of an entity of kind proceeding");
    return null;
  }

  partiesOf({ proceeding, at, viewer } = {}) {
    const bad = this.#proceeding(proceeding, "the parties");
    if (bad) return bad;
    if (at !== undefined && at !== null && at !== "") { const b = Lines.#atRefusal(at); if (b) return b; }
    const { rows, truncated } = this.#liveAt("l.to_entity = ?", [proceeding], ["party_to"], viewer);
    const party = (r) => ({ party: r.from_entity, role: r.role ?? null, line: this.#view(r) });
    if (at === undefined || at === null || at === "") return { ok: true, proceeding, parties: rows.map(party), truncated };
    const parties = [], undetermined = [];
    for (const r of rows) {
      const j = this.#judge(r, at);
      if (j.state === "in") parties.push(party(r));
      else if (j.state === "undetermined") undetermined.push({ ...party(r), why: j.why });
    }
    return { ok: true, proceeding, at, parties, undetermined, truncated };
  }

  proceedingLinks({ proceeding, viewer } = {}) {
    const bad = this.#proceeding(proceeding, "a proceeding's links");
    if (bad) return bad;
    const { rows, truncated } = this.#liveAt("(l.from_entity = ? OR l.to_entity = ?)", [proceeding, proceeding], PROCEEDING_LINKS, viewer);
    return { ok: true, proceeding, truncated,
             links: rows.map((r) => ({ kind: r.kind, direction: r.from_entity === proceeding ? "out" : "in",
                                       other: r.from_entity === proceeding ? r.to_entity : r.from_entity, line: this.#view(r) })) };
  }

  /* ---- neighbours (R14): the connection owner ---- */

  /* One line as a connection in `connection-grammar`'s shape, both grade axes kept. */
  #connection(r, cache) {
    const basis = parse(r.basis_json);
    const evidence = r.basis_form === "passage" ? [{ source: `capture:${basis.captureSha}`, extent: basis.extent }]
      : r.basis_form === "rule" ? [{ source: typeof basis.source === "string" ? `capture:${basis.source}` : `profile:${basis.source.profile}`, rule: basis.rule,
                                     ...(Lines.#recordedLabel(basis, r.recorded_at) ? { label: Lines.#recordedLabel(basis, r.recorded_at) } : {}) }]
      : [{ source: "testimony", by: r.asserted_by }];
    return { id: r.line_id, from: r.from_entity, to: r.to_entity, kind: connectionKind(r.kind, r.capacity), owner: OWNER,
             valid: this.#validFor(r, cache), evidence, grade: { assertion: r.assertion, ends: [r.end_from, r.end_to] }, derived: null,
             ...(r.role ? { role: r.role } : {}) };
  }

  neighbours({ node, kinds: ks, at, page, viewer, scope } = {}) {
    void scope; /* no hunch kind is this owner's: scope changes nothing here (connection-grammar R8) */
    if (viewer === undefined || viewer === null || viewer === "")
      return { refused: "VIEWER_MISSING", why: "a read names the member reading; an absent viewer is neither an administrator nor the public" };
    if (!filled(node)) return { items: [] };
    const asked = Array.isArray(ks) ? ks : CONNECTION_KINDS.map((k) => k.kind);
    const pairs = asked.map(lineKindOf).filter(Boolean);
    if (!pairs.length) return { items: [] };
    const g = this.#gate(viewer);
    const kindSql = pairs.map((p) => (p.capacity ? "(l.kind = ? AND l.capacity = ?)" : "l.kind = ?")).join(" OR ");
    const kindArgs = pairs.flatMap((p) => (p.capacity ? [p.kind, p.capacity] : [p.kind]));
    /* Both ends are indexed (`lines_from`, `lines_to`): one bounded read per end, joined. */
    const where = `l.withdrawn = 0 AND (${kindSql}) AND ${g.sql}`;
    const size = Number(this.#one(`SELECT (SELECT COUNT(*) FROM lines l WHERE l.from_entity = ? AND ${where})
                                        + (SELECT COUNT(*) FROM lines l WHERE l.to_entity = ? AND ${where}) AS n`,
                                  node, ...kindArgs, ...g.args, node, ...kindArgs, ...g.args).n);
    if (size > BOUNDS.hub)
      return { items: [], hub: { set_size: size, why: `this entity has more than ${BOUNDS.hub} lines of the kinds asked, so it is named, never expanded` } };
    const after = isObj(page) && filled(page.after) ? page.after : "";
    const per = isObj(page) && Number.isInteger(page.size) && page.size >= 1 ? Math.min(page.size, BOUNDS.fanout) : BOUNDS.fanout;
    const rows = this.#rows(`SELECT * FROM (SELECT l.* FROM lines l WHERE l.from_entity = ? AND ${where}
                                           UNION SELECT l.* FROM lines l WHERE l.to_entity = ? AND ${where})
                             WHERE line_id > ? ORDER BY line_id`, node, ...kindArgs, ...g.args, node, ...kindArgs, ...g.args, after);
    const items = [];
    let next = null;
    for (const r of rows) {
      const cache = this.#cacheOf(r);
      const c = this.#connection(r, cache);
      let v;
      try { v = validAt({ valid: c.valid, basis: null }, at); } catch (e) { v = { undetermined: true, why: String(e.message || e) }; }
      if (v === "out") continue;
      if (v !== "in") c.undetermined = { why: cache.stale ? "cache stale" : v.why || `the date could not be read: ${v.refused}` };
      if (items.length === per) { next = { after: items[items.length - 1].id, size: per }; break; }
      items.push(c);
    }
    return { items, ...(next ? { next } : {}) };
  }

  /* ---- the vocabularies (R15) ---- */

  kinds() { return kinds(); }
  capacities() { return capacities(); }
  roles(kind) { return roles(kind); }
}

/* ---- the ops map (R16) ---- */

/** R16: this module's route arms, keyed by op name, each a function of no arguments answering what its service
 *  answers: a read's parameters from `url`'s query (the control plane's `viewer` stamp among them), an act's arguments
 *  from the body, whose `by` is the control plane's stamp. One append site per act. */
export function linesOps(lines, url, body) {
  const q = (k) => url.searchParams.get(k);
  const list = (k) => (q(k) ? q(k).split(",").map((s) => s.trim()).filter(Boolean) : undefined);
  return {
    linerecord: () => lines.recordLine(body || {}),
    linewithdraw: () => lines.withdrawLine(body || {}),
    line: () => lines.readLine({ lineId: q("id"), viewer: q("viewer") }),
    linesof: () => lines.linesOf({ entity: q("entity"), kinds: list("kinds"), direction: q("direction") || "both",
                                   limit: q("limit"), viewer: q("viewer") }),
    structureat: () => lines.structureAt({ entity: q("entity"), at: q("at"), kinds: list("kinds"), viewer: q("viewer") }),
    holderat: () => lines.holderAt({ office: q("office"), at: q("at"), viewer: q("viewer") }),
    partiesof: () => lines.partiesOf({ proceeding: q("proceeding"), at: q("at") || undefined, viewer: q("viewer") }),
    proceedinglinks: () => lines.proceedingLinks({ proceeding: q("proceeding"), viewer: q("viewer") }),
  };
}

