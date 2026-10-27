/* journey-check R2, R8 (K5062; K3100): the walker's tables are the plane's. journey-check imports no module, so the answers its
   fake plane and its tests serve are its own (`// fixtures-own: harness`); what keeps them from drifting into invention is that
   every op they answer is an op the plane declares and every code they give is a code the product gives, read as data from
   the product's source (tables.mjs). The tables in pseudo.test.mjs, walker.test.mjs, start-project.test.mjs and
   conclude-fields.test.mjs hold themselves to the same helpers; this file holds the fake plane's, and the helpers' own control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { assertDeclared, assertGiven, declaredOps } from "./tables.mjs";
import { fakePlane } from "./fake-plane.mjs";

test("R2 (K5062): the ops the live arm's fake plane answers itself are ops the plane declares; control: an op the plane does not declare, and a code no product file gives, are named", async () => {
  const fp = await fakePlane({});
  try {
    assert.ok(fp.ops.length >= 4, `the fake plane answers ${fp.ops.join(", ")}`);
    assertDeclared(fp.ops, "the fake plane");
  } finally { await fp.close(); }
  assert.ok(declaredOps()("whoami") && !declaredOps()("accountconnect"));
  assert.throws(() => assertDeclared({ whoami: 1, accountconnect: 1 }, "a table"), /answers an op the plane does not declare/);
  assert.throws(() => assertGiven(["HANDLE_TAKEN", "NO_SUCH_READING_AT_ALL"], "a table"), /gives a code no product file gives/);
  assertGiven(["HANDLE_TAKEN", "NOT_YOUR_ACCOUNT", "AI_RUN_BOUND_NO_ALLOWANCE"], "a table");
});
