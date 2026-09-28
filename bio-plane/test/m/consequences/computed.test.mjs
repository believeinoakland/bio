/* consequences R2, R4, R11: a computed part is the module's own arithmetic over figures the cited passages hold,
   graded by its weakest operand's capture; a part lacking a figure is undetermined, with why, never zero; and no answer
   composes states or carries a significance. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { parseFigure, compute, OPS } from "../../../src/consequences/index.mjs";

const S = "STD-2026-0001-law";

function setup(opts) {
  const w = world(opts);
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant" });
  w.base = { determination: w.D, standard: S, affected: { kind: "program", description: "the meal program" },
             measure: { unit: "money", currency: "USD" }, period: { from: "2026-01-01", to: "2026-12-31" }, author: V("alice") };
  w.rec = (basis, over = {}) => w.c.consequenceRecord({ ...w.base, basis, ...over });
  return w;
}

test("R2: the parser reads figures exactly, as read in a passage", () => {
  const cases = [["1,234,567", 1234567], ["$4.2 million", 4200000], ["(3,400)", -3400], ["-12.5", -12.5], ["12.5", 12.5],
                 ["1.2 million", 1200000], ["€7bn", 7e9], ["0.1", 0.1], ["250 thousand", 250000], ["$ 1,000", 1000]];
  for (const [f, n] of cases) assert.equal(parseFigure(f).number, n, f);
  for (const f of ["", "twelve", "1,23", "(12", "12)", "1 zillion", "--3"]) assert.equal(parseFigure(f).ok, false, f);
  assert.deepEqual(OPS, ["sum", "difference", "count", "product", "ratio"]);
});

test("R2: the value is the module's arithmetic over the operands, against hand-computed results, never the author's", () => {
  const w = setup();
  const f = (id, text) => w.figure(id, text);
  const a = f("INFO-2026-0001-a", "Appropriated: $1,250,000.50");
  const b = f("INFO-2026-0002-b", "Spent: $250,000.25");
  const c = f("INFO-2026-0003-c", "Rate 0.1");
  const d = f("INFO-2026-0004-d", "Rate 0.2");
  const e = f("INFO-2026-0005-e", "Months: 12");
  const cases = [
    [{ op: "sum", operands: [{ content: c, figure: "0.1" }, { content: d, figure: "0.2" }] }, 0.3],
    [{ op: "difference", operands: [{ content: a, figure: "$1,250,000.50" }, { content: b, figure: "$250,000.25" }] }, 1000000.25],
    [{ op: "product", operands: [{ content: b, figure: "$250,000.25" }, { content: e, figure: "12" }] }, 3000003],
    [{ op: "ratio", operands: [{ content: b, figure: "$250,000.25" }, { content: a, figure: "$1,250,000.50" }] }, 250000.25 / 1250000.5],
    [{ op: "count", operands: [{ content: a }, { content: b }, { content: c }] }, 3],
  ];
  for (const [basis, want] of cases) {
    /* The author's own value, where given, is never the part's. */
    const r = w.rec(basis, { measure: { unit: "money", currency: "USD", value: 42 } });
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(r.part.state, "computed", basis.op);
    assert.equal(r.part.measure.value, Number(want.toPrecision(15)), basis.op);
    assert.equal(r.part.computation.op, basis.op);
    assert.equal(r.part.computation.operands.length, basis.operands.length, "the operands are shown");
  }
  /* A difference or ratio takes exactly two operands; an unknown op or a malformed operand is refused. */
  assert.equal(w.rec({ op: "difference", operands: [{ content: a, figure: "$1,250,000.50" }, { content: b, figure: "$250,000.25" },
                                                    { content: c, figure: "0.1" }] }).reason, "BASIS_UNREADABLE");
  assert.equal(w.rec({ op: "median", operands: [{ content: a, figure: "1" }] }).reason, "BASIS_UNREADABLE");
  assert.equal(w.rec({ op: "sum", operands: ["x"] }).reason, "BASIS_UNREADABLE");
  assert.equal(w.rec({ op: "sum", operands: [{ content: a, figure: "lots" }] }).reason, "BASIS_UNREADABLE");
  assert.equal(compute("ratio", [{ number: 1 }, { number: 0 }]).ok, false);
});

