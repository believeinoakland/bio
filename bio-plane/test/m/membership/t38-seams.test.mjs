/* T38-4 (N783; K2270, K2271): the seams `project-roster` codes against — R118 `participationWrite`, R119 `memberByHandle`,
   R120 the read contract — and R121, N793's one site of `NO_SUCH_MEMBER` (K231). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { noSuchMember, MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

async function projectWorld() {
  const w = await world().group("ann", "bob", "cal", "dee");
  w.project("PROJ-P", "The P project");
  w.m.projectClaimOwner({ projectId: "PROJ-P", memberId: "ann" });
  return w;
}
const row = (w, member) => w.row(`SELECT state, owner, owner_order, invited_by, comment, created, updated
                                   FROM project_participants WHERE project_id='PROJ-P' AND member_id=?`, member);
const all = (w) => JSON.stringify(w.rows(`SELECT * FROM project_participants ORDER BY project_id, member_id`));

test("R118 participationWrite invite: adds the member invited, not an owner, invited_by by, created and updated at; never twice", async () => {
  const w = await projectWorld();
  assert.equal(w.m.participationWrite("invite", { projectId: "PROJ-P", memberId: "bob", by: "ann", at: "2026-10-08T00:00:00.000Z" }), true);
  assert.deepEqual(row(w, "bob"), { state: "invited", owner: 0, owner_order: null, invited_by: "ann", comment: null,
                                   created: "2026-10-08T00:00:00.000Z", updated: "2026-10-08T00:00:00.000Z" });
  const before = all(w);
  assert.equal(w.m.participationWrite("invite", { projectId: "PROJ-P", memberId: "bob", by: "cal", at: "2027-01-01" }), false);
  assert.equal(w.m.participationWrite("invite", { projectId: "PROJ-P", memberId: "ann", by: "cal" }), false, "the owner's row exists");
  assert.equal(all(w), before, "a refused write writes nothing");
  /* It asks nothing: its caller has made every check (a member not active, a project not held). */
  assert.equal(w.m.participationWrite("invite", { projectId: "PROJ-NEVER", memberId: "zed", by: "x" }), true);
});

test("R118 participationWrite ownerOn and ownerOff: an existing participant's flag, next in R65's order; off keeps them a participant; false for none", async () => {
  const w = await projectWorld();
  for (const id of ["bob", "cal"]) {
    w.m.participationWrite("invite", { projectId: "PROJ-P", memberId: id, by: "ann" });
    w.m.projectJoin({ projectId: "PROJ-P", by: id, viewer: V(id) });
  }
  assert.equal(w.m.participationWrite("ownerOn", { projectId: "PROJ-P", memberId: "cal", at: "t1" }), true);
  assert.equal(w.m.participationWrite("ownerOn", { projectId: "PROJ-P", memberId: "bob", at: "t2" }), true);
  assert.deepEqual(w.m.projectOwners("PROJ-P"), ["ann", "cal", "bob"], "each next in R65's order");
  assert.deepEqual([row(w, "cal").owner_order, row(w, "cal").updated, row(w, "bob").owner_order], [2, "t1", 3]);
  assert.equal(w.m.participationWrite("ownerOff", { projectId: "PROJ-P", memberId: "cal", at: "t3" }), true);
  assert.deepEqual(w.m.participation("PROJ-P", "cal"), { state: "joined", owner: false });
  assert.deepEqual([row(w, "cal").owner_order, row(w, "cal").updated], [null, "t3"]);
  assert.deepEqual(w.m.projectOwners("PROJ-P"), ["ann", "bob"]);
  const before = all(w);
  assert.equal(w.m.participationWrite("ownerOn", { projectId: "PROJ-P", memberId: "dee" }), false);
  assert.equal(w.m.participationWrite("ownerOff", { projectId: "PROJ-P", memberId: "dee" }), false);
  assert.equal(all(w), before);
});

test("R118 participationWrite rescue: a joined owner next in order, the row added with invited_by and comment, no other row changed", async () => {
  const w = await projectWorld();
  w.m.participationWrite("invite", { projectId: "PROJ-P", memberId: "bob", by: "ann", at: "t0" });
  const others = () => JSON.stringify(w.rows(`SELECT * FROM project_participants WHERE member_id <> 'dee' AND member_id <> 'bob'`));
  const o = others();
  assert.equal(w.m.participationWrite("rescue", { projectId: "PROJ-P", memberId: "dee", by: "second", comment: "stranded", at: "t1" }), true);
  assert.deepEqual(row(w, "dee"), { state: "joined", owner: 1, owner_order: 2, invited_by: "second", comment: "stranded",
                                   created: "t1", updated: "t1" });
  /* A member holding a row: made a joined owner, next in order; invited_by, comment and created stay theirs. */
  assert.equal(w.m.participationWrite("rescue", { projectId: "PROJ-P", memberId: "bob", by: "second", comment: "why", at: "t2" }), true);
  assert.deepEqual(row(w, "bob"), { state: "joined", owner: 1, owner_order: 3, invited_by: "ann", comment: null,
                                   created: "t0", updated: "t2" });
  assert.equal(others(), o, "no other row changed");
  assert.deepEqual(w.m.projectOwners("PROJ-P"), ["ann", "dee", "bob"]);
});

