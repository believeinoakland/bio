# agent-worker (R085)

**Status** · session_018F9Doyf71vyGxPLnaNguLq · depth 2 · COMPLETE · handled B7

## J1 · QUESTION

My readings for R91 and R92. I am building on them now; answer only where you differ.

1. **R92's cause is in this module (and agent-model's schema).** The plane refuses a log entry whose `condition` is not a word of observation-log's `CONDITION_KINDS` (C-22.4, AI_RUN_CONDITION_UNKNOWN), and one that is `governed` with a definitive state (C-22.2). agent-model's `judge_*` and `report` tools offer `condition` as a free string with no vocabulary, so a real model writes prose there; this member copied it into the entry, every sub-session entry was refused, and every report went out with no `observed_at`: REPORT_UNLOCATED (journey-check's fake model was changed to avoid exactly this, T49 record). Fix here: every entry this member sends (step entries and sub-session entries) carries `condition` only when the plane's own `checkCondition` (run-rules' re-export, the one function, not a copy) admits it; other words go into `detail` as stated text. A `governed` look with a definitive state is recorded LOOKED_INDETERMINATE (D-104), and the report takes the same state. Consequence: `harness.test.mjs` REC100-2 drove a free condition to show that ANY per-entry refusal is surfaced; that trigger no longer refuses, so I move REC100-2 to a state the record has no word for (AI_LOG_STATE_UNKNOWN), keeping the class it tests. I also found a whole-tick refusal (`ticked: false` with a code, no `ok`) read as an entry that landed in the sub-session path; fixed with it.

2. **R91 driver.** A Durable Object class `SegmentDriver` exported from the entry, bound as `SEGMENTS` (wrangler migration `new_sqlite_classes`), one object per run id. `/run` does R1–R8 (body checks and `whoami`) on the request, hands the segment to the object, which holds its inputs in memory only (R36: the credential and account are never written to storage) and runs it from an alarm, and `/run` answers `202 {accepted: true, run_id}`. A second `/run` for a run whose segment is still running answers 409 `SEGMENT_RUNNING`. A segment also stops on a wall bound (default 10 min, under an alarm's 15-min limit) as a segment bound. **With no `SEGMENTS` binding** (every existing suite, and any instance not yet re-installed) `/run` runs the segment on the request and answers R28 as today; both paths send the `segment_end` tick.

3. **`segment_end: {by, done, refusals}`**, exported as `SEGMENT_END_BY` from `ops.mjs`: `by` one of `the table`, `the plane's own exit` (done: true), `the segment bound` (turns, bytes, max_steps or wall; done: false), `a refusal`, `an error` (done: false); `refusals` the list of codes (R28's `refusals` codes, plus the refusal or error code that ended it, `SEGMENT_THREW` for a throw). Please pass this to AI-RUNS for R84 if its reading differs.

4. **REPORT to follow:** the installer (`newgroup/src/index.mjs`) binds a member's own Durable Object class only for container parts, so it cannot yet install `SegmentDriver`; journey-check's local world (`bio-plane/src/journey-check/local.mjs`) binds no `SEGMENTS` either. Until both do, those instances run the synchronous path. agent-model's `condition` schema should name `CONDITION_KINDS`.

## J2 · COMPLETE

**Entries applied** (R085-8): R91 and R92, as J1 read them and B2/B3 amended them. Both are met; BOB marks them in the requirements file.

- **R92: the cause and the fix.** The plane refuses a log entry whose `condition` is outside observation-log's `CONDITION_KINDS` (C-22.4), and a `governed` entry with a definitive state (C-22.2). A real model writes prose in the free-string `condition` that agent-model's tools offer, and this member copied it, so every entry was refused and every report went out with no `observed_at` (REPORT_UNLOCATED). `loggable` (in `index.mjs`) now puts every entry this member sends, step and sub-session alike, in the record's own words, through the plane's own `checkCondition` and `DEFINITIVE_STATES` (run-rules' re-export). A condition outside the vocabulary is stated in `detail`. A governed definitive look is LOOKED_INDETERMINATE, and its report takes the same state. A tick refused whole (`ticked: false` with its code) is now a refusal on both paths, never an entry that landed; the sub-session path used to read it as landed.
- **R91: the durable segment.** `SegmentDriver`, this member's own Durable Object bound as `SEGMENTS` (with the `new_sqlite_classes` migration in `wrangler.jsonc`), holds one object per run id. `/run` answers R1–R8 and the pre-step refusals (run read, payer, pack, log read) on the request, as today, and then answers `202 {accepted: true, run_id}`. The object holds the inputs in memory only (R36) and runs the segment from an alarm under a 10-minute wall bound (`MAX_SEGMENT_MS`). A second segment while one is held or running gets 409 `SEGMENT_RUNNING`. With no `SEGMENTS` binding, the segment runs on the request and answers R28 as before.
- **`segment_end`.** Every started segment ends with one `op=airuntick` carrying `segment_end: {by, done, refusals, error?}` (B2's shape; `SEGMENT_END_BY` in `ops.mjs`). `by` is null on the segment's own bound, `error` is `SEGMENT_THREW` for a throw, and a refusal's code goes in `refusals`. A refusal before the first step writes nothing, as R10 and R57 require.

**Tests changed, none weakened:**
- REC100-2's trigger moved to an unknown state (AI_LOG_STATE_UNKNOWN), as B3 agreed.
- R35's binding tests now admit `SEGMENTS` and check the migration.
- Five tick-count arms count step ticks apart from the one `segment_end` tick, and assert that tick where it is the last call.

**New tests:**
- `test/r085.test.mjs` (20): R92 in-process over a plane whose tick judges each entry with the plane's own `checkObservation`, with a model that writes prose conditions; R91 in workerd with the real `SegmentDriver` and a recording fake plane.
- `harness.test.mjs` REC100-3 and REC100-3b: R92 at the real plane's append path.
- With the fix disabled, R92's four arms and REC100-3 and 3b fail, which reproduces WALK-085's empty log.

**Deferred:** none of this module's own.

**Found in other modules** (taken by BOB in B3; N1162):
- agent-model: `condition` in `judge_*` and `report` should name `CONDITION_KINDS`.
- installer (`newgroup/src/index.mjs`) installs a member's own Durable Object class only for container parts, so it cannot install `SegmentDriver`.
- journey-check: `local.mjs` binds no `SEGMENTS`.
- Already failing on `tranche/R085` before this job (checked by stash): `bio-plane/test/system/fleetbundles.test.mjs`'s "agent-worker's 28 inputs" arm pins an input list the tranche's bundle no longer matches. This build adds no input: 36 first-party inputs, as before.
- After merging the tranche: the same suite's bio-plane arms find `bio-plane/dist/bio-plane.bundled.mjs` stale, from other jobs' plane changes; this job changed no plane source.
- `release/agent-worker.bundled.mjs` and newgroup's embedded release now trail this module's bundle (a release act, not this job's).

**Tests and checks:**
- `npm test` in agent-worker: 21 files, 21 pass, 0 fail (r085: 20 passed; harness: 263 passed, 0 failed; requirements: 303 passed).
- `npm run build`: dist rebuilt, byte-identical to a fresh build (the fleetbundles arm passes).
- `newgroup-bundle-fresh`: pass 1, fail 0.
- format: 0 failures. architecture: 0 failures. coverage: 83 of 83 live ids named, 0 failures. ownership: 11 files changed, 0 failures.

Size (session_01XU6wVrjDVTctSBNoqW3NmS): test runs 16, module lines 3899

## J3 · REPORT

R93 met: SegmentDriver.alarm() now marks the segment not running (via a beforeEnd hook in runSegment) before it sends the segment_end tick; test r085.test.mjs drives a fake plane that dispatches the next /run from inside the segment_end tick (202) and a control /run during a running segment (409 SEGMENT_RUNNING); the R93 test fails without the fix. R94 (checkFinal -> checkReport less observed_at, REPORT_UNLOCATED not handed back) and R95 (role: 'subsession' on a check's sub-session converse) are built in src/index.mjs, with their own tests in r085.test.mjs, but those tests fail until agent-model R18/R19 merge into tranche/R085 (origin/job/R085/agent-model has no code yet): R94 700/300-character case, R95 model names. Everything else in the module's tests passes; format, architecture, coverage, ownership checks pass; dist rebuilt. Waiting for your CHANGE once agent-model merges; I will then merge tranche/R085, re-run, and post COMPLETE.

## Round 3 completion (R93, R94, R95)

Entries applied: R93 (`runSegment` takes a `beforeEnd` hook; `SegmentDriver.alarm()` clears `running` before the `segment_end` tick); R94 (`checkFinal` runs agent-harness' `checkReport` on the report, less `observed_at`, so `REPORT_UNLOCATED` is never handed back); R95 (`role: "subsession"` on a check's sub-session `converse`, and on no other). Deferred: none. Found in another module: none.
Tests: `agent-worker` `npm test` 21 files, 21 pass, 0 fail (`r085.test.mjs`: 28 passed, 0 failed; R93's test fails without the fix). Checks: format 0 failures; architecture 0 failures; coverage 86 of 86 ids named, 0 failures; ownership 0 failures. Bundle rebuilt (`npm run build`), sha256 fc05369c43….
Size (session_018F9Doyf71vyGxPLnaNguLq): test runs 4, module lines 2025

## J4 · COMPLETE

R93, R94, R95 met and green against agent-model R17-R19 (merged tranche/R085; bundle rebuilt). Module tests 21/21; format, architecture, coverage, ownership 0 failures. Record updated. Ready for the agent-harness R11 CHANGE if it affects me.

## After B7 (agent-harness R11 merged)

Merged `tranche/R085`; the contract gained `conditions` (agent-harness R11), so `fanout.test.mjs`'s pinned key tree now lists it (my test, no behaviour change); bundle rebuilt. `npm test` 21 of 21 pass; format, architecture, coverage, ownership 0 failures.
Size (session_018F9Doyf71vyGxPLnaNguLq): test runs 6, module lines 2025

## J5 · COMPLETE

Merged tranche/R085 after B7 (agent-harness R11): the contract's key tree gained 'conditions', so fanout.test.mjs's pinned key list now names it; bundle rebuilt. Module tests 21/21; format, architecture, coverage, ownership 0 failures. R93, R94, R95 stand met.
