/* Test doubles for the two modules promotion uses, each implementing the Provides it builds against
 * (`build/requirements/record-core.md`, `membership.md`, and the record reads of this job's Q2), over an in-memory
 * SQLite database so a refused promotion can be shown to leave the store byte-identical (R2). Also: documents. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { promotionOf } from "../../../src/promotion/index.mjs";

export const sha = (s) => createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");
export const EMPTY = sha("");

/** record-core, as its Provides state it: transact rolls back every row on a throw or an `ok:false` answer. */
export function makeRecord() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, group_id TEXT NOT NULL, title TEXT,
      current_state TEXT NOT NULL, prior_state TEXT, created TEXT NOT NULL, last_updated TEXT NOT NULL, criticality TEXT,
      bundle_sha TEXT NOT NULL, row_version INTEGER NOT NULL);
    CREATE TABLE files (bundle_id TEXT, path TEXT NOT NULL, content TEXT, blob_sha TEXT, bytes INTEGER NOT NULL,
      sha256 TEXT NOT NULL, PRIMARY KEY (bundle_id, path));
    CREATE TABLE history (bundle_id TEXT, snap_key TEXT NOT NULL, path TEXT, content TEXT, blob_sha TEXT, sha256 TEXT,
      created TEXT, PRIMARY KEY (bundle_id, snap_key, path));
    CREATE TABLE manifest (bundle_id TEXT, snap_key TEXT NOT NULL, kind TEXT, base TEXT, author TEXT, created TEXT,
      files_json TEXT, writer TEXT, operation TEXT, PRIMARY KEY (bundle_id, snap_key));
    CREATE TABLE minted_ids (id TEXT PRIMARY KEY);
    CREATE TABLE side (k TEXT PRIMARY KEY, v TEXT);`);
  let depth = 0;
  const one = (q, ...a) => db.prepare(q).get(...a) ?? null;
  const rows = (q, ...a) => db.prepare(q).all(...a);
  const record = {
    db, one, rows,
    transact(fn) {
      const sp = `sp${depth}`;
      db.exec(depth === 0 ? "BEGIN" : `SAVEPOINT ${sp}`);
      depth++;
      let out;
      try { out = fn(); }
      catch (e) { depth--; db.exec(depth === 0 ? "ROLLBACK" : `ROLLBACK TO ${sp}; RELEASE ${sp}`); throw e; }
      depth--;
      if (out && out.ok === false) db.exec(depth === 0 ? "ROLLBACK" : `ROLLBACK TO ${sp}; RELEASE ${sp}`);
      else db.exec(depth === 0 ? "COMMIT" : `RELEASE ${sp}`);
      return out;
    },
    head(id) {
      const r = one(`SELECT * FROM bundles WHERE bundle_id=?`, id);
      return r ? { bundleSha: r.bundle_sha, rowVersion: r.row_version, type: r.object_type, title: r.title,
                   currentState: r.current_state, priorState: r.prior_state, groupId: r.group_id,
                   created: r.created, lastUpdated: r.last_updated } : null;
    },
    manifestEntry(id, key) {
      const r = one(`SELECT * FROM manifest WHERE bundle_id=? AND snap_key=?`, id, String(key));
      return r ? { kind: r.kind, base: r.base, author: r.author, created: r.created, writer: r.writer,
                   operation: r.operation, files: JSON.parse(r.files_json) } : null;
    },
    livePaths: (id) => rows(`SELECT path FROM files WHERE bundle_id=?`, id).map((r) => r.path),
    readFile(id, path) {
      const r = one(`SELECT * FROM files WHERE bundle_id=? AND path=?`, id, path);
      if (!r) return null;
      return r.content !== null ? { text: r.content, sha256: r.sha256 } : { blobSha: r.blob_sha, bytes: r.bytes, sha256: r.sha256 };
    },
    bundleInfo(id) {
      const r = one(`SELECT * FROM bundles WHERE bundle_id=?`, id);
      return r ? { id: r.bundle_id, type: r.object_type, title: r.title, project: null } : null;
    },
    listByType({ type, after = null, limit = 200 }) {
      const ids = rows(`SELECT bundle_id FROM bundles WHERE object_type=? AND bundle_id>? ORDER BY bundle_id LIMIT ?`,
                       type, after ?? "", limit).map((r) => r.bundle_id);
      return { ids, cursor: ids.length ? ids[ids.length - 1] : null };
    },
    mintOpaqueId(prefix, year, tail, taken) {
      for (let i = 0; i < 64; i++) {
        const id = `${prefix}-${year}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}${tail}`;
        if (taken(id) || one(`SELECT id FROM minted_ids WHERE id=?`, id)) continue;
        db.prepare(`INSERT INTO minted_ids (id) VALUES (?)`).run(id);
        return id;
      }
      return null;
    },
    commits: 0,
    commit({ bundleId, type, title, snapKey, kind, base, author, writer, operation, files, state, priorState, group,
             created, lastUpdated, criticality, at }) {
      record.commits++;
      const key = String(snapKey);
      if (one(`SELECT 1 AS x FROM bundles WHERE bundle_id=?`, bundleId))
        for (const r of rows(`SELECT * FROM files WHERE bundle_id=?`, bundleId))
          db.prepare(`INSERT INTO history VALUES (?,?,?,?,?,?,?)`).run(bundleId, key, r.path, r.content, r.blob_sha, r.sha256, at);
      db.prepare(`INSERT INTO manifest VALUES (?,?,?,?,?,?,?,?,?)`).run(bundleId, key, kind, base, author, at,
        JSON.stringify(files.map((f) => ({ name: f.path, sha256: f.sha256 }))), writer, operation);
      db.prepare(`DELETE FROM files WHERE bundle_id=?`).run(bundleId);
      for (const f of files)
        db.prepare(`INSERT INTO files VALUES (?,?,?,?,?,?)`).run(bundleId, f.path, f.text ?? null, f.blobSha ?? null, f.bytes, f.sha256);
      const md = files.find((f) => f.path === "bundle.md").sha256;
      db.prepare(`INSERT INTO bundles VALUES (?,?,?,?,?,?,?,?,?,?,1)
                  ON CONFLICT(bundle_id) DO UPDATE SET object_type=excluded.object_type, title=excluded.title,
                  current_state=excluded.current_state, prior_state=excluded.prior_state,
                  last_updated=excluded.last_updated, criticality=excluded.criticality, bundle_sha=excluded.bundle_sha,
                  row_version=bundles.row_version+1`)
        .run(bundleId, type, group, title ?? null, state, priorState ?? null, created, lastUpdated, criticality ?? null, md);
      const r = one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);
      return { bundleSha: r.bundle_sha, rowVersion: r.row_version };
    },
    /** Every row of every table, for "the record is exactly as it was" (R2). */
    dump() {
      return ["bundles", "files", "history", "manifest", "minted_ids", "side"]
        .map((t) => JSON.stringify(rows(`SELECT * FROM ${t} ORDER BY 1`))).join("\n");
    },
  };
  return record;
}

/** membership, as its Provides state it, with the facts a test sets. */
export function makeMembership() {
  const m = {
    hidden: new Set(), discoverable: new Set(), owners: new Map(), joined: new Map(), invited: new Map(), leaving: new Map(), created: [],
    sight(id, viewer) {
      if (!viewer) return "NONE";
      if (m.hidden.has(id)) return m.discoverable.has(id) && String(viewer).startsWith("member:") ? "EXISTENCE" : "NONE";
      return "FULL";
    },
    isProjectOwner: (p, who) => (m.owners.get(p) || []).includes(who),
    participation(p, who) {
      if (m.isProjectOwner(p, who)) return { state: "joined", owner: 1 };
      if ((m.joined.get(p) || []).includes(who)) return { state: "joined", owner: 0 };
      if ((m.invited.get(p) || []).includes(who)) return { state: "invited", owner: 0 };
      if ((m.leaving.get(p) || []).includes(who)) return { state: "leaving", owner: 0 };
      return null;
    },
    projectAuthority(p, identity, need, act) {
      if (!identity || !String(identity).startsWith("member:")) return null;
      const who = String(identity).slice(7);
      if (m.isProjectOwner(p, who) || (m.joined.get(p) || []).includes(who)) return null;
      return { ok: false, reason: "PROJECT_ACT_NOT_A_PARTICIPANT", act };
    },
    visibilitySettingRefusal: (v) => (v === "discoverable" || v === "hidden" ? null
      : { ok: false, reason: "PROJECT_VISIBILITY_UNKNOWN_SETTING" }),
    projectVisibility: ({ projectId }) => (m.discoverable.has(projectId) ? "discoverable" : "hidden"),
    projectCreated({ projectId, ownerId, visibility, by }) {
      m.created.push({ projectId, ownerId, visibility, by });
      m.owners.set(projectId, [ownerId]);
      if (visibility === "discoverable") m.discoverable.add(projectId);
    },
  };
  return m;
}

/** A fresh promotion over fresh doubles, with the facts legacy-store registers today. */
export function makePromotion({ group = "test-group", citedBy = {}, caseMember = new Set(), facts = true,
                                now = () => "2026-09-26T12:00:00.000Z" } = {}) {
  const record = makeRecord(), membership = makeMembership();
  const host = {};
  const p = promotionOf(host, { record, membership, now });
  if (facts) {
    p.registerFact("producingGroup", "legacy-store", () => group);
    p.registerFact("citedBy", "legacy-store", (id) => citedBy[id] || []);
    p.registerFact("caseMember", "legacy-store", (id) => caseMember.has(id));
  }
  return { p, record, membership };
}

/** A bundle.md with the given front-matter fields, in the catalogue's grammar, and a body. */
export function doc(fields, body = "\n## Session Log\n") {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    lines.push(`${k}: ${v === null ? "null" : typeof v === "string" && /[:#"]/.test(v) ? JSON.stringify(v) : v}`);
  }
  lines.push("---", body);
  return lines.join("\n");
}

export const T0 = "2026-07-01T00:00:00Z";
export const T1 = "2026-07-02T00:00:00Z";

/** An information item's document. */
export const infoDoc = (id, over = {}) => doc({ id, object_type: "information", title: "A report", current_state: "collected",
  prior_state: null, created: T0, last_updated: T0, group: "test-group", ...over });

/** A creation package for `id` with `text`. */
export const create = (id, text, extra = {}) => ({ bundleId: id, base: null, snapKey: "k1", author: "member:ann",
  files: [{ path: "bundle.md", text }], meta: {}, ...extra });
/** A revision of `id` over `base`. */
export const revise = (id, base, text, extra = {}) => ({ bundleId: id, base, snapKey: "k2", author: "member:ann",
  files: [{ path: "bundle.md", text }], meta: {}, ...extra });
