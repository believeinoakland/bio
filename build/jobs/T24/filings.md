# filings (T24)

**Status** · session_016our75XMZ4Cjmvg8eRdhWt · depth 2 · COMPLETE · handled B1

## J1 · REPORT

**Generated artifact staled** (manifest §14): my comment-only edits to `bio-plane/src/filings/checks.mjs` and `index.mjs` are inputs of the plane's bundle, so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale until BOB regenerates them at the layer close. I regenerated nothing. Nothing else found in another module.

## J2 · COMPLETE

**Entries applied** (START B1; commit `7efc732f0e`). Wording only: no code, row or requirement changed.
- (1) **N502.** `checks.mjs`:160: C-115.44 PACKET_NO_REASON's note now says the row was taken by 1.53.0 (`gate.mjs`'s 1.53.0 history, ARRIVED, names C-115.44 PACKET_NO_REASON (filings)), not `awaiting stamp`.
- (2) **N508.** `index.mjs`:1598: `filingsOps`' note now says its ops are entries of the plane's one op map, which the plane composes and control-plane's routes spread (`control-plane/dispatch.mjs`), not the legacy store's op map routed by legacy-index (worded as project-stage's T24 N508 note).
- **Re-scan** of the module's source and tests (grep over `bio-plane/src/filings/` and `bio-plane/test/m/filings/` for `awaiting stamp`, `legacy`, `dispatch`, `op map`, `stamp`): two more of the N508 kind, re-worded: test `fixture.mjs`:4 named the legacy store as what fills promotion's `producingGroup` (now "instance setup", as the same sentence goes on to say); test `outward.test.mjs`:66 named "the store's dispatch" (now "control-plane's dispatch"). The remaining hits name the legacy store as retired (`index.mjs`:41, :176; `prepare.test.mjs`:218): true, kept. No other `awaiting stamp` note.
- **Rows:** none added or changed, so nothing `awaiting stamp` for T25's L2 (red 5) from this job.

**Deferred:** none.

**Found in other modules / artifacts** (REPORT J1): the plane bundle is stale from `filings/checks.mjs` and `index.mjs` (comments only); regenerated nothing.

**Tests and checks**
- `node --test bio-plane/test/m/filings/`: tests 59, pass 59, fail 0.
- Whole `bio-plane/test/m`: tests 5244, pass 5231, fail 2, skipped 0 (the rest todo). The 2 are accepted reds 8 (`scheduler/consumers.test.mjs`:161) and 9 (`plane/notices.test.mjs`:39); no other red.
- `format.mjs`: 88 modules, 87 requirements files; 2 failures, both accepted red 4 (link-sweep's `paths` and `tests` absent). `architecture.mjs … filings`: 14 product files, 65 relative imports; 0 failures. `coverage.mjs … filings`: 31 of 31 live ids named by a test; 0 failures. `ownership.mjs … filings tranche/T24`: 5 files changed; 0 failures.

Size (session_016our75XMZ4Cjmvg8eRdhWt): test runs 2, module lines 2017
