# publish-schedule (T51)

**Status** · session_019byduqPr9cjbAecgR17jh6 · depth 2 · COMPLETE · handled B10

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

## J4 · COMPLETE

**Applied: G54 (3)(a) "publish-schedule"** (B4, fix round 6; K4565, K4571). Commit on `job/T51/publish-schedule`.

**Cause (R-FOUR (1), this module's share).** `takeOne` (`schedule.mjs:205-229`, before) read only `answer.stopped` and settled `published` whenever the document was signed, so a publisher's account of the case files it assembled was dropped (`after` was never read), and a publisher that committed and then threw was indistinguishable from one that built everything. **Missed (2):** the tests of R2 (`t34`, `t39`) asserted the `taken` entry for published and stopped editions and never gave the publisher an `after`; the gap is closed by `g54-settle.test.mjs`. **Failing-first (3):** `test/m/publish-schedule/g54-settle.test.mjs`, seen red on the unchanged tree (6 of 6 failed: `takeOne` ignored `after`, no `case_file` column), now 6 pass. **Platform (4):** N for this module (a nullable TEXT column, a few hundred bytes a row, no limit near).

**Built.**
- `schema.mjs`: additive nullable `case_file` TEXT on `scheduled_editions` (in the CREATE, and `PUBLISH_SCHEDULE_ADDITIVE_COLUMNS` with a `PRAGMA table_info` guard in `migratePublishSchedule`, as credentials does), migrated once, never back-filled.
- `schedule.mjs`: `takeOne` stores the publisher's `after.containers` at settle, reduced by `caseFileOf` to `[{case, edition, built, code?}]` (other keys such as step, error, detail are dropped; code cut to 64; list cut to 50 with failed entries kept before built ones); an absent list, a throw after the commit, or a list with nothing valid is stored `"unknown"`, never null; an empty list stays `[]`. It returns `case_file_at_settle` in the `taken` entry of a published row; a stopped row stores and states none (it committed nothing). R4's entry (`scheduledEditions`) carries `case_file_at_settle` for a published row too; a null column on a row settled before reads `not_recorded`. The row still settles `published` when signed. The stored value is the state at settle; this module never rewrites it.
- `index.mjs`: the publisher contract comment amended to `{published, published_at, after: {containers}}`; `CASE_FILE_MAX`, `CASE_FILE_CODE_MAX` exported.
- Tests updated for the two intended shape changes: `t34.test.mjs` R2 (the published `taken` entry now holds `case_file_at_settle: "unknown"` for a publisher giving none) and `seam.test.mjs` factory (20 columns, `case_file` last).

**Census:** no op's accepted keys change (`publishatmove`, `publishatcancel`, `publishschedule` read the same keys; their answers gain a field only). No op declared or changed (`DECLARED_OPS` untouched). Words: none new (no sentence added); `checks/words.mjs publish-schedule`: 0 failures (the `dev 1` is `index.mjs` PROVIDER_MALFORMED, accepted by name, B2).

**Proposed text for R2** (BOB writes; add after the paragraph "It answers `{published: true, published_at}` or `{stopped: [...]}`..."; and change R2's first publisher answer to `{published: true, published_at, after: {containers}}`):
> *(G54)* A published answer may carry `after: {containers: [{case, edition, built, code?}]}`, one entry for each case file the publisher assembled. When the edition settles `published`, the row stores that list as it stands (an entry keeps only those four keys, its `code` at most 64 characters, the list at most 50 entries with failed ones kept first), or `"unknown"` when the answer gives no list (or the publisher threw after committing), never null, and the `taken` entry and R4's entry of the published edition answer it as `case_file_at_settle`. A row settled before the column existed answers `not_recorded`. It is the state at settle; the current state of an edition's case file is `publication`'s and `public-read`'s, not the row's. A stopped edition has none. The row settles `published` whenever the document is signed, whatever the list says.
And Suggestions, Factory: "with the same DDL `publication` created" gains "and R2's additive `case_file` column".

**Findings against other modules (P9):**
1. The brief asks for "the test that the real scheduler's tick passes the `taken` entry unchanged" from this module. `scheduler` is layer 10, a later module; `checks/architecture.mjs` judges tests' imports too, so a test under `publish-schedule` cannot import it. Read: `scheduler/index.mjs:386-` returns `{scheduledpublish: await publishDue(...)}` whole, so the entry passes unchanged by construction; the plan's G54 text gives the proof to the PLANE (S) job (`g54-sweep.test.mjs`) and says so. I wrote none here and say so in the test file's header.
2. The publisher is ratification's (merge 116): until it answers `after.containers`, a real scheduled publish settles `case_file_at_settle: "unknown"`. My seam test is written against the contract with a stand-in and is green; ratification's own `g54-paths.test.mjs` proves the real answer.
3. `screens-publish` / `queue-producers` consumers of R4 entries: their tests I ran (listed below) are green with the new field; none reads `case_file_at_settle` yet (screens-publish's sentences are its job).

**Tests and checks** (from `/home/user/bio`):
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit` over this module's 7 files: g54-settle 6 pass; t34 11, t35 2, t39 1, seam 8, zone 4, declared-ops 1: 0 fail.
- Consumers that name `publishDue`/`scheduledEditions`/`scheduled_editions` (21 files: case-authoring waiting; scheduler t34; affordances t34; ratification sitting, approvals, schedule, scheduled-commit; publication t41, invariants, t34; plane t41; op-declarations t34; screens-publish fix4, t50, ceremony; op-grades pins, owners; queue-producers feeds, scheduled, localday, words): all pass, 0 fail. The full impact set (866 files, 47 modules) was not run, by the one-process rule; these are the files that reference this module's entries.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs publish-schedule`: 0 failures. `checks/coverage.mjs publish-schedule`: 12 of 12 live ids named by a test. `checks/ownership.mjs … origin/tranche/T51 job/T51/publish-schedule`: 7 files, 0 failures. `checks/words.mjs publish-schedule`: 0 failures. `checks/run.mjs`: format, architecture, coverage, channels 0 failures; words 1 failure, the inherited `inline` at `case-checker/spec.mjs:11`. `setup-words/build.mjs --check`: the stale-rows note for `calculations.*`, no refusal naming this module.

Nothing deferred. No generated artifact touched or made stale (this module adds no word).

Size (session_011YtbK9a8D838PGBYatGXMf): test runs 33, module lines 672

## J5 · COMPLETE

**Applied: fix round 10, Wave A batch 2 (B5, K4990, K4993, K5044).** One published fixture, `scheduleRefusals` in `bio-plane/test/m/publish-schedule/fixtures.mjs` (new file), made by `scheduleEdition`'s real code when it is called, never stored. It returns the real answer of each of R1's four time refusals, keyed by code: `PUBLISH_AT_MALFORMED`, `PUBLISH_AT_NO_ZONE`, `PUBLISH_AT_PAST` (its `publish_at` is the instant the minute begins), and `PUBLISH_AT_ALREADY_SET` (its `waiting` entry names the time already set). `fixtures.test.mjs` calls it and checks each real answer (R1). Commit `43d5fee13b`.

**Cause and missed.** Not a defect: this module had no fixture, and the user (ratification, `schedule.test.mjs:127`) hand-builds these answers. Its re-point is ratification's job, not this one.

**Built.** Two new test files only; no product source changed. Fixture markers added: none (no `fixtures-own` or `fixtures-generic`). Words: none new.

**Left.** Nothing in this module's lines. The fixture check lists no finding naming `publish-schedule` as its own. The users' re-points (`ratification` 1) wait on that job.

**Tests and checks** (from `/home/user/bio`):
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/publish-schedule/*.test.mjs`: 34 pass, 0 fail (includes the new `fixtures.test.mjs`, 1 pass).
- User tests, named by the fixture's users: `ratification/schedule.test.mjs`, `queue-producers/scheduled.test.mjs`, `queue-producers/feeds.test.mjs`: 34 pass, 0 fail. No product source changed, so the impact set's other users are unaffected by this commit; the full impact set (117 modules) was not run, by the one-process rule.
- `checks/format.mjs .`: 0 failures. `checks/architecture.mjs . publish-schedule`: 0 failures. `checks/coverage.mjs . publish-schedule`: 12 of 12 live ids named by a test, 0 failures. `checks/ownership.mjs . publish-schedule tranche/T51`: 1 file changed by this job's module, 0 failures. `checks/words.mjs . publish-schedule`: 0 failures (the `dev 1` is `index.mjs:82`, accepted by name, B2).
- `checks/fixtures.mjs /home/user/bio --list`: no line names `publish-schedule` as its own; the repository total is 2,795 failures, all in other modules' users and providers (not this job's).

Nothing deferred. No flaw or improvement found in another module.

Size (session_01CumgoAkykhYoNXaf1mFSbV): test runs 3, module lines 672

## J6 · COMPLETE

# publish-schedule (T51)

**Status** · session_01CumgoAkykhYoNXaf1mFSbV · depth 2 · WORKING · handled B4

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

## J4 · COMPLETE

**Applied: G54 (3)(a) "publish-schedule"** (B4, fix round 6; K4565, K4571). Commit on `job/T51/publish-schedule`.

**Cause (R-FOUR (1), this module's share).** `takeOne` (`schedule.mjs:205-229`, before) read only `answer.stopped` and settled `published` whenever the document was signed, so a publisher's account of the case files it assembled was dropped (`after` was never read), and a publisher that committed and then threw was indistinguishable from one that built everything. **Missed (2):** the tests of R2 (`t34`, `t39`) asserted the `taken` entry for published and stopped editions and never gave the publisher an `after`; the gap is closed by `g54-settle.test.mjs`. **Failing-first (3):** `test/m/publish-schedule/g54-settle.test.mjs`, seen red on the unchanged tree (6 of 6 failed: `takeOne` ignored `after`, no `case_file` column), now 6 pass. **Platform (4):** N for this module (a nullable TEXT column, a few hundred bytes a row, no limit near).

**Built.**
- `schema.mjs`: additive nullable `case_file` TEXT on `scheduled_editions` (in the CREATE, and `PUBLISH_SCHEDULE_ADDITIVE_COLUMNS` with a `PRAGMA table_info` guard in `migratePublishSchedule`, as credentials does), migrated once, never back-filled.
- `schedule.mjs`: `takeOne` stores the publisher's `after.containers` at settle, reduced by `caseFileOf` to `[{case, edition, built, code?}]` (other keys such as step, error, detail are dropped; code cut to 64; list cut to 50 with failed entries kept before built ones); an absent list, a throw after the commit, or a list with nothing valid is stored `"unknown"`, never null; an empty list stays `[]`. It returns `case_file_at_settle` in the `taken` entry of a published row; a stopped row stores and states none (it committed nothing). R4's entry (`scheduledEditions`) carries `case_file_at_settle` for a published row too; a null column on a row settled before reads `not_recorded`. The row still settles `published` when signed. The stored value is the state at settle; this module never rewrites it.
- `index.mjs`: the publisher contract comment amended to `{published, published_at, after: {containers}}`; `CASE_FILE_MAX`, `CASE_FILE_CODE_MAX` exported.
- Tests updated for the two intended shape changes: `t34.test.mjs` R2 (the published `taken` entry now holds `case_file_at_settle: "unknown"` for a publisher giving none) and `seam.test.mjs` factory (20 columns, `case_file` last).

**Census:** no op's accepted keys change (`publishatmove`, `publishatcancel`, `publishschedule` read the same keys; their answers gain a field only). No op declared or changed (`DECLARED_OPS` untouched). Words: none new (no sentence added); `checks/words.mjs publish-schedule`: 0 failures (the `dev 1` is `index.mjs` PROVIDER_MALFORMED, accepted by name, B2).

**Proposed text for R2** (BOB writes; add after the paragraph "It answers `{published: true, published_at}` or `{stopped: [...]}`..."; and change R2's first publisher answer to `{published: true, published_at, after: {containers}}`):
> *(G54)* A published answer may carry `after: {containers: [{case, edition, built, code?}]}`, one entry for each case file the publisher assembled. When the edition settles `published`, the row stores that list as it stands (an entry keeps only those four keys, its `code` at most 64 characters, the list at most 50 entries with failed ones kept first), or `"unknown"` when the answer gives no list (or the publisher threw after committing), never null, and the `taken` entry and R4's entry of the published edition answer it as `case_file_at_settle`. A row settled before the column existed answers `not_recorded`. It is the state at settle; the current state of an edition's case file is `publication`'s and `public-read`'s, not the row's. A stopped edition has none. The row settles `published` whenever the document is signed, whatever the list says.
And Suggestions, Factory: "with the same DDL `publication` created" gains "and R2's additive `case_file` column".

**Findings against other modules (P9):**
1. The brief asks for "the test that the real scheduler's tick passes the `taken` entry unchanged" from this module. `scheduler` is layer 10, a later module; `checks/architecture.mjs` judges tests' imports too, so a test under `publish-schedule` cannot import it. Read: `scheduler/index.mjs:386-` returns `{scheduledpublish: await publishDue(...)}` whole, so the entry passes unchanged by construction; the plan's G54 text gives the proof to the PLANE (S) job (`g54-sweep.test.mjs`) and says so. I wrote none here and say so in the test file's header.
2. The publisher is ratification's (merge 116): until it answers `after.containers`, a real scheduled publish settles `case_file_at_settle: "unknown"`. My seam test is written against the contract with a stand-in and is green; ratification's own `g54-paths.test.mjs` proves the real answer.
3. `screens-publish` / `queue-producers` consumers of R4 entries: their tests I ran (listed below) are green with the new field; none reads `case_file_at_settle` yet (screens-publish's sentences are its job).

**Tests and checks** (from `/home/user/bio`):
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit` over this module's 7 files: g54-settle 6 pass; t34 11, t35 2, t39 1, seam 8, zone 4, declared-ops 1: 0 fail.
- Consumers that name `publishDue`/`scheduledEditions`/`scheduled_editions` (21 files: case-authoring waiting; scheduler t34; affordances t34; ratification sitting, approvals, schedule, scheduled-commit; publication t41, invariants, t34; plane t41; op-declarations t34; screens-publish fix4, t50, ceremony; op-grades pins, owners; queue-producers feeds, scheduled, localday, words): all pass, 0 fail. The full impact set (866 files, 47 modules) was not run, by the one-process rule; these are the files that reference this module's entries.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs publish-schedule`: 0 failures. `checks/coverage.mjs publish-schedule`: 12 of 12 live ids named by a test. `checks/ownership.mjs … origin/tranche/T51 job/T51/publish-schedule`: 7 files, 0 failures. `checks/words.mjs publish-schedule`: 0 failures. `checks/run.mjs`: format, architecture, coverage, channels 0 failures; words 1 failure, the inherited `inline` at `case-checker/spec.mjs:11`. `setup-words/build.mjs --check`: the stale-rows note for `calculations.*`, no refusal naming this module.

Nothing deferred. No generated artifact touched or made stale (this module adds no word).

Size (session_011YtbK9a8D838PGBYatGXMf): test runs 33, module lines 672

## J5 · COMPLETE

**Applied: fix round 10, Wave A batch 2 (B5, K4990, K4993, K5044).** One published fixture, `scheduleRefusals` in `bio-plane/test/m/publish-schedule/fixtures.mjs` (new file), made by `scheduleEdition`'s real code when it is called, never stored. It returns the real answer of each of R1's four time refusals, keyed by code: `PUBLISH_AT_MALFORMED`, `PUBLISH_AT_NO_ZONE`, `PUBLISH_AT_PAST` (its `publish_at` is the instant the minute begins), and `PUBLISH_AT_ALREADY_SET` (its `waiting` entry names the time already set). `fixtures.test.mjs` calls it and checks each real answer (R1). Commit `43d5fee13b`.

**Cause and missed.** Not a defect: this module had no fixture, and the user (ratification, `schedule.test.mjs:127`) hand-builds these answers. Its re-point is ratification's job, not this one.

**Built.** Two new test files only; no product source changed. Fixture markers added: none (no `fixtures-own` or `fixtures-generic`). Words: none new.

**Left.** Nothing in this module's lines. The fixture check lists no finding naming `publish-schedule` as its own. The users' re-points (`ratification` 1) wait on that job.

**Tests and checks** (from `/home/user/bio`):
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/publish-schedule/*.test.mjs`: 34 pass, 0 fail (includes the new `fixtures.test.mjs`, 1 pass).
- User tests, named by the fixture's users: `ratification/schedule.test.mjs`, `queue-producers/scheduled.test.mjs`, `queue-producers/feeds.test.mjs`: 34 pass, 0 fail. No product source changed, so the impact set's other users are unaffected by this commit; the full impact set (117 modules) was not run, by the one-process rule.
- `checks/format.mjs .`: 0 failures. `checks/architecture.mjs . publish-schedule`: 0 failures. `checks/coverage.mjs . publish-schedule`: 12 of 12 live ids named by a test, 0 failures. `checks/ownership.mjs . publish-schedule tranche/T51`: 1 file changed by this job's module, 0 failures. `checks/words.mjs . publish-schedule`: 0 failures (the `dev 1` is `index.mjs:82`, accepted by name, B2).
- `checks/fixtures.mjs /home/user/bio --list`: no line names `publish-schedule` as its own; the repository total is 2,795 failures, all in other modules' users and providers (not this job's).

Nothing deferred. No flaw or improvement found in another module.

Size (session_01CumgoAkykhYoNXaf1mFSbV): test runs 3, module lines 672

## J7 · REPORT

Correction to J6: I posted the whole record file as J6's body, so the record now carries J1 to J5 twice. The one that counts is the J5 section (COMPLETE, fixture `scheduleRefusals`, commit 43d5fee13b, the test and check results there, size line included). Nothing else changed. I have not edited the record by hand; the duplicate is left for you to ignore or prune.

Also, in my session I could not delete a stray file `/users.log` (created by a mistyped path in a test command, outside the repository); the removal was refused by the safety check, so it remains. Nothing in the repository is affected.

---
_Generated by [Claude Code](https://claude.ai/code)_

## J5 · BLOCKED (fix round 10, item 95; K5195) · session_01FnxkCbBeJJRcy2fLBbUddA

**Cause (R12, `publishatmove`).** Declared with R12's rules (`accepts` and `requires` `case`, `edition`, `at`; `class`, `mutating` and `machineClasses` copied from `publishatcancel`; `weight` copied from the op's hand row, `irreversible`, `op-grades/index.mjs:337`), the row makes every registration of the owners fail: `op-grades/declared.mjs:39` refuses `weight: "irreversible"` (`DECLARED_OP_BAD_WEIGHT`). That throw happens at the first `registerDeclared`, so 54 tests fail across `op-declarations`, `op-grades`, `screens-publish` and `interface-shell` (run: 605 tests, 551 pass). The module's own `declared-ops.test.mjs` passed with the row in place.

**Why it cannot be declared as it stands.** A declared row must agree with the hand row for its op (`declared.mjs`, the `DECLARED_OP_DISAGREES` check), and a declared weight may only be a rung below `irreversible` or a ground. So no mutating op whose hand row is `irreversible` can be declared: `publish`, `publishat`, `publishatmove`, `personexpunge`, `standardrelease`. This is `op-grades`' rule, not this module's.

**What I did.** Committed the declaration and its failing-first test (`42d3fc15ca`), saw the 54 failures, and reverted it (`ea1b26f8d1`). The module is back at the tranche's text: 34 of 34 tests pass, `op-grades` 154 of 154. The branch carries no net change from this job. The commit `42d3fc15ca` holds the ready row and test, so the fix is to re-apply it.

**Decision for Bob (options, with a recommendation).**
1. **Recommended:** `op-grades/declared.mjs:39` accepts `weight: "irreversible"` when the hand row also says `irreversible` (the agreement check already compares the two). Then `publishatmove` declares `irreversible` as R12 says, and the rule holds for the other irreversible ops that have no row yet. This edit is `op-grades`' (its job), and R49 wants it stated in `op-grades` R49. I can re-apply `42d3fc15ca` the day it lands.
2. Declare a different weight: impossible, the row would disagree with the hand row.
3. Leave `publishatmove` undeclared and amend R12 to say so: this keeps a wired op with no owner declaration, which the census counts against us.

**Checks.** Before the revert, on `42d3fc15ca`: `format`, `architecture`, `coverage` (12 of 12), `words`, `fixtures --list` and `ownership` all 0 failures. After the revert: the module suite 34 of 34 pass.

Size (session_01FnxkCbBeJJRcy2fLBbUddA): test runs 6, module lines 622

## J8 · BLOCKED

BLOCKED · cause: needs Bob · NEEDS BOB

R12 `publishatmove` cannot be declared under op-grades' current rules. Declared with R12's rules (weight copied from its hand row, `irreversible`, op-grades/index.mjs:337), the row makes every owners' registration throw DECLARED_OP_BAD_WEIGHT at op-grades/declared.mjs:39, which breaks 54 tests in op-declarations, op-grades, screens-publish and interface-shell. The declared-ops test for the row passed in my module.

Declared rows must agree with the hand row and can never be `irreversible`, so no irreversible op (publish, publishat, publishatmove, personexpunge, standardrelease) can be declared. That is op-grades' rule.

I reverted my row (ea1b26f8d1; the ready row and test are in 42d3fc15ca). Module: 34 of 34 pass; op-grades 154 of 154.

Decision for Bob, recommended first: let op-grades/declared.mjs:39 accept `irreversible` when the hand row also says `irreversible`, stated in op-grades R49. Then I re-apply 42d3fc15ca. Alternatives: amend R12 to leave publishatmove undeclared (the census keeps counting it), or a different weight (impossible: it disagrees with the hand row).

Record: build/jobs/T51/publish-schedule.md, section J5.

---
_Generated by [Claude Code](https://claude.ai/code)_

## J6 · COMPLETE (fix round 10, item 95; K5195; B8 CHANGE, K5201)

**Changed (file:line).** `bio-plane/src/publish-schedule/index.mjs:189-191`: `DECLARED_OPS.publishatmove`, `irreversible` (op-grades R54, OP-GRADES #29, is merged: an `irreversible` owner row is accepted where the hand row in RUNGS is `irreversible` and writing), class and machineClasses as `publishatcancel`, description as `op-grades/index.mjs:1557`, `fields` accepts and requires `case`, `edition`, `at` (read by `publishAtMove`, `schedule.mjs:291`). `bio-plane/test/m/publish-schedule/declared-ops.test.mjs:` a new `R12 ... publishatmove` test, failing-first on the tree without the row (`DECLARED_OPS["publishatmove"]` undefined: "declaration has no fields"), green with it. Re-applied from `42d3fc15ca` onto the merged tranche; J5's revert (`ea1b26f8d1`) stays in history.

**Suites.**
- `publish-schedule/*.test.mjs`: 35 tests, 35 pass, 0 fail.
- Consumers (`op-declarations`, `op-grades`, `screens-publish`, `interface-shell`): 610 tests, 561 pass, 49 fail. **The same 49 fail on `origin/tranche/T51` with my commit absent** (run detached at the tranche tip, same counts): `DECLARED_OP_DISAGREES: readtranslate description` (44, translations' row, not mine) and `UNKNOWN_WORD control-plane.declared.subscriptionsignin` (control-plane). Not this module's; left for their owners.
- `impact.mjs origin/tranche/T51 HEAD`: names the shared `DECLARED_OPS` table; the users are the declared-ops tests of every module, run above through the census suites.

**Checks** (`/home/user/bio`): format 0 failures; architecture 0; coverage 12 of 12 live ids named by a test, 0 failures; words 0 failures (dev 1 is the accepted `index.mjs` PROVIDER_MALFORMED, unchanged); fixtures `--list` 0 failures (no `fixtures-own` or `fixtures-generic` marker added); ownership against `origin/tranche/T51`: 3 files, 0 failures.

**Met ids.** R12 (publishatmove and publishatcancel both declared; the test names R12).

**Deferred.** None.

**Markers added.** None.

Size (session_01FnxkCbBeJJRcy2fLBbUddA): test runs 9, module lines 674

## J9 · COMPLETE

COMPLETE (J6, re B8 CHANGE). R12 publishatmove declared irreversible at index.mjs:189-191 (op-grades R54 now accepts it); failing-first test in declared-ops.test.mjs red before, green after. Module 35/35; consumers 561/610 with 49 failures identical on the tranche tip (translations readtranslate, control-plane subscriptionsignin), not this module's. format, architecture, coverage 12/12, words, fixtures, ownership all 0. No markers added. Details in build/jobs/T51/publish-schedule.md J6.

Size (session_01FnxkCbBeJJRcy2fLBbUddA): test runs 9, module lines 674

---
_Generated by [Claude Code](https://claude.ai/code)_

## J10 · COMPLETE (re B9 CHANGE, K5209; tranche `2237ab5730`)

**Changed.** Nothing new in this module: merged `origin/tranche/T51` (OP-GRADES #30 merged; the `readtranslate` disagreement is gone). Module source unchanged since J6 (`index.mjs:189-191`, the `publishatmove` row; `declared-ops.test.mjs`).

**Suites.** `publish-schedule/*.test.mjs`: 35 of 35 pass. Consumers (`op-declarations`, `op-grades`, `screens-publish`, `interface-shell`): 1080 tests, 1072 pass, 6 fail. **The same 6 fail on `origin/tranche/T51` without my commits** (run detached at the tranche tip): `R81 R88` (publishedcase's field, public-read), `R34` and `R47, R34` (`owedwork` and ACT_HELP, not this module's), `R5 R15 R22`, `R30` and `R34, R5` (interface-shell frames and ACT_HELP_ABSENT). Left for their owners, as B9 names for the other two.

**Checks.** format 0 failures; architecture 0; coverage 12 of 12; words 0 (dev 1 is the accepted `index.mjs` PROVIDER_MALFORMED); fixtures `--list` 0 (no markers added); ownership against `origin/tranche/T51`: 3 files, 0 failures.

**Met ids.** R12 (unchanged from J6).

**Deferred.** None. **Markers added.** None.

Size (session_01FnxkCbBeJJRcy2fLBbUddA): test runs 6, module lines 674

## J11 · COMPLETE

COMPLETE (J10, re B9 CHANGE, K5209). Tranche merged (2237ab5730 line). Nothing new in the module since J6: publishatmove declared at index.mjs:189-191. publish-schedule 35/35; consumers 1072 of 1080, the same 6 failing on the tranche tip without my commits (not this module's). format, architecture, coverage 12/12, words, fixtures, ownership all 0. No markers added. Details in build/jobs/T51/publish-schedule.md J10.

Size (session_01FnxkCbBeJJRcy2fLBbUddA): test runs 6, module lines 674

---
_Generated by [Claude Code](https://claude.ai/code)_

## J12 · COMPLETE

COMPLETE (B10 START, fix round 10, plan item 139; K5282; Bob's K5257/K5258 direction: D-B1, the team's own zone).

**Applied: D-B1.** `groupZone` (`bio-plane/src/publish-schedule/schedule.mjs:49`) read the profiles only, and returned null before reading anything when no place profile was held, so a team that stated its zone at `@team/time_zone` never had its days read locally. It now reads `factStatus({path: TEAM_ZONE_PATH})`'s `governs.value` first (local-facts R21: the team's statement, else the zone the held profiles agree on); a team with nothing governing falls to the profile reading, kept unchanged, so the answer for every case that stated nothing is today's. `TEAM_ZONE_PATH` is imported from `local-facts/paths.mjs`. Commit `5a01b7681e`, pushed.

**Test, red then green** (`bio-plane/test/m/publish-schedule/zone.test.mjs`, added under R1 with the D-B1 mark):
- red on the unchanged source: "a team with no place profile that stated its zone schedules on that zone's local day" failed (`groupZone` null, expected Europe/Lisbon); the control passed.
- green after the change: both pass. The stated-zone test sets 09:00 and gets `publish_at` 2026-10-01T08:00:00Z in Lisbon.
- control: a team with no profile and nothing stated is refused `PUBLISH_AT_NO_ZONE` and writes nothing.

**Deferred.** None. **Markers added.** None. **Findings in other modules.** None from this change. The requirement text of R1 already reads "the value that governs for the `time_zone` path as local-facts answers it", so no requirement change is needed; I changed no requirement.

**Tests and checks** (from `/home/user/bio`; `node_modules` installed in the five directories that lacked it, K4113):
- `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/publish-schedule/*.test.mjs`: 37 pass, 0 fail. Each file alone, summed: 37 (declared-ops 2, fixtures 1, g54-settle 6, seam 8, t34 11, t35 2, t39 1, zone 6), no shortfall.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs publish-schedule`: 0 failures. `checks/coverage.mjs publish-schedule`: 12 of 12 live ids named by a test, 0 failures. `checks/words.mjs publish-schedule`: 0 failures (`dev 1`: `index.mjs:82`, accepted by name, B2).
- `checks/ownership.mjs publish-schedule 3fdb3eb7c4… HEAD`: 3 files changed by publish-schedule, 0 failures.
- `checks/run.mjs /home/user/bio`: format, architecture, coverage, channels, words 0 failures; fixtures 89 failures, none naming publish-schedule, schedule.mjs or zone.test.mjs (grep of the whole output for "schedule" is empty of them). Those 89 are in other modules' tests; I did not run a baseline of them.

Size (session_019byduqPr9cjbAecgR17jh6): test runs 12, module lines 682
