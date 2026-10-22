/* review's refusal rows (requirements: `build/requirements/review.md`, R1–R7, R10, R18, R23, R27, R30, R31, R34). DEC-49: every refusal
 * this module answers carries its code, its catalogue row and the member's translation.
 *
 * Moved here from the check catalogue with their ids and translations unchanged (K6, R23): C-87.1–C-87.11
 * (`REVIEW_COPY_CHECKS`) and C-32.16 (`MACHINE_CANNOT_REVIEW`, split from `MACHINE_FENCE_CHECKS` by number, as strength
 * took C-32.9). Only each `where` moved, to name the region in this module where the refusal is minted. C-87.12
 * (`MINT_EXHAUSTED`, R27), added here in T12 (N306, K392), is RETIRED (N322, K275): no free opaque id is one condition
 * minted by four modules, so its one row is record-core's C-59.6, beside `mintOpaqueId`, and this module answers
 * through record-core's `mintExhausted` (its R62). The number C-87.12 is not reused. */

import { word } from '../setup-words/index.mjs';

const at = (fn, region) => `src/review/index.mjs ${fn} > ${region}`;

/* D-448 / C-87 (its number minted 2026-09-24) — THE REVIEW COPY'S ELEVEN REFUSALS (a twelfth, C-87.12, joined them in T12 and retired into record-core's C-59.6 in T13),
 * which reached a member as machine words (`BIO_Publication_v0_1.md` §6A, §6A.4; DEC-49).
 *
 * WHAT WAS MEASURED, and by which instrument. UI-68 built §6A's surface on 2026-09-23 — an editor drafts,
 * an owner grants and revokes, a recipient reads and comments holding no credential — over a plane that
 * mints ELEVEN refusal codes for those acts, and NOT ONE of them held a catalogue row. So every one arrived
 * carrying the plane's authored `detail` and no `translation`, which is the state DEC-49 exists to make
 * impossible. This is D-507's finding one op over, and the same day: a surface lands, and the codes it can
 * now show turn out to have no sentence behind them.
 *
 * THE DEC-49 GUARD DID NOT AND COULD NOT SEE IT, which is the part worth keeping. The refusal-code guard of the time
 * (deleted in T20; refusal rows are now held and tested per module) put a code IN REACH by three rules, and TEN of
 * these eleven satisfied none of them: R1 wanted a catalogue row (that is the defect), R2 wanted a code LITERAL in the
 * old single-page surface, and R3 wanted one in a harness mock. UI-68's surface renders the plane's own `detail` and
 * keys on NO code literal, so R2 was blind to it: a surface could exist, and a member could meet the code on it,
 * while the guard scored the code out of reach. Measured on origin/main 9f8b69e6 before this landing: arm F sorted ten
 * of the eleven into F6, *out of reach, one site, needs a sentence WHEN its surface exists*, and its surface had
 * existed for a day. **SO "OUT OF REACH" IS A STATEMENT ABOUT THE WALK, NEVER ABOUT THE MEMBER**, and the guard's own
 * header said so ("in reach means a surface EXISTS today, never that a member could not otherwise meet the code").
 * A row here closes that by R1, which is the rule that does not depend on how a surface spells things.
 * D-542 carried the separate fix, teaching the walk reach-by-op, which went with the guard.
 *
 * THE ELEVENTH IS A DIFFERENT SHAPE and is not rounded in with the ten. `NO_REVIEW_COPY` sat in arm F's F4
 * MULTI-SITE partition, not F6, because its literal occurs twice: the MINT in `noReviewCopy` and a READ in
 * `index.mjs` (`r?.reason === "NO_REVIEW_COPY" ? 404 : 400`), which the walk's site matcher cannot tell
 * apart from a second mint. There is exactly ONE mint, so one row with one `where` is honest; the F4 count
 * falls by one because this code leaves the untranslated set, not because the walk lost sight of a site.
 *
 * TWO OF THE ELEVEN ARE MINTED BY A SHARED HELPER AND THAT IS THE DESIGN, not a site to split.
 * `noReviewCopy` is THE ONE DEAD ANSWER (a revoked grant, a moved draft, a secret that never existed and a
 * draft the caller has no standing in are one answer, built from no argument, so the bytes cannot vary with
 * anything the caller sent); `notReviewOwner` is the one answer for the three authoring acts, varying only
 * with the act the CALLER chose. Each has ONE region around its one mint, which is the smallest span in
 * which its refusal is enforced — the rule a `where` states.
 *
 * ADDITIVE ON THE WIRE, exactly as IC-270 was for `op=statementack`: `reason`, each site's own `detail` and
 * its per-site keys (`act`, `caseId`) are UNCHANGED, and `code`, `check` and `translation` join them. That
 * matters here beyond politeness: `index.mjs` branches on `reason === "NO_REVIEW_COPY"` to pick 404 over
 * 400, and a rename would have changed a status code a caller already reads. */
