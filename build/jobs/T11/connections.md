# connections (T11)

**Status** · session_01KBB1VTU4oE4epgti9kRRV5 · depth 2 · WORKING · handled B1

## Work (CONNECTIONS #4)

Read whole: `roles/JOB.md`; B1; the plan's opening paragraph and layer 5; N288 (and N213, its pattern) in `next.md`; `build/requirements/connections.md`; `layers.md`'s contract and rulings; `src/connections/` (`index.mjs`, `pair.mjs`, `schema.mjs`, `themes.mjs`) and every test under `test/m/connections/`; retrieval's probe (`observationOf`, `src/retrieval/index.mjs` 1063–1064), the reader R59 names.

**Applied** (9d8db8e051):
- **N288.** R59 needed no code: `derive` (R1) writes `entity_id` exactly as given, registered or not, one row per unordered pair (upserted on the primary key), and no act but R36's purge deletes a row. New `test/m/connections/readcontract.test.mjs`, three tests titled R59: the table and column by name; the id kept as given (an unregistered mixed-case id included) with one row per pair under re-derivation, agreeing with R4's read; retrieval's probe (`SELECT 1 x FROM connections WHERE entity_id = ? LIMIT 1`) over the fixture's workerd cursor (K316), true for a derived id and false for an unknown id, a one-capture derivation, and a case or whitespace variant; a row surviving a derivation (the sweep's) that finds no resolutions, then cleared by a per-bundle and a whole-store purge. The suite holds no LIKE/GLOB pattern over 50 bytes (K313).
- **R1's N285 clause** (`NO_ENTITY` answered by `entities.noEntity`, T12, K347) is a `test.todo` naming its cause (B1's rule), in `derive.test.mjs`.

**Marks met, for BOB to strike:** none from this job; R59 carries none. R1's N285 mark stays.

**Found (for BOB):** the requirements file still carries `not yet met` marks on ids the module's suite shows met, built at extraction and in later tranches and never struck: R6 (D-575), R13, R15 (D-625), R26 (D-706), R27 (D-722), R28, R29, R30, R31, R32, R33, R43, R49, and the Status paragraph's list of them. Each has a passing test at the interface under its id (`read.test.mjs`, `edges.test.mjs`, `asserted.test.mjs`, `themes.test.mjs`). Not struck here; the requirements file is not mine to write.

**Stale generated artifact (mechanics §14):** none; no product source changed.

**Tests and checks run** (on 9d8db8e051):
- `node --test bio-plane/test/m/connections/`: tests 66, pass 65, fail 0, todo 1.
- `node --test bio-plane/test/m/retrieval/` (R59's reader): tests 62, pass 61, fail 0, todo 1.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture`: 11 product files, 49 relative imports; 0 failures. `coverage`: 59 of 59 live requirement ids named by a test; 0 failures. `ownership`: 3 files changed by connections between tranche/T11 and HEAD; legacy-store and legacy-checks 0 lines; 0 failures.

**Deferred:** nothing.

Size (session_01KBB1VTU4oE4epgti9kRRV5): test runs 3, module lines 2225
