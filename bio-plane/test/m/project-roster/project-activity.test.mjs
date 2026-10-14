/* R28 (T47; N1025; DEC-214 (3); Bob's K3142): `projectlist` answers, for each listed project, `members` (its
   participants as `{member, handle}`, never one the viewer may not see), `activity` (eight integers, the acts per week
   over the last eight weeks counted from the server's instant, oldest first, counting only acts on records the viewer
   may see) and `lastChange` (the instant of the newest such act, or null). At the interface: membership's acts set up
   members and participation, manifest entries are the record's acts (record-core R37), the host's clock is the
   server's instant, and the list is read through `projectList` and its op. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, realWorld, V, snapshot } from "./fixture.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";
import { ProjectRoster } from "../../../src/project-roster/index.mjs";

const M = `${MACHINE_CLASS_PREFIX}member`;
const DAY = 24 * 60 * 60 * 1000, WEEK = 7 * DAY;
const NOW = Date.parse("2026-10-14T12:00:00.000Z");
const iso = (ms) => new Date(ms).toISOString();
const of = (answer, id) => answer.projects.find((p) => p.id === id);
const handles = (p) => p.members.map((x) => x.handle);
const ZEROS = [0, 0, 0, 0, 0, 0, 0, 0];

/* A hidden: ann owns it, bob joined, cal invited, dee leaving, old (revoked since) joined. D discoverable: ann alone.
   E hidden: eve alone. M: a project no member opened, with no participant. */
async function factsWorld() {
  const w = await world().group("ann", "bob", "cal", "dee", "eve", "old", "zed");
  w.owned("PROJ-A", "ann", ["bob", "dee", "old"], ["cal"]);
  w.m.projectLeave({ projectId: "PROJ-A", by: "dee", comment: "busy", viewer: V("dee") });
  w.m.memberSet({ memberId: "old", status: "revoked", by: "admin" });
  w.owned("PROJ-D", "ann");
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  w.owned("PROJ-E", "eve");
  w.project("PROJ-M");
  w.time.now = NOW;
  return w;
}

test("R28 members: each listed project's participants as R1 lists them to a viewer at FULL, {member, handle}, owners first then by handle, the founder as R27 names it; a project listed nowhere shows no one", async () => {
  const w = await factsWorld();
  const a = of(w.r.projectList({ viewer: M }), "PROJ-A");
  assert.deepEqual(a.members, [{ member: "ann", handle: "ann" }, { member: "bob", handle: "bob" },
    { member: "cal", handle: "cal" }, { member: "dee", handle: "dee" }, { member: "old", handle: "old" }],
    "every participant in any state (joined, invited, leaving) and whatever the member's status, as R1");
  /* exactly R1's roster, in R1's order, for every viewer the project is listed to */
  const viewers = [V("ann"), V("bob"), V("cal"), V("dee"), V("eve"), V("zed"), V("second"), "admin", V("admin"), M,
    `${MACHINE_CLASS_PREFIX}ai`, "junk"];
  const r1 = (id) => w.r.projectParticipants({ projectId: id, by: w.m.projectOwners(id)[0] }).participants.map((x) => x.handle);
  const check = () => {
    for (const v of viewers)
      for (const p of w.r.projectList({ viewer: v }).projects) {
        assert.equal(w.m.inSight(p.id, v), true, `${v} ${p.id}: listed only at FULL`);
        if (w.m.projectOwners(p.id).length) assert.deepEqual(handles(p), r1(p.id), `${v} ${p.id}: R1's roster`);
        for (const x of p.members)
          assert.deepEqual(Object.keys(x).sort(), x.member === "admin" ? ["founder", "handle", "member"] : ["handle", "member"],
            `${v} ${p.id}`);
      }
  };
  check();
  assert.deepEqual(of(w.r.projectList({ viewer: M }), "PROJ-M").members, [], "a project with no participant");
  /* owners first: bob made an owner moves ahead of cal; a member removed is gone at once; the handle is membership's */
  w.r.projectOwnerAdd({ projectId: "PROJ-A", handle: "bob", by: "ann", viewer: V("ann") });
  w.m.projectRemove({ projectId: "PROJ-A", handle: "cal", by: "ann", viewer: V("ann") });
  w.m.projectInvite({ projectId: "PROJ-A", handle: "zed", by: "ann", viewer: V("ann") });
  assert.deepEqual(handles(of(w.r.projectList({ viewer: V("zed") }), "PROJ-A")), ["ann", "bob", "dee", "old", "zed"]);
  /* the founder invited to a project: a participant with no roster row, named as R29 names her */
  w.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
              VALUES ('PROJ-E','admin','invited',0,'t','t')`);
  assert.deepEqual(of(w.r.projectList({ viewer: V("eve") }), "PROJ-E").members,
    [{ member: "eve", handle: "eve" }, { member: "admin", handle: null, founder: true }]);
  check();
  /* control: a viewer who may not see a project is shown none of its members; nobody else's appear anywhere */
  for (const v of [V("bob"), V("zed"), V("second"), V("dee")])   // the founder, invited above, is in E
    assert.doesNotMatch(JSON.stringify(w.r.projectList({ viewer: v })), /"eve"/, `${v}: E's members unseen`);
  assert.equal(of(w.r.projectList({ viewer: V("bob") }), "PROJ-E"), undefined);
  assert.deepEqual(w.r.projectList({ viewer: "junk" }).projects, []);
});

