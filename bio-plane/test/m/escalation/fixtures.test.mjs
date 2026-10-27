/* escalation's published fixtures (./fixtures.mjs), each called here and checked against the real answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { escalationRead, escalationsDue } from "./fixtures.mjs";

test("R2 R3 R22: the escalationRead fixture reads an escalation, refuses an unknown and an unseen one alike, and answers escalationsFor as the module does", () => {
  const f = escalationRead();
  assert.deepEqual([f.read.ok, f.read.id, f.read.determination, f.read.state, f.read.stage], [true, f.id, f.determination, "open", 1]);
  for (const r of [f.unknownAnswer, f.unseenAnswer]) assert.deepEqual([r.ok, r.reason, r.code], [false, "NO_SUCH_ESCALATION", "NO_SUCH_ESCALATION"]);
  assert.deepEqual(f.unknownAnswer, f.unseenAnswer, "absent and unseen are one answer");
  assert.deepEqual(f.forDetermination.items.map((x) => x.id), [f.id]);
  assert.deepEqual([f.forNone.ok, f.forNone.items], [true, []]);
  for (const r of [f.unknownDeterminationAnswer, f.unseenDeterminationAnswer]) assert.deepEqual([r.ok, r.reason], [false, "NO_SUCH_DETERMINATION"]);
  assert.deepEqual(f.unknownDeterminationAnswer.determination, f.unknownDetermination);
  assert.deepEqual(f.unseenDeterminationAnswer.determination, f.determination);
});

test("R16: the escalationsDue fixture is empty over a fresh world and lists the proposed edge of an escalation a real act opened", () => {
  const f = escalationsDue();
  assert.deepEqual([f.none.ok, f.none.items, f.none.truncated, f.none.limit], [true, [], false, 500]);
  assert.deepEqual([f.due.ok, f.due.truncated, f.due.limit], [true, false, 500]);
  assert.equal(f.due.items.length, 1);
  const [item] = f.due.items;
  assert.deepEqual([item.id, item.project, item.opened_by, item.from, item.to, item.stage], [f.id, f.world.P, f.viewer, 1, 2, "notification"]);
  assert.deepEqual(item, f.escalation.escalationsDue({ nowMs: f.nowMs, viewer: f.viewer }).items[0]);
});
