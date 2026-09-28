/* basis-versions: the reads — op=basisversions (R8–R11), sight (R33), the projects drawing on a question (R37) and the
   testimony walk (R39). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, inqMd, V } from "./fixture.mjs";
import { BASIS_VERSIONS_LIMIT_DEFAULT, BASIS_VERSIONS_LIMIT_MAX, BASIS_VERSION_LEGS_MAX, PROJECTS_DRAWING_MAX }
  from "../../../src/basis-versions/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r";
const T = "2026-09-27T00:00:00Z";

function setup() {
  const w = world();
  w.doc(DOC); w.doc(DOC2);
  w.member("alice"); w.member("bo");
  return w;
}

test("R8: no id is BASIS_VERSIONS_NO_INQUIRY (C-25.17); not an inquiry is BASIS_VERSIONS_NOT_AN_INQUIRY (C-25.18); an invisible inquiry answers as one with no versions, inquiry_present only when visible", () => {
  const w = setup();
  w.inquiry(Q, block(version("first", [DOC])));
  const none = w.bv.basisVersions({ viewer: V("alice") });
  assert.deepEqual([none.ok, none.reason, none.check, none.code, typeof none.translation], [false, "BASIS_VERSIONS_NO_INQUIRY", "C-25.17", "BASIS_VERSIONS_NO_INQUIRY", "string"]);
  const notInq = w.bv.basisVersions({ id: DOC, viewer: V("alice") });
  assert.deepEqual([notInq.reason, notInq.check], ["BASIS_VERSIONS_NOT_AN_INQUIRY", "C-25.18"]);
  const seen = w.bv.basisVersions({ id: Q, viewer: V("alice") });
  assert.equal(seen.inquiry_present, true);
  const hidden = w.bv.basisVersions({ id: Q, viewer: "nobody" });
  const absent = w.bv.basisVersions({ id: "INQ-2026-0099-z", viewer: V("alice") });
  assert.deepEqual({ ...hidden, inquiry: null }, { ...absent, inquiry: null }, "invisible and absent answer alike");
  assert.deepEqual([hidden.versions, hidden.total, "inquiry_present" in hidden], [[], 0, false]);
});

test("R9: at most 200 by default and 1,000 at most, whole or absent, each with at most 500 legs, leg_count and legs_complete; total and truncated; hidden versions returned flagged; composition, who moved it and why, affirmed parts, regroup", () => {
  const w = setup();
  assert.deepEqual([BASIS_VERSIONS_LIMIT_DEFAULT, BASIS_VERSIONS_LIMIT_MAX, BASIS_VERSION_LEGS_MAX], [200, 1000, 500]);
  const vs = merge(...Array.from({ length: 3 }, (_, i) => version(`v${i}`, [DOC], i === 1 ? { hidden: true } : {})),
    version("moved", [DOC], { state: "rejected", state_by: "member:bo", state_at: T, state_reason: "does not hold up",
                              affirmed_parts: "a\tb" }));
  assert.equal(w.inquiry(Q, block(vs)).ok, true);
  const all = w.bv.basisVersions({ id: Q, viewer: V("alice") });
  assert.deepEqual([all.count, all.total, all.limit, all.offset, all.truncated], [4, 4, 200, 0, false]);
  const page = w.bv.basisVersions({ id: Q, viewer: V("alice"), limit: 2, offset: 1 });
  assert.deepEqual([page.versions.map((v) => v.name), page.total, page.limit, page.truncated], [["v1", "v2"], 4, 2, true]);
  assert.equal(w.bv.basisVersions({ id: Q, viewer: V("alice"), limit: 5000 }).limit, 1000, "clamped to the ceiling");
  assert.equal(all.versions[1].hidden, true, "a hidden version is returned, flagged");
  const v = all.versions[0];
  assert.deepEqual([v.leg_count, v.legs_complete, v.legs.length, v.composition_grades, v.moved, v.affirmed, v.regroup, v.kind],
                   [1, true, 1, "authored", null, null, null, null]);
  assert.equal(v.composition, w.row(`SELECT composition FROM inquiry_basis_versions WHERE bundle_id=? AND name='v0'`, Q).composition);
  const m = all.versions[3];
  assert.deepEqual([m.moved, m.affirmed], [{ by: "member:bo", at: T, reason: "does not hold up" }, ["a", "b"]]);
  /* legs bounded per version, whole otherwise */
  const many = Array.from({ length: 502 }, (_, i) => ({ version: "big", target: DOC, role: "supports", ground: "main" }));
  assert.equal(w.inquiry(Q2, block({ versions: [{ name: "big", description: "a very long reading", relationship: "and", state: "suggested", hidden: false }],
    grounds: [{ version: "big", ground: "main", asserted_by: "member:alice", at: T }], legs: many })).ok, true);
  const big = w.bv.basisVersions({ id: Q2, viewer: V("alice") }).versions[0];
  assert.deepEqual([big.leg_count, big.legs.length, big.legs_complete], [502, 500, false]);
});

