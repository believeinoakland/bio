/* consequences' refusal rows (requirements: `build/requirements/consequences.md`, R1, R3, R6, R9; K248 (4)). DEC-49:
 * every refusal this module answers carries its code, its row in this module's own family, C-114, and the member's
 * translation. The codes are the requirements' (R1's in its order, then R3's, R6's and R9's) and K249's lower-level
 * choices (`NO_RATIONALE`, `BAD_RATIONALE`, `BASIS_UNREADABLE`, `NO_SUCH_EVIDENCE`, `NO_SUCH_PART`,
 * `ALREADY_SUPERSEDED`, `NO_REASON`, `BAD_REASON`, `ADDRESSED_UNKNOWN_STATE`). */

const at = (fn) => `src/consequences/index.mjs ${fn}`;
const row = (n, fn, translation) => Object.freeze({ check: `C-114.${n}`, where: at(fn), translation });

export const CONSEQUENCES_CHECKS = Object.freeze({
  NO_SUCH_DETERMINATION: row(1, "#record", "A consequence is recorded against a determination you can see. One you may not "
    + "see is answered exactly as one that does not exist."),
  NOT_NONCOMPLIANT: row(2, "#record", "A consequence is what a breach did: it is recorded against a standard the live "
    + "determination found noncompliant. A superseded determination's parts stay readable and are not carried forward."),
  NOT_A_PARTICIPANT: row(3, "#record", "Recording a consequence is work inside the determination's project, done by a "
    + "member who has joined it. A machine may prepare a computed part and answers no project's authority."),
  AFFECTED_UNKNOWN_KIND: row(4, "checkAffected", "Who or what is affected is a class, a fund, a program, a service, a "
    + "body or other, with a description."),
  AFFECTED_INDIVIDUAL: row(5, "checkAffected", "People are counted as a class or named in their official role, never "
    + "singled out: no part names an individual."),
  MEASURE_UNKNOWN_UNIT: row(6, "checkMeasure", "A measure counts money, benefits, services, time or a count."),
  MEASURE_INVALID: row(7, "checkMeasure", "A measure's value, or its range's bounds, are finite numbers, the range in "
    + "order, and a currency belongs only to money."),
  PERIOD_INVALID: row(8, "checkPeriod", "A consequence runs over a period: two dates, the start not after the end."),
  MACHINE_CANNOT_ASSESS: row(9, "#basis", "An assessment is a member's judgment. A machine may compute a part from the "
    + "record's own figures and propose an assessment as text; it never records one."),
  NO_RATIONALE: row(10, "#basis", "An assessed value says why."),
  BAD_RATIONALE: row(11, "#basis", "A rationale is at most 2,000 characters."),
  BASIS_UNREADABLE: row(12, "#computation", "A computation names its operation and its operands: each the content whose "
    + "passage holds the figure, and the figure as read."),
  NO_SUCH_EVIDENCE: row(13, "#resolvesEvidence", "Evidence, and what an assessment rests on, are content or findings "
    + "this record holds and you may see."),
  NO_SUCH_PART: row(14, "#part", "No consequence part answers to that id. One you may not see is answered exactly as one "
    + "that does not exist."),
  ALREADY_SUPERSEDED: row(15, "consequenceRevise", "A part that has been revised is read, not revised or addressed "
    + "again: its successor carries the record forward."),
  NO_REASON: row(16, "consequenceRevise", "A revision, and an addressed record, say why."),
  BAD_REASON: row(17, "consequenceRevise", "A reason is at most 500 characters."),
  MACHINE_CANNOT_ADDRESS: row(18, "addressedRecord", "Whether a consequence has been addressed is a member's judgment, "
    + "with evidence. A machine never records it."),
  ADDRESSED_UNKNOWN_STATE: row(19, "addressedRecord", "A part is recorded addressed or not_addressed."),
  ADDRESSED_NO_EVIDENCE: row(20, "addressedRecord", "A consequence is recorded addressed with the evidence that it was. "
    + "Partial redress does not end an escalation."),
});
