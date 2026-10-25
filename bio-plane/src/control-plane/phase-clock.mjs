import { AsyncLocalStorage } from "node:async_hooks";
/* control-plane R121 (fix round 4, C5a, P9; K4429, K4428; amends R105, R115): THE DOOR'S CLOCK. The object keeps the stages of an `acquire`
   in its own memory, which a restart loses (plane R73), so the door clocks what it can see from its own isolate: each call it makes to the
   object (`Server-Timing`, one metric per route, the op as the first) and the three phases of an `acquire` (`acquire`, `reading`, `promote`).
   The phases are told by the route the call reaches: the plane's door asks the object `acquire` and then `extractread`, through the `env`
   the door hands it or the `stub` it hands, and both are the clocked ones here; the door's own promotion is clocked by the door. Nothing
   here is read from the caller: a metric is an op the table declares or a route this code names.
   R128 (fix round 8, review G4; K4817): and the entries a MODULE states. The object states its own time in its answer's `server-timing: object;dur=<ms>`;
   any other entry it states there (`fleet;dur=7`, `rows-queue;dur=2`, `queue-count;desc=hit`) is carried into the answer's `Server-Timing`, token-checked
   (a name of letters, digits, `_` and `-`, a `dur` that is a plain number, a `desc` that is a short token or a short quoted run of those and spaces), the
   first of a name only, never one that is the door's own (`do-`, `in-`, `body`, `bytes`, the op), at most METRIC_MAX in all, the door's own first. And the
   door adds `body;dur` (the time its readers took over the object's answer bodies) and `bytes;dur` (their length), summed over the request. */

/** The phase each route of the object opens. */
const PHASE_OF_ROUTE = Object.freeze({ acquire: "acquire", extractread: "reading" });
const METRIC_MAX = 64;
/* R129 (fix round 8, G106; K4852): when this isolate's FIRST request began, so the age of the isolate at a request is told. Taken lazily at the first `makeClock`: workerd's
   clock reads 0 at the module's global scope, so a start taken at load would make every age an epoch. */
let isolateStarted = null;
const TOKEN = /^[a-z0-9_-]{1,48}$/i;

/* R128: the entries a module states, from a `server-timing` header value; each `{name, params}` whose name is a token and whose every param is `dur` (a plain number)
   or `desc` (a short token, or a short quoted run of token characters and spaces); an entry with any other param, or none, is dropped whole */
const DUR = /^\d{1,12}(?:\.\d{1,6})?$/;
const DESC = /^[A-Za-z0-9_.:-]{1,48}$/;
const DESC_QUOTED = /^"[A-Za-z0-9_.: -]{1,48}"$/;
const OWN = /^(?:do-|in-|bytes-)/i;
const RESERVED = new Set(["object", "body", "bytes"]);
export function statedEntries(header) {
  const out = [];
  if (typeof header !== "string") return out;
  for (const raw of header.split(",")) {
    const [name, ...params] = raw.trim().split(";").map((x) => x.trim());
    if (!TOKEN.test(name) || OWN.test(name) || RESERVED.has(name.toLowerCase()) || params.length === 0 || params.length > 2) continue;
    const got = {};
    let ok = true;
    for (const p of params) {
      const i = p.indexOf("=");
      const k = i < 0 ? "" : p.slice(0, i).trim().toLowerCase(), v = i < 0 ? "" : p.slice(i + 1).trim();
      if (k === "dur" && DUR.test(v) && got.dur === undefined) got.dur = v;
      else if (k === "desc" && (DESC.test(v) || DESC_QUOTED.test(v)) && got.desc === undefined) got.desc = v;
      else ok = false;
    }
    if (ok) out.push({ name, ...got });
  }
  return out;
}

