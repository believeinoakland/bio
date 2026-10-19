/* inquiry-grammar T51 (CR-8): R13's exported standard-leg checker and R19's corpus and golden answers for the version-name
   codes. Findings are stated by hand or read from `golden.json` (regenerated in this change by the corpus's own step,
   never by hand). Pure; no network, no clock. */
import test from "node:test";
import assert from "node:assert/strict";
import * as IG from "../../../src/inquiry-grammar/index.mjs";
import * as Grammar from "../../../src/inquiry-grammar/grammar.mjs";
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
