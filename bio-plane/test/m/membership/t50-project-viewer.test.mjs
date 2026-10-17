/* T50 (T50-2; N1186, K3557): R149 a viewer that carries a project (`projectViewer`), and R150 the reach beyond a project's
   own records (`registerProjectReach`). A run's reads within its project: the member's own sight, narrowed to the project's
   reach, never widened. Each at the interface, each with its controls. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Membership, MODULE_ORDER, projectViewer, viewerPredicate, hiddenBundles } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

/* A, B discoverable and H hidden, each with a record that belongs to it; two shared records, one A cites (SHARED-A) and one
   it does not (SHARED-X); a record belonging to no project (LOOSE). ann owns A, B and H; `second` is an active
   administrator, in none of them; cal is an ordinary member invited to H and joined to A. */
async function reachWorld() {
  const w = await world().group("ann", "cal");
  for (const [p, rec] of [["PROJ-A", "REC-A"], ["PROJ-B", "REC-B"], ["PROJ-H", "REC-H"]]) {
    w.project(p);
    w.bundle(rec, "information", `record of ${p}`, p);
    w.m.projectClaimOwner({ projectId: p, memberId: "ann" });
  }
  for (const p of ["PROJ-A", "PROJ-B"])
    w.m.projectVisibilitySet({ projectId: p, setting: "discoverable", by: "ann", viewer: V("ann") });
  w.bundle("SHARED-A"); w.bundle("SHARED-X"); w.bundle("LOOSE");
  w.m.projectInvite({ projectId: "PROJ-A", handle: "cal", by: "ann", viewer: V("ann") });
  w.m.projectJoin({ projectId: "PROJ-A", by: "cal" });
  return w;
}
/* the bundles a viewer's compiled gate passes, through the module-level function (no reader consulted) */
const gate = (w, viewer) => {
  const g = viewerPredicate(viewer);
  return w.rows(`SELECT b.bundle_id FROM bundles b WHERE ${g.sql} ORDER BY b.bundle_id`, ...g.args).map((r) => r.bundle_id);
};
/* the bundles an instance's sight passes, readers consulted */
const seen = (w, viewer) => w.rows(`SELECT bundle_id FROM bundles ORDER BY bundle_id`).map((r) => r.bundle_id)
  .filter((id) => w.m.inSight(id, viewer));
const hidden = (w, viewer) => {
  const h = w.m.hiddenBundlesFor(viewer);
  return h === null ? [] : w.rows(`SELECT bundle_id FROM bundles WHERE bundle_id IN ${h.sql} ORDER BY bundle_id`, ...h.args)
    .map((r) => r.bundle_id);
};

test("R149 a viewer carrying a project admits exactly what R43 admits the member to within the project's own bundle and the bundles belonging to it; a record of another project, and one of no project, is refused though the member sees it", async () => {
  const w = await reachWorld();
  const pv = projectViewer(V("second"), "PROJ-A");
  assert.deepEqual(gate(w, V("second")), ["LOOSE", "PROJ-A", "PROJ-B", "REC-A", "REC-B", "SHARED-A", "SHARED-X"],
    "the plain viewer: an administrator sees the discoverable projects, not the hidden one");
  assert.deepEqual(gate(w, pv), ["PROJ-A", "REC-A"], "the project's own bundle and what belongs to it");
  assert.deepEqual(seen(w, pv), ["PROJ-A", "REC-A"], "inSight agrees with the compiled gate");
  assert.equal(w.m.inSight("REC-B", pv), false, "a record of B, though discoverable and seen by the plain viewer");
  assert.equal(w.m.inSight("REC-B", V("second")), true, "control: the same member's plain viewer admits it");
  assert.equal(w.m.inSight("LOOSE", pv), false, "a record belonging to no project that A does not cite");
  assert.equal(w.m.inSight("LOOSE", V("second")), true);
  assert.equal(w.m.inSight("PROJ-B", pv), false, "another project's own bundle");
  /* a bundle of the project the member herself may not see (R43) is not admitted either */
  const hv = projectViewer(V("second"), "PROJ-H");
  assert.deepEqual(gate(w, hv), [], "an administrator neither invited nor joined to hidden H sees none of it");
  assert.equal(w.m.inSight("REC-H", hv), false);
  assert.equal(w.m.inSight("REC-H", projectViewer(V("ann"), "PROJ-H")), true, "control: its owner reaches it");
  assert.deepEqual(gate(w, projectViewer(V("ann"), "PROJ-H")), ["PROJ-H", "REC-H"]);
  const cal = projectViewer(V("cal"), "PROJ-A");
  assert.deepEqual(gate(w, cal), ["PROJ-A", "REC-A"], "a joined participant: A and its record");
  assert.deepEqual(gate(w, projectViewer(V("cal"), "PROJ-B")), [], "cal sees B whole, but not as a participant: its bundle is a project she is outside of");
});

