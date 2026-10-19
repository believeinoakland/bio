/* basis-versions: the rows it carries (R35) and no place in its text (R36); the grammar they cover is `basis-version-grammar`'s. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { basisVersionFindings, versionsIn, VERSION_MACHINE, versionNeedsReason, VERSION_NAME_RE, VERSION_STATES,
         BASIS_VERSION_CHECKS, VERSION_ACT_CHECKS, NARROW_CHECKS, SUGGEST_KINDS, compositionDiff, sameComposition,
         versionAsWritten, CONCLUDE_ACT_CHECKS, VERSION_KIND_CHECKS, SUFFICIENCY_UNCLAIMED }
  from "../../../src/basis-versions/index.mjs";

const T = "2026-09-27T00:00:00Z";
const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r";

/* A frontmatter object with one well-formed version, overridable per field. */
function fm({ v = {}, legs = null, grounds = null, more = [] } = {}) {
  const base = { name: "first", description: "an account of the support", relationship: "and", state: "suggested",
                 hidden: false, derived_from: null, ...v };
  return {
    id: Q,
    basis_versions: [base, ...more],
    basis_version_grounds: grounds ?? [{ version: base.name, ground: "main", asserted_by: "member:alice", at: T }],
    basis_version_legs: legs ?? [{ version: base.name, target: DOC, role: "supports", ground: "main" }],
  };
}
const codes = (x) => { const f = []; basisVersionFindings(x, f); return f.filter((y) => y.severity === "error").map((y) => y.code); };

test("R35: every check this module mints is a catalogue row with its C-number and a translation — C-25.1–C-25.39 (C-25.37–.39 are R55's), C-27.15, C-50.1–C-50.11, C-33.1, C-33.2, C-33.33–C-33.37, C-32.2", () => {
  const nums = (m) => Object.values(m).map((r) => r.check);
  const want25 = Array.from({ length: 39 }, (_, i) => `C-25.${i + 1}`);
  assert.equal(BASIS_VERSION_CHECKS.VERSION_NAME_MALFORMED.check, "C-25.36", "R54: the name form's own row");
  /* C-25.35 (BAD_BIAS_APPLIED, R48) is a conclusion's refusal, so its row is in CONCLUDE_ACT_CHECKS */
  const c25 = [...nums(BASIS_VERSION_CHECKS), ...nums(VERSION_ACT_CHECKS), ...nums(CONCLUDE_ACT_CHECKS)].filter((c) => c.startsWith("C-25."));
  assert.deepEqual([...new Set(c25)].sort(), [...want25].sort());
  assert.equal(CONCLUDE_ACT_CHECKS.BAD_BIAS_APPLIED.check, "C-25.35");
  assert.equal(VERSION_KIND_CHECKS.VERSION_KIND_UNKNOWN.check, "C-27.15");
  assert.deepEqual(nums(NARROW_CHECKS).sort(), Array.from({ length: 11 }, (_, i) => `C-50.${i + 1}`).sort());
  const act = Object.values(CONCLUDE_ACT_CHECKS).map((r) => r.check);
  for (const c of ["C-33.1", "C-33.2", "C-33.33", "C-33.34", "C-33.35", "C-33.36", "C-33.37"]) assert.ok(act.includes(c), c);
  assert.equal(CONCLUDE_ACT_CHECKS.MACHINE_CANNOT_CONCLUDE.check, "C-32.2");
  for (const m of [BASIS_VERSION_CHECKS, VERSION_ACT_CHECKS, NARROW_CHECKS, CONCLUDE_ACT_CHECKS, VERSION_KIND_CHECKS])
    for (const [k, r] of Object.entries(m)) assert.ok(typeof r.translation === "string" && r.translation.length > 20, k);
});

test("R36: no place is named in the translations this module's refusals carry", () => {
  const rows = JSON.stringify([BASIS_VERSION_CHECKS, VERSION_ACT_CHECKS, NARROW_CHECKS, CONCLUDE_ACT_CHECKS, VERSION_KIND_CHECKS]);
  for (const place of ["Oakland", "Alameda", "California"]) assert.equal(rows.includes(place), false, place);
});
