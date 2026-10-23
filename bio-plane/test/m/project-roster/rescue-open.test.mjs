/* R39 (T51 fix round; C84; K4168): an administrator's `projectList` leads her to a project whose owners are all inactive,
   so the rescue (R5) has something to be offered from. At the interface: the list as each viewer of a battery reads it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, snapshot } from "./fixture.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const ids = (a) => a.projects.map((p) => p.id);
const row = (a, id) => a.projects.find((p) => p.id === id);

/* PROJ-A: hidden, its one owner ann revoked (stranded). PROJ-B: hidden, owned by cal, active. PROJ-C: hidden, ownerless
   by creation (a machine's project). PROJ-D: hidden, a member's own project (scope own), its owner eve revoked.
   PROJ-E: discoverable, its owner dee revoked. PROJ-F: hidden, its two owners fay and gus, one revoked. */
async function stranded() {
  const w = await world().group("ann", "bob", "cal", "dee", "eve", "fay", "gus");
  w.owned("PROJ-A", "ann", ["bob"]);
  w.owned("PROJ-B", "cal");
  w.project("PROJ-C");
  w.owned("PROJ-D", "eve");
  assert.equal(w.r.projectScopeSet({ projectId: "PROJ-D", scope: "own", reason: "mine alone", by: "eve", viewer: V("eve") }).ok, true);
  w.owned("PROJ-E", "dee");
  assert.equal(w.m.projectVisibilitySet({ projectId: "PROJ-E", setting: "discoverable", by: "dee", viewer: V("dee") }).ok, true);
  w.owned("PROJ-F", "fay", ["gus"]);
  assert.equal(w.r.projectOwnerAdd({ projectId: "PROJ-F", handle: "gus", by: "fay", viewer: V("fay") }).ok, true);
  for (const id of ["ann", "eve", "dee", "fay"]) w.m.memberSet({ memberId: id, status: "revoked", by: "admin" });
  return w;
}

test("R39 an administrator's list marks a hidden project whose owners are all inactive rescue_open, as a row naming only what her existence of it shows", async () => {
  const w = await stranded();
  for (const viewer of [V("second"), "admin", V("admin")]) {
    const l = w.r.projectList({ viewer });
    assert.equal(l.ok, true, viewer);
    const a = row(l, "PROJ-A");
    assert.ok(a, `${viewer}: the stranded hidden project is in her list`);
    assert.equal(a.rescue_open, true, viewer);
    assert.equal(a.name, "Project PROJ-A");
    /* at EXISTENCE nothing of the project beyond its id, name and the mark: no contents, participants or state */
    assert.deepEqual([a.stage, a.owner, a.participation, a.scope, a.members, a.lastChange, a.mine],
      [null, null, null, null, [], null, { in: false, owner: false }], `${viewer}: nothing of the project's contents`);
    assert.deepEqual(a.activity, [0, 0, 0, 0, 0, 0, 0, 0]);
    assert.doesNotMatch(JSON.stringify(a), /ann|bob/, `${viewer}: no participant is named`);
  }
  /* the act the mark leads to is open to her on exactly these predicates (R5) */
  assert.equal(w.r.projectOwnerRescue({ projectId: "PROJ-A", handle: "cal", by: "second", reason: "owners gone", viewer: V("second") }).ok, true);
});

test("R39 control: the mark is false on every other row of an administrator's list, and a project she sees at FULL stays listed as before", async () => {
  const w = await stranded();
  const l = w.r.projectList({ viewer: V("second") });
  assert.deepEqual(ids(l), ["PROJ-A", "PROJ-E"], "the stranded hidden one and the discoverable one; no other hidden project");
  assert.equal(row(l, "PROJ-E").rescue_open, false, "a discoverable project is not hidden, though its owner is gone");
  assert.equal(row(l, "PROJ-E").stage, "forming", "a row at FULL is R26's whole row");
  assert.ok(row(l, "PROJ-E").members.length > 0);
});

