# pdf-worker (T52)

**Status** · session_018BhcednmrjuEzLGiVejiWF · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

## pdf-worker T52 report

**T52-5 (K5339 red, structure.test.mjs).** Cause: pdf-reader's range now carries its own `notes` (e.g. `xref_reconstructed` for a broken file). `POST /structure` reset `structure.notes = []`, dropping them, though R7 passes pdf-reader's fields through unchanged and R8/R10 say the member's notes are *appended*. Fix in `src/index.mjs`: keep pdf-reader's notes and append this member's. Tests: `structure.test.mjs` now compares fields without `notes`, and notes separately against pdf-reader's own (R7, R10); the R10 note count counts `tier2_error` notes only. 99 pass in structure; `npm test` 88 files pass, 0 fail.

**Not done / other modules.** `pdf-worker/dist` is a generated bundle and is now stale against `src/index.mjs`; `proc merge` regenerates it (bundles row). Nothing found in other modules. Requirement text note for BOB: R7 and R44 in `build/requirements/pdf-worker.md` each have a stray duplicated line (R7's "R8–R10; every other field `extractPdfStructure`…", R44's "no state carried…" sits under R41); BOB's file, not changed.

**Met** · R7, R10

Tests: 88/88. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcednmrjuEzLGiVejiWF): test runs 1, module lines 28917
