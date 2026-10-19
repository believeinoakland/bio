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
 * K1563 (10)). T50 (T50-62) adds C-100.26 `NO_SET` and C-100.27 `SET_TOO_LARGE` (R44). */

import { SHARED_ACT_CHECKS } from "../record-grammar/index.mjs";
import { DISPOSITIONS } from "../promotion/index.mjs";
import { word, localize } from "../setup-words/index.mjs";

/** The two decisions a member may record about a derived question (D-79): `promotion`'s one list (its R51), the same
 *  frozen array, re-exported here (R35; N340). Adopting one authors a focus instead. */
export { DISPOSITIONS };

const at = (fn, region) => `src/progressions/index.mjs ${fn} > ${region}`;

export const PROGRESSION_CHECKS = Object.freeze({
  PROGRESSION_NO_LABEL: {
    check: 'C-100.2', where: at("defineProgression", "is-progression-labelled"),
    translation: word("refusal.PROGRESSION_NO_LABEL"),
  },
  NO_STAGES: {
    check: 'C-100.3', where: at("defineProgression", "is-progression-staged"),
    translation: word("refusal.NO_STAGES"),
  },
  NO_STAGE_KEY: {
    check: 'C-100.4', where: at("defineProgression", "is-stage-keyed"),
    translation: word("refusal.NO_STAGE_KEY"),
  },
  DUPLICATE_STAGE: {
    check: 'C-100.5', where: at("defineProgression", "is-stage-unique"),
    translation: word("refusal.DUPLICATE_STAGE"),
  },
  NO_CARDINALITY: {
    check: 'C-100.6', where: at("defineProgression", "is-stage-counted"),
    translation: word("refusal.NO_CARDINALITY"),
  },
  BAD_REQUIRED: {
    check: 'C-100.7', where: at("defineProgression", "is-stage-required"),
    translation: word("refusal.BAD_REQUIRED"),
  },
  UNKNOWN_AFTER: {
    check: 'C-33.26', where: at("defineProgression", "is-progression-order"),
    translation: word("refusal.UNKNOWN_AFTER"),
  },
  PROGRESSION_VERSION_NOT_HELD: {
    check: 'C-100.8', where: at("readProgression", "is-version-held"),
    translation: word("refusal.PROGRESSION_VERSION_NOT_HELD"),
  },
  NO_PLACEMENTS: {
    check: 'C-100.10', where: at("threadInstance", "is-thread-placed"),
    translation: word("refusal.NO_PLACEMENTS"),
  },
  NO_SUCH_PROGRESSION: {
    check: 'C-100.11', where: at("#declared", "is-progression-declared"),
    translation: word("refusal.NO_SUCH_PROGRESSION"),
  },
  NO_STAGE: {
    check: 'C-100.13', where: at("#stageNamed", "is-stage-named"),
    translation: word("refusal.NO_STAGE"),
  },
  BAD_STAGE: {
    check: 'C-100.14', where: at("#stageOf", "is-stage-of-progression"),
    translation: word("refusal.BAD_STAGE"),
  },
  NO_CAPTURE: {
    check: 'C-100.15', where: at("#documentNamed", "is-document-named"),
    translation: word("refusal.NO_CAPTURE"),
  },
  DUPLICATE_PLACEMENT: {
    check: 'C-100.16', where: at("threadInstance", "is-placement-unique"),
    translation: word("refusal.DUPLICATE_PLACEMENT"),
  },
  NOT_CONCERNED: {
    check: 'C-100.17', where: at("#concerned", "is-document-concerned"),
    translation: word("refusal.NOT_CONCERNED"),
  },
  NO_REASON: {
    check: 'C-100.18', where: at("#reasonStated", "is-reason-stated"),
    translation: word("refusal.NO_REASON"),
  },
  NOT_A_DISPOSITION: {
    check: 'C-100.20', where: 'src/progressions/checks.mjs notADisposition > is-disposition-word',
    translation: word("refusal.NOT_A_DISPOSITION"),
  },
  BAD_REASON: {
    check: 'C-100.21', where: at("disposeProposal", "is-reason-bounded"),
    translation: word("refusal.BAD_REASON"),
  },
  NO_DECIDER: {
    check: 'C-100.22', where: at("disposeProposal", "is-decider-stamped"),
    translation: word("refusal.NO_DECIDER"),
  },
  NO_DEFINITION_VERSION: {
    check: 'C-33.42', where: at("disposeProposal", "is-dispose-version-named"),
    translation: word("refusal.NO_DEFINITION_VERSION"),
  },
  NOT_ATTESTED_BY_DOCUMENT: {
    check: 'C-100.24', where: at("#ownDateNamed", "is-event-attested"),
    translation: word("refusal.NOT_ATTESTED_BY_DOCUMENT"),
  },
  /* R44: the design lane's list holds no `refusal.NO_SET`; the nearest held sentence stands until it does (a REPORT). */
  NO_SET: {
    check: 'C-100.26', where: at("instancesFor", "is-set-named"),
    translation: word("refusal.SET_NO_ITEMS"),
  },
  /* R44: `refusal.SET_TOO_LARGE` is record-core's key; its sentence is true of this read too (a REPORT). */
  SET_TOO_LARGE: {
    check: 'C-100.27', where: at("instancesFor", "is-set-bounded"),
    translation: word("refusal.SET_TOO_LARGE"),
  },
  DEFINITION_MOVED: {
    check: 'C-33.43', where: at("disposeProposal", "is-dispose-version-current"),
    translation: word("refusal.DEFINITION_MOVED"),
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
const NOT_A_DISPOSITION_DETAIL = localize("progressions.checks.not_a_disposition_detail", "a disposition is deferred (set aside for now) or dismissed (declined); taking a question up is a different act and is not a disposition");

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
