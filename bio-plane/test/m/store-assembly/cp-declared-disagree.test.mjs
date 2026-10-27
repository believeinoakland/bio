/* store-assembly's copy of control-plane's declared-disagree.test.mjs. R85 (K4206; op-declarations R80): the control for cp-declared-registration.test.mjs. A row of this module whose stamps
   disagree with the hand row the door holds is refused by the registration, naming the op, so the start would stop (R80's test).
   Its own process, so its first read is this registration (R81). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { OWNER_MAP_DECLARED_OPS } from "../../../src/store-assembly/owner-ops.mjs";
import { registerDeclaredOps as registerRows } from "../../../src/op-declarations/index.mjs";

test("R85 control (K4206): a row whose stamps disagree with its hand row is refused naming the op, and the start would stop", () => {
  const wrong = { ...OWNER_MAP_DECLARED_OPS, accountdrafts: { ...OWNER_MAP_DECLARED_OPS.accountdrafts, stamps: ["viewer", "by"] } };
  assert.throws(() => registerRows({ "store-assembly": wrong }), /accountdrafts/);
});
