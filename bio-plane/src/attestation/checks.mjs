/* attestation's refusal rows (requirements: `build/requirements/attestation.md`, "Checks carried here"). DEC-49: every
 * refusal this module answers carries its code, its catalogue row and the member's translation.
 *
 * Moved from `provenance/checks.mjs` with N512 (K1193; T25): C-89 `ATTEST_CHECKS`, with its header, id and row
 * unchanged. The row was stamped as provenance's (1.29.0); moving here re-points its `where` to this module's site, so
 * it is `awaiting stamp` until T26's L2 (S3; accepted red 6). The receipt's rows, C-103.6 `RECEIPT_MALFORMED` and
 * C-103.7 `RECEIPT_NO_KEY`, stay in provenance's `PROVENANCE_ACT_CHECKS` (provenance R58) and are imported, so one
 * family is not split between two files. */

/* ===========================================================================
   D-530 — CO-ATTESTING A CAPTURE HELD IN PARTS (C-89; Intake Doctrine §8, D-476).

   A document over one part is stored ONLY as its parts, each under its own hash,
   and never under the whole's. `op=attest` asked only for the whole-hash object
   and answered a miss NO_SUCH_CAPTURE, telling a member to capture again a
   document the record holds. It now asks the store the whole-document question.
   On the plane's own acquisition receipt it attests. On the register ALONE, a row
   written from what a promoting caller named (D-45), it refuses by THIS code:
   the bytes are not called absent, and a timestamp is not rested on a caller's
   word. NO_SUCH_CAPTURE stays for a hash nothing names at all.
   =========================================================================== */
export const ATTEST_CHECKS = {
  CAPTURE_HELD_IN_PARTS: {
    check: 'C-89.1',
    where: 'src/attestation/index.mjs attest > is-attest-parts',
    translation: 'The record lists this document, but keeps it in parts rather than as one file, and this '
      + 'instance has no record of fetching it itself. A timestamp is only requested for bytes this '
      + 'instance can vouch for, so none was requested. Nothing is missing: do not capture the document '
      + 'again. If the instance fetches it from its address, it can then be co-attested.',
  },
};
