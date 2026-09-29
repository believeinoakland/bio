/* control-plane: the Worker entry's routing and namespaces (R1–R6). Driven through `makeFetch(hooks)` with a fake env. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, O, world, call, opCalls, defaultHooks, refused } from "./harness.mjs";
import { SIGN_HTML } from "../../../src/signpage.mjs";

const { OPS } = O;
const PUBLIC = Object.keys(OPS).filter((k) => OPS[k].classes === null);


test("routing: OPTIONS answers 204 with access-control-allow-origin *, /version answers VERSION or 0.0.0 as plain text, /sign answers the signing page", async () => {
  const { env } = world();
  const o = await call(env, { method: "OPTIONS", path: "/api", op: "index" });
  assert.equal(o.status, 204);
  assert.equal(o.headers.get("access-control-allow-origin"), "*");
  assert.equal(o.text, "");
  for (const p of ["/version", "/version/"]) {
    const v = await call(env, { path: p });
    assert.equal(v.status, 200);
    assert.match(v.headers.get("content-type"), /^text\/plain/);
    assert.equal(v.text.trim(), "9.8.7");
  }
  const unset = world({ omit: ["VERSION"] });
  assert.equal((await call(unset.env, { path: "/version" })).text.trim(), "0.0.0");
  for (const p of ["/sign", "/sign/"]) {
    const s = await call(env, { path: p });
    assert.equal(s.status, 200);
    assert.match(s.headers.get("content-type"), /^text\/html/);
    assert.equal(s.text, SIGN_HTML);
  }
  /* none of the three asks the store anything */
  assert.equal(env.calls.length, 0);
});

test("R1: GET / with no op answers instance-setup's page, built from its public read of the namespace addressed (store=scratch reads scratch, anything else bio, R6's gate first), served cache-control: no-store", async () => {
  for (const [params, ns] of [[{}, "bio"], [{ store: "bio" }, "bio"], [{ store: "scratch" }, "scratch"]]) {
    const { env } = world({ group: { ok: true, group: "grp-rivertown" } });
    const log = [];
    const r = await call(env, { path: "/", params, hooks: defaultHooks(log) });
    assert.equal(r.status, 200);
    assert.match(r.headers.get("content-type"), /^text\/html/);
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.match(r.text, /^<!doctype html>/i);
    assert.ok(r.text.includes("grp-rivertown"), "the page names the group its record records");
    assert.deepEqual(log, [{ kind: "group", ns, projection: "groupidentitypublic" }]);
    assert.deepEqual(env.calls.map((c) => [c.ns, c.route]), [[ns, "groupidentitypublic"]]);
  }
  /* a record that did not answer is stated as such, never as a name */
  const silent = world({ answer: (c) => (c.route === "groupidentitypublic" ? new Response("x") : null), group: { ok: true, group: "grp-rivertown" } });
  const s = await call(silent.env, { path: "/" });
  assert.equal(s.status, 200);
  assert.equal(s.text.includes("grp-rivertown"), false);
  /* R3 applies first: nothing is read */
  const { env } = world();
  refused(await call(env, { path: "/", params: { store: "elsewhere" } }), 400, "NAMESPACE_UNKNOWN", "C-78.1");
  assert.equal(env.calls.length, 0);
  /* an op parameter is not the page */
  assert.equal((await call(env, { path: "/", params: { op: "index", token: env.ADMIN_TOKEN } })).json.store, "bio");
});

test("R2: the op is `op`, else the path after /api/ (or /), else selftest; an op with no spec is refused 400 UNKNOWN_OP (C-69.1) with error \"unknown op\" first after ok", async () => {
  const { env } = world();
  const t = env.ADMIN_TOKEN;
  const route = async (req) => { env.calls.length = 0; const r = await call(env, { token: t, ...req }); return [r.status, opCalls(env).map((c) => c.route)]; };
  assert.deepEqual(await route({ op: "index", path: "/api/list" }), [200, ["index"]]);
  assert.deepEqual(await route({ path: "/api/list" }), [200, ["list"]]);
  assert.deepEqual(await route({ path: "/list" }), [200, ["list"]]);
  assert.deepEqual(await route({ path: "/api" }), [200, ["selftest"]]);
  assert.deepEqual(await route({ path: "/api/" }), [200, ["selftest"]]);
  assert.deepEqual(await route({ path: "/", method: "POST", body: {} }), [200, ["selftest"]]);
  for (const bad of ["nosuchop", "INDEX", "index ", "selftest2", "__proto__", "constructor", "toString", "hasOwnProperty"]) {
    env.calls.length = 0;
    assert.equal((await call(env, { op: bad, token: t })).json.op, bad);
    for (const r of [await call(env, { op: bad, token: t }), await call(env, { op: bad }),
                     await call(env, { path: `/api/${encodeURIComponent(bad)}` })]) {
      refused(r, 400, "UNKNOWN_OP", "C-69.1");
      assert.deepEqual(Object.keys(r.json).slice(0, 2), ["ok", "error"]);
      assert.equal(r.json.error, "unknown op");
    }
    assert.equal(env.calls.length, 0, "nothing is read for an unknown op");
  }
  /* negative control: a declared op is admitted */
  assert.equal((await call(env, { op: "index", token: t })).status, 200);
});

