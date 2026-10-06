/* strength's leg kinds (requirements: `build/requirements/strength.md`, R2, R33, R36–R38), pure. A leg's kind decides how
 * the walk resolves it: a document by its own grade under its capture ceiling (R1), a question by its own answer (R2),
 * another group's finding by its accepted edition (R33), a calculation by its inputs (R36), a held standard by its
 * captured text (R37), and a duty occurrence by its derivation (R38).
 *
 * The occurrence reference is spelled as `inquiry-grammar` R15 states it, `occurrence:<DUT id>/<key>`. Until that
 * module's T33 job merges, this module reads the spelling from that requirement (K1563 (1): an upstream not yet merged
 * is coded to its requirements); the job re-points to `inquiry-grammar.parseOccurrenceRef` after the merge. */

import { normalizeType, OBJECT_TYPES, idPattern } from "../record-grammar/index.mjs";
import { parseImportedFindingRef } from "../inquiry-grammar/index.mjs";

/** R38 (inquiry-grammar R15): an occurrence reference, `occurrence:<DUT id>/<key>`. */
const DUTY_ID = idPattern("DUT").source.replace(/^\^/, "").replace(/\$$/, "");
export const OCCURRENCE_REF_RE = new RegExp(`^occurrence:(${DUTY_ID})\\/([^\\s/][^\\s]{0,199})$`);
/** R38: `{duty, key}` for an occurrence reference, else null. */
export function parseOccurrenceRef(s) {
  const m = typeof s === "string" ? OCCURRENCE_REF_RE.exec(s) : null;
  return m ? { duty: m[1], key: m[2] } : null;
}

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
