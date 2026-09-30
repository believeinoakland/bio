# promotion (T17)

**Status** · session_011ju7BEaAQKe7REaDVMPKum · depth 2 · WORKING · handled B1

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
