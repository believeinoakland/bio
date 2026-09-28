/* run-productions' DEC-49 rows (R6, R13, R16; K6, K163): every refusal this module mints carries its catalogue row.
 *
 * NAMED HERE AND READ FROM THE CATALOGUE, NEVER COPIED, on observation-log's precedent: `skilldoctrine.mjs` (skills,
 * later in the order) imports `SUGGEST_CHECKS` and `SUGGEST_LEVELS` from `bio-checks.mjs`, and the legacy store
 * reaches it through `skillpack.mjs`, so the rows leave the catalogue once skills imports them from here. One source
 * either way, and every code below is minted by this module's `index.mjs`, inside the region its row names.
 *
 *   C-27.1–C-27.14, C-27.16–C-27.19  `op=suggest` (R1, R3), SUGGEST_CHECKS. C-27.15 (`VERSION_KIND_UNKNOWN`) is
 *                                    basis-versions' (its R1; K82 (4)): the document gate's row, never minted here.
 *   C-104.1–C-104.12                 `op=extractpropose` and `op=extractproposals` (R10, R12, R13),
 *                                    EXTRACT_PROPOSE_CHECKS. `NO_TARGET` and `NO_SUCH_BUNDLE` have no row
 *                                    (the catalogue's REC-64 rule; R13, K163).
 *
 * `SUGGEST_KINDS` is basis-versions' (R6) and `SUGGEST_LEVELS` this module's; both are read from the catalogue
 * until their owners hold them. */

import { SUGGEST_CHECKS as CATALOGUE_SUGGEST, EXTRACT_PROPOSE_CHECKS as CATALOGUE_EXTRACT, SUGGEST_KINDS,
         SUGGEST_LEVELS } from "../../checks/bio-checks.mjs";

export { SUGGEST_KINDS, SUGGEST_LEVELS };

/** The C-27 rows `op=suggest` mints (R1, R3): every row of the family but C-27.15, basis-versions' document-gate row.
 *  Named by the family rather than spelled again, so no code is written here as a second minting site. */
export const SUGGEST_CHECK_KEYS = Object.freeze(Object.keys(CATALOGUE_SUGGEST)
  .filter((k) => CATALOGUE_SUGGEST[k].check !== "C-27.15"));

/** The C-104 rows the extract productions mint (R10, R12): the whole family. */
export const EXTRACT_PROPOSE_CHECK_KEYS = Object.freeze(Object.keys(CATALOGUE_EXTRACT));

/** R13's two codes minted without a row: one condition minted at many sites, which a single `where` cannot claim. */
export const ROWLESS_CODES = Object.freeze(["NO_TARGET", "NO_SUCH_BUNDLE"]);

const pick = (family, keys) => Object.freeze(Object.fromEntries(keys.map((k) => [k, family[k]])));

export const SUGGEST_CHECKS = pick(CATALOGUE_SUGGEST, SUGGEST_CHECK_KEYS);
export const EXTRACT_PROPOSE_CHECKS = pick(CATALOGUE_EXTRACT, EXTRACT_PROPOSE_CHECK_KEYS);
