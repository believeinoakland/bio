/* The jurisdiction profiles (R12–R16, N10) and R31, at the module's interface. The profiles held are `jurisdictions`'
   own: one real profile and one test profile. */
import test from "node:test";
import assert from "node:assert/strict";
import { list as heldProfiles, combine } from "../../../../jurisdictions/index.mjs";
import { boot } from "./fixture.mjs";
import { INSTANCE_SETUP_CHECKS, SETUP_HTML, NO_GROUP_RECORDED, RUNTIME_ASYMMETRY } from "../../../src/setup.mjs";

const REAL = heldProfiles().filter((p) => p.test !== true);
const TEST = heldProfiles().filter((p) => p.test === true);
const world = async (env = {}) => { const w = await boot({ env }); w.prov.admins = new Set(["admin", "member:ada"]); return w; };

test("R12 profiles(): the record-core setting's ids in order, each with its name and covers, combine's conflicts, and no active profile answered as valid", async () => {
  assert.ok(REAL.length >= 1 && TEST.length >= 1, "jurisdictions holds a real and a test profile");
  const w = await world();
  const empty = w.m.profiles();
  assert.deepEqual([empty.ok, empty.profiles, empty.conflicts], [true, [], []]);
  assert.match(empty.detail, /no active profile/);
  assert.deepEqual(empty.choices.map((c) => c.id), REAL.map((p) => p.id));
  w.record.setSetting("jurisdiction_profiles", [REAL[0].id], "admin");
  const one = w.m.profiles();
  assert.deepEqual(one.profiles, [{ id: REAL[0].id, name: REAL[0].name, covers: REAL[0].covers }]);
  assert.deepEqual(one.conflicts, combine([REAL[0].id]).conflicts);
  assert.equal("detail" in one, false);
  /* combine's conflicts are reported over the list as it stands, whatever it holds */
  w.record.setSetting("jurisdiction_profiles", [REAL[0].id, TEST[0].id], "admin");
  const two = w.m.profiles();
  assert.deepEqual(two.profiles.map((p) => p.id), [REAL[0].id, TEST[0].id]);
  assert.deepEqual(two.conflicts, combine([REAL[0].id, TEST[0].id]).conflicts);
  /* an id the setting holds that is no longer held is named, never dropped */
  w.record.setSetting("jurisdiction_profiles", ["gone-profile"], "admin");
  const gone = w.m.profiles();
  assert.deepEqual(gone.profiles, [{ id: "gone-profile", name: null, covers: null, held: false }]);
  assert.ok(Array.isArray(gone.errors) && gone.errors.length);
});

test("R13 at the first boot JURISDICTION_PROFILES (comma-separated, in order) is recorded when every id is held and none is a test profile; else nothing is recorded and profiles() says why; no later boot records it", async () => {
  const ok = await world({ JURISDICTION_PROFILES: ` ${REAL[0].id} ` });
  assert.deepEqual(ok.m.profiles().profiles.map((p) => p.id), [REAL[0].id]);
  assert.deepEqual(ok.started.profiles, { recorded: true, profiles: [REAL[0].id] });
  const unknown = await world({ JURISDICTION_PROFILES: `${REAL[0].id},nowhere-profile` });
  assert.deepEqual(unknown.m.profiles().profiles, []);
  assert.match(unknown.m.profiles().boot.why, /nowhere-profile/);
  assert.equal(unknown.record.getSetting("jurisdiction_profiles"), null);
  const testOne = await world({ JURISDICTION_PROFILES: `${REAL[0].id},${TEST[0].id}` });
  assert.deepEqual(testOne.m.profiles().profiles, []);
  assert.match(testOne.m.profiles().boot.why, new RegExp(TEST[0].id));
  const unbound = await world({});
  assert.equal(unbound.started.profiles.bound, false);
  assert.equal("boot" in unbound.m.profiles(), false);
  /* a later boot records nothing, whatever the binding says */
  const later = await boot({ st: unbound.st, env: { JURISDICTION_PROFILES: REAL[0].id } });
  assert.deepEqual(later.m.profiles().profiles, []);
  const moved = await boot({ st: ok.st, env: { JURISDICTION_PROFILES: "" } });
  assert.deepEqual(moved.m.profiles().profiles.map((p) => p.id), [REAL[0].id]);
});

