/* The fixtures this module publishes (K4990, K4993): each is called here and its real answer checked, so a user's test that
   takes it can rely on it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { expertiseWithdrawn, listenerRefusals } from "./fixtures.mjs";

test("R79 fixture expertiseWithdrawn: the real withdrawal of a confirmed expertise is ok, state withdrawn, with the reason and the administrator who withdrew it", async () => {
  const r = await expertiseWithdrawn();
  assert.equal(r.ok, true);
  assert.equal(r.memberId, "ann");
  assert.equal(r.label, "CPA");
  assert.equal(r.state, "withdrawn");
  assert.equal(r.confirmed, false);
  assert.equal(r.by, "admin");
  assert.equal(r.reason, "licence lapsed");
});

test("R81 fixture listenerRefusals: the first registration is ok; a second is LISTENER_DECLARED naming the holder, and a non-function is LISTENER_MALFORMED; each whole, with its check and translation", () => {
  const r = listenerRefusals();
  assert.deepEqual(r.registered, { ok: true, module: "credentials" });
  assert.equal(r.declared.ok, false);
  assert.equal(r.declared.reason, "LISTENER_DECLARED");
  assert.equal(r.declared.code, "LISTENER_DECLARED");
  assert.equal(r.declared.module, "credentials");
  assert.equal(typeof r.declared.check, "string");
  assert.equal(typeof r.declared.translation, "string");
  assert.equal(r.malformed.ok, false);
  assert.equal(r.malformed.reason, "LISTENER_MALFORMED");
  assert.equal(r.malformed.code, "LISTENER_MALFORMED");
  assert.equal(typeof r.malformed.check, "string");
  assert.equal(typeof r.malformed.translation, "string");
});
