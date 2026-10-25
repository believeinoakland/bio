/* partitionOf (R65): a question's partition with the history of its changes, for the question page: the document's
   groups and ungrouped legs, the `ground` acts recorded for it oldest first with the strength pair before and after
   each, the pair now, and a question the viewer may not see answered as an absent one. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { inquiryOps } from "../../../src/inquiry/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b", Q = "INQ-2026-0001-q";
function setup(opts = {}) {
  const w = world(opts); w.doc(A); w.doc(B);
  w.inquiry(Q, { legs: [{ target: A }, { target: B }] });
  return w;
}
const pair = (c, n = "undetermined") => ({ capture: { state: "graded", grade: c }, connection: { state: n, grade: null } });
const P = (w, extra = {}) => w.k.partitionOf({ id: Q, viewer: "admin", ...extra });
const g = (w, extra = {}) => w.k.ground({ target: Q, grounds: [{ ground: "g1", legs: [0] }, { ground: "g2", legs: [1] }],
                                          viewer: "admin", author: V("alice"), ...extra });
const strengthOf = (w, pairs) => { let i = 0; w.k.onGrounded("strength", () => pairs[Math.min(i++, pairs.length - 1)]); };

test("R65 a question grouped, then restructured with a reason: two changes in order, each with both pairs, groups equal to the document's", () => {
  const w = setup();
  const seq = [pair("C"), pair("B"), pair("B"), pair("D")];
  strengthOf(w, seq);
  w.clock.now = "2026-09-28T01:00:00Z";
  assert.equal(g(w).ok, true);
  w.clock.now = "2026-09-28T02:00:00Z";
  const re = w.k.ground({ target: Q, reason: "g2 needs a statement", viewer: "admin", author: V("bob"),
    grounds: [{ ground: "g1", legs: [0] }, { ground: "g2", legs: [1], statement: "enough alone" }] });
  assert.equal(re.ok, true);
  const r = P(w);
  assert.equal(r.ok, true); assert.equal(r.id, Q); assert.equal(r.grouped, true);
  assert.deepEqual(r.ungrouped, []);
  assert.deepEqual(r.groups.map((x) => [x.ground, x.statement, x.asserted_by, x.at, x.legs]),
    [["g1", null, V("alice"), "2026-09-28T01:00:00Z", [0]], ["g2", "enough alone", V("bob"), "2026-09-28T02:00:00Z", [1]]]);
  assert.equal(r.changes.length, 2);
  const [c1, c2] = r.changes;
  assert.deepEqual([c1.at, c1.by, c1.act, c1.reason], ["2026-09-28T01:00:00Z", V("alice"), "authored", null]);
  assert.deepEqual([c2.at, c2.by, c2.act, c2.reason], ["2026-09-28T02:00:00Z", V("bob"), "restructured", "g2 needs a statement"]);
  assert.deepEqual([c1.strength_before, c1.strength_after], [seq[0], seq[1]]);
  assert.deepEqual([c2.strength_before, c2.strength_after], [seq[2], seq[3]]);
  assert.equal(c1.strength_after_recorded, true);
  assert.deepEqual(c2.groups, r.groups, "the last change left the groups the document holds");
  assert.deepEqual(r.strength_now, seq[3]);
  assert.equal(r.strength_absent, undefined);
  assert.ok("projects" in r, "R60: a read of a question answers its projects");
});

test("R65 an ungrouped question answers grouped false and every ordinal ungrouped, with no change", () => {
  const w = setup();
  const r = P(w);
  assert.equal(r.ok, true); assert.equal(r.grouped, false);
  assert.deepEqual(r.groups, []); assert.deepEqual(r.ungrouped, [0, 1]); assert.deepEqual(r.changes, []);
  assert.equal(r.answered, false, "never partitioned");
  /* a partition that leaves a supporting leg out lands: that leg is a necessary leg beside the ground (R85), and ungrouped */
  const part = g(w, { grounds: [{ ground: "g1", legs: [0] }] });
  assert.equal(part.ok, true, JSON.stringify(part).slice(0, 300));
  assert.deepEqual(P(w).ungrouped, [1]);
  assert.equal(g(w, { reason: "both stand alone" }).ok, true);
  assert.equal(w.k.ground({ target: Q, grounds: [], reason: "back", viewer: "admin", author: V("alice") }).ok, true);
  const back = P(w);
  assert.equal(back.grouped, false); assert.deepEqual(back.ungrouped, [0, 1]); assert.deepEqual(back.groups, []);
  assert.equal(back.answered, true, "no ground is an answer, held as grounds: [] (R85)");
  assert.deepEqual(back.changes.map((c) => [c.act, c.groups.map((x) => x.legs)]), [["authored", [[0]]], ["restructured", [[0], [1]]], ["restructured", []]]);
});

