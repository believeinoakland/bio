/* calculations: creating, evaluating, accepting, recomputing and reading a calculation (R4–R11). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, R, saved, sha } from "./fixture.mjs";
import { resultKey, METHOD, evaluate } from "../../../src/calc-grammar/index.mjs";
import { idPattern } from "../../../src/record-grammar/index.mjs";
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
});

test("R4 a CALC- id is minted in record-grammar's ID_TABLE form for CALC, opaque: nothing in it counts the calculations minted; an id minted earlier in the sequential form is still read", async () => {
  const w = seeded();
  const t = await w.table("dept,amount,status\nparks,100,awarded\nroads,250,awarded\n", F);
  const good = { question: "How much?", period: PERIOD, kind: "total", inputs: [{ name: "t", table: t.sha }], recipe: SUM, by: V("bob") };
  const ids = [];
  for (let i = 0; i < 3; i++) ids.push((await w.c.create({ ...good, question: `Q${i}` })).calc_id);
  for (const id of ids) {
    assert.match(id, idPattern("CALC"), "record-grammar's form for CALC");
    assert.match(id, /^CALC-2026-[a-z0-9]{16}$/, "opaque: a 16-character tail, no counter");
  }
  assert.equal(new Set(ids).size, 3);
  assert.notDeepEqual([...ids].sort(), ids.map((_, i) => `CALC-2026-${String(i + 1).padStart(4, "0")}`), "no sequence");
  /* a calculation held under the sequential form (as minted before T34, with no input hashes recorded) is read */
  const legacy = "CALC-2026-0001";
  for (const t of ["calculations", "calc_inputs", "calc_recomputes"]) w.st.sql.exec(`UPDATE ${t} SET calc_id=? WHERE calc_id=?`, legacy, ids[0]);
  w.st.sql.exec(`UPDATE calculations SET input_shas_json=NULL WHERE calc_id=?`, legacy);
  const r = await w.c.read({ calcId: legacy, viewer: V("carol") });
  assert.equal(r.found, true);
  assert.equal(r.calc_id, legacy);
  assert.equal(r.calculation.inputs[0].sha, good.inputs[0].table, "a table input's sha is its own, recorded or not");
  assert.equal(w.c.calcStatusOf({ calcId: legacy, viewer: V("carol") }).held, true);
  assert.equal(w.c.gradeFactsOf({ calcId: legacy, viewer: V("carol") }).found, true);
  const use = await w.c.create({ question: "Rounded?", period: PERIOD, kind: "total", inputs: [{ name: "x", calculation: legacy }],
    recipe: R([{ op: "round", of: "x", places: 0, mode: "half_even", as: "r" }], "r", [{ name: "x", kind: "figure" }]), by: V("bob") });
  assert.equal(code(use), "ok", "and taken as another calculation's input");
  assert.equal((await w.c.accept({ calcId: legacy, by: V("carol") })).ok, true);
});

