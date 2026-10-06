/* calculations: creating, evaluating, accepting, recomputing and reading a calculation (R4–R11). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, R } from "./fixture.mjs";
import { resultKey, METHOD } from "../../../src/calc-grammar/index.mjs";
import { INPUT_CHANGED, RECOMPUTE_STATES } from "../../../src/calculations/index.mjs";

const code = (r) => (r && r.ok === false ? r.reason : "ok");
const F = [{ name: "dept", type: "string" }, { name: "amount", type: "number", currency: "USD" }, { name: "status", type: "string" }];
const CSV = "dept,amount,status\nparks,100,awarded\nroads,250,awarded\nparks,50,pending\nroads,x,awarded\n";
const PERIOD = { from: "2025-07-01", to: "2026-06-30" };
const SUM = R([{ op: "sum", from: "t", field: "amount", as: "total" }], "total");
const calcRows = (w) => ["calculations", "calc_inputs", "calc_recomputes"].map((t) => w.count(t));

async function base(w) {
  const t = await w.table(CSV, F);
  const good = { question: "How much was awarded?", terms: { amount: "dollars awarded" }, period: PERIOD, kind: "total",
    inputs: [{ name: "t", table: t.sha }], recipe: SUM, project: null, by: V("bob") };
  return { t, good };
}

test("R4 create's refusals in order, each with a negative control: NO_QUESTION, NO_PERIOD, NO_INPUTS, NO_SUCH_INPUT naming it, HYPOTHESIS_NOT_A_FACT (an input or a threshold naming a hypothesis id), then calc-grammar's refusal of the recipe by name; a refusal writes nothing", async () => {
  const w = seeded();
  const { good } = await base(w);
  const before = calcRows(w);
  assert.equal(code(await w.c.create({ ...good, question: "  " })), "NO_QUESTION");
  for (const period of [null, {}, { from: null, to: null }, { from: "2025-02-30" }, { from: "2026-01-01", to: "2025-01-01" }, ""])
    assert.equal(code(await w.c.create({ ...good, period })), "NO_PERIOD", JSON.stringify(period));
  for (const inputs of [null, [], "t"]) assert.equal(code(await w.c.create({ ...good, inputs })), "NO_INPUTS", JSON.stringify(inputs));
  const missing = await w.c.create({ ...good, inputs: [{ name: "t", table: "0".repeat(64) }] });
  assert.equal(code(missing), "NO_SUCH_INPUT");
  assert.equal(missing.input, "t", "names the input");
  assert.equal(missing.ref, "0".repeat(64));
  assert.equal(code(await w.c.create({ ...good, inputs: [{ name: "t", money: ["MNY-2026-aaaaaaaaaaaaaaaa"] }] })), "NO_SUCH_INPUT", "a money fact not held");
  assert.equal(code(await w.c.create({ ...good, inputs: [{ name: "t", calculation: "CALC-2026-9999" }] })), "NO_SUCH_INPUT");
  /* NO_SUCH_INPUT before HYPOTHESIS_NOT_A_FACT, and the hypothesis before the recipe */
  const hyp = "HYP-2026-0001";
  assert.equal(code(await w.c.create({ ...good, inputs: [...good.inputs, { name: "h", calculation: hyp }, { name: "z", table: "1".repeat(64) }] })), "NO_SUCH_INPUT");
  const h = await w.c.create({ ...good, inputs: [...good.inputs, { name: "h", calculation: hyp }], recipe: { not: "a recipe" } });
  assert.equal(code(h), "HYPOTHESIS_NOT_A_FACT");
  assert.equal(h.hypothesis, hyp);
  assert.equal(code(await w.c.create({ ...good, threshold: { value: "100", note: hyp }, recipe: { not: "a recipe" } })), "HYPOTHESIS_NOT_A_FACT", "a threshold naming a hypothesis");
  assert.equal(code(await w.c.create({ ...good, recipe: { not: "a recipe" } })), "RECIPE_INVALID", "calc-grammar's refusal, by name");
  assert.equal(code(await w.c.create({ ...good, recipe: { ...SUM, method: "bio-calc/9" } })), "METHOD_UNKNOWN");
  assert.equal(code(await w.c.create({ ...good, recipe: R([{ op: "sum", from: "u", field: "amount", as: "total" }], "total") })), "NAME_UNDEFINED");
  assert.deepEqual(calcRows(w), before, "no refusal wrote a row");
  const ok = await w.c.create(good);
  assert.equal(ok.ok, true, "the negative control");
  assert.match(ok.calc_id, /^CALC-2026-\d{4,}$/);
});

