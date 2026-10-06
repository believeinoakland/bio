# case-grammar (T34)

**Status** · session_01UbNSaW5ZKNVsroGALhrqr4 · depth 2 · WORKING · handled B1

## Completion (T34-88, with T34-87's row)

**Entries applied.**
- **T34-88** (K1816; R21): new `people.mjs`, exported from the index: `peopleLines`, `memberTieLines`, `peopleOf`, `memberTiesOf`, with `PEOPLE_FIELDS` and `MEMBER_TIE_FIELDS`. The spelling is copied from `case-disclosures/people.mjs` (R28). For every input `case-disclosures` could write, the bytes are the same: checked against its functions on rows with nulls, quotes, backslashes, line breaks and numbers, and on empty and non-list input. Two changes keep the functions from ever throwing, as R21 requires: a row that is not an object, or that cannot be spelled, is not written (the old writer threw on it); and a reader that meets a throwing getter answers `[]`. Each field reads back as a string or null. Without the block, the answer is an empty list. I did not edit `case-disclosures`' paths; T34-89 is its job.
- **T34-87, DEC-149 (K1821)**: `complete.mjs`, `RECOMPUTE_WORDS.not_recomputed`: "a workbook this instance's engine did not recompute" is now "a workbook this group's Civicsmith did not recompute". The complete edition is read without a credential, so it says "this group's". `complete.mjs`:114 ("the copy") is a file's copy and stays. No check translation changed, so the catalogue version does not move. No other string in the module names the group's software "this instance", "this copy", "this plane" or "the plane"; I checked with a grep.

**Tests.** New `people.test.mjs`, which names R21 in three tests. The first pins one document of each block both ways: rows to the literal bytes `case-disclosures` wrote, and those bytes back to the rows. The second covers field values: a quote, backslash or line break made safe; numbers and booleans read back as strings; fields not handed read null. The third is the negative controls: no block, empty blocks, odd input, a row that cannot be spelled, throwing getters, and purity. In `complete.test.mjs`, a new R14 test names the changed string, checks that it is rendered, and has a negative control: no edition text says this instance, copy or plane. The /6 golden is unchanged, since it holds no workbook row.

**Runs.** `node --test bio-plane/test/m/case-grammar/`: 81 pass, 0 fail. Users rendering through this module: public-read 123 pass, 0 fail; case-disclosures 56/0; case-import 84/0; case-checker 33 pass, 1 fail (below).

**Checks** (process repository): format: 127 modules, 126 requirements files; 0 failures. architecture case-grammar: 27 product files, 90 relative imports; 0 failures. coverage case-grammar: 21 of 21 live requirement ids named by a test; 0 failures. ownership case-grammar tranche/T34: 0 failures.

**Generated artifacts made stale (mechanics §14; reported to BOB, not regenerated).** The changed string reaches two bundles:
- `bio-plane/src/case-checker/program.mjs`: case-checker R13 fails, "the committed program.mjs is that build". It passes on the base without this change. This is the stale artifact the START lists as inherited (case-checker R13), and K1824 item 6.
- `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`).

BOB regenerates both at the layer close (K1540's order).

**In other modules.** None found beyond the stale artifacts above. Note for T34-89: `case-disclosures/people.mjs` imports `fmSafe` from this module's index. Once it re-exports R21's four functions from here, it can drop that import along with its copy, unless its other code still needs it.

**Deferred.** Nothing. P6: the module is now 2,148 lines, under 4,000.

Size (session_01UbNSaW5ZKNVsroGALhrqr4): test runs 7, module lines 2148
