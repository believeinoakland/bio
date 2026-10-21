/* control-plane R121 (fix round 4, C5a, P9; K4429, K4428; amends R105, R115): THE DOOR'S CLOCK. The object keeps the stages of an `acquire`
   in its own memory, which a restart loses (plane R73), so the door clocks what it can see from its own isolate: each call it makes to the
   object (`Server-Timing`, one metric per route, the op as the first) and the three phases of an `acquire` (`acquire`, `reading`, `promote`).
   The phases are told by the route the call reaches: the plane's door asks the object `acquire` and then `extractread`, through the `env`
   the door hands it or the `stub` it hands, and both are the clocked ones here; the door's own promotion is clocked by the door. Nothing
   here is read from the caller: a metric is an op the table declares or a route this code names. */

/** The phase each route of the object opens. */
const PHASE_OF_ROUTE = Object.freeze({ acquire: "acquire", extractread: "reading" });
const METRIC_MAX = 24;
const TOKEN = /^[a-z0-9_-]{1,48}$/i;

export function makeClock(now = () => Date.now()) {
  const t0 = now();
  const phases = new Map();   /* name -> {start, end|null} */
  const calls = new Map();    /* route -> total ms */
  const since = (t) => Math.max(0, Math.round(t - t0));
  return {
    begin(name) { if (!phases.has(name)) phases.set(name, { start: now(), end: null }); },
    end(name) { const p = phases.get(name); if (p && p.end === null) p.end = now(); },
    call(route, ms) { calls.set(route, (calls.get(route) ?? 0) + Math.max(0, ms)); },
    /** `{acquire, reading, promote}`, each `{started_ms, elapsed_ms}` (and `running: true` while it had not ended) or `null` when not reached. */
    door() {
      const at = now();
      const one = (name) => {
        const p = phases.get(name);
        if (!p) return null;
        return p.end === null ? { started_ms: since(p.start), elapsed_ms: Math.max(0, Math.round(at - p.start)), running: true }
                              : { started_ms: since(p.start), elapsed_ms: Math.max(0, Math.round(p.end - p.start)) };
      };
      return { acquire: one("acquire"), reading: one("reading"), promote: one("promote") };
    },
    /** The `Server-Timing` value: the op first, then one `do-<route>` metric for each route asked of the object. */
    header(op) {
      const name = typeof op === "string" && TOKEN.test(op) ? op : "door";
      const out = [`${name};dur=${Math.max(0, Math.round(now() - t0))}`];
      for (const [route, ms] of calls) {
        if (out.length >= METRIC_MAX) break;
        if (TOKEN.test(route)) out.push(`do-${route};dur=${Math.round(ms)}`);
      }
      return out.join(", ");
    },
  };
}

const routeOf = (input) => {
  try { return new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url).pathname.replace(/^\/+/, "").split("/")[0]; }
  catch { return ""; }
};

/* a stub whose `fetch` is clocked; every other property is the stub's own, and a function keeps the stub as its `this` */
function clockedStub(stub, clock) {
  if (!stub || (typeof stub !== "object" && typeof stub !== "function")) return stub;
  return new Proxy(stub, {
    get(target, key) {
      const v = target[key];
      if (key !== "fetch" || typeof v !== "function") return typeof v === "function" ? (...a) => v.apply(target, a) : v;
      return async (input, init) => {
        const route = routeOf(input);
        const phase = Object.hasOwn(PHASE_OF_ROUTE, route) ? PHASE_OF_ROUTE[route] : null;
        const t = Date.now();
        if (phase) clock.begin(phase);
        try { return await v.call(target, input, init); }
        finally { clock.call(route, Date.now() - t); if (phase) clock.end(phase); }
      };
    },
  });
}

/** The environment as the door and the hooks it calls see it: `STORE.get` answers a clocked stub, everything else is the environment's own. */
export function clockedEnv(env, clock) {
  const store = env && env.STORE;
  if (!store || typeof store.get !== "function") return env;
  const ns = new Proxy(store, {
    get(target, key) {
      const v = target[key];
      if (key === "get" && typeof v === "function") return (...a) => clockedStub(v.apply(target, a), clock);
      return typeof v === "function" ? (...a) => v.apply(target, a) : v;
    },
  });
  return new Proxy(env, { get(target, key) { return key === "STORE" ? ns : target[key]; } });
}

/** `res` with the header; a response whose headers are fixed is made again with the same status and body. */
export function withServerTiming(res, value) {
  if (!res || typeof res !== "object" || !res.headers) return res;
  try { res.headers.set("server-timing", value); return res; }
  catch {
    if (res.status === 101) return res;
    const headers = new Headers(res.headers);
    headers.set("server-timing", value);
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }
}