test("R10: each leg's capture grade is reported as inquiry.legCapped bounds it, with grade_authored and grade_why; the composition keeps the authored grades", () => {
  const w = setup();
  w.inq.ceilings[DOC] = { mode: "ceiling", grade: "C" };
  w.inq.ceilings[DOC2] = { mode: "ceiling", grade: null };
  assert.equal(w.inquiry(Q, block({ versions: [{ name: "g", description: "graded reading here", relationship: "and", state: "suggested", hidden: false }],
    grounds: [{ version: "g", ground: "main", asserted_by: "member:alice", at: T }],
    legs: [{ version: "g", target: DOC, role: "supports", ground: "main", grade: "A", grade_axis: "capture", grade_source: "capture" },
           { version: "g", target: DOC2, role: "supports", ground: "main", grade: "B", grade_axis: "capture", grade_source: "capture" },
           { version: "g", target: DOC, role: "supports", ground: "main", grade: "C", grade_axis: "connection", grade_source: "resolution" },
           { version: "g", target: DOC, role: "supports", ground: "main", grade: "D", grade_axis: "capture", grade_source: "capture" }] })).ok, true);
  const v = w.bv.basisVersions({ id: Q, viewer: V("alice") }).versions[0];
  assert.deepEqual(v.legs.map((l) => [l.grade, l.grade_authored, l.grade_why === null]),
    [["C", "A", false], [null, "B", false], ["C", "C", true], ["D", "D", true]]);
  assert.equal(v.composition_grades, "authored");
  assert.ok(v.composition.includes("\tA\tcapture\tcapture\t"), "the composition keeps the authored letter");
  assert.deepEqual(w.inq.calls.at(-1), ["earned", null, [DOC, DOC2]], "one registry call per version, the capture-axis targets");
});

test("R11: with a project, the answer adds its CURRENT, its concluded stance, its history and stance state; always the no-project conclusion", () => {
  const w = setup();
  w.inquiry(Q, block(version("first", [DOC], { state: "accepted", claim: "it happened", state_by: "member:alice", state_at: T })));
  const p = w.project("Team A", "alice", [Q], { extra: ["current_versions:", `  - inquiry: "${Q}"`, `    version: "first"`,
    `    at: "${T}"`, `    by: "member:alice"`, "conclusions:", `  - inquiry: "${Q}"`, `    act: "concluded"`, `    version: "first"`,
    `    claim: "it happened"`, `    falsifier: "a record saying otherwise"`, `    at: "${T}"`, `    by: "member:alice"`] });
  const a = w.bv.basisVersions({ id: Q, viewer: V("alice"), project: p });
  assert.deepEqual(a.current, { project: p, version: "first", at: T, by: "member:alice" });
  assert.equal(a.conclusion.version, "first");
  assert.equal(a.conclusion_stance, "concluded");
  assert.equal(a.conclusion_history.length, 1);
  assert.equal(a.no_project_conclusion, null, "the question's own state is not concluded");
  const b = w.bv.basisVersions({ id: Q, viewer: V("alice") });
  assert.deepEqual(["current" in b, "conclusion" in b, "conclusion_history" in b, "no_project_conclusion" in b], [false, false, false, true]);
});

