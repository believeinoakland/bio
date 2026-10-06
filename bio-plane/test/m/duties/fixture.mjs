/* duties over the modules it uses. Real: record-core, membership, civil-time, connection-grammar (a fresh registry per
   world), calc-grammar, on a real SQLite database (node:sqlite) at the plane's shape (`sql.exec` answers a cursor).
   Stand-ins, answering exactly as their requirements state their services (T33's L5 jobs run at once, P10: duties
   codes against their approved requirements): entities (`readEntity`, R5; `sector`, R42; `proceeding`, R45),
   standards (`standardRead`, R5; `inForceAt`, R20), events (`readEvent`, R26; `eventsFor`, R27), lines (`linesOf`, R9),
   money (`readFact`, R8; `moneyOf`, R9), provenance (`homeOf`, R4) and content (`contentRow`, R17). The jurisdiction
   view is a fictional one (no real place, R23), as `jurisdictions.combine` would answer it. */
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { createRegistry } from "../../../src/connection-grammar/index.mjs";
import { noSuchStandard } from "../../../src/standards/index.mjs";
import { sha256HexSync } from "../../../src/record-grammar/index.mjs";
import { dutiesOf, dutiesOps } from "../../../src/duties/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() { const r = c.toArray(); if (r.length !== 1) throw new Error(`Expected exactly one result, got ${r.length}`); return r[0]; },
  };
  return c;
}
export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    },
  };
  return {
    db, sql, rows: (q, ...args) => [...sql.exec(q, ...args)],
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

export const V = (id) => `member:${id}`;
export const BOB = V("bob"), CAROL = V("carol");
export const MACHINE = "class:ai";
export const NOW = "2026-03-02T12:00:00.000Z";
export const ZONE = "America/Halifax";
export const ent = (n) => `ENT-2026-${String(n).padStart(4, "0")}`;
export const evt = (s) => `EVT-2026-${String(s).padEnd(16, "0").slice(0, 16)}`;
export const mny = (s) => `MNY-2026-${String(s).padEnd(16, "0").slice(0, 16)}`;
export const SHA = (s) => sha256HexSync(String(s));

/** The entities the stand-in registry holds. */
export const E = Object.freeze({
  clerk: ent(1),          // office: the Town Clerk
  council: ent(2),        // body, government
  contractor: ent(3),     // institution, company, acting for the town under a contract line
  private: ent(4),        // institution, company, no line
  filer: ent(5),          // person
  parcel: ent(6),         // parcel: owes nothing
  case: ent(7),           // proceeding
  group: ent(8),          // movement: the group itself
  auditor: ent(9),        // office: the enforcer
  fund: ent(10),          // fund
  undet: ent(11),         // institution, sector undetermined, no line
});
export const ENTITIES = Object.freeze({
  [E.clerk]: { kind: "office", label: "Town Clerk" },
  [E.council]: { kind: "body", label: "Town Council", sector: "government" },
  [E.contractor]: { kind: "institution", label: "Harbour Waste Co.", sector: "company" },
  [E.private]: { kind: "institution", label: "Private Co.", sector: "company" },
  [E.filer]: { kind: "person", label: "A Filer" },
  [E.parcel]: { kind: "parcel", label: "Lot 9" },
  [E.case]: { kind: "proceeding", label: "Superior Court 26-CV-1" },
  [E.group]: { kind: "movement", label: "The Group", sector: "association" },
  [E.auditor]: { kind: "office", label: "Town Auditor" },
  [E.fund]: { kind: "fund", label: "General Fund" },
  [E.undet]: { kind: "institution", label: "Unsorted Inc." },
});

/** A fictional jurisdiction view (the shape `jurisdictions.combine` answers; T33-2's fields). */
export function fictionalView(extra = {}) {
  const closures = (year, days) => ({ year, list: "court_days", days, status: "researched", basis: "TEST", citation: "Test Code §135" });
  return {
    id: "test-fiction", name: "Fiction", covers: ["Fictional Town"], test: true, profiles: ["test-fiction"],
    time_zone: { value: ZONE, status: "researched", basis: "TEST" },
    weekend: { days: ["sat", "sun"], citation: "Test Code §12a", status: "researched", basis: "TEST" },
    holidays: [closures(2026, [{ date: "2026-01-01", name: "New Year" }, { date: "2026-03-16", name: "Founders' Day" }]),
               closures(2027, [{ date: "2027-01-01", name: "New Year" }])],
    deadlines: [
      { rule: "records_response", applies_to: "records_request", units: "days", amount: 10, count: "calendar", starts: "received",
        roll: true, closures: "court_days", citation: "Test Code §7922", status: "researched", basis: "TEST" },
      { rule: "monthly_report", applies_to: "claim", units: "months", amount: 1, starts: "act", citation: "Test Code §9",
        status: "researched", basis: "TEST" },
    ],
    response_statuses: [
      { status: "implemented", label: "has been implemented", citation: "Test Penal Code §933", basis: "TEST" },
      { status: "will_implement", label: "will be implemented", citation: "Test Penal Code §933", basis: "TEST" },
      { status: "will_not_implement", label: "will not be implemented", citation: "Test Penal Code §933", basis: "TEST" },
    ],
    ...extra,
  };
}

export function world({ now = NOW, view = fictionalView(), deps = {} } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now, ms: 0 };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const registry = createRegistry();

  const ents = new Map(Object.entries(ENTITIES).map(([id, e]) => [id, { entity_id: id, ...e }]));
  const stds = new Map();
  const evs = new Map();
  const lines = [];
  const facts = new Map();
  const homes = new Map();
  const rows = new Map();
  const calls = [];

  const entities = {
    readEntity({ entityId }) {
      calls.push(["readEntity", entityId]);
      const e = ents.get(entityId);
      return e ? { ok: true, found: true, entity: { ...e, sector: e.sector ?? (["institution", "body", "movement"].includes(e.kind) ? "undetermined" : undefined) } }
        : { ok: true, found: false, entity_id: entityId, entity: null };
    },
  };
  const standards = {
    standardRead({ id }) { const s = stds.get(id); return s ? { ok: true, ...s } : noSuchStandard(id ?? null); },
    inForceAt({ standard, date }) {
      const s = stds.get(standard);
      if (!s) return { state: "undetermined", why: "no such standard" };
      const p = s.period || {};
      if (p.from && date < p.from) return { state: "not_in_force", why: `before ${p.from}`, standard };
      if (p.to && date > p.to) return { state: "not_in_force", why: `after ${p.to}`, standard };
      if (!p.from || !p.to) return { state: s.openEnd === "in" ? "in_force" : "undetermined", why: "no end is stated", standard };
      return { state: "in_force", why: "within its period", standard };
    },
  };
  const events = {
    readEvent({ eventId }) { const e = evs.get(eventId); return e ? { ok: true, found: true, event: { ...e } } : { ok: true, found: false }; },
    eventsFor({ entity, kinds }) {
      calls.push(["eventsFor", entity, kinds]);
      const out = [...evs.values()].filter((e) => (e.concerns || []).includes(entity) && (!kinds || kinds.includes(e.kind)));
      return { ok: true, events: out.map((e) => ({ ...e })), truncated: false };
    },
  };
  const linesSvc = {
    linesOf({ entity, kinds }) {
      return { ok: true, lines: lines.filter((l) => (l.from === entity || l.to === entity) && (!kinds || kinds.includes(l.kind))) };
    },
  };
  const money = {
    readFact({ factId }) { const f = facts.get(factId); return f ? { ok: true, found: true, fact: { ...f } } : { ok: true, found: false }; },
    moneyOf({ entity }) {
      return { ok: true, facts: [...facts.values()].filter((f) => [f.from && f.from.entity, f.to && f.to.entity, f.from && f.from.fund, f.to && f.to.fund, ...(f.concerns || [])].includes(entity)), truncated: false };
    },
  };
  const provenance = { homeOf(sha) { const h = homes.get(sha); return h ? { bundleId: h } : null; } };
  const content = { contentRow(id) { return rows.get(id) || null; } };
  let viewNow = view;

  const duties = dutiesOf(host, {
    record, membership, registry, entities, standards, events, lines: linesSvc, money, provenance, content,
    view: () => viewNow, now: () => clock.now, clockMs: () => clock.ms, ...deps,
  });

  const w = {
    st, host, record, membership, registry, duties, clock, calls, ents, stds, evs, lines, facts, homes, rows,
    sqlRows: (q, ...a) => st.rows(q, ...a),
    at(iso) { clock.now = iso; return w; },
    setView(v) { viewNow = v; return w; },
    standard(id, s) { stds.set(id, { id, kind: "statute", cite: `Test Code ${id}`, instrument: `fiction/code/${id}`, period: { from: "2000-01-01", to: "2099-12-31" }, ...s }); return id; },
    event(id, e) { evs.set(id, { event_id: id, kind: "communication", ...e }); return id; },
    line(l) { lines.push({ line_id: `LIN-2026-${String(lines.length + 1).padEnd(16, "0")}`, ...l }); },
    fact(id, f) { facts.set(id, { fact_id: id, currency: "USD", precision: "exact", sign: "+", ...f }); return id; },
    ops(query = "", body = null) { return dutiesOps(duties, new URL(`http://x/?${query}`), body); },
    /** A project bundle owned by `owner` (a member id), so its contents are fenced from others (membership R43). */
    project(id, owner) {
      const T0 = "2026-01-01T00:00:00Z";
      const text = `---\nid: ${id}\n---\n`;
      record.transact(() => record.commit({ bundleId: id, type: "project", title: id, project: null, snapKey: "p0", kind: "promotion",
        base: SHA(""), author: "x", writer: null, operation: null,
        files: [{ path: "bundle.md", text, sha256: SHA(text), bytes: text.length }],
        state: "forming", priorState: null, group: "test-group", created: T0, lastUpdated: T0, criticality: null, at: T0 }));
      membership.reindexProjectSight?.(id);
      membership.projectClaimOwner({ projectId: id, memberId: owner });
      membership.reindexProjectSight?.(id);
      return id;
    },
    /** A valid duty's fields over the stand-ins, with `over` laid on top. */
    fields(over = {}) {
      if (!stds.has("STD-2026-0001-records-law")) w.standard("STD-2026-0001-records-law", { portion: "s7922" });
      return {
        modality: "duty", obligor: E.clerk, obligee: E.group,
        performance: { act: "respond to the records request" },
        source: { kind: "standard", standard: "STD-2026-0001-records-law", portion: "s7922" },
        trigger: { kind: "date", date: "2026-02-02" },
        time: { basis: "rule", rule: "records_response", applies_to: "records_request" },
        ...over,
      };
    },
    declare(over = {}, by = BOB) { return duties.declare({ ...w.fields(over), clause: "s7922(a): respond within 10 days", by }); },
  };
  return w;
}
