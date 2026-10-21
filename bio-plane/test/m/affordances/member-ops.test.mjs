/* affordances, R48 (fix round 4, FR-40, B16; K4437): the test gap behind `capturecredentiallist` and `readheld`, which op-declarations'
   R34 found unexplained only after both were declared. Every op in `SESSION_OPS.member`, as the owners declare it (every owner's
   `DECLARED_OPS` registered as the plane registers them, K3268, never a hand list), is explained by `ACT_HELP` under its own name or is
   named in one ground of `ACT_HELP_ABSENT`; an op with neither is named by this module's own test, so the next new member op is caught in
   its own round. This file registers every owner (this process only: `node --test` runs each file in its own process). */
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import { declaredOpsOf } from "../../declared-ops.mjs";
import * as O from "../../../src/op-declarations/index.mjs";
import { ACT_HELP } from "../../../src/affordances/act-help.mjs";

const { ops, owners, duplicates } = await declaredOpsOf(fileURLToPath(new URL("../../../../", import.meta.url)));
assert.deepEqual(duplicates, []);
const REGISTERED = {};
for (const [op, row] of Object.entries(ops)) (REGISTERED[owners[op]] ??= {})[op] = row;
O.registerDeclaredOps(REGISTERED);

const { SESSION_OPS, ACT_HELP_ABSENT } = O;
const absentNames = (groups) => new Set(Object.values(groups).flatMap((g) => [...g.ops]));
/* the member ops with neither a text here nor a ground there, by name */
const unexplained = (help, absent, names) => names.filter((op) => !Object.hasOwn(help, op) && !absent.has(op));

test("R48 (FR-40): every op in SESSION_OPS.member is explained by ACT_HELP under its own name or is named in ACT_HELP_ABSENT, and the op "
   + "with neither is named (negative control: a member op with its text taken out of ACT_HELP is named by name)", () => {
  const member = [...SESSION_OPS.member];
  assert.ok(member.length > 0);
  assert.deepEqual(unexplained(ACT_HELP, absentNames(ACT_HELP_ABSENT), member), []);
  /* negative control: take one explained member op out of the table; it is the one named */
  const dropped = member.find((op) => Object.hasOwn(ACT_HELP, op));
  const { [dropped]: _gone, ...without } = ACT_HELP;
  assert.deepEqual(unexplained(without, absentNames(ACT_HELP_ABSENT), member), [dropped]);
});
