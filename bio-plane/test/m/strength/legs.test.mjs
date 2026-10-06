/* The leg kinds T33 adds (R36 the calculation, R37 the held standard, R38 the duty occurrence; K1447 (i)–(iii)), driven
   at the module's interface over `strengthOf`, `versionStrength`, `candidatePair`, `gradingFacts` and `recomputePair`,
   with `calculations`' grade facts (its R9), `duties`' occurrences (its R7, R9), `events`' attestations (its R26) and the
   earned registry's ceilings (leg-earning R8) in the shapes those modules provide, as the fixture holds them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";
import { STRENGTH_AXES, GRADING_METHOD_VERSION, recomputePair, parseOccurrenceRef } from "../../../src/strength/index.mjs";

const INQ = "INQ-2026-0001-a";
const CALC = "CALC-2026-0001", CALC2 = "CALC-2026-0002";
const STD = "STD-2026-0001";
const DUT = "DUT-2026-0001";
const OCC = `occurrence:${DUT}/OCC-11111111111111111111111111111111`;
const DOC = "INFO-2026-0001-a";
const axesOf = (p) => STRENGTH_AXES.map((a) => [a, p[a].state, p[a].grade]);
const exhaustedWhy = (axis, target) => (axis.undetermined_at || []).find((m) => m.target_id === target)?.why;

function calcWorld() {
  const w = world();
  w.calcs.set(CALC, { capture: { grade: "C", why: "the weakest input capture, C" }, method: { note: "a share of the totals" },
    inputs: [{ name: "a", kind: "table", ref: "t-sha", grade: "B" }, { name: "b", kind: "money", ref: ["MNY-2026-0001"], grade: "C" }] });
  return w;
}

test("R36: a calculation leg counts on the capture axis only, at the weakest input capture its grade facts state; the method is named beside the grade, never graded", () => {
  const w = calcWorld();
  w.inquiry(INQ, [{ target: CALC }, { target: DOC, grade: "B", axis: "connection", source: "resolution" }]);
  const p = w.s.strengthOf(INQ);
  assert.deepEqual(axesOf(p), [["capture", "graded", "C"], ["connection", "graded", "B"], ["testimony", "unrated", null]]);
  const m = p.capture.weakest;
  assert.deepEqual([m.target_id, m.via, m.grade], [CALC, "derived", "C"]);
  assert.match(m.why, /weakest capture among its inputs/);
  assert.match(m.why, /arithmetic does not weaken it/);
  assert.match(m.why, /method is stated beside the grade \(a share of the totals\) and is not graded/);
  for (const axis of ["connection", "testimony"])
    assert.match(p[axis].not_load_bearing.find((x) => x.target_id === CALC).why, /capture axis only/, axis);
  /* A stronger calculation beside a weaker document leaves the document setting the axis: never lifted. */
  w.calcs.set(CALC2, { capture: { grade: "A", why: "held" }, inputs: [] });
  w.inquiry("INQ-2026-0002-a", [{ target: CALC2 }, { target: DOC, grade: "D", axis: "capture", source: "capture" }]);
  assert.equal(w.s.strengthOf("INQ-2026-0002-a").capture.grade, "D");
});

