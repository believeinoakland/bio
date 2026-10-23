/* R77, R78 (T51; K4169; UC-046): the decisions the record owes an administrator, read. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { threeAdmins, snapshot } from "./fixture.mjs";

/* a fourth administrator proposed by `by`: the proposer's own endorsement is recorded (R11) */
const propose = (w, id, by = "admin") => w.m.memberAdd({ memberId: id, cover: `cover of ${id}`, role: "admin", by });

test("R77 endorsementsOwed: a proposal with two of three endorsements lists for the one who has not, then clears when she endorses", async () => {
  const w = await threeAdmins("ann");
  await propose(w, "fourth");
  await w.m.adminEndorse({ memberId: "fourth", by: "second" });          // admin and second have endorsed; third has not
  const owed = w.m.endorsementsOwed({ by: "third" });
  assert.equal(owed.length, 1);
  assert.deepEqual({ ...owed[0], proposed_at: typeof owed[0].proposed_at }, {
    memberId: "fourth", handle: null, proposed_by: "admin", proposed_at: "string",
    have: ["admin", "second"], awaiting: ["third"] });
  assert.match(owed[0].proposed_at, /^\d{4}-\d\d-\d\dT/);
  const before = snapshot(w);
  w.m.endorsementsOwed({ by: "third" });
  assert.equal(snapshot(w), before, "it writes nothing");
  /* controls: those who have endorsed, the proposer, and callers who are not administrators are listed nothing */
  for (const by of ["admin", "second"]) assert.deepEqual(w.m.endorsementsOwed({ by }), [], `${by} has endorsed`);
  for (const by of ["ann", "nobody", null, undefined, "", "class:admin", "member:third"]) assert.deepEqual(w.m.endorsementsOwed({ by }), [], `${by} is not an administrator`);
  assert.deepEqual(w.m.endorsementsOwed(), [], "no argument");
  await w.m.adminEndorse({ memberId: "fourth", by: "third" });           // consensus: the fourth is invited
  assert.deepEqual(w.m.endorsementsOwed({ by: "third" }), [], "the member is no longer proposed");
});

