/* case-grammar — a member's subject, as the case document states it (requirements: `build/requirements/case-grammar.md`
 * R22; N717, K2002, K2004). `case-authoring` R60 writes `subject_entity` on each member's `case_roles:` row: the entity
 * id the member's pinned bytes state as their own `subject_entity`, or null when they state none. `case-checker` R21
 * reads it to narrow a member's standards to the rows of that body (K2002), and reads every body's rows when the
 * document states none. An optional field of the current format, as R10's `working_on` is: no new format version.
 * Pure; nothing here throws. */

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/* The row of `block` naming `finding` as its `target`, or null. */
const rowOf = (block, finding) => (Array.isArray(block) ? block : [])
  .find((r) => isObj(r) && r.target != null && String(r.target) === finding) || null;

/** R22: the `subject_entity` the document states for member `finding`: from its `case_roles:` row, else from its
 *  `case_conclusions:` row, else null. The first of those rows that states the field answers, so a row stating null
 *  (the member's bytes state no subject) is never filled from the other; a value that is not a non-empty string is
 *  null. */
export function memberSubjectOf(fm, finding) {
  try {
    if (!isObj(fm) || typeof finding !== "string" || !finding) return null;
    for (const key of ["case_roles", "case_conclusions"]) {
      const row = rowOf(fm[key], finding);
      if (row && Object.hasOwn(row, "subject_entity")) {
        const v = row.subject_entity;
        return typeof v === "string" && v.trim() && v !== "null" ? v.trim() : null;
      }
    }
  } catch { /* an unreadable document states no subject: null, below */ }
  return null;
}
