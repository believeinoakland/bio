/* consequences R2, R4, R11: a computed part is calc-grammar's exact arithmetic over its operands (figures the cited
   passages hold, money facts, calculation outputs), graded by its weakest operand; a part lacking a figure is
   undetermined, with why, never zero; and no answer composes states or carries a significance. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { OPS, RATIO_ROUNDING, exactOf, Consequences } from "../../../src/consequences/index.mjs";

const S = "STD-2026-0001-law";

function setup(opts) {
  const w = world(opts);
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant" });
  w.base = { determination: w.D, standard: S, affected: { kind: "program", description: "the meal program" },
             measure: { unit: "money", currency: "USD" }, period: { from: "2026-01-01", to: "2026-12-31" }, author: V("alice") };
  w.rec = (basis, over = {}) => w.c.consequenceRecord({ ...w.base, basis, ...over });
  return w;
}

test("R2: a figure is read by calc-grammar's reader, exactly; this module holds no parser of its own (C:A-11)", () => {
  const w = setup();
  /* Each figure, as printed in its passage, is one operand of a sum: the part's value is the figure's exact decimal. */
  const cases = [["1,234,567", "1234567"], ["$4.2 million", "4200000"], ["(3,400)", "-3400"], ["-12.5", "-12.5"],
                 ["1.2 million", "1200000"], ["0.1", "0.1"], ["250 thousand", "250000"], ["$ 1,000", "1000"]];
  cases.forEach(([figure, want], i) => {
    const cid = w.figure(`INFO-2026-${String(100 + i)}-f`, `The table says ${figure} here`);
    const r = w.rec({ op: "sum", operands: [{ content: cid, figure }] }, { measure: { unit: "money" } });
    assert.equal(r.ok, true, `${figure}: ${JSON.stringify(r)}`);
    assert.equal(r.part.measure.value, want, figure);
    assert.equal(typeof r.part.measure.value, "string", "an exact decimal, never a floating-point number");
  });
  /* A figure calc-grammar does not read is refused as unreadable, naming why. */
  const a = w.figure("INFO-2026-0001-a", "twelve and 1 zillion");
  for (const figure of ["twelve", "1 zillion", "(12", "--3"])
    assert.equal(w.rec({ op: "sum", operands: [{ content: a, figure }] }).reason, "BASIS_UNREADABLE", figure);
  assert.deepEqual(OPS, ["sum", "difference", "count", "product", "ratio"]);
  /* The module's own figure file is gone: its value is calc-grammar's (exactOf reads through it). */
  assert.equal(exactOf("1,200.50"), "1200.50");
  assert.equal(exactOf(0.1), "0.1");
  assert.equal(exactOf(1e21), null);
});

test("R2: the value is calc-grammar's exact arithmetic over the operands, against hand-computed results, never the author's", () => {
  const w = setup();
  const f = (id, text) => w.figure(id, text);
  const a = f("INFO-2026-0001-a", "Appropriated: $1,250,000.50");
  const b = f("INFO-2026-0002-b", "Spent: $250,000.25");
  const c = f("INFO-2026-0003-c", "Rate 0.1");
  const d = f("INFO-2026-0004-d", "Rate 0.2");
  const e = f("INFO-2026-0005-e", "Months: 12");
  const cases = [
    /* 0.1 + 0.2 is 0.3 exactly, never 0.30000000000000004. */
    [{ op: "sum", operands: [{ content: c, figure: "0.1" }, { content: d, figure: "0.2" }] }, "0.3", { unit: "count" }],
    [{ op: "difference", operands: [{ content: a, figure: "$1,250,000.50" }, { content: b, figure: "$250,000.25" }] }, "1000000.25"],
    [{ op: "product", operands: [{ content: b, figure: "$250,000.25" }, { content: e, figure: "12" }] }, "3000003.00"],
    /* 250000.25 / 1250000.50 = 0.200000119999952…, at calc-grammar's stated rounding (12 places, half even). */
    [{ op: "ratio", operands: [{ content: b, figure: "$250,000.25" }, { content: a, figure: "$1,250,000.50" }] }, "0.200000120000",
     { unit: "count" }],
    [{ op: "count", operands: [{ content: a }, { content: b }, { content: c }] }, "3", { unit: "count" }],
  ];
  for (const [basis, want, measure] of cases) {
    /* The author's own value, where given, is never the part's. */
    const r = w.rec(basis, { measure: { ...(measure || { unit: "money", currency: "USD" }), value: "42" } });
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(r.part.state, "computed", basis.op);
    assert.equal(r.part.measure.value, want, basis.op);
    assert.equal(r.part.computation.op, basis.op);
    assert.equal(r.part.computation.operands.length, basis.operands.length, "the operands are shown");
    if (basis.op === "ratio") assert.deepEqual(r.part.computation.rounding, RATIO_ROUNDING, "a ratio states its rounding");
  }
  /* The currency is calc-grammar's: a sum of dollars is in USD where the measure names none. */
  const usd = w.rec({ op: "sum", operands: [{ content: a, figure: "$1,250,000.50" }] }, { measure: { unit: "money" } });
  assert.deepEqual(usd.part.measure, { unit: "money", currency: "USD", value: "1250000.50" });
  /* A difference or ratio takes exactly two operands; an unknown op or a malformed operand is refused. */
  assert.equal(w.rec({ op: "difference", operands: [{ content: a, figure: "$1,250,000.50" }, { content: b, figure: "$250,000.25" },
                                                    { content: c, figure: "0.1" }] }).reason, "BASIS_UNREADABLE");
  assert.equal(w.rec({ op: "median", operands: [{ content: a, figure: "1" }] }).reason, "BASIS_UNREADABLE");
  for (const bad of ["x", { content: a, money: "MNY-x" }, { calculation: "CALC-2026-0001" }, {}])
    assert.equal(w.rec({ op: "sum", operands: [bad] }).reason, "BASIS_UNREADABLE", JSON.stringify(bad));
});

