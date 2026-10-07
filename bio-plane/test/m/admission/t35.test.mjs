/* admission: T35-71 (F1, F4, F12, N703; K1934 (5)) — where a credential is read (R20), the binding classes compared in
   constant time (R5), an expired agent credential refused by name (R10), who is calling and the door's window (R21),
   and the refusals counted in credentials' security tally (R22). Each is driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { A, C, O, world, gate, requestOf, urlOf, refused, doAnswer, makeEnv, hex64, aik, cred, sha } from "./harness.mjs";

const { OPS } = O;

/* ---------------------------------------------------------------------------------------------------------------- */

test("R20: presentedCredential reads the token from an exact `Authorization: Bearer <value>` header, else a JSON object body's non-empty string token, else (T35 only) the query's; the secret from the body's string secret, else the query's; inAddress exactly when a value came from the query; a header's or body's value always wins; it never throws", () => {
  const T = hex64(), Q = hex64(), S = "rv1_secret", QS = "rv1_inaddress";
  const P = (o) => A.presentedCredential(o);
  /* the header as the runtime hands it over (a Request's Headers trim surrounding whitespace themselves, so the raw
     value is given through a plain `get`) */
  const hdr = (v) => ({ headers: { get: (k) => (k === "authorization" ? v : null) } });
  /* the header, exactly */
  for (const scheme of ["Bearer", "bearer", "BEARER", "bEaReR"])
    assert.deepEqual(P({ req: hdr(`${scheme} ${T}`) }), { token: T, secret: null, inAddress: false }, scheme);
  assert.equal(P({ req: hdr("Bearer aik-" + "a".repeat(64)) }).token, "aik-" + "a".repeat(64));
  assert.equal(P({ req: hdr("Bearer !~#$%&") }).token, "!~#$%&", "printable characters");
  assert.equal(P({ req: new Request("https://plane.example/api", { headers: { Authorization: `Bearer ${T}` } }) }).token, T, "a Request's header");
  /* any other header form presents no token of its own */
  for (const bad of [`Bearer  ${T}`, `Bearer ${T} `, ` Bearer ${T}`, `Bearer\t${T}`, `Bearer`, `Bearer `, `Basic ${T}`,
                     `Token ${T}`, T, `Bearer ${T} x`, `Bearer ${T}é`])
    assert.equal(P({ req: hdr(bad) }).token, null, JSON.stringify(bad));
  /* the body: a JSON object's non-empty string `token` */
  assert.deepEqual(P({ body: { token: T } }), { token: T, secret: null, inAddress: false });
  for (const body of [{ token: "" }, { token: 7 }, { token: null }, [T], "token", 5, null, { tokens: T }])
    assert.equal(P({ body }).token, null, JSON.stringify(body));
  /* the query, for T35's release only, marked */
  assert.deepEqual(P({ url: urlOf({ token: Q }) }), { token: Q, secret: null, inAddress: true });
  assert.deepEqual(P({ url: urlOf({ token: "" }) }), { token: null, secret: null, inAddress: false });
  /* precedence: header over body over query; the query value beside is not read, and nothing is marked */
  assert.deepEqual(P({ req: hdr(`Bearer ${T}`), body: { token: "b" }, url: urlOf({ token: Q }) }), { token: T, secret: null, inAddress: false });
  assert.deepEqual(P({ body: { token: T }, url: urlOf({ token: Q }) }), { token: T, secret: null, inAddress: false });
  /* a malformed header is not a token, and the body or the query still is */
  assert.deepEqual(P({ req: hdr(`Basic ${T}`), body: { token: "b" } }), { token: "b", secret: null, inAddress: false });
  assert.deepEqual(P({ req: hdr(`Basic ${T}`), url: urlOf({ token: Q }) }), { token: Q, secret: null, inAddress: true });
  /* the secret: the body's string, else the query's (any presented value, the empty one included, as the doors read it) */
  assert.deepEqual(P({ body: { secret: S } }), { token: null, secret: S, inAddress: false });
  assert.deepEqual(P({ body: { secret: "" } }), { token: null, secret: "", inAddress: false });
  assert.deepEqual(P({ url: urlOf({ secret: QS }) }), { token: null, secret: QS, inAddress: true });
  assert.deepEqual(P({ url: urlOf({ secret: "" }) }), { token: null, secret: "", inAddress: true });
  assert.deepEqual(P({ body: { secret: S }, url: urlOf({ secret: QS }) }), { token: null, secret: S, inAddress: false });
  assert.deepEqual(P({ req: hdr(`Bearer ${T}`), url: urlOf({ secret: QS }) }), { token: T, secret: QS, inAddress: true });
  assert.deepEqual(P({ body: { secret: 9 }, url: urlOf({}) }), { token: null, secret: null, inAddress: false });
  /* never throws */
  const hostile = { get headers() { throw new Error("x"); } };
  for (const o of [undefined, {}, { req: hostile }, { req: { headers: {} } }, { url: {} }, { url: { get searchParams() { throw new Error("y"); } } },
                   { req: { headers: { get() { throw new Error("z"); } } }, body: { token: T } }])
    assert.doesNotThrow(() => P(o));
  assert.deepEqual(P(), { token: null, secret: null, inAddress: false });
  assert.equal(P({ req: { headers: { get() { throw new Error("z"); } } }, body: { token: T } }).token, T);
  assert.equal(A.CREDENTIAL_IN_ADDRESS, "CREDENTIAL_IN_ADDRESS");
});

