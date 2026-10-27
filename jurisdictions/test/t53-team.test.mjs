/* jurisdictions, T53 (T53-7, T53-10, T53-13; N1257, DEC-404, DEC-458 A2; K5451, K5452, K5468, K5543): the team's one placeless layer
 * (R115-R117), a stated fiscal year (R123, R124, R134, R135) and R139 (no kinds supplied). Layers made here, values made up for
 * tests; the shipped layers and the full test forest are T53-6's. */
import test from "node:test";
import assert from "node:assert/strict";
import { validate, combine, TEAM_LAYER_SECTIONS } from "../index.mjs";

const codes = (r) => (r.errors || []).map((e) => e.code);
const hasCode = (r, code, path) => (r.errors || []).some((e) => e.code === code && (path === undefined || e.path === path));
const SHA = "a".repeat(64);
const SHA2 = "b".repeat(64);

const layer = (id, level, place, within, extra = {}) => ({ id, name: place, covers: [place], test: true,
  layer: { level, place, ...(within ? { within } : {}), origin: "civicsmith" }, ...extra });
const fy = (body, start = "07-01", label = "FY{start}-{end2}") => ({ body, start, named_by: "start", label });
const FED = layer("t-fed", "federal", "Testland", null);
const STATE = layer("t-state", "state", "Stateia", "t-fed");
const COUNTY = layer("t-county", "county", "Aville County", "t-state");
const CITY_B = layer("t-city-b", "city", "Bville", "t-county", { counterparties: [{ role: "Clerk", body: "Bville", level: "city", elected: false, basis: "TEST" }] });
const CITY_C = layer("t-city-c", "city", "Cville", "t-county");
const team = (extra = {}) => ({ id: "team", name: "The team", covers: ["The team"], test: true, layer: { origin: "team" }, ...extra });
const gov = (level, place) => ({ level, ...(place ? { place } : {}) });
const law = (g, name, extra = {}) => ({ government: g, level: g.level, name, citation: `${name} § 1`, status: "researched", ...extra, basis: `team:${SHA}` });
const rule = (g, name, amount, extra = {}) => ({ government: g, rule: name, applies_to: "claim", units: "days", amount, count: "calendar", starts: "received",
  citation: "§ 4", status: "researched", basis: `team:${SHA}`, ...extra });

test("R115 the team layer: placeless, id team, entries about any set of governments; a second layer, a level or a place, or a state entry is refused", () => {
  const ok = team({ records_laws: [law(gov("county", "Aville County"), "County Act"), law(gov("city", "Bville"), "City Act")], deadlines: [rule(gov("city", "Cville"), "answer", 5)] });
  assert.deepEqual(validate(ok).errors, [], "entries about two counties and a city, one layer");
  assert.ok(combine([FED, STATE, COUNTY, ok]).ok);
  const second = combine([FED, ok, { ...structuredClone(ok), name: "another team layer" }]);
  assert.ok(codes(second).includes("LAYER_TEAM_TWICE"));
  assert.ok(hasCode(validate({ ...structuredClone(ok), layer: { origin: "team", level: "city" } }), "LAYER_INVALID", "layer.level"));
  assert.ok(hasCode(validate({ ...structuredClone(ok), layer: { origin: "team", place: "Bville" } }), "LAYER_INVALID", "layer.place"));
  assert.ok(hasCode(validate(team({ records_laws: [law(gov("state", "Stateia"), "State Act")] })), "LAYER_INVALID", "records_laws[0].government.level"));
  assert.ok(hasCode(validate(team({ records_laws: [{ ...law(gov("city", "Bville"), "City Act"), basis: undefined }] })), "BASIS_MISSING", "records_laws[0].basis"), "an entry with no source is not written");
  assert.ok(hasCode(validate(team({ records_laws: [{ ...law(gov("city", "Bville"), "City Act"), basis: "M-12" }] })), "BASIS_INVALID", "records_laws[0].basis"), "the basis is the capture it was read from");
  assert.ok(hasCode(validate(team({ records_laws: [{ ...law(gov("city", "Bville"), "City Act"), government: undefined }] })), "LAYER_INVALID", "records_laws[0].government"));
  /* R100 on the team layer: judged against the entry's government level */
  assert.ok(hasCode(validate(team({ records_laws: [{ ...law(gov("county", "Aville County"), "County Act"), level: "city" }] })), "LAYER_LEVEL_MISMATCH", "records_laws[0].level"),
    "a city law with government.level county");
});

