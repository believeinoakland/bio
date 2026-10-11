# case-authoring (T42)

**Status** · session_017gKhVp4wij8NKw7oL1jXhs · depth 2 · COMPLETE · handled B3

## Completion

**Entry.** T42-23 (N839, K2608, K2614). Applied, first prepared against `requirements/case-account.md`, then run against the merged module (below):
- `src/case-authoring/index.mjs`: the moved bodies are deleted (the account constants, `citeOf`, `citesOf`, `accountShaped`, `citeAddress`, `exclusionSentence`, `namedOrds`, `#accountDraftJudged`, `#accountJudged`, `#accountFlags`, `#citedFor`, `#reviewCommentsChosen` and its reader, `registerReviewComments`, `#caseForDrafts`, `#accountLabel`, `accountPropose`, `accountDrafts`, the `runs` slot and the `ai-runs` import, and the record-grammar imports only they used). `#publishCase` and `publishPreflight` now ask `this.account` (the `case-account` instance on the host) in R69's order: R5 after R65; R4 after R10; R6; R7; `acceptanceRecorded` after the document is stored. There are three one-line pass-throughs (`accountPropose`, `accountDrafts`, `registerReviewComments`) until T43 (N850). `caseAuthoringOf` creates `caseAccountOf(host)` eagerly (case-account R12; the map's doubt 4). The header is re-worded.
- `schema.mjs`: `account_drafts` and `account_acceptances` are removed, and `CASE_AUTHORING_TABLES` is the first two entries.
- `document.mjs`: `reviewCommentBodyLines` is removed and imported from `../case-account/document.mjs`, never copied (K1333).
- Tests: `fixture.mjs` builds `caseAccountOf` first, with the runs, inquiry and judged disclosures, exposed as `w.cacc`, and hands `caseAuthoringOf` no `runs`. In `account.test.mjs`, `ACCOUNT_FRAMINGS` is now imported from case-account, the R64 and R66 arms are re-tagged R69, and there are two new explicit R69 tests: the order, with a negative control at each seam; and the acceptance inside the act's transaction, the one instance and the pass-throughs. In `invariants.test.mjs`, R28 asserts the two tables and that the account tables are not owned here.

**Against the real case-account (B3; merged K2673).** I merged `tranche/T42`; the one conflict, `build/modules.json`, kept the tranche's case-account line and this branch's case-authoring line. The stand-in used before the merge was never committed and has been removed. The calls match case-account's interface: `accountShaped`, `accountDraftJudged`, `accountJudged`, `reviewCommentsChosen`, `acceptanceRecorded({caseId, edition, drafted, by, at})`, `accountPropose`, `accountDrafts`, `registerReviewComments`, and `reviewCommentBodyLines` from `document.mjs`. `CASE_AUTHORING_TABLES` no longer lists `account_drafts` or `account_acceptances` (map §7).

**Tests (P11).**
- case-authoring: 183 tests, 183 pass, 0 fail. The two new R69 tests are included, each with a negative control.
- Users and the provider:
  - case-account 21/21
  - review 45/45
  - affordances 232/232
  - op-declarations 128/128
  - control-plane 216/216
  - plane 166/166
  - answer-envelope 28/29. The red, `test/m/answer-envelope/families.test.mjs:425`, is accepted red 6; it is the same with this change stashed.

**Checks.**
- format: 0 failures.
- architecture: 168 relative imports, 0 not judged, 0 failures.
- coverage: 51 of 51 live ids named, 0 failures.
- ownership: 1 failure, `build/modules.json`, which is outside this module's paths. That is the edge edit BOB directed (B2, B3; K2670), listed below for BOB to check.

**Edges in `build/modules.json` (B2, B3; K2670).** case-authoring's `uses` gains `case-account` (after `case-disclosures`) and loses `ai-runs`; review's `uses` gains `case-account` (before `case-authoring`).

**Size.** case-authoring is 3,703 lines over its own path (`index.mjs` 2,662), down from 4,139.

**Deferred.** None. T43 deletes the three pass-throughs once review, control-plane and plane re-point (N850).

**Found in other modules.** None new. answer-envelope's red is already accepted (rule 4 (6)).

**Reading (mechanics §17; START 1,345 KB, over 300 KB).**
- I read these whole myself:
  - `requirements/case-authoring.md` and `requirements/case-account.md`;
  - layer 8's row and section of `layers.md`;
  - `extraction/case-account-split.md` (whole, so §3, §4, §6 and §7 included), and K2608 and K2614;
  - plan entry T42-23 and the opening's rules;
  - `src/case-authoring/index.mjs` (3,047 lines), `schema.mjs`, `document.mjs`'s changed parts;
  - `test/m/case-authoring/fixture.mjs`, `account.test.mjs` and `invariants.test.mjs`.
- A worker read the rest whole and wrote a 9,026-byte summary citing file and line: `document.mjs`, `checks.mjs`, `searched.mjs` and the 22 other test files. None uses a moved name. `tensions.test` uses `w.runs` for contradiction's gate, which stays. `carries.test` 65/75 counts tables across a publish, which still holds because the fixture creates case-account's tables first.



## J1 · REPORT

Prepared T42-23 against requirements/case-account.md and pushed (901399311f): moved bodies and tables deleted, publishCase/publishPreflight ask case-account in R69's order, three pass-throughs kept, caseAccountOf created eagerly, fixture builds caseAccountOf first, explicit R69 tests with negative controls. Verified against an uncommitted stand-in copied per the map §2 (since deleted): case-authoring 183/183; review, affordances, op-declarations, control-plane, plane all green; answer-envelope 28/29, the red families.test.mjs:425 is accepted red 6 (same with my change stashed). Checks 0 failures. For BOB: modules.json case-authoring uses still lists ai-runs and lacks case-account (BOB's edge). Waiting on case-account's CHANGE to merge tranche/T42 and re-run against the real module.

Size (session_017gKhVp4wij8NKw7oL1jXhs): test runs 27, module lines 3703
