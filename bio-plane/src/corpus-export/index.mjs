/* corpus-export — the verified working-corpus export (requirements: `build/requirements/corpus-export.md`; Membership v2
 * §8.1 and §8's "What verified must mean"). A group that cannot leave can be held: this module exports the working
 * corpus verifiably (R1), records every export in an append-only log every administrator can read (R2, R4), and
 * verifies an import of an export, trusting nothing the export asserts (R3). It names no place (R5).
 *
 * Split from `publication` by copy (K617, K624 (1), K1024; seam map `build/extraction/corpus-export.md`): the export's
 * constants, the "section 8" comment with `exportManifest` and `exportLog`, and the `export_log` table (`./schema.mjs`),
 * with their comments. `publication`'s job deletes its copy and creates this module. The verifying import (R3) is new
 * here. Its route arms `export` and `exportlog` are `corpusExportOps` (R6; N483, K1122), moved from publication's ops
 * map; which credential reaches each op is op-declarations' and control-plane's, never this map's.
 *
 * REACHED as `corpusExportOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the
 * first call with `deps`, returned to every later caller. At creation it creates `export_log` and declares it to
 * record-core's purge as exempt (R4).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record   record-core: `declarePurge` (R4).
 *   now      the clock for the instants it writes, an ISO string (default: the wall clock).
 *
 * READ CONTRACTS it joins in its own SQL (R1): record-core's `bundles`, `files`, `history` and `manifest`, provenance's
 * `register` and connections' `refs`. */

import { recordOf } from "../record-core/index.mjs";
import { entitiesOf } from "../entities/index.mjs";
import { eventsOf } from "../events/index.mjs";
import { linesOf } from "../lines/index.mjs";
import { moneyOf } from "../money/index.mjs";
import { createSha256, sha256HexSync } from "../record-grammar/index.mjs";
import { CORPUS_EXPORT_EXEMPT, migrateCorpusExport } from "./schema.mjs";
import { TablePager, tableEntry, pageBytes, canonical, PAGE_ROWS, PAGE_BYTES } from "./tables.mjs";
import { render, itemsOf, FORMATS, STANDARDS } from "./render.mjs";

export { CORPUS_EXPORT_SCHEMA, CORPUS_EXPORT_EXEMPT } from "./schema.mjs";
export { PAGE_ROWS, PAGE_BYTES, canonical, pageBytes } from "./tables.mjs";
export { FORMATS, STANDARDS, RENDER_MAX } from "./render.mjs";

/* REC-57: `op=exportlog` read the append-only export log at a literal `LIMIT 200` with no parameter and no published
   bound — on the one op whose whole sentence is a completeness claim to administrators (R19). */
export const EXPORT_LOG_LIMIT_DEFAULT = 200;
export const EXPORT_LOG_LIMIT_MAX = 1000;
/** R18: the longest note an export's log row keeps. */
export const EXPORT_NOTE_MAX = 280;

/* R3: what a promotion that replaced nothing names as its base (promotion's creation entry; record-core R57). */
const CREATION_BASE = sha256HexSync("");
const HEX64 = /^[0-9a-f]{64}$/;
const te = new TextEncoder();

