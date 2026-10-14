/* affordances: R19's backing for the ops op-grades R41 grades `reasoned` that this module's owners already serve (T48-57; K3101,
   K3203, K3207), each driven at its owning module's own interface over that module's own fixture, as t41-backing.test.mjs
   drives T41's: graded `reasoned`; without its reason refused with its code, a code in JUSTIFICATION_REFUSALS; with it accepted.
   `updateskip`'s `UPDATE_SKIP_NO_REASON` is `instance-setup`'s own test's and `control-plane`'s totality (its owner is later in
   the order and is never imported here). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JUSTIFICATION_REFUSALS, RUNGS } from "../../../src/op-grades/index.mjs";
import { world, V } from "../connections/fixture.mjs";

const DRIVEN = ["stepsource", "stepsourcewithdraw"];

function backed(op, code, refused, accepted) {
  assert.ok(DRIVEN.includes(op), op);
  assert.equal(RUNGS[op], "reasoned", op);
  const got = refused?.code ?? refused?.reason;
  assert.notEqual(refused?.ok, true, `${op}: accepted without its reason: ${JSON.stringify(refused).slice(0, 300)}`);
  assert.equal(got, code, `${op}: ${JSON.stringify(refused).slice(0, 300)}`);
  assert.ok(JUSTIFICATION_REFUSALS.includes(got), `${op}: ${got} is not in JUSTIFICATION_REFUSALS`);
  assert.equal(accepted?.ok, true, `${op}: refused with its reason: ${JSON.stringify(accepted).slice(0, 300)}`);
}

const E = "ENT-2026-0101", F = "ENT-2026-0102", D1 = "INFO-2026-0101-a";
function setup() {
  const w = world();
  w.member("alice");
  w.entity(E, "The Commission"); w.entity(F, "The Department");
  const rel = w.entities.declareRelation({ fromEntity: E, toEntity: F, relation: "member_of", justification: "charter",
                                           citation: "Charter art. 2", declaredBy: "alice" });
  assert.equal(rel.ok, true, JSON.stringify(rel));
  const [d1] = w.doc(D1, ["the commission is part of the department"]);
  w.receipt("https://example.org/d1", d1, "2026-09-26T00:00:00Z", "direct");
  return { w, rel: rel.relation_id, d1 };
}

test("R19 R12: connections' stepsource, graded `reasoned` (op-grades R41), is refused without the member's basis, its authored "
   + "reason, with STEP_SOURCE_NO_BASIS (connections R68), in JUSTIFICATION_REFUSALS, and accepted with it", () => {
  const { w, rel, d1 } = setup();
  const attach = (x) => w.k.attachStepSource({ relation: rel, captureSha: d1, extent: { kind: "pdf-page", page: 3 }, member: "alice",
    viewer: V("alice"), ...x });
  backed("stepsource", "STEP_SOURCE_NO_BASIS", attach({ basis: "  " }), attach({ basis: "Page 3 says the commission sits within the department." }));
});

test("R19 R12: connections' stepsourcewithdraw, graded `reasoned` (op-grades R41), is refused without a reason with NO_REASON "
   + "(already in JUSTIFICATION_REFUSALS) and accepted with it; the source stays recorded", () => {
  const { w, rel, d1 } = setup();
  const id = w.k.attachStepSource({ relation: rel, captureSha: d1, extent: { kind: "document" }, basis: "b", member: "alice",
    viewer: V("alice") }).step_source.id;
  const drop = (x) => w.k.withdrawStepSource({ id, member: "alice", viewer: V("alice"), ...x });
  backed("stepsourcewithdraw", "NO_REASON", drop({ reason: "" }), drop({ reason: "The page says otherwise." }));
  assert.equal(w.count("step_sources"), 1, "never deleted");
});

test("R19: every op driven here is graded `reasoned`; a control: an op graded otherwise is not", () => {
  for (const op of DRIVEN) assert.equal(RUNGS[op], "reasoned", op);
  assert.notEqual(RUNGS.actionreplyquoting, "reasoned");
});
