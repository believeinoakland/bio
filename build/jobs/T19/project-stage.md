# project-stage (T19)

**Status** · session_0176SssFQ9f6sgcBWFaQfoad · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (`build/plan/current.md` layer 8, project-stage, new (refresh); B1):
- `src/project-stage/index.mjs`:24 imports `parseFrontmatter` from `../record-grammar/index.mjs` (record-grammar R6–R11, the same contract), so no project-stage file imports `bio-checks.mjs`. One line. My tests import no catalogue name.
- K819: the two tests that wrote a no-project `concluded` inquiry (`R2 a question is held in any shared state…`, `R4 uncounted inputs move nothing…`) now write it as inquiry R11 accepts it: a `conclusion`, a `falsifier` and a leg (a `CONCLUDED` constant in the test, through the fixture's `extra`; publication's fixture is not changed). In the second, Q1 is held with its leg before the baseline is taken, so the no-project conclusion stays the only change compared. No assertion weakened.
- Old suites: none deleted (K619).

**Deferred:** none.

**Found in other modules** (also in `REPORT` J1):
- `build/requirements/project-stage.md` Uses still names `legacy-checks: parseFrontmatter`; it is now `record-grammar` (its R6–R11). BOB's file.
- `test/m/publication/fixture.mjs`:18, which my fixture builds on, still imports `parseFrontmatter` from `checks/bio-checks.mjs` (publication's own test file; record-grammar re-exports the same function).

**Tests and checks** (on `job/T19/project-stage`, merged with `tranche/T19` @ 3c731d90b5):
- `node --test test/m/project-stage/` (from `bio-plane/`): before the fixture fix 21 pass, 2 fail (the two K819 tests); after, `tests 23 · pass 23 · fail 0`.
- No layer tests named in `build/manifest.md`. No service I provide changed.
- `format: 87 modules, 82 requirements files; 0 failures`
- `architecture: 3 product files, 9 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 9 of 9 live requirement ids named by a test; 0 failures`
- `ownership: 3 files changed by project-stage between tranche/T19 and HEAD; 0 failures`

Size (session_0176SssFQ9f6sgcBWFaQfoad): test runs 2, module lines 382

## J1 · REPORT

Two findings outside my files, neither blocking. (1) build/requirements/project-stage.md Uses still names legacy-checks for parseFrontmatter; since this job it is record-grammar (its R6–R11, same contract). (2) test/m/publication/fixture.mjs:18 (publication's test file, which my fixture builds on) still imports parseFrontmatter from checks/bio-checks.mjs.
