/* run-rules tests: shared helpers. */
import assert from "node:assert/strict";
import { AI_RUN_CHECKS } from "../../../src/run-rules/index.mjs";

/** A refusal built from its row: `ok: false`, the code, its check and translation from the one map, and a detail. */
export function refusal(r, code) {
  assert.ok(r, `expected ${code}, got ${JSON.stringify(r)}`);
  assert.equal(r.ok, false);
  assert.equal(r.code, code);
  assert.equal(r.check, AI_RUN_CHECKS[code].check);
  assert.equal(r.translation, AI_RUN_CHECKS[code].translation);
  assert.equal(typeof r.detail, "string");
  assert.ok(r.detail.length > 0);
  return r;
}
