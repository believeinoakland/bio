/* plan-work's refusal rows (requirements: `build/requirements/plan-work.md`). DEC-49: every refusal this module mints
 * carries its code, its row and the member's translation. The family is C-151, reserved for this module (K2794); each
 * code is minted at one site (K231), named by its row's `where`. Translations are BOB's drafts, the UX stream's to
 * revise. Refusals of the modules this one uses are relayed with their own rows, through their exported sites:
 * `NO_SUCH_PLAN` (`action-plans.noSuchPlan`, its R22), `PLAN_CLOSED` (`refusePlanClosed`), `PLAN_NO_REASON`
 * (`refuseReason`, its R4's rule), `OPTION_KEY_REFUSED` (`refuseKeys`, its R26), `NO_SUCH_OPTION`
 * (`refuseNoSuchOption`) and `MACHINE_CANNOT_PLAN` (`machineCannotPlan`, K2851); a second
 * registration's refusal is `membership.listenerRefusal`'s. */

import { word } from '../setup-words/index.mjs';

const at = (fn, region) => `src/plan-work/index.mjs ${fn} > ${region}`;

export const PLAN_WORK_CHECKS = Object.freeze({
  MATTER_NOT_OF_PLAN: {
    check: 'C-151.1', where: at("#matter", "is-matter-of-plan"),
    translation: word('refusal.MATTER_NOT_OF_PLAN'),
  },
  REVIEW_RHYTHM_REFUSED: {
    check: 'C-151.2', where: at("planReviewRhythm", "is-review-rhythm"),
    translation: word('refusal.REVIEW_RHYTHM_REFUSED'),
  },
  NO_SUCH_ITEM: {
    check: 'C-151.3', where: at("#item", "is-item-seen"),
    translation: word('refusal.NO_SUCH_ITEM'),
  },
  PLAN_WORK_TEXT_REFUSED: {
    check: 'C-151.4', where: at("refuseText", "is-text-written"),
    translation: word('refusal.PLAN_WORK_TEXT_REFUSED'),
  },
  NO_SUCH_PREP_ITEM: {
    check: 'C-151.5', where: at("#prepItem", "is-prep-item-held"),
    translation: word('refusal.NO_SUCH_PREP_ITEM'),
  },
  PREP_ITEM_DONE: {
    check: 'C-151.6', where: at("#prepAct", "is-prep-item-open"),
    translation: word('refusal.PREP_ITEM_DONE'),
  },
  COMMENT_TARGET_REFUSED: {
    check: 'C-151.7', where: at("#commentTarget", "is-comment-target"),
    translation: word('refusal.COMMENT_TARGET_REFUSED'),
  },
  PLAN_WORK_PROVIDER_UNAVAILABLE: {
    check: 'C-151.8', where: at("refuseProviderUnavailable", "is-provider-present"),
    translation: word('refusal.PLAN_WORK_PROVIDER_UNAVAILABLE'),
  },
});

/** One constructor for every refusal minted here: `reason`, the site's own `detail` and keys, then `code`, `check` and
 *  `translation` from the row. */
export function refusal(code, detail, extra) {
  const row = PLAN_WORK_CHECKS[code];
  return { ok: false, reason: code, detail, ...(extra || {}), code, check: row.check, translation: row.translation };
}
