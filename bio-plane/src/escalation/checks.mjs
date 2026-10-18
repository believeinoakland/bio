/* escalation's refusal rows (requirements: `build/requirements/escalation.md`). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever the
 * act is reached. The family is C-116 (K248), minted with the module (K174: a new module holds its new family). Each
 * code is minted at one site (K231), named by its row's `where`. Refusals minted by the modules escalation uses
 * (conformance's, actions', filings', consequences', promotion's) are relayed with their own rows where it relays them;
 * `NO_SUCH_ACTION` is actions' own (its R43 `noSuchAction`, C-117.2; N217), so C-116.11 is retired and not reused;
 * `NO_SUCH_DETERMINATION` and `DETERMINATION_SUPERSEDED` are conformance's own (its R19 `noSuchDetermination`, R20
 * `determinationSuperseded`; N309, N312, K380), so C-116.3 and C-116.4 are retired and not reused. C-116.6 and C-116.30
 * carry their module's names, `ESCALATION_NOT_A_PARTICIPANT` and `EDGE_NOT_PROPOSED` (K380). C-116.24 is
 * `ESCALATION_NO_REASON` (R24; N433, K766), its row and translation unchanged, so the module never answers
 * `progressions`' `NO_REASON` (C-100.18) and no code is held with two rows (DEC-49). R1's and R27's shared conditions
 * (no breach, not joined, already open) are minted once, in `#pursuable`, which both acts ask (DEC-89). A machine's
 * decline to escalate (R27) has its own code and row, C-116.46, since `MACHINE_CANNOT_DECLINE` is C-116.26's, R13's
 * edge decline (K1084). Each translation calls the group's Civicsmith by that name or needs none (DEC-149, T34-87). */

/* R33 (T46; N910, DEC-194): the words of `words.json` (`docs/development/ux-substrate/screens/words.json`) this module
   answers, each `en` verbatim, read by key, as membership's `HANDLE_WORDS` and extraction's `TRANSCRIBE_WORDS` are: the
   two rows R31 mints. R36 (T47; N962, N992; DEC-198, DEC-199): and two rows' translations, C-116.41's, whose sentence
   names every act an escalation changes through, stop pursuing and reopen among them, and C-116.14's, which names no
   escalation, so R34's one answer to a viewer who may not see it holds in its translation as in its fields. A row's
   `translation` is the word itself, never a copy. `refusal.NOT_OPEN` is not taken (R35). */
import { word, localize } from '../setup-words/index.mjs';

export const ESCALATION_WORDS = Object.freeze({
  'refusal.MACHINE_CANNOT_STOP': word('refusal.MACHINE_CANNOT_STOP'),
  'refusal.NOT_STOPPED': word('refusal.NOT_STOPPED'),
  'refusal.ESCALATION_BY_ACT_ONLY': word('refusal.ESCALATION_BY_ACT_ONLY'),
  'refusal.ALREADY_ATTACHED': word('refusal.ALREADY_ATTACHED'),
});

const at = (fn, region) => `src/escalation/index.mjs ${fn} > ${region}`;

