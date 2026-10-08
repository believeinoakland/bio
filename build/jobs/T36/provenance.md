# provenance (T36)

**Status** · session_01B5spSoDUidbVfxwqT7NYMm · depth 2 · WORKING · handled B0

## J1 · QUESTION

R61 leaves three points of a receipt's `reputation` open. My readings, which I am building on:
1. **A repeat receipt.** A repeat that gives a `reputation` replaces the stored one (the newest lookup answers for the address); a repeat that gives none keeps the stored one, as R13 keeps an existing `retrieval_locator`. So a re-fetch without a lookup never erases a recorded listing.
2. **What is stored.** "Exactly as given" for a plain object (stored as JSON, answered back deep-equal by R16 and R60). A value that is not a plain object (absent, null, a string, a list) is no reputation: the row stores null (or keeps its earlier one, per 1). acquisition R44 always hands an object.
3. **The `onReceipt` payload** carries the reputation this write gave (the receipt being reported), `null` when it gave none, never one read back from an earlier write.
Also: N730's index is `captured_locators_locator ON captured_locators(retrieval_locator)`; the column is added to existing tables by `ALTER TABLE … ADD COLUMN reputation TEXT` at boot (no row moves).
