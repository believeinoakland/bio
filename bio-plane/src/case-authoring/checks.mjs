/* case-authoring's invariants and refusal rows (requirements: `build/requirements/case-authoring.md`, R1, R3, R7, R9, R19, R29).
 * DEC-49: every refusal this module answers from a row carries its code, its catalogue row and the member's translation.
 *
 * Moved here from the check catalogue with their ids, codes and translations unchanged (K6, R29): C-44.1 and C-44.3–C-44.5
 * (the case-identity family, `CASE_DERIVATION_CHECKS`; C-44.2 is held by `public-read`, so the family is one across
 * the two, as `BIAS_CHECKS` is) and C-82.2–C-82.7 (`STATEMENT_ACK_CHECKS`, whole; C-82.1 is retired, D-521, and its
 * number is not reused); C-82.8 is new in T22 (R19, DEC-88). Each `where` names the region of this module that
 * enforces it. C-32.6 (`MACHINE_CANNOT_PUBLISH`) and C-33.14 (`NO_STATEMENT`) were copied
 * into `PUBLISH_ACT_CHECKS` (T18; R1, R3, R29; K695), ids, codes, `where`s and translations unchanged, and stamped by
 * promotion in T19; the catalogue and its copies are deleted (K529). */

const at = (fn, region) => `src/case-authoring/index.mjs ${fn} > ${region}`;

/* C-32.6, C-33.14 — op=publish's own two rows from the catalogue's machine-fence and act-shape families (R1, R3; K6,
   K529), copied with their ids, codes, `where`s and translations unchanged; stamped by promotion (T19 layer 2). */
export const PUBLISH_ACT_CHECKS = Object.freeze({
  /* R1: the fence alone, before anything else is read. */
  MACHINE_CANNOT_PUBLISH: {
    check: 'C-32.6',
    where: at('#publishCase', 'is-machine-publish'),
    translation: 'Publishing puts the group\'s name on a case, together with an assertion that it '
      + 'is complete and a stated position on putting it to the people it concerns. Both of those '
      + 'are declared judgements, and the credential that asked here is an automated one. It can '
      + 'assemble the case; sign in to publish it.',
  },
  /* R3: a case silent about what it leaves out (REC-64). */
  NO_STATEMENT: {
    check: 'C-33.14',
    where: at('#publishCase', 'is-publish-statement'),
    translation: 'A published case has to say what it does NOT cover. A case that is silent about '
      + 'its own limits is claiming to cover everything, and that is the overclaim this record '
      + 'exists to refuse.',
  },
});

/* C-44 — THE CASE IDENTITY op=publish AUTHORS (D-309, DEC-72 clause 6; REC-217, BIO_Publication_v0_1.md §3 rule 13).
   An allocation carrying its enforcement site: `checkBundle` does not call these, because each condition is about an
   ACT's arguments against the published record, and a bundle document holds no such thing. */
