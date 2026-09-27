/* The overdue clock (R16, R17). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER, DAY } from "./fixture.mjs";
import { intervalDeadlineMs } from "../../../src/progressions/index.mjs";

const T = (w, placements) =>
  w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements, threadedBy: "member:alice", viewer: MEMBER });
const overdueOf = (w, now) =>
  (w.p.captureProgressions({ captureSha: "sa", nowMs: now }).instances[0]?.findings || []).filter((f) => f.kind === "overdue_successor");

test("R16: a missing stage is overdue past the latest predecessor date plus its interval, and at no other time", async () => {
  const w = seeded();
  w.define();                                   // award: within 30 days after need
  const t0 = Date.parse("2026-01-10T00:00:00.000Z");
  w.dates.reading.sa = new Date(t0).toISOString();
  w.dates.reading.sd = new Date(t0 + 5 * DAY).toISOString();   // the LATEST dated document anchors the clock
  await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "need", captureSha: "sd" }]);
  const deadline = t0 + 35 * DAY;
  assert.equal(overdueOf(w, deadline).length, 0);              // at the deadline: not past it
  const od = overdueOf(w, deadline + 1);
  assert.equal(od.length, 1);
  assert.deepEqual([od[0].stage_key, od[0].predecessor_stage, od[0].within_interval, od[0].deadline, od[0].overdue_by_ms,
                    od[0].predecessor_at, od[0].grade, od[0].definition_version],
    ["award", "need", "30 days", new Date(deadline).toISOString(), 1, new Date(t0 + 5 * DAY).toISOString(), "undetermined", 1]);
  // an overdue stage is also a missing predecessor
  const f = w.p.captureProgressions({ captureSha: "sa", nowMs: deadline + 1 }).instances[0].findings;
  assert.ok(f.some((x) => x.kind === "missing_predecessor" && x.stage_key === "award"));
});

test("R16: registration is the fallback date; no date, no placed predecessor, or no parseable within: never overdue", async () => {
  const w = seeded();
  w.define("proc", { contract: { within: "before the meeting" } });
  const far = Date.parse("2040-01-01");
  await T(w, [{ stage: "need", captureSha: "sa" }]);
  assert.equal(overdueOf(w, far).length, 0);                       // no date at all: undetermined, not overdue
  w.dates.registered.sa = "2026-02-01T00:00:00.000Z";
  assert.deepEqual(overdueOf(w, far).map((f) => [f.stage_key, f.predecessor_at]), [["award", "2026-02-01T00:00:00.000Z"]]);
  w.dates.reading.sa = "2026-03-01T00:00:00.000Z";                 // a reading's date is preferred
  assert.equal(overdueOf(w, far)[0].predecessor_at, "2026-03-01T00:00:00.000Z");
  // contract's predecessor (award) is not placed: its clock has not started; and its within is not parseable
  await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sb" }]);
  w.dates.reading.sb = "2026-03-02T00:00:00.000Z";
  assert.equal(overdueOf(w, far).length, 0);
  // over-strictness arm: unparsable intervals are never read as a deadline
  for (const x of ["before the meeting", "by due date", "30", "days 30", "-3 days", "3 fortnights", ""]) assert.equal(intervalDeadlineMs(0, x), null, x);
});

test("R16: days and weeks are fixed spans, months and years calendar arithmetic; plurals allowed; now is caller, clock, then wall", async () => {
  const a = Date.parse("2026-01-31T12:00:00.000Z");
  assert.equal(intervalDeadlineMs(a, "1 day"), a + DAY);
  assert.equal(intervalDeadlineMs(a, "3 days"), a + 3 * DAY);
  assert.equal(intervalDeadlineMs(a, "2 weeks"), a + 14 * DAY);
  assert.equal(intervalDeadlineMs(a, "1 Week"), a + 7 * DAY);
  assert.equal(intervalDeadlineMs(a, "1 month"), Date.parse("2026-03-03T12:00:00.000Z"));   // Jan 31 + 1 month, by the calendar
  assert.equal(intervalDeadlineMs(Date.parse("2024-02-29T00:00:00Z"), "1 year"), Date.parse("2025-03-01T00:00:00Z"));
  assert.equal(intervalDeadlineMs(a, "2 years"), Date.parse("2028-01-31T12:00:00.000Z"));
  // now: an explicit instant wins; else the configured clock; else the wall clock
  const w = seeded({ nowMs: Date.parse("2026-06-01") });
  w.define();
  w.dates.reading.sa = "2026-01-01T00:00:00.000Z";
  await T(w, [{ stage: "need", captureSha: "sa" }]);
  assert.equal(w.p.nowMs("5"), 5);
  assert.equal(w.p.nowMs(null), Date.parse("2026-06-01"));
  assert.equal(w.p.nowMs(""), Date.parse("2026-06-01"));
  assert.equal(overdueOf(w, null).length, 1);                      // the clock: past Jan 31
  assert.equal(overdueOf(w, Date.parse("2026-01-15")).length, 0);   // the caller's instant wins
  const wall = seeded();
  const t = wall.p.nowMs(undefined);
  assert.ok(Math.abs(t - Date.now()) < 5000);
});

test("R17: overdueScan writes nothing; counts the overdue; next_deadline is the earliest strictly after now, or null", async () => {
  const w = seeded();
  w.define();
  w.entity("ENT-2");
  w.resolve("ENT-2", "sb", "INFO-B", "A");
  const t0 = Date.parse("2026-01-01T00:00:00.000Z");
  w.dates.reading.sa = new Date(t0).toISOString();
  w.dates.reading.sb = new Date(t0 + 10 * DAY).toISOString();
  await T(w, [{ stage: "need", captureSha: "sa" }]);                                 // deadline t0+30d
  await w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-2", placements: [{ stage: "need", captureSha: "sb" }],
                             threadedBy: "member:alice", viewer: MEMBER });           // deadline t0+40d
  const before = w.snapshot();
  assert.deepEqual(w.p.overdueScan(t0), { overdue_count: 0, next_deadline: t0 + 30 * DAY,
                                          next_deadline_at: new Date(t0 + 30 * DAY).toISOString() });
  // exactly at a deadline: neither overdue nor the next wake (never re-arms to now)
  assert.deepEqual(w.p.overdueScan(t0 + 30 * DAY), { overdue_count: 0, next_deadline: t0 + 40 * DAY,
                                                     next_deadline_at: new Date(t0 + 40 * DAY).toISOString() });
  assert.deepEqual(w.p.overdueScan(t0 + 30 * DAY + 1).overdue_count, 1);
  assert.deepEqual(w.p.overdueScan(t0 + 41 * DAY), { overdue_count: 2, next_deadline: null, next_deadline_at: null });
  assert.deepEqual(w.snapshot(), before);
});
