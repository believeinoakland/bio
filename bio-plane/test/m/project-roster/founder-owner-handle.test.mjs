/* R45 (T52; MEMBERSHIP #1's finding): in projectOwnerAdd, projectOwnerRemove and projectOwnerRescue the founder's held
   handle names the founder, so it never answers NO_SUCH_HANDLE; each act then judges her as it judges any member. At the
   interface: the founder's handle is set through the fixture, her participation is the row membership's acts leave. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const founderIn = (w, state) => w.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
  VALUES ('PROJ-P','admin','${state}',0,'t','t')`);
const add = (w, handle, by = "ann") => w.r.projectOwnerAdd({ projectId: "PROJ-P", handle, by, viewer: V(by) });

test("R45 projectOwnerAdd: an owner adds the joined founder by her handle and she is an owner; before she joins it is refused TARGET_NOT_JOINED", async () => {
  const w = await world().group("ann", "bob");
  w.owned("PROJ-P", "ann", ["bob"]);
  w.founderHandle("foundress");
  assert.equal(add(w, "foundress").reason, "TARGET_NOT_JOINED", "no participation");
  founderIn(w, "invited");
  assert.equal(add(w, "foundress").reason, "TARGET_NOT_JOINED", "invited, not joined");
  w.sql.exec(`UPDATE project_participants SET state='joined' WHERE project_id='PROJ-P' AND member_id='admin'`);
  const done = add(w, "foundress");
  assert.equal(done.ok, true);
  assert.equal(w.m.isProjectOwner("PROJ-P", "admin"), true);
  assert.equal(add(w, "foundress").reason, "ALREADY_AN_OWNER");
  assert.doesNotMatch(JSON.stringify(done), /"admin"/);
});

test("R45 projectOwnerRemove and projectOwnerRescue judge the founder as any member: NOT_AN_OWNER; rescue adds her as a joined owner", async () => {
  const w = await world().group("ann", "bob");
  w.owned("PROJ-P", "ann", ["bob"]);
  w.founderHandle("foundress");
  founderIn(w, "joined");
  const no = w.r.projectOwnerRemove({ projectId: "PROJ-P", handle: "foundress", by: "ann", reason: "r", viewer: V("ann") });
  assert.equal(no.reason, "NOT_AN_OWNER");
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  const ok = w.r.projectOwnerRescue({ projectId: "PROJ-P", handle: "foundress", by: "admin", reason: "stranded", viewer: "admin" });
  assert.equal(ok.ok, true);
  assert.equal(w.m.isProjectOwner("PROJ-P", "admin"), true);
});

test("R45 control: a handle no one holds still answers NO_SUCH_HANDLE, in all three acts, the founder's handle held or not", async () => {
  const w = await world().group("ann", "bob");
  w.owned("PROJ-P", "ann", ["bob"]);
  for (const held of [false, true]) {
    if (held) w.founderHandle("foundress");
    assert.equal(add(w, "nobody").reason, "NO_SUCH_HANDLE");
    assert.equal(w.r.projectOwnerRemove({ projectId: "PROJ-P", handle: "nobody", by: "ann", reason: "r", viewer: V("ann") }).reason, "NO_SUCH_HANDLE");
  }
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.equal(w.r.projectOwnerRescue({ projectId: "PROJ-P", handle: "nobody", by: "admin", reason: "r", viewer: "admin" }).reason, "NO_SUCH_HANDLE");
  /* no founder handle held: her would-be handle resolves to no one */
  const w2 = await world().group("ann");
  w2.owned("PROJ-P", "ann");
  assert.equal(add(w2, "foundress").reason, "NO_SUCH_HANDLE");
});
