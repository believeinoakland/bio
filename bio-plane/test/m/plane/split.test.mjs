/* plane R6 (N512): the Worker's `attest` arm is `attestation`'s `attestOp`, driven through the plane's door hook
   (`door.mjs`' `gatedOp`). The composition of `attestation` and `provenance-routes` is `store-assembly`'s. */
import { test } from "node:test";
import assert from "node:assert/strict";

import { store } from "./fixture.mjs";

const { gatedOp } = await import("../../../src/plane/door.mjs");   /* after the fixture: it reaches `cloudflare:workers` */
const { json } = await import("../../../src/answer-envelope/index.mjs");

test("R6 (N512): the door's `attest` arm is attestation's `attestOp`: a POST only, the evidence store required, a digest that is not 64 hex refused `BAD_SHA` with its status", async () => {
  const stamps = { op: "attest", cls: "admin", viaSession: false, storeName: "bio" };
  const env = (captures) => ({ STORE: { idFromName: (n) => n, get: () => ({ fetch: async () => json({ ok: true, result: null }) }) },
                               ...(captures ? { CAPTURES: captures } : {}) });
  const bucket = { put: async () => {}, head: async () => null, get: async () => null };
  const url = new URL("http://plane/attest");
  const get = await gatedOp({ ...stamps, req: new Request(url), url, env: env(bucket) });
  assert.equal(get.status, 405);
  const none = await gatedOp({ ...stamps, req: new Request(url, { method: "POST", body: "{}" }), url, env: env(null) });
  assert.notEqual(none.status, 200, "no evidence storage, no attestation");
  const bad = await gatedOp({ ...stamps, req: new Request(url, { method: "POST", body: JSON.stringify({ sha256: "nope" }) }), url, env: env(bucket) });
  assert.equal(bad.status, 400);
  const body = await bad.json();
  assert.equal(body.reason, "BAD_SHA");
  assert.equal(body.store, "bio");
  assert.equal(body.tokenClass, "admin");
});
