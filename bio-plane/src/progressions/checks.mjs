/* progressions' refusal rows (requirements: `build/requirements/progressions.md`, R27, R28). DEC-49: every refusal
 * this module answers carries its code, its catalogue row and the member's translation, so a surface shows the same
 * sentence wherever the act is reached.
 *
 * Three rows moved here from the check catalogue's `ACT_SHAPE_CHECKS` with their ids and translations unchanged (K6,
 * R28): C-33.26 `UNKNOWN_AFTER` (REC-64) and REC-211's C-33.42 `NO_DEFINITION_VERSION` and C-33.43 `DEFINITION_MOVED`.
 * The rest are this module's own family, C-100, minted at the extraction (K107 (3)'s rule: the job names a new code's
 * row). `NO_BASIS` (C-33.40) and `NO_CITATION` (C-33.41) are shared act rows and stay in the catalogue, where the other
 * acts reach them; this module answers them from there (`actRefusal`). */

import { ACT_SHAPE_CHECKS } from "../../checks/bio-checks.mjs";

const at = (fn, region) => `src/progressions/index.mjs ${fn} > ${region}`;

export const PROGRESSION_CHECKS = Object.freeze({
  NO_KEY: {
    check: 'C-100.1', where: at("defineProgression|readProgression|threadInstance|readInstance|dischargeStage|readExceptions|disposeProposal", "is-progression-keyed"),
    translation: 'A declared flow is named by a short key, and this request names none, so the record cannot tell '
      + 'which flow is meant. Name the flow by its key and try again. Nothing was written.',
  },
  NO_LABEL: {
    check: 'C-100.2', where: at("defineProgression", "is-progression-labelled"),
    translation: 'A declared flow carries a name a person can read, and this one has none. Give it a name. '
      + 'Nothing was written.',
  },
  NO_STAGES: {
    check: 'C-100.3', where: at("defineProgression", "is-progression-staged"),
    translation: 'A declared flow is its steps in order, and this one names no step. Name at least one step. '
      + 'Nothing was written.',
  },
  NO_STAGE_KEY: {
    check: 'C-100.4', where: at("defineProgression", "is-stage-keyed"),
    translation: 'One step of this flow has no key, so nothing could later be placed at it or found missing '
      + 'from it. Give every step a key. Nothing was written.',
  },
  DUPLICATE_STAGE: {
    check: 'C-100.5', where: at("defineProgression", "is-stage-unique"),
    translation: 'Two steps of this flow share one key, so a document placed at that key could belong to '
      + 'either. Give each step its own key. Nothing was written.',
  },
  NO_CARDINALITY: {
    check: 'C-100.6', where: at("defineProgression", "is-stage-counted"),
    translation: 'One step does not say how many documents it may hold (exactly one, at most one, or any '
      + 'number), so the record could not tell a step holding too many from one holding the usual set. '
      + 'Say how many. Nothing was written.',
  },
  BAD_REQUIRED: {
    check: 'C-100.7', where: at("defineProgression", "is-stage-required"),
    translation: 'One step does not say how firmly it is expected, in one of the five words the record '
      + 'understands (always, usually, sometimes, never, unless an exception is recorded). Use one of '
      + 'them. Nothing was written.',
  },
  UNKNOWN_AFTER: {
    check: 'C-33.26', where: at("defineProgression", "is-progression-order"),
    translation: 'One step here says it comes after a step this sequence does not contain, so the '
      + 'order cannot be worked out. Name a step that exists, or leave the ordering off and let it '
      + 'stand on its own.',
  },
  NOT_FOUND: {
    check: 'C-100.8', where: at("readProgression", "is-version-held"),
    translation: 'The record holds no such version of this flow. The versions it does hold are named '
      + 'beside this message, and each reads back in full.',
  },
  NO_ENTITY: {
    check: 'C-100.9', where: at("threadInstance|readInstance|dischargeStage|readExceptions", "is-instance-entity"),
    translation: 'An instance of a flow is followed through one registered subject, and this request names '
      + 'none. Name the subject by its id. Nothing was written.',
  },
  NO_PLACEMENTS: {
    check: 'C-100.10', where: at("threadInstance", "is-thread-placed"),
    translation: 'Threading places documents at the steps of a flow, and this request places none. Name at '
      + 'least one step and the document that fills it. Nothing was written.',
  },
  NO_SUCH_PROGRESSION: {
    check: 'C-100.11', where: at("threadInstance|dischargeStage|disposeProposal", "is-progression-declared"),
    translation: 'No flow of that key has been declared, so there is nothing to place documents in or to '
      + 'decide about. Declare the flow first. Nothing was written.',
  },
  NO_SUCH_ENTITY: {
    check: 'C-100.12', where: at("threadInstance|dischargeStage", "is-entity-registered"),
    translation: 'The subject named here is not registered, so no document can be shown to concern it. '
      + 'Register the subject first. Nothing was written.',
  },
  NO_STAGE: {
    check: 'C-100.13', where: at("threadInstance|dischargeStage|disposeProposal", "is-stage-named"),
    translation: 'This request does not say which step of the flow it is about. Name the step. Nothing was '
      + 'written.',
  },
  BAD_STAGE: {
    check: 'C-100.14', where: at("threadInstance|dischargeStage|disposeProposal", "is-stage-of-progression"),
    translation: 'The step named here is not a step of this flow as it is declared now. Name one of its '
      + 'steps. Nothing was written.',
  },
  NO_CAPTURE: {
    check: 'C-100.15', where: at("threadInstance|dischargeStage", "is-document-named"),
    translation: 'A step is filled by a captured document, named by its fingerprint, and this request names '
      + 'none. Name the document. Nothing was written.',
  },
  DUPLICATE_PLACEMENT: {
    check: 'C-100.16', where: at("threadInstance", "is-placement-unique"),
    translation: 'The same document is placed at the same step twice in this request. Place it once. Nothing '
      + 'was written.',
  },
  NOT_CONCERNED: {
    check: 'C-100.17', where: at("threadInstance|dischargeStage", "is-document-concerned"),
    translation: 'The record does not show this document concerning the subject this instance follows, so '
      + 'it cannot be placed in it or excuse one of its steps. Resolve the document to the subject first, '
      + 'or use it in the instance of the subject it does concern. Nothing was written.',
  },
  NO_REASON: {
    check: 'C-100.18', where: at("dischargeStage|disposeProposal", "is-reason-stated"),
    translation: 'This act is recorded with a reason, in your own words, and none was given. A decision or '
      + 'an excused step with no reason leaves nobody able to say why later. Give the reason. Nothing was '
      + 'written.',
  },
  NO_SHA: {
    check: 'C-100.19', where: at("captureProgressions", "is-capture-named"),
    translation: 'This read is about one captured document, named by its fingerprint, and none was named.',
  },
  NOT_A_DISPOSITION: {
    check: 'C-100.20', where: at("disposeProposal", "is-disposition-word"),
    translation: 'One of the record\'s questions is either deferred (set aside for now) or dismissed '
      + '(declined). Taking it up is a different act, which writes a new focus. Choose deferred or '
      + 'dismissed. Nothing was written.',
  },
  BAD_REASON: {
    check: 'C-100.21', where: at("disposeProposal", "is-reason-bounded"),
    translation: 'The reason is too long or contains a quotation mark, a backslash or a line break, which '
      + 'the record cannot keep as written. Shorten it to one plain line. Nothing was written.',
  },
  NO_DECIDER: {
    check: 'C-100.22', where: at("disposeProposal", "is-decider-stamped"),
    translation: 'A decision is recorded under the member who took it, and this request reached the record '
      + 'without one. Sign in and decide again. Nothing was written.',
  },
  NO_DEFINITION_VERSION: {
    check: 'C-33.42', where: at("disposeProposal", "is-dispose-version-named"),
    translation: 'Setting aside one of the record\'s own questions is a decision about the way a '
      + 'body is said to work — and that description is written down, dated, and rewritten when the '
      + 'group learns better. This request does not say which of those versions you were reading '
      + 'when you decided, so the record cannot say what you actually judged. Open the question '
      + 'again and send the version shown beside it. Nothing was recorded.',
  },
  DEFINITION_MOVED: {
    check: 'C-33.43', where: at("disposeProposal", "is-dispose-version-current"),
    translation: 'The version of the declared flow this decision names is not the one standing now. '
      + 'Rather than file your decision against a description you did not read, the record keeps it '
      + 'out and asks you to look again: read the question against the version in force and decide '
      + 'again. The answer may well be the same one, and it will then be yours. Both versions are '
      + 'named beside this message, the earlier one still reads back in full, and nothing was '
      + 'recorded.',
  },
  LISTENER_DECLARED: {
    check: 'C-100.23', where: at("onThreaded", "is-listener-once"),
    translation: 'This module has already asked to be told of every threading; one registration is enough.',
  },
});

/** A refusal in DEC-49's shape: the code, its row and translation, then the site's own fields and sentence. `NO_BASIS`
 *  and `NO_CITATION` are the catalogue's shared act rows (C-33.40, C-33.41). Throws only when a code has no row with a
 *  translation, which a test of every code rules out: a code with no sentence behind it must not reach a member. */
export function refusal(code, detail, extra = {}) {
  const row = PROGRESSION_CHECKS[code] || ((code === "NO_BASIS" || code === "NO_CITATION") ? ACT_SHAPE_CHECKS[code] : null);
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`progressions: ${code} has no row with a translation (DEC-49)`);
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, ...extra, detail };
}
