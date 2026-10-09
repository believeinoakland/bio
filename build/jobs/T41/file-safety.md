# file-safety (T41)

**Status** · session_01VmeqiX8nkarTaN1DJ1ZZBU · depth 2 · WORKING · handled B1

## Completion (T41-8c, tests only)

**Entries applied.** T41-8c (N822, K2442): `intake.test.mjs` R2's sight block (was :105, "an administrator sees every capture", red since membership's merge, rule 4 (11)) re-stated for D54: `member:boss`, `admin` and `member:admin`, neither invited nor joined to the hidden `PROJ-1` (no visibility recorded), get `FILE_NOT_HELD` exactly as for a digest never held. Negative controls: `boss`, once joined, sees the capture (the founder, not joined, still does not); `boss` and `admin` see a capture in `PROJ-2`, made discoverable through membership's own `projectCreated`; `m2`, outside it, does not. Improvement found by the reading summary and made: `scan.test.mjs` R15's sight block gains the same D54 case (`boss`, `admin` pass over the hidden project's note; `m1`, its participant, reads it). No product code and no requirement changed.

**Deferred.** None. Not added (judged not worth a test of its own): `releaseScanHold` by an administrator outside a hidden project answers `FILE_NOT_HELD` through the same `#held` gate the two tests above cover (index.mjs:449-451).

**provenance R63 (`upload`).** R6's source condition reads no routes itself: `#fetched` (index.mjs:502-511) returns `provenance.fetchedByThisCopy` as given, failing closed. In provenance today `FETCHED_VIAS` is `direct`, `archive.org`, `capture-request` (provenance index.mjs:114, :1089), so an `upload` receipt reads `{fetched:false}` and grades `high` with `source_not_fetched`, as R62 wants. My tests hold unless R63 lists `upload` as fetched. Provenance is not yet merged into `tranche/T41`, so this is read from code, not run; `grade.test.mjs`:131-167 has no `upload` case, which can be added once provenance accepts the route.

**Found in other modules.** None.

**Reading set (mechanics §17; K2304).** Over 300 KB (own code 143 KB, own tests 186 KB, requirements 33 KB, before any used module). Read whole myself: `build/requirements/file-safety.md`; `intake.test.mjs`; `fixture.mjs`; `#held` and its neighbours (index.mjs:215-260); membership's Terms, R18, R43, R44, R45, R60, R77, R85, R117 and `projectCreated`/`projectVisibilitySet` (the sight services my Uses names); `plan/current.md`'s T41-8c and K2442. Not re-read: layer 3's row of `build/layers.md` (nothing in it bears on a tests-only re-statement). A worker read the rest of my code (index, checks, formats, kinds, schema) and tests (deeper, grade, open, rows, scan, tools, view, wakes) whole and wrote a ~3 KB summary citing file and line for: every sight decision (`#held` the single gate, no administrator arm of its own; `#adminBar` gates tool and status services only), every administrator-viewer test (all on tool/status services; project-sight tests use `m2`), R6's fetched read, and coverage gaps (R15's and R17's administrator case). Nothing it left out mattered; its R15 gap is now covered.

**Tests and checks.**
- `node --test bio-plane/test/m/file-safety/`: tests 53, pass 53, fail 0 (52/53 before). No layer tests named in the manifest.
- `format`: 0 failures · `architecture file-safety`: 0 failures · `coverage file-safety`: 41 of 41 live ids, 0 failures · `ownership file-safety tranche/T41`: 2 files, 0 failures.

Size (session_01VmeqiX8nkarTaN1DJ1ZZBU): test runs 3, module lines 2248
