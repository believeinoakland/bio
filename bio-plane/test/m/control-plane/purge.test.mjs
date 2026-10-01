/* control-plane: op=purge's admission (N398, K573). Converted from the old battery's `test/purge.test.mjs`, the half this
   door answers: who may ask. The plane's one destructive op is reached by the root of trust and the probe (confined to
   scratch) and by nothing else, and every refusal is answered before anything reaches the store.

   Carried: "member is refused" (CLASS_FORBIDDEN, R11), "public token is unauthenticated" (NOT_AUTHENTICATED, R9), "probe
   naming bio is confined" (SCOPE_REFUSED, R6), each here with the refusal's row and with nothing forwarded; added, the
   session's refusal (MACHINE_CREDENTIAL_REQUIRED with its recorded decision, R10) and an agent credential's (R12). The
   three `confirm=<store>` arms ("no confirm refused", "wrong confirm refused", "refusal names the resolved store") are
   R39's, this door's since T18 (K621), below. The deletion arms ("single bundle purge takes the whole lineage", "allocid does not reissue
   across a purge", "the store still works after a purge") are record-core R21's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, world, call, opCalls, aik, cred, refused } from "./harness.mjs";

test("R28 (N398; admission R4, R7–R10): op=purge is the root of trust's and the probe's alone — a member binding CLASS_FORBIDDEN, an unknown token NOT_AUTHENTICATED, a session MACHINE_CREDENTIAL_REQUIRED naming its decision, an agent AI_BEYOND_TASK_SCOPE, the probe naming bio SCOPE_REFUSED — and nothing reaches the store on any refusal", async () => {
  const agent = aik();
  const { env, S } = world({ creds: { [agent]: cred({ tokenId: "agent-wide", writes: Object.keys(O.OPS) }) } });
  const cases = [
    [{ token: env.MEMBER_TOKEN, params: { confirm: "bio" } }, 403, "CLASS_FORBIDDEN", "C-38.2"],
    [{ token: env.DAEMON_TOKEN, params: { confirm: "bio" } }, 403, "CLASS_FORBIDDEN", "C-38.2"],
    [{ token: "nope", params: { confirm: "bio" } }, 401, "NOT_AUTHENTICATED", "C-38.1"],
    [{ params: { confirm: "bio" } }, 401, "NOT_AUTHENTICATED", "C-38.1"],
    [{ token: S.ann, params: { confirm: "bio" } }, 403, "MACHINE_CREDENTIAL_REQUIRED", "C-38.3"],
    [{ token: S.founder, params: { confirm: "bio" } }, 403, "MACHINE_CREDENTIAL_REQUIRED", "C-38.3"],
    [{ token: agent, params: { confirm: "bio" } }, 403, "AI_BEYOND_TASK_SCOPE", "C-29.6"],
    [{ token: env.PROBE_TOKEN, params: { store: "bio", confirm: "bio" } }, 403, "SCOPE_REFUSED", "C-38.6"],
  ];
  for (const [req, status, code, check] of cases) {
    env.calls.length = 0;
    const r = await call(env, { op: "purge", ...req });
    refused(r, status, code, check);
    assert.equal(opCalls(env).length, 0, `${code}: forwarded`);
    if (code === "MACHINE_CREDENTIAL_REQUIRED") assert.equal(r.json.recorded, O.UNATTENDED_BY_DECISION.purge);
    if (code === "SCOPE_REFUSED") assert.match(r.json.error, /confined to the scratch namespace/);
    if (code === "CLASS_FORBIDDEN") assert.equal(r.json.error, "forbidden for token class");
    if (code === "NOT_AUTHENTICATED") assert.equal(r.json.error, "unauthenticated");
  }
  /* negative controls: the root of trust reaches the store in bio, and the probe in scratch, each with its own `confirm` */
  for (const [token, params, ns] of [[env.ADMIN_TOKEN, { confirm: "bio" }, "bio"], [env.PROBE_TOKEN, { confirm: "scratch" }, "scratch"],
                                     [env.PROBE_TOKEN, { store: "scratch", confirm: "scratch" }, "scratch"]]) {
    env.calls.length = 0;
    const r = await call(env, { op: "purge", token, params });
    assert.equal(r.status, 200, r.text.slice(0, 200));
    assert.deepEqual(opCalls(env).map((c) => [c.route, c.ns, c.params.confirm]), [["purge", ns, params.confirm]]);
    assert.equal(r.json.store, ns);
  }
});

test("R39 (N408, K621): op=purge whose confirm is not exactly the namespace the request resolved to is refused 400 REQUIRED_ARGUMENT_MISSING (C-61.1) naming argument confirm, expected and got, with tokenClass and store, before the store is called; a probe can confirm only scratch", async () => {
  const { env } = world();
  const { REQUIRED_ARGUMENT_CHECKS } = await import("../../../src/control-plane/checks.mjs");
  const cases = [
    [env.ADMIN_TOKEN, {}, "bio", null, "admin"], [env.ADMIN_TOKEN, { confirm: "scratch" }, "bio", "scratch", "admin"],
    [env.ADMIN_TOKEN, { confirm: "Bio" }, "bio", "Bio", "admin"], [env.ADMIN_TOKEN, { confirm: "" }, "bio", "", "admin"],
    [env.ADMIN_TOKEN, { store: "scratch", confirm: "bio" }, "scratch", "bio", "admin"],
    [env.PROBE_TOKEN, { confirm: "bio" }, "scratch", "bio", "probe"], [env.PROBE_TOKEN, {}, "scratch", null, "probe"],
  ];
  for (const [token, params, store, got, tokenClass] of cases) {
    env.calls.length = 0;
    const r = await call(env, { op: "purge", token, params, method: "POST", body: {} });
    refused(r, 400, "REQUIRED_ARGUMENT_MISSING", "C-61.1");
    assert.deepEqual([r.json.argument, r.json.expected, r.json.got, r.json.tokenClass, r.json.store, r.json.op, r.json.error],
                     ["confirm", store, got, tokenClass, store, "purge", "purge requires confirm=<store>"], JSON.stringify(params));
    assert.equal(r.json.translation, REQUIRED_ARGUMENT_CHECKS.REQUIRED_ARGUMENT_MISSING.translation);
    assert.match(r.json.detail, /Nothing was changed/);
    assert.equal(opCalls(env).length, 0, "nothing reaches the store");
  }
  /* the row is the module's own, its `where` naming its one site */
  assert.equal(REQUIRED_ARGUMENT_CHECKS.REQUIRED_ARGUMENT_MISSING.where, "src/control-plane/index.mjs requiredArgument > is-required-argument");
});
