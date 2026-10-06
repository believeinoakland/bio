/* people's test fixture: a Durable Object storage stand-in over node:sqlite at the plane's shape (`sql.exec` answering a
   cursor, `transactionSync` nesting as savepoints) with the real modules people uses that are built (record-core,
   membership, provenance, entities, connection-grammar's registry, civil-time, jurisdictions) and contract stand-ins for
   the layer-5 modules being built beside it (`lines`, `events`, `money`, `duties`, and entities' T33 identifier reads),
   each answering as its approved requirements say (lines R9–R11, events R26–R33, money R8–R9, duties R7, entities
   R43–R44, sources R9). Every test drives `people` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../../../src/membership/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { Entities } from "../../../src/entities/index.mjs";
import { createRegistry } from "../../../src/connection-grammar/index.mjs";
import { compare } from "../../../src/civil-time/index.mjs";
import { People } from "../../../src/people/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
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
function promotionStub() {
  return { registerStep() { return { ok: true }; }, registerFact() { return { ok: true }; }, onCommitted() { return { ok: true }; } };
}

export const ANN = "member:ann";        /* a participant of the fenced project */
export const OUT = "member:out";        /* a member outside it */
export const BOSS = "member:boss";      /* an active administrator */
export const MACHINE = "class:daemon";
export const PROJ = "PROJ-2026-0001-fenced";

let seq = 0;
const id = (p) => `${p}-2026-${String(++seq).padStart(4, "0")}`;

