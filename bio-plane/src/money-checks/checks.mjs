/* money-checks' refusals (requirements: `build/requirements/money-checks.md`). Each code is minted here, once, with
 * one sentence a member reads and the requirement it answers to (DEC-49's pattern: a missing sentence throws, loudly).
 * R14: no sentence says "violation", "breach", "conflict" or "suspicious", ranks a person or names a place. */

const row = (req, translation) => Object.freeze({ check: `money-checks ${req}`, translation });

export const MONEY_CHECKS_CHECKS = Object.freeze({
  NO_CONTRACT: row("R2", "Amount checks are asked of one contract, named by its entity id. Nothing was checked."),
  NO_CHECK: row("R3", "A parameter belongs to a named check. Nothing was recorded."),
  UNKNOWN_CHECK: row("R3", "That is not one of the checks that reads a parameter; the answer lists them. Nothing was recorded."),
  UNKNOWN_PARAMETER: row("R3", "That check reads no parameter of that name; the answer lists the ones it reads. Nothing was recorded."),
  NO_VALUE: row("R3", "A parameter is stated with its value. Nothing was recorded."),
  BAD_VALUE: row("R3", "The value does not read as this parameter's kind of value; the answer says what it takes. Nothing was recorded."),
  NO_CITATION: row("R3", "A threshold or share is stated with its citation: a held standard, or your own word for it. Nothing was recorded."),
  MEMBER_ACT_ONLY: row("R5", "This is a member's act, taken in a member's own name; a machine credential cannot take it. Nothing was changed."),
  NO_LABEL: row("R4", "A detector is defined with a label that says what it looks for. Nothing was defined."),
  NO_POPULATION: row("R4", "A detector is defined with the population of money facts it runs over. Nothing was defined."),
  BAD_POPULATION: row("R4", "The population is not one this module can read; the answer says which part and what it takes. Nothing was defined."),
  BAD_RECIPE: row("R4", "The condition is not a recipe the calculation grammar accepts for a detector; the answer says which step and why. Nothing was defined."),
  NO_DENOMINATOR: row("R4", "A detector states the population its count is taken over, its denominator. Nothing was defined."),
  NO_DERIVATION: row("R4", "A detector states how its result is derived, so a reader can follow it. Nothing was defined."),
  SUBJECT_IS_PERSON: row("R4", "A detector looks at money facts, contracts and patterns over facts, never at a person; this definition names a person. Nothing was defined."),
  HYPOTHESIS_NOT_INPUT: row("R12", "A hypothesis is held apart from the facts and is never an input, subject or parameter of a check or detector. Nothing was recorded."),
  NO_SUCH_DETECTOR: row("R5", "No detector (or no version of it) answers to that id. Nothing was changed."),
  NO_PROJECT: row("R5", "This act or read names a project. Nothing was changed."),
  NO_SWITCH: row("R5", "Say whether the detector is on or off for the project (true or false). Nothing was changed."),
  NO_BUDGET: row("R6", "A detector run is given a time budget in milliseconds, above zero. Nothing was run."),
  NO_GOLD_SET: row("R8", "A false-alarm rate is recorded with the gold set it was measured on. Nothing was recorded."),
  BAD_RATE: row("R8", "A false-alarm rate is a proportion from 0 to 1. Nothing was recorded."),
  BAD_LIMIT: row("R9", "A limit is a whole number from 1 to 500. Nothing was read."),
});

/** The refusal for `code`, with the caller's fields beside it; a code with no sentence is a defect and throws. */
export function refusal(code, fields = {}) {
  const r = MONEY_CHECKS_CHECKS[code];
  if (!r) throw new Error(`money-checks: ${code} has no row with a sentence (DEC-49)`);
  return { ok: false, reason: code, code, check: r.check, translation: r.translation, ...fields };
}
