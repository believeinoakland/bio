/* The old suites' strength shares, converted to the module's interface (T18; rows of `build/jobs/T17/legacy-tests.md`):
   `d216-sharing.probe` (crossed per-project bars, R14), `publish` (the bar's source is the project, R14),
   `testimonyaxis` (per-axis figures with testimony, R1, R4), `d280-strengthbar` (R14, R16), `grounds` (R2, R4) and
   `partitionindependence` (R11, R12). `rec108-cache-asof`'s share is in `cache.test.mjs`. Also the axis states (R3,
   R4) as `STRENGTH_STATES` names them, defined in this module. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";
import { strengthOps, STRENGTH_AXES, STRENGTH_STATES, PARTITION_INDEPENDENCE_CHECKS } from "../../../src/strength/index.mjs";

const INQ = "INQ-2026-0001-a";
const D = (n) => `INFO-2026-000${n}-a`;
const P1 = "PROJ-2026-0042-abc", P2 = "PROJ-2026-0043-def";
const COMPOSED = ["strength", "grade", "score", "overall", "composed", "letter", "rating", "value"];

test("R14 (d216-sharing.probe): two projects' bars never cross: each answers its own declaration, alike for every viewer who may see it", () => {
  const w = world();
  w.member("alice"); w.member("bob");
  w.project(P1, ["alice", "bob"]);
  w.project(P2, ["alice", "bob"]);
  w.file(P1, "bundle.md", "---\nrequired_strength:\n  capture: A\n  connection: C\n---\n# One\n");
  w.file(P2, "bundle.md", "---\nrequired_strength:\n  connection: B\n---\n# Two\n");
  for (const viewer of ["member:alice", "member:bob", MACHINE]) {
    const one = w.s.strengthBarOf({ project: P1, viewer }).bar;
    const two = w.s.strengthBarOf({ project: P2, viewer }).bar;
    assert.deepEqual([one.project, one.capture, one.connection], [P1, "A", "C"], viewer);
    assert.deepEqual([two.project, two.capture, two.connection], [P2, null, "B"], viewer);
    assert.match(two.detail, /no bar set on the capture axis, connection B/);
    assert.doesNotMatch(two.detail, /capture A|connection C/, "nothing of the other project's bar reaches this one");
  }
  assert.deepEqual(w.s.strengthBarOf({ project: P1, viewer: "member:alice" }), w.s.strengthBarOf({ project: P1, viewer: "member:bob" }),
    "never set by who a reader is");
});

test("R14 (publish, d280-strengthbar): a project's bar is sourced from the project and names it, with no composed key; an undeclared project's source is none", () => {
  const w = world();
  w.project(P1);
  w.project(P2);
  w.file(P1, "bundle.md", "---\nrequired_strength:\n  capture: B\n  connection: B\n---\n");
  const bar = w.s.projectBar(P1);
  assert.deepEqual(Object.keys(bar).sort(), ["capture", "connection", "declared", "detail", "project", "source"]);
  assert.deepEqual([bar.declared, bar.source, bar.project], [true, "project", P1]);
  for (const k of COMPOSED) assert.ok(!(k in bar), k);
  assert.match(bar.detail, new RegExp(`required by ${P1}`));
  const none = w.s.projectBar(P2);
  assert.deepEqual(Object.keys(none).sort(), ["capture", "connection", "declared", "detail", "project", "source"]);
  assert.deepEqual([none.declared, none.source, none.project, none.capture, none.connection], [false, "none", P2, null, null]);
  for (const k of COMPOSED) assert.ok(!(k in none), k);
  const read = w.s.strengthBarOf({ project: P1, viewer: MACHINE });
  assert.deepEqual(Object.keys(read).sort(), ["bar", "ok", "project"]);
});

test("R16 (d280-strengthbar): BAR_IS_A_PROJECT_PROPERTY says the bar is a project's and names the two reads to ask instead", () => {
  const w = world();
  const r = w.s.strengthBarOf({ target: "INQ-2026-0009-a", project: P1, viewer: MACHINE });
  assert.deepEqual([r.ok, r.reason, r.target], [false, "BAR_IS_A_PROJECT_PROPERTY", "INQ-2026-0009-a"]);
  assert.match(r.detail, /property of a PROJECT, not of a finding or a claim/);
  assert.match(r.detail, /op=strengthbarof&project=<project id>/);
  assert.match(r.detail, /op=strengthbarof&group=/);
  assert.match(r.detail, /whichever project published it/);
});

test("R1, R4 (testimonyaxis): with testimony beside capture and connection, each axis's figure is over its own population", () => {
  const w = world();
  w.ceilings.set(D(1), { grade: "A", why: "held" });
  w.inquiry(INQ, [
    { target: D(1), grade: "B", axis: "capture", source: "capture" },
    { target: D(2), grade: "C", axis: "connection", source: "resolution" },
    { target: D(3), grade: "D", axis: "testimony", source: "testimony" },
    { target: D(4), grade: "B", axis: "testimony", source: "testimony" },
  ]);
  const s = w.s.strengthOf(INQ);
  assert.deepEqual(STRENGTH_AXES.map((a) => [a, s[a].state, s[a].grade]),
    [["capture", "graded", "B"], ["connection", "graded", "C"], ["testimony", "graded", "D"]]);
  assert.deepEqual(STRENGTH_AXES.map((a) => [s[a].load_bearing, s[a].population]), [[1, 4], [1, 4], [2, 4]],
    "every leg is a member of each axis's population; only the legs graded on an axis bear on it");
  assert.equal(s.capture.weakest.target_id, D(1));
  assert.equal(s.connection.weakest.target_id, D(2));
  assert.equal(s.testimony.weakest.target_id, D(3));
  /* On capture, the testimony legs are named as not applying at all, a different fact from graded elsewhere. */
  const onCapture = Object.fromEntries(s.capture.not_load_bearing.map((m) => [m.target_id, m.why]));
  assert.match(onCapture[D(3)], /graded as testimony: the capture grade measures how the record read a document in/);
  assert.match(onCapture[D(4)], /does not apply here/);
  assert.match(onCapture[D(2)], /the leg's grade is on the connection axis/);
  /* The testimony leg stated at B is read at D, and says so; it never lifts capture or connection. */
  const tw = world();
  tw.inquiry(INQ, [{ target: D(4), grade: "B", axis: "testimony", source: "testimony" }]);
  const t = tw.s.strengthOf(INQ);
  assert.deepEqual([t.testimony.grade, t.capture.state, t.connection.state], ["D", "unrated", "unrated"]);
});

