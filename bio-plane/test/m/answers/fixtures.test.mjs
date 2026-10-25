/* answers' published fixtures (fixtures.mjs), each called here and its real answer checked (K4990, K5044). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { limitsUnreadable, standingQuestions } from "./fixtures.mjs";
import { ANSWERS_CHECKS } from "../../../src/answers/index.mjs";

test("R30 fixture limitsUnreadable is the real refusal of an ask whose paying limits cannot be judged: LIMITS_UNREADABLE, nothing used", async () => {
  const r = await limitsUnreadable();
  assert.equal(r.ok, false);
  assert.equal(r.reason, "LIMITS_UNREADABLE");
  assert.equal(typeof r.detail, "string");
});

test("R16 R34 fixture standingQuestions holds the real refusals of the end acts: another's question as absent, an ended one STANDING_ENDED", () => {
  const f = standingQuestions();
  assert.equal(f.noSuch.ok, false); assert.equal(f.noSuch.code, "NO_SUCH_STANDING_QUESTION");
  assert.equal(f.noSuchEndSet.code, "NO_SUCH_STANDING_QUESTION");
  assert.equal(f.noSuch.translation, ANSWERS_CHECKS.NO_SUCH_STANDING_QUESTION.translation);
  assert.equal(f.ending.ok, true);
  assert.equal(f.ended.ok, false); assert.equal(f.ended.code, "STANDING_ENDED");
  assert.equal(f.ended.translation, ANSWERS_CHECKS.STANDING_ENDED.translation);
});
