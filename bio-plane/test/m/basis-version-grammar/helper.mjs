/* basis-version-grammar's tests: the small helper they share (a frontmatter object with one well-formed version, and the
   findings of the grammar over it). The module is pure, so no record, promotion or instance is built here; the arms that
   drive a promotion stay in `basis-versions`. */
import { basisVersionFindings } from "../../../src/basis-version-grammar/index.mjs";

export const T = "2026-09-27T00:00:00Z";
export const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r";

/** A frontmatter object with one well-formed version, overridable per field. */
export function fm({ v = {}, legs = null, grounds = null, more = [] } = {}) {
  const base = { name: "first", description: "the first account of it", relationship: "and", state: "suggested",
                 hidden: false, derived_from: null, ...v };
  return {
    id: Q, object_type: "inquiry",
    basis_versions: [base, ...more],
    basis_version_grounds: grounds ?? [{ version: base.name, ground: "main", asserted_by: "member:alice", at: T }],
    basis_version_legs: legs ?? [{ version: base.name, target: DOC, role: "supports", ground: "main" }],
  };
}

/** The findings the grammar pushes for `x`, and the errors' codes. */
export const findingsOf = (x) => { const f = []; basisVersionFindings(x, f); return f; };
export const codes = (x) => findingsOf(x).filter((y) => y.severity === "error").map((y) => y.code);

/** A well-formed one-part version block over `targets`, named `name`, as frontmatter rows (the fixture's `version`). */
export function version(name, targets, extra = {}) {
  return {
    versions: [{ name, description: `the reading called ${name}`, relationship: "and", state: "suggested", hidden: false,
                 derived_from: null, author: "member:alice", at: T, ...extra }],
    grounds: targets.length ? [{ version: name, ground: "main", asserted_by: "member:alice", at: T }] : [],
    legs: targets.map((t) => ({ version: name, target: t, role: "supports", ground: "main" })),
  };
}

/** A block of rows (`version`'s shape) as an inquiry's frontmatter. */
export const fmOf = (b) => ({ id: Q, object_type: "inquiry", basis_versions: b.versions, basis_version_grounds: b.grounds,
                              basis_version_legs: b.legs });
