/* plane R2, R3, R5, R6 (N512): the composition of `attestation` and `provenance-routes`, the two modules split from
   provenance, driven through the plane's interface: construction over a storage, the route map, `op=stats`, the audit
   and the door's hooks. Each module's own behaviour is its own tests'; these check only that the plane builds each
   once, with what the deployment hands it, and reaches each through its own map and arm. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { store } from "./fixture.mjs";
import { attestationOf } from "../../../src/attestation/index.mjs";
import { provenanceRoutesOf } from "../../../src/provenance-routes/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { caseAuthoringOf } from "../../../src/case-authoring/index.mjs";
import { filingsOf } from "../../../src/filings/index.mjs";
import { networkNoticesOf } from "../../../src/network-notices/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
const { gatedOp } = await import("../../../src/plane/door.mjs");   /* after the fixture: it reaches `cloudflare:workers` */
const { json } = await import("../../../src/control-plane/index.mjs");

/* An Ed25519 private key as the operator binds `RECEIPT_SIGNING_KEY`: PKCS#8, base64. */
const signingKey = () => generateKeyPairSync("ed25519").privateKey.export({ type: "pkcs8", format: "der" }).toString("base64");
const SHA = "ab".repeat(32);

test("R2 (N512): attestation is built once with the deployment's receipt-signing key and name, and that one instance is the one capture, case-authoring, filings and network-notices are handed", async () => {
  const x = await store({ env: { RECEIPT_SIGNING_KEY: signingKey(), INSTANCE_NAME: "oak-plane" } });
  const a = attestationOf(x.ctx);
  assert.equal(await a.instanceKeyBound(), true, "the key the deployment binds is the instance's");
  for (const [who, held] of [["capture (`cap.attestation`)", captureOf(x.ctx).attestation],
                             ["case-authoring", caseAuthoringOf(x.ctx).attestation],
                             ["filings", filingsOf(x.ctx).attestation],
                             ["network-notices", networkNoticesOf(x.ctx).attestation]])
    assert.equal(held, a, `${who} holds the plane's one attestation instance`);
  /* The acquisition act's receipt, signed through `cap.attestation`, names this instance and verifies. */
  const r = await captureOf(x.ctx).attestation.signReceipt({ captureSha: SHA, retrievalLocator: "https://example.org/a",
                                                            retrieved: "2026-10-02T00:00:00Z" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(r.statement, /oak-plane/);
  assert.deepEqual((await a.signedReceipts(SHA)).map((s) => s.verified), [true]);
  assert.deepEqual(a.instanceKeys().map((k) => k.key_id), [r.key_id]);
});

test("R2 (N512): with no key bound, the instance says so and signs nothing: `instanceKeyBound` false, a receipt `RECEIPT_NO_KEY`", async () => {
  const x = await store();
  const a = attestationOf(x.ctx);
  assert.equal(await a.instanceKeyBound(), false);
  assert.equal(captureOf(x.ctx).attestation, a);
  const r = await a.signReceipt({ captureSha: SHA, retrievalLocator: "https://example.org/a", retrieved: "2026-10-02T00:00:00Z" });
  assert.equal(r.reason, "RECEIPT_NO_KEY");
  assert.deepEqual(a.instanceKeys(), []);
});

test("R2, R3 (N512): before the first request provenance-routes holds its start registrations, its audit finding `route` and its figure `routeMarks`, and both modules' tables are made", async () => {
  const x = await store();
  const names = [...x.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type = 'table'`)].map((r) => r.name);
  for (const t of ["receipt_keys", "signed_receipts", "provenance_route_marks"]) assert.ok(names.includes(t), `table ${t}`);
  /* The figure is in `op=stats`, after provenance's `register` (the modules' order). */
  const stats = await x.call("/stats");
  const keys = Object.keys(stats);
  assert.ok(keys.includes("routeMarks"), JSON.stringify(keys));
  assert.ok(keys.indexOf("register") < keys.indexOf("routeMarks"), "routeMarks follows register");
  /* The audit carries the route finding beside every page. */
  const audit = await x.call("/audit?viewer=token:admin");
  assert.ok(JSON.stringify(audit).includes('"route"'), "the audit answers the `route` finding");
  /* Registered once: a second registration under the same key is refused. */
  assert.notEqual(recordOf(x.ctx).registerAuditFinding("provenance-routes", "route", () => ({})).ok, true);
});

test("R5 (N512): `provenancechain`, `provenanceroute` and `provenanceroutes` are provenance-routes' arms in the route map, each answering what its service answers", async () => {
  const x = await store();
  const q = "?bundleId=X-none&viewer=member:nobody&author=member:nobody&limit=5";
  const map = x.routes("/x" + q);
  const routes = provenanceRoutesOf(x.ctx);
  const same = (a, b) => assert.equal(JSON.stringify(a), JSON.stringify(b));
  same(await map.provenanceroutes(), routes.provenanceRoutesMarked({ after: null, limit: "5", viewer: "member:nobody" }));
  same(await map.provenanceroute(), routes.provenanceRouteAssess({ bundleId: "X-none", viewer: "member:nobody", author: "member:nobody" }));
  same(await map.provenancechain(), routes.provenanceChainRebuild({ bundleId: "X-none", apply: false, viewer: "member:nobody",
                                                                    author: "member:nobody" }));
});

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
