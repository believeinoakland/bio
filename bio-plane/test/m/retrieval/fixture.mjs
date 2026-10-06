/* retrieval's test fixture: the module over the modules it uses, each the real one where it is extracted (record-core,
   membership, promotion, provenance, provenance-routes), on a real SQLite database (node:sqlite, FTS5 included)
   standing in for a Durable Object's storage; observation-log (its R9–R13, R18, R19) is the real one too, through `observationOf`. One provider is
   the test's own: extraction's drift obligations (its R38, `driftFor`). The tables other modules own that the compiler
   and the frontier read (capture's `links`, extraction's `readings`/`capture_text`, content's `content`, entities'
   `entities`/`resolutions`, observation-log's `observation_log`/`leads`/`lead_shares`) are created from their owners'
   schemas, and three more (inquiry's `inquiry_basis`, basis-versions' `inquiry_basis_version_legs`, connections'
   `connections`) from the column text here; the rows a test needs are written into them as their owners write them.
   Every test drives `retrieval` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { provenanceRoutesOf } from "../../../src/provenance-routes/index.mjs";
import { EXTRACTION_SCHEMA } from "../../../src/extraction/schema.mjs";
import { CAPTURE_SCHEMA } from "../../../src/capture/schema.mjs";
import { CONTENT_SCHEMA } from "../../../src/content/index.mjs";
import { ENTITIES_SCHEMA } from "../../../src/entities/index.mjs";
import * as OL from "../../../src/observation-log/index.mjs";
import { retrievalOf, observationOf } from "../../../src/retrieval/index.mjs";

export const sha = (s) => createHash("sha256").update(typeof s === "string" ? Buffer.from(s, "utf8") : s).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
export const V = (id) => `member:${id}`;
export const MACHINE = "class:member";

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

const run = (db, text) => {
  const bare = text.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  db.exec(bare);
};

/* Three tables the compiler's arms and the frontier read, by the columns these tests use and under their owners' names:
   inquiry's `inquiry_basis` (its R40), basis-versions' `inquiry_basis_version_legs` and connections' `connections` (its
   R59). Until each owner's extraction they were legacy-store's, in its `schema.mjs`. */
const STAND_IN_TABLES = `
CREATE TABLE IF NOT EXISTS inquiry_basis (bundle_id TEXT NOT NULL, ord INTEGER NOT NULL, target_id TEXT NOT NULL,
  target_type TEXT NOT NULL, role TEXT NOT NULL, grade TEXT, grade_axis TEXT, grade_source TEXT, note TEXT, at TEXT,
  ground TEXT, content_id TEXT, PRIMARY KEY (bundle_id, ord));
CREATE TABLE IF NOT EXISTS inquiry_basis_version_legs (bundle_id TEXT NOT NULL, name TEXT NOT NULL, ord INTEGER NOT NULL,
  target_id TEXT NOT NULL, target_type TEXT NOT NULL, role TEXT NOT NULL, grade TEXT, grade_axis TEXT, grade_source TEXT,
  note TEXT, at TEXT, ground TEXT NOT NULL, content_id TEXT, PRIMARY KEY (bundle_id, name, ord));
CREATE TABLE IF NOT EXISTS connections (a_bundle_id TEXT, b_bundle_id TEXT, entity_id TEXT);
`;

/* observation-log's vocabulary, as retrieval publishes it. */
export const VOCAB = Object.freeze({
  OBSERVATION_STATES: OL.OBSERVATION_STATES, DEFINITIVE_STATES: OL.DEFINITIVE_STATES,
  CONTENT_AXIS_STATES: OL.CONTENT_AXIS_STATES, CONTENT_AXIS_UNDETERMINED: OL.CONTENT_AXIS_UNDETERMINED,
  MISSING_ROW_CAUSES: OL.MISSING_ROW_CAUSES, MEANING_MISSING_ROW_CAUSES: OL.MEANING_MISSING_ROW_CAUSES,
  CONTENT_EVIDENCE_IS_ONE_SIDED: OL.CONTENT_EVIDENCE_IS_ONE_SIDED, MEANING_EVIDENCE_IS_ONE_SIDED: OL.MEANING_EVIDENCE_IS_ONE_SIDED,
  INTERNET_EVIDENCE_IS_ONE_SIDED: OL.INTERNET_EVIDENCE_IS_ONE_SIDED, INTERNET_FRONTIER_EMPTY_CAUSES: OL.INTERNET_FRONTIER_EMPTY_CAUSES,
  LEAD_VOCABULARY: OL.LEAD_VOCABULARY, DOCUMENT_EVIDENCE_IS_ONE_SIDED: OL.DOCUMENT_EVIDENCE_IS_ONE_SIDED,
});

