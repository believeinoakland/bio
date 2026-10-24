# text-chain (T51)

**Status** · session_017axPWY6DHbvZpqTGuJogoE · depth 2 · WORKING · handled B8

## J1 · COMPLETE

Completion of T51-252 (text-chain), commit 6a26c46c93 on job/T51/text-chain.

**Entries applied.** T51-252: all 15 `plain` findings of build/plan/words-pass/text-chain.md (K3957), each judged a sentence a member reads:
- Refusal details, through `localize` with new ids (`text-chain.textchain.*`): the confidence refusal (line 1021), the machine-reading anchor (1102), the anchor with no page (1107) and no rect (1111), the attestation with no member (1146), no date (1148) and a page extent with no page (1154).
- The six landed extent phrases (1505 to 1510), through `localize`, English unchanged (R92 pins it; see the REPORT below).
- Through `word`: `TIER_RULE` (1759) reads `textchain.tier_rule`; the tier-2 refusal reason (1922) reads `textchain.why.document_tier_reading`, its `{held}` filled by two localized fragments (`reported_characters_no_text_read`, `decoded_glyphs_held`).
- No text found that no member reads, so nothing is listed as unkeyed.

**Deferred.** None.

**Found in other modules.** None.

**REPORT to BOB (a wording divergence for a ruling).** The six landed extent phrases differ from the design's rows: the design holds `textchain.text.cell_spreadsheet` "a cell of this spreadsheet", `shape_deck` "a shape in this deck", `paragraph_document` "a paragraph of this document", `range_cells_spreadsheet` "a range of cells in this spreadsheet", `table_document` "a table in this document" and `image_document` "an image in this document". R92 pins the module's current phrases ("a cell of a spreadsheet" and so on), so this job kept them with `localize` rather than change a requirement. The extent test already expects the design rows for the fallback phrases, so the module reads both wordings today. Bob to rule which wording stands. If the design's, R92's wording is a requirement edit by BOB, and the module then reads `word`.

**Tests and checks** (run from civicos-process against /home/user/bio):
- `node --test test/m/text-chain/*.test.mjs` (bio-plane): 132 pass, 0 fail, from a new file `test/m/text-chain/words.test.mjs` that names each new id.
- `checks/format.mjs`: 0 failures.
- `checks/architecture.mjs text-chain` and `checks/run.mjs`: 0 failures.
- `checks/coverage.mjs text-chain`: 104 of 104 live requirement ids named by a test.
- `checks/ownership.mjs ... tranche/T51 job/T51/text-chain`: 1 file changed by text-chain, 0 failures.
- `checks/words.mjs`: no finding in text-chain. The product-wide run still reports 4,829 words failures in other modules (the inherited reds); none is in text-chain's paths or tests.

Size (session_01RQyitqBGKNtCPSNEoaoewp): test runs 2, module lines 1983

## J2 · COMPLETE

Completion again after CHANGE B2 (K3962, K3965), commit 0761388f1e on job/T51/text-chain.

**Done.**
- Merged tranche/T51 and pulled civicos-process (ea6cd83) first.
- The six extent phrases now read word('textchain.text.cell_spreadsheet'), shape_deck, paragraph_document, range_cells_spreadsheet, table_document and image_document (K3965). The localize ids for them are removed.
- The R92 test in extent.test.mjs compares each human with word(key); the three R92 tests in words.test.mjs became one test that does the same.
- The six test copies listed in build/plan/words-pass/text-chain.md (K3962) are converted; the module's tests hold no sentence copy. No regular-expression copies were found.

