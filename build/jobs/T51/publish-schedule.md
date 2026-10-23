# publish-schedule (T51)

**Status** · session_011YtbK9a8D838PGBYatGXMf · depth 2 · WORKING · handled B3

## J1 · REPORT

One words finding stays in `publish-schedule`, and I judge it developer text, not member text, so I have not converted it:

- `bio-plane/src/publish-schedule/index.mjs:82`, `PROVIDER_MALFORMED` detail: "the scheduled publisher gives the door publishScheduled".

Why: `registerScheduledPublisher` is called once at `ratification`'s start with a publisher object. The detail answers only when that object lacks the `publishScheduled` door, which is a wiring error in the calling module, not an act any member takes. No member sees it; the caller is the code.

The words check (`checks/words.mjs publish-schedule`) still counts it as the one `plain` failure. Per K3944 it needs your decision: add its text to the design's unkeyed list, or tell me to key it with `localize('publish-schedule.index.the_scheduled_publisher_gives_the_door', …)`. I have changed nothing for it.

## J2 · COMPLETE

**Applied: T51-235 (words rule, K3949, K3957, K3964).** Commit `67466b9361`.

- The seven `plain` findings in `publish-schedule.md`, each read as member text and converted with `localize` (sentence unchanged, id `publish-schedule.schedule.<slug>`):
  - `schedule.mjs:92` `that_time_is_not_after` (PUBLISH_AT_PAST);
  - `:146` `a_waiting_edition_names_its` (MALFORMED, scheduleEdition's arguments);
  - `:244` `a_publishing_time_is_moved` (MACHINE_CANNOT_SCHEDULE_PUBLISH);
  - `:245` `no_edition_of_that_case` (NOT_WAITING);
  - `:254` `that_editions_time_has_come` (NOT_WAITING, a due edition);
  - `:257` `only_an_owner_of_the` (NOT_A_CASE_OWNER);
  - `index.mjs:82` was judged developer text and is left (see REPORT).
- Two more member refusal details, which R13 binds though the check's heuristics skip them: `schedule.mjs:81` (`a_publishing_time_is_a`, PUBLISH_AT_MALFORMED) and `:85` (`the_team_holds_no_time`, PUBLISH_AT_NO_ZONE).
- The two test copies: `t35.test.mjs:71–72` (the C-122.5 translation). The row's text lives in `words.json` under `refusal.SCHEDULED_CHECK_UNAVAILABLE`, so the test now asserts `hasWord` and compares with `word(...)`. The check flagged only :71, but :72 went with it.
- The findings file (`build/plan/words-pass/publish-schedule.md`) had no `K3962` section when I merged `tranche/T51` at `4e86d468fe`. I ran `checks/words.mjs` myself, which found the same set, plus the two `schedule.mjs` refusals the file did not list.
- Nothing deferred. No flaw or improvement found in another module. No generated artifact touched; `rows.mjs` stale for the new ids, expected, regenerated at L8's close.

**Tests and checks** (from `/home/user/bio`, process repo at `e8ac153`):
- `node --test bio-plane/test/m/publish-schedule/`: 26 pass, 0 fail.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs publish-schedule`: 0 failures. `checks/coverage.mjs publish-schedule`: 11 of 11 live ids named by a test. `checks/ownership.mjs … tranche/T51 job/T51/publish-schedule`: 0 failures.
- `checks/words.mjs publish-schedule`: 1 failure, `index.mjs:82`, reported above.
- `checks/run.mjs`: format 0 failures, architecture 0 failures; coverage 25 failures across other modules, none naming `publish-schedule`; words 2258 failures across the product, all in other modules but `index.mjs:82`.
- `setup-words/build.mjs --check`: the stale-rows note names the new `publish-schedule.schedule.*` keys, which is expected until BOB regenerates at L8's close. No refusal names this module.

Size (session_01S1FikQpxogSbRoKkJX9qgY): test runs 3, module lines 622

## J3 · COMPLETE

**Applied: B3 (CHANGE, K3986, K4027).** Merged `tranche/T51` into `job/T51/publish-schedule` (no rebase), then fixed the one test copy: `t39.test.mjs:12`, the default reason of a stub document row, is now the identifier `stale-document-copy`. No assertion reads it. Commit `5eca2da1ad`, pushed.

**Checks, after the change:**
- `node --test bio-plane/test/m/publish-schedule/`: 26 pass, 0 fail.
- `checks/words.mjs publish-schedule`: 1 failure, `index.mjs:82`, accepted by name per B2 (K4025, unkeyed list).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs publish-schedule`: 0 failures. `checks/coverage.mjs publish-schedule`: 11 of 11 live ids named by a test, 0 failures. `checks/ownership.mjs … tranche/T51 job/T51/publish-schedule`: 1 file changed by this job, 0 failures.

Nothing deferred. Module source unchanged in size since COMPLETE J2.

Size (session_01S1FikQpxogSbRoKkJX9qgY): test runs 5, module lines 622
