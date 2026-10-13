/* action-plans T47 (T47-43): R19's date checks judged on the plan's local day, undetermined with no zone held (R48; N964;
   K1444 (iii)); C-124.63's words read by key from DEC-199's sentence, for both of R42's arms (R49; N963, N992); a closed
   plan's read names its closing instant `closed.at` (R50; N966). Each has its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { seeded, opened, option, choose, V, by, ms, OFFICE, FIRST } from "./fixture.mjs";
import { ACTION_PLAN_CHECKS, PLAN_WORDS } from "../../../src/action-plans/index.mjs";

const code = (r) => r.code ?? r.reason;
const WORDS = Object.fromEntries(
  JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8")).words
    .filter((w) => w && typeof w.key === "string").map((w) => [w.key, w.en]));
const read = (w, nowMs) => w.ap.planRead({ id: w.PL, viewer: V("bob"), nowMs });
const of = (r, check) => r.checks.filter((c) => c.check === check);
const TOKYO = () => ({ time_zone: { value: "Asia/Tokyo", status: "researched", basis: "TEST" } });

test("R48: date_past compares a pending option's regulated date with the plan's local day of the read's instant, never the UTC day, in a zone west and east of UTC; with no zone held it is answered undetermined with its reason", () => {
  /* the test profile's zone, America/Halifax: on 15 October 2026, local midnight is 03:00 UTC */
  const w = seeded();
  opened(w);
  const o = option(w, { dates: [{ date: "2026-10-14", basis: "the order" }] });
  const west = read(w, ms("2026-10-15T02:30:00Z"));
  assert.deepEqual(of(west, "date_past"), [], "the UTC day is the 15th, the plan's local day still the 14th: a deadline is met by anything on its day");
  const after = of(read(w, ms("2026-10-15T03:00:00Z")), "date_past");
  assert.deepEqual(after.map((c) => [c.option, c.date, c.state ?? null]), [[o, "2026-10-14", null]], "control: on the local day after, it is past");
  assert.match(after[0].says, /has passed \(the order\)/);
  /* the reverse: a zone east of UTC, where the local day has begun before the UTC day */
  w.actions.place = TOKYO;
  assert.equal(of(read(w, ms("2026-10-14T15:00:00Z")), "date_past").length, 1, "the local day is the 15th, the UTC day still the 14th");
  assert.deepEqual(of(read(w, ms("2026-10-14T14:59:59Z")), "date_past"), [], "control: a second before local midnight");
  /* no zone held: undetermined with its reason, never computed on the UTC day and never left out */
  w.actions.place = () => null;
  for (const at of ["2026-10-01T12:00:00Z", "2027-06-01T12:00:00Z"]) {
    const none = of(read(w, ms(at)), "date_past");
    assert.equal(none.length, 1, at);
    assert.deepEqual([none[0].option, none[0].date, none[0].state], [o, "2026-10-14", "undetermined"], at);
    assert.match(none[0].says, /no time zone is held/);
    assert.doesNotMatch(none[0].says, /has passed \(/);
  }
  /* control: every other check is unchanged, and an option not pending (declined) is asked nothing either way */
  assert.equal(w.ap.optionDispose({ plan: w.PL, options: [o], disposition: "declined", reason: "Too late", ...by("bob") }).ok, true);
  assert.deepEqual(read(w, ms("2027-06-01T12:00:00Z")).checks, []);
  const w2 = seeded({ profiles: null });
  opened(w2);
  option(w2, { dates: [{ date: "2026-09-01", basis: "the order" }] });
  assert.deepEqual(of(read(w2, ms("2027-06-01T12:00:00Z")), "date_past").map((c) => c.state), ["undetermined"], "no profile, no zone");
});

test("R48: date_before_phase compares a regulated date with the plan's local day on which its phase can start, never the UTC day; with no zone held it is answered undetermined with its reason", () => {
  const w = seeded();
  opened(w);
  const on = option(w, { dates: [{ date: "2026-10-14", basis: "the statute" }] });
  const before = option(w, { dates: [{ date: "2026-10-13", basis: "the statute" }] });
  choose(w, [on, before]);
  /* the scenario is set at an instant whose UTC day is the 15th and whose Halifax day is the 14th: its plan_start phase can
     start then */
  w.clock.now = "2026-10-15T02:00:00Z";
  const phases = [{ id: "a", name: "A", options: [on, before], starts: "plan_start", checkpoint: { after_days: 3 },
                    branches: { met: "b", not_met: "b" } },
                  { id: "b", name: "B", options: [], starts: { after: "a" } }];
  assert.equal(w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "S", phases, ...by("bob") }).ok, true);
  const at = ms("2026-10-15T02:30:00Z");
  const found = of(read(w, at), "date_before_phase");
  assert.deepEqual(found.map((c) => [c.option, c.date, c.state ?? null]), [[before, "2026-10-13", null]],
    "the 14th is the phase's local start day, so only the 13th falls before it");
  assert.match(found[0].says, /falls before phase a can start \(2026-10-14\)/);
  /* control: in a zone east of UTC the same instant's local day is the 15th, and both fall before it */
  w.actions.place = TOKYO;
  assert.deepEqual(of(read(w, at), "date_before_phase").map((c) => c.option).sort(), [on, before].sort());
  /* no zone held: each is answered undetermined with its reason */
  w.actions.place = () => null;
  const none = of(read(w, at), "date_before_phase");
  assert.deepEqual(none.map((c) => [c.option, c.state]).sort(), [[on, "undetermined"], [before, "undetermined"]].sort());
  for (const c of none) { assert.equal(c.phase, "a"); assert.match(c.says, /no time zone is held/); }
  /* control: a scenario set aside is not checked (R39), zone or none */
  assert.equal(w.ap.scenarioSetAside({ plan: w.PL, scenario: 1, reason: "Not now", ...by("bob") }).ok, true);
  assert.deepEqual(of(read(w, at), "date_before_phase"), []);
});

