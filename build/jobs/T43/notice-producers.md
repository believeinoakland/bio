# notice-producers (T43)

**Status** · session_0185KLN8pZrLcZSM86tkn1wY · depth 2 · RUNNING until 2026-10-11T11:40:26Z (queue's conclude-project and plane's migrate-released tests) · handled B2

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

## J4 · COMPLETE

T43-13 is done on `job/T43/notice-producers`: one work commit over `tranche/T43`, module files only.

**Entries applied (N856, DEC-189; K2704, K2720)**
- **R16's limit-reached item is now read by scope:**
  - `ai.queue.limitreached` for a use;
  - `.overall` for the overall limit;
  - `.member` for the per-member limit.

  Every fill is read by key: `{account}` from `ai.account.group|project|own` (`{project}` is the project's name); `{period}` from `ai.period.*`; `{use}` from `ai.use.<use>.inline`; `{when}` from `ai.when.day`, or from `ai.when.month` with the next period's `date.month.*`. `{date}` is the profile's local day, written "{day} {month}" with the month from `date.month.*`.
- **The Ask item:** `{scope}` comes from `ai.scope.group|own` or the project's name, and `{account}` from `ai.account.<kind>.inline`. Its act reads `act.exploreapprove.label.queue`, which replaces the retired `act.owed_…` key.
- **R17:** each of the ten kinds' `summary` and `detail` now reads `queue.<kind>.summary|detail`, filled from the source's own facts. A step's work comes from `steps.step` (R4). The explored label is `ai.label.explored` (with `{owner}`) for the paying account's owners, and `ai.label.explored.member` for every other viewer.
- **`NOTICE_WORDS` re-read from `words.json`:** 60 keys, verbatim. The `{for_use}`/`{Uses}` fills and `LIMIT_*` constants are gone, and so is the import of `ai-use/checks.mjs`; no notice-producers file imports it now (grep).
- **Unjudged entries:** confirmed that `limitsReached` never lists one (J1 (7)). An entry whose period, day or period end cannot be read is no item.
- **Readings:**
  - J1 (1)–(7) as B2 adopted them (K2725).
  - J2 replaces one fill of J1 (6): `{owner}` for a member's own account is "your own account" (`ai.account.own.inline`), not a handle.
  - B2 answered J1 after J2 replaced it, so it was read, not applied; the built work matches it except for J2's fill.
- **Nothing deferred.**

**Found in another module:** J3 (steps R23 should answer the look's `looked_at`). Generated artifacts: only the plane bundle includes this module, and it is regenerated at L11's close.

**How the reading set was read (§17):** I read my own requirements, code and tests whole. A helper agent in this session read the used modules' public parts (ai-use, credentials, steps, question-explorer, investigation, review, civil-time, membership, queue, queue-producers, and plane's reads) in full and wrote me a digest, each statement citing its section. I checked the entry shapes I fill from by running the real providers in their test worlds.

**Tests**
- `node --test bio-plane/test/m/notice-producers/`: 95 pass, 0 fail (it was 87/3). Rule 4 (10)'s reds (`accounts.test.mjs`:36, 47, 88) are cleared: those tests are rewritten for DEC-189 and pass.
  - New `words.test.mjs`: every word equals `words.json`; every key DEC-189 names is held; the retired key is absent.
  - Each scope's sentence is tested against the other two.
  - The member's label is tested against the owner's.
  - Each of the ten kinds is tested verbatim.
- No layer tests are named in the manifest.
- **Users:** queue 136/0 plus `conclude-project` 1/0; plane 184/0 plus `migrate-released` 1/0. No reds.

**Checks**
- format: 147 modules, 146 requirements files; 0 failures.
- architecture: 14 product files, 68 relative imports; 0 failures.
- coverage: 17 of 17 live requirement ids named by a test; 0 failures.
- ownership: 6 files changed by notice-producers; 0 failures.

Size (session_0185KLN8pZrLcZSM86tkn1wY): test runs 14, module lines 1381
