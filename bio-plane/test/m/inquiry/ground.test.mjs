/* ground (R27, R28): the act that authors a question's partition of its legs (DEC-32), refused in order, stamping each
   changed group with this member and now, carrying each unchanged group's stamp, moving no state, and answering the
   strength pair before and after through strength's registration. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b", Q = "INQ-2026-0001-q";
function setup(opts = {}) {
  const w = world(opts); w.doc(A); w.doc(B);
  w.inquiry(Q, { legs: [{ target: A }, { target: B }] });
  return w;
}
const g = (w, extra = {}) => w.k.ground({ target: Q, grounds: [{ ground: "g1", legs: [0] }, { ground: "g2", legs: [1] }],
                                          viewer: "admin", author: V("alice"), ...extra });

test("R27 R30 refusals in order: a machine or empty author first (C-32.8), then target, partition, sight, type, case, division, document, legs", () => {
  const caseMembers = new Set();
  const w = setup({ caseMembers });
  const m = g(w, { author: MACHINE });
  assert.equal(m.reason, "MACHINE_CANNOT_GROUND"); assert.equal(m.check, "C-32.8"); assert.ok(m.translation);
  assert.equal(g(w, { target: "" }).reason, "NO_TARGET");
  assert.equal(g(w, { grounds: undefined }).reason, "NO_PARTITION");
  assert.equal(g(w, { viewer: null }).reason, "NO_SUCH_BUNDLE");
  assert.equal(g(w, { target: A }).reason, "NOT_AN_INQUIRY");
  caseMembers.add(Q); assert.equal(g(w).reason, "PUBLISHED_CANNOT_RESTRUCTURE"); caseMembers.delete(Q);
  w.inquiry("INQ-2026-0002-e");
  const nb = g(w, { target: "INQ-2026-0002-e" });
  assert.equal(nb.reason, "NO_BASIS"); assert.equal(nb.check, "C-33.40");
  assert.equal(g(w, { grounds: "x" }).reason, "BAD_PARTITION");
  assert.equal(g(w, { grounds: [7] }).reason, "BAD_PARTITION", "a row not an object");
  assert.equal(g(w, { grounds: [{ ground: "g1", legs: "0" }] }).reason, "BAD_PARTITION");
  assert.equal(g(w, { grounds: [{ ground: "g1", legs: [5] }] }).reason, "BAD_PARTITION", "an ordinal out of range");
  assert.equal(g(w, { grounds: [{ ground: "g1", legs: [0] }, { ground: "g2", legs: [0, 1] }] }).reason, "BAD_PARTITION", "in two groups");
  assert.equal(g(w, { grounds: [{ ground: "g1", legs: [0], statement: "x".repeat(161) }, { ground: "g2", legs: [1] }] }).reason, "BAD_STATEMENT");
  assert.equal(g(w, { grounds: [{ ground: 'bad"label', legs: [0, 1] }] }).reason, "BASIS_REFUSED", "the candidate fails R8");
  assert.equal(g(w, { grounds: [{ ground: "g1", legs: [0] }] }).reason, "BASIS_REFUSED", "half-labelled");
  assert.equal(g(w).ok, true);
  assert.equal(g(w, { reason: "" }).reason, "NO_REASON", "a restructure needs a reason, decided from the record");
  assert.equal(g(w, { reason: "again" }).reason, "PARTITION_UNCHANGED");
  assert.equal(g(w, { reason: 'a "quote"', grounds: [] }).reason, "BAD_REASON");
  w.st.sql.exec(`UPDATE bundles SET current_state='divided' WHERE bundle_id=?`, Q);
  assert.equal(g(w, { reason: "r", grounds: [] }).reason, "DIVIDED_CANNOT_RESTRUCTURE");
});

test("R28 a changed group is stamped with this member and now; an unchanged one keeps its stamp; a caller's asserted_by or at is never read", () => {
  const w = setup();
  w.clock.now = "2026-09-28T01:00:00Z";
  const first = g(w, { grounds: [{ ground: "g1", legs: [0], asserted_by: "member:mallory", at: "1999-01-01T00:00:00Z" }, { ground: "g2", legs: [1] }] });
  assert.equal(first.ok, true, JSON.stringify(first).slice(0, 300)); assert.equal(first.act, "authored");
  const fm1 = w.fm(Q);
  assert.deepEqual(fm1.grounds.map((r) => [r.ground, r.asserted_by, r.at]),
    [["g1", V("alice"), "2026-09-28T01:00:00Z"], ["g2", V("alice"), "2026-09-28T01:00:00Z"]]);
  assert.deepEqual(fm1.basis.map((l) => l.ground), ["g1", "g2"]);
  assert.equal(fm1.current_state, "open", "the state does not move");
  w.clock.now = "2026-09-28T02:00:00Z";
  const second = w.k.ground({ target: Q, reason: "g2 needs a statement", viewer: "admin", author: V("bob"),
    grounds: [{ ground: "g1", legs: [0] }, { ground: "g2", legs: [1], statement: "enough alone" }] });
  assert.equal(second.act, "restructured");
  assert.deepEqual(w.fm(Q).grounds.map((r) => [r.ground, r.asserted_by, r.at]),
    [["g1", V("alice"), "2026-09-28T01:00:00Z"], ["g2", V("bob"), "2026-09-28T02:00:00Z"]], "byte for byte the carried stamp");
  /* removing the partition is a restructure, and the document reads as one never grouped */
  const removed = w.k.ground({ target: Q, grounds: [], reason: "back to weakest", viewer: "admin", author: V("bob") });
  assert.equal(removed.ok, true); assert.equal(removed.grouped, false);
  assert.equal(w.fm(Q).grounds, undefined); assert.ok(w.fm(Q).basis.every((l) => l.ground === undefined));
  assert.match(w.text(Q), /\| Restructured \| member:bob\nTrigger: op=inquiryground on INQ-2026-0001-q\nChanges: grouping removed/);
});

test("R28 R42 the Session Log records the partition, the reason and the pair before; the answer carries the pair before and after (onGrounded)", () => {
  const w = setup();
  const pairs = [{ capture: { state: "graded", grade: "C" }, connection: { state: "undetermined", grade: null } },
                 { capture: { state: "graded", grade: "B" }, connection: { state: "undetermined", grade: null } }];
  let calls = 0;
  w.k.onGrounded("strength", () => pairs[Math.min(calls++, 1)]);
  const r = g(w);
  assert.deepEqual(r.strength, { before: pairs[0], after: pairs[1] });
  assert.match(w.text(Q), /Strength before: capture C, connection undetermined\./);
  assert.match(w.text(Q), /Changes: 2 group\(s\) over 2 leg\(s\) — g1: 0; g2: 1\./);
  /* with nothing registered, the act answers without the field and says so */
  const w2 = setup();
  const r2 = g(w2);
  assert.equal(r2.strength, undefined); assert.match(r2.strength_absent, /no module/);
  assert.match(w2.text(Q), /Strength before: not stated/);
  assert.equal(w.k.onGrounded("again", () => null).reason, "LISTENER_DECLARED");
  assert.equal(w2.k.onGrounded("", () => null).reason, "LISTENER_MALFORMED");
  assert.equal(w2.k.onGrounded("strength", "not a function").reason, "LISTENER_MALFORMED");
});
