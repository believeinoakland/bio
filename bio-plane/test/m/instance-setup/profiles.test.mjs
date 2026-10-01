/* The jurisdiction profiles (R12–R16, N10) and R31, at the module's interface. The profiles held are `jurisdictions`'
   own: one real profile and one test profile. R15 runs end to end: the page the real plane serves (Miniflare), its
   script driving op=profiles and op=profilesset through the Worker's route to this module in the Durable Object. */
import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { list as heldProfiles, combine } from "../../../../jurisdictions/index.mjs";
import { boot, pageOver, stubOver, doAnswer } from "./fixture.mjs";
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

/* R12's view as `combine` gives it over `ids`: the three facts, each absent when the combined view holds none. */
const viewOf = (ids) => {
  const c = combine(ids);
  const want = {};
  if (!c.ok) return want;
  for (const f of ["deadlines", "legal_organisations"]) if ((c.view[f] || []).length) want[f] = c.view[f];
  const venues = (c.view.action_kinds || []).filter((k) => k.venue).map((k) => ({ kind: k.kind, venue: k.venue }));
  if (venues.length) want.venues = venues;
  return want;
};

test("R12 R16 profiles() carries view: combine's deadlines and legal_organisations, and each {kind, venue} of a combined action kind that gives one, over two profiles one not Oakland's; a venue combine withholds, and every fact when nothing is active or the list cannot be combined, is absent, never an empty list; through the route too", async () => {
  const w = await world();
  const OAK = REAL.find((p) => p.id === "oakland-alameda"), OTHER = TEST[0];
  assert.ok(OAK && OTHER && OTHER.id !== OAK.id, "two held profiles, one not Oakland's");
  /* nothing active: the view states no fact, so agent-worker reads each undetermined */
  assert.deepEqual(w.m.profiles().view, {});
  for (const ids of [[OTHER.id], [OAK.id], [OAK.id, OTHER.id]]) {
    w.record.setSetting("jurisdiction_profiles", ids, "admin");
    const view = w.m.profiles().view;
    const c = combine(ids);
    assert.deepEqual(view, viewOf(ids), ids.join("+"));
    for (const f of ["deadlines", "legal_organisations", "venues"]) {
      assert.ok(Array.isArray(view[f]) && view[f].length > 0, `${ids.join("+")}: ${f} stated`);
      for (const x of view[f]) assert.equal(typeof x, "object");
    }
    assert.deepEqual(view.deadlines, c.view.deadlines);
    assert.deepEqual(view.legal_organisations, c.view.legal_organisations);
    for (const v of view.venues) assert.deepEqual(Object.keys(v), ["kind", "venue"]);
    /* every kind that gives a venue is listed, with that venue as combined, and no other */
    assert.deepEqual(view.venues.map((v) => v.kind), c.view.action_kinds.filter((k) => k.venue).map((k) => k.kind));
    for (const v of view.venues) assert.deepEqual(v.venue, c.view.action_kinds.find((k) => k.kind === v.kind).venue);
  }
  /* the profile that is not Oakland's alone: its own facts, none of Oakland's */
  w.record.setSetting("jurisdiction_profiles", [OTHER.id], "admin");
  const own = w.m.profiles().view;
  for (const f of ["deadlines", "legal_organisations"]) for (const x of own[f]) assert.equal(x.profile, OTHER.id, f);
  for (const v of own.venues) assert.equal(v.venue.profile, OTHER.id);
  /* together: the two disagree on records_request's venue, so combine withholds it and the view lists no venue for it */
  w.record.setSetting("jurisdiction_profiles", [OAK.id, OTHER.id], "admin");
  const both = w.m.profiles();
  assert.ok(both.conflicts.some((x) => x.at === "action_kinds[records_request].venue"), "the premise: a withheld venue");
  assert.equal(both.view.venues.some((v) => v.kind === "records_request"), false);
  assert.ok(both.view.venues.some((v) => v.venue.profile === OAK.id) && both.view.venues.some((v) => v.venue.profile === OTHER.id));
  /* a list combine cannot give answers no fact at all */
  w.record.setSetting("jurisdiction_profiles", [OAK.id, "gone-profile"], "admin");
  const gone = w.m.profiles();
  assert.ok(gone.errors.length);
  assert.deepEqual(gone.view, {});
  /* an empty list set by an administrator: none */
  w.prov.admins.add("admin");
  assert.deepEqual(w.m.profilesSet({ profiles: [], by: "admin" }).view, {});
  /* R16: the namespace addressed answers its own view, through the route the plane relays */
  const scratch = await world();
  w.m.profilesSet({ profiles: [OAK.id], by: "admin" });
  const routed = await doAnswer(stubOver(w.m).fetch("http://do/profiles"));
  assert.deepEqual(routed.result.view, viewOf([OAK.id]));
  assert.deepEqual((await doAnswer(stubOver(scratch.m).fetch("http://do/profiles"))).result.view, {});
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

/* ------------------------------------------------------------------------------ R15 end to end, on the real plane */

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADMIN_TOKEN = "adm-profiles-e2e-0123456789";
let mf = null;
after(async () => { if (mf) await mf.dispose(); });
/* The page's fetch, answered by the real Worker: its `/api/` routes, the control plane's credential and stamps, and
   the Durable Object this module runs in. `sent` records every op the page asked, with its body. */
const planeFetch = (sent) => async (url, init) => {
  const u = new URL(url, "https://copy.example");
  sent.push({ op: u.searchParams.get("op"), body: init && init.body ? JSON.parse(init.body) : null });
  return mf.dispatchFetch(u.href, init);
};
const api = async (op, body, token) => (await mf.dispatchFetch(
  `https://copy.example/api/?op=${op}${token ? `&token=${encodeURIComponent(token)}` : ""}`,
  body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) })).json();
