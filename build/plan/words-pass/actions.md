# actions: the words check after the conversion (K3949)

Layer 9. 8 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/actions/acts.test.mjs:51` [?] codes: MACHINE_CANNOT_CORRESPOND, BAD_DATE, CAPTURE_AND_TESTIMONY, ... (6 of 17 not the module's own)
- handlist `bio-plane/test/m/actions/acts.test.mjs:90` [?] codes: NO_LAWS, TOO_MANY_LAWS, BAD_LAW_LEVEL, ... (5 of 8 not the module's own)
- handlist `bio-plane/test/m/actions/t45.test.mjs:561` [?] codes: PRESSURE_MARKED, PRESSURE_NO_ENTRY, MACHINE_CANNOT_SET_HOLD, ... (9 of 10 not the module's own) — handlist
- handlist `bio-plane/test/m/actions/t48.test.mjs:42` [?] ops: actionmove, actionlaws, actionrisktier, ... (5 of 7 not the module's own) — handlist
- inline `bio-plane/src/actions/index.mjs:122` [copy] "No reply is owed: {reason}" — text holds a literal {name}, filled by its caller
- testcopy `bio-plane/test/m/actions/t11.test.mjs:133` [part] "no module answers an action's read here" — part test copy
- testcopy `bio-plane/test/m/actions/t11.test.mjs:134` [part] "no module answers an action's read here" — part test copy
- testcopy `bio-plane/test/m/actions/t50.test.mjs:104` [part] "this is not a hint either way." — part test copy
