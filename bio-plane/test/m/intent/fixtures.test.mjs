/* intent's published fixtures (fixtures.mjs): each is called here and its real answer checked (K4990). */
import test from "node:test";
import assert from "node:assert/strict";
import { intentWorld, notYoursRefusal } from "./fixtures.mjs";
import { INTENT_CHECKS } from "../../../src/intent/index.mjs";

test("R6 R7 R15: intentWorld is the real intent over a condition with one gap; its gaps and watchSet are the real answers, which the same calls give again, and a source registers once", async () => {
  const f = await intentWorld();
  assert.equal(f.gaps.ok, true);
  assert.deepEqual(f.gaps.gaps.map((g) => g.basis.entity), ["ENT-2"], "ENT-2 lacks its award");
  assert.equal(f.gaps.truncated, false);
  assert.deepEqual(f.watch.progressions, ["proc"]);
  assert.deepEqual(f.watch.entities, ["ENT-1", "ENT-2"]);
  assert.deepEqual(f.captures, ["ent-1-award", "ent-1-need", "ent-2-need"]);
  assert.deepEqual(f.intent.gaps({ project: f.project, viewer: f.viewer }), f.gaps, "the fixture's intent is the real one: it answers again as it did");
  assert.deepEqual(f.intent.watchSet({ project: f.project }), f.watch);
  assert.equal(f.intent.registerSource("monitoring", () => []).ok, true);
  assert.equal(f.intent.registerSource("monitoring", () => []).reason, "SOURCE_DECLARED");
});

test("R9 R22: notYoursRefusal is the real refusal of a member's aspiration declared by another member, with intent's check C-111.15 and its words, and nothing written", () => {
  const f = notYoursRefusal();
  assert.deepEqual([f.refusal.ok, f.refusal.reason], [false, "NOT_YOURS"]);
  assert.equal(f.refusal.check, INTENT_CHECKS.NOT_YOURS.check);
  assert.ok(f.refusal.translation && f.refusal.detail);
  assert.equal(f.world.count("intent_departures"), 0);
  assert.deepEqual(f.intent.declareAspiration({ scope: "member", owner: "carol", statement: "x", author: "member:bob" }), f.refusal, "the real refusal, again");
});
