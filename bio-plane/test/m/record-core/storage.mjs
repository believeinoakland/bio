/* A Durable Object storage stand-in for record-core's tests, at the plane's shape: `sql.exec(query, ...bindings)`
   answers a CURSOR, as workerd's does, never an array (rows are read by iterating it, or its `toArray()`/`one()`;
   `[0]` or `.length` of it is undefined), and refuses a LIKE or GLOB pattern over workerd's 50 bytes, which
   node:sqlite does not (K313, K316); `transactionSync(fn)` rolls back everything `fn` wrote when it throws and nests
   as savepoints. Over node:sqlite (SQLite, the engine a Durable Object runs). The legacy battery exercises the same
   module inside Miniflare's real Durable Object. */
import { DatabaseSync } from "node:sqlite";
import { RECORD_SCHEMA } from "../../../src/record-core/index.mjs";

export const WORKERD_PATTERN_CAP = 50;
const bind = (v) => (v === undefined ? null : v);

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

/* The patterns a statement would hand SQLite's LIKE or GLOB: its quoted literals, and, when it binds one, every
   string it binds (a superset, so a long bound pattern is never missed). */
export function patternsOf(q, args) {
  const literal = [...q.matchAll(/\b(?:GLOB|LIKE)\s+'((?:[^']|'')*)'/gi)].map((m) => m[1].replace(/''/g, "'"));
  const bound = /\b(?:GLOB|LIKE)\s+\?|\b(?:glob|like)\s*\(/i.test(q) ? args.filter((a) => typeof a === "string") : [];
  return [...literal, ...bound];
}

export function storage({ schema = true } = {}) {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      if (patternsOf(q, args).some((p) => Buffer.byteLength(p) > WORKERD_PATTERN_CAP))
        throw new Error("LIKE or GLOB pattern too complex");
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    },
  };
  const s = {
    sql, db,
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
  if (schema) {
    const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const t of bare.split(";")) if (t.trim()) db.exec(t);
  }
  return s;
}

/* An evidence bucket stand-in: the calls it received, and the objects it holds. */
export function bucket() {
  const held = new Map(), calls = [];
  return {
    calls, held,
    async head(k) { calls.push(["head", k]); return held.has(k) ? { key: k, size: held.get(k).length } : null; },
    async get(k) { calls.push(["get", k]); return held.has(k) ? { key: k, bytes: held.get(k) } : null; },
    async put(k, bytes, opts) { calls.push(["put", k, opts]); held.set(k, bytes); return { key: k }; },
  };
}
