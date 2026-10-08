/* control-plane T36 (T36-37): R59 and R28 (F1's tail, K2111: a credential in the address refused C-38.10 by admission's
   gate, run directly after admission R1), R53 (`assistantset` not routed), R60 (standards' and calculations' new ops),
   R61 (file-safety's 23 ops; the byte answers relayed as their owner gives them), R62 (a member's and an `ai`
   credential's opening of an original through file-safety), R63 (credentials' keep-away), K2146 (the forward strips a
   caller's `secretSha` and `bySecret`) and R29 over standards' body author. Driven through `makeFetch(hooks)` over the
   harness's store, which records every request the plane makes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, M, world, call, opCalls, aik, cred, hex64, refused, FORGED } from "./harness.mjs";
import { fileSafetyOps } from "../../../src/file-safety/index.mjs";

const { OPS, OP_STAMPS } = O;
const SENTINEL = "sentinel-credential-0123456789abcdefghijklmnop";
const addresses = (env) => [...env.calls, ...env.windowCalls].map((c) => c.url.href);
const ok = (result) => new Response(JSON.stringify({ ok: true, result }));
const SHA = "c".repeat(64);
const BYTES = new Uint8Array([37, 80, 68, 70, 0, 1, 2, 3]);
/* a file the store serves, as file-safety's map answers it through the store's door */
const served = (headers) => new Response(BYTES, { status: 200, headers: { "content-type": "application/octet-stream",
  "content-length": String(BYTES.length), ...headers } });

/* every op file-safety's map serves (its R5–R38), read from the map itself */
const FILE_SAFETY_OPS = Object.keys(fileSafetyOps(null, new URL("http://do/"), null, {})).sort();
const BYTE_OPS = ["openoriginal", "openwithwarning", "safeview", "safecopy"];

function callers() {
  const agent = aik();
  const w = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: Object.keys(OPS) }) } });
  return { w, list: [
    { name: "admin", token: w.env.ADMIN_TOKEN, params: {}, cls: "admin", viewer: "class:admin", by: "class:admin" },
    { name: "probe", token: w.env.PROBE_TOKEN, params: { store: "scratch" }, cls: "probe", viewer: "class:probe", by: "class:probe" },
    { name: "daemon", token: w.env.DAEMON_TOKEN, params: {}, cls: "daemon", viewer: "class:daemon", by: "class:daemon" },
    { name: "founder", token: w.S.founder, params: {}, cls: "admin", session: true, viewer: "admin", by: "admin", author: "member:admin" },
    { name: "ann", token: w.S.ann, params: {}, cls: "member", session: true, viewer: "member:ann", by: "member:ann", author: "member:ann" },
    { name: "agent", token: agent, params: {}, cls: "ai", viewer: "member:ann", by: "class:ai/agent-ann", author: "class:ai/agent-ann" },
  ] };
}

/* ---------------------------------------------------------------- R59, R28 */