test("R20: a sentinel credential sent by header, by body and by query to one op of each kind (a session's, an agent credential's, a binding class's, a grant's secret) meets the same admission; only the query's is marked inAddress; a query credential beside a header's is not read or kept; every gate judges presentedCredential's answer; the sentinel is in no address of any request the module makes", async () => {
  const { env, S, K } = world();
  const kinds = [["session", S.ann, "index", "member"], ["agent", K.ann, "index", "ai"], ["binding", env.MEMBER_TOKEN, "index", "member"],
                 ["revoked agent", K.revoked, "index", null], ["unknown", hex64(), "index", null]];
  for (const [kind, sentinel, op, cls] of kinds) {
    const seen = [];
    for (const via of ["header", "body", "query"]) {
      env.calls.length = 0;
      const r = await gate(env, { op, token: sentinel, via, method: "POST" });
      seen.push(r.caller ? ["admitted", r.caller.cls, r.caller.viaSession, r.caller.storeName] : ["refused", r.refusal.status, r.refusal.body.reason]);
      if (r.caller) assert.equal(r.credential.inAddress, via === "query", `${kind}/${via}`);
      for (const c of env.calls) {
        assert.equal(c.href.includes(sentinel), false, `${kind}/${via}: the credential is in no address`);
        assert.equal(c.href.includes(sha(sentinel)), false, `${kind}/${via}: nor its digest`);
      }
    }
    assert.deepEqual(seen[0], seen[1], `${kind}: header and body admit alike`);
    assert.deepEqual(seen[0], seen[2], `${kind}: the query admits alike`);
    if (cls) assert.equal(seen[0][1], cls, kind);
  }
  /* a query credential beside a header's is not read, compared or kept: the header's caller, and the URL loses it */
  {
    const { url, req, body } = requestOf({ token: S.ann, via: "header", params: { token: env.ADMIN_TOKEN } });
    const credential = A.presentedCredential({ req, url, body });
    assert.deepEqual(credential, { token: S.ann, secret: null, inAddress: false });
    A.queryGate(url, "index", credential);
    assert.equal(url.searchParams.has("token"), false);
    const a = await A.admit({ url, env, op: "index", spec: OPS.index, method: "GET", presented: { cred: null }, doAnswer, credential });
    assert.deepEqual([a.caller.cls, a.caller.viaSession], ["member", true]);
    /* the same value in the header and the query: the header's is the one presented, and the address loses it */
    const twice = requestOf({ token: S.ann, via: "header", params: { token: S.ann } });
    const tc = A.presentedCredential(twice);
    A.queryGate(twice.url, "index", tc);
    assert.deepEqual([tc.inAddress, twice.url.searchParams.has("token")], [false, false]);
    /* negative control: the query's own credential stays where it is the one presented (T35's deprecated form) */
    const q = urlOf({ token: S.ann });
    A.queryGate(q, "index", A.presentedCredential({ url: q }));
    assert.equal(q.searchParams.get("token"), S.ann);
  }
  /* a secret in the body beats one in the query, which then leaves the URL; alone in the query it stays, marked */
  {
    const u = urlOf({ secret: "rv1_q" });
    const c = A.presentedCredential({ url: u, body: { secret: "rv1_b" } });
    A.queryGate(u, "reviewcopy", c);
    assert.deepEqual([c.secret, c.inAddress, u.searchParams.has("secret")], ["rv1_b", false, false]);
    const v = urlOf({ secret: "rv1_q" });
    const d = A.presentedCredential({ url: v });
    A.queryGate(v, "reviewcopy", d);
    assert.deepEqual([d.secret, d.inAddress, v.searchParams.get("secret")], ["rv1_q", true, "rv1_q"]);
  }
  /* every gate judges the answer it is handed, and no other: readerOf and aiCredentialPresented, by header */
  {
    const { url, req, body } = requestOf({ token: K.ann, via: "header", method: "GET" });
    const credential = A.presentedCredential({ req, url, body });
    const looked = await A.aiCredentialPresented(url, env, doAnswer, { credential });
    assert.equal(looked.cred.tokenId, "agent-ann");
    assert.deepEqual(await A.readerOf(url, env, "bio", undefined, doAnswer, credential), { viewer: "member:ann", cls: "ai" });
    assert.deepEqual(await A.readerOf(url, env, "bio", undefined, doAnswer), { viewer: "" }, "the URL alone carries none");
    const sess = A.presentedCredential({ body: { token: S.founder } });
    assert.deepEqual(await A.readerOf(urlOf({}), env, "bio", undefined, doAnswer, sess), { viewer: "admin", cls: "admin" });
  }
  /* a public door presents nothing, by header too: no lookup */
  env.calls.length = 0;
  for (const op of A.PUBLIC_DOORS) for (const via of ["header", "body", "query"])
    assert.equal((await gate(env, { op, token: K.confined, via })).public, true, `${op}/${via}`);
  assert.equal(env.calls.length, 0);
});

