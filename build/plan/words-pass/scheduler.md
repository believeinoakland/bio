# scheduler: the words check after the conversion (K3949)

Layer 10. 1 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/scheduler/files.test.mjs:162` [?] codes: SCANNER_ABSENT, RENDERER_ABSENT, DEEPER_CHECKS_UNREADABLE, ... (5 of 5 not the module's own) — handlist
