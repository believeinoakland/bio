/* R26 (T47; N972; K3027 doubt 5): `projectList`, the projects a viewer sees at FULL with each one's recorded stage. At
   the interface: membership's acts set up participation, visibility and roles; the list is held, for every viewer of a
   battery, against membership's own answer to "does this viewer see this project at FULL" (`inSight`, its R43 and R80),
   so it is the one rule and never a second reading of it; and against R9's directory, whose complement it is. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, realWorld, V, snapshot } from "./fixture.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";
import { ProjectRoster } from "../../../src/project-roster/index.mjs";

/* ann owns A (hidden; bob joined, cal invited, dee leaving) and D (discoverable; nobody else); eve owns E (hidden, a
   closed stage) and F (discoverable, no recorded stage); "second" is an active administrator, "old" a revoked one who
   joined A; INFO-1 is not a project, and INFO-A belongs to A. */
async function listWorld() {
  const w = await world().group("ann", "bob", "cal", "dee", "eve", "zed", "old");
  w.owned("PROJ-A", "ann", ["bob", "dee", "old"], ["cal"]);
  w.m.projectLeave({ projectId: "PROJ-A", by: "dee", comment: "busy", viewer: V("dee") });
  w.owned("PROJ-D", "ann");
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  w.project("PROJ-E", "Project PROJ-E", "closed");
  w.m.projectClaimOwner({ projectId: "PROJ-E", memberId: "eve" });
  w.project("PROJ-F", "Project PROJ-F", null);
  w.m.projectClaimOwner({ projectId: "PROJ-F", memberId: "eve" });
  w.m.projectVisibilitySet({ projectId: "PROJ-F", setting: "discoverable", by: "eve", viewer: V("eve") });
  /* "old" an administrator once, revoked since: set on the roster directly (an administrator's removal is a vote, R7) */
  w.sql.exec(`UPDATE members SET role='admin', status='revoked' WHERE member_id='old'`);
  if (w.m.isAdministrator("old")) throw new Error("a revoked administrator is no administrator");
  w.bundle("INFO-1");
  w.bundle("INFO-A", "information", "inside A", "PROJ-A");
  return w;
}
const PROJECTS = ["PROJ-A", "PROJ-D", "PROJ-E", "PROJ-F"];
const ids = (a) => a.projects.map((p) => p.id);
const EMPTY = { ok: true, projects: [], count: 0, limit: ProjectRoster.PROJECT_LIST_LIMIT, truncated: false };

