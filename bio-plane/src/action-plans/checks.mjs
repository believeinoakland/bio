/* action-plans' refusal rows (requirements: `build/requirements/action-plans.md`). DEC-49: every refusal this module
 * mints carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act
 * is reached. The family is C-124, minted with the module (K174: a new module holds its new family); each code is
 * minted at one site (K231), named by its row's `where`; every row was taken by promotion's stamp 1.49.0 (PROMOTION #20,
 * T19 layer 2; K711). Refusals minted by the modules this one uses are relayed with their own rows:
 * `NO_SUCH_PROJECT` (membership R78), `PROJECT_SEEN_NOT_A_PARTICIPANT` (membership R44), the project-authority
 * refusals (membership R55), `NO_SUCH_DETERMINATION` (conformance R19), `NO_SUCH_STANDARD` (standards R17),
 * `CONTACT_NOT_A_MEMBER` (actions R45) and `REMINDER_REFUSED` (action-clocks R4), each answered through its module's
 * exported site (`contactNotAMember`, `reminderRefused`; N427), `AI_RUN_NOT_PRINCIPAL`
 * (run-rules R5) and every refusal of the action's write (actions, action-clocks). */

const at = (fn, region) => `src/action-plans/index.mjs ${fn} > ${region}`;

export const ACTION_PLAN_CHECKS = Object.freeze({
  /* ---- R1, R4: opening a plan and its subjects ---- */
  MACHINE_CANNOT_PLAN: {
    check: 'C-124.1', where: at("#member", "is-plan-member"),
    translation: 'An action plan is the group\'s own working material, and only a member opens it, changes what it is '
      + 'about or closes it. An assistant may propose options; it may not do this. Sign in as a member. Nothing was written.',
  },
  PLAN_NO_TITLE: {
    check: 'C-124.2', where: at("planOpen", "is-plan-titled"),
    translation: 'A plan needs a title of 1 to 200 characters, with no quotation mark, backslash or line break. '
      + 'Nothing was written.',
  },
  PLAN_NO_SUBJECT: {
    check: 'C-124.3', where: at("refuseNoSubject", "is-plan-subjects"),
    translation: 'A plan is about 1 to 50 matters: an open question, or one standard\'s outcome of a determination. '
      + 'Nothing was written.',
  },
  SUBJECT_MALFORMED: {
    check: 'C-124.4', where: at("refuseMalformed", "is-subject-shaped"),
    translation: 'A matter is either {kind: inquiry, inquiry} for a question still open, or {kind: outcome, '
      + 'determination, standard} for one standard\'s outcome of a determination. The one named was neither. '
      + 'Nothing was written.',
  },
  NO_SUCH_INQUIRY: {
    check: 'C-124.5', where: at("refuseNoSuchInquiry", "is-inquiry-seen"),
    translation: 'No question answers to that id here. One you may not see is answered exactly as one that does not '
      + 'exist. Nothing was written.',
  },
  SUBJECT_NOT_OF_PROJECT: {
    check: 'C-124.6', where: at("#subjects", "is-subject-of-project"),
    translation: 'A plan is about the project\'s own matters: a question the project draws on, or a determination the '
      + 'project made. This one belongs to another project. Nothing was written.',
  },
  SUBJECT_NOT_LIVE: {
    check: 'C-124.7', where: at("#subjects", "is-subject-live"),
    translation: 'That matter is no longer live: the determination has been superseded, or the question is closed. '
      + 'Plan from the live one. Nothing was written.',
  },
  SUBJECT_IN_ACTIVE_PLAN: {
    check: 'C-124.8', where: at("#subjects", "is-subject-free"),
    translation: 'That matter is already in an open plan of this project, which is named. A matter is in one open '
      + 'plan of a project at a time; work in that one, or close it first. Nothing was written.',
  },
  NO_SUCH_PLAN: {
    check: 'C-124.9', where: at("noSuchPlan", "is-plan-seen"),
    translation: 'No action plan answers to that id here. A plan in a project you may not see is answered exactly as '
      + 'one that does not exist. Nothing was written.',
  },
  PLAN_CLOSED: {
    check: 'C-124.10', where: at("refusePlanClosed", "is-plan-open"),
    translation: 'This plan has been closed. A closed plan stays readable, and nothing is added to it. Nothing was '
      + 'written.',
  },
  PLAN_NO_REASON: {
    check: 'C-124.11', where: at("refuseReason", "is-reason-given"),
    translation: 'This act needs a reason in your own words, of 1 to 500 characters, with no quotation mark, '
      + 'backslash or line break. Nothing was written.',
  },

  /* ---- R9–R12: options and proposals ---- */
  MACHINE_CANNOT_ADD_OPTION: {
    check: 'C-124.12', where: at("#optionMember", "is-option-member"),
    translation: 'An option in a plan is a member\'s act: adding one, revising one or adopting a proposal. An '
      + 'assistant may propose options; a member adopts them. Nothing was written.',
  },
  OPTION_NO_SUMMARY: {
    check: 'C-124.13', where: at("#optionFields", "is-option-summary"),
    translation: 'An option needs a summary of 1 to 200 characters. Nothing was written.',
  },
  OPTION_DETAIL_TOO_LONG: {
    check: 'C-124.14', where: at("#optionFields", "is-option-detail"),
    translation: 'An option\'s detail is at most 5,000 characters. Nothing was written.',
  },
  CATEGORY_UNKNOWN: {
    check: 'C-124.15', where: at("#optionFields", "is-option-category"),
    translation: 'An option\'s category is one of: mitigation, legal, awareness, journalistic, grassroots, other. '
      + 'Nothing was written.',
  },
  OPTION_NO_SUBJECT: {
    check: 'C-124.16', where: at("#optionFields", "is-option-subject"),
    translation: 'An option serves at least one of the plan\'s matters, and names only matters the plan is about. '
      + 'Nothing was written.',
  },
  ADDRESSEE_REFUSED: {
    check: 'C-124.17', where: at("#optionFields", "is-option-addressee"),
    translation: 'An addressee is an office by its role and body, a reporter or outlet, an organisation or another '
      + 'civic group by role and organisation, or a described audience. It is never a private individual. Nothing '
      + 'was written.',
  },
  DATE_REFUSED: {
    check: 'C-124.18', where: at("#optionFields", "is-option-date"),
    translation: 'A regulated date is written year-month-day and names its basis: the statute, order or commitment '
      + 'that sets it. Nothing was written.',
  },
  TIER_REFUSED: {
    check: 'C-124.19', where: at("#optionFields", "is-option-tier"),
    translation: 'A tier is stated only on a legal option, and is 1, 2, 3 or undetermined. Nothing was written.',
  },
  LOBBYING_NO_REQUIREMENT: {
    check: 'C-124.20', where: at("#optionFields", "is-lobbying-enforces"),
    translation: 'An option you mark as lobbying names the existing requirement it seeks enforced or restored: a '
      + 'standard, or a determined matter of the plan. Lobbying for anything else is not an act this record holds. '
      + 'Nothing was written.',
  },
  OPTION_KEY_REFUSED: {
    check: 'C-124.21', where: at("refuseKeys", "is-no-cost-or-score"),
    translation: 'A plan holds no cost, budget, money to be spent, assignee, hours or significance score. Those are '
      + 'not what this record is for. Send the act without them. Nothing was written.',
  },
  NO_SUCH_PLAN_PROPOSAL: {
    check: 'C-124.22', where: at("optionAdopt", "is-proposal-seen"),
    translation: 'No proposal for an option answers to that id in a plan you may see. Nothing was written.',
  },
  PROPOSAL_ADOPTED: {
    check: 'C-124.23', where: at("optionAdopt", "is-proposal-once"),
    translation: 'That proposal has already been adopted as an option, which is named. A proposal is adopted once. '
      + 'Nothing was written.',
  },
  PROPOSAL_NO_PROPOSER: {
    check: 'C-124.24', where: at("optionPropose", "is-proposer-stamped"),
    translation: 'A proposal names who made it. This one came with no signed-in caller. Nothing was written.',
  },
  PROPOSAL_WHY_REFUSED: {
    check: 'C-124.25', where: at("optionPropose", "is-proposal-why"),
    translation: 'A proposal says why it is offered, in 1 to 500 characters. Nothing was written.',
  },

  /* ---- R13: dispositions ---- */
  MACHINE_CANNOT_DISPOSE: {
    check: 'C-124.26', where: at("optionDispose", "is-dispose-member"),
    translation: 'Choosing, declining or marking an option done or blocked is a member\'s decision. An assistant may '
      + 'not make it. Nothing was written.',
  },
  DISPOSITION_UNKNOWN: {
    check: 'C-124.27', where: at("optionDispose", "is-disposition-known"),
    translation: 'A disposition is one of: open, chosen, declined, done, blocked. Nothing was written.',
  },
  NO_SUCH_OPTION: {
    check: 'C-124.28', where: at("refuseNoSuchOption", "is-option-held"),
    translation: 'The plan holds no option of that id; the first one not found is named. Nothing was written.',
  },

  /* ---- R14–R16: scenarios and checkpoints ---- */
  MACHINE_CANNOT_SCHEDULE: {
    check: 'C-124.29', where: at("scenarioSet", "is-scenario-member"),
    translation: 'Laying options out over time is a member\'s act. An assistant may propose options; it may not set '
      + 'a scenario. Nothing was written.',
  },
  SCENARIO_OUT_OF_RANGE: {
    check: 'C-124.30', where: at("scenarioSet", "is-scenario-numbered"),
    translation: 'A plan holds at most three scenarios, numbered 1, 2 and 3. Nothing was written.',
  },
  SCENARIO_NAME_REFUSED: {
    check: 'C-124.31', where: at("scenarioSet", "is-scenario-named"),
    translation: 'A scenario needs a name of 1 to 200 characters, with no quotation mark, backslash or line break. '
      + 'Nothing was written.',
  },
  PHASE_MALFORMED: {
    check: 'C-124.32', where: at("#scenarioPhases", "is-phase-shaped"),
    translation: 'A phase has an id, a name, the chosen options it holds, when it starts (at the plan\'s start, after '
      + 'another phase, on one outcome of another phase\'s checkpoint, or when another matter\'s track reaches a point), '
      + 'and may have a checkpoint after 1 to 3,650 days, a condition of up to 500 characters and the phase each '
      + 'judgement leads to. The phase named was not so. Nothing was written.',
  },
  PHASE_OPTION_NOT_CHOSEN: {
    check: 'C-124.33', where: at("#scenarioPhases", "is-phase-option-chosen"),
    translation: 'A phase holds only options the group has chosen. Choose the option first. Nothing was written.',
  },
  PHASE_CYCLE: {
    check: 'C-124.34', where: at("#scenarioPhases", "is-phase-acyclic"),
    translation: 'A phase cannot start after itself: following when each phase starts leads back to the phase named. '
      + 'Nothing was written.',
  },
  BRANCH_UNKNOWN: {
    check: 'C-124.35', where: at("#scenarioPhases", "is-branch-known"),
    translation: 'A phase starts after, or a judgement leads to, a phase of the same scenario, or a matter the plan is '
      + 'about. The one named is neither. Nothing was written.',
  },
  MACHINE_CANNOT_JUDGE: {
    check: 'C-124.36', where: at("checkpointRecord", "is-judge-member"),
    translation: 'Whether a checkpoint\'s condition was met is the group\'s own judgement. An assistant may not make '
      + 'it. Nothing was written.',
  },
  CHECKPOINT_REFUSED: {
    check: 'C-124.37', where: at("checkpointRecord", "is-checkpoint-named"),
    translation: 'A judgement names a scenario of the plan, one of its phases that has a checkpoint, met or not_met, '
      + 'and a note of up to 500 characters. Nothing was written.',
  },
  CHECKPOINT_NOT_DUE: {
    check: 'C-124.38', where: at("checkpointRecord", "is-checkpoint-due"),
    translation: 'That checkpoint is not due yet: its phase has not started, or its days have not passed. Nothing was '
      + 'written.',
  },
  CHECKPOINT_JUDGED: {
    check: 'C-124.39', where: at("checkpointRecord", "is-checkpoint-once"),
    translation: 'That checkpoint has already been judged. Nothing was written.',
  },

  /* ---- R18: starting an option ---- */
  MACHINE_CANNOT_START: {
    check: 'C-124.40', where: at("optionStart", "is-start-member"),
    translation: 'Starting an option creates an action the group takes in the world, and only a member does that. '
      + 'Nothing was written.',
  },
  OPTION_NOT_CHOSEN: {
    check: 'C-124.41', where: at("optionStart", "is-start-chosen"),
    translation: 'Only an option the group has chosen is started. Choose it first. Nothing was written.',
  },
  OPTION_STARTED: {
    check: 'C-124.42', where: at("optionStart", "is-start-once"),
    translation: 'That option has already been started; the action it created is named. Nothing was written.',
  },

  /* ---- R20: closing ---- */
  MACHINE_CANNOT_CLOSE_PLAN: {
    check: 'C-124.43', where: at("planClose", "is-close-member"),
    translation: 'Closing a plan is a member\'s act, with a reason. A plan never closes itself. Nothing was written.',
  },

  /* ---- R21: the project's kind of work ---- */
  WORK_KIND_UNKNOWN: {
    check: 'C-124.44', where: at("#workKindsCheck", "is-work-kind-known"),
    translation: 'A project\'s kinds of work are drawn from: reporting, fixing, legal, oversight, other. Nothing was '
      + 'written.',
  },
  MACHINE_CANNOT_SET_WORK_KIND: {
    check: 'C-124.45', where: at("#workKindsCheck", "is-work-kind-member"),
    translation: 'A project\'s kinds of work are set by an owner of the project. An automated credential cannot set '
      + 'them. Nothing was written.',
  },

  /* ---- R30, R31, R34: the planning run ---- */
  PLAN_NOT_OF_PROJECT: {
    check: 'C-124.46', where: at("planRunCheck", "is-plan-of-context"),
    translation: 'A planning run works on a plan of the project it is opened over, and this plan is another '
      + 'project\'s. Nothing was written.',
  },
  PROPOSAL_NO_RUN: {
    check: 'C-124.47', where: at("#runGate", "is-proposal-run"),
    translation: 'An assistant\'s proposal names the planning run it was made under, one you can see. Nothing was '
      + 'written.',
  },
  PROPOSAL_RUN_NOT_RUNNING: {
    check: 'C-124.48', where: at("#runGate", "is-proposal-run-running"),
    translation: 'That planning run is no longer running, so it proposes nothing more. Nothing was written.',
  },
  PROPOSAL_RUN_OTHER_PLAN: {
    check: 'C-124.49', where: at("refuseRunOtherPlan", "is-run-of-plan"),
    translation: 'That run is not a planning run of this plan. Nothing was written.',
  },
  PROPOSAL_BOUND_REACHED: {
    check: 'C-124.50', where: at("#runGate", "is-proposal-bound"),
    translation: 'That planning run has made every proposal it was allowed. Nothing was written.',
  },
  PROPOSAL_NO_SOURCE: {
    check: 'C-124.51', where: at("#sources", "is-proposal-sourced"),
    translation: 'An assistant\'s proposal names what it rests on: findings, determinations, standards, consequences, '
      + 'plans or options you can see. One named is none of those here; one you may not see is answered as one that '
      + 'does not exist. Nothing was written.',
  },
  PROPOSALS_CURSOR_REFUSED: {
    check: 'C-124.52', where: at("planProposals", "is-cursor-given"),
    translation: 'That page marker was not given by this list. Ask for the first page again. Nothing was read.',
  },

  /* ---- the record object (R27, R24): the plan's document ---- */
  MACHINE_CANNOT_WRITE_PLAN: {
    check: 'C-124.53', where: at("check", "is-plan-doc-member"),
    translation: 'An action plan\'s record is written by members\' acts only. An automated credential cannot write it. '
      + 'Nothing was written.',
  },
  PLAN_BY_ACT_ONLY: {
    check: 'C-124.54', where: at("check", "is-plan-doc-act"),
    translation: 'An action plan changes only through its own acts, so its history and what is read from it never '
      + 'disagree. Nothing was written.',
  },
  PLAN_HISTORY_REWRITTEN: {
    check: 'C-124.55', where: at("check", "is-plan-append-only"),
    translation: 'An action plan\'s history is never edited; each act adds to it. Nothing was written.',
  },
  UNSPLICEABLE_PLAN: {
    check: 'C-124.56', where: at("#append", "is-plan-spliceable"),
    translation: 'The plan\'s record cannot be extended in place. Nothing was written.',
  },
  PLAN_PROVIDER_UNAVAILABLE: {
    check: 'C-124.57', where: at("refuseProviderUnavailable", "is-provider-present"),
    translation: 'An action plan reads matters, actions and runs held by other parts of the record, and one of them '
      + 'is not on this instance yet, so the plan is not answered in part. Nothing was written.',
  },
});

/** One constructor for every refusal minted here: `reason`, the site's own `detail` and keys, then `code`, `check` and
 *  `translation` from the row. */
export function refusal(code, detail, extra) {
  const row = ACTION_PLAN_CHECKS[code];
  return { ok: false, reason: code, detail, ...(extra || {}), code, check: row.check, translation: row.translation };
}
