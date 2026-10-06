/* calculations: fact-based analysis, draws and counts over the record (R16–R18, R21). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, world, V, MACHINE, R, saved } from "./fixture.mjs";
import { draw as gDraw, interval } from "../../../src/calc-grammar/index.mjs";

const code = (r) => (r && r.ok === false ? r.reason : "ok");
const PERIOD = { from: "2025-04-01", to: "2027-03-31" };

test("R16 a unit cost is a ratio of a money fact's amount over its buys quantity, with the unit stated; budget against actuals compares an adopted total with an actual total per fiscal period (the profile's), each total within one phase and basis, the bases stated beside the result", async () => {
  const w = seeded();
  const f = w.fact({ amount: "1200", buys: { quantity: "48", unit: "hours" } });
  const uc = await w.c.create({ question: "Cost per hour?", period: PERIOD, kind: "unit_cost", inputs: [{ name: "m", money: [f] }], by: V("bob") });
  assert.equal(uc.ok, true);
  assert.equal(uc.results.output.value.value, "25.000000000000");
  assert.equal(uc.results.output.denominator.value, "48");
  assert.equal(uc.results.unit, "USD per hours", "the unit stated");
  const none = w.fact({ amount: "1200" });
  assert.equal(code(await w.c.create({ question: "Q", period: PERIOD, kind: "unit_cost", inputs: [{ name: "m", money: [none] }], by: V("bob") })), "NO_BUYS");
  /* budget against actuals, per fiscal period (the test profile's fiscal year starts 04-01) */
  const FY = { "2025": { from: "2025-04-01", to: "2026-03-31" }, "2026": { from: "2026-04-01", to: "2027-03-31" } };
  const ad = (amount, fy) => w.fact({ amount, kind: "expenditure", phase: "adopted", stage: undefined, basis: "budgetary", period: FY[fy] });
  const ac = (amount, fy) => w.fact({ amount, kind: "expenditure", phase: "actual", stage: "paid", basis: "modified accrual", period: FY[fy] });
  const adopted = [ad("100", "2025"), ad("50", "2025"), ad("200", "2026")];
  const actual = [ac("120", "2025"), ac("190", "2026")];
  const bva = await w.c.create({ question: "Budget against actuals?", period: PERIOD, kind: "budget_against_actuals",
    inputs: [{ name: "adopted", money: adopted }, { name: "actual", money: actual }], by: V("bob") });
  assert.equal(bva.ok, true, JSON.stringify(bva).slice(0, 300));
  assert.deepEqual(bva.results.periods.map((p) => [p.fiscal_period, p.adopted.value, p.actual.value, p.difference.value, p.difference.sign, p.comparison.relation]),
    [["FY2025-26", "150", "120", "30", "-", "lower"], ["FY2026-27", "200", "190", "10", "-", "lower"]]);
  assert.deepEqual(bva.results.bases, { adopted: ["budgetary"], actual: ["modified accrual"] }, "the bases stated beside the result");
  assert.match(bva.results.bases_says, /budgetary.*modified accrual/);
  assert.equal(code(await w.c.create({ question: "Q", period: PERIOD, kind: "budget_against_actuals", inputs: [{ name: "adopted", money: actual }, { name: "actual", money: actual }], by: V("bob") })), "BUDGET_INPUTS", "each total within one phase");
  const mixed = [...adopted, w.fact({ amount: "1", kind: "expenditure", phase: "adopted", stage: undefined, basis: "cash", period: FY["2025"] })];
  const m = await w.c.create({ question: "Q", period: PERIOD, kind: "budget_against_actuals", inputs: [{ name: "adopted", money: mixed }, { name: "actual", money: actual }], by: V("bob") });
  assert.equal(code(m), "SUM_MIXED_BASIS", "each total within one basis (R12)");
});

