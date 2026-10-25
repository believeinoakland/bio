/* plane R2, R3, R5, R6 (N512): the composition of `attestation` and `provenance-routes`, the two modules split from
   provenance, driven through the plane's interface: construction over a storage, the route map, `op=stats`, the audit
   and the door's hooks. Each module's own behaviour is its own tests'; these check only that the plane builds each
   once, with what the deployment hands it, and reaches each through its own map and arm. */
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
