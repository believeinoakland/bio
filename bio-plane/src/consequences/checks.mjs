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
export const CONSEQUENCES_WORDS = Object.freeze({
  "refusal.ADDRESSED_WORD_REFUSED": "A harm addressed is described with the words Remedied, Mitigated, Compensated, "
    + "Acknowledged or Can't be undone, and a harm not addressed takes none of them. Nothing was written.",
  "refusal.ADDRESSED_NO_PERCENTAGE": "How far a harm was addressed is said in words, never as a percentage, share or score. "
    + "Nothing was written.",
  "refusal.ADDRESSED_NO_REASON": "Say why, in your own words. Your reason is kept with the statement. Nothing was written.",
  "refusal.ADDRESSED_BAD_REASON": "Your reason is longer than 2,000 characters. Shorten it. Nothing was written.",
  "refusal.MACHINE_CANNOT_RECORD_SUCCESS": "Only a member records a success. Nothing was written.",
  "refusal.SUCCESS_NOT_A_PARTICIPANT": "Only someone who has joined this project can record its success. Nothing was written.",
  "refusal.SUCCESS_BAD_DATE": "The date it changed must be a real day, or a range such as a month or a year. Nothing was "
    + "written.",
  "refusal.SUCCESS_NO_EVIDENCE": "A success cites what shows it: at least one document or finding you can see. Nothing was "
    + "written.",
  "refusal.SUCCESS_TOO_LARGE": "A success cites at most 50 items and 20 figures, and its order of events is at most 1,000 "
    + "characters. Nothing was written.",
  "refusal.SUCCESS_FIGURE_NOT_COMPUTED": "A figure in a success is computed from amounts in the record, never typed in. "
    + "Choose the amounts it comes from. Nothing was written.",
  "refusal.SUCCESS_CAUSE_NOT_EVIDENCED": "A stated cause cites what shows it: at least one document or finding you can see. "
    + "Nothing was written.",
  "refusal.SUCCESS_CAUSE_OWN_ACT_ONLY": "Everything cited for the cause is your group's own act, and your own act never "
    + "shows that it caused the change. Cite what the body did or said, or leave the cause out. Nothing was written.",
  "refusal.NO_SUCH_SUCCESS_RECORD": "There is no success by that name, or none you can see. Nothing was written.",
  "refusal.SUCCESS_NO_REASON": "Say why you are revising it. Your reason is kept with the change. Nothing was written.",
  "refusal.SUCCESS_BAD_REASON": "Your reason is longer than 2,000 characters. Shorten it. Nothing was written.",
  "refusal.SUCCESS_SUPERSEDED": "This success was already revised. Revise or carry its latest version. Nothing was written.",
  "refusal.MACHINE_CANNOT_CARRY": "Only a member carries an outcome into a case. Nothing was written.",
  "consequences.success.sequence_not_cause": "This is the order things happened in. It doesn't say one caused the other.",
  "consequences.success.cause_not_stated": "No cause is stated.",
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
  CONSEQUENCE_NOT_NONCOMPLIANT: row(2, "#record", "A consequence is what a breach did: it is recorded against a "
    + "standard the determination found noncompliant."),
  CONSEQUENCE_NOT_A_PARTICIPANT: row(3, "#participantRefusal", "Recording a consequence, or whether it has been "
    + "addressed, is work inside the determination's project, done by a member who has joined it. A machine may prepare "
    + "a computed part and answers no project's authority."),
  AFFECTED_UNKNOWN_KIND: row(4, "checkAffected", "Who or what is affected is a class, a fund, a program, a service, a "
    + "body, a person a document names, or other, with a description; an office is named by its role and its body."),
  MEASURE_UNKNOWN_UNIT: row(6, "checkMeasure", "A measure counts money, benefits, services, time or a count."),
  MEASURE_INVALID: row(7, "checkMeasure", "A measure's value, or its range's bounds, are exact decimals such as "
    + "1200.50, the range in order, and a currency belongs only to money."),
  PERIOD_INVALID: row(8, "checkPeriod", "A consequence runs over a period: two dates, the start not after the end."),
  MACHINE_CANNOT_ASSESS: row(9, "#basis", "An assessment is a member's judgment. A machine may compute a part from the "
    + "record's own figures and propose an assessment as text; it never records one."),
  NO_RATIONALE: row(10, "#basis", "An assessed value is a member's judgment and says why: give the rationale for the "
    + "value or range you assessed. Nothing was written."),
  BAD_RATIONALE: row(11, "#basis", "A rationale is at most 2,000 characters."),
  BASIS_UNREADABLE: row(12, "basisUnreadable", "A basis is read as it is written: a computation "
    + "names its operation and its operands, each the content whose passage holds the figure and the figure as read, "
    + "and an assessment lists what it rests on. Nothing was written."),
  NO_SUCH_EVIDENCE: row(13, "#evidenceRefusal", "Evidence, and what an assessment rests on, are content or findings "
    + "this record holds and you may see."),
  NO_SUCH_PART: row(14, "noSuchPart", "No consequence part answers to that id. One you may not see is answered exactly as one "
    + "that does not exist."),
  ALREADY_SUPERSEDED: row(15, "alreadySuperseded", "A part that has been revised is read, not revised or addressed "
    + "again: its successor carries the record forward."),
  NO_REASON: row(16, "reasonRefusal", "A revision says why."),
  BAD_REASON: row(17, "reasonRefusal", "A reason is at most 500 characters: say why in a sentence or two. Nothing "
    + "was written."),
  MACHINE_CANNOT_ADDRESS: row(18, "addressedRecord", "Whether a consequence has been addressed is a member's judgment, "
    + "with evidence. A machine never records it."),
  ADDRESSED_UNKNOWN_STATE: row(19, "addressedRecord", "A part is recorded addressed or not_addressed."),
  ADDRESSED_NO_EVIDENCE: row(20, "addressedRecord", "A consequence is recorded addressed with the evidence that it was. "
    + "Partial redress does not end an escalation."),
  /* R10 (K1484 C2 row 7; T33-71): AFFECTED_INDIVIDUAL's C-114.5 is retired with the code, and its number not reused. */
  AFFECTED_PERSON_NOT_NAMED: row(21, "#checkPerson", "A person is recorded as affected only as a document in the record "
    + "names them: give the content whose passage names the person. Nothing was written."),
  AFFECTED_NOT_A_PERSON: row(22, "#checkPerson", "Only a registered person is recorded as an affected person: the entity "
    + "named is not one this record holds as a person. Nothing was written."),
  /* T45 (R9 amended; R17–R22): the next numbers of C-114, in the requirements' Rows order. T46 (R25): seventeen read
     `words.json`'s `refusal.<CODE>` by key; C-114.29, .34 and .37 keep T45's words until theirs and R17, R19 agree. */
  ADDRESSED_WORD_REFUSED: row(23, "addressedRecord", words("ADDRESSED_WORD_REFUSED")),
  ADDRESSED_NO_PERCENTAGE: row(24, "addressedRecord", words("ADDRESSED_NO_PERCENTAGE")),
  ADDRESSED_NO_REASON: row(25, "addressedRecord", words("ADDRESSED_NO_REASON")),
  ADDRESSED_BAD_REASON: row(26, "addressedRecord", words("ADDRESSED_BAD_REASON")),
  MACHINE_CANNOT_RECORD_SUCCESS: row(27, "#successRefusal", words("MACHINE_CANNOT_RECORD_SUCCESS")),
  SUCCESS_NOT_A_PARTICIPANT: row(28, "#successRefusal", words("SUCCESS_NOT_A_PARTICIPANT")),
  SUCCESS_NO_STATEMENT: row(29, "#successRefusal", "Say in your own words what changed: at most 2,000 characters. Nothing "
    + "was written."),
  SUCCESS_BAD_DATE: row(30, "#successRefusal", words("SUCCESS_BAD_DATE")),
  SUCCESS_NO_EVIDENCE: row(31, "#successRefusal", words("SUCCESS_NO_EVIDENCE")),
  SUCCESS_TOO_LARGE: row(32, "#successRefusal", words("SUCCESS_TOO_LARGE")),
  SUCCESS_FIGURE_NOT_COMPUTED: row(33, "#successFigures", words("SUCCESS_FIGURE_NOT_COMPUTED")),
  SUCCESS_CAUSE_UNSTATED: row(34, "#causeRefusal", "Saying the group's action caused the change is a statement in your own "
    + "words, at most 2,000 characters. Nothing was written."),
  SUCCESS_CAUSE_NOT_EVIDENCED: row(35, "#causeRefusal", words("SUCCESS_CAUSE_NOT_EVIDENCED")),
  SUCCESS_CAUSE_OWN_ACT_ONLY: row(36, "#causeRefusal", words("SUCCESS_CAUSE_OWN_ACT_ONLY")),
  SUCCESS_CAUSE_UNCHECKABLE: row(37, "#causeRefusal", "Whether the cause rests only on the group's own acts could not be "
    + "checked, so it is not recorded. You may state the sequence of events instead. Nothing was written."),
  NO_SUCH_SUCCESS_RECORD: row(38, "noSuchSuccessRecord", words("NO_SUCH_SUCCESS_RECORD")),
  SUCCESS_NO_REASON: row(39, "successRevise", words("SUCCESS_NO_REASON")),
  SUCCESS_BAD_REASON: row(40, "successRevise", words("SUCCESS_BAD_REASON")),
  SUCCESS_SUPERSEDED: row(41, "successSuperseded", words("SUCCESS_SUPERSEDED")),
  MACHINE_CANNOT_CARRY: row(42, "outcomeCarry", words("MACHINE_CANNOT_CARRY")),
  /* T45 (R22): BOB's answer to J1 point 2 pending (the job's best reading). */
  CARRY_NOT_ADDRESSED: row(43, "outcomeCarry", "Only a part a member has recorded addressed, with evidence, is carried "
    + "as harm addressed. Nothing was written."),
  CARRY_NO_CURE: row(44, "noCure", "No standing cure is linked to that determination and standard, so there is no "
    + "cure to carry. Nothing was written."),
});