test("R2: operands of different currencies or units are refused as calc-grammar refuses them (UNIT_MISMATCH)", () => {
  const w = setup();
  const usd = w.figure("INFO-2026-0001-a", "Cut $1,000");
  const eur = w.figure("INFO-2026-0002-b", "Cut €500");
  const plain = w.figure("INFO-2026-0003-c", "Cut 300");
  const pct = w.figure("INFO-2026-0004-d", "Rate 5%");
  const cases = [
    [{ op: "sum", operands: [{ content: usd, figure: "$1,000" }, { content: eur, figure: "€500" }] }, { unit: "money" }],
    [{ op: "sum", operands: [{ content: usd, figure: "$1,000" }, { content: plain, figure: "300" }] }, { unit: "money" }],
    [{ op: "product", operands: [{ content: usd, figure: "$1,000" }, { content: eur, figure: "€500" }] }, { unit: "money" }],
    /* The result's dimensions against the measure's: dollars are not a count, euros not the measure's dollars, and a
       percent is no measure's unit. */
    [{ op: "sum", operands: [{ content: usd, figure: "$1,000" }] }, { unit: "count" }],
    [{ op: "sum", operands: [{ content: eur, figure: "€500" }] }, { unit: "money", currency: "USD" }],
    [{ op: "sum", operands: [{ content: pct, figure: "5%" }] }, { unit: "count" }],
  ];
  for (const [basis, measure] of cases) {
    const before = w.snapshot();
    const r = w.rec(basis, { measure });
    assert.deepEqual([r.ok, r.reason, r.code], [false, "UNIT_MISMATCH", "UNIT_MISMATCH"], JSON.stringify([basis, measure]));
    assert.match(r.detail, /Nothing was written\.$/);
    assert.equal(r.check, undefined, "the code is calc-grammar's: no row of this module's");
    assert.deepEqual(w.snapshot(), before, "nothing is written");
  }
  /* Negative controls: one currency throughout; a dimensionless multiplier; a ratio of like amounts is a count. */
  assert.equal(w.rec({ op: "sum", operands: [{ content: usd, figure: "$1,000" }, { content: usd, figure: "$1,000" }] }).part.measure.value, "2000");
  assert.equal(w.rec({ op: "product", operands: [{ content: usd, figure: "$1,000" }, { content: plain, figure: "300" }] }).part.measure.value, "300000");
  assert.equal(w.rec({ op: "ratio", operands: [{ content: usd, figure: "$1,000" }, { content: usd, figure: "$1,000" }] },
                     { measure: { unit: "count" } }).part.measure.value, "1.000000000000");
});

