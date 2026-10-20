/* citation R18 (T51; K4168, K4189, K4223): every mutating row of DECLARED_OPS names its `needs` capability, `contribute`, as its
   sibling acts do, so op-declarations can register it (R80). The registration itself is proven by op-declarations' own
   `register-owners.mjs`, which names this module's declaration; this module does not import op-declarations (index 152 is
   later than citation's 81 in the order). Shape only: the declaration's rows, not the registry. */
import test from "node:test";
import assert from "node:assert/strict";
import { DECLARED_OPS } from "../../../src/citation/index.mjs";

test("R18 every mutating row citation declares names its needs capability, contribute, the one its sibling acts hold", () => {
  assert.ok(Object.keys(DECLARED_OPS).length > 0);
  for (const [op, row] of Object.entries(DECLARED_OPS)) {
    if (row.mutating) assert.equal(row.needs, "contribute", op);
  }
  assert.equal(DECLARED_OPS.citeimported.needs, "contribute");
  assert.equal(DECLARED_OPS.withdrawimported.needs, "contribute");
});