test("R33: a question, version or project the viewer may not see answers as an absent one", () => {
  const w = setup();
  w.inquiry(Q, block(version("first", [DOC], { state: "accepted", state_by: "member:alice", state_at: T })));
  const p = w.project("Hidden team", "alice", [Q], { extra: ["current_versions:", `  - inquiry: "${Q}"`, `    version: "first"`,
    `    at: "${T}"`, `    by: "member:alice"`] });
  assert.equal(w.bv.currentOf(p, Q, V("bo")), null, "bo is no participant of a hidden project");
  assert.equal(w.bv.currentOf("PROJ-2026-9999-none", Q, V("bo")), null);
  assert.deepEqual(w.bv.conclusionRecordOf(p, Q, V("bo")), { history: [], stance: null });
  const act = w.bv.versionAccept({ target: Q, version: "first", author: "member:bo", viewer: "nobody" });
  const absent = w.bv.versionAccept({ target: "INQ-2026-0099-z", version: "first", author: "member:bo", viewer: V("bo") });
  assert.deepEqual([act.reason, act.detail], [absent.reason, absent.detail]);
  assert.deepEqual(w.bv.projectsDrawingOn(Q, V("bo")).map((x) => x.id), []);
});

test("R37: each visible project drawing on the question by a cites reference not severed, in id order, {id, title, current}; at most 32 with bound and truncated; an empty id answers an empty list", () => {
  const w = setup();
  w.inquiry(Q, block(version("first", [DOC], { state: "accepted", state_by: "member:alice", state_at: T })));
  const a = w.project("Alpha", "alice", [Q], { extra: ["current_versions:", `  - inquiry: "${Q}"`, `    version: "first"`,
    `    at: "${T}"`, `    by: "member:alice"`] });
  const b = w.project("Beta", "alice", [Q]);
  w.project("Severed", "alice", [], { severed: [Q] });
  w.project("Elsewhere", "alice", [Q2]);
  const list = w.bv.projectsDrawingOn(Q, V("alice"));
  assert.deepEqual(list.map((x) => x.id), [a, b].sort());
  const alpha = list.find((x) => x.id === a);
  assert.deepEqual(alpha, { id: a, title: "Alpha", current: { project: a, version: "first", at: T, by: "member:alice" } });
  assert.equal(list.find((x) => x.id === b).current, null);
  assert.deepEqual([list.bound, list.truncated], [32, false]);
  const empty = w.bv.projectsDrawingOn("", V("alice"));
  assert.deepEqual([empty.length, empty.truncated, empty.bound], [0, false, 32]);
  for (let i = 0; i < PROJECTS_DRAWING_MAX; i++) w.project(`More ${i}`, "alice", [Q]);
  const cut = w.bv.projectsDrawingOn(Q, V("alice"));
  assert.deepEqual([cut.length, cut.truncated], [32, true]);
  assert.deepEqual(cut.map((x) => x.id), [...cut.map((x) => x.id)].sort(), "id order");
  const before = w.count("bundles");
  assert.doesNotThrow(() => w.bv.projectsDrawingOn(null, undefined));
  assert.equal(w.count("bundles"), before, "writes nothing");
});

test("R39: testimonyReach walks basis and version legs to the authored observations they reach — self, via — bounded, and answers empty for no ids", () => {
  const w = setup();
  /* an authored observation is a bundle holding a register row with authored 1 (provenance R48) */
  w.st.sql.exec(`UPDATE register SET authored=1 WHERE bundle_id=?`, DOC2);
  w.inquiry(Q2, block({}));
  w.st.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, target_id) VALUES (?, 0, ?)`, Q2, DOC2);
  w.inquiry(Q, block(version("first", [Q2])));
  const r = w.bv.testimonyReach([Q, DOC2, DOC, "", 7, Q]);
  assert.deepEqual(r.self, [DOC2]);
  assert.deepEqual(r.via, [{ finding: Q, observation: DOC2 }], "through a version leg, then a basis leg; a root that is none is not listed");
  assert.deepEqual(w.bv.testimonyReach([]), { self: [], via: [] });
  assert.deepEqual(w.bv.testimonyReach(null), { self: [], via: [] });
  assert.deepEqual(w.bv.testimonyReach([DOC]), { self: [], via: [] });
});
