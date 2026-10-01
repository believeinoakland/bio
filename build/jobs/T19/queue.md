# queue (T19)

**Status** · session_0194nGye2XVtbH9VPZwTcetB · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (`build/plan/current.md` layer 11, queue; B1):
- `src/index.mjs`' `op=queue` arm moved into the module as `bio-plane/src/queue/door.mjs` (`QUEUE_DOOR_OPS`, `queueOp`, `queueFeedOp`), connections' `linkProjectOp` pattern: the door asks the store's `queue` with the control plane's `member`/`viewer` stamps (only `now`, `limit` from the caller), asks `actionkinds`, and answers through `queueAnswer(r, {gate, kinds})` handed the gate (`ACT_GATE`) by the door; silences and envelope refusals keep REC-52's answers, a store refusal is 400 (R17). `src/index.mjs` (legacy-index, `from`): the arm and its comment removed, the import swapped to `./queue/door.mjs` and one delegating call added (4 lines added, 49 removed; listed by the ownership check). The stamps stay the control plane's, composed at the call.
- Rule 1 re-point: `src/queue/index.mjs` imports `normalizeType`, `STATES`, `vocabFor`, `isMachineIdentity` from `record-grammar` (its `index.mjs`). No queue file imports `bio-checks.mjs` (`checks.mjs`' header names it only as history). `test/m/queue/invariants.test.mjs`' catalogue arm dropped.
- K789: `test/m/queue/world.mjs` builds the real `credentials` (`credentialsOf(host, {record, membership})`, migrated after membership) so the self-registered-key read (queue-producers R14) finds `signers`; no queue test claims, so no claim re-route was needed. The 17 accepted reds are green.
- Found and fixed in my fixtures: `world.mjs` built tables from `src/schema.mjs`' `SCHEMA`, which holds no fragment since legacy-store's T19 job, so 5 more tests failed (`no such table: captured_locators`). It now creates provenance R48's `register` and `captured_locators` with their contracted columns, as it already did for the other read contracts, and reads nothing from `schema.mjs` (which plane deletes).
- `queuestate.mjs`' two `tools/mintid.mjs` mentions re-worded as history (the plan's legacy-index entry); three comments saying "stamped at index.mjs" now say "by the control plane"; the module header names the door.

**Deferred:** none. R18 (REC-202) and R19 (N374) marks are not this tranche's (B1).

**Found in other modules:** `src/index.mjs`:27 (legacy-index) still says vocabularies are "asked by op=affordances and op=queue below"; op=queue is no longer below. A comment only; I may only remove there, so it is left for legacy-index/plane.

**Tests and checks** (on `job/T19/queue` merged with `tranche/T19` @ a61e4f8dd1):
- `node --test bio-plane/test/m/queue/`: tests 74, pass 74, fail 0 (69 before the door suite; was 52 pass, 17 fail at start).
- Through the real plane: `node bio-plane/test/queue.test.mjs` 36 passed, 0 failed (op=queue end to end, options byte-equal to op=affordances); `test/m/control-plane/store-class.test.mjs` pass 6; `test/queue-state.test.mjs`, `test/d125-findingmute.test.mjs` pass.
- `format`: 87 modules, 82 requirements files; 0 failures. `architecture … queue`: 15 product files, 44 relative imports; 0 failures. `coverage … queue`: 37 of 37 live requirement ids named by a test; 0 failures. `ownership … queue tranche/T19`: legacy-index 4 added, 49 removed; legacy-store, legacy-checks 0; 0 failures.

Size (session_0194nGye2XVtbH9VPZwTcetB): test runs 13, module lines 2591
