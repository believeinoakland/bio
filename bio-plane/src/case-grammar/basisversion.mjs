/* case-grammar — the basis version a member finding's project stood on, as the case document states it (requirements:
 * `build/requirements/case-grammar.md` R34; T51 fix round 10, K5186; canon `INVESTIGATIVE-SESSION.md` 1126-1137, Bob's
 * rule applied per finding; DEC-34). `case-authoring` R87 writes two flat fields on each member's `case_roles:` row from
 * `basis-versions`' current version of that finding's project at prepare: `basis_version`, the version's name, and
 * `basis_version_identity`, the SHA-256 of its composition (`basis-version-grammar` R5), both null for a finding whose
 * project stated none. Frozen in the signed document; no case-level strength is recorded (DEC-44). An optional field of
 * the current format, as R22's `subject_entity` is: no new format version, and a document written before it reads as
 * undetermined (R6), never as none. Pure; nothing here throws. */

import { fmSafe } from "./blocks.mjs";

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const IDENTITY_RE = /^[0-9a-f]{64}$/;
const NAME_MAX = 64;
const UNDETERMINED = Object.freeze({ recorded: false, name: null, identity: null });

/* A version's name as the document holds it: a non-empty string of at most 64 characters once folded to one line. */
const nameOf = (v) => {
  if (typeof v !== "string") return null;
  const s = fmSafe(v).trim();
  return s && s.length <= NAME_MAX ? s : null;
};
const identityOf = (v) => (typeof v === "string" && IDENTITY_RE.test(v) ? v : null);

/** R34: the two lines of a member's `case_roles:` row (indented as the row's other fields) stating the basis version
 *  its project stood on, from `{name, identity}`. Anything else, `null` for a project that stated none included, writes
 *  both null: a half pair, a name over 64 characters or an identity that is not 64 lowercase hex digits is never
 *  written, so nothing is filled. A name is folded to one line (`fmSafe`). */
export function memberBasisVersionLines(version) {
  let name = null;
  let identity = null;
  try {
    if (isObj(version)) {
      name = nameOf(version.name);
      identity = identityOf(version.identity);
    }
  } catch { /* an unreadable version states none: null, below */ }
  if (name === null || identity === null) name = identity = null;
  return [`    basis_version: ${name === null ? "null" : `"${name}"`}`, `    basis_version_identity: ${identity === null ? "null" : identity}`];
}

/** R34: what the document states for member `finding`, from its `case_roles:` row: `{recorded, name, identity}`.
 *  `recorded: true` with a name and identity when the project stood on a version; `recorded: true` with both null when
 *  the row states the project stated none; `recorded: false` (undetermined, never filled) when the row does not name the
 *  member, states neither field, or states a pair that is not a name with a 64-hex identity or two nulls. */
export function memberBasisVersionOf(fm, finding) {
  try {
    if (!isObj(fm) || typeof finding !== "string" || !finding || !Array.isArray(fm.case_roles)) return { ...UNDETERMINED };
    const row = fm.case_roles.find((r) => isObj(r) && r.target != null && String(r.target) === finding);
    if (!row || !Object.hasOwn(row, "basis_version") || !Object.hasOwn(row, "basis_version_identity")) return { ...UNDETERMINED };
    const none = (v) => v === null || v === "null";
    if (none(row.basis_version) && none(row.basis_version_identity)) return { recorded: true, name: null, identity: null };
    const name = nameOf(row.basis_version);
    const identity = identityOf(row.basis_version_identity);
    return name !== null && identity !== null ? { recorded: true, name, identity } : { ...UNDETERMINED };
  } catch { /* an unreadable document states none: undetermined, below */ }
  return { ...UNDETERMINED };
}
