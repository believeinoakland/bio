# tasks (T19)

**Status** · session_013NyWnRWTkvdb8cPBaL3ELW · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (`build/plan/current.md` layer 11, tasks: kept, re-points; B1).
- Rule 1: `src/tasks/checks.mjs`:12 now imports `isPublicHttpsLocator`, `ISO_TS_RE`, `BUNDLE_ID_RE` from `../record-grammar/index.mjs`; `src/tasks/index.mjs`:25 imports `isMachineStamp`, `isPublicHttpsLocator` from the same. No tasks file imports `bio-checks.mjs` (`checks.mjs`:66 names it only in a comment on where C-19.1 came from); the module tests import no catalogue name. The comment at `index.mjs`:546 now names record-grammar's prefix list (`MACHINE_CLASS_PREFIX`) in place of the catalogue's.
- K789: `test/m/tasks/world.mjs` constructs `credentialsOf(host, {record, membership})` beside membership and migrates it at `boot()`; the two tests that wrote a `credentials` row by hand (`inbox.test.mjs` R1 (N329) and R3's administrator test) now claim the founder through `credentials.claim` (its R1). The two accepted reds are green.
- N410, N412: done in T18 (K723); nothing further.

**Deferred:** none.

**Found in other modules / for BOB** (requirements and `modules.json` are BOB's):
- `build/requirements/tasks.md` Uses still names `legacy-checks` (`isMachineIdentity`, `isMachineStamp`, `isPublicHttpsLocator`); after this job the module imports nothing from `legacy-checks` and uses `isMachineIdentity` nowhere. The line should read `record-grammar`: `isMachineStamp`, `isPublicHttpsLocator`, `ISO_TS_RE`, `BUNDLE_ID_RE` (R1, R3, R4). Likewise `modules.json` `uses` for tasks can drop `legacy-checks` (it already lists `record-grammar` and `credentials`; credentials is now used by the tests only).
- No generated artifact is staled: tasks is an input to none of the bundles in `build/manifest.md`.

**Tests and checks**
- `node --test bio-plane/test/m/tasks/`: before the fixture change `pass 69, fail 2` (the two K789 reds, `no such table: credentials`); after: `ℹ pass 71`, `ℹ fail 0`. The manifest names no layer tests.
- `node checks/format.mjs`: `format: 87 modules, 82 requirements files; 0 failures`
- `node checks/architecture.mjs … tasks`: `architecture: 8 product files, 31 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs … tasks`: `coverage: 1 modules, 11 of 11 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs … tasks tranche/T19`: `ownership: 5 files changed by tasks between tranche/T19 and HEAD; legacy-store: 0 line(s) added, 0 removed; 0 failures`

Size (session_013NyWnRWTkvdb8cPBaL3ELW): test runs 3, module lines 955
