# docket: the words check after the conversion (K3949)

Layer 8. 5 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/docket/reads.test.mjs:458` [?] ops: docketdecline, docketfile, docketinvitation, ... (6 of 7 not the module's own)
- testcopy `bio-plane/test/m/docket/words.test.mjs:12` [part] "Your team has no name recorded yet, and a docket entry is never ano..." — part test copy
- testcopy `bio-plane/test/m/docket/words.test.mjs:13` [part] "first. Nothing was published." — part test copy
- testcopy `bio-plane/test/m/docket/words.test.mjs:14` [part] "Your team's Civicsmith holds no prepared docket entry from you with..." — part test copy
- testcopy `bio-plane/test/m/docket/words.test.mjs:15` [part] "than an hour ago, or the docket has moved since. Prepare it again a..." — part test copy
