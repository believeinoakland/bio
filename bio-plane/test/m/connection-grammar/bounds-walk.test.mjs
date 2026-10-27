/* connection-grammar at its interface: the bounds (R10), the walk semantics over a path (R12–R14) and the exhausted
   shape (R15). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { BOUNDS, CHAIN_LIMITS, chainLimitOf, depthOf, exhausted, EXHAUSTION_REASONS, hubBoundOf, chainGrade, chainLabel, chainStrength, strongerChain, orderPaths, foldParallel } from "../../../src/connection-grammar/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { tie, said, guess, mention, valid, NODE } from "./fixtures/owner.mjs";

test("R10 BOUNDS is frozen with the walk bounds and the per-kind hub bound (a vote 4,000, every other kind 1,000), and depthOf answers the depth or refuses", () => {
  assert.ok(Object.isFrozen(BOUNDS));
  assert.deepEqual(Object.keys(BOUNDS).sort(), ["depth_default", "depth_max", "fanout", "hub", "hub_by_kind", "nodes", "time_budget_ms"]);
  assert.equal(BOUNDS.depth_default, 8);
  assert.equal(BOUNDS.depth_max, 10);
  assert.equal(BOUNDS.fanout, 1000);
  assert.equal(BOUNDS.nodes, 5000);
  assert.equal(BOUNDS.hub, 1000);
  assert.ok(Number.isInteger(BOUNDS.time_budget_ms) && BOUNDS.time_budget_ms > 0);
  assert.throws(() => { BOUNDS.hub = 5; }, TypeError);
  // hub_by_kind: a member's vote 4,000, every other kind hub's 1,000; frozen, and nothing inherited reads as a bound.
  assert.ok(Object.isFrozen(BOUNDS.hub_by_kind));
  assert.deepEqual(Object.entries(BOUNDS.hub_by_kind), [["event_voted", 4000]]);
  assert.equal(Object.getPrototypeOf(BOUNDS.hub_by_kind), null);
  assert.throws(() => { BOUNDS.hub_by_kind.event_voted = 5; }, TypeError);
  assert.throws(() => { BOUNDS.hub_by_kind.event_held = 5; }, TypeError);
  assert.equal(hubBoundOf("event_voted"), 4000);
  assert.ok(BOUNDS.hub_by_kind.event_voted < BOUNDS.nodes, "a vote hub is still under the walk's node bound");
  for (const k of ["event_held", "sample_tie", "constructor", "__proto__", "toString", "", undefined, null, 3]) {
    assert.equal(hubBoundOf(k), BOUNDS.hub, String(k));
    assert.equal(BOUNDS.hub_by_kind[/** @type {any} */ (k)] ?? BOUNDS.hub, BOUNDS.hub, String(k));
  }
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
  assert.equal(h.why, word("connection-grammar.why.hop_hunch_carries", { id: "h" }));
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

const ids = (paths) => paths.map((p) => p.map((h) => h.id).join(">"));
const lead = (id, grade) => g(id, grade, [grade, grade]);

test("R22 chainStrength and strongerChain: no hunch, then no declared hop, then the better assertion letter, then the better end letter", () => {
  assert.deepEqual(chainStrength([g("a", "A", ["A", "B"]), g("b", "B", ["A", "A"])]), { assertion: "B", end: "B", lead: false, hunch: false });
  assert.deepEqual(chainStrength([g("a", "A", ["A", "A"]), said("d", NODE, "ENT-2026-0007")]), { assertion: "D", end: "D", lead: true, hunch: false });
  assert.deepEqual(chainStrength([guess("h", NODE, "ENT-2026-0008")]), { assertion: null, end: null, lead: true, hunch: true });
  assert.equal(chainStrength([]).refused, "PATH_EMPTY");
  assert.equal(chainStrength([g("a", "Z", ["A", "A"])]).refused, "GRADE_INVALID");
  const BB = [lead("a", "B"), lead("b", "B")], BC = [lead("a", "B"), lead("c", "C")];
  assert.equal(strongerChain(BB, BC), -1);
  assert.equal(strongerChain(BC, BB), 1);
  // Equal on assertion D, compared on the end letter.
  const AD = [g("a", "A", ["A", "A"]), g("d", "D", ["A", "A"])], DD = [g("d", "D", ["D", "D"])];
  assert.equal(chainStrength(AD).assertion, chainStrength(DD).assertion);
  assert.equal(strongerChain(AD, DD), -1);
  // An evidenced weakest-D path beats a declared-hop path, which beats a hunch path.
  const weakD = [g("w", "D", ["D", "D"])], declared = [said("d", NODE, "ENT-2026-0007")], hunch = [guess("h", NODE, "ENT-2026-0008")];
  assert.equal(strongerChain(weakD, declared), -1);
  assert.equal(strongerChain(declared, hunch), -1);
  assert.equal(strongerChain(hunch, weakD), 1);
  assert.equal(strongerChain(BB, [lead("x", "B"), lead("y", "B")]), 0);
  assert.equal(strongerChain(hunch, [guess("h2", NODE, "ENT-2026-0009")]), 0);
  assert.equal(strongerChain([], BB).refused, "PATH_EMPTY");
  assert.equal(strongerChain(BB, "x").refused, "PATH_EMPTY");
  for (const out of [chainStrength(BB), chainStrength(hunch)]) assert.deepEqual(Object.keys(out).sort(), ["assertion", "end", "hunch", "lead"]);
  // Control: chainGrade and chainLabel answer as before.
  assert.deepEqual(Object.keys(chainGrade(BB)).sort(), ["assertion", "end"]);
  assert.deepEqual(chainLabel(BB), { label: "evidenced" });
});

