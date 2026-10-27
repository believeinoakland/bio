# promotion (T52)

**Status** · session_018BhcegixzKL2KvktYcXKVM · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

**Entries applied.** T52-8 (K5339 red, `row-census.test.mjs`): cause settled, then fixed. Cause: the pin (1.79.0, 1923 rows, PROMOTION #51's stamp) was held against a tree that has since gained 48 rows and changed 12 (none retired) from modules after layer 2, none named `awaiting stamp` by a job record, so the suite refused them by name ("arrived/changed with no record"). The suite and the census reader are correct; the layer-2 stamp was owed. Fix: the stamp, `CATALOG_VERSION` 1.79.0 -> 1.80.0, `ROW_CENSUS` re-pinned: 1971 rows, `17406b472cd7001dfef7d6028e0746b51ef7df322d42ad9fff1f2e1af16a5609`; fixture `row-census-1.79.0.jsonl` renamed `1.80.0` with the new lines (written by `censusOf`); `gate.mjs` note lists the rows; the suite's header and anchors re-pinned. No row of this module moved.

**Deferred.** None.

**Found in other modules (REPORT to BOB).** (a) `build/modules.json` promotion `tests` still names `bio-plane/test/fixtures/row-census-1.79.0.jsonl`, now `1.80.0`: format, architecture and ownership checks show it until BOB moves the entry (BOB's file; as at each stamp). (b) case-checker's generated `bio-plane/src/case-checker/program.mjs` embeds `CATALOG_VERSION` and is stale after the stamp (regenerate with `node bio-plane/src/case-checker/build-program.mjs`); bundles embedding it (`bio-plane/dist`, `release/`) are stale likewise until the layer close regenerates them. Not run here (not mine).

**Tests.** `system/row-census`: 10 pass, 0 fail (1971 rows, digest as pinned). `test/m/promotion/` + `d526-refusal-order`: 171 pass, 0 fail.

**Met** · none

**Addendum.** The renamed-away `row-census-1.79.0.jsonl` is kept unchanged on this branch: `modules.json` on the tranche no longer lists it, so deleting it counts as outside promotion's paths (ownership). No stamp reads it; BOB may delete it at the merge.

Tests: 172/172. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegixzKL2KvktYcXKVM): test runs 1, module lines 4009