test("R36: not accepted, not held, unreadable facts, an unmeasured engine's value or no input capture: the leg is undetermined, named with why; a hunch is inert", () => {
  const cases = [
    ["not accepted", (w) => w.calcs.set(CALC, { accepted: false, capture: { grade: "B" } }), /is not accepted/],
    ["not held", () => {}, /is not a calculation this copy holds/],
    ["another program's value", (w) => w.calcs.set(CALC, { capture: { grade: "B" }, inputs: [{ name: "cell", engine: "sheet" }] }),
     /another program computed \(cell\).*not measured/],
    ["no input capture", (w) => w.calcs.set(CALC, { capture: { grade: null, why: "undetermined: a, not held" } }),
     /capture strength of CALC-2026-0001 is unknown: undetermined: a, not held/],
  ];
  for (const [name, set, why] of cases) {
    const w = world();
    set(w);
    w.inquiry(INQ, [{ target: CALC }]);
    const p = w.s.strengthOf(INQ);
    assert.equal(p.capture.state, "undetermined", name);
    assert.match(exhaustedWhy(p.capture, CALC), why, name);
    assert.match(p.capture.detail, /nothing here establishes what CALC-2026-0001 rests on/, name);
    assert.doesNotMatch(p.capture.detail, /depth bound/, name);
  }
  /* A calculations module whose read is a Promise (calculations R9 as built, J2) is not consumed: undetermined. */
  const a = world();
  a.calcs.set(CALC, { capture: { grade: "B" } });
  const real = a.s.calculations.gradeFactsOf;
  a.s.calculations.gradeFactsOf = async (x) => real(x);
  a.inquiry(INQ, [{ target: CALC }]);
  assert.match(exhaustedWhy(a.s.strengthOf(INQ).capture, CALC), /cannot be read here/);
  /* A hunch on a calculation counts nothing and inherits nothing. */
  const h = calcWorld();
  h.inquiry(INQ, [{ target: CALC, source: "hunch" }]);
  const hp = h.s.strengthOf(INQ);
  assert.equal(hp.capture.state, "unrated");
  assert.match(hp.capture.not_load_bearing[0].why, /marked as a hunch/);
  assert.equal(hp.hunches_left_out, 1);
});

test("R36: versionStrength, candidatePair and recomputePair over gradingFacts answer the same calculation grade", () => {
  const w = calcWorld();
  w.inquiry(INQ, [{ target: CALC }], "ENT-1");
  w.version(INQ, "v1", "accepted", [{ target: CALC, ground: "" }]);
  const v = w.s.versionStrength({ id: INQ, version: "v1", viewer: MACHINE });
  assert.equal(v.ok, true, JSON.stringify(v).slice(0, 300));
  assert.equal(v.pair.capture.grade, "C");
  assert.deepEqual(v.graded.map((x) => [x.target_id, x.grade_axis, x.grade]), [[CALC, "capture", "C"]]);
  assert.equal(w.s.candidatePair({ inquiry: INQ, legs: [{ target: CALC }] }).pair.capture.grade, "C");
  const f = w.s.gradingFacts({ inquiry: INQ, viewer: MACHINE });
  assert.deepEqual([f.legs[0].kind, f.legs[0].grade_axis, f.legs[0].grade], ["calculation", "capture", "C"]);
  assert.deepEqual(axesOf(recomputePair({ legs: f.legs, version: f.method })), axesOf(w.s.strengthOf(INQ)));
  /* Unknown: the version names it in ungraded, the facts carry why, and the recomputation is undetermined too. */
  w.calcs.get(CALC).accepted = false;
  const u = w.s.versionStrength({ id: INQ, version: "v1", viewer: MACHINE });
  assert.match(u.ungraded[0].why, /is not accepted/);
  assert.equal(u.pair.capture.state, "undetermined");
  const uf = w.s.gradingFacts({ inquiry: INQ, viewer: MACHINE });
  assert.match(uf.legs[0].undetermined, /is not accepted/);
  assert.equal(recomputePair({ legs: uf.legs, version: GRADING_METHOD_VERSION }).capture.state, "undetermined");
});

