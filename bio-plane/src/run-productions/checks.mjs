/* run-productions' DEC-49 rows (R6, R13, R16; K6, K163): every refusal this module mints carries its row, and every
 * row below is DEFINED HERE.
 *
 *   C-27.1–C-27.14, C-27.16–C-27.19  `op=suggest` (R1, R3), SUGGEST_CHECKS. Moved out of the catalogue (N155's last
 *                                    share, T19), the rows unchanged. C-27.15 (`VERSION_KIND_UNKNOWN`) is
 *                                    basis-versions' (its R1; K82 (4)), the document gate's row, never minted here.
 *   C-104.1–C-104.12                 `op=extractpropose` and `op=extractproposals` (R10, R12, R13),
 *                                    EXTRACT_PROPOSE_CHECKS. Moved whole out of the catalogue (N155, T18), the rows
 *                                    unchanged. `NO_TARGET` and `NO_SUCH_BUNDLE` have no row (the catalogue's REC-64
 *                                    rule; R13, K163).
 *
 * `SUGGEST_KINDS` is basis-versions' (R6), read from it and re-exported here; `SUGGEST_LEVELS` is this module's (R6;
 * N155, T18). Every code below is minted by this module's `index.mjs`, inside the region its row's `where` names. */

import { SUGGEST_KINDS } from "../basis-versions/index.mjs";

export { SUGGEST_KINDS };

/* The four levels `level-empty` may report on (R6). CLAUDE.md's "NEVER ASSUME THE LOWER LEVELS ARE COMPLETE" names
   exactly these four, and saying WHICH absence is a first-class obligation there. */
export const SUGGEST_LEVELS = Object.freeze(['meaning', 'content', 'documents', 'internet']);

/* ===========================================================================
 * C-27 — THE SUGGEST ENDPOINT'S REFUSALS (op=suggest; PL-3 / IS-4). Every row carries its C-number, its DEC-49 wire
 * code and the canned translation a surface renders; a surface may RENDER a refusal it received and may never compute
 * one (DEC-8).
 *
 * EVERY `where` NAMES A REGION AND NOT THE WHOLE FUNCTION (REC-71). A `where` names THE SMALLEST SPAN IN WHICH THE
 * ROW'S REFUSAL IS ENFORCED; a whole-function `where` conscripts every refusal that arrives in that function AFTER the
 * row is written, which is how PL-1's two rows turned 32 unrelated refusals into DEC-49's business.
 *
 * NO MEMBER-FACING STRING BELOW SAYS "ground", "partition", "AND" or "OR" as a member-facing word — DEC-32's
 * elicitation clause 1 and D-226, the same bound basis-versions' VERSION_ACT_CHECKS and BASIS_VERSION_CHECKS respect.
 * =========================================================================== */
