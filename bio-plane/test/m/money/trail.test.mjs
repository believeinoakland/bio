/* The money trail at money's interface: R25 (T36-16; N728; U108, U110–U114), the rows `readSet` answers beside each
   fact of a set of purpose `trail`. Each test reads the rows through `readSet` and checks that nothing is written. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, sha, MACHINE, ANN, BOB, OUTSIDER } from "./fixture.mjs";

const NOT_STATED = { stated: false, says: "not stated in this source" };
const snapshot = (s) => JSON.stringify(["money_facts", "money_concerns", "money_withdrawals", "money_sets", "money_set_acts", "money_set_proposals"]
  .map((t) => s.rows(`SELECT * FROM ${t} ORDER BY rowid`)));

/* A trail set with the facts included by a member; answers the set's id and a reader of one fact's row. */
function trail(s, facts, { viewer = ANN, by = ANN } = {}) {
  const set = s.m.createSet({ purpose: "trail", label: "harbour money trail", by }).set_id;
  for (const f of facts) assert.equal(s.m.include({ setId: set, factId: f, reason: "follows the harbour money", by }).ok, true);
  const row = (factId, v = viewer) => {
    const r = s.m.readSet({ setId: set, viewer: v });
    return [...r.inclusions, ...r.proposals].find((e) => e.fact_id === factId)?.trail;
  };
  return { set, row };
}

test("R25 from and to: each party as the source states it with its grade; an absent one answered 'not stated in this source', never filled from another fact, an event's participants or an entity's role", () => {
  const s = seeded();
  s.resolution(s.cap, s.city, "A");
  const pay = s.datedEvent("payment", "2014-02-03");
  s.ev.addParticipant({ eventId: pay, entityId: s.vendor, role: "recipient", attestation: { testimony: "I saw the cheque" }, by: ANN });
  const noTo = s.rec({ to: null, concerns: [pay] });
  const full = s.rec({ concerns: [pay] });
  const { row } = trail(s, [noTo, full]);
  const r = row(noTo);
  assert.deepEqual(r.from, { stated: true, party: { entity: s.city, fund: s.general, as_written: "City of Port Ellery" }, grade: "A" });
  assert.deepEqual(r.to, NOT_STATED, "another fact names the vendor as payee and the event names it as recipient: neither fills it");
  assert.deepEqual(r.gaps, ["to"]);
  assert.deepEqual(row(full).to, { stated: true, party: { entity: s.vendor, as_written: "Harbour Dredging Co" }, grade: null });
  const neither = s.rec({ from: null, to: null, concerns: [pay] });
  const t = trail(s, [neither]);
  assert.deepEqual([t.row(neither).from, t.row(neither).to, t.row(neither).gaps], [NOT_STATED, NOT_STATED, ["from", "to"]]);
});

test("R25 moved: an actual fact is dated from the event it concerns, at that event's own precision and zone, with the attestation that dates it", () => {
  const s = seeded();
  const pay = s.datedEvent("payment", "2014-02-03");
  const id = s.rec({ concerns: [pay] });
  const m = trail(s, [id]).row(id).moved;
  assert.equal(m.state, "dated");
  assert.equal(m.event, pay);
  assert.deepEqual([m.when.value, m.when.precision, m.when.zone], ["2014-02-03", "day", "America/Halifax"]);
  assert.equal(m.attestation.form, "dated_fact");
  assert.deepEqual(m.attestation.date, { value: "2014-02-03", precision: "day", zone: "America/Halifax" });
  // several events: the one payment or transfer singles it out
  const meeting = s.datedEvent("meeting", "2014-01-10");
  const two = s.rec({ concerns: [meeting, pay] });
  const m2 = trail(s, [two]).row(two).moved;
  assert.deepEqual([m2.state, m2.event, m2.when.value], ["dated", pay, "2014-02-03"]);
});

