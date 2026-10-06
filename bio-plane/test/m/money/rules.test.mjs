/* money's reads that compute and store no total, at its interface: R10, R11, R14, R15. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, sha, ANN, BOB, OUTSIDER } from "./fixture.mjs";
import { BOUNDS } from "../../../src/connection-grammar/index.mjs";

const factCount = (s) => s.one(`SELECT count(*) AS n FROM money_facts`).n;

test("R10 summable answers ok, with the interfund transfers flagged, when every fact shares kind, phase and stage, basis, currency and period", () => {
  const s = seeded();
  const a = s.rec({ kind: "transfer", from: { fund: s.general }, to: { fund: s.harbour } });
  const b = s.rec({ kind: "transfer" });
  const r = s.m.summable({ factIds: [a, b] });
  assert.equal(r.ok, true);
  assert.deepEqual(r.interfund.map((x) => [x.fact_id, x.from_fund, x.to_fund, x.interfund]), [[a, s.general, s.harbour, true]]);
  assert.equal(["total", "sum", "figure"].some((k) => k in r), false);
});

test("R10 a sum across a differing dimension is refused by name, with calc-grammar's code and two facts that differ on it", () => {
  const s = seeded();
  const base = s.rec();
  const cases = [
    [{ kind: "payment" }, "SUM_MIXED_KIND", "kind"],
    [{ phase: "adopted", stage: null }, "SUM_MIXED_STAGE", "phase"],
    [{ stage: "incurred" }, "SUM_MIXED_STAGE", "stage"],
    [{ basis: "cash" }, "SUM_MIXED_BASIS", "basis"],
    [{ currency: "CAD" }, "SUM_MIXED_CURRENCY", "currency"],
    [{ period: { fiscal: "FY2014-15" } }, "SUM_MIXED_PERIOD", "period"],
    [{ period: { from: "2013-04-01", to: "2015-03-31" } }, "SUM_MIXED_PERIOD", "period"],
  ];
  for (const [over, code, dim] of cases) {
    const other = s.rec(over);
    const r = s.m.summable({ factIds: [base, other] });
    assert.deepEqual([r.ok, r.reason, r.dimension, r.facts], [false, code, dim, [base, other]], code);
    assert.equal(r.values.length, 2);
  }
  assert.equal(s.m.summable({ factIds: [] }).reason, "NO_FACTS");
  assert.equal(s.m.summable({ factIds: [base, "MNY-2026-aaaaaaaaaaaaaaaa"] }).reason, "NO_SUCH_FACT");
});

test("R10 nothing is stored by a summation", () => {
  const s = seeded();
  const a = s.rec(), b = s.rec();
  const before = factCount(s);
  s.m.summable({ factIds: [a, b] });
  assert.equal(factCount(s), before);
});

test("R11 reconcile: 'about $2 million' and '$2,097,431' are consistent within the coarser fact's precision", () => {
  const s = seeded();
  const about = s.rec({ amount: "2000000", as_read: "about $2 million", precision: "approximate" });
  const exact = s.rec({ amount: "2097431", as_read: "$2,097,431" });
  const r = s.m.reconcile({ a: about, b: exact });
  assert.deepEqual([r.consistent, r.amounts, r.differs], [true, "within the coarser fact's precision", []]);
  const same = s.rec({ amount: "2097431", as_read: "2,097,431" });
  assert.equal(s.m.reconcile({ a: exact, b: same }).amounts, "equal");
});

test("R11 reconcile names each dimension that differs, with the values on each side, never a contradiction or a verdict", () => {
  const s = seeded();
  const a = s.rec();
  const b = s.rec({ basis: "cash", period: { fiscal: "FY2014-15" }, kind: "payment", currency: "CAD", to: { entity: s.city } });
  const r = s.m.reconcile({ a, b });
  assert.equal(r.consistent, false);
  assert.deepEqual(r.differs.map((d) => d.dimension), ["basis", "period", "kind", "currency", "parties"]);
  assert.deepEqual(r.differs[0], { dimension: "basis", a: "modified accrual", b: "cash" });
  const stage = s.m.reconcile({ a, b: s.rec({ stage: "incurred" }) });
  assert.deepEqual(stage.differs.map((d) => d.dimension), ["phase or stage"]);
  const rounded = s.m.reconcile({ a, b: s.rec({ amount: "1400000", as_read: "$1.4 million", precision: "rounded" }) });
  assert.deepEqual(rounded.differs.map((d) => d.dimension), ["rounding"]);
  const amount = s.m.reconcile({ a, b: s.rec({ amount: "1250001.00" }) });
  assert.deepEqual(amount.differs, [{ dimension: "amount", a: "1250000.00", b: "1250001.00" }]);
  for (const x of [r, stage, rounded, amount])
    assert.equal(/contradict|verdict|wrong|false|error/i.test(JSON.stringify(x.says) + JSON.stringify(x.differs)), false);
});

/* A contract with its award, a change order amending it, commitments and payments, one attributed by a member. */
function contracted() {
  const s = seeded();
  const award = s.event("award", [s.contract]);
  const change = s.event("other", []);
  s.relate(change, award, "amends");
  const commit = s.rec({ stage: "encumbered", amount: "1000000", as_read: "$1,000,000", concerns: [award] });
  const co = s.rec({ stage: "encumbered", amount: "150000", as_read: "$150,000", concerns: [change] });
  const paid1 = s.rec({ stage: "paid", amount: "600000", as_read: "$600,000", concerns: [s.contract] });
  const paid2 = s.rec({ stage: "paid", amount: "200000", as_read: "$200,000" });
  const set = s.m.createSet({ purpose: "attribution", label: "payments to the dredging contract", concerns: s.contract, by: ANN }).set_id;
  s.m.include({ setId: set, factId: paid2, reason: "the invoice number matches the contract", by: ANN });
  return { ...s, award, change, commit, co, paid1, paid2, set };
}

