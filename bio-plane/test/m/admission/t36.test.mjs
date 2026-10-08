/* admission: T36-36 — a credential in the address refused by name (R20, C-38.10; F1's tail, K2111, K2129), the shared
   member key retired (R5, C-38.11; N711, K1936 Q3), and R22's count of that refusal written through credentials'
   `securitycount` (N744, K2038). Each is driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { A, C, O, world, gate, requestOf, urlOf, presenting, refused, doAnswer, hex64, aik, cred, sha, PLACES } from "./harness.mjs";

const { OPS } = O;
const GATED = Object.keys(OPS).filter((k) => OPS[k].classes !== null);
const PUBLIC = Object.keys(OPS).filter((k) => OPS[k].classes === null);

/* ---------------------------------------------------------------------------------------------------------------- */

test("R20: a sentinel credential sent by header and by body to one op of each kind (a session's, an agent credential's, a binding class's, a grant's door, a review door, a public op) meets the same admission; by the address, alone and beside a header, it is refused 400 CREDENTIAL_IN_ADDRESS (C-38.10) with no request to the store, and the sentinel is in no answer and no address of any request the module makes", async () => {
  const { env, S, K } = world();
  /* [kind, sentinel, op, method, the admission it meets] — `ask` is the grant's door (a gated op whose grant the door
     judges after this module answers no one, control-plane R20), `reviewcopy` the review door (public, reading its
     secret itself), `invitelook` a public op */
  const kinds = [["session", S.ann, "index", "GET", ["admitted", "member"]], ["agent credential", K.ann, "index", "GET", ["admitted", "ai"]],
                 ["binding class", env.ADMIN_TOKEN, "index", "GET", ["admitted", "admin"]],
                 ["grant's door", "grant-" + hex64(), "ask", "POST", ["refused", 401, "NOT_AUTHENTICATED"]],
                 ["review door", "rv1_" + hex64(), "reviewcopy", "POST", ["public"]], ["public op", hex64(), "invitelook", "POST", ["public"]]];
  for (const [, , op] of kinds) assert.ok(OPS[op], `${op} is declared`);
  const answers = [];
  for (const [kind, sentinel, op, method, how] of kinds) {
    const seen = [];
    for (const via of ["header", "body"]) {
      env.calls.length = 0;
      const r = await gate(env, { op, token: sentinel, via, method: via === "body" ? "POST" : method });
      seen.push(r.public ? ["public"] : r.caller ? ["admitted", r.caller.cls] : ["refused", r.refusal.status, r.refusal.body.reason]);
      assert.equal((r.credential ?? {}).inAddress ?? false, false, `${kind}/${via}`);
      for (const c of env.calls) assert.equal(c.href.includes(sentinel) || c.href.includes(sha(sentinel)), false, `${kind}/${via}: no address`);
    }
    assert.deepEqual(seen[0], seen[1], `${kind}: header and body admit alike`);
    assert.deepEqual(seen[0], how, kind);
    /* the address: alone, beside a header, beside a body; as `token` and as `secret`; any value, the empty one too */
    const addressed = [
      requestOf({ token: sentinel, via: "query", method }),
      requestOf({ token: sentinel, via: "header", params: { token: sentinel }, method }),
      requestOf({ token: sentinel, via: "header", params: { token: hex64() }, method }),
      requestOf({ token: sentinel, via: "body", params: { secret: sentinel } }),
      requestOf({ via: "header", params: { secret: sentinel }, method }),
      requestOf({ via: "header", params: { token: "" }, method }),
    ];
    for (const [i, { url, req, body }] of addressed.entries()) {
      env.calls.length = 0;
      assert.equal(A.namespaceGate(url), null);
      const credential = A.presentedCredential({ req, url, body });
      assert.equal(credential.inAddress, true, `${kind}/${i}`);
      const r = A.credentialAddressGate(url, credential);
      const b = refused({ refusal: r }, 400, "CREDENTIAL_IN_ADDRESS", "C-38.10", [sentinel, sha(sentinel)]);
      assert.deepEqual(b.named, ["token", "secret"].filter((k) => url.searchParams.has(k)), `${kind}/${i}`);
      assert.equal(b.translation, C.ADMISSION_CHECKS.CREDENTIAL_IN_ADDRESS.translation);
      assert.equal("deprecated" in b, false, "no answer carries deprecated");
      answers.push(b);
      /* and through the door's order: refused before any lookup, confinement, public op or admission */
      const g = await gate(env, { op, token: sentinel, via: "query", method });
      refused(g, 400, "CREDENTIAL_IN_ADDRESS", "C-38.10", [sentinel]);
      assert.equal(env.calls.length, 0, `${kind}/${i}: no request to the store`);
    }
  }
  for (const b of answers) assert.doesNotMatch(JSON.stringify(b), PLACES);
  /* the gate judges the address whatever the credential answer says, and the answer's own mark too */
  refused({ refusal: A.credentialAddressGate(urlOf({ token: "x" })) }, 400, "CREDENTIAL_IN_ADDRESS", "C-38.10");
  refused({ refusal: A.credentialAddressGate(urlOf({}), { token: null, secret: null, inAddress: true }) }, 400, "CREDENTIAL_IN_ADDRESS", "C-38.10");
  /* negative controls: no token or secret named is admitted past this gate, other parameters included (`key` and
     `link` travel as addresses by design, K2129 (5)) */
  for (const params of [{}, { store: "bio" }, { key: "wk_x", link: "jl_x", cover: "c" }, { tokens: "x", Secret: "y", tok: "z" }]) {
    const u = urlOf(params);
    assert.equal(A.credentialAddressGate(u, A.presentedCredential({ url: u, body: { token: S.ann } })), null, JSON.stringify(params));
  }
  /* every gate judges presentedCredential's answer and no other: an address credential alone admits nobody */
  for (const [t, op] of [[S.ann, "index"], [K.ann, "index"], [env.ADMIN_TOKEN, "index"], [env.ADMIN_TOKEN, "export"]]) {
    const u = urlOf({ token: t });
    const credential = A.presentedCredential({ url: u });
    assert.equal(credential.token, null);
    env.calls.length = 0;
    const looked = await A.aiCredentialPresented(u, env, doAnswer, { credential });
    assert.deepEqual(looked, { cred: null });
    refused(await A.admit({ url: u, env, op, spec: OPS[op], method: "GET", presented: looked, doAnswer, credential }), 401, "NOT_AUTHENTICATED", "C-38.1", [t]);
    assert.deepEqual(await A.readerOf(u, env, "bio", undefined, doAnswer, credential), { viewer: "" });
    assert.equal(env.calls.length, 0, "nothing looked up");
  }
  /* queryGate: a token or a secret never stays in the address, whatever the op */
  for (const op of [...PUBLIC.slice(0, 5), ...GATED.slice(0, 5), "reviewcopy", "groupkeyset"]) {
    const u = urlOf({ token: S.ann, secret: "rv1_x", store: "bio" });
    A.queryGate(u, op, A.presentedCredential({ url: u }));
    assert.deepEqual([u.searchParams.has("token"), u.searchParams.has("secret"), u.searchParams.get("store")], [false, false, "bio"], op);
  }
  /* the module's own requests carry nothing of a credential in their address: the lookups by header */
  env.calls.length = 0;
  await gate(env, { op: "index", token: S.ann, method: "GET" });
  await gate(env, { op: "index", token: K.ann, method: "GET" });
  assert.deepEqual(env.calls.map((c) => [c.route, c.href]), [["session", "http://do/session"], ["aicredentiallook", "http://do/aicredentiallook"]]);
});

