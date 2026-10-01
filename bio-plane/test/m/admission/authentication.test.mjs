/* admission: authentication (R5–R7) — the binding classes, the agent credential's and the session's resolution, and the
   caller with no class. Carries the converts `fence`, `daemon-token` and `publishedcase` (their admission share). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { A, O, world, gate, urlOf, refused, doAnswer, opCalls, sha, hex64, aik } from "./harness.mjs";
import { PUBLISHED_TOKEN_HASHES } from "../../../src/tokens.mjs";

const { OPS } = O;
const GATED = Object.keys(OPS).filter((k) => OPS[k].classes !== null);

async function published(value, fn) {
  const h = sha(value);
  PUBLISHED_TOKEN_HASHES.add(h);
  try { return await fn(); } finally { PUBLISHED_TOKEN_HASHES.delete(h); }
}

test("R5: a token equal to ADMIN_TOKEN, MEMBER_TOKEN, PROBE_TOKEN or DAEMON_TOKEN (checked in that order) gives that class only while the binding is live; any other token gives no binding class", async () => {
  const { env } = world();
  for (const [k, c] of [["ADMIN_TOKEN", "admin"], ["MEMBER_TOKEN", "member"], ["PROBE_TOKEN", "probe"], ["DAEMON_TOKEN", "daemon"]])
    assert.equal(await A.classify(env[k], env), c);
  /* the order: one value bound twice is the earlier class */
  const same = world();
  same.env.MEMBER_TOKEN = same.env.ADMIN_TOKEN;
  same.env.DAEMON_TOKEN = same.env.PROBE_TOKEN;
  assert.equal(await A.classify(same.env.ADMIN_TOKEN, same.env), "admin");
  assert.equal(await A.classify(same.env.PROBE_TOKEN, same.env), "probe");
  /* not live: a published value never authenticates (negative control: the same value unpublished does) */
  for (const k of ["ADMIN_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN", "DAEMON_TOKEN"]) {
    const v = env[k];
    await published(v, async () => {
      assert.equal(await A.classify(v, env), null, `${k} published`);
      refused(await gate(env, { op: "selftest", token: v, params: k === "PROBE_TOKEN" ? { store: "scratch" } : {}, method: "GET" }),
              401, "NOT_AUTHENTICATED", "C-38.1", [v]);
    });
    assert.notEqual(await A.classify(v, env), null, k);
  }
  /* not live: an unset or empty binding; the empty or absent token */
  const unset = world({ omit: ["MEMBER_TOKEN", "DAEMON_TOKEN"] });
  unset.env.PROBE_TOKEN = "";
  for (const t of ["", undefined, null]) assert.equal(await A.classify(t, unset.env), null);
  /* daemon-token: the daemon's value against an absent binding is no class, and the call is 401 */
  const old = world();
  const daemonValue = old.env.DAEMON_TOKEN;
  delete old.env.DAEMON_TOKEN;
  assert.equal(await A.classify(daemonValue, old.env), null);
  refused(await gate(old.env, { op: "monitor", token: daemonValue }), 401, "NOT_AUTHENTICATED", "C-38.1", [daemonValue]);
  /* fence: a bound PUBLIC_TOKEN (no class of this instance) is inert */
  env.PUBLIC_TOKEN = hex64();
  assert.equal(await A.classify(env.PUBLIC_TOKEN, env), null);
  refused(await gate(env, { op: "index", token: env.PUBLIC_TOKEN, method: "GET" }), 401, "NOT_AUTHENTICATED", "C-38.1");
  /* any other token */
  for (const t of [hex64(), "admin", env.ADMIN_TOKEN.toUpperCase(), `${env.ADMIN_TOKEN} `, env.ADMIN_TOKEN.slice(1), aik()])
    assert.equal(await A.classify(t, env), null, t);
});

