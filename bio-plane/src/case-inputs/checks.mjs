/* case-inputs' refusal rows and the words it reads by key (requirements: `build/requirements/case-inputs.md`, R1, R9, R10,
 * R12, R17).
 * DEC-49: every refusal this module answers from a row carries its code, its catalogue row and the member's translation.
 *
 * Copied from `case-authoring`'s `checks.mjs` with their ids, codes and translations unchanged (K624; N908; R12), each
 * `where` re-pointed to this module's region: C-82.2–C-82.8 (`STATEMENT_ACK_CHECKS`, whole; C-82.1 is retired, D-521, and
 * its number is not reused; C-82.8 is DEC-88's, K1025) and C-136.3–C-136.8 (`CARRIED_OUTCOME_CHECKS`, a family object of
 * this module's beside `case-authoring`'s C-136.1 and C-136.2, as C-44 is shared). R17 (T47; DEC-199) is the one change:
 * C-136.5 reads `refusal.BAD_CARRIED_OUTCOME` by key. The changed rows wait for T48's promotion stamp (rule 17). */

import { word, localize } from '../setup-words/index.mjs';

const at = (fn, region) => `src/case-inputs/index.mjs ${fn} > ${region}`;

/* R10, R17 (T46: DEC-194, N913; T47: DEC-198 (7), DEC-199, N992): the words of `words.json`
   (`docs/development/ux-substrate/screens/words.json`) this module answers, each `en` verbatim, read by key, as
   membership's `HANDLE_WORDS` and extraction's `TRANSCRIBE_WORDS` are: R9's six rows (`refusal.<CODE>`) and the sign
   step's open-request sentences (`signing.openrequest.*`), whose `{placeholders}` are filled from R8's row or R9's field.
   The design stream's words: re-worded there, then re-taken here by key; a row never holds a copy of its sentence. */
export const CASE_INPUTS_WORDS = Object.freeze({
  'refusal.MACHINE_CANNOT_CARRY_OUTCOME': word('refusal.MACHINE_CANNOT_CARRY_OUTCOME'),
  'refusal.CARRY_NOT_A_PARTICIPANT': word('refusal.CARRY_NOT_A_PARTICIPANT'),
  'refusal.BAD_CARRIED_OUTCOME': 'An outcome carried into a case needs its kind (a success, a correction by the office, or a '
    + 'harm addressed), your statement on one line with no quotation marks or backslash and at most 2,000 characters, what '
    + 'it cites, and the date it happened. {field} is missing or isn\'t in that form. Nothing was written.',
  'refusal.NO_SUCH_CARRIED_OUTCOME': word('refusal.NO_SUCH_CARRIED_OUTCOME'),
  'refusal.CARRIED_OUTCOME_SETTLED': word('refusal.CARRIED_OUTCOME_SETTLED'),
  'refusal.CARRY_NO_REASON': word('refusal.CARRY_NO_REASON'),
  'signing.openrequest.line': '{whom} was asked for comment on {asked_at}. The window for a reply closes on '
    + '{window_closes}; the reply answers {answered} of the {claims} claims the request laid out.',
  'signing.openrequest.noreply': '{whom} was asked for comment on {asked_at}. The window for a reply closes on '
    + '{window_closes}; no reply is recorded.',
  'signing.openrequest.notlaidout': '{whom} was asked for comment on {asked_at}. The window for a reply closes on '
    + '{window_closes}; no reply laid out claim by claim is recorded.',
  'signing.openrequest.nowindow.line': '{whom} was asked for comment on {asked_at}, with no date given for the window to '
    + 'close; the reply answers {answered} of the {claims} claims the request laid out.',
  'signing.openrequest.nowindow.noreply': '{whom} was asked for comment on {asked_at}, with no date given for the window to '
    + 'close; no reply is recorded.',
  'signing.openrequest.nowindow.notlaidout': '{whom} was asked for comment on {asked_at}, with no date given for the window '
    + 'to close; no reply laid out claim by claim is recorded.',
  'signing.openrequest.unread': word('signing.openrequest.unread'),
  'signing.openrequest.noquote': '{whom}\'s reply asks not to be quoted, so the case says what it says without quoting '
    + 'its words.',
});

/* R10: a word read by key, with its `{placeholders}` filled from `fill`; a throw for a key the list lacks, because a
   missing sentence is silent and reaches a person while a throw is loud in a test (DEC-49's rule). A placeholder not in
   `fill` is left for the screen. */
