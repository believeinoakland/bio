/* T16 (N364; DEC-80 item 4, Bob's ruling K509 (2)): R89 `signerRegisterOwn`, R90 `signerRevokeOwn`, R91 (`attests`
   ignores `origin`), R27's `origin` and `registered_by`, and rows C-96.15 and C-96.16 (K535). N357's R43 and R88 are asserted with their
   ids in `sight.test.mjs` and `hidden-bundles.test.mjs`. At the interface only. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { world, sqlOver, V } from "./fixture.mjs";
import { Membership, MEMBERSHIP_CHECKS, membershipOf, viewerPredicate } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";
import { CUSTODIAL_CHECKS } from "../../../src/membership/checks.mjs";
import { SIGNER_ENROLMENT_CHECKS } from "../../../checks/bio-checks.mjs";

const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));
const keyRow = (w, k) => w.row(`SELECT member_id, status, status_by, origin, registered_by, comment FROM signers WHERE key_b64=?`, k);
const listed = (w, k) => w.m.signerList().signers.find((s) => s.key_b64 === k);
const ROW = MEMBERSHIP_CHECKS.SIGNER_KEY_HELD_BY_ANOTHER;
const REVOKED = MEMBERSHIP_CHECKS.SIGNER_KEY_REVOKED;

/* ann and bob active; cal invited, never enrolled; dee revoked; second an administrator; the founder claimed. */
async function keyWorld() {
  const w = await world().group("ann", "bob", "dee");
  assert.equal((await w.m.memberAdd({ memberId: "cal", cover: "c", by: "admin" })).ok, true);
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  return w;
}
const reg = (w, by, keyB64, comment = null) => w.m.signerRegisterOwn({ keyB64, comment, by });

test("R89 C-96.15 and C-96.16: the rows are this module's, worded as the requirement words them, each where its one site", () => {
  assert.deepEqual({ ...ROW }, { check: "C-96.15", where: "src/membership/index.mjs signerRegisterOwn > is-signer-key-held",
    translation: "This key is registered to another member, so it cannot be yours. Make a new key in this browser. "
      + "Nothing was changed." });
  assert.ok(Object.isFrozen(ROW));
  assert.deepEqual({ ...REVOKED }, { check: "C-96.16", where: "src/membership/index.mjs signerRegisterOwn > is-signer-key-revoked",
    translation: "This key was revoked, so it cannot be registered again. Make a new key in this browser, or ask an "
      + "administrator. Nothing was changed." });
  assert.ok(Object.isFrozen(REVOKED));
});

test("R89 refusals in order: a machine credential, the operator's token or no stamp; BAD_KEY as R25; the member's standing; a key another member holds; each writes nothing", async () => {
  const w = await keyWorld();
  assert.equal(w.m.signerAdd({ keyB64: "AAAAannkey", memberId: "ann", by: "admin" }).ok, true);
  const before = snapshot(w);
  /* MACHINE_CANNOT_REGISTER_KEY first, whatever the key. */
  for (const by of [null, undefined, "", `${MACHINE_CLASS_PREFIX}admin`, `${MACHINE_CLASS_PREFIX}member`, `${MACHINE_CLASS_PREFIX}ai`,
                    "token:daemon"])
    for (const key of ["AAAAnew", "not a key", "AAAAannkey"]) {
      const r = reg(w, by, key);
      assert.deepEqual([r.ok, r.reason, r.by], [false, "MACHINE_CANNOT_REGISTER_KEY", by || null], `${by} ${key}`);
      assert.match(r.detail, /Nothing was written\.$/);
    }
  /* BAD_KEY, R25's answer byte for byte (C-96.8), before the member's standing. */
  for (const key of [undefined, null, "", "ssh-ed25519 AAAAx", "BBBBx", "AAAA x", 7]) {
    for (const by of ["ann", "cal", "dee", "nobody"]) {
      const r = reg(w, by, key);
      assert.deepEqual(r, w.m.signerAdd({ keyB64: key, memberId: "ann", by: "admin" }), `${by} ${String(key)}`);
      assert.deepEqual([r.reason, r.code, r.check, r.translation], ["BAD_KEY", "BAD_KEY", "C-96.8", CUSTODIAL_CHECKS.BAD_KEY.translation]);
    }
  }
  /* The member's standing, R25's bar: never enrolled, not active, and before another member's key. */
  const cal = reg(w, "cal", "AAAAannkey");
  assert.deepEqual([cal.reason, cal.check, cal.translation, cal.memberId, cal.enrolled],
    ["SIGNER_MEMBER_NOT_ENROLLED", SIGNER_ENROLMENT_CHECKS.SIGNER_MEMBER_NOT_ENROLLED.check,
     SIGNER_ENROLMENT_CHECKS.SIGNER_MEMBER_NOT_ENROLLED.translation, "cal", false]);
  const dee = reg(w, "dee", "AAAAannkey");
  assert.deepEqual([dee.reason, dee.member_status, dee.enrolled], ["SIGNER_MEMBER_NOT_ACTIVE", "revoked", true]);
  /* An id no member row holds, the founder's included: the bar's NO_SUCH_MEMBER (a key on no member never attests). */
  for (const by of ["nobody", "admin"]) assert.deepEqual(reg(w, by, "AAAAnew"), { ok: false, reason: "NO_SUCH_MEMBER" }, by);
  /* SIGNER_KEY_HELD_BY_ANOTHER: exactly its fields, its row, naming no one. */
  const held = reg(w, "bob", "AAAAannkey", "mine now");
  assert.deepEqual(Object.keys(held).sort(), ["check", "code", "detail", "ok", "reason", "translation"]);
  assert.deepEqual([held.ok, held.reason, held.code, held.check, held.translation],
    [false, "SIGNER_KEY_HELD_BY_ANOTHER", "SIGNER_KEY_HELD_BY_ANOTHER", "C-96.15", ROW.translation]);
  for (const name of ["ann", "cover of ann", "admin"]) assert.ok(!held.detail.includes(name), name);
  assert.match(held.detail, /Nothing was written\.$/);
  assert.equal(snapshot(w), before, "no refusal writes");
});

