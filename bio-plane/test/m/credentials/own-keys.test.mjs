/* A member registers and revokes their own key (R9, R10; DEC-80 item 4, Bob's ruling K509 (2)), with rows C-96.15–.17,
   at the interface; copied from membership's R89–R91 tests at the split (K637). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD } from "./fixture.mjs";
import { CREDENTIALS_CHECKS, SIGNER_ENROLMENT_CHECKS } from "../../../src/credentials/index.mjs";
import { noSuchMember } from "../../../src/membership/index.mjs";

const keyRow = (w, k) => w.row(`SELECT member_id, status, status_by, origin, registered_by, comment FROM signers WHERE key_b64=?`, k);
const listed = (w, k) => w.c.signerList().signers.find((s) => s.key_b64 === k);
const reg = (w, by, keyB64, comment = null) => w.c.signerRegisterOwn({ keyB64, comment, by });
const HELD = CREDENTIALS_CHECKS.SIGNER_KEY_HELD_BY_ANOTHER;
const REVOKED = CREDENTIALS_CHECKS.SIGNER_KEY_REVOKED;
const MACHINE = CREDENTIALS_CHECKS.MACHINE_CANNOT_REGISTER_KEY;
/* Every caller with no member behind it: no stamp, an empty one, every machine credential, the operator's bearer. */
const NOBODY = [null, undefined, "", ...["admin", "member", "probe", "daemon", "ai"].map((c) => `class:${c}`), "token:daemon"];

/* ann and bob active; cal invited, never enrolled; dee revoked; second an administrator; the founder claimed. */
async function keyWorld() {
  const w = await world().group("ann", "bob", "dee");
  assert.equal((await w.m.memberAdd({ memberId: "cal", cover: "c", by: "admin" })).ok, true);
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  return w;
}

test("R9 refusals in order, each writing nothing: no member behind the caller (C-96.17); BAD_KEY as R6; the member's standing; a key another member holds (C-96.15)", async () => {
  const w = await keyWorld();
  assert.equal(w.c.signerAdd({ keyB64: "AAAAannkey", memberId: "ann", by: "admin" }).ok, true);
  const before = w.snapshot();
  /* MACHINE_CANNOT_REGISTER_KEY first, whatever the key, one answer but its `by` */
  for (const by of NOBODY)
    for (const key of ["AAAAnew", "AAAAannkey", "not a key", undefined, 7]) {
      const r = reg(w, by, key, "c");
      const label = `${String(by)} ${String(key)}`;
      assert.deepEqual(Object.keys(r).sort(), ["by", "check", "code", "detail", "ok", "reason", "translation"], label);
      assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.by],
        [false, "MACHINE_CANNOT_REGISTER_KEY", "MACHINE_CANNOT_REGISTER_KEY", "C-96.17", MACHINE.translation, by || null], label);
      assert.match(r.detail, /Nothing was written\.$/, label);
    }
  assert.equal(new Set(NOBODY.map((by) => JSON.stringify({ ...reg(w, by, "AAAAannkey"), by: null }))).size, 1);
  /* BAD_KEY, R6's answer byte for byte (C-96.8), before the member's standing */
  for (const key of [undefined, null, "", "ssh-ed25519 AAAAx", "BBBBx", "AAAA x", 7])
    for (const by of ["ann", "cal", "dee", "nobody"]) {
      const r = reg(w, by, key);
      assert.deepEqual(r, w.c.signerAdd({ keyB64: key, memberId: "ann", by: "admin" }), `${by} ${String(key)}`);
      assert.deepEqual([r.reason, r.check], ["BAD_KEY", "C-96.8"]);
    }
  /* the member's standing, R6's bar, before another member's key */
  const cal = reg(w, "cal", "AAAAannkey");
  assert.deepEqual([cal.reason, cal.check, cal.translation, cal.memberId, cal.enrolled],
    ["SIGNER_MEMBER_NOT_ENROLLED", "C-63.1", SIGNER_ENROLMENT_CHECKS.SIGNER_MEMBER_NOT_ENROLLED.translation, "cal", false]);
  const dee = reg(w, "dee", "AAAAannkey");
  assert.deepEqual([dee.reason, dee.member_status, dee.enrolled], ["SIGNER_MEMBER_NOT_ACTIVE", "revoked", true]);
  for (const by of ["nobody", "admin"]) assert.deepEqual(reg(w, by, "AAAAnew"), noSuchMember(by), by);
  /* SIGNER_KEY_HELD_BY_ANOTHER: exactly its fields and row, naming no one */
  const held = reg(w, "bob", "AAAAannkey", "mine now");
  assert.deepEqual(Object.keys(held).sort(), ["check", "code", "detail", "ok", "reason", "translation"]);
  assert.deepEqual([held.ok, held.reason, held.code, held.check, held.translation],
    [false, "SIGNER_KEY_HELD_BY_ANOTHER", "SIGNER_KEY_HELD_BY_ANOTHER", "C-96.15", HELD.translation]);
  for (const name of ["ann", "cover of ann", "admin"]) assert.ok(!held.detail.includes(name), name);
  assert.match(held.detail, /Nothing was written\.$/);
  assert.equal(w.snapshot(), before, "no refusal writes");
});

