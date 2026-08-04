/* REC-52's instrument: MAKE THE DURABLE OBJECT ACTUALLY FAIL.
 *
 * The defect this item closes only exists on the path where the store does not
 * answer, and that path is unreachable from a normal suite: every miniflare
 * Durable Object in this battery works. Testing it by hand-feeding the control
 * plane a fake `{ok:false}` would be testing a belief about the envelope rather
 * than the envelope — the same "a copy that agrees at zero cost" failure this
 * project has measured five times.
 *
 * So this module is the real worker with a real store BEHIND a subclass that
 * refuses named Durable Object paths in the store's OWN failure envelope:
 *
 *     { ok: false, error: <string> }   at HTTP 500
 *
 * which is byte-for-byte the shape `Store.fetch`'s own catch block produces
 * (store.mjs: `return Response.json({ ok: false, error: String(e && e.stack ||
 * e) }, { status: 500 })`). Nothing here simulates the control plane, and
 * NOTHING ON DISK IS MUTATED — `src/index.mjs` and `src/store.mjs` are imported
 * exactly as they ship, so what the suite drives is the shipped code.
 *
 * WHY A SUBCLASS AND NOT A REPLACEMENT: the injection has to be switchable
 * mid-run so that the SAME instance answers honestly with the injection off and
 * refuses with it on. A pair of separately-built stores would prove nothing —
 * two different stores can differ for two different reasons. `super.fetch` runs
 * the genuine store for every path that is not currently poisoned, so the
 * "genuine not-published still reads as not-published" arm and the "a silence
 * is not an absence" arm are answered by one store, one dataset, one run.
 *
 * The control channel is `/__failpaths?paths=a,b,c` on the WORKER, which
 * forwards to the store's own `__failpaths` so the switch lives on the Durable
 * Object instance that will be consulted. Passing no paths clears it. The
 * control answers with the list it is now holding, so a suite can assert the
 * injection took rather than assuming it — and every arm below is additionally
 * self-checking, because the honest refusal it looks for can only be produced
 * by a failure that actually happened.
 */
import worker, { Store as RealStore } from "../../src/index.mjs";

export class Store extends RealStore {
  async fetch(req) {
    const u = new URL(req.url);
    const path = u.pathname.slice(1);
    if (path === "__failpaths") {
      this.__failPaths = (u.searchParams.get("paths") || "").split(",").filter(Boolean);
      return Response.json({ ok: true, result: { failing: this.__failPaths } });
    }
    if ((this.__failPaths || []).includes(path))
      /* The store's own catch-block envelope, not an invented one. */
      return Response.json({ ok: false,
        error: `Error: REC-52 injected Durable Object failure at /${path}\n    at Store.fetch` },
        { status: 500 });
    return super.fetch(req);
  }
}

export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname === "/__failpaths") {
      const stub = env.STORE.get(env.STORE.idFromName(u.searchParams.get("store") || "bio"));
      return stub.fetch("http://ctl/__failpaths?paths="
        + encodeURIComponent(u.searchParams.get("paths") || ""));
    }
    return worker.fetch(req, env, ctx);
  },
};