const until = async (cond, what) => {
  for (let i = 0; i < 400; i++) { if (cond()) return; await new Promise((r) => setTimeout(r, 10)); }
  assert.fail(`the page never reached: ${what}`);
};
/* The page exactly as the Worker serves it at `/`, its script run with the plane behind its fetch. */
const servedPage = async ({ hash = "", sent = [] } = {}) =>
  pageOver({ html: await (await mf.dispatchFetch("https://copy.example/")).text(), hash, fetch: planeFetch(sent) });

test("R15 end to end through the Worker's route: the page served at / shows the active profiles by name, offers an administrator every held non-test profile with none preselected, warns before op=profilesset and sends only on confirmation; none is allowed and said; a member sees the names and no choice, and the plane refuses a member's set and a bearer's", { timeout: 300000 }, async () => {
  mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    bindings: { ADMIN_TOKEN, MEMBER_TOKEN: "mem-profiles-e2e-0123456789", PROBE_TOKEN: "prb-profiles-e2e-0123456789",
                VERSION: "test", INSTANCE_NAME: "river-town" },
  });
  await mf.ready;
  /* The founder claims the copy on the page and is signed in: nothing is active (none recorded at install). */
  const sent = [];
  const admin = await servedPage({ hash: `#boot=${ADMIN_TOKEN}`, sent });
  await until(() => admin.el("#boot").value === ADMIN_TOKEN, "the claim form");
  admin.el("#pw1").value = "the-founders-password"; admin.el("#pw2").value = "the-founders-password";
  await admin.el("#do-claim").fire();
  await until(() => /class="pf-pick"/.test(admin.el("#pf-choices").innerHTML), "the administrator's choice");
  assert.equal(admin.el("#pf-choose").hidden, false);
  assert.match(admin.el("#pf-active").innerHTML, /No profile is active/);
  /* every held non-test profile is offered, by name, and nothing is preselected */
  const offered = [...admin.el("#pf-choices").innerHTML.matchAll(/class="pf-pick" value="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(offered, REAL.map((p) => p.id));
  for (const p of REAL) assert.ok(admin.el("#pf-choices").innerHTML.includes(p.name), p.name);
  for (const p of TEST) assert.equal(admin.el("#pf-choices").innerHTML.includes(p.id), false, p.id);
  assert.doesNotMatch(admin.el("#pf-choices").innerHTML, /checked/);
  /* ticked and reviewed: the warning, and nothing sent until it is confirmed */
  const pick = admin.sandbox.document.querySelectorAll("#pf-choices .pf-pick").find((x) => x.value === REAL[0].id);
  pick.checked = true; await pick.fire("change");
  admin.el("#pf-warn").hidden = true;
  await admin.el("#pf-review").fire();
  await until(() => admin.el("#pf-warn").hidden === false, "the warning");
  assert.match(admin.el("#pf-warn-text").textContent, new RegExp(`${REAL[0].name}[^]*read differently from then on`));
  assert.equal(sent.filter((c) => c.op === "profilesset").length, 0, "nothing is sent before the warning is confirmed");
  await admin.el("#pf-confirm").fire();
  await until(() => sent.some((c) => c.op === "profilesset") && /class="k">1\./.test(admin.el("#pf-active").innerHTML), "the change shown");
  assert.deepEqual(sent.filter((c) => c.op === "profilesset").map((c) => c.body), [{ profiles: [REAL[0].id] }]);
  assert.match(admin.el("#pf-active").innerHTML, new RegExp(`1\\. ${REAL[0].name}`));
  assert.equal(admin.el("#pf-err").textContent, "");
  /* the plane recorded it, attributed to the administrator's own session */
  const token = JSON.parse(admin.sandbox.sessionStorage.getItem("bio-session")).t;
  const read = await api("profiles", undefined, token);
  assert.deepEqual(read.result.profiles.map((p) => p.id), [REAL[0].id]);
  /* R12's view through the Worker's route, as agent-worker R51 reads op=profiles */
  assert.deepEqual(read.result.view, viewOf([REAL[0].id]));

  /* a second administrator (the group's floor before any ordinary member), enrolled: an administrator's own session,
     not only the founder's, sets the list, and the set is attributed to that session's member */
  const second = await api("memberadd", { memberId: "bea", cover: "volunteer-2", role: "admin" }, token);
  assert.equal(second.result.ok, true, JSON.stringify(second));
  assert.equal((await api("enroll", { invite: second.result.invite, handle: "bea", password: "beas-own-password" })).result.ok, true);
  const bea = await api("login", { role: "member:bea", password: "beas-own-password" });
  const beaSet = await api("profilesset", { profiles: [REAL[0].id] }, bea.result.token);
  assert.equal(beaSet.result.ok, true, JSON.stringify(beaSet));
  assert.match(beaSet.result.set_by, /bea/);

  /* a member: enrolled by the administrator, signed in on a fresh page, shown the names and offered no choice */
  const invited = await api("memberadd", { memberId: "ada", cover: "volunteer-7" }, token);
  assert.equal(invited.result.ok, true, JSON.stringify(invited));
  const joined = await api("enroll", { invite: invited.result.invite, handle: "ada", password: "adas-own-password" });
  assert.equal(joined.result.ok, true, JSON.stringify(joined));
  const member = await servedPage();
  await until(() => typeof member.el("#do-login").listeners.click !== "undefined", "the sign-in form");
  member.el("#lwho").value = "ada"; member.el("#lpw").value = "adas-own-password";
  await member.el("#do-login").fire();
  await until(() => /class="k">1\./.test(member.el("#pf-active").innerHTML), "the member's view of the profiles");
  assert.match(member.el("#pf-active").innerHTML, new RegExp(REAL[0].name));
  assert.equal(member.el("#pf-choose").hidden, true);
  /* the plane refuses the set to a member's session (instance-setup's check) and to every bearer (the route's) */
  const memberToken = JSON.parse(member.sandbox.sessionStorage.getItem("bio-session")).t;
  const refused = await api("profilesset", { profiles: [] }, memberToken);
  assert.equal(refused.result.reason, "PROFILES_NOT_ADMIN", JSON.stringify(refused));
  const bearer = await (await mf.dispatchFetch("https://copy.example/api/?op=profilesset", {
    method: "POST", body: JSON.stringify({ profiles: [] }), headers: { authorization: `Bearer ${ADMIN_TOKEN}` } })).json();
  assert.equal(bearer.ok, false, JSON.stringify(bearer));
  assert.deepEqual((await api("profiles", undefined, token)).result.profiles.map((p) => p.id), [REAL[0].id]);

  /* choosing none: allowed, said before it is sent, and shown after */
  const unpick = admin.sandbox.document.querySelectorAll("#pf-choices .pf-pick").find((x) => x.value === REAL[0].id);
  unpick.checked = false; await unpick.fire("change");
  admin.el("#pf-warn").hidden = true;
  await admin.el("#pf-review").fire();
  await until(() => admin.el("#pf-warn").hidden === false, "the warning for none");
  assert.match(admin.el("#pf-warn-text").textContent, /You chose no profile[^]*read differently from then on/);
  await admin.el("#pf-confirm").fire();
  await until(() => /No profile is active/.test(admin.el("#pf-active").innerHTML), "none shown");
  assert.deepEqual(sent.filter((c) => c.op === "profilesset").map((c) => c.body).at(-1), { profiles: [] });
  assert.deepEqual((await api("profiles", undefined, token)).result.profiles, []);
});

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
