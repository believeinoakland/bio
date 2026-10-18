# notice-producers: the words check after the conversion (K3949)

Layer 11. 5 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/notice-producers/index.mjs:748` [copy] "sign-in or recovery"
- inline `bio-plane/src/notice-producers/index.mjs:748` [copy] "sign-ins or recoveries"
- testcopy `bio-plane/test/m/notice-producers/duties.test.mjs:423` [part] "What starts the clock has no date in the record" — part test copy
- testcopy `bio-plane/test/m/notice-producers/duties.test.mjs:427` [part] "What starts the clock has no date in the record" — part test copy
- testcopy `bio-plane/test/m/notice-producers/read.test.mjs:57` [part] "The system found this while exploring the question."
