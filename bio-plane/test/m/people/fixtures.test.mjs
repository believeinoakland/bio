/* people's published fixtures (fixtures.mjs) checked against the module's own answers at its interface (R20, R22, R23,
   R24). A fixture is only as good as the real answer it hands on, so each test calls it and asserts that answer. */
import test from "node:test";
import assert from "node:assert/strict";
import { checkResults, evaluateChecksAnswers, tiesConcerningRefusal, personRemoved } from "./fixtures.mjs";
import { ANN } from "./fixture.mjs";

test("R22, R24: checkResults hands on the real listChecks and checkResults over an empty record: the shipped check listed, gated with no result shown; no viewer is refused", () => {
  const listed = checkResults.listChecks({ viewer: ANN });
  assert.equal(listed.ok, true);
  const rd = listed.checks.find((c) => c.machine && c.name === "revolving door");
  assert.ok(rd, "the shipped revolving-door check is listed");
  assert.equal(rd.open, false, "its gate is not yet recorded");
  const read = checkResults.checkResults({ viewer: ANN });
  assert.equal(read.ok, true);
  assert.deepEqual(read.checks.map((c) => c.check), [rd.check]);
  assert.equal(read.checks[0].gated, true, "no result is answered until the gate is recorded (R24)");
  assert.equal(read.checks[0].results, undefined, "a gated check carries no results");
  assert.equal(checkResults.checkResults({}).reason, "NO_VIEWER", "a read with no viewer is refused, as the real read is");
});

test("R23: evaluateChecksAnswers hands on the real evaluateChecks: the one person the record holds evaluated, nothing remaining; a zero budget is answered too", () => {
  const done = evaluateChecksAnswers({ budgetMs: 1000 });
  assert.deepEqual(done, { ok: true, evaluated: 1, remaining: false });
  assert.equal(evaluateChecksAnswers({ budgetMs: 0 }).ok, true, "a zero budget is answered, not refused");
});

test("R20: tiesConcerningRefusal hands on the real tiesConcerning with a bad argument: no member named gives the empty list, not a refusal; a member read with no viewer and no argument at all still answers", () => {
  const bad = tiesConcerningRefusal({ entities: ["entity:x"], member: null, viewer: ANN });
  assert.deepEqual(bad, { ok: true, member: null, ties: [] });
  assert.equal(tiesConcerningRefusal({ entities: ["entity:x"], member: "member:ann", viewer: null }).ok, true, "a member read with no viewer still answers the empty list");
  assert.equal(tiesConcerningRefusal({ entities: ["entity:x"], member: null, viewer: ANN }).ok, true);
});

test("R12: personRemoved hands on the real person read after an administrator's removal on a court order: the marker {ground, at, by} and no value", () => {
  const { read } = personRemoved();
  assert.equal(read.ok, true);
  assert.deepEqual(read.removed.map((r) => [r.ground, r.by]), [["court_order", "boss"]]);
  assert.deepEqual(read.facts, [], "the removed value is in no list");
  assert.ok(!JSON.stringify(read).includes("Calder-Voss"));
});
