/* run-rules R9 (was ai-runs R44) and R14 (K660 (5)): the one deployment order, its gate's address, and the modes deployed
   now. */
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { DEPLOYMENT_SEQUENCE, GATE_ADDRESS, DEPLOYED_MODES, DEFAULT_MODE, AI_RUN_OPEN_CHECKS, AI_RUN_CHECKS,
         RUN_ENDINGS, deployable } from "../../../src/run-rules/index.mjs";

const ROOT = new URL("../../../../", import.meta.url);

test("R9: DEPLOYMENT_SEQUENCE is the one deployment order — its first member the first deployed mode, enforced_by C-109.1 (ai-runs R40's refusal, a row of this module's table), and GATE_ADDRESS naming agent-worker's gate", () => {
  assert.equal(DEPLOYMENT_SEQUENCE.order[0], "check");
  assert.equal(DEPLOYMENT_SEQUENCE.first_deployed_mode, DEPLOYMENT_SEQUENCE.order[0]);
  assert.equal(new Set(DEPLOYMENT_SEQUENCE.order).size, DEPLOYMENT_SEQUENCE.order.length, "each mode once");
  assert.deepEqual(DEPLOYMENT_SEQUENCE.enforced_by, ["C-109.1"]);
  assert.equal(AI_RUN_OPEN_CHECKS.AI_RUN_MODE_NOT_DEPLOYED.check, DEPLOYMENT_SEQUENCE.enforced_by[0]);
  assert.equal(AI_RUN_CHECKS.AI_RUN_MODE_NOT_DEPLOYED, AI_RUN_OPEN_CHECKS.AI_RUN_MODE_NOT_DEPLOYED);
  assert.equal(DEPLOYMENT_SEQUENCE.gate, GATE_ADDRESS);
  assert.equal(GATE_ADDRESS.file, "agent-worker/src/harness.mjs");
  assert.deepEqual([GATE_ADDRESS.modes_export, GATE_ADDRESS.table_export, GATE_ADDRESS.row, GATE_ADDRESS.first_step_export,
                    GATE_ADDRESS.decision_function], ["MODES", "CONTROL_FLOW", "gate-mode", "FIRST_STEP", "nextStep"]);
  assert.ok(existsSync(new URL(GATE_ADDRESS.file, ROOT)), "the address names a file that exists");
  assert.equal(DEPLOYMENT_SEQUENCE.enforced_by_row, 'agent-worker/src/harness.mjs:CONTROL_FLOW["gate-mode"]');
  assert.equal(DEPLOYMENT_SEQUENCE.verification_recorded, null);
  /* the mode a run naming none opens in is the first deployed; mode-not-deployed is the ending the gate closes on */
  assert.equal(DEFAULT_MODE, DEPLOYED_MODES[0]);
  assert.equal(DEFAULT_MODE, DEPLOYMENT_SEQUENCE.first_deployed_mode);
  assert.ok(Object.prototype.hasOwnProperty.call(RUN_ENDINGS, "mode-not-deployed"));
  /* control: with no verification recorded, the chain deploys its first member only */
  assert.deepEqual(DEPLOYED_MODES, ["check"]);
  assert.ok(Object.isFrozen(DEPLOYED_MODES));
});

test("R14: DEPLOYMENT_SEQUENCE.order is check, investigate, extract, plan; plan deploys apart from the chain, only by its own flag set by a reviewed act of its own, never as a side effect of model turns, and is not deployed today (control: check still deployed)", () => {
  assert.deepEqual(DEPLOYMENT_SEQUENCE.order, ["check", "investigate", "extract", "plan"]);
  assert.equal(DEPLOYMENT_SEQUENCE.order.at(-1), "plan");
  assert.deepEqual(Object.keys(DEPLOYMENT_SEQUENCE.deploys_apart), ["plan"]);
  assert.equal(DEPLOYMENT_SEQUENCE.deploys_apart.plan.deployed, false);
  assert.deepEqual(Object.keys(DEPLOYMENT_SEQUENCE.deploys_apart.plan), ["deployed", "when"]);
  assert.match(DEPLOYMENT_SEQUENCE.deploys_apart.plan.when, /^only by an explicit reviewed change of its own/);
  assert.match(DEPLOYMENT_SEQUENCE.deploys_apart.plan.when, /never as a side effect of model turns running/);
  assert.match(DEPLOYMENT_SEQUENCE.deploys_apart.plan.when, /whether or not investigate or extract is deployed/);
  /* investigate's and extract's state changes nothing for plan: the chain never decides it */
  assert.equal(deployable("plan", []), true);
  assert.equal(deployable("plan", [{ mode: "check", run: "R", verified_by: "member:ann", at: "t", evidence: "e" }]), true);
  assert.equal(DEPLOYED_MODES.includes("plan"), false, "an open in mode plan is refused by ai-runs R40 until then");
  for (const m of ["investigate", "extract"]) assert.equal(DEPLOYED_MODES.includes(m), false, m);
  /* control */
  assert.equal(DEPLOYED_MODES.includes("check"), true);
});
