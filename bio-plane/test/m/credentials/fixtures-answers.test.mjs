/* credentials R9 (T51 fix round 10; K4990, K4993, K4995): each answer this module publishes in fixtures.mjs is asserted to be
   the real answer of its code, over the world the fixture builds on each call. A user's test takes these values, so each
   is held here against the module's own registration and refusal. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { signerregisterown, signerregisterownHeld, SIGNER_KEY } from "./fixtures.mjs";

test("R9: the published signerregisterown answer is a member's own key, registered active and self-origin, in the world it wrote", async () => {
  const { w, answer } = await signerregisterown();
  assert.equal(answer.ok, true);
  assert.equal(answer.keyB64, SIGNER_KEY);
  assert.equal(answer.memberId, "ann");
  assert.equal(answer.status, "active");
  assert.equal(answer.origin, "self");
  assert.equal(answer.existed, false);
  assert.deepEqual({ ...w.row("SELECT member_id, status, origin FROM signers WHERE key_b64=?", SIGNER_KEY) },
    { member_id: "ann", status: "active", origin: "self" });
});

test("R9: the published signerregisterownHeld answer refuses a key another member holds, and writes nothing for ann", async () => {
  const { w, first, answer } = await signerregisterownHeld();
  assert.equal(first.ok, true);
  assert.equal(answer.ok, false);
  assert.equal(answer.reason, "SIGNER_KEY_HELD_BY_ANOTHER");
  assert.equal(w.row("SELECT member_id FROM signers WHERE key_b64=?", SIGNER_KEY).member_id, "bob");
});
