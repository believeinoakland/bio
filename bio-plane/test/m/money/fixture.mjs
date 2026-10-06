/* money's test fixture: a Durable Object storage stand-in over node:sqlite (`sql.exec` answering a cursor,
   `transactionSync` nesting as savepoints) with the real modules money uses — record-core, membership, provenance,
   content, entities (the registry, its scheme identifiers and `resolutions`), events and lines — and the fictional test
   profile through jurisdictions. Only `calculations`' `bindingOf` is a stand-in, to its K1563 (6) shape, because
   calculations merges after money. Every test drives `money` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { Entities } from "../../../src/entities/index.mjs";
import { eventsOf } from "../../../src/events/index.mjs";
import { Lines } from "../../../src/lines/index.mjs";
import { createRegistry } from "../../../src/connection-grammar/index.mjs";
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
  const content = contentOf(host, { record, membership, provenance: prov });
  content.extraction.migrate();
  content.migrate();
  const e = new Entities(st, { record, membership, provenance: prov });
  e.migrate();
  let tick = 0;
  const evClock = () => new Date(Date.UTC(2026, 9, 1, 0, 0, tick++)).toISOString();
  const ev = eventsOf(host, { record, membership, provenance: prov, content, extraction: content.extraction, entities: e, now: evClock });
  ev.migrate();
  const ln = new Lines(st, { record, provenance: prov, content, entities: e, events: ev, registry: createRegistry(), now: evClock });
  ln.migrate();
  /* calculations' bindings, K1563 (6): bindingOf(key) → {adopted, table, roles, capture_sha} | null. */
  const bindings = new Map();
  const calc = calculations ? { bindingOf: (key) => bindings.get(key) ?? null } : null;
  let clock = 0;
  const m = new Money(st, { record, membership, entities: e, provenance: prov, events: events ? ev : null, lines: lines ? ln : null, calculations: calc,
    now: now || (() => new Date(Date.UTC(2026, 9, 6, 0, 0, clock++)).toISOString().replace(/\.\d{3}Z$/, "Z")) });
  m.migrate();
  const w = {
    st, host, record, membership, prov, e, ev, ln, m, bindings,
    /* A real event, attested by a member's testimony, concerning `concerns`; a real cited relation between two. */
    event(kind, concerns = []) {
      const r = ev.createEvent({ kind, concerns, attestations: [{ testimony: `I saw the ${kind}` }], by: ANN });
      if (!r.ok) throw new Error(`fixture event refused: ${r.reason}: ${r.detail}`);
      return r.event_id ?? r.event?.event_id;
    },
    relate(from, to, kind) {
      const r = ev.relate({ from, to, kind, attestation: { testimony: `the minutes say the ${kind}` }, by: ANN });
      if (!r.ok) throw new Error(`fixture relation refused: ${r.reason}: ${r.detail}`);
      return r.relation.relation_id;
    },
    /* A real line: a person holding an office. */
    line() {
      const p = w.entity("person", `Holder ${tick}`), o = w.entity("office", `Office ${tick}`);
      const r = ln.recordLine({ kind: "holds", from: p, to: o, capacity: "appointed", valid: { from: "2019-01-01", to: "2020-12-31" },
                                basis: { statement: "I attended the swearing-in" }, by: ANN });
      if (!r.ok) throw new Error(`fixture line refused: ${r.reason}: ${r.detail}`);
      return r.line_id;
    },
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
    /* A scheme identifier held by entities' own act (its R43). */
    identify(entityId, scheme, id) {
      const r = e.addIdentifier({ entityId, scheme, id: String(id), basis: "the test's cited source", by: ANN });
      if (!r.ok) throw new Error(`fixture addIdentifier refused: ${r.reason}: ${r.detail}`);
      return { scheme, id: String(id) };
    },
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
