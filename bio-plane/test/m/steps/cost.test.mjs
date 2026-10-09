/* steps R13–R15: money cost, its shares between projects, and the relay between their owners. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, ANN, BOB, CAT, DAN, AI, P1, P2, PH, PD, Q, Q2 } from "./fixture.mjs";

test("R13: stepCostAdd appends a fee or purchase in an exact decimal, with who and when; stepCostRemove by its writer only, recorded", () => {
  const w = world();
  const id = w.step();
  const add = (a) => w.s.stepCostAdd({ step: id, kind: "fee", amount: "0.10", currency: "USD", what: "copies", by: ANN, ...a });
  for (const bad of [{ kind: "ai" }, { amount: "1e3" }, { amount: 12 }, { amount: "-1" }, { currency: "usd" }, { what: "" }])
    assert.equal(add(bad).code, "STEP_BAD_COST", JSON.stringify(bad));
  w.runs();
  assert.equal(add({ by: AI }).code, "STEP_MEMBER_ONLY", "AI use is never a step cost");
  const c1 = add({}).cost, c2 = add({ amount: "0.20" }).cost;
  add({ kind: "purchase", amount: "3", currency: "EUR", what: "map", by: BOB });
  let cost = w.s.step({ step: id, viewer: ANN }).cost;
  assert.deepEqual(cost.totals, { EUR: "3", USD: "0.30" }, "exact: 0.10 + 0.20 is 0.30");
  assert.equal(cost.items[0].by, "ann-h");
  assert.equal(w.s.stepCostRemove({ cost: c1, by: BOB }).code, "NO_SUCH_COST", "by its writer only");
  assert.equal(w.s.stepCostRemove({ cost: c1, by: ANN }).ok, true);
  cost = w.s.step({ step: id, viewer: ANN }).cost;
  assert.deepEqual(cost.totals, { EUR: "3", USD: "0.20" });
  assert.equal(cost.removed[0].cost, c1);
  assert.equal(cost.removed[0].removed.by, "ann-h");
  assert.equal(w.s.stepCostRemove({ cost: c1, by: ANN }).code, "NO_SUCH_COST");
  void c2;
});

test("R14: costShares answers a costed step's totals and sharing projects to each owner of each, when two or more draw and none is hidden; else nothing to anyone", () => {
  const w = world();
  const id = w.step({ place: { questions: [Q, Q2] } });
  w.s.stepCostAdd({ step: id, kind: "fee", amount: "40", currency: "USD", what: "records fee", by: ANN });
  w.draw(Q, P1);
  assert.deepEqual(w.s.costShares({ viewer: ANN }).shares, [], "one project draws: nothing");
  w.draw(Q2, P2);
  const a = w.s.costShares({ viewer: ANN }).shares;
  assert.equal(a.length, 1);
  assert.deepEqual(a[0].projects, [{ id: P1, name: "Project One" }, { id: P2, name: "Project Two" }]);
  assert.deepEqual(a[0].totals, { USD: "40" });
  assert.deepEqual(w.s.costShares({ viewer: BOB }).shares.map((s) => s.key), [a[0].key], "Bob owns P2");
  assert.deepEqual(w.s.costShares({ viewer: DAN }).shares, [], "not an owner of either");
  /* the key changes with the totals, so each change is told once */
  w.s.stepCostAdd({ step: id, kind: "fee", amount: "5", currency: "USD", what: "postage", by: ANN });
  const b = w.s.costShares({ viewer: ANN }).shares[0];
  assert.notEqual(b.key, a[0].key);
  assert.equal(w.s.costShares({ viewer: ANN }).shares[0].key, b.key, "stable while nothing changes");
  /* a hidden drawing project: nothing about the step, to anyone */
  w.draw(Q, PH);
  assert.deepEqual(w.s.costShares({ viewer: ANN }).shares, []);
  assert.deepEqual(w.s.costShares({ viewer: CAT }).shares, []);
  /* a failed read: nothing */
  const f = world({ legEarning: { projectsDrawingOnPaged() { throw new Error("down"); } } });
  const s = f.step();
  f.s.stepCostAdd({ step: s, kind: "fee", amount: "1", currency: "USD", what: "x", by: ANN });
  assert.deepEqual(f.s.costShares({ viewer: ANN }).shares, []);
  void PD;
});

test("R15: costMessage by an owner of a sharing project relays her text once to the owners of each other one; costMessages answers it with the writer's handle and no project", () => {
  const w = world();
  const id = w.step({ place: { questions: [Q] } });
  w.s.stepCostAdd({ step: id, kind: "fee", amount: "40", currency: "USD", what: "records fee", by: ANN });
  assert.equal(w.s.costMessage({ step: id, text: "Shall we split it?", by: ANN }).code, "NO_SUCH_STEP", "no share: answered as absent");
  w.draw(Q, P1, P2, PD);
  assert.equal(w.s.costMessage({ step: id, text: "Split?", by: CAT }).code, "NO_SUCH_STEP", "not an owner of a sharing project");
  assert.equal(w.s.costMessage({ step: id, text: "x".repeat(2001), by: ANN }).code, "STEP_BAD_TEXT");
  const r = w.s.costMessage({ step: id, text: "Shall we split it three ways?", by: ANN });
  assert.equal(r.ok, true);
  for (const v of [BOB, DAN]) {
    const m = w.s.costMessages({ viewer: v }).messages;
    assert.equal(m.length, 1);
    assert.deepEqual([m[0].text, m[0].writer], ["Shall we split it three ways?", "ann-h"]);
    assert.equal(JSON.stringify(m).includes("PROJ-"), false, "names no project");
  }
  assert.deepEqual(w.s.costMessages({ viewer: ANN }).messages, [], "not relayed to its writer");
  assert.deepEqual(w.s.costMessages({ viewer: CAT }).messages, []);
  /* re-judged at the act: once a drawing project is hidden there is no share, and the act is answered as absent */
  w.st.sql.exec(`UPDATE project_sight SET setting = 'hidden' WHERE project_id = ?`, PD);
  assert.equal(w.s.costMessage({ step: id, text: "Again?", by: ANN }).code, "NO_SUCH_STEP");
});