test("R65 control: a question the viewer may not see, or that is no question, answers as an absent one; a divided or published question is read", () => {
  const caseMembers = new Set();
  const w = setup({ caseMembers });
  const absent = w.k.partitionOf({ id: "INQ-2026-0009-none", viewer: "admin" });
  assert.deepEqual([absent.ok, absent.reason], [false, "NO_SUCH_BUNDLE"]);
  assert.deepEqual(w.k.partitionOf({ id: Q, viewer: null }), { ok: false, reason: "NO_SUCH_BUNDLE", target: Q }, "no viewer: fail closed");
  const hidden = w.project("Bob's own", "bob");
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, hidden, Q);
  assert.deepEqual(w.k.partitionOf({ id: Q, viewer: V("alice") }), { ok: false, reason: "NO_SUCH_BUNDLE", target: Q },
    "a member who may not see it is told what an absent one is told");
  assert.equal(w.k.partitionOf({ id: Q, viewer: V("bob") }).ok, true, "the member who may see it reads it");
  w.st.sql.exec(`UPDATE bundles SET project=NULL WHERE bundle_id=?`, Q);
  assert.equal(w.k.partitionOf({ id: A, viewer: "admin" }).reason, "NOT_AN_INQUIRY");
  assert.equal(w.k.partitionOf({ viewer: "admin" }).reason, "NO_SUCH_BUNDLE");
  assert.equal(g(w).ok, true);
  caseMembers.add(Q);
  assert.equal(P(w).ok, true, "a published case member is read, not refused");
  w.st.sql.exec(`UPDATE bundles SET current_state='divided' WHERE bundle_id=?`, Q);
  const d = P(w);
  assert.equal(d.ok, true); assert.equal(d.changes.length, 1, "a divided question is read, not refused");
});

test("R65 where no module answers strength the pairs are null and strength_absent says so", () => {
  const w = setup();
  assert.equal(g(w).ok, true);
  const r = P(w);
  assert.equal(r.changes.length, 1);
  assert.equal(r.changes[0].strength_before, null); assert.equal(r.changes[0].strength_after, null);
  assert.equal(r.strength_now, null);
  assert.equal(r.strength_absent, word("inquiry.strength_absent"));
});

test("R65 an act made before the table records it is read from the Session Log with its pair before and no pair after, never computed", () => {
  const w = setup();
  strengthOf(w, [pair("C"), pair("B"), pair("B"), pair("A")]);
  w.clock.now = "2026-09-28T01:00:00Z"; assert.equal(g(w).ok, true);
  w.clock.now = "2026-09-28T02:00:00Z";
  assert.equal(w.k.ground({ target: Q, reason: "swap them", viewer: "admin", author: V("bob"),
    grounds: [{ ground: "g1", legs: [1] }, { ground: "g2 b", legs: [0] }] }).ok, true);
  const fresh = P(w);
  w.st.sql.exec(`DELETE FROM inquiry_ground_changes WHERE bundle_id=?`, Q);   /* as a store grouped before the table */
  const old = P(w);
  assert.equal(old.ok, true); assert.equal(old.changes.length, 2);
  const [c1, c2] = old.changes;
  assert.deepEqual([c1.at, c1.by, c1.act, c1.reason], ["2026-09-28T01:00:00Z", V("alice"), "authored", null]);
  assert.deepEqual([c2.at, c2.by, c2.act, c2.reason], ["2026-09-28T02:00:00Z", V("bob"), "restructured", "swap them"]);
  assert.deepEqual(c1.groups.map((x) => [x.ground, x.legs]), [["g1", [0]], ["g2", [1]]]);
  assert.deepEqual(c2.groups.map((x) => [x.ground, x.legs]), [["g1", [1]], ["g2 b", [0]]]);
  assert.deepEqual([c1.strength_before, c2.strength_before], [pair("C"), pair("B")], "the pair before, as the log holds it");
  assert.deepEqual([c1.strength_after, c2.strength_after], [null, null]);
  assert.deepEqual([c1.strength_after_recorded, c2.strength_after_recorded], [false, false]);
  assert.deepEqual(fresh.changes.map((c) => c.strength_after_recorded), [true, true], "the same acts, recorded, keep both pairs");
  assert.deepEqual(fresh.changes.map((c) => [c.at, c.by, c.act, c.reason]), old.changes.map((c) => [c.at, c.by, c.act, c.reason]));
});

test("R65 the read writes nothing, a refused act records no change, and the op routes to it", () => {
  const w = setup();
  assert.equal(g(w).ok, true);
  const count = () => [...w.st.sql.exec(`SELECT COUNT(*) AS n FROM inquiry_ground_changes`)][0].n;
  const log = w.text(Q), n = count();
  P(w); P(w, { viewer: null });
  assert.equal(count(), n); assert.equal(w.text(Q), log);
  assert.equal(g(w, { reason: "again" }).reason, "PARTITION_UNCHANGED");
  assert.equal(g(w, { grounds: [{ ground: 'bad"label', legs: [0, 1] }], reason: "r" }).reason, "BASIS_REFUSED");
  assert.equal(count(), n, "a refused act leaves no change behind");
  const ops = inquiryOps(w.k, new URL(`http://x/?id=${Q}&viewer=admin`), null);
  assert.equal(typeof ops.inquirypartition, "function");
  assert.deepEqual(ops.inquirypartition(), P(w));
});
