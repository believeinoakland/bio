/* jurisdictions, T53 (T53-4, T53-5; N1257, DEC-404; K5452, K5458): the four defects (R103-R105, R107) and the layer model
 * (R99-R102, R106, R108, R121). Tested at the module's interface, over small layers made here: values made up for tests,
 * every basis TEST, no place named. The shipped layers and the test forest are T53-6's (R109-R114, R118). */
import test from "node:test";
import assert from "node:assert/strict";
import { validate, combine, nameResolve, governingZone, COUNTERPARTY_LEVELS, LAW_LEVELS, SECTIONS } from "../index.mjs";

const codes = (r) => (r.errors || []).map((e) => e.code);
const hasCode = (r, code, path) => (r.errors || []).some((e) => e.code === code && (path === undefined || e.path === path));

/** A layer of the forest: `within` is the id of the layer above it. */
const layer = (id, level, place, within, extra = {}) => ({
  id, name: place, covers: [place], test: true,
  layer: { level, place, ...(within ? { within } : {}), origin: "civicsmith" }, ...extra,
});
const law = (level, name, extra = {}) => ({ level, name, citation: `${name} § 1`, basis: "TEST", ...extra });
const list = (name, year, days) => ({ year, list: name, citation: `${name} list`, days: days.map((date) => ({ date, name: "closed" })), status: "researched", basis: "TEST" });
const help = (law_, days, extra = {}) => ({ law: law_, days, extra_days: 5,
  extension_reasons: [{ reason: "reason", citation: "§ 2" }],
  citations: Object.fromEntries(["answer", "extend", "assist", "segregate", "refuse_in_writing", "electronic", "cost", "cost_electronic", "inspect_photograph", "purpose"].map((k) => [k, "§ 3"])),
  status: "researched", basis: "2026-01-01", ...extra });
const zone = (value) => ({ value, status: "researched", basis: "TEST" });

const FED = layer("t-fed", "federal", "Testland", null);
const STATE = layer("t-state", "state", "Stateia", "t-fed");
const COUNTY_A = layer("t-county-a", "county", "Aville County", "t-state");
const COUNTY_B = layer("t-county-b", "county", "Bville County", "t-state");
const CITY_A = layer("t-city-a", "city", "Aville", "t-county-a");
const CITY_B = layer("t-city-b", "city", "Bville", "t-county-b");

test("R99 a profile may be a layer: each level validates; a malformed layer is LAYER_INVALID naming the field", () => {
  for (const l of [FED, STATE, COUNTY_A, CITY_A]) assert.deepEqual(validate(l).errors, [], l.id);
  const bad = (fn, path) => { const p = structuredClone(CITY_A); fn(p); const r = validate(p); assert.ok(hasCode(r, "LAYER_INVALID", path), `${path}: ${JSON.stringify(r.errors)}`); };
  bad((p) => { p.layer.level = "region"; }, "layer.level");
  bad((p) => { p.layer.place = ""; }, "layer.place");
  bad((p) => { p.layer.origin = "volunteer"; }, "layer.origin");
  bad((p) => { delete p.layer.within; }, "layer.within");
  bad((p) => { p.layer.within = p.id; }, "layer.within");
  const f = structuredClone(FED); f.layer.within = "x";
  assert.ok(hasCode(validate(f), "LAYER_INVALID", "layer.within"), "a federal layer sits within none");
  /* control: a profile with no layer validates as before */
  assert.ok(SECTIONS.includes("layer") && SECTIONS.includes("coverage"));
});

test("R100 a layer holds only its own level; a district office sits in a city or a county; control: the same law in its own layer", () => {
  const lawIn = (l, level) => { const p = structuredClone(l); p.records_laws = [law(level, "Some Act")]; return validate(p); };
  assert.ok(hasCode(lawIn(CITY_A, "state"), "LAYER_LEVEL_MISMATCH", "records_laws[0].level"));
  assert.deepEqual(lawIn(STATE, "state").errors, []);
  const office = (l, level) => { const p = structuredClone(l); p.counterparties = [{ role: "Clerk", body: "Office", level, elected: false, basis: "TEST" }]; return validate(p); };
  assert.ok(hasCode(office(CITY_A, "state"), "LAYER_LEVEL_MISMATCH", "counterparties[0].level"));
  assert.deepEqual(office(CITY_A, "district").errors, []);
  assert.ok(hasCode(office(STATE, "district"), "LAYER_LEVEL_MISMATCH"), "no district office in a state layer");
  const src = structuredClone(CITY_A); src.standard_sources = [{ source: "S", kind: "statute", issuer: "I", level: "state", cite: { re: "S" }, basis: "TEST" }];
  assert.ok(hasCode(validate(src), "LAYER_LEVEL_MISMATCH", "standard_sources[0].level"));
});

