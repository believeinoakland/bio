/* control-plane R112 (T51; K4206, K4210; op-declarations R80, op-grades R49): the registrations of `op-declarations` and `op-grades` take
   this module's DECLARED_OPS and agree with the hand rows the ops already hold. A registration is the first read of its process
   (R81), so this file reads no table before it: each test below is its own process's first call. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { OWNER_MAP_DECLARED_OPS as DECLARED_OPS } from "../../../src/store-assembly/owner-ops.mjs";
import { registerDeclaredOps as registerRows } from "../../../src/op-declarations/index.mjs";
import { registerDeclaredOps as registerGrades } from "../../../src/op-grades/index.mjs";

const MINE = Object.keys(DECLARED_OPS);

test("R112 (K4206, K4210): the registrations take this module's rows; each op is registered or agreed with its hand row", () => {
  registerRows({ "control-plane": DECLARED_OPS });
  const { registered, agreed } = registerGrades({ "control-plane": DECLARED_OPS });
  for (const op of MINE) assert.ok([...registered, ...agreed].includes(op), `${op} is registered or agreed with its hand row`);
});
