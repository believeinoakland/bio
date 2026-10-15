/* R30 (T49; N1091; DEC-237 (3); amends R7): `projectOwnerVotes({projectId, viewer})` (`op=projectownervotes`, a read)
   answers, to a viewer at FULL of the project, each owner change that has votes counted and is not yet carried:
   `{change, target, proposed_by, proposed_at, agreed, awaiting}`, `agreed` and `awaiting` as R3's and R4's
   `CONSENSUS_REQUIRED` and `VOTES_SHORT` count them, members named by handle, the founder by `founderHandle()` (R29).
   At the interface: R3's and R4's acts leave the votes; the read is asked as each viewer of a battery. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, snapshot } from "./fixture.mjs";
import { Membership, noSuchProject } from "../../../src/membership/index.mjs";

const votes = (w, viewer, projectId = "PROJ-P") => w.r.projectOwnerVotes({ projectId, viewer });
const add = (w, handle, by) => w.r.projectOwnerAdd({ projectId: "PROJ-P", handle, by, viewer: V(by) });
const rem = (w, handle, by, reason = "because") => w.r.projectOwnerRemove({ projectId: "PROJ-P", handle, by, reason, viewer: V(by) });

/* P (hidden) owned by ann, bob and cal (all joined); dee joined and not an owner; eve invited; zed outside. */
async function threeOwners() {
  const w = await world().group("ann", "bob", "cal", "dee", "eve", "zed");
  w.owned("PROJ-P", "ann", ["bob", "cal", "dee"], ["eve"]);
  assert.equal(add(w, "bob", "ann").ok, true, "the sole owner adds a second alone");
  assert.equal(add(w, "cal", "ann").ok, false);
  assert.equal(add(w, "cal", "bob").ok, true, "every owner's vote carries the third");
  assert.deepEqual(w.m.projectOwners("PROJ-P"), ["ann", "bob", "cal"]);
  return w;
}

test("R30 a two-of-three change answers one agreed and one awaiting: an addition short of an owner's vote, members named by handle", async () => {
  const w = await threeOwners();
  assert.deepEqual(votes(w, V("ann")), { ok: true, projectId: "PROJ-P", changes: [] }, "nothing pending yet");
  assert.equal(add(w, "dee", "ann").reason, "CONSENSUS_REQUIRED");
  const one = votes(w, V("bob")).changes;
  assert.equal(one.length, 1);
  assert.deepEqual([one[0].change, one[0].target, one[0].proposed_by, one[0].agreed, one[0].awaiting],
    ["add", "dee", "ann", ["ann"], ["bob", "cal"]]);
  assert.match(one[0].proposed_at, /^\d{4}-\d\d-\d\dT/);
  assert.deepEqual(Object.keys(one[0]).sort(), ["agreed", "awaiting", "change", "proposed_at", "proposed_by", "target"]);
  /* the same numbers R3 answers */
  assert.equal(add(w, "dee", "bob").reason, "CONSENSUS_REQUIRED");
  const two = votes(w, V("bob")).changes[0];
  assert.deepEqual([two.agreed, two.awaiting], [["ann", "bob"], ["cal"]], "two of three");
  assert.equal(two.proposed_by, "ann", "the first counted vote proposed it");
  const r3 = add(w, "dee", "bob");
  assert.deepEqual([r3.have, r3.awaiting], [["ann", "bob"], ["cal"]], "R3's own count, as read");
  /* carried: no longer pending */
  assert.equal(add(w, "dee", "cal").ok, true);
  assert.deepEqual(votes(w, V("ann")).changes, [], "carried: cleared with its votes");
});

test("R30 a removal short of its votes: agreed the counted votes, awaiting the owners whose vote would still count (R4: the target does not vote at three or more)", async () => {
  const w = await threeOwners();
  assert.equal(rem(w, "cal", "ann").reason, "VOTES_SHORT");
  const c = votes(w, V("bob")).changes;
  assert.deepEqual(c.map((x) => [x.change, x.target, x.proposed_by, x.agreed, x.awaiting]), [["remove", "cal", "ann", ["ann"], ["bob"]]],
    "cal is the target at three owners: she neither votes nor is awaited");
  /* a second pending change beside it, in the order first proposed */
  assert.equal(add(w, "dee", "bob").reason, "CONSENSUS_REQUIRED");
  assert.deepEqual(votes(w, V("ann")).changes.map((x) => [x.change, x.target]), [["remove", "cal"], ["add", "dee"]]);
  assert.equal(rem(w, "cal", "bob").ok, true, "carried");
  assert.deepEqual(votes(w, V("ann")).changes.map((x) => [x.change, x.target]), [["add", "dee"]]);
  /* at two owners the target votes, so both agree and the target is awaited */
  const v = await world().group("ann", "bob");
  v.owned("PROJ-P", "ann", ["bob"]);
  assert.equal(add(v, "bob", "ann").ok, true);
  assert.equal(rem(v, "bob", "ann").reason, "VOTES_SHORT");
  assert.deepEqual(votes(v, V("ann")).changes.map((x) => [x.change, x.target, x.agreed, x.awaiting]), [["remove", "bob", ["ann"], ["bob"]]]);
});

