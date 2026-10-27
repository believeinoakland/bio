/* money K5292 (jurisdictions R98; local-facts R21, R22): a period that states no zone is read in the team's governing zone,
   so a team with no place profile that stated its time zone can record a period (it was refused MONEY_BAD_PERIOD); with none
   stated it is still refused. Driven at the interface: `recordFact`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded } from "./fixture.mjs";
import { localFactsOf, TEAM_ZONE_PATH } from "../../../src/local-facts/index.mjs";

const PROFILES = "jurisdiction_profiles";
const PERIOD = { from: "2014-07-01", to: "2015-07-01" };

test("R1, R98: a period with no zone is read in the team's stated zone when no profile gives one; with none stated it is refused MONEY_BAD_PERIOD", () => {
  const w = seeded();
  w.record.setSetting(PROFILES, [], "test");
  const none = w.m.recordFact(w.fact({ period: PERIOD }));
  assert.deepEqual([none.ok, none.code], [false, "MONEY_BAD_PERIOD"], "control: no profile, no team zone");
  const said = localFactsOf(w.host).factConfirm({ path: TEAM_ZONE_PATH, act: "correct", value: "America/Halifax",
    how: "the team's administrator chose it", source: "stated by the team's administrator", by: "member:ann", viewer: "member:ann" });
  assert.equal(said.ok, true);
  const got = w.m.recordFact(w.fact({ period: PERIOD }));
  assert.equal(got.ok, true, JSON.stringify(got));
  assert.equal(w.record.getSetting("team_time_zone"), "America/Halifax");
});

test("R1, R98: with a profile and no team zone stated the profile's zone still reads a period with no zone", () => {
  const w = seeded();
  assert.equal(w.record.getSetting("team_time_zone") ?? null, null);
  assert.equal(w.m.recordFact(w.fact({ period: PERIOD })).ok, true);
});
