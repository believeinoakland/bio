/* legacy-store's test fixture: the store's Durable Object class constructed for real over a Durable Object storage at
   the plane's shape (node:sqlite behind `sql.exec` answering a cursor, as workerd's does), every module it constructs
   real. `store.mjs` imports `cloudflare:workers`, which plain node cannot resolve: that one specifier is answered here
   by an in-thread resolve hook with a stand-in `DurableObject` class, and nothing else is stubbed. The interface driven
   is this module's: the class's route map, each route answered as the plane's frame answers it (`await map[op]()`). */
import { registerHooks } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";

registerHooks({
  resolve(spec, ctx, next) {
    if (spec === "cloudflare:workers")
      return { url: "data:text/javascript,export class DurableObject{constructor(c,e){this.ctx=c;this.env=e}};export const env={};",
               shortCircuit: true };
    return next(spec, ctx);
  },
});

export const { Store } = await import("../../../src/store.mjs");
const { promotionOf } = await import("../../../src/promotion/index.mjs");

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

/** One store, constructed and settled (its migration and starts run). `routes(path, body)` answers its route map for
 *  that request; `call(path, body)` answers the route the path names, awaited, as the frame does (`body` absent is a
 *  GET's null). */
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
  const s = new Store(ctx, env);
  for (const p of blocked) await p;
  /* The producing group is instance-setup's fact (layer 11, after this module); its stand-in names the fixtures' group. */
  promotionOf(ctx).registerFact("producingGroup", "instance-setup", () => "believe-in-oakland");
  const routes = (path, body = null) => s.routes(new URL("http://do" + path), body);
  const call = async (path, body = null) => {
    const op = new URL("http://do" + path).pathname.slice(1), map = routes(path, body);
    if (!Object.hasOwn(map, op)) throw new Error(`no route ${op}`);
    return JSON.parse(JSON.stringify(await map[op]() ?? null));
  };
  return { s, ctx, env, call, routes };
}
