/* local-facts: the team's zone also lives in record-core's setting `team_time_zone` (R22; T51 fix round 10, K5292;
   walk E N2, AP2). fixtures-own: the acts of the backfill case are written straight into this module's own table. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { TEAM_ZONE_PATH } from "../../../src/local-facts/index.mjs";

const SAY = { how: "the team's administrator chose it", source: "stated by the team's administrator" };
const set = (w, value, fields = {}) => w.act(TEAM_ZONE_PATH, "correct", { value, ...SAY, ...fields });

test("R22 a correction of the team's zone sets team_time_zone, read back with getSetting; a second replaces it", () => {
  const w = world({ profiles: [] });
  assert.equal(w.record.getSetting("team_time_zone"), null);
  assert.equal(set(w, "America/Los_Angeles").ok, true);
  assert.equal(w.record.getSetting("team_time_zone"), "America/Los_Angeles");
  assert.equal(set(w, "America/New_York").ok, true);
  assert.equal(w.record.getSetting("team_time_zone"), "America/New_York");
  assert.equal(w.status(TEAM_ZONE_PATH).governs.value, "America/New_York", "R21's governing value is unchanged");
});

test("R22 a confirm, a dispute and a profile fact's correction leave team_time_zone as it was", () => {
  const w = world();
  set(w, "America/Denver");
  w.act(TEAM_ZONE_PATH, "confirm");
  w.act(TEAM_ZONE_PATH, "dispute");
  assert.equal(w.record.getSetting("team_time_zone"), "America/Denver");
  const w2 = world();
  w2.act("test-port-ellery/time_zone", "correct", { value: "America/Moncton", source: "the county" });
  assert.equal(w2.record.getSetting("team_time_zone"), null, "a profile's zone is no stated team zone");
});

test("R22 a refused correction (FACT_VALUE_REFUSED) sets nothing, and keeps the setting it had", () => {
  const w = world({ profiles: [] });
  assert.equal(set(w, "Mars/Olympus").reason, "FACT_VALUE_REFUSED");
  assert.equal(w.record.getSetting("team_time_zone"), null);
  assert.equal(w.count(), 0);
  set(w, "America/Chicago");
  assert.equal(set(w, "pacific time").reason, "FACT_VALUE_REFUSED");
  assert.equal(set(w, "America/Boise", { how: "" }).reason, "FACT_HOW_REFUSED");
  assert.equal(w.record.getSetting("team_time_zone"), "America/Chicago");
  assert.equal(w.count(), 1);
});

test("R22 a copy holding a correction and no setting has it set by the first read, whatever the read (biosmoke8)", () => {
  for (const read of [(w) => w.status(TEAM_ZONE_PATH), (w) => w.lf.factStatus({ viewer: V("bob") }),
                      (w) => w.lf.factsDue({ viewer: V("bob") })]) {
    const w = world({ profiles: [] });
    w.st.sql.exec(`INSERT INTO local_fact_acts (path, profile, act, how, value_json, source, by_member, at)
                   VALUES (?, '@team', 'correct', 'checked', ?, 'the team', ?, '2026-09-27T00:00:00Z')`,
                  TEAM_ZONE_PATH, JSON.stringify("America/Los_Angeles"), V("bob"));
    assert.equal(w.record.getSetting("team_time_zone"), null, "acts written with no setting");
    read(w);
    assert.equal(w.record.getSetting("team_time_zone"), "America/Los_Angeles");
  }
});

test("R22 a copy holding a correction and no setting has it set by the first write", () => {
  const w = world({ profiles: [] });
  w.st.sql.exec(`INSERT INTO local_fact_acts (path, profile, act, how, value_json, source, by_member, at)
                 VALUES (?, '@team', 'correct', 'checked', ?, 'the team', ?, '2026-09-27T00:00:00Z')`,
                TEAM_ZONE_PATH, JSON.stringify("America/Denver"), V("bob"));
  assert.equal(w.act(TEAM_ZONE_PATH, "confirm").ok, true);
  assert.equal(w.record.getSetting("team_time_zone"), "America/Denver");
});