/* ---------------------------------------------------------------------------------------------------------------- */

test("R5 (F12): each binding comparison is of SHA-256 digests in constant time — every presented credential costs the same digests and liveness checks whether it matches a binding, which one, or where it first differs; the classes, their order and liveness are as before", async () => {
  const { env } = world();
  const subtle = globalThis.crypto.subtle;
  const real = subtle.digest.bind(subtle);
  let lengths = [];
  subtle.digest = async (alg, data) => { lengths.push(data.byteLength); return real(alg, data); };
  try {
    const profile = async (t) => { lengths = []; const c = await A.classify(t, env); return { c, lengths: [...lengths] }; };
    const a = env.ADMIN_TOKEN;
    const cases = [a, env.MEMBER_TOKEN, env.PROBE_TOKEN, env.DAEMON_TOKEN,
                   "0" + a.slice(1) === a ? "1" + a.slice(1) : "0" + a.slice(1),   /* differs at the first character */
                   a.slice(0, -1) + (a.endsWith("0") ? "1" : "0"),                /* differs at the last */
                   hex64()];
    const got = [];
    for (const t of cases) got.push(await profile(t));
    assert.deepEqual(got.map((g) => g.c), ["admin", "member", "probe", "daemon", null, null, null]);
    for (const g of got) assert.deepEqual(g.lengths, got[0].lengths, "the same work whatever was presented");
    /* all four bindings are compared and asked live, each time: the presented digest plus, per binding, its digest
       and liveToken's own */
    assert.equal(got[0].lengths.length, 1 + 4 * 2);
    /* negative control: an unset binding still costs its comparison */
    const unset = world({ omit: ["DAEMON_TOKEN"] });
    lengths = [];
    assert.equal(await A.classify(unset.env.ADMIN_TOKEN, unset.env), "admin");
    assert.equal(lengths.length, 1 + 4 + 3, "the unset binding is compared (as the empty value) and is not live");
  } finally { subtle.digest = real; }
  /* the earlier class wins when one value is bound twice, and a non-string is no class */
  const same = world();
  same.env.MEMBER_TOKEN = same.env.ADMIN_TOKEN;
  assert.equal(await A.classify(same.env.ADMIN_TOKEN, same.env), "admin");
  for (const t of [undefined, null, "", 5, {}]) assert.equal(await A.classify(t, env), null);
  /* a value equal to a binding's digest, or to a prefix, is not that binding */
  assert.equal(await A.classify(sha(env.ADMIN_TOKEN), env), null);
  assert.equal(await A.classify(env.ADMIN_TOKEN.slice(0, 32), env), null);
});

/* ---------------------------------------------------------------------------------------------------------------- */

