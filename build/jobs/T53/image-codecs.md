# image-codecs (T53)

**Status** · session_018BhcegW9K1yhVCSYsMB8Ve · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# image-codecs · T53 R1 · report (K5565 English-in-test entry)

**Entries applied**
- T53-55 · K5565 · English in tests: converted the module's English-in-test sites.
  - `pdf-worker/test/codecs/dct.test.mjs` (libjpeg default sentence): the test reads the row's text from the word table (`WORD_ROWS`); it no longer copies the sentence.
  - `pdf-worker/test/codecs/invariants.test.mjs` (`/the decoder reached for/` on the test's own trap): the trap throws a `Reached` error class; the assertion checks the class. The sentence is test input data, kept.
  - Words check: `0 failures` (testcopy 0, missingkey 0, marker 0, testenglish 0 on the arm).
  - Suite: `pdf-worker/test/codecs/*.test.mjs`, 80 tests, all pass.

**Not done**
- `pdf-worker/test/codecs/dct.test.mjs:318` `assert.match(e.detail.note, /Huffman table/)` — the one English regex site (CENSUS-RX B). Its note comes from five source keys (`dctdecode.huffman_table_class_or_id`, `..._counts_run_past`, `..._of_total_symbols` with vars, `bogus_huffman_table_definition_get` with a var, `..._missing_for_component`), chosen per refusal case. Mapping each case to its key needs BOB's call (see question). The baseline keeps dct at 1 (the ratchet allows no increase); the baseline was not lowered.
- Model: the row's work is `sonnet-5-5` (a B site). This session runs on Haiku 5.5; the B-site mapping above is where that matters.

**Found in other modules**: none.

**Question for BOB (WAITING)**: for the Huffman refusal test, may the job map each refused case to its word key (test-only change, with vars computed from the refusal), or should the test assert the refusal's named fields only and drop the wording check?

**Met** · none

Tests: 80/80. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegW9K1yhVCSYsMB8Ve): test runs 1, module lines 3590

## Completion (2026-10-27)

# image-codecs · T53 R1 · report 2 (K5583 answer)

**Entries applied**
- T53-55 · K5565 · English in tests: complete. The last regex site (dct.test.mjs, the Huffman refusal note) now asserts the word key for each refused case, with its values. Each case maps to the decoder check that produces it (classOrId, countsRunPast, ofTotal, bogus with its inner codes or DC-symbol reason).
- Words check: 0 failures (testenglish 0, missingkey 0, marker 0).
- Suite: pdf-worker/test/codecs/*.test.mjs, 80 of 80 pass.
- Merged origin/tranche/T53 and pulled civicos-process main (PR #20, #21).

**Not done**
- Baseline left as recorded, per BOB (K5583).

**Found in other modules**: none.

**Met** · none

Tests: 80/80. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegW9K1yhVCSYsMB8Ve): test runs 2, module lines 3590

## Completion (2026-10-28)

# image-codecs · T53 · report 3 (BOB #327 CHANGE: row-streaming decode for a 48 MP JPEG)

**Entries applied**
- No change to image-codecs. Merged origin/tranche/T53 (clean).

**Finding: the decoder already streams.** `decodeBaselineJpegRows` (pdf-worker/src/dctdecode.mjs) hands rows on in strips of at most 8 x vmax rows, one MCU row of samples per component at a time, and its test "R11 one MCU row at a time" already asserts the bound. Its live set does not grow with the image height.

**Why a 48 MP JPEG still does not redraw: the holds are in image-cover and in its bounds, not in the decoder.**
- `bio-plane/src/image-cover/redraw.mjs` `decodeRows` allocates the whole filtered output, `(stride + 1) * H` bytes, before deflating it. For a 48 MP photo that is the whole bitmap, and `deflateBounded` holds it again until it is compressed.
- Its input gate, `stride * H > picture_frame`, refuses the frame first. `picture_frame` is 4096 x 3072 x 3 = 37,748,736 bytes (read-bounds.mjs:98). A 48 MP photo is 144 MB as RGB and 48 MB as grey, so both are over it.
- The output gate is `redraw_bytes` = 32 MiB (33,554,432). A redrawn PNG of a 48 MP colour photo would need to compress to about 4.5:1 to fit (roughly 3.8:1 for grey). Photographs usually compress far less than that, so streaming the decode alone would not put the PNG within `redraw_bytes`. This is an estimate from the sizes, not a measurement; I did not build a 48 MP fixture.

**What it needs (for BOB to place)**
1. image-cover: stream the filtered rows into the deflater as they are produced, rather than holding the whole filtered bitmap (its job, bio-plane/src/image-cover).
2. A decision on `picture_frame` (runtime-limits): either raise it for the streamed path, or keep it and accept that a 48 MP photo is refused (BOB's; P17).
3. A decision on whether a 48 MP photo can fit `redraw_bytes` at all. If not, the target is wrong and needs a different number or a different output (BOB's; K1881).
4. A test that decodes a large JPEG by rows and bounds the peak, if (1) lands. It belongs to image-cover's interface, with the decoder's existing row test as its base.

**Met** · none

Tests: 80/80. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegW9K1yhVCSYsMB8Ve): test runs 3, module lines 3590
