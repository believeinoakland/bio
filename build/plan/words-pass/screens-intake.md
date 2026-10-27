# screens-intake: the words check after the conversion (K3949)

Layer 11. 4 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/screens-intake/capture.test.mjs:68` [?] codes: BAD_LOCATOR, SOURCE_REFUSED, FETCH_FAILED, ... (5 of 5 not the module's own) — handlist
- handlist `bio-plane/test/m/screens-intake/common.test.mjs:149` [?] ops: threatof, originalstate, verdictnotes, ... (8 of 9 not the module's own) — handlist
- testcopy `bio-plane/test/m/screens-intake/held.test.mjs:17` [part] "Captured for a question you may not see" — part test copy
- testcopy `bio-plane/test/m/screens-intake/open-file.test.mjs:14` "It contains a macro." — drawn module: its L11 job
