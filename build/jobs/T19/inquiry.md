# inquiry (T19)

**Status** · session_01HTKr1rwoRp8yU8xwfxzPbx · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings, both about inquiry-grammar, which has not merged yet (no `src/inquiry-grammar/` on `tranche/T19` @ c587e337df; INQUIRY-GRAMMAR #1 has only its start entry).

1. **Sequencing.** My best reading of "merge early for strength and contradiction (N136)": I do first everything that does not need inquiry-grammar — N136's rest (`inquiry_subject_entity` into `inquiry_bundle_facts`, moved once, idempotently; `bundles` no longer written), N422, R50/C-66.5 with `SURFACE_CHECKS` into my table and its code out of `store.mjs`, K783's `registerAuditContext`, the record-grammar / content / promotion / `SHARED_ACT_CHECKS` re-points (code and tests), `contentIdFor`'s deletion, the comment re-wordings — and post a REPORT saying the branch is ready for that early merge. Then, once inquiry-grammar merges, I merge `tranche/T19` and do the rest: the grammar face re-pointed to inquiry-grammar, R11's entry arm, R38's rows read from inquiry-grammar, then COMPLETE. If you would rather have one merge only, say so and I hold the REPORT.

2. **R11's entry arm at the write.** My best reading: `check()` calls inquiry-grammar's `checkInquiryExtension({fm, publishedRegistry, earnedRegistry}, findings)` synchronously, for every inquiry that is not a replay (not only when `basis` or `grounds` is present, as today), and its errors are `BASIS_REFUSED` as today. Because inquiry-grammar's `checkInquiryBasis` no longer calls `basisVersionFindings` (its R4), the version block's findings stop appearing inside inquiry's `BASIS_REFUSED`; basis-versions' own promotion check (its R6) refuses them at the same write. `checkInquiryEntry` (the async face, R17) is called with `record.grammars()` by `checkEntry`; called with no `grammars`, it runs inquiry-grammar's own arms (its registration's), so a caller holding no record still gets C-2.8/C-6.1/C-15.1.

## J2 · REPORT

**Stage one is ready for the early merge (K811)** at `job/T19/inquiry` @ f80c1c9f57, tranche/T19 merged in.

Applied: N136's rest (`inquiry_subject_entity` in `inquiry_bundle_facts`, moved off `bundles` once, on the boot that gives the table its column, so a value a later revision cleared is never brought back; `bundles` no longer written; R43 reads the new home); N422 (R42: the reply's `reevaluation.listeners_failed` is read from `raise`'s answer object when the reply is read, for `staled`, `dispose`, `divide` under a caller's transaction); R50 (C-66.5 as inquiry's registered check, at the end of `check()`; the row as `INQUIRY_SURFACE_CHECKS`, number and translation unchanged, `where` re-pointed, **awaiting stamp**; the catalogue's `SURFACE_CHECKS` deleted, and `store.mjs`' import and block removed); K783 (`registerAuditContext("inquiry", …)` for the earned registry); the record-grammar re-points (code: `index.mjs`, `grammar.mjs`' `STATES`, `BASIS_ROLES`, titles; tests: capture-bound, contradiction, earned, fixture, testimony-inherited), `NO_BASIS` to `SHARED_ACT_CHECKS`, C-64.1 to promotion's `PROMOTION_ROW_CHECKS`, content-legs to content's `CONTENT_EXTENT_CHECKS` and `contentIdFor`; the catalogue's `contentIdFor` deleted (no importer left but old suites, K653 BOB-1); comments re-worded (checks.mjs:2, index.mjs:2150, schema.mjs:33, :85, :89).

Tests: `node --test test/m/inquiry/` 155 tests, 154 pass, 0 fail, 1 todo (new: `raise.test.mjs` N422, `surfaced.test.mjs` R50, the audit-context arm in `earned.test.mjs`, N136's move in `facts.test.mjs`). The 21 modules that use inquiry: results identical before and after my changes (every failure there is already on the tranche). Checks: format 0 failures; architecture 0; coverage 47/47; ownership 0 (legacy-store 0 added, 41 removed; legacy-checks 0 added, 54 removed).

For other modules:
1. **contradiction** reads `bundles.inquiry_subject_entity` (`src/contradiction/index.mjs`:432–445, :728, :1542); after this merge inquiry writes it only to `inquiry_bundle_facts`, so contradiction's pairing and ladder go stale until its N136 re-point. Its tests still pass because its fixture writes `bundles` directly.
2. **legacy-store**: `auditPass`' context (`store.mjs`:548–549) still passes `earnedRegistry`, which now duplicates inquiry's registered context (same value; the caller's context is merged last). I left it whole because rewriting the line counts as an addition; legacy-store's job removes the `earnedRegistry` half and the `#subjectEntityOf` delegation.
3. **promotion's stamp**: C-66.5's `where` changed and its row moved family (catalogue → `src/inquiry/checks.mjs`).

Still to do in stage two (after inquiry-grammar merges): the grammar face's inquiry-grammar names and `checkBundle`, R11's synchronous entry arm, R38's rows read from inquiry-grammar.
