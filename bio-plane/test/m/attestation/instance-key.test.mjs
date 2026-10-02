/* attestation: the instance key of R4 signing statements for later modules (R5; DEC-111, for network-notices R13,
   R21): `instanceStatement`, `instanceSign`, `instanceKeys`; and whether a key is bound, asked without signing (R6;
   N504, for network-notices R1): `instanceKeyBound`. Each at the module's interface. Moved from
   `test/m/provenance/instance-key.test.mjs` with N512 (its R56, R57), assertions unchanged. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, createPublicKey, verify } from "node:crypto";
import { world, sha, pkcs8 } from "./fixture.mjs";
import { instanceStatement } from "../../../src/attestation/index.mjs";
import { PROVENANCE_ACT_CHECKS } from "../../../src/provenance/index.mjs";

/* Verifies a signature with node's own Ed25519 over the raw public key, independently of the module. */
function verifies(publicKeyB64, statement, signatureB64) {
  const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(publicKeyB64, "base64")]);
  return verify(null, Buffer.from(statement, "utf8"), createPublicKey({ key: spki, format: "der", type: "spki" }),
                Buffer.from(signatureB64, "base64"));
}

test("R5: instanceStatement returns exactly `${kind}\\nsha256: ${sha}\\n`, and throws on the receipt's kind or a malformed kind", () => {
  const s = sha("an attestation");
  const w = world();
  for (const kind of ["civicos-working-on-attestation/1", "a/0", "x9-y/12"]) {
    assert.equal(instanceStatement(kind, s), `${kind}\nsha256: ${s}\n`);
    assert.equal(w.att.instanceStatement(kind, s), `${kind}\nsha256: ${s}\n`);
  }
  /* Negative controls: the receipt's own kind, so no statement can be read as a receipt; and every malformed kind. */
  for (const kind of ["bio-receipt/1", "", "civicos", "Civicos/1", "9a/1", "-a/1", "a/", "a/1x", "a b/1", "a/1\nsha256: x",
                      "a_b/1", " a/1", null, undefined, 7, {}])
    for (const call of [() => instanceStatement(kind, s), () => w.att.instanceStatement(kind, s)])
      assert.throws(call, Error, JSON.stringify(kind));
});

test("R5: instanceSign signs with R4's key and records it in receipt_keys; RECEIPT_NO_KEY with no key bound", async () => {
  const k = pkcs8();
  const w = world({ signingKey: k, now: "2026-10-02T07:00:00.000Z" });
  const st = instanceStatement("civicos-working-on-attestation/1", sha("attestation one"));
  const r = await w.att.instanceSign(st);
  assert.deepEqual(Object.keys(r).sort(), ["key_id", "ok", "public_key", "signature"]);
  assert.equal(r.ok, true);
  assert.equal(verifies(r.public_key, st, r.signature), true, "the signature verifies over the statement");
  assert.equal(verifies(r.public_key, st.replace("attestation/1", "attestation/2"), r.signature), false, "and over nothing else");
  assert.equal(r.key_id, sha(Buffer.from(r.public_key, "base64")), "key_id names the public key");
  /* R4's key: a receipt signed by the same instance names the same key. */
  const rc = await w.att.signReceipt({ captureSha: sha("archived"), retrievalLocator: "https://web.archive.org/x",
                                        retrieved: "2026-10-02T06:00:00Z" });
  assert.equal(rc.key_id, r.key_id);
  assert.deepEqual(w.rows(`SELECT key_id, public_key, first_used FROM receipt_keys`),
                   [{ key_id: r.key_id, public_key: r.public_key, first_used: "2026-10-02T07:00:00.000Z" }]);
  assert.equal(w.count("signed_receipts"), 1, "an instance statement is not kept as a receipt");
  /* Negative control: no key bound — RECEIPT_NO_KEY, catalogue row and all, and nothing recorded. */
  const w0 = world();
  const none = await w0.att.instanceSign(st);
  assert.deepEqual([none.ok, none.reason, none.check, none.translation],
                   [false, "RECEIPT_NO_KEY", "C-103.7", PROVENANCE_ACT_CHECKS.RECEIPT_NO_KEY.translation]);
  assert.equal(w0.count("receipt_keys"), 0);
  /* The door signs only what instanceStatement makes: a receipt's statement, or any other text, is never signed. */
  const receipt = `bio-receipt/1\ninstance: x\nfetched: t\nlocator: l\nsha256: ${sha("x")}\n`;
  for (const bad of [receipt, `bio-receipt/1\nsha256: ${sha("x")}\n`, "Kind/1\nsha256: x\n", `${st}extra`, "", null, 3]) {
    const before = w.snapshot();
    await assert.rejects(() => w.att.instanceSign(bad), Error, JSON.stringify(bad));
    assert.deepEqual(w.snapshot(), before);
  }
});

