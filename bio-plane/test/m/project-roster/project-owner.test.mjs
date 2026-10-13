/* R27 (T47; K3064, K3069; DEC-201 `projects`): `projectlist` answers each listed project's `owner`, the member who opened
   it (its first author, as the project's own record states: record-core R37's `manifest`, first entry), as
   `{member, handle}`, or null when that opener is no longer an active member; nothing else about the owner. At the
   interface: membership's acts set up members and participation, manifest entries are the record's, and the list is
   read through `projectList` and its op. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, realWorld, V, snapshot } from "./fixture.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const M = `${MACHINE_CLASS_PREFIX}member`;
const owners = (a) => Object.fromEntries(a.projects.map((p) => [p.id, p.owner]));

/* ann opened A, bob opened B (each later edited by the other); cal opened C (hidden, only cal in it). */
async function ownerWorld() {
  const w = await world().group("ann", "bob", "cal", "dee");
  w.owned("PROJ-A", "ann", ["bob"]);
  w.entry("PROJ-A", "ann", "2026-10-01T00:00:00.000Z");
  w.entry("PROJ-A", "bob", "2026-10-02T00:00:00.000Z");
  w.owned("PROJ-B", "bob", ["ann"]);
  w.entry("PROJ-B", "bob", "2026-10-01T00:00:00.000Z");
  w.entry("PROJ-B", "ann", "2026-10-03T00:00:00.000Z");
  w.owned("PROJ-C", "cal");
  w.entry("PROJ-C", "cal", "2026-10-01T00:00:00.000Z");
  return w;
}

test("R27 two projects opened by two members each answer their opener, {member, handle}, the first author whoever wrote after", async () => {
  const w = await ownerWorld();
  const all = w.r.projectList({ viewer: M });
  assert.deepEqual(owners(all), {
    "PROJ-A": { member: "ann", handle: "ann" },
    "PROJ-B": { member: "bob", handle: "bob" },
    "PROJ-C": { member: "cal", handle: "cal" },
  });
  /* the same owner whichever viewer reads it */
  assert.deepEqual(owners(w.r.projectList({ viewer: V("ann") })), { "PROJ-A": all.projects[0].owner, "PROJ-B": all.projects[1].owner });
  /* the handle is membership's, as it stands: a member's handle changed shows at once */
  w.sql.exec(`UPDATE members SET handle='bobby' WHERE member_id='bob'`);
  assert.deepEqual(owners(w.r.projectList({ viewer: M }))["PROJ-B"], { member: "bob", handle: "bobby" });
  /* the first entry is the first recorded: by `created`, then in the order recorded at the same instant */
  w.project("PROJ-T");
  w.entry("PROJ-T", "dee", "2026-10-05T00:00:00.000Z");
  w.entry("PROJ-T", "cal", "2026-10-05T00:00:00.000Z");
  w.entry("PROJ-T", "ann", "2026-10-04T00:00:00.000Z");
  assert.deepEqual(owners(w.r.projectList({ viewer: M }))["PROJ-T"], { member: "ann", handle: "ann" }, "earliest created");
  w.project("PROJ-U");
  w.entry("PROJ-U", "dee", "2026-10-05T00:00:00.000Z");
  w.entry("PROJ-U", "cal", "2026-10-05T00:00:00.000Z");
  assert.deepEqual(owners(w.r.projectList({ viewer: M }))["PROJ-U"], { member: "dee", handle: "dee" }, "first recorded");
  /* the opener is not the current owner: ownership moved, the opener stays */
  w.m.projectInvite({ projectId: "PROJ-C", handle: "dee", by: "cal", viewer: V("cal") });
  w.m.projectJoin({ projectId: "PROJ-C", by: "dee", viewer: V("dee") });
  w.r.projectOwnerAdd({ projectId: "PROJ-C", handle: "dee", by: "cal", viewer: V("cal") });
  assert.deepEqual(owners(w.r.projectList({ viewer: V("dee") }))["PROJ-C"], { member: "cal", handle: "cal" });
  /* nothing else about the owner: exactly its member id and handle */
  for (const p of w.r.projectList({ viewer: M }).projects)
    if (p.owner) assert.deepEqual(Object.keys(p.owner).sort(), ["handle", "member"], p.id);
});

