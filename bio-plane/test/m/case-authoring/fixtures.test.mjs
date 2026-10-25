/* case-authoring's published fixtures (fixtures.mjs): each is called and its real answer checked (K4990, K4993). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { preflightAnswer } from "./fixtures.mjs";

test("R34: the preflightAnswer fixture is publishPreflight's real answer — a bar shortfall as first (the refusal op=publish gives) with BELOW_PROJECT_STRENGTH among the blockers, and the first refusals MACHINE_CANNOT_PUBLISH and NOT_THE_PROJECT_OWNER — made afresh at call time, writing nothing", () => {
  const f = preflightAnswer();
  const before = f.world.snapshot();
  for (const a of [f.blocked, f.machine, f.notOwner]) assert.deepEqual([a.ok, a.wrote, a.ready], [true, false, false]);
  assert.equal(f.blocked.first.reason, "BELOW_PROJECT_STRENGTH");
  assert.deepEqual(f.blocked.first, f.world.ca.publishCase(f.args), "first is exactly the refusal op=publish gives");
  assert.ok(f.blocked.blockers.length >= 1 && f.blocked.blockers.every((b) => b.reason === "BELOW_PROJECT_STRENGTH"),
    JSON.stringify(f.blocked.blockers).slice(0, 300));
  assert.ok(!f.blocked.blockers.some((b) => JSON.stringify(b) === JSON.stringify(f.blocked.first)), "first is not repeated");
  assert.deepEqual([f.machine.first.ok, f.machine.first.reason, f.machine.first.code], [false, "MACHINE_CANNOT_PUBLISH", "MACHINE_CANNOT_PUBLISH"]);
  assert.deepEqual([f.notOwner.first.ok, f.notOwner.first.reason], [false, "NOT_THE_PROJECT_OWNER"]);
  assert.deepEqual(f.world.snapshot(), before, "nothing written");
  const again = preflightAnswer();
  assert.deepEqual([again.blocked.first.reason, again.blocked.blockers.length], [f.blocked.first.reason, f.blocked.blockers.length]);
});
