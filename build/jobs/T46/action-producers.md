# action-producers (T46)

**Status** · session_01RtAxjH3XdN1UyVL6cBpQ1K · depth 2 · COMPLETE · handled B2

## Completion

**Read whole** (P20; mechanics §6 step 2): the requirements (public and private); the public parts of every module in Uses (membership, civil-time, record-grammar, record-core, actions, action-holds, action-clocks, escalation, action-plans, plan-work, filing-templates, local-facts, following) as merged on `tranche/T46`; layer 11's contract in `build/layers.md`; my entry in `build/plan/current.md`; this module's code (`index.mjs`, `words.mjs`) and every test, not only what changed. `words.json`'s keys read for R23.

**Entries applied (T46-46).**
- N924 (R21, R11): R1's item offers `actioncorrespond`, then the met-or-waived door, then take-up. The door is `{id: "promote", label: door.clockentrystate, weight: "single", revision: {action, entry, field: "status", to: ["met", "waived"]}}`: actions' revision of that one entry's status, a plain act `queue` decorates (its R17), so a machine caller is offered none. `DOORS` updated.
- N926 (R22): an entry `overdueClocks` answers with `noticed_by` raises R1's item when `following.dutyWatchEnd(duty)` answers a day before the read's local day in the action's zone; null, a day not passed, a non-day, a throw or no zone draw nothing. Memoised per duty per read; the basis names `noticed_by` and `duty_watch_end`. R9 reads the same rule (below).
- N913 (R23): summaries by key with `summary_key` (R1 `.ours.summary`, `.theirs.summary`; R9 summary and detail; R10 summary, and detail where `watchanswer` is offered; R12 `plan-review-due.summary`, `plan-look-again.summary`; R5's docket summary), `detail_key` where the detail is keyed; every door label `door.<op>` (`actionholdrelease`, `factconfirm`, `templatereview` keep theirs). `words.mjs` holds each `en` verbatim, a test holding it equal to `words.json`. Kept and returned to BOB, as R23 and K2996 say: `.theirs.detail`, `plan-look-again.detail`, `litigation-hold.docket.detail`, the relied-on watch detail, and (J1, K2996, until N968) `.ours.detail` and `plan-review-due.detail`; canon's `noreply` unchanged (K2996 (3)). The interim keys `.ours`/`.theirs` and `WORDS_OWED` are gone (`WORDS_CANON`, `KEPT` exported in their place).

**Flaw fixed in this module.** R9 (`#routedItems`) skipped an overdue entry carrying `noticed_by` but then added the same entry from `pendingClocks`' page (which carries no `noticed_by`), so a departure's item could name an entry the duty's Noticed item stands for. It now skips the entry's pending copy too, and names it once R22's rule draws it.

**Deferred.** None of my module's. `.ours.detail` and `plan-review-due.detail` wait on N968 (T47: `action-clocks` answering the venue, `plan-work` R4's due read answering the recurrence and the last review's day).

**Found in other modules** (no REPORT needed beyond J1, answered K2996): `action-clocks.overdueClocks` answers no venue, `plan-work.planReviewsDue` no recurrence or last-review day (N968). `answer-envelope`'s `catalogue-end` test is red on C-124.30 (`SCENARIO_OUT_OF_RANGE`), the pin `action-plans` R47 opens (T46 rule 5); not this module's, and red without my change.

**Tests and checks.**
- `node --test bio-plane/test/m/action-producers/`: 42 pass, 0 fail (new `t46.test.mjs`: R21, R11; R22; R22 with R9; R23 sentences; R23 with R11 door labels; R23 words table; each with a control). Existing tests amended where R21/R23 change them (doors, labels, R1's words).
- Users: `queue-producers` 74 pass, 0 fail; `queue` 142 pass, 0 fail; `plane/t45.test.mjs` 14 pass, 0 fail; `answer-envelope` 31 pass, 1 fail (the inherited C-124.30 pin above).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio action-producers`: 0 failures. `checks/coverage.mjs bio action-producers`: 23 of 23 live ids named, 0 failures. `checks/ownership.mjs bio action-producers tranche/T46`: 0 failures. `checks/run.mjs`: format 0, architecture 0 failures; coverage 15 failures, none this module's (other L11 jobs' modules still open); channels 0.

Size (session_01RtAxjH3XdN1UyVL6cBpQ1K): test runs 9, module lines 1445

## J1 · QUESTION

Three R23 sentences cannot be filled "from the item's own facts as today"; one key differs from canon. My best reading of each, which I am building now (nothing waits on the answer unless you choose otherwise):

1. **`queue.action-clock-overdue.ours.detail`** ("Your group's deadline to {what} with {venue} was {date} …"): `action-clocks.overdueClocks` (its R3) answers no venue, and Uses gives me no read of the action's addressee (`actions`: `place`, `zoneOf` only). Best reading: R1's group arm reads `.ours.summary` by key now and keeps its present detail, returned to you as a fifth kept sentence, until `overdueClocks` answers the venue (or you add `actions.actionRead` to my Uses, R9's "role, body" as `{venue}`). Say which you want.
2. **`queue.plan-review-due.detail`** ("… reviewed every {rhythm}, and nothing has been reviewed since {date} …"): `plan-work.planReviewsDue` (its R4) answers `{plan, project, member, due, day, zone}`: neither the recurrence nor the last review's day nor the day the rhythm was set. Best reading: `.summary` by key now; the detail keeps its present text, returned to you, until `plan-work` R4's due read answers the recurrence and that day (a requirement change for `plan-work`; I report it as a gap).
3. **`queue.action-clock-overdue.noreply`**: R23 says canon's question "is unchanged"; `words.json` now holds it as "No reply recorded by {date}" (note: "canon; Noticed"), while R1 and my tests hold canon's "Noticed: no reply recorded by {date}". Best reading: unchanged means unchanged: the item keeps "Noticed: no reply recorded by {date}" under that key (it now differs from words.json's `en`). If you mean words.json's sentence (the "Noticed" label then the screen's), say so and I switch it.

Also, for your record (no answer needed): `action-holds` R14 is retired (K2981), so R23's stated reason for keeping `queue.litigation-hold.docket.detail` ("a release where no hold was placed is refused") no longer holds; the sentence is still kept because the docket arm's one door places a hold (R5) and "say why none is needed" offers a release it does not carry.
