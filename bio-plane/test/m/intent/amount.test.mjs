/* intent's amount filter (T33-58): R31 (a condition's `filter.amount` over the money facts of each matched instance's
   entity, totalled in exact decimals) and R4 (the keys the record evaluates, `entity_kind` and `amount`), over the
   real `money` module (its R9 `moneyOf`, R10 `summable`), with R2's shape, R5's same counts for every reader and R19's
   total never stored. */
import test from "node:test";
import assert from "node:assert/strict";
import { amountShape, AMOUNT_FACTS_MAX } from "../../../src/intent/index.mjs";
import { seeded, V, ZONE } from "./fixture.mjs";

const PERIOD = { from: "2025-07-01", to: "2026-06-30", precision: "day", zone: ZONE };
const condOf = (amount, extra = {}) => ({ progression: "proc", entity: "ENT-1", relation: "member_of",
  filter: { amount }, required: { grade: null, stages: ["need"] }, satisfied: { share: 50 }, ...extra });

/* ENT-1 the condition's entity; ENT-2 … ENT-4 stand in member_of to it; each a contract (a kind a money fact may concern,
   money R1) with its `need` placed. */
async function measured() {
  const w = seeded();
  for (const id of ["ENT-1", "ENT-2", "ENT-3", "ENT-4"]) w.entity(id, "contract");
  for (const id of ["ENT-2", "ENT-3", "ENT-4"]) w.relate(id, "ENT-1", "member_of");
  w.define();
  for (const id of ["ENT-1", "ENT-2", "ENT-3", "ENT-4"]) await w.thread(id, { need: "A" });
  w.set = (c) => {
    const r = w.i.setCondition({ reason: "Measured by the money.", project: w.P, condition: c, author: V("bob"), viewer: V("bob") });
    assert.equal(r.ok, true, JSON.stringify(r));
    return w.i.progress({ project: w.P, viewer: V("bob") });
  };
  return w;
}
const ids = (xs) => xs.map((x) => x.entity_id).sort();
const all = (r) => [...r.instances.meeting, ...r.short, ...r.undetermined];
const row = (r, id) => all(r).find((x) => x.entity_id === id);

test("R31 R4 the amount filter passes an instance whose money facts total within the bounds, inclusive, and excludes one whose total lies outside; the total is answered beside the instance with the facts it rests on", async () => {
  const w = await measured();
  const f1 = w.fact("ENT-1", "400.00"), f2 = w.fact("ENT-1", "600.00");   // 1000.00
  w.fact("ENT-2", "1000.01");                                              // above
  w.fact("ENT-3", "999.99");                                               // below the min of 1000
  w.fact("ENT-4", "1000");                                                 // the bound itself
  const r = w.set(condOf({ min: "1000", max: "1000.00", currency: "USD" }));
  assert.equal(r.matched, 2, "ENT-2 and ENT-3 lie outside the bounds and are excluded, as an entity_kind miss is");
  assert.deepEqual(ids(r.instances.meeting), ["ENT-1", "ENT-4"]);
  assert.equal(r.satisfied, true);
  const a = row(r, "ENT-1").amount;
  assert.equal(a.passes, true);
  assert.deepEqual(a.total, { value: "1000.00", sign: "+", precision: "exact", currency: "USD" });
  assert.deepEqual(a.facts, [f1, f2].sort(), "the facts the total rests on, in moneyOf's order (period, then id)");
  /* a bound alone: max only, min only */
  assert.deepEqual(ids(w.set(condOf({ max: "1000", currency: "USD" })).instances.meeting), ["ENT-1", "ENT-3", "ENT-4"]);
  assert.deepEqual(ids(w.set(condOf({ min: "1000.005", currency: "USD" })).instances.meeting), ["ENT-2"]);
  /* a negative total, signed facts netted */
  w.fact("ENT-2", "2000.02", { sign: "-" });
  assert.equal(row(w.set(condOf({ max: "-1000", currency: "USD" })), "ENT-2").amount.total.value, "1000.01");
  assert.equal(row(w.set(condOf({ max: "-1000", currency: "USD" })), "ENT-2").amount.total.sign, "-");
});

