/* proto-mem/1f (THROWAWAY probe, not product code): the deployable probe Worker. Two container classes: MinProbe (a bare node image, probe/image-min) and ReaderProbe (the reader-container image source, vendor/reader-container).
   Both are reached only through their Durable Object (Worker -> DO -> container), as reader-container's own Worker does; no internet (enableInternet false); the ONLY thing the container can reach is the
   host name r2.local, which the class's outbound handler answers from the bucket binding PROBE_R2 (P-M17 (b)). Routes: routes.mjs. */
import { Container, ContainerProxy } from "@cloudflare/containers";
import { handle } from "./routes.mjs";
export { ContainerProxy };

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const r2local = async (req, env) => {
  const key = decodeURIComponent(new URL(req.url).pathname.slice(1));
  const o = await env.PROBE_R2.get(key);
  return o ? new Response(o.body, { headers: { "content-length": String(o.size), "content-type": "application/octet-stream" } }) : new Response("no such key", { status: 404 });
};

class Base extends Container {
  defaultPort = 8080;
  sleepAfter = "5m";
  enableInternet = false;
  static outboundByHost = { "r2.local": r2local };
  constructor(ctx, env) { super(ctx, env); if (env.PROBE_SLEEP_AFTER) this.sleepAfter = env.PROBE_SLEEP_AFTER; }
  /* a short event log in the object's own storage: when the container started and stopped (reasons), for cold-start / idle / restart questions */
  async rec(kind, extra = {}) { try { const ev = (await this.ctx.storage.get("events")) || []; ev.push({ t: Date.now(), kind, ...extra }); await this.ctx.storage.put("events", ev.slice(-200)); } catch { /* the log is a convenience */ } }
  async onStart() { await this.rec("onStart"); }
  async onStop(p) { await this.rec("onStop", { exitCode: p && p.exitCode, reason: p && p.reason }); }
  async fetch(request) {
    const u = new URL(request.url);
    if (u.pathname === "/__state") return json({ now: Date.now(), state: await this.getState(), events: (await this.ctx.storage.get("events")) || [], sleepAfter: this.sleepAfter });
    if (u.pathname === "/__stop") { const s = u.searchParams.get("signal") || "SIGTERM"; if (s !== "SIGTERM" && s !== "SIGKILL") return json({ ok: false }, 400); const t = Date.now(); await this.stop(s); await this.rec("stop-called", { signal: s }); return json({ ok: true, signal: s, at: t }); }
    return this.containerFetch(request, this.defaultPort);
  }
}
export class MinProbe extends Base {}
export class ReaderProbe extends Base {}

export default {
  async fetch(request, env, ctx) {
    return handle(request, env, ctx, { instance: (which, name) => { const ns = which === "reader" ? env.READER_PROBE : env.MIN_PROBE; return ns.get(ns.idFromName(name)); } });
  },
};
