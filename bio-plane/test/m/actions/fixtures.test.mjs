/* actions' published fixtures (./fixtures.mjs), each called here and checked against the real answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { actionRead, actionsForRefusal } from "./fixtures.mjs";
import * as actions from "../../../src/actions/index.mjs";

test("R29 R106: the actionRead fixture reads a visible action, and answers an unknown id, an unseen action and a non-action alike through R43", () => {
  const f = actionRead();
  assert.deepEqual([f.read.ok, f.read.id, f.read.current_state], [true, f.action, "planned"]);
  for (const [r, id] of [[f.unknownAnswer, f.unknown], [f.unseenAnswer, f.action], [f.notAnActionAnswer, f.notAnAction]]) {
    assert.deepEqual([r.ok, r.reason, r.action], [false, "NO_SUCH_ACTION", id]);
    assert.deepEqual(r, actions.noSuchAction(id));
  }
});

test("R30 R62: the actionsForRefusal fixture refuses an unknown, an unseen and a non-action target as the module does", () => {
  const f = actionsForRefusal();
  assert.deepEqual([f.unknownTarget.ok, f.unknownTarget.reason, f.unknownTarget.target], [false, "NO_SUCH_BUNDLE", f.unknown]);
  assert.deepEqual([f.unseenTarget.ok, f.unseenTarget.reason, f.unseenTarget.target], [false, "NO_SUCH_BUNDLE", f.action]);
  assert.deepEqual([f.notAnActionTarget.ok, f.notAnActionTarget.reason, f.notAnActionTarget.target], [false, "NOT_AN_ACTION", f.notAnAction]);
  assert.deepEqual(f.unknownRead, actions.noSuchAction(f.unknown));
  assert.deepEqual([f.emptyPage.ok, f.emptyPage.items], [true, []]);
});
