# standards: the words check after the conversion (K3949)

Layer 5. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/standards/checks.mjs:77` "This proposal carries nobody. A proposal is labelled with who made ..."
- inline `bio-plane/src/standards/checks.mjs:78` "for could say nothing. Nothing was written."
- inline `bio-plane/src/standards/index.mjs:2391` "It is stored with no captured text, and cannot be adopted until a m..."
- inline `bio-plane/src/standards/index.mjs:2392` "names the captured passages that hold the standard's words (R9)."
- inline `bio-plane/src/standards/index.mjs:450` "extent}, a passage of a held capture you may see. Nothing was written."
- inline `bio-plane/src/standards/index.mjs:970` "'s {} is a held passage {passage: content id} or an enactment event"
