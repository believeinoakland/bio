/* publish-schedule's invariants and refusal rows (requirements: `build/requirements/publish-schedule.md`, R9). DEC-49:
 * every refusal this module answers with a catalogue row carries its code, its check and the member's translation.
 *
 * C-122.5 (R2's stop when no publisher could check a waiting edition; N687, K1839) moved here from `publication`'s C-122
 * family with its raiser at publication's third split (K617, K624, K2438; N823; T41-37), its number, code and translation
 * unchanged and its `where` this module's site, as C-92 moved to `case-tensions` (its R9). `publication`'s job (T41-36)
 * deletes its copy, so no row id is held twice once both have merged. A change to the row moves `CATALOG_VERSION`
 * (rule 17). */

export const PUBLISH_SCHEDULE_CHECKS = {
  /* C-122.5 (R2, R9; N687, K1839): a waiting edition taken at its time with no publisher able to check it (none
     registered, one that throws, or one giving neither answer) is stopped, never published unchecked. */
  SCHEDULED_CHECK_UNAVAILABLE: {
    check: 'C-122.5',
    where: 'src/publish-schedule/schedule.mjs unchecked > is-scheduled-check-available',
    translation: 'This edition was not published at its set time, because the checks it needed then could not be run. '
      + 'Nothing was published. Sign it again to publish it.',
  },
};

/** A refusal from one of this module's rows: `reason` and `code` one literal, with its check and translation. The
 *  code is a string literal at every call site (DEC-49); a code with no row here is a defect and throws, loudly. */
export function rowOf(code) {
  const row = PUBLISH_SCHEDULE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`publish-schedule: ${code} has no row with a canned translation (DEC-49)`);
  return { code, check: row.check, translation: row.translation };
}