test("R2: a money fact is an operand, its amount as held and its own grade; a total money refuses is refused by its code", () => {
  const w = setup();
  const f1 = w.fact({ amount: "1250000.50" });
  const f2 = w.fact({ amount: "250000.25" });
  const sum = w.rec({ op: "sum", operands: [{ money: f1 }, { money: f2 }] });
  assert.equal(sum.ok, true, JSON.stringify(sum));
  assert.deepEqual([sum.part.state, sum.part.measure.value, sum.part.measure.currency], ["computed", "1500000.75", "USD"]);
  assert.deepEqual(sum.part.computation.operands.map((o) => [o.kind, o.money, o.value, o.grade, o.route]),
                   [["money", f1, "1250000.50", "B", "money fact"], ["money", f2, "250000.25", "B", "money fact"]]);
  assert.match(sum.part.grade.why, /money fact .* reading grade is B/);
  const diff = w.rec({ op: "difference", operands: [{ money: f1 }, { money: f2 }] });
  assert.equal(diff.part.measure.value, "1000000.25");
  /* A money fact and a passage's figure in one computation. */
  const cid = w.figure("INFO-2026-0001-a", "Restored $250,000.25", "example.org/a", "archive.org");
  const mixed = w.rec({ op: "difference", operands: [{ money: f1 }, { content: cid, figure: "$250,000.25" }] });
  assert.deepEqual([mixed.part.measure.value, mixed.part.grade.grade], ["1000000.25", "C"], "the weakest is the archived passage");
  /* money's summation rule (its R10): a total across kinds, stages, bases, currencies or periods is refused by its code,
     and a single fact is never asked. */
  const cases = [["SUM_MIXED_KIND", { kind: "fee charged", stage: "collected" }], ["SUM_MIXED_STAGE", { stage: "incurred" }],
                 ["SUM_MIXED_BASIS", { basis: "accrual" }], ["SUM_MIXED_CURRENCY", { currency: "EUR", as_read: "€100" }],
                 ["SUM_MIXED_PERIOD", { period: { from: "2024-07-01", to: "2025-06-30", precision: "day" } }]];
  for (const [code, diffs] of cases) {
    const g = w.fact({ amount: "100", ...diffs });
    const before = w.snapshot();
    const r = w.rec({ op: "sum", operands: [{ money: f1 }, { money: g }] });
    assert.deepEqual([r.ok, r.reason], [false, code], JSON.stringify(diffs));
    assert.deepEqual(w.snapshot(), before);
  }
  /* A fact not held, or withdrawn, leaves the computation lacking it: undetermined, never zero. */
  const none = w.rec({ op: "sum", operands: [{ money: "MNY-2026-nothingheldhere0" }] });
  assert.deepEqual([none.part.state, none.part.undetermined.code], ["undetermined", "not_in_record"]);
  const gone = w.fact({ amount: "7" });
  assert.equal(w.money.withdrawFact({ factId: gone, reason: "misread", by: V("alice") }).ok, true);
  const wd = w.rec({ op: "sum", operands: [{ money: gone }] });
  assert.deepEqual([wd.part.state, wd.part.undetermined.code], ["undetermined", "not_in_record"]);
  assert.match(wd.part.undetermined.why, /withdrawn/);
});

test("R2 (D54): a calculation's output, named by calculation and result key, is an operand graded by its capture axis", async () => {
  const w = setup();
  const f1 = w.fact({ amount: "1250000.50" });
  const f2 = w.fact({ amount: "250000.25" });
  const calc = await w.calculation([f1, f2]);
  const p = w.rec({ op: "sum", operands: [{ calculation: calc, key: "total" }] });
  assert.equal(typeof p.then, "function", "calculations' read answers a promise, so this act does");
  const r = await p;
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual([r.part.state, r.part.measure.value, r.part.measure.currency, r.part.grade.grade],
                   ["computed", "1500000.75", "USD", "B"]);
  /* `output` names the calculation's answer too; a key naming no figure, or a calculation not held, leaves it lacking. */
  assert.equal((await w.rec({ op: "difference", operands: [{ calculation: calc, key: "output" }, { money: f2 }] })).part.measure.value,
               "1250000.50");
  const nokey = await w.rec({ op: "sum", operands: [{ calculation: calc, key: "nothing" }] });
  assert.deepEqual([nokey.part.state, nokey.part.undetermined.code], ["undetermined", "not_computable"]);
  const absent = await w.rec({ op: "sum", operands: [{ calculation: "CALC-2026-0999", key: "total" }] });
  assert.deepEqual([absent.part.state, absent.part.undetermined.code], ["undetermined", "not_in_record"]);
  /* Read internally the operand is shown, and so to every member calculations admits (its R31, R10): alice, who created
     it, and pat, who has joined P and may see its inputs; never withheld for want of a synchronous read (N576). */
  const internal = w.c.consequenceRead({ id: r.id }).part;
  assert.deepEqual(internal.computation.operands.map((o) => [o.kind, o.calculation, o.key, o.value]),
                   [["calculation", calc, "total", "1500000.75"]]);
  assert.match(internal.grade.why, new RegExp(`calculation ${calc}\\), whose capture axis is B`));
  for (const v of ["alice", "pat"]) {
    assert.deepEqual(w.calculations.calcStatusOf({ calcId: calc, viewer: V(v) }).visible, true, v);
    const seen = w.c.consequenceRead({ id: r.id, viewer: V(v) }).part;
    assert.equal("out_of_view" in seen, false, v);
    assert.deepEqual(seen, internal, `${v} is answered the part whole`);
  }
  /* A refusal before any read stays synchronous. D54 (K2408): carol, an administrator neither invited nor joined,
     sees hidden P only at EXISTENCE, so its determination is absent to her; with P set discoverable she sees it whole
     and is refused for not having joined. */
  const asCarol = () => w.rec({ op: "sum", operands: [{ calculation: calc, key: "total" }] }, { author: V("carol") });
  const hidden = asCarol();
  assert.equal(typeof hidden.then, "undefined");
  assert.equal(hidden.reason, "NO_SUCH_DETERMINATION");
  w.discoverable();
  const refused = asCarol();
  assert.equal(typeof refused.then, "undefined");
  assert.equal(refused.reason, "CONSEQUENCE_NOT_A_PARTICIPANT");
});

