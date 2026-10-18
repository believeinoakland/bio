# agent-model: the words check after the conversion (K3949)

Layer 6. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `agent-model/src/model.mjs:435` "condition is one of: {}."
- inline `agent-model/src/model.mjs:440` "records' own text. A document's words are searched with `passage:<w..."
- inline `agent-model/src/signin.mjs:132` "[result of {}{}: held; read it with"
