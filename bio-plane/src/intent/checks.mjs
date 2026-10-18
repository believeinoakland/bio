/* intent's refusal rows (requirements: `build/requirements/intent.md`, R22). DEC-49: every refusal this module answers
 * carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act is
 * reached.
 *
 * One row moved here from the check catalogue: C-2.9's objective arm (R1, R22), its id unchanged, as C-45 and C-80 were
 * split (map §3.3). C-2.9's `closed_reason` arm followed in T19 as this module's grammar (R29, `./grammar.mjs`); it
 * raises findings, not refusals, and carries no row (its `workproduct_state` and `evaluations` arms and C-9.1 retired,
 * K899 (3)). The rest are this module's own family, C-111 (N180: C-110 is
 * reevaluation's, K199), minted at the extraction (K107 (3)'s rule: the job names a new code's row; K174: a module holds
 * its new family). A code another module mints for another condition is not borrowed here: a goal or aspiration with
 * no statement is `PURSUIT_UNSTATED` (the catalogue's `NO_STATEMENT` is `publishCase`'s), and a condition's grade
 * outside A–D is `CONDITION_BAD_GRADE` (strength's `BAD_GRADE` is its own). For the same reason (N433, K730, R30; one
 * code, one row, DEC-49) C-111.4, C-111.6 and C-111.13 answer `INTENT_NO_SUCH_PROGRESSION`, `INTENT_BAD_STAGE` and
 * `INTENT_NO_REASON`, their numbers and translations unchanged: `NO_SUCH_PROGRESSION`, `BAD_STAGE` and `NO_REASON` are
 * progressions' (C-100.11, C-100.14, C-100.18). The three codes changed in T19 layer 7 and were stamped by 1.50.0.
 * Refusals minted by the modules intent uses (membership's `PROJECT_ACT_NOT_A_PARTICIPANT` and C-70.1, progressions'
 * dispose rows, ai-runs' open rows) are relayed with their own rows and are not restated here. `NO_SUCH_PROJECT` is
 * membership's one row (C-70.5, answered through its `noSuchProject`, R78); intent's C-111.2 is retired (N208, K275)
 * and its number is not reused. `NO_SUCH_ENTITY` is entities' one row (C-91.4, answered through its `noSuchEntity`,
 * R36); intent's C-111.5 is retired (N285) and its number is not reused. `NOT_AN_ADMIN` is membership's one row
 * (C-96.1, answered through its `notAnAdmin`, R84): R9's group aspiration answers it with its remedy, and intent's
 * C-111.16 (`GROUP_ASPIRATION_NOT_ADMIN`) is retired (N327, DEC-83) and its number is not reused. */

import { word } from '../setup-words/index.mjs';

const at = (fn, region) => `src/intent/index.mjs ${fn} > ${region}`;
/* A code several acts answer is minted once, by its own function at the foot of `index.mjs` (DEC-49's one code, one
   site); its row names that function. */

