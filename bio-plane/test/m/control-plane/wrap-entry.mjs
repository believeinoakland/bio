/* control-plane R-ONE (fix round 8, K4427; plan section 0): THE COUNTING DOOR. The plane's default export, wrapped so that every Durable Object call by route and every R2
   call of a request is counted and timed, and the counts come back on the answer in the header `x-wrap-calls` (JSON). It is the Worker a Miniflare test runs in place of
   `src/plane/index.mjs`: `scriptPath` and `script` are this file, and the class named `Store` is the plane's own, with its R2 calls counted inside the object. Written once
   here; `r8-words-door`, `r8-bootstrap-fanout`, `r8-hops`, `r8-caseratify-calls` and the seam's Queue count section read it, and so may any job's test (read `readCalls`
   in `wrap-entry-read.mjs` for the parsed form).

     {
       do:     { "<route>": { n, ms } },                     the Worker's calls to the object, by route (the `do-<route>` metrics' own count)
       rpc:    { "<method>": { n, ms } },                    the Worker's calls to the object's RPC methods (draft, groupFields, dispatchMemberRun, ...)
       r2:     { "<bucket>.<method>": { n, ms, bytes } },    the Worker's own calls to R2 (CAPTURES, PUBLISHED); bytes the size of an object got or put
       object: { "<bucket>.<method>": { n, ms, bytes } },    R2 calls made INSIDE the object while it served those requests, summed
     }

   The times are the Worker's clock outside the object's work and carry the R-CLOCK caveat (workerd does not advance `Date.now()` over synchronous work): a wait that is
   an await is real, compute is not seen. A test asserts counts and bytes, and a time only where its plan says so.
   Counted per request: a call after the answer is returned (`waitUntil`, an alarm) belongs to no request and is not in its header. */
import plane, { Store as BaseStore } from "../../../src/plane/index.mjs";
import { AsyncLocalStorage } from "node:async_hooks";

const HEADER = "x-wrap-calls";
const OBJECT_HEADER = "x-wrap-object";
const objectSink = new AsyncLocalStorage();

const add = (sink, kind, key, ms, bytes = 0) => {
  const group = (sink[kind] ??= {});
  const e = (group[key] ??= { n: 0, ms: 0, bytes: 0 });
  e.n += 1; e.ms += ms; e.bytes += bytes;
};
const routeOf = (input) => {
  try { return new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url).pathname.replace(/^\/+/, "").split("/")[0] || "(root)"; }
  catch { return "(unknown)"; }
};
const sizeOf = (x) => {
  if (x == null) return 0;
  if (typeof x === "string") return new TextEncoder().encode(x).length;
  if (typeof x.byteLength === "number") return x.byteLength;
  if (typeof x.size === "number") return x.size;
  return 0;
};

/* the order of the Worker's own calls in a request, for a test that asks how many were in flight together or how long a chain was awaited one after another: with the request header
   `x-wrap-events: 1` every call of the Worker (to the object and to R2) is also listed as [kind, name, startSeq, endSeq] on `x-wrap-events`, the sequence numbers one clock of this
   request's own (an order, never milliseconds: two calls overlap exactly when neither ended before the other began) */
const begin = (sink) => (sink.events ? ++sink.seq : 0);
const finish = (sink, kind, name, s) => { if (sink.events) sink.events.push([kind, name, s, ++sink.seq]); };

/* an R2 bucket whose calls are counted into `sinkOf()` (the request's, or the object's current one); one wrapper for each bucket and kind, for the object keeps what it was
   first handed and refuses another (capture R58), so a binding read twice is the same object twice */
