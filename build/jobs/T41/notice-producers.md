# notice-producers (T41)

**Status** · session_01Ktpm9VNdCcRPXAVDSh7PSu · depth 2 · WORKING · handled B3

## J1 · QUESTION

R16's words carry placeholders `words.json` gives no key for. My best reading, which I am building now (none is Bob's; tell me if any is wrong):

1. `ai.queue.limitreached`: `{account}` "Your group's account" / "Your own account" (from `ai.whose.group` / `ai.whose.own` + " account") or "<project name>'s account" for a project's (it names whose, never a member); `{period}`, `{when}` from ai-use's own fills (`LIMIT_PERIOD_FILL`, `LIMIT_WHEN_FILL`, `MONTH_NAMES`, imported from `ai-use/checks.mjs`, so the two modules say it one way); `{for_use}` " for <use name, lower case>" for a use's limit, "" for the overall one, " for each member" for a per-member one; `{Uses}` the use's name (`ai.use.<use>.name`) for a use's limit, "Uses counted in its overall limit" for the overall one, "Each member's uses" for a per-member one; `{date}` the local day of `reached_at` in the profile's zone.
2. `ai.queue.exploreask`: `{what}` from the ask; `{scope}` `ai.owner.group` ("the group") or the project's name; `{account}` as in 1, lower case.
3. `ai.queue.suspended`: `{project}` the project's name.
4. R17's `ai.label.explored`: `{owner}` `ai.owner.group`, the project's name, or the member's own handle (`words.json`'s note), only when `question-explorer.findsFor` answers `enabled_by` (its owners); to anyone else the find carries `label: "machine"` and no explored label (the words other members see are owed, NOTICE).
5. Each item's id is `<CLASS>::<kind>::<the source's own key>` (review's key already has that form and is used as given); `step-cost-message` has no key in `steps.costMessages`, so its key is the message's id.
6. The R16 "Ask" item's class is FINDING (queue R1), label `ask`, with the act `exploreapprove` worded by `act.owed_exploreapprove.label.queue`.

Nothing waits on the answer: I carry on.

## Completion

**Entry applied:** T41-54 (was T40-20), marks R1, R16, R17 (K2573), with B2's confirmation of J1 (K2574) and B3's classes (K2580).
- **R16** (`index.mjs` `#exploreAsks`, `#limitsReached`, `#accountsSuspended`, `#owner`, `#periodEnd`): one `explore-ask` (label `ask`, the act `exploreapprove` worded by `act.owed_exploreapprove.label.queue`) per entry of `ai-use.exploreAsksPending`, one Noticed `ai-limit-reached` per entry of `ai-use.limitsReached`, one Noticed `project-account-suspended` per entry of `credentials.projectAccountsSuspended`, each read as the viewer and keyed `FINDING::<kind>::<the entry's own key>` (K2488: never composed here). Words by key from `words.json` through a new `words.mjs` (`NOTICE_WORDS`, each `en` verbatim, checked against the file by test; `wordsOf` throws on a key it lacks, never a fallback). Fills as J1 (confirmed B2): `{period}`/`{when}` from ai-use's own fills (`LIMIT_PERIOD_FILL`, `LIMIT_WHEN_FILL`, `MONTH_NAMES`, imported). No member is named: a member's own account is `own` in the subject. A read answering `unreadable`, or not answering its list, is its provider's failure in `facts.failed`.
- **R17** (`#questionFinds`, `#laterFound`, `#stepsDue`, `#costShares`, `#costMessages`, `#milestones`, `#quietPrompts`, `#reviewLeftOut`, `#r17Item`): the ten kinds in B3's classes (OBLIGATION: `step-date-due`, `step-reminder`, `milestone-reminder`; the rest FINDING), each keyed `<CLASS>::<kind>::<source key>` (review's key, already that form, used whole; `step-cost-message`'s the message id, J1 (5)). `question-find` carries `mark: "Hint · machine work"` and, only when `findsFor` answers `enabled_by` (the paying account's owners, D64), `label` = `ai.label.explored` with `{owner}` filled (`ai.owner.group`, the project's name, or the member's handle); to anyone else `label: "machine"` and no account named.
- **R1**: `facts` gains `explore_ask`, `ai_limit`, `signin_suspended` (bound 200 each, `ACCOUNT_ITEMS_MAX`) and `question_find`, `step_later_found`, `step_due`, `step_cost_shared`, `step_cost_message`, `milestone`, `project_quiet`, `review_left_out` (bound 200 each, `INVESTIGATION_ITEMS_MAX`), each `{bound, truncated}`; `NOTICE_KINDS` gains the 13 kinds.
- **R2/R3 re-read against D54 (N822)**: no code change needed: both read only the projects the member participates in (joined or leaving) through R43's gate, so an administrator at a hidden project's `EXISTENCE` is never asked about nor told its contents. No existing test assumed such sight. New tests state it with a negative control (joined, the same administrator receives it).
- **The retired ceiling** (START): `heldBackWords` and `standing.test.mjs` re-pointed from `AI_USE_CEILING_REACHED`/`ceiling` to answers' `condition: "limit"` (ai-use's `AI_LIMIT_REACHED`, its words as answers carries them).