export const ESCALATION_CHECKS = Object.freeze({
  MACHINE_CANNOT_OPEN: {
    check: 'C-116.1', where: at("escalationOpen", "is-open-member"),
    translation: word('refusal.MACHINE_CANNOT_OPEN'),
  },
  ESCALATION_CARRIES_NO_JUDGMENT: {
    check: 'C-116.2', where: at("refuseJudgment", "is-no-judgment"),
    translation: word('refusal.ESCALATION_CARRIES_NO_JUDGMENT'),
  },
  NOT_NONCOMPLIANT: {
    check: 'C-116.5', where: at("#pursuable", "is-determination-noncompliant"),
    translation: word('refusal.NOT_NONCOMPLIANT'),
  },
  ESCALATION_NOT_A_PARTICIPANT: {
    check: 'C-116.6', where: at("#pursuable", "is-open-joined"),
    translation: word('refusal.ESCALATION_NOT_A_PARTICIPANT'),
  },
  ALREADY_OPEN: {
    check: 'C-116.7', where: at("#pursuable", "is-one-escalation"),
    translation: word('refusal.ALREADY_OPEN'),
  },
  NO_SUCH_ESCALATION: {
    check: 'C-116.8', where: at("refuseNoSuchEscalation", "is-escalation-seen"),
    translation: word('refusal.NO_SUCH_ESCALATION'),
  },
  MACHINE_CANNOT_ATTACH: {
    check: 'C-116.9', where: at("escalationAttach", "is-attach-member"),
    translation: word('refusal.MACHINE_CANNOT_ATTACH'),
  },
  ESCALATION_ENDED: {
    check: 'C-116.10', where: at("refuseEnded", "is-escalation-ended"),
    translation: word('refusal.ESCALATION_ENDED'),
  },
  NOT_A_BREACH_ACTION: {
    check: 'C-116.12', where: at("escalationAttach", "is-breach-action"),
    translation: word('refusal.NOT_A_BREACH_ACTION'),
  },
  ACTION_PREMISE_OVERRIDDEN: {
    check: 'C-116.45', where: at("escalationAttach", "is-premise-established"),
    translation: word('refusal.ACTION_PREMISE_OVERRIDDEN'),
  },
  STAGE_TAKES_NO_ACTION: {
    check: 'C-116.13', where: at("escalationAttach", "is-attaching-stage"),
    translation: word('refusal.STAGE_TAKES_NO_ACTION'),
  },
  ALREADY_ATTACHED: {
    check: 'C-116.14', where: at("escalationAttach", "is-attached-once"),
    translation: ESCALATION_WORDS['refusal.ALREADY_ATTACHED'],
  },
  NOT_ACCOUNTABILITY: {
    check: 'C-116.15', where: at("escalationAttach", "is-accountability-purpose"),
    translation: word('refusal.NOT_ACCOUNTABILITY'),
  },
  NOT_THE_BREACH: {
    check: 'C-116.16', where: at("escalationAttach", "is-pursued-standard"),
    translation: word('refusal.NOT_THE_BREACH'),
  },
  COUNTERPARTY_NOT_ELECTED: {
    check: 'C-116.17', where: at("escalationAttach", "is-elected-office"),
    translation: word('refusal.COUNTERPARTY_NOT_ELECTED'),
  },
  COUNTERPARTY_NOT_OVERSIGHT: {
    check: 'C-116.18', where: at("escalationAttach", "is-oversight-office"),
    translation: word('refusal.COUNTERPARTY_NOT_OVERSIGHT'),
  },
  MACHINE_CANNOT_EVALUATE: {
    check: 'C-116.19', where: at("escalationEvaluate", "is-evaluate-member"),
    translation: localize('escalation.checks.reading_what_the_government_answered', 'Reading what the government answered is a member\'s judgment. An assistant may summarise the response; it may not evaluate it. Nothing was written.'),
  },
  NOT_IN_EVALUATION: {
    check: 'C-116.20', where: at("escalationEvaluate", "is-evaluation-stage"),
    translation: word('refusal.NOT_IN_EVALUATION'),
  },
  READING_UNKNOWN: {
    check: 'C-116.21', where: at("escalationEvaluate", "is-reading-known"),
    translation: word('refusal.READING_UNKNOWN'),
  },
  NO_SUCH_RESPONSE: {
    check: 'C-116.22', where: at("refuseNoSuchResponse", "is-named-response"),
    translation: word('refusal.NO_SUCH_RESPONSE'),
  },
  RESPONSE_FOR_NONE: {
    check: 'C-116.23', where: at("escalationEvaluate", "is-none-unnamed"),
    translation: word('refusal.RESPONSE_FOR_NONE'),
  },
  ESCALATION_NO_REASON: {
    check: 'C-116.24', where: at("refuseReason", "is-reason-given"),
    translation: word('refusal.ESCALATION_NO_REASON'),
  },
  MACHINE_CANNOT_ADVANCE: {
    check: 'C-116.25', where: at("#edgeArgs", "is-edge-member"),
    translation: word('refusal.MACHINE_CANNOT_ADVANCE'),
  },
  MACHINE_CANNOT_DECLINE: {
    check: 'C-116.26', where: at("#edgeArgs", "is-edge-member"),
    translation: word('refusal.MACHINE_CANNOT_DECLINE'),
  },
  NOT_OPEN: {
    /* R35 (T46; DEC-194, N913, K2953): the translation is kept. `words.json`'s `refusal.NOT_OPEN` says a suspended one
       is resumed first, while R31 lets a suspended escalation be stopped directly, so that sentence is not adopted
       until it and R31 agree (returned to BOB). Minted at one site, `refuseNotOpen`, for R13's edges and R31's stop. */
    check: 'C-116.27', where: at("refuseNotOpen", "is-escalation-open"),
    translation: localize('escalation.checks.the_escalations_stage_moves_only', 'The escalation\'s stage moves only while it is open. A suspended one is resumed first; an ended one never moves again. Nothing was written.'),
  },
  ILLEGAL_STAGE: {
    check: 'C-116.28', where: at("#edgeArgs", "is-edge-legal"),
    translation: word('refusal.ILLEGAL_STAGE'),
  },
  TRIGGER_NOT_MET: {
    check: 'C-116.29', where: at("escalationAdvance", "is-trigger-met"),
    translation: word('refusal.TRIGGER_NOT_MET'),
  },
  EDGE_NOT_PROPOSED: {
    check: 'C-116.30', where: at("escalationDecline", "is-edge-proposed"),
    translation: word('refusal.EDGE_NOT_PROPOSED'),
  },
  MACHINE_CANNOT_END: {
    check: 'C-116.31', where: at("escalationEnd", "is-end-member"),
    translation: word('refusal.MACHINE_CANNOT_END'),
  },
  ALREADY_ENDED: {
    check: 'C-116.32', where: at("escalationEnd", "is-end-once"),
    translation: word('refusal.ALREADY_ENDED'),
  },
  COMPLIANCE_NOT_RESTORED: {
    check: 'C-116.33', where: at("escalationEnd", "is-compliance-restored"),
    translation: word('refusal.COMPLIANCE_NOT_RESTORED'),
  },
  CONSEQUENCES_NOT_ADDRESSED: {
    check: 'C-116.34', where: at("escalationEnd", "is-consequences-addressed"),
    translation: word('refusal.CONSEQUENCES_NOT_ADDRESSED'),
  },
  CONSEQUENCES_UNDETERMINED: {
    check: 'C-116.35', where: at("escalationEnd", "is-consequences-determined"),
    translation: word('refusal.CONSEQUENCES_UNDETERMINED'),
  },
  MACHINE_CANNOT_SUSPEND: {
    check: 'C-116.36', where: at("escalationSuspend", "is-suspend-member"),
    translation: word('refusal.MACHINE_CANNOT_SUSPEND'),
  },
  ALREADY_SUSPENDED: {
    check: 'C-116.37', where: at("escalationSuspend", "is-suspend-once"),
    translation: word('refusal.ALREADY_SUSPENDED'),
  },
  MACHINE_CANNOT_RESUME: {
    check: 'C-116.38', where: at("escalationResume", "is-resume-member"),
    translation: word('refusal.MACHINE_CANNOT_RESUME'),
  },
  NOT_SUSPENDED: {
    check: 'C-116.39', where: at("escalationResume", "is-resume-suspended"),
    translation: word('refusal.NOT_SUSPENDED'),
  },
  MACHINE_CANNOT_WRITE_ESCALATION: {
    check: 'C-116.40', where: at("check", "is-escalation-member"),
    translation: word('refusal.MACHINE_CANNOT_WRITE_ESCALATION'),
  },
  ESCALATION_BY_ACT_ONLY: {
    check: 'C-116.41', where: at("check", "is-escalation-act"),
    translation: ESCALATION_WORDS['refusal.ESCALATION_BY_ACT_ONLY'],
  },
  ESCALATION_HISTORY_REWRITTEN: {
    check: 'C-116.42', where: at("check", "is-escalation-append-only"),
    translation: word('refusal.ESCALATION_HISTORY_REWRITTEN'),
  },
  UNSPLICEABLE_ESCALATION: {
    check: 'C-116.43', where: at("#append", "is-escalation-spliceable"),
    translation: word('refusal.UNSPLICEABLE_ESCALATION'),
  },
  MACHINE_CANNOT_DECLINE_TO_ESCALATE: {
    check: 'C-116.46', where: at("declineToEscalate", "is-decline-member"),
    translation: word('refusal.MACHINE_CANNOT_DECLINE_TO_ESCALATE'),
  },
  MACHINE_CANNOT_STOP: {
    check: 'C-116.47', where: at("#stopArgs", "is-stop-member"),
    translation: ESCALATION_WORDS['refusal.MACHINE_CANNOT_STOP'],
  },
  NOT_STOPPED: {
    check: 'C-116.48', where: at("escalationReopen", "is-reopen-stopped"),
    translation: ESCALATION_WORDS['refusal.NOT_STOPPED'],
  },
  PROVIDER_UNAVAILABLE: {
    check: 'C-116.44', where: at("refuseProviderUnavailable", "is-provider-present"),
    translation: word('refusal.PROVIDER_UNAVAILABLE'),
  },
});

/** One constructor for every refusal: `reason`, the site's own `detail` and keys, then `code`, `check` and
 *  `translation` from the row. */
export function refusal(code, detail, extra) {
  const row = ESCALATION_CHECKS[code];
  return { ok: false, reason: code, detail, ...(extra || {}), code, check: row.check, translation: row.translation };
}