test("R6: an aik-<64 hex> token is resolved once per request against bio's credential rows (class ai with its principal, scope and confinement); a 64-hex token is resolved as a session against bio; a store that does not answer either lookup is a silence, never a statement about the caller", async () => {
  const { env, S, K } = world();
  /* ai: one lookup, in bio, by digest, even when the call addresses scratch */
  for (const [op, params] of [["index", { store: "scratch" }], ["whoami", {}]]) {
    env.calls.length = 0;
    const r = await gate(env, { op, token: K.ann, params, method: "GET" });
    assert.equal(r.caller.cls, "ai", op);
    assert.deepEqual([r.caller.aiCred.tokenId, r.caller.aiCred.principal, r.caller.viaSession], ["agent-ann", "member:ann", false]);
    const looks = env.calls.filter((c) => c.route === "aicredentiallook");
    assert.deepEqual(looks.map((c) => [c.ns, c.params.sha]), [["bio", sha(K.ann)]]);
    assert.equal(env.calls.some((c) => c.href.includes(K.ann)), false, "the value never reaches the store");
    assert.ok(!env.calls.some((c) => c.route === "session"), "an agent credential never falls into the session lookup");
  }
  const conf = await gate(env, { op: "whoami", token: K.confined, method: "GET" });
  assert.deepEqual([conf.caller.cls, conf.caller.aiCred.confinedTo, conf.caller.storeName], ["ai", "scratch", "scratch"]);
  /* aiCredentialPresented: nothing presented, another shape, unknown: no store asked or no credential */
  env.calls.length = 0;
  for (const t of [undefined, hex64(), env.ADMIN_TOKEN, "aik-short"]) assert.deepEqual(await A.aiCredentialPresented(urlOf({ token: t }), env, doAnswer), { cred: null });
  assert.equal(env.calls.length, 0);
  assert.deepEqual(await A.aiCredentialPresented(urlOf({ token: aik() }), env, doAnswer), { cred: null });
  /* session: in bio even when the call addresses scratch; the founder and a member, each resolved into its halves */
  env.calls.length = 0;
  const s = await gate(env, { op: "index", token: S.ann, params: { store: "scratch" }, method: "GET" });
  assert.deepEqual([s.caller.cls, s.caller.viaSession, s.caller.member, s.caller.viewer, s.caller.identity, s.caller.storeName],
                   ["member", true, "ann", "member:ann", "member:ann", "scratch"]);
  assert.deepEqual(env.calls.map((c) => [c.ns, c.route, c.params.t]), [["bio", "session", S.ann]]);
  const f = await gate(env, { op: "index", token: S.founder, method: "GET" });
  assert.deepEqual([f.caller.cls, f.caller.member, f.caller.viewer, f.caller.identity], ["admin", "admin", "admin", "member:admin"]);
  assert.deepEqual(A.resolveSession({ role: "member:cy" }), { viewer: "member:cy", identity: "member:cy", member: "cy" });
  assert.deepEqual(A.resolveSession(null), { viewer: "member:", identity: "member:", member: "" });
  /* silences: unreadable, the store's catch (its correlation carried), and ok not true — for both lookups */
  const corr = "0123abcd-0123-4567-89ab-0123456789ab";
  const silences = [() => new Response("<html>oops"), () => new Response(JSON.stringify({ ok: false, reason: "STORE_INTERNAL_ERROR", correlation: corr }), { status: 500 }),
                    () => new Response(JSON.stringify({ ok: "true", result: {} }))];
  for (const bad of silences) for (const route of ["session", "aicredentiallook"]) {
    const w = world({ answer: (c) => (c.route === route ? bad() : null) });
    const t = route === "session" ? w.S.ann : w.K.ann;
    w.env.calls.length = 0;
    const r = await gate(w.env, { op: "index", token: t, method: "GET" });
    assert.equal(r.silent?.op, route, JSON.stringify(r));
    assert.equal(r.refusal, undefined, "a silence is never a refusal about the caller");
    assert.equal(opCalls(w.env).length, 0);
    if (bad === silences[1]) assert.equal(r.silent.correlation, corr);
  }
});

test("R7: a caller with no class is refused 401 NOT_AUTHENTICATED (C-38.1), for every gated op (anonymous list, search, projection and image among them)", async () => {
  const { env, S } = world();
  for (const op of ["list", "search", "projection", "image"]) assert.ok(GATED.includes(op), op);
  for (const op of GATED) for (const token of [undefined, "", "nope", hex64(), aik(), `${S.ann}x`]) {
    env.calls.length = 0;
    const body = refused(await gate(env, { op, token }), 401, "NOT_AUTHENTICATED", "C-38.1", [token]);
    assert.equal(body.error, "unauthenticated");
    assert.equal(opCalls(env).length, 0);
  }
  /* negative controls: a binding class and a session are admitted */
  assert.ok((await gate(env, { op: "index", token: env.MEMBER_TOKEN, method: "GET" })).caller);
  assert.ok((await gate(env, { op: "index", token: S.ann, method: "GET" })).caller);
});

test("R6: both lookups are credentials' (K637): the routes the module asks, `session?t=` and `aicredentiallook?sha=`, are answered by credentials' own op map, through its `session` (its R5) and `aiCredentialLook` (its R15), and membership's map answers neither", async () => {
  const { credentialsOps } = await import("../../../src/credentials/index.mjs");
  const { membershipOps } = await import("../../../src/membership/index.mjs");
  const S = hex64(), K = aik();
  const asked = [];
  const c = {
    session: (t) => { asked.push(["session", t]); return t === S ? { role: "member:ann", capabilities: ["contribute"] } : null; },
    aiCredentialLook: ({ secretSha }) => { asked.push(["aiCredentialLook", secretSha]);
      return secretSha === sha(K) ? { found: true, credential: { tokenId: "agent-ann", principal: "member:ann", writes: [],
                                                                  revoked: false, confinedTo: null, taskScope: "t" } }
                                  : { found: false }; },
  };
  const { env } = world({ answer: async (call) => {
    const u = new URL(call.href);
    const route = credentialsOps(c, u, null, {})[call.route];
    assert.ok(route, `credentials answers ${call.route}`);
    assert.equal(membershipOps({}, u, null, {})[call.route], undefined, `membership answers no ${call.route}`);
    return new Response(JSON.stringify({ ok: true, result: await route() }));
  } });
  const s = await gate(env, { op: "index", token: S, method: "GET" });
  assert.deepEqual([s.caller.cls, s.caller.viaSession, s.caller.member, [...s.caller.caps]], ["member", true, "ann", ["contribute"]]);
  const k = await gate(env, { op: "index", token: K, method: "GET" });
  assert.deepEqual([k.caller.cls, k.caller.aiCred.tokenId], ["ai", "agent-ann"]);
  assert.deepEqual(asked, [["session", S], ["aiCredentialLook", sha(K)]]);
  /* negative controls: an unknown session and an unknown agent credential resolve to no one, through the same routes */
  refused(await gate(env, { op: "index", token: hex64(), method: "GET" }), 401, "NOT_AUTHENTICATED", "C-38.1");
  refused(await gate(env, { op: "index", token: aik(), method: "GET" }), 401, "NOT_AUTHENTICATED", "C-38.1");
});
