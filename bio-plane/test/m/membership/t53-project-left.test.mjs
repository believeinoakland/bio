import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

/* ann owns P; bob joined; cal joined and has asked to leave; dee outside */
async function projectWorld() {
  const w = await world().group("ann", "bob", "cal", "dee");
  w.project("PROJ-P", "The P project");
  w.m.projectClaimOwner({ projectId: "PROJ-P", memberId: "ann" });
  for (const h of ["bob", "cal"]) {
    w.m.projectInvite({ projectId: "PROJ-P", handle: h, by: "ann", viewer: V("ann") });
    w.m.projectJoin({ projectId: "PROJ-P", by: h, viewer: V("cal" === h ? "cal" : "bob") });
  }
  return w;
}
const remove = (w, handle, by = "ann") => w.m.projectRemove({ projectId: "PROJ-P", handle, by, viewer: V(by) });

test("R158 onProjectLeft: a removal calls the listener once, after the row is gone, with why removed", async () => {
  const w = await projectWorld();
  const heard = [];
  assert.deepEqual(w.m.onProjectLeft("ai-accounts", (n) => { heard.push({ ...n, still: w.m.participation(n.projectId, n.memberId) }); }),
    { ok: true, module: "ai-accounts" });
  const r = remove(w, "bob");
  assert.equal(r.ok, true);
  assert.equal(heard.length, 1);
  assert.deepEqual([heard[0].memberId, heard[0].projectId, heard[0].by, heard[0].why, heard[0].still],
    ["bob", "PROJ-P", "ann", "removed", null]);
  assert.equal(heard[0].at, r.at);
});

test("R158 a member who asked to leave is called at the removal, not at the request", async () => {
  const w = await projectWorld();
  const heard = [];
  w.m.onProjectLeft("ai-accounts", (n) => { heard.push(n.memberId); });
  assert.equal(w.m.projectLeave({ projectId: "PROJ-P", by: "cal", viewer: V("cal") }).state, "leaving");
  assert.deepEqual(heard, []);
  assert.equal(remove(w, "cal").ok, true);
  assert.deepEqual(heard, ["cal"]);
});

test("R158 acts that leave her a participant, and refused removals, call nobody", async () => {
  const w = await projectWorld();
  const heard = [];
  w.m.onProjectLeft("ai-accounts", (n) => { heard.push(n); });
  w.m.projectLeave({ projectId: "PROJ-P", by: "bob", viewer: V("bob") });
  assert.equal(remove(w, "bob", "cal").reason, "NOT_THE_OWNER");
  assert.equal(remove(w, "zed").reason, "NO_SUCH_HANDLE");
  assert.equal(remove(w, "dee").reason, "TARGET_NOT_A_PARTICIPANT");
  assert.equal(remove(w, "ann").reason, "OWNER");
  assert.deepEqual(heard, []);
});

test("R158 a throwing listener changes neither the removal nor another listener's call; registration refusals", async () => {
  const w = await projectWorld();
  const heard = [];
  w.m.onProjectLeft("ai-accounts", () => { throw new Error("listener fails"); });
  w.m.onProjectLeft("capture-sources", (n) => { heard.push(n.memberId); });
  const r = remove(w, "bob");
  assert.deepEqual([r.ok, r.removed], [true, true]);
  assert.equal(w.m.participation("PROJ-P", "bob"), null);
  assert.deepEqual(heard, ["bob"]);
  assert.equal(w.m.onProjectLeft("ai-accounts", () => {}).reason, "LISTENER_DECLARED");
  assert.equal(w.m.onProjectLeft("x-module", "nope").reason, "LISTENER_MALFORMED");
});
