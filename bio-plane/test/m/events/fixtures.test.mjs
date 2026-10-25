/* The fixtures events publishes for its users (K4990, K4993, K5044): each is made by events' real code when it is called,
 * and each test here calls it and checks the real answer. Named with the requirement each answer carries. */
import test from "node:test";
import assert from "node:assert/strict";
import { recordedByMalformedExtent, sequenceUndetermined, timelineAnswer, timelineRefusal, timelineUndated, usesOf } from "./fixtures.mjs";

test("R49 recordedByMalformedExtent: events' own EXTENT_MALFORMED for an extent that is no object of a known kind, with its code and a reason", () => {
  for (const bad of ["page 1", {}, { kind: "nonsense" }, 5]) {
    const r = recordedByMalformedExtent(bad);
    assert.deepEqual([r.ok, r.reason, r.code], [false, "EXTENT_MALFORMED", "EXTENT_MALFORMED"], JSON.stringify(bad));
    assert.match(String(r.why), /\S/);
  }
});

test("R31 R51 sequenceUndetermined: the real undetermined answers, with a why events gives, the same without it, and the pair whose cited orders disagree", () => {
  const { withWhy, withoutWhy, disagree } = sequenceUndetermined();
  assert.equal(withWhy.answer, "undetermined");
  assert.ok(withWhy.why, "the real answer carries its why");
  assert.equal(withoutWhy.answer, "undetermined");
  assert.equal("why" in withoutWhy, false);
  assert.equal(disagree.answer, "undetermined");
  assert.equal(disagree.why.key, "events.why.cited_orders_disagree");
  assert.equal(disagree.relation_ids.length, 2);
});

test("R28 timelineAnswer: the real timeline over a world with no events answers ok with an empty world lane and no sources", () => {
  const r = timelineAnswer();
  assert.equal(r.ok, true);
  assert.deepEqual(r.world.items, []);
  assert.deepEqual(r.ours.sources, []);
});

test("R28 timelineRefusal: NO_SET for an empty set and BAD_DATE for a date that is no date, as events refuses them", () => {
  const { noSet, badDate } = timelineRefusal();
  assert.deepEqual([noSet.ok, noSet.reason], [false, "NO_SET"]);
  assert.deepEqual([badDate.ok, badDate.reason], [false, "BAD_DATE"]);
});

test("R46 usesOf: a world seeded with a discretion, a waiver and an assessment through the real acts; kinds [\"x\"] is KIND_NOT_DISCRETION", () => {
  const u = usesOf();
  for (const k of ["discretion", "waiver", "assessment"]) assert.equal(u.made[k].ok, true, `${k}: ${JSON.stringify(u.made[k])}`);
  assert.equal(u.all.count, 3);
  assert.deepEqual(u.all.items.map((e) => e.use.kind).sort(), ["assessment", "discretion", "waiver"]);
  assert.equal(u.refused.ok, false);
  assert.equal(u.refused.reason, "KIND_NOT_DISCRETION");
});

test("R50 timelineUndated: the real timeline puts an undated event in placed_nowhere with grade null and grade_why and the view's why both {key, vars}", () => {
  const { item, view } = timelineUndated();
  assert.equal(item.grade, null);
  assert.deepEqual(item.grade_why, { key: "events.why.grade_placed_nowhere", vars: {} });
  assert.deepEqual(view.why, { key: "events.why.placed_nowhere_attestation", vars: {} });
});
