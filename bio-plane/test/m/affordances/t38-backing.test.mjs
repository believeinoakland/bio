/* affordances: R19's backing for every op op-grades' `t38.mjs` grades `reasoned` (its R28; N788, DEC-183 (2), K2322),
   driven at its owning module's own interface over that module's own fixture, as t36-backing.test.mjs drives T36's:
   called well-formed but without its authored reason, it is refused with its owner's code, which is in
   JUSTIFICATION_REFUSALS; called with it, it is accepted. The last test holds the list driven here to the ops `t38.mjs`
   grades `reasoned`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JUSTIFICATION_REFUSALS, RUNGS } from "../../../src/op-grades/index.mjs";
import { T38_RUNGS } from "../../../src/op-grades/t38.mjs";

/* Each op driven below, by its owner; the last test holds this list to t38.mjs. */
const DRIVEN = ["obscuremarkwithdraw"];

/* The backing of one op: graded `reasoned`; without its reason refused with `code`, in the family; with it accepted. */
function backed(op, code, refused, accepted) {
  assert.ok(DRIVEN.includes(op), op);
  assert.equal(RUNGS[op], "reasoned", op);
  const got = refused?.code ?? refused?.reason;
  assert.notEqual(refused?.ok, true, `${op}: accepted without its reason: ${JSON.stringify(refused).slice(0, 300)}`);
  assert.equal(got, code, `${op}: ${JSON.stringify(refused).slice(0, 300)}`);
  assert.ok(JUSTIFICATION_REFUSALS.includes(got), `${op}: ${got} is not in JUSTIFICATION_REFUSALS`);
  assert.equal(accepted?.ok, true, `${op}: refused with its reason: ${JSON.stringify(accepted).slice(0, 300)}`);
}

/* ---- case-carriage (R14) ---- */
import { world, makePng, V } from "../case-carriage/fixture.mjs";

test("R19: case-carriage's obscuremarkwithdraw, graded `reasoned` (op-grades R28), is refused without its reason (absent, "
   + "blank) with WITHDRAW_NO_REASON (case-carriage R14, C-141.10), in JUSTIFICATION_REFUSALS, and accepted with it", async () => {
  const w = world();
  for (const m of ["olive", "ben"]) w.member(m);
  const p = w.photo("INFO-2026-0020-photo", makePng(40, 30));
  const m = await w.cc.obscureMark({ captureSha: p, areas: [{ rect: [1, 1, 8, 8], kind: "person" }], by: V("olive") });
  assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
  const withdraw = (x) => w.cc.obscureMarkWithdraw({ captureSha: p, mark: m.mark, by: V("ben"), ...x });
  const absent = await withdraw({ reason: undefined }), blank = await withdraw({ reason: "   " });
  const accepted = await withdraw({ reason: "it covers the inspector the finding names" });
  backed("obscuremarkwithdraw", "WITHDRAW_NO_REASON", absent, accepted);
  backed("obscuremarkwithdraw", "WITHDRAW_NO_REASON", blank, accepted);
});

/* ---- the list ---- */
test("R19: every op op-grades' t38.mjs grades `reasoned` is driven here", () => {
  const graded = Object.keys(T38_RUNGS).filter((op) => T38_RUNGS[op] === "reasoned").sort();
  assert.deepEqual([...new Set(DRIVEN)].sort(), graded);
});
