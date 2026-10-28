/* duties, T53 (T53-159; N1257, K5458): R35, a duty from a rule keeps the rule's layer. Tested at the module's interface,
 * over the held Oakland layers and a second city layer made here (values made up, every basis TEST). The view duties
 * reads is `combine`'s layers and deadlines beside the fictional view's calendar (fixture.mjs). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, fictionalView, E, BOB } from "./fixture.mjs";
import { DUTIES_CHECKS } from "../../../src/duties/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

const row = (r, code) => {
  assert.equal(r.ok, false, `${code}: ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code);
  assert.equal(r.code, code);
  assert.equal(r.check, DUTIES_CHECKS[code].check);
  assert.equal(r.translation, DUTIES_CHECKS[code].translation);
};

const OAK = ["oakland-alameda"];
const CITY = "us-ca-oakland", OTHER = "t-city-aardvark";
/* a second city layer, within the held state layer, giving a rule of Oakland's name with a different figure */
const CITY_B = {
  id: OTHER, name: "Aardvark", covers: ["Aardvark"], test: true,
  layer: { level: "city", place: "Aardvark", within: "us-california", origin: "civicsmith" },
  deadlines: [{ rule: "immediate_disclosure", applies_to: "records_request", owed_by: "body", units: "days", amount: 5, count: "calendar",
                starts: "received", citation: "Aardvark Code § 1", status: "researched", basis: "TEST" }],
};
const viewOf = (list) => {
  const c = combine(list);
  assert.ok(c.ok, JSON.stringify(c.errors));
  const base = fictionalView();
  /* the city's own closure list, which the city's rule names */
  const city = { year: 2026, list: "city", days: [{ date: "2026-01-01", name: "New Year" }], status: "researched", basis: "TEST", citation: "Test Code § 135" };
  return fictionalView({ layers: c.view.layers, deadlines: c.view.deadlines, holidays: [...base.holidays, city] });
};
const RULE = { rule: "immediate_disclosure", applies_to: "records_request" };
const SENT = [{ ref: "ACT-2026-0001-request", date: "2026-02-02", label: "records request sent" }];
const occ = (w, id) => w.duties.occurrencesOf({ dutyId: id, asOf: "2026-03-02T12:00:00Z", from: "2026-01-01", to: "2026-03-01", viewer: BOB });
const proposal = (w, law, over = {}) => ({ ...RULE, office: E.clerk, source: { kind: "standard", standard: law, portion: "s7922" }, trigger_source: "actions", by: BOB, ...over });

test("R35 a duty adopted from the Oakland layer's rule keeps time.layer and its occurrences' states after a second layer gives a rule of the same name", () => {
  const w = world({ view: viewOf(OAK) });
  w.duties.registerTriggerSource("actions", () => SENT);
  const law = w.standard();
  const p = w.duties.proposeFromRule(proposal(w, law));
  assert.equal(p.ok, true);
  const a = w.duties.adopt({ proposalId: p.proposal_id, clause: "the city answers an immediate disclosure request", by: BOB });
  assert.equal(a.ok, true);
  assert.equal(w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB }).duty.time.layer, CITY);
  const before = occ(w, a.duty_id);
  assert.deepEqual(before.occurrences.map((o) => [o.due.date.value, o.due.basis_kind, o.state]), [["2026-02-05", "rule", "overdue"]]);

  /* the second layer arrives: the duty reads the rule of its own layer, and says so */
  const both = viewOf([...OAK, CITY_B]);
  w.setView(both);
  assert.deepEqual(occ(w, a.duty_id), before);
  assert.equal(w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB }).duty.time.layer, CITY);

  /* the bare name is now ambiguous, with the layers: never a guess */
  const amb = w.duties.proposeFromRule(proposal(w, law));
  row(amb, "NAME_AMBIGUOUS");
  assert.deepEqual(amb.layers.map((l) => l.layer).sort(), [OTHER, CITY].sort());
  assert.deepEqual(amb.layers.map((l) => [l.level, l.place]).sort(), [["city", "Aardvark"], ["city", "Oakland"]]);
  assert.equal(amb.rule, RULE.rule);
  row(w.declare({ time: { basis: "rule", ...RULE } }), "NAME_AMBIGUOUS");
  assert.equal(w.sqlRows(`SELECT COUNT(*) AS n FROM duty_proposals`)[0].n, 1, "the refused act wrote nothing");

  /* naming the layer settles it, in a proposal and in a declaration */
  const named = w.duties.proposeFromRule(proposal(w, law, { layer: OTHER }));
  assert.equal(named.ok, true);
  const b = w.duties.adopt({ proposalId: named.proposal_id, clause: "the other city answers", by: BOB });
  assert.equal(w.duties.readDuty({ dutyId: b.duty_id, viewer: BOB }).duty.time.layer, OTHER);
  assert.deepEqual(occ(w, b.duty_id).occurrences.map((o) => o.due.date.value), ["2026-02-07"], "its own layer's figure");
  const c = w.declare({ time: { basis: "rule", ...RULE, layer: CITY }, trigger: { kind: "date", date: "2026-02-02" } });
  assert.equal(c.ok, true);
  assert.deepEqual(occ(w, c.duty_id).occurrences.map((o) => o.due.date.value), ["2026-02-05"]);
  /* the layer-qualified spelling resolves to the same */
  const q = w.declare({ time: { basis: "rule", rule: `${OTHER}:${RULE.rule}`, applies_to: RULE.applies_to }, trigger: { kind: "date", date: "2026-02-02" } });
  assert.equal(w.duties.readDuty({ dutyId: q.duty_id, viewer: BOB }).duty.time.rule, RULE.rule);
  assert.equal(w.duties.readDuty({ dutyId: q.duty_id, viewer: BOB }).duty.time.layer, OTHER);
  /* control: one layer giving the name, the bare name resolves without asking for the layer */
  w.setView(viewOf(OAK));
  assert.equal(w.duties.proposeFromRule(proposal(w, law)).ok, true);
});