**Checks.**
- node --test test/m/text-chain/*.test.mjs: 130 pass, 0 fail.
- setup-words build --check: exit 0. Its one warning is for jurisdictions.index.amount_is_amount_and_units, not this module.
- format: 0 failures. architecture: 0 failures (run.mjs).
- coverage text-chain: 104 of 104 live requirement ids named by a test.
- ownership: 1 file changed by text-chain, 0 failures.
- words: no finding in text-chain. Product-wide run: 4,549 failures, all in other modules.

**Deferred.** None. **Found in other modules.** None.

Size (session_01RQyitqBGKNtCPSNEoaoewp): test runs 3, module lines 1983

## J3 · QUESTION

FR-41 / entry L6 names the wrong module. `visibleTextOfHtml` is not in text-chain's `paths` (`bio-plane/src/textchain.mjs`, which holds no HTML code: line 854 there is the tiersEvidenced comment). It is `export function visibleTextOfHtml` at `bio-plane/src/reading-pipeline/index.mjs:854-866`, owned by `reading-pipeline` (called from `textUnitsOfText`, line 876; its requirement is `reading-pipeline` R32). text-chain's requirements (R1-R104) say nothing about HTML or page text, and it is a pure chain/extent grammar, so there is nothing of mine to change, and I may not edit reading-pipeline's file (ownership check would fail).

Best reading / recommendation: move L6 to `reading-pipeline` (it merges after text-chain anyway). The requirement line then belongs in `reading-pipeline.md` as an amendment to R32, not as text-chain R105, and I write no R105. The change itself is small and local: in `visibleTextOfHtml`, drop `nav` elements and any element with `role="navigation"` (with their contents, nesting-aware), skip links (an `a` whose href starts with `#` and whose text is "Skip to ..."), and unresolved template tokens (`{1}`, `{name}`-style numeric/identifier braces and `##LOC[...]##`); a page with no landmarks keeps all text. Tests are the four BOB listed (nav block, role=navigation block, skip link, tokens -> article only; no-landmark control; nav inside the article body dropped; two reads identical).

Alternative if you want it here: I add a pure `pageContentText` helper to text-chain and reading-pipeline calls it; that needs a reading-pipeline change anyway and gives text-chain HTML knowledge it does not have, so I do not recommend it.

I have made no change. Waiting for your ruling: re-place L6 to reading-pipeline (then FR-41 has no entries and text-chain can be archived), or tell me otherwise.

## J4 · COMPLETE

Completion of G48 (B5, TEXT-CHAIN #10). The J3 QUESTION above (FR-41/L6) is answered by B4 and no session waits on it; this section does not act on it.

**What changed.** `bio-plane/src/textchain.mjs`: `glyphCount` (:1843) counts with a `charCodeAt` loop and no per-character regexp; the whitespace above U+00A0 is `isWideSpace` (:1827), spelled from R73's set; the `WHITESPACE` regexp had no other user and is removed. No signature, no other function changed. Definition to the letter: `0` for a non-string; a high surrogate followed by a low counts once with it; a lone surrogate counts once; whitespace is U+0009-000D, 0020, 00A0, 1680, 2000-200A, 2028, 2029, 202F, 205F, 3000, FEFF; other controls count.

**Failing-first** `bio-plane/test/m/text-chain/g48-glyphs.test.mjs` (7 tests, each names R73): (a) zero `RegExp.prototype.test`/`exec` calls over a 10,000-character mixed string: red on the tip (17,500 calls, `test` calls `exec`), green after. (b) the control, the old loop spelled in the test: every UTF-16 code unit alone, between letters and doubled; surrogate arrangements; astral points at stride 257 with the first and last; the `\s` set and controls; a 1 MiB CSV-shaped text; non-strings give 0. Seen green on the tip first, green after.

**Measured ratio** (information, not a test; node 26 child, 50,500,002 characters, old `for...of` plus regexp against the new loop, same answer 40,438,700): old 1.4-2.0 s, new 0.16 s, 8.7x to 12.4x here.

**Suites.** text-chain: 128 pass, 0 fail (preload run from `bio-plane/`). Users that name `glyphCount`: extraction all 325 pass; reading-pipeline 233 of 234, the one failure being `pdf-pieces.test.mjs` R40 R36 (G26) at its 60 s limit under load, which passes alone (41.6 s). `impact.mjs` names 115 modules by import closure; only extraction and reading-pipeline use `glyphCount`, and both were run.

**Checks** (`checks/run.mjs`): format 0, architecture 0, coverage 0 (6686 of 6686), channels 0, words 0 failures (inline, plain, testcopy, missingkey, handlist 0). coverage text-chain: 104 of 104. ownership: 3 files changed by text-chain, 0 failures.

**Census (K4208).** I own no op; no accepted key changes. **Requirement lines proposed.** R73 unchanged in meaning; if BOB wants the method stated: "R73a: the count is made without a per-character regexp." (its test is (a)). **Deferred.** None. **Found in other modules.** None. **Providers' state.** None needed.

Size (session_016U6ynRyZfVauCoMWgZaDey): test runs 9, module lines 1998

## J5 · COMPLETE

G48 complete (record section J4, commit on job/T51/text-chain): glyphCount is a charCodeAt loop, no per-character regexp, R73 to the letter. g48-glyphs.test.mjs 7 tests: (a) red on tip (17,500 regexp calls), green after; (b) independent-spelling control green before and after. text-chain 128 pass; extraction 325 pass; reading-pipeline 233/234 (pdf-pieces R40 R36 G26 timed out at 60s under load, passes alone in 41.6s). Ratio 8.7x-12.4x on 50.5M chars. checks/run.mjs 0 failures, ownership 0. No census op owned. Proposed line: R73a the count is made without a per-character regexp.

## J6 · COMPLETE

Completion of fix round 9 (START B6): G141 (owner), G131g (`glyphCount`), G124e (kept). Tranche/T51 merged first (requirement file read whole, R39, R73, R76, R78, R105, R106).

**Entries applied (`bio-plane/src/textchain.mjs`; no file outside my paths created).**
- **R39** `describeChain`/`pageList` spell a page 1-based ("page 1", "pages 1-3, 6"); stored extents, R22, R27, R47 untouched.
- **R73** `glyphCount` skips U+0000 and U+FFFD.
- **R105** `mergeTier2Text` keeps every page: an unnumbered base page is kept as tier 1 after the numbered pages (in `kept` as `null`); a tier-2 page the base lacks is adopted as tier 2 at its page number (in `replaced`); an unnumbered tier-2 page is adopted after the numbered pages (in `replaced` as `null`); `document`, `counts`, `undetermined`, `perPageTier` follow the pages; two tier-2 pages with one number: the later is the page (once).
- **R106** `appendStep` is linear: a chain returned by `layerChain`, `appendStep`, `convertedChain` or `mergedChain` is remembered (WeakMap with its length and last step) with a running state of `derivationCap`'s whole-document question; an append folds only the new step. A branch (append to an older chain), a chain pushed to since it was returned, and a hand-built chain are answered by the whole check, exactly as before. `derivationCap` shares the same fold (one implementation of the question).
- **G124e** `canonicalRange` past ZZZ: kept, no code change (BOB's START). Pinned by a test: XFD (16,384) works, the 4-letter form stays null.

**R-FOUR, per cause.**
- *G141 chain sentence, R39.* (1) `pageList` printed the stored 0-based number (`textchain.mjs:352-360`). (2) Tests pinned the 0-based text (chain.test R39) and no test said the stored numbers stay 0-based. (3) Failing-first `round9.test.mjs` "R39 (G141)", red: `+ actual "the document's own text layer (page 0)"  - expected "... (page 1)"`; green now. (4) N.
- *G141 `mergeTier2Text`, R105.* (1) `usable` filter (`:1902`) and the loop over `usable` only (`:1936-1960`) dropped unnumbered base pages and tier-2 pages the base lacks. (2) Tests covered numbered, equal page sets only. (3) Four "R105" tests, red against the old source: base `[loose, 0, "7", 1]` lost `loose` and `seven` (diff `- { text: 'loose', tier: 1 ...`), adopted pages absent, unnumbered tier-2 page absent; green now. (4) N.
- *G141 `appendStep`, R106.* (1) `appendStep` ran `checkChain(chain)` and `derivationCap(chain)` (itself a `checkChain` and a pass over every step) per append: quadratic. (2) Chains in tests were short. (3) "R106 (G141): 5,000 appendStep calls inspect at most 4 times 5,000 steps" counts reads of `STEP_KINDS.layer.role` (one per step inspected); red against the old source (assertion over 4 × 5,000; the test took 6.6 s there against 1.3 s now); green now at a few thousand reads. A second R106 test appends 1,500 random steps (scoped, unreadable, parts, conversions, attestations, refusals, branches from older chains) to chains the module returned and to hand-built copies, and compares the answers, `derivationCap` and `describeChain`: equal in every case. (4) N.
- *G131g `glyphCount`, R73.* (1) `textchain.mjs:1852` counted U+FFFD and NUL as glyphs. (2) Tests used no decode failures. (3) "R73 (G131g)" red against the old source (`1 !== 0` on `glyphCount("\u0000")`); the G48 control `spelled` and two G48 cases updated to the new definition (they pinned the old one); green now. (4) L, as the plan says, is the encoding matrix, which is the decode owners' and control-plane's seam, not mine.
- *G124e.* (1) `canonicalRange` is null past ZZZ by design (R93: 1-3 letters), kept. (2) No wide fixture. (3) "R93 R95 (G124e)": green on the old and the new source (nothing changed, pinned). (4) N.

**Tests and checks.**
- Module: `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/text-chain/` (bio-plane): 146 tests, 146 pass, 0 fail (new file `round9.test.mjs`, 9 tests; `chain.test.mjs` R39 expectation moved to 1-based; `g48-glyphs.test.mjs` control moved to R73).
- Direct users of the module (`modules.json` `uses`), pass/fail: query-language 57/0, inquiry-grammar 85/0, leg-earning 57/0, inquiry 225/0 of 226 (one skipped), basis-version-grammar 33/0, basis-versions 182/0, run-productions 65/0, reevaluation 163/0, answer-envelope 43/0, extraction 328/0, content 155/0, connections 146/0, observation-log 84/0, d606-perpage-ocr 1/0, tier2-wire 1/0, doctypes 60/0, ocr-worker 1/0, reading-pipeline 316 of 319 (below).
- reading-pipeline: three failures. (a) `transcribe.test.mjs:132` "R29 R23" pins the chain sentence 0-based (`(pages 1-2)`; now `(pages 2-3)`): a consequence of ruling (6), see REPORT 1. (b) "R40 R36 (G26)" and "G88 R42" are timing tests that failed while two suites ran at once; each passes alone (R-NOLOAD: 1/0 and 38/0).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs text-chain`: 0 failures. `checks/coverage.mjs text-chain`: 106 of 106 live requirement ids named by a test. `checks/ownership.mjs ... tranche/T51`: 5 files changed by text-chain, 0 failures. `checks/words.mjs`: no finding in text-chain (17 failures in other modules; I added no sentence, so no stand-in and no words row is owed).

**REPORT to BOB (nothing blocks; all are other modules' or your wording).**
1. *reading-pipeline's test* `bio-plane/test/m/reading-pipeline/transcribe.test.mjs:132` pins the 0-based chain sentence ("text-chain's 0-based pages"); its job changes the expectation to `(pages 2-3)`. No other test outside my module pins a 0-based `describeChain` text (searched `(page[s] N` over bio-plane, doctypes, ocr-worker tests).
2. *Same defect class, outside ruling (6)'s sentence:* `gradeCeiling`'s `why` for an undetermined page reads "for page N" with the stored 0-based number (R57; word `textchain.why.step_text_provenance`, `{page}` filled at `textchain.mjs` gradeCeiling). R57's test pins `/page 0/`. I left it because ruling (6) names the chain sentence only. If you rule it 1-based, the change is one expression and one test line in my module.
3. *Proposed requirement wording (BOB writes it):* R105 should say the `kept`/`replaced` entry of a page with no integer number is `null`, which is what I built (consumers `reading-pipeline` index.mjs:2561-2564 and `extraction` index.mjs:2216 read only `.length` or pass the lists to `mergedChain`, which keeps only integer pages, so an unnumbered page sits in no part's extent there; that is their reading of an unnumbered page, not text-chain's).
4. *R106 and a mutated chain:* a returned chain that a caller mutates in place by replacing a step (not by push or truncate) is not detected; the contract says chains are values and no module in the tree does this.
5. *Generated artifacts made stale:* `bio-plane/dist/bio-plane.bundled.mjs` and the agent-worker bundle include `textchain.mjs`; BOB regenerates at the round end.

**Deferred.** None.

Size (session_01XYjSqzMCJiW54TqbtMFFcE): test runs 19, module lines 2072

## J7 · COMPLETE

Completion again after CHANGE B8 (K4863). Tranche/T51 merged first.

**Done.** `gradeCeiling`'s `why` for an undetermined page now spells the page 1-based ("for page 1" for stored page 0), like the chain sentence (R39); the stored page numbers are untouched. R57's test now asserts page 0 reads "page 1" (and not "page 0") and page 4 reads "page 5".

**Tests and checks.**
- `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/text-chain/*.test.mjs` (bio-plane): 146 tests, 146 pass, 0 fail. (The directory form `test/m/text-chain/` prints a lower count, 122 to 133, from the runner, with 0 failures; the file list runs every file.)
- Users of `gradeCeiling`: leg-earning 57/0, content 155/0, inquiry 225/0, basis-versions 182/0.
- format: 0 failures. architecture: 0 failures. coverage text-chain: 106 of 106 ids named by a test. ownership: 6 files changed by text-chain, 0 failures.

**Deferred.** None. **Found in other modules.** Nothing new beyond J6's REPORT 1 (reading-pipeline's `transcribe.test.mjs:132`).

Size (session_01XYjSqzMCJiW54TqbtMFFcE): test runs 24, module lines 2072
