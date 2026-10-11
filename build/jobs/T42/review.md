# review (T42)

**Status** · session_01Q9tRjtcTJSD2S8QXLJKLdc · depth 2 · WORKING · handled B3

## Completion (T42-23a; N839, K2608, K2614; B1, B2 (K2670), B3 (K2673))

**Read whole (the reading set is 400 KB, over 300 KB; K2304):** `requirements/review.md`; layer 8's row of `layers.md`; `requirements/case-account.md` whole (R7 and R12 are what this module calls); K2608, K2614; `case-account-split.md` §5; plan T42-23a and rule 4. I read the whole module myself: `index.mjs`, `checks.mjs`, `schema.mjs`, and every test file (`fixture.mjs`, `acts`, `copy`, `doors`, `invariants`, `approvals`). No worker summary (0 KB).

**Applied:**
1. **R33 (T42-23a):** `reviewOf` registers `reviewCommentsFor` with `caseAccount.registerReviewComments` (case-account R7), once, at creation. It no longer registers through case-authoring's pass-through (adopted, K2670). The `caseAccount` dep is reached lazily as `caseAccountOf(host)`, the one instance for the host (case-account R12), unless the caller hands one in. The header, the `caseAccount` getter and the R33 comments name case-account R7 in place of case-authoring R66 (`index.mjs`).
2. **Edge (B2, K2613's pattern):** `build/modules.json`: review's `uses` gains `case-account`. This is the one path outside review's own that I changed. The ownership check reports it, as B2 expects.

**Tests:**
- `fixture.mjs` hands review a `caseAccount` stand-in in case-account R7's shape: one reader taken; a second is refused `REVIEW_COMMENTS_DECLARED`; a reader that is not a function is refused `MALFORMED`.
- `approvals.test.mjs`, R33 registration: registered once with case-account and answers `reviewCommentsFor`. Controls: case-authoring's pass-through is given nothing, and a second `reviewOf` on the same host registers nothing more.
- `approvals.test.mjs`, new R33 test: against the real case-account (no stand-in), `reviewOf` on a host it is not given one for uses `caseAccountOf(host)` and holds its slot, so a second reader is refused `REVIEW_COMMENTS_DECLARED`. Control: on a host where review was never built, the slot is free.
- `acts.test.mjs` (2 sites): the bare hosts' stand-in `caseAuthoring.registerReviewComments` becomes `caseAccount.registerReviewComments`.

**Negative control (K874):** with the registration pointed back at `caseAuthoring`, both R33 registration tests fail (44 pass, 2 fail).

**Deferred:** none.

**Found in other modules (also in my REPORT):**
1. **plane, `accepted.test.mjs`:115 (R17, "case-import is built … before case-authoring"):** red with this change; green on `tranche/T42` @ 9581f7011a without it.
   - Cause: the plane builds `reviewOf(ctx)` (`store.mjs`:307) before `caseAuthoringOf(ctx, {publishSchedule})` (:313). Review now builds case-account at its start, and case-account declares `account_drafts` and `account_acceptances` (`case-account/index.mjs`:543). case-authoring's `CASE_AUTHORING_TABLES` (`case-authoring/schema.mjs`:88–89) still lists both, so record-core refuses case-authoring's whole declaration (`TABLE_DECLARED`) and case-authoring is never declared.
   - Fix: this is the fix B3 assigns case-authoring's job (drop the two tables from its list). It clears when T42-23 merges. It is not review's code.
   - Also: case-authoring ignores `declarePurge`'s answer (`case-authoring/index.mjs`:2968), so the refusal is silent. Flagged against case-authoring R28's share.
2. **plane wiring, an improvement this change brings:** before it, `reviewOf` built case-authoring at its own start through its getter, with no deps. The plane's `caseAuthoringOf(ctx, {publishSchedule})` at `store.mjs`:313 then got that instance, and its `publishSchedule` was dropped. Now review reaches case-authoring only lazily, at a copy's dry run, so the plane's deps are the ones used.
3. **Generated artifacts:** any source change stales the plane bundle (rule 4 (10)). I wrote none.

**Tests and checks** (on `tranche/T42` @ 9581f7011a merged):
- review (`test/m/review/`): `tests 46, pass 46, fail 0`.
- Users (P11):
  - notice-producers: 90/0
  - op-declarations: 128/0
  - control-plane: 216/0
  - `system/migrate-released.test.mjs`: 1/0
  - answer-envelope: 28/1, `families.test.mjs`:425. Inherited rule 4 (6): the same count on the tranche without this change.
  - plane: 165/1, `accepted.test.mjs`:115. Item 1 above: case-authoring's, clears at T42-23.
- `format: 147 modules, 146 requirements files; 0 failures`
- `architecture: 9 product files, 47 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 33 of 33 live requirement ids named by a test; 0 failures`
- `ownership: 6 files changed by review between tranche/T42 and HEAD; 1 failure`, which is `build/modules.json`, the edge B2 asked for (item 2 under Applied).

Size (session_01Q9tRjtcTJSD2S8QXLJKLdc): test runs 12, module lines 1310

## J1 · QUESTION

Started; read B1. Reading: my requirements whole, layer 8's row of `layers.md`, case-account's requirements whole (R7 and R12 are what I call), K2608, K2614, `case-account-split.md` §5, plan T42-23a, and my module's whole code (index 1008, checks 170, schema 127) and tests (fixture 221, acts 407, copy 459, doors 211, invariants 219, approvals 249), all read myself, no worker summary (0 KB summary).

QUESTION (one, the edge): `build/modules.json` on `tranche/T42` lists review's `uses` without `case-account`, so `checks/architecture.mjs review` will refuse my import of `caseAccountOf`. The file is BOB's. Best reading: BOB adds `case-account` to review's `uses` (as the split map §5 says: "edge `case-account` added"), alongside the CHANGE that tells me case-account merged. I carry on meanwhile on that reading.

Plan (my reading of R33 with case-account R7, R12): `reviewOf` registers `reviewCommentsFor` with `caseAccountOf(host).registerReviewComments` (reached lazily on the host, or a `caseAccount` dep a test passes), and no longer with case-authoring's pass-through (registering both would hit case-account's `REVIEW_COMMENTS_DECLARED` if the pass-through forwards). Nothing else changes. Prepared against case-account's requirements with a stand-in; I merge `tranche/T42` and run against the real module when your CHANGE arrives.