test("R59, R28 (admission R20; K2111): with a sentinel credential in the address — alone and beside a header — every kind of op is refused 400 CREDENTIAL_IN_ADDRESS (C-38.10) and no store is asked: a session's, an agent credential's, a binding class's, a grant's door, a review door, a template door, a public op and the instance's page; by header or body the same op is admitted as before, with the sentinel in no address (negative control); and admission R1 runs first", async () => {
  const GRANT = hex64();
  const { env, S, A } = world({ answer: (c) => (c.route === "aigrantadmit" && c.body?.token === GRANT
    ? ok({ ok: true, member: "ann", viewer: "member:ann", expires: 1 }) : null) });
  const kinds = [
    ["session", { op: "search", token: S.ann }],
    ["agent", { op: "search", token: A.ann }],
    ["binding", { op: "search", token: env.ADMIN_TOKEN }],
    ["grant", { op: "search", token: GRANT }],
    ["review door", { op: "reviewcopy", params: { draft: "D1" }, secret: true }],
    ["template door", { op: "templateread", params: { version: "TPL-1@1" }, secret: true }],
    ["public op", { op: "publishedcase", params: { case: "CASE-2026-0001" } }],
    ["the page", { path: "/", params: {} }],
  ];
  for (const [kind, k] of kinds) for (const field of ["token", "secret"]) for (const beside of [false, true]) {
    env.calls.length = 0; env.windowCalls.length = 0;
    const u = new URL(`https://plane.example${k.path ?? "/api"}`);
    if (k.op) u.searchParams.set("op", k.op);
    for (const [p, v] of Object.entries(k.params ?? {})) u.searchParams.set(p, v);
    u.searchParams.set(field, k.token ?? SENTINEL);
    const headers = beside && k.token ? { authorization: `Bearer ${k.token}` } : {};
    const res = await M.makeFetch({ publicOp: async () => M.json({ ok: true }), gatedOp: async () => undefined,
      publicInstanceGroup: async () => ({ answered: true, result: {} }) })(new Request(u, { headers }), env);
    const text = await res.text();
    const where = `${kind} (${field}${beside ? " beside a header" : ""})`;
    assert.equal(res.status, 400, `${where}: ${text.slice(0, 200)}`);
    const body = JSON.parse(text);
    assert.deepEqual([body.reason, body.code, body.check], ["CREDENTIAL_IN_ADDRESS", "CREDENTIAL_IN_ADDRESS", "C-38.10"], where);
    assert.deepEqual([env.calls, env.windowCalls], [[], []], `${where}: no store is asked`);
    assert.equal(text.includes(k.token ?? SENTINEL), false, `${where}: the value is in no answer`);
    assert.equal("deprecated" in body, false);
  }
  /* negative control: the header and body forms are admitted, and the credential is in no address the plane makes */
  for (const [kind, k] of kinds.filter(([, k]) => k.token)) for (const tokenIn of ["header", "body"]) {
    env.calls.length = 0; env.windowCalls.length = 0;
    const r = await call(env, { op: k.op, token: k.token, tokenIn, method: "POST", body: { q: "x" } });
    assert.equal(r.status, 200, `${kind}/${tokenIn}: ${r.text.slice(0, 200)}`);
    for (const href of addresses(env)) assert.equal(href.includes(k.token), false, `${kind}/${tokenIn}: ${href}`);
  }
  for (const k of kinds.filter(([, k]) => k.secret).map(([, k]) => k)) {
    env.calls.length = 0;
    const r = await call(env, { op: k.op, params: { ...k.params, secret: SENTINEL } });
    assert.notEqual(r.status, 400, k.op);
    for (const href of addresses(env)) assert.equal(href.includes(SENTINEL), false, k.op);
  }
  /* R28: admission R1 before R20 — a namespace that does not exist is refused by name first */
  const both = await call(env, { op: "search", token: S.ann, tokenIn: "query", params: { store: "nope" } });
  refused(both, 400, "NAMESPACE_UNKNOWN", "C-78.1");
});

test("R59 (K2111): no answer of the door carries `deprecated`, by any form; R2 still answers an op with no spec first", async () => {
  const { env, S } = world();
  for (const tokenIn of ["header", "body"]) {
    const r = await call(env, { op: "index", token: S.ann, tokenIn, method: "POST", body: {} });
    assert.equal("deprecated" in r.json, false, tokenIn);
  }
  const unknown = await call(env, { op: "nosuchop", token: S.ann, tokenIn: "query" });
  refused(unknown, 400, "UNKNOWN_OP", "C-69.1");
});

/* ---------------------------------------------------------------- R53, R63: not routed */

test("R53 (T36; instance-setup R53), R63: `assistantset` and `securitycount` are answered as ops with no spec, UNKNOWN_OP (C-69.1), for every caller and method, and nothing reaches any store", async () => {
  const { w, list } = callers();
  for (const op of ["assistantset", "securitycount"]) for (const c of list) for (const method of ["GET", "POST"]) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op, token: c.token, params: c.params, method, body: method === "POST" ? { on: true } : undefined });
    refused(r, 400, "UNKNOWN_OP", "C-69.1");
    assert.deepEqual(w.env.calls, [], `${op}/${c.name}`);
  }
});

