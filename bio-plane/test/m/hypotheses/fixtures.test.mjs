/* The fixtures hypotheses publishes for its op answers (K4990, K4993, K4995) are the real code's answers: each is checked
   here against hypotheses' own catalogue row (`HYPOTHESES_CHECKS`) and its ok shape. */
import test from "node:test";
import assert from "node:assert/strict";
import { holdAnswer, holdRefusals, reviseAnswer, reviseRefusals, withdrawAnswer, withdrawAlreadyAnswer, withdrawRefusals } from "./fixtures.mjs";
import { HYPOTHESES_CHECKS } from "../../../src/hypotheses/index.mjs";

/* A refusal is the real code's: its own code, the catalogue row's check and translation, and nothing written. */
function assertRefusedAs(r, code) {
  assert.deepEqual([r.ok, r.reason, r.code], [false, code, code], JSON.stringify(r));
  assert.equal(r.check, HYPOTHESES_CHECKS[code].check, `${code} keeps its catalogue number`);
  assert.deepEqual(r.translation, HYPOTHESES_CHECKS[code].translation, `${code} keeps its catalogue translation`);
}

test("R1 holdAnswer: the real hold's ok answer, {ok, hypothesis_id, kind, label, at}, labelled a hypothesis", () => {
  const r = holdAnswer();
  assert.deepEqual(Object.keys(r).sort(), ["at", "hypothesis_id", "kind", "label", "ok"]);
  assert.equal(r.ok, true);
  assert.match(r.hypothesis_id, /^HYP-\d{4}-\d{4}$/);
  assert.deepEqual([r.kind, r.label], ["relation", "hypothesis"]);
});

test("R1 holdRefusals: each refusal hold draws is the real code's, under its own code, its catalogue row and nothing written", () => {
  const refusals = holdRefusals();
  assert.deepEqual(Object.keys(refusals).sort(), ["BAD_ABOUT", "HYPOTHESIS_NO_STATEMENT", "MACHINE_CANNOT_HYPOTHESISE", "NOT_AN_INQUIRY", "NO_SUCH_BUNDLE", "UNKNOWN_HYPOTHESIS_KIND"]);
  for (const [code, r] of Object.entries(refusals)) assertRefusedAs(r, code);
  assert.deepEqual(refusals.UNKNOWN_HYPOTHESIS_KIND.kinds, ["cause", "identity", "relation", "flow", "other"]);
  assert.equal(refusals.BAD_ABOUT.node, "not-an-id");
});

test("R2 reviseAnswer: the real revise's ok answer, the hypothesis keeping its id, labelled a hypothesis", () => {
  const r = reviseAnswer();
  assert.deepEqual(Object.keys(r).sort(), ["at", "hypothesis_id", "kind", "label", "ok"]);
  assert.equal(r.ok, true);
  assert.match(r.hypothesis_id, /^HYP-\d{4}-\d{4}$/);
  assert.deepEqual([r.kind, r.label], ["relation", "hypothesis"]);
});

test("R2 reviseRefusals: each refusal revise draws is the real code's, under its own code, its catalogue row and nothing written", () => {
  const refusals = reviseRefusals();
  assert.deepEqual(Object.keys(refusals).sort(), ["HYPOTHESIS_NO_REASON", "HYPOTHESIS_NO_STATEMENT", "HYPOTHESIS_WITHDRAWN", "MACHINE_CANNOT_HYPOTHESISE", "NO_SUCH_HYPOTHESIS"]);
  for (const [code, r] of Object.entries(refusals)) assertRefusedAs(r, code);
});

test("R2 withdrawAnswer: the real withdraw's ok answer, the hypothesis marked withdrawn with who, when and why", () => {
  const r = withdrawAnswer();
  assert.equal(r.ok, true);
  assert.equal(r.already, undefined, "the first withdrawal is not an already answer");
  assert.match(r.hypothesis_id, /^HYP-\d{4}-\d{4}$/);
  assert.equal(r.label, "hypothesis");
  assert.deepEqual([r.withdrawn.by, r.withdrawn.reason], ["member:ann", "mistaken"]);
  assert.match(r.withdrawn.at, /^\d{4}-\d{2}-\d{2}T/);
});

test("R2 withdrawAlreadyAnswer: a second withdrawal answers ok, already, with the first withdrawal's reason", () => {
  const r = withdrawAlreadyAnswer();
  assert.deepEqual([r.ok, r.already], [true, true]);
  assert.equal(r.withdrawn.reason, "mistaken", "the first reason, not the second");
});

test("R2 withdrawRefusals: each refusal withdraw draws is the real code's, under its own code, its catalogue row and nothing written", () => {
  const refusals = withdrawRefusals();
  assert.deepEqual(Object.keys(refusals).sort(), ["HYPOTHESIS_NO_REASON", "MACHINE_CANNOT_HYPOTHESISE", "NO_SUCH_HYPOTHESIS"]);
  for (const [code, r] of Object.entries(refusals)) assertRefusedAs(r, code);
});

test("R1 R2 each fixture is made when it is called: two calls give two answers, never one stored value", () => {
  const a = holdAnswer(), b = holdAnswer();
  assert.notEqual(a, b);
  assert.notEqual(withdrawAnswer(), withdrawAnswer());
});
