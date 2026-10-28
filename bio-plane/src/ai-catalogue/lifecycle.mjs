/* ai-catalogue: the lifecycle of an entry or a plan (R24–R27). Pure: the moves, the advisories' closed lists, and the
 * effective state of a target, that of the highest-`seq` record naming it, payload or applied advisory. */
import { refusal } from "./checks.mjs";

/** R24: the only moves. A state is changed only by a verified payload or advisory. */
export const MOVES = Object.freeze({
  listed: Object.freeze(["watch", "lapsed"]),
  watch: Object.freeze(["listed", "lapsed"]),
  lapsed: Object.freeze(["retired"]),
  retired: Object.freeze([]),
});
export const legalMove = (from, to) => from === to || (MOVES[from] || []).includes(to);

/** R26: the advisory kinds, each the state it moves its target to. */
export const ADVISORY_KINDS = Object.freeze({ watch: "watch", lapse: "lapsed", retire: "retired", clear: "listed" });
/** R26: THE one closed list of advisory reasons (`ai-issuer` R7 reads it from here and keeps no copy). */
export const ADVISORY_REASONS = Object.freeze(["deprecation", "canary_drift", "served_mismatch", "team_divergence", "health",
  "terms_change", "other"]);

export function badMove(fields) {
  /* DEC-49 REGION is-move-legal */
  return refusal("ADVISORY_BAD_MOVE", fields);
  /* END DEC-49 REGION is-move-legal */
}

/** R27: the effective state of a target at `at` (an ISO instant): its last payload record `{seq, state}` (or null when no
 *  applied payload names it), then each advisory naming it, in `seq` order, effective by `at` and above that record's
 *  `seq`, applied where its move is legal. Answers `{state, seq}`, or null for a target no payload names. */
export function effectiveState(record, advisories, at) {
  if (!record) return null;
  let state = record.state, seq = record.seq;
  for (const a of advisories) {
    if (a.seq <= seq || a.effective_at > at) continue;
    const to = ADVISORY_KINDS[a.kind];
    if (to && legalMove(state, to)) { state = to; seq = a.seq; }
  }
  return { state, seq };
}
