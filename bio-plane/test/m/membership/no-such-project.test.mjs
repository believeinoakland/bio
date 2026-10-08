import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { noSuchProject, MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

/* H hidden (owner ann), D discoverable (owner ann); cal outside both; INFO-I not a project */
async function nspWorld() {
  const w = await world().group("ann", "cal");
  w.bundle("INFO-I");
  for (const [id, title] of [["PROJ-H", "Hidden H"], ["PROJ-D", "Discoverable D"]]) {
    w.project(id, title);
    w.m.projectClaimOwner({ projectId: id, memberId: "ann" });
  }
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  return w;
}
const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));

test("R78 noSuchProject: the one answer, its row C-70.5, the id as asked, one fixed sentence for every caller", () => {
  const row = MEMBERSHIP_CHECKS.NO_SUCH_PROJECT;
  assert.equal(row.check, "C-70.5");
  assert.equal(row.where, "src/membership/index.mjs noSuchProject > is-project-seen", "its where names the one site");
  assert.equal(typeof row.translation, "string");
  const a = noSuchProject("PROJ-1");
  assert.deepEqual(a, { ok: false, reason: "NO_SUCH_PROJECT", code: "NO_SUCH_PROJECT", check: "C-70.5",
    translation: row.translation, project: "PROJ-1", detail: a.detail });
  assert.equal(typeof a.detail, "string");
  assert.ok(a.detail.length > 0);
  // one fixed sentence, whatever the id and whoever asks
  for (const id of ["PROJ-2", "", "x".repeat(500), "PROJ-H"]) assert.equal(noSuchProject(id).detail, a.detail, id);
  for (const id of [null, undefined]) {
    const n = noSuchProject(id);
    assert.equal(n.project, null, `${id}: null when none`);
    assert.equal(n.detail, a.detail);
  }
  assert.equal(noSuchProject().project, null);
  // the detail names nothing the caller did not send
  for (const secret of ["owner", "participant", "hidden", "discoverable"]) assert.ok(!a.detail.includes(secret), secret);
});

test("R78 extra adds the caller's own fields and never replaces one of the answer's", () => {
  const base = noSuchProject("PROJ-1");
  const withFinding = noSuchProject("PROJ-1", { finding: "FND-9", act: "ratify" });
  assert.deepEqual(withFinding, { ...base, finding: "FND-9", act: "ratify" });
  const hostile = noSuchProject("PROJ-1", { ok: true, reason: "X", code: "X", check: "C-0", translation: "t",
    project: "OTHER", detail: "d", finding: "F" });
  assert.deepEqual(hostile, { ...base, finding: "F" }, "every fixed field stands");
  for (const odd of [null, undefined, 7, "str", [1, 2], true])
    assert.deepEqual(noSuchProject("PROJ-1", odd), base, JSON.stringify(odd));
});

test("R78 writes nothing and never throws", async () => {
  const w = await nspWorld();
  const before = snapshot(w);
  const trap = {}; Object.defineProperty(trap, "boom", { enumerable: true, get() { throw new Error("getter"); } });
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  for (const id of [null, undefined, "", 0, 42, {}, [], "x'; DROP TABLE members; --", Symbol("s")])
    for (const extra of [null, {}, { a: 1 }, trap, revoked.proxy, []])
      assert.doesNotThrow(() => noSuchProject(id, extra), String(typeof id));
  assert.equal(snapshot(w), before);
});

test("R78 every act of this module answering the condition answers through it, byte for byte (absent, hidden, not seen)", async () => {
  const w = await nspWorld();
  const acts = (projectId, by = "cal", viewer = V("cal")) => ({
    projectInvite: w.m.projectInvite({ projectId, handle: "cal", by, viewer }),
    projectVisibilitySet: w.m.projectVisibilitySet({ projectId, setting: "hidden", by, viewer }),
  });
  for (const id of ["PROJ-NEVER", "PROJ-H"])
    for (const [name, got] of Object.entries(acts(id))) assert.deepEqual(got, noSuchProject(id), `${name} ${id}`);
  // an unrecognised viewer sees nothing, and is answered the same (a machine credential sees everything, R43)
  for (const [name, got] of Object.entries(acts("PROJ-H", "cal", "junk")))
    assert.deepEqual(got, noSuchProject("PROJ-H"), `${name} junk viewer`);
  // R31: an id that names nothing
  assert.deepEqual(w.m.projectClaimOwner({ projectId: "PROJ-NEVER", memberId: "cal" }), noSuchProject("PROJ-NEVER"));
  // and never at EXISTENCE, which is R77's answer, nor at FULL
  assert.equal(w.m.projectInvite({ projectId: "PROJ-D", handle: "cal", by: "cal", viewer: V("cal") }).reason,
    "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.equal(w.m.projectVisibilitySet({ projectId: "PROJ-H", setting: "hidden", by: "ann", viewer: V("ann") }).ok, true);
  // through the ops too
  assert.deepEqual(w.ops(`projectId=PROJ-H&handle=cal&by=cal&viewer=${encodeURIComponent(V("cal"))}`).projectinvite(),
    noSuchProject("PROJ-H"));
});
