import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Membership, viewerPredicate, GATE_MARK } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../checks/bio-checks.mjs";

/* H hidden, D discoverable, both owned by ann; bob invited to H; info I */
async function sightWorld() {
  const w = await world().group("ann", "bob", "cal");
  w.bundle("INFO-I");
  w.project("PROJ-H", "Hidden H");
  w.project("PROJ-D", "Discoverable D");
  w.m.projectClaimOwner({ projectId: "PROJ-H", memberId: "ann" });
  w.m.projectClaimOwner({ projectId: "PROJ-D", memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-H", handle: "bob", by: "ann", viewer: V("ann") });
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  return w;
}
const sees = (w, viewer) => {
  const g = viewerPredicate(viewer);
  return w.rows(`SELECT b.bundle_id FROM bundles b WHERE ${g.sql} ORDER BY b.bundle_id`, ...g.args).map((r) => r.bundle_id);
};

test("R43 viewerPredicate is the one rule of sight, and returns the viewer's member id", async () => {
  const w = await sightWorld();
  const all = ["INFO-I", "PROJ-D", "PROJ-H"];
  for (const cls of ["admin", "member", "probe", "daemon", "ai"]) {
    assert.deepEqual(sees(w, `${MACHINE_CLASS_PREFIX}${cls}`), all, cls);
    assert.equal(viewerPredicate(`${MACHINE_CLASS_PREFIX}${cls}`).member, null);
  }
  assert.deepEqual(sees(w, "admin"), all, "the founder's viewer");
  assert.deepEqual(sees(w, V("ann")), all, "owner");
  assert.deepEqual(sees(w, V("bob")), ["INFO-I", "PROJ-H"], "an invited participant sees the project");
  assert.deepEqual(sees(w, V("cal")), ["INFO-I"], "a non-participant sees every non-project bundle");
  assert.deepEqual(sees(w, V("second")), all, "an active administrator");
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.deepEqual(sees(w, V("second")), ["INFO-I"], "an inactive administrator is no administrator");
  for (const v of [null, undefined, "", "anna", `${MACHINE_CLASS_PREFIX}robot`, "member:", "member:a b", 42])
    assert.deepEqual(sees(w, v), [], `fails closed for ${JSON.stringify(v)}`);
  assert.equal(viewerPredicate(V("cal")).member, "cal");
  assert.equal(viewerPredicate("admin").member, null);
  for (const v of ["admin", V("x"), "junk"]) assert.ok(viewerPredicate(v).sql.includes(GATE_MARK));
});

test("R44 sight is FULL, EXISTENCE (discoverable, a member asking) or NONE; EXISTENCE refuses by id and name only", async () => {
  const w = await sightWorld();
  const { SIGHT_FULL: F, SIGHT_EXISTENCE: E, SIGHT_NONE: N } = Membership;
  assert.equal(w.m.sight("PROJ-D", V("ann")), F);
  assert.equal(w.m.sight("PROJ-D", V("cal")), E);
  assert.equal(w.m.sight("PROJ-D", `${MACHINE_CLASS_PREFIX}member`), F);
  assert.equal(w.m.sight("PROJ-H", V("cal")), N);
  assert.equal(w.m.sight("PROJ-D", "junk"), N, "EXISTENCE only for a viewer naming a member");
  assert.equal(w.m.sight("NOPE", V("cal")), N);
  const ex = w.m.existenceAct("PROJ-D", V("cal"));
  assert.deepEqual([ex.ok, ex.reason, ex.project, ex.name], [false, "PROJECT_SEEN_NOT_A_PARTICIPANT", "PROJ-D", "Discoverable D"]);
  assert.deepEqual(Object.keys(ex).sort(), ["check", "code", "detail", "name", "ok", "project", "reason", "translation"]);
  assert.equal(w.m.existenceAct("PROJ-D", null), null, "an internal caller is not asked");
  assert.equal(w.m.existenceAct("PROJ-H", V("cal")), null);
  // every project-naming service answers EXISTENCE with it, before any other check
  const calls = [
    () => w.m.projectJoin({ projectId: "PROJ-D", by: "cal", viewer: V("cal") }),
    () => w.m.projectLeave({ projectId: "PROJ-D", by: "cal", viewer: V("cal") }),
    () => w.m.projectInvite({ projectId: "PROJ-D", handle: "bob", by: "cal", viewer: V("cal") }),
    () => w.m.projectRemove({ projectId: "PROJ-D", handle: "bob", by: "cal", viewer: V("cal") }),
    () => w.m.projectOwnerAdd({ projectId: "PROJ-D", handle: "bob", by: "cal", viewer: V("cal") }),
    () => w.m.projectOwnerRemove({ projectId: "PROJ-D", handle: "ann", by: "cal", reason: "r", viewer: V("cal") }),
    () => w.m.projectOwnerRescue({ projectId: "PROJ-D", handle: "cal", by: "cal", reason: "r", viewer: V("cal") }),
    () => w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "hidden", by: "cal", viewer: V("cal") }),
    () => w.m.projectRequestAnswer({ projectId: "PROJ-D", handle: "cal", answer: "grant", by: "cal", viewer: V("cal") }),
    () => w.m.projectRequests({ projectId: "PROJ-D", by: "cal", viewer: V("cal") }),
  ];
  for (const c of calls) assert.deepEqual(c(), ex);
  // a read INSIDE the project is never widened by EXISTENCE
  assert.equal(w.m.projectVisibility({ projectId: "PROJ-D", viewer: V("cal") }).reason, "NO_SUCH_PROJECT");
  assert.equal(w.m.inSight("PROJ-D", V("cal")), false);
});