test("R77 the founder owes endorsements too; a proposal she made herself, and a proposal at any other status, are not listed", async () => {
  const w = await threeAdmins();
  await propose(w, "fourth", "second");                                   // second proposes: second's own endorsement is recorded
  await propose(w, "fifth", "second");
  assert.deepEqual(w.m.endorsementsOwed({ by: "second" }), [], "control: she proposed both herself");
  w.sql.exec(`UPDATE members SET created='2026-01-01T00:00:00.000Z' WHERE member_id='fourth'`);   // one instant each, fourth the older
  w.sql.exec(`UPDATE members SET created='2026-01-02T00:00:00.000Z' WHERE member_id='fifth'`);
  assert.deepEqual(w.m.endorsementsOwed({ by: "admin" }).map((r) => r.memberId), ["fourth", "fifth"]);
  /* a proposal whose proposer's own endorsement is not recorded (an unrecorded proposer) is still not owed by the proposer */
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='fifth'`);
  assert.deepEqual(w.m.endorsementsOwed({ by: "admin" }).map((r) => r.memberId), ["fourth"], "control: a revoked row is no proposal");
  w.sql.exec(`DELETE FROM admin_votes WHERE target='fourth' AND voter='second'`);
  assert.deepEqual(w.m.endorsementsOwed({ by: "second" }), [], "control: the proposer owes none for her own proposal even when her vote row is gone");
});

test("R77 oldest proposal first, then by member id; at most 50, with truncated published", async () => {
  const w = await threeAdmins();
  const put = (id, created) => w.sql.exec(`INSERT INTO members (member_id,cover,role,status,created,updated,invited_by) VALUES (?,?, 'admin','proposed',?,?, 'second')`, id, id, created, created);
  put("zed", "2026-01-01T00:00:00.000Z"); put("amy", "2026-01-02T00:00:00.000Z"); put("bea", "2026-01-02T00:00:00.000Z");
  assert.deepEqual(w.m.endorsementsOwed({ by: "admin" }).map((r) => r.memberId), ["zed", "amy", "bea"]);
  assert.equal(w.m.endorsementsOwed({ by: "admin" }).truncated, false);
  assert.deepEqual(Object.keys(w.m.endorsementsOwed({ by: "admin" })), ["0", "1", "2"], "truncated is not enumerable");
  for (let i = 0; i < 47; i++) put(`p${String(i).padStart(2, "0")}`, `2026-02-01T00:00:${String(i).padStart(2, "0")}.000Z`);
  let owed = w.m.endorsementsOwed({ by: "admin" });
  assert.deepEqual([owed.length, owed.truncated], [50, false], "exactly 50 is not truncated");
  put("one-more", "2026-03-01T00:00:00.000Z");
  owed = w.m.endorsementsOwed({ by: "admin" });
  assert.deepEqual([owed.length, owed.truncated, owed.at(-1).memberId], [50, true, "p46"]);
  assert.deepEqual(w.m.endorsementsOwed({ by: "ann" }), [], "control: a non-administrator's answer is the plain []");
});

test("R77 a read that fails answers []", async () => {
  const w = await threeAdmins();
  w.sql.exec(`DROP TABLE admin_votes`);
  await assert.doesNotReject(async () => assert.deepEqual(w.m.endorsementsOwed({ by: "admin" }), []));
});

test("R78 expertiseAwaitingConfirmation: a declared label lists; confirmed or withdrawn it does not; declared again it lists again", async () => {
  const w = await threeAdmins("ann", "bob");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  w.m.expertiseDeclare({ memberId: "bob", label: "Architect" });
  w.m.expertiseDeclare({ memberId: "ann", label: "Lawyer" });
  w.sql.exec(`UPDATE member_expertise SET created = printf('2026-01-0%dT00:00:00.000Z', seq)`);   // one instant each, in the order declared
  const list = () => w.m.expertiseAwaitingConfirmation({ by: "second" }).map((r) => [r.memberId, r.label]);
  assert.deepEqual(list(), [["ann", "CPA"], ["bob", "Architect"], ["ann", "Lawyer"]], "oldest declaration first");
  const first = w.m.expertiseAwaitingConfirmation({ by: "admin" })[0];
  assert.deepEqual({ ...first, declared_at: typeof first.declared_at }, { memberId: "ann", handle: "ann", label: "CPA", declared_at: "string" });
  const before = snapshot(w);
  w.m.expertiseAwaitingConfirmation({ by: "second" });
  assert.equal(snapshot(w), before, "it writes nothing");
  w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" });
  assert.deepEqual(list(), [["bob", "Architect"], ["ann", "Lawyer"]], "a confirmed label is not awaiting");
  w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin", withdraw: true });
  assert.deepEqual(list(), [["bob", "Architect"], ["ann", "Lawyer"]], "a withdrawn label is not awaiting");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  assert.deepEqual(list().at(-1), ["ann", "CPA"], "declared again, it lists again");
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.deepEqual(list().map((r) => r[0]), ["ann", "ann"], "control: a revoked member's declaration is not awaiting");
});

test("R78 the founder's declaration is awaiting like a member's; ordering ties break by member id and label", async () => {
  const w = await threeAdmins();
  w.m.founderHandleSet({ handle: "steward", by: "admin" });
  const at = "2026-01-05T00:00:00.000Z";
  w.m.expertiseDeclare({ memberId: "admin", label: "Civil Engineer" });
  w.m.expertiseDeclare({ memberId: "second", label: "Zoning" });
  w.m.expertiseDeclare({ memberId: "second", label: "Accounting" });
  w.sql.exec(`UPDATE member_expertise SET created=?`, at);
  assert.deepEqual(w.m.expertiseAwaitingConfirmation({ by: "third" }).map((r) => [r.memberId, r.handle, r.label]),
    [["admin", "steward", "Civil Engineer"], ["second", "second", "Accounting"], ["second", "second", "Zoning"]]);
});

test("R78 controls: a non-administrator, a machine credential and an absent by get []; at most 50 with truncated; a failed read is []", async () => {
  const w = await threeAdmins("ann");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  for (const by of ["ann", "nobody", null, undefined, "", "class:admin"]) assert.deepEqual(w.m.expertiseAwaitingConfirmation({ by }), [], `${by}`);
  assert.deepEqual(w.m.expertiseAwaitingConfirmation(), []);
  for (let i = 0; i < 50; i++) w.sql.exec(`INSERT INTO member_expertise (member_id,label,event,actor,created) VALUES ('ann',?,'declared','ann',?)`, `L${String(i).padStart(2, "0")}`, `2026-02-01T00:00:${String(i).padStart(2, "0")}.000Z`);
  const owed = w.m.expertiseAwaitingConfirmation({ by: "admin" });
  assert.deepEqual([owed.length, owed.truncated], [50, true]);
  const broken = await threeAdmins();
  broken.sql.exec(`DROP TABLE member_expertise`);
  assert.deepEqual(broken.m.expertiseAwaitingConfirmation({ by: "admin" }), []);
});
