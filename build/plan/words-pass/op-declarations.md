# op-declarations: the words check after the conversion (K3949)

Layer 11. 5 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/op-declarations/index.mjs:2516` "runDetectors({budgetMs, cursor}) that the scheduler fires; no membe..."
- inline `bio-plane/src/op-declarations/index.mjs:2519` "`calls` beside `usage` since K1798, K1805, so an ask of N calls cou..."
- inline `bio-plane/src/op-declarations/index.mjs:2527` "bearer or the daemon, since a scan batch is no member's act."
- inline `bio-plane/src/op-declarations/index.mjs:2529` "wake) renders queued files after their capture, never inside the ca..."
- inline `bio-plane/src/op-declarations/index.mjs:2531` "wake, every few minutes while checks are queued or running) starts ..." — text holds braces (ICU syntax in t)