test("R30 a vote that does not count (a former owner's, a rescue, a carried decision) is no pending change; the founder is named by her handle", async () => {
  const w = await threeOwners();
  /* a stale vote from a member who is not an owner (eve) counts for nothing, so nothing is pending */
  w.sql.exec(`INSERT INTO project_owner_votes (project_id,kind,target,voter,reason,created) VALUES ('PROJ-P','add','dee','eve',NULL,'2026-01-01T00:00:00.000Z')`);
  assert.deepEqual(votes(w, V("ann")).changes, []);
  /* a rescue is carried at once: its vote row is no pending change */
  w.sql.exec(`INSERT INTO project_owner_votes (project_id,kind,target,voter,reason,created) VALUES ('PROJ-P','rescue','dee','second','r','2026-01-01T00:00:00.000Z')`);
  assert.deepEqual(votes(w, V("ann")).changes, []);
  /* the founder an owner of the project: a voter named by `founderHandle()`, null while none, never `admin` */
  w.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, owner_order, created, updated)
              VALUES ('PROJ-P','admin','joined',1,4,'t','t')`);
  assert.ok(w.m.projectOwners("PROJ-P").includes("admin"), "the founder an owner");
  const asked = () => { w.r.projectOwnerAdd({ projectId: "PROJ-P", handle: "dee", by: "ann", viewer: V("ann") });
                        return votes(w, V("ann")).changes[0]; };
  const none = asked();
  assert.deepEqual([none.agreed, none.awaiting.includes("admin")], [["ann"], false]);
  assert.ok(none.awaiting.includes(null), "the founder, who holds no handle, awaited as null");
  w.founderHandle("foundress");
  assert.ok(votes(w, V("ann")).changes[0].awaiting.includes("foundress"));
  assert.doesNotMatch(JSON.stringify(votes(w, V("ann"))), /"admin"/);
});

test("R30 control: a viewer at existence only, an outsider, no viewer, a machine-less junk viewer and an id naming nothing get the absent answer; a FULL viewer who is not an owner reads it", async () => {
  const w = await threeOwners();
  assert.equal(add(w, "dee", "ann").reason, "CONSENSUS_REQUIRED");
  const absent = noSuchProject("PROJ-P");
  for (const viewer of [V("zed"), V("nobody"), "junk", "", null, undefined, 7])
    assert.deepEqual(votes(w, viewer), absent, String(viewer));
  /* an administrator at EXISTENCE of the hidden project (D54) is answered as absent, not C-70.1 */
  assert.equal(w.m.sight("PROJ-P", V("second")), Membership.SIGHT_EXISTENCE);
  assert.deepEqual(votes(w, V("second")), absent, "existence only");
  assert.deepEqual(votes(w, V("zed"), "NOPE"), noSuchProject("NOPE"), "an id naming nothing");
  /* byte for byte: what an id naming nothing answers differs only in the id */
  assert.deepEqual(JSON.parse(JSON.stringify(votes(w, V("zed"))).replace("PROJ-P", "NOPE")), noSuchProject("NOPE"));
  /* FULL sight reads it, an owner or not: a participant who is no owner, an invited member, the discoverable project's administrator */
  for (const viewer of [V("ann"), V("dee"), V("eve")]) assert.equal(votes(w, viewer).changes.length, 1, viewer);
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", by: "ann", viewer: V("ann") });
  for (const viewer of [V("second"), "admin"]) assert.equal(votes(w, viewer).changes.length, 1, `${viewer} at FULL`);
  assert.equal(votes(w, V("zed")).ok, false, "an outsider still sees nothing");
  /* a bundle that is no project */
  w.bundle("INFO-1");
  assert.equal(votes(w, V("ann"), "INFO-1").ok, false);
});

test("R30 writes nothing and never throws: any viewer, any project argument", async () => {
  const w = await threeOwners();
  assert.equal(add(w, "dee", "ann").reason, "CONSENSUS_REQUIRED");
  const before = snapshot(w);
  for (const viewer of [V("ann"), V("zed"), undefined, null, {}, [], Symbol("x"), 10n])
    for (const projectId of ["PROJ-P", "NOPE", undefined, null, 5, {}, "", "x'; DROP TABLE members;--"])
      assert.equal(typeof w.r.projectOwnerVotes({ projectId, viewer }).ok, "boolean");
  assert.equal(typeof w.r.projectOwnerVotes().ok, "boolean");
  assert.equal(snapshot(w), before);
  assert.deepEqual(w.ops(`projectId=PROJ-P&viewer=${encodeURIComponent(V("ann"))}`).projectownervotes(), votes(w, V("ann")));
});