test("R89 a key another member holds is never rebound, whatever its state, its origin or the other's standing", async () => {
  const w = await keyWorld();
  w.m.signerAdd({ keyB64: "AAAAadminreg", memberId: "ann", by: "admin" });
  assert.equal(reg(w, "ann", "AAAAselfreg").ok, true);
  w.m.signerAdd({ keyB64: "AAAArevoked", memberId: "ann", by: "admin" });
  w.m.signerSet({ keyB64: "AAAArevoked", status: "revoked", by: "admin" });
  w.m.signerAdd({ keyB64: "AAAAdees", memberId: "bob", by: "admin" });
  w.sql.exec(`UPDATE signers SET member_id='dee' WHERE key_b64='AAAAdees'`);          // held by a revoked member
  for (const key of ["AAAAadminreg", "AAAAselfreg", "AAAArevoked", "AAAAdees"]) {
    const before = keyRow(w, key);
    const r = reg(w, "bob", key);
    assert.equal(r.reason, "SIGNER_KEY_HELD_BY_ANOTHER", key);
    assert.deepEqual(keyRow(w, key), before, `${key}: unchanged`);
  }
  /* The refusal is one answer whoever holds the key. */
  const answers = new Set(["AAAAadminreg", "AAAAselfreg", "AAAArevoked", "AAAAdees"].map((k) => JSON.stringify(reg(w, "bob", k))));
  assert.equal(answers.size, 1);
});

test("R89 a registration: active, origin self, registered by the member, every administrator (R86) notified; it attests", async () => {
  const w = await keyWorld();
  const r = reg(w, "bob", "AAAAbobkey", "bob's laptop");
  assert.deepEqual({ ...r, detail: null }, { ok: true, keyB64: "AAAAbobkey", memberId: "bob", status: "active", origin: "self",
    registered_by: "bob", existed: false, notified: ["admin", "second"], detail: null });
  assert.equal(typeof r.detail, "string");
  assert.deepEqual(keyRow(w, "AAAAbobkey"), { member_id: "bob", status: "active", status_by: "bob", origin: "self",
    registered_by: "bob", comment: "bob's laptop" });
  const l = listed(w, "AAAAbobkey");
  assert.deepEqual([l.origin, l.registered_by, l.status, l.status_by, l.attests, l.attests_why], ["self", "bob", "active", "bob", true, null]);
  assert.ok(w.m.attestingKeys().some((k) => k.key_b64 === "AAAAbobkey" && k.member_id === "bob"));
  /* notified is R86's list at the act: a third administrator, once active, is told too; a revoked one is not. */
  const p = await w.m.memberAdd({ memberId: "third", cover: "c3", role: "admin", by: "admin" });
  assert.equal(p.reason, "CONSENSUS_REQUIRED");
  const e = await w.m.adminEndorse({ memberId: "third", by: "second" });
  await w.m.enroll({ invite: e.invite, handle: "third", password: "third-passphrase-x" });
  assert.deepEqual(reg(w, "ann", "AAAAann1").notified, ["admin", "second", "third"]);
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.deepEqual(reg(w, "ann", "AAAAann2").notified, ["admin", "third"]);
  assert.deepEqual(reg(w, "ann", "AAAAann2").notified, w.m.activeAdmins(), "exactly R86's answer");
  /* An administrator registers their own key the same way. */
  assert.deepEqual([reg(w, "third", "AAAAthird").origin, listed(w, "AAAAthird").registered_by], ["self", "third"]);
});