## J2 · REPORT

REPORT (case-authoring, plane; details in my record's "Found in other modules"):
1. plane `accepted.test.mjs`:115 (R17) is red with review's change and green on `tranche/T42` @ 9581f7011a without it. Review now builds case-account at boot (`store.mjs`:307, before case-authoring at :313). case-authoring's `CASE_AUTHORING_TABLES` (`schema.mjs`:88–89) still lists `account_drafts` and `account_acceptances`, so its `declarePurge` is refused `TABLE_DECLARED` and case-authoring is never declared. This is the fix your B3 gives case-authoring; it clears at T42-23's merge. Merge review after case-authoring, or accept the red until then.
2. case-authoring ignores `declarePurge`'s answer (`index.mjs`:2968), so that refusal was silent.
3. An improvement this change brings: before it, review built case-authoring at its own start with no deps, so the plane's `caseAuthoringOf(ctx, {publishSchedule})` at `store.mjs`:313 got that instance and its `publishSchedule` was dropped. Now review reaches case-authoring only lazily, so the plane's deps are the ones used.

## J3 · COMPLETE

COMPLETE (T42-23a). `reviewOf` registers `reviewCommentsFor` with `caseAccountOf(host).registerReviewComments` (case-account R7, R12) only. The edge is added on my branch: `build/modules.json`, review `uses` + `case-account` (B2; ownership reports it, the one failure). review 46/46, with a negative control (both R33 registration tests fail when the registration goes to case-authoring). format, architecture and coverage 0 failures. Users: notice-producers, op-declarations, control-plane, migrate-released green. answer-envelope `families.test.mjs`:425 is inherited (rule 4 (6)). plane `accepted.test.mjs`:115 is red until case-authoring's B3 fix (see my REPORT). Record: `build/jobs/T42/review.md` on `job/T42/review`.
