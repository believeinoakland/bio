# capture-requests (T24)

**Status** · session_01Pnb3SM27ciwpMBZEp624EU · depth 2 · WORKING · handled B0

## Completion

**Entries applied** (B1 START; `build/plan/current.md` T24 L6, capture-requests: N502, S1's note; wording only, no meaning changed, no requirement changed):
- N502: `bio-plane/src/capture-requests/checks.mjs`:6 said the copied C-28 rows' `where`s were `awaiting stamp` for promotion's T19 job; 1.49.0 (PROMOTION #20, T19 L2) took them (`gate.mjs` stamp history: C-28.1–.4, .6–.11, .14–.18 held twice). Re-worded "taken by 1.49.0 (promotion's T19 job)"; the catalogue copy's deletion in T19 now cites 1.50.0, which records those rows held once again. The paragraph re-flowed to the file's width.
- S1's: `checks.mjs`:296, C-28.19 `CAPTURE_SWEEP_OUT_OF_SCOPE` (R45) said `awaiting stamp` until T24's L2; 1.54.0 (PROMOTION #25) took it. Re-worded "taken by 1.54.0 (promotion's T24 job)".
- Re-scan of the module (src and tests) for the same kind (N469's rule: `awaiting stamp`, legacy store, op map, dispatcher, legacy-index named as live): nothing else stale. Past-tense history left: `index.mjs`:2 (extracted from `legacy-store` in T7), `schema.mjs`:2, `checks.mjs`:259, :276 (T6, legacy-checks), `test/m/capture-requests/fixture.mjs`:127 (names the retired store as retired). `build/requirements/capture-requests.md` names no stamp as awaited.
- No catalogue row added or changed: every edit is a comment. Red 5 (rows awaiting T25's stamp): none from this job.

**Deferred:** none.

**Found in another module or artifact (REPORT J1):** the comment-only edit under `bio-plane/src/capture-requests/` stales the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`; `fleetbundles.test.mjs` FAILs "bio-plane: no staleness" with the edit, passes without it); nothing regenerated.

**Tests and checks** (on `job/T24/capture-requests`, `tranche/T24` @ b0a80df5ff an ancestor):
- `node --test bio-plane/test/m/capture-requests/`: tests 72, pass 72, fail 0.
- `node --test bio-plane/test/m/` (whole): tests 5236, pass 5225, fail 0, skipped 0, todo 11. No red beyond the accepted ones (none appeared).
- `checks/format.mjs`: 88 modules, 87 requirements files; 2 failures, both link-sweep's absent `paths` and `tests` directories (accepted red 4).
- `checks/architecture.mjs bio capture-requests`: 10 product files, 36 relative imports; 0 failures.
- `checks/coverage.mjs bio capture-requests`: 45 of 45 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bio capture-requests tranche/T24`: 1 file changed; 0 failures.

Size (session_01Pnb3SM27ciwpMBZEp624EU): test runs 3, module lines 1708

## J1 · REPORT

One artifact outside my module: my comment-only edit under bio-plane/src/capture-requests/ (checks.mjs) stales the plane's bundle bio-plane/dist/bio-plane.bundled.mjs (not_product); fleetbundles.test.mjs fails 'bio-plane: no staleness' with it. Nothing regenerated.
