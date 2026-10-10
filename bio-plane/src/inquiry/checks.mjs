/* inquiry's own rows (R38, R50; N345, DEC-49; K343's pattern in the C-2 family): C-2.11–C-2.18, the contradiction
 * inquiry's grammar arm (R47) and its one-candidate rule (R11), and C-66.5, the carried-forward `surfaced_by` (R50).
 * C-2.1–C-2.7, C-2.9 and C-2.10 are their owners', not the catalogue's; the rows the inquiry's grammar raises
 * (C-2.8, C-6.1, C-54.1) and its acts mint (C-33.13, C-33.22, C-33.23, C-32.7, C-32.8) are `inquiry-grammar`'s, read at
 * `./grammar.mjs`. Each row here is an invariant of this module with its test (`test/m/inquiry/contradiction.test.mjs`,
 * `surfaced.test.mjs`); promotion stamps them. */

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
    translation: 'This resolution is not complete. A resolution gives its kind together with what that kind needs: '
      + 'the respect in which the sides differ, which side is wrong and why, or the rule that reconciles them. The part '
      + 'that is missing or not in that form is named. Nothing was written.',
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
  /* N369 (proposed in INQUIRY #5 J1; stamped 1.47.0, T17): the arm's own failure, which C-2.11's words are not true of. */
  CONTRADICTION_ARM_FAILED: {
    check: 'C-2.18',
    where: 'src/inquiry/contradiction.mjs contradictionFindings > is-contradiction-arm-judged',
    translation: 'The check of this question\'s contradiction fields (its link, its resolution, what it explores) stopped '
      + 'with an error instead of answering, so the question is refused rather than let through. The error is in the '
      + 'check and says nothing yet about the document. Nothing was written.',
  },
};

/* REC-179 / C-66.5 (INVESTIGATIVE-SESSION.md §11 item 5, "Rule 2's reach", BOB #30; D-78's stated intent that a revision
 * carries the value forward), moved here from the catalogue's `SURFACE_CHECKS` with its number and translation unchanged
 * (T19 layer 6, R50); its `where` names this module's site, stamped 1.50.0 (K884). `surfaced_by` records the SURFACING
 * ACT, and that act happens once, at the creation, decided there by the server (D-78's restamp, or REC-173's verified
 * replay). Measured before this existed (`0e7cc03e`): the restamp runs only on a creation and nothing compared a
 * revision's value with the current version's, so a revision relabelled an assistant's question `human` (or a member's
 * `agent`) and landed, and the surfacing row then contradicted the bytes it describes. Asked inside the promotion's
 * transaction after the compare-and-swap (the current version is then the one the revision is based on) and before any
 * write. The comparison is of the value the record's parser reads out of each version's `bundle.md`, so a respelling of
 * the same value lands, and an unreadable or absent value is a value: a revision may not supply an origin its creation
 * did not record, nor drop one it did. */
export const INQUIRY_SURFACE_CHECKS = {
  SURFACED_BY_REWRITTEN: {
    check: 'C-66.5',
    where: 'src/inquiry/index.mjs check > is-promote-surfaced-by, reached from op=promote through the step inquiry registers with promotion (K31)',
    translation: 'This revision changes who surfaced the question, a member or an assistant. That is recorded '
      + 'once, when the question is opened, and a later edit cannot rewrite it. Nothing was saved. Keep the '
      + 'value the current version carries and save the revision again.',
  },
};

/* R61 (T41; D59; inquiry-grammar R18's store-side share; K2448, K2472): a leg's `bias_applied` statement that is not in
 * the lens in force for the inquiry's project (or the instance), asked of `bias.statementInForce` (its R49) at the act
 * that records it. The next free number of this module's C-2 family (C-2.18 the last held at the job's START); the
 * translation is BOB's draft until `words.json` holds a key for it, and the row awaits T41's stamp. Minted at one site,
 * `biasNotInForce`, which `basis-versions` R48 and `case-disclosures` R31 answer through (K231). */
export const INQUIRY_BIAS_CHECKS = {
  BIAS_APPLICATION_NOT_IN_FORCE: {
    check: 'C-2.19',
    where: 'src/inquiry/index.mjs biasNotInForce > is-bias-application-in-force, reached from check > is-bias-applied',
    translation: 'A leg says a statement of the lens shaped how it was weighed, and that statement is not in the lens '
      + 'in force for this question\'s project now, or whether it is could not be read. Name a statement of the lens '
      + 'in force, or take the application off the leg. Nothing was written.',
  },
};

/* R39 (T41; DEC-188 (7)): the words of `words.json` (`docs/development/ux-substrate/screens/words.json`) this module's
 * refusals read by key, each `en` verbatim; the UX stream re-words them there (its `question.refused.drawnon` replaced
 * BOB's drafted words). */
export const QUESTION_WORDS = Object.freeze({
  'question.refused.drawnon': 'This question can\'t be set aside for the whole group, because a project draws on it. '
    + 'Set it aside in your project instead; that leaves it as it is everywhere else.',
});

/* R59 (T41; D13; K2479, K2480): the warning a promotion of a question carries when its question or named entities name a
 * person in no public role. A warning, never a refusal, so it takes no check number. Its words are BOB's draft
 * (INQUIRY #16 J1, K2480) until `words.json` holds the key, then read from there by key; `{persons}` is left for the
 * screen to fill with the persons the warning names. */
export const INQUIRY_WARNINGS = Object.freeze({
  PERSON_IN_NO_PUBLIC_ROLE: Object.freeze({
    key: 'question.warning.person',
    translation: 'Investigations look at people through their part in a public matter, never at a private life. This '
      + 'question names {persons}, whom the record holds in no public role. You decide whether to go on.',
  }),
});