test("R28 activity: eight weekly counts from the server's instant, oldest first, week k back holding (now - (k+1)·7d, now - k·7d]; acts on the project and on its records; lastChange the newest act's instant as recorded", async () => {
  const w = await factsWorld();
  w.bundle("INFO-A", "information", "a note in A", "PROJ-A");   // a record of A
  w.bundle("INFO-X", "information", "outside every project");   // a record of no project
  const at = (id, ms, author = "ann") => w.entry(id, author, iso(ms));
  at("PROJ-A", NOW);                         // the newest week, at the instant itself
  at("INFO-A", NOW - 1);                     // the newest week, a record of A
  at("PROJ-A", NOW - WEEK + 1);              // the newest week, at its oldest edge
  at("PROJ-A", NOW - WEEK);                  // the second newest week, at its newest edge
  at("INFO-A", NOW - 3 * WEEK - DAY);        // four weeks back
  at("PROJ-A", NOW - 8 * WEEK + 1);          // the oldest week, at its oldest edge
  at("PROJ-A", NOW - 8 * WEEK);              // nine weeks back: in no week
  at("PROJ-A", NOW + 1);                     // after now: in no week
  w.entry("PROJ-A", "ann", "not an instant"); // unreadable: in no week, never the newest
  at("INFO-X", NOW - DAY);                   // another record's act: none of A's
  const a = of(w.r.projectList({ viewer: V("ann") }), "PROJ-A");
  assert.deepEqual(a.activity, [1, 0, 0, 0, 1, 0, 1, 3]);
  assert.equal(a.activity.length, 8);
  for (const n of a.activity) assert.ok(Number.isInteger(n) && n >= 0);
  assert.equal(a.lastChange, iso(NOW + 1), "the newest act's instant as recorded");
  /* instants compared as instants, never as strings: a later second spelled without milliseconds is newer */
  w.project("PROJ-S"); w.m.projectClaimOwner({ projectId: "PROJ-S", memberId: "ann" });
  w.entry("PROJ-S", "ann", "2026-10-13T09:00:00.500Z");
  w.entry("PROJ-S", "ann", "2026-10-13T09:00:01Z");
  w.entry("PROJ-S", "ann", "2026-10-13T09:00:00.999Z");
  const s = of(w.r.projectList({ viewer: V("ann") }), "PROJ-S");
  assert.deepEqual([s.activity, s.lastChange], [[0, 0, 0, 0, 0, 0, 0, 3], "2026-10-13T09:00:01Z"]);
  /* at one instant, the later recorded is the newest */
  w.project("PROJ-T"); w.m.projectClaimOwner({ projectId: "PROJ-T", memberId: "ann" });
  w.entry("PROJ-T", "ann", "2026-10-13T09:00:00.000Z");
  w.entry("PROJ-T", "bob", "2026-10-13T09:00:00Z");
  assert.equal(of(w.r.projectList({ viewer: V("ann") }), "PROJ-T").lastChange, "2026-10-13T09:00:00Z");
  /* control: a project with no act in eight weeks answers eight zeros; its last change stays its newest act */
  at("PROJ-D", NOW - 20 * WEEK);
  const d = of(w.r.projectList({ viewer: V("ann") }), "PROJ-D");
  assert.deepEqual([d.activity, d.lastChange], [ZEROS, iso(NOW - 20 * WEEK)]);
  /* and one with no act at all: eight zeros and null */
  const m = of(w.r.projectList({ viewer: M }), "PROJ-M");
  assert.deepEqual([m.activity, m.lastChange], [ZEROS, null]);
  /* the server's instant moves the weeks: a week later, everything is one week older */
  w.time.now = NOW + WEEK;
  assert.deepEqual(of(w.r.projectList({ viewer: V("ann") }), "PROJ-A").activity, [0, 0, 0, 1, 0, 1, 3, 1],
    "the oldest act leaves; the one after the old now joins the newest week");
  w.time.now = NOW;
  /* the op answers the same, and a `now` in the query is never the server's instant */
  const asked = (q) => w.ops(`viewer=${encodeURIComponent(V("ann"))}${q}`).projectlist();
  assert.deepEqual(asked(""), w.r.projectList({ viewer: V("ann") }));
  assert.deepEqual(asked(`&now=${NOW + 10 * WEEK}`), asked(""), "a query's now is ignored");
  assert.deepEqual(asked(`&now=${encodeURIComponent(iso(NOW - WEEK))}`), asked(""));
});

