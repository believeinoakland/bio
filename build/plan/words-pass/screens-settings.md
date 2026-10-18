# screens-settings: the words check after the conversion (K3949)

Layer 11. 5 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/screens-settings/account.test.mjs:25` keys: handle.changeable, handle.formerly, handle.refused.paused, ... (5 of 5 not the module's own) — handlist
- handlist `bio-plane/test/m/screens-settings/members.test.mjs:17` [?] ops: accountuses, ailimits, aiusage, ... (5 of 5 not the module's own) — handlist
- handlist `bio-plane/test/m/screens-settings/members.test.mjs:20` [?] ops: interfacewords, queue, infolevel, ... (7 of 10 not the module's own) — handlist
- handlist `bio-plane/test/m/screens-settings/teamai.test.mjs:16` [?] ops: accountusesset, aikeepaway, ailimitset, ... (6 of 6 not the module's own) — handlist
- handlist `bio-plane/test/m/screens-settings/teamai.test.mjs:91` [?] ops: aikeepawaystate, accountuses, ailimits, ... (6 of 6 not the module's own) — handlist

## Test copies of code sentences (K3962)

1 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/screens-settings/fixtures.mjs:282` "\"the organization's own servers\""
