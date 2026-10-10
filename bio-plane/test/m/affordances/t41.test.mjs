/* affordances, T41 (T41-52; N820, N797, DEC-188 (7), (8); K2484, K2560, K2570): R12's totality and R41's explanation over
   the ops op-declarations declares in T41 (its R41, R42, R43, R45) and op-grades grades (its R29, R30), and the four ops
   DEC-188 (8) retires, at the module's exports. R48's texts for them are t36.test.mjs's; R19's backing of the `reasoned`
   ones is t41-backing.test.mjs's. */
import test from "node:test";
import assert from "node:assert/strict";
import * as A from "../../../src/affordances.mjs";
import * as G from "../../../src/op-grades/index.mjs";
import { T41_RUNGS, T41_RUNG_ABSENT, T41_NON_ACTS } from "../../../src/op-grades/t41.mjs";

const { RUNGS, RUNG_ABSENT, NON_ACTS } = G;
const RETIRED = ["aiceilingset", "aicopyceilingset", "accountswitchset", "groupswitchset"];
const T41_OPS = [...new Set([...Object.keys(T41_RUNGS), ...Object.keys(T41_RUNG_ABSENT), ...Object.keys(T41_NON_ACTS)])];
const writes = T41_OPS.filter((op) => Object.hasOwn(RUNGS, op) || Object.hasOwn(RUNG_ABSENT, op));
const reads = T41_OPS.filter((op) => !writes.includes(op));
/* the control plane's rows for them, as op-declarations declares them: every op gated, each write mutating */
const ROWS = T41_OPS.map((op) => ({ op, mutating: writes.includes(op), gated: true }));

test("R12: with the control plane's rows for T41's ops nothing is unaccounted; carried by no row each reads stale; an op "
   + "left ungraded or unnamed, or a retired op carried, is seen (K874)", () => {
  /* the handle pair (op-declarations R42), the project's account (R41) and an investigation act and read (R43) are among them */
  for (const op of ["handlechange", "handlecheck", "projectkeyset", "accountusesset", "ailimitset", "exploreapprove",
    "milestoneremove", "stepaccept", "claims", "captureupload"]) assert.ok(T41_OPS.includes(op), op);
  assert.ok(reads.length > 0 && writes.length > 0);
  const r = A.unaccounted(ROWS);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => T41_OPS.includes(op)), []);
  assert.deepEqual(T41_OPS.filter((op) => !A.unaccounted([]).stale.includes(op)), []);
  /* negative controls */
  const left = A.unaccounted([...ROWS, { op: "stepunnamed", mutating: true, gated: true }]);
  assert.deepEqual([left.unpublished, left.unranked], [["stepunnamed"], ["stepunnamed"]]);
  const retired = A.unaccounted([...ROWS, ...RETIRED.map((op) => ({ op, mutating: true, gated: true }))]);
  assert.deepEqual([retired.unpublished.sort(), retired.unranked.sort()], [[...RETIRED].sort(), [...RETIRED].sort()],
    "a retired op still declared reads unpublished and unranked");
  for (const op of reads) assert.ok(A.unaccounted([{ op, mutating: false, gated: false }]).stale.includes(op), op);
});

test("R12 (DEC-188 (8)): the four retired ops are named in no table — no grade, no reason, no act — so a table without "
   + "them reads no stale row for them", () => {
  for (const op of RETIRED) {
    assert.deepEqual([Object.hasOwn(RUNGS, op), Object.hasOwn(RUNG_ABSENT, op), Object.hasOwn(NON_ACTS, op)], [false, false, false], op);
    assert.ok(![...A.ACTS, ...A.CAPTURE_ACTS, ...A.PER_ITEM_ACTS].some((a) => a.id === op), op);
    assert.ok(!A.unaccounted([]).stale.includes(op), op);
  }
});

const ROWS_OF = { INVESTIGATION_NO_REASON: { check: "C-146.1", translation: "Say why." } };
const rowOf = (c) => ROWS_OF[c] ?? null;
test("R41: a refusal of a T41 op is explained with that op's rung or stated absence, never a bare null: milestoneremove's "
   + "reason refusal at `reasoned`, projectkeyset at its `credential` ground, a read at neither; a retired op explains as "
   + "an op the catalogue does not grade", () => {
  const e = A.explainRefusal({ op: "milestoneremove", code: "INVESTIGATION_NO_REASON", rowOf });
  assert.deepEqual([e.translation, e.check, e.rung, e.rung_absence, e.acts], ["Say why.", "C-146.1", "reasoned", null, null]);
  const k = A.explainRefusal({ op: "projectkeyset", code: "NOT_THE_OWNER", rowOf });
  assert.deepEqual([k.rung, k.rung_absence, k.translation], [null, "credential", null]);
  for (const op of writes) {
    const x = A.explainRefusal({ op, code: "X", rowOf });
    assert.equal((x.rung === null) !== (x.rung_absence === null), true, `R24: ${op}`);
  }
  for (const op of reads) assert.deepEqual([A.explainRefusal({ op, code: "X" }).rung, A.explainRefusal({ op, code: "X" }).rung_absence], [null, null], op);
  const gone = A.explainRefusal({ op: "aiceilingset", code: "X" });
  assert.deepEqual([gone.rung, gone.rung_absence, gone.detail], [null, null, A.NOT_CATALOGUED]);
});
