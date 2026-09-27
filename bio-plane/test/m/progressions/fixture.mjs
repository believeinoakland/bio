/* progressions over record-core, membership and connections' `weakerGrade` (the real ones) on a real SQLite database
   (node:sqlite) standing in for a Durable Object's storage. What it reads from `entities`, `extraction` and `provenance`
   are providers the test controls, in the shapes of those modules' Provides (entities R5, R7, R16; extraction R30;
   provenance `homeOf`), as `progressionsOf`'s `deps` take them. Every test drives the module at its
   interface. */
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { progressionsOf } from "../../../src/progressions/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    },
  };
  return {
    db, sql,
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}


/** The entity registry and resolutions `entities` answers (its R5, R7, R16). */
export function meaning() {
  const m = { entities: new Map(), resolutions: new Map() };
  m.entities_ = {
    has: (id) => m.entities.has(id),
    readEntity: ({ entityId }) => (m.entities.has(entityId) ? { ok: true, found: true, entity: { ...m.entities.get(entityId), aliases: [], relations: [] } }
                                                         : { ok: true, found: false, entity_id: entityId, entity: null }),
    strongestByCapture: (id) => new Map(m.resolutions.get(id) || []),
  };
  return m;
}

export const MEMBER = "class:member", BOB = "member:bob";
export const DAY = 86400000;

export function world({ now = "2026-09-01T00:00:00.000Z", nowMs = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now, nowMs };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const mean = meaning();
  const dates = { reading: {}, registered: {} };
  const extraction = { readingOf: (s) => (s in dates.reading ? { reading: { at: dates.reading[s] }, chain: null } : null) };
  const provenance = { homeOf: (s) => (s in dates.registered ? { bundleId: null, registered: dates.registered[s] } : null) };
  const p = progressionsOf(host, { record, extraction, provenance, entities: mean.entities_,
                                   now: () => clock.now, nowMs: clock.nowMs == null ? null : () => clock.nowMs });
  p.migrate();
  const w = {
    st, host, record, p, clock, mean, dates,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM ${name}`));
      return out;
    },
    /** A bundle row (record-core's `bundles`, its R37 read contract), of a type. */
    bundle(id, type = "information") {
      st.sql.exec(`INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,created,last_updated,bundle_sha)
                   VALUES (?,?,?,?,?,?,?,?)`, id, type, "g", id, "collected", now, now, "x");
    },
    /** A registered entity. */
    entity(id, label = `Entity ${id}`) { mean.entities.set(id, { entity_id: id, kind: "contract", label }); },
    /** A capture resolving to an entity at a grade, in a bundle. */
    resolve(entityId, captureSha, bundleId, grade) {
      if (!mean.resolutions.has(entityId)) mean.resolutions.set(entityId, new Map());
      mean.resolutions.get(entityId).set(captureSha, { capture_sha: captureSha, bundle_id: bundleId, grade });
    },
    /** The three-stage flow most tests use. */
    define(key = "proc", overrides = {}, extra = {}) {
      const stages = [
        { key: "need", cardinality: "1", required: "always" },
        { key: "award", after: "need", cardinality: "1", required: "always", within: "30 days" },
        { key: "contract", after: "award", cardinality: "0..n", required: "usually", within: "2 weeks" },
      ].map((s) => ({ ...s, ...(overrides[s.key] || {}) }));
      return p.defineProgression({ progressionKey: key, label: "Procurement", stages, declaredBy: "member:alice", ...extra });
    },
  };
  return w;
}

/** Three captures resolving to ENT-1 in bundles INFO-A..C (A, B, C grades), the entity registered. */
export function seeded(opts) {
  const w = world(opts);
  for (const b of ["INFO-A", "INFO-B", "INFO-C", "INFO-D"]) w.bundle(b);
  w.entity("ENT-1", "Contract one");
  w.resolve("ENT-1", "sa", "INFO-A", "A");
  w.resolve("ENT-1", "sb", "INFO-B", "B");
  w.resolve("ENT-1", "sc", "INFO-C", "C");
  w.resolve("ENT-1", "sd", "INFO-D", "A");
  return w;
}
