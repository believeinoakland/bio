# reevaluation: the words check after the conversion (K3949)

Layer 7. 7 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/reevaluation/index.mjs:2864` "case {}'s cited part {}"
- inline `bio-plane/src/reevaluation/index.mjs:289` "The entry's signing key is not among the keys the imported case fil..."
- inline `bio-plane/src/reevaluation/index.mjs:289` "The publisher has since taken this entry back (entry {}"
- inline `bio-plane/src/reevaluation/index.mjs:290` "{}); the cause still stands."
- testcopy `bio-plane/test/m/reevaluation/attribution.test.mjs:206` "the member attesting capture" — regex
- testcopy `bio-plane/test/m/reevaluation/checks.test.mjs:109` [part] "Only a named member can move a reference to a newer version of a do..." — part test copy
- testcopy `bio-plane/test/m/reevaluation/checks.test.mjs:110` [part] "the record's own machine credentials may say a newer version exists..." — part test copy
