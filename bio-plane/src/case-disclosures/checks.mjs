/* case-disclosures' refusal rows (requirements: `build/requirements/case-disclosures.md`, R22). DEC-49: every refusal this
 * module answers from a row carries its code, its catalogue row and the member's translation.
 *
 * C-120 — A CASE'S DISCLOSURES AND ITS PRE-FLIGHT (N345; DEC-76 item 4, DEC-84 items 11–13, DEC-85; N364: DEC-80 item 3,
 * DEC-81 item 3; DEC-112 (4), DEC-96 item 4, N522). Moved whole from `case-authoring` (its R29's share; N529, K1333) with
 * the rows' ids, codes and translations unchanged; only each `where` changes, to the method of this module that raises
 * it. A family held in this module's own table (K343's pattern): a case discloses each unresolved conflict on what it
 * rests on, one level deep, and is never refused because a conflict exists; it discloses each document's grade and
 * co-attestation, and is never refused because a document is not co-attested. What refuses is an undisclosed conflict,
 * a disclosure of something that is not one, a read that could not be made whole, a load-bearing Grade B document
 * published as self-attested without its owner saying so and why, an acknowledgement that stands on nothing, and an
 * uncleared hunch; and material a load-bearing finding relies on that this copy does not hold whole, another group's
 * work with no acceptance in force, and an open flag on it left undisclosed, a disclosure standing on nothing, or a
 * flags read not made whole. Promotion stamps these rows (N318); C-120.4–C-120.7 were stamped in `CATALOG_VERSION`
 * 1.47.0 (T17); C-120.8 and C-120.10–C-120.13, and C-120.1–C-120.7's new `where`s, await T29's stamp.
 * C-120.9 was withdrawn unstamped (K1275), and its number is never reused. A change to any row moves `CATALOG_VERSION`
 * (rule 17). */

const at = (fn, region) => `src/case-disclosures/index.mjs ${fn} > ${region}`;

export const CASE_DISCLOSURE_CHECKS = Object.freeze({
  TENSION_NOT_DISCLOSED: {
    check: 'C-120.1',
    where: at('tensionsJudged', 'is-tension-disclosed'),
    translation: 'A finding in this case rests on something the record holds in unresolved conflict, and a case may '
      + 'be published with it only if the conflict is disclosed. Each one is named. One in conflict with a record you '
      + 'cannot see is named by its finding, and the published case will highlight it without naming that record. '
      + 'Disclose it, or resolve it first. Nothing was published.',
  },
  DISCLOSURE_NOT_STANDING: {
    check: 'C-120.2',
    where: at('tensionsJudged', 'is-disclosure-standing'),
    translation: 'One of the conflicts disclosed is not an unresolved conflict on this case\'s findings: it may have '
      + 'been resolved since. Read the list again. Nothing was published.',
  },
  TENSIONS_UNDETERMINED: {
    check: 'C-120.3',
    where: at('tensionsUndetermined', 'is-tensions-determined'),
    translation: 'The record could not be read completely for conflicts on this case\'s findings, so what must be '
      + 'disclosed is not known. Try again. Nothing was published.',
  },
  /* R2 (DEC-81 item 3 (b)): the owner's attributed acknowledgement, in the pattern of NO_FALSIFIER's override. */
  CO_ATTESTATION_UNACKNOWLEDGED: {
    check: 'C-120.4',
    where: at('selfAttestedJudged', 'is-co-attestation-acknowledged'),
    translation: 'A load-bearing document has no trusted timestamp and co-archive. Retry them, or acknowledge publishing '
      + 'it as self-attested only, with a reason. Nothing was written.',
  },
  SELF_ATTESTED_NO_REASON: {
    check: 'C-120.5',
    where: at('selfAttestedJudged', 'is-self-attested-reasoned'),
    translation: 'Publishing a document as self-attested only says why. Give the reason. Nothing was written.',
  },
  SELF_ATTESTATION_NOT_STANDING: {
    check: 'C-120.6',
    where: at('selfAttestedJudged', 'is-self-attestation-standing'),
    translation: 'A document acknowledged as self-attested only is either co-attested already or not one this case rests '
      + 'on, so it needs no acknowledgement. Remove it from the list. Nothing was written.',
  },
  /* R16 (Publication §3 rule 4; DEC-20): the one bias that must be cleared before publication. */
  UNCLEARED_HUNCH: {
    check: 'C-120.7',
    where: at('hunchDebt', 'is-hunch-cleared'),
    translation: 'A finding in this case rests on a hunch. A hunch is temporary declared bias, and it is the one bias that '
      + 'must be cleared before publication: the case must still hold with the hunch removed. Give each leg a grade the '
      + 'record earns, or take the hunch out of the basis, and publish again. Nothing was written.',
  },
  /* R6 (DEC-112 (4); K1134 reading 1): everything a load-bearing finding relies on travels whole. C-120.9 (K1254) was
     withdrawn unstamped (K1275), and its number is not used. New in T28: awaiting stamp (T29's promotion). */
  RELIED_ON_NOT_PRESENTABLE: {
    check: 'C-120.8',
    where: at('materialsJudged', 'is-relied-on-presentable'),
    translation: 'A finding this case relies on rests on material this copy does not hold whole, and everything a case '
      + 'relies on travels with it in full. Find a presentable copy, stop relying on the material, or make the finding '
      + 'supporting. Nothing was written.',
  },
  /* R13, R14 (DEC-96 item 4; N522): another group's work a case rests on, its acceptance stated and its open flags
     disclosed, never blocked (R1's pattern). New in T28: awaiting stamp. */
  ACCEPTED_WORK_NOT_IN_FORCE: {
    check: 'C-120.10',
    where: at('acceptedWorkJudged', 'is-accepted-work-in-force'),
    translation: 'A finding in this case rests on another group\'s finding, and this group\'s acceptance of that edition '
      + 'is not in force. Accept it again, or take the leg out. Nothing was written.',
  },
  FLAG_NOT_DISCLOSED: {
    check: 'C-120.11',
    where: at('flagsJudged', 'is-flag-disclosed'),
    translation: 'Another group\'s work this case rests on carries an open flag, and a case may be published with it '
      + 'only if the flag is disclosed. Each one is named. Disclose it, or clear it first. Nothing was published.',
  },
  FLAGS_UNDETERMINED: {
    check: 'C-120.12',
    where: at('flagsJudged', 'is-flags-determined'),
    translation: 'The flags on another group\'s work this case rests on could not be read completely, so what must be '
      + 'disclosed is not known. Try again. Nothing was published.',
  },
  FLAG_DISCLOSURE_NOT_STANDING: {
    check: 'C-120.13',
    where: at('flagsJudged', 'is-flag-disclosure-standing'),
    translation: 'One of the flags disclosed is not open on work this case rests on: it may have been cleared since. '
      + 'Read the list again. Nothing was published.',
  },
});
