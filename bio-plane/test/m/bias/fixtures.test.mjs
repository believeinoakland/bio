/* bias' published fixtures (fixtures.mjs): each is called here and its real answer is checked, R9 (a malformed bias set
   never lands) through the module's own promotion check. */
import test from "node:test";
import assert from "node:assert/strict";
import { biasRefusedPromote } from "./fixtures.mjs";

test("R9 fixture biasRefusedPromote: the real promotion check refuses a malformed bias set BIAS_REFUSED, each finding named by its code", () => {
  const r = biasRefusedPromote();
  assert.equal(r.ok, false);
  assert.equal(r.reason, "BIAS_REFUSED");
  assert.equal(r.check, "C-26.11");
  assert.ok(Array.isArray(r.findings) && r.findings.length === 3, JSON.stringify(r));
  assert.deepEqual(r.findings.map((f) => [f.check, f.code]),
    [["C-26.5", "BIAS_STATEMENT_ISSUES_A_VERDICT"], ["C-26.2", "BIAS_STATEMENT_SUBJECT_NOT_REGISTERED"],
     ["C-26.3", "BIAS_STATEMENT_NO_JUSTIFICATION"]]);
});
