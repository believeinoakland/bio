# local-facts: the words check after the conversion (K3949)

Layer 5. 5 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/local-facts/checks.mjs:24` "This rule isn't in the form a deadline or a legal fact takes: {erro..."
- testcopy `bio-plane/test/m/local-facts/rows.test.mjs:70` [part] "No local fact of the active jurisdiction profiles answers to that p..." — part test copy
- testcopy `bio-plane/test/m/local-facts/rows.test.mjs:71` [part] "A path names one profile's holiday year (of its office calendar or ..." — part test copy
- testcopy `bio-plane/test/m/local-facts/rows.test.mjs:72` [part] "time zone. Nothing was written."
- testcopy `bio-plane/test/m/local-facts/rules.test.mjs:237` "holds a key the view already holds" — regex
