# queue (T13)

**Status** · session_01PQNFqfP7kPh56cqLi4WAzf · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** N322: R23's exhausted id space. When record-core's `mintOpaqueId("TASK", …)` answers null, the drain keeps the event and its `waiting` entry now carries `mintExhausted("TASK")`'s `code` (`MINT_EXHAUSTED`), `check` (C-59.6) and `detail` (record-core R62), in place of the sentence queue wrote itself (`src/queue/index.mjs`, `taskDrain`). Queue no longer spells the code anywhere.

**Improvements in this module.** `taskDrain`, `taskForward` and `taskResolve` given no `now`, and the project arm of `proposeDispose`, took their instant from the wall clock alone, bypassing the module's own clock (`deps.now`, then `BIO_NOW_MS`, then the wall, as the module header states). All four now use it; in production (no binding) the instant is unchanged. It also fixes a latent fault in R23's existing test, whose `TASK-2026-` pattern read the wall clock and would have failed from 2027.

**Deferred.** None.

**Requirement marks.** R23's `not yet met: N322`, and the header's "R23's `waiting` entry carries `mintExhausted`'s fields, not yet met", are now met. `build/requirements/queue.md` is outside my paths (the ownership check), so I ask BOB to strike both.

**Found in other modules, and stale artifacts (reported, not changed).**
- record-core: `build/requirements/record-core.md` still marks R62 `not yet met: N322` (in R62 and in its Status line), though `mintExhausted` and C-59.6 are merged and answer as R62 says. That is record-core's (or BOB's) to strike.
- `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`), `not_product`: made stale by this change to `src/queue/index.mjs`. For BOB to regenerate at the layer's close.
- Check rows added, moved or retired: none. Queue's table is unchanged; R23's `waiting` entry now names record-core's existing row C-59.6. So nothing here is for promotion to stamp (N318).
- `civicos-ui/` and affordances' lists: no hit for `MINT_EXHAUSTED`, "free task id" or `mintExhausted`. No op or act was added or retired.
- No module new to queue is imported: `mintExhausted` is record-core's, already in queue's `uses`.

**Tests** (from `bio-plane/`):
- `node --test test/m/queue/`: tests 61, pass 60, fail 0, todo 1 (R39's bias half, unchanged: QUEUE #2 Q4, N326). New: "R23 (N322)" fills the whole TASK id space for the event's slug (10,000 resolved rows), so record-core's real mint answers null. It asserts that the event is kept, no task is written, and the entry equals `{captureSha, attempts, code, check, detail}` from `mintExhausted("TASK")`. Also new: "R23, R25" (the instance clock in drain, forward and resolve) and an `at` assertion in R27's success test.
- Negative control: with the change reverted, those three tests fail (57 pass, 3 fail); with the change, all pass.
- `node --test test/m/`: tests 2746, pass 2724, fail 0, todo 22.
- Old battery reaching the inbox: `inbox`, `task-drain-alarm`, `task-fence`, `opaque-ids`: 4 pass, 0 fail.
- Layer tests: none named in `build/manifest.md`.

**Checks** (from the process repository, on 601833debd):
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture queue`: 13 product files, 53 relative imports; 0 failures.
- `coverage queue`: 40 of 40 live requirement ids named by a test; 0 failures.
- `ownership queue tranche/T13`: 4 files changed; legacy-store, legacy-checks, legacy-index 0 lines added, 0 removed; 0 failures.

Size (session_01PQNFqfP7kPh56cqLi4WAzf): test runs 5, module lines 4,899

## J1 · COMPLETE

N322 applied: R23's exhausted TASK mint keeps the event and its waiting entry carries record-core mintExhausted("TASK")'s code, check (C-59.6) and detail. Also, in my module: the inbox acts and the project arm of proposeDispose stamp the instance clock (deps.now / BIO_NOW_MS) when given no instant. test/m/queue 60 pass 0 fail 1 todo (R39 bias half); test/m 2724 pass 0 fail; format, architecture, coverage, ownership 0 failures. For you: strike R23's N322 marks in queue.md (outside my paths); record-core.md still marks R62 not yet met; bio-plane dist bundle stale. No check row changed. Details in my record's Completion.