/* ---- documents ---- */

export const T0 = "2026-09-27T00:00:00Z";

export function md(fields, body = "\n## Summary\n\nA document.\n") {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    if (v && typeof v === "object") { lines.push(`${k}:`); for (const [a, b] of Object.entries(v)) lines.push(`  ${a}: ${JSON.stringify(b)}`); continue; }
    lines.push(`${k}: ${v === null ? "null" : typeof v === "string" && /[:#"'\[\]{}]/.test(v) ? JSON.stringify(v) : v}`);
  }
  lines.push("---", body);
  return lines.join("\n");
}

export const infoMd = (id, extra = {}) => md({ id, object_type: "information", schema: "information@1", title: `Document ${id}`,
  current_state: "collected", prior_state: null, created: T0, last_updated: T0, group: "test-group",
  criticality: "supporting", ...extra });

export function provDoc(c) {
  return { file: c.path, locator: `https://example.org/${c.path}`, retrieved: T0, authority: "the publisher",
           authority_state: "determined", authority_basis: "named on the document",
           capture: { method: "acquire", grade: "B", actor_class: "session", sha256: c.sha, encoding: "utf8",
                      bytes: Buffer.byteLength(c.text) },
           origin: { kind: "named_request" } };
}

/** A world: the storage, the real record-core, membership, promotion, provenance and provenance-routes (which owns
 *  `provenance_route_marks`, its R8, R12), the test's extraction and
 *  observation providers, and `retrieval` over them. `members` are enrolled active; `admins` too, as administrators. */
