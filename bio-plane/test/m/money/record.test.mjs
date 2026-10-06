/* money's one append site at its interface: R1–R6, and what it keeps (R17, R19, R20, R21). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, world, sha, MACHINE, ANN, BOB, OUTSIDER } from "./fixture.mjs";
import { MONEY_KINDS, PHASES, STAGES, BASES, PRECISIONS, STAGE_FAMILIES, kinds, phases, stages, bases, precisions }
  from "../../../src/money/index.mjs";

const count = (s, t = "money_facts") => s.one(`SELECT count(*) AS n FROM ${t}`).n;

test("R1 a fact is written with every axis and read back exactly: a MNY- opaque id, the exact decimal and as_read kept", () => {
  const s = seeded();
  const r = s.m.recordFact(s.fact({ codes: [{ scheme: "ellery_funds", code: "100-01" }], concerns: [s.contract] }));
  assert.equal(r.ok, true);
  assert.match(r.fact_id, /^MNY-2026-[a-z0-9]{16}$/);
  const f = s.m.readFact({ factId: r.fact_id, viewer: ANN }).fact;
  assert.equal(f.amount, "1250000.00");
  assert.equal(f.as_read, "$1,250,000.00");
  assert.deepEqual([f.kind, f.phase, f.stage, f.basis, f.currency, f.sign, f.precision],
    ["expenditure", "actual", "paid", "modified accrual", "USD", "+", "exact"]);
  assert.deepEqual(f.period, { from: "2013-04-01", to: "2014-03-31", precision: "day", zone: "America/Halifax", fiscal: "FY2013-14", body: "*" });
  assert.deepEqual(f.codes, [{ scheme: "ellery_funds", code: "100-01" }]);
  assert.deepEqual(f.concerns, [s.contract]);
});

test("R1 a float-looking input is kept exact: '0.1' stays 0.1, and a JavaScript number is refused BAD_AMOUNT", () => {
  const s = seeded();
  const id = s.rec({ amount: "0.10", as_read: "$0.10" });
  assert.equal(s.m.readFact({ factId: id, viewer: ANN }).fact.amount, "0.10");
  assert.equal(s.one(`SELECT amount FROM money_facts WHERE fact_id=?`, id).amount, "0.10");
  for (const bad of [0.1, "1e5", "-12", "$12", "4.2 million", "12.3.4", "about 2"])
    assert.equal(s.m.recordFact(s.fact({ amount: bad })).reason, "BAD_AMOUNT", String(bad));
});

test("R1 the refusals come in their stated order, each naming its closed list, and nothing is written", () => {
  const s = seeded();
  const cases = [
    [{ amount: undefined }, "NO_AMOUNT"],
    [{ amount: 5 }, "BAD_AMOUNT"],
    [{ as_read: " " }, "NO_AS_READ"],
    [{ currency: "" }, "NO_CURRENCY"],
    [{ sign: undefined }, "NO_SIGN"],
    [{ precision: "fuzzy" }, "UNKNOWN_PRECISION"],
    [{ precision: "range" }, "BAD_RANGE"],
    [{ amount: { low: "3", high: "2" }, precision: "range" }, "BAD_RANGE"],
    [{ kind: "spending" }, "UNKNOWN_MONEY_KIND"],
    [{ phase: "planned" }, "UNKNOWN_PHASE"],
    [{ basis: "vibes" }, "UNKNOWN_BASIS"],
    [{ stage: undefined }, "NO_STAGE"],
    [{ phase: "adopted" }, "STAGE_NOT_ACTUAL"],
    [{ stage: "collected" }, "UNKNOWN_STAGE"],
    [{ period: undefined }, "NO_PERIOD"],
    [{ period: { fiscal: "FY1999-00X", body: "Nobody" } }, "BAD_PERIOD"],
    [{ period: { from: "2026-02-31", to: "2026-03-01" } }, "BAD_PERIOD"],
    [{ period: { from: "2026-03-01", to: "2026-02-01" } }, "BAD_PERIOD"],
    [{ codes: [{ scheme: "nowhere", code: "1" }] }, "UNKNOWN_CODE_SCHEME"],
    [{ kind: "balance", stage: "incurred", balance_class: "committed" }, "BALANCE_CLASS_NOT_IN_FAMILY"],
    [{ to: { entity: "ENT-2026-9999" } }, "NO_SUCH_ENTITY"],
    [{ concerns: ["EVT-2026-aaaaaaaaaaaaaaaa"] }, "NO_SUCH_EVENT"],
    [{ concerns: ["DUT-2026-0001"] }, "CONCERNS_DUTY"],
    [{ source: undefined }, "NO_SOURCE"],
  ];
  for (const [over, code] of cases) {
    const r = s.m.recordFact(s.fact(over));
    assert.equal(r.ok, false, code);
    assert.equal(r.reason, code, `${JSON.stringify(over)} answers ${r.reason}: ${r.detail}`);
  }
  assert.deepEqual(s.m.recordFact(s.fact({ kind: "x" })).list, MONEY_KINDS);
  assert.deepEqual(s.m.recordFact(s.fact({ phase: "x" })).list, PHASES);
  assert.deepEqual(s.m.recordFact(s.fact({ basis: "x" })).list, BASES);
  assert.equal(count(s), 0);
  // the order: an absent amount is answered before every later fault
  assert.equal(s.m.recordFact(s.fact({ amount: undefined, kind: "x", source: undefined })).reason, "NO_AMOUNT");
  assert.equal(s.m.recordFact(s.fact({ kind: "x", period: undefined })).reason, "UNKNOWN_MONEY_KIND");
});

test("R1 the stage families: each kind takes only its family's stages, a stage only on an actual amount", () => {
  const s = seeded();
  for (const kind of MONEY_KINDS) for (const stage of STAGES) {
    const r = s.m.recordFact(s.fact({ kind, stage }));
    assert.equal(r.ok, STAGE_FAMILIES[kind].includes(stage), `${kind}/${stage}: ${r.reason}`);
  }
  assert.equal(s.m.recordFact(s.fact({ phase: "proposed", stage: null })).ok, true);
});

test("R1 a range carries its low and high; an adjustment is a signed fact naming the fact it adjusts", () => {
  const s = seeded();
  const r = s.rec({ amount: { low: "1,900,000", high: "2,100,000" }, precision: "range", as_read: "$1.9 to $2.1 million" });
  assert.deepEqual(s.m.readFact({ factId: r, viewer: ANN }).fact.amount, { low: "1900000", high: "2100000" });
  const base = s.rec({ phase: "adopted", stage: null });
  const adj = s.rec({ phase: "adjusted", stage: null, sign: "-", amount: "50000", as_read: "(50,000)", adjusts: base });
  const f = s.m.readFact({ factId: adj, viewer: ANN }).fact;
  assert.deepEqual([f.sign, f.adjusts], ["-", base]);
  assert.deepEqual(s.m.readFact({ factId: base, viewer: ANN }).fact.adjustments, [adj]);
});

test("R1 a period is a date-time range with its zone (the profile's by default), or a fiscal key mapped through civil-time for the body", () => {
  const s = seeded();
  const a = s.rec({ period: { from: "2014-01-01", to: "2014-12-31" } });
  assert.equal(s.m.readFact({ factId: a, viewer: ANN }).fact.period.zone, "America/Halifax");
  const b = s.rec({ period: { fiscal: "HD2014", body: "Port Ellery Harbour District" } });
  const p = s.m.readFact({ factId: b, viewer: ANN }).fact.period;
  assert.deepEqual([p.from, p.to], ["2013-10-01", "2014-09-30"]);
  assert.equal(s.m.recordFact(s.fact({ period: { fiscal: "HD2014" } })).reason, "BAD_PERIOD");
});

test("R1 balance_class is read against the family of the fund's held type (GASB 54 for a governmental fund)", () => {
  const s = seeded();
  const bal = (cls, fund = s.general) => s.m.recordFact(s.fact({ kind: "balance", stage: "incurred", balance_class: cls, to: { fund }, from: null }));
  assert.equal(bal("committed").reason, "BALANCE_CLASS_NOT_IN_FAMILY");
  assert.equal(s.m.setFundType({ fund: s.general, type: "governmental", basis: "ACFR note 1", by: ANN }).ok, true);
  assert.equal(bal("committed").ok, true);
  assert.equal(bal("net_investment_in_capital_assets").reason, "BALANCE_CLASS_NOT_IN_FAMILY");
  s.m.setFundType({ fund: s.harbour, type: "proprietary", basis: "ACFR note 1", by: ANN });
  assert.equal(bal("unrestricted", s.harbour).ok, true);
  assert.equal(s.m.recordFact(s.fact({ balance_class: "committed" })).reason, "BALANCE_CLASS_NOT_IN_FAMILY");
  assert.equal(s.m.setFundType({ fund: s.city, type: "governmental", basis: "b", by: ANN }).reason, "NOT_A_FUND");
});

test("R1 concerns: events, entities of kind contract, fund, program or proceeding, and lines; never another kind", () => {
  const s = seeded();
  const award = s.event("award", [s.contract]);
  const line = s.line();
  assert.equal(s.m.recordFact(s.fact({ concerns: [award, s.contract, s.general, line] })).ok, true);
  assert.equal(s.m.recordFact(s.fact({ concerns: [s.city] })).reason, "CONCERNS_KIND");
  assert.equal(s.m.recordFact(s.fact({ concerns: ["LIN-2026-nope000000000001"] })).reason, "NO_SUCH_LINE");
  assert.equal(s.m.recordFact(s.fact({ concerns: ["SRC-2026-0001"] })).reason, "CONCERNS_UNKNOWN");
  assert.equal(s.m.recordFact(s.fact({ from: { fund: s.city } })).reason, "NOT_A_FUND");
  const bare = seeded({ events: false });
  assert.equal(bare.m.recordFact(bare.fact({ concerns: ["EVT-2026-award00000000001"] })).reason, "NO_SUCH_EVENT");
});

test("R2 exactly one source, never a calculation, held and visible to the writer; adjusts names a held fact", () => {
  const s = seeded();
  const r = (source) => s.m.recordFact(s.fact({ source })).reason;
  assert.equal(r(undefined), "NO_SOURCE");
  assert.equal(r([{ capture_sha: s.cap }, { capture_sha: s.cap }]), "TWO_SOURCES");
  assert.equal(r({ capture_sha: s.cap, fact: "MNY-2026-aaaaaaaaaaaaaaaa" }), "TWO_SOURCES");
  assert.equal(r({ capture_sha: s.cap, table: "TBL-1", row: 1, binding: "BND-1" }), "TWO_SOURCES");
  assert.equal(r({ fact: "CALC-2026-0001" }), "SOURCE_IS_CALCULATION");
  assert.equal(r("CALC-2026-0001"), "SOURCE_IS_CALCULATION");
  assert.equal(r({ capture_sha: sha("never held") }), "SOURCE_NOT_HELD");
  assert.equal(r({ fact: "MNY-2026-aaaaaaaaaaaaaaaa" }), "SOURCE_NOT_HELD");
  assert.equal(r({ capture_sha: s.cap, extent: { kind: "bogus" } }), "SOURCE_EXTENT_UNREADABLE");
  s.project("PROJ-1", "bob");
  const hidden = s.held("INFO-H", sha("hidden"), { project: "PROJ-1" });
  assert.equal(s.m.recordFact(s.fact({ source: { capture_sha: hidden }, by: OUTSIDER })).reason, "SOURCE_NOT_HELD");
  assert.equal(s.m.recordFact(s.fact({ source: { capture_sha: hidden }, by: BOB })).ok, true);
  assert.equal(s.m.recordFact(s.fact({ adjusts: "MNY-2026-aaaaaaaaaaaaaaaa" })).reason, "ADJUSTS_NOT_HELD");
  const base = s.rec();
  const derived = s.rec({ source: { fact: base } });
  assert.deepEqual(s.m.readFact({ factId: derived, viewer: ANN }).fact.source, { fact: base });
  assert.deepEqual(s.m.readFact({ factId: base, viewer: ANN }).fact.cited_by, [derived]);
});

test("R3 the reading grade is the source's, never raised; a machine's reading carries its method; a typed transcription is a member's", () => {
  const s = seeded();
  const direct = s.rec();
  assert.equal(s.m.readFact({ factId: direct, viewer: ANN }).fact.grade.reading, "B");
  const upload = s.held("INFO-U", sha("uploaded"), { direct: false });
  const u = s.rec({ source: { capture_sha: upload } });
  const g = s.m.readFact({ factId: u, viewer: ANN }).fact.grade;
  assert.equal(g.reading, null);
  assert.match(g.reading_basis, /unrecorded/);
  const onFact = s.rec({ source: { fact: direct }, method: "reader" });
  const f = s.m.readFact({ factId: onFact, viewer: ANN }).fact;
  assert.deepEqual([f.grade.reading, f.method], ["B", "reader"]);
  assert.equal(s.m.readFact({ factId: direct, viewer: ANN }).fact.method, "typed");
  assert.equal(s.m.recordFact(s.fact({ by: MACHINE, method: "typed" })).reason, "TYPED_NOT_MEMBER");
  assert.equal(s.m.recordFact(s.fact({ method: "guess" })).reason, "NO_METHOD");
  // the grade is the module's to assign: a caller's grade is a field outside the shape
  assert.equal(s.m.recordFact(s.fact({ grade: { reading: "A" } })).reason, "UNKNOWN_FIELD");
});

test("R3 each party's entity resolution grade is answered apart from the reading grade", () => {
  const s = seeded();
  s.resolution(s.cap, s.city, "C");
  s.resolution(s.cap, s.city, "A");
  const id = s.rec();
  assert.deepEqual(s.m.readFact({ factId: id, viewer: ANN }).fact.grade.parties, { from: "A", to: null });
});

test("R4 the machine writes only from a canonical table row read through a binding a member adopted, each party a registered entity; an identifier it states must be its entity's", () => {
  const s = seeded();
  s.bindings.set("BND-1", { adopted: ANN, table: "TBL-payments", roles: { from: "payer", to: "payee" }, capture_sha: s.cap });
  s.bindings.set("BND-2", { adopted: null, table: "TBL-payments", roles: {}, capture_sha: s.cap });
  const row = { table: "TBL-payments", row: 17, binding: "BND-1" };
  const machine = (over) => s.m.recordFact(s.fact({ by: MACHINE, method: "table_binding", source: row,
    from: { entity: s.city, as_written: "City of Port Ellery" }, to: { entity: s.vendor, as_written: "Harbour Dredging Co" }, ...over }));
  const ok = machine({});
  assert.equal(ok.ok, true, ok.detail);
  const f = s.m.readFact({ factId: ok.fact_id, viewer: ANN }).fact;
  assert.deepEqual(f.source, { table: "TBL-payments", row: "17", binding: "BND-1", capture_sha: s.cap });
  assert.match(f.citation, /^row 17 of the table TBL-payments, read from capture [0-9a-f]{64} through the binding BND-1$/);
  assert.equal(f.grade.reading, "B");
  assert.equal(s.one(`SELECT source_capture_sha FROM money_facts WHERE fact_id=?`, ok.fact_id).source_capture_sha, s.cap);
  assert.equal(machine({ source: { capture_sha: s.cap } }).reason, "MACHINE_NEEDS_IDENTIFIERS");
  assert.equal(machine({ to: { as_written: "Harbour Dredging Co" } }).reason, "MACHINE_NEEDS_IDENTIFIERS");
  assert.equal(machine({ to: null }).reason, "MACHINE_NEEDS_IDENTIFIERS");
  const payee = s.entity("person", "Pat Payee");
  const idf = s.identify(payee, "ellery_person", "P002");
  assert.equal(machine({ to: { entity: payee, identifier: idf } }).ok, true);
  assert.equal(machine({ from: { entity: s.city, identifier: idf } }).reason, "MACHINE_NEEDS_IDENTIFIERS");
  assert.equal(machine({ source: { ...row, binding: "BND-2" } }).reason, "SOURCE_NOT_HELD", "a binding no member adopted");
  assert.equal(machine({ source: { ...row, binding: "BND-9" } }).reason, "SOURCE_NOT_HELD");
  assert.equal(machine({ source: { ...row, table: "TBL-other" } }).reason, "SOURCE_NOT_HELD");
  assert.equal(machine({ method: undefined }).reason, "NO_METHOD");
  assert.equal(count(s), 2);
  const bare = seeded({ calculations: false });
  assert.equal(bare.m.recordFact(bare.fact({ source: row })).reason, "SOURCE_NOT_HELD");
});

test("R6 no field, flag or read marks a fact as the group's own: such a field is refused UNKNOWN_FIELD, and no read answers one", () => {
  const s = seeded();
  for (const field of ["ours", "own", "is_group", "group_money", "mine"]) {
    assert.equal(s.m.recordFact(s.fact({ [field]: true })).reason, "UNKNOWN_FIELD", field);
    assert.equal(s.m.recordFact(s.fact({ to: { entity: s.vendor, [field]: true } })).reason, "UNKNOWN_FIELD", field);
  }
  const id = s.rec();
  const f = s.m.readFact({ factId: id, viewer: ANN }).fact;
  assert.equal(JSON.stringify(f).match(/"(ours|own|is_group|mine|group_own)"/), null);
  const cols = s.rows(`PRAGMA table_info(money_facts)`).map((c) => c.name);
  assert.equal(cols.some((c) => /own|ours|group/.test(c)), false);
});

test("R17 kinds, phases, stages, bases and precisions answer the closed lists, frozen", () => {
  const { m } = world();
  for (const [fn, xs] of [["kinds", MONEY_KINDS], ["phases", PHASES], ["stages", STAGES], ["bases", BASES], ["precisions", PRECISIONS]]) {
    assert.deepEqual(m[fn](), xs);
    assert.equal(Object.isFrozen(m[fn]()), true, fn);
  }
  for (const [fn, xs] of [[kinds, MONEY_KINDS], [phases, PHASES], [stages, STAGES], [bases, BASES], [precisions, PRECISIONS]])
    assert.equal(fn(), xs, "the module-level functions answer the same frozen lists");
  assert.equal(MONEY_KINDS.length, 14);
  assert.deepEqual(STAGES, ["encumbered", "incurred", "paid", "assessed", "collected"]);
});

test("R19 the facts table is the stated read contract: signed amount, currency, kind, phase, stage, basis, period, the parties' entity and fund, withdrawal", () => {
  const s = seeded();
  const id = s.rec({ sign: "-", amount: "996", as_read: "(996)" });
  const row = s.one(`SELECT fact_id, amount, currency, sign, kind, phase, stage, basis, period_from, period_to, from_entity, from_fund,
                     to_entity, to_fund, source_capture_sha FROM money_facts WHERE fact_id=?`, id);
  assert.deepEqual(row, { fact_id: id, amount: "-996", currency: "USD", sign: "-", kind: "expenditure", phase: "actual", stage: "paid",
    basis: "modified accrual", period_from: "2013-04-01", period_to: "2014-03-31", from_entity: s.city, from_fund: s.general,
    to_entity: s.vendor, to_fund: null, source_capture_sha: s.cap });
  const onFact = s.rec({ source: { fact: id }, concerns: [s.contract, s.general] });
  assert.equal(s.one(`SELECT source_capture_sha FROM money_facts WHERE fact_id=?`, onFact).source_capture_sha, null);
  assert.deepEqual(s.rows(`SELECT fact_id, concerns FROM money_concerns WHERE fact_id=? ORDER BY concerns`, onFact),
    [s.contract, s.general].sort().map((c) => ({ fact_id: onFact, concerns: c })));
  assert.equal(s.one(`SELECT count(*) AS n FROM money_withdrawals WHERE fact_id=?`, id).n, 0);
  s.m.withdrawFact({ factId: id, reason: "misread", by: ANN });
  assert.equal(s.one(`SELECT count(*) AS n FROM money_withdrawals WHERE fact_id=?`, id).n, 1);
});

test("R20 one home per fact at the store's gate: one source never a calculation, no HYP- id, no duty, no total", () => {
  const s = seeded();
  assert.equal(s.m.recordFact(s.fact({ concerns: ["HYP-2026-0001"] })).reason, "HYPOTHESIS_ID");
  assert.equal(count(s), 0);
  const row = { fact_id: "MNY-2026-aaaaaaaaaaaaaaaa", source_capture_sha: s.cap, source_extent: '{"kind":"document"}', source_table: null, source_fact: null };
  assert.equal(s.record.storeGate("money", "money_facts", { ...row, source_fact: "MNY-2026-bbbbbbbbbbbbbbbb" }, "insert").reason, "ONE_SOURCE");
  assert.equal(s.record.storeGate("money", "money_facts", { ...row, source_table: "TBL-1" }, "insert").reason, "ONE_SOURCE");
  assert.equal(s.record.storeGate("money", "money_facts", { ...row, source_extent: null }, "insert").reason, "ONE_SOURCE");
  assert.equal(s.record.storeGate("money", "money_facts", { ...row, source_capture_sha: null }, "insert").reason, "ONE_SOURCE");
  assert.equal(s.record.storeGate("money", "money_facts", { ...row, source_capture_sha: null, source_extent: null, source_fact: "CALC-2026-0001" }, "insert").reason, "SOURCE_IS_CALCULATION");
  assert.equal(s.record.storeGate("money", "money_facts", { ...row, adjusts: "HYP-2026-0002" }, "insert").reason, "HYPOTHESIS_ID");
  assert.equal(s.record.storeGate("money", "money_facts", { ...row, total: "5" }, "insert").reason, "TOTAL_NOT_STORED");
  assert.equal(s.record.storeGate("money", "money_concerns", { fact_id: row.fact_id, concerns: "DUT-2026-0001" }, "insert").reason, "CONCERNS_DUTY");
  assert.equal(s.record.storeGate("money", "money_facts", row, "insert"), null);
  const cols = s.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'money%'`).map((r) => r.name);
  for (const t of cols) assert.equal(s.rows(`PRAGMA table_info(${t})`).some((c) => /total|^sum/.test(c.name)), false, t);
});

test("R21 sight: a fact follows its source capture's visibility, a fact on a fact its source's; the tables are declared with their classes", () => {
  const s = seeded();
  s.project("PROJ-1", "bob");
  const hidden = s.held("INFO-H", sha("hidden"), { project: "PROJ-1" });
  const a = s.rec({ source: { capture_sha: hidden }, by: BOB });
  const b = s.rec({ source: { fact: a }, by: BOB });
  for (const id of [a, b]) {
    assert.equal(s.m.readFact({ factId: id, viewer: BOB }).found, true);
    assert.equal(s.m.readFact({ factId: id, viewer: OUTSIDER }).found, false);
    assert.equal(s.m.readFact({ factId: id }).found, false, "an absent viewer sees nothing");
  }
  const decl = s.record.declaredTables().filter((d) => d.module === "money");
  assert.deepEqual(decl.map((d) => d.name).sort(), ["money_codes", "money_concerns", "money_facts", "money_fund_types",
    "money_set_acts", "money_set_proposals", "money_sets", "money_withdrawals"]);
  for (const d of decl) {
    assert.equal(d.sight, ["money_sets", "money_set_acts", "money_set_proposals", "money_fund_types"].includes(d.name) ? "group" : "source", d.name);
    for (const c of ["purge", "expunge", "export", "derive", "version_chain"]) assert.notEqual(d[c], undefined, `${d.name}.${c}`);
  }
  const purged = s.record.purge({ bundleId: "INFO-H" });
  assert.equal(purged.scope, "INFO-H");
  assert.equal(s.one(`SELECT count(*) AS n FROM money_facts WHERE fact_id IN (?, ?)`, a, b).n, 0);
});