test("R2: an op with a spec is answered by the handler its module provides (the hooks), or else forwarded to the store's route of that name", async () => {
  const { env } = world();
  const log = [];
  const hooks = {
    publicOp: async (c) => { log.push(["public", c.op]); return M.json({ ok: true, by: "publicOp", op: c.op }); },
    gatedOp: async (c) => { log.push(["gated", c.op]); return c.op === "links" ? M.json({ ok: true, by: "gatedOp" }) : undefined; },
  };
  const served = await call(env, { op: "links", token: env.ADMIN_TOKEN, hooks });
  assert.equal(served.json.by, "gatedOp");
  assert.equal(opCalls(env).length, 0, "a hook-served op is not forwarded");
  const fwd = await call(env, { op: "index", token: env.ADMIN_TOKEN, hooks });
  assert.equal(fwd.json.result.echo, "index");
  assert.deepEqual(opCalls(env).map((c) => c.route), ["index"]);
  const pub = await call(env, { op: "knock", hooks, method: "POST", body: {} });
  assert.equal(pub.json.by, "publicOp");
  assert.deepEqual(log, [["gated", "links"], ["gated", "index"], ["public", "knock"]]);
});

test("R3: a store= present and not exactly bio or scratch is refused 400 NAMESPACE_UNKNOWN (C-78.1), naming the namespaces, for every caller and for the / page; nothing is read", async () => {
  const { env, S, A } = world();
  const callers = [undefined, env.ADMIN_TOKEN, env.PROBE_TOKEN, env.DAEMON_TOKEN, S.ann, S.founder, A.ann, A.confined, "junk"];
  for (const asked of ["biosmoke-pdf", "Scratch", "BIO", "", " scratch", "scratch\n"]) {
    for (const token of callers) for (const op of ["index", "knock", "invitelook", "whoami"]) {
      env.calls.length = 0;
      const r = await call(env, { op, token, params: { store: asked } });
      refused(r, 400, "NAMESPACE_UNKNOWN", "C-78.1");
      assert.deepEqual(r.json.namespaces, ["bio", "scratch"]);
      assert.equal(r.json.asked, asked.slice(0, 80));
      assert.equal(env.calls.length, 0, "no credential is resolved and nothing is read");
    }
    env.calls.length = 0;
    refused(await call(env, { path: "/", params: { store: asked } }), 400, "NAMESPACE_UNKNOWN", "C-78.1");
    assert.equal(env.calls.length, 0);
  }
  /* negative control: the same requests naming a namespace that exists are admitted */
  for (const asked of ["bio", "scratch"]) {
    assert.equal((await call(env, { op: "index", token: env.ADMIN_TOKEN, params: { store: asked } })).json.store, asked);
    assert.equal((await call(env, { op: "invitelook", params: { store: asked }, method: "POST", body: {} })).status, 200);
  }
});

test("R4: an ai credential minted confined to scratch is refused 403 NAMESPACE_CONFINED (C-78.3) for a named store= other than scratch, and an absent one is set to scratch", async () => {
  const { env, A } = world();
  for (const asked of ["bio"]) for (const op of ["index", "whoami", "invitelook", "knock"]) {
    env.calls.length = 0;
    const r = await call(env, { op, token: A.confined, params: { store: asked } });
    refused(r, 403, "NAMESPACE_CONFINED", "C-78.3");
    assert.equal(r.json.confinedTo, "scratch");
    assert.equal(r.json.tokenId, "agent-sandbox");
    assert.deepEqual(env.calls.map((c) => c.route), ["aicredentiallook"], "only the credential's own row was read");
  }
  /* absent: set to scratch — the gated forward lands in scratch and says so */
  env.calls.length = 0;
  const idx = await call(env, { op: "index", token: A.confined });
  assert.equal(idx.status, 200);
  assert.equal(idx.json.store, "scratch");
  assert.deepEqual(opCalls(env).map((c) => c.ns), ["scratch"]);
  assert.equal((await call(env, { op: "whoami", token: A.confined })).json.store, "scratch");
  /* a public op that reads store= itself reads scratch too */
  let seen = null;
  const hooks = { publicOp: async (c) => { seen = c.url.searchParams.get("store"); return M.json({ ok: true }); }, gatedOp: async () => undefined };
  await call(env, { op: "invitelook", token: A.confined, hooks, method: "POST", body: {} });
  assert.equal(seen, "scratch");
  /* negative controls: store=scratch named is admitted; an unconfined credential naming bio is admitted in bio */
  assert.equal((await call(env, { op: "index", token: A.confined, params: { store: "scratch" } })).json.store, "scratch");
  assert.equal((await call(env, { op: "index", token: A.ann, params: { store: "bio" } })).json.store, "bio");
  assert.equal((await call(env, { op: "index", token: A.ann })).json.store, "bio");
});

