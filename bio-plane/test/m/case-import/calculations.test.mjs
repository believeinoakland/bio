/* case-import: each calculation a case carries, recreated and never trusted (R21; C:A-14, K1448, D312), recorded per
   calculation at the import and at each completion (R3), and read beside the value the source states (R4). A case file
   is built as the fixture builds one, its case document carrying `case-grammar` R18's `calculations:` block and each
   input travelling as the file its hash names. The stated values are computed here as a publishing copy computes them
   (`calc-grammar`), then the test tampers with what it needs to. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, imp, caseFile, V, sha, bytes, F1 } from "./fixture.mjs";
import { SOURCE_CALCULATION, CALC_RESULTS } from "../../../src/case-import/index.mjs";
import { evaluate, resultKey, METHOD } from "../../../src/calc-grammar/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";

const TABLE = { fields: [{ name: "amount", type: "number" }, { name: "vendor", type: "string" }],
                rows: [{ amount: "1200.50", vendor: "Acme" }, { amount: "300", vendor: "Acme" }, { amount: "99.50", vendor: "Bolt" }] };
const TABLE_BYTES = bytes(canonicalJson(TABLE));
const TABLE_SHA = sha(TABLE_BYTES);
const RECIPE = { method: METHOD, inputs: [{ name: "payments", kind: "table" }],
                 steps: [{ op: "select", from: "payments", where: [{ field: "vendor", test: "eq", value: "Acme" }], as: "acme" },
                         { op: "sum", from: "acme", field: "amount", as: "total" }], output: "total" };

/* What a publishing copy states for a recipe over its inputs: `calculations` R4's stored shape. */
function stated(recipe = RECIPE, inputs = { payments: TABLE }, hashes = { payments: TABLE_SHA }) {
  const e = evaluate(recipe, inputs, {});
  assert.ok(!e.refused, JSON.stringify(e));
  const steps = Object.fromEntries(e.trace.map((t) => [t.step, t.step === recipe.output ? e.result : t.output]));
  return { results: { output: e.result, steps }, result_key: resultKey(recipe, hashes), output: e.result };
}
function row(over = {}) {
  const s = stated();
  return { calc: "CALC-2026-0007", recipe: RECIPE, inputs: [{ name: "payments", sha256: TABLE_SHA }], method_version: METHOD,
           results: s.results, result_key: s.result_key, recompute: "agrees", disclosed: null, ...over };
}
const withCalcs = (calcs, calcInputs = [{ name: "payments", bytes: TABLE_BYTES }], extra = {}) => caseFile({ calcs, calcInputs, ...extra });
const editionOf = (w, r) => w.ci.importedCase({ import: r.import, viewer: V("alice") }).edition;

test("R21 R3 a carried calculation whose results and result key recompute equal is recorded recreated, at the import, with what was recomputed", async () => {
  const w = seeded();
  const r = await imp(w, withCalcs([row()]));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const [c] = r.recreation.calculations;
  assert.equal(c.calc, "CALC-2026-0007");
  assert.equal(c.result, "recreated");
  assert.deepEqual(c.missing, []);
  assert.deepEqual(c.differs, []);
  const s = stated();
  assert.equal(c.recomputed.result_key, s.result_key);
  assert.deepEqual(c.recomputed.output, s.output);
  assert.equal(c.recomputed.output.value, "1500.50", "the recipe is evaluated, not echoed: Acme's two payments");
  assert.equal(w.count("case_import_calculations"), 1, "recorded per calculation at the import (R3)");
  assert.deepEqual(w.rows(`SELECT path, kind FROM case_import_files WHERE kind='calculation'`),
                   [{ path: `calculations/CALC-2026-0007/inputs/${TABLE_SHA}`, kind: "calculation" }],
                   "the input travels as case-grammar R13's `calculation` kind, named by its hash");
  assert.ok(CALC_RESULTS.includes(c.result));
});

test("R21 a stated result that recomputes differently is `differs`, naming the result, the source's value and the recomputed one, even when the source states it agrees", async () => {
  const w = seeded();
  const s = stated();
  const forged = { ...s.output, value: "9999.00" };
  const r = await imp(w, withCalcs([row({ results: { output: forged, steps: { ...s.results.steps, total: forged } }, recompute: "agrees" })]));
  const [c] = r.recreation.calculations;
  assert.equal(c.result, "differs");
  assert.deepEqual(c.differs.map((d) => d.result).sort(), ["output", "steps.total"]);
  const out = c.differs.find((d) => d.result === "output");
  assert.equal(out.source.value, "9999.00");
  assert.equal(out.recomputed.value, "1500.50");
  assert.equal(c.source.recompute, "agrees", "the source's own status is held as its statement, never trusted");
  /* a result key that does not recompute, with every value right */
  const w2 = seeded();
  const r2 = await imp(w2, withCalcs([row({ result_key: "f".repeat(64) })]));
  const [k] = r2.recreation.calculations;
  assert.equal(k.result, "differs");
  assert.deepEqual(k.differs, [{ result: "result_key", source: "f".repeat(64), recomputed: s.result_key }]);
  /* the negative control: the same case, untouched, recreates */
  const w3 = seeded();
  assert.equal((await imp(w3, withCalcs([row()]))).recreation.calculations[0].result, "recreated");
});