test("R118 participationWrite: false and nothing written for any other kind or a malformed call; never throws", async () => {
  const w = await projectWorld();
  const before = all(w);
  for (const [kind, args] of [["remove", { projectId: "PROJ-P", memberId: "ann" }], ["join", { projectId: "PROJ-P", memberId: "bob" }],
                              [null, { projectId: "PROJ-P", memberId: "bob" }], ["invite", {}], ["invite", { projectId: "PROJ-P" }],
                              ["invite", { projectId: 7, memberId: "bob" }], ["invite", undefined]])
    assert.equal(w.m.participationWrite(kind, args), false, `${kind} ${JSON.stringify(args)}`);
  assert.equal(w.m.participationWrite("invite", null), false);
  assert.equal(all(w), before);
});

test("R119 memberByHandle: {member_id, handle, status} for the exact handle, else null; writes nothing, never throws", async () => {
  const w = await projectWorld();
  w.m.memberSet({ memberId: "cal", status: "revoked", by: "admin" });
  assert.deepEqual(w.m.memberByHandle("bob"), { member_id: "bob", handle: "bob", status: "active" });
  assert.deepEqual(w.m.memberByHandle("cal"), { member_id: "cal", handle: "cal", status: "revoked" });
  for (const h of ["BOB", " bob", "bo", "zed", "", null, undefined, 7, {}]) assert.equal(w.m.memberByHandle(h), null, String(h));
  /* R32 and R36 resolve through it: an unknown handle is NO_SUCH_HANDLE. */
  assert.equal(w.m.projectInvite({ projectId: "PROJ-P", handle: "BOB", by: "ann", viewer: V("ann") }).reason, "NO_SUCH_HANDLE");
});

test("R120 the read contract: the stated tables and columns exist under those names and types, keyed as stated", async () => {
  const w = await projectWorld();
  const contract = {
    members: { member_id: "TEXT", handle: "TEXT", status: "TEXT" },
    project_participants: { project_id: "TEXT", member_id: "TEXT", state: "TEXT", owner: "INTEGER", owner_order: "INTEGER",
                            comment: "TEXT", created: "TEXT" },
    project_sight: { project_id: "TEXT", setting: "TEXT" },
    project_visibility: { seq: "INTEGER", project_id: "TEXT", setting: "TEXT", set_by: "TEXT", reason: "TEXT", at: "TEXT" },
    project_removals: { seq: "INTEGER", project_id: "TEXT", member_id: "TEXT", removed_by: "TEXT", comment: "TEXT", at: "TEXT" },
  };
  for (const [table, cols] of Object.entries(contract)) {
    const have = new Map(w.rows(`PRAGMA table_info(${table})`).map((c) => [c.name, c.type]));
    for (const [c, type] of Object.entries(cols)) assert.equal(have.get(c), type, `${table}.${c}`);
  }
  /* Their meaning, read as a later module joins them: a removal and a visibility act appear as stated. */
  w.m.projectInvite({ projectId: "PROJ-P", handle: "bob", by: "ann", viewer: V("ann") });
  w.m.projectRemove({ projectId: "PROJ-P", handle: "bob", by: "ann", comment: "gone", viewer: V("ann") });
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", reason: "open", by: "ann", viewer: V("ann") });
  assert.deepEqual(w.row(`SELECT r.project_id, r.member_id, r.removed_by, r.comment FROM project_removals r`),
    { project_id: "PROJ-P", member_id: "bob", removed_by: "ann", comment: "gone" });
  assert.deepEqual(w.row(`SELECT v.project_id, v.setting, v.set_by, v.reason FROM project_visibility v`),
    { project_id: "PROJ-P", setting: "discoverable", set_by: "ann", reason: "open" });
  assert.deepEqual(w.row(`SELECT s.setting FROM project_sight s WHERE s.project_id='PROJ-P'`), { setting: "discoverable" });
  assert.deepEqual(w.rows(`SELECT p.member_id, p.state, p.owner, p.owner_order FROM project_participants p
                             JOIN members m ON m.member_id = p.member_id WHERE m.status = 'active'`),
    [{ member_id: "ann", state: "joined", owner: 1, owner_order: 1 }]);
});

test("R121 N793 noSuchMember is the one site of NO_SUCH_MEMBER: its row C-96.39, the id as asked, a fixed detail, extra beside never replacing; never throws", () => {
  const row = MEMBERSHIP_CHECKS.NO_SUCH_MEMBER;
  assert.equal(row.check, "C-96.39");
  assert.match(row.where, /noSuchMember > is-no-such-member$/);
  const r = noSuchMember("zed");
  assert.deepEqual(Object.keys(r).sort(), ["check", "code", "detail", "member", "ok", "reason", "translation"]);
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.member], [false, "NO_SUCH_MEMBER", "NO_SUCH_MEMBER", "C-96.39", row.translation, "zed"]);
  assert.equal(noSuchMember(undefined).member, null);
  assert.equal(noSuchMember(null, { task: "T-1" }).detail, r.detail, "one fixed sentence for every caller");
  const x = noSuchMember("zed", { task: "T-1", reason: "MINE", detail: "mine", member: "other", ok: true });
  assert.deepEqual([x.task, x.reason, x.detail, x.member, x.ok], ["T-1", "NO_SUCH_MEMBER", r.detail, "zed", false]);
  const hostile = { get boom() { throw new Error("x"); } };
  Object.defineProperty(hostile, "boom", { enumerable: true, get() { throw new Error("x"); } });
  assert.doesNotThrow(() => noSuchMember({ toString() { throw new Error("y"); } }, hostile));
  assert.equal(noSuchMember("a", [1]).reason, "NO_SUCH_MEMBER");
});

test("R121 N793 every act of this module refusing an unknown member answers through noSuchMember, byte for byte", async () => {
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