export function fillWords(key, fill = {}) {
  const en = CASE_INPUTS_WORDS[key];
  if (typeof en !== 'string' || !en) throw new Error(`fillWords: ${key} is not one of this module's words (words.json)`);
  return en.replace(/\{([a-z_]+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(fill, k) ? String(fill[k]) : m));
}
const words = (key) => fillWords(key);

/* C-136.3–C-136.8 — R9 (T45; N855 (6c); Actions D5, D6c; v0.2 §3 Success record, rule 17): an outcome carried into a
   case's next edition by a member's act (`carryOutcome`, `withdrawCarriedOutcome`). The next free numbers of C-136 when
   T45 drew them, the family held by `case-authoring` (C-136.1, C-136.2) and this module alike, as C-44 is. Each reads its
   translation from `CASE_INPUTS_WORDS` by key (R10, R17), never a copy. */
export const CARRIED_OUTCOME_CHECKS = Object.freeze({
  MACHINE_CANNOT_CARRY_OUTCOME: {
    check: 'C-136.3',
    where: at('carryOutcome', 'is-carry-machine'),
    translation: words('refusal.MACHINE_CANNOT_CARRY_OUTCOME'),
  },
  CARRY_NOT_A_PARTICIPANT: {
    check: 'C-136.4',
    where: at('carryOutcome', 'is-carry-participant'),
    translation: words('refusal.CARRY_NOT_A_PARTICIPANT'),
  },
  /* R17 (DEC-199): the sentence is true of a missing and a malformed field alike; the row holds it with `{field}` for the
     screen, and the refusal answers it filled with the field R9 names (ai-use's `AI_LIMIT_INVALID` form). */
  BAD_CARRIED_OUTCOME: {
    check: 'C-136.5',
    where: at('carryOutcome', 'is-carry-shaped'),
    translation: words('refusal.BAD_CARRIED_OUTCOME'),
  },
  NO_SUCH_CARRIED_OUTCOME: {
    check: 'C-136.6',
    where: at('withdrawCarriedOutcome', 'is-carried-outcome-found'),
    translation: words('refusal.NO_SUCH_CARRIED_OUTCOME'),
  },
  CARRIED_OUTCOME_SETTLED: {
    check: 'C-136.7',
    where: at('withdrawCarriedOutcome', 'is-carried-outcome-pending'),
    translation: words('refusal.CARRIED_OUTCOME_SETTLED'),
  },
  CARRY_NO_REASON: {
    check: 'C-136.8',
    where: at('withdrawCarriedOutcome', 'is-carry-reasoned'),
    translation: words('refusal.CARRY_NO_REASON'),
  },
});

/* C-82 — op=statementack's refusals (IC-246, D-507; BIO_Publication_v0_1.md §3 rule 11). The words are BOB #33's,
   approved 2026-09-24; C-82.6 and C-82.7 were generalised at CONDUCT #20's union to be true of both the statement's
   writer and the case's publisher (§3 rule 13). C-82.5 says "This draft": the case-document door cannot reach an empty
   statement, because op=publish refuses NO_STATEMENT before authoring any document (case-authoring R3). */
export const STATEMENT_ACK_CHECKS = Object.freeze({
  STATEMENT_ACK_NO_SUBJECT: {
    check: 'C-82.2',
    where: at('acknowledgeStatement', 'is-statement-ack-subject'),
    translation: word('refusal.STATEMENT_ACK_NO_SUBJECT'),
  },
  STATEMENT_ACK_ALREADY_SIGNED: {
    check: 'C-82.3',
    where: at('acknowledgeStatement', 'is-statement-ack-signed'),
    translation: localize('case-inputs.checks.this_edition_of_the_case', 'This edition of the case is already signed, and the signature covers its list of who acknowledged the statement, so a new acknowledgement could not appear in it. A signed edition is corrected only by publishing the next edition.'),
  },
  STATEMENT_ACK_NOT_A_PARTICIPANT: {
    check: 'C-82.4',
    where: at('acknowledgeStatement', 'is-statement-ack-participant'),
    translation: word('refusal.STATEMENT_ACK_NOT_A_PARTICIPANT'),
  },
  STATEMENT_ACK_NO_STATEMENT: {
    check: 'C-82.5',
    where: at('acknowledgeStatement', 'is-statement-ack-statement'),
    translation: word('refusal.STATEMENT_ACK_NO_STATEMENT'),
  },
  STATEMENT_ACK_BY_ITS_AUTHOR: {
    check: 'C-82.6',
    where: at('acknowledgeStatement', 'is-statement-ack-by-its-author'),
    translation: localize('case-inputs.checks.you_wrote_this_statement_or', 'You wrote this statement or published this case, so you have already read it. An acknowledgement means a second person has read what the case leaves out, so it has to come from someone else: another participant in the project, or a reader given a review copy. The case can be published without one, and will say so.'),
  },
  STATEMENT_ACK_AUTHOR_UNDETERMINED: {
    check: 'C-82.7',
    where: at('acknowledgeStatement', 'is-statement-ack-author-undetermined'),
    translation: word('refusal.STATEMENT_ACK_AUTHOR_UNDETERMINED'),
  },
  /* R1 (DEC-88; K1025, K1030): the acknowledger's own words, asked after C-82.6, the last refusal before anything is
     read for the write. New in T22, stamped in `CATALOG_VERSION` 1.53.0 (T23 L2). */
  STATEMENT_ACK_NO_REASON: {
    check: 'C-82.8',
    where: at('acknowledgeStatement', 'is-statement-ack-reasoned'),
    translation: word('refusal.STATEMENT_ACK_NO_REASON'),
  },
});
