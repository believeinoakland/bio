/* A cutting leg is no part of the question's strength (R42; K4213; Case Making §3, invariant 7; inquiry J4, K4194 L9):
   a leg whose role is `cuts_against` is in neither the implicit part nor any ground, so `[supports A in g1, cuts_against C
   unlabelled]` reads A, never C; its own strength is kept beside the axis, and the version that counted it as published
   (`bio-grading/3`) still reads C. Driven over the live version path (R9's `graded` list too) and over `recomputePair`,
   at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";
import { recomputePair, GRADING_METHOD_VERSION } from "../../../src/strength/index.mjs";

const INQ = "INQ-2026-0001-a";
const SUBJECT = "ENT-1";
const SUPPORT = "INFO-2026-0001-a", CUT = "INFO-2026-0002-a";
const QUESTION = "INQ-2026-0003-a";
const V3 = "bio-grading/3";

/* The case file's facts for the two documents, as `recomputePair` reads them. */
const supporting = { target: SUPPORT, kind: "document", role: "supports", grade: "A", grade_axis: "connection",
                     grade_source: "resolution", ground: "g1" };
const cutting = { target: CUT, kind: "document", role: "cuts_against", grade: "C", grade_axis: "connection",
                  grade_source: "resolution", ground: null };

test("R42: a cutting leg is in no part, so `supports A in g1` beside `cuts_against C unlabelled` reads A, and the cutting leg keeps its own C beside it", () => {
  const w = world();
  w.bundle(SUPPORT); w.bundle(CUT);
  w.inquiry(INQ, [], SUBJECT);
  w.connection.set(`${SUBJECT}|${SUPPORT}`, "A");
  w.connection.set(`${SUBJECT}|${CUT}`, "C");
  w.version(INQ, "v", "accepted", [
    { target: SUPPORT, role: "supports", axis: "connection", source: "resolution", ground: "g1" },
    { target: CUT, role: "cuts_against", axis: "connection", source: "resolution", ground: "" },
  ]);
  const r = w.s.versionStrength({ id: INQ, version: "v", viewer: MACHINE });
  assert.equal(r.ok, true);
  const c = r.pair.connection;
  assert.deepEqual([c.state, c.grade, c.weakest.target_id], ["graded", "A", SUPPORT]);
  assert.equal(c.population, 1, "the cutting leg is in no population");
  assert.deepEqual(c.cutting.map((m) => [m.target_id, m.grade, m.role]), [[CUT, "C", "cuts_against"]]);
  /* R9 (K4213): the cutting leg is listed with its own grade and its role, and is not among the counted ones. */
  const listed = r.graded.find((g) => g.target_id === CUT);
  assert.deepEqual([listed.grade, listed.role], ["C", "cuts_against"]);
  assert.equal(r.graded.find((g) => g.target_id === SUPPORT).role, undefined, "a supporting leg states no role");
});

test("R42: the same facts recomputed at bio-grading/4 read A, the live answer; at bio-grading/3, the version that counted the cutting leg, they read C (negative control)", () => {
  const facts = [supporting, cutting];
  const now = recomputePair({ legs: facts, version: GRADING_METHOD_VERSION });
  assert.equal(now.ok, true);
  assert.deepEqual([now.connection.state, now.connection.grade], ["graded", "A"]);
  assert.deepEqual(now.connection.cutting.map((m) => [m.target_id, m.grade]), [[CUT, "C"]]);
  const before = recomputePair({ legs: facts, version: V3 });
  assert.deepEqual([before.connection.state, before.connection.grade], ["graded", "C"],
    "negative control: bio-grading/3 folds the cutting leg in, as it was published");
  assert.equal(before.connection.cutting, undefined, "and reports no cutting list");
});

test("R42: a cutting leg that is undetermined is kept beside the axis with its reason, and does not make the supported answer undetermined", () => {
  const unknown = { target: QUESTION, kind: "inquiry", role: "cuts_against", grade: null, grade_axis: null,
                    grade_source: null, ground: null };
  const now = recomputePair({ legs: [supporting, unknown], version: GRADING_METHOD_VERSION });
  assert.deepEqual([now.connection.state, now.connection.grade], ["graded", "A"]);
  const kept = now.connection.cutting.find((m) => m.target_id === QUESTION);
  assert.ok(kept, "the cutting leg is named");
  assert.equal(kept.grade, null);
  assert.ok(kept.why, "with why");
  /* Control: the same pair at bio-grading/3 has the unknown leg in the necessary part, so the axis is undetermined. */
  const before = recomputePair({ legs: [supporting, unknown], version: V3 });
  assert.equal(before.connection.state, "undetermined");
});

test("R42: with no leg cutting against the finding, the answer carries no cutting list and reads as before", () => {
  /* A second supporting leg in its own set of reasons: the strongest set counts, so the answer is A as before. */
  const plain = { ...cutting, role: "supports", ground: "g2" };
  const r = recomputePair({ legs: [supporting, plain], version: GRADING_METHOD_VERSION });
  assert.equal(r.connection.cutting, undefined);
  assert.deepEqual([r.connection.state, r.connection.grade], ["graded", "A"]);
});