test("R23 orderPaths: hop count, then strength, then the earliest valid.from, then ids; by first", () => {
  const at = (id, from, grade = "A") => tie(id, NODE, "ENT-2026-0002", valid(from, null), { grade: { assertion: grade, ends: [grade, grade] } });
  const B = [at("p1", "2024-01-01", "B"), at("p2", "2024-01-01", "B"), at("p3", "2024-01-01", "B")];
  const C = [at("q1", "2018-01-01", "B"), at("q2", "2018-01-01", "C"), at("q3", "2018-01-01", "B")];
  const D = [at("r1", "2010-01-01", "B"), at("r2", "2010-01-01", "D"), at("r3", "2010-01-01", "B")];
  for (const input of [[D, C, B], [B, C, D], [C, D, B]]) assert.deepEqual(ids(orderPaths(input)), ids([B, C, D]), "strength beats date");
  // Equal strength: the earliest date; all equal: ids; any input order, one output.
  const early = [at("e1", "2019-01-01", "B")], late = [at("l1", "2024-01-01", "B")], tieX = [at("x1", "2024-01-01", "B")];
  const want = [early, late, tieX];
  for (const input of [[tieX, late, early], [late, early, tieX], want]) assert.deepEqual(ids(orderPaths(input)), ids(want));
  // Fewer hops first, whatever the strength.
  const twoWithD = [at("s1", "2020-01-01", "A"), at("s2", "2020-01-01", "D")], threeA = [at("t1", "2020-01-01"), at("t2", "2020-01-01"), at("t3", "2020-01-01")];
  assert.deepEqual(ids(orderPaths([threeA, twoWithD])), ids([twoWithD, threeA]));
  // A grouped connection is one hop, and paths of groups order too.
  const grp = (id, grade) => foldParallel([at(`${id}a`, "2020-01-01", grade), at(`${id}b`, "2020-01-01", grade)]);
  const weak = grp("w", "C"), strong = grp("v", "A");
  assert.deepEqual(ids(orderPaths([weak, strong])), ids([strong, weak]));
  assert.deepEqual(ids(orderPaths([[...weak, ...weak], strong])), ids([strong, [...weak, ...weak]]));
  // By first.
  assert.deepEqual(orderPaths([{ hops: B, quantities: { n: 1 } }, { hops: early, quantities: { n: 2 } }], { by: "n" }).map((p) => p.hops[0].id), ["e1", "p1"]);
  assert.equal(orderPaths("x").refused, "PATHS_INVALID");
  assert.equal(orderPaths([[]]).refused, "PATHS_INVALID");
});

