# scheduler (T41)

**Status** · session_01WoUvbRKoQznX2cCJWJvBwg · depth 2 · COMPLETE · handled B2

## Completion (T41-49; SCHEDULER #34)

**Entries applied.** T41-49 (N823, K2438, K2484; N820, K2568):
- **R22, R9 (re-point).** `scheduled-publish` calls `publish-schedule` (its R2): `due`/`wake` `publishSchedule.publishWake()`, `tick` `publishSchedule.publishDue(now)`, key `scheduledpublish`; registered once with `publishSchedule.onPublishScheduled` (its R6) through `listenTo({publishSchedule})`. The owner key is `publishSchedule` (`schedulerOf` builds it with `publishScheduleOf(ctx)`). Clears rule 4 (13)'s scheduler share and rule 4 (20) (`index.mjs`:684's call at the plane's boot): plane, control-plane and scheduler suites build the plane again.
- **R26.** Consumer `question-explore`, key `explore`, after `document-copy`: `due(now)` now when `exploreDue(now)` > 0, else null; `wake(now)` `exploreWake(now)`; `tick(now)` `exploreTick(now)`; no arming notice. investigation's quiet check: no consumer (computed on read). As answered in B2 (K2568).
- **One detail of mine (BOB's to confirm at merge):** the scheduler never builds `question-explorer` itself. `questionExplorerOf(host)` declares its tables to purge but does not create them, so built from the scheduler's defaults in the plane (which does not yet build or migrate it) every purge read failed `no such table: explore_runs` (11 plane tests went red in my first run). It is taken, as `fileSafety` is, through `hand({questionExplorer})` or `schedulerOf(ctx, env, {questionExplorer})`, which the plane calls once it has built and migrated it (T41-63). Until then the consumer is absent in the running plane; it is tested against the real question-explorer in its own world.
- **Inherited reds cleared.** `plane.test.mjs`:199 (R12): the suite runs on capture-requests' scratch plane (`test/m/capture-requests/plane-world.mjs`, K2514: one-matter Civicsmith set, a passing bar each part), the only way a running plane opens a run before N829. `copies.test.mjs`:225 (R25) re-stated: with no store bound `copyWake` is null, so document-copy is not due and nothing is derived; negative control: store bound again, the same firing copies it. `registry`, `files`, `copies` order tests re-stated for the appended consumer.

**Final `uses`** (for BOB at merge): today's list less `publication` (nothing reads it: no import in `src/scheduler` or its tests) plus `question-explorer` (`explore.test.mjs` imports its fixture; architecture's one failure until the edge is applied). `investigation` not added (no consumer, K2568).

**Deferred.** Nothing.

