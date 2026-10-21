# following (T51)

**Status** · session_01CGcpL8Q6GG6DotmRFDtXaz · depth 2 · WORKING · handled B1

## J1 · REPORT

Findings outside this module's code (nothing here is changed by this job):

1. `docs/development/ux-substrate/screens/words-reads.json` (the design's generated list, `following` section, built from T49) lacks five refusal keys that `words.json` holds and following reads: `refusal.MARK_NO_ITEM`, `refusal.MARK_NO_SUCH_ITEM`, `refusal.SECOND_LOOK_NO_NOTE`, `refusal.SECOND_LOOK_NOT_OPEN` (read through `checks.mjs`' `row()`, T50's rows) and `refusal.MACHINE_CANNOT_MARK` (read by `index.mjs` through `word()`). Each is in `bio-plane/src/setup-words/rows.mjs`. The file is generated and was not edited; BOB to regenerate it.
2. `node bio-plane/src/setup-words/build.mjs --check` reports `rows.mjs` stale. The note names this job's new `following.index.*` ids (the expected stale-rows note). It is not a refusal.
3. `node checks/run.mjs /home/user/bio` reports failures in other modules (wizard-scripts testcopy and others; coverage 24 failures across modules). None names `following`. `words.mjs` over monitoring, following, link-sweep and scheduler has no finding naming following.

Nothing deferred. No flaw found in another module's code.

## J2 · COMPLETE

Applied T51-155 (B1):
- The 45 `plain` findings in `index.mjs` are each read through `localize("following.index.<slug>", en, vars)`, the slugs listed in the commit's diff. The refusals and their codes are unchanged.
- The 2 test copies are fixed in `test/m/following/fixture.mjs`: the provenance sentence and the matter-not-of-plan detail are `localize` calls under `following.fixture.*` ids.
- The entry's read-key item: `following.unscheduled.read_member_act` and `following.why.key_repeated_row` are held in `rows.mjs` and read by the module; the five refusal keys the design's list lacks are in REPORT.

Deferred: none.

Tests (run from `bio-plane`): `node --test test/m/following/`: 112 pass, 0 fail, before and after the fixture fix. No layer tests named in the manifest.

Checks (process repo, against /home/user/bio on `job/T51/following`):
- `checks/format.mjs`: 176 modules, 0 failures
- `checks/architecture.mjs following`: 0 failures
- `checks/coverage.mjs following`: 35 of 35 live ids named, 0 failures
- `checks/ownership.mjs following tranche/T51 job/T51/following`: 0 failures
- `checks/words.mjs following`: 0 failures
- `checks/words.mjs monitoring following link-sweep scheduler`: no finding names `following`
- `checks/run.mjs`: no finding names `following` (other modules' failures in REPORT)

Size (session_01UBHjrsbnMdNqWryj6ZQxAG): test runs 2, module lines 2197

## J3 · REPORT

Findings outside this module's code (nothing here is changed by this job):

1. `node checks/run.mjs /home/user/bio` (full run, after the commit): coverage reports 4 live ids named by no test, all in other modules. `agent-harness` R17; `agent-runner` R37, R38, R40; `installer-steps` R26, R31; `journey-check` R19. None is `following`. Not touched here.
2. `node checks/run.mjs` also reports architecture and format as clean; words, channels and ownership report 0 failures.

Nothing deferred. No flaw found in another module's code by this job.

## J4 · COMPLETE

Applied B2 (CHANGE, the R1 red at `checks.test.mjs`, tests only; commit 8d76643e0c on job/T51/following):

- Cause: `otherFamilies()` imports every plane file. `plane/store.mjs` and `plane/index.mjs` reach `plane/register.mjs` (R68), which throws (`op-declarations: adminendorse: registered after the first read (R81)`) if a table was read before its first import. The walk had read one.
- Fix (test only): `otherFamilies()` imports `bio-plane/src/plane/register.mjs` first, before the walk, as the plane's own graph does. I first tried skipping `register.mjs` in the walk; that did not work, because the plane's other files import it transitively.
- No source file, no requirement line changed. No test weakened: the C-137.1–20 walk and every row test are as before.

Deferred: none.

Tests (`bio-plane/`): `node --test --test-force-exit test/m/following/*.test.mjs`: 115 pass, 0 fail. `checks.test.mjs` alone: 33 pass, 0 fail, including `R1 C-137.1–C-137.20` (the walk) and `R18`, `R4`.

Checks (process repo, against /home/user/bio on job/T51/following):
- `checks/format.mjs`: 175 modules, 175 requirements files, 0 failures
- `checks/architecture.mjs following`: 0 failures
- `checks/coverage.mjs following`: 36 of 36 live ids named by a test, 0 failures
- `checks/ownership.mjs following tranche/T51 job/T51/following`: 0 failures
- `checks/words.mjs following`: 0 failures
- `checks/run.mjs /home/user/bio`: no finding names `following`; four other modules' coverage gaps are in REPORT.

Size (session_01CGcpL8Q6GG6DotmRFDtXaz): test runs 6, module lines 2210
