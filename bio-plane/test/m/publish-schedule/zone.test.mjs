/* publish-schedule — R1's governing zone (T50-84; N1203, K3635 doubt 5): the zone a set time is read in is the one
   `local-facts` answers as governing for the active profiles' `time_zone` (its R2, a member's correction first), else
   the profiles' own (`jurisdictions` R41), as `retrieval` R69 reads it; two profiles governing different zones govern
   none, and a set time is then refused PUBLISH_AT_NO_ZONE, never read as UTC. Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, SIG } from "./fixture.mjs";

const CASE = "CASE-2026-0001";
const AT = { date: "2026-10-01", time: "09:00" };
const HALIFAX = "America/Halifax", LISBON = "Europe/Lisbon";
const TEST_PROFILE = "test-port-ellery", OAKLAND = "oakland-alameda";
const ZONE_PATH = `${TEST_PROFILE}/time_zone`;

/* olive owns the project; one case edition prepared over an inquiry; the group's profile held. */
function base(profiles = [TEST_PROFILE]) {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry("INQ-2026-0001");
  const roles = [{ target: "INQ-2026-0001", version_sha: w.head("INQ-2026-0001") }];
  w.prepare(CASE, 1, { project: proj, roles });
  assert.equal(w.record.setSetting("jurisdiction_profiles", profiles, "admin").ok, true);
  /* the plane makes every module at boot, local-facts included (its empty tables are then already there) */
  w.ps.localFacts();
  return w;
}
const set = (w, at = AT) => w.record.transact(() => w.ps.scheduleEdition({
  case: CASE, edition: 1, docSha: w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, CASE).doc_sha,
  signature: SIG(1), signer: "olive", deliveredBy: V("olive"), at, checked: {}, by: V("olive") }));
/* a member's correction of the profile's zone, through local-facts (its R1), as the group's clerk call would record it */
const correctZone = (w, value) => {
  const r = w.ps.localFacts().factConfirm({ path: ZONE_PATH, act: "correct", by: V("olive"), how: "called the clerk",
                                            value, source: "the clerk's notice" });
  assert.equal(r.ok, true, JSON.stringify(r));
};

test("R1 with no local correction the governing zone is the active profile's time_zone (the profiles' own, R41): a set time is read in America/Halifax", () => {
  const w = base();
  assert.equal(w.ps.groupZone(), HALIFAX);
  const r = set(w);
  assert.deepEqual([r.ok, r.at.zone, r.publish_at], [true, HALIFAX, "2026-10-01T12:00:00Z"]);
});

test("R1 a member's correction of the zone, held by local-facts, governs over the profile's: a set time is read in the corrected zone", () => {
  const w = base();
  correctZone(w, LISBON);
  assert.equal(w.ps.groupZone(), LISBON);
  const r = set(w);
  /* 09:00 in Lisbon in October (WEST, UTC+1) is 08:00 UTC, not the profile's 12:00 UTC */
  assert.deepEqual([r.ok, r.at.zone, r.publish_at], [true, LISBON, "2026-10-01T08:00:00Z"]);
});

test("R1 the negative control: with no profile held no zone governs, so a set time is refused PUBLISH_AT_NO_ZONE and writes nothing", () => {
  const w = base(["no-such-profile"]);
  const before = w.snapshot();
  assert.equal(w.ps.groupZone(), null, "no held profile governs a zone");
  const r = set(w);
  assert.deepEqual([r.ok, r.reason], [false, "PUBLISH_AT_NO_ZONE"]);
  assert.deepEqual(w.snapshot(), before, "a refusal writes nothing");
});

test("R1 two active profiles whose zones disagree govern none: a set time is refused PUBLISH_AT_NO_ZONE, never read as UTC, and writes nothing", () => {
  const w = base([TEST_PROFILE, OAKLAND]);
  const before = w.snapshot();
  assert.equal(w.ps.groupZone(), null, "Halifax and Los Angeles govern no one zone");
  const r = set(w);
  assert.deepEqual([r.ok, r.reason], [false, "PUBLISH_AT_NO_ZONE"]);
  assert.deepEqual(w.snapshot(), before, "a refusal writes nothing");
});
