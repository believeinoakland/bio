/* Evidence from an off-the-record source, attested anonymously (R34; DEC-119 (2)(3), DEC-102 item 1, N523): `levels`
   may name a capture by its SHA-256; a leg on a document whose capture is stated at `group` or `project` counts, at its
   own grade, only beside an independent corroborating leg, and is otherwise inert and named; R30 answers it; `cover`,
   `name` or silence keep today's grade; no answer names the member. Driven over the live pair, a version, a candidate
   and the corroboration read, at the module's interface, over captures held in provenance's register (its R48). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";

const INQ = "INQ-2026-0001-a";
const KNOCK = "INFO-2026-0001-a", DOC = "INFO-2026-0002-a", DOC2 = "INFO-2026-0003-a";
const OBS = "INFO-2026-0004-observation";
const SHA = "knock-sha";
const UNCORROBORATED = /unnamed source that a member attests anonymously, and nothing independent in what this rests on bears it out/;
const conn = (target, grade = "B") => ({ target, grade, axis: "connection", source: "resolution" });
const cap = (target, grade = "B") => ({ target, grade, axis: "capture", source: "capture" });

function knocked() {
  const w = world();
  w.bundle(KNOCK); w.bundle(DOC); w.bundle(DOC2);
  w.capture(SHA, KNOCK, "https://example.test/knock");
  w.capture("doc-sha", DOC, "https://example.test/doc");
  w.capture("doc2-sha", DOC2, "https://example.test/knock");      /* shares the knock's address */
  w.observation(OBS, "member-ann");
  return w;
}
const inert = (axis, target) => axis.not_load_bearing.find((m) => m.target_id === target);

test("R34: a leg on a document whose capture levels states at group or project is inert alone, named as uncorroborated anonymous evidence, on its own axis", () => {
  for (const level of ["group", "project"]) {
    for (const leg of [conn(KNOCK, "B"), cap(KNOCK, "B")]) {
      const w = knocked();
      w.inquiry(INQ, [leg]);
      const p = w.s.strengthOf(INQ, { levels: { [SHA]: level } });
      const axis = p[leg.axis];
      assert.equal(axis.state, "unrated", `${level} ${leg.axis}`);
      assert.match(inert(axis, KNOCK).why, UNCORROBORATED);
      assert.deepEqual(p.levels, { [SHA]: level });
      assert.ok(!JSON.stringify(p).includes("member-ann"));
    }
  }
});

test("R34: beside an independent document leg it counts at its own grade; beside one sharing its origin, or beside another anonymous one, it does not", () => {
  const w = knocked();
  w.inquiry(INQ, [conn(KNOCK, "B"), conn(DOC, "C")]);
  const p = w.s.strengthOf(INQ, { levels: { [SHA]: "group" } });
  assert.equal(p.connection.grade, "C");
  assert.equal(inert(p.connection, KNOCK), undefined, "counted");
  w.inquiry("INQ-2026-0002-a", [conn(KNOCK, "A"), conn(DOC, "B", )]);
  const own = w.s.strengthOf("INQ-2026-0002-a", { levels: { [SHA]: "group" } });
  assert.equal(own.connection.grade, "B", "at its own grade: A, beside B, weakest B");
  /* Sharing the knock's address: one origin. */
  w.inquiry("INQ-2026-0003-a", [conn(KNOCK), conn(DOC2)]);
  const shared = w.s.strengthOf("INQ-2026-0003-a", { levels: { [SHA]: "group" } });
  assert.match(inert(shared.connection, KNOCK).why, UNCORROBORATED);
  /* Two anonymous captures do not bear each other out. */
  w.inquiry("INQ-2026-0004-a", [conn(KNOCK), conn(DOC)]);
  const both = w.s.strengthOf("INQ-2026-0004-a", { levels: { [SHA]: "group", "doc-sha": "project" } });
  assert.equal(both.connection.state, "unrated");
  assert.match(inert(both.connection, DOC).why, UNCORROBORATED);
});

