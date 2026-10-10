/* publish-schedule's test world: `publication`'s own world (its fixture, an earlier module's; the map's §7), with this
   module created on the same host over the same storage, record, membership, publication and clock, as the plane builds
   it after `publication`. `ps` is this module's instance; `op` runs its ops as the plane's op map does (the control
   plane's `by` and `viewer` stamps in the query, the body as JSON). The group's zone is the test profile's
   (`jurisdictions` R41, America/Halifax, three hours behind UTC in October). */
import { planeWorld, V, SIG, KEY, NOW, MACHINE, infoMd } from "../publication/fixture.mjs";
import { publishScheduleOf, publishScheduleOps } from "../../../src/publish-schedule/index.mjs";

export { V, SIG, KEY, NOW, MACHINE, infoMd };

export function world(opts = {}) {
  const w = planeWorld(opts);
  w.ps = publishScheduleOf(w.host, { storage: w.st, record: w.record, membership: w.membership, publication: w.p,
                                     now: () => w.clock.now });
  w.op = (name, query = {}, body = null) => {
    const url = new URL(`http://do/${name}`);
    for (const [k, v] of Object.entries(query)) if (v != null) url.searchParams.set(k, String(v));
    return publishScheduleOps(w.ps, url, body)[name]();
  };
  return w;
}
