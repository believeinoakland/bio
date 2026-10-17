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
  /* R29: the founder invited is a participant with no roster row, listed by her handle with `founder: true` (null while
     she holds none), never by the id `admin` */
  w.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                VALUES ('PROJ-P','admin','invited',0,'t','t')`);
  const listed = () => w.r.projectParticipants({ projectId: "PROJ-P", by: "cal" }).participants;
  assert.deepEqual(listed().map((x) => [x.handle, x.state]),
    [["ann", "joined"], ["bob", "joined"], ["cal", "invited"], [null, "invited"]], "none held: handle null, after the handles");
  assert.deepEqual(listed().find((x) => x.founder), { handle: null, founder: true, state: "invited", owner: 0, comment: null,
    created: "t", joined_at: null, owner_since: null });
  assert.deepEqual(listed().filter((x) => "founder" in x).length, 1, "no member carries founder");
  assert.doesNotMatch(JSON.stringify(w.r.projectParticipants({ projectId: "PROJ-P", by: "cal" })), /"admin"/, "no `admin` at any depth");
  w.founderHandle("foundress");
  assert.deepEqual(listed().map((x) => [x.handle, x.state, x.founder ?? false]),
    [["ann", "joined", false], ["bob", "joined", false], ["cal", "invited", false], ["foundress", "invited", true]]);
  assert.equal(w.r.projectParticipants({ projectId: "PROJ-P", by: "admin" }).ok, true, "the founder reads it as a participant");
  w.sql.exec(`DELETE FROM project_participants WHERE project_id='PROJ-P' AND member_id='admin'`);
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

test("R1 (T50; N1124) each participant's row carries joined_at, the instant her row last became joined, and an owner's owner_since: a carried vote's instant, the joined_at of a founding owner; null where not joined, not an owner, or not recorded; created is neither", async () => {
  const w = await projectWorld();
  const rows = () => Object.fromEntries(w.r.projectParticipants({ projectId: "PROJ-P", by: "ann" }).participants
    .map((x) => [x.handle, x]));
  const early = rows();
  assert.equal(early.bob.joined_at !== null && /^\d{4}-/.test(early.bob.joined_at), true, "bob joined");
  assert.equal(early.cal.joined_at, null, "control: an invited member has not joined");
  assert.equal(early.cal.owner_since, null);
  assert.equal(early.bob.owner_since, null, "control: a non-owner has no owner_since");
  assert.equal(early.ann.owner_since, early.ann.joined_at, "the founding owner: her joined_at");
  w.time.now = Date.parse(early.bob.joined_at) + 60_000;
  assert.equal(w.r.projectOwnerAdd({ projectId: "PROJ-P", handle: "bob", by: "ann", viewer: V("ann") }).ok, true);
  const now = rows();
  assert.equal(now.bob.owner_since, new Date(w.time.now).toISOString(), "the decision's instant");
  assert.ok(now.bob.joined_at < now.bob.owner_since, "joined before made an owner");
  assert.notEqual(now.bob.created, now.bob.owner_since, "created is neither");
  assert.equal(now.bob.joined_at, early.bob.joined_at, "joined_at is unmoved");
  /* a row joined before the instant was recorded is never back-filled */
  w.sql.exec(`UPDATE project_participants SET joined_at=NULL WHERE project_id='PROJ-P' AND member_id='bob'`);
  assert.deepEqual([rows().bob.joined_at, rows().bob.owner_since], [null, new Date(w.time.now).toISOString()]);
  /* a rescue's instant */
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  w.time.now += 60_000;
  assert.equal(w.r.projectOwnerRescue({ projectId: "PROJ-P", handle: "cal", by: "second", reason: "r", viewer: V("second") }).ok, true);
  const cal = w.r.projectParticipants({ projectId: "PROJ-P", by: "cal" }).participants.find((x) => x.handle === "cal");
  assert.equal(cal.owner_since, new Date(w.time.now).toISOString());
});
