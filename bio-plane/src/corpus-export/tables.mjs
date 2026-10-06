/* corpus-export — every declared table, by class, paged (requirements: `build/requirements/corpus-export.md` R7–R9;
 * S0-15, B0.13; DEC-112 (3), K1489, K1493).
 *
 * WHAT TRAVELS (R7). `record-core.declaredTables()` is read fresh at every export, so a table declared after one export
 * is named by the next. Each table travels under its owner with its classes:
 *   - `export: "never"`: named with its owner and classes, no row (member ties and the source↔person link among them);
 *   - `derive: "derived-rebuildable"`: its rule (its owner, its key columns and `from`, the stored tables it is rebuilt
 *     from, exactly as `declaredTables()` answers it: a list as given, or `null` when the declaration stated none, never
 *     an empty list and never filled here; record-core R77, N593), never its rows;
 *   - `export: "yes"`, and `"admin-only"` (marked so): its rows, in pages.
 * A `declareTable` entry whose export class lets its rows travel is read as its owner's statement that they may be read
 * for the export (J1 (1)): the rows are read whole, by `SELECT *`, and nothing is written to them.
 *
 * PAGES (R8). Rows travel in the table's key order (its primary key columns; `rowid` when it has none), each page at
 * most PAGE_ROWS rows and at most PAGE_BYTES bytes of canonical rows (a single row larger than that travels alone). A
 * page's canonical bytes are the canonical JSON (keys sorted, no whitespace) of `{index, owner, rows, table}`, so a page
 * cannot be moved to another table or index and still verify. The manifest states each page's index, row count, size,
 * SHA-256 and `after` (the key of the last row before it), so a page can be fetched alone (`readPage`), checked against
 * its digest and resumed from there; nothing is held in memory but the page being built.
 *
 * REMOVALS (R9). A row expunged under record-core R79 is gone from its table, so it is not carried; each tombstone
 * `record-core.tombstones` lists for a carried table travels in its place as `{table, key, ground, at}`, none of the
 * removed content and nothing more. */
import { createSha256 } from "../record-grammar/index.mjs";

/** R8: the page bound, set from the measured paging cost (job record, T33-61). */
export const PAGE_ROWS = 1000;
export const PAGE_BYTES = 256 * 1024;
/* How many rows one read asks for while a page is built. */
const CHUNK = 500;
const te = new TextEncoder();
const hexOf = (u8) => { let s = ""; for (const b of u8) s += b.toString(16).padStart(2, "0"); return s; };

/** Canonical JSON: object keys sorted, no whitespace; bytes as `{"$bytes": hex}`; a bigint as its decimal string; a
 *  number that is not finite as null. The one spelling of a page's rows, on both sides of the export. */
export function canonical(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "string" || typeof v === "boolean") return JSON.stringify(v);
  if (typeof v === "number") return Number.isFinite(v) ? JSON.stringify(v) : "null";
  if (typeof v === "bigint") return JSON.stringify(String(v));
  if (v instanceof Uint8Array) return `{"$bytes":${JSON.stringify(hexOf(v))}}`;
  if (v instanceof ArrayBuffer) return canonical(new Uint8Array(v));
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (typeof v === "object")
    return `{${Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`;
  return "null";
}

/** A page's canonical bytes. */
export function pageBytes({ table, owner, index, rows }) {
  return te.encode(canonical({ table, owner, index, rows }));
}

const quote = (name) => `"${String(name).replace(/"/g, '""')}"`;

/** One declared table's rows, paged (R8). `sql` is the store's; `decl` one entry of `declaredTables()`. */
export class TablePager {
  constructor(sql, decl) {
    this.sql = sql;
    this.owner = decl.module;
    this.table = decl.name;
    const cols = this.#rows(`PRAGMA table_info(${quote(this.table)})`);
    this.held = cols.length > 0;
    const pk = cols.filter((c) => Number(c.pk) > 0).sort((a, b) => Number(a.pk) - Number(b.pk)).map((c) => c.name);
    /* Key order: the primary key's columns, or `rowid` (read under an alias no column takes, and never carried). */
    this.byRowid = pk.length === 0;
    this.key = this.byRowid ? ["rowid"] : pk;
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }

