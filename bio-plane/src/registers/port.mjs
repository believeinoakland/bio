/* registers' one storage port (requirements: R21, R22, R23): the module reaches the cells of a row version and the index over
 * them only through `rowStore`: put a delta, scan by terms and range, get a row, list by key range, count, free bytes,
 * remove a key, rebuild. Two implementations stand behind it, the team object's SQLite and an in-memory one; the contract
 * suite (`test/m/registers/port.test.mjs`) runs unchanged against both. A later storage (M-R3) is a third implementation.
 *
 * A row version is `{scope_key, register, row_key, content_hash}`. `put` is idempotent: a version already held is not
 * written again (R17, R21). `scan` answers the held versions a filter could match, in the search order (date descending,
 * undetermined last, then row key), as a lazy iterator; the caller verifies each against the filter with `register-readers`'
 * own `matches` (the port's pre-filter may admit a row the filter then refuses, never the reverse). */
import { indexTerms, nameTokens, readAmount } from "../register-readers/index.mjs";
import { compareAmounts } from "../register-readers/terms.mjs";
import { sha256HexSync } from "../record-grammar/index.mjs";

const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

/** A row version's content hash: the digest of its kept cells in the definition's order. */
export function contentHashOf(cells, columns) {
  return sha256HexSync(JSON.stringify(columns.map((c) => [c, cells[c] ?? ""])));
}

/* amount as an integer of millionths, loosely (the verifier is exact); null when absent */
const MICRO = 1000000n;
function microOf(a, up = false) {
  if (!a) return null;
  const u = BigInt(a.units);
  if (a.scale <= 6) return Number(u * 10n ** BigInt(6 - a.scale));
  const d = 10n ** BigInt(a.scale - 6);
  let q = u / d;
  if (up && u % d !== 0n) q += 1n;
  if (!up && u % d !== 0n && u < 0n) q -= 1n;
  return Number(q);
}
const decimalOf = (v) => (typeof v === "number" ? readAmount(String(v)) : typeof v === "string" ? readAmount(v) : null);

/** The index row of a version: its key, project and terms (`register-readers` R5). */
export function indexRowOf(version, cells, definition) {
  const t = indexTerms(cells, definition);
  const a = t.amount ? microOf(t.amount) : null;
  return {
    scope_key: version.scope_key, register: version.register, row_key: version.row_key, content_hash: version.content_hash,
    project: version.project ?? null,
    name_tokens: ` ${t.name_tokens.join(" ")} `, org_tokens: ` ${t.org_tokens.join(" ")} `,
    amount_micro: a, date: t.date, filer_id: t.filer_id, form: t.form, licence_no: t.licence_no, docket_no: t.docket_no,
    company_no: t.company_no, city: t.place.city, state: t.place.state, zip5: t.place.zip5,
    undetermined: JSON.stringify(t.undetermined),
  };
}

const SQL_LIST_MAX = 200;
/* the token rows of an index row: its name and organization tokens */
const tokensOf = (r) => [...new Set(r.name_tokens.trim().split(" ").filter(Boolean))].map((t) => ["n", t])
  .concat([...new Set(r.org_tokens.trim().split(" ").filter(Boolean))].map((t) => ["o", t]))
  .map(([kind, token]) => ({ kind, token, scope_key: r.scope_key, register: r.register, row_key: r.row_key, content_hash: r.content_hash, project: r.project ?? null }));

