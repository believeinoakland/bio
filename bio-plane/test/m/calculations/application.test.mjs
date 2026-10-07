/* calculations: the engine marks (R9, T35) and the patterns of application (R32–R37): the held uses frozen as a table,
   the recipes of application over it, a target met or not, policy against practice, and the words never used. events'
   and standards' T35 reads are providers at their requirements' interfaces (`usesProvider`, `standardsProvider`). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, R, usesProvider, standardsProvider, sha } from "./fixture.mjs";
import { USES_HEADER, APPLICATION_KINDS, APPLICATION_RECIPES, NONE_HELD, FILE_ENGINE, calculationsOps, foldReason }
  from "../../../src/calculations/index.mjs";

const code = (r) => (r && r.ok === false ? r.reason : "ok");
const PERIOD = { from: "2025-01-01", to: "2026-12-31" };
const url = (params) => new URL(`https://plane.test/?${new URLSearchParams(params)}`);
const num = (f) => (f && typeof f.value === "string" ? f.value : f);

/* A world whose calculations reads the providers. */
function world() {
  const w = seeded({ construct: false });
  w.uses = usesProvider(w);
  w.std = standardsProvider(w);
  w.c = w.build({ events: w.uses, standards: w.std });
  return w;
}

/* The uses table's rows, from its canonical bytes. */
async function rows(w, tableSha) {
  const t = await w.c.readTable({ sha: tableSha, viewer: V("bob"), limit: 1000 });
  return t.table.rows;
}

const app = (w, kind, uses, terms = {}, extra = {}) => w.c.create({ question: `${kind}?`, period: PERIOD, kind, terms,
  inputs: [{ name: "uses", table: uses }], by: V("bob"), ...extra });

test("R9 an input a third-party engine computed (a table from a workbook range holding a formula cell, a figure citing a formula cell) carries engine, the file's spreadsheet program, and engine_measured false, its grade undetermined with why and the derivation step third-party engine, so strength stops on it; every other input carries engine: null; gradeFactsOf answers the same two fields", async () => {
  const w = world();
  const F = [{ name: "dept", type: "string" }, { name: "amount", type: "number" }];
  const cells = (formula) => [["A1", "dept"], ["B1", "amount"], ["A2", "parks"], ["B2", "12"], ["A3", "roads"], ["B3", "30"]]
    .map(([cell, value]) => ({ source: { cell }, value, type: "s", ...(formula && cell === "B3" ? { formula: "B2+18", cached: "30" } : {}) }));
  const withF = await w.c.declareTable({ source: w.sheet(cells(true), "A1:B3"), schema: { fields: F }, header: ["dept", "amount"], by: V("bob") });
  const without = await w.c.declareTable({ source: w.csv("dept,amount\nparks,12\nroads,31\n"), schema: { fields: F }, header: ["dept", "amount"], by: V("bob") });
  assert.equal(withF.ok, true);
  const SUM = R([{ op: "sum", from: "t", field: "amount", as: "s" }], "s");
  const a = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "t", table: withF.sha }], recipe: SUM, by: V("bob") });
  const b = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "t", table: without.sha }], recipe: SUM, by: V("bob") });
  const ga = w.c.gradeFactsOf({ calcId: a.calc_id, viewer: V("carol") });
  const [ia] = ga.inputs;
  assert.equal(ia.engine, FILE_ENGINE);
  assert.equal(FILE_ENGINE, "the file's spreadsheet program", "no engine is recorded by the reader, so the file's program is named");
  assert.equal(ia.engine_measured, false);
  assert.equal(ia.grade, null, "undetermined while the engine's agreement is not measured");
  assert.equal(ia.derivation_step, "third-party engine");
  assert.match(ia.why, /third-party engine/);
  assert.equal(ga.capture.grade, null, "the capture axis is undetermined, so strength stops on it (its R36)");
  assert.match(ga.capture.why, /undetermined/);
  const read = await w.c.read({ calcId: a.calc_id, viewer: V("carol") });
  assert.deepEqual(read.grade.inputs, ga.inputs, "read answers the same");
  const [ib] = w.c.gradeFactsOf({ calcId: b.calc_id, viewer: V("carol") }).inputs;
  assert.equal(ib.engine, null, "a table with no formula cell: engine null");
  assert.equal(ib.grade, "B");
  /* a figure citing one formula cell, and a typed value, beside each other */
  const book = w.document("workbook of figures");
  w.ex.readings[book.capSha] = { pageCount: 1, chain: [{ step: "layer", tier: 1, container: "xlsx", cap: null, measured_by: null, calibration: null }],
    textContainer: { sheets: ["S"] }, reading: { cells: { S: [{ source: { cell: "C4" }, value: "42", type: "n", formula: "SUM(C1:C3)", cached: "42" }] } } };
  const cell = w.content.mint({ bundleId: book.bundleId, captureSha: book.capSha, extent: { kind: "sheet-cell", sheet: "S", cell: "C4" }, mintedBy: V("bob") });
  assert.equal(cell.ok, true, JSON.stringify(cell));
  const f = await w.c.create({ question: "Q", period: PERIOD, kind: "difference", inputs: [{ name: "x", figure: cell.content_id }, { name: "y", value: "2" }],
    recipe: R([{ op: "difference", a: "x", b: "y", as: "d" }], "d", [{ name: "x", kind: "figure" }, { name: "y", kind: "figure" }]), by: V("bob") });
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const gf = w.c.gradeFactsOf({ calcId: f.calc_id, viewer: V("bob") }).inputs;
  assert.deepEqual(gf.map((i) => [i.name, i.engine, i.engine_measured]), [["x", FILE_ENGINE, false], ["y", null, null]]);
});

