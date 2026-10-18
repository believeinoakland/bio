# law-relations: the words check after the conversion (K3949)

Layer 5. 4 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/law-relations/index.mjs:300` "enactment event ({event: EVT-…, edge: start or end}). Nothing was w..."
- inline `bio-plane/src/law-relations/index.mjs:618` "; only the first {} court standards were read"
- inline `bio-plane/src/law-relations/index.mjs:662` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- inline `bio-plane/src/law-relations/index.mjs:672` [copy] "undetermined at the date asked"
