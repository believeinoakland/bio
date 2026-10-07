/* answer-envelope's test loader: the module under plain node. The totality arms (R7) import every product file of the
   plane, and plane's `src/plane/store.mjs` imports `cloudflare:workers`, which plain node cannot resolve, so that one
   specifier is answered here by an in-thread resolve hook with a stand-in `DurableObject` class, as control-plane's
   harness does; nothing else is stubbed. */
import { registerHooks } from "node:module";

registerHooks({
  resolve(spec, ctx, next) {
    if (spec === "cloudflare:workers")
      return { url: "data:text/javascript,export class DurableObject{constructor(c,e){this.ctx=c;this.env=e}};export const env={};",
               shortCircuit: true };
    return next(spec, ctx);
  },
});

export const M = await import("../../../src/answer-envelope/index.mjs");
