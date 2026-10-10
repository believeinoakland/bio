/* admission: the namespaces, before any credential is judged (R1–R4). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { A, O, world, gate, urlOf, refused } from "./harness.mjs";

const { OPS } = O;
const PUBLIC = Object.keys(OPS).filter((k) => OPS[k].classes === null);

test("R1: a store= present and not exactly bio or scratch is refused 400 NAMESPACE_UNKNOWN (C-78.1), naming the namespaces, for every caller and the page; nothing is read", async () => {
  const { env, S, K } = world();
  const callers = [undefined, env.ADMIN_TOKEN, env.PROBE_TOKEN, env.DAEMON_TOKEN, S.ann, S.founder, K.ann, K.confined, "junk"];
  for (const asked of ["biosmoke-pdf", "Scratch", "BIO", "", " scratch", "scratch\n", "x".repeat(200)]) {
    for (const token of callers) for (const op of ["index", "knock", "invitelook", "whoami"]) {
      env.calls.length = 0;
      const body = refused(await gate(env, { op, token, params: { store: asked } }), 400, "NAMESPACE_UNKNOWN", "C-78.1", [token]);
      assert.deepEqual(body.namespaces, ["bio", "scratch"]);
      assert.equal(body.asked, asked.slice(0, 80));
      assert.equal(env.calls.length, 0, "no credential is resolved and nothing is read");
    }
    /* the instance's page at `/` asks the same gate of its URL */
    refused({ refusal: A.namespaceGate(urlOf({ store: asked })) }, 400, "NAMESPACE_UNKNOWN", "C-78.1");
  }
  assert.deepEqual([...A.NAMESPACES], ["bio", "scratch"]);
  /* negative controls: a namespace that exists, and none named, pass */
  for (const params of [{ store: "bio" }, { store: "scratch" }, {}]) assert.equal(A.namespaceGate(urlOf(params)), null);
});

test("R2: an ai credential minted confined to scratch is refused 403 NAMESPACE_CONFINED (C-78.3) for a named store= other than scratch, and an absent one is set to scratch", async () => {
  const { env, K } = world();
  for (const op of ["index", "whoami", "invitelook", "knock"]) {
    env.calls.length = 0;
    const body = refused(await gate(env, { op, token: K.confined, params: { store: "bio" } }), 403, "NAMESPACE_CONFINED", "C-78.3", [K.confined]);
    assert.deepEqual([body.confinedTo, body.tokenId, body.asked], ["scratch", "agent-sandbox", "bio"]);
    assert.deepEqual(env.calls.map((c) => c.route), ["aicredentiallook"], "only the credential's own row was read");
  }
  /* absent: set to scratch on the URL, so the landing and a public op reading store= both read scratch */
  const idx = await gate(env, { op: "index", token: K.confined });
  assert.equal(idx.caller.storeName, "scratch");
  assert.equal(idx.url.searchParams.get("store"), "scratch");
  const pub = await gate(env, { op: "invitelook", token: K.confined });
  assert.equal(pub.url.searchParams.get("store"), "scratch");
  /* negative controls: scratch named is admitted; an unconfined credential and no credential are untouched */
  assert.equal((await gate(env, { op: "index", token: K.confined, params: { store: "scratch" } })).caller.storeName, "scratch");
  assert.equal((await gate(env, { op: "index", token: K.ann, params: { store: "bio" } })).caller.storeName, "bio");
  for (const c of [null, undefined, { confinedTo: null }, { confinedTo: "bio" }]) {
    const u = urlOf({ store: "bio" });
    assert.equal(A.confinedNamespaceGate(u, c), null);
    assert.equal(u.searchParams.get("store"), "bio");
  }
});

test("R3: a public op that answers only from bio refuses store=scratch 400 NAMESPACE_PINNED (C-78.2); the public ops that address scratch are exactly invitelook, enroll, instancegroup, groupidentity, websiteinvite, joinlinkinvite, groupdescription and (T41) handlecheck; every other public op is pinned", async () => {
  assert.deepEqual([...A.SCRATCH_ADDRESSING_PUBLIC_OPS].sort(),
                   ["enroll", "groupdescription", "groupidentity", "handlecheck", "instancegroup", "invitelook", "joinlinkinvite", "websiteinvite"]);
  for (const op of A.SCRATCH_ADDRESSING_PUBLIC_OPS) assert.equal(OPS[op].classes, null, op);
  const { env } = world();
  for (const op of PUBLIC) {
    env.calls.length = 0;
    const r = await gate(env, { op, params: { store: "scratch" } });
    if (A.SCRATCH_ADDRESSING_PUBLIC_OPS.includes(op)) assert.equal(r.public, true, op);
    else {
      const body = refused(r, 400, "NAMESPACE_PINNED", "C-78.2");
      assert.deepEqual([body.op, body.asked, body.pinned], [op, "scratch", "bio"]);
      assert.equal(env.calls.length, 0, `${op}: nothing read`);
      for (const params of [{ store: "bio" }, {}]) assert.equal((await gate(env, { op, params })).public, true, op);
    }
  }
  /* a gated op is not pinned: it takes its namespace from R4 */
  for (const op of Object.keys(OPS).filter((k) => OPS[k].classes !== null))
    assert.equal(A.pinnedNamespaceGate(urlOf({ store: "scratch" }), op, OPS[op]), null, op);
});

test("R4: probe lands in scratch (a named other namespace is refused 403 SCOPE_REFUSED, C-38.6); every other class lands in scratch when store=scratch is given, else bio", async () => {
  const { env, S, K } = world();
  const land = async (token, params = {}, op = "index") => (await gate(env, { op, token, params, method: "GET" })).caller?.storeName;
  assert.equal(await land(env.PROBE_TOKEN), "scratch");
  assert.equal(await land(env.PROBE_TOKEN, { store: "scratch" }), "scratch");
  env.calls.length = 0;
  const body = refused(await gate(env, { op: "index", token: env.PROBE_TOKEN, params: { store: "bio" }, method: "GET" }),
                       403, "SCOPE_REFUSED", "C-38.6", [env.PROBE_TOKEN]);
  assert.equal(body.tokenClass, "probe");
  assert.equal(env.calls.length, 0);
  for (const token of [env.ADMIN_TOKEN, S.ann, S.founder, K.ann, K.org]) {
    assert.equal(await land(token), "bio");
    assert.equal(await land(token, { store: "bio" }), "bio");
    assert.equal(await land(token, { store: "scratch" }), "scratch");
  }
  assert.equal(await land(env.DAEMON_TOKEN, {}, "monitor"), "bio");
  assert.equal(await land(env.DAEMON_TOKEN, { store: "scratch" }, "monitor"), "scratch");
  /* scopeFor, whole: every class over every store= */
  for (const cls of ["admin", "member", "probe", "daemon", "ai"]) {
    assert.deepEqual(A.scopeFor(cls, urlOf({ store: "scratch" })), { name: "scratch" });
    assert.ok(A.scopeFor(cls, urlOf({ store: "nope" })).error);
    if (cls === "probe") {
      assert.deepEqual(A.scopeFor(cls, urlOf({})), { name: "scratch" });
      assert.ok(A.scopeFor(cls, urlOf({ store: "bio" })).error);
    } else {
      assert.deepEqual(A.scopeFor(cls, urlOf({})), { name: "bio" });
      assert.deepEqual(A.scopeFor(cls, urlOf({ store: "bio" })), { name: "bio" });
    }
  }
});
