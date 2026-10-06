/* events' test fixture: a Durable Object storage stand-in over node:sqlite at the plane's shape (`sql.exec` answering a
   cursor, `transactionSync` nesting as savepoints) with the real modules events uses — record-core, membership,
   extraction (the readings), provenance (the register and the capture grade), content (the extent check and office
   metadata), entities (the registry and resolutions) and reading-pipeline's hook registry — and the fictional test
   profile (R42). Every test drives `events` at its interface. `entities`' T33 services (`entityByIdentifier`,
   `proceedingOf`) are read through the real instance; while the merged `entities` lacks them, the fixture adds them
   over its own small table and says so (`STAND_IN`), never inside the module under test. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { Extraction } from "../../../src/extraction/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { Entities } from "../../../src/entities/index.mjs";
import { readHooksOf } from "../../../src/reading-pipeline/hooks.mjs";
import { layerChainFor } from "../../../src/reading-pipeline/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";
import { Events } from "../../../src/events/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
function cursor(rows) {
  let i = 0;
  const c = { next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
              [Symbol.iterator]() { return c; }, toArray() { const o = rows.slice(i); i = rows.length; return o; } };
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

export const MACHINE = "class:daemon";
export const MEMBER = "member:alice";
export const OUTSIDER = "member:outsider";
export const ZONE = "America/Halifax";
export let STAND_IN = false;

/* The test profile's view, with a Legistar person scheme and body scheme a test may add (R22) and vote values
   (R11) a test may add, never in product code. */
export function testView({ legistar = false, votes = null } = {}) {
  const c = combine(["test-port-ellery"]);
  const view = { ...c.view };
  if (legistar) view.identifier_schemes = [...(view.identifier_schemes || []),
    { scheme: "legistar_person", label: "Legistar PersonId", entity_kinds: ["person"], space: "person", basis: "TEST" },
    { scheme: "legistar_body", label: "Legistar BodyId", entity_kinds: ["body"], space: "body", basis: "TEST" }];
  if (votes) view.vote_values = votes;
  return view;
}

/* entities' T33 services over the fixture's own table, only where the merged entities lacks them. */
function withIdentifiers(e, st) {
  const has = typeof e.entityByIdentifier === "function";
  st.sql.exec(`CREATE TABLE IF NOT EXISTS fixture_identifiers (entity_id TEXT, scheme TEXT, id TEXT)`);
  st.sql.exec(`CREATE TABLE IF NOT EXISTS fixture_proceedings (entity_id TEXT PRIMARY KEY, kind TEXT)`);
  const addId = has && typeof e.addIdentifier === "function"
    ? (entityId, scheme, id) => e.addIdentifier({ entityId, scheme, id: String(id), basis: "the test's system rule", by: MACHINE })
    : (entityId, scheme, id) => st.sql.exec(`INSERT INTO fixture_identifiers VALUES (?,?,?)`, entityId, scheme, String(id));
  if (!has) {
    STAND_IN = true;
    e.entityByIdentifier = ({ scheme, id }) => {
      const r = [...st.sql.exec(`SELECT entity_id FROM fixture_identifiers WHERE scheme=? AND id=?`, scheme, String(id))];
      return r.length === 1 ? { entity_id: r[0].entity_id } : null;
    };
  }
  if (typeof e.proceedingOf !== "function")
    e.proceedingOf = (id) => { const r = [...st.sql.exec(`SELECT kind FROM fixture_proceedings WHERE entity_id=?`, id)]; return r.length ? { kind: r[0].kind } : null; };
  return { addId };
}

