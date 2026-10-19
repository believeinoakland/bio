/* op-grades — R48 (T51; DEC-340, U366; K3935; amends R8): THE THREE READS THE DESIGN'S NEW SCREENS ADD, stated absent as reads.
 * `holdsdue` (`action-holds` R19), `templatebyhandle` (`filing-templates` R34) and `rulefields` (`local-facts` R18) write
 * nothing, so they take no rung and no ground: each has its `NON_ACTS` reason, beginning "read: ", and no other grade.
 * `./index.mjs` spreads the table into `NON_ACTS`. This file imports nothing, so the spread closes no cycle. None is an
 * `ACTS` row, so none is in `MACHINE_REFUSALS`, and none takes a `CONSEQUENCE_STATEMENTS` entry or joins `IRREVERSIBLE_WEIGHT`;
 * by R18 `phone` follows the rung and the ground, and a read answers `true`. */

/* ---- R48: the reads' reasons. Each names what it reads and writes nothing. ---- */
export const T51_NON_ACTS = {
  /* R48 (`action-holds` R19): the hold screen's due list, the legal marks, docket marks and pressure records without a hold */
  holdsdue: "read: the legal marks, docket marks and pressure records that have no hold yet, each with where it arrived and who marked it (`action-holds` R19); writes nothing",
  /* R48 (`filing-templates` R34): one template's text and blanks by its name, for the version offered to the caller */
  templatebyhandle: "read: a template's text and blanks by its name, for the version offered to the caller (`filing-templates` R34); writes nothing",
  /* R48 (`local-facts` R18): the fields a drafted rule's entry carries, per section, with their choices */
  rulefields: "read: the fields a drafted rule's entry carries for a section, with their kinds and choices (`local-facts` R18); writes nothing",
};
