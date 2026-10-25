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
