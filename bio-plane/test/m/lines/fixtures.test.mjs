/* The published fixture `linesWorld` (fixtures.mjs): each answer is the real recordLine's refusal, a write of none. */
import test from "node:test";
import assert from "node:assert/strict";
import { linesWorld } from "./fixtures.mjs";

test("linesWorld answers each listed refusal from the real recordLine and writes no line", () => {
  const { w, answers } = linesWorld();
  assert.deepEqual(Object.keys(answers), ["UNKNOWN_LINE_KIND", "NO_SUCH_ENTITY", "SEAT_ON_ENDS", "HOLDER_NOT_A_PERSON",
    "UNKNOWN_CAPACITY", "BAD_CAPACITY", "MACHINE_NEEDS_IDENTIFIERS"]);
  for (const [code, a] of Object.entries(answers)) {
    assert.equal(a.ok, false, code);
    assert.equal(a.reason, code);
  }
  assert.equal(w.one("SELECT COUNT(*) AS n FROM lines").n, 0);
});
