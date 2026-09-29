/* control-plane: the envelope (R21–R25), the answer invariants (R30, R32, R33). Driven through `makeFetch(hooks)` and the
   exported envelope functions. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, O, world, call, opCalls, sha, hex64, aik, cred, refused, FORGED, QUERY_STAMPS } from "./harness.mjs";
import * as REVIEW_CHECKS from "../../../src/review/checks.mjs";
import * as CP_CHECKS from "../../../src/control-plane/checks.mjs";
const D = await import("../../../src/control-plane/dispatch.mjs");

const { OPS, UNATTENDED_BY_DECISION } = O;
const GATED = Object.keys(OPS).filter((k) => OPS[k].classes !== null);
const PUBLIC = Object.keys(OPS).filter((k) => OPS[k].classes === null);
const reply = (o, status = 200) => () => new Response(JSON.stringify(o), { status });

/* A broad drive: every op for several callers, with every stamp forged, plus a refusal of every kind. Answers returned. */
async function sweep(w) {
  const { env, S, A } = w;
  const out = [];
  const forged = Object.fromEntries(QUERY_STAMPS.map((k) => [k, FORGED]));
  for (const [token, params] of [[undefined, {}], [env.ADMIN_TOKEN, {}], [env.PROBE_TOKEN, { store: "bio" }], [env.DAEMON_TOKEN, {}],
                                 [S.ann, {}], [S.bare, {}], [A.ann, {}], [A.revoked, {}], [A.confined, { store: "bio" }]])
    for (const op of Object.keys(OPS)) {
      const r = await call(env, { op, token, params: { ...params, ...forged, draft: "D1" }, method: "POST", body: { password: "pw" } });
      out.push({ op, token, r });
    }
  for (const req of [{ op: "nosuchop" }, { op: "index", params: { store: "x" } }, { op: "knock", params: { store: "scratch" } },
                     { op: "aicredentialmint", token: S.ann, body: { writes: ["purge"] } },
                     { op: "aicredentialmint", token: S.ann, body: { writes: [], confinedTo: "bio" } },
                     { op: "claim", body: { bootstrapToken: "no" } }])
    out.push({ op: req.op, r: await call(env, { method: "POST", body: {}, ...req }) });
  return out;
}

test("R21: every answer is JSON with access-control-allow-origin *; a forwarded answer is the handler's with store and tokenClass added and its HTTP status kept", async () => {
  const w = world();
  for (const { op, r } of await sweep(w)) {
    assert.match(r.headers.get("content-type") ?? "", /^application\/json/, op);
    assert.equal(r.headers.get("access-control-allow-origin"), "*", op);
    assert.notEqual(r.json, null, `${op}: ${r.text.slice(0, 80)}`);
  }
  /* the forward: the handler's body, two fields added, the status kept */
  for (const [status, body] of [[200, { ok: true, result: { a: 1 } }], [207, { ok: true, result: [1, 2], extra: "kept" }],
                                [404, { ok: true, result: { ok: false, reason: "NO_SUCH_BUNDLE" } }]]) {
    const f = world({ answer: (c) => (c.route === "index" ? reply(body, status)() : null) });
    for (const [token, params, st, tc] of [[f.env.MEMBER_TOKEN, {}, "bio", "member"], [f.env.PROBE_TOKEN, {}, "scratch", "probe"],
                                           [f.S.ann, { store: "scratch" }, "scratch", "member"], [f.A.ann, {}, "bio", "ai"]]) {
      const r = await call(f.env, { op: "index", token, params });
      assert.equal(r.status, status);
      assert.deepEqual(r.json, { ...M.dec49Attach(JSON.parse(JSON.stringify(body))), store: st, tokenClass: tc });
    }
  }
});