test("R25 moved undetermined: no event concerned (its period unused), an event no attestation dates, and several events none singled out", () => {
  const s = seeded();
  const none = s.rec({ period: { from: "2014-02-01", to: "2014-02-28" } });
  const undated = s.event("payment");
  const onUndated = s.rec({ concerns: [undated] });
  const a = s.datedEvent("payment", "2014-02-03"), b = s.datedEvent("transfer", "2014-02-05");
  const both = s.rec({ concerns: [a, b] });
  const meeting = s.datedEvent("meeting", "2014-01-10"), award = s.datedEvent("award", "2013-12-01");
  const neither = s.rec({ concerns: [meeting, award] });
  const { row } = trail(s, [none, onUndated, both, neither]);
  const m = row(none).moved;
  assert.equal(m.state, "undetermined");
  assert.match(m.why, /concerns no event/);
  assert.equal(JSON.stringify(m).includes("2014-02"), false, "never placed by the fact's period");
  assert.deepEqual(row(none).gaps, ["moved"]);
  assert.deepEqual([row(onUndated).moved.state, row(onUndated).moved.event], ["undetermined", undated]);
  assert.match(row(onUndated).moved.why, /placed nowhere/);
  assert.deepEqual([row(both).moved.state, row(both).moved.events.sort()], ["undetermined", [a, b].sort()]);
  assert.deepEqual([row(neither).moved.state, row(neither).moved.events.sort()], ["undetermined", [meeting, award].sort()]);
  // events not wired: undetermined, never a date
  const bare = seeded({ events: false });
  const f = bare.rec();
  assert.equal(trail(bare, [f]).row(f).moved.state, "undetermined");
});

test("R25 moved for a fact that is not actual: an adopted figure 'did not move', dated by its adoption where one dates it, else null", () => {
  const s = seeded();
  const adoption = s.datedEvent("adoption", "2013-06-18");
  const adopted = s.rec({ phase: "adopted", stage: null, kind: "allocation", concerns: [adoption] });
  const proposed = s.rec({ phase: "proposed", stage: null, kind: "allocation" });
  const { row } = trail(s, [adopted, proposed]);
  const m = row(adopted).moved;
  assert.deepEqual([m.state, m.phase, m.when.value, m.event], ["did_not_move", "adopted", "2013-06-18", adoption]);
  assert.deepEqual(row(proposed).moved, { state: "did_not_move", phase: "proposed", when: null });
  assert.deepEqual(row(proposed).gaps, [], "a figure that did not move has no movement gap");
});

test("R25 compared: a budget figure is answered beside the paid figure sharing its concerns, through reconcile, never summed or merged; with none it is budget_only", () => {
  const s = seeded();
  const adopted = s.rec({ phase: "adopted", stage: null, amount: "1300000", as_read: "$1.3 million", precision: "rounded", concerns: [s.contract] });
  const paid = s.rec({ amount: "1250000.00", concerns: [s.contract] });
  const elsewhere = s.rec({ amount: "9.00", concerns: [s.general] });
  const lone = s.rec({ phase: "proposed", stage: null, concerns: [s.harbour] });
  const before = s.one(`SELECT count(*) AS n FROM money_facts`).n;
  const { row } = trail(s, [adopted, paid, elsewhere, lone]);
  const r = row(adopted);
  assert.deepEqual(r.compared.map((c) => c.fact_id), [paid]);
  assert.deepEqual(r.compared[0].reconcile, s.m.reconcile({ a: adopted, b: paid, viewer: ANN }));
  assert.deepEqual(r.compared[0].reconcile.differs.map((d) => d.dimension), ["phase or stage"]);
  assert.equal(r.budget_only, false);
  assert.equal(/"(sum|total|merged|net)"/.test(JSON.stringify(r)), false, "nothing summed or merged");
  assert.deepEqual([row(lone).compared, row(lone).budget_only], [[], true]);
  assert.equal("compared" in row(paid), false, "an actual fact is not compared");
  assert.equal(s.one(`SELECT count(*) AS n FROM money_facts`).n, before);
  // a withdrawn actual fact is never counted (R7)
  s.m.withdrawFact({ factId: paid, reason: "duplicate", by: ANN });
  assert.deepEqual([row(adopted).compared, row(adopted).budget_only], [[], true]);
});

