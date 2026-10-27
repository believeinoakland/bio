# run-productions: the words check after the conversion (K3949)

Layer 6. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/run-productions/index.mjs:813` [copy] "an identifier the two share"
- inline `bio-plane/src/run-productions/index.mjs:813` [copy] "the source's own link"

## Plain findings (K3957)

5 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('run-productions.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/run-productions/index.mjs:84` "never from the machine's say-so"
- plain `bio-plane/src/run-productions/index.mjs:88` "is not the document's content and is never cited as evidence"
- plain `bio-plane/src/run-productions/index.mjs:633` "resumes it and checks it plane-side. A production outside one would be a second place a..."
- plain `bio-plane/src/run-productions/index.mjs:640` "help; it may not start one"
- plain `bio-plane/src/run-productions/index.mjs:816` "established cannot be read from the record. A letter would be the machine's say-so"
