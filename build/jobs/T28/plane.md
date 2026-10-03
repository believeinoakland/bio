# plane (T28)

**Status** · session_01DTDPxZBZLmQC7tRB7xsnJX · depth 2 · COMPLETE · handled B1

## Completion (PLANE #18)

**Entries applied** (L11; R16, R17, folded at K1313).
- N522 R16 (K1307): `acceptedWorkOf(ctx, {record, promotion})` made directly after the plane's `promotionOf(ctx, {order: STEP_ORDER})`, before inquiry's factory and every reader, so its promotion check (accepted-work R4) is registered at its rank (`STEP_ORDER`, membership R83) before the first request. The same instance is handed to `basisVersionsOf`, `reevaluationOf`, `publicationOf`, `strengthOf` and `caseImportOf`.
- N520, N522 R17: `registerCaseCheckerPublicReads(ctx, {publicRead})` (case-checker R15; public-read R18) and `caseImportOf(ctx, {env, checkCaseFile, strength, acceptedWork, reevaluation})` built directly after `strengthOf` (which follows `ratificationOf`), once strength (with its retrieval) and reevaluation (with its environment) exist, since a factory reads its deps on its first call only. No object store is handed to case-import (K1319). At creation it migrates, declares its tables to purge, registers its figures and starts, filling accepted-work's registration. `caseImportOf(ctx).migrate()` runs in `#migrate` after docket's. `caseImportOps` is spread directly after `ratificationOps`.
- Tests: the new `test/m/plane/accepted.test.mjs` (R16 ×2, R17 ×5). `maps.mjs` (R5's statement) gains case-import's map. `notices.test.mjs`' R2 negative control now lists case-checker's two public reads with the squatter's; it is exact, not loosened.

**Deferred.** None.

**Found in other modules.** None. No catalogue row added by plane, so no `awaiting stamp` row is mine. Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` is stale from this change (plane's source); BOB regenerates it at the close (B1).

**Tests and checks** (on `job/T28/plane` after merging `tranche/T28` @ a278b38f93):
- `node --test test/m/plane/`: 72 tests, 72 pass, 0 fail.
- `node --test test/system/migrate-released.test.mjs`: 1 pass, 0 fail.
- Scratch merge of `origin/job/T28/queue` and `origin/job/T28/control-plane` (J2 COMPLETE): plane, control-plane and queue suites gave 324 tests, 320 pass, 4 fail. All 4 are control-plane's R49 tests, which need op-declarations' R14 specs (not yet pushed). Plane alone gave 72 of 72.
- `checks/format.mjs`: 0 failures. `architecture.mjs plane`: 0 failures. `coverage.mjs plane`: 17 of 17 live ids named, 0 failures. `ownership.mjs plane tranche/T28`: 5 files, 0 failures.

Size (session_01DTDPxZBZLmQC7tRB7xsnJX): test runs 9, module lines 30

## J1 · COMPLETE

R16 and R17 applied; tranche/T28 merged @ a278b38f93. plane tests 72/72; migrate-released 1/1. Scratch merge with queue and control-plane: plane all green; control-plane's 4 R49 tests wait on op-declarations' R14 specs. Checks: format, architecture, coverage (17/17), ownership: 0 failures. No catalogue rows added; dist bundle stale for BOB's regeneration. Record: build/jobs/T28/plane.md.
