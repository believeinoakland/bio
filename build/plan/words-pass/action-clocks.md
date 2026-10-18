# action-clocks: the words check after the conversion (K3949)

Layer 9. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/action-clocks/count.mjs:178` [copy] "never confirmed here"
- inline `bio-plane/src/action-clocks/count.mjs:178` [copy] "no source stated"
- inline `bio-plane/src/action-clocks/count.mjs:179` "corrected locally by {}, {}"
- inline `bio-plane/src/action-clocks/count.mjs:286` [copy] "a malformed rule"
- inline `bio-plane/src/action-clocks/index.mjs:1443` [copy] "a later event"
- inline `bio-plane/src/action-clocks/index.mjs:1445` [copy] "the other side"