test("R28 control: an act on a record the viewer may not see moves neither activity nor lastChange; the viewer who sees it counts it; the read writes nothing and never throws", async () => {
  const w = await factsWorld();
  /* Q: a hidden project only cal is in, recorded as belonging to A (record-core R34); I: a record of Q */
  w.project("PROJ-Q");
  w.sql.exec(`UPDATE bundles SET project='PROJ-A' WHERE bundle_id='PROJ-Q'`);
  w.m.projectClaimOwner({ projectId: "PROJ-Q", memberId: "cal" });
  w.bundle("INFO-Q", "information", "inside Q", "PROJ-Q");
  w.entry("PROJ-A", "ann", iso(NOW - 2 * WEEK));
  w.entry("PROJ-Q", "cal", iso(NOW - DAY));         // an act on a record ann may not see
  w.entry("INFO-Q", "cal", iso(NOW - 2 * DAY));     // Q's own record: never A's
  for (const v of [V("ann"), V("bob"), V("dee"), "admin"]) {
    const sees = w.r.projectList({ viewer: v }).projects.map((p) => p.id);
    if (!sees.includes("PROJ-A")) continue;
    const a = of(w.r.projectList({ viewer: v }), "PROJ-A");
    assert.equal(w.m.inSight("PROJ-Q", v), false, v);
    assert.deepEqual([a.activity, a.lastChange], [[0, 0, 0, 0, 0, 1, 0, 0], iso(NOW - 2 * WEEK)], `${v}: Q's act unseen`);
    assert.doesNotMatch(JSON.stringify(w.r.projectList({ viewer: v })), /PROJ-Q|INFO-Q/, v);
  }
  /* the controls: cal, who sees Q and is in A, and a machine credential count Q's act in A; Q's own record is Q's */
  for (const v of [V("cal"), M]) {
    const a = of(w.r.projectList({ viewer: v }), "PROJ-A");
    assert.deepEqual([a.activity, a.lastChange], [[0, 0, 0, 0, 0, 1, 0, 1], iso(NOW - DAY)], `${v}: Q's act seen`);
    const q = of(w.r.projectList({ viewer: v }), "PROJ-Q");
    assert.deepEqual([q.activity, q.lastChange], [[0, 0, 0, 0, 0, 0, 0, 2], iso(NOW - DAY)], `${v}: Q's own`);
  }
  /* sight follows the record at once: ann invited to Q now counts it */
  w.m.projectInvite({ projectId: "PROJ-Q", handle: "ann", by: "cal", viewer: V("cal") });
  assert.equal(of(w.r.projectList({ viewer: V("ann") }), "PROJ-A").lastChange, iso(NOW - DAY));
  /* a project the viewer may not see is absent with its activity: E's act appears for nobody outside E */
  w.entry("PROJ-E", "eve", iso(NOW - DAY));
  for (const v of [V("ann"), V("bob"), V("second"), "admin"])
    assert.doesNotMatch(JSON.stringify(w.r.projectList({ viewer: v })), /PROJ-E/, v);
  /* writes nothing */
  const before = snapshot(w);
  for (const v of [V("ann"), V("cal"), M, "admin", "junk"]) w.r.projectList({ viewer: v, limit: 2 });
  assert.equal(snapshot(w), before, "nothing written");
  /* never throws: a host clock that throws or reads as no number is the server's own instant */
  for (const clock of [() => { throw new Error("no clock"); }, () => NaN, () => "soon", () => Symbol("x")]) {
    const r = new ProjectRoster({ sql: w.sql, core: w.core, membership: w.m, clock });
    const a = r.projectList({ viewer: M });
    assert.equal(a.ok, true);
    for (const p of a.projects) assert.equal(p.activity.length, 8);
  }
  /* the cap cuts members and activity with their projects */
  const cut = w.r.projectList({ viewer: M, limit: 1 });
  assert.deepEqual([cut.truncated, cut.projects.map((p) => p.id), cut.projects[0].activity],
    [true, ["PROJ-A"], [0, 0, 0, 0, 0, 1, 0, 1]]);
});

