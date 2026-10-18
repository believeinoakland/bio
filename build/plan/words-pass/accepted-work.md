# accepted-work: the words check after the conversion (K3949)

Layer 6. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/accepted-work/invariants.test.mjs:40` [part] "This finding rests on another team's finding that this team has not..." — part test copy
- testcopy `bio-plane/test/m/accepted-work/invariants.test.mjs:41` [part] "first, or take the leg out. Nothing was written."
