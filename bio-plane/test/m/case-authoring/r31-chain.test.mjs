/* case-authoring, fix round 10's chain (R31; case-catalogue R2, R31): a finding with two grounded legs, one of its citations
   severed, concluded by a project and prepared as a case. The gate is clean: no C-2.8 finding for the severed leg's ground.
   The control, the same with the citation live, freezes that ground's row. Over the real modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED, readingLines, currentLines } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q";
const legs = [{ target: DOC, ground: "part 1", grade: "B", grade_axis: "capture", grade_source: "capture" },
              { target: DOC2, ground: "part 2", grade: "B", grade_axis: "capture", grade_source: "capture" }];
/* each ground label is asserted by a member: C-2.8 composes the grounds disjunctively, so each names who asserts it */
const GROUNDS = ["grounds:", "  - ground: part 1", "    asserted_by: alice", '    at: "2026-09-27T00:00:00Z"',
                 "  - ground: part 2", "    asserted_by: alice", '    at: "2026-09-27T00:00:00Z"'];

/* the finding is concluded by the project (basis-versions R13) and the project's act is ready to run */
function chain({ severed = [] } = {}) {
  const w = world();
  w.member("alice"); w.doc(DOC); w.doc(DOC2);
  w.finding(Q, legs, { state: "open", lines: [...readingLines("first", [DOC, DOC2]), ...GROUNDS], severed });
  const P = w.project("Team", "alice", [Q], { extra: currentLines(Q) });
  const concl = w.basisVersions.conclude({ target: Q, project: P, falsifier: "a later amendment", author: "alice",
                                           viewer: V("alice"), identity: "member:alice" });
  assert.equal(concl.ok, true, JSON.stringify(concl).slice(0, 300));
  const args = { ...AUTHORED, whatChanged: WHAT_CHANGED, project: P, targets: [Q], roles: { [Q]: "load_bearing" },
                 viewer: V("alice"), author: "alice" };
  return { w, P, args };
}
/* the C-2.8 findings the pre-flight's gate refusal carries (ratification's gate over the text the act would store) */
const gateC28 = (pre) => pre.blockers.flatMap((b) => b.findings || []).filter((f) => f.check === "C-2.8");

test("R31: two grounded legs, one citation severed, concluded and prepared: the gate is clean, with no C-2.8 finding for the severed leg's ground", () => {
  const { w, P, args } = chain({ severed: [DOC2] });
  const pre = w.ca.publishPreflight(args);
  assert.equal(pre.first, null, JSON.stringify(pre.first).slice(0, 300));
  assert.deepEqual(gateC28(pre).map((f) => f.detail), [], "the severed leg's ground is not asked for a row it can never have");
  const r = w.publish(P, "alice", [Q], { roles: { [Q]: "load_bearing" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
});

test("R31 control: the same with the citation live, the gate is clean and the part 2 ground's row is frozen in the case document", () => {
  const { w, P, args } = chain();
  assert.deepEqual(gateC28(w.ca.publishPreflight(args)), [], "the control is clean");
  const r = w.publish(P, "alice", [Q], { roles: { [Q]: "load_bearing" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const fm = w.fm(w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).text);
  assert.ok(fm.case_strength_grounds.some((x) => x.target === Q && x.ground === "part 2"), JSON.stringify(fm.case_strength_grounds));
});
