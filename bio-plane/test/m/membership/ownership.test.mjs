import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Membership } from "../../../src/membership/index.mjs";

/* P owned by ann; bob, cal, dee joined; eve invited */
async function owned() {
  const w = await world().group("ann", "bob", "cal", "dee", "eve");
  w.project("PROJ-P");
  w.m.projectClaimOwner({ projectId: "PROJ-P", memberId: "ann" });
  for (const h of ["bob", "cal", "dee", "eve"]) w.m.projectInvite({ projectId: "PROJ-P", handle: h, by: "ann", viewer: V("ann") });
  for (const h of ["bob", "cal", "dee"]) w.m.projectJoin({ projectId: "PROJ-P", by: h, viewer: V(h) });
  return w;
}
const add = (w, handle, by) => w.m.projectOwnerAdd({ projectId: "PROJ-P", handle, by, viewer: V(by) });
const rem = (w, handle, by, reason = "because") => w.m.projectOwnerRemove({ projectId: "PROJ-P", handle, by, reason, viewer: V(by) });

test("R38 ownerMath and projectOwnerArithmetic, the live row absent to a viewer who cannot see", async () => {
  assert.deepEqual([0, 1].map((n) => Membership.ownerMath(n).possible), [false, false]);
  assert.deepEqual(Membership.ownerMath(1).votesNeeded, 0);
  const two = Membership.ownerMath(2);
  assert.deepEqual([two.votesNeeded, two.eligibleVoters, two.targetMayVote, two.possible], [2, 2, true, true]);
  for (let n = 3; n <= 12; n++) {
    const o = Membership.ownerMath(n), a = Membership.adminMath(n);
    assert.deepEqual([o.owners, o.votesNeeded, o.eligibleVoters, o.possible, o.targetMayVote],
      [n, a.votesNeeded, a.eligibleVoters, a.possible, false]);
  }
  const w = await owned();
  add(w, "bob", "ann");
  const seen = w.m.projectOwnerArithmetic({ projectId: "PROJ-P", viewer: V("cal") });
  assert.deepEqual(seen.table, [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => Membership.ownerMath(n)));
  assert.deepEqual(seen.live, Membership.ownerMath(2));
  assert.deepEqual(w.m.projectOwnerArithmetic({ projectId: "PROJ-P", viewer: V("zed") }).live, Membership.ownerMath(0));
});

test("R39 projectOwnerAdd: refusals; an invited or leaving member is NOT_A_PARTICIPANT; the sole owner adds alone, then consensus", async () => {
  const w = await owned();
  await w.enrol("fay");
  w.m.memberSet({ memberId: "fay", status: "revoked", by: "admin" });
  assert.equal(add(w, "bob", "cal").reason, "NOT_THE_OWNER");
  assert.equal(add(w, "bob", "second").reason, "NOT_THE_OWNER");
  assert.equal(add(w, "zed", "ann").reason, "NO_SUCH_HANDLE");
  assert.equal(add(w, "fay", "ann").reason, "NOT_ACTIVE");
  const inv = add(w, "eve", "ann");
  assert.deepEqual([inv.reason, inv.state], ["NOT_A_PARTICIPANT", "invited"]);
  assert.equal(w.row(`SELECT state, owner FROM project_participants WHERE member_id='eve'`).state, "invited", "not joined by it");
  w.m.projectLeave({ projectId: "PROJ-P", by: "dee", viewer: V("dee") });
  assert.equal(add(w, "dee", "ann").reason, "NOT_A_PARTICIPANT");
  assert.equal(w.m.projectOwnerAdd({ projectId: "PROJ-P", handle: "second", by: "ann", viewer: V("ann") }).reason, "NOT_A_PARTICIPANT");
  assert.equal(add(w, "ann", "ann").reason, "ALREADY_AN_OWNER");
  assert.deepEqual(add(w, "bob", "ann").owners, ["ann", "bob"], "the sole owner adds the second alone");
  const c = add(w, "cal", "ann");
  assert.deepEqual([c.reason, c.have, c.awaiting], ["CONSENSUS_REQUIRED", ["ann"], ["bob"]]);
  const d = add(w, "cal", "bob");
  assert.deepEqual([d.ok, d.owners, d.deciders], [true, ["ann", "bob", "cal"], ["ann", "bob"]]);
});

