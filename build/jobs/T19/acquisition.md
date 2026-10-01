# acquisition (T19)

**Status** · session_01RaLL3nDAnEmSKcyNi9iC9w · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

Complete. Head: 1b8ebb9a2a on job/T19/acquisition.

**Entry applied (B1)**
- `index.mjs`:15 now takes `isPublicHttpsLocator`, `createSha256`, `EARNED_CAPTURE_CEILING` and `UNREACHABLE_CAPTURE_GRADE` from record-grammar's index (`../record-grammar/index.mjs`, which re-exports them from `locator.mjs`, `sha256.mjs` and `grades.mjs`). The four module tests (`acquire`, `grades`, `selflink-render`, `subresources-walk`) import the grade letters from the same place. No acquisition file imports `bio-checks.mjs`. The catalogue already re-exported these exact bindings, so behaviour does not change.
- Two comments that went stale are corrected. The R10 hasher is record-grammar's, not "the catalogue's". `checks.mjs`' header now says its C-48.1–.7, C-83 and C-28.13 rows are the only copies (T19 L1 deleted the catalogue's, K717, K769). It used to say they stayed until then. Rows, `where`s and translations are unchanged; C-28.13's `where` still names `is-capture-request-arm`, awaiting the stamp.
- R7 is still not met (N77), and its marker is unchanged. No old suite was deleted (K619).

**Deferred.** Nothing.

**For BOB (your files, and generated artifacts)**
1. **Stale `uses` edge and Uses text.** `modules.json` still lists `legacy-checks` in acquisition's `uses`, but nothing in acquisition imports it now. The requirements' Private Uses still say `legacy-checks: isPublicHttpsLocator, createSha256, EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE (re-exported from record-grammar where moved); the rows of R29 until this module's copies are its own`. Both halves are done: the four names are record-grammar's (R18–R20), and R29's rows are this module's own. The requirements' Status line also still says the catalogue's copies "are deleted by T19's layer 1", which has now happened. It is yours to reword and to drop the edge. `record-grammar` is already in acquisition's `uses`.
2. **Stale generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`). `fleetbundles.test.mjs` reports STALE BUNDLE for `src/acquisition/index.mjs` and `checks.mjs`. I did not regenerate it (§14); your layer-close regeneration covers it.
3. **record-grammar R19's "not yet met" marker looks stale.** At HEAD, `isPublicHttpsLocator` answers `true` for `HTTPS://a.example/x` and `false` for `https://localhost./x` and `https://printer.local/x`, which is what R19 asks. acquisition R2 and R28 now rely on it directly. Worth a look at record-grammar's next job.

**Tests and checks**
- `node --test test/m/acquisition/`: tests 55, pass 55, fail 0, skipped 0. No service I provide changed (imports only; the same bindings), so I did not run other modules' suites. The manifest names no layer tests.
- `format`: 87 modules, 82 requirements files; 0 failures · `architecture acquisition`: 9 product files, 37 relative imports; 0 failures · `coverage acquisition`: 30 of 30 live requirement ids named by a test; 0 failures · `ownership acquisition tranche/T19`: 7 files changed; legacy-checks: 0 line(s) added, 0 removed; 0 failures.
- `fleetbundles.test.mjs` (to check for staleness, item 2): bio-plane STALE as above. Its `(j)` remedy-text arm fails on that finding's wording (`node bio-plane/scripts/bundles.mjs` against the expected `node tools/bundles.mjs`). That is the test's own expectation, not this change.

Size (session_01RaLL3nDAnEmSKcyNi9iC9w): test runs 2, module lines 1246
