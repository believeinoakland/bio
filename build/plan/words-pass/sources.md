# sources: the words check after the conversion (K3949)

Layer 3. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/sources/invariants.test.mjs:105` [?] ops: knockerconsent, sourceconsent, sourceconsentwithdraw, ... (9 of 10 not the module's own)
- handlist `bio-plane/test/m/sources/keyed.test.mjs:145` [?] ops: sourceof, sourcedisclose, sourcelink, ... (9 of 9 not the module's own) — handlist
- testcopy `bio-plane/test/m/sources/disclose.test.mjs:119` "; not confirmed by the team"

## Test copies of code sentences (K3962)

2 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/sources/invariants.test.mjs:80` "\"That secret was not recognised, so nothing was recorded. Check it a...\""
- testcopy `bio-plane/test/m/sources/invariants.test.mjs:81` "\"Only a member, acting for themselves, can mark a result from a paid...\""