test("R25 adjustments: a later change is an adjusts answered beside the fact, never netted into its figure", () => {
  const s = seeded();
  const adopted = s.rec({ phase: "adopted", stage: null, amount: "1000000", as_read: "$1,000,000" });
  const adj = s.rec({ phase: "adjusted", stage: null, sign: "-", amount: "50000", as_read: "(50,000)", adjusts: adopted });
  const { row } = trail(s, [adopted]);
  const r = row(adopted);
  assert.deepEqual(r.adjustments, [{ fact_id: adj, sign: "-", amount: "-50000", as_read: "(50,000)", phase: "adjusted", withdrawn: false }]);
  assert.equal(s.m.readFact({ factId: adopted, viewer: ANN }).fact.amount, "1000000", "the figure is never netted");
  assert.equal(JSON.stringify(r).includes("950000"), false);
});

test("R25 basis undetermined is a gap; a trail row beside an open proposal; an attribution set answers no trail rows", () => {
  const s = seeded();
  const f = s.rec({ basis: "undetermined" });
  const proposed = s.rec();
  const t = trail(s, [f]);
  assert.deepEqual(t.row(f).gaps, ["moved", "basis"]);
  s.m.proposeInclusion({ setId: t.set, factId: proposed, method: "same fund code and period", by: MACHINE });
  const r = s.m.readSet({ setId: t.set, viewer: ANN });
  assert.equal(r.proposals[0].fact_id, proposed);
  assert.deepEqual(r.proposals[0].trail.to, { stated: true, party: { entity: s.vendor, as_written: "Harbour Dredging Co" }, grade: null });
  const attr = s.m.createSet({ purpose: "attribution", label: "x", concerns: s.contract, by: ANN }).set_id;
  s.m.include({ setId: attr, factId: f, reason: "r", by: ANN });
  assert.equal("trail" in s.m.readSet({ setId: attr, viewer: ANN }).inclusions[0], false);
});

test("R25 adding evidence never changes a figure: a later event changes what moved answers, never a field of the fact; the read writes nothing", () => {
  const s = seeded();
  const pay = s.event("payment");
  const id = s.rec({ concerns: [pay] });
  const { set, row } = trail(s, [id]);
  const fields = () => { const { adjustments: _a, cited_by: _c, ...f } = s.m.readFact({ factId: id, viewer: ANN }).fact; return f; };
  const before = fields();
  assert.equal(row(id).moved.state, "undetermined");
  const stored = snapshot(s);
  s.m.readSet({ setId: set, viewer: ANN });
  assert.equal(snapshot(s), stored, "the read writes nothing");
  assert.equal(s.ev.attest({ eventId: pay, attestation: { datedFactId: s.datedFact("2014-03-04") }, by: ANN }).ok, true);
  const later = row(id).moved;
  assert.deepEqual([later.state, later.when.value], ["dated", "2014-03-04"]);
  assert.deepEqual(fields(), before, "no field of the fact, its figure among them, changed");
});

test("R25 sight: a viewer who may not see an event or a fact is answered as if it were not held", () => {
  const s = seeded();
  s.project("PROJ-1", "bob");
  const hidden = s.held("INFO-H", sha("hidden"), { project: "PROJ-1" });
  const dfHidden = s.ev.recordDatedFact({ captureSha: hidden, extent: { kind: "document" }, kind: "issued", value: "2014-02-03",
    method: "read by a member", by: BOB }).dated_fact.dated_fact_id;
  const pay = s.ev.createEvent({ kind: "payment", attestations: [{ datedFactId: dfHidden }], by: BOB }).event_id;
  const id = s.rec({ concerns: [pay], by: BOB });
  const { row } = trail(s, [id], { by: BOB });
  assert.equal(row(id, BOB).moved.state, "dated");
  assert.equal(row(id, OUTSIDER).moved.state, "undetermined", "the event the outsider may not see dates nothing for them");
});
