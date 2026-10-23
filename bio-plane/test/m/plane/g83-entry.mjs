/* plane R95 (fix round 7, G83), the platform check L: the plane's own Worker and `Store` booted on workerd by `g83-location.test.mjs` under Miniflare, with `env.STORE`
   handed to the plane's default export as a RECORDING proxy over the real binding: every `get()` the Worker makes is noted with its arguments (the id's name and the second
   argument, or none). `/__g83/calls` answers the record, `/__g83/reset` clears it; every other request is the plane's own door. The object (`Store`) is the plane's, and gets
   the real env. */
import plane from "../../../src/plane/index.mjs";
export { Store } from "../../../src/plane/store.mjs";

const calls = [];
const recording = (env) => new Proxy(env, { get(target, key) {
  const v = target[key];
  if (key !== "STORE") return typeof v === "function" ? v.bind(target) : v;
  return new Proxy(v, { get(ns, p) {
    const f = ns[p];
    if (p === "get") return (...a) => { calls.push({ name: a[0] && a[0].name, argc: a.length, options: a[1] }); return ns.get(...a); };
    return typeof f === "function" ? f.bind(ns) : f;
  } });
} });
const json = (v) => new Response(JSON.stringify(v), { headers: { "content-type": "application/json" } });

export default {
  async fetch(req, env, ctx) {
    const path = new URL(req.url).pathname;
    if (path === "/__g83/calls") return json(calls);
    if (path === "/__g83/reset") { calls.length = 0; return json({ ok: true }); }
    return plane.fetch(req, recording(env), ctx);
  },
  async scheduled(controller, env, ctx) { return plane.scheduled(controller, recording(env), ctx); },
};
