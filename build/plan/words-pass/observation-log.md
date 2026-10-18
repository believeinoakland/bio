# observation-log: the words check after the conversion (K3949)

Layer 5. 7 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/observation-log/index.mjs:459` "the per-capture UNIT bound, {} units"
- inline `bio-plane/src/observation-log/index.mjs:464` "the per-capture text bound, {} B"
- inline `bio-plane/src/observation-log/index.mjs:477` "; {} unit(s) stored to the per-unit cap and flagged truncated"
- inline `bio-plane/src/observation-log/index.mjs:479` "; {} unit(s) offered an address this record could not index"
- inline `bio-plane/src/observation-log/index.mjs:834` "and {} B of locator"
- inline `bio-plane/src/observation-log/index.mjs:973` "the {} the look found is what a leg can cite"
- inline `bio-plane/src/observation-log/vocabulary.mjs:1156` [table] "; the reading carries {} reference(s) and does not say it found"