test("R4 (grounds): an unstructured axis's exact keys; a structured one's per-set population and load-bearing count; the detail names the winning set", () => {
  const w = world();
  w.inquiry(INQ, [{ target: D(1), grade: "B", axis: "connection", source: "resolution" }]);
  const flat = w.s.strengthOf(INQ).connection;
  assert.deepEqual(Object.keys(flat).sort(),
    ["axis", "depth_bound", "detail", "determined", "grade", "load_bearing", "not_load_bearing", "population", "state", "weakest"],
    "no grounds key on a basis nobody structured");
  const g = world();
  g.inquiry(INQ, [
    { target: D(1), grade: "A", axis: "connection", source: "resolution", ground: "records" },
    { target: D(2), axis: "connection", source: "resolution", ground: "records" },
    { target: D(3), grade: "C", axis: "connection", source: "resolution", ground: "witness" },
    { target: D(4), grade: "D", axis: "connection", source: "resolution", ground: "witness" },
    { target: D(5), grade: "B", axis: "capture", source: "capture", ground: "witness" },
  ]);
  const c = g.s.strengthOf(INQ).connection;
  assert.deepEqual(Object.keys(c).sort(),
    ["axis", "depth_bound", "detail", "determined", "grade", "grounds", "load_bearing", "not_load_bearing", "population", "state", "weakest"]);
  assert.deepEqual(c.grounds.map((x) => [x.ground, x.state, x.grade, x.population, x.load_bearing]),
    [["records", "graded", "A", 2, 1], ["witness", "graded", "D", 3, 2]]);
  assert.deepEqual([c.grade, c.population, c.load_bearing], ["A", 5, 3]);
  assert.match(c.detail, /STRONGEST of the 2 sets of reasons that each carry this conclusion on their own, which is "records"/);
  assert.match(c.detail, new RegExp(`which is ${D(1)}`));
  assert.deepEqual(c.grounds[0].not_load_bearing.map((m) => m.target_id), [D(2)]);
});

test("R2, R4 (grounds): undetermined_at names each unfinished leg; every set undetermined makes the axis undetermined and says every one is", () => {
  const w = world();
  w.inquiry("INQ-2026-0008-a", [{ target: "INQ-2026-0009-a" }]);
  w.inquiry("INQ-2026-0009-a", [{ target: "INQ-2026-0008-a" }]);
  w.inquiry(INQ, [{ target: "INQ-2026-0008-a", ground: "chain" }, { target: "INQ-2026-0009-a", ground: "loop" }]);
  const c = w.s.strengthOf(INQ).connection;
  assert.deepEqual([c.state, c.grade, c.determined], ["undetermined", null, false]);
  assert.deepEqual(c.undetermined_at.map((m) => [m.target_id, m.ground, m.via]),
    [["INQ-2026-0008-a", "chain", "inherited"], ["INQ-2026-0009-a", "loop", "inherited"]]);
  for (const m of c.undetermined_at) assert.match(m.why, /is undetermined on connection/);
  assert.deepEqual(c.grounds.map((x) => [x.ground, x.state, x.undetermined_at.length]), [["chain", "undetermined", 1], ["loop", "undetermined", 1]]);
  assert.match(c.detail, /EVERY one of the 2 sets of reasons it rests on is undetermined/);
  assert.match(c.detail, /depth bound of 6 at INQ-2026-0008-a, INQ-2026-0009-a/);
  assert.match(c.detail, /unknown rather than absent/);
});

