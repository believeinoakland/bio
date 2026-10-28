/* ai-catalogue: the reads at the interface (R28–R32, R38, R45, R54, R55; build/requirements/ai-catalogue.md). A copy
 * seeded with a made-up provider's payload; every answer read through the module's own exports. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { OPEN, met, gateOf, entry, plan, payload, publish, adv, advisory, indexOf, pull, world, seeded, AT, PARTS }
  from "./fixture.mjs";

/* ===================================================================== R28 */

test("R28 a held id answers its entry whole with state, recipient and flags; a raw model string of an unlisted AI answers null", async () => {
  const { cat } = await seeded();
  const e = cat.entryOf("fake-one", { at: AT });
  assert.equal(e.model, "fake-model-fake-one");
  assert.deepEqual([e.state, e.recipient, e.needs_newer_release, e.omitted_since, e.review_overdue],
    ["listed", { provider: "fakeco", host: "fakeco" }, false, null, false]);
  assert.ok(Object.isFrozen(e) && Object.isFrozen(e.checks));
  assert.equal(cat.entryOf("some-host/raw-model-name"), null);
  assert.equal(cat.entryOf(undefined), null);
  /* review_overdue: confirmed_at plus the policy's review_period_days (90) before at; shown, restricting nothing */
  const late = "2027-01-15T00:00:00Z";
  assert.equal(cat.entryOf("fake-one", { at: late }).review_overdue, true);
  assert.equal(cat.entriesFor({ part: "ask", at: late }).entries.length, 1);
});
test("R28 control: a retired id still answers", async () => {
  const { cat } = await seeded(payload({ entries: [entry("fake-one", { lifecycle: "retired", characterization: undefined })] }));
  assert.equal(cat.entryOf("fake-one", { at: AT }).state, "retired");
});

/* ===================================================================== R29 */

const twoProviders = () => payload({ providers: [{ id: "fakeco", name: "F", kind: "direct" }, { id: "otherco", name: "O", kind: "direct" }],
  plans: [plan(), plan("otherco-api", { provider: "otherco" })],
  entries: [entry("fake-one"), entry("other-one", { provider: "otherco", host: "otherco", plan_ids: ["otherco-api"] })] });
test("R29 two providers answer two provider lists, each plan with its row", async () => {
  const { cat } = await seeded(twoProviders());
  const all = cat.plansOf({ at: AT });
  assert.deepEqual(all.map((g) => [g.provider, g.plans.map((p) => p.plan_id)]), [["fakeco", ["fakeco-api"]], ["otherco", ["otherco-api"]]]);
  const row = all[0].plans[0];
  for (const k of ["kind", "scope", "levels", "constraints", "terms_pending", "terms_version", "warning_version", "means_allowed",
    "money", "token_bounds", "free_tier_trains", "guidance_id", "state", "offered", "reasons"]) assert.ok(Object.hasOwn(row, k), k);
  assert.deepEqual([row.offered, row.reasons, row.money], [true, [], "priced"]);
  assert.deepEqual(cat.plansOf({ entry_id: "other-one", at: AT }).map((g) => g.provider), ["otherco"]);
  assert.deepEqual(cat.plansOf({ plan_id: "fakeco-api", at: AT })[0].plans.length, 1);
});
test("R29 control: an unknown provider answers an empty list; a plan's lapse and missing means are named", async () => {
  const { cat } = await seeded(twoProviders());
  assert.deepEqual(cat.plansOf({ provider: "nobody", at: AT }), []);
  assert.deepEqual(cat.plansOf({ entry_id: "nobody", at: AT }), []);
  const { cat: c2 } = await seeded(payload({ plans: [plan("fakeco-api", { means_allowed: OPEN, lifecycle: "lapsed" })] }));
  assert.deepEqual(c2.plansOf({ at: AT })[0].plans[0].reasons, ["PLAN_LAPSED", "PLAN_NO_MEANS"]);
  const { cat: c3 } = await seeded(payload({ plans: [plan("fakeco-api", { lifecycle: "retired" })] }));
  assert.deepEqual(c3.plansOf({ at: AT })[0].plans[0].reasons, ["PLAN_RETIRED"]);
});

/* ===================================================================== R30, R31 */

/* Eight entries: one passing, and one failing each of R30's conditions. The two that fail through what the copy holds
   (needing a release, no plan offered) are set by registration and by plan. */
