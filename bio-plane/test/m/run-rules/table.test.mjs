/* run-rules R11 (was ai-runs R35's share), R12 (as ai-runs R39) and R15 (K660): the table of every run refusal's row,
   the one map `AI_RUN_CHECKS` and `translationOf`, and no place named in the module's outward text. */
import test from "node:test";
import assert from "node:assert/strict";
import * as RR from "../../../src/run-rules/index.mjs";
import { AI_RUN_CHECKS as OBSERVATION_LOG_ROWS } from "../../../src/observation-log/index.mjs";

const { AI_RUNS_CHECKS, AI_RUN_OWN_CHECKS, AI_RUN_ACT_SHAPE_CHECKS, AI_RUNS_CONTEXT_CHECKS, SURFACE_RUN_CHECKS,
        AI_RUN_OPEN_CHECKS, AI_RUN_PLAN_CHECKS, AI_RUN_CHECKS, translationOf } = RR;

/** R11's rows minted here, by code, with the site that mints each. */
const MINTED_HERE = {
  AI_RUN_BOUND_UNNAMED: ["C-22.5", "src/run-rules/rules.mjs checkBound"],
  AI_RUN_SKILL_VERSION_UNNAMED: ["C-22.7", "src/run-rules/skill-version.mjs checkSkillVersion"],
  AI_RUN_NOT_PROJECT_MEMBER: ["C-22.8", "src/run-rules/rules.mjs projectGate"],
  AI_RUN_NO_SUCH_CONTEXT: ["C-22.11", "src/run-rules/rules.mjs checkRunContextKind"],
  AI_RUN_NOT_PRINCIPAL: ["C-22.12", "src/run-rules/rules.mjs runPrincipalGate"],
  AI_RUN_CONSUME_INVALID: ["C-22.13", "src/run-rules/rules.mjs checkConsume"],
  AI_RUN_BOUND_PLANE_COUNTED: ["C-22.14", "src/run-rules/rules.mjs checkConsume"],
  AI_RUN_BOUND_UNKNOWN: ["C-22.15", "src/run-rules/rules.mjs checkConsume"],
  AI_RUN_BOUND_NO_ALLOWANCE: ["C-22.16", "src/run-rules/rules.mjs checkConsume"],
  AI_RUN_STATE_TOO_LARGE: ["C-22.18", "src/run-rules/rules.mjs checkRunState"],
};
/** R11's rows minted by ai-runs and read here by key. */
const AI_RUNS_ACTS = {
  AI_RUN_CAPABILITY_UNAVAILABLE: "C-33.29", AI_RUN_NO_CONTEXT: "C-33.30", AI_RUN_ALREADY_OPEN: "C-33.31",
  AI_RUN_RERUN_SELF: "C-33.45", AI_RUN_RERUN_UNKNOWN: "C-33.46", AI_RUN_RERUN_OTHER_CONTEXT: "C-33.47",
  AI_RUNS_NO_CONTEXT_TYPE: "C-36.1", AI_RUNS_UNKNOWN_CONTEXT_TYPE: "C-36.2", AI_RUNS_NO_CONTEXT_ID: "C-36.3",
  SURFACE_NO_RUN: "C-66.1", SURFACE_RUN_NOT_RUNNING: "C-66.2", SURFACE_NO_BOUND: "C-66.3", SURFACE_BOUND_REACHED: "C-66.4",
  AI_RUN_MODE_NOT_DEPLOYED: "C-109.1",
};
/** R15's rows, minted by ai-runs (its R46, R47). */
const PLANNING = {
  AI_RUN_PLAN_REQUIRED: "C-109.2", AI_RUN_PLAN_UNEXPECTED: "C-109.3", AI_RUN_PLAN_NEEDS_PROJECT: "C-109.4",
  AI_RUN_PLAN_NEEDS_MEMBER: "C-109.5", AI_RUN_PLAN_NO_SEARCH: "C-109.6", AI_RUN_MODE_UNCHECKED: "C-109.7",
};
const OBSERVATION_LOG_C22 = ["C-22.1", "C-22.2", "C-22.3", "C-22.4", "C-22.6", "C-22.9", "C-22.10", "C-22.17"];