test("R4 create records the calculation with its question, terms, period, inputs, recipe, kind, method version, method note and project, evaluated through calc-grammar and stored under calc-grammar.resultKey", async () => {
  const w = seeded();
  const { t, good } = await base(w);
  const P = w.project("Budget", "bob");
  const r = await w.c.create({ ...good, project: P, methodNote: "awarded and pending alike" });
  assert.equal(r.ok, true);
  assert.equal(r.result_key, resultKey(SUM, { t: t.sha }), "the key is sha(recipe, inputs, method version)");
  assert.equal(r.method_version, METHOD);
  const read = await w.c.read({ calcId: r.calc_id, viewer: V("bob") });
  assert.equal(read.found, true);
  for (const [k, v] of Object.entries({ question: good.question, terms: good.terms, period: PERIOD, kind: "total", recipe: undefined,
    project: P, method_version: METHOD, method_note: "awarded and pending alike", result_key: r.result_key }))
    if (v !== undefined) assert.deepEqual(read[k], v, k);
  assert.deepEqual(read.inputs, good.inputs);
  assert.deepEqual(read.grade.method.recipe, SUM);
  assert.equal(read.results.output.undetermined, true, "one amount reads as no figure, so the total is undetermined");
  assert.deepEqual(read.calculation, { calc_id: r.calc_id, question: good.question, period: PERIOD, recipe: SUM, method_version: METHOD,
    result_key: r.result_key, inputs: [{ name: "t", kind: "table", sha: t.sha }], results: { total: read.results.output } }, "the shape workbooks reads (K1563 (6))");
  const fig = w.passage("$12");
  const withFig = await w.c.create({ ...good, kind: "difference", inputs: [...good.inputs, { name: "k", figure: fig }],
    recipe: R([{ op: "sum", from: "t", field: "amount", as: "s" }, { op: "round", of: "k", places: 0, mode: "half_even", as: "k0" }], "k0", [{ name: "t", kind: "table" }, { name: "k", kind: "figure" }]) });
  const rf = await w.c.read({ calcId: withFig.calc_id, viewer: V("bob") });
  assert.deepEqual(rf.calculation.inputs[1], { name: "k", kind: "figure", figure: { value: "12", sign: "+", precision: "exact", currency: "USD" }, content_id: fig });
  assert.deepEqual(Object.keys(rf.calculation.results), ["s", "k0"]);
  const n = w.rows(`SELECT * FROM calc_inputs WHERE calc_id=?`, r.calc_id);
  assert.deepEqual(n.map((x) => [x.input_name, x.input_kind, x.ref]), [["t", "table", t.sha]]);
  assert.equal(code(await w.c.create({ ...good, project: "PROJ-2026-0099-none" })), "NO_SUCH_PROJECT");
  assert.equal(code(await w.c.create({ ...good, kind: "verdict" })), "UNKNOWN_KIND");
});

