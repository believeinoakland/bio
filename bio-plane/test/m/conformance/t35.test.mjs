/* T35-61 (N651; K1723, K1713 (2), (3); DEC-145 (2), (8)): a standard that does not bind the body (R27), any actor's act
   in a comparison (R28), and what the office does as a measure beside the provision (R29). Each test drives conformance
   at its interface, over the real standards (its `bindsAt`), entities and events, and calculations' read as stated. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene, V, MACHINE } from "./fixture.mjs";
import { CONFORMANCE_CHECKS, NONCONFORMING_WORDS, BELOW_BENCHMARK, BINDS_NOT_READ, MEASURE_SAYS, ACTOR_KINDS }
  from "../../../src/conformance/index.mjs";

const refused = (r, code) => {
  assert.equal(r.ok, false, `expected ${code}, got ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code);
  if (CONFORMANCE_CHECKS[code]) assert.equal(r.check, CONFORMANCE_CHECKS[code].check);
};
const nothing = (w, fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "nothing written"); return r; };
const nothingAsync = async (w, fn) => { const before = w.snapshot(); const r = await fn(); assert.deepEqual(w.snapshot(), before, "nothing written"); return r; };

/* A scene with a benchmark: a policy another body issued, which nothing puts in force on the Parks Department. */
function benchScene() {
  const s = scene();
  const bench = s.w.standard("State Parks Board Guideline 4", { kind: "policy", issuer: "State Parks Board",
                                                               period: { from: "2020-01-01", to: "2030-12-31" } });
  const row = (over = {}) => ({ standard: bench, requires: "notice thirty days ahead", did: "no notice given", reading: "diverges",
                                content: [s.ev.content], ...over });
  return { ...s, bench, row };
}

test("R27: each standard's bindingness on the act's body is read from standards (bindsAt at the act's when), held beside it with its basis, and labelled \"Standard · binds <body>\" or \"Benchmark · not binding on <body>\"", () => {
  const { w, std, bench, input, row } = benchScene();
  const d = w.c.determine(input({ standards: [{ standard: std, outcome: "noncompliant" }, { standard: bench, outcome: "compliant" }],
                                  rows: [...input().rows, row({ reading: "aligns" })] }));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const [s1, s2] = d.standards;
  assert.deepEqual([s1.body, s1.binds, s1.label, s1.binds_rests_on], ["Parks Department", true,
    "Standard · binds Parks Department", [{ issuer: "Parks Department" }]]);
  assert.match(s1.binds_why, /issued it/);
  assert.deepEqual([s2.body, s2.binds, s2.label], ["Parks Department", false, "Benchmark · not binding on Parks Department"]);
  assert.match(s2.binds_why, /benchmark/);
  /* the record's document states each label; the read and the list answer the same as the act did */
  assert.match(w.text(d.id), /Standard · binds Parks Department/);
  assert.match(w.text(d.id), /Benchmark · not binding on Parks Department/);
  assert.deepEqual(w.c.determinationRead({ id: d.id, viewer: V("pat") }).standards, d.standards);
  /* a body named by its entity is labelled with the entity's label */
  const dept = w.entity("body", "Parks Department", "government");
  const byEntity = w.c.determine(input({ act: { ...input().act, actor: { role: "Director of Parks", body: dept } },
    standards: [{ standard: bench, outcome: "compliant" }], rows: [row({ reading: "aligns" })] }));
  assert.deepEqual([byEntity.standards[0].body, byEntity.standards[0].label], [dept, "Benchmark · not binding on Parks Department"]);
});

