/* record-core — the record's storage (layer 2): id allocation, leases, the append-only history and
   manifest of every promotion, the instance's settings, the evidence store, and purge. It holds no
   member, capability or fence (membership's) and decides nothing about what may be committed
   (promotion's). Requirements: build/requirements/record-core.md (R1–R38).

   REACHED THROUGH `recordOf(ctx)`: one instance per Durable Object storage, so every module in the
   object shares one transaction depth, one purge declaration list and one evidence binding. The
   instance reads and writes only this module's own tables and the clock (R31); `purge` also clears
   the tables other modules declared to it (R21), and `seedMintLedger` reads the live rows its
   caller names. Extracted from `legacy-store` (store.mjs, schema.mjs) in T3; the reasoning the
   legacy comments carried is kept beside the code it explains. */
import { checkBundle, PROJECT_ID_CHECKS } from "../../checks/bio-checks.mjs";

export { RECORD_SCHEMA } from "./schema.mjs";

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
const REFUSED = Symbol("record-core-refusal");
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const te = new TextEncoder();

const instances = new WeakMap();

/** The one RecordCore for this object's storage. `ctx` is the Durable Object state (anything with
 *  `storage.sql` and `storage.transactionSync`). `opts` is read on the first call only:
 *  `evidence` — the instance's evidence bucket (R2) or null; `storeName` — the namespace this object
 *  is, or a function answering it, which prefixes every evidence key. */
export function recordOf(ctx, opts = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let rc = instances.get(storage);
  if (!rc) { rc = new RecordCore(storage, opts); instances.set(storage, rc); }
  return rc;
}

export class RecordCore {
  /** R3/R27, C-59.5 (Membership v2 §7, "A MINTED ID CARRIES NO COUNT"): THE PREFIXES WHOSE OBJECTS A READ
   *  WITHHOLDS FROM SOME CALLER. Their ids are minted opaque by the act that creates them and never from
   *  `allocId`'s counter, because a counted suffix tells its reader how many were minted before, hidden
   *  ones included: PROJ (a project out of sight), CASE (an unratified case), DRAFT (a draft), RVG (a
   *  review grant), TASK (a task naming a bundle the viewer cannot see). */
  static GATED_ID_PREFIXES = Object.freeze(["PROJ", "CASE", "DRAFT", "RVG", "TASK"]);

  /** D-432: the gated prefixes whose mint passes NO tail, so an id the counter issued for them before
   *  REC-151 (`seq`'s `<P>-<year>` scope, 0001 up to next-1) is exactly an id the opaque minter can draw;
   *  `seedMintLedger` records that range. PROJ and TASK carry a slug the counter never recorded. */
  static UNTAILED_GATED_PREFIXES = Object.freeze(["CASE", "DRAFT", "RVG"]);

  /** This module's own tables, declared to purge by it (R21), and those purge never clears (R23). */
  static OWN_TABLES = Object.freeze(["files", "history", "manifest", "leases", "bundles"]);
  static EXEMPT_TABLES = Object.freeze(["seq", "minted_ids", "settings"]);

  #storage; #sql; #depth = 0; #declared = new Map(); #order = []; #evidence; #storeName;

  constructor(storage, { evidence = null, storeName = null } = {}) {
    this.#storage = storage;
    this.#sql = storage.sql;
    this.#evidence = evidence && typeof evidence.get === "function" ? evidence : null;
    this.#storeName = storeName;
    this.declarePurge("record-core", ["files", "history", "manifest", "leases",
      { name: "bundles", last: true }], {});
    this.declarePurge("record-core", [], { exempt: RecordCore.EXEMPT_TABLES });
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /** Additive columns this module's tables gained after a store was first written. Called by the
   *  store after its schema pass; idempotent. */
  migrate() {
    const cols = this.#rows(`PRAGMA table_info(bundles)`).map((r) => r.name);
    if (cols.length && !cols.includes("project")) this.#sql.exec(`ALTER TABLE bundles ADD COLUMN project TEXT`);
    this.#sql.exec(`CREATE INDEX IF NOT EXISTS bundles_project ON bundles(project, bundle_id)`);
  }

  /* ---- transactions (R32) ---- */

  /** Runs `fn` as one transaction over the whole store. A throw, or a returned refusal (`ok:false`),
   *  rolls back every row written inside it, in any module's tables; a refusal is then returned, a
   *  throw rethrown. A call made inside another joins it, so the outermost act decides. */
  transact(fn) {
    if (this.#depth > 0) return fn();
    let result;
    this.#depth++;
    try {
      return this.#storage.transactionSync(() => {
        result = fn();
        if (result && typeof result === "object" && result.ok === false) throw REFUSED;
        return result;
      });
    } catch (e) {
      if (e === REFUSED) return result;
      throw e;
    } finally {
      this.#depth--;
    }
  }