test("R9 a key another member holds is never rebound, whatever its state, its origin or the other's standing; one answer whoever holds it", async () => {
  const w = await keyWorld();
  w.c.signerAdd({ keyB64: "AAAAadminreg", memberId: "ann", by: "admin" });
  assert.equal(reg(w, "ann", "AAAAselfreg").ok, true);
  w.c.signerAdd({ keyB64: "AAAArevoked", memberId: "ann", by: "admin" });
  w.c.signerSet({ keyB64: "AAAArevoked", status: "revoked", by: "admin" });
  w.c.signerAdd({ keyB64: "AAAAdees", memberId: "bob", by: "admin" });
  w.sql.exec(`UPDATE signers SET member_id='dee' WHERE key_b64='AAAAdees'`);          // held by a revoked member
  const keys = ["AAAAadminreg", "AAAAselfreg", "AAAArevoked", "AAAAdees"];
  for (const key of keys) {
    const before = keyRow(w, key);
    assert.equal(reg(w, "bob", key).reason, "SIGNER_KEY_HELD_BY_ANOTHER", key);
    assert.deepEqual(keyRow(w, key), before, `${key}: unchanged`);
  }
  assert.equal(new Set(keys.map((k) => JSON.stringify(reg(w, "bob", k)))).size, 1);
});

test("R9 a registration: active, origin self, registered by the member, every administrator (membership R86) notified; it attests", async () => {
  const w = await keyWorld();
  const r = reg(w, "bob", "AAAAbobkey", "bob's laptop");
  assert.deepEqual({ ...r, detail: null }, { ok: true, keyB64: "AAAAbobkey", memberId: "bob", status: "active", origin: "self",
    registered_by: "bob", existed: false, notified: ["admin", "second"], detail: null });
  assert.equal(typeof r.detail, "string");
  assert.deepEqual(keyRow(w, "AAAAbobkey"), { member_id: "bob", status: "active", status_by: "bob", origin: "self",
    registered_by: "bob", comment: "bob's laptop" });
  const l = listed(w, "AAAAbobkey");
  assert.deepEqual([l.origin, l.registered_by, l.status, l.status_by, l.attests, l.attests_why], ["self", "bob", "active", "bob", true, null]);
  assert.ok(w.c.attestingKeys().some((k) => k.key_b64 === "AAAAbobkey" && k.member_id === "bob"));
  /* notified is membership's R86 at the act: a third administrator, once active, is told too; a revoked one is not */
  const p = await w.m.memberAdd({ memberId: "third", cover: "c3", role: "admin", by: "admin" });
  assert.equal(p.reason, "CONSENSUS_REQUIRED");
  const e = await w.m.adminEndorse({ memberId: "third", by: "second" });
  await w.m.enroll({ invite: e.invite, handle: "third", password: PASSWORD("third") });
  assert.deepEqual(reg(w, "ann", "AAAAann1").notified, ["admin", "second", "third"]);
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.deepEqual(reg(w, "ann", "AAAAann2").notified, ["admin", "third"]);
  assert.deepEqual(reg(w, "ann", "AAAAann2").notified, w.m.activeAdmins(), "exactly membership's R86 answer");
  /* an administrator registers their own key the same way */
  assert.deepEqual([reg(w, "third", "AAAAthird").origin, listed(w, "AAAAthird").registered_by], ["self", "third"]);
});