test("R101 the forest is checked by combine, branch by branch", () => {
  const orders = [[FED, STATE, COUNTY_A, COUNTY_B, CITY_A, CITY_B], [CITY_B, CITY_A, COUNTY_B, COUNTY_A, STATE, FED], [COUNTY_A, FED, CITY_B, STATE, CITY_A, COUNTY_B]];
  const views = orders.map((o) => { const r = combine(o); assert.ok(r.ok, JSON.stringify(r.errors)); return r.view.layers; });
  assert.deepEqual(views[0].map((l) => l.id), ["t-fed", "t-state", "t-county-a", "t-county-b", "t-city-a", "t-city-b"], "in level order, then by place");
  assert.deepEqual(views[1], views[0]); assert.deepEqual(views[2], views[0]);
  assert.deepEqual(views[0][4], { id: "t-city-a", level: "city", place: "Aville", origin: "civicsmith", within: "t-county-a" });
  assert.ok(combine([FED, STATE]).ok, "a state-wide footprint, nothing below the state");
  assert.ok(combine([FED]).ok);

  const missing = combine([FED, STATE, CITY_A]);
  assert.deepEqual(codes(missing), ["LAYER_PARENT_MISSING"]);
  assert.deepEqual(missing.errors[0].branch, ["t-city-a", "t-county-a"], "names the branch from the failing layer up");
  assert.ok(codes(combine([FED, STATE, layer("t-county-a", "county", "Aville County", "t-city-a"), CITY_A])).includes("LAYER_PARENT_LEVEL"));
  const loopA = layer("t-loop-a", "city", "A", "t-loop-b"), loopB = layer("t-loop-b", "city", "B", "t-loop-a");
  assert.ok(codes(combine([FED, loopA, loopB])).includes("LAYER_CYCLE") || codes(combine([FED, loopA, loopB])).includes("LAYER_PARENT_LEVEL"));
  assert.ok(codes(combine([STATE, COUNTY_A])).includes("LAYER_NO_FEDERAL"));
  assert.ok(codes(combine([FED, layer("t-fed-2", "federal", "Elsewhere", null)])).includes("LAYER_FEDERAL_TWICE"));
  assert.ok(codes(combine([FED, STATE, { ...structuredClone(STATE), name: "other" }])).includes("LAYER_ID_TWICE"));
});

test("R102 one key, two layers, two answers: a conflict names each giver's layer; layers on different branches never conflict", () => {
  const a = layer("t-s1", "state", "One", "t-fed", { locale: { value: "en-GB", basis: "TEST" } });
  const b = layer("t-s2", "state", "Two", "t-fed", { locale: { value: "fr-CA", basis: "TEST" } });
  const r = combine([FED, a, b]);
  assert.ok(r.ok);
  const c = r.conflicts.find((x) => x.at === "locale");
  assert.ok(c, "a team-wide fact stated differently on two branches is a conflict at team level");
  assert.deepEqual(c.values.map((v) => v.layer), [{ id: "t-s1", level: "state", origin: "civicsmith" }, { id: "t-s2", level: "state", origin: "civicsmith" }]);
  assert.equal(r.view.locale, undefined, "withheld");
  /* control: equal values give none */
  const same = combine([FED, a, { ...structuredClone(b), locale: { value: "en-GB", basis: "TEST" } }]);
  assert.equal(same.conflicts.filter((x) => x.at === "locale").length, 0);

  /* a list called city in two city layers: side by side, no conflict */
  const ca = { ...structuredClone(CITY_A), holidays: [list("city", 2026, ["2026-01-01"])] };
  const cb = { ...structuredClone(CITY_B), holidays: [list("city", 2026, ["2026-02-02"])] };
  const both = combine([FED, STATE, COUNTY_A, COUNTY_B, ca, cb]);
  assert.ok(both.ok); assert.deepEqual(both.conflicts, []);
  assert.deepEqual(both.view.holidays.map((h) => h.profile), ["t-city-a", "t-city-b"]);
  /* two cities with different fiscal years: no conflict, each reads its own */
  const fy = (start) => [{ body: "*", start, named_by: "start", label: "FY{start}-{end2}", status: "researched", basis: "TEST" }];
  const f2 = combine([FED, STATE, COUNTY_A, COUNTY_B, { ...structuredClone(CITY_A), fiscal_year: fy("07-01") }, { ...structuredClone(CITY_B), fiscal_year: fy("10-01") }]);
  assert.deepEqual(f2.conflicts, []);
  assert.deepEqual(f2.view.fiscal_year.map((x) => [x.profile, x.start]), [["t-city-a", "07-01"], ["t-city-b", "10-01"]]);
  /* control: two different years for one government in one branch conflict */
  const f3 = combine([FED, { ...structuredClone(STATE), fiscal_year: fy("07-01") }, { ...structuredClone(COUNTY_A), fiscal_year: fy("10-01") }]);
  assert.ok(f3.conflicts.some((x) => x.at === "fiscal_year[*]"));
});