test("R14 committedAgainstPaid: commitments at the award and its change orders (amends), payments concerning the contract and those attributed by a member, each sum computed and the difference a figure", () => {
  const s = contracted();
  const r = s.m.committedAgainstPaid({ contract: s.contract, viewer: ANN });
  assert.equal(r.ok, true);
  assert.deepEqual(r.committed.facts.map((f) => f.fact_id).sort(), [s.commit, s.co].sort());
  assert.match(r.committed.facts.find((f) => f.fact_id === s.co).label, /change order/);
  assert.deepEqual(r.committed.sum, { value: "1150000", sign: "+", precision: "exact", currency: "USD" });
  assert.deepEqual(r.paid.facts.map((f) => f.fact_id), [s.paid1, s.paid2]);
  assert.match(r.paid.facts[1].label, /^attributed by a member, reason: the invoice number matches the contract$/);
  assert.deepEqual(r.paid.sum, { value: "800000", sign: "+", precision: "exact", currency: "USD" });
  assert.deepEqual(r.difference.figure, { value: "350000", sign: "+", precision: "exact", currency: "USD" });
  assert.equal(/overpaid|unauthori[sz]ed|ledger/i.test(JSON.stringify(r)), false);
  assert.equal(s.one(`SELECT count(*) AS n FROM money_facts`).n, 4, "nothing is stored");
});

