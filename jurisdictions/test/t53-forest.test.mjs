/* jurisdictions, T53 (T53-6; N1257, DEC-404; K5452): the test forest (R118), the module's published fixture of layers: a
 * four-layer chain, a second county and city on another branch, a state with nothing below it, a city in another state, the
 * team layer with entries about two governments, a closure list a lower layer counts on, a bare list name held by two
 * same-level layers, one equal pair and one conflicting pair. Tested at the module's interface: validate, combine, nameResolve. */
import test from "node:test";
import assert from "node:assert/strict";
import { validate, combine, nameResolve, governingZone } from "../index.mjs";
import { FOREST, forestCopy } from "./fixtures/forest.mjs";

const codes = (r) => (r.errors || []).map((e) => e.code);

test("R118 every layer of the forest validates and is a test layer with only TEST bases", () => {
  for (const l of [...FOREST.all, FOREST.conflict, FOREST.equal]) {
    assert.deepEqual(validate(l).errors, [], l.id);
    assert.equal(l.test, true, l.id);
  }
  const bases = new Set();
  (function walk(v) { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") { for (const [k, x] of Object.entries(v)) { if (k === "basis" && typeof x === "string") bases.add(x.startsWith("team:") ? "team" : x); else walk(x); } } })(FOREST.all);
  assert.deepEqual([...bases].sort(), ["TEST", "team"]);
  /* each level holds one law and one deadline; hosts, where any, are under .example */
  for (const l of FOREST.chain) { assert.equal(l.records_laws.length, 1, l.id); assert.equal(l.deadlines.length, 1, l.id); }
  assert.ok(!JSON.stringify(FOREST).match(/https?:\/\/(?![^"]*\.example)/));
});

test("R118 the chain and the whole forest combine, in level order, with no conflict; every law and rule is held once", () => {
  const chain = combine(forestCopy(FOREST.chain));
  assert.ok(chain.ok, JSON.stringify(chain.errors));
  assert.deepEqual(chain.conflicts, []);
  assert.deepEqual(chain.view.layers.map((l) => l.level), ["federal", "state", "county", "city"]);
  const all = combine(forestCopy(FOREST.all));
  assert.ok(all.ok, JSON.stringify(all.errors));
  assert.deepEqual(all.conflicts, []);
  const levels = all.view.layers.map((l) => l.level);
  const rank = { federal: 0, state: 1, county: 2, city: 3 };
  assert.ok(levels.slice(0, -1).every((l, i, a) => i === 0 || rank[a[i - 1]] <= rank[l]), "level order");
  assert.ok(all.view.layers.at(-1).origin === "team");
  assert.deepEqual(all.view.records_laws.map((l) => l.name).sort(), [...new Set(all.view.records_laws.map((l) => l.name))].sort());
  assert.equal(all.view.records_laws.length, 9, "one law at each of the nine civicsmith layers that hold one");
  /* any order gives the one view */
  const shuffled = combine(forestCopy(FOREST.all).reverse());
  assert.deepEqual(shuffled.view.layers, all.view.layers);
});

test("R118 a rule counts on a closure list a layer above it holds; without that layer the list is unknown", () => {
  const state = FOREST.chain[1];
  assert.deepEqual(validate(state).errors, [], "validates alone, within the federal-like layer");
  assert.equal(combine(forestCopy(FOREST.chain)).view.deadlines.find((d) => d.rule === "state_answer").closures, "fed");
  assert.ok(codes(combine([state])).includes("LAYER_NO_FEDERAL") || codes(combine([state])).includes("CLOSURES_UNKNOWN"));
  const noFed = structuredClone(FOREST.chain[0]); delete noFed.holidays; delete noFed.deadlines; noFed.records_laws[0].response = undefined; delete noFed.records_laws[0].response;
  assert.ok(codes(combine([noFed, structuredClone(state)])).includes("CLOSURES_UNKNOWN"), "control: the list held nowhere");
});

test("R118 a bare list name held by two same-level layers is two lists, one per branch: no collision, ambiguous bare, resolved when asked from one", () => {
  const all = combine(forestCopy(FOREST.all));
  assert.equal(all.view.holidays.filter((h) => h.list === "town").length, 2);
  const layers = forestCopy(FOREST.all).filter((l) => l.layer.origin !== "team");
  const bare = nameResolve({ section: "closures", name: "town", layers });
  assert.equal(bare.ok, false);
  assert.equal(bare.reason, "NAME_AMBIGUOUS");
  assert.deepEqual(bare.layers.map((l) => l.layer).sort(), ["forest-city-a", "forest-city-b"]);
  assert.deepEqual(nameResolve({ section: "closures", name: "town", asking: "forest-city-a", layers }).layer, "forest-city-a");
  assert.deepEqual(nameResolve({ section: "closures", name: "town", layer: "forest-city-b", layers }).layer, "forest-city-b");
  /* control: a name one layer gives resolves bare */
  assert.equal(nameResolve({ section: "closures", name: "fed", layers }).layer, "forest-federal");
});

test("R118 one equal pair and one conflicting pair: the conflict names each layer; equal values agree whatever their basis", () => {
  const bad = combine([...forestCopy(FOREST.chain), structuredClone(FOREST.conflict)]);
  assert.ok(bad.ok);
  const zone = bad.conflicts.find((c) => c.at === "time_zone");
  assert.ok(zone, "the zone the state-like layer gives and the county-like layer gives differently");
  assert.deepEqual(zone.values.map((v) => v.layer.id).sort(), ["forest-county-conflict", "forest-state"]);
  assert.ok(bad.conflicts.some((c) => c.at === "weekend"), "different weekend days conflict too");
  const same = combine([...forestCopy(FOREST.chain), structuredClone(FOREST.equal)]);
  assert.deepEqual(same.conflicts, []);
  assert.equal(same.view.time_zone.value, "America/Chicago");
  assert.equal(same.view.time_zone.bases.length, 2, "both givers' bases are kept");
  assert.equal(same.view.weekend.citation.includes("Dville weekend § 10"), true, "equal weekend days with another citation: one weekend, the citations joined");
});

test("R118 the team layer holds entries about two governments, one with a stated fiscal year; each is read for its own government", () => {
  const all = combine(forestCopy(FOREST.all));
  assert.ok(all.ok);
  const year = all.view.fiscal_year.map((y) => [y.layer ?? y.profile, y.start]);
  assert.ok(year.some(([, s]) => s === "04-01"), "the team's stated year for the city no layer states");
  assert.ok(year.some(([, s]) => s === "07-01") && year.some(([, s]) => s === "10-01"), "the records' own years stand beside it");
  assert.equal(all.conflicts.length, 0);
  const second = { ...structuredClone(FOREST.team), name: "A second team layer (test)" };
  assert.ok(codes(combine([...forestCopy(FOREST.all), second])).includes("LAYER_TEAM_TWICE"), "control: a second team layer");
  assert.equal(governingZone(forestCopy(FOREST.chain), null), "America/Chicago");
});
