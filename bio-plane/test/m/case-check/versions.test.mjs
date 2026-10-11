/* case-check R3: heldFindingVersions, the held checks naming a finding, in publication R37's shape. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, args, P, P2, F1, F2, F3, NOW } from "./fixture.mjs";
import { CASE_CHECK_CHECKS } from "../../../src/case-check/index.mjs";

/* Case 1 (P) holds F1, F2; case 2 (P2) holds F1 alone; case 3 (P) holds F3. */
function three() {
  const w = standard();
  w.ca.gate = (a) => ({ caseId: a.caseId, edition: 1 });
  const one = w.c.checkAndHold(args([F1, F2], { caseId: "CASE-2026-0001" }));
  const two = w.c.checkAndHold(args([F1], { caseId: "CASE-2026-0002", project: P2, author: "quinn" }));
  const tri = w.c.checkAndHold(args([F3], { caseId: "CASE-2026-0003" }));
  for (const r of [one, two, tri]) assert.equal(r.ok, true, JSON.stringify(r));
  return { w, one, two, tri };
}
const item = (r, m, role) => ({ case: r.case, edition: r.edition, project: r.project, version_sha: m, role,
                                check: r.check, checked_at: NOW });

test("R3: every check reading held whose members include the finding, {case, edition, project, version_sha, role, check, checked_at}; version and project filter; a finding no held check names answers []", () => {
  const { w, one, two } = three();
  const v1 = w.head(F1);
  assert.deepEqual(w.c.heldFindingVersions({ finding: F1 }),
                   { ok: true, items: [item(one, v1, "load_bearing"), item(two, v1, "load_bearing")] });
  assert.deepEqual(w.c.heldFindingVersions({ finding: F2 }).items, [item(one, w.head(F2), "supporting")]);
  assert.deepEqual(w.c.heldFindingVersions({ finding: F1, project: P2 }).items, [item(two, v1, "load_bearing")]);
  assert.deepEqual(w.c.heldFindingVersions({ finding: F1, version: v1 }).items.length, 2);
  assert.deepEqual(w.c.heldFindingVersions({ finding: F1, version: "sha-other" }).items, []);
  assert.deepEqual(w.c.heldFindingVersions({ finding: "INQ-2026-0404-z" }), { ok: true, items: [] });
  /* no member's id is a substring match: an id that only begins like one names nothing */
  assert.deepEqual(w.c.heldFindingVersions({ finding: "INQ-2026-0001" }).items, []);
});

test("R3: a void check is not listed, beside a held one (control); a published one is not listed either (publication R37 lists it)", () => {
  const { w, one, two } = three();
  w.reauthor("CASE-2026-0002", 1);
  assert.deepEqual(w.c.heldFindingVersions({ finding: F1 }).items, [item(one, w.head(F1), "load_bearing")]);
  w.ratify("CASE-2026-0001", 1);
  assert.deepEqual(w.c.heldFindingVersions({ finding: F1 }).items, []);
  void two;
});

test("R3: an undetermined check is not listed (fail closed), and a superseded check of the same edition never is", () => {
  const { w, one } = three();
  w.cc.marks = (fm) => (fm.case_id === "CASE-2026-0002" ? null : []);
  assert.deepEqual(w.c.heldFindingVersions({ finding: F1 }).items.map((x) => x.check), [one.check]);
  w.cc.marks = [];
  w.move(F3);
  const again = w.c.checkAndHold(args([F3], { caseId: "CASE-2026-0003" }));
  assert.deepEqual(w.c.heldFindingVersions({ finding: F3 }).items.map((x) => x.check), [again.check]);
});

test("R3: NO_ID (C-148.2) for an empty finding, reading nothing (control: a finding read); viewer-free; it writes nothing", () => {
  const { w } = three();
  const before = w.snapshot();
  for (const finding of [null, "", "  "]) {
    const r = w.c.heldFindingVersions({ finding });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
                     [false, "NO_ID", "NO_ID", "C-148.2", CASE_CHECK_CHECKS.NO_ID.translation]);
  }
  assert.equal(w.c.heldFindingVersions({ finding: F1, viewer: "member:out" }).items.length, 2, "no viewer is read");
  assert.deepEqual(w.snapshot(), before);
});