test("R89 a key the member already holds: active, existed: true and nothing rewritten; revoked, SIGNER_KEY_REVOKED (C-96.16) and it stays revoked (K535)", async () => {
  const w = await keyWorld();
  reg(w, "bob", "AAAAbobkey", "laptop");
  const before = snapshot(w);
  const again = reg(w, "bob", "AAAAbobkey", "a new comment");
  assert.deepEqual({ ...again, detail: null }, { ok: true, keyB64: "AAAAbobkey", memberId: "bob", status: "active", origin: "self",
    registered_by: "bob", existed: true, notified: ["admin", "second"], detail: null });
  assert.equal(snapshot(w), before, "nothing written: one row, its comment and stamps as they were");
  /* one an administrator registered for them stays an administrator's registration (R27) */
  w.m.signerAdd({ keyB64: "AAAAgiven", memberId: "bob", by: "second" });
  w.m.signerAdd({ keyB64: "AAAAunstamped", memberId: "bob" });
  const given = snapshot(w);
  const g = reg(w, "bob", "AAAAgiven");
  assert.deepEqual([g.ok, g.existed, g.origin, g.registered_by, g.notified], [true, true, "admin", "second", ["admin", "second"]]);
  assert.deepEqual([reg(w, "bob", "AAAAunstamped").origin, reg(w, "bob", "AAAAunstamped").registered_by], ["admin", "not recorded"]);
  assert.equal(snapshot(w), given);
  assert.deepEqual([listed(w, "AAAAgiven").origin, listed(w, "AAAAgiven").registered_by], ["admin", "second"]);
  /* revoked, by an administrator (R26), by its member (R90) or by the member's revocation (R20): refused, and it stays revoked */
  w.m.signerSet({ keyB64: "AAAAbobkey", status: "revoked", by: "second" });
  w.m.signerRevokeOwn({ keyB64: "AAAAgiven", by: "bob" });
  reg(w, "ann", "AAAAannkey");
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  w.m.memberSet({ memberId: "ann", status: "active", by: "admin" });
  const revoked = snapshot(w);
  for (const [by, key] of [["bob", "AAAAbobkey"], ["bob", "AAAAgiven"], ["ann", "AAAAannkey"]]) {
    const r = reg(w, by, key, "again");
    assert.deepEqual(Object.keys(r).sort(), ["check", "code", "detail", "ok", "reason", "translation"], key);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
      [false, "SIGNER_KEY_REVOKED", "SIGNER_KEY_REVOKED", "C-96.16", REVOKED.translation], key);
    assert.match(r.detail, /Nothing was written\.$/);
    assert.equal(listed(w, key).status, "revoked", key);
    assert.equal(listed(w, key).attests, false, key);
  }
  assert.equal(snapshot(w), revoked, "no refusal writes");
  /* C-96.15 is asked first: a revoked key another member holds is theirs, not "revoked" */
  assert.equal(reg(w, "bob", "AAAAannkey").reason, "SIGNER_KEY_HELD_BY_ANOTHER");
  /* only an administrator re-activates it (R26); then it is the member's active key again */
  assert.equal(w.m.signerSet({ keyB64: "AAAAbobkey", status: "active", by: "second" }).ok, true);
  assert.deepEqual([reg(w, "bob", "AAAAbobkey").existed, listed(w, "AAAAbobkey").attests], [true, true]);
});