test("R10 (K1934 (5); credentials R42): an ai caller whose credential is answered expired: true is refused 401 AI_CREDENTIAL_EXPIRED (C-29.30) before any scope is judged; one both revoked and expired is AI_CREDENTIAL_REVOKED; an expired credential reads as no one; a live one is admitted", async () => {
  const lapsed = aik(), both = aik(), live = aik();
  const { env } = world({ creds: {
    [lapsed]: cred({ tokenId: "agent-lapsed", expired: true, expiresAt: "2026-07-01T00:00:00Z", writes: ["promote"] }),
    [both]: cred({ tokenId: "agent-both", expired: true, expiresAt: "2026-07-01T00:00:00Z", revoked: true, revokedAt: "2026-06-01", revokedBy: "ann" }),
    [live]: cred({ tokenId: "agent-live", expired: false, expiresAt: "2099-01-01T00:00:00Z", writes: ["promote"] }) } });
  const GATED = Object.keys(OPS).filter((k) => OPS[k].classes !== null);
  for (const op of GATED) {
    env.calls.length = 0;
    const body = refused(await gate(env, { op, token: lapsed, via: "header" }), 401, "AI_CREDENTIAL_EXPIRED", "C-29.30", [lapsed]);
    assert.deepEqual([body.tokenId, body.expiresAt, body.op, body.cls], ["agent-lapsed", "2026-07-01T00:00:00Z", op, "ai"], op);
    assert.equal(env.calls.filter((c) => c.route !== "aicredentiallook").length, 0, `${op}: nothing past the lookup`);
    refused(await gate(env, { op, token: both }), 403, "AI_CREDENTIAL_REVOKED", "C-29.7", [both]);
  }
  /* the gate itself, before scope: an op beyond member reach is still answered expired */
  assert.equal(A.aiTaskScope(cred({ expired: true }), "purge", OPS.purge).refusal.body.reason, "AI_CREDENTIAL_EXPIRED");
  /* R16: an expired credential reads as no one */
  assert.deepEqual(await A.readerOf(urlOf({ token: lapsed }), env, "bio", undefined, doAnswer), { viewer: "", cls: "ai" });
  /* negative controls: live (expired false, or the field absent as before credentials R42) is admitted */
  assert.equal((await gate(env, { op: "promote", token: live })).caller.cls, "ai");
  assert.deepEqual(A.aiTaskScope(cred({ principal: "member:ann" }), "index", OPS.index), { ok: true, viewer: "member:ann" });
  assert.deepEqual(A.aiTaskScope(cred({ principal: "member:ann", expired: "yes" }), "index", OPS.index), { ok: true, viewer: "member:ann" },
                   "only expired: true, as credentials answers it, refuses");
});

/* ---------------------------------------------------------------------------------------------------------------- */

