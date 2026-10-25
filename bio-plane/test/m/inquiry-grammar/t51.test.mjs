/* inquiry-grammar T51 (CR-8): R13's exported standard-leg checker and R19's corpus and golden answers for the version-name
   codes. Findings are stated by hand or read from `golden.json` (regenerated in this change by the corpus's own step,
   never by hand). Pure; no network, no clock. */
import test from "node:test";
import assert from "node:assert/strict";
import * as IG from "../../../src/inquiry-grammar/index.mjs";
import * as Grammar from "../../../src/inquiry-grammar/grammar.mjs";
import { localize } from "../../../src/setup-words/index.mjs";
import { BUNDLE_CASES, REGISTRY_VARIANTS, INFO } from "./corpus.mjs";
import { GOLDEN, run, plain } from "./fixture.mjs";

const STD = "STD-2026-0001-law";
const leg = (o) => ({ target: STD, role: "supports", ...o });
const refs = [{ target: STD }];
const basisOf = (l, label = "basis[0]") => plain(run((f) => IG.checkInquiryBasis({ object_type: "inquiry", references: refs, basis: [l] }, f, null, null)).findings);

test("R13 standardLegFindings is exported by name from the module and from its grammar file, the same binding, and is the checker R4's standard arm calls: same findings, same answer", () => {
  assert.equal(typeof IG.standardLegFindings, "function");
  assert.equal(IG.standardLegFindings, Grammar.standardLegFindings);
  for (const l of [leg({ grade_axis: "connection", grade: "B", grade_source: "resolution" }), leg({ grade_axis: "testimony", grade: "D", grade_source: "testimony" }),
                   leg({ grade_axis: "capture", grade: "B", grade_source: "hunch", author: "a", date: "2026-07-01" }),
                   leg({ target_portion: "" }), leg({ target_portion: "x".repeat(2000) })]) {
    const own = run((f) => IG.standardLegFindings("basis[0]", l, f));
    const inBasis = basisOf(l).filter((x) => own.findings.some((y) => y.message === x.message));
    assert.deepEqual(inBasis, plain(own.findings), JSON.stringify(l));
    assert.equal(own.answer, own.findings.some((x) => x.code === "STANDARD_LEG_AXIS"));
  }
  assert.equal(run((f) => IG.standardLegFindings("basis[0]", leg({ grade_axis: "connection" }), f)).answer, true);
});

test("R13 control: a capture-axis standard leg raises nothing of its own, and the answer is false", () => {
  const r = run((f) => IG.standardLegFindings("basis[0]", leg({ grade_axis: "capture", grade: "B", grade_source: "capture", target_portion: "section 2" }), f));
  assert.deepEqual(r.findings, []);
  assert.equal(r.answer, false);
});

const codes = (id, key = "versions") => GOLDEN.bundles[id][key].map((x) => [x.check, x.code]);
const has = (id, code, check, key) => codes(id, key).some(([c, k]) => k === code && c === check);

test("R19 a 65-character version name answers VERSION_NAME_MALFORMED (C-25.36) and not VERSION_NAME_NOT_UNIQUE; the golden and every composite carry it", () => {
  const id = "INQ-2026-0133-version-name-long";
  assert.equal(BUNDLE_CASES[id].basis_versions[0].name.length, 65);
  for (const key of ["versions", ...Object.keys(REGISTRY_VARIANTS)]) {
    assert.ok(has(id, "VERSION_NAME_MALFORMED", "C-25.36", key), key);
    assert.ok(!codes(id, key).some(([, k]) => k === "VERSION_NAME_NOT_UNIQUE"), key);
  }
  const bad = "INQ-2026-0131-versions-bad";                                // an empty name is outside the form too
  assert.ok(has(bad, "VERSION_NAME_MALFORMED", "C-25.36"));
  assert.ok(!codes(bad).some(([, k]) => k === "VERSION_NAME_NOT_UNIQUE"));
});

test("R19 a name another version of the question already carries answers VERSION_NAME_NOT_UNIQUE (C-25.2) and not VERSION_NAME_MALFORMED", () => {
  const id = "INQ-2026-0134-version-name-twice";
  const names = BUNDLE_CASES[id].basis_versions.map((v) => v.name);
  assert.equal(new Set(names).size, 1, "two versions, one valid name");
  for (const key of ["versions", ...Object.keys(REGISTRY_VARIANTS)]) {
    assert.ok(has(id, "VERSION_NAME_NOT_UNIQUE", "C-25.2", key), key);
    assert.ok(!codes(id, key).some(([, k]) => k === "VERSION_NAME_MALFORMED"), key);
  }
});

test("R19 control: a valid unique name raises neither, and no other corpus case holds either code", () => {
  assert.ok(!codes("INQ-2026-0129-versions").some(([, k]) => /^VERSION_NAME_/.test(k)));
  const holders = Object.keys(GOLDEN.bundles).filter((id) => codes(id).some(([, k]) => /^VERSION_NAME_/.test(k))).sort();
  assert.deepEqual(holders, ["INQ-2026-0131-versions-bad", "INQ-2026-0133-version-name-long", "INQ-2026-0134-version-name-twice"]);
});

