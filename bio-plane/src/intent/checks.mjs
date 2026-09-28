/* intent's refusal rows (requirements: `build/requirements/intent.md`, R22). DEC-49: every refusal this module answers
 * carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act is
 * reached.
 *
 * One row moved here from the check catalogue: C-2.9's objective arm (R1, R22), its id unchanged, as C-45 and C-80 were
 * split (map §3.3); the catalogue keeps C-2.9's other arms. The rest are this module's own family, C-111 (N180: C-110 is
 * reevaluation's, K199), minted at the extraction (K107 (3)'s rule: the job names a new code's row; K174: a module holds
 * its new family). A code another module mints for another condition is not borrowed here: a goal or aspiration with
 * no statement is `PURSUIT_UNSTATED` (the catalogue's `NO_STATEMENT` is `publishCase`'s), and a condition's grade
 * outside A–D is `CONDITION_BAD_GRADE` (strength's `BAD_GRADE` is its own). Refusals minted
 * by the modules intent uses (membership's `PROJECT_ACT_NOT_A_PARTICIPANT` and C-70.1, progressions' dispose rows,
 * ai-runs' open rows) are relayed with their own rows and are not restated here. */

const at = (fn, region) => `src/intent/index.mjs ${fn} > ${region}`;
/* A code several acts answer is minted once, by its own function at the foot of `index.mjs` (DEC-49's one code, one
   site); its row names that function. */