const EIGHT = () => {
  const base = (id, over = {}) => entry(id, { plan_ids: ["fakeco-api"], ...over });
  return payload({
    profiles: [{ ...payload().profiles[0] }, { ...payload().profiles[0], id: "fakeco-new", version: 2 }],
    plans: [plan(), plan("fakeco-noguide", { guidance_id: "missing-guide" })],
    guidance: [payload().guidance[0]],
    entries: [
      base("e1-pass"),
      base("e2-lapsed", { lifecycle: "lapsed" }),
      base("e3-retired", { lifecycle: "retired", characterization: undefined }),
      base("e4-release", { profile: { id: "fakeco-new", min_version: 2 } }),
      base("e5-unsuitable", { gate: { ask: gateOf("not_suitable") } }),
      base("e6-unrated", { gate: {} }),
      base("e7-check", { checks: { ...entry("x").checks, P2: met("not_met") } }),
      base("e8-noplan", { plan_ids: ["fakeco-noguide"] }),
    ],
  });
};
const CONDITION = { "e2-lapsed": "ENTRY_LAPSED", "e3-retired": "ENTRY_RETIRED", "e4-release": "NEEDS_NEWER_RELEASE",
  "e5-unsuitable": "PART_NOT_PASSED", "e6-unrated": "PART_NOT_RATED", "e7-check": "CHECK_NOT_MET", "e8-noplan": "NO_PLAN_OFFERED" };
test("R30 a fixture of eight entries, one failing each condition, returns exactly the passing one", async () => {
  const { cat } = await seeded(EIGHT());
  const r = cat.entriesFor({ part: "ask", checksInForce: ["P2"], at: AT });
  assert.deepEqual(r.entries.map((e) => e.entry_id), ["e1-pass"]);
  assert.deepEqual(Object.keys(r.entries[0]).sort(), ["checks", "display_name", "entry_id", "host", "part", "plans", "provider",
    "recipient", "state", "watch"]);
  assert.deepEqual(r.entries[0].checks, { P2: "met" });
  for (const [id, code] of Object.entries(CONDITION))
    assert.deepEqual(cat.whyNotOffered({ entry_id: id, part: "ask", checksInForce: ["P2"], at: AT }).reasons.map((x) => x.code), [code], id);
});
test("R30 control: the failing conditions removed one by one return each entry", async () => {
  const lift = {
    "e2-lapsed": (d) => { d.entries[1].lifecycle = "listed"; },
    "e3-retired": (d) => { d.entries[2] = entry("e3-retired"); },
    "e4-release": () => {},
    "e5-unsuitable": (d) => { d.entries[4].gate.ask = gateOf(); },
    "e6-unrated": (d) => { d.entries[5].gate.ask = gateOf(); },
    "e7-check": (d) => { d.entries[6].checks.P2 = met(); },
    "e8-noplan": (d) => { d.guidance.push({ ...d.guidance[0], guidance_id: "missing-guide", plan_id: "fakeco-noguide" }); },
  };
  for (const [id, fix] of Object.entries(lift)) {
    const d = EIGHT();
    fix(d);
    const { cat } = await seeded(d);
    if (id === "e4-release") cat.registerAdapterTypes([{ type: "generic_chat", profiles: { "fakeco-new": 2 } }]);
    const ids = cat.entriesFor({ part: "ask", checksInForce: ["P2"], at: AT }).entries.map((e) => e.entry_id);
    assert.deepEqual(ids.sort(), ["e1-pass", id].sort(), id);
  }
});
test("R30 refusals: an unknown part is PART_UNKNOWN, an unknown check CHECK_UNKNOWN, no catalogue CATALOGUE_UNAVAILABLE", async () => {
  const { cat } = await seeded();
  assert.equal(cat.entriesFor({ part: "sing", at: AT }).code, "PART_UNKNOWN");
  assert.equal(cat.entriesFor({ part: "ask", checksInForce: ["P0"], at: AT }).code, "CHECK_UNKNOWN");
  const { cat: empty } = await world();
  const r = empty.entriesFor({ part: "ask", at: AT });
  assert.deepEqual([r.ok, r.code], [false, "CATALOGUE_UNAVAILABLE"]);
});
test("R31 for every fixture entry and part, offered is true exactly when entriesFor returns it", async () => {
  const { cat } = await seeded(EIGHT());
  for (const part of PARTS) for (const checks of [[], ["P2"], ["P1", "P7"]]) {
    const listed = new Set(cat.entriesFor({ part, checksInForce: checks, at: AT }).entries.map((e) => e.entry_id));
    for (const e of EIGHT().entries)
      assert.equal(cat.whyNotOffered({ entry_id: e.entry_id, part, checksInForce: checks, at: AT }).offered, listed.has(e.entry_id),
        `${e.entry_id} ${part} ${checks}`);
  }
});
test("R31 control: an entry failing two conditions answers both codes, in the fixed order; OPEN is CHECK_OPEN", async () => {
  const { cat } = await seeded(payload({ entries: [entry("fake-one", { lifecycle: "lapsed", gate: {},
    checks: { ...entry("x").checks, P1: OPEN, P3: met("not_met") } })] }));
  assert.deepEqual(cat.whyNotOffered({ entry_id: "fake-one", part: "ask", checksInForce: ["P3", "P1"], at: AT }).reasons,
    [{ code: "ENTRY_LAPSED" }, { code: "PART_NOT_RATED" }, { code: "CHECK_OPEN", check: "P1" }, { code: "CHECK_NOT_MET", check: "P3" }]);
  assert.deepEqual(cat.whyNotOffered({ entry_id: "nobody", part: "ask", at: AT }).reasons, [{ code: "ENTRY_UNKNOWN" }]);
  const { cat: empty } = await world();
  assert.deepEqual(empty.whyNotOffered({ entry_id: "x", part: "ask" }).reasons.map((r) => r.code), ["ENTRY_UNKNOWN", "CATALOGUE_UNAVAILABLE"]);
});

