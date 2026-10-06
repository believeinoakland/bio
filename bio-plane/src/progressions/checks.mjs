/* progressions' refusal rows (requirements: `build/requirements/progressions.md`, R27, R28). DEC-49: every refusal
 * this module answers for a condition of its own carries its code, its catalogue row and the member's translation, so
 * a surface shows the same sentence wherever the act is reached.
 *
 * Three rows moved here from the check catalogue's `ACT_SHAPE_CHECKS` with their ids and translations unchanged (K6,
 * R28): C-33.26 `UNKNOWN_AFTER` (REC-64) and REC-211's C-33.42 `NO_DEFINITION_VERSION` and C-33.43 `DEFINITION_MOVED`.
 * The rest are this module's own family, C-100, minted at the extraction (K107 (3)'s rule: the job names a new code's
 * row). `NO_BASIS` (C-33.40) and `NO_CITATION` (C-33.41) are shared act rows, held by `record-grammar`
 * (`SHARED_ACT_CHECKS`, its R29; K765), where the other acts reach them; this module answers them from there
 * (`refusal`).
 *
 * ONE CODE, ONE SITE (K231, N118, N242, T10; K275, N285, T12). Each row's `where` names one function and one marked
 * region that wraps the whole refusal; a code this module answers from several acts is minted in one private helper of
 * `Progressions`, which each act calls. What left C-100, its ids retired and never reused: `NO_SUCH_ENTITY` (C-100.12)
 * is entities' one answer (its R36, `noSuchEntity`), as `NO_ENTITY` (C-100.9) is (its R37, `noEntity`),
 * `LISTENER_DECLARED` (C-100.23) membership's (its R81,
 * `listenerRefusal`), `NO_SHA` (C-100.19) extraction's (its R63, `noSha`, C-51.6, which carries C-100.19's translation),
 * and `NO_KEY` (C-100.1), which many modules mint for one condition, is answered as the catalogue's generic code under
 * its REC-64 rule (R27; K163, K329), with no row (`GENERIC_CODES`, `generic`). N285 renamed this module's own
 * `NO_LABEL` and `NOT_FOUND` to `PROGRESSION_NO_LABEL` (C-100.2) and `PROGRESSION_VERSION_NOT_HELD` (C-100.8), each
 * keeping its translation; `NOT_A_DISPOSITION` (C-100.20) is one condition several modules answer, so its one site is
 * `notADisposition` below (R35), which `inquiry` and `queue` call too (`legacy-store`'s call went to `queue`).
 * T33 (T33-32) adds C-100.24 `NOT_ATTESTED_BY_DOCUMENT` (R37); R37's `NO_SUCH_DATED_FACT` is events' one answer (its R7,
 * `noSuchDatedFact`; K1568 (3)), and C-100.25 is retired, never reused; R39's
 * `NO_SUCH_STANDARD` and `PORTION_UNKNOWN` are standards' one answers (its R17, `noSuchStandard`; `portionUnknown`,
 * K1563 (10)). */

import { SHARED_ACT_CHECKS } from "../record-grammar/index.mjs";
import { DISPOSITIONS } from "../promotion/index.mjs";

/** The two decisions a member may record about a derived question (D-79): `promotion`'s one list (its R51), the same
 *  frozen array, re-exported here (R35; N340). Adopting one authors a focus instead. */
export { DISPOSITIONS };

const at = (fn, region) => `src/progressions/index.mjs ${fn} > ${region}`;

