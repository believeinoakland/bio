/* op-grades R50 (T51 fix round 10, item 97 (K5202)): the agreement check accepts a registered owner row exactly when its hand
   row agrees. store-assembly declares `readtranslate` (R53, R84) with the sentence its own requirement names; op-grades' hand
   row must carry that same sentence, or the registration of the tranche's declared rows throws DECLARED_OP_DISAGREES and no
   store starts. The owner's rows are read through its export (read-only), never copied here. */
import test from "node:test";
import assert from "node:assert/strict";
import { ASSEMBLY_DECLARED_OPS } from "../../../src/store-assembly/declared.mjs";

let n = 0;
const load = () => import(`../../../src/op-grades/index.mjs?r50readtranslate=${n++}`);

test("R50: store-assembly's readtranslate row agrees with op-grades' hand row, so the registration passes for it", async () => {
  const m = await load();
  const row = ASSEMBLY_DECLARED_OPS.readtranslate;
  assert.ok(row, "store-assembly declares readtranslate");
  const answer = m.registerDeclaredOps({ "store-assembly": { readtranslate: row } });
  assert.deepEqual(answer, { registered: [], agreed: ["readtranslate"] });
});
