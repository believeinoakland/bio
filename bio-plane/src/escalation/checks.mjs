/* escalation's refusal rows (requirements: `build/requirements/escalation.md`). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever the
 * act is reached. The family is C-116 (K248), minted with the module (K174: a new module holds its new family). Each
 * code is minted at one site (K231), named by its row's `where`. Refusals minted by the modules escalation uses
 * (conformance's, actions', filings', consequences', promotion's) are relayed with their own rows where it relays them. */

const at = (fn, region) => `src/escalation/index.mjs ${fn} > ${region}`;

export const ESCALATION_CHECKS = Object.freeze({
  MACHINE_CANNOT_OPEN: {
    check: 'C-116.1', where: at("escalationOpen", "is-open-member"),
    translation: 'Opening an escalation is a member\'s act. An assistant may point out a breach worth pursuing; it may '
      + 'not open one. Sign in as a member. Nothing was written.',
  },
  ESCALATION_CARRIES_NO_JUDGMENT: {
    check: 'C-116.2', where: at("refuseJudgment", "is-no-judgment"),
    translation: 'An escalation records no significance, severity, priority, urgency, rank or score. Whether a breach '
      + 'warrants action, and how urgently, is the members\' judgment, made with the consequences in front of them. '
      + 'Send the act without it. Nothing was written.',
  },
  NO_SUCH_DETERMINATION: {
    check: 'C-116.3', where: at("escalationOpen", "is-determination-seen"),
    translation: 'No determination answers to that here. One you may not see is answered exactly as one that does not '
      + 'exist. Nothing was written.',
  },
  DETERMINATION_SUPERSEDED: {
    check: 'C-116.4', where: at("escalationOpen", "is-determination-live"),
    translation: 'That determination has been superseded by a later one. An escalation pursues the determination in '
      + 'force: open it on the later one. Nothing was written.',
  },
  NOT_NONCOMPLIANT: {
    check: 'C-116.5', where: at("escalationOpen", "is-determination-noncompliant"),
    translation: 'That determination finds no standard breached, so there is nothing to escalate. Nothing was written.',
  },
  NOT_A_PARTICIPANT: {
    check: 'C-116.6', where: at("escalationOpen", "is-open-joined"),
    translation: 'An escalation is opened by a member who has joined the project that made the determination. Join '
      + 'the project first. Nothing was written.',
  },
  ALREADY_OPEN: {
    check: 'C-116.7', where: at("escalationOpen", "is-one-escalation"),
    translation: 'This determination already has an escalation that has not ended; there is one at a time. Work in '
      + 'that one. Nothing was written.',
  },
  NO_SUCH_ESCALATION: {
    check: 'C-116.8', where: at("refuseNoSuchEscalation", "is-escalation-seen"),
    translation: 'No escalation answers to that here. One in a project you may not see is answered exactly as one '
      + 'that does not exist. Nothing was written.',
  },
  MACHINE_CANNOT_ATTACH: {
    check: 'C-116.9', where: at("escalationAttach", "is-attach-member"),
    translation: 'Attaching an action to an escalation is a member\'s act. An assistant may prepare the action; it may '
      + 'not attach it. Nothing was written.',
  },
  ESCALATION_ENDED: {
    check: 'C-116.10', where: at("refuseEnded", "is-escalation-ended"),
    translation: 'This escalation has ended: compliance was restored and the consequences addressed. An ended '
      + 'escalation is never reopened; a new breach is a new determination. Nothing was written.',
  },
  NO_SUCH_ACTION: {
    check: 'C-116.11', where: at("escalationAttach", "is-action-seen"),
    translation: 'No action answers to that here. One you may not see is answered exactly as one that does not exist. '
      + 'Nothing was written.',
  },
  NOT_A_BREACH_ACTION: {
    check: 'C-116.12', where: at("escalationAttach", "is-breach-action"),
    translation: 'An escalation\'s acts are actions recorded for the breach: the action states that it is one and rests '
      + 'on the escalation\'s determination. Record it so, then attach it. Nothing was written.',
  },
  STAGE_TAKES_NO_ACTION: {
    check: 'C-116.13', where: at("escalationAttach", "is-attaching-stage"),
    translation: 'Actions are attached at notification, legal tools and political accountability. The escalation\'s '
      + 'stage now takes none. Nothing was written.',
  },
  ALREADY_ATTACHED: {
    check: 'C-116.14', where: at("escalationAttach", "is-attached-once"),
    translation: 'That action is already attached to an escalation. An action belongs to one escalation, at one stage. '
      + 'Nothing was written.',
  },
  NOT_ACCOUNTABILITY: {
    check: 'C-116.15', where: at("escalationAttach", "is-accountability-purpose"),
    translation: 'An act of political accountability states its purpose: asking an elected office to act on the breach, '
      + 'an oversight request, an audit request, testimony, or legislation that restores or enforces an existing '
      + 'requirement. Policy advocacy and candidate support are not among them. Nothing was written.',
  },
  NOT_THE_BREACH: {
    check: 'C-116.16', where: at("escalationAttach", "is-pursued-standard"),
    translation: 'An act of political accountability names the requirement it seeks enforced, from the standards this '
      + 'escalation pursues, and no other. Nothing was written.',
  },
  COUNTERPARTY_NOT_ELECTED: {
    check: 'C-116.17', where: at("escalationAttach", "is-elected-office"),
    translation: 'An official request asks an elected office to act. The jurisdiction profile marks the office this '
      + 'action is addressed to as not elected. Address it to an elected office. Nothing was written.',
  },
  COUNTERPARTY_NOT_OVERSIGHT: {
    check: 'C-116.18', where: at("escalationAttach", "is-oversight-office"),
    translation: 'An oversight or audit request goes to an oversight or audit body. The jurisdiction profile marks the '
      + 'office this action is addressed to as not one. Nothing was written.',
  },
  MACHINE_CANNOT_EVALUATE: {
    check: 'C-116.19', where: at("escalationEvaluate", "is-evaluate-member"),
    translation: 'Reading what the government answered is a member\'s judgment. An assistant may summarise the response; '
      + 'it may not evaluate it. Nothing was written.',
  },
  NOT_IN_EVALUATION: {
    check: 'C-116.20', where: at("escalationEvaluate", "is-evaluation-stage"),
    translation: 'A response is evaluated at the response-evaluation stage, and this escalation is at another. '
      + 'Nothing was written.',
  },
  READING_UNKNOWN: {
    check: 'C-116.21', where: at("escalationEvaluate", "is-reading-known"),
    translation: 'A reading of a response is one of: complied, partial, denied, or none (nothing came back in time). '
      + 'Nothing was written.',
  },
  NO_SUCH_RESPONSE: {
    check: 'C-116.22', where: at("refuseNoSuchResponse", "is-named-response"),
    translation: 'The evaluation names the reply it reads: a received entry of an action attached to this escalation. '
      + 'Nothing was written.',
  },
  RESPONSE_FOR_NONE: {
    check: 'C-116.23', where: at("escalationEvaluate", "is-none-unnamed"),
    translation: 'A reading of none says nothing came back in time, so it names no reply. Nothing was written.',
  },
  NO_REASON: {
    check: 'C-116.24', where: at("refuseReason", "is-reason-given"),
    translation: 'This act needs a reason, in your own words, of up to 2,000 characters. Nothing was written.',
  },
  MACHINE_CANNOT_ADVANCE: {
    check: 'C-116.25', where: at("#edgeArgs", "is-edge-member"),
    translation: 'Moving an escalation to its next stage is a member\'s act. The protocol proposes a stage when its '
      + 'trigger is met; a member advances it. Nothing was written.',
  },
  MACHINE_CANNOT_DECLINE: {
    check: 'C-116.26', where: at("#edgeArgs", "is-edge-member"),
    translation: 'Choosing not to move an escalation now is a member\'s act, with the member\'s reason. Nothing was '
      + 'written.',
  },
  NOT_OPEN: {
    check: 'C-116.27', where: at("#edgeArgs", "is-edge-open"),
    translation: 'The escalation\'s stage moves only while it is open. A suspended one is resumed first; an ended one '
      + 'never moves again. Nothing was written.',
  },
  ILLEGAL_STAGE: {
    check: 'C-116.28', where: at("#edgeArgs", "is-edge-legal"),
    translation: 'The escalation cannot move from its stage to that one. The stages it can move to are listed. '
      + 'Nothing was written.',
  },
  TRIGGER_NOT_MET: {
    check: 'C-116.29', where: at("escalationAdvance", "is-trigger-met"),
    translation: 'That stage\'s trigger is not met in the record yet; what is missing is named. When it is met the '
      + 'stage is proposed, and a member advances it. Nothing was written.',
  },
  NOT_PROPOSED: {
    check: 'C-116.30', where: at("escalationDecline", "is-edge-proposed"),
    translation: 'That stage is not proposed, so there is nothing to decline. Nothing was written.',
  },
  MACHINE_CANNOT_END: {
    check: 'C-116.31', where: at("escalationEnd", "is-end-member"),
    translation: 'Ending an escalation is a member\'s act, and only once compliance is restored and the consequences '
      + 'are addressed. Nothing was written.',
  },
  ALREADY_ENDED: {
    check: 'C-116.32', where: at("escalationEnd", "is-end-once"),
    translation: 'This escalation has already ended. Nothing was written.',
  },
  COMPLIANCE_NOT_RESTORED: {
    check: 'C-116.33', where: at("escalationEnd", "is-compliance-restored"),
    translation: 'An escalation ends only when compliance is restored: for every standard it pursues, a later '
      + 'determination of the same act finds the government compliant. The standards still lacking one are named. '
      + 'Nothing was written.',
  },
  CONSEQUENCES_NOT_ADDRESSED: {
    check: 'C-116.34', where: at("escalationEnd", "is-consequences-addressed"),
    translation: 'An escalation ends only when the consequences of the breach are addressed, and a recorded '
      + 'consequence is not. Nothing was written.',
  },
  CONSEQUENCES_UNDETERMINED: {
    check: 'C-116.35', where: at("escalationEnd", "is-consequences-determined"),
    translation: 'Whether the consequences of the breach are addressed is undetermined: none is recorded, or one is '
      + 'undetermined or unproven. If the group judges the breach had no consequence, record that as an assessed '
      + 'consequence and address it. Nothing was written.',
  },
  MACHINE_CANNOT_SUSPEND: {
    check: 'C-116.36', where: at("escalationSuspend", "is-suspend-member"),
    translation: 'Suspending an escalation is a member\'s act, with a reason. Nothing was written.',
  },
  ALREADY_SUSPENDED: {
    check: 'C-116.37', where: at("escalationSuspend", "is-suspend-once"),
    translation: 'This escalation is already suspended. Nothing was written.',
  },
  MACHINE_CANNOT_RESUME: {
    check: 'C-116.38', where: at("escalationResume", "is-resume-member"),
    translation: 'Resuming an escalation is a member\'s act. Nothing was written.',
  },
  NOT_SUSPENDED: {
    check: 'C-116.39', where: at("escalationResume", "is-resume-suspended"),
    translation: 'This escalation is not suspended, so there is nothing to resume. Nothing was written.',
  },
  MACHINE_CANNOT_WRITE_ESCALATION: {
    check: 'C-116.40', where: at("check", "is-escalation-member"),
    translation: 'An escalation\'s record is written by members\' acts only. An automated credential cannot write it. '
      + 'Nothing was written.',
  },
  ESCALATION_BY_ACT_ONLY: {
    check: 'C-116.41', where: at("check", "is-escalation-act"),
    translation: 'An escalation changes only through its own acts (open, attach, evaluate, advance, decline, suspend, '
      + 'resume, end), so its history and what is read from it never disagree. Nothing was written.',
  },
  ESCALATION_HISTORY_REWRITTEN: {
    check: 'C-116.42', where: at("check", "is-escalation-append-only"),
    translation: 'An escalation\'s history is never edited; each act adds to it. Nothing was written.',
  },
  UNSPLICEABLE_ESCALATION: {
    check: 'C-116.43', where: at("#append", "is-escalation-spliceable"),
    translation: 'The escalation\'s record cannot be extended in place. Nothing was written.',
  },
  PROVIDER_UNAVAILABLE: {
    check: 'C-116.44', where: at("refuseProviderUnavailable", "is-provider-present"),
    translation: 'Part of the record this answer depends on cannot be read on this instance yet, so nothing is '
      + 'answered in its place. Nothing was written.',
  },
});

/** One constructor for every refusal: `reason`, the site's own `detail` and keys, then `code`, `check` and
 *  `translation` from the row. */
export function refusal(code, detail, extra) {
  const row = ESCALATION_CHECKS[code];
  return { ok: false, reason: code, detail, ...(extra || {}), code, check: row.check, translation: row.translation };
}