test("R27: noncompliant against a standard that does not bind the body is STANDARD_NOT_BINDING (C-113.32), naming the standard and the body; an undetermined bindingness is refused the same until a member settles it in standards; other outcomes against a benchmark are accepted, labelled", () => {
  const { w, std, ev, bench, input, row } = benchScene();
  const r = nothing(w, () => w.c.determine(input({ standards: [{ standard: bench, outcome: "noncompliant" }], rows: [row()] })));
  refused(r, "STANDARD_NOT_BINDING");
  assert.deepEqual([r.standard, r.body, r.binds], [bench, "Parks Department", false]);
  assert.equal(CONFORMANCE_CHECKS.STANDARD_NOT_BINDING.check, "C-113.32");
  for (const outcome of ["compliant", "unclear"]) {
    const ok = w.c.determine(input({ standards: [{ standard: bench, outcome }], rows: [row()],
                                     questions: outcome === "unclear" ? [{ question: "How far below?" }] : undefined }));
    assert.deepEqual([ok.ok, ok.standards[0].binds, ok.standards[0].outcome], [true, false, outcome], JSON.stringify(ok).slice(0, 300));
  }
  /* undetermined: a law another body issued, nothing recorded that it binds the department */
  const dept = w.entity("body", "Parks Department", "government");
  const lawText = w.evidence("INFO-2026-0700-law").content;
  const council = w.standard("Council Ordinance 9", { issuer: "The Council", period: { from: "2020-01-01", to: "2030-12-31" } });
  const act = { ...input().act, actor: { role: "Director of Parks", body: dept } };
  const asked = input({ act, standards: [{ standard: council, outcome: "noncompliant" }], rows: [{ ...input().rows[0], standard: council }] });
  const und = nothing(w, () => w.c.determine(asked));
  refused(und, "STANDARD_NOT_BINDING");
  assert.equal(und.binds, "undetermined");
  assert.match(und.detail, /undetermined/);
  /* an act placed nowhere has no date at which anything binds: undetermined, refused the same */
  const nowhere = w.event(ev, { date: null });
  refused(nothing(w, () => w.c.determine(input({ act: { ...input().act, event: nowhere } }))), "STANDARD_NOT_BINDING");
  /* a member settles it in standards (a held law imposes it on the body): then it binds, and noncompliant is recorded */
  const law = w.standard("State Parks Act 5", { kind: "statute", issuer: "The State", text: lawText,
                                                period: { from: "2019-01-01", to: "2030-12-31" } });
  const im = w.standards.impositionRecord({ standard: council, body: dept, law, citation: lawText,
    reason: "The act applies the ordinance to the department.", author: V("olive"), viewer: V("olive") });
  assert.equal(im.ok, true, JSON.stringify(im).slice(0, 300));
  const settled = w.c.determine(asked);
  assert.deepEqual([settled.ok, settled.standards[0].binds], [true, true], JSON.stringify(settled).slice(0, 300));
  assert.deepEqual(settled.standards[0].binds_rests_on.map((x) => x.imposition ? "imposition" : Object.keys(x)[0]), ["imposition"]);
  /* the negative control: noncompliant against a standard that binds is accepted */
  assert.equal(w.c.determine(input({ standards: [{ standard: std, outcome: "noncompliant" }] })).ok, true);
});

test("R27: a row or question of a benchmark that calls the act violated, a violation or nonconforming (whole words, any case) is BENCHMARK_CALLED_NONCONFORMING (C-113.33), for a determination and a comparison; the same words against a standard that binds are accepted", () => {
  const { w, std, proj, bench, input, row } = benchScene();
  const det = (over) => input({ standards: [{ standard: bench, outcome: "compliant" }], rows: [row()], ...over });
  const cmp = (over) => ({ project: proj, act: input().act, standards: [bench], rows: [row()], proposer: MACHINE, viewer: MACHINE, ...over });
  assert.deepEqual(NONCONFORMING_WORDS, ["violated", "violates", "violation", "nonconforming", "non-conforming", "nonconformity", "nonconformance"]);
  for (const word of NONCONFORMING_WORDS)
    for (const cased of [word, word.toUpperCase(), word[0].toUpperCase() + word.slice(1)])
      for (const [where, over] of [["requires", { rows: [row({ requires: `the guideline is ${cased} here` })] }],
                                   ["did", { rows: [row({ did: `the department ${cased}.` })] }],
                                   ["question", { questions: [{ question: `Was it a ${cased}?` }] }]]) {
        const r = nothing(w, () => w.c.determine(det(over)));
        refused(r, "BENCHMARK_CALLED_NONCONFORMING");
        assert.deepEqual([r.standard, r.body, r.word.toLowerCase()], [bench, "Parks Department", word], where);
        refused(nothing(w, () => w.c.comparisonPropose(cmp(over))), "BENCHMARK_CALLED_NONCONFORMING");
      }
  /* whole words only, and only against a benchmark */
  for (const fine of ["below the benchmark", "slower than the guideline", "no violations log was kept", "nonconformingly"])
    assert.equal(w.c.determine(det({ rows: [row({ did: fine })] })).ok, true, fine);
  const binding = input({ rows: [{ ...input().rows[0], did: "the department violated the notice rule" }] });
  assert.equal(w.c.determine(binding).ok, true);
  assert.equal(w.c.comparisonPropose(cmp({ standards: [std], rows: binding.rows })).ok, true);
  assert.equal(CONFORMANCE_CHECKS.BENCHMARK_CALLED_NONCONFORMING.check, "C-113.33");
});

