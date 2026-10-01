/* legacy-store's test fixture: the store's Durable Object class constructed for real over a Durable Object storage at
   the plane's shape (node:sqlite behind `sql.exec` answering a cursor, as workerd's does), every module it constructs
   real. `store.mjs` imports `cloudflare:workers`, which plain node cannot resolve; control-plane's harness answers that
   one specifier with a stand-in `DurableObject`, and nothing else is stubbed. The class driven is the one the plane
   runs, control-plane's `Store`, which extends this module's and answers `fetch` through its dispatch frame. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import "../control-plane/harness.mjs";

export const D = await import("../../../src/control-plane/dispatch.mjs");
export const { Store: LegacyStore } = await import("../../../src/store.mjs");

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() { const rest = c.toArray(); if (rest.length !== 1) throw new Error(`expected one row, got ${rest.length}`); return rest[0]; },
  };
  return c;
}

/** One store, constructed and settled (its migration and starts run). `call(path, body)` drives its `fetch` and answers
 *  the envelope's `result`; `routes(path, body)` answers its route map for that request. */
export async function store() {
  const db = new DatabaseSync(":memory:");
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    },
    get databaseSize() { return 0; },
  };
  const blocked = [];
  const ctx = {
    storage: { sql, transactionSync: (fn) => fn(), getAlarm: async () => null, setAlarm: async () => {}, deleteAlarm: async () => {} },
    id: { equals: () => false, toString: () => "do" },
    blockConcurrencyWhile(fn) { const p = fn(); blocked.push(p); return p; },
    waitUntil() {},
  };
  const env = { STORE: { idFromName: (n) => n } };
  const s = new D.Store(ctx, env);
  for (const p of blocked) await p;
  const req = (path, body) => new Request("http://do" + path,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  const call = async (path, body) => (await (await s.fetch(req(path, body))).json()).result;
  const routes = (path, body = null) => s.routes(new URL("http://do" + path), body);
  return { s, ctx, env, call, routes };
}
