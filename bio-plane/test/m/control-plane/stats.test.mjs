/* control-plane: op=stats' two stamps (N399, K573, K607; R40). Converted from the old battery's
   `test/stats-disclosure.test.mjs`, the half this door answers. `op=stats` is record-core's route (`record.stats`; it
   lived in legacy-store's `store.mjs`, deleted at T20): which counts each class receives (no `leads`, no `observations`, `observationsNonLead` for all,
   `dbBytes` only with `capacity`) is decided there over record-core's counts. What decides it is two stamps set here from
   the credential: `viewer` (R17), whose sight the counts are taken through, and `capacity`, which is `1` for the `admin`
   class alone.

   Carried: B2 "a caller sending capacity=1/operator=1/proof=1/whole=1 … the server's stamp overwrites it" (here: the
   `capacity` that reaches the store is the server's for every caller, and `operator` is no stamp); B3 "the admin sending
   capacity=0 still receives dbBytes" (the stamp is the server's in both directions); the member shape for the probe and
   every member session (the member binding is retired, admission R5, K2166), the admin shape for the admin binding and the founder's session (as the
   `capacity` each is stamped with). Not carried: A, C, E and F (what the counts are, and that no class's answer moves across
   a colleague's lead) and B1's shape of the answer are the store's (record-core's counts, N342);
   D (op=selftest and op=livefire relay the same rule) is instance-setup's handlers behind plane's hooks, not this door. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, opCalls, hex64, member } from "./harness.mjs";

test("R40, R17 (N399): op=stats is stamped `capacity=1` for the admin class — the admin binding and the founder's session — and for an administering member's session (G42, K4638), and `capacity=0` for every other caller, beside the caller's viewer; no `capacity` a caller sends reaches the store, in either direction", async () => {
  const dee = hex64();
  const { env, S } = world({ sessions: { [dee]: member("dee", ["contribute"], { administer: true }) } });
  const list = [
    ["the admin binding", env.ADMIN_TOKEN, {}, "1", "class:admin"], ["the founder's session", S.founder, {}, "1", "admin"],
    /* admission R5 (K2166): the shared member binding is retired, so it is no longer one of the callers */
    ["the probe binding", env.PROBE_TOKEN, { store: "scratch" }, "0", "class:probe"],
    ["ann's member session", S.ann, {}, "0", "member:ann"], ["dee's administering member session", dee, {}, "1", "member:dee"],
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

/* G42 (K4635, K4638): the capacity figure an administering member sees is floored to a whole 100,000,000 B; the founder and
   the ADMIN_TOKEN keep the exact figure; a member none. The store is the fake of record-core's `stats` rule: `dbBytes` only
   when the stamp reaches it as `capacity=1`. */
test("R40, G42: `op=stats` answers `dbBytes` floored to 100,000,000 B to an administering member, exact to the admin binding and the founder, absent to a member and the probe; null stays null; control: no stamp, no figure", async () => {
  const dee = hex64();
  const SIZES = [[10_573_212_345, 10_500_000_000], [99_999_999, 0], [100_000_000, 100_000_000], [0, 0], [null, null]];
  for (const [size, floored] of SIZES) {
    const { env, S } = world({ sessions: { [dee]: member("dee", ["contribute"], { administer: true }) },
      answer: (c) => c.route === "stats"
        ? new Response(JSON.stringify({ ok: true, result: { observationsNonLead: 2, ...(c.params.capacity === "1" ? { dbBytes: size } : {}) } }), { status: 200 })
        : undefined });
    const dbBytes = async (token, params = {}) => JSON.parse((await call(env, { op: "stats", token, params })).text).result;
    assert.equal((await dbBytes(dee)).dbBytes, floored, `dee, ${size}`);
    assert.equal((await dbBytes(dee, { capacity: "0" })).dbBytes, floored, `dee sending capacity=0, ${size}`);
    assert.equal((await dbBytes(S.founder)).dbBytes, size, `founder, ${size}`);
    assert.equal((await dbBytes(env.ADMIN_TOKEN)).dbBytes, size, `admin binding, ${size}`);
    for (const [who, token, params] of [["ann", S.ann, {}], ["probe", env.PROBE_TOKEN, { store: "scratch" }]]) {
      const r = await dbBytes(token, { ...params, capacity: "1" });
      assert.equal("dbBytes" in r, false, `${who} gets none, ${size}`);
      assert.equal(r.observationsNonLead, 2, `${who} still gets the counts`);
    }
  }
});
