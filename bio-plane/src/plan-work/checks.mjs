/* plan-work's refusal rows (requirements: `build/requirements/plan-work.md`). DEC-49: every refusal this module mints
 * carries its code, its row and the member's translation. The family is C-151, reserved for this module (K2794); each
 * code is minted at one site (K231), named by its row's `where`. Translations are BOB's drafts, the UX stream's to
 * revise. Refusals of the modules this one uses are relayed with their own rows, through their exported sites:
 * `NO_SUCH_PLAN` (`action-plans.noSuchPlan`, its R22), `PLAN_CLOSED` (`refusePlanClosed`), `PLAN_NO_REASON`
 * (`refuseReason`, its R4's rule), `OPTION_KEY_REFUSED` (`refuseKeys`, its R26), `NO_SUCH_OPTION`
 * (`refuseNoSuchOption`) and `MACHINE_CANNOT_PLAN` (its row, C-124.1, read from `ACTION_PLAN_CHECKS`); a second
 * registration's refusal is `membership.listenerRefusal`'s. */

const at = (fn, region) => `src/plan-work/index.mjs ${fn} > ${region}`;

export const PLAN_WORK_CHECKS = Object.freeze({
  MATTER_NOT_OF_PLAN: {
    check: 'C-151.1', where: at("#matter", "is-matter-of-plan"),
    translation: 'That matter is not one this plan is about. Name one of the plan\'s matters. Nothing was written.',
  },
  REVIEW_RHYTHM_REFUSED: {
    check: 'C-151.2', where: at("planReviewRhythm", "is-review-rhythm"),
    translation: 'A review reminder repeats weekly, monthly or yearly from a first day, in a time zone, as a calendar '
      + 'recurrence can say it. The one given could not be read that way. Nothing was written.',
  },
  NO_SUCH_ITEM: {
    check: 'C-151.3', where: at("#item", "is-item-seen"),
    translation: 'No deadline, checkpoint, proposed escalation stage or hold you may see answers to that. One you may '
      + 'not see is answered exactly as one that does not exist. Nothing was written.',
  },
  PLAN_WORK_TEXT_REFUSED: {
    check: 'C-151.4', where: at("refuseText", "is-text-written"),
    translation: 'This needs words of your own, within the length shown, with no quotation mark, backslash or line '
      + 'break where it is one line. Nothing was written.',
  },
  NO_SUCH_PREP_ITEM: {
    check: 'C-151.5', where: at("#prepItem", "is-prep-item-held"),
    translation: 'The plan holds no preparation item of that id. Nothing was written.',
  },
  PREP_ITEM_DONE: {
    check: 'C-151.6', where: at("#prepAct", "is-prep-item-open"),
    translation: 'That preparation item is already done. Add a new one if there is more to do. Nothing was written.',
  },
  COMMENT_TARGET_REFUSED: {
    check: 'C-151.7', where: at("#commentTarget", "is-comment-target"),
    translation: 'A comment is on one of the plan\'s options, one of the actions started from it, or a draft prepared '
      + 'for one of those actions. The one named is none of those. Nothing was written.',
  },
  PLAN_WORK_PROVIDER_UNAVAILABLE: {
    check: 'C-151.8', where: at("refuseProviderUnavailable", "is-provider-present"),
    translation: 'This reads part of the record that is not in your group\'s Civicsmith yet, so it is not answered in '
      + 'part. Nothing was written.',
  },
});

/** One constructor for every refusal minted here: `reason`, the site's own `detail` and keys, then `code`, `check` and
 *  `translation` from the row. */
export function refusal(code, detail, extra) {
  const row = PLAN_WORK_CHECKS[code];
  return { ok: false, reason: code, detail, ...(extra || {}), code, check: row.check, translation: row.translation };
}
