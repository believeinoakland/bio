/* steps R7, R8: the duplicate search, the shared step, and the machine's refusal of a duplicate. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, ANN, BOB, DAN, AI, P1, Q, Q2, QP1, QH } from "./fixture.mjs";

test("R7: stepsLike answers the steps the viewer sees whose work matches, open and ended alike, with place, state and outcomes, at most 50", () => {
  const w = world();
  const open = w.step({ work: "Request the 2025 contract file from the clerk" });
  const ended = w.step({ work: "request the 2025 CONTRACT file, from the clerk!", place: { questions: [Q2] } });
  w.s.stepEnd({ step: ended, end: "ended", outcomes: { [Q2]: "dead_end" }, by: ANN });
  const unrelated = w.step({ work: "Photograph the posted agenda" });
  const unseen = w.step({ work: "Request the 2025 contract file from the clerk", place: { questions: [QP1] } });
  const r = w.s.stepsLike({ work: "Request the 2025 contract file from the clerk", viewer: DAN });
  const ids = r.steps.map((s) => s.step);
  assert.ok(ids.includes(open) && ids.includes(ended));
  assert.equal(ids.includes(unrelated), false, "the negative control: unrelated work does not match");
  assert.equal(ids.includes(unseen), false, "a step Dan may not see is not answered");
  const e = r.steps.find((s) => s.step === ended);
  assert.deepEqual([e.state, e.outcomes[0].outcome, e.place], ["ended", "dead_end", { questions: [Q2] }]);
  assert.deepEqual(w.s.stepsLike({ work: "Request the 2025 contract file from the clerk", questions: [Q2], viewer: DAN }).steps.map((s) => s.step), [ended]);
  for (let i = 0; i < 60; i++) w.step({ work: `Request the 2025 contract file from the clerk ${i}` });
  const many = w.s.stepsLike({ work: "Request the 2025 contract file from the clerk", viewer: ANN, limit: 500 });
  assert.equal(many.steps.length, 50);
  assert.equal(many.truncated, true);
});

test("R7: stepRefer adds a question's reference to a step on questions; a project's step is refused as narrower; unseen step or question as absent", () => {
  const w = world();
  const id = w.step();
  const r = w.s.stepRefer({ step: id, question: Q2, by: BOB });
  assert.equal(r.ok, true);
  assert.deepEqual(w.s.step({ step: id, viewer: ANN }).place, { questions: [Q, Q2] });
  assert.equal(w.s.stepRefer({ step: id, question: Q2, by: BOB }).already, true);
  assert.equal(w.s.stepRefer({ step: id, question: QH, by: ANN }).code, "NO_SUCH_BUNDLE");
  const sp = w.step({ place: { project: P1 } });
  assert.equal(w.s.stepRefer({ step: sp, question: Q, by: ANN }).code, "STEP_NARROWER_THAN_QUESTION");
  assert.equal(w.s.stepRefer({ step: sp, question: Q, by: DAN }).code, "NO_SUCH_STEP", "a step Dan may not see is absent to him");
  /* what a shared step produces serves every referring question */
  w.s.recordProduct({ step: id, record: Q, by: "class:daemon" });
  const of = w.s.stepsOf({ record: Q, viewer: ANN });
  assert.deepEqual(of.steps[0].questions, [Q, Q2]);
});

test("R8: a machine's stepCreate is refused STEP_ALIKE_EXISTS for an open step of the same work on its question its principal sees; a member never is", () => {
  const w = world();
  w.runs();
  const open = w.step({ work: "Fetch the posted agenda" });
  const before = w.snapshot();
  const r = w.s.stepCreate({ place: { questions: [Q] }, work: "fetch the POSTED agenda.", by: AI, run: "RUN-1" });
  assert.equal(r.code, "STEP_ALIKE_EXISTS");
  assert.equal(r.step, open);
  assert.equal(w.snapshot(), before);
  /* negative controls: ended steps, other questions, other work and steps the principal cannot see do not refuse */
  assert.equal(w.s.stepCreate({ place: { questions: [Q2] }, work: "Fetch the posted agenda", by: AI, run: "RUN-1" }).ok, true);
  w.s.stepEnd({ step: open, end: "ended", by: ANN });
  assert.equal(w.s.stepCreate({ place: { questions: [Q] }, work: "Fetch the posted agenda", by: AI, run: "RUN-1" }).ok, true);
  w.participant(P1, "ann", { owner: true });
  /* a member is answered the matches beside her new step and never refused */
  const m = w.s.stepCreate({ place: { questions: [Q] }, work: "Fetch the posted agenda", by: BOB });
  assert.equal(m.ok, true);
  assert.ok(m.alike.length >= 1);
  assert.equal(m.alike.some((s) => s.step === m.step), false);
});
