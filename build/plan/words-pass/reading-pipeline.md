# reading-pipeline: the words check after the conversion (K3949)

Layer 4. 11 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/reading-pipeline/index.mjs:1024` [copy] "this reader does not say where"
- inline `bio-plane/src/reading-pipeline/index.mjs:1031` "the {} reader could not parse the {} text-layer text ({}), so nothi..."
- inline `bio-plane/src/reading-pipeline/index.mjs:1033` "read by the {} reader v{} over {} {} (tier {}); {}"
- inline `bio-plane/src/reading-pipeline/index.mjs:1034` "the {} reader found no entities in this document's {} text-layer te..."
- inline `bio-plane/src/reading-pipeline/index.mjs:219` "{} character(s) its producer counted and no text this merge can read"
- inline `bio-plane/src/reading-pipeline/index.mjs:284` "; the {} that already had text kept it"
- inline `bio-plane/src/reading-pipeline/index.mjs:602` "; the other {} have no text layer to read and no OCR engine is inst..."
- inline `bio-plane/src/reading-pipeline/index.mjs:603` "Civicsmith, so nothing is claimed about what they say"
- testcopy `bio-plane/test/m/reading-pipeline/convert-tiers.test.mjs:193` [part] "were transcribed by the OCR member and merged into this document's ..." — part test copy
- testcopy `bio-plane/test/m/reading-pipeline/read.test.mjs:90` "content type declares no reader, so this document has no reading" — regex
- testcopy `bio-plane/test/m/reading-pipeline/text-units.test.mjs:431` [part] "tier 1 read essentially nothing" — part test copy
