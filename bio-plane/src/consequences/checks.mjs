/* consequences' refusal rows (requirements: `build/requirements/consequences.md`, R1, R3, R6, R9; K248 (4)). DEC-49:
 * every refusal this module answers carries its code, its row in this module's own family, C-114, and the member's
 * translation. The codes are the requirements' (R1's in its order, R10's among them, then R3's, R6's and R9's) and K249's lower-level
 * choices (`NO_RATIONALE`, `BAD_RATIONALE`, `BASIS_UNREADABLE`, `NO_SUCH_EVIDENCE`, `NO_SUCH_PART`,
 * `ALREADY_SUPERSEDED`, `NO_REASON`, `BAD_REASON`, `ADDRESSED_UNKNOWN_STATE`). Each code is minted at one site, the
 * function its row's `where` names (K231): a code more than one act answers is minted by one helper, which they call.
 * `NO_SUCH_DETERMINATION` and `DETERMINATION_SUPERSEDED` are conformance's own (its R19 `noSuchDetermination` and R20
 * `determinationSuperseded`, N309, K275), which R1, R7 and R9 answer through: C-114.1 is retired (K380) and its number
 * is not reused. R1's two codes of this module's own conditions are named for it (K380): `CONSEQUENCE_NOT_NONCOMPLIANT`
 * (C-114.2) and `CONSEQUENCE_NOT_A_PARTICIPANT` (C-114.3). R10's codes since T33 (K1484) are C-114.21 and C-114.22;
 * `AFFECTED_INDIVIDUAL` (C-114.5) is retired. Codes R2 answers for its owners, `calc-grammar`'s `UNIT_MISMATCH` and
 * `money`'s summation codes (`SUM_MIXED_*`, `FACT_WITHDRAWN`), are theirs and carry no row here (`foreignRefusal`).
 * T45 adds R9's four, the success record's (R17–R21) and the carry's (R22), C-114.23 onward; `NO_SUCH_PROJECT` (R17) is
 * membership's, `DETERMINATION_VOID` (R1) conformance's, and `carryOutcome`'s codes case-inputs' (T47; case-authoring's
 * before): none has a row here.
 * T46 (R25; DEC-194, N913): seventeen of T45's rows take their translations from `words.json`'s `refusal.<CODE>`, read by
 * key from `CONSEQUENCES_WORDS`, never a copy; their codes, numbers and `where`s are unmoved. C-114.29, .34 and .37 keep
 * their own in T46 (R25), as do the rows `words.json` does not hold. */

/* R25 (T46; DEC-194, N913): the words of `words.json` (`docs/development/ux-substrate/screens/words.json`) this module
   answers, each `en` verbatim, read by key, as membership's `HANDLE_WORDS` and extraction's `TRANSCRIBE_WORDS` are:
   seventeen rows' `refusal.<CODE>` and R19's two sentences. The design stream's words: re-worded there, then re-taken
   here by key; a row never holds a copy of its sentence. Not taken in T46 (R25), each returned to BOB until its words and
   this module's behaviour agree: `refusal.SUCCESS_NO_STATEMENT`, `refusal.SUCCESS_CAUSE_UNSTATED`,
   `refusal.SUCCESS_CAUSE_UNCHECKABLE`. */
import { word, localize } from "../setup-words/index.mjs";

