# agent-worker (R085)

**Status** · session_01J4yAYV8SoXMA6MqDDAMcYQ · depth 2 · WORKING · handled B18

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

## J6 · COMPLETE

**Entries applied** (R085-18): R96–R100, each met and each named by `test/r096.test.mjs` (the new file, 22 arms, controls beside them).
- R96: the sub-session's `meaningrows` call forwards `ids` (at most 20, non-empty strings; others dropped), as the body of `op=meaningrows`; a call without `ids` sends none.
- R97: each contract is `spawnContract({level, payload, arms: Object.keys(MEANING), targets})`, `MEANING` imported from query-language (`bio-plane/src/query.mjs`), `targets` the plan judgement's targets for that level (`target` text split at its first space or `#` into `{id, extent}`; a target with no text is none).
- R98: each `usage` entry's `model` is the model `converse` answers (agent-model R21); the mode's coordinating model only when `converse` states none.
- R99: each `op=airuntick` this member sends with a step or a sub-session's look carries `consume.wallclock`, the ms since the segment's previous tick (the segment's start for the first), never negative; the table's copy of the budget adds it. The clock is `env.CLOCK` when a function (the test's), else `Date.now`. The `segment_end` tick carries none (it is sent after the segment's last measured tick; the few ms between are unmetered).
- R100: `collect` takes the record id as the part of a cited address before its first space or `#`; the re-read and the lookup use it, then the address as written when no held record has that id; the held-documents count reads the same chains.

**Tests changed, none weakened:** `fanout.test.mjs`'s pinned key tree gains `subjects` and `arms` (B9). `agent-worker.test.mjs`: the env keys it reads admit `CLOCK`. `requirements.test.mjs` R28: the wallclock consumption is now a measured non-negative integer, the rest of the budget compared as before. `t48.test.mjs` R87 controls compare two runs' answers without that one measured figure.

**Bundle rebuilt** (`agent-worker/dist`, R45). It grew from 331,204 B / 36 inputs to 1,788,100 B / 153 inputs: importing `MEANING` pulls `bio-plane/src/query.mjs` and its whole import tree into this member (K3268 forbids a hand-listed copy). BOB: if that size matters, query-language could export the arm names from a small file of their own; `build/manifest.md`'s line for this bundle's inputs now also names query-language.

**Deferred:** none. **Found in other modules:** none.

**Ran:** `npm test` in `agent-worker/` (22 files, 0 fail); `format` 0 failures; `architecture` 0 failures; `coverage` 91 of 91 live ids named; `ownership` 0 failures (9 files).

Size (session_01HesGHMU4B19YsjqB1nVyxV): test runs 8, module lines 3971

## J7 · COMPLETE

B11 handled: merged tranche/R085 (ai-runs R85) again; the payload's subjects.items shape is the one R97's test already drives. Bundle rebuilt byte-identical; npm test 22 files, 0 fail; format, architecture, coverage (91 of 91), ownership 0 failures. Pushed. Nothing else changed since J6.

## Round 5 completion (R101, R102)

**Entries applied** (R085-22): R101 and R102, each named by `test/r101.test.mjs` (new, 12 arms, controls beside them).
- R101: `dedup` (src/index.mjs) collects the candidates it drops (aimed at the target, name held by `basisversions`) and returns one `LOOKED_INDETERMINATE` entry per level, at the dropped candidate's level (the observation log's spelling of the candidate's, via `REPORTING_LEVEL`), its `detail` naming each dropped name and saying it is already held on the question. The tick carries it beside the step's own entry, through `loggable` like R92's; `logged` counts every entry sent. A dropped candidate that states no level has none to be logged at and stays in the step's note alone (the note now names the drops). Control: no drop, no entry; a held name no candidate bears logs nothing.
- R102: `splitAddress` ends the record id at the first space, `#` or `¶`, keeping the `¶` in the extent. `<id>¶1`, `<id> ¶1` and `<id>#p1` all resolve to the record; control: an address naming no held record is read as the address it is.

**Tests changed:** none. With the fix disabled, 7 of r101's arms fail.

**Deferred:** none. **Found in other modules:** none.

**Ran:** `npm test` in `agent-worker/` (23 files; the one failure was R45's stale bundle, cleared by `npm run build`; requirements 304 passed, r101 12 passed); format 0 failures; architecture 0 failures; coverage 93 of 93 live ids named; ownership 5 files, 0 failures.

**Bundle:** rebuilt now (1,789,237 B, 153 inputs) so the module is green; query-language R31 and agent-harness R13 are inputs of it, so it must be rebuilt again, last, on BOB's CHANGE after they merge.

Size (session_01UDzBRUVhc41T5zHi38Bjvf): test runs 4, module lines 4004

## J8 · COMPLETE

R101 and R102 met, each named by test/r101.test.mjs (12 arms, controls beside; 7 fail with the fix off). agent-worker npm test green (requirements 304, r101 12); format, architecture, coverage (93 of 93), ownership 0 failures. Bundle rebuilt now; query-language R31 and agent-harness R13 are its inputs, so send a CHANGE after they merge and I will merge tranche/R085 and rebuild it last. Details in my record, Round 5.

## After B14 (agent-harness R13 and query-language R31 merged)

Merged `tranche/R085`; bundle rebuilt last (1,789,446 B, 153 inputs, sha256 a471a651bd…). agent-harness R13 words an empty-level candidate's description as "this question", never the record id, so two of my tests that pinned the old wording follow it (not weakened: each now asserts "this question" and that the id is absent): `requirements.test.mjs` R22's description arm and `wire-vocabulary.test.mjs`'s "the question it belongs to". R101, R102 stand met.
**Ran:** `npm test` in `agent-worker/`: 23 files, 23 pass, 0 fail; format 0 failures; architecture 0 failures; coverage 93 of 93; ownership 7 files, 0 failures.

Size (session_01UDzBRUVhc41T5zHi38Bjvf): test runs 8, module lines 4004

## J9 · COMPLETE

B14 handled: merged tranche/R085, bundle rebuilt last. agent-harness R13's description wording changed two of my tests' pins (requirements R22, wire-vocabulary), now asserting 'this question' and no raw id. npm test 23 of 23 pass; format, architecture, coverage (93 of 93), ownership 0 failures. R101, R102 stand met. Pushed.

## J10 · REPORT

R103, R104, R105 applied and pushed (f035659052), R106 left retired (B16). Reading for R104: only the meaning level has a compose-time read, so only a meaning-level absence is checked (a row whose bundle_id is the run's target contradicts it; a refused read or one with no rows cannot confirm it, so it is dropped too); the other levels' absences are kept as before. R105 keeps this run's writes in its own state (not in agent-harness's RESUMABLE list), so a drop names 'written by this run in pass N' within a segment and reads as 'already held on the question' after a resume. One test pin moved: fanout.test.mjs B7 'no step that looked at nothing sent an entry' now expects exactly the one R105 write entry (R26's wording 'an entry only when the step's judgement states a look' now has R105 beside it; BOB may want R26 to say so). New test file r103.test.mjs, 14 pass. Bundle not yet rebuilt: waiting for agent-harness R14 to merge (your CHANGE), then merge tranche/R085, rebuild last, run all checks and COMPLETE.

## J11 · COMPLETE

B17 and B18 handled: tranche/R085 merged; bundle rebuilt last with 'npm run build' in agent-worker (1,792,669 B, 153 inputs, sha256 cbc70d83be…). R103, R104, R105 applied (R106 retired). Tests brought in line, none weakened: requirements.test.mjs R22 description (summary no longer appended, agent-harness R14: now asserts it is absent), R11 state keys (+passAdded), agent-harness R3 (2 passes, default 3) and R27 max_steps 400 (each pass now submits a new candidate, helper JN, as R15 needs), wire-vocabulary W6 'a real summary' (asserts not carried, sentence stands). Found in another module: 'node bio-plane/scripts/bundles.mjs' also rebuilds bio-plane's own dist (stale by this round's inputs); I reverted that so I do not write another module's artifact: bio-plane's bundle is stale and BOB's to rebuild. Ran: npm test in agent-worker 24 files, 24 pass, 0 fail; format 0 failures; architecture 0 failures; coverage 96 of 96; ownership 0 failures. Size (session_01GnHDEPeRZqbLPr9bBQbWFn): test runs 6, module lines 4100