test("R5: instanceKeys answers every key that has signed anything, each with its first_used, never the private part", async () => {
  const k1 = pkcs8(), k2 = pkcs8();
  const w = world({ signingKey: k1, now: "2026-10-02T07:00:00.000Z" });
  assert.deepEqual(w.att.instanceKeys(), [], "no key has signed anything yet");
  const a = await w.att.instanceSign(instanceStatement("civicos-working-on-attestation/1", sha("a")));
  w.clock.now = "2026-10-03T07:00:00.000Z";
  await w.att.instanceSign(instanceStatement("civicos-working-on-attestation/1", sha("b")));
  /* The operator replaces the key (a new instance over the same storage); the new key signs a receipt (R4). */
  const p2 = w.rekey(k2, "2026-11-01T00:00:00.000Z");
  const b = await p2.signReceipt({ captureSha: sha("c"), retrievalLocator: "https://web.archive.org/c", retrieved: "t" });
  const keys = w.att.instanceKeys();
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

/* Keys that are bound as a secret but cannot be read as an Ed25519 PKCS#8 key: not base64, base64 of nothing like a
   key, a key of another algorithm, and an Ed25519 key cut short. */
const unreadable = () => {
  const ed = Buffer.from(pkcs8(), "base64");
  return ["not base64 at all!", Buffer.from("hello, key").toString("base64"),
          generateKeyPairSync("ec", { namedCurve: "P-256" }).privateKey.export({ type: "pkcs8", format: "der" }).toString("base64"),
          ed.subarray(0, ed.length - 4).toString("base64")];
};

test("R6: instanceKeyBound answers true when a key is bound, and instanceSign then signs", async () => {
  const w = world({ signingKey: pkcs8(), now: "2026-10-02T07:00:00.000Z" });
  const before = w.snapshot();
  const bound = w.att.instanceKeyBound();
  assert.equal(typeof bound?.then, "function", "asynchronous, as reading the key is");
  assert.equal(await bound, true);
  assert.equal(await w.att.instanceKeyBound(), true, "and again, the same");
  /* It signs nothing and writes nothing: every table as it was, receipt_keys empty. */
  assert.deepEqual(w.snapshot(), before);
  assert.equal(w.count("receipt_keys"), 0);
  assert.deepEqual(w.att.instanceKeys(), []);
  /* "so instanceSign would sign": it does. */
  const r = await w.att.instanceSign(instanceStatement("civicos-working-on-attestation/1", sha("bound")));
  assert.equal(r.ok, true);
});

test("R6: instanceKeyBound leaves every key's first_used unchanged, asked before and after the key's first statement", async () => {
  const w = world({ signingKey: pkcs8(), now: "2026-10-02T07:00:00.000Z" });
  /* Asked first, at an earlier instant: the key's first use is still its first real statement, not this question. */
  assert.equal(await w.att.instanceKeyBound(), true);
  w.clock.now = "2026-10-05T09:00:00.000Z";
  const r = await w.att.instanceSign(instanceStatement("civicos-working-on-attestation/1", sha("first")));
  const keys = [{ key_id: r.key_id, public_key: r.public_key, first_used: "2026-10-05T09:00:00.000Z" }];
  assert.deepEqual(w.att.instanceKeys(), keys);
  /* Asked after, later still: nothing moves. */
  w.clock.now = "2026-11-01T00:00:00.000Z";
  const before = w.snapshot();
  assert.equal(await w.att.instanceKeyBound(), true);
  assert.deepEqual(w.snapshot(), before);
  assert.deepEqual(w.att.instanceKeys(), keys);
});

test("R6: instanceKeyBound answers false when no key is bound, and instanceSign then answers RECEIPT_NO_KEY", async () => {
  for (const signingKey of [null, "", "   "]) {
    const w = world({ signingKey });
    const before = w.snapshot();
    assert.equal(await w.att.instanceKeyBound(), false, JSON.stringify(signingKey));
    assert.deepEqual(w.snapshot(), before);
    const r = await w.att.instanceSign(instanceStatement("civicos-working-on-attestation/1", sha("unbound")));
    assert.deepEqual([r.ok, r.reason], [false, "RECEIPT_NO_KEY"]);
  }
});

test("R6: a key that cannot be read answers false, never throws, writes nothing; instanceSign and signReceipt answer RECEIPT_NO_KEY", async () => {
  for (const signingKey of unreadable()) {
    const w = world({ signingKey });
    const before = w.snapshot();
    let bound;
    await assert.doesNotReject(async () => { bound = await w.att.instanceKeyBound(); }, signingKey.slice(0, 20));
    assert.equal(bound, false, signingKey.slice(0, 20));
    assert.deepEqual(w.snapshot(), before);
    /* Consistent with what instanceSign would do: an unreadable key is no key, refused by name, nothing recorded. */
    const s = await w.att.instanceSign(instanceStatement("civicos-working-on-attestation/1", sha("unreadable")));
    assert.deepEqual([s.ok, s.reason, s.check], [false, "RECEIPT_NO_KEY", "C-103.7"]);
    const rc = await w.att.signReceipt({ captureSha: sha("archived"), retrievalLocator: "https://web.archive.org/x",
                                          retrieved: "2026-10-02T06:00:00Z" });
    assert.deepEqual([rc.ok, rc.reason], [false, "RECEIPT_NO_KEY"]);
    assert.deepEqual(w.snapshot(), before);
  }
});