test("R49: C-124.63 DOCUMENT_FIRST_NO_REASON is the one code for an absent and a malformed why_first, its translation words.json's refusal.DOCUMENT_FIRST_NO_REASON read by key (DEC-199's sentence); code, number and where unmoved", () => {
  const key = "refusal.DOCUMENT_FIRST_NO_REASON";
  assert.equal(typeof WORDS[key], "string", "words.json holds it");
  assert.equal(PLAN_WORDS[key], WORDS[key], "held by key, verbatim");
  const row = ACTION_PLAN_CHECKS.DOCUMENT_FIRST_NO_REASON;
  assert.deepEqual([row.check, row.where, row.translation], ["C-124.63", "src/action-plans/index.mjs optionStart > is-document-first", WORDS[key]]);
  /* answered so at the interface, for each arm */
  const w = seeded();
  opened(w);
  const out = option(w, { addressee: OFFICE });
  choose(w, [out]);
  const start = (extra = {}) => w.ap.optionStart({ plan: w.PL, option: out, kind: "other", ...by("bob"), ...extra });
  const arms = { absent: start(), empty: start({ why_first: "" }), over: start({ why_first: "x".repeat(501) }),
                 quote: start({ why_first: 'a "q"' }), backslash: start({ why_first: "a\\b" }), linebreak: start({ why_first: "a\nb" }) };
  for (const [arm, r] of Object.entries(arms))
    assert.deepEqual([code(r), r.check, r.translation], ["DOCUMENT_FIRST_NO_REASON", "C-124.63", WORDS[key]], arm);
  const preview = w.ap.optionStartPreview({ plan: w.PL, option: out, kind: "other", ...by("bob") });
  assert.deepEqual([code(preview.refusal), preview.refusal.translation], ["DOCUMENT_FIRST_NO_REASON", WORDS[key]], "the preview answers the same");
  /* control: a well-formed reason lands, and no new code is minted for either arm */
  assert.equal(start(FIRST).ok, true);
  assert.equal(Object.values(ACTION_PLAN_CHECKS).filter((r) => r.check === "C-124.63").length, 1);
  assert.equal(Object.keys(ACTION_PLAN_CHECKS).filter((c) => /DOCUMENT_FIRST|WHY_FIRST/.test(c)).length, 1);
});

test("R50: planRead answers a closed plan's closed: {at, by, reason, note, summary}, at the instant its close was recorded; an open or paused plan answers no closed key", () => {
  const w = seeded();
  opened(w);
  assert.equal("closed" in read(w), false, "control: an open plan");
  assert.equal(w.ap.planPause({ id: w.PL, reason: "Waiting", ...by("bob") }).ok, true);
  assert.equal("closed" in read(w), false, "control: a paused plan");
  w.clock.now = "2026-10-20T17:45:12Z";
  const c = w.ap.planClose({ id: w.PL, reason: "Done here", note: "Ask sooner", ...by("bob") });
  assert.equal(c.ok, true, JSON.stringify(c));
  w.clock.now = "2026-11-02T09:00:00Z";
  const r = read(w);
  assert.deepEqual(Object.keys(r.closed).sort(), ["at", "by", "note", "reason", "summary"]);
  assert.equal(r.closed.at, "2026-10-20T17:45:12Z", "the instant the close was recorded, not the read's");
  assert.equal(r.closed.at, c.at);
  assert.equal(r.closed.at, w.rows(`SELECT at FROM plan_history WHERE plan_id=? AND kind='close'`, w.PL)[0].at);
  assert.deepEqual([r.closed.by, r.closed.reason, r.closed.note], [V("bob"), "Done here", "Ask sooner"]);
  assert.equal(r.closed.summary.state, "undetermined", "no reader registered");
  assert.equal(typeof r.closed.summary.says, "string");
  /* no other top-level field of the read names the closing instant */
  for (const k of Object.keys(r)) assert.equal(/clos/.test(k) && k !== "closed", false, k);
  /* control: a later read keeps the same instant */
  w.clock.now = "2027-01-01T00:00:00Z";
  assert.equal(read(w).closed.at, "2026-10-20T17:45:12Z");
});
