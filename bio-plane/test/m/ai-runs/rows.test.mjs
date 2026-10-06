/* ai-runs R35, R39: the rows of the checks this module's acts mint, held in `run-rules`' table and read by key (its
   R11, R15); and no place in the module's outward text. The pure rules and their rows (R1–R8, R44, R45's figure) moved
   to `run-rules` with their tests (K617). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, OPEN, INQ, ORG, USAGE, PENDING_ROWS } from "./world.mjs";
import { AI_RUNS_CHECKS } from "../../../src/run-rules/index.mjs";

/** Every code this module's acts mint, with its catalogue number (R35, R40, R46, R47). */
export const MINTED = {
  AI_RUN_CAPABILITY_UNAVAILABLE: "C-33.29", AI_RUN_NO_CONTEXT: "C-33.30", AI_RUN_ALREADY_OPEN: "C-33.31",
  AI_RUN_RERUN_SELF: "C-33.45", AI_RUN_RERUN_UNKNOWN: "C-33.46", AI_RUN_RERUN_OTHER_CONTEXT: "C-33.47",
  AI_RUNS_NO_CONTEXT_TYPE: "C-36.1", AI_RUNS_UNKNOWN_CONTEXT_TYPE: "C-36.2", AI_RUNS_NO_CONTEXT_ID: "C-36.3",
  SURFACE_NO_RUN: "C-66.1", SURFACE_RUN_NOT_RUNNING: "C-66.2", SURFACE_NO_BOUND: "C-66.3", SURFACE_BOUND_REACHED: "C-66.4",
  AI_RUN_MODE_NOT_DEPLOYED: "C-109.1", AI_RUN_PLAN_REQUIRED: "C-109.2", AI_RUN_PLAN_UNEXPECTED: "C-109.3",
  AI_RUN_PLAN_NEEDS_PROJECT: "C-109.4", AI_RUN_PLAN_NEEDS_MEMBER: "C-109.5", AI_RUN_PLAN_NO_SEARCH: "C-109.6",
  AI_RUN_MODE_UNCHECKED: "C-109.7",
};

test("R35: each check this module's acts mint has its row in run-rules' table, read by key — its number, a translation and a where naming this module's site", () => {
  for (const [code, check] of Object.entries(MINTED)) {
    const row = AI_RUNS_CHECKS[code];
    assert.ok(row, `${code} has a row`);
    assert.equal(row.check, check, code);
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, code);
    assert.match(row.where, /^src\/ai-runs\/index\.mjs /, code);
  }
});

test("R39: no place is named in the module's outward text — its acts' rows, refusals, notes and answers (the use and ceiling texts of R48–R52 included)", async () => {
  const PLACE = /oakland|alameda|california|berkeley|san francisco|\bcounty of\b/i;
  const w = world();
  await w.group("ann"); w.bundle(INQ);
  const texts = Object.keys(MINTED).map((c) => AI_RUNS_CHECKS[c].translation);
  texts.push(JSON.stringify(await w.runs.open(OPEN({ run: "" }))), JSON.stringify(await w.runs.open(OPEN({ principalClaude: null }))),
             JSON.stringify(await w.runs.open(OPEN({ mode: "extract" }))), JSON.stringify(await w.runs.open(OPEN({ plan: "PLN-2026-0001" }))),
             JSON.stringify(await w.runs.open(OPEN())), JSON.stringify(await w.runs.open(OPEN())),
             JSON.stringify(await w.runs.listInContext({})), JSON.stringify(await w.runs.read({ run: "R1", viewer: "admin" })),
             JSON.stringify(w.runs.log({ run: "R1", viewer: "admin" })), JSON.stringify(w.surface("INQ-2026-0100", { run: "NONE" })),
             JSON.stringify(await w.runs.close({ run: "R1", bound: "completed", viewer: "admin", caller: ORG })));
  /* T33-50's texts: the account and ceiling refusals, the provider's limit, and the use reads */
  w.runs.aiCeilingSet({ member: "member:ann", calls: 1, by: "member:ann" });
  w.runs.countAskUsage({ member: "member:ann", mode: "ask", usage: USAGE() });
  texts.push(...Object.values(PENDING_ROWS).map((r) => r.translation),
             JSON.stringify(await w.runs.open(OPEN({ run: "R9" }))), JSON.stringify(await w.runs.open(OPEN({ run: "R9", principalClaude: "x" }))),
             JSON.stringify(w.runs.aiUseCheck({ member: "member:ann" })), JSON.stringify(w.runs.providerLimit("enforced_spend_limit_reached")),
             JSON.stringify(w.runs.aiCeilingSet({ member: "member:ann", calls: 0, by: "member:ann" })),
             JSON.stringify(w.runs.aiCeilingSet({ member: "member:ann", calls: 1, by: "member:bob" })),
             JSON.stringify(w.runs.aiUsageMine({ viewer: "member:ann" })), JSON.stringify(w.runs.aiUsage({ viewer: "admin" })));
  for (const t of texts) assert.equal(PLACE.test(String(t)), false, String(t).slice(0, 80));
});