test("R61 every act naming a project the caller cannot see answers byte for byte as an id that names nothing", async () => {
  const w = await sightWorld();
  const as = (projectId) => [
    w.m.projectInvite({ projectId, handle: "bob", by: "cal", viewer: V("cal") }),
    w.m.projectOwnerAdd({ projectId, handle: "bob", by: "cal", viewer: V("cal") }),
    w.m.projectOwnerRemove({ projectId, handle: "ann", by: "cal", reason: "r", viewer: V("cal") }),
    w.m.projectOwnerRescue({ projectId, handle: "cal", by: "cal", reason: "r", viewer: V("cal") }),
    w.m.projectVisibilitySet({ projectId, setting: "hidden", by: "cal", viewer: V("cal") }),
    w.m.projectVisibility({ projectId, viewer: V("cal") }),
    w.m.projectRequest({ projectId, by: "cal", viewer: V("cal") }),
    w.m.projectRequestAnswer({ projectId, handle: "cal", answer: "grant", by: "cal", viewer: V("cal") }),
    w.m.projectRequests({ projectId, by: "cal", viewer: V("cal") }),
    w.m.projectParticipants({ projectId, by: "cal" }),
    w.m.projectOwnerArithmetic({ projectId, viewer: V("cal") }).live,
  ].map((x) => JSON.stringify(x).replaceAll(projectId, "<id>"));
  assert.deepEqual(as("PROJ-H"), as("PROJ-NEVER"));
  // sight before position: an outsider never learns ownership (NOT_THE_OWNER) of a hidden project
  for (const a of as("PROJ-H")) assert.doesNotMatch(a, /NOT_THE_OWNER|ADMIN_ONLY/);
});

test("R45 projectVisibilitySet: NOT_A_PROJECT, owners only, two settings; appended with by and reason; hidden lapses requests", async () => {
  const w = await sightWorld();
  w.bundle("INFO-J");
  assert.equal(w.m.projectVisibilitySet({ projectId: "INFO-J", setting: "hidden", by: "ann", viewer: V("ann") }).reason, "NOT_A_PROJECT");
  for (const by of ["bob", "second", "admin"])
    assert.equal(w.m.projectVisibilitySet({ projectId: "PROJ-H", setting: "discoverable", by, viewer: by === "admin" ? "admin" : V(by) }).reason,
      "PROJECT_VISIBILITY_NOT_THE_OWNER", by);
  assert.equal(w.m.projectVisibilitySet({ projectId: "PROJ-H", setting: "public", by: "ann", viewer: V("ann") }).reason,
    "PROJECT_VISIBILITY_UNKNOWN_SETTING");
  w.m.projectRequest({ projectId: "PROJ-D", comment: "please", by: "cal", viewer: V("cal") });
  const h = w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "hidden", reason: "closing up", by: "ann", viewer: V("ann") });
  assert.deepEqual([h.ok, h.setting, h.set_by, h.reason, h.requests_lapsed], [true, "hidden", "ann", "closing up", 1]);
  assert.deepEqual(w.row(`SELECT state, closed_by FROM project_join_requests`), { state: "lapsed", closed_by: "ann" });
  assert.equal(w.m.visibilityOf("PROJ-D"), "hidden");
  assert.equal(w.m.sight("PROJ-D", V("cal")), Membership.SIGHT_NONE);
  assert.equal(w.m.visibilityOf("PROJ-H"), "hidden", "a project with no record is hidden");
  assert.equal(w.rows(`SELECT * FROM project_visibility WHERE project_id='PROJ-D'`).length, 2, "appended, never overwritten");
});