test("R31 the total is taken in exact decimals, never floating point: 0.1 and 0.2 total 0.3, which a bound of 0.3 holds", async () => {
  const w = await measured();
  w.fact("ENT-1", "0.1"); w.fact("ENT-1", "0.2");
  assert.notEqual(0.1 + 0.2, 0.3, "floating point would put it above the bound");
  const r = w.set(condOf({ min: "0.3", max: "0.3", currency: "USD" }, { relation: null }));
  assert.equal(r.matched, 1);
  assert.equal(r.meeting, 1);
  assert.equal(row(r, "ENT-1").amount.total.value, "0.3");
  /* large figures stay exact */
  w.fact("ENT-1", "9007199254740993.01");
  const big = w.set(condOf({ min: "9007199254740993.31", max: "9007199254740993.31", currency: "USD" }, { relation: null }));
  assert.equal(big.meeting, 1);
});

test("R31 the facts read are those moneyOf answers for the instance's entity in the named kinds, phases and period", async () => {
  const w = await measured();
  w.fact("ENT-1", "100");
  w.fact("ENT-1", "5000", { kind: "expenditure" });
  w.fact("ENT-1", "7000", { phase: "adopted", stage: undefined });
  w.fact("ENT-1", "9000", { period: { from: "2024-07-01", to: "2025-06-30", precision: "day", zone: ZONE } });
  const only = (amount) => row(w.set(condOf({ max: "100000", currency: "USD", ...amount }, { relation: null })), "ENT-1").amount;
  const narrowed = only({ kinds: ["payment"], phases: ["actual"], period: PERIOD });
  assert.equal(narrowed.passes, true);
  assert.equal(narrowed.total.value, "100");
  assert.equal(narrowed.facts.length, 1);
  assert.equal(only({ kinds: ["expenditure"] }).total.value, "5000");
  assert.equal(only({ phases: ["adopted"] }).total.value, "7000");
  assert.equal(only({ kinds: ["payment"], phases: ["actual"] }).facts.length, 2, "both payments, the period not named");
  /* a fiscal key, mapped by money through civil-time from the profile's fiscal year (April to March here) */
  const w2 = await measured();
  w2.fact("ENT-1", "300", { period: { fiscal: "FY2025-26" } });
  w2.fact("ENT-1", "50", { period: { fiscal: "FY2023-24" } });
  const fy = row(w2.set(condOf({ max: "1000", currency: "USD", period: { fiscal: "FY2025-26" } }, { relation: null })), "ENT-1").amount;
  assert.equal(fy.total.value, "300");
  assert.equal(fy.facts.length, 1);
});

test("R31 R4 a total summable refuses, a fact whose period is undetermined, a read moneyOf cuts or refuses, a currency other than the filter's, an approximate total, a reading across a bound or no fact held makes the instance undetermined with why: never excluded, never counted as zero", async () => {
  const w = await measured();
  w.fact("ENT-1", "10"); w.fact("ENT-1", "10", { kind: "expenditure" });                        // mixed kind
  w.fact("ENT-2", "10"); w.fact("ENT-2", "10", { period: { from: "2025-07-01", precision: "day", zone: ZONE } }); // no end
  w.fact("ENT-3", "10", { currency: "CAD" });                                                   // another currency
  /* ENT-4 holds no fact */
  const r = w.set(condOf({ max: "1000", currency: "USD", period: PERIOD }));
  assert.equal(r.matched, 4, "nothing is excluded");
  assert.equal(r.meeting, 0);
  assert.equal(r.short.length, 0);
  assert.deepEqual(ids(r.undetermined), ["ENT-1", "ENT-2", "ENT-3", "ENT-4"]);
  assert.equal(r.satisfied, null, "0 meet, but all four could");
  const why = (id) => row(r, id).why;
  assert.match(why("ENT-1"), /SUM_MIXED_KIND/);
  assert.equal(row(r, "ENT-1").amount.code, "SUM_MIXED_KIND");
  assert.match(why("ENT-2"), /period with no end/);
  assert.match(why("ENT-3"), /CAD/);
  assert.match(why("ENT-4"), /holds no money fact.*never taken as zero/);
  for (const id of ["ENT-1", "ENT-2", "ENT-3", "ENT-4"]) {
    assert.equal(row(r, id).amount.passes, null);
    assert.match(why(id), /^the amount filter is undetermined: /);
  }
  assert.equal(row(r, "ENT-4").amount.total, null, "no total, not zero");
  /* a period money cannot read: its refusal, carried */
  const bad = w.set(condOf({ max: "1000", currency: "USD", period: { from: "the spring", zone: ZONE } }, { relation: null }));
  assert.equal(bad.undetermined.length, 1);
  assert.equal(row(bad, "ENT-1").amount.code, "BAD_PERIOD");
});