test("R4 a table result calc-grammar answers streamed is stored and answered as the same table the row-object answer holds, so what is stored does not depend on how an input was bound (K1734)", async () => {
  const w = seeded();
  const { t } = await base(w);
  const recipes = {
    select: R([{ op: "select", from: "t", where: [{ field: "status", test: "eq", value: "awarded" }], as: "s" }], "s"),
    group: R([{ op: "group", from: "t", by: ["dept"], measure: { op: "sum", field: "amount" }, as: "g" }], "g"),
    sort: R([{ op: "select", from: "t", where: [{ field: "amount", test: "gt", value: 0 }], as: "s" }, { op: "sort", from: "s", by: "amount", order: "desc", as: "o" }], "o"),
  };
  const held = (await w.c.readTable({ sha: t.sha, viewer: V("bob") })).table;
  for (const [name, recipe] of Object.entries(recipes)) {
    const asObjects = evaluate(recipe, { t: { fields: held.fields, rows: held.rows } });
    const c = await w.c.create({ question: name, period: PERIOD, kind: "total", inputs: [{ name: "t", table: t.sha }], recipe, by: V("bob") });
    assert.equal(c.ok, true, name);
    assert.ok(Array.isArray(c.results.output.rows), `${name}: rows, not a function`);
    assert.deepEqual(c.results.output, JSON.parse(JSON.stringify(asObjects.result)), `${name}: the row-object answer's table`);
    const read = await w.c.read({ calcId: c.calc_id, viewer: V("carol") });
    assert.deepEqual(read.results.output, c.results.output, `${name}: stored and answered alike`);
    const e = await w.c.evaluate({ recipe, inputs: [{ name: "t", table: t.sha }], viewer: V("carol") });
    assert.deepEqual(e.results.output, c.results.output, `${name}: evaluate alike`);
    /* and a later calculation takes the stored table as its input */
    const next = await w.c.create({ question: `${name} counted`, period: PERIOD, kind: "count", inputs: [{ name: "x", calculation: c.calc_id }],
      recipe: R([{ op: "count", from: "x", as: "n" }], "n", [{ name: "x", kind: "table" }]), by: V("bob") });
    assert.equal(next.results.output.value, String(c.results.output.rows.length), name);
  }
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
  const { sha: figSha, ...k } = rf.calculation.inputs[1];
  assert.deepEqual(k, { name: "k", kind: "figure", figure: { value: "12", sign: "+", precision: "exact", currency: "USD" }, content_id: fig });
  assert.match(figSha, /^[0-9a-f]{64}$/, "with its bytes' SHA-256 (R9)");
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
  w.document("seen doc", { title: "Quokka contract" }); w.document("hidden doc", { project: P, title: "Quokka contract" });
  const set = await w.c.freezeSet({ query: saved("quokka"), by: V("alice") });
  assert.equal(set.n, 2, "alice's saved query answers both, under her sight");
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
  const S1 = w.standard({ from: "2020-01-01", to: "2030-12-31" });
  const S2 = w.standard({ from: "2026-01-01", to: "2030-12-31" });
  const S3 = w.standard({ from: "2020-01-01", to: null });
  const fig = w.passage("$150");
  const inForce = await w.c.create({ ...g, threshold: { standard: S1, figure: fig } });
  assert.equal(inForce.ok, true);
  assert.equal((await w.c.read({ calcId: inForce.calc_id, viewer: V("bob") })).threshold.standing.state, "in_force");
  const notIn = await w.c.create({ ...g, threshold: { standard: S2, figure: fig } });
  assert.equal(code(notIn), "THRESHOLD_NOT_IN_FORCE");
  assert.equal(notIn.standard, S2);
  const open = await w.c.create({ ...g, threshold: { standard: S3, figure: fig } });
  assert.equal(open.ok, true);
  const st = (await w.c.read({ calcId: open.calc_id, viewer: V("bob") })).threshold.standing;
  assert.equal(st.state, "undetermined", "stated undetermined with the reason");
  assert.ok(st.why);
  assert.equal(code(await w.c.create({ ...g, threshold: { standard: S1 } })), "BAD_THRESHOLD", "a threshold states its figure");
  assert.equal(code(await w.c.create({ ...g, threshold: { standard: "STD-1999-0001-none", figure: fig } })), "NO_SUCH_STANDARD", "a standard not held");
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

test("R8 results are recomputed at accept and by recompute, never on a read: read answers the stored results with computed_at and the method version; accept is refused CALC_RECOMPUTE_DIFFERS naming the differing result when a stored result was tampered, and a refused accept, by this or any other refusal, writes nothing, its recompute status and record included; recompute answers {agrees, results} and writes only the recompute status", async () => {
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
  /* a refused accept writes nothing (N619): the recompute differs, a machine asks, the calculation is withheld */
  const untouched = w.snapshot();
  const acc = await w.c.accept({ calcId: c.calc_id, by: V("carol") });
  assert.equal(code(acc), "CALC_RECOMPUTE_DIFFERS");
  assert.equal(acc.differing.path, "results.output.value", "names the differing result");
  assert.match(acc.detail, /Nothing was written/);
  assert.equal(code(await w.c.accept({ calcId: c.calc_id, by: MACHINE })), "MEMBER_ACT_ONLY");
  assert.equal(code(await w.c.accept({ calcId: "CALC-2026-aaaaaaaaaaaaaaaa", by: V("carol") })), "NO_SUCH_CALCULATION");
  assert.deepEqual(w.snapshot(), untouched, "no refused accept wrote anything: no recompute status, no recompute record, no acceptance");
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
  assert.equal(w.rows(`SELECT accepted_by FROM calculations WHERE calc_id=?`, c.calc_id)[0].accepted_by, null);
  /* the untampered one agrees and is accepted, once */
  const d = await w.c.create({ question: "Total again?", period: PERIOD, kind: "total", inputs: [{ name: "t", table: t.sha }], recipe: SUM, by: V("bob") });
  assert.equal(code(await w.c.accept({ calcId: d.calc_id, by: MACHINE })), "MEMBER_ACT_ONLY");
  const ok = await w.c.accept({ calcId: d.calc_id, by: V("carol") });
  assert.equal(ok.ok, true);
  assert.equal(ok.recompute_status, "agrees");
  assert.deepEqual(w.rows(`SELECT recompute_status, accepted_by FROM calculations WHERE calc_id=?`, d.calc_id)[0], { recompute_status: "agrees", accepted_by: V("carol") },
    "an accepted one records its agreeing recompute with the acceptance");
  assert.deepEqual(w.rows(`SELECT status FROM calc_recomputes WHERE calc_id=? ORDER BY seq`, d.calc_id).map((x) => x.status), ["created", "agrees", "accepted"]);
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

test("R9 each input read answers states sha, the lowercase hex SHA-256 of that input's canonical bytes as the calculation was computed over them: a table's canonical CSV, and equally a figure, a typed value, money facts, another calculation, a frozen set, a draw and a threshold, each one's bytes held so a case file names them and the result key is calc-grammar.resultKey over them", async () => {
  const w = seeded();
  const t = await w.table("dept,amount,status\nparks,100,awarded\n", F);
  /* every input's sha: hex, the SHA-256 of bytes held in the evidence store, and the result key over them */
  const check = async (calcId, kinds) => {
    const r = await w.c.read({ calcId, viewer: V("bob") });
    assert.equal(r.found, true);
    const ins = r.calculation.inputs;
    assert.deepEqual(ins.map((i) => i.kind), kinds);
    for (const i of ins) {
      assert.match(i.sha, /^[0-9a-f]{64}$/, `${i.name}: lowercase hex SHA-256`);
      const bytes = w.ev.m.get(i.sha);
      assert.ok(bytes, `${i.name}: its canonical bytes are held`);
      assert.equal(sha(new TextDecoder().decode(bytes)), i.sha, `${i.name}: the SHA-256 of those bytes`);
    }
    assert.equal(resultKey(r.calculation.recipe, Object.fromEntries(ins.map((i) => [i.name, i.sha]))), r.result_key,
      "the result key is calc-grammar's over exactly these hashes");
    return ins;
  };
  /* a table, a cited figure, a typed value and a threshold */
  const fig = w.passage("$40");
  const rec = R([{ op: "sum", from: "t", field: "amount", as: "s" }, { op: "difference", a: "s", b: "k", as: "d" }, { op: "difference", a: "d", b: "v", as: "e" },
    { op: "compare", a: "e", b: "threshold", as: "c" }], "c", [{ name: "t", kind: "table" }, { name: "k", kind: "figure" }, { name: "v", kind: "figure" }, { name: "threshold", kind: "figure" }]);
  const a = await w.c.create({ question: "Q", period: PERIOD, kind: "comparison", inputs: [{ name: "t", table: t.sha }, { name: "k", figure: fig }, { name: "v", value: "$5" }],
    threshold: { value: "$50" }, recipe: rec, by: V("bob") });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  const ins = await check(a.calc_id, ["table", "figure", "figure", "threshold"]);
  assert.equal(ins[0].sha, t.sha, "a table's is its canonical CSV's sha256 (R1)");
  assert.equal(new TextDecoder().decode(w.ev.m.get(t.sha)), "dept,amount,status\r\nparks,100,awarded\r\n");
  /* money facts */
  const m = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "t", money: [w.fact({ amount: "10" }), w.fact({ amount: "5" })] }], recipe: SUM, by: V("bob") });
  await check(m.calc_id, ["money"]);
  /* another calculation */
  const c = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "x", calculation: m.calc_id }],
    recipe: R([{ op: "round", of: "x", places: 0, mode: "half_even", as: "r" }], "r", [{ name: "x", kind: "figure" }]), by: V("bob") });
  const [x] = await check(c.calc_id, ["calculation"]);
  assert.equal(x.sha, m.result_key, "another calculation's bytes are those its own result key is the SHA-256 of");
  /* a frozen set and a draw */
  ["one", "two", "three"].forEach((n) => w.document(n, { title: `Quoll ${n}` }));
  const set = await w.c.freezeSet({ query: saved("quoll"), by: V("bob") });
  const s = await w.c.create({ question: "Q", period: PERIOD, kind: "count", inputs: [{ name: "s", set: set.set }], recipe: R([{ op: "count", from: "s", as: "n" }], "n", [{ name: "s", kind: "table" }]), by: V("bob") });
  const [si] = await check(s.calc_id, ["set"]);
  assert.equal(si.sha, set.set, "a frozen set's is its own sha");
  const d = w.c.draw({ set: t.sha, n: 1, seed: "s", by: V("bob") });
  const e = await w.c.create({ question: "Q", period: PERIOD, kind: "estimate", inputs: [{ name: "s", draw: d.draw }], recipe: R([{ op: "count", from: "s", as: "n" }], "n", [{ name: "s", kind: "table" }]), by: V("bob") });
  assert.equal(e.ok, true, JSON.stringify(e).slice(0, 300));
  const [di] = await check(e.calc_id, ["draw"]);
  assert.equal(di.sha, d.draw, "a draw's is its own key");
  /* the same inputs give the same hashes: recomputable from what the case file names */
  const again = await w.c.create({ question: "Q again", period: PERIOD, kind: "total", inputs: [{ name: "t", money: (await w.c.read({ calcId: m.calc_id, viewer: V("bob") })).inputs[0].money }], recipe: SUM, by: V("bob") });
  assert.equal((await w.c.read({ calcId: again.calc_id, viewer: V("bob") })).calculation.inputs[0].sha, (await w.c.read({ calcId: m.calc_id, viewer: V("bob") })).calculation.inputs[0].sha);
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
  const f = w.fact({ amount: "10", visibleTo: [V("bob")] });
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
  const f = w.fact({ amount: "10" }), g2 = w.fact({ amount: "15" });
  const c = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "t", money: [f, g2] }], recipe: SUM, by: V("bob") });
  assert.equal(c.results.output.value, "25");
  const results = w.rows(`SELECT results_json FROM calculations WHERE calc_id=?`, c.calc_id)[0].results_json;
  assert.equal(w.money.withdrawFact({ factId: f, reason: "the page was read twice", by: V("bob") }).ok, true, "money tells its listeners (its R23); calculations registered at start");
  assert.equal(w.rows(`SELECT recompute_status FROM calculations WHERE calc_id=?`, c.calc_id)[0].recompute_status, "stale");
  assert.deepEqual(told, [{ calcId: c.calc_id, input: f, cause: INPUT_CHANGED }], "told once");
  assert.deepEqual(told2, told);
  assert.equal(w.rows(`SELECT results_json FROM calculations WHERE calc_id=?`, c.calc_id)[0].results_json, results, "nothing recomputed by itself");
  /* a write that rolls back tells no one */
  w.record.transact(() => { w.money.withdrawFact({ factId: g2, reason: "undone", by: V("bob") }); return { ok: false, reason: "X" }; });
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