export class CorpusExport {
  constructor({ storage, record, now = null, entities = null, events = null, lines = null, money = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    /* R10's owners: each an instance, or a function answering it on first use. */
    this.owners = { entities, events, lines, money };
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
    this.purgeDeclaration = null;
  }

  migrate() { migrateCorpusExport(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #when() { const w = this.now(); return typeof w === "string" && w ? w : new Date().toISOString(); }

  /* ---- section 8: secure verified export ----
   *
   * Export is the only real answer to a captured root of trust, because a group
   * that cannot leave is a group that can be held. It is also exactly the
   * capability an attacker wants most: a full working-corpus export is the
   * group's entire unpublished position, so if ANY administrator could take it,
   * one captured administrator exfiltrates everything and the feature becomes
   * the most efficient attack in the system.
   *
   * WHO MAY RUN IT is enforced in the control plane, not here, because that is
   * where the credential class is known. The rule is sharper than "an
   * administrator": section 8.1 says the ADMIN_TOKEN-class credential, which a
   * SESSION belonging to an administrator does not satisfy. A session is
   * password-derived; the root of trust is the token set in the hosting
   * dashboard. A stolen password must not reach this, and neither does the
   * founder's own signed-in browser.
   *
   * WHAT "VERIFIED" MEANS: the export carries its own manifest, every file
   * hashed on the way out, so the receiving side can re-derive everything and
   * trust nothing the sender asserts. */
  exportManifest({ note = null } = {}) {
    const bundles = this.#rows(
      `SELECT bundle_id, object_type, title, current_state, bundle_sha, row_version, created, last_updated
       FROM bundles ORDER BY bundle_id`);
    let fileCount = 0;
    const hasRefs = this.#rows(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='refs'`).length > 0;
    const out = bundles.map((b) => {
      const files = this.#rows(
        `SELECT path, sha256, bytes, blob_sha, (content IS NOT NULL) AS inline
         FROM files WHERE bundle_id=? ORDER BY path`, b.bundle_id);
      fileCount += files.length;
      return { ...b,
        files: files.map((f) => ({ path: f.path, sha256: f.sha256, bytes: f.bytes,
                                   blobSha: f.blob_sha ?? null, inline: !!f.inline })),
        /* The manifest chain and the base links, so the receiving side can
           re-derive the chain rather than believe it. `history` holds the
           snapshotted FILES; `manifest` holds the promotion records that link
           them, which is what a chain check actually walks. */
        /* REC-182: `created` is the document's own time and two promotions can tie on it; a tie is
           broken by `rowid`, the store's write order (D-171's precedent), never by the scan. */
        promotions: this.#rows(
          `SELECT snap_key, kind, base, author, created, writer, operation
           FROM manifest WHERE bundle_id=? ORDER BY created, rowid`, b.bundle_id),
        snapshots: this.#rows(
          `SELECT snap_key, path, sha256, created FROM history WHERE bundle_id=? ORDER BY snap_key, path`,
          b.bundle_id),
        /* connections' refs (an instance whose store holds no `refs` table holds no reference) */
        refs: hasRefs ? this.#rows(`SELECT target_id, kind FROM refs WHERE bundle_id=?`, b.bundle_id) : [],
      };
    });
    /* R7–R9: every table record-core's declarations name, read fresh at each export, by class and paged. */
    const tables = this.#declared().map((d) => tableEntry(this.sql, d, this.record));
    const rowCount = tables.reduce((n, t) => n + (t.rows || 0), 0);
    /* The module's clock (`now`), as every instant it writes, so the log row and the answer carry one instant. */
    const at = this.#when();
    this.sql.exec(
      `INSERT INTO export_log (at,scope,bundles,files,note,tables,rows) VALUES (?,'working-corpus',?,?,?,?,?)`,
      at, bundles.length, fileCount, note ? String(note).slice(0, EXPORT_NOTE_MAX) : null, tables.length, rowCount);
    return { ok: true, at, scope: "working-corpus",
      bundles: out,
      tables,
      counts: { bundles: bundles.length, files: fileCount, tables: tables.length, rows: rowCount },
      register: this.#rows(`SELECT bundle_id, path, capture_sha, bytes FROM register ORDER BY bundle_id`),
      recorded: "this export is in the append-only export log and is visible to every administrator",
      verify: "every file carries its sha256 and every record its history chain and base links. Re-derive "
            + "them on the way in and byte-compare every registered capture; every table page carries its sha256: "
            + "fetch each page, re-derive its digest and its rows, and trust nothing this manifest asserts about itself." };
  }

  #declared() {
    try { return this.record && typeof this.record.declaredTables === "function" ? this.record.declaredTables() : []; }
    catch { return []; }
  }

  /** R8: one page of a carried table, fetched alone: from the manifest's `index` and `after` for it, the page's rows and
   *  canonical bytes with their SHA-256, to check against the manifest and resume from. Writes nothing. Refused
   *  `EXPORT_TABLE_UNKNOWN` (no declared table by that name), `EXPORT_TABLE_NOT_CARRIED` (declared `never` or
   *  derived-rebuildable: its rows never travel) or `EXPORT_PAGE_MALFORMED` (an index that is not a whole number). */
  exportPage({ table = null, index = null, after = null } = {}) {
    const d = this.#declared().find((x) => x.name === table);
    if (!d) return { ok: false, reason: "EXPORT_TABLE_UNKNOWN", table, detail: "no declared table has that name" };
    if (d.export === "never" || d.derive === "derived-rebuildable")
      return { ok: false, reason: "EXPORT_TABLE_NOT_CARRIED", table,
               detail: d.derive === "derived-rebuildable" ? "derived-rebuildable: it travels as its rule" : "export never: its rows never travel" };
    const i = Number(index);
    if (!Number.isInteger(i) || i < 0)
      return { ok: false, reason: "EXPORT_PAGE_MALFORMED", table, detail: "a page is named by its index, a whole number, and its after" };
    let from = after;
    if (typeof from === "string") { try { from = JSON.parse(from); } catch { /* a plain key */ } }
    const pager = new TablePager(this.sql, d);
    const p = pager.held ? pager.page(from ?? null) : { rows: [], last: null, more: false };
    const bytes = pageBytes({ table: d.name, owner: d.module, index: i, rows: p.rows });
    return { ok: true, table: d.name, owner: d.module, index: i, after: from ?? null, rows: p.rows, bytes,
             sha256: createSha256().update(bytes).hex(), next: p.more ? p.last : null };
  }

  /** R10: one rendering in an open standard, for `viewer`, from the rows R7 would carry to that viewer and no others.
   *  It adds no fact and writes nothing but one `export_log` row naming the format. */
  exportRendering({ format = null, viewer = null } = {}) {
    if (!FORMATS.includes(format))
      return { ok: false, reason: "EXPORT_FORMAT_UNKNOWN", format, formats: [...FORMATS],
               detail: `a rendering is one of ${FORMATS.join(", ")}; nothing was rendered or logged` };
    const at = this.#when();
    const { body, truncated } = render(format, { sql: this.sql, record: this.record, ...this.#ownerDeps() }, viewer, at);
    const items = itemsOf(format, body);
    this.sql.exec(`INSERT INTO export_log (at,scope,bundles,files,note,tables,rows,format) VALUES (?,'rendering',0,0,NULL,NULL,?,?)`,
                  at, items, format);
    return { ok: true, at, format, standard: STANDARDS[format], items, truncated, rendering: body,
             recorded: "this rendering is in the append-only export log and is visible to every administrator" };
  }

  #ownerDeps() { return { ...this.owners }; }

  /** The log, readable by in-app administrators who cannot run an export.
   *
   *  REC-57 — NOT NAMED IN THE ITEM, and the worst instance of its class on the
   *  roster. This op read the log at a literal `LIMIT 200` with no parameter at
   *  all, and published neither the bound nor a truncation flag: an
   *  administrator reading `exports` saw the newest 200 entries of an
   *  APPEND-ONLY log and had no way to tell that from the whole of it. The
   *  sentence the export manifest tells them is "this export is in the
   *  append-only export log and is visible to every administrator" — a
   *  completeness claim, which is exactly what UI-25 says an unstated bound
   *  reads as. On a store past 200 exports, the export that is being looked for
   *  is the one that has fallen off.
   *
   *  `limit` is now accepted (default 200, clamped to 1..1000) so a truncated
   *  reader can ask for more, and the answer carries the bound it applied and
   *  whether it bit. Ordering, columns and the `exports` key are unchanged, and
   *  a caller that passes nothing gets byte-identical rows. */
  exportLog({ limit = null } = {}) {
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || EXPORT_LOG_LIMIT_DEFAULT),
                                     EXPORT_LOG_LIMIT_MAX));
    /* cap + 1 asked for, cap delivered: the extra row is the whole difference
       between "there are 200 exports" and "here are the first 200". */
    const page = this.#rows(
      `SELECT seq, at, scope, bundles, files, note, tables, rows, format FROM export_log ORDER BY seq DESC LIMIT ?`, cap + 1);
    return { ok: true, exports: page.slice(0, cap), limit: cap, truncated: page.length > cap };
  }

  /** R3: the verifying import, as a pure check (K1072's START, R3's Suggestion; P17). */
  verifyCorpusExport(input) { return verifyCorpusExport(input); }
}