export function world({ members = ["ann", "vera"], admins = [], now = Date.parse("2026-09-27T03:00:00Z"), deps = {},
                         before = null } = {}) {
  const st = storage();
  const host = { storage: st };
  run(st.db, RECORD_SCHEMA);
  const clock = { now, sel: now };
  const record = recordOf(host, { evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const iso = () => new Date(clock.now).toISOString().replace(/\.\d+Z$/, "Z");
  const promotion = promotionOf(host, { record, membership, now: iso });
  /* The facts promotion reads, each under the module that provides it. */
  promotion.registerFact("producingGroup", "instance-setup", () => "test-group");
  promotion.registerFact("citedBy", "connections", () => []);
  promotion.registerFact("caseMember", "publication", () => false);
  const prov = provenanceOf(host, { record, membership, promotion, now: iso });
  prov.migrate();
  /* Built after provenance, as the composition root builds layer 3 (provenance, attestation, provenance-routes). */
  const routes = provenanceRoutesOf(host, { record, membership, promotion, now: iso });
  routes.migrate();
  run(st.db, EXTRACTION_SCHEMA);
  /* extraction's text index over `capture_text`, as its migrate() creates it (external content, kept by triggers). */
  st.db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS capture_text_fts USING fts5(text, content='capture_text',
                content_rowid='rowid', tokenize='unicode61')`);
  st.db.exec(`CREATE TRIGGER IF NOT EXISTS capture_text_ai AFTER INSERT ON capture_text BEGIN
                INSERT INTO capture_text_fts(rowid, text) VALUES (new.rowid, new.text); END`);
  st.db.exec(`CREATE TRIGGER IF NOT EXISTS capture_text_ad AFTER DELETE ON capture_text BEGIN
                INSERT INTO capture_text_fts(capture_text_fts, rowid, text) VALUES ('delete', old.rowid, old.text); END`);
  run(st.db, CAPTURE_SCHEMA);
  run(st.db, CONTENT_SCHEMA);
  run(st.db, STAND_IN_TABLES);
  run(st.db, ENTITIES_SCHEMA);
  run(st.db, OL.OBSERVATION_LOG_SCHEMA);
  /* The strength and inquiry columns as they stood on `bundles` before their owners moved them into tables of their own
     (strength's `strength_cache`, its R23; inquiry's `inquiry_bundle_facts`, its R36). No owner registers them here
     (R62), so the compiler's fields read them where they stand. */
  for (const [c, t] of [["inquiry_capture_strength", "TEXT"], ["inquiry_capture_state", "TEXT"],
                        ["inquiry_connection_strength", "TEXT"], ["inquiry_connection_state", "TEXT"],
                        ["inquiry_basis_count", "INTEGER"], ["inquiry_subject_entity", "TEXT"], ["inquiry_superseded_by", "TEXT"]])
    st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c} ${t}`);
  for (const m of [...members, ...admins])
    st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                 VALUES (?,?,?,?, 'active', ?, ?, ?)`,
      m, `cover ${m}`, m, admins.includes(m) ? "admin" : "member", JSON.stringify(["contribute", "create_projects"]), T0, T0);
  const w = { st, host, record, membership, promotion, prov, routes, clock, runs: {}, drift: [],
              extraction: { driftFor: () => w.drift } };
  const log = OL.observationLogOf(host, { record, membership, provenance: null, extraction: null });
  /* The run authority's resolver ai-runs registers (observation-log R13): the runs each viewer may read. */
  log.registerAuthority("run", (run, viewer) => (w.runs[run] || []).includes(viewer));
  w.log = log;
  w.observation = observationOf(log, st.sql);
  /* `before(w)` runs ahead of retrieval's creation (an owner's tables a test stands in); `deps` are handed to it. */
  if (typeof before === "function") before(w);
  w.retrieval = retrievalOf(host, { record, membership, promotion, extraction: w.extraction, observation: w.observation,
                                    now: () => clock.now, selectionNow: () => clock.sel, ...deps });
  w.retrieval.migrate();
  let k = 0;
  const snap = () => `k${++k}`;
  Object.assign(w, {
    row: (q, ...a) => [...st.sql.exec(q, ...a)][0] ?? null,
    rows: (q, ...a) => [...st.sql.exec(q, ...a)],
    count: (t) => [...st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)][0].n,
    cap: (name, text = `bytes of ${name}`) => ({ path: `snapshots/${name}.txt`, text, sha: sha(text) }),
    /** Promotes a document (information unless `fields.object_type` says otherwise) with its extra `files` and the
     *  captures it registers. */
    doc(id, fields = {}, { files = [], captures = [], body, author = "member:ann" } = {}) {
      const text = infoMd(id, fields);
      const all = [{ path: "bundle.md", text: body !== undefined ? text.replace(/\n## Summary[\s\S]*$/, body) : text }, ...files];
      for (const c of captures) all.push({ path: c.path, text: c.text });
      if (captures.length)
        all.push({ path: "data/provenance.json", text: JSON.stringify({ documents: captures.map(provDoc) }, null, 2) });
      const head = [...st.sql.exec(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, id)][0];
      const r = promotion.promote({ bundleId: id, base: head ? head.bundle_sha : null, snapKey: snap(), author, files: all,
        meta: { object_type: fields.object_type || "information" },
        register: captures.map((c) => ({ sha256: c.sha, path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) })) });
      if (!r.ok) throw new Error(`fixture promote refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r;
    },
    /** A project owned by `owner` (so hidden from everyone else), holding the captures it registers. */
    project(title, owner = "ann", { captures = [] } = {}) {
      const files = [{ path: "bundle.md", text: md({ object_type: "project", title, current_state: "forming", prior_state: null,
        created: T0, last_updated: T0, group: "test-group" }) }];
      for (const c of captures) files.push({ path: c.path, text: c.text });
      if (captures.length)
        files.push({ path: "data/provenance.json", text: JSON.stringify({ documents: captures.map(provDoc) }, null, 2) });
      const r = promotion.promote({ base: null, snapKey: snap(), author: V(owner), ownerMemberId: owner, files, meta: {},
        register: captures.map((c) => ({ sha256: c.sha, path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) })) });
      if (!r.ok) throw new Error(`fixture project refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r.bundleId;
    },
    /** One observation row, as observation-log's append site writes it. */
    observe(o) {
      st.sql.exec(`INSERT INTO observation_log (at, actor_class, actor, authority_kind, authority, level, subject_kind, subject,
                   state, governed, condition, bound, result_kind, result_ref, detail) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        o.at || T0, o.actor_class || "plane", o.actor ?? null, o.authority_kind, o.authority ?? null, o.level,
        o.subject_kind, o.subject ?? null, o.state, o.governed ? 1 : 0, o.condition ?? null, o.bound ?? null,
        o.result_kind ?? null, o.result_ref ?? null, o.detail ?? null);
      return [...st.sql.exec(`SELECT MAX(seq) AS s FROM observation_log`)][0].s;
    },
    /** A reading row for a capture (its existence is the content level's pre-log evidence). */
    reading(capSha, bundleId) {
      st.sql.exec(`INSERT INTO readings (capture_sha, bundle_id, reading, at) VALUES (?,?,?,?)`, capSha, bundleId, "{}", T0);
    },
    /** One indexed unit of a capture's text, as extraction's index writes it. */
    unit(capSha, bundleId, seq, text, extent = { kind: "pdf-page", page: seq }) {
      const ex = JSON.stringify(extent);
      st.sql.exec(`INSERT INTO capture_text (capture_sha, bundle_id, extent_kind, extent, ref, seq, text, truncated, chain_kind)
                   VALUES (?,?,?,?,?,?,?,0,'layer')`, capSha, bundleId, extent.kind, ex, `p${seq}`, seq, text);
    },
  });
  return w;
}
