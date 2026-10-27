/* attestation's published fixtures (fixtures.mjs): each is the real answer, so each is checked here against the module's
   own requirement, at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { attestationsOfBadSha, noKeyInstanceSign, keylessAttestation } from "./fixtures.mjs";

test("R7: the attestationsOfBadSha fixture is attestationsOf's real refusal for a text that is no digest, with no attestations read", () => {
  const a = attestationsOfBadSha();
  assert.deepEqual([a.ok, a.reason, a.attestations], [false, "BAD_SHA", undefined]);
});

test("R5: the noKeyInstanceSign fixture is instanceSign's real RECEIPT_NO_KEY on the keyless object", async () => {
  const a = await noKeyInstanceSign();
  assert.deepEqual([a.ok, a.reason, a.code], [false, "RECEIPT_NO_KEY", "RECEIPT_NO_KEY"]);
  assert.equal(a.check, "C-103.7");
});

test("R6: the keylessAttestation fixture is an attestation with no key bound, which says so without signing", async () => {
  const att = keylessAttestation();
  assert.equal(await att.instanceKeyBound(), false);
  assert.deepEqual(att.instanceKeys(), []);
});