test("R28 over the real record-core: each commit is one act at its time, a record's commits count for its project, members are membership's; the answer is additive to R26's and R27's", async () => {
  const w = await realWorld();
  const { m, r, rc } = w;
  await w.claim();
  for (const id of ["ann", "bob"]) await w.enrol(id);
  w.time.now = NOW;
  const commit = (bundleId, type, project, author, ms, snapKey) => rc.transact(() => rc.commit({ bundleId, type,
    title: bundleId, project, snapKey, author, base: null, files: [], state: "forming", group: "g", created: iso(ms),
    lastUpdated: iso(ms), at: iso(ms) }));
  commit("PROJ-A", "project", null, "ann", NOW - 10 * WEEK, "K1");
  commit("PROJ-A", "project", null, "bob", NOW - 2 * DAY, "K2");
  commit("INFO-A", "information", "PROJ-A", "bob", NOW - 9 * DAY, "K3");
  commit("INFO-A", "information", "PROJ-A", "ann", NOW - DAY, "K4");
  m.reindexProjectSight("PROJ-A");
  m.projectClaimOwner({ projectId: "PROJ-A", memberId: "ann" });
  m.projectInvite({ projectId: "PROJ-A", handle: "bob", by: "ann", viewer: V("ann") });
  for (const v of [V("ann"), V("bob"), `${MACHINE_CLASS_PREFIX}admin`]) {
    const [a] = r.projectList({ viewer: v }).projects;
    assert.deepEqual({ id: a.id, name: a.name, stage: a.stage, owner: a.owner },
      { id: "PROJ-A", name: "PROJ-A", stage: "forming", owner: { member: "ann", handle: "ann" } }, `${v}: R26, R27 unchanged`);
    assert.deepEqual(a.members, [{ member: "ann", handle: "ann" }, { member: "bob", handle: "bob" }], v);
    assert.deepEqual(a.activity, [0, 0, 0, 0, 0, 0, 1, 2], v);
    assert.equal(a.lastChange, iso(NOW - DAY), v);
  }
  assert.deepEqual(r.projectList({ viewer: "junk" }).projects, [], "control: a viewer R43 admits to nothing");
});
