/* filings' refusal rows (requirements: `build/requirements/filings.md`, R1, R6–R8, R11, R13, R14, R21, R23, R28, R31, R32). DEC-49: every
 * refusal this module answers carries its code, its catalogue row and the member's translation. The family is C-115
 * (K248). A refusal another module answers passes through as it came: `actions.actionCorrespond`'s (R7), standards'
 * `NO_SUCH_STANDARD` (R14) and conformance's `NO_SUCH_DETERMINATION` (R21), each its owner's row. `NO_SUCH_ACTION` (R1,
 * R8, R13, R14) is actions' `noSuchAction` (its R43; N217, K275), so C-115.2 is retired, its id never reused. R1's and
 * R14's `NO_AUTHOR` is the catalogue's generic code, minted elsewhere for other conditions, so each act here has its own
 * (`FILING_NO_PREPARER`, `THEORY_NO_PROPOSER`), as standards did for its R1 (K251); R14's `NO_STANDARDS` is
 * conformance's, so a theory naming none is `THEORY_NO_STANDARDS`. T21 (K921, K922, K924): `KIND_NO_TEMPLATE` (C-115.6)
 * and `NOT_TIER3` (C-115.17) are retired, their numbers never reused; the library's rows C-115.31–.33, .35–.38 moved to
 * `filing-templates` (its R23), whose refusals R28, R31 and R32 pass through as its own (`NO_SUCH_TEMPLATE`,
 * `TEMPLATE_RETIRED`, `TEMPLATE_NOT_OFFERED`, `TEMPLATE_BLANK_UNKNOWN` and `templateDraft`'s). T22 (DEC-88, K1025): R8's
 * `PACKET_NO_REASON` (C-115.44). */

const at = (fn, region) => `src/filings/index.mjs ${fn} > ${region}`;

