/* publication's invariants and refusal rows (requirements: `build/requirements/publication.md`, R33). DEC-49: every
 * refusal this module answers carries its code, its catalogue row and the member's translation.
 *
 * C-122.1 (R51, N364) is a family of its own here: a case's sources; C-122.2 (R58, DEC-112) and C-122.3, C-122.4 (R59,
 * N522) join it at T28, C-122.5 (R67's stop when no publisher could check a waiting edition; R33, N687) at T35, and
 * C-122.6 (R57's photo marks changed since preparation; N757, K2206) at T37, its translation `words.json`'s
 * `photo.refused.changed` since T38 (DEC-183 (4)).
 * C-92.1–.9 and C-92.13 (the attribution act) moved with the act to `case-tensions` (its R9; T33-62, T33-63), numbers
 * and translations unchanged, and left this table, so no row id is held twice.
 *
 * C-44.2, C-68.5 and C-98.1–.9, raised by `public-read`'s code since K651, are `public-read`'s (its R17), moved there
 * with their numbers, wheres and translations unchanged and deleted here (T19), so no row id is held twice.
 *
 * The case document's grammar (`CASE_DOCUMENT_FORMAT` … and its four predicates) is `case-grammar`'s since K651 (its
 * R1, which was this module's R20), re-exported here unchanged so every importer of this file reads what it read. */

export { CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V6, CASE_DOCUMENT_FORMAT_V4, CASE_DOCUMENT_FORMAT_V3,
         CASE_DOCUMENT_FORMAT_V2,
         CASE_DOCUMENT_FORMAT_LEGACY, CASE_DOCUMENT_FORMATS_ACCEPTED, caseDocumentStatesMemberBlocks,
         caseDocumentRequiresDisclosures, caseDocumentRequiresV4Disclosures,
         caseDocumentRequiresTensionSection } from "../case-grammar/index.mjs";

/* C-122 — A CASE'S SOURCES (R51; N364, DEC-78 item 5(d)), a new family held here: the one refusal of the commit that
   re-reads, at the signature, what the public may be told of each source the case document states. A consent withdrawn
   binds only later publications, and a commit is one: what the document states is re-read at it, and a statement no
   longer publishable stops the commit with nothing written. The remedy is a new preparation, which leaves it out. */
export const CASE_SOURCES_CHECKS = {
  SOURCE_CONSENT_WITHDRAWN: {
    check: 'C-122.1',
    where: 'src/publication/index.mjs commitCaseEdition > is-source-consent-withdrawn',
    translation: 'A source withdrew consent for a detail this case states, after the case was prepared. Prepare the '
      + 'case again, and it will leave that detail out. Nothing was published.',
  },
  /* C-122.2 (R58; DEC-112, K1268 BOB's decision 5): a preparation made before published cases carried their method and
     materials (any format but `bio-case-document/6` or `/7`, which is `/6` in every field: N538, K1365 (1)) is never
     committed; the remedy is a new preparation. */
  CASE_FORMAT_SUPERSEDED: {
    check: 'C-122.2',
    where: 'src/publication/index.mjs commitCaseEdition > is-case-format-current',
    translation: 'This case was prepared before published cases carried everything they rest on. Prepare it again, '
      + 'and sign the new preparation. Nothing was published.',
  },
  /* C-122.3, C-122.4 (R59; DEC-96 items 1, 4, N522): another group's work the case rests on is re-read at the commit,
     as R51 re-reads a source's consent. */
  ACCEPTANCE_WITHDRAWN_SINCE: {
    check: 'C-122.3',
    where: 'src/publication/index.mjs commitCaseEdition > is-accepted-work-standing',
    translation: "This group's acceptance of another group's work this case rests on was withdrawn after the case was "
      + 'prepared. Prepare the case again. Nothing was published.',
  },
  FLAG_OPENED_SINCE: {
    check: 'C-122.4',
    where: 'src/publication/index.mjs commitCaseEdition > is-accepted-work-standing',
    translation: "A flag was raised on another group's work this case rests on after the case was prepared, and the case "
      + 'must disclose it. Prepare the case again. Nothing was published.',
  },
  /* C-122.5 (R33, R67; N687, K1839): a waiting edition taken at its time with no publisher able to check it (none
     registered, one that throws, or one giving neither answer) is stopped, never published unchecked; the translation
     is the one R67 already answered. */
  SCHEDULED_CHECK_UNAVAILABLE: {
    check: 'C-122.5',
    where: 'src/publication/schedule.mjs unchecked > is-scheduled-check-available',
    translation: 'This edition was not published at its set time, because the checks it needed then could not be run. '
      + 'Nothing was published. Sign it again to publish it.',
  },
  /* C-122.6 (R33, R57; N757, DEC-180 (4), K2206): a photo the case carries no longer matches its marks (its copy no
     longer the photo's current copy, a mark withdrawn since the case was prepared among them (case-carriage R14), a
     photo carried whole, or marks that cannot be read), read through case-carriage (its R13) at the commit; the remedy
     is a new preparation. (T38; DEC-183 (4); K2291) The translation is `words.json`'s `photo.refused.changed`, quoted
     verbatim (protected). */
  PHOTO_MARKS_CHANGED_SINCE: {
    check: 'C-122.6',
    where: 'src/publication/index.mjs commitCaseEdition > is-photo-marks-current',
    translation: 'A mark changed after this case was prepared. Prepare it again before signing.',
  },
};

/** A refusal from one of this module's rows: `reason` and `code` one literal, with its check and translation. The
 *  code is a string literal at every call site (DEC-49); a code with no row here is a defect and throws, loudly. */
export function rowOf(code) {
  const row = CASE_SOURCES_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`publication: ${code} has no row with a canned translation (DEC-49)`);
  return { code, check: row.check, translation: row.translation };
}