test("R31 an approximate figure settles nothing; a rounded one or a range is read across its width, settled only when it lies wholly within or wholly outside a bound", async () => {
  const w = await measured();
  w.fact("ENT-1", "500", { precision: "approximate", as_read: "about $500" });
  w.fact("ENT-2", { low: "100", high: "200" }, { precision: "range", as_read: "$100 to $200" });
  w.fact("ENT-3", { low: "100", high: "300" }, { precision: "range", as_read: "$100 to $300" });
  w.fact("ENT-4", "4200000", { precision: "rounded", as_read: "$4.2 million" });
  const r = w.set(condOf({ min: "100", max: "250", currency: "USD" }));
  assert.match(row(r, "ENT-1").why, /approximate/);
  assert.equal(row(r, "ENT-2").amount.passes, true, "[100, 200] lies within [100, 250]");
  assert.deepEqual(row(r, "ENT-2").amount.total, { low: "100", high: "200", sign: "+", precision: "range", currency: "USD" });
  assert.match(row(r, "ENT-3").why, /across a bound/, "[100, 300] straddles 250");
  assert.ok(!all(r).some((x) => x.entity_id === "ENT-4"), "4.2 million lies wholly above 250: excluded");
  /* 4.2 million stands for 4,150,000 to 4,250,000: a max inside that width settles nothing */
  const near = w.set(condOf({ max: "4200000", currency: "USD" }, { entity: "ENT-4", relation: null }));
  assert.match(row(near, "ENT-4").why, /across a bound/);
  assert.equal(w.set(condOf({ max: "4250000", currency: "USD" }, { entity: "ENT-4", relation: null })).meeting, 1);
});

test("R31 a read moneyOf cuts at its bound makes the instance undetermined, never a total of the facts it did answer", async () => {
  const w = await measured();
  for (let n = 0; n <= AMOUNT_FACTS_MAX; n++) w.fact("ENT-1", "1");
  const r = w.set(condOf({ max: "1000000", currency: "USD" }, { relation: null }));
  assert.equal(r.undetermined.length, 1);
  assert.match(row(r, "ENT-1").why, new RegExp(`more than ${AMOUNT_FACTS_MAX} money facts`));
  assert.equal(row(r, "ENT-1").amount.total, null);
});

test("R31 R19 R5 the total is derived on read and never stored: the condition holds the filter only, a read writes nothing, and a new fact moves the answer; every reader's counts are the same, a fact the viewer may not see listed as null", async () => {
  const w = await measured();
  w.fact("ENT-1", "10");
  const hidden = w.project("Sealed ledger", "carol");
  const sealed = w.fact("ENT-1", "15", {}, { bundle: hidden });
  w.join(w.P, "dave");
  const r = w.set(condOf({ max: "20", currency: "USD" }, { relation: null }));
  const oc = w.fm(w.P).objective_condition;
  assert.deepEqual(Object.keys(oc).filter((k) => k.startsWith("amount_")).sort(), ["amount_currency", "amount_max"]);
  assert.ok(!JSON.stringify(oc).includes("25"), "no total is written");
  const bob = w.i.progress({ project: w.P, viewer: V("bob") });
  const alice = w.i.progress({ project: w.P, viewer: V("alice") });
  for (const k of ["matched", "meeting", "satisfied"]) assert.equal(bob[k], alice[k], k);
  assert.equal(r.matched, 0, "10 and 15 total 25, above 20, for every reader");
  const snap = w.snapshot();
  w.i.progress({ project: w.P, viewer: V("bob") });
  assert.deepEqual(w.snapshot(), snap, "a read writes nothing");
  w.money.withdrawFact({ factId: sealed, reason: "a misreading", by: V("carol") });
  const after = w.set(condOf({ max: "20", currency: "USD" }, { relation: null }));
  assert.equal(after.meeting, 1, "the record moved, and the answer with it");
  /* a fact the viewer may not see is null beside the instance */
  const third = w.fact("ENT-1", "5", {}, { bundle: hidden });
  const seen = (who) => row(w.i.progress({ project: w.P, viewer: V(who) }), "ENT-1").amount.facts;
  assert.equal(seen("alice").length, 2);
  assert.ok(seen("alice").includes(third));
  assert.deepEqual(seen("bob").filter((x) => x === null).length, 1);
  assert.ok(!seen("bob").includes(third));
});

