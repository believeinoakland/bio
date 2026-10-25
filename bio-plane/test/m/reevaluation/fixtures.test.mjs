/* reevaluation's published fixtures, each called and its real answer checked. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { noticesRead, noticesTwoVersions, noticesHiddenVersion } from "./fixtures.mjs";

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

test("noticesTwoVersions (R14): one holder's leg with two newer captures gives two notices, one per newer capture, each graded", () => {
  const f = noticesTwoVersions();
  assert.deepEqual([f.ok, f.truncated, f.state, f.count, f.raised.count], [true, false, "open", 2, 2]);
  assert.deepEqual(f.notices.map((n) => [n.holder, n.target, n.grade, n.affects]),
                   [[f.holder, "INFO-2026-0007-old3", "NOT_FOUND", "affected"], [f.holder, "INFO-2026-0007-old3", "NOT_FOUND", "affected"]]);
  assert.deepEqual(f.notices.map((n) => n.newer_capture).sort(), [...f.newer_captures].sort());
  assert.equal(new Set(f.notices.map((n) => n.newer_capture)).size, 2);
  /* the read is the module's own: a second call answers the same */
  assert.deepEqual(f.world.r.notices({ viewer: f.viewer }).notices, f.notices);
});

test("noticesHiddenVersion (R14, R20): a newer capture the viewer may not see is null in its notice, which the viewer still gets", () => {
  const f = noticesHiddenVersion();
  assert.deepEqual([f.ok, f.count, f.state], [true, 1, "open"]);
  const [n] = f.notices;
  assert.deepEqual([n.holder, n.target, n.newer_capture, n.grade, n.affects], [f.holder, "INFO-2026-0010-old4", null, null, null]);
  /* the same notice, read by a viewer who sees the newer capture: its sha and grade are given */
  const admin = f.world.r.notices({ viewer: "class:admin" }).notices[0];
  assert.deepEqual([admin.notice, admin.newer_capture, admin.affects], [n.notice, f.newer_capture, "affected"]);
});