test("R102 two counties in two zones: a team-level zone conflict, and each county's clock reads its own zone", () => {
  const ca = { ...structuredClone(COUNTY_A), time_zone: zone("America/Los_Angeles") };
  const cb = { ...structuredClone(COUNTY_B), time_zone: zone("America/New_York") };
  const ids = [FED, STATE, ca, cb];
  const r = combine(ids);
  assert.ok(r.ok);
  assert.ok(r.conflicts.some((x) => x.at === "time_zone"));
  assert.equal(r.view.time_zone, undefined);
  assert.equal(governingZone(ids, null), null);
  assert.equal(governingZone(ids, null, "t-county-a"), "America/Los_Angeles");
  assert.equal(governingZone(ids, null, "t-county-b"), "America/New_York");
  assert.equal(governingZone(ids, "UTC", "t-county-b"), "UTC", "a team's own zone still wins");
});

test("R103 two layers state the same weekend: equal days agree, the citations joined; different days still conflict", () => {
  const w = (days, citation) => ({ weekend: { days, citation, status: "researched", basis: "TEST" } });
  const r = combine([{ ...structuredClone(FED), ...w(["sat", "sun"], "Fed § 1") }, { ...structuredClone(STATE), ...w(["sun", "sat"], "State § 2") }]);
  assert.deepEqual(r.conflicts, []);
  assert.deepEqual(r.view.weekend.days, ["sat", "sun"]);
  assert.equal(r.view.weekend.citation, "Fed § 1; State § 2");
  assert.deepEqual(r.view.weekend.bases.map((b) => b.profile), ["t-fed", "t-state"]);
  const d = combine([{ ...structuredClone(FED), ...w(["sat", "sun"], "Fed § 1") }, { ...structuredClone(STATE), ...w(["fri"], "State § 2") }]);
  assert.ok(d.conflicts.some((x) => x.at === "weekend")); assert.equal(d.view.weekend, undefined);
});

test("R104 a rule may count on a closure list a layer above it holds, resolved over the branch", () => {
  const fed = { ...structuredClone(FED), holidays: [list("federal", 2026, ["2026-01-01"])] };
  const rule = { rule: "answer", applies_to: "claim", units: "days", amount: 10, count: "calendar", starts: "received", closures: "federal", citation: "§ 4", status: "researched", basis: "TEST" };
  const st = { ...structuredClone(STATE), deadlines: [rule] };
  assert.deepEqual(validate(st).errors, [], "a layer within another may name a list it does not hold");
  const alone = structuredClone(st); delete alone.layer.within;
  assert.ok(hasCode(validate({ ...alone, layer: undefined }), "CLOSURES_UNKNOWN", "deadlines[0].closures"), "control: with no layer above, an unknown list is CLOSURES_UNKNOWN");
  assert.ok(combine([fed, st]).ok);
  assert.ok(codes(combine([FED, st])).includes("CLOSURES_UNKNOWN"), "the federal layer without the list");
  assert.ok(codes(combine([st])).includes("CLOSURES_UNKNOWN"), "with the federal layer absent");
  /* a list on another branch is not in this branch */
  const cityListB = { ...structuredClone(CITY_B), holidays: [list("city", 2026, ["2026-03-03"])] };
  const cityRuleA = { ...structuredClone(CITY_A), deadlines: [{ ...rule, closures: "city" }] };
  assert.ok(codes(combine([FED, STATE, COUNTY_A, COUNTY_B, cityListB, cityRuleA])).includes("CLOSURES_UNKNOWN"));
  /* a layer's rule naming its own list validates alone */
  assert.deepEqual(validate({ ...structuredClone(FED), holidays: [list("own", 2026, ["2026-01-01"])], deadlines: [{ ...rule, closures: "own" }] }).errors, []);
});

