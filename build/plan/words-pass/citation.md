# citation: the words check after the conversion (K3949)

Layer 6. 1 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/citation/index.mjs:780` "Trigger: a part of {} found by search in capture {}"

## Test copies of code sentences (K3962)

3 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/citation/cite-write.test.mjs:123` "\"every member of the selection was already cited; nothing was written\""
- testcopy `bio-plane/test/m/citation/found.test.mjs:236` "\"citing onto a question needs the inquiry module's role vocabulary, ...\""
- testcopy `bio-plane/test/m/citation/found.test.mjs:237` "\"registry, and your team's Civicsmith was created without them, so n...\""