test("R21: countryOf answers Cloudflare's two-character label or null; the window's bound is 300 per source in 10 minutes, its estimate prev × (1 − elapsed/W) + cur, refused at ≥ 300 with 429 DOOR_RATE_LIMITED (C-38.9) carrying stated (composed from the same constants) and retryAfter in whole seconds, naming no address", () => {
  const withCf = (country) => { const r = new Request("https://plane.example/api"); Object.defineProperty(r, "cf", { value: country === undefined ? undefined : { country } }); return r; };
  assert.equal(A.countryOf(withCf("US")), "US");
  assert.equal(A.countryOf(withCf("T1")), "T1");
  for (const bad of ["us", "USA", "", 12, null, undefined, "U"]) assert.equal(A.countryOf(withCf(bad)), null, String(bad));
  for (const r of [null, undefined, {}, new Request("https://plane.example/api"), { get cf() { throw new Error("x"); } }]) assert.equal(A.countryOf(r), null);
  /* the bound and its sentence */
  assert.deepEqual({ ...A.DOOR_WINDOW }, { limit: 300, windowMs: 600000 });
  assert.equal(A.DOOR_WINDOW_STATED, "at most 300 requests from one source in any 10 minutes");
  /* the estimate */
  assert.equal(A.doorWindowEstimate({ prev: 200, cur: 100, elapsedFrac: 0.5 }), 200);
  assert.equal(A.doorWindowEstimate({ prev: 300, cur: 0, elapsedFrac: 0 }), 300);
  assert.equal(A.doorWindowEstimate({ prev: 300, cur: 0, elapsedFrac: 1 }), 0);
  assert.equal(A.doorWindowEstimate({}), 0);
  /* retryAfter: until the estimate is under the bound again, never less than a second */
  const W = 600;
  assert.equal(A.doorRetryAfter({ prev: 300, cur: 0, elapsedFrac: 0 }), 1, "the previous bucket ages out at once");
  const half = A.doorRetryAfter({ prev: 0, cur: 300, elapsedFrac: 0.5 });
  assert.ok(half >= W * 0.5 && half <= W * 0.5 + 3, String(half));
  const r = A.doorRetryAfter({ prev: 400, cur: 150, elapsedFrac: 0.25 });
  /* 400 × (1 − f) + 150 < 300 ⇒ f > 0.625: (0.625 − 0.25) × 600 = 225 s */
  assert.ok(r >= 225 && r <= 227, String(r));
  for (const x of [{ prev: 400, cur: 150, elapsedFrac: 0.25 }, { prev: 0, cur: 350, elapsedFrac: 0.9 }, { prev: 500, cur: 299, elapsedFrac: 0.01 }]) {
    const wait = A.doorRetryAfter(x);
    /* at the moment given, the estimate is under the bound (walk the buckets) */
    const t = x.elapsedFrac + wait / W;
    const est = t < 1 ? A.doorWindowEstimate({ prev: x.prev, cur: x.cur, elapsedFrac: t }) : A.doorWindowEstimate({ prev: x.cur, cur: 0, elapsedFrac: t - 1 });
    assert.ok(est < 300, JSON.stringify({ x, wait, est }));
  }
  /* the refusal */
  const body = refused({ refusal: A.doorRateLimited(225) }, 429, "DOOR_RATE_LIMITED", "C-38.9");
  assert.deepEqual([body.stated, body.retryAfter], [A.DOOR_WINDOW_STATED, 225]);
  assert.equal(body.translation, C.ADMISSION_CHECKS.DOOR_RATE_LIMITED.translation);
  assert.equal(A.doorRateLimited(0.2).body.retryAfter, 1);
  assert.equal(A.doorRateLimited(undefined).body.retryAfter, 1);
  assert.doesNotMatch(JSON.stringify(body), /\b\d{1,3}(\.\d{1,3}){3}\b|[0-9a-f]{32}/, "no address, no fingerprint");
});

/* ---------------------------------------------------------------------------------------------------------------- */