test("R21 an input the case file does not carry, one carried with bytes that differ from its hash, and a method version this copy does not hold are each `not_recreated`, each named", async () => {
  /* not carried */
  const w = seeded();
  const a = (await imp(w, withCalcs([row()], []))).recreation.calculations[0];
  assert.equal(a.result, "not_recreated");
  assert.deepEqual(a.missing.map((m) => [m.input, m.sha]), [["payments", TABLE_SHA]]);
  assert.equal(a.recomputed, null, "nothing is recomputed without its inputs");
  /* carried with other bytes than the hash its row and the manifest state */
  const w2 = seeded();
  const tampered = bytes(canonicalJson({ ...TABLE, rows: TABLE.rows.map((x) => ({ ...x, amount: "1" })) }));
  const b = (await imp(w2, withCalcs([row()], [{ name: "payments", bytes: tampered, listedAs: TABLE_BYTES }]))).recreation.calculations[0];
  assert.equal(b.result, "not_recreated");
  assert.equal(b.missing.length, 1);
  assert.equal(b.missing[0].input, "payments");
  assert.equal(b.missing[0].sha, TABLE_SHA);
  assert.match(b.missing[0].detail, new RegExp(sha(tampered)), "the bytes carried are named");
  assert.match(b.missing[0].why, /differs from its hash/);
  /* a workbook's engine: a method version not held here */
  const w3 = seeded();
  const c = (await imp(w3, withCalcs([row({ method_version: "ironcalc/0.3" })]))).recreation.calculations[0];
  assert.equal(c.result, "not_recreated");
  assert.deepEqual(c.missing.map((m) => [m.what, m.method_version]), [["method_version", "ironcalc/0.3"]]);
  /* a workbook row as case-grammar R18 states one (K1639): `recompute: not_recomputed`, held as the source's statement */
  const w5 = seeded();
  const wb = (await imp(w5, withCalcs([row({ method_version: "ironcalc/0.3", recompute: "not_recomputed" })]))).recreation.calculations[0];
  assert.equal(wb.result, "not_recreated");
  assert.equal(wb.source.recompute, "not_recomputed");
  /* the negative control */
  const w4 = seeded();
  assert.equal((await imp(w4, withCalcs([row()]))).recreation.calculations[0].result, "recreated");
});

test("R21 R5 bytes matching a calculation's missing input complete it: the edition is recreated again and the calculation recreates", async () => {
  const w = seeded();
  const r = await imp(w, withCalcs([row()], []));
  assert.equal(r.recreation.calculations[0].result, "not_recreated");
  const before = w.count("case_import_calculations");
  const done = await w.ci.completeImportedDocument({ import: r.import, edition: 1, bytes: TABLE_BYTES, by: V("alice"), viewer: V("alice") });
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  assert.equal(done.document, TABLE_SHA);
  assert.equal(done.recreation.cause, "completion");
  assert.equal(done.recreation.calculations[0].result, "recreated");
  assert.equal(w.count("case_import_calculations"), before + 1, "a new recreation's row; the import's stays (R12)");
  /* the earlier recreation is kept as it was */
  assert.equal(w.rows(`SELECT result FROM case_import_calculations ORDER BY check_rn`)[0].result, "not_recreated");
  /* the negative control: bytes matching no missing input are refused, as R5 says */
  const no = await w.ci.completeImportedDocument({ import: r.import, edition: 1, bytes: bytes("other"), by: V("alice"), viewer: V("alice") });
  assert.equal(no.reason, "IMPORT_DOCUMENT_NOT_MISSING");
});

