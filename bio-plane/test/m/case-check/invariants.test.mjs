/* case-check R4, R5: checks are append-only working material, declared to purge; no case-level strength and no place;
   the states are answered as states, each with its key, never as a fault. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, args, F1, F2 } from "./fixture.mjs";
import { caseCheckOwns, stateKey, VOID_CAUSES, CASE_CHECK_CHECKS } from "../../../src/case-check/index.mjs";

const CASE = "CASE-2026-0001";

test("R4: checks are append-only: a later check, a void, a ratification and every read leave each earlier row byte-identical", () => {
  const w = standard();
  w.c.checkAndHold(args([F1, F2]));
  const first = JSON.stringify(w.rows(`SELECT * FROM case_checks ORDER BY seq`));
  w.move(F1);
  w.c.caseCheckOf({ case: CASE });
  w.c.checkAndHold(args([F1, F2]));
  w.c.heldFindingVersions({ finding: F1 });
  w.ratify(CASE, 1);
  w.c.caseCheckOf({ case: CASE });
  const rows = w.rows(`SELECT * FROM case_checks ORDER BY seq`);
  assert.equal(rows.length, 2);
  assert.equal(JSON.stringify([rows[0]]), first);
});

test("R4: declared to record-core's purge as working material: the whole-store purge clears a check of an unsigned preparation with it and keeps one of a ratified edition (control); a bundle purge clears none", () => {
  const w = standard();
  assert.equal(caseCheckOwns("case_checks"), true);
  assert.equal(caseCheckOwns({ name: "case_documents" }), false);
  w.ca.gate = (a) => ({ caseId: a.caseId, edition: 1 });
  w.c.checkAndHold(args([F1], { caseId: "CASE-2026-0001" }));
  w.c.checkAndHold(args([F2], { caseId: "CASE-2026-0002" }));
  w.ratify("CASE-2026-0002", 1);
  const byBundle = w.record.purge({ bundleId: F1 });
  assert.equal(byBundle.removed.case_checks, 0);
  assert.equal(w.count("case_checks"), 2, "a bundle purge clears none");
  assert.equal(w.record.purge({}).removed.case_checks, 1, "the report names the table");
  assert.deepEqual(w.rows(`SELECT case_id FROM case_checks`).map((r) => r.case_id), ["CASE-2026-0002"]);
});

test("R4: no answer composes a case-level strength, and none names a place", () => {
  const w = standard();
  const answers = [w.c.checkAndHold(args([F1, F2])), w.c.caseCheckOf({ case: CASE }), w.c.heldFindingVersions({ finding: F1 }),
                   w.c.caseCheckOf({ case: CASE, viewer: "member:out" }), w.c.heldFindingVersions({ finding: "" })];
  w.move(F1);
  answers.push(w.c.caseCheckOf({ case: CASE }));
  const text = JSON.stringify([answers, CASE_CHECK_CHECKS]);
  for (const k of ["strength", "grade", "weakest", "pair"]) assert.ok(!text.includes(`"${k}"`), `no ${k} key`);
  for (const place of ["Oakland", "California", "Alameda", "Berkeley"]) assert.ok(!text.includes(place), place);
});

test("R5: held, void (each why) and undetermined are answered as states, never faults: ok true, no refusal row, and each carries its key (case.check.held, case.check.void.<why>, case.check.undetermined)", () => {
  assert.deepEqual(VOID_CAUSES, ["document_replaced", "member_moved", "source_lapsed", "accepted_work_lapsed", "marks_lapsed"]);
  const w = standard();
  w.c.checkAndHold(args([F1]));
  const seen = [];
  const look = () => { const a = w.c.caseCheckOf({ case: CASE }); seen.push(a); return a; };
  assert.equal(look().key, "case.check.held");
  w.cc.sources = [{ capture: "c" }]; assert.equal(look().key, "case.check.void.source_lapsed"); w.cc.sources = [];
  w.cc.accepted = { withdrawn: [], undisclosed: [] }; assert.equal(look().key, "case.check.void.accepted_work_lapsed"); w.cc.accepted = null;
  w.cc.marks = [{ ref: "p" }]; assert.equal(look().key, "case.check.void.marks_lapsed"); w.cc.marks = [];
  w.cc.marks = "?"; assert.equal(look().key, "case.check.undetermined"); w.cc.marks = [];
  w.move(F1); assert.equal(look().key, "case.check.void.member_moved");
  w.reauthor(CASE, 1); assert.deepEqual(look().keys, ["case.check.void.document_replaced", "case.check.void.member_moved"]);
  for (const a of seen) {
    assert.equal(a.ok, true);
    for (const k of ["reason", "code", "translation"]) assert.equal(a[k], undefined, `${a.state}: no ${k}`);
    assert.match(a.check, /^CHK-/, "check is the check's id, never a row");
  }
  assert.deepEqual(VOID_CAUSES.map((c) => stateKey("void", c)), VOID_CAUSES.map((c) => `case.check.void.${c}`));
  assert.deepEqual([stateKey("held"), stateKey("undetermined"), stateKey("published"), stateKey("none")],
                   ["case.check.held", "case.check.undetermined", null, null]);
  /* control: the module's only rows are its two refusals, neither a state */
  assert.deepEqual(Object.keys(CASE_CHECK_CHECKS), ["NO_SUCH_CASE", "NO_ID"]);
});
