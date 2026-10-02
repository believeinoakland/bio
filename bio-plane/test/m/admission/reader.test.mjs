/* admission: who is asking, for the door's stamps and the public reads — the viewer an admitted caller carries (N407)
   and the reader of a public op that answers working material only to some (the convert `group-public`; R16, K723). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { A, world, gate, urlOf, doAnswer, aik, hex64 } from "./harness.mjs";

test("N407: an admitted caller's viewer is its session's viewer, an agent's principal carrying its credential ({stamp, aiCred}), or class:<cls> for a binding", async () => {
  const { env, S, K } = world();
  const viewer = async (token, opts) => A.callerViewer((await gate(env, { op: "index", token, method: "GET" })).caller, opts);
  assert.equal(await viewer(S.ann), "member:ann");
  assert.equal(await viewer(S.founder), "admin");
  for (const [k, c] of [["ADMIN_TOKEN", "admin"], ["MEMBER_TOKEN", "member"]]) assert.equal(await viewer(env[k]), `class:${c}`);
  const carried = await viewer(K.ann);
  assert.equal(carried.stamp, "member:ann", "a member-scoped agent's stamp is its minter's");
  assert.deepEqual([carried.aiCred.tokenId, carried.aiCred.principal], ["agent-ann", "member:ann"]);
  assert.equal((await viewer(K.org)).stamp, "class:ai");
  /* the stamp alone, for a query parameter */
  assert.equal(await viewer(K.ann, { carry: false }), "member:ann");
  assert.equal(await viewer(S.ann, { carry: false }), "member:ann");
});

test("R16 (group-public): readerOf answers who is asking for a public op and never refuses — a binding class as class:<cls> only when index admits it in the store read, a session as its viewer, an agent as its principal when in scope, anyone else as no one; a store silence is a silence", async () => {
  const { env, S, K } = world();
  const read = async (token, params = {}, store = "bio", presented) => A.readerOf(urlOf({ ...params, token }), env, store, presented, doAnswer);
  assert.deepEqual(await read(undefined), { viewer: "" });
  assert.deepEqual(await read("stranger"), { viewer: "" });
  assert.deepEqual(await read(env.ADMIN_TOKEN), { viewer: "class:admin", cls: "admin" });
  assert.deepEqual(await read(env.MEMBER_TOKEN), { viewer: "class:member", cls: "member" });
  /* probe: confined to scratch, a stranger to bio and a reader of scratch; daemon: index does not admit it */
  assert.deepEqual(await read(env.PROBE_TOKEN), { viewer: "", cls: "probe" });
  assert.deepEqual(await read(env.PROBE_TOKEN, {}, "scratch"), { viewer: "class:probe", cls: "probe" });
  assert.deepEqual(await read(env.DAEMON_TOKEN), { viewer: "", cls: "daemon" });
  /* a binding reading a store it does not land in reads as a stranger */
  assert.deepEqual(await read(env.ADMIN_TOKEN, {}, "scratch"), { viewer: "", cls: "admin" });
  assert.deepEqual(await read(S.ann), { viewer: "member:ann", cls: "member" });
  assert.deepEqual(await read(S.founder), { viewer: "admin", cls: "admin" });
  assert.deepEqual(await read(hex64()), { viewer: "" });
  assert.deepEqual(await read(K.ann), { viewer: "member:ann", cls: "ai" });
  assert.deepEqual(await read(K.org), { viewer: "class:ai", cls: "ai" });
  assert.deepEqual(await read(K.revoked), { viewer: "", cls: "ai" });
  assert.deepEqual(await read(aik()), { viewer: "", cls: "ai" });
  /* the front door's row is reused: no second lookup */
  env.calls.length = 0;
  assert.deepEqual(await read(K.ann, {}, "bio", { tokenId: "x", principal: "member:zed", writes: [], revoked: false }), { viewer: "member:zed", cls: "ai" });
  assert.deepEqual(await read(K.ann, {}, "bio", null), { viewer: "", cls: "ai" });
  assert.equal(env.calls.length, 0);
  /* silences */
  for (const route of ["session", "aicredentiallook"]) {
    const w = world({ answer: (c) => (c.route === route ? new Response("x") : null) });
    const r = await A.readerOf(urlOf({ token: route === "session" ? w.S.ann : w.K.ann }), w.env, "bio", undefined, doAnswer);
    assert.equal(r.silent.op, route);
  }
});