test("R14 a side whose sum R10 refuses is answered as that refusal, not a figure; NOT_A_CONTRACT and the as-of date", () => {
  const s = contracted();
  s.rec({ stage: "paid", amount: "5", as_read: "$5", basis: "cash", concerns: [s.contract] });
  const r = s.m.committedAgainstPaid({ contract: s.contract, viewer: ANN });
  assert.equal(r.paid.sum, null);
  assert.equal(r.paid.refused.reason, "SUM_MIXED_BASIS");
  assert.equal(r.difference.undetermined, true);
  assert.equal(s.m.committedAgainstPaid({ contract: s.city, viewer: ANN }).reason, "NOT_A_CONTRACT");
  assert.equal(s.m.committedAgainstPaid({ viewer: ANN }).reason, "NO_ENTITY");
  const t = contracted();
  const before = t.m.committedAgainstPaid({ contract: t.contract, at: "2026-10-06T00:00:01Z", viewer: ANN });
  assert.deepEqual(before.committed.facts.map((f) => f.fact_id).sort(), [t.commit, t.co].sort());
  assert.equal(before.paid.facts.length, 0);
  t.m.withdrawFact({ factId: t.paid1, reason: "duplicate", by: ANN });
  assert.deepEqual(t.m.committedAgainstPaid({ contract: t.contract, viewer: ANN }).paid.facts.map((f) => f.fact_id), [t.paid2]);
});

test("R14 without events wired the committed side is undetermined, never zero", () => {
  const s = seeded({ events: false });
  s.rec({ concerns: [s.contract] });
  const r = s.m.committedAgainstPaid({ contract: s.contract, viewer: ANN });
  assert.equal(r.committed.undetermined, true);
  assert.equal(r.difference.undetermined, true);
  assert.equal(r.paid.facts.length, 1);
});

test("R15 authorityChain walks the authorises relations toward the fact's event, each hop with its citation and grades", () => {
  const s = seeded();
  const pay = s.event("payment");
  const award = s.event("award");
  const approp = s.event("adoption");
  s.relate(award, pay, "authorises");
  s.relate(approp, award, "authorises");
  const id = s.rec({ concerns: [pay] });
  const r = s.m.authorityChain({ factId: id, viewer: ANN });
  assert.equal(r.chains.length, 1);
  assert.deepEqual(r.chains[0].hops.map((h) => [h.from, h.to]), [[award, pay], [approp, award]]);
  for (const h of r.chains[0].hops) {
    assert.ok(h.citation, "each hop carries its relation's attestation");
    assert.equal(typeof h.relation_id, "number");
    assert.equal(h.grade.assertion, "D", "a member's testimony is graded D (events R7)");
    assert.equal(h.grade.ends.length, 2);
  }
  assert.equal(r.chains[0].authorising_held, true);
});

test("R15 where no authorising event is held it says so, never 'unauthorised'; a fact concerning no event; the walk's bounds", () => {
  const s = seeded();
  const pay = s.event("payment");
  const id = s.rec({ concerns: [pay] });
  const r = s.m.authorityChain({ factId: id, viewer: ANN });
  assert.deepEqual([r.chains[0].authorising_held, r.chains[0].says], [false, "no authorising event is held for this event"]);
  assert.equal(/unauthori/i.test(JSON.stringify(r)), false);
  const none = s.m.authorityChain({ factId: s.rec(), viewer: ANN });
  assert.equal(none.chains.length, 0);
  assert.equal(s.m.authorityChain({ factId: "", viewer: ANN }).reason, "NO_FACT");
  // a chain deeper than the walk's depth bound answers truncated and undetermined
  let prev = pay;
  for (let i = 0; i < BOUNDS.depth_default + 2; i++) {
    const e = s.event("adoption");
    s.relate(e, prev, "authorises");
    prev = e;
  }
  const deep = s.m.authorityChain({ factId: id, viewer: ANN }).chains[0];
  assert.deepEqual([deep.truncated, deep.undetermined], [true, true]);
  assert.equal(deep.hops.length, BOUNDS.depth_default);
});

test("R15 a fact the viewer may not see answers found false", () => {
  const s = seeded();
  s.project("PROJ-1", "bob");
  const hidden = s.held("INFO-H", sha("hidden"), { project: "PROJ-1" });
  const id = s.rec({ source: { capture_sha: hidden }, by: BOB });
  assert.equal(s.m.authorityChain({ factId: id, viewer: OUTSIDER }).found, false);
});