/* the SQL where of the pre-filter (looser than `matches`, never tighter) */
function whereOf(filter, p = "") {
  const conds = [], args = [];
  const f = isObj(filter) ? filter : {};
  /* R23: each token of a name is read from the token index, never by a scan of the rows */
  const tokenGroups = (list, kind) => {
    const groups = [];
    for (const name of list) {
      const toks = nameTokens(name);
      if (!toks.length) return null;
      groups.push(`(${toks.map(() => `(${p}scope_key, ${p}register, ${p}row_key, ${p}content_hash) IN (SELECT scope_key, register, row_key, content_hash FROM register_tokens WHERE kind='${kind}' AND token=?)`).join(" AND ")})`);
      args.push(...toks);
    }
    return groups.length ? `(${groups.join(" OR ")})` : null;
  };
  const sub = [];
  const withArgs = (build) => { const mark = args.length; const c = build(); if (c === null) args.length = mark; else sub.push(c); };
  if (Array.isArray(f.names) && f.names.length && f.names.length <= SQL_LIST_MAX) withArgs(() => tokenGroups(f.names, "n"));
  if (Array.isArray(f.organizations) && f.organizations.length && f.organizations.length <= SQL_LIST_MAX) withArgs(() => tokenGroups(f.organizations, "o"));
  for (const [k, col] of [["filer_ids", "filer_id"], ["forms", "form"], ["licence_numbers", "licence_no"], ["docket_numbers", "docket_no"]]) {
    const v = f[k];
    if (Array.isArray(v) && v.length && v.length <= SQL_LIST_MAX) { sub.push(`${p}${col} IN (${v.map(() => "?").join(",")})`); args.push(...v.map((x) => String(x).trim())); }
  }
  if (isObj(f.amount)) {
    const min = f.amount.min !== undefined ? decimalOf(f.amount.min) : null, max = f.amount.max !== undefined ? decimalOf(f.amount.max) : null;
    if (min) { sub.push(`${p}amount_micro >= ?`); args.push(microOf(min)); }
    if (max) { sub.push(`${p}amount_micro <= ?`); args.push(microOf(max, true)); }
  }
  if (isObj(f.date)) {
    if (f.date.from) { sub.push(`${p}date >= ?`); args.push(f.date.from); }
    if (f.date.to) { sub.push(`${p}date <= ?`); args.push(f.date.to); }
  }
  return { sql: sub.join(" AND "), args, conds };
}

/* the search order as a cursor: date descending (none last), then key, hash, scope */
export const encodeAfter = (e) => btoa(JSON.stringify([e.date ?? null, e.row_key, e.content_hash, e.scope_key]));
export function decodeAfter(token) {
  try { const a = JSON.parse(atob(String(token))); return Array.isArray(a) && a.length === 4 && a.slice(1).every((x) => typeof x === "string") ? a : null; } catch { return null; }
}

/* ======================================================================== the SQLite implementation */

