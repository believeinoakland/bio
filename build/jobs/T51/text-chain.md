# text-chain (T51)

**Status** · session_016U6ynRyZfVauCoMWgZaDey · depth 2 · COMPLETE · handled B5

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