/* ---- R3: the verifying import ----
 *
 * WHAT IT IS HANDED: R1's answer (`manifest`) and the bytes that answer names, keyed by their SHA-256 (`bytes`: a Map
 * or a plain object, each value a Uint8Array, an ArrayBuffer or a string read as UTF-8): the files' contents, the
 * snapshots' contents and the registered captures. R1 carries hashes, never bytes, so the bytes travel beside it.
 *
 * WHAT IT TRUSTS: nothing the manifest asserts (Membership v2 §8, "What verified must mean"). Every digest is
 * re-derived from the bytes handed under it, every size measured, and every link the manifest states is checked
 * against the parts of the manifest those bytes have just verified:
 *   - each file's bytes hash to its `sha256` and measure its `bytes` (FILE_HASH_MISMATCH, FILE_SIZE_MISMATCH);
 *   - each bundle's `bundle_sha` is its live `bundle.md`'s digest (record-core's commit; BUNDLE_SHA_MISMATCH);
 *   - the history chain, walked in R1's write order: the first promotion replaced nothing, so its base is the
 *     creation base and no snapshot is filed under its key (CHAIN_START_UNANCHORED); every later promotion's base is
 *     the digest of the `bundle.md` it replaced, which commit filed under that promotion's key (BASE_UNLINKED); every
 *     snapshot is filed under a promotion's key (SNAPSHOT_UNLINKED) and its bytes hash to its `sha256`
 *     (SNAPSHOT_HASH_MISMATCH);
 *   - each registered capture's bytes hash to its digest and measure the register's size (CAPTURE_HASH_MISMATCH,
 *     CAPTURE_SIZE_MISMATCH): a byte comparison against what the register recorded;
 *   - the stated counts are the counts of what the manifest lists (COUNTS_MISMATCH);
 *   - every digest named has its bytes (BYTES_MISSING).
 * A digest is held to whatever names it: bytes a file and a registered capture share are checked at both, and a
 * tamper with them is named at both.
 *
 * WHAT IT ANSWERS: `{ok: true, verified: true, counts}`, or `{ok: false, verified: false, failures, counts}`, each
 * failure `{reason, bundle, path | snap_key | capture, expected, found}`: which record, which part, what the check
 * expected and what it found. It writes nothing, reads no table and never throws; writing a verified corpus into a
 * receiving store is not stated (R3's Suggestion), so it is not here. */
