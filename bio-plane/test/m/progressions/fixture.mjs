/* progressions over record-core, membership and connections' `weakerGrade` (the real ones) on a real SQLite database
   (node:sqlite) standing in for a Durable Object's storage at its shape (a cursor, workerd's pattern cap; below, K316).
   What it reads from `entities`, `extraction`, `provenance`, `events`, `standards` and `local-facts` are providers the
   test controls, in the shapes of those modules' Provides (entities R5, R7, R16; extraction R30; provenance `homeOf`;
   events R9, R26, R27; standards R5, R17, R20; local-facts R2's governing time zone), as `progressionsOf`'s `deps`
   take them. Every test drives the module at its interface. The zone is a test profile's, not a place the product
   names (layers.md rule 3). */
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { progressionsOf } from "../../../src/progressions/index.mjs";
/* the one answers progressions gives through its upstreams (K1563 (10), K1568 (3)), re-exported for the tests */
export { noSuchDatedFact } from "../../../src/events/index.mjs";
export { portionUnknown } from "../../../src/standards/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

/* workerd's `sql.exec` answers a cursor, never an array: rows are read by iterating it (or its `toArray()`/`one()`),
   and `[0]` or `.length` of it is undefined. It also refuses a LIKE or GLOB pattern over 50 bytes ("LIKE or GLOB
   pattern too complex"), which node:sqlite does not (K313). This storage answers as workerd does, so code that indexes
   a cursor or writes a long pattern fails here as it would in the Durable Object (K316). */
export const WORKERD_PATTERN_CAP = 50;
function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() {
      const rest = c.toArray();
      if (rest.length !== 1) throw new Error(`Expected exactly one result from SQL query, but got ${rest.length}`);
      return rest[0];
    },
  };
  return c;
}

export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const literal = [...q.matchAll(/\b(?:GLOB|LIKE)\s+'((?:[^']|'')*)'/gi)].map((m) => m[1].replace(/''/g, "'"));
      const bound = /\b(?:GLOB|LIKE)\s+\?|\b(?:glob|like)\s*\(/i.test(q) ? args.filter((a) => typeof a === "string") : [];
      if ([...literal, ...bound].some((p) => Buffer.byteLength(p) > WORKERD_PATTERN_CAP))
        throw new Error("LIKE or GLOB pattern too complex");
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
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
/** The basis statement a test's first declaration states (R2). */
export const FIRST_BASIS = "the group's reading of how this body works";

/** The governing zone the tests' profile gives (local-facts R2). */
export const ZONE = "America/New_York";

/** What `events` holds, in the shapes its reads answer (R9, R26, R27; checked against the real module in
 *  integration.test.mjs): dated facts per capture, events with their `when` and the captures that attest them. */
export function eventsWorld() {
  const e = { facts: new Map(), events: new Map(), reads: 0 };
  e.provider = {
    datedFactsFor: ({ captureSha }) => { e.reads++; const f = [...(e.facts.get(captureSha) || [])];
                                         return { ok: true, capture_sha: captureSha, count: f.length, dated_facts: f }; },
    readEvent: ({ eventId }) => {
      e.reads++;
      const ev = e.events.get(eventId);
      return ev ? { ok: true, found: true, event: { event_id: eventId, kind: ev.kind || "award",
                                                     when: ev.when && typeof ev.when === "object" && ev.when.value === undefined ? { ...ev.when, value: ev.when.start } : ev.when,
                                                     attestations: ev.captures.map((c, i) => ({ attestation_id: i + 1, form: "extent", dated_fact_id: null, capture_sha: c })) } }
                : { ok: true, found: false, event_id: eventId };
    },
  };
  return e;
}

/** What `standards` holds (R5, R20): each standard with its portion and the in-force answer it gives. */
export function standardsWorld() {
  const s = { held: new Map(), asked: [] };
  s.provider = {
    standardRead: ({ id }) => (s.held.has(id) ? { ok: true, standard_id: id, ...s.held.get(id),
                                                portion: s.held.get(id).portion ? { path: s.held.get(id).portion, content_id: "CNT-x" } : null }
                                              : { ok: false, reason: "NO_SUCH_STANDARD" }),
    inForceAt: (a) => { s.asked.push(a); const h = s.held.get(a.standard);
                        return h ? { ok: true, date: a.date, ...h.inForce, standard: a.standard } : { ok: true, state: "undetermined", why: "none" }; },
  };
  return s;
}

export function world({ now = "2026-09-01T00:00:00.000Z", nowMs = null, zone = ZONE } = {}) {
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
  const ev = eventsWorld(), std = standardsWorld();
  const tz = { zone };
  const p = progressionsOf(host, { record, extraction, provenance, entities: mean.entities_,
                                   events: ev.provider, standards: std.provider, zoneOf: () => tz.zone,
                                   now: () => clock.now, nowMs: clock.nowMs == null ? null : () => clock.nowMs });
  p.migrate();
  const w = {
    st, host, record, p, clock, mean, dates, ev, std, tz,
    /** A dated fact `events` holds for a capture (its R1): a day, in the governing zone. */
    fact(captureSha, value, id = `DF-${captureSha}-${value}`, extra = {}) {
      if (!ev.facts.has(captureSha)) ev.facts.set(captureSha, []);
      ev.facts.get(captureSha).push({ dated_fact_id: id, capture_sha: captureSha, kind: "signed", value, ...extra });
      return id;
    },
    /** An event `events` holds, with its `when` (R9) and the captures that attest it. */
    event(id, when, captures) { ev.events.set(id, { when, captures }); return id; },
    rows: (q, ...a) => st.sql.exec(q, ...a).toArray(),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`).one().n,
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM ${name}`).toArray());
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
    /** The three-stage flow most tests use. A first declaration states its basis (R2, DEC-88); a revision sends its
     *  own through `extra`, so one sent without is refused as R4 says. */
    define(key = "proc", overrides = {}, extra = {}) {
      const stages = [
        { key: "need", cardinality: "1", required: "always" },
        { key: "award", after: "need", cardinality: "1", required: "always", within: "30 days" },
        { key: "contract", after: "award", cardinality: "0..n", required: "usually", within: "2 weeks" },
      ].map((s) => ({ ...s, ...(overrides[s.key] || {}) }));
      const first = p.readProgression({ progressionKey: key }).found ? {} : { basis: FIRST_BASIS };
      return p.defineProgression({ progressionKey: key, label: "Procurement", stages, declaredBy: "member:alice", ...first, ...extra });
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