test("R90 signerRevokeOwn: never refused for a key the member holds, in any state; another's key and no key are one NO_SUCH_KEY", async () => {
  const w = await keyWorld();
  reg(w, "bob", "AAAAbob1");
  w.m.signerAdd({ keyB64: "AAAAbob2", memberId: "bob", by: "admin" });
  reg(w, "ann", "AAAAann1");
  w.m.signerAdd({ keyB64: "AAAAdee1", memberId: "ann", by: "admin" });
  w.sql.exec(`UPDATE signers SET member_id='dee' WHERE key_b64='AAAAdee1'`);          // a revoked member's key left active
  /* its own keys, self- or administrator-registered */
  for (const key of ["AAAAbob1", "AAAAbob2"]) {
    const r = w.m.signerRevokeOwn({ keyB64: key, by: "bob" });
    assert.deepEqual(r, { ok: true, keyB64: key, status: "revoked", by: "bob", already: false }, key);
    assert.deepEqual([keyRow(w, key).status, keyRow(w, key).status_by], ["revoked", "bob"]);
    assert.equal(listed(w, key).attests, false);
    assert.deepEqual(w.m.signerRevokeOwn({ keyB64: key, by: "bob" }), { ok: true, keyB64: key, status: "revoked", by: "bob",
      already: true }, "twice: never refused, nothing rewritten");
    assert.equal(keyRow(w, key).status_by, "bob");
  }
  /* a revoked member revokes their own key: never refused */
  assert.deepEqual(w.m.signerRevokeOwn({ keyB64: "AAAAdee1", by: "dee" }).ok, true);
  /* another member's key, a key nobody holds, a machine or no caller: the one answer, signerSet's for no such key */
  const none = w.m.signerSet({ keyB64: "AAAAnobody", status: "revoked", by: "admin" });
  assert.deepEqual(none, { ok: false, reason: "NO_SUCH_KEY" });
  const before = snapshot(w);
  for (const [key, by] of [["AAAAann1", "bob"], ["AAAAnobody", "bob"], ["AAAAann1", "second"], ["AAAAann1", "admin"],
                           ["AAAAann1", `${MACHINE_CLASS_PREFIX}admin`], ["AAAAann1", null], ["AAAAann1", ""], [null, "ann"],
                           [undefined, undefined], [7, "ann"]])
    assert.deepEqual(w.m.signerRevokeOwn({ keyB64: key, by }), none, `${String(key)} by ${String(by)}`);
  assert.equal(snapshot(w), before, "nothing written");
  assert.equal(listed(w, "AAAAann1").attests, true, "another's key untouched");
  /* a replacement is a new R89 */
  const next = reg(w, "bob", "AAAAbob3");
  assert.deepEqual([next.ok, next.existed, listed(w, "AAAAbob3").attests], [true, false, true]);
  /* an administrator revokes any key by R26, a self-registered one included */
  assert.equal(w.m.signerSet({ keyB64: "AAAAbob3", status: "revoked", by: "second" }).ok, true);
  assert.equal(listed(w, "AAAAbob3").attests, false);
});

test("R91 attests does not look at origin: a self-registered key and an administrator's attest alike in every state", async () => {
  const w = await keyWorld();
  const pairs = [];
  for (const [i, member] of ["ann", "bob"].entries()) {
    const self = `AAAAself${i}`, adm = `AAAAadm${i}`;
    assert.equal(reg(w, member, self).ok, true);
    assert.equal(w.m.signerAdd({ keyB64: adm, memberId: member, by: "admin" }).ok, true);
    pairs.push([self, adm]);
  }
  const same = (label) => {
    const list = w.m.signerList().signers;
    const attesting = new Set(w.m.attestingKeys().map((k) => k.key_b64));
    for (const [self, adm] of pairs) {
      const s = list.find((x) => x.key_b64 === self), a = list.find((x) => x.key_b64 === adm);
      assert.deepEqual([s.origin, a.origin], ["self", "admin"], label);
      assert.deepEqual([s.attests, s.attests_why], [a.attests, a.attests_why], `${label}: ${self} and ${adm}`);
      assert.equal(attesting.has(self), attesting.has(adm), `${label}: the gate's set agrees (R70)`);
      assert.equal(attesting.has(self), s.attests, label);
    }
  };
  same("both active");
  for (const [self, adm] of [pairs[0]]) {
    w.m.signerRevokeOwn({ keyB64: self, by: "ann" });
    w.m.signerSet({ keyB64: adm, status: "revoked", by: "admin" });
  }
  same("keys revoked");
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  same("member revoked (R20 revokes every key of theirs, whoever registered it)");
  w.sql.exec(`UPDATE signers SET status='active' WHERE member_id='bob'`);
  same("keys left active on a revoked member");
  w.m.memberSet({ memberId: "bob", status: "active", by: "admin" });
  same("member reactivated");
  assert.deepEqual(w.m.attestingKeys().map((k) => k.key_b64).sort(), ["AAAAadm1", "AAAAself1"]);
});