test("R27: a diverges reading against a benchmark is answered \"below the benchmark\", never as a breach; against a standard that binds it is answered as read", () => {
  const { w, std, proj, bench, input, row } = benchScene();
  const d = w.c.determine(input({ standards: [{ standard: std, outcome: "noncompliant" }, { standard: bench, outcome: "compliant" }],
                                  rows: [...input().rows, row()] }));
  const [bound, benchmark] = d.standards;
  assert.deepEqual(benchmark.rows.map((r) => [r.reading, r.reading_says]), [["diverges", BELOW_BENCHMARK]]);
  assert.equal("reading_says" in bound.rows[0], false);
  assert.match(w.text(d.id), /Reading: below the benchmark\./);
  assert.doesNotMatch(w.text(d.id), /breach|violat|nonconform/i);
  const p = w.c.comparisonPropose({ project: proj, act: input().act, standards: [bench], rows: [row()], proposer: MACHINE, viewer: MACHINE });
  assert.deepEqual(p.proposal.rows.map((r) => r.reading_says), [BELOW_BENCHMARK]);
});

test("R27 R12: a comparison holds each standard's bindingness as read, never as the proposal states it; a machine's proposal never makes a standard binding; a proposal or determination recorded before T35 reads its bindingness undetermined", () => {
  const { w, std, proj, bench, input, row } = benchScene();
  const p = w.c.comparisonPropose({ project: proj, act: input().act, proposer: MACHINE, viewer: MACHINE,
    standards: [{ standard: bench, binds: true }, std], rows: [row({ binds: true }), input().rows[0]] });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  assert.deepEqual(p.proposal.bindings.map((b) => [b.standard, b.binds, b.label]),
    [[bench, false, "Benchmark · not binding on Parks Department"], [std, true, "Standard · binds Parks Department"]]);
  assert.deepEqual(w.c.comparisonRead({ id: p.proposal.id, viewer: V("pat") }).proposal.bindings, p.proposal.bindings);
  /* recorded before T35: no bindingness was read */
  const d = w.c.determine(input());
  w.st.sql.exec(`UPDATE determination_standards SET binds=NULL, binds_basis=NULL, body=NULL WHERE determination_id=?`, d.id);
  w.st.sql.exec(`UPDATE comparison_proposals SET bindings=NULL WHERE proposal_id=?`, p.proposal.id);
  const old = w.c.determinationRead({ id: d.id, viewer: V("pat") }).standards[0];
  assert.deepEqual([old.binds, old.binds_why, old.label], ["undetermined", BINDS_NOT_READ, null]);
  assert.deepEqual(w.c.comparisonRead({ id: p.proposal.id, viewer: V("pat") }).proposal.bindings.map((b) => [b.binds, b.binds_why]),
    [["undetermined", BINDS_NOT_READ], ["undetermined", BINDS_NOT_READ]]);
});

