/* control-plane: legacy-index's door share, moved into the door at T19 (layer 11): the sign-in and invitation relays
   (`login`, `invitelook`, `enroll`), the store and reader resolution of `op=instancegroup` and `op=groupidentity` (their
   answer instance-setup's), and `storageAbsent`, the C-68.1 raiser the door hands the arms it routes to, answering
   through acquisition's one region (K794, K850). Driven through `makeFetch(hooks)` with hooks that decline every public op, so whatever
   answers is the door itself. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, call, refused } from "./harness.mjs";
import { INSTALLATION_CHECKS } from "../../../src/acquisition/checks.mjs";
import { evidenceStorageAbsent } from "../../../src/acquisition/index.mjs";

const reply = (o, status = 200) => new Response(JSON.stringify(o), { status });
/* A public op reaching a hook means the door did not answer it. */
const declining = (log = []) => ({
  log,
  publicOp: async (ctx) => { log.push(ctx.op); return M.json({ ok: false, reason: "HOOK_REACHED" }, 418); },
  gatedOp: async () => undefined,
  publicInstanceGroup: async () => ({ answered: true, result: {} }),
});

test("R24, R2 (door share): op=login is relayed by the door to bio's `login` route with the role (admin unless named) and the password only, at the store's status; invitelook and enroll to the store the caller names, the body whole; a store failure is R23's 502, never 200; no hook is reached", async () => {
  for (const [op, params, sent, ns, want] of [
    ["login", {}, { role: "member:ann", password: "pw", extra: "dropped" }, "bio", { role: "member:ann", password: "pw" }],
    ["login", { store: "bio" }, { password: "pw" }, "bio", { role: "admin", password: "pw" }],
    ["invitelook", {}, { invite: "inv-1", x: 1 }, "bio", { invite: "inv-1", x: 1 }],
    ["invitelook", { store: "scratch" }, { invite: "inv-1" }, "scratch", { invite: "inv-1" }],
    ["enroll", {}, { invite: "inv-1", handle: "ann", password: "pw" }, "bio", { invite: "inv-1", handle: "ann", password: "pw" }],
    ["enroll", { store: "scratch" }, { invite: "inv-2" }, "scratch", { invite: "inv-2" }]]) {
    const w = world({ answer: (c) => (c.route === op ? reply({ ok: true, result: { ok: true, session: "s" } }, 201) : null) });
    const hooks = declining();
    const r = await call(w.env, { op, params, method: "POST", body: sent, hooks });
    assert.deepEqual([r.status, r.json], [201, { ok: true, result: { ok: true, session: "s" } }], `${op} ${JSON.stringify(params)}`);
    assert.deepEqual(w.env.calls.map((c) => [c.ns, c.route, c.method, c.body]), [[ns, op, "POST", want]], op);
    assert.deepEqual(hooks.log, [], `${op} reached a hook`);
  }
  /* login is pinned to bio (admission R3): store=scratch is refused and nothing is read */
  const p = world();
  refused(await call(p.env, { op: "login", params: { store: "scratch" }, method: "POST", body: {}, hooks: declining() }), 400, "NAMESPACE_PINNED", "C-78.2");
  assert.equal(p.env.calls.length, 0);
  /* a store that did not answer is a silence naming the op; the store's own refusal keeps its status */
  for (const op of ["login", "invitelook", "enroll"]) {
    const s = world({ answer: (c) => (c.route === op ? new Response("<html>") : null) });
    refused(await call(s.env, { op, method: "POST", body: {}, hooks: declining() }), 502, "STORE_DID_NOT_ANSWER", "C-69.2");
    const f = world({ answer: (c) => (c.route === op ? reply({ ok: false, reason: "BAD_JSON", detail: "d" }, 400) : null) });
    const fr = await call(f.env, { op, method: "POST", body: {}, hooks: declining() });
    assert.deepEqual([fr.status, fr.json.reason], [400, "BAD_JSON"], op);
  }
  /* negative control: another public op still reaches its module's hook */
  const n = world();
  const hooks = declining();
  await call(n.env, { op: "knock", method: "POST", body: {}, hooks });
  assert.deepEqual(hooks.log, ["knock"]);
});

