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
import { word } from '../setup-words/index.mjs';

export const ATTRIBUTION_ACT_CHECKS = {
  ATTRIBUTION_NOT_A_MEMBER: {
    check: 'C-92.1',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-act',
    translation: word('refusal.ATTRIBUTION_NOT_A_MEMBER'),
  },
  ATTRIBUTION_NO_LEVEL: {
    check: 'C-92.2',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-act',
    translation: word('refusal.ATTRIBUTION_NO_LEVEL'),
  },
  ATTRIBUTION_LEVEL_UNKNOWN: {
    check: 'C-92.3',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-act',
    translation: word('refusal.ATTRIBUTION_LEVEL_UNKNOWN'),
  },
  ATTRIBUTION_NOT_AN_OBSERVATION: {
    check: 'C-92.4',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-author',
    translation: word('refusal.ATTRIBUTION_NOT_AN_OBSERVATION'),
  },
  ATTRIBUTION_NOT_THE_AUTHOR: {
    check: 'C-92.5',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-author',
    translation: word('refusal.ATTRIBUTION_NOT_THE_AUTHOR'),
  },
  ATTRIBUTION_AUTHOR_NOT_ACTIVE: {
    check: 'C-92.6',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-author',
    translation: word('refusal.ATTRIBUTION_AUTHOR_NOT_ACTIVE'),
  },
  ATTRIBUTION_NOT_REACHED: {
    check: 'C-92.7',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-edition',
    translation: word('refusal.ATTRIBUTION_NOT_REACHED'),
  },
  ATTRIBUTION_EDITION_RATIFIED: {
    check: 'C-92.8',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-edition',
    translation: word('refusal.ATTRIBUTION_EDITION_RATIFIED'),
  },
  /* PROVISIONAL (§4.6, carried to Bob): `name` publishes the member's HANDLE, because the record holds no
     legal name and must not start to. */
  ATTRIBUTION_NAME_NO_HANDLE: {
    check: 'C-92.9',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-edition',
    translation: word('refusal.ATTRIBUTION_NAME_NO_HANDLE'),
  },
  /* DEC-88 (K1025, K1030): the author's words on why this level, recorded with the choice. Asked after C-92.2 and
     before C-92.3, so nothing is written. */
  ATTRIBUTION_NO_REASON: {
    check: 'C-92.13',
    where: 'src/case-tensions/index.mjs attributeObservation > is-attribute-act',
    translation: word('refusal.ATTRIBUTION_NO_REASON'),
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
