# content (T21)

**Status** · session_01DWist3yzoyMvJgNepzPwD4 · depth 2 · WORKING · handled B1

## Completion

**Entry applied: N469** (B1; K931, LEGACY-TESTS #18's list). Comments only, all in `bio-plane/src/content/extent-core.mjs`; its code is unchanged (checked: the file with every comment stripped is identical to `tranche/T21`'s).
- :31–35 (the `refusal` helper) and :584–594 (the container predicates' DEC-49 rule) named `civicos-ui/check-refusal-codes.mjs` as what matches the spelling. Re-worded: the spelling is the catalogue's, kept line for line (R48), and was what that guard matched (deleted in T20, provenance); what it protected, every C-45 refusal carrying its row's check and translation, is proven by `test/m/content/seams.test.mjs` R48, and DEC-49's totality by control-plane's `families.test.mjs` R22.
- :376–377 ("All four arms are driven end to end in `test/capture-container-extent.test.mjs`") → the R7 and R8 tests of `test/m/content/converts-extent.test.mjs` (converted from that suite), at this module's interface.
- :663–665 (`nc-rec85.mjs`'s `overstrict` arm "anchors on" `coversSheetCell`) → provenance: at FW-19 the REC-85 control's anchor matched twice (measured); that control is gone, and the `held` spelling stays because the core is the catalogue's text line for line (R48).
- Found by my re-scan of my paths, same kind, same file: :85–88 ("The suite asserts the count is zero … pinned by digest against the pristine tree") → REC-85's suite measured it at its landing (provenance); the canonical form of `document` and `pdf-page` is text-chain's, which `seams.test.mjs` R48 proves byte-identical. :361–362 ("COFF-11's `usedrangeasbound` arm breaks if anyone re-points it") → `converts-extent.test.mjs`' R7 grid-and-used-range test, converted from that arm. :537–538 ("The over-strictness arm in the suite") → `converts-extent.test.mjs`' R12, R27, R28 test of a whole-document citation of an unread capture.
- The header (:7–10), which lists what changed from the catalogue's text, now says these comments changed too.
- Kept as provenance, unchanged: the conversion headers of `test/m/content/converts-notice.test.mjs`, `converts-reads.test.mjs`, `converts-extent.test.mjs` and `converts-images.test.mjs`; `schema.mjs`:131 (where a measurement was taken). Nothing else in my paths names a deleted file or "the battery" as live.

**Deferred:** nothing. **New tests:** none needed; every re-worded claim points at an existing test.

**Other modules (REPORT J2):** the change is under `bio-plane/src/`, so the plane's generated bundle `bio-plane/dist/bio-plane.bundled.mjs` (`.bundle.json`) is stale (comments only). I regenerated nothing.

**Tests and checks run:**
- `node --test test/m/content/` (in `bio-plane/`): tests 113, pass 113, fail 0. No layer tests are named in `build/manifest.md`.
- `format`: 86 modules, 84 requirements files; 0 failures. `architecture content`: 22 product files, 67 relative imports; 0 failures. `coverage content`: 51 of 51 live requirement ids named by a test; 0 failures. `ownership content tranche/T21`: 1 file changed; 0 failures.

Size (session_01DWist3yzoyMvJgNepzPwD4): test runs 1, module lines 3468