/* ---------------------------------------------------------------- R60, R63: routed with their stamps */

test("R60, R63, R29 (op-declarations R31, R33): standards' three in-force-through ops, calculations' two spot-check ops and credentials' two keep-away ops reach the store's route of their own name for every caller their specs admit, each declared stamp set from the credential whatever the caller forged, the body's own fields kept; standards' acts carry the author in the body (standards R50 reads it there); a caller their specs refuse reaches no store", async () => {
  const { w, list } = callers();
  const ops = ["standardinforcethrough", "standardinforcethroughwithdraw", "inforcethroughof", "spotcheckvisit", "spotcheck",
               "aikeepaway", "aikeepawaystate"];
  let reached = 0;
  const seenOps = new Set();
  for (const op of ops) {
    assert.ok(Object.hasOwn(OPS, op), `${op} has a spec`);
    for (const c of list) {
      w.env.calls.length = 0;
      const forged = Object.fromEntries(["viewer", "by", "author"].map((k) => [k, FORGED]));
      const r = await call(w.env, { op, token: c.token, params: { ...c.params, ...forged }, method: OPS[op].mutating ? "POST" : "GET",
                                    body: OPS[op].mutating ? { on: true, reason: "kept", note: "kept", author: FORGED, by: FORGED } : undefined });
      if (r.status !== 200) { assert.ok([401, 403].includes(r.status), `${op}/${c.name}: ${r.status}`); assert.deepEqual(opCalls(w.env), []); continue; }
      const [inner] = opCalls(w.env);
      assert.equal(inner.route, op);
      seenOps.add(op);
      for (const k of OP_STAMPS[op] ?? []) if (k !== "bodyBy") assert.equal(inner.params[k], c[k] ?? c.by, `${op}/${c.name}: ${k}`);
      for (const k of ["viewer", "by", "author"]) assert.notEqual(inner.params[k], FORGED, `${op}/${c.name}: ?${k}`);
      if (OPS[op].mutating) {
        assert.equal(inner.body.note, "kept");
        if (op.startsWith("standardinforcethrough")) assert.equal(inner.body.author, c.author, `${op}/${c.name}: the body's author`);
        if (op === "aikeepaway") assert.deepEqual([inner.body.on, inner.body.reason], [true, "kept"]);
      }
      reached++;
    }
  }
  assert.deepEqual([...seenOps].sort(), [...ops].sort(), "every op reaches its route for some caller");
  assert.ok(reached >= 15, String(reached));
});

test("R29 (K1687; op-declarations' standards family): every act of standards' family, T35's force, release, adoption, imposition and benchmark acts among them, reaches standards with `author` in the body — the positional identity for a session, the machine's own name otherwise — and every proposal with `proposer`, whatever the caller put there (negative control: the body's own fields are kept)", async () => {
  const { w, list } = callers();
  const fam = O.OP_FAMILIES.standards;
  let checked = 0;
  for (const op of [...fam.acts, ...fam.proposals]) for (const c of list) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op, token: c.token, params: c.params, method: "POST", body: { author: FORGED, proposer: FORGED, note: "kept" } });
    if (r.status !== 200) { assert.ok([401, 403].includes(r.status), `${op}/${c.name}: ${r.status}`); continue; }
    const [inner] = opCalls(w.env);
    const key = fam.proposals.includes(op) ? "proposer" : "author";
    const want = c.session ? c.author : c.cls === "ai" ? "class:ai/agent-ann" : `class:${c.cls}`;
    assert.equal(inner.body[key], want, `${op}/${c.name}`);
    assert.equal(Object.hasOwn(inner.body, key === "author" ? "proposer" : "author"), false, `${op}/${c.name}`);
    assert.equal(inner.body.note, "kept");
    checked++;
  }
  assert.ok(checked >= 20, String(checked));
});

/* ---------------------------------------------------------------- K2146 */

