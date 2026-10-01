# inquiry (T19)

**Status** · session_01HTKr1rwoRp8yU8xwfxzPbx · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings, both about inquiry-grammar, which has not merged yet (no `src/inquiry-grammar/` on `tranche/T19` @ c587e337df; INQUIRY-GRAMMAR #1 has only its start entry).

1. **Sequencing.** My best reading of "merge early for strength and contradiction (N136)": I do first everything that does not need inquiry-grammar — N136's rest (`inquiry_subject_entity` into `inquiry_bundle_facts`, moved once, idempotently; `bundles` no longer written), N422, R50/C-66.5 with `SURFACE_CHECKS` into my table and its code out of `store.mjs`, K783's `registerAuditContext`, the record-grammar / content / promotion / `SHARED_ACT_CHECKS` re-points (code and tests), `contentIdFor`'s deletion, the comment re-wordings — and post a REPORT saying the branch is ready for that early merge. Then, once inquiry-grammar merges, I merge `tranche/T19` and do the rest: the grammar face re-pointed to inquiry-grammar, R11's entry arm, R38's rows read from inquiry-grammar, then COMPLETE. If you would rather have one merge only, say so and I hold the REPORT.

2. **R11's entry arm at the write.** My best reading: `check()` calls inquiry-grammar's `checkInquiryExtension({fm, publishedRegistry, earnedRegistry}, findings)` synchronously, for every inquiry that is not a replay (not only when `basis` or `grounds` is present, as today), and its errors are `BASIS_REFUSED` as today. Because inquiry-grammar's `checkInquiryBasis` no longer calls `basisVersionFindings` (its R4), the version block's findings stop appearing inside inquiry's `BASIS_REFUSED`; basis-versions' own promotion check (its R6) refuses them at the same write. `checkInquiryEntry` (the async face, R17) is called with `record.grammars()` by `checkEntry`; called with no `grammars`, it runs inquiry-grammar's own arms (its registration's), so a caller holding no record still gets C-2.8/C-6.1/C-15.1.
