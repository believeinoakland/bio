# acquisition: the words check after the conversion (K3949)

Layer 3. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/acquisition/index.mjs:1178` "; {}, so they are not asserted to be the whole page"
- testcopy `bio-plane/test/m/acquisition/acquire.test.mjs:415` [part] "a continuation files no new document"
- testcopy `bio-plane/test/m/acquisition/memento-at.test.mjs:50` "); it is not the page at" — partial test copy (template not matched to a row)