test("R17 a ranking orders by one stated, measured quantity and names its quantity, scope and period, cites its inputs, records its method and states what it could not count; several measures composed into one score, a judgment word, or a measure across mixed kinds of link is refused SCORE_NOT_A_FACT", async () => {
  const w = seeded();
  const fields = [{ name: "vendor", type: "string" }, { name: "amount", type: "number", currency: "USD" }, { name: "kind", type: "string" }];
  const t = await w.table("vendor,amount,kind\nAcme,100,award\nBeta,300,award\nAcme,250,award\nGamma,x,award\n", fields);
  const rank = R([{ op: "group", from: "t", by: ["vendor"], measure: { op: "sum", field: "amount" }, as: "g" }, { op: "sort", from: "g", by: "sum", order: "desc", as: "ranked" }], "ranked");
  const terms = { quantity: "dollars awarded", scope: "public works contracts", period: "FY2025-26" };
  const r = await w.c.create({ question: "Who got the most?", terms, period: PERIOD, kind: "ranking", inputs: [{ name: "t", table: t.sha }], recipe: rank, by: V("bob") });
  assert.equal(r.ok, true);
  assert.deepEqual(r.results.output.rows.map((x) => [x.vendor, x.sum.value]), [["Acme", "350"], ["Beta", "300"]], "Gamma's total is undetermined, so it has no place in the order");
  assert.deepEqual(r.results.ranking, { ...terms, could_not_count: r.results.undetermined_rows }, "names its quantity, scope and period, and states what it could not count");
  assert.ok(r.results.counted_apart.some((x) => x.step === "ranked" && x.set_aside.some((s) => s.row === 2)), "Gamma, set aside and stated");
  const read = await w.c.read({ calcId: r.calc_id, viewer: V("carol") });
  assert.deepEqual(read.inputs, [{ name: "t", table: t.sha }], "cites its inputs");
  assert.deepEqual(read.grade.method.recipe, rank, "records its method");
  const g = { question: "Q", period: PERIOD, kind: "ranking", inputs: [{ name: "t", table: t.sha }], recipe: rank, by: V("bob") };
  assert.equal(code(await w.c.create({ ...g, terms: { ...terms, quantity: ["dollars", "contracts"] } })), "SCORE_NOT_A_FACT", "two measures in one score");
  for (const q of ["importance", "suspicion score", "most connected", "significance"])
    assert.equal(code(await w.c.create({ ...g, terms: { ...terms, quantity: q } })), "SCORE_NOT_A_FACT", q);
  assert.equal(code(await w.c.create({ ...g, terms: { quantity: "dollars", scope: "x" } })), "RANKING_TERMS", "the period named");
  assert.equal(code(await w.c.create({ ...g, terms, recipe: R([{ op: "count", from: "t", as: "n" }], "n") })), "NOT_A_RANKING");
  const mixed = await w.table("vendor,amount,kind\nAcme,1,award\nAcme,1,board seat\nBeta,1,award\n", fields);
  const count = R([{ op: "group", from: "t", by: ["vendor"], measure: { op: "count" }, as: "g" }, { op: "sort", from: "g", by: "count", order: "desc", as: "ranked" }], "ranked");
  assert.equal(code(await w.c.create({ ...g, terms: { ...terms, quantity: "links" }, inputs: [{ name: "t", table: mixed.sha }], recipe: count })), "SCORE_NOT_A_FACT", "a measure across mixed kinds of link");
  const one = R([{ op: "select", from: "t", where: [{ field: "kind", test: "eq", value: "award" }], as: "awards" },
    { op: "group", from: "awards", by: ["vendor"], measure: { op: "count" }, as: "g" }, { op: "sort", from: "g", by: "count", order: "desc", as: "ranked" }], "ranked");
  const ok = await w.c.create({ ...g, terms: { ...terms, quantity: "awards held" }, inputs: [{ name: "t", table: mixed.sha }], recipe: one });
  assert.equal(ok.ok, true, "a count of one kind of link is a fact");
  assert.equal(code(await w.c.create({ ...g, terms, recipe: R([{ op: "sort", from: "t", by: "vendor", order: "asc", as: "s" }], "s") })), "SORT_NOT_QUANTITY", "calc-grammar's own refusal of a sort by a string");
});

test("R18 a draw is over a frozen set (a table's sha or a frozen record set), records the seed, the set's sha and the drawn members, and reproduces exactly from them; a population estimate is answered only over a recorded draw with its exact interval, else ESTIMATE_WITHOUT_DRAW", async () => {
  const w = seeded();
  const rows = Array.from({ length: 40 }, (_, i) => `c${i},${i % 3 === 0 ? "B" : "C"}`).join("\n");
  const t = await w.table(`contract,grade\n${rows}\n`, [{ name: "contract", type: "string" }, { name: "grade", type: "string" }]);
  assert.equal(code(w.c.draw({ set: "nope", n: 5, by: V("bob") })), "NO_SET");
  assert.equal(code(w.c.draw({ set: "0".repeat(64), n: 5, by: V("bob") })), "NO_SUCH_SET");
  assert.equal(code(w.c.draw({ set: t.sha, n: 41, seed: "s", by: V("bob") })), "DRAW_TOO_LARGE");
  const d = w.c.draw({ set: t.sha, n: 10, seed: "2026-10-06 bob's seed", by: V("bob") });
  assert.equal(d.ok, true);
  assert.equal(d.seed, "2026-10-06 bob's seed");
  assert.equal(d.set, t.sha);
  const expect = gDraw({ frame: Array.from({ length: 40 }, (_, i) => String(i)), n: 10, seed: "2026-10-06 bob's seed" });
  assert.deepEqual(d.sample, expect.sample, "calc-grammar's draw, reproducible from the set, the seed and the method");
  assert.equal(d.frame_hash, expect.frame_hash);
  assert.equal(w.c.reproduceDraw({ draw: d.draw, viewer: V("carol") }).reproduced, true);
  assert.equal(w.c.draw({ set: t.sha, n: 10, seed: "2026-10-06 bob's seed", by: V("carol") }).already, true, "the same draw is the same record");
  const free = w.c.draw({ set: t.sha, n: 3, by: V("bob") });
  assert.match(free.seed, /^[0-9a-f]{32}$/, "a seed not given is drawn and recorded");
  /* the estimate */
  const count = R([{ op: "select", from: "s", where: [{ field: "grade", test: "eq", value: "B" }], as: "b" }, { op: "count", from: "b", as: "n" }], "n", [{ name: "s", kind: "table" }]);
  const e = await w.c.create({ question: "How many at grade B?", terms: { confidence: "0.95" }, period: PERIOD, kind: "estimate", inputs: [{ name: "s", draw: d.draw }], recipe: count, by: V("bob") });
  assert.equal(e.ok, true);
  const x = Number(e.results.output.value);
  assert.deepEqual({ low: e.results.interval.low, high: e.results.interval.high }, (({ low, high }) => ({ low, high }))(interval({ frame_size: 40, sample_size: 10, successes: x, confidence: "0.95" })), "the exact interval");
  assert.equal(e.results.interval.seed, d.seed);
  const noDraw = await w.c.create({ question: "Q", period: PERIOD, kind: "estimate", inputs: [{ name: "s", table: t.sha }], recipe: count, by: V("bob") });
  assert.equal(code(noDraw), "ESTIMATE_WITHOUT_DRAW");
  /* over a frozen record set */
  const docs = ["one", "two", "three"].map((x) => w.document(x, { title: `Wombat ${x}` }).bundleId);
  const set = await w.c.freezeSet({ query: saved("wombat"), by: V("bob") });
  const ds = w.c.draw({ set: set.set, n: 2, seed: "x", by: V("bob") });
  assert.deepEqual(ds.sample, gDraw({ frame: [...docs].sort(), n: 2, seed: "x" }).sample);
  assert.equal(ds.set_kind, "set");
});

