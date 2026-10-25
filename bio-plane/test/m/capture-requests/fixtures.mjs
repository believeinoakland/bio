/* capture-requests' published fixtures (K4990, K4993, K4995, K5044): each is made by this module's real code when a test runs and never stored. A later
   module's test takes the answer from here instead of hand-building capture-requests' answer. Each is checked by `fixtures.test.mjs`, which calls it and
   compares the real answer. */
import { world } from "./fixture.mjs";

/** `sweepScopeRegistrar` (R45): the real refusal of a second registration of the sweep-scope check. `first` is the registration that holds the slot (`{ok: true,
 *  module}`), `again` the real `registerSweepScope` answer when another module registers (`{ok: false, reason: "LISTENER_DECLARED", module: <the holder>, ...}`). */
export function sweepScopeRegistrar({ holder = "link-sweep", other = "another-module" } = {}) {
  const w = world().scene();
  const check = () => ({ ok: true, scope: [] });
  const first = w.cr.registerSweepScope(holder, check);
  const again = w.cr.registerSweepScope(other, check);
  return { first, again, holder, other };
}
