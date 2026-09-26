# text-chain · T2 job record

**Session** · `session_011N1d8x7gArcfWDvLkY3fC5` (TEXT-CHAIN #1). Job for `text-chain`, tranche T2, started by BOB #41.

**Status** · IN PROGRESS, 2026-09-26. Entries T2-10, D-633, D-723, D-416 being built. One QUESTION open (below); I am building on the best readings stated there and not waiting.

## QUESTION to BOB (2026-09-26)

**Q1 · R77, where the `image_content_*` markers are.** R77 says every *field* on the base page whose name starts with `image_content_` is copied onto a page tier 2 wins. The producer does not write fields: `pdf-reader` R26 (`markImageContent` in `pdfstructure.mjs`) writes each one as an ENTRY in the page's `undetermined` list, `{page, reason:"image_content_unread"|"image_content_undetermined", font:null, codes:"", count:0, image_share, glyphs}`. So R77 as worded copies nothing that exists, and D-633 stays unfixed.
*My best reading, which I am building:* R77 means the markers. On a page tier 2 wins, every entry of the base page's `undetermined` whose `reason` starts with `image_content_` is carried, unchanged, after tier 2's own markers, unless tier 2's page already states an `image_content_*` marker (no second one). Any top-level field named `image_content_*` on the base page is also copied, as R77 literally says. R76's "`undetermined: <t2's markers>`" then reads "t2's markers plus the carried image markers". A marker counts 0 undetermined characters, so no award moves.
*Also:* the snapshot's built work (`land/worker/D-633` @ cbc5ae9b) RE-GRADES the carried marker against tier 2's glyph count (BOB #35, 08:05Z), using `pdf-reader`'s thresholds. R77 says "unchanged", and `text-chain` does not use `pdf-reader`, so I carry it unchanged. If you want the re-grade, R77 needs to say so and `text-chain` gains a `uses` edge on `pdf-reader` (it is earlier in the order) for `IMAGE_CONTENT_*`.

**Q2 · R81, what "more than one kind" counts, and what a part is.** Read literally, a page covered by one part's `pixels` then `ocr` steps is covered by two kinds and would read `mixed`, which would make every OCR'd page `mixed`. And with R22's stamp (`{kind:"pages", pages}`), two parts that list the SAME pages (D-635's case: the whole book's folios from the layer, and an OCR transcription over the same pages) are indistinguishable from one part, so the page would read the last-appended kind: exactly D-723's defect.
*My best reading, which I am building (the snapshot's D-723 rule):* each PART covering the page answers the kind of its LAST derivation step (`pixels` then `ocr` is one reading, `ocr`); the page reads that kind when every covering part agrees and `mixed` when they differ. An unscoped step met walking from the end answers alone (it read every page last); one met after a covering part ends the walk. No covering step, or any unreadable extent (R30), answers `null`. To tell parts apart, `mergedChain` stamps `extent.part = <part index>` on each derivation step **only when two parts share a page**; a partitioned chain is stamped exactly as R22 says today, byte for byte. The same part key is used by `derivationCap`'s R28, so a layer part (no cap) sharing pages with an OCR part (a letter) makes the whole answer `null`, as R28 intends. This adds a field to R22's output in the overlap case: please fold it into R22 (or rule otherwise). The service is `chainKindFor(chain, target)` with `target` `{page}` or a page number, plus the exported constant `CHAIN_KIND_MIXED = "mixed"`.

## Entries

(filled at completion)
