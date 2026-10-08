/* case-grammar at its interface: R22, a member's subject as the case document states it (N717; K2002, K2004), read from
   the document's bytes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { doc, rowsOf } from "./helpers.mjs";

const fmOf = (text) => parseFrontmatter(text).data;
const A = "INQ-2026-0001-lease";
const B = "INQ-2026-0002-board";
const C = "INQ-2026-0003-context";
const ENT = "ENT-2026-0001-parks-board";

test("R22 memberSubjectOf answers the subject_entity on the member's case_roles: row, a document's own bytes, for every format", () => {
  for (const format of [CG.CASE_DOCUMENT_FORMAT, "bio-case-document/6", "bio-case-document/5"]) {
    const fm = fmOf(doc(format, [`case_findings: [${A}, ${B}, ${C}]`,
      ...rowsOf("case_roles", [{ target: A, role: "load_bearing", subject_entity: ENT },
                               { target: B, role: "supporting", subject_entity: "ENT-2026-0002-council" },
                               { target: C, role: "supporting", subject_entity: null }]),
      ...rowsOf("case_conclusions", [{ target: A, claim_state: "adopted", subject_entity: "ENT-2026-0009-other" },
                                     { target: C, claim_state: "adopted", subject_entity: "ENT-2026-0009-other" }])]));
    assert.equal(CG.memberSubjectOf(fm, A), ENT, `${format}: the case_roles: row answers before case_conclusions:`);
    assert.equal(CG.memberSubjectOf(fm, B), "ENT-2026-0002-council");
    assert.equal(CG.memberSubjectOf(fm, C), null, "a row stating null states no subject, never filled from another row");
  }
});

test("R22 memberSubjectOf answers from the case_conclusions: row when the case_roles: row states none", () => {
  const fm = fmOf(doc(CG.CASE_DOCUMENT_FORMAT, [
    ...rowsOf("case_roles", [{ target: A, role: "load_bearing" }]),
    ...rowsOf("case_conclusions", [{ target: A, claim_state: "adopted", subject_entity: ENT },
                                   { target: B, claim_state: "adopted", subject_entity: "ENT-2026-0002-council" }])]));
  assert.equal(CG.memberSubjectOf(fm, A), ENT);
  assert.equal(CG.memberSubjectOf(fm, B), "ENT-2026-0002-council", "a member with no case_roles: row");
});

test("R22 negative controls: a document stating no member's subject, a member it does not name, and odd input answer null; never throws", () => {
  const none = fmOf(doc(CG.CASE_DOCUMENT_FORMAT, [...rowsOf("case_roles", [{ target: A, role: "load_bearing" }]),
    ...rowsOf("case_conclusions", [{ target: A, claim_state: "adopted" }])]));
  assert.equal(CG.memberSubjectOf(none, A), null);
  assert.equal(CG.memberSubjectOf(fmOf(doc(CG.CASE_DOCUMENT_FORMAT)), A), null);
  const stated = fmOf(doc(CG.CASE_DOCUMENT_FORMAT, rowsOf("case_roles", [{ target: A, subject_entity: ENT }])));
  assert.equal(CG.memberSubjectOf(stated, B), null, "another member's subject is never answered");
  for (const v of ["", "   ", 7, true]) assert.equal(CG.memberSubjectOf({ case_roles: [{ target: A, subject_entity: v }] }, A), null, String(v));
  for (const [fm, f] of [[null, A], [undefined, A], [7, A], ["x", A], [[], A], [stated, null], [stated, 7], [stated, ""],
                         [{ case_roles: "x" }, A], [{ case_roles: [null, 7, [A]] }, A],
                         [{ get case_roles() { throw new Error("boom"); } }, A],
                         [{ case_roles: [{ target: A, get subject_entity() { throw new Error("boom"); } }] }, A]])
    assert.equal(CG.memberSubjectOf(fm, f), null);
  /* pure: the front matter untouched */
  const before = JSON.stringify(stated);
  CG.memberSubjectOf(stated, A);
  assert.equal(JSON.stringify(stated), before);
});
