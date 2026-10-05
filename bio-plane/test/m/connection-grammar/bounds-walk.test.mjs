/* connection-grammar at its interface: the bounds (R10), the walk semantics over a path (R12–R14) and the exhausted
   shape (R15). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { BOUNDS, depthOf, exhausted, EXHAUSTION_REASONS, chainGrade, chainLabel, orderPaths } from "../../../src/connection-grammar/index.mjs";
import { tie, said, guess, mention, valid, NODE } from "./fixtures/owner.mjs";

test("R10 BOUNDS is frozen with the walk bounds, and depthOf answers the depth or refuses", () => {
  assert.ok(Object.isFrozen(BOUNDS));
  assert.deepEqual(Object.keys(BOUNDS).sort(), ["depth_default", "depth_max", "fanout", "hub", "nodes", "time_budget_ms"]);
  assert.equal(BOUNDS.depth_default, 8);
  assert.equal(BOUNDS.depth_max, 10);
  assert.equal(BOUNDS.fanout, 1000);
  assert.equal(BOUNDS.nodes, 5000);
  assert.equal(BOUNDS.hub, 1000);
  assert.ok(Number.isInteger(BOUNDS.time_budget_ms) && BOUNDS.time_budget_ms > 0);
  assert.throws(() => { BOUNDS.hub = 5; }, TypeError);
  assert.equal(depthOf(), 8);
  assert.equal(depthOf(null), 8);
  for (let d = 1; d <= 10; d++) assert.equal(depthOf(d), d);
  for (const d of [11, 12, 1e6]) assert.equal(depthOf(d).refused, "DEPTH_OVER_MAX", String(d));
  for (const d of [0, -1, 2.5, "3", NaN]) assert.equal(depthOf(d).refused, "DEPTH_INVALID", String(d));
});

const g = (id, assertion, ends) => tie(id, NODE, "ENT-2026-0002", undefined, { grade: { assertion, ends } });

test("R12 chainGrade is the weakest assertion and the weakest end over the hops, never an average", () => {
  assert.deepEqual(chainGrade([g("a", "A", ["A", "A"])]), { assertion: "A", end: "A" });
  assert.deepEqual(chainGrade([g("a", "A", ["A", "B"]), g("b", "B", ["A", "A"]), g("c", "A", ["C", "A"])]), { assertion: "B", end: "C" });
  // Many strong hops do not lift one weak hop.
  assert.deepEqual(chainGrade([...Array(9)].map((_, i) => g(`s${i}`, "A", ["A", "A"])).concat([g("w", "C", ["A", "A"])])), { assertion: "C", end: "A" });
  assert.deepEqual(chainGrade([g("a", "A", ["A", "A"]), said("d", NODE, "ENT-2026-0007")]), { assertion: "D", end: "D" }, "a declared hop gives the lowest");
  const h = chainGrade([g("a", "A", ["A", "A"]), guess("h", NODE, "ENT-2026-0008")]);
  assert.equal(h.assertion, null);
  assert.equal(h.end, null);
  assert.match(h.why, /hunch/);
  assert.equal(chainGrade([]).refused, "PATH_EMPTY");
  assert.equal(chainGrade("x").refused, "PATH_EMPTY");
  assert.equal(chainGrade([g("a", "Z", ["A", "A"])]).refused, "GRADE_INVALID");
});

test("R13 chainLabel is lead, naming the declared and hunch hops, else evidenced", () => {
  const e = [tie("a", NODE, "ENT-2026-0002"), mention(NODE, "ENT-2026-0006")];
  assert.deepEqual(chainLabel(e), { label: "evidenced" });
  assert.deepEqual(chainLabel([...e, said("d", NODE, "ENT-2026-0007")]), { label: "lead", hops: ["d"], basis_for_finding: false });
  assert.deepEqual(chainLabel([guess("h", NODE, "ENT-2026-0008"), ...e, said("d", NODE, "ENT-2026-0007")]),
    { label: "lead", hops: ["h", "d"], basis_for_finding: false });
  assert.equal(chainLabel([]).refused, "PATH_EMPTY");
});

test("R14 orderPaths: hop count, then the earliest valid.from (undetermined last), then the hops' ids; by a stated quantity first", () => {
  const at = (id, from) => tie(id, NODE, "ENT-2026-0002", valid(from, null));
  const long = [at("l1", "2020-01-01"), at("l2", "2020-01-01")];
  const early = [at("e1", "2019-01-01")];
  const late = [at("t1", "2024-01-01")];
  const open = [tie("o1", NODE, "ENT-2026-0002", valid(null, "2030-01-01"))];
  const unresolved = [tie("u1", NODE, "ENT-2026-0002", valid({ event: "EVT-2026-abcdefgh01234567", edge: "start" }, null))];
  const tieA = [at("a1", "2022-01-01")], tieB = [at("b1", "2022-01-01")];
  const want = [early, tieA, tieB, late, open, unresolved, long];
  const inputs = [[long, late, open, early, tieB, unresolved, tieA], [...want].reverse(), want];
  for (const input of inputs) assert.deepEqual(orderPaths(input), want, "the same answer whatever the input order");
  // The earliest from over a path's hops governs.
  const mixed = [at("m1", "2025-01-01"), at("m2", "2018-06-01")];
  assert.deepEqual(orderPaths([early, [mixed[0]], mixed].map((p) => p)).slice(0, 1), [early]);
  assert.deepEqual(orderPaths([[at("x", "2018-01-01"), at("y", "2030-01-01")], [at("p", "2019-01-01"), at("q", "2019-01-01")]])[0][0].id, "x");
  // With by: the stated quantity, descending, then the order above; a path without it after.
  const q = (hops, n) => ({ hops, quantities: n === undefined ? {} : { amount: n } });
  const P = [q(late, 5), q(early, 5), q(long, 900), q(tieA), q(tieB, 1)];
  assert.deepEqual(orderPaths(P, { by: "amount" }), [P[2], P[1], P[0], P[4], P[3]]);
  assert.equal(orderPaths("x").refused, "PATHS_INVALID");
  assert.equal(orderPaths([[]]).refused, "PATHS_INVALID");
  assert.equal(orderPaths([early], { by: 3 }).refused, "BY_INVALID");
  assert.deepEqual(orderPaths([]), []);
});

test("R15 exhausted answers truncated and undetermined with why, for each bound, never a path", () => {
  assert.deepEqual([...EXHAUSTION_REASONS].sort(), ["depth", "fanout", "hub", "nodes", "time"]);
  for (const reason of EXHAUSTION_REASONS) {
    const a = exhausted({ visited: 42, reason });
    assert.deepEqual(Object.keys(a).sort(), ["truncated", "undetermined", "visited", "why"]);
    assert.equal(a.truncated, true);
    assert.equal(a.undetermined, true);
    assert.equal(a.visited, 42);
    assert.ok(typeof a.why === "string" && a.why.length, reason);
  }
  assert.equal(new Set(EXHAUSTION_REASONS.map((reason) => exhausted({ visited: 0, reason }).why)).size, 5, "each why is its own");
  assert.equal(exhausted({ visited: 1, reason: "boredom" }).refused, "REASON_UNKNOWN");
  assert.equal(exhausted({ visited: -1, reason: "depth" }).refused, "VISITED_INVALID");
  assert.equal(exhausted().refused, "REASON_UNKNOWN");
});
