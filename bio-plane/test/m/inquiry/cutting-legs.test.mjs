/* cutting legs (R85, K4194): a partition labels supporting legs only. A leg that cuts against is never in a ground, so
   the grounds are never made sufficient by one; it stays in the basis, unlabelled. Driven at the interface (`ground`,
   `divide`, `partitionOf`) over a real document and the real projection. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b", C = "INFO-2026-0003-c";
const Q = "INQ-2026-0001-q", C1 = "INQ-2026-0002-a", C2 = "INQ-2026-0003-b";
const ground = (w, grounds, extra = {}) => w.k.ground({ target: Q, grounds, viewer: "admin", author: V("alice"), ...extra });
function oneAgainst() {
  const w = world(); w.doc(A); w.doc(B);
  w.inquiry(Q, { legs: [{ target: A }, { target: B, role: "cuts_against" }] });
  return w;
}
function twoAndOneAgainst() {
  const w = world(); w.doc(A); w.doc(B); w.doc(C);
  w.inquiry(Q, { legs: [{ target: A }, { target: B }, { target: C, role: "cuts_against" }] });
  return w;
}
const roleGround = (w, id = Q) => w.rows(`SELECT ord, role, ground FROM inquiry_basis WHERE bundle_id=? ORDER BY ord`, id)
  .map((r) => [r.ord, r.role, r.ground]);

test("R85 a question with one supporting and one cutting leg accepts a one-part partition of the supporting leg; the cutting leg stays unlabelled", () => {
  const w = oneAgainst();
  const r = ground(w, [{ ground: "g1", legs: [0] }]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  assert.equal(r.grouped, true);
  const fm = w.fm(Q);
  assert.equal(fm.basis[0].ground, "g1");
  assert.equal(fm.basis[1].role, "cuts_against");
  assert.equal(fm.basis[1].ground, undefined, "the cutting leg names no ground");
  assert.deepEqual(fm.grounds.map((x) => x.ground), ["g1"]);
  /* what strength reads: the projection holds the label on the supporting leg alone, so the grounds hold no cutting leg */
  assert.deepEqual(roleGround(w), [[0, "supports", "g1"], [1, "cuts_against", null]]);
  const p = w.k.partitionOf({ id: Q, viewer: "admin" });
  assert.deepEqual(p.groups.map((g) => g.legs), [[0]]);
  assert.deepEqual(p.ungrouped, [1], "the cutting leg is among the legs that name no ground");
});

test("R85 a partition leaving a supporting leg out lands: that leg is a necessary leg beside the ground, and the cutting leg stays unlabelled", () => {
  const w = twoAndOneAgainst();
  const r = ground(w, [{ ground: "g1", legs: [0] }]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  assert.deepEqual(roleGround(w), [[0, "supports", "g1"], [1, "supports", null], [2, "cuts_against", null]]);
  assert.deepEqual(w.k.partitionOf({ id: Q, viewer: "admin" }).ungrouped, [1, 2]);
  /* and every supporting leg covered lands as before, the cutting leg unlabelled */
  const ok = ground(w, [{ ground: "g1", legs: [0] }, { ground: "g2", legs: [1] }], { reason: "each stands alone" });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 500));
  assert.deepEqual(roleGround(w), [[0, "supports", "g1"], [1, "supports", "g2"], [2, "cuts_against", null]]);
});

test("R85 control: a partition naming the cutting leg is refused with the finding named in findings, not the bare code, and nothing is written", () => {
  const w = oneAgainst();
  const before = w.text(Q), sha = w.record.head(Q).bundleSha;
  const r = ground(w, [{ ground: "g1", legs: [0, 1] }]);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "BASIS_REFUSED");
  assert.equal(r.findings.length, 1);
  assert.equal(r.findings[0].check, "C-2.8");
  assert.equal(r.findings[0].ord, 1, "the finding names the leg");
  assert.equal(r.findings[0].target, B);
  assert.equal(typeof r.findings[0].detail, "string");
  assert.ok(r.findings[0].detail.length > 0);
  assert.equal(w.text(Q), before);
  assert.equal(w.record.head(Q).bundleSha, sha);
  /* the same leg, a supporting one, is grouped without complaint (the refusal is the role's) */
  const w2 = world(); w2.doc(A); w2.doc(B);
  w2.inquiry(Q, { legs: [{ target: A }, { target: B }] });
  assert.equal(ground(w2, [{ ground: "g1", legs: [0, 1] }]).ok, true);
});

test("R85 R34 a division gives a child the supporting legs of a group and a cutting leg, and the child carries the group whole", () => {
  const w = twoAndOneAgainst();
  assert.equal(ground(w, [{ ground: "g1", legs: [0] }, { ground: "g2", legs: [1] }]).ok, true);
  w.clock.now = "2026-09-29T00:00:00Z";
  const r = w.k.divide({ target: Q, reason: "two questions", viewer: "admin", author: V("bob"),
    children: [{ id: C1, question: "First half?", legs: [0, 2] }, { id: C2, question: "Second half?", legs: [1, 2] }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 600));
  const pf = w.fm(Q), f1 = w.fm(C1), f2 = w.fm(C2);
  assert.deepEqual(f1.grounds, [pf.grounds[0]], "the group travels verbatim, its row and its stamp");
  assert.deepEqual(f2.grounds, [pf.grounds[1]]);
  assert.deepEqual(roleGround(w, C1), [[0, "supports", "g1"], [1, "cuts_against", null]]);
  assert.deepEqual(roleGround(w, C2), [[0, "supports", "g2"], [1, "cuts_against", null]]);
  /* control: a child holding part of a group still carries no partition (R24) */
  const w2 = world(); w2.doc(A); w2.doc(B); w2.doc(C);
  w2.inquiry(Q, { legs: [{ target: A }, { target: B }, { target: C, role: "cuts_against" }] });
  assert.equal(ground(w2, [{ ground: "g1", legs: [0, 1] }]).ok, true);
  const r2 = w2.k.divide({ target: Q, reason: "two questions", viewer: "admin", author: V("bob"),
    children: [{ id: C1, question: "First half?", legs: [0, 2] }, { id: C2, question: "Second half?", legs: [1, 2] }] });
  assert.equal(r2.ok, true, JSON.stringify(r2).slice(0, 600));
  assert.equal(w2.fm(C1).grounds, undefined);
  assert.deepEqual(roleGround(w2, C1), [[0, "supports", null], [1, "cuts_against", null]]);
});
