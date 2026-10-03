/* accepted-work: its invariants (R5–R7). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, onRef, REF, ALICE } from "./fixture.mjs";
import * as accepted from "../../../src/accepted-work/index.mjs";
import { ACCEPTED_WORK_CHECKS as ROWS_FILE } from "../../../src/accepted-work/checks.mjs";

test("R5 no table, and nothing regrades: making the module adds no table; the pair, acceptance and gaps are answered exactly as the source gave them; the module offers no grade, strength or score of its own", () => {
  const before = world({ register: false });
  const tablesWith = before.tables();
  /* the same world without accepted-work: the tables are record-core's and membership's alone */
  assert.ok(!tablesWith.some((t) => /accept|import/i.test(t)), tablesWith.join(","));
  const w = world();
  assert.deepEqual(w.tables(), tablesWith);
  const pair = { evidence: "D", inference: "A" };
  w.source.publish(REF, 1, { pair, result: "recreated_in_part" });
  w.source.accept(REF, 1);
  const f = w.aw.acceptedFinding({ ref: REF, edition: 1, viewer: ALICE });
  assert.deepEqual(f.pair, pair);
  assert.equal(f.result, "recreated_in_part");
  assert.deepEqual(f.acceptance.gaps, []);
  /* an accepted leg is written as authored: the promotion carries no grade of this module's into the document */
  assert.equal(w.promote("INQ-2026-0001-q", [onRef(REF, 1)]).ok, true);
  const text = w.record.readFile("INQ-2026-0001-q", "bundle.md").text;
  assert.ok(!/grade|strength|trust/i.test(text), "nothing graded into the document");
  /* its interface: the registration, the reads, the leg check; no grading, composing or scoring function */
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(w.aw)).filter((m) => m !== "constructor").sort();
  assert.deepEqual(methods, ["acceptanceWithdrawals", "acceptedFinding", "acceptedLegRefusals", "check", "openFlagsOn",
                             "publisherMoves", "registerAcceptedWork"]);
  assert.deepEqual(Object.keys(accepted).sort(),
    ["ACCEPTED_WORK_ABSENT", "ACCEPTED_WORK_CHECKS", "ACCEPTED_WORK_UNREADABLE_WHY", "acceptedWorkOf"]);
});

test("R6 rows C-21.4 IMPORTED_NOT_ACCEPTED and C-21.5 ACCEPTED_WORK_UNREADABLE are held in the module's own checks.mjs, with their translations, as the table the catalogue census reads; the refusals carry them", () => {
  assert.equal(accepted.ACCEPTED_WORK_CHECKS, ROWS_FILE, "one table, exported from the module");
  assert.deepEqual(Object.keys(ROWS_FILE).sort(), ["ACCEPTED_WORK_UNREADABLE", "IMPORTED_NOT_ACCEPTED"]);
  assert.equal(ROWS_FILE.IMPORTED_NOT_ACCEPTED.check, "C-21.4");
  assert.equal(ROWS_FILE.IMPORTED_NOT_ACCEPTED.translation,
    "This finding rests on another group's finding that this group has not accepted at that edition. Accept that edition "
    + "first, or take the leg out. Nothing was written.");
  assert.equal(ROWS_FILE.ACCEPTED_WORK_UNREADABLE.check, "C-21.5");
  assert.equal(ROWS_FILE.ACCEPTED_WORK_UNREADABLE.translation,
    "Another group's work this finding rests on could not be read, so whether it is accepted is not known. Try again. "
    + "Nothing was written.");
  for (const row of Object.values(ROWS_FILE)) {
    assert.match(row.check, /^C-\d+/);
    assert.equal(typeof row.where, "string");
    assert.ok(row.where.startsWith("src/accepted-work/"));
  }
  const w = world();
  const [notAccepted] = w.aw.acceptedLegRefusals({ legs: [onRef(REF, 1)], viewer: ALICE });
  assert.equal(notAccepted.translation, ROWS_FILE.IMPORTED_NOT_ACCEPTED.translation);
  const [unreadable] = world({ register: false }).aw.acceptedLegRefusals({ legs: [onRef(REF, 1)], viewer: ALICE });
  assert.equal(unreadable.translation, ROWS_FILE.ACCEPTED_WORK_UNREADABLE.translation);
});

test("R7 no place is named in the module's behaviour or outward text: every row, refusal and stated answer is free of the place names the held profiles cover, and the check answers alike whatever the instance's profiles", () => {
  /* the places the instance's own profile and the test profile cover (the jurisdictions module is not this one's to use) */
  const places = new Set(["Oakland", "Alameda", "California", "Port Ellery", "Ellery", "county", "city of"]);
  const outward = [];
  for (const row of Object.values(ROWS_FILE)) outward.push(row.translation, row.where);
  const w = world();
  outward.push(JSON.stringify(w.aw.acceptedLegRefusals({ legs: [onRef(REF, 1)], viewer: ALICE })));
  w.source.throws = "x";
  outward.push(JSON.stringify(w.aw.acceptedFinding({ ref: REF, edition: 1, viewer: ALICE })));
  outward.push(JSON.stringify(w.promote("INQ-2026-0001-q", [onRef(REF, 1)])));
  const bare = world({ register: false });
  outward.push(JSON.stringify(bare.aw.openFlagsOn({ ref: REF, edition: 1, viewer: ALICE })));
  outward.push(JSON.stringify(bare.aw.registerAcceptedWork("case-import", {})));
  const text = outward.join("\n");
  for (const place of places) if (place.trim()) assert.ok(!text.toLowerCase().includes(place.toLowerCase()), place);
  /* behaviour does not turn on a profile: the same legs are judged the same under any instance setting */
  const a = world(), b = world();
  b.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin");
  for (const x of [a, b]) { x.source.publish(REF, 1); x.source.accept(REF, 1); }
  const legs = [onRef(REF, 1), onRef(REF, 2)];
  assert.deepEqual(a.aw.acceptedLegRefusals({ legs, viewer: ALICE }), b.aw.acceptedLegRefusals({ legs, viewer: ALICE }));
});
