/* lines' test fixture: a Durable Object storage stand-in over node:sqlite at the plane's shape (`sql.exec` answering a
   cursor, `transactionSync` nesting as savepoints), the real modules lines uses that are built (record-core,
   membership, provenance, extraction, content, entities, connection-grammar), and two contract stand-ins for what is
   being built beside this job in T33's layer 5 (reading J1 (3)):
   - `entities`' T33 parts (kind `proceeding`, `entityByIdentifier`, entities R43–R45), over the real registry;
   - `events` (R15 `onWhenChanged`, R26 `readEvent`'s `when`), which moves an event's `when` inside a transaction
     and tells its listeners there, as its R15 says.
   Every test drives `lines` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf, listenerRefusal } from "../../../src/membership/index.mjs";
import { Extraction } from "../../../src/extraction/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { Entities, noSuchEntity } from "../../../src/entities/index.mjs";
import { createRegistry } from "../../../src/connection-grammar/index.mjs";
import { Lines } from "../../../src/lines/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
export const MACHINE = "class:admin";
export const ANN = "member:ann";
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() { const rest = c.toArray(); if (rest.length !== 1) throw new Error(`Expected exactly one result, got ${rest.length}`); return rest[0]; },
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

function promotionStub() {
  return { registerStep() { return { ok: true }; }, registerFact() { return { ok: true }; }, onCommitted() { return { ok: true }; } };
}

/* entities' T33 contract over the real registry: `proceeding` entities and scheme identifiers held here until
   ENTITIES #9 merges; everything else answered by the real module. */
function entitiesT33(real) {
  const extra = new Map();          /* entity_id → {kind, label} for kinds the built registry does not yet take */
  const idents = new Map();         /* `${scheme}|${id}` → entity_id */
  let n = 0;
  return {
    real,
    has: (id) => extra.has(id) || real.has(id),
    readEntity: ({ entityId, viewer }) => (extra.has(entityId)
      ? { ok: true, found: true, entity: { entity_id: entityId, ...extra.get(entityId) } }
      : real.readEntity({ entityId, viewer })),
    resolutionsFor: (a) => real.resolutionsFor(a),
    entityByIdentifier: ({ scheme, id }) => idents.get(`${scheme}|${id}`) ?? null,
    noSuchEntity,
    /* test-side acts */
    create(kind, label) {
      if (["proceeding"].includes(kind)) {
        const id = `ENT-2026-${String(9000 + n++).padStart(4, "0")}`;
        extra.set(id, { kind, label });
        return id;
      }
      const r = real.createEntity({ kind, label, note: `${label}, registered by the test`, declaredBy: ANN });
      if (!r.ok) throw new Error(`${kind} ${label}: ${r.reason}`);
      return r.entity_id;
    },
    identify(entityId, scheme, id) { idents.set(`${scheme}|${id}`, entityId); },
  };
}

/* events' contract: held events with a `when` {start, end, precision, zone}; `move` changes one inside a transaction
   and runs the `onWhenChanged` listeners there (events R15). */
function eventsStub(record) {
  const held = new Map();
  const listeners = [];
  let n = 0;
  return {
    listeners,
    onWhenChanged(module, fn) {
      const bad = listenerRefusal(listeners, module, fn);
      if (bad) return bad;
      listeners.push({ module, fn });
      return { ok: true };
    },
    readEvent({ eventId }) {
      return held.has(eventId) ? { ok: true, found: true, event: { event_id: eventId, when: held.get(eventId) } }
        : { ok: true, found: false, event_id: eventId };
    },
    create(when) { const id = `EVT-2026-${String(n++).padStart(16, "0")}`; held.set(id, when); return id; },
    move(eventId, after, { fail = false } = {}) {
      return record.transact(() => {
        const before = held.get(eventId);
        held.set(eventId, after);
        try {
          for (const l of listeners) l.fn({ eventId, before, after });
          if (fail) throw new Error("the event write failed after its listeners ran");
        } catch (e) { held.set(eventId, before); throw e; }
        return { ok: true };
      });
    },
  };
}

/* A fresh record with lines over it. `profiles` sets the active jurisdiction profiles (record-core R26). */
export function world({ profiles = ["test-port-ellery"] } = {}) {
  const st = storage();
  const host = { storage: st };
  const record = recordOf(host);
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionStub();
  const x = new Extraction(st, { record, membership, promotion });
  x.migrate();
  const prov = provenanceOf(host, { record, membership, promotion, now: () => "2026-09-27T00:00:00Z" });
  prov.migrate();
  const content = contentOf(host, { record, membership, provenance: prov, extraction: x });
  content.migrate();
  if (profiles) record.setSetting("jurisdiction_profiles", profiles, "test");
  const realEntities = new Entities(st, { record, membership, provenance: prov });
  realEntities.migrate();
  const entities = entitiesT33(realEntities);
  const events = eventsStub(record);
  const registry = createRegistry();
  let clock = 0;
  const l = new Lines(st, { record, provenance: prov, content, entities, events, registry,
                            now: () => new Date(Date.UTC(2026, 9, 1, 0, 0, clock++)).toISOString() });
  l.migrate();
  const w = {
    st, record, membership, prov, content, entities, events, registry, l,
    rows: (q, ...a) => [...st.sql.exec(q, ...a)], one: (q, ...a) => [...st.sql.exec(q, ...a)][0] || null,
    bundle(id, { type = "information", project = null } = {}) {
      st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
                   VALUES (?, ?, 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1, ?)`, id, type, project);
      return id;
    },
    /* A captured document homed in `bundleId`, fetched directly from `address`. */
    held(bundleId, captureSha, { address = "https://records.example/doc", project = null } = {}) {
      w.bundle(bundleId, { project });
      st.sql.exec(`INSERT OR REPLACE INTO register (capture_sha, bundle_id, path, encoding, bytes, registered)
                   VALUES (?, ?, 'snapshots/x', 'utf8', 1, '2026-09-27T00:00:00Z')`, captureSha, bundleId);
      prov.recordReceipt({ address, addressNorm: address.toLowerCase(), captureSha, retrieved: "2026-09-27T00:00:00Z" });
      return captureSha;
    },
    /* A reading of the capture carrying `refs`, then the recogniser over it: the capture's resolutions. */
    resolved(bundleId, captureSha, refs) {
      x.writeReading({ bundleId, captureSha, composed: true,
        reading: { content_type: "text/html", reader_version: 1, found: true, at: "2026-09-27T00:00:00Z", entities: refs } });
      return realEntities.resolve({ captureSha, resolvedBy: MACHINE });
    },
    /* A project with one participant, and an outsider member. */
    project(id, participant) {
      w.bundle(id, { type: "project" });
      st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status) VALUES ('outsider', 'o', 'member', 'active')`);
      st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status) VALUES (?, 'c', 'member', 'active')`, participant);
      st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, 'joined', 1, '2026-01-01', '2026-01-01')`, id, participant);
      return id;
    },
    ent: (kind, label) => entities.create(kind, label),
    /* A member's testimony line: the shortest valid act. */
    say(kind, from, to, more = {}) {
      const r = w.l.recordLine({ kind, from, to, basis: { statement: "I was there" }, by: ANN, ...more });
      if (!r.ok) throw new Error(`${kind}: ${r.reason} ${r.detail}`);
      return r.line_id;
    },
  };
  return w;
}
