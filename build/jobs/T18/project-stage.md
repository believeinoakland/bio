# project-stage (T18)

**Status** · session_011HnmSxiV9LVGXBFeomYniz · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (`build/plan/current.md` layer 8, project-stage; K651, K624 (1)):
- The split by copy, no `from`: the stage constants and helpers (`publication/index.mjs` 94–169: `STAGE_QUESTIONS_MAX`, `WORK_PRODUCTS_MAX`, `PROJECT_STAGES`, `CLOSED_REASONS`, `CLOSED_RECORDED_MAX`, `STAGE_NEEDS`, `STAGE_SENTENCES`, `READINESS_RUNGS`, `stageWhy`, `stageNeeds`, `earliestInstant`, `closedSince`), `projectStage` with `#readHeld`, `#stages`, `#earliestLeg`, `#conclusionInstant`, `#workProducts` (1330–1544) and the op `projectstage`, into `bio-plane/src/project-stage/index.mjs` as the class `ProjectStage`, with `projectStageOf(host, deps)` (creates no table, registers nothing) and `projectStageOps(s, url)`. Comments' ids re-pointed (R44→R1, R45→R2, R46→R3, R49→R4, R47→R5, R26→R6, R28→R7, R29→R8, R34→R9). Nothing in `publication`'s paths edited (rule (10)); `store.mjs` untouched (K671): `legacy-store`'s layer-10 job adds the dispatch line, `publication`'s job deletes its copy.
- `stage.test` copied to `test/m/project-stage/stage.test.mjs` and renamed to this module's ids; `fixture.mjs` builds publication's `planeWorld` (the real modules it reads) and adds this module's instance and its own `projectStageOps`, through which every op call in the tests goes.
- No catalogue row moved or changed, so none is `awaiting stamp`. No convert names the stage.

**A flaw fixed in this module (R1, R7):** publication's copy throws when its case tables cannot be read (`#workProducts`' SQL is unguarded), against R1's "never throws". Here a failed read of the cases answers `ok: true`, `stage: "undetermined"`, `readiness: "undetermined"`, `published_editions: null`, `work_products: []`, a fixed `detail`, and all four `stages` `reached: null` with that detail, the shape the unread-document case already has. Test: "R1 R7 R3 never thrown". Reported to BOB (publication's copy has the same flaw, deleted by its job).

**Deferred:** none.

**Found in another module:** `publication` `projectStage` (its R44 "never throws") throws if `cases`, `case_documents` or `published_cases` cannot be read; moot once publication's job deletes the copy.

**Tests and checks run** (`job/T18/project-stage` after merging `tranche/T18` @ e5e48dd97a):
- `node --test test/m/project-stage/` (in `bio-plane/`): tests 23, pass 23, fail 0. No layer tests named in `build/manifest.md`.
- `format`: 82 modules, 77 requirements files; 0 failures. `architecture`: 3 product files, 9 relative imports; 0 failures. `coverage`: 9 of 9 live requirement ids named by a test; 0 failures. `ownership` (vs `tranche/T18`): 4 files; 0 failures.

Size (session_011HnmSxiV9LVGXBFeomYniz): test runs 2, module lines 382
