/* explore at its interface, T51 (T51-39): every hop an answer lists names its two ends (R26). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { exploreOf } from "../../../src/explore/index.mjs";
import { AT, ent, evt, conn, world, byOwner } from "./fixtures/owners.mjs";

const V = "alice";
const A = ent(1), B = ent(2), C = ent(3);
const make = (conns, o = {}) => { const w = world(byOwner(conns), o); return { ...w, x: exploreOf(null, { registry: w.registry, ...(o.ctx ?? {}) }) }; };
const labelling = (table, calls = []) => ({ labelsOf: ({ ids, viewer }) => { calls.push({ ids: [...ids], viewer }); return Object.fromEntries(ids.map((id) => [id, table[id] ?? null])); } });
const strip = (r) => ({ ...r, elapsed_ms: 0, owner_calls: 0 });
const names = { [A]: { label: "Alice Alder", kind: "person" } };
const chainRows = () => [conn("line:reports_to", A, B, { id: "a-b" }), conn("line:part_of", B, C, { id: "b-c" })];

test("R26 a chain from a registered person through an unnamed body answers the person's label as hop 1's from_label, null as hop 1's to_label and hop 2's from_label; one bounded read of the distinct ends", () => {
  const calls = [];
  const { x } = make(chainRows(), { ctx: { entities: labelling(names, calls) } });
  const r = x.explore({ from: A, at: AT, viewer: V, kinds: ["line:reports_to", "line:part_of"] });
  const p = r.paths.find((q) => q.hops.length === 2);
  assert.deepEqual(p.hops.map((h) => [h.id, h.from_label, h.to_label]), [["a-b", "Alice Alder", null], ["b-c", null, null]]);
  assert.equal(calls.length, 1, "read once for the answer");
  assert.deepEqual([...calls[0].ids].sort(), [A, B, C].sort(), "each distinct end once");
  assert.equal(calls[0].viewer, V);
  // The presets are the same walk, so their hops are named alike.
  const c = x.chain({ from: A, at: AT, viewer: V });
  assert.ok(c.paths.length > 0 && c.paths.every((q) => q.hops.every((h) => "from_label" in h && "to_label" in h)));
  assert.equal(c.paths.flatMap((q) => q.hops).find((h) => h.id === "a-b").from_label, "Alice Alder");
  // The graph's steps carry the same.
  const g = x.neighbourhood({ centre: A, at: AT, viewer: V });
  assert.deepEqual(g.steps.map((s) => [s.id, s.from_label, s.to_label]), [["a-b", "Alice Alder", null], ["b-c", null, null]]);
});

test("R26 a label is never an id, an event end answers null and is not read, and without an entities reader every end is null", () => {
  const rows = [conn("line:belongs_to", A, evt(7), { id: "a-e" }), conn("line:part_of", A, B, { id: "a-b" })];
  const calls = [];
  const { x } = make(rows, { ctx: { entities: labelling({ ...names, [B]: { label: B, kind: "person" } }, calls) } });
  const r = x.explore({ from: A, at: AT, viewer: V, kinds: ["line:belongs_to", "line:part_of"], depth: 1 });
  const hops = r.paths.flatMap((q) => q.hops);
  assert.deepEqual(hops.map((h) => [h.id, h.from_label, h.to_label]).sort(), [["a-b", "Alice Alder", null], ["a-e", "Alice Alder", null]]);
  assert.ok(!calls.flatMap((c) => c.ids).includes(evt(7)));
  const bare = make(rows).x.explore({ from: A, at: AT, viewer: V, kinds: ["line:belongs_to"], depth: 1 });
  assert.deepEqual(bare.paths.flatMap((q) => q.hops).map((h) => [h.from_label, h.to_label]), [[null, null]]);
});

test("R26 R7 a hop withheld from the viewer leaves every label, the names read and visited as if absent; more than 500 distinct ends are read in reads of at most 500", () => {
  const open = conn("line:belongs_to", A, B, { id: "a-b" });
  const fenced = conn("line:seat_on", A, C, { id: "a-c", seen_by: ["carol"] });
  const table = { ...names, [B]: { label: "Bo Birch", kind: "person" }, [C]: { label: "Cy Cedar", kind: "institution" } };
  const callsA = [], callsB = [];
  const withHidden = make([open, fenced], { ctx: { entities: labelling(table, callsA) } }).x.explore({ from: A, at: AT, viewer: V });
  const without = make([open], { ctx: { entities: labelling(table, callsB) } }).x.explore({ from: A, at: AT, viewer: V });
  assert.deepEqual(strip(withHidden), strip(without));
  assert.ok(!JSON.stringify(withHidden).includes("Cy Cedar") && !JSON.stringify(callsA).includes(C));
  assert.deepEqual(callsA, callsB);
  const wide = Array.from({ length: 700 }, (_, i) => conn("line:belongs_to", A, ent(100 + i), { id: `w-${i}` }));
  const calls = [];
  const g = make(wide, { ctx: { entities: labelling({}, calls) }, opts: { lines: { noHub: true, pageSize: 1000 } } }).x.explore({ from: A, at: AT, viewer: V, depth: 1 });
  assert.equal(g.paths.length, 700);
  assert.ok(calls.length >= 2 && calls.every((c) => c.ids.length <= 500));
  assert.equal(calls.reduce((n, c) => n + c.ids.length, 0), 701);
});

test("R26 overlaps names the ends of both hops of each overlap", () => {
  const P = ent(10), Q = ent(11), S = ent(12);
  const rows = [conn("line:seat_on", P, S, { id: "p-s" }), conn("line:seat_on", Q, S, { id: "q-s" })];
  const { x } = make(rows, { ctx: { entities: labelling({ [P]: { label: "Pat Pine", kind: "person" } }) } });
  const o = x.overlaps({ a: P, b: Q, at: AT, viewer: V, kinds: ["line:seat_on"] });
  assert.equal(o.overlaps.length, 1);
  assert.deepEqual(o.overlaps[0].hops.map((h) => [h.id, h.from_label, h.to_label]), [["p-s", "Pat Pine", null], ["q-s", null, null]]);
});