test("R22: a refusal (ok:false, at the top level or under result) whose reason or code has a catalogue row gains code, check and translation where absent; only those two levels are decorated", () => {
  const row = (code) => { const o = M.dec49Attach({ ok: false, reason: code }); return [o.code, o.check, typeof o.translation]; };
  assert.deepEqual(row("NOT_AUTHENTICATED"), ["NOT_AUTHENTICATED", "C-38.1", "string"]);
  /* a module's own checks file is a catalogue row too */
  const fam = Object.entries(REVIEW_CHECKS).find(([k]) => /_CHECKS$/.test(k))[1];
  const [code, r] = Object.entries(fam).find(([, v]) => v.translation);
  assert.deepEqual(row(code), [code, r.check, "string"]);
  assert.equal(M.dec49Attach({ ok: false, reason: code }).translation, r.translation);
  /* by `code` when there is no reason */
  assert.equal(M.dec49Attach({ ok: false, code: "CLASS_FORBIDDEN" }).check, "C-38.2");
  /* under result */
  const u = M.dec49Attach({ ok: true, result: { ok: false, reason: "SCOPE_REFUSED" } });
  assert.deepEqual([u.code, u.result.code, u.result.check], [undefined, "SCOPE_REFUSED", "C-38.6"]);
  /* never overwritten */
  assert.deepEqual(M.dec49Attach({ ok: false, reason: "NOT_AUTHENTICATED", check: "C-0", translation: "mine", code: "X" }),
                   { ok: false, reason: "NOT_AUTHENTICATED", check: "C-0", translation: "mine", code: "X" });
  /* never invented, never on a success, never deeper than result */
  assert.deepEqual(M.dec49Attach({ ok: false, reason: "NO_ROW_FOR_THIS_CODE" }), { ok: false, reason: "NO_ROW_FOR_THIS_CODE" });
  assert.deepEqual(M.dec49Attach({ ok: true, reason: "NOT_AUTHENTICATED" }), { ok: true, reason: "NOT_AUTHENTICATED" });
  assert.deepEqual(M.dec49Attach({ reason: "NOT_AUTHENTICATED" }), { reason: "NOT_AUTHENTICATED" });
  const deep = { ok: true, result: { ok: true, rows: [{ ok: false, reason: "NOT_AUTHENTICATED" }], sub: { ok: false, reason: "SCOPE_REFUSED" } } };
  assert.deepEqual(M.dec49Attach(JSON.parse(JSON.stringify(deep))), deep);
  assert.deepEqual(M.dec49Attach([{ ok: false, reason: "NOT_AUTHENTICATED" }]), [{ ok: false, reason: "NOT_AUTHENTICATED" }]);
});

test("R22: through the door — a forwarded store refusal under result, and the module's own top-level refusals, carry the row", async () => {
  const w = world({ answer: (c) => (c.route === "cite" ? reply({ ok: true, result: { ok: false, reason: code } })() : null) });
  const fam = Object.entries(REVIEW_CHECKS).find(([k]) => /_CHECKS$/.test(k))[1];
  const [code, row] = Object.entries(fam).find(([, v]) => v.translation);
  const r = await call(w.env, { op: "cite", token: w.env.ADMIN_TOKEN, method: "POST", body: {} });
  assert.deepEqual([r.json.result.code, r.json.result.check, r.json.result.translation], [code, row.check, row.translation]);
  assert.equal(r.json.code, undefined);
  /* a hook's answer through json() is decorated the same way */
  const hooks = { publicOp: async () => M.json({ ok: false, reason: "SCOPE_REFUSED" }, 403), gatedOp: async () => undefined };
  const h = await call(w.env, { op: "knock", hooks, method: "POST", body: {} });
  assert.deepEqual([h.status, h.json.check], [403, "C-38.6"]);
});

