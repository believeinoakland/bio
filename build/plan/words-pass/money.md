# money: the words check after the conversion (K3949)

Layer 5. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/money/index.mjs:1118` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- inline `bio-plane/src/money/index.mjs:351` "the party {} is {entity?, fund?, account?, as_written}"
- inline `bio-plane/src/money/index.mjs:477` "a source is {capture_sha, extent}, {content_id} or {fact}"
- inline `bio-plane/src/money/index.mjs:716` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- inline `bio-plane/src/money/index.mjs:790` [copy] "phase or stage"
- inline `bio-plane/src/money/index.mjs:966` [copy] "more than one"
