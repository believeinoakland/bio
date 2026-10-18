# screens-wizards: the words check after the conversion (K3949)

Layer 11. 7 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/screens-wizards/kit.mjs:114` [?] ops: whoami, interfacewords, groupidentity, ... (5 of 5 not the module's own) — handlist
- testcopy `bio-plane/test/m/screens-wizards/fixtures.mjs:23` "Get a record" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-wizards/guide.test.mjs:286` "Publication ceremony" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-wizards/library.test.mjs:161` "Get a record" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-wizards/page.test.mjs:129` "Welcome a new member" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-wizards/t48.test.mjs:11` "Get a record" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-wizards/t48.test.mjs:15` "Welcome a new member" — drawn module: its L11 job