export const FILINGS_CHECKS = Object.freeze({
  FILING_NO_PREPARER: {
    check: "C-115.1", where: at("filingPrepare", "is-filing-prepare"),
    translation: "Nobody is named as the one preparing this draft. Every draft names who prepared it.",
  },
  ACTION_CLOSED: {
    check: "C-115.3", where: at("#closed", "is-action-closed"),
    translation: "The action is resolved or abandoned, so nothing is prepared for it.",
  },
  FILING_TIER_UNDETERMINED: {
    check: "C-115.4", where: at("filingPrepare", "is-filing-prepare"),
    translation: "The action's risk tier has not been stated, and an unstated tier is never read as the lowest. A member "
      + "states the tier first.",
  },
  TIER3_COUNSEL_PACKET: {
    check: "C-115.5", where: at("filingPrepare", "is-filing-prepare"),
    translation: "This action's governing tier is 3: no filing is prepared for it. The group names counsel, and a counsel "
      + "packet is assembled for counsel's review instead.",
  },
  MACHINE_CANNOT_APPROVE: {
    check: "C-115.7", where: at("filingApprove", "is-filing-approve"),
    translation: "Only a named member can approve a filing. A machine may prepare the words; it never approves them.",
  },
  NO_SUCH_FILING: {
    check: "C-115.8", where: at("#noFiling", "is-no-such-filing"),
    translation: "There is no draft by that id that you can read here. A draft of an action you may not see answers "
      + "exactly as one that does not exist.",
  },
  ALREADY_APPROVED: {
    check: "C-115.9", where: at("#alreadyApproved", "is-already-approved"),
    translation: "This draft has already been approved, and an approval stands as recorded. Prepare a new draft to "
      + "approve another text.",
  },
  FILING_STALE: {
    check: "C-115.10", where: at("filingApprove", "is-filing-approve"),
    translation: "Something the draft was prepared from has changed since, as named. Prepare the draft again so it "
      + "says what the record says now.",
  },
  STILL_UNFILLED: {
    check: "C-115.11", where: at("filingApprove", "is-filing-approve"),
    translation: "The text still holds a blank the record could not fill, marked UNFILLED. A member writes it in "
      + "before the text can be approved.",
  },
  TEXT_UNWRITABLE: {
    check: "C-115.12", where: at("#unwritable", "is-text-unwritable"),
    translation: "The text is empty, too long, or not readable as text, so it cannot be prepared or recorded as approved.",
  },
  MACHINE_CANNOT_FILE: {
    check: "C-115.13", where: at("filingRecordSent", "is-filing-sent"),
    translation: "Only a named member can record that a filing was sent. The instance sends nothing itself.",
  },
  NOT_APPROVED: {
    check: "C-115.14", where: at("filingRecordSent", "is-filing-sent"),
    translation: "A member approves the draft before it is recorded as sent.",
  },
  ALREADY_SENT: {
    check: "C-115.15", where: at("filingRecordSent", "is-filing-sent"),
    translation: "This draft is already recorded as sent, and that record stands.",
  },
  MACHINE_CANNOT_NAME_COUNSEL: {
    check: "C-115.16", where: at("counselPacket", "is-counsel-packet"),
    translation: "Only a named member can name the group's counsel and assemble a packet for them.",
  },
  NO_COUNSEL: {
    check: "C-115.18", where: at("counselPacket", "is-counsel-packet"),
    translation: "Name counsel by a name and an organisation, each on one line and not too long; a contact is optional.",
  },
  NO_DETERMINATION: {
    check: "C-115.19", where: at("counselPacket", "is-counsel-packet-basis"),
    translation: "The action rests on no live determination you can read, so there are no facts to assemble for counsel.",
  },
  NO_SUCH_PACKET: {
    check: "C-115.20", where: at("#noPacket", "is-no-such-packet"),
    translation: "There is no counsel packet by that id and version that you can read here. A packet for an action you "
      + "may not see answers exactly as one that does not exist.",
  },
  MACHINE_CANNOT_EXPORT: {
    check: "C-115.21", where: at("counselPacketExport", "is-packet-export"),
    translation: "Only a named member can hand a counsel packet to counsel.",
  },
  NO_THEORY: {
    check: "C-115.22", where: at("theoryPropose", "is-theory-propose"),
    translation: "State the candidate theory, and any remedy, in words that are not too long.",
  },
  THEORY_NO_STANDARDS: {
    check: "C-115.23", where: at("theoryPropose", "is-theory-propose"),
    translation: "A candidate theory names the standards it rests on.",
  },
  THEORY_STANDARD_UNREADABLE: {
    check: "C-115.24", where: at("theoryPropose", "is-theory-propose"),
    translation: "The standards the theory names cannot be read here, so the proposal is not recorded.",
  },
  THEORY_WHY_REFUSED: {
    check: "C-115.25", where: at("theoryPropose", "is-theory-propose"),
    translation: "Say why the theory is proposed, in at most 1,000 characters.",
  },
  DETERMINATION_UNREADABLE: {
    check: "C-115.26", where: at("availableActions", "is-available-actions"),
    translation: "No determination can be read here, so the actions available against its offices cannot be listed.",
  },
  THEORY_NO_PROPOSER: {
    check: "C-115.27", where: at("theoryPropose", "is-theory-propose"),
    translation: "Nobody is named as the one proposing this theory. Every proposal names who made it.",
  },
  /* T18 (K608, K613 (3)): R23's communications; R26's template library (its rows .31–.33, .35–.38 moved to
     `filing-templates` in T21, K921, K922). */
  COMMUNICATION_NO_PREPARER: {
    check: "C-115.28", where: at("communicationPrepare", "is-communication-prepare"),
    translation: "Nobody is named as the one preparing this communication. Every draft names who prepared it.",
  },
  COMMUNICATION_TEXT_REFUSED: {
    check: "C-115.29", where: at("communicationPrepare", "is-communication-prepare"),
    translation: "The communication's words are empty, too long, or not readable as text.",
  },
  COMMUNICATION_PURPOSE_REFUSED: {
    check: "C-115.30", where: at("communicationPrepare", "is-communication-prepare"),
    translation: "Say what the communication is for, in at most 500 characters.",
  },
  TEMPLATE_FROM_UNAPPROVED: {
    check: "C-115.34", where: at("templateSave", "is-template-save"),
    translation: "A template is drafted from a draft a member has approved. Approve the draft first.",
  },
  TEMPLATE_KIND_MISMATCH: {
    check: "C-115.39", where: at("#kindMismatch", "is-template-kind-mismatch"),
    translation: "The template named is written for another kind of action. Name one written for this kind.",
  },
  TEMPLATE_NOT_NAMED: {
    check: "C-115.40", where: at("filingPrepare", "is-template-not-named"),
    translation: "The jurisdiction profile holds no file template for this kind: name a template, or write the words.",
  },
  /* T21 (K921, K922, K924): R28's and R31's templates. */
  TEMPLATE_USE_BRIEF: {
    check: "C-115.41", where: at("filingPrepare", "is-template-use-brief"),
    translation: "The template named is a briefing to counsel: it serves a counsel packet, never a filing.",
  },
  TEMPLATE_USE_FILE: {
    check: "C-115.42", where: at("counselPacket", "is-template-use-file"),
    translation: "The template named is wording the group files in its own name: a counsel packet's briefing takes a "
      + "brief template.",
  },
  TEMPLATE_AND_TEXT: {
    check: "C-115.43", where: at("filingPrepare", "is-filing-prepare"),
    translation: "Name a template or write the words, not both.",
  },
  /* T22 (DEC-88, K1025): R8's reason, a new row, taken by 1.53.0. */
  PACKET_NO_REASON: {
    check: "C-115.44", where: at("counselPacket", "is-counsel-packet"),
    translation: "Assembling a counsel packet records why, in your own words, and no reason was given, or it is longer "
      + "than 2,000 characters. Write one. Nothing was written.",
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(FILINGS_CHECKS, code) ? FILINGS_CHECKS[code] : null;
}