test("R40 projectOwnerRemove: refusals in order, the floor, the vote, and never only leaving owners", async () => {
  const w = await owned();
  add(w, "bob", "ann");
  assert.equal(rem(w, "bob", "cal").reason, "NOT_THE_OWNER");
  assert.equal(rem(w, "zed", "ann").reason, "NO_SUCH_HANDLE");
  assert.equal(rem(w, "cal", "ann").reason, "NOT_AN_OWNER");
  assert.equal(rem(w, "bob", "ann", " ").reason, "NO_REASON");
  // two owners: both vote, the target included
  const v1 = rem(w, "bob", "ann", "stepping back");
  assert.deepEqual([v1.reason, v1.have, v1.need], ["VOTES_SHORT", 1, 2]);
  assert.equal(rem(w, "bob", "ann").reason, "ALREADY_VOTED");
  const v2 = rem(w, "bob", "bob", "agreed");
  assert.deepEqual([v2.ok, v2.owner, v2.stillAParticipant, v2.owners], [true, false, true, ["ann"]]);
  assert.equal(w.m.participation("PROJ-P", "bob").state, "joined");
  const floor = rem(w, "ann", "ann");
  assert.equal(floor.reason, "LAST_OWNER");
  // three owners: the target is counted and does not vote
  add(w, "bob", "ann");
  add(w, "cal", "ann"); add(w, "cal", "bob");
  assert.equal(rem(w, "cal", "cal").reason, "TARGET_CANNOT_VOTE");
  // a removal that would leave only owners who asked to leave
  w.m.projectLeave({ projectId: "PROJ-P", by: "bob", viewer: V("bob") });
  w.m.projectLeave({ projectId: "PROJ-P", by: "cal", viewer: V("cal") });
  const only = rem(w, "ann", "bob");
  assert.deepEqual([only.reason, only.leaving], ["LAST_COMMITTED_OWNER", ["bob", "cal"]]);
  assert.equal(w.rows(`SELECT * FROM project_owner_votes WHERE kind='remove'`).length, 0, "nothing written");
});

test("R41 projectOwnerRescue: an administrator adds an owner only when every owner is inactive; rows kept", async () => {
  const w = await owned();
  w.project("PROJ-M");   // a machine-created project: no owner rows
  const resc = (projectId, handle, by, reason = "stranded") => w.m.projectOwnerRescue({ projectId, handle, by, reason,
    viewer: by === "admin" ? "admin" : V(by) });   // the founder's viewer is the bare `admin` (R43)
  assert.equal(resc("PROJ-P", "bob", "cal").reason, "ADMIN_ONLY");
  assert.equal(resc("PROJ-M", "bob", "second").reason, "NO_OWNERS");
  const busy = resc("PROJ-P", "bob", "second");
  assert.deepEqual([busy.reason, busy.active], ["OWNERS_ARE_ACTIVE", ["ann"]]);
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  assert.equal(resc("PROJ-P", "bob", "second", " ").reason, "NO_REASON");
  assert.equal(resc("PROJ-P", "zed", "second").reason, "NO_SUCH_HANDLE");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.equal(resc("PROJ-P", "dee", "second").reason, "NOT_ACTIVE");
  const ok = resc("PROJ-P", "bob", "admin");
  assert.deepEqual([ok.ok, ok.owners, ok.addedNotReplaced], [true, ["ann", "bob"], true]);
  assert.equal(w.m.participation("PROJ-P", "ann").owner, true, "the inactive owner keeps the row");
});

