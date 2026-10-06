/* strength's leg kinds (requirements: `build/requirements/strength.md`, R2, R33, R36–R38), pure. A leg's kind decides how
 * the walk resolves it: a document by its own grade under its capture ceiling (R1), a question by its own answer (R2),
 * another group's finding by its accepted edition (R33), a calculation by its inputs (R36), a held standard by its
 * captured text (R37), and a duty occurrence by its derivation (R38).
 *
 * The occurrence reference is `inquiry-grammar`'s one spelling (its R15), read from it and never restated. */

import { normalizeType, OBJECT_TYPES } from "../record-grammar/index.mjs";
import { parseImportedFindingRef, parseOccurrenceRef } from "../inquiry-grammar/index.mjs";

export { OCCURRENCE_REF_RE, parseOccurrenceRef } from "../inquiry-grammar/index.mjs";

/** The kinds a leg resolves as. `calculation` and `occurrence` are DERIVED: they carry no grade of their own, the walk
 *  derives one on the capture axis. `standard` carries a capture grade, bounded by its text's ceiling. */
export const DERIVED_KINDS = Object.freeze(["calculation", "occurrence"]);
export const CAPTURE_ONLY_KINDS = Object.freeze(["calculation", "occurrence", "standard"]);

const typeOf = (id) => normalizeType(OBJECT_TYPES[String(id ?? "").split("-")[0]]) ?? "";

/** A leg's kind as the walk reads it: `imported`, `occurrence`, `inquiry`, `calculation`, `standard`, else `document`. */
export function legKind(leg) {
  const t = leg ? leg.target_id : null;
  if (typeof t === "string" && parseImportedFindingRef(t) !== null) return "imported";
  if (parseOccurrenceRef(t)) return "occurrence";
  if (normalizeType(leg && leg.target_type) === "inquiry") return "inquiry";
  const ty = typeOf(t);
  if (ty === "calculation") return "calculation";
  if (ty === "standard") return "standard";
  return "document";
}
