# promotion (T26)

**Status** · session_01ASMwQcRsk5CCBu3QMVhdiG · depth 2 · RUNNING until 2026-10-02T21:31:11Z (node --test --test-timeout=120000 bio-plane/test/m/) · handled B0

## Completion

Stamp commit `7ab2708ca3` on `job/T26/promotion` (from `tranche/T26` at its opening; T26's layer 2 is this job alone).

**Entries applied.** S3 (accepted red 1), from BOB's B1 START:
- (1) The stamp: `CATALOG_VERSION` 1.55.0 → 1.56.0 (`bio-plane/src/gate.mjs`), MINOR. The note follows 1.55.0's form. It has eight rows CHANGED, all `where` only: C-34.1–C-34.4 moved to provenance-routes' `ROUTE_MARK_CHECKS`, C-89.1 moved to attestation's `ATTEST_CHECKS`, C-103.6 and C-103.7 are now minted at attestation's `signReceipt`, and C-103.3 names its second site in provenance-routes. There are no arrivals and no departures. CHANGED IN WHAT THE GATES RUN is nothing: the audit's `route` finding and the `routeMarks` count changed registrant only, provenance to provenance-routes, line for line. The note has the rule-17 sentence and ends "Rows T26's layers 3–11 change are T27's stamp". `GATE_VERSION`'s form is kept (R34). `ROW_CENSUS` is re-pinned at 1073 rows, `3371a04bcec276dbc1a1ecc62623d326b70a25a7ca151ed7c1fffd8652be094a`.
- Census against the records: the census moved by exactly those eight rows, and each is named `awaiting stamp` by a T25 record. C-103.3, C-103.6 and C-103.7 are in `build/jobs/T25/provenance.md`:12. They are beyond the C-34 and C-89 rows that START listed, but a record names them, so no QUESTION was raised. C-34.1–C-34.4 are in `provenance-routes.md`:49 and C-89.1 is in `attestation.md`:21. No row moved without a record.
- (2) The census fixture (R50): I added `bio-plane/test/fixtures/row-census-1.56.0.jsonl` (1073 lines). `row-census.mjs` reproduces it byte for byte on the stamp commit. I deleted `bio-plane/test/fixtures/row-census-1.55.0.jsonl`. `AWAITING_STAMP` and `COMPOSITIONS_AWAITING` are empty, each re-anchored at 1.56.0, and the suite's header gains the 1.56.0 re-pin note. **BOB swaps my `tests` entry** from `bio-plane/test/fixtures/row-census-1.55.0.jsonl` to `bio-plane/test/fixtures/row-census-1.56.0.jsonl`.
- (3) Negative control: its arms in the suite pass. On a scratch worktree of the stamp commit, I added a row `C-59.99 CONTROL_ROW` to record-core's `RECORD_CORE_CHECKS`. The suite went to 7 pass, 1 fail, with `CENSUS MOVED: arrived with no record: C-59.99 CONTROL_ROW`. After restoring the row it went back to 8 pass, 0 fail, and the worktree was removed.
- (4) Re-scan for the N502/N508 kind (N469's rule); I read every file of the module whole. `gate.mjs`'s `runGate` note said the record's grammars "carry the catalogue's legacy registration while it lasts", but no such registration has existed since T20. It now says each grammar is registered by its owning module. 1.55.0's note now ends "were T26's stamp, taken by 1.56.0". `promotion/text.mjs` called the front-matter parser "the catalogue's"; it now says record-grammar's. `promotion/release.mjs` called `releaseMessage` "the catalogue's", but it is this module's own since K64, and the comment now says so. `write-path.test.mjs`:150 said the catalogue "leaves in T19"; it now says "left at T19's close". `checks.mjs`'s `src/store.mjs` mention ("when this row was written") is history, so it stays. `d526`'s dated history also stays, and so does the fixtures' "legacy-store" registrant, which is only a label.

**Deferred.** None.

**Found in other modules.** The plane's bundle is stale: `fleetbundles.test.mjs` says `bio-plane: STALE BUNDLE — the source src/gate.mjs has changed`. The cause is this stamp (the version string and comments). Its owner is `not_product`, and BOB regenerates it at the layer close. I regenerated nothing.

**Tests and checks** (on `7ab2708ca3`):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (CENSUS 1073 rows `3371a04b…`, PIN 1.56.0 matches). Red 1 is cleared.
- `node --test bio-plane/test/m/promotion/`: 102 tests, 102 pass, 0 fail.
- `node bio-plane/test/d526-refusal-order.test.mjs`: 31 passed, 0 failed.
- `node --test --test-timeout=120000 bio-plane/test/m/`: 5341 tests, 5330 pass, 0 fail, 0 cancelled, 11 todo. No red, not even red 3.
- `checks/format.mjs`: 1 failure, the `tests` entry for the 1.55.0 fixture (BOB's swap). `architecture.mjs`: 25 files, 87 imports, 0 failures. `coverage.mjs`: 56 of 56, 0 failures. `ownership.mjs … tranche/T26`: 8 files, 1 failure, the 1.56.0 fixture outside my `tests` until the swap.

Size (session_01ASMwQcRsk5CCBu3QMVhdiG): test runs 8, module lines 3246
