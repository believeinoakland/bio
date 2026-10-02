# acquisition (T24)

**Status** · session_01GsZuQ1S3yT7423mnGkM1qi · depth 2 · RUNNING until 2026-10-02T13:55:21Z (node --test bio-plane/test/m) · handled B1

## Completion (ACQUISITION #6)

**Entries applied** (`build/plan/current.md` T24 L3, acquisition):
- **N510 (R32).** An empty 200 memento no longer ends the archive arm. Every 200 memento now goes to a `take` step (`bio-plane/src/acquisition/index.mjs`, `mementoLookup`). The step reads as much of the body as the choice needs. If `selectCapture` refuses the memento over the bytes received, the memento becomes a row and the lookup goes on to the next candidate, as it already did for a non-200.
  - On the archive arm, `acquire` reads the body's first non-empty chunk ahead, without consuming it (`peekBody`). An empty body becomes `mementoRow(answer, {bytes: 0})`, which carries the empty-body digest that R29 refuses. The lookup then goes on, and nothing of that memento reaches the store. A body with bytes is handed to the capture with the bytes read ahead replayed first, so the capture still streams, hashes and stores the very bytes the choice is made over.
  - In `archiveLookup`, each 200 memento is hashed whole and judged by `selectCapture`. An empty one is passed over and named in `rejected` with selectCapture's own words.
  - When every candidate is empty, the answer is `NO_USABLE_CAPTURE` (404) with each empty memento named in `considered`. Nothing is filed and no success is recorded.
- **N502.** `acquisition/checks.mjs` notes re-worded to the stamps that took the rows: 1.49.0 for T18's C-48, C-83 and C-28.13; 1.50.0 and 1.51.0 for C-68.1; 1.54.0 for C-128.1 and C-128.2 (S1's line, formerly :228).
- **Re-scan (N502/N508 kind).** No other `awaiting stamp`, legacy store or legacy-index note remains in the module. While re-scanning I also re-worded the stale pointers that N506 left: `monitoring R53/R57/R58` now reads `link-sweep R1/R5/R6`, in `index.mjs`, `checks.mjs` and `sweep-scope.test.mjs`. One of these is the `detail` sentence of `SWEEP_SCOPE_MISSING`, which now names link-sweep R1's `sources`; that row's check and translation are unchanged. Also `capture R24, R29` becomes `R24, R29` (this module's own).

**Rows changed:** none. Only comments and one `detail` sentence changed; no row's code, number, translation or `where` moved, so no row is `awaiting stamp` for T25 (red 5: none from this job).

**Improvements made in my own module:**
- Before this job, a body that broke off mid-stream threw out of `acquire` and `archiveLookup`, which broke the requirement that every refusal is an answer. It is now answered by name:
  - `FETCH_FAILED` (502) on a direct fetch. The outcome is recorded as `fetch_failed`, and the error's words are left out when a credential rode the fetch (R23).
  - `ARCHIVE_UNREACHABLE` (502) for a memento, on the archive arm and in the lookup.

**Deferred:** none.

**Found in other modules / requirement wording (REPORT J1):**
- The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from `bio-plane/src/acquisition/`. I regenerated nothing.
- acquisition R29's last sentence still says the rows are "`awaiting stamp` for promotion's next job". 1.49.0, 1.51.0 and 1.54.0 have stamped them. Its enumeration also still lacks a clause naming R31's C-128.1–C-128.2 as the rule (they are listed). The wording is BOB's.
- acquisition's Uses still lists `parseCdx`, `replayLocator`, `cdxQuery` and `archiveHop` (T23's J3). Of the CDX services only `selectCapture` is used.

**Tests and checks:**
- New tests in `bio-plane/test/m/acquisition/memento.test.mjs`. Both fail on the code before this job and pass after it.
  - "R32 (N510)": an empty newest memento is passed over for the older one, on both arms. Negative control: all mementos empty gives `NO_USABLE_CAPTURE`, with each memento tried once and named, and nothing filed. Over-strictness arm: a body whose first chunk is empty is filed whole.
  - "R10 R32": a body breaking off is answered by name on all three paths. Negative control: the same bodies, unbroken, are filed.
- `node --test bio-plane/test/m/acquisition/`: tests 70, pass 70, fail 0.
- Users (`test/m/acquisition`, `capture`, `capture-requests`, `instance-setup`, `control-plane`, `monitoring`): tests 576, pass 576, fail 0.
- The whole `bio-plane/test/m`: tests 5232, pass 5221, fail 0, todo 11.
- `format`: 88 modules, 87 requirements files; 2 failures, both accepted red 4 (link-sweep's `paths` and `tests` absent).
- `architecture` acquisition: 11 product files, 43 relative imports; 0 failures.
- `coverage` acquisition: 32 of 32 live requirement ids named by a test; 0 failures.
- `ownership` acquisition `tranche/T24`: 5 files changed; 0 failures.

Size (session_01GsZuQ1S3yT7423mnGkM1qi): test runs 6, module lines 1565
