/* divide (R23–R26): a question declared two questions, every leg re-homed on children that supersede it, the parent and
   every child landing together. And the machine fence on the acts that restructure (R30). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, inquiryMd } from "./fixture.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";
const P = "INQ-2026-0001-p", C1 = "INQ-2026-0002-a", C2 = "INQ-2026-0003-b";
const kids = (a = [0], b = [1]) => [{ id: C1, question: "First half?", legs: a }, { id: C2, question: "Second half?", legs: b }];
function setup(opts = {}) {
  const w = world(opts); w.doc(A); w.doc(B);
  w.inquiry(P, { legs: [{ target: A }, { target: B, role: "cuts_against" }] });
  return w;
}
const div = (w, extra = {}) => w.k.divide({ target: P, reason: "two questions", children: kids(), viewer: "admin", author: V("alice"), ...extra });

test("R23 R30 refusals in order, each writing nothing: a machine or empty author first (C-32.7)", () => {
  const caseMembers = new Set();
  const w = setup({ caseMembers });
  const sha = w.record.head(P).bundleSha;
  const m = div(w, { author: MACHINE });
  assert.equal(m.reason, "MACHINE_CANNOT_DIVIDE"); assert.equal(m.check, "C-32.7"); assert.ok(m.translation);
  assert.equal(div(w, { author: "" }).reason, "MACHINE_CANNOT_DIVIDE");
  assert.equal(div(w, { reason: " " }).reason, "NO_REASON");
  assert.equal(div(w, { reason: "x".repeat(501) }).reason, "BAD_REASON");
  assert.equal(div(w, { target: "" }).reason, "NO_TARGET");
  assert.equal(div(w, { target: "INQ-2026-0099-x" }).reason, "NO_SUCH_BUNDLE");
  assert.equal(div(w, { viewer: null }).reason, "NO_SUCH_BUNDLE", "invisible answers as absent");
  assert.equal(div(w, { target: A }).reason, "NOT_AN_INQUIRY");
  caseMembers.add(P);
  assert.equal(div(w).reason, "PUBLISHED_CANNOT_DIVIDE");
  caseMembers.delete(P);
  w.inquiry("INQ-2026-0009-u", { legs: [{ target: P }] });
  assert.equal(div(w).reason, "CITED", "a confirmed live leg rests on it");
  w.promote("INQ-2026-0009-u", w.text("INQ-2026-0009-u").replace("status: confirmed", "status: severed"));
  assert.equal(div(w, { children: kids().slice(0, 1) }).reason, "TOO_FEW_CHILDREN");
  assert.equal(div(w, { children: [{ ...kids()[0], id: "nope" }, kids()[1]] }).reason, "BAD_CHILD_ID");
  assert.equal(div(w, { children: [kids()[0], { ...kids()[1], id: C1 }] }).reason, "BAD_CHILD_ID", "repeated");
  assert.equal(div(w, { children: [kids()[0], { ...kids()[1], id: P }] }).reason, "BAD_CHILD_ID", "the parent");
  w.inquiry(C2);
  assert.equal(div(w).reason, "CHILD_EXISTS");
  w.record.purge({ bundleId: C2 });
  assert.equal(div(w, { children: [kids()[0], { ...kids()[1], question: "" }] }).reason, "NO_CHILD_QUESTION");
  assert.equal(div(w, { children: [kids()[0], { ...kids()[1], question: 'a "q"' }] }).reason, "BAD_CHILD_QUESTION");
  assert.equal(div(w, { children: kids([0], []) }).reason, "NO_APPORTIONMENT", "a child given none");
  const orphan = div(w, { children: kids([0], [0]) });
  assert.equal(orphan.reason, "NO_APPORTIONMENT"); assert.equal(orphan.cuts_against_orphans, 1, "orphans that cut against are counted");
  assert.equal(div(w, { children: kids([0], [7]) }).reason, "BAD_APPORTIONMENT");
  assert.equal(w.record.head(P).bundleSha, sha, "nothing moved");
});

test("R23 the producing group undetermined, and CHILD_REFUSED when a child's document fails the grammar", () => {
  /* no recorded group, and a parent document written before documents named one (its bytes edited as a legacy store holds them) */
  const w = setup();
  w.groupRef.value = null;
  w.st.sql.exec(`UPDATE files SET content = replace(content, 'group: test-group' || char(10), '') WHERE bundle_id=? AND path='bundle.md'`, P);
  const g = w.k.divide({ target: P, reason: "two", children: kids(), viewer: "admin", author: V("alice") });
  assert.equal(g.reason, "GROUP_UNDETERMINED"); assert.equal(g.check, "C-64.1"); assert.equal(w.record.head(C1), null);
  /* a leg the children would carry that the grammar refuses: a resolution grade with no subject */
  const w3 = world(); w3.doc(A); w3.doc(B);
  w3.inquiry(P, { legs: [{ target: A }, { target: B }] });
  w3.promote(P, w3.text(P).replace("    role: supports\n", "    role: supports\n    grade: B\n    grade_axis: connection\n    grade_source: resolution\n"), undefined, { replay: true });
  const cr = w3.k.divide({ target: P, reason: "two", children: kids(), viewer: "admin", author: V("alice") });
  assert.equal(cr.reason, "CHILD_REFUSED"); assert.ok(cr.findings.length);
  assert.equal(w3.record.head(C1), null);
});

