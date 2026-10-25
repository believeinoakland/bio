# case-account (T51)

**Status** · session_012jxbsx8F3dmr7RMWNhy3Pt · depth 2 · WORKING · handled B1

## Completion (T51-152)

**Entries applied.** T51-152, all parts:
- R17 (DEC-327): every key it names is read through `word(key, vars)`, the fields as `vars`: `BAD_ACCOUNT`'s seven (`.list`, `.toomany`, `.sentence`, `.extra`, `.text`, `.cites`, `.bias`, with `n` the sentence's number and `max` its bound), `BAD_STATEMENT_CITES` and its three (`part` the statement's key, its words apart), `ACCOUNT_CHECK_UNDETERMINED` (the throw's diagnostic no longer printed), `ACCEPT_MUST_REAUTHOR.account`, `ACCOUNT_CITES_COUNSEL_MATTER.sentence` (one sentence per named row, each on that row's `detail`, the refusal's `detail` the first's), the second sentences of `MACHINE_CANNOT_CHECK_ADVOCACY` and `ADVOCACY_NOT_OWN_PROJECT`, `BAD_REVIEW_COMMENTS` (`max`), `REVIEW_COMMENTS_UNREAD`, `REVIEW_COMMENT_NOT_FOUND`, `NO_SUCH_CASE`, `NO_SUCH_RUN`. `MALFORMED` and `REVIEW_COMMENTS_DECLARED` stay inline.
- Signed bytes (K1333): `reviewCommentBodyLines` now reads the left-out count and the two placeholders from their frozen rows (`case-account.document.left_out.one`, `.other`, `reviewer.unknown`, `date.unknown`). Rendering is byte-identical: before and after SHA-256 were compared on four inputs and are recorded in `t51-words.test.mjs`. No new version of the document text was needed or made; the document format is `case-grammar`'s and this module takes none.
- Words findings (11): `document.mjs:17` by `word`; `index.mjs:123,134,135,155,160,486` by the keys above; test copies `t45-judgment` 126-127, `t46` 91-92 now compare with `word`; the `t50-words` path copy now reads `LIST` from `words.mjs`.
- Plain findings (3): `index.mjs:521` and `:524` are R17's start-up wiring errors no member reads; left inline and listed in the REPORT. `index.mjs:733` (the `next` hint of a draft) is member-facing: `localize('case-account.index.next_member_writes_account', …)`, and the check's `next` beside it, `case-account.index.next_member_answers_flags`.
- Test copies of code sentences (1): see above.

**Deferred.** None.

**Found in another module.** `case-inputs` `index.mjs:260`, the words check's inline finding "what the outcome rests on is a list of cites in case-account R5's s…", is case-inputs' own. Nothing of this module's changed what its users read except the refusals' `detail` words (users' tests run below, green).

**Tests and checks.**
- `node --test bio-plane/test/m/case-account/*.test.mjs`: 48 pass, 0 fail (R17's new file `t51-words.test.mjs`: 5 tests, with controls).
- Users: `bio-plane/test/m/case-authoring`: 190 pass, 0 fail; `bio-plane/test/m/review`: 61 pass, 0 fail.
- `node checks/run.mjs /home/user/bio` (civicos-process pulled): format 0 failures; architecture 0 failures; the words check shows two findings in this module, the two wiring errors above (reported); coverage 17 of 17 live ids named, 0 failures for the module.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only (new code ids `case-account.index.next_member_*`, `part_*` are not in `rows.mjs` until the layer close); no refusal naming this module.
- `node checks/ownership.mjs /home/user/bio case-account tranche/T51 job/T51/case-account`: 0 failures.

Size (session_01F1hvUN6iXU1eehDzRVDcPr): test runs 9, module lines 925

## J1 · REPORT

Two strings I judge no member ever reads, left inline (R17 says MALFORMED and REVIEW_COMMENTS_DECLARED stay inline: start-up wiring errors), flagged by the words check's plain arm: bio-plane/src/case-account/index.mjs:523 "the review comments' reader is a function of {case, edition, viewer, draft}" (registerReviewComments, reason MALFORMED) and :526 "a reader of the case's review comments is already registered, once, at start" (reason REVIEW_COMMENTS_DECLARED). Please settle them with the design stream's unkeyed list (K3944). Also: case-inputs index.mjs:260 carries an inline words finding of its own ("what the outcome rests on is a list of cites in case-account R5's s..."); nothing else found in other modules. Signed bytes: reviewCommentBodyLines now reads the left-out count and the two placeholders from their frozen rows, rendering byte-identical (before/after SHA-256 on four inputs, recorded in t51-words.test.mjs); no new document-text version was needed, so none was added.

## J2 · COMPLETE

T51-152 applied whole: R17 (DEC-327 keys for every listed refusal), the 11 words findings, 3 plain (2 reported as wiring, 1 localized), 1 test copy. Module tests 48 pass; case-authoring 190 and review 61 (users) pass; format, architecture, coverage (17/17 ids) and ownership 0 failures; words check shows only the two reported wiring strings; setup-words --check shows only the stale-rows note (new code ids next_member_writes_account, next_member_answers_flags). Record: build/jobs/T51/case-account.md.
