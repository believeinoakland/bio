import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { Membership } from "../../../src/membership/index.mjs";

/* founder + second + third (a proposed third needs both to endorse) */
async function threeAdmins() {
  const w = await world().group();
  const p = await w.m.memberAdd({ memberId: "third", cover: "c3", role: "admin", by: "admin" });
  assert.equal(p.reason, "CONSENSUS_REQUIRED");
  const e = await w.m.adminEndorse({ memberId: "third", by: "second" });
  await w.m.enroll({ invite: e.invite, handle: "third", password: "third-passphrase-x" });
  return w;
}

test("R6 adminEndorse: refusals in order; consensus; the last endorsement invites once", async () => {
  const w = await world().group("ann");
  assert.equal((await w.m.adminEndorse({ memberId: "nobody", by: "admin" })).reason, "NO_SUCH_MEMBER");
  assert.equal((await w.m.adminEndorse({ memberId: "ann", by: "admin" })).reason, "NOT_PROPOSED");
  const p = await w.m.memberAdd({ memberId: "third", cover: "c3", role: "admin", by: "admin" });
  assert.deepEqual([p.reason, p.have, p.awaiting], ["CONSENSUS_REQUIRED", ["admin"], ["second"]]);
  assert.equal((await w.m.adminEndorse({ memberId: "third", by: "ann" })).reason, "NOT_AN_ADMIN");
  assert.equal((await w.m.adminEndorse({ memberId: "third", by: null })).reason, "NOT_AN_ADMIN");
  const e = await w.m.adminEndorse({ memberId: "third", by: "second" });
  assert.equal(e.ok, true);
  assert.match(e.invite, /^[0-9a-f]{32}$/);
  assert.deepEqual(e.endorsedBy, ["admin", "second"]);
  const row = w.row(`SELECT status, status_by FROM members WHERE member_id='third'`);
  assert.deepEqual(row, { status: "invited", status_by: "second" });
  assert.equal((await w.m.adminEndorse({ memberId: "third", by: "admin" })).reason, "NOT_PROPOSED", "returned once");
  // the refusal while awaiting
  const q = await w.m.memberAdd({ memberId: "fourth", cover: "c4", role: "admin", by: "second" });
  const r = await w.m.adminEndorse({ memberId: "fourth", by: "second" });
  assert.deepEqual([q.have, r.reason, r.have, r.awaiting], [["second"], "CONSENSUS_REQUIRED", ["second"], ["admin"]]);
});

