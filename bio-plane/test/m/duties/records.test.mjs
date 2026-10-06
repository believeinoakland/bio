/* duties: recorded transitions (R13, R14), powers (R15) and money set against restrictions (R17). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, fictionalView, E, BOB, CAROL, MACHINE, ZONE } from "./fixture.mjs";
import { DUTIES_CHECKS, NEVER_SAID, SCHEDULER_STAMP, OCCURRENCE_STATES } from "../../../src/duties/index.mjs";

const row = (r, code) => {
  assert.equal(r.ok, false, `${code}: ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code);
  if (DUTIES_CHECKS[code]) assert.equal(r.check, DUTIES_CHECKS[code].check);
};
const day = (value) => ({ value, precision: "day", zone: ZONE });
const dated = (w, ref, date) => w.declare({ trigger: { kind: "date", date } });

test("R13 recordTransitions appends a transition only where the derived state differs from the last recorded, in slices within budgetMs", () => {
  let ms = 0;
  const w = world({ deps: { clockMs: () => (ms += 10) } });
  const ids = ["2026-01-20", "2026-02-02", "2026-02-12", "2026-02-16"].map((d) => dated(w, d, d).duty_id);
  row(w.duties.recordTransitions({}), "NO_AS_OF");
  /* slices: each call reads at least one duty and stops at the budget, naming its cursor */
  let cursor = null, slices = 0, recorded = 0;
  do {
    const r = w.duties.recordTransitions({ asOf: "2026-02-20T12:00:00Z", budgetMs: 15, cursor });
    assert.ok(r.duties_read >= 1);
    recorded += r.recorded;
    cursor = r.cursor;
    slices++;
  } while (cursor !== null && slices < 10);
  assert.ok(slices > 1, "the budget cut the pass into slices");
  assert.equal(recorded, 4);
  const t = w.duties.transitionsOf({ viewer: BOB }).transitions;
  assert.deepEqual(t.map((x) => [x.duty_id, x.state, x.as_of, x.by]), [
    [ids[0], "overdue", "2026-02-20T12:00:00Z", SCHEDULER_STAMP], [ids[1], "overdue", "2026-02-20T12:00:00Z", SCHEDULER_STAMP],
    [ids[2], "pending", "2026-02-20T12:00:00Z", SCHEDULER_STAMP], [ids[3], "pending", "2026-02-20T12:00:00Z", SCHEDULER_STAMP]]);
  assert.ok(t.every((x) => x.cause && x.evidence && x.evidence.derivation), "each with its cause and evidence");
  /* the same day again: nothing differs, nothing is appended */
  assert.equal(w.duties.recordTransitions({ asOf: "2026-02-20T12:00:00Z", budgetMs: 100000 }).recorded, 0);
  /* a later day: only those whose state moved */
  const later = w.duties.recordTransitions({ asOf: "2026-03-01T12:00:00Z", budgetMs: 100000, by: "class:daemon" });
  assert.equal(later.recorded, 2, "only the two pending occurrences turned overdue");
  assert.equal(w.duties.transitionsOf({ dutyId: ids[0], viewer: BOB }).transitions.map((x) => x.state).join(), "overdue");
  assert.equal(w.duties.transitionsOf({ dutyId: ids[3], viewer: BOB }).transitions.map((x) => x.state).join(), "pending,overdue");
  assert.equal(w.duties.transitionsOf({ dutyId: ids[3], viewer: BOB }).transitions[1].by, "class:daemon");
  /* an occurrence whose trigger lies after the day asked is not yet an occurrence */
  const future = dated(w, "f", "2026-03-20").duty_id;
  w.duties.recordTransitions({ asOf: "2026-03-01T12:00:00Z", budgetMs: 100000 });
  assert.equal(w.duties.transitionsOf({ dutyId: future, viewer: BOB }).count, 0);
});

