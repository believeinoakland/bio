/* filings' refusal rows (requirements: `build/requirements/filings.md`, R1, R6–R8, R11, R13, R14, R21, R23, R28, R31, R32,
 * R34–R44, R54, R55). DEC-49: every
 * refusal this module answers carries its code, its catalogue row and the member's translation. The family is C-115
 * (K248). A refusal another module answers passes through as it came: `actions.actionCorrespond`'s (R7), standards'
 * `NO_SUCH_STANDARD` (R14) and conformance's `NO_SUCH_DETERMINATION` (R21), each its owner's row. `NO_SUCH_ACTION` (R1,
 * R8, R13, R14) is actions' `noSuchAction` (its R43; N217, K275), so C-115.2 is retired, its id never reused. R1's and
 * R14's `NO_AUTHOR` is the catalogue's generic code, minted elsewhere for other conditions, so each act here has its own
 * (`FILING_NO_PREPARER`, `THEORY_NO_PROPOSER`), as standards did for its R1 (K251); R14's `NO_STANDARDS` is
 * conformance's, so a theory naming none is `THEORY_NO_STANDARDS`. T21 (K921, K922, K924): `KIND_NO_TEMPLATE` (C-115.6)
 * and `NOT_TIER3` (C-115.17) are retired, their numbers never reused; the library's rows C-115.31–.33, .35–.38 moved to
 * `filing-templates` (its R23), whose refusals R28, R31 and R32 pass through as its own (`NO_SUCH_TEMPLATE`,
 * `TEMPLATE_RETIRED`, `TEMPLATE_NOT_OFFERED`, its unknown-blank refusal (`blankUnknownRefusal`, its R32; R56) and `templateDraft`'s). T22 (DEC-88, K1025): R8's
 * `PACKET_NO_REASON` (C-115.44). T45 (K2780, K2791): `NO_DETERMINATION` (C-115.19) is retired, its number never reused (R8: a
 * packet needs no determination); R34–R44's rows are C-115.45–.54 in the requirement's order, with R23's `NO_SUCH_BUNDLE`
 * (a chosen finding absent or unseen) and the marks a member states at preparation (`FILING_MARK_REFUSED`) after them.
 * `action-holds`' `HOLD_NOT_IN_PLACE` and `HOLD_PLACE_REFUSED` (R47) and `actions`' revision refusals (R43's
 * `breach_claim`) pass through as their owners'. T46 (R51; DEC-194, N913): eight of the T45 rows translate by
 * `words.json`'s `refusal.<CODE>`, read by key; codes, numbers and `where`s unmoved. T47 (DEC-209,
 * K3100): R54's `SENT_REFERENCE_MALFORMED` (C-115.57) and R55's `FILL_UNKNOWN_BLANK` (C-115.58), new rows. */

import { word } from "../setup-words/index.mjs";

const at = (fn, region) => `src/filings/index.mjs ${fn} > ${region}`;

/* T50 (N1116, N1132; DEC-259, DEC-260): every row's translation is the English `words.json` holds for `refusal.<CODE>`, read by
   key through setup-words' `word` (layer 1), never a copy: the rows C-115.45, .46, .48, .49, .51–.53 that T46 (R51) took by
   key, and now every other row of this module. Codes, numbers and `where`s unmoved. The design's words govern where the
   module's own differed (`refusal.SECOND_APPROVAL_NEEDED`, now read by key too). `HOLD_NOT_IN_PLACE` and
   `HOLD_PLACE_REFUSED` are `action-holds`' rows, relayed here unchanged (R47; K231); C-115.47 `RFC_QUOTING_MISSING` is
   `filing-templates`' (R57). */
