/* local-facts' refusal rows (requirements: `build/requirements/local-facts.md`, R8). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation. A new module with nothing moved: its rows are a new
 * family, C-126 (K933), every row stamped by 1.52.0 (T22's L2, K989). No translation names a place (R8, `layers.md`
 * rule 1). */

import { word } from "../setup-words/index.mjs";

const at = (fn, region) => `src/local-facts/index.mjs ${fn} > ${region}`;
const atRule = (fn, region) => `src/local-facts/rules.mjs ${fn} > ${region}`;

/* R16 (T46; DEC-194; N913; T50-40): the refusal words of `words.json` (`docs/development/ux-substrate/screens/words.json`),
   each `en` verbatim, read by key (as membership's `HANDLE_WORDS` and extraction's `TRANSCRIBE_WORDS` are); `{errors}` is
   left for the screen, the refusal's `errors` beside it. `words.json` holds a key for every C-126 row (DEC-260, K3374), so
   every row takes its translation from these keys, and a word the list changes (N1160's "team") changes here with it. */
export const LOCAL_FACTS_WORDS = Object.freeze({
  'refusal.MACHINE_CANNOT_CONFIRM': word("refusal.MACHINE_CANNOT_CONFIRM"),
  'refusal.NO_SUCH_FACT': word("refusal.NO_SUCH_FACT"),
  'refusal.FACT_ACT_REFUSED': word("refusal.FACT_ACT_REFUSED"),
  'refusal.FACT_HOW_REFUSED': word("refusal.FACT_HOW_REFUSED"),
  'refusal.FACT_VALUE_REFUSED': word("refusal.FACT_VALUE_REFUSED"),
  'refusal.MACHINE_CANNOT_DRAFT_RULE': word("refusal.MACHINE_CANNOT_DRAFT_RULE"),
  'refusal.RULE_SECTION_UNKNOWN': word("refusal.RULE_SECTION_UNKNOWN"),
  'refusal.RULE_ENTRY_INVALID': word("refusal.RULE_ENTRY_INVALID", { errors: "{errors}" }),
  'refusal.RULE_NO_SOURCE': word("refusal.RULE_NO_SOURCE"),
  'refusal.RULE_IN_PROFILE': word("refusal.RULE_IN_PROFILE"),
  'refusal.RULE_NO_REASON': word("refusal.RULE_NO_REASON"),
  'refusal.NO_SUCH_GROUP_RULE': word("refusal.NO_SUCH_GROUP_RULE"),
  'refusal.RULE_SELF_CONFIRM': word("refusal.RULE_SELF_CONFIRM"),
  'refusal.RULE_NOT_DRAFTED': word("refusal.RULE_NOT_DRAFTED"),
  'refusal.RULE_NEEDS_QUALIFICATION': word("refusal.RULE_NEEDS_QUALIFICATION"),
  'refusal.RULE_NOT_CONFIRMED': word("refusal.RULE_NOT_CONFIRMED"),
});

export const LOCAL_FACTS_CHECKS = Object.freeze({
  MACHINE_CANNOT_CONFIRM: {
    check: "C-126.1", where: at("machineRefusal", "is-fact-member"),
    translation: LOCAL_FACTS_WORDS['refusal.MACHINE_CANNOT_CONFIRM'],
  },
  NO_SUCH_FACT: {
    check: "C-126.2", where: at("noSuchFact", "is-fact-named"),
    translation: LOCAL_FACTS_WORDS['refusal.NO_SUCH_FACT'],
  },
  FACT_ACT_REFUSED: {
    check: "C-126.3", where: at("factConfirm", "is-fact-act"),
    translation: LOCAL_FACTS_WORDS['refusal.FACT_ACT_REFUSED'],
  },
  FACT_HOW_REFUSED: {
    check: "C-126.4", where: at("factConfirm", "is-fact-how"),
    translation: LOCAL_FACTS_WORDS['refusal.FACT_HOW_REFUSED'],
  },
  FACT_VALUE_REFUSED: {
    check: "C-126.5", where: at("factConfirm", "is-fact-correction"),
    translation: LOCAL_FACTS_WORDS['refusal.FACT_VALUE_REFUSED'],
  },
  /* R10-R13 (T45): the group's own jurisdiction rules. */
  MACHINE_CANNOT_DRAFT_RULE: {
    check: "C-126.6", where: atRule("machineRuleRefusal", "is-rule-member"),
    translation: LOCAL_FACTS_WORDS['refusal.MACHINE_CANNOT_DRAFT_RULE'],
  },
  RULE_SECTION_UNKNOWN: {
    check: "C-126.7", where: atRule("sectionRefusal", "is-rule-section"),
    translation: LOCAL_FACTS_WORDS['refusal.RULE_SECTION_UNKNOWN'],
  },
  RULE_ENTRY_INVALID: {
    check: "C-126.8", where: atRule("ruleDraft", "is-rule-entry"),
    translation: LOCAL_FACTS_WORDS['refusal.RULE_ENTRY_INVALID'],
  },
  RULE_NO_SOURCE: {
    check: "C-126.9", where: atRule("ruleDraft", "is-rule-source"),
    translation: LOCAL_FACTS_WORDS['refusal.RULE_NO_SOURCE'],
  },
  RULE_IN_PROFILE: {
    check: "C-126.10", where: atRule("ruleDraft", "is-rule-new"),
    translation: LOCAL_FACTS_WORDS['refusal.RULE_IN_PROFILE'],
  },
  RULE_NO_REASON: {
    check: "C-126.11", where: atRule("reasonRefusal", "is-rule-reason"),
    translation: LOCAL_FACTS_WORDS['refusal.RULE_NO_REASON'],
  },
  NO_SUCH_GROUP_RULE: {
    check: "C-126.12", where: atRule("noSuchRule", "is-rule-named"),
    translation: LOCAL_FACTS_WORDS['refusal.NO_SUCH_GROUP_RULE'],
  },
  RULE_SELF_CONFIRM: {
    check: "C-126.13", where: atRule("ruleConfirm", "is-rule-other"),
    translation: LOCAL_FACTS_WORDS['refusal.RULE_SELF_CONFIRM'],
  },
  RULE_NOT_DRAFTED: {
    check: "C-126.14", where: atRule("ruleConfirm", "is-rule-drafted"),
    translation: LOCAL_FACTS_WORDS['refusal.RULE_NOT_DRAFTED'],
  },
  RULE_NEEDS_QUALIFICATION: {
    check: "C-126.15", where: atRule("ruleConfirm", "is-rule-qualified"),
    translation: LOCAL_FACTS_WORDS['refusal.RULE_NEEDS_QUALIFICATION'],
  },
  RULE_NOT_CONFIRMED: {
    check: "C-126.16", where: atRule("ruleOffer", "is-rule-confirmed"),
    translation: LOCAL_FACTS_WORDS['refusal.RULE_NOT_CONFIRMED'],
  },
});

/** A refusal carrying its row. Called with the code as a literal at each site, so the DEC-49 guard reads which code a
 *  marked region mints. */
export function refusal(code, detail, extra) {
  const row = LOCAL_FACTS_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
}
