# notice-producers: the words check after the conversion (K3949)

Layer 11. 5 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/notice-producers/index.mjs:748` [copy] "sign-in or recovery"
- inline `bio-plane/src/notice-producers/index.mjs:748` [copy] "sign-ins or recoveries"
- testcopy `bio-plane/test/m/notice-producers/duties.test.mjs:423` [part] "What starts the clock has no date in the record" — part test copy
- testcopy `bio-plane/test/m/notice-producers/duties.test.mjs:427` [part] "What starts the clock has no date in the record" — part test copy
- testcopy `bio-plane/test/m/notice-producers/read.test.mjs:57` [part] "The system found this while exploring the question."

## Test copies of code sentences (K3962)

5 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/notice-producers/duties.test.mjs:256` "\"possibly overdue: undetermined, because the due date is uncertain\""
- testcopy `bio-plane/test/m/notice-producers/duties.test.mjs:410` "\"possibly overdue: undetermined, because\""
- testcopy `bio-plane/test/m/notice-producers/files.test.mjs:195` "\"PRIVATE_MODE_NOT_HONOURED\""
- testcopy `bio-plane/test/m/notice-producers/read.test.mjs:49` "\"PRIVATE_MODE_NOT_HONOURED\""
- testcopy `bio-plane/test/m/notice-producers/security.test.mjs:139` "\"The security level of your team's Civicsmith has been High since\""