export const FILINGS_CHECKS = Object.freeze({
  FILING_NO_PREPARER: {
    check: "C-115.1", where: at("filingPrepare", "is-filing-prepare"),
    translation: word("refusal.FILING_NO_PREPARER"),
  },
  ACTION_CLOSED: {
    check: "C-115.3", where: at("#closed", "is-action-closed"),
    translation: word("refusal.ACTION_CLOSED"),
  },
  FILING_TIER_UNDETERMINED: {
    check: "C-115.4", where: at("filingPrepare", "is-filing-prepare"),
    translation: word("refusal.FILING_TIER_UNDETERMINED"),
  },
  TIER3_COUNSEL_PACKET: {
    check: "C-115.5", where: at("filingPrepare", "is-filing-prepare"),
    translation: word("refusal.TIER3_COUNSEL_PACKET"),
  },
  MACHINE_CANNOT_APPROVE: {
    check: "C-115.7", where: at("filingApprove", "is-filing-approve"),
    translation: word("refusal.MACHINE_CANNOT_APPROVE"),
  },
  NO_SUCH_FILING: {
    check: "C-115.8", where: at("#noFiling", "is-no-such-filing"),
    translation: word("refusal.NO_SUCH_FILING"),
  },
  ALREADY_APPROVED: {
    check: "C-115.9", where: at("#alreadyApproved", "is-already-approved"),
    translation: word("refusal.ALREADY_APPROVED"),
  },
  FILING_STALE: {
    check: "C-115.10", where: at("filingApprove", "is-filing-approve"),
    translation: word("refusal.FILING_STALE"),
  },
  STILL_UNFILLED: {
    check: "C-115.11", where: at("filingApprove", "is-filing-approve"),
    translation: word("refusal.STILL_UNFILLED"),
  },
  TEXT_UNWRITABLE: {
    check: "C-115.12", where: at("#unwritable", "is-text-unwritable"),
    translation: word("refusal.TEXT_UNWRITABLE"),
  },
  MACHINE_CANNOT_FILE: {
    check: "C-115.13", where: at("filingRecordSent", "is-filing-sent"),
    translation: word("refusal.MACHINE_CANNOT_FILE"),
  },
  NOT_APPROVED: {
    check: "C-115.14", where: at("filingRecordSent", "is-filing-sent"),
    translation: word("refusal.NOT_APPROVED"),
  },
  ALREADY_SENT: {
    check: "C-115.15", where: at("filingRecordSent", "is-filing-sent"),
    translation: word("refusal.ALREADY_SENT"),
  },
  MACHINE_CANNOT_NAME_COUNSEL: {
    check: "C-115.16", where: at("counselPacket", "is-counsel-packet"),
    translation: word("refusal.MACHINE_CANNOT_NAME_COUNSEL"),
  },
  NO_COUNSEL: {
    check: "C-115.18", where: at("counselPacket", "is-counsel-packet"),
    translation: word("refusal.NO_COUNSEL"),
  },
  NO_SUCH_PACKET: {
    check: "C-115.20", where: at("#noPacket", "is-no-such-packet"),
    translation: word("refusal.NO_SUCH_PACKET"),
  },
  MACHINE_CANNOT_EXPORT: {
    check: "C-115.21", where: at("counselPacketExport", "is-packet-export"),
    translation: word("refusal.MACHINE_CANNOT_EXPORT"),
  },
  NO_THEORY: {
    check: "C-115.22", where: at("theoryPropose", "is-theory-propose"),
    translation: word("refusal.NO_THEORY"),
  },
  THEORY_NO_STANDARDS: {
    check: "C-115.23", where: at("theoryPropose", "is-theory-propose"),
    translation: word("refusal.THEORY_NO_STANDARDS"),
  },
  THEORY_STANDARD_UNREADABLE: {
    check: "C-115.24", where: at("theoryPropose", "is-theory-propose"),
    translation: word("refusal.THEORY_STANDARD_UNREADABLE"),
  },
  THEORY_WHY_REFUSED: {
    check: "C-115.25", where: at("theoryPropose", "is-theory-propose"),
    translation: word("refusal.THEORY_WHY_REFUSED"),
  },
  DETERMINATION_UNREADABLE: {
    check: "C-115.26", where: at("availableActions", "is-available-actions"),
    translation: word("refusal.DETERMINATION_UNREADABLE"),
  },
  THEORY_NO_PROPOSER: {
    check: "C-115.27", where: at("theoryPropose", "is-theory-propose"),
    translation: word("refusal.THEORY_NO_PROPOSER"),
  },
  /* T18 (K608, K613 (3)): R23's communications; R26's template library (its rows .31–.33, .35–.38 moved to
     `filing-templates` in T21, K921, K922). */
  COMMUNICATION_NO_PREPARER: {
    check: "C-115.28", where: at("communicationPrepare", "is-communication-prepare"),
    translation: word("refusal.COMMUNICATION_NO_PREPARER"),
  },
  COMMUNICATION_TEXT_REFUSED: {
    check: "C-115.29", where: at("communicationPrepare", "is-communication-prepare"),
    translation: word("refusal.COMMUNICATION_TEXT_REFUSED"),
  },
  COMMUNICATION_PURPOSE_REFUSED: {
    check: "C-115.30", where: at("communicationPrepare", "is-communication-prepare"),
    translation: word("refusal.COMMUNICATION_PURPOSE_REFUSED"),
  },
  TEMPLATE_FROM_UNAPPROVED: {
    check: "C-115.34", where: at("templateSave", "is-template-save"),
    translation: word("refusal.TEMPLATE_FROM_UNAPPROVED"),
  },
  TEMPLATE_KIND_MISMATCH: {
    check: "C-115.39", where: at("#kindMismatch", "is-template-kind-mismatch"),
    translation: word("refusal.TEMPLATE_KIND_MISMATCH"),
  },
  TEMPLATE_NOT_NAMED: {
    check: "C-115.40", where: at("filingPrepare", "is-template-not-named"),
    translation: word("refusal.TEMPLATE_NOT_NAMED"),
  },
  /* T21 (K921, K922, K924): R28's and R31's templates. */
  TEMPLATE_USE_BRIEF: {
    check: "C-115.41", where: at("filingPrepare", "is-template-use-brief"),
    translation: word("refusal.TEMPLATE_USE_BRIEF"),
  },
  TEMPLATE_USE_FILE: {
    check: "C-115.42", where: at("counselPacket", "is-template-use-file"),
    translation: word("refusal.TEMPLATE_USE_FILE"),
  },
  TEMPLATE_AND_TEXT: {
    check: "C-115.43", where: at("filingPrepare", "is-filing-prepare"),
    translation: word("refusal.TEMPLATE_AND_TEXT"),
  },
  /* T22 (DEC-88, K1025): R8's reason, a new row, taken by 1.53.0. */
  PACKET_NO_REASON: {
    check: "C-115.44", where: at("counselPacket", "is-counsel-packet"),
    translation: word("refusal.PACKET_NO_REASON"),
  },
  /* T45 (K2780, K2791): the record check, the chance to fix, quoting, joint texts, second approval, the assertion gate,
     "as myself" (R34, R36, R38, R40, R42–R44); R23's chosen findings; the marks stated at preparation. T46 (R51): eight
     translate by `FILINGS_WORDS`, read by key; `SECOND_APPROVAL_NEEDED` keeps its own until its sentence and R42 agree. */
  CONTRADICTED_HELD: {
    check: "C-115.45", where: at("#outwardRefusal", "is-contradicted-held"),
    translation: word("refusal.CONTRADICTED_HELD"),
  },
  SELF_BENEFIT_ASK: {
    check: "C-115.46", where: at("#outwardRefusal", "is-self-benefit-ask"),
    translation: word("refusal.SELF_BENEFIT_ASK"),
  },
  /* C-115.47 `RFC_QUOTING_MISSING` is `filing-templates`' row since T48 (R57; its R33): refused at R6 through its
     `rfcQuotingRefusal`, answered as it gives it. */
  NOT_A_PARTNER: {
    check: "C-115.48", where: at("jointSignatory", "is-joint-signatory"),
    translation: word("refusal.NOT_A_PARTNER"),
  },
  JOINT_FINGERPRINT_MISMATCH: {
    check: "C-115.49", where: at("jointSignatory", "is-joint-signatory"),
    translation: word("refusal.JOINT_FINGERPRINT_MISMATCH"),
  },
  SECOND_APPROVAL_NEEDED: {
    check: "C-115.50", where: at("filingRecordSent", "is-filing-sent"),
    translation: word("refusal.SECOND_APPROVAL_NEEDED"),
  },
  SAME_APPROVER: {
    check: "C-115.51", where: at("filingSecondApprove", "is-second-approve"),
    translation: word("refusal.SAME_APPROVER"),
  },
  ASSERTION_UNRESOLVED: {
    check: "C-115.52", where: at("#outwardRefusal", "is-assertion-unresolved"),
    translation: word("refusal.ASSERTION_UNRESOLVED"),
  },
  ASSERTION_RESOLUTION_REFUSED: {
    check: "C-115.53", where: at("#outwardRefusal", "is-assertion-resolution-refused"),
    translation: word("refusal.ASSERTION_RESOLUTION_REFUSED"),
  },
  NOT_THE_GROUPS_ACT: {
    check: "C-115.54", where: at("#notTheGroups", "is-not-the-groups-act"),
    translation: word("refusal.NOT_THE_GROUPS_ACT"),
  },
  NO_SUCH_BUNDLE: {
    check: "C-115.55", where: at("communicationPrepare", "is-communication-from"),
    translation: word("refusal.NO_SUCH_BUNDLE"),
  },
  FILING_MARK_REFUSED: {
    check: "C-115.56", where: at("#marks", "is-filing-mark-refused"),
    translation: word("refusal.FILING_MARK_REFUSED"),
  },
  /* T47 (DEC-209 (3), (4); K3100): R54's venue reference at sending and R55's member's own fills, the family's next
     numbers in the requirements' order. */
  SENT_REFERENCE_MALFORMED: {
    check: "C-115.57", where: at("filingRecordSent", "is-sent-reference-malformed"),
    translation: word("refusal.SENT_REFERENCE_MALFORMED"),
  },
  FILL_UNKNOWN_BLANK: {
    check: "C-115.58", where: at("#fills", "is-fill-unknown-blank"),
    translation: word("refusal.FILL_UNKNOWN_BLANK"),
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(FILINGS_CHECKS, code) ? FILINGS_CHECKS[code] : null;
}