const wrappers = new WeakMap();
function bucket(b, name, sinkOf, kind, stable = false) {
  if (!b || typeof b !== "object") return b;
  const own = wrappers.get(b) ?? new Map();
  wrappers.set(b, own);
  if (stable && own.has(kind)) return own.get(kind);
  const wrapped = new Proxy(b, {
    get(target, key) {
      const v = target[key];
      if (typeof v !== "function") return v;
      return async (...args) => {
        const t0 = Date.now();
        const first = sinkOf();
        const s = first && kind === "r2" ? begin(first) : 0;
        const out = await v.apply(target, args);
        const sink = sinkOf();
        if (sink) add(sink, kind, `${name}.${String(key)}`, Date.now() - t0, key === "put" ? sizeOf(args[1]) : out && typeof out === "object" ? sizeOf(out) : 0);
        if (sink && kind === "r2") finish(sink, "r2", `${name}.${String(key)}`, s);
        return out;
      };
    },
  });
  if (stable) own.set(kind, wrapped);
  return wrapped;
}

/* a Durable Object namespace whose stubs count their fetches by route and their RPC methods, and fold the object's own count (x-wrap-object) into the request's */
function namespace(ns, sink) {
  return new Proxy(ns, {
    get(target, key) {
      const v = target[key];
      if (key !== "get" || typeof v !== "function") return typeof v === "function" ? (...a) => v.apply(target, a) : v;
      return (...a) => {
        const stub = v.apply(target, a);
        return new Proxy(stub, {
          get(st, k) {
            const f = st[k];
            if (k === "fetch" && typeof f === "function") {
              return async (input, init) => {
                const route = routeOf(input), t0 = Date.now(), seq = begin(sink);
                let res;
                try { res = await f.call(st, input, init); } catch (e) { console.error("wrap-entry: the object's fetch threw", route, String((e && e.stack) || e)); throw e; }
                add(sink, "do", route, Date.now() - t0);
                finish(sink, "do", route, seq);
                try {
                  const inner = res && res.headers && typeof res.headers.get === "function" ? res.headers.get(OBJECT_HEADER) : null;
                  if (inner) for (const [name, e] of Object.entries(JSON.parse(inner))) { const g = (sink.object ??= {}); const x = (g[name] ??= { n: 0, ms: 0, bytes: 0 }); x.n += e.n; x.ms += e.ms; x.bytes += e.bytes; }
                } catch { /* a header that is not ours */ }
                return res;
              };
            }
            if (typeof f !== "function") return f;
            return async (...args) => { const t0 = Date.now(); try { return await f.apply(st, args); } finally { add(sink, "rpc", String(k), Date.now() - t0); } };
          },
        });
      };
    },
  });
}

function wrapped(env, sink) {
  return new Proxy(env, {
    get(target, key) {
      if (key === "STORE") return namespace(target.STORE, sink);
      if (key === "CAPTURES" || key === "PUBLISHED") return bucket(target[key], String(key), () => sink, "r2");
      return target[key];
    },
  });
}

export class Store extends BaseStore {
  constructor(ctx, env) {
    const sinkOf = () => objectSink.getStore() ?? null;
    super(ctx, new Proxy(env, {
      get(target, key) {
        if (key === "CAPTURES" || key === "PUBLISHED") return bucket(target[key], String(key), sinkOf, "r2", true);   /* the object keeps what it was first handed (capture R58) */
        return target[key];
      },
    }));
  }
  async fetch(req) {
    const mine = {};
    const res = await objectSink.run(mine, () => super.fetch(req));
    const counted = mine.r2 ?? {};
    const headers = new Headers(res.headers);
    headers.set(OBJECT_HEADER, JSON.stringify(counted));
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }
}

export default {
  async fetch(req, env, ctx) {
    const sink = req.headers.get("x-wrap-events") ? { events: [], seq: 0 } : {};
    const res = await plane.fetch(req, wrapped(env, sink), ctx);
    const headers = new Headers(res.headers);
    if (sink.events) headers.set("x-wrap-events", JSON.stringify(sink.events));
    const body = JSON.stringify({ do: sink.do ?? {}, rpc: sink.rpc ?? {}, r2: sink.r2 ?? {}, object: sink.object ?? {} });
    headers.set(HEADER, body);
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  },
  scheduled: (controller, env, ctx) => plane.scheduled(controller, env, ctx),
};
