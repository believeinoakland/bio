/* The fixtures hypotheses publishes for its op answers (K4990, K4993, K4995) are the real code's answers: each is checked
   here against hypotheses' own catalogue row (`HYPOTHESES_CHECKS`) and its ok shape. */
import test from "node:test";
import assert from "node:assert/strict";
import { holdAnswer, holdRefusals, reviseAnswer, reviseRefusals, withdrawAnswer, withdrawAlreadyAnswer, withdrawRefusals,
         listWorld, listAnswer, emptyListAnswer } from "./fixtures.mjs";
import { HYPOTHESES_CHECKS, hypothesesOps } from "../../../src/hypotheses/index.mjs";
import { INQ, ANN } from "./fixture.mjs";

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

test("R3 listAnswer: the list a question answers, a live hypothesis and a withdrawn one, each labelled a hypothesis and never a fact", () => {
  const r = listAnswer();
  assert.deepEqual(Object.keys(r).sort(), ["hypotheses", "inquiry", "label", "ok", "system_proposals"]);
  assert.deepEqual([r.ok, r.inquiry, r.label], [true, INQ, "hypothesis"]);
  assert.deepEqual(r.hypotheses.map((h) => h.status), ["live", "withdrawn"]);
  for (const h of r.hypotheses) assert.deepEqual([h.label, h.fact, h.grade], ["hypothesis", false, null]);
  assert.equal(r.hypotheses[1].history.at(-1).act, "withdraw", "the withdrawn one keeps its withdrawal in its history");
  assert.deepEqual(r.system_proposals.items, [], "no system proposal in this world");
});

test("R3 listAnswer is the answer op=hypotheses gives for the same question over the same world", () => {
  const w = listWorld();
  const op = hypothesesOps(w.h, new URL(`https://bio.test/api?op=hypotheses&inquiry=${INQ}&viewer=${ANN}`), undefined);
  assert.deepEqual(op.hypotheses(), listAnswer());
});

test("R3 emptyListAnswer: a question with no hypothesis answers the empty list, its proposals' heading beside it", () => {
  const r = emptyListAnswer();
  assert.deepEqual([r.ok, r.inquiry, r.hypotheses], [true, INQ, []]);
  assert.deepEqual(r.system_proposals.items, []);
});

test("R1 R2 each fixture is made when it is called: two calls give two answers, never one stored value", () => {
  const a = holdAnswer(), b = holdAnswer();
  assert.notEqual(a, b);
  assert.notEqual(withdrawAnswer(), withdrawAnswer());
  assert.notEqual(listAnswer(), listAnswer());
});