export function sqliteRowStore(sql, { freeBytes = null, termsOf, now = null } = {}) {
  const rows = (q, ...a) => [...sql.exec(q, ...a)];
  return {
    kind: "sqlite",
    has: (v) => rows(`SELECT 1 AS x FROM register_cells WHERE scope_key=? AND register=? AND row_key=? AND content_hash=?`, v.scope_key, v.register, v.row_key, v.content_hash).length > 0,
    /** put a delta: `[{...version, project, first_import, segment_sha, src_row, cells, definition}]`; answers `{written, existed}`. */
    put(delta) {
      let written = 0, existed = 0;
      for (const d of delta) {
        const had = rows(`SELECT 1 AS x FROM register_cells WHERE scope_key=? AND register=? AND row_key=? AND content_hash=?`, d.scope_key, d.register, d.row_key, d.content_hash).length > 0;
        if (had) { existed++; continue; }
        sql.exec(`INSERT INTO register_cells (scope_key, register, row_key, content_hash, project, first_import, segment_sha, seg_row, byte_at, byte_len, src_row, cells) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
                 d.scope_key, d.register, d.row_key, d.content_hash, d.project ?? null, d.first_import, d.segment_sha, d.seg_row ?? null, d.byte_at ?? null, d.byte_len ?? null, d.src_row, JSON.stringify(d.cells));
        const r = indexRowOf(d, d.cells, d.definition);
        const cols = Object.keys(r);
        sql.exec(`INSERT INTO register_rows (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`, ...cols.map((c) => r[c]));
        for (const t of tokensOf(r)) sql.exec(`INSERT OR IGNORE INTO register_tokens (kind, token, scope_key, register, row_key, content_hash, project) VALUES (?,?,?,?,?,?,?)`, t.kind, t.token, t.scope_key, t.register, t.row_key, t.content_hash, t.project);
        written++;
      }
      return { written, existed };
    },
    get(v) {
      const r = rows(`SELECT * FROM register_cells WHERE scope_key=? AND register=? AND row_key=? AND content_hash=?`, v.scope_key, v.register, v.row_key, v.content_hash)[0];
      return r ? { ...r, cells: JSON.parse(r.cells) } : null;
    },
    /** versions of a key in the given scopes */
    versionsOf({ scopes, register, row_key }) {
      if (!scopes.length) return [];
      return rows(`SELECT scope_key, content_hash, first_import, segment_sha, src_row FROM register_cells WHERE register=? AND row_key=? AND scope_key IN (${scopes.map(() => "?").join(",")}) ORDER BY first_import, content_hash`, register, row_key, ...scopes);
    },
    /** a lazy iterator over the held versions a filter could match, in the search order */
    *scan({ scopes, register = null, importId = null, filter = {}, after = null }) {
      if (!scopes.length) return;
      const w = whereOf(filter, "r.");
      const conds = [`r.scope_key IN (${scopes.map(() => "?").join(",")})`], args = [...scopes];
      if (register) { conds.push(`r.register=?`); args.push(register); }
      if (importId !== null) { conds.push(`EXISTS (SELECT 1 FROM register_import_rows m WHERE m.import_id=? AND m.row_key=r.row_key AND m.content_hash=r.content_hash)`); args.push(importId); }
      if (w.sql) { conds.push(w.sql); args.push(...w.args); }
      const cur = after ? decodeAfter(after) : null;
      if (cur) {
        const [d, k, h, s] = cur;
        if (d === null) { conds.push(`(r.date IS NULL AND (r.row_key > ? OR (r.row_key = ? AND (r.content_hash > ? OR (r.content_hash = ? AND r.scope_key > ?)))))`); args.push(k, k, h, h, s); }
        else { conds.push(`(r.date IS NULL OR r.date < ? OR (r.date = ? AND (r.row_key > ? OR (r.row_key = ? AND (r.content_hash > ? OR (r.content_hash = ? AND r.scope_key > ?))))))`); args.push(d, d, k, k, h, h, s); }
      }
      const q = `SELECT r.scope_key, r.register, r.row_key, r.content_hash, r.date, c.cells, c.first_import, c.segment_sha, c.src_row
                   FROM register_rows r JOIN register_cells c ON c.scope_key=r.scope_key AND c.register=r.register AND c.row_key=r.row_key AND c.content_hash=r.content_hash
                  WHERE ${conds.join(" AND ")} ORDER BY (r.date IS NULL), r.date DESC, r.row_key, r.content_hash, r.scope_key`;
      for (const r of sql.exec(q, ...args)) yield { ...r, cells: JSON.parse(r.cells) };
    },
    listByKeyRange({ scopes, register, from = "", to = null, limit = 200 }) {
      if (!scopes.length) return [];
      const conds = [`register=?`, `scope_key IN (${scopes.map(() => "?").join(",")})`, `row_key >= ?`];
      const args = [register, ...scopes, from];
      if (to !== null) { conds.push(`row_key < ?`); args.push(to); }
      return rows(`SELECT scope_key, register, row_key, content_hash, first_import, segment_sha, src_row FROM register_cells WHERE ${conds.join(" AND ")} ORDER BY row_key, content_hash, scope_key LIMIT ?`, ...args, limit);
    },
    count({ scopes, register = null }) {
      if (!scopes.length) return 0;
      const q = `SELECT COUNT(*) AS n FROM register_rows WHERE scope_key IN (${scopes.map(() => "?").join(",")})${register ? " AND register=?" : ""}`;
      return rows(q, ...scopes, ...(register ? [register] : []))[0].n;
    },
    freeBytes: () => (typeof freeBytes === "function" ? freeBytes() : null),
    /** every version of a key in every scope is removed: its cells and its index rows; answers the segments that held them */
    remove({ register, row_key }) {
      const held = rows(`SELECT DISTINCT segment_sha FROM register_cells WHERE register=? AND row_key=?`, register, row_key).map((r) => r.segment_sha);
      sql.exec(`DELETE FROM register_rows WHERE register=? AND row_key=?`, register, row_key);
      sql.exec(`DELETE FROM register_tokens WHERE register=? AND row_key=?`, register, row_key);
      sql.exec(`DELETE FROM register_cells WHERE register=? AND row_key=?`, register, row_key);
      return { segments: held };
    },
    /** a segment replaced by its rewrite (R30): the versions it held now point at the new digest, each at its new row and
     *  byte range (`places`: old row number → `{row, at, len}`) */
    repoint({ from, to, places = new Map() }) {
      for (const c of rows(`SELECT scope_key, register, row_key, content_hash, seg_row FROM register_cells WHERE segment_sha=?`, from)) {
        const p = places.get(c.seg_row);
        sql.exec(`UPDATE register_cells SET segment_sha=?, seg_row=?, byte_at=?, byte_len=? WHERE scope_key=? AND register=? AND row_key=? AND content_hash=?`,
                 to, p ? p.row : c.seg_row, p ? p.at : null, p ? p.len : null, c.scope_key, c.register, c.row_key, c.content_hash);
      }
    },
    /** the token rows rebuilt from the cells (R23), in the table's key order */
    rebuildTokens(scope) {
      return this.rebuild(scope).flatMap(tokensOf)
        .sort((a, b) => [a.kind, a.token, a.scope_key, a.register, a.row_key, a.content_hash].join("\u0000") < [b.kind, b.token, b.scope_key, b.register, b.row_key, b.content_hash].join("\u0000") ? -1 : 1);
    },
    /** the index rows rebuilt from the cells (R22); `scope` an object of column names to values or null */
    rebuild(scope) {
      const conds = [], args = [];
      for (const [k, v] of Object.entries(isObj(scope) ? scope : {})) { conds.push(`${k}=?`); args.push(v); }
      const out = [];
      for (const r of sql.exec(`SELECT * FROM register_cells${conds.length ? ` WHERE ${conds.join(" AND ")}` : ""} ORDER BY scope_key, register, row_key, content_hash`, ...args)) {
        const def = termsOf(r.register);
        out.push(def ? indexRowOf(r, JSON.parse(r.cells), def) : null);
      }
      return out.filter(Boolean);
    },
  };
}

/* ======================================================================== the in-memory implementation */

export function memoryRowStore({ freeBytes = null, termsOf, members = null } = {}) {
  const cells = new Map();   // "scope\0register\0key\0hash" -> {version..., cells}
  const index = new Map();
  const id = (v) => [v.scope_key, v.register, v.row_key, v.content_hash].join("\u0000");
  const order = (a, b) => {
    const ad = a.date ?? null, bd = b.date ?? null;
    if ((ad === null) !== (bd === null)) return ad === null ? 1 : -1;
    if (ad !== bd) return ad < bd ? 1 : -1;
    return a.row_key < b.row_key ? -1 : a.row_key > b.row_key ? 1 : a.content_hash < b.content_hash ? -1 : a.content_hash > b.content_hash ? 1 : a.scope_key < b.scope_key ? -1 : a.scope_key > b.scope_key ? 1 : 0;
  };
  const passes = (r, f) => {
    if (Array.isArray(f.names) && f.names.length && !f.names.some((n) => { const t = nameTokens(n); return t.length && t.every((x) => r.name_tokens.includes(` ${x} `)); })) return false;
    if (Array.isArray(f.organizations) && f.organizations.length && !f.organizations.some((n) => { const t = nameTokens(n); return t.length && t.every((x) => r.org_tokens.includes(` ${x} `)); })) return false;
    for (const [k, col] of [["filer_ids", "filer_id"], ["forms", "form"], ["licence_numbers", "licence_no"], ["docket_numbers", "docket_no"]])
      if (Array.isArray(f[k]) && f[k].length && !f[k].some((x) => String(x).trim() === r[col])) return false;
    if (isObj(f.amount)) {
      const min = f.amount.min !== undefined ? decimalOf(f.amount.min) : null, max = f.amount.max !== undefined ? decimalOf(f.amount.max) : null;
      if (min && (r.amount_micro === null || r.amount_micro < microOf(min))) return false;
      if (max && (r.amount_micro === null || r.amount_micro > microOf(max, true))) return false;
    }
    if (isObj(f.date)) {
      if (f.date.from && (r.date === null || r.date < f.date.from)) return false;
      if (f.date.to && (r.date === null || r.date > f.date.to)) return false;
    }
    return true;
  };
  return {
    kind: "memory",
    has: (v) => cells.has(id(v)),
    put(delta) {
      let written = 0, existed = 0;
      for (const d of delta) {
        if (cells.has(id(d))) { existed++; continue; }
        cells.set(id(d), { scope_key: d.scope_key, register: d.register, row_key: d.row_key, content_hash: d.content_hash, project: d.project ?? null,
                           first_import: d.first_import, segment_sha: d.segment_sha, seg_row: d.seg_row ?? null, byte_at: d.byte_at ?? null, byte_len: d.byte_len ?? null,
                           src_row: d.src_row, cells: structuredClone(d.cells) });
        index.set(id(d), indexRowOf(d, d.cells, d.definition));
        written++;
      }
      return { written, existed };
    },
    get(v) { const c = cells.get(id(v)); return c ? structuredClone(c) : null; },
    versionsOf({ scopes, register, row_key }) {
      return [...cells.values()].filter((c) => c.register === register && c.row_key === row_key && scopes.includes(c.scope_key))
        .sort((a, b) => a.first_import - b.first_import || (a.content_hash < b.content_hash ? -1 : 1))
        .map((c) => ({ scope_key: c.scope_key, content_hash: c.content_hash, first_import: c.first_import, segment_sha: c.segment_sha, src_row: c.src_row }));
    },
    *scan({ scopes, register = null, importId = null, filter = {}, after = null }) {
      const cur = after ? decodeAfter(after) : null;
      const list = [...index.values()].filter((r) => scopes.includes(r.scope_key) && (!register || r.register === register) && passes(r, isObj(filter) ? filter : {}))
        .filter((r) => importId === null || (members && members(importId, r.row_key, r.content_hash)))
        .sort(order);
      for (const r of list) {
        if (cur && order(r, { date: cur[0], row_key: cur[1], content_hash: cur[2], scope_key: cur[3] }) <= 0) continue;
        const c = cells.get(id(r));
        yield { scope_key: r.scope_key, register: r.register, row_key: r.row_key, content_hash: r.content_hash, date: r.date,
                cells: structuredClone(c.cells), first_import: c.first_import, segment_sha: c.segment_sha, src_row: c.src_row };
      }
    },
    listByKeyRange({ scopes, register, from = "", to = null, limit = 200 }) {
      return [...cells.values()].filter((c) => c.register === register && scopes.includes(c.scope_key) && c.row_key >= from && (to === null || c.row_key < to))
        .sort((a, b) => (a.row_key < b.row_key ? -1 : a.row_key > b.row_key ? 1 : a.content_hash < b.content_hash ? -1 : a.content_hash > b.content_hash ? 1 : a.scope_key < b.scope_key ? -1 : 1))
        .slice(0, limit).map((c) => ({ scope_key: c.scope_key, register: c.register, row_key: c.row_key, content_hash: c.content_hash, first_import: c.first_import, segment_sha: c.segment_sha, src_row: c.src_row }));
    },
    count: ({ scopes, register = null }) => [...index.values()].filter((r) => scopes.includes(r.scope_key) && (!register || r.register === register)).length,
    freeBytes: () => (typeof freeBytes === "function" ? freeBytes() : null),
    remove({ register, row_key }) {
      const segs = new Set();
      for (const [k, c] of [...cells]) if (c.register === register && c.row_key === row_key) { segs.add(c.segment_sha); cells.delete(k); index.delete(k); }
      return { segments: [...segs] };
    },
    repoint({ from, to, places = new Map() }) {
      for (const c of cells.values()) {
        if (c.segment_sha !== from) continue;
        const p = places.get(c.seg_row);
        Object.assign(c, { segment_sha: to, seg_row: p ? p.row : c.seg_row, byte_at: p ? p.at : null, byte_len: p ? p.len : null });
      }
    },
    rebuildTokens(scope) { return this.rebuild(scope).flatMap(tokensOf); },
    rebuild(scope) {
      const out = [];
      for (const c of cells.values()) {
        if (isObj(scope) && Object.entries(scope).some(([k, v]) => c[k] !== v)) continue;
        const def = termsOf(c.register);
        if (def) out.push(indexRowOf(c, c.cells, def));
      }
      return out.sort((a, b) => (id(a) < id(b) ? -1 : 1));
    },
    /* test-only: corrupt an index row, to show the rebuild notices */
    _corruptIndex(v) { const r = index.get(id(v)); if (r) r.date = "1900-01-01"; },
    _indexRows: () => [...index.values()].map((r) => ({ ...r })),
  };
}

export { compareAmounts };
