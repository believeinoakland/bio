/* Signing keys registered by an administrator (R6, R7), the roster and the attesting set (R8, R11, R19), at the
   interface; copied from membership's R25–R27 and R70 tests at the split (K637), against this module's services. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { CREDENTIALS_CHECKS, SIGNER_ENROLMENT_CHECKS } from "../../../src/credentials/index.mjs";
import { notAnAdmin } from "../../../src/membership/index.mjs";

const listed = (w, k) => w.c.signerList().signers.find((s) => s.key_b64 === k);

/* ann and bob active, cal invited and never enrolled, dee revoked; second an administrator; the founder claimed. */
async function keyWorld() {
  const w = await world().group("ann", "bob", "dee");
  assert.equal((await w.m.memberAdd({ memberId: "cal", cover: "c", by: "admin" })).ok, true);
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  return w;
}

test("R6 signerAdd: refusals in order, each writing nothing; a known key rebinds and reactivates, never a second row", async () => {
  const w = await keyWorld();
  const before = w.snapshot();
  /* NOT_AN_ADMIN first, through membership's notAnAdmin (its R84), byte for byte, before the key or member is asked */
  for (const by of ["ann", "cal", "dee", "nobody"])
    for (const [keyB64, memberId] of [["AAAAkey1", "ann"], ["not a key", "nobody"]])
      assert.deepEqual(w.c.signerAdd({ keyB64, memberId, by }), notAnAdmin(by, "registering a signing key"), by);
  /* BAD_KEY (C-96.8) before the member is looked up */
  for (const keyB64 of [undefined, null, "", "ssh-ed25519 AAAA", "BBBBx", "AAAA x", 7]) {
    const r = w.c.signerAdd({ keyB64, memberId: "nobody", by: "admin" });
    assert.deepEqual(r, { ok: false, reason: "BAD_KEY", code: "BAD_KEY", check: "C-96.8",
      translation: CREDENTIALS_CHECKS.BAD_KEY.translation, detail: "expected the base64 field of an ssh-ed25519 public key" },
      String(keyB64));
  }
  assert.deepEqual(w.c.signerAdd({ keyB64: "AAAAkey1", memberId: "nobody", by: "admin" }), { ok: false, reason: "NO_SUCH_MEMBER" });
  assert.deepEqual(w.c.signerAdd({ keyB64: "AAAAkey1", memberId: "admin", by: "admin" }), { ok: false, reason: "NO_SUCH_MEMBER" },
    "the founder holds no roster row, so no key is registered to them");
  const cal = w.c.signerAdd({ keyB64: "AAAAkey1", memberId: "cal", by: "admin" });
  assert.deepEqual([cal.reason, cal.code, cal.check, cal.translation, cal.memberId, cal.member_status, cal.enrolled],
    ["SIGNER_MEMBER_NOT_ENROLLED", "SIGNER_MEMBER_NOT_ENROLLED", "C-63.1",
     SIGNER_ENROLMENT_CHECKS.SIGNER_MEMBER_NOT_ENROLLED.translation, "cal", "invited", false]);
  assert.match(cal.detail, /Nothing was written\.$/);
  const dee = w.c.signerAdd({ keyB64: "AAAAkey1", memberId: "dee", by: "admin" });
  assert.deepEqual([dee.reason, dee.check, dee.translation, dee.memberId, dee.member_status, dee.enrolled],
    ["SIGNER_MEMBER_NOT_ACTIVE", "C-63.2", SIGNER_ENROLMENT_CHECKS.SIGNER_MEMBER_NOT_ACTIVE.translation, "dee", "revoked", true]);
  assert.equal(w.snapshot(), before, "no refusal writes");
  /* admitted: an active administrator (the founder included), a machine credential, an unstamped internal call */
  const a = w.c.signerAdd({ keyB64: "AAAAkey1", memberId: "ann", comment: "laptop", by: "admin" });
  assert.deepEqual(a, { ok: true, keyB64: "AAAAkey1", memberId: "ann", by: "admin" });
  assert.deepEqual(w.c.signerAdd({ keyB64: "AAAAkey2", memberId: "ann", by: "class:admin" }).by, "class:admin");
  assert.deepEqual(w.c.signerAdd({ keyB64: "AAAAkey3", memberId: "ann" }).by, "not recorded");
  assert.deepEqual(w.c.signerAdd({ keyB64: "AAAAkey4", memberId: "bob", by: "second" }).ok, true);
  /* a known key: rebound to its new member and made active again, one row */
  w.c.signerSet({ keyB64: "AAAAkey1", status: "revoked", by: "admin" });
  assert.equal(w.c.signerAdd({ keyB64: "AAAAkey1", memberId: "second", comment: "moved", by: "second" }).ok, true);
  assert.deepEqual(w.rows(`SELECT member_id, comment, status, status_by, origin, registered_by FROM signers WHERE key_b64='AAAAkey1'`),
    [{ member_id: "second", comment: "moved", status: "active", status_by: "second", origin: "admin", registered_by: "second" }]);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM signers`).n, 4);
});

test("R7 signerSet: NOT_AN_ADMIN, BAD_STATUS, NO_SUCH_KEY in order; activation refused as R6 for the owner; revoking never refused", async () => {
  const w = await keyWorld();
  w.c.signerAdd({ keyB64: "AAAAkey1", memberId: "ann", by: "admin" });
  w.c.signerAdd({ keyB64: "AAAAbob1", memberId: "bob", by: "admin" });
  const before = w.snapshot();
  assert.deepEqual(w.c.signerSet({ keyB64: "AAAAnone", status: "lost", by: "ann" }),
    notAnAdmin("ann", "setting a signing key's status"), "asked first");
  assert.deepEqual(w.c.signerSet({ keyB64: "AAAAkey1", status: "lost", by: "admin" }), { ok: false, reason: "BAD_STATUS" });
  assert.deepEqual(w.c.signerSet({ keyB64: "AAAAnone", status: "revoked", by: "admin" }), { ok: false, reason: "NO_SUCH_KEY" });
  assert.equal(w.snapshot(), before);
  assert.deepEqual(w.c.signerSet({ keyB64: "AAAAkey1", status: "revoked", by: "second" }),
    { ok: true, keyB64: "AAAAkey1", status: "revoked", by: "second" });
  assert.deepEqual(w.c.signerSet({ keyB64: "AAAAkey1", status: "active", by: "admin" }).ok, true, "an active member's key re-activates");
  /* bob revoked: his key is revoked with him (R16), and an administrator cannot activate it while he stands revoked */
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  const r = w.c.signerSet({ keyB64: "AAAAbob1", status: "active", by: "admin" });
  assert.deepEqual([r.reason, r.check, r.member_status, r.enrolled], ["SIGNER_MEMBER_NOT_ACTIVE", "C-63.2", "revoked", true]);
  assert.equal(listed(w, "AAAAbob1").status, "revoked", "nothing landed");
  /* a key whose member row is gone cannot be activated; revoking is never refused, whatever the member's state */
  w.sql.exec(`INSERT INTO signers (key_b64, member_id, status, added) VALUES ('AAAAghost', 'ghost', 'revoked', 't')`);
  assert.deepEqual(w.c.signerSet({ keyB64: "AAAAghost", status: "active", by: "admin" }), { ok: false, reason: "NO_SUCH_MEMBER" });
  for (const k of ["AAAAbob1", "AAAAghost", "AAAAkey1"])
    assert.equal(w.c.signerSet({ keyB64: k, status: "revoked", by: "class:admin" }).ok, true, k);
});

test("R8 R11 R19 signerList's attests is the one predicate, attests_why names a stored fact, and attestingKeys is exactly the attesting set", async () => {
  const w = await keyWorld();
  for (const [k, m] of [["AAAAa", "ann"], ["AAAAb", "bob"], ["AAAAs", "second"]]) w.c.signerAdd({ keyB64: k, memberId: m, by: "admin" });
  assert.equal(w.c.signerRegisterOwn({ keyB64: "AAAAself", by: "ann" }).ok, true);
  w.c.signerSet({ keyB64: "AAAAa", status: "revoked", by: "admin" });
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });         // revokes bob's key too (R16)
  w.sql.exec(`UPDATE signers SET status='active' WHERE key_b64='AAAAb'`);     // a key left active on a revoked member
  w.sql.exec(`INSERT INTO signers (key_b64, member_id, status, added) VALUES ('AAAAz','ghost','active','t')`);
  w.sql.exec(`INSERT INTO signers (key_b64, member_id, status, added) VALUES ('AAAAc','cal','active','t')`);   // invited member
  const list = Object.fromEntries(w.c.signerList().signers.map((s) => [s.key_b64, s]));
  assert.deepEqual(Object.keys(list).sort(), ["AAAAa", "AAAAb", "AAAAc", "AAAAs", "AAAAself", "AAAAz"], "every key is reported, none hidden");
  const view = (k) => [list[k].status, list[k].member_status, list[k].attests, list[k].attests_why];
  assert.deepEqual(view("AAAAa"), ["revoked", "active", false, "key_revoked"]);
  assert.deepEqual(view("AAAAb"), ["active", "revoked", false, "member_revoked"]);
  assert.deepEqual(view("AAAAc"), ["active", "invited", false, "member_invited"]);
  assert.deepEqual(view("AAAAz"), ["active", null, false, "member_absent"]);
  assert.deepEqual(view("AAAAs"), ["active", "active", true, null]);
  assert.deepEqual(view("AAAAself"), ["active", "active", true, null], "R19: a self-registered key attests as an administrator's");
  assert.deepEqual([list.AAAAa.status_by, list.AAAAz.status_by, list.AAAAz.registered_by, list.AAAAz.origin],
    ["admin", "not recorded", "not recorded", "admin"]);
  for (const s of Object.values(list))
    assert.deepEqual(Object.keys(s).sort(), ["added", "attests", "attests_why", "comment", "key_b64", "member_id",
      "member_status", "origin", "registered_by", "status", "status_at", "status_by"], s.key_b64);
  /* attests is exactly: key active and member active (membership R68's status), and nothing else */
  for (const s of Object.values(list))
    assert.equal(s.attests, s.status === "active" && w.m.memberFacts(s.member_id)?.status === "active", s.key_b64);
  /* R11: the attesting set is exactly the keys signerList says attest, with their members */
  const attesting = w.c.attestingKeys();
  assert.deepEqual(attesting.map((k) => k.key_b64).sort(), Object.values(list).filter((s) => s.attests).map((s) => s.key_b64).sort());
  assert.deepEqual(attesting.map((k) => k.key_b64).sort(), ["AAAAs", "AAAAself"]);
  for (const k of attesting) assert.deepEqual(Object.keys(k).sort(), ["key_b64", "member_id"]);
  assert.deepEqual(Object.fromEntries(attesting.map((k) => [k.key_b64, k.member_id])), { AAAAs: "second", AAAAself: "ann" });
  /* a reactivated member's keys attest again only when re-activated by an administrator (R7) */
  w.m.memberSet({ memberId: "bob", status: "active", by: "admin" });
  assert.equal(listed(w, "AAAAb").attests, true, "the key was left active by hand above; the member's status decides");
  /* an empty roster: both reads are empty */
  const e = world();
  assert.deepEqual([e.c.signerList(), e.c.attestingKeys()], [{ signers: [] }, []]);
});

test("R19 attests does not look at origin: a self-registered key and an administrator's attest alike in every state", async () => {
  const w = await keyWorld();
  const pairs = [];
  for (const [i, member] of ["ann", "bob"].entries()) {
    const self = `AAAAself${i}`, adm = `AAAAadm${i}`;
    assert.equal(w.c.signerRegisterOwn({ keyB64: self, by: member }).ok, true);
    assert.equal(w.c.signerAdd({ keyB64: adm, memberId: member, by: "admin" }).ok, true);
    pairs.push([self, adm]);
  }
  const same = (label) => {
    const list = w.c.signerList().signers;
    const attesting = new Set(w.c.attestingKeys().map((k) => k.key_b64));
    for (const [self, adm] of pairs) {
      const s = list.find((x) => x.key_b64 === self), a = list.find((x) => x.key_b64 === adm);
      assert.deepEqual([s.origin, a.origin], ["self", "admin"], label);
      assert.deepEqual([s.attests, s.attests_why], [a.attests, a.attests_why], `${label}: ${self} and ${adm}`);
      assert.equal(attesting.has(self), attesting.has(adm), `${label}: the gate's set agrees (R11)`);
      assert.equal(attesting.has(self), s.attests, label);
    }
  };
  same("both active");
  w.c.signerRevokeOwn({ keyB64: pairs[0][0], by: "ann" });
  w.c.signerSet({ keyB64: pairs[0][1], status: "revoked", by: "admin" });
  same("keys revoked");
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  same("member revoked (R16 revokes every key of theirs, whoever registered it)");
  w.sql.exec(`UPDATE signers SET status='active' WHERE member_id='bob'`);
  same("keys left active on a revoked member");
  w.m.memberSet({ memberId: "bob", status: "active", by: "admin" });
  same("member reactivated");
  assert.deepEqual(w.c.attestingKeys().map((k) => k.key_b64).sort(), ["AAAAadm1", "AAAAself1"]);
});

