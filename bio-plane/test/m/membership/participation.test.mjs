import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

/* ann owns P; bob joined; cal invited; dee outside */
async function projectWorld() {
  const w = await world().group("ann", "bob", "cal", "dee");
  w.project("PROJ-P", "The P project");
  assert.equal(w.m.projectClaimOwner({ projectId: "PROJ-P", memberId: "ann" }).ok, true);
  w.m.projectInvite({ projectId: "PROJ-P", handle: "bob", by: "ann", viewer: V("ann") });
  w.m.projectJoin({ projectId: "PROJ-P", by: "bob", viewer: V("bob") });
  w.m.projectInvite({ projectId: "PROJ-P", handle: "cal", by: "ann", viewer: V("ann") });
  return w;
}

test("R31 projectClaimOwner: NO_SUCH_PROJECT, NOT_A_PROJECT, OWNED; the sole initial owner, joined", async () => {
  const w = await world().group("ann", "bob");
  w.bundle("INFO-1");
  w.project("PROJ-1");
  assert.equal(w.m.projectClaimOwner({ projectId: "NOPE", memberId: "ann" }).reason, "NO_SUCH_PROJECT");
  assert.equal(w.m.projectClaimOwner({ projectId: "INFO-1", memberId: "ann" }).reason, "NOT_A_PROJECT");
  assert.deepEqual(w.m.projectClaimOwner({ projectId: "PROJ-1", memberId: "ann" }), { ok: true, projectId: "PROJ-1", owner: "ann" });
  assert.equal(w.m.projectClaimOwner({ projectId: "PROJ-1", memberId: "bob" }).reason, "OWNED");
  assert.deepEqual(w.rows(`SELECT member_id, state, owner FROM project_participants`), [{ member_id: "ann", state: "joined", owner: 1 }]);
});

test("R32 projectInvite: NOT_THE_OWNER, NO_SUCH_HANDLE, NOT_ACTIVE, ALREADY_A_PARTICIPANT; records invited_by", async () => {
  const w = await projectWorld();
  await w.enrol("eve");
  w.m.memberSet({ memberId: "eve", status: "revoked", by: "admin" });
  assert.equal(w.m.projectInvite({ projectId: "PROJ-P", handle: "dee", by: "bob", viewer: V("bob") }).reason, "NOT_THE_OWNER");
  assert.equal(w.m.projectInvite({ projectId: "PROJ-P", handle: "dee", by: "second", viewer: V("second") }).reason, "NOT_THE_OWNER");
  assert.equal(w.m.projectInvite({ projectId: "PROJ-P", handle: "zed", by: "ann", viewer: V("ann") }).reason, "NO_SUCH_HANDLE");
  assert.equal(w.m.projectInvite({ projectId: "PROJ-P", handle: "eve", by: "ann", viewer: V("ann") }).reason, "NOT_ACTIVE");
  assert.equal(w.m.projectInvite({ projectId: "PROJ-P", handle: "cal", by: "ann", viewer: V("ann") }).reason, "ALREADY_A_PARTICIPANT");
  const ok = w.m.projectInvite({ projectId: "PROJ-P", handle: "dee", by: "ann", viewer: V("ann") });
  assert.deepEqual([ok.ok, ok.state], [true, "invited"]);
  assert.deepEqual(w.row(`SELECT state, owner, invited_by FROM project_participants WHERE member_id='dee'`),
    { state: "invited", owner: 0, invited_by: "ann" });
});

test("R33 an invitation closes the invitee's open request to join, granted, by the inviting owner", async () => {
  const w = await projectWorld();
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", by: "ann", viewer: V("ann") });
  assert.equal(w.m.projectRequest({ projectId: "PROJ-P", comment: "let me in", by: "dee", viewer: V("dee") }).ok, true);
  const inv = w.m.projectInvite({ projectId: "PROJ-P", handle: "dee", by: "ann", viewer: V("ann") });
  assert.equal(inv.request, "granted");
  const r = w.row(`SELECT state, closed_by FROM project_join_requests WHERE member_id='dee'`);
  assert.deepEqual(r, { state: "granted", closed_by: "ann" });
  assert.equal(w.rows(`SELECT * FROM project_join_requests WHERE state='open'`).length, 0);
});

test("R34 projectJoin: NOT_INVITED for a non-participant; joined, idempotent, withdraws a request to leave", async () => {
  const w = await projectWorld();
  assert.equal(w.m.projectJoin({ projectId: "PROJ-P", by: "dee", viewer: V("dee") }).reason, "NOT_INVITED");
  assert.equal(w.m.projectJoin({ projectId: "PROJ-P", by: "cal", viewer: V("cal") }).state, "joined");
  assert.equal(w.m.projectJoin({ projectId: "PROJ-P", by: "cal", viewer: V("cal") }).state, "joined");
  w.m.projectLeave({ projectId: "PROJ-P", by: "bob", comment: "busy", viewer: V("bob") });
  w.m.projectJoin({ projectId: "PROJ-P", by: "bob", viewer: V("bob") });
  assert.deepEqual(w.row(`SELECT state, comment FROM project_participants WHERE member_id='bob'`), { state: "joined", comment: null });
});