test("R5 every share or ratio carries its denominator; a compare is labelled a computed fact and never breach or violation; values that could not be counted (an undetermined cell, an input out of view) are counted apart and stated, never as zero", async () => {
  const w = seeded();
  const { t, good } = await base(w);
  const share = await w.c.create({ ...good, kind: "share", recipe: R([
    { op: "select", from: "t", where: [{ field: "status", test: "eq", value: "awarded" }], as: "awarded" },
    { op: "share", part: "awarded", whole: "t", as: "share" }], "share") });
  assert.deepEqual(share.results.output.denominator, { value: "4", sign: "+", precision: "exact" }, "the share states its denominator");
  assert.deepEqual(share.results.output.numerator, { value: "3", sign: "+", precision: "exact" });
  const ratio = await w.c.create({ ...good, kind: "ratio", inputs: [{ name: "a", value: "300" }, { name: "b", value: "1,200" }],
    recipe: R([{ op: "ratio", numerator: "a", denominator: "b", as: "r" }], "r", [{ name: "a", kind: "figure" }, { name: "b", kind: "figure" }]) });
  assert.equal(ratio.results.output.denominator.value, "1200");
  assert.equal(ratio.results.output.value.value, "0.250000000000");
  const cmp = await w.c.create({ ...good, kind: "comparison", inputs: [{ name: "a", value: "300" }, { name: "b", value: "250" }],
    recipe: R([{ op: "compare", a: "a", b: "b", as: "c" }], "c", [{ name: "a", kind: "figure" }, { name: "b", kind: "figure" }]) });
  assert.equal(cmp.results.output.relation, "higher");
  assert.equal(cmp.results.output.label, "computed fact");
  assert.equal(cmp.results.label, "computed fact");
  assert.doesNotMatch(JSON.stringify(cmp), /breach|violation/i);
  const sel = await w.c.create({ ...good, kind: "total", recipe: R([
    { op: "select", from: "t", where: [{ field: "amount", test: "gt", value: 60 }], as: "big" }, { op: "count", from: "big", as: "n" }], "n") });
  assert.equal(sel.results.output.value, "2");
  assert.equal(sel.results.undetermined_rows, 1);
  assert.deepEqual(sel.results.counted_apart.map((x) => [x.step, x.rows]), [["big", 1]], "the undetermined cell is counted apart");
  assert.match(sel.results.says, /counted apart/);
  /* an input out of view at evaluation: members of a frozen set the evaluator may not see */
  const P = w.project("Closed", "alice");
  const seen = w.document("seen doc"), hidden = w.document("hidden doc", { project: P });
  w.retrieval.saved.set("contracts", { owner: V("alice"), ids: [seen.bundleId, hidden.bundleId] });
  const set = await w.c.freezeSet({ query: "contracts", by: V("alice") });
  const n = await w.c.evaluate({ inputs: [{ name: "s", set: set.set }], recipe: R([{ op: "count", from: "s", as: "n" }], "n", [{ name: "s", kind: "table" }]), viewer: V("carol") });
  assert.equal(n.results.output.value, "1");
  assert.deepEqual(n.results.out_of_view.map((o) => o.count), [1], "one member out of view, stated, never as zero");
});

test("R6 a threshold is a value or a held standard cited at its version; a standard not in force for the calculation's period is refused THRESHOLD_NOT_IN_FORCE, or stated undetermined with the reason", async () => {
  const w = seeded();
  const { good } = await base(w);
  const cmp = R([{ op: "sum", from: "t", field: "amount", as: "s" }, { op: "compare", a: "s", b: "threshold", as: "c" }], "c",
    [{ name: "t", kind: "table" }, { name: "threshold", kind: "figure" }]);
  const t2 = await w.table("dept,amount,status\nparks,100,awarded\n", F);
  const g = { ...good, kind: "comparison", inputs: [{ name: "t", table: t2.sha }], recipe: cmp };
  const byValue = await w.c.create({ ...g, threshold: { value: "$150" } });
  assert.equal(byValue.results.output.relation, "lower");
  w.standards.periods.set("STD-2020-0001-x", { from: "2020-01-01", to: "2030-12-31" });
  w.standards.periods.set("STD-2020-0002-x", { from: "2026-01-01", to: "2030-12-31" });
  w.standards.periods.set("STD-2020-0003-x", { from: "2020-01-01", to: null });
  const fig = w.passage("$150");
  const inForce = await w.c.create({ ...g, threshold: { standard: "STD-2020-0001-x", figure: fig } });
  assert.equal(inForce.ok, true);
  assert.equal((await w.c.read({ calcId: inForce.calc_id, viewer: V("bob") })).threshold.standing.state, "in_force");
  const notIn = await w.c.create({ ...g, threshold: { standard: "STD-2020-0002-x", figure: fig } });
  assert.equal(code(notIn), "THRESHOLD_NOT_IN_FORCE");
  assert.equal(notIn.standard, "STD-2020-0002-x");
  const open = await w.c.create({ ...g, threshold: { standard: "STD-2020-0003-x", figure: fig } });
  assert.equal(open.ok, true);
  const st = (await w.c.read({ calcId: open.calc_id, viewer: V("bob") })).threshold.standing;
  assert.equal(st.state, "undetermined", "stated undetermined with the reason");
  assert.ok(st.why);
  assert.equal(code(await w.c.create({ ...g, threshold: { standard: "STD-2020-0001-x" } })), "BAD_THRESHOLD", "a threshold states its figure");
});

