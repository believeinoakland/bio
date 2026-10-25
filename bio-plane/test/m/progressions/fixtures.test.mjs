/* The fixtures progressions publishes for its users (K4990, K4993, K5044): each is made by progressions' real code when it
   is called, and each test here calls it and checks the real answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { definitionRead, disposeProposalOk, disposeProposalRefusal } from "./fixtures.mjs";
import { seeded } from "./fixture.mjs";

test("R5 definitionRead: the real definition read; a key no definition holds is found:false, no key is refused NO_KEY", () => {
  const r = definitionRead({ progressionKey: "meeting", stages: ["notice", "minutes"] });
  assert.deepEqual([r.ok, r.progression_key, r.found, r.version], [true, "meeting", true, 1]);
  assert.deepEqual(r.stages.map((s) => [s.stage_key, s.stage_no]), [["notice", 1], ["minutes", 2]]);
  const none = definitionRead({ progressionKey: "meeting", defined: false });
  assert.deepEqual([none.ok, none.found, none.stages], [true, false, []]);
  const refused = definitionRead();
  assert.deepEqual([refused.ok, refused.reason, refused.code], [false, "NO_KEY", "NO_KEY"]);
  // the fixture is the module's own read: the same answer a world of the test's own gives
  const w = seeded();
  assert.deepEqual(w.p.readProgression({}), refused);
});

test("R20 R22 disposeProposalOk: the real success of disposeProposal for the stage asked about, at the definition version named", () => {
  const r = disposeProposalOk({ progressionKey: "flow", stageKey: "filed", to: "dismissed", reason: "not obtainable", decidedBy: "ruth", definitionVersion: 1 });
  assert.deepEqual([r.ok, r.key, r.progression_key, r.stage_key, r.to, r.definition_version], [true, "flow::filed", "flow", "filed", "dismissed", 1]);
  assert.deepEqual([r.reason, r.decided_by], ["not obtainable", "ruth"]);
  // a key in the 'progression::stage' form reaches the same answer
  const k = disposeProposalOk({ key: "flow::heard", to: "deferred", reason: "later", definitionVersion: 1, decidedBy: "ruth" });
  assert.deepEqual([k.ok, k.key, k.progression_key, k.stage_key], [true, "flow::heard", "flow", "heard"]);
  // control: a version the progression does not stand at is the module's own refusal, not a made-up success
  assert.equal(disposeProposalOk({ progressionKey: "flow", stageKey: "filed", definitionVersion: 2 }).reason, "DEFINITION_MOVED");
});

test("R21 disposeProposalRefusal: the real NO_KEY of disposeProposal({}), the progression unnamed", () => {
  const r = disposeProposalRefusal();
  assert.deepEqual([r.ok, r.reason, r.code], [false, "NO_KEY", "NO_KEY"]);
  assert.equal(typeof r.detail, "string");
});
