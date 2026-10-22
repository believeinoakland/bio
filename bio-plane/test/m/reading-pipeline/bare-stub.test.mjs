/* reading-pipeline R39 (fix round 6, G6; K4570): a bare digest stub is no document. `readheld` of a part's digest hands
   `read` `{capture: {sha256}}` (extraction's substitute for a document it cannot find), and a part read alone as a whole
   is "non-textual or too large" with no size, stored `final` against the part. `read` never reads such a stub: it
   answers a refusal, and no reading. Each test names the requirement id it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";

const readOf = (w, document, opts = {}) => read(document, { evidence: evidenceStore(w), env: {}, storeName: "bio", ...opts });

test("R39: a bare stub of a part's digest (no parts, no bytes, no retrieved) answers a refusal and no reading, whatever the store holds under the digest", async () => {
  const b = bucket();
  const part = await hold(b, new Uint8Array(8192).fill(0x25));   /* an 8 KiB part of a larger object: no head, no text */
  const out = await readOf(b, { capture: { sha256: part } });
  assert.equal(out.reading, undefined, "a stub is not read: no reading is composed");
  assert.equal(out.text_units, undefined);
  assert.equal(out.refused.code, "BARE_DIGEST");
  assert.equal(typeof out.refused.why, "string");
  assert.ok(out.refused.why.length > 0);
  assert.deepEqual(b.calls.filter(([op]) => op === "get"), [], "the stub's bytes are never loaded");
});

test("R39: the refusal is the stub's alone: a stub whose digest names no held object is refused the same, and nothing throws", async () => {
  const b = bucket();
  const out = await readOf(b, { capture: { sha256: "ab".repeat(32) } });
  assert.equal(out.refused.code, "BARE_DIGEST");
  assert.equal(out.reading, undefined);
});

test("R39 (control): a document that states anything of its object is read as before: a single-part capture with its size and retrieval, one with only `retrieved`, one with only `bytes`, one with parts", async () => {
  const b = bucket();
  const body = "The council met.\n\nIt adjourned.";
  const d = await hold(b, body);
  const full = await readOf(b, doc({ digest: d, bytes: body.length, ct: "text/plain", format: "undetermined", fromText: true }));
  assert.ok(full.reading && !full.refused, "a full document is read");
  assert.deepEqual(full.text_units.map((u) => u.text), ["The council met.", "It adjourned."]);
  const timed = await readOf(b, { capture: { sha256: d }, retrieved: "2026-10-22T00:00:00Z" });
  assert.ok(timed.reading && !timed.refused, "a stub with a retrieval instant is a document that says something");
  const sized = await readOf(b, { capture: { sha256: d, bytes: body.length } });
  assert.ok(sized.reading && !sized.refused, "a stub with a size is a document that says something");
  const parted = await readOf(b, { capture: { sha256: d }, parts: [{ sha256: d, bytes: body.length }] });
  assert.ok(parted.reading && !parted.refused, "a document with parts is no stub");
});

test("R39 R24 (control): a document that names no digest is still a failed reading, never a refusal", async () => {
  const b = bucket();
  const out = await readOf(b, {});
  assert.equal(out.refused, undefined);
  assert.equal(out.reading.found, false);
  assert.equal(out.reading.failure, "final");
});