test("R28: a comparison may compare the act of an office or an organisation of any sector, named by entity_id; a person is ACTOR_IS_A_PERSON (C-113.34), any other kind or an entity not held ACTOR_NOT_AN_OFFICE_OR_ORGANISATION (C-113.35), each writing nothing", () => {
  const { w, proj, std, input } = scene();
  assert.deepEqual(ACTOR_KINDS, ["office", "institution", "body", "movement"]);
  const cmp = (actor) => ({ project: proj, act: { ...input().act, actor }, standards: [std], rows: input().rows,
                            proposer: V("pat"), viewer: V("pat") });
  for (const [kind, sector] of [["office", null], ["institution", "company"], ["institution", "nonprofit"], ["body", "government"],
                                ["movement", "association"]]) {
    const id = w.entity(kind, `An ${kind} ${sector ?? ""}`.trim(), sector ?? undefined);
    const p = w.c.comparisonPropose(cmp({ entity_id: id }));
    assert.equal(p.ok, true, `${kind}: ${JSON.stringify(p).slice(0, 300)}`);
    assert.deepEqual([p.proposal.act.actor.entity_id, p.proposal.act.actor.entity_kind], [id, kind]);
  }
  const person = w.entity("person", "Jane Doe");
  const r = nothing(w, () => w.c.comparisonPropose(cmp({ entity_id: person })));
  refused(r, "ACTOR_IS_A_PERSON");
  assert.equal(CONFORMANCE_CHECKS.ACTOR_IS_A_PERSON.check, "C-113.34");
  for (const other of [w.entity("parcel", "Lot 7"), w.entity("fund", "General Fund"), "ENT-2026-9999-none"])
    refused(nothing(w, () => w.c.comparisonPropose(cmp({ entity_id: other }))), "ACTOR_NOT_AN_OFFICE_OR_ORGANISATION");
  assert.equal(CONFORMANCE_CHECKS.ACTOR_NOT_AN_OFFICE_OR_ORGANISATION.check, "C-113.35");
  /* an office named by its role and body still compares, as a determination's does */
  assert.equal(w.c.comparisonPropose(cmp({ role: "Director of Parks", body: "Parks Department" })).ok, true);
  refused(nothing(w, () => w.c.comparisonPropose(cmp({ role: "Director of Parks" }))), "ACT_INCOMPLETE");
});

test("R28 R25: a comparison takes the act as determine does: ACT_NO_EVENT for none, NO_SUCH_EVENT for an event absent; the people who took part are the event's participants; a determination of an organisation's act answers R25's ACTOR_NOT_AN_OFFICE", () => {
  const { w, proj, std, input, signer, act } = scene();
  const base = { project: proj, standards: [std], rows: input().rows, proposer: V("pat"), viewer: V("pat") };
  refused(nothing(w, () => w.c.comparisonPropose({ ...base, act: { actor: input().act.actor } })), "ACT_NO_EVENT");
  refused(nothing(w, () => w.c.comparisonPropose(base)), "ACT_NO_EVENT");
  refused(nothing(w, () => w.c.comparisonPropose({ ...base, act: { ...input().act, event: "EVT-2026-9999-none" } })), "NO_SUCH_EVENT");
  const company = w.entity("institution", "Acme Utility", "company");
  const p = w.c.comparisonPropose({ ...base, act: { event: act, actor: { entity_id: company } } });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  assert.equal(JSON.stringify(p.proposal.act.actor).includes(signer), false, "the signer is a participant, never the actor");
  /* held and read, never determined: a determination judges only an office's act */
  refused(nothing(w, () => w.c.determine(input({ act: { ...input().act, actor: { role: "Board", body: "Acme Utility", entity_id: company } } }))),
          "ACTOR_NOT_AN_OFFICE");
  /* an organisation's comparison reads bindingness against the organisation itself */
  assert.deepEqual(p.proposal.bindings.map((b) => [b.body, b.binds]), [[company, "undetermined"]]);
});

/* A calculation of what the office does, as calculations' read answers it: a share with its denominator and its frozen
   uses' population (R32, R36). */
