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
 *     { ok: false, reason: "STORE_INTERNAL_ERROR", code, check, translation, correlation }   at HTTP 500
 *
 * which is the envelope `Store.fetch`'s own catch block produces, BUILT BY THE
 * SAME FUNCTION (store.mjs `storeInternalError`) from a real thrown Error.
 * D-629 CORRECTED THIS: the fixture used to hand-write `{ ok: false, error:
 * "Error: … at Store.fetch" }` as a byte-for-byte copy of the old catch, which
 * answered the caller the stack; that envelope was the disclosure D-629 closed,
 * so a copy of it is no longer the store's shape and would have gone on
 * testing the control plane against an envelope the store never sends. Calling
 * the helper keeps the fixture honest when the envelope moves again.
 * Nothing here simulates the control plane, and
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
import { storeInternalError } from "../../src/store.mjs";

export class Store extends RealStore {
  async fetch(req) {
    const u = new URL(req.url);
    const path = u.pathname.slice(1);
    if (path === "__failpaths") {
      this.__failPaths = (u.searchParams.get("paths") || "").split(",").filter(Boolean);
      return Response.json({ ok: true, result: { failing: this.__failPaths } });
    }
    if ((this.__failPaths || []).includes(path))
      /* The store's own catch-block envelope, built by the store's own helper (D-629). */
      return Response.json(storeInternalError(new Error(`REC-52 injected Durable Object failure at /${path}`), path),
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