/* R68 (K4194): a leg that cuts against is never in a ground; the totality counts the supporting legs only. */
const AT68 = "2026-07-01T00:00:00Z";
const G_A = { ground: "a", asserted_by: "member:a", at: AT68 };
const SUP = (o) => ({ target: INFO, role: "supports", ...o });
const CUT = (o) => ({ target: INFO, role: "cuts_against", ...o });
const grounded = (basis, grounds) => plain(run((f) => IG.checkInquiryBasis(
  { id: "INQ-2026-0001-q", object_type: "inquiry", references: [{ target: INFO, rel: "cites" }], basis, grounds }, f, null, null)).findings);

test("R68 one supporting leg in a declared ground and one cutting leg with none is clean: the partition is the supporting leg alone", () => {
  assert.deepEqual(grounded([SUP({ ground: "a" }), CUT({})], [G_A]), []);
  assert.deepEqual(grounded([CUT({}), SUP({ ground: "a" })], [G_A]), [], "order does not matter");
  assert.deepEqual(grounded([SUP({ ground: "a" }), CUT({}), CUT({})], [G_A]), []);
});

test("R68 (fix round 10, cause 30b) one unlabelled supporting leg beside one labelled ground is clean: it is a necessary leg, and the basis is no longer grouped whole or not at all", () => {
  for (const basis of [[SUP({ ground: "a" }), SUP({})], [SUP({}), SUP({ ground: "a" })], [SUP({ ground: "a" }), SUP({}), CUT({})],
                       [SUP({ ground: "a" }), SUP({}), SUP({}), SUP({ ground: "b" })]]) {
    const grounds = basis.some((l) => l.ground === "b") ? [G_A, { ...G_A, ground: "b" }] : [G_A];
    assert.deepEqual(grounded(basis, grounds), [], JSON.stringify(basis));
  }
});

test("R68 (fix round 10, cause 30b) control: a ground no leg carries, a leg naming an undeclared ground, a duplicated row and a malformed label are each still refused", () => {
  const noLeg = grounded([SUP({}), SUP({})], [G_A]);
  assert.equal(noLeg.length, 1, "declared, no basis leg belongs to it");
  assert.equal(noLeg[0].check, "C-2.8");
  const undeclared = grounded([SUP({ ground: "a" }), SUP({})], []);
  assert.ok(undeclared.length >= 1 && undeclared.every((x) => x.check === "C-2.8"), "a leg naming a ground no row declares");
  assert.equal(grounded([SUP({ ground: "a" }), SUP({})], [G_A, G_A]).length, 1, "a ground declared twice");
  assert.equal(grounded([SUP({ ground: "a" }), SUP({ ground: "b!" })], [G_A]).length >= 1, true, "a label outside the form");
});

test("R68 a cutting leg that names a ground is refused with its own finding naming the leg and the label, and the label does not count for it", () => {
  const r = grounded([SUP({ ground: "a" }), CUT({ ground: "a" })], [G_A]);
  assert.equal(r.length, 1);
  assert.equal(r[0].check, "C-2.8");
  assert.equal(r[0].severity, "error");
  assert.ok(r[0].message.includes("basis[1]") && r[0].message.includes("'a'"), r[0].message);
  const alone = grounded([SUP({}), CUT({ ground: "b" })], [{ ...G_A, ground: "b" }]);
  assert.ok(alone.some((x) => x.message.includes("basis[1]")), "the cutting leg is named");
  assert.equal(alone.length, 2, "the cutting leg's own finding, and the row whose label no supporting leg carries");
});

test("R68 control: a basis with no cutting leg is judged as before, and a cutting leg with no ground raises nothing without a grounds block either", () => {
  assert.deepEqual(grounded([SUP({ ground: "a" }), SUP({ ground: "a" })], [G_A]), []);
  assert.equal(grounded([SUP({ ground: "a" })], undefined).length, 1);
  assert.deepEqual(grounded([SUP({}), CUT({})], undefined), []);
});

/* R4 (fix round 9, G167; K4985): the leg's extent is judged by content's ten kinds, `doc-part` among them. */
const extentOf = (l) => plain(run((f) => IG.checkLegExtentGrammar(l, "basis[0]", "C-2.8", f)).findings);
const partLeg = (o) => ({ target: "INF-2026-0001-doc", role: "supports", extent_kind: "doc-part", ...o });

test("R4 a citation of a footnote, header, comment or other part found by a search passes checkLegExtentGrammar (control-plane seam §10)", () => {
  for (const l of [partLeg({ extent_part: "word/footnotes.xml", extent_ref: "footnote 2" }), partLeg({ extent_part: "word/header1.xml" }),
                   partLeg({ extent_ref: "comment 3" }), partLeg({ extent_part: "word/comments.xml", extent_ref: "comment 3" })])
    assert.deepEqual(extentOf(l), [], JSON.stringify(l));
});

test("R4 control: a doc-part leg naming neither part nor reference is refused C-2.8, and an extent kind not in content's list is refused as before", () => {
  const none = extentOf(partLeg({}));
  assert.equal(none.length, 1);
  assert.equal(none[0].check, "C-2.8");
  assert.equal(none[0].code, "CONTENT_EXTENT_UNREADABLE");
  const unknown = extentOf(partLeg({ extent_kind: "doc-prt", extent_part: "word/footnotes.xml" }));
  assert.equal(unknown.length, 1);
  assert.equal(unknown[0].check, "C-2.8");
  assert.ok(unknown[0].message.includes("doc-prt"), unknown[0].message);
});