test("R24 foldParallel makes parallel hops one grouped connection, every member kept and graded", () => {
  const pay = (id, from, to, grade, v = valid("2020-01-01", "2021-01-01")) => tie(id, from, to, v, { kind: "sample_tie", grade: { assertion: grade, ends: [grade, grade] } });
  const forty = [...Array(40)].map((_, i) => pay(`pay-${String(i).padStart(2, "0")}`, "ENT-2026-0010", "ENT-2026-0011", "B", valid(`2020-02-${String(1 + (i % 28)).padStart(2, "0")}`, `2020-12-${String(1 + (i % 28)).padStart(2, "0")}`)));
  const back = pay("back", "ENT-2026-0011", "ENT-2026-0010", "A");
  const out = foldParallel([back, ...forty]);
  assert.equal(out.length, 2);
  const grp = out.find((x) => x.from === "ENT-2026-0010");
  assert.equal(grp.count, 40);
  assert.equal(grp.members.length, 40);
  assert.ok(grp.members.every((m) => m.evidence.length));
  assert.equal(grp.id, "pay-00");
  assert.equal(out.find((x) => x.id === "back").count, 1, "the other direction is another group");
  assert.equal(grp.valid.from, "2020-02-01");
  assert.equal(grp.valid.to, "2020-12-28");
  assert.deepEqual(grp.members.map((m) => m.valid.from), [...grp.members.map((m) => m.valid.from)].sort());
  // Strongest member on each axis; kinds apart; the weakest-hop rule between groups, never within.
  const mixed = foldParallel([pay("m1", "ENT-2026-0010", "ENT-2026-0011", "B"), pay("m2", "ENT-2026-0010", "ENT-2026-0011", "C"), pay("m3", "ENT-2026-0010", "ENT-2026-0011", "D")]);
  assert.deepEqual(mixed[0].grade, { assertion: "B", ends: ["B", "B"] });
  const kinds = foldParallel([pay("k1", "ENT-2026-0010", "ENT-2026-0011", "B"), mention("ENT-2026-0010", "ENT-2026-0011")]);
  assert.equal(kinds.length, 2);
  assert.deepEqual(chainGrade(mixed), chainGrade([mixed[0].members[0]]));
  assert.deepEqual(chainGrade([...mixed, ...kinds.slice(1)]), chainGrade([mixed[0].members[0], kinds[1].members[0]]));
  assert.deepEqual(mixed[0].members[1].grade, { assertion: "C", ends: ["C", "C"] }, "a member's own grade is unchanged");
  // Undeclared stays unmarked; undetermined only when every member is.
  assert.equal("undetermined" in mixed[0], false);
  const und = (id) => ({ ...pay(id, "ENT-2026-0010", "ENT-2026-0011", "B"), undetermined: { why: { key: "k", vars: {} } } });
  assert.ok("undetermined" in foldParallel([und("u1"), und("u2")])[0]);
  assert.equal("undetermined" in foldParallel([und("u1"), pay("u3", "ENT-2026-0010", "ENT-2026-0011", "B")])[0], false);
  // Declared groups keep their label; a hunch group has no grade.
  assert.equal(foldParallel([said("d1", NODE, "ENT-2026-0007"), said("d2", NODE, "ENT-2026-0007")])[0].label, said("x", NODE, "y").label);
  assert.equal(foldParallel([guess("h1", NODE, "ENT-2026-0008")])[0].grade, null);
  assert.deepEqual(foldParallel([]), []);
  for (const bad of [null, "x", [1], [{}], [{ id: "a" }], new Array(50001).fill(back)]) assert.equal(foldParallel(bad).refused, "HOPS_INVALID");
});

test("R25 CHAIN_LIMITS and chainLimitOf: a count only, apart from BOUNDS", () => {
  assert.deepEqual(CHAIN_LIMITS, { chains: { default: 50, max: 200 } });
  assert.ok(Object.isFrozen(CHAIN_LIMITS) && Object.isFrozen(CHAIN_LIMITS.chains));
  assert.equal(JSON.stringify(CHAIN_LIMITS).includes("budget_ms"), false);
  assert.equal("chains" in BOUNDS, false);
  assert.equal(chainLimitOf(), 50);
  assert.equal(chainLimitOf(null), 50);
  assert.equal(chainLimitOf(1), 1);
  assert.equal(chainLimitOf(200), 200);
  assert.equal(chainLimitOf(201).refused, "CHAIN_LIMIT_OVER_MAX");
  for (const bad of [1.5, 0, -3, "5", NaN]) assert.equal(chainLimitOf(bad).refused, "CHAIN_LIMIT_INVALID", String(bad));
  assert.ok(chainLimitOf(201).why.length > 10 && chainLimitOf(0).why.length > 10);
  assert.deepEqual([...EXHAUSTION_REASONS].sort(), ["depth", "fanout", "hub", "nodes", "time"]);
});
