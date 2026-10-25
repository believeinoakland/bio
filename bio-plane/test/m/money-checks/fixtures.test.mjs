/* The fixtures money-checks publishes for its users (K4990, K4993, K5044): each test calls the fixture and checks the real answer. */
import test from "node:test";
import assert from "node:assert/strict";
import { runDetectorsAnswers, noticed } from "./fixtures.mjs";
import { HINT_MARK, NOTICED } from "../../../src/money-checks/index.mjs";

test("R6 runDetectorsAnswers: the real run over an empty world writes nothing, runs no detector and leaves no cursor", () => {
  const r = runDetectorsAnswers();
  assert.deepEqual([r.ok, r.written, r.raised, r.detectors, r.remaining, r.cursor], [true, 0, 0, 0, false, null]);
  assert.equal(r.budget_ms, 1000);
});

test("R6 runDetectorsAnswers: a budget the caller gives is the budget the run reports", () => {
  assert.equal(runDetectorsAnswers({ budgetMs: 250 }).budget_ms, 250);
});

test("R9, R17 noticed: the real answer for a project the viewer takes part in, over an empty record: no item, not truncated, labelled and marked", () => {
  const r = noticed();
  assert.deepEqual([r.ok, r.project, r.items, r.truncated], [true, "PROJ-2026-0001-alpha", [], false]);
  assert.deepEqual([r.label, r.mark], [NOTICED, HINT_MARK]);
});
