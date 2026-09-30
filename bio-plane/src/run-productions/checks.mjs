/* run-productions' DEC-49 rows (R6, R13, R16; K6, K163): every refusal this module mints carries its catalogue row.
 *
 *   C-27.1–C-27.14, C-27.16–C-27.19  `op=suggest` (R1, R3), SUGGEST_CHECKS. READ FROM THE CATALOGUE until
 *                                    basis-versions holds the family's C-27.15 (N155: `SUGGEST_CHECKS` waits for it):
 *                                    `VERSION_KIND_UNKNOWN` is basis-versions' (its R1; K82 (4)), the document gate's
 *                                    row, never minted here.
 *   C-104.1–C-104.12                 `op=extractpropose` and `op=extractproposals` (R10, R12, R13),
 *                                    EXTRACT_PROPOSE_CHECKS. DEFINED HERE (N155, T18): moved whole out of the
 *                                    catalogue, the rows unchanged. `NO_TARGET` and `NO_SUCH_BUNDLE` have no row (the
 *                                    catalogue's REC-64 rule; R13, K163).
 *
 * `SUGGEST_KINDS` is basis-versions' (R6), read from the catalogue until it holds it; `SUGGEST_LEVELS` is this
 * module's, DEFINED HERE (R6; N155, T18). The catalogue's one-line copy of it is HELD for one tranche (rule (6), K529):
 * agent-worker's tests import it until its job re-points them here, and the catalogue's next job deletes it. Every code
 * below is minted by this module's `index.mjs`, inside the region
 * its row's `where` names. */

import { SUGGEST_CHECKS as CATALOGUE_SUGGEST, SUGGEST_KINDS } from "../../checks/bio-checks.mjs";

export { SUGGEST_KINDS };

/* The four levels `level-empty` may report on (R6). CLAUDE.md's "NEVER ASSUME THE LOWER LEVELS ARE COMPLETE" names
   exactly these four, and saying WHICH absence is a first-class obligation there. */
export const SUGGEST_LEVELS = Object.freeze(['meaning', 'content', 'documents', 'internet']);

/* ===========================================================================
 * C-104 — THE EXTRACT RUN'S PROPOSED READINGS (op=extractpropose, op=extractproposals; SK-8).
 * R13 (DEC-49): every refusal of R10 and R12 carries a check and translation. This module's other production,
 * `op=suggest`, is SUGGEST_CHECKS (C-27); these are not added there because that family is the suggest endpoint's own
 * registry, and the extract endpoint is a different door with its own conditions.
 *
 * THE `where`s NAME THE REGIONS `index.mjs` MARKS: `is-extract-run` (NO_PROPOSER, NO_RUN, NO_SUCH_RUN, before
 * `runPrincipalGate` is relayed), `is-extract-door` (RUN_NOT_RUNNING through NO_PROPOSALS, after that relay),
 * `is-extract-document` (NOT_A_DOCUMENT and NO_BYTES_HELD: after NO_TARGET and NO_SUCH_BUNDLE, which have no row, and
 * before the chain step's relayed refusal), `is-extract-whole-batch` (after each reference's relayed check) and, in
 * `extractProposals`, `is-extract-scope` (EXTRACT_NO_SCOPE). The relayed refusals (AI_RUN_NOT_PRINCIPAL, the text
 * chain's, extraction's per-reference rows) carry their own rows and stay outside every region here.
 *
 * TWO CODES ARE MINTED AT ONE OTHER SITE FOR THE SAME CONDITION: NOT_A_DOCUMENT and NO_BYTES_HELD, which content's
 * mint door (`src/content/index.mjs`) asks in the same words. Each sentence is written true at both (T4's `ABSENT`
 * precedent: one code, one row, true wherever it is minted). NO_TARGET and NO_SUCH_BUNDLE are multi-site codes a single
 * `where` cannot claim, and R13 excepts them (K163). EXTRACT_NO_SCOPE replaces the store's `NO_SCOPE`, whose other site
 * (a published case's authored scope) is a different condition (R12; C-104.12).
 * =========================================================================== */