export function verifyCorpusExport(input) {
  const { manifest = null, bytes = null, declared = null } = input && typeof input === "object" ? input : {};
  const failures = [];
  const counts = { bundles: 0, files: 0, promotions: 0, snapshots: 0, captures: 0, tables: 0, pages: 0 };
  try {
    if (!manifest || typeof manifest !== "object" || !Array.isArray(manifest.bundles))
      return refused([{ reason: "MANIFEST_MALFORMED", expected: "an export's manifest: an object listing its records",
                        found: describe(manifest) }], counts);
    const held = bytesOf(bytes);
    const digests = new Map();
    /* The bytes under `sha`, re-hashed once however many places name it; null when none were handed over. */
    const derive = (sha) => {
      const key = lower(sha);
      if (!digests.has(key)) {
        const b = held(key);
        digests.set(key, b ? { hex: createSha256().update(b).hex(), size: b.length } : null);
      }
      return digests.get(key);
    };
    /* One part named by a digest: its bytes are present, hash to it, and (when a size is stated) measure it. */
    const part = (where, sha, size, hashReason, sizeReason) => {
      const want = lower(sha);
      if (!HEX64.test(want)) {
        failures.push({ reason: hashReason, ...where, expected: "a SHA-256 digest", found: describe(sha) });
        return false;
      }
      const got = derive(want);
      if (!got) { failures.push({ reason: "BYTES_MISSING", ...where, expected: want, found: null }); return false; }
      if (got.hex !== want) { failures.push({ reason: hashReason, ...where, expected: want, found: got.hex }); return false; }
      if (sizeReason && size != null && Number(size) !== got.size)
        failures.push({ reason: sizeReason, ...where, expected: size, found: got.size });
      return true;
    };

    let fileTotal = 0;
    for (const b of manifest.bundles) {
      const bundle = b && typeof b.bundle_id === "string" ? b.bundle_id : null;
      const files = b && Array.isArray(b.files) ? b.files : [];
      const promotions = b && Array.isArray(b.promotions) ? b.promotions : [];
      const snapshots = b && Array.isArray(b.snapshots) ? b.snapshots : [];
      counts.bundles++;
      fileTotal += files.length;
      for (const f of files) {
        counts.files++;
        part({ bundle, path: f ? f.path ?? null : null }, f && f.sha256, f ? f.bytes : null,
             "FILE_HASH_MISMATCH", "FILE_SIZE_MISMATCH");
      }
      /* bundle_sha is the live bundle.md's digest (the first file when there is none), as record-core's commit sets it. */
      const head = files.find((f) => f && f.path === "bundle.md") || files[0] || null;
      if (head && lower(b.bundle_sha) !== lower(head.sha256))
        failures.push({ reason: "BUNDLE_SHA_MISMATCH", bundle, path: head.path ?? null, expected: lower(head.sha256),
                        found: b.bundle_sha ?? null });
      /* The snapshots filed under each key, and each snapshot's own bytes. */
      const filed = new Map();
      for (const s of snapshots) {
        counts.snapshots++;
        const key = s ? s.snap_key ?? null : null;
        if (!filed.has(key)) filed.set(key, []);
        filed.get(key).push(s);
        part({ bundle, snap_key: key, path: s ? s.path ?? null : null }, s && s.sha256, null, "SNAPSHOT_HASH_MISMATCH");
      }
      const keys = new Set();
      promotions.forEach((p, i) => {
        counts.promotions++;
        const key = p ? p.snap_key ?? null : null;
        keys.add(key);
        const base = p ? p.base ?? null : null;
        const under = filed.get(key) || [];
        if (i === 0) {
          if ((base !== null && lower(base) !== CREATION_BASE) || under.length)
            failures.push({ reason: "CHAIN_START_UNANCHORED", bundle, snap_key: key,
                            expected: `the creation base ${CREATION_BASE}, with nothing filed under this key`,
                            found: under.length ? `${describe(base)}, with ${under.length} snapshot(s) filed` : describe(base) });
          return;
        }
        /* The bundle.md this promotion replaced, which commit filed under its key (the first file when there is none). */
        const replaced = under.find((s) => s && s.path === "bundle.md") || under[0] || null;
        if (!replaced || lower(base) !== lower(replaced.sha256))
          failures.push({ reason: "BASE_UNLINKED", bundle, snap_key: key,
                          expected: replaced ? lower(replaced.sha256) : "a snapshot filed under this key",
                          found: describe(base) });
      });
      for (const [key, rows] of filed)
        if (!keys.has(key))
          for (const s of rows)
            failures.push({ reason: "SNAPSHOT_UNLINKED", bundle, snap_key: key, path: s ? s.path ?? null : null,
                            expected: "a promotion filed under this key", found: null });
    }
    for (const r of Array.isArray(manifest.register) ? manifest.register : []) {
      counts.captures++;
      part({ bundle: r ? r.bundle_id ?? null : null, path: r ? r.path ?? null : null, capture: r ? r.capture_sha ?? null : null },
           r && r.capture_sha, r ? r.bytes : null, "CAPTURE_HASH_MISMATCH", "CAPTURE_SIZE_MISMATCH");
    }
    if (!Array.isArray(manifest.register))
      failures.push({ reason: "MANIFEST_MALFORMED", expected: "the register, a list", found: describe(manifest.register) });
    const rowTotal = verifyTables(manifest, held, failures, counts, declared);
    const stated = manifest.counts && typeof manifest.counts === "object" ? manifest.counts : {};
    for (const [k, n] of [["bundles", counts.bundles], ["files", fileTotal],
                          ...(Array.isArray(manifest.tables) ? [["tables", counts.tables], ...(rowTotal === null ? [] : [["rows", rowTotal]])] : [])])
      if (stated[k] !== n) failures.push({ reason: "COUNTS_MISMATCH", path: `counts.${k}`, expected: n, found: stated[k] ?? null });
    return failures.length ? refused(failures, counts) : { ok: true, verified: true, counts };
  } catch (e) {
    /* Never a throw: an export this cannot read is not verified, and says why. */
    return refused([...failures, { reason: "MANIFEST_MALFORMED", expected: "a readable export",
                                   found: String(e && e.message || e).slice(0, 160) }], counts);
  }
}