export function makeClock(now = () => Date.now()) {
  const t0 = now();
  if (isolateStarted === null) isolateStarted = t0;
  const phases = new Map();   /* name -> {start, end|null} */
  const calls = new Map();    /* route -> total ms */
  const inside = new Map();   /* route -> total ms the object states it spent itself (fix round 5, E10 (i)) */
  const stated = new Map();   /* R128: name -> {dur?, desc?}, the first a module states */
  const read = { ms: 0, bytes: 0, any: false };
  const routeBytes = new Map();   /* R128 (K4850): route -> bytes of that route's answer bodies read */   /* R128: the door's read of the object's answer bodies */
  let objectAge = null;   /* R129: the object's age at this request, as the object states it (`object-age;dur=<ms>`, R128), else null */
  const since = (t) => Math.max(0, Math.round(t - t0));
  return {
    begin(name) { if (!phases.has(name)) phases.set(name, { start: now(), end: null }); },
    end(name) { const p = phases.get(name); if (p && p.end === null) p.end = now(); },
    /** Milliseconds since the door took the request. */
    elapsed() { return Math.max(0, now() - t0); },
    call(route, ms) { calls.set(route, (calls.get(route) ?? 0) + Math.max(0, ms)); },
    /** E10 (i): the time the object states for a call, so `do-<route>` less `in-<route>` is the transport. */
    within(route, ms) { if (Number.isFinite(ms)) inside.set(route, (inside.get(route) ?? 0) + Math.max(0, ms)); },
    /** R128: entries a module states in an object answer's header. */
    state(entries) {
      for (const e of entries) {
        if (!stated.has(e.name)) stated.set(e.name, e);
        if (e.name === "object-age" && objectAge === null && e.dur !== undefined) objectAge = Number(e.dur);
      }
    },
    /** R129: the ages of the Worker isolate and of the object, in whole milliseconds (the object's null until it states its age). */
    cold() { return { isolate_ms: Math.max(0, Math.round(now() - isolateStarted)), object_ms: objectAge === null ? null : Math.round(objectAge) }; },
    /** R129: the milliseconds the object's route took beyond what the object states it spent itself (transport, compute and queueing); null when either is unknown. */
    queued(route) { return calls.has(route) && inside.has(route) ? Math.max(0, Math.round(calls.get(route) - inside.get(route))) : null; },
    /** R128 (K4822): the ONE name a module in the Worker states its own measure by, `stateTiming(name, ms)`: handed to the plane's door context (which forwards it to its handlers) and to
     *  instance-setup's `io`; a name the table of tokens refuses, one that is the door's own, or a duration that is no plain number is dropped, never thrown. */
    stateTiming(name, ms, desc) {
      if (typeof name !== "string" || typeof ms !== "number" || !Number.isFinite(ms) || ms < 0 || ms > 1e9) return;
      /* R128 (K4870): an optional third argument, written as the entry's desc when it is a short token; else dropped */
      const d = typeof desc === "string" && DESC.test(desc) ? `;desc=${desc}` : "";
      this.state(statedEntries(`${name};dur=${Math.round(ms)}${d}`));
    },
    /** P24 (fix round 9; R-LOG): the SHAPE of the op asked, never its content: `shape;desc=f<n>:l<limit>` for a request that names `fields` (n = how many, as a count) and/or a
     *  `limit` (a whole number); a request naming neither states nothing. */
    shape(search) {
      let q;
      try { q = search instanceof URLSearchParams ? search : new URLSearchParams(String(search ?? "")); } catch { return; }
      const f = q.get("fields"), l = q.get("limit");
      const n = f === null ? null : f.split(",").filter((x) => x.trim() !== "").length;
      const lim = l !== null && /^[0-9]{1,9}$/.test(l) ? Number(l) : null;
      const parts = [...(n !== null ? [`f${n}`] : []), ...(lim !== null ? [`l${lim}`] : [])];
      if (parts.length) this.stateTiming("shape", 0, parts.join(":"));
    },
    /** R128: one object answer's body was read to its end by the door: the time it took and its length. */
    bodyRead(ms, bytes, route) {
      read.ms += Math.max(0, ms); read.bytes += Math.max(0, bytes); read.any = true;
      if (typeof route === "string" && TOKEN.test(route)) routeBytes.set(route, (routeBytes.get(route) ?? 0) + Math.max(0, bytes));
    },
    /** `{acquire, reading, promote}`, each `{started_ms, elapsed_ms}` (and `running: true` while it had not ended) or `null` when not reached. */
    door() {
      const at = now();
      const one = (name) => {
        const p = phases.get(name);
        if (!p) return null;
        return p.end === null ? { started_ms: since(p.start), elapsed_ms: Math.max(0, Math.round(at - p.start)), running: true }
                              : { started_ms: since(p.start), elapsed_ms: Math.max(0, Math.round(p.end - p.start)) };
      };
      return { acquire: one("acquire"), reading: one("reading"), promote: one("promote"), cold: this.cold() };
    },
    /** The `Server-Timing` value: the op first, then one `do-<route>` metric for each route asked of the object. */
    header(op) {
      const name = typeof op === "string" && TOKEN.test(op) ? op : "door";
      const out = [`${name};dur=${Math.max(0, Math.round(now() - t0))}`];
      for (const [route, ms] of calls) {
        if (out.length >= METRIC_MAX) break;
        if (TOKEN.test(route)) out.push(`do-${route};dur=${Math.round(ms)}`);
        if (inside.has(route) && TOKEN.test(route) && out.length < METRIC_MAX) out.push(`in-${route};dur=${Math.round(inside.get(route))}`);
      }
      if (read.any && out.length < METRIC_MAX) out.push(`body;dur=${Math.round(read.ms)}`);
      if (read.any && out.length < METRIC_MAX) out.push(`bytes;dur=${Math.round(read.bytes)}`);
      /* R128 (K4850): the bytes of the five routes with the most, each `bytes-<route>;dur=<n>`, after the door's own */
      const largest = [...routeBytes].sort((a, b) => b[1] - a[1]).slice(0, 5);
      for (const [route, n] of largest) {
        if (out.length >= METRIC_MAX) break;
        out.push(`bytes-${route};dur=${Math.round(n)}`);
      }
      for (const e of stated.values()) {
        if (out.length >= METRIC_MAX) break;
        if (e.name === name) continue;
        out.push([e.name, e.dur !== undefined ? `dur=${e.dur}` : null, e.desc !== undefined ? `desc=${e.desc}` : null].filter(Boolean).join(";"));
      }
      return out.join(", ");
    },
  };
}