test("R105 records-request help is one block per law; each layer adds its own fields; control: one branch, one value", () => {
  const stateHelp = { ...structuredClone(STATE), records_help: [help("The Act", 10)] };
  const cityHelp = (portal) => ({ ...structuredClone(CITY_A), records_help: [{ law: "The Act", portal: { name: portal, url: "https://portal.example/" },
    faster: { ordinance: "Local Ordinance", window: "two days", request: "quick request", citation: "Loc § 1" }, status: "researched", basis: "2026-01-01" }] });
  assert.deepEqual(validate(stateHelp).errors, []);
  assert.deepEqual(validate(cityHelp("Portal A")).errors, [], "a layer below adds portal and faster alone");
  const r = combine([FED, stateHelp, COUNTY_A, cityHelp("Portal A")]);
  assert.ok(r.ok); assert.deepEqual(r.conflicts, []);
  assert.equal(r.view.records_help.length, 1);
  const b = r.view.records_help[0];
  assert.deepEqual([b.law, b.days, b.extra_days, b.portal.name, b.faster.request], ["The Act", 10, 5, "Portal A", "quick request"]);
  assert.deepEqual(b.bases.map((x) => x.profile), ["t-state", "t-city-a"]);
  /* a federal block appears beside it */
  const fedHelp = { ...structuredClone(FED), records_help: [help("The Federal Act", 20)] };
  assert.deepEqual(combine([fedHelp, stateHelp, COUNTY_A, cityHelp("Portal A")]).view.records_help.map((x) => x.law), ["The Federal Act", "The Act"]);
  /* a second city's portal for the same state law: its own block, no conflict */
  const cityB = { ...cityHelp("Portal B"), id: "t-city-b", layer: { level: "city", place: "Bville", within: "t-county-b", origin: "civicsmith" } };
  const two = combine([FED, stateHelp, COUNTY_A, COUNTY_B, cityHelp("Portal A"), cityB]);
  assert.ok(two.ok); assert.deepEqual(two.conflicts, []);
  assert.deepEqual(two.view.records_help.map((x) => x.portal.name), ["Portal A", "Portal B"]);
  /* control: two layers of one branch giving different days conflict */
  const clash = combine([FED, stateHelp, { ...structuredClone(COUNTY_A), records_help: [help("The Act", 99)] }]);
  assert.ok(clash.conflicts.some((x) => x.at === "records_help[The Act].days"));
  /* a partial block with no portal or faster is refused naming its core */
  const partial = { ...structuredClone(CITY_A), records_help: [{ law: "The Act", status: "researched", basis: "2026-01-01" }] };
  assert.ok(hasCode(validate(partial), "VALUE_INVALID", "records_help[0].days"));
});

test("R106 a records law says whose records it governs: levels of office, each once", () => {
  const withGoverns = (g) => { const p = structuredClone(STATE); p.records_laws = [law("state", "The Act", { governs: g })]; return validate(p); };
  assert.deepEqual(withGoverns(["state", "county", "city", "district"]).errors, []);
  assert.deepEqual(withGoverns(["federal"]).errors, []);
  assert.ok(hasCode(withGoverns([]), "VALUE_INVALID", "records_laws[0].governs"));
  assert.ok(hasCode(withGoverns(["state", "state"]), "VALUE_INVALID", "records_laws[0].governs"));
  assert.ok(hasCode(withGoverns(["national"]), "LEVEL_UNKNOWN", "records_laws[0].governs[0]"));
  const p = structuredClone(STATE); p.records_laws = [law("state", "The Act")];
  assert.deepEqual(validate(p).errors, [], "control: a law with no governs is valid (undetermined, R27)");
  assert.deepEqual([...COUNTERPARTY_LEVELS], ["federal", "state", "county", "city", "district"]);
  assert.deepEqual([...LAW_LEVELS], ["federal", "state", "county", "city"]);
});