const EXTRACT_PROPOSE_ROWS = {
  NO_PROPOSER: {
    check: 'C-104.1',
    where: 'src/run-productions/index.mjs extractPropose > is-extract-run',
    translation: 'This proposed reading arrived without saying who proposed it, and the record keeps nothing it cannot '
      + 'attribute. Nothing was proposed and no passage was marked citable.',
  },
  NO_RUN: {
    check: 'C-104.2',
    where: 'src/run-productions/index.mjs extractPropose > is-extract-run',
    translation: 'A machine proposes readings only as part of an investigation a member opened, and this named none. '
      + 'Nothing was proposed.',
  },
  NO_SUCH_RUN: {
    check: 'C-104.3',
    where: 'src/run-productions/index.mjs extractPropose > is-extract-run',
    translation: 'No investigation you can see is open under that name, so nothing was proposed. A member opens an '
      + 'investigation; the assistant may suggest one, and may not start it.',
  },
  RUN_NOT_RUNNING: {
    check: 'C-104.4',
    where: 'src/run-productions/index.mjs extractPropose > is-extract-door',
    translation: 'The investigation this names has ended, and an ended investigation takes no new proposals: its work is '
      + 'read against the conditions it ran under, and those stopped when it stopped. Nothing was proposed.',
  },
  NOT_AN_EXTRACT_RUN: {
    check: 'C-104.5',
    where: 'src/run-productions/index.mjs extractPropose > is-extract-door',
    translation: 'This investigation was not opened to read documents for what they name, so it cannot propose readings. '
      + 'What an investigation may do is set when it is opened and never widened by its work. Nothing was proposed.',
  },
  NO_MINTS_BOUND: {
    check: 'C-104.6',
    where: 'src/run-productions/index.mjs extractPropose > is-extract-door',
    translation: 'This investigation was opened with no limit on how many passages it may mark citable, and without a '
      + 'limit it may mark none. The member who opens an investigation sets that limit. Nothing was proposed.',
  },
  MINTS_BOUND_REACHED: {
    check: 'C-104.7',
    where: 'src/run-productions/index.mjs extractPropose > is-extract-door',
    translation: 'This investigation has already marked as many passages citable as it was allowed to, so it proposes '
      + 'nothing more and ends. Nothing was proposed.',
  },
  NO_PROPOSALS: {
    check: 'C-104.8',
    where: 'src/run-productions/index.mjs extractPropose > is-extract-door',
    translation: 'This named no readings to propose. A look that found nothing is recorded in the investigation\'s log of '
      + 'what was looked at, where it says which kind of absence it was, and not here. Nothing was proposed.',
  },
  NOT_A_DOCUMENT: {
    check: 'C-104.9',
    where: 'src/run-productions/index.mjs extractPropose > is-extract-document',
    translation: 'That is not a captured document. A question, a project or an action has no pages or text of its own, '
      + 'so there is nothing in it to read or to point into. Nothing was changed.',
  },
  NO_BYTES_HELD: {
    check: 'C-104.10',
    where: 'src/run-productions/index.mjs extractPropose > is-extract-document',
    translation: 'The record holds no captured copy of that document, so there is no text in it to read or to point '
      + 'into. That is a fact about what has been captured, never about what the document says. Nothing was changed.',
  },
  MINTS_BOUND_WOULD_EXCEED: {
    check: 'C-104.11',
    where: 'src/run-productions/index.mjs extractPropose > is-extract-whole-batch',
    translation: 'This batch would mark more passages citable than the investigation has left of its limit, so the whole '
      + 'batch was refused rather than cut to fit: a trimmed batch would drop proposals the sender believes '
      + 'were filed. Nothing was proposed. Send fewer, or ask the member who opened the investigation.',
  },
  /* K163 (T6): op=extractproposals' unscoped read. run-productions mints this code of its own in place of the
     store's `NO_SCOPE`, whose other site (a published case's authored scope) is a different condition. Minted
     nowhere yet: run-productions writes it when it moves `extractProposals` (T6-7) and marks the region. */
  EXTRACT_NO_SCOPE: {
    check: 'C-104.12',
    where: 'src/run-productions/index.mjs extractProposals > is-extract-scope',
    translation: 'This list of proposed readings names neither an investigation nor a document, so nothing was '
      + 'listed. A list of every proposal in the record would be a scan nobody can act on; name the one you mean.',
  },
};

/** The C-27 rows `op=suggest` mints (R1, R3): every row of the family but C-27.15, basis-versions' document-gate row.
 *  Named by the family rather than spelled again, so no code is written here as a second minting site. */
export const SUGGEST_CHECK_KEYS = Object.freeze(Object.keys(CATALOGUE_SUGGEST)
  .filter((k) => CATALOGUE_SUGGEST[k].check !== "C-27.15"));

/** The C-104 rows the extract productions mint (R10, R12): the whole family. */
export const EXTRACT_PROPOSE_CHECK_KEYS = Object.freeze(Object.keys(EXTRACT_PROPOSE_ROWS));

/** R13's two codes minted without a row: one condition minted at many sites, which a single `where` cannot claim. */
export const ROWLESS_CODES = Object.freeze(["NO_TARGET", "NO_SUCH_BUNDLE"]);

const pick = (family, keys) => Object.freeze(Object.fromEntries(keys.map((k) => [k, family[k]])));

export const SUGGEST_CHECKS = pick(CATALOGUE_SUGGEST, SUGGEST_CHECK_KEYS);
export const EXTRACT_PROPOSE_CHECKS = pick(EXTRACT_PROPOSE_ROWS, EXTRACT_PROPOSE_CHECK_KEYS);