test("R39 control: a hidden project with an active owner, with no owner rows, or of own scope is not marked and is not in the list", async () => {
  const w = await stranded();
  const l = w.r.projectList({ viewer: V("second") });
  for (const id of ["PROJ-B", "PROJ-C", "PROJ-D", "PROJ-F"]) assert.equal(row(l, id), undefined, `${id}: not marked, so not in the list`);
  /* the predicates are the act's: each of these the rescue refuses */
  assert.equal(w.r.projectOwnerRescue({ projectId: "PROJ-B", handle: "bob", by: "second", reason: "x", viewer: V("second") }).reason, "OWNERS_ARE_ACTIVE");
  assert.equal(w.r.projectOwnerRescue({ projectId: "PROJ-C", handle: "bob", by: "second", reason: "x", viewer: V("second") }).reason, "NO_OWNERS");
  assert.equal(w.r.projectOwnerRescue({ projectId: "PROJ-D", handle: "bob", by: "second", reason: "x", viewer: V("second") }).reason, "PROJECT_SCOPE_OWN");
  /* the owner of F who is still active is the reason */
  assert.equal(w.r.projectOwnerRescue({ projectId: "PROJ-F", handle: "bob", by: "second", reason: "x", viewer: V("second") }).reason, "OWNERS_ARE_ACTIVE");
});

test("R39 control: a viewer who is not an administrator reads no rescue_open and no project he is not in; nor does a machine credential or a viewer naming nothing", async () => {
  const w = await stranded();
  for (const viewer of [V("bob"), V("cal"), V("dee"), `${MACHINE_CLASS_PREFIX}ai`, "junk", null, undefined]) {
    const l = w.r.projectList({ viewer });
    assert.equal(l.ok, true, String(viewer));
    for (const p of l.projects) assert.equal("rescue_open" in p, false, `${String(viewer)}: ${p.id} carries no rescue_open`);
  }
  assert.deepEqual(ids(w.r.projectList({ viewer: V("bob") })), ["PROJ-A"], "bob's own project only, as before: a member sees no other");
  assert.equal(row(w.r.projectList({ viewer: V("bob") }), "PROJ-A").stage, "forming");
  assert.equal(ids(w.r.projectList({ viewer: V("cal") })).includes("PROJ-A"), false, "cal is no participant of the stranded project");
});

test("R39 the marked rows page with the rest: every project once, in id order, whatever the page size, and a project added between pages is not repeated", async () => {
  const w = await stranded();
  w.owned("PROJ-G", "gus");
  w.m.memberSet({ memberId: "gus", status: "revoked", by: "admin" });
  const all = ids(w.r.projectList({ viewer: V("second") }));
  assert.deepEqual(all, ["PROJ-A", "PROJ-E", "PROJ-F", "PROJ-G"], "F's second owner is revoked now too");
  for (const limit of [1, 2, 3, 4]) {
    const seen = [];
    let after = null, pages = 0;
    do {
      const l = w.r.projectList({ viewer: V("second"), limit, after });
      seen.push(...ids(l));
      assert.equal(l.truncated, l.next !== null);
      assert.ok(l.count <= limit);
      after = l.next;
    } while (after && ++pages < 20);
    assert.deepEqual(seen, all, `limit ${limit}`);
  }
});

test("R39 the mark reads the owners' standing now: reactivating the owner takes the project out of the list, and it writes nothing", async () => {
  const w = await stranded();
  const before = snapshot(w);
  assert.equal(row(w.r.projectList({ viewer: V("second") }), "PROJ-A").rescue_open, true);
  assert.equal(snapshot(w), before, "the list wrote nothing");
  w.m.memberSet({ memberId: "ann", status: "active", by: "admin" });
  assert.equal(row(w.r.projectList({ viewer: V("second") }), "PROJ-A"), undefined);
});

test("R39 the op answers the same: projectlist through the ops map marks the project for the stamped administrator", async () => {
  const w = await stranded();
  const viaOp = w.ops(`viewer=${encodeURIComponent(V("second"))}&limit=5`).projectlist();
  assert.deepEqual(viaOp, w.r.projectList({ viewer: V("second"), limit: 5 }));
  assert.equal(row(viaOp, "PROJ-A").rescue_open, true);
});
