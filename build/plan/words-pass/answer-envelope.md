# answer-envelope: the words check after the conversion (K3949)

Layer 11. 1 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/answer-envelope/families.test.mjs:205` [?] codes: CAPTURE_HELD_IN_PARTS, ROUTE_MARK_NO_AUTHOR, ROUTE_MARK_NO_BUNDLE, ... (5 of 5 not the module's own) — handlist

## Test copies of code sentences (K3962)

4 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/answer-envelope/catalogue-end.test.mjs:84` "\"docs/development/ux-substrate/screens/words.json\""
- testcopy `bio-plane/test/m/answer-envelope/envelope.test.mjs:290` "\"requires sha256=<64 lowercase hex>\""
- testcopy `bio-plane/test/m/answer-envelope/envelope.test.mjs:292` "\"requires sha256=<64 lowercase hex>\""
- testcopy `bio-plane/test/m/answer-envelope/families.test.mjs:263` "\"docs/development/ux-substrate/screens/words.json\""
