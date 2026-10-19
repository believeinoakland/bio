/* money-checks' refusals (requirements: `build/requirements/money-checks.md`). Each code is minted here, once, with
 * one sentence a member reads (DEC-49's pattern: a missing sentence throws, loudly); the requirement each answers to is
 * named beside it. R15 (N608, K1679; DEC-49 arm A): a code is held once, so a missing citation is this module's own
 * `MONEY_CHECK_NO_CITATION` (`NO_CITATION` is record-grammar's), and `check` is the catalogue id promotion stamps, null
 * until then (as `events`' rows), never a requirement's name. R14: no sentence says "violation", "breach", "conflict"
 * or "suspicious", ranks a person or names a place. */

import { word } from "../setup-words/index.mjs";

const row = (_req, translation) => Object.freeze({ check: null, translation });

export const MONEY_CHECKS_CHECKS = Object.freeze({
  NO_CONTRACT: row("R2", word("refusal.NO_CONTRACT")),
  NO_CHECK: row("R3", word("refusal.NO_CHECK")),
  UNKNOWN_CHECK: row("R3", word("refusal.UNKNOWN_CHECK")),
  UNKNOWN_PARAMETER: row("R3", word("refusal.UNKNOWN_PARAMETER")),
  NO_VALUE: row("R3", word("refusal.NO_VALUE")),
  BAD_VALUE: row("R3", word("refusal.BAD_VALUE")),
  MONEY_CHECK_NO_CITATION: row("R3", word("refusal.MONEY_CHECK_NO_CITATION")),
  MEMBER_ACT_ONLY: row("R5", word("refusal.MEMBER_ACT_ONLY")),
  NO_LABEL: row("R4", word("refusal.NO_LABEL")),
  NO_POPULATION: row("R4", word("refusal.NO_POPULATION")),
  BAD_POPULATION: row("R4", word("refusal.BAD_POPULATION")),
  BAD_RECIPE: row("R4", word("refusal.BAD_RECIPE")),
  NO_DENOMINATOR: row("R4", word("refusal.NO_DENOMINATOR")),
  NO_DERIVATION: row("R4", word("refusal.NO_DERIVATION")),
  SUBJECT_IS_PERSON: row("R4", word("refusal.SUBJECT_IS_PERSON")),
  HYPOTHESIS_NOT_INPUT: row("R12", word("refusal.HYPOTHESIS_NOT_INPUT")),
  NO_SUCH_DETECTOR: row("R5", word("refusal.NO_SUCH_DETECTOR")),
  NO_PROJECT: row("R5", word("refusal.NO_PROJECT")),
  NO_SWITCH: row("R5", word("refusal.NO_SWITCH")),
  NO_BUDGET: row("R6", word("refusal.NO_BUDGET")),
  NO_GOLD_SET: row("R8", word("refusal.NO_GOLD_SET")),
  BAD_RATE: row("R8", word("refusal.BAD_RATE")),
  BAD_LIMIT: row("R9", word("refusal.BAD_LIMIT")),
});

/** The refusal for `code`, with the caller's fields beside it; the row's own fields (`check` among them, R15) are never
 *  the caller's. A code with no sentence is a defect and throws. */
export function refusal(code, fields = {}) {
  const r = MONEY_CHECKS_CHECKS[code];
  if (!r) throw new Error(`money-checks: ${code} has no row with a sentence (DEC-49)`);
  return { ...fields, ok: false, reason: code, code, check: r.check, translation: r.translation };
}