test("R26 projectList answers exactly the projects the viewer sees at FULL (membership R43, R44): a member's own in any state, an administrator's and the founder's discoverable ones too, never a hidden one they are not in; a machine credential every one", async () => {
  const w = await listWorld();
  const want = {
    ann: ["PROJ-A", "PROJ-D"], bob: ["PROJ-A"], cal: ["PROJ-A"], dee: ["PROJ-A"], eve: ["PROJ-E", "PROJ-F"], zed: [],
    second: ["PROJ-D", "PROJ-F"], old: ["PROJ-A"],
  };
  for (const [who, list] of Object.entries(want)) assert.deepEqual(ids(w.r.projectList({ viewer: V(who) })), list, who);
  /* the founder, in either spelling (D54); a machine credential of every class sees every project */
  for (const v of ["admin", V("admin")]) assert.deepEqual(ids(w.r.projectList({ viewer: v })), ["PROJ-D", "PROJ-F"], v);
  for (const cls of ["admin", "member", "probe", "daemon", "ai"])
    assert.deepEqual(ids(w.r.projectList({ viewer: `${MACHINE_CLASS_PREFIX}${cls}` })), PROJECTS, cls);
  /* the one rule: for every viewer, exactly the projects membership's inSight admits, in id order */
  const viewers = [...Object.keys(want).map(V), "admin", V("admin"), `${MACHINE_CLASS_PREFIX}member`, V("nobody"), "junk"];
  const check = () => {
    for (const v of viewers)
      assert.deepEqual(ids(w.r.projectList({ viewer: v })), PROJECTS.filter((p) => w.m.inSight(p, v)), `${v}: R43's set`);
  };
  check();
  /* sight follows the record at once: an administrator invited to hidden A, the founder invited to hidden E, a
     discoverable project hidden again, an outsider invited; each list moves with it */
  w.m.projectInvite({ projectId: "PROJ-A", handle: "second", by: "ann", viewer: V("ann") });
  assert.deepEqual(ids(w.r.projectList({ viewer: V("second") })), ["PROJ-A", "PROJ-D", "PROJ-F"], "invited to hidden A");
  w.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
              VALUES ('PROJ-E','admin','invited',0,'t','t')`);
  assert.deepEqual(ids(w.r.projectList({ viewer: "admin" })), ["PROJ-D", "PROJ-E", "PROJ-F"], "the founder invited to E");
  w.m.projectVisibilitySet({ projectId: "PROJ-F", setting: "hidden", by: "eve", viewer: V("eve") });
  assert.deepEqual(ids(w.r.projectList({ viewer: V("second") })), ["PROJ-A", "PROJ-D"], "F hidden: out of the administrator's");
  w.m.projectInvite({ projectId: "PROJ-D", handle: "zed", by: "ann", viewer: V("ann") });
  assert.deepEqual(ids(w.r.projectList({ viewer: V("zed") })), ["PROJ-D"], "invited is a participant");
  /* a participant removed is out of it */
  w.m.projectRemove({ projectId: "PROJ-A", handle: "bob", by: "ann", viewer: V("ann") });
  assert.deepEqual(ids(w.r.projectList({ viewer: V("bob") })), [], "removed");
  /* the founder before the claim is no administrator: only the projects it is in */
  w.creds.claimed = false;
  assert.deepEqual(ids(w.r.projectList({ viewer: "admin" })), PROJECTS.filter((p) => w.m.inSight(p, "admin")));
  w.creds.claimed = true;
  check();
});

test("R26 projectList is the complement of R9's directory among a member's projects in sight: every discoverable project is in exactly one of the two, a hidden one only in the list and only for its participants", async () => {
  const w = await listWorld();
  for (const who of ["ann", "bob", "cal", "dee", "eve", "zed"]) {
    const listed = ids(w.r.projectList({ viewer: V(who) }));
    const dir = w.r.projectDirectory({ viewer: V(who) }).projects.map((p) => p.id);
    assert.deepEqual(listed.filter((p) => dir.includes(p)), [], `${who}: disjoint`);
    for (const p of ["PROJ-D", "PROJ-F"]) assert.ok(listed.includes(p) !== dir.includes(p), `${who} ${p}: in exactly one`);
    for (const p of ["PROJ-A", "PROJ-E"]) {
      assert.equal(dir.includes(p), false, `${who} ${p}: a hidden project is never in the directory`);
      assert.equal(listed.includes(p), w.m.participation(p, who) !== null, `${who} ${p}: listed exactly as a participant`);
    }
  }
});

test("R26 each project is {id, name, stage}: name its title (record-core R34), stage its recorded current_state as recorded, null when none; only projects, in id order; the answer {ok, projects, count, limit, truncated}", async () => {
  const w = await listWorld();
  w.project("PROJ-0", null, "investigating");   // a legacy state, as recorded; no title
  w.project("PROJ-Z", "Zeta", "");              // an empty state records none
  const all = w.r.projectList({ viewer: `${MACHINE_CLASS_PREFIX}member` });
  assert.deepEqual(Object.keys(all).sort(), ["count", "limit", "ok", "projects", "truncated"]);
  assert.deepEqual([all.ok, all.count, all.limit, all.truncated], [true, 6, 200, false]);
  /* R27 (T47) adds each project's `owner`; no manifest entry is recorded here, so every one answers null */
  assert.deepEqual(all.projects, [
    { id: "PROJ-0", name: null, stage: "investigating", owner: null },
    { id: "PROJ-A", name: "Project PROJ-A", stage: "forming", owner: null },
    { id: "PROJ-D", name: "Project PROJ-D", stage: "forming", owner: null },
    { id: "PROJ-E", name: "Project PROJ-E", stage: "closed", owner: null },
    { id: "PROJ-F", name: "Project PROJ-F", stage: null, owner: null },
    { id: "PROJ-Z", name: "Zeta", stage: null, owner: null },
  ]);
  for (const p of all.projects) {
    assert.deepEqual(Object.keys(p).sort(), ["id", "name", "owner", "stage"], p.id);
    assert.equal(p.name, w.core.bundleInfo(p.id).title, `${p.id}: R34's title`);
  }
  /* no question count, no request, nothing of the project beyond its id, title, stage and opener (R27) */
  assert.doesNotMatch(JSON.stringify(all), /question|request|participant/);
  /* the stage is read as recorded, at each read: a change of the recorded state shows at once */
  w.sql.exec(`UPDATE bundles SET current_state='closed' WHERE bundle_id='PROJ-A'`);
  assert.equal(w.r.projectList({ viewer: V("ann") }).projects[0].stage, "closed");
  /* INFO-1 and INFO-A (belonging to A) are bundles a member sees, never projects */
  assert.equal(ids(w.r.projectList({ viewer: V("bob") })).some((p) => p.startsWith("INFO")), false);
});

