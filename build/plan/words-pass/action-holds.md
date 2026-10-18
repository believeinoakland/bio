# action-holds: the words check after the conversion (K3949)

Layer 9. 1 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/action-holds/places.test.mjs:203` [?] codes: NO_SUCH_PROJECT, NO_SUCH_PROJECT, BAD_DATE, ... (5 of 9 not the module's own) — handlist

## Test copies of code sentences (K3962)

4 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/action-holds/t46.test.mjs:59` "\"A hold notice is recorded for a hold that is in\""
- testcopy `bio-plane/test/m/action-holds/t46.test.mjs:60` "\"place, and the hold at this place is not: none has been placed, or ...\""
- testcopy `bio-plane/test/m/action-holds/t46.test.mjs:61` "\"A litigation hold is placed at one place: an action, one\""
- testcopy `bio-plane/test/m/action-holds/t46.test.mjs:62` "\"entry of an action named by its position, or a project. This named ...\""