test("R35 control: a duty adopted before the change derives the same occurrences, its rule read over the layers active when it was adopted", () => {
  const w = world({ view: fictionalView() });
  w.record.setSetting("jurisdiction_profiles", OAK, "admin");
  w.at("2099-01-01T12:00:00.000Z");
  const legacy = w.declare({ time: { basis: "rule", ...RULE }, trigger: { kind: "date", date: "2026-02-02" } });
  assert.equal(legacy.ok, true);
  assert.equal(w.duties.readDuty({ dutyId: legacy.duty_id, viewer: BOB }).duty.time.layer, undefined, "no layer: the view held none");

  const oakOnly = viewOf(OAK);
  w.setView(oakOnly);
  const before = occ(w, legacy.duty_id);
  assert.deepEqual(before.occurrences.map((o) => [o.due.date.value, o.state]), [["2026-02-05", "overdue"]]);

  const both = viewOf([...OAK, CITY_B]);
  const gives = both.deadlines.filter((d) => d.rule === RULE.rule).map((d) => d.layer ?? d.profile);
  assert.deepEqual(gives.slice().sort(), [OTHER, CITY].sort());
  assert.equal(gives[0], OTHER, "the other layer's rule is the first the view holds, so reading the first match would be wrong");
  w.setView(both);
  assert.deepEqual(occ(w, legacy.duty_id), before);
  assert.equal(w.duties.readDuty({ dutyId: legacy.duty_id, viewer: BOB }).duty.time.layer, undefined, "its recorded version is untouched");
  /* revising it without touching its time leaves it as it is read: no layer is given and no refusal arises */
  const r = w.duties.revise({ dutyId: legacy.duty_id, performance: { act: "answer the request" }, reason: "the wording", by: BOB });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(occ(w, legacy.duty_id).occurrences.map((o) => o.due.date.value), ["2026-02-05"]);

  /* control: a view with no layers (a whole-place profile) gives no layer, and the rule reads as it did */
  const plain = world({ view: fictionalView() });
  plain.duties.registerTriggerSource("actions", () => SENT);
  const p = plain.duties.proposeFromRule(proposal(plain, plain.standard(), { rule: "records_response" }));
  const d = plain.duties.adopt({ proposalId: p.proposal_id, clause: "the agency asked responds", by: BOB });
  assert.equal(plain.duties.readDuty({ dutyId: d.duty_id, viewer: BOB }).duty.time.layer, undefined);
  assert.deepEqual(occ(plain, d.duty_id).occurrences.map((o) => o.due.date.value), ["2026-02-12"]);
});
