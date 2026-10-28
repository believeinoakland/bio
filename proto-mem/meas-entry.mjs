/* proto-mem (THROWAWAY, measurement only): the plane's own module (src/plane/index.mjs) with a Store subclass that adds RPC methods
   for the measurement driver and a worker `fetch` that routes /__meas/* to them. Everything else is the plane's code, unchanged.
   Nothing here is product code; it is bundled by build-meas.mjs into proto-mem/dist (git-ignored). */
import plane from "../bio-plane/src/plane/index.mjs";
import { Store as Base } from "../bio-plane/src/plane/store.mjs";
import v8 from "node:v8";
import { schedulerOf } from "../bio-plane/src/scheduler/index.mjs";

const GRACE = 5000;   /* scheduler's SCHED_GRACE_MS is not exported; a consumer is due when due(now) <= now + grace */

/* every R2 get/put on CAPTURES is stated in a log line (key tail, the range asked, the object's size), so a piece's byte window can be told from a whole-object read */
function logged(env) {
  const b = env && env.CAPTURES;
  if (!b || typeof b.get !== "function") return env;
  const wrapped = new Proxy(b, { get(t, k) {
    const v = t[k];
    if (k === "get" && typeof v === "function") return async (key, opts) => { const o = await v.call(t, key, opts); try { console.log(JSON.stringify({ meas_r2: { op: "get", key: String(key).slice(-16), range: opts && opts.range ? opts.range : null, size: o ? o.size : null } })); } catch { /* */ } return o; };
    if (k === "put" && typeof v === "function") return async (key, val, opts) => { const o = await v.call(t, key, val, opts); try { console.log(JSON.stringify({ meas_r2: { op: "put", key: String(key).slice(-16), size: o ? o.size : null } })); } catch { /* */ } return o; };
    return typeof v === "function" ? v.bind(t) : v;
  } });
  return new Proxy(env, { get(t, k) { return k === "CAPTURES" ? wrapped : t[k]; } });
}

export class Store extends Base {
  constructor(ctx, env) { super(ctx, logged(env)); if (globalThis.__measGate === undefined) globalThis.__measGate = env.MEAS_GATE === "1"; }
  /* the gate: while closed, the platform's own alarm does nothing (it is not re-armed either), so the driver ticks consumers by hand */
  async alarm() { if (globalThis.__measGate) return; return await super.alarm(); }
  async measGate(closed) { globalThis.__measGate = !!closed; if (closed) await this.ctx.storage.deleteAlarm(); return globalThis.__measGate; }
  async measAlarmAt() { return await this.ctx.storage.getAlarm(); }
  async measRegistry() { return schedulerOf(this.ctx, this.env).registry(null).map((c) => c.name); }
  /* one consumer's due check and (when due, or forced) its tick, as the scheduler's onAlarm runs it */
  async measTick(name, { force = false, now = Date.now() } = {}) {
    const s = schedulerOf(this.ctx, this.env);
    const c = s.registry(null).find((x) => x.name === name);
    if (!c) return { name, missing: true };
    const out = { name };
    try { out.due = await c.due(now); } catch (e) { out.due_error = String(e && e.message || e); }
    out.was_due = out.due !== null && out.due !== undefined && out.due <= now + GRACE;
    if (!out.was_due && !force) return out;
    const t0 = Date.now();
    try { const r = await c.tick(now, (items, at = now) => s.rank(items, at), t0); out.result = JSON.stringify(r === undefined ? null : r).slice(0, 300); }
    catch (e) { out.error = String(e && e.message || e).slice(0, 300); }
    out.ms = Date.now() - t0;
    return out;
  }
  /* the real onAlarm, whole (every due consumer in the registry's order, as the platform's alarm runs it) */
  async measOnAlarm() { return await schedulerOf(this.ctx, this.env).onAlarm(Date.now()); }
  /* tries to get a real collection: node:v8 flags + vm, else a churn of short-lived allocations (which makes V8 run its own major collections) */
  async measGc(mode = "try", mb = 400) {
    const out = {};
    try { out.hs0 = v8.getHeapStatistics ? v8.getHeapStatistics() : null; } catch (e) { out.hs_error = String(e && e.message); }
    if (mode === "try") {
      try { v8.setFlagsFromString("--expose-gc"); const g = (await import("node:vm")).runInNewContext("gc"); out.gc_fn = typeof g; if (typeof g === "function") { g(); out.gc_called = true; } } catch (e) { out.gc_error = String(e && e.message).slice(0, 200); }
    } else if (mode === "old") {
      /* long-lived allocations (held across several turns, so V8 promotes them to old space) dropped again: old space grows past its limit and V8 runs a major collection */
      let rounds = 0;
      for (let i = 0; i < Math.max(1, Math.round(mb / 48)); i++) {
        let hold = []; for (let j = 0; j < 160000; j++) hold.push({ k: j, s: "old" + i + ":" + j });
        for (let t = 0; t < 4; t++) await new Promise((r) => setTimeout(r, 5));
        hold = null; rounds++;
      }
      out.rounds = rounds;
    } else {
      let keep = 0;
      for (let i = 0; i < mb / 8; i++) { const a = []; for (let j = 0; j < 20000; j++) a.push({ k: i * j, s: "x" + j + "y" + i }); keep += a.length; await new Promise((r) => setTimeout(r, 0)); }
      out.churned_objects = keep;
    }
    try { out.hs1 = v8.getHeapStatistics ? v8.getHeapStatistics() : null; } catch { /* */ }
    return out;
  }
  async measSql(sql, ...params) { return [...this.ctx.storage.sql.exec(sql, ...params)]; }
}

export default {
  ...plane,
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (!u.pathname.startsWith("/__meas/")) return plane.fetch(req, env, ctx);
    const stub = env.STORE.get(env.STORE.idFromName("bio"));
    const body = req.method === "POST" ? await req.json() : {};
    const m = u.pathname.slice(8);
    let r;
    try {
      if (m === "gate") r = await stub.measGate(body.closed);
      else if (m === "alarmat") r = await stub.measAlarmAt();
      else if (m === "registry") r = await stub.measRegistry();
      else if (m === "tick") r = await stub.measTick(body.name, body);
      else if (m === "onalarm") r = await stub.measOnAlarm();
      else if (m === "gc") r = await stub.measGc(body.mode, body.mb);
      else if (m === "sql") r = await stub.measSql(body.sql, ...(body.params || []));
      else return new Response("no such meas route", { status: 404 });
    } catch (e) { return new Response(JSON.stringify({ error: String(e && e.message || e), stack: String(e && e.stack || "").slice(0, 600) }), { status: 500 }); }
    return new Response(JSON.stringify({ r: r === undefined ? null : r }), { headers: { "content-type": "application/json" } });
  },
};
