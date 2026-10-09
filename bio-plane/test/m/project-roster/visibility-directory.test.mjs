/* The visibility history (R8) and the directory (R9), moved with their reads from membership's `sight.test.mjs` (its
   R46, R48) and the founder's arm of its N357 test, renamed to this module's ids (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, snapshot } from "./fixture.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";
import { ProjectRoster, PROJECT_ROSTER_CHECKS } from "../../../src/project-roster/index.mjs";

/* H hidden, D discoverable, both owned by ann; bob invited to H; info I */
async function sightWorld() {
  const w = await world().group("ann", "bob", "cal");
  w.bundle("INFO-I");
  w.project("PROJ-H", "Hidden H");
  w.project("PROJ-D", "Discoverable D");
  w.m.projectClaimOwner({ projectId: "PROJ-H", memberId: "ann" });
  w.m.projectClaimOwner({ projectId: "PROJ-D", memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-H", handle: "bob", by: "ann", viewer: V("ann") });
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", reason: "open to all", by: "ann", viewer: V("ann") });
  return w;
}

test("R8 projectVisibility gives the setting and its history to a caller at FULL, else the absent answer", async () => {
  const w = await sightWorld();
  for (const viewer of [V("ann"), V("second"), "admin", `${MACHINE_CLASS_PREFIX}member`]) {
    const v = w.r.projectVisibility({ projectId: "PROJ-D", viewer });
    assert.deepEqual([v.ok, v.projectId, v.setting, v.recorded, v.history.map((h) => [h.setting, h.set_by, h.reason])],
      [true, "PROJ-D", "discoverable", true, [["discoverable", "ann", "open to all"]]], viewer);
    assert.match(v.history[0].at, /^\d{4}-/);
    assert.equal(v.note, undefined);
  }
  /* the history in the order recorded, the setting the latest */
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "hidden", by: "ann", viewer: V("ann") });
  const two = w.r.projectVisibility({ projectId: "PROJ-D", viewer: V("ann") });
  assert.deepEqual([two.setting, two.history.map((h) => h.setting)], ["hidden", ["discoverable", "hidden"]]);
  /* no record reads hidden, and says so */
  const h = w.r.projectVisibility({ projectId: "PROJ-H", viewer: V("bob") });
  assert.deepEqual([h.ok, h.setting, h.recorded, h.history], [true, "hidden", false, []]);
  assert.match(h.note, /HIDDEN/);
  /* below FULL: the absent answer, at EXISTENCE too (a read inside the project is never widened) */
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  for (const [p, viewer] of [["PROJ-H", V("cal")], ["PROJ-D", V("cal")], ["PROJ-NEVER", V("ann")], ["PROJ-D", "junk"],
                             ["PROJ-D", null]])
    assert.deepEqual(w.r.projectVisibility({ projectId: p, viewer }), noSuchProject(p), `${p} ${viewer}`);
  assert.deepEqual(w.r.projectVisibility({ projectId: "INFO-I", viewer: V("ann") }),
    { ok: false, reason: "NOT_A_PROJECT", project: "INFO-I" });
  /* D54: an administrator (the founder in either spelling) neither invited nor joined to hidden H is below FULL:
     the absent answer; invited, it reads H's setting (the negative control) */
  for (const viewer of [V("second"), "admin", V("admin")])
    assert.deepEqual(w.r.projectVisibility({ projectId: "PROJ-H", viewer }), noSuchProject("PROJ-H"), `${viewer} at H`);
  w.m.projectInvite({ projectId: "PROJ-H", handle: "second", by: "ann", viewer: V("ann") });
  assert.deepEqual([w.r.projectVisibility({ projectId: "PROJ-H", viewer: V("second") }).ok,
    w.r.projectVisibility({ projectId: "PROJ-H", viewer: V("second") }).setting], [true, "hidden"], "invited: FULL");
  const before = snapshot(w);
  w.r.projectVisibility({ projectId: "PROJ-D", viewer: V("ann") });
  assert.equal(snapshot(w), before, "a read writes nothing");
});