test("R116 what a team may write: TEAM_LAYER_SECTIONS, frozen; any other section is TEAM_SECTION_REFUSED", () => {
  assert.ok(Object.isFrozen(TEAM_LAYER_SECTIONS));
  assert.deepEqual([...TEAM_LAYER_SECTIONS], ["records_laws", "deadlines", "holidays", "counterparties", "action_kinds", "systems", "time_zone", "fiscal_year", "weekend"]);
  assert.ok(hasCode(validate(team({ vocabulary: { furniture: [{ pattern: { re: "x" }, basis: `team:${SHA}` }] } })), "TEAM_SECTION_REFUSED", "vocabulary"));
  const zone = team({ time_zone: { value: "America/Los_Angeles", status: "researched", basis: `team:${SHA}` },
    weekend: { days: ["sat", "sun"], citation: "§ 5", status: "researched", basis: `team:${SHA}` } });
  assert.deepEqual(validate(zone).errors, [], "a team's zone and weekend are its own, about no one government");
});

test("R117 a team entry never replaces a shipped one: equal is kept, different is R102's conflict naming origin; a key no shipped layer gives is kept", () => {
  const shipped = { ...structuredClone(CITY_B), deadlines: [{ rule: "answer", applies_to: "claim", units: "days", amount: 3, count: "calendar", starts: "received", citation: "§ 4", status: "researched", basis: "TEST" }] };
  const mine = team({ deadlines: [rule(gov("city", "Bville"), "answer", 5), rule(gov("city", "Bville"), "extra", 7)] });
  const r = combine([FED, STATE, COUNTY, shipped, mine]);
  assert.ok(r.ok, JSON.stringify(r.errors));
  const c = r.conflicts.find((x) => x.at === "deadlines[answer/claim].amount");
  assert.ok(c, JSON.stringify(r.conflicts.map((x) => x.at)));
  assert.deepEqual(c.values.map((v) => v.layer.origin).sort(), ["civicsmith", "team"]);
  assert.equal(r.view.deadlines.find((d) => d.rule === "answer").amount, undefined, "withheld");
  assert.equal(r.view.deadlines.find((d) => d.rule === "extra").amount, 7, "control: a key no shipped layer gives is kept");
  const same = combine([FED, STATE, COUNTY, shipped, team({ deadlines: [rule(gov("city", "Bville"), "answer", 3)] })]);
  assert.deepEqual(same.conflicts, []);
  assert.equal(same.view.deadlines.find((d) => d.rule === "answer").amount, 3);
});

test("R115 entries about two governments never conflict; a government no layer stands for is read alone", () => {
  const mine = team({ deadlines: [rule(gov("city", "Bville"), "answer", 5), rule(gov("city", "Cville"), "answer", 9), rule(gov("city", "Dville"), "answer", 11)] });
  const r = combine([FED, STATE, COUNTY, CITY_B, CITY_C, mine]);
  assert.ok(r.ok); assert.deepEqual(r.conflicts, []);
  assert.deepEqual(r.view.deadlines.map((d) => d.amount).sort((a, b) => a - b), [5, 9, 11]);
  assert.ok(r.view.deadlines.every((d) => d.profile === "team" && d.government === undefined));
  assert.deepEqual(r.view.layers.map((l) => l.id), ["t-fed", "t-state", "t-county", "t-city-b", "t-city-c", "team"], "the team layer is listed last");
  assert.equal(r.view.layers.at(-1).origin, "team"); assert.equal(r.view.layers.at(-1).level, undefined);
});