test("R7 evaluate answers what create would store and writes nothing", async () => {
  const w = seeded();
  const { good } = await base(w);
  const before = w.snapshot();
  const e = await w.c.evaluate({ recipe: good.recipe, inputs: good.inputs, viewer: V("bob") });
  assert.equal(e.ok, true);
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const c = await w.c.create(good);
  assert.equal(e.result_key, c.result_key);
  assert.deepEqual(e.results, c.results);
  const refused = await w.c.evaluate({ recipe: { op: "eval" }, inputs: good.inputs, viewer: V("bob") });
  assert.equal(code(refused), "RECIPE_INVALID");
  assert.equal(code(await w.c.evaluate({ recipe: good.recipe, inputs: good.inputs })), "NO_VIEWER");
});

test("R8 results are recomputed at accept and by recompute, never on a read: read answers the stored results with computed_at and the method version; accept is refused CALC_RECOMPUTE_DIFFERS naming the differing result when a stored result was tampered; recompute answers {agrees, results} and writes only the recompute status", async () => {
  const w = seeded();
  const t = await w.table("dept,amount,status\nparks,100,awarded\nroads,250,awarded\n", F);
  const c = await w.c.create({ question: "Total?", period: PERIOD, kind: "total", inputs: [{ name: "t", table: t.sha }], recipe: SUM, by: V("bob") });
  assert.equal(c.results.output.value, "350");
  assert.ok(RECOMPUTE_STATES.includes(c.recompute_status));
  /* a tampered stored result: the read answers what is stored (no recompute on a read) */
  const stored = JSON.parse(w.rows(`SELECT results_json FROM calculations WHERE calc_id=?`, c.calc_id)[0].results_json);
  stored.output.value = "999";
  w.st.sql.exec(`UPDATE calculations SET results_json=? WHERE calc_id=?`, JSON.stringify(stored), c.calc_id);
  const read = await w.c.read({ calcId: c.calc_id, viewer: V("carol") });
  assert.equal(read.results.output.value, "999", "the read never recomputes");
  assert.equal(read.computed_at, "2026-10-06T01:00:00.000Z");
  assert.equal(read.method_version, METHOD);
  const before = w.snapshot();
  const rc = await w.c.recompute({ calcId: c.calc_id });
  assert.equal(rc.agrees, false);
  assert.equal(rc.results.output.value, "350");
  assert.equal(rc.differing.path, "results.output.value");
  const after = w.snapshot();
  for (const k of Object.keys(after)) if (k !== "calculations" && k !== "calc_recomputes") assert.deepEqual(after[k], before[k], k);
  const changed = Object.keys(after.calculations[0]).filter((k) => JSON.stringify(after.calculations[0][k]) !== JSON.stringify(before.calculations[0][k]));
  assert.deepEqual(changed.sort(), ["recompute_json", "recompute_status"], "recompute writes only the recompute status");
  assert.equal(after.calculations[0].recompute_status, "differs");
  const acc = await w.c.accept({ calcId: c.calc_id, by: V("carol") });
  assert.equal(code(acc), "CALC_RECOMPUTE_DIFFERS");
  assert.equal(acc.differing.path, "results.output.value", "names the differing result");
  assert.equal(w.rows(`SELECT accepted_by FROM calculations WHERE calc_id=?`, c.calc_id)[0].accepted_by, null);
  /* the untampered one agrees and is accepted, once */
  const d = await w.c.create({ question: "Total again?", period: PERIOD, kind: "total", inputs: [{ name: "t", table: t.sha }], recipe: SUM, by: V("bob") });
  assert.equal(code(await w.c.accept({ calcId: d.calc_id, by: MACHINE })), "MEMBER_ACT_ONLY");
  const ok = await w.c.accept({ calcId: d.calc_id, by: V("carol") });
  assert.equal(ok.ok, true);
  assert.equal(ok.recompute_status, "agrees");
  assert.equal((await w.c.accept({ calcId: d.calc_id, by: V("carol") })).already, true);
  const r2 = await w.c.recompute({ calcId: d.calc_id });
  assert.equal(r2.agrees, true);
  assert.equal(code(await w.c.recompute({ calcId: "CALC-2026-7777" })), "NO_SUCH_CALCULATION");
});