test("R32 freezeUses freezes the held uses a member may see as a table input: canonical CSV keyed by its sha256, one row per act with R32's columns; an act whose when is undetermined is a row with its band (or none); relationships names the direct ties valid at the act's when, empty read none held; reason_fold is the term fold; the filter, the member and the instant recorded; a member freezes, the machine never; NO_USES; NO_SUCH_PROJECT", async () => {
  const w = world();
  const p = w.person("Dana Reyes"), q = w.person("Lee Ortiz");
  const o = w.entity("Harbour Builders", "institution");
  w.lines.recordLine({ kind: "holds", from: p, to: o, capacity: "employee", valid: { from: "2020-01-01", to: "2024-12-31" }, basis: { statement: "the roll" }, by: V("bob") });
  w.lines.recordLine({ kind: "contracts_with", from: p, to: o, valid: { from: "2025-01-01", to: "2027-12-31" }, basis: { statement: "the contract" }, by: V("bob") });
  const before = w.snapshot();
  assert.equal(code(await w.c.freezeUses({ by: V("bob") })), "NO_USES", "nothing held");
  const e1 = w.uses.use({ decider: p, subject: o, when: "2026-01-05", reason: "In the  interest of the PUBLIC.", provision: { standard: "STD-2026-x", portion: "s1" } });
  const e2 = w.uses.use({ kind: "waiver", decider: q, subject: o, when: ["2026-01-01", "2026-03-31"], outcome: "denied" });
  const e3 = w.uses.use({ decider: q, subject: o, when: null, reason: "none", outcome: "other" });
  assert.equal(code(await w.c.freezeUses({ by: MACHINE })), "MEMBER_ACT_ONLY", "the machine never freezes");
  assert.equal(code(await w.c.freezeUses({ by: V("bob"), project: "PROJ-2026-none" })), "NO_SUCH_PROJECT");
  assert.equal(code(await w.c.freezeUses({ by: V("bob"), decider: w.person("Nobody") })), "NO_USES");
  assert.equal(code(await w.c.freezeUses({ by: V("bob"), kinds: ["meeting"] })), "KIND_NOT_DISCRETION", "events' refusal, by its name");
  const after = w.snapshot();
  for (const t of Object.keys(after).filter((k) => k.startsWith("calc_") || k === "calculations")) assert.deepEqual(after[t], before[t], `${t}: no refusal wrote`);
  const P = w.project("Uses", "bob");
  const f = await w.c.freezeUses({ by: V("bob"), project: P, kinds: ["discretion", "waiver"] });
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.deepEqual(f.header, USES_HEADER);
  assert.deepEqual(USES_HEADER, ["event_id", "kind", "provision_standard", "provision_portion", "decider", "decider_kind", "subject", "subject_kind",
    "subject_sector", "when_start", "when_end", "when_precision", "reason_stated", "reason_fold", "outcome", "relationships"]);
  const bytes = new TextDecoder().decode(w.ev.m.get(f.sha));
  assert.equal(sha(bytes), f.sha, "keyed by the sha256 of its canonical bytes, held in the evidence store");
  assert.ok(bytes.endsWith("\r\n") && bytes.startsWith(`${USES_HEADER.join(",")}\r\n`), "canonical RFC 4180 CSV");
  assert.deepEqual(f.source.filter, { kinds: ["discretion", "waiver"] });
  assert.equal(f.source.frozen_by, V("bob"));
  assert.equal(f.source.frozen_at, "2026-10-06T01:00:00.000Z");
  assert.match(f.says, /a population, not a census/);
  const [r1, r2, r3] = await rows(w, f.sha);
  assert.deepEqual([r1.event_id, r2.event_id, r3.event_id], [e1, e2, e3]);
  assert.deepEqual({ ...r1 }, { event_id: e1, kind: "discretion", provision_standard: "STD-2026-x", provision_portion: "s1", decider: p, decider_kind: "person",
    subject: o, subject_kind: "institution", subject_sector: "undetermined", when_start: "2026-01-05", when_end: "2026-01-05", when_precision: "day",
    reason_stated: "1", reason_fold: "in the interest of the public", outcome: "granted", relationships: "contract;former_employment" });
  assert.equal(foldReason("In the  interest of the PUBLIC."), "in the interest of the public", "extraction's fold, every term in order");
  assert.deepEqual([r2.when_start, r2.when_end, r2.when_precision, r2.reason_stated, r2.reason_fold], ["2026-01-01", "2026-03-31", "band", "0", ""], "a band is held as its band");
  assert.equal(r2.relationships, "", "no tie held between q and the institution");
  assert.equal(NONE_HELD, "none held", "an empty relationships cell is read none held, never none");
  assert.deepEqual([r3.when_start, r3.when_end, r3.when_precision], ["", "", ""], "placed nowhere: a row all the same");
  /* frozen again: the same table */
  assert.equal((await w.c.freezeUses({ by: V("bob"), project: P, kinds: ["discretion", "waiver"] })).already, true);
  /* through the ops map */
  const op = await calculationsOps(w.c, url({ viewer: V("carol") }), { kinds: ["waiver"], by: V("bob") }).usesfreeze();
  assert.equal(op.ok, true);
  assert.equal(op.frozen_by, V("carol"), "the stamp is the url's");
});

