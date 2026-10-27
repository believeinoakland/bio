/* retrieval: T51 fix round 10, D-B1 (walk D, causes-D.md): a team with no place profile installed that states its own time
 * zone (local-facts R21, its path `@team/time_zone`) has that zone read by every compile; a team that states none gets no
 * zone, with its why. */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { localFactsOf, TEAM_ZONE_PATH } from "../../../src/local-facts/index.mjs";

test("R69: a team with no place profile that stated its time zone gets that zone, from local-facts' team fact (R21); with nothing stated, no zone and its why", () => {
  const stated = world();
  const said = localFactsOf(stated.host).factConfirm({ path: TEAM_ZONE_PATH, act: "correct", value: "America/Chicago",
    how: "the team's administrator chose it", source: "stated by the team's administrator", by: "member:ann", viewer: "member:ann" });
  assert.equal(said.ok, true, "the team's zone is stated with no profile installed");
  assert.deepEqual(stated.retrieval.zone({ why: true }), { zone: "America/Chicago", source: "local-facts", why: null });
  assert.equal(stated.retrieval.zone(), "America/Chicago", "the plain zone() reads the stated zone too");

  const nothing = world();
  assert.deepEqual(nothing.retrieval.zone({ why: true }), { zone: null, source: null, why: "no_profiles" },
    "control: nothing stated and no profile: no zone, with its why");
  assert.equal(nothing.retrieval.zone(), null, "control: the plain zone() is null");
});