export const PROGRESSION_CHECKS = Object.freeze({
  PROGRESSION_NO_LABEL: {
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
  PROGRESSION_VERSION_NOT_HELD: {
    check: 'C-100.8', where: at("readProgression", "is-version-held"),
    translation: 'The record holds no such version of this flow. The versions it does hold are named '
      + 'beside this message, and each reads back in full.',
  },
  NO_PLACEMENTS: {
    check: 'C-100.10', where: at("threadInstance", "is-thread-placed"),
    translation: 'Threading places documents at the steps of a flow, and this request places none. Name at '
      + 'least one step and the document that fills it. Nothing was written.',
  },
  NO_SUCH_PROGRESSION: {
    check: 'C-100.11', where: at("#declared", "is-progression-declared"),
    translation: 'No flow of that key has been declared, so there is nothing to place documents in or to '
      + 'decide about. Declare the flow first. Nothing was written.',
  },
  NO_STAGE: {
    check: 'C-100.13', where: at("#stageNamed", "is-stage-named"),
    translation: 'This request does not say which step of the flow it is about. Name the step. Nothing was '
      + 'written.',
  },
  BAD_STAGE: {
    check: 'C-100.14', where: at("#stageOf", "is-stage-of-progression"),
    translation: 'The step named here is not a step of this flow as it is declared now. Name one of its '
      + 'steps. Nothing was written.',
  },
  NO_CAPTURE: {
    check: 'C-100.15', where: at("#documentNamed", "is-document-named"),
    translation: 'A step is filled by a captured document, named by its fingerprint, and this request names '
      + 'none. Name the document. Nothing was written.',
  },
  DUPLICATE_PLACEMENT: {
    check: 'C-100.16', where: at("threadInstance", "is-placement-unique"),
    translation: 'The same document is placed at the same step twice in this request. Place it once. Nothing '
      + 'was written.',
  },
  NOT_CONCERNED: {
    check: 'C-100.17', where: at("#concerned", "is-document-concerned"),
    translation: 'The record does not show this document concerning the subject this instance follows, so '
      + 'it cannot be placed in it or excuse one of its steps. Resolve the document to the subject first, '
      + 'or use it in the instance of the subject it does concern. Nothing was written.',
  },
  NO_REASON: {
    check: 'C-100.18', where: at("#reasonStated", "is-reason-stated"),
    translation: 'This act is recorded with a reason, in your own words, and none was given. A decision or '
      + 'an excused step with no reason leaves nobody able to say why later. Give the reason. Nothing was '
      + 'written.',
  },
  NOT_A_DISPOSITION: {
    check: 'C-100.20', where: 'src/progressions/checks.mjs notADisposition > is-disposition-word',
    translation: 'Setting something down means deferring it (set aside for now) or dismissing it (declined); taking '
      + 'it up is a different act. Choose deferred or dismissed. Nothing was written.',
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
  NOT_ATTESTED_BY_DOCUMENT: {
    check: 'C-100.24', where: at("#ownDateNamed", "is-event-attested"),
    translation: 'The event named for this document is not one the document attests, so its date cannot be the '
      + 'date of this step. Name an event the document attests, or none. Nothing was written.',
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
});

/** The generic codes this module answers with no row of its own (R27; N118; the catalogue's REC-64 rule, K163, K329). */
export const GENERIC_CODES = Object.freeze(["NO_KEY"]);

/** A refusal in DEC-49's shape: the code, its row and translation, then the site's own fields and sentence. `NO_BASIS`
 *  and `NO_CITATION` are record-grammar's shared act rows (C-33.40, C-33.41; `SHARED_ACT_CHECKS`). Throws only when a code has no row with a
 *  translation, which a test of every code rules out: a code with no sentence behind it must not reach a member. */
export function refusal(code, detail, extra = {}) {
  const row = PROGRESSION_CHECKS[code] || ((code === "NO_BASIS" || code === "NO_CITATION") ? SHARED_ACT_CHECKS[code] : null);
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`progressions: ${code} has no row with a translation (DEC-49)`);
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, ...extra, detail };
}

/** A generic code's refusal (`GENERIC_CODES`): the code and the site's own fields and sentence, no row. Throws for any
 *  other code, so a condition of this module's own cannot leave through here without its row. */
export function generic(code, detail, extra = {}) {
  if (!GENERIC_CODES.includes(code)) throw new Error(`progressions: ${code} is not a generic code; it answers with its row`);
  return { ok: false, reason: code, code, ...extra, detail };
}

/* R35: the fixed sentence `notADisposition` answers with, true at every site that calls it. */
const NOT_A_DISPOSITION_DETAIL = "a disposition is deferred (set aside for now) or dismissed (declined); taking a question up "
  + "is a different act and is not a disposition";

/** R35 (N285, K275): THE one answer to one condition, a disposition word other than `deferred` or `dismissed`
 *  (`DISPOSITIONS`, compared exactly: a caller trims by its own rule first). `null` for either word; else
 *  `{ok: false, reason: "NOT_A_DISPOSITION", code, check, translation, to, dispositions, detail}`, `to` the word as
 *  given (null when blank). `extra` adds a caller's fields and never replaces these. It writes nothing and never
 *  throws. */
export function notADisposition(to, extra = null) {
  /* DEC-49 REGION is-disposition-word */
  if (typeof to === "string" && DISPOSITIONS.includes(to)) return null;
  const row = PROGRESSION_CHECKS.NOT_A_DISPOSITION;
  const given = to === undefined || to === null || (typeof to === "string" && !to.trim()) ? null : to;
  return { ...(extra && typeof extra === "object" ? extra : {}),
           ok: false, reason: "NOT_A_DISPOSITION", code: "NOT_A_DISPOSITION", check: row.check, translation: row.translation,
           to: given, dispositions: DISPOSITIONS, detail: NOT_A_DISPOSITION_DETAIL };
  /* END DEC-49 REGION is-disposition-word */
}
