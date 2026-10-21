/* Strength and the partition are computed over a question's live legs only (R43; T51 C38; R1, R6, R11, R12): a leg whose
   citation the question has withdrawn (its reference entry marked `severed` in the question's own document) is no member
   of any axis, is named nowhere in the answer, and is no reason to place in a proposed grouping; the same leg live
   counts. Driven through `inquiryStrength` and `partitionIndependence`, at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";

const INQ = "INQ-2026-0001-a";
const SUBJECT = "ENT-1";
const KEPT = "INFO-2026-0001-a", WITHDRAWN = "INFO-2026-0002-a";

/* The question's document as the record holds it: one reference entry for each cited document, with its status. */
const document = (entries) => "---\nreferences:\n" + entries.map(([target, status]) =>
  `  - target: "${target}"\n    rel: cites\n    status: ${status}\n`).join("") + "---\n";

/* A question with two connection legs, KEPT graded A and WITHDRAWN graded C, whose second citation has the given status. */
function question(secondStatus) {
  const w = world();
  w.bundle(KEPT); w.bundle(WITHDRAWN);
  w.inquiry(INQ, [
    { target: KEPT, axis: "connection", grade: "A", source: "resolution" },
    { target: WITHDRAWN, axis: "connection", grade: "C", source: "resolution" },
  ], SUBJECT);
  w.file(INQ, "bundle.md", document([[KEPT, "confirmed"], [WITHDRAWN, secondStatus]]));
  w.connection.set(`${SUBJECT}|${KEPT}`, "A");
  w.connection.set(`${SUBJECT}|${WITHDRAWN}`, "C");
  return w;
}

test("R43, R6: a withdrawn citation is in no axis's population and is named nowhere in the question's strength (control: the same leg live counts)", () => {
  const gone = question("severed").s.inquiryStrength({ id: INQ, viewer: MACHINE });
  assert.equal(gone.ok, true);
  const c = gone.connection;
  assert.deepEqual([c.state, c.grade, c.weakest.target_id, c.population], ["graded", "A", KEPT, 1]);
  assert.equal(JSON.stringify(gone).includes(WITHDRAWN), false, "the withdrawn citation is named in no sentence and no list");

  const live = question("confirmed").s.inquiryStrength({ id: INQ, viewer: MACHINE });
  const l = live.connection;
  assert.deepEqual([l.state, l.grade, l.weakest.target_id, l.population], ["graded", "C", WITHDRAWN, 2],
    "control: the same leg, live, is the weakest member and counts");
});

test("R43, R1: a question resting only on a withdrawn citation rests on nothing, and does not name it (control: live, it is graded)", () => {
  const only = (status) => {
    const w = world();
    w.bundle(WITHDRAWN);
    w.inquiry(INQ, [{ target: WITHDRAWN, axis: "connection", grade: "C", source: "resolution" }], SUBJECT);
    w.file(INQ, "bundle.md", document([[WITHDRAWN, status]]));
    w.connection.set(`${SUBJECT}|${WITHDRAWN}`, "C");
    return w;
  };
  const w = only("severed");
  const r = w.s.inquiryStrength({ id: INQ, viewer: MACHINE });
  assert.equal(r.connection.state, "unrated");
  assert.equal(r.connection.population, 0);
  assert.equal(JSON.stringify(r).includes(WITHDRAWN), false);
  assert.equal(w.s.strengthOf(INQ).connection.state, "unrated", "strengthOf, the one derivation, agrees");
  assert.equal(only("confirmed").s.strengthOf(INQ).connection.state, "graded", "control: the same leg live is graded");
});

test("R43, R11: a proposed partition places the live legs only: the withdrawn one needs no group and may not be named (control: live, it is unplaced)", () => {
  const w = question("severed");
  const ok = w.s.partitionIndependence({ id: INQ, partition: [[0]], viewer: MACHINE });
  assert.equal(ok.ok, true, "the live leg alone is a total grouping");
  assert.deepEqual(ok.partition.map((p) => p.targets), [[KEPT]]);
  assert.equal(ok.legs_read, 1);

  const named = w.s.partitionIndependence({ id: INQ, partition: [[0], [1]], viewer: MACHINE });
  assert.equal(named.reason, "PARTITION_INDEPENDENCE_UNKNOWN_LEG");
  assert.equal(named.ord, 1);

  const live = question("confirmed");
  const partial = live.s.partitionIndependence({ id: INQ, partition: [[0]], viewer: MACHINE });
  assert.equal(partial.reason, "PARTITION_INDEPENDENCE_NOT_TOTAL", "control: live, the same leg must be placed");
  assert.deepEqual(partial.unplaced, [1]);
});

test("R43, R12: the legs of a question the grading facts and the corroboration read are its live ones", () => {
  const w = question("severed");
  const facts = w.s.gradingFacts({ inquiry: INQ, viewer: MACHINE });
  assert.deepEqual(facts.legs.map((l) => l.target), [KEPT]);
  assert.deepEqual(question("confirmed").s.gradingFacts({ inquiry: INQ, viewer: MACHINE }).legs.map((l) => l.target),
    [KEPT, WITHDRAWN], "control: live, both");
});
