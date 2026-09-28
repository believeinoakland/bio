/* The derived pair over an inquiry's live basis (R1–R5, R17, R18, R19) and over a candidate's legs (R26), driven
   through `strengthOf(ctx)` against the providers the fixture controls. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { STRENGTH_AXES, DEPTH_BOUND } from "../../../src/strength/index.mjs";

const COMPOSED = ["strength", "grade", "score", "overall", "composed", "letter", "rating", "value"];

test("R1: each axis ranges over its own population; a leg counts on the axis its grade names", () => {
  const w = world();
  w.inquiry("INQ-2026-0001-a", [
    { target: "INFO-2026-0001-a", grade: "B", axis: "capture", source: "capture" },
    { target: "INFO-2026-0002-a", grade: "C", axis: "connection", source: "resolution" },
    { target: "INFO-2026-0003-a", grade: "D", axis: "testimony", source: "testimony" },
  ]);
  const p = w.s.strengthOf("INQ-2026-0001-a");
  assert.equal(p.ok, true);
  assert.equal(p.capture.grade, "B");
  assert.equal(p.capture.weakest.target_id, "INFO-2026-0001-a");
  assert.equal(p.connection.grade, "C");
  assert.equal(p.connection.weakest.target_id, "INFO-2026-0002-a");
  assert.equal(p.testimony.grade, "D");
  /* A leg graded on another axis is inert on this one and says so. */
  const cap = p.capture.not_load_bearing.map((m) => m.target_id);
  assert.deepEqual(cap.sort(), ["INFO-2026-0002-a", "INFO-2026-0003-a"]);
  assert.match(p.capture.not_load_bearing.find((m) => m.target_id === "INFO-2026-0003-a").why, /does not apply here/);
  assert.match(p.capture.not_load_bearing.find((m) => m.target_id === "INFO-2026-0002-a").why, /connection axis/);
});

test("R1: a document leg's capture grade is bounded by what its target earns (inquiry.legCapped), never raised", () => {
  const w = world();
  w.ceilings.set("INFO-2026-0001-a", { grade: "C", why: "a measured transcription" });
  w.ceilings.set("INFO-2026-0002-a", { grade: "A", why: "the bytes" });
  w.ceilings.set("INFO-2026-0003-a", { grade: null, why: "no measured fidelity", undetermined_because: "unmeasured" });
  w.inquiry("INQ-2026-0001-a", [
    { target: "INFO-2026-0001-a", grade: "A", axis: "capture", source: "capture", ground: "one" },
    { target: "INFO-2026-0002-a", grade: "B", axis: "capture", source: "capture", ground: "two" },
    { target: "INFO-2026-0003-a", grade: "A", axis: "capture", source: "capture", ground: "three" },
  ]);
  const g = w.s.strengthOf("INQ-2026-0001-a").capture.grounds;
  const byGround = Object.fromEntries(g.map((x) => [x.ground, x]));
  assert.equal(byGround.one.grade, "C", "capped at the ceiling");
  assert.match(byGround.one.weakest.why, /no more than C/);
  assert.equal(byGround.two.grade, "B", "a letter under its ceiling stands, never raised");
  assert.equal(byGround.three.state, "unrated", "an undetermined ceiling makes the leg claim nothing");
  assert.match(byGround.three.not_load_bearing[0].why, /no measured fidelity/);
  assert.equal(w.calls.earned, 1, "the registry is asked once for the whole walk");
});

test("R1: a testimony leg is D whatever it states; a capture or testimony grade on an inquiry leg is named, not counted", () => {
  const w = world();
  w.inquiry("INQ-2026-0002-a", []);
  w.inquiry("INQ-2026-0001-a", [
    { target: "INFO-2026-0001-a", grade: "A", axis: "testimony", source: "testimony" },
    { target: "INQ-2026-0002-a", grade: "A", axis: "capture", source: "capture" },
  ]);
  const p = w.s.strengthOf("INQ-2026-0001-a");
  assert.equal(p.testimony.grade, "D");
  assert.match(p.testimony.weakest.why, /read at D/);
  const noRef = p.capture.not_load_bearing.find((m) => m.target_id === "INQ-2026-0002-a" && m.via === "leg");
  assert.ok(noRef, "the inquiry leg is named on capture");
  assert.match(noRef.why, /no referent/);
  assert.equal(noRef.grade, null);
});

