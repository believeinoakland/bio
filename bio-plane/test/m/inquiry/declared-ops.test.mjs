/* inquiry R86 (T51; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import test from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, inquiryOps } from "../../../src/inquiry/index.mjs";
import { world, V } from "./fixture.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";
const Q = "INQ-2026-0001-q", C1 = "INQ-2026-0002-a", C2 = "INQ-2026-0003-b";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* a refusal names a field by its code alone */
const named = (codes) => (answer, field) => !!answer && typeof answer === "object"
  && (codes[field] || []).some((c) => answer.code === c || answer.reason === c);
/* the call as the door runs it: the stamps in the address, every field in the body, the arm asked of a fresh owner */
const mk = (op) => async (fields) => {
  const w = world(); w.doc(A); w.doc(B);
  w.inquiry(Q, { legs: [{ target: A }, { target: B }] });
  const url = new URL(`http://x/?op=${op}&viewer=admin&author=${encodeURIComponent(V("alice"))}`);
  return inquiryOps(w.k, url, { ...fields })[op]();
};

test("R86 inquiry declares inquirydivide and inquiryground, rows with the class, weight and description of the op's existing rows", () => {
  assert.deepEqual(Object.keys(DECLARED_OPS).sort(), ["inquirydivide", "inquiryground"]);
  assert.ok(Object.isFrozen(DECLARED_OPS));
  for (const row of Object.values(DECLARED_OPS)) {
    assert.deepEqual(row.classes, ["admin", "member", "probe"]);
    assert.equal(row.mutating, true);
    assert.equal(row.weight, "reasoned");
    assert.ok(Array.isArray(row.fields.accepts) && Array.isArray(row.fields.requires));
  }
  assert.equal(DECLARED_OPS.inquirydivide.description, "act.inquirydivide.does");
  assert.equal(DECLARED_OPS.inquiryground.description, "act.inquiryground.does");
});

test("R86 inquirydivide: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "inquirydivide", declaration: DECLARED_OPS["inquirydivide"], call: mk("inquirydivide"),
    refusedNaming: named({ target: ["NO_TARGET"], reason: ["NO_REASON"], children: ["TOO_FEW_CHILDREN"] }),
    values: { target: Q, reason: "two questions",
              children: [{ id: C1, question: "First half?", legs: [0] }, { id: C2, question: "Second half?", legs: [1] }] },
    same: sameCode });
});

test("R86 inquiryground: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "inquiryground", declaration: DECLARED_OPS["inquiryground"], call: mk("inquiryground"),
    refusedNaming: named({ target: ["NO_TARGET"], grounds: ["NO_PARTITION"] }),
    values: { target: Q, grounds: [{ ground: "g1", legs: [0] }, { ground: "g2", legs: [1] }] },
    same: sameCode });
});

test("R86 control: the helper fails a declaration that requires a field the arm does not refuse without", async () => {
  const wrong = { ...DECLARED_OPS.inquiryground, fields: { accepts: ["target", "grounds", "reason"], requires: ["target", "grounds", "reason"] } };
  await assert.rejects(declaredOpHolds({ op: "inquiryground", declaration: wrong, call: mk("inquiryground"),
    refusedNaming: named({ target: ["NO_TARGET"], grounds: ["NO_PARTITION"], reason: ["NO_REASON"] }),
    values: { target: Q, grounds: [{ ground: "g1", legs: [0] }, { ground: "g2", legs: [1] }], reason: "x" }, same: sameCode }),
    /reason/);
});