/* R3 (T33-61): every table page re-derived. Each carried table's pages run 0..n-1 with none missing; each page's bytes
   are present, hash to its digest and measure its size; its bytes parse as the canonical page of that table and index,
   holding the rows it states; the rows of the pages sum to the table's stated rows. A table declared `never` carries no
   page. Every table the manifest names, or that the importer's own `declared` list names (a list of names, or of
   `declaredTables()` entries), is carried or named (TABLE_NOT_CARRIED). Answers the rows re-derived. */
function verifyTables(manifest, held, failures, counts, declared) {
  const tables = manifest.tables;
  if (tables === undefined) {
    if (declared != null) failures.push({ reason: "MANIFEST_MALFORMED", expected: "the declared tables, a list", found: null });
    return 0;
  }
  if (!Array.isArray(tables)) {
    failures.push({ reason: "MANIFEST_MALFORMED", expected: "the declared tables, a list", found: describe(tables) });
    return 0;
  }
  const td = new TextDecoder("utf-8", { fatal: true });
  const named = new Set();
  let total = 0, sound = true;
  for (const t of tables) {
    counts.tables++;
    const table = t && typeof t.table === "string" ? t.table : null;
    named.add(table);
    const pages = t && Array.isArray(t.pages) ? t.pages : [];
    const where = { table };
    if (t && t.classes && t.classes.export === "never" && (pages.length || t.rows))
      failures.push({ reason: "TABLE_NEVER_CARRIED", ...where, expected: "no row of a table declared export never",
                      found: `${pages.length} page(s)` });
    if (!t || t.carried !== "rows") continue;
    let rows = 0;
    const before = failures.length;
    const byIndex = new Map(pages.map((p) => [p && p.index, p]));
    for (let i = 0; i < pages.length; i++)
      if (!byIndex.has(i))
        failures.push({ reason: "PAGE_MISSING", ...where, page: i, expected: `pages 0 to ${pages.length - 1}`, found: null });
    for (const p of pages) {
      counts.pages++;
      const at = { ...where, page: p ? p.index ?? null : null };
      const want = lower(p && p.sha256);
      if (!HEX64.test(want)) { failures.push({ reason: "PAGE_HASH_MISMATCH", ...at, expected: "a SHA-256 digest", found: describe(p && p.sha256) }); continue; }
      const b = held(want);
      if (!b) { failures.push({ reason: "BYTES_MISSING", ...at, expected: want, found: null }); continue; }
      const got = createSha256().update(b).hex();
      if (got !== want) { failures.push({ reason: "PAGE_HASH_MISMATCH", ...at, expected: want, found: got }); continue; }
      if (p.bytes != null && Number(p.bytes) !== b.length)
        failures.push({ reason: "PAGE_SIZE_MISMATCH", ...at, expected: p.bytes, found: b.length });
      let page = null;
      try { page = JSON.parse(td.decode(b)); } catch { page = null; }
      if (!page || !Array.isArray(page.rows) || canonical(page) !== td.decode(b)) {
        failures.push({ reason: "PAGE_MALFORMED", ...at, expected: "a canonical page of rows", found: null });
        continue;
      }
      if (page.table !== table || page.index !== p.index || page.owner !== t.owner)
        failures.push({ reason: "PAGE_MISPLACED", ...at, expected: `${t.owner}/${table} page ${p.index}`,
                        found: `${describe(page.owner)}/${describe(page.table)} page ${describe(page.index)}` });
      if (page.rows.length !== Number(p.rows))
        failures.push({ reason: "PAGE_ROWS_MISMATCH", ...at, expected: p.rows, found: page.rows.length });
      rows += page.rows.length;
    }
    total += rows;
    /* A page already refused is named there; its table's sum is not named again for it. */
    if (failures.length !== before) { sound = false; continue; }
    if (rows !== t.rows) failures.push({ reason: "TABLE_ROWS_MISMATCH", ...where, expected: rows, found: t.rows ?? null });
  }
  const must = Array.isArray(declared) ? declared.map((d) => (typeof d === "string" ? d : d && d.name)).filter(Boolean) : [];
  for (const name of must)
    if (!named.has(name))
      failures.push({ reason: "TABLE_NOT_CARRIED", table: name, expected: "every declared table carried or named", found: null });
  return sound ? total : null;
}

