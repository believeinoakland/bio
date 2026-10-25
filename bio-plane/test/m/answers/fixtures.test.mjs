/* answers' published fixtures (fixtures.mjs), each called here and its real answer checked (K4990, K5044). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { limitsUnreadable, standingQuestions, standingAnswersHeldBack } from "./fixtures.mjs";
import { ANSWERS_CHECKS, STANDING_LABEL } from "../../../src/answers/index.mjs";

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

test("R19 R20 fixture standingAnswersHeldBack is the real standingAnswersFor answer for a member's question whose find was held back by the copy's AI switch: the find told once, no answer, held_back switch_off", async () => {
  const r = await standingAnswersHeldBack();
  assert.equal(r.ok, true);
  assert.equal(r.entries.length, 1);
  const [e] = r.entries;
  assert.equal(e.answer, null);
  assert.deepEqual(e.held_back, { condition: "switch_off", switch: "copy" });
  assert.equal(e.finds.ids.length, 1);
  assert.match(e.finds.ids[0], /^INFO-2026-\d{4}-/);
  assert.equal(e.label, STANDING_LABEL);
  assert.equal(e.question.question, "Anything new on the budget?");
});

test("R20 fixture standingAnswersHeldBack takes the member it is asked for: carol's own question's entry", async () => {
  const r = await standingAnswersHeldBack({ member: "carol", finds: "Budget for carol" });
  assert.equal(r.entries.length, 1);
  assert.equal(r.entries[0].question.question, "Anything new on the budget?");
  assert.deepEqual(r.entries[0].held_back, { condition: "switch_off", switch: "copy" });
});