test("R23: an answer that is not JSON with ok:true is 502 STORE_DID_NOT_ANSWER (C-69.2) naming the op, never an absence, refusal or success", async () => {
  /* doAnswer: `answered` is ok === true and nothing else */
  const ans = async (x) => M.doAnswer(x);
  for (const result of [null, [], {}, 0, "", { ok: false }]) {
    const a = await ans(new Response(JSON.stringify({ ok: true, result })));
    assert.deepEqual(a, { answered: true, result });
  }
  for (const bad of [new Response("nope"), new Response(JSON.stringify({ ok: false, error: "e" })), new Response(JSON.stringify({ ok: "true" })),
                     new Response(JSON.stringify({ result: 1 })), new Response(""), Promise.reject(new Error("x"))])
    assert.deepEqual(await ans(bad), { answered: false, result: undefined });
  const s = M.storeSilent("verify");
  assert.equal(s.status, 502);
  const sj = await s.json();
  assert.deepEqual([sj.ok, sj.reason, sj.code, sj.check, sj.op], [false, "STORE_DID_NOT_ANSWER", "STORE_DID_NOT_ANSWER", "C-69.2", "verify"]);
  assert.ok(sj.translation && sj.detail);
  /* through the door, for each read the module makes itself */
  const failures = [() => new Response("<html>"), reply({ ok: false, error: "Error: boom\n    at Store.fetch (store.mjs:1:1)" }, 500),
                    reply({ ok: false, reason: "BAD_JSON" }, 400)];
  for (const bad of failures) {
    for (const [route, drive] of [
      ["reviewcopy", (w) => ({ op: "reviewcopy", params: { secret: "s" } })],
      ["reviewcomment", (w) => ({ op: "reviewcomment", params: { secret: "s" }, method: "POST", body: { text: "x" } })],
      ["statementack", (w) => ({ op: "statementack", params: { secret: "s" } })],
      ["casedrafts", (w) => ({ op: "casedrafts", token: w.S.ann })],
      ["aicredentialmint", (w) => ({ op: "aicredentialmint", token: w.S.ann, method: "POST", body: { writes: [] } })],
      ["reviewgrant", (w) => ({ op: "reviewgrant", token: w.S.founder, method: "POST", body: {} })],
      /* the generic forward, for reads and acts, every kind of caller */
      ["index", (w) => ({ op: "index", token: w.env.ADMIN_TOKEN })],
      ["index", (w) => ({ op: "index", token: w.A.ann })],
      ["cite", (w) => ({ op: "cite", token: w.S.ann, method: "POST", body: {} })],
      ["monitor", (w) => ({ op: "monitor", token: w.env.DAEMON_TOKEN, method: "POST", body: {} })],
      ["list", (w) => ({ op: "list", token: w.env.PROBE_TOKEN })],
    ]) {
      const w = world({ answer: (c) => (c.route === route ? bad() : null) });
      const r = await call(w.env, drive(w));
      refused(r, 502, "STORE_DID_NOT_ANSWER", "C-69.2");
      assert.equal(r.json.op, route);
      assert.doesNotMatch(r.text, /boom|store\.mjs|at Store/);
      assert.equal("token" in r.json || "secret" in r.json, false);
    }
  }
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const quietly = async (fn) => {
  const logged = [], was = console.error;
  console.error = (...a) => logged.push(a.join(" "));
  try { return { value: await fn(), logged }; } finally { console.error = was; }
};

test("R24: a public op relaying the store's answer answers the store's own status and its envelope, and R23 (502 STORE_DID_NOT_ANSWER) on a store failure, never 200 — claim through the door, and login, invitelook and enroll through the relay they answer by", async () => {
  const body = { bootstrapToken: null, password: "pw" };
  const failures = [() => new Response("<html>oops", { status: 200 }), reply({ ok: false, error: "x" }, 200),
                    reply({ ok: false, error: "x" }, 500), reply({ ok: "true", result: {} }), reply({}, 200),
                    () => { throw new Error("gone"); }];
  for (const bad of failures) {
    const w = world({ answer: (c) => (c.route === "claim" ? bad() : null) });
    const r = await call(w.env, { op: "claim", method: "POST", body: { ...body, bootstrapToken: w.env.ADMIN_TOKEN } });
    refused(r, 502, "STORE_DID_NOT_ANSWER", "C-69.2");
    assert.equal(r.json.op, "claim");
    for (const op of ["claim", "login", "invitelook", "enroll"]) {
      const x = await M.relayAnswer(Promise.resolve().then(bad), op);
      assert.equal(x.status, 502, op);
      const j = await x.json();
      assert.deepEqual([j.reason, j.op], ["STORE_DID_NOT_ANSWER", op]);
    }
  }
  /* an answer — a refusal the store returned inside ok:true included — is its envelope, at the store's status */
  for (const [result, status] of [[{ ok: true, claimed: true }, 200], [{ ok: false, reason: "WRONG_PASSWORD" }, 200],
                                  [{ ok: true, session: "s" }, 201]]) {
    const w = world({ answer: (c) => (c.route === "claim" ? reply({ ok: true, result }, status)() : null) });
    const r = await call(w.env, { op: "claim", method: "POST", body: { ...body, bootstrapToken: w.env.ADMIN_TOKEN } });
    assert.equal(r.status, status);
    assert.deepEqual([r.json.ok, r.json.result.ok, r.json.result.reason], [true, result.ok, result.reason]);
    for (const op of ["login", "invitelook", "enroll"]) {
      const x = await M.relayAnswer(reply({ ok: true, result }, status)(), op);
      assert.equal(x.status, status, op);
      assert.deepEqual((await x.json()).result, JSON.parse(JSON.stringify(result)));
    }
  }
});

test("R25: an error thrown in either door is answered with its named internal-error code and a correlation id (PLANE_INTERNAL_ERROR C-69.4 in the Worker, STORE_INTERNAL_ERROR C-69.3 in the store), never the stack, message, path or line, and the stack is logged under the id", async () => {
  const SECRET = "SQLITE_CONSTRAINT secret-value /srv/plane/src/store.mjs:4242";
  const thrower = () => { throw new Error(SECRET); };
  /* the Worker: a throw anywhere in the door — a module's handler, a store stub that throws, a request it cannot read */
  const w0 = world();
  for (const [label, drive] of [
    ["gated hook", (w) => call(w.env, { op: "index", token: w.env.ADMIN_TOKEN,
      hooks: { publicOp: async () => M.json({}), gatedOp: thrower } })],
    ["public hook", (w) => call(w.env, { op: "knock", method: "POST", body: {},
      hooks: { publicOp: thrower, gatedOp: async () => undefined } })],
    ["store stub", (w) => { w.env.STORE.get = thrower; return call(w.env, { op: "index", token: w.env.ADMIN_TOKEN }); }],
    ["page read", (w) => call(w.env, { path: "/", method: "GET",
      hooks: { publicInstanceGroup: thrower, publicOp: async () => M.json({}), gatedOp: async () => undefined } })]]) {
    const w = world();
    const { value: r, logged } = await quietly(() => drive(w));
    refused(r, 500, "PLANE_INTERNAL_ERROR", "C-69.4");
    assert.match(r.json.correlation, UUID, label);
    assert.equal(r.text.includes("secret-value") || r.text.includes("store.mjs") || r.text.includes("SQLITE"), false, label);
    assert.equal(r.text.includes(" at "), false, label);
    assert.equal(logged.length, 1, label);
    const line = JSON.parse(logged[0]);
    assert.deepEqual([line.event, line.correlation], ["PLANE_INTERNAL_ERROR", r.json.correlation], label);
    assert.match(line.stack, /secret-value/, label);
  }
  /* each throw gets its own id */
  const two = [];
  for (let i = 0; i < 2; i++) two.push((await quietly(() => call(w0.env, { op: "index", token: w0.S.ann,
    hooks: { publicOp: async () => M.json({}), gatedOp: thrower } }))).value.json.correlation);
  assert.match(two[0], UUID);
  assert.notEqual(two[0], two[1]);
  /* the store: dispatch's catch, for a route that throws (and for the route map itself throwing) */
  for (const routes of [() => ({ boom: thrower }), thrower]) {
    const { value: res, logged } = await quietly(() => D.dispatch(new Request("http://do/boom", { method: "POST", body: "{}" }),
      { routes, membership: () => { throw new Error("not asked"); } }));
    assert.equal(res.status, 500);
    const text = await res.text();
    const j = JSON.parse(text);
    assert.deepEqual([j.ok, j.reason, j.code, j.check], [false, "STORE_INTERNAL_ERROR", "STORE_INTERNAL_ERROR", "C-69.3"]);
    assert.equal(j.translation, CP_CHECKS.DISPATCH_CHECKS.STORE_INTERNAL_ERROR.translation);
    assert.match(j.correlation, UUID);
    assert.equal(text.includes("secret-value") || text.includes("store.mjs") || text.includes(" at "), false);
    const line = JSON.parse(logged[0]);
    assert.deepEqual([line.event, line.correlation, line.op], ["STORE_INTERNAL_ERROR", j.correlation, "boom"]);
    assert.match(line.stack, /secret-value/);
  }
  /* the Worker relays the store's failure as R23's silence, carrying the store's correlation id and nothing else of it */
  const corr = crypto.randomUUID();
  const w = world({ answer: (c) => (c.route === "index" ? reply({ ok: false, error: SECRET, reason: "STORE_INTERNAL_ERROR", correlation: corr }, 500)() : null) });
  const r = await call(w.env, { op: "index", token: w.env.ADMIN_TOKEN });
  refused(r, 502, "STORE_DID_NOT_ANSWER", "C-69.2");
  assert.equal(r.json.correlation, corr);
  assert.equal(r.text.includes("secret-value"), false);
  /* negative controls: a correlation not from the store's own code, or not an id, is not carried */
  for (const bad of [{ ok: false, correlation: corr }, { ok: false, reason: "STORE_INTERNAL_ERROR", correlation: "x<script>" }]) {
    const v = world({ answer: (c) => (c.route === "index" ? reply(bad, 500)() : null) });
    assert.equal((await call(v.env, { op: "index", token: v.env.ADMIN_TOKEN })).json.correlation, undefined);
  }
});

test("R30: no credential, session token, secret or stack appears in any answer — the one minting answer of R19 excepted — a store's stack included", async () => {
  const w = world();
  const secrets = [w.env.ADMIN_TOKEN, w.env.MEMBER_TOKEN, w.env.PROBE_TOKEN, w.env.DAEMON_TOKEN, ...Object.values(w.S), ...Object.values(w.A)];
  for (const { op, r } of await sweep(w)) {
    for (const s of secrets) assert.equal(r.text.includes(s), false, `${op} leaks a credential`);
    assert.doesNotMatch(r.text, /\n\s+at \S+ \(|\.mjs:\d+/, op);
  }
  /* a store that throws answers its stack; it never reaches the caller, through the forward or the module's own reads */
  const STACK = "Error: boom at /srv/store.mjs:4242\n    at Store.fetch (file:///srv/store.mjs:4242:7)";
  const thrown = world({ answer: (c) => (c.route !== "session" && c.route !== "aicredentiallook"
    ? new Response(JSON.stringify({ ok: false, error: STACK }), { status: 500 }) : null) });
  for (const { op, r } of await sweep(thrown)) {
    assert.equal(r.text.includes("boom") || r.text.includes("/srv/"), false, op);
    assert.doesNotMatch(r.text, /\n\s+at \S+ \(|\.mjs:\d+/, op);
  }
  const t = await call(w.env, { op: "aicredentialmint", token: w.S.ann, method: "POST", body: { writes: [] } });
  const minted = t.json.result.token;
  /* the minted value authenticates afterwards (the store holds its digest) and never appears in any later answer */
  const w2 = world({ creds: { [minted]: cred({ tokenId: "new" }) } });
  const later = await call(w2.env, { op: "whoami", token: minted });
  assert.equal(later.json.result.tokenClass, "ai");
  assert.equal(later.text.includes(minted), false);
});

test("R32: each check the module raises carries its C-number on the wire — C-38.1–.8, C-69.1–.4, C-78.1–.3, C-29.6–.10, C-32.17, C-64.4, C-68.2–.4, C-66.6", async () => {
  const w = world({ answer: (c) => (c.route === "casedrafts" ? new Response("x") : null) });
  const { env, S, A } = w;
  const got = {};
  const note = (r) => { if (r.json?.ok === false && r.json.code) { got[r.json.code] = r.json.check; assert.ok(r.json.translation, r.json.code);
                                                                    sentences[r.json.code] = r.json.translation; } };
  const sentences = {};
  const d = async (req) => note(await call(env, { method: "POST", body: {}, ...req }));
  await d({ op: "index" });                                                     /* C-38.1 */
  await d({ op: "index", token: env.DAEMON_TOKEN });                            /* C-38.2 */
  await d({ op: "purge", token: S.ann });                                       /* C-38.3 */
  await d({ op: "export", token: S.ann });                                      /* C-38.4 */
  await d({ op: "promote", token: S.bare });                                    /* C-38.5 */
  await d({ op: "index", token: env.PROBE_TOKEN, params: { store: "bio" } });   /* C-38.6 */
  await d({ op: "governorconfig", token: S.ann });                              /* C-38.7 */
  const saved = UNATTENDED_BY_DECISION.purge;
  delete UNATTENDED_BY_DECISION.purge;
  try { await d({ op: "purge", token: S.ann }); } finally { UNATTENDED_BY_DECISION.purge = saved; }   /* C-38.8 */
  await d({ op: "nosuchop" });                                                  /* C-69.1 */
  await d({ op: "casedrafts", token: S.ann });                                  /* C-69.2 */
  await d({ op: "index", params: { store: "nope" } });                          /* C-78.1 */
  await d({ op: "knock", params: { store: "scratch" } });                       /* C-78.2 */
  await d({ op: "index", token: A.confined, params: { store: "bio" } });        /* C-78.3 */
  await d({ op: "purge", token: A.ann });                                       /* C-29.6 */
  await d({ op: "index", token: A.revoked });                                   /* C-29.7 */
  await d({ op: "aicredentialmint", token: S.ann, body: { writes: ["nope"] } });            /* C-29.8 */
  await d({ op: "aicredentialmint", token: S.ann, body: { writes: ["purge"] } });           /* C-29.9 */
  await d({ op: "aicredentialmint", token: S.ann, body: { writes: [], confinedTo: "bio" } }); /* C-29.10 */
  await d({ op: "adminendorse", token: env.ADMIN_TOKEN });                      /* C-32.17 */
  await d({ op: "groupnameset", token: env.ADMIN_TOKEN });                      /* C-64.4 */
  await d({ op: "claim", body: { bootstrapToken: "x" } });                      /* C-68.4 */
  const unset = world({ omit: ["ADMIN_TOKEN"] });
  note(await call(unset.env, { op: "claim", method: "POST", body: {} }));       /* C-68.2 */
  const { PUBLISHED_TOKEN_HASHES } = await import("../../../src/tokens.mjs");
  PUBLISHED_TOKEN_HASHES.add(sha(env.ADMIN_TOKEN));
  try { await d({ op: "claim", body: { bootstrapToken: env.ADMIN_TOKEN } }); } finally { PUBLISHED_TOKEN_HASHES.delete(sha(env.ADMIN_TOKEN)); } /* C-68.3 */
  env.CAPTURES = { get: async () => null };
  await d({ op: "promote", token: env.ADMIN_TOKEN, body: { replay: true, provenanceCapture: "0".repeat(64) } });  /* C-66.6 */
  const { value: pie } = await quietly(() => call(env, { op: "index", token: env.ADMIN_TOKEN,
    hooks: { publicOp: async () => M.json({}), gatedOp: () => { throw new Error("x"); } } }));
  note(pie);                                                                    /* C-69.4 */
  const { value: sie } = await quietly(() => D.dispatch(new Request("http://do/x"), { routes: () => ({ x: () => { throw new Error("x"); } }) }));
  const sj = await sie.json();
  got[sj.code] = sj.check; sentences[sj.code] = sj.translation;                 /* C-69.3 */
  assert.deepEqual(got, {
    NOT_AUTHENTICATED: "C-38.1", CLASS_FORBIDDEN: "C-38.2", MACHINE_CREDENTIAL_REQUIRED: "C-38.3", ROOT_OF_TRUST_REQUIRED: "C-38.4",
    NOT_CAPABLE: "C-38.5", SCOPE_REFUSED: "C-38.6", SESSION_ROLE_CANNOT_REACH_OP: "C-38.7", SESSION_ROUTE_NOT_RECORDED: "C-38.8",
    UNKNOWN_OP: "C-69.1", STORE_DID_NOT_ANSWER: "C-69.2", STORE_INTERNAL_ERROR: "C-69.3", PLANE_INTERNAL_ERROR: "C-69.4",
    NAMESPACE_UNKNOWN: "C-78.1", NAMESPACE_PINNED: "C-78.2", NAMESPACE_CONFINED: "C-78.3",
    AI_BEYOND_TASK_SCOPE: "C-29.6", AI_CREDENTIAL_REVOKED: "C-29.7", AI_SCOPE_UNKNOWN_OP: "C-29.8",
    AI_SCOPE_BEYOND_MEMBER_REACH: "C-29.9", AI_CONFINEMENT_NOT_SCRATCH: "C-29.10",
    OPERATOR_TOKEN_CANNOT_GOVERN: "C-32.17", GROUP_IDENTITY_NEEDS_SESSION: "C-64.4",
    BOOTSTRAP_CREDENTIAL_UNSET: "C-68.2", BOOTSTRAP_CREDENTIAL_PUBLISHED: "C-68.3", BOOTSTRAP_CREDENTIAL_MISMATCH: "C-68.4",
    REPLAY_UNVERIFIED: "C-66.6",
  });
  /* the rows are the module's own (K6): its check families hold exactly these, and the wire carries each row's words */
  const own = {};
  for (const [fam, rows] of Object.entries(CP_CHECKS)) if (/_CHECKS$/.test(fam))
    for (const [code, row] of Object.entries(rows)) { assert.equal(own[code], undefined, code); own[code] = row; }
  assert.deepEqual(Object.fromEntries(Object.entries(own).map(([c, r]) => [c, r.check])), got);
  for (const [code, row] of Object.entries(own)) {
    assert.equal(sentences[code], row.translation, code);
    assert.match(row.where, /^src\/control-plane\/(index|dispatch)\.mjs \S+ > is-[a-z-]+$/, code);
  }
});

test("R33: no place is named in this module's answers", async () => {
  const PLACES = /\b(oakland|alameda|berkeley|california|san francisco|bay area|emeryville|contra costa)\b/i;
  const w = world();
  for (const { op, r } of await sweep(w)) assert.doesNotMatch(r.text, PLACES, op);
  for (const t of [M.STORE_SILENT_DETAIL, ...Object.values(UNATTENDED_BY_DECISION)]) assert.doesNotMatch(t, PLACES);
  for (const d of [M.aiScopeDeclaration(["purge"]), M.aiScopeDeclaration(["nope"]), M.aiConfinementDeclaration("bio")])
    assert.doesNotMatch(JSON.stringify(d), PLACES);
});