test("R27 each key states origin and registered_by: admin for R25 (its stamped actor, or not recorded), self for R89; an older row reads admin", async () => {
  const w = await keyWorld();
  w.m.signerAdd({ keyB64: "AAAAbyadmin", memberId: "ann", by: "second" });
  w.m.signerAdd({ keyB64: "AAAAbybearer", memberId: "ann", by: `${MACHINE_CLASS_PREFIX}admin` });
  w.m.signerAdd({ keyB64: "AAAAunstamped", memberId: "ann" });
  reg(w, "ann", "AAAAbyself");
  w.sql.exec(`INSERT INTO signers (key_b64, member_id, status, added) VALUES ('AAAAolder','ann','active','t')`);
  const want = { AAAAbyadmin: ["admin", "second"], AAAAbybearer: ["admin", `${MACHINE_CLASS_PREFIX}admin`],
                 AAAAunstamped: ["admin", "not recorded"], AAAAbyself: ["self", "ann"], AAAAolder: ["admin", "not recorded"] };
  for (const [k, [origin, by]] of Object.entries(want)) assert.deepEqual([listed(w, k).origin, listed(w, k).registered_by], [origin, by], k);
  assert.equal(keyRow(w, "AAAAolder").origin, null, "read as admin, never back-filled");
  /* R25 rebinding a self-registered key makes it an administrator's registration */
  w.m.signerAdd({ keyB64: "AAAAbyself", memberId: "bob", by: "second" });
  assert.deepEqual([listed(w, "AAAAbyself").member_id, listed(w, "AAAAbyself").origin, listed(w, "AAAAbyself").registered_by],
    ["bob", "admin", "second"]);
  /* every key carries both, beside R27's other fields */
  for (const s of w.m.signerList().signers)
    for (const f of ["key_b64", "member_id", "status", "status_by", "member_status", "attests", "attests_why", "origin", "registered_by"])
      assert.ok(f in s, `${s.key_b64} ${f}`);
});

test("R27 an older store gains origin and registered_by at boot, additive and never back-filled; its keys read admin", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, title TEXT)`);
  db.exec(`CREATE TABLE signers (key_b64 TEXT PRIMARY KEY, member_id TEXT NOT NULL, comment TEXT,
           status TEXT NOT NULL DEFAULT 'active', added TEXT NOT NULL)`);
  db.exec(`INSERT INTO signers (key_b64, member_id, status, added) VALUES ('AAAAold', 'ann', 'active', 't')`);
  const core = { bundleInfo: () => null, declarePurge() {} };
  const m = membershipOf({ storage: { sql: sqlOver(db) } }, { record: core });
  m.migrate();
  const cols = db.prepare(`PRAGMA table_info(signers)`).all().map((c) => c.name);
  for (const c of ["status_by", "origin", "registered_by"]) assert.ok(cols.includes(c), c);
  assert.deepEqual({ ...db.prepare(`SELECT origin, registered_by FROM signers`).get() }, { origin: null, registered_by: null });
  const s = m.signerList().signers[0];
  assert.deepEqual([s.origin, s.registered_by], ["admin", "not recorded"]);
});

test("R43 R44 R80 R76 N357: the founder's member:admin is at FULL sight of every project, as the bare admin is, and names the member admin", async () => {
  const w = await world().group("ann", "cal");
  w.project("PROJ-H", "Hidden H");
  w.project("PROJ-D", "Discoverable D");
  w.project("PROJ-M", "Machine M");
  for (const p of ["PROJ-H", "PROJ-D"]) w.m.projectClaimOwner({ projectId: p, memberId: "ann" });
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  for (const v of ["admin", V("admin")])
    for (const p of ["PROJ-H", "PROJ-D", "PROJ-M"]) {
      assert.equal(w.m.sight(p, v), Membership.SIGHT_FULL, `${v} ${p}`);
      assert.equal(w.m.inSight(p, v), true, `${v} ${p}`);
      assert.equal(w.m.existenceAct(p, v), null, `${v} ${p}`);
    }
  assert.deepEqual([viewerPredicate("admin").member, viewerPredicate(V("admin")).member], [null, "admin"]);
  assert.deepEqual([viewerPredicate("admin").scope, viewerPredicate(V("admin")).scope], ["member", "member"]);
  assert.equal(w.m.positionalMember(V("admin")), "admin");
  assert.equal(w.m.positionalMember("admin"), null);
  /* the directory lists what a member sees below FULL: for the founder, nothing; the bare spelling names no member (R48) */
  assert.deepEqual(w.m.projectDirectory({ viewer: V("admin") }).projects, []);
  assert.equal(w.m.projectDirectory({ viewer: "admin" }).reason, "PROJECT_DIRECTORY_NEEDS_A_MEMBER");
  /* sight is not authority: the founder's spellings hold no position in a project (R55, R60) */
  assert.equal(w.m.projectAuthority("PROJ-H", V("admin"), "joined", "an act").code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  /* no other member id is widened: a member named like no roster row still sees no project */
  assert.equal(w.m.inSight("PROJ-H", V("admin2")), false);
  assert.equal(w.m.inSight("PROJ-H", V("Admin")), false);
});
