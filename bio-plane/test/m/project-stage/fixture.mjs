/* project-stage over the modules it reads, every one the real one (K253): record-core, membership, promotion, inquiry,
   basis-versions and publication (whose tables R3 reads, under its R40) on publication's own test world over storage
   shaped as workerd's (K316), and this module through its own factory on the same host. Every test drives
   `projectStage` at its interface, directly and through this module's own op map (`projectStageOps`), and changes the
   record only through the acts of the modules that own it, or, for a bound, by rows as the record holds them. */
import { planeWorld, V, NOW, SIG } from "../publication/fixture.mjs";
import { projectStageOf, projectStageOps } from "../../../src/project-stage/index.mjs";

export { V, NOW, SIG };

export function world(opts = {}) {
  const w = planeWorld(opts);
  w.s = projectStageOf(w.host, { record: w.record, membership: w.membership, inquiry: w.k, basisVersions: w.basisVersions });
  /** One of this module's ops, as the control plane routes it: the query as the control plane stamped it. */
  w.op = (name, query = {}) => {
    const url = new URL(`https://plane.invalid/?op=${name}`);
    for (const [k, v] of Object.entries(query)) if (v != null) url.searchParams.set(k, String(v));
    return projectStageOps(w.s, url)[name]();
  };
  return w;
}
