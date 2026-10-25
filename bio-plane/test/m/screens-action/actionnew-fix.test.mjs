/* screens-action's T51 fix round (FR-31) on `actionnew`: L20's screen half (K4195): a refused act whose answer carries `findings[]` draws
   each finding's `detail`, not only the code's generic sentence. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, press, ok, beside, choose, W, DATA_PLANE, ROUTES, ACTION_ID, QUESTION, AFFORDANCES, OFFICES, refusedIn } from "./page.mjs";

const PLANE = { ...DATA_PLANE, actioncreate: ok({ ok: true, id: ACTION_ID }), addresseesuggest: ok(OFFICES) };
const WITH = (extra) => ({ status: 200, json: { ok: true, result: { ok: false, reason: "ACTION_BASIS_REFUSED", code: "ACTION_BASIS_REFUSED", ...extra } } });
const VALUES = { "an-ask": "Comment on the draft standard", "an-who": "City Administrator", "an-leg": QUESTION, "an-legk": "advances", "an-due-text": "Comments close",
  "an-due-date": "2026-10-30", "an-due-because": "the notice of the draft standard" };

async function refusedWith(extra) {
  const p = await open(ROUTES.actionnew, { ...PLANE, actioncreate: WITH(extra), affordances: ok(AFFORDANCES) });
  await choose(p, "an-kind", "request_for_comment");
  const b = await press(p, "actioncreate", { values: VALUES, reason: "x" });
  assert.equal(p.byOp("actioncreate").length, 1, "the act was sent");
  return { p, b };
}

test("R24, L20 (K4195): a refusal with findings draws each finding's detail after the code's sentence; control: one with no findings draws the code's sentence alone", async () => {
  const { p, b } = await refusedWith({ findings: [{ check: "C-2.10", detail: "The leg names an action, not a question of this project." }] });
  const at = beside(p, b);
  assert.ok(at.includes(W("refusal.ACTION_BASIS_REFUSED")), "the code's sentence");
  assert.ok(at.includes("The leg names an action, not a question of this project."), "the finding's own detail");
  const two = await refusedWith({ findings: [{ detail: "first reason" }, { detail: "second reason" }, { code: "X" }] });
  assert.ok(beside(two.p, two.b).includes("first reason") && beside(two.p, two.b).includes("second reason"), "each finding with a detail");
  const plain = await refusedWith({});
  const text2 = beside(plain.p, plain.b);
  assert.ok(text2.includes(W("refusal.ACTION_BASIS_REFUSED")));
  assert.equal(main(plain.p).querySelector('[data-findings="refusal"]'), null, "no findings, none drawn");
  const empty = await refusedWith({ findings: [] });
  assert.equal(main(empty.p).querySelector('[data-findings="refusal"]'), null);
  // a finding's detail is the record's own text: drawn escaped, never as markup
  const hostile = await refusedWith({ findings: [{ detail: "<b>x</b>" }] });
  assert.ok(beside(hostile.p, hostile.b).includes("<b>x</b>"), "escaped text, read back as the characters");
  assert.equal(main(hostile.p).querySelector("[data-findings] b"), null);
});
