/* provenance's own refusal rows that the check catalogue does not hold (requirements: `build/requirements/provenance.md`,
 * R50). DEC-49: every refusal this module answers carries its code, its catalogue row and the member's translation.
 *
 * C-53.14 is minted here, in this module's own table, rather than in the catalogue's `TESTIMONY_CHECKS`, which keeps
 * the rest of C-53 (C-53.1–C-53.9, C-53.13) until this module holds that family: a row is counted wherever it lives
 * (promotion R34), and the table takes a name of its own so no two families share one. It is the same fence at the
 * same write as C-53.13, asked of each register entry's stated size. */

/* N263 (R50): A REGISTER ENTRY STATES ITS SIZE. `register.bytes` is part of the read contract (R48): the register audit
   compares it with the stored object (R8), publication reads it, and the column is NOT NULL. An entry with no size
   failed the promotion as a bare `PROMOTE_FAILED` from the database, and one stating `-1` or `1.5` was stored as a
   size no capture can have. Refused by name, before anything is written; this module does not compare the stated
   size with the stored object's, which R7 and R8 read. */
export const REGISTER_ENTRY_CHECKS = {
  REGISTER_BYTES_UNSTATED: {
    check: 'C-53.14',
    where: 'src/provenance/index.mjs #registerEntries > is-register-bytes',
    translation: 'Each document this save registers must state its size, as a whole number of bytes, and one of '
      + 'them states none, or a size no document can have. The record keeps each document\'s size so it can later '
      + 'check that the stored copy is whole. Nothing was written. State the document\'s size in bytes and save '
      + 'again.',
  },
};