function wellFormed(code, row) {
  assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"], code);
  assert.match(row.check, /^C-\d+\.\d+$/, code);
  assert.equal(typeof row.translation, "string", code);
  assert.ok(row.translation.length >= 40, `${code}'s translation is a sentence a member reads`);
  assert.equal(typeof row.where, "string", code);
}

test("R11: the table holds exactly the rows the pure rules mint (each where naming this module's site, C-22.7's skill-version.mjs checkSkillVersion) and the rows of ai-runs' acts, each code once with its number; every refusal carries its row", () => {
  const want = { ...Object.fromEntries(Object.entries(MINTED_HERE).map(([c, [n]]) => [c, n])), ...AI_RUNS_ACTS, ...PLANNING };
  assert.deepEqual(Object.fromEntries(Object.entries(AI_RUNS_CHECKS).map(([c, r]) => [c, r.check])), want);
  const numbers = Object.values(AI_RUNS_CHECKS).map((r) => r.check);
  assert.equal(new Set(numbers).size, numbers.length, "one condition per C-number");
  for (const [code, row] of Object.entries(AI_RUNS_CHECKS)) wellFormed(code, row);
  for (const [code, [, site]] of Object.entries(MINTED_HERE)) assert.ok(AI_RUNS_CHECKS[code].where.startsWith(site), code);
  for (const code of [...Object.keys(AI_RUNS_ACTS), ...Object.keys(PLANNING)])
    assert.match(AI_RUNS_CHECKS[code].where, /^src\/ai-runs\/index\.mjs /, `${code} is minted by ai-runs`);
  /* the families as published, one object across them */
  assert.deepEqual(Object.keys(AI_RUN_OWN_CHECKS), Object.keys(MINTED_HERE));
  assert.equal(Object.keys(AI_RUN_ACT_SHAPE_CHECKS).length, 6);
  assert.deepEqual(Object.keys(AI_RUNS_CONTEXT_CHECKS), ["AI_RUNS_NO_CONTEXT_TYPE", "AI_RUNS_UNKNOWN_CONTEXT_TYPE", "AI_RUNS_NO_CONTEXT_ID"]);
  assert.deepEqual(Object.keys(SURFACE_RUN_CHECKS), ["SURFACE_NO_RUN", "SURFACE_RUN_NOT_RUNNING", "SURFACE_NO_BOUND", "SURFACE_BOUND_REACHED"]);
  assert.deepEqual(Object.keys(AI_RUN_OPEN_CHECKS), ["AI_RUN_MODE_NOT_DEPLOYED"]);
  for (const fam of [AI_RUN_OWN_CHECKS, AI_RUN_ACT_SHAPE_CHECKS, AI_RUNS_CONTEXT_CHECKS, SURFACE_RUN_CHECKS, AI_RUN_OPEN_CHECKS, AI_RUN_PLAN_CHECKS])
    for (const [code, row] of Object.entries(fam)) assert.equal(AI_RUNS_CHECKS[code], row, code);
  /* each refusal R2–R8 and R10 mint is built from its row here */
  const minted = [RR.checkBound("x"), RR.checkSkillVersion(""), RR.projectGate({ actor: "a", contextType: "project" }),
    RR.checkRunContextKind({ contextType: "x" }), RR.runPrincipalGate({}), RR.checkConsume({ fetches: -1 }, { map: true }),
    RR.checkConsume({ lease: 0 }, { map: true }), RR.checkConsume({ x: 1 }, { map: true }),
    RR.checkConsume([{ bound: "fetches" }], { list: true }), RR.checkRunState("x".repeat(262144))];
  assert.deepEqual(minted.map((r) => r.code), Object.keys(MINTED_HERE));
  for (const r of minted) assert.deepEqual([r.ok, r.check, r.translation], [false, AI_RUNS_CHECKS[r.code].check, AI_RUNS_CHECKS[r.code].translation]);
});