const measured = (over = {}) => ({
  calculation: { calc_id: "CALC-2026-0001", recipe: { output: "share" }, method_version: "bio-calc/1", result_key: "rk1",
                 inputs: [{ name: "uses", kind: "table", sha: "ab".repeat(32) }], results: {} },
  result_key: "rk1", method_version: "bio-calc/1", computed_at: "2026-09-27T00:00:00Z",
  results: { output: { numerator: "41", denominator: "58", value: "0.7069" },
             application: { recipe: "policy_against_practice", derivation: "the recipe stored with this calculation, evaluated by calc-grammar (bio-calc/1)",
                            denominator: { rows: "58", says: "the rows counted" },
                            population: [{ input: "uses", table: "ab".repeat(32), filter: { decider: "ENT-1", from: "2025-01-01" },
                                           frozen_by: V("olive"), frozen_at: "2026-09-27T00:00:00Z" }] } },
  ...over });

test("R29: a row may state what was done as a measure {calc, result_key}; it is answered with the calculation's result, its denominator, its population and its derivation, each from the calculation and held as read; the act answers a Promise only then, and every other act answers as before", async () => {
  const { w, proj, std, input } = scene();
  w.calcs.set("CALC-2026-0001", { answer: measured() });
  const row = { ...input().rows[0], did: { calc: "CALC-2026-0001", result_key: "rk1" } };
  assert.equal(w.c.determine(input()) instanceof Promise, false, "no measure: answered at once");
  const pending = w.c.determine(input({ rows: [row] }));
  assert.equal(pending instanceof Promise, true);
  const d = await pending;
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const [r] = d.standards[0].rows;
  assert.deepEqual(r.did, { calc: "CALC-2026-0001", result_key: "rk1" });
  assert.deepEqual(r.measure, { calc: "CALC-2026-0001", result_key: "rk1", result_key_now: "rk1", result_key_differs: false,
    result: { numerator: "41", denominator: "58", value: "0.7069" }, denominator: { rows: "58", says: "the rows counted" },
    population: measured().results.application.population,
    derivation: { recipe: { output: "share" }, method_version: "bio-calc/1",
                  says: "the recipe stored with this calculation, evaluated by calc-grammar (bio-calc/1)" },
    computed_at: "2026-09-27T00:00:00Z", says: MEASURE_SAYS });
  assert.match(w.text(d.id), /CALC-2026-0001/);
  /* held as read: a later change of the calculation does not change the determination */
  w.calcs.set("CALC-2026-0001", { answer: measured({ result_key: "rk2" }) });
  assert.deepEqual(w.c.determinationRead({ id: d.id, viewer: V("pat") }).standards[0].rows[0].measure, r.measure);
  /* a result key that differs from the calculation's is stated beside the row, never refused */
  const differs = await w.c.determine(input({ rows: [row] }));
  assert.deepEqual([differs.ok, differs.standards[0].rows[0].measure.result_key_differs,
                    differs.standards[0].rows[0].measure.result_key_now], [true, true, "rk2"]);
  /* a ratio's own denominator and a frozen record set are a denominator and population too */
  w.calcs.set("CALC-2026-0002", { answer: measured({ results: { output: { numerator: "3", denominator: "9", value: "0.3333" } },
    calculation: { recipe: {}, inputs: [{ name: "acts", kind: "set", set: "SET-1", sha: "cd".repeat(32) }] } }) });
  const viaSet = await w.c.determine(input({ rows: [{ ...row, did: { calc: "CALC-2026-0002", result_key: "rk1" } }] }));
  assert.deepEqual([viaSet.ok, viaSet.standards[0].rows[0].measure.denominator, viaSet.standards[0].rows[0].measure.population],
    [true, "9", [{ input: "acts", set: "SET-1", sha: "cd".repeat(32) }]]);
  /* a comparison takes a measure the same way */
  const p = await w.c.comparisonPropose({ project: proj, act: input().act, standards: [std], rows: [row], proposer: V("pat"), viewer: V("pat") });
  assert.deepEqual([p.ok, p.proposal.rows[0].did, p.proposal.rows[0].measure.denominator],
    [true, { calc: "CALC-2026-0001", result_key: "rk1" }, { rows: "58", says: "the rows counted" }]);
  /* through the op too */
  const viaOp = await w.op("determine", { author: V("olive"), viewer: V("olive") }, { ...input({ rows: [row] }), author: undefined });
  assert.equal(viaOp.ok, true);
});