  /* ---- ids (R1–R9) ---- */

  /** R1, R2: `<prefix>-<year>-NNNN`, the scope's next number; the same step inside a caller's
   *  transaction as on its own, because it joins the caller's. */
  allocId(prefix, year) {
    return this.transact(() => this.#nextSeq(prefix, year));
  }

  #nextSeq(prefix, year) {
    const scope = `${prefix}-${year}`;
    const cur = this.#one(`SELECT next FROM seq WHERE scope=?`, scope);
    const n = cur ? cur.next : 1;
    this.#sql.exec(`INSERT INTO seq (scope,next) VALUES (?,?) ON CONFLICT(scope) DO UPDATE SET next=?`, scope, n + 1, n + 1);
    return { id: `${prefix}-${year}-${String(n).padStart(4, "0")}` };
  }

  /** R3–R5, REC-151 / C-59.5: the door a CALLER allocates through. Gating is decided on the counter's
   *  SCOPE (`<prefix>-<year>`), so moving the dash into the prefix cannot reach a gated counter, and a
   *  prefix that merely begins with a gated one's letters (`PROJECTX`) keys a different scope. The
   *  refusal echoes only what the caller sent. */
  allocIdOp(prefix, year) {
    const scope = `${prefix}-${year}`;
    const gated = RecordCore.GATED_ID_PREFIXES.find((g) => scope.startsWith(`${g}-`));
    if (gated) {
      const row = PROJECT_ID_CHECKS.ALLOCID_PREFIX_GATED;
      return { ok: false, reason: "ALLOCID_PREFIX_GATED", code: "ALLOCID_PREFIX_GATED", check: row.check,
               translation: row.translation,
               detail: `${gated}- ids are minted by the plane, opaque, by the act that creates the object; op=allocid `
                     + `allocates only a prefix whose objects every caller may see. Nothing was allocated.` };
    }
    return this.allocId(prefix, year);
  }

  /** R6–R9, REC-151 / D-432: THE ONE OPAQUE MINTER. `<prefix>-<year>-<rand><tail>`, `<rand>` four digits
   *  from the CSPRNG, rejection-sampled so 0000–9999 are equally likely; the counter is not read or
   *  stepped. Each draw is asked of the caller's `taken(id)` and of the minter's own ledger
   *  (`minted_ids`), so an id that has existed is never drawn again, purge or not. The id is recorded
   *  BEFORE it is returned, in whatever transaction the caller holds and never one of its own, so an act
   *  that rolls back takes its id back with it. The INSERT is plain, into the ledger's primary key: were
   *  the read above it ever lost, the act fails loudly rather than handing a spent id out. Null only
   *  when 64 draws in a row collide. The ledger is read by no route and never counted or listed. */
  mintOpaqueId(prefix, year, tail = "", taken = () => false) {
    const draw = () => {
      const u = new Uint16Array(1);
      for (;;) { crypto.getRandomValues(u); if (u[0] < 60000) return String(u[0] % 10000).padStart(4, "0"); }
    };
    const spent = (id) => !!this.#one(`SELECT 1 AS x FROM minted_ids WHERE id=?`, id) || !!taken(id);
    for (let i = 0; i < 64; i++) {
      const id = `${prefix}-${year}-${draw()}${tail ?? ""}`;
      if (spent(id)) continue;
      this.#sql.exec(`INSERT INTO minted_ids (id,recorded_at,source) VALUES (?,?,'mint')`, id, new Date().toISOString());
      return id;
    }
    return null;
  }

