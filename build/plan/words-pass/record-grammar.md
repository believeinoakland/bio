# record-grammar: the words check after the conversion (K3949)

Layer 1. 9 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/record-grammar/bundle.mjs:194` "schema stamp '{}' is not of the form <type>@<n>"
- testcopy `bio-plane/test/m/record-grammar/labels.test.mjs:284` [part] "This asks the record to stand behind something without saying what ..." — part test copy
- testcopy `bio-plane/test/m/record-grammar/labels.test.mjs:285` [part] "what the question is grounded in, what you personally observed, or ..." — part test copy
- testcopy `bio-plane/test/m/record-grammar/labels.test.mjs:286` [part] "carries it beside the claim, in your name, so a later reader can go..." — part test copy
- testcopy `bio-plane/test/m/record-grammar/labels.test.mjs:287` [part] "nothing supports it yet, write that down rather than inventing some..." — part test copy
- testcopy `bio-plane/test/m/record-grammar/labels.test.mjs:288` [part] "empty basis reads as one nobody checked." — part test copy
- testcopy `bio-plane/test/m/record-grammar/labels.test.mjs:289` [part] "A citation is the address of something somebody who was not here ca..." — part test copy
- testcopy `bio-plane/test/m/record-grammar/labels.test.mjs:290` [part] "have written can only be checked by you, and the record would be cl..." — part test copy
- testcopy `bio-plane/test/m/record-grammar/labels.test.mjs:291` [part] "published or held — if it is not public, say who holds it and how i..." — part test copy
