# notice-producers (T43)

**Status** · session_0185KLN8pZrLcZSM86tkn1wY · depth 2 · RUNNING until 2026-10-11T11:40:26Z (queue's conclude-project and plane's migrate-released tests) · handled B1

## J1 · QUESTION

T43-13, my best readings; I carry on with them. One answer changes a line or two each.
1. **`{when}` in `ai.queue.limitreached*` for a month's limit.** `ai.when.month` is "on {month} 1", so the sentence reads verbatim "… pause until on November 1". Best reading: fill it verbatim, since R16 says no fill is written here. BOB to raise the wording with the design stream. (A day's limit reads "until tomorrow", which is fine.)
2. **`{date}` form.** I use DEC-191 (3)'s `date.daymonth` form, "{day} {month}" ("9 October"), with the month from `date.month.*`. It is written here only until N869 folds the key in T44. The day is the profile's local day (UTC when no zone is held, as today's dates). I use the same form for R17's `{date}` fills.
3. **A use limit whose use has no `ai.use.<use>.inline` key on `main`** (`enquire`, `read`, `account`, until DEC-191 lands at T44). Best reading: as K2720 adopted for ai-use, such a limit reads `ai.queue.limitreached.overall`.
4. **`queue.step-later-found.detail`'s `{date}` ("You looked for this on {date}").** steps' `laterFound` entry `{step, look, observation, at, questions, key}` (steps R23) and `step()` (R4) do not answer the look's own date. Best reading: fill it from the entry's `looked_at` when steps answers it, otherwise from the entry's `at`. I will send a REPORT asking steps to answer `looked_at`. `{what}` (and `{step}` in the cost kinds) is the step's `work`, from `steps.step({step, viewer})` (R4), or the step id when that read does not answer.
5. **`queue.project-quiet.detail`'s `{progress}` ("Where it stands: {progress}").** `quietPrompts` answers the objective, its condition, `progress` and `gaps` (investigation R18), but no sentence. Best reading: `{progress}` is the source's own text, the objective followed by each gap's `basis.says`, joined by "; ". No word of mine is added.
6. **Other fills, from the source's own facts.**
   - question-find: `{question}` is the question's title when the viewer sees it, otherwise its id; `{what}` is the find's `how`, otherwise its `ref`.
   - step-cost-shared: `{totals}` is "<amount> <currency>" joined by ", "; `{projects}` is the projects' names joined by ", ".
   - step-cost-message: `{member}` is the writer's handle (steps R15).
   - review-comment-left-out: `{case}` is the case's title, otherwise its id.
   - The `{owner}` of `ai.label.explored`: `ai.owner.group` for the group, the project's name, or the owner's handle for a member's own account (the viewer is that owner).
7. **Confirmed, no question:** ai-use R5's `limitsReached` cannot list an unjudged entry. R3's unjudged refusal writes nothing and carries no scope, unit or period, and R5 lists only limits first reached, each with scope, unit, period, `period_start` and `reached_at`. I also drop any entry whose period is not `day`/`month`, and treat `unreadable` as ai-use's failure. So `LIMIT_WHEN_FILL.unjudged` is not needed.

## J2 · QUESTION

Replaces J1. Everything in J1 stands except one fill in its point 6.

The `{owner}` of `ai.label.explored` for a member's own account is now `ai.account.own.inline` ("your own account"), not the owner's handle. That label reads "… enabled by your own account" and names no member. It goes only to the account's owner. For the group the fill stays `ai.owner.group`, and for a project it stays the project's name.

The work is built on all of J1's readings plus this one. It is complete and tested, and its COMPLETE follows. An ANSWER that changes a reading reopens the job for a line or two.

## J3 · REPORT

A finding in another module, `steps`, measured against its R23 and R4.

`queue.step-later-found.detail` says "You looked for this on {date} …" (DEC-189 (2)). The look's own date is not answered by `laterFound`, whose entry is `{step, look, observation, at, questions, key}` (R23). `step()`'s `later_found` entries (R4), `{look, observation, at}`, do not answer it either. `at` reads as when the arrival was noted, not when the member looked.

Proposed: steps R23's entry also answers `looked_at`, the instant of the look (the observation-log entry `look`). Notice-producers already reads `looked_at` when it is present (J1 (4)), so no change here follows.

No generated artifact went stale: notice-producers is bundled only into the plane bundle, which BOB regenerates at L11's close.