let clock = 0;
/** A fresh record with the modules above and events over it. */
export function world({ view = testView(), now = null, profiles = true } = {}) {
  const st = storage();
  const host = { storage: st };
  const record = recordOf(host);
  record.migrate();
  if (profiles) record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "test");
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionStub();
  const x = new Extraction(st, { record, membership, promotion });
  x.migrate();
  const prov = provenanceOf(host, { record, membership, promotion, now: () => "2026-09-27T00:00:00Z" });
  prov.migrate();
  const content = contentOf(host, { record, membership, provenance: prov, extraction: x });
  if (typeof content.migrate === "function") content.migrate();
  const ents = new Entities(st, { record, membership, provenance: prov });
  ents.migrate();
  const ids = withIdentifiers(ents, st);
  const hooks = readHooksOf(host);
  const ev = new Events(st, { record, membership, provenance: prov, extraction: x, content, entities: ents,
                              now: now || (() => new Date(Date.UTC(2026, 9, 1, 0, 0, clock++)).toISOString()),
                              view: typeof view === "function" ? view : () => view });
  ev.migrate();
  ev.start(hooks);
  for (const [m, role] of [["alice", "member"], ["bob", "member"], ["outsider", "member"], ["root", "admin"]])
    st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', ?, 'active', '2026-01-01', '2026-01-01')`, m, role);
  const w = {
    st, host, record, membership, x, prov, content, ents, ev, hooks,
    rows: (q, ...a) => [...st.sql.exec(q, ...a)], one: (q, ...a) => [...st.sql.exec(q, ...a)][0] || null,
    bundle(id, { type = "information", project = "" } = {}) {
      st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
                   VALUES (?, ?, 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1, ?)`, id, type, project);
      return id;
    },
    /* A project with one participant (membership R43 fences what belongs to it). */
    project(id, participant = "alice") {
      w.bundle(id, { type: "project" });
      st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, 'joined', 1, '2026-01-01', '2026-01-01')`, id, participant);
      return id;
    },
    /* A capture held in the register of `bundleId`, fetched direct (capture grade B), with a reading of `contentType`
       whose facts are `facts`, through extraction's writer. */
    capture(name, { bundleId = "INFO-2026-0001-a", project = "", contentType = "text/html", facts = {}, fetched = true, pages = null, extra = {} } = {}) {
      const s = sha(name);
      w.bundle(bundleId, { project });
      st.sql.exec(`INSERT OR REPLACE INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, 'snapshots/x', 'utf8', 1, '2026-09-27T00:00:00Z')`, s, bundleId);
      if (fetched) prov.recordReceipt({ address: `https://example.test/${name}`, addressNorm: `https://example.test/${name}`, captureSha: s,
                                        retrieved: "2026-09-27T00:00:00Z", via: "direct" });
      x.writeReading({ bundleId, captureSha: s, composed: true,
        reading: { content_type: contentType, reader_version: 1, found: true, at: "2026-09-27T00:00:00Z", entities: [],
                   facts, ...extra, ...(pages ? { page_count: pages, text_source: layerChainFor(null, { tier: 1, container: "pdf" }) } : {}) } });
      return s;
    },
    entity(label, kind = "person") {
      return ents.createEntity({ kind, label, note: "a subject the test registers", declaredBy: MEMBER }).entity_id;
    },
    identify(entityId, scheme, id) { return ids.addId(entityId, scheme, id); },
    /* A proceeding with its kind (R34). While the merged entities admits no `proceeding` kind (T33-25), the fixture
       registers it in entities' table directly and holds its facet beside it (STAND_IN). */
    proceeding(label, kind = "commitment_suit") {
      let id = ents.createEntity({ kind: "proceeding", label, note: "a proceeding the test registers", declaredBy: MEMBER }).entity_id;
      if (!id) {
        STAND_IN = true;
        id = `ENT-2026-${String(9000 + clock++).padStart(4, "0")}`;
        st.sql.exec(`INSERT INTO entities (entity_id, kind, label, note, declared_by, at) VALUES (?, 'proceeding', ?, 'n', ?, '2026-01-01')`, id, label, MEMBER);
      }
      st.sql.exec(`INSERT OR REPLACE INTO fixture_proceedings VALUES (?, ?)`, id, kind);
      return id;
    },
    /* An event attested by one dated fact of a fresh capture (`value` its date) or, with no value, by its extent. */
    event({ kind = "meeting", value = null, by = MEMBER, capture = null, dkind = "meeting", ...rest } = {}) {
      const s = capture || w.capture(`c-${Math.random()}`);
      const att = value === null ? { captureSha: s, extent: { kind: "document" } }
        : { datedFactId: ev.recordDatedFact({ captureSha: s, extent: { kind: "document" }, kind: dkind, value, method: "read by a member", by }).dated_fact.dated_fact_id };
      return ev.createEvent({ kind, attestations: [att], by, ...rest });
    },
  };
  return w;
}