  /** D-432: WHERE THE LEDGER LEARNS THE IDS NO MINT RECORDED, at every boot, idempotently.
   *  LIVE: every live row of a gated kind, from the `[prefix, table, column]` sources the caller names
   *  (the tables each mint site's `taken` reads; their owners declare them). COUNTER: for a prefix
   *  whose mint passes no tail, every id `seq` says the counter issued before REC-151, used or not,
   *  capped at 9,999. Rows already recorded are left as they are. One statement per source and one
   *  for the counter, each doing its work inside SQLite. */
  seedMintLedger(sources = []) {
    const at = new Date().toISOString();
    for (const [prefix, table, column] of sources) {
      if (!IDENT.test(String(table)) || !IDENT.test(String(column))) continue;
      this.#sql.exec(`INSERT OR IGNORE INTO minted_ids (id,recorded_at,source)
                      SELECT DISTINCT ${column}, ?, 'live' FROM ${table} WHERE ${column} GLOB ?`, at, `${prefix}-*`);
    }
    const scopes = RecordCore.UNTAILED_GATED_PREFIXES.map((p) => `${p}-[0-9][0-9][0-9][0-9]`);
    const inScope = (col) => scopes.map(() => `${col} GLOB ?`).join(" OR ");
    this.#sql.exec(`INSERT OR IGNORE INTO minted_ids (id,recorded_at,source)
                    WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n
                      WHERE i < (SELECT MIN(9999, COALESCE(MAX(next), 1) - 1) FROM seq WHERE ${inScope("scope")}))
                    SELECT s.scope || '-' || printf('%04d', n.i), ?, 'counter'
                      FROM seq s JOIN n ON n.i < s.next WHERE ${inScope("s.scope")}`,
                   ...scopes, at, ...scopes);
  }

  /* ---- leases (R10–R12) ---- */

  /** D-61: a lease is NEVER anonymous. It is a courtesy lock; promotion's CAS on `base` is the
   *  integrity mechanism, so the lease hands back the bundle's CURRENT digest as the edit base. */
  acquireLease(bundleId, actor, ttlMs) {
    if (typeof actor !== "string" || !actor.trim())
      return { ok: false, reason: "ANONYMOUS_LEASE",
               detail: "a lease is taken under a named actor — a member (from a session) or a machine "
                     + "identity (token:<class>). An unnamed writer cannot hold the courtesy lock." };
    return this.transact(() => {
      const now = Date.now();
      const cur = this.#one(`SELECT actor, expires FROM leases WHERE bundle_id=?`, bundleId);
      if (cur && cur.actor !== actor && Date.parse(cur.expires) > now)
        return { ok: false, heldBy: cur.actor, until: cur.expires };
      const b = this.#one(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, bundleId);
      const ttl = Number(ttlMs) || 0;
      const expires = new Date(now + ttl).toISOString();
      this.#sql.exec(
        `INSERT INTO leases (bundle_id,actor,acquired,expires,base_sha) VALUES (?,?,?,?,?)
         ON CONFLICT(bundle_id) DO UPDATE SET actor=excluded.actor, acquired=excluded.acquired, expires=excluded.expires, base_sha=excluded.base_sha`,
        bundleId, actor, new Date(now).toISOString(), expires, b ? b.bundle_sha : "");
      return { ok: true, actor, expires, base: b ? b.bundle_sha : null };
    });
  }

  /* ---- reads (R13–R17, R34–R36) ---- */

  /** R13, R14: a live file, inline text or its blob reference (never the bytes). */
  readFile(bundleId, path) {
    const r = this.#one(`SELECT content, blob_sha, bytes, sha256 FROM files WHERE bundle_id=? AND path=?`, bundleId, path);
    if (!r) return null;
    return r.content !== null ? { text: r.content, sha256: r.sha256 } : { blobSha: r.blob_sha, bytes: r.bytes, sha256: r.sha256 };
  }

  /** R15's fixed derivation: the key goes in the FILENAME, not a directory — `bundle.md` archived under
   *  K is `_history/bundle_K.md`, `data/changes.json` is `_history/data/changes_K.json` — because the
   *  check catalogue parses exactly this shape (C-12.2). */
  static snapPath(path, snapKey) {
    const cut = path.lastIndexOf("/");
    const dir = cut === -1 ? "" : path.slice(0, cut + 1);
    const name = cut === -1 ? path : path.slice(cut + 1);
    const dot = name.lastIndexOf(".");
    return dot === -1
      ? `_history/${dir}${name}_${snapKey}`
      : `_history/${dir}${name.slice(0, dot)}_${snapKey}${name.slice(dot)}`;
  }

  /** R15–R17: the byte-complete image the gate consumes, from this module's tables alone: every live
   *  file (a blob as its reference, carrying its size, so a partial writer can hand it back unchanged);
   *  every snapshot at its canonical path; a verbatim promotion record per manifest entry (C-20.1 reads
   *  the writer and operation from it, classifyDivergence rebuilds the hash chain from its per-file
   *  digests); and the manifest itself, its entries in WRITE ORDER (D-674, State Rules I-20: "prior"
   *  is write order, never the caller-chosen snap key, whose lexical order is not a clock). */
  readImage(bundleId) {
    const img = {};
    for (const r of this.#sql.exec(`SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=?`, bundleId))
      img[r.path] = r.content !== null ? r.content
        : { blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes };
    const snapFiles = new Map();
    for (const r of this.#sql.exec(`SELECT snap_key, path, content, blob_sha, sha256 FROM history WHERE bundle_id=?`, bundleId)) {
      img[RecordCore.snapPath(r.path, r.snap_key)] =
        r.content !== null ? r.content : { blobSha: r.blob_sha, sha256: r.sha256 };
      if (!snapFiles.has(r.snap_key)) snapFiles.set(r.snap_key, []);
      snapFiles.get(r.snap_key).push({ name: r.path, sha256: r.sha256 });
    }
    const entries = [];
    for (const r of this.#sql.exec(
      `SELECT snap_key, kind, base, author, created, files_json, writer, operation FROM manifest
        WHERE bundle_id=? ORDER BY rowid`, bundleId)) {
      let written;
      try { written = JSON.parse(r.files_json); } catch { written = []; }
      if (!Array.isArray(written)) written = [];
      const writtenPairs = written.map((f) => typeof f === "string" ? { name: f, sha256: null } : f);
      const files = writtenPairs.map((f) => f.name);
      const snapshotted = (snapFiles.get(r.snap_key) || []).map((f) => f.name);
      entries.push({ key: r.snap_key, kind: r.kind, base: r.base, author: r.author,
                     created: r.created, files, snapshotted,
                     ...(r.writer ? { writer: r.writer, operation: r.operation } : {}) });
      img[`_history/promotion_${r.snap_key}.json`] = JSON.stringify({
        target: bundleId, base: r.base, files: writtenPairs,
        created: r.created, author: r.author, skill_version: "bio-plane",
        ...(r.writer ? { writer: r.writer, operation: r.operation } : {}),
      }, null, 2);
    }
    if (entries.length) img["_history/manifest.json"] = JSON.stringify({ entries }, null, 2);
    return Object.keys(img).length ? img : null;
  }

  /** R34 */
  bundleInfo(bundleId) {
    const r = this.#one(`SELECT bundle_id, object_type, title, project FROM bundles WHERE bundle_id=?`, bundleId);
    return r ? { id: r.bundle_id, type: r.object_type, title: r.title ?? null, project: r.project ?? null } : null;
  }

  static #bound(limit) { return Math.max(1, Math.min(1000, Math.trunc(Number(limit)) || 200)); }

  /** R35 */
  listBundles({ project = null, after = "", limit = 200 } = {}) {
    const cap = RecordCore.#bound(limit);
    const ids = (project == null
      ? this.#rows(`SELECT bundle_id FROM bundles WHERE bundle_id > ? ORDER BY bundle_id LIMIT ?`, String(after ?? ""), cap)
      : this.#rows(`SELECT bundle_id FROM bundles WHERE project = ? AND bundle_id > ? ORDER BY bundle_id LIMIT ?`,
                   String(project), String(after ?? ""), cap)).map((r) => r.bundle_id);
    return { ids, cursor: ids.length ? ids[ids.length - 1] : null };
  }

  /** R36 */
  listByType({ type, after = "", limit = 200 } = {}) {
    const cap = RecordCore.#bound(limit);
    const ids = this.#rows(`SELECT bundle_id FROM bundles WHERE object_type = ? AND bundle_id > ? ORDER BY bundle_id LIMIT ?`,
                           String(type ?? ""), String(after ?? ""), cap).map((r) => r.bundle_id);
    return { ids, cursor: ids.length ? ids[ids.length - 1] : null };
  }

  /* ---- the write path (R33) ---- */

  /** R33: the one write into this module's tables, called inside `transact` by `promotion`, which alone
   *  decides what may be committed. Every live file the commit replaces is copied into `history` under
   *  `snapKey`; the new live files are written; the bundle's row is set; exactly one `manifest` entry is
   *  appended, `created` being this module's own clock (D-674). Nothing already in `history` or
   *  `manifest` is modified or removed (R29): a snap key already used for the bundle fails the
   *  append loudly (their primary keys) rather than rewriting it. `columns` optionally sets further
   *  columns of the bundle's row that the caller's module owns (state, group, times). */
  commit({ bundleId, type, title = null, project = null, snapKey, kind = "promotion", base = null, author = null,
           writer = null, operation = null, files = [], columns = {} }) {
    return this.transact(() => {
      const now = new Date().toISOString();
      const cur = this.#one(`SELECT row_version FROM bundles WHERE bundle_id=?`, bundleId);
      if (cur)
        for (const r of this.#rows(`SELECT path, content, blob_sha, sha256 FROM files WHERE bundle_id=?`, bundleId))
          this.#sql.exec(
            `INSERT INTO history (bundle_id,snap_key,path,content,blob_sha,sha256,created) VALUES (?,?,?,?,?,?,?)`,
            bundleId, snapKey, r.path, r.content, r.blob_sha, r.sha256, now);
      this.#sql.exec(
        `INSERT INTO manifest (bundle_id,snap_key,kind,base,author,created,files_json,writer,operation) VALUES (?,?,?,?,?,?,?,?,?)`,
        bundleId, snapKey, kind, base, author, now,
        JSON.stringify(files.map((f) => ({ name: f.path, sha256: f.sha256 }))), writer, operation);
      this.#sql.exec(`DELETE FROM files WHERE bundle_id=?`, bundleId);
      for (const f of files)
        this.#sql.exec(
          `INSERT INTO files (bundle_id,path,content,blob_sha,bytes,sha256) VALUES (?,?,?,?,?,?)`,
          bundleId, f.path, f.text ?? null, f.blobSha ?? null,
          f.bytes ?? (typeof f.text === "string" ? te.encode(f.text).length : 0), f.sha256);
      const bundleSha = (files.find((f) => f.path === "bundle.md") || files[0] || {}).sha256 ?? "";
      const known = new Set(this.#rows(`PRAGMA table_info(bundles)`).map((r) => r.name));
      const fixed = new Set(["bundle_id", "object_type", "title", "project", "bundle_sha", "row_version"]);
      const extra = Object.entries(columns || {}).filter(([k]) => IDENT.test(k) && known.has(k) && !fixed.has(k));
      const val = (k, d) => { const e = extra.find(([x]) => x === k); return e ? e[1] : d; };
      const firstRow = ["group_id", "current_state", "created", "last_updated"];
      const rest = cur ? extra : extra.filter(([k]) => !firstRow.includes(k));
      if (cur)
        this.#sql.exec(
          `UPDATE bundles SET object_type=?, title=?, project=?, bundle_sha=?, last_updated=?, row_version=row_version+1
            WHERE bundle_id=?`, type, title, project, bundleSha, val("last_updated", now), bundleId);
      else
        this.#sql.exec(
          `INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,created,last_updated,bundle_sha,row_version,project)
           VALUES (?,?,?,?,?,?,?,?,1,?)`,
          bundleId, type, val("group_id", ""), title, val("current_state", ""), val("created", now),
          val("last_updated", now), bundleSha, project);
      if (rest.length)
        this.#sql.exec(`UPDATE bundles SET ${rest.map(([k]) => `${k}=?`).join(", ")} WHERE bundle_id=?`,
                       ...rest.map(([, v]) => v), bundleId);
      const after = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);
      return { bundleSha: after.bundle_sha, rowVersion: after.row_version };
    });
  }

  /* ---- the audit sweep (R18–R20) ---- */

  /** R18–R20: the check catalogue over a bounded page of bundles in id order after `after`, run WHERE
   *  THE DATA IS (one network round trip per image was ~97% of an outside pass's cost). `known`, what a
   *  reference resolves against, is the WHOLE corpus and never leaves this method: filtering it would
   *  manufacture dangling-reference findings out of a viewer's position (REC-30). What is gated is what
   *  leaves: the page holds only bundles `visible(id)` admits. `context(id)` adds the caller's further
   *  checkBundle options for a bundle (the earned and published registries later modules build).
   *  Blob-backed files are declared elided: existence assertions see them, byte checks skip them. */
  async auditPass({ after = "", limit = 200, visible = null, context = null } = {}) {
    const cap = RecordCore.#bound(limit);
    const known = new Set(this.#rows(`SELECT bundle_id FROM bundles`).map((r) => r.bundle_id));
    const page = [];
    for (const r of this.#rows(`SELECT bundle_id FROM bundles WHERE bundle_id > ? ORDER BY bundle_id`, String(after ?? ""))) {
      if (typeof visible === "function" && !visible(r.bundle_id)) continue;
      page.push(r.bundle_id);
      if (page.length >= cap) break;
    }
    const sha256 = async (v) => hex(await crypto.subtle.digest("SHA-256", typeof v === "string" ? te.encode(v) : v));
    const sha512 = async (b) => new Uint8Array(await crypto.subtle.digest("SHA-512", b));
    /* REC-56 / D-206: `tally` is keyed by check id and `tallyDetail` by `<check>/<code>`, because one
       check can report different facts; `tallyDetail` is absent when nothing on the page carried a code. */
    const tally = {}; const tallyDetail = {}; const offenders = [];
    let clean = 0, withErrors = 0;
    for (const id of page) {
      const img = this.readImage(id) || {};
      const files = new Map(), elided = new Set();
      for (const [path, v] of Object.entries(img)) {
        if (typeof v === "string") files.set(path, v); else elided.add(path);
      }
      const { findings } = await checkBundle({
        folderName: id, files, elidedPaths: elided,
        sha256, sha512, resolveTarget: (t) => known.has(t),
        ...(typeof context === "function" ? (context(id) || {}) : {}),
      });
      const errs = findings.filter((f) => f.severity === "error");
      if (!errs.length) { clean++; continue; }
      withErrors++;
      for (const e of errs) {
        tally[e.check] = (tally[e.check] || 0) + 1;
        if (e.code) { const k = `${e.check}/${e.code}`; tallyDetail[k] = (tallyDetail[k] || 0) + 1; }
      }
      /* Bounded: the tally says how much, these say what it looks like. */
      if (offenders.length < 20)
        offenders.push({ bundleId: id, errors: errs.slice(0, 5).map((e) => ({ check: e.check, detail: e.message })) });
    }
    const last = page.length ? page[page.length - 1] : after;
    return { ok: true, checked: page.length, clean, withErrors, tally,
             ...(Object.keys(tallyDetail).length ? { tallyDetail } : {}),
             offenders, limit: cap, cursor: page.length === cap ? last : null, page };
  }

  /* ---- purge (R21–R24) ---- */

  /** R21: a module declares the tables it owns, once, at start. An entry is a table name, keyed to a
   *  bundle by `bundle_id`, or `{name, bundle, whole}`: `bundle` the condition (each `?` bound to the
   *  bundle id) selecting a bundle's rows, or null when only the whole-store form clears the table;
   *  `whole` a condition limiting what the whole-store form clears. `exempt` names tables purge never
   *  clears. A table declared twice, or by two modules, is refused. */
  declarePurge(module, tables = [], { exempt = [] } = {}) {
    const entries = [...tables.map((t) => (typeof t === "string" ? { name: t } : { ...t })),
                     ...exempt.map((name) => ({ name, exempt: true }))];
    for (const e of entries) {
      if (!IDENT.test(String(e.name)))
        return { ok: false, reason: "TABLE_NAME_INVALID", table: String(e.name), module };
      if (this.#declared.has(e.name))
        return { ok: false, reason: "TABLE_DECLARED", table: e.name, module, declaredBy: this.#declared.get(e.name).module };
    }
    for (const e of entries) {
      const d = { module, name: e.name, exempt: !!e.exempt, last: !!e.last,
                  bundle: e.bundle === undefined ? "bundle_id=?" : e.bundle, whole: e.whole || null };
      this.#declared.set(e.name, d);
      this.#order.push(d);
    }
    return { ok: true };
  }

  /** R22–R24: whole-store (no `bundleId`) or one bundle's rows, from every declared non-exempt table,
   *  in declaration order and this module's `bundles` last, in one transaction. `seq`, `minted_ids` and
   *  `settings` are exempt in both forms, on the counter's reasoning: an id once allocated or minted is
   *  never reissued, and a purge that reset them would make identifiers ambiguous across it. An
   *  undeclared table is never touched. Evidence objects are untouched (content-addressed, immutable). */
  purge({ bundleId = null } = {}) {
    const one = bundleId != null && bundleId !== "";
    const plan = [...this.#order.filter((d) => !d.exempt && !d.last), ...this.#order.filter((d) => !d.exempt && d.last)];
    const removed = {};
    this.transact(() => {
      for (const d of plan) {
        removed[d.name] = 0;
        let where, args = [];
        if (one) {
          if (!d.bundle) continue;
          where = d.bundle; args = Array.from({ length: (d.bundle.match(/\?/g) || []).length }, () => bundleId);
        } else where = d.whole || "1=1";
        const n = this.#one(`SELECT COUNT(*) AS n FROM ${d.name} WHERE ${where}`, ...args);
        removed[d.name] = n ? Number(n.n) : 0;
        if (removed[d.name]) this.#sql.exec(`DELETE FROM ${d.name} WHERE ${where}`, ...args);
      }
    });
    return { ok: true, scope: one ? bundleId : "ALL", removed };
  }

  /* ---- settings (R25, R26) ---- */

  /** R25: the value last set under `name`, or null. */
  getSetting(name) {
    const r = this.#one(`SELECT value FROM settings WHERE name=? ORDER BY rowid DESC LIMIT 1`, String(name ?? ""));
    if (!r) return null;
    try { return JSON.parse(r.value); } catch { return null; }
  }

  /** R25, R26: records `value` under `name`, with who set it and when. `jurisdiction_profiles` is an
   *  ordered list of profile ids (non-empty strings, no repeats); anything else is refused and nothing
   *  is recorded. */
  setSetting(name, value, by) {
    const n = String(name ?? "");
    if (!n) return { ok: false, reason: "SETTING_NAME_REQUIRED" };
    if (typeof by !== "string" || !by.trim()) return { ok: false, reason: "SETTING_BY_REQUIRED" };
    if (value === undefined) return { ok: false, reason: "SETTING_VALUE_REQUIRED" };
    if (n === "jurisdiction_profiles"
        && !(Array.isArray(value) && value.every((v) => typeof v === "string" && v.trim() !== "")
             && new Set(value).size === value.length))
      return { ok: false, reason: "SETTING_INVALID", name: n,
               detail: "jurisdiction_profiles is an ordered list of distinct profile ids" };
    this.#sql.exec(`INSERT INTO settings (name,value,set_by,set_at) VALUES (?,?,?,?)`,
                   n, JSON.stringify(value), by, new Date().toISOString());
    return { ok: true };
  }

  /* ---- the evidence store (R38) ---- */

  /** R38: the instance's evidence bucket, addressed by digest; the object key of a digest is fixed
   *  here (`<store>/captures/<digest>`). `put` hands the bucket the digest, so it verifies the bytes.
   *  Null when no bucket is bound. */
  evidenceStore() {
    const bucket = this.#evidence;
    if (!bucket) return null;
    const name = typeof this.#storeName === "function" ? this.#storeName() : this.#storeName;
    const key = (digest) => `${name || "bio"}/captures/${String(digest)}`;
    return {
      head: (digest) => bucket.head(key(digest)),
      get: (digest) => bucket.get(key(digest)),
      put: (digest, bytes) => bucket.put(key(digest), bytes, { sha256: String(digest) }),
    };
  }
}
