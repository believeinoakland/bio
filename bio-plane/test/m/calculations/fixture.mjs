/* calculations over the modules it uses: the real record-core, membership, promotion, provenance and content on a real
   SQLite database (node:sqlite) at the plane's storage shape (`sql.exec` answers a cursor), with an evidence store the
   test holds in memory. The layer-5 modules calculations reads and registers with (money, duties, people, events,
   progressions, standards, entities, retrieval) are built in the same tranche (P10), so each is a provider the test
   controls, answering at the interface their approved requirements state. Every test drives `calculations` at its
   interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf, listenerRefusal } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { entitiesOf } from "../../../src/entities/index.mjs";
import { eventsOf } from "../../../src/events/index.mjs";
import { standardsOf } from "../../../src/standards/index.mjs";
import { moneyOf } from "../../../src/money/index.mjs";
import { calculationsOf } from "../../../src/calculations/index.mjs";

export const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
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
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    },
  };
  return {
    db, sql, rows: (q, ...a) => [...sql.exec(q, ...a)],
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

/** An evidence bucket in memory, R2's shape: `get` answers an object with `text()` and `arrayBuffer()`, or null. */
export function bucket() {
  const m = new Map();
  return {
    m,
    async head(k) { return m.has(k) ? { key: k } : null; },
    async get(k) {
      if (!m.has(k)) return null;
      const bytes = m.get(k);
      return { text: async () => new TextDecoder().decode(bytes), arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
    },
    async put(k, bytes) { m.set(k, bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(String(bytes))); return { key: k }; },
  };
}

export const V = (id) => `member:${id}`;
export const MACHINE = "class:ai";
export const NOW = "2026-10-06T01:00:00.000Z";
export const PROFILE = "test-port-ellery";
const SHEET_CHAIN = [{ step: "layer", tier: 1, container: "xlsx", cap: null, measured_by: null, calibration: null }];

/* ---- the providers for the layer-5 modules, at their requirements' interfaces ---- */

const tail = (n) => String(n).padStart(16, "0").replace(/^0/, "a").slice(0, 16);

/** retrieval (its R70): `runSaved({form, owner, viewer})` over answers the test holds. */
export function retrievalProvider() {
  const saved = new Map();
  return { saved,
    runSaved({ form, owner, viewer }) {
      if (viewer !== owner) return { ok: false, reason: "NOT_YOUR_QUERY", detail: "no such saved query" };
      const s = saved.get(typeof form === "string" ? form : JSON.stringify(form));
      if (!s || s.owner !== owner) return { ok: false, reason: "NOT_YOUR_QUERY", detail: "no such saved query" };
      return { ok: true, ids: s.ids, total: s.ids.length, truncated: !!s.truncated, digest: sha(JSON.stringify(s.ids)), at: NOW };
    } };
}

/** duties (its R7, R9, R12, R13): duties, occurrences and transitions the test holds. */
export function dutiesProvider() {
  const duties = new Map(), occurrences = new Map(), transitions = [], evidence = [];
  return { duties, occurrences, transitions, evidence,
    registerOccurrenceEvidence(module, fn) {
      const r = listenerRefusal(evidence, module, fn);
      if (r) return r;
      evidence.push({ module, fn });
      return { ok: true };
    },
    readDuty({ dutyId, viewer }) {
      const d = duties.get(dutyId);
      if (!d) return { ok: true, found: false };
      if (Array.isArray(d.visibleTo) && !/^class:/.test(viewer || "") && !d.visibleTo.includes(viewer)) return { ok: true, found: false };
      return { ok: true, found: true, ...d };
    },
    occurrencesOf({ dutyId }) { return { ok: true, occurrences: occurrences.get(dutyId) || [] }; },
    transitionsOf() { return { ok: true, transitions: transitions.slice() }; },
  };
}

/** people (its R19): `registerRosterSource(module, source)`. */
export function peopleProvider() {
  const sources = [];
  return { sources,
    registerRosterSource(module, source) {
      const r = listenerRefusal(sources, module, source);
      if (r) return r;
      sources.push({ module, fn: source });
      return { ok: true };
    } };
}

/** progressions (its R18, R38): the feed the test holds. */
export function progressionsProvider() {
  const feed = { instances: [] };
  return { feed, proposalsFeed() { return feed; } };
}

/* ---- the world ---- */

export function world({ now = NOW, construct = true, profiles = [PROFILE], evidence = true } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now, ms: Date.parse(now) };
  const ev = evidence ? bucket() : null;
  const record = recordOf(host, { evidence: ev, evidencePrefix: "" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => clock.now });
  promotion.registerFact("producingGroup", "instance-setup", () => "test-group");
  promotion.registerFact("citedBy", "connections", () => []);
  promotion.registerFact("caseMember", "publication", () => false);
  const ex = { readings: {}, units: {} };
  const extraction = {
    readingOf: (s) => (ex.readings[s] ? { reading: { page_boxes: null, ...(ex.readings[s].reading || {}) }, chain: null, pageCount: 3, textContainer: null, captureFormat: null, ...ex.readings[s] } : null),
    unitsOf: (s) => ex.units[s] || { units: [], state: null },
    capturesReadFor: () => [],
    onReading: () => ({ ok: true }),
  };
  const content = contentOf(host, { record, membership, extraction, now: () => clock.now });
  const prov = content.provenance;
  prov.migrate();
  content.migrate();
  if (profiles !== null) record.setSetting("jurisdiction_profiles", profiles, "admin");
  /* entities, events and standards are the real modules (merged, K1576, K1578); the rest are providers until their merges. */
  const entities = entitiesOf(host, { record, membership, provenance: prov });
  if (typeof entities.migrate === "function") entities.migrate();
  const events = eventsOf(host, { record, membership, provenance: prov, extraction, content, entities, now: () => clock.now });
  if (typeof events.migrate === "function") events.migrate();
  const standards = standardsOf(host, { record, membership, promotion, content, events, now: () => clock.now });
  /* money, real (K1580), reached by calculations through a port that records each write it asks for (R13, R14). */
  const realMoney = moneyOf(host, { record, membership, entities, provenance: prov, events, now: () => clock.now,
    calculations: { bindingOf: (k) => (w.c ? w.c.bindingOf(k) : null) } });
  if (typeof realMoney.migrate === "function") realMoney.migrate();
  const calls = [];
  const money = {
    real: realMoney, calls,
    recordFact: (f) => { calls.push(f); return realMoney.recordFact(f); },
    readFact: (a) => realMoney.readFact(a),
    summable: (a) => realMoney.summable(a),
    onFactChanged: (m, fn) => realMoney.onFactChanged(m, fn),
    withdrawFact: (a) => realMoney.withdrawFact(a),
  };
  const retrieval = retrievalProvider(), duties = dutiesProvider(), people = peopleProvider(),
    progressions = progressionsProvider();
  const deps = { record, membership, content, provenance: prov, money, entities, standards, retrieval, duties, people, events,
    progressions, now: () => clock.now, clock: () => clock.ms };
  const build = (extra = {}) => calculationsOf(host, { ...deps, ...extra });
  const c = construct ? build() : null;
  let n = 0;
  const held = new Map();
  let parties = null;
  const w = {
    st, host, record, membership, promotion, prov, content, clock, ex, ev, c, build, money, entities, standards, retrieval,
    duties, people, events, progressions,
    rows: (q, ...a) => st.rows(q, ...a),
    count: (t) => st.rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    snapshot() {
      const out = {};
      for (const { name } of st.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`))
        out[name] = st.rows(`SELECT * FROM ${name}`);
      return out;
    },
    member(id, { role = "member", status = "active" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, ?, '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role, status);
    },
    /** A captured document holding `bytes`, filed in `project` when given; its capture recorded as fetched directly
     *  when `direct` (capture grade B, provenance R24). */
    document(bytes, { project = null, direct = true } = {}) {
      const name = `doc${++n}`;
      const capSha = sha(bytes), id = `INFO-2026-${String(n).padStart(4, "0")}-${name}`;
      const r = promotion.promote({ bundleId: id, base: null, snapKey: `k${n}`, author: V("bob"),
        files: [{ path: "bundle.md", text: infoMd(id, project) }, Buffer.byteLength(bytes) > 400000 ? { path: `snapshots/${name}.csv`, blobSha: capSha, bytes: Buffer.byteLength(bytes) } : { path: `snapshots/${name}.csv`, text: bytes },
                { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc(`snapshots/${name}.csv`, capSha, bytes)] }) }],
        meta: { object_type: "information", ...(project ? { project } : {}) },
        register: [{ sha256: capSha, path: `snapshots/${name}.csv`, encoding: "utf8", bytes: Buffer.byteLength(bytes) }] });
      if (!r.ok) throw new Error(`fixture document refused: ${JSON.stringify(r).slice(0, 400)}`);
      ex.readings[capSha] = { pageCount: 3 };
      if (direct) prov.recordReceipt({ address: `https://example.org/${name}`, addressNorm: `example.org/${name}`, captureSha: capSha, retrieved: "2026-09-01T00:00:00Z" });
      return { bundleId: id, capSha };
    },
    /** A CSV captured as a document, its bytes in the evidence store, cited whole: the content id. */
    csv(text, opts = {}) {
      const k = `${opts.project || ""}\u0000${text}`;
      if (held.has(k)) return held.get(k);
      const d = w.document(text, opts);
      if (ev) ev.m.set(d.capSha, new TextEncoder().encode(text));
      const m = content.mint({ bundleId: d.bundleId, captureSha: d.capSha, extent: { kind: "document" }, mintedBy: V("bob") });
      if (!m.ok) throw new Error(`fixture mint refused: ${JSON.stringify(m).slice(0, 400)}`);
      held.set(k, m.content_id);
      return m.content_id;
    },
    /** A passage stating `text` (a member's typing over page 0 of a fresh document): its content id. */
    passage(text, opts = {}) {
      const d = w.document(`a document stating ${text} ${++n}`, opts);
      const t = content.transcribe({ bundleId: d.bundleId, extent: { kind: "pdf-page", page: 0 }, text, transcriber: V("bob"), viewer: V("bob") });
      if (!t.ok) throw new Error(`fixture transcription refused: ${JSON.stringify(t).slice(0, 400)}`);
      return t.content_id;
    },
    /** A workbook range: a capture whose reading holds typed cells for sheet `S`, cited as `range`. */
    sheet(cells, range, opts = {}) {
      const d = w.document(`workbook ${++n}`, opts);
      ex.readings[d.capSha] = { pageCount: 1, chain: SHEET_CHAIN, textContainer: { sheets: ["S"] }, reading: { cells: { S: cells } } };
      const m = content.mint({ bundleId: d.bundleId, captureSha: d.capSha, extent: { kind: "sheet-range", sheet: "S", range }, mintedBy: V("bob") });
      if (!m.ok) throw new Error(`fixture sheet mint refused: ${JSON.stringify(m).slice(0, 400)}`);
      return m.content_id;
    },
    /** A money fact recorded by bob through the real money module (its R1), over the test's defaults, its source a
     *  passage of a fresh document (filed in a project only `visibleTo`'s members may see, when given): its id. */
    fact(fields = {}) {
      if (!parties) parties = { from: w.entity("The Treasury", "office"), to: w.entity("Harbour Supply", "institution") };
      const { visibleTo, ...rest } = fields;
      const project = Array.isArray(visibleTo) ? w.project("Private ledger", visibleTo[0].replace(/^member:/, "")) : null;
      const d = w.document(`a ledger page ${++n}`, project ? { project } : {});
      const amount = String(rest.amount ?? "100");
      const f = { amount, as_read: `$${amount}`, currency: "USD", sign: "+", precision: "exact", kind: "payment", phase: "actual", stage: "paid",
        basis: "cash", period: { from: "2025-07-01", to: "2026-06-30", precision: "day" }, from: { entity: parties.from }, to: { entity: parties.to },
        source: { capture_sha: d.capSha, extent: { kind: "document" } }, by: V("bob"), ...rest };
      for (const k of Object.keys(f)) if (f[k] === undefined) delete f[k];
      if (f.period && !f.period.precision) f.period = { ...f.period, precision: "day" };
      if (f.period && !f.period.zone && profiles === null) f.period = { ...f.period, zone: "UTC" };   /* no profile gives a zone */
      const r = realMoney.recordFact(f);
      if (!r.ok) throw new Error(`fixture money fact refused: ${JSON.stringify(r).slice(0, 300)}`);
      return r.fact_id;
    },
    /** The payer and payee the default facts name. */
    parties() { if (!parties) w.fact({}); return parties; },
    /** A standard declared by bob (standards R1) over a fresh passage, in force over `period`: its id. */
    standard(period) {
      const r = standards.standardDeclare({ cite: `Test Bylaw § ${++n}`, kind: "ordinance", issuer: "The Selectboard", text: [w.passage(`bylaw ${n}`)],
        period, reason: "the group holds the town to its own bylaw", author: V("bob"), viewer: V("bob") });
      if (!r.ok) throw new Error(`fixture standard refused: ${JSON.stringify(r).slice(0, 300)}`);
      return r.id;
    },
    /** A registered person holding the profile's person identifier `id` (entities R43): its entity id. */
    person(label, id = null) {
      const e = entities.createEntity({ kind: "person", label, note: "a subject the test registers", declaredBy: V("bob") });
      if (!e.ok) throw new Error(`fixture entity refused: ${JSON.stringify(e).slice(0, 300)}`);
      if (id) {
        const r = entities.addIdentifier({ entityId: e.entity_id, scheme: "ellery_person", id, basis: "the minutes' roll", by: V("bob") });
        if (!r.ok) throw new Error(`fixture identifier refused: ${JSON.stringify(r).slice(0, 300)}`);
      }
      return e.entity_id;
    },
    /** A registered entity of another kind (an office, a body): its entity id. */
    entity(label, kind = "office") {
      const proceeding = kind === "proceeding"
        ? { forum: w.entity(`${label}, its forum`, "institution"), kind: "commitment_suit", number: `MC-26-${String(1000 + ++n).slice(-4)}` } : undefined;
      const e = entities.createEntity({ kind, label, note: "a subject the test registers", declaredBy: V("bob"), ...(proceeding ? { proceeding } : {}) });
      if (!e.ok) throw new Error(`fixture entity refused: ${JSON.stringify(e).slice(0, 300)}`);
      return e.entity_id;
    },
    /** An event (events R6) attested by a dated fact of a fresh captured document, dated `value`: its event id. */
    event(kind, value, { concerns = [], dkind = "meeting" } = {}) {
      const d = w.document(`an event document ${++n}`);
      const f = events.recordDatedFact({ captureSha: d.capSha, extent: { kind: "document" }, kind: dkind, value, method: "read by a member", by: V("bob") });
      if (!f.ok) throw new Error(`fixture dated fact refused: ${JSON.stringify(f).slice(0, 300)}`);
      const e = events.createEvent({ kind, attestations: [{ datedFactId: f.dated_fact.dated_fact_id }], concerns, by: V("bob") });
      if (!e.ok) throw new Error(`fixture event refused: ${JSON.stringify(e).slice(0, 300)}`);
      return { eventId: e.event_id, capSha: d.capSha };
    },
    /** `inner` held within `outer` (events R19), attested by inner's document. */
    within(inner, outer) {
      const r = events.relate({ from: inner.eventId, to: outer.eventId, kind: "within", attestation: { captureSha: inner.capSha, extent: { kind: "document" } }, by: V("bob") });
      if (!r.ok) throw new Error(`fixture relation refused: ${JSON.stringify(r).slice(0, 300)}`);
      return r;
    },
    project(title, owner) {
      const r = promotion.promote({ base: null, snapKey: `p${++n}`, author: V(owner), ownerMemberId: owner,
        files: [{ path: "bundle.md", text: projMd(title) }], meta: { object_type: "project" } });
      if (!r.ok) throw new Error(`fixture project refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r.bundleId;
    },
    /** A table declared by bob over a CSV source. */
    async table(text, fields, extra = {}, opts = {}) {
      const source = w.csv(text, opts);
      const header = fields.map((f) => f.name);
      const r = await w.c.declareTable({ source, schema: { fields }, header, by: V("bob"), ...extra });
      if (!r.ok) throw new Error(`fixture table refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r;
    },
  };
  return w;
}

/** bob and carol members, alice an administrator. */
export function seeded(opts) {
  const w = world(opts);
  w.member("alice", { role: "admin" });
  w.member("bob");
  w.member("carol");
  return w;
}

/** A recipe in calc-grammar's grammar over one table input `t`. */
export const R = (steps, output, inputs = [{ name: "t", kind: "table" }]) => ({ method: "bio-calc/1", inputs, steps, output });

function infoMd(id, project) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          "current_state: collected", "prior_state: null", ...(project ? [`project: ${project}`] : []), `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting",
          "---", "", "## Summary", "", "A document.", ""].join("\n");
}

function provDoc(file, capSha, text) {
  return { file, locator: `https://example.org/${file}`, retrieved: "2026-09-27T00:00:00Z",
           authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
           capture: { method: "acquire", grade: "B", actor_class: "session", sha256: capSha, encoding: "utf8",
                      bytes: Buffer.byteLength(text) },
           origin: { kind: "named_request" } };
}

function projMd(title) {
  return ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
          "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
          `objective: "Find out."`, "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""]
    .join("\n");
}