test("R37: a held standard leg counts on the capture axis at its stated grade bounded by its text's ceiling; no text at that version leaves it undetermined with the reason; another axis has no referent", () => {
  const w = world();
  w.ceilings.set(STD, { grade: "B", why: "the standard's text is captured" });
  w.inquiry(INQ, [{ target: STD, grade: "A", axis: "capture", source: "capture" }]);
  const p = w.s.strengthOf(INQ);
  assert.equal(p.capture.grade, "B", "capped at the ceiling of its text, never raised");
  assert.match(p.capture.weakest.why, /no more than B for STD-2026-0001/);
  w.inquiry("INQ-2026-0002-a", [{ target: STD, grade: "C", axis: "capture", source: "capture" }]);
  assert.equal(w.s.strengthOf("INQ-2026-0002-a").capture.grade, "C");
  /* STANDARD_NO_TEXT (leg-earning R8): undetermined, unlike a document leg, which is inert. */
  const n = world();
  n.ceilings.set(STD, { grade: null, undetermined_because: "STANDARD_NO_TEXT", why: "the standard holds no captured text at that version" });
  n.inquiry(INQ, [{ target: STD, grade: "B", axis: "capture", source: "capture" }]);
  const np = n.s.strengthOf(INQ);
  assert.equal(np.capture.state, "undetermined");
  assert.match(exhaustedWhy(np.capture, STD), /no captured text at that version/);
  /* Nothing earned for it at all: unknown, never counted at its stated letter. */
  const e = world();
  e.inquiry(INQ, [{ target: STD, grade: "A", axis: "capture", source: "capture" }]);
  assert.equal(e.s.strengthOf(INQ).capture.state, "undetermined");
  /* A connection grade on it is named and not counted. */
  const c = world();
  c.ceilings.set(STD, { grade: "B", why: "held" });
  c.inquiry(INQ, [{ target: STD, grade: "A", axis: "connection", source: "resolution" }]);
  const cp = c.s.strengthOf(INQ);
  assert.equal(cp.connection.state, "unrated");
  assert.match(cp.connection.not_load_bearing[0].why, /held standard, so a connection grade on this leg has no referent/);
  /* The pair over a version, a candidate and the recomputation agree. */
  w.version(INQ, "v1", "accepted", [{ target: STD, grade: "A", axis: "capture", source: "capture", ground: "" }]);
  assert.equal(w.s.versionStrength({ id: INQ, version: "v1", viewer: MACHINE }).pair.capture.grade, "B");
  assert.equal(w.s.candidatePair({ inquiry: INQ, legs: [{ target: STD, grade: "A", grade_axis: "capture", grade_source: "capture" }] })
    .pair.capture.grade, "B");
  n.version(INQ, "v1", "accepted", [{ target: STD, grade: "B", axis: "capture", source: "capture", ground: "" }]);
  const nv = n.s.versionStrength({ id: INQ, version: "v1", viewer: MACHINE });
  assert.equal(nv.pair.capture.state, "undetermined");
  assert.match(nv.ungraded[0].why, /no captured text/);
  for (const x of [w, n]) {
    const f = x.s.gradingFacts({ inquiry: INQ, viewer: MACHINE });
    assert.equal(f.legs[0].kind, "standard");
    assert.deepEqual(axesOf(recomputePair({ legs: f.legs, version: f.method })), axesOf(x.s.strengthOf(INQ)));
  }
});

function dutyWorld({ state = "overdue", due = { date: "2026-03-11" }, inForce = { state: "in" }, trigger = { kind: "event", ref: "EVT-2026-0001", date: "2026-03-01" },
                     source = { kind: "standard", standard: STD }, eventGrade = "C", ceiling = "B" } = {}) {
  const w = world();
  w.ceilings.set(STD, { grade: ceiling, why: "the text of the rule is captured" });
  w.event("EVT-2026-0001", { grade: eventGrade });
  w.duties.set(DUT, { source, occurrences: [{ key: "OCC-11111111111111111111111111111111", trigger, due, state, why: "as known",
    derivation: { source_in_force: inForce, trigger_date: trigger.date, due_date: due.date ?? null, level_searched: "meaning" } }] });
  return w;
}