test("R14 profilesSet replaces the list: PROFILES_NOT_ADMIN, NOT_A_LIST, UNKNOWN_PROFILE, PROFILE_IS_TEST (C-119); recorded through setSetting with by, dated and attributed", async () => {
  const w = await world();
  const refused = [
    [w.m.profilesSet({ profiles: [REAL[0].id], by: "member:bob" }), "PROFILES_NOT_ADMIN", "C-119.1"],
    [w.m.profilesSet({ profiles: [REAL[0].id], by: null }), "PROFILES_NOT_ADMIN", "C-119.1"],
    [w.m.profilesSet({ profiles: "oakland", by: "admin" }), "NOT_A_LIST", "C-119.2"],
    [w.m.profilesSet({ by: "admin" }), "NOT_A_LIST", "C-119.2"],
    [w.m.profilesSet({ profiles: [REAL[0].id, "nowhere"], by: "admin" }), "UNKNOWN_PROFILE", "C-119.3"],
    [w.m.profilesSet({ profiles: [7], by: "admin" }), "UNKNOWN_PROFILE", "C-119.3"],
    [w.m.profilesSet({ profiles: [TEST[0].id], by: "admin" }), "PROFILE_IS_TEST", "C-119.4"],
  ];
  for (const [r, code, check] of refused) {
    assert.deepEqual([r.ok, r.reason, r.check], [false, code, check]);
    assert.equal(r.translation, INSTANCE_SETUP_CHECKS[code].translation);
  }
  assert.deepEqual(refused[4][0].profiles, ["nowhere"]);
  assert.deepEqual(refused[6][0].profiles, [TEST[0].id]);
  assert.equal(w.record.getSetting("jurisdiction_profiles"), null);
  /* the administrator's check comes first: a non-administrator learns nothing about what it sent */
  assert.equal(w.m.profilesSet({ profiles: "x", by: "member:bob" }).reason, "PROFILES_NOT_ADMIN");
  const set = w.m.profilesSet({ profiles: [REAL[0].id, REAL[0].id], by: "member:ada" });
  assert.equal(set.ok, true);
  assert.equal(set.set_by, "member:ada");
  assert.deepEqual(set.profiles.map((p) => p.id), [REAL[0].id]);
  const row = w.st.db.prepare(`SELECT value, set_by, set_at FROM settings WHERE name='jurisdiction_profiles' ORDER BY rowid DESC`).get();
  assert.deepEqual([JSON.parse(row.value), row.set_by], [[REAL[0].id], "member:ada"]);
  assert.match(row.set_at, /^\d{4}-\d\d-\d\dT/);
  const none = w.m.profilesSet({ profiles: [], by: "admin" });
  assert.equal(none.ok, true);
  assert.deepEqual(none.profiles, []);
  assert.match(none.note, /no profile is active/);
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM settings WHERE name='jurisdiction_profiles'`).get().n, 2);
});

test.todo("R15 the page shows the active profiles by name and offers an administrator the held non-test profiles, none preselected, warning before a change (not yet met end to end: control-plane's OPS rows for op=profiles and op=profilesset, K407; the page half is page.test.mjs's)");

test("R16 profiles() and profilesSet answer from the namespace addressed: a scratch store holds its own list", async () => {
  const bio = await world();
  const scratch = await world();
  bio.m.profilesSet({ profiles: [REAL[0].id], by: "admin" });
  assert.deepEqual(bio.m.profiles().profiles.map((p) => p.id), [REAL[0].id]);
  assert.deepEqual(scratch.m.profiles().profiles, []);
  scratch.m.profilesSet({ profiles: [], by: "admin" });
  assert.deepEqual(bio.m.profiles().profiles.map((p) => p.id), [REAL[0].id]);
});

test("R31 no place is named in this module's outward text: the page, every refusal and every stated sentence name no jurisdiction a profile covers", async () => {
  const places = heldProfiles().flatMap((p) => p.covers).flatMap((c) => c.split(/\s+(?:of|and)\s+|\s+/))
    .filter((w) => /^[A-Z]/.test(w) && !["City", "County", "Town"].includes(w));
  assert.ok(places.length >= 2);
  const w = await world({ INSTANCE_NAME: "river-town" });
  w.prov.admins = new Set(["admin"]);
  const texts = [SETUP_HTML, NO_GROUP_RECORDED, RUNTIME_ASYMMETRY,
    ...Object.values(INSTANCE_SETUP_CHECKS).map((r) => r.translation),
    /* the choices are the profiles' own data (jurisdictions'), never this module's words */
    JSON.stringify({ ...w.m.profiles(), choices: undefined }), JSON.stringify(w.m.instanceGroup()), JSON.stringify(w.m.cpuProbeState()),
    JSON.stringify(w.m.runtimeObservations()), JSON.stringify(w.m.profilesSet({ profiles: "x", by: "admin" }))];
  for (const t of texts) for (const place of places) assert.equal(t.includes(place), false, `${place} in ${t.slice(0, 80)}`);
  /* the one way a place reaches an answer is a profile an administrator chose: its own name, from its own data */
  w.m.profilesSet({ profiles: [REAL[0].id], by: "admin" });
  assert.equal(w.m.profiles().profiles[0].name, REAL[0].name);
});
