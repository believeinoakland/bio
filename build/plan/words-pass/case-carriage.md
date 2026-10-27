# case-carriage: the words check after the conversion (K3949)

Layer 8. 5 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/case-carriage/index.mjs:863` "area {} is not an object {rect, kind, reason?}"
- testcopy `bio-plane/test/m/case-carriage/archive.test.mjs:77` [part] "a file cut out of an archive"
- testcopy `bio-plane/test/m/case-carriage/documents.test.mjs:86` [part] "the original is unchanged"
- testcopy `bio-plane/test/m/case-carriage/marks.test.mjs:258` [part] "the original is unchanged" — part test copy
- testcopy `bio-plane/test/m/case-carriage/obscured.test.mjs:210` "nothing to obscure"

## Plain findings (K3957)

12 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('case-carriage.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/case-carriage/index.mjs:785` "no photo you can see is held under that digest"
- plain `bio-plane/src/case-carriage/index.mjs:842` "no photo you can see is held under that digest"
- plain `bio-plane/src/case-carriage/index.mjs:854` "a mark is made by a member; an assistant's proposal of areas is not a mark"
- plain `bio-plane/src/case-carriage/index.mjs:857` "that capture is not an image"
- plain `bio-plane/src/case-carriage/index.mjs:859` "areas is not a list"
- plain `bio-plane/src/case-carriage/index.mjs:877` "no photo you can see is held under that digest"
- plain `bio-plane/src/case-carriage/index.mjs:889` "a mark is withdrawn by a member, never by an assistant or the daemon"
- plain `bio-plane/src/case-carriage/index.mjs:895` "no photo you can see is held under that digest"
- plain `bio-plane/src/case-carriage/index.mjs:905` "no mark of that number is on that photo"
- plain `bio-plane/src/case-carriage/index.mjs:968` "an area lies wholly outside the picture"
- plain `bio-plane/src/case-carriage/index.mjs:1190` "no provenance onReceipt to register the receipt listener with"
- plain `bio-plane/src/case-carriage/index.mjs:1257` "no evidence store is bound to read a member's document from and hold its copy in"