test("R30 gradeFactsOf answers synchronously R9's grade facts {found: true, accepted, capture, inputs, method}, equal to what read answers for the same calculation and viewer; not held, withheld from the viewer (R10) and no viewer each answer {found: false}, identically; it recomputes nothing, writes nothing and never throws", async () => {
  const w = seeded();
  const P = w.project("Closed", "alice");
  const hidden = await w.table("dept,amount,status\nparks,7,awarded\n", F, { by: V("alice") }, { project: P });
  const open = await w.table("dept,amount,status\nparks,9,awarded\n", F);
  const fig = w.passage("$3");
  const c = await w.c.create({ question: "Q", period: PERIOD, kind: "difference", inputs: [{ name: "t", table: open.sha }, { name: "k", figure: fig }, { name: "v", value: "$2" }],
    recipe: R([{ op: "sum", from: "t", field: "amount", as: "s" }, { op: "difference", a: "s", b: "k", as: "d" }, { op: "difference", a: "d", b: "v", as: "e" }], "e",
      [{ name: "t", kind: "table" }, { name: "k", kind: "figure" }, { name: "v", kind: "figure" }]), by: V("bob") });
  const h = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "t", table: hidden.sha }], recipe: SUM, by: V("alice") });
  const before = w.snapshot();
  const g = w.c.gradeFactsOf({ calcId: c.calc_id, viewer: V("carol") });
  assert.equal(typeof g.then, "undefined", "synchronous: an answer, not a promise");
  const read = await w.c.read({ calcId: c.calc_id, viewer: V("carol") });
  assert.deepEqual(g, { found: true, accepted: false, capture: read.grade.capture, inputs: read.grade.inputs, method: read.grade.method }, "equal to read's grade facts");
  assert.deepEqual(g.inputs.map((i) => [i.name, i.kind, i.ref, i.grade, typeof i.why]), [["t", "table", open.sha, "B", "string"], ["k", "figure", fig, "B", "string"], ["v", "value", "$2", "D", "string"]],
    "each input's name, kind, reference and grade with why");
  assert.deepEqual(g.capture, { grade: "D", why: g.capture.why }, "the capture axis is the weakest input's: an unbound value is testimony");
  assert.deepEqual({ recipe: g.method.recipe, version: g.method.version, graded: g.method.graded }, { recipe: read.calculation.recipe, version: METHOD, graded: false });
  /* the tampered results are not seen: nothing is recomputed */
  w.st.sql.exec(`UPDATE calculations SET results_json='{"output":{"value":"999"}}' WHERE calc_id=?`, h.calc_id);
  assert.equal(w.c.gradeFactsOf({ calcId: h.calc_id, viewer: V("alice") }).found, true);
  w.st.sql.exec(`UPDATE calculations SET results_json=? WHERE calc_id=?`, before.calculations.find((x) => x.calc_id === h.calc_id).results_json, h.calc_id);
  /* found: false, identically, for not held, withheld and no viewer */
  const absent = w.c.gradeFactsOf({ calcId: "CALC-2026-aaaaaaaaaaaaaaaa", viewer: V("carol") });
  assert.deepEqual(absent, { found: false });
  assert.deepEqual(w.c.gradeFactsOf({ calcId: h.calc_id, viewer: V("carol") }), absent, "withheld from carol (R10): as an absent one");
  assert.deepEqual(w.c.gradeFactsOf({ calcId: c.calc_id, viewer: null }), absent, "no viewer");
  assert.deepEqual(w.c.gradeFactsOf({ calcId: c.calc_id }), absent);
  for (const bad of [undefined, null, "x", 5, { calcId: {} }, { calcId: c.calc_id, viewer: {} }]) assert.deepEqual(w.c.gradeFactsOf(bad), absent, `never throws: ${JSON.stringify(bad)}`);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* accepted: whether the acceptance is recorded */
  await w.c.accept({ calcId: c.calc_id, by: V("bob") });
  assert.equal(w.c.gradeFactsOf({ calcId: c.calc_id, viewer: V("carol") }).accepted, true);
});

