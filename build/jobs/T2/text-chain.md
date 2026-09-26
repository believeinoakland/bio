# text-chain · T2 job record

**Session** · `session_011N1d8x7gArcfWDvLkY3fC5` (TEXT-CHAIN #1). Job for `text-chain`, tranche T2, started by BOB #41.

**Status** · COMPLETE, 2026-09-26. All four entries applied. BOB answered Q1 and Q2 with ruling K38: both readings stand as built, and R22, R77 and R81 now say so. I merged `tranche/T2` into this branch and re-ran the module tests and all four checks: 86 of 86 tests pass and every check shows 0 failures. Q3 is a wording point about R78 and changes no behaviour; it is still open.

## QUESTION to BOB (2026-09-26). Q1 and Q2 were answered by K38 (tranche/T2 @ bf680b7e) and are built as ruled.

**Q1 · R77, where the `image_content_*` markers are.** R77 says every *field* on the base page whose name starts with `image_content_` is copied onto a page tier 2 wins. The producer does not write fields: `pdf-reader` R26 (`markImageContent` in `pdfstructure.mjs`) writes each one as an ENTRY in the page's `undetermined` list, `{page, reason:"image_content_unread"|"image_content_undetermined", font:null, codes:"", count:0, image_share, glyphs}`. So R77 as worded copies nothing that exists, and D-633 stays unfixed.
*My best reading, which I am building:* R77 means the markers. On a page tier 2 wins, every entry of the base page's `undetermined` whose `reason` starts with `image_content_` is carried, unchanged, after tier 2's own markers, unless tier 2's page already states an `image_content_*` marker (no second one). Any top-level field named `image_content_*` on the base page is also copied, as R77 literally says. R76's "`undetermined: <t2's markers>`" then reads "t2's markers plus the carried image markers". A marker counts 0 undetermined characters, so no award moves.
*Also:* the snapshot's built work (`land/worker/D-633` @ cbc5ae9b) RE-GRADES the carried marker against tier 2's glyph count (BOB #35, 08:05Z), using `pdf-reader`'s thresholds. R77 says "unchanged", and `text-chain` does not use `pdf-reader`, so I carry it unchanged. If you want the re-grade, R77 needs to say so and `text-chain` gains a `uses` edge on `pdf-reader` (it is earlier in the order) for `IMAGE_CONTENT_*`.

**Q2 · R81, what "more than one kind" counts, and what a part is.** Read literally, a page covered by one part's `pixels` then `ocr` steps is covered by two kinds and would read `mixed`, which would make every OCR'd page `mixed`. And with R22's stamp (`{kind:"pages", pages}`), two parts that list the SAME pages (D-635's case: the whole book's folios from the layer, and an OCR transcription over the same pages) are indistinguishable from one part, so the page would read the last-appended kind: exactly D-723's defect.
*My best reading, which I am building (the snapshot's D-723 rule):* each PART covering the page answers the kind of its LAST derivation step (`pixels` then `ocr` is one reading, `ocr`); the page reads that kind when every covering part agrees and `mixed` when they differ. An unscoped step met walking from the end answers alone (it read every page last); one met after a covering part ends the walk. No covering step, or any unreadable extent (R30), answers `null`. To tell parts apart, `mergedChain` stamps `extent.part = <part index>` on each derivation step **only when two parts share a page**; a partitioned chain is stamped exactly as R22 says today, byte for byte. The same part key is used by `derivationCap`'s R28, so a layer part (no cap) sharing pages with an OCR part (a letter) makes the whole answer `null`, as R28 intends. This adds a field to R22's output in the overlap case: please fold it into R22 (or rule otherwise). The service is `chainKindFor(chain, target)` with `target` `{page}` or a page number, plus the exported constant `CHAIN_KIND_MIXED = "mixed"`.

**Q3 · R78's join (a wording point; nothing built differs).** R78 says the merged `document` is "<pages' texts joined by "\n">". The code has always skipped pages whose text is empty, so `["one", "two", ""]` gives `"one\ntwo"`, not `"one\ntwo\n"`. I kept that behaviour, because changing it would change the text of stored documents, and `R78`'s test pins it. *Best reading:* "the non-empty page texts, joined by "\n"". Please clarify R78's wording, or rule that empty pages join too.

## Entries applied

- **T2-10** · Requirement-named tests for every live id: `bio-plane/test/m/text-chain/` has 86 tests in five files (`chain`, `grade`, `position`, `tier2`, `invariants`). Every live id R1–R86 is named in a test title, and each test checks its requirement at the module's interface.
- **D-633 (R77)** · `mergeTier2Text`: on a page tier 2 wins, the base page's `image_content_*` markers are carried unchanged after tier 2's own. If tier 2's page already states one, nothing is carried. Any field named `image_content_*` is also copied (Q1). The snapshot's re-grade is not taken (Q1). The award is unmoved: a marker counts 0 undetermined characters.
- **D-723 (R81)** · New service `chainKindFor(chain, target)` (target `{page}` or a page number) and constant `CHAIN_KIND_MIXED = "mixed"`. Each part covering the page answers its last derivation step. Parts that agree give that kind, and parts that differ give `mixed`. The answer is `null` when no step covers the page or any extent is unreadable. To support it, `mergedChain` stamps `extent.part` when two parts share a page (Q2), and `derivationCap`'s R28 keys parts by it. `terminalStep` is unchanged. The snapshot's `CHAIN_LAST` and whole-unit branch were not taken: R81 asks only per page.
- **D-416 (R72)** · `readingPositionInExtent`: a `sheet-cell` reading is inside a `sheet-range` extent `{sheet, range}` when the sheet matches and the cell falls within the A1 range. Ranges are parsed strictly: `B2:C3` in either corner order, `$` absolute, a single cell, whole columns `B:D`, whole rows `3:7`. Anything unparseable answers `false`.
- **A flaw fixed in this module (R83)** · `layerChain(null)` threw a TypeError. The invariants test found it. A non-object argument now gives every default.

## Deferred

Nothing.

## Found in other modules and generated artifacts (REPORT)

- **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`; BOB regenerates at layer close) bundle `textchain.mjs`. `node --test bio-plane/test/fleetbundles.test.mjs` passes on `tranche/T2`'s `textchain.mjs` and fails on mine, which is the expected staleness. The worker bundles do not include `textchain.mjs` and are unaffected.
- **Callers that will want R81:** `store.mjs` (legacy-store) still reads a page's kind as `terminalStep(chain) || "layer"`. The requirements' Suggestions name that caller-side obligation, and it belongs to `legacy-store` (or `content`/`extraction` when extracted): ask `chainKindFor(chain, {page})` per page.
- **pdf-reader / text-chain seam (Q1):** if the re-grade is wanted, `IMAGE_CONTENT_*` thresholds have to be read from `pdf-reader`, which needs a `uses` edge.

## Tests and checks run

- Module tests: `node --test bio-plane/test/m/text-chain/`: tests 86, pass 86, fail 0.
- Layer tests: none named in `build/manifest.md`.
- The old battery's 21 files that import `textchain.mjs`, each run with `node --test`: 21 files, 0 failing (among them `textchain.test.mjs`: 210 passed, 0 failed).
- `node checks/format.mjs`: 61 modules, 19 requirements files; 0 failures.
- `node checks/architecture.mjs … text-chain`: 6 product files, 9 relative imports; 0 failures.
- `node checks/coverage.mjs … text-chain`: 86 of 86 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … text-chain tranche/T2`: 0 failures.

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_011N1d8x7gArcfWDvLkY3fC5,job,text-chain,8544462,184064,102,57742,51,12,1649
```
