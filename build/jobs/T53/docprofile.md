# docprofile (T53)

**Status** · session_018BhcedMxNPcZhctb9emQwK · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# docprofile · T53 · R1 · report

**Entry applied:** T53-47 · K5565 · English in tests: docprofile's test assertions now read the key the product reads, with its placeholders' values, via `localize(id, en, vars)`, in place of regex fragments of the English.

- 14 counted sites converted across `docprofile/test/docprofile.test.mjs` (10), `reading-position.test.mjs` (2), `round9.test.mjs` (1), `seam.test.mjs` (1). Each is now an exact equality, or a `startsWith` where the sentence carries a foreign reason from another module's text.
- The C site `seam.test.mjs:43` is converted too: it asserts the product's real `parse_error` key.
- The one B site, `docprofile/readtext.mjs` `position_why` "no text was supplied", is now `localize("docprofile.readtext.no_text_was_supplied", "no text was supplied")` in the module's own source.
- Stub reasons in `docprofile/test/stubs.mjs` are exported constants, so tests reference their input, not a copy of the sentence.

**Checks:** words check on `docprofile`: 0 failures (testenglish 0, testcopy 0, missingkey 0, marker 0). Ownership check against the job base: 0 failures. Module suite `docprofile/test/*.test.mjs`: 75 pass, 0 fail.

**Not done, and why:** the three shared artifacts the entry's words work touches sit outside docprofile's paths (P7), so this job does not change them. They are for BOB:
1. `bio-plane/src/setup-words/rows.mjs` is stale until `node bio-plane/src/setup-words/build.mjs` runs on the tranche. The new key `docprofile.readtext.no_text_was_supplied` has no row yet; `localize` falls back to its English, so the module passes meanwhile. The regeneration adds one row (origin `code`).
2. `bio-plane/src/setup-words/words-unreviewed.json` gains one entry from that regeneration, for the design stream to review before a release cut.
3. `build/tests-english-baseline.json` still lists the four docprofile files at their old counts (10, 2, 1, 1). The count only shrinks, so the check passes; BOB removes the four entries when recording the layer.

**Found in other modules / other notes:**
- The rows file for this job says `sonnet-5-5` because it had B sites. The B site was resolved by the module's own source change, and the rest was test-only, so `haiku-5-5` ran it. Noted for BOB's model accounting.

**Met** · none

Tests: 75/75. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedMxNPcZhctb9emQwK): test runs 1, module lines 6532
