/* review's refusal rows (requirements: `build/requirements/review.md`, R1–R7, R10, R18, R23). DEC-49: every refusal
 * this module answers carries its code, its catalogue row and the member's translation.
 *
 * Moved here from the check catalogue with their ids and translations unchanged (K6, R23): C-87.1–C-87.11
 * (`REVIEW_COPY_CHECKS`) and C-32.16 (`MACHINE_CANNOT_REVIEW`, split from `MACHINE_FENCE_CHECKS` by number, as strength
 * took C-32.9). Only each `where` moved, to name the region in this module where the refusal is minted. */

const at = (fn, region) => `src/review/index.mjs ${fn} > ${region}`;

/* D-448 / C-87 (minted with `node tools/mintid.mjs C`, 2026-09-24) — THE REVIEW COPY'S ELEVEN REFUSALS,
 * which reached a member as machine words (`BIO_Publication_v0_1.md` §6A, §6A.4; DEC-49).
 *
 * WHAT WAS MEASURED, and by which instrument. UI-68 built §6A's surface on 2026-09-23 — an editor drafts,
 * an owner grants and revokes, a recipient reads and comments holding no credential — over a plane that
 * mints ELEVEN refusal codes for those acts, and NOT ONE of them held a catalogue row. So every one arrived
 * carrying the plane's authored `detail` and no `translation`, which is the state DEC-49 exists to make
 * impossible. This is D-507's finding one op over, and the same day: a surface lands, and the codes it can
 * now show turn out to have no sentence behind them.
 *
 * THE DEC-49 GUARD DID NOT AND COULD NOT SEE IT, which is the part worth keeping. `check-refusal-codes.mjs`
 * puts a code IN REACH by three rules, and TEN of these eleven satisfied none of them: R1 wants a catalogue
 * row (that is the defect), R2 wants a code LITERAL in `civicos-ui/app.html`, and R3 wants one in a harness
 * mock. UI-68's surface renders the plane's own `detail` and keys on NO code literal, so R2 is blind to it —
 * a surface can exist, and a member can meet the code on it, while the guard scores the code out of reach.
 * Measured on origin/main 9f8b69e6 before this landing: arm F sorted ten of the eleven into F6, *out of
 * reach, one site — needs a sentence WHEN its surface exists*, and its surface had existed for a day.
 * **SO "OUT OF REACH" IS A STATEMENT ABOUT THE WALK, NEVER ABOUT THE MEMBER**, and the guard's own header
 * says so ("in reach means a surface EXISTS today, never that a member could not otherwise meet the code").
 * A row here closes that by R1, which is the rule that does not depend on how a surface spells things.
 * D-542 carries the separate fix — teaching the walk reach-by-op, so the next surface built this way is
 * not invisible to it for a day. It is NOT done here on purpose: the reach rule is shared by every op in
 * the plane, so changing it moves the `reach` and `reachGap` ratchets for codes this item never touched,
 * and that is its own item with its own controls rather than a rider on this one.
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
    translation: 'Handing a draft of the group\'s case to a named person, or withdrawing it, is an act '
      + 'somebody in the group answers for, and the record names who did it. The credential that asked '
      + 'here is an automated one: it can help prepare the draft, and it cannot address it to anyone. '
      + 'Sign in to do this yourself.',
  },
  NO_REVIEW_COPY: {
    check: 'C-87.1',
    where: at('noReviewCopy', 'is-no-review-copy'),
    translation: 'No review copy answers to this request. A review copy is read through the grant issued for '
      + 'it, or by a member with standing in the project that produced it. A grant that was withdrawn, one '
      + 'whose draft has moved on to another edition, and one that never existed all answer the same way, so '
      + 'this answer tells you nothing about which of those is the case.',
  },
  REVIEW_UNKNOWN_ACT: {
    check: 'C-87.2',
    where: at('act', 'is-review-unknown-act'),
    translation: 'That is not one of the things you can do to a review copy. There are three: draft the case '
      + 'that will be shown, grant someone a copy to read, and withdraw a grant you issued.',
  },
  REVIEW_NOT_PROJECT_OWNER: {
    check: 'C-87.3',
    where: at('notReviewOwner', 'is-review-authority'),
    translation: 'You do not hold this act\'s authority over this project. Drafting the case needs permission '
      + 'to edit the project\'s work; handing the draft to someone outside the group, and withdrawing a copy '
      + 'you handed over, are the project owner\'s own acts. A project, draft or grant you hold no such '
      + 'authority over is answered exactly as one that does not exist, so this answer does not tell you '
      + 'whether it is there.',
  },
  REVIEW_NO_PROJECT: {
    check: 'C-87.4',
    where: at('#draft', 'is-review-no-project'),
    translation: 'Say which project this draft belongs to. A draft case is a piece of a project\'s work, the '
      + 'same as a published case is, and it is not held by anybody until it names one.',
  },
  REVIEW_DRAFT_CHANGES_PROJECT: {
    check: 'C-87.5',
    where: at('#draft', 'is-review-draft-changes-project'),
    translation: 'This draft belongs to a different project, and a case does not change hands. If the other '
      + 'project should be making this case, draft it there as a case of its own.',
  },
  REVIEW_NO_SUCH_CASE: {
    check: 'C-87.6',
    where: at('#draft', 'is-review-no-such-case'),
    translation: 'This project has published no case by that name. A draft may name an existing case, which '
      + 'makes the draft that case\'s next edition; a case another project published is answered exactly as '
      + 'one that does not exist. Leave the name off and the draft is a new case.',
  },
  REVIEW_DRAFT_TOO_LARGE: {
    check: 'C-87.7',
    where: at('#draft', 'is-review-draft-too-large'),
    translation: 'This draft\'s arguments are larger than the plane will store: the limit is 64 KiB, the same '
      + 'size publishing the case would accept. Nothing was saved. Material this large belongs in the '
      + 'documents and content the case rests on rather than in the draft itself.',
  },
  REVIEW_NO_RECIPIENT: {
    check: 'C-87.8',
    where: at('#grant', 'is-review-recipient'),
    translation: 'Say who this copy is for, in one line. Handing a draft to someone is an addressed act: the '
      + 'record says who it went to, and a grant addressed to nobody would leave no such record.',
  },
  REVIEW_NO_SECRET: {
    check: 'C-87.9',
    where: at('#grant', 'is-review-secret'),
    translation: 'The reading secret that would let this recipient open the copy was not set. That secret is '
      + 'made for you when the grant is issued, so this is a fault in the request rather than something you '
      + 'supply; nothing was issued. Try issuing the grant again.',
  },
  REVIEW_NO_GRANT: {
    check: 'C-87.10',
    where: at('#revoke', 'is-review-grant-named'),
    translation: 'Say which grant to withdraw, by the id you were given when it was issued. Nothing was '
      + 'withdrawn. This answer says only that no grant was named; it says nothing about which grants exist.',
  },
  REVIEW_NO_COMMENT_TEXT: {
    check: 'C-87.11',
    where: at('comment', 'is-review-comment-text'),
    translation: 'A comment has to say something, and at most 4000 characters of it. Nothing was recorded. '
      + 'What you have written is still yours to send once it is within that length.',
  },
});
