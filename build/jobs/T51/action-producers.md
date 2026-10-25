# action-producers (T51)

**Status** · session_012LQdkfZK3Z7i7zJvQqnFh6 · depth 2 · COMPLETE · handled B2

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

## Fix round 10, Wave A batch 5 (B2)

**Applied.** Published `actionItems` in `bio-plane/test/m/action-producers/fixtures.mjs` (real `actionProducers.actionItems` over a seeded world: one item to the member who created the action, none to another), with `fixtures.test.mjs` (R13) calling it and checking the real answer. Re-pointed the 7 own lines (FIX-E, providers merged): `escalationsDue` (action.test.mjs:135; t45.test.mjs:122,144,358; world.mjs:120) now answers escalation's published `escalationsDue` fixture and `planRead` (t45.test.mjs:288; world.mjs:123) action-plans' published `planRead` fixture, through `world.mjs` helpers (`noEscalations`, `escalationsAnswer`, `planAnswer`, `noSuchPlan`). A test routes the real item to this world's members and projects by naming the fields it changes (`id`, `project`, `opened_by`, `from`, `to`, `instant`); every other field is the provider's. Also moved the same hand-built answers not on the list (action.test.mjs:150, stamps.test.mjs:55, t46.test.mjs:107) to the helpers.

**Markers added.** No `fixtures-own` or `fixtures-generic` marker; no contract marker (both providers are earlier).

**Lines.** Done: 7 of 7. Left: none (no `stay`, no Wave B line of mine).

**Deferred.** None. **Found in other modules.** None.

**Checks.** `node --test` over `test/m/action-producers/*.test.mjs`: 54 pass, 0 fail. `checks/fixtures.mjs . action-producers --list`: 0 failures (answer 0). format 0 failures; architecture 0; coverage 25 of 25 ids; words 0; ownership 0. `impact.mjs origin/tranche/T51 HEAD` (run before commit): 0 affected modules; queue-producers' own line on `actionItems` is re-pointed in its job.

Size (session_017khFK7Ufj5EYQeuEKFTJ3B): test runs 5, module lines 1560

## J2 · COMPLETE · re B2

Fix round 10, Wave A batch 5 complete on job/T51/action-producers. actionItems fixture published (bio-plane/test/m/action-producers/fixtures.mjs, test fixtures.test.mjs R13); 7 own lines re-pointed to escalation's escalationsDue and action-plans' planRead fixtures (7 of 7, none left). Markers added: none. Module tests 54 pass; fixtures/format/architecture/coverage/words/ownership 0 failures; impact named queue-producers, its suite run. Record: build/jobs/T51/action-producers.md.

## Completion (fix round 10, item 75: R26)

**Applied.** R26 met: every item names an action by its title (`#actionName`, `index.mjs`, reading `bundles.title`; an action with no title: "a request", the request-unsent item's own fallback), never its `ACTN-` id: the reminder, legal-threat, released-hold and local-fact items. Test `action.test.mjs` "R26", red on the old code (reminder summary held `ACT-1`), green now.

**Why the tests missed it.** `action.test.mjs` asserted each item's subject, age and doors, never the `summary`, and its fixtures titled every action with its own id (`world.bundle` defaults title = id), so a title and an id were indistinguishable.

**Deferred.** None. **Found in other modules.** None. `plan` fills in `queue.plan-*` sentences take plan ids; not an action id, so outside R26.

**Checks.** Module tests: 55 pass, 0 fail. format 0, architecture 0, coverage 26 of 26, ownership 0, fixtures `--list` 0 failures (no marker added). words: 16 failures, none in action-producers (store-assembly and others, older than this job).

Size (session_012LQdkfZK3Z7i7zJvQqnFh6): test runs 3, module lines 1565
