# control-plane (T29)

**Status** · session_0131YRU3q99y5WXShe5oMaPr · depth 2 · WORKING · handled B2

## Completion

**Entries applied** (`build/plan/current.md` T29 L11; N529, N533; K1331, K1333, K1346, K1350):
1. `CHECK_FAMILY_FILES` reads `src/case-disclosures/checks.mjs` (`CASE_DISCLOSURE_CHECKS`, C-120.1–.8, .10–.13) directly before case-authoring's, after case-import's.
2. Docket's `src/docket/checks.mjs` read at its module-order place, directly after publication's (before public-read). Docket's pressure codes are its own (C-129.10, .12, .13), so no code is in both docket's and action-grammar's families and the move re-rows nothing.
- Every code keeps its `code`, `check` and `translation`: a before/after dump of `CHECK_FAMILIES` differs only by C-120's twelve rows, reached again (1097 → 1109 codes; zero changed rows).
- `families.test.mjs`: the N526 arm re-written to docket's own codes and its new place (inherited red K1346); a new arm for case-disclosures' place and rows (C-120.9 held by no code). Clears K1346 and K1350's two reds.

**Deferred:** none.

**Other modules:** none found. `bio-plane/dist/bio-plane.bundled.mjs` (not_product's artifact) is stale from `families.mjs`; BOB regenerates it at L11's close (B2). `build/modules.json` gained `case-disclosures` in control-plane's uses (BOB, K1353, on J1).

**Tests and checks** (after merging `tranche/T29`):
- `node --test bio-plane/test/m/control-plane/`: tests 147, pass 147, fail 0, skipped 0. Layer tests: none named in `build/manifest.md`.
- `format: 97 modules, 96 requirements files; 0 failures`
- `architecture: 41 product files, 242 relative imports (3 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 33 of 33 live requirement ids named by a test; 0 failures`
- `ownership: 3 files changed by control-plane between tranche/T29 and HEAD; 0 failures`

Size (session_0131YRU3q99y5WXShe5oMaPr): test runs 5, module lines 3649

## J1 · QUESTION

Both entries applied on `job/T29/control-plane` @ 37e4472e7c; module tests 147/147 (the three inherited reds cleared). Before/after comparison of every code's row: the docket move changes no code's family, check or translation; the only difference is C-120's twelve rows, which are reached again from case-disclosures.

One check fails, on a file that is yours: `node checks/architecture.mjs bio control-plane` → `FAIL families.mjs imports src/case-disclosures/checks.mjs of case-disclosures, which control-plane does not declare in uses`. My requirements' Uses already names `case-disclosures` (N529, K1333), but `build/modules.json` control-plane's `uses` does not. My reading: you add `"case-disclosures"` to control-plane's `uses` in `build/modules.json` on `tranche/T29`; I merge the tranche and re-run the checks, then post COMPLETE. format, coverage (33/33) and ownership pass.

For your L11 close: `families.mjs` is an input to `bio-plane/dist/bio-plane.bundled.mjs` (not_product's artifact), now stale; regenerate it at the close.
