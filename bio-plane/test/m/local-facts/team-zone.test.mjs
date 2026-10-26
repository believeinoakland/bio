/* local-facts: the team's own time zone (R21; T51 D-B1, K5264): a fact the team states whether or not a place profile is
   installed, a place profile's zone its default, an IANA name validated as a profile's own zone is. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, P, TP, written } from "./fixture.mjs";
import { factPath, parseFactPath, TEAM_ZONE_PATH } from "../../../src/local-facts/index.mjs";

const SAY = { how: "the team's administrator chose it", source: "stated by the team's administrator" };
const set = (w, value, fields = {}) => w.act(TEAM_ZONE_PATH, "correct", { value, ...SAY, ...fields });

test("R21 R6 the team's zone has one path no profile can hold, and parseFactPath reads it back", () => {
  assert.equal(factPath({ team: true, fact: "time_zone" }), TEAM_ZONE_PATH);
  assert.deepEqual(parseFactPath(TEAM_ZONE_PATH), { team: true, fact: "time_zone" });
  assert.equal(factPath({ team: true, fact: "hours" }), null);
  assert.equal(factPath({ team: true, fact: "time_zone", office: { venue: "k" } }), null);
  for (const s of ["@team", "@team/time_zone/venue=k", "@team/holidays/2026", "@other/time_zone", "team/time_zone/"])
    assert.equal(parseFactPath(s), null, s);
  assert.equal(factPath({ profile: "@team", fact: "time_zone" }), null, "no profile id is spelled with @");
});

test("R21 a team with no profile installed sets its zone, then reads it; red before the fix", () => {
  const w = world({ profiles: [] });
  const none = w.status(TEAM_ZONE_PATH);
  assert.equal(none.ok, true, "the path names a fact with no profile held");
  assert.deepEqual([none.status, none.governs, none.profile], ["absent", null, null]);
  const r = set(w, "America/Los_Angeles");
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.path, TEAM_ZONE_PATH);
  const s = w.status(TEAM_ZONE_PATH);
  assert.deepEqual([s.status, s.governs.value, s.governs.origin], ["corrected", "America/Los_Angeles", "corrected"]);
  assert.equal(s.latest.by, V("bob"));
  assert.equal(w.rows(`SELECT profile FROM local_fact_acts`)[0].profile, "@team");
  assert.ok(w.lf.factStatus({}).facts.some((f) => f.path === TEAM_ZONE_PATH && f.governs.value === "America/Los_Angeles"));
  assert.equal(set(w, "America/New_York").ok, true, "stated again: the latest governs");
  assert.equal(w.status(TEAM_ZONE_PATH).governs.value, "America/New_York");
  assert.equal(w.count(), 2, "append-only");
});

test("R21 an invalid zone is refused, writing nothing; a missing source or how is refused as for any correction", () => {
  const w = world({ profiles: [] });
  for (const value of ["Mars/Olympus", "pacific time", "", " America/Denver", 5, null, ["UTC"], { zone: "UTC" }]) {
    const r = set(w, value);
    assert.equal(r.reason, "FACT_VALUE_REFUSED", JSON.stringify(value));
  }
  assert.equal(w.act(TEAM_ZONE_PATH, "correct", { ...SAY }).reason, "FACT_VALUE_REFUSED", "no value");
  assert.equal(set(w, "America/Denver", { source: "" }).reason, "FACT_VALUE_REFUSED");
  assert.equal(set(w, "America/Denver", { how: "" }).reason, "FACT_HOW_REFUSED");
  assert.equal(set(w, "America/Denver", { by: "class:ai" }).reason, "MACHINE_CANNOT_CONFIRM");
  assert.equal(w.count(), 0);
  assert.equal(w.status(TEAM_ZONE_PATH).status, "absent");
});

test("R21 with no zone stated and none given by a profile there is nothing to confirm or dispute; once stated there is", () => {
  const w = world({ profiles: [] });
  assert.equal(w.act(TEAM_ZONE_PATH, "confirm").reason, "NO_SUCH_FACT");
  assert.equal(w.act(TEAM_ZONE_PATH, "dispute").reason, "NO_SUCH_FACT");
  assert.equal(w.count(), 0);
  set(w, "America/Chicago");
  assert.equal(w.act(TEAM_ZONE_PATH, "confirm").ok, true);
  assert.equal(w.status(TEAM_ZONE_PATH).status, "confirmed");
  assert.equal(w.act(TEAM_ZONE_PATH, "dispute").ok, true);
  assert.equal(w.status(TEAM_ZONE_PATH).status, "disputed");
});

test("R21 R3 a confirmed team zone lapses 183 days on, counted on the zone's own local day", () => {
  const w = world({ profiles: [] });
  w.at("2026-01-11T02:00:00Z");
  set(w, "America/Halifax");
  w.act(TEAM_ZONE_PATH, "confirm");
  assert.equal(w.status(TEAM_ZONE_PATH).lapses_on, "2026-07-12", "confirmed 2026-01-10 in Halifax");
  assert.equal(w.at("2026-07-12T02:59:00Z").status(TEAM_ZONE_PATH).status, "confirmed");
  assert.equal(w.at("2026-07-12T03:00:00Z").status(TEAM_ZONE_PATH).status, "unconfirmed");
});

test("R21 an installed place profile's zone is the default; a stated zone governs over it, the profile's own fact untouched", () => {
  const w = world();
  const d = w.status(TEAM_ZONE_PATH);
  assert.deepEqual([d.status, d.profile.value, d.governs.value, d.governs.origin], ["unconfirmed", "America/Halifax", "America/Halifax", "profile"]);
  assert.equal(set(w, "America/Vancouver").ok, true);
  const s = w.status(TEAM_ZONE_PATH);
  assert.deepEqual([s.status, s.profile.value, s.governs.value], ["corrected", "America/Halifax", "America/Vancouver"]);
  assert.equal(w.status(P.tz).governs.value, "America/Halifax", "the profile's fact is its own");
  /* a profile fact's correction is the default the team's zone takes */
  const w2 = world();
  w2.act(P.tz, "correct", { value: "America/Moncton", source: "the county" });
  assert.equal(w2.status(TEAM_ZONE_PATH).governs.value, "America/Moncton");
});

test("R21 two active profiles that govern different zones give no default; the team states its own", () => {
  const a = written("alpha", { time_zone: { value: "America/Denver", status: "ruled", basis: "TEST" } });
  const b = written("bravo", { time_zone: { value: "America/Chicago", status: "ruled", basis: "TEST" } });
  const w = world({ profiles: ["alpha", "bravo"], own: [a, b] });
  assert.equal(w.status(TEAM_ZONE_PATH).status, "absent");
  assert.equal(set(w, "America/Denver").ok, true);
  assert.equal(w.status(TEAM_ZONE_PATH).governs.value, "America/Denver");
});

test("R21 a viewer membership refuses sees no team fact", () => {
  const w = world({ profiles: [] });
  set(w, "America/Denver");
  assert.equal(w.status(TEAM_ZONE_PATH, "nobody").reason, "NO_SUCH_FACT");
  assert.equal(w.act(TEAM_ZONE_PATH, "confirm", { viewer: "nobody" }).reason, "NO_SUCH_FACT");
});