test("R32 a frozen uses table is an input like any table: its grade each row's governing attestation's, the table's the weakest; withheld whole, with every calculation over it, from a viewer who may not see one of its events (R10); keyed to its project for purge", async () => {
  const w = world();
  const p = w.person("Dana Reyes"), o = w.entity("Harbour Builders", "institution");
  const e1 = w.uses.use({ decider: p, subject: o, when: "2026-01-05", grade: "B" });
  w.uses.use({ decider: p, subject: o, when: "2026-02-05", grade: "C" });
  const P = w.project("Uses", "bob");
  const f = await w.c.freezeUses({ by: V("bob"), project: P });
  const c = await app(w, "reasons_missing", f.sha);
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  const g = w.c.gradeFactsOf({ calcId: c.calc_id, viewer: V("bob") });
  assert.deepEqual([g.inputs[0].grade, g.capture.grade], ["C", "C"], "the weakest governing attestation");
  w.uses.hide(e1, V("carol"));
  w.st.sql.exec(`UPDATE members SET role='member' WHERE member_id='carol'`);
  w.c.joined = w.c.joined; /* no-op: sight is read at each call */
  assert.equal((await w.c.readTable({ sha: f.sha, viewer: V("carol") })).found, false);
  assert.equal((await w.c.read({ calcId: c.calc_id, viewer: V("carol") })).found, false, "withheld whole");
  assert.deepEqual(w.c.gradeFactsOf({ calcId: c.calc_id, viewer: V("carol") }), { found: false });
  assert.equal((await w.c.read({ calcId: c.calc_id, viewer: V("bob") })).found, true);
  /* a placed-nowhere event has no governing attestation: the grade is undetermined, said so */
  w.uses.use({ decider: p, subject: o, when: null });
  const f2 = await w.c.freezeUses({ by: V("bob") });
  const c2 = await app(w, "reasons_missing", f2.sha);
  assert.equal(w.c.gradeFactsOf({ calcId: c2.calc_id, viewer: V("bob") }).capture.grade, null);
  w.record.purge({ bundleId: P });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM calc_uses WHERE sha=?`, f.sha)[0].n, 0, "purged with its project");
});

test("R33 applicationRecipes lists the recipes of application as data; outcome_rate_by, reasons_missing, reasons_repeated and waiver_share each state their denominator, population and derivation, with rows that could not be counted counted apart; a result is the member's calculation, never Noticed, never gated; a recipe not the template's is refused", async () => {
  const w = world();
  const a = w.person("Dana Reyes"), b = w.person("Lee Ortiz"), o = w.entity("Harbour Builders", "institution");
  const boiler = "Granted in the interest of the public.";
  w.uses.use({ decider: a, subject: o, when: "2025-03-01", reason: boiler, outcome: "granted" });
  w.uses.use({ decider: a, subject: o, when: "2025-04-01", reason: "granted IN the interest of the public", outcome: "granted" });
  w.uses.use({ decider: a, subject: o, when: "2026-02-01", reason: "none", outcome: "denied" });
  w.uses.use({ kind: "waiver", decider: b, subject: o, when: ["2025-12-01", "2026-01-31"], reason: "The site is constrained.", outcome: "granted" });
  w.uses.use({ decider: b, subject: o, when: null, reason: "none", outcome: "other" });
  const f = await w.c.freezeUses({ by: V("bob") });
  const list = w.c.applicationRecipes();
  assert.deepEqual(list.recipes.map((r) => r.recipe), APPLICATION_KINDS);
  assert.deepEqual(APPLICATION_KINDS, ["outcome_rate_by", "reasons_missing", "reasons_repeated", "waiver_share", "consistency", "before_after", "target_met", "policy_against_practice"]);
  assert.ok(APPLICATION_RECIPES.every((r) => r.terms && r.inputs && r.says));
  assert.deepEqual((await calculationsOps(w.c, url({ viewer: V("bob") }), {}).applicationrecipes()).recipes, list.recipes);
  /* outcome_rate_by decider */
  const byD = await app(w, "outcome_rate_by", f.sha, { by: "decider" });
  assert.equal(byD.ok, true, JSON.stringify(byD).slice(0, 400));
  const A = byD.results.application;
  assert.equal(num(A.denominator.rows), "5");
  assert.equal(A.population[0].table, f.sha);
  assert.ok(A.population[0].filter && A.derivation);
  const ga = A.groups.find((g) => g.group === a);
  assert.equal(num(ga.rows), "3");
  assert.deepEqual([ga.shares.granted.numerator, ga.shares.granted.denominator].map(num), ["2", "3"], "each share with its denominator");
  assert.match(A.people, /K1483/);
  /* by period of when: a band across two years and an undetermined when are counted apart */
  const byY = (await app(w, "outcome_rate_by", f.sha, { by: "when", period: "year" })).results;
  assert.deepEqual(byY.application.groups.map((g) => [g.group, num(g.rows)]), [["2025", "2"], ["2026", "1"]]);
  assert.ok(byY.undetermined_rows >= 1 && byY.application.counted_apart.length, "the undetermined when, stated apart");
  /* outcomes named: an other outcome counted apart */
  const named = (await app(w, "outcome_rate_by", f.sha, { by: "decider", outcomes: ["granted", "denied"] })).results.application;
  assert.equal(num(named.counted_apart.find((x) => x.step === "other_outcome").rows), "1");
  assert.equal(num(named.denominator.rows), "4");
  /* reasons_missing */
  const miss = (await app(w, "reasons_missing", f.sha)).results.application.groups[0].shares.no_reason_stated;
  assert.deepEqual([miss.numerator, miss.denominator].map(num), ["2", "5"]);
  /* reasons_repeated: two acts give the same folded reason */
  const rep = (await app(w, "reasons_repeated", f.sha)).results.application;
  assert.equal(num(rep.distinct_reasons), "2");
  assert.deepEqual([rep.share_repeated.numerator, rep.share_repeated.denominator].map(num), ["2", "3"]);
  assert.deepEqual(rep.reasons.rows[0], { reason_fold: "granted in the interest of the public", count: "2" }, "each reason listed with its count");
  assert.doesNotMatch(JSON.stringify(rep), /boilerplate/i, "never named so by the machine");
  /* waiver_share */
  const ws = (await app(w, "waiver_share", f.sha)).results.application.groups[0].shares.waiver;
  assert.deepEqual([ws.numerator, ws.denominator].map(num), ["1", "5"]);
  /* the member's calculation: no Noticed, no gate, no why */
  assert.doesNotMatch(JSON.stringify(byD), /Noticed|gated|hypothesis|because/);
  assert.equal(w.count("calc_pattern_results"), 0);
  /* recomputes and accepts as any calculation */
  assert.equal((await w.c.accept({ calcId: byD.calc_id, by: V("carol") })).ok, true);
  /* refusals, with negative controls */
  assert.equal(code(await app(w, "outcome_rate_by", f.sha, { by: "colour" })), "BAD_TERMS");
  assert.equal(code(await app(w, "outcome_rate_by", f.sha, { by: "when" })), "BAD_TERMS", "a period is named");
  assert.equal(code(await app(w, "reasons_missing", f.sha, {}, { recipe: R([{ op: "count", from: "uses", as: "n" }], "n", [{ name: "uses", kind: "table" }]) })), "RECIPE_NOT_TEMPLATE");
  const other = await w.table("a,b\n1,2\n", [{ name: "a", type: "string" }, { name: "b", type: "string" }]);
  assert.equal(code(await app(w, "reasons_missing", other.sha)), "NOT_A_USES_TABLE");
});

test("R34 consistency answers, for each group of two or more like cases, the share whose outcome is the group's most frequent with the group's size, groups of one counted apart; before_after answers the outcome shares before and after a change (a standard's version or a date), an act across it counted apart, the change's date and what it rests on stated", async () => {
  const w = world();
  const a = w.person("Dana Reyes"), o = w.entity("Harbour Builders", "institution"), o2 = w.entity("Quay Traders", "institution");
  for (const [subject, outcome, when] of [[o, "granted", "2025-02-01"], [o, "granted", "2025-03-01"], [o, "denied", "2025-08-01"], [o2, "denied", "2025-09-01"]])
    w.uses.use({ decider: a, subject, outcome, when });
  w.uses.use({ decider: a, subject: o, outcome: "granted", when: ["2025-06-20", "2025-07-10"] });
  const f = await w.c.freezeUses({ by: V("bob") });
  assert.equal(code(await app(w, "consistency", f.sha, {})), "NO_LIKE_CASE_KEYS");
  assert.equal(code(await app(w, "consistency", f.sha, { keys: ["outcome"] })), "NO_LIKE_CASE_KEYS");
  const c = (await app(w, "consistency", f.sha, { keys: ["subject"] })).results.application;
  assert.equal(c.groups.length, 1);
  assert.deepEqual([c.groups[0].group, c.groups[0].most_frequent, num(c.groups[0].rows)], [{ subject: o }, "granted", "4"]);
  assert.deepEqual([c.groups[0].share.numerator, c.groups[0].share.denominator].map(num), ["3", "4"]);
  assert.equal(num(c.groups_of_one), "1", "o2's one act counted apart");
  /* before and after a date */
  const ba = (await app(w, "before_after", f.sha, { change: { date: "2025-07-01" } })).results.application;
  assert.equal(ba.change.date, "2025-07-01");
  assert.match(ba.change.rests_on.says, /the member named/);
  assert.equal(num(ba.before.rows), "2");
  assert.equal(num(ba.after.rows), "2");
  assert.equal(num(ba.counted_apart.find((x) => x.step === "across_change").rows), "1", "the band across the change counted apart");
  assert.deepEqual([ba.before.shares.granted.numerator, ba.before.shares.granted.denominator].map(num), ["2", "2"]);
  /* before and after a standard's version */
  const S = w.std.add({ period: { from: "2025-07-01", to: null } });
  const bs = (await app(w, "before_after", f.sha, { change: { standard: S } })).results.application;
  assert.equal(bs.change.date, "2025-07-01");
  assert.equal(bs.change.rests_on.standard, S);
  assert.equal(code(await app(w, "before_after", f.sha, { change: { standard: "STD-2026-nope" } })), "NO_SUCH_STANDARD");
  assert.equal(code(await app(w, "before_after", f.sha, { change: {} })), "NO_CHANGE");
});

test("R35 target_met: per period of the target, the measured value beside the threshold; where the target binds the body met or not met; where it is a benchmark the comparison only (below, at or above, faster than, slower than), labelled Benchmark · not binding on the body, never met or not met; where bindsAt is undetermined the comparison with why; the target read at its version in force (THRESHOLD_NOT_IN_FORCE); a measure whose definition differs says so beside", async () => {
  const w = world();
  const body = w.entity("Permit Office", "office");
  const target = (comparator, value, unit, binds) => w.std.add({ period: { from: "2020-01-01", to: "2030-12-31" }, binds: binds ? { [body]: binds } : {},
    target: { metric: "permits decided in time", threshold: { comparator, value, unit }, period: "each year", definition: "none" } });
  const measure = await w.table("from,to,value\n2024-01-01,2024-12-31,82\n2025-01-01,2025-12-31,95\n",
    [{ name: "from", type: "date" }, { name: "to", type: "date" }, { name: "value", type: "number" }]);
  const run = (std, extra = {}) => w.c.create({ question: "Met?", period: PERIOD, kind: "target_met", terms: { target: std, body, ...extra },
    inputs: [{ name: "measure", table: measure.sha }], by: V("bob") });
  const binding = await run(target("at_least", "90", "percent", "binds"));
  assert.equal(binding.ok, true, JSON.stringify(binding).slice(0, 400));
  const bp = binding.results.application.periods;
  assert.deepEqual(bp.map((p) => [p.to, num(p.measured), p.met]), [["2024-12-31", "82", "not met"], ["2025-12-31", "95", "met"]]);
  assert.equal(bp[0].comparison.label, "computed fact");
  const bench = await run(target("at_least", "90", "percent", "benchmark"), { definition_differs: "ours counts withdrawn applications" });
  const kp = bench.results.application.periods;
  assert.deepEqual(kp.map((p) => p.compared), ["below", "at or above"]);
  assert.ok(kp.every((p) => p.met === undefined), "a benchmark is never met or not met");
  assert.equal(kp[0].label, "Benchmark · not binding on Permit Office");
  assert.doesNotMatch(JSON.stringify(bench), /not met|nonconforming|violated/);
  assert.deepEqual(bench.results.application.definition_differs.says, "ours counts withdrawn applications");
  const slow = await run(target("at_most", "90", "days", "benchmark"));
  assert.deepEqual(slow.results.application.periods.map((p) => p.compared), ["faster than", "slower than"]);
  const open = await run(target("at_least", "90", "percent", null));
  assert.ok(open.results.application.periods.every((p) => p.compared && p.why && p.met === undefined), "bindsAt undetermined: the comparison with its why");
  const later = w.std.add({ period: { from: "2025-01-01", to: "2030-12-31" }, binds: { [body]: "binds" },
    target: { metric: "m", threshold: { comparator: "at_least", value: "90", unit: "percent" }, period: "each year", definition: "none" } });
  assert.equal(code(await run(later)), "THRESHOLD_NOT_IN_FORCE", "2024's period is before the target's version");
  assert.equal(code(await run(w.std.add({ period: { from: "2020-01-01", to: null } }))), "NO_TARGET");
  assert.equal(code(await w.c.create({ question: "Met?", period: PERIOD, kind: "target_met", terms: { target: later }, inputs: [{ name: "measure", table: measure.sha }], by: V("bob") })), "BAD_TERMS");
  /* a figure measure, over the calculation's own period */
  const fig = await w.c.create({ question: "Met?", period: { from: "2025-01-01", to: "2025-12-31" }, kind: "target_met", terms: { target: later, body },
    inputs: [{ name: "measure", value: "88" }], by: V("bob") });
  assert.deepEqual(fig.results.application.periods.map((p) => [p.to, p.met]), [["2025-12-31", "not met"]]);
});

test("R36 policy_against_practice answers the divergence (the measured rate of acts departing as the member defines departure) with its denominator, the provision at its version in force beside the practice, never the practice as the rule nor stored as a standard; a provision whose standard is not a measure is refused PROVISION_NOT_A_MEASURE naming its held state", async () => {
  const w = world();
  const a = w.person("Dana Reyes"), o = w.entity("Harbour Builders", "institution");
  for (const reason of ["none", "none", "The plan allows it.", "none"]) w.uses.use({ decider: a, subject: o, when: "2025-05-01", reason });
  const f = await w.c.freezeUses({ by: V("bob") });
  const policy = w.std.add({ period: { from: "2020-01-01", to: "2030-12-31" }, force: { portion: "s2", force: "mandatory" } });
  const cited = w.std.add({ period: { from: "2020-01-01", to: "2030-12-31" }, held: "cited" });
  const run = (standard) => w.c.create({ question: "Departs?", period: PERIOD, kind: "policy_against_practice",
    terms: { provision: { standard, portion: "s2" }, departure: [{ field: "reason_stated", test: "eq", value: 0 }] },
    inputs: [{ name: "practice", table: f.sha }], by: V("bob") });
  const refused = await run(cited);
  assert.equal(code(refused), "PROVISION_NOT_A_MEASURE");
  assert.equal(refused.held, "cited", "naming its held state");
  const standardsBefore = w.rows(`SELECT COUNT(*) AS n FROM sqlite_master WHERE name LIKE 'standard%'`)[0].n;
  const r = await run(policy);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const A = r.results.application;
  assert.deepEqual([A.practice.divergence.numerator, A.practice.divergence.denominator].map(num), ["3", "4"]);
  assert.equal(num(A.denominator.rows), "4");
  assert.deepEqual([A.provision.standard, A.provision.portion, A.provision.standing.state, A.provision.force.force], [policy, "s2", "in_force", "mandatory"]);
  assert.match(A.practice.says, /never the rule/);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM sqlite_master WHERE name LIKE 'standard%'`)[0].n, standardsBefore);
  assert.equal(w.std.held.size, 2, "nothing stored as a standard");
  assert.equal(code(await w.c.create({ question: "Q", period: PERIOD, kind: "policy_against_practice", terms: { provision: { standard: policy } },
    inputs: [{ name: "practice", table: f.sha }], by: V("bob") })), "BAD_TERMS", "the member defines departure");
});

