/* The fixtures money publishes for its users (K4990, K4993, K5044): each test calls the fixture and checks the real answer. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFactNotFound, readFactOf, checkConstantOk, checkConstantRefused, factBySourceFound, factBySourceNone } from "./fixtures.mjs";

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

test("R7 checkConstantOk and checkConstantRefused: money's own answers for a period it reads and one it does not, and for other roles", () => {
  assert.deepEqual(checkConstantOk(), { ok: true, role: "period" });
  assert.deepEqual(checkConstantOk("kind", "revenue"), { ok: true, role: "kind" });
  const r = checkConstantRefused();
  assert.deepEqual([r.ok, r.code, r.role], [false, "MONEY_BAD_PERIOD", "period"]);
  assert.equal(checkConstantRefused("phase", "x").code, "UNKNOWN_PHASE");
});

test("R7 factBySourceFound and factBySourceNone: money's own answers for a source row with a live fact and for one with none", () => {
  const f = factBySourceFound();
  assert.deepEqual([f.ok, f.found, /^MNY-/.test(f.fact_id)], [true, true, true]);
  assert.deepEqual(factBySourceNone(), { ok: true, found: false });
});
