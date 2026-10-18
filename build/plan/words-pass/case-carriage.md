# case-carriage: the words check after the conversion (K3949)

Layer 8. 5 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/case-carriage/index.mjs:863` "area {} is not an object {rect, kind, reason?}"
- testcopy `bio-plane/test/m/case-carriage/archive.test.mjs:77` [part] "a file cut out of an archive"
- testcopy `bio-plane/test/m/case-carriage/documents.test.mjs:86` [part] "the original is unchanged"
- testcopy `bio-plane/test/m/case-carriage/marks.test.mjs:258` [part] "the original is unchanged" — part test copy
- testcopy `bio-plane/test/m/case-carriage/obscured.test.mjs:210` "nothing to obscure"
