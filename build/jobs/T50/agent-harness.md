# agent-harness (T50)

**Status** · session_01VB7aNzqCDcGRLaxhz6h5yc · depth 2 · COMPLETE · handled B3

## Record

**Entries applied (T50-66):** R18 and R19, both in `agent-harness/src/harness.mjs`. R17 not built: it waits on BOB's CHANGE saying agent-runner R38's proof passed (BOB's note 1).
- **R18.** `levelsWithoutScope(state)` (new, pure) and `emptyLevelCandidates` skipping those levels. `scope` and `disagreed` are in `RESUMABLE`, restored by `resumeFrom` and kept by `publishableState`'s restart. `scope` is not in `JUDGEABLE`; a judgement naming it leaves it as set. It asks `run-rules`' `levelEmptyHolds` (R35; imported from `run-rules/index.mjs`).
- **R19.** `JUDGEABLE` gains `disagreements`, applied at `compose` only. A malformed list is refused by key (`disagreements[10]`, `disagreements[i].levels`, `.record`, `.<extra key>`) at any step. `disagreementsToSettle` and `disagreementKey` are new. `advance` settles the pairs when the step leaves `compose` (also for a close), at most 10 in all; nothing else about the pass moves.
- Tests: the R4 test for `JUDGEABLE` amended; R13/R14 fixtures given a `scope`; R8's `ARGS` has rows for the three new exports; seven new tests name R18 and R19.

**Dependency not yet on the tranche branch:** `levelEmptyHolds` is run-rules' R35 and was not merged at my start. I ran the tests against a temporary local stub of it (never committed). The committed code imports it; until run-rules' job is merged into `tranche/T50`, `agent-harness`' tests fail at import. After BOB's CHANGE: merge `tranche/T50`, re-run the module's tests and the checks.

**Deferred:** R17 (above).

**Reading of R18, posted as a QUESTION (J1):** the text says `scope.documents` is "the least `documents` the statement answered over a level's reads", but its control (one read of `documents: 0` and one of 2 keeps the candidate) needs the greatest. I read `scope[level].documents` as the shell's aggregate, kept when any read had a document, and the harness only tests that figure with R35.

**Found in another module:** `agent-worker` must set `scope` per level from the plane's statement and state each `disagreementsToSettle` pair (its R113+). `emptyLevelCandidates` now composes none for a level with no `scope` entry, so a shell that does not set it writes no `level-empty` candidates. Bundles that input this module's files (`agent-worker`'s) are stale until regenerated at layer close (BOB).

**Tests and checks (with the stub in place for the tests):** `node --test agent-harness/test/`: 55 tests, 55 pass, 0 fail. `checks/format.mjs`: 0 failures. `checks/architecture.mjs agent-harness`: 0 failures. `checks/coverage.mjs agent-harness`: R17 named by no test (expected, not yet met). `checks/ownership.mjs agent-harness tranche/T50`: 0 failures. `checks/run.mjs`: architecture 0 failures; the coverage failures are other modules' (inherited), plus R17.

Size (session_01VB7aNzqCDcGRLaxhz6h5yc): test runs 4, module lines 1939

## J1 · QUESTION

R18 text: scope documents is 'the least documents the plane's statement answered over a level's reads', but its control (one read of documents 0 and one of 2 keeps its candidate) needs the greatest. My reading: scope[level].documents is the shell's aggregate, any read with a document in scope making it 1 or more; the harness only passes that figure to run-rules R35 (levelEmptyHolds). Built and tested that way; please fix the wording of R18 (or tell me otherwise).

## J2 · COMPLETE

R18 and R19 built in agent-harness/src/harness.mjs, 55 module tests pass, format, architecture, ownership 0 failures; coverage names only R17 unmet. R17 NOT built: waiting on your CHANGE once agent-runner R38's proof passes. Caveat: R18 imports levelEmptyHolds (run-rules R35), not on tranche/T50 at my start; I tested against an uncommitted local stub, so my module's tests fail at import until run-rules merges. Send a CHANGE (merge tranche/T50) after it does. agent-worker must set scope per level and state each disagreementsToSettle pair. See record.

## Record, after B3 (CHANGE)

Merged `tranche/T50` (K3699: run-rules R35 `levelEmptyHolds` is real). Against it: `node --test agent-harness/test/`: 55 tests, 55 pass, 0 fail. `checks/format.mjs` 0 failures; `checks/architecture.mjs agent-harness` 0 failures; `checks/ownership.mjs agent-harness tranche/T50` 0 failures; `checks/coverage.mjs agent-harness`: R17 only (not yet met, waiting on BOB's CHANGE for agent-runner R38's proof). R18 reading confirmed by BOB's B2 (K3691), no change to the code.

**Users of what I changed (`emptyLevelCandidates`, R18): `agent-worker`'s tests fail, as the change makes inevitable.** `node --test agent-worker/test/`: 25 files, 17 pass, 8 fail (`fanout`, `harness`, `r085`, `r101`, `r103`, `r107`, `requirements`, `wire-vocabulary`). Cause for the ones I read: its shell passes no `scope`, so `emptyLevelCandidates` composes no `level-empty` candidate (r101: no entry, queue empty; wire-vocabulary: no candidate to read). I did not compare each failing file against the tranche before my change. Owner: `agent-worker` (T50-65) must set `state.scope` per level from the plane's four-level statement (retrieval R13) and state each `disagreementsToSettle` pair (R116/R113+), and give its fixtures a `scope`; I cannot edit it.

## J3 · COMPLETE

Merged tranche/T50 (run-rules R35 real). agent-harness: 55/55 tests pass, format, architecture, ownership 0 failures, coverage names only R17 (waiting on your CHANGE for agent-runner R38's proof). HEADS UP for agent-worker (T50-65): R18 means emptyLevelCandidates composes nothing without state.scope, so agent-worker's own tests now fail (8 of 25 files: fanout, harness, r085, r101, r103, r107, requirements, wire-vocabulary; I read r101 and wire-vocabulary: both no scope, no level-empty candidate). It must set scope per level from the plane's four-level statement, state each disagreementsToSettle pair, and give its fixtures a scope. Not compared file by file against the tranche before my change. See record.
