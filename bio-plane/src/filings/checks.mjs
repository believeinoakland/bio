/* filings' refusal rows (requirements: `build/requirements/filings.md`, R1, R6–R8, R11, R13, R14, R21, R23, R26). DEC-49: every
 * refusal this module answers carries its code, its catalogue row and the member's translation. The family is C-115
 * (K248). A refusal another module answers passes through as it came: `actions.actionCorrespond`'s (R7), standards'
 * `NO_SUCH_STANDARD` (R14) and conformance's `NO_SUCH_DETERMINATION` (R21), each its owner's row. `NO_SUCH_ACTION` (R1,
 * R8, R13, R14) is actions' `noSuchAction` (its R43; N217, K275), so C-115.2 is retired, its id never reused. R1's and
 * R14's `NO_AUTHOR` is the catalogue's generic code, minted elsewhere for other conditions, so each act here has its own
 * (`FILING_NO_PREPARER`, `THEORY_NO_PROPOSER`), as standards did for its R1 (K251); R14's `NO_STANDARDS` is
 * conformance's, so a theory naming none is `THEORY_NO_STANDARDS`. */

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
  KIND_NO_TEMPLATE: {
    check: "C-115.6", where: at("filingPrepare", "is-filing-prepare"),
    translation: "The jurisdiction profile holds no template for this kind of action (or its profiles disagree on one), "
      + "so there is nothing to pre-fill.",
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
    check: "C-115.12", where: at("filingApprove", "is-filing-approve"),
    translation: "The text is empty, too long, or not readable as text, so it cannot be recorded as approved.",
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
  NOT_TIER3: {
    check: "C-115.17", where: at("counselPacket", "is-counsel-packet"),
    translation: "A counsel packet is assembled only for an action whose governing tier is 3. A Tier 1 or 2 action is "
      + "prepared as a filing.",
  },
  NO_COUNSEL: {
    check: "C-115.18", where: at("counselPacket", "is-counsel-packet"),
    translation: "Name counsel by a name and an organisation, each on one line and not too long; a contact is optional.",
  },
  NO_DETERMINATION: {
    check: "C-115.19", where: at("counselPacket", "is-counsel-packet"),
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
  /* T18 (K608, K613 (3)): R23's communications and R26's template library. */
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
  MACHINE_CANNOT_SAVE_TEMPLATE: {
    check: "C-115.31", where: at("templateSave", "is-template-save"),
    translation: "Only a named member can add a template to the group's library. A machine may draft words; it never "
      + "makes them the group's boilerplate.",
  },
  TEMPLATE_NAME_REFUSED: {
    check: "C-115.32", where: at("templateSave", "is-template-save"),
    translation: "Name the template in one line of at most 200 characters.",
  },
  TEMPLATE_KIND_REFUSED: {
    check: "C-115.33", where: at("templateSave", "is-template-save"),
    translation: "A template's kind is written as a kind is: lower-case letters, digits and underscores. Leave it out for "
      + "a template of no kind.",
  },
  TEMPLATE_FROM_UNAPPROVED: {
    check: "C-115.34", where: at("templateSave", "is-template-save"),
    translation: "A template is kept from a draft a member has approved. Approve the draft first.",
  },
  TEMPLATE_TEXT_REFUSED: {
    check: "C-115.35", where: at("templateSave", "is-template-save"),
    translation: "The template's words are empty, too long, or not readable as text.",
  },
  TEMPLATE_KIND_TIER3: {
    check: "C-115.36", where: at("templateSave", "is-template-save"),
    translation: "This kind's tier is 3: it requires competent counsel, and no template is kept for it.",
  },
  TEMPLATE_NAME_TAKEN: {
    check: "C-115.37", where: at("templateSave", "is-template-save"),
    translation: "The group's library already holds a template by this name. Choose another name.",
  },
  NO_SUCH_TEMPLATE: {
    check: "C-115.38", where: at("filingPrepare", "is-filing-prepare"),
    translation: "There is no template by that id in the group's library that you can read here. One you may not see "
      + "answers exactly as one that does not exist.",
  },
  TEMPLATE_KIND_MISMATCH: {
    check: "C-115.39", where: at("filingPrepare", "is-filing-prepare"),
    translation: "The template named was kept for another kind of action. Name one kept for this kind, or for none.",
  },
  TEMPLATE_NOT_NAMED: {
    check: "C-115.40", where: at("filingPrepare", "is-filing-prepare"),
    translation: "The jurisdiction profile holds no template for this kind, but the group's library does: name the "
      + "one to fill.",
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(FILINGS_CHECKS, code) ? FILINGS_CHECKS[code] : null;
}
