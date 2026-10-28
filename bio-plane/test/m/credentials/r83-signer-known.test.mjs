/* credentials R83 (T51 fix round 10; DEC-439 to DEC-441, K5303, A-03): an administrator says they know about a
   self-registered key. `signerKnown({keyB64, viewer})` records `known_by` and `known_at` on the key's row, which R8's
   `signerList` answers; a second call answers `already: true` and writes nothing; every refusal writes nothing. Driven at
   the interface, over the real membership beside it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { CREDENTIALS_CHECKS } from "../../../src/credentials/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const listed = (w, k) => w.c.signerList().signers.find((s) => s.key_b64 === k);
const MACHINE = CREDENTIALS_CHECKS.MACHINE_CANNOT_REGISTER_KEY;
/* Every caller with no member behind it: no stamp, an empty one, every machine credential, the operator's bearer. */
const NOBODY = [null, undefined, "", ...["admin", "member", "probe", "daemon", "ai"].map((c) => `class:${c}`), "token:daemon"];

/* ann and bob active, the founder claimed, `second` an administrator; ann's key self-registered, bob's registered by an
   administrator, ann's other key self-registered and then revoked by her. */
async function knownWorld() {
  const w = await world().group("ann", "bob");
  assert.equal(w.c.signerRegisterOwn({ keyB64: "AAAAannself", by: "ann" }).ok, true);
  assert.equal(w.c.signerAdd({ keyB64: "AAAAbobadmin", memberId: "bob", by: "admin" }).ok, true);
  assert.equal(w.c.signerRegisterOwn({ keyB64: "AAAAannold", by: "ann" }).ok, true);
  assert.equal(w.c.signerRevokeOwn({ keyB64: "AAAAannold", by: "ann" }).ok, true);
  return w;
}

test("R83 an administrator's call records known_by and known_at on a self-registered active key, and R8 reads them; before it both are null", async () => {
  const w = await knownWorld();
  assert.deepEqual([listed(w, "AAAAannself").known_by, listed(w, "AAAAannself").known_at], [null, null]);
  const r = w.c.signerKnown({ keyB64: "AAAAannself", viewer: "member:second" });
  assert.equal(r.ok, true);
  assert.equal(r.already, false);
  assert.equal(r.keyB64, "AAAAannself");
  const row = listed(w, "AAAAannself");
  assert.equal(row.known_by, "second");
  assert.equal(typeof row.known_at, "string");
  assert.equal(Number.isNaN(Date.parse(row.known_at)), false);
  assert.deepEqual([r.known_by, r.known_at], [row.known_by, row.known_at]);
  /* the key is otherwise as it was: still self-registered, active, attesting (R19) */
  assert.deepEqual([row.origin, row.registered_by, row.status, row.attests], ["self", "ann", "active", true]);
  /* no other key is touched */
  assert.deepEqual([listed(w, "AAAAbobadmin").known_by, listed(w, "AAAAannold").known_by], [null, null]);
});

test("R83 the founder is an administrator: a bare id and the member: viewer are the same caller", async () => {
  const w = await knownWorld();
  const r = w.c.signerKnown({ keyB64: "AAAAannself", viewer: "admin" });
  assert.equal(r.ok, true);
  assert.equal(listed(w, "AAAAannself").known_by, "admin");
  const w2 = await knownWorld();
  assert.equal(w2.c.signerKnown({ keyB64: "AAAAannself", viewer: "second" }).ok, true);
  assert.equal(listed(w2, "AAAAannself").known_by, "second");
});

test("R83 a second call answers already: true and writes nothing, whoever makes it; the first knower and instant stay", async () => {
  const w = await knownWorld();
  const first = w.c.signerKnown({ keyB64: "AAAAannself", viewer: "member:second" });
  const before = w.snapshot();
  const again = w.c.signerKnown({ keyB64: "AAAAannself", viewer: "admin" });
  assert.equal(again.ok, true);
  assert.equal(again.already, true);
  assert.deepEqual([again.known_by, again.known_at], [first.known_by, first.known_at]);
  assert.equal(w.snapshot(), before, "a repeat writes nothing");
  assert.equal(w.c.signerKnown({ keyB64: "AAAAannself", viewer: "member:second" }).already, true);
  assert.equal(w.snapshot(), before);
});