test("K2146 (R44, R59; publication R73): the generic forward strips `secretSha` and `bySecret` from every caller's body, as it strips the body stamps and `token`, so no caller supplies the digest; the body's own fields are kept", async () => {
  const { w, list } = callers();
  let checked = 0;
  for (const op of ["cite", "notewrite", "aikeepaway", "templatecommentresolve", "inboxresolve"].filter((o) => Object.hasOwn(OPS, o)))
    for (const c of list) {
      w.env.calls.length = 0;
      const r = await call(w.env, { op, token: c.token, params: c.params, method: "POST",
                                    body: { secretSha: "f".repeat(64), bySecret: "1", note: "kept" } });
      if (r.status !== 200) continue;
      const inner = opCalls(w.env).find((x) => x.route !== "inboxpullfile");
      if (!inner || !inner.body || typeof inner.body !== "object") continue;
      assert.deepEqual(["secretSha" in inner.body, "bySecret" in inner.body, inner.body.note], [false, false, "kept"], `${op}/${c.name}`);
      assert.equal(inner.params.secretSha, undefined);
      checked++;
    }
  assert.ok(checked >= 6, String(checked));
});

/* ---------------------------------------------------------------- R61 */

test("R61, R29 (op-declarations R32): every one of file-safety's 23 ops reaches the store's route of its own name for every caller its spec admits — with the stamps it declares set from the credential, none the caller forged — and every caller it refuses reaches no store", async () => {
  assert.equal(FILE_SAFETY_OPS.length, 23, FILE_SAFETY_OPS.join(","));
  const { w, list } = callers();
  let reached = 0;
  const seenOps = new Set();
  for (const op of FILE_SAFETY_OPS) {
    assert.ok(Object.hasOwn(OPS, op), `${op} has a spec`);
    for (const c of list) {
      w.env.calls.length = 0;
      const r = await call(w.env, { op, token: c.token, params: { ...c.params, capture: SHA, viewer: FORGED, by: FORGED },
                                    method: OPS[op].mutating ? "POST" : "GET", body: OPS[op].mutating ? { reason: "kept" } : undefined });
      if (r.status !== 200) { assert.ok([401, 403].includes(r.status), `${op}/${c.name}: ${r.status}`); assert.deepEqual(opCalls(w.env), [], `${op}/${c.name}`); continue; }
      const [inner] = opCalls(w.env);
      assert.deepEqual([inner.route, inner.params.capture], [op, SHA], `${op}/${c.name}`);
      seenOps.add(op);
      for (const k of OP_STAMPS[op] ?? []) assert.equal(inner.params[k], c[k] ?? c.by, `${op}/${c.name}: ${k}`);
      for (const k of ["viewer", "by"]) if (!(OP_STAMPS[op] ?? []).includes(k)) assert.equal(inner.params[k], undefined, `${op}/${c.name}: ?${k} not the caller's`);
      reached++;
    }
  }
  assert.deepEqual([...seenOps].sort(), FILE_SAFETY_OPS, "every op reaches its route for some caller");
  /* the member-session-only ops refuse every machine credential (op-declarations R32's machineClasses: []) */
  for (const op of ["openoriginal", "openwithwarning", "deepercheck", "safecopyrequest", "releasescanhold"]) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op, token: w.env.ADMIN_TOKEN, method: "POST", params: { capture: SHA }, body: {} });
    assert.ok([401, 403].includes(r.status), `${op}: ${r.status}`);
    assert.deepEqual(opCalls(w.env), [], op);
  }
  assert.ok(reached >= 40, String(reached));
});

