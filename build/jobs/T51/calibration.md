# calibration (T51)

**Status** · session_01PxHWJheiSaeECCE8B1sywP · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Generated artifact made stale by this job (manifest §14; not edited by me): `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` are built by `bio-plane/`: `npm run build` from the plane's source, which includes `src/calibration.mjs` and `src/calibration/` (T51-187 changed their text, the same sentences). BOB regenerates at the layer close.

Process-tool flaw (checks/words.mjs, plain arm, not my module): the `plain` arm skips lowercase strings that contain a comma, so a member-facing sentence joined with a comma escapes it (the drifted-measurement and calibration-date refusal sentences in `calibration.mjs` were such, and were converted under R13 by hand here). Suggest BOB widen the arm before the layer-close words run.

Missing word rows (for the design's missing-row batch, K3944; not added by me): `calibration.calibration.this_engine_now_measures_better` is code-origin only, so the test pins what the sentence must name rather than its text. New code-written ids with no row yet: `calibration.calibration.a_calibration_carries_the_date`, `calibration.calibration.a_calibration_names_who_ran`, `calibration.calibration.this_engine_now_measures_worse`, `calibration.calibration.an_announcement_signal_is_an`, `calibration.calibration.an_announcement_signal_names_the`, `calibration.calibration.an_announcement_signal_names_where`, `calibration.index.registering_names_the_engine`, `calibration.index.registering_names_the_probe`, `calibration.index.nothing_has_ever_probed`, `calibration.index.next_probe_at_cadence`.

## J2 · COMPLETE

**Entries applied (T51-187):** the words check's 6 findings (the inline pair in `calibration/index.mjs`, the 4 test copies), its 7 `plain` findings and its 2 code test copies (K3957, K3962), each converted: a sentence equal to a word-table row is `word(key)`; a sentence written first in code is `localize(id, en)`, with the same text. Under setup-words R13 I also converted the other member-facing sentences in the same files that the plain arm's comma rule let pass (the drift verdicts' `why`, the refusal details for undated, unattributed, unnamed-signal and unnamed/no-probe subjects, the subject's probe-state phrase, and the no-engine and cadence fallbacks); `calibration/checks.mjs` `CAL_UNNAMED` now reads `word('refusal.CAL_UNNAMED')`. The test file copies no sentence: it asserts keys or composes the answer from `word`, with the cadence taken from `cadenceSentence()`.

**Deferred:** nothing inside the module. One weaker pin, by design: `drifted(DRIFT.BETTER).why` is code-origin with no word-table row, so the test asserts the name it must carry (`Civicsmith`) rather than the sentence; the exact pin returns when the design's row lands (see REPORT).

**Reports to BOB:** (1) the generated plane bundle is stale (REPORT, sent first); (2) the words check's `plain` arm skips comma-joined sentences, a process-tool gap (REPORT); (3) the missing rows for ten new code ids and for the BETTER sentence (in the same REPORT, for the missing-row batch). Not mine: the full `checks/run.mjs` shows failures in other modules only (words 3,899; coverage 30 failures, all in modules I did not touch).

**Merge:** `tranche/T51` merged into `job/T51/calibration` (merge, not rebase, K1991); the merge brought 74 files from the tranche and no conflict. Tests and checks re-run on the merged tree.

**Checks run (from the process repository, product `/home/user/bio`):**
- `node checks/format.mjs`: 175 modules, 174 requirements files, 0 failures.
- `node checks/architecture.mjs bio calibration`: 10 product files, 30 relative imports, 0 failures.
- `node checks/coverage.mjs bio calibration`: 20 of 20 live requirement ids named by a test, 0 failures.
- `node checks/ownership.mjs bio calibration tranche/T51 job/T51/calibration`: 5 files changed (the 4 module files and this record), 0 failures.
- `node checks/words.mjs bio calibration`: 0 failures (was 15 before this job).
- `node checks/run.mjs bio`: format 0, architecture 0, channels 0 failures; words and coverage fail only in other modules.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note for the new ids, expected until BOB regenerates `rows.mjs` at the layer close; no refusal naming this module.
- Module tests `node --test test/m/calibration/*.test.mjs` in `bio-plane/`: 73 pass, 0 fail (run twice; once on the merged tree).

**Layer tests:** none named in `build/manifest.md`.

**Note on the commit:** the trailer for the model's co-author line is left out of the commit message, because the model-identity rule forbids a model identifier in what is pushed to a repository. The Claude-Session trailer is kept.

Size (session_01PxHWJheiSaeECCE8B1sywP): test runs 2, module lines 1048
