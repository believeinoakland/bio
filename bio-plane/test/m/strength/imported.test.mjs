/* A leg on another group's accepted work (R33; DEC-96 item 1, DEC-92, N522): it contributes, on each axis, the grade the
   accepted edition publishes for that finding (`accepted-work.acceptedFinding`'s `pair`), read as an inquiry leg's
   target answer with nothing walked past it, never stronger than that frozen grade; it is named as another group's,
   with its group, case and edition; absent, unreadable or null is undetermined on every axis and says why; a withdrawn
   acceptance changes nothing. Driven over `strengthOf`, `inquiryStrength`, `versionStrength` and `candidatePair` at the
   module's interface, with accepted-work's read the fixture controls (its R2). `recomputePair`'s arm is in
   `method.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";
import { STRENGTH_AXES } from "../../../src/strength/index.mjs";

const INQ = "INQ-2026-0001-a";
const REF = `imported:${"a".repeat(64)}/INQ-2026-0500-a`;
const PAIR = { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" },
               testimony: { state: "unrated", grade: null } };
const conn = (target, grade) => ({ target, grade, axis: "connection", source: "resolution" });
const memberOn = (axis, target) => [...(axis.weakest ? [axis.weakest] : []), ...axis.not_load_bearing,
                                    ...(axis.undetermined_at ?? [])].find((m) => m.target_id === target);

function accepted(pair = PAIR, opts = {}) {
  const w = world();
  w.acceptedFinding(REF, 2, { pair, ...opts });
  return w;
}

test("R33: a leg on an accepted finding contributes, per axis, the grade that edition publishes, named as another group's with its group, case and edition", () => {
  const w = accepted();
  w.inquiry(INQ, [{ target: REF, edition: 2 }]);
  const p = w.s.strengthOf(INQ);
  assert.equal(p.ok, true);
  assert.deepEqual(STRENGTH_AXES.map((a) => [a, p[a].state, p[a].grade]),
    [["capture", "graded", "B"], ["connection", "graded", "C"], ["testimony", "unrated", null]]);
  for (const axis of ["capture", "connection"]) {
    const m = p[axis].weakest;
    assert.equal(m.target_id, REF);
    assert.equal(m.via, "imported");
    assert.equal(m.inherited_from, REF);
    assert.deepEqual(m.another_groups, { group: "other-group", case: "CASE-1", edition: 2, finding: "INQ-2026-0500-a" });
    assert.ok(!("through" in m), "nothing past another group's finding is walked");
    assert.match(m.why, /another group's finding, in that group's case CASE-1 at edition 2, published by other-group/);
  }
  assert.match(memberOn(p.testimony, REF).why, /publishes no grade on testimony, so it is not load-bearing/);
  /* The edition read is the one the leg names, from the inquiry's authored basis (the projection does not hold it). */
  assert.deepEqual(w.aw.reads.at(-1), { ref: REF, edition: 2, viewer: null });
});

test("R33: never stronger than the frozen grade: beside a weaker leg the weakest still sets the axis; a letter-only pair reads the same; an axis the edition does not publish is unrated", () => {
  const w = accepted({ capture: "A", connection: "B" });
  w.inquiry(INQ, [{ target: REF, edition: 2 }, conn("INFO-2026-0001-a", "C")]);
  const p = w.s.strengthOf(INQ);
  assert.equal(p.connection.grade, "C");
  assert.equal(p.connection.weakest.target_id, "INFO-2026-0001-a");
  assert.equal(p.capture.grade, "A");
  assert.equal(p.testimony.state, "unrated");
  /* Beside a stronger leg the edition's grade sets it: never lifted. */
  const s = accepted({ connection: "C" });
  s.inquiry(INQ, [{ target: REF, edition: 2 }, conn("INFO-2026-0001-a", "A")]);
  const q = s.s.strengthOf(INQ);
  assert.equal(q.connection.grade, "C");
  assert.equal(q.connection.weakest.target_id, REF);
});

test("R33: absent, unreadable, null, another edition, or no edition named: the leg is undetermined on every axis, named with why", () => {
  const cases = [
    ["nothing registered", (w) => { w.aw.mode = "absent"; }, 2, /holds no accepted work to read it from/],
    ["the read throws", (w) => { w.aw.mode = "throw"; }, 2, /could not be read just now/],
    ["not held at that edition", () => {}, 3, /does not hold at edition 3/],
    ["no edition named", () => {}, null, /without saying which edition/],
  ];
  for (const [name, set, edition, why] of cases) {
    const w = accepted();
    set(w);
    w.inquiry(INQ, [{ target: REF, ...(edition != null ? { edition } : {}) }]);
    const p = w.s.strengthOf(INQ);
    for (const axis of STRENGTH_AXES) {
      assert.equal(p[axis].state, "undetermined", `${name} ${axis}`);
      const m = p[axis].undetermined_at.find((x) => x.target_id === REF);
      assert.match(m.why, why, name);
      assert.equal(m.unknown, true);
      assert.match(p[axis].detail, new RegExp(`nothing here establishes what ${REF.replace(/[/]/g, "\\/")} rests on`), name);
      assert.doesNotMatch(p[axis].detail, /depth bound/, `${name}: not the depth bound`);
    }
  }
  /* An edition that publishes an axis as undetermined leaves it undetermined here. */
  const u = accepted({ capture: { state: "undetermined" }, connection: "B" });
  u.inquiry(INQ, [{ target: REF, edition: 2 }]);
  const up = u.s.strengthOf(INQ);
  assert.equal(up.capture.state, "undetermined");
  assert.match(up.capture.undetermined_at[0].why, /publishes capture as undetermined/);
  assert.equal(up.connection.grade, "B");
});