test("R22 (store write deferred to T36 by K2038, N744): securityTally classifies each refusal once — kind credential (a revoked or expired agent credential, an unknown aik- credential, invitelook/enroll NO_SUCH_INVITATION, websiteinvite WEBSITE_KEY_UNKNOWN, joinlinkinvite NO_SUCH_JOIN_LINK), kind rate (DOOR_RATE_LIMITED, WEBSITE_DAILY_CAP, JOIN_LINK_DAILY_CAP); country from countryOf, null when the credential names a member; only kind and country in its answer; every other answer is null; it writes nothing, never throws and never changes the refusal", async () => {
  const reqIn = (country) => { const r = new Request("https://plane.example/api"); Object.defineProperty(r, "cf", { value: { country } }); return r; };
  const req = reqIn("NZ");
  const stranger = { token: null };
  const counted = [
    [{ op: "index", answer: { status: 403, body: { ok: false, reason: "AI_CREDENTIAL_REVOKED", code: "AI_CREDENTIAL_REVOKED" } }, presented: { token: aik(), cred: cred({ principal: "class:ai" }) } }, "credential", "NZ"],
    [{ op: "promote", answer: { status: 401, body: { ok: false, code: "AI_CREDENTIAL_EXPIRED" } }, presented: { token: aik(), cred: cred({ principal: "class:ai" }) } }, "credential", "NZ"],
    [{ op: "index", answer: { status: 401, body: { ok: false, code: "AI_CREDENTIAL_EXPIRED" } }, presented: { token: aik(), cred: cred({ principal: "member:ann" }) } }, "credential", null],
    [{ op: "index", answer: { status: 401, body: { ok: false, code: "NOT_AUTHENTICATED" } }, presented: { token: aik(), cred: null } }, "credential", "NZ"],
    [{ op: "invitelook", answer: { ok: false, reason: "NO_SUCH_INVITATION" }, presented: stranger }, "credential", "NZ"],
    [{ op: "enroll", answer: { ok: false, reason: "NO_SUCH_INVITATION" }, presented: { token: hex64() } }, "credential", null],
    [{ op: "websiteinvite", answer: { ok: false, code: "WEBSITE_KEY_UNKNOWN" }, presented: stranger }, "credential", "NZ"],
    [{ op: "joinlinkinvite", answer: { ok: false, code: "NO_SUCH_JOIN_LINK" }, presented: stranger }, "credential", "NZ"],
    [{ op: "login", answer: A.doorRateLimited(30), presented: stranger }, "rate", "NZ"],
    [{ op: "websiteinvite", answer: { ok: false, code: "WEBSITE_DAILY_CAP" }, presented: stranger }, "rate", "NZ"],
    [{ op: "joinlinkinvite", answer: { ok: false, code: "JOIN_LINK_DAILY_CAP" }, presented: stranger }, "rate", "NZ"],
  ];
  const notCounted = [
    { op: "index", answer: { status: 401, body: { ok: false, code: "NOT_AUTHENTICATED" } }, presented: { token: hex64() } },
    { op: "index", answer: { status: 401, body: { ok: false, code: "NOT_AUTHENTICATED" } }, presented: { token: aik(), cred: cred() } },
    { op: "index", answer: { status: 401, body: { ok: false, code: "NOT_AUTHENTICATED" } }, presented: stranger },
    { op: "index", answer: { status: 403, body: { ok: false, code: "AI_BEYOND_TASK_SCOPE" } }, presented: { token: aik(), cred: cred() } },
    { op: "index", answer: { status: 403, body: { ok: false, code: "CLASS_FORBIDDEN" } }, presented: stranger },
    { op: "websiteinvite", answer: { ok: false, reason: "NO_SUCH_INVITATION" }, presented: stranger },
    { op: "invitelook", answer: { ok: false, code: "WEBSITE_KEY_UNKNOWN" }, presented: stranger },
    { op: "login", answer: { ok: false, code: "SIGN_IN_REFUSED" }, presented: stranger },
    { op: "invitelook", answer: { ok: true, result: {} }, presented: stranger },
    { op: "index", answer: { ok: true, code: "AI_CREDENTIAL_REVOKED" }, presented: stranger },
    { op: "index", answer: null, presented: stranger },
  ];
  /* a store that would record any write: none is made (K2038) */
  const env = makeEnv();
  const fetched = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (...a) => { fetched.push(a); return new Response("{}"); };
  try {
    for (const [args, kind, country] of counted) {
      assert.equal(A.securityKindOf(args), kind, JSON.stringify(args.answer));
      const before = JSON.stringify(args.answer);
      const out = await A.securityTally({ ...args, req, env, doAnswer });
      assert.deepEqual(out, { kind, country }, JSON.stringify(args.answer));
      assert.deepEqual(Object.keys(out).sort(), ["country", "kind"], "nothing but kind and country");
      assert.equal(JSON.stringify(args.answer), before, "the refusal is not changed");
    }
    for (const args of notCounted) {
      assert.equal(A.securityKindOf(args), null, JSON.stringify(args));
      assert.equal(await A.securityTally({ ...args, req, env, doAnswer }), null, JSON.stringify(args));
    }
    /* no country stated: null; a hostile request: null, never a throw */
    assert.deepEqual(await A.securityTally({ ...counted[4][0], req: new Request("https://plane.example/api") }), { kind: "credential", country: null });
    assert.deepEqual(await A.securityTally({ ...counted[4][0], req: { get cf() { throw new Error("x"); } } }), { kind: "credential", country: null });
    for (const odd of [undefined, {}, { answer: 5 }, { answer: "x", presented: 7 }]) assert.equal(await A.securityTally(odd), null);
    assert.equal(env.calls.length, 0, "no store request");
    assert.equal(fetched.length, 0, "no request at all");
  } finally { globalThis.fetch = realFetch; }
  /* the refusals this module gives reach it unchanged: a gate's expired refusal is a refused key */
  const lapsed = aik();
  const w = world({ creds: { [lapsed]: cred({ principal: "class:ai", expired: true, expiresAt: "2026-01-01T00:00:00Z" }) } });
  const r = await gate(w.env, { op: "index", token: lapsed, via: "header" });
  const looked = await A.aiCredentialPresented(urlOf({ token: lapsed }), w.env, doAnswer);
  assert.deepEqual(await A.securityTally({ op: "index", answer: r.refusal, presented: { token: lapsed, cred: looked.cred }, req: reqIn("FR") }),
                   { kind: "credential", country: "FR" });
});