export const CONSEQUENCES_WORDS = Object.freeze({
  "refusal.ADDRESSED_WORD_REFUSED": word("refusal.ADDRESSED_WORD_REFUSED"),
  "refusal.ADDRESSED_NO_PERCENTAGE": word("refusal.ADDRESSED_NO_PERCENTAGE"),
  "refusal.ADDRESSED_NO_REASON": word("refusal.ADDRESSED_NO_REASON"),
  "refusal.ADDRESSED_BAD_REASON": word("refusal.ADDRESSED_BAD_REASON"),
  "refusal.MACHINE_CANNOT_RECORD_SUCCESS": word("refusal.MACHINE_CANNOT_RECORD_SUCCESS"),
  "refusal.SUCCESS_NOT_A_PARTICIPANT": word("refusal.SUCCESS_NOT_A_PARTICIPANT"),
  "refusal.SUCCESS_BAD_DATE": word("refusal.SUCCESS_BAD_DATE"),
  "refusal.SUCCESS_NO_EVIDENCE": word("refusal.SUCCESS_NO_EVIDENCE"),
  "refusal.SUCCESS_TOO_LARGE": word("refusal.SUCCESS_TOO_LARGE"),
  "refusal.SUCCESS_FIGURE_NOT_COMPUTED": word("refusal.SUCCESS_FIGURE_NOT_COMPUTED"),
  "refusal.SUCCESS_CAUSE_NOT_EVIDENCED": word("refusal.SUCCESS_CAUSE_NOT_EVIDENCED"),
  "refusal.SUCCESS_CAUSE_OWN_ACT_ONLY": word("refusal.SUCCESS_CAUSE_OWN_ACT_ONLY"),
  "refusal.NO_SUCH_SUCCESS_RECORD": word("refusal.NO_SUCH_SUCCESS_RECORD"),
  "refusal.SUCCESS_NO_REASON": word("refusal.SUCCESS_NO_REASON"),
  "refusal.SUCCESS_BAD_REASON": word("refusal.SUCCESS_BAD_REASON"),
  "refusal.SUCCESS_SUPERSEDED": word("refusal.SUCCESS_SUPERSEDED"),
  "refusal.MACHINE_CANNOT_CARRY": word("refusal.MACHINE_CANNOT_CARRY"),
  "consequences.success.sequence_not_cause": word("consequences.success.sequence_not_cause"),
  "consequences.success.cause_not_stated": word("consequences.success.cause_not_stated"),
});

/** R25: a word read by key; a throw for a key the list lacks, because a missing sentence is silent and reaches a person
 *  while a throw is loud in a test (DEC-49's rule). */
export function consequencesWords(key) {
  const en = CONSEQUENCES_WORDS[key];
  if (typeof en !== "string" || !en) throw new Error(`consequencesWords: ${key} is not one of this module's words (words.json)`);
  return en;
}
const words = (code) => consequencesWords(`refusal.${code}`);

const at = (fn) => `src/consequences/index.mjs ${fn}`;
const row = (n, fn, translation) => Object.freeze({ check: `C-114.${n}`, where: at(fn), translation });