test("R21 the source's stated results are held only as its statement: the import writes no CALC-, no money fact and no record row from them", async () => {
  const w = seeded();
  const outside = () => Object.fromEntries(Object.entries(w.snapshot()).filter(([t]) => !t.startsWith("case_import") && t !== "sqlite_sequence"));
  const before = outside();
  const r = await imp(w, withCalcs([row(), row({ calc: "CALC-2026-0008", method_version: "ironcalc/0.3" })]));
  assert.equal(r.ok, true);
  assert.deepEqual(outside(), before, "nothing outside this module's own tables is written");
  const all = JSON.stringify(Object.entries(w.snapshot()).filter(([t]) => !t.startsWith("case_import") && t !== "sqlite_sequence"));
  assert.doesNotMatch(all, /CALC-2026-000[78]/);
  /* and a completion writes none either */
  const w2 = seeded();
  const r2 = await imp(w2, withCalcs([row()], []));
  const before2 = Object.fromEntries(Object.entries(w2.snapshot()).filter(([t]) => !t.startsWith("case_import") && t !== "sqlite_sequence"));
  await w2.ci.completeImportedDocument({ import: r2.import, edition: 1, bytes: TABLE_BYTES, by: V("alice"), viewer: V("alice") });
  assert.deepEqual(Object.fromEntries(Object.entries(w2.snapshot()).filter(([t]) => !t.startsWith("case_import") && t !== "sqlite_sequence")), before2);
});

test("R4 R21 importedCase answers each calculation the edition carries with its result as recreated here, beside the source's value labelled as the source's", async () => {
  const w = seeded();
  const s = stated();
  const forged = { ...s.output, value: "1.00" };
  const r = await imp(w, withCalcs([row(), row({ calc: "CALC-2026-0009", results: { output: forged } })]));
  const ed = editionOf(w, r);
  assert.deepEqual(ed.calculations.map((c) => [c.calc, c.result]), [["CALC-2026-0007", "recreated"], ["CALC-2026-0009", "differs"]]);
  for (const c of ed.calculations) {
    assert.equal(c.source.whose, "source");
    assert.equal(c.source.label, SOURCE_CALCULATION);
    assert.equal(c.source.method_version, METHOD);
  }
  const d = ed.calculations[1];
  assert.equal(d.source.results.output.value, "1.00", "the source's value, as it states it");
  assert.equal(d.recomputed.output.value, "1500.50", "beside the value recreated here");
  /* a case with no calculations block answers an empty list */
  const w2 = seeded();
  const r2 = await imp(w2);
  assert.deepEqual(editionOf(w2, r2).calculations, []);
  /* a non-member reads absence: no calculation, nor anything else of the import */
  const absent = w.ci.importedCase({ import: r.import, viewer: V("carol") });
  assert.equal(absent.reason, "IMPORT_NO_SUCH_EDITION");
  assert.doesNotMatch(JSON.stringify(absent), /CALC-|calculations/);
});

test("R21 the checker's own answer for each calculation (case-checker R20) is recorded beside this copy's, with whether the two agree", async () => {
  const w = seeded();
  w.checker.calculations = [{ calc: "CALC-2026-0007", result: "agrees" }, { calc: "CALC-2026-0009", result: "agrees" }];
  const s = stated();
  const r = await imp(w, withCalcs([row(), row({ calc: "CALC-2026-0009", results: { output: { ...s.output, value: "2.00" } } })]));
  const ed = editionOf(w, r);
  assert.deepEqual(ed.calculations[0].checker, { result: "agrees", agrees_with_this_copy: true });
  assert.deepEqual(ed.calculations[1].checker, { result: "agrees", agrees_with_this_copy: false },
                   "the checker's word never replaces this copy's recreation");
  assert.equal(ed.calculations[1].result, "differs");
  /* a checker that answers no calculations: null beside each */
  const w2 = seeded();
  const r2 = await imp(w2, withCalcs([row()]));
  assert.equal(editionOf(w2, r2).calculations[0].checker, null);
});

test("R21 an input whose bytes are not a value calc-grammar evaluates, and a recipe it refuses over them, are `not_recreated`, never a crash", async () => {
  const w = seeded();
  const junk = bytes("not json");
  const r = await imp(w, withCalcs([row({ inputs: [{ name: "payments", sha256: sha(junk) }] })], [{ name: "payments", bytes: junk }]));
  assert.equal(r.ok, true);
  const c = r.recreation.calculations[0];
  assert.equal(c.result, "not_recreated");
  assert.equal(c.missing[0].input, "payments");
  /* a table calc-grammar refuses as an input */
  const w2 = seeded();
  const bad = bytes(canonicalJson({ rows: [] }));
  const c2 = (await imp(w2, withCalcs([row({ inputs: { payments: sha(bad) } })], [{ name: "payments", bytes: bad }]))).recreation.calculations[0];
  assert.equal(c2.result, "not_recreated");
  assert.equal(c2.missing[0].what, "evaluation");
  assert.equal(c2.missing[0].refused, "INPUT_INVALID");
  /* a finding's recreation is untouched by a calculation's */
  assert.equal(r.recreation.findings.find((f) => f.finding === F1).result, "recreated");
});
