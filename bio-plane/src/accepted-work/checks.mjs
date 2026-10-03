/* accepted-work — THE ROWS (requirements: `build/requirements/accepted-work.md` R6; N522, DEC-96 items 1, 4).
 *
 * Each row is `{check, where, translation}`. Both are new at T28 and minted here, by `acceptedLegRefusals` (R3), whose
 * findings `promotion` carries inside `BASIS_REFUSED` (R4); each `where` names that site. `promotion` stamps them, and a
 * change moves `CATALOG_VERSION`. This file imports nothing. */

export const ACCEPTED_WORK_CHECKS = {
  IMPORTED_NOT_ACCEPTED: {
    check: 'C-21.4',
    where: 'src/accepted-work/index.mjs acceptedLegRefusals > is-imported-accepted',
    translation: "This finding rests on another group's finding that this group has not accepted at that edition. "
      + 'Accept that edition first, or take the leg out. Nothing was written.',
  },
  ACCEPTED_WORK_UNREADABLE: {
    check: 'C-21.5',
    where: 'src/accepted-work/index.mjs acceptedLegRefusals > is-accepted-work-readable',
    translation: "Another group's work this finding rests on could not be read, so whether it is accepted is not known. "
      + 'Try again. Nothing was written.',
  },
};
