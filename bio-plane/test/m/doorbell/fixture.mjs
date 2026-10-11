/* doorbell's test fixture: capture's own (a Durable Object storage stand-in over node:sqlite, record-core's,
   membership's and credentials' tables, provenance's read contract, an evidence bucket and the providers' stand-ins;
   `test/m/capture/fixture.mjs`, which this module may import, capture being earlier in the order), with this module's
   instance made over the same storage and capture's instance (`doorbellOf(ctx, {capture})`, R25). `c` is the doorbell;
   `cap` is capture, which keeps its own copy of the doorbell's tables' declaration (K625), so every fixture also runs
   R25's held arm. */
import { fresh as captureFresh } from "../capture/fixture.mjs";
import { doorbellOf } from "../../../src/doorbell/index.mjs";
export { sha, storage, bucket, governor, provenance, receipt, register, network, H } from "../capture/fixture.mjs";

/* A fresh doorbell over a fresh store; `opts` goes to capture's fixture (env, evidence, gov, prov). */
export function fresh(opts = {}) {
  const f = captureFresh(opts);
  const c = doorbellOf({ storage: f.s }, { capture: f.c });
  return { ...f, cap: f.c, c, ctx: { storage: f.s } };
}
