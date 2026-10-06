/* connection-grammar at its interface: purity (R16), no measure of connectedness (R17), and every no saying why (R18). */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as cg from "../../../src/connection-grammar/index.mjs";
import { KINDS, NODE, AT, INQUIRY, makeNeighbours, fixture, tie, said } from "./fixtures/owner.mjs";

test("R16 pure: every service runs with no clock, no network and no store, and holds only what is registered in memory", () => {
  const saved = { now: Date.now, fetch: globalThis.fetch, random: Math.random, perf: performance.now };
  const trap = (name) => () => { throw new Error(`${name} was read`); };
  Date.now = trap("Date.now"); globalThis.fetch = trap("fetch"); Math.random = trap("Math.random"); performance.now = trap("performance.now");
  try {
    const r = cg.createRegistry();
    assert.equal(r.registerOwner({ owner: "sample", kinds: KINDS, neighbours: makeNeighbours() }).ok, true);
    r.owners(); r.kindOf("sample_tie"); r.checkConnection(tie("c", NODE, "ENT-2026-0002"));
    assert.ok(Array.isArray(r.neighbours({ owner: "sample", node: NODE, kinds: ["sample_tie"], at: AT, viewer: "alice", scope: INQUIRY }).items));
    assert.equal(cg.ownerConformance({ owner: "sample", kinds: KINDS, neighbours: makeNeighbours(), fixture: fixture() }).ok, true);
    cg.chainGrade([tie("c", NODE, "ENT-2026-0002")]); cg.chainLabel([said("d", NODE, "ENT-2026-0007")]);
    cg.orderPaths([[tie("c", NODE, "ENT-2026-0002")]]); cg.exhausted({ visited: 1, reason: "time" }); cg.depthOf(3);
    cg.derivedId({ kind: "k", from: NODE, to: NODE, as_of: "2026-01-01", method: "m" });
  } finally {
    Date.now = saved.now; globalThis.fetch = saved.fetch; Math.random = saved.random; performance.now = saved.perf;
  }
  // No walker and no stored path: nothing offered walks from a node or keeps a path.
  for (const name of Object.keys(cg)) assert.doesNotMatch(name, /walk|path(?!s$)|explore|traverse|store|save/i, name);
});

test("R17 nothing offers a measure of how connected a node is, a centrality, or a score across kinds", () => {
  for (const name of Object.keys(cg)) assert.doesNotMatch(name, /degree|central|score|rank|count|popular|connected/i, name);
  assert.deepEqual(Object.keys(cg.BOUNDS).sort(), ["depth_default", "depth_max", "fanout", "hub", "nodes", "time_budget_ms"]);
  assert.deepEqual(cg.CLASSES, ["evidentiary", "derived", "declared", "hunch"]);
  const r = cg.createRegistry();
  for (const w of ["most connected", "centrality", "influence score", "network hub", "knows"]) {
    assert.equal(r.registerOwner({ owner: "o", kinds: [{ kind: "k", word: w, class: "derived" }], neighbours: () => ({ items: [] }) }).refused, "WORD_FORBIDDEN", w);
  }
  // A walk's semantics answer grades, labels and an order, never a number about a node.
  const p = [tie("a", NODE, "ENT-2026-0002"), tie("b", "ENT-2026-0002", "ENT-2026-0003")];
  assert.deepEqual(Object.keys(cg.chainGrade(p)).sort(), ["assertion", "end"]);
  assert.deepEqual(cg.chainLabel(p), { label: "evidenced" });
  assert.ok(cg.orderPaths([p]).every(Array.isArray));
  // A hub is named by its set size alone: the one count, and never a ranking among nodes.
  const h = cg.createRegistry();
  h.registerOwner({ owner: "sample", kinds: KINDS, neighbours: makeNeighbours() });
  assert.deepEqual(Object.keys(h.neighbours({ owner: "sample", node: "ENT-2026-9999", at: AT, viewer: "alice", scope: null }).hub).sort(), ["set_size", "why"]);
});

test("R18 every refusal and every undetermined answer says which kind of no and why", () => {
  const r = cg.createRegistry();
  r.registerOwner({ owner: "sample", kinds: KINDS, neighbours: makeNeighbours() });
  const noes = [
    r.registerOwner({ owner: "sample", kinds: KINDS, neighbours: () => ({}) }),
    r.registerOwner({}),
    r.neighbours({ owner: "sample", node: NODE, at: AT, scope: null }),
    r.neighbours({ owner: "x", node: NODE, at: AT, viewer: "a", scope: null }),
    cg.depthOf(11), cg.depthOf(0), cg.exhausted({ reason: "x" }), cg.chainGrade([]), cg.chainLabel(null), cg.orderPaths(null),
  ];
  for (const n of noes) {
    assert.match(n.refused, /^[A-Z_]+$/, JSON.stringify(n));
    assert.ok(typeof n.why === "string" && n.why.length > 10, JSON.stringify(n));
  }
  for (const reason of cg.EXHAUSTION_REASONS) assert.ok(cg.exhausted({ visited: 0, reason }).why.length > 10);
  const hunchGrade = cg.chainGrade([{ ...said("d", NODE, "ENT-2026-0007"), label: cg.HUNCH_LABEL }]);
  assert.ok(hunchGrade.why.length > 10);
  const items = r.neighbours({ owner: "sample", node: NODE, at: AT, viewer: "alice", scope: INQUIRY }).items;
  for (const i of items.filter((x) => x.undetermined)) assert.ok(i.undetermined.why.length);
  const bad = r.checkConnection({});
  assert.ok(bad.errors.every((e) => e.field && e.why.length > 5));
});
