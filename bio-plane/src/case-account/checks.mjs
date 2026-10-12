/* case-account's own refusal rows (requirements: `build/requirements/case-account.md`, R13, R14). DEC-49: every refusal
 * this module answers with a catalogue row carries its code, its row and the member's translation, so a surface shows the
 * same sentence wherever the act is reached. Its earlier refusals carry no row of their own (R1–R7 answer plain refusals;
 * `ACCEPT_MUST_REAUTHOR` is record-grammar's shared row, `NO_SUCH_PROJECT` membership's, `MINT_EXHAUSTED` record-core's).
 *
 * T45 (R13, R14; Actions D4, D11a; v0.2 rules 9, 15): a new family, C-153 (K2794 reserved C-148–C-152 for T45's other
 * new families), its rows numbered in this order for promotion's stamp. The translations are BOB's drafts (R14's
 * verbatim), re-wordable by the UX design stream; the family and its order are BOB's (J1, B2). (T46; R16) C-153.2 reads
 * its words from `words.json` by key (`ADVOCACY_WORDS`). */

const at = (fn, region) => `src/case-account/index.mjs ${fn} > ${region}`;

/* R16 (T46; DEC-194; N913): the refusal words of `words.json` (`docs/development/ux-substrate/screens/words.json`) this
   module's rows translate by, each `en` verbatim, read by key (`refusal.<CODE>`), as membership's `HANDLE_WORDS` and
   extraction's `TRANSCRIBE_WORDS` are. The list holds one of C-153's codes, C-153.2; the rows it does not hold (C-153.1,
   C-153.3) keep their own translations. */
export const ADVOCACY_WORDS = Object.freeze({
  'refusal.ADVOCACY_NOT_OWN_PROJECT': "Your own text is checked only in your own project: a hidden project set as yours, "
    + "with you its one member. Nothing was written.",
});

export const CASE_ACCOUNT_CHECKS = Object.freeze({
  /* R14 (v0.2 rule 15): a counsel matter is never evidence outside it. */
  ACCOUNT_CITES_COUNSEL_MATTER: Object.freeze({
    check: 'C-153.1', where: at("#held", "is-cite-counsel-matter"),
    translation: 'This sentence cites something from a counsel matter, which is never used as evidence outside it. '
      + 'Cite something else, or leave it out. Nothing was written.',
  }),
  /* R13 (v0.2 rule 9): a member's own text is checked in their own hidden project, and only there. */
  ADVOCACY_NOT_OWN_PROJECT: Object.freeze({
    check: 'C-153.2', where: at("advocacyCheck", "is-advocacy-own-project"),
    translation: ADVOCACY_WORDS['refusal.ADVOCACY_NOT_OWN_PROJECT'],
  }),
  /* R13 (v0.2 rules 1, 9): a member brings their own text; a machine never asks for the check. */
  MACHINE_CANNOT_CHECK_ADVOCACY: Object.freeze({
    check: 'C-153.3', where: at("advocacyCheck", "is-advocacy-member"),
    translation: 'Only members check their own text against the record, and this request named no member. '
      + 'Nothing was written.',
  }),
});