test("R29: a calculation absent or one the viewer may not see is answered as calculations answers it (NO_SUCH_CALCULATION), the same for both, with no row of this module's; a result with no denominator or no population is MEASURE_NO_DENOMINATOR (C-113.36); each writes nothing", async () => {
  const { w, proj, std, input } = scene();
  w.calcs.set("CALC-2026-0003", { answer: measured(), hiddenFrom: [V("olive")] });
  w.calcs.set("CALC-2026-0004", { answer: measured({ results: { output: "41", application: { population: measured().results.application.population } } }) });
  w.calcs.set("CALC-2026-0005", { answer: measured({ results: { output: { numerator: "1", denominator: "2", value: "0.5" } },
                                                     calculation: { recipe: {}, inputs: [] } }) });
  const row = (calc) => ({ ...input().rows[0], did: { calc, result_key: "rk1" } });
  const answers = [];
  for (const calc of ["CALC-2026-0099", "CALC-2026-0003"]) {
    const r = await nothingAsync(w, () => w.c.determine(input({ rows: [row(calc)] })));
    assert.deepEqual([r.ok, r.reason, r.code, "check" in r, "translation" in r], [false, "NO_SUCH_CALCULATION", "NO_SUCH_CALCULATION", false, false]);
    answers.push({ ...r, calc: null });
  }
  assert.deepEqual(answers[0], answers[1], "absent and unseen alike");
  assert.equal("NO_SUCH_CALCULATION" in CONFORMANCE_CHECKS, false);
  for (const [calc, missing] of [["CALC-2026-0004", "denominator"], ["CALC-2026-0005", "population"]]) {
    const r = await nothingAsync(w, () => w.c.determine(input({ rows: [row(calc)] })));
    refused(r, "MEASURE_NO_DENOMINATOR");
    assert.deepEqual([r.calc, r.missing], [calc, missing]);
    refused(await nothingAsync(w, () => w.c.comparisonPropose({ project: proj, act: input().act, standards: [std], rows: [row(calc)],
                                                                 proposer: V("pat"), viewer: V("pat") })), "MEASURE_NO_DENOMINATOR");
  }
  assert.equal(CONFORMANCE_CHECKS.MEASURE_NO_DENOMINATOR.check, "C-113.36");
  /* R1's earlier refusals still come first: a machine author is refused before any measure is answered */
  refused(await w.c.determine(input({ author: MACHINE, viewer: MACHINE, rows: [row("CALC-2026-0099")] })), "MACHINE_CANNOT_DETERMINE");
});

test("R29: the measure is held beside the rule and never as it: no standard's text or force changes, and no answer of this module calls what the office does \"practice\" (DEC-145 (8))", async () => {
  const { w, std, input } = scene();
  w.calcs.set("CALC-2026-0001", { answer: measured() });
  const before = JSON.stringify(w.standards.standardRead({ id: std, viewer: V("olive") }));
  const d = await w.c.determine(input({ rows: [{ ...input().rows[0], did: { calc: "CALC-2026-0001", result_key: "rk1" } }] }));
  assert.equal(d.ok, true);
  assert.equal(JSON.stringify(w.standards.standardRead({ id: std, viewer: V("olive") })), before);
  assert.deepEqual(d.standards[0].rows[0].requires, input().rows[0].requires, "the provision stands as the rule");
  assert.match(MEASURE_SAYS, /what the office does/i);
  for (const s of [MEASURE_SAYS, JSON.stringify(d), w.text(d.id), ...Object.values(CONFORMANCE_CHECKS).map((r) => r.translation)])
    assert.doesNotMatch(s, /practice/i);
});