test("R2: each operand carries its capture's grade; the part's grade is the weakest, named (DEC-21)", () => {
  const w = setup();
  const direct = w.figure("INFO-2026-0001-a", "Cut 100", "example.org/a", "direct");
  const archive = w.figure("INFO-2026-0002-b", "Cut 200", "example.org/b", "archive.org");
  const both = w.rec({ op: "sum", operands: [{ content: direct, figure: "100" }, { content: archive, figure: "200" }] });
  assert.deepEqual(both.part.computation.operands.map((o) => [o.grade, o.route]), [["B", "direct"], ["C", "archive"]]);
  assert.equal(both.part.grade.grade, "C");
  assert.match(both.part.grade.why, /weakest operand is 1/);
  assert.equal(w.rec({ op: "sum", operands: [{ content: direct, figure: "100" }] }).part.grade.grade, "B");
  /* A capture with no recorded route has an undetermined grade, so the weakest link is not known: named, never a letter. */
  const sha = w.doc("INFO-2026-0003-c", "Cut 300 (c)");
  const unrouted = w.passage("INFO-2026-0003-c", sha, "Cut 300");
  const u = w.rec({ op: "sum", operands: [{ content: direct, figure: "100" }, { content: unrouted, figure: "300" }] });
  assert.equal(u.part.state, "computed");
  assert.equal(u.part.grade.grade, null);
  assert.equal(u.part.grade.determined, false);
  assert.match(u.part.grade.why, /operand 1's capture grade is undetermined/);
});

test("R2: a machine's computed part is labelled machine work with its operands shown", () => {
  const w = setup();
  const a = w.figure("INFO-2026-0001-a", "Cut 100");
  const r = w.rec({ op: "sum", operands: [{ content: a, figure: "100" }] }, { author: MACHINE });
  assert.equal(r.part.label.machine_work, true);
  assert.match(r.part.label.says, /machine work/);
  assert.deepEqual(r.part.computation.operands.map((o) => o.figure), ["100"]);
  const m = w.rec({ op: "sum", operands: [{ content: a, figure: "100" }] });
  assert.equal(m.part.label.machine_work, false);
});

test("R4: a part with no measure, or whose computation lacks an operand, is undetermined with why, never zero", () => {
  const w = setup();
  const a = w.figure("INFO-2026-0001-a", "Cut 100");
  const cases = [
    [{ measure: null, basis: null }, "not_assessed"],
    [{ measure: { unit: "count" }, basis: { why: "not_in_record" } }, "not_in_record"],
    [{ measure: null, basis: { why: "form_not_read" } }, "form_not_read"],
    [{ basis: { op: "sum", operands: [] } }, "not_in_record"],
    [{ basis: { op: "difference", operands: [{ content: a, figure: "100" }] } }, "not_in_record"],
    [{ basis: { op: "sum", operands: [{ content: "f".repeat(64), figure: "100" }] } }, "not_in_record"],
    [{ basis: { op: "sum", operands: [{ content: a }] } }, "not_in_record"],
    [{ basis: { op: "sum", operands: [{ content: a, figure: "900" }] } }, "not_in_record"],
    [{ basis: { op: "ratio", operands: [{ content: a, figure: "100" }, { content: a, figure: "100" }] }, measure: null }, "not_assessed"],
  ];
  for (const [over, code] of cases) {
    const r = w.c.consequenceRecord({ ...w.base, ...over });
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(r.part.state, "undetermined", JSON.stringify(over));
    assert.equal(r.part.undetermined.code, code, JSON.stringify(over));
    assert.ok(r.part.undetermined.why.length > 10);
    assert.equal(r.part.measure?.value, undefined, "never a value, never zero");
  }
  const z = w.figure("INFO-2026-0002-z", "Base 0");
  assert.equal(w.rec({ op: "ratio", operands: [{ content: a, figure: "100" }, { content: z, figure: "0" }] }).part.undetermined.code,
               "not_computable");
  /* An undetermined part is never read as zero: it is left out of every total and listed as undetermined (R7). */
  const of = w.c.consequencesOf({ determination: w.D, viewer: V("alice") });
  assert.equal(of.totals.length, 0);
  assert.equal(of.undetermined.length, of.parts.length);
});

test("R4: a passage held in a form this module does not read leaves the computation undetermined, never the author's word", () => {
  const w = setup({ passages: false });
  const a = w.figure("INFO-2026-0001-a", "Cut 100");
  const r = w.rec({ op: "sum", operands: [{ content: a, figure: "100" }] });
  assert.equal(r.part.state, "undetermined");
  assert.equal(r.part.undetermined.code, "form_not_read");
});

test("R11: no answer composes states into one figure or carries a significance, severity, priority or score", () => {
  const w = setup();
  const a = w.figure("INFO-2026-0001-a", "Cut 100");
  w.rec({ op: "sum", operands: [{ content: a, figure: "100" }] });
  w.c.consequenceRecord({ ...w.base, measure: { unit: "money", currency: "USD", value: 50 }, basis: { rationale: "estimate" } });
  w.c.consequenceRecord({ ...w.base, measure: null, basis: null });
  const reads = [w.c.consequencesOf({ determination: w.D, viewer: V("alice") }), w.c.addressed({ determination: w.D, viewer: V("alice") })];
  const keys = new Set();
  const walk = (v) => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { keys.add(k.toLowerCase()); walk(x); } };
  walk(reads);
  for (const k of keys) assert.equal(/significance|severity|priority|urgency|score|rank|overall_value|composite/.test(k), false, k);
  const of = reads[0];
  assert.deepEqual(of.totals.map((t) => [t.state, t.value]).sort(), [["assessed", 50], ["computed", 100]],
                   "one total per state, never one figure across them");
  /* The significance keys are not taken from the caller either. */
  const r = w.c.consequenceRecord({ ...w.base, measure: { unit: "count", value: 3 }, basis: { rationale: "r" }, severity: "high", score: 9 });
  assert.equal(r.ok, true);
  walk(r); for (const k of keys) assert.equal(/significance|severity|priority|score/.test(k), false, k);
});