test("R8 each key states origin and registered_by: admin for R6 (its stamped actor, or not recorded), self for R9; an older row reads admin", async () => {
  const w = await keyWorld();
  w.c.signerAdd({ keyB64: "AAAAbyadmin", memberId: "ann", by: "second" });
  w.c.signerAdd({ keyB64: "AAAAbybearer", memberId: "ann", by: "class:admin" });
  w.c.signerAdd({ keyB64: "AAAAunstamped", memberId: "ann" });
  w.c.signerRegisterOwn({ keyB64: "AAAAbyself", by: "ann" });
  w.sql.exec(`INSERT INTO signers (key_b64, member_id, status, added) VALUES ('AAAAolder','ann','active','t')`);
  const want = { AAAAbyadmin: ["admin", "second"], AAAAbybearer: ["admin", "class:admin"],
                 AAAAunstamped: ["admin", "not recorded"], AAAAbyself: ["self", "ann"], AAAAolder: ["admin", "not recorded"] };
  for (const [k, [origin, by]] of Object.entries(want))
    assert.deepEqual([listed(w, k).origin, listed(w, k).registered_by], [origin, by], k);
  assert.equal(w.row(`SELECT origin FROM signers WHERE key_b64='AAAAolder'`).origin, null, "read as admin, never back-filled");
  /* R6 rebinding a self-registered key makes it an administrator's registration */
  w.c.signerAdd({ keyB64: "AAAAbyself", memberId: "bob", by: "second" });
  assert.deepEqual([listed(w, "AAAAbyself").member_id, listed(w, "AAAAbyself").origin, listed(w, "AAAAbyself").registered_by],
    ["bob", "admin", "second"]);
});