/* ---------------------------------------------------------------------------------------------------------------- */

test("R5 (T36): no binding class member exists — a live MEMBER_TOKEN presented by header or by body gives no class and is refused 401 MEMBER_TOKEN_RETIRED (C-38.11) for every gated op, before anything is looked up, read or written; all four bindings are still compared; with no MEMBER_TOKEN bound, a value once held is any unknown credential (R7)", async () => {
  const { env } = world();
  const v = env.MEMBER_TOKEN;
  assert.equal(await A.classify(v, env), null, "no class");
  for (const op of GATED) for (const via of ["header", "body"]) {
    env.calls.length = 0;
    const body = refused(await gate(env, { op, token: v, via, params: { store: op === "livefire" ? "scratch" : undefined } }),
                         401, "MEMBER_TOKEN_RETIRED", "C-38.11", [v, sha(v)]);
    assert.equal(body.error, "the shared member key is retired");
    assert.match(body.detail, /own password/);
    assert.equal(env.calls.length, 0, `${op}/${via}: nothing read or written`);
  }
  /* the sentence: the key is retired, and a member signs in with their own password */
  const row = C.ADMISSION_CHECKS.MEMBER_TOKEN_RETIRED;
  assert.match(row.translation, /shared member key/);
  assert.match(row.translation, /retired/);
  assert.match(row.translation, /their own password/);
  /* the bearer fences and the scope never see it: it is refused before them */
  refused(await gate(env, { op: "adminendorse", token: v }), 401, "MEMBER_TOKEN_RETIRED", "C-38.11");
  refused(await gate(env, { op: "groupnameset", token: v }), 401, "MEMBER_TOKEN_RETIRED", "C-38.11");
  /* a public op judges no credential: admitted as anybody, and its reader reads the key as no one, looking nothing up */
  env.calls.length = 0;
  assert.equal((await gate(env, { op: "invitelook", token: v })).public, true);
  assert.deepEqual(await A.readerOf(urlOf({}), env, "bio", undefined, doAnswer, presenting(v)), { viewer: "" });
  assert.equal(env.calls.length, 0);
  /* constant time: the retired key costs the same digests and liveness checks as any credential */
  const subtle = globalThis.crypto.subtle;
  const real = subtle.digest.bind(subtle);
  let n = 0;
  subtle.digest = async (alg, data) => { n++; return real(alg, data); };
  try {
    const cost = async (t) => { n = 0; await A.classify(t, env); return n; };
    const costs = [await cost(v), await cost(env.ADMIN_TOKEN), await cost(hex64())];
    assert.deepEqual(costs, [9, 9, 9], "the presented digest and, per binding, its digest and liveToken's");
  } finally { subtle.digest = real; }
  /* not bound (the installer writes none): a value once held is any unknown credential, NOT_AUTHENTICATED */
  const none = world({ omit: ["MEMBER_TOKEN"] });
  for (const op of ["index", "promote", "selftest"]) {
    none.env.calls.length = 0;
    refused(await gate(none.env, { op, token: v, method: "GET" }), 401, "NOT_AUTHENTICATED", "C-38.1", [v]);
  }
  none.env.MEMBER_TOKEN = "";
  refused(await gate(none.env, { op: "index", token: v, method: "GET" }), 401, "NOT_AUTHENTICATED", "C-38.1");
  /* negative controls: the other bindings keep their classes; a session and an agent credential are admitted */
  const w = world();
  assert.equal((await gate(w.env, { op: "index", token: w.env.ADMIN_TOKEN, method: "GET" })).caller.cls, "admin");
  assert.equal((await gate(w.env, { op: "index", token: w.env.PROBE_TOKEN, method: "GET" })).caller.cls, "probe");
  assert.equal((await gate(w.env, { op: "monitor", token: w.env.DAEMON_TOKEN })).caller.cls, "daemon");
  assert.equal((await gate(w.env, { op: "index", token: w.S.ann, method: "GET" })).caller.cls, "member");
  assert.equal((await gate(w.env, { op: "index", token: w.K.ann, method: "GET" })).caller.cls, "ai");
});

