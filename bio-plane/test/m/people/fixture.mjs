/* people over the real modules it uses (K1563 (1), K1580, K1585): record-core, membership, promotion, provenance,
   content, entities, events, lines, money, duties and standards on one host, a real SQLite database (node:sqlite) at
   the plane's shape (`sql.exec` answers a cursor). The host is duties' own test world (`../duties/fixture.mjs`), which
   builds standards' world (promotion, content, provenance, events) and adds entities, lines, money and duties on the
   same storage, each its real module. `sources` (layer 3, whose sources are made by knockers' acts this module never
   makes) is the one stand-in: `rungOf` answering as sources R9 does, a held source or `NO_SUCH_SOURCE`.
   connection-grammar's registry is a fresh one per world. Every test drives `people` at its interface. */
import { world as dutiesWorld, E as DE } from "../duties/fixture.mjs";
import { createRegistry } from "../../../src/connection-grammar/index.mjs";
import { People } from "../../../src/people/index.mjs";

export const ANN = "member:ann";        /* a participant of the fenced project */
export const OUT = "member:out";        /* a member outside it */
export const BOSS = "member:boss";      /* an active administrator */
export const MACHINE = "class:daemon";
/** The persons duties' world registers before any test's own (its filer). */
export const PRESET_PERSONS = 1;

/** A citation of a captured document: its capture and its first page, with the day the record states when given. */
export const doc = (c, date) => ({ captureSha: c.captureSha, extent: { kind: "pdf-page", page: 0 }, ...(date ? { date } : {}) });

/* A fresh world. `profiles` sets the active jurisdiction profiles after the world is built (null keeps the test
   profile); `deps` lays services over the real ones people is handed; `entitiesOver(real)` answers the entities
   service people is handed instead of the real one (for what no held profile can express). */
export function world({ profiles = null, deps: over = {}, entitiesOver = null } = {}) {
  const dw = dutiesWorld();
  const { st, host, record, membership, content, prov, ev, entities, lines, money, duties, clock } = dw;
  for (const [m, role] of [["ann", "member"], ["out", "member"], ["boss", "admin"]]) dw.sw.member(m, { role });
  if (profiles !== null) record.setSetting("jurisdiction_profiles", profiles, "admin");
  const fail = (what, r) => { throw new Error(`fixture ${what} refused: ${JSON.stringify(r).slice(0, 400)}`); };

  /* sources R9: a held source answers its rung; any other id NO_SUCH_SOURCE */
  const S = new Set();
  const sources = { rungOf: ({ source }) => (S.has(source) ? { ok: true, source, rung: "unknown" } : { ok: false, reason: "NO_SUCH_SOURCE" }) };

  const registry = createRegistry();
  let tick = 0;
  const now = () => new Date(Date.parse(clock.now) + 1000 * tick++).toISOString().replace(/\.\d{3}Z$/, "Z");
  const ents = entitiesOver ? entitiesOver(entities) : entities;
  const deps = { record, membership, entities: ents, provenance: prov, content, sources, events: ev, lines, money, duties, registry, now, ...over };
  const p = new People(st, deps);
  p.migrate();

  let project = null, docs = 0;
  const w = {
    st, host, record, membership, prov, content, entities, real: entities, ev, lines, money, duties, p, deps, registry, S, dw, clock,
    rows: (q, ...a) => st.rows(q, ...a),
    one: (q, ...a) => st.rows(q, ...a)[0] || null,
    /** The fenced project (one per world), owned by ann: `out` sees none of it. */
    project() {
      if (!project) project = dw.project("ann");
      return project;
    },
    /** A captured document (an information bundle holding one capture, read, with a passage minted); `fenced` files its
     *  bundle in the fenced project. */
    capture(name, { fenced = false } = {}) {
      const ps = dw.passage(`${name.replace(/[^A-Za-z0-9]/g, "").slice(0, 24) || "doc"}${++docs}`);
      if (fenced) st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, w.project(), ps.bundleId);
      return { captureSha: ps.capSha, bundle: ps.bundleId };
    },
    person(label, aliases = []) {
      const r = entities.createEntity({ kind: "person", label, aliases, note: "a person the test registers", declaredBy: ANN });
      if (!r.ok) fail("person", r);
      return r.entity_id;
    },
    entity(kind, label, extra = {}) {
      const r = entities.createEntity({ kind, label, note: "a subject the test registers", declaredBy: ANN, ...extra });
      if (!r.ok) fail("entity", r);
      return r.entity_id;
    },
    /** A scheme identifier held on an entity (entities R43), on a cited register; `valid` its validity. */
    identify(e, scheme, v, valid = null) {
      const r = entities.addIdentifier({ entityId: e, scheme, id: v, valid, basis: "the register the test cites", by: ANN });
      if (!r.ok) fail("identifier", r);
      return r;
    },
    /** A line (lines R1) on ann's testimony, or on a passage of a fenced capture (`fenced`); a `holds` line is held in
     *  the capacity given (default appointed). Its id. */
    line(kind, from, to, valid, { capacity, fenced = false } = {}) {
      const basis = fenced ? (() => { const c = w.capture("fenced line", { fenced: true }); return { captureSha: c.captureSha, extent: { kind: "pdf-page", page: 0 } }; })()
        : { statement: `the ${kind} the test states` };
      const r = lines.recordLine({ kind, from, to, ...(kind === "holds" ? { capacity: capacity ?? "appointed" } : {}),
        valid: { precision: "day", zone: "UTC", from: null, to: null, ...valid }, basis, by: ANN });
      if (!r.ok) fail("line", r);
      return r.line_id;
    },
    /** An event (events R6) attested by ann's testimony, dated `when.start` (a day) or undated, with its participants
     *  `[{entity, role}]` stated by that attestation. Its id. */
    event(kind, when, participants = []) {
      const r = ev.createEvent({ kind, attestations: [{ testimony: `I saw the ${kind}.`, ...(when && when.start ? { value: when.start } : {}) }],
        participants: participants.map((x) => ({ entityId: x.entity, role: x.role, attestation: 0 })), by: ANN });
      if (!r.ok) fail("event", r);
      return r.event_id;
    },
    /** A money fact (money R1) read from a fresh passage: kind, the parties `{entity}`, amount. Its id. */
    fact({ kind, from, to, amount = "100.00" }) {
      const ps = dw.passage();
      const r = money.recordFact({ amount, as_read: `$${amount}`, currency: "USD", sign: "+", precision: "exact", kind, phase: "actual",
        stage: kind === "income" ? "collected" : "paid", basis: "cash",
        period: { from: "2026-01-01", to: "2026-12-31", precision: "day", zone: "UTC" }, from, to,
        source: { capture_sha: ps.capSha, extent: { kind: "pdf-page", page: 0 } }, by: "member:bob" });
      if (!r.ok) fail("money fact", r);
      return r.fact_id;
    },
    /** A person's duty (duties R3), declared by bob under a held standard binding them. Its id. */
    duty(obligor, over = {}) {
      const r = dw.declare({ obligor, obligee: DE.group, performance: { act: "file a statement of interests" },
                             source: { ...dw.fields().source, binds: "every filer of a statement of interests" }, ...over });
      if (!r.ok) fail("duty", r);
      return r.duty_id;
    },
  };
  return w;
}
