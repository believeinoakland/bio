# action-producers (T51)

**Status** · session_017khFK7Ufj5EYQeuEKFTJ3B · depth 2 · WORKING · handled B0

## Completion (T51-101)

**Applied.** T51-101 (R23, R24): the 26 findings in `build/plan/words-pass/action-producers.md` are fixed. `words.mjs` no longer holds any sentence: each key is read through `word(key, vars)` from its `words.json` row, and the module's table `ACTION_WORDS` is replaced by `ACTION_KEYS` (the keys read). Canon's question (`queue.action-clock-overdue.noreply`, R23's unchanged key) is held apart by `localize("action-producers.words.noreply_canon", "Noticed: no reply recorded by {date}")`; its row in `words.json` ("No reply recorded by {date}") is not used, as R23 keeps canon's words. The inline sentences in `index.mjs` (the entry's clock text, "with no date", "a clock entry", the "same date" step sentence) are read by key (`action-producers.entry_action_clock`, `.date`, `.summary.clock_entry`, `.step_stand_date`). The date order is `words.json`'s (DEC-333): `date.daymonth` "{month} {day}", so an overdue day reads "August 25". Tests: the copied sentences in `t45`, `t46`, `t47` and `templates.test.mjs` now assert keys (`ACTION_KEYS`, `hasWord`, `word`, `localize`) or compare with `FILLED`/`WORD`; the dated expectations are in the new order. The red `t46.test.mjs` (R23) passes.

**Choices (within the job, recorded here).** Where several `words.json` rows share one English, the module reads the row for its own door or item: `door.actioncorrespond` (not `act.actioncorrespond.label.action`) for "Record a reply", `request-unsent.open` (not `screen.action.pickup`) for "Pick up where you left off", `door.itemtakeup` for "Take this up", `door.actionhold` for "Place a hold".

**Deferred.** None.

**Found in other modules.** None caused by this module. The full `checks/run.mjs` over `/home/user/bio` fails in other modules' test copies (for example `wizard-scripts`); none names `action-producers`.

**Notes for BOB.** (1) `bio-plane/src/setup-words/rows.mjs` is stale for the new id `action-producers.words.noreply_canon` (the stale-rows note of `setup-words/build.mjs --check`); that is expected and regenerates at L1's close. (2) The design's row `queue.action-clock-overdue.noreply` reads "No reply recorded by {date}", not canon's "Noticed: no reply recorded by {date}". The module keeps canon's words, as R23 says; if the design wants its row to be the item's sentence, that is a ruling for BOB.

**Checks.** `node --test test/m/action-producers/` in `bio-plane`: 53 pass, 0 fail. `checks/format.mjs /home/user/bio`: 0 failures. `checks/architecture.mjs /home/user/bio action-producers`: 0 failures. `checks/coverage.mjs /home/user/bio action-producers`: 25 of 25 live requirement ids named by a test. `checks/ownership.mjs /home/user/bio action-producers tranche/T51`: 0 failures. `checks/words.mjs /home/user/bio action-producers`: 0 failures (inline 0, testcopy 0). `setup-words/build.mjs --check`: stale-rows note only, naming the new id above; no refusal.

Size (session_01MEUzkEwm5YofaKLSUTbrQR): test runs 2, module lines 1560.

## J1 · COMPLETE

T51-101 (R23, R24) is complete on job/T51/action-producers at 0ea9b88073. The 26 words-pass findings are fixed: words.mjs holds no sentence; keys are read through word(); canon's question is held apart by localize; dates follow words.json. Tests: action-producers 53 pass; coverage 25 of 25 ids; format, architecture, ownership 0 failures; words.mjs for action-producers 0 failures. One note for BOB, in the record: rows.mjs is stale for action-producers.words.noreply_canon (expected until L1's close), and words.json's queue.action-clock-overdue.noreply differs from canon's words, which R23 keeps. Record: build/jobs/T51/action-producers.md (Completion section).
