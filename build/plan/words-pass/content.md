# content: the words check after the conversion (K3949)

Layer 4. 14 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/content/seams.test.mjs:197` [?] ops: attesttext, contentcrop, contentmint, ... (7 of 8 not the module's own) — handlist
- inline `bio-plane/src/content/extent-core.mjs:723` [stitched] "this capture is {}, not an office container, so its own bytes hold ..."
- inline `bio-plane/src/content/extent-core.mjs:727` [copy] ". An image painted on a PDF page is addressed by its page and rect,..."
- inline `bio-plane/src/content/extent.mjs:313` ". The page is shown rotated {} degrees; a rect is measured on the u..."
- inline `bio-plane/src/content/extent.mjs:314` "MediaBox corners, not from the turned view"
- inline `bio-plane/src/content/index.mjs:1343` "this row cites an image that is a member of a container ({part}), w..."
- inline `bio-plane/src/content/index.mjs:1408` [copy] "is an office container: its own bytes hold its embedded media parts"
- inline `bio-plane/src/content/index.mjs:1409` [copy] "is not an office container: its own bytes hold no embedded media part"
- inline `bio-plane/src/content/index.mjs:378` "a region of page {}"
- inline `bio-plane/src/content/index.mjs:378` [copy] "the whole document"
- inline `bio-plane/src/content/index.mjs:558` "under the capture the leg names ({}…)"
- inline `bio-plane/src/content/index.mjs:974` ". This exact typing by {} was already recorded, and is found rather..."
- testcopy `bio-plane/test/m/content/seams.test.mjs:143` [part] "registered once, at start" — part test copy
- testcopy `bio-plane/test/m/content/words.test.mjs:45` [part] "transcription axis is undetermined — stated, and never resolved int..." — part test copy
