/* investigation — THE ROWS (requirements: `build/requirements/investigation.md`; T41-33, N820).
 *
 * Each row is `{check, where, translation}`, family C-146 (K2480), minted here and awaiting the stamp of T42's
 * promotion job. A project's refusals (`PROJECT_SEEN_NOT_A_PARTICIPANT`, `NO_SUCH_PROJECT`,
 * `PROJECT_ACT_NOT_A_PARTICIPANT`) are `membership`'s, relayed; a step's are `steps`'; `promotion`'s and `intent`'s
 * answers are relayed as they come. No translation names a place. This file imports nothing. */

import { word, localize } from "../setup-words/index.mjs";

const at = (...fns) => fns.map((f) => `src/investigation/index.mjs ${f}`).join("; ");

export const INVESTIGATION_CHECKS = {
  MILESTONE_NO_NAME: { check: "C-146.1", where: at("milestoneSet", "milestoneRevise"),
    translation: word("refusal.MILESTONE_NO_NAME") },
  MILESTONE_BAD_DATE: { check: "C-146.2", where: at("milestoneSet", "milestoneRevise", "milestoneReminder"),
    translation: word("refusal.MILESTONE_BAD_DATE") },
  MILESTONE_WAITS_ON_NOTHING: { check: "C-146.3", where: at("milestoneSet", "milestoneRevise"),
    translation: word("refusal.MILESTONE_WAITS_ON_NOTHING") },
  MILESTONE_ITEM_UNKNOWN: { check: "C-146.4", where: at("milestoneSet", "milestoneRevise", "milestoneItemRemove"),
    translation: word("refusal.MILESTONE_ITEM_UNKNOWN") },
  NO_SUCH_MILESTONE: { check: "C-146.5", where: at("milestoneRevise", "milestoneRemove", "milestoneItemRemove", "milestoneReminder"),
    translation: word("refusal.NO_SUCH_MILESTONE") },
  INVESTIGATION_NO_REASON: { check: "C-146.6", where: at("milestoneRemove", "milestoneItemRemove", "projectCloseWithGaps", "projectClose"),
    translation: word("refusal.INVESTIGATION_NO_REASON") },
  INVESTIGATION_MEMBER_ONLY: { check: "C-146.7", where: at("milestoneSet", "reportKeep", "interviewKeep", "narrativeClaim", "claimFound", "planAccept", "projectWatch", "projectCloseWithGaps", "projectClose", "firsthandAccount"),
    translation: word("refusal.INVESTIGATION_MEMBER_ONLY") },
  REPORT_NO_TEXT: { check: "C-146.8", where: at("reportKeep"),
    translation: word("refusal.REPORT_NO_TEXT") },
  REPORT_BAD_SINCE: { check: "C-146.9", where: at("reportKeep"),
    translation: word("refusal.REPORT_BAD_SINCE") },
  NO_SUCH_QUESTION: { check: "C-146.10", where: at("reportDraft", "reportKeep", "planPropose", "claimFindStep"),
    translation: localize("investigation.checks.there_is_no_question_this", "There is no question this project draws on by that id that you can see. Nothing was written.") },
  INTERVIEW_BAD_ANSWERS: { check: "C-146.11", where: at("interviewKeep"),
    translation: word("refusal.INTERVIEW_BAD_ANSWERS") },
  CLAIM_BAD_SOURCE: { check: "C-146.12", where: at("narrativeClaim"),
    translation: word("refusal.CLAIM_BAD_SOURCE") },
  CLAIM_NO_TEXT: { check: "C-146.13", where: at("narrativeClaim"),
    translation: word("refusal.CLAIM_NO_TEXT") },
  NO_SUCH_CLAIM: { check: "C-146.14", where: at("claimFindStep", "claimFound"),
    translation: word("refusal.NO_SUCH_CLAIM") },
  CLAIM_NO_FIND_STEP: { check: "C-146.15", where: at("claimFound"),
    translation: word("refusal.CLAIM_NO_FIND_STEP") },
  NO_SUCH_INTERVIEW: { check: "C-146.16", where: at("narrativeClaim"),
    translation: word("refusal.NO_SUCH_INTERVIEW") },
  PLAN_NOT_A_MACHINE: { check: "C-146.17", where: at("planPropose"),
    translation: word("refusal.PLAN_NOT_A_MACHINE") },
  PLAN_NOT_YOUR_RUN: { check: "C-146.18", where: at("planPropose", "claimFindStep"),
    translation: word("refusal.PLAN_NOT_YOUR_RUN") },
  PLAN_BAD_KIND: { check: "C-146.19", where: at("planPropose"),
    translation: word("refusal.PLAN_BAD_KIND") },
  PLAN_NO_TEXT: { check: "C-146.20", where: at("planPropose", "planAccept"),
    translation: word("refusal.PLAN_NO_TEXT") },
  NO_SUCH_PLANNING_PROPOSAL: { check: "C-146.21", where: at("planAccept"),
    translation: word("refusal.NO_SUCH_PLANNING_PROPOSAL") },
  PLAN_DECIDED: { check: "C-146.22", where: at("planAccept"),
    translation: word("refusal.PLAN_DECIDED") },
  PLAN_BAD_FORM: { check: "C-146.23", where: at("planAccept"),
    translation: word("refusal.PLAN_BAD_FORM") },
  QUIET_NOT_QUIET: { check: "C-146.24", where: at("projectWatch", "projectCloseWithGaps"),
    translation: word("refusal.QUIET_NOT_QUIET") },
  CLOSE_BAD_REASON: { check: "C-146.25", where: at("projectCloseWithGaps", "projectClose"),
    translation: word("refusal.CLOSE_BAD_REASON") },
  INTERVIEW_NOT_A_LEG: { check: "C-146.26", where: at("check"),
    translation: word("refusal.INTERVIEW_NOT_A_LEG") },
  PROJECT_NOT_WATCHED: { check: "C-146.27", where: at("watchArrival"),
    translation: word("refusal.PROJECT_NOT_WATCHED") },
  ARRIVAL_BAD: { check: "C-146.28", where: at("watchArrival"),
    translation: word("refusal.ARRIVAL_BAD") },
};

/** R22 (inquiry R59): the warning's shape is inquiry's (`PERSON_IN_NO_PUBLIC_ROLE`); this module mints no row for it. */
export const PERSON_WARNING_CODE = "PERSON_IN_NO_PUBLIC_ROLE";
