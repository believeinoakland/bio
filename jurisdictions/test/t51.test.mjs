/* jurisdictions, T51 (T51-170; K3949; the words rule, setup-words R13–R14): the six sentences the words check found in
 * this module, each now read through `localize`. Tested at the module's interface: each refusal's code and path, the
 * detail naming the values it carries, and a well-formed control beside each. No test holds a sentence's text (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { get, validate, TEMPLATE_FIELDS, UNITS } from "../index.mjs";

const TEST = "test-port-ellery";
const profile = () => get(TEST);
const errorAt = (r, code, end) => r.errors.find((e) => e.code === code && e.path.endsWith(end));

test("jurisdictions.index.amount_is_amount_and_units: a venue fact's amount names the units it may use; a well-formed amount is not refused", () => {
  const bad = profile();
  const k = bad.action_kinds.find((x) => x.venue);
  k.venue.facts = [{ fact: "page_limit", value: "ten pages", amount: { amount: 0, units: "days" }, citation: "Local rule 1", status: "researched", basis: "TEST" }];
  const e = errorAt(validate(bad), "VALUE_INVALID", ".amount");
  assert.ok(e, "a zero amount is refused at its field");
  for (const u of UNITS) assert.ok(e.detail.includes(u), `the detail names the unit ${u}`);

  const good = profile();
  const g = good.action_kinds.find((x) => x.venue);
  g.venue.facts = [{ fact: "page_limit", value: "ten pages", amount: { amount: 3, units: "days" }, citation: "Local rule 1", status: "researched", basis: "TEST" }];
  assert.equal(errorAt(validate(good), "VALUE_INVALID", ".amount"), undefined, "a positive amount in a unit is not refused");
});

test("jurisdictions.index.a_template_is_fields_never_bare: a bare-text template is refused and its detail names every field it must carry", () => {
  const bad = profile();
  bad.action_kinds.find((x) => x.template).template = "bare text";
  const e = errorAt(validate(bad), "TEMPLATE_UNATTRIBUTED", ".template");
  assert.ok(e, "bare text is refused as unattributed");
  for (const f of TEMPLATE_FIELDS) assert.ok(e.detail.includes(f), `the detail names the field ${f}`);

  assert.equal(validate(profile()).ok, true, "the test profile, with its attributed templates, is valid");
});

test("jurisdictions.index.sources_lists_one_public_source and jurisdictions.index.a_source_has_a_citation: a template's sources need a citation each", () => {
  const none = profile();
  none.action_kinds.find((x) => x.template && typeof x.template === "object").template.sources = [];
  const empty = errorAt(validate(none), "VALUE_INVALID", ".template.sources");
  assert.ok(empty, "an empty list of sources is refused");
  assert.ok(empty.detail.includes("citation"), "the detail names the citation each source needs");

  const bare = profile();
  bare.action_kinds.find((x) => x.template && typeof x.template === "object").template.sources = [{}];
  const one = errorAt(validate(bare), "VALUE_INVALID", ".sources[0]");
  assert.ok(one, "a source with no citation is refused at its index");
  assert.ok(one.detail.includes("citation"), "the detail names the citation the source must have");

  const good = profile();
  good.action_kinds.find((x) => x.template && typeof x.template === "object").template.sources = [{ citation: "Code 1" }];
  assert.equal(errorAt(validate(good), "VALUE_INVALID", ".sources"), undefined, "a source with its citation is not refused");
  assert.equal(errorAt(validate(good), "VALUE_INVALID", ".sources[0]"), undefined, "a cited source is not refused at its index");
});

test("jurisdictions.index.year_listed_twice_for_all_offices and the list and office variants: a year listed twice names its list and its offices", () => {
  const twiceAll = profile();
  const base = twiceAll.holidays.find((h) => !h.list && !h.offices);
  twiceAll.holidays.push(structuredClone(base));
  const all = errorAt(validate(twiceAll), "HOLIDAY_INVALID", ".year");
  assert.ok(all, "a year listed twice for all offices is refused");
  assert.ok(all.detail.includes(String(base.year)), "the detail names the year");

  const twiceList = profile();
  const L = twiceList.holidays.find((h) => h.list);
  twiceList.holidays.push(structuredClone(L));
  const named = errorAt(validate(twiceList), "HOLIDAY_INVALID", ".year");
  assert.ok(named, "a year listed twice for one closure list is refused");
  assert.ok(named.detail.includes(L.list), "the detail names the closure list");

  const twiceOffices = profile();
  const O = twiceOffices.holidays.find((h) => h.offices && !h.list);
  twiceOffices.holidays.push(structuredClone(O));
  const offices = errorAt(validate(twiceOffices), "HOLIDAY_INVALID", ".year");
  assert.ok(offices, "a year listed twice for one set of offices is refused");
  assert.ok(offices.detail.includes(String(O.year)), "the detail names the year");

  assert.equal(errorAt(validate(profile()), "HOLIDAY_INVALID", ".year"), undefined, "a year listed once is not refused");
});

test("jurisdictions.index.within_is_amount_and_units: a demand's within names the units it may use; a well-formed within is not refused", () => {
  const bad = profile();
  bad.lawful_demands[0].within = { amount: 0, units: "days" };
  const e = errorAt(validate(bad), "DEMAND_INVALID", ".within");
  assert.ok(e, "a zero amount is refused at within");
  for (const u of UNITS) assert.ok(e.detail.includes(u), `the detail names the unit ${u}`);

  const good = profile();
  good.lawful_demands[0].within = { amount: 48, units: "hours" };
  assert.equal(errorAt(validate(good), "DEMAND_INVALID", ".within"), undefined, "a positive amount in a unit is not refused");
});