test("R35 projectLeave: records leaving with a comment, removes nobody; the last committed owner is refused", async () => {
  const w = await projectWorld();
  assert.equal(w.m.projectLeave({ projectId: "PROJ-P", by: "dee", viewer: V("dee") }).reason, "NOT_A_PARTICIPANT");
  assert.equal(w.m.projectLeave({ projectId: "PROJ-P", by: "cal", viewer: V("cal") }).reason, "NOT_JOINED");
  const l = w.m.projectLeave({ projectId: "PROJ-P", by: "bob", comment: "x".repeat(400), viewer: V("bob") });
  assert.deepEqual([l.ok, l.state, l.comment.length], [true, "leaving", 280]);
  assert.equal(w.rows(`SELECT * FROM project_participants WHERE project_id='PROJ-P'`).length, 3);
  const sole = w.m.projectLeave({ projectId: "PROJ-P", by: "ann", viewer: V("ann") });
  assert.equal(sole.reason, "LAST_COMMITTED_OWNER");
  // two owners: one may ask to leave; then the other, the last committed one, may not
  w.m.projectJoin({ projectId: "PROJ-P", by: "bob", viewer: V("bob") });
  assert.equal(w.m.projectOwnerAdd({ projectId: "PROJ-P", handle: "bob", by: "ann", viewer: V("ann") }).ok, true);
  assert.equal(w.m.projectLeave({ projectId: "PROJ-P", by: "bob", viewer: V("bob") }).ok, true);
  const last = w.m.projectLeave({ projectId: "PROJ-P", by: "ann", viewer: V("ann") });
  assert.deepEqual([last.reason, last.owners], ["LAST_COMMITTED_OWNER", ["ann", "bob"]]);
  assert.equal(w.row(`SELECT state FROM project_participants WHERE member_id='ann'`).state, "joined");
});

test("R36 R63 projectRemove: refusals; removes whether or not they asked; every removal kept and readable", async () => {
  const w = await projectWorld();
  assert.equal(w.m.projectRemove({ projectId: "PROJ-P", handle: "bob", by: "second", viewer: V("second") }).reason, "NOT_THE_OWNER");
  assert.equal(w.m.projectRemove({ projectId: "PROJ-P", handle: "bob", by: "cal", viewer: V("cal") }).reason, "NOT_THE_OWNER");
  assert.equal(w.m.projectRemove({ projectId: "PROJ-P", handle: "zed", by: "ann", viewer: V("ann") }).reason, "NO_SUCH_HANDLE");
  assert.equal(w.m.projectRemove({ projectId: "PROJ-P", handle: "dee", by: "ann", viewer: V("ann") }).reason, "NOT_A_PARTICIPANT");
  assert.equal(w.m.projectRemove({ projectId: "PROJ-P", handle: "ann", by: "ann", viewer: V("ann") }).reason, "OWNER");
  const r = w.m.projectRemove({ projectId: "PROJ-P", handle: "bob", by: "ann", comment: "did not show up", viewer: V("ann") });
  assert.deepEqual([r.ok, r.removed, r.comment], [true, true, "did not show up"]);
  assert.equal(w.m.projectRemove({ projectId: "PROJ-P", handle: "cal", by: "ann", viewer: V("ann") }).ok, true, "an invited one too");
  assert.equal(w.m.participation("PROJ-P", "bob"), null);
  for (const reader of ["ann", "second"]) {
    const rm = w.m.projectParticipants({ projectId: "PROJ-P", by: reader }).removals;
    assert.deepEqual(rm.map((x) => [x.handle, x.removedBy, x.reason]), [["bob", "ann", "did not show up"], ["cal", "ann", null]]);
    for (const x of rm) assert.match(x.at, /^\d{4}-/);
  }
});

test("R37 projectParticipants: a participant or an administrator reads every participant; others NO_SUCH_PROJECT", async () => {
  const w = await projectWorld();
  const p = w.m.projectParticipants({ projectId: "PROJ-P", by: "cal" });
  assert.deepEqual(p.participants.map((x) => [x.handle, x.state, x.owner]),
    [["ann", "joined", 1], ["bob", "joined", 0], ["cal", "invited", 0]]);
  for (const x of p.participants) assert.ok("comment" in x);
  assert.equal(w.m.projectParticipants({ projectId: "PROJ-P", by: "second" }).ok, true);
  assert.equal(w.m.projectParticipants({ projectId: "PROJ-P", by: "admin" }).ok, true);
  assert.equal(w.m.projectParticipants({ projectId: "PROJ-P", by: "dee" }).reason, "NO_SUCH_PROJECT");
  assert.equal(w.m.projectParticipants({ projectId: "NOPE", by: "dee" }).reason, "NO_SUCH_PROJECT");
});

test("R74 participation answers one member's state in one project and whether an owner, or null", async () => {
  const w = await projectWorld();
  w.m.projectLeave({ projectId: "PROJ-P", by: "bob", viewer: V("bob") });
  assert.deepEqual(w.m.participation("PROJ-P", "ann"), { state: "joined", owner: true });
  assert.deepEqual(w.m.participation("PROJ-P", "bob"), { state: "leaving", owner: false });
  assert.deepEqual(w.m.participation("PROJ-P", "cal"), { state: "invited", owner: false });
  assert.equal(w.m.participation("PROJ-P", "dee"), null);
  assert.equal(w.m.participation("PROJ-NEVER", "ann"), null);
  assert.equal(w.m.participation(null, undefined), null, "never throws");
});
