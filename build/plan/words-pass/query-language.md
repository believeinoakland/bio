# query-language: the words check after the conversion (K3949)

Layer 5. 7 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/query-language/converts.test.mjs:207` [part] "content:chain=does-not-apply" — part test copy
- testcopy `bio-plane/test/m/query-language/converts.test.mjs:208` [part] "content:chain=undetermined" — part test copy
- testcopy `bio-plane/test/m/query-language/grammar.test.mjs:204` [part] "content:cap=does-not-apply" — part test copy
- testcopy `bio-plane/test/m/query-language/grammar.test.mjs:205` [part] "content:chain=undetermined" — part test copy
- testcopy `bio-plane/test/m/query-language/grammar.test.mjs:206` [part] "content:chain=does-not-apply" — part test copy
- testcopy `bio-plane/test/m/query-language/grammar.test.mjs:271` [part] "read as its terms joined by AND" — part test copy
- testcopy `bio-plane/test/m/query-language/statements.test.mjs:140` "are not weighed separately" — partial test copy (template not matched to a row)