test("R13 recordTransition: a member's own recording, refusing UNKNOWN_STATE and NO_CAUSE", () => {
  const w = world();
  const a = dated(w, "x", "2026-02-02");
  const key = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: "2026-03-02T00:00:00Z", viewer: BOB }).occurrences[0].key;
  const rec = (over) => w.duties.recordTransition({ dutyId: a.duty_id, occurrenceKey: key, state: "met", asOf: "2026-03-01T00:00:00Z",
                                                   cause: "the clerk's letter of 10 February", by: BOB, ...over });
  row(rec({ by: MACHINE }), "MEMBER_ACT_ONLY");
  row(rec({ state: "breached" }), "UNKNOWN_STATE");
  row(rec({ cause: " " }), "NO_CAUSE");
  row(rec({ occurrenceKey: "OCC-nope" }), "NO_SUCH_OCCURRENCE");
  row(rec({ dutyId: "DUT-2026-0050" }), "NO_SUCH_DUTY");
  for (const state of OCCURRENCE_STATES) assert.equal(rec({ state }).ok, true, state);
  assert.equal(w.duties.transitionsOf({ occurrenceKey: key, viewer: BOB }).count, OCCURRENCE_STATES.length);
});

test("R14 a recorded transition is never rewritten: 'overdue as known on 30 March' stays readable beside the current derivation", () => {
  const w = world();
  w.event({ value: day("2026-03-16"), concerns: [E.clerk] });
  const resp = w.event({ value: day("2026-03-27"), concerns: [E.group] });
  const a = w.declare({ trigger: { kind: "event", event_kind: "communication", entity: E.clerk } });
  w.at("2026-03-30T12:00:00.000Z");
  w.duties.recordTransitions({ asOf: "2026-03-30T12:00:00Z", budgetMs: 100000 });
  const recorded = w.duties.transitionsOf({ dutyId: a.duty_id, viewer: BOB }).transitions;
  assert.deepEqual(recorded.map((t) => [t.state, t.as_of]), [["overdue", "2026-03-30T12:00:00Z"]]);
  /* a later capture shows the response came earlier; a member matches it; the profile's rule changes */
  const key = recorded[0].occurrence_key;
  w.at("2026-04-02T12:00:00.000Z");
  w.duties.matchEvent({ dutyId: a.duty_id, occurrenceKey: key, eventId: resp, reason: "a later capture of the letter", by: BOB });
  w.setView(fictionalView({ deadlines: fictionalView().deadlines.map((d) => (d.rule === "records_response" ? { ...d, amount: 14 } : d)) }));
  w.duties.recordTransitions({ asOf: "2026-04-02T12:00:00Z", budgetMs: 100000 });
  const now = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: "2026-04-02T12:00:00Z", viewer: BOB }).occurrences[0];
  assert.equal(now.state, "met");
  assert.deepEqual(now.transitions.map((t) => [t.state, t.as_of]), [["overdue", "2026-03-30T12:00:00Z"], ["met", "2026-04-02T12:00:00Z"]],
    "the earlier record stands, read beside the current derivation");
  /* in order of `at` */
  const all = w.duties.transitionsOf({ dutyId: a.duty_id, viewer: BOB }).transitions;
  assert.deepEqual(all.map((t) => t.at), [...all.map((t) => t.at)].sort());
  /* the store refuses any update or delete of a transition (R21's gate), and the module has no such path */
  const gate = w.record.storeGate("duties", "duty_transitions", { table: "duty_transitions", state: "met" }, "update");
  row(gate, "APPEND_ONLY");
  row(w.record.storeGate("duties", "duty_transitions", { table: "duty_transitions" }, "delete"), "APPEND_ONLY");
  assert.equal(w.sqlRows(`SELECT state FROM duty_transitions WHERE seq=1`)[0].state, "overdue");
});