test("R134 the team layer may hold one stated fiscal year per government, with no basis and no status", () => {
  const stated = (e) => team({ fiscal_year: [e] });
  const e = (g, body = "Bville") => ({ government: g, ...fy(body), how: "read the budget page at its address" });
  assert.deepEqual(validate(stated(e(gov("city", "Bville")))).errors, [], "no basis and no status");
  assert.deepEqual(validate(stated(e(gov("state", "Stateia"), "Stateia"))).errors, []);
  assert.deepEqual(validate(stated(e(gov("federal"), "The Federal Government"))).errors, []);
  assert.ok(hasCode(validate(stated(e({ level: "federal", place: "X" }, "Fed"))), "LAYER_INVALID", "fiscal_year[0].government.place"));
  assert.ok(hasCode(validate(stated(e({ level: "district", place: "X" }))), "LAYER_INVALID", "fiscal_year[0].government.level"));
  for (const body of ["*", "", "  "]) assert.ok(hasCode(validate(stated(e(gov("city", "Bville"), body))), "FISCAL_YEAR_INVALID", "fiscal_year[0].body"), JSON.stringify(body));
  assert.ok(hasCode(validate(team({ fiscal_year: [e(gov("city", "Bville")), e(gov("city", "Bville"), "Bville Again")] })), "FISCAL_YEAR_INVALID", "fiscal_year[1].government"), "a second entry for one government");
  assert.ok(hasCode(validate(stated({ ...e(gov("city", "Bville")), how: "x".repeat(501) })), "VALUE_INVALID", "fiscal_year[0].how"));
  /* it combines under a layer and the view gives it with origin team; entries for two governments give no conflict */
  const r = combine([FED, STATE, COUNTY, CITY_B, CITY_C, team({ fiscal_year: [e(gov("city", "Bville")), e(gov("city", "Cville"), "Cville")] })]);
  assert.ok(r.ok); assert.deepEqual(r.conflicts, []);
  assert.deepEqual(r.view.fiscal_year.map((x) => [x.body, x.profile]).sort(), [["Bville", "team"], ["Cville", "team"]]);
  /* control: a team layer with no fiscal_year validates as before */
  assert.deepEqual(validate(team({})).errors, []);
});

test("R135 the records' year governs: a team's different entry is set aside, not a conflict; an equal one is kept; other keys stay under R117", () => {
  const records = { ...structuredClone(CITY_B), fiscal_year: [{ ...fy("*", "10-01"), status: "researched", basis: "TEST" }] };
  const mine = (start) => team({ fiscal_year: [{ government: gov("city", "Bville"), ...fy("Bville", start) }] });
  const r = combine([FED, STATE, COUNTY, { ...structuredClone(CITY_B), fiscal_year: [{ ...fy("Bville", "10-01"), status: "researched", basis: "TEST" }] }, mine("07-01")]);
  assert.ok(r.ok); assert.deepEqual(r.conflicts.filter((c) => c.at.startsWith("fiscal_year")), [], "not a conflict");
  assert.deepEqual(r.view.fiscal_year.map((x) => [x.body, x.start, x.profile]), [["Bville", "10-01", "t-city-b"]], "the layer's year");
  assert.deepEqual(r.view.set_aside, [{ section: "fiscal_year", origin: "team", entry: { government: gov("city", "Bville"), ...fy("Bville", "07-01") }, by: "t-city-b", at: "fiscal_year[Bville]" }]);
  /* the layer's `*` year is the government's own */
  const star = combine([FED, STATE, COUNTY, records, mine("07-01")]);
  assert.equal(star.view.set_aside.length, 1);
  /* control: an equal year sets nothing aside */
  const eq = combine([FED, STATE, COUNTY, records, mine("10-01")]);
  assert.equal(eq.view.set_aside, undefined);
  assert.deepEqual(eq.conflicts, []);
});

test("R139 a profile gives proceeding kinds and the module never fills them in", () => {
  const none = combine([]);
  assert.ok(none.ok); assert.equal(none.view.proceeding_kinds, undefined);
  const bare = combine([FED, STATE]);
  assert.equal(bare.view.proceeding_kinds, undefined);
  const kinds = [{ kind: "civil", label: "Civil case", forum_kind: "court", basis: "TEST" }];
  const given = combine([FED, { ...structuredClone(STATE), proceeding_kinds: kinds }]);
  assert.deepEqual(given.view.proceeding_kinds.map((k) => k.kind), ["civil"]);
});
