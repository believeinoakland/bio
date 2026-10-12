/* case-authoring R72 (T45; N892; Actions D4; v0.2 rule 15; project-roster R23; publication R78): nothing of a counsel
   matter is prepared for publication. A project's scope is project-roster's (its R21's record, read through its R23),
   written here as its table holds it; the project a finding was committed with is record-core's (its R34). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { CASE_SOURCES_CHECKS } from "../../../src/publication/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";

function setup() {
  const w = world();
  w.member("alice");
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  const Other = w.project("Other matter", "alice");
  w.ca.projectRoster.migrate();   /* its tables, as the plane creates them at its start */
  const scope = (project, s) => w.st.sql.exec(`INSERT INTO project_scopes (project_id, scope, reason, set_by, at) VALUES (?,?,?,?,?)`,
                                              project, s, "the test sets it", "alice", "2026-09-27T00:00:00Z");
  const committedWith = (finding, project) => w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, project, finding);
  return { w, P, Other, scope, committedWith };
}
const act = (P, over = {}) => ({ ...AUTHORED, whatChanged: WHAT_CHANGED, project: P, targets: [Q, Q2],
                                 roles: { [Q]: "load_bearing", [Q2]: "supporting" }, viewer: V("alice"), author: "alice", ...over });

function counselRefused(r, projects) {
  const row = CASE_SOURCES_CHECKS.COUNSEL_MATTER_NOT_PUBLISHED;
  assert.ok(row, "publication R78's row, the one row for the code");
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "COUNSEL_MATTER_NOT_PUBLISHED",
    "COUNSEL_MATTER_NOT_PUBLISHED", row.check, row.translation], JSON.stringify(r).slice(0, 300));
  assert.deepEqual(r.projects, projects);
}

test("R72: a publishing project at scope counsel_matter is refused COUNSEL_MATTER_NOT_PUBLISHED (publication R78's row), naming it, before anything is written or any id drawn; the pre-flight answers it first", () => {
  const { w, P, scope } = setup();
  scope(P, "counsel_matter");
  const before = w.snapshot();
  const r = w.ca.publishCase(act(P));
  counselRefused(r, [{ project: P, publishing: true, members: [] }]);
  assert.deepEqual(w.snapshot(), before, "nothing written, no id drawn");
  const pre = w.ca.publishPreflight(act(P));
  assert.equal(pre.first.reason, "COUNSEL_MATTER_NOT_PUBLISHED");
  assert.equal(pre.ready, false);
  /* R2's and R4's refusals come first */
  assert.equal(w.ca.publishCase(act(P, { author: "bo", viewer: V("bo") })).reason !== "COUNSEL_MATTER_NOT_PUBLISHED", true);
  assert.equal(w.ca.publishCase(act(P, { targets: [Q, "INQ-2026-0099-x"], roles: { [Q]: "load_bearing", "INQ-2026-0099-x": "supporting" } })).reason,
    "NO_SUCH_BUNDLE");
});

test("R72: a member finding committed with another project at scope counsel_matter is refused, naming that project and the member; the scope is read at the act, so a project set back to none prepares", () => {
  const { w, P, Other, scope, committedWith } = setup();
  committedWith(Q2, Other);
  scope(Other, "counsel_matter");
  const r = w.ca.publishCase(act(P));
  counselRefused(r, [{ project: Other, publishing: false, members: [Q2] }]);
  scope(Other, "none");
  const ok = w.ca.publishCase(act(P));
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
});

test("R72 (control): the same act with every project at scope none, or own, prepares", () => {
  const { w, P, Other, scope, committedWith } = setup();
  committedWith(Q2, Other);
  scope(P, "none");
  scope(Other, "own");
  const r = w.ca.publishCase(act(P));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const n = setup();
  assert.equal(n.w.ca.publishCase(act(n.P)).ok, true, "no record is scope none");
});
