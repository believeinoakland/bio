/* filing-templates' refusal rows (requirements: `build/requirements/filing-templates.md`, R23; K921, K927, K933).
 * DEC-49: every refusal this module answers carries its code, its row and the member's translation.
 *
 * MOVED from `filings` (its R26's rows, `filings/checks.mjs`:140–:174) with their numbers, each `where` re-pointed here:
 * C-115.31 re-keyed `MACHINE_CANNOT_DRAFT_TEMPLATE` (was `MACHINE_CANNOT_SAVE_TEMPLATE`) and C-115.36 re-keyed
 * `TEMPLATE_TIER3_FILE` (was `TEMPLATE_KIND_TIER3`), each translation re-worded for its new code; C-115.32, .33, .35,
 * .37 and .38 (`NO_SUCH_TEMPLATE`, which `filings` passes through as this module's) moved; `filings`' T21 job deleted
 * its copies (K624 (1)). C-115.34, .39 and .40 stay `filings`'. Every other code is a new
 * row of this module's family, C-125 (K933). Every row here was stamped by 1.52.0 (PROMOTION #23, T22 layer 2; K991). */

const at = (fn, region) => `src/filing-templates/index.mjs ${fn} > ${region}`;

export const FILING_TEMPLATE_CHECKS = Object.freeze({
  /* ---- moved from filings (C-115) ---- */
  MACHINE_CANNOT_DRAFT_TEMPLATE: {
    check: "C-115.31", where: at("#machine", "is-template-member"),
    translation: "Only a named member drafts, revises, submits or opens a template for review. A machine may propose "
      + "wording; it never makes it a template's text.",
  },
  TEMPLATE_NAME_REFUSED: {
    check: "C-115.32", where: at("#shapeRefusal", "is-template-shape"),
    translation: "Name the template in one line of at most 200 characters.",
  },
  TEMPLATE_KIND_REFUSED: {
    check: "C-115.33", where: at("#shapeRefusal", "is-template-shape"),
    translation: "A template's kind is written as a kind is: lower-case letters, digits and underscores.",
  },
  TEMPLATE_TEXT_REFUSED: {
    check: "C-115.35", where: at("#textRefusal", "is-template-text"),
    translation: "The template's words are empty, too long, or not readable as text.",
  },
  TEMPLATE_TIER3_FILE: {
    check: "C-115.36", where: at("#shapeRefusal", "is-template-shape"),
    translation: "This kind's tier is 3: it requires competent counsel, so no template the group files in its own name "
      + "is kept for it. A template that is the basis of a briefing to counsel may serve it.",
  },
  TEMPLATE_NAME_TAKEN: {
    check: "C-115.37", where: at("#shapeRefusal", "is-template-shape"),
    translation: "The group's library already holds a template by this name. Choose another name.",
  },
  NO_SUCH_TEMPLATE: {
    check: "C-115.38", where: at("#noTemplate", "is-no-such-template"),
    translation: "There is no template by that id in the group's library that you can read here. One you may not see "
      + "answers exactly as one that does not exist.",
  },
  /* ---- new (C-125) ---- */
  TEMPLATE_KIND_UNKNOWN: {
    check: "C-125.1", where: at("#shapeRefusal", "is-template-shape"),
    translation: "A template written for a jurisdiction profile serves a kind of action that profile holds, and the "
      + "profile named holds no such kind.",
  },
  TEMPLATE_USE_REFUSED: {
    check: "C-125.2", where: at("#shapeRefusal", "is-template-shape"),
    translation: "Say what the template is for: file (wording the group files in its own name) or brief (the basis of "
      + "a briefing to counsel).",
  },
  TEMPLATE_PROFILE_UNKNOWN: {
    check: "C-125.3", where: at("#shapeRefusal", "is-template-shape"),
    translation: "A template is written for jurisdiction profiles this instance holds, or for none in particular "
      + "(general), and a profile named is not held.",
  },
  TEMPLATE_BLANK_UNKNOWN: {
    check: "C-125.4", where: at("#textRefusal", "is-template-text"),
    translation: "The words name a blank that no filing fills. Use only the blanks filings fill, written {{name}}.",
  },
  TEMPLATE_SCOPE_REFUSED: {
    check: "C-125.5", where: at("#scope", "is-template-scope"),
    translation: "This is done by a member taking part in the template's project (or, for withdrawing a version, by "
      + "its author), and you are not. Nothing was changed.",
  },
  TEMPLATE_DRAFT_OPEN: {
    check: "C-125.6", where: at("templateDraft", "is-template-draft"),
    translation: "The template already has a version in draft or in review, as named. Finish or withdraw it before "
      + "starting another.",
  },
  TEMPLATE_RETIRED: {
    check: "C-125.7", where: at("#retired", "is-template-retired"),
    translation: "The template has been retired from use, for the reason given. None of its versions is offered, and "
      + "no new version is drafted of it.",
  },
  TEMPLATE_FROM_REFUSED: {
    check: "C-125.8", where: at("#fromRefusal", "is-template-from"),
    translation: "A draft starts from a template version or a proposal you can read here, and the one named is not "
      + "one. A filing's text becomes a template only through the filing's own keep-as-template act.",
  },
  NOT_A_DRAFT: {
    check: "C-125.9", where: at("#notADraft", "is-not-a-draft"),
    translation: "This version has left draft, so its text is fixed. Changing the wording makes a new version.",
  },
  TEMPLATE_NO_PROPOSER: {
    check: "C-125.10", where: at("templatePropose", "is-template-propose"),
    translation: "Nobody is named as the one proposing this wording. Every proposal names who made it.",
  },
  TEMPLATE_WHY_REFUSED: {
    check: "C-125.11", where: at("templatePropose", "is-template-propose"),
    translation: "Say why the wording is proposed, in at most 1,000 characters.",
  },
  REVIEWER_UNKNOWN: {
    check: "C-125.12", where: at("templateSubmit", "is-template-submit"),
    translation: "A reviewer asked is a member who can read the template, and one named is not. Nothing was submitted.",
  },
  NO_REVIEWERS: {
    check: "C-125.13", where: at("templateSubmit", "is-template-submit"),
    translation: "A version goes to review with someone to review it: name a member, or open a review grant for a "
      + "professional first.",
  },
  GRANT_RECIPIENT_REFUSED: {
    check: "C-125.14", where: at("templateReviewGrant", "is-template-grant"),
    translation: "Name the reviewer and their organisation, each in one line of at most 200 characters.",
  },
  GRANT_NO_SECRET: {
    check: "C-125.15", where: at("templateReviewGrant", "is-template-grant"),
    translation: "A review grant opens by a secret link the instance makes, and none was made for this request. "
      + "Nothing was granted.",
  },
  NO_SUCH_GRANT: {
    check: "C-125.16", where: at("templateGrantRevoke", "is-template-grant-revoke"),
    translation: "There is no review grant by that id on a template you can read here.",
  },
  NO_TEMPLATE_GRANT: {
    check: "C-125.17", where: at("noTemplateGrant", "is-no-template-grant"),
    translation: "Nothing answers to this link. A review link is read only while it is open; one withdrawn, or whose "
      + "version has left review, answers exactly as one that never existed.",
  },
  MACHINE_CANNOT_REVIEW_TEMPLATE: {
    check: "C-125.18", where: at("#machine", "is-template-member"),
    translation: "Only a member or a professional reviewer gives a review. A machine's critique is a comment, shown "
      + "as machine work, and never counts as a review.",
  },
  NOT_IN_REVIEW: {
    check: "C-125.19", where: at("#notInReview", "is-not-in-review"),
    translation: "This version is not in review, so it is not reviewed, approved or opened for review here.",
  },
  REVIEW_REFUSED: {
    check: "C-125.20", where: at("templateReview", "is-template-review"),
    translation: "A review states its outcome (no concerns, concerns or changes requested), what it covered in 1 to "
      + "200 characters, any comment in at most 4,000 and any credential in at most 200.",
  },
  REVIEW_STALE: {
    check: "C-125.21", where: at("templateReview", "is-template-review"),
    translation: "The text reviewed is not the version's text. Read the version as it stands and review that.",
  },
  MACHINE_CANNOT_APPROVE_TEMPLATE: {
    check: "C-125.22", where: at("#machine", "is-template-member"),
    translation: "Only a named member approves, widens, retires or withdraws a template. A machine may propose "
      + "wording; it never decides.",
  },
  TEMPLATE_NOT_APPROVED: {
    check: "C-125.23", where: at("templateApprove", "is-template-approve"),
    translation: "Only an approved version's template is made group-wide, and this version is not approved.",
  },
  NOT_AN_APPROVER: {
    check: "C-125.24", where: at("#notAnApprover", "is-not-an-approver"),
    translation: "An owner of the template's project approves or retires it, and an administrator makes it group-wide "
      + "or retires a group-wide one. You are not the one who does this here.",
  },
  APPROVER_IS_AUTHOR: {
    check: "C-125.25", where: at("templateApprove", "is-template-approve"),
    translation: "The version's author is its only member contributor, so someone else approves it.",
  },
  REVIEWS_INSUFFICIENT: {
    check: "C-125.26", where: at("templateApprove", "is-template-approve"),
    translation: "The version lacks the reviews its tier requires, each with no concerns, or a review requesting "
      + "changes still stands. A Tier 1 kind needs one member's review; otherwise a professional's review, or the "
      + "approver's written reason for going without one.",
  },
  TEMPLATE_REASON_REFUSED: {
    check: "C-125.27", where: at("templateRetire", "is-template-retire"),
    translation: "Give the reason in 1 to 500 characters.",
  },
  TEMPLATE_ALREADY_ENDED: {
    check: "C-125.28", where: at("templateRetire", "is-template-retire"),
    translation: "This was already retired or withdrawn, as recorded, and that stands.",
  },
  TEMPLATE_NOTES_REFUSED: {
    check: "C-125.29", where: at("#textRefusal", "is-template-text"),
    translation: "A version's notes are text of at most 8,000 characters.",
  },
  COMMENT_REFUSED: {
    check: "C-125.30", where: at("templateComment", "is-template-comment"),
    translation: "A comment names who wrote it and is 1 to 4,000 characters; a note is added by a member who may "
      + "revise the template, once its version has left draft.",
  },
  TEMPLATE_NOT_OFFERED: {
    check: "C-125.31", where: at("offeredVersion", "is-offered-version"),
    translation: "That version is not offered for a filing: it is a draft, in review or withdrawn, or the template has "
      + "no approved version.",
  },
  TEMPLATES_STATE_REFUSED: {
    check: "C-125.32", where: at("templatesFor", "is-templates-state"),
    translation: "Templates are listed as offered, or by one of: draft, in_review, withdrawn, retired, proposed.",
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(FILING_TEMPLATE_CHECKS, code) ? FILING_TEMPLATE_CHECKS[code] : null;
}
