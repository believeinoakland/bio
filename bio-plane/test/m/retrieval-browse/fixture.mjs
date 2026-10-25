/* retrieval-browse's test fixture: the module over the modules it uses, each the real one where it is extracted (record-core,
   membership, promotion, provenance), on a real SQLite database (node:sqlite, FTS5 included) standing in for a Durable
   Object's storage. The tables other modules own that the module reads (capture's `links`, extraction's `readings`,
   `reading_refs` and `capture_text`, content's `content`, entities' `entities`) are created from their owners' schemas; the
   rows a test needs are written into them as their owners write them.

   The five host reads `retrieval` hands the module (R14) are stand-ins here, since a test cannot import a later module:
   `sight` is membership's gate as `retrieval` applies it; `planOf` and `runQuery` are `query-language`'s `compile` and a
   gated executor (the term kind runs only a statement that carries the gate's mark); `localeOf` answers `w.locale` (English
   unless a test sets another); `selectionRead` answers the handles a test registers with `w.selection(...)`. Every test
   drives `retrieval-browse` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { EXTRACTION_SCHEMA } from "../../../src/extraction/schema.mjs";
import { CAPTURE_SCHEMA } from "../../../src/capture/schema.mjs";
import { CONTENT_SCHEMA } from "../../../src/content/index.mjs";
import { ENTITIES_SCHEMA } from "../../../src/entities/index.mjs";
import { compile, GATE_MARK } from "../../../src/query.mjs";
import { retrievalBrowseOf } from "../../../src/retrieval-browse/index.mjs";

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

/** A world: the storage, the real record-core, membership, promotion and provenance, extraction's, capture's, content's and
 *  entities' tables, and `retrieval-browse` over them with the five stand-in host reads. `members` are enrolled active;
 *  `admins` too, as administrators. `w.locale` is what `localeOf` answers; `w.selection(handle, {owner, ids})` registers a
 *  selection `selectionRead` answers. */
export function world({ members = ["ann", "vera"], admins = [], now = Date.parse("2026-09-27T03:00:00Z"), deps = {},
                         before = null, evidence = null } = {}) {
  const st = storage();
  const host = { storage: st };
  run(st.db, RECORD_SCHEMA);
  const clock = { now, sel: now };
  const record = recordOf(host, { ...(evidence ? { evidence } : {}), evidencePrefix: "bio/captures/" });
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
  run(st.db, EXTRACTION_SCHEMA);
  /* extraction's migrate() adds the unit's part kind (R107) to `capture_text` (index.mjs's column list); the schema text lacks it. */
  st.db.exec(`ALTER TABLE capture_text ADD COLUMN kind TEXT`);
  /* extraction's text index over `capture_text`, as its migrate() creates it (external content, kept by triggers). */
  st.db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS capture_text_fts USING fts5(text, content='capture_text',
                content_rowid='rowid', tokenize='unicode61')`);
  st.db.exec(`CREATE TRIGGER IF NOT EXISTS capture_text_ai AFTER INSERT ON capture_text BEGIN
                INSERT INTO capture_text_fts(rowid, text) VALUES (new.rowid, new.text); END`);
  st.db.exec(`CREATE TRIGGER IF NOT EXISTS capture_text_ad AFTER DELETE ON capture_text BEGIN
                INSERT INTO capture_text_fts(capture_text_fts, rowid, text) VALUES ('delete', old.rowid, old.text); END`);
  run(st.db, CAPTURE_SCHEMA);
  run(st.db, CONTENT_SCHEMA);
  run(st.db, ENTITIES_SCHEMA);
  for (const m of [...members, ...admins])
    st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                 VALUES (?,?,?,?, 'active', ?, ?, ?)`,
      m, `cover ${m}`, m, admins.includes(m) ? "admin" : "member", JSON.stringify(["contribute", "create_projects"]), T0, T0);
  const w = { st, host, record, membership, promotion, prov, clock, locale: "en", selections: new Map() };
  /* The host reads, as `retrieval` stands them (its `sight`, `planOf`, `runQuery`, `localeOf`, `selectionRead`). */
  const sight = (viewer) => {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return (id) => !!id;
    if (gate.scope === "DENY") return () => false;
    const memo = new Map();
    return (id) => {
      if (!id) return false;
      if (!memo.has(id)) memo.set(id, membership.inSight(id, viewer));
      return memo.get(id);
    };
  };
  /* `retrieval` compiles through its projection relation, whose `fts_id` is the key the text index is aligned on; the stand-in
     is a relation of the fixture's own, one row per bundle, filled when a compile asks. */
  st.db.exec(`CREATE TABLE IF NOT EXISTS standin_projection (bundle_id TEXT PRIMARY KEY, fts_id INTEGER)`);
  const via = Object.freeze({ projection: { table: "standin_projection", key: "bundle_id" } });
  const planOf = (input) => {
    st.db.exec(`INSERT OR IGNORE INTO standin_projection (bundle_id, fts_id) SELECT bundle_id, rowid FROM bundles`);
    return compile({ ...input, zone: null }, via);
  };
  const runQuery = (stmt, tally) => {
    if (!stmt || typeof stmt.sql !== "string" || !stmt.sql.includes(GATE_MARK))
      throw new Error("REFUSED: a retrieval statement reached the store without the viewer visibility gate (D-15)");
    tally.applied++;
    return [...st.sql.exec(stmt.sql, ...stmt.args)];
  };
  // fixtures-contract: retrieval selection-read
  const selectionRead = ({ handle = null, viewer = null, owner = null } = {}) => {
    const sel = w.selections.get(handle);
    if (!sel) return { ok: false, reason: "NO_SUCH_SELECTION", detail: "unknown, released, or expired" };
    if (!owner || sel.owner !== owner) return { ok: false, reason: "SELECTION_NOT_YOURS", detail: "stand-in: not yours" };
    return { ok: true, members: sel.ids, viewer };
  };
  w.host_reads = { sight, planOf, runQuery, localeOf: () => w.locale, selectionRead };
  /* `before(w)` runs ahead of the module's creation (an owner's tables a test stands in); `deps` are handed to it. */
  if (typeof before === "function") before(w);
  w.rb = retrievalBrowseOf({ sql: st.sql, membership, host, ...w.host_reads, ...deps });
  let k = 0;
  const snap = () => `k${++k}`;
  Object.assign(w, {
    /** Registers a selection `selectionRead` answers: `ids` the bundles it holds, `owner` the credential that made it. */
    selection(handle, { owner, ids }) { w.selections.set(handle, { owner, ids }); return handle; },
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
    /** A reading row for a capture. */
    reading(capSha, bundleId) {
      st.sql.exec(`INSERT INTO readings (capture_sha, bundle_id, reading, at) VALUES (?,?,?,?)`, capSha, bundleId, "{}", T0);
    },
    /** One indexed unit of a capture's text, as extraction's index writes it. */
    unit(capSha, bundleId, seq, text, extent = { kind: "pdf-page", page: seq }, kind = null) {
      const ex = JSON.stringify(extent);
      st.sql.exec(`INSERT INTO capture_text (capture_sha, bundle_id, extent_kind, extent, ref, seq, text, truncated, chain_kind, kind)
                   VALUES (?,?,?,?,?,?,?,0,'layer',?)`, capSha, bundleId, extent.kind, ex, `p${seq}`, seq, text, kind);
    },
  });
  return w;
}