test("R61: the four byte answers are served as `op=capture`'s GET serves a capture's bytes — the owner's bytes, content type, length and digest header as the owner answers them, never wrapped in the JSON envelope, with `cache-control: no-store` — and a refusal is enveloped as any refusal; `openwithwarning` takes `warned` from the body, and a GET's query `warned` is carried there", async () => {
  const headersOf = { openoriginal: { "x-capture-sha256": SHA }, openwithwarning: { "x-capture-sha256": SHA },
                      safeview: { "content-type": "application/pdf", "x-derived-sha256": "d".repeat(64), "x-of": SHA },
                      safecopy: { "x-derived-sha256": "e".repeat(64), "x-of": SHA } };
  let refuse = false;
  const { env, S } = world({ answer: (c) => (BYTE_OPS.includes(c.route)
    ? (refuse ? ok({ ok: false, reason: "SAFE_VIEW_ONLY", code: "SAFE_VIEW_ONLY" }) : served(headersOf[c.route])) : null) });
  for (const op of BYTE_OPS) for (const method of ["GET", "POST"]) {
    refuse = false;
    env.calls.length = 0;
    const r = await call(env, { op, token: S.ann, method, params: { capture: SHA }, body: method === "POST" ? {} : undefined });
    assert.equal(r.status, 200, `${op}/${method}: ${r.text.slice(0, 200)}`);
    assert.equal(r.json, null, `${op}: not enveloped`);
    assert.deepEqual([...new TextEncoder().encode(r.text)].length, BYTES.length);
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.equal(r.headers.get("content-length"), String(BYTES.length));
    for (const [k, v] of Object.entries(headersOf[op])) assert.equal(r.headers.get(k), v, `${op}: ${k}`);
    if (!headersOf[op]["content-type"]) assert.equal(r.headers.get("content-type"), "application/octet-stream");
    refuse = true;
    const n = await call(env, { op, token: S.ann, method, params: { capture: SHA }, body: method === "POST" ? {} : undefined });
    assert.deepEqual([n.json?.result?.reason, n.json?.store, typeof n.json?.tokenClass], ["SAFE_VIEW_ONLY", "bio", "string"], `${op}: a refusal is enveloped`);
    assert.match(n.headers.get("content-type"), /application\/json/);
  }
  /* `warned`: the body's on a POST; a GET's query `warned` carried into the store request's body */
  const warned = { own_device: true, no_macros: true };
  for (const [method, params, body] of [["POST", { capture: SHA }, { warned }], ["GET", { capture: SHA, warned: JSON.stringify(warned) }, undefined]]) {
    refuse = false;
    env.calls.length = 0;
    await call(env, { op: "openwithwarning", token: S.ann, method, params, body });
    const [inner] = opCalls(env);
    assert.deepEqual([inner.route, inner.method, inner.body?.warned, inner.params.warned], ["openwithwarning", "POST", warned, undefined], method);
  }
});

test("R61 (file-safety R10; K1892): for the byte answers and `verdictnotes`, `threatof`, `originalstate`, `deepercheck` and `safecopyrequest`, the door logs nothing that puts a caller beside a capture — no line names the member or the file — and adds nothing naming either to an answer", async () => {
  const { env, S } = world({ answer: (c) => (BYTE_OPS.includes(c.route) ? served({ "x-capture-sha256": SHA }) : null) });
  const lines = [];
  const saved = { log: console.log, info: console.info, warn: console.warn, error: console.error, debug: console.debug };
  for (const k of Object.keys(saved)) console[k] = (...a) => { lines.push(a.map(String).join(" ")); };
  try {
    for (const op of [...BYTE_OPS, "verdictnotes", "threatof", "originalstate", "deepercheck", "safecopyrequest"]) {
      const r = await call(env, { op, token: S.ann, method: OPS[op]?.mutating ? "POST" : "GET", params: { capture: SHA },
                                  body: OPS[op]?.mutating ? {} : undefined });
      assert.equal(r.text.includes("member:ann") || r.text.includes(S.ann), false, op);
    }
  } finally { Object.assign(console, saved); }
  assert.equal(lines.some((l) => l.includes(SHA) || l.includes("ann")), false, lines.join("\n"));
});

