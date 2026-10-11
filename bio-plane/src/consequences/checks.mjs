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
 * membership's, `DETERMINATION_VOID` (R1) conformance's, and `carryOutcome`'s codes case-authoring's: none has a row here. */

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
  /* T45 (R9 amended; R17–R22): the next numbers of C-114, in the requirements' Rows order; translations BOB's drafts,
     the UX stream's to revise. */
  ADDRESSED_WORD_REFUSED: row(23, "addressedRecord", "The plain words a statement may carry are remedied, mitigated, "
    + "compensated, acknowledged and cannot be undone, each once, and only on a part recorded addressed. Nothing was written."),
  ADDRESSED_NO_PERCENTAGE: row(24, "addressedRecord", "Whether harm is addressed is said in words with evidence, never as a "
    + "percentage, share, ratio or score. Nothing was written."),
  ADDRESSED_NO_REASON: row(25, "addressedRecord", "Whether a part is addressed or not is a reasoned statement: say why. "
    + "Nothing was written."),
  ADDRESSED_BAD_REASON: row(26, "addressedRecord", "A reason is at most 2,000 characters. Nothing was written."),
  MACHINE_CANNOT_RECORD_SUCCESS: row(27, "#successRefusal", "A success record is a member's statement. A machine may "
    + "compute a figure for a member to adopt; it never records a success. Nothing was written."),
  SUCCESS_NOT_A_PARTICIPANT: row(28, "#successRefusal", "Recording a success is work inside the project, done by a member "
    + "who has joined it. Nothing was written."),
  SUCCESS_NO_STATEMENT: row(29, "#successRefusal", "Say in your own words what changed: at most 2,000 characters. Nothing "
    + "was written."),
  SUCCESS_BAD_DATE: row(30, "#successRefusal", "When the change took place is a real date, such as 2026-05-14, or a band "
    + "of dates. Nothing was written."),
  SUCCESS_NO_EVIDENCE: row(31, "#successRefusal", "A success rests on evidence: content or findings this record holds and "
    + "you may see. Nothing was written."),
  SUCCESS_TOO_LARGE: row(32, "#successRefusal", "A success record holds at most 50 items of evidence, 20 figures and a "
    + "sequence of 1,000 characters. Nothing was written."),
  SUCCESS_FIGURE_NOT_COMPUTED: row(33, "#successFigures", "A figure on a success record is computed from cited sources, "
    + "never stated: give its computation and its operands. Nothing was written."),
  SUCCESS_CAUSE_UNSTATED: row(34, "#causeRefusal", "Saying the group's action caused the change is a statement in your own "
    + "words, at most 2,000 characters. Nothing was written."),
  SUCCESS_CAUSE_NOT_EVIDENCED: row(35, "#causeRefusal", "Saying the group's action caused the change rests on evidence: "
    + "between 1 and 50 items this record holds and you may see. Nothing was written."),
  SUCCESS_CAUSE_OWN_ACT_ONLY: row(36, "#causeRefusal", "The group's own act is never evidence that it caused the change: "
    + "cite evidence other than the group's own actions and what it sent. You may state the sequence of events instead. "
    + "Nothing was written."),
  SUCCESS_CAUSE_UNCHECKABLE: row(37, "#causeRefusal", "Whether the cause rests only on the group's own acts could not be "
    + "checked, so it is not recorded. You may state the sequence of events instead. Nothing was written."),
  NO_SUCH_SUCCESS_RECORD: row(38, "noSuchSuccessRecord", "No success record answers to that id. One you may not see is "
    + "answered exactly as one that does not exist."),
  SUCCESS_NO_REASON: row(39, "successRevise", "A revision of a success record says why. Nothing was written."),
  SUCCESS_BAD_REASON: row(40, "successRevise", "A reason is at most 2,000 characters. Nothing was written."),
  SUCCESS_SUPERSEDED: row(41, "successSuperseded", "This success record has been revised: its successor carries the record "
    + "forward. Nothing was written."),
  MACHINE_CANNOT_CARRY: row(42, "outcomeCarry", "Carrying an outcome into the case's next edition is a member's act. A "
    + "machine never carries one. Nothing was written."),
  /* T45 (R22): BOB's answer to J1 point 2 pending (the job's best reading). */
  CARRY_NOT_ADDRESSED: row(43, "outcomeCarry", "Only a part a member has recorded addressed, with evidence, is carried "
    + "as harm addressed. Nothing was written."),
  CARRY_NO_CURE: row(44, "noCure", "No standing cure is linked to that determination and standard, so there is no "
    + "cure to carry. Nothing was written."),
});
