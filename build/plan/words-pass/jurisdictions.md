# jurisdictions: the words check after the conversion (K3949)

Layer 1. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `jurisdictions/index.mjs:1143` "the list {} and"
- inline `jurisdictions/index.mjs:1317` "within is {amount, units}, units one of {}"
- inline `jurisdictions/index.mjs:704` "an amount is {amount, units}, a positive integer of one of {}"
- inline `jurisdictions/index.mjs:847` "a template is {{}}, never bare text"
- inline `jurisdictions/index.mjs:894` "sources lists at least one public source {citation}"
- inline `jurisdictions/index.mjs:897` "a source is {citation}, non-empty"
