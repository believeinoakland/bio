/* investigation — THE ROWS (requirements: `build/requirements/investigation.md`; T41-33, N820).
 *
 * Each row is `{check, where, translation}`, family C-146 (K2480), minted here and awaiting the stamp of T42's
 * promotion job. A project's refusals (`PROJECT_SEEN_NOT_A_PARTICIPANT`, `NO_SUCH_PROJECT`,
 * `PROJECT_ACT_NOT_A_PARTICIPANT`) are `membership`'s, relayed; a step's are `steps`'; `promotion`'s and `intent`'s
 * answers are relayed as they come. No translation names a place. This file imports nothing. */

const at = (...fns) => fns.map((f) => `src/investigation/index.mjs ${f}`).join("; ");

export const INVESTIGATION_CHECKS = {
  MILESTONE_NO_NAME: { check: "C-146.1", where: at("milestoneSet", "milestoneRevise"),
    translation: "Give the milestone a name, in at most 200 characters. Nothing was written." },
  MILESTONE_BAD_DATE: { check: "C-146.2", where: at("milestoneSet", "milestoneRevise", "milestoneReminder"),
    translation: "A milestone's date is a calendar day, written as year, month and day. Nothing was written." },
  MILESTONE_WAITS_ON_NOTHING: { check: "C-146.3", where: at("milestoneSet", "milestoneRevise"),
    translation: "A milestone waits on at least one question the project draws on or one step its participants can see. Nothing was written." },
  MILESTONE_ITEM_UNKNOWN: { check: "C-146.4", where: at("milestoneSet", "milestoneRevise", "milestoneItemRemove"),
    translation: "There is no question or step of this project by that id that you can see. Nothing was written." },
  NO_SUCH_MILESTONE: { check: "C-146.5", where: at("milestoneRevise", "milestoneRemove", "milestoneItemRemove", "milestoneReminder"),
    translation: "There is no milestone here by that number that you can see. Nothing was written." },
  INVESTIGATION_NO_REASON: { check: "C-146.6", where: at("milestoneRemove", "milestoneItemRemove", "projectCloseWithGaps"),
    translation: "Say why, in your own words, in at most 2,000 characters. Nothing was written." },
  INVESTIGATION_MEMBER_ONLY: { check: "C-146.7", where: at("milestoneSet", "reportKeep", "interviewKeep", "narrativeClaim", "claimFound", "planAccept", "projectWatch", "projectCloseWithGaps", "firsthandAccount"),
    translation: "Only a member does this, in their own words and by their own choice. Nothing was written." },
  REPORT_NO_TEXT: { check: "C-146.8", where: at("reportKeep"),
    translation: "A status report holds your words, in at most 20,000 characters. Nothing was kept." },
  REPORT_BAD_SINCE: { check: "C-146.9", where: at("reportKeep"),
    translation: "Say from when the report runs, as an instant, no later than now. Nothing was kept." },
  NO_SUCH_QUESTION: { check: "C-146.10", where: at("reportDraft", "reportKeep", "planPropose", "claimFindStep"),
    translation: "There is no question this project draws on by that id that you can see. Nothing was written." },
  INTERVIEW_BAD_ANSWERS: { check: "C-146.11", where: at("interviewKeep"),
    translation: "An interview holds six answers, one for each of its questions, in your own words; leave a question blank if you have no answer, and answer at least one. Nothing was kept." },
  CLAIM_BAD_SOURCE: { check: "C-146.12", where: at("narrativeClaim"),
    translation: "A claim is a quoted part of one of the interview's answers, or your own words. Quote it exactly as it stands. Nothing was written." },
  CLAIM_NO_TEXT: { check: "C-146.13", where: at("narrativeClaim"),
    translation: "Say what the public body is remembered to have said or done, in at most 2,000 characters. Nothing was written." },
  NO_SUCH_CLAIM: { check: "C-146.14", where: at("claimFindStep", "claimFound"),
    translation: "There is no claim here by that number that you can see. Nothing was written." },
  CLAIM_NO_FIND_STEP: { check: "C-146.15", where: at("claimFound"),
    translation: "A claim is found through its \"find the record\" step. Make that step first, then tie the record to it. Nothing was written." },
  NO_SUCH_INTERVIEW: { check: "C-146.16", where: at("narrativeClaim"),
    translation: "There is no interview of this project by that id that you can see. Nothing was written." },
  PLAN_NOT_A_MACHINE: { check: "C-146.17", where: at("planPropose"),
    translation: "A member writes a question or a step themselves; a proposal is the assistant's, drawn from her words. Nothing was written." },
  PLAN_NOT_YOUR_RUN: { check: "C-146.18", where: at("planPropose", "claimFindStep"),
    translation: "The assistant proposes only for a run it holds, and this credential holds no such run. Nothing was written." },
  PLAN_BAD_KIND: { check: "C-146.19", where: at("planPropose"),
    translation: "A planning proposal is a question or a step. Nothing was written." },
  PLAN_NO_TEXT: { check: "C-146.20", where: at("planPropose", "planAccept"),
    translation: "Say what the question or step is, in at most 500 characters. Nothing was written." },
  NO_SUCH_PROPOSAL: { check: "C-146.21", where: at("planAccept"),
    translation: "There is no planning proposal here by that number that you can see. Nothing was written." },
  PLAN_DECIDED: { check: "C-146.22", where: at("planAccept"),
    translation: "This proposal was already taken up or set aside. Nothing was written." },
  PLAN_BAD_FORM: { check: "C-146.23", where: at("planAccept"),
    translation: "A proposal is taken up as proposed, taken up with your own wording, or set aside for your own. Nothing was written." },
  QUIET_NOT_QUIET: { check: "C-146.24", where: at("projectWatch", "projectCloseWithGaps"),
    translation: "The work on this project has not gone quiet: a step is still open, or something is still awaited. Nothing was written." },
  CLOSE_BAD_REASON: { check: "C-146.25", where: at("projectCloseWithGaps"),
    translation: "A project closes as resolved, superseded or abandoned. Nothing was written." },
  NARRATIVE_NOT_A_LEG: { check: "C-146.26", where: at("check"),
    translation: "An interview is a member's own account, which says where to look and is never what a finding rests on. Rest the finding on what was found in the record. Nothing was written." },
};

/** R22 (inquiry R59): the warning's shape is inquiry's (`PERSON_IN_NO_PUBLIC_ROLE`); this module mints no row for it. */
export const PERSON_WARNING_CODE = "PERSON_IN_NO_PUBLIC_ROLE";
