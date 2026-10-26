/* duties' published fixtures (fixtures.mjs) checked against the module's real answers (fix-round 10, K4990, K4993). */
import test from "node:test";
import assert from "node:assert/strict";
import * as F from "./fixtures.mjs";
import { BOB, CAROL } from "./fixture.mjs";

test("R9 R10 R12 fixture occurrencesOf: a met and a pending occurrence over real events, an undetermined one, and NO_SUCH_DUTY for an absent id", () => {
  const f = F.occurrencesOf();
  assert.equal(f.met.ok, true);
  assert.deepEqual([f.met.duty_id, f.met.as_of], [f.dutyId, F.AS_OF]);
  const states = f.met.occurrences.map((o) => o.state).sort();
  assert.deepEqual(states, ["met", "overdue"], "the matched request is met, the other is past its due date");
  assert.ok(f.met.occurrences.every((o) => /^OCC-[0-9a-f]{32}$/.test(o.key)));
  assert.equal(f.undetermined.occurrences[0].state, "undetermined");
  assert.deepEqual([f.absent.ok, f.absent.reason, f.absent.code, f.absent.duty_id], [false, "NO_SUCH_DUTY", "NO_SUCH_DUTY", f.absentId]);
  /* the same answer the module gives asked directly */
  assert.deepEqual(f.duties.occurrencesOf({ dutyId: f.dutyId, asOf: F.AS_OF, from: "2026-01-01", to: "2026-03-31", viewer: BOB }), f.met);
});

test("R9 R11 fixture occurrences: the read of a visible duty without a window, and one NO_SUCH_DUTY for an id the record does not hold", () => {
  const f = F.occurrences();
  assert.equal(f.read.ok, true);
  assert.equal(f.read.duty_id, f.dutyId);
  assert.equal(f.read.occurrences.length, 2);
  assert.deepEqual([f.absent.ok, f.absent.reason], [false, "NO_SUCH_DUTY"]);
  assert.deepEqual([f.unseen.ok, f.unseen.reason, f.unseen.duty_id], [false, "NO_SUCH_DUTY", f.dutyId], "a viewer naming no member sees no duty");
});

test("R13 fixture recordTransitionsAnswers: an empty pass, an unfinished pass with its cursor, and the finishing pass from it", () => {
  const f = F.recordTransitionsAnswers();
  assert.deepEqual([f.empty.ok, f.empty.duties_read, f.empty.recorded, f.empty.cursor, f.empty.done], [true, 0, 0, null, true]);
  assert.equal(f.unfinished.ok, true);
  assert.deepEqual([f.unfinished.done, f.unfinished.duties_read, f.unfinished.cursor], [false, 1, f.first]);
  assert.deepEqual([f.finished.ok, f.finished.done, f.finished.cursor, f.finished.duties_read], [true, true, null, 1]);
  assert.match(f.unfinished.cursor, /^DUT-/);
  assert.ok(f.unfinished.recorded >= 1 && f.finished.recorded >= 1, "each slice recorded the states it read");
});

test("R14 fixture transitionsUnknownDuty: the module refuses no read of an unknown duty's transitions, it answers an empty list", () => {
  const f = F.transitionsUnknownDuty();
  assert.deepEqual([f.read.ok, f.read.transitions, f.read.count], [true, [], 0]);
  assert.equal(f.read.reason, undefined, "no NO_SUCH_DUTY comes from transitionsOf");
});

test("R7 R9 fixture dutiesForViewer: an entity holding no duty lists none, an absent duty id is NO_SUCH_DUTY, and a held duty with no trigger in the window has no occurrence", () => {
  const f = F.dutiesForViewer();
  assert.deepEqual([f.none.ok, f.none.duties, f.none.count], [true, [], 0]);
  assert.deepEqual([f.noneOccurrences.ok, f.noneOccurrences.reason, f.noneOccurrences.duty_id], [false, "NO_SUCH_DUTY", f.absentId]);
  assert.deepEqual(f.held.duties.map((d) => d.duty_id), [f.dutyId], "the holder sees the one duty of the entity");
  assert.deepEqual([f.heldOccurrences.ok, f.heldOccurrences.occurrences], [true, []]);
  assert.deepEqual(f.duties.dutiesOf({ entity: f.entity, as: "obligor", viewer: f.holder }), f.held, "the same answer the module gives asked directly");
});