/* ===================================================================== R32 */

test("R32 each state reached by its cause", async () => {
  const { cat: none } = await world();
  assert.equal(none.catalogueState({ at: AT }).state, "unavailable");
  const { cat } = await seeded(payload());
  await cat.receive({ kind: "index", status: 200, at: AT, trigger: "schedule", body: indexOf(null) });
  assert.equal(cat.catalogueState({ at: AT }).state, "current");
  assert.equal(cat.catalogueState({ at: "2026-10-30T00:00:00Z" }).state, "stale");
  await pull(cat, await publish(payload({ seq: 2, schema_version: 99, entries: [] })));
  const s = cat.catalogueState({ at: AT });
  assert.deepEqual([s.state, s.word], ["needs_newer_release", "ai.catalogue.state.needs_newer_release"]);
});
test("R32 control: a seed-only copy that checked today is current with source seed", async () => {
  const { cat } = await seeded(payload());
  await cat.receive({ kind: "index", status: 200, at: AT, trigger: "manual", body: indexOf(null, [
    await advisory(adv(2, { entry_id: "fake-one" }, "watch", { effective_at: "2026-11-01T00:00:00Z" }))]) });
  const s = cat.catalogueState({ at: AT });
  assert.deepEqual([s.state, s.source, s.seq, s.schema_version, s.issued_at, s.last_good_seq, s.age_days, s.rolled_back,
    s.held_back_seq, s.advisories_seq, s.upcoming.length, s.entries],
  ["current", "seed", 1, 1, "2026-10-01T00:00:00Z", 1, 1, false, null, 2, 1, { total: 1, needing_release: 0 }]);
  assert.deepEqual(s.last_check, { at: AT, trigger: "manual", outcome: "found" });
});

/* ===================================================================== R38 */

test("R38 an entry of an unregistered type is returned by entryOf with the flag and is absent from entriesFor", async () => {
  const { cat } = await seeded(payload(), { adapters: false });
  assert.equal(cat.entryOf("fake-one", { at: AT }).needs_newer_release, true);
  assert.deepEqual(cat.entriesFor({ part: "ask", at: AT }).entries, []);
  assert.deepEqual(cat.catalogueState({ at: AT }).entries, { total: 1, needing_release: 1 });
  /* the type registered, but not the entry's profile */
  cat.registerAdapterTypes([{ type: "generic_chat", profiles: { other: 1 } }]);
  assert.equal(cat.entryOf("fake-one", { at: AT }).needs_newer_release, true);
});
test("R38 control: registering the type offers it", async () => {
  const { cat } = await seeded(payload(), { adapters: false });
  cat.registerAdapterTypes([{ type: "generic_chat", profiles: { "fakeco-profile": 1 } }]);
  assert.deepEqual(cat.entriesFor({ part: "ask", at: AT }).entries.map((e) => e.entry_id), ["fake-one"]);
  assert.throws(() => cat.registerAdapterTypes([{ type: "Bad Type", profiles: {} }]), TypeError);
});

/* ===================================================================== R45, R54, R55 */

const lib = (row_id, subject_id, tested_at, over = {}) => ({ row_id, subject_id, suiteVersions: { bank: "b1" },
  parts: { ask: { verdict: "passes", limits: [] } }, speed: OPEN, task_cost: OPEN, tested_by: "team", tested_at,
  grade: "REPORTED", repeated_by_civicsmith: false, ...over });
