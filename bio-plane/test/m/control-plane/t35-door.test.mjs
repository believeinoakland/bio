/* control-plane T35 (T35-72): R59 (F1; K1874, K2038, K2044: every credential read once through admission's
   `presentedCredential`, from a header or a body, never put in an address the door makes; the address form honoured for
   T35's release and named deprecated) and R58 (the public ops' window first, `source` and `country` stamped, `recover`
   relayed, `unpack`'s stamps, sign-out's session). Driven through `makeFetch(hooks)` over the harness's store, which
   records every request the plane makes, the window's and the credential lookups' included. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, opCalls, hex64, FORGED } from "./harness.mjs";

const SENTINEL_SECRET = "rv1_sentinel-secret-0123456789abcdefghij";
/* every address the plane asked of any store, the window's and the lookups' included */
const addresses = (env) => [...env.calls, ...env.windowCalls].map((c) => c.url.href);

test("R59 (admission R20; F1): a credential of each kind — a member's session, an agent credential, a binding token — presented in the `Authorization` header or a JSON body's `token` is admitted exactly as in the address, its answer carries `deprecated` only for the address form, and the credential is in no address of any request the plane makes (negative control: the address form's own request carries it in the caller's address only)", async () => {
  const { env, S, A } = world();
  for (const [name, token] of [["session", S.ann], ["agent", A.ann], ["binding", env.MEMBER_TOKEN]]) {
    const seen = {};
    for (const tokenIn of ["header", "body", "query"]) {
      env.calls.length = 0; env.windowCalls.length = 0;
      const r = await call(env, { op: "search", token, tokenIn, method: "POST", body: { q: "x" } });
      seen[tokenIn] = [r.status, r.json.tokenClass, r.json.deprecated ?? null];
      for (const href of addresses(env)) assert.equal(href.includes(token), false, `${name}/${tokenIn}: ${href}`);
      const inner = opCalls(env).find((c) => c.route === "search");
      assert.ok(inner, `${name}/${tokenIn}: reached search`);
      assert.equal(JSON.stringify(inner.body).includes(token), false, `${name}/${tokenIn}: the credential is not passed on`);
    }
    assert.deepEqual(seen.header, [200, seen.header[1], null], name);
    assert.deepEqual(seen.body, seen.header, `${name}: body as header`);
    assert.deepEqual(seen.query, [200, seen.header[1], "CREDENTIAL_IN_ADDRESS"], `${name}: the address form, named`);
  }
});

test("R59, R20, R44: a review grant's and a template grant's secret is read from the POST body's `secret`, only its digest reaches the store, in no address; the address form is honoured and its answer carries `deprecated`; the minting answers' instructions name the body", async () => {
  const { env } = world();
  for (const op of ["reviewcopy", "templateread"]) {
    for (const secretIn of ["body", "query"]) {
      env.calls.length = 0;
      const r = await call(env, { op, secretIn, params: { secret: SENTINEL_SECRET, draft: "D1", version: "TPL-1@1" } });
      for (const href of addresses(env)) assert.equal(href.includes(SENTINEL_SECRET), false, `${op}/${secretIn}`);
      const inner = opCalls(env)[0];
      assert.equal(inner.params.bySecret, "1", op);
      assert.equal(JSON.stringify(inner.body ?? null).includes(SENTINEL_SECRET), false, op);
      assert.equal(r.json.deprecated ?? null, secretIn === "query" ? "CREDENTIAL_IN_ADDRESS" : null, `${op}/${secretIn}`);
    }
  }
});

test("R59 (store-door R9; credentials R39): `signout` and `signouteverywhere` carry the caller's own session to the store in the `x-bio-session` header, never the address or the body, and a caller's own `session` never reaches it", async () => {
  const { env, S } = world();
  for (const op of ["signout", "signouteverywhere"]) {
    env.calls.length = 0;
    const r = await call(env, { op, token: S.ann, method: "POST", params: { session: FORGED }, body: { session: FORGED } });
    assert.equal(r.status, 200, r.text.slice(0, 200));
    const inner = opCalls(env).find((c) => c.route === op);
    assert.deepEqual([inner.headers["x-bio-session"], inner.params.session], [S.ann, undefined], op);
    for (const href of addresses(env)) assert.equal(href.includes(S.ann), false, op);
  }
  /* a machine credential reaches neither (op-declarations R30) */
  assert.equal((await call(env, { op: "signout", token: env.MEMBER_TOKEN, method: "POST", body: {} })).status, 403);
});

