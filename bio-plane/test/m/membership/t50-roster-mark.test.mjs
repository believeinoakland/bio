/* T50 (T50-2; N1119, N1092; K3369; DEC-238 S23 "A"): R147 `memberList` answers the founder's row, and R148 `lookedAt`, the
   Home mark read without moving it (amends R143). Each at the interface, each with its controls. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Membership } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const founderRow = (list) => list.members.find((r) => r.founder === true);

test("R147 an administrator's roster carries her projects as R18 gives them; never a cover, a door or an invitation", async () => {
  const w = await world().group("ann");
  w.project("PROJ-F");
  w.project("PROJ-G");
  w.m.projectClaimOwner({ projectId: "PROJ-F", memberId: "admin" });
  w.m.projectClaimOwner({ projectId: "PROJ-G", memberId: "ann" });
  w.m.projectVisibilitySet({ projectId: "PROJ-G", setting: "discoverable", by: "ann", viewer: V("ann") });
  const f = founderRow(w.m.memberList({ administer: true, viewer: "admin" }));
  assert.deepEqual(f.projects, [{ project: "PROJ-F", state: "joined", owner: true }]);
  for (const key of ["cover", "door", "approvedBy", "expires", "invitation"]) assert.equal(key in f, false, key);
  /* as R18 reads them for any member, the viewer deciding which she may see */
  const ann = w.m.memberList({ administer: true, viewer: "admin" }).members.find((r) => r.member_id === "ann");
  assert.deepEqual(ann.projects, [{ project: "PROJ-G", state: "joined", owner: true }]);
});

/* ---------------------------------------------------------------- R148 --------------------------------------------- */