export const REVIEW_COPY_CHECKS = Object.freeze({
  /* REC-126 / DEC-31 / IC-145 — THE REVIEW COPY's three authoring acts (draft, grant, revoke) share ONE fence,
     because they are one doctrine: the act is ADDRESSED and ATTRIBUTED (`BIO_Publication_v0_1.md` §6A.2), so the
     record must name the person who handed the group's draft to somebody. One row, one region: the three acts enter
     through `act`, and the fence stands at that door before any act is chosen. Moved from `MACHINE_FENCE_CHECKS`,
     split by number and unchanged (R23). */
  MACHINE_CANNOT_REVIEW: {
    check: 'C-32.16',
    where: at('act', 'is-machine-review'),
    translation: word('refusal.MACHINE_CANNOT_REVIEW'),
  },
  NO_REVIEW_COPY: {
    check: 'C-87.1',
    where: at('noReviewCopy', 'is-no-review-copy'),
    translation: word('refusal.NO_REVIEW_COPY'),
  },
  REVIEW_UNKNOWN_ACT: {
    check: 'C-87.2',
    where: at('act', 'is-review-unknown-act'),
    translation: word('refusal.REVIEW_UNKNOWN_ACT'),
  },
  REVIEW_NOT_PROJECT_OWNER: {
    check: 'C-87.3',
    where: at('notReviewOwner', 'is-review-authority'),
    translation: word('refusal.REVIEW_NOT_PROJECT_OWNER'),
  },
  REVIEW_NO_PROJECT: {
    check: 'C-87.4',
    where: at('#draft', 'is-review-no-project'),
    translation: word('refusal.REVIEW_NO_PROJECT'),
  },
  REVIEW_DRAFT_CHANGES_PROJECT: {
    check: 'C-87.5',
    where: at('#draft', 'is-review-draft-changes-project'),
    translation: word('refusal.REVIEW_DRAFT_CHANGES_PROJECT'),
  },
  REVIEW_NO_SUCH_CASE: {
    check: 'C-87.6',
    where: at('#draft', 'is-review-no-such-case'),
    translation: word('refusal.REVIEW_NO_SUCH_CASE'),
  },
  REVIEW_DRAFT_TOO_LARGE: {
    check: 'C-87.7',
    where: at('#draft', 'is-review-draft-too-large'),
    translation: word('refusal.REVIEW_DRAFT_TOO_LARGE'),
  },
  REVIEW_NO_RECIPIENT: {
    check: 'C-87.8',
    where: at('#grant', 'is-review-recipient'),
    translation: word('refusal.REVIEW_NO_RECIPIENT'),
  },
  REVIEW_NO_SECRET: {
    check: 'C-87.9',
    where: at('#grant', 'is-review-secret'),
    translation: word('refusal.REVIEW_NO_SECRET'),
  },
  REVIEW_NO_GRANT: {
    check: 'C-87.10',
    where: at('#revoke', 'is-review-grant-named'),
    translation: word('refusal.REVIEW_NO_GRANT'),
  },
  REVIEW_NO_COMMENT_TEXT: {
    check: 'C-87.11',
    where: at('comment', 'is-review-comment-text'),
    translation: word('refusal.REVIEW_NO_COMMENT_TEXT'),
  },
  /* T41 (D60; R30, R31): the approvals a group may require before any of its cases is signed. C-87.12 stays retired
     and is not reused; the family continues at C-87.13. Their member words are BOB's draft, the UX stream's to revise. */
  APPROVAL_RULE_BAD_APPROVERS: {
    check: 'C-87.13',
    where: at('approvalRuleSet', 'is-approval-rule-approvers'),
    translation: word('refusal.APPROVAL_RULE_BAD_APPROVERS'),
  },
  CASE_NOT_AN_APPROVER: {
    check: 'C-87.14',
    where: at('caseApprove', 'is-not-an-approver'),
    translation: word('refusal.CASE_NOT_AN_APPROVER'),
  },
  APPROVAL_NO_SUCH_DOCUMENT: {
    check: 'C-87.15',
    where: at('caseApprove', 'is-approval-document'),
    translation: word('refusal.APPROVAL_NO_SUCH_DOCUMENT'),
  },
  APPROVAL_REASON_TOO_LONG: {
    check: 'C-87.16',
    where: at('caseApprove', 'is-approval-reason'),
    translation: word('refusal.APPROVAL_REASON_TOO_LONG'),
  },
  /* T48 (R34; N1038; DEC-100): a reader's end date that is no instant, or no later than the act. BOB's draft words,
     re-wordable by the design stream. The family continues at C-87.17 (C-87.12 stays retired). */
  REVIEW_BAD_UNTIL: {
    check: 'C-87.17',
    where: at('#grant', 'is-review-until'),
    translation: word('refusal.REVIEW_BAD_UNTIL'),
  },
  /* fix round 6 (G12c): a batch read longer than its bound. The family continues at C-87.18. Its member words are the nearest held
     row's (REVIEW_DRAFT_TOO_LARGE) until the design stream words `refusal.REVIEW_BATCH_TOO_LARGE` (T52, K4269). */
  REVIEW_BATCH_TOO_LARGE: {
    check: 'C-87.18',
    where: at('batchTooLarge', 'is-review-batch-too-large'),
    translation: word('refusal.REVIEW_DRAFT_TOO_LARGE'),
  },
});
