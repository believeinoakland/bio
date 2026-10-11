/* local-facts' refusal rows (requirements: `build/requirements/local-facts.md`, R8). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation. A new module with nothing moved: its rows are a new
 * family, C-126 (K933), every row stamped by 1.52.0 (T22's L2, K989). No translation names a place (R8, `layers.md`
 * rule 1). */

const at = (fn, region) => `src/local-facts/index.mjs ${fn} > ${region}`;
const atRule = (fn, region) => `src/local-facts/rules.mjs ${fn} > ${region}`;

export const LOCAL_FACTS_CHECKS = Object.freeze({
  MACHINE_CANNOT_CONFIRM: {
    check: "C-126.1", where: at("machineRefusal", "is-fact-member"),
    translation: "Confirming, correcting or disputing a local fact (a holiday calendar, an office's hours, the time "
      + "zone), and confirming a rule your group drafted, is a member's act. An assistant may re-check a source and "
      + "report what it found; it may not record a confirmation. Sign in as a member. Nothing was written.",
  },
  NO_SUCH_FACT: {
    check: "C-126.2", where: at("noSuchFact", "is-fact-named"),
    translation: "No local fact of the active jurisdiction profiles answers to that path. A path names one "
      + "profile's holiday year (of its office calendar or of a named closure list), an office's hours or the time "
      + "zone. Nothing was written.",
  },
  FACT_ACT_REFUSED: {
    check: "C-126.3", where: at("factConfirm", "is-fact-act"),
    translation: "A member confirms, corrects or disputes a local fact; this act is none of the three. Nothing was "
      + "written.",
  },
  FACT_HOW_REFUSED: {
    check: "C-126.4", where: at("factConfirm", "is-fact-how"),
    translation: "Say how you checked, in at most 500 characters: the official page and its address, a call to the "
      + "office, a visit. None was given, or it is too long. Nothing was written.",
  },
  FACT_VALUE_REFUSED: {
    check: "C-126.5", where: at("factConfirm", "is-fact-correction"),
    translation: "A correction gives the corrected value, in the form the profile holds that fact in, and its source "
      + "in at most 500 characters. The value is missing or not of that form, or the source is missing or too long. "
      + "Nothing was written.",
  },
  /* R10-R13 (T45): the group's own jurisdiction rules. */
  MACHINE_CANNOT_DRAFT_RULE: {
    check: "C-126.6", where: atRule("machineRuleRefusal", "is-rule-member"),
    translation: "Drafting or withdrawing your group's own jurisdiction rule is a member's act. An assistant may draft "
      + "one for you to read; it enters only when a member drafts it. Sign in as a member. Nothing was written.",
  },
  RULE_SECTION_UNKNOWN: {
    check: "C-126.7", where: atRule("ruleDraft", "is-rule-section"),
    translation: "A group's rule is a deadline or a legal fact; this names neither. Nothing was written.",
  },
  RULE_ENTRY_INVALID: {
    check: "C-126.8", where: atRule("ruleDraft", "is-rule-entry"),
    translation: "The rule is not in the form a jurisdiction profile holds a deadline or a legal fact in; the errors "
      + "say which field. Nothing was written.",
  },
  RULE_NO_SOURCE: {
    check: "C-126.9", where: atRule("ruleDraft", "is-rule-source"),
    translation: "A rule is drafted from its primary source: name the captured document and the part of it that "
      + "states the rule. No such capture is held where you can see it, or that part is not in it. Nothing was "
      + "written.",
  },
  RULE_IN_PROFILE: {
    check: "C-126.10", where: atRule("ruleDraft", "is-rule-new"),
    translation: "Your jurisdiction profiles, or a rule your group already applies, hold this rule already. Dispute "
      + "the profile's fact, or offer your correction to the profile's maintainers, instead. Nothing was written.",
  },
  NO_REASON: {
    check: "C-126.11", where: atRule("reasonRefusal", "is-rule-reason"),
    translation: "Say why, in at most 500 characters. None was given, or it is too long. Nothing was written.",
  },
  NO_SUCH_RULE: {
    check: "C-126.12", where: atRule("noSuchRule", "is-rule-named"),
    translation: "Your group holds no rule of its own by that name. Nothing was written.",
  },
  RULE_SELF_CONFIRM: {
    check: "C-126.13", where: atRule("ruleConfirm", "is-rule-other"),
    translation: "A rule is confirmed by a member other than the one who drafted it. Ask another member to check "
      + "it against its source. Nothing was written.",
  },
  RULE_NOT_DRAFTED: {
    check: "C-126.14", where: atRule("ruleConfirm", "is-rule-drafted"),
    translation: "This rule is already confirmed, or it was withdrawn; only a drafted rule is confirmed. Nothing was "
      + "written.",
  },
  RULE_NEEDS_QUALIFICATION: {
    check: "C-126.15", where: atRule("ruleConfirm", "is-rule-qualified"),
    translation: "A rule for a Tier 2 or Tier 3 matter, or one whose tier is not known, is confirmed by a "
      + "professional: state your qualification in your own words, in at most 500 characters. It is kept on this "
      + "confirmation only. Nothing was written.",
  },
  RULE_NOT_CONFIRMED: {
    check: "C-126.16", where: atRule("ruleOffer", "is-rule-confirmed"),
    translation: "Only a rule your group confirmed and still applies can be offered to the shared profile. Nothing "
      + "was written.",
  },
});

/** A refusal carrying its row. Called with the code as a literal at each site, so the DEC-49 guard reads which code a
 *  marked region mints. */
export function refusal(code, detail, extra) {
  const row = LOCAL_FACTS_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
}