test("R2: an inquiry leg contributes the target's own answer per axis, recursively, never crossed, naming the actual leg", () => {
  const w = world();
  w.ceilings.set("INFO-2026-0009-a", { grade: "C", why: "measured" });
  w.inquiry("INQ-2026-0003-a", [{ target: "INFO-2026-0009-a", grade: "A", axis: "capture", source: "capture" },
                                { target: "INFO-2026-0008-a", grade: "B", axis: "connection", source: "resolution" }]);
  w.inquiry("INQ-2026-0002-a", [{ target: "INQ-2026-0003-a", grade: "A", axis: "connection", source: "inherited" }]);
  w.inquiry("INQ-2026-0001-a", [{ target: "INQ-2026-0002-a" }]);
  const p = w.s.strengthOf("INQ-2026-0001-a");
  assert.equal(p.capture.grade, "C", "the sub-inquiry's own answer, capped below");
  assert.equal(p.capture.weakest.via, "inherited");
  assert.equal(p.capture.weakest.inherited_from, "INQ-2026-0002-a");
  assert.equal(p.capture.weakest.through, "INQ-2026-0003-a", "the hop below names its own setter");
  assert.equal(w.s.strengthOf("INQ-2026-0002-a").capture.weakest.through, "INFO-2026-0009-a", "the actual leg, one hop down");
  assert.equal(p.connection.grade, "B");
  assert.equal(p.depth_bound, DEPTH_BOUND);
  assert.equal(DEPTH_BOUND, 6);
});

test("R2: past the depth bound, or where the target is undetermined, the leg is undetermined on that axis and says why", () => {
  const w = world();
  /* A cycle written around the write-time guard: the bound is what ends it. */
  w.inquiry("INQ-2026-0001-a", [{ target: "INQ-2026-0002-a" }]);
  w.inquiry("INQ-2026-0002-a", [{ target: "INQ-2026-0001-a" }]);
  const p = w.s.strengthOf("INQ-2026-0001-a");
  for (const axis of STRENGTH_AXES) {
    assert.equal(p[axis].state, "undetermined", axis);
    assert.equal(p[axis].determined, false);
    assert.ok(p[axis].undetermined_at.length >= 1);
    assert.match(p[axis].detail, /depth bound of 6/);
  }
  assert.match(p.capture.undetermined_at[0].why, /undetermined on capture/);
});

test("R3: an ungraded member is inert and named; an axis with no graded member is unrated; an empty basis rests on nothing", () => {
  const w = world();
  w.inquiry("INQ-2026-0001-a", [
    { target: "INFO-2026-0001-a", grade: "B", axis: "capture", source: "capture" },
    { target: "INFO-2026-0002-a" }, { target: "INFO-2026-0003-a" },
  ]);
  const p = w.s.strengthOf("INQ-2026-0001-a");
  assert.equal(p.capture.grade, "B", "never floored by an ungraded leg");
  const inert = p.capture.not_load_bearing.map((m) => m.target_id);
  assert.ok(inert.includes("INFO-2026-0002-a") && inert.includes("INFO-2026-0003-a"), "every ungraded leg is named");
  assert.equal(p.connection.state, "unrated");
  assert.equal(p.connection.load_bearing, 0);
  assert.match(p.connection.detail, /^UNRATED on connection: no leg on this axis carries an established grade/);
  w.inquiry("INQ-2026-0002-a", []);
  const e = w.s.strengthOf("INQ-2026-0002-a");
  for (const axis of STRENGTH_AXES) {
    assert.equal(e[axis].state, "unrated");
    assert.match(e[axis].detail, /rests on nothing/);
  }
});

