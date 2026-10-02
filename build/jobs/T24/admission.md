# admission (T24)

**Status** · session_01T2xrt2MjMnyqB7bowkkKM1 · depth 2 · COMPLETE · handled B0

## Completion (ADMISSION #3)

**Entries applied** (`build/plan/current.md` T24 L11; B1)
- **N502** · `src/admission/checks.mjs`:6–9: "until then each code has two rows, one tranche only (awaiting stamp, T19)" re-worded to the stamp that took the rows: control-plane's copies were deleted by its T18 job (804c1d026d), and 1.49.0 (T19 L2, `gate.mjs`:432–444, "CHANGED … C-32.17, C-38.1–C-38.8, C-64.4, C-78.1–C-78.3") took them with their `where`s re-pointed here; no row has changed since (`git log` on the file: one comment-only change in T19). Its "reasons kept in the control plane's copy until it is deleted" went with it. Wording only.
- **The re-scan** (N469's rule) of `src/admission/` and `test/m/admission/` for the N502/N508 kind: no other `awaiting stamp`, legacy store, dispatcher or legacy-index note. Two stale notes of the same family (a future already past), re-worded: `index.mjs`:9 (control-plane's job "deletes its copy" → deleted it in T18; its door calls these, control-plane R28) and `test/m/admission/reader.test.mjs`:2–3 ("its R is proposed to BOB, J2" → R16, K723). Comments only; no behaviour, row or test assertion changed.

**Deferred:** none.

**Rows added or changed:** none (red 5 does not apply: the row objects are byte-identical).

**Found in other modules / generated artifacts**
- **The plane's bundle is stale** (`bio-plane/dist/bio-plane.bundled.mjs`, owned by `not_product`): `fleetbundles.test.mjs` reports `STALE BUNDLE` for `src/admission/checks.mjs` and `src/admission/index.mjs` (97 pass, 1 fail; 0 fail without this change). Not regenerated (mechanics §14; manifest); BOB regenerates at the layer close.

**Tests and checks** (on `job/T24/admission` @ `tranche/T24` 5a09037355's content for every file outside this module)
- `node --test bio-plane/test/m/admission/`: tests 19, pass 19, fail 0.
- `node --test bio-plane/test/m/`: tests 5275, pass 5256, fail 8, skipped 0. The 8 are accepted reds, and fail identically with this job's change stashed: red 6 (`affordances/catalogue.test.mjs`:524, `optionstartpreview`), red 7 (`affordances/catalogue.test.mjs`:912 and `control-plane/r45-routes.test.mjs`:71, `sweeps` not yet in its owner's map; `control-plane/families.test.mjs`:47; `plane/compose.test.mjs`:101–109 and `plane/door.test.mjs`:183–211, queue-producers' `sweepConditions` not a function), red 9 (`plane/notices.test.mjs`:39).
- `bio-plane/test/system/fleetbundles.test.mjs`: 97 pass, 1 fail (the stale bundle above).
- `checks/format.mjs`: 88 modules, 87 requirements files; 0 failures. `checks/architecture.mjs … admission`: 9 product files, 16 relative imports; 0 failures. `checks/coverage.mjs … admission`: 16 of 16 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … admission tranche/T24`: 4 files changed; 0 failures.

Size (session_01T2xrt2MjMnyqB7bowkkKM1): test runs 9, module lines 848

## J1 · COMPLETE

N502 applied: `admission/checks.mjs`:6–9 re-worded to the stamp that took the rows (1.49.0, T19 L2; control-plane's copies deleted in T18). Re-scan: two notes of the same kind re-worded (`index.mjs`:9; `test/m/admission/reader.test.mjs`:2–3). Comments only; no row added or changed (nothing awaiting stamp). Module tests 19/19; whole `test/m` 5256 pass, 8 fail, all accepted reds 6, 7, 9 and identical with my change stashed. Four checks 0 failures. REPORT: the plane's bundle is stale for `src/admission/checks.mjs` and `index.mjs` (fleetbundles 97 pass, 1 fail); not regenerated. Details in my record.