test("R5: a public op that answers only from bio refuses store=scratch 400 NAMESPACE_PINNED (C-78.2); the declared scratch-addressing public ops are exactly invitelook, enroll, instancegroup and groupidentity", async () => {
  assert.deepEqual([...M.SCRATCH_ADDRESSING_PUBLIC_OPS].sort(), ["enroll", "groupidentity", "instancegroup", "invitelook"]);
  const { env } = world();
  const log = [];
  const hooks = defaultHooks(log);
  for (const op of PUBLIC) {
    env.calls.length = 0; log.length = 0;
    const r = await call(env, { op, params: { store: "scratch" }, hooks, method: "POST", body: {} });
    if (M.SCRATCH_ADDRESSING_PUBLIC_OPS.includes(op)) {
      assert.equal(r.status, 200, op);
      assert.deepEqual(log.map((l) => l.op), [op]);
    } else {
      refused(r, 400, "NAMESPACE_PINNED", "C-78.2");
      assert.equal(r.json.op, op);
      assert.equal(r.json.pinned, "bio");
      assert.equal(env.calls.length + log.length, 0, `${op}: nothing read or run`);
      /* negative control: store=bio (and no store=) is admitted */
      for (const params of [{ store: "bio" }, {}]) {
        const ok = await call(env, { op, params, hooks, method: "POST", body: {} });
        assert.notEqual(ok.json?.reason, "NAMESPACE_PINNED", op);
      }
    }
  }
  /* gated ops are not pinned: they take their namespace from R6 */
  assert.equal((await call(env, { op: "index", token: env.ADMIN_TOKEN, params: { store: "scratch" } })).json.store, "scratch");
});

test("R6: probe lands in scratch (a named other namespace is refused 403 SCOPE_REFUSED, C-38.6); every other class lands in scratch when store=scratch, else bio; every forwarded answer carries store", async () => {
  const { env, S, A } = world();
  const land = async (token, params = {}, op = "index") => {
    env.calls.length = 0;
    const r = await call(env, { op, token, params });
    return [r.status, r.json.store, opCalls(env).map((c) => c.ns).join()];
  };
  assert.deepEqual(await land(env.PROBE_TOKEN), [200, "scratch", "scratch"]);
  assert.deepEqual(await land(env.PROBE_TOKEN, { store: "scratch" }), [200, "scratch", "scratch"]);
  env.calls.length = 0;
  const probeBio = await call(env, { op: "index", token: env.PROBE_TOKEN, params: { store: "bio" } });
  refused(probeBio, 403, "SCOPE_REFUSED", "C-38.6");
  assert.equal(probeBio.json.tokenClass, "probe");
  assert.equal(env.calls.length, 0);
  for (const token of [env.ADMIN_TOKEN, env.MEMBER_TOKEN, S.ann, S.founder, A.ann]) {
    assert.deepEqual(await land(token), [200, "bio", "bio"]);
    assert.deepEqual(await land(token, { store: "bio" }), [200, "bio", "bio"]);
    assert.deepEqual(await land(token, { store: "scratch" }), [200, "scratch", "scratch"]);
  }
  assert.deepEqual(await land(env.DAEMON_TOKEN, {}, "monitor"), [200, "bio", "bio"]);
  assert.deepEqual(await land(env.DAEMON_TOKEN, { store: "scratch" }, "monitor"), [200, "scratch", "scratch"]);
  /* scopeFor, the function the admission reads */
  const u = (q) => new URL(`https://x/?${q}`);
  assert.deepEqual(M.scopeFor("probe", u("")), { name: "scratch" });
  assert.ok(M.scopeFor("probe", u("store=bio")).error);
  assert.deepEqual(M.scopeFor("member", u("store=scratch")), { name: "scratch" });
  assert.deepEqual(M.scopeFor("admin", u("")), { name: "bio" });
});