test("R149 the founder's viewer, either spelling, carries a project; positionalMember answers for it the member id of the viewer it was made from", async () => {
  const w = await reachWorld();
  for (const [base, member] of [["admin", null], [V("admin"), "admin"], [V("ann"), "ann"], [V("second"), "second"]]) {
    const pv = projectViewer(base, "PROJ-A");
    assert.notEqual(pv, base, `${base}: a viewer carrying a project`);
    assert.equal(w.m.positionalMember(pv), member, `${base}: who is asking`);
    assert.equal(w.m.positionalMember(base), member);
    assert.equal(viewerPredicate(pv).member, member);
    assert.equal(viewerPredicate(pv).project, "PROJ-A");
  }
  assert.deepEqual(gate(w, projectViewer("admin", "PROJ-A")), ["PROJ-A", "REC-A"], "the founder: discoverable A");
  assert.deepEqual(gate(w, projectViewer(V("admin"), "PROJ-A")), ["PROJ-A", "REC-A"]);
  assert.deepEqual(gate(w, projectViewer("admin", "PROJ-H")), [], "and hidden H, which she is not in, stays out of her reach");
  /* identity wins over the viewer, as for any viewer */
  assert.equal(w.m.positionalMember(V("ann"), projectViewer(V("cal"), "PROJ-A")), "cal");
});

test("R149 sight is the member's own sight of the carried project and NONE for any other, so no other project's existence is shown; inSight and hiddenBundles follow the gate, the complement spelled once", async () => {
  const w = await reachWorld();
  const pv = projectViewer(V("second"), "PROJ-A");
  assert.equal(w.m.sight("PROJ-A", pv), Membership.SIGHT_FULL);
  assert.equal(w.m.sight("PROJ-B", pv), Membership.SIGHT_NONE, "B is discoverable and the plain viewer sees it");
  assert.equal(w.m.sight("PROJ-B", V("second")), Membership.SIGHT_FULL, "control");
  assert.equal(w.m.sight("PROJ-H", pv), Membership.SIGHT_NONE, "H exists, and the plain administrator sees its existence");
  assert.equal(w.m.sight("PROJ-H", V("second")), Membership.SIGHT_EXISTENCE, "control");
  assert.equal(w.m.sight("PROJ-NOPE", pv), Membership.SIGHT_NONE);
  /* the member's own sight of the carried project: an outsider carrying a hidden one has existence of it, as she would */
  assert.equal(w.m.sight("PROJ-H", projectViewer(V("second"), "PROJ-H")), Membership.SIGHT_EXISTENCE);
  assert.equal(w.m.sight("PROJ-H", projectViewer(V("cal"), "PROJ-H")), Membership.SIGHT_NONE, "an ordinary member sees a hidden project as nothing");
  assert.equal(w.m.sight("PROJ-H", V("cal")), Membership.SIGHT_NONE);
  assert.equal(w.m.existenceAct("PROJ-B", pv), null, "no other project's existence is shown to it");
  /* hiddenBundles is the complement of the gate over every bundle, spelled once */
  const all = w.rows(`SELECT bundle_id FROM bundles ORDER BY bundle_id`).map((r) => r.bundle_id);
  for (const viewer of [pv, projectViewer(V("ann"), "PROJ-H"), projectViewer(V("second"), "PROJ-H"), projectViewer("admin", "PROJ-A")]) {
    const g = new Set(gate(w, viewer));
    assert.deepEqual(hidden(w, viewer), all.filter((id) => !g.has(id)), viewer);
    const h = hiddenBundles(viewer);
    assert.deepEqual(w.rows(`SELECT bundle_id FROM bundles WHERE bundle_id IN ${h.sql} ORDER BY bundle_id`, ...h.args)
      .map((r) => r.bundle_id), all.filter((id) => !g.has(id)), `${viewer}: the module-level complement`);
  }
});