test("R27 an opener no longer an active member answers null (revoked), and again when active; a machine's, the founder's and an unrecorded opening answer null", async () => {
  const w = await ownerWorld();
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='bob'`);
  assert.deepEqual(owners(w.r.projectList({ viewer: M })), {
    "PROJ-A": { member: "ann", handle: "ann" }, "PROJ-B": null, "PROJ-C": { member: "cal", handle: "cal" } });
  assert.equal(owners(w.r.projectList({ viewer: V("ann") }))["PROJ-B"], null, "the revoked opener, as a participant sees it");
  w.sql.exec(`UPDATE members SET status='active' WHERE member_id='bob'`);
  assert.deepEqual(owners(w.r.projectList({ viewer: M }))["PROJ-B"], { member: "bob", handle: "bob" }, "active again");
  /* a member added and not yet enrolled is not active */
  await w.m.memberAdd({ memberId: "new", cover: "cover of new", role: "member", by: "admin" });
  w.project("PROJ-N"); w.entry("PROJ-N", "new");
  /* opened by a machine credential, by the founder (no roster row), by a name that is no member, and never recorded */
  w.project("PROJ-K"); w.entry("PROJ-K", `${MACHINE_CLASS_PREFIX}daemon`);
  w.project("PROJ-F"); w.entry("PROJ-F", "admin");
  w.project("PROJ-G"); w.entry("PROJ-G", "ghost");
  w.project("PROJ-H"); w.entry("PROJ-H", null);
  w.project("PROJ-0");
  const o = owners(w.r.projectList({ viewer: M }));
  for (const id of ["PROJ-N", "PROJ-K", "PROJ-F", "PROJ-G", "PROJ-H", "PROJ-0"]) assert.equal(o[id], null, id);
  /* a later entry by an active member never makes them the opener */
  w.entry("PROJ-K", "ann"); w.entry("PROJ-0", "ann", "2999-01-01T00:00:00.000Z");
  assert.equal(owners(w.r.projectList({ viewer: M }))["PROJ-K"], null, "the machine opened it");
  assert.deepEqual(owners(w.r.projectList({ viewer: M }))["PROJ-0"], { member: "ann", handle: "ann" },
    "its first recorded entry, once there is one");
});

test("R27 control: a project the viewer may not see is still absent, its opener with it; the read writes nothing", async () => {
  const w = await ownerWorld();
  const before = snapshot(w);
  assert.deepEqual(w.r.projectList({ viewer: V("ann") }).projects.map((p) => p.id), ["PROJ-A", "PROJ-B"]);
  assert.deepEqual(w.r.projectList({ viewer: V("dee") }).projects, [], "dee is in none");
  for (const v of [V("ann"), V("bob"), V("dee"), "admin", V("second")])
    assert.doesNotMatch(JSON.stringify(w.r.projectList({ viewer: v })), /PROJ-C|"cal"/, `${v}: cal's hidden project`);
  assert.deepEqual(w.r.projectList({ viewer: "junk" }).projects, []);
  assert.equal(snapshot(w), before, "nothing written");
  /* the op answers the same */
  assert.deepEqual(w.ops(`viewer=${encodeURIComponent(V("bob"))}`).projectlist(), w.r.projectList({ viewer: V("bob") }));
  assert.deepEqual(owners(w.ops(`viewer=${encodeURIComponent(V("bob"))}`).projectlist())["PROJ-B"], { member: "bob", handle: "bob" });
  /* the cap cuts owners with their projects */
  const cut = w.r.projectList({ viewer: M, limit: 1 });
  assert.deepEqual([cut.truncated, owners(cut)], [true, { "PROJ-A": { member: "ann", handle: "ann" } }]);
});

test("R27 over the real record-core: the opener is the author of the project's first commit (manifest), later commits by others change nothing", async () => {
  const w = await realWorld();
  const { m, r, rc } = w;
  await w.claim();
  for (const id of ["ann", "bob"]) await w.enrol(id);
  const commit = (bundleId, author, at, snapKey) => rc.commit({ bundleId, type: "project", title: bundleId, snapKey,
    author, base: null, files: [], state: "forming", group: "g", created: at, lastUpdated: at, at });
  commit("PROJ-A", "ann", "2026-10-01T00:00:00.000Z", "K1");
  commit("PROJ-B", "bob", "2026-10-01T00:00:00.000Z", "K2");
  commit("PROJ-A", "bob", "2026-10-02T00:00:00.000Z", "K3");
  commit("PROJ-K", `${MACHINE_CLASS_PREFIX}daemon`, "2026-10-01T00:00:00.000Z", "K4");
  for (const id of ["PROJ-A", "PROJ-B", "PROJ-K"]) m.reindexProjectSight(id);
  m.projectClaimOwner({ projectId: "PROJ-A", memberId: "ann" });
  m.projectClaimOwner({ projectId: "PROJ-B", memberId: "bob" });
  assert.deepEqual(owners(r.projectList({ viewer: `${MACHINE_CLASS_PREFIX}admin` })), {
    "PROJ-A": { member: "ann", handle: "ann" }, "PROJ-B": { member: "bob", handle: "bob" }, "PROJ-K": null });
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='ann'`);
  assert.equal(owners(r.projectList({ viewer: `${MACHINE_CLASS_PREFIX}admin` }))["PROJ-A"], null, "revoked");
  assert.deepEqual(r.projectList({ viewer: V("bob") }).projects.map((p) => p.id), ["PROJ-B"], "control: A and K unseen");
});
