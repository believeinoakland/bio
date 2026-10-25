/* reevaluation's published fixtures, each called and its real answer checked. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { noticesRead } from "./fixtures.mjs";

test("noticesRead (R14): the real notices read over a raised notice, {ok, limit, truncated, notices}", () => {
  const f = noticesRead();
  assert.deepEqual([f.ok, f.truncated, f.state, f.count], [true, false, "open", 1]);
  assert.equal(typeof f.limit, "number");
  assert.equal(f.notices.length, 1);
  assert.deepEqual([f.notices[0].holder, f.notices[0].state, f.notices[0].affects], [f.holder, "open", "affected"]);
  assert.equal(f.raised.count, 1);
  /* the read is the module's own: a second call answers the same */
  assert.deepEqual(f.world.r.notices({ viewer: f.viewer }).notices, f.notices);
});
