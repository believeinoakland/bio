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

test("noticesRead (R14), several: four notices over three holders and two targets, each leg's real grade and affects", () => {
  const f = noticesRead({ several: true });
  assert.deepEqual([f.ok, f.truncated, f.state, f.count, f.raised.count], [true, false, "open", 4, 4]);
  const rows = f.notices.map((n) => [n.holder, n.ord, n.target, n.grade, n.affects].join("|")).sort();
  const [q1, q2] = ["INQ-2026-0001-q", "INQ-2026-0002-q"];
  assert.deepEqual(rows, [`${q1}|0|INFO-2026-0001-old|UNDETERMINED|undetermined`, `${q1}|1|INFO-2026-0001-old|UNDETERMINED|undetermined`,
    `${q2}|0|INFO-2026-0001-old|UNDETERMINED|undetermined`, "INQ-2026-0003-q|0|INFO-2026-0004-old2|NOT_FOUND|affected"]);
  /* the two of one holder's legs on one target wait on the same newer capture */
  assert.equal(new Set(f.notices.filter((n) => n.target === "INFO-2026-0001-old").map((n) => n.newer_capture)).size, 1);
  /* the read is the module's own: a second call answers the same */
  assert.deepEqual(f.world.r.notices({ viewer: f.viewer }).notices, f.notices);
});
