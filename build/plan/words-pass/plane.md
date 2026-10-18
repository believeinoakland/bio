# plane: the words check after the conversion (K3949)

Layer 11. 9 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/plane/accepted.test.mjs:154` [?] ops: caseimport, importedcases, importedcase, ... (10 of 10 not the module's own) — handlist
- handlist `bio-plane/test/m/plane/compose.test.mjs:84` [?] ops: factconfirm, factstatus, factsdue, ... (8 of 8 not the module's own) — handlist
- handlist `bio-plane/test/m/plane/docket.test.mjs:106` [?] ops: docketfile, docketpressure, docket, ... (7 of 7 not the module's own) — handlist
- handlist `bio-plane/test/m/plane/t46.test.mjs:385` [?] ops: escalationstoppursuing, escalationreopen, statusreportassist, ... (7 of 7 not the module's own) — handlist
- handlist `bio-plane/test/m/plane/t47.test.mjs:97` [?] ops: projectlist, projectquestions, drawquestion, ... (15 of 15 not the module's own) — handlist
- handlist `bio-plane/test/m/plane/t48.test.mjs:419` [?] ops: actionreplyquoting, filingread, pressurefor, ... (8 of 8 not the module's own) — handlist
- handlist `bio-plane/test/m/plane/t50.test.mjs:323` [?] ops: translationdraft, translationgrant, translationadopt, ... (8 of 9 not the module's own) — handlist
- testcopy `bio-plane/test/m/plane/disclosures.test.mjs:157` [part] "the original is unchanged" — part test copy
- testcopy `bio-plane/test/m/plane/t39.test.mjs:98` [part] "the original is unchanged" — part test copy