test("R11: AI_RUN_CHECKS answers observation-log's C-22 rows and this table's as one map, and translationOf(code) a received code's translation from it, or null", () => {
  assert.deepEqual(Object.values(OBSERVATION_LOG_ROWS).map((r) => r.check).sort(), [...OBSERVATION_LOG_C22].sort());
  assert.deepEqual(Object.keys(AI_RUN_CHECKS).sort(), [...Object.keys(OBSERVATION_LOG_ROWS), ...Object.keys(AI_RUNS_CHECKS)].sort());
  for (const [code, row] of Object.entries(OBSERVATION_LOG_ROWS)) assert.equal(AI_RUN_CHECKS[code], row, `${code} is observation-log's own row`);
  for (const [code, row] of Object.entries(AI_RUNS_CHECKS)) assert.equal(AI_RUN_CHECKS[code], row, code);
  assert.ok(Object.isFrozen(AI_RUN_CHECKS));
  /* converted from airun's R35/R26 arm: every code's translation is a sentence, and translationOf answers each */
  for (const [code, row] of Object.entries(AI_RUN_CHECKS)) {
    assert.ok(row.translation.length >= 40, code);
    assert.equal(translationOf(code), row.translation, code);
  }
  for (const c of ["NOT_A_CODE", "", null, undefined, "__proto__", "toString", "constructor"]) assert.equal(translationOf(c), null, String(c));
});

test("R15: the rows of ai-runs R46–R47's codes join the table, each with its number and translation, minted by ai-runs; no later module's row is held here", () => {
  assert.deepEqual(Object.fromEntries(Object.entries(AI_RUN_PLAN_CHECKS).map(([c, r]) => [c, r.check])), PLANNING);
  for (const [code, row] of Object.entries(AI_RUN_PLAN_CHECKS)) {
    wellFormed(code, row);
    assert.equal(AI_RUN_CHECKS[code], row);
    assert.equal(translationOf(code), row.translation);
    assert.equal(row.where, `src/ai-runs/index.mjs open > is-airun-open-${code === "AI_RUN_MODE_UNCHECKED" ? "check" : "plan"}, reached from op=airunopen`);
    assert.match(row.translation, /^Nothing was run, because /, `${code}: says nothing ran`);
  }
  /* no two planning codes share a sentence: each names its own condition */
  const texts = Object.values(AI_RUN_PLAN_CHECKS).map((r) => r.translation);
  assert.equal(new Set(texts).size, texts.length);
  /* control: action-plans' planning codes are that module's rows, not this table's */
  for (const code of Object.keys(AI_RUN_CHECKS)) assert.doesNotMatch(code, /^ACTION_PLAN|^PLAN_/, code);
});

test("R12: no place is named in the module's behaviour or outward text — its rows' translations, its vocabularies' sentences, its refusals' details, the deployment order", () => {
  const PLACE = /oakland|alameda|california|berkeley|san francisco|sacramento|\bcounty of\b|\bcity of\b/i;
  const texts = [
    ...Object.values(AI_RUNS_CHECKS).map((r) => r.translation),
    ...Object.values(RR.RUN_BOUNDS), ...Object.values(RR.RUN_ENDINGS), ...Object.values(RR.STANDARD_BASIS),
    ...Object.values(RR.RUN_CONTEXTS), ...Object.values(RR.PROJECT_GATE_GROUNDS),
    RR.checkBound("x").detail, RR.checkConsume({ x: 1 }, { map: true }).detail, RR.checkConsume("x", { map: true }).detail,
    RR.checkConsume({ lease: 1 }, { map: true }).detail, RR.checkConsume({ mints: 1 }, { map: true }).detail,
    RR.checkConsume({ fetches: -1 }, { map: true }).detail, RR.checkConsume([{ bound: "fetches" }], { list: true }).detail,
    RR.checkConsume({ a: 1 }, { list: true }).detail, RR.checkConsume([3], { list: true }).detail,
    RR.checkSkillVersion("3").detail, RR.checkSkillVersion("").detail,
    RR.projectGate({ actor: "a", contextType: "project", contextId: "P" }).detail,
    RR.checkRunContextKind({ contextType: "x" }).detail, RR.checkRunContextKind({ contextType: "project" }).detail,
    RR.runPrincipalGate({}).detail, RR.runPrincipalGate({ act: "x" }).detail,
    RR.checkRunState({ notes: "x".repeat(262144) }).detail,
    JSON.stringify(RR.DEPLOYMENT_SEQUENCE),
  ];
  for (const t of texts) assert.equal(PLACE.test(String(t)), false, String(t).slice(0, 80));
  /* control: the pattern does catch a place */
  assert.equal(PLACE.test("the City of Anywhere"), true);
});