test("R4: a ground is its weakest member; grounds compose by the strongest; unlabelled legs are one necessary part", () => {
  const w = world();
  w.inquiry("INQ-2026-0001-a", [
    { target: "INFO-2026-0001-a", grade: "A", axis: "connection", source: "resolution", ground: "records" },
    { target: "INFO-2026-0002-a", grade: "C", axis: "connection", source: "resolution", ground: "records" },
    { target: "INFO-2026-0003-a", grade: "B", axis: "connection", source: "resolution", ground: "witness" },
  ]);
  const p = w.s.strengthOf("INQ-2026-0001-a").connection;
  assert.equal(p.grade, "B", "max(min(A,C), B)");
  assert.equal(p.weakest.target_id, "INFO-2026-0003-a");
  const g = Object.fromEntries(p.grounds.map((x) => [x.ground, x]));
  assert.equal(g.records.grade, "C");
  assert.equal(g.records.weakest.target_id, "INFO-2026-0002-a", "each ground names its own setter");
  assert.match(p.detail, /STRONGEST of the 2 sets of reasons/);
  assert.doesNotMatch(p.detail, /\b(AND|OR|disjunction|grounds?)\b/, "DEC-32 clause 1: no machine words");

  /* Mixed: the unlabelled leg is necessary, so the axis is the weaker of it and the OR part. */
  const m = world();
  m.inquiry("INQ-2026-0001-a", [
    { target: "INFO-2026-0001-a", grade: "A", axis: "connection", source: "resolution", ground: "records" },
    { target: "INFO-2026-0004-a", grade: "C", axis: "connection", source: "resolution" },
  ]);
  const mixed = m.s.strengthOf("INQ-2026-0001-a").connection;
  assert.equal(mixed.grade, "C");
  assert.equal(mixed.weakest.target_id, "INFO-2026-0004-a");
  assert.match(mixed.detail, /needed by every one of those sets/);
});

test("R4: the axis is undetermined only when a necessary part is: an open ground beside a graded one is named", () => {
  const w = world();
  w.inquiry("INQ-2026-0009-a", [{ target: "INQ-2026-0008-a" }]);
  w.inquiry("INQ-2026-0008-a", [{ target: "INQ-2026-0009-a" }]);
  w.inquiry("INQ-2026-0001-a", [
    { target: "INFO-2026-0001-a", grade: "C", axis: "connection", source: "resolution", ground: "records" },
    { target: "INQ-2026-0009-a", ground: "chain" },
  ]);
  const p = w.s.strengthOf("INQ-2026-0001-a").connection;
  assert.equal(p.state, "graded", "one graded branch carries it");
  assert.equal(p.grade, "C");
  assert.match(p.detail, /1 further set is UNDETERMINED and could only be stronger/);
  /* The implicit part unknown: the whole axis is. */
  const q = world();
  q.inquiry("INQ-2026-0009-a", [{ target: "INQ-2026-0008-a" }]);
  q.inquiry("INQ-2026-0008-a", [{ target: "INQ-2026-0009-a" }]);
  q.inquiry("INQ-2026-0001-a", [
    { target: "INFO-2026-0001-a", grade: "A", axis: "connection", source: "resolution" },
    { target: "INQ-2026-0009-a" },
  ]);
  assert.equal(q.s.strengthOf("INQ-2026-0001-a").connection.state, "undetermined");
});

