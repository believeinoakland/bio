/* doc-clean's published fixtures (fix round 10, K4990, K4993, K5044): each answer another module's test takes is made
 * by this module's real code when the test runs, and the test checks that real answer (R3). */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { encryptedRefusal } from "./fixtures.mjs";

test("R3 ENCRYPTED: the encryptedRefusal fixture is doc-clean's real answer for an encrypted PDF, a refusal by code with nothing copied", async () => {
  const r = await encryptedRefusal();
  assert.deepEqual(Object.keys(r).sort(), ["code", "detail", "ok"], "nothing answered but the refusal");
  assert.equal(r.ok, false);
  assert.equal(r.code, "ENCRYPTED");
  assert.match(r.detail, /security handler/);
});

test("R3 ENCRYPTED: encryptedRefusal is made at call time, so each call answers afresh and equally", async () => {
  const a = await encryptedRefusal(), b = await encryptedRefusal();
  assert.notEqual(a, b);
  assert.deepEqual(a, b);
});