const TESTED = { subject_id: "fake-unlisted", display_name: "Fake Unlisted", provider_name: "Fake Co", host_name: "Fake Host",
  model: "fake-unlisted-model", version: "1", developer: { name: "Fake Co", jurisdiction: "ZZ" } };
const libraryPayload = () => payload({ tested: [TESTED], library: [
  lib("r-five", "fake-one", "2026-05-03"),
  lib("r-seven", "fake-one", "2026-03-01"),
  lib("r-draft", "fake-one", "2026-09-01", { parts: { draft: { verdict: "not_suitable", limits: [] } } }),
  lib("r-own", "fake-one", "2026-09-10", { tested_by: "civicsmith", grade: "REPRODUCED" }),
  lib("r-unlisted", "fake-unlisted", "2026-09-15"),
] });
test("R45 rows filtered by part; a row tested seven months before at is not returned", async () => {
  const { cat } = await seeded(libraryPayload());
  const ask = cat.libraryRows({ subject_id: "fake-one", part: "ask", at: AT });
  assert.deepEqual(ask.map((r) => r.row_id), ["r-five", "r-own"]);
  assert.deepEqual(ask.map((r) => [r.on_list, r.confirmed]), [["listed", false], ["listed", true]]);
  assert.equal(ask[0].age_days, 152);
  assert.deepEqual(cat.libraryRows({ part: "draft", at: AT }).map((r) => r.row_id), ["r-draft"]);
});
test("R45 control: one tested five months before is returned, and an unknown subject answers an empty list", async () => {
  const { cat } = await seeded(libraryPayload());
  assert.ok(cat.libraryRows({ at: AT }).some((r) => r.row_id === "r-five"));
  assert.ok(!cat.libraryRows({ at: AT }).some((r) => r.row_id === "r-seven"));
  assert.deepEqual(cat.libraryRows({ subject_id: "nobody", at: AT }), []);
  /* the window moves with at: five months later r-five has passed six months */
  assert.ok(!cat.libraryRows({ at: "2026-11-04T00:00:00Z" }).some((r) => r.row_id === "r-five"));
});
test("R54 a tested AI with rows answers not_listed and is absent from every read that offers", async () => {
  const { cat } = await seeded(libraryPayload());
  assert.deepEqual(cat.libraryRows({ subject_id: "fake-unlisted", at: AT }).map((r) => r.on_list), ["not_listed"]);
  assert.equal(cat.entryOf("fake-unlisted"), null);
  for (const part of PARTS) assert.ok(!cat.entriesFor({ part, at: AT }).entries.some((e) => e.entry_id === "fake-unlisted"));
  assert.deepEqual(cat.whyNotOffered({ entry_id: "fake-unlisted", part: "ask", at: AT }).reasons, [{ code: "ENTRY_UNKNOWN" }]);
  assert.equal(cat.testedOf("fake-unlisted").model, "fake-unlisted-model");
  assert.equal(cat.testedOf("fake-one"), null);
});
test("R54 control: an AI listed later under the same id keeps its rows", async () => {
  const { cat } = await seeded(libraryPayload());
  const later = payload({ seq: 2, entries: [entry("fake-one"), entry("fake-unlisted")], library: libraryPayload().library });
  assert.equal((await pull(cat, await publish(later))).payload.outcome, "found");
  assert.deepEqual(cat.libraryRows({ subject_id: "fake-unlisted", at: AT }).map((r) => r.on_list), ["listed"]);
});
const comb = (over = {}) => ({ subject_id: "fake-one", part: "ask", as_of: "2026-09-30", window: { from: "2026-04-01", to: "2026-09-30" },
  results: { total: 1, reproduced: 0, reported: 1 }, left_out: 0, groups: {}, verdict: "passes", limits: [], speed: OPEN,
  task_cost: OPEN, suiteVersions: { bank: "b1" }, confirmed: false, ...over });
test("R55 a record joining one REPORTED result answers confirmed false, with its age", async () => {
  const { cat } = await seeded(payload({ combined: [comb()] }));
  const [r] = cat.combinedResults({ subject_id: "fake-one", part: "ask", at: AT });
  assert.deepEqual([r.confirmed, r.age_days], [false, 2]);
});
test("R55 control: one joining only REPRODUCED results answers true", async () => {
  const { cat } = await seeded(payload({ combined: [comb({ results: { total: 2, reproduced: 2, reported: 0 }, confirmed: true })] }));
  assert.equal(cat.combinedResults({ at: AT })[0].confirmed, true);
  assert.deepEqual(cat.combinedResults({ part: "draft", at: AT }), []);
});
