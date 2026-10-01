/* publication's invariants and refusal rows (requirements: `build/requirements/publication.md`, R33). DEC-49: every
 * refusal this module answers carries its code, its catalogue row and the member's translation.
 *
 * Moved here from the check catalogue with their ids and translations unchanged (K6, R33): C-92.1–.9 (the attribution
 * act; C-92.10–.12 are ratification's, in its `RATIFY_ATTRIBUTION_CHECKS`), under a name of its own because the rest
 * of the family is held elsewhere. C-122.1 (R51, N364) is new here, a family of its own: a case's sources.
 *
 * C-44.2, C-68.5 and C-98.1–.9, raised by `public-read`'s code since K651, are `public-read`'s (its R17), moved there
 * with their numbers, wheres and translations unchanged and deleted here (T19), so no row id is held twice.
 *
 * The case document's grammar (`CASE_DOCUMENT_FORMAT` … and its four predicates) is `case-grammar`'s since K651 (its
 * R1, which was this module's R20), re-exported here unchanged so every importer of this file reads what it read. */

export { CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V4, CASE_DOCUMENT_FORMAT_V3, CASE_DOCUMENT_FORMAT_V2,
         CASE_DOCUMENT_FORMAT_LEGACY, CASE_DOCUMENT_FORMATS_ACCEPTED, caseDocumentStatesMemberBlocks,
         caseDocumentRequiresDisclosures, caseDocumentRequiresV4Disclosures,
         caseDocumentRequiresTensionSection } from "../case-grammar/index.mjs";

/* ===========================================================================
 * MK-7 (C-92.1–.9) — THE ATTRIBUTION ACT (MEMBER-KNOWLEDGE-DESIGN.md §4.2–§4.6), R17. A member's firsthand
 * observation is published only beside a statement of WHO SAID IT, at the level its author chose for that case
 * edition, and that choice is the author's alone, never prefilled.
 *
 *   is-attribute-act      who is choosing (a signed-in member, stamped), and that a level was chosen at all
 *   is-attribute-author   that the chooser is the observation's author, and an active member (§4.2, §4.5)
 *   is-attribute-edition  that the edition is a prepared, unsigned one that reaches the observation, and that
 *                         `name` has a handle to publish (§4.6)
 *
 * The gate's three (C-92.10–.12, `is-attribution-gate`, `is-attribution-ratify`) are ratification's, in its
 * `RATIFY_ATTRIBUTION_CHECKS`. PROVISIONAL, carried to Bob: §4.6's reading of `name` as the handle (C-92.9).
 * ===================================================================== */
export const ATTRIBUTION_ACT_CHECKS = {
  ATTRIBUTION_NOT_A_MEMBER: {
    check: 'C-92.1',
    where: 'src/publication/index.mjs attributeObservation > is-attribute-act',
    translation: 'How a member\'s observation is attributed is that member\'s own choice. The credential '
      + 'that asked is an automated one, and it cannot make that choice for anybody. Sign in and choose it yourself.',
  },
  ATTRIBUTION_NO_LEVEL: {
    check: 'C-92.2',
    where: 'src/publication/index.mjs attributeObservation > is-attribute-act',
    translation: 'No level was chosen. Choose what a published case shows of who said your observation: '
      + 'the group, the project, the cover the group knows you by, or your handle. Nothing is filled in for you.',
  },
  ATTRIBUTION_LEVEL_UNKNOWN: {
    check: 'C-92.3',
    where: 'src/publication/index.mjs attributeObservation > is-attribute-act',
    translation: 'That is not one of the four levels. Choose group, project, cover or name.',
  },
  ATTRIBUTION_NOT_AN_OBSERVATION: {
    check: 'C-92.4',
    where: 'src/publication/index.mjs attributeObservation > is-attribute-author',
    translation: 'That document is not a member\'s firsthand observation in this record, so there is no '
      + 'author whose choice this is. Attribution is chosen for observations only.',
  },
  ATTRIBUTION_NOT_THE_AUTHOR: {
    check: 'C-92.5',
    where: 'src/publication/index.mjs attributeObservation > is-attribute-author',
    translation: 'Another member recorded that observation. Only the member who said it chooses how a '
      + 'published case shows who said it — not a project owner, not an administrator, and not a default.',
  },
  ATTRIBUTION_AUTHOR_NOT_ACTIVE: {
    check: 'C-92.6',
    where: 'src/publication/index.mjs attributeObservation > is-attribute-author',
    translation: 'That observation\'s author is not an active member, and nobody chooses for them. The '
      + 'observation stays in the record and can be used where its author already chose, and nowhere new.',
  },
  ATTRIBUTION_NOT_REACHED: {
    check: 'C-92.7',
    where: 'src/publication/index.mjs attributeObservation > is-attribute-edition',
    translation: 'No prepared case edition by that name rests on your observation. You choose an attribution '
      + 'for an edition that uses your words, once its case document has been prepared.',
  },
  ATTRIBUTION_EDITION_RATIFIED: {
    check: 'C-92.8',
    where: 'src/publication/index.mjs attributeObservation > is-attribute-edition',
    translation: 'That edition is already signed, and a signed edition does not change. Your choice can '
      + 'apply to the next edition, which keeps your last choice until you change it.',
  },
  /* PROVISIONAL (§4.6, carried to Bob): `name` publishes the member's HANDLE, because the record holds no
     legal name and must not start to. */
  ATTRIBUTION_NAME_NO_HANDLE: {
    check: 'C-92.9',
    where: 'src/publication/index.mjs attributeObservation > is-attribute-edition',
    translation: 'Choosing your name publishes the handle you appear under in this record, and you have none. '
      + 'Choose another level, or set a handle first.',
  },
};

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
};

/** A refusal from one of this module's rows: `reason` and `code` one literal, with its check and translation. The
 *  code is a string literal at every call site (DEC-49); a code with no row here is a defect and throws, loudly. */
export function rowOf(code) {
  const row = ATTRIBUTION_ACT_CHECKS[code] || CASE_SOURCES_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`publication: ${code} has no row with a canned translation (DEC-49)`);
  return { code, check: row.check, translation: row.translation };
}
