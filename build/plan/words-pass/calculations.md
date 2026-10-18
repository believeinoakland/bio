# calculations: the words check after the conversion (K3949)

Layer 5. 8 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/calculations/application.mjs:390` [copy] "the body measured"
- inline `bio-plane/src/calculations/index.mjs:1542` [copy] "more than one entity"
- inline `bio-plane/src/calculations/index.mjs:342` "; its capture alone reads {}"
- inline `bio-plane/src/calculations/index.mjs:926` "the change is {standard} or {date: YYYY-MM-DD}. Nothing was written."
- inline `bio-plane/src/calculations/patterns.mjs:192` [copy] "a proceeding they arose in"
- inline `bio-plane/src/calculations/patterns.mjs:192` [copy] "an obligor office"
- testcopy `bio-plane/test/m/calculations/application.test.mjs:188` [part] "each reason listed with its count"
- testcopy `bio-plane/test/m/calculations/registrations.test.mjs:64` [part] "registered once, at start" — part test copy