const SUGGEST_ROWS = {
  /* ---- the shape of the request. Refused before anything is composed. ---- */
  SUGGEST_NO_TARGET: {
    check: 'C-27.1',
    where: 'src/run-productions/index.mjs suggest > is-suggest-shape',
    translation: 'That request did not say which question the suggestion is about. '
      + 'A reading of the evidence always belongs to one question, so it asks rather than guessing.',
  },
  SUGGEST_NOT_AN_INQUIRY: {
    check: 'C-27.2',
    where: 'src/run-productions/index.mjs suggest > is-suggest-shape',
    translation: 'Only a question carries readings of its evidence, and the thing named here is not a '
      + 'question. There is nothing under it for a suggestion to be a reading of.',
  },
  SUGGEST_UNKNOWN_KIND: {
    check: 'C-27.3',
    where: 'src/run-productions/index.mjs suggest > is-suggest-shape',
    translation: 'A suggestion is one of five kinds and this one names none of them. The kinds are a '
      + 'closed set so that a run reporting an empty search is told apart from a run that reported '
      + 'nothing at all, which no other field can distinguish.',
  },
  SUGGEST_NO_RUN: {
    check: 'C-27.4',
    where: 'src/run-productions/index.mjs suggest > is-suggest-shape',
    translation: 'Every suggestion names the piece of work that produced it, and this one named none '
      + 'that can be read here. What was searched, under which declared conditions, and where it '
      + 'stopped is what lets anyone else check a reading rather than take it on trust.',
  },
  /* REC-165 (INVESTIGATIVE-SESSION.md §11 item 5, rule 1, BOB #25): A VERSION IS FORMED UNDER A LIVE RUN. The
     run is what a version is read against, and a run that has ended stopped being the conditions anything is
     formed under. Asked AFTER sight (SUGGEST_NO_RUN for a run the caller cannot see) and position
     (AI_RUN_NOT_PRINCIPAL, C-22.12, relayed from `runPrincipalGate`), so it is said only to the run's principal.
     C-27.18 is a dotted member of PL-3's family, the family owner's to allocate (`tools/mintid.mjs` C). */
  SUGGEST_RUN_NOT_RUNNING: {
    check: 'C-27.18',
    where: 'src/run-productions/index.mjs suggest > is-suggest-shape',
    translation: 'The investigation this suggestion names has ended. A suggestion is read against the '
      + 'conditions of the investigation that produced it, and those stopped being current when it '
      + 'stopped, so going on means starting a new one.',
  },
  /* REC-165, BOB #28 (2026-09-22, §11 item 5, "Rule 1's target"): A SUGGESTION LANDS ONLY INSIDE ITS RUN'S
     CONTEXT — the context itself, or, for a run over a project, a question that project confirmed-cites. Asked
     after sight and position, so a run the caller cannot see still answers as absent. C-27.19, the same family. */
  SUGGEST_OUTSIDE_RUN_CONTEXT: {
    check: 'C-27.19',
    where: 'src/run-productions/index.mjs suggest > is-suggest-shape',
    translation: 'This suggestion is about a question the investigation was not working on. An investigation '
      + 'is read against its own question, or the questions its project draws on, so work on a different '
      + 'question starts an investigation of that question.',
  },
  SUGGEST_NAME_TAKEN: {
    check: 'C-27.5',
    where: 'src/run-productions/index.mjs suggest > is-suggest-shape',
    translation: 'This question already holds a reading by that name. Names are unique within one '
      + 'question so a member can ask for a reading by name, and a second one wearing the same name '
      + 'would make every later reference ambiguous.',
  },
  SUGGEST_EMPTY_LEVEL_UNSTATED: {
    check: 'C-27.6',
    where: 'src/run-productions/index.mjs suggest > is-suggest-shape',
    translation: 'Reporting that a level of the search is empty means saying WHICH level was searched '
      + 'and where the log of that search can be read. Absence at one level is not absence at the '
      + 'next, and an unattributed empty answer is the one shape nobody can check.',
  },
  /* SEPARATE FROM SUGGEST_UNWRITABLE_DOCUMENT, and the DEC-49 GUARD IS WHAT
     FORCED THE DISTINCTION rather than a design instinct. One code was written
     for both, and arm C failed the harness naming the file, the line, the region
     and the code: a `where` names ONE span, and a code minted in two regions
     cannot have one. Reading the row again with that in hand, they ARE two
     conditions — this one is "there is no file here to read", which is a fact
     about the question and is knowable before anything is composed; the other is
     "the file is in a shape this restricted grammar cannot be extended in
     place", which is a fact about the bytes and is only knowable at the write. */
  SUGGEST_NO_DOCUMENT: {
    check: 'C-27.17',
    where: 'src/run-productions/index.mjs suggest > is-suggest-shape',
    translation: 'This question has no readable file behind it, so there is nothing for a reading of its '
      + 'evidence to be added to. That is a fact about the question rather than about the reading, and '
      + 'nothing was composed.',
  },
  SUGGEST_TOO_MANY_LEGS: {
    check: 'C-27.7',
    where: 'src/run-productions/index.mjs suggest > is-suggest-shape',
    translation: 'This suggestion rests on more pieces of evidence than one reading may carry. The '
      + 'limit is published in the refusal so a caller can split the reading rather than guess at '
      + 'what would have fitted.',
  },

  /* ---- THE SIX PRE-WRITE CHECKS (section 14b.5). Each is its own C-number and
     each is removable ON ITS OWN, which is the owed control this item carries
     (VF-1 control 6): a control that removes them all together proves only that
     the block exists. ---- */

  /* CHECK 1. D-168 is the whole reason this is not a type check: `op=cite` is
     TYPE-ONLY today, so a naive reachability check would PASS RETIRED
     INFORMATION — a leg resting on a document the record has itself retired,
     reading to every later reader as live support. */
  SUGGEST_LEG_UNREACHABLE: {
    check: 'C-27.8',
    where: 'src/run-productions/index.mjs suggest > is-suggest-checks',
    translation: 'One of the pieces of evidence this reading rests on cannot be reached where it says '
      + 'it is: it is not in the record, it cannot be read from here, or the record has retired it. '
      + 'A reading resting on something retired reads to a later member as live support for the answer.',
  },
  /* CHECK 2. The pair, PER AXIS, over the version's own declared structure —
     DEC-21/DEC-44 refuse a single composed number four ways, so what has to
     compute is two answers and never one. */
  SUGGEST_PAIR_DOES_NOT_COMPUTE: {
    check: 'C-27.9',
    where: 'src/run-productions/index.mjs suggest > is-suggest-checks',
    translation: 'The strength of this reading does not work out over the structure it declares, on '
      + 'one or both of the two things strength is measured on. A reading whose arithmetic cannot be '
      + 'run is a reading nobody can check, and it is not put forward.',
  },
  /* CHECK 3. Section 6 rule 8, Bob's own words: a background run adds its output
     as a new version ONLY IF IT DIFFERS IN SUBSTANCE from every existing one.
     Compared over PL-1's CANONICAL COMPOSITION, byte for byte, which is the same
     bytes the freeze compares — so "the same reading" means one thing here. */
  SUGGEST_NOT_DIFFERENT: {
    check: 'C-27.10',
    where: 'src/run-productions/index.mjs suggest > is-suggest-checks',
    translation: 'This reading of the evidence is the same in substance as one this question already '
      + 'holds, so it is not put forward a second time. The reading it matches is named, and adding a '
      + 'duplicate would grow the review pile without adding anything to review.',
  },
  /* CHECK 4. D-195, and *"the Judith Miller error with arithmetic behind it"* is
     what the sweep called an AI composing alternatives at volume. The arithmetic
     takes a MAXIMUM across independently sufficient branches, so two branches
     that trace to one upstream origin make a finding look stronger for a reason
     that is not there. Content-addressed provenance lets the plane DERIVE it. */
  SUGGEST_BRANCHES_NOT_INDEPENDENT: {
    check: 'C-27.11',
    where: 'src/run-productions/index.mjs suggest > is-suggest-checks',
    translation: 'Two parts of this reading are offered as separate routes to the same answer, and the '
      + 'record can show they trace back to the same original material. Treating them as separate '
      + 'makes the answer look better supported than it is, so a machine may not put it forward that '
      + 'way; a member may still say they are genuinely separate, and that is their call to sign for.',
  },
  /* CHECK 5. The placeholder defect at machine scale. */
  SUGGEST_BOILERPLATE: {
    check: 'C-27.12',
    where: 'src/run-productions/index.mjs suggest > is-suggest-checks',
    translation: 'A field this reading has to fill in carries filler text rather than an account of '
      + 'anything. A required field filled to get past a check is worse than an empty one, because it '
      + 'reads to the next member as something somebody wrote.',
  },
  /* CHECK 6. Section 4: THE AI HOLDS NO OP THAT ACCEPTS. The sole possible
     output of this endpoint is a version in state `suggested`, so anything the
     caller says about state, about hiding, about who decided and why, or about
     what a project stands on is refused rather than ignored. */
  SUGGEST_UNWRITABLE_STATE: {
    check: 'C-27.13',
    where: 'src/run-productions/index.mjs suggest > is-suggest-checks',
    translation: 'This suggestion tries to arrive already decided — settled, set aside, hidden, or '
      + 'signed by somebody. A suggestion may only ever arrive as something put forward; deciding '
      + 'what to do with it is a named member\'s act and no automated caller can reach it.',
  },

  /* THE CHECK THAT DID NOT FINISH, and it is its own condition rather than a
     verdict borrowed from one of the two checks that can hit it. `heldMatch`
     learned this the hard way and D-129 wrote it down: NOT FOUND and DID NOT
     FINISH LOOKING are different facts, and only one of them licenses a
     conclusion. Both check 3 and check 4 read row sources whose size is a
     property of the record rather than of the submission, so both publish a
     bound and both FAIL CLOSED when they reach it — a duplicate the comparison
     never got to, or a shared origin the trace never reached, would otherwise be
     a silent pass on the safe-looking side. */
  SUGGEST_COMPARISON_INCOMPLETE: {
    check: 'C-27.16',
    where: 'src/run-productions/index.mjs suggest > is-suggest-checks',
    translation: 'The record holds more material behind this question than could be checked in one '
      + 'pass, so whether this reading is genuinely new, or genuinely made of separate parts, was not '
      + 'settled either way. Not finishing the check is a different fact from passing it, and this '
      + 'record does not let the two read the same.',
  },

  /* ---- the write itself. Separate from check 6 on purpose: that one is about
     the STATE the caller asked for, this one is about the DOCUMENT. ---- */
  SUGGEST_UNWRITABLE_DOCUMENT: {
    check: 'C-27.14',
    where: 'src/run-productions/index.mjs suggest > is-suggest-write',
    translation: 'This question\'s own file could not be extended in place, so nothing was written. '
      + 'Adding a reading edits the record the reading lives in, and a half-written record is worse '
      + 'than an unchanged one.',
  },

};

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

/** The C-27 rows `op=suggest` mints (R1, R3): the family but C-27.15, basis-versions' document-gate row. */
export const SUGGEST_CHECK_KEYS = Object.freeze(Object.keys(SUGGEST_ROWS));

/** The C-104 rows the extract productions mint (R10, R12): the whole family. */
export const EXTRACT_PROPOSE_CHECK_KEYS = Object.freeze(Object.keys(EXTRACT_PROPOSE_ROWS));

/** R13's two codes minted without a row: one condition minted at many sites, which a single `where` cannot claim. */
export const ROWLESS_CODES = Object.freeze(["NO_TARGET", "NO_SUCH_BUNDLE"]);

const pick = (family, keys) => Object.freeze(Object.fromEntries(keys.map((k) => [k, family[k]])));

export const SUGGEST_CHECKS = pick(SUGGEST_ROWS, SUGGEST_CHECK_KEYS);
export const EXTRACT_PROPOSE_CHECKS = pick(EXTRACT_PROPOSE_ROWS, EXTRACT_PROPOSE_CHECK_KEYS);
