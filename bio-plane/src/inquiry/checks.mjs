/* inquiry's own rows (R38; N345, DEC-49; K343's pattern in the C-2 family): C-2.11–C-2.17, the contradiction inquiry's
 * grammar arm (R47) and its one-candidate rule (R11). C-2.1–C-2.10 stay the catalogue's (`checks/bio-checks.mjs`), and so
 * do the rows `./grammar.mjs` names from it. Each row here is an invariant of this module with its test
 * (`test/m/inquiry/contradiction.test.mjs`); promotion stamps them. */

/* N345 (`BIO_Case_Making_v0_1.md` §CONTRADICTION, DEC-76 items 1–3, DEC-84 item 3). A contradiction candidate taken up
 * becomes an inquiry that names it (`contradiction: {candidate}`), and when concluded says what the conflict turned out
 * to be (`resolution`). The rows are judged at every promotion of an inquiry, which is every door that writes one
 * (take-up, resolve, `basis-versions`' `conclude`, a member's own edit), so no door concludes a contradiction inquiry
 * without its kind. */
export const INQUIRY_CONTRADICTION_CHECKS = {
  CONTRADICTION_LINK_MALFORMED: {
    check: 'C-2.11',
    where: 'src/inquiry/contradiction.mjs contradictionFindings > is-contradiction-link',
    translation: 'A contradiction inquiry names the candidate it was taken up from by that candidate\'s id, and this '
      + 'document\'s link is not one. Take the candidate up again from where it is shown. Nothing was written.',
  },
  RESOLUTION_WITHOUT_CONTRADICTION: {
    check: 'C-2.12',
    where: 'src/inquiry/contradiction.mjs contradictionFindings > is-resolution-placed',
    translation: 'Only an inquiry taken up from a contradiction records what kind of contradiction it turned out to '
      + 'be, and this one was not taken up from one. Remove the resolution, or take the contradiction up first. '
      + 'Nothing was written.',
  },
  RESOLUTION_MISSING: {
    check: 'C-2.13',
    where: 'src/inquiry/contradiction.mjs contradictionFindings > is-resolution-present',
    translation: 'A contradiction inquiry is concluded by saying what the conflict turned out to be: how the two sides '
      + 'differ, which one is wrong, or that the conflict is real. This conclusion does not say. Name its kind. '
      + 'Nothing was written.',
  },
  RESOLUTION_KIND_UNKNOWN: {
    check: 'C-2.14',
    where: 'src/inquiry/contradiction.mjs contradictionFindings > is-resolution-kind',
    translation: 'That is not one of the kinds a contradiction can be resolved as. The kinds are listed with the '
      + 'question. Nothing was written.',
  },
  RESOLUTION_INCOMPLETE: {
    check: 'C-2.15',
    where: 'src/inquiry/contradiction.mjs contradictionFindings > is-resolution-complete',
    translation: 'This kind of resolution needs one more thing to be complete: the respect in which the sides differ, '
      + 'which side is wrong and why, or the rule that reconciles them. The missing part is named. Nothing was written.',
  },
  EXPLORES_MALFORMED: {
    check: 'C-2.16',
    where: 'src/inquiry/contradiction.mjs contradictionFindings > is-explores-shape',
    translation: 'A question that explores a contradiction names one thing it explores: one respect in which the sides '
      + 'may differ, one rule that may reconcile them, or one hypothesis. This one names none, several, or one the '
      + 'record does not know. Nothing was written.',
  },
  CANDIDATE_ALREADY_TAKEN_UP: {
    check: 'C-2.17',
    where: 'src/inquiry/index.mjs check > is-candidate-taken-up',
    translation: 'That contradiction has already been taken up as another question, which is named. Work on it there, '
      + 'so that one conflict has one place where it is resolved. Nothing was written.',
  },
};
