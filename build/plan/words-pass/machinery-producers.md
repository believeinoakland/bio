# machinery-producers: the words check after the conversion (K3949)

Layer 11. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/machinery-producers/index.mjs:566` "authors the document again."
- testcopy `bio-plane/test/m/machinery-producers/invariants.test.mjs:210` [part] "no time zone is held for it by your team's Civicsmith, so the local..." — part test copy
- testcopy `bio-plane/test/m/machinery-producers/invariants.test.mjs:211` [part] "counted from is undetermined; it is never counted on the UTC day" — part test copy
