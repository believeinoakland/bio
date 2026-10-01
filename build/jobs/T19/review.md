# review (T19)

**Status** · session_01Gjpq2CxzEx1JPPHzAofDxV · depth 2 · COMPLETE · handled B1

## Completion (REVIEW #6)

**Entry applied** (`build/plan/current.md` layer 8, review; BOB's B1 START, rule 1), so no review file imports `bio-checks.mjs`:
- `src/review/index.mjs`:62: `isMachineIdentity` from `record-grammar` (`../record-grammar/index.mjs`, its `actors.mjs` export; N423, the `uses` edge K780 added). Same function the catalogue re-exported, so no change of behaviour.
- `src/review/index.mjs`:10: comment re-worded ("the check catalogue" for `bio-checks.mjs`).
- `src/review/checks.mjs`:13: comment no longer names `tools/mintid.mjs` (draft-T19 legacy-index entry: owners re-word it).
- `test/m/review/acts.test.mjs`:7: `PROJECT_VISIBILITY_CHECKS` from membership's index (its L2 copy).
- `test/m/review/invariants.test.mjs`: `import * as catalogue` dropped. The R23/R27 arm now reads its own rows and the homes it may import (record-core, membership, strength, basis-versions' `checks.mjs`, publication, case-authoring; its `uses`): C-87.12 held by no row, record-core's C-59.6 is `MINT_EXHAUSTED`, none of review's numbers is held elsewhere, and C-32.16's fence siblings stand at their homes (C-32.2 basis-versions, C-32.6 case-authoring). `MACHINE_FENCE_CHECKS` is not read (deleted in L6). C-32.1 (ratification) and C-32.7/.8 (inquiry-grammar) are not read: neither is in review's `uses`, so the architecture check would refuse the import; not needed for R23.

**Deferred:** none. Old suites untouched (K619). No requirement changed; no service changed, so no user's tests to run.

**Found in another module:** none. (`build/requirements/review.md`:60 still marks the record-grammar use "*(not declared: T19 layer 8)*"; `modules.json` declares it since K780, so that note is stale. BOB's file.)

**Tests and checks** (on `job/T19/review`):
- `node --test bio-plane/test/m/review/`: tests 33, pass 33, fail 0.
- `format.mjs`: 87 modules, 82 requirements files; 0 failures.
- `architecture.mjs … review`: 8 product files, 36 relative imports; 0 failures.
- `coverage.mjs … review`: 27 of 27 live requirement ids named by a test; 0 failures.
- `ownership.mjs … review tranche/T19`: 5 files changed; legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_01Gjpq2CxzEx1JPPHzAofDxV): test runs 1, module lines 1010

## J1 · COMPLETE

Entry applied (layer 8, review; B1). No review file imports bio-checks.mjs: index.mjs:62 isMachineIdentity from record-grammar; acts.test.mjs:7 PROJECT_VISIBILITY_CHECKS from membership; invariants.test.mjs drops the catalogue and reads its own rows and the homes in its uses (C-87.12 held by no row, C-59.6 record-core's, C-32.2/C-32.6 at their homes); comments at index.mjs:10 and checks.mjs:13 re-worded. Tests 33/33 pass; format, architecture, coverage (27/27), ownership: 0 failures. Nothing deferred. One note for BOB: requirements/review.md:60's '(not declared: T19 layer 8)' is stale since K780. Record: build/jobs/T19/review.md on job/T19/review.
