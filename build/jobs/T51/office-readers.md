# office-readers (T51)

**Status** · session_01QsLuHE3aQNFW5i1HvNqNBC · depth 2 · WORKING · handled B1

## Completion

- **Entry applied:** T51-6, R34. `coreMetadata`/`withMetadata` (`docx.mjs`) take a `withTitle` flag; docx and pptx `text()` pass it, so `metadata.title` is the core part's `dc:title` as written, and no key when absent, empty or whitespace-only; no readable core part still gives `metadata: null`. xlsx and csv unchanged (R34 names docx and pptx only).
- **Tests:** `typed-cells.test.mjs`: new R34 test (titled, absent, empty, blank, no core part, xlsx and csv controls); the two R31 tests updated for the docx/pptx `title` key. No test weakened.
- **Deferred:** none. **Found in other modules:** none. The requirements file still marks R34 "not yet met: T51"; that line is BOB's to change.
- **Ran:** `node --test bio-plane/test/m/office-readers/` 108 pass, 0 fail; format 0 failures; architecture 0 failures; coverage 34 of 34 ids named, 0 failures; ownership 0 failures.
- Size (session_01QsLuHE3aQNFW5i1HvNqNBC): test runs 2, module lines 3819
