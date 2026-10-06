/* case-tensions' refusal rows (requirements: `build/requirements/case-tensions.md`, R9). DEC-49: every refusal this
 * module answers carries its code, its catalogue row and the member's translation.
 *
 * Moved from `publication`'s table with the attribution act (K617, K1505; T33-62): C-92.1–.9 and C-92.13, their
 * numbers, codes and translations unchanged, their `where` this module's site. C-92.10–.12 are ratification's, in its
 * `RATIFY_ATTRIBUTION_CHECKS`. `publication`'s deletion job (T33-63) removes its copy, so no row id is held twice.
 *
 * MK-7 (C-92.1–.9, .13) — THE ATTRIBUTION ACT (MEMBER-KNOWLEDGE-DESIGN.md §4.2–§4.6), R5, R7. A member's firsthand
 * observation is published only beside a statement of WHO SAID IT, at the level its author chose for that case
 * edition, and that choice is the author's alone, never prefilled.
 *
 *   is-attribute-act      who is choosing (a signed-in member, stamped), that a level was chosen at all, and why,
 *                         in the author's own words (C-92.13, DEC-88)
 *   is-attribute-author   that the chooser is the observation's author (or the capture's attesting member), and an
 *                         active member (§4.2, §4.5)
 *   is-attribute-edition  that the edition is a prepared, unsigned one that reaches the observation, and that
 *                         `name` has a handle to publish (§4.6)
 *
 * PROVISIONAL, carried to Bob: §4.6's reading of `name` as the handle (C-92.9). */
export const ATTRIBUTION_ACT_CHECKS = {
  ATTRIBUTION_NOT_A_MEMBER: {
    check: 'C-92.1',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-act',
    translation: 'How a member\'s observation is attributed is that member\'s own choice. The credential '
      + 'that asked is an automated one, and it cannot make that choice for anybody. Sign in and choose it yourself.',
  },
  ATTRIBUTION_NO_LEVEL: {
    check: 'C-92.2',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-act',
    translation: 'No level was chosen. Choose what a published case shows of who said your observation: '
      + 'the group, the project, the cover the group knows you by, or your handle. Nothing is filled in for you.',
  },
  ATTRIBUTION_LEVEL_UNKNOWN: {
    check: 'C-92.3',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-act',
    translation: 'That is not one of the four levels. Choose group, project, cover or name.',
  },
  ATTRIBUTION_NOT_AN_OBSERVATION: {
    check: 'C-92.4',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-author',
    translation: 'That is not a member\'s firsthand observation in this record, nor material from a source this case '
      + 'shows as Withheld, so there is no author or attesting member whose choice this is. Attribution is chosen for '
      + 'those only.',
  },
  ATTRIBUTION_NOT_THE_AUTHOR: {
    check: 'C-92.5',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-author',
    translation: 'Another member recorded that observation, or attested that material. Only the member who said it, '
      + 'or who attested it, chooses how a published case credits them — not a project owner, not an administrator, '
      + 'and not a default.',
  },
  ATTRIBUTION_AUTHOR_NOT_ACTIVE: {
    check: 'C-92.6',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-author',
    translation: 'That observation\'s author is not an active member, and nobody chooses for them. The '
      + 'observation stays in the record and can be used where its author already chose, and nowhere new.',
  },
  ATTRIBUTION_NOT_REACHED: {
    check: 'C-92.7',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-edition',
    translation: 'No prepared case edition by that name rests on your observation. You choose an attribution '
      + 'for an edition that uses your words, once its case document has been prepared.',
  },
  ATTRIBUTION_EDITION_RATIFIED: {
    check: 'C-92.8',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-edition',
    translation: 'That edition is already signed, and a signed edition does not change. Your choice can '
      + 'apply to the next edition, which keeps your last choice until you change it.',
  },
  /* PROVISIONAL (§4.6, carried to Bob): `name` publishes the member's HANDLE, because the record holds no
     legal name and must not start to. */
  ATTRIBUTION_NAME_NO_HANDLE: {
    check: 'C-92.9',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-edition',
    translation: 'Choosing your name publishes the handle you appear under in this record, and you have none. '
      + 'Choose another level, or set a handle first.',
  },
  /* DEC-88 (K1025, K1030): the author's words on why this level, recorded with the choice. Asked after C-92.2 and
     before C-92.3, so nothing is written. */
  ATTRIBUTION_NO_REASON: {
    check: 'C-92.13',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-act',
    translation: 'Choosing how a published case shows who said your observation records why, in your own words, '
      + 'and no reason was given, or it is longer than 2,000 characters. Write one. Nothing was written.',
  },
};

/** A refusal from this module's rows: `reason` and `code` one literal, with its check and translation. The code is a
 *  string literal at every call site (DEC-49); a code with no row here is a defect and throws, loudly. */
export function rowOf(code) {
  const row = ATTRIBUTION_ACT_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`case-tensions: ${code} has no row with a canned translation (DEC-49)`);
  return { code, check: row.check, translation: row.translation };
}
