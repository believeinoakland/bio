# provenance (T36)

**Status** · session_01B5spSoDUidbVfxwqT7NYMm · depth 2 · COMPLETE · handled B2

## Completion (PROVENANCE #18)

**Entry applied: T36-9** (N725, N730, K2087; K1973, K1993). B2's answer to J1 (K2096): my three readings and the index stand, and are what is built.

- **R60** `receiptsOfCapture({captureSha})` (`index.mjs`): one seek on `captured_locators_sha`, rows as R16 answers them (the shared `receiptRow`), ordered by `address_norm`, `via`, with their summed observations; `sha256:` prefix and case ignored (`bareSha`, as R5); a missing or non-64-hex digest answers `{capture_sha: null, rows: [], observations: 0}`; writes nothing.
- **R61** `reputation` (`schema.mjs`, `index.mjs`): a `reputation TEXT` column on `captured_locators` (JSON), added to an existing store at boot by the additive `ALTER TABLE` list (every earlier receipt null, no row moved; idempotent). `recordReceipt` stores a plain object exactly as given, and treats anything else as none. A repeat that gives one replaces the stored one; a repeat that gives none keeps it (`COALESCE`, as `retrieval_locator`). R16 and R60 rows read it back to the object, `null` when none. R47's payload carries this write's reputation, `null` when none. No other field, grade, chain or answer moves (tested against a twin record without reputations). `op=recordcapturedlocator` (R53) passes a body's `reputation` through unchanged, since the body's rest is the receipt; tested.
- **N730** (Suggestion): index `captured_locators_locator ON captured_locators(retrieval_locator)`; a test asks SQLite's query plan that a read by retrieval locator seeks it, and that R60's read seeks `captured_locators_sha`.
- `receipts()` now selects its columns by name (`RECEIPT_COLUMNS`) rather than `*`. Its rows gain `reputation`. R48's read contract is unchanged; the column is outside it.

**Reading set (§17).** The set is over 300 KB: code and tests alone are 424 KB, and requirements are 40 KB. So I took (3), a summary for this task. Read whole myself: `build/requirements/provenance.md`; layer 3's row of `build/layers.md`; the plan's T36-9 entry, rules at the opening and the L3 lines; rulings K1973, K1993 and K2087; the code my entry changes (`index.mjs`, `schema.mjs`, `ops.mjs`); and `receipts.test.mjs` and `fixture.mjs`. The used services (record-core `transact`, membership `listenerRefusal`/`MODULE_ORDER`) are unchanged in use. My worker read whole the other 19 files (`checks.mjs`, `register-checks.mjs`, every other provenance test, and the three outside test files; 320 KB). It wrote a summary of about 14 KB, each statement citing file:line. It named the two whole-row pins that a new column breaks (`ops.test.mjs`:129, `unpacked.test.mjs`:32), and the answers that must not gain `reputation` (`versionChain`, `captureGrade`, `registerHolds`, `capturesOf`). It also named the workerd-cap and R40 scans, where I added `receiptsOfCapture`. Nothing it left out mattered: the full provenance suite and every user's suite were run.

**Deferred.** None.

**Found in other modules / for BOB.**
- `setup` (`bio-plane/src/setup.mjs`:1272, `#readCapture`): reads every receipt with `receipts()` and filters by `capture_sha`. It could read `receiptsOfCapture({captureSha})` (R60) instead, the same read standards R38 moves to in T36-15 (`standards/index.mjs`:613). An efficiency point, not a defect; whichever module owns `setup.mjs` decides.
- `file-safety` (T36-11) and `acquisition` (T36-10): `recordReceipt({…, reputation})` takes R44's object as given; `onReceipt`'s payload carries `reputation` for file-safety's intake on every receipt (its R1).
- Generated artifact made stale: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (it embeds this module), for L3's close (§14).

**Tests and checks**
- `node --test bio-plane/test/m/provenance/`: tests 111, pass 111, fail 0. New file `reputation.test.mjs`: R60 ×2, R61 ×6, N730 ×1. I updated the three whole-row pins for the new column (`receipts.test.mjs` R13 and R47, `ops.test.mjs` R53, `unpacked.test.mjs` R15/R48). Negative control: with the repeat's `COALESCE` removed, the R61 repeat test fails (8/9); restored.
- `bio-plane/test/mk6-bundle-names-no-author.test.mjs`: 1 pass. No layer tests (manifest).
- Users of the changed services: the tests of every module whose `uses` names provenance (55 paths). Every module suite passes but four, each failing one test that is an accepted red or pre-existing. following R1 C-137 is red 8. progressions R41 is red 16. sources R1 mintExhausted is red 5. answer-envelope R7 "every code decorated before the catalogue's end" also fails on `origin/tranche/T36` unmodified: pre-existing, in a catalogue this job does not touch. `test/system/migrate-released.test.mjs` (a released store migrated forward, run alone; it did not finish inside the first run's time limit): 1 pass.
- `checks/format.mjs`: 135 modules, 134 requirements files, 0 failures. `architecture.mjs provenance`: 0 failures. `coverage.mjs provenance`: 46 of 46 live requirement ids named by a test, 0 failures. `ownership.mjs provenance tranche/T36`: 0 failures.

Size (session_01B5spSoDUidbVfxwqT7NYMm): test runs 12, module lines 2730

## J1 · QUESTION

R61 leaves three points of a receipt's `reputation` open. My readings, which I am building on:
1. **A repeat receipt.** A repeat that gives a `reputation` replaces the stored one (the newest lookup answers for the address); a repeat that gives none keeps the stored one, as R13 keeps an existing `retrieval_locator`. So a re-fetch without a lookup never erases a recorded listing.
2. **What is stored.** "Exactly as given" for a plain object (stored as JSON, answered back deep-equal by R16 and R60). A value that is not a plain object (absent, null, a string, a list) is no reputation: the row stores null (or keeps its earlier one, per 1). acquisition R44 always hands an object.
3. **The `onReceipt` payload** carries the reputation this write gave (the receipt being reported), `null` when it gave none, never one read back from an earlier write.
Also: N730's index is `captured_locators_locator ON captured_locators(retrieval_locator)`; the column is added to existing tables by `ALTER TABLE … ADD COLUMN reputation TEXT` at boot (no row moves).