export const CONSEQUENCES_CHECKS = Object.freeze({
  CONSEQUENCE_NOT_NONCOMPLIANT: row(2, "#record", word("refusal.CONSEQUENCE_NOT_NONCOMPLIANT")),
  CONSEQUENCE_NOT_A_PARTICIPANT: row(3, "#participantRefusal", word("refusal.CONSEQUENCE_NOT_A_PARTICIPANT")),
  AFFECTED_UNKNOWN_KIND: row(4, "checkAffected", word("refusal.AFFECTED_UNKNOWN_KIND")),
  MEASURE_UNKNOWN_UNIT: row(6, "checkMeasure", word("refusal.MEASURE_UNKNOWN_UNIT")),
  MEASURE_INVALID: row(7, "checkMeasure", word("refusal.MEASURE_INVALID")),
  PERIOD_INVALID: row(8, "checkPeriod", word("refusal.PERIOD_INVALID")),
  MACHINE_CANNOT_ASSESS: row(9, "#basis", word("refusal.MACHINE_CANNOT_ASSESS")),
  NO_RATIONALE: row(10, "#basis", word("refusal.NO_RATIONALE")),
  BAD_RATIONALE: row(11, "#basis", word("refusal.BAD_RATIONALE")),
  BASIS_UNREADABLE: row(12, "basisUnreadable", word("refusal.BASIS_UNREADABLE")),
  NO_SUCH_EVIDENCE: row(13, "#evidenceRefusal", word("refusal.NO_SUCH_EVIDENCE")),
  NO_SUCH_PART: row(14, "noSuchPart", word("refusal.NO_SUCH_PART")),
  ALREADY_SUPERSEDED: row(15, "alreadySuperseded", word("refusal.ALREADY_SUPERSEDED")),
  NO_REASON: row(16, "reasonRefusal", localize("consequences.checks.a_revision_says_why", "A revision says why.")),
  BAD_REASON: row(17, "reasonRefusal", localize("consequences.checks.a_reason_is_at_most_500", "A reason is at most 500 characters: say why in a sentence or two. Nothing was written.")),
  MACHINE_CANNOT_ADDRESS: row(18, "addressedRecord", word("refusal.MACHINE_CANNOT_ADDRESS")),
  ADDRESSED_UNKNOWN_STATE: row(19, "addressedRecord", localize("consequences.checks.a_part_is_recorded_addressed", "A part is recorded addressed or not_addressed.")),
  ADDRESSED_NO_EVIDENCE: row(20, "addressedRecord", word("refusal.ADDRESSED_NO_EVIDENCE")),
  /* R10 (K1484 C2 row 7; T33-71): AFFECTED_INDIVIDUAL's C-114.5 is retired with the code, and its number not reused. */
  AFFECTED_PERSON_NOT_NAMED: row(21, "#checkPerson", word("refusal.AFFECTED_PERSON_NOT_NAMED")),
  AFFECTED_NOT_A_PERSON: row(22, "#checkPerson", word("refusal.AFFECTED_NOT_A_PERSON")),
  /* T45 (R9 amended; R17–R22): the next numbers of C-114, in the requirements' Rows order. T46 (R25): seventeen read
     `words.json`'s `refusal.<CODE>` by key; C-114.29, .34 and .37 keep T45's words until theirs and R17, R19 agree. */
  ADDRESSED_WORD_REFUSED: row(23, "addressedRecord", words("ADDRESSED_WORD_REFUSED")),
  ADDRESSED_NO_PERCENTAGE: row(24, "addressedRecord", words("ADDRESSED_NO_PERCENTAGE")),
  ADDRESSED_NO_REASON: row(25, "addressedRecord", words("ADDRESSED_NO_REASON")),
  ADDRESSED_BAD_REASON: row(26, "addressedRecord", words("ADDRESSED_BAD_REASON")),
  MACHINE_CANNOT_RECORD_SUCCESS: row(27, "#successRefusal", words("MACHINE_CANNOT_RECORD_SUCCESS")),
  SUCCESS_NOT_A_PARTICIPANT: row(28, "#successRefusal", words("SUCCESS_NOT_A_PARTICIPANT")),
  SUCCESS_NO_STATEMENT: row(29, "#successRefusal", localize("consequences.checks.say_in_your_own_words", "Say in your own words what changed: at most 2,000 characters. Nothing was written.")),
  SUCCESS_BAD_DATE: row(30, "#successRefusal", words("SUCCESS_BAD_DATE")),
  SUCCESS_NO_EVIDENCE: row(31, "#successRefusal", words("SUCCESS_NO_EVIDENCE")),
  SUCCESS_TOO_LARGE: row(32, "#successRefusal", words("SUCCESS_TOO_LARGE")),
  SUCCESS_FIGURE_NOT_COMPUTED: row(33, "#successFigures", words("SUCCESS_FIGURE_NOT_COMPUTED")),
  SUCCESS_CAUSE_UNSTATED: row(34, "#causeRefusal", localize("consequences.checks.saying_the_teams_action_caused", "Saying the team's action caused the change is a statement in your own words, at most 2,000 characters. Nothing was written.")),
  SUCCESS_CAUSE_NOT_EVIDENCED: row(35, "#causeRefusal", words("SUCCESS_CAUSE_NOT_EVIDENCED")),
  SUCCESS_CAUSE_OWN_ACT_ONLY: row(36, "#causeRefusal", words("SUCCESS_CAUSE_OWN_ACT_ONLY")),
  SUCCESS_CAUSE_UNCHECKABLE: row(37, "#causeRefusal", localize("consequences.checks.whether_the_cause_rests_only", "Whether the cause rests only on the team's own acts could not be checked, so it is not recorded. You may state the sequence of events instead. Nothing was written.")),
  NO_SUCH_SUCCESS_RECORD: row(38, "noSuchSuccessRecord", words("NO_SUCH_SUCCESS_RECORD")),
  SUCCESS_NO_REASON: row(39, "successRevise", words("SUCCESS_NO_REASON")),
  SUCCESS_BAD_REASON: row(40, "successRevise", words("SUCCESS_BAD_REASON")),
  SUCCESS_SUPERSEDED: row(41, "successSuperseded", words("SUCCESS_SUPERSEDED")),
  MACHINE_CANNOT_CARRY: row(42, "outcomeCarry", words("MACHINE_CANNOT_CARRY")),
  /* T45 (R22): BOB's answer to J1 point 2 pending (the job's best reading). */
  CARRY_NOT_ADDRESSED: row(43, "outcomeCarry", word("refusal.CARRY_NOT_ADDRESSED")),
  CARRY_NO_CURE: row(44, "noCure", word("refusal.CARRY_NO_CURE")),
});