test("R11, R12 (partitionindependence): the version arm's exact keys carry no strength; order and a POST body read the same; capture:<sha>; one part is unchecked; no partition is C-71.3", () => {
  const w = world();
  w.bundle(D(1)); w.bundle(D(2)); w.bundle(D(3));
  w.inquiry(INQ, [{ target: D(1) }, { target: D(2) }, { target: D(1) }]);
  w.version(INQ, "main", "suggested", [{ target: D(1), ground: "papers" }, { target: D(1), ground: "talk" }, { target: D(3), ground: "talk" }]);
  w.capture("sha-shared", D(1));
  const v = w.s.partitionIndependence({ id: INQ, version: "main", viewer: MACHINE });
  assert.deepEqual(Object.keys(v).sort(), ["independence", "inquiry", "legs_complete", "legs_read", "ok", "version", "version_state", "wrote"]);
  for (const k of [...COMPOSED, "pair", ...STRENGTH_AXES]) assert.ok(!(k in v), k);
  assert.deepEqual(v.independence, { checked: true, parts: 2,
    shared: [{ a: "papers", b: "talk", through: [`bundle:${D(1)}`, "capture:sha-shared"] }], complete: true, limit: 200 });
  /* Positions out of order, and the same partition sent in a POST body or on the query string. */
  const ordered = w.s.partitionIndependence({ id: INQ, viewer: MACHINE, partition: [[0], [1, 2]] });
  const shuffled = w.s.partitionIndependence({ id: INQ, viewer: MACHINE, partition: [[0], [2, 1]] });
  assert.deepEqual(shuffled.independence, ordered.independence);
  assert.deepEqual(ordered.independence.shared, [{ a: "part 1", b: "part 2", through: [`bundle:${D(1)}`, "capture:sha-shared"] }]);
  const op = (qs, body) => strengthOps(w.s, new URL(`http://x/?id=${INQ}&viewer=${MACHINE}&${qs}`), body).partitionindependence();
  assert.deepEqual(op("", { partition: [[0], [1, 2]] }), ordered);
  assert.deepEqual(op(`partition=${encodeURIComponent(JSON.stringify([[0], [1, 2]]))}`, null), ordered);
  /* One part: nothing to compare, stated as unchecked, never as independent. */
  const one = w.s.partitionIndependence({ id: INQ, viewer: MACHINE, partition: [[0, 1, 2]] });
  assert.deepEqual(one.independence, { checked: false, parts: 1, shared: [], complete: null, limit: 200 });
  /* No partition and no version named. */
  for (const partition of [undefined, null, "", "[]", "not json"]) {
    const r = w.s.partitionIndependence({ id: INQ, viewer: MACHINE, partition });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "PARTITION_INDEPENDENCE_UNREADABLE", "C-71.3"], String(partition));
    assert.equal(r.translation, PARTITION_INDEPENDENCE_CHECKS.PARTITION_INDEPENDENCE_UNREADABLE.translation);
  }
});

test("R3, R4: every axis and set answers one of STRENGTH_STATES, and each of the three is reached", () => {
  assert.deepEqual([...STRENGTH_STATES], ["graded", "unrated", "undetermined"]);
  assert.ok(Object.isFrozen(STRENGTH_STATES));
  const w = world();
  w.inquiry("INQ-2026-0008-a", [{ target: "INQ-2026-0009-a" }]);
  w.inquiry("INQ-2026-0009-a", [{ target: "INQ-2026-0008-a" }]);
  w.inquiry(INQ, [
    { target: D(1), grade: "B", axis: "connection", source: "resolution", ground: "a" },
    { target: "INQ-2026-0008-a", ground: "b" },
    { target: D(2), ground: "c" },
  ]);
  w.inquiry("INQ-2026-0002-a", [{ target: "INQ-2026-0008-a" }]);
  const seen = new Set();
  for (const id of [INQ, "INQ-2026-0002-a", "INQ-2026-0003-a"]) {
    if (id === "INQ-2026-0003-a") w.inquiry(id, []);
    const s = w.s.strengthOf(id);
    for (const a of STRENGTH_AXES) {
      assert.ok(STRENGTH_STATES.includes(s[a].state), `${id} ${a}`);
      seen.add(s[a].state);
      for (const g of s[a].grounds ?? []) { assert.ok(STRENGTH_STATES.includes(g.state)); seen.add(g.state); }
    }
  }
  assert.deepEqual([...seen].sort(), [...STRENGTH_STATES].sort());
});