test("R61 (op-declarations R32; R30's rule, as R56): `securitytooladd`'s `credentials` and `config` pass from the request's body alone — the query's never reach the store, nor any address the plane makes — and appear in no answer", async () => {
  const { env, S } = world();
  const secret = { api_key: SENTINEL };
  env.calls.length = 0;
  const r = await call(env, { op: "securitytooladd", token: S.founder, method: "POST",
                              params: { credentials: "query-" + SENTINEL, config: "query-config" },
                              body: { providerId: "virustotal", credentials: secret, config: { region: "eu" } } });
  assert.equal(r.status, 200, r.text.slice(0, 200));
  const [inner] = opCalls(env);
  assert.deepEqual([inner.route, inner.body.credentials, inner.body.config, inner.params.credentials, inner.params.config],
                   ["securitytooladd", secret, { region: "eu" }, undefined, undefined]);
  for (const href of addresses(env)) assert.equal(href.includes(SENTINEL), false, href);
  assert.equal(r.text.includes(SENTINEL), false);
});

/* ---------------------------------------------------------------- R62 */

test("R62 (rev. 2 conflict (c); K1888 (3); BOB's review (8)): a member's session's and an `ai` credential's GET of `op=capture` is answered by file-safety's `openoriginal` route — the capture's digest and the caller's viewer alone sent — its bytes relayed as given, its refusal (SAFE_VIEW_ONLY, SCAN_HOLD) answered as given; with `warned` it is `openwithwarning`; capture's own read is never asked; the binding classes keep capture's own answer (negative control)", async () => {
  let answer = "bytes";
  /* an agent credential that declares `capture` (whose spec is mutating, its GET a read), so admission admits its GET */
  const agent = aik();
  const { env, S } = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: ["capture"] }) }, answer: (c) => {
    if (c.route !== "openoriginal" && c.route !== "openwithwarning") return null;
    return answer === "bytes" ? served({ "x-capture-sha256": SHA }) : ok({ ok: false, reason: answer, code: answer });
  } });
  let captureRead = 0;
  env.CAPTURES = { async get() { captureRead++; return null; }, async head() { return null; } };
  const log = [];
  const hooks = { publicOp: async () => M.json({ ok: true }), publicInstanceGroup: async () => ({ answered: true, result: {} }),
                  gatedOp: async (ctx) => { log.push(ctx.op); return ctx.op === "capture" ? M.json({ ok: true, own: "capture" }) : undefined; } };
  for (const [name, token, viewer] of [["founder", S.founder, "admin"], ["ann", S.ann, "member:ann"], ["agent", agent, "member:ann"]]) {
    answer = "bytes";
    env.calls.length = 0; log.length = 0;
    const r = await call(env, { op: "capture", token, params: { sha256: SHA.toUpperCase(), viewer: FORGED }, hooks });
    assert.equal(r.status, 200, `${name}: ${r.text.slice(0, 200)}`);
    assert.deepEqual([r.json, r.headers.get("x-capture-sha256"), r.headers.get("cache-control")], [null, SHA, "no-store"], name);
    const [inner] = opCalls(env);
    assert.deepEqual([inner.route, inner.method, inner.params], ["openoriginal", "GET", { capture: SHA, viewer }], name);
    assert.deepEqual([log, captureRead], [[], 0], `${name}: capture's own read is not asked`);
    for (const code of ["SAFE_VIEW_ONLY", "SCAN_HOLD"]) {
      answer = code;
      const n = await call(env, { op: "capture", token, params: { sha256: SHA }, hooks });
      assert.equal(n.json.result.reason, code, `${name}: ${code}`);
    }
    answer = "bytes";
    env.calls.length = 0;
    const warned = { own_device: true, no_macros: true };
    await call(env, { op: "capture", token, params: { sha256: SHA, warned: JSON.stringify(warned) }, hooks });
    const [wi] = opCalls(env);
    assert.deepEqual([wi.route, wi.method, wi.body, wi.params], ["openwithwarning", "POST", { warned }, { capture: SHA, viewer }], name);
  }
  /* negative control: a binding class reaches capture's own handler */
  for (const [token, params] of [[env.ADMIN_TOKEN, {}], [env.PROBE_TOKEN, { store: "scratch" }]]) {
    env.calls.length = 0; log.length = 0;
    const r = await call(env, { op: "capture", token, params: { ...params, sha256: SHA }, hooks });
    assert.deepEqual([r.json.own, log, opCalls(env).length], ["capture", ["capture"], 0]);
  }
});
