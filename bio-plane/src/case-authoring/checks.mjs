/* case-authoring's invariants and refusal rows (requirements: `build/requirements/case-authoring.md`, R7, R9, R19, R29).
 * DEC-49: every refusal this module answers from a row carries its code, its catalogue row and the member's translation.
 *
 * Moved here from the check catalogue with their ids, codes and translations unchanged (K6, R29): C-44.1 and C-44.3–C-44.5
 * (the case-identity family, `CASE_DERIVATION_CHECKS`; C-44.2 is `publication`'s and stays in the catalogue's family of
 * that name until publication takes it, so the family is one across the two, as `BIAS_CHECKS` is) and C-82.2–C-82.7
 * (`STATEMENT_ACK_CHECKS`, whole; C-82.1 is retired, D-521, and its number is not reused). Each `where` names the
 * region of this module that enforces it. C-32.6 (`MACHINE_CANNOT_PUBLISH`) stays a row of the catalogue's
 * `MACHINE_FENCE_CHECKS`, which `skills` (an earlier module) reads by key; this module reads it from there (R1). */

const at = (fn, region) => `src/case-authoring/index.mjs ${fn} > ${region}`;

/* C-44 — THE CASE IDENTITY op=publish AUTHORS (D-309, DEC-72 clause 6; REC-217, BIO_Publication_v0_1.md §3 rule 13).
   An allocation carrying its enforcement site: `checkBundle` does not call these, because each condition is about an
   ACT's arguments against the published record, and a bundle document holds no such thing. */
export const CASE_DERIVATION_CHECKS = Object.freeze({
  /* R7. The members already serve more than one published case and the act named none (or named one AND asked for a
     new one): a further edition of one of them and a new case over the same findings are opposite acts. */
  CASE_IDENTITY_AMBIGUOUS: {
    check: 'C-44.1',
    where: at('publishCase', 'case-identity-derivation'),
    translation: 'This publication did not say which case it is. The findings you are publishing '
      + 'already serve more than one published case, and a finding is allowed to serve many — so '
      + 'the record cannot work out from them alone whether you are publishing a further edition '
      + 'of one of those cases or starting a new case that rests on the same work. Nothing has '
      + 'been published and nothing has changed. Say which case this is, or say that it is a new '
      + 'one, and publish again.',
  },
  /* R9: the three conditions under which naming a draft would bind its readings falsely, each asked before a case id is
     minted, so a refusal spends none; none of them can refuse a publication that names no draft. */
  PUBLISH_DRAFT_NOT_FOUND: {
    check: 'C-44.3',
    where: at('publishCase', 'is-publish-draft-found'),
    translation: 'The draft named for this case is not a draft of this project that you can open. Nothing was '
      + 'published. Name the draft this case was prepared in, or publish without naming one; readings of a '
      + 'draft that was not named are then counted in the case file and not attributed to anyone.',
  },
  PUBLISH_DRAFT_NOT_THIS_CASE: {
    check: 'C-44.4',
    where: at('publishCase', 'is-publish-draft-this-case'),
    translation: 'The draft named here was prepared for a different case than the one being published, so its '
      + 'readers did not read this one. Nothing was published. Publish the case that draft is for, or name '
      + 'the draft of this case.',
  },
  PUBLISH_DRAFT_ALREADY_BOUND: {
    check: 'C-44.5',
    where: at('publishCase', 'is-publish-draft-bound'),
    translation: 'That draft has already been named as the draft of another published case, and the people who '
      + 'read it are listed there. One draft becomes one case, so it cannot be named for this one too. '
      + 'Nothing was published.',
  },
});

/* C-82 — op=statementack's refusals (IC-246, D-507; BIO_Publication_v0_1.md §3 rule 11). The words are BOB #33's,
   approved 2026-09-24; C-82.6 and C-82.7 were generalised at CONDUCT #20's union to be true of both the statement's
   writer and the case's publisher (§3 rule 13). C-82.5 says "This draft": the case-document door cannot reach an empty
   statement, because op=publish refuses NO_STATEMENT before authoring any document (R3). */
export const STATEMENT_ACK_CHECKS = Object.freeze({
  STATEMENT_ACK_NO_SUBJECT: {
    check: 'C-82.2',
    where: at('acknowledgeStatement', 'is-statement-ack-subject'),
    translation: 'Say which statement you are acknowledging: a draft case, or a case document, by its case '
      + 'and edition, that has been written but not yet signed.',
  },
  STATEMENT_ACK_ALREADY_SIGNED: {
    check: 'C-82.3',
    where: at('acknowledgeStatement', 'is-statement-ack-signed'),
    translation: 'This edition of the case is already signed, and the signature covers its list of who '
      + 'acknowledged the statement, so a new acknowledgement could not appear in it. A signed edition is '
      + 'corrected only by publishing the next edition.',
  },
  STATEMENT_ACK_NOT_A_PARTICIPANT: {
    check: 'C-82.4',
    where: at('acknowledgeStatement', 'is-statement-ack-participant'),
    translation: 'Only someone who has joined the project that makes this case, or someone given a review '
      + 'copy of it, can acknowledge its statement. Being able to see a project is not the same as having '
      + 'joined it: an invited member who has not joined yet, and an administrator, cannot acknowledge it.',
  },
  STATEMENT_ACK_NO_STATEMENT: {
    check: 'C-82.5',
    where: at('acknowledgeStatement', 'is-statement-ack-statement'),
    translation: 'This draft does not yet say what its case leaves out, so there is nothing to acknowledge. '
      + 'Once an editor of the draft writes that statement, you can acknowledge it.',
  },
  STATEMENT_ACK_BY_ITS_AUTHOR: {
    check: 'C-82.6',
    where: at('acknowledgeStatement', 'is-statement-ack-by-its-author'),
    translation: 'You wrote this statement or published this case, so you have already read it. An acknowledgement '
      + 'means a second person has read what the case leaves out, so it has to come from someone else: another '
      + 'participant in the project, or a reader given a review copy. The case can be published without one, '
      + 'and will say so.',
  },
  STATEMENT_ACK_AUTHOR_UNDETERMINED: {
    check: 'C-82.7',
    where: at('acknowledgeStatement', 'is-statement-ack-author-undetermined'),
    translation: 'The record does not say who wrote this statement, so it cannot tell whether you are its author. '
      + 'For a draft, ask an editor of the project to save the statement again; for a published case, it can be '
      + 'published again from a draft that records who wrote it. You can acknowledge it after that. The case can '
      + 'be published either way.',
  },
});
