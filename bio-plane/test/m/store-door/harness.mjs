/* store-door's test harness: `cloudflare:workers`, which a module this door routes to imports (`src/queuestate.mjs`) and
   plain node cannot resolve, answered by an in-thread resolve hook with a stand-in `DurableObject` class; and `quietly`,
   which runs a call with `console.error` captured, so R6's log line is read rather than printed. Nothing else is stubbed;
   every test drives the module at its interface. */
import { registerHooks } from "node:module";

registerHooks({
  resolve(spec, ctx, next) {
    if (spec === "cloudflare:workers")
      return { url: "data:text/javascript,export class DurableObject{constructor(c,e){this.ctx=c;this.env=e}};export const env={};",
               shortCircuit: true };
    return next(spec, ctx);
  },
});

export const D = await import("../../../src/store-door/dispatch.mjs");
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Runs `fn` with `console.error` captured; answers its value and the lines logged. */
export async function quietly(fn) {
  const logged = [];
  const orig = console.error;
  console.error = (...a) => logged.push(a.join(" "));
  try { return { value: await fn(), logged }; } finally { console.error = orig; }
}

/** Asks the door at `path`, with `init` (method, body, headers); answers the status and the parsed answer. */
export async function go(store, path, init) {
  const r = await D.dispatch(new Request(`http://do/${path}`, init), store);
  return { status: r.status, json: await r.json() };
}
