# capture: the words check after the conversion (K3949)

Layer 3. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/d57selflink.test.mjs:136` [part] "its target is this very capture" — part test copy
- testcopy `bio-plane/test/m/capture/figures.test.mjs:54` [part] "nothing was created or changed" — part test copy
- testcopy `bio-plane/test/m/capture/t51.test.mjs:133` [part] "checked against the source" — part test copy