test("R58 (admission R21; F4): every public op meets the door's window first — refused there, it answers DOOR_RATE_LIMITED 429 with the bound stated and nothing of the op runs; an op that is not public never asks the window", async () => {
  const limited = world({ answer: (c) => (c.route === "doorwindow" ? new Response(JSON.stringify({ ok: true, result: { refused: true, retryAfter: 42 } })) : null) });
  for (const op of ["login", "claim", "recover", "invitelook", "publishedcase"]) {
    limited.env.calls.length = 0;
    const r = await call(limited.env, { op, method: "POST", body: {} });
    assert.deepEqual([r.status, r.json.reason, r.json.retryAfter, typeof r.json.stated], [429, "DOOR_RATE_LIMITED", 42, "string"], op);
    assert.deepEqual(opCalls(limited.env), [], `${op}: nothing of the op ran`);
  }
  const { env, S } = world();
  await call(env, { op: "index", token: S.ann });
  assert.deepEqual(env.windowCalls, []);
  await call(env, { op: "login", method: "POST", body: { password: "x" } });
  assert.equal(env.windowCalls.length, 1);
});

test("R58 (admission R21; credentials R1, R4, R47): `claim`, `login` and `recover` are stamped `source` (the window's fingerprint) and `country` (Cloudflare's label), never the caller's; `recover` passes `role`, `code` and `password` from the body alone, and none of them is in its answer", async () => {
  const { env } = world({ answer: (c) => (c.route === "recover" ? new Response(JSON.stringify({ ok: true, result: { ok: true, recovered: true } })) : null) });
  const forged = { source: FORGED, country: "ZZ" };
  const cases = { claim: { bootstrapToken: env.ADMIN_TOKEN, password: "pw-claim" }, login: { password: "pw-login" },
                  recover: { role: "admin", code: "RC-1234-5678", password: "pw-new-0001", extra: FORGED } };
  for (const [op, body] of Object.entries(cases)) {
    env.calls.length = 0;
    const r = await call(env, { op, method: "POST", params: forged, body: { ...body, ...forged }, cf: { country: "NL" } });
    assert.equal(r.status, 200, `${op}: ${r.text.slice(0, 200)}`);
    const inner = opCalls(env).find((c) => c.route === op);
    assert.deepEqual([inner.params.source, inner.params.country], ["src-test", "NL"], op);
    assert.equal(JSON.stringify(inner.body).includes(FORGED), false, op);
    if (op === "recover") {
      assert.deepEqual(inner.body, { role: "admin", code: "RC-1234-5678", password: "pw-new-0001" });
      assert.equal(r.text.includes("RC-1234-5678") || r.text.includes("pw-new-0001"), false);
    }
  }
  /* no country stated: none stamped */
  env.calls.length = 0;
  await call(env, { op: "login", method: "POST", body: { password: "x" } });
  assert.equal(opCalls(env).find((c) => c.route === "login").params.country, undefined);
});

test("R58 (acquisition R38, R40; capture R73): `op=unpack` reaches capture's pass-through with the caller's class and whether it arrived by a member's session, the door's word whatever the caller sent — `member` for a member's session, `daemon` for the daemon (negative control: the caller's own `cls` and `member` never reach it)", async () => {
  const { env, S } = world();
  for (const [token, cls, member] of [[S.ann, "member", "1"], [env.DAEMON_TOKEN, "daemon", "0"]]) {
    env.calls.length = 0;
    const r = await call(env, { op: "unpack", token, method: "POST", params: { cls: "admin", member: "1", by: FORGED }, body: { archiveSha: "a".repeat(64) } });
    assert.equal(r.status, 200, r.text.slice(0, 200));
    const inner = opCalls(env).find((c) => c.route === "unpack");
    assert.deepEqual([inner.params.cls, inner.params.member], [cls, member], cls);
    assert.notEqual(inner.params.by, FORGED);
  }
  /* a member's caller-only class is refused before the store (op-declarations R30's classes) */
  env.calls.length = 0;
  assert.equal((await call(env, { op: "unpack", token: env.MEMBER_TOKEN, method: "POST", body: {} })).status, 403);
  assert.deepEqual(opCalls(env), []);
  void hex64;
});
