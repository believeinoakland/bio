# case-account (T51)

**Status** · session_012jxbsx8F3dmr7RMWNhy3Pt · depth 2 · COMPLETE · handled B1

## Completion (T51-152)

**Entries applied.** T51-152, all parts:
- R17 (DEC-327): every key it names is read through `word(key, vars)`, the fields as `vars`: `BAD_ACCOUNT`'s seven (`.list`, `.toomany`, `.sentence`, `.extra`, `.text`, `.cites`, `.bias`, with `n` the sentence's number and `max` its bound), `BAD_STATEMENT_CITES` and its three (`part` the statement's key, its words apart), `ACCOUNT_CHECK_UNDETERMINED` (the throw's diagnostic no longer printed), `ACCEPT_MUST_REAUTHOR.account`, `ACCOUNT_CITES_COUNSEL_MATTER.sentence` (one sentence per named row, each on that row's `detail`, the refusal's `detail` the first's), the second sentences of `MACHINE_CANNOT_CHECK_ADVOCACY` and `ADVOCACY_NOT_OWN_PROJECT`, `BAD_REVIEW_COMMENTS` (`max`), `REVIEW_COMMENTS_UNREAD`, `REVIEW_COMMENT_NOT_FOUND`, `NO_SUCH_CASE`, `NO_SUCH_RUN`. `MALFORMED` and `REVIEW_COMMENTS_DECLARED` stay inline.
- Signed bytes (K1333): `reviewCommentBodyLines` now reads the left-out count and the two placeholders from their frozen rows (`case-account.document.left_out.one`, `.other`, `reviewer.unknown`, `date.unknown`). Rendering is byte-identical: before and after SHA-256 were compared on four inputs and are recorded in `t51-words.test.mjs`. No new version of the document text was needed or made; the document format is `case-grammar`'s and this module takes none.
- Words findings (11): `document.mjs:17` by `word`; `index.mjs:123,134,135,155,160,486` by the keys above; test copies `t45-judgment` 126-127, `t46` 91-92 now compare with `word`; the `t50-words` path copy now reads `LIST` from `words.mjs`.
- Plain findings (3): `index.mjs:521` and `:524` are R17's start-up wiring errors no member reads; left inline and listed in the REPORT. `index.mjs:733` (the `next` hint of a draft) is member-facing: `localize('case-account.index.next_member_writes_account', …)`, and the check's `next` beside it, `case-account.index.next_member_answers_flags`.
- Test copies of code sentences (1): see above.

**Deferred.** None.

**Found in another module.** `build.mjs --check` of setup-words reports `bio-plane/src/setup-words/rows.mjs` stale: word 21966 (`control-plane.declared.subscriptionsignin`) has its row `interfacewords` in the registry and the file gives `subscriptionsignin`. Not this module's; for BOB.

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

## Completion (fix round 10, Wave A batch 4; START B2)

**Causes.** None placed to this job.

**Own fixture lines (START's three), done.**
- `advocacy.test.mjs:123` case-checker/checkAccountMalformed (FIX-E, mechanical): the stand-in `{ok: false, reason: "MALFORMED"}` is now `checkAccountMalformed()` from `bio-plane/test/m/case-checker/fixtures.mjs`.
- `fixture.mjs:74` retrieval/noSelection (FIX-E, mechanical): the stand-in `selectionResolve` is now `noSelection()` from `bio-plane/test/m/retrieval/fixtures.mjs` (the real retrieval over an empty store).
- `comments.test.mjs:51` review/review-copy-read (FIX-L): marker `// fixtures-contract: review review-copy-read` on the line above the value (value at line 52).

**Published.** `bio-plane/test/m/case-account/fixtures.mjs` (new): `reviewCommentsRegistrar()`, the real `registerReviewComments` (`register`, `malformed` = MALFORMED, `declared` = REVIEW_COMMENTS_DECLARED). Tested by `bio-plane/test/m/case-account/fixtures.test.mjs` (new, names R7). Its users (review 2, fixture.mjs:130-131) re-point in review's own job.

**Left at done, each named.**
- `comments.test.mjs:52` (review-copy-read): `contract-no-run` until review's `fixtures-run` merges (review, batch 5).
- Not in this START's list, not touched: case-disclosures/accountRefusals at `judgment.test.mjs:287`, `:288` and `t45-judgment.test.mjs:161`. Their provider (case-disclosures, batch 5) publishes it later; the check did not list them in this run.

**Markers added.** None `fixtures-own` or `fixtures-generic`.

**Outside my paths: REPORT to BOB.**
- `build/modules.json`: `case-account`'s `uses` needs `retrieval` (layer 5, earlier than case-account's layer 8). `fixture.mjs` now imports retrieval's published fixture, and `checks/architecture.mjs` fails on it until the edge is added. BOB's file; I have not edited it.

**Found in another module.** `checks/`-independent: `build/setup-words` `build.mjs --check` reports `bio-plane/src/setup-words/rows.mjs` stale at `control-plane.declared.subscriptionsignin` (the row for `interfacewords` is where the file expects `subscriptionsignin`). Not this module's; for BOB.

**Tests and checks.**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/case-account/*.test.mjs`: 49 pass, 0 fail (48 before, plus `fixtures.test.mjs`).
- `node build/plan/impact.mjs origin/tranche/T51 HEAD`: case-account 10 of 10; control-plane 1 of 108 (`declared-ops.test.mjs`), run: 7 pass, 0 fail.
- `checks/fixtures.mjs /home/user/bio case-account --list`: 1 finding left, `contract-no-run` (comments.test.mjs:52, waits for review).
- `checks/format.mjs /home/user/bio`: 178 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio case-account`: 1 failure (the `uses` edge above).
- `checks/coverage.mjs /home/user/bio case-account`: 17 of 17 live ids named, 0 failures.
- `checks/words.mjs /home/user/bio case-account`: 0 failures.
- `checks/ownership.mjs /home/user/bio case-account tranche/T51 job/T51/case-account`: 0 failures.

Size (session_012jxbsx8F3dmr7RMWNhy3Pt): test runs 2, module lines 925

## J3 · REPORT

REPORT for BOB (fix round 10, Wave A batch 4, case-account). Outside my paths; not edited by me.

1. build/modules.json: add `retrieval` to case-account's `uses` (retrieval is layer 5, earlier than case-account's layer 8). bio-plane/test/m/case-account/fixture.mjs now imports retrieval's published fixture `noSelection` (the START's FIX-E line, fixture.mjs:74). checks/architecture.mjs fails on that import until the edge is declared: "imports bio-plane/test/m/retrieval/fixtures.mjs of retrieval, which case-account does not declare in uses". Nothing else in the module needs changing for it.

2. build/setup-words (found in another module): build.mjs --check reports bio-plane/src/setup-words/rows.mjs stale at word 21966 (control-plane.declared.subscriptionsignin). Not this module's.

Record: build/jobs/T51/case-account.md (section "Completion (fix round 10, Wave A batch 4; START B2)").

---
_Generated by [Claude Code](https://claude.ai/code)_

## J4 · COMPLETE

COMPLETE: fix round 10, Wave A batch 4 (case-account). Full record: build/jobs/T51/case-account.md, section "Completion (fix round 10, Wave A batch 4; START B2)".

Own lines, all three done:
- advocacy.test.mjs:123 case-checker/checkAccountMalformed (FIX-E): stand-in replaced by the provider's fixture.
- fixture.mjs:74 retrieval/noSelection (FIX-E): stand-in replaced by retrieval's noSelection() fixture.
- comments.test.mjs:51 review/review-copy-read (FIX-L): marker `// fixtures-contract: review review-copy-read` placed above the value (value at line 52).

Published: bio-plane/test/m/case-account/fixtures.mjs, reviewCommentsRegistrar() (real registerReviewComments: register, malformed = MALFORMED, declared = REVIEW_COMMENTS_DECLARED), tested by fixtures.test.mjs (new, R7). Users: review 2 (its own job re-points fixture.mjs:130-131).

Markers added: no fixtures-own or fixtures-generic markers.

Left at done, named: comments.test.mjs:52 review-copy-read, contract-no-run until review's fixtures-run merges (review, batch 5).

Tests and checks:
- module tests (node --test bio-plane/test/m/case-account/*.test.mjs): 49 pass, 0 fail.
- impact: case-account 10 of 10; control-plane declared-ops.test.mjs: 7 pass, 0 fail.
- fixtures check (case-account --list): 1 finding left, the contract-no-run above.
- format: 178 modules, 0 failures. coverage: 17 of 17 live ids named, 0 failures. words: 0 failures. ownership: 0 failures.
- architecture: 1 FAILURE, needs BOB: retrieval must be in case-account's uses in build/modules.json (see REPORT).

Size (session_012jxbsx8F3dmr7RMWNhy3Pt): test runs 2, module lines 925
---
_Generated by [Claude Code](https://claude.ai/code)_