/* A fresh world. `profiles` sets the active jurisdiction profiles. */
export function world({ profiles = ["test-port-ellery"] } = {}) {
  const st = storage();
  const host = { storage: st };
  const record = recordOf(host);
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionStub();
  const prov = provenanceOf(host, { record, membership, promotion, now: () => "2026-09-27T00:00:00Z" });
  prov.migrate();
  if (profiles) record.setSetting("jurisdiction_profiles", profiles, "test");
  const real = new Entities(st, { record, membership, provenance: prov });
  real.migrate();
  const rows = (q, ...a) => [...st.sql.exec(q, ...a)];
  for (const [m, role] of [["ann", "member"], ["out", "member"], ["boss", "admin"]])
    st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', ?, 'active', '2026-01-01', '2026-01-01')`, m, role);

  /* Sight in the stand-ins as membership R43 rules it: a row naming a bundle is seen as that bundle is. */
  const sees = (bundle, viewer) => (viewerPredicate(viewer).scope === "DENY" ? false : !bundle || membership.inSight(bundle, viewer));

  /* entities' T33 identifier reads (R43, R44), beside the real registry. */
  const idents = new Map();
  const entities = Object.create(real);
  entities.identifiersOf = (e) => ({ ok: true, identifiers: idents.get(e) || [] });
  entities.entityByIdentifier = ({ scheme, id: v }) => {
    for (const [e, list] of idents) if (list.some((i) => i.scheme === scheme && i.id.toLowerCase() === String(v).toLowerCase())) return { entity_id: e };
    return null;
  };
  for (const k of ["has", "readEntity", "entitiesByAlias", "createEntity"]) entities[k] = real[k].bind(real);

  /* lines (R9–R11): every line held in memory, with the bundle whose sight it follows. */
  const L = [];
  const lineOut = (l) => ({ line_id: l.line_id, kind: l.kind, from: l.from, to: l.to, capacity: l.capacity ?? null, valid: l.valid,
                            basis: l.basis ?? { statement: "test" }, assertion: l.assertion ?? "B", ends: l.ends ?? { from: "A", to: "A" },
                            title: l.title ?? null, withdrawn: l.withdrawn ?? null });
  const lines = {
    linesOf({ entity, kinds = null, direction = "both", limit = 100, viewer }) {
      const hit = L.filter((l) => (!kinds || kinds.includes(l.kind)) && sees(l.bundle, viewer)
        && ((direction !== "to" && l.from === entity) || (direction !== "from" && l.to === entity)));
      const cap = Math.max(1, Math.min(Number(limit) || 100, 500));
      return { ok: true, lines: hit.slice(0, cap).map(lineOut), truncated: hit.length > cap };
    },
    readLine({ lineId, viewer }) {
      const l = L.find((x) => x.line_id === lineId);
      return l && sees(l.bundle, viewer) ? { ok: true, found: true, line: lineOut(l) } : { ok: true, found: false };
    },
    structureAt({ entity, kinds, viewer }) {
      return { ok: true, held: L.filter((l) => kinds.includes(l.kind) && (l.from === entity || l.to === entity) && sees(l.bundle, viewer)).map(lineOut), undetermined: [] };
    },
  };
  /* events (R26, R27, R31, R33). */
  const E = [];
  const startOf = (e) => (e.when ? { value: e.when.start, precision: e.when.precision || "day", zone: e.when.zone || "UTC" } : null);
  const events = {
    eventsFor({ entity, limit = 100, viewer }) {
      const hit = E.filter((e) => sees(e.bundle, viewer) && e.participants.some((p) => p.entity === entity));
      return { ok: true, events: hit.slice(0, limit).map((e) => ({ event_id: e.event_id, kind: e.kind, when: e.when,
        roles: e.participants.filter((p) => p.entity === entity).map((p) => p.role) })), truncated: hit.length > limit };
    },
    statementsOf({ entity, limit = 100, viewer }) {
      const hit = E.filter((e) => sees(e.bundle, viewer) && ["statement", "communication"].includes(e.kind)
        && e.participants.some((p) => p.entity === entity && ["speaker", "sender", "author", "actor"].includes(p.role)));
      return { ok: true, events: hit.slice(0, limit).map((e) => ({ event_id: e.event_id, kind: e.kind, when: e.when })), truncated: hit.length > limit };
    },
    sequence({ a, b }) {
      const x = E.find((e) => e.event_id === a), y = E.find((e) => e.event_id === b);
      if (!x || !y || !x.when || !y.when) return { undetermined: true, why: "placed nowhere" };
      const c = compare(startOf(x), startOf(y));
      return typeof c === "string" ? c : { undetermined: true, why: c.why };
    },
    readEvent({ eventId, viewer }) { const e = E.find((x) => x.event_id === eventId); return e && sees(e.bundle, viewer) ? { ok: true, found: true } : { ok: true, found: false }; },
  };
  /* money (R8, R9). */
  const M = [];
  const money = {
    moneyOf({ entity, kinds = null, limit = 100, viewer }) {
      const hit = M.filter((f) => sees(f.bundle, viewer) && (!kinds || kinds.includes(f.kind)) && (f.from.entity === entity || f.to.entity === entity));
      return { ok: true, facts: hit.slice(0, limit), truncated: hit.length > limit };
    },
    readFact({ factId, viewer }) { const f = M.find((x) => x.fact_id === factId); return f && sees(f.bundle, viewer) ? { ok: true, found: true } : { ok: true, found: false }; },
  };
  /* duties (R7). */
  const D = [];
  const duties = {
    dutiesOf({ entity, as = "obligor", viewer }) {
      return { ok: true, duties: D.filter((d) => d[as] === entity && sees(d.bundle, viewer)), truncated: false };
    },
  };
  /* sources (R9): rungOf answers NO_SUCH_SOURCE for a source not held. */
  const S = new Set();
  const sources = { rungOf: ({ source }) => (S.has(source) ? { ok: true, rung: "unknown" } : { ok: false, reason: "NO_SUCH_SOURCE" }) };

  const registry = createRegistry();
  let clock = 0;
  const now = () => new Date(Date.UTC(2026, 9, 1, 0, 0, clock++)).toISOString();
  const deps = { record, membership, entities, provenance: prov, sources, events, lines, money, duties, registry, now };
  const p = new People(st, deps);
  p.migrate();

  const w = {
    st, record, membership, prov, entities, real, p, deps, registry, L, E, M, D, S, idents, rows,
    one: (q, ...a) => rows(q, ...a)[0] || null,
    bundle(bid, { type = "information", project = null } = {}) {
      st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
                   VALUES (?, ?, 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1, ?)`, bid, type, project);
      return bid;
    },
    /* The fenced project, ann its participant; out sees none of it. */
    project() {
      w.bundle(PROJ, { type: "project" });
      if (!w.one(`SELECT 1 AS x FROM project_participants WHERE project_id=?`, PROJ))
        st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                     VALUES (?, 'ann', 'joined', 1, '2026-01-01', '2026-01-01')`, PROJ);
      return PROJ;
    },
    /* A capture held in a bundle (provenance's register home); `fenced` puts the bundle in the project. */
    capture(name, { fenced = false } = {}) {
      const s = sha(name);
      const bid = `INFO-2026-${String(++seq).padStart(4, "0")}-${fenced ? "f" : "o"}`;
      if (fenced) w.project();
      w.bundle(bid, { project: fenced ? PROJ : null });
      st.sql.exec(`INSERT OR REPLACE INTO register (capture_sha, bundle_id, path, encoding, bytes, registered)
                   VALUES (?, ?, 'snapshots/x', 'utf8', 1, '2026-09-27T00:00:00Z')`, s, bid);
      return { captureSha: s, bundle: bid };
    },
    person(label, aliases = []) {
      return real.createEntity({ kind: "person", label, aliases, note: "a person the test registers", declaredBy: "member:ann" }).entity_id;
    },
    entity(kind, label) { return real.createEntity({ kind, label, note: "a subject the test registers", declaredBy: "member:ann" }).entity_id; },
    identify(e, scheme, v, valid = null) { idents.set(e, [...(idents.get(e) || []), { scheme, id: v, normal: v.toLowerCase(), valid }]); },
    line(kind, from, to, valid, extra = {}) {
      const l = { line_id: id("LIN"), kind, from, to, valid: { precision: "day", zone: "UTC", from: null, to: null, ...valid }, ...extra };
      L.push(l);
      return l.line_id;
    },
    event(kind, when, participants, extra = {}) {
      const e = { event_id: id("EVT"), kind, when: when ? { precision: "day", zone: "UTC", ...when } : null, participants, ...extra };
      E.push(e);
      return e.event_id;
    },
  };
  return w;
}
