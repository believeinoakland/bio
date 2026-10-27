/* action-plans K5292 (jurisdictions R98; causes-rewalk §3, §4): a team with no place profile that stated its time zone (local-facts R21 writes
   record-core's `team_time_zone`, its R22) has its plan's dates judged on that zone; with none
   stated the checks stay undetermined. Each has its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, option, choose, V, by, ms } from "./fixture.mjs";

const read = (w, nowMs) => w.ap.planRead({ id: w.PL, viewer: V("bob"), nowMs });
const of = (r, check) => r.checks.filter((c) => c.check === check);
/* what local-facts R21/R22 leave for a module that reads settings alone: record-core's `team_time_zone` */
const state = (w, zone) => { w.record.setSetting("team_time_zone", zone, "member:ann"); };

test("R48, R98: with no profile and the team zone stated, date_past is determined on the team's local day; with none stated it is undetermined", () => {
  const w = seeded({ profiles: null });
  opened(w);
  option(w, { dates: [{ date: "2026-09-01", basis: "the order" }] });
  const at = ms("2027-06-01T12:00:00Z");
  assert.deepEqual(of(read(w, at), "date_past").map((c) => c.state), ["undetermined"], "control: nothing stated, no profile: no zone");
  state(w, "America/Los_Angeles");
  w.actions.place = () => null;   /* action-plans' own read of the team zone, not actions' */
  const got = of(read(w, at), "date_past");
  assert.equal(got.length, 1);
  assert.equal(got[0].state, undefined, "determined: it carries no undetermined state");
  assert.equal(got[0].date, "2026-09-01");
});

test("R48, R98: with no profile and the team zone stated, date_before_phase is determined and carries the phase's start day; with none stated it is undetermined", () => {
  const w = seeded({ profiles: null });
  opened(w);
  const on = option(w, { dates: [{ date: "2026-10-14", basis: "the statute" }] });
  const before = option(w, { dates: [{ date: "2026-10-13", basis: "the statute" }] });
  choose(w, [on, before]);
  w.clock.now = "2026-10-15T02:00:00Z";
  const phases = [{ id: "a", name: "A", options: [on, before], starts: "plan_start", checkpoint: { after_days: 3 }, branches: { met: "b", not_met: "b" } },
                  { id: "b", name: "B", options: [], starts: { after: "a" } }];
  assert.equal(w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "S", phases, ...by("bob") }).ok, true);
  const at = ms("2026-10-15T02:30:00Z");
  const none = of(read(w, at), "date_before_phase");
  assert.deepEqual(none.map((c) => c.state), ["undetermined", "undetermined"], "control: nothing stated, no profile: no zone");
  state(w, "America/Halifax");
  w.actions.place = () => null;
  const got = of(read(w, at), "date_before_phase");
  assert.deepEqual(got.map((c) => [c.option, c.date, c.state ?? null, c.start]), [[before, "2026-10-13", null, "2026-10-14"]],
    "the team's local day of the plan start is the 14th, so only the 13th falls before it");
});

test("R98: actions.place() carries the team's stated zone when no profile gives one, and a profile's zone still stands when none is stated", () => {
  const w = seeded({ profiles: null });
  assert.equal(w.actions.place(), null, "control: nothing stated, no profile");
  state(w, "America/Halifax");
  assert.equal(w.actions.place().time_zone.value, "America/Halifax");
  const p = seeded();
  assert.equal(p.actions.place().time_zone.value, "America/Halifax", "control: the profile's zone with no team zone stated");
});