test("R2, R17 (door share; instance-setup R3, R10, R11): op=instancegroup and op=groupidentity are resolved by the door — a credential the admission gate would admit reads the whole row in its own namespace, anybody else the public projection of store=scratch or bio — answered by instance-setup's handler; a silence is 502", async () => {
  const group = { slug: "grp-a", provenance: "seeded" };
  const { env, S, A } = world({ answer: (c) => (["instancegroup", "groupidentity"].includes(c.route) ? reply({ ok: true, result: group })
                                                : ["instancegrouppublic", "groupidentitypublic"].includes(c.route) ? reply({ ok: true, result: { slug: "grp-a" } }) : null) });
  for (const op of ["instancegroup", "groupidentity"]) {
    for (const [token, params, ns, whole, tc] of [
      [env.ADMIN_TOKEN, {}, "bio", true, "admin"], [env.PROBE_TOKEN, {}, "scratch", true, "probe"],
      [S.ann, {}, "bio", true, "member"],
      /* admission R5 (K2166): the retired shared member binding gives no class, so the group read takes it as a stranger */
      [env.MEMBER_TOKEN, {}, "bio", false], [env.MEMBER_TOKEN, { store: "scratch" }, "scratch", false],
      [A.ann, {}, "bio", true, "ai"], [undefined, {}, "bio", false], [undefined, { store: "scratch" }, "scratch", false],
      ["not-a-credential", {}, "bio", false], [env.DAEMON_TOKEN, {}, "bio", false]]) {
      env.calls.length = 0;
      const hooks = declining();
      const r = await call(env, { op, token, params, hooks });
      assert.equal(r.status, 200, `${op} ${token} ${r.text.slice(0, 200)}`);
      assert.deepEqual(hooks.log, []);
      const routes = env.calls.filter((c) => c.route.startsWith(op) && c.route !== "session").map((c) => [c.ns, c.route]);
      assert.deepEqual(routes, [[ns, whole ? op : `${op}public`]], `${op} for ${token}`);
      assert.equal(r.json.store, ns);
      assert.deepEqual(r.json.result, whole ? group : { slug: "grp-a" });
      if (whole) assert.equal(r.json.tokenClass, tc);
    }
    /* a silence is a silence, never "no group is recorded" */
    const s = world({ answer: (c) => (c.route.startsWith(op) ? new Response("x") : null) });
    refused(await call(s.env, { op, hooks: declining() }), 502, "STORE_DID_NOT_ANSWER", "C-69.2");
  }
});

test("R22, R21 (door share; K794, K850): storageAbsent answers 503 EVIDENCE_STORAGE_NOT_CONFIGURED with acquisition's C-68.1 row, the op and the caller's sentence byte-identical, through the envelope, minted at acquisition's one region", async () => {
  const row = INSTALLATION_CHECKS.EVIDENCE_STORAGE_NOT_CONFIGURED;
  for (const [op, error] of [["capture", "R2 is not configured on this instance"], ["acquire", "this instance has no evidence storage configured"],
                             ["pdfstructure", "R2 is not configured on this instance"], ["attest", "this instance has no evidence storage configured"]]) {
    const r = M.storageAbsent(op, error);
    assert.equal(r.status, 503);
    assert.equal(r.headers.get("access-control-allow-origin"), "*");
    const j = await r.json();
    assert.deepEqual(j, { ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED", code: "EVIDENCE_STORAGE_NOT_CONFIGURED",
                          check: "C-68.1", translation: row.translation, error, op });
    /* the keys in the order the door has always answered them */
    assert.deepEqual(Object.keys(j), ["ok", "reason", "code", "check", "translation", "error", "op"]);
    /* K850: one site: the door's body is acquisition's export's, whole */
    assert.deepEqual(j, evidenceStorageAbsent(op, error).body);
  }
  assert.equal(row.check, "C-68.1");
  /* the door's own row reader holds C-68.2-.4 only (R15); C-68.1 is no longer read here, and a code it does not hold is
     refused rather than invented */
  for (const code of ["BOOTSTRAP_CREDENTIAL_UNSET", "BOOTSTRAP_CREDENTIAL_PUBLISHED", "BOOTSTRAP_CREDENTIAL_MISMATCH"])
    assert.match(M.installationRow(code).check, /^C-68\.[234]$/, code);
  assert.throws(() => M.installationRow("EVIDENCE_STORAGE_NOT_CONFIGURED"), /no BOOTSTRAP_CHECKS row/);
  assert.throws(() => M.installationRow("NO_SUCH_INSTALLATION_CODE"), /no BOOTSTRAP_CHECKS row/);
});
