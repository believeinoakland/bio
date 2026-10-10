/* answers' refusal rows (requirements: `build/requirements/answers.md`, R24). DEC-49: every refusal this module answers
 * carries its code, its row and the member's translation. A new module: its rows are a new family, C-135 (the next free
 * after hypotheses' C-134; B3, K1607), awaiting promotion's stamp (row-census, plan T33 Rules (9)); a change to any row moves
 * `CATALOG_VERSION` at that stamp (rule 17). `NOT_AN_ADMIN` is membership's (its R84) and the saved-query refusals are
 * query-language's (its R30): answered through them, never minted here. No translation names a place (R25). */

const at = (fn, region) => `src/answers/${fn} > ${region}`;
const row = (n, fn, region, translation) => Object.freeze({ check: `C-135.${n}`, where: at(fn, region), translation });

export const ANSWERS_CHECKS = Object.freeze({
  ANSWER_MALFORMED: row(1, "check.mjs checkAnswer", "is-answer-shape",
    "The assistant's answer was not in the form every answer must take, so none of it is shown. Ask again; "
    + "nothing was changed."),
  ANSWER_CITES_UNREAD: row(2, "check.mjs checkAnswer", "is-holding-read",
    "This sentence quoted or rested on something the assistant did not read for this question, or quoted it in "
    + "words the record does not hold, so it is not shown."),
  ANSWER_FIGURE_UNSOURCED: row(3, "check.mjs checkAnswer", "is-figure-sourced",
    "This sentence stated a figure that no calculation or money fact the assistant read gives, so it is not shown."),
  ANSWER_RULE_NOT_PLANE: row(4, "check.mjs checkAnswer", "is-rule-plane",
    "This sentence stated a rule that did not come from the record's own rule services, so it is not shown. The "
    + "assistant never states a rule from its own knowledge."),
  ANSWER_ABSENCE_WITHOUT_LEVEL: row(5, "check.mjs checkAnswer", "is-absence-level",
    "This sentence said something is missing without saying where the record looked, or in words other than the "
    + "record's own, so it is not shown."),
  RULE_SERVICE_UNKNOWN: row(6, "rules.mjs ruleAnswer", "is-rule-service",
    "No rule service of that name is held in your group's Civicsmith. Nothing was read."),
  RULE_SERVICE_EXISTS: row(7, "rules.mjs registerRuleService", "is-rule-service-new",
    "A rule service of that name is already held; the first one stays. Nothing was changed."),
  RULE_SERVICES_OFF: row(8, "rules.mjs ruleAnswer", "is-rule-services-on",
    "The record's rule services are switched off in your group's Civicsmith until the assistant's measured bar is met. Nothing "
    + "was read."),
  MACHINE_CANNOT_AUTHOR: row(9, "standing.mjs standingQuestionSet", "is-standing-member",
    "A standing question is kept only by a member's own act; the machine cannot set one. Nothing was written."),
  BAD_CADENCE: row(10, "standing.mjs standingQuestionSet", "is-standing-cadence",
    "A standing question runs daily, weekly or monthly. Choose one of these. Nothing was written."),
  STANDING_NEEDS_END: row(11, "standing.mjs standingQuestionSet", "is-standing-end",
    "A standing question needs an end date after today, so it does not run for ever. Nothing was written."),
  NO_SUCH_STANDING_QUESTION: row(12, "standing.mjs", "is-standing-yours",
    "No standing question of yours answers to that. Nothing was changed."),
  STANDING_NEEDS_SEARCH: row(13, "standing.mjs standingQuestionSet", "is-standing-search",
    "A standing question keeps one search: a saved search, or a find in a document, a set or a project. Give one of "
    + "these, not both. Nothing was written."),
  ANSWER_VERDICT_WORD: row(14, "sentences.mjs checkSentences", "is-no-verdict-word",
    "This sentence gave a verdict, a likelihood or a rating in Civicsmith's own words, so it is not shown. Civicsmith "
    + "says what the record holds and never judges it."),
  ANSWER_CAUSE_UNESTABLISHED: row(15, "sentences.mjs checkSentences", "is-cause-established",
    "This sentence stated a cause that no finding it quotes establishes, so it is not shown: the cause is not "
    + "established. A cause a body gave is shown only in its own quoted words."),
});

/** The row's fields beside a refusal: `{ok: false, reason, code, check, translation, detail, ...extra}`. */
export function refusal(code, detail, extra = {}) {
  const r = ANSWERS_CHECKS[code];
  return { ok: false, reason: code, code, check: r ? r.check : null, translation: r ? r.translation : null, detail,
           ...extra };
}
