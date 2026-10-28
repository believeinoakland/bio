/* ai-catalogue's own refusal rows (requirements: `build/requirements/ai-catalogue.md`, R49). DEC-49: every refusal this
 * module answers carries its code and its row. The module writes no sentence (K3810, K5418): a row names its check, its
 * one site and the WORD KEY the screens read for it (`ai.refused.<code, lower case, no underscores>`), never the words.
 * A state's words are read the same way, by `ai.catalogue.state.<state>` (`STATE_WORDS`).
 *
 * T53 (AI-CATALOGUE #1; K5457, K6): C-156 is a new family, the AI catalogue's, at the next free number of the tree at
 * the job's START (C-155 the highest). */

const at = (file, fn, region) => `src/ai-catalogue/${file} ${fn} > ${region}`;
const key = (code) => `ai.refused.${code.toLowerCase().replace(/_/g, "")}`;
const row = (n, file, fn, region, code) => Object.freeze({ check: `C-156.${n}`, where: at(file, fn, region), word: key(code) });

export const CATALOGUE_CHECKS = Object.freeze({
  CATALOGUE_EVIDENCE_MISSING: row(1, "validate.mjs", "validatePayload", "is-claim-evidenced", "CATALOGUE_EVIDENCE_MISSING"),
  CATALOGUE_ENTRY_INVALID: row(2, "validate.mjs", "validatePayload", "is-entry-valid", "CATALOGUE_ENTRY_INVALID"),
  CATALOGUE_PLAN_INVALID: row(3, "validate.mjs", "validatePayload", "is-plan-valid", "CATALOGUE_PLAN_INVALID"),
  CATALOGUE_PAYLOAD_INVALID: row(4, "validate.mjs", "validatePayload", "is-payload-valid", "CATALOGUE_PAYLOAD_INVALID"),
  CATALOGUE_PATH_INVALID: row(5, "index.mjs", "pullRequest", "is-path-relative", "CATALOGUE_PATH_INVALID"),
  CATALOGUE_ROLLBACK_UNKNOWN: row(6, "index.mjs", "rollback", "is-rollback-held", "CATALOGUE_ROLLBACK_UNKNOWN"),
  CATALOGUE_UNAVAILABLE: row(7, "index.mjs", "#unavailable", "is-catalogue-held", "CATALOGUE_UNAVAILABLE"),
  DIGEST_MISMATCH: row(8, "index.mjs", "#acceptPayload", "is-digest-indexed", "DIGEST_MISMATCH"),
  NOT_NEWER: row(9, "index.mjs", "#acceptPayload", "is-seq-newer", "NOT_NEWER"),
  ADVISORY_BAD_MOVE: row(10, "lifecycle.mjs", "badMove", "is-move-legal", "ADVISORY_BAD_MOVE"),
  ADVISORY_REASON_UNKNOWN: row(11, "index.mjs", "#acceptAdvisory", "is-advisory-reason", "ADVISORY_REASON_UNKNOWN"),
  PART_UNKNOWN: row(12, "index.mjs", "#question", "is-part-known", "PART_UNKNOWN"),
  CHECK_UNKNOWN: row(13, "index.mjs", "#question", "is-check-known", "CHECK_UNKNOWN"),
});

/** The one refusal shape: the code, its row's check and word key, and the fields that name what was refused. */
export function refusal(code, fields = {}) {
  const r = CATALOGUE_CHECKS[code];
  return Object.freeze({ ...fields, ok: false, code, reason: code, check: r.check, word: r.word });
}

export const CATALOGUE_STATES = Object.freeze(["unavailable", "needs_newer_release", "stale", "current"]);
export const STATE_WORDS = Object.freeze(Object.fromEntries(CATALOGUE_STATES.map((s) => [s, `ai.catalogue.state.${s}`])));