test("R42 every ownership decision is kept with its deciders and reason, readable by every participant", async () => {
  const w = await owned();
  add(w, "bob", "ann");
  add(w, "cal", "ann"); add(w, "cal", "bob");
  rem(w, "cal", "ann", "no time"); rem(w, "cal", "bob", "agreed");
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  w.m.projectOwnerRescue({ projectId: "PROJ-P", handle: "dee", by: "second", reason: "both owners gone", viewer: V("second") });
  for (const reader of ["dee", "cal", "eve"]) {
    const d = w.m.projectParticipants({ projectId: "PROJ-P", by: reader }).ownership;
    assert.deepEqual(d.map((x) => [x.kind, x.handle, x.deciders, x.reasons]), [
      ["add", "bob", ["ann"], []],
      ["add", "cal", ["ann", "bob"], []],
      ["remove", "cal", ["ann", "bob"], ["no time", "agreed"]],
      ["rescue", "dee", ["second"], ["both owners gone"]],
    ]);
  }
  assert.equal(w.rows(`SELECT * FROM project_owner_votes WHERE kind IN ('add','remove')`).length, 0,
    "open votes are cleared once carried");
});

test("R65 projectOwners lists owners in the order they became owners; [] for none", async () => {
  const w = await owned();
  add(w, "dee", "ann");
  add(w, "bob", "ann"); add(w, "bob", "dee");
  assert.deepEqual(w.m.projectOwners("PROJ-P"), ["ann", "dee", "bob"]);
  assert.deepEqual(w.m.projectOwners("NOPE"), []);
  w.project("PROJ-M");
  assert.deepEqual(w.m.projectOwners("PROJ-M"), []);
});

test("R67 ownsAnyProject is true exactly when the member owns at least one project", async () => {
  const w = await owned();
  assert.equal(w.m.ownsAnyProject("ann"), true);
  assert.equal(w.m.ownsAnyProject("bob"), false, "a participant is not an owner");
  assert.equal(w.m.ownsAnyProject("zed"), false);
  add(w, "bob", "ann");
  assert.equal(w.m.ownsAnyProject("bob"), true);
});

test("R60 an administrator's sight is never a position: the only project act an administrator holds is the rescue", async () => {
  const w = await owned();
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", by: "ann", viewer: V("ann") });
  w.m.projectRequest({ projectId: "PROJ-P", by: "fay", viewer: V("fay") });
  for (const admin of ["admin", "second"]) {
    const v = admin === "admin" ? "admin" : V(admin);
    assert.equal(w.m.inSight("PROJ-P", v), true, "sees the project");
    const acts = [
      w.m.projectInvite({ projectId: "PROJ-P", handle: "fay", by: admin, viewer: v }),
      w.m.projectRemove({ projectId: "PROJ-P", handle: "bob", by: admin, viewer: v }),
      w.m.projectOwnerAdd({ projectId: "PROJ-P", handle: "bob", by: admin, viewer: v }),
      w.m.projectOwnerRemove({ projectId: "PROJ-P", handle: "ann", by: admin, reason: "r", viewer: v }),
      w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "hidden", by: admin, viewer: v }),
      w.m.projectRequestAnswer({ projectId: "PROJ-P", handle: "fay", answer: "grant", by: admin, viewer: v }),
      w.m.projectJoin({ projectId: "PROJ-P", by: admin, viewer: v }),
    ];
    for (const a of acts) assert.equal(a.ok, false, JSON.stringify(a).slice(0, 120));
    assert.equal(w.m.projectAuthority("PROJ-P", V(admin), "owner", "an act")?.code, "PROJECT_ACT_NOT_THE_OWNER");
    assert.equal(w.m.projectAuthority("PROJ-P", V(admin), "joined", "an act")?.code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  }
  assert.equal(w.m.participation("PROJ-P", "second"), null);
});