export const CASE_DERIVATION_CHECKS = Object.freeze({
  /* R7. The members already serve more than one published case and the act named none (or named one AND asked for a
     new one): a further edition of one of them and a new case over the same findings are opposite acts. */
  CASE_IDENTITY_AMBIGUOUS: {
    check: 'C-44.1',
    where: at('#publishCase', 'case-identity-derivation'),
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
    where: at('#publishCase', 'is-publish-draft-found'),
    translation: 'The draft named for this case is not a draft of this project that you can open. Nothing was '
      + 'published. Name the draft this case was prepared in, or publish without naming one; readings of a '
      + 'draft that was not named are then counted in the case file and not attributed to anyone.',
  },
  PUBLISH_DRAFT_NOT_THIS_CASE: {
    check: 'C-44.4',
    where: at('#publishCase', 'is-publish-draft-this-case'),
    translation: 'The draft named here was prepared for a different case than the one being published, so its '
      + 'readers did not read this one. Nothing was published. Publish the case that draft is for, or name '
      + 'the draft of this case.',
  },
  PUBLISH_DRAFT_ALREADY_BOUND: {
    check: 'C-44.5',
    where: at('#publishCase', 'is-publish-draft-bound'),
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
  /* R19 (DEC-88; K1025, K1030): the acknowledger's own words, asked after C-82.6, the last refusal before anything is
     read for the write. New in T22, stamped in `CATALOG_VERSION` 1.53.0 (T23 L2). */
  STATEMENT_ACK_NO_REASON: {
    check: 'C-82.8',
    where: at('acknowledgeStatement', 'is-statement-ack-reasoned'),
    translation: 'An acknowledgement of a statement is recorded with your own words on it, and none were given, or '
      + 'they are longer than 2,000 characters. Write them. Nothing was written.',
  },
});

/* C-120 — A CASE'S DISCLOSURES AND ITS PRE-FLIGHT (N345; DEC-76 item 4, DEC-84 items 11–13, DEC-85; N364: DEC-80 item 3,
   DEC-81 item 3; R12, R29, R31, R32, R34, R35). A family held in this module's own table (K343's pattern): a case
   discloses each unresolved conflict on what it rests on, one level deep, and is never refused because a conflict
   exists; it discloses each document's grade and co-attestation, and is never refused because a document is not
   co-attested. What refuses is an undisclosed conflict, a disclosure of something that is not one, a read that could not
   be made whole, a load-bearing Grade B document published as self-attested without its owner saying so and why, an
   acknowledgement that stands on nothing, and an uncleared hunch. Promotion stamps these rows (N318); C-120.4–C-120.7
   were stamped in `CATALOG_VERSION` 1.47.0 (T17). */
export const CASE_DISCLOSURE_CHECKS = Object.freeze({
  TENSION_NOT_DISCLOSED: {
    check: 'C-120.1',
    where: at('#tensionsJudged', 'is-tension-disclosed'),
    translation: 'A finding in this case rests on something the record holds in unresolved conflict, and a case may '
      + 'be published with it only if the conflict is disclosed. Each one is named. One in conflict with a record you '
      + 'cannot see is named by its finding, and the published case will highlight it without naming that record. '
      + 'Disclose it, or resolve it first. Nothing was published.',
  },
  DISCLOSURE_NOT_STANDING: {
    check: 'C-120.2',
    where: at('#tensionsJudged', 'is-disclosure-standing'),
    translation: 'One of the conflicts disclosed is not an unresolved conflict on this case\'s findings: it may have '
      + 'been resolved since. Read the list again. Nothing was published.',
  },
  TENSIONS_UNDETERMINED: {
    check: 'C-120.3',
    where: at('#undetermined', 'is-tensions-determined'),
    translation: 'The record could not be read completely for conflicts on this case\'s findings, so what must be '
      + 'disclosed is not known. Try again. Nothing was published.',
  },
  /* R35 (DEC-81 item 3 (b)): the owner's attributed acknowledgement, in the pattern of NO_FALSIFIER's override. */
  CO_ATTESTATION_UNACKNOWLEDGED: {
    check: 'C-120.4',
    where: at('#selfAttestedJudged', 'is-co-attestation-acknowledged'),
    translation: 'A load-bearing document has no trusted timestamp and co-archive. Retry them, or acknowledge publishing '
      + 'it as self-attested only, with a reason. Nothing was written.',
  },
  SELF_ATTESTED_NO_REASON: {
    check: 'C-120.5',
    where: at('#selfAttestedJudged', 'is-self-attested-reasoned'),
    translation: 'Publishing a document as self-attested only says why. Give the reason. Nothing was written.',
  },
  SELF_ATTESTATION_NOT_STANDING: {
    check: 'C-120.6',
    where: at('#selfAttestedJudged', 'is-self-attestation-standing'),
    translation: 'A document acknowledged as self-attested only is either co-attested already or not one this case rests '
      + 'on, so it needs no acknowledgement. Remove it from the list. Nothing was written.',
  },
  /* R12 (Publication §3 rule 4; DEC-20): the one bias that must be cleared before publication. */
  UNCLEARED_HUNCH: {
    check: 'C-120.7',
    where: at('#hunchDebt', 'is-hunch-cleared'),
    translation: 'A finding in this case rests on a hunch. A hunch is temporary declared bias, and it is the one bias that '
      + 'must be cleared before publication: the case must still hold with the hunch removed. Give each leg a grade the '
      + 'record earns, or take the hunch out of the basis, and publish again. Nothing was written.',
  },
});
