/* The fixtures money publishes for its users (K4990, K4993, K5044): each test calls the fixture and checks the real answer. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFactNotFound, readFactOf } from "./fixtures.mjs";

test("R8 readFactNotFound: money's own answer for an absent fact over an empty record, found false and no fact", () => {
  const r = readFactNotFound();
  assert.deepEqual([r.ok, r.found, r.fact], [true, false, null]);
  assert.match(r.fact_id, /^MNY-/);
});

test("R8 readFactOf: money's own answer for a recorded fact, every field it holds, the overrides applied", () => {
  const r = readFactOf();
  assert.deepEqual([r.ok, r.found], [true, true]);
  assert.equal(r.fact.kind, "expenditure");
  assert.equal(r.fact.amount, "1250000.00");
  assert.deepEqual([r.fact.adjustments, r.fact.cited_by], [[], []]);
  const o = readFactOf({ kind: "revenue", stage: "collected", amount: "10.00", as_read: "$10.00" });
  assert.deepEqual([o.fact.kind, o.fact.amount], ["revenue", "10.00"]);
});