test("R15 powersOf answers the powers in force with their instruments and delegations, undetermined ones apart; never whether an act was within one", () => {
  const w = world();
  const charter = w.standard({ cite: "Test Code § 502", portion: "s502" });
  const old = w.standard({ cite: "Test Code § 11", portion: null, period: { from: "2000-01-01", to: "2020-12-31" } });
  const open = w.standard({ cite: "Test Code § 12", portion: null, period: { from: "2010-01-01", to: null } });
  const delegation = w.standard({ cite: "Test Code § 13", portion: null });
  const power = (source, over = {}) => w.declare({ modality: "power", obligee: null, performance: { act: "approve contracts under the limit" },
                                                  source, time: { basis: "window" }, ...over });
  const p1 = power({ kind: "standard", standard: charter, portion: "s502" }, { delegation: { kind: "standard", standard: delegation } });
  power({ kind: "standard", standard: old });
  const p3 = power({ kind: "standard", standard: open });
  w.declare({ obligor: E.clerk });
  row(w.duties.powersOf({ office: E.council, viewer: BOB }), "NOT_AN_OFFICE");
  assert.equal(w.duties.powersOf({ office: "ENT-2026-0099", viewer: BOB }).reason, "NO_SUCH_ENTITY");
  const r = w.duties.powersOf({ office: E.clerk, at: "2026-03-01", viewer: BOB });
  assert.deepEqual(r.powers.map((p) => p.duty_id), [p1.duty_id]);
  assert.deepEqual(r.powers[0].instrument, { kind: "standard", standard: charter, portion: "s502",
                                             cite: "Test Code § 502", instrument: "/eli/xx-port-ellery/tc/502" });
  assert.equal(r.powers[0].delegation.standard, delegation);
  assert.deepEqual(r.undetermined.map((p) => p.duty_id), [p3.duty_id]);
  assert.match(r.undetermined[0].why, /does not state when it ceased to be in force/);
  const text = JSON.stringify(r).toLowerCase();
  for (const word of NEVER_SAID) assert.ok(!text.includes(word), word);
  assert.match(r.says, /a member's determination/);
  /* the obligation that is not a power is not answered */
  assert.equal(r.powers.length + r.undetermined.length, 2);
});

test("R17 setAgainst answers the money facts in scope and period, each compared to the cited term as a computed fact and a question", () => {
  const w = world();
  const F = {
    cap: w.fact({ amount: "100000.00", from: { entity: E.council } }),
    pay1: w.fact({ amount: "40000.00" }),
    pay2: w.fact({ amount: "150000.00" }),
    pay3: w.fact({ amount: "100000.00" }),
    about: w.fact({ amount: "100000", precision: "approximate" }),
    range: w.fact({ precision: "range", low: "90000.00", high: "110000.00" }),
    other: w.fact({ amount: "1.00", from: { entity: E.private } }),
  };
  const mny = (k) => F[k];
  const proh = w.declare({ modality: "prohibition", performance: { act: "spend no more from the fund than appropriated", money_facts: [mny("cap")],
                                                                 scope: { funds: [E.fund] } }, time: { basis: "window" } });
  const plain = w.declare({});
  row(w.duties.setAgainst({ dutyId: plain.duty_id, viewer: BOB }), "NOT_A_SET_AGAINST");
  row(w.duties.setAgainst({ dutyId: "DUT-2026-0042", viewer: BOB }), "NO_SUCH_DUTY");
  const r = w.duties.setAgainst({ dutyId: proh.duty_id, period: { from: "2026-01-01", to: "2026-12-31" }, viewer: BOB });
  assert.equal(r.ok, true);
  const rel = Object.fromEntries(r.items.map((i) => [i.fact, i.comparison]));
  assert.deepEqual(rel[mny("pay1")], { relation: "lower", label: "computed fact" });
  assert.deepEqual(rel[mny("pay2")], { relation: "higher", label: "computed fact" });
  assert.deepEqual(rel[mny("pay3")], { relation: "equal", label: "computed fact" });
  assert.equal(rel[mny("about")].relation, "undetermined");
  assert.equal(rel[mny("range")].relation, "undetermined", "a range straddling the term settles nothing");
  assert.ok(!(mny("other") in rel), "a fact outside the scope is not set against it");
  assert.ok(!(mny("cap") in rel), "the term is not set against itself");
  assert.ok(r.items.every((i) => /never a finding/.test(i.question)));
  const text = JSON.stringify(r).toLowerCase();
  for (const word of NEVER_SAID) assert.ok(!text.includes(word), word);
  /* a threshold duty is set against as a prohibition is */
  const thr = w.declare({ performance: { act: "report any award over the threshold", threshold: true, money_facts: [mny("cap")], scope: { funds: [E.fund] } } });
  assert.equal(w.duties.setAgainst({ dutyId: thr.duty_id, viewer: BOB }).items.length, 5);
});
