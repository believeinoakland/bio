/* T38-4 (N793; K2270, K2271): R49, N793's one site of `NO_SUCH_MEMBER` (K231). (The seams `project-roster` codes against
   other than `memberByHandle`, R48, are `membership`'s or tested with the roster.) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { noSuchMember } from "../../../src/member-roster/index.mjs";
import { MEMBER_ROSTER_ROWS } from "../../../src/member-roster/checks.mjs";
const { MEMBERSHIP_CHECKS } = MEMBER_ROSTER_ROWS;

test("R49 N793 noSuchMember is the one site of NO_SUCH_MEMBER: its row C-96.47, the id as asked, a fixed detail, extra beside never replacing; never throws", () => {
  const row = MEMBERSHIP_CHECKS.NO_SUCH_MEMBER;
  assert.equal(row.check, "C-96.47");
  assert.match(row.where, /noSuchMember > is-no-such-member$/);
  const r = noSuchMember("zed");
  assert.deepEqual(Object.keys(r).sort(), ["check", "code", "detail", "member", "ok", "reason", "translation"]);
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.member], [false, "NO_SUCH_MEMBER", "NO_SUCH_MEMBER", "C-96.47", row.translation, "zed"]);
  assert.equal(noSuchMember(undefined).member, null);
  assert.equal(noSuchMember(null, { task: "T-1" }).detail, r.detail, "one fixed sentence for every caller");
  const x = noSuchMember("zed", { task: "T-1", reason: "MINE", detail: "mine", member: "other", ok: true });
  assert.deepEqual([x.task, x.reason, x.detail, x.member, x.ok], ["T-1", "NO_SUCH_MEMBER", r.detail, "zed", false]);
  const hostile = { get boom() { throw new Error("x"); } };   // an enumerable getter that throws
  assert.doesNotThrow(() => noSuchMember({ toString() { throw new Error("y"); } }, hostile));
  assert.equal(noSuchMember("a", [1]).reason, "NO_SUCH_MEMBER");
});

test("R49 N793 every act of this module refusing an unknown member answers through noSuchMember, byte for byte", async () => {
  const w = await world().group("ann");
  await w.enrol("adm2", "admin");
  const same = (r) => assert.deepEqual(r, noSuchMember("ghost"), JSON.stringify(r));
  same(w.m.memberPairingSet({ memberId: "ghost", published: true, by: "admin" }));
  same(w.m.expertiseDeclare({ memberId: "ghost", label: "CPA" }));
  same(w.m.expertiseConfirm({ memberId: "ghost", label: "CPA", by: "admin" }));
  same(w.m.memberCaps({ memberId: "ghost", capabilities: ["publish"], by: "second" }));
  same(await w.m.adminEndorse({ memberId: "ghost", by: "second" }));
  same(w.m.adminRemove({ memberId: "ghost", by: "second", reason: "r" }));
  same(w.m.memberSet({ memberId: "ghost", status: "revoked", by: "second" }));
  same(w.m.inviteWithdraw({ memberId: "ghost", by: "second" }));
});
