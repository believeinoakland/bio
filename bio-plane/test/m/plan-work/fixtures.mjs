/* plan-work's published fixtures (fix round 10, Wave A batch 4; K4990, K4993, K4995, K5044): what a user module's test takes
   in place of plan-work's answers. Each is made by this module's real code, over the real modules it uses (./fixture.mjs),
   each time a test calls one, and is never stored. */
import { world } from "./fixture.mjs";

/** R9: `registerWatchReader`, the one registration of the module that reads the plan's watches. `registered` is the first
 *  registration (`{ok: true, module}`); `again` a second one, by that module or another (`LISTENER_DECLARED`, one registration
 *  only); `noModule` and `noReader` the registrations without a module name or without a reader function
 *  (`LISTENER_MALFORMED`), each made on a world of its own so that no registration precedes them. */
export function watchReaderRegistrar() {
  const w = world();
  const reader = () => [];
  const registered = w.pw.registerWatchReader("following", reader);
  const again = w.pw.registerWatchReader("monitoring", reader);
  const fresh = world().pw;
  return { planWork: w.pw, world: w, reader, registered, again,
           noModule: fresh.registerWatchReader("", reader),
           noReader: world().pw.registerWatchReader("following", null) };
}
