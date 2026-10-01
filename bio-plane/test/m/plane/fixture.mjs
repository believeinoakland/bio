/* plane's test fixture: the Durable Object class constructed for real over a Durable Object storage at the plane's shape
   (node:sqlite behind `sql.exec` answering a cursor, as workerd's does), every module it builds real. `cloudflare:workers`,
   which plain node cannot resolve, is answered by an in-thread resolve hook with a stand-in `DurableObject` class;
   nothing else is stubbed. `store(db)` builds one object over `db` (a fresh database by default), so two constructions
   can share one storage. */
import { registerHooks } from "node:module";
import { DatabaseSync } from "node:sqlite";

registerHooks({
  resolve(spec, ctx, next) {
    if (spec === "cloudflare:workers")
      return { url: "data:text/javascript,export class DurableObject{constructor(c,e){this.ctx=c;this.env=e}};export const env={};",
               shortCircuit: true };
    return next(spec, ctx);
  },
});

export const { Store, STEP_ORDER } = await import("../../../src/plane/store.mjs");

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

/** A storage over `db`: `sql.exec`, a synchronous transaction, the alarm calls, and the blocked work recorded. */
export function storage(db = new DatabaseSync(":memory:")) {
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
    },
    get databaseSize() { return 0; },
  };
  let alarm = null;
  const blocked = [];
  const ctx = {
    storage: { sql, transactionSync: (fn) => fn(), getAlarm: async () => alarm, setAlarm: async (t) => { alarm = t; },
               deleteAlarm: async () => { alarm = null; } },
    id: { equals: () => false, toString: () => "do" },
    blockConcurrencyWhile(fn) { const p = fn(); blocked.push(p); return p; },
    waitUntil() {},
  };
  return { db, ctx, blocked };
}

/** One object, constructed and settled (its migration and starts run). `routes(path, body)` answers its route map;
 *  `call(path, body)` the route the path names, awaited, as the frame does; `fetch(path, init)` the object's own door. */
export async function store({ db, env: extra } = {}) {
  const st = storage(db);
  const env = { STORE: { idFromName: (n) => n }, ...(extra || {}) };
  const s = new Store(st.ctx, env);
  for (const p of st.blocked) await p;
  const routes = (path, body = null) => s.routes(new URL("http://do" + path), body);
  const call = async (path, body = null) => {
    const op = new URL("http://do" + path).pathname.slice(1), map = routes(path, body);
    if (!Object.hasOwn(map, op)) throw new Error(`no route ${op}`);
    return JSON.parse(JSON.stringify(await map[op]() ?? null));
  };
  const fetch = async (path, init) => s.fetch(new Request("http://do" + path, init));
  return { s, ctx: st.ctx, db: st.db, env, routes, call, fetch };
}
