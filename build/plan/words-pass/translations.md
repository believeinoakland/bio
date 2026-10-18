# translations: the words check after the conversion (K3949)

Layer 11. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/translations/module.test.mjs:66` [?] ops: interfacewords, translationadopt, translationconfirm, ... (8 of 9 not the module's own) — handlist
- inline `bio-plane/src/translations/index.mjs:142` "the member's language source is registered as a function, read({vie..."
