/* A leg on an imported finding reference (N522; DEC-112 (6)): another group's finding, accepted by this group, resting
   under a question of its own. Its form is `inquiry-grammar`'s (its R11) and its acceptance `accepted-work`'s (R3–R4,
   registered by that module, which this world does not create); here, what this module does with it: the check passes
   it with no `references[]` entry (R4), the projection names it as spelled with no content row (R12), a division
   carries it (R24) and `earnedBasis` states it (R15). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, inquiryMd } from "./fixture.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";
const P = "INQ-2026-0001-p", Q = "INQ-2026-0004-q", C1 = "INQ-2026-0002-a", C2 = "INQ-2026-0003-b";
const IMP = `imported:${"c".repeat(64)}/INFO-2026-0007-x`;

/* A question resting on A and, at `ord` 1, on IMP at edition 3; `refs` lists A only, unless the caller says otherwise. */
function md(id, { refs = [{ target: A }], legFields = ["    target_edition: 3"], legs = null } = {}) {
  const text = inquiryMd(id, { legs: legs ?? [{ target: A }, { target: IMP }], refs });
  const at = text.indexOf(`  - target: ${IMP}\n    role: supports\n`);
  if (at < 0) return text;
  const cut = at + `  - target: ${IMP}\n    role: supports\n`.length;
  return text.slice(0, cut) + legFields.map((l) => `${l}\n`).join("") + text.slice(cut);
}
const findingsOf = (r) => (r.findings || []).map((f) => `${f.check} ${f.code || ""} ${f.detail || ""}`).join(" | ");

test("R4 a leg on an imported finding reference is admitted with no references[] entry; its form is judged by the grammar's arm, a lead and a theme still first", () => {
  const w = world(); w.doc(A);
  const ok = w.promote(P, md(P));
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 600));
  assert.deepEqual(w.fm(P).references.map((r) => r.target), [A], "the ref is not in references[]");
  /* each departure from the leg's form (inquiry-grammar R11, C-21.3) is refused inside BASIS_REFUSED, nothing written */
  const head = w.record.head(P).bundleSha;
  for (const [why, fields] of [
    ["a grade", ["    target_edition: 3", "    grade: C", "    grade_axis: connection", "    grade_source: hunch",
                 "    author: member:alice", "    date: 2026-09-27"]],
    ["no edition", []],
    ["an edition that is no positive integer", ["    target_edition: 0"]],
    ["a content id", ["    target_edition: 3", `    content_id: ${"d".repeat(64)}`]],
  ]) {
    const r = w.promote(P, md(P, { legFields: fields }));
    assert.equal(r.ok, false, why); assert.equal(r.reason, "BASIS_REFUSED", why);
    assert.ok(r.findings.some((f) => f.check === "C-21.3"), `${why}: ${findingsOf(r)}`);
  }
  const listed = w.promote(P, md(P, { refs: [{ target: A }, { target: IMP }] }));
  assert.equal(listed.reason, "BASIS_REFUSED", "a references[] entry naming a ref is refused");
  assert.ok(listed.findings.some((f) => f.check === "C-21.3"), findingsOf(listed));
  assert.equal(w.record.head(P).bundleSha, head, "nothing was written");
  /* a local target is still asked C-6.3: the ref's arm replaces the target arm for the ref alone */
  const unlisted = w.promote(P, md(P, { refs: [] }));
  assert.equal(unlisted.reason, "BASIS_REFUSED");
  assert.ok(unlisted.findings.some((f) => f.check === "C-6.3"), findingsOf(unlisted));
  /* a lead is refused by name before any other complaint about its leg (C-54.1), beside a ref leg */
  const LEAD = "LEAD-2026-0001-abc";
  const lead = w.promote(P, md(P, { legs: [{ target: LEAD }, { target: IMP }], refs: [{ target: LEAD }] }));
  assert.equal(lead.reason, "BASIS_REFUSED");
  assert.ok(lead.findings.some((f) => f.check === "C-54.1"), findingsOf(lead));
});

