# text-chain (T51)

**Status** · session_01RQyitqBGKNtCPSNEoaoewp · depth 2 · COMPLETE · handled B0

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
