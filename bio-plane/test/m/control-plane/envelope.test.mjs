/* control-plane: the envelope (R21–R25), the answer invariants (R30, R32, R33). Driven through `makeFetch(hooks)` and the
   exported envelope functions. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, O, world, call, opCalls, sha, hex64, aik, cred, refused, FORGED, QUERY_STAMPS } from "./harness.mjs";
import * as REVIEW_CHECKS from "../../../src/review/checks.mjs";

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

test("store silence at the credential lookups and the module's own reads: an answer that is not JSON with ok:true is 502 STORE_DID_NOT_ANSWER (C-69.2) naming the op, never an absence, refusal or success", async () => {
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

test.todo("R23 a store answer that is not JSON with ok:true is refused 502 STORE_DID_NOT_ANSWER naming the op — on the "
  + "generic forward too (not yet met: found — the forward (control-plane/index.mjs:3389-3394) reads `await res.json()` "
  + "unguarded, so a non-JSON store answer throws out of fetch with no answer at all, and relays an envelope with "
  + "ok:false (the store's thrown error, an unknown route, BAD_JSON) to the caller as the handler's answer with the "
  + "store's status; the credential lookups, the review door, casedrafts, the mint and the grant hold, driven above)");

test.todo("R24 a public op relaying the store's answer answers the store's own status, and R23 on a store failure, never 200 "
  + "(not yet met: D-679 — claim, login, invitelook and enroll read the store answer without its `ok`; claim's is this "
  + "module's, control-plane/index.mjs:1335)");

test.todo("R25 an error thrown in either door is answered with a named internal-error code (PLANE_INTERNAL_ERROR / "
  + "STORE_INTERNAL_ERROR) and a correlation id, never the stack, message, path or line (not yet met: D-629 — no such code "
  + "exists; the store's catch answers String(e.stack), and a throw in the Worker door, e.g. the forward's unguarded "
  + "res.json() or GET /'s missing publicInstanceGroup, escapes fetch unanswered)");

test("the answers carry no credential, session token or secret — the one minting answer of R19 excepted — and none of the module's own answers carries a stack", async () => {
  const w = world();
  const secrets = [w.env.ADMIN_TOKEN, w.env.MEMBER_TOKEN, w.env.PROBE_TOKEN, w.env.DAEMON_TOKEN, ...Object.values(w.S), ...Object.values(w.A)];
  for (const { op, r } of await sweep(w)) {
    for (const s of secrets) assert.equal(r.text.includes(s), false, `${op} leaks a credential`);
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

test.todo("R30 no stack appears in any answer (not yet met: found with D-629 — the generic forward relays the store's "
  + "envelope as its answer, so the store's catch `{ok:false, error: String(e.stack)}` reaches the caller verbatim, e.g. "
  + "op=index for any admitted caller; credentials, session tokens and secrets are never answered, driven above)");

test("R32: each check the module raises carries its C-number on the wire — C-38.1–.8, C-69.1–.2, C-78.1–.3, C-29.6–.10, C-32.17, C-64.4, C-68.2–.4, C-66.6", async () => {
  const w = world({ answer: (c) => (c.route === "casedrafts" ? new Response("x") : null) });
  const { env, S, A } = w;
  const got = {};
  const note = (r) => { if (r.json?.ok === false && r.json.code) { got[r.json.code] = r.json.check; assert.ok(r.json.translation, r.json.code); } };
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
  assert.deepEqual(got, {
    NOT_AUTHENTICATED: "C-38.1", CLASS_FORBIDDEN: "C-38.2", MACHINE_CREDENTIAL_REQUIRED: "C-38.3", ROOT_OF_TRUST_REQUIRED: "C-38.4",
    NOT_CAPABLE: "C-38.5", SCOPE_REFUSED: "C-38.6", SESSION_ROLE_CANNOT_REACH_OP: "C-38.7", SESSION_ROUTE_NOT_RECORDED: "C-38.8",
    UNKNOWN_OP: "C-69.1", STORE_DID_NOT_ANSWER: "C-69.2",
    NAMESPACE_UNKNOWN: "C-78.1", NAMESPACE_PINNED: "C-78.2", NAMESPACE_CONFINED: "C-78.3",
    AI_BEYOND_TASK_SCOPE: "C-29.6", AI_CREDENTIAL_REVOKED: "C-29.7", AI_SCOPE_UNKNOWN_OP: "C-29.8",
    AI_SCOPE_BEYOND_MEMBER_REACH: "C-29.9", AI_CONFINEMENT_NOT_SCRATCH: "C-29.10",
    OPERATOR_TOKEN_CANNOT_GOVERN: "C-32.17", GROUP_IDENTITY_NEEDS_SESSION: "C-64.4",
    BOOTSTRAP_CREDENTIAL_UNSET: "C-68.2", BOOTSTRAP_CREDENTIAL_PUBLISHED: "C-68.3", BOOTSTRAP_CREDENTIAL_MISMATCH: "C-68.4",
    REPLAY_UNVERIFIED: "C-66.6",
  });
});

test.todo("R32 the two internal-error rows R25 adds (not yet met: D-629 — R25's PLANE_INTERNAL_ERROR and "
  + "STORE_INTERNAL_ERROR rows do not exist yet; every other row of R32 is driven on the wire above)");

test("R33: no place is named in this module's answers", async () => {
  const PLACES = /\b(oakland|alameda|berkeley|california|san francisco|bay area|emeryville|contra costa)\b/i;
  const w = world();
  for (const { op, r } of await sweep(w)) assert.doesNotMatch(r.text, PLACES, op);
  for (const t of [M.STORE_SILENT_DETAIL, ...Object.values(UNATTENDED_BY_DECISION)]) assert.doesNotMatch(t, PLACES);
  for (const d of [M.aiScopeDeclaration(["purge"]), M.aiScopeDeclaration(["nope"]), M.aiConfinementDeclaration("bio")])
    assert.doesNotMatch(JSON.stringify(d), PLACES);
});