test("R9 read answers the grade facts: per input its capture grade capped by its derivation; the calculation's capture axis is the weakest; recipe arithmetic is not a weakening step; an unbound input is testimony (D); the method is disclosed, not graded", async () => {
  const w = seeded();
  const t = await w.table("dept,amount,status\nparks,100,awarded\n", F);
  const two = R([{ op: "sum", from: "t", field: "amount", as: "s" }, { op: "difference", a: "s", b: "k", as: "d" }], "d",
    [{ name: "t", kind: "table" }, { name: "k", kind: "figure" }]);
  const fig = w.passage("$40");
  const c = await w.c.create({ question: "Q", period: PERIOD, kind: "difference", inputs: [{ name: "t", table: t.sha }, { name: "k", figure: fig }], recipe: two, by: V("bob") });
  let g = (await w.c.read({ calcId: c.calc_id, viewer: V("bob") })).grade;
  assert.deepEqual(g.inputs.map((i) => [i.name, i.grade]), [["t", "B"], ["k", "B"]], "each a direct capture: B");
  assert.equal(g.capture.grade, "B", "arithmetic over two B inputs is not weaker than B");
  assert.match(g.capture.why, /not a weakening step/);
  assert.deepEqual({ disclosed: g.method.disclosed, graded: g.method.graded }, { disclosed: true, graded: false });
  /* capped by its derivation */
  w.st.sql.exec(`UPDATE content SET derivation_cap='C' WHERE content_id=?`, fig);
  g = (await w.c.read({ calcId: c.calc_id, viewer: V("bob") })).grade;
  assert.equal(g.inputs.find((i) => i.name === "k").grade, "C");
  assert.equal(g.capture.grade, "C", "the weakest input");
  /* an unbound input is testimony */
  const u = await w.c.create({ question: "Q", period: PERIOD, kind: "difference", inputs: [{ name: "t", table: t.sha }, { name: "k", value: "$40" }], recipe: two, by: V("bob") });
  g = (await w.c.read({ calcId: u.calc_id, viewer: V("bob") })).grade;
  assert.equal(g.inputs.find((i) => i.name === "k").grade, "D");
  assert.equal(g.capture.grade, "D");
  /* a capture with no fetch route earns no letter: undetermined, stated */
  const notFetched = await w.c.declareTable({ source: w.csv("dept,amount,status\nx,1,y\n", { direct: false }), schema: { fields: F }, header: F.map((f) => f.name), by: V("bob") });
  const n = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "t", table: notFetched.sha }], recipe: SUM, by: V("bob") });
  g = (await w.c.read({ calcId: n.calc_id, viewer: V("bob") })).grade;
  assert.equal(g.capture.grade, null);
  assert.match(g.capture.why, /undetermined/);
});

test("R10 a calculation any of whose inputs the viewer may not see is withheld whole: every read answers it exactly as an absent one (DEC-36, DEC-85)", async () => {
  const w = seeded();
  const P = w.project("Closed", "alice");
  const hidden = await w.table("dept,amount,status\nparks,7,awarded\n", F, { by: V("alice") }, { project: P });
  const open = await w.table("dept,amount,status\nparks,9,awarded\n", F);
  const recipe = R([{ op: "sum", from: "t", field: "amount", as: "s" }, { op: "sum", from: "u", field: "amount", as: "s2" }, { op: "difference", a: "s", b: "s2", as: "d" }], "d",
    [{ name: "t", kind: "table" }, { name: "u", kind: "table" }]);
  const c = await w.c.create({ question: "Q", period: PERIOD, kind: "difference", inputs: [{ name: "t", table: open.sha }, { name: "u", table: hidden.sha }], recipe, by: V("alice") });
  assert.equal(c.ok, true);
  assert.equal((await w.c.read({ calcId: c.calc_id, viewer: V("alice") })).found, true);
  const withheld = await w.c.read({ calcId: c.calc_id, viewer: V("carol") });
  const absent = await w.c.read({ calcId: "CALC-2026-4242", viewer: V("carol") });
  assert.deepEqual({ ...withheld, calc_id: null }, { ...absent, calc_id: null }, "exactly as an absent one");
  assert.equal(code(await w.c.accept({ calcId: c.calc_id, by: V("carol") })), "NO_SUCH_CALCULATION");
  assert.equal(code(await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "x", calculation: c.calc_id }],
    recipe: R([{ op: "round", of: "x", places: 0, mode: "half_even", as: "r" }], "r", [{ name: "x", kind: "figure" }]), by: V("carol") })), "NO_SUCH_INPUT", "nor is it an input to another's calculation");
  /* a hidden money fact withholds it too */
  const f = w.money.add({ amount: "10", visibleTo: [V("bob")] });
  const m = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "t", money: [f] }], recipe: SUM, by: V("bob") });
  assert.equal(m.ok, true);
  assert.equal((await w.c.read({ calcId: m.calc_id, viewer: V("bob") })).found, true);
  assert.equal((await w.c.read({ calcId: m.calc_id, viewer: V("carol") })).found, false);
  assert.equal((await w.c.read({ calcId: m.calc_id, viewer: null })).found, false, "no viewer sees nothing");
});

