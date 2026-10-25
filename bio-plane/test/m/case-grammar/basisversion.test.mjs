/* case-grammar at its interface: R34, the basis version a member finding's project stood on when the case was prepared
   (T51 fix round 10; K5186; canon INVESTIGATIVE-SESSION 1126-1137), read from the document's bytes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { doc, sha } from "./helpers.mjs";

const fmOf = (text) => parseFrontmatter(text).data;
const A = "INQ-2026-0001-lease";
const B = "INQ-2026-0002-board";
const C = "INQ-2026-0003-context";
const D = "INQ-2026-0004-never-stated";
const IDENT = sha("composition of the lease reading");
const FORMATS = [CG.CASE_DOCUMENT_FORMAT, "bio-case-document/7", "bio-case-document/6", "bio-case-document/5"];

/* A case_roles: block written the way case-authoring writes it, with R34's lines from `memberBasisVersionLines`. */
const rolesBlock = (rows) => ["case_roles:", ...rows.flatMap(([m, v]) => [`  - target: ${m}`, "    role: supporting",
  "    subject_entity: null", ...(v === undefined ? [] : CG.memberBasisVersionLines(v))])];

test("R34 a round trip: the version's name and identity written on the member's case_roles: row read back, for every format", () => {
  for (const format of FORMATS) {
    const fm = fmOf(doc(format, [`case_findings: [${A}, ${B}, ${C}]`, ...rolesBlock([
      [A, { name: "Lease as signed", identity: IDENT }],
      [B, { name: "Board minutes, second reading", identity: sha("b") }],
      [C, null]])]));
    assert.deepEqual(CG.memberBasisVersionOf(fm, A), { recorded: true, name: "Lease as signed", identity: IDENT }, format);
    assert.equal(CG.memberBasisVersionOf(fm, B).name, "Board minutes, second reading");
    assert.equal(CG.memberBasisVersionOf(fm, B).identity, sha("b"), "each member its own, never another's");
    assert.deepEqual(CG.memberBasisVersionOf(fm, C), { recorded: true, name: null, identity: null },
      "a finding whose project stated none records null, stated");
  }
});

test("R34 a finding whose project stated none records null, never a filled guess; a document silent about it is undetermined", () => {
  const lines = CG.memberBasisVersionLines(null);
  assert.equal(lines.length, 2);
  assert.ok(lines.every((l) => l.endsWith(": null")), "both fields written null");
  assert.deepEqual(CG.memberBasisVersionLines(undefined), lines, "nothing handed is none stated");
  const older = fmOf(doc("bio-case-document/7", [`case_findings: [${D}]`, ...rolesBlock([[D, undefined]])]));
  assert.deepEqual(CG.memberBasisVersionOf(older, D), { recorded: false, name: null, identity: null },
    "a document written before R34 states nothing: undetermined, not none");
  assert.deepEqual(CG.memberBasisVersionOf(older, A), { recorded: false, name: null, identity: null }, "a member it does not name");
});

test("R34 the writer fills nothing: a half pair, a bad identity or a bad name is written null; a name is folded to one line", () => {
  const none = CG.memberBasisVersionLines(null);
  for (const v of [{ name: "x" }, { identity: IDENT }, { name: "x", identity: "abc" }, { name: "x", identity: IDENT.toUpperCase() },
                   { name: "", identity: IDENT }, { name: 7, identity: IDENT }, { name: "n".repeat(65), identity: IDENT },
                   "x", 7, [], { name: "x", identity: 7 }])
    assert.deepEqual(CG.memberBasisVersionLines(v), none, JSON.stringify(v));
  const folded = CG.memberBasisVersionLines({ name: 'a "b"\nc', identity: IDENT }).join("\n");
  const fm = fmOf(doc(CG.CASE_DOCUMENT_FORMAT, [`case_findings: [${A}]`, "case_roles:", `  - target: ${A}`, ...folded.split("\n")]));
  assert.equal(fm.case_roles[0].basis_version.includes("\n"), false);
});

test("R34 reader controls: a malformed or half-stated pair is undetermined, odd input answers undetermined and never throws, and the front matter is untouched", () => {
  const und = { recorded: false, name: null, identity: null };
  const row = (extra) => ({ case_roles: [{ target: A, ...extra }] });
  for (const extra of [{ basis_version: "x" }, { basis_version_identity: IDENT }, { basis_version: "x", basis_version_identity: "nope" },
                       { basis_version: "", basis_version_identity: IDENT }, { basis_version: 7, basis_version_identity: IDENT },
                       { basis_version: "x", basis_version_identity: null }, { basis_version: null, basis_version_identity: IDENT }])
    assert.deepEqual(CG.memberBasisVersionOf(row(extra), A), und, JSON.stringify(extra));
  for (const [fm, f] of [[null, A], [undefined, A], [7, A], ["x", A], [[], A], [row({}), null], [row({}), 7], [row({}), ""],
                         [{ case_roles: "x" }, A], [{ case_roles: [null, 7, [A]] }, A],
                         [{ get case_roles() { throw new Error("boom"); } }, A],
                         [{ case_roles: [{ target: A, get basis_version() { throw new Error("boom"); } }] }, A]])
    assert.deepEqual(CG.memberBasisVersionOf(fm, f), und);
  const stated = row({ basis_version: "Lease as signed", basis_version_identity: IDENT });
  const before = JSON.stringify(stated);
  assert.equal(CG.memberBasisVersionOf(stated, A).recorded, true);
  assert.equal(JSON.stringify(stated), before);
});