function refused(failures, counts) { return { ok: false, verified: false, failures, counts }; }
function lower(v) { return typeof v === "string" ? v.trim().toLowerCase() : ""; }
function describe(v) {
  if (v === null || v === undefined) return null;
  const s = typeof v === "string" ? v : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
  return String(s).slice(0, 80);
}
/* The bytes handed over, looked up by lowercase digest: a Map or a plain object; a value that is neither bytes nor a
   string holds nothing. */
function bytesOf(given) {
  const get = given instanceof Map ? (k) => given.get(k)
    : given && typeof given === "object" ? (k) => (Object.prototype.hasOwnProperty.call(given, k) ? given[k] : undefined)
    : () => undefined;
  const index = new Map();
  if (given instanceof Map) for (const k of given.keys()) index.set(lower(k), k);
  else if (given && typeof given === "object") for (const k of Object.keys(given)) index.set(lower(k), k);
  return (key) => {
    const v = index.has(key) ? get(index.get(key)) : undefined;
    if (v instanceof Uint8Array) return v;
    if (v instanceof ArrayBuffer) return new Uint8Array(v);
    if (typeof v === "string") return te.encode(v);
    return null;
  };
}

/** R6: the route arms, keyed by op name, each a function of no arguments (escalation's `escalationOps` form): `export`
 *  answers R1 with the query's `note`, `exportlog` answers R2 with its `limit`, as publication's arms did. `ce` is the
 *  host's instance (`corpusExportOf`), `q` reads one query parameter. The plane spreads the map into its own. */
