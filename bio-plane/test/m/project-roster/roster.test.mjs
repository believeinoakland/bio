/* The roster (R1) and the removals record (R2), moved with their read from membership's `participation.test.mjs`
   (its R37 and R63's read; the acts that write them stay membership's), renamed to this module's ids (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, snapshot } from "./fixture.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";

/* ann owns P; bob joined; cal invited; dee outside */
async function projectWorld() {
  const w = await world().group("ann", "bob", "cal", "dee");
  w.owned("PROJ-P", "ann", ["bob"], ["cal"]);
  return w;
}

test("R1 projectParticipants: a participant (any state), or an administrator at FULL sight of the project, reads every participant's handle, state, owner flag and comment; anyone else NO_SUCH_PROJECT", async () => {
  const w = await projectWorld();
  w.m.projectLeave({ projectId: "PROJ-P", by: "bob", comment: "busy this month", viewer: V("bob") });
  /* D54: P is hidden, and an administrator (the founder included) neither invited nor joined to it reads none of its
     participants: answered as anyone else, byte for byte */
  for (const by of ["second", "admin"])
    assert.deepEqual(w.r.projectParticipants({ projectId: "PROJ-P", by }), noSuchProject("PROJ-P"), `${by} at hidden P`);
  /* the negative control: P discoverable, the same administrators are at FULL and read it */
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", by: "ann", viewer: V("ann") });
  for (const reader of ["ann", "bob", "cal", "second", "admin"]) {
    const p = w.r.projectParticipants({ projectId: "PROJ-P", by: reader });
    assert.equal(p.ok, true, reader);
    assert.equal(p.projectId, "PROJ-P");
    assert.deepEqual(p.participants.map((x) => [x.handle, x.state, x.owner, x.comment]),
      [["ann", "joined", 1, null], ["bob", "leaving", 0, "busy this month"], ["cal", "invited", 0, null]], reader);
    for (const x of p.participants) assert.match(x.created, /^\d{4}-/);
  }
  /* the owners first, then by handle */
  w.m.projectJoin({ projectId: "PROJ-P", by: "bob", viewer: V("bob") });
  w.r.projectOwnerAdd({ projectId: "PROJ-P", handle: "bob", by: "ann", viewer: V("ann") });
  assert.deepEqual(w.r.projectParticipants({ projectId: "PROJ-P", by: "cal" }).participants.map((x) => x.handle),
    ["ann", "bob", "cal"]);
  /* anyone else: the absent answer, byte for byte as an id naming nothing (membership R78) */
  for (const by of ["dee", "zed", null, undefined, "class:admin"])
    assert.deepEqual(w.r.projectParticipants({ projectId: "PROJ-P", by }), noSuchProject("PROJ-P"), String(by));
  assert.deepEqual(w.r.projectParticipants({ projectId: "NOPE", by: "dee" }), noSuchProject("NOPE"));
  for (const by of ["second", "admin"])
    assert.deepEqual(w.r.projectParticipants({ projectId: "NOPE", by }), noSuchProject("NOPE"), `${by}: an id naming nothing`);
  /* an administrator invited to a hidden project reads it as a participant */
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "hidden", by: "ann", viewer: V("ann") });
  assert.equal(w.r.projectParticipants({ projectId: "PROJ-P", by: "second" }).reason, "NO_SUCH_PROJECT");
  w.m.projectInvite({ projectId: "PROJ-P", handle: "second", by: "ann", viewer: V("ann") });
  assert.equal(w.r.projectParticipants({ projectId: "PROJ-P", by: "second" }).ok, true, "invited: a participant");
  w.m.projectRemove({ projectId: "PROJ-P", handle: "second", by: "ann", viewer: V("ann") });
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", by: "ann", viewer: V("ann") });
  /* the founder before the claim is no administrator */
  w.creds.claimed = false;
  assert.equal(w.r.projectParticipants({ projectId: "PROJ-P", by: "admin" }).reason, "NO_SUCH_PROJECT");
  w.creds.claimed = true;
  /* a read: it writes nothing */
  const before = snapshot(w);
  w.r.projectParticipants({ projectId: "PROJ-P", by: "ann" });
  assert.equal(snapshot(w), before);
});

test("R2 every removal an owner makes stays recorded with who removed whom, when and the owner's reason, and every participant reads it", async () => {
  const w = await projectWorld();
  w.m.projectInvite({ projectId: "PROJ-P", handle: "dee", by: "ann", viewer: V("ann") });   // a participant who stays
  w.m.projectJoin({ projectId: "PROJ-P", by: "dee", viewer: V("dee") });
  assert.deepEqual(w.r.projectParticipants({ projectId: "PROJ-P", by: "dee" }).removals, [], "none yet");
  const r = w.m.projectRemove({ projectId: "PROJ-P", handle: "bob", by: "ann", comment: "did not show up", viewer: V("ann") });
  assert.equal(r.ok, true);
  assert.equal(w.m.projectRemove({ projectId: "PROJ-P", handle: "cal", by: "ann", viewer: V("ann") }).ok, true,
    "an invited one too, with no reason");
  for (const by of ["second", "admin"])   // D54: P hidden, the administrators not in it read no removal
    assert.deepEqual(w.r.projectParticipants({ projectId: "PROJ-P", by }), noSuchProject("PROJ-P"), by);
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", by: "ann", viewer: V("ann") });
  for (const reader of ["ann", "dee", "second", "admin"]) {   // an owner, a participant, an administrator, the founder
    const rm = w.r.projectParticipants({ projectId: "PROJ-P", by: reader }).removals;
    assert.deepEqual(rm.map((x) => [x.handle, x.removedBy, x.reason]),
      [["bob", "ann", "did not show up"], ["cal", "ann", null]], reader);
    for (const x of rm) assert.match(x.at, /^\d{4}-\d\d-\d\dT/);
  }
  /* the removed are no longer participants, so the record is not theirs to read */
  assert.equal(w.r.projectParticipants({ projectId: "PROJ-P", by: "bob" }).reason, "NO_SUCH_PROJECT");
  /* a removal survives the member being invited back: the record is never rewritten */
  w.m.projectInvite({ projectId: "PROJ-P", handle: "bob", by: "ann", viewer: V("ann") });
  assert.equal(w.r.projectParticipants({ projectId: "PROJ-P", by: "bob" }).removals.length, 2);
  /* a removed member who has no handle any more is still named by their id */
  w.sql.exec(`INSERT INTO project_removals (project_id, member_id, removed_by, comment, at) VALUES ('PROJ-P','gone','ann','x','t')`);
  assert.deepEqual(w.r.projectParticipants({ projectId: "PROJ-P", by: "ann" }).removals.at(-1).handle, "gone");
});