**Reading set:** measured as mechanics §3 asks: my requirements (21 KB), my code and tests (157 KB), the Purpose of each used module and the services my Uses names (52 KB, extracted whole per service), layer 11's row: about 240 KB, under 300 KB, so I read it all whole myself. No worker summary.

**Words owed to the UX design stream (B2, J1 (4)), for BOB to pass on:** (1) what a member who does not own the paying account sees on a find made while exploring (today `label: "machine"`, the explorer's own `says` sentence, no `ai.label.explored`); (2) the summary and detail of each R17 kind (`question-find`, `step-later-found`, `step-date-due`, `step-reminder`, `step-cost-shared`, `step-cost-message`, `milestone-overdue`, `milestone-reminder`, `project-quiet`, `review-comment-left-out`), which say their meaning plainly in this module's own words until keys are given; (3) `ai.queue.limitreached`'s fills with no key (`{for_use}` " for each member"; `{Uses}` "Uses counted in its overall limit", "Each member's uses"; `{account}` "Your group's account", "<project>'s account", "Your own account"), and `ai.queue.exploreask`'s `{scope}` for a member's own account ("your own questions").

**Deferred:** none.

**Found in other modules (REPORT J2):**
- `queue` (its job later in L11): `test/m/queue/noticed.test.mjs`:295 is red (`facts.failed` `["question-explorer"]`): its `notices` factory hands stand-ins only for R2–R6's providers, so this module reaches `questionExplorerOf(host)` lazily on queue's partial test world, where leg-earning's migration fails (`no such column: grade_source`). The fix is queue's: hand stand-ins (or real instances) for `aiUse`, `steps`, `questionExplorer`, `investigation` and `review`. 127/128 otherwise; on `tranche/T41` it is 128/128.
- `plane` (T41-63): `store.mjs`:350 composes `noticeProducersOf` with membership, people, moneyChecks, duties, answers, inquiry only. It should also hand `aiUse`, `steps`, `questionExplorer`, `investigation`, `review` (and credentials, following, standards, fileSafety, provenance) as it composes them. Each factory keeps the first instance per storage, so a bare instance this module reaches first would shadow the plane's composed one (e.g. ai-use without its zone, question-explorer without its run deps). Plane's suite: 147 pass / 8 fail before and after this change, the same 8 tests (inherited).
- Generated artifacts: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is staled by this change (BOB regenerates at layer close).

**Final `uses`:** `modules.json`'s list plus `steps`, `question-explorer`, `investigation`, `review` (R17; START). With those four added (tried locally, not committed) architecture is 0 failures; without them its 8 failures are exactly those four edges (index.mjs and the R17 test's fixtures).

**Tests and checks run:**
- `node --test bio-plane/test/m/notice-producers/`: `tests 90, pass 90, fail 0` (new: `accounts.test.mjs` R16, `investigation.test.mjs` R17; R1's interface test now carries every R16 and R17 kind and bound; D54 tests in `checks.test.mjs` and `detectors.test.mjs`).
- Users: `queue` 127/128 (the one red above, queue's to fix); `plane` 147/8, identical to the base's.
- `checks/format.mjs`: 0 failures; `checks/architecture.mjs notice-producers`: 8 failures, each one of the four `uses` edges for BOB to add (0 with them); `checks/coverage.mjs notice-producers`: 17 of 17 live ids named, 0 failures; `checks/ownership.mjs notice-producers tranche/T41`: 0 failures.

Size (session_01Ktpm9VNdCcRPXAVDSh7PSu): test runs 20, module lines 1,297