test("R7 adminRemove: every refusal, in order, and VOTES_SHORT until a majority of all", async () => {
  const w0 = await world().group("ann");
  const root = w0.m.adminRemove({ memberId: "admin", by: "second", reason: "r" });
  assert.equal(root.reason, "ROOT_OF_TRUST");
  assert.match(root.detail, /hosting account/);
  assert.equal(w0.m.adminRemove({ memberId: "nobody", by: "second", reason: "r" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w0.m.adminRemove({ memberId: "ann", by: "second", reason: "r" }).reason, "TARGET_NOT_AN_ADMIN");
  assert.equal(w0.m.adminRemove({ memberId: "second", by: "second", reason: "r" }).reason, "TARGET_CANNOT_VOTE");
  assert.equal(w0.m.adminRemove({ memberId: "second", by: "ann", reason: "r" }).reason, "NOT_AN_ADMIN");
  assert.equal(w0.m.adminRemove({ memberId: "second", by: "admin", reason: " " }).reason, "NO_REASON");
  const two = w0.m.adminRemove({ memberId: "second", by: "admin", reason: "r" });
  assert.equal(two.reason, "IMPOSSIBLE_AT_TWO");
  assert.equal(two.possible, false);
  const w = await threeAdmins();
  const v1 = w.m.adminRemove({ memberId: "third", by: "admin", reason: "one" });
  assert.deepEqual([v1.reason, v1.have, v1.need, v1.deciders], ["VOTES_SHORT", 1, 2, ["admin"]]);
  assert.equal(w.m.adminRemove({ memberId: "third", by: "admin", reason: "again" }).reason, "ALREADY_VOTED");
  const v2 = w.m.adminRemove({ memberId: "third", by: "second", reason: "two" });
  assert.equal(v2.ok, true);
  assert.deepEqual(v2.deciders, ["admin", "second"]);
});

test("R8 a carried removal revokes, ends sessions and keys in one act, and keeps votes and reasons", async () => {
  const w = await threeAdmins();
  const tok = (await w.m.login({ role: "member:third", password: "third-passphrase-x" })).token;
  w.m.signerAdd({ keyB64: "AAAAthirdkey", memberId: "third", by: "admin" });
  w.m.adminRemove({ memberId: "third", by: "admin", reason: "one" });
  const r = w.m.adminRemove({ memberId: "third", by: "second", reason: "two" });
  assert.deepEqual([r.ok, r.removed, r.reasons], [true, true, ["one", "two"]]);
  assert.match(r.alsoDo, /ADMIN_TOKEN|hosting/);
  assert.deepEqual(w.row(`SELECT status, status_by FROM members WHERE member_id='third'`),
    { status: "revoked", status_by: "second" });
  assert.equal(w.m.session(tok), null);
  assert.equal(w.row(`SELECT status FROM signers WHERE key_b64='AAAAthirdkey'`).status, "revoked");
  assert.equal(w.rows(`SELECT * FROM admin_votes WHERE kind='remove' AND target='third'`).length, 2);
});

test("R9 memberCaps: refusals in order and exact replacement", async () => {
  const w = await world().group("ann");
  assert.equal(w.m.memberCaps({ memberId: "nobody", capabilities: [], by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.m.memberCaps({ memberId: "nobody", capabilities: [], by: "admin" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.m.memberCaps({ memberId: "ann", capabilities: "publish", by: "admin" }).reason, "BAD_CAPABILITY");
  const bad = w.m.memberCaps({ memberId: "ann", capabilities: ["publish", "fly"], by: "admin" });
  assert.deepEqual([bad.reason, bad.got, bad.known], ["BAD_CAPABILITY", ["fly"], Membership.CAPABILITIES]);
  assert.equal(w.m.memberCaps({ memberId: "ann", capabilities: ["administer"], by: "admin" }).reason, "NOT_A_CAPABILITY_GRANT");
  assert.equal(w.m.memberCaps({ memberId: "second", capabilities: ["publish"], by: "admin" }).reason, "NOT_A_CAPABILITY_GRANT");
  const ok = w.m.memberCaps({ memberId: "ann", capabilities: ["publish"], by: "second" });
  assert.deepEqual([ok.ok, ok.capabilities, ok.by], [true, ["publish"], "second"]);
  assert.deepEqual(w.m.memberList({}).members.find((x) => x.member_id === "ann").capabilities, ["publish"]);
});

test("R10 an administrator (not the founder) resigns while more than two exist; at two refused", async () => {
  const w = await threeAdmins();
  await w.enrol("ann");
  assert.equal(w.m.adminResign({ by: "admin" }).reason, "ROOT_OF_TRUST");
  assert.equal(w.m.adminResign({ by: "ann" }).reason, "NOT_AN_ADMIN");
  const r = w.m.adminResign({ by: "third" });
  assert.deepEqual([r.ok, r.role, r.administrators], [true, "member", 2]);
  assert.deepEqual(w.row(`SELECT role, status, status_by FROM members WHERE member_id='third'`),
    { role: "member", status: "active", status_by: "third" });
  assert.equal(w.m.isAdministrator("third"), false);
  const two = w.m.adminResign({ by: "second" });
  assert.deepEqual([two.reason, two.administrators], ["RESIGN_AT_TWO", 2]);
  assert.equal(w.m.isAdministrator("second"), true);
  assert.equal(w.ops("by=second").adminresign().reason, "RESIGN_AT_TWO");
});

test("R11 adding the second administrator asks who holds hosting access; the record keeps the answer", async () => {
  const w = world();
  await w.claim();
  const second = await w.m.memberAdd({ memberId: "second", cover: "c2", role: "admin", by: "admin" });
  assert.equal(second.hostingAccess.asked, true);
  assert.match(second.hostingAccess.question, /hosting/);
  await w.m.enroll({ invite: second.invite, handle: "second", password: "second-passphrase-x" });
  const ann = await w.m.memberAdd({ memberId: "ann", cover: "ca", by: "admin" });
  assert.equal(ann.hostingAccess, undefined, "asked at the second administrator, not at every addition");
  assert.equal(w.m.hostingAccessSet({ holders: "x", by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.m.hostingAccessSet({ holders: " ", by: "admin" }).reason, "NO_HOLDERS");
  const s = w.m.hostingAccessSet({ holders: "admin and second", note: "both have the login", by: "second" });
  assert.equal(s.ok, true);
  w.ops("by=admin", { holders: "admin only" }).hostingaccessset();
  const h = w.ops().hostingaccess();
  assert.equal(h.recorded, true);
  assert.equal(h.current.holders, "admin only");
  assert.deepEqual(h.history.map((x) => [x.holders, x.recorded_by]), [["admin and second", "second"], ["admin only", "admin"]]);
});

test("R20 memberSet: refusals in order; revocation ends sessions and keys; reactivating an admin demotes", async () => {
  const w = await threeAdmins();
  await w.enrol("ann");
  assert.equal(w.m.memberSet({ memberId: "ann", status: "revoked", by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.m.memberSet({ memberId: "ann", status: "gone", by: "admin" }).reason, "BAD_STATUS");
  assert.equal(w.m.memberSet({ memberId: "nobody", status: "revoked", by: "admin" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.m.memberSet({ memberId: "third", status: "revoked", by: "admin" }).reason, "ADMIN_REQUIRES_VOTE");
  const tok = (await w.m.login({ role: "member:ann", password: "ann-passphrase-x" })).token;
  w.m.signerAdd({ keyB64: "AAAAannkey", memberId: "ann", by: "admin" });
  const r = w.m.memberSet({ memberId: "ann", status: "revoked", by: "second" });
  assert.deepEqual([r.ok, r.by], [true, "second"]);
  assert.equal(w.m.session(tok), null);
  assert.equal(w.row(`SELECT status, status_by FROM signers WHERE key_b64='AAAAannkey'`).status, "revoked");
  assert.equal(w.row(`SELECT status_by FROM members WHERE member_id='ann'`).status_by, "second");
  // a revoked administrator (by vote) reactivated returns as an ordinary member
  w.m.adminRemove({ memberId: "third", by: "admin", reason: "a" });
  w.m.adminRemove({ memberId: "third", by: "second", reason: "b" });
  const back = w.m.memberSet({ memberId: "third", status: "active", by: "admin" });
  assert.deepEqual([back.ok, back.demoted], [true, true]);
  assert.deepEqual(w.row(`SELECT role, status FROM members WHERE member_id='third'`), { role: "member", status: "active" });
});

test("R57 a member row is never deleted: revocation keeps the handle and history", async () => {
  const w = await world().group("ann");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  const row = w.row(`SELECT * FROM members WHERE member_id='ann'`);
  assert.deepEqual([row.status, row.handle, row.cover], ["revoked", "ann", "cover of ann"]);
  assert.equal(w.m.expertiseList({ memberId: "ann" }).expertise.length, 1);
  const services = Object.getOwnPropertyNames(Membership.prototype);
  for (const name of services) assert.doesNotMatch(String(Membership.prototype[name]), /DELETE FROM members\b/, name);
});

test("R58 every status write records the actor whose act caused it; an unstamped row reads not recorded", async () => {
  const w = world();
  await w.claim();
  const s = await w.m.memberAdd({ memberId: "second", cover: "c", role: "admin", by: "admin" });
  assert.equal(w.row(`SELECT status_by FROM members WHERE member_id='second'`).status_by, "admin");      // R13
  await w.m.enroll({ invite: s.invite, handle: "second", password: "second-passphrase-x" });
  assert.equal(w.row(`SELECT status_by FROM members WHERE member_id='second'`).status_by, "second");     // R16
  await w.m.memberAdd({ memberId: "ann", cover: "c", by: "second" });
  assert.equal(w.row(`SELECT status_by FROM members WHERE member_id='ann'`).status_by, "second");
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  assert.equal(w.row(`SELECT status_by FROM members WHERE member_id='ann'`).status_by, "admin");         // R20
  w.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('old','c','member','active','t','t')`);
  const old = w.m.memberList({}).members.find((x) => x.member_id === "old");
  assert.deepEqual([old.status_by, old.invited_by], ["not recorded", "not recorded"]);
  assert.equal(w.row(`SELECT status_by FROM members WHERE member_id='old'`).status_by, null, "never back-filled");
});