test("R83 refusals, each writing nothing: a machine credential or the operator's bearer as R9 refuses one; a member who does not administer (membership's refusal)", async () => {
  const w = await knownWorld();
  const before = w.snapshot();
  for (const viewer of NOBODY)
    for (const key of ["AAAAannself", "AAAAnothing", "not a key", undefined]) {
      const r = w.c.signerKnown({ keyB64: key, viewer });
      const label = `${String(viewer)} ${String(key)}`;
      assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "MACHINE_CANNOT_REGISTER_KEY",
        "MACHINE_CANNOT_REGISTER_KEY", "C-96.17", MACHINE.translation], label);
      assert.equal(typeof r.detail, "string", label);
    }
  for (const viewer of ["bob", "member:bob", "ann", "nobody"]) {
    const r = w.c.signerKnown({ keyB64: "AAAAannself", viewer });
    assert.deepEqual([r.ok, r.reason], [false, "NOT_AN_ADMIN"], viewer);
  }
  assert.equal(w.snapshot(), before, "no refusal writes");
  assert.equal(listed(w, "AAAAannself").known_by, null);
});

test("R83 refusals, each writing nothing: BAD_KEY for a key of no shape, the absent-key answer R8 gives for one not held, SIGNER_NOT_SELF_ACTIVE for a key not self-registered or not active", async () => {
  const w = await knownWorld();
  const before = w.snapshot();
  for (const key of [undefined, null, "", "ssh-ed25519 AAAAx", "BBBBx", "AAAA x", 7]) {
    const r = w.c.signerKnown({ keyB64: key, viewer: "admin" });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "BAD_KEY", "C-96.8"], String(key));
  }
  assert.deepEqual(w.c.signerKnown({ keyB64: "AAAAnotheld", viewer: "admin" }), { ok: false, reason: "NO_SUCH_KEY" });
  /* control: an administrator's own registration, and a revoked self-registered key */
  for (const key of ["AAAAbobadmin", "AAAAannold"]) {
    const r = w.c.signerKnown({ keyB64: key, viewer: "admin" });
    assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "SIGNER_NOT_SELF_ACTIVE", "SIGNER_NOT_SELF_ACTIVE", "C-96.55"], key);
    assert.equal(typeof r.translation, "string");
    assert.equal(typeof r.detail, "string");
    assert.equal(r.detail, word("credentials.index.only_a_key_a_member"));
  }
  /* a self-registered key whose administrator re-registered it (origin admin), and one revoked by an administrator */
  assert.equal(w.c.signerRegisterOwn({ keyB64: "AAAAanntwo", by: "ann" }).ok, true);
  assert.equal(w.c.signerSet({ keyB64: "AAAAanntwo", status: "revoked", by: "admin" }).ok, true);
  assert.equal(w.c.signerKnown({ keyB64: "AAAAanntwo", viewer: "admin" }).reason, "SIGNER_NOT_SELF_ACTIVE");
  assert.equal(w.c.signerAdd({ keyB64: "AAAAannself", memberId: "ann", by: "admin" }).ok, true);   /* R6 rebinds: origin admin */
  assert.equal(w.c.signerKnown({ keyB64: "AAAAannself", viewer: "admin" }).reason, "SIGNER_NOT_SELF_ACTIVE");
  assert.equal(listed(w, "AAAAannself").known_by, null);
  assert.notEqual(w.snapshot(), before);   /* (the setup above wrote; the refusals themselves are measured next) */
  const mid = w.snapshot();
  w.c.signerKnown({ keyB64: "AAAAnotheld", viewer: "admin" });
  w.c.signerKnown({ keyB64: "AAAAbobadmin", viewer: "admin" });
  assert.equal(w.snapshot(), mid);
});

test("R83 the known key still attests and is still revocable: knowing is not approving (R19, R7)", async () => {
  const w = await knownWorld();
  assert.equal(w.c.signerKnown({ keyB64: "AAAAannself", viewer: "admin" }).ok, true);
  assert.equal(w.c.attestingKeys().some((k) => k.key_b64 === "AAAAannself"), true);
  assert.equal(w.c.signerSet({ keyB64: "AAAAannself", status: "revoked", by: "admin" }).ok, true);
  const row = listed(w, "AAAAannself");
  assert.deepEqual([row.status, row.attests, row.known_by], ["revoked", false, "admin"]);
});

test("R83 the op: `signerknown` is an arm of the ops map taking the key from the body and the caller from the door's stamp", async () => {
  const w = await knownWorld();
  const refused = w.ops("by=member:bob", { keyB64: "AAAAannself" }).signerknown();
  assert.equal(refused.reason, "NOT_AN_ADMIN");
  const viaViewer = w.ops("viewer=member:second", { keyB64: "AAAAannself" }).signerknown();
  assert.deepEqual([viaViewer.ok, viaViewer.already], [true, false]);
  const viaBy = w.ops("by=admin", { keyB64: "AAAAannself" }).signerknown();
  assert.deepEqual([viaBy.ok, viaBy.already, viaBy.known_by], [true, true, "second"]);
  /* a stamp is never read from the body */
  const forged = w.ops("by=member:bob", { keyB64: "AAAAannself", viewer: "admin", by: "admin" }).signerknown();
  assert.equal(forged.reason, "NOT_AN_ADMIN");
});
