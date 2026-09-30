/* run-rules R10 (was ai-runs R45's share, N293): the most a run's state may hold, and its one check. */
import test from "node:test";
import assert from "node:assert/strict";
import { checkRunState, AI_RUN_STATE_MAX_BYTES, AI_RUN_CHECKS, AI_RUN_OWN_CHECKS } from "../../../src/run-rules/index.mjs";

const LIMIT = 262144;
const ROW = AI_RUN_OWN_CHECKS.AI_RUN_STATE_TOO_LARGE;
const bytesOf = (state) => Buffer.byteLength(JSON.stringify(state), "utf8");
/** A state whose JSON is exactly `n` bytes: `{"s":"…"}` is eight bytes around the string. */
const sized = (n) => ({ s: "x".repeat(n - 8) });
/** A state whose JSON is `n` bytes, most of them three-byte characters, so its UTF-16 length is about a third. */
const wide = (n) => { const k = Math.floor((n - 8) / 3); return { s: "€".repeat(k) + "x".repeat(n - 8 - 3 * k) }; };

test("R10: AI_RUN_STATE_MAX_BYTES is 262,144; checkRunState answers null for an absent or null state and for one whose JSON's UTF-8 length is within it, else AI_RUN_STATE_TOO_LARGE (C-22.18) naming bytes and limit", () => {
  assert.equal(AI_RUN_STATE_MAX_BYTES, LIMIT);
  assert.equal(ROW.check, "C-22.18");
  assert.equal(AI_RUN_CHECKS.AI_RUN_STATE_TOO_LARGE, ROW);
  for (const s of [null, undefined]) assert.equal(checkRunState(s), null);
  for (const s of [{}, [], 0, "", false, sized(LIMIT), wide(LIMIT), ["x".repeat(LIMIT - 4)], "x".repeat(LIMIT - 2)]) {
    assert.ok(bytesOf(s) <= LIMIT);
    assert.equal(checkRunState(s), null, `${bytesOf(s)} bytes`);
  }
  for (const s of [sized(LIMIT + 1), wide(LIMIT + 1), wide(LIMIT + 3), ["x".repeat(LIMIT - 3)], "x".repeat(LIMIT - 1),
                   { deep: { list: Array.from({ length: 30000 }, (_, i) => `item ${i}`) } }]) {
    assert.ok(bytesOf(s) > LIMIT);
    const r = checkRunState(s);
    assert.deepEqual([r.ok, r.code, r.check, r.translation], [false, "AI_RUN_STATE_TOO_LARGE", "C-22.18", ROW.translation]);
    assert.deepEqual([r.bytes, r.limit], [bytesOf(s), LIMIT]);
    assert.match(r.detail, new RegExp(`^the run's state is ${bytesOf(s)} bytes as JSON, over the ${LIMIT}`));
  }
  /* bytes, not characters: under the ceiling in UTF-16 units and over it in UTF-8 */
  const w = wide(LIMIT + 1);
  assert.ok(JSON.stringify(w).length < LIMIT);
  assert.equal(checkRunState(w).bytes, LIMIT + 1);
  /* pure, never throws: a value JSON cannot hold is not measured */
  const cyclic = {}; cyclic.self = cyclic;
  assert.equal(checkRunState(cyclic), null);
  assert.equal(checkRunState(() => 1), null);
  assert.equal(checkRunState(Symbol("s")), null);
});