test("R31 calcStatusOf answers synchronously {held, visible, accepted}: held whether a CALC- of that id is held; visible whether R10 admits the viewer (false without one); accepted whether its acceptance is recorded, false when not visible; writes nothing, never throws", async () => {
  const w = seeded();
  const P = w.project("Closed", "alice");
  const hidden = await w.table("dept,amount,status\nparks,7,awarded\n", F, { by: V("alice") }, { project: P });
  const open = await w.table("dept,amount,status\nparks,9,awarded\n", F);
  const c = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "t", table: open.sha }], recipe: SUM, by: V("bob") });
  const h = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "t", table: hidden.sha }], recipe: SUM, by: V("alice") });
  const st = (calcId, viewer) => w.c.calcStatusOf({ calcId, viewer });
  const s = st(c.calc_id, V("carol"));
  assert.equal(typeof s.then, "undefined", "synchronous");
  assert.deepEqual(s, { held: true, visible: true, accepted: false });
  assert.deepEqual(st("CALC-2026-aaaaaaaaaaaaaaaa", V("carol")), { held: false, visible: false, accepted: false });
  assert.deepEqual(st(c.calc_id, null), { held: true, visible: false, accepted: false }, "no viewer sees nothing");
  await w.c.accept({ calcId: c.calc_id, by: V("carol") });
  await w.c.accept({ calcId: h.calc_id, by: V("alice") });
  assert.deepEqual(st(c.calc_id, V("carol")), { held: true, visible: true, accepted: true });
  assert.deepEqual(st(h.calc_id, V("alice")), { held: true, visible: true, accepted: true });
  assert.deepEqual(st(h.calc_id, V("carol")), { held: true, visible: false, accepted: false }, "an input carol may not see: not visible, and so not accepted for her");
  const before = w.snapshot();
  for (const bad of [undefined, null, 7, { calcId: [] }, { calcId: c.calc_id, viewer: 3 }]) assert.deepEqual(w.c.calcStatusOf(bad), { held: !!bad && bad.calcId === c.calc_id, visible: false, accepted: false }, `never throws: ${JSON.stringify(bad)}`);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
});
