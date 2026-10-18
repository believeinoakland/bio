# screens-action: the words check after the conversion (K3949)

Layer 11. 4 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/screens-action/contract.test.mjs:127` [part] "no live compliant determination" — part test copy
- testcopy `bio-plane/test/m/screens-action/page.mjs:158` [part] "the record holds no value for this blank: the member fills it in" — part test copy
- testcopy `bio-plane/test/m/screens-action/page.mjs:196` [part] "no live compliant determination" — part test copy
- testcopy `bio-plane/test/m/screens-action/start-send.test.mjs:149` [part] "the record holds no value for this blank: the member fills it in" — part test copy