test("R149 controls: a viewer with no project, a machine viewer, one R43 admits to nothing, and an absent or empty project answer the viewer unchanged; a viewer already carrying one is not re-scoped", async () => {
  const w = await reachWorld();
  for (const project of [undefined, null, "", 42, {}, ["PROJ-A"]])
    assert.equal(projectViewer(V("second"), project), V("second"), `project ${JSON.stringify(project)}`);
  for (const viewer of [`${MACHINE_CLASS_PREFIX}admin`, `${MACHINE_CLASS_PREFIX}ai`, `${MACHINE_CLASS_PREFIX}member`])
    assert.equal(projectViewer(viewer, "PROJ-A"), viewer, "a machine credential names no member");
  for (const viewer of [null, undefined, "", "anna", "member:", "member:a b", 42, `${MACHINE_CLASS_PREFIX}robot`])
    assert.equal(projectViewer(viewer, "PROJ-A"), viewer, `${JSON.stringify(viewer)} is returned as it came`);
  /* read as R43 states: a machine viewer with a project sees every bundle, an unrecognised one nothing */
  assert.equal(gate(w, projectViewer(`${MACHINE_CLASS_PREFIX}admin`, "PROJ-A")).length, w.rows(`SELECT 1 FROM bundles`).length);
  assert.deepEqual(gate(w, projectViewer("anna", "PROJ-A")), []);
  /* the same member's plain viewer still admits B's record */
  assert.equal(w.m.inSight("REC-B", V("second")), true);
  /* a viewer already carrying a project is answered unchanged: the reach is never re-scoped */
  const pv = projectViewer(V("second"), "PROJ-A");
  assert.equal(projectViewer(pv, "PROJ-B"), pv);
  /* a hand-written spelling can only narrow: a machine class or a stranger with an @ sees nothing */
  assert.deepEqual(gate(w, `${MACHINE_CLASS_PREFIX}admin@PROJ-A`), []);
  assert.deepEqual(gate(w, "anna@PROJ-A"), []);
  /* the project string is bound, never spelled into the statement */
  const evil = projectViewer(V("ann"), "x') OR 1=1 --");
  assert.deepEqual(gate(w, evil), []);
  assert.equal(viewerPredicate(evil).sql.includes("OR 1=1"), false);
  /* it writes nothing and never throws */
  const before = JSON.stringify(w.rows(`SELECT * FROM project_participants`));
  assert.doesNotThrow(() => { projectViewer(Symbol.iterator, "P"); projectViewer({}, {}); viewerPredicate(Symbol.iterator); });
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM project_participants`)), before);
});

/* ---------------------------------------------------------------- R150 --------------------------------------------- */

test("R150 the registered readers' ids are all admitted, in MODULE_ORDER, whatever order they registered in: provenance's and connections' stand-ins add what A cites; with none registered only the project's own bundles are reached", async () => {
  const w = await reachWorld();
  const pv = projectViewer(V("second"), "PROJ-A");
  assert.deepEqual(seen(w, pv), ["PROJ-A", "REC-A"], "control: none registered, the project's own bundle and what belongs to it");
  assert.deepEqual(w.m.projectReach("PROJ-A"), []);
  const asked = [];
  const reader = (module, ids) => ({ project }) => { asked.push([module, project]); return project === "PROJ-A" ? ids : []; };
  /* registered in the reverse of MODULE_ORDER */
  const [first, second] = [MODULE_ORDER.indexOf("provenance"), MODULE_ORDER.indexOf("connections")];
  assert.ok(first >= 0 && second > first);
  assert.deepEqual(w.m.registerProjectReach("connections", reader("connections", ["SHARED-A", "REC-A"])), { ok: true, module: "connections" });
  assert.deepEqual(w.m.registerProjectReach("provenance", reader("provenance", ["LOOSE"])), { ok: true, module: "provenance" });
  assert.deepEqual(w.m.projectReach("PROJ-A"), ["LOOSE", "SHARED-A", "REC-A"], "provenance first, then connections, each id once");
  assert.deepEqual(asked, [["provenance", "PROJ-A"], ["connections", "PROJ-A"]], "asked in MODULE_ORDER");
  assert.deepEqual(seen(w, pv), ["LOOSE", "PROJ-A", "REC-A", "SHARED-A"], "both readers' ids, and the project's own");
  assert.equal(w.m.inSight("SHARED-X", pv), false, "a record neither reader names stays out");
  assert.equal(w.m.sight("SHARED-A", pv), Membership.SIGHT_FULL);
  assert.deepEqual(hidden(w, pv).includes("SHARED-A"), false, "the complement follows");
  assert.deepEqual(hidden(w, pv).includes("SHARED-X"), true);
  /* another project's reach is its own: the readers are asked for the carried project */
  assert.deepEqual(seen(w, projectViewer(V("second"), "PROJ-B")), ["PROJ-B", "REC-B"]);
  /* the plain viewer is not narrowed or widened by any reader */
  assert.equal(w.m.inSight("SHARED-X", V("second")), true);
  assert.deepEqual(w.m.projectReach(""), []);
  assert.deepEqual(w.m.projectReach(null), []);
});

test("R150 a reader that throws, answers a promise, a non-list or a list holding anything but bundle ids adds nothing and does not change another's; the reach narrows, never widens", async () => {
  const w = await reachWorld();
  const pv = projectViewer(V("second"), "PROJ-A");
  const bad = [
    ["credentials", () => { throw new Error("down"); }],
    ["tasks", () => Promise.resolve(["SHARED-X"])],
    ["queue", () => "SHARED-X"],
    ["retrieval", () => ({ 0: "SHARED-X", length: 1 })],
    ["extraction", () => ["SHARED-X", 7]],
    ["content", () => ["SHARED-X", ""]],
    ["money", () => null],
  ];
  for (const [module, fn] of bad) assert.equal(w.m.registerProjectReach(module, fn).ok, true, module);
  assert.equal(w.m.registerProjectReach("connections", () => ["SHARED-A"]).ok, true);
  assert.deepEqual(w.m.projectReach("PROJ-A"), ["SHARED-A"], "only the good reader's ids");
  assert.deepEqual(seen(w, pv), ["PROJ-A", "REC-A", "SHARED-A"]);
  assert.equal(w.m.inSight("SHARED-X", pv), false);
  /* a reader that answers a thousand duplicates adds each once */
  assert.equal(w.m.registerProjectReach("provenance", () => Array(1000).fill("LOOSE")).ok, true);
  assert.deepEqual(w.m.projectReach("PROJ-A"), ["LOOSE", "SHARED-A"]);
});

test("R150 an id a reader answers is admitted only if R43 admits the member's own viewer to it; a hidden project's record the member cannot see is not reached", async () => {
  const w = await reachWorld();
  assert.equal(w.m.registerProjectReach("provenance", () => ["REC-H", "SHARED-A", "PROJ-H"]).ok, true);
  const pv = projectViewer(V("second"), "PROJ-A");
  assert.deepEqual(seen(w, pv), ["PROJ-A", "REC-A", "SHARED-A"], "second, in hidden H nowhere, reaches none of H's");
  assert.equal(w.m.inSight("REC-H", pv), false);
  assert.equal(w.m.inSight("PROJ-H", pv), false);
  /* control: ann owns H, so the same reader's ids reach her */
  assert.deepEqual(seen(w, projectViewer(V("ann"), "PROJ-A")), ["PROJ-A", "PROJ-H", "REC-A", "REC-H", "SHARED-A"]);
  /* a reader's id for a record that does not exist adds a bundle that is not there */
  assert.equal(w.m.registerProjectReach("connections", () => ["NO-SUCH-BUNDLE"]).ok, true);
  assert.equal(w.m.inSight("NO-SUCH-BUNDLE", pv), false);
});

test("R150 a malformed registration is LISTENER_MALFORMED and a second by the same module LISTENER_DECLARED naming it, both through R81; nothing is registered by a refusal", async () => {
  const w = await reachWorld();
  for (const [module, fn] of [["", () => []], [7, () => []], [null, () => []], ["provenance", "not a function"], ["provenance", null]]) {
    const r = w.m.registerProjectReach(module, fn);
    assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "LISTENER_MALFORMED", "LISTENER_MALFORMED", "C-102.11"], String(module));
  }
  assert.equal(w.m.registerProjectReach("provenance", () => ["SHARED-A"]).ok, true);
  const again = w.m.registerProjectReach("provenance", () => ["SHARED-X"]);
  assert.deepEqual([again.ok, again.reason, again.module, again.check], [false, "LISTENER_DECLARED", "provenance", "C-102.12"]);
  assert.deepEqual(w.m.projectReach("PROJ-A"), ["SHARED-A"], "the first registration stands");
  /* a different module may register: the slot takes one per module, not one in all */
  assert.equal(w.m.registerProjectReach("connections", () => ["SHARED-X"]).ok, true);
  assert.deepEqual(w.m.projectReach("PROJ-A").sort(), ["SHARED-A", "SHARED-X"]);
});

test("R150 the reach of a viewer for a project is bounded however many ids the readers answer, and the first ids in the readers' order are kept", async () => {
  const w = await reachWorld();
  const many = Array.from({ length: Membership.PROJECT_REACH_LIMIT + 50 }, (_, i) => `NOTE-${String(i).padStart(5, "0")}`);
  for (const id of many.slice(0, 30)) w.bundle(id);
  assert.equal(w.m.registerProjectReach("provenance", () => many).ok, true);
  const reach = w.m.projectReach("PROJ-A");
  assert.equal(reach.length, Membership.PROJECT_REACH_LIMIT);
  assert.deepEqual(reach.slice(0, 3), many.slice(0, 3));
  /* one bound parameter however long the list: the statement runs under the host's bound-parameter limit */
  assert.equal(viewerPredicate(projectViewer(V("second"), "PROJ-A"), reach).args.length <= 6, true);
  assert.equal(w.m.inSight("NOTE-00000", projectViewer(V("second"), "PROJ-A")), true);
});
