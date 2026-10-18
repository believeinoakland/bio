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

## Plain findings (K3957)

10 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('reading-pipeline.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/reading-pipeline/index.mjs:438` "produced could be re-run or calibrated later"
- plain `bio-plane/src/reading-pipeline/index.mjs:441` "transcription's ceiling is a measurement, never a default"
- plain `bio-plane/src/reading-pipeline/index.mjs:465` "it produced can be checked against the document"
- plain `bio-plane/src/reading-pipeline/index.mjs:607` "in your team's Civicsmith, so nothing is claimed about what it says"
- plain `bio-plane/src/reading-pipeline/index.mjs:1243` "your team's Civicsmith has no evidence store set up, so the capture's bytes cannot be read"
- plain `bio-plane/src/reading-pipeline/index.mjs:1286` "document was read as one undivided string, which names no part of a container to point at"
- plain `bio-plane/src/reading-pipeline/index.mjs:1291` "where in the document a reference was read cannot be said"
- plain `bio-plane/src/reading-pipeline/readingprov.mjs:177` "that differs is attributed to the document, not to a page"
- plain `bio-plane/src/reading-pipeline/readingprov.mjs:230` "the text carries no per-page grain, so which part of the document changed is not said"
- plain `bio-plane/src/reading-pipeline/readingprov.mjs:250` "how the pages were joined into the text the reader was handed"