test("R9 a key the member already holds: active, existed: true and nothing rewritten; revoked, SIGNER_KEY_REVOKED (C-96.16) and it stays revoked (K535)", async () => {
  const w = await keyWorld();
  reg(w, "bob", "AAAAbobkey", "laptop");
  const before = w.snapshot();
  const again = reg(w, "bob", "AAAAbobkey", "a new comment");
  assert.deepEqual({ ...again, detail: null }, { ok: true, keyB64: "AAAAbobkey", memberId: "bob", status: "active", origin: "self",
    registered_by: "bob", existed: true, notified: ["admin", "second"], detail: null });
  assert.equal(w.snapshot(), before, "nothing written");
  /* one an administrator registered for them stays an administrator's registration (R8) */
  w.c.signerAdd({ keyB64: "AAAAgiven", memberId: "bob", by: "second" });
  w.c.signerAdd({ keyB64: "AAAAunstamped", memberId: "bob" });
  const given = w.snapshot();
  const g = reg(w, "bob", "AAAAgiven");
  assert.deepEqual([g.ok, g.existed, g.origin, g.registered_by, g.notified], [true, true, "admin", "second", ["admin", "second"]]);
  assert.deepEqual([reg(w, "bob", "AAAAunstamped").origin, reg(w, "bob", "AAAAunstamped").registered_by], ["admin", "not recorded"]);
  assert.equal(w.snapshot(), given);
  /* revoked by an administrator (R7), by its member (R10) or by the member's revocation (R16): refused, stays revoked */
  w.c.signerSet({ keyB64: "AAAAbobkey", status: "revoked", by: "second" });
  w.c.signerRevokeOwn({ keyB64: "AAAAgiven", by: "bob" });
  reg(w, "ann", "AAAAannkey");
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  w.m.memberSet({ memberId: "ann", status: "active", by: "admin" });
  const revoked = w.snapshot();
  for (const [by, key] of [["bob", "AAAAbobkey"], ["bob", "AAAAgiven"], ["ann", "AAAAannkey"]]) {
    const r = reg(w, by, key, "again");
    assert.deepEqual(Object.keys(r).sort(), ["check", "code", "detail", "ok", "reason", "translation"], key);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
      [false, "SIGNER_KEY_REVOKED", "SIGNER_KEY_REVOKED", "C-96.16", REVOKED.translation], key);
    assert.match(r.detail, /Nothing was written\.$/);
    assert.deepEqual([listed(w, key).status, listed(w, key).attests], ["revoked", false], key);
  }
  assert.equal(w.snapshot(), revoked, "no refusal writes");
  /* C-96.15 is asked first: a revoked key another member holds is theirs, not "revoked" */
  assert.equal(reg(w, "bob", "AAAAannkey").reason, "SIGNER_KEY_HELD_BY_ANOTHER");
  /* only an administrator re-activates it (R7); then it is the member's active key again */
  assert.equal(w.c.signerSet({ keyB64: "AAAAbobkey", status: "active", by: "second" }).ok, true);
  assert.deepEqual([reg(w, "bob", "AAAAbobkey").existed, listed(w, "AAAAbobkey").attests], [true, true]);
});

test("R10 signerRevokeOwn: never refused for a key the member holds, in any state; another's key and no key are one NO_SUCH_KEY", async () => {
  const w = await keyWorld();
  reg(w, "bob", "AAAAbob1");
  w.c.signerAdd({ keyB64: "AAAAbob2", memberId: "bob", by: "admin" });
  reg(w, "ann", "AAAAann1");
  w.c.signerAdd({ keyB64: "AAAAdee1", memberId: "ann", by: "admin" });
  w.sql.exec(`UPDATE signers SET member_id='dee' WHERE key_b64='AAAAdee1'`);          // a revoked member's key left active
  for (const key of ["AAAAbob1", "AAAAbob2"]) {
    assert.deepEqual(w.c.signerRevokeOwn({ keyB64: key, by: "bob" }),
      { ok: true, keyB64: key, status: "revoked", by: "bob", already: false }, key);
    assert.deepEqual([keyRow(w, key).status, keyRow(w, key).status_by, listed(w, key).attests], ["revoked", "bob", false]);
    assert.deepEqual(w.c.signerRevokeOwn({ keyB64: key, by: "bob" }),
      { ok: true, keyB64: key, status: "revoked", by: "bob", already: true }, "twice: never refused, nothing rewritten");
  }
  assert.equal(w.c.signerRevokeOwn({ keyB64: "AAAAdee1", by: "dee" }).ok, true, "a revoked member revokes their own key");
  const none = w.c.signerSet({ keyB64: "AAAAnobody", status: "revoked", by: "admin" });
  assert.deepEqual(none, { ok: false, reason: "NO_SUCH_KEY" });
  const before = w.snapshot();
  for (const [key, by] of [["AAAAann1", "bob"], ["AAAAnobody", "bob"], ["AAAAann1", "second"], ["AAAAann1", "admin"],
                           ["AAAAann1", "class:admin"], ["AAAAann1", null], ["AAAAann1", ""], [null, "ann"],
                           [undefined, undefined], [7, "ann"]])
    assert.deepEqual(w.c.signerRevokeOwn({ keyB64: key, by }), none, `${String(key)} by ${String(by)}`);
  assert.equal(w.snapshot(), before, "nothing written");
  assert.equal(listed(w, "AAAAann1").attests, true, "another's key untouched");
  const next = reg(w, "bob", "AAAAbob3");
  assert.deepEqual([next.ok, next.existed, listed(w, "AAAAbob3").attests], [true, false, true], "a replacement is a new R9");
  assert.equal(w.c.signerSet({ keyB64: "AAAAbob3", status: "revoked", by: "second" }).ok, true, "an administrator revokes any key (R7)");
  assert.equal(listed(w, "AAAAbob3").attests, false);
});