test("R11 onInputChanged takes one registration per module (membership's listenerRefusal); when a money fact a held calculation names changes, or a table vintage it names is superseded, its recompute status becomes stale and each listener is told once with {calcId, input, cause: calculation_input_changed}; nothing is recomputed by itself", async () => {
  const w = seeded();
  assert.equal(code(w.c.onInputChanged("", () => {})), "LISTENER_MALFORMED");
  assert.equal(code(w.c.onInputChanged("reevaluation", "fn")), "LISTENER_MALFORMED");
  const told = [], told2 = [];
  assert.equal(w.c.onInputChanged("reevaluation", (e) => told.push(e)).ok, true);
  assert.equal(code(w.c.onInputChanged("reevaluation", () => {})), "LISTENER_DECLARED");
  w.c.onInputChanged("intent", (e) => told2.push(e));
  assert.equal(w.money.listeners.map((l) => l.module).join(), "calculations", "registered with money at start");
  const f = w.money.add({ amount: "10" }), g2 = w.money.add({ amount: "15" });
  const c = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "t", money: [f, g2] }], recipe: SUM, by: V("bob") });
  assert.equal(c.results.output.value, "25");
  const results = w.rows(`SELECT results_json FROM calculations WHERE calc_id=?`, c.calc_id)[0].results_json;
  w.money.change(f, "withdrawn", (x) => { x.withdrawn = true; });
  assert.equal(w.rows(`SELECT recompute_status FROM calculations WHERE calc_id=?`, c.calc_id)[0].recompute_status, "stale");
  assert.deepEqual(told, [{ calcId: c.calc_id, input: f, cause: INPUT_CHANGED }], "told once");
  assert.deepEqual(told2, told);
  assert.equal(w.rows(`SELECT results_json FROM calculations WHERE calc_id=?`, c.calc_id)[0].results_json, results, "nothing recomputed by itself");
  /* a write that rolls back tells no one */
  w.record.transact(() => { for (const l of w.money.listeners) l.fn({ factId: g2, change: "adjusted" }); return { ok: false, reason: "X" }; });
  assert.equal(told.length, 1, "a rolled-back write tells nothing");
  /* the recompute now sees the withdrawn fact counted apart */
  const rc = await w.c.recompute({ calcId: c.calc_id });
  assert.equal(rc.agrees, false);
  assert.equal(rc.results.output.value, "15");
  assert.equal(rc.results.withdrawn_apart[0].fact_id, f);
  /* a table vintage superseded */
  const fields = [{ name: "amount", type: "number" }];
  const v1 = await w.table("amount\n5\n", fields, { vintage: { key: "fees", valid: { from: "2024-01-01", to: "2024-12-31" } } });
  const t = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "t", table: v1.sha }], recipe: SUM, by: V("bob") });
  const v2 = await w.table("amount\n6\n", fields, { vintage: { key: "fees", valid: { from: "2024-01-01", to: "2024-12-31" }, supersedes: v1.sha } });
  assert.equal(v2.ok, true);
  assert.equal(w.rows(`SELECT recompute_status FROM calculations WHERE calc_id=?`, t.calc_id)[0].recompute_status, "stale");
  assert.deepEqual(told.at(-1), { calcId: t.calc_id, input: v1.sha, cause: INPUT_CHANGED });
  assert.equal(told.length, 2);
  assert.equal((await w.c.readTable({ sha: v1.sha, viewer: V("bob") })).superseded_by, v2.sha);
});
