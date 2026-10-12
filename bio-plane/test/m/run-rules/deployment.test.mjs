/* run-rules R9 (was ai-runs R44) and R14 (K660 (5)): the one deployment order, its gate's address, and the modes deployed
   now. */
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { DEPLOYMENT_SEQUENCE, GATE_ADDRESS, DEPLOYED_MODES, DEFAULT_MODE, AI_RUN_OPEN_CHECKS, AI_RUN_CHECKS,
         RUN_ENDINGS, deployable, deployedModesFor, partAdmitted, untestedLabel } from "../../../src/run-rules/index.mjs";

const ROOT = new URL("../../../../", import.meta.url);

test("R9: DEPLOYMENT_SEQUENCE is the one deployment order — its first member the first deployed mode, enforced_by C-109.1 (ai-runs R40's refusal, a row of this module's table), and GATE_ADDRESS naming the gate agent-worker runs, in the file that holds it, agent-harness' harness.mjs (T34-32, N586)", () => {
  assert.equal(DEPLOYMENT_SEQUENCE.order[0], "check");
  assert.equal(DEPLOYMENT_SEQUENCE.first_deployed_mode, DEPLOYMENT_SEQUENCE.order[0]);
  assert.equal(new Set(DEPLOYMENT_SEQUENCE.order).size, DEPLOYMENT_SEQUENCE.order.length, "each mode once");
  assert.deepEqual(DEPLOYMENT_SEQUENCE.enforced_by, ["C-109.1"]);
  assert.equal(AI_RUN_OPEN_CHECKS.AI_RUN_MODE_NOT_DEPLOYED.check, DEPLOYMENT_SEQUENCE.enforced_by[0]);
  assert.equal(AI_RUN_CHECKS.AI_RUN_MODE_NOT_DEPLOYED, AI_RUN_OPEN_CHECKS.AI_RUN_MODE_NOT_DEPLOYED);
  assert.equal(DEPLOYMENT_SEQUENCE.gate, GATE_ADDRESS);
  assert.equal(GATE_ADDRESS.file, "agent-harness/src/harness.mjs");
  assert.notEqual(GATE_ADDRESS.file, "agent-worker/src/harness.mjs", "not agent-worker's re-export, which goes once no importer names it");
  assert.deepEqual([GATE_ADDRESS.modes_export, GATE_ADDRESS.table_export, GATE_ADDRESS.row, GATE_ADDRESS.first_step_export,
                    GATE_ADDRESS.decision_function], ["MODES", "CONTROL_FLOW", "gate-mode", "FIRST_STEP", "nextStep"]);
  assert.ok(existsSync(new URL(GATE_ADDRESS.file, ROOT)), "the address names a file that exists");
  assert.equal(DEPLOYMENT_SEQUENCE.enforced_by_row, 'agent-harness/src/harness.mjs:CONTROL_FLOW["gate-mode"]');
  assert.equal(DEPLOYMENT_SEQUENCE.verification_recorded, null);
  /* the mode a run naming none opens in is the first deployed; mode-not-deployed is the ending the gate closes on */
  assert.equal(DEFAULT_MODE, DEPLOYED_MODES[0]);
  assert.equal(DEFAULT_MODE, DEPLOYMENT_SEQUENCE.first_deployed_mode);
  assert.ok(Object.prototype.hasOwnProperty.call(RUN_ENDINGS, "mode-not-deployed"));
  /* control: with no verification recorded, the chain deploys its first member only (T46: plan, ask and draft follow,
     each by its own flag, R14, R16, R21) */
  assert.deepEqual(DEPLOYED_MODES.filter((m) => ["check", "investigate", "extract"].includes(m)), ["check"]);
  assert.deepEqual([...DEPLOYED_MODES], ["check", "plan", "ask", "draft"]);
  assert.ok(Object.isFrozen(DEPLOYED_MODES));
});

test("R14: DEPLOYMENT_SEQUENCE.order is check, investigate, extract, plan; plan deploys apart from the chain, only by its own flag set by a reviewed act of its own, never as a side effect of model turns — the act made in T46 (K2892), plan deployed, D14's bar still gating it through R29 on every instance but a test instance (control: check still deployed, investigate and extract not)", () => {
  assert.deepEqual(DEPLOYMENT_SEQUENCE.order, ["check", "investigate", "extract", "plan"]);
  assert.equal(DEPLOYMENT_SEQUENCE.order.at(-1), "plan");
  assert.deepEqual(Object.keys(DEPLOYMENT_SEQUENCE.deploys_apart), ["plan"]);
  assert.equal(DEPLOYMENT_SEQUENCE.deploys_apart.plan.deployed, true, "T46: R14's reviewed act is made");
  assert.deepEqual(Object.keys(DEPLOYMENT_SEQUENCE.deploys_apart.plan), ["deployed", "when", "made"]);
  assert.match(DEPLOYMENT_SEQUENCE.deploys_apart.plan.made, /^T46 \(K2892\): set by its own reviewed change with agent-worker's MODES\.plan/);
  assert.match(DEPLOYMENT_SEQUENCE.deploys_apart.plan.made, /lifts no bar, so a run in mode plan is admitted only through partAdmittedOn \(R29\)/);
  assert.match(DEPLOYMENT_SEQUENCE.deploys_apart.plan.when, /^only by an explicit reviewed change of its own/);
  assert.match(DEPLOYMENT_SEQUENCE.deploys_apart.plan.when, /never as a side effect of model turns running/);
  assert.match(DEPLOYMENT_SEQUENCE.deploys_apart.plan.when, /whether or not investigate or extract is deployed/);
  /* investigate's and extract's state changes nothing for plan: the chain never decides it */
  assert.equal(deployable("plan", []), true);
  assert.equal(deployable("plan", [{ mode: "check", run: "R", verified_by: "member:ann", at: "t", evidence: "e" }]), true);
  assert.equal(DEPLOYED_MODES.includes("plan"), true, "plan is deployed by its own flag");
  /* its own flag alone: false leaves it out, whatever the chain's verification */
  for (const verification_recorded of [null, { at: "t" }])
    assert.equal(deployedModesFor({ plan: false, verification_recorded }).includes("plan"), false);
  for (const m of ["investigate", "extract"]) assert.equal(DEPLOYED_MODES.includes(m), false, m);
  /* the flag lifts no bar: on Civicsmith's set, which holds no passed record, plan is admitted only on a test instance,
     and labelled there */
  assert.deepEqual(partAdmitted("plan", {}), { admitted: false, untested: null });
  assert.deepEqual(partAdmitted("plan", {}, { testInstance: true }), { admitted: true, untested: untestedLabel("plan") });
  /* control */
  assert.equal(DEPLOYED_MODES.includes("check"), true);
});
