# instance-setup (T20)

**Status** · session_01U4jhWTgF7AFwVmwh2MDfmz · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1, `build/plan/current.md` T20 layer 11; K867, K899 (1)):
- **K867, the whole-plane suites re-pointed.** `test/m/instance-setup/worker-page.test.mjs`:19, `profiles.test.mjs`:158, `reports.test.mjs`:132 and `worker-reports.test.mjs`:17 now run Miniflare over `bio-plane/src/plane/index.mjs` (plane R6's entry). Re-scan of `test/m/instance-setup/`: one more read of the old entry, the failing-store script in `worker-page.test.mjs`, which imported `./index.mjs` from beside `src/index.mjs`; it now imports `./plane/index.mjs` from the same place (`src/instance-setup-failing-store.mjs`, written only into Miniflare). The two suite headers that named `src/index.mjs` now name the plane's entry. `reports.test.mjs`:222's title says the dispatch was "moved out of src/index.mjs"; that is history, so it stays. Nothing in this module's tests reads `src/index.mjs` now, so **plane may delete it**. Proof: the four suites, 31 of 31 pass.
- **K899 (1), "record" for "bundle".** `src/setup.mjs` (SETUP_HTML), the 13 lines named: :317 "Files in this record", :320 "Every revision this record has ever had", :329 "This adds a record to the working record", :440 and :444 (the Edit crumb and label "Record"), :845 (the publish card's label "Record"), :706 "N records.", :711 (the table header "Record"), :764 "This record was not found.", :873, :876, :879 (the RATIFY_STALE, SIG_BAD_SIGNATURE and GATE_REFUSED sentences), :1303 "files this record holds". Identifiers, `bundle.md`, comments and SQL are unchanged.
- **Re-scan of `paths`** (`setup.mjs`, `setup-fleet.mjs`, `livefire.mjs`) for other text a member reads: none found. Every other hit is a comment, the SQL schema comment (:1696), an identifier (`s-bundle`, `openBundle`, `renderBundle`, `bundle_id`, `bundleId`, `bundleSha`), or a file path (`bundle.md`, `_history/bundle_…`). `livefire.mjs`'s assertion names do not use the word.
- **Tests re-keyed.** `page.test.mjs`'s R25 guard against "Every revision this bundle has ever had, oldest first" now matches either noun, so it is not vacuous after the re-wording. New test `K899 (1) the page says record where it said bundle…` (`page.test.mjs`): the served bytes, with HTML and script comments and the identifiers K899 keeps taken out, hold no "bundle"; the identifiers are still present; it drives the browse summary and header, the not-found line and the three publish refusals through the page's script. The fixture's `ui` also exposes `ratifyWhy` and `openBrowse`. Negative control: against the old `setup.mjs` this test fails and the rest of the suite passes.

**Deferred:** none.

**Found in other modules:** none. `release/bio-plane.bundled.mjs` still carries the old words. It is the release's copy, not one of the §14 generated artifacts; it changes with the next release.

**Generated artifact staled:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`), which embed `src/setup.mjs`. Not regenerated (B1). The test re-points stale nothing.

**Tests and checks:**
- `node --test` the four re-pointed suites: tests 31, pass 31, fail 0
- `node --test bio-plane/test/m/instance-setup/`: tests 86, pass 86, fail 0, skipped 0
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures
- `node checks/architecture.mjs … instance-setup`: 16 product files, 62 relative imports (3 naming no tracked file, not judged); 0 failures
- `node checks/coverage.mjs … instance-setup`: 46 of 46 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … instance-setup tranche/T20`: 8 files changed; 0 failures (after commit 392777a059)

Size (session_01U4jhWTgF7AFwVmwh2MDfmz): test runs 5, module lines 2948