export function corpusExportOps(ce, q) {
  return {
    export: () => ce.exportManifest({ note: q("note") }),
    exportlog: () => ce.exportLog({ limit: q("limit") }),
    /* T33-61 (J1 (3), (4)): one page of a carried table (R8), and a rendering for the stamped viewer (R10). */
    exportpage: () => ce.exportPage({ table: q("table"), index: q("index"), after: q("after") }),
    exportrender: () => ce.exportRendering({ format: q("format"), viewer: q("viewer") }),
  };
}

const instances = new WeakMap();

/** The one instance for a host (K61). The first call creates it with `deps` (a test passes its own), creates
 *  `export_log`, and declares it to record-core's purge as exempt (R4); the declaration's answer is kept as
 *  `purgeDeclaration`. */
export function corpusExportOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    /* R10's owners, each reached through its factory on this host on first use unless given. */
    const owners = { entities: d.entities ?? (() => entitiesOf(host, { record })), events: d.events ?? (() => eventsOf(host, { record })),
                     lines: d.lines ?? (() => linesOf(host, { record })), money: d.money ?? (() => moneyOf(host, { record })) };
    c = new CorpusExport({ ...d, ...owners, storage, record });
    instances.set(host, c);
    c.migrate();
    c.purgeDeclaration = record.declarePurge("corpus-export", [], { exempt: [...CORPUS_EXPORT_EXEMPT] });
  }
  return c;
}