/* calculations as this module reads it, with its synchronous reads answering a calculation not visible to the viewers in
   `hide`, and its capture axis `grade` where given; every other read as it is. */
function fencedCalculations(w, { hide = new Set(), grade = null } = {}) {
  return new Proxy(w.calculations, { get: (t, p) => {
    if (p === "calcStatusOf")
      return (a) => (hide.has(a.viewer) ? { held: true, visible: false, accepted: false } : t.calcStatusOf(a));
    if (p === "gradeFactsOf")
      return (a) => { if (hide.has(a.viewer)) return { found: false };
                      const g = t.gradeFactsOf(a); return grade && g.found ? { ...g, capture: { grade, why: "the test's grade" } } : g; };
    return typeof t[p] === "function" ? t[p].bind(t) : t[p];
  } });
}

test("R2 (N576): a calculation operand's sight and grade are calculations' synchronous reads; one not visible to the author is not in the record", async () => {
  const w = setup();
  const f1 = w.fact({ amount: "1250000.50" });
  const calc = await w.calculation([f1]);
  const over = (calculations) => new Consequences({ storage: w.st, host: w.host, record: w.record, membership: w.membership,
    promotion: w.promotion, conformance: { determinationRead: (a) => w.c.conformance.determinationRead(a) }, content: w.content,
    provenance: w.prov, inquiry: w.inquiry, strength: w.strength, money: w.money, calculations, entities: w.entities,
    people: w.people, passageText: (id) => w.texts.get(id) ?? null });
  /* Its grade is gradeFactsOf's capture (its R30), the weakest named by it. */
  const graded = await over(fencedCalculations(w, { grade: "C" })).consequenceRecord({ ...w.base,
    basis: { op: "sum", operands: [{ calculation: calc, key: "total" }] } });
  assert.deepEqual([graded.part.state, graded.part.measure.value, graded.part.grade.grade], ["computed", "1250000.50", "C"]);
  assert.deepEqual(graded.part.computation.operands.map((o) => [o.grade, o.route]), [["C", "calculation"]]);
  /* Held, but answered not visible to alice: an operand not in the record, answered as an absent one, synchronously. */
  const hid = over(fencedCalculations(w, { hide: new Set([V("alice")]) }));
  const unseen = hid.consequenceRecord({ ...w.base, basis: { op: "sum", operands: [{ calculation: calc, key: "total" }] } });
  assert.equal(typeof unseen.then, "undefined", "nothing waits on read for a calculation the author may not see");
  const absent = await w.rec({ op: "sum", operands: [{ calculation: "CALC-2026-0999", key: "total" }] });
  assert.deepEqual([unseen.part.state, unseen.part.undetermined.code], ["undetermined", "not_in_record"]);
  assert.equal(unseen.part.undetermined.why, absent.part.undetermined.why, "not visible is answered exactly as not held");
  /* Negative control: pat, visible, records it computed. */
  const pat = await hid.consequenceRecord({ ...w.base, author: V("pat"),
    basis: { op: "sum", operands: [{ calculation: calc, key: "total" }] } });
  assert.deepEqual([pat.part.state, pat.part.measure.value], ["computed", "1250000.50"]);
});

