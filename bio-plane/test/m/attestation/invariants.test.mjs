/* attestation: no place named in the module's behaviour or outward text (R9), and the two tables it owns, with every
   write to them (R10; K1218, K1220). Each at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, evidence, pkcs8 } from "./fixture.mjs";
import { attest, attestOp, instanceStatement, ATTEST_CHECKS, ATTESTATION_MODULE } from "../../../src/attestation/index.mjs";

/* The text an answer carries, for R9's probe: every string in it, at any depth, except key material. A signature and a
   public key are fresh base64 bytes, not text: one like `…+ca/…` would read as the place probe's `ca` about once in a
   few runs (N517, K1234), so their values are left out by name. Keys are probed too, as text the answer carries. */
const KEY_MATERIAL = new Set(["signature", "public_key"]);
function textOf(x, out = []) {
  if (typeof x === "string") out.push(x);
  else if (Array.isArray(x)) for (const v of x) textOf(v, out);
  else if (x && typeof x === "object")
    for (const [k, v] of Object.entries(x)) { out.push(k); if (!KEY_MATERIAL.has(k)) textOf(v, out); }
  return out;
}

test("R9: no place is named in the module's behaviour or outward text", async () => {
  const place = /oakland|alameda|california|\bca\b|berkeley/i;
  const names = (x) => textOf(x).some((t) => place.test(t));
  const w = world({ signingKey: pkcs8() });
  const w0 = world();
  const a = w.cap("a");
  w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
  const texts = [ATTEST_CHECKS];
  texts.push(w.att.attestationsOf(a.sha), w.att.attestationsOf(sha("none")), w.att.attestationsOf("x"));
  const empty = evidence({});
  texts.push(await attest({ sha256: "x" }, {}),
             await attest({ sha256: sha("n") }, { head: async () => null, holds: async () => null }),
             await attest({ sha256: sha("n") }, { head: empty.head, holds: async () => ({ registered: true }) }),
             await attest({ sha256: sha("n") }, { head: empty.head, holds: async () => ({ registered: false }) }),
             await attest({ sha256: a.sha }, { head: async () => ({ size: 1 }), put: empty.put,
                                               fetch: async () => { throw new Error("down"); } }));
  texts.push(await w.att.signReceipt({}), await w0.att.signReceipt({ captureSha: sha("x"), retrievalLocator: "https://e.org", retrieved: "t" }),
             await w.att.signReceipt({ captureSha: sha("x"), retrievalLocator: "https://e.org", retrieved: "t" }),
             await w.att.signedReceipts(sha("x")), w.att.instanceKeys(),
             await w0.att.instanceSign(instanceStatement("a/1", sha("x"))));
  const json = (body, status) => ({ body, status });
  texts.push(await attestOp({ method: "GET" }, {}, null, { json }));
  /* The signed answers do carry key material, so the probe below runs over answers that hold it. */
  assert.ok(texts.some((x) => JSON.stringify(x).includes('"signature"')), "a signed answer is probed");
  for (const x of texts) assert.equal(names(x), false, textOf(x).filter((t) => place.test(t)).join(" | ").slice(0, 200));
  /* Negative controls: the probe sees a place named in a sentence, at any depth and in any field but key material,
     and a signature that happens to hold `+ca/` is not read as one. */
  assert.equal(names({ detail: "an Oakland document" }), true);
  assert.equal(names({ attempts: [{ note: "asked the CA office" }] }), true);
  assert.equal(names([{ ok: false, translation: "in Berkeley" }]), true);
  assert.equal(names({ statement: "bio-receipt/1\ninstance: alameda\n" }), true);
  assert.equal(names({ signature: "Qk9+ca/xYz==", public_key: "ab/CA+cd", detail: "a signed receipt" }), false);
  assert.equal(names({ signature: "Qk9+ca/xYz==", detail: "fetched in California" }), true);
});

test("R10: attestation creates receipt_keys and signed_receipts and declares them to purge as its own", () => {
  const w = world();
  const cols = (t) => w.rows(`PRAGMA table_info(${t})`).map((r) => r.name);
  assert.deepEqual(cols("receipt_keys"), ["key_id", "public_key", "first_used"]);
  assert.deepEqual(cols("signed_receipts"), ["capture_sha", "retrieval_locator", "retrieved", "statement", "signature",
                                             "key_id", "signed_at"]);
  assert.deepEqual(w.att.purgeDeclared, { ok: true }, JSON.stringify(w.att.purgeDeclared));
  /* Once declared, no other module may declare them (record-core R46): the declaration names this module. */
  for (const table of ["receipt_keys", "signed_receipts"]) {
    const other = w.record.declarePurge("some-other-module", [table]);
    assert.deepEqual([other.ok, other.reason, other.declaredBy], [false, "TABLE_DECLARED", ATTESTATION_MODULE], table);
  }
  /* Idempotent at every boot: migrating again keeps the rows. */
  w.st.sql.exec(`INSERT INTO receipt_keys (key_id, public_key, first_used) VALUES ('k', 'p', 't')`);
  w.att.migrate();
  assert.equal(w.count("receipt_keys"), 1);
});

test("R10: purge clears signed_receipts only with the whole store, and never receipt_keys", async () => {
  const w = world({ signingKey: pkcs8() });
  const a = w.cap("a");
  w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
  const r = await w.att.signReceipt({ captureSha: a.sha, retrievalLocator: "https://web.archive.org/a", retrieved: "2026-09-27T00:00:00Z" });
  assert.equal(r.ok, true);
  /* A bundle's purge: signed_receipts is keyed to no bundle, so it stays; receipt_keys is exempt. */
  w.record.purge({ bundleId: "INFO-2026-0001-a" });
  assert.deepEqual([w.count("signed_receipts"), w.count("receipt_keys")], [1, 1]);
  /* The whole store's purge clears the receipts, and keeps every public key a kept receipt elsewhere may name. */
  w.record.purge({});
  assert.deepEqual([w.count("signed_receipts"), w.count("receipt_keys")], [0, 1]);
});

test("R10: attestation's acts write its two tables; provenance's acts and attestation's reads write neither", async () => {
  const w = world({ signingKey: pkcs8() });
  const both = () => JSON.stringify([w.rows(`SELECT * FROM receipt_keys`), w.rows(`SELECT * FROM signed_receipts`)]);
  const none = both();
  /* Provenance's write services, driven over the same record. */
  const a = w.cap("a");
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [a] }).ok, true);
  w.prov.recordReceipt({ addressNorm: "e.org/a", captureSha: a.sha, retrieved: "2026-09-27T00:00:00Z", via: "archive.org" });
  w.prov.testify({ words: "w", observedAt: "2026-09-20", author: "member:ruth" });
  w.prov.declareOrigin({ bundleId: "INFO-2026-0001-a", system: "a system", by: "member:ruth", viewer: "member:ruth" });
  /* Attestation's reads. */
  w.att.attestationsOf(a.sha); w.att.instanceKeys(); await w.att.signedReceipts(a.sha); await w.att.instanceKeyBound();
  assert.equal(both(), none, "nothing but attestation's acts writes them");
  /* Its acts do: the key on the first statement, the receipt on signReceipt. */
  await w.att.instanceSign(instanceStatement("a/1", a.sha));
  assert.deepEqual([w.count("receipt_keys"), w.count("signed_receipts")], [1, 0]);
  await w.att.signReceipt({ captureSha: a.sha, retrievalLocator: "https://web.archive.org/a", retrieved: "2026-09-27T00:00:00Z" });
  assert.deepEqual([w.count("receipt_keys"), w.count("signed_receipts")], [1, 1]);
});
