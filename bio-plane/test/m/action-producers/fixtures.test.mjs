/* The fixtures action-producers publishes (fixtures.mjs), each called and its real answer checked. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { actionItems } from "./fixtures.mjs";

test("R13: the actionItems fixture answers the real read: one item to the member who created the action, none to a member who sees nothing, each beside its facts", () => {
  const f = actionItems();
  assert.deepEqual(f.due.items.map((i) => [i.class, i.kind, i.id]), [["CONDITION", "action-clock-overdue", "CONDITION::action-clock-overdue::ACT-1::0"]]);
  assert.deepEqual(f.none.items, []);
  for (const r of [f.due, f.none]) assert.deepEqual(r.facts.failed, []);
  assert.equal(f.actionProducers.actionItems({ member: f.member, viewer: `member:${f.member}`, now: f.now }).items.length, 1,
    "the same read, asked again, answers the same");
});
