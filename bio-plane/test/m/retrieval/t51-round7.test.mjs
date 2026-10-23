/* retrieval: T51 fix round 7, G62 (the Sign step says the zone is not set while Settings shows one): the logging that names
 * the live cause. `zone({why: true})` answers `{zone, source, why}`; the plain `zone()` is as it was (R69). */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";

const withProfiles = (ids, deps = {}) => {
  const w = world({ deps });
  if (ids) w.record.setSetting("jurisdiction_profiles", ids, "member:ann");
  return w;
};

test("R69: zone({why: true}) names where the governing zone came from: local-facts' governing value, else the profiles' own; the plain zone() answers the same zone as before", () => {
  const lf = withProfiles(["test-port-ellery"]);
  assert.deepEqual(lf.retrieval.zone({ why: true }), { zone: "America/Halifax", source: "local-facts", why: null });
  assert.equal(lf.retrieval.zone(), "America/Halifax", "control: plain zone() is the zone alone");
  assert.equal(lf.retrieval.zone({ why: false }), "America/Halifax", "control: why false is the plain answer");

  const lfCorrected = withProfiles(["test-port-ellery"], {
    localFacts: { factStatus: ({ path }) => ({ ok: true, path, governs: { value: "America/Chicago" } }) } });
  assert.deepEqual(lfCorrected.retrieval.zone({ why: true }), { zone: "America/Chicago", source: "local-facts", why: null });

  const profiles = withProfiles(["test-port-ellery"], { localFacts: { factStatus: () => ({ ok: true, governs: null }) } });
  assert.deepEqual(profiles.retrieval.zone({ why: true }), { zone: "America/Halifax", source: "profiles", why: null });
  assert.equal(profiles.retrieval.zone(), "America/Halifax");

  /* A local-facts that throws falls through to the profiles, as the plain read does. */
  const thrown = withProfiles(["test-port-ellery"], { localFacts: { factStatus: () => { throw new Error("x"); } } });
  assert.deepEqual(thrown.retrieval.zone({ why: true }), { zone: "America/Halifax", source: "profiles", why: null });
});

test("R69: zone({why: true}) with no zone names why, in a code and no sentence: no active profile, profiles governing different zones, a profile that states none; the plain zone() is null in each", () => {
  const cases = [
    ["no_profiles", withProfiles(null)],
    ["no_profiles", withProfiles([])],
    ["profiles_disagree", withProfiles(["a", "b"], {
      localFacts: { factStatus: ({ path }) => ({ ok: true, governs: { value: path.startsWith("a/") ? "America/Chicago" : "Europe/Paris" } }) } })],
    ["no_zone_stated", withProfiles(["test-port-ellery"], { localFacts: null, combine: () => ({ ok: false }) })],
  ];
  for (const [why, w] of cases) {
    assert.deepEqual(w.retrieval.zone({ why: true }), { zone: null, source: null, why }, why);
    assert.equal(w.retrieval.zone(), null, `control: plain zone() is null (${why})`);
  }
});
