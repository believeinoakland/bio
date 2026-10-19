import { word } from "../setup-words/index.mjs";

/* filing-templates' refusal rows (requirements: `build/requirements/filing-templates.md`, R23; K921, K927, K933).
 * DEC-49: every refusal this module answers carries its code, its row and the member's translation.
 *
 * MOVED from `filings` (its R26's rows, `filings/checks.mjs`:140–:174) with their numbers, each `where` re-pointed here:
 * C-115.31 re-keyed `MACHINE_CANNOT_DRAFT_TEMPLATE` (was `MACHINE_CANNOT_SAVE_TEMPLATE`) and C-115.36 re-keyed
 * `TEMPLATE_TIER3_FILE` (was `TEMPLATE_KIND_TIER3`), each translation re-worded for its new code; C-115.32, .33, .35,
 * .37 and .38 (`NO_SUCH_TEMPLATE`, which `filings` passes through as this module's) moved; `filings`' T21 job deleted
 * its copies (K624 (1)). C-115.34, .39 and .40 stay `filings`'. Every other code is a new
 * row of this module's family, C-125 (K933), except R26's two (T35, N702): C-115.45 and C-115.46, as R26 numbers them.
 * Every row but those two was stamped by 1.52.0 (PROMOTION #23, T22 layer 2; K991); they await T36's promotion job.
 * T45 (R15, R28; R23's T45 line): `TEMPLATE_NOT_REVIEWED` and `TEMPLATE_COURT_PETITION`, the next free numbers of this
 * module's own family, C-125.33 and C-125.34 (FILING-TEMPLATES #8 J1), awaiting promotion's stamp.
 * T46 (R29; DEC-194, N913): C-125.33 reads its translation from `words.json` by key (`FILING_TEMPLATES_WORDS` below);
 * C-125.34 keeps its own until `words.json`'s sentence names "your group's Civicsmith" (DEC-149); awaiting T47's stamp.
 * T47 (R30; N957, K231): C-125.4 `TEMPLATE_BLANK_UNKNOWN` minted at one site, now `blankUnknownRefusal` (R32), which both R2's text check
 * and R15's profile read call; its `where` re-pointed there, its code, number and translation unmoved; awaiting T48's stamp.
 * T48 (R33; N880, K231): C-115.47 `RFC_QUOTING_MISSING` moved here from `filings` with its code, number and translation
 * unchanged (the translation read by key, `FILING_TEMPLATES_WORDS`); its `where` names its one site, `rfcQuotingRefusal`.
 * R32 (K3124): that site is provided, `blankUnknownRefusal` (`filings` R56 calls it). */

const at = (fn, region) => `src/filing-templates/index.mjs ${fn} > ${region}`;

/* R29 (T46; DEC-194, N913): the words of `words.json` (`docs/development/ux-substrate/screens/words.json`) this module's
   rows translate by, each `en` verbatim, read by key (`refusal.<CODE>`), as membership's `HANDLE_WORDS` and extraction's
   `TRANSCRIBE_WORDS` are; a row never holds a copy of its sentence. `{missing}` is left for the screen, which fills it
   from the refusal's `lacks` (R15). `refusal.TEMPLATE_COURT_PETITION` is not taken in T46: its sentence names
   "Civicsmith" bare, where DEC-149 says "your group's Civicsmith" (R29). */
export const FILING_TEMPLATES_WORDS = Object.freeze({
  "refusal.TEMPLATE_NOT_REVIEWED": word("refusal.TEMPLATE_NOT_REVIEWED", { missing: "{missing}" }),
  /* R33 (T48; by key since T50, N1130): `words.json`'s word, read through setup-words (DEC-260) */
  "refusal.RFC_QUOTING_MISSING": word("refusal.RFC_QUOTING_MISSING"),
});

