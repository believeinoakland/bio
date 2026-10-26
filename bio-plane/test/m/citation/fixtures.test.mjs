/* Fix round 10 (K5175): the answers this module publishes in fixtures.mjs, each called and its real answer checked. */
import test from "node:test";
import assert from "node:assert/strict";
import { sever, reinstate, reinstateOtherSide } from "./fixtures.mjs";

test("R4 sever (fixtures): the door's sever of a cited finding answers what the module answers, and the edge reads severed with the member's reason", async () => {
  const { w, project, handle, answer } = await sever();
  assert.equal(answer.ok, true, JSON.stringify(answer).slice(0, 300));
  assert.deepEqual([answer.severed, answer.to, answer.why, answer.weight], [["INFO-2026-0001"], "severed", "the wrong edition", "refuse"]);
  assert.deepEqual(w.fm(project).references.find((e) => e.target === "INFO-2026-0001").status, "severed");
  assert.ok(handle, "the selection the citation came from");
  const control = await sever({ reason: "a second reason" });
  assert.equal(control.answer.why, "a second reason", "control: the reason is the one given, not a fixed one");
});

test("R4 reinstate (fixtures): a severed citation's door answer reinstates it, and the edge reads confirmed with the member's reason", async () => {
  const { w, project, severed, answer } = await reinstate();
  assert.equal(severed.ok, true, JSON.stringify(severed).slice(0, 300));
  assert.equal(answer.ok, true, JSON.stringify(answer).slice(0, 300));
  assert.deepEqual([answer.reinstated, answer.from, answer.to, answer.why], [["INFO-2026-0001"], ["severed"], "confirmed", "the edition was right"]);
  assert.equal(w.fm(project).references.find((e) => e.target === "INFO-2026-0001").status, "confirmed");
  const control = await reinstate({ reason: "a different reason" });
  assert.equal(control.answer.why, "a different reason", "control: the reason is the one given, not a fixed one");
});

test("R23 reinstateOtherSide (fixtures): the door's reinstate of a severed cuts_against leg with a role answers what the module answers, and the one leg reads on the other side", async () => {
  const { w, question, severed, answer } = await reinstateOtherSide();
  assert.equal(severed.ok, true, JSON.stringify(severed).slice(0, 300));
  assert.equal(answer.ok, true, JSON.stringify(answer).slice(0, 300));
  assert.deepEqual([answer.reinstated, answer.to, answer.role, answer.roleMoved], [["INFO-2026-0001-doc"], "confirmed", "supports", ["INFO-2026-0001-doc"]]);
  assert.deepEqual(w.fm(question).basis.map((l) => [l.target, l.role]), [["INFO-2026-0001-doc", "supports"]]);
  const control = await reinstateOtherSide({ role: "cuts_against" });
  assert.deepEqual([control.answer.ok, control.answer.roleMoved, control.w.fm(control.question).basis[0].role], [true, [], "cuts_against"],
    "control: the role is the one given, and the side it already held moves nothing");
});
