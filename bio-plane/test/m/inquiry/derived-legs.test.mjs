/* R4 (T34-29; N582, K1607; inquiry-grammar R17): a leg may rest on a derived connection's id with its five `derivation_*`
   fields. The leg's form is inquiry-grammar's to judge (its R17), whether the connection re-derives hypotheses' (its R6);
   this module admits it, never lists it in references[], projects it as spelled, and a division carries it verbatim
   without making it a references[] entry. The id is computed here as connection-grammar's `derivedId` computes it (its
   R11): SHA-256 of the five fields' canonical JSON (sorted keys). */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, inquiryMd, V } from "./fixture.mjs";

const Q = "INQ-2026-0951-q", C1 = "INQ-2026-0952-a", C2 = "INQ-2026-0953-b", DOC = "INFO-2026-0951-d";
const F = { kind: "same_person", from: "ENT-2026-0001", to: "ENT-2026-0002", as_of: "2026-09-01", method: "chain" };
const derivedId = (f) => createHash("sha256").update(JSON.stringify(Object.fromEntries(Object.entries(f)
  .sort(([a], [b]) => (a < b ? -1 : 1))))).digest("hex");
const D = derivedId(F);
const lines = (f = F) => [`    derivation_kind: ${f.kind}`, `    derivation_from: ${f.from}`, `    derivation_to: ${f.to}`,
                          `    derivation_as_of: "${f.as_of}"`, `    derivation_method: ${f.method}`].join("\n");
const withDerivation = (md, target, f) => md.replace(`  - target: ${target}\n    role: supports`, `  - target: ${target}\n    role: supports\n${lines(f)}`);

test("R4 T34-29 a leg on a derived connection's id with its five derivation_* fields is admitted, listed nowhere in references[], and projected as spelled", () => {
  const w = world(); w.member("alice");
  const md = withDerivation(inquiryMd(Q, { legs: [{ target: D }], refs: [] }), D);
  const r = w.promote(Q, md, null, { author: V("alice") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  assert.deepEqual(w.k.basisFor(Q).legs.map((l) => [l.target_id, l.content_id ?? null]), [[D, null]]);
  assert.deepEqual(w.fm(Q).references ?? [], []);
});

test("R4 T34-29 a derived leg stating a grade, or whose id is not its derivation's, is refused inside BASIS_REFUSED (inquiry-grammar R17); nothing is written", () => {
  const w = world(); w.member("alice");
  const graded = withDerivation(inquiryMd(Q, { legs: [{ target: D, grade: "B", grade_axis: "connection", grade_source: "hunch",
    author: V("alice"), date: "2026-09-27" }], refs: [] }), D);
  const r1 = w.promote(Q, graded, null, { author: V("alice") });
  assert.equal(r1.reason, "BASIS_REFUSED", JSON.stringify(r1).slice(0, 400));
  const other = withDerivation(inquiryMd(Q, { legs: [{ target: D }], refs: [] }), D, { ...F, to: "ENT-2026-0003" });
  const r2 = w.promote(Q, other, null, { author: V("alice") });
  assert.equal(r2.reason, "BASIS_REFUSED", JSON.stringify(r2).slice(0, 400));
  assert.equal(w.record.head(Q), null);
});

test("R4 R24 T34-29 a division carries a derived leg verbatim, its derivation fields with it, and never lists it in a child's references[]", () => {
  const w = world(); w.member("alice");
  w.doc(DOC);
  const md = withDerivation(inquiryMd(Q, { legs: [{ target: D }, { target: DOC }], refs: [{ target: DOC, rel: "cites" }] }), D);
  assert.equal(w.promote(Q, md, null, { author: V("alice") }).ok, true);
  const r = w.k.divide({ target: Q, reason: "two questions", viewer: V("alice"), author: V("alice"),
    children: [{ id: C1, question: "First half?", legs: [0] }, { id: C2, question: "Second half?", legs: [1] }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  const f = w.fm(C1);
  assert.deepEqual(f.basis.map((l) => [l.target, l.derivation_kind, l.derivation_from, l.derivation_to, l.derivation_as_of,
    l.derivation_method]), [[D, F.kind, F.from, F.to, F.as_of, F.method]]);
  assert.deepEqual(f.references.map((x) => [x.target, x.rel]), [[Q, "supersedes"]]);
  assert.deepEqual(w.fm(C2).references.filter((x) => x.rel === "cites").map((x) => x.target), [DOC]);
});
