/* provenance: the instance key of R34 signing statements for later modules (R56; DEC-111, for network-notices R13,
   R21): `instanceStatement`, `instanceSign`, `instanceKeys`, each at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, createPublicKey, verify } from "node:crypto";
import { world, sha } from "./fixture.mjs";
import { instanceStatement, PROVENANCE_ACT_CHECKS } from "../../../src/provenance/index.mjs";

const pkcs8 = () => generateKeyPairSync("ed25519").privateKey.export({ type: "pkcs8", format: "der" }).toString("base64");
/* Verifies a signature with node's own Ed25519 over the raw public key, independently of the module. */
function verifies(publicKeyB64, statement, signatureB64) {
  const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(publicKeyB64, "base64")]);
  return verify(null, Buffer.from(statement, "utf8"), createPublicKey({ key: spki, format: "der", type: "spki" }),
                Buffer.from(signatureB64, "base64"));
}

test("R56: instanceStatement returns exactly `${kind}\\nsha256: ${sha}\\n`, and throws on the receipt's kind or a malformed kind", () => {
  const s = sha("an attestation");
  const w = world();
  for (const kind of ["civicos-working-on-attestation/1", "a/0", "x9-y/12"]) {
    assert.equal(instanceStatement(kind, s), `${kind}\nsha256: ${s}\n`);
    assert.equal(w.prov.instanceStatement(kind, s), `${kind}\nsha256: ${s}\n`);
  }
  /* Negative controls: the receipt's own kind, so no statement can be read as a receipt; and every malformed kind. */
  for (const kind of ["bio-receipt/1", "", "civicos", "Civicos/1", "9a/1", "-a/1", "a/", "a/1x", "a b/1", "a/1\nsha256: x",
                      "a_b/1", " a/1", null, undefined, 7, {}])
    for (const call of [() => instanceStatement(kind, s), () => w.prov.instanceStatement(kind, s)])
      assert.throws(call, Error, JSON.stringify(kind));
});

test("R56: instanceSign signs with R34's key and records it in receipt_keys; RECEIPT_NO_KEY with no key bound", async () => {
  const k = pkcs8();
  const w = world({ signingKey: k, now: "2026-10-02T07:00:00.000Z" });
  const st = instanceStatement("civicos-working-on-attestation/1", sha("attestation one"));
  const r = await w.prov.instanceSign(st);
  assert.deepEqual(Object.keys(r).sort(), ["key_id", "ok", "public_key", "signature"]);
  assert.equal(r.ok, true);
  assert.equal(verifies(r.public_key, st, r.signature), true, "the signature verifies over the statement");
  assert.equal(verifies(r.public_key, st.replace("attestation/1", "attestation/2"), r.signature), false, "and over nothing else");
  assert.equal(r.key_id, sha(Buffer.from(r.public_key, "base64")), "key_id names the public key");
  /* R34's key: a receipt signed by the same instance names the same key. */
  const rc = await w.prov.signReceipt({ captureSha: sha("archived"), retrievalLocator: "https://web.archive.org/x",
                                        retrieved: "2026-10-02T06:00:00Z" });
  assert.equal(rc.key_id, r.key_id);
  assert.deepEqual(w.rows(`SELECT key_id, public_key, first_used FROM receipt_keys`),
                   [{ key_id: r.key_id, public_key: r.public_key, first_used: "2026-10-02T07:00:00.000Z" }]);
  assert.equal(w.count("signed_receipts"), 1, "an instance statement is not kept as a receipt");
  /* Negative control: no key bound — RECEIPT_NO_KEY, catalogue row and all, and nothing recorded. */
  const w0 = world();
  const none = await w0.prov.instanceSign(st);
  assert.deepEqual([none.ok, none.reason, none.check, none.translation],
                   [false, "RECEIPT_NO_KEY", "C-103.7", PROVENANCE_ACT_CHECKS.RECEIPT_NO_KEY.translation]);
  assert.equal(w0.count("receipt_keys"), 0);
  /* The door signs only what instanceStatement makes: a receipt's statement, or any other text, is never signed. */
  const receipt = `bio-receipt/1\ninstance: x\nfetched: t\nlocator: l\nsha256: ${sha("x")}\n`;
  for (const bad of [receipt, `bio-receipt/1\nsha256: ${sha("x")}\n`, "Kind/1\nsha256: x\n", `${st}extra`, "", null, 3]) {
    const before = w.snapshot();
    await assert.rejects(() => w.prov.instanceSign(bad), Error, JSON.stringify(bad));
    assert.deepEqual(w.snapshot(), before);
  }
});

test("R56: instanceKeys answers every key that has signed anything, each with its first_used, never the private part", async () => {
  const k1 = pkcs8(), k2 = pkcs8();
  const w = world({ signingKey: k1, now: "2026-10-02T07:00:00.000Z" });
  assert.deepEqual(w.prov.instanceKeys(), [], "no key has signed anything yet");
  const a = await w.prov.instanceSign(instanceStatement("civicos-working-on-attestation/1", sha("a")));
  w.clock.now = "2026-10-03T07:00:00.000Z";
  await w.prov.instanceSign(instanceStatement("civicos-working-on-attestation/1", sha("b")));
  /* The operator replaces the key (a new instance over the same storage); the new key signs a receipt (R34). */
  const { provenanceOf } = await import("../../../src/provenance/index.mjs");
  const p2 = provenanceOf({ storage: w.st }, { record: w.record, membership: w.membership,
    promotion: { registerStep: () => ({ ok: true }) }, signingKey: k2, now: () => "2026-11-01T00:00:00.000Z" });
  const b = await p2.signReceipt({ captureSha: sha("c"), retrievalLocator: "https://web.archive.org/c", retrieved: "t" });
  const keys = w.prov.instanceKeys();
  assert.deepEqual(keys, [
    { key_id: a.key_id, public_key: a.public_key, first_used: "2026-10-02T07:00:00.000Z" },
    { key_id: b.key_id, public_key: b.public_key, first_used: "2026-11-01T00:00:00.000Z" },
  ]);
  assert.deepEqual(p2.instanceKeys(), keys);
  /* Negative control: neither private key appears anywhere in the answer. */
  const text = JSON.stringify(keys);
  for (const k of [k1, k2]) {
    assert.equal(text.includes(k), false);
    assert.equal(text.includes(Buffer.from(k, "base64").subarray(-32).toString("base64").slice(0, 40)), false);
  }
  for (const key of keys) assert.deepEqual(Object.keys(key).sort(), ["first_used", "key_id", "public_key"]);
});
