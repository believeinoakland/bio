/* K5175 (fix round 10): the answers `fixtures.mjs` publishes are the module's real code's. The `holdsdue` answer is the door's
   answer over the real `holdsDue`, made fresh on each call, and a control reads what the module reads. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { V } from "./fixture.mjs";
import { CASE } from "../docket/fixture.mjs";
import { holdsDueAnswer, holdsDueDocketAnswer, holdPlacedReleasedAnswers } from "./fixtures.mjs";

const A = "ACTN-2026-0001-a";

test("R19 holdsdue fixture: the published answer is the door's answer over the real holdsDue, a due legal mark with no hold is in it with its arrival, and each call builds its own world", () => {
  const { w, answer, viewer } = holdsDueAnswer();
  assert.deepEqual(answer, w.h.holdsDue({ viewer }), "the door answers what the module answers");
  assert.equal(answer.ok, true);
  assert.deepEqual(answer.items.map((x) => [x.arrived, x.marked_by]), [[{ action: A, ord: 0 }, viewer]]);
  const again = holdsDueAnswer();
  assert.notEqual(again.w, w, "a call builds its own world");
  assert.deepEqual(again.answer.items.map((x) => [x.action, x.ord, x.arrived]), answer.items.map((x) => [x.action, x.ord, x.arrived]),
    "the same shape of answer from each world (project ids are each world's own)");
});

test("R19 holdsdue fixture control: a viewer who sees no project of the mark reads no item of the page", () => {
  const { w } = holdsDueAnswer();
  assert.deepEqual(w.h.holdsDue({ viewer: V("bob") }).items, []);
});

test("R19 holdsdue docket fixture: the published answer lists the docket's legal mark with its arrival, is the real holdsDue's answer, and is empty once the hold is placed", () => {
  const { w, h, viewer, entry, answer, direct, placed } = holdsDueDocketAnswer();
  assert.deepEqual(answer, direct, "the door answers what the module answers");
  assert.equal(answer.ok, true);
  assert.deepEqual(answer.items.map((x) => x.arrived), [{ docket_entry: entry, case: CASE }]);
  assert.deepEqual(placed, h.holdsDue({ viewer }), "the same world after the hold: the door answers what the module answers");
  assert.deepEqual([placed.ok, placed.items], [true, []]);
  const again = holdsDueDocketAnswer();
  assert.notEqual(again.w, w, "a call builds its own world");
  assert.deepEqual(again.answer.items.map((x) => x.arrived), [{ docket_entry: again.entry, case: CASE }]);
});

test("R19 holdsdue docket fixture control: a viewer who sees no project of the docket mark reads no item of the page", () => {
  const { h } = holdsDueDocketAnswer();
  assert.deepEqual(h.holdsDue({ viewer: V("dave") }).items, []);
});

test("R22 R5 R6 placed-and-released fixture: the published answers are the real acts' over a hold placed from a docket mark, and the place reads released afterwards", () => {
  const { w, h, viewer, entry, body, placed, preview, released, after } = holdPlacedReleasedAnswers();
  assert.deepEqual(placed.items.map((x) => [x.place, x.hold, x.from]), [[{ project: w.P }, "in_place", [{ docket_entry: entry }]]]);
  assert.deepEqual([preview.ok, preview.hold, preview.restarts], [true, "in_place", [w.P]]);
  assert.deepEqual([released.ok, released.hold, released.from], [true, "released", body.from]);
  assert.deepEqual(after.items.map((x) => x.hold), ["released"]);
  assert.notEqual(holdPlacedReleasedAnswers().w, w, "a call builds its own world");
});

test("R22 placed-and-released fixture control: a viewer who sees no project reads no place", () => {
  const { h } = holdPlacedReleasedAnswers();
  assert.deepEqual(h.holdsPlaced({ viewer: V("dave") }).items, []);
});
