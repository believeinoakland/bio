# following (T51)

**Status** · session_01UBHjrsbnMdNqWryj6ZQxAG · depth 2 · WORKING · handled B0

## J1 · REPORT

Findings outside this module's code (nothing here is changed by this job):

1. `docs/development/ux-substrate/screens/words-reads.json` (the design's generated list, `following` section, built from T49) lacks five refusal keys that `words.json` holds and following reads: `refusal.MARK_NO_ITEM`, `refusal.MARK_NO_SUCH_ITEM`, `refusal.SECOND_LOOK_NO_NOTE`, `refusal.SECOND_LOOK_NOT_OPEN` (read through `checks.mjs`' `row()`, T50's rows) and `refusal.MACHINE_CANNOT_MARK` (read by `index.mjs` through `word()`). Each is in `bio-plane/src/setup-words/rows.mjs`. The file is generated and was not edited; BOB to regenerate it.
2. `node bio-plane/src/setup-words/build.mjs --check` reports `rows.mjs` stale. The note names this job's new `following.index.*` ids (the expected stale-rows note). It is not a refusal.
3. `node checks/run.mjs /home/user/bio` reports failures in other modules (wizard-scripts testcopy and others; coverage 24 failures across modules). None names `following`. `words.mjs` over monitoring, following, link-sweep and scheduler has no finding naming following.

Nothing deferred. No flaw found in another module's code.