test("R5: a hunch leg is inert in every pair whatever it states, named as a hunch, and inherits nothing", () => {
  const w = world();
  w.inquiry("INQ-2026-0002-a", [{ target: "INFO-2026-0009-a", grade: "A", axis: "connection", source: "resolution" }]);
  w.inquiry("INQ-2026-0001-a", [
    { target: "INFO-2026-0001-a", grade: "A", axis: "connection", source: "hunch" },
    { target: "INFO-2026-0002-a", grade: "C", axis: "connection", source: "resolution" },
    { target: "INQ-2026-0002-a", grade: "A", axis: "connection", source: "hunch" },
  ]);
  const p = w.s.strengthOf("INQ-2026-0001-a");
  assert.equal(p.connection.grade, "C", "the hunch's A neither sets nor lifts the axis");
  const hunches = p.connection.not_load_bearing.filter((m) => m.grade_source === "hunch");
  assert.equal(hunches.length, 2);
  for (const h of hunches) { assert.equal(h.grade, null); assert.match(h.why, /marked as a hunch/); }
  assert.ok(!p.connection.not_load_bearing.some((m) => m.via === "inherited"), "the hunch inquiry leg inherits nothing");
  /* The live pair and the pair over a version of the same legs agree. */
  w.connection.set("null|INFO-2026-0002-a", "C");
  w.version("INQ-2026-0001-a", "v1", "accepted", [
    { target: "INFO-2026-0001-a", grade: "A", axis: "connection", source: "hunch" },
    { target: "INFO-2026-0002-a", grade: "C", axis: "connection", source: "resolution" },
    { target: "INQ-2026-0002-a", grade: "A", axis: "connection", source: "hunch" },
  ]);
  const v = w.s.versionStrength({ id: "INQ-2026-0001-a", version: "v1", viewer: "class:member" });
  assert.equal(v.ok, true, JSON.stringify(v));
  assert.equal(v.pair.connection.grade, p.connection.grade);
  assert.equal(v.hunches.length, 2);
});

test("R18: every answer is per axis, with the member that sets it named, and carries no single composed value", () => {
  const w = world();
  w.inquiry("INQ-2026-0001-a", [{ target: "INFO-2026-0001-a", grade: "B", axis: "capture", source: "capture" }]);
  const p = w.s.strengthOf("INQ-2026-0001-a");
  assert.deepEqual(Object.keys(p).filter((k) => STRENGTH_AXES.includes(k)).sort(), [...STRENGTH_AXES].sort());
  for (const k of COMPOSED) assert.ok(!(k in p), k);
  for (const axis of STRENGTH_AXES)
    if (p[axis].state === "graded") assert.ok(p[axis].weakest && p[axis].weakest.target_id);
  const c = w.s.candidatePair({ inquiry: "INQ-2026-0001-a", legs: [{ target: "INFO-2026-0001-a", grade: "A", grade_axis: "capture", grade_source: "capture" }] });
  assert.deepEqual(Object.keys(c.pair).sort(), [...STRENGTH_AXES].sort());
});

test("R19: no leg counts above what the record earns, on the live pair, a version and a candidate alike", () => {
  const w = world();
  w.ceilings.set("INFO-2026-0001-a", { grade: "B", why: "the capture ceiling" });
  w.inquiry("INQ-2026-0002-a", [{ target: "INFO-2026-0001-a", grade: "A", axis: "capture", source: "capture" }]);
  w.inquiry("INQ-2026-0001-a", [{ target: "INQ-2026-0002-a" }]);
  assert.equal(w.s.strengthOf("INQ-2026-0002-a").capture.grade, "B");
  assert.equal(w.s.strengthOf("INQ-2026-0001-a").capture.grade, "B", "and through an inquiry leg");
  const c = w.s.candidatePair({ inquiry: "INQ-2026-0003-a",
    legs: [{ target: "INFO-2026-0001-a", grade: "A", grade_axis: "capture", grade_source: "capture" },
           { target: "INQ-2026-0002-a", role: "supports" }] });
  assert.equal(c.pair.capture.grade, "B");
  w.version("INQ-2026-0001-a", "v1", "accepted", [{ target: "INQ-2026-0002-a", ground: "" }]);
  const v = w.s.versionStrength({ id: "INQ-2026-0001-a", version: "v1", viewer: "class:member" });
  assert.equal(v.pair.capture.grade, "B", "a version's inquiry leg contributes the target's own capped answer (R2)");
});