test("R12 a leg on an imported finding reference is projected as spelled with no content row, and restingOn, restsOnLive and R40's columns name it", () => {
  const w = world(); w.doc(A);
  const r = w.promote(P, md(P));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 600));
  const rows = w.rows(`SELECT ord, target_id, target_type, role, content_id FROM inquiry_basis WHERE bundle_id=? ORDER BY ord`, P);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].target_id, A); assert.ok(rows[0].content_id, "the document leg has its row");
  assert.deepEqual({ ...rows[1] }, { ord: 1, target_id: IMP, target_type: "", role: "supports", content_id: null });
  assert.ok(!(r.content || []).some((c) => c.ord === 1), "no content row is listed as named, carried or minted for it");
  assert.equal(w.row(`SELECT inquiry_basis_count AS n FROM inquiry_bundle_facts WHERE bundle_id=?`, P).n, 2, "the leg count counts it");
  assert.deepEqual(w.k.basisFor(P).legs.map((l) => l.target_id), [A, IMP]);
  assert.deepEqual(w.k.restingOn(IMP).dependents.map((d) => [d.bundle_id, d.ord, d.status]), [[P, 1, "confirmed"]]);
  const live = w.k.restsOnLive(IMP);
  assert.deepEqual(live.confirmed.map((l) => [l.bundle_id, l.ord]), [[P, 1]]);
  assert.deepEqual([live.frozen, live.severed], [[], []]);
  /* a second question resting on the same ref, and a re-promotion: re-derived whole, still as spelled, still no row */
  assert.equal(w.promote(Q, md(Q)).ok, true);
  assert.equal(w.promote(P, md(P).replace("Is INQ-2026-0001-p answered?\n\n## What", "Is INQ-2026-0001-p answered?\n\nStill.\n\n## What")).ok, true);
  assert.deepEqual(w.rows(`SELECT bundle_id, content_id FROM inquiry_basis WHERE target_id=? ORDER BY bundle_id`, IMP)
    .map((x) => [x.bundle_id, x.content_id]), [[P, null], [Q, null]]);
  /* the cycle guard and the self-basis arm leave it alone: it is no inquiry of this record */
  assert.equal(w.k.cyclePath(P, [IMP]), null);
  /* dropped from the document, dropped from the projection */
  assert.equal(w.promote(P, inquiryMd(P, { legs: [{ target: A }] })).ok, true);
  assert.deepEqual(w.k.restingOn(IMP).dependents.map((d) => d.bundle_id), [Q]);
});

test("R24 R4 a division carries a leg on an imported finding reference verbatim, and writes no references[] entry for it", () => {
  const w = world(); w.doc(A); w.doc(B);
  assert.equal(w.promote(P, md(P, { legs: [{ target: A }, { target: IMP }, { target: B }], refs: [{ target: A }, { target: B }] })).ok, true);
  const r = w.k.divide({ target: P, reason: "two questions", viewer: "admin", author: V("alice"),
    children: [{ id: C1, question: "First half?", legs: [0, 1] }, { id: C2, question: "Second half?", legs: [2] }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 600));
  const f1 = w.fm(C1);
  assert.deepEqual(f1.basis, [w.fm(P).basis[0], w.fm(P).basis[1]], "the legs field for field, the ref's edition among them");
  assert.equal(f1.basis[1].target_edition, 3);
  assert.ok(!f1.references.some((x) => x.target === IMP), "the ref is not cited");
  assert.ok(f1.references.some((x) => x.rel === "cites" && x.target === A));
  assert.deepEqual(w.fm(P).division_apportionment.map((x) => [x.ord, x.target, x.to]), [[0, A, C1], [1, IMP, C1], [2, B, C2]]);
  assert.deepEqual(w.rows(`SELECT ord, target_id, content_id FROM inquiry_basis WHERE bundle_id=? ORDER BY ord`, C1)
    .map((x) => [x.ord, x.target_id, x.content_id === null]), [[0, A, false], [1, IMP, true]]);
});

test("R15 R12 earnedBasis lists a leg on an imported finding reference as the question's own, earning nothing, its null case IMPORTED_TARGET", () => {
  const w = world(); w.doc(A);
  assert.equal(w.promote(P, md(P)).ok, true);
  const e = w.k.earnedBasis({ id: P, viewer: "admin" });
  assert.equal(e.ok, true, JSON.stringify(e).slice(0, 400));
  assert.equal(e.legs_out_of_view, undefined); assert.equal(e.out_of_view, undefined);
  const leg = e.legs.find((l) => l.ord === 1);
  assert.equal(leg.target, IMP); assert.equal(leg.content_id, null); assert.equal(leg.null_case, "IMPORTED_TARGET");
  assert.match(leg.why_no_content, /another group's finding/);
  assert.equal(leg.version, undefined, "no version: this record holds no capture of it");
  assert.ok(e.asked.includes(IMP));
  assert.equal(e.earned.connection[IMP], undefined); assert.equal(e.earned.capture[IMP], undefined);
  assert.equal(w.k.ensureLegContent(P, 1).null_case, "IMPORTED_TARGET");
  /* a viewer who may not see the question is answered as for an absent one (R33), the ref included */
  assert.equal(w.k.earnedBasis({ id: P, viewer: null }).reason, "NO_SUCH_BUNDLE");
});
