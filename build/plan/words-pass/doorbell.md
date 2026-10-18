# doorbell: the words check after the conversion (K3949)

Layer 3. 10 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/doorbell/rows.test.mjs:44` [?] codes: EVIDENCE_NOT_HELD, NOT_THE_CAPTURING_ACTOR, ACCOUNT_NO_TEXT, ... (6 of 6 not the module's own)
- testcopy `bio-plane/test/m/doorbell/doorbell.test.mjs:223` [part] "The team can see how often its doorbell turns people away."
- testcopy `bio-plane/test/m/doorbell/doorbell.test.mjs:231` [part] "Your material was not received."
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:13` [part] "The team can see how often its doorbell turns people away."
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:17` [part] "A knocker secret this short could be guessed, letting someone else ..."
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:24` [part] "Your material was not received. This team's inbox is not taking any..." — part test copy
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:25` [part] "This team's inbox did not read what you sent, because the request i..."
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:27` [part] "This team's inbox has nothing to keep, because what you sent decode..."
- testcopy `bio-plane/test/m/doorbell/t35.test.mjs:52` [part] "The size this inbox will read is published beside this message." — part test copy
- testcopy `bio-plane/test/m/doorbell/t35.test.mjs:62` [part] "larger than this inbox stores. That is a fact about how this team h..." — part test copy