test("R34: a cover or name testimony leg does not bear out anonymous evidence (its author cannot be told from the attesting member); nor does an inquiry or an ungraded leg", () => {
  for (const beside of [{ target: OBS, grade: "D", axis: "testimony", source: "testimony" }, { target: "INQ-2026-0009-a" },
                        { target: DOC }]) {
    const w = knocked();
    w.inquiry("INQ-2026-0009-a", [conn(DOC2)]);
    w.inquiry(INQ, [conn(KNOCK), beside]);
    const p = w.s.strengthOf(INQ, { levels: { [SHA]: "group", [OBS]: "name" } });
    assert.match(inert(p.connection, KNOCK).why, UNCORROBORATED, beside.target);
  }
});

test("R34: anonymous evidence never bears out anonymous testimony (R29)", () => {
  const w = knocked();
  w.inquiry(INQ, [{ target: OBS, grade: "D", axis: "testimony", source: "testimony" }, conn(KNOCK)]);
  const p = w.s.strengthOf(INQ, { levels: { [OBS]: "group", [SHA]: "group" } });
  assert.equal(p.testimony.state, "unrated");
  /* Negative control: the same document at name bears the observation out. */
  const n = w.s.strengthOf(INQ, { levels: { [OBS]: "group", [SHA]: "name" } });
  assert.equal(n.testimony.grade, "D");
});

test("R34: at cover or name, or not named in levels, the leg keeps today's grade", () => {
  for (const levels of [{ [SHA]: "cover" }, { [SHA]: "name" }, { other: "group" }, {}, null]) {
    const w = knocked();
    w.inquiry(INQ, [conn(KNOCK, "B")]);
    assert.equal(w.s.strengthOf(INQ, { levels }).connection.grade, "B", JSON.stringify(levels));
  }
});

test("R34, R30: testimonyCorroboration answers anonymous evidence corroborated or uncorroborated, kind evidence with its capture, naming no member", () => {
  const w = knocked();
  w.inquiry(INQ, [conn(KNOCK), conn(DOC)]);
  const r = w.s.testimonyCorroboration({ inquiry: INQ, levels: { [SHA]: "project" }, viewer: MACHINE });
  assert.equal(r.ok, true);
  assert.deepEqual(r.legs, [{ ord: 0, target_id: KNOCK, level: "project", kind: "evidence", capture: SHA,
                              state: "corroborated", corroborated_by: [{ ord: 1, target_id: DOC }] }]);
  w.inquiry("INQ-2026-0002-a", [conn(KNOCK), conn(DOC2)]);
  const u = w.s.testimonyCorroboration({ inquiry: "INQ-2026-0002-a", levels: { [SHA]: "group" }, viewer: MACHINE });
  assert.equal(u.legs[0].state, "uncorroborated");
  assert.ok(!JSON.stringify([r, u]).includes("member-ann"));
});

test("R34: versionStrength and candidatePair apply it: an uncorroborated anonymous capture is in ungraded, named so, and inert in the pair", () => {
  const w = knocked();
  w.inquiry(INQ, [], "ENT-1");
  w.connection.set(`ENT-1|${KNOCK}`, "B");
  w.connection.set(`ENT-1|${DOC}`, "C");
  w.version(INQ, "alone", "accepted", [{ ...conn(KNOCK), ground: "" }]);
  w.version(INQ, "beside", "accepted", [{ ...conn(KNOCK), ground: "" }, { ...conn(DOC), ground: "" }]);
  const levels = { [SHA]: "group" };
  const alone = w.s.versionStrength({ id: INQ, version: "alone", viewer: MACHINE, levels });
  assert.deepEqual(alone.graded, []);
  assert.match(alone.ungraded[0].why, UNCORROBORATED);
  assert.equal(alone.pair.connection.state, "unrated");
  const beside = w.s.versionStrength({ id: INQ, version: "beside", viewer: MACHINE, levels });
  assert.deepEqual(beside.graded.map((x) => [x.target_id, x.grade]), [[KNOCK, "B"], [DOC, "C"]]);
  const c = w.s.candidatePair({ inquiry: INQ, levels, legs: [{ target: KNOCK, grade: "B", grade_axis: "connection", grade_source: "resolution" }] });
  assert.equal(c.pair.connection.state, "unrated");
  assert.match(inert(c.pair.connection, KNOCK).why, UNCORROBORATED);
});
