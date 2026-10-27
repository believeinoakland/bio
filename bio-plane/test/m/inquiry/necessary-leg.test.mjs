/* R8 R85 (fix round 10, cause 30b; K5056; DEC-32 clause 4): a supporting leg without a ground label is a necessary leg
   beside the grounds, and a saved partition with no ground is held as such. Driven at the interface (`ground`,
   `partitionOf`) over a real document and the real projection; `strength` reads the projection. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b", C = "INFO-2026-0003-c";
const Q = "INQ-2026-0001-q";
const ground = (w, grounds, extra = {}) => w.k.ground({ target: Q, grounds, viewer: "admin", author: V("alice"), ...extra });
function twoLegs() {
  const w = world(); w.doc(A); w.doc(B);
  w.inquiry(Q, { legs: [{ target: A }, { target: B }] });
  return w;
}
const projection = (w) => w.rows(`SELECT ord, role, ground FROM inquiry_basis WHERE bundle_id=? ORDER BY ord`, Q);

test("R8 R85 one unlabelled necessary leg beside one labelled ground is stored by ground and the projection holds the label on the grounded leg alone", () => {
  const w = twoLegs();
  const r = ground(w, [{ ground: "the minutes", legs: [0] }]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  assert.equal(r.grouped, true);
  const fm = w.fm(Q);
  assert.deepEqual(fm.basis.map((l) => l.ground), ["the minutes", undefined], "the second leg is necessary: it names no ground");
  assert.deepEqual(fm.grounds.map((g) => g.ground), ["the minutes"]);
  /* what strength reads is the projection (inquiry_basis): the label on the grounded leg alone, so the other supporting leg
     is the implicit necessary part and the ground the other; strength's own tests judge its arithmetic over them */
  assert.deepEqual(projection(w).map((p) => [p.ord, p.role, p.ground]), [[0, "supports", "the minutes"], [1, "supports", null]]);
});

test("R8 R85 two supporting legs, one named in a ground and one not, is the same partition whichever leg is left out", () => {
  const w = twoLegs();
  assert.equal(ground(w, [{ ground: "g2", legs: [1] }]).ok, true);
  assert.deepEqual(projection(w).map((p) => p.ground), [null, "g2"]);
  const p = w.k.partitionOf({ id: Q, viewer: "admin" });
  assert.deepEqual([p.grouped, p.groups.map((g) => g.legs), p.ungrouped], [true, [[1]], [0]]);
});

test("R8 R85 R65 a saved partition with no ground is held as grounds: [] and reads back as answered, distinct from a question never partitioned", () => {
  const w = twoLegs();
  const never = w.k.partitionOf({ id: Q, viewer: "admin" });
  assert.deepEqual([never.grouped, never.groups, never.ungrouped, never.answered], [false, [], [0, 1], false]);
  assert.equal(w.fm(Q).grounds, undefined);
  /* first authorship: nothing was there, so no reason is asked */
  const r = ground(w, []);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  assert.equal(r.act, "authored");
  assert.deepEqual(w.fm(Q).grounds, [], "held, not removed");
  assert.match(w.text(Q), /^grounds: \[\]$/m);
  assert.deepEqual(projection(w).map((p) => p.ground), [null, null], "every supporting leg is necessary");
  const p = w.k.partitionOf({ id: Q, viewer: "admin" });
  assert.deepEqual([p.ok, p.grouped, p.answered, p.groups, p.ungrouped], [true, false, true, [], [0, 1]]);
  assert.deepEqual(p.changes.map((c) => [c.act, c.groups]), [["authored", []]]);
  /* the same answer again changes nothing */
  assert.equal(ground(w, [], { reason: "again" }).reason, "PARTITION_UNCHANGED");
  /* a ground can then be authored over it (a restructure, with its reason), and the empty answer given again */
  assert.equal(ground(w, [{ ground: "g1", legs: [0] }]).reason, "NO_REASON");
  assert.equal(ground(w, [{ ground: "g1", legs: [0] }], { reason: "the first leg suffices alone" }).ok, true);
  assert.equal(ground(w, [], { reason: "it does not" }).ok, true);
  assert.deepEqual(w.fm(Q).grounds, []);
  assert.deepEqual(w.k.partitionOf({ id: Q, viewer: "admin" }).changes.map((c) => c.act), ["authored", "restructured", "restructured"]);
});

/* R85's case (one labelled ground beside one unlabelled necessary leg, concluded on its own reading) is proven by basis-versions'
   test "R51, R3 (K5077): a question of one labelled ground and one unlabelled supporting leg concludes on its own reading". */
