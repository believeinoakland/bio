/* control-plane: op=stats' two stamps (N399, K573; proposed R40). Converted from the old battery's
   `test/stats-disclosure.test.mjs`, the half this door answers. `op=stats` lives in legacy-store (`store.mjs`:2020, the
   route at :3033, J1 (1)): which counts each class receives (no `leads`, no `observations`, `observationsNonLead` for all,
   `dbBytes` only with `capacity`) is decided there over record-core's counts. What decides it is two stamps set here from
   the credential: `viewer` (R17), whose sight the counts are taken through, and `capacity`, which is `1` for the `admin`
   class alone.

   Carried: B2 "a caller sending capacity=1/operator=1/proof=1/whole=1 … the server's stamp overwrites it" (here: the
   `capacity` that reaches the store is the server's for every caller, and `operator` is no stamp); B3 "the admin sending
   capacity=0 still receives dbBytes" (the stamp is the server's in both directions); the member shape for the member
   binding, the probe and every member session, the admin shape for the admin binding and the founder's session (as the
   `capacity` each is stamped with). Not carried: A, C, E and F (what the counts are, and that no class's answer moves across
   a colleague's lead) and B1's shape of the answer are the store's (legacy-store's `#counts`, record-core's counts, N342);
   D (op=selftest and op=livefire relay the same rule) is legacy-index's hooks, not this door. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, opCalls, hex64, member } from "./harness.mjs";

test("R40, R17 (proposed; N399): op=stats is stamped `capacity=1` exactly for the admin class — the admin binding and the founder's session — and `capacity=0` for every other caller, an administering member's session included, beside the caller's viewer; no `capacity` a caller sends reaches the store, in either direction", async () => {
  const dee = hex64();
  const { env, S } = world({ sessions: { [dee]: member("dee", ["contribute"], { administer: true }) } });
  const list = [
    ["the admin binding", env.ADMIN_TOKEN, {}, "1", "class:admin"], ["the founder's session", S.founder, {}, "1", "admin"],
    ["the member binding", env.MEMBER_TOKEN, {}, "0", "class:member"], ["the probe binding", env.PROBE_TOKEN, { store: "scratch" }, "0", "class:probe"],
    ["ann's member session", S.ann, {}, "0", "member:ann"], ["dee's administering member session", dee, {}, "0", "member:dee"],
  ];
  for (const [name, token, params, capacity, viewer] of list) {
    for (const sent of [{}, { capacity: "1" }, { capacity: "0" }, { capacity: "1", operator: "1", proof: "1", whole: "1" }]) {
      env.calls.length = 0;
      const r = await call(env, { op: "stats", token, params: { ...params, ...sent } });
      assert.equal(r.status, 200, `${name}: ${r.text.slice(0, 200)}`);
      const [inner] = opCalls(env);
      assert.deepEqual([inner.route, inner.params.capacity, inner.params.viewer], ["stats", capacity, viewer],
                       `${name} sending ${JSON.stringify(sent)}`);
      assert.equal("operator" in inner.params && inner.params.operator !== sent.operator, false, "operator is no stamp: passed as sent");
    }
  }
  /* negative control: the daemon binding reaches no count */
  env.calls.length = 0;
  assert.equal((await call(env, { op: "stats", token: env.DAEMON_TOKEN })).status, 403);
  assert.equal(opCalls(env).length, 0);
});
