# events: the words check after the conversion (K3949)

Layer 5. 5 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/events/index.mjs:445` "an attestation is {datedFactId}, {captureSha, extent} or {testimony}"
- inline `bio-plane/src/events/index.mjs:483` "an attestation is {datedFactId}, {captureSha, extent} or {testimony}"
- inline `bio-plane/src/events/recorded.mjs:36` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- inline `bio-plane/src/events/uses.mjs:39` "{} is a provision key {standard, portion?}: each a non-blank string..." — text holds braces (ICU syntax in t)
- inline `bio-plane/src/events/uses.mjs:44` "{} is a passage of a captured document: {captureSha, extent}" — text holds braces (ICU syntax in t)