test("R33: an acceptance withdrawn since the leg was written changes nothing: the edition's grades stand", () => {
  const w = accepted();
  w.inquiry(INQ, [{ target: REF, edition: 2 }]);
  const before = w.s.strengthOf(INQ);
  w.acceptedFinding(REF, 2, { pair: PAIR, acceptance: null });
  const after = w.s.strengthOf(INQ);
  assert.deepEqual(after, before);
});

test("R33: through a sub-inquiry the accepted grade travels up, and nothing below the finding is walked; it is never a document for R1's ceiling", () => {
  const w = accepted();
  w.inquiry("INQ-2026-0002-a", [{ target: REF, edition: 2 }]);
  w.inquiry(INQ, [{ target: "INQ-2026-0002-a" }]);
  const p = w.s.strengthOf(INQ);
  assert.equal(p.connection.grade, "C");
  assert.equal(p.connection.weakest.inherited_from, "INQ-2026-0002-a");
  assert.equal(p.connection.weakest.through, REF);
  /* The capture registry is never asked about a ref. */
  const asked = [];
  const real = w.s.inquiry.earned;
  w.s.inquiry = { ...w.s.inquiry, earned: (subj, targets) => { asked.push(...targets); return real(subj, targets); } };
  w.inquiry("INQ-2026-0003-a", [{ target: REF, edition: 2 }, { target: "INFO-2026-0001-a", grade: "B", axis: "capture", source: "capture" }]);
  w.s.strengthOf("INQ-2026-0003-a");
  assert.ok(asked.includes("INFO-2026-0001-a"));
  assert.ok(!asked.includes(REF));
});

test("R33: a capture or testimony grade written on a leg to another group's finding has no referent and is named, not counted", () => {
  const w = accepted({ connection: "C" });
  w.inquiry(INQ, [{ target: REF, edition: 2, grade: "A", axis: "capture", source: "capture" }]);
  const p = w.s.strengthOf(INQ);
  const m = p.capture.not_load_bearing.find((x) => x.target_id === REF && x.via === "leg");
  assert.match(m.why, /another group's finding, not a document/);
  assert.equal(p.capture.state, "unrated");
});

test("R33, R6: inquiryStrength withholds another group's finding from a viewer accepted-work answers null for, and names it to one it answers", () => {
  const w = accepted(PAIR, { viewers: ["member:alice"] });
  w.member("alice");
  w.member("carol");
  w.bundle("INFO-2026-0001-a");
  w.inquiry(INQ, [{ target: REF, edition: 2 }, conn("INFO-2026-0001-a", "D")]);
  const alice = w.s.inquiryStrength({ id: INQ, viewer: "member:alice" });
  assert.equal(alice.ok, true);
  assert.equal(alice.out_of_view, undefined);
  assert.ok(JSON.stringify(alice).includes(REF));
  const carol = w.s.inquiryStrength({ id: INQ, viewer: "member:carol" });
  assert.equal(carol.out_of_view, true);
  assert.ok(!JSON.stringify(carol).includes(REF), "named nowhere, fields or prose");
  assert.ok(!JSON.stringify(carol).includes("other-group"));
  assert.equal(carol.connection.grade, alice.connection.grade, "the grade does not change with the reader");
  assert.equal(carol.capture.grade, "B");
});

test("R33: versionStrength counts a version's leg on an accepted finding at its published pair, the edition from the version leg", () => {
  const w = accepted();
  w.inquiry(INQ, [], "ENT-1");
  w.st.db.exec(`ALTER TABLE inquiry_basis_version_legs ADD COLUMN target_edition INTEGER`);
  w.version(INQ, "v1", "accepted", [{ target: REF, ground: "" }]);
  w.rows(`UPDATE inquiry_basis_version_legs SET target_edition=2 WHERE bundle_id=? AND name='v1'`, INQ);
  const r = w.s.versionStrength({ id: INQ, version: "v1", viewer: MACHINE });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.pair.capture.grade, "B");
  assert.equal(r.pair.connection.grade, "C");
  assert.match(r.ungraded.find((x) => x.ord === 0).why, /another group's finding and carries no grade of its own/);
  /* A version leg with no edition stored: undetermined, with why. */
  w.version(INQ, "v2", "accepted", [{ target: REF, ground: "" }]);
  const v2 = w.s.versionStrength({ id: INQ, version: "v2", viewer: MACHINE });
  assert.equal(v2.pair.connection.state, "undetermined");
  assert.match(v2.pair.connection.undetermined_at[0].why, /without saying which edition/);
});

test("R33: candidatePair reads a candidate leg's own target_edition", () => {
  const w = accepted();
  const c = w.s.candidatePair({ inquiry: INQ, legs: [{ target: REF, target_edition: 2 }] });
  assert.equal(c.error, null);
  assert.equal(c.pair.connection.grade, "C");
  assert.equal(c.pair.connection.weakest.via, "imported");
  const none = w.s.candidatePair({ inquiry: INQ, legs: [{ target: REF }] });
  assert.equal(none.pair.connection.state, "undetermined");
});

test("R33, R29: a leg on another group's finding never bears out an anonymous observation", () => {
  const w = accepted();
  w.observation("INFO-2026-0001-observation", "member-ann");
  w.inquiry(INQ, [{ target: "INFO-2026-0001-observation", grade: "D", axis: "testimony", source: "testimony" },
                  { target: REF, edition: 2 }]);
  const p = w.s.strengthOf(INQ, { levels: { "INFO-2026-0001-observation": "group" } });
  assert.equal(p.testimony.state, "unrated");
  assert.match(p.testimony.not_load_bearing[0].why, /credited anonymously/);
});