test("R37 no result, label or sentence says nonconforming, violated, breach or not met against a standard that does not bind the body; against a benchmark below, above, slower than or faster than with its label; R27's words never used gain nonconforming and violated; no pattern of application is a shipped machine pattern or reaches the queue as Noticed", async () => {
  const w = world();
  const body = w.entity("Permit Office", "office");
  const a = w.person("Dana Reyes");
  for (const outcome of ["granted", "denied", "granted"]) w.uses.use({ decider: a, subject: body, when: "2025-05-01", outcome });
  const f = await w.c.freezeUses({ by: V("bob") });
  const out = [];
  const keep = async (p) => { const r = await p; out.push(r); return r; };
  for (const kind of ["outcome_rate_by", "reasons_missing", "reasons_repeated", "waiver_share"]) await keep(app(w, kind, f.sha, kind === "outcome_rate_by" ? { by: "subject" } : {}));
  await keep(app(w, "consistency", f.sha, { keys: ["subject"] }));
  await keep(app(w, "before_after", f.sha, { change: { date: "2025-01-01" } }));
  const measure = await w.table("from,to,value\n2025-01-01,2025-12-31,40\n", [{ name: "from", type: "date" }, { name: "to", type: "date" }, { name: "value", type: "number" }]);
  for (const binds of ["benchmark", null]) {
    const std = w.std.add({ period: { from: "2020-01-01", to: "2030-12-31" }, binds: binds ? { [body]: binds } : {},
      target: { metric: "m", threshold: { comparator: "at_least", value: "90", unit: "percent" }, period: "each year", definition: "none" } });
    await keep(w.c.create({ question: "Met?", period: PERIOD, kind: "target_met", terms: { target: std, body }, inputs: [{ name: "measure", table: measure.sha }], by: V("bob") }));
  }
  const pol = w.std.add({ period: { from: "2020-01-01", to: "2030-12-31" } });
  await keep(w.c.create({ question: "Q", period: PERIOD, kind: "policy_against_practice", terms: { provision: { standard: pol }, departure: [{ field: "outcome", test: "eq", value: "denied" }] },
    inputs: [{ name: "practice", table: f.sha }], by: V("bob") }));
  for (const r of out) assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  await keep(Promise.resolve(w.c.applicationRecipes()));
  for (const r of out.slice(0, -1)) await keep(w.c.read({ calcId: r.calc_id, viewer: V("bob") }));
  const text = JSON.stringify(out, (k, v) => (k === "reason" || k === "code" ? undefined : v));
  assert.doesNotMatch(text, /nonconforming|non-conforming|\bviolat|\bbreach|not met|\bdiverted\b|\bmisused\b|\bscore\b/i);
  assert.ok(text.includes("Benchmark · not binding on Permit Office") && text.includes("below"));
  /* never a machine pattern, never Noticed */
  const { PATTERNS } = await import("../../../src/calculations/index.mjs");
  assert.ok(PATTERNS.every((p) => !APPLICATION_KINDS.includes(p.pattern)));
  await w.c.runPatterns({ budgetMs: 1000 });
  assert.doesNotMatch(JSON.stringify(w.rows(`SELECT * FROM calc_pattern_results`)), /discretion|waiver/);
  assert.doesNotMatch(text, /Noticed/);
});
