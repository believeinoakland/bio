# promotion (T17)

**Status** · session_011ju7BEaAQKe7REaDVMPKum · depth 2 · COMPLETE · handled B2

## Progress

**Prepared, before membership and record-core merge** (B1: "prepare everything else first"):
- `tranche/T17` merged into `job/T17/promotion` (0f1b0c256c). `node --test bio-plane/test/m/promotion/`: 71 pass, 0 fail.
- **Pre-read of the census** on this tree with legacy-tests' `test/row-census.mjs`: 878 rows, `927d0457…`; 8 files unimportable, none blind. Diffed as multisets against `test/fixtures/row-census-1.46.0.jsonl` (877): 16 arrived, 15 departed, 11 changed. Every one is named by a record:
  - Arrived: C-118.3–C-118.6 (`jobs/T16/capture.md`:46); C-120.4–C-120.7 (`case-authoring.md`:41); C-121.1–C-121.6 (`sources.md`:27); C-122.1 in `CASE_SOURCES_CHECKS` (`publication.md`:33); C-2.18 (`inquiry.md`:25).
  - Departed: C-41.1–C-41.15, the catalogue's copies (`jobs/T17/legacy-checks.md` J1 (3), J2). Ratification's copies stay, and their lines are identical, so the lines depart as duplicates. C-21.1 and the case-document arms of C-2.8 and C-3.1 were never table rows in the file (C-21.1 was a finding literal in `checkCaseDocument`), so the census does not move for them. They move d470's census of the catalogue file only.
  - Changed, translation: C-2.15 (`inquiry.md`:25, K543).
  - Changed, `where` to `src/tasks/`: C-19.2, C-32.10, C-32.11, C-76.1 (`tasks.md`:26, `queue.md`:21).
  - Changed, `where` to `src/ratification/refusals.mjs`: C-32.13, C-32.15, C-53.12, C-65.1, C-92.10, C-92.11 (the last two with their regions renamed).
  - This is exactly the 27 differences T16's legacy-tests declared `awaiting stamp` (`jobs/T16/legacy-tests.md`:12), plus N372's 15 departures.
- **The gates' composition:** queue's `registerStep("queue")` and `registerAuditCheck` are gone. Tasks' step and audit (`src/tasks/index.mjs`:664, :667) are the live ones. The case gate is unchanged since 1.46.0.
- **Next:** on BOB's CHANGE for membership (N387, a C-96 row) and record-core (N376), merge `tranche/T17`, re-read the census, and move to 1.47.0 with its note and `ROW_CENSUS`.

## J1 · REPORT

Prepared, waiting on the two merges (B1). The pre-read on tranche/T17 + my branch shows 878 rows, 927d0457…. Against 1.46.0 there are 16 arrivals, 15 departures (C-41.1–C-41.15's catalogue copies) and 11 changes. Each one is named by a record, and together they are exactly T16 legacy-tests' 27 awaiting-stamp rows plus N372's departures. The composition moved too: tasks' step and audit are live, and queue's are gone. Promotion tests: 71 pass, 0 fail. Details are in my record's Progress. Please send a CHANGE when membership (N387) and record-core (N376) have merged, and I will stamp 1.47.0 over the whole set once.

## Completion

**Entries applied** (B1, B2):
- **The stamp.** `CATALOG_VERSION` moves from 1.46.0 to 1.47.0, with its note above the constant.
- **`ROW_CENSUS`** is now `{1.47.0, 879, b8bbd059390f894eb419d10b40c4683bc0d5a85f022c3a354e9c67925cde3f11}`. I read it with legacy-tests' `test/row-census.mjs` on `tranche/T17` @ 16eaac937e (membership and record-core merged, K577) plus the stamp. No file is blind. 8 files could not be imported, and none of them holds a row literal.
- **Method:** a multiset diff against `test/fixtures/row-census-1.46.0.jsonl`.
  - 17 arrived: Progress's 16, plus C-96.17 `MACHINE_CANNOT_REGISTER_KEY` (membership, N387, B2).
  - 15 departed: the catalogue's copies of C-41.1–C-41.15 (N372).
  - 11 changed, each named in Progress.
  - Record-core's N376 moved no row.
- **Composition:** tasks' registered step and audit replace queue's (K531). The case gate is unmoved.
- **Rows added, moved or retired by promotion itself:** none.

**`not yet met` marks my work meets:** none. Promotion's requirements carry none that this stamp meets.

**Deferred:** nothing.

**Found in other modules** (legacy-tests' re-pins, and artifacts):
- **`test/row-census.test.mjs`: 7 pass, 1 fail.** The main arm ("the tree holds the pin") passes. The one failure is the negative control, which needs `test/fixtures/row-census-1.47.0.jsonl`: 879 lines, reproducible with `row-census.mjs` on this branch. T16's `awaiting stamp` declarations are now stamped and retire. The suite already names them ("STAMPED SINCE, retire this declaration").
- **`test/d470-catalog-census.test.mjs`: 11 pass, 3 fail** (A1, A3, A9). It needs a 1.47.0 row with count 340, digest `c56ccc26b13997c298dcc6fe0a7e6fe3f58548bd0164d2109505f9724f50cd4a` and source `1546553323e10c1275e989d356c7467842a7e57470a7877f9383fa6dbc441462`. It also needs A5's literal `plane-gate/1.0 (bio-checks 1.47.0)`, and A1's floors moved for N372.
- **Generated artifacts gone stale (§14, not rebuilt):** `bio-plane/dist/bio-plane.bundled.mjs` (`gate.mjs`), plus the bundles that earlier merges in this tranche already staled.

**Tests and checks:**
- `node --test bio-plane/test/m/promotion/`: 71 pass, 0 fail, 0 todo.
- `bio-plane/test/m/` whole, in two runs:
  - first 30 modules: 1748 tests, 1731 pass, 0 fail, 17 todo;
  - last 29 modules: 1443 tests, 1437 pass, 0 fail, 6 todo.
- Legacy readers of the stamp:
  - `ratify` 43/0 and `conformance` 59/0;
  - `row-census` 7/1 and `d470-catalog-census` 11/3 (the re-pins above).
- Layer tests: `build/manifest.md` names none.
- `format`: 72 modules, 67 requirements files; 0 failures.
- `architecture promotion`: 16 product files; 0 failures.
- `coverage promotion`: 51 of 51; 0 failures.
- `ownership promotion tranche/T17`: 1 file; legacy 0 lines; 0 failures.

Size (session_011ju7BEaAQKe7REaDVMPKum): test runs 17, module lines 29

## J2 · COMPLETE

Complete on job/T17/promotion: 1.47.0 stamped. ROW_CENSUS is {879, b8bbd059…}: 17 arrived (with C-96.17), 15 departed, 11 changed, and the composition moved to tasks. Promotion tests: 71/0. test/m/ whole: 0 fail. All four checks: 0 failures. legacy-tests owns the re-pins: the row-census 1.47.0 fixture and d470's 1.47.0 row (340, c56ccc26…). The bio-plane bundle is stale. Details are in my record's Completion.