const routeOf = (input) => {
  try { return new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url).pathname.replace(/^\/+/, "").split("/")[0]; }
  catch { return ""; }
};

/* E10 (i): the object states its own time in an answer's `server-timing: object;dur=<ms>`; null when it states none */
function objectTime(res) {
  try {
    const h = res && res.headers && typeof res.headers.get === "function" ? res.headers.get("server-timing") : null;
    const m = h ? /(?:^|,)\s*object;[^,]*?dur=(\d+(?:\.\d+)?)/i.exec(h) : null;
    return m ? Number(m[1]) : null;
  } catch { return null; }
}

/* R128: the answer, its body passed through a counter that tells the clock the time the door's reader took over it and its length when it has been read to its end */
function counted(res, clock, route) {
  if (!res || !res.body || typeof res.status !== "number" || res.status === 101) return res;
  const began = Date.now();
  let n = 0;
  const counter = new TransformStream({
    transform(chunk, controller) { n += chunk.byteLength ?? chunk.length ?? 0; controller.enqueue(chunk); },
    flush() { clock.bodyRead(Date.now() - began, n, route); },
  });
  return new Response(res.body.pipeThrough(counter), { status: res.status, statusText: res.statusText, headers: res.headers });
}

/* a stub whose `fetch` is clocked; every other property is the stub's own, and a function keeps the stub as its `this`, called as `target[key](...)` and never through `.apply` (on a workerd RPC stub `.apply` is itself a remote call, K5131) */
function clockedStub(stub, clock) {
  if (!stub || (typeof stub !== "object" && typeof stub !== "function")) return stub;
  return new Proxy(stub, {
    get(target, key) {
      const v = target[key];
      if (key !== "fetch" || typeof v !== "function") return typeof v === "function" ? (...a) => target[key](...a) : v;
      return async (input, init) => {
        const route = routeOf(input);
        const phase = Object.hasOwn(PHASE_OF_ROUTE, route) ? PHASE_OF_ROUTE[route] : null;
        const t = Date.now();
        if (phase) clock.begin(phase);
        try {
          const res = await v.call(target, input, init);
          const stated = objectTime(res);
          if (stated !== null) clock.within(route, stated);
          clock.state(statedEntries(res && res.headers && typeof res.headers.get === "function" ? res.headers.get("server-timing") : null));
          return counted(res, clock, route);
        }
        finally { clock.call(route, Date.now() - t); if (phase) clock.end(phase); }
      };
    },
  });
}

/* The request whose clock the object's calls are told on. The environment the hooks see must be ONE object for the isolate's life, not a new one for each request: a module that keeps
   what it learned per environment (instance-setup's fleet versions, kept 60 s per `env`, G118) would otherwise never find its own entry. So the clocked environment is made once for an
   `env` and reads the request's clock from the request's async context (`withClock`). */
const current = new AsyncLocalStorage();
const NO_CLOCK = Object.freeze({ begin() {}, end() {}, call() {}, within() {}, state() {}, bodyRead() {} });
export const withClock = (clock, fn) => current.run(clock, fn);
const clockedEnvs = new WeakMap();

/** The environment as the door and the hooks it calls see it: `STORE.get` answers a clocked stub, everything else is the environment's own. The same object for the same `env`. */
export function clockedEnv(env, clock) {
  const store = env && env.STORE;
  if (!store || typeof store.get !== "function") return env;
  const kept = clockedEnvs.get(env);
  if (kept) return kept;
  const ns = new Proxy(store, {
    get(target, key) {
      const v = target[key];
      if (key === "get" && typeof v === "function") return (...a) => clockedStub(target.get(...a), current.getStore() ?? NO_CLOCK);
      return typeof v === "function" ? (...a) => target[key](...a) : v;
    },
  });
  const made = new Proxy(env, { get(target, key) { return key === "STORE" ? ns : target[key]; } });
  clockedEnvs.set(env, made);
  return made;
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