test("R15 (N576): a calculation operand leaves the operands exactly when calcStatusOf answers it not visible to the viewer", async () => {
  const w = setup();
  const f1 = w.fact({ amount: "1250000.50" });
  const f2 = w.fact({ amount: "250000.25" });
  const calc = await w.calculation([f1]);
  const r = await w.rec({ op: "sum", operands: [{ calculation: calc, key: "total" }, { money: f2 }] });
  assert.equal(r.ok, true, JSON.stringify(r));
  const fenced = new Consequences({ storage: w.st, host: w.host, record: w.record, membership: w.membership,
    promotion: w.promotion, content: w.content, provenance: w.prov, inquiry: w.inquiry, strength: w.strength,
    money: w.money, calculations: fencedCalculations(w, { hide: new Set([V("pat")]) }), entities: w.entities,
    people: w.people, passageText: (id) => w.texts.get(id) ?? null });
  const alice = fenced.consequenceRead({ id: r.id, viewer: V("alice") }).part;
  assert.deepEqual(alice.computation.operands.map((o) => o.kind), ["calculation", "money"]);
  assert.equal("out_of_view" in alice, false);
  const pat = fenced.consequenceRead({ id: r.id, viewer: V("pat") }).part;
  assert.deepEqual(pat.computation.operands.map((o) => [o.kind, o.money]), [["money", f2]], "no null in its place");
  assert.equal(pat.out_of_view, true);
  assert.equal(JSON.stringify(pat).includes(calc), false, "the calculation is not named");
  assert.deepEqual([pat.measure.value, pat.grade.grade], [alice.measure.value, alice.grade.grade], "value and grade stand");
});

test("R2: each operand carries its grade; the part's grade is the weakest, named (DEC-21)", () => {
  const w = setup();
  const direct = w.figure("INFO-2026-0001-a", "Cut 100", "example.org/a", "direct");
  const archive = w.figure("INFO-2026-0002-b", "Cut 200", "example.org/b", "archive.org");
  const both = w.rec({ op: "sum", operands: [{ content: direct, figure: "100" }, { content: archive, figure: "200" }] },
                     { measure: { unit: "money" } });
  assert.deepEqual(both.part.computation.operands.map((o) => [o.grade, o.route]), [["B", "direct"], ["C", "archive"]]);
  assert.equal(both.part.grade.grade, "C");
  assert.match(both.part.grade.why, /weakest operand is 1/);
  assert.equal(w.rec({ op: "sum", operands: [{ content: direct, figure: "100" }] }, { measure: { unit: "money" } }).part.grade.grade, "B");
  /* A capture with no recorded route has an undetermined grade, so the weakest link is not known: named, never a letter. */
  const sha = w.doc("INFO-2026-0003-c", "Cut 300 (c)");
  const unrouted = w.passage("INFO-2026-0003-c", sha, "Cut 300");
  const u = w.rec({ op: "sum", operands: [{ content: direct, figure: "100" }, { content: unrouted, figure: "300" }] },
                  { measure: { unit: "money" } });
  assert.equal(u.part.state, "computed");
  assert.equal(u.part.grade.grade, null);
  assert.equal(u.part.grade.determined, false);
  assert.match(u.part.grade.why, /operand 1's capture grade is undetermined/);
});

test("R2: a machine's computed part is labelled machine work with its operands shown", () => {
  const w = setup();
  const a = w.figure("INFO-2026-0001-a", "Cut 100");
  const r = w.rec({ op: "sum", operands: [{ content: a, figure: "100" }] }, { author: MACHINE, measure: { unit: "money" } });
  assert.equal(r.part.label.machine_work, true);
  assert.match(r.part.label.says, /machine work/);
  assert.deepEqual(r.part.computation.operands.map((o) => o.figure), ["100"]);
  const m = w.rec({ op: "sum", operands: [{ content: a, figure: "100" }] }, { measure: { unit: "money" } });
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
  /* A division by zero is undetermined in calc-grammar, so here: not computable, never zero or infinity. */
  const z = w.figure("INFO-2026-0002-z", "Base 0");
  const r0 = w.rec({ op: "ratio", operands: [{ content: a, figure: "100" }, { content: z, figure: "0" }] }, { measure: { unit: "count" } });
  assert.deepEqual([r0.part.state, r0.part.undetermined.code], ["undetermined", "not_computable"]);
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
  assert.deepEqual(of.totals.map((t) => [t.state, t.value]).sort(), [["assessed", "50"], ["computed", "100"]],
                   "one total per state, never one figure across them");
  /* The significance keys are not taken from the caller either. */
  const r = w.c.consequenceRecord({ ...w.base, measure: { unit: "count", value: 3 }, basis: { rationale: "r" }, severity: "high", score: 9 });
  assert.equal(r.ok, true);
  walk(r); for (const k of keys) assert.equal(/significance|severity|priority|score/.test(k), false, k);
});
