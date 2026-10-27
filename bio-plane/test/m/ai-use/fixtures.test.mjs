/* ai-use's published fixtures (fixtures.mjs), each called and compared with the real answer it stands for, and the contract
 * `use-check` (K4990): the literal reading-pipeline and extraction state as a refused use, checked against this module's real
 * `useCheck` at the moment a limit is spent. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ceilingRefusal } from "./fixtures.mjs";
import { standard } from "./fixture.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const AT = "2026-10-09T12:00:00Z";

test("fixtures ceilingRefusal R3 R13: the real useCheck over a spent daily ceiling is AI_LIMIT_REACHED (check C-143.1) with the use's sentence filled, naming the project and no cost; the next local day it is null", async () => {
  const r = await ceilingRefusal();
  assert.deepEqual([r.ok, r.code, r.check, r.whose, r.scope, r.unit, r.period], [false, "AI_LIMIT_REACHED", "C-143.1", "project", "ask", "calls", "day"]);
  assert.equal(r.translation, word("ai.refused.limit", { whose: word("ai.whose.project"), period: word("ai.period.day"),
    use: word("ai.use.ask.inline"), when: word("ai.when.day") }));
  assert.equal(r.detail, "project:P's day limit (ask, in calls) is reached for the period from 2026-10-09. Nothing was started.");
  assert.doesNotMatch(r.translation + r.detail, /\$|usd|cost/i);
  assert.equal(await ceilingRefusal({ at: "2026-10-10T12:00:00Z" }), null, "control: the next local day passes again");
});

// fixtures-run: reading-pipeline use-check
// fixtures-run: extraction use-check
test("fixtures-contract use-check R3: while a member's transcribe limit is spent, the real useCheck answers the refusal the contract states, and null before the spend", async () => {
  const USE_CHECK_REFUSAL = {
    ok: false,
    code: "AI_LIMIT_REACHED",
    check: "C-143.1",
    translation: word("ai.refused.limit", { whose: word("ai.whose.own"), period: word("ai.period.day"),
      use: word("ai.use.transcribe.inline"), when: word("ai.when.day") }),
    detail: "member:ann's day limit (transcribe, in calls) is reached for the period from 2026-10-09. Nothing was started.",
  };
  const w = await standard();
  w.u.aiLimitSet({ owner: "member:ann", scope: "transcribe", unit: "calls", period: "day", amount: 1, by: "ann", at: AT });
  const judge = () => w.u.useCheck({ owner: "member:ann", member: "ann", use: "transcribe", at: AT });
  assert.equal(judge(), null, "control: nothing spent, judged null");
  w.count("member:ann", "ann", "transcribe");
  const real = judge();
  assert.deepEqual(Object.fromEntries(Object.keys(USE_CHECK_REFUSAL).map((k) => [k, real[k]])), USE_CHECK_REFUSAL);
});
