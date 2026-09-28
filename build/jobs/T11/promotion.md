# promotion (T11)

**Status** · session_01ASTMYa8KNLdKEKcGwkyoBG · depth 2 · COMPLETE · handled B1

## Work (PROMOTION #11)

Read whole: `roles/JOB.md`; B1; the plan's opening paragraph and layer 2; N275 and N281 in `next.md`; `build/requirements/promotion.md`; every file under `bio-plane/src/gate.mjs`, `bio-plane/src/promotion/` and the module tests read for this change (`gate.test.mjs`, `registry.test.mjs`); the row-table and refusal changes in `git diff 97cb7a30d2 HEAD -- bio-plane/src bio-plane/checks` (1.40.0's mint to T11's layer 1); C-102.9's row in `bio-checks.mjs`; `test/verdict-reader.mjs`'s header (what arm C reads as a verdict); LEGACY-TESTS #6's T9 notes behind N275.

**Applied** (7702929d29):
- **N281.** `CATALOG_VERSION` 1.40.0 → **1.41.0**, MINOR, its note in `src/gate.mjs`. Counted wherever the rows live (R34, R47), since 1.40.0 (97cb7a30d2): **arrived** C-53.14 REGISTER_BYTES_UNSTATED (provenance `REGISTER_ENTRY_CHECKS`), C-91.4 NO_SUCH_ENTITY (entities `ENTITY_CHECKS`), C-107.2 BAD_GRADE (strength `STRENGTH_BAR_CHECKS`); **departed** progressions' C-100.1 NO_KEY, C-100.12 NO_SUCH_ENTITY, C-100.23 LISTENER_DECLARED; **changed** C-22.1 and C-22.17 (observation-log's `checkObservation` now answers a stored never-looked look C-22.17, which C-22.1 answered until T10). Moved, not changed: C-81.11–C-81.14 held once in the catalogue's `THEME_CHECKS` (connections' copy now a view, N125); C-22.7 in transit from the catalogue file to ai-runs' own table (N289, K343, K348), counted where it lands, so ai-runs' layer-6 row with the same code, condition and translation needs no new stamp. Wording only: `where`s of C-26.11, C-30.7, C-30.8, C-100.9/.11/.13–.15/.17/.18 and inquiry's C-106 rows; C-22's and C-53's comments. For legacy-tests, from the d470 suite's own print on this tree: **version 1.41.0, count 396** (397 → 396: C-22.7 left the file), **digest de54b8bd85553c5d588c0b82fdbf0ea48a4bed3fe47d982fd9a8c1e3c5c023fe, source 8ada0f4c65a617f0e120bdfe8359f2b591d039b8a02e2cc3967d8aa27fd90f03**. A3 and A5 are red until that re-pin (and when C-22.7 lands in ai-runs, the catalogue file's census does not move back, since the row lives in a module then).
- **N275 (promotion's share).** `caseCatalogueFailed(e)` (`src/gate.mjs`, the function C-102.9's `where` names) now builds the case gate's whole answer, `{gateVersion, ok: false, findings: [{check: "CASE_CATALOGUE_FAILED", detail}], warnings: 0}`, and `runCaseGate` returns it; the answer is byte-for-byte what it was. `test/verdict-reader.mjs`'s `verdictOf` over that literal reads `{key: "ok", kind: "false"}`, so arm C can judge it. C-102.9's `where` string is unchanged (legacy-checks' row), so no catalogue edit is owed. R33's fail-closed test now holds the whole answer's shape (keys, the one finding's keys, `GATE_VERSION`, `warnings: 0`).

**Mark met, for BOB to strike:** R34's `(not yet met: N281; C-53.14 arrived in T10 unstamped)`. The requirements file is not mine to write.

**R34 note (unchanged from #9):** "one version names one catalogue" is proven by legacy-tests' d470 census (of the catalogue file) and by each re-stamp's survey of the module row tables; the module's R34 test covers the version's shape and both gates reporting it. A test under my path that pinned a census of every module's rows would turn red on the tranche whenever a later layer adds a row, and here at once (C-22.7 in transit), against B1's "never a red test".

**Stale generated artifact (mechanics §14):** `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`), whose inputs include `src/gate.mjs`: it still carries 1.40.0. Not rebuilt.

**Found in other modules:** none new. Red on `tranche/T11` without this change, and named by B1 (K348): the plane cannot boot (`src/skilldoctrine.mjs:254` reads C-22.7's row, which is not held anywhere until ai-runs' layer 6), so every Miniflare-driven suite fails; the ai-runs and skills suites fail.

**Tests and checks run** (on 7702929d29):
- `node --test bio-plane/test/m/promotion/`: tests 65, pass 64, fail 1; the one is `write-path.test.mjs`, which boots the plane (K348); with my change stashed it fails the same way at `skilldoctrine.mjs:254`.
- `node --test bio-plane/test/m/`: tests 2418, pass 2346, fail 47, todo 25; every failure is in a plane-booting suite (affordances/plane 25, host-governor/ops 5, capture-requests/plane 4, scheduler/plane 4, promotion/write-path 1) or ai-runs (6) and skills (3), K348.
- `node --test bio-plane/test/d470-catalog-census.test.mjs`: A3 and A5 red (legacy-tests' re-pin to 1.41.0), every other arm ok.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture`: 16 product files, 57 relative imports; 0 failures. `coverage`: 49 of 49 live requirement ids named by a test; 0 failures. `ownership`: 3 files changed by promotion between tranche/T11 and HEAD; legacy-checks and legacy-store 0 lines; 0 failures.

**Deferred:** nothing.

Size (session_01ASTMYa8KNLdKEKcGwkyoBG): test runs 7, module lines 2299


## Work (PROMOTION #11, B2 CHANGE, K350)

Merged `tranche/T11` (ca7816a67e): LEGACY-CHECKS #6 restored C-22.7's row in the catalogue, code, condition and translation identical to before N289 (a comment added). The plane boots again.

**Applied** (907fb5feac): 1.41.0's note in `src/gate.mjs` now reads the catalogue file's census as it stands after the restore. C-22.7 stays in the catalogue until ai-runs holds its own copy (K350, N299), so it is not a departure. **This replaces the census figures in my first COMPLETE (J1):** from the d470 suite's own print on this tree, **version 1.41.0, count 397, digest e1c688c54da82c743a275e01ee65f060341edbe145a34494dfc1001ec934b007, source 9927c1ad88a362754324cc4ab86f6a9850502a8366a0cf6567442ec5f6720c1e**, equal to 1.40.0's, because every arrival and departure 1.41.0 stamps is in a module's own table. So legacy-tests' 1.41.0 row must carry `changed: ["C-22.1", "C-22.17"]` (and its `source`) or A4 names a collision. A3 and A5 stay red until that re-pin. Nothing else in 1.41.0's reckoning changes.

**Tests and checks run** (on 907fb5feac):
- `node --test bio-plane/test/m/promotion/`: tests 67, pass 67, fail 0 (`write-path.test.mjs` boots the plane and passes).
- `node --test bio-plane/test/m/` (every module, the plane-booting users of promotion's services included): tests 2443, pass 2418, fail 0, todo 25.
- `node --test bio-plane/test/d470-catalog-census.test.mjs`: A3 and A5 red (legacy-tests' re-pin to 1.41.0), every other arm ok.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture`: 16 product files, 57 relative imports; 0 failures. `coverage`: 49 of 49 live requirement ids named by a test; 0 failures. `ownership`: 3 files changed by promotion between tranche/T11 and HEAD; legacy-checks and legacy-store 0 lines; 0 failures.

**Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`), still carrying 1.40.0. Not rebuilt. **Found in other modules:** none. **Deferred:** nothing.

Size (session_01ASTMYa8KNLdKEKcGwkyoBG): test runs 10, module lines 2300

## J1 · COMPLETE

Both entries applied and pushed on job/T11/promotion (7702929d29; record d2b1b1e954).
N281: CATALOG_VERSION 1.40.0 -> 1.41.0, MINOR. Since 1.40.0, counted wherever rows live: arrived C-53.14 (provenance), C-91.4 (entities), C-107.2 (strength); departed C-100.1, C-100.12, C-100.23 (progressions); changed C-22.1 and C-22.17 (observation-log now answers C-22.17 where C-22.1 was answered). C-81.11-14 are held once now, not changed. C-22.7 is in transit to ai-runs and counted where it lands, so ai-runs' layer-6 row needs no new stamp if its code, condition and translation are unchanged. For legacy-tests, from the d470 print: version 1.41.0, count 396, digest de54b8bd85553c5d588c0b82fdbf0ea48a4bed3fe47d982fd9a8c1e3c5c023fe, source 8ada0f4c65a617f0e120bdfe8359f2b591d039b8a02e2cc3967d8aa27fd90f03. A3 and A5 stay red until that re-pin. R34's not-yet-met mark is met, for you to strike.
N275 (my share): caseCatalogueFailed, the function C-102.9's where names, now builds the case gate's whole answer with ok: false at the top, and verdict-reader reads it as a refusal. The answer itself is unchanged, and C-102.9's where string needs no edit. R33's test holds the whole shape.
Tests: promotion 64/65. The one failure is write-path, where the plane cannot boot at skilldoctrine.mjs:254 (C-22.7, K348); it fails the same way without my change. test/m: 2346 pass, 47 fail, 25 todo; every failure is a plane-booting suite or ai-runs/skills (K348). format, architecture, coverage and ownership: 0 failures.
Stale: bio-plane/dist/bio-plane.bundled.mjs still carries 1.40.0. Deferred: nothing.
Size (session_01ASTMYa8KNLdKEKcGwkyoBG): test runs 7, module lines 2299
