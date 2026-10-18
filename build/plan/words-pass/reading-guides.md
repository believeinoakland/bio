# reading-guides: the words check after the conversion (K3949)

Layer 6. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/reading-guides/procedure.test.mjs:125` "Ask the assistant"
- testcopy `bio-plane/test/m/reading-guides/reads.test.mjs:116` "Ask the assistant" — ambiguous: 2 rows share this en (question.askassistant, act.airunopen.label.question)
- testcopy `bio-plane/test/m/reading-guides/t46-words.test.mjs:32` "Nothing was written." — test copy not matched to a row

## Test copies of code sentences (K3962)

2 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/reading-guides/t46-words.test.mjs:33` "\"legal information, not legal advice\""
- testcopy `bio-plane/test/m/reading-guides/t46-words.test.mjs:151` "\"no team slug is recorded, so an offer cannot be labeled. Nothing wa...\""