export const FILING_TEMPLATE_CHECKS = Object.freeze({
  /* ---- moved from filings (C-115) ---- */
  MACHINE_CANNOT_DRAFT_TEMPLATE: {
    check: "C-115.31", where: at("#machine", "is-template-member"),
    translation: word("refusal.MACHINE_CANNOT_DRAFT_TEMPLATE"),
  },
  TEMPLATE_NAME_REFUSED: {
    check: "C-115.32", where: at("#shapeRefusal", "is-template-shape"),
    translation: word("refusal.TEMPLATE_NAME_REFUSED"),
  },
  TEMPLATE_KIND_REFUSED: {
    check: "C-115.33", where: at("#shapeRefusal", "is-template-shape"),
    translation: word("refusal.TEMPLATE_KIND_REFUSED"),
  },
  TEMPLATE_TEXT_REFUSED: {
    check: "C-115.35", where: at("#textRefusal", "is-template-text"),
    translation: word("refusal.TEMPLATE_TEXT_REFUSED"),
  },
  TEMPLATE_TIER3_FILE: {
    check: "C-115.36", where: at("#shapeRefusal", "is-template-shape"),
    translation: word("refusal.TEMPLATE_TIER3_FILE"),
  },
  TEMPLATE_NAME_TAKEN: {
    check: "C-115.37", where: at("#shapeRefusal", "is-template-shape"),
    translation: word("refusal.TEMPLATE_NAME_TAKEN"),
  },
  NO_SUCH_TEMPLATE: {
    check: "C-115.38", where: at("#noTemplate", "is-no-such-template"),
    translation: word("refusal.NO_SUCH_TEMPLATE"),
  },
  /* ---- moved from filings in T48 (R33), unchanged ---- */
  RFC_QUOTING_MISSING: {
    check: "C-115.47", where: at("rfcQuotingRefusal", "is-rfc-quoting-missing"),
    translation: FILING_TEMPLATES_WORDS["refusal.RFC_QUOTING_MISSING"],
  },
  /* ---- new in T35 (R26; N702, K1869), in the C-115 family as R26 numbers them; awaiting promotion's stamp ---- */
  TEMPLATE_REF_REFUSED: {
    check: "C-115.45", where: at("#byName", "is-template-ref"),
    translation: word("refusal.TEMPLATE_REF_REFUSED"),
  },
  TEMPLATE_NAME_AMBIGUOUS: {
    check: "C-115.46", where: at("#byName", "is-template-ref"),
    translation: word("refusal.TEMPLATE_NAME_AMBIGUOUS"),
  },
  /* ---- new (C-125) ---- */
  TEMPLATE_KIND_UNKNOWN: {
    check: "C-125.1", where: at("#shapeRefusal", "is-template-shape"),
    translation: word("refusal.TEMPLATE_KIND_UNKNOWN"),
  },
  TEMPLATE_USE_REFUSED: {
    check: "C-125.2", where: at("#shapeRefusal", "is-template-shape"),
    translation: word("refusal.TEMPLATE_USE_REFUSED"),
  },
  TEMPLATE_PROFILE_UNKNOWN: {
    check: "C-125.3", where: at("#shapeRefusal", "is-template-shape"),
    translation: word("refusal.TEMPLATE_PROFILE_UNKNOWN"),
  },
  TEMPLATE_BLANK_UNKNOWN: {
    check: "C-125.4", where: at("blankUnknownRefusal", "is-template-blank"),
    translation: word("refusal.TEMPLATE_BLANK_UNKNOWN"),
  },
  TEMPLATE_SCOPE_REFUSED: {
    check: "C-125.5", where: at("#scope", "is-template-scope"),
    translation: word("refusal.TEMPLATE_SCOPE_REFUSED"),
  },
  TEMPLATE_DRAFT_OPEN: {
    check: "C-125.6", where: at("templateDraft", "is-template-draft"),
    translation: word("refusal.TEMPLATE_DRAFT_OPEN"),
  },
  TEMPLATE_RETIRED: {
    check: "C-125.7", where: at("#retired", "is-template-retired"),
    translation: word("refusal.TEMPLATE_RETIRED"),
  },
  TEMPLATE_FROM_REFUSED: {
    check: "C-125.8", where: at("#fromRefusal", "is-template-from"),
    translation: word("refusal.TEMPLATE_FROM_REFUSED"),
  },
  NOT_A_DRAFT: {
    check: "C-125.9", where: at("#notADraft", "is-not-a-draft"),
    translation: word("refusal.NOT_A_DRAFT"),
  },
  TEMPLATE_NO_PROPOSER: {
    check: "C-125.10", where: at("templatePropose", "is-template-propose"),
    translation: word("refusal.TEMPLATE_NO_PROPOSER"),
  },
  TEMPLATE_WHY_REFUSED: {
    check: "C-125.11", where: at("templatePropose", "is-template-propose"),
    translation: word("refusal.TEMPLATE_WHY_REFUSED"),
  },
  REVIEWER_UNKNOWN: {
    check: "C-125.12", where: at("templateSubmit", "is-template-submit"),
    translation: word("refusal.REVIEWER_UNKNOWN"),
  },
  NO_REVIEWERS: {
    check: "C-125.13", where: at("templateSubmit", "is-template-submit"),
    translation: word("refusal.NO_REVIEWERS"),
  },
  GRANT_RECIPIENT_REFUSED: {
    check: "C-125.14", where: at("templateReviewGrant", "is-template-grant"),
    translation: word("refusal.GRANT_RECIPIENT_REFUSED"),
  },
  GRANT_NO_SECRET: {
    check: "C-125.15", where: at("templateReviewGrant", "is-template-grant"),
    translation: word("refusal.GRANT_NO_SECRET"),
  },
  NO_SUCH_GRANT: {
    check: "C-125.16", where: at("templateGrantRevoke", "is-template-grant-revoke"),
    translation: word("refusal.NO_SUCH_GRANT"),
  },
  NO_TEMPLATE_GRANT: {
    check: "C-125.17", where: at("noTemplateGrant", "is-no-template-grant"),
    translation: word("refusal.NO_TEMPLATE_GRANT"),
  },
  MACHINE_CANNOT_REVIEW_TEMPLATE: {
    check: "C-125.18", where: at("#machine", "is-template-member"),
    translation: word("refusal.MACHINE_CANNOT_REVIEW_TEMPLATE"),
  },
  NOT_IN_REVIEW: {
    check: "C-125.19", where: at("#notInReview", "is-not-in-review"),
    translation: word("refusal.NOT_IN_REVIEW"),
  },
  REVIEW_REFUSED: {
    check: "C-125.20", where: at("templateReview", "is-template-review"),
    translation: word("refusal.REVIEW_REFUSED"),
  },
  REVIEW_STALE: {
    check: "C-125.21", where: at("templateReview", "is-template-review"),
    translation: word("refusal.REVIEW_STALE"),
  },
  MACHINE_CANNOT_APPROVE_TEMPLATE: {
    check: "C-125.22", where: at("#machine", "is-template-member"),
    translation: word("refusal.MACHINE_CANNOT_APPROVE_TEMPLATE"),
  },
  TEMPLATE_NOT_APPROVED: {
    check: "C-125.23", where: at("templateApprove", "is-template-approve"),
    translation: word("refusal.TEMPLATE_NOT_APPROVED"),
  },
  NOT_AN_APPROVER: {
    check: "C-125.24", where: at("#notAnApprover", "is-not-an-approver"),
    translation: word("refusal.NOT_AN_APPROVER"),
  },
  APPROVER_IS_AUTHOR: {
    check: "C-125.25", where: at("templateApprove", "is-template-approve"),
    translation: word("refusal.APPROVER_IS_AUTHOR"),
  },
  REVIEWS_INSUFFICIENT: {
    check: "C-125.26", where: at("templateApprove", "is-template-approve"),
    translation: word("refusal.REVIEWS_INSUFFICIENT"),
  },
  TEMPLATE_REASON_REFUSED: {
    check: "C-125.27", where: at("templateRetire", "is-template-retire"),
    translation: word("refusal.TEMPLATE_REASON_REFUSED"),
  },
  TEMPLATE_ALREADY_ENDED: {
    check: "C-125.28", where: at("templateRetire", "is-template-retire"),
    translation: word("refusal.TEMPLATE_ALREADY_ENDED"),
  },
  TEMPLATE_NOTES_REFUSED: {
    check: "C-125.29", where: at("#textRefusal", "is-template-text"),
    translation: word("refusal.TEMPLATE_NOTES_REFUSED"),
  },
  COMMENT_REFUSED: {
    check: "C-125.30", where: at("templateComment", "is-template-comment"),
    translation: word("refusal.COMMENT_REFUSED"),
  },
  TEMPLATE_NOT_OFFERED: {
    check: "C-125.31", where: at("offeredVersion", "is-offered-version"),
    translation: word("refusal.TEMPLATE_NOT_OFFERED"),
  },
  TEMPLATES_STATE_REFUSED: {
    check: "C-125.32", where: at("templatesFor", "is-templates-state"),
    translation: word("refusal.TEMPLATES_STATE_REFUSED"),
  },
  /* ---- new in T45 (R15, R28; N858, Actions D8, v0.2 rule 11, §8), awaiting promotion's stamp; C-125.33 re-worded in
     T46 (R29), read by key ---- */
  TEMPLATE_NOT_REVIEWED: {
    check: "C-125.33", where: at("#profileRefusal", "is-profile-offered"),
    translation: FILING_TEMPLATES_WORDS["refusal.TEMPLATE_NOT_REVIEWED"],
  },
  TEMPLATE_COURT_PETITION: {
    check: "C-125.34", where: at("#courtPetition", "is-court-petition"),
    translation: word("refusal.TEMPLATE_COURT_PETITION"),
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(FILING_TEMPLATE_CHECKS, code) ? FILING_TEMPLATE_CHECKS[code] : null;
}
