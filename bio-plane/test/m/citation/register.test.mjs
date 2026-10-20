/* citation R18 (T51; K4168, K4189; op-declarations R80): citation's DECLARED_OPS registers with op-declarations' registerDeclaredOps
   as the plane registers it at start-up: no refusal. Control: the same declaration with citeimported's `needs` taken away is
   refused NEEDS_MISSING, naming the op, and the registration changes nothing, so the real one still goes through. Registration
   happens once per process and before any table is read, so this file imports no module that reads one. */
import test from "node:test";
import assert from "node:assert/strict";
import { DECLARED_OPS } from "../../../src/citation/index.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";

test("R18 citation's DECLARED_OPS registers with op-declarations: a mutating row without its needs is refused naming the op, and the declaration as written is accepted", () => {
  const { needs, ...withoutNeeds } = DECLARED_OPS.citeimported;
  assert.equal(needs, "contribute");
  assert.throws(() => registerDeclaredOps({ citation: { ...DECLARED_OPS, citeimported: withoutNeeds } }),
    (err) => err instanceof TypeError && /citeimported/.test(err.message) && /NEEDS_MISSING/.test(err.message));
  assert.doesNotThrow(() => registerDeclaredOps({ citation: DECLARED_OPS }));
});

test("R18 every mutating row citation declares names its needs capability, the one its sibling acts hold", () => {
  for (const [op, row] of Object.entries(DECLARED_OPS)) {
    if (row.mutating) assert.equal(row.needs, "contribute", op);
  }
});