test("R46 projectVisibility gives the setting and its history at FULL, else the absent answer", async () => {
  const w = await sightWorld();
  const v = w.m.projectVisibility({ projectId: "PROJ-D", viewer: V("ann") });
  assert.deepEqual([v.ok, v.setting, v.recorded, v.history.map((h) => [h.setting, h.set_by])],
    [true, "discoverable", true, [["discoverable", "ann"]]]);
  const h = w.m.projectVisibility({ projectId: "PROJ-H", viewer: V("bob") });
  assert.deepEqual([h.setting, h.recorded, h.history], ["hidden", false, []]);
  assert.match(h.note, /HIDDEN/);
  assert.equal(w.m.projectVisibility({ projectId: "PROJ-H", viewer: V("cal") }).reason, "NO_SUCH_PROJECT");
});

test("R47 visibilitySettingRefusal answers the unknown-setting refusal for anything but the two settings", () => {
  const m = new Membership({ sql: null });
  for (const ok of ["discoverable", "hidden"]) assert.equal(m.visibilitySettingRefusal(ok, null), null);
  for (const bad of ["", "Hidden", "public", null, undefined, 1, "discoverable "]) {
    const r = m.visibilitySettingRefusal(bad, null);
    assert.equal(r.reason, "PROJECT_VISIBILITY_UNKNOWN_SETTING", JSON.stringify(bad));
  }
});

test("R48 projectDirectory: needs a member; discoverable projects not at FULL, own latest request, id order, capped", async () => {
  const w = await sightWorld();
  assert.equal(w.m.projectDirectory({ viewer: `${MACHINE_CLASS_PREFIX}member` }).reason, "PROJECT_DIRECTORY_NEEDS_A_MEMBER");
  assert.equal(w.m.projectDirectory({ viewer: "admin" }).reason, "PROJECT_DIRECTORY_NEEDS_A_MEMBER");
  for (let i = 0; i < 4; i++) {
    w.project(`PROJ-X${i}`, `X ${i}`);
    w.m.projectClaimOwner({ projectId: `PROJ-X${i}`, memberId: "ann" });
    w.m.projectVisibilitySet({ projectId: `PROJ-X${i}`, setting: "discoverable", by: "ann", viewer: V("ann") });
  }
  w.m.projectRequest({ projectId: "PROJ-X1", comment: "hi", by: "cal", viewer: V("cal") });
  const d = w.m.projectDirectory({ viewer: V("cal") });
  assert.deepEqual(d.projects.map((p) => [p.id, p.name, p.request?.state ?? null]),
    [["PROJ-D", "Discoverable D", null], ["PROJ-X0", "X 0", null], ["PROJ-X1", "X 1", "open"], ["PROJ-X2", "X 2", null], ["PROJ-X3", "X 3", null]]);
  assert.deepEqual([d.limit, d.truncated], [Membership.PROJECT_DIRECTORY_LIMIT, false]);
  assert.equal(Membership.PROJECT_DIRECTORY_LIMIT, 200);
  assert.deepEqual(w.m.projectDirectory({ viewer: V("ann") }).projects, [], "a project at FULL is not listed");
  const cut = w.m.projectDirectory({ viewer: V("cal"), limit: 2 });
  assert.deepEqual([cut.count, cut.truncated, cut.projects.map((p) => p.id)], [2, true, ["PROJ-D", "PROJ-X0"]]);
  const exact = w.m.projectDirectory({ viewer: V("cal"), limit: 5 });
  assert.equal(exact.truncated, false, "measured by reading one past the cap");
  assert.equal(w.m.projectDirectory({ viewer: V("cal"), limit: 10_000 }).limit, 200, "never raised");
});
