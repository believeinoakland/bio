/* The overdue clock (R16, R17): counted by civil-time on the local day of the governing zone, from the predecessor's own
   date (R37), never from when the group captured, read or registered it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER, ZONE } from "./fixture.mjs";
import { readInterval } from "../../../src/progressions/index.mjs";

const T = (w, placements, entityId = "ENT-1") =>
  w.p.threadInstance({ progressionKey: "proc", entityId, placements, threadedBy: "member:alice", viewer: MEMBER });
const overdueOf = (w, now, sha = "sa") =>
  (w.p.captureProgressions({ captureSha: sha, nowMs: now }).instances[0]?.findings || []).filter((f) => f.kind === "overdue_successor");
const at = (s) => Date.parse(s);

test("R16: a missing stage is overdue only once the local day past the latest predecessor's own date plus its interval has begun in the governing zone", async () => {
  const w = seeded();
  w.define();                                   // award: within 30 days after need
  w.fact("sa", "2026-01-10");
  w.fact("sd", "2026-01-15");                   // the LATEST own date anchors the clock
  w.dates.reading.sa = "2026-08-01T00:00:00Z";  // a reading's or registration's date is never the stage's date
  w.dates.registered.sd = "2026-08-02T00:00:00Z";
  await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "need", captureSha: "sd" }]);
  // 2026-01-15 + 30 local days = 2026-02-14; it ends at local midnight in New York (UTC-5 in February)
  assert.deepEqual(overdueOf(w, at("2026-02-15T04:59:59Z")), []);          // still the 14th in the zone: not overdue
  const od = overdueOf(w, at("2026-02-15T05:00:00Z"));
  assert.equal(od.length, 1);
  const f = od[0];
  assert.deepEqual([f.stage_key, f.predecessor_stage, f.within_interval, f.deadline, f.deadline_zone, f.overdue, f.predecessor_at,
                    f.grade, f.definition_version],
                   ["award", "need", "30 days", "2026-02-14", ZONE, true, "2026-01-15", "undetermined", 1]);
  assert.deepEqual(f.overdue_by, { amount: 1, unit: "days" });
  assert.equal(f.overdue_by_ms, 0);
  assert.deepEqual(f.predecessor_dates.map((d) => [d.capture_sha, d.own_date.value, d.own_date_source]),
                   [["sa", "2026-01-10", "dated_fact"], ["sd", "2026-01-15", "dated_fact"]]);
  assert.deepEqual(overdueOf(w, at("2026-03-16T12:00:00Z"))[0].overdue_by, { amount: 30, unit: "days" });
  // an overdue stage is also a missing predecessor
  const all = w.p.captureProgressions({ captureSha: "sa", nowMs: at("2026-02-16T00:00:00Z") }).instances[0].findings;
  assert.ok(all.some((x) => x.kind === "missing_predecessor" && x.stage_key === "award"));
});

test("R16: days and weeks are local calendar days across a daylight-saving change, never fixed 86,400,000 ms; weeks state their lateness in weeks", async () => {
  const w = seeded();
  w.define("proc", { award: { within: "2 weeks" } });
  w.fact("sa", "2026-03-01");                    // the clocks move forward on 2026-03-08 in the zone
  await T(w, [{ stage: "need", captureSha: "sa" }]);
  // 2026-03-01 + 14 days = 2026-03-15, which ends at 04:00Z (UTC-4 after the change), not at 05:00Z
  assert.deepEqual(overdueOf(w, at("2026-03-16T03:59:59Z")), []);
  assert.equal(overdueOf(w, at("2026-03-16T04:00:00Z"))[0].deadline, "2026-03-15");
  assert.deepEqual(overdueOf(w, at("2026-03-30T04:00:00Z"))[0].overdue_by, { amount: 2, unit: "weeks" });
});

test("R16: months and years by the calendar; a month-end with no such day is possibly overdue (undetermined) between its two readings, overdue after the later", async () => {
  const w = seeded();
  w.define("proc", { award: { within: "1 month" } });
  w.fact("sa", "2026-01-31");                    // Jan 31 + 1 month: Feb 28 or Mar 1 (civil-time R13)
  await T(w, [{ stage: "need", captureSha: "sa" }]);
  assert.deepEqual(overdueOf(w, at("2026-02-28T12:00:00Z")), []);
  const between = overdueOf(w, at("2026-03-01T12:00:00Z"));
  assert.deepEqual([between[0].overdue, between[0].deadline_earliest, between[0].deadline], ["undetermined", "2026-02-28", "2026-03-01"]);
  assert.match(between[0].why, /possibly overdue/);
  const after = overdueOf(w, at("2026-03-02T12:00:00Z"));
  assert.deepEqual([after[0].overdue, after[0].deadline, after[0].overdue_by], [true, "2026-03-01", { amount: 0, unit: "months" }]);
  assert.deepEqual(overdueOf(w, at("2026-05-02T12:00:00Z"))[0].overdue_by, { amount: 2, unit: "months" });
  const y = seeded();
  y.define("proc", { award: { within: "1 year" } });
  y.fact("sa", "2025-03-01");
  await T(y, [{ stage: "need", captureSha: "sa" }]);
  assert.deepEqual(overdueOf(y, at("2026-03-01T12:00:00Z")), []);
  assert.equal(overdueOf(y, at("2026-03-02T12:00:00Z"))[0].deadline, "2026-03-01");
});

test("R16 R37: an event's own date anchors the clock in the event's zone; no own date is overdue undetermined, the capture date named as a bound only", async () => {
  const w = seeded();
  w.define();
  w.event("EVT-2026-aaaaaaaaaaaaaaaa", { start: "2026-01-10T18:00", end: null, precision: "minute", zone: "Europe/Paris" }, ["sa"]);
  await T(w, [{ stage: "need", captureSha: "sa", event: "EVT-2026-aaaaaaaaaaaaaaaa" }]);
  // the event's local day in Paris is 2026-01-10; + 30 days = 2026-02-09, ending at 23:00Z (UTC+1)
  assert.deepEqual(overdueOf(w, at("2026-02-09T22:59:59Z")), []);
  assert.deepEqual(overdueOf(w, at("2026-02-09T23:00:00Z")).map((f) => [f.deadline, f.deadline_zone, f.predecessor_dates[0].own_date_source]),
                   [["2026-02-09", "Europe/Paris", "event"]]);
  // no own date: undetermined at any instant, the registration shown as a bound and never used as the date
  const u = seeded();
  u.define();
  u.dates.registered.sa = "2026-01-02T00:00:00Z";
  u.dates.reading.sa = "2026-01-03T00:00:00Z";
  await T(u, [{ stage: "need", captureSha: "sa" }]);
  for (const now of [at("2026-01-04T00:00:00Z"), at("2040-01-01T00:00:00Z")]) {
    const f = overdueOf(u, now);
    assert.deepEqual([f.length, f[0].overdue, f[0].deadline], [1, "undetermined", null]);
    assert.match(f[0].why, /no own date/);
    assert.match(f[0].why, /2026-01-02T00:00:00Z, a bound only and never its date/);
    assert.deepEqual(f[0].bounds.map((b) => [b.capture_sha, b.bound.at]), [["sa", "2026-01-02T00:00:00Z"]]);
  }
  assert.equal(u.p.overdueScan(at("2040-01-01T00:00:00Z")).overdue_count, 0);
  // two dated facts held and none named: no own date (a member names the one); one named: it governs
  u.fact("sa", "2026-01-01", "DF-1");
  u.fact("sa", "2026-01-05", "DF-2");
  assert.match(overdueOf(u, at("2040-01-01T00:00:00Z"))[0].why, /2 dated facts/);
  await T(u, [{ stage: "need", captureSha: "sa", datedFact: "DF-1" }]);
  assert.deepEqual(overdueOf(u, at("2040-01-01T00:00:00Z")).map((f) => [f.overdue, f.deadline]), [[true, "2026-01-31"]]);
  // a day with no governing zone is undetermined, never read in UTC
  u.tz.zone = null;
  const nz = overdueOf(u, at("2040-01-01T00:00:00Z"));
  assert.equal(nz[0].overdue, "undetermined");
  assert.match(nz[0].why, /no time zone governs/);
});

test("R16: no placed predecessor, or no parsable within: never overdue, no deadline invented; now is the caller's, the clock's, then the wall's", async () => {
  const w = seeded();
  w.define("proc", { contract: { within: "before the meeting" } });
  w.fact("sa", "2026-01-01");
  w.fact("sb", "2026-01-02");
  await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sb" }]);   // contract: within unparsable
  assert.deepEqual(overdueOf(w, at("2040-01-01T00:00:00Z")), []);
  await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "contract", captureSha: "sb" }]); // award's predecessor placed
  assert.equal(overdueOf(w, at("2040-01-01T00:00:00Z")).length, 1);
  const x = seeded();
  x.define("proc", { award: { after: undefined } });
  x.fact("sa", "2026-01-01");
  await T(x, [{ stage: "contract", captureSha: "sa" }]);                                   // award after nothing: no clock
  assert.deepEqual(overdueOf(x, at("2040-01-01T00:00:00Z")), []);
  // over-strictness arm: only `<n> day|week|month|year`, plural allowed, n positive
  for (const bad of ["before the meeting", "by due date", "30", "days 30", "-3 days", "0 days", "3 fortnights", "", null, 7])
    assert.equal(readInterval(bad), null, String(bad));
  assert.deepEqual(["1 day", "3 Days", "2 weeks", "1 Month", "2 years"].map(readInterval),
    [{ amount: 1, unit: "days" }, { amount: 3, unit: "days" }, { amount: 2, unit: "weeks" }, { amount: 1, unit: "months" }, { amount: 2, unit: "years" }]);
  // now: an explicit instant wins; else the configured clock; else the wall clock
  const c = seeded({ nowMs: at("2026-06-01T00:00:00Z") });
  c.define();
  c.fact("sa", "2026-01-01");
  await T(c, [{ stage: "need", captureSha: "sa" }]);
  assert.equal(c.p.nowMs("5"), 5);
  assert.equal(c.p.nowMs(null), at("2026-06-01T00:00:00Z"));
  assert.equal(c.p.nowMs(""), at("2026-06-01T00:00:00Z"));
  assert.equal(overdueOf(c, null).length, 1);
  assert.equal(overdueOf(c, at("2026-01-15T00:00:00Z")).length, 0);
  assert.ok(Math.abs(seeded().p.nowMs(undefined) - Date.now()) < 5000);
});

test("R17: overdueScan writes nothing; counts the overdue; next_deadline is the earliest deadline end strictly after now, or null", async () => {
  const w = seeded();
  w.define();
  w.entity("ENT-2");
  w.resolve("ENT-2", "sb", "INFO-B", "A");
  w.fact("sa", "2026-01-01");                    // award due 2026-01-31, overdue from 2026-02-01T05:00Z
  w.fact("sb", "2026-01-11");                    // award due 2026-02-10, overdue from 2026-02-11T05:00Z
  await T(w, [{ stage: "need", captureSha: "sa" }]);
  await T(w, [{ stage: "need", captureSha: "sb" }], "ENT-2");
  const e1 = at("2026-02-01T05:00:00Z"), e2 = at("2026-02-11T05:00:00Z");
  const before = w.snapshot();
  assert.deepEqual(w.p.overdueScan(at("2026-01-01T00:00:00Z")), { overdue_count: 0, next_deadline: e1, next_deadline_at: "2026-02-01T05:00:00Z" });
  // exactly at a deadline's end: overdue, and never the next wake (never re-arms to now)
  assert.deepEqual(w.p.overdueScan(e1), { overdue_count: 1, next_deadline: e2, next_deadline_at: "2026-02-11T05:00:00Z" });
  assert.equal(w.p.overdueScan(e1 - 1000).overdue_count, 0);
  assert.deepEqual(w.p.overdueScan(e2 + 1), { overdue_count: 2, next_deadline: null, next_deadline_at: null });
  assert.deepEqual(w.snapshot(), before);
});
