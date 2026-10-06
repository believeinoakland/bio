/* money's test fixture: a Durable Object storage stand-in over node:sqlite (`sql.exec` answering a cursor,
   `transactionSync` nesting as savepoints) with the real modules money uses — record-core, membership, provenance,
   entities (the registry and its `resolutions` table) and the fictional test profile through jurisdictions. `events`
   and `lines` are not merged yet (T33-26, T33-27): they are stand-ins written to their approved requirements (events
   R6, R17, R26, R27; lines' `has`), and so are entities' T33 `entityByIdentifier` (its R44) and `calculations`'
   `bindingOf` (K1563 (6); calculations merges after money), until those jobs merge.
   Every test drives `money` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { Entities } from "../../../src/entities/index.mjs";
import { Money } from "../../../src/money/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
export const MACHINE = "class:daemon";
export const ANN = "member:ann";
export const BOB = "member:bob";
export const OUTSIDER = "member:outsider";
export const ZONE = "America/Halifax";

function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
  };
  return c;
}

export function storage() {
  const db = new DatabaseSync(":memory:");
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) db.exec(t);
  let n = 0;
  return {
    db,
    sql: { exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    } },
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

/* events, to its approved requirements: events held with their kind, what they concern, and relations (R17, R26:
   each relation answered in and out on its event's read, entities R5's pattern). */
export function eventsStandIn() {
  const events = new Map();
  const ev = {
    events,
    add(id, kind, concerns = []) { events.set(id, { event_id: id, kind, concerns, relations: [] }); return id; },
    relate(from, to, kind, n) {
      const r = { relation_id: `ERL-${n}`, kind, from, to, attestation: { capture_sha: sha(`att-${n}`), extent: { kind: "document" } },
                  grade: { assertion: "B", ends: ["B", "B"] } };
      events.get(from).relations.push({ ...r, direction: "out" });
      events.get(to).relations.push({ ...r, direction: "in" });
    },
    has: (id) => events.has(id),
    eventsFor: ({ entity, kinds }) => ({ ok: true, events: [...events.values()]
      .filter((e) => e.concerns.includes(entity) && (!kinds || kinds.includes(e.kind))).map((e) => ({ event_id: e.event_id, kind: e.kind })) }),
    readEvent: ({ eventId }) => (events.has(eventId) ? { ok: true, found: true, event: { ...events.get(eventId) } } : { ok: true, found: false }),
  };
  return ev;
}

export function world({ events = true, lines = true, calculations = true, now = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const record = recordOf(host);
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = { registerStep: () => ({ ok: true }), registerFact: () => ({ ok: true }), onCommitted: () => ({ ok: true }) };
  const prov = provenanceOf(host, { record, membership, promotion, now: () => "2026-09-27T00:00:00Z" });
  prov.migrate();
  record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "test");
  const e = new Entities(st, { record, membership, provenance: prov });
  e.migrate();
  /* entities R44 (T33-25, not merged): the scheme identifiers a test holds. */
  const identifiers = new Map();
  const entities = new Proxy(e, { get(t, k) {
    if (k === "entityByIdentifier") return ({ scheme, id }) => identifiers.get(`${scheme}\u0000${id}`) ?? null;
    const v = t[k]; return typeof v === "function" ? v.bind(t) : v;
  } });
  const ev = events ? eventsStandIn() : null;
  const heldLines = new Set();
  const ln = lines ? { has: (id) => heldLines.has(id) } : null;
  /* calculations' bindings, K1563 (6): bindingOf(key) → {adopted, table, roles, capture_sha} | null. */
  const bindings = new Map();
  const calc = calculations ? { bindingOf: (key) => bindings.get(key) ?? null } : null;
  let clock = 0;
  const m = new Money(st, { record, membership, entities, provenance: prov, events: ev, lines: ln, calculations: calc,
    now: now || (() => new Date(Date.UTC(2026, 9, 6, 0, 0, clock++)).toISOString().replace(/\.\d{3}Z$/, "Z")) });
  m.migrate();
  const w = {
    st, host, record, membership, prov, e, entities, events: ev, lines: heldLines, m, identifiers, bindings,
    rows: (q, ...a) => [...st.sql.exec(q, ...a)], one: (q, ...a) => [...st.sql.exec(q, ...a)][0] || null,
    bundle(id, { type = "information", project = null } = {}) {
      st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
                   VALUES (?, ?, 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1, ?)`, id, type, project);
      return id;
    },
    /* A capture held in a bundle (provenance's register, its R48); fetched directly when `direct` (grade B). */
    held(bundleId, captureSha, { direct = true, project = null } = {}) {
      w.bundle(bundleId, { project });
      st.sql.exec(`INSERT OR REPLACE INTO register (capture_sha, bundle_id, path, encoding, bytes, registered)
                   VALUES (?, ?, 'snapshots/x', 'utf8', 1, '2026-09-27T00:00:00Z')`, captureSha, bundleId);
      if (direct) prov.recordReceipt({ address: `https://ledger.port-ellery.example/${captureSha.slice(0, 8)}`,
        addressNorm: `https://ledger.port-ellery.example/${captureSha.slice(0, 8)}`, captureSha, retrieved: "2026-09-27T00:00:00Z" });
      return captureSha;
    },
    /* A project with one participant: a capture filed in it is hidden from everyone else. */
    project(id, participant) {
      w.bundle(id, { type: "project" });
      for (const mId of [participant, "outsider"])
        st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status) VALUES (?, 'c', 'member', 'active')`, mId);
      st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, 'joined', 1, '2026-01-01', '2026-01-01')`, id, participant);
      return id;
    },
    entity(kind, label) { return e.createEntity({ kind, label, note: "registered by the money tests", declaredBy: ANN }).entity_id; },
    identify(entityId, scheme, id) { identifiers.set(`${scheme}\u0000${id}`, { entity_id: entityId }); return { scheme, id }; },
    resolution(captureSha, entityId, grade) {
      st.sql.exec(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method, basis, established, resolved_by, at)
                   VALUES (?, 'INFO-1', ?, ?, ?, 'test', 'test', ?, 'test', '2026-09-27T00:00:00Z')`, captureSha, `r-${entityId}-${grade}`, entityId, grade,
                   grade === "A" || grade === "B" ? 1 : 0);
    },
  };
  return w;
}

/* A world with a city, a vendor, two funds, a contract and a held capture, and a fact builder over them. */
export function seeded(opts = {}) {
  const w = world(opts);
  const city = w.entity("institution", "City of Port Ellery");
  const vendor = w.entity("institution", "Harbour Dredging Co");
  const general = w.entity("fund", "General Fund");
  const harbour = w.entity("fund", "Harbour Fund");
  const contract = w.entity("contract", "Dredging contract");
  const cap = w.held("INFO-1", sha("ledger"));
  const fact = (over = {}) => ({
    amount: "1250000.00", as_read: "$1,250,000.00", currency: "USD", sign: "+", precision: "exact", kind: "expenditure",
    phase: "actual", stage: "paid", basis: "modified accrual", period: { fiscal: "FY2013-14" },
    from: { entity: city, fund: general, as_written: "City of Port Ellery" }, to: { entity: vendor, as_written: "Harbour Dredging Co" },
    source: { capture_sha: cap, extent: { kind: "pdf-page", page: 3 } }, by: ANN, ...over });
  const rec = (over = {}) => {
    const r = w.m.recordFact(fact(over));
    if (!r.ok) throw new Error(`fixture fact refused: ${r.reason}: ${r.detail}`);
    return r.fact_id;
  };
  return { ...w, city, vendor, general, harbour, contract, cap, fact, rec };
}
