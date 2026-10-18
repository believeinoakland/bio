# investigation: the words check after the conversion (K3949)

Layer 7. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/investigation/checks.mjs:26` [copy] "Only a member does this, in their own words and by their own choice..."
- inline `bio-plane/src/investigation/checks.mjs:56` [copy] "This proposal was already taken up or set aside. Nothing was written."
- inline `bio-plane/src/investigation/index.mjs:626` [copy] "a claim that cannot be read"