test("R26 a viewer membership's R43 admits to nothing (none sent, or unrecognised) gets the empty list, never a refusal; projectList writes nothing and never throws", async () => {
  const w = await listWorld();
  const before = snapshot(w);
  for (const viewer of [undefined, null, "", "junk", "member:", "member:a b", "class:root", 7, {}, ["admin"], true])
    assert.deepEqual(w.r.projectList({ viewer }), EMPTY, String(viewer));
  for (const asked of [undefined, null, {}, "member:ann", 42, []]) assert.deepEqual(w.r.projectList(asked), EMPTY, String(asked));
  assert.deepEqual(w.r.projectList(), EMPTY);
  assert.deepEqual(w.ops("").projectlist(), EMPTY, "the op with no stamped viewer");
  /* a member with no project at all: also empty, and no refusal */
  assert.deepEqual(w.r.projectList({ viewer: V("zed") }), EMPTY);
  for (const limit of [Symbol("x"), 10n, { valueOf() { throw new Error("no"); } }, Infinity, NaN])
    assert.equal(w.r.projectList({ viewer: V("ann"), limit }).ok, true, String(typeof limit));
  for (const v of [V("ann"), "admin", `${MACHINE_CLASS_PREFIX}ai`, "junk"]) w.r.projectList({ viewer: v, limit: 2 });
  assert.equal(snapshot(w), before, "nothing written");
});

test("R26 limit follows R9's rule: PROJECT_LIST_LIMIT 200, lowered never raised; truncated measured by reading one row past the cap; the page the first in id order", async () => {
  assert.equal(ProjectRoster.PROJECT_LIST_LIMIT, 200);
  const w = await listWorld();
  const M = `${MACHINE_CLASS_PREFIX}member`;
  const cut = w.r.projectList({ viewer: M, limit: 2 });
  assert.deepEqual([cut.count, cut.limit, cut.truncated, ids(cut)], [2, 2, true, ["PROJ-A", "PROJ-D"]]);
  const again = w.r.projectList({ viewer: M, limit: 2 });
  assert.deepEqual(again, cut, "a page means the same thing twice");
  const exact = w.r.projectList({ viewer: M, limit: 4 });
  assert.deepEqual([exact.count, exact.truncated], [4, false], "a full page that is the whole answer is not truncated");
  assert.deepEqual([w.r.projectList({ viewer: M, limit: 3 }).truncated, w.r.projectList({ viewer: M, limit: "3" }).limit],
    [true, 3]);
  for (const asked of [10_000, 201, 0, "x", null, undefined, -1, -500])
    assert.equal(w.r.projectList({ viewer: M, limit: asked }).limit, asked < 0 ? 1 : 200, String(asked));
  /* the cap is measured over the viewer's own set, never the store's: ann sees two, so a cap of 2 cuts nothing */
  assert.deepEqual([w.r.projectList({ viewer: V("ann"), limit: 2 }).truncated, w.r.projectList({ viewer: V("ann"), limit: 1 }).truncated],
    [false, true]);
  /* at the ceiling: 205 projects a machine credential sees, the first 200 by id, truncated */
  for (let i = 0; i < 201; i++) w.project(`PROJ-N${String(i).padStart(3, "0")}`);
  const big = w.r.projectList({ viewer: M, limit: 10_000 });
  assert.deepEqual([big.count, big.limit, big.truncated, big.projects[0].id, big.projects.at(-1).id],
    [200, 200, true, "PROJ-A", "PROJ-N195"]);
});

test("R26 over the real record-core: name its bundleInfo title and stage its bundles.current_state, through the real sight of each viewer", async () => {
  const w = await realWorld();
  const { m, r, rc } = w;
  await w.claim();
  for (const id of ["second", "ann", "bob"]) await w.enrol(id, id === "second" ? "admin" : "member");
  w.bundle("PROJ-A");   // current_state 'forming', title its id
  w.bundle("PROJ-B");
  m.projectClaimOwner({ projectId: "PROJ-A", memberId: "ann" });
  m.projectClaimOwner({ projectId: "PROJ-B", memberId: "bob" });
  m.projectVisibilitySet({ projectId: "PROJ-B", setting: "discoverable", by: "bob", viewer: V("bob") });
  w.sql.exec(`UPDATE bundles SET current_state='closed', title='Bee' WHERE bundle_id='PROJ-B'`);
  const all = r.projectList({ viewer: `${MACHINE_CLASS_PREFIX}admin` });
  assert.deepEqual(all.projects.map(({ id, name, stage }) => ({ id, name, stage })),
    [{ id: "PROJ-A", name: "PROJ-A", stage: "forming" }, { id: "PROJ-B", name: "Bee", stage: "closed" }]);
  for (const p of all.projects) assert.deepEqual([p.name, p.stage], [rc.bundleInfo(p.id).title, rc.head(p.id).currentState], p.id);
  assert.deepEqual(ids(r.projectList({ viewer: V("ann") })), ["PROJ-A"]);
  assert.deepEqual(ids(r.projectList({ viewer: V("second") })), ["PROJ-B"], "an administrator: the discoverable one only");
  assert.deepEqual(ids(r.projectList({ viewer: "admin" })), ["PROJ-B"], "the founder: the discoverable one only");
  assert.deepEqual(r.projectList({ viewer: "junk" }), EMPTY);
});
