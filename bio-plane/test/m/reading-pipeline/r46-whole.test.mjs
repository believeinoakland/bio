/* R46 (fix round 9, G155; K4958): the PASSWORD_REQUIRED / ENCRYPTED statement holds for a whole read as for a range: an encrypted PDF
   read whole (no cursor) ends stated with the code, never with prose from the text layer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { generate } from "../../../test/pdfgen.mjs";
import { fresh, hold, doc, member, evidenceStore } from "./fixture.mjs";
import { read } from "../../../src/reading-pipeline/index.mjs";

const locked = () => member(() => {
  const marker = { page: null, reason: "password_required", font: null, codes: "", count: 0 };
  return { ok: true, tier: 1, text: { document: "", pages: [], undetermined: [marker], counts: { chars: 0, undetermined: 1 } } };
});

async function whole(seed, encryption, env) {
  const f = generate({ kind: "pdf", seed, encryption, size: { pages: 6, lines: 3 } });
  const bytes = await f.bytes();
  const w = fresh({ env });
  const d = await hold(w.evidence, bytes);
  return read(doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" }), { evidence: evidenceStore(w.evidence), env });
}

test("R46 (G155, PDF C14): an AES-128 user-password file read whole ends final, PASSWORD_REQUIRED, with its refusal sentence, never text-layer prose", async () => {
  const out = await whole("C14w", { method: "aes", user: "pw" }, { PDF_WORKER: locked() });
  assert.equal(out.more, undefined, "a whole read has no pieces");
  assert.equal(out.reading.failure, "final");
  assert.equal(out.reading.reason, "PASSWORD_REQUIRED");
  assert.doesNotMatch(String(out.reading.why || ""), /undecodable region|password_required/);
});

test("R46 (G155): an encrypted file tier 2 could not open, read whole, ends final, ENCRYPTED", async () => {
  const out = await whole("C14x", { method: "aes", user: "pw" }, {});
  assert.equal(out.reading.failure, "final");
  assert.equal(out.reading.reason, "ENCRYPTED");
});

test("R46 (G155) control: an unencrypted PDF read whole has no refusal reason", async () => {
  const out = await whole("C14y", undefined, {});
  assert.ok(!out.reading.reason, "no reason on a plain file");
});