test("R2 R31 the amount filter's shape: at least one bound, each an exact decimal, min no higher than max, a currency, money's own kinds and phases and period fields; anything else is CONDITION_UNREADABLE and writes nothing; a set filter reads back unchanged, a raw promotion is held to it", async () => {
  const w = await measured();
  const set = (amount) => w.i.setCondition({ reason: "Measured by the money.", project: w.P, condition: condOf(amount), author: V("bob"), viewer: V("bob") });
  for (const bad of [null, "1000", [], { currency: "USD" }, { max: "10" }, { max: 10.5, currency: "USD" }, { max: "1e3", currency: "USD" },
                     { max: "$10", currency: "USD" }, { min: "5", max: "4", currency: "USD" }, { max: "1", currency: "" },
                     { max: "1", currency: "USD", kinds: ["wages"] }, { max: "1", currency: "USD", kinds: "payment" },
                     { max: "1", currency: "USD", phases: ["final"] }, { max: "1", currency: "USD", period: "FY2025" },
                     { max: "1", currency: "USD", period: { start: "2025" } }, { max: "1", currency: "USD", period: { from: 'a"b' } },
                     { max: "1", currency: "USD", total: "5" }]) {
    const r = set(bad);
    assert.equal(r.reason, "CONDITION_UNREADABLE", JSON.stringify(bad));
    assert.ok(r.check && r.translation);
  }
  assert.equal(w.fm(w.P).objective_condition, undefined, "no refusal wrote anything");
  assert.equal(amountShape({ max: 12, currency: "USD" }).amount.max, "12", "a safe integer is exact");
  const full = { min: "-5.50", max: "1000000.00", currency: "USD", kinds: ["payment", "fee charged"], phases: ["actual"], period: PERIOD };
  const r = set(full);
  assert.equal(r.ok, true);
  assert.deepEqual(r.condition.filter.amount, full);
  assert.deepEqual(w.i.progress({ project: w.P, viewer: V("bob") }).condition.filter.amount, full, "read back unchanged");
  /* an unchanged revision passes; a raw one writing an unreadable amount is refused at the write */
  assert.equal(w.revise(w.P, w.text(w.P).replace("current_state: forming", "current_state: forming"), V("bob")).ok, true);
  const raw = w.text(w.P).replace(/  amount_min: .*\n/, "").replace(/  amount_max: .*\n/, "");
  assert.equal(w.revise(w.P, raw, V("bob")).reason, "CONDITION_UNREADABLE");
  /* another filter key beside it keeps R4's reading: kept, the instance undetermined */
  w.fact("ENT-1", "10");
  const both = w.i.setCondition({ reason: "Measured by the money.", project: w.P, author: V("bob"), viewer: V("bob"),
    condition: condOf({ max: "20", currency: "USD" }, { relation: null, filter: { amount: { max: "20", currency: "USD" }, contract_value: "big" } }) });
  assert.equal(both.ok, true);
  const p = w.i.progress({ project: w.P, viewer: V("bob") });
  assert.equal(p.undetermined.length, 1);
  assert.match(p.undetermined[0].why, /cannot evaluate the filter 'contract_value'/);
  assert.equal(p.undetermined[0].amount.passes, true, "the amount is still answered beside it");
});
