# ooxml: the words check after the conversion (K3949)

Layer 1. 8 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/ooxml.mjs:773` "declared-content-type:{} (not used for the determination)"
- inline `bio-plane/src/ooxml.mjs:834` "part:{} parsed ({} defaults, {} overrides)"
- inline `bio-plane/src/ooxml.mjs:854` "ct:{} declared for {}, but the part is ABSENT"
- inline `bio-plane/src/ooxml.mjs:927` "odf:{} present but NOT the first archive member"
- inline `bio-plane/src/ooxml.mjs:929` "local-header offset {}, earliest {})"
- inline `bio-plane/src/ooxml.mjs:933` "odf:{} is first but COMPRESSED (method {}, ODF requires stored)"
- inline `bio-plane/src/ooxml.mjs:965` "odf:{} {} (first member, stored)"
- inline `bio-plane/src/ooxml.mjs:978` "odf:mimetype declares {}, but {} is ABSENT"
