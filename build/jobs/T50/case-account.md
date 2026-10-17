# case-account (T50)

**Status** · session_01NHpAEcWRV4sTETBcT8vUTP · depth 2 · WORKING · handled B1

## J1 · REPORT

Decisions made in this job, for BOB to record in `build/rulings.md` (this job writes only its own paths and record):

1. (N1132; DEC-315, K3707) The four DEC-315 refusals answer `detail` with words.json's own sentence for that code, read by key through setup-words' `word()`: `BAD_ACCOUNT`, `BAD_ACCOUNT_DRAFT`, `BAD_ACCOUNT_FRAMING`, `NO_SUCH_ACCOUNT_DRAFT`. Their `reason`, `field`, `allowed` and other fields are unchanged. The per-field English that said which part was wrong is no longer shown (see the list below).
2. (R16; N1132) words.json now holds all three of C-153's codes (`refusal.ACCOUNT_CITES_COUNSEL_MATTER`, `refusal.ADVOCACY_NOT_OWN_PROJECT`, `refusal.MACHINE_CANNOT_CHECK_ADVOCACY`), each with the same sentence the module had as a copy. So all three translations are read by key. R16's clause "the rows words.json does not hold keep theirs" has no row left to apply to; t46's R16 test pinned the old state and now reads the keys. Requirement wording is BOB's: please say whether R16 should be reworded.
3. (document.mjs) The three reviewer-comment sentences of the case document body are read by key. Their text is identical, so the signed bytes do not change (K1333).

Found in another module, not changed:
- `bio-plane/test/m/plane/roster.test.mjs` R5, R9, R45 (project-roster's ops in the route map) fails on the job branch's HEAD before my changes: the actual route list has `projectstakeset`, `projectstake`, `projectownersgone` that the expected list lacks. Checked in a temporary worktree of HEAD and removed. Owner: project-roster / plane.
- Whole-product `checks/run.mjs`: 33 coverage failures in other modules (for example screens-settings, screens-wizards, site, translations). None names case-account.

Gaps for the design lane (no key holds the sentence; kept as inline English, as before this job; listed for BOB):
- `accountShaped`: the field-level sentences of its `BAD_ACCOUNT` calls (now unused, kept as the text a key would hold) and the four `BAD_STATEMENT_CITES` sentences.
- `accountJudged`: `ACCOUNT_CHECK_UNDETERMINED`'s sentence. `accountDraftJudged`: the `ACCEPT_MUST_REAUTHOR` sentence about the draft's words.
- The counsel-matter refusal's per-case sentence (names the sentences and cites), and the second sentences of `MACHINE_CANNOT_CHECK_ADVOCACY` and `ADVOCACY_NOT_OWN_PROJECT` (their translations are by key).
- `reviewCommentsChosen`: `BAD_REVIEW_COMMENTS`, `REVIEW_COMMENTS_UNREAD`, `REVIEW_COMMENT_NOT_FOUND`. `registerReviewComments`: `MALFORMED`, `REVIEW_COMMENTS_DECLARED`. `#caseForDrafts`: `NO_SUCH_CASE`. `accountPropose`: `NO_SUCH_RUN`.
- `document.mjs`: the count sentence "N comment(s) was/were left out. A reviewer left out may file a response in the case's docket.", and the placeholders "(a reviewer)" and "(an unrecorded date)".

Plan rule 6 items for a Haiku job:
- (N1068) "labelled" to "labeled": no member-facing text of this module carries the spelling. The only occurrences are in comments and test titles, which I left.
- (N1073) hand-lists: the T48 census has no case-account row, and its tests import only the exports of other modules (record-grammar, record-core, membership and others), with no hand-listed ops, rows or words of theirs. Nothing to change.