test("R38: an occurrence leg counts on the capture axis at the weaker of its source's text and its trigger date's attestation; its state is stated beside the grade and never moves it", () => {
  assert.deepEqual(parseOccurrenceRef(OCC), { duty: DUT, key: "OCC-11111111111111111111111111111111" });
  for (const bad of ["occurrence:DUT-2026-0001", "occurrence:/OCC-11111111111111111111111111111111", `occurrence:${DUT}/`, "DUT-2026-0001/OCC-11111111111111111111111111111111", null])
    assert.equal(parseOccurrenceRef(bad), null, String(bad));
  const grades = [];
  for (const state of ["met", "met_late", "overdue", "pending", "discharged"]) {
    const w = dutyWorld({ state });
    w.inquiry(INQ, [{ target: OCC }]);
    const p = w.s.strengthOf(INQ);
    assert.deepEqual([p.capture.state, p.capture.grade], ["graded", "C"], state);
    const m = p.capture.weakest;
    assert.deepEqual([m.target_id, m.via], [OCC, "derived"]);
    assert.match(m.why, /set by the record of EVT-2026-0001's date/);
    assert.match(m.why, new RegExp(`It is ${state.replace("_", " ")} as known today; that is stated beside the grade and never changes it`));
    grades.push(p.capture.grade);
  }
  assert.equal(new Set(grades).size, 1, "the state never raises or lowers the grade");
  /* The source's text sets it when weaker than the trigger's record. */
  const t = dutyWorld({ ceiling: "D", eventGrade: "A" });
  t.inquiry(INQ, [{ target: OCC }]);
  assert.equal(t.s.strengthOf(INQ).capture.grade, "D");
  assert.match(t.s.strengthOf(INQ).capture.weakest.why, /set by the text of STD-2026-0001/);
  /* A recurrence's date is computed from the rule itself: the source's text alone. */
  const r = dutyWorld({ trigger: { kind: "recurrence", ref: "2026-03", date: "2026-03-01" }, eventGrade: "D" });
  r.inquiry(INQ, [{ target: OCC }]);
  assert.equal(r.s.strengthOf(INQ).capture.grade, "B");
});

test("R38: a part of the derivation duties answers undetermined, or an occurrence not derived, makes the leg undetermined, named with why", () => {
  const cases = [
    ["due date undetermined", { due: { undetermined: true, why: "the rule's day count is not held" } }, /due date is undetermined: the rule's day count/],
    ["source in force undetermined", { inForce: { state: "undetermined", why: "no version covers the date" } }, /whether its source is in force is undetermined/],
    ["a practice source holds no text", { source: { kind: "practice" } }, /its source holds no captured text/],
    ["the source's text unknown", { ceiling: null }, /what the record holds for the text of STD-2026-0001 is undetermined/],
    ["the trigger's date not attested", { trigger: { kind: "event", ref: "EVT-2026-0099", date: "2026-03-01" } }, /date of EVT-2026-0099, which started it, is not attested/],
    ["the trigger date undetermined", { trigger: { kind: "date", ref: null, date: { undetermined: true } } }, /date that started it is undetermined/],
  ];
  for (const [name, opts, why] of cases) {
    const w = dutyWorld(opts);
    w.inquiry(INQ, [{ target: OCC }]);
    const p = w.s.strengthOf(INQ);
    assert.equal(p.capture.state, "undetermined", name);
    assert.match(exhaustedWhy(p.capture, OCC), why, name);
  }
  const w = dutyWorld();
  w.inquiry(INQ, [{ target: `occurrence:${DUT}/OCC-ffffffffffffffffffffffffffffffff` }, { target: "occurrence:DUT-2026-0009/OCC-11111111111111111111111111111111" }]);
  const p = w.s.strengthOf(INQ);
  assert.match(exhaustedWhy(p.capture, `occurrence:${DUT}/OCC-ffffffffffffffffffffffffffffffff`), /no occurrence by that key is derived/);
  assert.match(exhaustedWhy(p.capture, "occurrence:DUT-2026-0009/OCC-11111111111111111111111111111111"), /DUT-2026-0009 is not an obligation this copy holds/);
});

test("R38: versionStrength, candidatePair, gradingFacts and recomputePair answer the same occurrence grade; inquiryStrength withholds an occurrence whose obligation the viewer may not see", () => {
  const w = dutyWorld();
  w.inquiry(INQ, [{ target: OCC }, { target: DOC, grade: "A", axis: "connection", source: "resolution" }], "ENT-1");
  w.bundle(DOC);
  w.version(INQ, "v1", "accepted", [{ target: OCC, ground: "" }]);
  assert.equal(w.s.versionStrength({ id: INQ, version: "v1", viewer: MACHINE }).pair.capture.grade, "C");
  assert.equal(w.s.candidatePair({ inquiry: INQ, legs: [{ target: OCC }] }).pair.capture.grade, "C");
  const f = w.s.gradingFacts({ inquiry: INQ, viewer: MACHINE });
  assert.deepEqual([f.legs[0].kind, f.legs[0].grade], ["occurrence", "C"]);
  assert.deepEqual(axesOf(recomputePair({ legs: f.legs, version: f.method })), axesOf(w.s.strengthOf(INQ)));
  /* R6: an obligation carol may not see is withheld whole; alice, who may, is told. */
  w.member("alice"); w.member("carol");
  w.duties.get(DUT).viewers = ["member:alice"];
  const carol = w.s.inquiryStrength({ id: INQ, viewer: "member:carol" });
  assert.equal(carol.out_of_view, true);
  assert.ok(!JSON.stringify(carol).includes(DUT));
  assert.equal(carol.capture.grade, "C", "the grade does not change with the reader");
  const alice = w.s.inquiryStrength({ id: INQ, viewer: "member:alice" });
  assert.equal(alice.out_of_view, undefined);
  assert.ok(JSON.stringify(alice).includes(OCC));
});

test("R36, R6: inquiryStrength withholds a calculation the viewer may not see (calculations R10), and names it to one who may", () => {
  const w = calcWorld();
  w.member("alice"); w.member("carol");
  w.calcs.get(CALC).viewers = ["member:alice"];
  w.inquiry(INQ, [{ target: CALC }]);
  const carol = w.s.inquiryStrength({ id: INQ, viewer: "member:carol" });
  assert.equal(carol.out_of_view, true);
  assert.ok(!JSON.stringify(carol).includes(CALC));
  assert.equal(carol.capture.grade, "C");
  assert.ok(JSON.stringify(w.s.inquiryStrength({ id: INQ, viewer: "member:alice" })).includes(CALC));
});

test("R32, R31: recomputePair at version 1 reads no new leg kind (each is a document there); at version 2 a stated reason makes a derived or standard leg undetermined", () => {
  const legs = [{ target: CALC, kind: "calculation", grade: "B", grade_axis: "capture" }];
  const v1 = recomputePair({ legs, version: "bio-grading/1" });
  assert.equal(v1.ok, true);
  assert.equal(v1.capture.weakest.via, "leg", "a version-1 case file has no calculation leg: read as it was");
  const v2 = recomputePair({ legs, version: GRADING_METHOD_VERSION });
  assert.equal(v2.capture.weakest.via, "derived");
  for (const kind of ["calculation", "occurrence", "standard"]) {
    const r = recomputePair({ version: GRADING_METHOD_VERSION, legs: [{ target: "X", kind, grade: "B", grade_axis: "capture", undetermined: "unknown here" }] });
    assert.equal(r.capture.state, "undetermined", kind);
    assert.equal(r.capture.undetermined_at[0].why, "unknown here", kind);
  }
  const none = recomputePair({ version: GRADING_METHOD_VERSION, legs: [{ target: "X", kind: "calculation" }] });
  assert.match(none.capture.undetermined_at[0].why, /states no capture strength/);
});