test("R21 freezeSet freezes the ids a saved query answers for the asking member (retrieval.runSaved) as a record set with its sha, so a count over the record is a recipe over a frozen set with its denominator, reproducible from the set", async () => {
  const w = seeded();
  const docs = Array.from({ length: 5 }, (_, i) => w.document(`contract ${i}`, { title: i < 3 ? `Numbat contract graded ${i}` : `Numbat contract ${i}` }).bundleId);
  const P = w.project("Closed", "bob");
  const hidden = w.document("closed contract", { project: P, title: "Numbat contract closed" }).bundleId;
  assert.equal(code(await w.c.freezeSet({ query: saved("numbat"), by: MACHINE })), "MEMBER_ACT_ONLY");
  assert.equal(code(await w.c.freezeSet({ query: null, by: V("bob") })), "NO_QUERY");
  assert.equal(code(await w.c.freezeSet({ query: "numbat", by: V("bob") })), "NOT_YOUR_QUERY", "retrieval's refusal of what is not a saved-query form, passed through");
  const forCarol = await w.c.freezeSet({ query: saved("numbat"), by: V("carol") });
  assert.equal(forCarol.n, 5, "frozen for the asking member, under her sight: the closed project's contract is not hers to see");
  assert.equal(forCarol.ids.includes(hidden), false);
  const all = await w.c.freezeSet({ query: saved("numbat"), by: V("bob") });
  const part = await w.c.freezeSet({ query: saved("graded"), by: V("bob") });
  assert.equal(all.n, 6);
  assert.deepEqual(all.ids, [...docs, hidden].sort());
  assert.equal((await w.c.freezeSet({ query: saved("numbat"), by: V("bob") })).already, true);
  /* a saved query answering more ids than one set holds is refused, so a denominator is never cut */
  const big = world({ construct: false });
  big.member("bob");
  big.c = big.build({ retrieval: { runSaved: () => ({ ok: true, ids: ["x"], total: 10001, truncated: true }) } });
  assert.equal(code(await big.c.freezeSet({ query: saved("x"), by: V("bob") })), "SET_TOO_LARGE");
  /* "3 of 5 contracts": a share over the frozen sets, with its denominator */
  const shareOf = R([{ op: "count", from: "part", as: "n" }, { op: "count", from: "all", as: "d" }, { op: "ratio", numerator: "n", denominator: "d", places: 2, mode: "half_even", as: "r" }], "r",
    [{ name: "all", kind: "table" }, { name: "part", kind: "table" }]);
  const c = await w.c.create({ question: "How many contracts at grade B?", period: { from: "2025-01-01", to: "2025-12-31" }, kind: "ratio",
    inputs: [{ name: "all", set: all.set }, { name: "part", set: part.set }], recipe: shareOf, by: V("bob") });
  assert.equal(c.ok, true);
  assert.deepEqual([c.results.output.numerator.value, c.results.output.denominator.value, c.results.output.value.value], ["3", "6", "0.50"]);
  /* reproducible from the set: the query's answer moving does not move the calculation */
  w.document("contract 9", { title: "Numbat contract graded 9" });
  assert.equal((await w.retrieval.runSaved({ form: saved("graded"), owner: V("bob"), viewer: V("bob") })).ids.length, 4, "the query's answer moved");
  const rc = await w.c.recompute({ calcId: c.calc_id });
  assert.equal(rc.agrees, true);
});