test("R17: the grouping act's before and after are strengthOf's answers, so a regrouping shows in them", () => {
  const w = world();
  const legs = [
    { target: "INFO-2026-0001-a", grade: "A", axis: "connection", source: "resolution" },
    { target: "INFO-2026-0002-a", grade: "C", axis: "connection", source: "resolution" },
  ];
  w.inquiry("INQ-2026-0001-a", legs);
  const before = w.s.strengthOf("INQ-2026-0001-a");
  w.inquiry("INQ-2026-0001-b", legs.map((l, i) => ({ ...l, ground: `set ${i}` })));
  w.basis.set("INQ-2026-0001-a", w.basis.get("INQ-2026-0001-b"));
  const after = w.s.strengthOf("INQ-2026-0001-a");
  assert.equal(before.connection.grade, "C");
  assert.equal(after.connection.grade, "A", "two sets that each carry it: the strongest");
});

test("R26: candidatePair answers R1–R5 over the given legs in place of the live basis, and writes nothing", () => {
  const w = world();
  w.ceilings.set("INFO-2026-0001-a", { grade: "C", why: "measured" });
  w.inquiry("INQ-2026-0002-a", [{ target: "INFO-2026-0005-a", grade: "B", axis: "connection", source: "resolution" }]);
  w.inquiry("INQ-2026-0001-a", [{ target: "INFO-2026-0009-a", grade: "A", axis: "connection", source: "resolution" }]);
  const before = JSON.stringify(w.rows(`SELECT * FROM sqlite_master`)) + JSON.stringify(w.rows(`SELECT * FROM bundles`));
  const c = w.s.candidatePair({ inquiry: "INQ-2026-0001-a", legs: [
    { target: "INFO-2026-0001-a", role: "supports", grade: "A", grade_axis: "capture", grade_source: "capture", ground: "p1" },
    { target: "INQ-2026-0002-a", role: "supports", grade: null, grade_axis: null, grade_source: null, ground: "p2" },
    { target: "INFO-2026-0003-a", role: "cuts_against", grade: "A", grade_axis: "connection", grade_source: "hunch", ground: "p2" },
  ] });
  assert.equal(c.error, null);
  assert.equal(c.pair.capture.grade, "C", "R1's bound applies to a candidate's legs");
  assert.equal(c.pair.connection.grade, "B", "the inquiry leg walks to its own basis; the live basis is not read");
  assert.ok(c.pair.connection.not_load_bearing.some((m) => m.grade_source === "hunch"), "R5");
  const after = JSON.stringify(w.rows(`SELECT * FROM sqlite_master`)) + JSON.stringify(w.rows(`SELECT * FROM bundles`));
  assert.equal(after, before);
});

test("R26: a leg whose target cannot be read leaves its axis undetermined or inert, never an error; a failure is {pair: null, error}", () => {
  const w = world();
  /* A sub-inquiry whose basis cannot be finished (a cycle): its axis is undetermined, no error. */
  w.inquiry("INQ-2026-0008-a", [{ target: "INQ-2026-0009-a" }]);
  w.inquiry("INQ-2026-0009-a", [{ target: "INQ-2026-0008-a" }]);
  const c = w.s.candidatePair({ inquiry: "INQ-2026-0001-a", legs: [{ target: "INQ-2026-0008-a" }, { target: "", grade: "A" }, null] });
  assert.equal(c.error, null);
  assert.equal(c.pair.connection.state, "undetermined");
  /* The arithmetic failing is answered, never thrown, its message cut at 200 characters. */
  const long = "x".repeat(500);
  w.s.inquiry.basisFor = () => { throw new Error(long); };
  const f = w.s.candidatePair({ inquiry: "INQ-2026-0001-a", legs: [{ target: "INQ-2026-0008-a" }] });
  assert.equal(f.pair, null);
  assert.equal(f.error.length, 200);
});