test("R9 projectDirectory: needs a member; the discoverable projects the caller does not see at FULL, each {id, name, request} with its own latest request, in id order; capped, measured one past the cap", async () => {
  const w = await sightWorld();
  for (const viewer of [`${MACHINE_CLASS_PREFIX}member`, "admin", "junk", null, ""]) {
    const r = w.r.projectDirectory({ viewer });
    const row = PROJECT_ROSTER_CHECKS.PROJECT_DIRECTORY_NEEDS_A_MEMBER;
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "PROJECT_DIRECTORY_NEEDS_A_MEMBER",
      "PROJECT_DIRECTORY_NEEDS_A_MEMBER", "C-70.4", row.translation], String(viewer));
  }
  assert.equal(PROJECT_ROSTER_CHECKS.PROJECT_DIRECTORY_NEEDS_A_MEMBER.where,
    "src/project-roster/index.mjs projectDirectory > is-project-directory-member");
  for (let i = 0; i < 4; i++) {
    w.project(`PROJ-X${i}`, `X ${i}`);
    w.m.projectClaimOwner({ projectId: `PROJ-X${i}`, memberId: "ann" });
    w.m.projectVisibilitySet({ projectId: `PROJ-X${i}`, setting: "discoverable", by: "ann", viewer: V("ann") });
  }
  w.r.projectRequest({ projectId: "PROJ-X1", comment: "hi", by: "cal", viewer: V("cal") });
  w.r.projectRequest({ projectId: "PROJ-X2", by: "cal", viewer: V("cal") });
  w.r.projectRequestAnswer({ projectId: "PROJ-X2", handle: "cal", answer: "decline", by: "ann", viewer: V("ann") });
  w.r.projectRequest({ projectId: "PROJ-X2", by: "cal", viewer: V("cal") });             // its latest: open again
  w.r.projectRequest({ projectId: "PROJ-X3", by: "bob", viewer: V("bob") });             // someone else's: not shown to cal
  const d = w.r.projectDirectory({ viewer: V("cal") });
  assert.deepEqual(d.projects.map((p) => [p.id, p.name, p.request?.state ?? null]),
    [["PROJ-D", "Discoverable D", null], ["PROJ-X0", "X 0", null], ["PROJ-X1", "X 1", "open"], ["PROJ-X2", "X 2", "open"],
     ["PROJ-X3", "X 3", null]]);
  for (const p of d.projects) assert.deepEqual(Object.keys(p).sort(), ["id", "name", "request"]);
  const x1 = d.projects[2].request;
  assert.deepEqual([Object.keys(x1).sort(), x1.closed], [["asked", "closed", "state"], null]);
  assert.deepEqual([d.ok, d.count, d.limit, d.truncated], [true, 5, ProjectRoster.PROJECT_DIRECTORY_LIMIT, false]);
  assert.equal(ProjectRoster.PROJECT_DIRECTORY_LIMIT, 200);
  /* a declined request shows as declined while it is the latest */
  w.r.projectRequestAnswer({ projectId: "PROJ-X1", handle: "cal", answer: "decline", comment: "no", by: "ann", viewer: V("ann") });
  const x1d = w.r.projectDirectory({ viewer: V("cal") }).projects.find((p) => p.id === "PROJ-X1").request;
  assert.equal(x1d.state, "declined");
  assert.match(x1d.closed, /^\d{4}-/);
  /* a project at FULL is not listed: its owner, a participant (invited too), an administrator, the founder (every
     discoverable project is FULL to them); and an administrator neither invited nor joined to hidden H is not shown H,
     though below FULL of it (D54): a hidden project is never in the directory */
  assert.deepEqual(w.r.projectDirectory({ viewer: V("ann") }).projects, []);
  assert.deepEqual(w.r.projectDirectory({ viewer: V("second") }).projects, []);
  assert.deepEqual(w.r.projectDirectory({ viewer: V("admin") }).projects, [], "the founder's member:admin");
  for (const viewer of [V("second"), V("admin")]) assert.equal(w.m.inSight("PROJ-H", viewer), false, `${viewer}: H below FULL`);
  assert.deepEqual(w.r.projectDirectory({ viewer: V("bob") }).projects.map((p) => p.id),
    ["PROJ-D", "PROJ-X0", "PROJ-X1", "PROJ-X2", "PROJ-X3"], "invited to H only, which is hidden anyway");
  w.m.projectInvite({ projectId: "PROJ-X0", handle: "bob", by: "ann", viewer: V("ann") });
  assert.equal(w.r.projectDirectory({ viewer: V("bob") }).projects.some((p) => p.id === "PROJ-X0"), false, "invited is FULL");
  /* a hidden project is never listed; going hidden takes it out */
  w.m.projectVisibilitySet({ projectId: "PROJ-X3", setting: "hidden", by: "ann", viewer: V("ann") });
  assert.equal(w.r.projectDirectory({ viewer: V("cal") }).projects.some((p) => p.id === "PROJ-X3"), false);
  /* capped: lowered never raised; truncated measured by reading one past the cap */
  const cut = w.r.projectDirectory({ viewer: V("cal"), limit: 2 });
  assert.deepEqual([cut.count, cut.limit, cut.truncated, cut.projects.map((p) => p.id)], [2, 2, true, ["PROJ-D", "PROJ-X0"]]);
  const exact = w.r.projectDirectory({ viewer: V("cal"), limit: 4 });
  assert.deepEqual([exact.count, exact.truncated], [4, false]);
  for (const asked of [10_000, 0, "x", null, -1]) assert.equal(w.r.projectDirectory({ viewer: V("cal"), limit: asked }).limit,
    asked === -1 ? 1 : 200, String(asked));
  const before = snapshot(w);
  w.r.projectDirectory({ viewer: V("cal") });
  assert.equal(snapshot(w), before, "a read writes nothing");
});