test("R24 R25 R34 the parent moves to divided with where every leg went; each child open, titled, carrying its legs, disclosing parent and siblings", () => {
  const w = setup(); w.listen();
  const r = div(w);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const pf = w.fm(P);
  assert.equal(pf.current_state, "divided"); assert.equal(pf.prior_state, "open");
  assert.deepEqual([pf.division.reason, pf.division.apportioned_by, pf.division.into], ["two questions", V("alice"), [C1, C2]]);
  assert.deepEqual(pf.division_apportionment.map((x) => [x.ord, x.target, x.role, x.to]),
    [[0, A, "supports", C1], [1, B, "cuts_against", C2]], "every leg, including the one that cuts against (R34)");
  for (const [id, leg, sib] of [[C1, A, C2], [C2, B, C1]]) {
    const f = w.fm(id);
    assert.equal(f.current_state, "open"); assert.equal(f.title, id === C1 ? "First half?" : "Second half?");
    assert.deepEqual(f.basis.map((l) => l.target), [leg]);
    assert.ok(f.references.some((x) => x.rel === "supersedes" && x.target === P && x.reason === "two questions"));
    assert.ok(f.references.some((x) => x.rel === "cites" && x.target === leg));
    assert.equal(f.division_parent, P); assert.deepEqual(f.division_siblings, [sib]);
    assert.equal(f.conclusion, ""); assert.equal(f.disposition_reason, "");
  }
  assert.equal(w.fm(C2).basis[0].role, "cuts_against");
  assert.deepEqual(r.children.map((c) => c.id), [C1, C2]);
  assert.deepEqual(r.apportionment.map((a) => a.to), [[C1], [C2]]);
  assert.equal(r.cuts_against, 1);
  assert.equal(r.reevaluation.source, "supersession"); assert.deepEqual(w.raisedCalls.map((c) => [c.target, c.cause]), [[P, "supersession"]]);
  assert.deepEqual(w.k.supersededBy(P), [C1, C2]);
});

test("R26 the parent and every child land together or none does", () => {
  const w = setup();
  const sha = w.record.head(P).bundleSha;
  /* the second child's creation is refused inside the act (its id is taken between the pre-flight and the write) */
  const realPromote = w.promotion.promote.bind(w.promotion);
  w.promotion.promote = (pkg) => (pkg.bundleId === C2 ? { ok: false, reason: "OVERSIZE_INLINE", detail: "too big" } : realPromote(pkg));
  const r = div(w);
  w.promotion.promote = realPromote;
  assert.equal(r.ok, false); assert.equal(r.reason, "OVERSIZE_INLINE"); assert.equal(r.child, C2);
  assert.equal(w.record.head(P).bundleSha, sha, "the parent rolled back");
  assert.equal(w.fm(P).current_state, "open");
  assert.equal(w.record.head(C1), null, "the first child rolled back");
  assert.equal(r.created, undefined, "no partial answer");
});
