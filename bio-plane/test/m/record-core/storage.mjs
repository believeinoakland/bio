/* A Durable Object storage stand-in for record-core's tests: `sql.exec(query, ...bindings)` returning
   the rows as an iterable, and `transactionSync(fn)`, which rolls back everything `fn` wrote when it
   throws and nests as savepoints, over node:sqlite (SQLite, the engine a Durable Object runs). The
   legacy battery exercises the same module inside Miniflare's real Durable Object. */
import { DatabaseSync } from "node:sqlite";
import { RECORD_SCHEMA } from "../../../src/record-core/index.mjs";

export function storage({ schema = true } = {}) {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.all(...args.map((a) => (a === undefined ? null : a)));
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
