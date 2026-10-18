# court-doctypes: the words check after the conversion (K3949)

Layer 1. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `court-doctypes/common.mjs:339` "; the row added under key {} is likely this row with a key field ed..."
- inline `court-doctypes/common.mjs:348` "; it is likely the row no longer listed under key {} with a key fie..."