/* ---------------------------------------------------------------------------------------------------------------- */

test("R22 (T36): the gate's MEMBER_TOKEN_RETIRED and its expired and revoked agent refusals reach credentials' tally through the store's internal route securitycount, once each, as kind credential with the request's country (none for an agent credential naming a member); CREDENTIAL_IN_ADDRESS and the other refusals are not counted", async () => {
  const lapsed = aik(), mine = aik();
  const { env, S, K } = world({ creds: { [lapsed]: cred({ principal: "class:ai", expired: true, expiresAt: "2026-01-01T00:00:00Z" }),
                                         [mine]: cred({ principal: "member:ann", expired: true, expiresAt: "2026-01-01T00:00:00Z" }) } });
  const reqIn = (country) => { const r = new Request("https://plane.example/api"); Object.defineProperty(r, "cf", { value: { country } }); return r; };
  /* the door's flow: the gate's refusal, then the tally of it, as control-plane R59 calls it */
  const drive = async (token, { via = "header", op = "index" } = {}) => {
    const { url, req, body } = requestOf({ token, via, method: "GET" });
    const credential = A.presentedCredential({ req, url, body });
    const looked = credential.inAddress ? { cred: null } : await A.aiCredentialPresented(url, env, doAnswer, { credential });
    const r = await gate(env, { op, token, via, method: "GET" });
    env.calls.length = 0;
    const out = await A.securityTally({ op, answer: r.refusal, presented: { token: credential.token, cred: looked.cred }, req: reqIn("PT"), env, doAnswer });
    return { r, out, writes: env.calls.filter((c) => c.route === "securitycount").map((c) => c.body) };
  };
  const retired = await drive(env.MEMBER_TOKEN);
  assert.equal(retired.r.refusal.body.reason, "MEMBER_TOKEN_RETIRED");
  assert.deepEqual([retired.out, retired.writes], [{ kind: "credential", country: "PT" }, [{ kind: "credential", country: "PT" }]]);
  const exp = await drive(lapsed);
  assert.deepEqual([exp.r.refusal.body.reason, exp.writes], ["AI_CREDENTIAL_EXPIRED", [{ kind: "credential", country: "PT" }]]);
  const own = await drive(mine);
  assert.deepEqual([own.r.refusal.body.reason, own.writes], ["AI_CREDENTIAL_EXPIRED", [{ kind: "credential", country: null }]]);
  const rev = await drive(K.revoked);
  assert.deepEqual([rev.r.refusal.body.reason, rev.writes], ["AI_CREDENTIAL_REVOKED", [{ kind: "credential", country: null }]], "its principal is a member");
  const org = await drive(K.org);
  assert.deepEqual([org.r.caller?.cls, org.writes], ["ai", []], "negative control: an admitted caller is not counted");
  /* not counted: a credential in the address (a malformed request, not a refused key), a stranger, a session's refusal */
  for (const [token, via, op, code] of [[S.ann, "query", "index", "CREDENTIAL_IN_ADDRESS"], [hex64(), "header", "index", "NOT_AUTHENTICATED"],
                                        [S.ann, "header", "governorconfig", "SESSION_ROLE_CANNOT_REACH_OP"]]) {
    const d = await drive(token, { via, op });
    assert.equal(d.r.refusal.body.reason, code);
    assert.deepEqual([d.out, d.writes], [null, []], code);
  }
});
