/* steps' published fixtures (./fixtures.mjs), each called here and checked against the real answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { stepRead, stepsWorld } from "./fixtures.mjs";

test("R4 R23: the stepRead fixture reads a visible step, answers an unknown and an unseen step alike (NO_SUCH_STEP), and carries looked_at on a later_found entry", () => {
  const f = stepRead();
  assert.deepEqual([f.read.ok, f.read.step, f.read.state, f.read.later_found], [true, f.step, "planned", []]);
  for (const [r, id] of [[f.unknownAnswer, f.unknown], [f.unseenAnswer, f.hiddenStep]]) {
    assert.deepEqual([r.ok, r.code, r.step], [false, "NO_SUCH_STEP", id]);
  }
  assert.deepEqual(f.unknownAnswer.reason, f.unseenAnswer.reason, "the two refusals differ only in the id they name");
  const lf = f.lookedRead.later_found;
  assert.equal(lf.length, 1);
  assert.equal(lf[0].looked_at, f.world.rows(`SELECT at FROM observation_log WHERE seq = ?`, lf[0].look)[0].at, "the look's own instant");
  assert.equal(f.steps.laterFound({ viewer: f.viewer }).found[0].looked_at, lf[0].looked_at);
});

test("R1 R2 R4 R5 R9: the stepsWorld fixture drives the real steps for a run it holds, refuses the rest by their codes, and records every act", () => {
  const f = stepsWorld();
  assert.equal(f.made.ok, true);
  assert.equal(f.ended.ok, true, JSON.stringify(f.ended));
  assert.equal(f.product.ok, true, JSON.stringify(f.product));
  assert.deepEqual([f.notYourRun.ok, f.notYourRun.code], [false, "STEP_NOT_YOUR_RUN"]);
  assert.deepEqual([f.noWork.ok, f.noWork.code], [false, "STEP_NO_WORK"]);
  assert.deepEqual([f.seen.ok, f.seen.step, f.seen.state], [true, f.made.step, "ended"]);
  assert.deepEqual([f.unseen.ok, f.unseen.code, f.unseen.step], [false, "NO_SUCH_STEP", f.hiddenStep]);
  assert.deepEqual([f.unknownStep.ok, f.unknownStep.code], [false, "NO_SUCH_STEP"]);
  assert.deepEqual(f.acts, [], "the sample acts are not the user's");
  assert.equal(f.steps.stepCreate({ by: f.machine, run: f.run, place: f.place, work: f.work }).code, "STEP_NOT_YOUR_RUN", "no holder is registered on the user's steps");
  assert.deepEqual([f.steps.registerRunHolder("ai-runs", (by, run) => (by === f.machine && run === f.run ? { enabled_by: "x", principal: f.principal } : null)).ok,
                    f.steps.registerRunHolder("ai-runs", () => null).ok], [true, false], "one holder, once");
  const m = f.steps.stepCreate({ by: f.machine, run: f.run, place: f.place, work: f.work });
  assert.equal(m.ok, true);
  assert.equal(f.steps.stepEnd({ step: m.step, end: "ended", by: f.machine }).ok, true);
  assert.deepEqual(f.acts.map(([n]) => n), ["stepCreate", "stepCreate", "stepEnd"], "every act is recorded with its arguments");
  assert.equal(f.acts[1][1].work, f.work);
});
