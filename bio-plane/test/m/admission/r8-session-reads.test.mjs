/* admission, G119 (fix round 8 of T51; K4814 (4), K4817): R32, one session read per request. A request that passes through
   `admit`, `readerOf` and `doorWindowGate` (whose `liveSessionDigest` reads the session for a public read) reads its
   session once: the store's `session` route is asked one time for the request, whichever of the three gets there
   first. `doorwindow` is kept (a protective limit, K1881), so it is still asked. Driven at this module's interface with
   the door's own call shapes (the one `credential` the door makes per request, handed to each), counting the
   store's calls by route. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { A, world, makeEnv, doAnswer, requestOf, urlOf, hex64, member } from "./harness.mjs";

const reads = (env) => env.calls.filter((c) => c.route === "session");

/* The door's frame for one request: one `credential` (presentedCredential's answer), handed to every gate. */
function frame(_op, token, { method = "GET", background } = {}) {
  const { url, req, body } = requestOf({ token, method });
  if (background) url.searchParams.set("background", "1");
  const credential = A.presentedCredential({ req, url, body });
  return { url, req, body, credential };
}

test("R32: a public read presenting a live session reads that session once through the window and the reader", async () => {
  const { env, S } = world();
  const f = frame("groupidentity", S.ann);
  const spec = (await import("../../../src/op-declarations/index.mjs")).OPS.groupidentity;
  assert.equal(spec.classes, null);
  const windowed = await A.doorWindowGate({ req: f.req, env, spec, doAnswer, credential: f.credential, background: null });
  assert.equal(windowed.refusal, undefined);
  const reader = await A.readerOf(f.url, env, "bio", undefined, doAnswer, f.credential,
                                  { background: f.url.searchParams.get("background") === "1" });
  assert.deepEqual(reader, { viewer: "member:ann", cls: "member" });
  assert.equal(reads(env).length, 1, "the session is read once for the request (red before G119: two)");
  assert.equal(env.calls.filter((c) => c.route === "doorwindow").length, 1, "doorwindow is still asked (K1881)");
});

test("R32: a gated op reads its session once through the reader and the admission", async () => {
  const { env, S } = world();
  const f = frame("index", S.ann);
  const spec = (await import("../../../src/op-declarations/index.mjs")).OPS.index;
  const reader = await A.readerOf(f.url, env, "bio", undefined, doAnswer, f.credential);
  assert.equal(reader.viewer, "member:ann");
  const a = await A.admit({ url: f.url, env, op: "index", spec, method: "GET", presented: { cred: null }, doAnswer,
                            credential: f.credential, body: f.body });
  assert.equal(a.caller.viewer, "member:ann");
  assert.equal(reads(env).length, 1, "the session is read once for the request (red before G119: two)");
});

test("R32: the window, the reader and the admission together read the session once", async () => {
  const { env, S } = world();
  const f = frame("index", S.ann);
  const O = await import("../../../src/op-declarations/index.mjs");
  await A.doorWindowGate({ req: f.req, env, spec: { ...O.OPS.index, classes: null, mutating: false }, doAnswer, credential: f.credential });
  await A.readerOf(f.url, env, "bio", undefined, doAnswer, f.credential);
  await A.admit({ url: f.url, env, op: "index", spec: O.OPS.index, method: "GET", presented: { cred: null }, doAnswer,
                  credential: f.credential, body: f.body });
  assert.equal(reads(env).length, 1, "red before G119: three");
});

test("R32: the memo is for that request only: a second request, with its own credential, reads again", async () => {
  const { env, S } = world();
  for (let i = 1; i <= 3; i++) {
    const f = frame("index", S.ann);
    await A.readerOf(f.url, env, "bio", undefined, doAnswer, f.credential);
    await A.readerOf(f.url, env, "bio", undefined, doAnswer, f.credential);
    assert.equal(reads(env).length, i, `request ${i}: one read for that request`);
  }
});

test("R32 (control): a background request and a foreground one are different reads, and neither is merged into the other", async () => {
  const { env, S } = world();
  const f = frame("index", S.ann);
  await A.readerOf(f.url, env, "bio", undefined, doAnswer, f.credential, { background: true });
  await A.readerOf(f.url, env, "bio", undefined, doAnswer, f.credential, { background: true });
  assert.equal(reads(env).length, 1);
  assert.equal(reads(env)[0].params.background, "1", "a background read stays no activity");
  await A.readerOf(f.url, env, "bio", undefined, doAnswer, f.credential, { background: false });
  assert.equal(reads(env).length, 2, "the foreground read is its own");
  assert.equal(reads(env)[1].params.background, undefined);
});

test("R32 (control): a session the store does not know is read once and answered as no one both times", async () => {
  const { env } = world();
  const stranger = hex64();
  const f = frame("index", stranger);
  assert.deepEqual(await A.readerOf(f.url, env, "bio", undefined, doAnswer, f.credential), { viewer: "" });
  assert.deepEqual(await A.readerOf(f.url, env, "bio", undefined, doAnswer, f.credential), { viewer: "" });
  assert.equal(reads(env).length, 1);
});

test("R32 (control): a store that does not answer the session read is one silence, named by the same correlation, to each gate", async () => {
  const silentEnv = makeEnv({ answer: async (call) => call.route === "session"
    ? new Response(JSON.stringify({ ok: false, correlation: "11111111-2222-3333-4444-555555555555" })) : null });
  const f = frame("index", hex64());
  const first = await A.readerOf(f.url, silentEnv, "bio", undefined, doAnswer, f.credential);
  const second = await A.readerOf(f.url, silentEnv, "bio", undefined, doAnswer, f.credential);
  assert.equal(first.silent.op, "session");
  assert.deepEqual(second, first);
  assert.equal(reads(silentEnv).length, 1);
});

test("R32 (control): a credential presented to the gates alone, with no door's object, is read each time (nothing to key a request on)", async () => {
  const { env, S } = world();
  const url = urlOf();
  await A.readerOf(url, env, "bio", undefined, doAnswer, A.presentedCredential({ body: { token: S.ann } }));
  await A.readerOf(url, env, "bio", undefined, doAnswer, A.presentedCredential({ body: { token: S.ann } }));
  assert.equal(reads(env).length, 2);
});

test("R32 (control): other credentials of the same request are not merged: a different session token is its own read", async () => {
  const { env, S } = world();
  const f = frame("index", S.ann);
  const other = A.presentedCredential({ body: { token: S.founder } });
  assert.equal((await A.readerOf(f.url, env, "bio", undefined, doAnswer, f.credential)).viewer, "member:ann");
  assert.equal((await A.readerOf(f.url, env, "bio", undefined, doAnswer, other)).viewer, "admin");
  assert.equal(reads(env).length, 2);
});

test("R32 (control): the locked and ended state of a session are as one read gives them to every gate", async () => {
  const locked = hex64();
  const { env } = world({ sessions: { [locked]: { ...member("lia", ["contribute"]), locked: true } } });
  const f = frame("index", locked);
  assert.deepEqual(await A.readerOf(f.url, env, "bio", undefined, doAnswer, f.credential), { viewer: "" });
  const g = await A.doorWindowGate({ req: f.req, env, spec: { classes: null, mutating: false }, doAnswer, credential: f.credential });
  assert.equal(g.refusal, undefined);
  assert.equal(reads(env).length, 1);
  const doorwindow = env.calls.find((c) => c.route === "doorwindow");
  assert.equal(doorwindow.body.session, undefined, "a locked session is counted by source, as before");
});
