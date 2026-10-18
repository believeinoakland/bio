# leg-earning: the words check after the conversion (K3949)

Layer 6. 9 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/leg-earning/index.mjs:759` "{}, and the bytes as your team's Civicsmith fetched them would be w..."
- inline `bio-plane/src/leg-earning/index.mjs:760` "{} — but this document's TEXT was derived by a machine and that"
- inline `bio-plane/src/leg-earning/index.mjs:761` "derivation is measured at {}. The capture axis is bounded by the we..."
- inline `bio-plane/src/leg-earning/index.mjs:767` "capture grade this document can earn is {}. Transcription never RAI..."
- inline `bio-plane/src/leg-earning/index.mjs:768` "grade, and it is not a separate measurement a member can cite instead."
- testcopy `bio-plane/test/m/leg-earning/words.test.mjs:14` "is not reachable on the capture axis at all: it needs a chain-of-cu..." — partial test copy (template not matched to a row)
- testcopy `bio-plane/test/m/leg-earning/words.test.mjs:30` "— the bytes as your team's Civicsmith fetched them, hashed at receipt." — partial test copy (template not matched to a row)
- testcopy `bio-plane/test/m/leg-earning/words.test.mjs:38` "team's Civicsmith received them earns" — partial test copy (template not matched to a row)
- testcopy `bio-plane/test/m/leg-earning/words.test.mjs:39` [part] "stands one party further from the publisher than a direct fetch), s..." — part test copy

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('leg-earning.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/leg-earning/index.mjs:156` "writeBasis requires a bundle id"
- plain `bio-plane/src/leg-earning/index.mjs:715` "capture route — the bytes of this document were served by a route no ruling grades"
- plain `bio-plane/src/leg-earning/index.mjs:821` "until its accuracy is measured or a member checks it against the page"