  /* The next `limit` rows after the key `after` (null: from the first), in key order. */
  #after(after, limit) {
    const order = this.byRowid ? "rowid" : this.key.map(quote).join(", ");
    const select = this.byRowid ? `SELECT rowid AS "$key", * FROM ${quote(this.table)}` : `SELECT * FROM ${quote(this.table)}`;
    if (after == null) return this.#rows(`${select} ORDER BY ${order} LIMIT ?`, limit);
    const vals = Array.isArray(after) ? after : [after];
    const cmp = this.key.length === 1 ? `${order} > ?` : `(${order}) > (${vals.map(() => "?").join(", ")})`;
    return this.#rows(`${select} WHERE ${cmp} ORDER BY ${order} LIMIT ?`, ...vals, limit);
  }

  /* A row's key, as `after` names it; and the row as it travels (the rowid alias left out). */
  #keyOf(r) { return this.byRowid ? r.$key : this.key.length === 1 ? r[this.key[0]] : this.key.map((k) => r[k]); }
  #content(r) { if (!this.byRowid) return r; const { $key, ...rest } = r; return rest; }

  /** One page from `after`: `{rows, after, last}`, `last` the key `after` names for the next page (null when the table
   *  ends here). It reads at most one chunk past the page. */
  page(after) {
    const rows = [];
    let size = 0, from = after, last = after;
    for (;;) {
      const got = this.#after(from, CHUNK);
      for (const r of got) {
        const row = this.#content(r);
        const n = te.encode(canonical(row)).length + 1;
        if (rows.length && (rows.length >= PAGE_ROWS || size + n > PAGE_BYTES)) return { rows, after, last, more: true };
        rows.push(row);
        size += n;
        last = this.#keyOf(r);
      }
      if (got.length < CHUNK) return { rows, after, last, more: false };
      from = last;
    }
  }

  /** Every page's statement for the manifest, built one page at a time; `{rows, pages}`. */
  survey() {
    if (!this.held) return { rows: 0, pages: [] };
    const pages = [];
    let after = null, total = 0;
    for (let index = 0; ; index++) {
      const p = this.page(after);
      if (!p.rows.length) break;
      const bytes = pageBytes({ table: this.table, owner: this.owner, index, rows: p.rows });
      pages.push({ index, rows: p.rows.length, bytes: bytes.length, sha256: createSha256().update(bytes).hex(), after });
      total += p.rows.length;
      if (!p.more) break;
      after = p.last;
    }
    return { rows: total, pages };
  }
}

/** R7, R9: one table's entry in the manifest. */
export function tableEntry(sql, decl, record) {
  const classes = { purge: decl.purge, expunge: decl.expunge, export: decl.export, sight: decl.sight, derive: decl.derive,
                    version_chain: decl.version_chain };
  const head = { owner: decl.module, table: decl.name, classes };
  if (decl.export === "never")
    return { ...head, carried: "named", rows: null, pages: [],
             why: "declared export never: named with its owner and class, and no row travels" };
  if (decl.derive === "derived-rebuildable") {
    /* R7 (N593): `from` exactly as declared; a declaration that stated none travels as null, said so. */
    const from = Array.isArray(decl.from) ? [...decl.from] : null;
    return { ...head, carried: "rule", rows: null, pages: [],
             rule: { owner: decl.module, key: Array.isArray(decl.key) ? [...decl.key] : null, from,
                     rebuild: `rebuilt by ${decl.module} from ${from ? from.join(", ") : "stored tables its declaration did not state"}`
                              + " (record-core R77); its rows never travel" } };
  }
  const pager = new TablePager(sql, decl);
  const { rows, pages } = pager.survey();
  return { ...head, carried: "rows", ...(decl.export === "admin-only" ? { admin_only: true } : {}), held: pager.held,
           key: pager.key, page_bound: { rows: PAGE_ROWS, bytes: PAGE_BYTES }, rows, pages,
           tombstones: tombstonesOf(record, decl.name) };
}

/** R9: the tombstones record-core lists for a table, each as `{table, key, ground, at}`. */
export function tombstonesOf(record, table) {
  if (!record || typeof record.tombstones !== "function") return [];
  const out = [];
  let after = 0;
  for (;;) {
    const r = record.tombstones({ table, after, limit: 1000 });
    const list = r && Array.isArray(r.tombstones) ? r.tombstones : [];
    for (const t of list) out.push({ table: t.table, key: t.key, ground: t.ground, at: t.at });
    if (list.length < 1000 || r.cursor == null) break;
    after = r.cursor;
  }
  return out;
}