test("R108 a layer says how far its facts reach: view.layers gives the date researched and the last year every list has", () => {
  const fed = { ...structuredClone(FED), coverage: { as_of: "2026-10-01" }, holidays: [list("federal", 2026, ["2026-01-01"]), list("federal", 2027, ["2027-01-01"]), list("other", 2026, ["2026-05-05"])] };
  const r = combine([fed, STATE]);
  assert.deepEqual(r.view.layers[0], { id: "t-fed", level: "federal", place: "Testland", origin: "civicsmith", as_of: "2026-10-01", holidays_through: 2026 },
    "every list must have the year: `other` ends in 2026");
  fed.holidays.push(list("other", 2027, ["2027-05-05"]));
  assert.equal(combine([fed, STATE]).view.layers[0].holidays_through, 2027);
  assert.equal(combine([FED, STATE]).view.layers[0].holidays_through, undefined, "control: no list, no year");
  assert.ok(hasCode(validate({ ...structuredClone(FED), coverage: { as_of: "yesterday" } }), "LAYER_INVALID", "coverage.as_of"));
  assert.deepEqual(validate({ ...structuredClone(FED), coverage: { as_of: "2026-10-01", holidays_through: 2028 } }).errors, []);
});

test("R121 nameResolve: the asking layer's own, then its branch, then the one active layer; NAME_AMBIGUOUS never guesses", () => {
  const withLaw = (l, name) => ({ ...structuredClone(l), records_laws: [law(l.layer.level, name)] });
  const a = withLaw(CITY_A, "Sunshine"), b = withLaw(CITY_B, "Sunshine");
  const layers = [FED, STATE, COUNTY_A, COUNTY_B, a];
  const ok = nameResolve({ section: "records_laws", name: "Sunshine", layers });
  assert.deepEqual([ok.ok, ok.layer, ok.entry.name], [true, "t-city-a", "Sunshine"], "the one layer that gives it");
  const amb = nameResolve({ section: "records_laws", name: "Sunshine", layers: [...layers, b] });
  assert.deepEqual([amb.ok, amb.reason, amb.layers.map((x) => x.layer)], [false, "NAME_AMBIGUOUS", ["t-city-a", "t-city-b"]]);
  assert.equal(nameResolve({ section: "records_laws", name: "Sunshine", asking: "t-city-b", layers: [...layers, b] }).layer, "t-city-b", "the asking layer's own");
  assert.equal(nameResolve({ section: "records_laws", name: "Sunshine", layer: "t-city-a", layers: [...layers, b] }).layer, "t-city-a");
  assert.equal(nameResolve({ section: "records_laws", name: "t-city-b:Sunshine", layers: [...layers, b] }).layer, "t-city-b", "written layer:name");
  assert.deepEqual(nameResolve({ section: "records_laws", name: "Nothing", layers }), { ok: false, reason: "NAME_UNKNOWN" });
  assert.deepEqual(nameResolve({ section: "records_laws", name: "Sunshine", layer: "t-city-b", layers }), { ok: false, reason: "NAME_UNKNOWN" }, "a layer that is not active");
  assert.deepEqual(nameResolve({ section: "nope", name: "x", layers }), { ok: false, reason: "NAME_UNKNOWN" });
  assert.deepEqual(nameResolve(null), { ok: false, reason: "NAME_UNKNOWN" });
  /* a name in a layer above is found from the branch below */
  const st = withLaw(STATE, "State Act");
  assert.equal(nameResolve({ section: "records_laws", name: "State Act", asking: "t-city-a", layers: [FED, st, COUNTY_A, a] }).layer, "t-state");
  /* lists: a bare name held by two cities is ambiguous; the asking layer's own list is found */
  const la = { ...structuredClone(CITY_A), holidays: [list("city", 2026, ["2026-01-01"])] }, lb = { ...structuredClone(CITY_B), holidays: [list("city", 2026, ["2026-02-02"])] };
  assert.equal(nameResolve({ section: "closures", name: "city", layers: [FED, STATE, COUNTY_A, COUNTY_B, la, lb] }).reason, "NAME_AMBIGUOUS");
  assert.equal(nameResolve({ section: "closures", name: "city", asking: "t-city-b", layers: [FED, STATE, COUNTY_A, COUNTY_B, la, lb] }).entry[0].days[0].date, "2026-02-02");
  assert.equal(nameResolve({ section: "closures", name: "t-city-a:city", layers: [FED, STATE, COUNTY_A, COUNTY_B, la, lb] }).entry[0].days[0].date, "2026-01-01");
});
