# link-sweep: the words check after the conversion (K3949)

Layer 10. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/link-sweep/checks.mjs:123` "must be {per_run, backlog}: per_run an integer {}, backlog an integ..."
- inline `bio-plane/src/link-sweep/sweep.mjs:305` [copy] "the daemon is paused" — compared as a value (not shown)
- inline `bio-plane/src/link-sweep/sweep.mjs:528` [copy] "no reason given"