export const INTENT_CHECKS = Object.freeze({
  NO_OBJECTIVE: {
    check: 'C-2.9', where: at("#checkProject", "is-objective-stated"),
    translation: word('refusal.NO_OBJECTIVE'),
  },
  MACHINE_CANNOT_SET_OBJECTIVE: {
    check: 'C-111.1', where: at("setCondition", "is-condition-member"),
    translation: word('refusal.MACHINE_CANNOT_SET_OBJECTIVE'),
  },
  CONDITION_UNREADABLE: {
    check: 'C-111.3', where: at("#conditionRefusal", "is-condition-shaped"),
    translation: word('refusal.CONDITION_UNREADABLE'),
  },
  INTENT_NO_SUCH_PROGRESSION: {
    check: 'C-111.4', where: at("refuseNoSuchProgression", "is-named-progression"),
    translation: word('refusal.INTENT_NO_SUCH_PROGRESSION'),
  },
  INTENT_BAD_STAGE: {
    check: 'C-111.6', where: at("#conditionRefusal", "is-condition-stage"),
    translation: word('refusal.INTENT_BAD_STAGE'),
  },
  CONDITION_BAD_GRADE: {
    check: 'C-111.7', where: at("#conditionRefusal", "is-condition-grade"),
    translation: word('refusal.CONDITION_BAD_GRADE'),
  },
  BAD_SHARE: {
    check: 'C-111.8', where: at("#conditionRefusal", "is-condition-share"),
    translation: word('refusal.BAD_SHARE'),
  },
  MACHINE_CANNOT_DECLARE_GOAL: {
    check: 'C-111.9', where: at("goalMachineRefusal", "is-goal-member"),
    translation: word('refusal.MACHINE_CANNOT_DECLARE_GOAL'),
  },
  PURSUIT_UNSTATED: {
    check: 'C-111.10', where: at("refusePursuitUnstated", "is-pursuit-stated"),
    translation: word('refusal.PURSUIT_UNSTATED'),
  },
  NO_SUCH_GOAL: {
    check: 'C-111.11', where: at("refuseNoSuchGoal", "is-goal-held"),
    translation: word('refusal.NO_SUCH_GOAL'),
  },
  NO_SUCH_ASPIRATION: {
    check: 'C-111.12', where: at("refuseNoSuchAspiration", "is-aspiration-held"),
    translation: word('refusal.NO_SUCH_ASPIRATION'),
  },
  INTENT_NO_REASON: {
    check: 'C-111.13', where: at("refuseNoReason", "is-reason-stated"),
    translation: word('refusal.INTENT_NO_REASON'),
  },
  MACHINE_CANNOT_DECLARE_ASPIRATION: {
    check: 'C-111.14', where: at("aspirationMachineRefusal", "is-aspiration-member"),
    translation: word('refusal.MACHINE_CANNOT_DECLARE_ASPIRATION'),
  },
  NOT_YOURS: {
    check: 'C-111.15', where: at("#aspirationAuthority", "is-aspiration-yours"),
    translation: 'A member\'s own aspiration is declared, revised and retired by that member alone. Nothing was '
      + 'written.',
  },
  NO_LESSON: {
    check: 'C-111.17', where: at("refuseNoLesson", "is-retirement-taught"),
    translation: word('refusal.NO_LESSON'),
  },
  MACHINE_CANNOT_TRIAGE: {
    check: 'C-111.18', where: at("triage", "is-triage-member"),
    translation: word('refusal.MACHINE_CANNOT_TRIAGE'),
  },
  MACHINE_CANNOT_CHOOSE_THE_QUESTION: {
    check: 'C-111.19', where: at("workObjective", "is-objective-member"),
    translation: word('refusal.MACHINE_CANNOT_CHOOSE_THE_QUESTION'),
  },
  PURSUIT_STATE_MOVE_UNDECLARED: {
    check: 'C-111.20', where: at("#checkPursuit", "is-pursuit-state-move"),
    translation: word('refusal.PURSUIT_STATE_MOVE_UNDECLARED'),
  },
  BAD_SCOPE: {
    check: 'C-111.21', where: at("refuseBadScope", "is-aspiration-scoped"),
    translation: word('refusal.BAD_SCOPE'),
  },
  NO_SUCH_PROPOSAL: {
    check: 'C-111.22', where: at("triage", "is-proposal-open"),
    translation: word('refusal.NO_SUCH_PROPOSAL'),
  },
  TRIAGE_ACT_UNKNOWN: {
    check: 'C-111.23', where: at("triage", "is-triage-act"),
    translation: word('refusal.TRIAGE_ACT_UNKNOWN'),
  },
  SOURCE_DECLARED: {
    check: 'C-111.24', where: at("registerSource", "is-source-once"),
    translation: word('refusal.SOURCE_DECLARED'),
  },
  SOURCE_MALFORMED: {
    check: 'C-111.25', where: at("registerSource", "is-source-shaped"),
    translation: word('refusal.SOURCE_MALFORMED'),
  },
  PURSUIT_ENDED: {
    check: 'C-111.26', where: at("refusePursuitEnded", "is-pursuit-live"),
    translation: word('refusal.PURSUIT_ENDED'),
  },
  ADOPTIONS_UNSPLICEABLE: {
    check: 'C-111.28', where: at("triage", "is-adoptions-spliceable"),
    translation: word('refusal.ADOPTIONS_UNSPLICEABLE'),
  },
  NONE_EXISTS_READER_DECLARED: {
    check: 'C-111.29', where: at("registerNoneExistsReader", "is-none-exists-once"),
    translation: word('refusal.NONE_EXISTS_READER_DECLARED'),
  },
  NONE_EXISTS_READER_MALFORMED: {
    check: 'C-111.30', where: at("registerNoneExistsReader", "is-none-exists-shaped"),
    translation: word('refusal.NONE_EXISTS_READER_MALFORMED'),
  },
  NO_NOTE: {
    check: 'C-111.27', where: at("recordDeadEnd", "is-dead-end-noted"),
    translation: word('refusal.NO_NOTE'),
  },
});

/** A refusal carrying its row: its reason, code, check id and translation. Called with the code as a literal at each
 *  site, so the DEC-49 guard reads which code a marked region mints. */
export function refusal(code, detail, extra) {
  const row = INTENT_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
}
