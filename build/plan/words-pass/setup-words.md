# setup-words: the words check after the conversion (K3949)

Layer 1.

## Test copies of code sentences (K3962)

2 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/setup-words/extraction.test.mjs:27` "\"docs/development/ux-substrate/screens/words.json\""
- testcopy `bio-plane/test/m/setup-words/word-list.test.mjs:18` "\"docs/development/ux-substrate/screens/words.json\""
