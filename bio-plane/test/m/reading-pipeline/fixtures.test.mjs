/* reading-pipeline: the fixtures this module publishes (fixtures.mjs) answer what the module answers, at its interface. A test that uses a
 * published fixture checks the real answer here, so a user's test never stands on a value this module does not give. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeFailedTransient } from "./fixtures.mjs";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";

test("R37 R53 R24: the published fixture storeFailedTransient is a failed reading, transient, no units, from the module's real read", async () => {
  const out = await storeFailedTransient();
  assert.equal(out.reading.found, false);
  assert.equal(out.reading.failure, "transient", "a store that failed is tried again, never the document's own");
  assert.equal(out.text_units, undefined);
  assert.equal(out.counters.failed, 1);
  assert.equal(out.next, null);
  assert.match(out.reading.basis, /evidence store/);
});

test("R37 R53 R24: control: the same capture over a store that answers is read, not failed", async () => {
  const text = "A line of words for the reading to find.\n".repeat(30);
  const b = bucket();
  const d = await hold(b, text);
  const out = await read(doc({ digest: d, bytes: text.length, ct: "text/plain", format: "undetermined", fromText: true }), { evidence: evidenceStore(b), env: {}, storeName: "bio" });
  assert.notEqual(out.reading.failure, "transient");
  assert.ok(out.text_units.length > 0);
});
