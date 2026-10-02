/* local-facts' refusal rows (requirements: `build/requirements/local-facts.md`, R8). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation. A new module with nothing moved: its rows are a new
 * family, C-126 (K933), every row stamped by 1.52.0 (T22's L2, K989). No translation names a place (R8, `layers.md`
 * rule 1). */

const at = (fn, region) => `src/local-facts/index.mjs ${fn} > ${region}`;

export const LOCAL_FACTS_CHECKS = Object.freeze({
  MACHINE_CANNOT_CONFIRM: {
    check: "C-126.1", where: at("machineRefusal", "is-fact-member"),
    translation: "Confirming, correcting or disputing a local fact (a holiday calendar, an office's hours, the time "
      + "zone) is a member's act. An assistant may re-check a source and report what it found; it may not record a "
      + "confirmation. Sign in as a member. Nothing was written.",
  },
  NO_SUCH_FACT: {
    check: "C-126.2", where: at("noSuchFact", "is-fact-named"),
    translation: "No local fact of this instance's active jurisdiction profiles answers to that path. A path names "
      + "one profile's holiday year, an office's hours or the time zone. Nothing was written.",
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
});

/** A refusal carrying its row. Called with the code as a literal at each site, so the DEC-49 guard reads which code a
 *  marked region mints. */
export function refusal(code, detail, extra) {
  const row = LOCAL_FACTS_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
}