export const INTENT_CHECKS = Object.freeze({
  NO_OBJECTIVE: {
    check: 'C-2.9', where: at("#checkProject", "is-objective-stated"),
    translation: 'A project states what it is trying to achieve, and this one states nothing. Write its objective '
      + 'and send it again. Nothing was written.',
  },
  MACHINE_CANNOT_SET_OBJECTIVE: {
    check: 'C-111.1', where: at("setCondition", "is-condition-member"),
    translation: 'What a project is aiming at is a member\'s decision. An assistant may point out gaps; it may not '
      + 'set or change the measure. Sign in as a member. Nothing was written.',
  },
  NO_SUCH_PROJECT: {
    check: 'C-111.2', where: at("refuseNoSuchProject", "is-project-seen"),
    translation: 'No project answers to that id here. A project you cannot see is answered exactly as one that does '
      + 'not exist, so this is not a hint either way.',
  },
  CONDITION_UNREADABLE: {
    check: 'C-111.3', where: at("#conditionRefusal", "is-condition-shaped"),
    translation: 'The measure sent for this objective is not in the shape the record reads: a progression, an entity, '
      + 'what each matching instance must reach, and the share of them that must reach it. Nothing was written.',
  },
  NO_SUCH_PROGRESSION: {
    check: 'C-111.4', where: at("refuseNoSuchProgression", "is-named-progression"),
    translation: 'The measure names a declared flow the record does not hold. Declare the flow first, or name one '
      + 'that exists. Nothing was written.',
  },
  NO_SUCH_ENTITY: {
    check: 'C-111.5', where: at("refuseNoSuchEntity", "is-named-entity"),
    translation: 'The measure names an entity the record does not hold. Register it first, or name one that exists. '
      + 'Nothing was written.',
  },
  BAD_STAGE: {
    check: 'C-111.6', where: at("#conditionRefusal", "is-condition-stage"),
    translation: 'The measure requires a step the declared flow does not have. Name steps the flow declares. '
      + 'Nothing was written.',
  },
  CONDITION_BAD_GRADE: {
    check: 'C-111.7', where: at("#conditionRefusal", "is-condition-grade"),
    translation: 'The grade the measure requires is not one of the four the record uses, A (strongest) to D. '
      + 'Nothing was written.',
  },
  BAD_SHARE: {
    check: 'C-111.8', where: at("#conditionRefusal", "is-condition-share"),
    translation: 'The share of instances that must meet the measure is a whole number from 1 to 100. Nothing was '
      + 'written.',
  },
  MACHINE_CANNOT_DECLARE_GOAL: {
    check: 'C-111.9', where: at("goalMachineRefusal", "is-goal-member"),
    translation: 'Declaring a goal, tying a project to it and closing it are members\' decisions. An assistant may '
      + 'propose; it may not decide what the group pursues. Sign in as a member. Nothing was written.',
  },
  PURSUIT_UNSTATED: {
    check: 'C-111.10', where: at("refusePursuitUnstated", "is-pursuit-stated"),
    translation: 'A goal says what it pursues and what bounds it, and an aspiration says what it holds to. Something '
      + 'here is empty. Write it and send it again. Nothing was written.',
  },
  NO_SUCH_GOAL: {
    check: 'C-111.11', where: at("refuseNoSuchGoal", "is-goal-held"),
    translation: 'No goal answers to that id here. Nothing was written.',
  },
  NO_SUCH_ASPIRATION: {
    check: 'C-111.12', where: at("refuseNoSuchAspiration", "is-aspiration-held"),
    translation: 'No aspiration answers to that id here. Nothing was written.',
  },
  NO_REASON: {
    check: 'C-111.13', where: at("refuseNoReason", "is-reason-stated"),
    translation: 'This act is recorded with a reason in your own words, and none was given. The record keeps why, '
      + 'so the next reader is not left guessing. Nothing was written.',
  },
  MACHINE_CANNOT_DECLARE_ASPIRATION: {
    check: 'C-111.14', where: at("aspirationMachineRefusal", "is-aspiration-member"),
    translation: 'What the group holds to is its members\' decision, and so is setting one aside. An assistant may '
      + 'propose; it may not declare, depart from or retire an aspiration. Sign in as a member. Nothing was written.',
  },
  NOT_YOURS: {
    check: 'C-111.15', where: at("#aspirationAuthority", "is-aspiration-yours"),
    translation: 'A member\'s own aspiration is declared, revised and retired by that member alone. Nothing was '
      + 'written.',
  },
  GROUP_ASPIRATION_NOT_ADMIN: {
    check: 'C-111.16', where: at("#aspirationAuthority", "is-group-aspiration-admin"),
    translation: 'An aspiration the whole group holds is declared, revised and retired by an administrator, and the '
      + 'act carries their name and date. Ask an administrator. Nothing was written.',
  },
  NO_LESSON: {
    check: 'C-111.17', where: at("refuseNoLesson", "is-retirement-taught"),
    translation: 'Retiring an aspiration records what pursuing it taught the group, and nothing was written there. '
      + 'Say what was learned. Nothing was retired.',
  },
  MACHINE_CANNOT_TRIAGE: {
    check: 'C-111.18', where: at("triage", "is-triage-member"),
    translation: 'An assistant may turn a finding into an open question, and nothing more. Adopting it, deferring it '
      + 'or dismissing it is a member\'s decision. Sign in as a member. Nothing was written.',
  },
  MACHINE_CANNOT_CHOOSE_THE_QUESTION: {
    check: 'C-111.19', where: at("workObjective", "is-objective-member"),
    translation: 'Setting an assistant to work on a project\'s objective is a member\'s act: the objective is the '
      + 'group\'s, and so is the choice to pursue it. Sign in as a member. No run was opened.',
  },
  PURSUIT_STATE_MOVE_UNDECLARED: {
    check: 'C-111.20', where: at("#checkPursuit", "is-pursuit-state-move"),
    translation: 'An aspiration is held until it is retired, and a goal is open until it is closed. No other move is '
      + 'accepted, and neither comes back. Nothing was written.',
  },
  BAD_SCOPE: {
    check: 'C-111.21', where: at("refuseBadScope", "is-aspiration-scoped"),
    translation: 'An aspiration belongs to the group, to one project, or to one member, and a project\'s or a '
      + 'member\'s names which one. This one does not. Nothing was written.',
  },
  NO_SUCH_PROPOSAL: {
    check: 'C-111.22', where: at("triage", "is-proposal-open"),
    translation: 'No open proposal answers to that key. It may already have been decided; the decision stays '
      + 'readable with its reason. Nothing was written.',
  },
  TRIAGE_ACT_UNKNOWN: {
    check: 'C-111.23', where: at("triage", "is-triage-act"),
    translation: 'A proposal is adopted into a project\'s objective, turned into an open question, deferred or '
      + 'dismissed. This act is none of those. Nothing was written.',
  },
  SOURCE_DECLARED: {
    check: 'C-111.24', where: at("registerSource", "is-source-once"),
    translation: 'This source of proposals is already registered. A source registers once, when the plane starts.',
  },
  SOURCE_MALFORMED: {
    check: 'C-111.25', where: at("registerSource", "is-source-shaped"),
    translation: 'A source of proposals names its kind and gives a reader. This registration does not.',
  },
  PURSUIT_ENDED: {
    check: 'C-111.26', where: at("refusePursuitEnded", "is-pursuit-live"),
    translation: 'This goal is closed, or this aspiration is retired. It stays readable with everything recorded '
      + 'under it, and it does not reopen. Nothing was written.',
  },
  ADOPTIONS_UNSPLICEABLE: {
    check: 'C-111.28', where: at("triage", "is-adoptions-spliceable"),
    translation: 'The project\'s record of adopted proposals is not in a shape the record can add to, so this '
      + 'adoption could not be written into it. Nothing was written.',
  },
  NO_NOTE: {
    check: 'C-111.27', where: at("recordDeadEnd", "is-dead-end-noted"),
    translation: 'A dead end is recorded with what was tried and why it went nowhere, and nothing was written. '
      + 'Nothing was recorded.',
  },
});

/** A refusal carrying its row: its reason, code, check id and translation. Called with the code as a literal at each
 *  site, so the DEC-49 guard reads which code a marked region mints. */
export function refusal(code, detail, extra) {
  const row = INTENT_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
}