**Found in other modules** (REPORT J3):
- `question-explorer`: `questionExplorerOf` (`index.mjs`:868–891) declares its tables to purge at creation without creating them (`migrate()` is separate), so any host that builds it without migrating breaks every purge read; `publish-schedule`'s factory migrates at creation. Either migrate in the factory or document that the builder must.
- `plane` (T41-63): build and migrate `question-explorer` and hand it to the scheduler (`schedulerOf(ctx, env, {questionExplorer})`), as it hands `fileSafety`; and build `publish-schedule` with its deps before the scheduler first reaches it (today the scheduler's default `publishScheduleOf(ctx)` is its first creation in the plane).
- Generated artifact staled: the plane bundle (rule 4 (14)).

**Reading set** (mechanics §17, over 300 KB: requirements 25 KB, code and tests 239 KB, used modules' Purposes 20 KB and services ~40 KB). Read whole myself: `build/requirements/scheduler.md`; layer 10's row of `build/layers.md`; plan entry T41-49 and rule 4; K2438, K2451, K2484; `src/scheduler/index.mjs`; the tests my entry changes (`t34`, `plane`, `copies`, `fixture`); publish-schedule's Purpose and R1–R8; question-explorer's Purpose and R1 with its `exploreDue`/`exploreWake`/`exploreTick` (`index.mjs`:345–437) and factory; investigation's Purpose, R18 and its quiet code (`index.mjs`:1019–1140). A worker read the other eight test files whole (`alarm`, `consumers`, `files`, `invariants`, `new-work`, `producers`, `rank`, `registry`) and wrote a ~8 KB summary citing file:line for every name of publication or owner keys, every full-list assertion on the order, keys and counts, every source or export read, the ids in titles and the fixtures used; it found the four assertions my append broke (registry :10–18, :130, :155; files :30), all re-stated. Nothing it left out mattered.

**Tests run.**
- `node --test bio-plane/test/m/scheduler/`: tests 129, pass 129, fail 0.
- Users: `tasks`, `queue`, `instance-setup`, `control-plane`: pass 550, fail 5, each accepted: control-plane `r53-routes`:67 (rule 4 (15)), `t34-routes`:24, :211, :253 (rule 4 (17)); tasks `check.test.mjs`:44 (rule 4 (11), listed as :38).
- `plane`: pass 147, fail 8, each accepted: `ask`:69, :182, :234, :264, :287, :301 (rule 4 (12)); `t39`:78 (rule 4 (18)); `findings`:83, failing at :88 (rule 4 (11)). Before my re-point every plane test was red (rule 4 (20)).
- No layer tests in the manifest.

**Checks.** format: 0 failures. architecture: 1 failure, `explore.test.mjs` imports question-explorer's fixture (the `uses` edge above, BOB's at merge). coverage: 26 of 26 live ids, 0 failures. ownership: 9 files, 0 failures.

Size (session_01WoUvbRKoQznX2cCJWJvBwg): test runs 14, module lines 757

## J1 · QUESTION

R26 is ambiguous in two places; my best reading of each, on which I carry on:

1. **investigation's quiet check (its R18).** `investigation` offers no due, wake or tick for `scheduler`: R18 is `quietPrompts({viewer, at})` for `notice-producers`, computed on read (`index.mjs`:1023–1103: `#quiet` judged afresh, the spell opened or closed on each read), plus the members' doors and `watchArrival` for `monitoring`. There is no periodic work to run, and any cadence this module invented would break R7. **Best reading:** scheduler registers no consumer for investigation (nothing it could call without an interval of its own); R26's investigation clause is met by asserting that no consumer of investigation's is registered and that the quiet prompt needs no alarm (a test reads `quietPrompts` turning up a quiet project with no alarm armed). If you mean a consumer, investigation needs `quietDue/quietWake/quietTick` (e.g. a sweep that opens spells), its own job's, and R26 would then name them; I would also drop `investigation` from my `uses` under my reading.

2. **question-explorer's consumer (its R1).** `exploreDue(now)` answers a *count* of due questions (0 when none, `question-explorer/index.mjs`:366), not an instant or null; read as `due` it would be 0 (epoch), i.e. due at every firing. `exploreWake(now)` answers the instant or null. **Best reading:** consumer `question-explore`, key `explore`, `due(now)` and `wake(now)` both `exploreWake(now)`, `tick(now)` `exploreTick(now)`; placed after `document-copy` (appended, R5 naming no slot), holding R1–R4 and R7; no arming notice (question-explorer offers none; its wake is re-derived at every reconcile and at start, R11). Please confirm the name, key and place, or name others.

## J2 · QUESTION

Replaces J1's point 2 (point 1, investigation's quiet check, stands as asked in J1).

2 (revised). **question-explorer's consumer (its R1).** `exploreDue(now)` answers a *count* of due questions (`question-explorer/index.mjs`:366), as `answers`' `standingDue` does (R21's `standing-questions`, read as "any is now"). **Best reading:** consumer `question-explore`, key `explore`; `due(now)` is now when `exploreDue(now)` > 0, else null; `wake(now)` is `exploreWake(now)` (now while any is due, else an Ask's re-check instant, else null; `question-explorer`'s own `EXPLORE_ASK_RECHECK_MS`, never an interval here, R7); `tick(now)` is `exploreTick(now)`. Placed after `document-copy` (R5 naming no slot), holding R1–R4 and R7; no arming notice (question-explorer offers none; its wake is weighed at every firing, `arm` and start, R11). Please confirm the name, key and place, or name others; R5 and R2 would then list them.

## J3 · REPORT

Found in other modules at T41-49 (details in my record's Completion):
1. `question-explorer`: `questionExplorerOf` (`index.mjs`:868–891) declares its tables to purge at creation without creating them (`migrate()` separate), so a host that builds it unmigrated breaks every purge read (`no such table: explore_runs`; 11 plane tests went red when my first cut built it from the scheduler's defaults). `publish-schedule`'s factory migrates at creation; suggest the same.
2. `plane` (T41-63): build and migrate `question-explorer` and hand it to the scheduler (`schedulerOf(ctx, env, {questionExplorer})` or `hand`), as `fileSafety` is handed; until then R26's consumer is absent in the running plane. Also build `publish-schedule` with its deps before the scheduler first reaches it (today the scheduler's default `publishScheduleOf(ctx)` is its first creation in the plane).
3. The plane bundle is staled (rule 4 (14)).

## J4 · COMPLETE

T41-49 complete (record: Completion). R22/R9 re-pointed to publish-schedule (owner `publishSchedule`); R26: `question-explore`, key `explore`, after `document-copy`, as K2568; no investigation consumer. One detail of mine: question-explorer is taken only when handed (`hand` / `schedulerOf` deps), never built by the scheduler (see J3). Inherited reds cleared: rule 4 (13)/(20) scheduler share, `plane.test.mjs`:199 (on capture-requests' scratch plane), `copies.test.mjs`:225 (re-stated). Scheduler 129/129; users and plane: only accepted reds remain (listed in the record). Checks: format 0, coverage 26/26, ownership 0, architecture 1 (the `question-explorer` edge). Final `uses`: drop `publication`, add `question-explorer`; `investigation` not added.
